
export function openElectronFileDialog(options){
    return window.electron.electronDialog.open(options);
}

export async function openMapWindow(){
    await window.electron.mapWindow.open();
}

export async function closeMapWindow(){
    await window.electron.mapWindow.close();
}