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

export const MainToolbar = ({}) => {
    const scenarioMenu = useRef(null);

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
                for(const filename of selected) {
                    await loadSaunaScenario(filename);
                }
            } else {
                // Single file selected
                await loadSaunaScenario(selected);
            }
        }
    }

    return (
        <>
            <Toolbar
                className={"m-2"}
                end={<div className={"flex flex-wrap"}>
                    <Button
                        onClick={createSaunaScenarioMakerWindow}
                        tooltip={"Open Sauna Scenario Maker"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        className={"mr-2"}
                        label={"Scenario Maker"} />
                    <Button
                        severity={"secondary"}
                        onClick={createCommandWindow}
                        tooltip={"Open Command Window"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        className={"mr-2"}
                        icon={(options) => <FontAwesomeIcon icon={faMessage} {...options.iconProps}/>} />
                    <Button
                        severity={"secondary"}
                        onClick={openMapPage}
                        tooltip={"Open Map Window"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        className={"mr-2"}
                        icon={(options) => <FontAwesomeIcon icon={faMap} {...options.iconProps}/>} />

                    <ButtonGroup className={"mr-2"} size={"small"}>
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
                    ]} />
                    <Button
                        icon={(options) => <FontAwesomeIcon icon={faPlane} {...options.iconProps}/>}
                        label={<>Scenario <FontAwesomeIcon icon={faChevronDown}/></>}
                        className={"mr-2"}
                        onClick={(event) => scenarioMenu.current.toggle(event)}
                    />
                    <SettingsModal />
                </div>}
            />
        </>
    )
}