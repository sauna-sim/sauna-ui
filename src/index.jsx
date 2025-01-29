import React from 'react';
import {createRoot} from "react-dom/client";
import './assets/stylesheets/index.scss';
import MainApp from "./pages/main";
import {store} from "./redux/store";
import {Provider} from "react-redux";
import {HashRouter, Route, Routes} from "react-router-dom";
import SaunaScenarioMaker from './pages/scenario_maker/sauna_scenario_maker';
import { MapPage } from './pages/map/map';
import {CommandWindow} from "./pages/command_window/command_window.jsx";

// React DOM Render
const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <HashRouter>
            <Routes>
                <Route path="/" element={<MainApp />}/>
                <Route path="/sauna_scenario_maker" element={<SaunaScenarioMaker />}/>
                <Route path="/map" element={<MapPage />} />
                <Route path="/commands" element={<CommandWindow />} />
            </Routes>
        </HashRouter>
    </Provider>
);