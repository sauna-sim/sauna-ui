import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import AircraftListModal from './aircraft_list_modal';

export default function AircraftList({ aircrafts, setAircrafts }) {
    const [showModal, setShowModal] = React.useState(false);
    const [currentAircraft, setCurrentAircraft] = React.useState(null);

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
            >
                Add Aircraft
            </Button>
            {showModal && (
                <AircraftListModal
                    onClose={() => setShowModal(false)}
                    onAircraftSubmit={onAircraftSubmit}
                    aircraft={currentAircraft}
                />
            )}
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
                            <td className="p-2" style={{width: "133px" }}>                               
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
        </div>
    );
}
