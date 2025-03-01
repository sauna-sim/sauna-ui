use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiConnectionDetails {
    #[serde(default = "default_api_host_name")]
    pub host_name: String,
    #[serde(default = "default_api_port")]
    pub port: u16,
}
impl Default for ApiConnectionDetails {
    fn default() -> Self {
        ApiConnectionDetails {
            host_name: default_api_host_name(),
            port: default_api_port(),
        }
    }
}

fn default_api_host_name() -> String {
    "localhost".to_string()
}
fn default_api_port() -> u16 {
    5052
}