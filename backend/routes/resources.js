const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

const { identifyUser, truncateResourcesForGuest, getGuestResourceLimit } = require('../middleware/auth')

const RESOURCES_FILE = path.join(__dirname, '..', 'data', 'learning-resources.json')

// 来源优先级（数值越小优先级越高）：官方文档 > B站/GitHub/技术站点 > 在线课程 > B站搜索页/个人站点
const SOURCE_PRIORITY = {
  official: 1,
  bilibili: 2,
  github: 2,
  'tech-site': 2,
  course: 3,
  'bilibili-search': 4,
  personal: 4
}

// 连续失败多少次后判定为失效（避免偶发网络抖动误杀）
const FAIL_THRESHOLD = 3
// 单链接校验超时（毫秒）
const CHECK_TIMEOUT = 10000

let inspectionTimer = null

// ============================================================
// 【资源库读写】
// ============================================================
function loadResources() {
  try {
    const raw = fs.readFileSync(RESOURCES_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('[Resources] 加载资源库失败:', e.message)
    return { version: '1.0', lastInspection: '', inspectionIntervalHours: 24, sourcePriority: SOURCE_PRIORITY, resources: [] }
  }
}

function saveResources(data) {
  try {
    fs.writeFileSync(RESOURCES_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('[Resources] 保存资源库失败:', e.message)
  }
}

// ============================================================
// 【Coze 配置 - 二级 AI 资源生成】
// 统一使用 Coze 智能体补充生成资源
// ============================================================
const COZE_API_KEY = process.env.COZE_API_KEY
const COZE_BOT_ID = process.env.COZE_BOT_ID
const COZE_API_BASE = process.env.COZE_API_BASE || 'https://api.coze.cn'
const COZE_TIMEOUT = 20000

// 本地知识库（resourcePool 主数据源 + positions 兜底数据源）
const KNOWLEDGE_BASE_FILE = path.join(__dirname, '..', 'data', 'local-knowledge-base.json')
let knowledgeBaseCache = null
function loadKnowledgeBase() {
  if (knowledgeBaseCache) return knowledgeBaseCache
  try {
    knowledgeBaseCache = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_FILE, 'utf-8'))
  } catch {
    knowledgeBaseCache = { positions: [], resourcePool: [] }
  }
  return knowledgeBaseCache
}

// 资源池（L1 主数据源）
// 合并两个来源：local-knowledge-base.json 的 resourcePool + learning-resources.json 的 resources
// learning-resources.json 包含 174 条带 skillTags 的静态资源，是精准匹配的主要数据源
// local-knowledge-base.json 的 resourcePool 用于存储巡检后动态更新的资源
function loadResourcePool() {
  const kb = loadKnowledgeBase()
  const kbPool = kb.resourcePool || []
  // 加载静态资源库（learning-resources.json）
  const staticData = loadResources()
  const staticPool = staticData.resources || []
  // 合并去重（按 url 去重，kbPool 优先级更高——可能包含更新后的 status）
  const seen = new Set()
  const merged = []
  for (const r of kbPool) {
    const key = r.url || r.id
    if (key && !seen.has(key)) {
      seen.add(key)
      merged.push(r)
    }
  }
  for (const r of staticPool) {
    const key = r.url || r.id
    if (key && !seen.has(key)) {
      seen.add(key)
      merged.push(r)
    }
  }
  return merged
}

// 保存资源池（巡检后更新 status）
function saveResourcePool(pool) {
  try {
    const kb = loadKnowledgeBase()
    kb.resourcePool = pool
    fs.writeFileSync(KNOWLEDGE_BASE_FILE, JSON.stringify(kb, null, 2), 'utf-8')
    knowledgeBaseCache = kb  // 刷新缓存
  } catch (e) {
    console.error('[Resources] 保存资源池失败:', e.message)
  }
}

// 岗位技能数据（自检端点数据源）
const POSITION_SKILLS_FILE = path.join(__dirname, '..', 'data', 'position-skills.json')
let positionSkillsCache = null
function loadPositionSkills() {
  if (positionSkillsCache) return positionSkillsCache
  try {
    positionSkillsCache = JSON.parse(fs.readFileSync(POSITION_SKILLS_FILE, 'utf-8'))
  } catch {
    positionSkillsCache = { positionGroups: [], positionSkillMap: {} }
  }
  return positionSkillsCache
}

// ============================================================
// 【第二层链接校验 - 实时快速探测 + 缓存】
// 接口返回前实时探测链接状态，缓存 3 小时避免重复请求
// 仅 404 判定失效过滤；超时/403 视为可访问（不误杀）
// ============================================================
const linkCheckCache = new Map()
const LINK_CACHE_TTL = 3 * 60 * 60 * 1000
const QUICK_CHECK_TIMEOUT = 6000

async function quickCheckLink(url) {
  const cached = linkCheckCache.get(url)
  if (cached && Date.now() - cached.timestamp < LINK_CACHE_TTL) {
    return cached.status
  }
  const result = await checkLink(url, QUICK_CHECK_TIMEOUT)
  const status = result.status === 'invalid' ? 'invalid' : 'valid'
  linkCheckCache.set(url, { status, timestamp: Date.now() })
  return status
}

// 批量实时校验：过滤掉 404 失效链接，主链失效时自动切换备用链接（双层链接校验）
async function filterValidResources(resources) {
  if (!resources || resources.length === 0) return []
  const checks = await Promise.all(
    resources.map(async r => {
      try {
        const status = await quickCheckLink(r.url)
        if (status === 'valid') return r
        // 主链失效，尝试备用链接（动态替换同技能下备用有效资源）
        if (r.backupUrl) {
          const backupStatus = await quickCheckLink(r.backupUrl)
          if (backupStatus === 'valid') {
            return { ...r, url: r.backupUrl, backupUrl: r.url }
          }
        }
        return null
      } catch {
        return r // 校验异常时保留，避免误删
      }
    })
  )
  return checks.filter(Boolean)
}

