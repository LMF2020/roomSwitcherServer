import { exec } from "child_process";
import { Socket } from "socket.io";
import store from "./store.js";

export const commandConfig = {
  open_zr: "cmd_open_zr",
  open_tx: "cmd_open_tx",
  open_fs: "cmd_open_fs",
  query_curr: "cmd_query_curr",
};
export const CURRENT_RM_KEY = "currentRoomKey";
export const commandResult = {
  fail: "fail",
  ok: "ok",
  zr: "zr",
  fs: "fs",
  tx: "tx",
  unknown: "none",
};

export function handleCommand(command: string, socket: Socket) {
  beforeHandleCommand(command);
  if (command == commandConfig.open_zr) {
    // 打开zoom
    launchZoomRooms(socket);
  }
  if (command == commandConfig.open_tx) {
    // 打开腾讯
    launchTencentRooms(socket);
  }
  if (command == commandConfig.open_fs) {
    // 打开飞书
    launchFeishuRooms(socket);
  }
  if (command == commandConfig.query_curr) {
    // 查询当前room
    var roomName: string = store.get(CURRENT_RM_KEY) || commandResult.unknown;
    socket.emit("command", {
      command: commandConfig.query_curr,
      result: roomName,
    });
    console.log("返回客户端消息:", roomName);
  }
}

// 处理前置任务
function beforeHandleCommand(command: string): void {
  if (
    command != commandConfig.open_zr &&
    command != commandConfig.open_tx &&
    command != commandConfig.open_fs
  ) {
    return;
  }
  // 1）不能结束正在执行的进程,
  // 2）不能结束值为none的进程
  // TODO: 如果有方法能判断出当前执行的进程就好了，而不是通过保存的变量去判断，会更准确且减少bug
  var running_process: string = store.get(CURRENT_RM_KEY) || "none";
  if (running_process == "none" || command.includes(running_process)) {
    return;
  }
  // 结束当前进程
  if (running_process == commandResult.fs) {
    killAllProcess("FeishuRooms");
  }
  if (running_process == commandResult.tx) {
    killAllProcess("TencentMeetingRooms");
  }
  if (running_process == commandResult.zr) {
    killAllProcess("ZoomPresence");
  }
}

function killAllProcess(processName: string): void {
  exec(`killall ${processName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`结束进程失败 ${processName}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`结束进程失败原因: ${stderr}`);
      return;
    }
    console.log(`已结束进程: ${processName} ${stdout}`);
  });
}

// 返回socket消息
// 触发场景1: 客户端发消息过来会带socket，触发场景2: 程序启动默认拉起的时候不会带socket
function replySocket(socket: Socket, command: string, result: string): void {
  if (socket) {
    socket.emit("command", {
      command: command,
      result: result,
    });
  }
}

// 只有zoomrooms用schema拉起
function launchZoomRooms(socket: Socket): void {
  const zoomUrl = `zoomroom://`;
  exec(`open "${zoomUrl}"`, (err) => {
    if (err) {
      console.error("拉起Zoom失败", err);
      replySocket(socket, commandConfig.open_zr, commandResult.fail);
    } else {
      console.log("拉起Zoom成功, 返回客户端消息", commandResult.zr);
      replySocket(socket, commandConfig.open_zr, commandResult.ok);
      // 保存当前room
      store.set(CURRENT_RM_KEY, commandResult.zr);
    }
  });
}

function launchTencentRooms(socket: Socket): void {
  const tencentUrl = `-a TencentMeetingRooms.app`;
  exec(`open ${tencentUrl}`, (err) => {
    if (err) {
      console.error("拉起腾讯rooms失败", err);
      replySocket(socket, commandConfig.open_tx, commandResult.fail);
    } else {
      console.log("拉起腾讯rooms成功, 返回客户端消息", commandResult.tx);
      replySocket(socket, commandConfig.open_tx, commandResult.ok);
      // 保存当前room
      store.set(CURRENT_RM_KEY, commandResult.tx);
    }
  });
}

function launchFeishuRooms(socket: Socket): void {
  const feishuUrl = `-a FeishuRooms.app`;
  exec(`open ${feishuUrl}`, (err) => {
    if (err) {
      console.error("拉起飞书rooms失败", err);
      replySocket(socket, commandConfig.open_fs, commandResult.fail);
    } else {
      console.log("拉起飞书rooms成功, 返回客户端消息", commandResult.fs);
      replySocket(socket, commandConfig.open_fs, commandResult.ok);
      // 保存当前room
      store.set(CURRENT_RM_KEY, commandResult.fs);
    }
  });
}
