const express = require('express')
const router = express.Router()

// 模拟AI回复数据库
const aiResponses = {
  planning: {
    keywords: ['规划', '学业', '专业', '发展路线', '学习计划', '职业规划'],
    responses: [
      '根据学业规划模块的数据分析，我为您提供以下建议：\n\n1. **明确职业发展方向**：结合您的兴趣、技能和市场需求，确定目标职业领域\n2. **制定阶段性学习目标**：将长期目标分解为学期/学年可执行的小目标\n3. **注重实践项目积累**：参与科研、竞赛、实习等活动，增强简历含金量\n4. **定期复盘调整**：每学期评估进度，灵活调整规划\n\n💡 您可以进入「学业-就业双向联动规划」页面获取更详细的个性化建议，系统会根据您的实际情况生成专属规划路线。'
    ]
  },
  resume: {
    keywords: ['简历', '优化', '通过率', '求职', '面试', '求职'],
    responses: [
      '关于简历优化，我为您总结了以下核心要点：\n\n📌 **内容优化**：\n• 突出与目标岗位匹配的核心技能，放在显眼位置\n• 使用量化数据展示成果（如：提升效率30%、管理50人团队）\n• 保持简洁专业，控制在2页以内\n\n📌 **格式规范**：\n• 使用清晰的层级结构，便于HR快速扫描\n• 关键信息加粗或使用项目符号\n• 确保没有错别字和格式混乱\n\n📌 **AI智能优化**：\n• 进入「AI简历」页面，上传简历即可获得智能分析\n• 系统会针对目标岗位给出具体的优化建议'
    ]
  },
  statistics: {
    keywords: ['人才', '需求', '行业', '热门', '招聘', '就业数据'],
    responses: [
      '根据人才统计模块的最新数据分析，当前热门行业趋势如下：\n\n🔥 **热门行业TOP5**：\n1. 人工智能/机器学习 - 岗位需求年增长35%\n2. 大数据/云计算 - 数字化转型推动需求\n3. 新能源/智能制造 - 政策支持下快速发展\n4. 生物医药/医疗科技 - 疫情后持续投入\n5. 金融科技 - 金融数字化转型\n\n📊 **技能需求排名**：\n• Python、Java、JavaScript等编程语言\n• 数据分析、机器学习、深度学习\n• 云原生、DevOps、微服务架构\n\n📈 如需详细数据可视化，请进入「人才专项统计模块」查看实时数据大屏。'
    ]
  },
  prediction: {
    keywords: ['趋势', '预测', '未来', '就业趋势', '行业前景', '发展'],
    responses: [
      '根据行业预测模型分析，未来3年就业趋势预测如下：\n\n🚀 **增长型领域**：\n• AI相关岗位需求年增长30%+\n• 数字化转型人才缺口超过500万\n• 复合型技能人才最受欢迎\n• 绿色能源、碳中和相关岗位快速崛起\n\n💡 **关键能力**：\n• 跨界融合能力（技术+业务）\n• 持续学习和适应变化\n• 创新思维和问题解决能力\n• 数字化工具使用熟练度\n\n🎯 **建议**：关注「行业供需预测」模块，系统会基于大数据分析为您提供行业趋势的详细图表和预测。'
    ]
  },
  recommend: {
    keywords: ['岗位', '推荐', '工作', '求职', '招聘', '匹配'],
    responses: [
      '为了给您推荐最合适的岗位，我建议您完成以下准备：\n\n🎯 **完善简历信息**：\n• 填写完整的教育背景和实习经历\n• 详细描述您的技能和项目经验\n• 附上作品集或项目链接\n\n💼 **明确求职意向**：\n• 确定期望的城市和薪资范围\n• 选择意向行业和岗位类型\n• 设定优先级（兴趣/薪资/发展空间）\n\n🤖 **AI智能匹配**：\n• 进入「智能岗位推荐」页面\n• 系统会基于您的简历和偏好进行多维度匹配\n• 为您推荐最适合的岗位，并说明匹配度依据\n\n📊 当前平台已有27,000+优质岗位等待您的发现！'
    ]
  },
  general: {
    responses: [
      '您好！我是AI就业规划助手 🤖\n\n我可以为您提供以下方面的帮助：\n\n📚 **学业规划** - 帮您规划大学专业发展路线\n💼 **简历优化** - 提升简历通过率和求职竞争力\n📊 **人才数据** - 分析当下热门行业人才需求\n🔮 **行业预测** - 展望未来3年就业趋势\n🎯 **岗位推荐** - 为您匹配最合适的岗位\n\n💡 您可以直接输入问题，或点击快捷提问开始咨询！'
    ]
  }
}

// 根据消息内容和模块获取回复
function generateReply(message, module) {
  const lowerMessage = message.toLowerCase()
  
  // 如果指定了模块，直接使用该模块的回复
  if (module && module !== 'general' && aiResponses[module]) {
    const responses = aiResponses[module].responses
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  // 否则根据关键词匹配
  for (const [key, value] of Object.entries(aiResponses)) {
    if (key === 'general') continue
    if (value.keywords && value.keywords.some(kw => lowerMessage.includes(kw.toLowerCase()))) {
      const responses = value.responses
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  
  // 默认回复
  const responses = aiResponses.general.responses
  return responses[Math.floor(Math.random() * responses.length)]
}

// POST /api/ai-assistant/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, module = 'general', history = [] } = req.body
    
    if (!message || !message.trim()) {
      return res.json({
        success: false,
        error: '消息内容不能为空'
      })
    }
    
    // 模拟AI思考延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    const reply = generateReply(message.trim(), module)
    
    res.json({
      success: true,
      data: {
        reply,
        module,
        timestamp: new Date().toISOString(),
        typingDuration: reply.length * 30 // 模拟打字时长
      }
    })
  } catch (error) {
    console.error('AI Assistant Error:', error)
    res.json({
      success: false,
      error: '服务器内部错误，请稍后重试'
    })
  }
})

// GET /api/ai-assistant/modules - 获取模块信息
router.get('/modules', (req, res) => {
  res.json({
    success: true,
    data: [
      { key: 'planning', name: '学业规划', icon: '📚', description: '学业-就业双向联动规划' },
      { key: 'resume', name: 'AI简历', icon: '💼', description: '智能简历优化与分析' },
      { key: 'statistics', name: '人才统计', icon: '📊', description: '行业人才需求统计' },
      { key: 'prediction', name: '行业预测', icon: '🔮', description: '行业供需趋势预测' },
      { key: 'recommend', name: '岗位推荐', icon: '🎯', description: '智能岗位匹配推荐' }
    ]
  })
})

module.exports = router
