import {axiosSaunaApi} from "./api_connection_handler.js";
import {getApiUrl} from "./local_store_actions.js";

export async function createSession(sessionDetails) {
    const url = `${await getApiUrl()}/session/create`;
    return (await axiosSaunaApi.post(url, sessionDetails)).data;
}