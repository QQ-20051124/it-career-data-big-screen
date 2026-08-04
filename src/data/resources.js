// ============================================================
// Mock 数据：前端模拟资源数据库
// TODO: 后续对接后端API，替换 findMatchingResources 中的本地数据读取
// ============================================================

// 资源类型枚举
// video      - 视频课程（外部平台观看）
// doc        - 在线文档 / 官方教程
// book       - 图书教材
// course     - 在线课程（付费平台）
// project    - 实战项目
export const resourceDatabase = [
  {
    id: 'r001',
    title: 'Vue.js 3 官方文档',
    type: 'doc',
    provider: 'Vue.js Official',
    difficulty: '基础',
    duration: 480,
    skillTags: ['Vue3 Composition API', 'Vue3响应式原理', 'Vuex/Pinia', 'Vue Router'],
    description: 'Vue 3 官方权威文档，涵盖 Composition API、响应式原理、路由、状态管理全部核心',
    rating: 5.0,
    students: 50000,
    externalUrl: 'https://cn.vuejs.org/',
    url: 'https://cn.vuejs.org/',
    practicePlan: [
      '搭建Vue3 + Vite项目，使用Composition API实现一个待办事项列表',
      '基于Pinia创建全局状态管理，实现主题切换与多标签页持久化',
      '配置Vue Router实现嵌套路由与路由守卫，完成权限控制流程'
    ],
    recommendedTools: [
      'Vue DevTools - 浏览器调试插件，支持组件树与状态检查',
      'Volar - VS Code Vue3语法高亮与类型提示',
      'Pinia - Vue3官方推荐状态管理库'
    ]
  },
  {
    id: 'r002',
    title: 'React 官方文档（Beta）',
    type: 'doc',
    provider: 'React Official',
    difficulty: '基础',
    duration: 600,
    skillTags: ['React Hooks', 'React组件化', 'Context/Redux', 'React Router', 'Next.js'],
    description: 'React 官方最新文档，深入讲解 Hooks、Server Components、并发特性',
    rating: 4.9,
    students: 42000,
    externalUrl: 'https://react.dev/',
    url: 'https://react.dev/',
    practicePlan: [
      '使用useState/useEffect/useReducer实现自定义Hooks库',
      '搭建React + Redux Toolkit项目，实现商品列表与购物车全流程',
      '使用React Router v6配置动态路由与路由懒加载，完成多页面应用'
    ],
    recommendedTools: [
      'React Developer Tools - 浏览器扩展，支持组件检查与性能分析',
      'Redux Toolkit - 官方推荐的简化版状态管理',
      'React Query - 服务端状态管理与数据缓存库'
    ]
  },
  {
    id: 'r003',
    title: 'MDN Web Docs — JavaScript',
    type: 'doc',
    provider: 'MDN',
    difficulty: '基础',
    duration: 720,
    skillTags: ['JavaScript/ES6+', 'DOM操作', '浏览器兼容性', 'CSS3动画'],
    description: 'MDN JavaScript 权威参考，涵盖语言核心、DOM API、Web API 全部主题',
    rating: 4.9,
    students: 80000,
    externalUrl: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
    practicePlan: [
      '手写Array/Object常用方法实现，深入理解原型链与闭包',
      '使用DOM API实现图片懒加载与无限滚动列表',
      '通过requestAnimationFrame与Web Animations API实现卡片翻转动画效果'
    ],
    recommendedTools: [
      'Chrome DevTools - 浏览器调试与性能分析工具',
      'Babel - JavaScript编译器，支持ES6+语法转换',
      'ESLint - JavaScript代码规范检查工具'
    ]
  },
  {
    id: 'r004',
    title: 'TypeScript Handbook',
    type: 'doc',
    provider: 'TypeScript Official',
    difficulty: '基础',
    duration: 480,
    skillTags: ['TypeScript', 'JavaScript/ES6+', 'React', 'Vue.js'],
    description: 'TypeScript 官方手册，类型系统、泛型、装饰器全部详解',
    rating: 4.8,
    students: 30000,
    externalUrl: 'https://www.typescriptlang.org/zh/docs/handbook/intro.html',
    url: 'https://www.typescriptlang.org/zh/docs/handbook/intro.html',
    practicePlan: [
      '定义完整的API接口类型系统，实现前后端类型共享',
      '使用泛型和条件类型编写类型安全的工具函数库',
      '在React项目中全面应用TypeScript，完成类型体操练习'
    ],
    recommendedTools: [
      'TypeScript - 微软官方开源语言',
      'tsc - TypeScript编译器',
      'ts-node - 直接运行TypeScript代码的Node执行环境'
    ]
  },
  {
    id: 'r005',
    title: 'Spring Boot 官方参考文档',
    type: 'doc',
    provider: 'Spring Official',
    difficulty: '进阶',
    duration: 900,
    skillTags: ['Spring Boot', 'Spring Cloud', 'Spring Security', 'MyBatis/JPA', 'Java基础与集合'],
    description: 'Spring Boot 官方权威参考，自动配置、Starter、Actuator 全面覆盖',
    rating: 4.8,
    students: 35000,
    externalUrl: 'https://springdoc.cn/spring-boot/',
    url: 'https://springdoc.cn/spring-boot/',
    practicePlan: [
      '搭建Spring Boot + MyBatis Plus项目，实现CRUD与分页查询',
      '集成Spring Security + JWT实现用户认证与RBAC权限管理',
      '配置Spring Cloud Gateway + Nacos，完成微服务网关路由'
    ],
    recommendedTools: [
      'Spring Boot DevTools - 热部署工具',
      'MyBatis Plus - MyBatis增强框架',
      'Postman - API接口调试工具'
    ]
  },
  {
    id: 'r006',
    title: 'MySQL 8.0 官方参考手册',
    type: 'doc',
    provider: 'MySQL Official',
    difficulty: '进阶',
    duration: 1500,
    skillTags: ['MySQL', '索引优化', 'SQL调优', '事务与锁', '数据库核心'],
    description: 'MySQL 8.0 官方参考手册，InnoDB、SQL、优化器、复制全部详解',
    rating: 4.7,
    students: 28000,
    externalUrl: 'https://dev.mysql.com/doc/refman/8.0/en/',
    url: 'https://dev.mysql.com/doc/refman/8.0/en/',
    practicePlan: [
      '设计电商系统数据库表结构，合理设计索引与外键约束',
      '编写复杂SQL查询，使用EXPLAIN分析执行计划并优化',
      '实现分布式事务场景，理解锁机制与隔离级别对性能的影响'
    ],
    recommendedTools: [
      'Navicat Premium - 数据库可视化管理工具',
      'pt-query-digest - MySQL慢查询分析工具',
      'MySQL Workbench - 官方数据库设计与管理工具'
    ]
  },
  {
    id: 'r007',
    title: 'Redis 官方文档',
    type: 'doc',
    provider: 'Redis Official',
    difficulty: '进阶',
    duration: 600,
    skillTags: ['Redis', '缓存', 'Redis缓存', 'MySQL'],
    description: 'Redis 官方文档，数据结构、命令参考、持久化、集群全指南',
    rating: 4.8,
    students: 22000,
    externalUrl: 'https://redis.io/docs/latest/',
    url: 'https://redis.io/docs/latest/',
    practicePlan: [
      '使用Redis实现分布式限流（滑动窗口+令牌桶算法）',
      '搭建Redis Sentinel高可用集群，完成故障转移演练',
      '实现Spring Boot + Redis缓存穿透/击穿/雪崩解决方案'
    ],
    recommendedTools: [
      'RedisDesktopManager - Redis桌面管理工具',
      'RedisInsight - 官方可视化分析工具',
      'lettuce - 高性能Redis Java客户端'
    ]
  },
  {
    id: 'r008',
    title: 'Kubernetes 官方文档',
    type: 'doc',
    provider: 'Kubernetes Official',
    difficulty: '进阶',
    duration: 1200,
    skillTags: ['Kubernetes架构', 'Pod/Service/Deployment', 'Helm', 'Docker', '容器技术'],
    description: 'K8s 官方文档，集群架构、工作负载、网络、存储、安全全栈',
    rating: 4.9,
    students: 18000,
    externalUrl: 'https://kubernetes.io/zh-cn/docs/home/',
    url: 'https://kubernetes.io/zh-cn/docs/home/',
    practicePlan: [
      '使用kind或minikube搭建本地K8s集群，部署多Pod应用',
      '编写Helm Chart模板，完成应用一键部署与版本回滚',
      '配置Istio实现服务网格，完成灰度发布与流量监控'
    ],
    recommendedTools: [
      'kubectl - Kubernetes命令行工具',
      'k9s - 终端K8s管理界面',
      'Lens - K8s可视化管理工具'
    ]
  },
  {
    id: 'r009',
    title: 'Python 官方文档',
    type: 'doc',
    provider: 'Python Official',
    difficulty: '基础',
    duration: 900,
    skillTags: ['Python基础', 'Python高级特性', 'Django', 'Flask', 'FastAPI'],
    description: 'Python 官方教程与参考，语法、标准库、库开发全面覆盖',
    rating: 4.8,
    students: 55000,
    externalUrl: 'https://docs.python.org/zh-cn/3/',
    url: 'https://docs.python.org/zh-cn/3/',
    practicePlan: [
      '使用装饰器、生成器、上下文管理器实现工具库',
      '搭建Flask RESTful API服务，实现JWT认证与数据库操作',
      '使用FastAPI实现异步高性能API，结合Pydantic校验请求数据'
    ],
    recommendedTools: [
      'PyCharm - 专业Python IDE',
      'pip - Python包管理工具',
      'virtualenv - Python虚拟环境工具'
    ]
  },
  {
    id: 'r010',
    title: 'PyTorch 官方教程',
    type: 'doc',
    provider: 'PyTorch Official',
    difficulty: '进阶',
    duration: 840,
    skillTags: ['PyTorch/TensorFlow', 'PyTorch', '深度学习(DNN/CNN/RNN)', '特征工程'],
    description: 'PyTorch 官方教程，张量、自动微分、模型训练、部署全流程',
    rating: 4.8,
    students: 15000,
    externalUrl: 'https://pytorch.apachecn.org/',
    url: 'https://pytorch.apachecn.org/',
    practicePlan: [
      '实现手写数字识别CNN模型，完成训练、验证、预测全流程',
      '使用预训练ResNet做迁移学习，微调目标检测模型',
      '构建Seq2Seq RNN实现简单机器翻译系统'
    ],
    recommendedTools: [
      'PyTorch Lightning - 轻量级训练框架',
      'TensorBoard - 训练过程可视化工具',
      'CUDA Toolkit - GPU加速计算工具包'
    ]
  },
  {
    id: 'r011',
    title: 'TensorFlow 官方教程',
    type: 'doc',
    provider: 'TensorFlow Official',
    difficulty: '进阶',
    duration: 840,
    skillTags: ['TensorFlow/PyTorch', '深度学习(DNN/CNN/RNN)', 'Keras', '计算机视觉'],
    description: 'TensorFlow 官方文档，Keras API、分布式训练、模型部署',
    rating: 4.7,
    students: 14000,
    externalUrl: 'https://www.tensorflow.org/?hl=zh-cn',
    url: 'https://www.tensorflow.org/?hl=zh-cn',
    practicePlan: [
      '使用Keras Sequential API实现图像分类模型',
      '使用TensorFlow Hub加载预训练模型进行迁移学习',
      '使用TensorFlow Serving部署模型为REST API服务'
    ],
    recommendedTools: [
      'Keras - 高层深度学习API',
      'TensorFlow Playground - 在线实验平台',
      'tf-agents - 强化学习库'
    ]
  },
  {
    id: 'r012',
    title: 'Hugging Face 课程',
    type: 'course',
    provider: 'Hugging Face',
    difficulty: '进阶',
    duration: 840,
    skillTags: ['大语言模型(LLM)', 'Transformer架构', 'Prompt Engineering', 'LangChain', 'Hugging Face'],
    description: 'Hugging Face 官方免费课程，Transformer、LLM 应用全栈',
    rating: 4.8,
    students: 12000,
    externalUrl: 'https://huggingface.co/course',
    url: 'https://huggingface.co/course',
    practicePlan: [
      '使用Hugging Face Transformers加载BERT做文本分类微调',
      '基于LangChain构建RAG问答系统，集成向量数据库',
      '设计Prompt模板与链，实现多轮对话智能助手'
    ],
    recommendedTools: [
      'Hugging Face Hub - 模型与数据集平台',
      'transformers库 - Transformer模型实现库',
      'Accelerate - 分布式训练加速工具'
    ]
  },
  {
    id: 'r013',
    title: 'freeCodeCamp 全栈课程',
    type: 'course',
    provider: 'freeCodeCamp',
    difficulty: '基础',
    duration: 1800,
    skillTags: ['HTML5/CSS3', 'JavaScript/ES6+', 'React', 'Node.js', 'MongoDB'],
    description: 'freeCodeCamp 免费全栈课程，响应式设计、JS、React、Node.js 全路线',
    rating: 4.9,
    students: 100000,
    externalUrl: 'https://www.freecodecamp.org/learn',
    url: 'https://www.freecodecamp.org/learn',
    practicePlan: [
      '实现响应式个人作品集页面，使用Flexbox与Grid布局',
      '搭建React + Node.js + MongoDB全栈应用，实现CRUD与用户认证',
      '部署全栈应用到Heroku/Vercel，完成CI/CD流程'
    ],
    recommendedTools: [
      'VS Code - 通用代码编辑器',
      'MongoDB Compass - MongoDB可视化工具',
      'Postman - API测试工具'
    ]
  },
  {
    id: 'r014',
    title: '极客时间 — 数据结构与算法之美',
    type: 'course',
    provider: '极客时间',
    difficulty: '进阶',
    duration: 720,
    skillTags: ['数据结构与算法', '动态规划', '复杂度分析', 'LeetCode刷题'],
    description: '王争《数据结构与算法之美》，100+ 实战案例，大厂面试必备',
    rating: 4.9,
    students: 65000,
    externalUrl: 'https://time.geekbang.org/column/intro/100019801',
    url: 'https://time.geekbang.org/column/intro/100019801',
    practicePlan: [
      '手推红黑树、跳表、B+树等核心数据结构的插入与删除',
      '使用动态规划解决背包问题、最长子序列等经典问题',
      '限时完成100道LeetCode高频题，整理解题模板'
    ],
    recommendedTools: [
      'LeetCode - 在线算法练习平台',
      'VisuAlgo - 算法可视化工具',
      'Typora - 算法笔记记录工具'
    ]
  },
  {
    id: 'r015',
    title: '掘金小册 — TypeScript 从入门到实战',
    type: 'course',
    provider: '掘金',
    difficulty: '进阶',
    duration: 480,
    skillTags: ['TypeScript', 'JavaScript/ES6+', 'React', 'Vue.js'],
    description: '掘金 TypeScript 小册，类型系统、工程实践、类型体操全解析',
    rating: 4.7,
    students: 12000,
    externalUrl: 'https://juejin.cn/book/7088476910842890654',
    url: 'https://juejin.cn/book/7088476910842890654',
    practicePlan: [
      '实现类型安全的EventEmitter与工具函数库',
      '编写类型体操：实现DeepReadonly、PickByType等高级类型',
      '在Vue3或React项目中配置严格TypeScript模式'
    ],
    recommendedTools: [
      'ts-pattern - 类型安全的模式匹配库',
      'zod - TypeScript优先的模式验证库',
      'utility-types - TypeScript实用类型集合'
    ]
  },
  {
    id: 'r016',
    title: 'MDN Web Docs — CSS',
    type: 'doc',
    provider: 'MDN',
    difficulty: '基础',
    duration: 360,
    skillTags: ['HTML5/CSS3', 'CSS3动画', '响应式布局', 'Flexbox/Grid'],
    description: 'MDN CSS 权威指南，选择器、布局、动画、响应式全面参考',
    rating: 4.8,
    students: 60000,
    externalUrl: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS',
    practicePlan: [
      '使用Flexbox和Grid实现电商首页响应式布局',
      '编写CSS3关键帧动画，实现轮播图与加载动效',
      '使用CSS变量与@supports实现主题切换方案'
    ],
    recommendedTools: [
      'Can I Use - CSS兼容性查询工具',
      'CSS Tricks - 现代CSS技巧博客',
      'Sass/SCSS - CSS预处理器'
    ]
  },
  {
    id: 'r017',
    title: 'Go 官方教程',
    type: 'doc',
    provider: 'Go Official',
    difficulty: '基础',
    duration: 600,
    skillTags: ['Go基础语法', 'Goroutine/Channel', '并发编程', 'Gin', 'gRPC'],
    description: 'Go 官方交互式教程，从语法到并发编程的完整学习路径',
    rating: 4.8,
    students: 18000,
    externalUrl: 'https://go.dev/dl/',
    url: 'https://go.dev/dl/',
    practicePlan: [
      '使用goroutine和channel实现并发爬虫',
      '实现简单的WebSocket聊天室，理解并发模型',
      '使用Gin框架开发RESTful API服务'
    ],
    recommendedTools: [
      'GoLand - 专业Go IDE',
      'Delve - Go调试工具',
      'gopls - Go语言服务器'
    ]
  },
  {
    id: 'r018',
    title: 'Gin Web Framework 官方文档',
    type: 'doc',
    provider: 'Gin Web Framework',
    difficulty: '基础',
    duration: 480,
    skillTags: ['Gin', 'Go基础语法', 'Goroutine/Channel', 'MySQL', 'Redis'],
    description: 'Gin 框架官方文档，路由、中间件、绑定、渲染全指南',
    rating: 4.7,
    students: 10000,
    externalUrl: 'https://gin-gonic.com/zh-cn/docs/',
    url: 'https://gin-gonic.com/zh-cn/docs/',
    practicePlan: [
      '搭建Gin + GORM + Redis的电商后台API服务',
      '实现JWT认证中间件与RBAC权限校验',
      '编写单元测试与集成测试，确保API接口质量'
    ],
    recommendedTools: [
      'GORM - Go ORM库',
      'go-redis - Go Redis客户端',
      'Swaggo - Go Swagger文档生成工具'
    ]
  },
  {
    id: 'r019',
    title: 'Node.js 官方文档',
    type: 'doc',
    provider: 'Node.js Official',
    difficulty: '基础',
    duration: 720,
    skillTags: ['Node.js基础', '事件循环', 'Express/Koa', 'NestJS', 'MongoDB'],
    description: 'Node.js 官方 API 文档与指南，事件循环、模块、HTTP、流',
    rating: 4.7,
    students: 45000,
    externalUrl: 'https://nodejs.cn/',
    url: 'https://nodejs.cn/',
    practicePlan: [
      '使用EventEmitter实现发布订阅系统',
      '实现基于Express/Koa的短链接生成服务',
      '理解异步IO与事件循环，处理高并发请求'
    ],
    recommendedTools: [
      'nvm - Node版本管理工具',
      'nodemon - 开发热重启工具',
      'PM2 - Node进程管理工具'
    ]
  },
  {
    id: 'r020',
    title: 'NestJS 官方文档',
    type: 'doc',
    provider: 'NestJS Official',
    difficulty: '进阶',
    duration: 480,
    skillTags: ['NestJS', 'Node.js基础', 'TypeScript', '微服务架构'],
    description: 'NestJS 企业级 Node 框架官方文档，模块化、依赖注入、微服务',
    rating: 4.7,
    students: 8000,
    externalUrl: 'https://docs.nestjs.cn/',
    url: 'https://docs.nestjs.cn/',
    practicePlan: [
      '使用NestJS + Prisma搭建企业级API服务',
      '实现微服务架构：API Gateway + Auth Service + User Service',
      '配置Docker Compose，完成服务容器化部署'
    ],
    recommendedTools: [
      'Nest CLI - NestJS脚手架工具',
      'Prisma - 下一代Node.js ORM',
      'Bull - Redis驱动的消息队列'
    ]
  },
  {
    id: 'r021',
    title: '计算机网络：自顶向下方法（在线版）',
    type: 'book',
    provider: '机械工业出版社',
    difficulty: '进阶',
    duration: 1400,
    skillTags: ['TCP/IP协议', '网络安全', '路由协议(OSPF/BGP)', '网络协议'],
    description: '经典教材在线资源，自顶向下理解网络协议栈',
    rating: 4.8,
    students: 22000,
    externalUrl: 'https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000006516',
    url: 'https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000006516',
    practicePlan: [
      '使用Wireshark抓取并分析TCP三次握手与四次挥手',
      '实现简易HTTP服务器，理解应用层协议',
      '使用ns-3或Mininet模拟网络拓扑，测试路由协议'
    ],
    recommendedTools: [
      'Wireshark - 网络抓包分析工具',
      'Mininet - 网络仿真平台',
      'tcpdump - 命令行抓包工具'
    ]
  },
  {
    id: 'r022',
    title: 'Linux Documentation Project',
    type: 'doc',
    provider: 'Linux Foundation',
    difficulty: '基础',
    duration: 720,
    skillTags: ['Linux', 'Shell/Bash', 'Linux网络配置', 'Linux系统管理'],
    description: 'Linux 官方文档项目，内核、系统管理、网络配置全参考',
    rating: 4.6,
    students: 20000,
    externalUrl: 'https://www.kernel.org/doc/html/latest/',
    url: 'https://www.kernel.org/doc/html/latest/',
    practicePlan: [
      '编写Shell脚本实现系统监控与日志清理自动化',
      '使用iptables/nftables配置防火墙规则',
      '搭建Nginx + Keepalived高可用负载均衡集群'
    ],
    recommendedTools: [
      'htop - 交互式进程查看器',
      'tmux - 终端复用器',
      'rsync - 文件同步工具'
    ]
  },
  {
    id: 'r023',
    title: 'Helm 官方文档',
    type: 'doc',
    provider: 'Helm Official',
    difficulty: '进阶',
    duration: 360,
    skillTags: ['Helm', 'Kubernetes架构', 'Pod/Service/Deployment', 'K8s包管理'],
    description: 'Helm K8s 包管理器官方文档，Chart、Release、Template',
    rating: 4.6,
    students: 6000,
    externalUrl: 'https://helm.sh/zh/docs/',
    url: 'https://helm.sh/zh/docs/',
    practicePlan: [
      '创建自定义Helm Chart模板，支持多环境配置',
      '使用Helm部署Prometheus + Grafana监控体系',
      '编写Helm Hook实现部署前后置任务'
    ],
    recommendedTools: [
      'helm - K8s包管理CLI',
      'helm-diff - Chart差异对比插件',
      'ChartMuseum - Helm仓库管理'
    ]
  },
  {
    id: 'r024',
    title: 'Android Developer 官方文档',
    type: 'doc',
    provider: 'Google Android',
    difficulty: '进阶',
    duration: 960,
    skillTags: ['Java/Kotlin', 'Android SDK', 'Jetpack', 'Jetpack Compose', 'MVVM/MVI架构'],
    description: 'Google 官方 Android 开发者文档，Jetpack、Compose、架构全指南',
    rating: 4.8,
    students: 25000,
    externalUrl: 'https://developer.android.com/?hl=zh-cn',
    url: 'https://developer.android.com/?hl=zh-cn',
    practicePlan: [
      '使用Jetpack Compose实现首页信息流UI',
      '搭建MVVM架构，集成ViewModel + LiveData + Room',
      '实现WorkManager后台任务与DataStore持久化'
    ],
    recommendedTools: [
      'Android Studio - 官方IDE',
      'Gradle - 构建系统',
      'LeakCanary - 内存泄漏检测工具'
    ]
  },
  {
    id: 'r025',
    title: 'Apple Developer Documentation',
    type: 'doc',
    provider: 'Apple Developer',
    difficulty: '进阶',
    duration: 840,
    skillTags: ['Swift/Objective-C', 'UIKit/SwiftUI', 'Swift Concurrency', 'iOS生命周期'],
    description: 'Apple 官方开发者文档，SwiftUI、Swift Concurrency、App 生命周期',
    rating: 4.7,
    students: 12000,
    externalUrl: 'https://developer.apple.com/documentation',
    url: 'https://developer.apple.com/documentation',
    practicePlan: [
      '使用SwiftUI实现多页面导航与数据绑定',
      '使用async/await重构异步网络请求代码',
      '集成Core Data与CloudKit实现数据持久化与同步'
    ],
    recommendedTools: [
      'Xcode - 官方IDE',
      'Swift Package Manager - 依赖管理',
      'Instruments - 性能分析工具'
    ]
  },
  {
    id: 'r026',
    title: 'Flutter 官方文档',
    type: 'doc',
    provider: 'Flutter Official',
    difficulty: '基础',
    duration: 720,
    skillTags: ['Dart', 'Flutter Widget', '状态管理(Riverpod/Bloc)', '跨平台开发'],
    description: 'Flutter 官方文档，Widget、布局、导航、状态管理',
    rating: 4.7,
    students: 20000,
    externalUrl: 'https://flutter.cn/',
    url: 'https://flutter.cn/',
    practicePlan: [
      '搭建电商App，实现商品列表与详情页',
      '使用Riverpod或Bloc实现购物车状态管理',
      '使用Platform Channel实现原生通信'
    ],
    recommendedTools: [
      'Android Studio / VS Code - Flutter开发IDE',
      'flutter_riverpod - 现代状态管理库',
      'Dart DevTools - Dart调试工具'
    ]
  },
  {
    id: 'r027',
    title: 'Verilog HDL 官方参考手册',
    type: 'doc',
    provider: 'IEEE',
    difficulty: '进阶',
    duration: 960,
    skillTags: ['Verilog/VHDL', 'SystemVerilog', 'RTL设计', '逻辑综合'],
    description: 'IEEE Verilog HDL 标准官方参考，语法、语义、建模全指南',
    rating: 4.6,
    students: 3000,
    externalUrl: 'https://standards.ieee.org/ie/1800-2017/10611/',
    url: 'https://standards.ieee.org/ie/1800-2017/10611/',
    practicePlan: [
      '使用Verilog实现8位CPU数据通路RTL',
      '编写Testbench完成功能仿真与时序验证',
      '使用Synopsys DC完成逻辑综合与时序约束'
    ],
    recommendedTools: [
      'ModelSim/Questa - HDL仿真器',
      'Vivado - Xilinx FPGA开发套件',
      'Synopsys Design Compiler - 综合工具'
    ]
  },
  {
    id: 'r028',
    title: 'UVM 1.2 官方用户手册',
    type: 'doc',
    provider: 'Accellera',
    difficulty: '进阶',
    duration: 900,
    skillTags: ['UVM', 'SystemVerilog', '覆盖率驱动验证', '断言验证(SVA)'],
    description: 'UVM 1.2 官方用户手册，验证方法学、环境搭建、用例编写',
    rating: 4.5,
    students: 2500,
    externalUrl: 'https://www.accellera.org/downloads/standards/uvm',
    url: 'https://www.accellera.org/downloads/standards/uvm',
    practicePlan: [
      '搭建UVM验证环境，实现AHB协议验证',
      '编写功能覆盖率收集代码与断言检查',
      '执行回归测试并生成覆盖率报告'
    ],
    recommendedTools: [
      'UVM库 - 通用验证方法学',
      'Questa Verification Kit - 验证IP库',
      'SystemVerilog Assertions - 断言验证工具'
    ]
  },
  {
    id: 'r029',
    title: '嵌入式 Linux 官方文档',
    type: 'doc',
    provider: 'Linux Foundation',
    difficulty: '进阶',
    duration: 1200,
    skillTags: ['C/C++', '嵌入式Linux', 'ARM架构', 'Linux驱动开发', 'Bootloader(U-Boot)'],
    description: 'Linux 内核文档 — Driver 子系统，Platform Driver、Device Tree',
    rating: 4.7,
    students: 5500,
    externalUrl: 'https://www.kernel.org/doc/html/latest/driver-api/index.html',
    url: 'https://www.kernel.org/doc/html/latest/driver-api/index.html',
    practicePlan: [
      '使用U-Boot完成ARM开发板启动流程',
      '编写Linux字符设备驱动，实现按键中断与LED控制',
      '移植Device Tree，实现外设设备树配置'
    ],
    recommendedTools: [
      'Buildroot/Buildroot - 嵌入式Linux构建系统',
      'JLink/OpenOCD - 调试器',
      'Linux Kernel Archives - 内核源码'
    ]
  },
  {
    id: 'r030',
    title: 'ROS 2 官方文档',
    type: 'doc',
    provider: 'Open Robotics',
    difficulty: '进阶',
    duration: 780,
    skillTags: ['ROS/ROS2', 'C++/Python', '运动控制', 'SLAM', '路径规划'],
    description: 'ROS 2 机器人操作系统官方文档，节点、通信、导航全栈',
    rating: 4.7,
    students: 4200,
    externalUrl: 'https://docs.ros.org/en/humble/',
    url: 'https://docs.ros.org/en/humble/',
    practicePlan: [
      '创建ROS 2节点实现激光雷达数据订阅与可视化',
      '使用Nav2完成自主导航配置与路径规划',
      '在Gazebo中完成机器人仿真与SLAM建图'
    ],
    recommendedTools: [
      'RViz2 - 机器人可视化工具',
      'Gazebo - 物理仿真器',
      'MoveIt2 - 运动规划框架'
    ]
  },
  {
    id: 'r031',
    title: '极客时间 — 分布式协议与算法实战',
    type: 'course',
    provider: '极客时间',
    difficulty: '进阶',
    duration: 720,
    skillTags: ['分布式架构', 'CAP理论', '共识算法', '一致性协议', '分布式系统设计'],
    description: '分布式协议与算法实战，Paxos/Raft/Gossip 核心算法详解',
    rating: 4.8,
    students: 15000,
    externalUrl: 'https://time.geekbang.org/column/intro/100046101',
    url: 'https://time.geekbang.org/column/intro/100046101',
    practicePlan: [
      '手写实现简化版Raft共识算法',
      '设计分布式KV存储，实现数据一致性协议',
      '分析CAP定理，选择合适的一致性模型'
    ],
    recommendedTools: [
      'Jepsen - 分布式系统测试框架',
      'Chaos Mesh - 混沌工程平台',
      'etcd - 分布式键值存储'
    ]
  },
  {
    id: 'r032',
    title: 'Apache Dubbo 官方文档',
    type: 'doc',
    provider: 'Apache Software Foundation',
    difficulty: '进阶',
    duration: 480,
    skillTags: ['Dubbo', '微服务', 'RPC框架', 'Spring Cloud'],
    description: 'Apache Dubbo 官方文档，服务治理、注册中心、负载均衡',
    rating: 4.6,
    students: 18000,
    externalUrl: 'https://dubbo.apache.org/zh-cn/',
    url: 'https://dubbo.apache.org/zh-cn/',
    practicePlan: [
      '搭建Dubbo + Nacos微服务架构，实现服务注册与发现',
      '配置Sentinel实现服务熔断限流',
      '使用Dubbo Triple协议完成RPC调用优化'
    ],
    recommendedTools: [
      'Nacos - 服务注册与配置中心',
      'Sentinel - 流量控制与熔断降级',
      'Dubbo Admin - 服务治理控制台'
    ]
  },
  {
    id: 'r033',
    title: '极客时间 — 高并发系统设计',
    type: 'course',
    provider: '极客时间',
    difficulty: '进阶',
    duration: 600,
    skillTags: ['高并发', 'Redis', 'Kafka', 'MySQL', '分库分表'],
    description: '高并发系统设计 40 讲，秒杀、限流、削峰、缓存全链路',
    rating: 4.7,
    students: 20000,
    externalUrl: 'https://time.geekbang.org/column/intro/100026301',
    url: 'https://time.geekbang.org/column/intro/100026301',
    practicePlan: [
      '实现秒杀系统：Redis扣库存 + Kafka异步下单',
      '设计分库分表方案，使用ShardingSphere实现路由',
      '搭建监控看板，分析系统吞吐量与延迟'
    ],
    recommendedTools: [
      'Kafka - 消息队列中间件',
      'ShardingSphere - 分库分表中间件',
      'SkyWalking - 全链路追踪工具'
    ]
  },
  {
    id: 'r034',
    title: 'Coursera — 数据分析专项',
    type: 'course',
    provider: 'Coursera',
    difficulty: '基础',
    duration: 900,
    skillTags: ['SQL', 'Python(Pandas)', '统计学', '数据可视化', 'Excel'],
    description: 'Google 数据分析专项证书，SQL、Python、Tableau、R 全覆盖',
    rating: 4.8,
    students: 35000,
    externalUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    practicePlan: [
      '使用SQL完成多表关联查询与窗口函数分析',
      '使用Pandas清洗电商数据，生成销售趋势报表',
      '使用Tableau或Matplotlib制作交互式仪表盘'
    ],
    recommendedTools: [
      'Jupyter Notebook - 数据分析开发环境',
      'Tableau Public - 数据可视化工具',
      'DBeaver - 数据库客户端'
    ]
  },
  {
    id: 'r035',
    title: 'freeCodeCamp 响应式网页设计',
    type: 'course',
    provider: 'freeCodeCamp',
    difficulty: '基础',
    duration: 480,
    skillTags: ['HTML5/CSS3', '响应式布局', 'Flexbox/Grid', 'Web设计'],
    description: 'freeCodeCamp 响应式网页设计认证，HTML/CSS/布局实战',
    rating: 4.7,
    students: 85000,
    externalUrl: 'https://www.freecodecamp.org/learn/responsive-web-design',
    url: 'https://www.freecodecamp.org/learn/responsive-web-design',
    practicePlan: [
      '实现个人简历页面，使用媒体查询适配多设备',
      '使用CSS Grid实现图片瀑布流布局',
      '使用Tailwind CSS重写已有项目样式'
    ],
    recommendedTools: [
      'Tailwind CSS - 原子化CSS框架',
      'Chrome DevTools - 设备模拟与调试',
      'Figma - UI设计工具'
    ]
  },
  {
    id: 'r036',
    title: 'Hugging Face — NLP 课程',
    type: 'course',
    provider: 'Hugging Face',
    difficulty: '进阶',
    duration: 600,
    skillTags: ['文本预处理', '词向量/BERT', 'Transformer', 'LLM应用', 'NLP核心'],
    description: 'Hugging Face NLP 专项课程，Transformers、Tokenizers、Datasets',
    rating: 4.8,
    students: 8000,
    externalUrl: 'https://huggingface.co/course/chapter1',
    url: 'https://huggingface.co/course/chapter1',
    practicePlan: [
      '使用BERT做情感分析微调，对比准确率与F1分数',
      '使用Tokenizer处理中文文本，实现分词与编码',
      '构建文本摘要系统，基于BERT Encoder-Decoder架构'
    ],
    recommendedTools: [
      'spaCy - NLP处理库',
      'jieba - 中文分词工具',
      'Weights & Biases - 实验追踪工具'
    ]
  },
  {
    id: 'r037',
    title: 'YOLO 官方项目文档',
    type: 'doc',
    provider: 'Ultralytics',
    difficulty: '进阶',
    duration: 480,
    skillTags: ['目标检测/分割', 'YOLO/Faster R-CNN', 'PyTorch', 'OpenCV', '计算机视觉'],
    description: 'Ultralytics YOLO 官方文档，模型训练、部署、API 全参考',
    rating: 4.7,
    students: 15000,
    externalUrl: 'https://docs.ultralytics.com/',
    url: 'https://docs.ultralytics.com/',
    practicePlan: [
      '自定义数据集训练YOLOv8目标检测模型',
      '实现图像/视频实时检测与标注可视化',
      '将模型导出为ONNX/TensorRT，加速推理部署'
    ],
    recommendedTools: [
      'OpenCV - 计算机视觉库',
      'LabelImg - 图像标注工具',
      'TensorRT - NVIDIA推理优化工具'
    ]
  },
  {
    id: 'r038',
    title: 'Apache Mahout 推荐系统',
    type: 'doc',
    provider: 'Apache Software Foundation',
    difficulty: '进阶',
    duration: 600,
    skillTags: ['协同过滤', '推荐算法', '机器学习', 'Spark'],
    description: 'Apache Mahout 推荐系统文档，协同过滤、矩阵分解、评估',
    rating: 4.5,
    students: 3500,
    externalUrl: 'https://mahout.apache.org/',
    url: 'https://mahout.apache.org/',
    practicePlan: [
      '实现基于用户的协同过滤推荐算法',
      '使用矩阵分解(ALS)实现隐因子推荐模型',
      '设计推荐系统A/B测试方案，评估CTR与转化率'
    ],
    recommendedTools: [
      'Surprise - Python推荐算法库',
      'Spark MLlib - 分布式机器学习库',
      'LensKit - Java推荐研究工具'
    ]
  },
  {
    id: 'r039',
    title: 'OWASP Top 10 官方文档',
    type: 'doc',
    provider: 'OWASP',
    difficulty: '基础',
    duration: 360,
    skillTags: ['Web安全', '密码学基础', 'SQL注入/XSS', '网络安全'],
    description: 'OWASP Top 10: 2021 十大安全风险官方详解',
    rating: 4.8,
    students: 18000,
    externalUrl: 'https://owasp.org/Top10/zh/',
    url: 'https://owasp.org/Top10/zh/',
    practicePlan: [
      '在DVWA靶场中练习SQL注入与XSS攻击',
      '实现JWT安全的认证与授权方案',
      '使用HTTPS + CSP + CSRF防护加固Web应用'
    ],
    recommendedTools: [
      'Burp Suite - Web渗透测试工具',
      'SQLMap - SQL注入自动化工具',
      'DVWA - 故意存在漏洞的Web应用'
    ]
  },
  {
    id: 'r040',
    title: 'PortSwigger Web 安全学院',
    type: 'course',
    provider: 'PortSwigger',
    difficulty: '进阶',
    duration: 960,
    skillTags: ['Web渗透', 'SQL注入/XSS', 'API安全', 'Burp Suite'],
    description: 'PortSwigger 官方 Web 安全学院，CTF 级实战靶场',
    rating: 4.9,
    students: 12000,
    externalUrl: 'https://portswigger.net/web-security',
    url: 'https://portswigger.net/web-security',
    practicePlan: [
      '完成SQL注入专题所有实验室挑战',
      '利用XSS窃取Cookie与执行恶意脚本',
      '针对REST/GraphQL API进行安全测试'
    ],
    recommendedTools: [
      'Burp Suite Professional - Web安全测试套件',
      'nuclei - 漏洞扫描器',
      'sqlmap - 自动化SQL注入工具'
    ]
  },
  {
    id: 'r041',
    title: 'Oracle — Java Platform, Standard Edition',
    type: 'doc',
    provider: 'Oracle',
    difficulty: '进阶',
    duration: 780,
    skillTags: ['JVM原理', '多线程与并发', 'Java基础与集合', 'IO与NIO'],
    description: 'Oracle JDK 21 官方文档，JVM、核心库、并发包全参考',
    rating: 4.7,
    students: 40000,
    externalUrl: 'https://docs.oracle.com/en/java/javase/21/',
    url: 'https://docs.oracle.com/en/java/javase/21/',
    practicePlan: [
      '使用JFR与JVisualVM分析JVM内存与GC行为',
      '实现线程池与自定义锁，理解AQS与CAS原理',
      '使用NIO实现高性能网络服务器'
    ],
    recommendedTools: [
      'JProfiler - Java性能分析器',
      'Arthas - Alibaba开源Java诊断工具',
      'IntelliJ IDEA - 专业Java IDE'
    ]
  },
  {
    id: 'r042',
    title: 'Django 官方文档',
    type: 'doc',
    provider: 'Django Official',
    difficulty: '基础',
    duration: 600,
    skillTags: ['Python基础', 'Python高级特性', 'Django', 'SQLAlchemy', 'MySQL/PostgreSQL'],
    description: 'Django 官方文档，Model、View、Template、Admin、REST',
    rating: 4.7,
    students: 22000,
    externalUrl: 'https://docs.djangoproject.com/zh-cn/5.0/',
    url: 'https://docs.djangoproject.com/zh-cn/5.0/',
    practicePlan: [
      '搭建Django + DRF RESTful API服务',
      '实现用户认证、权限校验与限流',
      '使用Celery + Redis实现异步任务队列'
    ],
    recommendedTools: [
      'Django REST Framework - RESTful API框架',
      'Celery - 分布式任务队列',
      'django-debug-toolbar - 调试工具栏'
    ]
  },
  {
    id: 'r043',
    title: 'Apache ECharts 官方文档',
    type: 'doc',
    provider: 'Apache Software Foundation',
    difficulty: '基础',
    duration: 360,
    skillTags: ['Vue.js', 'React', 'JavaScript/ES6+', 'HTML5/CSS3', '数据可视化'],
    description: 'Apache ECharts 官方文档，图表类型、主题定制、API 全参考',
    rating: 4.6,
    students: 98000,
    externalUrl: 'https://echarts.apache.org/zh/index.html',
    url: 'https://echarts.apache.org/zh/index.html',
    practicePlan: [
      '实现仪表盘与折线图动态数据更新',
      '使用ECharts GL实现3D可视化效果',
      '封装通用图表组件，支持主题切换与响应式'
    ],
    recommendedTools: [
      'ECharts - 百度开源可视化库',
      'echarts-for-react - React封装版本',
      'Chart.js - 轻量级替代方案'
    ]
  },
  {
    id: 'r044',
    title: 'LeetCode — 热题 100',
    type: 'course',
    provider: 'LeetCode',
    difficulty: '进阶',
    duration: 1200,
    skillTags: ['数据结构与算法', '动态规划', '复杂度分析', 'LeetCode刷题'],
    description: 'LeetCode 热题 100 精选，大厂面试高频题分类解析',
    rating: 4.9,
    students: 500000,
    externalUrl: 'https://leetcode.cn/problem-list/2cktkvj/',
    url: 'https://leetcode.cn/problem-list/2cktkvj/',
    practicePlan: [
      '按专题刷完数组、链表、树、图等数据结构题',
      '整理动态规划解题框架，至少完成30道DP题目',
      '每周模拟面试，限时完成Hard难度题目'
    ],
    recommendedTools: [
      'LeetCode - 在线刷题平台',
      'AlgoExpert - 算法面试准备平台',
      'LeetCode Extension - VS Code插件'
    ]
  },
  {
    id: 'r045',
    title: 'Jenkins 官方文档',
    type: 'doc',
    provider: 'Jenkins Official',
    difficulty: '进阶',
    duration: 540,
    skillTags: ['Jenkins/GitLab CI', 'Docker', 'Kubernetes', 'CI/CD流水线'],
    description: 'Jenkins 官方文档，Pipeline、Agent、共享库、插件开发',
    rating: 4.6,
    students: 15000,
    externalUrl: 'https://www.jenkins.io/zh/doc/',
    url: 'https://www.jenkins.io/zh/doc/',
    practicePlan: [
      '声明式Pipeline实现代码拉取→编译→测试→部署全流程',
      '搭建Jenkins + Docker + K8s的弹性构建集群',
      '编写共享库，实现多项目复用的构建模板'
    ],
    recommendedTools: [
      'Jenkins - CI/CD自动化服务器',
      'GitHub Actions - 云端CI/CD',
      'SonarQube - 代码质量检测'
    ]
  },
  {
    id: 'r046',
    title: 'Apache Airflow 官方文档',
    type: 'doc',
    provider: 'Apache Software Foundation',
    difficulty: '基础',
    duration: 360,
    skillTags: ['Airflow/DolphinScheduler', 'ETL开发', '数据仓库设计', '数据治理'],
    description: 'Apache Airflow 官方文档，DAG、Operator、Scheduler、Sensor',
    rating: 4.6,
    students: 9000,
    externalUrl: 'https://airflow.apache.org/zh/docs/stable/',
    url: 'https://airflow.apache.org/zh/docs/stable/',
    practicePlan: [
      '编写DAG实现每日数据ETL管道',
      '使用Sensor监控外部系统数据到达',
      '配置多环境调度，实现数据血缘追踪'
    ],
    recommendedTools: [
      'Apache Airflow - 工作流编排工具',
      'Apache DolphinScheduler - 国产调度平台',
      'Apache Spark - 大数据计算引擎'
    ]
  },
  {
    id: 'r047',
    title: 'Google SRE — Site Reliability Engineering',
    type: 'book',
    provider: "O'Reilly Media",
    difficulty: '进阶',
    duration: 1000,
    skillTags: ['Site Reliability', 'SLA/SLO/SLI', '故障排查', '容量规划', '监控系统'],
    description: 'Google SRE 电子书（免费章节），可靠性工程方法论',
    rating: 4.8,
    students: 8000,
    externalUrl: 'https://sre.google/resources/practices-and-processes/engineering-programs/site-reliability-engineering/',
    url: 'https://sre.google/resources/practices-and-processes/engineering-programs/site-reliability-engineering/',
    practicePlan: [
      '为核心服务定义SLO与错误预算',
      '搭建Prometheus + Grafana监控告警体系',
      '进行故障演练，编写Runbook与事后复盘'
    ],
    recommendedTools: [
      'Prometheus - 监控系统',
      'Grafana - 数据可视化与仪表盘',
      'PagerDuty - 事件响应平台'
    ]
  },
  {
    id: 'r048',
    title: 'Ethereum 开发者文档',
    type: 'doc',
    provider: 'Ethereum Foundation',
    difficulty: '进阶',
    duration: 840,
    skillTags: ['智能合约', 'Solidity', '共识算法', '密码学', 'Ethereum/Hyperledger'],
    description: 'Ethereum 官方开发者文档，Solidity、DApp、Web3、Layer2',
    rating: 4.7,
    students: 6500,
    externalUrl: 'https://ethereum.org/zh/developers/',
    url: 'https://ethereum.org/zh/developers/',
    practicePlan: [
      '使用Solidity编写ERC-20代币智能合约',
      '使用Hardhat部署合约到测试网并进行测试',
      '构建DApp前端，集成Web3钱包交互'
    ],
    recommendedTools: [
      'Remix - 在线IDE',
      'Hardhat - 智能合约开发框架',
      'MetaMask - 以太坊钱包'
    ]
  },
  {
    id: 'r049',
    title: 'Unity 开发者手册',
    type: 'doc',
    provider: 'Unity Technologies',
    difficulty: '基础',
    duration: 960,
    skillTags: ['游戏引擎(Unity/Unreal)', 'C++/C#', '游戏物理', '游戏AI'],
    description: 'Unity 官方手册，Editor、Scripting、Physics、Animation',
    rating: 4.7,
    students: 30000,
    externalUrl: 'https://docs.unity3d.com/cn/2022.2/',
    url: 'https://docs.unity3d.com/cn/2022.2/',
    practicePlan: [
      '实现3D第三人称角色控制与导航系统',
      '使用NavMesh实现动态避障AI',
      '集成Photon Unity Networking实现多人联机'
    ],
    recommendedTools: [
      'Unity Hub - 版本管理与项目管理',
      'Visual Studio / Rider - C# IDE',
      'Asset Store - 资源商店'
    ]
  },
  {
    id: 'r050',
    title: 'Vite 官方文档',
    type: 'doc',
    provider: 'Vite Team',
    difficulty: '基础',
    duration: 240,
    skillTags: ['Webpack/Vite', 'Vite/Rollup', 'ESLint/Prettier', 'TypeScript', '前端工程化'],
    description: 'Vite 官方文档，快速启动、配置、插件、SSR 全指南',
    rating: 4.8,
    students: 45000,
    externalUrl: 'https://cn.vitejs.dev/',
    url: 'https://cn.vitejs.dev/',
    practicePlan: [
      '配置Vite + Vue3/React项目，实现HMR快速开发',
      '编写Vite插件实现代码自动注入与构建优化',
      '配置ESLint + Prettier + Husky，建立代码规范流程'
    ],
    recommendedTools: [
      'Vite - 新一代前端构建工具',
      'Rollup - 模块打包器',
      'unplugin - 通用插件API'
    ]
  },
  {
    id: 'r051',
    title: 'freeCodeCamp Vue.js 完整课程',
    type: 'course',
    provider: 'freeCodeCamp',
    difficulty: '基础',
    duration: 600,
    skillTags: ['Vue3 Composition API', 'Pinia', 'Vue Router', 'TypeScript', 'Vite'],
    description: 'freeCodeCamp免费Vue.js课程，涵盖Composition API、组件通信、路由、状态管理',
    rating: 4.8,
    students: 35000,
    externalUrl: 'https://www.freecodecamp.org/learn',
    url: 'https://www.freecodecamp.org/learn',
    practicePlan: [
      '跟随课程搭建Vue3项目，完成10个组件练习',
      '实现产品列表页：组件拆分 + props/emits通信',
      '添加Pinia状态管理和Vue Router导航'
    ],
    recommendedTools: [
      'Vue DevTools - 浏览器调试插件',
      'Element Plus - Vue3组件库',
      'Volar - VS Code Vue3语法支持'
    ]
  },
  {
    id: 'r052',
    title: 'React.dev — Hooks 深入指南',
    type: 'doc',
    provider: 'React Official',
    difficulty: '进阶',
    duration: 480,
    skillTags: ['React Hooks', '自定义Hook', 'Context/Redux', '性能优化', 'TypeScript'],
    description: 'React官方文档Hooks专题，useState/useEffect/useMemo/useCallback完整参考',
    rating: 4.9,
    students: 88000,
    externalUrl: 'https://react.dev/learn',
    url: 'https://react.dev/learn',
    practicePlan: [
      '阅读官方Hooks指南，完成useState/useEffect练习',
      '自定义3个Hook：useLocalStorage、useFetch、useDebounce',
      '使用useReducer + Context实现简化版全局状态管理'
    ],
    recommendedTools: [
      'React Developer Tools - 组件树与性能分析',
      'Zustand - 轻量级状态管理',
      'Vite - 快速构建工具'
    ]
  },
  {
    id: 'r053',
    title: 'TypeScript Handbook（官方手册）',
    type: 'doc',
    provider: 'TypeScript Official',
    difficulty: '进阶',
    duration: 540,
    skillTags: ['TypeScript', '类型系统', '泛型编程', '装饰器', '工程化配置'],
    description: 'TypeScript官方手册最新版，类型系统、泛型、工具类型完整参考',
    rating: 4.8,
    students: 42000,
    externalUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    practicePlan: [
      '完成TypeScript Handbook前6章练习',
      '编写工具类型：Partial、Required、Pick、Omit、DeepPartial',
      '在现有JS项目中渐进式引入TypeScript，消除any使用'
    ],
    recommendedTools: [
      'TypeScript Playground - 在线实验平台',
      'ts-pattern - 类型安全模式匹配',
      'ESLint - TypeScript规则检查'
    ]
  },
  {
    id: 'r054',
    title: 'Vue3 企业级中后台最佳实践',
    type: 'doc',
    provider: 'Vue.js Official',
    difficulty: '进阶',
    duration: 720,
    skillTags: ['Vue3 Composition API', 'TypeScript', 'Pinia', 'Vue Router', 'Element Plus', '权限管理'],
    description: '基于Vue3+TS的企业级中后台开发指南，含RBAC权限、动态路由、主题方案',
    rating: 4.7,
    students: 15000,
    externalUrl: 'https://cn.vuejs.org/guide/reusability/composables.html',
    url: 'https://cn.vuejs.org/guide/reusability/composables.html',
    practicePlan: [
      '搭建Vue3+TS+Vite项目骨架，配置ESLint和Prettier',
      '实现登录→权限校验→动态路由→菜单渲染完整流程',
      '封装通用表格组件和权限指令v-permission'
    ],
    recommendedTools: [
      'Element Plus - Vue3组件库',
      'Pinia - 状态管理',
      'VueUse - Composition API工具库'
    ]
  },
  {
    id: 'r055',
    title: 'Next.js 14 官方教程',
    type: 'doc',
    provider: 'Vercel / Next.js',
    difficulty: '进阶',
    duration: 900,
    skillTags: ['React', 'Next.js', 'Tailwind CSS', 'Prisma', 'Server Components'],
    description: 'Next.js 14 App Router官方教程，Server Components、Layouts、API Routes全栈',
    rating: 4.8,
    students: 28000,
    externalUrl: 'https://nextjs.org/docs',
    url: 'https://nextjs.org/docs',
    practicePlan: [
      '使用Next.js 14 App Router搭建项目，理解路由与布局',
      '实现商品列表→详情→购物车→支付全流程',
      '使用Prisma + PostgreSQL搭建后端API，部署到Vercel'
    ],
    recommendedTools: [
      'Next.js - React全栈框架',
      'Tailwind CSS - 原子化样式',
      'Vercel - 一站式部署平台'
    ]
  },
  {
    id: 'r056',
    title: 'WebSocket 实时通信教程（MDN）',
    type: 'doc',
    provider: 'MDN',
    difficulty: '进阶',
    duration: 480,
    skillTags: ['Vue3', 'Socket.IO', 'Node.js', '实时通信', 'WebSocket', 'Redis'],
    description: 'MDN WebSocket API + Socket.IO 实时通信完整教程，含服务端和客户端实现',
    rating: 4.6,
    students: 18000,
    externalUrl: 'https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket',
    practicePlan: [
      '搭建Node.js + Express + Socket.IO服务端',
      '使用Vue3实现聊天客户端，支持多房间切换',
      '集成Redis做消息缓存与在线状态存储'
    ],
    recommendedTools: [
      'Socket.IO - WebSocket框架',
      'Redis - 消息缓存与Pub/Sub',
      'Postman - API测试'
    ]
  },
  {
    id: 'r057',
    title: '黑马程序员 Vue3 从入门到实战',
    type: 'video',
    provider: '黑马程序员 / B站',
    difficulty: '基础',
    duration: 1440,
    skillTags: ['Vue3 Composition API', 'Pinia', 'Vue Router', 'Element Plus', 'Vite'],
    description: '黑马程序员Vue3完整课程，含基础语法、组件通信、状态管理、路由、项目实战',
    rating: 4.9,
    students: 850000,
    externalUrl: 'https://www.bilibili.com/video/BV1Ac411K7EQ/',
    url: 'https://www.bilibili.com/video/BV1Ac411K7EQ/',
    practicePlan: [
      '跟随视频完成Vue3基础语法学习，至少完成20个代码练习',
      '实现TodoList应用：含Pinia状态管理和本地持久化',
      '完成课程最终项目：Vue3企业级中后台系统'
    ],
    recommendedTools: [
      'Vue DevTools - 浏览器调试插件',
      'Element Plus - Vue3组件库',
      'Volar - VS Code Vue3语法支持'
    ]
  },
  {
    id: 'r058',
    title: '尚硅谷 React18 全套教程',
    type: 'video',
    provider: '尚硅谷 / B站',
    difficulty: '基础',
    duration: 1200,
    skillTags: ['React Hooks', 'React组件化', 'Context/Redux', 'React Router', 'TypeScript'],
    description: '尚硅谷React18完整教程，JSX、Hooks、Router、Redux Toolkit全栈覆盖',
    rating: 4.8,
    students: 620000,
    externalUrl: 'https://www.bilibili.com/video/BV1YV411n74n/',
    url: 'https://www.bilibili.com/video/BV1YV411n74n/',
    practicePlan: [
      '完成React基础语法学习，掌握JSX、Props、State',
      '使用useState/useEffect/useReducer实现自定义Hooks',
      '完成综合项目：React电商管理后台系统'
    ],
    recommendedTools: [
      'React Developer Tools - 组件树与性能分析',
      'Redux Toolkit - 官方推荐状态管理',
      'Vite - 快速构建工具'
    ]
  },
  {
    id: 'r059',
    title: 'TypeScript 零基础到实战',
    type: 'video',
    provider: 'B站 / 程序员鱼皮',
    difficulty: '进阶',
    duration: 960,
    skillTags: ['TypeScript', '类型系统', '泛型编程', '装饰器', '工程化配置'],
    description: 'TypeScript完整教程，类型系统、泛型、工具类型、装饰器深入讲解',
    rating: 4.7,
    students: 320000,
    externalUrl: 'https://www.bilibili.com/video/BV1a44y1H7D2/',
    url: 'https://www.bilibili.com/video/BV1a44y1H7D2/',
    practicePlan: [
      '完成TypeScript基础类型学习，掌握接口、泛型、枚举',
      '编写高级类型工具：Partial、Required、DeepPartial、Merge',
      '在Vue3项目中启用严格模式，消除any使用'
    ],
    recommendedTools: [
      'TypeScript Playground - 在线实验平台',
      'ts-pattern - 类型安全模式匹配',
      'ESLint - TypeScript规则检查'
    ]
  },
  {
    id: 'r060',
    title: 'Node.js 教程（完整版）',
    type: 'video',
    provider: 'B站 / 黑马程序员',
    difficulty: '基础',
    duration: 1080,
    skillTags: ['Node.js基础', '事件循环', 'Express/Koa', 'NestJS', 'MongoDB'],
    description: 'Node.js完整教程，模块系统、事件循环、Express、Koa、MongoDB全栈',
    rating: 4.7,
    students: 450000,
    externalUrl: 'https://www.bilibili.com/video/BV1A44y1v73k/',
    url: 'https://www.bilibili.com/video/BV1A44y1v73k/',
    practicePlan: [
      '掌握Node.js模块系统、FS模块、Path模块',
      '使用Express搭建RESTful API服务，实现CRUD接口',
      '集成MongoDB + Mongoose实现数据持久化'
    ],
    recommendedTools: [
      'Postman - API测试工具',
      'MongoDB Compass - 数据库管理',
      'PM2 - Node进程管理'
    ]
  },
  {
    id: 'r061',
    title: 'JavaScript 进阶高手之路',
    type: 'video',
    provider: 'B站 / 李永乐',
    difficulty: '进阶',
    duration: 1200,
    skillTags: ['JavaScript/ES6+', 'DOM操作', '浏览器兼容性', '异步编程', '设计模式'],
    description: 'JavaScript进阶教程，原型链、闭包、Promise、EventLoop、设计模式深入',
    rating: 4.8,
    students: 780000,
    externalUrl: 'https://www.bilibili.com/video/BV1Kv411x7A3/',
    url: 'https://www.bilibili.com/video/BV1Kv411x7A3/',
    practicePlan: [
      '深入理解原型链、闭包、this绑定原理',
      '手写Promise、EventEmitter、防抖节流等核心函数',
      '学习至少5种设计模式并在项目中实践'
    ],
    recommendedTools: [
      'Chrome DevTools - 断点调试与性能分析',
      'JSONPlaceholder - 模拟API数据',
      'javascript.info - 现代JS教程'
    ]
  }
]

