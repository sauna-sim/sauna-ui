import React, {useEffect, useRef, useState} from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {getAircraftList} from "../../actions/aircraft_actions";
import * as turf from "@turf/turf";
import TargetMarkerPng from "../../assets/images/TargetMarker.png";
import {AircraftMarker} from "./aircraft_marker.jsx";
import {makeIcon} from "./map_icon.js";

export const MapLibre = ({features, center, zoom, rotation}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const aircraftPoll = useRef(null);
    const [aircrafts, setAircrafts] = useState([]);
    const [oldIcons, setOldIcons] = useState([]);
    const [oldLineLayers, setOldLineLayers] = useState([]);
    const defaultIcons = useRef(null);
    const aircraftOptions = useRef(new Map());

    // Default Icons
    const getDefaultIcons = () => {
        const tempIconDef = [
            {Polygon: [[-2, -2], [-2, 2], [2, 2], [2, -2]]},
            {Line: {start: [-2, -2], end: [-2, 2]}},
            {Line: {start: [-2, 2], end: [2, 2]}},
            {Line: {start: [2, 2], end: [2, -2]}},
            {Line: {start: [2, -2], end: [-2, -2]}},

        ];

        const tempIcon = makeIcon(tempIconDef, "#ffffff", 1);

        const trailDef = [
            {Line: {start: [-2, -2], end: [-2, 2]}},
            {Line: {start: [-2, 2], end: [2, 2]}},
            {Line: {start: [2, 2], end: [2, -2]}},
            {Line: {start: [2, -2], end: [-2, -2]}},
        ];

        const trailIcon = makeIcon(trailDef, "#ffffff", 1);

        return [
            {
                id: 'temp-icon',
                ...tempIcon
            },
            {
                id: 'temp-icon-trail',
                ...trailIcon
            }
        ];
    }

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
                layout: {
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
        if (map.current) return; // stops map from initializing more than once

        defaultIcons.current = getDefaultIcons();

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

            defaultIcons.current.forEach((icon) => {
                map.current.addImage(icon.id, icon);
            });

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

            map.current.addSource('aircraftTrails', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': []
                }
            });

            map.current.addSource('aircraftRoutes', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': []
                }
            });

            map.current.addLayer({
                'id': 'aircraftTrails',
                'type': 'symbol',
                'source': 'aircraftTrails',
                'layout': {
                    'icon-image': ["coalesce",
                        ["image", 'temp-icon-trail']
                    ],
                    'icon-rotation-alignment': 'map',
                    'icon-overlap': 'always',
                    'icon-ignore-placement': true
                }
            });
            map.current.addLayer({
                'id': 'aircraftRoutes',
                'type': 'line',
                'source': 'aircraftRoutes',
                'paint': {
                    'line-color': 'pink',
                    'line-width': 1,
                },
            });
        });

        return () => map.current = null;
    }, []);

    const aircraftPollFunc = async () => {
        try {
            const aircraftList = await getAircraftList(true);

            setAircrafts((prevState) => {
                // History trails
                for (const aircraft of aircraftList) {
                    const foundCraft = prevState.find((acft) => acft.callsign === aircraft.callsign);
                    const trails = [];
                    let trailI = 0;

                    if (foundCraft) {
                        trailI = (foundCraft.trailI ?? 0) + 1;
                        if (trailI % 5 === 0) {
                            trails.push([
                                foundCraft.position.longitude.degrees,
                                foundCraft.position.latitude.degrees,
                                foundCraft.position.trueAltitude.meters]);

                            if (foundCraft.trails) {
                                trails.push(...foundCraft.trails.slice(0, 29));
                            }
                            trailI = 0;
                        } else {
                            if (foundCraft.trails) {
                                trails.push(...foundCraft.trails.slice(0, 30));
                            }
                        }
                    }

                    aircraft.trails = trails;
                    aircraft.trailI = trailI;
                }

                return aircraftList;
            });
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        aircraftPoll.current = setInterval(aircraftPollFunc, 1000);

        console.log("Aircraft Poll Start");

        return () => clearInterval(aircraftPoll.current);
    }, []);

    useEffect(() => {
        console.log("Aircraft Update")
        const trails = [];
        const routeLines = [];
        aircrafts.forEach((acft) => {
            for (let i = 0; i < acft.trails.length && i < 5; i++) {
                trails.push({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': acft.trails[i]
                    },
                });
            }

            if (aircraftOptions.current.get(acft.callsign)?.showRoute) {
                if (acft.fms?.fmsLines) {
                    routeLines.push(...acft.fms.fmsLines.map((line) => {
                        if (line.center){
                            const circle = turf.lineArc(
                                [line.center.lon.degrees, line.center.lat.degrees],
                                line.radius_m,
                                line.clockwise ? line.startTrueBearing : line.endTrueBearing,
                                line.clockwise ? line.endTrueBearing : line.startTrueBearing,
                                {
                                    units: "meters"
                                }
                            );

                            return circle;
                        } else {
                            return {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'LineString',
                                    'coordinates': [
                                        [line.startPoint.lon.degrees, line.startPoint.lat.degrees],
                                        [line.endPoint.lon.degrees, line.endPoint.lat.degrees]
                                    ]
                                }
                            }
                        }
                    }));
                }
            }
        });

        if (map.current) {
            map.current.getSource('aircraftTrails')?.setData({
                'type': 'FeatureCollection',
                'features': trails
            });
            map.current.getSource('aircraftRoutes')?.setData({
                'type': 'FeatureCollection',
                'features': routeLines
            });
        }
    }, [aircrafts]);

    useEffect(() => {
        console.log("Features Update")
        if (map.current && map.current.getSource('scope-package')) {
            map.current.getSource('scope-package').setData({
                'type': 'FeatureCollection',
                'features': features?.features ?? []
            });

            for (const icon of oldIcons) {
                map.current.removeImage(icon);
            }

            let newIconIds = [];
            for (const icon of features?.icons ?? []) {
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
            for (const [i, key] of Object.keys(features?.lineTypes ?? []).entries()) {
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
            if (features?.background === "Satellite") {
                map.current.setLayoutProperty("background", "visibility", "none");
                map.current.setLayoutProperty("background-satellite", "visibility", "visible");
            } else if (features?.background?.Color) {
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
        if (map.current) {
            if (map.current.isMoving()) {
                map.current.once('moveend', () => {
                    map.current.rotateTo(rotation);
                })
            } else {
                map.current.rotateTo(rotation);
            }
        }
    }, [rotation]);

    const getAircraftIcon = () => {
        const foundIcon = features?.icons.find((icon) => icon.id === "icon-symbol-aircraft_corr_prim_s");

        if (foundIcon) {
            return foundIcon;
        }

        return defaultIcons.current[0];
    }

    const handleAircraftClick = (callsign) => {
        if (!aircraftOptions.current.has(callsign)){
            aircraftOptions.current.set(callsign, {});
        }
        const options = aircraftOptions.current.get(callsign);
        options.showRoute = !options.showRoute;
    }

    return (
        <>
            <div ref={mapContainer} style={{
                height: "100%"
            }}/>
            {aircrafts.map(acft => (
                <AircraftMarker aircraft={acft} key={acft.callsign} map={map.current} icon={getAircraftIcon()} onClick={handleAircraftClick} />
            ))}
        </>
    );
};