import React, {useRef} from "react";
import {open} from '@tauri-apps/plugin-dialog';
import {loadEuroscopeScenario, loadSaunaScenario} from "../../actions/data_actions";
import {SettingsModal} from "./settings.jsx";
import {NavigraphAuthButton} from "./navigraph_auth.jsx";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {SectorFilesButton} from "./sector_files_button.jsx";
import {createCommandWindow, createMapWindow, createSaunaScenarioMakerWindow} from "../../actions/tauri_actions";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {ButtonGroup} from "primereact/buttongroup";
import {Menu} from "primereact/menu";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {faMessage} from "@fortawesome/free-solid-svg-icons/faMessage";
import {faMap} from "@fortawesome/free-solid-svg-icons/faMap";
import {faPlane} from "@fortawesome/free-solid-svg-icons/faPlane";
import {pauseall, removeAllAircraft, setAllSimRate, unpauseall} from "../../actions/aircraft_actions.js";
import {faPause, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useSelector} from "react-redux";
import {InputNumber} from "primereact/inputnumber";

export const MainToolbar = ({}) => {
    const scenarioMenu = useRef(null);
    const apiServer = useSelector(state => state.apiServer);

    const openMapPage = async () => {
        await createMapWindow();
    }

    const chooseEsFile = async () => {
        const selected = await open({
            title: "Select Euroscope Scenario File",
            multiple: true,
            filters: [{
                name: "Euroscope Scenario File",
                extensions: ["txt"]
            }]
        });

        if (selected !== null) {
            if (Array.isArray(selected)) {
                // Multiple scenario files selected
                for (const filename of selected) {
                    await loadEuroscopeScenario(filename);
                }
            } else {
                // Single file selected
                await loadEuroscopeScenario(selected);
            }
        }
    }
    const chooseSaunaScenarioFile = async () => {
        const selected = await open({
            title: "Select Sauna Scenario File",
            multiple: true,
            filters: [{
                name: "Sauna Scenario File",
                extensions: ["json"]
            }]
        });

        if (selected !== null) {
            if (Array.isArray(selected)) {
                // Multiple scenario files selected
                for (const filename of selected) {
                    await loadSaunaScenario(filename);
                }
            } else {
                // Single file selected
                await loadSaunaScenario(selected);
            }
        }
    }

    const getSimStateActions = () => {
        const {simState} = apiServer;
        let pauseButton;
        if (simState.paused) {
            pauseButton = <Button
                severity={"success"}
                outlined={true}
                className="mr-2"
                onClick={unpauseall}
                icon={(options) => <FontAwesomeIcon icon={faPlay} {...options.iconProps}/>}
            />;
        } else {
            pauseButton = <Button
                severity={"danger"}
                outlined={true}
                className="mr-2"
                onClick={pauseall}
                icon={(options) => <FontAwesomeIcon icon={faPause} {...options.iconProps}/>}
            />;
        }
        return (
            <>
                {pauseButton}
                <div className={"p-inputgroup flex-1"}>
                    <InputNumber
                        style={{width: "50px"}}
                        value={simState.simRate}
                        onValueChange={async (e) => setAllSimRate(e.value)}
                        minFractionDigits={0}
                        maxFractionDigits={1}
                        min={0.1}
                        max={8} />
                    <span className={"p-inputgroup-addon"}>
                        x
                    </span>
                </div>
                <Button
                    severity="danger"
                    onClick={removeAllAircraft}
                    icon={(options) => <FontAwesomeIcon icon={faTrash} {...options.iconProps}/>}
                    label={"All"}
                />
            </>
        )
    }

    return (
        <>
            <Toolbar
                className={"m-2"}
                start={<div className={"flex flex-wrap gap-2"}>
                    {getSimStateActions()}
                </div>}
                end={<div className={"flex flex-wrap gap-2"}>
                    <Button
                        onClick={createSaunaScenarioMakerWindow}
                        tooltip={"Open Sauna Scenario Maker"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        label={"Scenario Maker"}/>
                    <Button
                        severity={"secondary"}
                        onClick={createCommandWindow}
                        tooltip={"Open Command Window"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        icon={(options) => <FontAwesomeIcon icon={faMessage} {...options.iconProps}/>}/>
                    <Button
                        severity={"secondary"}
                        onClick={openMapPage}
                        tooltip={"Open Map Window"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        icon={(options) => <FontAwesomeIcon icon={faMap} {...options.iconProps}/>}/>

                    <ButtonGroup size={"small"}>
                        <NavigraphAuthButton/>
                        <SectorFilesButton/>
                    </ButtonGroup>

                    <Menu
                        ref={scenarioMenu}
                        popup={true}
                        popupAlignment={"right"}
                        model={[
                            {
                                label: "ES Scenario File",
                                command: chooseEsFile
                            },
                            {
                                label: "Sauna Scenario File",
                                command: chooseSaunaScenarioFile
                            }
                        ]}/>
                    <Button
                        icon={(options) => <FontAwesomeIcon icon={faPlane} {...options.iconProps}/>}
                        label={<>Scenario <FontAwesomeIcon icon={faChevronDown}/></>}
                        onClick={(event) => scenarioMenu.current.toggle(event)}
                    />
                    <SettingsModal/>
                </div>}
            />
        </>
    )
}