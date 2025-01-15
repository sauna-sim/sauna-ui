import React, {Fragment, useEffect} from "react";
import {open} from '@tauri-apps/api/dialog';
import {getLoadedSectorFiles, loadSectorFile} from "../../actions/data_actions";
import {useSelector} from "react-redux";
import {Badge, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMap} from "@fortawesome/free-solid-svg-icons";

export const SectorFilesButton = ({}) => {
    const sectorFilesLoaded = useSelector(state => state.sectorFiles.value);

    useEffect(() => {
        void refreshSectorFiles();
    }, []);

    const refreshSectorFiles = async () => {
        await getLoadedSectorFiles();
    }

    const loadASectorFile = async () => {
        const selected = await open({
            multiple: true,
            title: "Select Sector File",
            filters: [{
                name: "Sector File",
                extensions: ["sct", "sct2"]
            }],
        });

        if (selected !== null) {
            if (Array.isArray(selected)) {
                // Multiple scenario files selected
                for (const filename of selected) {
                    await loadSectorFile(filename);
                }
            } else {
                // Single file selected
                await loadSectorFile(selected);
            }
        }

        await refreshSectorFiles();
    }

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
                    onClick={loadASectorFile}
                ><FontAwesomeIcon icon={faMap}/> SCT <Badge
                    bg={"secondary"}>{sectorFilesLoaded ? sectorFilesLoaded.length : 0}</Badge></Button>
            </OverlayTrigger>
        </>
    )
}