use std::{
    env,
    fs::{self, create_dir_all},
    path::PathBuf,
};

fn main() {
    tauri_build::build();

    // Generate AUR defs
    if env::var("AUR_GENERATE_DEFS").is_ok()
        && env::var("AUR_PACKAGE_NAME").is_ok()
        && env::var("AUR_DEFS_OUTPUT").is_ok()
        && env::var("AUR_DEB_PREFIX").is_ok()
        && env::var("AUR_GITHUB_REPO").is_ok()
    {
        let crate_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let target_dir = PathBuf::from(env::var("AUR_DEFS_OUTPUT").unwrap());
        let aur_package_name = env::var("AUR_PACKAGE_NAME").unwrap();

        // Create dir
        create_dir_all(&target_dir.join("build")).unwrap();

        // Load AUR info and replace variables
        replace_file_vars(
            &crate_dir.join("packageinfo").join("aur").join("PKGBUILD"),
            &target_dir.join("PKGBUILD"),
        );
        replace_file_vars(
            &crate_dir
                .join("packageinfo")
                .join("aur")
                .join("template.install"),
            &target_dir.join(format!("{}.install", aur_package_name)),
        );
    }
}

fn replace_file_vars(in_file: &PathBuf, out_file: &PathBuf) {
    let mut contents = fs::read_to_string(in_file).unwrap();

    let rules = &[
        ("${AUR_PACKAGE_NAME}", env::var("AUR_PACKAGE_NAME").unwrap()),
        ("${AUR_DEB_PREFIX}", env::var("AUR_DEB_PREFIX").unwrap()),
        ("${AUR_GITHUB_REPO}", env::var("AUR_GITHUB_REPO").unwrap()),
        ("${CARGO_PKG_VERSION}", env::var("CARGO_PKG_VERSION").unwrap()),
        ("${CARGO_PKG_DESCRIPTION}", env::var("CARGO_PKG_DESCRIPTION").unwrap()),
        ("${CARGO_PKG_HOMEPAGE}", env::var("CARGO_PKG_HOMEPAGE").unwrap()),
    ];

    for (from, to) in rules {
        while let Some(start) = contents.find(from) {
            let range = start..start + from.len();
            contents.replace_range(range, to);
        }
    }

    fs::write(out_file, contents).unwrap();
}
