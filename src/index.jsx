import {StrictMode} from 'react';
import {createRoot} from "react-dom/client";
import MainPage from './pages/main.jsx';
import './assets/stylesheets/index.css';
import {store} from "./redux/store";
import {Provider} from "react-redux";
import {HashRouter, Route, Routes} from "react-router";
import SaunaScenarioMaker from './pages/scenario_maker/sauna_scenario_maker';
import {MapPage} from './pages/map/map';
import {CommandWindow} from "./pages/command_window/command_window.jsx";
import {PrimeReactProvider} from "primereact/api";
import {twMerge} from 'tailwind-merge';
import SaunaPrimeReactTailwind from './components/primereact_tailwind.js';
import {ApiConnectionPage} from "./pages/api_connection/api_connection.jsx";
import MainLayout from "./pages/main_layout.jsx";
import SessionPage from "./pages/session/session.jsx";

// React DOM Render
const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <Provider store={store}>
            <PrimeReactProvider value={{
                unstyled: true,
                pt: SaunaPrimeReactTailwind,
                ptOptions: {mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge}
            }}>
                <HashRouter>
                    <Routes>
                        <Route index element={<ApiConnectionPage/>}/>
                        <Route element={<MainLayout/>}>
                            <Route path="/main" element={<MainPage/>}/>
                            <Route path="/initSession" element={<SessionPage />} />
                        </Route>
                        <Route path="/sauna_scenario_maker" element={<SaunaScenarioMaker/>}/>
                        <Route path="/map" element={<MapPage/>}/>
                        <Route path="/commands" element={<CommandWindow/>}/>
                    </Routes>
                </HashRouter>
            </PrimeReactProvider>
        </Provider>
    </StrictMode>
);