
export async function getUiSettings(){
    return window.electron.electronStore.get("uiSettings");
}

export function saveUiSettings(uiSettings){
    window.electron.electronStore.set("uiSettings", uiSettings);
}