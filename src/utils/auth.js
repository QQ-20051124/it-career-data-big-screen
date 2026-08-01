import { verifyLogin, initDefaultAdmin, registerUser } from './userStore'

const AUTH_KEY = 'auth_info'

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
  const user = await verifyLogin(email, password)
  const info = {
    loginType: 'email',
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    loginTime: Date.now()
  }
  setAuthInfo(info)
  return info
}

export async function registerWithEmail(email, password, name) {
  const user = await registerUser(email, password, name)
  const info = {
    loginType: 'email',
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
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
  return info
}

export function logout() {
  clearAuthInfo()
}

initDefaultAdmin()
