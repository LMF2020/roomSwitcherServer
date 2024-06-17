import { Socket } from "socket.io";
import store from "./store.js";
import { config, constants } from "./config.js";
import { ICmdFactory } from "./module/ICmdFactory.js";
import { ICmdService } from "./module/ICmd.js";

export const commandConfig = {
  open_zr: "cmd_open_zr",
  open_tx: "cmd_open_tx",
  open_fs: "cmd_open_fs",
  query_curr: "cmd_query_curr",
  query_expire_date: "cmd_query_expire_date",
  login: "login",
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

// 初始化
const ICmd: ICmdService = ICmdFactory.getCmdByOS();

export function handleCommand(command: string, socket: Socket | null) {
  beforeHandleCommand(command);
  if (command == commandConfig.open_zr) {
    // 打开zoom
    console.log('开始启动zoom........');
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
  if (command == commandConfig.query_curr && socket != null) {
    // 查询当前room
    var roomName: string = store.get(CURRENT_RM_KEY) || commandResult.unknown;
    socket.emit("command", {
      command: commandConfig.query_curr,
      result: roomName,
    });
    console.log("返回客户端消息:", roomName);
  }
  if (command == commandConfig.query_expire_date && socket != null) {
    // 查询授权有效期
    socket.emit("command", {
      command: commandConfig.query_expire_date,
      result: store.get(commandConfig.query_expire_date),
    });
  }

  ///// login /////
  if (command == commandConfig.login && socket != null) {
    const expireDate = store.get(commandConfig.query_expire_date);
    const currentRoom = store.get(CURRENT_RM_KEY);
    socket.emit("command", {
      command: commandConfig.login,
      result: {
        "curr_room": currentRoom,
        "version": config.version,
        "expire": expireDate + " 23:59:59"
      }
    })

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
  // var running_process: string = store.get(CURRENT_RM_KEY) || "none";
  // if (running_process == "none" || command.includes(running_process)) {
  //   return;
  // }
  // 结束当前进程
  if (command == commandConfig.open_zr) {
    killAllProcesses(constants.fs, constants.tx);
  }
  if (command == commandConfig.open_tx) {
    killAllProcesses(constants.fs, constants.zr);
  }
  if (command == commandConfig.open_fs) {
    killAllProcesses(constants.zr, constants.tx);
  }
}

function killAllProcesses(...appList: string[]): void {
  appList.forEach((app) => {
    ICmd.killApp(app);
  });
}


// 返回socket消息
// 触发场景1: 客户端发消息过来会带socket，触发场景2: 程序启动默认拉起的时候不会带socket
function replySocket(
  socket: Socket | null,
  command: string,
  result: string
): void {
  if (socket) {
    socket.emit("command", {
      command: command,
      result: result,
    });
  }
}


// 启动zoom
function launchZoomRooms(socket: Socket | null): void {
  ICmd.openApp(constants.zr, function (err) {
    if (err) {
      console.error("启动Zoom失败", err);
      replySocket(socket, commandConfig.open_zr, commandResult.fail);
    } else {
      console.log("启动Zoom成功, 返回客户端消息", commandResult.zr);
      replySocket(socket, commandConfig.open_zr, commandResult.ok);
      // 保存当前room
      store.set(CURRENT_RM_KEY, commandResult.zr);
    }
  });
}

// 启动腾讯
function launchTencentRooms(socket: Socket | null): void {
  ICmd.openApp(constants.tx, function(err) {
    if (err) {
      console.error("启动腾讯rooms失败", err);
      replySocket(socket, commandConfig.open_tx, commandResult.fail);
    } else {
      console.log("启动腾讯rooms成功, 返回客户端消息", commandResult.tx);
      replySocket(socket, commandConfig.open_tx, commandResult.ok);
      // 保存当前room
      store.set(CURRENT_RM_KEY, commandResult.tx);
    }
  });
}

// 启动飞书
function launchFeishuRooms(socket: Socket | null): void {
  ICmd.openApp(constants.fs, function(err) {
    if (err) {
      console.error("启动飞书rooms失败", err);
      replySocket(socket, commandConfig.open_fs, commandResult.fail);
    } else {
      console.log("启动飞书rooms成功, 返回客户端消息", commandResult.fs);
      replySocket(socket, commandConfig.open_fs, commandResult.ok);
      // 保存当前room
      store.set(CURRENT_RM_KEY, commandResult.fs);
    }
  });
}
