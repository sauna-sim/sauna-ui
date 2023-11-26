import {getApiUrl} from "./local_store_actions";
import axios from "axios";

export async function getFsdProtocolRevisions(){
    const url = `${await getApiUrl()}/enums/fsd/protocolRevisions`;
    console.log(url);
    try {
        return (await axios.get(url)).data;
    } catch (e){
        console.error(e);
        return [];
    }
}