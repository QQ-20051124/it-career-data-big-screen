import axios from 'axios'
import { getAuthHeaders } from './auth'

const API_BASE = '/api/community'

// axios 默认带身份头（登录用户带 X-User-Id，游客带 X-Guest-Session）
axios.interceptors.request.use(config => {
  const auth = getAuthHeaders()
  if (auth) config.headers = { ...config.headers, ...auth }
  return config
})

const POSTS_KEY = 'community_posts'
const QAS_KEY = 'community_qas'
const LIKES_KEY = 'community_likes'
const COLLECTS_KEY = 'community_collects'
const APPLIES_KEY = 'community_applies'
const CHATS_KEY = 'community_chats'
const GROUPS_KEY = 'community_groups'
const GROUP_MSGS_KEY = 'community_group_msgs'
const INIT_FLAG_KEY = 'community_initialized_v3'

function readStore(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ==================== 初始化 ====================

export async function initCommunityData(username) {
  if (!username) return
  
  if (localStorage.getItem('community_initialized_v2')) {
    localStorage.removeItem('community_initialized_v2')
    clearCommunityData()
  }
  
  try {
    const res = await axios.post(`${API_BASE}/init`)
    if (res.data.success) {
      localStorage.setItem(INIT_FLAG_KEY, '1')
      return true
    }
  } catch (e) {
    console.warn('Backend init failed, using local data:', e.message)
  }
  
  if (!localStorage.getItem(INIT_FLAG_KEY)) {
    writeStore(POSTS_KEY, [])
    localStorage.setItem(INIT_FLAG_KEY, '1')
  }
}

export function resetCommunityData() {
  localStorage.removeItem(INIT_FLAG_KEY)
  clearCommunityData()
}

// ==================== 帖子 ====================

export async function fetchPosts(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/posts`, { params })
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchPosts failed:', e.message)
  }
  return readStore(POSTS_KEY)
}

export function getPosts() {
  return readStore(POSTS_KEY)
}

export async function createPost(post) {
  try {
    const res = await axios.post(`${API_BASE}/posts`, post)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('createPost failed:', e.message)
  }
  const posts = readStore(POSTS_KEY)
  const newPost = { ...post, id: 'p_' + Date.now(), time: new Date().toISOString(), views: 0, likes: 0, comments: 0 }
  posts.unshift(newPost)
  writeStore(POSTS_KEY, posts)
  return newPost
}

export function savePosts(posts) {
  writeStore(POSTS_KEY, posts)
}

export function addPost(post) {
  const posts = readStore(POSTS_KEY)
  posts.unshift(post)
  writeStore(POSTS_KEY, posts)
}

export function deletePost(postId, authorName) {
  const posts = readStore(POSTS_KEY)
  const filtered = posts.filter(p => !(p.id === postId && p.author === authorName))
  writeStore(POSTS_KEY, filtered)
  return filtered
}

export function getPostById(id) {
  const posts = readStore(POSTS_KEY)
  return posts.find(p => String(p.id) === String(id))
}

export function updatePost(postId, updates) {
  const posts = readStore(POSTS_KEY)
  const idx = posts.findIndex(p => String(p.id) === String(postId))
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updates }
    writeStore(POSTS_KEY, posts[idx])
    return posts[idx]
  }
  return null
}

// ==================== 问答 ====================

export async function fetchQAs(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/qas`, { params })
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchQAs failed:', e.message)
  }
  return readStore(QAS_KEY)
}

export function getQAs() {
  return readStore(QAS_KEY)
}

export function saveQAs(qas) {
  writeStore(QAS_KEY, qas)
}

export function addQA(qa) {
  const qas = readStore(QAS_KEY)
  qas.unshift(qa)
  writeStore(QAS_KEY, qas)
}

// ==================== 点赞 ====================

export async function toggleLikeApi(username, itemId, itemType = 'post') {
  try {
    const res = await axios.post(`${API_BASE}/likes/toggle`, { username, itemId, itemType })
    if (res.data.success) return res.data.liked
  } catch (e) {
    console.warn('toggleLikeApi failed:', e.message)
  }
  return toggleLike(username, itemId, itemType)
}

export function getUserLikes(username) {
  const likes = readStore(LIKES_KEY)
  return likes.filter(l => l.username === username).map(l => l.itemId)
}

