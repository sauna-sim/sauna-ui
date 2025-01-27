use crate::app_state::local_store::app_settings::Settings;
use crate::app_state::local_store::navigraph_settings::NavigraphSettings;
use crate::AppStateWrapper;
use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::io::Write;
use std::ops::IndexMut;
use std::path::{Path, PathBuf};

pub mod app_settings;
pub mod navigraph_settings;

pub struct StoreContainer {
    pub store: LocalStore,
    pub path: PathBuf,
}

impl StoreContainer {
    pub fn new(path: &Path) -> StoreContainer {
        // Try to load store from path, otherwise generate default store
        StoreContainer {
            path: path.to_owned(),
            store: std::fs::read_to_string(path)
                .ok()
                .and_then(|file_string| serde_json::from_str::<LocalStore>(&file_string).ok())
                .unwrap_or_default(),
        }
    }

    pub fn get(&self, key: &str) -> Option<serde_json::Value> {
        let json = serde_json::to_value(&self.store).ok()?;
        let split_keys = key.split('.');
        let mut ret_val = &json;
        for key in split_keys {
            if let Some(val) = ret_val.get(key) {
                ret_val = val;
            } else {
                return None;
            }
        }

        Some(ret_val.clone())
    }

    pub fn set(&mut self, key: &str, value: serde_json::Value) -> Result<(), String> {
        let mut json = serde_json::to_value(&self.store).map_err(|error| error.to_string())?;
        let split_keys = key.split('.');
        let mut ret_val = &mut json;
        for key in split_keys {
            ret_val = ret_val.index_mut(key);
        }

        *ret_val = value.clone();
        self.store =
            serde_json::from_value::<LocalStore>(json).map_err(|error| error.to_string())?;

        Ok(())
    }

    pub fn save(&self) -> Result<(), String> {
        // Serialize to string
        let json_str =
            serde_json::to_string_pretty(&self.store).map_err(|error| error.to_string())?;

        // Create directory
        if let Some(parent_path) = self.path.parent() {
            fs::create_dir_all(parent_path).map_err(|error| error.to_string())?;
        }

        // Save to file
        let mut file = File::create(&self.path).map_err(|error| error.to_string())?;

        write!(file, "{}", json_str).map_err(|error| error.to_string())?;

        Ok(())
    }
}

impl Drop for StoreContainer {
    fn drop(&mut self) {
        let json_str = match serde_json::to_string(&self.store) {
            Ok(value) => value,
            Err(error) => {
                println!("{}", error.to_string());

                panic!("LOL")
            }
        };

        // Save to file
        let mut file = match File::create(&self.path) {
            Ok(value) => value,
            Err(error) => {
                println!("{}", error.to_string());

                panic!("Failed at creating file")
            }
        };

        write!(file, "{}", json_str).unwrap_or_else(|error| println!("{}", error.to_string()));
    }
}

#[tauri::command(async)]
pub fn store_save(app_state: tauri::State<AppStateWrapper>) -> Result<(), String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    if let Some(local_store) = app_state_guard.local_store.as_mut() {
        local_store.save()
    } else {
        Err("Local Store is null".to_owned())
    }
}

#[tauri::command(async)]
pub fn store_get(
    key: &str,
    app_state: tauri::State<AppStateWrapper>,
) -> Result<serde_json::Value, String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    if let Some(local_store) = app_state_guard.local_store.as_mut() {
        local_store
            .get(key)
            .ok_or("Error getting value from local store".to_owned())
    } else {
        Err("Local Store is null".to_owned())
    }
}

#[tauri::command(async)]
pub fn store_set(
    key: &str,
    value: serde_json::Value,
    app_state: tauri::State<AppStateWrapper>,
) -> Result<(), String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    if let Some(local_store) = app_state_guard.local_store.as_mut() {
        local_store.set(key, value)
    } else {
        Err("Local Store is null".to_owned())
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct LocalStore {
    #[serde(default)]
    pub settings: Settings,
    #[serde(default)]
    pub navigraph: NavigraphSettings,
}
