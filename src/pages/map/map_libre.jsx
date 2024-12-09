import React, {useEffect, useRef, useState} from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {getAircraftList} from "../../actions/aircraft_actions";
import {wait} from "../../actions/utilities";
import TargetMarkerPng from "../../assets/images/TargetMarker.png";

export const MapLibre = ({features = []}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const aircraftPoll = useRef(null);
    const zoom = 2;
    const [center, setCenter] = useState({lat: 0, lon: 0});
    const [aircrafts, setAircrafts] = useState([]);
    let oldIcons = [];

    const mapStyle = {
        version: 8,
        sources: {
        },
        glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        layers: [
            {
                id: 'empty',
                type: 'background',
                paint: {
                    "background-color": "rgba(0,0,0,1)"
                },
            }
        ],
        sky: {}
    }

    useEffect(() => {
        if (map.current) return; // stops map from initializing more than once

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
            //sdf

            map.current.addSource('scope-package', {
                'type': 'geojson',
                //'tolerance': 0,
                'data': {
                    'type': 'FeatureCollection',
                    'features': []
                }
            });

            map.current.addLayer({
                'id': `scope-package-polygons`,
                'type': 'fill',
                'source': 'scope-package',
                'paint': {
                    'fill-color': [
                        'coalesce',
                        ['get', 'color'],
                        ['get', 'defaultColor'],
                        '#ffffff'
                    ],
                    'fill-opacity': 1.0
                },
                'filter': ['==', '$type', 'Polygon']
            });

            const lineStyles = [
                ["Solid", null],
                ["Dash", [12, 4]],
                ["Dot", [4, 4]]
            ];

            for (const [i, value] of lineStyles.entries()) {
                const layer = {
                    'id': `scope-package-lines-${i}`,
                    'type': 'line',
                    'source': 'scope-package',
                    'paint': {
                        'line-color': [
                            'coalesce',
                            ['get', 'color'],
                            ['get', 'defaultColor'],
                            '#ffffff'
                        ],
                        'line-width': [
                            'coalesce',
                            ['get', 'defaultLineWidth'],
                            1
                        ],
                    },
                };

                if (value[1]){
                    layer.paint['line-dasharray'] = ["literal", value[1]];
                }

                if (i === 0){
                    layer.filter = ['all', ['==', '$type', 'LineString'], ['any', ['!has', 'defaultLineStyle'], ['==', 'defaultLineStyle', value[0]]]]
                } else {
                    layer.filter = ['all', ['==', '$type', 'LineString'], ['has', 'defaultLineStyle'],  ['==', 'defaultLineStyle', value[0]]]
                }
                map.current.addLayer(layer);
            }

            // Temp Icon
            const width = 4;
            const bytesPerPixel = 4;
            const data = new Uint8Array(width * width * bytesPerPixel);

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < width; y++){
                    const offset = (y * width + x) * bytesPerPixel;
                    data[offset + 0] = 255;
                    data[offset + 1] = 255;
                    data[offset + 2] = 255;
                    data[offset + 3] = 255;
                }
            }

            map.current.addImage('temp-icon', {width, height: width, data});

            map.current.addLayer({
                'id': `scope-package-points`,
                'type': 'symbol',
                'source': 'scope-package',
                'layout': {
                    'icon-image': ["coalesce",
                        ["image", ["concat",
                            ["get", "icon"],
                            "-",
                            ["coalesce", ["get", "size"], ["get", "defaultSize"], 1],
                            "-",
                            ["coalesce", ["get", "color"], ["get", "defaultColor"], "#ffffff"]
                        ]],
                        ["image", "temp-icon"]
                    ],
                    'icon-overlap': 'always',
                    'icon-ignore-placement': true,
                    'text-font': [
                        'Open Sans Semibold',
                    ],
                    'text-field': ['case', ["boolean", ['get', 'showText'], true], ['get', 'text'], ""],
                    'text-size': ['+', 10, ['coalesce', ['get', 'textSize'], 0]],
                    'text-justify': 'auto',
                    'text-overlap': 'always',
                    'text-anchor': ["match", ['coalesce', ['get', 'textAlign'], ['get', 'defaultTextAlign'], "CenterCenter"],
                        "CenterCenter", "center",
                        "CenterLeft", "right",
                        "CenterRight", "left",
                        "TopCenter", "bottom",
                        "BottomCenter", "top",
                        "TopLeft", "bottom-right",
                        "TopRight", "bottom-left",
                        "BottomLeft", "top-right",
                        "BottomRight", "top-left",
                        "center"
                    ],
                    'text-offset': ["match", ['coalesce', ['get', 'textAlign'], ['get', 'defaultTextAlign'], "CenterCenter"],
                        "CenterCenter", ["literal", [0, 0]],
                        "CenterLeft", ["literal", [1, 0]],
                        "CenterRight", ["literal", [1, 0]],
                        "TopCenter", ["literal", [0, 1]],
                        "BottomCenter", ["literal", [0, 1]],
                        "TopLeft", ["literal", [1, 1]],
                        "TopRight", ["literal", [1, 1]],
                        "BottomLeft", ["literal", [1, 1]],
                        "BottomRight", ["literal", [1, 1]],
                        ["literal", [0, 0]]
                    ]
                },
                'paint': {
                    'text-color': [
                        'coalesce',
                        ['get', 'textColor'],
                        ['get', 'defaultTextColor'],
                        '#ffffff'
                    ]
                },
                'filter': ['==', '$type', 'Point']
            });

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
                'paint': {
                    'text-color': '#ffffff',
                },
                'layout': {
                    'text-field': ['get', 'callsign'],
                    'text-font': [
                        'Open Sans Semibold',
                    ],
                    'text-size': 12,
                    'text-variable-anchor-offset': [
                        "top-left", [1, 1.25],
                        "left", [1, 0],
                        "bottom-left", [1, 1.25],
                        "bottom", [0, 1.25],
                        "bottom-right", [1, 1.25],
                        "right", [1, 0],
                        "top-right", [1, 1.25],
                        "top", [0, 1.25],
                    ],
                    'text-justify': 'auto',
                    'text-overlap': 'cooperative',
                    'icon-image': ["coalesce",
                        ["image", "icon-symbol-aircraft_corr_prim_s"],
                        ["image", 'target-marker']
                    ],
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

    useEffect(() => {
        //console.log(aircrafts);
        const acftPoints = aircrafts.map((acft) => {
            return {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [acft.position.longitude.degrees, acft.position.latitude.degrees, acft.position.trueAltitude.meters]
                },
                "properties": {
                    'callsign': acft.callsign,
                    'bearing': acft.position.track_True.degrees
                }
            }
        });

        if (map.current && map.current.getSource('aircrafts')) {
            map.current.getSource('aircrafts').setData({
                'type': 'FeatureCollection',
                'features': acftPoints
            });
        }
    }, [aircrafts]);

    useEffect(() => {
        if (map.current && map.current.getSource('scope-package')){
            map.current.getSource('scope-package').setData({
                'type': 'FeatureCollection',
                'features': features.features
            });

            for (const icon of oldIcons){
                map.current.removeImage(icon);
            }

            let newIconIds = [];
            for (const icon of features.icons){
                newIconIds.push(icon.id);
                map.current.addImage(icon.id, icon);
            }

            oldIcons = newIconIds;

            console.log(features);
        }
    }, [features]);

    return (
        <div ref={mapContainer} style={{
            height: "100%"
        }}/>
    );
};