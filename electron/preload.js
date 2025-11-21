const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey) => ipcRenderer.invoke('set-api-key', apiKey),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  toggleAlwaysOnTop: (shouldBeOnTop) => ipcRenderer.invoke('toggle-always-on-top', shouldBeOnTop),
  setWindowSize: (dimensions) => ipcRenderer.invoke('set-window-size', dimensions),
  onClearConversation: (callback) => {
    ipcRenderer.on('clear-conversation', callback);
  }
});