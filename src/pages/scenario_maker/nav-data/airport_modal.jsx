import React from "react";
import { Formik, getIn } from "formik";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import * as Yup from "yup";

export default function AirportModal({onClose, onAirportSubmit, airport, airports}) {
    const formSchema = Yup.object().shape({

    });

    const onSubmit = async (values) => {
        onAirportSubmit(values);
        onClose();
    };

    const handleChangeUpperCase = (handleChangeFunction) => {
        return (e) => {
            e.target.value = e.target.value.toUpperCase();
            handleChangeFunction(e);
        }
    };
    return(
        <Modal
            show onHide={onClose}
            backdrop="static"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{airport ? "Edit Airport" : "Add Airport"}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={airport? airport:{
                    airportIdent: "",
                    airportElev: "",
                    runways: [
                        {
                            thres1: {ident: "", lat: "", lon: ""},
                            thres2: {ident: "", lat: "", lon: ""},
                        },
                    ],
                    sids: [
                        {
                            name: "",
                            route: "",
                            transitions: [
                                {
                                    runway: "",
                                    route: "",
                                }
                            ]
                        }
                    ],
                    stars: [
                        {
                            name: "",
                            route: "",
                            transitions: [
                                {
                                    runway: "",
                                    route: "",
                                }
                            ]
                        }
                    ]
                }}
                validationSchema={formSchema}
                onSubmit={onSubmit}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <h5>Airport Info</h5>
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <Form.Label>ICAO</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="airportIdent"
                                            value={values.airportIdent}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "airportIdent") && getIn(errors, "airportIdent")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "airportIdent")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col sm={6}>
                                    <Form.Label>Elevation</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="airportElev"
                                            type="number"
                                            value={values.airportElev}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            isInvalid={getIn(touched, "airportElev") && getIn(errors, "airportElev")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getIn(errors, "airportElev")}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <h5>Runways</h5>
                            {values.runways.map((runway, index) => (
                                <React.Fragment key={index}>
                                    <Row className="mb-3">
                                        <Col sm={4}>
                                            <Form.Label>Thres 1 Ident</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name={`runways[${index}].thres1.ident`}
                                                    value={runway.thres1.ident}
                                                    onChange={handleChangeUpperCase(handleChange)}
                                                    onBlur={handleBlur}
                                                    isInvalid={
                                                        getIn(touched, `runways[${index}].thres1.ident`) &&
                                                        getIn(errors, `runways[${index}].thres1.ident`)
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, `runways[${index}].thres1.ident`)}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={4}>
                                            <Form.Label>Thres 1 Lat</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name={`runways[${index}].thres1.lat`}
                                                    type="number"
                                                    value={runway.thres1.lat}
                                                    onChange={handleChangeUpperCase(handleChange)}
                                                    onBlur={handleBlur}
                                                    isInvalid={
                                                        getIn(touched, `runways[${index}].thres1.lat`) &&
                                                        getIn(errors, `runways[${index}].thres1.lat`)
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, `runways[${index}].thres1.lat`)}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={4}>
                                            <Form.Label>Thres 1 Lon1</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name={`runways[${index}].thres1.lon`}
                                                    type="number"
                                                    value={runway.thres1.lon}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={
                                                        getIn(touched, `runways[${index}].thres1.lon`) &&
                                                        getIn(errors, `runways[${index}].thres1.lon`)
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, `runways[${index}].thres1.lon`)}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col sm={4}>
                                            <Form.Label>Thres 2 Ident</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name={`runways[${index}].thres2.ident`}
                                                    value={runway.thres2.ident}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={
                                                        getIn(touched, `runways[${index}].thres2.ident`) &&
                                                        getIn(errors, `runways[${index}].thres2.ident`)
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, `runways[${index}].thres2.ident`)}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={4}>
                                            <Form.Label>Thres 2 Lat</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name={`runways[${index}].thres2.lat`}
                                                    type="number"
                                                    value={runway.thres2.lat}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={
                                                        getIn(touched, `runways[${index}].thres2.lat`) &&
                                                        getIn(errors, `runways[${index}].thres2.lat`)
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, `runways[${index}].thres2.lat`)}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={4}>
                                            <Form.Label>Thres 2 Lon</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name={`runways[${index}].thres2.lon`}
                                                    type="number"
                                                    value={runway.thres2.lon}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={
                                                        getIn(touched, `runways[${index}].thres2.lon`) &&
                                                        getIn(errors, `runways[${index}].thres2.lon`)
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getIn(errors, `runways[${index}].thres2.lon`)}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                </React.Fragment>
                            ))}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Form>

                )}
            </Formik>
        </Modal>
    );
}