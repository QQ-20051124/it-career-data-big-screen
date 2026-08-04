// ============================================================
// 【身份鉴权中间件 - 游客/登录用户识别】
// 前端通过 X-User-Id 请求头传递用户身份：
//   - 登录用户：发送后端返回的 userId
//   - 游客：不发送或发送空值
// 后端校验 userId 是否存在于 users.json，存在则为登录用户，否则为游客。
// 游客会话通过 X-Guest-Session 头标识（前端每次页面刷新生成新ID）。
// ============================================================

const fs = require('fs')
const path = require('path')

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json')

// 游客AI对话计数器（内存方案，服务重启清零）
// 结构: { [guestSessionId]: count }
const guestAIChatCount = {}

// 游客配额配置（统一管理，方便后续调整）
const GUEST_CONFIG = {
  MAX_AI_CHAT_ROUNDS: 3,       // 游客AI对话最大轮次
  MAX_RESOURCES_PER_SKILL: 2   // 游客每个技能最多展示资源数
}

// 加载用户数据
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { users: [] }
  }
}

// 验证 userId 是否为已注册用户
function isValidUser(userId) {
  if (!userId) return false
  const data = loadUsers()
  return data.users.some(u => u.id === userId)
}

// ============================================================
// 身份识别中间件
// 所有需要鉴权的接口挂载此中间件
// 在 req 上注入 user 对象：{ isGuest, userId, guestSessionId }
// ============================================================
function identifyUser(req, res, next) {
  const userId = req.headers['x-user-id'] || ''
  const guestSessionId = req.headers['x-guest-session'] || ''

  if (userId && isValidUser(userId)) {
    // 已登录用户
    req.user = { isGuest: false, userId, guestSessionId: '' }
  } else {
    // 游客
    req.user = { isGuest: true, userId: '', guestSessionId: guestSessionId || 'anonymous' }
  }

  next()
}

// ============================================================
// 游客AI对话次数校验
// 返回 { allowed: true/false, used: number, limit: number }
// ============================================================
function checkGuestAIChat(guestSessionId) {
  const used = guestAIChatCount[guestSessionId] || 0
  const limit = GUEST_CONFIG.MAX_AI_CHAT_ROUNDS
  return {
    allowed: used < limit,
    used,
    limit
  }
}

// 游客AI对话次数+1
function incrementGuestAIChat(guestSessionId) {
  guestAIChatCount[guestSessionId] = (guestAIChatCount[guestSessionId] || 0) + 1
  return guestAIChatCount[guestSessionId]
}

// 获取游客资源限制
function getGuestResourceLimit() {
  return GUEST_CONFIG.MAX_RESOURCES_PER_SKILL
}

// ============================================================
// 游客资源截断工具
// 对每个技能的资源列表按上限截断，并附加 truncated 标记
// 供前端判断是否展示"解锁更多资源"提示
// ============================================================
function truncateResourcesForGuest(resourcesBySkill, limit) {
  const max = limit || GUEST_CONFIG.MAX_RESOURCES_PER_SKILL
  const result = {}
  for (const [skillName, payload] of Object.entries(resourcesBySkill)) {
    // 兼容两种数据结构：① 直接是数组 ② { resources: [...], ... }
    const list = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.resources) ? payload.resources : [])
    const fullCount = list.length
    const truncatedList = list.slice(0, max)
    if (Array.isArray(payload)) {
      result[skillName] = {
        resources: truncatedList,
        truncated: fullCount > max,
        totalCount: fullCount,
        guestLimit: max
      }
    } else {
      result[skillName] = {
        ...payload,
        resources: truncatedList,
        truncated: fullCount > max,
        totalCount: fullCount,
        guestLimit: max
      }
    }
  }
  return result
}

// ============================================================
// 登录用户专属接口拦截中间件
// 游客请求被直接拒绝，返回标准提示信息（不抛 500，便于前端处理）
// 用于：收藏、保存路线、导出报告等接口
// ============================================================
function requireUser(req, res, next) {
  // 先调用 identifyUser 完成身份识别（支持链式调用：requireUser 之前已挂 identifyUser 时复用 req.user）
  if (!req.user) {
    identifyUser(req, res, () => {})
  }
  if (req.user && !req.user.isGuest) {
    return next()
  }
  return res.status(403).json({
    success: false,
    code: 'GUEST_FORBIDDEN',
    message: '游客模式功能受限，请登录账号解锁完整功能'
  })
}

module.exports = {
  identifyUser,
  requireUser,
  checkGuestAIChat,
  incrementGuestAIChat,
  getGuestResourceLimit,
  truncateResourcesForGuest,
  GUEST_CONFIG
}
