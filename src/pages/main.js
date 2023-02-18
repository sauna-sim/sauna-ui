import React, {Component} from "react";
import {getUiSettings, saveUiSettings} from "../actions/localStoreActions";

class MainApp extends Component {
    constructor(props){
        super(props);

        this.state = {
            uiSettings: {
                apiHostName: "localhost",
                apiPort: 5000
            },
            storeUiSets: {}
        }
    }

    async componentDidMount() {
        const uiSets = await getUiSettings();
        const uiStoreSets = await getUiSettings();
        this.setState({
            uiSettings: uiSets,
            storeUiSets: uiStoreSets
        });
    }

    onHostNameChange(e){
        let newUiSettings = this.state.uiSettings;
        newUiSettings.apiHostName = e.target.value;
        this.setState({
            uiSettings: newUiSettings
        });
    }

    onPortChange(e){
        let newUiSettings = this.state.uiSettings;
        newUiSettings.apiPort = parseInt(e.target.value, 10);
        this.setState({
            uiSettings: newUiSettings
        });
    }

    async save(){
        saveUiSettings(this.state.uiSettings);
        const uiSets = await getUiSettings();
        const uiStoreSets = await getUiSettings();
        this.setState({
            uiSettings: uiSets,
            storeUiSets: uiStoreSets
        });
    }

    render(){
        return (
            <>
                <h1>Hello World</h1>
                <div>{JSON.stringify(this.state.storeUiSets)}</div>
                <input name="hostname" value={this.state.uiSettings.apiHostName} onChange={(e) => this.onHostNameChange(e)} />
                <input name="port" type={"number"} value={this.state.uiSettings.apiPort} onChange={(e) => this.onPortChange(e)} />
                <button onClick={() => this.save()}>Save</button>
            </>
        );
    }
}

export default MainApp;