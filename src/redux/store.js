import {configureStore} from "@reduxjs/toolkit";
import {navigraphReducer} from "./slices/navigraphSlice";
import {sectorFilesReducer} from "./slices/sectorFilesSlice";

export const store = configureStore({
    reducer: {
        navigraph: navigraphReducer,
        sectorFiles: sectorFilesReducer
    }
});