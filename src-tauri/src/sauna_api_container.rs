use std::path::Path;
use std::process::Command;
use crate::child_guard::ChildGuard;
use crate::local_store::{ApiServerSettings, store_get};

static mut SAUNA_API_PROCESS: ChildGuard = ChildGuard(None);

pub unsafe fn start_sauna_api(sauna_api_dir: &Path) {
    let child = Command::new(sauna_api_dir.join("SaunaApi"))
        .current_dir(sauna_api_dir)
        .spawn()
        .ok();
    SAUNA_API_PROCESS = ChildGuard(child);
}

pub unsafe fn stop_sauna_api(){
    if let Some(mut child) = SAUNA_API_PROCESS.0.take() {
        let api_server_settings =
            serde_json::from_value::<ApiServerSettings>(
                store_get("settings.apiServer").expect("Could not get API settings")
            ).expect("Could not deserialize API settings");

        reqwest::blocking::Client::new()
            .post(format! {"http://{}:{}/api/server/shutdown", api_server_settings.host_name, api_server_settings.port})
            .send()
            .ok();
        child.wait().ok();
    }
}