// 判断资源集合是否满足硬性规范：至少 1 文档 + 1 视频
function hasTextAndVideo(resources) {
  const hasText = resources.some(r => isTextType(r.type))
  const hasVideo = resources.some(r => isVideoType(r.type))
  return hasText && hasVideo && resources.length >= 2
}

function isTextType(type) {
  const t = String(type || '').toLowerCase()
  return t.includes('文档') || t.includes('教程') || t.includes('doc') || t.includes('官方')
}
function isVideoType(type) {
  const t = String(type || '').toLowerCase()
  return t.includes('视频') || t.includes('video') || t.includes('b站')
}
function isPracticeType(type) {
  const t = String(type || '').toLowerCase()
  return t.includes('实战') || t.includes('项目') || t.includes('practice')
}

// ============================================================
// 【二级兜底 - Coze 智能体生成学习资源】
// 调用 Coze 为单个技能生成权威学习资源（1文档+1视频+实战项目）
// 失败时返回 null，由三级兜底接管（前端不报错）
// ============================================================
async function generateCozeResources(skillName, positionKey) {
  if (!COZE_API_KEY || !COZE_BOT_ID) {
    console.warn('[Resources][L2] Coze 配置缺失（COZE_API_KEY/COZE_BOT_ID），跳过 AI 生成')
    return null
  }

  const prompt = `你是计算机技术学习资源推荐专家。请为技能「${skillName}」（岗位方向：${positionKey || '通用'}）生成 JSON 格式的权威学习资源。

严格要求：
1. 必须返回 JSON 格式，不要任何其他文字
2. 资源与「${skillName}」强相关，禁止无关内容
3. 固定包含3条资源：1条官方文档类 + 1条B站单视频(必须是 bilibili.com/video/ 直链，禁止搜索页) + 1条GitHub开源实战项目
4. URL 必须真实可访问，2022年后的教程，禁止网盘/短链/需登录站点
5. 每条资源附带简短导读说明学习目标

返回格式：
{"resources":[{"title":"资源标题","url":"https://真实链接","backupUrl":"备用链接或空","source":"official|bilibili|github","type":"官方文档|视频课程|实战项目","level":"入门|进阶","desc":"简短导读","practicePlan":["步骤1","步骤2"],"recommendedTools":["工具1"]}]}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), COZE_TIMEOUT)

    const response = await fetch(`${COZE_API_BASE}/v3/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: COZE_BOT_ID,
        user_id: 'resource-gen-' + (positionKey || 'default'),
        stream: false,
        auto_save_history: false,
        additional_messages: [
          { role: 'user', content: prompt, content_type: 'text' }
        ]
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`[Resources][L2] Coze HTTP ${response.status}（可能无积分/令牌失效）`)
      return null
    }

    const data = await response.json()

    // 提取 Coze 返回的文本内容（兼容 v3/chat 多种返回格式）
    let content = ''
    if (data?.data?.content) {
      content = data.data.content
    } else if (Array.isArray(data?.data) && data.data.length > 0) {
      content = data.data.map(item => item.content || item.answer || '').join('')
    } else if (data?.content) {
      content = data.content
    }

    // 从文本中解析 JSON
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (!match) {
        console.warn('[Resources][L2] Coze 返回内容无法解析为 JSON')
        return null
      }
      try {
        parsed = JSON.parse(match[0])
      } catch {
        console.warn('[Resources][L2] Coze 返回 JSON 解析失败')
        return null
      }
    }

    const list = parsed.resources || parsed.data || []
    if (!Array.isArray(list) || list.length === 0) return null

    const result = list
      .filter(r => r.url && /^https?:\/\//i.test(r.url))
      .map((r, i) => ({
        id: 'coze_' + Date.now() + '_' + i,
        title: r.title || `${skillName} 学习资源`,
        url: r.url,
        backupUrl: r.backupUrl || '',
        source: detectSource(r.url, r.type),
        sourceName: detectSourceName(r.url),
        type: normalizeType(r.type),
        level: r.level || '入门',
        desc: r.desc || '',
        skillTags: [skillName],
        practicePlan: Array.isArray(r.practicePlan) ? r.practicePlan : [],
        recommendedTools: Array.isArray(r.recommendedTools) ? r.recommendedTools : [],
        status: 'valid',
        lastChecked: '',
        failCount: 0
      }))

    console.log(`[Resources][L2] Coze 为「${skillName}」生成 ${result.length} 条资源`)
    return result.length > 0 ? result : null
  } catch (e) {
    console.warn('[Resources][L2] Coze 调用失败:', e.name === 'AbortError' ? '超时' : e.message)
    return null
  }
}

// 根据 URL 推断来源
function detectSource(url, type) {
  const u = String(url).toLowerCase()
  if (u.includes('bilibili.com')) return 'bilibili'
  if (isVideoType(type)) return 'bilibili'
  if (u.includes('runoob.com') || u.includes('juejin.cn') || u.includes('zhihu.com') || u.includes('csdn.net')) return 'tech-site'
  if (u.includes('github.io') || u.includes('gitee.io')) return 'personal'
  return 'official'
}
function detectSourceName(url) {
  const u = String(url).toLowerCase()
  if (u.includes('bilibili.com')) return '哔哩哔哩'
  if (u.includes('runoob.com')) return '菜鸟教程'
  if (u.includes('developer.mozilla.org')) return 'MDN'
  if (u.includes('juejin.cn')) return '掘金'
  if (u.includes('zhihu.com')) return '知乎'
  if (u.includes('csdn.net')) return 'CSDN'
  try { return new URL(url).hostname.replace('www.', '') } catch { return '在线资源' }
}
function normalizeType(type) {
  const t = String(type || '')
  if (isVideoType(t)) return '视频'
  if (isPracticeType(t)) return '实战项目'
  return '文档'
}

