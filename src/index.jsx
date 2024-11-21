import React from 'react';
import {createRoot} from "react-dom/client";
import './assets/stylesheets/index.scss';
import MainApp from "./pages/main";
import {store} from "./redux/store";
import {Provider} from "react-redux";
import {HashRouter, Route, Routes} from "react-router-dom";
import SaunaScenarioMaker from './pages/scenario_maker/sauna_scenario_maker';

// React DOM Render
//Add route to comp
const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <HashRouter>
            <Routes>
                <Route path="/" element={<MainApp />}/>
                <Route path="sauna_scenario_maker" element={<SaunaScenarioMaker />}/>
            </Routes>
        </HashRouter>
    </Provider>
);