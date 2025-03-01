import React, {useRef} from "react";
import {open} from '@tauri-apps/plugin-dialog';
import {SettingsModal} from "./settings.jsx";
import {NavigraphAuthButton} from "./navigraph_auth.jsx";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {SectorFilesButton} from "./sector_files_button.jsx";
import {createCommandWindow, createMapWindow, createSaunaScenarioMakerWindow, saveAircraftScenarioFile} from "../../actions/tauri_actions";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {ButtonGroup} from "primereact/buttongroup";
import {Menu} from "primereact/menu";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {faMessage} from "@fortawesome/free-solid-svg-icons/faMessage";
import {faMap} from "@fortawesome/free-solid-svg-icons/faMap";
import {faPlane} from "@fortawesome/free-solid-svg-icons/faPlane";
import {removeAllAircraft} from "../../actions/aircraft_actions.js";
import {faPause, faPlay, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useDispatch, useSelector} from "react-redux";
import {InputNumber} from "primereact/inputnumber";
import {InputGroup, InputGroupAddon} from "../../components/primereact_tailwind.js";
import {loadEuroscopeScenario, loadSaunaScenario, pauseSession, setSessionSimRate, unpauseSession} from "../../actions/session_actions.js";
import {faCircleXmark} from "@fortawesome/free-solid-svg-icons/faCircleXmark";
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import {saveStoreSessionId} from "../../actions/local_store_actions.js";
import {resetSession} from "../../redux/slices/sessionSlice.js";
import {classNames} from "primereact/utils";

export const MainToolbar = ({}) => {
    const scenarioMenu = useRef(null);
    const session = useSelector(state => state.session);
    const dispatch = useDispatch();

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
                    await loadEuroscopeScenario(session.id, filename);
                }
            } else {
                // Single file selected
                await loadEuroscopeScenario(session.id, selected);
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
                    await loadSaunaScenario(session.id, filename);
                }
            } else {
                // Single file selected
                await loadSaunaScenario(session.id, selected);
            }
        }
    }

    const getSimStateActions = () => {
        const {simState} = session;
        let pauseButton;
        if (simState.paused) {
            pauseButton = <Button
                severity={"success"}
                outlined={true}
                className="mr-2"
                onClick={() => unpauseSession(session.id)}
                icon={(options) => <FontAwesomeIcon icon={faPlay} {...options.iconProps}/>}
            />;
        } else {
            pauseButton = <Button
                severity={"danger"}
                outlined={true}
                className="mr-2"
                onClick={() => pauseSession(session.id)}
                icon={(options) => <FontAwesomeIcon icon={faPause} {...options.iconProps}/>}
            />;
        }
        return (
            <>
                {pauseButton}
                <div className={`w-20 ${InputGroup}`}>
                    <InputNumber
                        className={"[&>input]:rounded-none [&>input]:rounded-l-md"}
                        inputClassName={"w-full"}
                        value={simState.simRate}
                        onValueChange={async (e) => setSessionSimRate(session.id, e.value)}
                        minFractionDigits={0}
                        maxFractionDigits={1}
                        min={0.1}
                        max={8}/>
                    <span className={InputGroupAddon}>
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
    console.log(session);

    const sessionName = () => {
        switch (session.settings.sessionType) {
            case "STANDALONE":
                return "Standalone";
            case "VATSIM_SWEATBOX":
                return "VATSIM Sweatbox";
            case "PRIVATE_FSD":
                return "Private FSD";
        }
    }

    const closeSession = () => {
        confirmDialog({
            message: "Are you sure you want to end the current session?",
            header: "End Session",
            acceptLabel: "Yes",
            rejectLabel: "Cancel",

            async accept() {
                dispatch(resetSession());
                await saveStoreSessionId("");
            }
        })
    }

    return (
        <>
            <ConfirmDialog pt={{
                acceptButton: {
                    root: {
                        className: classNames(
                            'text-white bg-red-500 border border-red-500 hover:bg-red-600 hover:border-red-600'
                        )
                    }
                }
            }}/>
            <Toolbar
                className={"m-2"}
                start={<div className={"flex flex-wrap gap-2"}>
                    {getSimStateActions()}
                </div>}
                center={<div className={"flex flex-wrap gap-2"}>
                    <h5 className={"text-xl self-center"}>{sessionName()} Session</h5>
                    <Button
                        severity={"danger"}
                        tooltip={"End Session"}
                        tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                        text={true}
                        onClick={() => closeSession()}
                        icon={(options) => <FontAwesomeIcon icon={faCircleXmark} {...options.iconProps}/>}/>

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
                    {/*<SettingsModal/>*/}
                </div>}
            />
        </>
    )
}