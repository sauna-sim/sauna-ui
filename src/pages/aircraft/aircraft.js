import React, {Component} from "react";
import {getAircraftList, pauseAllAircraft, removeAllAircraft, unpauseAllAircraft} from "../../actions/aircraft_actions";
import {round, wait} from "../../actions/utilities";
import {Button, ButtonToolbar, Table} from "react-bootstrap";

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
            await wait(1000);
        }
    }

    getAircraftTable = () => {
        return this.state.aircraftList.map((aircraft) => {
            return <tr key={aircraft.callsign}>
                <td>{aircraft.callsign}</td>
                <td>{aircraft.connectionStatus} {aircraft.connectionStatus === "WAITING" ? aircraft.delayMs : ""}</td>
                <td>{aircraft.paused ? "Paused" : "Unpaused"}</td>
                <td>{round(aircraft.position.heading_Mag)}</td>
                <td>{round(aircraft.position.indicatedAirSpeed)}</td>
                <td>{round(aircraft.position.indicatedAltitude)}</td>
                <td>{`${round(aircraft.position.altimeterSetting_hPa)}hPa`}</td>
                <td>{`${round(aircraft.position.windDirection)} @ ${round(aircraft.position.windSpeed)}kts`}</td>
                <td>{aircraft.control.currentLateralModeStr}</td>
                <td>{aircraft.control.armedLateralModeStr}</td>
                <td>{aircraft.control.currentVerticalModeStr}</td>
                <td>{aircraft.control.armedVerticalModesStr}</td>
                <td>{aircraft.control.fms.asString}</td>
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
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Callsign</th>
                        <th>Connection</th>
                        <th>Paused</th>
                        <th>Heading (Magnetic)</th>
                        <th>Airspeed (KIAS)</th>
                        <th>Altitude (ft)</th>
                        <th>Altimeter Setting</th>
                        <th>Wind</th>
                        <th>Lateral Mode</th>
                        <th>Armed Lateral Mode</th>
                        <th>Vertical Mode</th>
                        <th>Armed Vertical Mode</th>
                        <th>FMS Route</th>
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