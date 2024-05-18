import { createRouter, createWebHashHistory } from 'vue-router'
import ServerStatus from '../components/ServerStatus.vue';
import ServerAuth from '../components/ServerAuth.vue'

const routes = [
    { path: '/', component: ServerAuth },
    { path: '/status', name: 'status', component: ServerStatus }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router
