import React, {Component} from "react";
import {Button, Image, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {
    checkNavigraphPackageRedux, navigraphAuthFlowRedux
} from "../../actions/navigraph_actions";
import NavigraphLogoPng from "../../assets/images/NavigraphLogo.png";
import {connect} from "react-redux";

class NavigraphAuthButtonComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showVerificationModal: false,
            verificationUrl: "",
            loading: false
        }
    }

    async componentDidMount() {
        await this.refreshPackage();
    }

    refreshPackage = async () => {
        // Verify/Update NavData file
        this.setState({
            loading: true
        });
        try {
            await this.props.checkNavigraphPackageRedux();
        } catch (e) {
            console.error(e);
        }
        this.setState({
            loading: false
        });
    }

    attemptAuth = async () => {
        this.setState({
            loading: true
        });
        // Perform navigraph auth
        await this.props.navigraphAuthFlowRedux((deviceAuthResp) => {
            // Get verification urls to display
            console.log(deviceAuthResp);

            this.openVerification(deviceAuthResp.verification_uri_complete);
        });
        this.closeVerification();
        try {
            await this.props.checkNavigraphPackageRedux();
        } catch (e) {
            console.error(e);
        }
        this.setState({
            loading: false
        });
    }

    openVerification = (verifyUrl) => {
        this.setState({showVerificationModal: true, verificationUrl: verifyUrl});
    }

    closeVerification = () => {
        this.setState({showVerificationModal: false});
    }

    getNavigraphButton = () => {
        const {navigraphState} = this.props;
        const {loading} = this.state;

        if (!navigraphState.authenticated) {
            return <Button
                variant={"secondary"}
                onClick={this.attemptAuth}
                disabled={loading}
            ><Image src={NavigraphLogoPng} width={20} height={20}/> Log In</Button>
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

        return (
            <>
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                    <Button
                        variant={navigraphState.isCurrent ? "success" : "warning"}
                        onClick={async () => await this.refreshPackage()}
                        disabled={loading}
                    ><Image src={NavigraphLogoPng} width={20} height={20}/> {packageVersion}</Button>
                </OverlayTrigger>
            </>
        )
    }

    render() {
        const {showVerificationModal, verificationUrl} = this.state;
        const {navigraphState} = this.props;

        console.log(navigraphState);
        return (
            <>
                {this.getNavigraphButton()}

                <Modal show={showVerificationModal} onHide={this.closeVerification}>
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
}

const mapStateToProps = (state) => ({
    navigraphState: state.navigraph
});

export const NavigraphAuthButton = connect(mapStateToProps, {
    checkNavigraphPackageRedux,
    navigraphAuthFlowRedux
})(NavigraphAuthButtonComponent);