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

module.exports = router