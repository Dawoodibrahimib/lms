const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAllLaptops: () => ipcRenderer.invoke('db:getAll'),
  getLaptopById: (id) => ipcRenderer.invoke('db:getById', id),
  createLaptop: (data) => ipcRenderer.invoke('db:create', data),
  updateLaptop: (id, data) => ipcRenderer.invoke('db:update', id, data),
  deleteLaptop: (id) => ipcRenderer.invoke('db:delete', id),
  getStats: () => ipcRenderer.invoke('db:getStats'),
  pinIsSet: () => ipcRenderer.invoke('pin:isSet'),
  pinSet: (pin) => ipcRenderer.invoke('pin:set', pin),
  pinVerify: (pin) => ipcRenderer.invoke('pin:verify', pin),
  getSuggestions: () => ipcRenderer.invoke('db:getSuggestions'),
})
