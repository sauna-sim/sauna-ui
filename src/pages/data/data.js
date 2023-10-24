import React, {Component} from "react";
import {loadEuroscopeScenario, loadSectorFile} from "../../actions/data_actions";
import {openElectronFileDialog, openMapWindow} from "../../actions/electron_actions";
import {Button, ButtonToolbar, OverlayTrigger, Tooltip} from "react-bootstrap";
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

    openMapPage = async () => {
        await openMapWindow();
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
        const renderMapTooltip = (props) => (
            <Tooltip id="map-button-tooltip" {...props}>
                Open Map Window
            </Tooltip>
        )

        return (
            <>
                <ButtonToolbar className={"mb-2 float-end"}>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{show: 250, hide: 400}}
                        overlay={renderMapTooltip}
                    >
                        <Button variant={"secondary"} onClick={this.openMapPage}
                        >Map</Button>
                    </OverlayTrigger>{' '}
                    <Button variant={"info"} className="me-2" onClick={this.chooseSectorFile}>Load Sector File</Button>
                    <Button variant={"success"} className="me-2" onClick={this.chooseEsFile}>Load Euroscope Scenario</Button>
                    <SettingsModal/>
                </ButtonToolbar>
            </>
        )
    }
}