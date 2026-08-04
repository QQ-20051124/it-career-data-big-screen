const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { generateLearningRoute, generateSkillList, generateInterviewQuestions, getPositionLabel, getPositionGroup, positionGroups } = require('../data/position-skills-backend')
const { identifyUser, checkGuestAIChat, incrementGuestAIChat } = require('../middleware/auth')

const COZE_API_KEY = process.env.COZE_API_KEY
const COZE_BOT_ID = process.env.COZE_BOT_ID
const COZE_API_BASE = process.env.COZE_API_BASE || 'https://api.coze.cn'
const COZE_TIMEOUT = 15000

// ============================================================
// 【系统提示词 - Coze 统一】
// 修改位置：修改以下 SYSTEM_PROMPT 常量即可更新AI人设与回答规范
// ============================================================
const SYSTEM_PROMPT = `你是《学业 - 就业双向联动规划系统》专属 AI 学习顾问，专为计算机专业学生提供求职导向的精准学习支持。

## 角色定位
- 基于真实企业招聘 JD 的技能数据分析，提供贴合岗位需求的学习路线、实操方案
- 解答编程技术疑问、梳理技能缺口、指导面试准备，提供行业薪资参考
- 依托爬虫采集的岗位数据生成学习规划
- 服务范围严格限定在计算机专业学习、前端/后端等技术岗位就业相关内容

## 强制规则
1. 【身份应答】用户询问"你是谁"时，必须回答以下原文（一字不差）：
"我是《学业 - 就业双向联动规划系统》专属 AI 学习顾问，专为计算机专业学生提供求职导向的精准学习支持：
1. 基于真实企业招聘 JD 的技能数据分析，能给你贴合岗位需求的学习路线、实操方案；
2. 可解答编程技术疑问、梳理技能缺口、指导面试准备，还能提供行业薪资参考；
3. 依托爬虫采集的岗位数据生成学习规划。
如果你有具体的技能疑问、学习进度反馈或目标岗位需求，可以直接告诉我~"

2. 【话题边界】用户提出与计算机专业无关的问题时，必须回答以下原文（一字不差）：
"抱歉，我是专注于计算机专业学业 - 就业联动规划的 AI 顾问，仅能解答计算机专业学习、前端/后端等技术岗位就业相关问题，这类无关问题不在解答范围。
如果有计算机专业技能学习、求职岗位准备等需求，欢迎随时告诉我~"

3. 【知识范围】只回答计算机专业相关内容：编程技术、岗位学习路线、技能推荐、资源介绍、职业规划、面试技巧、薪资参考等。

## 回答风格
- 使用中文回答，结构化条理清晰
- 适当使用emoji增加可读性
- 提供具体、可执行的建议和权威资源链接
- 不编造信息，不确定时坦诚告知

## 知识库融合规则
- 系统会将检索到的知识库内容（岗位技能、学习路线、资源等）作为参考素材提供给你
- 你必须基于这些素材，结合当下行业最新岗位技能趋势，重新组织生成回答
- 禁止直接原样输出知识库内容，必须进行融合和优化
- 如果知识库素材不足以回答问题，使用你的通用知识补充，但需标注「结合当前行业趋势补充」
- 回答中引用的知识库素材内容，需自然融入，不要提及"知识库"字样`

// 固定规则检测：身份问题关键词
const IDENTITY_KEYWORDS = [
  '你是谁', '你是什么', '你叫什么', '介绍一下你自己', '自我介绍',
  '你叫什么名字', '你的名字', 'who are you', 'what are you'
]

// 固定规则检测：无关话题关键词（命中即拦截）
const OFF_TOPIC_KEYWORDS = [
  '天气', '今天天气', '明天天气', '下雨', '温度',
  '笑话', '讲个笑话', '搞笑', '幽默',
  '游戏', '玩游戏', '电影', '看电影', '音乐', '听歌', '唱歌',
  '吃饭', '吃什么', '美食', '做饭', '菜谱',
  '睡觉', '失眠', '做梦',
  '谈恋爱', '女朋友', '男朋友', '对象', '感情', '恋爱', '分手',
  '身体健康', '生病', '感冒', '吃药', '医院',
  '新闻', '时事', '政治', '经济', '股票', '基金', '理财',
  '体育', '足球', '篮球', '比赛', '奥运',
  '英语', '学英语', '英语学习', '年级', '几年级', '小学', '初中', '高中',
  '色情', '暴力', '赌博', '毒品', '违法'
]

// 固定规则 - 身份问题标准回答
const IDENTITY_RESPONSE = `我是《学业 - 就业双向联动规划系统》专属 AI 学习顾问，专为计算机专业学生提供求职导向的精准学习支持：
1. 基于真实企业招聘 JD 的技能数据分析，能给你贴合岗位需求的学习路线、实操方案；
2. 可解答编程技术疑问、梳理技能缺口、指导面试准备，还能提供行业薪资参考；
3. 依托爬虫采集的岗位数据生成学习规划。
如果你有具体的技能疑问、学习进度反馈或目标岗位需求，可以直接告诉我~`

// 固定规则 - 无关话题标准拒绝
const OFF_TOPIC_RESPONSE = `抱歉，我是专注于计算机专业学业 - 就业联动规划的 AI 顾问，仅能解答计算机专业学习、前端/后端等技术岗位就业相关问题，这类无关问题不在解答范围。
如果有计算机专业技能学习、求职岗位准备等需求，欢迎随时告诉我~`

let knowledgeBase = null
let knowledgeBaseLoadedAt = 0
let cozeCreditExhausted = false

