import React, {Component} from "react";
import {DataPage} from "./data/data";
import {AircraftPage} from "./aircraft/aircraft";
import Container from "react-bootstrap/Container";
import {Col, Row} from "react-bootstrap";

class MainApp extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Container fluid>
                    <Row>
                        <Col md="auto">
                            <h3>Aircraft</h3>
                        </Col>
                        <Col>
                            <DataPage/>
                        </Col>
                    </Row>
                    <Row>
                        <AircraftPage/>
                    </Row>
                </Container>
            </>
        );
    }
}

export default MainApp;