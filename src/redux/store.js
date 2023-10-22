import {configureStore} from "@reduxjs/toolkit";
import {navigraphReducer} from "./slices/navigraphSlice";

export const store = configureStore({
    reducer: {
        navigraph: navigraphReducer
    }
});