const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

const COZE_API_KEY = process.env.COZE_API_KEY
const COZE_BOT_ID = process.env.COZE_BOT_ID
const COZE_API_BASE = process.env.COZE_API_BASE || 'https://api.coze.cn'
const COZE_TIMEOUT = 15000

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com'
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
const DEEPSEEK_TIMEOUT = 30000

// ============================================================
// 【系统提示词 - Coze与DeepSeek强制统一】
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

function loadKnowledgeBase() {
  if (knowledgeBase) return knowledgeBase
  try {
    const filePath = path.join(__dirname, '..', 'data', 'local-knowledge-base.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    knowledgeBase = JSON.parse(raw)
    console.log('[KnowledgeBase] 本地知识库加载成功，共', knowledgeBase.positions.length, '个岗位')
  } catch (e) {
    console.error('[KnowledgeBase] 加载失败:', e.message)
    knowledgeBase = { positions: [], defaultResponse: {} }
  }
  return knowledgeBase
}

loadKnowledgeBase()

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
  if (!knowledgeBase || !knowledgeBase.positions || knowledgeBase.positions.length === 0) {
    return null
  }

  const msgLower = message.toLowerCase()
  const scores = []

  for (const pos of knowledgeBase.positions) {
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
function buildFusedPrompt(message, kbContext) {
  if (!kbContext) {
    return {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: message
    }
  }

  const fusedUserPrompt = `【知识库参考素材】
以下是从系统知识库中检索到的与您问题相关的岗位学习素材，仅供参考：

${kbContext}

【当前用户问题】
${message}

【回答要求】
请结合以上知识库素材，融合当前行业最新岗位技能趋势，为用户生成一份完整的学习规划回答。
要求：
1. 不要直接复制知识库原文，要进行融合优化
2. 结合当前技术栈发展和行业需求进行补充
3. 保持结构化、条理清晰
4. 如果知识库素材有局限，使用通用知识补充但标注"结合当前行业趋势补充"`

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: fusedUserPrompt
  }
}

// ============================================================
// 【DeepSeek降级调用】
// 当Coze失败时，使用相同的系统提示词和知识库融合逻辑调用DeepSeek
// ============================================================
async function callDeepSeekFallback(systemPrompt, userPrompt, res, conversationId, userId) {
  if (!DEEPSEEK_API_KEY) {
    console.warn('[DeepSeek] API Key未配置，跳过降级')
    return false
  }

  console.log('[DeepSeek] 开始调用降级模型...')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT)

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DeepSeek] API错误:', response.status, errorText.substring(0, 200))
      return false
    }

    if (conversationId) {
      res.write(`data: ${JSON.stringify({ type: 'conversation_id', conversation_id: conversationId })}\n\n`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let gotContent = false
    let chunkCount = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue

        const dataStr = trimmedLine.slice(5).trim()
        if (dataStr === '[DONE]') continue

        try {
          const data = JSON.parse(dataStr)
          const delta = data.choices && data.choices[0] && data.choices[0].delta
          if (delta && delta.content) {
            res.write(`data: ${JSON.stringify({ type: 'delta', content: delta.content })}\n\n`)
            gotContent = true
          }
        } catch (e) {
          // 忽略非JSON
        }
      }
    }

    console.log('[DeepSeek] 完成, chunks:', chunkCount, '有内容:', gotContent)

    if (gotContent) {
      res.write(`data: ${JSON.stringify({ type: 'completed', mode: 'deepseek_fallback' })}\n\n`)
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
      return true
    }

    return false
  } catch (error) {
    console.error('[DeepSeek] 调用异常:', error.message)
    return false
  }
}

