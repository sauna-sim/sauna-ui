import {invoke} from "@tauri-apps/api";
import {store as reduxStore} from '../redux/store';
import {setNvgAuthenticated, setNvgIsCurrent, setNvgPackageInfo} from "../redux/slices/navigraphSlice";

export async function getStoreItem(key){
    // Invoke Rust command
    return await invoke('store_get', {
        key
    });
}

export async function setStoreItem(key, value){
    // Invoke Rust command
    return await invoke('store_set', {
        key,
        value
    });
}

export async function storeSave(){
    // Invoke Rust command
    return await invoke('store_save', {});
}

export async function getUiSettings(){
    return await getStoreItem("settings");
}

export async function saveUiSettings(uiSettings){
    await setStoreItem("settings", uiSettings);
}

export async function getApiServerDetails(){
    return await getStoreItem("settings.apiServer");
}

export async function saveApiServerDetails(apiServerDetails){
    await setStoreItem("settings.apiServer", apiServerDetails);
}

export async function getApiHostname(){
    return await getStoreItem("settings.apiServer.hostName");
}

export async function getApiPort(){
    return await getStoreItem("settings.apiServer.port");
}

export async function getApiUrl(){
    return `http://${await getApiHostname()}:${await getApiPort()}/api`;
}

export async function setNavigraphRefreshToken(refreshToken){
    await setStoreItem("navigraph.refreshToken", refreshToken);
    await setStoreItem("navigraph.authenticated", true);

    // Update redux state
    reduxStore.dispatch(setNvgAuthenticated(true));
}

export async function clearNavigraphRefreshToken(){
    await setStoreItem("navigraph.refreshToken", "");
    await setStoreItem("navigraph.authenticated", false);

    // Update redux state
    reduxStore.dispatch(setNvgAuthenticated(false));
}

export async function getNavigraphRefreshToken(){
    return await getStoreItem("navigraph.refreshToken");
}

export async function setNavigraphPackageInfo(packageInfo){
    await setStoreItem("navigraph.package", packageInfo);

    // Update redux state
    reduxStore.dispatch(setNvgPackageInfo(packageInfo));
}

export async function setNavigraphPackageIsCurrent(isCurrent){
    await setStoreItem("navigraph.package.current", isCurrent);

    // Update redux state
    reduxStore.dispatch(setNvgIsCurrent(isCurrent));
}

export async function getNavigraphPackageInfo(){
    return await getStoreItem("navigraph.package");
}

export async function isNavigraphAuthenticated(){
    return await getStoreItem("navigraph.authenticated");
}