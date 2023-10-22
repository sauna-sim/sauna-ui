const {app, BrowserWindow, ipcMain, dialog, shell} = require('electron');
const fs = require('fs');
const Store = require('electron-store');
const {download} = require("electron-dl");
const path = require('path');
const extract = require('extract-zip')
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
            },

        }
    },
    navigraph: {
        type: "object",
        properties: {
            authenticated: {
                type: "boolean",
                default: false
            },
            refreshToken: {
                type: "string",
                default: ""
            },
            package: {
                type: "object",
                properties: {
                    cycle: {
                        type: "string",
                        default: ""
                    },
                    revision: {
                        type: "string",
                        default: ""
                    },
                    package_id: {
                        type: "string",
                        default: ""
                    },
                    filename: {
                        type: "string",
                        default: ""
                    }
                },
                default: {
                    cycle: "",
                    revision: "",
                    package_id: "",
                    filename: ""
                }
            }
        },
        default: {
            authenticated: false,
            refreshToken: "",
            package: {
                cycle: "",
                revision: "",
                package_id: "",
                filename: ""
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
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('./dist/index.html');
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('electron-app-path-get', async (event) => {
    event.returnValue = app.getAppPath();
});

ipcMain.on('electron-path-get', async (event, pathType) => {
    event.returnValue = app.getPath(pathType);
})

ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = electronStore.get(val);
});

ipcMain.on('electron-store-set', async (event, key, val) => {
    electronStore.set(key, val);
});

ipcMain.on('electron-open-file-dialog', async (event, data) => {
    event.returnValue = dialog.showOpenDialogSync(data);
});

ipcMain.handle('electron-file-exists', async (event, filename) => {
    return new Promise((resolve, reject) => {
        fs.access(filename, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
});

ipcMain.handle("download", async (event, info) => {
    const windows = BrowserWindow.getAllWindows();

    if (windows.length > 0) {
        const dl = await download(windows[0], info.url, info.properties);
        return dl.getSavePath();
    }
});

ipcMain.handle("electron-file-extract-zip", async (event, source, dir) => {
    let files = [];
    await extract(source, {
        dir: dir,
        onEntry: (entry, zipfile) => {
            files.push(entry.fileName);
            console.log(entry);
        }
    });

    return files;
});

ipcMain.handle("electron-path-join", async (event, ...paths) => {
    return path.join(...paths);
})