// ============================================================
// 【三级兜底 - 本地静态知识库内置备用资源】
// 从 local-knowledge-base.json 读取岗位内置资源 + 兜底通用资源
// 保证页面永远不会出现无资源空白
// ============================================================
function getKnowledgeBaseFallback(positionKey, skillName) {
  const kb = loadKnowledgeBase()
  const results = []

  // 1. 从知识库岗位资源中匹配技能相关资源
  for (const pos of (kb.positions || [])) {
    if (positionKey && pos.position !== positionKey && !positionKey.includes(pos.position) && !pos.position.includes(positionKey)) {
      continue
    }
    for (const res of (pos.resources || [])) {
      // 资源名包含技能关键词则视为相关
      if (isSkillRelevant(res.name, skillName)) {
        results.push({
          id: 'kb_' + (res.name || '').slice(0, 8) + '_' + Math.random().toString(36).slice(2, 5),
          title: res.name || `${skillName} 学习资源`,
          url: res.url,
          source: detectSource(res.url, res.type),
          sourceName: detectSourceName(res.url),
          type: normalizeType(res.type),
          level: res.level || '入门',
          skillTags: [skillName],
          status: 'valid',
          lastChecked: '',
          failCount: 0
        })
      }
    }
  }

  // 2. 终极兜底：B站搜索链接（永远有效，保证不空白）
  if (results.length === 0) {
    results.push({
      id: 'fallback_bili_' + Date.now(),
      title: `B站搜索：${skillName} 教程`,
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(skillName + ' 教程')}`,
      source: 'bilibili',
      sourceName: '哔哩哔哩',
      type: '视频',
      level: '入门',
      skillTags: [skillName],
      status: 'valid',
      lastChecked: '',
      failCount: 0,
      desc: `通过B站搜索「${skillName}」相关视频教程，选择播放量高、最新发布的资源学习`
    })
    results.push({
      id: 'fallback_search_' + Date.now(),
      title: `搜索引擎：${skillName} 官方文档`,
      url: `https://www.bing.com/search?q=${encodeURIComponent(skillName + ' 官方文档 教程')}`,
      source: 'tech-site',
      sourceName: 'Bing搜索',
      type: '文档',
      level: '入门',
      skillTags: [skillName],
      status: 'valid',
      lastChecked: '',
      failCount: 0,
      desc: `通过搜索引擎查找「${skillName}」官方文档与权威教程`
    })
  }

  return results
}

// 技能相关性判断（用于知识库资源匹配）
function isSkillRelevant(resourceName, skillName) {
  if (!resourceName || !skillName) return false
  const name = String(resourceName).toLowerCase()
  const skill = String(skillName).toLowerCase()
  // 技能名分词匹配
  const tokens = skill.split(/[\/\s,，、（）()]+/).filter(t => t.length > 1)
  return tokens.some(t => name.includes(t)) || name.includes(skill)
}

// ============================================================
// 【三级资源匹配核心算法】
// 一级：本地 resourcePool 精准匹配 + 实时链接校验
// 二级：Coze 智能体补充生成（一级不足时）
// 三级：本地知识库兜底（Coze 失败/无积分/令牌失效时，仅展示本地资源，绝不空白）
// 返回: { resources, source, practiceTip, tools, usedFallback }
// ============================================================
async function matchSkillResources(skillName, positionKey, options = {}) {
  const { skipCoze = false, skipLinkCheck = false } = options

  // 闭包：固定 skillName 和 positionKey，每个资源自动生成 duration/practicePlan/tools
  const sanitize = (r) => sanitizeResource(r, skillName, positionKey)

  // ===== 一级匹配：本地资源池精准匹配 =====
  const pool = loadResourcePool()
  const dbMatched = pool.filter(r => isSkillMatched(r, skillName) && r.status !== 'invalid')

  // 第二层实时校验：过滤失效链接（自检模式可跳过以加速）
  let validResources = skipLinkCheck ? dbMatched : await filterValidResources(dbMatched)

  // 一级满足条件（至少1文档+1视频）→ 直接返回
  if (hasTextAndVideo(validResources)) {
    return {
      resources: sortBySourcePriority(validResources).map(sanitize),
      source: 'level1',
      practiceTip: buildPracticeTip(skillName, validResources),
      tools: buildTools(skillName, positionKey, validResources),
      usedFallback: false
    }
  }

  // ===== 二级兜底：Coze 智能体生成（自检模式跳过，避免 Coze 超时拖慢全量检测） =====
  let merged = [...validResources]
  if (!skipCoze) {
    console.log(`[Resources][L2] 「${skillName}」一级资源不足(${validResources.length}条)，启用 Coze 生成`)
    const cozeResources = await generateCozeResources(skillName, positionKey)
    if (cozeResources && cozeResources.length > 0) {
      // 实时校验 Coze 生成的链接
      const cozeValid = skipLinkCheck ? cozeResources : await filterValidResources(cozeResources)
      merged = dedupeResources([...validResources, ...cozeValid])

      if (hasTextAndVideo(merged)) {
        return {
          resources: sortBySourcePriority(merged).map(sanitize),
          source: 'level2',
          practiceTip: buildPracticeTip(skillName, merged),
          tools: buildTools(skillName, positionKey, merged),
          usedFallback: true
        }
      }
    }
  }

  // ===== 三级兜底：本地知识库（仅展示本地资源，绝不空白） =====
  console.log(`[Resources][L3] 「${skillName}」Coze 不可用或不足，启用本地兜底`)
  const kbResources = getKnowledgeBaseFallback(positionKey, skillName)
  merged = dedupeResources([...merged, ...kbResources])

  // 注意：不再从资源池拉取无关资源填充数量（避免「资源不匹配」问题）
  // B站搜索 + 搜索引擎兜底已保证至少 1 文档 + 1 视频，且与技能强相关

  // 极端兜底：仍为空则注入搜索引擎链接（保证页面不空白）
  if (merged.length === 0) {
    merged = getKnowledgeBaseFallback(null, skillName)
  }

  return {
    resources: sortBySourcePriority(merged).map(sanitize),
    source: 'level3',
    practiceTip: buildPracticeTip(skillName, merged),
    tools: buildTools(skillName, positionKey, merged),
    usedFallback: true
  }
}