// ============================================================
// 【Coze API调用 - 融合知识库版】
// ============================================================
async function callCozeWithKnowledge(systemPrompt, userPrompt, res, message, userId, conversationId) {
  if (!COZE_API_KEY || !COZE_BOT_ID) {
    console.warn('[Coze] 配置缺失')
    return { success: false, reason: 'config_missing' }
  }

  const injectedContent = `[系统角色设定]\n${systemPrompt}\n\n[用户提问]\n${userPrompt}`

  const requestBody = {
    bot_id: COZE_BOT_ID,
    user_id: userId || 'it-career-user-' + Date.now(),
    stream: true,
    additional_messages: [
      {
        role: 'user',
        content: injectedContent,
        content_type: 'text'
      }
    ]
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
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            res.end()
            return { success: true }
          }

          try {
            const data = JSON.parse(dataStr)
            const eventType = data.event || currentEvent

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
// 【本地兜底 - 仅在双模型均失败时使用】
// 直接返回知识库格式化内容（最后兜底，保证有响应）
// ============================================================
function streamLocalFallback(message, res) {
  const position = fuzzyMatchPosition(message)

  if (!position) {
    const helpMsg = knowledgeBase.defaultResponse.helpMessage || '抱歉，AI服务暂时不可用，请稍后重试。'
    const sentences = helpMsg.split(/(?<=[。！？\n])/)
    const chunks = sentences.filter(s => s.trim())
    for (const chunk of chunks) {
      if (!res.writable) break
      res.write(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`)
      setTimeout(() => {}, 20)
    }
    res.write(`data: ${JSON.stringify({ type: 'completed', mode: 'local_fallback' })}\n\n`)
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
    return
  }

  const answer = formatPositionAnswer(position, message)
  const sentences = answer.split(/(?<=[。！？\n])/)
  const chunks = sentences.filter(s => s.trim())

  for (const chunk of chunks) {
    if (!res.writable) break
    res.write(`data: ${JSON.stringify({ type: 'delta', content: chunk })}\n\n`)
  }

  res.write(`data: ${JSON.stringify({ type: 'completed', mode: 'local_fallback' })}\n\n`)
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
  res.end()
}

function fuzzyMatchPosition(message) {
  if (!knowledgeBase || !knowledgeBase.positions || knowledgeBase.positions.length === 0) {
    return null
  }

  const msgLower = message.toLowerCase()
  const scores = []

  for (const pos of knowledgeBase.positions) {
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
    return knowledgeBase.defaultResponse.helpMessage || '暂时无法回答您的问题。'
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
// 流程：固定规则检测 → 知识库检索融合 → Coze → DeepSeek降级 → 本地兜底
// ============================================================
router.post('/chat', async (req, res) => {
  try {
    const { message, conversation_id, user_id } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: '消息内容不能为空' })
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
    const { systemPrompt, userPrompt } = buildFusedPrompt(message, kbContext)

    // ========== 第三步：Coze API调用（融合知识库）==========
    const cozeResult = await callCozeWithKnowledge(
      systemPrompt, userPrompt, res, message, user_id, conversation_id
    )

    if (cozeResult.success) {
      console.log('[Main] Coze调用成功')
      return
    }

    // ========== 第四步：DeepSeek降级（融合知识库）==========
    console.log('[Main] Coze失败，切换DeepSeek降级:', cozeResult.reason)
    const deepseekOk = await callDeepSeekFallback(
      systemPrompt, userPrompt, res, conversation_id, user_id
    )

    if (deepseekOk) {
      console.log('[Main] DeepSeek降级成功')
      return
    }

    // ========== 第五步：本地兜底（双模型均失败）==========
    console.log('[Main] 双模型均失败，启用本地兜底')
    streamLocalFallback(message, res)
  } catch (error) {
    console.error('AI Chat Error:', error)
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`)
      res.end()
    } catch (_) {}
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
      deepseekConfig: {
        configured: !!DEEPSEEK_API_KEY,
        model: DEEPSEEK_MODEL
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

    // Coze失败时使用DeepSeek降级
    console.log('[ResumeOptimize] Coze失败，切换DeepSeek降级:', cozeResult.reason)
    const deepseekOk = await callDeepSeekFallback(
      RESUME_OPTIMIZE_SYSTEM_PROMPT,
      userMessage,
      res,
      null,
      'resume-optimize-' + Date.now()
    )

    if (deepseekOk) {
      console.log('[ResumeOptimize] DeepSeek降级成功')
      return
    }

    // 本地兜底
    console.log('[ResumeOptimize] 双模型均失败，启用本地兜底')
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