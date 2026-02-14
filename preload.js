const { contextBridge, ipcRenderer } = require('electron');

const SCREEN_SHARE_EVENTS_CHANNEL = 'jitsi-screen-sharing-marker';
const SCREEN_SHARE_GET_SOURCES = 'jitsi-screen-sharing-get-sources';

contextBridge.exposeInMainWorld('electronAPI', {
    onScreenSharingEvent: (callback) => {
        const listener = (event, ...args) => callback(...args);
        ipcRenderer.on(SCREEN_SHARE_EVENTS_CHANNEL, listener);
        return listener;
    },
    removeScreenSharingEventListener: (listener) => {
        ipcRenderer.removeListener(SCREEN_SHARE_EVENTS_CHANNEL, listener);
    },
    sendScreenSharingEvent: (data) => {
        ipcRenderer.send(SCREEN_SHARE_EVENTS_CHANNEL, data);
    },
    getDesktopSources: (options) => {
        return ipcRenderer.invoke(SCREEN_SHARE_GET_SOURCES, options);
    }
});
