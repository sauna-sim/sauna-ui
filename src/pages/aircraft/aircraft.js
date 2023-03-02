import React, {Component} from "react";
import {getAircraftList, pauseAllAircraft, removeAllAircraft, unpauseAllAircraft} from "../../actions/aircraft_actions";
import {round, wait} from "../../actions/utilities";
import {Button, ButtonToolbar, Col, Row, Table} from "react-bootstrap";

export class AircraftPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            aircraftList: [],
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

                this.setState({
                    aircraftList: aircraftList
                });
            } catch (e) {
                console.log(e);
            }
            await wait(200);
        }
    }

    getArmedModes = (armedModes) => {
        if (!armedModes){
            return "";
        }
        let armedStr = "";
        for (const armedMode in armedModes){
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
                <td>{aircraft.callsign}</td>
                <td>
                    <div>{aircraft.connectionStatus}</div>
                    <div>{aircraft.paused ? "Paused" : "Unpaused"}</div>
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

            </tr>
        })
    }

    render() {
        return (
            <>
                <h3>Aircraft</h3>
                <ButtonToolbar className={"mb-2"}>
                    <Button variant="outline-info" className="me-2" onClick={() => pauseAllAircraft()}>Pause All</Button>
                    <Button variant="outline-success" className="me-2" onClick={() => unpauseAllAircraft()}>Unpause All</Button>
                    <Button variant="danger" className="me-2" onClick={() => removeAllAircraft()}>Delete All</Button>
                </ButtonToolbar>
                <Table striped bordered hover size={"sm"}>
                    <thead>
                    <tr>
                        <th>Callsign</th>
                        <th>Status</th>
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