// ============================================================
// 岗位技能关键词库（用于匹配算法）
// TODO: 后续对接后端爬虫数据，从JD自动提取技能栈
// ============================================================
const posSkillData = {
  'frontend': ['HTML5/CSS3', 'JavaScript/ES6+', 'Vue.js', 'React', 'TypeScript', 'Webpack/Vite', 'Element UI/Ant Design'],
  'vue-developer': ['Vue3 Composition API', 'Vue3响应式原理', 'Vuex/Pinia', 'Vue Router', 'Element Plus', 'Nuxt.js'],
  'react-developer': ['React Hooks', 'React组件化', 'Context/Redux', 'React Router', 'Next.js', 'TypeScript'],
  'backend-java': ['Java基础与集合', 'JVM原理', 'Spring Boot', 'Spring Cloud', 'MyBatis/JPA', 'MySQL', 'Redis'],
  'backend-python': ['Python基础', 'Python高级特性', 'Django', 'Flask', 'FastAPI', 'SQLAlchemy', 'MySQL/PostgreSQL'],
  'backend-go': ['Go基础语法', 'Goroutine/Channel', 'Gin', 'gRPC', 'Kitex', 'MySQL/PostgreSQL'],
  'ml-engineer': ['机器学习算法', '深度学习(DNN/CNN/RNN)', '特征工程', 'PyTorch/TensorFlow', 'Scikit-learn', 'XGBoost/LightGBM'],
  'ai-engineer': ['大语言模型(LLM)', 'Transformer架构', 'Prompt Engineering', 'RAG/微调', 'LangChain', 'Hugging Face'],
  'nlp-engineer': ['文本预处理', '词向量/BERT', 'Transformer', '命名实体识别', 'PyTorch/TensorFlow'],
  'cv-engineer': ['图像处理', 'CNN架构', '目标检测/分割', 'YOLO/Faster R-CNN', 'OpenCV', 'PyTorch'],
  'ic-engineer': ['Verilog/VHDL', 'SystemVerilog', 'RTL设计', '逻辑综合', 'Synopsys Design Compiler', 'UVM'],
  'embedded': ['C/C++', '嵌入式Linux', 'ARM架构', 'Linux驱动开发', 'Bootloader(U-Boot)', 'JTAG/SWD调试'],
  'bigdata': ['Hadoop/HDFS', 'MapReduce', 'Spark', 'Flink', 'Hive', 'HBase'],
  'k8s-engineer': ['Kubernetes架构', 'Pod/Service/Deployment', 'Helm', 'Docker', '容器技术'],
  'devops': ['Jenkins/GitLab CI', 'Docker', 'Kubernetes', 'Linux', 'Prometheus/Grafana'],
  'android': ['Java/Kotlin', 'Android SDK', 'Jetpack', 'Jetpack Compose', 'MVVM/MVI架构'],
  'ios-developer': ['Swift/Objective-C', 'UIKit/SwiftUI', 'Swift Concurrency', 'CocoaPods/SPM'],
  'mobile-h5': ['HTML5/CSS3适配', '移动端事件(touch)', '响应式布局', 'Vue.js', 'Vant/Element Mobile', '小程序开发'],
  'web-frontend': ['HTML5/CSS3', 'JavaScript/ES6+', 'DOM/BOM', 'Ajax/Fetch', 'Vue.js', 'React', 'Webpack/Vite'],
  'backend-node': ['Node.js基础', '事件循环', '模块系统(CommonJS/ESM)', 'Express/Koa', 'NestJS', 'MongoDB/Mongoose', 'MySQL/Sequelize', 'Redis', 'TypeScript'],
  'php-developer': ['PHP基础语法', 'OOP编程', 'Composer', 'PHP 8.x新特性', 'Laravel', 'ThinkPHP', 'MySQL', 'Redis'],
  'ruby-developer': ['Ruby基础', 'Ruby元编程', 'Bundler', 'RSpec', 'Ruby on Rails', 'Sinatra'],
  'fullstack': ['Vue.js/React', 'JavaScript/TypeScript', 'HTML5/CSS3', 'Node.js/Python/Java', 'RESTful API', 'GraphQL', 'MySQL/PostgreSQL', 'Redis', 'Docker/K8s'],
  'fullstack-web': ['Vue/React', 'Webpack/Vite', 'Node.js', 'Express/NestJS', 'MySQL', 'Next.js/Nuxt', 'SSR/SSG', 'CI/CD'],
  'fullstack-mobile': ['Flutter/React Native', 'iOS/Android原生', 'Node.js/Go', 'Firebase/后端即服务'],
  '推荐算法': ['协同过滤', '矩阵分解', '内容推荐', '混合推荐', 'Spark/Flink', 'TensorFlow/PyTorch', 'Redis缓存'],
  'data-engineer': ['ETL开发', '数据仓库设计', '数据治理', 'Airflow/DolphinScheduler', 'Spark/Flink', 'Kafka', 'Hadoop/HDFS'],
  'data-analyst': ['SQL', '统计学', '数据可视化', '业务分析', 'Python(Pandas)', 'Excel', 'Tableau/Power BI'],
  'etl-engineer': ['Kettle/DataX', 'Airflow', 'Spark/Flink', '数据清洗', '数据转换', 'MySQL/Hive', 'Kafka'],
  'spark-developer': ['Spark SQL', 'Spark Streaming', 'Spark MLlib', 'Scala', 'Python(PySpark)', 'Java'],
  'ic-design': ['Verilog/SystemVerilog', 'RTL编码', 'FSM设计', '低功耗设计', 'Cadence Spectre', '综合/布局布线', '时序分析', '形式验证'],
  'ic-verification': ['UVM', 'SystemVerilog', '覆盖率驱动验证', '断言验证(SVA)', '验证计划制定', '测试用例编写', 'Bug管理', '回归测试'],
  'fpga-engineer': ['Verilog/VHDL', 'FPGA架构(Xilinx/Altera)', '时序约束', 'IP核使用', 'Vivado/Quartus', 'ModelSim', 'Matlab', '数字信号处理'],
  'hardware': ['原理图设计', 'PCB Layout', '信号完整性', 'Altium Designer', 'Cadence Allegro', '硬件调试', '示波器/万用表'],
  'soc-engineer': ['SoC架构设计', '总线协议(AXI/APB)', 'IP集成', '时钟/复位设计', '子系统验证', 'FPGA原型验证'],
  'flutter': ['Dart', 'Flutter Widget', '状态管理(Riverpod/Bloc)', '路由与导航', '自定义Widget', 'Platform Channel'],
  'rn-developer': ['JavaScript/TypeScript', 'React Native核心', '原生模块', 'Expo', 'Redux/MobX'],
  'sre': ['Site Reliability', 'SLA/SLO/SLI', '故障排查', '容量规划', '监控系统', '日志系统(ELK/Loki)', '链路追踪(Jaeger)', 'Prometheus/Grafana'],
  'cloud': ['虚拟化(KVM/Xen)', '容器技术', '微服务架构', '阿里云/腾讯云', 'AWS', 'OpenStack', 'Linux'],
  'security': ['网络安全', '密码学基础', '操作系统安全', 'Web安全', 'Burp Suite', 'Nmap', 'Wireshark', 'Metasploit'],
  'penetration': ['Web渗透', '系统渗透', 'API渗透', 'Python渗透', 'Burp Suite', 'SQL注入/XSS'],
  'network': ['TCP/IP协议', '路由协议(OSPF/BGP)', '交换技术', '网络安全', '华为/Cisco设备', 'Linux网络配置', 'SDN/NFV'],
  'qa-engineer': ['测试理论', '测试用例设计', '缺陷管理', '需求分析', 'JMeter/LoadRunner', 'Postman', 'Jira', 'Selenium/Appium'],
  'autotest': ['Selenium/Cypress', 'Pytest/TestNG', 'Playwright', '框架设计', 'Python/Java', 'Git/SVN'],
  'perf-test': ['JMeter', 'LoadRunner', 'Gatling', '瓶颈定位', '性能调优', '监控分析'],
  'test-dev': ['自动化框架开发', '平台工具开发', 'Java/Python', 'Jenkins', 'GitLab CI'],
  'game-dev': ['游戏引擎(Unity/Unreal)', 'C++/C#', '游戏物理', '游戏AI', '网络编程', '分布式系统'],
  'game-client': ['Unity/Unreal Engine', 'C++/C#', '渲染管线', 'UI/UX实现'],
  'game-server': ['C++/Go/Java', '网络编程', '高并发', '游戏逻辑', '分布式架构', 'Redis/MySQL'],
  'blockchain': ['共识算法', '智能合约', '密码学', 'P2P网络', 'Solidity', 'Go/Rust', 'Ethereum/Hyperledger'],
  'robotics': ['ROS/ROS2', 'C++/Python', '运动控制', 'SLAM', '计算机视觉', '机器学习', '路径规划'],
  'database': ['MySQL/PostgreSQL', '索引优化', 'SQL调优', '事务与锁', '分布式数据库', '分库分表', 'TiDB/CockroachDB'],
  'dba': ['数据库安装部署', '备份恢复', '性能调优', '高可用方案', '数据库监控', '慢查询分析', '空间管理'],
  'tech-lead': ['技术规划', '团队管理', '项目管理', '技术选型', '系统架构', '代码评审', '技术分享'],
  'architect': ['分布式架构', '微服务', '高可用设计', '可扩展性设计', '多技术栈', '行业理解', '技术趋势'],
  'algorithm': ['数据结构与算法', '动态规划', '图论算法', '复杂度分析', 'C++/Java', 'Python', 'LeetCode刷题', '线性代数', '概率论与数理统计']
}

