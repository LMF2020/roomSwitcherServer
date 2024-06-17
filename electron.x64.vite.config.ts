import { bytecodePlugin, defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import vue from '@vitejs/plugin-vue'

process.env.ELECTRON_EXEC_PATH = '/Users/jed/Documents/sdk/electron-v30.0.9-darwin-x64/electron.app/Contents/MacOS/electron'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/main/index.ts"),
        },
        output: {
          format: "cjs"
        }
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "electron/preload/index.ts"),
        },
      },
    },
  },
  renderer: {
    plugins: [vue()],
    root: ".",
    build: {
      minify: true,
      outDir: "dist/renderer",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html"),
        },
      },
    },
  },
});
