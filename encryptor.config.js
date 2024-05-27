import { defineConfig } from "electron-builder-encryptor";

export default defineConfig({
  key: "xxx000777",
  protocol: "myclient2",
  privileges: {
    standard: true,
    secure: true,
    bypassCSP: true,
    allowServiceWorkers: true,
    supportFetchAPI: false,
    corsEnabled: true,
    stream: true,
  },
  preload: ["preload.js", "preload2.js"],
  renderer: {
    entry: "../../dist",
  },
  syncValidationChanges: true,
});
