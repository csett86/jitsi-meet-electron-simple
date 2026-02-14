const { setupScreenSharingRender } = require('@jitsi/electron-sdk');

const JitsiMeetExternalAPI  = require('./external_api');

let api = null;

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
    
    // Hide welcome message and URL bar, show container in fullscreen
    document.getElementById('welcome-message').style.display = 'none';
    document.getElementById('url-bar').classList.add('hidden');
    document.getElementById('jitsi-container').classList.add('fullscreen');
    
    // Clear existing conference if any
    if (api) {
        api.dispose();
    }
    
    // Initialize Jitsi Meet API    
    api = new JitsiMeetExternalAPI(domain, {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container')
    });

    // Setup screen sharing for renderer process
    setupScreenSharingRender(api);

    // Handle conference close
    api.addListener('readyToClose', () => {
        api.dispose();
        api = null;
        const location = document.getElementById('jitsi-container');
        location.innerHTML = '';
        location.classList.remove('fullscreen');
        document.getElementById('url-bar').classList.remove('hidden');
        document.getElementById('welcome-message').style.display = '';
    });
}
