import React, {useEffect, useState} from "react";
import {Button, Image, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {checkNavigraphPackage, navigraphAuthFlow} from "../../actions/navigraph_actions";
import NavigraphLogoPng from "../../assets/images/NavigraphLogo.png";
import {useSelector} from "react-redux";

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
            if (e === "NAVIGRAPH_AUTH_EXPIRED"){
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
                console.log(deviceAuthResp);

                openVerification(deviceAuthResp.verification_uri_complete);
            });
            closeVerification();
            await checkNavigraphPackage();
            setLoading(false);
            setFailed(false);
        } catch (e){
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
                variant={failed ? "danger" : "secondary"}
                onClick={attemptAuth}
                disabled={loading}
            ><Image src={NavigraphLogoPng} width={20} height={20}/> {failed ? "Failed" : "Log In"}</Button>
        }

        let packageVersion = navigraphState.packageInfo.cycle;
        if (navigraphState.packageInfo.revision) {
            packageVersion += `r${navigraphState.packageInfo.revision}`;
        }

        const renderTooltip = (props) => (
            <Tooltip id="navigraph-auth-button-tooltip" {...props}>
                Reload {navigraphState.isCurrent ? "Current" : "Outdated"} Navigraph Cycle {packageVersion}
            </Tooltip>
        );

        let buttonVariant;

        if (failed){
            buttonVariant = "danger";
        } else if (navigraphState.isCurrent){
            buttonVariant = "success";
        } else {
            buttonVariant = "warning";
        }

        return (
            <>
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                    <Button
                        variant={buttonVariant}
                        onClick={refreshPackage}
                        disabled={loading}
                    ><Image src={NavigraphLogoPng} width={20} height={20}/> {failed ? "Failed" : packageVersion}</Button>
                </OverlayTrigger>
            </>
        )
    }

    console.log(navigraphState);

    return (
        <>
            {getNavigraphButton()}

            <Modal show={showVerificationModal} onHide={closeVerification}>
                <Modal.Header>
                    <Modal.Title>Navigraph Authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                </Modal.Body>
            </Modal>
        </>
    )
}