import { createRouter, createWebHistory } from 'vue-router'
import BigScreen from '@/components/BigScreen.vue'
import LoginView from '@/components/LoginView.vue'
import Dashboard from '@/components/Dashboard.vue'
import JobRecommend from '@/components/JobRecommend.vue'
import AIResume from '@/components/AIResume.vue'
import IndustryPrediction from '@/components/IndustryPrediction.vue'
import JobCommunity from '@/components/JobCommunity.vue'
import TalentStatistics from '@/components/TalentStatistics.vue'

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
  },
  {
    path: '/ai-resume',
    name: 'AIResume',
    component: AIResume
  },
  {
    path: '/industry-prediction',
    name: 'IndustryPrediction',
    component: IndustryPrediction
  },
  {
    path: '/job-community',
    name: 'JobCommunity',
    component: JobCommunity
  },
  {
    path: '/talent-statistics',
    name: 'TalentStatistics',
    component: TalentStatistics
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router