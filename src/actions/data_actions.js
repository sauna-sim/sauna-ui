import {getApiUrl, getStoreItem} from "./local_store_actions";
import {setSectorFiles} from "../redux/slices/sectorFilesSlice";
import {axiosSaunaApi} from "./api_connection_handler";
import {store as reduxStore} from '../redux/store';
import { readTextFile } from "@tauri-apps/plugin-fs";

export async function loadSectorFile(filename) {
    const url = `${await getApiUrl()}/data/loadSectorFile`;
    return (await axiosSaunaApi.post(url, {
        fileName: filename
    })).data;
}

export async function getLoadedSectorFiles() {
    const url = `${await getApiUrl()}/data/loadedSectorFiles`;

    try {
        const sectorFiles = (await axiosSaunaApi.get(url)).data;

        reduxStore.dispatch(setSectorFiles(sectorFiles));

        return sectorFiles;
    } catch (e){
        console.error(e);

        reduxStore.dispatch(setSectorFiles([]));
        return [];
    }
}

export async function loadDFDFile(filename, uuid) {
    const url = `${await getApiUrl()}/data/loadDFDNavData`;
    return (await axiosSaunaApi.post(url, {
        fileName: filename,
        uuid: uuid
    })).data;
}