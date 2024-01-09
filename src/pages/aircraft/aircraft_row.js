import React, {Component} from "react";
import {round, wait} from "../../actions/utilities";
import {AircraftDetail} from "./aircraft_detail";
import {Button, Col, Row} from "react-bootstrap";
import {pauseAircraft, unpauseAircraft} from "../../actions/aircraft_actions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPause, faPlay} from "@fortawesome/free-solid-svg-icons";
import {getApiHostname, getApiPort} from "../../actions/local_store_actions";

export class AircraftRow extends Component {
    constructor(props) {
        super(props);

        this.ws = null;

        this.state = {
            runWebSocket: false
        }
    }

    componentDidMount() {
        this.setState({
            runWebSocket: true
        });

        this.runWebSocket().then(() => {
        });
    }

    componentWillUnmount() {
        if (this.ws) {
            try {
                this.ws.close();
            } catch (e) {
                this.ws = null;
            }
        }
        this.setState({
            runWebSocket: false
        });
    }

    runWebSocket = async () => {
        const {callsign} = this.props;
        const wsUrl = `ws://${await getApiHostname()}:${await getApiPort()}/api/aircraft/websocketByCallsign/${callsign}`;

        try {
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = (event) => {
                this.ws.send(JSON.stringify({
                    type: "AIRCRAFT_POS_RATE",
                    data: 2
                }));
                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);

                    // Determine message type
                    switch (message.type) {
                        case "AIRCRAFT_UPDATE":
                            this.handleAircraftUpdate(message.data);
                            break;
                    }
                }
            }

            this.ws.onclose = (event) => {
                this.handleWsClose();
            }
            this.ws.onerror = (event) => {
                this.handleWsClose();
            }
        } catch (e) {
            this.handleWsClose();
        }
    }

    handleAircraftUpdate = (data) => {
        const {aircraft} = this.state;
        switch (data.type) {
            case "FSD_CONNECTION_STATUS":
                if (aircraft) {
                    aircraft.connectionStatus = data.data;
                    this.setState({
                        aircraft
                    });
                }
                break;
            case "SIM_STATE":
                if (aircraft) {
                    aircraft.simState = data.data;
                    this.setState({
                        aircraft
                    });
                }
                break;
            case "POSITION":
                this.setState({
                    aircraft: data.data
                });
                break;
        }
    }

    handleWsClose = async () => {
        if (this.ws) {
            this.ws.close();
        }
        this.ws = null;

        // Otherwise retry the ws socket
        if (this.state.runWebSocket) {
            await wait(5000);
            this.runWebSocket().then(() => {
            });
        }
    }

    getAircraftActions = (aircraft) => {
        let pauseButton;
        if (aircraft.simState.paused) {
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
                {aircraft.simState.simRate}x
            </>
        )
    }

    getArmedModes = (armedModes) => {
        if (!armedModes) {
            return "";
        }
        let armedStr = "";
        for (const armedMode of armedModes) {
            armedStr += `${armedMode} `;
        }

        return armedStr;
    }

    isModeFms = (mode) => {
        return (
            mode === "LNAV" ||
            mode === "APCH" ||
            mode === "VPTH" ||
            mode === "VFLCH" ||
            mode === "VASEL" ||
            mode === "VALT"
        );
    }

    getFma = (aircraft) => {
        return <>
            <Row>

            </Row>
            <Row>
                <Col className={"fma-active-conv"}>{aircraft.autopilot.currentThrustMode}</Col>
                <Col
                    className={this.isModeFms(aircraft.autopilot.currentLateralMode) ? "fma-active-fms" : "fma-active-conv"}>{aircraft.autopilot.currentLateralMode}</Col>
                <Col
                    className={this.isModeFms(aircraft.autopilot.currentVerticalMode) ? "fma-active-fms" : "fma-active-conv"}>{aircraft.autopilot.currentVerticalMode}</Col>
            </Row>
            <Row>
                <Col className={"fma-armed"}>{this.getArmedModes(aircraft.autopilot.armedThrustModes)}</Col>
                <Col className={"fma-armed"}>{this.getArmedModes(aircraft.autopilot.armedLateralModes)}</Col>
                <Col className={"fma-armed"}>{this.getArmedModes(aircraft.autopilot.armedVerticalModes)}</Col>
            </Row>
        </>
    }

    getTimeStr = (ms) => {
        let secs = Math.floor(ms / 1000);
        let mins = Math.floor(secs / 60);
        secs -= (mins * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    render() {
        const {callsign} = this.props;
        const {aircraft} = this.state;

        if (!aircraft) {
            return <tr/>
        }

        return <tr>
            <td>{this.getAircraftActions(aircraft)}</td>
            <td>{aircraft.callsign}</td>
            <td>
                <div>{aircraft.connectionStatus}</div>
                <div>{aircraft.connectionStatus === "WAITING" ? this.getTimeStr(aircraft.delayMs) + "min" : ""}</div>
            </td>
            <td>
                <div className={"pfd-selected"}>{aircraft.autopilot.selectedHeading}</div>
                <div className={"pfd-measured"}>{round(aircraft.position.heading_Mag, 2)}</div>
            </td>
            <td>
                <div className={aircraft.autopilot.selectedSpeedMode === "MANUAL" ? "pfd-selected" : "pfd-managed"}>
                    {aircraft.autopilot.selectedSpeedUnits === "KNOTS" ?
                        aircraft.autopilot.selectedSpeed :
                        `M${round(aircraft.autopilot.selectedSpeed / 100.0, 2)}`}
                </div>
                <div className={"pfd-measured"}>{round(aircraft.position.indicatedAirSpeed, 2)}</div>
            </td>
            <td>
                <div className={"pfd-selected"}>{aircraft.autopilot.selectedAltitude}</div>
                <div className={"pfd-measured"}>{round(aircraft.position.indicatedAltitude, 2)}</div>
            </td>
            <td>
                <div className={"pfd-selected"}>{aircraft.autopilot.selectedVerticalSpeed}</div>
                <div className={"pfd-measured"}>{round(aircraft.position.verticalSpeed, 2)}</div>
            </td>
            <td>
                <div className={"pfd-selected"}>{aircraft.autopilot.selectedFpa}</div>
                <div className={"pfd-measured"}>{round(aircraft.position.flightPathAngle, 2)}</div>
            </td>
            <td>{this.getFma(aircraft)}</td>
            <td>{round(aircraft.position.pitch, 2)}</td>
            <td>{round(aircraft.position.bank, 2)}</td>
            <td>{round(aircraft.data.thrustLeverPos, 2)}</td>
            <td>{`${round(aircraft.position.altimeterSetting_hPa)}hPa`}</td>
            <td>{`${round(aircraft.position.windDirection)} @ ${round(aircraft.position.windSpeed)}kts`}</td>
            <td>{aircraft.fms.asString}</td>
            <td><AircraftDetail aircraft={aircraft}/></td>
        </tr>
    }
}