import React, { useEffect, useRef, useState } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getAircraftList } from "../../actions/aircraft_actions";
import { wait } from "../../actions/utilities";
import TargetMarkerPng from "../../assets/images/TargetMarker.png";

export const MapLibre = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const aircraftPoll = useRef(null);
    const zoom = 2;
    const [center, setCenter] = useState({ lat: 0, lon: 0 });
    const [aircrafts, setAircrafts] = useState([]);

    const mapStyle = {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
                maxzoom: 19
            },
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm'
            },
        ],
        sky: {}
    }

    useEffect(() => {
        if (map.current) return; // stops map from intializing more than once

        console.log(maplibregl.getWorkerUrl());
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            center: [center.lon, center.lat],
            zoom: zoom,
            style: mapStyle,
            maxPitch: 85
        });

        map.current.addControl(
            new maplibregl.NavigationControl({
                visualizePitch: true,
                showZoom: true,
                showCompass: true
            })
        );

        map.current.on('load', async () => {
            const targetMarkerImg = await map.current.loadImage(TargetMarkerPng);

            map.current.addImage('target-marker', targetMarkerImg.data);

            map.current.addSource('aircrafts', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': []
                }
            });
            map.current.addLayer({
                'id': 'aircrafts',
                'type': 'symbol',
                'source': 'aircrafts',
                'layout': {
                    'icon-image': 'target-marker',
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-overlap': 'always',
                    'icon-ignore-placement': true
                }
            });
        });

        return () => map.current = null;
    }, [center, zoom]);

    useEffect(() => {
        const pollFunc = async () => {
            aircraftPoll.current = setInterval(async () => {
                try {
                    const aircraftList = await getAircraftList(true);

                    if (center.lat === 0 && center.lon === 0 && aircraftList.length > 0) {
                        setCenter({
                            lat: aircraftList[0].position.latitude.degrees,
                            lon: aircraftList[0].position.longitude.degrees
                        });
                    }

                    setAircrafts(aircraftList);
                } catch (e) {
                    console.log(e);
                }
            }, 1000)
        };

        pollFunc();

        return () => clearInterval(aircraftPoll.current);
    }, [center, setCenter, setAircrafts]);

    console.log(aircrafts);
    const acftPoints = aircrafts.map((acft) => {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [acft.position.longitude.degrees, acft.position.latitude.degrees]
            },
            "properties": {
                'bearing': acft.position.track_True.degrees
            }
        }
    });

    if (map.current) {
        map.current.getSource('aircrafts').setData({
            'type': 'FeatureCollection',
            'features': acftPoints
        });
    }

    return (
        <div ref={mapContainer} style={{
            height: "100vh"
        }} />
    );
};