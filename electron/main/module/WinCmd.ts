import { CallbackFunction, ICmdService } from "./ICmd.js";
import { exec, spawn } from "child_process";
import { constants } from "../config.js";
import log from "electron-log/main.js";

/// 拉起windows端app
export class WinCmd implements ICmdService {

    private static instance: WinCmd;

    private constructor() {}

    public static getInstance(): WinCmd {
        if (!this.instance) {
            this.instance = new WinCmd();
        }
        return this.instance;
    }

    // 结束进程
    public killApp(appName: string, callback: CallbackFunction): void {
        let appProcessName = "";
        switch (appName) {
            case constants.fs:
                appProcessName = "FeishuRooms.exe";
                break;
            case constants.zr:
                appProcessName = "ZoomRooms.exe";
                break;
            case constants.tx:
                appProcessName = "TencentMeetingRooms.exe";
                break;
            default:
                throw new Error(`结束进程失败，找不到该进程 ${appName}`);
        }

        exec(`taskkill /im "${appProcessName}" /f`, (error, _stdout, stderr) => {
            callback(null);
            if (error) {
                // console.error(`结束程序出错: ${error.message}`);
                log.error(`结束进程失败(1): ${error.message}`);
                return;
            }
            if (stderr) {
                // console.error(`结束程序出错: ${stderr}`);
                log.error(`结束进程失败(2): ${stderr}`);
                return;
            }
            // console.log(`结束程序成功 ${appName}`);
            log.debug(`结束进程成功: ${appName}`);

        });
    }

    // 拉起程序
    public openApp(appName: string, callback: CallbackFunction): void {

        let appPath = "";
        if (appName == constants.fs) {
            appPath = "C:/Program Files/FeishuRooms/FeishuRooms.exe";
            this.__doSpawnOpenAction(appPath, callback);
        } else if (appName == constants.tx) {
            appPath = 'C:/Program Files/Tencent/TencentMeetingRooms/TencentMeetingRooms.exe';
            this.__doOpenAction(appPath, callback);
        } else if (appName == constants.zr) {
            this.__launchZoomRooms(callback);
        }

    }

    private __doOpenAction(appPath: string, callback: CallbackFunction): void {
        const options = {
            windowsHide: true
        };
        exec(`start "" "${appPath}"`, options, (error, _stdout, stderr) => {
            if (error) {
                // console.error(`启动应用程序时出错: ${error.message}`);
                callback(error);
                return;
            }
            if (stderr) {
                // console.error(`应用程序启动错误: ${stderr}`);
                callback(new Error(stderr));
                return;
            }
            callback(null);
        });
    }

    // only for feishu app
    private __doSpawnOpenAction(appPath: string, callback: CallbackFunction): void {
        const args = [];
        const feishuRoomsProcess = spawn(`${appPath}`, args, {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
          });
          
          feishuRoomsProcess.unref();
          
          feishuRoomsProcess.on('error', (err) => {
            console.error('Failed to start FeishuRooms:', err);
            callback(err)
          });
          
          feishuRoomsProcess.on('close', (code) => {
            if (code !== 0) {
              console.error(`FeishuRooms process exited with code ${code}`);
              callback(new Error("ErrorCode:" + code))
            } else {
              console.log('FeishuRooms process exited successfully');
            }
          });
    }


    private __launchZoomRooms(callback: CallbackFunction): void {
        const zoomUrl = `zoomroom://`;
        exec(`start "" "${zoomUrl}"`, (err) => {
            if (err) {
                // console.error("拉起Zoom失败", err);
                callback(err);
            } else {
                callback(null);
            }
        });
    }

}