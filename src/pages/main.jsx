import {MainToolbar} from "./toolbar/toolbar.jsx";
import {AircraftPage} from "./aircraft/aircraft";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router";

const MainPage = ({}) => {
    const session = useSelector(state => state.session);
    const navigate = useNavigate();

    if (!session.id){
        navigate("/initSession");
    }

    return <>
        <div className={"flex flex-col h-screen"}>
            <MainToolbar/>
            <AircraftPage/>
        </div>
    </>;
};

export default MainPage;