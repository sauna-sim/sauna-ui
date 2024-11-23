import React from "react";
import { Formik } from 'formik';
import { Modal, Button } from "react-bootstrap";

export default function AircraftListModal({ onClose, aircrafts, setAircrafts }) {
    
    
    return (
        <Modal show onHide={onClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add Aircraft</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Add aircraft form goes here (use Formik or a similar library).</p>
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
        </Modal>
    );
}
