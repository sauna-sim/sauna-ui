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
        && env::var("APP_BINARY_NAME").is_ok()
        && env::var("AUR_GITHUB_REPO").is_ok()
    {
        let crate_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let target_dir = PathBuf::from(env::var("AUR_DEFS_OUTPUT").unwrap());
        let aur_package_name = env::var("AUR_PACKAGE_NAME").unwrap();

        // Create dir
        create_dir_all(&target_dir).unwrap();

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

    // Generate Snapcraft.yml
    if env::var("SNAP_GENERATE_DEFS").is_ok()
        && env::var("SNAP_PACKAGE_NAME").is_ok()
        && env::var("SNAP_DEFS_OUTPUT").is_ok()
        && env::var("APP_BINARY_NAME").is_ok()
        && env::var("SNAP_DEB_PATH").is_ok()
    {
        let crate_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let target_dir = PathBuf::from(env::var("SNAP_DEFS_OUTPUT").unwrap());

        // Create dir
        create_dir_all(&target_dir).unwrap();

        // Load file and replace variables
        replace_file_vars(
            &crate_dir.join("packageinfo").join("snapcraft").join("snapcraft.yaml"),
            &target_dir.join("snapcraft.yaml")
        );

    }
}

fn replace_file_vars(in_file: &PathBuf, out_file: &PathBuf) {
    let mut contents = fs::read_to_string(in_file).unwrap();

    let rules = &[
        (
            "${AUR_PACKAGE_NAME}",
            env::var("AUR_PACKAGE_NAME").unwrap_or_default(),
        ),
        (
            "${APP_BINARY_NAME}",
            env::var("APP_BINARY_NAME").unwrap_or_default(),
        ),
        (
            "${AUR_GITHUB_REPO}",
            env::var("AUR_GITHUB_REPO").unwrap_or_default(),
        ),
        (
            "${CARGO_PKG_VERSION}",
            env::var("CARGO_PKG_VERSION").unwrap_or_default(),
        ),
        (
            "${CARGO_PKG_DESCRIPTION}",
            env::var("CARGO_PKG_DESCRIPTION").unwrap_or_default(),
        ),
        (
            "${CARGO_PKG_HOMEPAGE}",
            env::var("CARGO_PKG_HOMEPAGE").unwrap_or_default(),
        ),
        (
            "${SNAP_PACKAGE_NAME}",
            env::var("SNAP_PACKAGE_NAME").unwrap_or_default()
        ),
        (
            "${SNAP_DEB_PATH}",
            env::var("SNAP_DEB_PATH").unwrap_or_default()
        )
    ];

    for (from, to) in rules {
        while let Some(start) = contents.find(from) {
            let range = start..start + from.len();
            contents.replace_range(range, to);
        }
    }

    fs::write(out_file, contents).unwrap();
}
