import React, {Component} from "react";
import {
    getAircraftList,
    getSimState,
    removeAllAircraft, setAircraftSimState, setSimState,
} from "../../actions/aircraft_actions";
import {round, wait} from "../../actions/utilities";
import {Button, ButtonToolbar, Col, FormControl, InputGroup, Row, Table} from "react-bootstrap";

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
        //this.pollForAircraft();
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
            await wait(500);
        }
    }

    getTimeStr = (ms) => {
        let secs = Math.floor(ms / 1000);
        let mins = Math.floor(secs / 60);
        secs -= (mins * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateSimState = async (newState) => {
        const updatedState = await setSimState(newState);
        this.setState({
            simState: updatedState
        });
    }

    getSimStateActions = () => {
        const {simState} = this.state;
        let pauseButton;
        if (simState.paused){
            pauseButton = <Button variant="outline-success" className="me-2"
                                  onClick={() => this.updateSimState({
                                      paused: false,
                                      simRate: simState.simRate
                                  })}
            >Unpause All</Button>;
        } else {
            pauseButton = <Button variant="outline-info" className="me-2"
                                  onClick={() => this.updateSimState({
                                      paused: true,
                                      simRate: simState.simRate
                                  })}
            >Pause</Button>
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
                        onChange={(e) => {
                            let num = Number(e.target.value);
                            console.log(e.target.value);
                            console.log(num);
                            if (!isNaN(num) && num >= 0.1) {
                                this.updateSimState({
                                    paused: simState.paused,
                                    simRate: Number(e.target.value)
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
                <Button variant="danger" className="me-2" onClick={() => removeAllAircraft()}>Delete All</Button>
            </>
        )
    }

    getAircraftActions = (aircraft) => {
        let pauseButton;
        if (aircraft.simState.paused){
            pauseButton = <Button variant="outline-success" className="me-2"
                                  onClick={() => setAircraftSimState(aircraft.callsign, {
                                      paused: false,
                                      simRate: aircraft.simState.simRate
                                  })}
            >Unpause</Button>;
        } else {
            pauseButton = <Button variant="outline-info" className="me-2"
                                  onClick={() => setAircraftSimState(aircraft.callsign, {
                                      paused: true,
                                      simRate: aircraft.simState.simRate
                                  })}
            >Pause</Button>
        }
        return (
            <>
                {pauseButton}
                {aircraft.simState.simRate}x
            </>
        )
    }

    getAircraftTable = () => {
        return this.state.aircraftList.map((aircraft) => {
            return <tr key={aircraft.callsign}>
                <td>{this.getAircraftActions(aircraft)}</td>
                <td>{aircraft.callsign}</td>
                <td>{aircraft.connectionStatus} {aircraft.connectionStatus === "WAITING" ? this.getTimeStr(aircraft.delayMs) + "min" : ""}</td>
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
                <ButtonToolbar className={"mb-2"}>
                    {this.getSimStateActions()}
                </ButtonToolbar>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th/>
                        <th>Callsign</th>
                        <th>Connection</th>
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