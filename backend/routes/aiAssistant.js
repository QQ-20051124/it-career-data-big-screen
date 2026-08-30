const express = require('express')
const multer = require('multer')
const path = require('path')
const jobService = require('../services/jobService')
const router = express.Router()

// 文件上传配置
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

// ============ 通用场景回复模板 ============
const greetingReplies = [
  (name) => name
    ? `${name}，你好呀！😊 很高兴再次和你聊天～\n\n今天想了解什么呢？是职业规划、简历优化、岗位推荐还是行业数据？`
    : '你好呀！😊 我是AI就业规划助手～\n\n我可以帮你解答学业规划、简历优化、人才数据、行业趋势、岗位推荐等问题。\n\n方便告诉我怎么称呼你吗？这样我能更亲切地和你聊天～',
  (name) => name
    ? `嗨，${name}！有什么可以帮你的吗？`
    : '嗨！👋 我是你的AI就业助手～\n\n无论是学习路线、简历打磨，还是薪资行情、岗位匹配，都可以问我哦！\n\n对了，你叫什么名字呀？',
  (name) => name
    ? `${name}下午好～☀️ 今天想聊点什么？`
    : '下午好～☀️ 我是AI就业规划小助手！\n\n告诉我你的问题，或者先告诉我你的名字也行～'
]

const nameExtractPatterns = [
  /我是([^\s，。！？,.!?]{1,8})/,
  /我叫([^\s，。！？,.!?]{1,8})/,
  /我的名字(?:是|叫|为)?([^\s，。！？,.!?]{1,8})/,
  /你可以叫我([^\s，。！？,.!?]{1,8})/,
  /叫我([^\s，。！？,.!?]{1,8})就行/,
  /叫我([^\s，。！？,.!?]{1,8})/
]
const nameBlacklist = new Set([
  '吗', '呢', '啊', '吧', '呀', '哦', '嗯', '好', '是', '在', '想', '要', '会', '能',
  '你好', '您好', 'hi', 'hello', '嗨', '哈喽', '什么', '怎么', '如何', '为什么',
  '哪里', '哪个', '多少', '工作', '岗位', '简历', '面试', '薪资', '城市', '技能',
  '项目', '规划', '推荐', '适合', '匹配', '找工作', '我想', '我要', '我在', '本人',
  // —— 补齐常见业务/场景关键词，避免误判为取名 ——
  '谢谢', '感谢', '多谢', '拜拜', '再见', '告辞',
  '你是谁', '介绍', '自我介绍', '你叫什么', '功能', '前端', '后端', '算法',
  '测试', '数据', '分析', '简历优化', '前端岗位', '前端开发', '后端开发',
  'java', 'python', 'vue', 'react', '学历', '本科', '硕士', '专科',
  '实习', '全职', '招聘', '求职', '投递', '公司', '行业', '趋势', '前景'
])
// 非取名语义的动作/关键词集合（当输入包含这些词时，跳过纯名字兜底）
const nonNameHints = ['你好', '您好', 'hi', 'hello', '嗨', '哈喽', '谢谢', '感谢', '多谢',
  '拜拜', '再见', '告辞', '辛苦', '你是谁', '你叫什么', '介绍', '功能', '能做什么',
  '薪资', '工资', '薪酬', '待遇', '多少钱', '简历', '岗位', '工作', '招聘', '求职',
  '面试', '笔试', '前端', '后端', '算法', '测试', '数据', 'java', 'python', 'vue',
  'react', '项目', '学习', '规划', '推荐', '匹配', '城市', '学历', '本科', '硕士',
  '行业', '趋势', '前景', '政策', '补贴', '统计', '数据', '多少']
function extractUserName(text) {
  const raw = text.trim()
  for (const p of nameExtractPatterns) {
    const m = raw.match(p)
    if (m && m[1]) {
      const n = m[1].trim()
      if (n.length >= 1 && n.length <= 8 && !nameBlacklist.has(n.toLowerCase())) {
        return n
      }
    }
  }
  // 纯名字兜底：必须满足——
  //   长度 2-4 个纯中文字，或 2-8 个纯英文字母
  //   不在 nameBlacklist 中
  //   不包含任何非取名类关键词提示
  const hasNonNameHint = nonNameHints.some(h => raw.toLowerCase().includes(h.toLowerCase()))
  if (!hasNonNameHint) {
    if (raw.length >= 2 && raw.length <= 4 && /^[\u4e00-\u9fa5]+$/.test(raw)) {
      if (!nameBlacklist.has(raw.toLowerCase())) return raw
    }
    if (raw.length >= 2 && raw.length <= 8 && /^[a-zA-Z]+$/.test(raw)) {
      if (!nameBlacklist.has(raw.toLowerCase())) return raw
    }
  }
  return null
}

const identityReplies = [
  (name) => name
    ? `${name}，我是你的专属AI就业规划助手呀～😉\n\n我精通五大板块：\n📚 学业规划 | 💼 简历优化 | 📊 人才数据 | 🔮 行业预测 | 🎯 岗位推荐\n\n有什么问题尽管问我！`
    : '我是AI就业规划助手，专注IT领域的求职与学习规划哦～😉\n\n我可以帮你：\n📚 制定学习路线与职业规划\n💼 优化简历与面试准备\n📊 分析薪资与岗位数据\n🔮 解读行业发展趋势\n🎯 智能匹配适合你的岗位\n\n先告诉我怎么称呼你吧～',
  (name) => name
    ? `我是${name}的AI小助手呀，职业规划和求职方面有什么想知道的吗？`
    : '我是专注IT求职的AI助手，有职业规划、简历、岗位、薪资相关的问题都可以问我！'
]

const thanksReplies = [
  (name) => name ? `${name}不客气～能帮到你我也很高兴！😊 还有其他问题随时问我哦～` : '不客气～😊 还有其他问题随时问我哦！',
  (name) => name ? `${name}不用谢～求职路上我一直都在！` : '不用谢～求职路上我一直都在！加油💪',
  (name) => name ? `嘿嘿，${name}满意就好～还有什么想聊的吗？` : '嘿嘿，满意就好～还有什么想聊的吗？'
]

const goodbyeReplies = [
  (name) => name ? `${name}再见啦～👋 祝你求职顺利，offer多多！有需要随时回来找我哦～` : '再见啦～👋 祝你求职顺利，offer多多！下次见！',
  (name) => name ? `${name}拜拜～记得常来看看呀！✨` : '拜拜～记得常来看看呀！✨ 加油！'
]

