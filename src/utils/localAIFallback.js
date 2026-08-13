// 前端本地AI兜底模块 - 当后端不可用时提供智能回复
// 实现意图检测、岗位匹配、学习路线生成、技术问答等核心功能

import { findMatchingResources } from '@/data/resources.js'

const IDENTITY_KEYWORDS = [
  '你是谁', '你是什么', '你叫什么', '介绍一下你自己', '自我介绍',
  '你叫什么名字', '你的名字', 'who are you', 'what are you',
  '你可以做什么', '你能做什么', '功能', '能干嘛'
]

const IDENTITY_RESPONSE = `## 👋 你好！我是 AI 学习顾问

我是《学业 - 就业双向联动规划系统》专属 AI 学习顾问，专为计算机专业学生提供求职导向的精准学习支持：

1. **📊 基于真实企业招聘 JD** 的技能数据分析，能给你贴合岗位需求的学习路线、实操方案
2. **💡 可解答编程技术疑问**、梳理技能缺口、指导面试准备，还能提供行业薪资参考
3. **🎯 依托爬虫采集的岗位数据** 生成学习规划

### 我能提供的服务：
- 📚 **学习路线规划**：输入岗位名称，获取完整学习路径
- 💻 **技术问答**：编程问题、技术原理、最佳实践
- 🎤 **模拟面试**：各岗位常见面试题与参考答案
- 🔧 **技能诊断**：分析你的技能缺口，给出提升建议
- 💼 **职业规划**：岗位发展方向、薪资参考、行业趋势

💬 直接输入你的问题即可，例如：
- "前端开发工程师学习路线"
- "Vue和React的区别是什么？"
- "Java后端面试题"`

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

const OFF_TOPIC_RESPONSE = `抱歉，我是专注于计算机专业学业 - 就业联动规划的 AI 顾问，仅能解答计算机专业学习、前端/后端等技术岗位就业相关问题。

💡 如果有以下需求，欢迎随时告诉我：
- 计算机专业技能学习
- 求职岗位准备与面试
- 编程技术疑问
- 学习路线规划`

// 意图检测关键词映射
const INTENT_KEYWORDS = {
  learning_route: ['学习路线', '学习计划', '学习路径', '怎么学', '如何学', '学习方法', '入门', '学习', '路线', '计划'],
  mock_interview: ['模拟面试', '面试题', '面试练习', '面试准备', '面试技巧', '面试', '八股文', '笔试'],
  technical_qa: ['怎么用', '怎么实现', '是什么', '为什么', '原理', '区别', '解释', '讲解', '如何', '什么是', '?', '？'],
  common_problem: ['内存泄漏', 'OOM', '超时', '报错', '错误', '崩溃', '卡顿', '慢', '排查', '调试', 'debug', 'bug', '部署', '上线'],
  career: ['转行', '转型', '就业', '薪资', '工资', '待遇', '职业规划', '发展', '前途', '方向'],
  resource: ['资源', '推荐', '文档', '视频', '书籍', '课程', '项目', '实战', '教程']
}

// 岗位关键词映射
const POSITION_KEYWORDS = {
  '前端开发工程师': ['前端', 'frontend', 'vue', 'react', 'javascript', 'html', 'css', '前端开发'],
  '后端开发工程师': ['后端', 'backend', 'java', 'spring', '后端开发', '服务端'],
  'Python开发工程师': ['python', 'Python开发'],
  '算法工程师': ['算法', 'algorithm', '机器学习', '深度学习', 'ai', '人工智能'],
  '测试工程师': ['测试', 'qa', 'test', '自动化测试'],
  '运维工程师': ['运维', 'devops', 'docker', 'kubernetes', 'k8s', '部署'],
  '数据库工程师': ['数据库', 'mysql', 'redis', 'mongodb', 'sql', 'dba'],
  '移动端开发工程师': ['移动端', 'android', 'ios', 'app开发'],
  '大数据工程师': ['大数据', 'hadoop', 'spark', 'flink'],
  '安全工程师': ['安全', '渗透', 'security'],
  '全栈工程师': ['全栈', 'fullstack'],
  '嵌入式工程师': ['嵌入式', 'embedded', '硬件'],
  '网络工程师': ['网络', 'network'],
  '游戏开发工程师': ['游戏', 'game'],
  '区块链开发工程师': ['区块链', 'blockchain', '链'],
  '产品经理': ['产品', 'product', 'pm']
}

