const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getApiKey: () => {
    return ipcRenderer.invoke('get-api-key');
  },
  setApiKey: (apiKey) => {
    return ipcRenderer.invoke('set-api-key', apiKey);
  },
  getSettings: () => {
    return ipcRenderer.invoke('get-settings');
  },
  setSettings: (settings) => {
    return ipcRenderer.invoke('set-settings', settings);
  },
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  toggleAlwaysOnTop: (shouldBeOnTop) => ipcRenderer.invoke('toggle-always-on-top', shouldBeOnTop),
  setWindowSize: (dimensions) => ipcRenderer.invoke('set-window-size', dimensions),
  onClearConversation: (callback) => {
    ipcRenderer.on('clear-conversation', callback);
  }
});