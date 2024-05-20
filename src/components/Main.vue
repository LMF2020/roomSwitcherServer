<template>
    <el-tabs v-model="activeTab">
        <el-tab-pane label="概览" name="status">
            <Status />
        </el-tab-pane>
        <el-tab-pane label="工具" name="tools">
            <Tools />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup>
import { ref } from 'vue';
import Tools from "./ServerTools.vue";
import Status from "./ServerStatus.vue";

const activeTab = ref('status');
</script>