export function toggleLike(username, itemId, itemType = 'post') {
  const likes = readStore(LIKES_KEY)
  const existing = likes.find(l => l.username === username && l.itemId === itemId && l.type === itemType)
  if (existing) {
    writeStore(LIKES_KEY, likes.filter(l => l !== existing))
    return false
  } else {
    likes.push({ username, itemId, type: itemType })
    writeStore(LIKES_KEY, likes)
    return true
  }
}

export function isLiked(username, itemId, itemType = 'post') {
  const likes = readStore(LIKES_KEY)
  return likes.some(l => l.username === username && l.itemId === itemId && l.type === itemType)
}

// ==================== 收藏 ====================

export async function fetchCollects(username) {
  try {
    const res = await axios.get(`${API_BASE}/collects/${encodeURIComponent(username)}`)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchCollects failed:', e.message)
  }
  return readStore(COLLECTS_KEY).filter(c => c.username === username)
}

export async function toggleCollectApi(username, itemId, itemType = 'post', itemData = null) {
  try {
    const res = await axios.post(`${API_BASE}/collects/toggle`, { username, itemId, itemType, itemData })
    if (res.data.success) return res.data.collected
  } catch (e) {
    console.warn('toggleCollectApi failed:', e.message)
  }
  return toggleCollect(username, itemId, itemType)
}

export function getUserCollects(username) {
  const collects = readStore(COLLECTS_KEY)
  return collects.filter(c => c.username === username)
}

export function toggleCollect(username, itemId, itemType = 'post') {
  const collects = readStore(COLLECTS_KEY)
  const existing = collects.find(c => c.username === username && c.itemId === itemId && c.type === itemType)
  if (existing) {
    writeStore(COLLECTS_KEY, collects.filter(c => c !== existing))
    return false
  } else {
    collects.push({ username, itemId, type: itemType })
    writeStore(COLLECTS_KEY, collects)
    return true
  }
}

export function isCollected(username, itemId, itemType = 'post') {
  const collects = readStore(COLLECTS_KEY)
  return collects.some(c => c.username === username && c.itemId === itemId && c.type === itemType)
}

// ==================== 投递 ====================

export async function fetchApplies(username) {
  try {
    const res = await axios.get(`${API_BASE}/applies/${encodeURIComponent(username)}`)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchApplies failed:', e.message)
  }
  return readStore(APPLIES_KEY).filter(a => a.username === username)
}

export async function applyJobApi(username, job) {
  try {
    const res = await axios.post(`${API_BASE}/applies`, {
      username,
      jobId: job.id,
      jobData: { title: job.title, company: job.company, city: job.city, salary: job.salary }
    })
    if (res.data.success) return res.data.data
    if (res.data.message) {
      console.warn(res.data.message)
      return null
    }
  } catch (e) {
    console.warn('applyJobApi failed:', e.message)
  }
  return applyJob(username, job)
}

export function getUserApplies(username) {
  const applies = readStore(APPLIES_KEY)
  return applies.filter(a => a.username === username)
}

export function applyJob(username, job) {
  const applies = readStore(APPLIES_KEY)
  const exists = applies.some(a => a.username === username && a.jobId === job.id)
  if (exists) return null
  const record = {
    username,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    city: job.city,
    salary: job.salary,
    applyTime: new Date().toISOString(),
    id: 'apply_' + Date.now()
  }
  applies.push(record)
  writeStore(APPLIES_KEY, applies)
  return record
}

export function hasApplied(username, jobId) {
  const applies = readStore(APPLIES_KEY)
  return applies.some(a => a.username === username && a.jobId === jobId)
}

// ==================== 聊天 ====================

export async function fetchChats(username, otherName) {
  try {
    const res = await axios.get(`${API_BASE}/chats/${encodeURIComponent(username)}/${encodeURIComponent(otherName)}`)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchChats failed:', e.message)
  }
  return getChats(username, otherName)
}

export async function saveChatApi(username, otherName, messages) {
  try {
    const res = await axios.post(`${API_BASE}/chats`, { username, otherName, messages })
    if (res.data.success) return true
  } catch (e) {
    console.warn('saveChatApi failed:', e.message)
  }
  saveChat(username, otherName, messages)
  return true
}

export function getChats(username, otherName) {
  const chats = readStore(CHATS_KEY)
  const key1 = `${username}__${otherName}`
  const key2 = `${otherName}__${username}`
  const existing = chats.find(c => c.key === key1 || c.key === key2)
  return existing ? existing.messages : []
}

export function saveChat(username, otherName, messages) {
  const chats = readStore(CHATS_KEY)
  const key = [username, otherName].sort().join('__')
  const idx = chats.findIndex(c => c.key === key)
  if (idx !== -1) {
    chats[idx].messages = messages
  } else {
    chats.push({ key, participants: [username, otherName], messages })
  }
  writeStore(CHATS_KEY, chats)
}