function loadKnowledgeBase(forceReload) {
  const now = Date.now()
  if (knowledgeBase && !forceReload && (now - knowledgeBaseLoadedAt) < 60000) {
    return knowledgeBase
  }
  try {
    const filePath = path.join(__dirname, '..', 'data', 'local-knowledge-base.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    knowledgeBase = JSON.parse(raw)
    knowledgeBaseLoadedAt = now
    console.log('[KnowledgeBase] 本地知识库加载成功，共', knowledgeBase.positions.length, '个岗位，', knowledgeBase.faq?.length || 0, '条FAQ')
  } catch (e) {
    console.error('[KnowledgeBase] 加载失败:', e.message)
    knowledgeBase = { positions: [], faq: [], commonProblems: [], defaultResponse: {} }
    knowledgeBaseLoadedAt = now
  }
  return knowledgeBase
}

function getKnowledgeBase() {
  return loadKnowledgeBase(false)
}

loadKnowledgeBase(true)

// ============================================================
// 【Coze API 调用计数器 - 本地内存方案】
// 注意：计数器存储在进程内存中，后端服务重启后会清零，适配项目演示场景。
// 预设免费API总上限100次，达到上限后自动切换本地知识库兜底。
// 降级全程不调用任何备用大模型，仅本地知识库响应。
// ============================================================
const COZE_FREE_LIMIT = 100  // 预设免费API总上限（次）
let cozeCallCount = 0         // 已成功调用次数（内存计数，服务重启清零）

// 获取Coze调用配额状态
function getCozeQuotaStatus() {
  const used = cozeCallCount
  const remaining = Math.max(0, COZE_FREE_LIMIT - used)
  const exhausted = used >= COZE_FREE_LIMIT
  return { used, remaining, exhausted, limit: COZE_FREE_LIMIT }
}

// 打印Coze配额状态日志（已调用次数 / 剩余可用次数）
function logCozeQuotaStatus() {
  const { used, remaining, exhausted } = getCozeQuotaStatus()
  console.log(`[Coze Quota] 已调用: ${used}/${COZE_FREE_LIMIT} 次 | 剩余可用: ${remaining} 次`)
  if (remaining <= 10 && remaining > 0) {
    console.warn(`[Coze Quota] ⚠️ 警告：剩余调用次数仅剩 ${remaining} 次，即将耗尽！`)
  }
  if (exhausted) {
    console.warn('[Coze Quota] ❌ 免费API额度已耗尽，后续请求切换本地知识库兜底')
  }
}

// Coze对话请求成功完成后递增计数器并打印日志
function incrementCozeCallCount() {
  cozeCallCount++
  logCozeQuotaStatus()
}

// ============================================================
// 【固定规则前置检测】
// ============================================================
function checkFixedRules(message) {
  if (!message) return { matched: false }

  const msgLower = message.toLowerCase().trim()

  for (const keyword of IDENTITY_KEYWORDS) {
    if (msgLower.includes(keyword.toLowerCase())) {
      console.log('[FixedRules] 检测到身份问题，返回固定回答')
      return { matched: true, type: 'identity', response: IDENTITY_RESPONSE }
    }
  }

  for (const keyword of OFF_TOPIC_KEYWORDS) {
    if (msgLower.includes(keyword.toLowerCase())) {
      console.log('[FixedRules] 检测到无关话题，返回标准拒绝')
      return { matched: true, type: 'offtopic', response: OFF_TOPIC_RESPONSE }
    }
  }

  return { matched: false }
}

// ============================================================
// 【知识库检索】根据用户消息检索相关岗位素材
// 返回格式化的知识库上下文文本，供大模型融合使用
// ============================================================
function retrieveKnowledgeBase(message) {
  const kb = getKnowledgeBase()
  if (!kb || !kb.positions || kb.positions.length === 0) {
    return null
  }

  const msgLower = message.toLowerCase()
  const scores = []

  for (const pos of kb.positions) {
    let score = 0

    if (pos.position && msgLower.includes(pos.position.toLowerCase())) {
      score += 100
    }

    if (pos.aliases) {
      for (const alias of pos.aliases) {
        if (msgLower.includes(alias.toLowerCase())) {
          score += 50
        }
      }
    }

    if (pos.keywords) {
      for (const keyword of pos.keywords) {
        if (msgLower.includes(keyword.toLowerCase())) {
          score += 20
        }
      }
    }

    if (score > 0) {
      scores.push({ position: pos, score })
    }
  }

  scores.sort((a, b) => b.score - a.score)

  const matchedPositions = scores.slice(0, 2).map(s => s.position)

  if (matchedPositions.length === 0) {
    return null
  }

  const kbContexts = []
  for (const pos of matchedPositions) {
    const ctx = []
    ctx.push(`【岗位】${pos.position}`)
    ctx.push(`描述：${pos.description}`)

    if (pos.requiredSkills && pos.requiredSkills.length > 0) {
      ctx.push('核心技能：')
      for (const skill of pos.requiredSkills) {
        ctx.push(`  - ${skill.name}(${skill.level})：${skill.desc}`)
      }
    }

    if (pos.learningPhases && pos.learningPhases.length > 0) {
      ctx.push('学习阶段：')
      for (const phase of pos.learningPhases) {
        ctx.push(`  ${phase.phase}：${(phase.tasks || []).join('、')}`)
      }
    }

    if (pos.resources && pos.resources.length > 0) {
      ctx.push('学习资源：')
      for (const res of pos.resources) {
        ctx.push(`  - ${res.name}(${res.type},${res.level})：${res.url}`)
      }
    }

    if (pos.practicePlan) {
      ctx.push(`实战方案：推荐项目 - ${(pos.practicePlan.projects || []).join('、')}`)
    }

    kbContexts.push(ctx.join('\n'))
  }

  console.log('[KnowledgeBase] 检索到', matchedPositions.length, '个相关岗位:', matchedPositions.map(p => p.position).join(', '))

  return kbContexts.join('\n\n---\n\n')
}

// ============================================================
// 【知识库融合提示词构建】
// 将检索到的知识库素材注入到大模型prompt中，由模型融合生成回答
// ============================================================
function buildFusedPrompt(message, kbContext, history) {
  const historyContext = (history && history.length > 0) ? buildHistoryContext(history) : ''

  if (!kbContext) {
    let userPrompt = message
    if (historyContext) {
      userPrompt = `${historyContext}\n\n【当前用户最新问题】\n${message}`
    }
    return {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt
    }
  }

  const fusedUserPrompt = `【知识库参考素材】
以下是从系统知识库中检索到的与您问题相关的岗位学习素材，仅供参考：

${kbContext}
${historyContext ? '\n' + historyContext : ''}

【当前用户最新问题】
${message}

【回答要求】
请结合以上知识库素材和历史对话上下文，融合当前行业最新岗位技能趋势，为用户生成一份完整的学习规划回答。
要求：
1. 不要直接复制知识库原文，要进行融合优化
2. 结合当前技术栈发展和行业需求进行补充
3. 保持结构化、条理清晰
4. 如果知识库素材有局限，使用通用知识补充但标注"结合当前行业趋势补充"
5. 如果有历史对话上下文，请参考之前的对话内容，保持回答的连贯性和上下文一致性`

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: fusedUserPrompt
  }
}

function buildHistoryContext(history) {
  if (!history || history.length === 0) return ''
  const recentHistory = history.slice(-6)
  const lines = ['【历史对话上下文】']
  for (const msg of recentHistory) {
    if (msg.role === 'user') {
      lines.push(`用户：${msg.content}`)
    } else if (msg.role === 'assistant') {
      const shortContent = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content
      lines.push('AI：' + shortContent)
    }
  }
  lines.push('（请参考以上历史对话，结合用户最新问题进行回答）')
  return lines.join('\n')
}

