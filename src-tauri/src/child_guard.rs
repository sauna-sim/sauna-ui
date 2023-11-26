use std::process::Child;

pub struct ChildGuard(pub Option<Child>);
impl Drop for ChildGuard {
    fn drop(&mut self) {
        if let Some(mut child) = self.0.take() {
            match child.kill() {
                Err(e) => println!("Could not kill child process: {}", e),
                Ok(_) => println!("Successfully killed child process"),
            }
        }
    }
}