# Rooms switcher

#### 🥳 1.0 协议设计

https://www.showdoc.com.cn/roomswitcher/11176109908791492

#### 1.1 获取设备序列号

一. 加密设计
加密格式：Base64(AES[序列号,,30,,start_timestamp])
加密 key（AES）: 2024rmswitcher

二. 技术实现：vue3 + electron + socketIO // 辅助工具 tailwind + vuex/vue-router

1.  需要两个界面
    1.1. 授权页面：授权成功后，才会开启端口监听
    1.2. 服务器状态页面： 客户端连接后会更新客户端已连接和显示客户端的 IP
2.  创建 socket 服务实例：主进程启动时，创建 socket 实例
    2.1 主进程发送 IPC message 给渲染进程，展示给授权页面
3.  授权：主进程启动时，加载授权页面
    3.1 主进程获取设备序列号 - IPC 通知 - 渲染进程（显示设备序列号）
    3.2 用户点击授权，渲染进程 - IPC 通知 - 主进程验证授权（C++ node wrapper 实现）
    3.3 主进程验证授权成功 -
    3.3.1 主进程开启 3001 端口开始监听客户端连接
    3.3.2 IPC 通知（携带授权信息） - 渲染进程
    3.3.1 渲染进程 - 切换路由 - 服务器状态页（- 展示授权信息，服务器监听的端口信息，客户端连接信息（-- 后续客户端连接才展示 --- ））
4.  客户端连接处理：
    4.1 收到客户端连接后，记录 socket id，客户端 IP -- IPC 通知 -- 渲染进程 （如上 3.3.1 的状态页面展示客户端连接信息）
    4.2 客户端发送请求报文 -- 主进程直接处理指令 （协议如下）
    4.3 协议规范:
    // 控制器 -> PC: 切换命令 -> 执行切换动作
    发送命令：cmd_fs: 切换到 飞书
    发送命令：cmd_tx: 切换到 腾讯

    // 控制器 -> PC: 查询当前进程
    发送命令：qry_current_rooms
    返回报文: {"rooms":"name"} --- 「name: fs,tx，none

    4.3 进程切换:
    4.3.1. open "协议://"

/问题：1.如何实现当前会议室进程的保存？ 2.切换进程是否要 kill 掉当前进程？不 kill 有问题，kill 前需要明确知道运行进程和指令进程是否是同一个

---

授权到期: 2024-06-30
服务器已连接: 127.0.0.1:3001

    -> 客户端 192.168.01.1 已连接/已断开
    -> 客户端 192.168.01.2 已连接/已断开

jed@JeddeMacBook-Pro roomSwitcherServer % ps -ef|grep zoom  
 0 65566 1 0 12:34 上午 ?? 0:00.21 /Library/PrivilegedHelperTools/us.zoom.ZoomRoomsDaemon
501 65726 1 0 12:34 上午 ?? 0:00.02 /Applications/ZoomPresence.app/Contents/Library/LaunchServices/us.zoom.ZoomRoomsXpcServer
501 65813 60364 0 12:37 上午 ttys001 0:00.00 grep zoom
jed@JeddeMacBook-Pro roomSwitcherServer %

待解决问题：

1. 程序图标
2. 程序打包
3. 杀掉进程
4. 授权加密