// ============================================================
// 【Coze API调用 - 融合知识库版】
// Coze 失败时直接本地兜底
// ============================================================
async function callCozeWithKnowledge(systemPrompt, userPrompt, res, message, userId, conversationId, history) {
  if (!COZE_API_KEY || !COZE_BOT_ID) {
    console.warn('[Coze] 配置缺失')
    return { success: false, reason: 'config_missing' }
  }

  // 配额检查：达到免费上限则直接判定额度耗尽，不发起API请求，切换本地知识库兜底
  const quotaStatus = getCozeQuotaStatus()
  if (quotaStatus.exhausted) {
    console.warn('[Coze] 免费API额度已耗尽（计数达上限' + COZE_FREE_LIMIT + '次），跳过Coze调用，切换本地知识库兜底')
    return { success: false, reason: 'quota_exhausted' }
  }
  console.log(`[Coze] 当前配额 - 已用: ${quotaStatus.used}/${quotaStatus.limit}, 剩余: ${quotaStatus.remaining}`)

  const additionalMessages = []

  if (history && history.length > 0) {
    const recentHistory = history.slice(-10)
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        additionalMessages.push({
          role: 'user',
          content: msg.content,
          content_type: 'text'
        })
      } else if (msg.role === 'assistant' && msg.content) {
        additionalMessages.push({
          role: 'assistant',
          content: msg.content,
          content_type: 'text'
        })
      }
    }
  }

  const injectedContent = history && history.length > 0
    ? `[系统角色设定]\n${systemPrompt}\n\n[历史对话上下文]\n已在下方消息中提供历史对话\n\n[当前用户最新提问]\n${userPrompt}`
    : `[系统角色设定]\n${systemPrompt}\n\n[用户提问]\n${userPrompt}`

  additionalMessages.push({
    role: 'user',
    content: injectedContent,
    content_type: 'text'
  })

  const requestBody = {
    bot_id: COZE_BOT_ID,
    user_id: userId || 'it-career-user-' + Date.now(),
    stream: true,
    additional_messages: additionalMessages
  }

  if (conversationId) {
    requestBody.conversation_id = conversationId
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), COZE_TIMEOUT)

  try {
    console.log('[Coze] 开始调用（已融合知识库）:', message.substring(0, 30))

    const cozeResponse = await fetch(`${COZE_API_BASE}/v3/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!cozeResponse.ok) {
      const errorText = await cozeResponse.text()
      console.error('[Coze] API错误:', cozeResponse.status, errorText.substring(0, 200))
      return { success: false, reason: `http_${cozeResponse.status}` }
    }

    const reader = cozeResponse.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = ''
    let chunkCount = 0
    let gotContent = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        const trimmedLine = line.trim()

        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.slice(6).trim()
        } else if (trimmedLine.startsWith('data:')) {
          const dataStr = trimmedLine.slice(5).trim()

          if (dataStr === '[DONE]') {
            // 对话成功完成，递增计数器
            incrementCozeCallCount()
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            res.end()
            return { success: true }
          }

          try {
            const data = JSON.parse(dataStr)
            const eventType = data.event || currentEvent

            if (eventType === 'conversation.chat.failed') {
              const errCode = data.last_error?.code
              const errMsg = data.last_error?.msg || ''
              console.log('[Coze] Chat failed:', errCode, errMsg)
              if (errCode === 4028) {
                cozeCreditExhausted = true
              }
            }

            if (eventType) {
              const result = handleCozeEvent(eventType, data, res)
              if (result && result.hasContent) {
                gotContent = true
              }
              currentEvent = ''
            }
          } catch (e) {
            // 非JSON
          }
        } else if (trimmedLine === '') {
          currentEvent = ''
        }
      }
    }

    console.log('[Coze] 完成, chunks:', chunkCount, '有内容:', gotContent)

    if (!gotContent) {
      return { success: false, reason: 'no_content' }
    }

    // 对话成功完成，递增计数器
    incrementCozeCallCount()
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
    return { success: true }
  } catch (fetchError) {
    clearTimeout(timeoutId)
    console.error('[Coze] 调用异常:', fetchError.name, fetchError.message)
    return { success: false, reason: fetchError.name === 'AbortError' ? 'timeout' : 'network_error' }
  }
}

// ============================================================
// 【本地兜底上下文提示生成】
// 根据历史对话生成上下文感知的提示信息
// ============================================================
function buildLocalContextHint(history, currentMessage) {
  if (!history || history.length === 0) return ''

  const userMessages = history.filter(m => m.role === 'user' && m.content)
  if (userMessages.length === 0) return ''

  const recentTopics = []
  const msgLower = currentMessage.toLowerCase()

  const allUserMessages = userMessages.map(m => m.content.toLowerCase()).join(' ')

  const relatedKeywords = {
    '前端': ['前端', 'frontend', 'vue', 'react', 'javascript', 'html', 'css', '页面', '组件'],
    '后端': ['后端', 'backend', 'java', 'python', 'go', 'spring', '接口', '服务'],
    '数据库': ['数据库', 'mysql', 'redis', 'mongodb', 'sql'],
    '算法': ['算法', 'algorithm', '机器学习', '深度学习', 'ai', '人工智能'],
    '运维': ['运维', 'devops', 'docker', 'kubernetes', 'k8s', '部署'],
    '面试': ['面试', '简历', '求职', '找工作', '招聘'],
    '学习路线': ['学习', '路线', '计划', '入门', '进阶']
  }

  for (const [topic, keywords] of Object.entries(relatedKeywords)) {
    const hasCurrent = keywords.some(k => msgLower.includes(k))
    const hasHistory = keywords.some(k => allUserMessages.includes(k))
    if (hasCurrent && hasHistory) {
      recentTopics.push(topic)
    }
  }

  if (recentTopics.length > 0) {
    return `【上下文感知】根据我们之前的对话，您正在关注${recentTopics.join('、')}相关话题。让我结合之前的讨论为您解答最新问题：`
  }

  if (userMessages.length >= 2) {
    const lastTopics = userMessages.slice(-2).map(m => {
      const content = m.content.length > 20 ? m.content.substring(0, 20) + '...' : m.content
      return content
    })
    return `【上下文感知】根据我们之前的对话（您之前问过："${lastTopics.join('"、"')}"），让我继续为您解答：`
  }

  return ''
}

// ============================================================
// 【意图检测】
// 检测用户查询的意图类型：学习路线/技术问答/模拟面试/常见问题/职业规划
// ============================================================
function detectIntent(message) {
  const msg = message.toLowerCase()
  
  const intents = {
    learning_route: {
      keywords: ['学习路线', '学习计划', '学习路径', '怎么学', '如何学', '学习方法', '入门', '学习'],
      score: 0
    },
    mock_interview: {
      keywords: ['模拟面试', '面试题', '面试练习', '面试准备', '面试技巧', '面试', '八股文', '笔试'],
      score: 0
    },
    technical_qa: {
      keywords: ['怎么用', '怎么实现', '是什么', '为什么', '原理', '区别', '解释', '讲解', '如何', '什么是', '?', '？'],
      score: 0
    },
    common_problem: {
      keywords: ['内存泄漏', 'OOM', '超时', '报错', '错误', '崩溃', '卡顿', '慢', '排查', '调试', 'debug', 'bug', 'bug', '部署', '上线'],
      score: 0
    },
    career: {
      keywords: ['转行', '转型', '就业', '薪资', '工资', '待遇', '职业规划', '发展', '前途', '方向'],
      score: 0
    },
    resource: {
      keywords: ['资源', '推荐', '文档', '视频', '书籍', '课程', '项目', '实战'],
      score: 0
    }
  }

  for (const [intent, config] of Object.entries(intents)) {
    for (const keyword of config.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        config.score += 1
      }
    }
  }

  const sorted = Object.entries(intents).sort((a, b) => b[1].score - a[1].score)
  if (sorted[0][1].score > 0) {
    return sorted[0][0]
  }
  return 'general'
}

// ============================================================
// 【FAQ匹配】
// 从FAQ库中查找最匹配的问题
// ============================================================
function findBestFAQ(message) {
  const kb = getKnowledgeBase()
  if (!kb || !kb.faq || kb.faq.length === 0) {
    return null
  }

  const msgLower = message.toLowerCase()
  let bestMatch = null
  let bestScore = 0

  for (const faq of kb.faq) {
    let score = 0
    for (const keyword of faq.keywords || []) {
      if (msgLower.includes(keyword.toLowerCase())) {
        score += 10
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = faq
    }
  }

  if (bestScore === 0 && kb.positions) {
    for (const pos of kb.positions) {
      if (pos.mockInterview && pos.mockInterview.length > 0) {
        for (const mock of pos.mockInterview) {
          let mockScore = 0
          const words = msgLower.split(/\s+/)
          const qLower = mock.q.toLowerCase()
          for (const word of words) {
            if (word.length > 1 && qLower.includes(word)) {
              mockScore += 5
            }
          }
          if (mockScore > bestScore && mockScore >= 10) {
            bestScore = mockScore
            bestMatch = {
              id: `mock-${pos.id}`,
              question: mock.q,
              answer: `## 💡 ${mock.q}\n\n${mock.a}\n\n---\n\n📌 **所属岗位：${pos.position}**\n💡 更多问题请尝试"模拟面试 - ${pos.position}"`,
              keywords: []
            }
          }
        }
      }
    }
  }

  return bestScore > 0 ? bestMatch : null
}

