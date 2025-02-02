import {
    getScopePackageDisplayType,
    getScopePackageMap,
    getScopePackageSymbols,
    isScopePackageLoaded
} from "../../actions/scope_package_actions.js";
import {getColor, makeIcon} from "./map_icon.js";

export const getCurDisplay = async (facilities, facilityIndex, displayIndex, visibleFeatures, mapCache) => {
    let cur_facility, display;
    let name = "No Display Loaded";
    if (facilities) {
        const facility_split = facilityIndex.split(".");
        name = "";

        if (facility_split.length > 0) {
            cur_facility = facilities[facility_split[0]];

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
        mapData: await getMapFeatures(facilities, display, visibleFeatures, mapCache)
    };
}

const getMapFeatures = async (facilities, cur_display, visibleFeatures, mapCache) => {
    if (!facilities || !cur_display || !await isScopePackageLoaded()) {
        return {features: [], icons: [], background: {Blank: true}, lineTypes: {}};
    }
    let features = {};
    let icons = new Map();
    let background = {Blank: true};
    let lineTypes = {};

    const display_type = await getScopePackageDisplayType(cur_display.display_type);

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

    const displayItemPromises = [];
    const symbolIds = [];
    const symbolMap = new Map();

    for (const item of cur_display.display_items) {
        if (item.Map) {
            if (item.Map.visible || visibleFeatures.find((f) => f.type === "map" && f.id === item.Map.id)) {
                displayItemPromises.push(new Promise(async (resolve) => {
                    // Use map cache
                    if (!mapCache.current.has(item.Map.id)) {
                        mapCache.current.set(item.Map.id, await getScopePackageMap(item.Map.id));
                    }

                    resolve({
                        type: "MAP",
                        data: mapCache.current.get(item.Map.id)
                    });
                }));
            }
        } else if (item.Symbol) {
            symbolIds.push(item.Symbol.id);
            symbolMap.set(item.Symbol.id, item.Symbol);
        }
    }

    displayItemPromises.push(new Promise(async (resolve) => {
        resolve({
            type: "SYMBOLS",
            data: await getScopePackageSymbols(symbolIds)
        });
    }));

    for (const item of await Promise.all(displayItemPromises)) {
        if (item && item.data) {
            switch (item.type) {
                case "MAP":
                    const smap = item.data;
                    for (const feature of smap.data.Embedded.features.features) {
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
                    break;
                case "SYMBOLS":
                    for (const symbol of item.data) {
                        if (symbol) {
                            const symbolSet = symbolMap.get(symbol.name);
                            let feature = {...symbol.feature};
                            let size = feature.properties.size;
                            let color = feature.properties.color;
                            feature.properties.showText = !!symbolSet.show_label;
                            feature.properties.showSymbol = !!symbolSet.show_symbol;
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
                    break;
            }
        }
    }

    let featuresList = [];

    for (const key of Object.keys(features).toSorted()) {
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

const getFacilityDropdownData = (facilityId, facility, pathString) => {
    return {
        id: pathString,
        key: pathString,
        label: facility.name,
        children: facility.child_facilities.map((child, index) => getFacilityDropdownData(index, child, `${pathString}.${index}`))
    }
}

export const getFacilitiesDropDownData = (facilities) => {
    if (!facilities){
        return [];
    }

    return facilities.map((facility, index) => getFacilityDropdownData(index, facility, `${index}`));
}