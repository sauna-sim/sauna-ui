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
    mapWindow: {
        async open(){
            await ipcRenderer.invoke("electron-window-map-open");
        },
        async close(){
            await ipcRenderer.invoke("electron-window-map-close");
        }
    },
    electronDialog: {
        open(data){
            return ipcRenderer.sendSync("electron-open-file-dialog", data);
        }
    }
});