import React, {Component} from "react";
import {getAircraftList, pauseAllAircraft, unpauseAllAircraft} from "../../actions/aircraft_actions";
import {round, wait} from "../../actions/utilities";

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
                <td>{aircraft.connectionStatus}</td>
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
                <button onClick={() => pauseAllAircraft()}>Pause All</button>
                <button onClick={() => unpauseAllAircraft()}>Unpause All</button>
                <table>
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
                </table>
            </>
        )
    }
}