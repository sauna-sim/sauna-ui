import {createSlice} from "@reduxjs/toolkit";

export const aircraftSlice = createSlice({
    name: "aircraftList",
    initialState: [],
    reducers: {
        onAircraftCreated: (state, action) => {
            state.push(action.payload.callsign);
        },
        onAircraftDeleted: (state, action) => {
            const index = state.indexOf(action.payload.callsign);
            state.splice(index, 1);
        },
        resetAircraftList: (state, action) => {
            return [];
        }
        // onAircraftStatusChange: (state, action) => {
        //     const foundAircraft = state[action.payload.callsign];
        //     if (foundAircraft) {
        //         foundAircraft.connectionStatus = action.payload.data;
        //     }
        // },
        // onAircraftSimStateChange: (state, action) => {
        //     const foundAircraft = state[action.payload.callsign];
        //     if (foundAircraft) {
        //         foundAircraft.simState = action.payload.data;
        //     }
        // },
        // onAircraftPositionUpdate: (state, action) => {
        //     state[action.payload.callsign] = action.payload.data;
        // },
        // setAircraftList: (state, action) => {
        //     const newState = {};
        //     action.payload.forEach((acft) => {
        //         state[acft.callsign] = acft;
        //     });
        //     console.log(state);
        // }
    }
});

export const {
    onAircraftCreated,
    onAircraftDeleted,
    resetAircraftList
    // onAircraftStatusChange,
    // onAircraftSimStateChange,
    // onAircraftPositionUpdate,
    // setAircraftList
} = aircraftSlice.actions;

export const aircraftReducer = aircraftSlice.reducer;