import {createLayerComponent} from "@react-leaflet/core";
import L from 'leaflet';
import 'leaflet-semicircle';

export function createLeafletElement(LeafletComponent) {
    return ({ position, ...options }, context) => {
        const instance = new LeafletComponent(position, options);
        return {
            instance,
            context: { ...context, overlayContainer: instance },
        };
    };
}

export function updateLeafletElement(
    layer,
    { startAngle, stopAngle, position, radius, ...options },
    prevProps,
) {
    layer.setStyle(options);

    if (prevProps.startAngle !== startAngle) {
        layer.setStartAngle(startAngle);
    }
    if (prevProps.stopAngle !== stopAngle) {
        layer.setStopAngle(stopAngle);
    }
    if (prevProps.radius !== radius) {
        layer.setRadius(radius);
    }
    if (
        !prevProps.position.every(
            (v, i) => Math.abs(v - position[i]) < Number.EPSILON,
        )
    ) {
        layer.setLatLng(position);
    }
}

export const LeafletSemicircle = createLayerComponent(
    createLeafletElement(L.SemiCircle),
    updateLeafletElement,
);