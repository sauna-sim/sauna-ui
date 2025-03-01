import {configureStore} from "@reduxjs/toolkit";
import {navigraphReducer, setNvgAuthenticated, setNvgPackageInfo} from "./slices/navigraphSlice";
import {sectorFilesReducer} from "./slices/sectorFilesSlice";
import {aircraftReducer} from "./slices/aircraftSlice";
import {apiServerReducer} from "./slices/apiSlice";
import { getNavigraphPackageInfo, isNavigraphAuthenticated } from "../actions/local_store_actions";
import {messagesReducer} from "./slices/messagesSlice.js";
import {updaterReducer} from "./slices/updaterSlice.js";
import {sessionReducer} from "./slices/sessionSlice.js";

export const store = configureStore({
    reducer: {
        navigraph: navigraphReducer,
        sectorFiles: sectorFilesReducer,
        aircraftList: aircraftReducer,
        apiServer: apiServerReducer,
        messages: messagesReducer,
        updater: updaterReducer,
        session: sessionReducer
    }
});

// Load initial data
(async () => {
    try {
        store.dispatch(setNvgAuthenticated(await isNavigraphAuthenticated()));
        store.dispatch(setNvgPackageInfo(await getNavigraphPackageInfo()));
    } catch (e) {
        console.error("Failed to load redux state!", e);
    }
})();