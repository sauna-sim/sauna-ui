import React, { useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MapLibre = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const lng = 0;
    const lat = 0;
    const zoom = 14;

    useEffect(() => {
        if (map.current) return; // stops map from intializing more than once

        console.log(maplibregl.getWorkerUrl());
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://demotiles.maplibre.org/style.json`,
          center: [lng, lat],
          zoom: zoom
        });

        return () => {
            map.remove();
        }
      }, [lng, lat, zoom]);
    
    return (
        <div ref={mapContainer} />
    );
};