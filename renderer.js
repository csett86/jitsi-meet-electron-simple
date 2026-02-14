const { setupScreenSharingRender } = require('@jitsi/electron-sdk');
const JitsiMeetExternalAPI  = require('./external_api');

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
    
    const api = new JitsiMeetExternalAPI(domain, {
        roomName: roomName,
        parentNode: document.querySelector('#jitsi-container')
    });

    // Setup screen sharing for renderer process
    setupScreenSharingRender(api);

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
