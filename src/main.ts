import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router';
import {store, key} from './store'
import './style.css'

import './node/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.

const app = createApp(App);
app.use(router)
app.use(store, key)
app.use(ElementPlus);
app.mount('#app');
