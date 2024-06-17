#!/bin/bash

# 创建卸载守护进程的脚本
echo "Creating unload_daemon.sh script..."
if [ ! -d "/usr/local/bin" ]; then
    sudo mkdir -p /usr/local/bin
fi
sudo tee /usr/local/bin/unload_daemon.sh > /dev/null << 'EOF'
#!/bin/bash
launchctl bootout /Library/LaunchDaemons/com.tencent.wemeetrooms.daemon.plist || true
launchctl bootout system /Library/LaunchDaemons/us.zoom.rooms.daemon.plist || true
launchctl bootout system /Library/LaunchDaemons/com.byteview.FeishuRooms.daemon.plist || true
EOF

# 赋予执行权限
echo "Setting execute permissions for unload_daemon.sh..."
sudo chmod +x /usr/local/bin/unload_daemon.sh

# 创建 plist 文件
echo "Creating plist file..."
sudo tee /Library/LaunchDaemons/com.pairswitcher.unloadroomdaemon.plist > /dev/null << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pairswitcher.unloadroomdaemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/unload_daemon.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/unloaddaemon.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/unloaddaemon.log</string>
</dict>
</plist>
EOF

# 设置所有者和组
echo "Setting ownership for plist file..."
sudo chown root:wheel /Library/LaunchDaemons/com.pairswitcher.unloadroomdaemon.plist

# 加载新的 LaunchDaemon
echo "Loading the new LaunchDaemon..."
sudo launchctl load /Library/LaunchDaemons/com.pairswitcher.unloadroomdaemon.plist
