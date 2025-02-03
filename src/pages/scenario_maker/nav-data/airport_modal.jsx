import React from "react";
import {Formik, getIn} from "formik";
import * as Yup from "yup";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {FormikPrErrorMessage} from "../../../components/primereact_form.jsx";

export default function AirportModal({onClose, onAirportSubmit, airport, airports}) {
    const formSchema = Yup.object().shape({});

    const onSubmit = async (values) => {
        onAirportSubmit(values);
        onClose();
    };

    const handleChangeUpperCase = (handleChangeFunction) => {
        return (e) => {
            e.target.value = e.target.value.toUpperCase();
            handleChangeFunction(e);
        }
    };
    return (
        <Dialog
            visible={true}
            onHide={onClose}
            modal={true}
            position={"center"}
            header={airport ? "Edit Airport" : "Add Airport"}
        >
            <Formik
                initialValues={airport ? airport : {
                    airportIdent: "",
                    airportElev: "",
                    runways: [
                        {
                            thres1: {ident: "", lat: "", lon: ""},
                            thres2: {ident: "", lat: "", lon: ""},
                        },
                    ],
                    sids: [
                        {
                            name: "",
                            route: "",
                            transitions: [
                                {
                                    runway: "",
                                    route: "",
                                }
                            ]
                        }
                    ],
                    stars: [
                        {
                            name: "",
                            route: "",
                            transitions: [
                                {
                                    runway: "",
                                    route: "",
                                }
                            ]
                        }
                    ]
                }}
                validationSchema={formSchema}
                onSubmit={onSubmit}
            >
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                  }) => (
                    <form onSubmit={handleSubmit} noValidate={true}>
                        <h5>Airport Info</h5>
                        <div className="formgrid grid mb-3">
                            <div className={"field col-12 sm:col-6"}>
                                <label>ICAO</label>
                                <InputText
                                    className={"w-full"}
                                    name="airportIdent"
                                    value={values.airportIdent}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "airportIdent") && getIn(errors, "airportIdent")}
                                />
                                <FormikPrErrorMessage name={"airportIdent"}/>
                            </div>
                            <div className={"field col-12 sm:col-6"}>
                                <label>Elevation</label>
                                <InputText
                                    className={"w-full"}
                                    name="airportElev"
                                    type="number"
                                    value={values.airportElev}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "airportElev") && getIn(errors, "airportElev")}
                                />
                                <FormikPrErrorMessage name={"airportElev"}/>
                            </div>
                        </div>
                        <h5>Runways</h5>
                        {values.runways.map((runway, index) => (
                            <React.Fragment key={index}>
                                <div className="formgrid grid mb-3">
                                    <div className={"field col-12 sm:col-4"}>
                                        <label>Thres 1 Ident</label>
                                        <InputText
                                            className={"w-full"}
                                            name={`runways[${index}].thres1.ident`}
                                            value={runway.thres1.ident}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            invalid={
                                                getIn(touched, `runways[${index}].thres1.ident`) &&
                                                getIn(errors, `runways[${index}].thres1.ident`)
                                            }
                                        />
                                        <FormikPrErrorMessage name={`runways[${index}].thres1.ident`}/>
                                    </div>
                                    <div className={"field col-12 sm:col-4"}>
                                        <label>Thres 1 Lat</label>
                                        <InputText
                                            className={"w-full"}
                                            name={`runways[${index}].thres1.lat`}
                                            type="number"
                                            value={runway.thres1.lat}
                                            onChange={handleChangeUpperCase(handleChange)}
                                            onBlur={handleBlur}
                                            invalid={
                                                getIn(touched, `runways[${index}].thres1.lat`) &&
                                                getIn(errors, `runways[${index}].thres1.lat`)
                                            }
                                        />
                                        <FormikPrErrorMessage name={`runways[${index}].thres1.lat`}/>
                                    </div>
                                    <div className={"field col-12 sm:col-4"}>
                                        <label>Thres 1 Lon1</label>
                                        <InputText
                                            className={"w-full"}
                                            name={`runways[${index}].thres1.lon`}
                                            type="number"
                                            value={runway.thres1.lon}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={
                                                getIn(touched, `runways[${index}].thres1.lon`) &&
                                                getIn(errors, `runways[${index}].thres1.lon`)
                                            }
                                        />
                                        <FormikPrErrorMessage name={`runways[${index}].thres1.lon`}/>
                                    </div>
                                </div>
                                <div className="formgrid grid mb-3">
                                    <div className={"field col-12 sm:col-4"}>
                                        <label>Thres 2 Ident</label>
                                        <InputText
                                            className={"w-full"}
                                            name={`runways[${index}].thres2.ident`}
                                            value={runway.thres2.ident}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={
                                                getIn(touched, `runways[${index}].thres2.ident`) &&
                                                getIn(errors, `runways[${index}].thres2.ident`)
                                            }
                                        />
                                        <FormikPrErrorMessage name={`runways[${index}].thres2.ident`}/>
                                    </div>
                                    <div className={"field col-12 sm:col-4"}>
                                        <label>Thres 2 Lat</label>
                                        <InputText
                                            className={"w-full"}
                                            name={`runways[${index}].thres2.lat`}
                                            type="number"
                                            value={runway.thres2.lat}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={
                                                getIn(touched, `runways[${index}].thres2.lat`) &&
                                                getIn(errors, `runways[${index}].thres2.lat`)
                                            }
                                        />
                                        <FormikPrErrorMessage name={`runways[${index}].thres2.lat`}/>
                                    </div>
                                    <div className={"field col-12 sm:col-4"}>
                                        <label>Thres 2 Lon</label>
                                        <InputText
                                            className={"w-full"}
                                            name={`runways[${index}].thres2.lon`}
                                            type="number"
                                            value={runway.thres2.lon}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            invalid={
                                                getIn(touched, `runways[${index}].thres2.lon`) &&
                                                getIn(errors, `runways[${index}].thres2.lon`)
                                            }
                                        />
                                        <FormikPrErrorMessage name={`runways[${index}].thres2.lon`}/>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                        <div className={"formgrid grid justify-content-end mr-1"}>
                            <Button type={"button"} severity="secondary" onClick={onClose} label={"Close"}/>
                            <Button type="submit" label={"Save Changes"}/>
                        </div>
                    </form>

                )}
            </Formik>
        </Dialog>
    );
}