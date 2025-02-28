import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react()
    ],
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // Fixed port for Tauri
    server: {
        port: 5003,
        host: host || false,
        strictPort: true,
    },
    // to access the Tauri environment variables set by the CLI with information about the current target
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    publicDir: "static",
    build: {
        // Tauri uses Chromium on Windows and WebKit on macOS and Linux
        target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
        // don't minify for debug builds
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        // produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
        outDir: "../dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks: {
                    'maplibre-gl': ['maplibre-gl']
                }
            }
        }
    }
});