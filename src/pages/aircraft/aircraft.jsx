import React from "react";
import {pauseall, removeAllAircraft, setAllSimRate, unpauseall,} from "../../actions/aircraft_actions";
import {Button, ButtonToolbar, FormControl, InputGroup, Table} from "react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPause, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useSelector} from "react-redux";
import {AircraftRow} from "./aircraft_row";

export const AircraftPage = ({}) => {
    const aircraftList = useSelector(state => state.aircraftList);
    const apiServer = useSelector(state => state.apiServer);

    const getSimStateActions = () => {
        const {simState} = apiServer;
        let pauseButton;
        if (simState.paused) {
            pauseButton = <Button variant="outline-success" className="me-2"
                                  onClick={unpauseall}
            ><FontAwesomeIcon icon={faPlay}/></Button>;
        } else {
            pauseButton = <Button variant="outline-danger" className="me-2"
                                  onClick={pauseall}
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
                                await setAllSimRate(Number(e.target.value));
                            }
                        }}
                        required
                        placeholder="1.0"
                        aria-label="Sim Rate"
                        aria-describedby="global-simrate-addon2"
                    />
                    <InputGroup.Text id="global-simrate-addon2">x</InputGroup.Text>
                </InputGroup>
                <Button variant="danger" className="me-2" onClick={removeAllAircraft}><FontAwesomeIcon
                    icon={faTrash}/> All</Button>
            </>
        )
    }

    const getAircraftTable = () => {
        return aircraftList.map((callsign) => <AircraftRow key={callsign} callsign={callsign}/>);
    }

    return (
        <>
            <ButtonToolbar className={"mb-2"}>
                {getSimStateActions()}
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
                {getAircraftTable()}
                </tbody>
            </Table>
        </>
    )
}