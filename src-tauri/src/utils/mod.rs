use std::fmt::Display;

pub mod port_finder;
pub mod child_guard;

pub fn stringify_error(error: impl Display) -> String {
    error.to_string()
}