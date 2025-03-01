import {Dialog} from "primereact/dialog";
import * as Yup from "yup";
import {Formik, getIn} from "formik";
import {InputText} from "primereact/inputtext";
import {FormikPrErrorMessage} from "../../components/primereact_form.jsx";
import React, {useEffect, useState} from "react";
import {Password} from "primereact/password";
import {Dropdown} from "primereact/dropdown";
import {getFsdProtocolRevisions} from "../../actions/enum_actions.js";
import {Button} from "primereact/button";

const FsdProfileModal = ({show, onClose, profile, onSave, excludeProfileNames}) => {
    const [protocolRevisions, setProtocolRevisions] = useState([]);

    useEffect(() => {
        (async () => {
            setProtocolRevisions(await getFsdProtocolRevisions());
        })();
    }, []);

    const formSchema = Yup.object().shape({
        profileName: Yup.string()
            .required("Required")
            .notOneOf(excludeProfileNames, "Must be unique!"),
        hostname: Yup.string().required("Required"),
        port: Yup.number()
            .required("Required")
            .min(1, "1 or more")
            .max(65535, "65635 or less"),
        networkId: Yup.string().required("Required"),
        password: Yup.string().required("Required"),
        realName: Yup.string().required("Required"),
        protocol: Yup.string().required("Required")
    });

    if (!profile) {
        return <></>;
    }

    return (
        <Formik
            initialValues={profile}
            enableReinitialize={true}
            onSubmit={onSave}
            validationSchema={formSchema}
        >
            {({values, handleChange, handleBlur, handleSubmit, touched, errors, isSubmitting}) => (
                <Dialog
                    onHide={onClose}
                    visible={show}
                    className={"sm:max-w-150"}
                    style={{width: "80vw"}}
                    header={"FSD Profile"}
                    footer={<div className={"flex gap-2"}>
                        <Button type={"button"} onClick={onClose} severity={"danger"} label={"Cancel"} loading={isSubmitting} />
                        <Button type={"button"} onClick={() => handleSubmit()} severity={"success"} label={"Save"} loading={isSubmitting} />
                    </div>}
                >
                    <div className={"w-full grid grid-cols-12 sm:max-w-150 gap-2"}>
                        <div className={"col-span-12 sm:col-span-5"}>
                            <label htmlFor={"settingsFormFsdProfileName"}>Name</label>
                            <InputText
                                className={"w-full"}
                                id={"settingsFormFsdProfileName"}
                                name="profileName"
                                value={values.profileName}
                                autoCorrect={"off"}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={getIn(touched, "profileName") && getIn(errors, "profileName")}
                            />
                            <FormikPrErrorMessage name={"profileName"}/>
                        </div>
                        <div className={"col-span-12 sm:col-span-4"}>
                            <label htmlFor={"settingsFormFsdHostName"}>Hostname</label>
                            <InputText
                                className={"w-full"}
                                id={"settingsFormFsdHostName"}
                                name="hostname"
                                value={values.hostname}
                                autoCorrect={"off"}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={getIn(touched, "hostname") && getIn(errors, "hostname")}
                            />
                            <FormikPrErrorMessage name={"hostname"}/>
                        </div>
                        <div className={"col-span-12 sm:col-span-3"}>
                            <label htmlFor={"settingsFormFsdPort"}>Port</label>
                            <InputText
                                className={"w-full"}
                                id={"settingsFormFsdPort"}
                                name="port"
                                keyfilter={"int"}
                                value={values.port}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={getIn(touched, "port") && getIn(errors, "port")}
                            />
                            <FormikPrErrorMessage name={"port"}/>
                        </div>
                    </div>
                    <div className={"w-full grid grid-cols-2 sm:max-w-150 gap-2 mt-2"}>
                        <div className={"col-span-2 sm:col-span-1"}>
                            <label htmlFor={"profileModalCid"}>CID</label>
                            <InputText
                                className={"w-full"}
                                id={"profileModalCid"}
                                name="networkId"
                                value={values.networkId}
                                autoCorrect={"off"}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={getIn(touched, "networkId") && getIn(errors, "networkId")}
                            />
                            <FormikPrErrorMessage name={"networkId"}/>
                        </div>
                        <div className={"col-span-2 sm:col-span-1"}>
                            <label htmlFor={"profileModalPass"}>Password</label>
                            <Password
                                className={"w-full"}
                                inputClassName={"w-full"}
                                inputId={"profileModalPass"}
                                name="password"
                                autoCorrect={"off"}
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                feedback={false}
                                toggleMask={true}
                                pt={{iconField: {root: {className: "w-full"}}}}
                                invalid={getIn(touched, "password") && getIn(errors, "password")}
                            />
                            <FormikPrErrorMessage name={"password"}/>
                        </div>
                    </div>
                    <div className={"w-full grid grid-cols-2 sm:max-w-150 gap-2 mt-2"}>
                        <div className={"col-span-2 sm:col-span-1"}>
                            <label htmlFor={"profileModalRealName"}>Real Name</label>
                            <InputText
                                className={"w-full"}
                                id={"profileModalRealName"}
                                name="realName"
                                value={values.realName}
                                autoCorrect={"off"}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={getIn(touched, "realName") && getIn(errors, "realName")}
                            />
                            <FormikPrErrorMessage name={"realName"}/>
                        </div>
                        <div className={"col-span-2 sm:col-span-1"}>
                            <label htmlFor={"profileModalProtocol"}>Protocol Version</label>
                            <Dropdown
                                className={"w-full"}
                                id={"profileModalProtocol"}
                                name="protocol"
                                value={values.protocol}
                                onChange={handleChange}
                                options={protocolRevisions}/>
                        </div>
                    </div>
                </Dialog>
            )}
        </Formik>
    )
}

export default FsdProfileModal;