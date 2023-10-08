import React, {Component} from "react";
import {loadEuroscopeScenario, loadSectorFile, loadDFDFile} from "../../actions/data_actions";
import {openElectronFileDialog} from "../../actions/electron_actions";
import {Button, ButtonToolbar} from "react-bootstrap";
import {SettingsModal} from "../settings/settings";
import {NavigraphAuthButton} from "../settings/navigraph_auth";

export class DataPage extends Component {
    constructor(props) {
        super(props);
    }

    chooseDFD = async () => {
        const filenames = openElectronFileDialog({
            title: "Select DFD File",
            filters: [{
                name: "DFD file",
                extensions: ["s3db"]
            }],
            properties: ["openFile"]
        });
        console.log(filenames);
        if (filenames && filenames.length > 0) {
            await loadDFDFile(filenames[0]);
        }
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
        // <Button variant={"info"} className="me-2" onClick={this.chooseDFD}>Load DFD</Button>
        return (
            <>
                <ButtonToolbar className={"mb-2 float-end"}>
                    <NavigraphAuthButton />
                    <Button variant={"success"} className="me-2" onClick={this.chooseEsFile}>Load Euroscope Scenario</Button>
                    <SettingsModal/>
                </ButtonToolbar>
            </>
        )
    }
}