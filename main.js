import { app, BrowserWindow, desktopCapturer, session, Menu } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

let mainWindow = null;
let pendingUrl = null;

function protocolUrlToHttps(url) {
  if (url && url.startsWith('jitsi-meet://')) {
    return url.replace('jitsi-meet://', 'https://');
  }
  return null;
}

function applyProtocolUrl(url) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(
      `document.getElementById('jitsi-url').value = ${JSON.stringify(url)}; loadJitsiMeet();`
    );
  }
}

function handleProtocolUrl(url) {
  const httpsUrl = protocolUrlToHttps(url);
  if (!httpsUrl) return;

  if (mainWindow) {
    applyProtocolUrl(httpsUrl);
  } else {
    pendingUrl = httpsUrl;
  }
}

app.setAsDefaultProtocolClient('jitsi-meet');

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

function createWindow() {
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null);
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.once('did-finish-load', () => {
    if (pendingUrl) {
      applyProtocolUrl(pendingUrl);
      pendingUrl = null;
    }
  });
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

  const protocolArg = process.argv.find(arg => arg.startsWith('jitsi-meet://'));
  if (protocolArg) {
    pendingUrl = protocolUrlToHttps(protocolArg);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
