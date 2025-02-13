import React, {useEffect, useState} from "react";
import {Formik, getIn} from "formik";
import {getApiServerDetails, saveApiServerDetails, storeSave} from "../../actions/local_store_actions.js";
import * as Yup from "yup";
import {FloatLabel} from "primereact/floatlabel";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {FormikPrErrorMessage} from "../../components/primereact_form.jsx";

export const ApiConnectionSettings = ({}) => {
    const [apiServerDetails, setApiServerDetails] = useState(null);

    useEffect(() => {
        (async () => {
            const apiServerDetails = await getApiServerDetails();

            setApiServerDetails(apiServerDetails);
        })();
    }, []);

    const onSubmit = async (values) => {
        await saveApiServerDetails(values);
        await storeSave();

        setApiServerDetails(await getApiServerDetails());
    }

    if (!apiServerDetails) {
        return <div>Loading...</div>;
    }

    const formSchema = Yup.object().shape({
        hostName: Yup.string()
            .required("Required"),
        port: Yup.number()
            .required("Required")
            .min(1, "1 or more")
            .max(65535, "65635 or less")
    });

    return (
        <>
            <Formik
                initialValues={apiServerDetails}
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
                  }) => (
                    <form onSubmit={handleSubmit} noValidate={true} className={"m-3"}>
                        <div className={"formgrid grid"}>
                            <div className={"field sm:col-7 col-12 mt-3"}>
                                <FloatLabel>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormApiHostName"}
                                        name={"hostName"}
                                        autoCorrect={"off"}
                                        value={values.hostName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "hostName") && getIn(errors, "hostName")}
                                    />
                                    <label htmlFor={"settingsFormApiHostName"}>Host Name *</label>
                                </FloatLabel>
                                <FormikPrErrorMessage name={"hostName"} />
                            </div>
                            <div className={"field sm:col-3 col-12 mt-3"}>
                                <FloatLabel>
                                    <InputText
                                        className={"w-full"}
                                        id={"settingsFormApiPort"}
                                        name="port"
                                        keyfilter={"int"}
                                        type={"number"}
                                        value={values.port}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        invalid={getIn(touched, "port") && getIn(errors, "port")}
                                    />
                                    <label htmlFor={"settingsFormApiPort"}>Port *</label>
                                </FloatLabel>
                                <FormikPrErrorMessage name={"port"} />
                            </div>
                            <div className={"sm:col-2 col-12 sm:mt-3"}>
                                <Button className={"w-full"} type={"submit"} loading={isSubmitting}>
                                    <div className={"m-auto"}>Save</div>
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    )
}