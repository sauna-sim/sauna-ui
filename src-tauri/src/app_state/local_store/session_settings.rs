use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SessionSettings {
    #[serde(default)]
    pub session_type: String,
    #[serde(default)]
    pub selected_fsd_profile: String,
    #[serde(default)]
    pub fsd_profiles: Vec<FsdConnectionProfile>,
    #[serde(default)]
    pub sweatbox_settings: SweatboxSettings,
    #[serde(default)]
    pub command_frequency: String
}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SweatboxSettings {
    #[serde(default)]
    pub server: String,
    #[serde(default)]
    pub network_id: String,
    #[serde(default)]
    pub password: String,
    #[serde(default)]
    pub real_name: String
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FsdConnectionProfile {
    #[serde(default)]
    pub profile_name: String,
    #[serde(default)]
    pub network_id: String,
    #[serde(default)]
    pub password: String,
    #[serde(default)]
    pub hostname: String,
    #[serde(default)]
    pub real_name: String,
    #[serde(default = "default_fsd_port")]
    pub port: u16,
    #[serde(default = "default_fsd_protocol")]
    pub protocol: String,
}

impl Default for FsdConnectionProfile {
    fn default() -> Self {
        FsdConnectionProfile {
            profile_name: String::default(),
            network_id: "".to_string(),
            password: "".to_string(),
            hostname: "".to_string(),
            port: default_fsd_port(),
            protocol: default_fsd_protocol(),
            real_name: String::default()
        }
    }
}

fn default_fsd_port() -> u16 {
    6809
}

fn default_fsd_protocol() -> String {
    "Classic".to_string()
}
