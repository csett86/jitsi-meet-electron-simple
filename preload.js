const { contextBridge } = require('electron');
const { setupScreenSharingRender } = require('@jitsi/electron-sdk');

contextBridge.exposeInMainWorld('electronAPI', {
    setupScreenSharing: (api) => setupScreenSharingRender(api)
});
