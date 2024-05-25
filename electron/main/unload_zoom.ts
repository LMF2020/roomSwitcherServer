import fs from "fs";
import { exec } from "child_process";
import * as path from "path";
import remote from "electron";

const zoomPlistPath = "/Library/LaunchDaemons/us.zoom.rooms.daemon.plist";

// 卸载zoomrooms守护进程 -- macos
export default function unloadZoomDeamon(sudoPassword: string) {
  // unload 守护进程
  return new Promise((resolve, reject) => {
    // 检查文件是否存在
    if (!fs.existsSync(zoomPlistPath)) {
      return resolve(-2); // 文件不存在
    }

    const command =
      "launchctl bootout system /Library/LaunchDaemons/us.zoom.rooms.daemon.plist";
    const fullCommand = `echo ${sudoPassword} | sudo -S ${command}`;

    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("执行zoom进程修复失败 ", error);
        return resolve(-1); // 执行命令报错
      }
      return resolve(0); // 成功执行bootout命令
    });
  });
}

// 创建room switcher 的守护进程脚本
export function execKillDaemonShell(sudoPassword: string) {
  const unloadDaemonPath = "/usr/local/bin/unload_daemon.sh";
  const appPath = remote.app.getAppPath();
  const scriptPath = path.join(appPath, "setup_unload_daemon.sh");

  const command = "sh " + scriptPath;
  const fullCommand = `echo ${sudoPassword} | sudo -S ${command}`;

  if (!fs.existsSync(unloadDaemonPath)) {
    return new Promise((resolve, reject) => {
      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          reject(`添加switch守护进程文件失败: ${stderr}`);
        } else {
          console.log("添加switch守护进程文件成功");
          resolve(stdout);
        }
      });
    });
  } else {
    return "unload_daemon.sh exists. No action taken.";
  }
}
