const USERS_KEY = 'system_users'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

// 预计算的管理员密码hash (admin123 + salt)
// 使用 SHA-256(password + salt) 算法
const ADMIN_SALT = '369871187a90f041'
const ADMIN_HASH = '1435a9393c4a42539ae4e68c3acda4a76b42c5266ca32e9cefe6aeef3273dbb7'

function generateSalt() {
  const array = new Uint8Array(8)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(password + salt)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function initDefaultAdmin() {
  const users = getUsers()
  
  // 移除所有旧的管理员用户（无论hash是否正确）
  const filteredUsers = users.filter(u => u.role !== 'admin' && u.id !== 'admin_default')
  
  // 确保没有其他用户使用 admin@jzd.com 邮箱
  const finalUsers = filteredUsers.filter(u => u.email !== 'admin@jzd.com')
  
  // 创建新的管理员
  const admin = {
    id: 'admin_default',
    email: 'admin@jzd.com',
    passwordHash: ADMIN_HASH,
    salt: ADMIN_SALT,
    role: 'admin',
    name: '系统管理员',
    createdAt: Date.now(),
    lastLoginAt: null,
    status: 'active'
  }
  finalUsers.push(admin)
  saveUsers(finalUsers)
}

export function validateEmailFormat(email) {
  return EMAIL_REGEX.test(email)
}

export async function registerUser(email, password, name = '') {
  if (!validateEmailFormat(email)) {
    throw new Error('邮箱格式不正确')
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`密码长度不能少于${MIN_PASSWORD_LENGTH}位`)
  }
  if (!name.trim()) {
    throw new Error('请输入昵称')
  }

  const users = getUsers()
  if (users.find(u => u.email === email)) {
    throw new Error('该邮箱已被注册')
  }

  const salt = generateSalt()
  const hash = await hashPassword(password, salt)
  const newUser = {
    id: 'user_' + Date.now(),
    email,
    passwordHash: hash,
    salt,
    role: 'user',
    name: name.trim(),
    createdAt: Date.now(),
    lastLoginAt: null,
    status: 'active'
  }
  users.push(newUser)
  saveUsers(users)
  return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
}

export async function verifyLogin(email, password) {
  if (!email || !password) {
    throw new Error('请填写邮箱和密码')
  }

  const users = getUsers()
  const user = users.find(u => u.email === email)
  if (!user) {
    throw new Error('账号不存在')
  }
  if (user.status !== 'active') {
    throw new Error('该账号已被停用')
  }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.passwordHash) {
    throw new Error('密码错误')
  }

  user.lastLoginAt = Date.now()
  saveUsers(users)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export function isAdmin(userId) {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  return user && user.role === 'admin'
}

export function isCurrentUserAdmin() {
  const authInfo = JSON.parse(localStorage.getItem('auth_info') || 'null')
  if (!authInfo) return false
  const users = getUsers()
  const user = users.find(u => u.id === authInfo.userId)
  return user && user.role === 'admin'
}

export function getUserList(adminId) {
  if (!isAdmin(adminId)) return []
  const users = getUsers()
  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  }))
}

export function updateUserStatus(adminId, userId, status) {
  if (!isAdmin(adminId)) throw new Error('无权限操作')
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('用户不存在')
  user.status = status
  saveUsers(users)
}

export function deleteUser(adminId, userId) {
  if (!isAdmin(adminId)) throw new Error('无权限操作')
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) throw new Error('用户不存在')
  if (users[idx].role === 'admin') throw new Error('不能删除管理员账号')
  users.splice(idx, 1)
  saveUsers(users)
}

export async function resetUserPassword(adminId, userId, newPassword) {
  if (!isAdmin(adminId)) throw new Error('无权限操作')
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('用户不存在')
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`密码长度不能少于${MIN_PASSWORD_LENGTH}位`)
  }
  const salt = generateSalt()
  const hash = await hashPassword(newPassword, salt)
  user.passwordHash = hash
  user.salt = salt
  saveUsers(users)
}

export async function resetPasswordByEmail(email, newPassword) {
  if (!email) throw new Error('请输入邮箱地址')
  if (!validateEmailFormat(email)) throw new Error('邮箱格式不正确')
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`密码长度不能少于${MIN_PASSWORD_LENGTH}位`)
  }
  const users = getUsers()
  const idx = users.findIndex(u => u.email === email)
  if (idx === -1) throw new Error('该邮箱未注册')
  const salt = generateSalt()
  const hash = await hashPassword(newPassword, salt)
  users[idx].passwordHash = hash
  users[idx].salt = salt
  saveUsers(users)
  return { success: true }
}

export function updateUserProfile(userId, updates) {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('用户不存在')
  if (updates.name !== undefined && updates.name.trim()) {
    user.name = updates.name.trim()
  }
  if (updates.email !== undefined) {
    if (!validateEmailFormat(updates.email)) throw new Error('邮箱格式不正确')
    const existing = users.find(u => u.email === updates.email && u.id !== userId)
    if (existing) throw new Error('该邮箱已被注册')
    user.email = updates.email
  }
  saveUsers(users)
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}