// 资源去重（按 URL）
function dedupeResources(resources) {
  const seen = new Set()
  return resources.filter(r => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
}

// 实践练习方案生成（优先从资源 practicePlan 提取，无则用通用方案）
function buildPracticeTip(skillName, resources) {
  if (resources && resources.length > 0) {
    const withPlan = resources.find(r => Array.isArray(r.practicePlan) && r.practicePlan.length > 0)
    if (withPlan) {
      return withPlan.practicePlan.join('；')
    }
  }
  return `针对「${skillName}」：①跟学官方文档核心概念；②动手完成 1-2 个小型实战项目；③在 LeetCode/牛客网做相关题目巩固；④阅读优质开源项目源码学习工程实践`
}

// 推荐工具生成（优先从资源 recommendedTools 提取，无则从岗位 tools 提取）
function buildTools(skillName, positionKey, resources) {
  if (resources && resources.length > 0) {
    const withTools = resources.find(r => Array.isArray(r.recommendedTools) && r.recommendedTools.length > 0)
    if (withTools) {
      return withTools.recommendedTools.slice(0, 6)
    }
  }
  const kb = loadKnowledgeBase()
  const pos = (kb.positions || []).find(p => p.position === positionKey)
  if (pos && pos.tools && Array.isArray(pos.tools) && pos.tools.length > 0) {
    return pos.tools.slice(0, 6)
  }
  return ['VS Code', 'Git', 'Chrome DevTools', 'Postman']
}

// ============================================================
// 【链接可用性校验】
// 返回: { status: 'valid' | 'invalid' | 'unknown', code, reason }
// - 2xx/3xx → valid
// - 404 → invalid（明确失效）
// - 403/429 → unknown（可能被反爬，不代表失效）
// - 超时/网络错误 → unknown
// - 其他5xx → unknown（可能是临时故障）
// ============================================================
async function checkLink(url, timeout) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout || CHECK_TIMEOUT)

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })

    clearTimeout(timeoutId)

    if (response.status === 404) {
      return { status: 'invalid', code: 404, reason: 'Not Found' }
    }
    if (response.status >= 200 && response.status < 400) {
      return { status: 'valid', code: response.status, reason: 'OK' }
    }
    if (response.status === 403 || response.status === 429) {
      return { status: 'unknown', code: response.status, reason: 'blocked_by_anti_crawler' }
    }
    return { status: 'unknown', code: response.status, reason: `http_${response.status}` }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return { status: 'unknown', code: 0, reason: 'timeout' }
    }
    return { status: 'unknown', code: 0, reason: error.message }
  }
}

// ============================================================
// 【标签匹配】精准匹配：资源 skillTags 与请求技能名精确一致（忽略大小写与首尾空格）
// 支持组合技能名拆分匹配（如 "Docker/K8s" → 分别匹配 "Docker"、"K8s"）
// 禁止模糊包含匹配，避免推送无关内容
// ============================================================

// 常见技能别名映射（小写）：键为技能简称/别名，值为资源池中使用的标准标签
const SKILL_ALIASES = {
  'k8s': 'kubernetes',
  'vue': 'vue.js',
  'react.js': 'react',
  'css3': 'css',
  'html5': 'html',
  'es6+': 'javascript',
  'es6': 'javascript',
  'ts': 'typescript',
  'js': 'javascript',
  'node': 'node.js',
  'nodejs': 'node.js',
  'pg': 'postgresql',
  'psql': 'postgresql',
  'tf': 'tensorflow',
  'py': 'python',
  'go': 'golang',
  'k3s': 'kubernetes',
  'tfjs': 'tensorflow.js',
  'rn': 'react native',
  'ng': 'angular',
  'vue3': 'vue.js',
  'vue2': 'vue.js',
  'springboot': 'spring boot',
  'springcloud': 'spring cloud',
  'mybatis': 'mybatis',
  'jpa': 'jpa',
  'redis集群': 'redis',
  'mq': 'rabbitmq',
  'k8s/docker': 'kubernetes',
  'docker/k8s': 'docker',
  'ci/cd': 'ci/cd',
  'devops': 'devops'
}

function isSkillMatched(resource, skillName) {
  if (!resource.skillTags || !Array.isArray(resource.skillTags)) return false
  const tags = resource.skillTags.map(tag => String(tag).trim().toLowerCase())
  const normalizedSkill = String(skillName).trim().toLowerCase()

  // 1. 精确全等匹配（最高优先级）
  if (tags.includes(normalizedSkill)) return true

  // 2. 别名直接匹配
  const alias = SKILL_ALIASES[normalizedSkill]
  if (alias && tags.includes(alias)) return true

  // 3. 组合技能名拆分匹配（如 "Docker/K8s" → ["docker", "k8s"]）
  //    每个拆分项仍走精确匹配 + 别名匹配，保证精准度
  const tokens = normalizedSkill.split(/[\/\s,，、（）()]+/).filter(t => t.length > 1)
  for (const token of tokens) {
    if (tags.includes(token)) return true
    const tokenAlias = SKILL_ALIASES[token]
    if (tokenAlias && tags.includes(tokenAlias)) return true
  }

  return false
}

