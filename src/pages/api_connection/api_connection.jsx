import React, {useEffect, useRef} from "react";
import {ApiConnectionSettings} from "./api_connection_settings.jsx";
import {ProgressSpinner} from "primereact/progressspinner";
import {getApiUrl} from "../../actions/local_store_actions.js";
import {onConnectionEstablished} from "../../redux/slices/apiSlice.js";
import {resetAircraftList} from "../../redux/slices/aircraftSlice.js";
import {axiosSaunaApi} from "../../actions/api_connection_handler.js";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router";

export const ApiConnectionPage = ({usingBuiltIn}) => {
    const tryingApiConnection = useRef(false);
    const apiServer = useSelector((state) => state.apiServer);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (apiServer.connected) {
            navigate("/initSession");
            return;
        }

        void attemptConnection();

        const interval = setInterval(async () => {
            await attemptConnection();
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    async function attemptConnection() {
        if (tryingApiConnection.current){
            return;
        }

        tryingApiConnection.current = true;
        try {
            const serverInfo = (await axiosSaunaApi.get(`${await getApiUrl()}/server/info`)).data;
            dispatch(onConnectionEstablished(serverInfo));
            dispatch(resetAircraftList());
            navigate("/initSession");
        } catch (e){
            // Continue
        }
        tryingApiConnection.current = false;
    }

    return (
        <>
            <div>
                {!usingBuiltIn && <ApiConnectionSettings attemptConnection={attemptConnection}/>}
                <div className={"text-center sm:absolute sm:bottom-1/2 sm:w-screen sm:left-0"}>
                    <ProgressSpinner />
                    <h1 className={"text-4xl font-bold"}>Loading...</h1>
                </div>
            </div>
        </>
    )
}