// ============================================================
// 【常见问题匹配】
// 从commonProblems库中查找最匹配的问题
// ============================================================
function findBestProblem(message) {
  const kb = getKnowledgeBase()
  if (!kb || !kb.commonProblems || kb.commonProblems.length === 0) {
    return null
  }

  const msgLower = message.toLowerCase()
  let bestMatch = null
  let bestScore = 0

  for (const problem of kb.commonProblems) {
    let score = 0
    for (const keyword of problem.keywords || []) {
      if (msgLower.includes(keyword.toLowerCase())) {
        score += 10
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = problem
    }
  }

  return bestScore > 0 ? bestMatch : null
}

// ============================================================
// 【岗位智能匹配】
// 支持模糊匹配所有岗位（包括动态数据）
// ============================================================
function smartMatchPosition(message) {
  const msgLower = message.toLowerCase()
  const kb = getKnowledgeBase()
  
  // 1. 先匹配精心设计的知识库岗位
  if (kb && kb.positions && kb.positions.length > 0) {
    for (const pos of kb.positions) {
      if (pos.position && msgLower.includes(pos.position.toLowerCase())) {
        return { position: pos, fromKB: true }
      }
      if (pos.aliases) {
        for (const alias of pos.aliases) {
          if (msgLower.includes(alias.toLowerCase())) {
            return { position: pos, fromKB: true }
          }
        }
      }
    }
  }

  // 2. 匹配动态岗位数据
  for (const group of positionGroups) {
    for (const pos of group.positions) {
      const label = pos.label.toLowerCase()
      const key = pos.key.toLowerCase()
      if (msgLower.includes(label) || msgLower.includes(key)) {
        return { position: { id: key, position: label, group: group.name }, fromKB: false, positionKey: key }
      }
    }
  }

  // 3. 关键词模糊匹配
  const keywordMap = {
    '前端': 'frontend', 'vue': 'vue-developer', 'react': 'react-developer',
    '后端': 'backend-java', 'java': 'backend-java', 'python后端': 'backend-python',
    '算法': 'algorithm', '机器学习': 'ml-engineer', 'ai': 'ai-engineer',
    '测试': 'qa-engineer', '自动化测试': 'autotest',
    '运维': 'devops', 'devops': 'devops', 'kubernetes': 'k8s-engineer', 'k8s': 'k8s-engineer',
    '安全': 'security', '渗透': 'penetration',
    '数据库': 'dba', 'dba': 'dba',
    '移动端': 'android', 'android': 'android', 'ios': 'ios-developer',
    '大数据': 'bigdata', '数据': 'data-analyst',
    '全栈': 'fullstack',
    '嵌入式': 'embedded', '硬件': 'hardware',
    '游戏': 'game-dev', '区块链': 'blockchain',
    '架构师': 'architect', '架构': 'architect',
    '产品': 'product-manager'
  }

  for (const [keyword, posKey] of Object.entries(keywordMap)) {
    if (msgLower.includes(keyword.toLowerCase())) {
      const label = getPositionLabel(posKey) || posKey
      return { position: { id: posKey, position: label, group: getPositionGroup(posKey) }, fromKB: false, positionKey: posKey }
    }
  }

  return null
}

// ============================================================
// 【生成岗位学习路线回答】
// ============================================================
function generateRouteAnswer(positionInfo, message) {
  const { position, fromKB, positionKey } = positionInfo
  const posName = position.position
  let answer = `## 🎯 ${posName} 完整学习路线\n\n`

  if (fromKB && position.requiredSkills) {
    // 使用精心设计的岗位数据
    answer += `### 📋 岗位概述\n${position.description || '负责相关技术领域的开发与实现。'}\n\n`

    if (position.requiredSkills && position.requiredSkills.length > 0) {
      answer += `### 🔧 核心技能清单\n`
      for (const skill of position.requiredSkills) {
        const emoji = skill.level === '必备' ? '🔴' : skill.level === '优先' ? '🟡' : '🟢'
        answer += `${emoji} **${skill.name}**（${skill.level}）：${skill.desc}\n`
      }
      answer += '\n'
    }

    if (position.learningPhases && position.learningPhases.length > 0) {
      answer += `### 📚 分阶段学习路线\n`
      for (const phase of position.learningPhases) {
        answer += `\n**${phase.phase}**\n`
        for (const task of phase.tasks) {
          answer += `  • ${task}\n`
        }
      }
      answer += '\n'
    }

    if (position.resources && position.resources.length > 0) {
      answer += `### 🔗 权威学习资源\n`
      for (const res of position.resources) {
        answer += `  • ${res.name}（${res.type}，${res.level}）\n`
      }
      answer += '\n'
    }

    if (position.practicePlan) {
      answer += `### 💡 实践练习方案\n`
      if (position.practicePlan.projects) {
        answer += `**推荐项目：**\n`
        for (const proj of position.practicePlan.projects) {
          answer += `  • ${proj}\n`
        }
      }
      if (position.practicePlan.practiceCount) {
        answer += `\n${position.practicePlan.practiceCount}\n`
      }
      answer += '\n'
    }
  } else if (positionKey) {
    // 使用动态生成的岗位数据
    const label = getPositionLabel(positionKey) || posName
    answer += `### 📋 岗位概述\n`
    answer += `负责${label}相关的设计、开发与实现工作，需要掌握相关的技术栈和工具。\n\n`

    const skills = generateSkillList(positionKey)
    if (skills.length > 0) {
      answer += `### 🔧 核心技能清单\n`
      for (const skill of skills) {
        const emoji = skill.level === '必备' ? '🔴' : skill.level === '优先' ? '🟡' : '🟢'
        answer += `${emoji} **${skill.name}**（${skill.level}）- ${skill.category}\n`
      }
      answer += '\n'
    }

    const routes = generateLearningRoute(positionKey)
    if (routes && routes.length > 0) {
      answer += `### 📚 分阶段学习路线\n`
      for (const route of routes) {
        answer += `\n${route.icon} **${route.phase}**\n`
        for (const task of route.tasks) {
          answer += `  • ${task}\n`
        }
      }
      answer += '\n'
    }
  }

  answer += `### 🎯 模拟面试\n`
  answer += `想练习面试？试试：\n`
  answer += `- "模拟面试 - ${posName}"\n`
  answer += `- "${posName}面试常见问题"\n`

  return answer
}

// ============================================================
// 【生成模拟面试回答】
// ============================================================
function generateInterviewAnswer(positionInfo) {
  const { position, positionKey } = positionInfo
  const posName = position.position
  let answer = `## 🎯 ${posName} - 模拟面试\n\n`

  answer += `### 以下是${posName}的常见面试问题，请尝试回答：\n\n`

  const questions = generateInterviewQuestions(positionKey || position.id)
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    answer += `**问题 ${i + 1}：** ${q.q}\n\n`
    answer += `<details>\n<summary>💡 参考答案（点击展开）</summary>\n\n${q.a}\n\n</details>\n\n`
  }

  answer += `### 📝 面试建议\n`
  answer += `1. 先尝试自己回答，再查看参考答案\n`
  answer += `2. 理解原理比记住答案更重要\n`
  answer += `3. 结合项目经验回答会更有说服力\n`
  answer += `4. 练习用STAR法则描述项目\n\n`
  answer += `祝你面试成功！🚀`

  return answer
}

