import {axiosSaunaApi} from "./api_connection_handler";
import {getApiUrl} from "./local_store_actions";

export async function getAircraftList(sessionId, withFms = false){
    const url = `${await getApiUrl()}/session/${sessionId}/aircraft/all/${!!withFms}`;
    return (await axiosSaunaApi.get(url)).data;
}

export async function pauseAircraft(sessionId, callsign){
    const url = `${await getApiUrl()}/session/${sessionId}/aircraft/${callsign}/pause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function unpauseAircraft(sessionId, callsign){
    const url = `${await getApiUrl()}/session/${sessionId}/aircraft/${callsign}/unpause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function removeAllAircraft(sessionId){
    const url = `${await getApiUrl()}/session/${sessionId}/aircraft/all`;
    return (await axiosSaunaApi.delete(url)).data;
}