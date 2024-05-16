# Rooms switcher

#### 🥳 1.0 协议
    // 控制器 -> PC: 切换命令 -> 执行切换动作
    发送命令：cmd_zr: 切换到 zr
    发送命令：cmd_fs: 切换到 飞书
    发送命令：cmd_tx: 切换到 腾讯

    // 控制器 -> PC: 查询当前进程
    发送命令：qry_current_rooms 
    返回报文: {"rooms":"name"} --- 「name: zr,fs,tx，none


#### 1.1 获取设备序列号

#### 1.2 激活 -> 加/解密 
    加密格式：Base64(AES[序列号,,plan1,,start_timestamp]) 
    
    aesKey: 2024rmswitcher
    
    plan1:1个月
    plan2:2个月
    plan3:3个月
    plan4:4个月
    .....

#### 2.1. 启websocket 服务
#### 2.2. 切换进程
    1. open "zoommtg://" -- 打开zoom
    2. open "xxxx" // --- 打开飞书
    3. open "xxxx" // --- 打开腾讯
