import React, {Component} from "react";
import {SettingsPage} from "./settings/settings";
import {loadMagneticFile} from "../actions/data_actions";
import {DataPage} from "./data/data";
import {AircraftPage} from "./aircraft/aircraft";

class MainApp extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <>
                <SettingsPage />
                <DataPage />
                <AircraftPage />
            </>
        );
    }
}

export default MainApp;