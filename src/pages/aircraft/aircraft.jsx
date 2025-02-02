import React from "react";
import {useSelector} from "react-redux";
import {AircraftRow} from "./aircraft_row.jsx";

export const AircraftPage = ({}) => {
    const aircraftList = useSelector(state => state.aircraftList);

    return (
        <div className={"p-2"}>
            <h2>Aircraft</h2>
            <table>
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
                {aircraftList.map(callsign => <AircraftRow key={callsign} callsign={callsign}/>)}
                </tbody>
            </table>
        </div>
    )
}