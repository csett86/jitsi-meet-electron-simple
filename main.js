const { app, BrowserWindow, desktopCapturer, session, Menu } = require('electron');
const { autoUpdater } = require("electron-updater");

let mainWindow;

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

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      if (sources.length === 0) {
        callback({});
        return;
      }
      callback({ video: sources[0] });
    }).catch(() => {
      callback({});
    });
  }, { useSystemPicker: true });

  autoUpdater.checkForUpdatesAndNotify();

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
