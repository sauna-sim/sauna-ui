import {createSlice} from "@reduxjs/toolkit";

export const sectorFilesSlice = createSlice({
    name: "sectorFiles",
    initialState: {
        value: []
    },
    reducers: {
        setSectorFiles: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const {setSectorFiles} = sectorFilesSlice.actions;

export const sectorFilesReducer = sectorFilesSlice.reducer;