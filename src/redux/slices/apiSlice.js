import {createSlice} from "@reduxjs/toolkit";
import {getNavigraphPackageInfo, isNavigraphAuthenticated} from "../../actions/local_store_actions";

export const apiServerSlice = createSlice({
    name: "apiServer",
    initialState: {
        connected: false,
        serverInfo: null,
        simState: {
            paused: true,
            simRate: 1.0
        }
    },
    reducers: {
        onConnectionEstablished: (state, action) => {
            state.connected = true;
            state.serverInfo = action.payload;
        },
        onConnectionLost: (state, action) => {
            state.connected = false;
            state.serverInfo = null;
        },
        onSimStateChange: (state, action) => {
            state.simState = action.payload;
        }
    }
});

export const {
    onConnectionEstablished,
    onConnectionLost,
    onSimStateChange,
} = apiServerSlice.actions;

export const apiServerReducer = apiServerSlice.reducer;