const clarifyReplies = [
  (name, msg) => {
    const prefix = name ? `${name}，` : ''
    return `${prefix}我理解你可能想了解「${msg}」相关的内容，不过能说得再具体一点吗？\n\n比如可以告诉我：\n• 你关注哪个方向？（前端/后端/数据/AI/测试）\n• 你想了解薪资、岗位、城市，还是学习路线？\n• 你是应届生还是有工作经验？\n\n这样我就能给出更精准的回答啦～😊`
  },
  (name, msg) => {
    const prefix = name ? `${name}，` : ''
    return `${prefix}关于「${msg}」，我可以从多个角度为你分析～\n\n你可以补充一下：\n• 你的目标城市或公司类型？\n• 你目前的学历或技能情况？\n• 你更关心数据、建议还是具体操作步骤？`
  }
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 获取真实人才数据统计
function getRealStats() {
  try {
    const info = jobService.getDataInfo()
    const salary = jobService.getSalaryStatistics()
    const cities = jobService.getCityStatistics()
    // 热门岗位统计（按job_name关键词）
    const jobNameMap = {}
    const allJobs = require('../data/all_cleaned_jobs.json') // 兜底直读
    const rawJobs = allJobs.length ? allJobs : []
    rawJobs.forEach(job => {
      const name = (job.job_name || '').toLowerCase()
      if (name.includes('前端')) jobNameMap['前端开发'] = (jobNameMap['前端开发'] || 0) + 1
      if (name.includes('java') || name.includes('后端')) jobNameMap['Java后端'] = (jobNameMap['Java后端'] || 0) + 1
      if (name.includes('python') || name.includes('数据') || name.includes('分析')) jobNameMap['数据/分析'] = (jobNameMap['数据/分析'] || 0) + 1
      if (name.includes('算法') || name.includes('ai') || name.includes('人工智能')) jobNameMap['AI算法'] = (jobNameMap['AI算法'] || 0) + 1
      if (name.includes('测试')) jobNameMap['测试开发'] = (jobNameMap['测试开发'] || 0) + 1
    })
    const hotJobs = Object.entries(jobNameMap).sort((a,b) => b[1] - a[1]).slice(0, 5)
    // 学历统计
    const eduMap = {}
    rawJobs.forEach(job => {
      const e = job.education || '不限'
      eduMap[e] = (eduMap[e] || 0) + 1
    })
    const topEdu = Object.entries(eduMap).sort((a,b) => b[1] - a[1]).slice(0, 3)
    return {
      totalCount: info.totalCount || 0,
      lastUpdated: info.lastUpdated,
      avgSalary: salary.avg || 0,
      maxSalary: salary.max || 0,
      medianSalary: salary.median || 0,
      topCities: cities.slice(0, 6),
      hotJobs,
      topEdu
    }
  } catch (e) {
    console.error('[aiAssistant] getRealStats error:', e.message)
    return null
  }
}
function formatNumber(n) {
  if (!n) return '0'
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 在一组场景中找到加权得分最高的匹配（用于替代"第一个命中就返回"）
function findBestScene(lowerMsg, scenes, moduleKey, attachScore = false) {
  let best = null
  let bestScore = 0
  // 行动/意图词 —— 当输入包含这些词时，给对应模块额外加权
  const moduleBoosts = {
    resume:     { words: ['简历', '项目经历', '技能标签', '模板', '排版', '投递', '面试', '没有实习'], boost: 12 },
    recommend:  { words: ['岗位', '推荐', '匹配', '适合', '找工作', '招聘', '求职', '投递', 'offer', '实习'], boost: 12 },
    statistics: { words: ['薪资', '工资', '待遇', '多少钱', '薪酬', '热门', '缺人', '城市', '一线', '二线', '学历', '本科', '硕士', '统计', '数据'], boost: 8 },
    prediction: { words: ['趋势', '前景', '未来', '行业', '预测', '风口', '寒冬', '裁员', '失业', '内卷', '就业难', '发展方向'], boost: 10 },
    planning:   { words: ['大一', '大二', '大三', '大四', '学习', '规划', '路线', '转专业', '转行', '考研', '自学', '计划'], boost: 10 }
  }
  const boostCfg = moduleBoosts[moduleKey] || null
  for (const scene of scenes) {
    let score = 0
    let matchedCount = 0
    for (const rawKw of scene.keywords) {
      const kw = rawKw.toLowerCase()
      if (lowerMsg.includes(kw)) {
        matchedCount++
        // 精确长度加分：越长的关键词，说明匹配越精准
        score += 5 + kw.length * 2
        // 完全相等再加
        if (lowerMsg === kw) score += 10
      }
    }
    if (matchedCount === 0) continue
    // 命中次数额外加分
    score += matchedCount * 2
    // 模块意图词加成（输入中含该模块特征词）
    if (boostCfg) {
      for (const w of boostCfg.words) {
        if (lowerMsg.includes(w.toLowerCase())) score += boostCfg.boost / 2
      }
    }
    if (score > bestScore) {
      bestScore = score
      best = scene
    }
  }
  if (best && attachScore) best._score = bestScore
  return best
}

// ============ 精细化关键词知识库 ============
// 每个场景包含：匹配关键词、权重、专属回复
const knowledgeBase = [
  // ===== 学业规划 =====
  {
    module: 'planning',
    scenes: [
      {
        keywords: ['大一', '新生', '刚入学', '大一新生'],
        reply: '欢迎开始大学生活！大一阶段的规划建议：\n\n📌 **第一学期重点**：\n• 打好专业基础课（高数、编程基础等）\n• 加入1-2个兴趣社团，拓展人脉\n• 了解本专业的就业方向和核心技能要求\n\n📌 **第二学期重点**：\n• 开始学习一门编程语言（Python/Java推荐）\n• 参加校级编程竞赛或创新项目\n• 关注学长学姐的实习经验分享\n\n💡 大一是探索期，不必急于定型，多尝试不同方向！'
      },
      {
        keywords: ['大二', '大二学生', '专业方向', '分流'],
        reply: '大二阶段是确定方向的关键期，建议：\n\n📌 **专业深化**：\n• 确定细分方向（如前端/后端/数据/AI等）\n• 深入学习核心专业课，GPA保持在3.0+\n• 开始做个人项目，建立GitHub仓库\n\n📌 **技能积累**：\n• 掌握至少一门框架（Vue/React/SpringBoot等）\n• 参加蓝桥杯、ACM等竞赛提升算法能力\n• 尝试申请暑期实习（大厂提前批）\n\n💡 您可以进入「学业-就业双向联动规划」页面，系统会根据您的专业自动生成个性化路线。'
      },
      {
        keywords: ['大三', '实习', '考研', '找工作', '秋招'],
        reply: '大三是冲刺期，面临实习/考研/求职的关键选择：\n\n📌 **选择实习**：\n• 3-4月开始投递暑期实习\n• 优先选择与目标岗位匹配的公司\n• 实习期间积累项目经验，争取转正机会\n\n📌 **选择考研**：\n• 3月前确定目标院校和专业\n• 制定详细的复习计划（数学/英语/专业课/政治）\n• 保持每天8小时以上有效学习时间\n\n📌 **准备秋招**：\n• 暑假前完成简历打磨和项目总结\n• 刷LeetCode 200+题，准备八股文\n• 8月开始投递提前批，9-10月正式秋招\n\n💡 进入「学业-就业双向联动规划」可获取更详细的对比分析。'
      },
      {
        keywords: ['大四', '毕业', '毕设', '春招', '毕业设计'],
        reply: '大四阶段重点任务规划：\n\n📌 **上学期（9-12月）**：\n• 秋招冲刺：海投+定向投递，把握黄金窗口期\n• 完成毕业设计开题和核心代码\n• 未拿到offer的同学准备春招（次年2-3月）\n\n📌 **下学期（1-6月）**：\n• 春招补录：关注中小厂和国企补招\n• 完成毕业论文和答辩准备\n• 入职前技能充电，熟悉公司技术栈\n\n💡 毕设建议选择与求职方向相关的课题，一举两得！'
      },
      {
        keywords: ['转专业', '跨考', '跨行', '零基础', '转行'],
        reply: '跨方向发展的规划建议：\n\n📌 **转专业/跨考**：\n• 评估目标专业的就业前景和自身兴趣匹配度\n• 提前补修核心课程，避免知识断层\n• 联系目标专业的学长学姐获取一手信息\n\n📌 **零基础转行IT**：\n• 选择一个方向深入（推荐前端或Python，入门门槛相对较低）\n• 制定3-6个月学习计划：基础语法→框架实战→项目积累\n• 做出2-3个完整项目作为求职作品\n• 考虑报培训班或自学路线（B站/掘金/官方文档）\n\n💡 转行初期会有些艰难，坚持做项目是最快的学习路径！'
      },
      {
        keywords: ['学习计划', '学习路线', '怎么学', '学习路径', '自学'],
        reply: 'IT学习路线规划建议：\n\n📌 **前端方向**：\nHTML/CSS → JavaScript → Vue/React → TypeScript → Webpack/Vite → 项目实战\n\n📌 **后端方向（Java）**：\nJava基础 → SpringBoot → MySQL → Redis → MyBatis → 微服务 → 项目实战\n\n📌 **后端方向（Python）**：\nPython基础 → Django/FastAPI → MySQL → Redis → Docker → 项目实战\n\n📌 **数据分析方向**：\nPython → Pandas/NumPy → SQL → 数据可视化 → 机器学习基础 → 项目实战\n\n📌 **AI/算法方向**：\n数学基础 → Python → 机器学习 → 深度学习 → NLP/CV → 论文+项目\n\n💡 关键原则：每学完一个阶段就做一个小项目巩固，不要只看视频不动手！'
      }
    ]
  },
  // ===== 简历优化 =====
  {
    module: 'resume',
    scenes: [
      {
        keywords: ['简历模板', '模板', '格式', '排版'],
        reply: '简历模板和排版建议：\n\n📌 **模板选择**：\n• 使用简洁单栏模板（ATS友好），避免复杂双栏设计\n• 推荐工具：超级简历、Resume.io、Overleaf（LaTeX）\n• 字体：思源黑体/微软雅黑，字号10-12pt\n\n📌 **排版规范**：\n• 页面控制在1页（应届生）或2页（有经验者）\n• 各模块顺序：基本信息→教育背景→实习/工作经历→项目经验→技能→获奖\n• 使用项目符号和加粗突出重点\n• 导出PDF格式，确保格式不乱\n\n💡 进入「AI简历」页面，选择目标岗位即可一键生成专业简历！'
      },
      {
        keywords: ['项目经验', '项目描述', '怎么写项目', '经历'],
        reply: '项目经验撰写技巧：\n\n📌 **STAR法则**：\n• Situation（背景）：项目是做什么的，解决什么问题\n• Task（任务）：你负责的具体模块\n• Action（行动）：你用了什么技术/方法实现\n• Result（成果）：量化结果（提升XX%、服务XX用户）\n\n📌 **示例对比**：\n❌ 负责电商平台后端开发\n✅ 主导电商平台订单系统开发，使用SpringBoot+Redis实现高并发订单处理，QPS提升40%，支撑日均10万+订单量\n\n📌 **注意事项**：\n• 每个项目控制在3-5条描述\n• 突出个人贡献，而非团队整体\n• 技术栈和量化数据加粗显示\n\n💡 进入「AI简历」页面，使用AI一键优化功能自动改写项目经历！'
      },
      {
        keywords: ['技能', '技能标签', '技术栈', '专业技能'],
        reply: '简历技能板块优化建议：\n\n📌 **分类展示**：\n• 编程语言：Java（熟练）、Python（熟悉）、Go（了解）\n• 框架工具：SpringBoot、Vue.js、MySQL、Redis、Git\n• 软技能：团队协作、敏捷开发、技术文档写作\n\n📌 **熟练度标注**：\n• 精通：能独立设计架构、解决复杂问题\n• 熟练：能独立完成开发任务\n• 熟悉：了解核心概念，能基本使用\n• 了解：接触过，有基础认知\n\n📌 **匹配岗位**：\n• 仔细阅读JD，把岗位要求的技能放在最前面\n• 删除与岗位无关的技能（如投后端不写PS技能）\n\n💡 可以在「AI简历」页面添加技能标签，系统会自动匹配岗位需求！'
      },
      {
        keywords: ['没有实习', '没有经验', '应届生', '没有项目', '空白'],
        reply: '没有实习经验怎么写简历？\n\n📌 **挖掘替代经历**：\n• 课程设计/大作业 → 包装为项目经验\n• 毕业设计 → 作为核心项目展示\n• 竞赛经历（蓝桥杯、数学建模等）→ 体现专业能力\n• 社团/学生会经历 → 展示软技能\n\n📌 **快速补项目**：\n• 跟着教程做2-3个完整项目（如电商系统、博客系统）\n• 参与开源项目，提交PR\n• 做一个有技术含量的个人项目放到GitHub\n\n📌 **简历策略**：\n• 重点突出项目中的技术亮点和学习能力\n• 强调自学能力和快速上手能力\n• 投递时选择接受应届生的岗位\n\n💡 进入「AI简历」页面，即使内容简单，AI也能帮您优化出专业表达！'
      },
      {
        keywords: ['投递', '通过率', 'HR', '筛选', '石沉大海', '没回复'],
        reply: '提升简历通过率的策略：\n\n📌 **针对性投递**：\n• 仔细阅读JD，简历中体现岗位关键词\n• 不同岗位准备不同版本的简历\n• 投递时间：工作日上午9-10点最佳\n\n📌 **关键词优化**：\n• HR筛选常看：学校、专业、技能匹配度、实习经历\n• ATS系统会扫描关键词，确保简历包含JD中的技术词汇\n• 避免使用图片简历（ATS无法识别）\n\n📌 **渠道选择**：\n• 内推 > 官网投递 > 招聘平台\n• 多渠道并行：Boss直聘、拉勾、牛客、公司官网\n• 关注校招提前批，竞争相对较小\n\n💡 进入「AI简历」页面，输入目标岗位即可获取针对性优化建议！'
      },
      {
        keywords: ['面试', '面试题', '八股文', '面试准备'],
        reply: '面试准备攻略：\n\n📌 **技术面试**：\n• 算法：LeetCode Hot 100 + 剑指Offer，重点掌握数组/链表/树/DP\n• 八股文：Java JVM/GC/并发、MySQL索引/事务、Redis数据类型/持久化\n• 项目深挖：能讲清每个技术选型原因和遇到的坑\n\n📌 **HR面试**：\n• 自我介绍（1-3分钟版本各准备一个）\n• 常见问题：为什么选我们公司/你的优缺点/职业规划\n• 反问环节：准备2-3个有深度的问题\n\n📌 **实战准备**：\n• 牛客/Pramp模拟面试\n• 面经复盘：记录每次面试的问题和不足\n\n💡 简历优化好了，面试通过率自然提升。进入「AI简历」优化你的简历吧！'
      },
      // —— 简历通用兜底：输入只含"简历"或"简历"+方向时，给出针对性引导 ——
      {
        keywords: ['简历', '简历优化', '优化简历', '写简历', '做简历', '改简历', '润色简历'],
        reply: '关于简历优化，我可以为你提供全方位建议～\n\n📌 **如果你刚起步**：\n• 告诉我你的目标岗位（如前端/Java/数据分析），我会针对性给出简历重点\n• 也可以直接把简历内容粘贴给我，我帮你逐条优化\n\n📌 **核心优化方向**（任选告诉我）：\n1. 模板/排版设计\n2. 项目经验用STAR法则改写\n3. 技能标签分类与熟练度\n4. 没有实习/项目怎么包装\n5. 投递通过率提升技巧\n6. 面试准备建议\n\n💡 也可以直接进入「AI简历」页面，AI一键生成专业简历！'
      }
    ]
  },
  // ===== 人才统计 =====
  {
    module: 'statistics',
    scenes: [
      {
        keywords: ['薪资', '工资', '待遇', '薪酬', '多少钱'],
        reply: 'IT行业薪资数据参考（2024-2025）：\n\n📌 **应届生起薪（一线城市）**：\n• 大厂SP/SSP：25-40K×16薪\n• 大厂普通offer：18-25K×15薪\n• 中小厂：10-18K×13-14薪\n• 国企/银行：8-15K×12-16薪+福利\n\n📌 **热门岗位薪资**：\n• 算法工程师：30-60K（应届SP可达50K+）\n• 后端开发（Java/Go）：15-35K\n• 前端开发：12-30K\n• 数据分析/数据开发：12-25K\n• 测试开发：12-22K\n\n📌 **城市差异**：\n• 北京/上海/深圳：薪资最高，生活成本也高\n• 杭州/广州：薪资略低5-15%，性价比较高\n• 成都/武汉/西安：薪资低20-30%，但生活成本低\n\n💡 进入「人才专项统计模块」查看实时薪资分布大屏！'
      },
      {
        keywords: ['热门', '热门岗位', '需求大', '缺人', '高薪'],
        reply: '当前热门岗位需求分析：\n\n🔥 **需求TOP5岗位**：\n1. Java后端开发 - 需求量最大，企业级应用核心\n2. 前端开发 - Vue/React生态成熟，需求稳定\n3. 算法工程师 - AI浪潮下薪资天花板\n4. 数据开发 - 大数据基建需求旺盛\n5. 测试开发 - 质量保障越来越受重视\n\n📊 **增长最快领域**：\n• AI大模型相关岗位（LLM/NLP）增长200%+\n• 云原生/DevOps岗位增长80%+\n• 安全工程师岗位增长60%+\n\n💡 进入「人才专项统计模块」查看各岗位的详细需求趋势图表！'
      },
      {
        keywords: ['城市', '哪个城市', '去哪', '一线城市', '二线城市'],
        reply: 'IT就业城市选择参考：\n\n📌 **一线城市（北上广深）**：\n• 优势：大厂多、薪资高、机会多、技术氛围好\n• 劣势：生活成本高、竞争激烈、996普遍\n\n📌 **新一线城市**：\n• 杭州：互联网第二城，阿里网易蚂蚁等大厂\n• 成都：性价比之王，生活舒适，腾讯/字节有分部\n• 武汉/南京/西安：高校多，光电子/通信产业发达\n\n📌 **选择建议**：\n• 应届生优先选一线城市积累1-3年经验\n• 有经验后可考虑新一线，平衡薪资和生活\n• 关注各地人才政策（落户补贴、租房补贴等）\n\n💡 进入「人才专项统计模块」查看各城市人才供需热力图！'
      },
      {
        keywords: ['学历', '本科', '硕士', '专科', '985', '211'],
        reply: '学历对IT就业的影响分析：\n\n📌 **大厂校招学历门槛**：\n• BAT/字节/美团：优先985/211，硕士有优势\n• 算法岗：硕士起步，博士更受欢迎\n• 开发岗：本科即可，看重项目和能力\n\n📌 **学历不够怎么弥补**：\n• 用项目经验弥补：GitHub高星项目 > 学历\n• 用竞赛成绩弥补：ACM区域赛铜牌以上有含金量\n• 用实习经历弥补：大厂实习经历是强力背书\n• 先进中小厂积累经验，1-2年后跳槽大厂\n\n📌 **专科学历建议**：\n• 优先考虑专升本提升学历\n• 主攻中小厂/外包/创业公司\n• 做出高质量开源项目作为能力证明\n• 考取相关认证（如AWS/阿里云认证）\n\n💡 进入「人才专项统计模块」查看不同学历的就业数据对比！'
      }
    ]
  },
  // ===== 行业预测 =====
  {
    module: 'prediction',
    scenes: [
      {
        keywords: ['AI', '人工智能', '大模型', 'ChatGPT', 'LLM', 'GPT'],
        reply: 'AI/大模型行业趋势预测：\n\n🚀 **岗位趋势**：\n• AI算法工程师需求持续爆发，年增长50%+\n• 大模型应用开发（Prompt工程/RAG/Agent）成为新热点\n• AI产品经理岗位兴起，需懂技术+产品\n• 传统岗位+AI能力成为标配（如AI+前端、AI+测试）\n\n💡 **技能建议**：\n• 开发者：学习LangChain/LlamaIndex，掌握RAG和Agent开发\n• 非技术岗：学习Prompt Engineering，用AI工具提效\n\n⚠️ **影响预警**：\n• 简单CRUD岗位可能被AI辅助工具替代\n• 内容创作/初级测试等岗位面临转型压力\n• 建议：往AI难以替代的方向发展（架构设计/业务理解/创新）\n\n💡 进入「行业供需预测」模块查看AI领域的详细趋势图表！'
      },
      {
        keywords: ['前端', '前端开发', '前端前景', 'Vue', 'React'],
        reply: '前端开发行业趋势预测：\n\n📈 **技术趋势**：\n• 框架：Vue3+Vite / React18+Next.js 成为主流\n• 语言：TypeScript成为标配，占比超80%\n• 架构：微前端、BFF、SSR/SSG持续发展\n• 新领域：Web3D（Three.js）、跨端（Flutter/RN）\n\n📊 **就业趋势**：\n• 纯切图前端需求下降，全栈前端更受欢迎\n• 前端+AI能力成为加分项（AI代码生成/智能UI）\n• 资深前端（5年+）薪资可达30-50K\n\n💡 **建议**：\n• 深入一个框架（Vue或React），不要浅尝辄止\n• 学习Node.js扩展全栈能力\n• 关注Web性能优化和工程化\n\n💡 进入「行业供需预测」模块查看前端岗位的详细供需数据！'
      },
      {
        keywords: ['后端', 'Java', 'Go', '后端开发', '服务端'],
        reply: '后端开发行业趋势预测：\n\n📈 **语言趋势**：\n• Java：企业级开发主力，需求量最大但竞争也激烈\n• Go：云原生时代新贵，字节/腾讯/B站大量使用\n• Python：数据分析/AI领域首选\n• Rust：系统级编程新星，区块链/基础设施领域\n\n📊 **技术趋势**：\n• 云原生：K8s+Docker+Service Mesh成为标配\n• 微服务：SpringCloud/Dubbo → Istio/Knative\n• 数据库：MySQL+Redis为主，TiDB/OceanBase兴起\n• 消息队列：Kafka/RocketMQ需求旺盛\n\n💡 **建议**：\n• Java方向：深入JVM/并发/Spring源码，做差异化竞争\n• Go方向：掌握云原生生态（K8s/operator）\n• 后端+DevOps能力是加分项\n\n💡 进入「行业供需预测」模块查看后端岗位的详细趋势！'
      },
      {
        keywords: ['裁员', '失业', '寒冬', '内卷', '就业难'],
        reply: '当前就业环境分析与应对策略：\n\n📊 **现状分析**：\n• 2023-2024年互联网行业经历调整期，部分大厂裁员\n• 但AI/云计算/新能源等赛道仍在扩招\n• 整体供需：初级岗过剩，中高级岗仍稀缺\n\n💡 **应对策略**：\n• 应届生：降低预期，先进场积累经验，不要太挑公司\n• 有经验者：打造不可替代性（架构能力/业务理解/团队管理）\n• 所有人：持续学习AI工具，提升效率，做"AI+X"复合人才\n• 副业/个人IP：技术博客/开源项目/知识付费作为Plan B\n\n📌 **逆势增长的领域**：\n• AI大模型相关（算法/应用/infra）\n• 出海企业技术岗\n• 新能源/智能汽车数字化\n• 国企/银行数字化转型\n\n💡 进入「行业供需预测」模块查看各细分领域的供需变化趋势！'
      }
    ]
  },
  // ===== 岗位推荐 =====
  {
    module: 'recommend',
    scenes: [
      {
        keywords: ['前端', '前端岗位', '前端工程师'],
        reply: '前端岗位推荐与匹配建议：\n\n📌 **适合人群**：\n• 对视觉呈现和交互感兴趣\n• 有一定审美能力\n• 喜欢即时反馈的开发模式\n\n📌 **核心技能要求**：\n• 必备：HTML/CSS/JavaScript、Vue或React、TypeScript\n• 加分：Node.js、Webpack/Vite、性能优化\n• 新趋势：AI辅助开发、Web3D\n\n📌 **投递建议**：\n• 应届生：关注大厂校招前端岗，中小公司前端全栈岗\n• 简历重点展示：项目链接、GitHub、技术博客\n• 面试重点：JS基础、框架原理、手写代码\n\n💡 进入「智能岗位推荐」页面，填写您的技能即可获取匹配的前端岗位列表！'
      },
      {
        keywords: ['后端', 'Java', 'Java岗位', '后端工程师', '服务端'],
        reply: '后端/Java岗位推荐与匹配建议：\n\n📌 **适合人群**：\n• 逻辑思维强，喜欢解决复杂问题\n• 对系统架构和性能优化感兴趣\n• 能耐得住性子排查bug\n\n📌 **核心技能要求**：\n• 必备：Java基础、SpringBoot、MySQL、Redis\n• 加分：微服务(SpringCloud)、消息队列、Docker/K8s\n• 高级：JVM调优、分布式系统设计、高并发处理\n\n📌 **投递建议**：\n• 应届生：Java后端是需求量最大的方向，机会多\n• 简历重点展示：项目架构图、QPS数据、技术深度\n• 面试重点：JVM、并发、MySQL、Spring源码、分布式\n\n💡 进入「智能岗位推荐」页面，系统会根据您的技能栈智能匹配岗位！'
      },
      {
        keywords: ['Python', '数据', '数据分析', '算法', '机器学习'],
        reply: 'Python/数据/算法方向岗位推荐：\n\n📌 **数据分析岗**：\n• 技能：Python+SQL+Pandas+可视化(Tableau/PowerBI)\n• 适合：对数据敏感，喜欢用数据驱动决策\n• 薪资：应届10-18K，资深20-35K\n\n📌 **数据开发岗**：\n• 技能：Python+SQL+Spark+Flink+数仓建模\n• 适合：喜欢大数据处理，对ETL/数仓感兴趣\n• 薪资：应届12-20K，资深25-40K\n\n📌 **算法岗**：\n• 技能：Python+机器学习+深度学习+论文\n• 适合：硕士及以上，数学功底好，有科研经历\n• 薪资：应届20-40K（大厂SP/SSP更高）\n\n💡 进入「智能岗位推荐」页面，选择您的技能方向获取精准推荐！'
      },
      {
        keywords: ['测试', '测试开发', 'QA', '质量'],
        reply: '测试/测试开发岗位推荐：\n\n📌 **测试开发岗**（推荐）：\n• 技能：Python/Java+自动化测试+接口测试+CI/CD\n• 日常工作：编写自动化测试脚本、搭建测试平台、性能测试\n• 薪资：应届10-18K，资深18-30K\n• 优势：技术含量高，发展天花板不低\n\n📌 **功能测试岗**：\n• 技能：测试用例设计+缺陷管理+业务理解\n• 门槛较低，但天花板也较低\n• 建议往测试开发方向转型\n\n📌 **投递建议**：\n• 简历重点：自动化框架搭建经验、测试工具开发\n• 面试重点：测试理论、自动化框架、接口测试、性能测试\n\n💡 进入「智能岗位推荐」页面匹配测试相关岗位！'
      },
      {
        keywords: ['实习', '实习岗位', '暑期实习', '日常实习'],
        reply: '实习岗位获取攻略：\n\n📌 **时间节点**：\n• 暑期实习：3-5月投递（最重要！大厂暑期实习转正率高）\n• 日常实习：全年可投，中小公司为主\n• 寒假实习：11-12月投递，机会较少\n\n📌 **投递渠道**：\n• 官网：各大厂校招官网（腾讯/字节/阿里/美团等）\n• 平台：牛客网实习广场、Boss直聘、实习僧\n• 内推：找学长学姐内推，通过率高2-3倍\n\n📌 **准备建议**：\n• 简历：突出项目和技能，实习经历不要求很丰富\n• 面试：算法(LeetCode简单-中等)+八股文+项目\n• 心态：第一份实习不必太挑公司，先进场积累经验\n\n💡 进入「智能岗位推荐」页面，筛选实习岗位获取推荐列表！'
      }
    ]
  }
]

// 默认回复（当没有匹配到具体场景时）
const defaultReplies = {
  planning: '关于学业规划，我可以为您提供更具体的建议：\n\n请告诉我您目前的情况：\n• 您是几年级的学生？\n• 您的专业方向是什么？\n• 您有具体想了解的方面吗（如学习路线/考研/实习/转专业）？\n\n这样我能给出更精准的建议！您也可以进入「学业-就业双向联动规划」页面获取个性化规划。',
  resume: '关于简历优化，请告诉我您具体想了解：\n• 简历模板和排版？\n• 项目经验怎么写？\n• 技能板块怎么优化？\n• 没有实习经验怎么办？\n• 简历投递通过率低？\n• 面试准备？\n\n这样我能给出更有针对性的建议！您也可以进入「AI简历」页面使用智能优化功能。',
  statistics: '关于人才数据统计，请告诉我您想了解：\n• 各岗位薪资水平？\n• 当前热门岗位？\n• 哪个城市适合就业？\n• 学历对就业的影响？\n\n这样我能提供更精准的数据分析！您也可以进入「人才专项统计模块」查看实时数据大屏。',
  prediction: '关于行业趋势预测，请告诉我您关注的方向：\n• AI/大模型趋势？\n• 前端/后端前景？\n• 当前就业环境？\n• 某个具体技术方向？\n\n这样我能给出更有深度的分析！您也可以进入「行业供需预测」模块查看详细趋势图表。',
  recommend: '为了给您推荐最合适的岗位，请告诉我：\n• 您想从事什么方向？（前端/后端/数据/算法/测试）\n• 您是在找实习还是全职？\n• 您的技能栈是什么？\n\n这样我能精准匹配岗位！您也可以进入「智能岗位推荐」页面获取个性化推荐。',
  general: '我是AI就业规划助手，可以为您提供以下方面的精准解答：\n\n📚 **学业规划** - 大一到大四各阶段规划、学习路线、转专业建议\n💼 **简历优化** - 模板排版、项目经验写法、技能优化、面试准备\n📊 **人才数据** - 薪资水平、热门岗位、城市选择、学历影响\n🔮 **行业预测** - AI趋势、前后端前景、就业环境分析\n🎯 **岗位推荐** - 各方向岗位匹配、实习攻略\n\n请直接输入您的问题，我会给出针对性的回答！'
}

// 根据消息内容和模块生成精准回复
function generateReply(message, module, history = [], context = {}) {
  const lowerMessage = message.toLowerCase()
  const rawMessage = message.trim()
  const userName = context.userName || null
  const detectedName = extractUserName(rawMessage)

  // ========== 0. 取名/姓名识别（最高优先级，在其他逻辑前处理）==========
  if (detectedName) {
    const nameReplies = [
      `${detectedName}，好名字！记住你啦～🎉\n\n我是你的AI就业规划助手，之后就叫你${detectedName}啦～有什么想聊的尽管问我！`,
      `${detectedName}～很高兴认识你！😊\n\n你的名字我记下来了，接下来我可以帮你解答学业规划、简历优化、岗位推荐、薪资数据等各种问题哦～`,
      `哇，${detectedName}！我记住你啦～✨\n\n${detectedName}是在找工作吗？还是想先了解学习路线或行业情况呢？`
    ]
    // 返回时附带解析出的名字，供前端保存
    const result = { text: pickRandom(nameReplies), extractedName: detectedName }
    return result
  }

  // ========== 1. 问候语（纯问候，不含其他关键词）==========
  const greetingKWs = ['你好', '您好', 'hi', 'hello', '在吗', '在不在', '哈喽', 'hey', '嗨',
    '早上好', '下午好', '晚上好', '中午好']
  const hasGreeting = greetingKWs.some(kw => lowerMessage.includes(kw.toLowerCase()))
  // 排除组合：问候 + 业务关键词（如"你好，请问前端薪资"）应走业务匹配
  const businessHint = ['薪资', '工资', '简历', '岗位', '面试', '前端', '后端', 'java', 'python',
    '学习', '规划', '推荐', '数据', '城市', '学历', '行业', '算法'].some(k => lowerMessage.includes(k))
  if (hasGreeting && !businessHint) {
    return { text: pickRandom(greetingReplies)(userName) }
  }

  // ========== 2. 身份查询（你是谁/你叫什么/介绍一下自己）==========
  const identityKWs = ['你是谁', '你叫什么', '介绍一下你自己', '你是做什么的', '你是什么',
    '自我介绍一下', '你能做什么', '你有什么功能', '你会什么']
  if (identityKWs.some(kw => lowerMessage.includes(kw.toLowerCase()))) {
    return { text: pickRandom(identityReplies)(userName) }
  }

  // ========== 3. 道谢 ==========
  const thanksKWs = ['谢谢', '感谢', '多谢', 'thank', 'thanks', '谢谢啦', '谢谢你', '辛苦']
  if (thanksKWs.some(kw => lowerMessage.includes(kw.toLowerCase()))) {
    return { text: pickRandom(thanksReplies)(userName) }
  }

  // ========== 4. 再见 ==========
  const goodbyeKWs = ['再见', '拜拜', 'bye', '先这样', '下次再说', '告辞', '没了', '没问题了']
  if (goodbyeKWs.some(kw => lowerMessage.includes(kw.toLowerCase()))) {
    return { text: pickRandom(goodbyeReplies)(userName) }
  }

  // ========== 5. 澄清追问（用户输入太短/纯疑问词）==========
  const tooShort = rawMessage.length <= 2 && !businessHint
  const pureQuestion = /^[什么怎么为什么如何哪哪些谁？?？,.，。\s]+$/.test(rawMessage)
  if (tooShort || pureQuestion) {
    const topic = rawMessage || '这个'
    return { text: pickRandom(clarifyReplies)(userName, topic) }
  }

  // ========== 6. 如果指定了模块，先在该模块内用加权计分选最优场景匹配 ==========
  if (module && module !== 'general') {
    const moduleData = knowledgeBase.find(kb => kb.module === module)
    if (moduleData) {
      const best = findBestScene(lowerMessage, moduleData.scenes, moduleData.module)
      if (best) {
        let reply = best.reply
        if (moduleData.module === 'statistics') reply = injectRealStats(reply, lowerMessage)
        return { text: reply }
      }
    }
  }

  // ========== 7. 「数据/统计/总量」类强意图查询，优先返回真实爬虫数据（避免被普通全局"数据/分析"场景吞掉）==========
  const hasStatsQuestion = (
    // 疑问词 + 数据对象 的组合
    (/(多少|几|总数|总量|统计|目前|现在|一共|累计|平均).{0,6}(岗位|条|数据|薪资|工资|薪酬|个|人|公司|城市)/.test(lowerMessage)) ||
    (/(岗位|数据|薪资|工资).{0,6}(多少|条|总数|统计|平均)/.test(lowerMessage)) ||
    // 独立高权重词
    lowerMessage.includes('多少条') || lowerMessage.includes('岗位总数') ||
    lowerMessage.includes('岗位数据') || lowerMessage.includes('最新数据') ||
    lowerMessage.includes('实时数据') || lowerMessage === '数据' || lowerMessage === '统计'
  )
  if (hasStatsQuestion) {
    const stats = getRealStats()
    if (stats) {
      const dateStr = stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString('zh-CN') : '近期'
      const cityLine = stats.topCities && stats.topCities.length > 0
        ? stats.topCities.map((c, i) => `${i + 1}. ${c.city}（${formatNumber(c.count)}条）`).join('\n')
        : '数据加载中'
      const hotJobLine = stats.hotJobs && stats.hotJobs.length > 0
        ? stats.hotJobs.map(([name, cnt], i) => `${i + 1}. ${name}（约${formatNumber(cnt)}条）`).join('\n')
        : '数据加载中'
      const eduLine = stats.topEdu && stats.topEdu.length > 0
        ? stats.topEdu.map(([e, c]) => `${e} ${formatNumber(c)}条`).join('、')
        : ''
      const name = userName ? `${userName}，` : ''
      const lines = [
        `${name}📊 根据我们的实时爬虫数据（更新于 ${dateStr}）：`,
        '',
        `📋 **总体规模**：`,
        `• 累计爬取岗位：${formatNumber(stats.totalCount)} 条`,
        `• 平均薪资：¥${formatNumber(stats.avgSalary)}/月（中位数 ¥${formatNumber(stats.medianSalary)}）`,
        `• 最高薪资样本：¥${formatNumber(stats.maxSalary)}/月`,
        eduLine ? `• 学历分布Top：${eduLine}` : '',
        '',
        `🔥 **热门岗位分布**：`,
        hotJobLine,
        '',
        `🏙️ **需求城市TOP6**：`,
        cityLine,
        '',
        `💡 进入「人才专项统计模块」可查看完整可视化大屏哦～`
      ].filter(Boolean)
      return { text: lines.join('\n') }
    }
  }

  // ========== 8. 全局加权最优匹配（避免模块顺序导致"前端"先命中趋势而非岗位推荐）==========
  {
    let bestScore = -1
    let best = null
    let bestMod = null
    for (const moduleData of knowledgeBase) {
      const scene = findBestScene(lowerMessage, moduleData.scenes, moduleData.module, true)
      if (scene && scene._score > bestScore) {
        bestScore = scene._score
        best = scene
        bestMod = moduleData.module
      }
    }
    if (best) {
      let reply = best.reply
      if (bestMod === 'statistics') reply = injectRealStats(reply, lowerMessage)
      return { text: reply }
    }
  }

  // ========== 9. 检查历史对话，判断用户是否在追问 ==========
  if (history && history.length >= 2) {
    const lastUserMsg = [...history].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      const lastLower = lastUserMsg.content.toLowerCase()
      for (const moduleData of knowledgeBase) {
        for (const scene of moduleData.scenes) {
          if (scene.keywords.some(kw => lastLower.includes(kw.toLowerCase()))) {
            let reply = defaultReplies[moduleData.module] || defaultReplies.general
            if (moduleData.module === 'statistics') {
              reply = injectRealStats(reply, lastLower)
            }
            return { text: reply }
          }
        }
      }
    }
  }

  // ========== 10. 兜底：不回general大段介绍，改用澄清追问 ==========
  const defaultText = defaultReplies[module] || defaultReplies.general
  // 如果有识别到用户名，用个性化澄清；否则给简短引导
  if (userName) {
    return {
      text: pickRandom(clarifyReplies)(userName, rawMessage.slice(0, 12) || '你的问题')
    }
  }
  return { text: defaultText }
}

// 向人才统计类回复中注入真实数据（替换硬编码数字）
function injectRealStats(reply, lowerMessage) {
  const stats = getRealStats()
  if (!stats) return reply
  const dateStr = stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString('zh-CN') : '近期'

  // 薪资类场景：替换平均薪资数据
  if (lowerMessage.includes('薪资') || lowerMessage.includes('工资') || lowerMessage.includes('待遇') || lowerMessage.includes('薪酬') || lowerMessage.includes('多少钱')) {
    const avgY = Math.round(stats.avgSalary / 10000 * 10) / 10
    const insert = `\n\n📊 **实时爬虫数据参考（更新于${dateStr}，共${formatNumber(stats.totalCount)}条）**：\n• 全体岗位平均薪资：¥${formatNumber(stats.avgSalary)}/月（约${avgY}万/月）\n• 薪资中位数：¥${formatNumber(stats.medianSalary)}/月\n• 最高薪资样本：¥${formatNumber(stats.maxSalary)}/月\n`
    return reply + insert
  }

  // 岗位/热门类场景
  if (lowerMessage.includes('热门') || lowerMessage.includes('需求大') || lowerMessage.includes('缺人')) {
    if (stats.hotJobs && stats.hotJobs.length > 0) {
      const hotJobLine = stats.hotJobs.map(([name, cnt]) => `${name}（约${formatNumber(cnt)}条）`).join('、')
      const insert = `\n\n📊 **实时数据（${dateStr}，共${formatNumber(stats.totalCount)}条岗位）**：\n• 当前热门方向：${hotJobLine}\n`
      return reply + insert
    }
  }

  // 城市类场景
  if (lowerMessage.includes('城市') || lowerMessage.includes('去哪') || lowerMessage.includes('一线') || lowerMessage.includes('二线')) {
    if (stats.topCities && stats.topCities.length > 0) {
      const cityLine = stats.topCities.map((c, i) => `${i + 1}.${c.city}(${formatNumber(c.count)})`).join('  ')
      const insert = `\n\n📊 **实时城市需求TOP（${dateStr}）**：${cityLine}\n`
      return reply + insert
    }
  }

  // 学历类场景
  if (lowerMessage.includes('学历') || lowerMessage.includes('本科') || lowerMessage.includes('硕士') || lowerMessage.includes('专科')) {
    if (stats.topEdu && stats.topEdu.length > 0) {
      const total = stats.totalCount || 1
      const eduLine = stats.topEdu.map(([e, c]) => `${e} ${formatNumber(c)}（${Math.round(c / total * 100)}%）`).join('、')
      const insert = `\n\n📊 **实时学历分布（${dateStr}，共${formatNumber(stats.totalCount)}条）**：\n• ${eduLine}\n`
      return reply + insert
    }
  }

  return reply
}

// 文件类型分析
function analyzeFiles(fileNames) {
  if (!fileNames || fileNames.length === 0) return null

  const analysis = []
  fileNames.forEach(f => {
    const ext = path.extname(f.name).toLowerCase()
    const typeInfo = {
      '.pdf': 'PDF文档',
      '.doc': 'Word文档',
      '.docx': 'Word文档',
      '.jpg': '图片',
      '.jpeg': '图片',
      '.png': '图片',
      '.xlsx': 'Excel表格',
      '.xls': 'Excel表格',
      '.txt': '文本文件',
      '.zip': '压缩包',
      '.md': 'Markdown文档',
      '.json': 'JSON数据文件'
    }
    const typeLabel = typeInfo[ext] || '文件'
    analysis.push({ name: f.name, type: typeLabel, size: f.size })
  })
  return analysis
}

// POST /api/ai-assistant/chat - 支持 JSON 和 FormData 两种格式
router.post('/chat', (req, res, next) => {
  const contentType = req.headers['content-type'] || ''
  if (contentType.includes('multipart/form-data')) {
    upload.any()(req, res, next)
  } else {
    express.json()(req, res, next)
  }
}, async (req, res) => {
  try {
    const message = req.body.message || ''
    const module = req.body.module || 'general'
    let history = []
    if (typeof req.body.history === 'string') {
      try {
        history = JSON.parse(req.body.history)
      } catch (e) {}
    } else if (Array.isArray(req.body.history)) {
      history = req.body.history
    }

    // 解析 context（前端传来的用户信息）
    let context = {}
    if (typeof req.body.context === 'string') {
      try {
        context = JSON.parse(req.body.context) || {}
      } catch (e) { context = {} }
    } else if (typeof req.body.context === 'object' && req.body.context) {
      context = req.body.context
    }

    const fileCount = parseInt(req.body.fileCount) || 0
    let fileNames = []
    if (typeof req.body.fileNames === 'string') {
      try {
        fileNames = JSON.parse(req.body.fileNames)
      } catch (e) {}
    } else if (Array.isArray(req.body.fileNames)) {
      fileNames = req.body.fileNames
    }

    if (!message.trim() && fileCount === 0) {
      return res.json({
        success: false,
        error: '消息内容不能为空'
      })
    }

    // 模拟AI思考延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800))

    // generateReply 现在返回对象：{ text: string, extractedName?: string }
    const replyResult = generateReply(message, module, history, context)
    let replyText = typeof replyResult === 'string' ? replyResult : (replyResult.text || '')
    const extractedName = replyResult.extractedName || null

    // 如果有文件，附加文件分析
    if (fileCount > 0 && fileNames.length > 0) {
      const fileAnalysis = analyzeFiles(fileNames)
      const fileList = fileAnalysis.map(f => `• ${f.name}（${f.type}，${(f.size / 1024).toFixed(1)}KB）`).join('\n')

      // 根据文件类型给出针对性回复
      const hasResume = fileNames.some(f => {
        const name = f.name.toLowerCase()
        return name.includes('简历') || name.includes('resume') || name.includes('cv')
      })
      const hasImage = fileNames.some(f => /\.(jpg|jpeg|png|gif|bmp)$/.test(f.name.toLowerCase()))

      let fileReply = `\n\n📎 **已收到您上传的文件**：\n${fileList}\n`

      if (hasResume) {
        fileReply += `\n💡 检测到您上传了简历文件，建议您进入「AI简历」页面，使用AI一键优化功能对简历进行深度分析和改写，系统会给出分数评估和具体的优化建议。`
      } else if (hasImage) {
        fileReply += `\n💡 您上传了图片文件。如果您需要简历模板排版建议或作品集优化，请告诉我具体需求。`
      } else {
        fileReply += `\n💡 我已收到您的文件。请告诉我您希望对这些文件进行什么分析或处理？`
      }

      replyText = replyText + fileReply
    }

    res.json({
      success: true,
      data: {
        reply: replyText,
        extractedName,
        module,
        timestamp: new Date().toISOString(),
        typingDuration: replyText.length * 30
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
