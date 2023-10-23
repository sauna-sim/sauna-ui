import React, {Component} from "react";
import {loadEuroscopeScenario, loadSectorFile, loadDFDFile} from "../../actions/data_actions";
import {openElectronFileDialog} from "../../actions/electron_actions";
import {Button, ButtonGroup, ButtonToolbar} from "react-bootstrap";
import {SettingsModal} from "../settings/settings";
import {NavigraphAuthButton} from "../settings/navigraph_auth";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileCirclePlus, faPlane} from "@fortawesome/free-solid-svg-icons";
import {SectorFilesButton} from "../settings/sector_files_button";

export class DataPage extends Component {
    constructor(props) {
        super(props);
    }

    chooseEsFile = async () => {
        const filenames = openElectronFileDialog({
            title: "Select Euroscope Scenario File",
            filters: [{
                name: "Euroscope Scenario File",
                extensions: ["txt"]
            }],
            properties: ["openFile"]
        });
        console.log(filenames);
        if (filenames && filenames.length > 0) {
            await loadEuroscopeScenario(filenames[0]);
        }
    }

    render() {
        return (
            <>
                <div className={"mb-2 float-end"}>
                    <ButtonGroup>
                        <NavigraphAuthButton/>
                        <SectorFilesButton/>
                    </ButtonGroup>{' '}
                    <Button variant={"success"} onClick={this.chooseEsFile}
                    ><FontAwesomeIcon icon={faFileCirclePlus}/> <FontAwesomeIcon icon={faPlane}/> ES</Button>{' '}
                    <SettingsModal/>
                </div>
            </>
        )
    }
}