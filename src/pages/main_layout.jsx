import {Outlet, useNavigate} from "react-router";
import {useSelector} from "react-redux";
import {useEffect} from "react";
import {Updater} from "./updater/updater.jsx";

const MainLayout = () => {
    const apiServer = useSelector((state) => state.apiServer);
    const navigate = useNavigate();

    useEffect(() => {
        if (!apiServer.connected){
            navigate("/")
        }
    }, [apiServer]);

    return (
        <>
            <Outlet />
            <Updater/>
        </>
    )
}

export default MainLayout;