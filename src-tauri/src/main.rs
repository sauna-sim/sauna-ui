// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod local_store;

use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use tauri::{WindowEvent};
use zip::ZipArchive;
use crate::local_store::init_store;
use local_store::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![extract_zip, store_set, store_get, store_save])
        .setup(|app| unsafe {
            init_store(&app.path_resolver().app_data_dir().unwrap().join("config.json"));

            Ok(())
        })
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested {..} = event.event() {
                store_save().ok();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn extract_zip(dir: &str, zip_file_name: &str) -> Option<Vec<String>> {
    let filename = PathBuf::from(dir).join(zip_file_name);
    let file_reader = BufReader::new(File::open(filename).ok()?);
    let mut zip_archive = ZipArchive::new(file_reader).ok()?;

    // Get files in zip
    let files_in_zip = zip_archive.file_names().map(|x| {
        x.to_owned()
    }).collect::<Vec<_>>();

    zip_archive.extract(dir).ok()?;

    return Some(files_in_zip);
}