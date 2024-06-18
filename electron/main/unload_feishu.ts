// FeishuRooms-service.exe

require('child_process');
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
                console.error(`停止服务时出错: ${error.message}`);
                return resolve(-1);
            }

            if (stderr) {
                console.error(`错误输出: ${stderr}`);
                return resolve(-1);;
            }

            console.log(`服务停止成功: ${stdout}`);

            // 设置服务启动类型为手动
            sudo.exec(`sc config ${serviceName} start= demand`, options, (error, stdout, stderr) => {
                if (error) {
                    console.error(`设置服务启动类型时出错: ${error.message}`);
                    return resolve(-1);;
                }

                if (stderr) {
                    console.error(`错误输出: ${stderr}`);
                    return resolve(-1);
                }

                console.log(`服务启动类型设置为手动成功: ${stdout}`);
            });
        })

    });
}