const AUTH_KEY = 'auth_info'
const API_BASE = '/api/auth'

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

export async function registerUser(username, password, email) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.message)
  }
  return data.user
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
    ...userInfo,
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export function loginWithEmail(email) {
  const info = {
    loginType: 'email',
    email,
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export function loginAsGuest() {
  const info = {
    loginType: 'guest',
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export function logout() {
  clearAuthInfo()
}
