import React, {useEffect, useRef, useState} from "react";
import {MapLibre} from "./map_libre";
import {Button, DropdownButton} from "react-bootstrap";
import {open, save} from '@tauri-apps/plugin-dialog';
import DropdownItem from "react-bootstrap/DropdownItem";
import DropdownTreeSelect from "react-dropdown-tree-select";
import 'react-dropdown-tree-select/dist/styles.css'
import {FiltersModal} from "./filters_modal.jsx";
import {getScopePackageFacilities, isScopePackageLoaded, loadScopePackage, saveScopePackage} from "../../actions/scope_package_actions.js";
import {getCurDisplay, getFacilitiesDropDownData} from "./map_util.js";

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

    useEffect(() => {
        setFacilityDropDownData(getFacilitiesDropDownData(facilities, facilityIndex));
    }, [facilities, facilityIndex]);

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

    const onFacilityDropdownChange = (curNode, selNodes) => {
        if (selNodes && selNodes[0]) {
            setFacilityIndex(selNodes[0].value);
            setDisplayIndex(0);
        }
    }

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
                    {facilities &&
                        <DropdownTreeSelect data={facilityDropDownData} mode="radioSelect" onChange={onFacilityDropdownChange}/>
                    }
                    {facilities && curDisplay && curDisplay.facility &&
                        <DropdownButton title="Select Display" variant="secondary" onSelect={(eventKey) => setDisplayIndex(eventKey)}>
                            {curDisplay.facility.displays.map((disp, key) => {
                                return <DropdownItem key={key} eventKey={key}>{disp.name}</DropdownItem>
                            })}
                        </DropdownButton>
                    }
                    {facilities && curDisplay &&
                        <FiltersModal visibleFeatures={visibleFeatures} setVisibleFeatures={setVisibleFeatures} display={curDisplay}>
                            {({handleShow}) => (
                                <Button variant="secondary" onClick={handleShow}>Filters</Button>
                            )}
                        </FiltersModal>
                    }
                    {facilities &&
                        <Button variant={"primary"} onClick={handleSavePackage}>Save</Button>
                    }
                    <DropdownButton title="Load" variant="primary" onSelect={handleLoadPackage}>
                        {Object.entries(loadOptions).map(([key, value]) =>
                            <DropdownItem key={key} eventKey={key}>{value.name}</DropdownItem>
                        )}
                    </DropdownButton>
                </div>
                <div style={{flexGrow: "1"}}>
                    <MapLibre features={curDisplay.mapData} zoom={mapZoom} center={mapCenter} rotation={mapRotation}/>
                </div>
            </div>
        </>
    );
};