import React, {useEffect, useState} from "react";
import {MapLibre} from "./map_libre";
import {Button, DropdownButton, Form} from "react-bootstrap";
import {open} from '@tauri-apps/api/dialog';
import {readTextFileLines} from "../../actions/tauri_actions.js";
import {getColor, makeIcon} from "./map_icon.js";
import DropdownItem from "react-bootstrap/DropdownItem";
import DropdownTreeSelect from "react-dropdown-tree-select";
import 'react-dropdown-tree-select/dist/styles.css'
import {FiltersModal} from "./filters_modal.jsx";

const getCurDisplay = (scopePackage, facilityIndex, displayIndex, visibleFeatures) => {
    console.log(scopePackage, facilityIndex, displayIndex, visibleFeatures);
    let cur_facility, display;
    let name = "No Display Loaded";
    if (scopePackage) {
        const facility_split = facilityIndex.split(".");
        name = "";

        if (facility_split.length > 0) {
            cur_facility = scopePackage.facilities[facility_split[0]];

            if (cur_facility) {
                name += cur_facility.name + " -> ";

                for (let i = 1; i < facility_split.length; i++) {
                    if (!cur_facility.child_facilities || !cur_facility.child_facilities[facility_split[i]]) {
                        cur_facility = null;
                        name = "";
                        break;
                    }
                    cur_facility = cur_facility.child_facilities[facility_split[i]];
                    name += cur_facility.name + " -> ";
                }
            }

            if (cur_facility) {
                display = cur_facility.displays[displayIndex];

                if (display) {
                    name += display.name;
                }
            }
        }
    }

    return {
        facility: cur_facility,
        display: display,
        fullName: name,
        mapData: getMapFeatures(scopePackage, display, visibleFeatures)
    };
}

const getMapFeatures = (scopePackage, cur_display, visibleFeatures) => {
    if (!scopePackage || !cur_display) {
        return {features: [], icons: [], background: {Blank: true}, lineTypes: {}};
    }
    let features = {};
    let icons = new Map();
    let background = {Blank: true};
    let lineTypes = {};

    const display_type = scopePackage.display_types[cur_display.display_type];

    console.log(display_type);

    if (display_type) {
        // Add default icons
        if (display_type.symbol_icons["aircraft_corr_prim_s"] && display_type.symbol_icons["aircraft_corr_prim_s"].draw_items.length > 0) {
            icons.set("icon-aircraft_corr_prim_s", {
                id: `icon-symbol-aircraft_corr_prim_s`,
                ...makeIcon(display_type.symbol_icons["aircraft_corr_prim_s"].draw_items, "#ffffff", 1)
            });
        }

        background = display_type.background;
        lineTypes = display_type.line_types;
    }

    for (const item of cur_display.display_items) {
        if (item.Map) {
            const smap = scopePackage.maps[item.Map.id];
            if (smap) {
                if (item.Map.visible || visibleFeatures.find((f) => f.type === "map" && f.id === item.Map.id)) {
                    for (const feature of smap.features.features) {
                        let new_feature = {...feature};
                        if (display_type && feature.properties.itemType) {
                            const defaults = display_type.map_defaults[feature.properties.itemType];
                            if (defaults) {
                                new_feature.properties.defaultColor = getColor(defaults.color);
                                new_feature.properties.defaultLineWidth = defaults.line_weight >= 1 ? defaults.line_weight : 1;
                                if (feature.geometry.type === "LineString" && !new_feature.properties.style) {
                                    new_feature.properties.style = defaults.line_style;
                                }
                            }
                        }
                        if (feature.geometry.type === "Point" && feature.properties.style) {
                            new_feature.properties.icon = `icon-symbol-${feature.properties.style}`;
                            let size = feature.properties.size;
                            let color = feature.properties.color;
                            if (!size) {
                                size = 1;
                            }

                            if (!color) {
                                color = "#ffffff"
                            }

                            // Check icon
                            if (!icons.get(`icon-symbol-${feature.properties.style}-${size}-${color}`) && display_type && display_type.symbol_icons[feature.properties.style]) {
                                icons.set(`icon-symbol-${feature.properties.style}-${size}-${color}`, {
                                    id: `icon-symbol-${feature.properties.style}-${size}-${color}`,
                                    ...makeIcon(display_type.symbol_icons[feature.properties.style].draw_items, color, size)
                                });
                            }
                        }

                        const zIndex = feature.properties.zIndex ? feature.properties.zIndex : 0;

                        if (!features[zIndex]) {
                            features[zIndex] = [];
                        }
                        features[zIndex].push(new_feature);
                    }
                }
            }
        } else if (item.Symbol) {
            const symbol = scopePackage.symbols[item.Symbol.id];
            if (symbol) {
                let feature = {...symbol.feature};
                let size = feature.properties.size;
                let color = feature.properties.color;
                feature.properties.showText = !!item.Symbol.show_label;
                feature.properties.showSymbol = !!item.Symbol.show_symbol;
                feature.properties.icon = `icon-symbol-${symbol.symbol_type}`;

                if (display_type) {
                    const defaults = display_type.symbol_defaults[symbol.symbol_type];
                    if (defaults) {
                        feature.properties.defaultColor = getColor(defaults[0].color);
                        feature.properties.defaultSize = defaults[0].size;
                        feature.properties.defaultTextColor = getColor(defaults[1].color);
                        feature.properties.defaultTextSize = getColor(defaults[1].size);
                        feature.properties.defaultTextAlign = defaults[0].text_align;

                        if (!size) {
                            size = defaults[0].size;
                        }

                        if (!color) {
                            color = feature.properties.defaultColor;
                        }
                    }
                }

                if (!size) {
                    size = 1;
                }

                if (!color) {
                    color = "#ffffff"
                }
                const zIndex = symbol.feature.properties.zIndex ? symbol.feature.properties.zIndex : 0;

                if (!features[zIndex]) {
                    features[zIndex] = [];
                }
                features[zIndex].push(symbol.feature);

                // Check icon
                if (!icons.get(`icon-symbol-${symbol.symbol_type}-${size}-${color}`) && display_type && display_type.symbol_icons[symbol.symbol_type]) {
                    icons.set(`icon-symbol-${symbol.symbol_type}-${size}-${color}`, {
                        id: `icon-symbol-${symbol.symbol_type}-${size}-${color}`,
                        ...makeIcon(display_type.symbol_icons[symbol.symbol_type].draw_items, color, size)
                    });
                }
            }
        }
    }

    let featuresList = [];

    for (const key of Object.keys(features).toSorted()){
        for (const feature of features[key]) {
            featuresList.push(feature);
        }
    }

    return {
        features: featuresList,
        icons: Array.from(icons.values()),
        background,
        lineTypes
    };
}

