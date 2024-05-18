<template>
  <div class="p-6 bg-gray-50 rounded-lg shadow-md">
    <div class="mb-6 text-center">
      <el-alert :title="`授权到期: ${expireDate}`" type="warning" show-icon class="mb-4">
      </el-alert>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        服务器信息: {{ ipAddr || '未连接' }}
      </h2>
      <el-divider></el-divider>
      <ul class="list-disc list-inside mt-4">
        <li v-for="client in clientInfo" :key="client.clientAddr" class="mb-2 text-gray-600 flex items-center">
          <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          客户端 {{ client.clientAddr }}
          <span class="text-red-500 font-bold ml-2">已连接</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from '../store/index'
import { ClientInfo } from '../types/data';

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

<style scoped></style>