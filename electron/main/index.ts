import { app, BrowserWindow, shell, ipcMain, Menu } from "electron";
import path from "node:path";
import { join } from "path";
import os from "node:os";
import { is } from "@electron-toolkit/utils";
import { config, constants } from "./config.js";
import { getDeviceId } from "./deviceIdUtil.js";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { handleCommand } from "./command.js";
import { isLicenseExpired } from "./dataUtils.js";
import store from "./store.js";
import getLicenseInfo from "./decrypt.js";
import unloadZoomDeamon, { execKillDaemonShell } from "./unload_zoom.js";
import { checkPort } from "./checkPort.js";

// const require = createRequire(import.meta.url);
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

// export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist/renderer");
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

let win: BrowserWindow;

// Create the HTTP server
const httpServer = createServer();
const io = new Server(httpServer, {
  /* options */
});

async function createWindow() {
  win = new BrowserWindow({
    width: config.width,
    height: config.height,
    alwaysOnTop: config.alwaysOnTop,
    x: 1180,
    y: 10,
    title: config.appName,
    icon: path.join(__dirname, "../assets/icons/app.icns"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: true,
      sandbox: false,
      // sandbox: false, //

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  // if (VITE_DEV_SERVER_URL) {
  //   win.loadURL(VITE_DEV_SERVER_URL);
  //   if (config.openDevTools) {
  //     win.webContents.openDevTools();
  //   }
  // } else {
  //   console.log("加载render进程");
  //   win.loadFile(indexHtml);
  // }
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, path.join(RENDERER_DIST, "index.html")));
  }

  // Load the local URL for development or the local
  // html file for production
  // if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
  //   win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  // } else {
  //   win.loadFile(path.join(__dirname, "../renderer/index.html"));
  // }

  // 渲染页面完成
  win.webContents.on("did-finish-load", () => {
    // 获取设备序列号
    getDeviceId((deviceId) => {
      if (deviceId) {
        console.log("设备序列号:", deviceId);
        // 保存序列号
        store.set(constants.deviceId, deviceId);
      } else {
        console.error("获取设备序列号失败");
      }
      // 获取本地保存的激活码
      var localActiveCode: string = store.get(constants.activeCode, "");
      // 发送序列号
      win?.webContents.send(
        "main-process-getDeviceId",
        deviceId,
        localActiveCode
      );
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

  // 检查端口并处理
  checkPort(config.port, (isUsed) => {
    if (isUsed) {
      // 端口占用 -- kill 掉重启 -- 后面再实现
    } else {
      // 端口未占用 -- 启动服务
      httpServer.listen(config.port, () => {
        console.log("服务正在运行 http://localhost:" + config.port);
      });
    }
    // 发送render进程 -- 告知服务已经连接
    const data = {
      ipAddr: ipAddr,
      expireDate: config.exipreDate,
    };
    event.sender.send("socket-server-connected", data);
  });
});

// 处理修复ZR操作
ipcMain.handle(
  "execute-unload-zoom-daemon",
  async (_event, password: string) => {
    const result = await unloadZoomDeamon(password);
    console.log("修复zoom进程 -- 执行结果: ", result);
    // 执行脚本
    execKillDaemonShell(password);
    return result;
  }
);

// 拉起roomAPP
// 场景: 页面初始化成功 - 读取默认配置 -- 拉起APP
ipcMain.handle("launch-room-app", (_event, ...args) => {
  // // 如果配置为true,则启动就会拉起 args[0] - fs,zr,tx之间的一个
  // _event.preventDefault();
  // win?.hide();
  // createTray();
  if (config.launchDefaultRoom) {
    handleCommand(args[0], null);
    console.log("[拉起默认会议室]", args[0]);
    return;
  }
});

// 设置默认启动的RoomAPP
// 只有一个触发场景: 用户界面选择保存的时候触发
ipcMain.handle("set-default-room", (_event, ...args) => {
  store.set(constants.defaultRoomKey, args[0]);
  console.log("[修改默认会议室]", args[0]);
});

// 获取默认启动的RoomAPP
// 触发场景1: 程序启动后页面下拉框初始化时触发 || 触发场景2: 程序启动拉起默认的RoomAPP时触发
ipcMain.handle("get-default-room", (_event) => {
  // 读取store的默认值
  var defaultRoom: string = store.get(constants.defaultRoomKey);
  if (!defaultRoom) {
    // 第一次store里是没有值的，需要读取config.js配置的默认值
    defaultRoom = config.defaultRoom;
    store.set(constants.defaultRoomKey, config.defaultRoom);
  }
  return defaultRoom;
});

// 请求验证激活码
ipcMain.on("socket-client-request-activeCode", (_event, ...args) => {
  console.log("主进程收到验证授权请求 -- 序列号验证", args[0]);
  // 执行验证流程 C++ nodeWrapper
  // 获取授权信息
  const licenseInfo: string[] = getLicenseInfo(args[0]);
  if (licenseInfo.length != 2) {
    // 授权码不正确
    const result = {
      status: false,
      reason: "授权码不正确",
    };
    _event.sender.send("socket-server-auth-result", result);
    return;
  }
  ////
  const localDeviceId = store.get(constants.deviceId);
  if (localDeviceId != licenseInfo[0]) {
    // 非本机授权码
    const result = {
      status: false,
      reason: "非本机授权码",
    };
    console.log("本机序列号", localDeviceId, licenseInfo[0]);
    _event.sender.send("socket-server-auth-result", result);
    return;
  }
  ////
  const expirationDateStr: string = licenseInfo[1];
  const isExpired: boolean = isLicenseExpired(expirationDateStr);

  config.exipreDate = expirationDateStr;
  if (isExpired) {
    // 授权码过期
    const result = {
      status: false,
      reason: "授权过期:" + expirationDateStr,
    };
    _event.sender.send("socket-server-auth-result", result);
    return;
  }
  // 授权码验证通过✅
  store.set(constants.activeCode, args[0]); // 保存设备激活码
  _event.sender.send("socket-server-auth-result", { status: true, reason: "" });
});

app.on("ready", () => {
  // 检查开机自启动设置
  console.log("开机自动启动");
  app.setLoginItemSettings({
    openAtLogin: true, // 默认设置开机自启动
  });
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
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
