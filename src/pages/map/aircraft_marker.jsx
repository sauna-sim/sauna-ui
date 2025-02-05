import React, {useEffect, useRef, useState} from "react";
import maplibregl from "maplibre-gl";

export const AircraftMarker = ({aircraft, icon, map, onClick, ...props}) => {
    const elementRef = useRef(null);
    const marker = useRef(null);
    const [iconData, setIconData] = useState(null);
    const [tagPosition, setTagPosition] = useState({x: 10, y: 10});
    const [tagTransform, setTagTransform] = useState(null);

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
            aircraft.position.longitude.degrees,
            aircraft.position.latitude.degrees]);
    }, [aircraft]);

    const style = {};

    if (iconData) {
        style.backgroundImage = `url('${iconData}')`;
    }

    // Tag Movement Events
    const handleMouseDown = (e) => {
        setTagTransform({
            startX: e.clientX,
            startY: e.clientY,
            x: e.clientX,
            y: e.clientY
        });
        e.preventDefault();
    }

    const handleMouseMove = (e) => {
        if (tagTransform !== null) {
            setTagTransform({...tagTransform, x: e.clientX, y: e.clientY});
            e.preventDefault();
        }
    }

    const handleMouseUp = (e) => {
        console.log("Mouse Up", e);
        if (tagTransform !== null){
            // Move tag
            setTagPosition({
                x: tagPosition.x + (tagTransform.x - tagTransform.startX),
                y: tagPosition.y + (tagTransform.y - tagTransform.startY)
            });
        }
        setTagTransform(null);
        e.preventDefault();
    }

    const handleMouseCancel = (e) => {
        console.log("Leave", e);
        setTagTransform(null);
        e.preventDefault();
    }

    const handleClick = (e) => {
        onClick(aircraft.callsign, e);
    }

    const getTag = () => {
        const style = {
            position: "absolute",
            background: "rgba(50, 50, 50, 0.25)",
            fontFamily: "var(--font-family-monospace)",
            cursor: "pointer",
            left: "0px",
            top: "0px",
            transform: `translate(${tagPosition.x}px, ${tagPosition.y}px)`,
            zIndex: 51
        };

        if (tagTransform !== null) {
            style.transform += ` translate(${tagTransform.x - tagTransform.startX}px, ${tagTransform.y - tagTransform.startY}px)`;
            style.zIndex = 53;
        }

        return <div
            className={"p-1"}
            style={style}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            onPointerCancel={handleMouseCancel}
            onPointerLeave={handleMouseUp}
            onClick={(e) => e.preventDefault()}
        >
            {aircraft.callsign}
        </div>;
    }

    const getLineToTag = () => {
        const start = {x: 0, y: 0};
        const end = {x: tagPosition.x, y: tagPosition.y};

        if (tagTransform !== null){
            end.x += (tagTransform.x - tagTransform.startX);
            end.y += (tagTransform.y - tagTransform.startY);
        }

        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);

        const style = {
            position: "absolute",
            display: "block",
            zIndex: 50,
            cursor: "default",
            width,
            height
        };

        if (end.x < 0){
            style.right = "0px";
            start.x += width;
            end.x += width;
        } else {
            style.left = "0px";
        }

        if (end.y < 0){
            style.bottom = "0px";
            start.y += height;
            end.y += height;
        } else {
            style.top = "0px";
        }

        return (
            <div style={style}>
                <svg style={{
                    position: "absolute",
                    backgroundColor: "#00000000",
                    width,
                    height,
                }}>
                    <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={"white"}
                    />
                </svg>
            </div>
        );
    }

    const getTargetSymbol = () => {
        return <div
            style={{
                position: "absolute",
                display: "block",
                transform: "translate(-50%, -50%)",
                left: "0px",
                right: "0px",
                border: "none",
                cursor: "pointer",
                padding: 0,
                height: icon.height,
                width: icon.width,
                backgroundColor: "rgba(255, 255, 255, 255)",
                zIndex: 52
            }}
            onClick={handleClick}
        />;
    }

    return <div
        ref={elementRef}
        style={{
            display: "block",
            zIndex: 0
        }}
        {...props}
    >
        {getTag()}
        {getTargetSymbol()}
        {getLineToTag()}
    </div>
}