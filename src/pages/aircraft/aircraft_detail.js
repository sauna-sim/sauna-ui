import React, {Component} from "react";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {round} from "../../actions/utilities";

export class AircraftDetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false
        }
    }

    open = () => {
        this.setState({
            showModal: true
        });
    }

    close = () => {
        this.setState({
            showModal: false
        });
    }

    render() {
        const {showModal} = this.state;
        const {aircraft} = this.props;

        return <>
            <Button variant="secondary" onClick={this.open}>Details</Button>

            <Modal show={showModal && aircraft} onHide={this.close} size={"xl"}>
                <Modal.Header closeButton>
                    <Modal.Title>{aircraft.callsign} Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Altitude Data</h5>
                    <Row>
                        <Col lg={3} md={2}><b>Indicated Alt (ft):</b></Col>
                        <Col lg={1} md={2}>{round(aircraft.position.indicatedAltitude, 2)}</Col>
                        <Col lg={3} md={2}><b>Pressure Alt (ft):</b></Col>
                        <Col lg={1} md={2}>{round(aircraft.position.pressureAltitude, 2)}</Col>
                        <Col lg={3} md={2}><b>Density Alt (ft):</b></Col>
                        <Col lg={1} md={2}>{round(aircraft.position.densityAltitude, 2)}</Col>
                    </Row>
                    <Row>
                        <Col lg={3} md={2}><b>True Alt (ft):</b></Col>
                        <Col lg={1} md={2}>{round(aircraft.position.trueAltitude, 2)}</Col>
                        <Col lg={3} md={2}><b>Altimeter Setting (hPa):</b></Col>
                        <Col lg={1} md={2}>{round(aircraft.position.altimeterSetting_hPa, 2)}</Col>
                        <Col lg={3} md={2}><b>Surface Pressure (hPa):</b></Col>
                        <Col lg={1} md={2}>{round(aircraft.position.surfacePressure_hPa, 2)}</Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    }
}