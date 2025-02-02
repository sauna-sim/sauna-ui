import React from "react";
import {useSelector} from "react-redux";
import {AircraftRow} from "./aircraft_row.jsx";

export const AircraftPage = ({}) => {
    const aircraftList = useSelector(state => state.aircraftList);

    return (
        <div className={"p-2 h-full"} style={{overflow: "auto"}}>
            <h2>Aircraft</h2>
            <div
                className={"p-datatable p-component p-datatable-scrollable p-datatable-responsive-scroll flex flex-column"}
                data-showgridlines="false">
                <div className={"p-datatable-wrapper"}>
                    <table className={"p-datatable-table p-datatable-scrollable-table"}>
                        <thead className={"p-datatable-thead"}>
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
                        <tbody className={"p-datatable-tbody"}>
                        {aircraftList.map(callsign => <AircraftRow key={callsign} callsign={callsign}/>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}