// ============================================================
// 技能相关性校验工具函数
// 用于精确计算资源技能标签与岗位技能的匹配程度
// ============================================================

// 技能标签规范化：统一转换为小写，去除特殊字符
const normalizeSkill = (skill) => {
  return skill.toLowerCase().replace(/[（）()/]/g, '').trim()
}

// 计算两个技能字符串的相关性得分（0-100分）
const calculateSkillRelevance = (resourceTag, jobSkill) => {
  const normTag = normalizeSkill(resourceTag)
  const normSkill = normalizeSkill(jobSkill)

  // 完全匹配
  if (normTag === normSkill) return 100

  // 精确包含匹配（子串关系）
  if (normTag.includes(normSkill) || normSkill.includes(normTag)) {
    // 短字符串被长字符串完全包含，高度相关
    const minLen = Math.min(normTag.length, normSkill.length)
    const maxLen = Math.max(normTag.length, normSkill.length)
    const ratio = minLen / maxLen

    // 如果短串长度>=3，且被包含，则高度相关
    if (minLen >= 3 && ratio >= 0.5) return 90
    if (minLen >= 2 && ratio >= 0.3) return 70
    return 50
  }

  // 关键词拆分匹配
  const tagKeywords = normTag.split(/[/\s,+-]+/)
  const skillKeywords = normSkill.split(/[/\s,+-]+/)

  let matchCount = 0
  for (const tk of tagKeywords) {
    if (tk.length < 2) continue
    for (const sk of skillKeywords) {
      if (sk.length < 2) continue
      if (tk === sk || tk.includes(sk) || sk.includes(tk)) {
        matchCount++
        break
      }
    }
  }

  // 计算关键词匹配率
  const maxKeywords = Math.min(tagKeywords.filter(k => k.length >= 2).length, skillKeywords.filter(k => k.length >= 2).length)
  if (maxKeywords === 0) return 0

  const relevanceScore = (matchCount / maxKeywords) * 60
  return relevanceScore
}

