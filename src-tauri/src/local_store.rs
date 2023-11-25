use std::fs::File;
use std::ops::IndexMut;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use std::io::Write;

static mut STORE:Mutex<Option<StoreContainer>> = Mutex::new(None);

pub unsafe fn init_store(path: &Path) {
    // Create file if it doesn't exist
    if let Some(store) = std::fs::read_to_string(path).ok().and_then(|file_string| {
        serde_json::from_str::<LocalStore>(&file_string).ok()
    }) {
        *STORE.lock().unwrap() = Some(StoreContainer {
            store,
            path: path.to_owned()
        });
    } else {
        *STORE.lock().unwrap() = Some(StoreContainer {
            store: LocalStore::default(),
            path: path.to_owned()
        });
    }
}

#[tauri::command]
pub fn store_save() -> Result<(), String> {
    unsafe {
        let lock = STORE.lock().map_err(|error| error.to_string())?;

        // Serialize to string
        let json_str = serde_json::to_string_pretty(&lock.as_ref().unwrap().store).map_err(|error| error.to_string())?;

        // Save to file
        let mut file = File::create(&lock.as_ref().unwrap().path).map_err(|error| error.to_string())?;

        write!(file, "{}", json_str).map_err(|error| error.to_string())?;

        Ok(())
    }
}

#[tauri::command]
pub fn store_get(key: &str) -> Result<serde_json::Value, String> {
    unsafe {
        let lock = STORE.lock().unwrap();
        let json = serde_json::to_value(&lock.as_ref().unwrap().store).map_err(|error| error.to_string())?;
        let split_keys = key.split('.');
        let mut ret_val = &json;
        for key in split_keys {
            ret_val = ret_val.get(key).ok_or("Failed to get JSON Value".to_string())?;
        }

        Ok(ret_val.clone())
    }
}

#[tauri::command]
pub fn store_set(key: &str, value: serde_json::Value) -> Result<(), String> {
    unsafe {
        let mut lock = STORE.lock().unwrap();
        let mut json = serde_json::to_value(&lock.as_ref().unwrap().store).map_err(|error| error.to_string())?;
        let split_keys = key.split('.');
        let mut ret_val = &mut json;
        for key in split_keys {
            ret_val = ret_val.index_mut(key);
        }

        *ret_val = value.clone();
        lock.as_mut().unwrap().store = serde_json::from_value::<LocalStore>(json).map_err(|error| error.to_string())?;

        Ok(())
    }
}

pub struct StoreContainer {
    store: LocalStore,
    path: PathBuf
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

        match write!(file, "{}", json_str) {
            Ok(value) => value,
            Err(error) => println!("{}", error.to_string())
        };
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct LocalStore {
    #[serde(default)]
    settings: Settings,
    #[serde(default)]
    navigraph: NavigraphSettings
}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct Settings {
    #[serde(default)]
    api_server: ApiServerSettings,
    #[serde(default)]
    api_settings: ApiSettings,
    #[serde(default)]
    fsd_connection: FsdConnectionSettings
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiServerSettings {
    #[serde(default = "default_api_host_name")]
    host_name: String,
    #[serde(default = "default_api_port")]
    port: u16
}
impl Default for ApiServerSettings {
    fn default() -> Self {
        ApiServerSettings {
            host_name: default_api_host_name(),
            port: default_api_port()
        }
    }
}

fn default_api_host_name() -> String {"localhost".to_string()}
fn default_api_port() -> u16 {5000}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiSettings {
    #[serde(default = "default_api_pos_calc_rate")]
    pos_calc_rate: u16,
    #[serde(default = "default_api_command_freq")]
    command_frequency: String
}
impl Default for ApiSettings {
    fn default() -> Self {
        ApiSettings {
            pos_calc_rate: default_api_pos_calc_rate(),
            command_frequency: default_api_command_freq()
        }
    }
}

fn default_api_pos_calc_rate() -> u16 {100}
fn default_api_command_freq() -> String {"199.998".to_string()}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FsdConnectionSettings {
    #[serde(default)]
    network_id: String,
    #[serde(default)]
    password: String,
    #[serde(default)]
    hostname: String,
    #[serde(default = "default_fsd_port")]
    port: u16,
    #[serde(default = "default_fsd_protocol")]
    protocol: String
}
impl Default for FsdConnectionSettings {
    fn default() -> Self {
        FsdConnectionSettings{
            network_id: "".to_string(),
            password: "".to_string(),
            hostname: "".to_string(),
            port: default_fsd_port(),
            protocol: default_fsd_protocol()
        }
    }
}
fn default_fsd_port() -> u16 {6809}
fn default_fsd_protocol() -> String {"Classic".to_string()}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct NavigraphSettings {
    #[serde(default)]
    authenticated: bool,
    #[serde(default)]
    refresh_token: String,
    #[serde(default)]
    package: NavigraphPackageSettings
}

#[derive(Serialize, Deserialize, Default)]
struct NavigraphPackageSettings {
    #[serde(default)]
    package_id: String,
    #[serde(default)]
    cycle: String,
    #[serde(default)]
    revision: String,
    #[serde(default)]
    filename: String
}