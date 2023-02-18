import React, {Component} from "react";
import {Formik, Field} from "formik";
import {getStoreItem, getUiSettings, saveUiSettings} from "../../actions/local_store_actions";
import {getFsdProtocolRevisions} from "../../actions/enum_actions";
import {updateServerSettings} from "../../actions/data_actions";

export class SettingsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            protocolRevisions: []
        }
    }

    async componentDidMount() {
        const revisions = await getFsdProtocolRevisions();
        console.log(revisions);
        this.setState({
            protocolRevisions: revisions
        });
    }

    getProtocolRevisionOptions = () => {
        return this.state.protocolRevisions.map((rev) =>
            <option key={`protocol-revision-${rev}`} value={rev}>{rev}</option>);
    }

    onSubmit = async (values) => {
        saveUiSettings(values);
        await updateServerSettings(getStoreItem("settings.apiSettings"));
    }

    render() {
        return (
            <>
                <h3>Settings</h3>
                <Formik
                    initialValues={getUiSettings()}
                    onSubmit={this.onSubmit}>
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                      }) => (
                        <form onSubmit={handleSubmit}>
                            <h4>Sauna API Server Settings</h4>
                            <label htmlFor="apiServer.hostName">Hostname: </label>
                            <Field name="apiServer.hostName" />
                            <label htmlFor="apiServer.port">Port: </label>
                            <Field name="apiServer.port" type="number" /><br />
                            <label htmlFor="apiSettings.posCalcRate">Position Calculation Rate (ms): </label>
                            <Field name="apiSettings.posCalcRate" type="number" />
                            <label htmlFor="apiSettings.commandFrequency">VHF Command Frequency: </label>
                            <Field name="apiSettings.commandFrequency" /><br />

                            <h4>FSD Connection Info</h4>
                            <label htmlFor="fsdConnection.networkId">Network ID: </label>
                            <Field name="fsdConnection.networkId" />
                            <label htmlFor="fsdConnection.password">Password: </label>
                            <Field name="fsdConnection.password" type="password" /><br />
                            <label htmlFor="fsdConnection.hostname">Hostname: </label>
                            <Field name="fsdConnection.hostname" />
                            <label htmlFor="fsdConnection.port">Port: </label>
                            <Field name="fsdConnection.port" type="number" />
                            <label htmlFor="fsdConnection.protocol">Protocol: </label>
                            <Field name="fsdConnection.protocol" as="select">
                                {this.getProtocolRevisionOptions()}
                            </Field>

                            <br />
                            <button type="submit" disabled={isSubmitting}>
                                Save
                            </button>
                        </form>
                    )}
                </Formik>
            </>
        )
    }
}