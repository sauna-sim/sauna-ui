import {invoke} from "@tauri-apps/api/core";
import {getAllWebviewWindows, WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {storeSave} from "./local_store_actions";
import {listen} from "@tauri-apps/api/event";
import {store as reduxStore} from "../redux/store";
import {onBuiltInChange} from "../redux/slices/apiSlice";
import {mkdir, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {save, open} from '@tauri-apps/plugin-dialog';


export async function openAircraftScenarioFile({setFileHandle}) {
    try {
        const fileHandle = await open({
            multiple: false,
            filters: [{
                name: "Aircraft Scenario Files",
                extensions: ["json"]
            }]
        });
        if (fileHandle) {
            const fileContent = await readTextFile(fileHandle);
            const parsedData = JSON.parse(fileContent);
            setFileHandle(fileHandle);
            return parsedData;
        } else {
            console.log("Open operation was canceled");
        }
    } catch (error) {
        console.error("Error opening file: ", error);
    }
}

export async function saveAircraftScenarioFile({fileHandle, setFileHandle, aircrafts}) {
    try {
        const dataToSave = {aircraft: aircrafts};
        if (fileHandle) {
            console.log(`File saved to: ${fileHandle}`);
            await writeTextFile(fileHandle, JSON.stringify(dataToSave, null, 2));
        } else {
            const filePath = await save({
                title: "Save Aircraft Scenario File",
                defaultPath: "aircraft_scenario.json"
            });

            if (filePath) {
                setFileHandle(filePath);
                await writeTextFile(filePath, JSON.stringify(dataToSave, null, 2));
                console.log(`File saved to: ${filePath}`);
            } else {
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
webview.onCloseRequested(async function (e) {
    await storeSave();
    for (const window of await getAllWebviewWindows()) {
        if (window.label !== "main") {
            try {
                await window.close();
            } finally {
                console.log(window.label);
            }
        } else {
            console.log("Main");
        }
    }
});

// Listen to sauna api builtin events
updateSaunaApiBuiltIn().then(() => {
})
listen("sauna-api-builtin", (event) => {
    reduxStore.dispatch(onBuiltInChange(event.payload));
}).then(() => {
});

export async function updateSaunaApiBuiltIn() {
    const builtIn = await invoke('get_sauna_api_builtin', {});
    reduxStore.dispatch(onBuiltInChange(builtIn));
}

export async function getSaunaApiConnectionDetails() {
    return await invoke("get_sauna_api_conn_details", {});
}

export async function downloadFileFromUrl(url, location) {
    // Create directory
    await mkdir(location, {recursive: true});
    // Invoke Rust command
    return await invoke('download_file', {
        dir: location,
        url
    });
}

export async function readTextFileLines(fileName) {
    return await invoke('read_text_file', {
        fileName: fileName
    });
}

export async function extractZipFile(zipfile, dir) {
    // Invoke Rust command
    return await invoke('extract_zip', {
        dir: dir,
        zipFileName: zipfile
    });
}

export const TauriWindowEnum = {
    MAP_PAGE: "mapPageLabel",
    COMMAND_WINDOW: "commandWindowLabel"
};

export async function createMapWindow() {
    new WebviewWindow(TauriWindowEnum.MAP_PAGE, {
        url: "#map",
        fullscreen: false,
        height: 600,
        resizable: true,
        title: "Sauna Map",
        width: 800,
        minHeight: 400,
        visible: true,
        minWidth: 400
    });
}

export async function createCommandWindow() {
    new WebviewWindow(TauriWindowEnum.COMMAND_WINDOW, {
        url: "#commands",
        fullscreen: false,
        height: 600,
        resizable: true,
        title: "Sauna Command Window",
        width: 300,
        minHeight: 200,
        minWidth: 200
    })
}