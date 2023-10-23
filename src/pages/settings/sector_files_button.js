import React, {Component, Fragment} from "react";
import {getLoadedSectorFiles, loadEuroscopeScenario, loadSectorFile} from "../../actions/data_actions";
import {connect} from "react-redux";
import {Badge, Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMap} from "@fortawesome/free-solid-svg-icons";
import {openElectronFileDialog} from "../../actions/electron_actions";

class SectorFilesButtonComponent extends Component {
    constructor(props){
        super(props);
    }

    async componentDidMount() {
        await this.refreshSectorFiles();
    }

    refreshSectorFiles = async () => {
        await this.props.getLoadedSectorFiles();
    }

    loadSectorFile = async () => {
        const filenames = openElectronFileDialog({
            title: "Select Sector File",
            filters: [{
                name: "Sector File",
                extensions: ["sct", "sct2"]
            }],
            properties: ["openFile"]
        });

        if (filenames && filenames.length > 0) {
            await loadSectorFile(filenames[0]);
        }

        await this.refreshSectorFiles();
    }

    render() {
        const {sectorFilesLoaded} = this.props;
        console.log(sectorFilesLoaded);
        return (
            <>
                <Button
                    variant={sectorFilesLoaded && sectorFilesLoaded.length > 0 ? "success" : "secondary"}
                    onClick={this.loadSectorFile}
                ><FontAwesomeIcon icon={faMap}/> SCT <Badge bg={"secondary"}>{sectorFilesLoaded ? sectorFilesLoaded.length : 0}</Badge></Button>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    sectorFilesLoaded: state.sectorFiles.value
});

export const SectorFilesButton = connect(mapStateToProps, {getLoadedSectorFiles})(SectorFilesButtonComponent);