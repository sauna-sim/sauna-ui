import {createSlice} from "@reduxjs/toolkit";

export const sessionSlice = createSlice({
    name: "session",
    initialState: {
        id: null,
        settings: {
            sessionType: "STANDALONE",
        },
        simState: {
            paused: true,
            simRate: 1.0
        }
    },
    reducers: {
        onSessionInitialize: (state, action) => {
            state.id = action.payload;
        },
        onSessionClose: (state, action) => {
            state.id = null;
        },
        onSimStateChange: (state, action) => {
            state.simState = action.payload;
        },
        onSessionSettingsChange: (state, action) => {
            state.settings = action.payload;
        }
    }
});

export const {
    onSessionInitialize,
    onSessionClose,
    onSimStateChange,
    onSessionSettingsChange
} = sessionSlice.actions;

export const sessionReducer = sessionSlice.reducer;