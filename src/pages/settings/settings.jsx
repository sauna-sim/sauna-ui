import React, {useEffect, useState} from "react";
import {Formik, getIn} from "formik";
import {getApiSettings, getFsdSettings, getStoreItem, saveApiSettings, saveFsdSettings, storeSave} from "../../actions/local_store_actions";
import {getFsdProtocolRevisions} from "../../actions/enum_actions";
import {updateServerSettings} from "../../actions/data_actions";
import * as Yup from "yup";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGear} from "@fortawesome/free-solid-svg-icons/faGear";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Password} from "primereact/password";
import {InputMask} from "primereact/inputmask";

export const SettingsModal = ({}) => {
    const [showModal, setShowModal] = useState(false);
    const [protocolRevisions, setProtocolRevisions] = useState([]);
    const [uiSettings, setUiSettings] = useState(null);

    useEffect(() => {
        (async () => {
            const revisions = await getFsdProtocolRevisions();

            setProtocolRevisions(revisions);
        })();
    }, []);

    const open = async () => {
        setShowModal(true);
        setUiSettings(null);

        const revisions = await getFsdProtocolRevisions();
        const apiSettings = await getApiSettings();
        const fsdConnection = await getFsdSettings();
        const uiSettings = {
            apiSettings,
            fsdConnection
        }

        setUiSettings(uiSettings);
        setProtocolRevisions(revisions);
    }

    const close = () => {
        setShowModal(false);
    }

    const getProtocolRevisionOptions = () => {
        return protocolRevisions.map((rev) =>
            <option key={`protocol-revision-${rev}`} value={rev}>{rev}</option>);
    }

    const onSubmit = async (values) => {
        await saveApiSettings(values.apiSettings);
        await saveFsdSettings(values.fsdConnection);
        await updateServerSettings(await getStoreItem("settings.apiSettings"));
        await storeSave();
        close();
    }

    const getButton = () => <Button
        severity={"secondary"}
        onClick={open}
        icon={(options) => <FontAwesomeIcon icon={faGear} {...options.iconProps}/>}/>;

    if (!uiSettings) {
        return getButton();
    }

    const formSchema = Yup.object().shape({
        apiSettings: Yup.object().shape({
            posCalcRate: Yup.number()
                .required("Required")
                .min(10, "50 or more")
                .max(5000, "5000 or less"),
            commandFrequency: Yup.string()
                .required("Required")
                .matches(/^[1][0-9][0-9]\.[0-9]{1,3}$/, "Invalid frequency")
        }),
        fsdConnection: Yup.object().shape({
            hostname: Yup.string()
                .required("Required"),
            port: Yup.number()
                .required("Required")
                .min(1, "1 or more")
                .max(65535, "65635 or less"),
            networkId: Yup.string()
                .required("Required"),
            password: Yup.string()
                .required("Required")
        })
    })

    return (
        <>
            {getButton()}

            <Dialog
                onHide={close}
                closable={false}
                closeOnEscape={false}
                header={"Settings"}
                style={{width: '50vw'}}
                visible={showModal}>
                <Formik
                    initialValues={uiSettings}
                    onSubmit={onSubmit}
                    validationSchema={formSchema}>
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                          setFieldValue
                      }) => (
                        <form onSubmit={handleSubmit} noValidate={true}>
                            <h5>Sauna API Server Settings</h5>
                            <div className={"formgrid grid"}>
                                <div className={"field col-12 md:col-6"}>
                                    <label htmlFor={"settingsFormPosCalcRate"}>Position Calculation Rate</label>
                                    <div className={"p-inputgroup flex-1"}>
                                        <InputText
                                            id={"settingsFormPosCalcRate"}
                                            name="apiSettings.posCalcRate"
                                            disabled={true}
                                            value={values.apiSettings.posCalcRate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={getIn(touched, "apiSettings.posCalcRate") && getIn(errors, "apiSettings.posCalcRate")}
                                        />
                                        <span className={"p-inputgroup-addon"}>ms</span>
                                    </div>
                                    <small className={"p-error"}>
                                        {getIn(errors, "apiSettings.posCalcRate")}
                                    </small>
                                </div>
                                <div className={"field col-12 md:col-6"}>
                                    <label htmlFor={"settingsFormCommandFrequency"}>Command Frequency</label>
                                    <div className={"p-inputgroup flex-1"}>
                                        <InputMask
                                            id={"settingsFormCommandFrequency"}
                                            name="apiSettings.commandFrequency"
                                            value={values.apiSettings.commandFrequency}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            mask={"999.99?9"}
                                            invalid={getIn(touched, "apiSettings.commandFrequency") && getIn(errors, "apiSettings.commandFrequency")}
                                        />
                                        <span className={"p-inputgroup-addon"}>MHz</span>
                                    </div>
                                    <small className={"p-error"}>
                                        {getIn(errors, "apiSettings.commandFrequency")}
                                    </small>
                                </div>
                            </div>

                            <h5>FSD Connection Info</h5>
                            <div className={"formgrid grid"}>
                                <div className={"field col-12 md:col-5"}>
                                    <label htmlFor={"settingsFormFsdHostName"}>Hostname</label>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormFsdHostName"}
                                        name="fsdConnection.hostname"
                                        value={values.fsdConnection.hostname}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "fsdConnection.hostname") && getIn(errors, "fsdConnection.hostname")}
                                    />
                                    <small className={"p-error"}>
                                        {getIn(errors, "fsdConnection.hostname")}
                                    </small>
                                </div>
                                <div className={"field col-12 md:col-3"}>
                                    <label htmlFor={"settingsFormFsdPort"}>Port</label>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormFsdPort"}
                                        name="fsdConnection.port"
                                        keyfilter={"int"}
                                        value={values.fsdConnection.port}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "fsdConnection.port") && getIn(errors, "fsdConnection.port")}
                                    />
                                    <small className={"p-error"}>
                                        {getIn(errors, "fsdConnection.port")}
                                    </small>
                                </div>
                                <div className={"field col-12 md:col-4"}>
                                    <label htmlFor={"settingsFormFsdProtocol"}>Protocol Version</label>
                                    <Dropdown
                                        className={"w-full"}
                                        id={"settingsFormFsdProtocol"}
                                        name="fsdConnection.protocol"
                                        value={values.fsdConnection.protocol}
                                        onChange={handleChange}
                                        options={protocolRevisions} />
                                </div>
                            </div>
                            <div className={"formgrid grid"}>
                                <div className={"field col-12 md:col-6"}>
                                    <label htmlFor={"settingsFormFsdNid"}>Network ID</label>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormFsdNid"}
                                        name="fsdConnection.networkId"
                                        value={values.fsdConnection.networkId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "fsdConnection.networkId") && getIn(errors, "fsdConnection.networkId")}
                                    />
                                    <small className={"p-error"}>
                                        {getIn(errors, "fsdConnection.networkId")}
                                    </small>
                                </div>
                                <div className={"field col-12 md:col-6"}>
                                    <label htmlFor={"settingsFormFsdPass"}>Password</label>
                                    <Password
                                        className={"w-full"}
                                        inputClassName={"w-full"}
                                        inputId={"settingsFormFsdPass"}
                                        name="fsdConnection.password"
                                        value={values.fsdConnection.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        feedback={false}
                                        toggleMask={true}
                                        pt={{iconField: {root: {className: "w-full"}}}}
                                        invalid={getIn(touched, "fsdConnection.password") && getIn(errors, "fsdConnection.password")}
                                    />
                                    <small className={"p-error"}>
                                        {getIn(errors, "fsdConnection.password")}
                                    </small>
                                </div>
                            </div>
                            <div className={"formgrid grid justify-content-end mr-1"}>
                                <Button severity="secondary" onClick={close} disabled={isSubmitting} label={"Close"} className={"mr-3"}/>
                                <Button type="submit" loading={isSubmitting} label={"Save"}/>
                            </div>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </>
    )
}