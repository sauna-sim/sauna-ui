# [SaunaSim](https://sauna-sim.github.io)
[![Build Status]][actions]
[![License Img]][license]
[![Latest Version]][githubreleases]
[![Changelog Img]][changelog]

[Build Status]: https://img.shields.io/github/actions/workflow/status/sauna-sim/sauna-ui/build-and-test.yml?branch=master
[actions]: https://github.com/sauna-sim/sauna-ui/actions?query=branch%3Amaster
[Changelog Img]: https://img.shields.io/badge/Changelog-blue
[changelog]: CHANGELOG.md
[License Img]: https://img.shields.io/badge/License-GPLv3-blue
[license]: LICENSE
[Latest Version]: https://img.shields.io/github/v/release/sauna-sim/sauna-ui?include_prereleases
[githubreleases]: https://github.com/sauna-sim/sauna-ui/releases/latest

Get the latest version from here:

[![Downloads](https://img.shields.io/badge/downloads-blue?style=for-the-badge)](https://sauna-sim.github.io/downloads)


## About
This is a project that will allow for simulated ATC sessions (sweatbox sessions). It can be used on the VATSIM sweatbox server or on private FSD servers. By allowing airport and aircraft scenario configurations, it will allow ARTCCs and FIRs to better train their controllers for situations that they may encounter on the VATSIM network.

The idea was to create a realistic sweatbox simulator that could account for performance data, atmospheric conditions, routes and procedures, etc. The program should be able to handle ANY command that would be given over the network and the aircraft should respond in a realistic manner.

This project is the UI for SaunaSim. It's built in React, bundled through Vite, and runs on Tauri. Communication to the API is done through http requests and websockets. For production purposes, the API is bundled as part of the application.

### [Sauna API](https://github.com/sauna-sim/sauna-api)
The API contains most of the core simulation code. For production, the UI will bundle the API.

## Dependencies
This project depends on the following frameworks and packages:
- **[NodeJS 18+](https://nodejs.org/en/)**
- **[Rust 1.80+](https://www.rust-lang.org/)**
- **[Tauri 2](https://tauri.app/start/prerequisites/)**
  - Note: All Tauri pre-requisites must be installed to develop the Tauri app.

## Building
Ensure that all Node dependencies are installed:
- Run `npm install`

### Development Server
To start the development server:
- Run `npm start`

This will start the webpack dev server to serve the web content and will compile, build, and launch the tauri backend.

### Production Build
To build a bundle for production:
- Ensure `sauna-api` binaries are in `src-tauri/sauna-api`.
  - This will allow Tauri to bundle them into the application for production.
- Run `npm run package`

## Usage
Ensure that your settings are set correctly in the settings dialog.

### Navigation Data
Navdata can be loaded in 1 of 2 ways:
- Through Navigraph
  - Click the "Log In" Navigraph button and sign-in
  - Navdata will automatically be downloaded
  - **Note:** This requires an FMS Data subscription
- From a Sector File
  - Click the SCT button and select the sector file

### Loading a Scenario
Use the Load Scenario Button (with the aircraft icon).
- EuroScope
  - Loads a EuroScope scenario file
- Sauna
  - Loads a Sauna Scenario File
  - Can be created through the scenario maker.

### Controlling Aircraft
Aircraft are paused by default when the scenario is loaded in. All aircraft are currently controlled via text commands sent through the *Command Frequency* or via the Command Window.

The allowable commands are documented here:

[Command Reference Guide](https://github.com/sauna-sim/sauna-api/blob/master/Commands.md)