use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NavigraphSettings {
    #[serde(default)]
    pub authenticated: bool,
    #[serde(default)]
    pub refresh_token: String,
    #[serde(default)]
    pub package: NavigraphPackageSettings
}

#[derive(Serialize, Deserialize, Default)]
pub struct NavigraphPackageSettings {
    #[serde(default)]
    pub package_id: String,
    #[serde(default)]
    pub cycle: String,
    #[serde(default)]
    pub revision: String,
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub current: bool
}