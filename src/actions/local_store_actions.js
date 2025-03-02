import {invoke} from "@tauri-apps/api/core";
import {store as reduxStore} from '../redux/store';
import {setNvgAuthenticated, setNvgIsCurrent, setNvgPackageInfo} from "../redux/slices/navigraphSlice";
import {getSaunaApiConnectionDetails} from "./tauri_actions";

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

export async function getApiServerDetails(){
    return await getStoreItem("apiConnectionDetails");
}

export async function saveApiServerDetails(apiServerDetails){
    await setStoreItem("apiConnectionDetails", apiServerDetails);
}

export async function getStoreSessionId() {
    return await getStoreItem("session.id");
}

export async function saveStoreSessionId(sessionId){
    await setStoreItem("session.id", sessionId);
}

export async function getStoreSessionSettings() {
    return await getStoreItem("session.settings");
}

export async function saveStoreSessionSettings(sessionSettings) {
    await setStoreItem("session.settings", sessionSettings);
}

export async function saveStoreFsdProfiles(profiles) {
    await setStoreItem("session.settings.fsdProfiles", profiles);
}

export async function getApiHostname(){
    return (await getSaunaApiConnectionDetails()).hostname;
}

export async function getApiPort(){
    return (await getSaunaApiConnectionDetails()).port;
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