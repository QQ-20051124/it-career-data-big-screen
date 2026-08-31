const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

const { requireUser } = require('../middleware/auth')

const DATA_FILE = path.join(__dirname, '../data/community_data.json')

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load community data:', e.message)
  }
  return { posts: [], qas: [], likes: [], collects: [], applies: [], chats: [], groups: [], groupMessages: [] }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to save community data:', e.message)
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// ==================== 帖子 ====================

router.get('/posts', (req, res) => {
  const data = loadData()
  const { author, tag, keyword, sortBy } = req.query
  let posts = [...data.posts]

  if (author) posts = posts.filter(p => p.author === author)
  if (tag) posts = posts.filter(p => p.tags && p.tags.includes(tag))
  if (keyword) {
    const kw = keyword.toLowerCase()
    posts = posts.filter(p =>
      (p.title || '').toLowerCase().includes(kw) ||
      (p.content || '').toLowerCase().includes(kw) ||
      (p.author || '').toLowerCase().includes(kw)
    )
  }

  if (sortBy === 'hot') {
    posts.sort((a, b) => (b.likes + b.views + b.comments) - (a.likes + a.views + a.comments))
  } else {
    posts.sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  res.json({ success: true, data: posts })
})

router.post('/posts', requireUser, (req, res) => {
  const data = loadData()
  const post = {
    id: genId(),
    title: req.body.title || '无标题',
    content: req.body.content || '',
    author: req.body.author || '匿名',
    avatar: req.body.avatar || '',
    tags: req.body.tags || [],
    type: req.body.type || 'interview',
    time: new Date().toISOString(),
    views: 0,
    likes: 0,
    comments: 0,
    liked: false,
    collected: false
  }
  data.posts.unshift(post)
  saveData(data)
  res.json({ success: true, data: post })
})

router.post('/posts/:id/view', (req, res) => {
  const data = loadData()
  const post = data.posts.find(p => String(p.id) === String(req.params.id))
  if (post) {
    post.views = (post.views || 0) + 1
    saveData(data)
  }
  res.json({ success: true, data: post })
})

router.delete('/posts/:id', requireUser, (req, res) => {
  const data = loadData()
  const idx = data.posts.findIndex(p => String(p.id) === String(req.params.id))
  if (idx !== -1) {
    data.posts.splice(idx, 1)
    saveData(data)
    res.json({ success: true })
  } else {
    res.json({ success: false, message: '帖子不存在' })
  }
})

// ==================== 问答 ====================

router.get('/qas', (req, res) => {
  const data = loadData()
  const { author } = req.query
  let qas = [...data.qas]
  if (author) qas = qas.filter(q => q.author === author)
  res.json({ success: true, data: qas })
})

router.post('/qas', requireUser, (req, res) => {
  const data = loadData()
  const qa = {
    id: genId(),
    title: req.body.title || '无标题',
    content: req.body.content || '',
    author: req.body.author || '匿名',
    avatar: req.body.avatar || '',
    tags: req.body.tags || [],
    time: new Date().toISOString(),
    answers: 0
  }
  data.qas.unshift(qa)
  saveData(data)
  res.json({ success: true, data: qa })
})

// ==================== 点赞 ====================

router.post('/likes/toggle', requireUser, (req, res) => {
  const data = loadData()
  const { username, itemId, itemType } = req.body
  const existing = data.likes.find(l =>
    l.username === username && l.itemId === String(itemId) && l.type === itemType
  )
  if (existing) {
    data.likes = data.likes.filter(l => l !== existing)
    if (itemType === 'post') {
      const post = data.posts.find(p => String(p.id) === String(itemId))
      if (post) post.likes = Math.max(0, (post.likes || 0) - 1)
    }
    saveData(data)
    res.json({ success: true, liked: false })
  } else {
    data.likes.push({ username, itemId: String(itemId), type: itemType })
    if (itemType === 'post') {
      const post = data.posts.find(p => String(p.id) === String(itemId))
      if (post) post.likes = (post.likes || 0) + 1
    }
    saveData(data)
    res.json({ success: true, liked: true })
  }
})

// ==================== 收藏 ====================

router.get('/collects/:username', (req, res) => {
  const data = loadData()
  const collects = data.collects.filter(c => c.username === req.params.username)
  res.json({ success: true, data: collects })
})

router.post('/collects/toggle', requireUser, (req, res) => {
  const data = loadData()
  const { username, itemId, itemType, itemData } = req.body
  const existing = data.collects.find(c =>
    c.username === username && c.itemId === String(itemId) && c.type === itemType
  )
  if (existing) {
    data.collects = data.collects.filter(c => c !== existing)
    if (itemType === 'post') {
      const post = data.posts.find(p => String(p.id) === String(itemId))
      if (post) post.collected = false
    }
    saveData(data)
    res.json({ success: true, collected: false })
  } else {
    data.collects.push({
      username,
      itemId: String(itemId),
      type: itemType,
      itemData: itemData || null,
      time: new Date().toISOString()
    })
    if (itemType === 'post') {
      const post = data.posts.find(p => String(p.id) === String(itemId))
      if (post) post.collected = true
    }
    saveData(data)
    res.json({ success: true, collected: true })
  }
})

// ==================== 投递 ====================

router.get('/applies/:username', (req, res) => {
  const data = loadData()
  const applies = data.applies.filter(a => a.username === req.params.username)
  res.json({ success: true, data: applies })
})

router.post('/applies', requireUser, (req, res) => {
  const data = loadData()
  const { username, jobId, jobData } = req.body
  const exists = data.applies.some(a => a.username === username && a.jobId === jobId)
  if (exists) {
    return res.json({ success: false, message: '已投递过该岗位' })
  }
  const record = {
    id: genId(),
    username,
    jobId,
    jobTitle: jobData?.title || '',
    company: jobData?.company || '',
    city: jobData?.city || '',
    salary: jobData?.salary || '',
    applyTime: new Date().toISOString()
  }
  data.applies.push(record)
  saveData(data)
  res.json({ success: true, data: record })
})

router.delete('/applies/:username/:jobId', requireUser, (req, res) => {
  const data = loadData()
  data.applies = data.applies.filter(a => !(a.username === req.params.username && a.jobId === req.params.jobId))
  saveData(data)
  res.json({ success: true })
})

// ==================== 聊天 ====================

router.get('/chats/:username/:otherName', (req, res) => {
  const data = loadData()
  const { username, otherName } = req.params
  const key1 = `${username}__${otherName}`
  const key2 = `${otherName}__${username}`
  const existing = data.chats.find(c => c.key === key1 || c.key === key2)
  res.json({ success: true, data: existing ? existing.messages : [] })
})

router.post('/chats', requireUser, (req, res) => {
  const data = loadData()
  const { username, otherName, messages } = req.body
  const key = [username, otherName].sort().join('__')
  const idx = data.chats.findIndex(c => c.key === key)
  if (idx !== -1) {
    data.chats[idx].messages = messages
  } else {
    data.chats.push({ key, participants: [username, otherName], messages })
  }
  saveData(data)
  res.json({ success: true })
})

// ==================== 用户统计 ====================

router.get('/stats/:username', (req, res) => {
  const data = loadData()
  const { username } = req.params
  const userPosts = data.posts.filter(p => p.author === username)
  const userCollects = data.collects.filter(c => c.username === username)
  const userApplies = data.applies.filter(a => a.username === username)
  const userLikes = data.likes.filter(l => l.username === username)

  res.json({
    success: true,
    data: {
      posts: userPosts.length,
      collects: userCollects.length,
      applies: userApplies.length,
      likes: userLikes.length,
      totalLikes: userPosts.reduce((sum, p) => sum + (p.likes || 0), 0)
    }
  })
})

// ==================== 群聊（用户自建小组） ====================

// 列出所有小组（含官方 + 用户自建）
router.get('/groups', (req, res) => {
  const data = loadData()
  if (!data.groups) data.groups = []
  res.json({ success: true, data: data.groups })
})

// 创建小组
router.post('/groups', requireUser, (req, res) => {
  const data = loadData()
  if (!data.groups) data.groups = []
  const { name, desc, creator } = req.body
  if (!name) return res.status(400).json({ success: false, message: '群名称必填' })
  if (data.groups.find(g => g.name === name)) {
    return res.status(409).json({ success: false, message: '已存在同名小组' })
  }
  const group = {
    id: genId(),
    name,
    desc: desc || `${name}方向岗位讨论`,
    members: 1,
    posts: 0,
    creator: creator || '匿名用户',
    createdAt: new Date().toISOString(),
    isUserCreated: true
  }
  data.groups.unshift(group)
  saveData(data)
  res.json({ success: true, data: group })
})

// 删除自己创建的小组
router.delete('/groups/:name', requireUser, (req, res) => {
  const data = loadData()
  if (!data.groups) return res.json({ success: false, message: '小组不存在' })
  const name = decodeURIComponent(req.params.name)
  const idx = data.groups.findIndex(g => g.name === name)
  if (idx === -1) return res.json({ success: false, message: '小组不存在' })
  // 同时删掉该组所有消息
  if (data.groupMessages) {
    data.groupMessages = data.groupMessages.filter(m => m.groupName !== name)
  }
  data.groups.splice(idx, 1)
  saveData(data)
  res.json({ success: true })
})

// 取某个小组的所有消息
router.get('/groups/:name/messages', (req, res) => {
  const data = loadData()
  if (!data.groupMessages) data.groupMessages = []
  const name = decodeURIComponent(req.params.name)
  const msgs = data.groupMessages
    .filter(m => m.groupName === name)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
  res.json({ success: true, data: msgs })
})

// 往某个小组发一条消息
router.post('/groups/:name/messages', requireUser, (req, res) => {
  const data = loadData()
  if (!data.groupMessages) data.groupMessages = []
  const name = decodeURIComponent(req.params.name)
  const group = (data.groups || []).find(g => g.name === name)
  if (!group) return res.status(404).json({ success: false, message: '小组不存在' })

  const { content, from, author, avatar } = req.body
  const msg = {
    id: 'gm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    groupName: name,
    timestamp: Date.now(),
    content: content || '',
    from: from || author || '匿名',
    author: author || from || '匿名',
    avatar: avatar || ''
  }
  data.groupMessages.push(msg)
  saveData(data)
  res.json({ success: true, data: msg })
})

// ==================== 初始化 ====================

router.post('/init', (req, res) => {
  const data = loadData()
  if (!data.posts) data.posts = []
  if (!data.qas) data.qas = []
  if (!data.likes) data.likes = []
  if (!data.collects) data.collects = []
  if (!data.applies) data.applies = []
  if (!data.chats) data.chats = []
  if (!data.groups) data.groups = []
  if (!data.groupMessages) data.groupMessages = []
  saveData(data)
  res.json({ success: true, message: '社区数据已初始化（无预设数据）' })
})

module.exports = router
