import React, {Component, useState} from "react";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {round} from "../../actions/utilities";

export const AircraftDetail = ({aircraft}) => {
    const [showModal, setShowModal] = useState(false);

    open = () => {
        setShowModal(true);
    }

    close = () => {
        setShowModal(false);
    }

    return <>
        <Button variant="secondary" onClick={open}>Details</Button>

        <Modal show={showModal && aircraft} onHide={close} size={"xl"}>
            <Modal.Header closeButton>
                <Modal.Title>{aircraft.callsign} Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Heading Data</h5>
                <Row>
                    <Col lg={3} md={2}><b>Magnetic Heading:</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.heading_Mag.degrees, 2)}</Col>
                    <Col lg={3} md={2}><b>True Heading:</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.heading_True.degrees, 2)}</Col>
                </Row>
                <Row>
                    <Col lg={3} md={2}><b>Magnetic Track:</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.track_Mag.degrees, 2)}</Col>
                    <Col lg={3} md={2}><b>True Track:</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.track_True.degrees, 2)}</Col>
                </Row>
                <h5>Altitude Data</h5>
                <Row>
                    <Col lg={3} md={2}><b>Indicated Alt (ft):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.indicatedAltitude.feet, 2)}</Col>
                    <Col lg={3} md={2}><b>Pressure Alt (ft):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.pressureAltitude.feet, 2)}</Col>
                    <Col lg={3} md={2}><b>Density Alt (ft):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.densityAltitude.feet, 2)}</Col>
                </Row>
                <Row>
                    <Col lg={3} md={2}><b>True Alt (ft):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.trueAltitude.feet, 2)}</Col>
                    <Col lg={3} md={2}><b>Altimeter Setting (hPa):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.altimeterSetting.hectopascals, 2)}</Col>
                    <Col lg={3} md={2}><b>Surface Pressure (hPa):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.surfacePressure.hectopascals, 2)}</Col>
                </Row>
                <h5>Speed Data</h5>
                <Row>
                    <Col lg={3} md={2}><b>IAS (kts):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.indicatedAirSpeed.knots, 2)}</Col>
                    <Col lg={3} md={2}><b>TAS (kts):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.trueAirSpeed.knots, 2)}</Col>
                    <Col lg={3} md={2}><b>GS (kts):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.groundSpeed.knots, 2)}</Col>
                </Row>
                <Row>
                    <Col lg={3} md={2}><b>Mach:</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.position.machNumber, 2)}</Col>
                </Row>
                <h5>FMS Data</h5>
                <Row>
                    <Col lg={3} md={2}><b>aTk (m):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.fms.alongTrackDistance_m, 2)}</Col>
                    <Col lg={3} md={2}><b>xTk (m):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.fms.crossTrackDistance_m, 2)}</Col>
                    <Col lg={3} md={2}><b>rTk (degs):</b></Col>
                    <Col lg={1} md={2}>{round(aircraft.fms.requiredTrueCourse, 2)}</Col>
                </Row>
            </Modal.Body>
        </Modal>
    </>
}