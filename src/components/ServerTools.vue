<template>
    <div class="p-6 min-h-screen flex flex-col items-center">
        <div class="flex items-center bg-white shadow p-4 rounded-lg w-full max-w-md">
            <span class="mr-4 text-gray-700">关闭zoom自启动</span>
            <el-button type="primary" @click="showDialog">修复</el-button>
        </div>

        <el-dialog v-model="isDialogVisible" title="输入管理员密码">
            <div class="mt-4">
                <el-input v-model="adminPassword" type="password" placeholder="请输入管理员密码" show-password class="w-full" />
            </div>
            <div class="mt-6 flex justify-center">
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="confirm">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';

const isDialogVisible = ref(false)
const adminPassword = ref('')
const router = useRouter();

const showDialog = () => {
    isDialogVisible.value = true
}

const confirm = async () => {
    try {
        const result = await window.ipcRenderer.execUnloadZoomDaemon(adminPassword.value)
        if (result == 0 || result == -1) {
            ElMessage.success('操作成功')
        } else if (result == -2) {
            throw new Error('文件不存在，无需修复')
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

const cancel = () => {
    isDialogVisible.value = false
}

// 切换到status页面
const goToStatusPage = () => {
    router.push({ name: 'status' });
};

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