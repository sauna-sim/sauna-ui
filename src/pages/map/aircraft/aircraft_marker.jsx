import React, {useState} from "react";
import {AircraftMarkerSymbol} from "./aircraft_marker_symbol.jsx";
import {AircraftMarkerTag} from "./aircraft_marker_tag.jsx";
import {AircraftMarkerLine} from "./aircraft_marker_line.jsx";

export const AircraftMarker = ({aircraft, icon, map, onClick}) => {
    const [tagPosition, setTagPosition] = useState({x: 10, y: 10});
    const [tagSize, setTagSize] = useState(null);

    const handleClick = (e) => {
        onClick(aircraft.callsign, e);
        e.preventDefault();
    }

    return (
        <div>
            <AircraftMarkerSymbol
                icon={icon}
                position={{
                    lat: aircraft.position.latitude.degrees,
                    lon: aircraft.position.longitude.degrees
                }}
                onClick={handleClick}
                map={map}/>
            <AircraftMarkerTag
                aircraft={aircraft}
                map={map}
                offset={tagPosition}
                onOffsetChange={setTagPosition}
                onSizeChange={setTagSize}
            />
            <AircraftMarkerLine
                position={{
                    lat: aircraft.position.latitude.degrees,
                    lon: aircraft.position.longitude.degrees
                }}
                map={map}
                tagOffset={tagPosition}
                tagSize={tagSize}
            />
        </div>
    );
}