const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  runBot: (config) => ipcRenderer.invoke('run-bot', config),
  onBotLog: (callback) => ipcRenderer.on('bot-log', (event, data) => callback(data))
});
