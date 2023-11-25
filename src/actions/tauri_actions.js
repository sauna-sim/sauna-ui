import axios from "axios";
import {createDir, writeBinaryFile} from "@tauri-apps/api/fs";
import {invoke} from "@tauri-apps/api";

export async function downloadFileFromUrl(url, location){
    // Create directory
    await createDir(location, {recursive: true});
    const response = axios.get(url, {
        responseType: "blob"
    });

    // Get filename
    let headerLine = response.headers['Content-Disposition'];
    let startFileNameIndex = headerLine.indexOf('"') + 1
    let endFileNameIndex = headerLine.lastIndexOf('"');
    let filename = headerLine.substring(startFileNameIndex, endFileNameIndex);

    // Save file
    await writeBinaryFile(filename, response.data, {dir: location});
    return filename;
}

export async function extractZipFile(zipfile, dir){
    // Invoke Rust command
    return await invoke('extract_zip', {
        dir: dir,
        zip_file_name: zipfile
    });
}