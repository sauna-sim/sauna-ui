import React from 'react';
import {createRoot} from "react-dom/client";
import './assets/stylesheets/index.scss';
import 'leaflet/dist/leaflet.css';
import MainApp from "./pages/main";
import {HashRouter, Route, Routes} from "react-router-dom";
import {MapPage} from "./pages/map/map_page";

// React DOM Render
const root = createRoot(document.getElementById('root'));
root.render(
    <HashRouter>
        <Routes>
            <Route path="/" element={<MainApp/>}/>
            <Route path="/map" element={<MapPage/>}/>
        </Routes>
    </HashRouter>
);