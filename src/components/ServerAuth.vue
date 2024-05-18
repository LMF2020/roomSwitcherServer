<template>
  <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
    class="demo-ruleForm" :size="formSize" status-icon>
    <el-form-item label="" prop="deviceCode">
      <div class="flex items-center space-x-1">
        <el-input v-model="ruleForm.deviceCode" :readonly="true" />
        <el-button type="primary" @click="copyToDeviceCode(ruleFormRef)">拷贝设备序列号</el-button>
      </div>
    </el-form-item>
    <el-form-item label="激活码:" prop="activeCode" class="special">
      <el-input v-model="ruleForm.activeCode" type="textarea" :rows="7" resize="none" />
    </el-form-item>
    <div class="flex justify-center space-x-4">
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          激活
        </el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router';
import { ElNotification, type ComponentSize, type FormInstance, type FormRules } from 'element-plus'
import { useStore } from '../store/index';
import { AuthResult, ServerInfo } from '../types/data';

interface RuleForm {
  deviceCode: string,
  activeCode: string
}
const store = useStore();
const router = useRouter();
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  deviceCode: '-------------------------',
  activeCode: '',
})

const rules = reactive<FormRules<RuleForm>>({
  deviceCode: [
    { required: true, message: '请生成设备序列号', trigger: 'blur' },
  ],
  activeCode: [
    { required: true, message: '请输入激活码', trigger: 'blur' },
  ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      checkLicense();
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 发起请求 --> 验证授权码
const checkLicense = () => {
  window.ipcRenderer.send('socket-client-request-activeCode');
}

// 重置
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  ruleForm.activeCode = "";
}

// 拷贝序列号到剪贴板
const copyToDeviceCode = (formEl: FormInstance | undefined) => {
  if (ruleForm.deviceCode) {
    navigator.clipboard.writeText(ruleForm.deviceCode)
      .then(() => {
        // this.$message.success('设备序列号已复制到剪贴板');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        // this.$message.error('复制到剪贴板时出错');
      });
  } else {
    // this.$message.warning('设备序列号为空');
  }
}

const error = (message: string) => {
  ElNotification({
    title: '提示🔔',
    message: message,
    type: 'error',
  })
}

// 切换到status页面
const goToStatusPage = (data: ServerInfo) => {
  store.commit('setServerInfo', data)
  router.push({ name: 'status' });
};

onMounted(() => {
  window.ipcRenderer.on('main-process-getDeviceId', (_event, ...args) => {
    console.log('[获取主进程设备序列号]:', ...args)
    ruleForm.deviceCode = args[0];
  })

  window.ipcRenderer.on('socket-server-connected', (_event, ...args) => {
    console.log('[收到主进程回复 --> 切换到status页面]:', args[0])
    goToStatusPage(args[0] as ServerInfo);
  })

  window.ipcRenderer.on('socket-server-auth-result', (_event, ...args) => {
    console.log('[收到主进程回复 --> 授权码验证结果 --> 通知主进程启动socket服务]:', args[0])
    const result: AuthResult = args[0] as AuthResult;
    if (result.status == true) { // true说明授权状态正常
      window.ipcRenderer.send('start-socket-server')
    } else {
      // 验证失败
      error('授权验证失败,' + result.reason);
    }
  })
})
</script>

<style lang="scss">
.special {
  .el-form-item__label {
    color: #409eff;
    font-size: medium;
    font-weight: bold;
  }
}
</style>