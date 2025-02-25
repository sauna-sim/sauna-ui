import React from "react";
import { useSelector } from "react-redux";
import { AircraftRow } from "./aircraft_row.jsx";

export const AircraftPage = ({ }) => {
    const aircraftList = useSelector(state => state.aircraftList);

    return (
        <div className={"p-2 h-full overflow-auto"}>
            <h2 className="text-2xl">Aircraft</h2>
            <table className={"w-full mt-2 border-gray-700"}>
                <thead className={"border-inherit"}>
                    <tr className="[&>th]:p-2 border-b-1 border-inherit">
                        <th />
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
                        <th />
                    </tr>
                </thead>
                <tbody className={"border-inherit"}>
                    {aircraftList.map(callsign => <AircraftRow key={callsign} callsign={callsign} />)}
                </tbody>
            </table>
        </div>
    )
}