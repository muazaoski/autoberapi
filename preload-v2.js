const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadGroups: () => ipcRenderer.invoke('load-groups'),
  saveGroups: (data) => ipcRenderer.invoke('save-groups', data),
  runGroup: (config) => ipcRenderer.invoke('run-group', config),
  reloadSchedules: () => ipcRenderer.invoke('reload-schedules'),
  getSchedulerStatus: () => ipcRenderer.invoke('get-scheduler-status'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  onBotLog: (callback) => ipcRenderer.on('bot-log', (event, data) => callback(data)),
  onSchedulerStatus: (callback) => ipcRenderer.on('scheduler-status', (event, data) => callback(data))
});
