<template>
  <el-form
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
    class="demo-ruleForm"
    :size="formSize"
    status-icon
  >
    <el-form-item label="" prop="deviceCode">
      <div class="flex items-center space-x-1">
      <el-input v-model="ruleForm.deviceCode" :readonly="true" />
      <el-button type="primary" @click="copyToDeviceCode(ruleFormRef)">拷贝设备序列号</el-button>
    </div>
    </el-form-item>
    <el-form-item label="激活码:" prop="activeCode" class="special">
      <el-input v-model="ruleForm.activeCode" type="textarea" :rows="7" resize="none"/>
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
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

interface RuleForm {
  deviceCode: string,
  activeCode: string
}

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
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

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

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`, 
  label: `${idx + 1}`,
}))

// 页面初始化
onMounted(() => { 
  window.ipcRenderer.on('main-process-getDeviceId', (_event, ...args) => {
    console.log('[Receive Main-process getDeviceId]:', ...args)
    ruleForm.deviceCode = args[0];
  })
})
</script>

<style lang="scss">
  .special {
    .el-form-item__label {
      color: #409eff;
      font-size:medium;
      font-weight: bold;
    }
  }
</style>
