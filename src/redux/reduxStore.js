import {configureStore} from "@reduxjs/toolkit";
import uiSettingsReducer from "./slices/uiSettings";

// Create redux store with redux toolkit and setup reducers
const reduxStore = configureStore({
    reducer: {
        uiSettings: uiSettingsReducer
    }
});

export default reduxStore;