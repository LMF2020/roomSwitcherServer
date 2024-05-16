import { exec } from 'child_process';
import { promisify } from 'util';
import machineId from 'node-machine-id';

const execPromise = promisify(exec);

// 获取设备唯一标识符的函数
export function getDeviceId(callback: (deviceId: string | null) => void): void {
    const deviceId: string = machineId.machineIdSync(true);
    if (deviceId && deviceId.trim() !== '') {
        callback(deviceId);
        return;
    }
    if (process.platform === 'darwin') {
        // macOS
        getMacDeviceId(callback);
    } else {
        // 其他操作系统，暂时返回 null
        console.error('Unsupported platform:', process.platform);
        callback(null);
    }
}

// 获取 macOS 设备唯一标识符
function getMacDeviceId(callback: (deviceId: string | null) => void): void {
    execPromise('system_profiler SPHardwareDataType')
        .then(({ stdout }) => {
            const match = stdout.match(/Serial Number\s*:\s*(\S+)/);
            if (match && match[1]) {
                callback(match[1]);
            } else {
                console.error('Error parsing device information');
                callback(null);
            }
        })
        .catch((err) => {
            console.error('Error executing system_profiler:', err);
            callback(null);
        });
}