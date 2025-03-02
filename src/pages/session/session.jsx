import {Form, Formik, getIn} from "formik";
import React, {useEffect, useState} from "react";
import {getStoreSessionId, getStoreSessionSettings, saveStoreSessionId, saveStoreSessionSettings} from "../../actions/local_store_actions.js";
import {SelectButton} from "primereact/selectbutton";
import {getSweatboxServers} from "../../actions/vatsim_actions.js";
import {FormikPrErrorMessage} from "../../components/primereact_form.jsx";
import * as Yup from "yup";
import {Button} from "primereact/button";
import {InputGroup, InputGroupAddon} from "../../components/primereact_tailwind.js";
import {InputMask} from "primereact/inputmask";
import SweatboxSettingsForm from "./sweatbox_settings.jsx";
import FsdSettingsForm from "./fsd_settings.jsx";
import {createSession, getSessionSettings} from "../../actions/session_actions.js";
import {onSessionInitialize, onSessionSettingsChange, resetSession} from "../../redux/slices/sessionSlice.js";
import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";

const SessionPage = () => {
    const [settings, setSettings] = useState();
    const [availSweatboxServers, setAvailSweatboxServers] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            const sessionId = await getStoreSessionId();
            const sessionSettings = await getStoreSessionSettings();
            if (sessionId) {
                try {
                    await getSessionSettings(sessionId);
                    dispatch(onSessionInitialize(sessionId));
                    dispatch(onSessionSettingsChange(sessionSettings));
                    navigate("/main");
                    return;
                } catch (e) {
                    // Session is not valid
                    await saveStoreSessionId("");
                    dispatch(resetSession());
                }
            }

            setSettings(sessionSettings);
            setAvailSweatboxServers(await getSweatboxServers());
        })();
    }, []);

    if (!settings) {
        return <div>Loading...</div>;
    }

    if (!settings.sessionType) {
        settings.sessionType = "STANDALONE";
    }

    const onSubmit = async (values) => {
        values.fsdProfiles = settings.fsdProfiles;

        // Save settings
        await saveStoreSessionSettings(values);

        // Create session request object
        const reqObj = {};

        switch (values.sessionType) {
            case "STANDALONE":
                reqObj.sessionType = "STANDALONE";
                break;
            case "VATSIM_SWEATBOX":
                reqObj.sessionType = "FSD";

                const sbServer = availSweatboxServers.find(sb => sb.ident === values.sweatboxSettings.server);

                reqObj.connectionDetails = {
                    hostName: sbServer.hostname_or_ip,
                    port: 6889,
                    networkId: values.sweatboxSettings.networkId,
                    password: values.sweatboxSettings.password,
                    realName: values.sweatboxSettings.realName,
                    protocolRevision: "Vatsim2022",
                    commandFrequency: values.commandFrequency
                }
                break;
            case "PRIVATE_FSD":
                reqObj.sessionType = "FSD";

                const profile = values.fsdProfiles.find((prf) => prf.profileName === values.selectedFsdProfile);
                reqObj.connectionDetails = {
                    ...profile,
                    commandFrequency: values.commandFrequency
                }
                break;
        }

        const sessionId = await createSession(reqObj);
        await saveStoreSessionId(sessionId);
        dispatch(onSessionInitialize(sessionId));
        dispatch(onSessionSettingsChange(values));
        navigate("/main");
    }

    const refreshProfiles = async () => {
        setSettings(await getStoreSessionSettings());
    }

    const formSchema = Yup.object().shape({
        sessionType: Yup.string().required("Session Type is Required!"),
        sweatboxSettings: Yup.object().when("sessionType", {
            is: "VATSIM_SWEATBOX",
            then: (schema) => schema.shape({
                server: Yup.string().required("Select a Sweatbox Server"),
                networkId: Yup.string().required("Required"),
                password: Yup.string().required("Required"),
                realName: Yup.string().required("Required")
            }),
            otherwise: (schema) => schema.notRequired()
        }),
        selectedFsdProfile: Yup.string().when("sessionType", {
            is: "PRIVATE_FSD",
            then: (schema) => schema.required("Select a Profile"),
            otherwise: (schema) => schema.notRequired()
        }),
        commandFrequency: Yup.string()
            .matches(/^[1][0-9][0-9]\.[0-9]{1,3}$/, "Invalid frequency")
            .when("sessionType", {
                is: (val) => val === "VATSIM_SWEATBOX" || val === "PRIVATE_FSD",
                then: (schema) => schema.required("Enter Command Frequency"),
                otherwise: (schema) => schema.notRequired()
            }),
    })

    return (
        <Formik
            initialValues={settings}
            validationSchema={formSchema}
            onSubmit={onSubmit}>
            {({values, touched, errors, isSubmitting, handleChange, handleBlur, setFieldValue}) => (
                <Form>
                    <div className={"p-4 flex flex-col gap-2 mx-auto h-screen items-center"}>
                        <FormikPrErrorMessage name={"sessionType"}/>
                        <SelectButton
                            name={"sessionType"}
                            value={values.sessionType}
                            onChange={handleChange}
                            optionDisabled={"disabled"}
                            allowEmpty={false}
                            options={[
                                {value: "STANDALONE", label: "Standalone"},
                                {value: "VATSIM_SWEATBOX", label: "VATSIM Sweatbox", disabled: true},
                                {value: "PRIVATE_FSD", label: "FSD Server (Advanced)"}
                            ]}
                        />
                        <div className={"grow-1 flex flex-col justify-center gap-2 w-full items-center"}>
                            {values.sessionType === "STANDALONE" &&
                                <>
                                    <h5 className={"text-xl"}>Standalone Mode doesn't require any configuration.</h5>
                                    <h5 className={"text-xl"}>Press Start Session to continue.</h5>
                                </>
                            }
                            {values.sessionType === "VATSIM_SWEATBOX" &&
                                <SweatboxSettingsForm
                                    values={values}
                                    errors={errors}
                                    availSweatboxServers={availSweatboxServers}
                                    handleBlur={handleBlur}
                                    handleChange={handleChange}
                                    touched={touched}/>
                            }
                            {values.sessionType === "PRIVATE_FSD" &&
                                <FsdSettingsForm
                                    values={values}
                                    errors={errors}
                                    handleChange={handleChange}
                                    touched={touched}
                                    profiles={settings.fsdProfiles}
                                    refreshProfiles={refreshProfiles}
                                    setFieldValue={setFieldValue}/>
                            }
                            {(values.sessionType === "VATSIM_SWEATBOX" || values.sessionType === "PRIVATE_FSD") &&
                                <>
                                    <h5 className={"text-xl mt-5"}>Sauna Configuration</h5>
                                    <div className={"w-full sm:max-w-75"}>
                                        <label htmlFor={"settingsFormCommandFrequency"}>Command Frequency</label>
                                        <div className={`w-full ${InputGroup}`}>
                                            <InputMask
                                                className={"flex-1 w-full"}
                                                id={"settingsFormCommandFrequency"}
                                                name="commandFrequency"
                                                value={values.commandFrequency}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                mask={"999.99?9"}
                                                invalid={getIn(touched, "commandFrequency") && getIn(errors, "commandFrequency")}
                                            />
                                            <span className={InputGroupAddon}>MHz</span>
                                        </div>
                                        <FormikPrErrorMessage name={"commandFrequency"}/>
                                    </div>
                                </>
                            }
                        </div>

                        <div className={"mt-3"}>
                            <Button type={"submit"} severity={"success"} loading={isSubmitting} label={"Start Session"} size={"large"}/>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default SessionPage;