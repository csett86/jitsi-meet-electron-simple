const { app, BrowserWindow, desktopCapturer, Menu, session } = require('electron');
const { autoUpdater } = require("electron-updater");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null);
  }

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
