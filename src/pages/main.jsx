import React, {Component} from "react";
import {DataPage} from "./data/data";
import {AircraftPage} from "./aircraft/aircraft";
import Container from "react-bootstrap/Container";
import {Col, Row} from "react-bootstrap";
import {connect} from "react-redux";
import {ApiConnectionSettings} from "./settings/api_connection_settings";

class MainAppComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.apiServer.connected) {
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

        return (
            <>
                <Container fluid>
                    <Row>
                        {!this.props.apiServer.usingBuiltIn && <ApiConnectionSettings /> }
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
}

function mapStateToProps({apiServer}) {
    return {
        apiServer
    }
}

export default connect(mapStateToProps, null)(MainAppComponent);