// 按来源优先级排序资源
function sortBySourcePriority(resources) {
  return resources.sort((a, b) => {
    const pa = SOURCE_PRIORITY[a.source] || 99
    const pb = SOURCE_PRIORITY[b.source] || 99
    if (pa !== pb) return pa - pb
    return 0
  })
}

// ============================================================
// 【接口1】标签匹配查询：根据技能列表返回对应资源
// POST /api/resources/match
// body: { skills: ["HTML5/CSS3", "Vue.js", ...] }
// 返回: { [skillName]: [ {id,title,url,source,sourceName,type,level,status}, ... ] }
// 仅返回 status=valid 的资源；invalid/unknown 的不展示或在前端置灰
// 游客身份：后端主动截断，每个技能仅返回最多 MAX_RESOURCES_PER_SKILL 条
// ============================================================
router.post('/match', identifyUser, (req, res) => {
  try {
    const { skills } = req.body
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: '技能列表不能为空' })
    }

    const pool = loadResourcePool()
    const result = {}

    for (const skillName of skills) {
      const matched = pool.filter(r => isSkillMatched(r, skillName))
      // 仅保留有效资源用于展示，失效资源单独返回以便前端置灰
      const valid = matched.filter(r => r.status !== 'invalid')
      const invalid = matched.filter(r => r.status === 'invalid')
      result[skillName] = {
        valid: sortBySourcePriority(valid).map(sanitizeResource),
        invalid: sortBySourcePriority(invalid).map(sanitizeResource)
      }
    }

    // 游客资源截断（防止前端作弊：后端只返回受限数量）
    const isGuest = req.user && req.user.isGuest
    if (isGuest) {
      const limit = getGuestResourceLimit()
      const truncated = {}
      for (const [skillName, payload] of Object.entries(result)) {
        const validList = payload.valid || []
        const totalCount = validList.length
        truncated[skillName] = {
          valid: validList.slice(0, limit),
          invalid: [],
          truncated: totalCount > limit,
          totalCount,
          guestLimit: limit
        }
      }
      console.log(`[Resources] 游客请求 /match，已按每技能最多 ${limit} 条截断`)
      return res.json({ success: true, data: truncated, isGuest: true })
    }

    res.json({ success: true, data: result, isGuest: false })
  } catch (e) {
    console.error('[Resources] 标签匹配查询失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 根据资源的 level 和 type 自动估算学习时长（分钟）
function estimateDuration(level, type) {
  const levelDurations = {
    '入门': 30, '基础': 30, '初级': 30,
    '进阶': 60, '中级': 60,
    '实战': 90, '高级': 90, '专家': 120
  }
  const typeMultiplier = {
    '官方文档': 1.2, '视频课程': 1.0, '在线教程': 1.0,
    '图书': 1.5, '面试题': 0.5, '项目实战': 2.0,
    '博客': 0.6, '技术文章': 0.8
  }
  const base = levelDurations[level] || 45
  const mult = typeMultiplier[type] || 1.0
  return Math.round(base * mult)
}

// 根据资源类型生成实践练习方案
function generatePracticePlan(resource, skillName) {
  if (resource.practicePlan && resource.practicePlan.length > 0) {
    return resource.practicePlan
  }
  const type = resource.type || ''
  const level = resource.level || ''
  const name = resource.title || ''

  if (type.includes('官方文档') || type.includes('文档')) {
    return [
      `阅读「${name}」前 3 个核心章节，做好笔记`,
      `完成文档中的代码示例并本地运行`,
      '基于文档内容回答 3 个思考题',
      '总结文档中的关键 API 和最佳实践'
    ]
  } else if (type.includes('视频') || type.includes('课程')) {
    return [
      `完整观看「${name}」，记录关键知识点`,
      '暂停视频同步敲代码，跟随老师完成实战项目',
      '在评论区回答 1 个同学的问题巩固理解',
      '整理学习笔记，分享到技术社区'
    ]
  } else if (type.includes('在线教程') || type.includes('博客')) {
    return [
      `通读「${name}」，标记不理解的部分`,
      '完成教程中的代码练习和实战项目',
      '查阅延伸阅读资料加深理解',
      '写一篇学习总结博客'
    ]
  } else if (type.includes('项目') || type.includes('实战')) {
    return [
      '分析项目需求和技术架构',
      '搭建项目骨架和核心模块',
      '实现核心功能并调试',
      '部署项目并编写 README 文档'
    ]
  }

  return [
    `学习「${skillName}」核心概念，参考「${name}」`,
    '完成 1-2 个小型实战项目巩固知识',
    '在 LeetCode/牛客网做相关题目',
    '阅读开源项目源码学习工程实践'
  ]
}

// 根据资源和技能生成推荐工具
function generateTools(resource, skillName, positionKey) {
  if (resource.recommendedTools && resource.recommendedTools.length > 0) {
    return resource.recommendedTools.slice(0, 6)
  }
  const toolsByCategory = {
    'frontend': ['VS Code', 'Chrome DevTools', 'GitHub', 'Node.js', 'npm/pnpm', 'Vite/Webpack'],
    'backend': ['VS Code', 'Postman', 'Docker', 'MySQL', 'Redis', 'Git'],
    'ai': ['Jupyter Notebook', 'PyTorch', 'TensorFlow', 'VS Code', 'Datasets', 'Weights & Biases'],
    'mobile': ['Android Studio', 'Xcode', 'VS Code', 'Gradle', 'CocoaPods', 'Firebase'],
    'devops': ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Prometheus', 'Grafana'],
    'game': ['Unity', 'Unreal Engine', 'VS Code', 'Visual Studio', 'Git', 'Perforce'],
    'security': ['Burp Suite', 'Wireshark', 'Metasploit', 'Nmap', 'Postman', 'Docker'],
    'data': ['Jupyter Notebook', 'DBeaver', 'DataGrip', 'Tableau', 'Power BI', 'Apache Spark']
  }
  if (positionKey && toolsByCategory[positionKey]) {
    return toolsByCategory[positionKey]
  }
  // 通用工具
  return ['VS Code', 'Git', 'Chrome', 'Postman', 'Docker', 'GitHub']
}

// 脱敏输出（不暴露 failCount 等内部字段，保留前端需要的 practicePlan/recommendedTools/duration
function sanitizeResource(r, skillName, positionKey) {
  const duration = r.duration || estimateDuration(r.level, r.type)
  return {
    id: r.id,
    title: r.title,
    url: r.url,
    backupUrl: r.backupUrl || '',
    source: r.source,
    sourceName: r.sourceName,
    type: r.type,
    level: r.level,
    status: r.status,
    desc: r.desc || '',
    skillTags: Array.isArray(r.skillTags) ? r.skillTags : [],
    duration,
    practicePlan: generatePracticePlan(r, skillName),
    recommendedTools: generateTools(r, skillName, positionKey),
    lastChecked: r.lastChecked
  }
}

// ============================================================
// 【接口1.5】三级资源匹配（岗位联动核心接口）
// POST /api/resources/match-position
// body: { positionKey: "frontend", skills: [{name, level}, ...] }
// 返回: { [skillName]: { resources, source, practiceTip, tools, usedFallback } }
// 三级匹配：DB精准→AI生成→知识库兜底，保证永不空白
// 游客身份：后端主动截断，每个技能仅返回最多 MAX_RESOURCES_PER_SKILL 条
// ============================================================
router.post('/match-position', identifyUser, async (req, res) => {
  try {
    const { positionKey, skills } = req.body
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: '技能列表不能为空' })
    }

    console.log(`[Resources] 岗位「${positionKey || '未知'}」三级匹配开始，共 ${skills.length} 个技能`)

    const result = {}
    // 并行匹配所有技能（控制并发，每个技能独立走三级流程）
    const matchTasks = skills.map(async (skillItem) => {
      const skillName = typeof skillItem === 'string' ? skillItem : skillItem.name
      try {
        const matched = await matchSkillResources(skillName, positionKey)
        return [skillName, matched]
      } catch (e) {
        // 单技能匹配异常：走终极兜底，保证不空白
        console.error(`[Resources] 技能「${skillName}」匹配异常:`, e.message)
        const fallback = getKnowledgeBaseFallback(positionKey, skillName)
        return [skillName, {
          resources: sortBySourcePriority(fallback).map(sanitizeResource),
          source: 'level3',
          practiceTip: buildPracticeTip(skillName),
          tools: buildTools(skillName, positionKey),
          usedFallback: true
        }]
      }
    })

    const matches = await Promise.all(matchTasks)
    for (const [skillName, matched] of matches) {
      result[skillName] = matched
    }

    // 统计日志（仅后端记录，前端无感）
    const tierStats = { level1: 0, level2: 0, level3: 0 }
    let totalResources = 0
    for (const m of Object.values(result)) {
      tierStats[m.source] = (tierStats[m.source] || 0) + 1
      totalResources += m.resources.length
    }
    console.log(`[Resources] 三级匹配完成: L1=${tierStats.level1} L2=${tierStats.level2} L3=${tierStats.level3} 总资源=${totalResources}`)

    // 游客资源截断（防止前端作弊：后端只返回受限数量，并附加 truncated 标记）
    const isGuest = req.user && req.user.isGuest
    if (isGuest) {
      const limit = getGuestResourceLimit()
      const truncatedData = truncateResourcesForGuest(result, limit)
      console.log(`[Resources] 游客请求 /match-position，已按每技能最多 ${limit} 条截断`)
      return res.json({ success: true, data: truncatedData, stats: tierStats, isGuest: true })
    }

    res.json({ success: true, data: result, stats: tierStats, isGuest: false })
  } catch (e) {
    console.error('[Resources] 三级匹配失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// ============================================================
// 【接口2】单链接预校验：入库前自动检测可用性
// POST /api/resources/validate
// body: { url }
// 404/明确失效 → 拒绝入库；valid/unknown → 允许入库
// ============================================================
router.post('/validate', async (req, res) => {
  try {
    const { url } = req.body
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, message: '请提供合法的 http(s) 链接' })
    }

    const result = await checkLink(url)

    if (result.status === 'invalid') {
      return res.json({
        success: false,
        valid: false,
        message: `链接不可用（HTTP ${result.code}：${result.reason}），禁止存入资源库`,
        detail: result
      })
    }

    return res.json({
      success: true,
      valid: true,
      status: result.status,
      message: result.status === 'valid' ? '链接可用，允许入库' : '链接可访问（状态未知），允许入库但需后续巡检',
      detail: result
    })
  } catch (e) {
    console.error('[Resources] 校验失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// ============================================================
// 【接口3】新增资源（入库前自动预校验）
// POST /api/resources/add
// body: { title, url, source, sourceName, type, level, skillTags }
// 规范来源优先级：拒绝 personal/GitHub Pages 类易失效链接
// ============================================================
router.post('/add', async (req, res) => {
  try {
    const { title, url, source, sourceName, type, level, skillTags } = req.body

    if (!title || !url) {
      return res.status(400).json({ success: false, message: '资源标题和链接不能为空' })
    }
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, message: '请提供合法的 http(s) 链接' })
    }
    if (!Array.isArray(skillTags) || skillTags.length === 0) {
      return res.status(400).json({ success: false, message: '必须绑定至少一个标准化技能标签' })
    }

    // 规范来源优先级：减少 GitHub Pages 个人站点等易失效链接
    if (source === 'personal') {
      return res.status(400).json({
        success: false,
        message: '不推荐入库个人站点/GitHub Pages 类易失效链接，请优先使用官方文档、B站视频或长期稳定技术站点'
      })
    }

    // 预校验链接可用性
    const checkResult = await checkLink(url)
    if (checkResult.status === 'invalid') {
      return res.json({
        success: false,
        message: `链接预校验失败（HTTP ${checkResult.code}），404或无法访问的链接禁止存入资源库`,
        detail: checkResult
      })
    }

    const data = loadResources()

    // 去重：同一 URL 不重复入库
    if (data.resources.some(r => r.url === url)) {
      return res.status(409).json({ success: false, message: '该链接已存在于资源库' })
    }

    const newResource = {
      id: 'res_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title,
      url,
      source: source || 'tech-site',
      sourceName: sourceName || '',
      type: type || '在线文档',
      level: level || '入门',
      skillTags,
      status: checkResult.status === 'valid' ? 'valid' : 'unknown',
      lastChecked: new Date().toISOString(),
      failCount: 0
    }

    data.resources.push(newResource)
    saveResources(data)

    res.json({ success: true, message: '资源入库成功（已通过预校验）', resource: sanitizeResource(newResource) })
  } catch (e) {
    console.error('[Resources] 新增资源失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// ============================================================
// 【接口4】手动触发定时巡检
// POST /api/resources/inspect
// 遍历所有资源，检测可用性，更新状态；连续失败达阈值则标记失效
// ============================================================
router.post('/inspect', async (req, res) => {
  try {
    const report = await runInspection()
    res.json({ success: true, message: '巡检完成', report })
  } catch (e) {
    console.error('[Resources] 巡检失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// ============================================================
// 【接口5】巡检状态摘要
// GET /api/resources/status
// ============================================================
router.get('/status', (req, res) => {
  try {
    const pool = loadResourcePool()
    const total = pool.length
    const valid = pool.filter(r => r.status === 'valid').length
    const invalid = pool.filter(r => r.status === 'invalid').length
    const unknown = pool.filter(r => r.status === 'unknown' || (!r.status)).length
    const lrData = loadResources()

    res.json({
      success: true,
      data: {
        total,
        valid,
        invalid,
        unknown,
        lastInspection: lrData.lastInspection || '尚未巡检',
        inspectionIntervalHours: lrData.inspectionIntervalHours || 24
      }
    })
  } catch (e) {
    console.error('[Resources] 状态查询失败:', e)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// ============================================================
// 【定时巡检核心逻辑】
// - 404 → 直接标记 invalid，failCount +1
// - valid → 重置 failCount=0，status=valid
// - unknown → failCount +1，连续达阈值则标记 invalid
// 巡检采用串行 + 小延迟，避免高频请求被限流
// ============================================================
async function runInspection() {
  const pool = loadResourcePool()
  console.log(`[Resources] 开始巡检 resourcePool，共 ${pool.length} 条资源`)

  let checked = 0
  let validCount = 0
  let invalidCount = 0
  let unknownCount = 0

  for (const resource of pool) {
    const result = await checkLink(resource.url)
    resource.lastChecked = new Date().toISOString()

    if (result.status === 'valid') {
      resource.status = 'valid'
      resource.failCount = 0
      validCount++
    } else if (result.status === 'invalid') {
      resource.status = 'invalid'
      resource.failCount = (resource.failCount || 0) + 1
      invalidCount++
    } else {
      // unknown：累加失败次数，连续达阈值才判定失效（避免误杀被反爬的正常站点）
      resource.failCount = (resource.failCount || 0) + 1
      if (resource.failCount >= FAIL_THRESHOLD) {
        resource.status = 'invalid'
        invalidCount++
      } else {
        resource.status = 'unknown'
        unknownCount++
      }
    }

    checked++
    // 串行间隔，避免被目标站点限流
    await new Promise(r => setTimeout(r, 300))
  }

  // 保存巡检结果到 resourcePool（local-knowledge-base.json）
  saveResourcePool(pool)

  // 更新 learning-resources.json 巡检时间（保留为巡检状态记录）
  const lrData = loadResources()
  lrData.lastInspection = new Date().toISOString()
  saveResources(lrData)

  console.log(`[Resources] 巡检完成：共${checked}条，有效${validCount}，失效${invalidCount}，未知${unknownCount}`)
  return { checked, valid: validCount, invalid: invalidCount, unknown: unknownCount, finishedAt: lrData.lastInspection }
}

// ============================================================
// 【启动定时巡检】服务启动后延迟30s执行首次巡检，之后每24h巡检一次
// ============================================================
function startScheduledInspection() {
  const data = loadResources()
  const intervalMs = (data.inspectionIntervalHours || 24) * 60 * 60 * 1000

  // 首次延迟执行（避免与服务启动资源竞争）
  setTimeout(async () => {
    try {
      console.log('[Resources] 启动首次定时巡检...')
      await runInspection()
    } catch (e) {
      console.error('[Resources] 首次巡检异常:', e.message)
    }
  }, 30000)

  // 周期巡检
  inspectionTimer = setInterval(async () => {
    try {
      console.log('[Resources] 启动周期定时巡检...')
      await runInspection()
    } catch (e) {
      console.error('[Resources] 周期巡检异常:', e.message)
    }
  }, intervalMs)

  console.log(`[Resources] 定时巡检已注册，间隔 ${data.inspectionIntervalHours || 24} 小时`)
}

// ============================================================
// 【接口6】系统自动化自检（全量岗位检测）
// GET /api/resources/self-check
// 遍历全部岗位技能，校验：①资源空白 ②资源匹配度 ③链接有效性
// 输出报告：异常岗位、不匹配资源、失效链接、B站搜索链接清单
// 注意：自检耗时较长（56岗位×多技能×链接校验），前端建议异步调用
// ============================================================

// 资源相关性判断（供自检使用）：复用 isSkillMatched 逻辑 + title 包含技能关键词
function isResourceRelevant(resource, skillName, tokens) {
  if (!resource) return false
  // 复用 isSkillMatched（含别名+拆分匹配，保证与匹配逻辑一致）
  if (isSkillMatched(resource, skillName)) return true
  // title 包含任一 token（兜底判断）
  const title = String(resource.title || '').toLowerCase()
  if (tokens && tokens.some(t => title.includes(t.toLowerCase()))) {
    return true
  }
  return false
}

router.get('/self-check', async (req, res) => {
  try {
    const posData = loadPositionSkills()
    const pool = loadResourcePool()
    // fast=1：跳过链接校验，仅检测资源覆盖度与匹配度（秒级完成）
    // position=key：仅自检指定岗位（快速定位问题）
    const fastMode = req.query.fast === '1'
    const singlePosition = req.query.position || ''

    const report = {
      summary: {
        totalPositions: 0,
        passed: 0,
        emptyPositions: [],
        mismatchedResources: [],
        invalidLinks: [],
        bilibiliSearchLinks: [],
        tierStats: { level1: 0, level2: 0, level3: 0 }
      },
      details: [],
      poolSize: pool.length,
      fastMode,
      generatedAt: new Date().toISOString()
    }

    // 收集所有待校验链接（去重），末尾批量探测
    const linkCheckQueue = new Map()  // url -> { skill, position, title }

    const groupsToCheck = posData.positionGroups
    console.log(`[Resources][SelfCheck] 开始自检：${groupsToCheck.length} 分组 / 资源池 ${pool.length} 条 / fast=${fastMode} / position=${singlePosition || 'ALL'}`)

    for (const group of groupsToCheck) {
      for (const pos of group.positions) {
        if (singlePosition && pos.key !== singlePosition) continue
        report.summary.totalPositions++
        const skillMap = posData.positionSkillMap[pos.key]
        if (!skillMap) {
          report.summary.emptyPositions.push({ position: pos.label, positionKey: pos.key, reason: '无技能数据', emptySkills: [] })
          continue
        }
        const allSkills = Object.values(skillMap).flat().map(s => s.name)
        const posDetail = {
          position: pos.label,
          positionKey: pos.key,
          totalSkills: allSkills.length,
          emptySkills: [],
          mismatched: [],
          invalidLinks: []
        }

        for (const skillName of allSkills) {
          // 自检模式：跳过 Coze（避免超时）+ 跳过单技能链接校验（末尾批量校验）
          const matched = await matchSkillResources(skillName, pos.key, { skipCoze: true, skipLinkCheck: true })
          report.summary.tierStats[matched.source] = (report.summary.tierStats[matched.source] || 0) + 1

          if (matched.resources.length === 0) {
            posDetail.emptySkills.push(skillName)
          } else {
            const tokens = String(skillName).split(/[\/\s,，、（）()]+/).filter(t => t.length > 1)
            for (const r of matched.resources) {
              // 校验项2：资源相关性
              if (!isResourceRelevant(r, skillName, tokens)) {
                posDetail.mismatched.push({ skill: skillName, title: r.title, url: r.url })
              }
              // 标记 B 站搜索链接（待优化为单视频直链）
              if (r.url && r.url.includes('search.bilibili.com')) {
                report.summary.bilibiliSearchLinks.push({ position: pos.label, skill: skillName, title: r.title, url: r.url })
              }
              // 收集链接待批量校验（去重，排除搜索引擎/B站搜索等动态链接）
              if (r.url && !linkCheckQueue.has(r.url) && !r.url.includes('search.bilibili.com') && !r.url.includes('bing.com/search')) {
                linkCheckQueue.set(r.url, { skill: skillName, position: pos.label, title: r.title })
              }
            }
          }
        }

        if (posDetail.emptySkills.length > 0) {
          report.summary.emptyPositions.push({ position: pos.label, positionKey: pos.key, emptySkills: posDetail.emptySkills })
        }
        report.summary.mismatchedResources.push(...posDetail.mismatched)
        if (posDetail.emptySkills.length === 0 && posDetail.mismatched.length === 0) {
          report.summary.passed++
        }
        report.details.push(posDetail)
      }
    }

    // 校验项3：批量检测链接有效性（fast 模式跳过）
    if (!fastMode && linkCheckQueue.size > 0) {
      console.log(`[Resources][SelfCheck] 批量校验 ${linkCheckQueue.size} 个唯一链接...`)
      const urls = Array.from(linkCheckQueue.keys())
      // 限制并发为 8，避免被目标站点限流
      const BATCH = 8
      let invalidCount = 0
      for (let i = 0; i < urls.length; i += BATCH) {
        const batch = urls.slice(i, i + BATCH)
        const results = await Promise.all(
          batch.map(async url => {
            try {
              const status = await quickCheckLink(url)
              return { url, status }
            } catch {
              return { url, status: 'unknown' }
            }
          })
        )
        for (const { url, status } of results) {
          if (status === 'invalid') {
            const info = linkCheckQueue.get(url)
            report.summary.invalidLinks.push({ ...info, url })
            invalidCount++
          }
        }
      }
      console.log(`[Resources][SelfCheck] 链接校验完成：失效 ${invalidCount} / 总计 ${urls.length}`)
    }

    console.log(`[Resources][SelfCheck] 自检完成：通过 ${report.summary.passed}/${report.summary.totalPositions}，空资源 ${report.summary.emptyPositions.length}，不匹配 ${report.summary.mismatchedResources.length}，失效链接 ${report.summary.invalidLinks.length}，B站搜索链接 ${report.summary.bilibiliSearchLinks.length}`)
    res.json({ success: true, data: report })
  } catch (e) {
    console.error('[Resources][SelfCheck] 自检失败:', e)
    res.status(500).json({ success: false, message: '自检失败: ' + e.message })
  }
})

// 启动定时巡检（仅注册一次）
startScheduledInspection()

module.exports = router
