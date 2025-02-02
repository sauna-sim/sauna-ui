import React, {useState, useEffect} from 'react';
import {Button} from "primereact/button";
import AircraftListModal from './aircraft_list_modal';
import {openAircraftScenarioFile, saveAircraftScenarioFile} from '../../../actions/tauri_actions';
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

export default function AircraftList({aircrafts, setAircrafts}) {
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [showAddAircraftModal, setShowAddAircraftModal] = React.useState(false);
    const [currentAircraft, setCurrentAircraft] = React.useState(null);

    const [fileHandle, setFileHandle] = React.useState(null);
    const [prevAircrafts, setPrevAircrafts] = useState([]);

    const testAircraft = {
        callsign: "EZY123",
        pos: {lat: 50.12345, lon: -1.23456},
        alt: 15000,
        acftType: "A320",
        squawk: "1234",
        dep: "EGLL",
        arr: "KLAX",
        fp: {route: "DCT XYZ", fpalt: 35000, tas: 420, flightRules: "IFR"},
    };

    const [fileState, setFileState] = useState("success");


    const isArrayEqual = () => {
        if (prevAircrafts.length !== aircrafts.length) {
            return false;
        }

        for (let i = 0; i < prevAircrafts.length; i++) {
            const prevAircraft = prevAircrafts[i];
            const aircraft = aircrafts[i];
            for (const key of Object.keys(prevAircraft)) {
                if (prevAircraft[key] !== aircraft[key]) {
                    setFileState("outline-warning");
                } else {
                    setFileState("success");
                }
            }
        }
    }

    const onAircraftSubmit = (aircraft) => {
        if (currentAircraft) {
            const updatedAircrafts = aircrafts.map((a) =>
                a.callsign === currentAircraft.callsign ? aircraft : a
            );

            setAircrafts(updatedAircrafts);
        } else {
            setAircrafts([...aircrafts, aircraft]);
        }
        setCurrentAircraft(null);
    };

    const removeAircraft = (aircraft) => {
        const updatedAircrafts = aircrafts.filter(item => item !== aircraft);
        setAircrafts(updatedAircrafts);
    }

    const handleAircraftScenarioFileLoad = async () => {
        const aircraftList = await openAircraftScenarioFile({setFileHandle});
        if (aircraftList) {
            setAircrafts(aircraftList.aircraft);
            setPrevAircrafts(aircraftList.aircraft);
        }
    }

    useEffect(() => {
        console.log(aircrafts);
        isArrayEqual();
    }, [aircrafts, prevAircrafts]);
    return (
        <div>
            <Button
                severity="secondary"
                onClick={() => {
                    setCurrentAircraft(null);
                    setShowAddAircraftModal(true);
                }}
                style={{marginBottom: "10px"}}
                label={"Add Aircraft"}
                className={"mr-2"}
            />
            <Button
                severity="secondary"
                onClick={() => {
                    if (fileState === "success") {
                        void handleAircraftScenarioFileLoad();
                    } else {
                        confirmDialog({
                            message: "Are you sure you want to continue without saving? This cannot be undone!",
                            header: "Save File",
                            acceptLabel: "Save",
                            rejectLabel: "Yes",
                            acceptClassName: "p-button",
                            rejectClassName: "p-button-danger",
                            async accept() {
                                await saveAircraftScenarioFile({fileHandle, setFileHandle, aircrafts});
                                void handleAircraftScenarioFileLoad();
                            },
                            reject() {
                                void handleAircraftScenarioFileLoad();
                            }
                        })
                    }
                }}
                style={{marginBottom: "10px"}}
                label={"Load Scenario File"}
            />
            <ConfirmDialog />
            {showAddAircraftModal && (
                <AircraftListModal
                    onClose={() => setShowAddAircraftModal(false)}
                    onAircraftSubmit={onAircraftSubmit}
                    aircraft={currentAircraft}
                    aircrafts={aircrafts}
                />
            )}
            {!aircrafts.length < 1 && (
                <DataTable value={aircrafts} footer={<>
                    <div className="flex justify-content-end">
                        <Button
                            size="small"
                            onClick={() => {
                                onAircraftSubmit(testAircraft);
                            }}
                            style={{marginRight: "5px"}}
                            label={"Test"}
                        />

                        <Button
                            severity={fileState === "success" ? "success" : "warning"}
                            outlined={fileState !== "success"}
                            size="small"
                            onClick={() => {
                                saveAircraftScenarioFile({fileHandle, setFileHandle, aircrafts});
                                setPrevAircrafts(aircrafts);
                            }}
                            style={{marginRight: "5px"}}
                            label={"Save"}
                        />

                        <Button
                            size="small"
                            onClick={() => {
                                saveAircraftScenarioFile({fileHandle: null, setFileHandle, aircrafts});
                                setPrevAircrafts(aircrafts);
                            }}
                            label={"Save as"}
                        />
                    </div>
                </>}>
                    <Column field={"callsign"} header={"Callsign"}/>
                    <Column field={"pos.lat"} header={"Latitude"}/>
                    <Column field={"pos.lon"} header={"Longitude"}/>
                    <Column field={"alt"} header={"Altitude"}/>
                    <Column field={"acftType"} header={"Aircraft Type"}/>
                    <Column field={"squawk"} header={"Squawk"}/>
                    <Column field={"fp.origin"} header={"Dep"}/>
                    <Column field={"fp.destination"} header={"Arr"}/>
                    <Column field={"fp.route"} header={"Route"}/>
                    <Column field={"fp.cruiseLevel"} header={"Crz Alt"}/>
                    <Column field={"fp.filedTas"} header={"Crz Tas"}/>
                    <Column field={"fp.flightRules"} header={"Flight Rules"}/>
                    <Column header={"Actions"} body={(data) => (
                        <div className={"p-2 flex"} style={{width: "133px"}}>
                            <Button
                                severity="primary"
                                size="small"
                                onClick={() => {
                                    setCurrentAircraft(data);
                                    setShowAddAircraftModal(true);
                                }}
                                label={"Edit"}
                                className={"mr-2"}
                            />
                            <Button
                                severity="danger"
                                size="small"
                                onClick={() => {
                                    removeAircraft(data);
                                }}
                                label={"Remove"}
                            />
                        </div>
                    )}/>
                </DataTable>
            )}

        </div>
    );
}
