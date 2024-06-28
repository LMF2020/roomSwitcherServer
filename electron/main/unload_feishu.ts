import log from "electron-log/main.js";
const sudo = require('sudo-prompt');

// net stop FeishuRooms-service
// sc config FeishuRooms-service start= demand
// net stop TMRToolsService
// sc config TMRToolsService start= demand

const options = {
    name: 'NodeScript',
    windowsHide: true
};

const FeishuSrviceName = 'FeishuRooms-service';
const TencentSrviceName = 'TMRToolsService';

// Function to stop a service and set its startup type to demand (manual)
function stopAndSetManual(serviceName: string) {
    return new Promise((resolve, _reject) => {
        sudo.exec(`net stop ${serviceName}`, options, (error, stdout, stderr) => {
            if (error) {
                log.error(`停止服务 ${serviceName} 出错: ${error.message}`);
                resolve(-1);
            } else if (stderr) {
                log.error(`停止服务 ${serviceName} 出错: ${stderr}`);
                resolve(-1);
            } else {
                log.debug(`停止服务 ${serviceName} 成功: ${stdout}`);
                // Set service startup type to manual
                sudo.exec(`sc config ${serviceName} start= demand`, options, (error, stdout, stderr) => {
                    if (error) {
                        log.error(`设置服务 ${serviceName} 启动类型出错: ${error.message}`);
                        resolve(-1);
                    } else if (stderr) {
                        log.error(`设置服务 ${serviceName} 启动类型出错: ${stderr}`);
                        resolve(-1);
                    } else {
                        log.debug(`设置服务 ${serviceName} 启动类型成功: ${stdout}`);
                        resolve(0);
                    }
                });
            }
        });
    });
}

// Main function to sequentially stop both services
export default async function stopServices(_sudoPassword: string) {
    try {
        // Stop and set manual for FeishuRooms-service
        const resultFeishu = await stopAndSetManual(FeishuSrviceName);
        if (resultFeishu === -1) {
            log.error(`无法停止或设置服务 ${FeishuSrviceName}`);
            // return -1; // or handle error as needed
        }

        // Stop and set manual for TMRToolsService
        const resultTencent = await stopAndSetManual(TencentSrviceName);
        if (resultTencent === -1) {
            log.error(`无法停止或设置服务 ${TencentSrviceName}`);
            return -1; // or handle error as needed
        }

        // Both services stopped and set to manual successfully
        return 0; // or handle success as needed
    } catch (error) {
        log.error(`停止服务时出错: ${error}`);
        return -1; // or handle error as needed
    }
}