sudo vim /usr/local/bin/unload_daemon.sh

======================
#!/bin/bash
launchctl unload /Library/LaunchDaemons/com.tencent.wemeetroorm.daemon.plist
launchctl unload /Library/LaunchDaemons/us.zoom.rooms.daemon.plist
======================
sudo vim /Library/LaunchDaemons/com.pairswitcher.unloadroomdaemon.plist

======================

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
======================
sudo launchctl load /Library/LaunchDaemons/com.pairswitcher.unloadroomdaemon

sudo chown root:wheel /Library/LaunchDaemons/com.pairswitcher.unloadroomdaemon