<template>
  <div class="oauth-authorize-page">
    <div class="authorize-container">
      <div class="provider-header">
        <div class="provider-icon" :class="providerType">
          <i :class="providerIcon"></i>
        </div>
        <h2>{{ providerName }}授权登录</h2>
        <p class="provider-desc">「计程·职道」申请获取以下权限</p>
      </div>

      <div class="permissions-list">
        <div class="permission-item" v-for="perm in permissions" :key="perm.key">
          <div class="perm-icon">✓</div>
          <div class="perm-content">
            <div class="perm-name">{{ perm.name }}</div>
            <div class="perm-desc">{{ perm.desc }}</div>
          </div>
        </div>
      </div>

      <div class="user-info">
        <div class="user-avatar">
          <i :class="providerIcon"></i>
        </div>
        <div class="user-tip">
          您即将使用{{ providerName }}账号登录
        </div>
      </div>

      <div class="authorize-actions">
        <button class="btn-cancel" @click="handleCancel">
          拒绝并返回
        </button>
        <button class="btn-authorize" @click="handleAuthorize">
          同意授权
        </button>
      </div>

      <div class="security-tips">
        <p>🔒 安全提示：本应用仅获取必要的用户信息，不会获取您的密码等敏感信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithSocial } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const providerType = ref('')

const PROVIDER_CONFIG = {
  wechat: {
    name: '微信',
    icon: 'fa-brands fa-weixin',
    permissions: [
      { key: 'nickname', name: '获取昵称', desc: '用于在系统中显示您的昵称' },
      { key: 'avatar', name: '获取头像', desc: '用于在系统中显示您的头像' },
      { key: 'login', name: '登录状态', desc: '保持您的登录状态' }
    ]
  },
  qq: {
    name: 'QQ',
    icon: 'fa-brands fa-qq',
    permissions: [
      { key: 'nickname', name: '获取QQ昵称', desc: '用于在系统中显示您的昵称' },
      { key: 'avatar', name: '获取QQ头像', desc: '用于在系统中显示您的头像' },
      { key: 'login', name: '登录状态', desc: '保持您的登录状态' }
    ]
  }
}

const providerName = computed(() => PROVIDER_CONFIG[providerType.value]?.name || '第三方')
const providerIcon = computed(() => PROVIDER_CONFIG[providerType.value]?.icon || 'fa-solid fa-user')
const permissions = computed(() => PROVIDER_CONFIG[providerType.value]?.permissions || [])

onMounted(() => {
  providerType.value = route.query.provider || 'wechat'
  if (!PROVIDER_CONFIG[providerType.value]) {
    providerType.value = 'wechat'
  }
})

const generateCode = () => {
  return 'mock_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now()
}

const handleAuthorize = () => {
  const code = generateCode()
  
  const authData = {
    provider: providerType.value,
    code,
    nickname: `${providerName.value}用户_${Math.random().toString(36).substring(2, 6)}`,
    avatar: null,
    authorizedAt: Date.now()
  }
  
  sessionStorage.setItem('pendingAuth', JSON.stringify(authData))
  
  setTimeout(() => {
    if (window.opener) {
      window.close()
    } else {
      router.replace({ path: '/', query: { auth: 'success', provider: providerType.value } })
    }
  }, 500)
}

const handleCancel = () => {
  if (window.opener) {
    window.close()
  } else {
    router.replace({ path: '/', query: { cancelled: '1' } })
  }
}
</script>

<style scoped>
.oauth-authorize-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.authorize-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 420px;
  max-width: 100%;
}

.provider-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.provider-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.provider-icon.wechat {
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
}

.provider-icon.qq {
  background: linear-gradient(135deg, #12b7f5, #0ea5e9);
  color: #fff;
}

.provider-header h2 {
  font-size: 20px;
  color: #333;
  margin: 0 0 8px;
}

.provider-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.permissions-list {
  margin-bottom: 24px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.permission-item:last-child {
  border-bottom: none;
}

.perm-icon {
  width: 24px;
  height: 24px;
  background: #e8f5e9;
  color: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.perm-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
}

.perm-desc {
  font-size: 12px;
  color: #999;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  margin-right: 12px;
}

.user-tip {
  font-size: 13px;
  color: #666;
}

.authorize-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

.btn-authorize {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-authorize:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.security-tips {
  text-align: center;
}

.security-tips p {
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.6;
}
</style>
