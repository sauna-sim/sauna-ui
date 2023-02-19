const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const Store = require('electron-store');
const path = require('path');
const isDev = !app.isPackaged;

// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();

// Create Local Electron Store
const schema = {
    settings: {
        type: "object",
        default: {
            apiServer: {
                hostName: "localhost",
                port: 5000
            },
            apiSettings: {
                posCalcRate: 100,
                commandFrequency: "199.998"
            },
            fsdConnection: {
                networkId: "",
                password: "",
                hostname: "",
                port: 6809,
                protocol: "Classic"
            }
        },
        properties: {
            apiServer: {
                type: "object",
                properties: {
                    hostName: {
                        type: 'string',
                        default: "localhost"
                    },
                    port: {
                        type: "number",
                        default: 5000,
                        minimum: 1,
                        maximum: 100000
                    }
                },
                default: {
                    hostName: "localhost",
                    port: 5000
                }
            },
            apiSettings: {
                type: "object",
                properties: {
                    posCalcRate: {
                        type: "number",
                        default: 100,
                        minimum: 10,
                        maximum: 1000
                    },
                    commandFrequency: {
                        type: "string",
                        default: "199.998"
                    }
                },
                default: {
                    posCalcRate: 100,
                    commandFrequency: "199.998"
                }
            },
            fsdConnection: {
                type: "object",
                properties: {
                    networkId: {
                        type: "string",
                        default: ""
                    },
                    password: {
                        type: "string",
                        default: ""
                    },
                    hostname: {
                        type: "string",
                        default: ""
                    },
                    port: {
                        type: "number",
                        default: 6809,
                        minimum: 1,
                        maximum: 100000
                    },
                    protocol: {
                        type: "string",
                        default: "Classic"
                    },
                },
                default: {
                    networkId: "",
                    password: "",
                    hostname: "",
                    port: 6809,
                    protocol: "Classic"
                }
            }
        }
    },
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
        autoHideMenuBar: true,
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

ipcMain.on('electron-open-file-dialog', async (event, data) => {
    event.returnValue = dialog.showOpenDialogSync(data);
});