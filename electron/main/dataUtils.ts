export function isLicenseExpired(expirationDateStr: string): boolean {
  if (!expirationDateStr || expirationDateStr == "") {
    console.log("过期时间异常，请检查授权码流程");
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
