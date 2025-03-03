import {configureStore} from "@reduxjs/toolkit";
import {navigraphReducer, setNvgAuthenticated, setNvgPackageInfo} from "./slices/navigraphSlice";
import {sectorFilesReducer} from "./slices/sectorFilesSlice";
import {aircraftReducer} from "./slices/aircraftSlice";
import {apiServerReducer} from "./slices/apiSlice";
import {getNavigraphPackageInfo, getStoreSessionId, isNavigraphAuthenticated} from "../actions/local_store_actions";
import {messagesReducer} from "./slices/messagesSlice.js";
import {updaterReducer} from "./slices/updaterSlice.js";
import {onSessionInitialize, sessionReducer} from "./slices/sessionSlice.js";
import {sessionMiddleware} from "./middleware/session_middleware.js";

export const store = configureStore({
    reducer: {
        navigraph: navigraphReducer,
        sectorFiles: sectorFilesReducer,
        aircraftList: aircraftReducer,
        apiServer: apiServerReducer,
        messages: messagesReducer,
        updater: updaterReducer,
        session: sessionReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sessionMiddleware)
});

// Load initial data
(async () => {
    try {
        store.dispatch(setNvgAuthenticated(await isNavigraphAuthenticated()));
        store.dispatch(setNvgPackageInfo(await getNavigraphPackageInfo()));

        const sessionId = await getStoreSessionId();
        if (sessionId){
            store.dispatch(onSessionInitialize(sessionId));
        }
    } catch (e) {
        console.error("Failed to load redux state!", e);
    }
})();