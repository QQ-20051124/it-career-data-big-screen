<template>
  <div class="oauth-callback-page">
    <div class="callback-container">
      <div class="spinner" v-if="status === 'processing'"></div>
      <div class="status-icon success" v-else-if="status === 'success'">✓</div>
      <div class="status-icon error" v-else-if="status === 'error'">✕</div>
      <h2>{{ statusText }}</h2>
      <p v-if="status === 'processing'" class="callback-desc">正在完成{{ provider }}授权登录...</p>
      <p v-else-if="status === 'success'" class="callback-desc">授权成功，正在跳转...</p>
      <p v-else class="callback-desc">授权失败：{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithSocial } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const status = ref('processing')
const statusText = ref('正在处理授权...')
const errorMsg = ref('未知错误')
const provider = ref('')

const PROVIDER_NAMES = {
  wechat: '微信',
  qq: 'QQ',
  email: '邮箱'
}

onMounted(async () => {
  const { code, state, error, provider: providerParam } = route.query
  
  provider.value = PROVIDER_NAMES[providerParam] || '第三方'

  if (error === 'access_denied') {
    status.value = 'error'
    statusText.value = '授权被拒绝'
    errorMsg.value = '您取消了授权，登录已取消'
    setTimeout(() => {
      router.replace({ path: '/', query: { loginCancelled: '1' } })
    }, 2000)
    return
  }

  if (!code) {
    status.value = 'error'
    statusText.value = '授权失败'
    errorMsg.value = '未收到授权码，请重新登录'
    setTimeout(() => {
      router.replace({ path: '/' })
    }, 2000)
    return
  }

  try {
    statusText.value = `${provider.value}授权成功`
    
    loginWithSocial(providerParam || 'unknown', {
      nickname: `${provider.value}用户`,
      avatar: null,
      openid: code
    })

    status.value = 'success'
    statusText.value = '登录成功'
    
    await new Promise(resolve => setTimeout(resolve, 800))
    router.replace({ path: '/dashboard' })
  } catch (e) {
    status.value = 'error'
    statusText.value = '登录失败'
    errorMsg.value = e.message || '未知错误'
    setTimeout(() => {
      router.replace({ path: '/' })
    }, 2000)
  }
})
</script>

<style scoped>
.oauth-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #16213e 50%, #0d1b3e 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.callback-container {
  text-align: center;
  padding: 40px 60px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 24px;
}

.status-icon.success {
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
  border: 2px solid #00d4aa;
}

.status-icon.error {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
  border: 2px solid #ff4757;
}

h2 {
  color: #fff;
  font-size: 20px;
  margin: 0 0 12px;
}

.callback-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
}
</style>
