import React from "react";
import {ErrorMessage} from "formik";

export const FormikPrErrorMessage = ({name}) => (
    <ErrorMessage name={name}>
        {msg => <small className={"text-red-500"}>{msg}</small> }
    </ErrorMessage>
);