// 计算资源与岗位的整体相关性评估
const evaluateResourceRelevance = (resource, searchSkills) => {
  let totalRelevance = 0
  let highRelevanceCount = 0
  const matchedSkills = []

  for (const tag of resource.skillTags) {
    let maxRelevance = 0
    let bestSkill = null

    for (const skill of searchSkills) {
      const relevance = calculateSkillRelevance(tag, skill)
      if (relevance > maxRelevance) {
        maxRelevance = relevance
        bestSkill = skill
      }
    }

    if (maxRelevance >= 60) {
      highRelevanceCount++
      matchedSkills.push({ tag, skill: bestSkill, relevance: maxRelevance })
      totalRelevance += maxRelevance
    } else if (maxRelevance >= 30) {
      matchedSkills.push({ tag, skill: bestSkill, relevance: maxRelevance })
      totalRelevance += maxRelevance * 0.5
    }
  }

  // 计算综合相关性分数
  const avgRelevance = matchedSkills.length > 0 ? totalRelevance / matchedSkills.length : 0
  const coverageRatio = highRelevanceCount / Math.max(searchSkills.length, 1)
  const overallScore = avgRelevance * 0.4 + coverageRatio * 100 * 0.6

  return {
    avgRelevance,
    highRelevanceCount,
    coverageRatio,
    overallScore,
    matchedSkills,
    isHighlyRelevant: overallScore >= 40
  }
}

