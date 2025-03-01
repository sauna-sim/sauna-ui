import {MainToolbar} from "./toolbar/toolbar.jsx";
import {AircraftPage} from "./aircraft/aircraft";
import {useSelector} from "react-redux";
import {ApiConnectionPage} from "./api_connection/api_connection.jsx";
import {Updater} from "./updater/updater.jsx";

const MainPage = ({}) => {
    return <>
        <div className={"flex flex-col h-screen"}>
            <MainToolbar/>
            <AircraftPage/>
        </div>
    </>;
};

export default MainPage;