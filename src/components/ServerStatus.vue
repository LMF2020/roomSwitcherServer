<template>
  <div class="flex flex-col items-center justify-center min-h-screen overflow-hidden">
    <div class="bg-white p-8 rounded-lg text-center max-w-md w-full overflow-hidden">
      <el-image :src="imageUrl" class="mx-auto mb-4" style="width: 80px; height: 80px;" />
      <h1 class="text-2xl font-bold mb-2">Rooms 一键切换</h1>
      <p class="text-gray-500 mb-4">v1.0.0 <el-button type="primary" plain>检查新版本</el-button></p>
      <p class="text-gray-600 mb-6 text-sm">许可证有效期至 {{ expireDate }} 23:59:59</p>
      <p class="text-gray-600 mb-6 text-sm">设备IP <span class="text-red-700 font-bold">{{ ipAddr || "未连接" }}</span> </p>
      <el-divider></el-divider>
      <ul class="list-disc list-inside mt-4">
        <li v-for="client in clientInfo" :key="client.clientAddr" class="mb-2 text-gray-600 flex items-center">
          <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          客户端 {{ client.clientAddr }}
          <span class="text-red-500 font-bold ml-2">已连接</span>
        </li>
      </ul>
      <div v-if="clientInfo.length === 0" class="text-gray-600 mb-6 flex items-center justify-center">
        <span class="w-3 h-4 bg-green-500 rounded-full mr-2 animate-blink"></span>
        正在等待配对器连接
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from '../store/index'
import { ClientInfo } from '../types/data';
import imageUrl from "../assets/logo.png";

const store = useStore()
const ipAddr = computed(() => store.state.serverInfo.ipAddr);
const clientInfo = computed(() => store.state.clientInfo);
const expireDate = computed(() => store.state.serverInfo.expireDate);

onMounted(() => {
  // 监听客户端连接事件
  window.ipcRenderer.on('client-connected', (_event, clientInfo: ClientInfo) => {
    console.log('客户端已连接:', clientInfo);
    // 新增 UI 显示客户端连接信息
    const payload = {
      action: "add",
      clientInfo: clientInfo
    }
    store.commit('updateClientInfo', payload);
  });

  // 监听客户端断开连接事件
  window.ipcRenderer.on('client-disconnected', (_event, clientId: string) => {
    console.log('客户端已断开:', clientId);
    // 删除 UI 显示客户端断开连接信息
    const payload = {
      action: "delete",
      clientInfo: {
        clientId: clientId
      }
    }
    store.commit('updateClientInfo', payload);
  });
})

</script>

<style scoped>
@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.animate-blink {
  animation: blink 1s infinite;
}
</style>