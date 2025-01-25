import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import AircraftListModal from './aircraft_list_modal';
import { saveAircraftScenarioFile } from '../../../actions/tauri_actions';

export default function AircraftList({ aircrafts, setAircrafts }) {

    const [showModal, setShowModal] = React.useState(false);
    const [currentAircraft, setCurrentAircraft] = React.useState(null);

    const [fileHandle, setFileHandle] = React.useState(null);
    const [prevAircrafts, setPrevAircrafts] = useState([]);

    const testAircraft = {
        callsign: "EZY123",
        pos: { lat: 50.12345, lon: -1.23456 },
        alt: 15000,
        acftType: "A320",
        squawk: "1234",
        dep: "EGLL",
        arr: "KLAX",
        fp: { route: "DCT XYZ", fpalt: 35000, tas: 420, flightRules: "I" },
    };

    const getButtonVariant = () => {
        if(isArrayEqual() && fileHandle){
            return "success";
        }
        else {
            return "outline-warning";
        }

    }

    const isArrayEqual = () => {
        if (prevAircrafts.length !== aircrafts.length) {
            return false;
        }

        for (let i = 0; i < prevAircrafts.length; i++) {
            const prevAircraft = prevAircrafts[i];
            const aircraft = aircrafts[i];
            for(const key of Object.keys(prevAircraft)) {
                if(prevAircraft[key] !== aircraft[key])
                {
                    return false;
                }
            }
        }

        return true;
    }

    const onAircraftSubmit = (aircraft) => {
        if (currentAircraft) {
            const updatedAircrafts = aircrafts.map((a) =>
                a.callsign === currentAircraft.callsign ? aircraft : a
            );

            setAircrafts(updatedAircrafts);
        } else {
            setAircrafts([...aircrafts, aircraft]);
        }
        setCurrentAircraft(null);
    };

    const removeAircraft = (aircraft) => {
        const updatedAircrafts = aircrafts.filter(item => item !== aircraft);
        setAircrafts(updatedAircrafts);
    }

    return (
        <div>
            <Button
                variant="secondary"
                onClick={() => {
                    setCurrentAircraft(null);
                    setShowModal(true);
                }}
                style={{marginBottom: "10px"}}
            >
                Add Aircraft
            </Button>
            {showModal && (
                <AircraftListModal
                    onClose={() => setShowModal(false)}
                    onAircraftSubmit={onAircraftSubmit}
                    aircraft={currentAircraft}
                    aircrafts={aircrafts}
                />
            )}
            {!aircrafts.length < 1 && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Callsign</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Altitude</th>
                            <th>Aircraft Type</th>
                            <th>Squawk</th>
                            <th>Dep</th>
                            <th>Arr</th>
                            <th>Route</th>
                            <th>Crz Alt</th>
                            <th>Crz Tas</th>
                            <th>Flight Rules</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aircrafts.map((aircraft, index) => (
                            <tr key={index}>
                                <td>{aircraft.callsign}</td>
                                <td>{aircraft.acftType}</td>
                                <td>{aircraft.pos.lat}</td>
                                <td>{aircraft.pos.lon}</td>
                                <td>{aircraft.alt}</td>
                                <td>{aircraft.squawk}</td>
                                <td>{aircraft.dep}</td>
                                <td>{aircraft.arr}</td>
                                <td>{aircraft.fp.route}</td>
                                <td>{aircraft.fp.fpalt}</td>
                                <td>{aircraft.fp.tas}</td>
                                <td>{aircraft.fp.flightRules}</td>
                                <td className="p-2" style={{ width: "133px" }}>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setCurrentAircraft(aircraft);
                                            setShowModal(true);
                                        }}
                                        style={{ marginRight: "6px" }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            removeAircraft(aircraft);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <div className="d-flex justify-content-end">
                <Button
                    size="sm"
                    onClick={() => {
                        onAircraftSubmit(testAircraft);
                    }}
                    style={{ marginRight: "5px"}}
                >
                    Test
                </Button>

                <Button
                    variant={getButtonVariant()}
                    size="sm"
                    onClick={() => {
                        saveAircraftScenarioFile({fileHandle, setFileHandle, aircrafts});
                        setPrevAircrafts(aircrafts);
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
