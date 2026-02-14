const SCREEN_SHARE_EVENTS = {
    OPEN_TRACKER: 'open-tracker-window',
    CLOSE_TRACKER: 'close-tracker-window',
    STOP_SCREEN_SHARE: 'stop-screen-share',
    OPEN_PICKER: 'open-picker',
    DO_GDM: 'do-gdm'
};

const HISTORY_KEY = 'jitsi-room-history';
const MAX_HISTORY = 5;

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveToHistory(url) {
    let history = getHistory().filter(item => item !== url);
    history.unshift(url);
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    populateHistory();
}

function populateHistory() {
    const datalist = document.getElementById('room-history');
    if (!datalist) return;
    datalist.innerHTML = '';
    getHistory().forEach(url => {
        const option = document.createElement('option');
        option.value = url;
        datalist.appendChild(option);
    });
}

/**
 * Sets up screen sharing event handling using the exposed electronAPI.
 * This replaces the SDK's setupScreenSharingRender which requires direct
 * access to electron's ipcRenderer.
 *
 * @param {JitsiMeetExternalAPI} api - The Jitsi Meet iframe API object.
 */
function setupScreenSharing(api) {
    let isScreenSharing = false;

    function sendCloseTrackerEvent() {
        window.electronAPI.sendScreenSharingEvent({
            data: { name: SCREEN_SHARE_EVENTS.CLOSE_TRACKER }
        });
    }

    function onScreenSharingStatusChanged(event) {
        if (event.on) {
            isScreenSharing = true;
            window.electronAPI.sendScreenSharingEvent({
                data: { name: SCREEN_SHARE_EVENTS.OPEN_TRACKER }
            });
        } else {
            isScreenSharing = false;
            sendCloseTrackerEvent();
        }
    }

    function onRequestDesktopSources(request, callback) {
        const { options } = request;
        window.electronAPI.getDesktopSources(options)
            .then(sources => {
                sources.forEach(item => {
                    item.thumbnail.dataUrl = item.thumbnail.toDataURL();
                });
                callback({ sources });
            })
            .catch(error => callback({ error }));
    }

    function onScreenSharingEvent({ data }) {
        switch (data.name) {
            case SCREEN_SHARE_EVENTS.STOP_SCREEN_SHARE:
                if (isScreenSharing) {
                    api.executeCommand('toggleShareScreen');
                }
                break;
            case SCREEN_SHARE_EVENTS.OPEN_PICKER: {
                const { requestId } = data;
                api._openDesktopPicker().then(r => {
                    window.electronAPI.sendScreenSharingEvent({
                        data: {
                            name: SCREEN_SHARE_EVENTS.DO_GDM,
                            requestId,
                            ...r
                        }
                    });
                }).catch(error => {
                    console.warn('Desktop picker error:', error);
                    window.electronAPI.sendScreenSharingEvent({
                        data: {
                            name: SCREEN_SHARE_EVENTS.DO_GDM,
                            requestId,
                            source: null
                        }
                    });
                });
                break;
            }
            default:
                console.warn('Unhandled screen sharing event:', data);
        }
    }

    const listener = window.electronAPI.onScreenSharingEvent(onScreenSharingEvent);

    api.on('screenSharingStatusChanged', onScreenSharingStatusChanged);
    api.on('videoConferenceLeft', sendCloseTrackerEvent);
    api.on('_requestDesktopSources', onRequestDesktopSources);
    api.on('_willDispose', function onApiDispose() {
        window.electronAPI.removeScreenSharingEventListener(listener);
        sendCloseTrackerEvent();
        api.removeListener('screenSharingStatusChanged', onScreenSharingStatusChanged);
        api.removeListener('videoConferenceLeft', sendCloseTrackerEvent);
        api.removeListener('_requestDesktopSources', onRequestDesktopSources);
        api.removeListener('_willDispose', onApiDispose);
    });
}

// Populate history on load
populateHistory();

document.getElementById('go-button').addEventListener('click', loadJitsiMeet);
document.getElementById('jitsi-url').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        loadJitsiMeet();
    }
});

function loadJitsiMeet() {
    const url = document.getElementById('jitsi-url').value.trim();
    
    if (!url) {
        alert('Please enter a Jitsi Meet URL');
        return;
    }
    
    // Validate URL format and extract domain and room
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
            alert('URL must start with http:// or https://');
            return;
        }
    } catch (e) {
        alert('Invalid URL format');
        return;
    }
    
    const domain = parsedUrl.hostname;
    const roomName = parsedUrl.pathname.substring(1); // Remove leading slash
    
    if (!roomName) {
        alert('URL must include a room name');
        return;
    }

    // Save URL to history
    saveToHistory(url);
    
    const api = new JitsiMeetExternalAPI(domain, {
        roomName: roomName,
        parentNode: document.querySelector('#jitsi-container')
    });

    // Setup screen sharing for renderer process
    setupScreenSharing(api);

    // Hide welcome message and URL bar, show container in fullscreen
    const urlBar = document.getElementById('url-bar');
    const jitsiContainer = document.getElementById('jitsi-container');

    urlBar.classList.add('hidden');
    jitsiContainer.classList.add('fullscreen');

    // Handle conference close
    api.addListener('readyToClose', () => {
        urlBar.classList.remove('hidden');
        jitsiContainer.classList.remove('fullscreen');

        api.dispose();
    });
}