// ============================================================
// 智能匹配推送算法（增强版）
// 根据岗位JD技能清单 + 用户学习进度 自动匹配资源
// 强制约束：仅强相关资源参与系统推送
// ============================================================
export function findMatchingResources(positionKey, userProgress = 0) {
  let searchSkills = posSkillData[positionKey] || []

  // 如果岗位未在字典中，尝试从资源库中反推相关技能
  if (searchSkills.length === 0) {
    const keyLower = positionKey.toLowerCase()
    const relatedTags = new Set()
    for (const resource of resourceDatabase) {
      for (const tag of resource.skillTags) {
        if (tag.toLowerCase().includes(keyLower) || keyLower.includes(tag.toLowerCase())) {
          relatedTags.add(tag)
        }
      }
    }
    // 收集该岗位可能相关的技能标签（取前8个）
    searchSkills = Array.from(relatedTags).slice(0, 8)
  }

  // 如果仍未找到任何技能关键词，直接走兜底逻辑
  if (searchSkills.length === 0) {
    const generalFallback = resourceDatabase
      .filter(r => r.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating || b.students - a.students)
      .slice(0, 6)
      .map(r => ({
        ...r,
        score: 10,
        matchedSkills: r.skillTags.slice(0, 3).map(tag => ({ name: tag, level: 'bonus', relevance: 30 })),
        skillCoverage: 0.3,
        relevanceScore: 30,
        isHighlyRelevant: false
      }))
    return generalFallback
  }

  // 技能分级：must=必备前40%, prefer=优先35%, bonus=加分25%
  const mustSkills = searchSkills.slice(0, Math.ceil(searchSkills.length * 0.4))
  const preferSkills = searchSkills.slice(Math.ceil(searchSkills.length * 0.4), Math.ceil(searchSkills.length * 0.75))
  const bonusSkills = searchSkills.slice(Math.ceil(searchSkills.length * 0.75))

  // 为每条资源计算匹配分数和相关性评估
  const scored = resourceDatabase.map(resource => {
    // 1. 基础匹配分数计算
    let score = 0
    const matchedSkills = []
    const relevanceResult = evaluateResourceRelevance(resource, searchSkills)

    for (const tag of resource.skillTags) {
      const tagRelevance = relevanceResult.matchedSkills.find(m => m.tag === tag)
      if (!tagRelevance || tagRelevance.relevance < 30) continue

      // 检查技能分级
      if (mustSkills.some(s => calculateSkillRelevance(tag, s) >= 60)) {
        score += 15  // 必备技能高度匹配
        matchedSkills.push({ name: tag, level: 'must', relevance: tagRelevance.relevance })
      } else if (mustSkills.some(s => calculateSkillRelevance(tag, s) >= 30)) {
        score += 8   // 必备技能中度匹配
        matchedSkills.push({ name: tag, level: 'must', relevance: tagRelevance.relevance })
      } else if (preferSkills.some(s => calculateSkillRelevance(tag, s) >= 60)) {
        score += 10  // 优先技能高度匹配
        matchedSkills.push({ name: tag, level: 'prefer', relevance: tagRelevance.relevance })
      } else if (preferSkills.some(s => calculateSkillRelevance(tag, s) >= 30)) {
        score += 5   // 优先技能中度匹配
        matchedSkills.push({ name: tag, level: 'prefer', relevance: tagRelevance.relevance })
      } else if (bonusSkills.some(s => calculateSkillRelevance(tag, s) >= 60)) {
        score += 5   // 加分技能高度匹配
        matchedSkills.push({ name: tag, level: 'bonus', relevance: tagRelevance.relevance })
      } else if (bonusSkills.some(s => calculateSkillRelevance(tag, s) >= 30)) {
        score += 2   // 加分技能中度匹配
        matchedSkills.push({ name: tag, level: 'bonus', relevance: tagRelevance.relevance })
      }
    }

    // 2. 覆盖率加成
    const skillCoverage = matchedSkills.length / Math.max(resource.skillTags.length, 1)
    score += skillCoverage * 10

    // 3. 相关性加成（核心增强）
    score += relevanceResult.overallScore * 0.3

    // 4. 进度适配加成
    if (userProgress > 0 && userProgress < 50 && resource.difficulty === '进阶') {
      score += 3
    } else if (userProgress >= 50 && resource.difficulty === '进阶') {
      score += 2
    }

    // 5. 资源质量加成（基于评分和学习人数）
    if (resource.rating >= 4.8) score += 2
    if (resource.students >= 10000) score += 1

    return {
      ...resource,
      score,
      matchedSkills,
      skillCoverage,
      relevanceScore: relevanceResult.overallScore,
      isHighlyRelevant: relevanceResult.isHighlyRelevant
    }
  })

  // 严格过滤：仅保留有匹配分数的资源
  const filtered = scored.filter(r => r.score > 0)

  // ======================================================
  // 核心约束：确保岗位技能清单每一项至少匹配到1条资源
  // 且仅高相关资源作为必选推荐
  // ======================================================
  const guaranteedIds = new Set()
  const guaranteedItems = []

  for (const skill of searchSkills) {
    // 优先选择高度相关的资源（相关性分数>=60）
    let candidates = filtered.filter(r =>
      r.skillTags.some(tag => calculateSkillRelevance(tag, skill) >= 60)
    )

    // 如果没有高度相关资源，退化为中等相关（>=30）
    if (candidates.length === 0) {
      candidates = filtered.filter(r =>
        r.skillTags.some(tag => calculateSkillRelevance(tag, skill) >= 30)
      )
    }

    // 最后兜底：关键词模糊匹配
    if (candidates.length === 0) {
      const keywords = skill.split(/[/\s,+()（）]/).filter(k => k.length >= 2)
      if (keywords.length > 0) {
        candidates = filtered.filter(r =>
          r.skillTags.some(tag =>
            keywords.some(kw => tag.includes(kw) || kw.includes(tag))
          )
        )
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score)
      const best = candidates[0]
      if (!guaranteedIds.has(best.id)) {
        guaranteedIds.add(best.id)
        guaranteedItems.push(best)
      }
    }
  }

  // 补充其他高匹配度资源（排除已选的必选资源）
  // 严格过滤：仅保留相关性分数>=40的资源，确保强相关
  const otherCandidates = filtered
    .filter(r => !guaranteedIds.has(r.id) && r.relevanceScore >= 40)
    .sort((a, b) => b.score - a.score)

  // 对必选资源进行二次校验：确保至少有一个技能标签与岗位高度相关
  const validatedGuaranteedItems = guaranteedItems.filter(r => {
    // 必选资源至少需要一个技能标签与岗位技能有中等以上相关性
    return r.matchedSkills.length > 0 && r.relevanceScore >= 20
  })

  // 合并结果：必选资源优先，其他高分资源补充
  const result = [...validatedGuaranteedItems, ...otherCandidates]

  // 返回所有匹配到的资源（已通过相关性校验）
  // 如果过滤后资源太少，保留部分必选资源以确保覆盖度
  if (result.length < 5) {
    const fallbackItems = filtered
      .filter(r => !result.some(r2 => r2.id === r.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5 - result.length)
    return [...result, ...fallbackItems]
  }

  // 最后兜底：如果完全没有匹配结果（如小众岗位），
  // 返回通用高质量资源，确保用户始终能看到内容
  if (result.length === 0) {
    const generalFallback = resourceDatabase
      .filter(r => r.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating || b.students - a.students)
      .slice(0, 6)
      .map(r => ({
        ...r,
        score: 10,
        matchedSkills: r.skillTags.slice(0, 3).map(tag => ({ name: tag, level: 'bonus', relevance: 30 })),
        skillCoverage: 0.3,
        relevanceScore: 30,
        isHighlyRelevant: false
      }))
    return generalFallback
  }

  return result
}

// 资源类型标签映射（用于前端展示）
export const typeLabels = {
  video: '视频课程',
  course: '在线课程',
  book: '图书教材',
  doc: '在线文档',
  project: '实战项目'
}

// 难度等级映射
export const difficultyLabels = {
  '入门': '入门',
  '基础': '基础',
  '进阶': '进阶',
  '高级': '高级'
}