
export function openElectronFileDialog(options){
    return window.electron.electronDialog.open(options);
}