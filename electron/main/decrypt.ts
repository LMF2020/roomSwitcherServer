import crypto from "crypto";
import log from "electron-log/main.js";


const pass = "2024rms"; // 密钥
const algorithm = "aes-256-cbc"; // 加密算法
const key = crypto.scryptSync(pass, "salt", 32); // 生成固定的32字节密钥
const iv = Buffer.from("0123456789abcdef0123456789abcdef", "hex"); // 固定的16字节IV

// 解密函数
function decrypt(encrypted: string) {
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    // console.error("解密失败，授权码错误:", error);
    log.error(`授权码错误: ${error}`);
    return "";
  }
}

// 获取授权信息
export default function getLicenseInfo(encrypted: string) {
  if (encrypted === null || encrypted === undefined || encrypted === "") {
    return [];
  }
  // 先解密
  const arg: string = decrypt(encrypted);
  // 再获取授权信息
  if (arg === null || arg === undefined || arg === "") {
    return [];
  }
  return arg.split(",,");
}
