import {store as reduxStore} from '../redux/store';
import axios from "axios";
import {onConnectionLost} from "../redux/slices/apiSlice";
import {onAircraftCreated, onAircraftDeleted, resetAircraftList,} from "../redux/slices/aircraftSlice";
import {resetSession} from "../redux/slices/sessionSlice.js";

// Axios Sauna-API Settings
export const axiosSaunaApi = axios.create();

axiosSaunaApi.interceptors.response.use(
    (response) => {
        return response
    }, async (error) => {
        const originalRequest = error.config;
        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || error.code === "ETIMEDOUT") {
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                // Try to reach server again
                return axiosSaunaApi(originalRequest);
            } else {
                // Connection has been lost
                reduxStore.dispatch(onConnectionLost());
                reduxStore.dispatch(resetAircraftList());
                reduxStore.dispatch(resetSession());

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);