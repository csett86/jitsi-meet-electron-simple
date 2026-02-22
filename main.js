import { app, BrowserWindow, desktopCapturer, session, Menu } from 'electron';
import pkg from 'electron-updater';
import path from 'node:path';
const { autoUpdater } = pkg;

let mainWindow;
let protocolUrl = null;

app.setAsDefaultProtocolClient('jitsi-meet');

/**
 * Convert a jitsi-meet:// URL to https://.
 * Returns the converted URL or null if the input is not a valid jitsi-meet:// URL.
 */
function convertProtocolUrl(url) {
  if (typeof url === 'string' && url.startsWith('jitsi-meet://')) {
    const converted = url.replace('jitsi-meet://', 'https://');
    try {
      new URL(converted);
      return converted;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Handle a jitsi-meet:// protocol URL by converting it and loading the conference.
 */
function handleProtocolUrl(url) {
  const converted = convertProtocolUrl(url);
  if (!converted) return;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.executeJavaScript(
      `document.getElementById('jitsi-url').value = ${JSON.stringify(converted)}; loadJitsiMeet();`
    );
  } else {
    protocolUrl = converted;
  }
}

// Check command line args for a protocol URL (Windows/Linux launch via protocol)
const protocolArg = process.argv.find(arg => arg.startsWith('jitsi-meet://'));
if (protocolArg) {
  protocolUrl = convertProtocolUrl(protocolArg);
}

// Enforce single instance so protocol links focus the existing window
// instead of opening a new one (Windows/Linux).
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Focus existing window when a second instance is launched.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Extract and handle the protocol URL from the command line.
    const url = commandLine.find(arg => arg.startsWith('jitsi-meet://'));
    if (url) {
      handleProtocolUrl(url);
    }
  });

  // macOS: handle open-url event
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleProtocolUrl(url);
  });

  function createWindow() {
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null);
    }

    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    mainWindow = win;

    win.webContents.on('did-finish-load', () => {
      if (protocolUrl) {
        win.webContents.executeJavaScript(
          `document.getElementById('jitsi-url').value = ${JSON.stringify(protocolUrl)}; loadJitsiMeet();`
        );
        protocolUrl = null;
      }
    });

    win.loadFile('index.html');
  }

  app.whenReady().then(() => {
    session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
        callback(sources.length > 0 ? { video: sources[0] } : {});
      } catch {
        callback({});
      }
    }, { useSystemPicker: true });

    autoUpdater.checkForUpdatesAndNotify();

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
