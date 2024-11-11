# About
This project is the UI for SaunaSim. It's built in React, bundled through Vite, and runs on Tauri. Communication to the API is done through http requests and websockets. For production purposes, the API is bundled as part of the application.

# Download
[![Release](https://img.shields.io/github/v/release/Sauna-ATC-Training-Simulator/sauna-ui?include_prereleases&style=for-the-badge)][1]

If the binary for your operating system is not provided, it must be compiled from source.

[1]: https://github.com/Sauna-ATC-Training-Simulator/sauna-ui/releases/latest

# Details
### [Sauna API](https://github.com/Sauna-ATC-Training-Simulator/sauna-api)
The API contains most of the core simulation code. For production, the UI will bundle the API.

### [Sauna Radar](https://github.com/caspianmerlin/sauna-radar)
A Radar screen for Sauna.

## Dependencies
This project depends on the following frameworks and packages:
- **[NodeJS 18+](https://nodejs.org/en/)**
- **[Rust 1.73+](https://www.rust-lang.org/)**
- **[Tauri](https://tauri.app/v1/guides/getting-started/prerequisites)**
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
- Ensure `sauna-api` and `sauna-radar` binaries are in `src-tauri/sauna-api` and `src-tauri/sauna-radar` respectively.
  - This will allow Tauri to bundle them into the application for production.
- Run `npm run package`

This generates an installer in `src-tauri/target/release/bundle`