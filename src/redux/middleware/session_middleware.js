import WebSocketWrapper from "../../utils/WebSocketWrapper.js";
import {onSessionInitialize, onSimStateChange, resetSession} from "../slices/sessionSlice.js";
import {getApiHostname, getApiPort, getApiUrl} from "../../actions/local_store_actions.js";
import {store as reduxStore} from "../store.js";
import {onMessageReceive} from "../slices/messagesSlice.js";
import {onAircraftCreated, onAircraftDeleted} from "../slices/aircraftSlice.js";
import {axiosSaunaApi} from "../../actions/api_connection_handler.js";

export const sessionMiddleware = storeApi => next => action => {
    const {dispatch, getState} = storeApi;

    // Initialize websocket
    let socket = new WebSocketWrapper();

    // Check action
    switch (action.type) {
        case onSessionInitialize.type:
            console.log("On Session Init");
            // Disconnect any existing connection
            try {
                socket.disconnect();
            } catch (e) {}

            void (async () => {
                // Connect to websocket
                const wsUrl = `ws://${await getApiHostname()}:${await getApiPort()}/api/session/${action.payload}/websocket`;
                socket.connect(wsUrl);

                // Handle message
                socket.on('message', (e) => {
                    const message = JSON.parse(e.data);
                    console.log("socket", message);
                    // Determine message type
                    switch (message.type){
                        case "SIM_STATE_UPDATE":
                            dispatch(onSimStateChange(message.data));
                            break;
                        case "COMMAND_MSG":
                            dispatch(onMessageReceive({
                                received: true,
                                msg: message.data
                            }));
                            break;
                        case "AIRCRAFT_UPDATE":
                            switch (message.data.type) {
                                case "CREATED":
                                    dispatch(onAircraftCreated(message.data));
                                    break;
                                case "DELETED":
                                    dispatch(onAircraftDeleted(message.data.callsign));
                                    break;
                            }
                            break;
                    }
                });

                // Handle close
                socket.on('close', (e) => {
                    console.log("Socket close", e);
                    dispatch(resetSession());
                });

                socket.on('error', (e) => {
                    console.log("Socket error", e);
                    dispatch(resetSession());
                });
            })();
            break;

    }

    return next(action);
}