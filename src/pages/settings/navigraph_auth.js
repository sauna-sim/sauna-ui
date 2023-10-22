import React, {Component} from "react";
import {Button, Modal} from "react-bootstrap";
import {
    checkNavigraphPackageRedux, navigraphAuthFlowRedux
} from "../../actions/navigraph_actions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect} from "react-redux";
import {faMap} from "@fortawesome/free-solid-svg-icons";

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
        await this.props.checkNavigraphPackageRedux();
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
        await this.props.checkNavigraphPackageRedux();
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

        if (!navigraphState.authenticated){
            return <Button
                variant={"secondary"}
                onClick={this.attemptAuth}
                disabled={loading}
            >Authenticate Navigraph</Button>
        }

        let packageVersion = navigraphState.packageInfo.cycle;
        if (navigraphState.packageInfo.revision){
            packageVersion += `r${navigraphState.packageInfo.revision}`;
        }

        return <Button
            variant={navigraphState.isCurrent ? "success" : "warning"}
            onClick={async () => await this.refreshPackage()}
            disabled={loading}
        ><FontAwesomeIcon icon={faMap} /> {packageVersion}</Button>
    }

    render(){
        const {showVerificationModal, verificationUrl} = this.state;
        const {navigraphState} = this.props;

        console.log(navigraphState);
        return (
            <>
                {this.getNavigraphButton()}

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

const mapStateToProps = (state) => ({
    navigraphState: state.navigraph
});

export const NavigraphAuthButton = connect(mapStateToProps, {checkNavigraphPackageRedux, navigraphAuthFlowRedux})(NavigraphAuthButtonComponent);