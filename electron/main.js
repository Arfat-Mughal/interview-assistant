const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let isVisible = true;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    }
  });

  // Make window hidden from screen capture/sharing
  mainWindow.setContentProtection(true);

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startURL);

  // Uncomment for development
  // if (isDev) {
  //   mainWindow.webContents.openDevTools({ mode: 'detach' });
  // }

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    toggleWindow();
  });

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    if (mainWindow) {
      mainWindow.webContents.send('clear-conversation');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function toggleWindow() {
  if (mainWindow) {
    if (isVisible) {
      mainWindow.hide();
      isVisible = false;
    } else {
      mainWindow.show();
      isVisible = true;
    }
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-api-key', () => {
  const apiKey = store.get('apiKey', '');
  return apiKey;
});

ipcMain.handle('set-api-key', (event, apiKey) => {
  store.set('apiKey', apiKey);
  return true;
});

ipcMain.handle('get-settings', () => {
  try {
    const settings = {
      apiKey: store.get('apiKey', ''),
      apiProvider: store.get('apiProvider', ''),
      modelName: store.get('modelName', '')
    };
    return settings;
  } catch (error) {
    return { apiKey: '', apiProvider: '', modelName: '' };
  }
});

ipcMain.handle('set-settings', (event, settings) => {
  try {
    store.set('apiKey', settings.apiKey || '');
    store.set('apiProvider', settings.apiProvider || '');
    store.set('modelName', settings.modelName || '');
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.hide();
    isVisible = false;
  }
});

ipcMain.handle('toggle-always-on-top', (event, shouldBeOnTop) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(shouldBeOnTop);
  }
});

ipcMain.handle('set-window-size', (event, { width, height }) => {
  if (mainWindow) {
    const currentBounds = mainWindow.getBounds();
    mainWindow.setBounds({ 
      ...currentBounds, 
      width: width || currentBounds.width,
      height: height || currentBounds.height
    });
  }
});