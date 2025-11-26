const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { program } = require('commander');
const path = require('path');

// electron-store will be loaded dynamically (it's ESM only)
let store;

// Load electron-store dynamically
async function initializeStore() {
  const Store = (await import('electron-store')).default;
  store = new Store();
}

if (process.env.NODE_ENV === 'development') {
	  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

// IPC handlers for storage
ipcMain.handle('store-get', async (event, key, defaultValue) => {
  if (!store) await initializeStore();
  return store.get(key, defaultValue);
});

ipcMain.handle('store-set', async (event, key, value) => {
  if (!store) await initializeStore();
  store.set(key, value);
});

ipcMain.handle('store-delete', async (event, key) => {
  if (!store) await initializeStore();
  store.delete(key);
});

ipcMain.handle('store-clear', async () => {
  if (!store) await initializeStore();
  store.clear();
});

// IPC handler for file dialog
ipcMain.handle('dialog-open-file', async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  parseArguments();

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile('./app/index.html');

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  require('./mainMenu');
}

app.on('ready', createWindow);

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function parseArguments() {
  program
    .version(require('./package').version, '-v, --version')
    .description('A multi-platform log viewer built with Electron and styled with Material Design')
    .option('-f, --file <file-path>', 'file to open')
    .parse();

  global.arguments = {};

  if (program.file) {
    global.arguments.file = program.file;
  }
}
