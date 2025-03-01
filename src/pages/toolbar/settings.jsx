import React, {useState} from "react";
import {Formik} from "formik";
import * as Yup from "yup";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGear} from "@fortawesome/free-solid-svg-icons/faGear";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";

export const SettingsModal = ({ }) => {
    const [showModal, setShowModal] = useState(false);

    const open = async () => {
        setShowModal(true);
    }

    const close = () => {
        setShowModal(false);
    }

    const onSubmit = async (values) => {
        close();
    }

    const getButton = () => <Button
        severity={"secondary"}
        onClick={open}
        icon={(options) => <FontAwesomeIcon icon={faGear} {...options.iconProps} />} />;

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