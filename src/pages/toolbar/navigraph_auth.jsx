import React, {useEffect, useState} from "react";
import {checkNavigraphPackage, navigraphAuthFlow} from "../../actions/navigraph_actions.js";
import NavigraphLogoPng from "../../assets/images/NavigraphLogo.png";
import {useSelector} from "react-redux";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";

export const NavigraphAuthButton = ({}) => {
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationUrl, setVerificationUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const navigraphState = useSelector((state) => state.navigraph);

    useEffect(() => {
        void refreshPackage();
    }, []);

    const refreshPackage = async () => {
        // Verify/Update NavData file
        setLoading(true);
        setFailed(false);
        try {
            await checkNavigraphPackage();
            setLoading(false);
            setFailed(false);
        } catch (e) {
            console.error(e);
            if (e === "NAVIGRAPH_AUTH_EXPIRED") {
                setLoading(false);
                setFailed(false);
            } else {
                setLoading(false);
                setFailed(true);
            }
        }
    }

    const attemptAuth = async () => {
        setLoading(true);
        setFailed(false);

        // Perform navigraph auth
        try {
            await navigraphAuthFlow((deviceAuthResp) => {
                // Get verification urls to display
                openVerification(deviceAuthResp.verification_uri_complete);
            });
            closeVerification();
            await checkNavigraphPackage();
            setLoading(false);
            setFailed(false);
        } catch (e) {
            closeVerification();
            setLoading(false);
            setFailed(true);
            console.error(e);
        }
    }

    const openVerification = (verifyUrl) => {
        setShowVerificationModal(true);
        setVerificationUrl(verifyUrl);
    }

    const closeVerification = () => {
        setShowVerificationModal(false);
    }

    const getNavigraphButton = () => {
        if (!navigraphState.authenticated) {
            return <Button
                severity={failed ? "danger" : "secondary"}
                onClick={attemptAuth}
                loading={loading}
                icon={(options) => <img src={NavigraphLogoPng} width={18} height={18} {...options.iconProps} alt={"Navigraph Logo"}/>}
                label={failed ? "Failed" : "Log In"} />
        }

        let packageVersion = navigraphState.packageInfo.cycle;
        if (navigraphState.packageInfo.revision) {
            packageVersion += `r${navigraphState.packageInfo.revision}`;
        }

        let buttonVariant;

        if (failed) {
            buttonVariant = "danger";
        } else if (navigraphState.isCurrent) {
            buttonVariant = "success";
        } else {
            buttonVariant = "warning";
        }

        return (
            <>
                <Button
                    severity={buttonVariant}
                    onClick={refreshPackage}
                    loading={loading}
                    tooltip={`Reload ${navigraphState.isCurrent ? "Current" : "Outdated"} Navigraph Cycle ${packageVersion}`}
                    tooltipOptions={{position: "bottom", showDelay: 250, hideDelay: 400}}
                    icon={(options) => <img src={NavigraphLogoPng} width={18} height={18} {...options.iconProps} alt={"Navigraph Logo"}/>}
                    label={failed ? "Failed" : packageVersion} />
            </>
        )
    }

    return (
        <>
            {getNavigraphButton()}

            <Dialog visible={showVerificationModal} onHide={closeVerification}
                    header={"Navigraph Authentication"} closable={false}>
                <a
                    href={verificationUrl}
                    className="text-blue-600 bg-gray-500/10 p-3 rounded-lg"
                    target="_blank"
                    rel="noreferrer"
                >
                    Open sign in page
                </a>
                <span className="opacity-50">or scan this QR code:</span>
                <div className="p-2 rounded-lg bg-white mt-1">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${verificationUrl}`}
                        alt="Navigraph Verification QR Qode"/>
                </div>
            </Dialog>
        </>
    )
}