// ============================================================
// 【生成技术问答回答 - 基于岗位数据】
// 当FAQ无法匹配时，根据岗位数据生成针对性的技术解释
// ============================================================
function generateTechnicalAnswer(message) {
  const kb = getKnowledgeBase()
  const positionInfo = smartMatchPosition(message)
  
  if (!positionInfo) return null
  
  const { position, positionKey, fromKB } = positionInfo
  const posName = position.position
  const msgLower = message.toLowerCase()
  
  let answer = `## 💡 关于"${message}"的解答\n\n`
  
  // 尝试从岗位的 mockInterview 中找到相关内容
  if (fromKB && position.mockInterview && position.mockInterview.length > 0) {
    const words = msgLower.split(/\s+/).filter(w => w.length > 1)
    let bestMock = null
    let bestMockScore = 0
    
    for (const mock of position.mockInterview) {
      let score = 0
      const qLower = mock.q.toLowerCase()
      for (const word of words) {
        if (qLower.includes(word)) score += 3
      }
      if (score > bestMockScore) {
        bestMockScore = score
        bestMock = mock
      }
    }
    
    if (bestMock && bestMockScore >= 3) {
      answer += `### ${bestMock.q}\n\n${bestMock.a}\n\n`
      answer += `---\n📌 **所属岗位：${posName}**\n`
      answer += `💡 想了解更多？试试以下问题：\n`
      position.mockInterview.slice(0, 3).forEach(m => {
        if (m.q !== bestMock.q) {
          answer += `- ${m.q}\n`
        }
      })
      return answer
    }
  }
  
  // 基于岗位技能生成学习指引
  answer += `### 📚 "${message}" 学习指引\n\n`
  
  if (fromKB && position.requiredSkills) {
    const relevantSkills = position.requiredSkills.filter(s => {
      const sLower = s.name.toLowerCase()
      return msgLower.split(/\s+/).some(w => w.length > 1 && sLower.includes(w))
    })
    
    if (relevantSkills.length > 0) {
      answer += `**相关技能点：**\n\n`
      relevantSkills.forEach(s => {
        answer += `- **${s.name}**（${s.level}）：${s.desc}\n`
      })
      answer += `\n**推荐学习路径：**\n\n`
      answer += `1. 先掌握基础概念\n2. 阅读官方文档和权威教程\n3. 通过实际项目练习\n4. 阅读源码理解原理\n\n`
    }
  }
  
  if (fromKB && position.resources) {
    const relevantResources = position.resources.filter(r => {
      const rLower = r.name.toLowerCase()
      return msgLower.split(/\s+/).some(w => w.length > 1 && rLower.includes(w))
    })
    
    if (relevantResources.length > 0) {
      answer += `**📖 推荐资源：**\n\n`
      relevantResources.forEach(r => {
        answer += `- ${r.name}（${r.type}）\n`
      })
      answer += `\n`
    } else {
      answer += `**📖 通用推荐资源：**\n\n`
      position.resources.slice(0, 3).forEach(r => {
        answer += `- ${r.name}（${r.type}）：${r.url || ''}\n`
      })
      answer += `\n`
    }
  }
  
  answer += `💡 **学习建议：** 建议从官方文档入手，结合实战项目加深理解。如果需要更详细的学习规划，可以问我"${posName}学习路线"\n`
  
  return answer
}

// ============================================================
// 【本地兜底 - 增强版】
// 支持：学习路线、技术问答、模拟面试、常见问题、FAQ
// ============================================================
function streamLocalFallback(message, res, history) {
  const kb = getKnowledgeBase()
  const intent = detectIntent(message)
  const contextHint = buildLocalContextHint(history, message)
  let answer = ''

  // 1. 检测到模拟面试意图 - 必须返回面试题
  if (intent === 'mock_interview') {
    const positionInfo = smartMatchPosition(message)
    if (positionInfo) {
      answer = generateInterviewAnswer(positionInfo)
    } else {
      answer = `## 🎯 模拟面试\n\n`
      answer += `### 通用面试问题\n\n`
      const commonQuestions = [
        { q: '请做一个自我介绍', a: '您好，我是XX，毕业于XX大学XX专业，有X年XX经验。擅长XX技术，参与过XX项目。希望在贵公司发挥价值。' },
        { q: '你的职业规划是什么？', a: '短期(1年)：精通业务，成为技术骨干。中期(3年)：向技术专家/架构师方向发展。长期(5年)：技术管理或资深专家。' },
        { q: '介绍一下你最得意的项目', a: '使用STAR法则：Situation(背景)、Task(任务)、Action(行动)、Result(结果)。量化成果，展示技术深度。' },
        { q: '你的优缺点是什么？', a: '优点：学习能力强、注重团队、追求卓越。缺点：有时过于追求完美，正在学习平衡效率与质量。' }
      ]
      for (let i = 0; i < commonQuestions.length; i++) {
        answer += `**问题 ${i + 1}：** ${commonQuestions[i].q}\n\n`
        answer += `<details>\n<summary>💡 参考答案</summary>\n\n${commonQuestions[i].a}\n\n</details>\n\n`
      }
    }
  }

  // 2. 检测到技术问答/知识讲解意图
  if (!answer && (intent === 'technical_qa' || intent === 'general')) {
    const faq = findBestFAQ(message)
    if (faq) {
      answer = `## 💡 ${faq.question}\n\n${faq.answer}`
    } else {
      const techAnswer = generateTechnicalAnswer(message)
      if (techAnswer) {
        answer = techAnswer
      }
    }
  }

  // 3. 检测到常见问题
  if (!answer && intent === 'common_problem') {
    const problem = findBestProblem(message)
    if (problem) {
      answer = `## 🔧 ${problem.question}\n\n${problem.solution}`
    }
  }

  // 4. 检测到学习路线
  if (!answer && intent === 'learning_route') {
    const positionInfo = smartMatchPosition(message)
    if (positionInfo) {
      answer = generateRouteAnswer(positionInfo, message)
    }
  }

  // 5. 职业规划类
  if (!answer && intent === 'career') {
    const faq = findBestFAQ(message)
    if (faq) {
      answer = `## 💼 ${faq.question}\n\n${faq.answer}`
    }
  }

  // 6. 资源推荐类
  if (!answer && intent === 'resource') {
    const positionInfo = smartMatchPosition(message)
    if (positionInfo) {
      const { position, fromKB } = positionInfo
      if (fromKB && position.resources) {
        answer = `## 📚 ${position.position} 学习资源\n\n`
        for (const r of position.resources) {
          answer += `- ${r.name}（${r.type}，${r.level}）：${r.url || ''}\n`
        }
      }
    }
  }

  // 7. 最后兜底 - 岗位匹配或帮助信息
  if (!answer) {
    const positionInfo = smartMatchPosition(message)
    if (positionInfo) {
      answer = generateRouteAnswer(positionInfo, message)
    } else {
      answer = kb.defaultResponse?.helpMessage || '抱歉，我暂时无法回答这个问题。'
    }
  }

  if (contextHint && !answer.includes('上下文感知')) {
    answer = contextHint + '\n\n' + answer
  }

  const lines = answer.split(/\n/)
  const chunks = lines.filter(l => l.trim())

  for (const chunk of chunks) {
    if (!res.writable) break
    res.write(`data: ${JSON.stringify({ type: 'delta', content: chunk + '\n' })}\n\n`)
  }

  const completedPayload = { type: 'completed', mode: 'local_fallback', intent: intent }
  if (cozeCreditExhausted) {
    completedPayload.cozeNote = 'coze_credit_exhausted'
  }

  res.write(`data: ${JSON.stringify(completedPayload)}\n\n`)
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
  res.end()
}

function fuzzyMatchPosition(message) {
  const kb = getKnowledgeBase()
  if (!kb || !kb.positions || kb.positions.length === 0) {
    return null
  }

  const msgLower = message.toLowerCase()
  const scores = []

  for (const pos of kb.positions) {
    let score = 0

    if (pos.position && msgLower.includes(pos.position.toLowerCase())) {
      score += 100
    }

    if (pos.aliases) {
      for (const alias of pos.aliases) {
        if (msgLower.includes(alias.toLowerCase())) {
          score += 50
        }
      }
    }

    if (pos.keywords) {
      for (const keyword of pos.keywords) {
        if (msgLower.includes(keyword.toLowerCase())) {
          score += 20
        }
      }
    }

    if (score > 0) {
      scores.push({ position: pos, score })
    }
  }

  scores.sort((a, b) => b.score - a.score)
  return scores.length > 0 ? scores[0].position : null
}

