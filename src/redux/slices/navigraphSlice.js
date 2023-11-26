import {createSlice} from "@reduxjs/toolkit";
import {getNavigraphPackageInfo, isNavigraphAuthenticated} from "../../actions/local_store_actions";

export const navigraphSlice = createSlice({
    name: "navigraph",
    initialState: {
        authenticated: await isNavigraphAuthenticated(),
        packageInfo: await getNavigraphPackageInfo(),
        isCurrent: false
    },
    reducers: {
        setNvgAuthenticated: (state, action) => {
            state.authenticated = action.payload;
        },
        setNvgPackageInfo: (state, action) => {
            state.packageInfo = action.payload;
        },
        setNvgIsCurrent: (state, action) => {
            state.isCurrent = action.payload
        }
    }
});

export const {setNvgAuthenticated, setNvgPackageInfo, setNvgIsCurrent} = navigraphSlice.actions;

export const navigraphReducer = navigraphSlice.reducer;