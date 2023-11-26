// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod local_store;
mod sauna_api_container;
mod child_guard;

use std::fs::File;
use std::{io};
use std::io::{BufReader, Cursor};
use std::path::{Path, PathBuf};
use zip::ZipArchive;
use crate::local_store::init_store;
use local_store::*;
use crate::sauna_api_container::{start_sauna_api, stop_sauna_api};


fn main() {
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![extract_zip, store_set, store_get, store_save, download_file])
        .setup(|app| unsafe {
            // Initialize Store
            init_store(&app.path_resolver().app_data_dir().unwrap().join("config.json"));

            // Start Sauna API
            start_sauna_api(&app.path_resolver().resource_dir().unwrap().join("sauna-api"));

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");
    app.run(|_app_handle, event | match event {
        tauri::RunEvent::Exit {..} | tauri::RunEvent::ExitRequested {..} => unsafe {
            store_save().ok();
            stop_sauna_api();
        }
        _ => {}
    });
}

#[tauri::command]
fn download_file(url: &str, dir: &str) -> Result<String, String> {
    // Get filename from url
    let parsed_url = reqwest::Url::parse(url).map_err(|error| error.to_string())?;
    let filename = parsed_url.path_segments().map_or_else(std::path::PathBuf::new, |f| std::path::PathBuf::from(f.last().unwrap_or("")));

    // Download file
    let resp = reqwest::blocking::get(url).map_err(|error| error.to_string())?;
    let mut out = File::create(Path::new(dir).join(&filename)).map_err(|error| error.to_string())?;
    let mut content = Cursor::new(resp.bytes().map_err(|error| error.to_string())?);
    io::copy(&mut content, &mut out).map_err(|error| error.to_string())?;

    Ok(filename.file_name().ok_or("Failed to get file name".to_string())?.to_str().ok_or("Failed to get file name".to_string())?.to_string())
}

#[tauri::command]
fn extract_zip(dir: &str, zip_file_name: &str) -> Result<Vec<String>, String> {
    let filename = PathBuf::from(dir).join(zip_file_name);
    let file_reader = BufReader::new(File::open(filename).map_err(|error| error.to_string())?);
    let mut zip_archive = ZipArchive::new(file_reader).map_err(|error| error.to_string())?;

    // Get files in zip
    let files_in_zip = zip_archive.file_names().map(|x| {
        x.to_owned()
    }).collect::<Vec<_>>();

    zip_archive.extract(dir).map_err(|error| error.to_string())?;

    return Ok(files_in_zip);
}