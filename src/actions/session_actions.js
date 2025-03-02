import {axiosSaunaApi} from "./api_connection_handler.js";
import {getApiUrl} from "./local_store_actions.js";
import {readTextFile} from "@tauri-apps/plugin-fs";

export async function createSession(sessionDetails) {
    const url = `${await getApiUrl()}/session/create`;
    return (await axiosSaunaApi.post(url, sessionDetails)).data;
}

export async function getSessionSettings(sessionId) {
    const url = `${await getApiUrl()}/session/${sessionId}/settings`;
    return (await axiosSaunaApi.get(url)).data;
}

export async function deleteSession(sessionId) {
    const url = `${await getApiUrl()}/session/${sessionId}`;
    return (await axiosSaunaApi.delete(url)).data;
}

export async function loadEuroscopeScenario(sessionId, filename) {
    const url = `${await getApiUrl()}/session/${sessionId}/loadScenario/euroScope`;

    return (await axiosSaunaApi.post(url, {
        fileName: filename,
    })).data;
}

export async function loadSaunaScenario(sessionId, filename) {
    const textFile = await readTextFile(filename);
    const scenario = JSON.parse(textFile);

    console.log(scenario);
    const url = `${await getApiUrl()}/session/${sessionId}/loadScenario/sauna`;

    return (await axiosSaunaApi.post(url, {
        scenario: scenario
    })).data;
}

export async function getSessionSimState(sessionId){
    const url = `${await getApiUrl()}/session/${sessionId}/simState`;
    return (await axiosSaunaApi.get(url)).data;
}

export async function pauseSession(sessionId){
    const url = `${await getApiUrl()}/session/${sessionId}/pause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function unpauseSession(sessionId){
    const url = `${await getApiUrl()}/session/${sessionId}/unpause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function setSessionSimRate(sessionId, simrate){
    const url = `${await getApiUrl()}/session/${sessionId}/simrate`;
    return (await axiosSaunaApi.post(url, {
        simRate: simrate,
        paused: true // This is currently useless
    })).data;
}