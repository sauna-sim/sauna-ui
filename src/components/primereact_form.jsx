import React from "react";
import {ErrorMessage} from "formik";

export const FormikPrErrorMessage = ({name}) => (
    <ErrorMessage name={name}>
        {msg => <small className={"p-error"}>{msg}</small> }
    </ErrorMessage>
);