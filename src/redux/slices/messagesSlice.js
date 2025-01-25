import {createSlice} from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: [],
    reducers: {
        onMessageReceive: (state, action) => {
            state.push(action.payload);
        },
        onMessagesClear: (state) => {
            state = [];
        }
    }
});

export const {
    onMessageReceive,
    onMessageClear
} = messagesSlice.actions;

export const messagesReducer = messagesSlice.reducer;