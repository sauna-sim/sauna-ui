import React, { useEffect, useState } from "react";
import { Formik, getIn } from "formik";
import { getApiSettings, getFsdSettings, getStoreItem, saveApiSettings, saveFsdSettings, storeSave } from "../../actions/local_store_actions.js";
import { getFsdProtocolRevisions } from "../../actions/enum_actions.js";
import { updateServerSettings } from "../../actions/data_actions.js";
import * as Yup from "yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from "@fortawesome/free-solid-svg-icons/faGear";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { InputMask } from "primereact/inputmask";
import { FormikPrErrorMessage } from "../../components/primereact_form.jsx";
import { InputGroup, InputGroupAddon } from "../../components/primereact_tailwind.js";

export const SettingsModal = ({ }) => {
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
        icon={(options) => <FontAwesomeIcon icon={faGear} {...options.iconProps} />} />;

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
                style={{ width: '50vw' }}
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
                            <h5 className={"text-xl"}>Sauna API Server Settings</h5>
                            <div className={"grid grid-cols-12 gap-2 mt-2"}>
                                <div className={"col-span-12 md:col-span-6"}>
                                    <label htmlFor={"settingsFormPosCalcRate"}>Position Calculation Rate</label>
                                    <div className={`w-full ${InputGroup}`}>
                                        <InputText
                                            id={"settingsFormPosCalcRate"}
                                            name="apiSettings.posCalcRate"
                                            className={"flex-1 w-full"}
                                            disabled={true}
                                            value={values.apiSettings.posCalcRate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={getIn(touched, "apiSettings.posCalcRate") && getIn(errors, "apiSettings.posCalcRate")}
                                        />
                                        <span className={InputGroupAddon}>ms</span>
                                    </div>
                                    <FormikPrErrorMessage name={"apiSettings.posCalcRate"} />
                                </div>
                                <div className={"col-span-12 md:col-span-6"}>
                                    <label htmlFor={"settingsFormCommandFrequency"}>Command Frequency</label>
                                    <div className={`w-full ${InputGroup}`}>
                                        <InputMask
                                            className={"flex-1 w-full"}
                                            id={"settingsFormCommandFrequency"}
                                            name="apiSettings.commandFrequency"
                                            value={values.apiSettings.commandFrequency}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            mask={"999.99?9"}
                                            invalid={getIn(touched, "apiSettings.commandFrequency") && getIn(errors, "apiSettings.commandFrequency")}
                                        />
                                        <span className={InputGroupAddon}>MHz</span>
                                    </div>
                                    <FormikPrErrorMessage name={"apiSettings.commandFrequency"} />
                                </div>
                            </div>

                            <h5 className={"text-xl mt-5"}>FSD Connection Info</h5>
                            <div className={"grid grid-cols-12 gap-2 mt-2"}>
                                <div className={"col-span-12 md:col-span-5"}>
                                    <label htmlFor={"settingsFormFsdHostName"}>Hostname</label>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormFsdHostName"}
                                        name="fsdConnection.hostname"
                                        value={values.fsdConnection.hostname}
                                        autoCorrect={"off"}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "fsdConnection.hostname") && getIn(errors, "fsdConnection.hostname")}
                                    />
                                    <FormikPrErrorMessage name={"fsdConnection.hostname"} />
                                </div>
                                <div className={"col-span-12 md:col-span-3"}>
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
                                    <FormikPrErrorMessage name={"fsdConnection.port"} />
                                </div>
                                <div className={"col-span-12 md:col-span-4"}>
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
                            <div className={"grid grid-cols-12 gap-2 mt-2"}>
                                <div className={"col-span-12 md:col-span-6"}>
                                    <label htmlFor={"settingsFormFsdNid"}>Network ID</label>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormFsdNid"}
                                        name="fsdConnection.networkId"
                                        value={values.fsdConnection.networkId}
                                        autoCorrect={"off"}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "fsdConnection.networkId") && getIn(errors, "fsdConnection.networkId")}
                                    />
                                    <FormikPrErrorMessage name={"fsdConnection.networkId"} />
                                </div>
                                <div className={"col-span-12 md:col-span-6"}>
                                    <label htmlFor={"settingsFormFsdPass"}>Password</label>
                                    <Password
                                        className={"w-full"}
                                        inputClassName={"w-full"}
                                        inputId={"settingsFormFsdPass"}
                                        name="fsdConnection.password"
                                        autoCorrect={"off"}
                                        value={values.fsdConnection.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        feedback={false}
                                        toggleMask={true}
                                        pt={{ iconField: { root: { className: "w-full" } } }}
                                        invalid={getIn(touched, "fsdConnection.password") && getIn(errors, "fsdConnection.password")}
                                    />
                                    <FormikPrErrorMessage name={"fsdConnection.password"} />
                                </div>
                            </div>
                            <div className={"flex justify-end gap-2 mt-2"}>
                                <Button type={"button"} severity="secondary" onClick={close} disabled={isSubmitting} label={"Close"} />
                                <Button type="submit" loading={isSubmitting} label={"Save"} />
                            </div>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </>
    )
}