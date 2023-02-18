const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    electronStore: {
        get(key){
            return ipcRenderer.sendSync("electron-store-get", key);
        },
        set(property, val) {
            ipcRenderer.send("electron-store-set", property, val)
        }
    }
})