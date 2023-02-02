import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Home from "./pages/home/Home.vue"
import New from "./pages/new/New.vue"
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: "/", component: Home },
  { path: "/new", component: New },
  { path: "/edit/:id", component: New }
]
const router = createRouter({
  history: createWebHistory(),
  routes
});

createApp(App)
  .use(router)
  .mount('#app')
