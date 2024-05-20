import fs from "fs";
import { exec } from "child_process";
const path = "/Library/LaunchDaemons/us.zoom.rooms.daemon.plist";

// 卸载zoomrooms守护进程 -- macos
export default function unloadZoomDeamon(sudoPassword: string) {
  return new Promise((resolve, reject) => {
    // 检查文件是否存在
    if (!fs.existsSync(path)) {
      return resolve(-2); // 文件不存在
    }

    const command =
      "launchctl bootout system /Library/LaunchDaemons/us.zoom.rooms.daemon.plist";
    const fullCommand = `echo ${sudoPassword} | sudo -S ${command}`;

    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("执行zoom进程修复报错 -- ", error);
        return resolve(-1); // 执行命令报错
      }
      return resolve(0); // 成功执行bootout命令
    });
  });
}

// checkAndBootoutPlist(sudoPassword)
//   .then((result) => {
//     console.log(`Result: ${result}`);
//   })
//   .catch((error) => {
//     console.error(`Error: ${error}`);
//   });
