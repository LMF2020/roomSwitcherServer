<template>
    <div class="min-h-screen flex flex-col items-center">
        <div class="flex items-start bg-white shadow p-5 rounded-lg w-full max-w-md">
            {{ osType === 'darwin' ? '关闭Zoom自启动' : '飞书/腾讯自启动' }}
            <el-button class="ml-auto" type="primary" @click="showDialog">禁用</el-button>
        </div>
        <div class="flex items-start bg-white shadow p-5 rounded-lg w-full max-w-md">
            <span class="mr-2 text-gray-700">默认会议室</span>
            <span class="mr-2 text-white bg-blue-500 p-1 rounded">{{ defaultDisplayRoom }}</span>
            <el-button class="ml-auto" type="primary" @click="showChangeRoomDialog">修改</el-button>
        </div>
        <!-- 激活新授权 -->
        <div class="flex items-start bg-white shadow p-5 rounded-lg w-full max-w-md">
            <span class="mr-2 text-gray-700">激活新授权</span>
            <el-button class="ml-auto" type="primary" @click="showActivateDialog">激活</el-button>
        </div>
        <div class="text-sm text-gray-500 mt-2">
            重启应用后生效
        </div>

        <!-- 管理员密码对话框 -->
        <el-dialog v-model="isDialogVisible" :title="osType === 'darwin' ? '请输入管理员密码' : '请确认修复'">
            <div class="mt-4" v-if="osType === 'darwin'">
                <el-input v-model="adminPassword" type="password" placeholder="请输入管理员密码" show-password class="w-full" />
            </div>
            <div class="mt-6 flex justify-center">
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="confirm">确认</el-button>
            </div>
        </el-dialog>

        <!-- 修改会议室对话框 -->
        <el-dialog v-model="isChangeRoomDialogVisible" title="修改默认会议室">
            <div class="mt-4">
                <el-select v-model="selectedRoom" placeholder="请选择会议室" class="w-full">
                    <el-option label="飞书" value="fs"></el-option>
                    <el-option label="腾讯" value="tx"></el-option>
                    <el-option label="Zoom" value="zr"></el-option>
                    <el-option label="未设置" value="none"></el-option>
                </el-select>
            </div>
            <div class="mt-6 flex justify-center">
                <el-button @click="cancelChangeRoom">取消</el-button>
                <el-button type="primary" @click="confirmChangeRoom">确认</el-button>
            </div>
        </el-dialog>

        <!-- 激活新授权对话框 -->
        <el-dialog v-model="isActivateDialogVisible" title="激活新授权">
            <div class="mt-4">
                <el-input v-model="licenseKey" placeholder="请输入新的授权码" type="textarea" :rows="7" resize="none"
                    class="w-full" />
            </div>
            <div class="mt-6 flex justify-center">
                <el-button @click="cancelActivate">取消</el-button>
                <el-button type="primary" @click="confirmActivate">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getCommandByRoom, getRoomDisplayName } from '../types/data'

const defaultDisplayRoom = ref("未设置");
const osType = ref('');
const adminPassword = ref('')

// ======= 修复zoom问题开始 ====== 
const isDialogVisible = ref(false)
const showDialog = () => {
    isDialogVisible.value = true
}
const cancel = () => {
    isDialogVisible.value = false
}
// 修复Zoom、飞书自启动
const confirm = async () => {
    try {
        const result = await window.ipcRenderer.execUnloadZoomDaemon(adminPassword.value)
        if (result == 0 || result == -1) {
            ElMessage.success('操作成功')
        } else if (result == -2) {
            // 文件不存在
            throw new Error('无需修复')
        } else {
            throw new Error('操作失败: ' + result)
        }
    } catch (error) {
        ElMessage.error(error.message)
    } finally {
        isDialogVisible.value = false
        adminPassword.value = ''
    }
}
// ======= 修复zoom问题结束 ====== 

// ======= 修改默认会议室开始 ====== 
const isChangeRoomDialogVisible = ref(false);
const selectedRoom = ref('fs'); // 初始值为fs
const showChangeRoomDialog = () => {
    isChangeRoomDialogVisible.value = true;
};

const cancelChangeRoom = () => {
    isChangeRoomDialogVisible.value = false;
};

const confirmChangeRoom = () => {
    // 修改会议室确认逻辑
    defaultDisplayRoom.value = getRoomDisplayName(selectedRoom.value);
    // 调用主进程 -- 保存本地
    window.ipcRenderer.setDefaultRoom(selectedRoom.value)
    isChangeRoomDialogVisible.value = false;
};

// ======= 修改默认会议室结束 ====== 

// ======= 激活新授权开始 ====== 
const isActivateDialogVisible = ref(false);
const licenseKey = ref('');

const showActivateDialog = () => {
    isActivateDialogVisible.value = true;
};
const cancelActivate = () => {
    isActivateDialogVisible.value = false;
};
const confirmActivate = () => {
    if (!licenseKey.value) {
        ElMessage.error('激活码不能为空')
        return
    }
    checkLicense();
    isActivateDialogVisible.value = false;
};

// 发起请求 --> 验证授权码
const checkLicense = () => {
    window.ipcRenderer.send('socket-client-request-activeCode', licenseKey.value);
}

// ======= 激活新授权结束 ====== 


onMounted(() => {
    // 调用主进程 -- 读取local storage的默认会议室
    window.ipcRenderer.getDefaultRoom()
        .then(room => {
            defaultDisplayRoom.value = getRoomDisplayName(room);
            console.log("读取store的默认会议室", room)
            const command = getCommandByRoom(room); // 获取命令
            // 拉起默认的Room APP
            window.ipcRenderer.launchRoomAPP(command)
        })
        .catch(error => {
            console.error('读取store的默认会议室 -- 失败:', error);
            defaultDisplayRoom.value = "配置读取失败"
        });

        window.ipcRenderer.getOsType()
        .then(os => {
            osType.value = os;
        })

})

</script>

<style scoped>
.p-4 {
    padding: 1rem;
}

.mt-4 {
    margin-top: 1rem;
}

.flex {
    display: flex;
    align-items: center;
}

.mr-2 {
    margin-right: 0.5rem;
}
</style>