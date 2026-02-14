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
    window.electronAPI.setupScreenSharing(api);

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
