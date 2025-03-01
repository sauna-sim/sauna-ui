import {Form, Formik, getIn} from "formik";
import React, {useEffect, useState} from "react";
import {getSessionSettings} from "../../actions/local_store_actions.js";
import {SelectButton} from "primereact/selectbutton";
import {getSweatboxServers} from "../../actions/vatsim_actions.js";
import {InputText} from "primereact/inputtext";
import {FormikPrErrorMessage} from "../../components/primereact_form.jsx";
import * as Yup from "yup";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {Password} from "primereact/password";
import {InputGroup, InputGroupAddon} from "../../components/primereact_tailwind.js";
import {InputMask} from "primereact/inputmask";

const SessionPage = () => {
    const [settings, setSettings] = useState();
    const [availSweatboxServers, setAvailSweatboxServers] = useState([]);

    useEffect(() => {
        (async () => {
            setSettings(await getSessionSettings());
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
        console.log(values);
    }

    console.log(settings);
    console.log(availSweatboxServers)

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
        fsdProfiles: Yup.array().of(
            Yup.object().shape({
                hostname: Yup.string().required("Required"),
                port: Yup.number()
                    .required("Required")
                    .min(1, "1 or more")
                    .max(65535, "65635 or less"),
                networkId: Yup.string().required("Required"),
                password: Yup.string().required("Required"),
                realName: Yup.string().required("Required")
            })
        )

        // apiSettings: Yup.object().shape({
        //     posCalcRate: Yup.number()
        //         .required("Required")
        //         .min(10, "50 or more")
        //         .max(5000, "5000 or less"),
        //     commandFrequency: Yup.string()
        //         .required("Required")
        //         .matches(/^[1][0-9][0-9]\.[0-9]{1,3}$/, "Invalid frequency")
        // }),
        // fsdConnection: Yup.object().shape({
        //     hostname: Yup.string()
        //         .required("Required"),
        //     port: Yup.number()
        //         .required("Required")
        //         .min(1, "1 or more")
        //         .max(65535, "65635 or less"),
        //     networkId: Yup.string()
        //         .required("Required"),
        //     password: Yup.string()
        //         .required("Required")
        // })
    })

    return (
        <Formik
            initialValues={settings}
            validationSchema={formSchema}
            onSubmit={onSubmit}>
            {({values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit}) => (
                <Form onSubmit={handleSubmit}>
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
                                {value: "VATSIM_SWEATBOX", label: "VATSIM Sweatbox"},
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
                                <>
                                    <h5 className={"text-xl mt-5"}>VATSIM Details</h5>
                                    <div className={"w-full grid grid-cols-2 sm:max-w-150 gap-2"}>
                                        <div className={"col-span-2 sm:col-span-1"}>
                                            <label htmlFor={"sessionFormSweatboxServer"}>Server</label>
                                            <Dropdown
                                                className={"w-full"}
                                                id={"sessionFormSweatboxServer"}
                                                name={"sweatboxSettings.server"}
                                                onChange={handleChange}
                                                value={values.sweatboxSettings.server}
                                                onBlur={handleBlur}
                                                invalid={getIn(touched, "sweatboxSettings.server") && getIn(errors, "sweatboxSettings.server")}
                                                placeholder={"Select Server"}
                                                options={availSweatboxServers}
                                                optionLabel={"name"}
                                                optionValue={"ident"}/>
                                            <FormikPrErrorMessage name={"sweatboxSettings.server"}/>
                                        </div>
                                        <div className={"col-span-2 sm:col-span-1"}>
                                            <label htmlFor={"settingsFormRealName"}>Real Name</label>
                                            <InputText
                                                className={"w-full"}
                                                id={"settingsFormRealName"}
                                                name="sweatboxSettings.realName"
                                                value={values.sweatboxSettings.realName}
                                                autoCorrect={"off"}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                invalid={getIn(touched, "sweatboxSettings.realName") && getIn(errors, "sweatboxSettings.realName")}
                                            />
                                            <FormikPrErrorMessage name={"sweatboxSettings.realName"}/>
                                        </div>
                                    </div>
                                    <div className={"w-full grid grid-cols-2 sm:max-w-150 gap-2"}>
                                        <div className={"col-span-2 sm:col-span-1"}>
                                            <label htmlFor={"settingsFormFsdNid"}>CID</label>
                                            <InputText
                                                className={"w-full"}
                                                id={"settingsFormFsdNid"}
                                                name="sweatboxSettings.networkId"
                                                value={values.sweatboxSettings.networkId}
                                                autoCorrect={"off"}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                invalid={getIn(touched, "sweatboxSettings.networkId") && getIn(errors, "sweatboxSettings.networkId")}
                                            />
                                            <FormikPrErrorMessage name={"sweatboxSettings.networkId"}/>
                                        </div>
                                        <div className={"col-span-2 sm:col-span-1"}>
                                            <label htmlFor={"settingsFormFsdPass"}>Password</label>
                                            <Password
                                                className={"w-full"}
                                                inputClassName={"w-full"}
                                                inputId={"settingsFormFsdPass"}
                                                name="sweatboxSettings.password"
                                                autoCorrect={"off"}
                                                value={values.sweatboxSettings.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                feedback={false}
                                                toggleMask={true}
                                                pt={{iconField: {root: {className: "w-full"}}}}
                                                invalid={getIn(touched, "sweatboxSettings.password") && getIn(errors, "sweatboxSettings.password")}
                                            />
                                            <FormikPrErrorMessage name={"sweatboxSettings.password"}/>
                                        </div>
                                    </div>
                                </>
                            }
                            {values.sessionType === "PRIVATE_FSD" &&
                                <div className={"grid grid-cols-12 mt-2 gap-2"}>
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
                                        <FormikPrErrorMessage name={"fsdConnection.hostname"}/>
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
                                        <FormikPrErrorMessage name={"fsdConnection.port"}/>
                                    </div>
                                </div>
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