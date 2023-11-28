import {configureStore} from "@reduxjs/toolkit";
import {navigraphReducer} from "./slices/navigraphSlice";
import {sectorFilesReducer} from "./slices/sectorFilesSlice";
import {aircraftReducer} from "./slices/aircraftSlice";
import {apiServerReducer} from "./slices/apiSlice";

export const store = configureStore({
    reducer: {
        navigraph: navigraphReducer,
        sectorFiles: sectorFilesReducer,
        aircraftList: aircraftReducer,
        apiServer: apiServerReducer
    }
});