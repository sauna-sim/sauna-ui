import {createSlice} from "@reduxjs/toolkit";

export const uiSettingsSlice = createSlice({
    name: "uiSettings",
    initialState: {
        apiPort: 5000
    },
    reducers: {
        set: (state, action) => {
            state = action.payload
        }
    }
});

export const {set} = uiSettingsSlice.actions;

const uiSettingsReducer = uiSettingsSlice.reducer;
export default uiSettingsReducer;