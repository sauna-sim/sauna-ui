use std::net::TcpListener;

pub fn get_available_port() -> Option<u16> {
    (10050..14950).find(|port| port_is_available(*port))
}

pub fn port_is_available(port: u16) -> bool {
    match TcpListener::bind(("localhost", port)) {
        Ok(_) => true,
        Err(_) => false,
    }
}
