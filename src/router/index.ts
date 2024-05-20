import { createRouter, createWebHashHistory } from "vue-router";
import ServerAuth from "../components/ServerAuth.vue";
import Main from "../components/Main.vue";

const routes = [
  { path: "/", component: ServerAuth },
  { path: "/main", name: "main", component: Main },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
