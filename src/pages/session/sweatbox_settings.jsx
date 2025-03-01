import {Dropdown} from "primereact/dropdown";
import {getIn} from "formik";
import {FormikPrErrorMessage} from "../../components/primereact_form.jsx";
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import React from "react";

const SweatboxSettingsForm = ({values, touched, errors, handleChange, handleBlur, availSweatboxServers}) => {
    return (
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
    )
}

export default SweatboxSettingsForm;