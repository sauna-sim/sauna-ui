use crate::app_state::local_store::StoreContainer;
use crate::utils::child_guard::ChildGuard;
use crate::utils::port_finder::get_available_port;
use sct_reader::package::AtcScopePackage;
use std::path::Path;
use std::sync::Mutex;

pub mod atc_scope_package;
pub mod local_store;

pub struct AppStateWrapper(pub Mutex<AppState>);

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiConnectionPayload {
    pub hostname: String,
    pub port: u16,
}

pub struct AppState {
    pub api_hostname: String,
    pub api_port: u16,
    pub api_builtin: bool,
    pub api_process: ChildGuard,
    pub local_store: Option<StoreContainer>,
    pub map_scope_package: Option<AtcScopePackage>,
}

impl AppState {
    pub fn new() -> AppState {
        AppState {
            api_hostname: "localhost".into(),
            api_port: 5052,
            api_builtin: true,
            api_process: ChildGuard(None),
            local_store: None,
            map_scope_package: None,
        }
    }

    pub fn init(&mut self, local_store_path: &Path) {
        self.local_store = Some(StoreContainer::new(local_store_path));
    }

    pub fn start_sauna_api(&mut self, sauna_api_dir: impl AsRef<Path>) -> Result<(), String> {
        // Get a port
        self.api_hostname = "localhost".to_owned();
        self.api_port =
            get_available_port().ok_or_else(|| "Could not find available port".to_owned())?;
        self.api_builtin = true;

        self.api_process.start_child(
            sauna_api_dir.as_ref().join("SaunaApi"),
            Some(sauna_api_dir),
            &["-p".to_owned(), self.api_port.to_string()],
        );

        // Check to make sure api started
        if self.api_process.0.is_none() {
            self.api_builtin = false;
            if let Some(local_store) = &self.local_store {
                self.api_hostname = local_store.store.api_connection_details.host_name.clone();
                self.api_port = local_store.store.api_connection_details.port;
            }
        }

        Ok(())
    }

    pub fn stop_sauna_api(&mut self) {
        if let Some(mut child) = self.api_process.0.take() {
            let ApiConnectionPayload { hostname, port } = self.get_api_conn_details();

            reqwest::blocking::Client::new()
                .post(format! {"http://{}:{}/api/server/shutdown", hostname, port})
                .send()
                .ok();
            child.wait().ok();

            self.api_process = ChildGuard(None);
        }
    }

    pub fn get_api_conn_details(&mut self) -> ApiConnectionPayload {
        if self.api_builtin {
            return ApiConnectionPayload {
                hostname: self.api_hostname.clone(),
                port: self.api_port,
            };
        }

        if let Some(local_store) = &self.local_store {
            return ApiConnectionPayload {
                hostname: local_store.store.api_connection_details.host_name.clone(),
                port: local_store.store.api_connection_details.port,
            };
        }

        ApiConnectionPayload {
            hostname: "localhost".to_string(),
            port: 5000,
        }
    }
}

#[tauri::command]
pub fn get_sauna_api_builtin(app_state: tauri::State<AppStateWrapper>) -> Result<bool, String> {
    let app_state_guard = app_state.0.lock().unwrap();
    Ok(app_state_guard.api_builtin)
}

#[tauri::command]
pub fn get_sauna_api_conn_details(
    app_state: tauri::State<AppStateWrapper>,
) -> Result<ApiConnectionPayload, String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    Ok(app_state_guard.get_api_conn_details())
}