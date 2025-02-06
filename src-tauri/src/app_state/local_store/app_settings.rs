use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default)]
    pub api_server: ApiServerSettings,
    #[serde(default)]
    pub api_settings: ApiSettings,
    #[serde(default)]
    pub fsd_connection: FsdConnectionSettings,
    #[serde(default)]
    pub updater_ignore_version: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiServerSettings {
    #[serde(default = "default_api_host_name")]
    pub host_name: String,
    #[serde(default = "default_api_port")]
    pub port: u16,
}
impl Default for ApiServerSettings {
    fn default() -> Self {
        ApiServerSettings {
            host_name: default_api_host_name(),
            port: default_api_port(),
        }
    }
}

fn default_api_host_name() -> String {
    "localhost".to_string()
}
fn default_api_port() -> u16 {
    5000
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiSettings {
    #[serde(default = "default_api_pos_calc_rate")]
    pub pos_calc_rate: u16,
    #[serde(default = "default_api_command_freq")]
    pub command_frequency: String,
}
impl Default for ApiSettings {
    fn default() -> Self {
        ApiSettings {
            pos_calc_rate: default_api_pos_calc_rate(),
            command_frequency: default_api_command_freq(),
        }
    }
}

fn default_api_pos_calc_rate() -> u16 {
    100
}
fn default_api_command_freq() -> String {
    "199.998".to_string()
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FsdConnectionSettings {
    #[serde(default)]
    pub network_id: String,
    #[serde(default)]
    pub password: String,
    #[serde(default)]
    pub hostname: String,
    #[serde(default = "default_fsd_port")]
    pub port: u16,
    #[serde(default = "default_fsd_protocol")]
    pub protocol: String,
}
impl Default for FsdConnectionSettings {
    fn default() -> Self {
        FsdConnectionSettings {
            network_id: "".to_string(),
            password: "".to_string(),
            hostname: "".to_string(),
            port: default_fsd_port(),
            protocol: default_fsd_protocol(),
        }
    }
}
fn default_fsd_port() -> u16 {
    6809
}
fn default_fsd_protocol() -> String {
    "Classic".to_string()
}
