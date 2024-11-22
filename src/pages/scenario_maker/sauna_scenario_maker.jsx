import React, {useState} from "react";

import { Formik } from 'formik';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import AircraftList from "./aircraft/aircraft_list";

export default function SaunaScenarioMaker() {
    const [key, setKey] = useState('airport');

    const [aircrafts, setAircrafts] = useState([]);

    return (
        <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
        >
            <Tab eventKey="airport" title="Airports">
                
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