export function addChatMessage(username, otherName, message) {
  const messages = getChats(username, otherName)
  messages.push(message)
  saveChat(username, otherName, messages)
  return messages
}

// ==================== 用户统计 ====================

export async function fetchUserStats(username) {
  try {
    const res = await axios.get(`${API_BASE}/stats/${encodeURIComponent(username)}`)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchUserStats failed:', e.message)
  }
  return { posts: 0, collects: 0, applies: 0, likes: 0, totalLikes: 0 }
}

// ==================== 清理 ====================

export function clearCommunityData() {
  localStorage.removeItem(POSTS_KEY)
  localStorage.removeItem(QAS_KEY)
  localStorage.removeItem(LIKES_KEY)
  localStorage.removeItem(COLLECTS_KEY)
  localStorage.removeItem(APPLIES_KEY)
  localStorage.removeItem(CHATS_KEY)
  localStorage.removeItem(GROUPS_KEY)
  localStorage.removeItem(GROUP_MSGS_KEY)
}

// ==================== 群聊（用户自建） ====================

export function getUserGroups() {
  return readStore(GROUPS_KEY)
}

export function saveUserGroups(groups) {
  writeStore(GROUPS_KEY, groups)
}

export function createGroup(name, desc, creator) {
  const groups = readStore(GROUPS_KEY)
  const exists = groups.find(g => g.name === name)
  if (exists) return { ok: false, msg: '已存在同名小组' }
  const group = {
    name,
    desc: desc || `${name}方向岗位讨论`,
    members: 1,
    posts: 0,
    creator: creator || '匿名用户',
    createdAt: new Date().toISOString(),
    isUserCreated: true,
    joined: true
  }
  groups.unshift(group)
  writeStore(GROUPS_KEY, groups)
  return { ok: true, group }
}

export function deleteGroup(name, creator) {
  const groups = readStore(GROUPS_KEY)
  const target = groups.find(g => g.name === name)
  if (!target) return false
  if (creator && target.creator !== creator) return false
  writeStore(GROUPS_KEY, groups.filter(g => g.name !== name))
  // 同时删掉该群的消息
  const all = readStore(GROUP_MSGS_KEY)
  writeStore(GROUP_MSGS_KEY, all.filter(m => m.groupName !== name))
  return true
}

export function getGroupMessages(groupName) {
  const all = readStore(GROUP_MSGS_KEY)
  return all.filter(m => m.groupName === groupName).sort((a, b) => a.timestamp - b.timestamp)
}

export function addGroupMessage(groupName, message) {
  const all = readStore(GROUP_MSGS_KEY)
  const msg = {
    id: 'gm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    groupName,
    timestamp: Date.now(),
    ...message
  }
  all.push(msg)
  writeStore(GROUP_MSGS_KEY, all)
  return msg
}

// ==================== 群聊 API（跨用户互通） ====================

export async function fetchGroups() {
  try {
    const res = await axios.get(`${API_BASE}/groups`)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchGroups failed:', e.message)
  }
  return []
}

export async function createGroupApi(name, desc, creator) {
  try {
    const res = await axios.post(`${API_BASE}/groups`, { name, desc, creator })
    if (res.data.success) return { ok: true, group: res.data.data }
    return { ok: false, msg: res.data.message || '创建失败' }
  } catch (e) {
    if (e.response?.status === 409) return { ok: false, msg: e.response.data.message }
    console.warn('createGroupApi failed:', e.message)
    return { ok: false, msg: '服务器错误' }
  }
}

export async function deleteGroupApi(name) {
  try {
    const res = await axios.delete(`${API_BASE}/groups/${encodeURIComponent(name)}`)
    return res.data.success
  } catch (e) {
    console.warn('deleteGroupApi failed:', e.message)
    return false
  }
}

export async function fetchGroupMessages(groupName) {
  try {
    const res = await axios.get(`${API_BASE}/groups/${encodeURIComponent(groupName)}/messages`)
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('fetchGroupMessages failed:', e.message)
  }
  return []
}

export async function sendGroupMessageApi(groupName, message) {
  try {
    const res = await axios.post(
      `${API_BASE}/groups/${encodeURIComponent(groupName)}/messages`,
      message
    )
    if (res.data.success) return res.data.data
  } catch (e) {
    console.warn('sendGroupMessageApi failed:', e.message)
  }
  return null
}
