import React, {Component} from "react";
import {Button, Modal} from "react-bootstrap";
import {getNavigraphPackages, navigraphAuthFlow} from "../../actions/navigraph_actions";
import {isNavigraphAuthenticated} from "../../actions/local_store_actions";

export class NavigraphAuthButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showVerificationModal: false,
            verificationUrl: "",
        }
    }

    attemptAuth = async () => {
        if (!isNavigraphAuthenticated()) {
            // Perform navigraph auth
            await navigraphAuthFlow((deviceAuthResp) => {
                // Get verification urls to display
                console.log(deviceAuthResp);

                this.openVerification(deviceAuthResp.verification_uri_complete);
            });
            this.closeVerification();
        }
    }

    getPackages = async () => {
        console.log(await getNavigraphPackages());
    }

    openVerification = (verifyUrl) => {
        this.setState({showVerificationModal: true, verificationUrl: verifyUrl});
    }

    closeVerification = () => {
        this.setState({showVerificationModal: false});
    }

    render(){
        const {showVerificationModal, verificationUrl} = this.state;
        return (
            <>
                <Button onClick={this.getPackages}>Get Packages</Button>
                <Button
                    variant={"secondary"}
                    disabled={isNavigraphAuthenticated()}
                    onClick={this.attemptAuth}
                >{isNavigraphAuthenticated() ? "Navigraph Authenticated" : "Authenticate with Navigraph"}</Button>

                <Modal show={showVerificationModal} onHide={this.closeVerification}>
                    <Modal.Title>Navigraph Auth</Modal.Title>
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
}