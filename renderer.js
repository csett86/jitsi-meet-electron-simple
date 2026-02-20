const HISTORY_KEY = 'jitsi-room-history';
const MAX_HISTORY = 5;

const urlInput = document.getElementById('jitsi-url');
const urlBar = document.getElementById('url-bar');
const jitsiContainer = document.getElementById('jitsi-container');
const welcomeMessage = document.getElementById('welcome-message');
const roomHistory = document.getElementById('room-history');

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function saveToHistory(url) {
    const history = [url, ...getHistory().filter(item => item !== url)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    populateHistory();
}

function populateHistory() {
    if (!roomHistory) return;
    roomHistory.innerHTML = '';
    getHistory().forEach(url => {
        const option = document.createElement('option');
        option.value = url;
        roomHistory.appendChild(option);
    });
}

// Populate history on load
populateHistory();

urlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') loadJitsiMeet();
});
document.getElementById('go-button').addEventListener('click', loadJitsiMeet);

function loadJitsiMeet() {
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a Jitsi Meet URL');
        return;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
            alert('URL must start with http:// or https://');
            return;
        }
    } catch {
        alert('Invalid URL format');
        return;
    }

    const roomName = parsedUrl.pathname.substring(1);

    if (!roomName) {
        alert('URL must include a room name');
        return;
    }

    saveToHistory(url);

    const api = new JitsiMeetExternalAPI(parsedUrl.hostname, {
        roomName,
        parentNode: jitsiContainer
    });

    const originalMessage = welcomeMessage.innerText;
    urlBar.classList.add('hidden');
    jitsiContainer.classList.add('fullscreen');
    welcomeMessage.innerText = 'Loading...';

    api.addListener('readyToClose', () => {
        urlBar.classList.remove('hidden');
        jitsiContainer.classList.remove('fullscreen');
        welcomeMessage.innerText = originalMessage;
        api.dispose();
    });
}
