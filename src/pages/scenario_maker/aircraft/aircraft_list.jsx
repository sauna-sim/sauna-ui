import React from 'react';
import Table from 'react-bootstrap/Table';

export default function AircraftList({aircrafts, setAircrafts}) {
    
    return (
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>Callsign</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Altitude</th>
                    <th>Aircraft Type</th>
                    <th>Squawk</th>
                    <th>Dest</th>
                    <th>Arr</th>
                    <th>Route</th>
                    <th>Crz Alt</th>
                    <th>Crz Tas</th>
                    <th>Flight Rules</th>
                </tr>
            </thead>
            <tbody>
                {aircrafts.map((aircraft, index) => (
                    <tr key={index}>
                        <td>{aircraft.callsign}</td>
                        <td>{aircraft.pos.lat}</td>
                        <td>{aircraft.pos.lon}</td>
                        <td>{aircraft.alt}</td>
                        <td>{aircraft.acftType}</td>
                        <td>{aircraft.squawk}</td>
                        <td>{aircraft.dest}</td>
                        <td>{aircraft.arr}</td>
                        <td>{aircraft.fp.route}</td>
                        <td>{aircraft.fp.alt}</td>
                        <td>{aircraft.fp.tas}</td>
                        <td>{aircraft.fp.flightRules}</td>
                    </tr>
                ))}                
            </tbody>
        </Table>
    );
}