// FeishuRooms-service.exe

require('child_process');
import log from "electron-log/main.js";

const sudo = require('sudo-prompt');
const serviceName = 'FeishuRooms-service';

const options = {
    name: 'NodeScript'
};

// 卸载飞书守护服务
export default function unloadFeishuDeamon(_sudoPassword: string) {
    // unload 守护进程
    return new Promise((resolve, _reject) => {
        // 停止服务
        sudo.exec(`net stop ${serviceName}`, options, (error, stdout, stderr) => {
            if (error) {
                // console.error(`停止服务时出错: ${error.message}`);
                log.error(`停止飞书服务出错(1): ${error.message}`);
                return resolve(-1);
            }

            if (stderr) {
                log.error(`停止飞书服务出错(2): ${stderr}`);
                // console.error(`错误输出: ${stderr}`);
                return resolve(-1);;
            }

            // console.log(`服务停止成功: ${stdout}`);
            log.debug(`停止飞书服务成功: ${stdout}`);


            // 设置服务启动类型为手动
            sudo.exec(`sc config ${serviceName} start= demand`, options, (error, stdout, stderr) => {
                if (error) {
                    // console.error(`设置服务启动类型时出错: ${error.message}`);
                    log.error(`设置飞书启动服务类型出错(1): ${error.message}`);
                    return resolve(-1);;
                }

                if (stderr) {
                    // console.error(`错误输出: ${stderr}`);
                    log.error(`设置飞书启动服务类型出错(2): ${stderr}`);
                    return resolve(-1);
                }

                // console.log(`服务启动类型设置为手动成功: ${stdout}`);
                log.debug(`设置飞书启动服务类型成功: ${stdout}`);

            });
        })

    });
}