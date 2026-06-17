const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const db = require('./db')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, '..', 'laptop.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.maximize()
  mainWindow.show()
}

app.whenReady().then(async () => {
  await db.initDatabase()

  ipcMain.handle('db:getAll', () => db.getAllLaptops())
  ipcMain.handle('db:getById', (_e, id) => db.getLaptopById(id))
  ipcMain.handle('db:create', (_e, data) => db.createLaptop(data))
  ipcMain.handle('db:update', (_e, id, data) => db.updateLaptop(id, data))
  ipcMain.handle('db:delete', (_e, id) => db.deleteLaptop(id))
  ipcMain.handle('db:getStats', () => db.getStats())
  ipcMain.handle('pin:isSet', () => db.isPinSet())
  ipcMain.handle('pin:set', (_e, pin) => db.setPin(pin))
  ipcMain.handle('pin:verify', (_e, pin) => db.verifyPin(pin))
  ipcMain.handle('db:getSuggestions', () => db.getSuggestions())

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
