# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.24.3] - 2025-03-10
### Fixed
- Command Window not displaying

## [0.24.2] - 2025-03-02
### Added
- Standalone Mode
- Session Screen
- New Icon

### Changed
- UI using Tailwind instead of PrimeFlex
- SaunaApi to v0.24.0

## [0.23.3] - 2025-02-27
### Changed
- Icon replaced with temporary placeholder.

## [0.23.1] - 2025-02-23
### Changed
- SaunaApi to v0.23.0
  - World Magnetic Model (WMM) updated to 2025 model.
- NPM Package Upgrades
- License to LGPL v3.0

### Fixed
- Default Port for dev builds.

## [0.22.17] - 2025-02-19
### Fixed
- Wayland NVidia Webkit2GTK issues on Linux

## [0.22.14] - 2025-02-13
### Fixed
- Snapcraft Build Permissions

## [0.22.13] - 2025-02-13
### Added
- Snapcraft Build
- AUR Build

### Fixed
- External API Port entry issue

## [0.22.1] - 2025-02-08
### Added
- ARM builds to windows and linux
- Standalone builds

### Removed
- AppImage distribution

### Fixed
- Issue when resource_dir is undefined

## [0.21.11] - 2025-02-07
### Fixed
- Windows Updater not killing Sauna API.

## [0.21.10] - 2025-02-06
### Changed
- Using Tauri Websockets

## [0.21.9] - 2025-02-06
### Fixed
- Issue with AppImage builds with libwebkitgtk2.

## [0.21.8] - 2025-02-06
### Added
- Updater

### Changed
- API Updated to 0.22.0

### Fixed
- Bug with linux releases

## [0.21.1] - 2025-02-05
### Fixed
- Tag width update bug

## [0.21.0] - 2025-02-05
### Added
- Aircraft tags to map
- Aircraft route display on map

### Changed
- PrimeReact styling to look more like Bootstrap

## [0.20.0] - 2025-02-03
### Changed
- Moved from React Bootstrap to PrimeReact

### Fixed
- Bug with main window not closing correctly

## [0.19.1] - 2025-01-31
### Changed
- Cleaned up unused dependencies

## [0.19.0] - 2025-01-31
### Changed
- New API with Navigraph authentication being handled on backend

## [0.18.1] - 2025-01-29
### Fixed
- Map not working on MacOS due to http url for fonts

## [0.18.0] - 2025-01-28
### Added
- Scenario Editor
- Map Window
- Command Window
- Custom Scenario Format

### Changed
- Upgraded to Tauri 2.0
- All components to functional components.

### Fixed
- Deleting Aircraft Bug

[Unreleased]: https://github.com/sauna-sim/sauna-ui/compare/v0.24.3...master
[0.24.3]: https://github.com/sauna-sim/sauna-ui/compare/v0.24.2...v0.24.3
[0.24.2]: https://github.com/sauna-sim/sauna-ui/compare/v0.23.3...v0.24.2
[0.23.3]: https://github.com/sauna-sim/sauna-ui/compare/v0.23.1...v0.23.3
[0.23.1]: https://github.com/sauna-sim/sauna-ui/compare/v0.22.17...v0.23.1
[0.22.17]: https://github.com/sauna-sim/sauna-ui/compare/v0.22.14...v0.22.17
[0.22.14]: https://github.com/sauna-sim/sauna-ui/compare/v0.22.13...v0.22.14
[0.22.13]: https://github.com/sauna-sim/sauna-ui/compare/v0.22.1...v0.22.13
[0.22.1]: https://github.com/sauna-sim/sauna-ui/compare/v0.21.11...v0.22.1
[0.21.11]: https://github.com/sauna-sim/sauna-ui/compare/v0.21.10...v0.21.11
[0.21.10]: https://github.com/sauna-sim/sauna-ui/compare/v0.21.9...v0.21.10
[0.21.9]: https://github.com/sauna-sim/sauna-ui/compare/v0.21.8...v0.21.9
[0.21.8]: https://github.com/sauna-sim/sauna-ui/compare/v0.21.1...v0.21.8
[0.21.1]: https://github.com/sauna-sim/sauna-ui/compare/v0.21.0...v0.21.1
[0.21.0]: https://github.com/sauna-sim/sauna-ui/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/sauna-sim/sauna-ui/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/sauna-sim/sauna-ui/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/sauna-sim/sauna-ui/compare/v0.18.1...v0.19.0
[0.18.1]: https://github.com/sauna-sim/sauna-ui/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/sauna-sim/sauna-ui/compare/v0.17.5...v0.18.0