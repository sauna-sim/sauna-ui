
export function openElectronFileDialog(options){
    return window.electron.electronDialog.open(options);
}

export function getUserDataPath(){
    return window.electron.electronFile.getUserDataPath();
}

export async function downloadFileFromUrl(url, location){
    return await window.electron.electronFile.download(url, location);
}

export async function doesFileExist(filename){
    return await window.electron.electronFile.doesFileExist(filename);
}

export async function extractZipFile(zipfile, dir){
    return await window.electron.electronFile.extract(zipfile, dir);
}

export async function combinePath(...paths){
    return await window.electron.electronFile.joinPaths(...paths);
}