import {getApiUrl} from "./local_store_actions";
import axios from "axios";

export async function getFsdProtocolRevisions(){
    const url = `${getApiUrl()}/enums/fsd/protocolRevisions`;
    console.log(url);
    return (await axios.get(url)).data;
}