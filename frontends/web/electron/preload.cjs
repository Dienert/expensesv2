const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    saveOfx: (name, buffer) => ipcRenderer.invoke('save-ofx', { name, buffer }),
    runUpdate: () => ipcRenderer.invoke('run-update-script'),
    clearData: () => ipcRenderer.invoke('clear-data'),
    getLocale: () => ipcRenderer.invoke('get-locale'),
});
