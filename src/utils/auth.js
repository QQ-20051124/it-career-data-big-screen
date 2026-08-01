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
