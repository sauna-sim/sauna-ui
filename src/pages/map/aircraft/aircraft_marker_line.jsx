import React, {useEffect, useRef} from "react";
import maplibregl from "maplibre-gl";

export const AircraftMarkerLine = ({position, map, tagOffset, tagSize}) => {
    const element = useRef(null);
    const marker = useRef(null);

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
        marker.current.setLngLat([
            position.lon,
            position.lat]);
    }, [position]);

    const getEndPoint = () => {
        if (!tagOffset || !tagSize) {
            return null;
        }
        const halfWidth = tagSize.width * 0.5;
        const halfHeight = tagSize.height * 0.5;
        const minX = tagOffset.x;
        const maxX = tagOffset.x + tagSize.width;
        const minY = tagOffset.y;
        const maxY = tagOffset.y + tagSize.height;
        const midX = tagOffset.x + halfWidth;
        const midY = tagOffset.y + halfHeight;
        const x = 0;
        const y = 0;

        if ((minX < x && x < maxX) && (minY < y && y < maxY)) {
            return null;
        }

        // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
        var m = (midY - y) / (midX - x);

        if (x <= midX) { // check "left" side
            var minXy = m * (minX - x) + y;
            if (minY <= minXy && minXy <= maxY)
                return {x: minX, y: minXy};
        }

        if (x >= midX) { // check "right" side
            var maxXy = m * (maxX - x) + y;
            if (minY <= maxXy && maxXy <= maxY)
                return {x: maxX, y: maxXy};
        }

        if (y <= midY) { // check "top" side
            var minYx = (minY - y) / m + x;
            if (minX <= minYx && minYx <= maxX)
                return {x: minYx, y: minY};
        }

        if (y >= midY) { // check "bottom" side
            var maxYx = (maxY - y) / m + x;
            if (minX <= maxYx && maxYx <= maxX)
                return {x: maxYx, y: maxY};
        }

        // edge case when finding midpoint intersection: m = 0/0 = NaN
        if (x === midX && y === midY) return {x: x, y: y};

        // Should never happen :) If it does, please tell me!
        console.error("Cannot find intersection for " + [x,y]
            + " inside rectangle " + [minX, minY] + " - " + [maxX, maxY] + ".");
        return null;
    }

    const getLineSvg = () => {
        const start = {x: 0, y: 0};
        const end = getEndPoint();

        if (!end) {
            return <></>;
        }

        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);

        const style = {
            position: "absolute",
            backgroundColor: "#00000000",
            width,
            height,
        };

        if (end.x < 0) {
            style.right = "0px";
            start.x += width;
            end.x += width;
        } else {
            style.left = "0px";
        }

        if (end.y < 0) {
            style.bottom = "0px";
            start.y += height;
            end.y += height;
        } else {
            style.top = "0px";
        }

        return (
            <svg style={style}>
                <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={"white"}
                />
            </svg>
        )
    }


    return (
        <div ref={element} style={{
            zIndex: 48,
            cursor: "default"
        }}>
            {getLineSvg()}
        </div>
    );
}