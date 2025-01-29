import React, {useState} from "react";

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import AircraftList from "./aircraft/aircraft_list";
import NavDataList from "./nav-data/nav_data_list";

export default function SaunaScenarioMaker() {
    const [key, setKey] = useState('navdata');

    const [aircrafts, setAircrafts] = useState([]);

    return (
        <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
        >
            <Tab eventKey="navdata" title="Navdata">
                <NavDataList/>
            </Tab>
            <Tab eventKey="aircraft" title="Aircraft">
                <AircraftList
                    aircrafts={aircrafts}
                    setAircrafts={setAircrafts}
                />
            </Tab>
        </Tabs>
    );
}
