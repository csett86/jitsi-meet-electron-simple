const HISTORY_KEY = 'jitsi-room-history';
const MAX_HISTORY = 5;

const urlInput = document.getElementById('jitsi-url');
const urlBar = document.getElementById('url-bar');
const jitsiContainer = document.getElementById('jitsi-container');
const welcomeMessage = document.getElementById('welcome-message');
const roomHistory = document.getElementById('room-history');
const welcomeMessageText = "Enter a Jitsi Meet URL above to start a conference";
const loadingText = "Loading...";
let api;

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

const coerce = (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    const num = Number(value);

    return Number.isNaN(num) ? value : num;
};

const parseConfigParams = (params, prefix = "config") =>
    [...params]
        .filter(([key]) => key.startsWith(`${prefix}.`))
        .reduce((config, [key, value]) => {
        const path = key.slice(prefix.length + 1).split(".");
        const last = path.pop();

        const target = path.reduce((obj, segment) => {
            obj[segment] ??= {};

            return obj[segment];
        }, config);

        target[last] = coerce(value);

        return config;
        }, {});

urlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') loadJitsiMeet();
});
document.getElementById('go-button').addEventListener('click', loadJitsiMeet);

function loadJitsiMeet() {
    const url = urlInput.value.trim();

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('https')) {
            alert('URL must start with https://');
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

    const hashParameters = new URLSearchParams(parsedUrl.hash.substring(1));
    const configOverwrite = parseConfigParams(hashParameters, "config");

    let jwt;

    if (hashParameters.get("jwt")) {
        jwt = hashParameters.get("jwt").replace(/["]+/g, '');
    } else if (parsedUrl.searchParams.get("jwt")) {
        jwt = parsedUrl.searchParams.get("jwt");
    }

    const options = {
        configOverwrite,
        jwt,
        parentNode: jitsiContainer,
        roomName
    };

    saveToHistory(url);

    if(api) {
        api.dispose();
    }

    console.log("Launching conference with options: ", options);
    api = new JitsiMeetExternalAPI(parsedUrl.hostname, options);

    urlBar.classList.add('hidden');
    jitsiContainer.classList.add('fullscreen');
    welcomeMessage.innerText = loadingText;

    api.addListener('readyToClose', () => {
        urlBar.classList.remove('hidden');
        jitsiContainer.classList.remove('fullscreen');
        welcomeMessage.innerText = welcomeMessageText;
        api.dispose();
    });
}
