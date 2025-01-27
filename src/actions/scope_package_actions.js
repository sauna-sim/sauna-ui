import {invoke} from "@tauri-apps/api/core";

export async function loadScopePackage(pkgType) {
    return await invoke('load_scope_package', {
        packageToLoad: pkgType
    });
}

export async function saveScopePackage(file) {
    return await invoke('save_scope_package', {
        path: file
    });
}

export async function isScopePackageLoaded() {
    return await invoke('is_scope_package_loaded');
}

export async function getScopePackageFacilities() {
    return await invoke('get_scope_package_facilities');
}

export async function getScopePackageDisplayType(displayType) {
    return await invoke('get_scope_package_display_type', {
        displayType
    });
}

export async function getScopePackageMap(mapId) {
    return await invoke('get_scope_package_map', {
        mapId
    });
}

export async function getScopePackageSymbol(symbolId) {
    return await invoke('get_scope_package_symbol', {
        symbolId
    });
}

export async function getScopePackageMapName(mapId) {
    return await invoke('get_scope_package_map_name', {
        mapId
    });
}