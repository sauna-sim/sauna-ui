import {createSlice} from "@reduxjs/toolkit";

export const updaterSteps = {
    NONE: "NONE",
    UPDATE_PROMPT: "UPDATE_PROMPT",
    DOWNLOADING: "DOWNLOADING",
    INSTALLING: "INSTALLING"
}

export const updaterSlice = createSlice({
    name: "updater",
    initialState: {
        prompted: false,
        step: updaterSteps.NONE
    },
    reducers: {
        promptForUpdate: (state, action) => {
            state.prompted = true;
            state.step = updaterSteps.UPDATE_PROMPT;
            console.log(state);
        },
        closeUpdatePrompt: (state) => {
            state.step = updaterSteps.NONE;
        },
        updateDownloadStarted: (state, action) => {
            state.step = updaterSteps.DOWNLOADING;
            state.downloadSize = action.payload;
            state.downloaded = 0;
        },
        updateDownloadProgress: (state, action) => {
            state.downloaded += action.payload;
        },
        updateDownloadFinished: (state) => {
            state.step = updaterSteps.INSTALLING;
        }
    }
});

export const {
    closeUpdatePrompt,
    promptForUpdate,
    updateDownloadFinished,
    updateDownloadProgress,
    updateDownloadStarted
} = updaterSlice.actions;

export const updaterReducer = updaterSlice.reducer;