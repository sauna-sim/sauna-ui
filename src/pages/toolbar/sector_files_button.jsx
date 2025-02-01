import React, {Fragment, useEffect} from "react";
import {open} from '@tauri-apps/plugin-dialog';
import {getLoadedSectorFiles, loadSectorFile} from "../../actions/data_actions.js";
import {useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMap} from "@fortawesome/free-solid-svg-icons/faMap";
import {Button} from "primereact/button";

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

    console.log(sectorFilesLoaded);

    return (
        <>
            <Button
                severity={sectorFilesLoaded && sectorFilesLoaded.length > 0 ? "success" : "secondary"}
                onClick={loadASectorFile}
                tooltip={"Load Sector File NavData"}
                tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                icon={(options) => <FontAwesomeIcon icon={faMap} {...options.iconProps} />}
                label={"SCT"}
                badge={`${sectorFilesLoaded ? sectorFilesLoaded.length : 0}`} />
        </>
    )
}