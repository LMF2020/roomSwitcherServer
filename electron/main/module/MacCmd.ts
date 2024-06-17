import { exec } from "child_process";
import { CallbackFunction, ICmdService } from "./ICmd.js";
import { constants } from "../config.js";

/// 拉起windows端app
export class MacCmd implements ICmdService {

    private static instance: MacCmd;

    private constructor() { }

    public static getInstance(): MacCmd {
        if (!this.instance) {
            this.instance = new MacCmd();
        }
        return this.instance;
    }

    openApp(appName: string, callback: CallbackFunction): void {

        let schemeURL = "";
        switch (appName) {
            case constants.fs:
                schemeURL = `-a FeishuRooms.app`;
                break;
            case constants.zr:
                schemeURL = `zoomroom://`;
                break;
            case constants.tx:
                schemeURL = `-a TencentMeetingRooms.app`;
                break;
            default:
                throw new Error(`启动程序出错，找不到该进程 ${appName}`);
        }

        exec(`open ${schemeURL}`, (err) => {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    killApp(appName: string): void {
        let processName = "";
        switch (appName) {
            case constants.fs:
                processName = `FeishuRooms`;
                break;
            case constants.zr:
                processName = `ZoomPresence`;
                break;
            case constants.tx:
                processName = `TencentMeetingRooms`;
                break;
            default:
                throw new Error(`结束程序出错，找不到该进程 ${appName}`);
        }

        exec(`killall ${processName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`结束程序出错 ${processName}: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`结束程序出错: ${processName} ${stderr}`);
                return;
            }
            console.log(`结束程序成功 ${processName} ${stdout}`);
        });
    }

}
