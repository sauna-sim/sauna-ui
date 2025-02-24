import { StrictMode } from 'react';
import { createRoot } from "react-dom/client";
import MainPage from './pages/main.jsx';
import './assets/stylesheets/index.css';
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { HashRouter, Route, Routes } from "react-router";
import SaunaScenarioMaker from './pages/scenario_maker/sauna_scenario_maker';
import { MapPage } from './pages/map/map';
import { CommandWindow } from "./pages/command_window/command_window.jsx";
import { PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import { twMerge } from 'tailwind-merge';

// React DOM Render
const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <Provider store={store}>
            <PrimeReactProvider value={{
                unstyled: true,
                pt: Tailwind,
                ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge }
            }}>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/sauna_scenario_maker" element={<SaunaScenarioMaker />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/commands" element={<CommandWindow />} />
                    </Routes>
                </HashRouter>
            </PrimeReactProvider>
        </Provider>
    </StrictMode>
);