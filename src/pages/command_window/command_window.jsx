import React from "react";
import {FormControl} from "react-bootstrap";

export const CommandWindow = ({}) => {
    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100vw"
            }}>
                <div style={{flexGrow: "1"}}>
                    Command 1 <br />
                    Command 2 <br />
                </div>
                <div>
                    <FormControl type={"text"} />
                </div>
            </div>
        </>
    )
};