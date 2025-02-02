import React, {useState} from "react";
import AircraftList from "./aircraft/aircraft_list";
import NavDataList from "./nav-data/nav_data_list";
import {TabPanel, TabView} from "primereact/tabview";

export default function SaunaScenarioMaker() {
    const [key, setKey] = useState(0);

    const [aircrafts, setAircrafts] = useState([]);

    return (
        <TabView
            className={"h-screen flex flex-column"}
            panelContainerClassName={"flex-grow-1"}
            activeIndex={key}
            onTabChange={(k) => setKey(k.index)}
        >
            <TabPanel header="Navdata">
                <NavDataList/>
            </TabPanel>
            <TabPanel header="Aircraft">
                <AircraftList
                    aircrafts={aircrafts}
                    setAircrafts={setAircrafts}
                />
            </TabPanel>
        </TabView>
    );
}
