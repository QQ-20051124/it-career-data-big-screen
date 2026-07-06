import { createRouter, createWebHistory } from 'vue-router'
import BigScreen from '@/components/BigScreen.vue'
import LoginView from '@/components/LoginView.vue'
import Dashboard from '@/components/Dashboard.vue'
import JobRecommend from '@/components/JobRecommend.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: BigScreen
  },
  {
    path: '/job-recommend',
    name: 'JobRecommend',
    component: JobRecommend
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router