// 岗位学习路线模板
const POSITION_ROUTES = {
  '前端开发工程师': {
    desc: '负责网页、移动端等前端界面的开发实现，打造优秀的用户体验。',
    skills: [
      { name: 'HTML/CSS基础', level: '必备', desc: '语义化标签、盒模型、Flexbox/Grid布局、响应式设计' },
      { name: 'JavaScript核心', level: '必备', desc: 'ES6+、原型链、异步编程、闭包、作用域、DOM/BOM操作' },
      { name: 'Vue/React框架', level: '必备', desc: '组件化开发、状态管理、路由、生命周期、Hooks' },
      { name: 'TypeScript', level: '优先', desc: '类型系统、泛型、装饰器、工程化应用' },
      { name: '构建工具', level: '优先', desc: 'Webpack/Vite、Babel、ESLint、代码规范' },
      { name: 'Node.js', level: '加分', desc: '服务端开发、Express/Koa、前后端联调' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-3个月）', tasks: ['HTML/CSS布局', 'JavaScript语法', 'ES6+特性'] },
      { phase: '🚀 进阶阶段（3-6个月）', tasks: ['Vue/React框架', '组件化开发', '路由与状态管理'] },
      { phase: '💡 实战阶段（6-9个月）', tasks: ['工程化构建', 'TypeScript', '性能优化'] },
      { phase: '🏆 高级阶段（9-12个月）', tasks: ['源码阅读', '架构设计', '技术选型'] }
    ],
    resources: ['Vue.js官方文档', 'React官方文档', 'MDN Web Docs', '阮一峰ES6入门'],
    projects: ['个人博客网站', '后台管理系统', '仿GitHub社区', '开源组件库']
  },
  '后端开发工程师': {
    desc: '负责服务端系统设计与开发，支撑高并发业务场景。',
    skills: [
      { name: 'Java基础', level: '必备', desc: '集合框架、多线程、IO/NIO、JVM基础' },
      { name: 'Spring生态', level: '必备', desc: 'Spring Boot、Spring Cloud、Spring Security' },
      { name: '数据库', level: '必备', desc: 'MySQL、Redis、SQL优化、事务管理' },
      { name: '分布式', level: '优先', desc: '微服务、负载均衡、服务治理、消息队列' },
      { name: '中间件', level: '优先', desc: 'Kafka/RabbitMQ、Elasticsearch、Nginx' },
      { name: '云原生', level: '加分', desc: 'Docker、Kubernetes、CI/CD、Service Mesh' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-3个月）', tasks: ['Java核心', 'MySQL基础', 'Spring Boot入门'] },
      { phase: '🚀 进阶阶段（3-6个月）', tasks: ['Spring全家桶', 'Redis缓存', '消息队列'] },
      { phase: '💡 实战阶段（6-9个月）', tasks: ['微服务架构', '分布式系统', '性能优化'] },
      { phase: '🏆 高级阶段（9-12个月）', tasks: ['系统设计', '高可用架构', '技术专家'] }
    ],
    resources: ['Spring官方文档', 'MySQL参考手册', 'Redis设计与实现', '《深入理解Java虚拟机》'],
    projects: ['电商系统后台', '即时通讯服务', '分布式任务调度平台', '秒杀系统']
  },
  'Python开发工程师': {
    desc: '使用Python进行Web开发、数据分析、AI应用等。',
    skills: [
      { name: 'Python基础', level: '必备', desc: '语法、数据结构、OOP、异常处理' },
      { name: 'Web框架', level: '必备', desc: 'Django/Flask/FastAPI、REST API' },
      { name: '数据库', level: '必备', desc: 'ORM、MySQL、Redis、MongoDB' },
      { name: '数据分析', level: '优先', desc: 'Pandas、NumPy、Matplotlib' },
      { name: 'AI/ML', level: '优先', desc: 'Scikit-learn、TensorFlow、PyTorch' },
      { name: '自动化', level: '加分', desc: 'Selenium、Playwright、爬虫' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-2个月）', tasks: ['Python语法', 'OOP编程', '常用库'] },
      { phase: '🚀 进阶阶段（2-4个月）', tasks: ['Web框架', '数据库操作', 'API设计'] },
      { phase: '💡 实战阶段（4-6个月）', tasks: ['数据分析', '爬虫开发', '项目实战'] },
      { phase: '🏆 高级阶段（6-9个月）', tasks: ['AI应用', '系统设计', '性能优化'] }
    ],
    resources: ['Python官方文档', 'Django/Flask官方教程', '《流畅的Python》'],
    projects: ['Web博客系统', '数据分析仪表板', 'AI聊天机器人', '自动化测试框架']
  },
  '算法工程师': {
    desc: '核心算法研发、模型优化、AI系统落地。',
    skills: [
      { name: '数据结构', level: '必备', desc: '数组、链表、树、图、哈希、堆、排序' },
      { name: '算法设计', level: '必备', desc: '动态规划、贪心、分治、回溯、图算法' },
      { name: '机器学习', level: '必备', desc: '监督学习、非监督学习、特征工程' },
      { name: '深度学习', level: '优先', desc: 'CNN、RNN、Transformer、PyTorch/TensorFlow' },
      { name: 'NLP/CV', level: '优先', desc: 'BERT、GPT、图像分类、目标检测' },
      { name: '工程能力', level: '加分', desc: '模型部署、TensorRT、ONNX、分布式训练' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-3个月）', tasks: ['数据结构与算法', 'Python编程', '数学基础'] },
      { phase: '🚀 进阶阶段（3-6个月）', tasks: ['机器学习', '深度学习基础', '经典模型复现'] },
      { phase: '💡 实战阶段（6-9个月）', tasks: ['NLP/CV项目', 'Kaggle比赛', '模型优化'] },
      { phase: '🏆 高级阶段（9-12个月）', tasks: ['大模型应用', '系统设计', '技术方案'] }
    ],
    resources: ['《算法导论》', 'CS229/CS231n课程', 'PyTorch官方教程', 'Kaggle竞赛'],
    projects: ['文本分类系统', '图像识别平台', '推荐系统', '大模型微调项目']
  },
  '测试工程师': {
    desc: '负责产品质量保障，包括功能测试、自动化测试、性能测试。',
    skills: [
      { name: '测试基础', level: '必备', desc: '测试用例设计、缺陷管理、测试流程' },
      { name: '自动化测试', level: '必备', desc: 'Selenium/Playwright、Pytest、JUnit' },
      { name: '接口测试', level: '必备', desc: 'Postman、JMeter、REST API测试' },
      { name: '性能测试', level: '优先', desc: 'JMeter、LoadRunner、压力测试' },
      { name: '编程语言', level: '优先', desc: 'Python/Java、脚本编写' },
      { name: 'CI/CD', level: '加分', desc: 'Jenkins、GitLab CI、自动化流水线' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-2个月）', tasks: ['测试理论', '测试用例设计', '缺陷管理'] },
      { phase: '🚀 进阶阶段（2-4个月）', tasks: ['自动化测试', '接口测试', 'Python/Java'] },
      { phase: '💡 实战阶段（4-6个月）', tasks: ['性能测试', 'CI/CD集成', '测试框架搭建'] },
      { phase: '🏆 高级阶段（6-9个月）', tasks: ['测试架构', '质量体系', '技术方案'] }
    ],
    resources: ['《软件测试的艺术》', 'Selenium官方文档', 'Pytest教程'],
    projects: ['自动化测试框架', '接口测试平台', '性能测试报告', '持续集成体系']
  },
  '运维工程师': {
    desc: '负责系统部署、运维、监控，保障系统稳定运行。',
    skills: [
      { name: 'Linux基础', level: '必备', desc: '命令行、Shell脚本、权限管理、进程管理' },
      { name: '网络基础', level: '必备', desc: 'TCP/IP、HTTP、Nginx、负载均衡' },
      { name: '容器技术', level: '必备', desc: 'Docker、Kubernetes、镜像管理' },
      { name: '监控告警', level: '优先', desc: 'Prometheus、Grafana、ELK、日志分析' },
      { name: 'IaC', level: '优先', desc: 'Ansible、Terraform、自动化运维' },
      { name: '云平台', level: '加分', desc: '阿里云/腾讯云/AWS、Serverless' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-2个月）', tasks: ['Linux基础', 'Shell脚本', 'Git'] },
      { phase: '🚀 进阶阶段（2-4个月）', tasks: ['Docker', 'Kubernetes', 'Nginx'] },
      { phase: '💡 实战阶段（4-6个月）', tasks: ['监控系统', '自动化运维', 'CI/CD'] },
      { phase: '🏆 高级阶段（6-9个月）', tasks: ['云原生架构', 'SRE', '系统设计'] }
    ],
    resources: ['《鸟哥Linux私房菜》', 'Docker官方文档', 'Kubernetes教程'],
    projects: ['K8s集群搭建', '监控告警平台', '自动化部署系统', '日志分析平台']
  },
  '数据库工程师': {
    desc: '负责数据库设计、优化、维护，保障数据存储高效稳定。',
    skills: [
      { name: 'SQL基础', level: '必备', desc: 'SQL语法、多表关联、索引、事务' },
      { name: 'MySQL', level: '必备', desc: '存储引擎、优化器、主从复制、备份恢复' },
      { name: 'Redis', level: '必备', desc: '数据结构、持久化、集群、缓存策略' },
      { name: '性能优化', level: '优先', desc: '慢查询分析、执行计划、性能调优' },
      { name: '分布式', level: '优先', desc: '分库分表、读写分离、分布式事务' },
      { name: 'NoSQL', level: '加分', desc: 'MongoDB、Elasticsearch、HBase' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-2个月）', tasks: ['SQL基础', 'MySQL入门', 'Redis入门'] },
      { phase: '🚀 进阶阶段（2-4个月）', tasks: ['MySQL高级', 'Redis进阶', '性能优化'] },
      { phase: '💡 实战阶段（4-6个月）', tasks: ['分布式数据库', '高可用架构', '数据迁移'] },
      { phase: '🏆 高级阶段（6-9个月）', tasks: ['数据库内核', 'NewSQL', '云原生数据库'] }
    ],
    resources: ['《高性能MySQL》', '《Redis设计与实现》', 'MySQL官方手册'],
    projects: ['电商数据库设计', '高并发缓存系统', '数据中台', '分库分表中间件']
  },
  '移动端开发工程师': {
    desc: '负责iOS/Android App开发，打造流畅的移动端用户体验。',
    skills: [
      { name: 'Java/Kotlin', level: '必备', desc: 'Android开发语言、Jetpack Compose' },
      { name: 'Swift/Objective-C', level: '必备', desc: 'iOS开发语言、SwiftUI' },
      { name: '跨平台', level: '优先', desc: 'Flutter、React Native、uniapp' },
      { name: 'UI/UX', level: '必备', desc: 'Material Design、人机交互规范' },
      { name: '性能优化', level: '优先', desc: '内存优化、启动优化、渲染优化' },
      { name: '原生交互', level: '加分', desc: '相机、传感器、生物识别、AR' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-3个月）', tasks: ['Java/Kotlin', 'Android Studio', '基础UI开发'] },
      { phase: '🚀 进阶阶段（3-6个月）', tasks: ['Jetpack组件', '网络编程', '数据存储'] },
      { phase: '💡 实战阶段（6-9个月）', tasks: ['Flutter跨平台', '性能优化', '上架发布'] },
      { phase: '🏆 高级阶段（9-12个月）', tasks: ['架构设计', 'SDK开发', '性能调优'] }
    ],
    resources: ['Android开发者官网', 'Flutter官方文档', '《第一行代码》'],
    projects: ['电商App', '社交应用', '工具类App', '跨平台项目']
  },
  '大数据工程师': {
    desc: '负责大数据平台搭建、数据处理、分析挖掘。',
    skills: [
      { name: 'Hadoop生态', level: '必备', desc: 'HDFS、YARN、Hive、HBase' },
      { name: '计算引擎', level: '必备', desc: 'Spark、Flink、MapReduce' },
      { name: '数据仓库', level: '优先', desc: 'ETL、分层设计、维度建模' },
      { name: '实时计算', level: '优先', desc: 'Kafka、Spark Streaming、Flink SQL' },
      { name: '数据治理', level: '加分', desc: '数据质量、血缘追踪、元数据管理' },
      { name: '云原生', level: '加分', desc: 'EMR、MaxCompute、云原生数仓' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-3个月）', tasks: ['Java/Scala', 'Linux基础', 'SQL基础'] },
      { phase: '🚀 进阶阶段（3-6个月）', tasks: ['Hadoop', 'Spark', 'Hive'] },
      { phase: '💡 实战阶段（6-9个月）', tasks: ['Flink实时计算', '数据仓库', 'ETL开发'] },
      { phase: '🏆 高级阶段（9-12个月）', tasks: ['数据平台架构', '湖仓一体', '数据治理'] }
    ],
    resources: ['Hadoop官方文档', 'Spark官方文档', '《大数据时代》'],
    projects: ['实时数据平台', '用户画像系统', '推荐系统', '数据中台']
  },
  '安全工程师': {
    desc: '负责系统安全、渗透测试、安全审计。',
    skills: [
      { name: '网络安全基础', level: '必备', desc: 'TCP/IP、常见攻击类型、防御机制' },
      { name: '渗透测试', level: '必备', desc: 'SQL注入、XSS、CSRF、SSRF、文件上传' },
      { name: '代码审计', level: '优先', desc: '白盒测试、漏洞挖掘、CVE分析' },
      { name: '逆向工程', level: '优先', desc: 'IDA Pro、GDB、反编译、脱壳' },
      { name: '安全工具', level: '优先', desc: 'Burp Suite、Nmap、Metasploit、Frida' },
      { name: '等保合规', level: '加分', desc: '等保2.0、ISO27001、GDPR' }
    ],
    phases: [
      { phase: '🎯 基础阶段（1-2个月）', tasks: ['网络基础', 'Linux', 'Python脚本'] },
      { phase: '🚀 进阶阶段（2-4个月）', tasks: ['Web安全', '渗透测试', '安全工具'] },
      { phase: '💡 实战阶段（4-6个月）', tasks: ['CTF比赛', '代码审计', '漏洞挖掘'] },
      { phase: '🏆 高级阶段（6-9个月）', tasks: ['逆向工程', '安全架构', '应急响应'] }
    ],
    resources: ['《白帽子讲Web安全》', 'OWASP Top 10', 'CTFHub'],
    projects: ['渗透测试报告', '漏洞扫描平台', 'WAF系统', '安全审计工具']
  },
  '全栈工程师': {
    desc: '同时具备前后端开发能力，独立完成产品全流程开发。',
    skills: [
      { name: '前端技术栈', level: '必备', desc: 'Vue/React、TypeScript、UI设计' },
      { name: '后端技术栈', level: '必备', desc: 'Node.js/Java、数据库、API设计' },
      { name: 'DevOps', level: '优先', desc: 'Docker、CI/CD、云平台部署' },
      { name: '系统设计', level: '优先', desc: '架构设计、技术选型、性能优化' },
      { name: '产品思维', level: '加分', desc: '需求分析、用户体验、产品设计' }
    ],
    phases: [
      { phase: '🎯 基础阶段（2-4个月）', tasks: ['前后端基础', '全栈框架', '数据库'] },
      { phase: '🚀 进阶阶段（4-8个月）', tasks: ['全栈项目', 'DevOps', '云部署'] },
      { phase: '💡 实战阶段（8-12个月）', tasks: ['独立产品开发', '架构设计', '上线运营'] }
    ],
    resources: ['Next.js/Nuxt教程', 'Full Stack Open', '《全栈工程师》'],
    projects: ['SaaS产品', '个人创业项目', '开源项目', '技术平台']
  },
  '产品经理': {
    desc: '负责产品规划、需求分析、用户体验设计。',
    skills: [
      { name: '需求分析', level: '必备', desc: '用户研究、竞品分析、需求文档(PRD)' },
      { name: '产品设计', level: '必备', desc: '原型设计、交互设计、信息架构' },
      { name: '数据分析', level: '优先', desc: '数据埋点、漏斗分析、A/B测试' },
      { name: '项目管理', level: '优先', desc: '敏捷开发、跨团队协作、进度管理' },
      { name: '技术理解', level: '加分', desc: '了解前后端技术、能力边界、实现成本' }
    ],
    phases: [
      { phase: '🎯 入门阶段（1-3个月）', tasks: ['产品思维', '需求分析', '原型工具'] },
      { phase: '🚀 进阶阶段（3-6个月）', tasks: ['产品规划', '数据分析', '项目管理'] },
      { phase: '💡 实战阶段（6-12个月）', tasks: ['负责完整产品', '产品优化', '团队协作'] }
    ],
    resources: ['《产品经理》', '人人都是产品经理', 'Axure/Figma教程'],
    projects: ['产品原型设计', '需求文档撰写', '产品迭代优化']
  }
}

// 通用技术问答知识库
const TECH_QA = {
  'vue': {
    keywords: ['vue', 'Vue'],
    answer: `## 💡 Vue.js 相关解答

### Vue vs React 核心区别

| 特性 | Vue 3 | React |
|------|-------|-------|
| 响应式原理 | Proxy代理对象 | setState/useState |
| 模板语法 | Template（基于HTML） | JSX（JavaScript） |
| 学习曲线 | 更平缓 | 较陡峭 |
| 官方路由 | Vue Router | React Router |
| 状态管理 | Pinia | Redux/Zustand |

### Vue 3 核心特性
- **Composition API**：更灵活的代码组织方式，逻辑复用
- **响应式系统**：基于 Proxy 的响应式，性能更好
- **Teleport**：传送门组件，将内容渲染到指定DOM
- **Suspense**：异步组件加载处理
- **TypeScript**：更好的类型支持

### 学习建议
1. 先掌握 Vue 3 基础（Template、Script、Style）
2. 深入 Composition API（setup、ref、reactive、computed、watch）
3. 学习 Vue Router 和 Pinia
4. 实践项目：TodoApp → 管理系统 → 开源组件

💡 推荐资源：Vue 3 官方文档、《Vue.js 设计与实现》`
  },
  'react': {
    keywords: ['react', 'React'],
    answer: `## 💡 React 相关解答

### React 核心概念
- **组件化**：UI 拆分为组件，组件树构成页面
- **单向数据流**：数据自上而下流动，通过 props 传递
- **状态管理**：useState/useReducer 管理组件内部状态
- **虚拟DOM**：通过 Diff 算法最小化 DOM 操作

### React Hooks 详解
| Hook | 用途 |
|------|------|
| useState | 状态管理 |
| useEffect | 副作用（API调用、订阅） |
| useContext | 跨组件共享状态 |
| useRef | DOM引用/可变值 |
| useMemo | 缓存计算结果 |
| useCallback | 缓存函数引用 |
| useCustomHook | 自定义Hook逻辑复用 |

### 学习路径
1. JSX 语法 → 组件基础 → Props/State
2. Hooks → Context → Redux/Zustand
3. React Router → Next.js → 服务端渲染
4. 性能优化 → 源码阅读 → 架构设计

💡 推荐资源：React 官方文档、《React 设计模式》`
  },
  'javascript': {
    keywords: ['javascript', 'js', 'JS', 'JavaScript'],
    answer: `## 💡 JavaScript 核心知识点

### 重要概念
1. **执行上下文**：全局/函数/块级作用域，变量提升
2. **原型链**：对象继承机制，__proto__、prototype
3. **闭包**：函数与其词法环境的组合，数据私有化
4. **异步编程**：Callback → Promise → async/await
5. **事件循环**：宏任务/微任务，setTimeout/setInterval

### ES6+ 新特性
- 箭头函数、解构赋值、模板字符串
- Promise、async/await
- Map/Set、WeakMap/WeakSet
- Class、模块化（import/export）
- Proxy、Symbol、迭代器

### 常见面试题
1. == 和 === 的区别？
2. 闭包的实现原理和应用场景？
3. Event Loop 是什么？微任务和宏任务的执行顺序？
4. Promise 的实现原理？
5. var/let/const 的区别？

💡 推荐资源：《JavaScript高级程序设计》、MDN Web Docs`
  },
  'java': {
    keywords: ['java', 'Java'],
    answer: `## 💡 Java 核心知识点

### 核心特性
1. **面向对象**：封装、继承、多态、抽象
2. **集合框架**：List/Set/Map、HashMap、ConcurrentHashMap
3. **多线程**：Thread/Runnable、synchronized、volatile、Lock
4. **JVM**：堆/栈/方法区、GC算法、类加载
5. **IO/NIO**：传统IO vs 非阻塞IO

### Spring 核心
- IoC/DI：控制反转、依赖注入
- AOP：面向切面编程
- Spring Boot：自动配置、起步依赖
- Spring Cloud：微服务框架

### 学习路线
1. Java基础 → 集合框架 → 多线程
2. JDBC → Spring → Spring Boot
3. MySQL → Redis → 消息队列
4. 分布式 → 微服务 → 云原生

💡 推荐资源：《Java核心技术》、Spring官方文档`
  },
  'python': {
    keywords: ['python', 'Python'],
    answer: `## 💡 Python 核心知识点

### 核心特性
1. **语法简洁**：动态类型、强制缩进、丰富内置
2. **数据结构**：list、dict、set、tuple
3. **OOP**：类、继承、多态、魔术方法
4. **函数式**：lambda、map/filter、装饰器
5. **异步**：asyncio、协程、async/await

### 应用领域
- **Web开发**：Django、Flask、FastAPI
- **数据分析**：Pandas、NumPy、Matplotlib
- **AI/ML**：PyTorch、TensorFlow、Scikit-learn
- **自动化**：Selenium、Playwright、Celery

### 学习建议
1. Python基础语法 → 数据结构 → OOP
2. Web框架（Django/Flask）→ 数据库
3. 数据分析 → AI/ML
4. 项目实战 → 开源贡献

💡 推荐资源：《Python编程：从入门到实践》、官方文档`
  },
  'mysql': {
    keywords: ['mysql', 'MySQL', 'sql', 'SQL'],
    answer: `## 💡 MySQL 核心知识点

### 核心概念
1. **存储引擎**：InnoDB（事务）vs MyISAM（读密集）
2. **索引**：B+树索引、哈希索引、全文索引
3. **事务**：ACID特性、隔离级别、MVCC
4. **锁**：行锁、表锁、间隙锁、乐观锁/悲观锁
5. **主从复制**：binlog、同步机制、读写分离

### 性能优化
1. **索引优化**：合理使用联合索引、覆盖索引
2. **SQL优化**：避免全表扫描、使用EXPLAIN分析
3. **表结构优化**：选择合适数据类型、适当反范式化
4. **分库分表**：垂直拆分、水平拆分

### 常见面试题
- InnoDB vs MyISAM 区别？
- 事务的四大特性？
- 如何优化SQL查询？
- 索引失效的常见场景？

💡 推荐资源：《高性能MySQL》、MySQL官方手册`
  },
  'redis': {
    keywords: ['redis', 'Redis'],
    answer: `## 💡 Redis 核心知识点

### 数据结构
| 类型 | 说明 | 应用场景 |
|------|------|----------|
| String | 字符串 | 缓存、计数器、分布式锁 |
| Hash | 哈希表 | 对象存储、配置缓存 |
| List | 列表 | 消息队列、最新列表 |
| Set | 集合 | 去重、共同好友、标签 |
| ZSet | 有序集合 | 排行榜、延迟队列 |
| Stream | 流 | 消息队列 |

### 核心机制
1. **持久化**：RDB（快照）vs AOF（追加日志）
2. **内存淘汰**：LRU、LFU、TTL过期
3. **集群**：主从复制、哨兵、Cluster
4. **事务**：MULTI/EXEC、Lua脚本、WATCH

### 常见面试题
- Redis 为什么快？
- 缓存穿透/击穿/雪崩？
- Redis vs Memcached？
- 分布式锁实现？

💡 推荐资源：《Redis设计与实现》、Redis官方文档`
  },
  'algorithm': {
    keywords: ['算法', 'algorithm', '数据结构'],
    answer: `## 💡 算法与数据结构学习指南

### 核心数据结构
| 结构 | 时间复杂度 | 应用场景 |
|------|-----------|----------|
| 数组 | 访问O(1)，插入O(n) | 随机访问 |
| 链表 | 访问O(n)，插入O(1) | 频繁增删 |
| 栈 | LIFO O(1) | 函数调用、括号匹配 |
| 队列 | FIFO O(1) | BFS、任务调度 |
| 哈希表 | 平均O(1) | 缓存、字典 |
| 二叉树 | 平均O(log n) | 搜索、排序 |
| 堆 | O(log n) | 优先队列、TopK |
| 图 | O(V+E) | 路径规划、社交网络 |

### 排序算法
- **冒泡/插入/选择**：O(n²)，简单直观
- **快排/归并/堆排**：O(n log n)，实际应用
- **桶排/计数排**：O(n)，特殊场景

### 学习路径
1. 数组/链表 → 栈/队列 → 树 → 图
2. 排序/搜索 → 动态规划 → 贪心/回溯
3. LeetCode 刷题（Easy → Medium → Hard）
4. 系统设计题

💡 推荐资源：《算法导论》、LeetCode、CS-Notes`
  },
  'docker': {
    keywords: ['docker', 'Docker', '容器'],
    answer: `## 💡 Docker 核心知识点

### 核心概念
- **容器**：轻量级虚拟化，共享宿主内核
- **镜像**：只读模板，包含应用及依赖
- **Dockerfile**：镜像构建脚本
- **Docker Compose**：多容器编排

### 常用命令
[命令示例]
docker build -t myapp .      # 构建镜像
docker run -d -p 8080:8080 myapp  # 运行容器
docker ps / docker logs      # 查看状态/日志
docker exec -it container sh # 进入容器
docker compose up -d         # 编排启动

### Dockerfile 最佳实践
1. 选择最小基础镜像（alpine/slim）
2. 利用分层缓存（变化少的放前面）
3. 使用 .dockerignore
4. 多阶段构建减小体积
5. 指定 WORKDIR 和 ENTRYPOINT

### 常见面试题
- Docker vs 虚拟机？
- 容器的隔离原理？
- Dockerfile 优化？
- K8s vs Docker Compose？

💡 推荐资源：Docker官方文档、《Docker实践》`
  },
  'git': {
    keywords: ['git', 'Git', 'GitHub'],
    answer: `## 💡 Git 核心知识点

### 基础命令
[命令示例]
git init / git clone          # 初始化/克隆
git add . / git commit -m ""  # 暂存/提交
git push / git pull           # 推送/拉取
git branch / git checkout     # 分支/切换
git merge / git rebase        # 合并/变基

### 重要概念
- **工作区/暂存区/仓库**：三层架构
- **分支模型**：main/develop/feature/release/hotfix
- **合并策略**：merge、rebase、cherry-pick
- **远程仓库**：GitHub/GitLab/Gitee

### 常见场景
1. **撤销操作**：git reset / git revert
2. **暂存工作**：git stash save/pop
3. **查看历史**：git log / git diff
4. **冲突解决**：手动解决 + git add + git commit

### 协作流程
1. Fork 仓库 → Clone → 创建分支 → 提交 → PR → Code Review → Merge

💡 推荐资源：Pro Git、Git官方文档`
  },
  '面试': {
    keywords: ['面试', '面试题', '面试准备', '八股文'],
    answer: `## 🎯 面试准备指南

### 面试流程
1. **简历筛查**：6-30秒审阅，重点关注项目和技能
2. **技术笔试**：算法题、代码题、系统设计
3. **技术面试**：深度技术问题、项目细节
4. **HR面试**：综合素质、职业规划、薪资谈判

### 高频面试题类型
1. **基础原理**：JS引擎、事件循环、原型链
2. **框架源码**：Vue/React 核心原理
3. **工程实践**：性能优化、工程化、架构设计
4. **系统设计**：设计模式、大规模系统

### 答题技巧
1. **STAR法则**：背景→任务→行动→结果
2. **结构化**：分点阐述、由浅入深
3. **结合项目**：用实际经验佐证
4. **主动引导**：展示思考深度

### 常见问题
- 介绍一下你最得意的项目？
- 你遇到过的最大技术挑战？
- 你的职业规划是什么？
- 你有什么想问我们的？

💡 建议：刷 LeetCode + 准备八股文 + 模拟面试`
  }
}

// 通用模拟面试题
const MOCK_INTERVIEW_QUESTIONS = {
  '前端开发工程师': [
    { q: '请解释 Vue 的响应式原理', a: 'Vue 3 使用 Proxy 替代 Object.defineProperty。通过 Proxy 拦截对象的 get/set/delete 等操作，结合 Effect 实现自动依赖收集和触发更新。核心流程：Proxy 拦截 → track 收集依赖 → trigger 触发更新 → 调度器执行副作用函数。' },
    { q: '什么是虚拟DOM？它是如何工作的？', a: '虚拟DOM是真实DOM的JavaScript对象表示。工作流程：1. 模板编译成render函数；2. 生成虚拟DOM树；3. 新旧虚拟DOM进行Diff比较；4. 将差异批量更新到真实DOM。优势：减少直接DOM操作、跨平台能力、Diff算法高效。' },
    { q: 'Vue 的生命周期钩子有哪些？执行顺序？', a: 'Vue 3 生命周期：setup → beforeCreate → created → beforeMount → mounted → beforeUpdate → updated → beforeUnmount → unmounted。Composition API 对应：setup → onBeforeMount → onMounted → onBeforeUpdate → onUpdated → onBeforeUnmount → onUnmounted。' },
    { q: '如何优化前端性能？', a: '1. 加载优化：代码分割、懒加载、Tree Shaking、压缩；2. 渲染优化：虚拟列表、防抖节流、合理使用key、v-if vs v-show；3. 资源优化：图片压缩、CDN、缓存；4. 构建优化：Webpack/Vite配置、分包策略。' },
    { q: '请解释浏览器的事件循环', a: 'JavaScript 执行分为：执行栈（同步代码）、宏任务（setTimeout、setInterval、I/O）、微任务（Promise.then、process.nextTick）。执行顺序：调用栈 → 微任务队列 → 宏任务队列（每轮一个）。关键：微任务总是在当前宏任务完成后立即清空。' }
  ],
  '后端开发工程师': [
    { q: '请解释 Spring Bean 的生命周期', a: '1. 实例化（通过反射创建Bean）；2. 属性赋值（依赖注入）；3. Aware接口调用（BeanNameAware等）；4. BeanPostProcessor前置处理；5. 初始化（@PostConstruct、InitializingBean）；6. BeanPostProcessor后置处理；7. 使用；8. 销毁（@PreDestroy、DisposableBean）。' },
    { q: 'MySQL 的索引类型有哪些？原理？', a: '索引类型：1. B+树索引（最常用）：有序存储、范围查询高效；2. 哈希索引：等值查询快；3. 全文索引：文本搜索。B+树原理：非叶子节点存索引键值，叶子节点存数据或主键，支持高效范围查询和排序。' },
    { q: '如何保证分布式系统的一致性？', a: '一致性方案：1. 2PC/3PC：强一致但阻塞；2. TCC：Try-Confirm-Cancel，业务侵入大；3. Saga：长事务补偿；4. 消息队列：最终一致性；5. 分布式锁：Redis/Redisson。选型看业务：强一致用2PC/TCC，最终一致用MQ/Saga。' },
    { q: 'Redis 缓存穿透、击穿、雪崩如何解决？', a: '1. 缓存穿透：查不存在的数据→布隆过滤器/空值缓存；2. 缓存击穿：热点key过期→互斥锁/永不过期；3. 缓存雪崩：大量key同时过期→随机过期时间/集群/降级。方案组合使用效果最好。' },
    { q: '请解释 JVM 的内存模型和 GC 机制', a: 'JVM内存：堆（对象实例）、方法区/元空间（类信息）、虚拟机栈（栈帧）、本地方法栈、程序计数器。GC算法：1. 标记-清除；2. 复制算法（新生代）；3. 标记-整理（老年代）；4. 分代收集。GC器：CMS、G1、ZGC、Shenandoah。' }
  ],
  '算法工程师': [
    { q: '请解释 Transformer 的核心结构', a: 'Transformer 核心：1. 多头自注意力（Multi-Head Self-Attention）；2. 位置编码；3. 前馈网络；4. LayerNorm；5. 残差连接。编码器和解码器结构。创新点：完全基于注意力机制，抛弃RNN和CNN，实现并行计算和高效建模。' },
    { q: '过拟合如何解决？', a: '解决过拟合：1. 增加训练数据；2. 数据增强；3. 正则化（L1/L2）；4. Dropout；5. 早停（Early Stopping）；6. 降低模型复杂度；7. 特征选择；8. 交叉验证。组合使用效果最好。' },
    { q: 'BERT 和 GPT 的区别？', a: 'BERT：双向编码器，理解任务（分类、QA）；GPT：单向解码器，生成任务（对话、写作）。BERT用MLM预训练，GPT用自回归语言模型。BERT适合理解类任务，GPT适合生成类任务。' },
    { q: '梯度消失和爆炸如何解决？', a: '1. 合理初始化（Xavier/Kaiming）；2. 归一化（BatchNorm/LayerNorm）；3. 残差连接（ResNet）；4. 合适的激活函数（ReLU/GELU）；5. 梯度裁剪；6. 学习率调整。' },
    { q: '请解释注意力机制', a: '注意力机制核心：让模型关注输入的重要部分。计算步骤：1. Q（Query）× K（Key）→ 相似度分数；2. Softmax 归一化；3. 乘以 V（Value）→ 加权求和。Self-Attention 让序列中每个位置关注其他所有位置。' }
  ]
}

// 默认模拟面试题
const DEFAULT_INTERVIEW_QUESTIONS = [
  { q: '请做一个自我介绍', a: '您好，我是XX，毕业于XX大学计算机专业，有X年开发经验。精通XX技术栈，参与过XX项目。注重代码质量和团队协作，希望在贵公司发挥价值。' },
  { q: '你的职业规划是什么？', a: '短期(1年)：快速融入团队，精通业务，成为技术骨干。中期(3年)：向技术专家/架构师方向发展，承担核心项目。长期(5年)：技术管理或资深专家，引领技术方向。' },
  { q: '介绍一下你最得意的项目', a: '使用STAR法则：Situation(背景)-项目的业务场景和技术背景；Task(任务)-你的职责和目标；Action(行动)-具体技术方案和实现；Result(结果)-量化成果和价值。重点展示技术深度和问题解决能力。' },
  { q: '你的优缺点是什么？', a: '优点：1. 学习能力强，新技术上手快；2. 注重代码质量，追求卓越；3. 团队协作好，沟通顺畅。缺点：有时过于追求完美，正在学习平衡效率与质量。' },
  { q: '为什么选择我们公司？', a: '1. 认同公司的业务方向和价值观；2. 公司的技术栈和挑战吸引我；3. 团队氛围和发展空间；4. 行业口碑和前景。结合自身情况真诚回答。' }
]

// 技能诊断知识
const SKILL_DIAGNOSIS = {
  '前端': {
    basic: ['HTML/CSS', 'JavaScript基础', 'ES6+'],
    intermediate: ['Vue/React', 'TypeScript', 'Webpack/Vite'],
    advanced: ['源码理解', '架构设计', '性能优化']
  },
  '后端': {
    basic: ['Java/Python基础', 'MySQL基础', 'Redis基础'],
    intermediate: ['Spring Boot', '消息队列', '微服务'],
    advanced: ['分布式架构', '高可用设计', '性能调优']
  }
}

// 薪资参考数据（2024年）
const SALARY_DATA = {
  '前端开发工程师': { '1年': '10-20K', '3年': '18-35K', '5年': '30-60K' },
  '后端开发工程师': { '1年': '12-25K', '3年': '20-40K', '5年': '35-70K' },
  '算法工程师': { '1年': '15-30K', '3年': '25-50K', '5年': '40-80K' },
  '测试工程师': { '1年': '8-15K', '3年': '15-25K', '5年': '22-40K' },
  '运维工程师': { '1年': '10-18K', '3年': '18-30K', '5年': '28-50K' },
  '全栈工程师': { '1年': '12-22K', '3年': '20-40K', '5年': '35-60K' },
  '大数据工程师': { '1年': '15-25K', '3年': '25-45K', '5年': '40-70K' }
}

// 意图检测
export function detectIntent(message) {
  const msg = message.toLowerCase()
  let bestIntent = 'general'
  let bestScore = 0

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0
    for (const keyword of keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }
  return bestIntent
}

// 规则检测
export function checkFixedRules(message) {
  const msg = message.toLowerCase().trim()

  for (const keyword of IDENTITY_KEYWORDS) {
    if (msg.includes(keyword.toLowerCase())) {
      return { matched: true, type: 'identity', response: IDENTITY_RESPONSE }
    }
  }

  for (const keyword of OFF_TOPIC_KEYWORDS) {
    if (msg.includes(keyword)) {
      return { matched: true, type: 'offtopic', response: OFF_TOPIC_RESPONSE }
    }
  }

  return { matched: false }
}

// 岗位匹配
export function matchPosition(message) {
  const msg = message.toLowerCase()

  for (const [position, keywords] of Object.entries(POSITION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        return position
      }
    }
  }
  return null
}

// 技术问答匹配
export function matchTechQA(message) {
  const msg = message.toLowerCase()

  // 直接匹配技术问答
  for (const [topic, config] of Object.entries(TECH_QA)) {
    for (const keyword of config.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        // 检查是否有更具体的匹配
        continue
      }
    }
  }

  // 更精确的匹配：按匹配数量排序
  let bestMatch = null
  let bestScore = 0
  for (const [topic, config] of Object.entries(TECH_QA)) {
    let score = 0
    for (const keyword of config.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = config
    }
  }

  return bestScore > 0 ? bestMatch : null
}

// 生成学习路线
export function generateLearningRoute(position) {
  const data = POSITION_ROUTES[position]
  if (!data) return null

  let answer = `## 🎯 ${position} 完整学习路线\n\n`
  answer += `### 📋 岗位概述\n${data.desc}\n\n`

  if (data.skills && data.skills.length > 0) {
    answer += `### 🔧 核心技能清单\n`
    for (const skill of data.skills) {
      const emoji = skill.level === '必备' ? '🔴' : skill.level === '优先' ? '🟡' : '🟢'
      answer += `${emoji} **${skill.name}**（${skill.level}）：${skill.desc}\n`
    }
    answer += '\n'
  }

  if (data.phases && data.phases.length > 0) {
    answer += `### 📚 分阶段学习路线\n`
    for (const phase of data.phases) {
      answer += `\n**${phase.phase}**\n`
      for (const task of phase.tasks) {
        answer += `  • ${task}\n`
      }
    }
    answer += '\n'
  }

  if (data.resources && data.resources.length > 0) {
    answer += `### 🔗 权威学习资源\n`
    for (const res of data.resources) {
      answer += `  • ${res}\n`
    }
    answer += '\n'
  }

  if (data.projects && data.projects.length > 0) {
    answer += `### 💡 推荐项目\n`
    for (const proj of data.projects) {
      answer += `  • ${proj}\n`
    }
    answer += '\n'
  }

  // 添加薪资参考
  const salary = SALARY_DATA[position]
  if (salary) {
    answer += `### 💰 薪资参考（2024年）\n`
    for (const [exp, sal] of Object.entries(salary)) {
      answer += `  • ${exp}经验：${sal}\n`
    }
    answer += '\n'
  }

  return answer
}

// 生成模拟面试
export function generateMockInterview(position) {
  let questions = MOCK_INTERVIEW_QUESTIONS[position] || DEFAULT_INTERVIEW_QUESTIONS

  let answer = `## 🎯 ${position || '通用'} - 模拟面试\n\n`
  answer += `### 以下是常见面试问题，请尝试回答：\n\n`

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

// 生成技能诊断
export function generateSkillDiagnosis(message) {
  let answer = `## 🔍 技能诊断分析\n\n`

  // 简单的技能匹配分析
  const skills = [
    { name: 'HTML/CSS', status: '待学习' },
    { name: 'JavaScript', status: '学习中' },
    { name: 'Vue/React', status: '待学习' },
    { name: 'TypeScript', status: '未开始' },
    { name: '构建工具', status: '未开始' }
  ]

  answer += `### 📊 当前技能状态\n\n`
  for (const skill of skills) {
    const icon = skill.status === '待学习' ? '📘' : skill.status === '学习中' ? '📗' : '⬜'
    answer += `${icon} **${skill.name}** - ${skill.status}\n`
  }

  answer += `\n### 🎯 提升建议\n\n`
  answer += `1. **基础优先**：先巩固 HTML/CSS/JS 核心知识\n`
  answer += `2. **框架深入**：掌握 Vue/React 任一生态\n`
  answer += `3. **实战项目**：通过项目加深理解\n`
  answer += `4. **持续学习**：关注社区动态和新技术\n\n`

  answer += `💡 你可以问我具体技能的学习方法，例如 "Vue学习路线"、"如何学JavaScript"`

  return answer
}

// 主处理函数
export function processLocalAIResponse(message, history = []) {
  if (!message || !message.trim()) {
    return '请输入您的问题~'
  }

  const msg = message.trim()
  const intent = detectIntent(msg)
  const ruleCheck = checkFixedRules(msg)

  // 1. 固定规则检测
  if (ruleCheck.matched) {
    return ruleCheck.response
  }

  // 2. 身份/帮助类
  if (intent === 'general' && (msg.includes('你可以') || msg.includes('能做') || msg.includes('帮助'))) {
    return IDENTITY_RESPONSE
  }

  // 3. 学习路线
  if (intent === 'learning_route') {
    const position = matchPosition(msg)
    if (position) {
      return generateLearningRoute(position)
    }
  }

  // 4. 模拟面试
  if (intent === 'mock_interview') {
    const position = matchPosition(msg)
    return generateMockInterview(position)
  }

  // 5. 技术问答
  if (intent === 'technical_qa' || intent === 'general') {
    const techQA = matchTechQA(msg)
    if (techQA) {
      return techQA.answer
    }

    // 尝试岗位匹配生成回答
    const position = matchPosition(msg)
    if (position && (msg.includes('什么') || msg.includes('怎么') || msg.includes('如何'))) {
      const route = generateLearningRoute(position)
      if (route) {
        return route
      }
    }
  }

  // 6. 常见问题/调试
  if (intent === 'common_problem') {
    return `## 🔧 常见问题排查指南\n\n针对"${msg}"这个问题，建议按以下步骤排查：\n\n1. **信息收集**：确认错误信息、日志、环境\n2. **问题定位**：缩小问题范围，确定根因\n3. **解决方案**：针对性修复\n4. **验证测试**：确认修复有效\n5. **预防措施**：防止类似问题再次发生\n\n💡 如果能提供更多上下文（错误信息、代码片段、环境配置等），可以帮您更精准地定位问题。`
  }

  // 7. 职业规划
  if (intent === 'career') {
    const position = matchPosition(msg)
    if (position) {
      const salary = SALARY_DATA[position]
      let answer = `## 💼 ${position} 职业发展\n\n`
      if (salary) {
        answer += `### 💰 薪资参考（2024年）\n`
        for (const [exp, sal] of Object.entries(salary)) {
          answer += `  • ${exp}经验：${sal}\n`
        }
        answer += '\n'
      }
      answer += `### 📈 发展方向\n`
      answer += `1. **技术专家路线**：初级→中级→高级→技术专家→首席专家\n`
      answer += `2. **技术管理路线**：开发→组长→经理→总监→技术VP\n`
      answer += `3. **架构师路线**：工程师→模块负责人→系统架构师→企业架构师\n\n`
      answer += `### 💡 提升建议\n`
      answer += `1. 打好基础，深入原理\n`
      answer += `2. 参与大型项目，积累经验\n`
      answer += `3. 持续学习，关注行业趋势\n`
      answer += `4. 建立技术影响力（博客、开源、演讲）`
      return answer
    }
  }

  // 8. 资源推荐
  if (intent === 'resource') {
    const position = matchPosition(msg)
    if (position) {
      const data = POSITION_ROUTES[position]
      if (data && data.resources) {
        return `## 📚 ${position} 学习资源\n\n${data.resources.map(r => `• ${r}`).join('\n')}`
      }
    }
  }

  // 9. 最后兜底：尝试岗位匹配
  const position = matchPosition(msg)
  if (position) {
    const route = generateLearningRoute(position)
    if (route) {
      return route
    }
  }

  // 10. 通用兜底
  return `## 💡 AI 学习顾问\n\n我暂时无法直接回答"${msg}"这个问题。\n\n不过我可以帮您：\n\n- 📚 **学习路线**：输入"前端学习路线"、"后端学习路线"等\n- 🎤 **模拟面试**：输入"前端面试题"、"算法面试"等\n- 💻 **技术问答**：输入"Vue和React区别"、"什么是闭包"等\n- 💼 **职业规划**：输入"前端薪资"、"就业前景"等\n\n💬 试试上面的功能，或者换一种方式描述您的问题~`
}
