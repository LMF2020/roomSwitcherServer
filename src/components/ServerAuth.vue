<template>
  <el-image :src="imageUrl" class="mx-auto mb-4" style="width: 80px; height: 80px;" />
  <el-form ref="ruleFormRef" class="form-container" :model="ruleForm" :rules="rules" label-width="100px"
    :size="formSize" status-icon>
    <el-form-item label="设备序列号" prop="deviceCode">
      <div class="flex items-center space-x-4">
        <el-input v-model="ruleForm.deviceCode" :readonly="true" class="flex-1" />
        <el-button type="primary" @click="copyToDeviceCode(ruleFormRef)" class="flex items-center px-4 py-2">
          <i class="el-icon-document"></i>
          <span class="ml-2">拷贝</span>
        </el-button>
      </div>
    </el-form-item>
    <el-form-item label="激活码" prop="activeCode" class="special">
      <el-input v-model="ruleForm.activeCode" type="textarea" :rows="7" resize="none" class="w-full" />
    </el-form-item>
    <div class="flex justify-center">
      <el-button type="primary" @click="submitForm(ruleFormRef)" class="px-4 py-2">
        <i class="el-icon-check"></i>
        <span class="ml-2">激活</span>
      </el-button>
      <el-button @click="resetForm(ruleFormRef)" class="px-4 py-2">
        <i class="el-icon-refresh"></i>
        <span class="ml-2">重置</span>
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router';
import { ElMessage, ElNotification, type ComponentSize, type FormInstance, type FormRules } from 'element-plus'
import { useStore } from '../store/index';
import { AuthResult, ServerInfo } from '../types/data';
import imageUrl from "../assets/logo.png";
interface RuleForm {
  deviceCode: string,
  activeCode: string
}
const store = useStore();
const router = useRouter();
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  deviceCode: '未获取设备序列号',
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
  window.ipcRenderer.send('socket-client-request-activeCode', ruleForm.activeCode);
}

// 重置
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  ruleForm.activeCode = "";
}

// 拷贝序列号到剪贴板
const copyToDeviceCode = (_formEl: FormInstance | undefined) => {
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
const goToMainPage = (data: ServerInfo) => {
  store.commit('setServerInfo', data);
  router.push({ name: 'main' });
};

onMounted(() => {
  window.ipcRenderer.on('main-process-getDeviceId', (_event, ...args) => {
    console.log('[获取主进程设备序列号]:', ...args)
    ruleForm.deviceCode = args[0];

    // 设备号生成完毕后，就验证本地的激活码是否有效 -- 有效的话 -- 跳转到主页
    const localActiveCode: string = args[1];
    if (localActiveCode == '') {
      // 显示激活授权页面
      console.log('[本地激活码] 未找到')
    } else {
      console.log('[本地激活码] 加载成功')
      // 验证授权
      window.ipcRenderer.send('socket-client-request-activeCode', localActiveCode);
    }
  })

  window.ipcRenderer.on('socket-server-connected', (_event, ...args) => {
    console.log('[收到主进程回复 --> 切换到主页面]:', args[0])
    goToMainPage(args[0] as ServerInfo);
    ElMessage.success('授权认证成功')
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
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.el-form-item {
  margin-bottom: 20px;
}

.special .el-form-item__label {
  display: none;
}

.special {
  .el-form-item__label {
    color: #409eff;
    font-size: medium;
    font-weight: bold;
  }
}
</style>