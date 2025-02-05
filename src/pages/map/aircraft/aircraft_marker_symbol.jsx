import React, {useEffect, useRef, useState} from "react";
import maplibregl from "maplibre-gl";

export const AircraftMarkerSymbol = ({position, icon, map, onClick}) => {
    const element = useRef(null);
    const marker = useRef(null);
    const [iconData, setIconData] = useState(null);

    useEffect(() => {
        marker.current = new maplibregl.Marker({element: element.current})
            .setLngLat([
                position.lon,
                position.lat])
            .addTo(map);

        return () => {
            try {
                if (marker.current) {
                    marker.current.remove();
                }
            } catch (e) {
                console.log(e);
            } finally {
                marker.current = null;
            }
        }
    }, []);

    useEffect(() => {
        // Icon
        setIconData(icon.url);
    }, [icon]);

    useEffect(() => {
        marker.current.setLngLat([
            position.lon,
            position.lat]);
    }, [position]);

    const style = {
        display: "block",
        border: "none",
        cursor: "pointer",
        padding: 0,
        height: icon.height,
        width: icon.width,
        backgroundColor: "rgba(255, 255, 255, 255)",
        zIndex: 50
    };

    if (iconData) {
        style.backgroundImage = `url('${iconData}')`;
    }

    return <div
        ref={element}
        style={style}
        onClick={onClick}
    />;
}