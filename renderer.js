const { setupScreenSharingRender } = require('@jitsi/electron-sdk');

let api = null;

// Setup screen sharing for renderer process
setupScreenSharingRender();

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
    
    // Validate URL format
    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
            alert('URL must start with http:// or https://');
            return;
        }
    } catch (e) {
        alert('Invalid URL format');
        return;
    }
    
    // Extract domain and room from URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const roomName = parsedUrl.pathname.substring(1); // Remove leading slash
    
    if (!roomName) {
        alert('URL must include a room name');
        return;
    }
    
    // Hide welcome message and show container
    document.getElementById('welcome-message').style.display = 'none';
    document.getElementById('jitsi-container').style.display = 'block';
    
    // Clear existing conference if any
    if (api) {
        api.dispose();
    }
    
    // Initialize Jitsi Meet API
    const JitsiMeetExternalAPI = window.JitsiMeetExternalAPI || require('@jitsi/electron-sdk').JitsiMeetExternalAPI;
    
    api = new JitsiMeetExternalAPI(domain, {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true
        },
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ]
        }
    });
}
