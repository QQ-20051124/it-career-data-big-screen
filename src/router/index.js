import { createRouter, createWebHistory } from 'vue-router'
import BigScreen from '@/components/BigScreen.vue'
import Login from '@/components/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: BigScreen,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router