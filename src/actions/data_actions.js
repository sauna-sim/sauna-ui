import { getApiUrl, getStoreItem } from "./local_store_actions";
import axios from "axios";
import {setSectorFiles} from "../redux/slices/sectorFilesSlice";

export async function getServerSettings() {
    const url = `${await getApiUrl()}/data/settings`;
    return (await axios.get(url)).data;
}

export async function updateServerSettings(settings) {
    const url = `${await getApiUrl()}/data/settings`;
    return (await axios.post(url, settings)).data;
}

export async function loadSectorFile(filename) {
    const url = `${await getApiUrl()}/data/loadSectorFile`;
    return (await axios.post(url, {
        fileName: filename
    })).data;
}

export function getLoadedSectorFiles() {
    return async function (dispatch){
        const url = `${await getApiUrl()}/data/loadedSectorFiles`;

        try {
            const sectorFiles = (await axios.get(url)).data;

            dispatch(setSectorFiles(sectorFiles));

            return sectorFiles;
        } catch (e){
            console.error(e);

            dispatch(setSectorFiles([]));
            return [];
        }
    }
}

export async function loadDFDFile(filename, uuid) {
    const url = `${await getApiUrl()}/data/loadDFDNavData`;
    return (await axios.post(url, {
        fileName: filename,
        uuid: uuid
    })).data;
}

export async function loadEuroscopeScenario(filename) {
    const url = `${await getApiUrl()}/data/loadEuroscopeScenario`;
    // Resend settings
    await updateServerSettings(await getStoreItem("settings.apiSettings"));
    return (await axios.post(url, {
        fileName: filename,
        cid: await getStoreItem("settings.fsdConnection.networkId"),
        password: await getStoreItem("settings.fsdConnection.password"),
        server: await getStoreItem("settings.fsdConnection.hostname"),
        port: await getStoreItem("settings.fsdConnection.port"),
        protocol: await getStoreItem("settings.fsdConnection.protocol")
    })).data;
}