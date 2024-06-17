export interface ServerInfo {
  ipAddr: string;
  expireDate: string;
}

export interface ClientInfo {
  clientId: string;
  clientAddr: string;
}

export interface AuthResult {
  status: boolean;
  reason: string;
}

// 定义拉起APP的常量
export const commandConfig = {
  open_zr: "cmd_open_zr",
  open_tx: "cmd_open_tx",
  open_fs: "cmd_open_fs",
};

export const constants = {
  zr: "zr",
  tx: "tx",
  fs: "fs",
  none: "none",
  expireDateKey: "expireDateKey",
};

export function getRoomDisplayName(room: string): string {
  if (room == constants.fs) {
    return "飞书";
  }
  if (room == constants.tx) {
    return "腾讯";
  }
  if (room == constants.zr) {
    return "Zoom";
  }
  if (room == constants.none) {
    return "未设置";
  }
  return "未设置";
}

export function getCommandByRoom(room: string): string {
  if (room == constants.fs) {
    return commandConfig.open_fs;
  }
  if (room == constants.tx) {
    return commandConfig.open_tx;
  }
  if (room == constants.zr) {
    return commandConfig.open_zr;
  }
  return "";
}
