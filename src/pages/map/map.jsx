import React, {useEffect, useRef, useState} from "react";
import {MapLibre} from "./map_libre";
import {open, save} from '@tauri-apps/plugin-dialog';
import {FiltersModal} from "./filters_modal.jsx";
import {getScopePackageFacilities, isScopePackageLoaded, loadScopePackage, saveScopePackage} from "../../actions/scope_package_actions.js";
import {getCurDisplay, getFacilitiesDropDownData} from "./map_util.js";
import {Toolbar} from "primereact/toolbar";
import {Menu} from "primereact/menu";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "primereact/button";
import {TreeSelect} from "primereact/treeselect";
import {Dropdown} from "primereact/dropdown";

export const MapPage = () => {
    const [facilities, setFacilities] = useState();
    const [facilityIndex, setFacilityIndex] = useState("0");
    const [displayIndex, setDisplayIndex] = useState(0);
    const [curDisplay, setCurDisplay] = useState({data: {features: [], icons: []}});
    const [facilityDropDownData, setFacilityDropDownData] = useState({});
    const [visibleFeatures, setVisibleFeatures] = useState([]);
    const [mapCenter, setMapCenter] = useState({lat: 0, lon: 0});
    const [mapZoom, setMapZoom] = useState(100000);
    const [mapRotation, setMapRotation] = useState(0);
    const mapCache = useRef(new Map());
    const loadPackageMenu = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFacilityDropDownData(getFacilitiesDropDownData(facilities));
    }, [facilities]);

    useEffect(() => {
        setVisibleFeatures([]);
    }, [facilities, facilityIndex, displayIndex]);

    useEffect(() => {
        (async () => {
            setCurDisplay(await getCurDisplay(facilities, facilityIndex, displayIndex, visibleFeatures, mapCache));
        })();
    }, [facilities, facilityIndex, displayIndex, visibleFeatures])

    useEffect(() => {
        if (curDisplay && curDisplay.display && curDisplay.display.center) {
            setMapCenter(curDisplay.display.center);
            setMapZoom(curDisplay.display.screen_height);
            setMapRotation(curDisplay.display.rotation);
        }
    }, [curDisplay])

    const loadOptions = {
        0: {
            name: "ATC Scope Package (*.atcpkg)",
            sctType: "AtcScopePackage",
            openOptions: {
                multiple: false,
                title: "Select ATC Scope Package",
                filters: [{
                    name: "ATC Scope Package",
                    extensions: ["atcpkg"]
                }],
            }
        },
        1: {
            name: "CRC Facility (*.json)",
            sctType: "Crc",
            openOptions: {
                multiple: false,
                title: "Select CRC Facility",
                filters: [{
                    name: "CRC Facility",
                    extensions: ["json"]
                }],
            }
        },
        2: {
            name: "EuroScope Profile (*.prf)",
            sctType: "EuroScopeProfile",
            openOptions: {
                multiple: true,
                title: "Select EuroScope Profile",
                filters: [{
                    name: "EuroScope Profile",
                    extensions: ["prf"]
                }],
            }
        },
        3: {
            name: "EuroScope Package (Folder)",
            sctType: "EuroScopeDirectory",
            openOptions: {
                multiple: false,
                title: "Select EuroScope Package Folder",
                directory: true
            }
        }
    }

    const handleLoadPackage = async (eventKey) => {
        setLoading(true);
        try {
            const pkgType = loadOptions[eventKey];
            if (pkgType) {
                const selected = await open(pkgType.openOptions);

                if (selected) {
                    const sendObj = {};
                    if (eventKey === "2") {
                        sendObj[pkgType.sctType] = {
                            paths: selected
                        };
                    } else {
                        sendObj[pkgType.sctType] = {
                            path: selected
                        }
                    }

                    await loadScopePackage(sendObj);

                    if (await isScopePackageLoaded()) {
                        setFacilities(await getScopePackageFacilities());
                        setFacilityIndex("0");
                        setDisplayIndex(0);
                        mapCache.current.clear();
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSavePackage = async () => {
        const selected = await save({
            filters: [{
                name: "ATC Scope Package",
                extensions: ["atcpkg"]
            }]
        });

        if (selected) {
            await saveScopePackage(selected);
        }
    }

    const onFacilityDropdownChange = ({value}) => {
        setFacilityIndex(value);
        setDisplayIndex(0);
    }

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100vw"
            }}>
                <Toolbar
                    className={"m-2"}
                    start={<h4 className={"m-0"}>{curDisplay.fullName}</h4>}
                    end={
                        <div className={"flex flex-wrap"}>
                            {facilities &&
                                <TreeSelect
                                    className={"mr-2"}
                                    filter={true}
                                    value={facilityIndex}
                                    onChange={onFacilityDropdownChange}
                                    options={facilityDropDownData}
                                    selectionMode={"single"}
                                    tooltip={"Select Facility"}
                                    tooltipOptions={{position: "bottom"}}
                                />
                            }
                            {facilities && curDisplay && curDisplay.facility &&
                                <>
                                    <Dropdown
                                        className={"mr-2"}
                                        value={displayIndex}
                                        onChange={(e) => setDisplayIndex(e.value)}
                                        options={curDisplay.facility.displays.map((disp, key) => {
                                            return {
                                                label: disp.name,
                                                value: key
                                            }
                                        })}
                                        tooltip={"Select Display"}
                                        tooltipOptions={{position: "bottom"}}
                                    />
                                </>
                            }
                            {facilities && curDisplay &&
                                <FiltersModal visibleFeatures={visibleFeatures} setVisibleFeatures={setVisibleFeatures} display={curDisplay}>
                                    {({handleShow}) => (
                                        <Button severity="secondary" onClick={handleShow} label={"Filters"} className={"mr-2"}/>
                                    )}
                                </FiltersModal>
                            }
                            {facilities &&
                                <Button onClick={handleSavePackage} label={"Save"} className={"mr-2"}/>
                            }
                            <Button
                                label={<>Load <FontAwesomeIcon icon={faChevronDown}/></>}
                                onClick={(event) => loadPackageMenu.current.toggle(event)}
                                loading={loading}
                            />
                            <Menu
                                ref={loadPackageMenu}
                                popup={true}
                                model={Object.entries(loadOptions).map(([key, value]) => {
                                    return {
                                        id: key,
                                        label: value.name,
                                        command: ({item}) => void handleLoadPackage(item.id)
                                    }
                                })}
                            />
                        </div>
                    }
                />
                <div style={{flexGrow: "1"}}>
                    <MapLibre features={curDisplay.mapData} zoom={mapZoom} center={mapCenter} rotation={mapRotation}/>
                </div>
            </div>
        </>
    );
};