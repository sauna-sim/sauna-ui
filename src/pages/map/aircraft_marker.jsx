import React, {useEffect, useRef, useState} from "react";
import maplibregl from "maplibre-gl";

export const AircraftMarker = ({aircraft, icon, map, onClick, ...props}) => {
    const elementRef = useRef(null);
    const marker = useRef(null);
    const [iconData, setIconData] = useState(null);

    useEffect(() => {
        marker.current = new maplibregl.Marker({element: elementRef.current})
            .setLngLat([
                aircraft.position.longitude.degrees,
                aircraft.position.latitude.degrees])
            .addTo(map);

        return () => {
            try {
                if (marker.current) {
                    marker.current.remove();
                }
            } catch (e) {
                console.log(e);
            } finally {
                marker.current  = null;
            }
        }
    }, []);

    useEffect(() => {
        // Icon
        setIconData(icon.url);
    }, [icon]);

    useEffect(() => {
        marker.current.setLngLat([
            aircraft.position.longitude.degrees,
            aircraft.position.latitude.degrees]);
    }, [aircraft]);

    const style = {
        display: "block",
        border: "none",
        cursor: "pointer",
        padding: 0,
        height: icon.height,
        width: icon.width,
        backgroundColor: "rgba(255, 255, 255, 255)"
    };

    if (iconData) {
        style.backgroundImage = `url('${iconData}')`;
    }

    return <div
        ref={elementRef}
        style={style}
        onClick={(e) => onClick(aircraft.callsign, e)}
        {...props}
    >
        {aircraft.callsign}
    </div>
}