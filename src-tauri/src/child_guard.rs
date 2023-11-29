use std::path::Path;
use std::process::{Child, Command};

pub struct ChildGuard(pub Option<Child>);
impl ChildGuard {
    pub fn new() -> ChildGuard {
        ChildGuard(None)
    }

    pub fn start_child(&mut self, program_path: &Path, exec_dir: &Path, args: &[String]) {
        self.0 = Command::new(program_path)
            .current_dir(exec_dir)
            .args(args)
            .spawn()
            .ok();
    }
}

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