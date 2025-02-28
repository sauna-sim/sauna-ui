import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import maplibregl from "maplibre-gl";
import {round} from "../../../actions/utilities.js";

export const AircraftMarkerTag = ({aircraft, map, offset, onOffsetChange, onSizeChange}) => {
    const element = useRef(null);
    const marker = useRef(null);
    const [clientStart, setClientStart] = useState(null);
    const [startOffset, setStartOffset] = useState(null);
    const threshold = 5; // Movement sensitivity in pixels

    useEffect(() => {
        marker.current = new maplibregl.Marker({element: element.current})
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
                marker.current = null;
            }
        }
    }, []);

    useEffect(() => {
        marker.current.setLngLat([
            aircraft.position.longitude.degrees,
            aircraft.position.latitude.degrees]);
    }, [aircraft]);

    const tagRef = useCallback((node) => {
        if (node !== null) {
            const resizeObserver = new ResizeObserver(() => {
                const {height, width} = node.getBoundingClientRect();
                onSizeChange({height, width});
            });

            resizeObserver.observe(node);
        }
    }, []);

    // Tag Movement Events
    const handleMouseDown = (e) => {
        setClientStart({
            x: e.clientX,
            y: e.clientY
        });
        e.preventDefault();
    }

    const handleMouseMove = (e) => {
        if (clientStart !== null) {
            if (startOffset === null) {
                // Check if threshold has been passed
                const dist = Math.sqrt(
                    Math.pow(e.clientX - clientStart.x, 2) +
                    Math.pow(e.clientY - clientStart.y, 2));

                if (dist > threshold) {
                    setStartOffset(offset);
                    onOffsetChange({
                        x: offset.x + (e.clientX - clientStart.x),
                        y: offset.y + (e.clientY - clientStart.y)
                    });
                }
            } else {
                onOffsetChange({
                    x: startOffset.x + (e.clientX - clientStart.x),
                    y: startOffset.y + (e.clientY - clientStart.y)
                });
            }

            e.preventDefault();
        }
    }

    const handleMouseUp = (e) => {
        if (clientStart !== null && startOffset !== null) {
            onOffsetChange({
                x: startOffset.x + (e.clientX - clientStart.x),
                y: startOffset.y + (e.clientY - clientStart.y)
            });
        }

        setClientStart(null);
        setStartOffset(null);
        e.preventDefault();
    }

    const handleMouseCancel = (e) => {
        if (clientStart !== null && startOffset !== null) {
            onOffsetChange({
                x: startOffset.x,
                y: startOffset.y,
            });
        }

        setClientStart(null);
        setStartOffset(null);
        e.preventDefault();
    }

    const style = {
        cursor: "pointer",
        left: `${offset.x}px`,
        top: `${offset.y}px`,
        zIndex: 49,
    };

    if (clientStart !== null && startOffset !== null) {
        style.zIndex = 51;
    }

    return <div
        ref={element}
        style={style}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerCancel={handleMouseCancel}
        onPointerLeave={handleMouseUp}
        onClick={(e) => e.preventDefault()}
    >
        <div ref={tagRef} className={"p-1 font-mono"} style={{
            position: "absolute",
            left: 0,
            top: 0,
            background: "rgba(50, 50, 50, 0.25)",
            lineHeight: "1rem",
            whiteSpace: "nowrap",
        }}>
            {aircraft.callsign}{' '}{aircraft.aircraftType}<br/>
            {String(round(aircraft.position.indicatedAltitude.feet / 100)).padStart(3, '0')}{' '}
            {String(round(aircraft.position.groundSpeed.knots / 10)).padStart(2, '0')}{' '}
            {aircraft.fms?.arrivalAirport?.identifier}
        </div>
    </div>;
}