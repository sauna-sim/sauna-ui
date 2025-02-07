import React, {useEffect, useRef, useState} from "react";
import {round, wait} from "../../actions/utilities";
import {AircraftDetail} from "./aircraft_detail";
import {Button} from "primereact/button";
import {pauseAircraft, unpauseAircraft} from "../../actions/aircraft_actions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPause, faPlay} from "@fortawesome/free-solid-svg-icons";
import {getApiHostname, getApiPort} from "../../actions/local_store_actions";
import WebSocket from "@tauri-apps/plugin-websocket";

export const AircraftRow = ({callsign}) => {
    const ws = useRef(null);
    const shouldRunWebSocket = useRef(false);
    const [aircraft, setAircraft] = useState(null);
    const [simState, setSimState] = useState(null);

    useEffect(() => {
        shouldRunWebSocket.current = true;

        void runWebSocket();

        return () => {
            try {
                if (ws.current) {
                    void ws.current.disconnect();
                }
            } finally {
                delete ws.current;
                ws.current = null;
                shouldRunWebSocket.current = false;
            }
        }
    }, []);

    const runWebSocket = async () => {
        if (ws.current) {
            return;
        }

        const wsUrl = `ws://${await getApiHostname()}:${await getApiPort()}/api/aircraft/websocketByCallsign/${callsign}`;

        try {
            ws.current = await WebSocket.connect(wsUrl);

            void ws.current.send(JSON.stringify({
                type: "AIRCRAFT_POS_RATE",
                data: 2
            }));

            ws.current.addListener((msg) => {
                // Handle unexpected close
                if (!msg.type){
                    void handleWsClose(msg);
                    return;
                }

                if (msg.type === "Text") {
                    const message = JSON.parse(msg.data);

                    // Determine message type
                    switch (message.type) {
                        case "AIRCRAFT_UPDATE":
                            handleAircraftUpdate(message.data);
                            break;
                    }
                } else if (msg.type === "Close") {
                    void handleWsClose(msg.data);
                }
            });
        } catch (e) {
            void handleWsClose(e);
        }
    }

    const handleAircraftUpdate = (data) => {
        switch (data.type) {
            case "FSD_CONNECTION_STATUS":
                if (aircraft) {
                    aircraft.connectionStatus = data.data;
                    setAircraft(aircraft);
                }
                break;
            case "SIM_STATE":
                setSimState(data.data);
                break;
            case "POSITION":
                setSimState(data.data.simState);
                setAircraft(data.data);
                break;
        }
    }

    const handleWsClose = async (msg) => {
        console.log(msg);
        try {
            if (ws.current) {
                ws.current.remove
                await ws.current.disconnect();
            }
        } catch (e) {
            shouldRunWebSocket.current = false;
        } finally {
            delete ws.current;
            ws.current = null;

            // Otherwise retry the ws socket
            if (shouldRunWebSocket.current) {
                await wait(5000);
                void runWebSocket();
            }
        }
    }

    const getAircraftActions = () => {
        if (simState) {
            let pauseButton;
            if (simState.paused) {
                pauseButton = <Button
                    severity={"success"}
                    outlined={true}
                    className="mr-2"
                    onClick={() => unpauseAircraft(aircraft.callsign)}
                    icon={(options) => <FontAwesomeIcon icon={faPlay} {...options.iconProps} />}
                />;
            } else {
                pauseButton = <Button
                    severity={"danger"}
                    outlined={true}
                    className="mr-2"
                    onClick={() => pauseAircraft(aircraft.callsign)}
                    icon={(options) => <FontAwesomeIcon icon={faPause} {...options.iconProps} />}
                />;
            }
            return (
                <>
                    {pauseButton}
                    {simState.simRate}x
                </>
            )
        }

        return <></>;
    }

    const getArmedModes = (armedModes) => {
        if (!armedModes) {
            return "";
        }
        let armedStr = "";
        for (const armedMode of armedModes) {
            armedStr += `${armedMode} `;
        }

        return armedStr;
    }

    const isModeFms = (mode) => {
        return (
            mode === "LNAV" ||
            mode === "APCH" ||
            mode === "VPTH" ||
            mode === "VFLCH" ||
            mode === "VASEL" ||
            mode === "VALT"
        );
    }

    const getFma = () => {
        return <>
            <div className={"flex flex-row"}>

            </div>
            <div className={"flex flex-row"}>
                <div className={"col fma-active-conv"}>{aircraft.autopilot.currentThrustMode}</div>
                <div
                    className={isModeFms(aircraft.autopilot.currentLateralMode) ? "col fma-active-fms" : "col fma-active-conv"}>{aircraft.autopilot.currentLateralMode}</div>
                <div
                    className={isModeFms(aircraft.autopilot.currentVerticalMode) ? "col fma-active-fms" : "col fma-active-conv"}>{aircraft.autopilot.currentVerticalMode}</div>
            </div>
            <div className={"flex flex-row"}>
                <div className={"col fma-armed"}>{getArmedModes(aircraft.autopilot.armedThrustModes)}</div>
                <div className={"col fma-armed"}>{getArmedModes(aircraft.autopilot.armedLateralModes)}</div>
                <div className={"col fma-armed"}>{getArmedModes(aircraft.autopilot.armedVerticalModes)}</div>
            </div>
        </>
    }

    const getTimeStr = (ms) => {
        let secs = Math.floor(ms / 1000);
        let mins = Math.floor(secs / 60);
        secs -= (mins * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    if (!aircraft) {
        return <tr/>
    }

    return <tr>
        <td>{getAircraftActions()}</td>
        <td>{aircraft.callsign}</td>
        <td>
            <div>{aircraft.connectionStatus}</div>
            <div>{aircraft.connectionStatus === "WAITING" ? getTimeStr(aircraft.delayMs) + "min" : ""}</div>
        </td>
        <td>
            <div className={"pfd-selected"}>{aircraft.autopilot.selectedHeading}</div>
            <div className={"pfd-measured"}>{round(aircraft.position.heading_Mag.degrees, 2)}</div>
        </td>
        <td>
            <div className={aircraft.autopilot?.selectedSpeedMode === "MANUAL" ? "pfd-selected" : "pfd-managed"}>
                {aircraft.autopilot?.selectedSpeedUnits === "KNOTS" ?
                    aircraft.autopilot.selectedSpeed :
                    `M${round(aircraft.autopilot?.selectedSpeed / 100.0, 2)}`}
            </div>
            <div className={"pfd-measured"}>{round(aircraft.position.indicatedAirSpeed.knots, 2)}</div>
        </td>
        <td>
            <div className={"pfd-selected"}>{aircraft.autopilot.selectedAltitude}</div>
            <div className={"pfd-measured"}>{round(aircraft.position.indicatedAltitude.feet, 2)}</div>
        </td>
        <td>
            <div className={"pfd-selected"}>{aircraft.autopilot.selectedVerticalSpeed}</div>
            <div className={"pfd-measured"}>{round(aircraft.position.verticalSpeed.feetPerMinute, 2)}</div>
        </td>
        <td>
            <div className={"pfd-selected"}>{aircraft.autopilot.selectedFpa}</div>
            <div className={"pfd-measured"}>{round(aircraft.position.flightPathAngle.degrees, 2)}</div>
        </td>
        <td>{getFma()}</td>
        <td>{round(aircraft.position.pitch.degrees, 2)}</td>
        <td>{round(aircraft.position.bank.degrees, 2)}</td>
        <td>{round(aircraft.data.thrustLeverPos, 2)}</td>
        <td>{`${round(aircraft.position.altimeterSetting.hectopascals)}hPa`}</td>
        <td>{`${round(aircraft.position.windDirection.degrees)} @ ${round(aircraft.position.windSpeed.knots)}kts`}</td>
        <td><div style={{overflow: "auto", height: "100px"}}>{aircraft.fms.asString}</div></td>
        <td><AircraftDetail aircraft={aircraft}/></td>
    </tr>
}