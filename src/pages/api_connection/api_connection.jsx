import React from "react";
import {ApiConnectionSettings} from "./api_connection_settings.jsx";

export const ApiConnectionPage = ({usingBuiltIn}) => {
    return (
        <>
            <div>
                {!usingBuiltIn && <ApiConnectionSettings/>}
                <div className={"text-center sm:absolute sm:bottom-1/2 sm:w-screen sm:left-0"}>
                    <h1 className={"text-4xl font-bold"}>Trying to connect to Sauna API...</h1>
                </div>
            </div>
        </>
    )
}