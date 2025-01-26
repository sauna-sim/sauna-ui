use std::clone::Clone;use std::fs::File;
use std::io::BufWriter;
use sct_reader::loaders::euroscope::loader::{EuroScopeLoader, EuroScopeLoaderPrf};
use sct_reader::loaders::vnas_crc::CrcPackage;
use sct_reader::package::{AtcFacility, AtcScopePackage};
use sct_reader::package::display::AtcDisplayType;
use sct_reader::package::map::AtcMap;
use sct_reader::package::symbol::AtcMapSymbol;
use serde::{Deserialize, Serialize};
use crate::AppStateWrapper;
use crate::utils::stringify_error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoadSectorFileType {
    AtcScopePackage {path: String},
    Crc {path: String},
    EuroScopeDirectory {path: String},
    EuroScopeProfile {paths: Vec<String>}
}

#[tauri::command(async)]
pub fn load_scope_package(package_to_load: LoadSectorFileType, app_state: tauri::State<AppStateWrapper>) -> Result<(), String> {
    let package = match package_to_load {
        LoadSectorFileType::Crc { path } => {
            let crc_package = CrcPackage::try_new_from_file(path).map_err(stringify_error)?;

            Some(AtcScopePackage::try_from(&crc_package).map_err(stringify_error)?)
        }
        LoadSectorFileType::EuroScopeDirectory { path } => {
            let mut es = EuroScopeLoader::try_new_from_dir(path).map_err(stringify_error)?;
            let result = es.try_read().map_err(stringify_error)?;

            Some(AtcScopePackage::try_from(result).map_err(stringify_error)?)
        }
        LoadSectorFileType::EuroScopeProfile { paths } => {
            let es_prfs = paths.iter().map(|path|
                EuroScopeLoaderPrf::try_new_from_prf(path).map_err(stringify_error))
                .collect::<Result<Vec<EuroScopeLoaderPrf>, String>>()?;

            let mut es = EuroScopeLoader {
                prfs: es_prfs
            };

            let result = es.try_read().map_err(stringify_error)?;
            Some(AtcScopePackage::try_from(result).map_err(stringify_error)?)
        }
        LoadSectorFileType::AtcScopePackage { path } => {
            Some(serde_json::from_reader::<File, AtcScopePackage>(
                File::open(&path).map_err(stringify_error)?)
                .map_err(stringify_error)?)
        }
    };

    let mut app_state_guard = app_state.0.lock().unwrap();
    app_state_guard.map_scope_package = package;

    Ok(())
}

#[tauri::command(async)]
pub fn save_scope_package(path: &str, app_state: tauri::State<AppStateWrapper>) -> Result<(), String> {
    let app_state_guard = app_state.0.lock().unwrap();

    if let Some(pkg) = &app_state_guard.map_scope_package {
        serde_json::to_writer(BufWriter::new(File::create(&path).map_err(stringify_error)?), &pkg)
            .map_err(stringify_error)?;
    }

    Ok(())
}

#[tauri::command(async)]
pub fn is_scope_package_loaded(app_state: tauri::State<AppStateWrapper>) -> bool {
    let app_state_guard = app_state.0.lock().unwrap();

    app_state_guard.map_scope_package.is_some()
}

#[tauri::command(async)]
pub fn get_scope_package_facilities(app_state: tauri::State<AppStateWrapper>) -> Result<Vec<AtcFacility>, String> {
    let app_state_guard = app_state.0.lock().unwrap();

    if let Some(pkg) = &app_state_guard.map_scope_package {
        Ok(pkg.facilities.clone())
    } else {
        Err("No ATC Scope Package Loaded!".to_string())
    }
}

#[tauri::command(async)]
pub fn get_scope_package_display_type(display_type: &str, app_state: tauri::State<AppStateWrapper>) -> Result<Option<AtcDisplayType>, String> {
    let app_state_guard = app_state.0.lock().unwrap();

    if let Some(pkg) = &app_state_guard.map_scope_package {
        Ok(pkg.display_types.get(display_type).map(|d| d.clone()))
    } else {
        Err("No ATC Scope Package Loaded!".to_string())
    }
}

#[tauri::command(async)]
pub fn get_scope_package_map(map_id: &str, app_state: tauri::State<AppStateWrapper>) -> Result<Option<AtcMap>, String> {
    let app_state_guard = app_state.0.lock().unwrap();

    if let Some(pkg) = &app_state_guard.map_scope_package {
        Ok(pkg.maps.get(map_id).map(|d| d.clone()))
    } else {
        Err("No ATC Scope Package Loaded!".to_string())
    }
}

#[tauri::command(async)]
pub fn get_scope_package_map_name(map_id: &str, app_state: tauri::State<AppStateWrapper>) -> Result<Option<String>, String> {
    let app_state_guard = app_state.0.lock().unwrap();

    if let Some(pkg) = &app_state_guard.map_scope_package {
        Ok(pkg.maps.get(map_id).map(|d| d.name.clone()))
    } else {
        Err("No ATC Scope Package Loaded!".to_string())
    }
}

#[tauri::command(async)]
pub fn get_scope_package_symbol(symbol_id: &str, app_state: tauri::State<AppStateWrapper>) -> Result<Option<AtcMapSymbol>, String> {
    let app_state_guard = app_state.0.lock().unwrap();

    if let Some(pkg) = &app_state_guard.map_scope_package {
        Ok(pkg.symbols.get(symbol_id).map(|d| d.clone()))
    } else {
        Err("No ATC Scope Package Loaded!".to_string())
    }
}