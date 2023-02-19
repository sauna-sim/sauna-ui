import {getApiHostname, getApiPort, getApiUrl, getStoreItem} from "./local_store_actions";
import axios from "axios";

export async function getServerSettings(){
    const url = `${getApiUrl()}/data/settings`;
    return (await axios.get(url)).data;
}

export async function updateServerSettings(settings){
    const url = `${getApiUrl()}/data/settings`;
    return (await axios.post(url, settings)).data;
}

export async function loadMagneticFile(){
    const url = `${getApiUrl()}/data/loadMagneticFile`;
    return (await axios.post(url)).data;
}

export async function loadSectorFile(filename){
    const url = `${getApiUrl()}/data/loadSectorFile`;
    return (await axios.post(url, {
        fileName: filename
    })).data;
}

export async function loadEuroscopeScenario(filename){
    const url = `${getApiUrl()}/data/loadEuroscopeScenario`;
    return (await axios.post(url, {
        fileName: filename,
        cid: getStoreItem("settings.fsdConnection.networkId"),
        password: getStoreItem("settings.fsdConnection.password"),
        server: getStoreItem("settings.fsdConnection.hostname"),
        port: getStoreItem("settings.fsdConnection.port"),
        protocol: getStoreItem("settings.fsdConnection.protocol")
    })).data;
}