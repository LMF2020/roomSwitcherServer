import { bytecodePlugin, defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import vue from '@vitejs/plugin-vue'

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
