import log from "electron-log/main.js";

export function isLicenseExpired(expirationDateStr: string): boolean {
  if (!expirationDateStr || expirationDateStr == "") {
    log.debug(`授权过期，请检查授权码流程 ${expirationDateStr}`);
    return false;
  }
  // 获取当前日期的时间戳
  const currentTimestamp = Date.now();

  // 将给定的授权过期日期转换为时间戳
  const expirationDate = new Date(expirationDateStr);
  const expirationTimestamp = expirationDate.getTime();

  // 比较当前日期和授权过期日期的时间戳
  return currentTimestamp > expirationTimestamp;
}
