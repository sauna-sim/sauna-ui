import React, {Component} from "react";
import {
    getAircraftList,
    getSimState, pauseAircraft, pauseall,
    removeAllAircraft, setAllSimRate, unpauseAircraft, unpauseall,
} from "../../actions/aircraft_actions";
import {round, wait} from "../../actions/utilities";
import {Button, ButtonToolbar, Col, FormControl, InputGroup, Row, Table} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPause, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";
import {AircraftDetail} from "./aircraft_detail";
import {connect} from "react-redux";
import {AircraftRow} from "./aircraft_row";

class AircraftPageComponent extends Component {
    constructor(props) {
        super(props);

        this.ws = null;

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
            await wait(200);
        }
    }

    getSimStateActions = () => {
        const {simState} = this.props.apiServer;
        let pauseButton;
        if (simState.paused) {
            pauseButton = <Button variant="outline-success" className="me-2"
                                  onClick={async () => {
                                      const simState = await unpauseall();
                                      this.setState({
                                          simState: simState
                                      });
                                  }}
            ><FontAwesomeIcon icon={faPlay}/></Button>;
        } else {
            pauseButton = <Button variant="outline-danger" className="me-2"
                                  onClick={async () => {
                                      const simState = await pauseall();
                                      this.setState({
                                          simState: simState
                                      });
                                  }}
            ><FontAwesomeIcon icon={faPause}/></Button>
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
                <Button variant="danger" className="me-2" onClick={() => removeAllAircraft()}><FontAwesomeIcon
                    icon={faTrash}/> All</Button>
            </>
        )
    }

    getAircraftTable = () => {
        return this.props.aircraftList.map((callsign) => <AircraftRow key={callsign} callsign={callsign} />);
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
                        <th/>
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

function mapStateToProps({aircraftList, apiServer}){
    return {
        aircraftList,
        apiServer
    }
}

export const AircraftPage = connect(mapStateToProps, null)(AircraftPageComponent);