import React from "react";
import {DataPage} from "./data/data";
import {AircraftPage} from "./aircraft/aircraft";
import Container from "react-bootstrap/Container";
import {Col, Row} from "react-bootstrap";
import {useSelector} from "react-redux";
import {ApiConnectionSettings} from "./settings/api_connection_settings";

export default ({}) => {
    const apiServer = useSelector((state) => state.apiServer);

    if (apiServer.connected){
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
        )
    }

    return (
        <>
            <Container fluid>
                <Row>
                    {!apiServer.usingBuiltIn && <ApiConnectionSettings /> }
                </Row>
                <Row>
                    <div style={{
                        margin: 0,
                        position: "absolute",
                        bottom: "50%"
                    }}>
                        <center>
                            <h1>Trying to connect to Sauna API...</h1>
                        </center>
                    </div>
                </Row>
            </Container>

        </>
    )
}