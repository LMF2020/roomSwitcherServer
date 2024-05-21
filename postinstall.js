import { app } from 'electron';
import { set } from 'electron-settings';

app.on('ready', () => {
  // 默认设置开机自启动
  set('autoLaunch', true);

  app.setLoginItemSettings({
    openAtLogin: true,
  });
});