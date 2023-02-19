import React, {Component} from "react";
import {SettingsModal} from "./settings/settings";
import {DataPage} from "./data/data";
import {AircraftPage} from "./aircraft/aircraft";
import Container from "react-bootstrap/Container";

class MainApp extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Container fluid>
                    <DataPage/>
                    <AircraftPage/>
                </Container>
            </>
        );
    }
}

export default MainApp;