// ============================================================
// 【游客模式统一状态管理】
// 集中封装游客权限判断、AI对话计数、登录弹窗控制
// 所有权限判断逻辑统一封装，方便后续调整游客配额
// ============================================================
import { ref, computed } from 'vue'
import { isGuest, getAuthInfo, resetGuestSession } from '@/utils/auth'

// 游客配额配置（与后端 GUEST_CONFIG 保持一致）
export const GUEST_LIMITS = {
  MAX_AI_CHAT_ROUNDS: 3,        // 游客AI对话最大轮次
  MAX_RESOURCES_PER_SKILL: 2    // 游客每个技能最多展示资源数
}

// 全局响应式状态（单例，跨组件共享）
const _isGuestMode = ref(isGuest())
const _guestAIChatCount = ref(0)
const _loginModalVisible = ref(false)
const _loginModalMessage = ref('游客模式功能受限，请登录账号解锁完整功能')

// 初始化时从 sessionStorage 读取已使用的对话次数（同标签页内累加）
const _initCount = () => {
  try {
    const saved = sessionStorage.getItem('guest_ai_chat_count')
    _guestAIChatCount.value = saved ? parseInt(saved, 10) || 0 : 0
  } catch {
    _guestAIChatCount.value = 0
  }
}
_initCount()

// ============================================================
// 刷新全局权限状态
// 登录成功后调用：实时解锁全部游客限制
// 退出登录后调用：立刻回落至游客模式，重置AI对话计数、资源展示限制
// ============================================================
function refreshAuthState() {
  _isGuestMode.value = isGuest()
  if (_isGuestMode.value) {
    // 游客模式：重置会话计数（退出登录场景）
    resetGuestSession()
    _guestAIChatCount.value = 0
    sessionStorage.removeItem('guest_ai_chat_count')
  } else {
    // 登录用户：清空计数限制
    _guestAIChatCount.value = 0
    sessionStorage.removeItem('guest_ai_chat_count')
  }
}

// ============================================================
// 游客AI对话计数
// 一轮 = 用户发送一条消息算作一轮
// 会话生命周期有效：刷新页面/重新打开对话面板，对话次数重置为0
// ============================================================
function getGuestAIChatCount() {
  return _guestAIChatCount.value
}

function getGuestAIChatRemaining() {
  return Math.max(0, GUEST_LIMITS.MAX_AI_CHAT_ROUNDS - _guestAIChatCount.value)
}

function isGuestAIChatExhausted() {
  return _isGuestMode.value && _guestAIChatCount.value >= GUEST_LIMITS.MAX_AI_CHAT_ROUNDS
}

// 增加游客对话计数（发送消息成功后调用）
function incrementGuestAIChat() {
  if (!_isGuestMode.value) return _guestAIChatCount.value
  _guestAIChatCount.value++
  try {
    sessionStorage.setItem('guest_ai_chat_count', String(_guestAIChatCount.value))
  } catch {}
  return _guestAIChatCount.value
}

// 重置游客AI对话计数（重新打开对话面板时调用）
function resetGuestAIChatCount() {
  _guestAIChatCount.value = 0
  try {
    sessionStorage.removeItem('guest_ai_chat_count')
  } catch {}
}

// ============================================================
// 登录弹窗控制
// 弹窗为页面内弹窗，禁止新开标签页；弹出时背景增加蒙层，禁止底层页面滚动
// 点击【去登录】关闭弹窗，跳转登录区域；点击【关闭】收起弹窗，恢复页面浏览
// ============================================================
function showLoginModal(message) {
  _loginModalMessage.value = message || '游客模式功能受限，请登录账号解锁完整功能'
  _loginModalVisible.value = true
  // 禁止底层页面滚动
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

function hideLoginModal() {
  _loginModalVisible.value = false
  // 恢复页面滚动
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

// 切换登录（点击"去登录"按钮）
function goToLogin() {
  hideLoginModal()
  // 跳转登录页（保留当前路径用于登录后回跳）
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search
    window.location.href = '/?redirect=' + encodeURIComponent(currentPath)
  }
}

// ============================================================
// 权限校验：调用受限功能前判断
// 返回 true 表示允许调用，false 表示已被拦截（弹窗已自动唤起）
// ============================================================
function checkPermission(feature, customMessage) {
  if (!_isGuestMode.value) return true
  // 游客模式：弹出登录弹窗
  const messages = {
    favorite: '游客模式功能受限，请登录账号解锁完整功能',
    saveRoute: '游客模式功能受限，请登录账号解锁完整功能',
    savePlan: '游客模式功能受限，请登录账号解锁完整功能',
    exportReport: '游客模式功能受限，请登录账号解锁完整功能',
    unlimitedAI: '您当前为游客模式，对话次数已用完。注册登录后，可无限制使用AI学习顾问！',
    custom: customMessage || '游客模式功能受限，请登录账号解锁完整功能'
  }
  showLoginModal(messages[feature] || messages.custom)
  return false
}

// ============================================================
// 主 composable 入口
// 在组件中：const { isGuestMode, loginModalVisible, ... } = useGuestMode()
// ============================================================
export function useGuestMode() {
  const isGuestMode = computed(() => _isGuestMode.value)
  const guestAIChatCount = computed(() => _guestAIChatCount.value)
  const guestAIChatRemaining = computed(() => getGuestAIChatRemaining())
  const loginModalVisible = computed(() => _loginModalVisible.value)
  const loginModalMessage = computed(() => _loginModalMessage.value)

  return {
    // 状态
    isGuestMode,
    guestAIChatCount,
    guestAIChatRemaining,
    loginModalVisible,
    loginModalMessage,
    GUEST_LIMITS,
    // 权限校验
    checkPermission,
    // AI对话计数
    getGuestAIChatCount,
    getGuestAIChatRemaining,
    isGuestAIChatExhausted,
    incrementGuestAIChat,
    resetGuestAIChatCount,
    // 弹窗控制
    showLoginModal,
    hideLoginModal,
    goToLogin,
    // 权限刷新
    refreshAuthState
  }
}
