const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const router = express.Router()

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json')

function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { users: [] }
  }
}

function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

function verifyPassword(password, salt, hash) {
  const checkHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return checkHash === hash
}

router.post('/register', (req, res) => {
  try {
    const { username, password, email } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: '用户名至少3位' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码至少6位' })
    }

    const data = loadUsers()
    if (data.users.find(u => u.username === username)) {
      return res.status(409).json({ success: false, message: '用户名已被注册' })
    }
    if (email && data.users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: '邮箱已被注册' })
    }

    const { salt, hash } = hashPassword(password)
    const newUser = {
      id: Date.now().toString(),
      username,
      email: email || '',
      salt,
      hash,
      createdAt: new Date().toISOString(),
      loginCount: 0,
      lastLoginAt: null
    }

    data.users.push(newUser)
    saveUsers(data)

    const { password: _, salt: __, hash: ___, ...safeUser } = newUser
    res.json({ success: true, message: '注册成功', user: safeUser })
  } catch (e) {
    console.error('注册失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }

    const data = loadUsers()
    const user = data.users.find(u => u.username === username)

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' })
    }

    if (!verifyPassword(password, user.salt, user.hash)) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' })
    }

    user.loginCount = (user.loginCount || 0) + 1
    user.lastLoginAt = new Date().toISOString()
    saveUsers(data)

    const { password: _, salt: __, hash: ___, ...safeUser } = user
    res.json({ success: true, message: '登录成功', user: safeUser })
  } catch (e) {
    console.error('登录失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.post('/reset-password', (req, res) => {
  try {
    const { username, email, newPassword } = req.body

    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: '请填写用户名和新密码' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码至少6位' })
    }

    const data = loadUsers()
    const user = data.users.find(u => u.username === username)

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    if (email && user.email && user.email !== email) {
      return res.status(400).json({ success: false, message: '邮箱与注册时不一致' })
    }

    const { salt, hash } = hashPassword(newPassword)
    user.salt = salt
    user.hash = hash
    user.passwordUpdatedAt = new Date().toISOString()
    saveUsers(data)

    res.json({ success: true, message: '密码重置成功' })
  } catch (e) {
    console.error('密码重置失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

module.exports = router
