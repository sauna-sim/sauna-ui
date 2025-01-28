use std::fmt::Display;

pub mod child_guard;
pub mod port_finder;

pub fn stringify_error(error: impl Display) -> String {
    error.to_string()
}