const getFacilityDropdownData = (facilityId, facility, pathString, selectedPath) => {
    return {
        label: facility.name,
        value: pathString,
        checked: pathString === selectedPath,
        children: facility.child_facilities.map((child, index) => getFacilityDropdownData(index, child, `${pathString}.${index}`, selectedPath))
    }
}

const getFacilitiesDropDownData = (scopePackage, facilityIndex) => {
    return {
        label: "Select Facility",
        value: "null",
        expanded: true,
        children: scopePackage ? scopePackage.facilities.map((child, index) => getFacilityDropdownData(index, child, `${index}`, facilityIndex)) : []
    }
}

export const MapPage = () => {
    const [scopePackage, setScopePackage] = useState();
    const [facilityIndex, setFacilityIndex] = useState("0");
    const [displayIndex, setDisplayIndex] = useState(0);
    const [curDisplay, setCurDisplay] = useState({data: {features: [], icons: []}});
    const [facilityDropDownData, setFacilityDropDownData] = useState({});
    const [visibleFeatures, setVisibleFeatures] = useState([]);
    const [mapCenter, setMapCenter] = useState({lat: 0, lon: 0});
    const [mapZoom, setMapZoom] = useState(100000);
    const [mapRotation, setMapRotation] = useState(0);

    const onLoadEsPrf = async () => {
        const selected = await open({
            multiple: false,
            title: "Select EuroScope Profile File",
            filters: [{
                name: "Euroscope Profile",
                extensions: ["json"]
            }],
        });

        if (selected) {
            console.log("selected prf", selected);
            const fileLines = await readTextFileLines(selected);
            let jsonStr = "";
            for (const line of fileLines) {
                jsonStr += line + "\n";
            }
            const json = JSON.parse(jsonStr);
            console.log(json);
            setScopePackage(json);
            setFacilityIndex("0");
            setDisplayIndex(0);
        }
    }

    const onFacilityDropdownChange = (curNode, selNodes) => {
        console.log(curNode, selNodes);
        if (selNodes && selNodes[0]){
            setFacilityIndex(selNodes[0].value);
            setDisplayIndex(0);
        }
    }

    useEffect(() => {
        setFacilityDropDownData(getFacilitiesDropDownData(scopePackage, facilityIndex));
    }, [scopePackage, facilityIndex]);

    useEffect(() => {
        setVisibleFeatures([]);
    }, [scopePackage, facilityIndex, displayIndex]);

    useEffect(() => {
        setCurDisplay(getCurDisplay(scopePackage, facilityIndex, displayIndex, visibleFeatures));
    },[scopePackage, facilityIndex, displayIndex, visibleFeatures])

    useEffect(() => {
        if (curDisplay && curDisplay.display && curDisplay.display.center) {
            setMapCenter(curDisplay.display.center);
            setMapZoom(curDisplay.display.screen_height);
            setMapRotation(curDisplay.display.rotation);
        }
    }, [curDisplay])

    console.log(curDisplay);
    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100vw"
            }}>
                <div className="m-2"
                     style={{
                         display: "flex",
                         flexDirection: "row"
                     }}>
                    <h4 style={{flexGrow: "1"}}>{curDisplay.fullName}</h4>
                    {scopePackage &&
                        <DropdownTreeSelect data={facilityDropDownData} mode="radioSelect" onChange={onFacilityDropdownChange}/>
                    }
                    {scopePackage && curDisplay && curDisplay.facility &&
                        <DropdownButton title="Select Display" variant="secondary" onSelect={(eventKey) => setDisplayIndex(eventKey)}>
                            {curDisplay.facility.displays.map((disp, key) => {
                                return <DropdownItem key={key} eventKey={key}>{disp.name}</DropdownItem>
                            })}
                        </DropdownButton>
                    }
                    {scopePackage && curDisplay &&
                        <FiltersModal visibleFeatures={visibleFeatures} setVisibleFeatures={setVisibleFeatures} display={curDisplay} scopePackage={scopePackage}>
                            {({handleShow}) => (
                                <Button variant="secondary" onClick={handleShow}>Filters</Button>
                            )}
                        </FiltersModal>
                    }
                    <Button variant="primary" onClick={onLoadEsPrf}>Load ES PRF</Button>
                </div>
                <div style={{flexGrow: "1"}}>
                    <MapLibre features={curDisplay.mapData} zoom={mapZoom} center={mapCenter} rotation={mapRotation}/>
                </div>
            </div>
        </>
    );
};