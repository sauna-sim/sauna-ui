import React, {Component, Fragment} from "react";
import { open } from '@tauri-apps/api/dialog';
import {getLoadedSectorFiles, loadEuroscopeScenario, loadSectorFile} from "../../actions/data_actions";
import {connect} from "react-redux";
import {Badge, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMap} from "@fortawesome/free-solid-svg-icons";

class SectorFilesButtonComponent extends Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        await this.refreshSectorFiles();
    }

    refreshSectorFiles = async () => {
        await this.props.getLoadedSectorFiles();
    }

    loadSectorFile = async () => {
        const selected = await open({
            multiple: true,
            title: "Select Sector File",
            filters: [{
                name: "Sector File",
                extensions: ["sct", "sct2"]
            }],
        });

        if (selected !== null){
            if (Array.isArray(selected)){
                // Multiple scenario files selected
                for (const filename of selected){
                    await loadSectorFile(filename);
                    await loadEuroscopeScenario(filename);
                }
            } else {
                // Single file selected
                await loadSectorFile(selected);
            }
        }

        await this.refreshSectorFiles();
    }

    render() {
        const {sectorFilesLoaded} = this.props;

        const renderTooltip = (props) => (
            <Tooltip id="sector-files-button-tooltip" {...props}>
                Load Sector File NavData
            </Tooltip>
        );

        return (
            <>
                <OverlayTrigger
                    placement="bottom"
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip}
                >
                    <Button
                        variant={sectorFilesLoaded && sectorFilesLoaded.length > 0 ? "success" : "secondary"}
                        onClick={this.loadSectorFile}
                    ><FontAwesomeIcon icon={faMap}/> SCT <Badge
                        bg={"secondary"}>{sectorFilesLoaded ? sectorFilesLoaded.length : 0}</Badge></Button>
                </OverlayTrigger>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    sectorFilesLoaded: state.sectorFiles.value
});

export const SectorFilesButton = connect(mapStateToProps, {getLoadedSectorFiles})(SectorFilesButtonComponent);