const {app, BrowserWindow, ipcMain, Notification} = require('electron');
const Store = require('electron-store');
const path = require('path');
const isDev = !app.isPackaged;

// Create Local Electron Store
const schema = {
    uiSettings: {
        type: "object",
        default: {
            apiHostName: "localhost",
            apiPort: 5000
        },
        properties: {
            apiHostName: {
                type: 'string',
                default: "localhost"
            },
            apiPort: {
                type: "number",
                default: 5000,
                minimum: 1,
                maximum: 100000
            }
        }
    }
};
const electronStore = new Store({schema});

if (isDev) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('./dist/index.html');
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0){
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit();
    }
});

ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = electronStore.get(val);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
    electronStore.set(key, val);
});