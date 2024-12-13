import React, {useEffect, useRef, useState} from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {getAircraftList} from "../../actions/aircraft_actions";
import * as turf from "@turf/turf";
import TargetMarkerPng from "../../assets/images/TargetMarker.png";

export const MapLibre = ({features, center, zoom, rotation}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const aircraftPoll = useRef(null);
    const [aircrafts, setAircrafts] = useState([]);
    const [oldIcons, setOldIcons] = useState([]);
    const [oldLineLayers, setOldLineLayers] = useState([]);

    const mapStyle = {
        version: 8,
        sources: {
            'background-satellite': {
                'type': 'raster',
                tiles: [
                    'https://services.arcgisonline.com/ArcGis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png'
                ],
                'tileSize': 256,
                'attribution': 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }
        },
        glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        layers: [
            {
                id: 'background',
                type: 'background',
                paint: {
                    "background-color": "rgba(0,0,0,1)"
                },
                layout:  {
                    "visibility": "visible"
                }
            },
            {
                id: 'background-satellite',
                type: 'raster',
                source: 'background-satellite',
                minzoom: 0,
                maxzoom: 22,
                layout: {
                    "visibility": "none"
                }
            }
        ],
        sky: {}
    }

    useEffect(() => {
        console.log("Map Init")
        if (map.current) return; // stops map from initializing more than once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            center: [0, 0],
            zoom: 2,
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
                    'fill-opacity': 1.0,
                    'fill-outline-color': "rgba(0, 0, 0, 0)"
                },
                'filter': ['==', '$type', 'Polygon']
            });

            // Temp Icon
            const width = 4;
            const bytesPerPixel = 4;
            const data = new Uint8Array(width * width * bytesPerPixel);

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < width; y++) {
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
                    'icon-image': ['case', ['boolean', ["all", ["has", "showSymbol"], ['get', 'showSymbol']], true],
                        ["coalesce",
                            ["image", ["concat",
                                ["get", "icon"],
                                "-",
                                ["coalesce", ["get", "size"], ["get", "defaultSize"], 1],
                                "-",
                                ["coalesce", ["get", "color"], ["get", "defaultColor"], "#ffffff"]
                            ]],
                            ["image", "temp-icon"]
                        ],
                        ""
                    ],
                    'icon-overlap': 'always',
                    'icon-ignore-placement': true,
                    'text-font': [
                        'Open Sans Semibold',
                    ],
                    'text-field': ['case', ["boolean", ["all", ["has", "showText"], ['get', 'showText']], true], ['get', 'text'], ""],
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
    }, []);

    useEffect(() => {
        const pollFunc = async () => {
            aircraftPoll.current = setInterval(async () => {
                try {
                    const aircraftList = await getAircraftList(true);

                    setAircrafts(aircraftList);
                } catch (e) {
                    console.log(e);
                }
            }, 1000)
        };

        console.log("Aircraft Poll Start");
        pollFunc();

        return () => clearInterval(aircraftPoll.current);
    }, []);

    useEffect(() => {
        console.log("Aircraft Update")
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
        console.log("Features Update")
        if (map.current && map.current.getSource('scope-package')) {
            map.current.getSource('scope-package').setData({
                'type': 'FeatureCollection',
                'features': features ? features.features : []
            });

            for (const icon of oldIcons) {
                map.current.removeImage(icon);
            }

            let newIconIds = [];
            for (const icon of features ? features.icons : []) {
                newIconIds.push(icon.id);
                map.current.addImage(icon.id, icon);
            }

            setOldIcons(newIconIds);

            // Line Layers
            for (const oldLayer of oldLineLayers) {
                map.current.removeLayer(oldLayer);
            }

            console.log(features.lineTypes)

            let newLayerIds = [];
            let defaultLayerFilters = [];
            for (const [i, key] of Object.keys(features.lineTypes).entries()) {
                const value = [key, features.lineTypes[key]];
                defaultLayerFilters.push(['!=', 'style', value[0]]);
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

                if (value[1]) {
                    layer.paint['line-dasharray'] = ["literal", value[1]];
                }

                layer.filter = [
                    'all',
                    ['==', '$type', 'LineString'],
                    ['has', 'style'],
                    ['==', 'style', value[0]]
                ];

                map.current.addLayer(layer);
                newLayerIds.push(`scope-package-lines-${i}`);
            }

            // Default line
            const defaultLineLayer = {
                'id': `scope-package-linesdefault`,
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
                filter: [
                    'all',
                    ['==', '$type', 'LineString'],
                    [
                        'any',
                        ['!has', 'style'],
                        ['all', ...defaultLayerFilters]
                    ]
                ]
            };

            map.current.addLayer(defaultLineLayer);
            newLayerIds.push(`scope-package-linesdefault`);

            setOldLineLayers(newLayerIds);

            // Background
            if (features.background === "Satellite"){
                map.current.setLayoutProperty("background", "visibility", "none");
                map.current.setLayoutProperty("background-satellite", "visibility", "visible");
            } else if (features.background.Color){
                map.current.setLayoutProperty("background", "visibility", "visible");
                map.current.setLayoutProperty("background-satellite", "visibility", "none");
                map.current.setPaintProperty("background", "background-color", features.background.Color);
            } else {
                map.current.setLayoutProperty("background", "visibility", "visible");
                map.current.setLayoutProperty("background-satellite", "visibility", "none");
                map.current.setPaintProperty("background", "background-color", "#000000");
            }

            console.log(features);
        }
    }, [features]);

    useEffect(() => {
        console.log("Center/Zoom update")
        if (map.current) {
            const top = turf.destination([center.lon, center.lat], zoom * 0.5, 360, {units: "meters"});
            const bottom = turf.destination([center.lon, center.lat], zoom * 0.5, 180, {units: "meters"});
            console.log(top, bottom, center, rotation);
            const camera = map.current.cameraForBounds([top.geometry.coordinates, bottom.geometry.coordinates]);
            if (camera) {
                map.current.easeTo({
                    ...camera,
                    bearing: rotation
                });
            }
        }
    }, [center, zoom])

    useEffect(() => {
         console.log("Rotation update");
         if (map.current){
             if (map.current.isMoving()) {
                 map.current.once('moveend', () => {
                     map.current.rotateTo(rotation);
                 })
             } else {
                 map.current.rotateTo(rotation);
             }
         }
    }, [rotation]);

    return (
        <div ref={mapContainer} style={{
            height: "100%"
        }}/>
    );
};