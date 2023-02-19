import React from 'react';
import {createRoot} from "react-dom/client";

import './assets/stylesheets/index.scss';
import MainApp from "./pages/main";

// React DOM Render
const root = createRoot(document.getElementById('root'));
root.render(
    <MainApp/>
);