import axios from "axios";
import {createDir, writeBinaryFile} from "@tauri-apps/api/fs";
import {invoke} from "@tauri-apps/api";

export async function downloadFileFromUrl(url, location){
    // Create directory
    await createDir(location, {recursive: true});
    // Invoke Rust command
    return await invoke('download_file', {
        dir: location,
        url
    });
}

export async function extractZipFile(zipfile, dir){
    // Invoke Rust command
    return await invoke('extract_zip', {
        dir: dir,
        zipFileName: zipfile
    });
}