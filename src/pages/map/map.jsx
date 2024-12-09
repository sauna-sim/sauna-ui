import React, {useEffect, useState} from "react";
import {MapLibre} from "./map_libre";
import {Button, Form} from "react-bootstrap";
import { open } from '@tauri-apps/api/dialog';
import {readTextFileLines} from "../../actions/tauri_actions.js";
import {getColor, makeIcon} from "./map_icon.js";

const getMapFeatures = (scopePackage, facility, display) => {
    if (!scopePackage){
        return {features: [], icons: []};
    }
    let features = [];
    let icons = new Map();

    const cur_display = scopePackage.facilities[facility].displays[display];

    if (!cur_display){
        return {features: [], icons: []};
    }

    const display_type = scopePackage.display_types[cur_display.display_type];

    if (display_type) {
        // Add default icons
        if (display_type.symbol_icons["aircraft_corr_prim_s"]) {
            icons.set("icon-aircraft_corr_prim_s", {
                id: `icon-symbol-aircraft_corr_prim_s`,
                ...makeIcon(display_type.symbol_icons["aircraft_corr_prim_s"].draw_items, "#ffffff", 1)
            });
        }
    }

    for (const item of cur_display.display_items) {
        if (item.Map){
            const smap = scopePackage.maps[item.Map.id];
            if (smap) {
                for (const feature of smap.features.features) {
                    let new_feature = {...feature};
                    if (display_type) {
                        const defaults = display_type.map_defaults[smap.map_type];
                        if (defaults) {
                            new_feature.properties.defaultColor = getColor(defaults.color);
                            new_feature.properties.defaultLineWidth = defaults.line_weight >= 1 ? defaults.line_weight : 1;
                            new_feature.properties.defaultLineStyle = defaults.line_style;
                        }
                    }
                    features.push(new_feature);
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

                if (!size){
                    size = 1;
                }

                if (!color){
                    color = "#ffffff"
                }
                features.push(symbol.feature);

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

    return {
        features,
        icons: Array.from(icons.values())
    };
}

export const MapPage = () => {
    const [scopePackage, setScopePackage] = useState();
    const [facility, setFacility] = useState("0");
    const [display, setDisplay] = useState(0);
    const [mapFeatures, setMapFeatures] = useState({features: [], icons: []});

    const onLoadEsPrf = async () => {
        const selected = await open({
            multiple: false,
            title: "Select EuroScope Profile File",
            filters: [{
                name: "Euroscope Profile",
                extensions: ["json"]
            }],
        });

        if (selected){
            console.log("selected prf", selected);
            const fileLines = await readTextFileLines(selected);
            let jsonStr = "";
            for (const line of fileLines){
                jsonStr += line + "\n";
            }
            const json = JSON.parse(jsonStr);
            setScopePackage(json);
            console.log(json);
            setFacility("0");
            setDisplay(0);
        }
    }

    useEffect(() => {
        setMapFeatures(getMapFeatures(scopePackage, facility, display));
    }, [scopePackage, facility, display]);

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100vw"
            }}>
                <div>
                    <h2>Map</h2>
                    <Button variant="primary" onClick={onLoadEsPrf}>Load ES PRF</Button>
                    {scopePackage &&
                    <Form.Select onChange={(e) => setDisplay(e.target.value)} value={display}>
                        {Object.entries(scopePackage.facilities[facility].displays).map(([key, disp]) =>
                            <option value={key} key={key}>{disp.name}</option>)}
                    </Form.Select>
                    }
                </div>
                <div style={{flexGrow: "1"}}>
                    <MapLibre features={mapFeatures}/>
                </div>
            </div>
        </>
    );
};