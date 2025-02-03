import React from "react";
import {Formik, getIn} from 'formik';
import * as Yup from "yup";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {FormikPrErrorMessage} from "../../../components/primereact_form.jsx";

export default function AircraftListModal({onClose, onAircraftSubmit, aircraft, aircrafts}) {

    const formSchema = Yup.object().shape({
        callsign: Yup.string()
            .required("Callsign is Required")
            .matches(/^[a-zA-Z0-9]+$/, "Alphanumeric characters only!")
            .test("unique-callsign", "Callsign already exists!", function (value) {
                const existingCallsigns = aircrafts
                    .filter(a => a.callsign !== aircraft?.callsign)
                    .map(a => a.callsign.toUpperCase());
                return !existingCallsigns.includes(value?.toUpperCase());
            }),
        pos: Yup.object().shape({
            lat: Yup.number()
                .required("Latitude is required")
                .min(-90, "Latitude must be between -90 and 90")
                .max(90, "Latitude must be between -90 and 90"),
            lon: Yup.number()
                .required("Longitude is required")
                .min(-180, "Longitude must be between -180 and 180")
                .max(180, "Longitude must be between -180 and 180"),
        }),
        alt: Yup.number()
            .required("Altitude is required")
            .max(99999, "The altitude cannot exceed 99,999ft"),
        acftType: Yup.string()
            .required("Aircraft Type is required")
            .matches(/^[a-zA-Z0-9]+$/, "Alphanumeric characters only!"),
        squawk: Yup.string()
            .required("Squawk required")
            .matches(/^[0-7]{4}$/, "Squawk must be between 0000-7777"),
        fp: Yup.object().shape({
            origin: Yup.string()
                .required("Departure airport is required")
                .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric characters only!")
                .matches(/^.{3,4}$/, "Needs to be atleast 3 characters!"),
            destination: Yup.string()
                .required("Destination airport is required")
                .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric characters only!")
                .matches(/^.{3,4}$/, "Needs to be atleast 3 characters!"),
            route: Yup.string()
                .required("Flight Plan route is required"),
            cruiseLevel: Yup.number()
                .required("Altitude is required")
                .min(0, "The altitude has to be atleast 0")
                .max(99999, "The altitude cannot exceed 99,999ft"),
            filedTas: Yup.number()
                .min(0, "Airspeed has to be atleast 1"),
        })

    })

    const onSubmit = async (values) => {
        values.fp.aircraftType = values.acftType;
        values.fp.alternate = "";
        values.fp.actualDepTime = 0;
        values.fp.estimatedDepTime = 0;
        values.fp.hoursEnroute = 0;
        values.fp.hoursFuel = 0;
        values.fp.minutesEnroute = 0;
        values.fp.minutesFuel = 0;
        values.fp.remarks = "";
        onAircraftSubmit(values)
        onClose();
    };

    const handleChangeUpperCase = (handleChangeFunction) => {
        return (e) => {
            e.target.value = e.target.value.toUpperCase()
            handleChangeFunction(e)
        }
    }
    return (
        <Dialog
            visible={true}
            modal={true}
            position={"center"}
            onHide={onClose}
            header={aircraft ? "Edit Aircraft" : "Add Aircraft"}
        >
            <Formik
                initialValues={aircraft ? aircraft : {

                    callsign: "",
                    pos: {
                        lat: "",
                        lon: "",
                    },
                    alt: "",
                    acftType: "",
                    squawk: "",
                    fp: {
                        origin: "",
                        destination: "",
                        route: "",
                        cruiseLevel: "",
                        filedTas: "",
                        flightRules: "IFR",
                    },
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
                        <div className="formgrid grid mb-3">
                            <div className={"field sm:col-6 col-12"}>
                                <label>Callsign</label>
                                <InputText
                                    className={"w-full"}
                                    name="callsign"
                                    value={values.callsign}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={touched.callsign && !!errors.callsign}
                                />
                                <FormikPrErrorMessage name={"callsign"} />
                            </div>
                            <div className={"field col-12 sm:col-6"}>
                                <label>Aircraft Type</label>
                                <InputText
                                    className={"w-full"}
                                    name="acftType"
                                    value={values.acftType}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "acftType") && getIn(errors, "acftType")}
                                />
                                <FormikPrErrorMessage name={"acftType"} />
                            </div>
                        </div>
                        <div className="formgrid grid mb-3">
                            <div className={"field col-12 sm:col-6"}>
                                <label>Latitude</label>
                                <InputText
                                    className={"w-full"}
                                    name="pos.lat"
                                    type="number"
                                    value={values.pos.lat}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "pos.lat") && getIn(errors, "pos.lat")}
                                />
                                <FormikPrErrorMessage name={"pos.lat"} />
                            </div>
                            <div className={"field col-12 sm:col-6"}>
                                <label>Longitude</label>
                                <InputText
                                    className={"w-full"}
                                    name="pos.lon"
                                    type="number"
                                    value={values.pos.lon}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "pos.lon") && getIn(errors, "pos.lon")}
                                />
                                <FormikPrErrorMessage name={"pos.lon"} />
                            </div>
                        </div>
                        <div className="formgrid grid mb-3">
                            <div className={"field col-12 sm:col-6"}>
                                <label>Altitude</label>
                                <InputText
                                    className={"w-full"}
                                    name="alt"
                                    type="number"
                                    value={values.alt}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "alt") && getIn(errors, "alt")}
                                />
                                <FormikPrErrorMessage name={"alt"} />
                            </div>
                            <div className={"field col-12 sm:col-6"}>
                                <label>Squawk</label>
                                <InputText
                                    className={"w-full"}
                                    name="squawk"
                                    value={values.squawk}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "squawk") && getIn(errors, "squawk")}
                                />
                                <FormikPrErrorMessage name={"squawk"} />
                            </div>
                        </div>
                        <div className="formgrid grid mb-3">
                            <div className={"field col-12 sm:col-6"}>
                                <label>Departure</label>
                                <InputText
                                    className={"w-full"}
                                    name="fp.origin"
                                    value={values.fp.origin}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "fp.origin") && getIn(errors, "fp.origin")}
                                />
                                <FormikPrErrorMessage name={"fp.origin"} />
                            </div>
                            <div className={"field col-12 sm:col-6"}>
                                <label>Arrival</label>
                                <InputText
                                    className={"w-full"}
                                    name="fp.destination"
                                    value={values.fp.destination}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "fp.destination") && getIn(errors, "fp.destination")}
                                />
                                <FormikPrErrorMessage name={"fp.destination"} />
                            </div>
                        </div>
                        <div className="formgrid grid mb-3">
                            <div className={"field col-12"}>
                                <label>Flight Plan Route</label>
                                <InputText
                                    className={"w-full"}
                                    name="fp.route"
                                    value={values.fp.route}
                                    onChange={handleChangeUpperCase(handleChange)}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "fp.route") && getIn(errors, "fp.route")}
                                />
                                <FormikPrErrorMessage name={"fp.route"} />
                            </div>
                        </div>
                        <div className="formgrid grid mb-3">
                            <div className={"field col-12 sm:col-4"}>
                                <label>Cruise Altitude</label>
                                <InputText
                                    className={"w-full"}
                                    name="fp.cruiseLevel"
                                    type="number"
                                    value={values.fp.cruiseLevel}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "fp.cruiseLevel") && getIn(errors, "fp.cruiseLevel")}
                                />
                                <FormikPrErrorMessage name={"fp.cruiseLevel"} />
                            </div>
                            <div className={"field col-12 sm:col-4"}>
                                <label>Cruise Speed</label>
                                <InputText
                                    className={"w-full"}
                                    name="fp.filedTas"
                                    type="number"
                                    value={values.fp.filedTas}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "fp.filedTas") && getIn(errors, "fp.filedTas")}
                                />
                                <FormikPrErrorMessage name={"fp.filedTas"} />
                            </div>
                            <div className={"field col-12 sm:col-4"}>
                                <label>Flight Rules</label>
                                <Dropdown
                                    className={"w-full"}
                                    name="fp.flightRules"
                                    value={values.fp.flightRules}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    invalid={getIn(touched, "fp.flightRules") && getIn(errors, "fp.flightRules")}
                                    options={["IFR", "VFR", "DVFR", "SVFR"]}
                                />
                                <FormikPrErrorMessage name={"fp.flightRules"} />
                            </div>
                        </div>
                        <div className={"formgrid grid justify-content-end mr-1"}>
                            <Button type="button" severity="secondary" onClick={onClose} label={"Close"} className={"mr-2"}/>
                            <Button type="submit" label={"Save Changes"}/>
                        </div>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
}
