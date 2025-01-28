import React from "react";
import {open} from '@tauri-apps/api/dialog';
import {loadEuroscopeScenario, loadSaunaScenario} from "../../actions/data_actions";
import {Button, ButtonGroup, Dropdown, OverlayTrigger, Tooltip} from "react-bootstrap";
import {SettingsModal} from "../settings/settings";
import {NavigraphAuthButton} from "../settings/navigraph_auth";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileCirclePlus, faMap, faMessage, faPlane} from "@fortawesome/free-solid-svg-icons";
import {SectorFilesButton} from "../settings/sector_files_button";
import {createCommandWindow, createMapWindow, createSaunaScenarioMakerWindow} from "../../actions/tauri_actions";

export const DataPage = ({}) => {
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
                await loadSaunaScenario(filename);
            }
        }
    }

    const renderScenarioTooltip = (props) => (
        <Tooltip id="es-scenario-button-tooltip" {...props}>
            Load Scenario File
        </Tooltip>
    );
    const renderMapTooltip = (props) => (
        <Tooltip id="map-button-tooltip" {...props}>
            Open Map Window
        </Tooltip>
    );

    const renderSaunaTooltip = (props) => (
        <Tooltip id="sauna-button-tooltip" {...props}>
            Open Sauna Scenario Maker
        </Tooltip>
    );

    const renderCommandTooltip = (props) => (
        <Tooltip id="command-button-tooltip" {...props}>
            Open Command Window
        </Tooltip>
    );

    return (
        <>
            <div className={"mb-2 float-end"}>
                <OverlayTrigger
                    placement="bottom"
                    delay={{show: 250, hide: 400}}
                    overlay={renderSaunaTooltip}
                >
                    <Button variant={"primary"} onClick={createSaunaScenarioMakerWindow}
                    >Scenario Maker</Button>
                </OverlayTrigger>{' '}

                <OverlayTrigger overlay={renderCommandTooltip}
                                placement={"bottom"}
                                delay={{show: 250, hide: 400}}>
                    <Button variant={"secondary"} onClick={createCommandWindow}>
                        <FontAwesomeIcon icon={faMessage} />
                    </Button>
                </OverlayTrigger>{' '}

                <OverlayTrigger
                    placement="bottom"
                    delay={{show: 250, hide: 400}}
                    overlay={renderMapTooltip}
                >
                    <Button variant={"secondary"} onClick={openMapPage}
                    ><FontAwesomeIcon icon={faMap}/></Button>
                </OverlayTrigger>{' '}

                <ButtonGroup>
                    <NavigraphAuthButton/>
                    <SectorFilesButton/>
                </ButtonGroup>{' '}

                <Dropdown className="d-inline" align="end">
                    <OverlayTrigger
                        placement="bottom"
                        delay={{show: 250, hide: 400}}
                        overlay={renderScenarioTooltip}
                    >
                        <Dropdown.Toggle variant="primary">
                            <FontAwesomeIcon icon={faFileCirclePlus}/>
                            <FontAwesomeIcon icon={faPlane}/>
                            ES
                        </Dropdown.Toggle>
                    </OverlayTrigger>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={chooseEsFile}>ES Scenario file</Dropdown.Item>
                        <Dropdown.Item onClick={chooseSaunaScenarioFile}>Sauna Scenario file</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>{' '}
                <SettingsModal/>
            </div>
        </>
    )
}