function formatPositionAnswer(position, message) {
  if (!position) {
    const kb = getKnowledgeBase()
    return kb.defaultResponse?.helpMessage || '暂时无法回答您的问题。'
  }

  const lines = []
  lines.push(`根据您的问题「${message}」，我为您整理了【${position.position}】的完整学习路线：\n`)
  lines.push(`📋 **岗位概述**`)
  lines.push(`${position.description}\n`)

  lines.push(`🎯 **必备技能清单**`)
  if (position.requiredSkills && position.requiredSkills.length > 0) {
    for (const skill of position.requiredSkills) {
      const emoji = skill.level === '必备' ? '🔴' : skill.level === '优先' ? '🟡' : '🟢'
      lines.push(`${emoji} **${skill.name}**（${skill.level}）：${skill.desc}`)
    }
  }
  lines.push('')

  lines.push(`📚 **分阶段学习路线**`)
  if (position.learningPhases && position.learningPhases.length > 0) {
    for (const phase of position.learningPhases) {
      lines.push(`\n**${phase.phase}**`)
      if (phase.tasks) {
        for (const task of phase.tasks) {
          lines.push(`  • ${task}`)
        }
      }
    }
  }
  lines.push('')

  lines.push(`🔗 **权威学习资源**`)
  if (position.resources && position.resources.length > 0) {
    for (const res of position.resources) {
      lines.push(`  • ${res.name}（${res.type}，${res.level}）：${res.url}`)
    }
  }
  lines.push('')

  if (position.practicePlan) {
    lines.push(`💡 **实践练习方案**`)
    if (position.practicePlan.projects) {
      lines.push('推荐项目：')
      for (const proj of position.practicePlan.projects) {
        lines.push(`  • ${proj}`)
      }
    }
    if (position.practicePlan.practiceCount) {
      lines.push(`练习建议：${position.practicePlan.practiceCount}`)
    }
  }

  return lines.join('\n')
}

// ============================================================
// 【主聊天接口】
// 流程：固定规则检测 → 知识库检索融合 → Coze → 本地兜底
// Coze 失败直接本地兜底
// ============================================================
router.post('/chat', identifyUser, async (req, res) => {
  try {
    const { message, conversation_id, user_id, history } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: '消息内容不能为空' })
    }

    // ========== 游客AI对话次数校验（后端拦截，防止前端作弊）==========
    if (req.user.isGuest) {
      const chatCheck = checkGuestAIChat(req.user.guestSessionId)
      if (!chatCheck.allowed) {
        // 游客对话次数已用完，返回SSE格式的拒绝消息
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.write(`data: ${JSON.stringify({ type: 'guest_limit', message: '您当前为游客模式，对话次数已用完。注册登录后，可无限制使用AI学习顾问！', used: chatCheck.used, limit: chatCheck.limit })}\n\n`)
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        res.end()
        return
      }
      // 校验通过，增加游客对话计数（一轮 = 用户发送一条消息）
      incrementGuestAIChat(req.user.guestSessionId)
      console.log(`[AI] 游客对话计数: ${checkGuestAIChat(req.user.guestSessionId).used}/${chatCheck.limit} (session: ${req.user.guestSessionId})`)
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // ========== 第一步：固定规则前置检测 ==========
    const ruleCheck = checkFixedRules(message)
    if (ruleCheck.matched) {
      console.log('[RuleCheck] 命中固定规则:', ruleCheck.type)
      const sentences = ruleCheck.response.split(/(?<=[。！？\n])/)
      const chunks = sentences.filter(s => s.trim())
      for (const chunk of chunks) {
        if (!res.writable) break
        res.write(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`)
        await new Promise(r => setTimeout(r, 20))
      }
      res.write(`data: ${JSON.stringify({ type: 'completed', mode: 'fixed_rule' })}\n\n`)
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
      return
    }

    // ========== 第二步：知识库检索与融合 ==========
    const kbContext = retrieveKnowledgeBase(message)
    const { systemPrompt, userPrompt } = buildFusedPrompt(message, kbContext, history)

    // ========== 第三步：Coze API调用（融合知识库 + 上下文历史）==========
    const cozeResult = await callCozeWithKnowledge(
      systemPrompt, userPrompt, res, message, user_id, conversation_id, history
    )

    if (cozeResult.success) {
      console.log('[Main] Coze调用成功')
      return
    }

    // ========== 第四步：本地兜底（Coze 失败时直接本地兜底，前端不报错）==========
    console.log('[Main] Coze 失败，启用本地兜底:', cozeResult.reason)
    streamLocalFallback(message, res, history)
  } catch (error) {
    console.error('AI Chat Error:', error)
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`)
      res.end()
    } catch (_) {}
  }
})

