import {getApiUrl} from "./local_store_actions";
import axios from "axios";

export async function getAircraftList(withFms = false){
    const url = `${getApiUrl()}/aircraft/getAll${withFms ? "WithFms": ""}`;
    return (await axios.get(url)).data;
}

export async function getSimState(){
    const url = `${getApiUrl()}/aircraft/all/simState`;
    return (await axios.get(url)).data;
}

export async function setSimState(newState){
    const url = `${getApiUrl()}/aircraft/all/simState`;
    return (await axios.post(url, newState)).data;
}

export async function setAircraftSimState(callsign, newState){
    const url = `${getApiUrl()}/aircraft/byCallsign/${callsign}/simState`;
    return (await axios.post(url, newState)).data;
}

export async function removeAllAircraft(){
    const url = `${getApiUrl()}/aircraft/all/remove`;
    return (await axios.delete(url)).data;
}