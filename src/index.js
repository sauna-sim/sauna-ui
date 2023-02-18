import React from 'react';
import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";

import './assets/stylesheets/index.scss';
import MainApp from "./pages/main";
import reduxStore from "./redux/reduxStore";

// React DOM Render
const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={reduxStore}>
        <MainApp />
    </Provider>
);