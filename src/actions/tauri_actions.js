import {createDir} from "@tauri-apps/api/fs";
import {invoke} from "@tauri-apps/api";
import {getAll, WebviewWindow} from "@tauri-apps/api/window";
import {storeSave} from "./local_store_actions";
import {listen} from "@tauri-apps/api/event";
import {store as reduxStore} from "../redux/store";
import {onBuiltInChange} from "../redux/slices/apiSlice";

import {save} from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";

export async function saveAircraftScenarioFile({fileHandle, setFileHandle, aircrafts}) {
    try{
        if(fileHandle) {
            console.log(`File saved to: ${fileHandle}`);
            await writeTextFile(fileHandle, JSON.stringify(aircrafts, null, 2));
        }
        else {
            const filePath = await save({
                title: "Save Aircraft Scenario File",
                defaultPath: "aircraft_scenario.json"
            });

            if(filePath) {
                setFileHandle(filePath);
                await writeTextFile(filePath, JSON.stringify(aircrafts, null, 2));
                console.log(`File saved to: ${filePath}`);
            }
            else {
                console.log("Save operation was canceled");
            }
        }
    } catch (error) {
        console.error("Error saving file: ", error);
    }
}

//Create new window method tauri
export async function createSaunaScenarioMakerWindow() {
    new WebviewWindow("createStripWindowLabel", {
        url: "#sauna_scenario_maker",
        fullscreen: false,
        height: 600,
        resizable: true,
        title: "Create Scenario Window",
        width: 1000,
        minimizable: true,
        maximized: false,
    });
}

// Register window close event for main window
const webview = new WebviewWindow("main");
webview.once("tauri://close-requested", async function (e) {
    await storeSave();
    for (const window of getAll()){
        await window.close();
    }
});

// Listen to sauna api builtin events
updateSaunaApiBuiltIn().then(() => {})
listen("sauna-api-builtin", (event) => {
    reduxStore.dispatch(onBuiltInChange(event.payload));
    console.log(event);
}).then(() => {});

export async function updateSaunaApiBuiltIn(){
    const builtIn = await invoke('get_sauna_api_builtin', {});
    reduxStore.dispatch(onBuiltInChange(builtIn));
}

export async function getSaunaApiConnectionDetails(){
    return await invoke("get_sauna_api_conn_details", {});
}

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

