import { createRouter, createWebHistory } from 'vue-router'
import BigScreen from '@/components/BigScreen.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: BigScreen
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router