import React, {Component} from "react";
import {loadEuroscopeScenario, loadMagneticFile, loadSectorFile} from "../../actions/data_actions";
import {openElectronFileDialog} from "../../actions/electron_actions";
import {Button, ButtonToolbar} from "react-bootstrap";
import {SettingsModal} from "../settings/settings";

export class DataPage extends Component {
    constructor(props) {
        super(props);
    }

    chooseSectorFile = async () => {
        const filenames = openElectronFileDialog({
            title: "Select Sector File",
            filters: [{
                name: "Sector File",
                extensions: ["sct", "sct2"]
            }],
            properties: ["openFile"]
        });
        console.log(filenames);
        if (filenames && filenames.length > 0) {
            await loadSectorFile(filenames[0]);
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
        return (
            <>
                <ButtonToolbar className={"mb-2 float-end"}>
                    <Button variant={"info"} className="me-2" onClick={() => loadMagneticFile()}>Load Magnetic Data</Button>
                    <Button variant={"info"} className="me-2" onClick={this.chooseSectorFile}>Load Sector File</Button>
                    <Button variant={"success"} className="me-2" onClick={this.chooseEsFile}>Load Euroscope Scenario</Button>
                    <SettingsModal/>
                </ButtonToolbar>
            </>
        )
    }
}