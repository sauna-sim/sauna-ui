import React, {useEffect, useRef, useState} from "react";
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
import {round} from "../../actions/utilities.js";
import {debounce} from "lodash";
import { cleanupBeforeTauriExit } from "../../actions/tauri_actions.js";

export const Updater = () => {
    const updaterState = useSelector((state) => state.updater);
    const dispatch = useDispatch();
    const [update, setUpdate] = useState(null);
    const downloaded = useRef(0);

    useEffect(() => {
        if (!updaterState.prompted && !import.meta.env.DEV) {
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
                    dispatch(promptForUpdate());
                    setUpdate(update);
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
    const updateProgress = debounce(() => {
        console.log(downloaded.current);
        dispatch(updateDownloadProgress(downloaded.current));
        downloaded.current = 0;
    }, 100);

    const performUpdate = async () => {
        dispatch(updateDownloadStarted(0));

        if (!update){
            setUpdate(await check());
        }

        await update.download((e) => {
            switch (e.event) {
                case "Started":
                    dispatch(updateDownloadStarted(e.data.contentLength));
                    break;
                case "Progress":
                    downloaded.current += e.data.chunkLength;
                    updateProgress();
                    break;
                case "Finished":
                    dispatch(updateDownloadFinished());
                    break;
            }
        });
        await cleanupBeforeTauriExit();
        await update.install();
        await relaunch();
        dispatch(closeUpdatePrompt());
    }

    const getDownloadDialog = () => {
        const {step, downloaded, downloadSize} = updaterState;
        switch (step) {
            case updaterSteps.DOWNLOADING:
                const percent = round(downloadSize ? downloaded * 100 / downloadSize : 0);

                return <>
                    <h3>Downloading...</h3>
                    <ProgressBar value={percent}  />
                </>;
            case updaterSteps.INSTALLING:
                return <>
                    <h3>Installing...</h3>
                    <ProgressBar mode={"indeterminate"} />
                </>
        }
        return <></>;
    }

    const {step} = updaterState;

    return (
        <>
            <Dialog
                draggable={false}
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
                resizable={false}
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
                draggable={false}
                resizable={false}
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