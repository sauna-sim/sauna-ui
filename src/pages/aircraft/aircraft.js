import React, {Component} from "react";
import {
    getAircraftList,
    getSimState, pauseAircraft, pauseall,
    removeAllAircraft, setAllSimRate, unpauseAircraft, unpauseall,
} from "../../actions/aircraft_actions";
import {round, wait} from "../../actions/utilities";
import {Button, ButtonToolbar, Col, FormControl, InputGroup, Row, Table} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPause, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";

export class AircraftPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            aircraftList: [],
            simState: {
                paused: true,
                simRate: 1
            },
            shouldPollForAircraft: true
        }
    }

    componentDidMount() {
        this.setState({
            shouldPollForAircraft: true
        });
        this.pollForAircraft();
    }

    componentWillUnmount() {
        this.setState({
            shouldPollForAircraft: false
        });
    }

    pollForAircraft = async () => {
        while (this.state.shouldPollForAircraft) {
            try {
                const aircraftList = await getAircraftList(true);
                const simState = await getSimState();

                this.setState({
                    aircraftList: aircraftList,
                    simState: simState
                });
            } catch (e) {
                console.log(e);
            }
            await wait(200);
        }
    }

    getTimeStr = (ms) => {
        let secs = Math.floor(ms / 1000);
        let mins = Math.floor(secs / 60);
        secs -= (mins * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getSimStateActions = () => {
        const {simState} = this.state;
        let pauseButton;
        if (simState.paused){
            pauseButton = <Button variant="outline-success" className="me-2"
                                  onClick={async () => {
                                      const simState = await unpauseall();
                                      this.setState({
                                          simState: simState
                                      });
                                  }}
            ><FontAwesomeIcon icon={faPlay} /></Button>;
        } else {
            pauseButton = <Button variant="outline-danger" className="me-2"
                                  onClick={async () => {
                                      const simState = await pauseall();
                                      this.setState({
                                          simState: simState
                                      });
                                  }}
            ><FontAwesomeIcon icon={faPause} /></Button>
        }
        return (
            <>
                {pauseButton}
                <InputGroup className="me-2">
                    <FormControl
                        type="number"
                        max="8.0"
                        min="0.1"
                        step="0.1"
                        value={simState.simRate}
                        onChange={async (e) => {
                            let num = Number(e.target.value);
                            console.log(e.target.value);
                            console.log(num);
                            if (!isNaN(num) && num >= 0.1) {
                                const simState = await setAllSimRate(Number(e.target.value));
                                this.setState({
                                    simState: simState
                                });
                            }
                        }}
                        required
                        placeholder="1.0"
                        aria-label="Sim Rate"
                        aria-describedby="global-simrate-addon2"
                    />
                    <InputGroup.Text id="global-simrate-addon2">x</InputGroup.Text>
                </InputGroup>
                <Button variant="danger" className="me-2" onClick={() => removeAllAircraft()}><FontAwesomeIcon icon={faTrash} /> All</Button>
            </>
        )
    }

    getAircraftActions = (aircraft) => {
        let pauseButton;
        if (aircraft.simState.paused){
            pauseButton = <Button variant="outline-success" className="me-2"
                                  onClick={() => unpauseAircraft(aircraft.callsign)}
            ><FontAwesomeIcon icon={faPlay} /></Button>;
        } else {
            pauseButton = <Button variant="outline-danger" className="me-2"
                                  onClick={() => pauseAircraft(aircraft.callsign)}
            ><FontAwesomeIcon icon={faPause} /></Button>
        }
        return (
            <>
                {pauseButton}
                {aircraft.simState.simRate}x
            </>
        )
    }

    getArmedModes = (armedModes) => {
        if (!armedModes){
            return "";
        }
        let armedStr = "";
        for (const armedMode of armedModes){
            armedStr += `${armedMode} `;
        }

        return armedStr;
    }

    getFma = (aircraft) => {
        return <>
            <Row>

            </Row>
            <Row>
                <Col className={"fma-active-conv"}>{aircraft.autopilot.currentThrustMode}</Col>
                <Col className={"fma-active-conv"}>{aircraft.autopilot.currentLateralMode}</Col>
                <Col className={"fma-active-conv"}>{aircraft.autopilot.currentVerticalMode}</Col>
            </Row>
            <Row>
                <Col className={"fma-armed"}>{this.getArmedModes(aircraft.autopilot.armedThrustModes)}</Col>
                <Col className={"fma-armed"}>{this.getArmedModes(aircraft.autopilot.armedLateralModes)}</Col>
                <Col className={"fma-armed"}>{this.getArmedModes(aircraft.autopilot.armedVerticalModes)}</Col>
            </Row>
        </>
    }



    getAircraftTable = () => {
        return this.state.aircraftList.map((aircraft) => {
            return <tr key={aircraft.callsign}>
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
                    <div className={"pfd-measured"}></div>
                </td>
                <td>{this.getFma(aircraft)}</td>
                <td>{round(aircraft.position.pitch, 1)}</td>
                <td>{round(aircraft.position.bank, 2)}</td>
                <td>{round(aircraft.thrustLeverPos, 2)}</td>
                <td>{`${round(aircraft.position.altimeterSetting_hPa)}hPa`}</td>
                <td>{`${round(aircraft.position.windDirection)} @ ${round(aircraft.position.windSpeed)}kts`}</td>
                <td>{aircraft.fms.asString}</td>
            </tr>
        })
    }

    render() {
        return (
            <>
                <ButtonToolbar className={"mb-2"}>
                    {this.getSimStateActions()}
                </ButtonToolbar>
                <Table striped bordered hover size={"sm"}>
                    <thead>
                    <tr>
                        <th/>
                        <th>Callsign</th>
                        <th>Connection</th>
                        <th>Heading</th>
                        <th>Airspeed</th>
                        <th>Altitude</th>
                        <th>V/S</th>
                        <th>FPA</th>
                        <th>FMA</th>
                        <th>Pitch</th>
                        <th>Bank</th>
                        <th>Thrust</th>
                        <th>Baro</th>
                        <th>Wind</th>
                        <th>Route</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.getAircraftTable()}
                    </tbody>
                </Table>
            </>
        )
    }
}