import {store as reduxStore} from '../redux/store';
import axios from "axios";
import {getApiHostname, getApiPort, getApiUrl} from "./local_store_actions";
import {onConnectionEstablished, onConnectionLost, onSimStateChange} from "../redux/slices/apiSlice";
import {wait} from "./utilities";
import {
    onAircraftCreated,
    onAircraftDeleted, resetAircraftList,
} from "../redux/slices/aircraftSlice";
import {onMessageReceive} from "../redux/slices/messagesSlice.js";
import WebSocket from "@tauri-apps/plugin-websocket";

// Axios Sauna-API Settings
export const axiosSaunaApi = axios.create();

axiosSaunaApi.interceptors.response.use(
    (response) => {
        return response
    }, async (error) => {
        const originalRequest = error.config;
        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || error.code === "ETIMEDOUT") {
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                // Try to reach server again
                return axiosSaunaApi(originalRequest);
            } else {
                // Connection has been lost
                reduxStore.dispatch(onConnectionLost());
                reduxStore.dispatch(resetAircraftList());

                // Close other windows

                // Start retrying connection
                establishApiConnection().then(() => {});

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

let trying = false;
establishApiConnection().then(() => {})
export async function establishApiConnection(){
    if (trying){
        return;
    }
    // Poll for api connection every 5 seconds
    let connected = false;
    trying = true;
    while (!connected){
        try {
            const serverInfo = (await axiosSaunaApi.get(`${await getApiUrl()}/server/info`)).data;
            reduxStore.dispatch(onConnectionEstablished(serverInfo));
            reduxStore.dispatch(resetAircraftList());
            connected = true;
        } catch (e){
            // Continue
            connected = false;
            await wait(5000);
        }
    }
    trying = false;

    // Start websocket
    startWebSocket().then(() => {});
}

let ws;
async function startWebSocket(){
    const wsUrl = `ws://${await getApiHostname()}:${await getApiPort()}/api/server/websocket`;
    ws = await WebSocket.connect(wsUrl);

    ws.addListener((msg) => {
        // Handle unexpected close
        if (!msg.type){
            void handleWsClose(msg);
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
            handleWsClose(msg.data);
        }
    });
}

async function handleWsClose(closeEvent){
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
        // interceptor will auto retry connection
        return;
    }

    // Otherwise retry the ws socket
    await wait(5000);
    void startWebSocket();
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