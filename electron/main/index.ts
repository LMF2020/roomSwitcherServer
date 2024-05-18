import { app, BrowserWindow, shell, ipcMain, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { config } from "./config.js";
import { getDeviceId } from "./deviceIdUtil.js";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { handleCommand } from "./command.js";
import { isLicenseExpired } from "./dataUtils.js";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

// Create the HTTP server
const httpServer = createServer();
const io = new Server(httpServer, {
  /* options */
});

async function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 400,
    alwaysOnTop: true,
    x: 1350,
    y: 10,
    title: config.appName,
    icon: path.join(__dirname, "../assets/icons/app.icns"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    if (config.openDevTools) {
      win.webContents.openDevTools();
    }
  } else {
    win.loadFile(indexHtml);
  }

  // 渲染页面完成
  win.webContents.on("did-finish-load", () => {
    // 获取设备序列号
    getDeviceId((deviceId) => {
      if (deviceId) {
        console.log("设备序列号:", deviceId);
      } else {
        console.error("获取设备序列号失败");
      }
      // 发送序列号
      win?.webContents.send("main-process-getDeviceId", deviceId);
    });
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  // 保存客户端连接信息
  let connectedClients: string[] = [];

  // 监听客户端socket连接
  io.on("connection", (socket: Socket) => {
    console.log("客户端已连接:", socket.id);
    connectedClients.push(socket.id);

    // 发送客户端连接信息到渲染进程
    win.webContents.send("client-connected", {
      clientId: socket.id,
      clientAddr: socket.handshake.address,
    });

    // 监听客户端消息
    socket.on("command", (message: string) => {
      console.log("收到客户端消息:", message);
      // 处理客户端消息...
      handleCommand(message, socket);
    });

    // 监听客户端断开连接
    socket.on("disconnect", () => {
      console.log("客户端已断开:", socket.id);
      // 更新客户端连接信息
      connectedClients = connectedClients.filter((id) => id !== socket.id);
      // 发送客户端断开连接信息到渲染进程
      win.webContents.send("client-disconnected", socket.id);
    });
  });
}

// 授权码验证通过✅, 开始监听端口
ipcMain.on("start-socket-server", (event) => {
  var ipAddr = require("ip").address() + ":" + config.port;
  console.log("主进程监听:", ipAddr);
  httpServer.listen(config.port, () => {
    console.log("服务正在运行 http://localhost:" + config.port);
  });
  const data = {
    ipAddr: ipAddr,
    expireDate: config.exipreDate,
  };
  event.sender.send("socket-server-connected", data);
});

// 请求验证激活码
ipcMain.on("socket-client-request-activeCode", (event) => {
  console.log("主进程收到验证授权请求 -- 执行验证流程");
  // 执行验证流程 C++ nodeWrapper
  // 2024-06-10
  const expirationDateStr: string = "2024-06-10";
  const isExpired: boolean = isLicenseExpired(expirationDateStr);
  const result = {
    status: true,
    reason: "",
  };
  // 缓存到期时间
  config.exipreDate = expirationDateStr;
  if (isExpired) {
    result.status = false;
    result.reason = "授权到期时间:" + expirationDateStr;
  }
  event.sender.send("socket-server-auth-result", result);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
//   } else {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   }
// })