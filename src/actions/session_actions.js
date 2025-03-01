import {axiosSaunaApi} from "./api_connection_handler.js";
import {getApiHostname, getApiPort, getApiUrl} from "./local_store_actions.js";
import {onAircraftCreated, onAircraftDeleted, resetAircraftList} from "../redux/slices/aircraftSlice.js";
import {store as reduxStore} from "../redux/store.js";
import {onSimStateChange} from "../redux/slices/sessionSlice.js";
import {onMessageReceive} from "../redux/slices/messagesSlice.js";
import {onConnectionLost} from "../redux/slices/apiSlice.js";
import {wait} from "./utilities.js";

export async function createSession(sessionDetails) {
    const url = `${await getApiUrl()}/session/create`;
    return (await axiosSaunaApi.post(url, sessionDetails)).data;
}

let ws;
export async function startWebSocket(sessionId){
    const wsUrl = `ws://${await getApiHostname()}:${await getApiPort()}/api/session/${sessionId}/websocket`;
    ws = await WebSocket.connect(wsUrl);

    ws.addListener((msg) => {
        // Handle unexpected close
        if (!msg.type){
            void handleWsClose(sessionId, msg);
            return;
        }

        if (msg.type === "Text") {
            const message = JSON.parse(msg.data);

            // Determine message type
            switch (message.type){
                case "SIM_STATE_UPDATE":
                    reduxStore.dispatch(onSimStateChange(message.data));
                    break;
                case "COMMAND_MSG":
                    reduxStore.dispatch(onMessageReceive({
                        received: true,
                        msg: message.data
                    }));
                    break;
                case "AIRCRAFT_UPDATE":
                    handleAircraftUpdate(message.data);
                    break;
            }
        } else if (msg.type === "Close") {
            handleWsClose(sessionId, msg.data);
        }
    });
}

async function handleWsClose(sessionId, closeEvent){
    console.log(closeEvent);
    try {
        await ws.disconnect();
    } catch (e) {
        console.log(e);
    }
    ws = null;

    // Check if api closed
    try {
        await axiosSaunaApi.get(`${await getApiUrl()}/server/info`);
    } catch (error){
        // Connection has been lost
        reduxStore.dispatch(onConnectionLost());
        reduxStore.dispatch(resetAircraftList());
        return;
    }

    // Otherwise retry the ws socket
    await wait(5000);
    void startWebSocket(sessionId);
}

function handleAircraftUpdate(data){
    //reduxStore.dispatch(setAircraftList(data));
    switch (data.type){
        case "CREATED":
            reduxStore.dispatch(onAircraftCreated(data));
            break;
        case "DELETED":
            console.log("deleted", data);
            reduxStore.dispatch(onAircraftDeleted(data.callsign));
            break;
    //     case "FSD_CONNECTION_STATUS":
    //         reduxStore.dispatch(onAircraftStatusChange(data));
    //         break;
    //     case "SIM_STATE":
    //         reduxStore.dispatch(onAircraftSimStateChange(data));
    //         break;
    //     case "POSITION":
    //         reduxStore.dispatch(onAircraftPositionUpdate(data));
    }
}