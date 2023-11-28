import {createSlice} from "@reduxjs/toolkit";
import {getNavigraphPackageInfo, isNavigraphAuthenticated} from "../../actions/local_store_actions";

export const aircraftSlice = createSlice({
    name: "aircraftList",
    initialState: [],
    reducers: {
        onAircraftCreated: (state, action) => {
            state.push(action.payload.data);
        },
        onAircraftDeleted: (state, action) => {
            const index = state.findIndex((aircraft) => aircraft.callsign === action.payload)
            if (index > -1) {
                state.splice(index, 1);
            }
        },
        onAircraftStatusChange: (state, action) => {
            const foundAircraft = state.find((acft) => acft.callsign === action.payload.callsign);
            if (foundAircraft) {
                foundAircraft.connectionStatus = action.payload.data;
            }
        },
        onAircraftSimStateChange: (state, action) => {
            const foundAircraft = state.find((acft) => acft.callsign === action.payload.callsign);
            if (foundAircraft) {
                foundAircraft.simState = action.payload.data;
            }
        },
        onAircraftPositionUpdate: (state, action) => {
            const index = state.findIndex((aircraft) => aircraft.callsign === action.payload.callsign)
            if (index > -1) {
                state[index] = action.payload.data;
            }
        }
    }
});

export const {
    onAircraftCreated,
    onAircraftDeleted,
    onAircraftStatusChange,
    onAircraftSimStateChange,
    onAircraftPositionUpdate
} = aircraftSlice.actions;

export const aircraftReducer = aircraftSlice.reducer;