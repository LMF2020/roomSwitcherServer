import fs from "fs";
import { exec } from "child_process";
const path = "/Library/LaunchDaemons/us.zoom.rooms.daemon.plist";

// 卸载zoomrooms守护进程 -- macos
export default function unloadZoomDeamon(sudoPassword: string) {
  // unload 守护进程
  return new Promise((resolve, reject) => {
    // 检查文件是否存在
    if (!fs.existsSync(path)) {
      return resolve(-2); // 文件不存在
    }

    const command =
      "launchctl bootout system /Library/LaunchDaemons/us.zoom.rooms.daemon.plist";
    const fullCommand = `echo ${sudoPassword} | sudo -S ${command}`;

    exec(fullCommand, (error, stdout, stderr) => {
      // 执行文件move操作
      killZoomDaemonProcess(sudoPassword);
      if (error) {
        console.error("执行zoom进程修复失败 ", error);
        return resolve(-1); // 执行命令报错
      }
      return resolve(0); // 成功执行bootout命令
    });
  });
}

function killZoomDaemonProcess(sudoPassword: string) {
  const command = `echo ${sudoPassword} | sudo -S mv /Library/PrivilegedHelperTools/us.zoom.ZoomDaemon /Library/PrivilegedHelperTools/us.zoom.ZoomDaemon_Del`;
  exec(command, (error, stdout, stderr) => {
    // 修改Zoom守护进程文件
    if (error) {
      console.error("改名zoom守护进程文件失败", error);
      return;
    }
    console.log("改名zoom守护进程文件成功 ");
  });
}

// 卸载zoomrooms守护进程 -- macos
export function unloadTencentDeamon(sudoPassword: string) {
  // unload 守护进程
  return new Promise((resolve, reject) => {
    // 检查文件是否存在
    if (
      !fs.existsSync(
        "/Library/LaunchDaemons/com.tencent.wemeetrooms.daemon.plist"
      )
    ) {
      return; // 文件不存在
    }
    const command =
      "launchctl bootout system /Library/LaunchDaemons/com.tencent.wemeetrooms.daemon.plist";
    const fullCommand = `echo ${sudoPassword} | sudo -S ${command}`;

    exec(fullCommand, (error, stdout, stderr) => {
      // 执行文件move操作
      killTencentDaemonProcess(sudoPassword);
      if (error) {
        console.error("执行腾讯进程修复失败", error);
        return;
      }
      console.log("执行腾讯进程修复成功");
    });
  });
}
function killTencentDaemonProcess(sudoPassword: string) {
  const command = `echo ${sudoPassword} | sudo -S mv /Applications/TencentMeetingRooms.app/Contents/Frameworks/WeMeetFramework.framework/Versions/Current/Frameworks/WeMeet.framework/Versions/Current/Resources/WeMeetRoomsDaemon /Applications/TencentMeetingRooms.app/Contents/Frameworks/WeMeetFramework.framework/Versions/Current/Frameworks/WeMeet.framework/Versions/Current/Resources/WeMeetRoomsDaemon_Del`;
  exec(command, (error, stdout, stderr) => {
    // 修改腾讯守护进程文件
    if (error) {
      console.error("改名腾讯守护进程文件失败", error);
      return;
    }
    console.log("改名腾讯守护进程文件成功 ");
  });
}

// checkAndBootoutPlist(sudoPassword)
//   .then((result) => {
//     console.log(`Result: ${result}`);
//   })
//   .catch((error) => {
//     console.error(`Error: ${error}`);
//   });
