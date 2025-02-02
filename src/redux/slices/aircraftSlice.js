import {createSlice} from "@reduxjs/toolkit";

export const aircraftSlice = createSlice({
    name: "aircraftList",
    initialState: [],
    reducers: {
        onAircraftCreated: (state, action) => {
            if (!state.includes(action.payload.callsign)) {
                state.push(action.payload.callsign);
            }
        },
        onAircraftDeleted: (state, action) => {
            const index = state.indexOf(action.payload.callsign);
            state.splice(index, 1);
        },
        resetAircraftList: (state, action) => {
            return [];
        }
    }
});

export const {
    onAircraftCreated,
    onAircraftDeleted,
    resetAircraftList
} = aircraftSlice.actions;

export const aircraftReducer = aircraftSlice.reducer;