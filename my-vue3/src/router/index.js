import { createRouter, createWebHistory } from 'vue-router'
import BigScreen from '@/components/BigScreen.vue'
import LoginView from '@/components/LoginView.vue'
import Dashboard from '@/components/Dashboard.vue'
import JobRecommend from '@/components/JobRecommend.vue'
import AIResume from '@/components/AIResume.vue'
import IndustryPrediction from '@/components/IndustryPrediction.vue'
import JobCommunity from '@/components/JobCommunity.vue'
import TalentStatistics from '@/components/TalentStatistics.vue'
import OAuthCallback from '@/components/OAuthCallback.vue'
import OAuthAuthorize from '@/components/OAuthAuthorize.vue'

import Planning from '@/components/Planning.vue'
import SkillRoute from '@/components/SkillRoute.vue'
import { isLoggedIn } from '@/utils/auth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/oauth/authorize',
    name: 'OAuthAuthorize',
    component: OAuthAuthorize
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: BigScreen,
    meta: { requiresAuth: true }
  },
  {
    path: '/job-recommend',
    name: 'JobRecommend',
    component: JobRecommend,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-resume',
    name: 'AIResume',
    component: AIResume,
    meta: { requiresAuth: true }
  },
  {
    path: '/industry-prediction',
    name: 'IndustryPrediction',
    component: IndustryPrediction,
    meta: { requiresAuth: true }
  },
  {
    path: '/job-community',
    name: 'JobCommunity',
    component: JobCommunity,
    meta: { requiresAuth: true }
  },
  {
    path: '/planning',
    name: 'Planning',
    component: Planning,
    meta: { requiresAuth: true }
  },
  {
    path: '/skill-route',
    name: 'SkillRoute',
    component: SkillRoute,
    meta: { requiresAuth: true }
  },
  {
    path: '/talent-statistics',
    name: 'TalentStatistics',
    component: TalentStatistics,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next({ path: '/', query: { redirect: to.fullPath } })
  } else if (to.path === '/' && isLoggedIn()) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

// 全局路由守卫：记录浏览历史
const routePageMap = {
  '/job-recommend': { type: 'job', title: '智能岗位推荐', pageName: '岗位推荐' },
  '/ai-resume': { type: 'resume', title: 'AI简历', pageName: 'AI简历' },
  '/planning': { type: 'planning', title: '学业-就业双向联动规划', pageName: '学业规划' },
  '/industry-prediction': { type: 'prediction', title: '行业供需预测', pageName: '行业预测' },
  '/job-community': { type: 'job', title: '求职社区', pageName: '求职社区' },
  '/talent-statistics': { type: 'prediction', title: '人才专项统计', pageName: '人才统计' }
}

router.afterEach((to) => {
  const info = routePageMap[to.path]
  if (info) {
    const saved = localStorage.getItem('browseHistory')
    let history = []
    try { history = saved ? JSON.parse(saved) : [] } catch { history = [] }
    if (history.length > 0 && history[0].url === to.path && (Date.now() - history[0].time < 3000)) return
    history.unshift({ ...info, url: to.path, time: Date.now() })
    if (history.length > 30) history = history.slice(0, 30)
    localStorage.setItem('browseHistory', JSON.stringify(history))
  }
})

export default router