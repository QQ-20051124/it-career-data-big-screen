const POSTS_KEY = 'community_posts'
const QAS_KEY = 'community_qas'
const LIKES_KEY = 'community_likes'
const COLLECTS_KEY = 'community_collects'
const APPLIES_KEY = 'community_applies'
const CHATS_KEY = 'community_chats'

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

export function getPosts() {
  return readStore(POSTS_KEY)
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

export function clearCommunityData() {
  localStorage.removeItem(POSTS_KEY)
  localStorage.removeItem(QAS_KEY)
  localStorage.removeItem(LIKES_KEY)
  localStorage.removeItem(COLLECTS_KEY)
  localStorage.removeItem(APPLIES_KEY)
  localStorage.removeItem(CHATS_KEY)
}
