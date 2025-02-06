import React, {useEffect} from "react";
import {check} from "@tauri-apps/plugin-updater";
import {getStoreItem, setStoreItem} from "../../actions/local_store_actions.js";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {relaunch} from "@tauri-apps/plugin-process";
import {useDispatch, useSelector} from "react-redux";
import {
    closeUpdatePrompt,
    promptForUpdate,
    updateDownloadFinished,
    updateDownloadProgress,
    updateDownloadStarted,
    updaterSteps
} from "../../redux/slices/updaterSlice.js";
import {ProgressBar} from "primereact/progressbar";

export const Updater = () => {
    const updaterState = useSelector((state) => state.updater);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!updaterState.prompted && import.meta.env.DEV) {
            void checkForUpdates();
        }
    }, []);

    const checkForUpdates = async () => {
        try {
            // Check for updates on launch
            const update = await check();

            // Check if update was found
            if (update && !updaterState.prompted) {
                // Get ignore version from settings
                const ignoreVersion = await getStoreItem("settings.updaterIgnoreVersion");

                if (ignoreVersion !== update.version) {
                    // Prompt for update
                    dispatch(promptForUpdate(update));
                    console.log(update);
                }
            }
        } catch (e) {
            console.log("Failed to get update information", e);
        }
    }

    const ignoreUpdate = async () => {
        await setStoreItem("settings.updaterIgnoreVersion", update.version);
        dispatch(closeUpdatePrompt());
    }

    const performUpdate = async () => {
        dispatch(updateDownloadStarted(0));

        await updaterState.update.downloadAndInstall((e) => {
            switch (e.event) {
                case "Started":
                    dispatch(updateDownloadStarted(e.data.contentLength));
                    break;
                case "Progress":
                    dispatch(updateDownloadProgress(e.data.chunkLength));
                    break;
                case "Finished":
                    dispatch(updateDownloadFinished());
                    break;
            }
        });
        await relaunch();
        dispatch(closeUpdatePrompt());
    }

    const getDownloadDialog = () => {
        const {step, downloaded, downloadSize} = updaterState;
        switch (step) {
            case updaterSteps.DOWNLOADING:
                const percent = downloadSize ? downloaded * 100 / downloadSize : 0;

                return <>
                    <h3>Downloading...</h3>
                    <ProgressBar value={percent} />
                </>;
            case updaterSteps.INSTALLING:
                return <>
                    <h3>Installing...</h3>
                    <ProgressBar mode={"indeterminate"} />
                </>
        }
        return <></>;
    }

    const {step, update} = updaterState;

    return (
        <>
            <Dialog
                header={"Update Available!"}
                onHide={() => {
                }}
                visible={step === updaterSteps.UPDATE_PROMPT}
                modal={true}
                position={"center"}
                style={{width: '500px'}}
                breakpoints={{'750px': '75vw', '500px': '100vw'}}
                closable={false}
                closeOnEscape={false}
                footer={<>
                    <Button type={"button"} label={"Dismiss"} onClick={() => dispatch(closeUpdatePrompt())}/>
                    <Button type={"button"} severity={"danger"} label={"Skip Version"} onClick={ignoreUpdate}/>
                    <Button type={"button"} severity={"success"} label={"Update"} onClick={performUpdate}/>
                </>}
            >
                <h3 className={"mt-0"}>Version {update?.version} is available!</h3>
                <p>Would you like to download and install it?</p>
                <small>This will cause the application to restart after installing.</small>
                <p>You can skip this version to not be prompted again until the next version.</p>
            </Dialog>
            <Dialog
                header={"Updating..."}
                onHide={() => {
                }}
                visible={step === updaterSteps.DOWNLOADING || step === updaterSteps.INSTALLING}
                modal={true}
                position={"center"}
                style={{width: '500px'}}
                breakpoints={{'750px': '75vw', '500px': '100vw'}}
                closable={false}
                closeOnEscape={false}
            >
                {getDownloadDialog()}
            </Dialog>
        </>
    )
}