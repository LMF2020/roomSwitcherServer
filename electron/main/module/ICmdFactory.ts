import { ICmdService } from "./ICmd.js";
import { MacCmd } from "./MacCmd.js";
import { WinCmd } from "./WinCmd.js";

export class ICmdFactory {
    static getCmdByOS(): ICmdService {
        const platform = process.platform;
        if (platform === 'darwin') { // macOS
            return MacCmd.getInstance();
        } else if (platform === 'win32') { // Windows
            return WinCmd.getInstance();
        } else {
            throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}