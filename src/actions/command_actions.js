import {getApiUrl} from "./local_store_actions.js";
import {axiosSaunaApi} from "./api_connection_handler.js";
import {store} from "../redux/store.js";
import {onMessageReceive} from "../redux/slices/messagesSlice.js";

export async function sendTextCommand(sessionId, callsign, commandText) {
    const url = `${await getApiUrl()}/session/${sessionId}/commands/send/textCommand`;

    const cmdSplit = commandText.split(' ');
    const commandName = cmdSplit.shift();

    // Log the command we sent
    store.dispatch(onMessageReceive({
        received: false,
        msg: `${callsign}, ${commandText}`
    }));

    // Send command
    return (await axiosSaunaApi.post(url, {
        callsign,
        command: commandName,
        args: cmdSplit
    })).data;
}