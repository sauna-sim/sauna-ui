import {getApiUrl} from "./local_store_actions";
import axios from "axios";

export async function getAircraftList(withFms = false){
    const url = `${getApiUrl()}/aircraft/getAll${withFms ? "WithFms": ""}`;
    return (await axios.get(url)).data;
}

export async function pauseAllAircraft(){
    const url = `${getApiUrl()}/aircraft/all/pause`;
    return (await axios.post(url)).data;
}

export async function unpauseAllAircraft(){
    const url = `${getApiUrl()}/aircraft/all/unpause`;
    return (await axios.post(url)).data;
}

export async function removeAllAircraft(){
    const url = `${getApiUrl()}/aircraft/all/remove`;
    return (await axios.delete(url)).data;
}