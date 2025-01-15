import React, {useEffect, useRef, useState} from "react";
import {round, wait} from "../../actions/utilities";
import {AircraftDetail} from "./aircraft_detail";
import {Button, Col, Row} from "react-bootstrap";
import {pauseAircraft, unpauseAircraft} from "../../actions/aircraft_actions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPause, faPlay} from "@fortawesome/free-solid-svg-icons";
import {getApiHostname, getApiPort} from "../../actions/local_store_actions";

export const AircraftRow = ({callsign}) => {
    const ws = useRef(null);
    const shouldRunWebSocket = useRef(false);
    const [aircraft, setAircraft] = useState(null);
    const [simState, setSimState] = useState(null);

    useEffect(() => {
        shouldRunWebSocket.current = true;

        void runWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            shouldRunWebSocket.current = false;
        }
    }, []);

    const runWebSocket = async () => {
        if (ws.current) {
            return;
        }

        const wsUrl = `ws://${await getApiHostname()}:${await getApiPort()}/api/aircraft/websocketByCallsign/${callsign}`;

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = (event) => {
                try {
                    ws.current.send(JSON.stringify({
                        type: "AIRCRAFT_POS_RATE",
                        data: 2
                    }));
                } catch (e) {
                    handleWsClose();
                }
            }

            ws.current.onmessage = (event) => {
                const message = JSON.parse(event.data);

                // Determine message type
                switch (message.type) {
                    case "AIRCRAFT_UPDATE":
                        handleAircraftUpdate(message.data);
                        break;
                }
            }

            ws.current.onclose = (event) => {
                handleWsClose();
            }

            ws.current.onerror = (event) => {
                console.log(event);
                handleWsClose();
            }
        } catch (e) {
            await handleWsClose();
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

    const handleWsClose = async () => {
        if (ws.current) {
            ws.current.close();
        }
        ws.current = null;

        // Otherwise retry the ws socket
        if (shouldRunWebSocket.current) {
            await wait(5000);
            void runWebSocket();
        }
    }

    const getAircraftActions = () => {
        if (simState) {
            let pauseButton;
            if (simState.paused) {
                pauseButton = <Button variant="outline-success" className="me-2"
                                      onClick={() => unpauseAircraft(aircraft.callsign)}
                ><FontAwesomeIcon icon={faPlay}/></Button>;
            } else {
                pauseButton = <Button variant="outline-danger" className="me-2"
                                      onClick={() => pauseAircraft(aircraft.callsign)}
                ><FontAwesomeIcon icon={faPause}/></Button>
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
            <Row>

            </Row>
            <Row>
                <Col className={"fma-active-conv"}>{aircraft.autopilot.currentThrustMode}</Col>
                <Col
                    className={isModeFms(aircraft.autopilot.currentLateralMode) ? "fma-active-fms" : "fma-active-conv"}>{aircraft.autopilot.currentLateralMode}</Col>
                <Col
                    className={isModeFms(aircraft.autopilot.currentVerticalMode) ? "fma-active-fms" : "fma-active-conv"}>{aircraft.autopilot.currentVerticalMode}</Col>
            </Row>
            <Row>
                <Col className={"fma-armed"}>{getArmedModes(aircraft.autopilot.armedThrustModes)}</Col>
                <Col className={"fma-armed"}>{getArmedModes(aircraft.autopilot.armedLateralModes)}</Col>
                <Col className={"fma-armed"}>{getArmedModes(aircraft.autopilot.armedVerticalModes)}</Col>
            </Row>
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
            <div className={aircraft.autopilot.selectedSpeedMode === "MANUAL" ? "pfd-selected" : "pfd-managed"}>
                {aircraft.autopilot.selectedSpeedUnits === "KNOTS" ?
                    aircraft.autopilot.selectedSpeed :
                    `M${round(aircraft.autopilot.selectedSpeed / 100.0, 2)}`}
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
        <td>{aircraft.fms.asString}</td>
        <td><AircraftDetail aircraft={aircraft}/></td>
    </tr>
}