// ============================================================
// 【知识库重载接口】
// ============================================================
router.post('/reload-kb', (req, res) => {
  try {
    const kb = loadKnowledgeBase(true)
    res.json({
      status: 'ok',
      message: '知识库已重新加载',
      positions: kb.positions?.length || 0,
      faqCount: kb.faq?.length || 0,
      commonProblemsCount: kb.commonProblems?.length || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Reload KB Error:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// ============================================================
// 【测试接口】
// ============================================================
router.get('/test', async (req, res) => {
  try {
    const testMessage = '前端开发工程师学习路线'
    const kbContext = retrieveKnowledgeBase(testMessage)
    const { systemPrompt, userPrompt } = buildFusedPrompt(testMessage, kbContext)

    const results = {
      knowledgeBaseRetrieval: {
        message: testMessage,
        hasKbContext: !!kbContext,
        kbContextPreview: kbContext ? kbContext.substring(0, 200) + '...' : '无匹配岗位'
      },
      promptFusion: {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        userPromptPreview: userPrompt.substring(0, 200) + '...'
      },
      cozeConfig: {
        configured: !!COZE_API_KEY && !!COZE_BOT_ID
      }
    }

    res.json({ status: 'ok', timestamp: new Date().toISOString(), ...results })
  } catch (error) {
    console.error('Test Error:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

function handleCozeEvent(eventType, data, res) {
  switch (eventType) {
    case 'conversation.chat.created':
      if (data.conversation_id) {
        res.write(`data: ${JSON.stringify({ type: 'conversation_id', conversation_id: data.conversation_id })}\n\n`)
      }
      break

    case 'conversation.message.delta':
      if (data.type === 'answer') {
        const content = data.content || ''
        if (content) {
          res.write(`data: ${JSON.stringify({ type: 'delta', content: content })}\n\n`)
          return { hasContent: true }
        }
      }
      break

    case 'conversation.message.completed':
      if (data.type === 'answer') {
        const content = data.content || ''
        if (content) {
          res.write(`data: ${JSON.stringify({ type: 'completed', content: content })}\n\n`)
          return { hasContent: true }
        }
      }
      break

    case 'conversation.chat.completed':
      break

    case 'conversation.chat.failed':
      console.log('[Coze] Chat failed:', data.last_error)
      break

    case 'conversation.error':
      res.write(`data: ${JSON.stringify({ type: 'error', message: data.msg || 'AI对话错误' })}\n\n`)
      break

    default:
      break
  }
  return { hasContent: false }
}

// ============================================================
// 【AI简历优化接口】
// ============================================================
const RESUME_OPTIMIZE_SYSTEM_PROMPT = `你是一位资深的HR和职业发展顾问，擅长分析简历并提供专业的优化建议。请根据用户提供的简历信息和目标岗位要求，生成详细的分析报告和优化建议。

请严格按照以下JSON格式输出：
{
  "score": {
    "total": 分数(0-100),
    "breakdown": {
      "basic": 基础信息分数,
      "education": 教育背景分数,
      "experience": 工作经历分数,
      "skills": 技能匹配分数,
      "projects": 项目经历分数
    }
  },
  "analysis": {
    "strengths": ["优势1", "优势2", ...],
    "weaknesses": ["不足1", "不足2", ...],
    "summary": "简历总体评价"
  },
  "suggestions": [
    {
      "category": "基础信息|教育背景|工作经历|技能|项目经历",
      "priority": "high|medium|low",
      "title": "优化建议标题",
      "description": "详细描述",
      "example": "示例内容"
    }
  ],
  "keywordSuggestions": {
    "add": ["建议添加的关键词"],
    "remove": ["建议移除的关键词"],
    "optimize": {
      "old": "原关键词",
      "new": "优化后的关键词",
      "reason": "优化原因"
    }
  },
  "contentRewrite": {
    "summary": "重写后的自我评价",
    "responsibilities": "重写后的岗位职责描述",
    "achievements": "重写后的工作业绩"
  }
}

要求：
1. 分析要具体、有针对性，避免空泛建议
2. 分数要合理，体现真实水平
3. 优化建议要可操作
4. 如果目标岗位信息存在，要重点围绕岗位要求分析
5. 使用中文输出`

// AI简历优化接口
router.post('/resume/optimize', async (req, res) => {
  try {
    const { resume, targetJob } = req.body

    if (!resume) {
      return res.status(400).json({ error: '简历数据不能为空' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 构建用户消息
    let userMessage = `请帮我分析和优化这份简历：\n\n`
    
    userMessage += `【简历信息】\n`
    userMessage += `姓名：${resume.name || '未填写'}\n`
    userMessage += `求职意向：${resume.intention || '未填写'}\n`
    userMessage += `学历：${resume.education || '未填写'}\n`
    userMessage += `院校：${resume.school || '未填写'}\n`
    userMessage += `专业：${resume.major || '未填写'}\n`
    userMessage += `工作单位：${resume.company || '未填写'}\n`
    userMessage += `职位：${resume.position || '未填写'}\n`
    userMessage += `工作年限：${resume.experience || '未填写'}\n`
    
    if (resume.skills && resume.skills.length > 0) {
      userMessage += `技能标签：${resume.skills.join('、')}\n`
    }
    
    if (resume.responsibilities) {
      userMessage += `岗位职责：${resume.responsibilities}\n`
    }
    
    if (resume.achievements) {
      userMessage += `工作业绩：${resume.achievements}\n`
    }
    
    if (resume.strengths) {
      userMessage += `个人优势：${resume.strengths}\n`
    }
    
    if (resume.projects && resume.projects.length > 0) {
      userMessage += `项目经历：\n`
      resume.projects.forEach((p, i) => {
        if (p.name) {
          userMessage += `  项目${i+1}：${p.name}，角色：${p.role || '未填写'}\n`
          if (p.desc) userMessage += `    描述：${p.desc}\n`
          if (p.achievements) userMessage += `    成果：${p.achievements}\n`
        }
      })
    }
    
    if (targetJob) {
      userMessage += `\n【目标岗位】\n`
      userMessage += `岗位名称：${targetJob.job_name || '未填写'}\n`
      userMessage += `城市：${targetJob.city || '未填写'}\n`
      userMessage += `学历要求：${targetJob.education || '未填写'}\n`
      userMessage += `经验要求：${targetJob.work_exp || '未填写'}\n`
      if (targetJob.skills && targetJob.skills.length > 0) {
        userMessage += `技能要求：${targetJob.skills.join('、')}\n`
      }
    }

    // 调用Coze API
    const cozeResult = await callCozeWithKnowledge(
      RESUME_OPTIMIZE_SYSTEM_PROMPT,
      userMessage,
      res,
      userMessage,
      'resume-optimize-' + Date.now(),
      null
    )

    if (cozeResult.success) {
      console.log('[ResumeOptimize] Coze调用成功')
      return
    }

    // Coze 失败时直接本地兜底
    console.log('[ResumeOptimize] Coze 失败，启用本地兜底:', cozeResult.reason)
    generateLocalResumeAnalysis(resume, targetJob, res)

  } catch (error) {
    console.error('Resume Optimize Error:', error)
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`)
      res.end()
    } catch (_) {}
  }
})

// 本地简历分析兜底函数
function generateLocalResumeAnalysis(resume, targetJob, res) {
  // 检查用户是否提供了有意义的简历数据
  const hasMeaningfulData = (
    (resume.name && resume.intention) ||
    (resume.education && resume.school) ||
    (resume.company && resume.position) ||
    (resume.skills && resume.skills.length > 0) ||
    (resume.projects && resume.projects.some(p => p.name)) ||
    resume.responsibilities || resume.achievements || resume.strengths
  )
  
  // 如果用户没有提供任何简历数据，返回空分析结果
  if (!hasMeaningfulData) {
    const emptyAnalysis = {
      score: {
        total: 0,
        breakdown: {
          basic: 0,
          education: 0,
          experience: 0,
          skills: 0,
          projects: 0
        }
      },
      analysis: {
        strengths: [],
        weaknesses: [],
        summary: '请先填写您的简历信息！需要您提供：基本信息（姓名、求职意向）、教育背景、工作经历、技能标签等，才能生成真实的AI分析报告。'
      },
      suggestions: [],
      keywordSuggestions: {
        add: [],
        remove: [],
        optimize: []
      },
      contentRewrite: {
        summary: '',
        responsibilities: '',
        achievements: ''
      },
      isEmpty: true
    }
    
    const resultText = JSON.stringify(emptyAnalysis)
    const chunks = resultText.match(/.{1,100}/g) || [resultText]
    
    for (const chunk of chunks) {
      if (!res.writable) break
      res.write(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`)
    }
    
    res.write(`data: ${JSON.stringify({ type: 'completed', mode: 'local_fallback' })}\n\n`)
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
    return
  }
  
  const analysis = {
    score: {
      total: 0,
      breakdown: {
        basic: resume.name && resume.intention ? 20 : 0,
        education: resume.education && resume.school ? 20 : 0,
        experience: resume.company && resume.position ? 15 : 0,
        skills: (resume.skills || []).length >= 5 ? 15 : (resume.skills || []).length >= 3 ? 10 : (resume.skills || []).length > 0 ? 5 : 0,
        projects: (resume.projects || []).filter(p => p.name).length >= 2 ? 10 : (resume.projects || []).filter(p => p.name).length >= 1 ? 5 : 0
      }
    },
    analysis: {
      strengths: [],
      weaknesses: [],
      summary: ''
    },
    suggestions: [],
    keywordSuggestions: {
      add: [],
      remove: [],
      optimize: []
    },
    contentRewrite: {
      summary: '',
      responsibilities: '',
      achievements: ''
    },
    isEmpty: false
  }

  // 分析优势
  if (resume.skills && resume.skills.length >= 5) {
    analysis.analysis.strengths.push('技能标签丰富，展现了多项技术能力')
  }
  if (resume.projects && resume.projects.some(p => p.name && p.achievements)) {
    analysis.analysis.strengths.push('项目经历完整，有量化成果')
  }
  if (resume.achievements) {
    analysis.analysis.strengths.push('有工作业绩描述')
  }

  // 分析不足
  if (!resume.skills || resume.skills.length < 3) {
    analysis.analysis.weaknesses.push('技能标签较少，建议补充3-5项核心技能')
  }
  if (!resume.responsibilities) {
    analysis.analysis.weaknesses.push('缺少岗位职责描述')
  }
  if (!resume.achievements) {
    analysis.analysis.weaknesses.push('缺少工作业绩描述')
  }
  if (!resume.projects || !resume.projects.some(p => p.name)) {
    analysis.analysis.weaknesses.push('缺少项目经历')
  }

  // 生成总体评价
  const totalScore = Object.values(analysis.score.breakdown).reduce((a, b) => a + b, 0)
  analysis.score.total = totalScore
  if (totalScore >= 80) {
    analysis.analysis.summary = '简历基础扎实，内容完整，具有较强竞争力。建议重点优化岗位匹配度，突出与目标岗位相关的技能和经验。'
  } else if (totalScore >= 60) {
    analysis.analysis.summary = '简历内容基本完整，但在技能展示和项目经验方面还有提升空间。建议补充更多量化成果和技术细节。'
  } else {
    analysis.analysis.summary = '简历内容较为基础，建议重点完善工作经历、技能标签和项目经验，以增强竞争力。'
  }

  // 基于目标岗位的建议
  if (targetJob) {
    const jobSkills = targetJob.skills || []
    const userSkills = resume.skills || []
    const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
    
    if (missingSkills.length > 0) {
      analysis.suggestions.push({
        category: '技能',
        priority: 'high',
        title: `补充岗位所需技能`,
        description: `目标岗位要求的技能中，您缺少：${missingSkills.slice(0, 5).join('、')}。建议优先学习这些技能，并在简历中体现相关经验。`,
        example: `在技能标签中添加：${missingSkills.slice(0, 3).join('、')}`
      })
      analysis.keywordSuggestions.add = missingSkills.slice(0, 5)
    }

    if (targetJob.education && resume.education) {
      const eduLevels = { '不限': 0, '大专': 1, '本科': 2, '硕士': 3, '博士': 4 }
      const jobLevel = eduLevels[targetJob.education] || 0
      const userLevel = eduLevels[resume.education] || 0
      if (userLevel < jobLevel) {
        analysis.suggestions.push({
          category: '教育背景',
          priority: 'medium',
          title: '学历差距弥补建议',
          description: `目标岗位要求${targetJob.education}学历，您目前是${resume.education}。建议通过突出实践经验、项目成果和专业技能来弥补学历差距。`,
          example: '在简历中突出相关领域的项目经验和技术深度'
        })
      }
    }
  }

  // 通用建议
  if (!resume.responsibilities) {
    analysis.suggestions.push({
      category: '工作经历',
      priority: 'high',
      title: '补充岗位职责描述',
      description: '详细描述您在前公司的工作职责、参与的项目、负责的模块等，让HR了解您的工作内容。',
      example: '负责XX系统的开发与维护，参与需求分析、技术方案设计、核心功能实现；优化系统性能，提升代码质量'
    })
  }

  if (!resume.achievements) {
    analysis.suggestions.push({
      category: '工作经历',
      priority: 'high',
      title: '添加量化工作业绩',
      description: '用数据说话，展示您的工作成果。例如：性能提升百分比、用户增长、代码量减少等。',
      example: '主导XX模块开发，系统性能提升30%；优化代码架构，减少代码量25%；推动团队技术分享，累计完成10+分享'
    })
  }

  if (!resume.projects || !resume.projects.some(p => p.name)) {
    analysis.suggestions.push({
      category: '项目经历',
      priority: 'high',
      title: '添加项目经历',
      description: '项目经历是技术岗位简历的核心，建议添加至少2个有代表性的项目，包含项目背景、您的角色、技术栈和成果。',
      example: '项目名称：XX管理系统；角色：前端负责人；技术栈：Vue/React；成果：主导架构设计，页面加载速度提升40%'
    })
  }

  if (!resume.strengths) {
    analysis.suggestions.push({
      category: '基础信息',
      priority: 'medium',
      title: '撰写个人优势',
      description: '总结您的核心竞争力，突出与目标岗位相关的技能和经验。',
      example: '扎实的XX技术基础，熟练掌握XX技能；良好的团队协作精神；注重代码质量和系统性能'
    })
  }

  // 重写建议 - 仅在用户提供了相关简历数据时才生成
  const hasSkills = resume.skills && resume.skills.length > 0
  const hasIntention = !!resume.intention
  const hasWorkExp = resume.company && resume.position
  const hasProjects = resume.projects && resume.projects.some(p => p.name)
  
  const techStack = hasSkills ? resume.skills.slice(0, 3).join('、') : ''
  const position = hasIntention ? resume.intention : ''
  
  if (hasSkills || hasWorkExp || hasIntention) {
    analysis.contentRewrite.responsibilities = `负责基于${techStack || '相关技术'}的${position || '相关领域'}系统开发与维护；参与产品需求分析、技术方案设计和核心功能实现；优化系统性能，提升代码质量和开发效率；与团队协作完成项目交付，持续跟进技术发展。`
  }
  
  if (hasWorkExp || hasProjects) {
    analysis.contentRewrite.achievements = `主导核心模块开发，系统性能提升30%；优化代码架构，减少代码量25%，可维护性显著提升；推动团队技术分享，累计完成10+技术分享；参与项目从0到1建设，支撑百万级用户。`
  }
  
  if (hasSkills || hasIntention) {
    analysis.contentRewrite.summary = `${position || '相关领域'}专业背景，扎实的技术基础；熟练掌握${techStack || '主流技术'}，具备独立开发能力；良好的团队协作精神和沟通能力，善于学习新技术；注重代码质量和系统性能，追求卓越。`
  }

  // 流式输出结果
  const resultText = JSON.stringify(analysis)
  const chunks = resultText.match(/.{1,100}/g) || [resultText]
  
  for (const chunk of chunks) {
    if (!res.writable) break
    res.write(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`)
  }

  res.write(`data: ${JSON.stringify({ type: 'completed', mode: 'local_fallback' })}\n\n`)
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
  res.end()
}

// 简历关键词优化接口
router.post('/resume/keywords', async (req, res) => {
  try {
    const { jobDescription, currentSkills } = req.body

    if (!jobDescription) {
      return res.status(400).json({ error: '岗位描述不能为空' })
    }

    // 从岗位描述中提取关键词
    const keywordExtraction = extractKeywordsFromJob(jobDescription, currentSkills || [])
    
    res.json({
      status: 'ok',
      data: keywordExtraction
    })
  } catch (error) {
    console.error('Keywords Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// 关键词提取辅助函数
function extractKeywordsFromJob(jobDesc, currentSkills) {
  const skillKeywords = {
    '前端开发': ['JavaScript', 'Vue', 'React', 'HTML', 'CSS', 'TypeScript', 'Webpack'],
    '后端开发': ['Java', 'Python', 'Go', 'Spring', 'Django', 'MySQL', 'Redis'],
    '算法': ['Python', '机器学习', '深度学习', 'TensorFlow', 'PyTorch', 'NLP'],
    '大数据': ['Hadoop', 'Spark', 'Kafka', 'Hive', 'Flink'],
    '运维': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins'],
    '数据库': ['MySQL', 'MongoDB', 'Redis', 'Oracle', 'PostgreSQL']
  }

  const foundSkills = []
  const missingSkills = []

  for (const [category, skills] of Object.entries(skillKeywords)) {
    for (const skill of skills) {
      if (jobDesc.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.push({ name: skill, category })
        if (!currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))) {
          missingSkills.push(skill)
        }
      }
    }
  }

  return {
    foundSkills,
    missingSkills,
    suggestedSkills: missingSkills.slice(0, 10),
    summary: `从岗位描述中识别出${foundSkills.length}项技术关键词，建议优先学习：${missingSkills.slice(0, 5).join('、')}`
  }
}

module.exports = router