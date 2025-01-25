import {getApiUrl, getStoreItem} from "./local_store_actions";
import {setSectorFiles} from "../redux/slices/sectorFilesSlice";
import {axiosSaunaApi} from "./api_connection_handler";
import {store as reduxStore} from '../redux/store';

export async function getServerSettings() {
    const url = `${await getApiUrl()}/data/settings`;
    return (await axiosSaunaApi.get(url)).data;
}

export async function updateServerSettings(settings) {
    const url = `${await getApiUrl()}/data/settings`;
    return (await axiosSaunaApi.post(url, settings)).data;
}

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

export async function loadEuroscopeScenario(filename) {
    const url = `${await getApiUrl()}/data/loadEuroscopeScenario`;
    // Resend settings
    await updateServerSettings(await getStoreItem("settings.apiSettings"));
    return (await axiosSaunaApi.post(url, {
        fileName: filename,
        cid: await getStoreItem("settings.fsdConnection.networkId"),
        password: await getStoreItem("settings.fsdConnection.password"),
        server: await getStoreItem("settings.fsdConnection.hostname"),
        port: await getStoreItem("settings.fsdConnection.port"),
        protocol: await getStoreItem("settings.fsdConnection.protocol")
    })).data;
}