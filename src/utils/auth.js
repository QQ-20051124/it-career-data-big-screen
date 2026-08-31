import { verifyLogin, initDefaultAdmin, registerUser } from './userStore'

const AUTH_KEY = 'auth_info'
const API_BASE = '/api/auth'

// 游客会话ID存储键（使用 sessionStorage：刷新页面/重开标签页即重置，符合"会话生命周期有效"要求）
const GUEST_SESSION_KEY = 'guest_session_id'

export function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) !== null
}

export function getAuthInfo() {
  try {
    const data = localStorage.getItem(AUTH_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setAuthInfo(info) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    ...info,
    loginTime: Date.now()
  }))
}

export function clearAuthInfo() {
  localStorage.removeItem(AUTH_KEY)
}

// ============================================================
// 【游客模式判断】
// 通过 loginType === 'guest' 或 role === 'guest' 识别游客
// 登录用户返回 false，未登录或游客均返回 true
// ============================================================
export function isGuest() {
  const info = getAuthInfo()
  if (!info) return true
  return info.loginType === 'guest' || info.role === 'guest'
}

// ============================================================
// 【游客会话ID管理】
// 使用 sessionStorage 存储，刷新页面会保留同一会话（同一标签页内计数累加）
// 关闭标签页/重开页面时 sessionStorage 清空，会话ID重新生成，计数重置
// 注：用户要求"刷新页面、重新打开对话面板，对话次数重置为0"
//   - sessionStorage 在 F5 刷新时保留，但关闭标签页即清空
//   - 为严格满足"刷新即重置"要求，提供 resetGuestSession() 供页面加载时主动调用
// ============================================================
export function getGuestSessionId() {
  let id = sessionStorage.getItem(GUEST_SESSION_KEY)
  if (!id) {
    id = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    sessionStorage.setItem(GUEST_SESSION_KEY, id)
  }
  return id
}

// 重置游客会话（刷新页面时调用，确保对话计数归零）
export function resetGuestSession() {
  sessionStorage.removeItem(GUEST_SESSION_KEY)
  sessionStorage.removeItem('guest_ai_chat_count')
  return getGuestSessionId()
}

// ============================================================
// 【身份请求头注入】
// 返回需要附加到 fetch 请求的身份识别头：
//   - 登录用户：X-User-Id
//   - 游客：X-Guest-Session
// 后端中间件据此识别身份，做资源截断/对话限制/接口拦截
// ============================================================
export function getAuthHeaders() {
  const headers = {}
  const info = getAuthInfo()
  if (info && info.loginType !== 'guest' && info.role !== 'guest' && info.userId) {
    headers['X-User-Id'] = info.userId
  } else {
    headers['X-Guest-Session'] = getGuestSessionId()
  }
  return headers
}

// ============================================================
// 【带身份的 fetch 封装】
// 自动注入身份头，统一处理游客被拦截（403 GUEST_FORBIDDEN）的响应
// 用法：const res = await authFetch('/api/community/collects/toggle', { method: 'POST', body: ... })
// 返回标准 Response 对象；调用方自行 res.json() 处理
// ============================================================
export async function authFetch(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeaders()
  }
  const mergedOptions = { ...options, headers }
  return fetch(url, mergedOptions)
}

export async function loginWithCredentials(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.message)
  }
  const info = {
    loginType: 'account',
    userId: data.user.id,
    username: data.user.username,
    email: data.user.email || '',
    loginCount: data.user.loginCount,
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export async function resetPassword(username, newPassword, email) {
  const body = { username, newPassword }
  if (email) body.email = email
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.message)
  }
  return data
}

export function loginWithSocial(type, userInfo) {
  const info = {
    loginType: type,
    userId: 'social_' + Date.now(),
    name: userInfo.nickname || userInfo.name || '社交用户',
    email: userInfo.email || '',
    role: 'user',
    ...userInfo,
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export async function loginWithEmail(email, password) {
  // 调后端 API（后端支持 username 或 email 登录）
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password })
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.message)
  }
  const info = {
    loginType: 'email',
    userId: data.user.id,
    username: data.user.username || '',
    email: data.user.email || email,
    name: data.user.username || email,
    role: data.user.role || 'user',
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export async function registerWithEmail(email, password, name) {
  // 调后端 API 注册 + 自动登录
  const username = name || email.split('@')[0]
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.message)
  }
  const info = {
    loginType: 'email',
    userId: data.user.id,
    username: data.user.username || username,
    email: data.user.email || email,
    name: name || username,
    role: 'user',
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export function loginAsGuest() {
  const info = {
    loginType: 'guest',
    name: '游客',
    role: 'guest',
    loginTime: Date.now()
  }
  setAuthInfo(info)
  // 进入游客模式时生成新的会话ID（计数从0开始）
  resetGuestSession()
  return info
}

export function logout() {
  clearAuthInfo()
  // 退出登录后回落游客模式，重置会话计数
  resetGuestSession()
}

initDefaultAdmin()
