import React from "react";
import { Formik } from 'formik';
import {Button, Col, Form, InputGroup, Modal, Row} from "react-bootstrap";
import * as Yup from "yup";

export default function AircraftListModal({ onClose, aircrafts, setAircrafts }) {
    
    const formSchema = Yup.object().shape({
        callsign: Yup.string()
            .required("Callsign is Required")
            .matches(/^[a-zA-Z0-9]+$/, "Alphanumeric characters only!"),
        pos: Yup.object().shape({
            lat: Yup.number()
                .required("Latitude is required")
                .min(-90, "Latitude must be between -90 and 90")
                .max(90, "Latitude must be between -90 and 90"),
            lon: Yup.number()
                .required("Longitude is required")
                .min(-180, "Longitude must be between -180 and 180")
                .max(180, "Longitude must be between -180 and 180"),
        }),
        alt: Yup.number()
            .required("Altitude is required")
            .min(0, "The altitude has to be atleast 0")
            .max(99999, "The altitude cannot exceed 99,999ft"),
        squawk: Yup.string()
            .required("Squawk required")
            .matches(/^[0-7][0-7][0-7][0-7]$/, "Squawk must be between 0000-7777"),
        dest: Yup.string()
            .required("Destination airport is required")
            .matches(/^[a-zA-Z0-9]{3,4}$/, "Alphanumeric characters only!"),
        arr: Yup.string()
        .required("Destination airport is required")
        .matches(/^[a-zA-Z0-9]{3,4}$/, "Alphanumeric characters only!"),
        fp: Yup.object().shape({
            route: Yup.string()
                .required("Flight Plan route is required"),
            alt: Yup.number()
            .required("Altitude is required")
            .min(0, "The altitude has to be atleast 0")
            .max(99999, "The altitude cannot exceed 99,999ft"),
            tas: Yup.number()
                .min(0, "Airspeed has to be atleast 1"),
        })

    })
    
    const handleSubmit = async (values) => {        
        const newAircraft = {
          callsign: values.callsign,
          pos: {
            lat: values.pos.lat,
            lon: values.pos.lon,
          },
          alt: values.alt,
          acftType: values.acftType,
          squawk: values.squawk,
          dest: values.dest,
          arr: values.arr,
          fp: {
            route: values.fp.route,
            alt: values.fp.alt,
            tas: values.fp.tas,
            flightRules: values.fp.flightRules,
          },
        };
            
        setAircrafts((prevAircrafts) => [...prevAircrafts, newAircraft]);
            
        onClose();
      };
    return (
        <Modal 
            show onHide={onClose} 
            backdrop="static"
            centered 
        >
            <Modal.Header closeButton>
                <Modal.Title>Add Aircraft</Modal.Title>
            </Modal.Header>
            <Formik 
                initialValues={{
                    callsign: "",
                    pos: {
                        lat: "",
                        lon: "",
                    },
                    alt: "",
                    acftType: "",
                    squawk: "",
                    dest: "", 
                    arr: "",
                    fp: {
                        route: "",
                        alt: "",
                        tas: "",
                        flightRules: "",
                    },
                }}                
                validationSchema={formSchema}
                onSubmit={handleSubmit}
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
                            <h5>Aircraft Settings</h5>
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <Form.Label>Callsign</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            name="callsign"
                                            type="string"
                                            value={values.callsign}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.callsign && !!errors.callsign}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.callsign}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={() => {
                                // Logic for saving changes
                                onClose();
                            }}>
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}                                                
            </Formik>            
        </Modal>
    );
}
