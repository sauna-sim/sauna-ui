import React, {useState} from "react";
import {Button} from "primereact/button";
import {round} from "../../actions/utilities";
import {Dialog} from "primereact/dialog";

export const AircraftDetail = ({aircraft}) => {
    const [showModal, setShowModal] = useState(false);

    open = () => {
        setShowModal(true);
    }

    close = () => {
        setShowModal(false);
    }

    return <>
        <Button severity="secondary" onClick={open} label={"Details"} />

        <Dialog
            modal={true}
            visible={showModal && aircraft}
            onHide={close}
            style={{width: "50vw"}}
            header={`${aircraft.callsign} Details`}>
                <h5 className="text-xl">Heading Data</h5>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Magnetic Heading:</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.heading_Mag.degrees, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>True Heading:</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.heading_True.degrees, 2)}</div>
                </div>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Magnetic Track:</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.track_Mag.degrees, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>True Track:</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.track_True.degrees, 2)}</div>
                </div>
                <h5 className="text-xl mt-2">Altitude Data</h5>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Indicated Alt (ft):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.indicatedAltitude.feet, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Pressure Alt (ft):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.pressureAltitude.feet, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Density Alt (ft):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.densityAltitude.feet, 2)}</div>
                </div>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>True Alt (ft):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.trueAltitude.feet, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Altimeter Setting (hPa):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.altimeterSetting.hectopascals, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Surface Pressure (hPa):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.surfacePressure.hectopascals, 2)}</div>
                </div>
                <h5 className="text-xl mt-2">Speed Data</h5>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>IAS (kts):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.indicatedAirSpeed.knots, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>TAS (kts):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.trueAirSpeed.knots, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>GS (kts):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.groundSpeed.knots, 2)}</div>
                </div>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>Mach:</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.position.machNumber, 2)}</div>
                </div>
                <h5 className="text-xl mt-2">FMS Data</h5>
                <div className={"grid grid-cols-12 gap-2 mt-2"}>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>aTk (m):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.fms.alongTrackDistance_m, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>xTk (m):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.fms.crossTrackDistance_m, 2)}</div>
                    <div className={"lg:col-span-3 md:col-span-2 col-span-12"}><b>rTk (degs):</b></div>
                    <div className={"lg:col-span-1 md:col-span-2 col-span-12"}>{round(aircraft.fms.requiredTrueCourse, 2)}</div>
            </div>
        </Dialog>
    </>
}