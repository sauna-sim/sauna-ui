import React from "react";
import {ApiConnectionSettings} from "./api_connection_settings.jsx";

export const ApiConnectionPage = ({usingBuiltIn}) => {
    return (
        <>
            <div>
                {!usingBuiltIn && <ApiConnectionSettings/>}
                <div className={"text-center sm:absolute sm:bottom-50 sm:w-screen sm:left-0"}>
                    <h1>Trying to connect to Sauna API...</h1>
                </div>
            </div>
        </>
    )
}