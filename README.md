# Sauna UI

## About
This project is the UI for SaunaSim. It's built in React and runs on the Tauri framework.

### [Sauna API](https://github.com/Sauna-ATC-Training-Simulator/sauna-api)
The API contains most of the core simulation code. For production, the UI will bundle the API.

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
- Run `npm run build`

This generates an installer in `src-tauri/target/release/bundle`