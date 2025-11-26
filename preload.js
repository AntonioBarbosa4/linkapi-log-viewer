const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// specific APIs without exposing the entire Node.js environment
contextBridge.exposeInMainWorld('electron', {
  getGlobal: (name) => {
    if (name === 'arguments') {
      return global.arguments || {};
    }
    return undefined;
  }
});

contextBridge.exposeInMainWorld('node', {
  fs: {
    readFileSync: (path, encoding) => fs.readFileSync(path, encoding),
    writeFileSync: (path, data, options) => fs.writeFileSync(path, data, options),
    existsSync: (path) => fs.existsSync(path),
    readFile: (path, callback) => fs.readFile(path, callback),
    writeFile: (path, data, callback) => fs.writeFile(path, data, callback),
    readdir: (path, callback) => fs.readdir(path, callback),
    readdirSync: (path) => fs.readdirSync(path),
    statSync: (path) => fs.statSync(path),
    stat: (path, callback) => fs.stat(path, callback),
    watch: (path, options, listener) => fs.watch(path, options, listener),
    createReadStream: (path, options) => fs.createReadStream(path, options),
    // Expose promises API
    promises: {
      readFile: (path, encoding) => fs.promises.readFile(path, encoding),
      writeFile: (path, data, options) => fs.promises.writeFile(path, data, options),
      readdir: (path, options) => fs.promises.readdir(path, options),
      stat: (path) => fs.promises.stat(path)
    }
  },
  path: {
    join: (...args) => path.join(...args),
    dirname: (p) => path.dirname(p),
    basename: (p, ext) => path.basename(p, ext),
    extname: (p) => path.extname(p),
    resolve: (...args) => path.resolve(...args),
    sep: path.sep
  }
});

// Expose electron-store via IPC
contextBridge.exposeInMainWorld('store', {
  get: (key, defaultValue) => ipcRenderer.invoke('store-get', key, defaultValue),
  set: (key, value) => ipcRenderer.invoke('store-set', key, value),
  delete: (key) => ipcRenderer.invoke('store-delete', key),
  clear: () => ipcRenderer.invoke('store-clear')
});

// Expose dialog via IPC
contextBridge.exposeInMainWorld('dialog', {
  openFile: (options) => ipcRenderer.invoke('dialog-open-file', options)
});
