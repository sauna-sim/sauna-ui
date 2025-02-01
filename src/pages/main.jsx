import React from "react";
import {MainToolbar} from "./toolbar/toolbar.jsx";
import {AircraftPage} from "./aircraft/aircraft";
import {useSelector} from "react-redux";
import {ApiConnectionPage} from "./api_connection/api_connection.jsx";

export default ({}) => {
    const apiServer = useSelector((state) => state.apiServer);

    if (apiServer.connected){
        return (
            <>
                <MainToolbar />
                <AircraftPage />
            </>
        )
    }

    return <ApiConnectionPage usingBuiltIn={apiServer.usingBuiltIn} />;
}