import React, {useEffect, useState} from "react";
import {Formik, getIn} from "formik";
import {getApiServerDetails, saveApiServerDetails, storeSave} from "../../actions/local_store_actions";
import {Button, Col, Form, Row} from "react-bootstrap";
import * as Yup from "yup";

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
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3 mt-3">
                            <Form.Group as={Col} sm={7} xs={7} controlId={"settingsFormApiHostName"}>
                                <Form.Control
                                    name="hostName"
                                    value={values.hostName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={getIn(touched, "hostName") && getIn(errors, "hostName")}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {getIn(errors, "hostName")}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} sm={3} xs={4} controlId={"settingsFormApiPort"}>
                                <Form.Control
                                    name="port"
                                    type="number"
                                    value={values.port}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={getIn(touched, "port") && getIn(errors, "port")}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {getIn(errors, "port")}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Col sm={2} md={2}>
                                <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100">
                                    Save
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </>
    )
}