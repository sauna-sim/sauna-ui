import React, {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {Formik} from "formik";
import {getScopePackageMapName, isScopePackageLoaded} from "../../actions/scope_package_actions.js";
import {Dialog} from "primereact/dialog";
import {Checkbox} from "primereact/checkbox";

export const FiltersModal = ({display, visibleFeatures, setVisibleFeatures, children}) => {
    const [show, setShow] = useState(false);
    const [initValues, setInitValues] = useState({});
    const [availValues, setAvailValues] = useState({});

    useEffect(() => {
        (async () => {
            if (!display || !display.display || !display.display.display_items || !await isScopePackageLoaded()) {
                setInitValues({});
                setAvailValues({});
            } else {
                let values = {};
                let availValues = {};
                for (const item of display.display.display_items) {
                    if (item.Map && !item.Map.visible) {
                        const mapName = await getScopePackageMapName(item.Map.id);
                        if (mapName) {
                            values[item.Map.id] = visibleFeatures.some((f) => f.type === "map" && f.id === item.Map.id);
                            availValues[item.Map.id] = mapName;
                        }
                    }
                }

                setInitValues(values);
                setAvailValues(availValues);
            }
        })();
    }, [display, visibleFeatures]);

    const handleShow = () => {
        setShow(true);
    }

    const handleClose = () => {
        setShow(false);
    }

    const onSubmit = (values) => {
        let retVal = [];
        for (const item of Object.keys(values)) {
            if (values[item]) {
                retVal.push({
                    type: "map",
                    id: item
                });
            }
        }
        setVisibleFeatures(retVal);
        handleClose();
    }

    return (
        <>
            {children({handleShow})}

            <Dialog
                modal={true}
                visible={show}
                header={"Filters"}
                onHide={handleClose}
            >
                <Formik
                    initialValues={initValues}
                    onSubmit={onSubmit}
                    enableReinitialize={true}>
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
                            <Button
                                type={"button"}
                                className={"mb-2"}
                                severity="info"
                                onClick={() => {
                                    for (const key of Object.keys(availValues)) {
                                        void setFieldValue(key, true);
                                    }
                                }}
                                label={"Select All"}
                            />
                            <div className={"flex flex-column gap-1"}>
                                {Object.keys(availValues).map((key) => (
                                    <div className={"flex"} key={key}>
                                        <Checkbox
                                            checked={values[key]}
                                            name={key}
                                            onChange={handleChange}
                                        />
                                        <label className={"ml-2"}>{availValues[key]}</label>
                                    </div>
                                ))}
                            </div>
                            <div className={"formgrid grid justify-content-end mr-1"}>
                                <Button type={"button"} severity="secondary" onClick={handleClose} disabled={isSubmitting} label={"Cancel"} className={"mr-3"}/>
                                <Button type="submit" loading={isSubmitting} label={"Apply"}/>
                            </div>
                        </form>
                    )}
                </Formik>
            </Dialog>
        </>
    )
}