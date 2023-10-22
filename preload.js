const { ipcRenderer, contextBridge, ipcMain} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    electronStore: {
        get(key){
            return ipcRenderer.sendSync("electron-store-get", key);
        },
        set(property, val) {
            ipcRenderer.send("electron-store-set", property, val)
        }
    },
    electronDialog: {
        open(data){
            return ipcRenderer.sendSync("electron-open-file-dialog", data);
        }
    },
    electronFile: {
        async doesFileExist(filename){
            return await ipcRenderer.invoke("electron-file-exists", filename);
        },
        getUserDataPath(){
            return ipcRenderer.sendSync("electron-path-get", "userData");
        },
        async download(url, dir){
            return await ipcRenderer.invoke("download", {
                url: url,
                properties: {directory: dir, overwrite: true},
            });
        },
        async extract(zipfile, dir){
            return await ipcRenderer.invoke("electron-file-extract-zip", zipfile, dir);
        },
        async joinPaths(...paths){
            return await ipcRenderer.invoke("electron-path-join", ...paths);
        }
    }
});