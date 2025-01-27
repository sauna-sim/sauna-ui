// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_state;
mod utils;

use crate::app_state::atc_scope_package::{
    get_scope_package_display_type, get_scope_package_facilities, get_scope_package_map,
    get_scope_package_map_name, get_scope_package_symbol, is_scope_package_loaded,
    load_scope_package, save_scope_package,
};
use crate::app_state::local_store::{store_get, store_save, store_set};
use crate::app_state::{
    get_sauna_api_builtin, get_sauna_api_conn_details, AppState, AppStateWrapper,
};
use crate::utils::stringify_error;
use std::fs::File;
use std::io;
use std::io::{BufRead, BufReader, Cursor};
use std::path::{Path, PathBuf};
use std::string::ToString;
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use zip::ZipArchive;

fn main() {
    // Env path fix
    let _ = fix_path_env::fix();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppStateWrapper(Mutex::new(AppState::new())))
        .invoke_handler(tauri::generate_handler![
            extract_zip,
            store_set,
            store_get,
            store_save,
            download_file,
            get_sauna_api_builtin,
            get_sauna_api_conn_details,
            read_text_file,
            save_scope_package,
            load_scope_package,
            is_scope_package_loaded,
            get_scope_package_facilities,
            get_scope_package_display_type,
            get_scope_package_map,
            get_scope_package_symbol,
            get_scope_package_map_name
        ])
        .setup(|app| {
            // Send Sauna API Built In event
            app.emit("sauna-api-builtin", true).unwrap();

            // Get app state
            let binding = app.state::<AppStateWrapper>();
            let mut app_state_guard = binding.0.lock().unwrap();

            // Initialize Store
            app_state_guard.init(
                &app.path()
                    .app_data_dir()
                    .unwrap()
                    .join("config.json"),
            );

            // Start Sauna API
            app_state_guard
                .start_sauna_api(
                    &app.path()
                        .resource_dir()
                        .unwrap()
                        .join("sauna-api")
                )
                .ok();

            // Send Sauna API Built In event
            app.emit("sauna-api-builtin", app_state_guard.api_builtin)
                .unwrap();
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");
    app.run(|_app_handle, event| match event {
        tauri::RunEvent::Exit { .. } | tauri::RunEvent::ExitRequested { .. } => {
            // Get app state
            let binding = _app_handle.state::<AppStateWrapper>();
            let mut app_state_guard = binding.0.lock().unwrap();

            // Save local store
            if let Some(local_store) = app_state_guard.local_store.as_ref() {
                local_store.save().ok();
            }

            // Stop sauna API
            app_state_guard.stop_sauna_api();
        }
        _ => {}
    });
}

#[tauri::command(async)]
fn download_file(url: &str, dir: &str) -> Result<String, String> {
    // Get filename from url
    let parsed_url = reqwest::Url::parse(url).map_err(stringify_error)?;
    let filename = parsed_url
        .path_segments()
        .map_or_else(std::path::PathBuf::new, |f| {
            std::path::PathBuf::from(f.last().unwrap_or(""))
        });

    // Download file
    let resp = reqwest::blocking::get(url).map_err(stringify_error)?;
    let mut out = File::create(Path::new(dir).join(&filename)).map_err(stringify_error)?;
    let mut content = Cursor::new(resp.bytes().map_err(stringify_error)?);
    io::copy(&mut content, &mut out).map_err(stringify_error)?;

    Ok(filename
        .file_name()
        .ok_or("Failed to get file name".to_string())?
        .to_str()
        .ok_or("Failed to get file name".to_string())?
        .to_string())
}

#[tauri::command(async)]
fn read_text_file(file_name: &str) -> Result<Vec<String>, String> {
    let file_reader = BufReader::new(File::open(file_name).map_err(stringify_error)?);
    let mut lines: Vec<String> = Vec::new();

    for line in file_reader.lines() {
        if line.is_ok() {
            lines.push(line.unwrap().to_string());
        }
    }

    Ok(lines)
}

#[tauri::command(async)]
fn extract_zip(dir: &str, zip_file_name: &str) -> Result<Vec<String>, String> {
    let filename = PathBuf::from(dir).join(zip_file_name);
    let file_reader = BufReader::new(File::open(filename).map_err(stringify_error)?);
    let mut zip_archive = ZipArchive::new(file_reader).map_err(stringify_error)?;

    // Get files in zip
    let files_in_zip = zip_archive
        .file_names()
        .map(|x| x.to_owned())
        .collect::<Vec<_>>();

    zip_archive.extract(dir).map_err(stringify_error)?;

    Ok(files_in_zip)
}
