import {axiosSaunaApi} from "./api_connection_handler";
import {getApiUrl} from "./local_store_actions";

export async function getFsdProtocolRevisions(){
    const url = `${await getApiUrl()}/enums/fsd/protocolRevisions`;

    try {
        return (await axiosSaunaApi.get(url)).data;
    } catch (e){
        console.error(e);
        return [];
    }
}