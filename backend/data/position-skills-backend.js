const positionGroups = [
  { name: '前端开发', positions: [
    { key: 'frontend', label: '前端开发工程师' },
    { key: 'vue-developer', label: 'Vue开发工程师' },
    { key: 'react-developer', label: 'React开发工程师' },
    { key: 'mobile-h5', label: '移动端H5开发' },
    { key: 'web-frontend', label: 'Web前端工程师' }
  ]},
  { name: '后端开发', positions: [
    { key: 'backend-java', label: 'Java后端开发工程师' },
    { key: 'backend-python', label: 'Python后端开发工程师' },
    { key: 'backend-go', label: 'Go后端开发工程师' },
    { key: 'backend-node', label: 'Node.js后端工程师' },
    { key: 'php-developer', label: 'PHP开发工程师' },
    { key: 'ruby-developer', label: 'Ruby开发工程师' }
  ]},
  { name: '全栈开发', positions: [
    { key: 'fullstack', label: '全栈开发工程师' },
    { key: 'fullstack-web', label: 'Web全栈工程师' },
    { key: 'fullstack-mobile', label: '移动全栈工程师' }
  ]},
  { name: '算法与AI', positions: [
    { key: 'algorithm', label: '算法工程师' },
    { key: 'ml-engineer', label: '机器学习工程师' },
    { key: 'ai-engineer', label: '人工智能工程师' },
    { key: 'nlp-engineer', label: 'NLP算法工程师' },
    { key: 'cv-engineer', label: '计算机视觉工程师' },
    { key: 'recommend-engineer', label: '推荐算法工程师' }
  ]},
  { name: '大数据', positions: [
    { key: 'bigdata', label: '大数据开发工程师' },
    { key: 'data-engineer', label: '数据工程师' },
    { key: 'data-analyst', label: '数据分析师' },
    { key: 'etl-engineer', label: 'ETL工程师' },
    { key: 'spark-developer', label: 'Spark开发工程师' }
  ]},
  { name: '芯片与硬件', positions: [
    { key: 'ic-engineer', label: '集成电路工程师' },
    { key: 'embedded', label: '嵌入式开发工程师' },
    { key: 'hardware', label: '硬件工程师' },
    { key: 'fpga-engineer', label: 'FPGA工程师' }
  ]},
  { name: '移动端开发', positions: [
    { key: 'android', label: 'Android开发工程师' },
    { key: 'ios-developer', label: 'iOS开发工程师' },
    { key: 'flutter', label: 'Flutter开发工程师' },
    { key: 'rn-developer', label: 'React Native工程师' }
  ]},
  { name: '运维与安全', positions: [
    { key: 'devops', label: 'DevOps工程师' },
    { key: 'sre', label: 'SRE工程师' },
    { key: 'cloud', label: '云计算工程师' },
    { key: 'k8s-engineer', label: 'Kubernetes工程师' },
    { key: 'security', label: '安全工程师' },
    { key: 'penetration', label: '渗透测试工程师' },
    { key: 'network', label: '网络工程师' }
  ]},
  { name: '测试与质量', positions: [
    { key: 'qa-engineer', label: '测试工程师' },
    { key: 'autotest', label: '自动化测试工程师' },
    { key: 'perf-test', label: '性能测试工程师' },
    { key: 'test-dev', label: '测试开发工程师' }
  ]},
  { name: '产品与设计', positions: [
    { key: 'product-manager', label: '产品经理' },
    { key: 'product-designer', label: '产品设计师' },
    { key: 'ui-designer', label: 'UI设计师' },
    { key: 'interaction-designer', label: '交互设计师' },
    { key: 'operations', label: '运营专员' }
  ]},
  { name: '其他方向', positions: [
    { key: 'game-dev', label: '游戏开发工程师' },
    { key: 'game-client', label: '游戏客户端开发' },
    { key: 'game-server', label: '游戏服务器开发' },
    { key: 'blockchain', label: '区块链开发工程师' },
    { key: 'database', label: '数据库工程师' },
    { key: 'dba', label: 'DBA工程师' },
    { key: 'architect', label: '系统架构师' }
  ]}
]

const positionSkillMap = {
  'frontend': { '前端核心': [{name:'HTML5/CSS3',level:'must'},{name:'JavaScript/ES6+',level:'must'},{name:'DOM操作',level:'must'}], '框架工具': [{name:'Vue.js',level:'must'},{name:'React',level:'must'},{name:'TypeScript',level:'prefer'},{name:'Webpack/Vite',level:'prefer'}], '工程化': [{name:'Git',level:'must'},{name:'Node.js',level:'bonus'}] },
  'vue-developer': { 'Vue核心': [{name:'Vue3 Composition API',level:'must'},{name:'Vue3响应式原理',level:'must'},{name:'Vuex/Pinia',level:'must'}], 'Vue生态': [{name:'Vue Router',level:'must'},{name:'Element Plus',level:'must'},{name:'Nuxt.js',level:'bonus'}], '前端基础': [{name:'JavaScript/ES6+',level:'must'},{name:'HTML5/CSS3',level:'must'}] },
  'react-developer': { 'React核心': [{name:'React Hooks',level:'must'},{name:'React组件化',level:'must'},{name:'Context/Redux',level:'must'},{name:'React Router',level:'must'}], 'React生态': [{name:'Next.js',level:'prefer'},{name:'Material UI',level:'must'},{name:'Jest',level:'prefer'}], '前端基础': [{name:'JavaScript/ES6+',level:'must'},{name:'TypeScript',level:'must'}] },
  'mobile-h5': { '移动端核心': [{name:'HTML5/CSS3适配',level:'must'},{name:'响应式布局',level:'must'},{name:'Rem/Vw/Vh',level:'must'}], '框架与混合': [{name:'Vue/React',level:'must'},{name:'Vant/Element Mobile',level:'must'},{name:'小程序开发',level:'prefer'}] },
  'web-frontend': { '前端核心': [{name:'HTML5/CSS3',level:'must'},{name:'JavaScript/ES6+',level:'must'},{name:'DOM/BOM',level:'must'}], '框架工具': [{name:'Vue/React',level:'must'},{name:'Webpack/Vite',level:'prefer'},{name:'Git',level:'must'}] },
  'backend-java': { 'Java核心': [{name:'Java基础与集合',level:'must'},{name:'JVM原理',level:'must'},{name:'多线程与并发',level:'must'}], 'Spring生态': [{name:'Spring Boot',level:'must'},{name:'Spring Cloud',level:'must'},{name:'MyBatis/JPA',level:'must'}], '数据库': [{name:'MySQL',level:'must'},{name:'Redis',level:'must'}], '中间件': [{name:'Nginx',level:'must'},{name:'Docker/K8s',level:'prefer'}] },
  'backend-python': { 'Python核心': [{name:'Python基础',level:'must'},{name:'Python高级特性',level:'must'},{name:'异步编程(asyncio)',level:'must'}], 'Web框架': [{name:'Django',level:'must'},{name:'Flask',level:'must'},{name:'FastAPI',level:'prefer'}], '数据库': [{name:'MySQL/PostgreSQL',level:'must'},{name:'Redis',level:'must'}] },
  'backend-go': { 'Go核心': [{name:'Go基础语法',level:'must'},{name:'Goroutine/Channel',level:'must'},{name:'并发编程',level:'must'}], 'Web框架': [{name:'Gin',level:'must'},{name:'Echo/Beego',level:'prefer'},{name:'gRPC',level:'prefer'}], '基础设施': [{name:'MySQL/PostgreSQL',level:'must'},{name:'Redis',level:'must'}] },
  'backend-node': { 'Node核心': [{name:'Node.js基础',level:'must'},{name:'事件循环',level:'must'},{name:'模块系统',level:'must'}], '框架': [{name:'Express/Koa',level:'must'},{name:'NestJS',level:'prefer'},{name:'Socket.IO',level:'prefer'}], '数据库': [{name:'MongoDB',level:'must'},{name:'MySQL',level:'must'},{name:'Redis',level:'must'}] },
  'php-developer': { 'PHP核心': [{name:'PHP基础语法',level:'must'},{name:'OOP编程',level:'must'},{name:'Composer',level:'must'}], '框架': [{name:'Laravel',level:'must'},{name:'ThinkPHP',level:'must'}], '数据库': [{name:'MySQL',level:'must'},{name:'Redis',level:'prefer'}] },
  'ruby-developer': { 'Ruby核心': [{name:'Ruby基础',level:'must'},{name:'Bundler',level:'must'}], '框架': [{name:'Ruby on Rails',level:'must'}] },
  'fullstack': { '前端技术': [{name:'Vue.js/React',level:'must'},{name:'JavaScript/TypeScript',level:'must'}], '后端技术': [{name:'Node.js/Python/Java',level:'must'},{name:'RESTful API',level:'must'}], '数据库': [{name:'MySQL/PostgreSQL',level:'must'},{name:'Redis',level:'must'},{name:'Docker/K8s',level:'prefer'}] },
  'fullstack-web': { '前端': [{name:'Vue/React',level:'must'}], '后端': [{name:'Node.js',level:'must'},{name:'Express/NestJS',level:'must'},{name:'MySQL',level:'must'}], '全栈工具': [{name:'Next.js/Nuxt',level:'prefer'},{name:'SSR/SSG',level:'prefer'}] },
  'fullstack-mobile': { '移动端': [{name:'Flutter/React Native',level:'must'}], '后端': [{name:'Node.js/Go',level:'must'}] },
  'algorithm': { '算法基础': [{name:'数据结构与算法',level:'must'},{name:'动态规划',level:'must'},{name:'复杂度分析',level:'must'}], '编程': [{name:'C++/Java',level:'must'},{name:'Python',level:'must'}], '数学基础': [{name:'线性代数',level:'must'},{name:'概率论与数理统计',level:'must'}] },
  'ml-engineer': { 'ML基础': [{name:'机器学习算法',level:'must'},{name:'深度学习',level:'must'},{name:'特征工程',level:'must'}], '框架工具': [{name:'TensorFlow/PyTorch',level:'must'},{name:'Scikit-learn',level:'must'},{name:'XGBoost',level:'must'}], '工程能力': [{name:'Python',level:'must'},{name:'数据处理',level:'must'}] },
  'ai-engineer': { 'AI核心': [{name:'大语言模型(LLM)',level:'must'},{name:'Transformer架构',level:'must'},{name:'Prompt Engineering',level:'must'}], 'AI框架': [{name:'PyTorch/TensorFlow',level:'must'},{name:'Hugging Face',level:'must'},{name:'LangChain',level:'prefer'}], '工程化': [{name:'Python',level:'must'},{name:'Docker/K8s',level:'prefer'}] },
  'nlp-engineer': { 'NLP核心': [{name:'文本预处理',level:'must'},{name:'词向量/BERT',level:'must'},{name:'Transformer',level:'must'}], 'NLP任务': [{name:'命名实体识别',level:'must'},{name:'文本分类',level:'must'}], '工具': [{name:'PyTorch',level:'must'},{name:'Hugging Face',level:'must'}] },
  'cv-engineer': { 'CV核心': [{name:'图像处理',level:'must'},{name:'特征提取',level:'must'},{name:'CNN架构',level:'must'}], 'CV模型': [{name:'YOLO/Faster R-CNN',level:'must'}], '工具': [{name:'PyTorch',level:'must'},{name:'OpenCV',level:'must'}] },
  'recommend-engineer': { '推荐基础': [{name:'协同过滤',level:'must'},{name:'矩阵分解',level:'must'},{name:'内容推荐',level:'must'}], '工程化': [{name:'Spark/Flink',level:'must'},{name:'TensorFlow/PyTorch',level:'must'},{name:'Redis缓存',level:'must'}] },
  'bigdata': { '大数据核心': [{name:'Hadoop/HDFS',level:'must'},{name:'MapReduce',level:'must'}], '计算引擎': [{name:'Spark',level:'must'},{name:'Flink',level:'must'},{name:'Hive',level:'must'}], '数据存储': [{name:'HBase',level:'must'},{name:'Kafka',level:'must'}], '语言': [{name:'Java/Scala',level:'must'},{name:'Python',level:'prefer'}] },
  'data-engineer': { '数据工程': [{name:'ETL开发',level:'must'},{name:'数据仓库设计',level:'must'},{name:'数据治理',level:'prefer'}], '工具': [{name:'Airflow',level:'must'},{name:'Spark/Flink',level:'must'},{name:'Kafka',level:'must'}], '存储': [{name:'Hadoop/HDFS',level:'must'},{name:'S3/OSS',level:'must'}] },
  'data-analyst': { '数据分析': [{name:'SQL',level:'must'},{name:'统计学',level:'must'},{name:'数据可视化',level:'must'},{name:'业务分析',level:'must'}], '工具': [{name:'Python(Pandas)',level:'must'},{name:'Excel',level:'must'},{name:'Tableau',level:'prefer'}] },
  'etl-engineer': { 'ETL工具': [{name:'Kettle/DataX',level:'must'},{name:'Airflow',level:'must'},{name:'Spark/Flink',level:'must'}], '数据处理': [{name:'数据清洗',level:'must'},{name:'数据转换',level:'must'},{name:'数据同步',level:'must'}] },
  'spark-developer': { 'Spark核心': [{name:'Spark SQL',level:'must'},{name:'Spark Streaming',level:'must'},{name:'RDD/DataFrame',level:'must'}], '开发语言': [{name:'Scala',level:'must'},{name:'Python(PySpark)',level:'must'}] },
  'ic-engineer': { 'IC设计': [{name:'Verilog/VHDL',level:'must'},{name:'SystemVerilog',level:'must'},{name:'RTL设计',level:'must'}], '验证': [{name:'UVM验证方法学',level:'must'}] },
  'embedded': { '嵌入式核心': [{name:'C/C++',level:'must'},{name:'嵌入式Linux',level:'must'},{name:'ARM架构',level:'must'},{name:'RTOS',level:'must'}], '驱动与系统': [{name:'Linux驱动开发',level:'must'},{name:'Bootloader(U-Boot)',level:'must'}], '调试工具': [{name:'JTAG/SWD调试',level:'must'},{name:'GDB',level:'must'}] },
  'hardware': { '硬件设计': [{name:'原理图设计',level:'must'},{name:'PCB Layout',level:'must'}], 'EDA工具': [{name:'Altium Designer',level:'must'}], '测试': [{name:'硬件调试',level:'must'},{name:'示波器/万用表',level:'must'}] },
  'fpga-engineer': { 'FPGA核心': [{name:'Verilog/VHDL',level:'must'},{name:'FPGA架构',level:'must'},{name:'时序约束',level:'must'}], '开发工具': [{name:'Vivado/Quartus',level:'must'},{name:'ModelSim',level:'must'}] },
  'devops': { 'CI/CD': [{name:'Jenkins/GitLab CI',level:'must'},{name:'GitHub Actions',level:'prefer'}], '容器与编排': [{name:'Docker',level:'must'},{name:'Kubernetes',level:'must'},{name:'Helm',level:'prefer'}], '基础设施': [{name:'Linux',level:'must'},{name:'Prometheus/Grafana',level:'must'}] },
  'sre': { 'SRE核心': [{name:'Site Reliability',level:'must'},{name:'SLA/SLO/SLI',level:'must'},{name:'故障排查',level:'must'}], '工具': [{name:'监控系统',level:'must'},{name:'日志系统',level:'must'}] },
  'cloud': { '云计算核心': [{name:'虚拟化',level:'must'},{name:'容器技术',level:'must'},{name:'微服务架构',level:'must'}], '云平台': [{name:'阿里云/腾讯云',level:'must'},{name:'AWS',level:'prefer'}] },
  'k8s-engineer': { 'K8s核心': [{name:'Kubernetes架构',level:'must'},{name:'Pod/Service/Deployment',level:'must'},{name:'ConfigMap/Secret',level:'must'},{name:'Helm',level:'must'}], 'K8s进阶': [{name:'Operator/CRD',level:'prefer'},{name:'Service Mesh',level:'prefer'},{name:'K8s安全',level:'prefer'}] },
  'security': { '安全基础': [{name:'网络安全',level:'must'},{name:'密码学基础',level:'must'},{name:'Web安全',level:'must'}], '安全工具': [{name:'Burp Suite',level:'must'},{name:'Nmap',level:'must'},{name:'Wireshark',level:'must'}] },
  'penetration': { '渗透测试': [{name:'Web渗透',level:'must'},{name:'系统渗透',level:'must'},{name:'API渗透',level:'must'}], '技术栈': [{name:'Python渗透',level:'must'},{name:'Burp Suite',level:'must'},{name:'SQL注入/XSS',level:'must'}] },
  'network': { '网络核心': [{name:'TCP/IP协议',level:'must'},{name:'路由协议',level:'must'},{name:'交换技术',level:'must'}], '设备': [{name:'华为/Cisco设备',level:'must'},{name:'Linux网络配置',level:'must'}] },
  'qa-engineer': { '测试核心': [{name:'测试理论',level:'must'},{name:'测试用例设计',level:'must'},{name:'缺陷管理',level:'must'}], '工具': [{name:'JMeter/LoadRunner',level:'must'},{name:'Postman',level:'must'},{name:'Jira',level:'must'}], '自动化': [{name:'Selenium/Appium',level:'prefer'},{name:'接口自动化',level:'prefer'}] },
  'autotest': { '自动化框架': [{name:'Selenium/Cypress',level:'must'},{name:'Pytest/TestNG',level:'must'},{name:'Playwright',level:'prefer'}], '编程': [{name:'Python/Java',level:'must'},{name:'Git',level:'must'}] },
  'perf-test': { '性能测试': [{name:'JMeter',level:'must'},{name:'LoadRunner',level:'prefer'}], '性能分析': [{name:'瓶颈定位',level:'must'},{name:'性能调优',level:'must'}] },
  'test-dev': { '测试开发': [{name:'自动化框架开发',level:'must'},{name:'平台工具开发',level:'must'},{name:'Java/Python',level:'must'}], 'CI/CD': [{name:'Jenkins',level:'must'}] },
  'game-dev': { '游戏开发': [{name:'游戏引擎(Unity/Unreal)',level:'must'},{name:'C++/C#',level:'must'}], '游戏服务端': [{name:'网络编程',level:'must'},{name:'分布式系统',level:'prefer'}] },
  'game-client': { '客户端': [{name:'Unity/Unreal Engine',level:'must'},{name:'C++/C#',level:'must'},{name:'UI/UX实现',level:'must'}] },
  'game-server': { '服务端': [{name:'C++/Go/Java',level:'must'},{name:'网络编程',level:'must'},{name:'高并发',level:'must'}], '分布式': [{name:'分布式架构',level:'prefer'},{name:'Redis/MySQL',level:'must'}] },
  'blockchain': { '区块链核心': [{name:'共识算法',level:'must'},{name:'智能合约',level:'must'},{name:'密码学',level:'must'}], '技术栈': [{name:'Solidity',level:'must'},{name:'Go/Rust',level:'must'},{name:'Ethereum',level:'must'}] },
  'database': { '数据库核心': [{name:'MySQL/PostgreSQL',level:'must'},{name:'索引优化',level:'must'},{name:'SQL调优',level:'must'},{name:'事务与锁',level:'must'}], '分布式': [{name:'分布式数据库',level:'prefer'},{name:'分库分表',level:'must'}] },
  'dba': { 'DBA核心': [{name:'数据库安装部署',level:'must'},{name:'备份恢复',level:'must'},{name:'性能调优',level:'must'},{name:'高可用方案',level:'must'}], '监控': [{name:'数据库监控',level:'must'},{name:'慢查询分析',level:'must'}] },
  'architect': { '架构设计': [{name:'分布式架构',level:'must'},{name:'微服务',level:'must'},{name:'高可用设计',level:'must'}], '技术视野': [{name:'多技术栈',level:'must'},{name:'行业理解',level:'must'}] },
  'android': { 'Android核心': [{name:'Java/Kotlin',level:'must'},{name:'Android SDK',level:'must'},{name:'Jetpack',level:'must'}], 'UI与架构': [{name:'Jetpack Compose',level:'must'},{name:'MVVM/MVI',level:'must'}] },
  'ios-developer': { 'iOS核心': [{name:'Swift/Objective-C',level:'must'},{name:'UIKit/SwiftUI',level:'must'},{name:'GCD/并发编程',level:'must'}] },
  'flutter': { 'Flutter核心': [{name:'Dart',level:'must'},{name:'Flutter Widget',level:'must'},{name:'状态管理',level:'must'}], 'Flutter进阶': [{name:'自定义Widget',level:'prefer'},{name:'Platform Channel',level:'prefer'}] },
  'rn-developer': { 'React Native': [{name:'JavaScript/TypeScript',level:'must'},{name:'React Native核心',level:'must'},{name:'原生模块',level:'prefer'}] },
  'product-manager': { '产品核心': [{name:'需求分析',level:'must'},{name:'产品规划',level:'must'},{name:'用户研究',level:'must'}], '工具方法': [{name:'Axure/Figma',level:'prefer'},{name:'Jira/Confluence',level:'must'},{name:'数据分析',level:'must'}], '软技能': [{name:'沟通协调',level:'must'},{name:'项目管理',level:'must'},{name:'商业思维',level:'prefer'}] },
  'product-designer': { '设计核心': [{name:'用户体验设计',level:'must'},{name:'交互设计',level:'must'},{name:'视觉设计',level:'must'}], '设计工具': [{name:'Figma/Sketch',level:'must'},{name:'Adobe XD',level:'prefer'},{name:'Principle',level:'prefer'}], '研究方法': [{name:'用户调研',level:'must'},{name:'可用性测试',level:'must'},{name:'信息架构',level:'must'}] },
  'ui-designer': { 'UI核心': [{name:'视觉设计',level:'must'},{name:'排版与色彩',level:'must'},{name:'设计规范',level:'must'}], '设计工具': [{name:'Figma/Photoshop',level:'must'},{name:'Illustrator',level:'prefer'},{name:'After Effects',level:'prefer'}] },
  'interaction-designer': { '交互核心': [{name:'交互设计原则',level:'must'},{name:'用户旅程地图',level:'must'},{name:'原型设计',level:'must'}], '工具': [{name:'Axure/Figma',level:'must'},{name:'Principle/Framer',level:'prefer'}] },
  'operations': { '运营核心': [{name:'用户运营',level:'must'},{name:'内容运营',level:'must'},{name:'活动策划',level:'must'}], '数据能力': [{name:'数据分析',level:'must'},{name:'用户画像',level:'prefer'}], '工具': [{name:'Excel/SQL',level:'must'},{name:'PS/AI',level:'prefer'}] }
}

const stageConfig = [
  { id: 'intro', name: '入门阶段', icon: '🌱', color: '#5eead4', desc: '了解行业基础概念，搭建学习环境', weeks: '1-2周' },
  { id: 'basic', name: '基础阶段', icon: '📘', color: '#7ab8ff', desc: '掌握核心语法和基础工具使用', weeks: '3-6周' },
  { id: 'advanced', name: '进阶阶段', icon: '🚀', color: '#c084fc', desc: '深入理解原理，掌握框架和最佳实践', weeks: '7-12周' },
  { id: 'practical', name: '实战阶段', icon: '🛠️', color: '#fbbf24', desc: '参与真实项目，积累工程经验', weeks: '13-18周' },
  { id: 'interview', name: '面试阶段', icon: '🎯', color: '#ff8a8a', desc: '技术面试准备，系统梳理知识体系', weeks: '19-20周' }
]

const interviewQuestionsBank = {
  'frontend': [
    { q: '请描述浏览器从输入URL到页面渲染的完整过程', a: '1. DNS解析 2. TCP三次握手 3. HTTP请求 4. 服务器处理 5. 浏览器解析HTML构建DOM 6. 解析CSS构建CSSOM 7. 合并为渲染树 8. 布局计算 9. 绘制合成' },
    { q: '如何优化前端性能？', a: '1. 减少HTTP请求 2. 代码分割/懒加载 3. 资源压缩(Gzip) 4. 图片优化 5. CDN加速 6. 缓存策略 7. 虚拟列表' },
    { q: '请解释闭包、原型链、Event Loop', a: '闭包：函数访问外部变量。原型链：对象__proto__形成链。Event Loop：执行栈+任务队列循环执行' },
    { q: 'Vue3 Composition API和Options API的区别？', a: 'Composition API优势：1. 相关逻辑聚合而非分散 2. 自定义Hook复用逻辑无命名冲突 3. 更好的TypeScript支持 4. Tree Shaking友好 5. 更灵活的代码组织' },
    { q: 'Vue3响应式原理？', a: '使用Proxy替代Object.defineProperty。优势：1. 监听对象新增/删除属性 2. 直接监听数组变化 3. 支持Map/Set等数据结构 4. 性能更好懒递归' },
    { q: '如何理解虚拟DOM和Diff算法？', a: '虚拟DOM：JS对象描述DOM结构。Diff算法：同层比较+Key复用，O(n)复杂度。Vue3使用快速Diff：静态标记+最长递增子序列' }
  ],
  'backend': [
    { q: 'JVM内存结构是怎样的？', a: '堆(对象实例)、方法区(类信息)、虚拟机栈(局部变量)、本地方法栈、程序计数器' },
    { q: '如何保证分布式一致性？', a: '2PC/3PC、TCC补偿事务、Saga长事务、消息队列最终一致性、Seata框架' },
    { q: 'MySQL索引类型和B+树结构？', a: '普通/唯一/主键/全文索引。B+树：非叶节点存索引，叶节点存数据+链表' }
  ],
  'algorithm': [
    { q: '实现LRU缓存', a: '哈希表+双向链表：get/put都是O(1)，超容量删除尾部节点' },
    { q: 'Transformer的Attention机制', a: 'Q/K/V矩阵计算，softmax(QK^T/√d)V，多头并行注意力' },
    { q: '过拟合如何解决？', a: '增加数据、L1/L2正则、Dropout、Early Stopping、数据增强' }
  ],
  'devops': [
    { q: 'Docker和虚拟机的区别？', a: '启动速度：Docker秒级/VM分钟级。资源：Docker轻量。隔离：VM硬件级/Docker进程级' },
    { q: 'K8s核心概念？', a: 'Pod(最小单元)、Service(稳定入口)、Deployment(副本管理)、ConfigMap/Secret(配置)' },
    { q: 'CI/CD流水线设计？', a: 'Code→Build→Test→Push→Deploy→Verify→Notify' }
  ],
  'qa': [
    { q: '如何设计测试用例？', a: '等价类划分、边界值分析、场景法、判定表法' },
    { q: '接口测试怎么做？', a: '获取文档→分析参数→设计用例→Postman执行→断言验证→数据校验' }
  ],
  'security': [
    { q: 'OWASP Top 10？', a: '权限失效、加密失败、注入、不安全设计、配置错误、组件漏洞、身份认证失败、数据完整性、日志监控、SSRF' },
    { q: 'SQL注入防御？', a: '参数化查询、输入验证、ORM框架、WAF、最小权限' }
  ],
  'mobile': [
    { q: 'Activity生命周期？', a: 'onCreate→onStart→onResume→onPause→onStop→onDestroy' },
    { q: 'MVVM架构优势？', a: '分离关注点、可测试、响应式、生命周期感知' }
  ],
  'ai': [
    { q: 'RAG工作流程？', a: '文档分块→向量化→存储→问题向量化→检索→加入Prompt→LLM生成' },
    { q: '如何设计Prompt？', a: 'Role+Task+Context+Format+Few-shot+Constraints' }
  ],
  'product': [
    { q: '如何进行需求分析？', a: '1. 用户调研(访谈/问卷) 2. 数据分析(行为/业务) 3. 竞品分析 4. 需求优先级排序(RICE/MoSCoW) 5. PRD文档输出' },
    { q: '产品经理核心能力？', a: '需求管理、项目协调、数据分析、沟通能力、行业理解、商业思维、用户思维' },
    { q: '如何衡量产品成功？', a: '北极星指标+一级指标+二级指标体系。如DAU/MAU、转化率、留存率、NPS、营收等' }
  ],
  'design': [
    { q: '设计一个APP的完整流程？', a: '1. 需求分析 2. 用户研究 3. 信息架构 4. 交互设计 5. 视觉设计 6. 原型设计 7. 用户测试 8. 设计规范' },
    { q: '如何做UI设计？', a: '1. 明确目标用户 2. 竞品调研 3. 设计风格(色彩/字体/图标) 4. 布局与排版 5. 组件设计 6. 可访问性' },
    { q: '用户体验设计原则？', a: '尼尔森10大原则：系统可见性、匹配真实、用户控制、一致性、错误预防、识别而非回忆、灵活高效、美学极简、容错帮助、文档帮助' }
  ],
  'common': [
    { q: '自我介绍', a: '您好，我是XX，毕业于XX大学XX专业，有X年XX经验。擅长XX技术，参与过XX项目，希望在贵公司发挥价值。' },
    { q: '职业规划', a: '短期(1年)：精通业务，成为技术骨干。中期(3年)：向技术专家/架构师方向发展。长期(5年)：技术管理或资深专家。' },
    { q: '项目经验介绍', a: '使用STAR法则：Situation(背景)、Task(任务)、Action(行动)、Result(结果)' },
    { q: '你的优缺点', a: '优点：学习能力强、注重团队、追求卓越。缺点：有时过于追求完美，正在学习平衡效率与质量。' },
    { q: '对我们公司了解多少？', a: '了解公司业务、产品、技术栈、行业地位，表达对公司的兴趣和匹配度。' }
  ]
}

function getPositionGroup(positionKey) {
  for (const group of positionGroups) {
    if (group.positions.some(p => p.key === positionKey)) {
      return group.name
    }
  }
  return null
}

function getPositionLabel(positionKey) {
  for (const group of positionGroups) {
    const pos = group.positions.find(p => p.key === positionKey)
    if (pos) return pos.label
  }
  return ''
}

function generateLearningRoute(positionKey) {
  const skillData = positionSkillMap[positionKey]
  if (!skillData) return null

  const allSkills = []
  for (const [category, skills] of Object.entries(skillData)) {
    for (const skill of skills) {
      allSkills.push({ ...skill, category })
    }
  }

  const mustSkills = allSkills.filter(s => s.level === 'must')
  const preferSkills = allSkills.filter(s => s.level === 'prefer')
  const bonusSkills = allSkills.filter(s => s.level === 'bonus')

  const routes = stageConfig.map(s => ({
    phase: `${s.name}（${s.weeks}）`,
    icon: s.icon,
    color: s.color,
    tasks: []
  }))

  routes[0].tasks = mustSkills.slice(0, Math.ceil(mustSkills.length * 0.3)).map(s => `学习${s.name}基础`)
  routes[1].tasks = mustSkills.slice(Math.ceil(mustSkills.length * 0.3), Math.ceil(mustSkills.length * 0.6)).map(s => `深入${s.name}原理`)
  routes[2].tasks = [...mustSkills.slice(Math.ceil(mustSkills.length * 0.6)).map(s => `掌握${s.name}`), ...preferSkills.slice(0, Math.ceil(preferSkills.length * 0.5)).map(s => `学习${s.name}`)]
  routes[3].tasks = [...preferSkills.slice(Math.ceil(preferSkills.length * 0.5)).map(s => `实战${s.name}`), ...bonusSkills.map(s => `了解${s.name}`), '完成2-3个完整项目', '学习工程化与部署']
  routes[4].tasks = ['系统梳理知识体系', '准备算法面试', '准备技术面试八股文', '模拟面试练习', '简历优化']

  return routes.filter(r => r.tasks.length > 0)
}

function generateSkillList(positionKey) {
  const skillData = positionSkillMap[positionKey]
  if (!skillData) return []

  const result = []
  for (const [category, skills] of Object.entries(skillData)) {
    for (const skill of skills) {
      result.push({
        name: skill.name,
        level: skill.level === 'must' ? '必备' : skill.level === 'prefer' ? '优先' : '加分',
        category
      })
    }
  }
  return result
}

function generateInterviewQuestions(positionKey) {
  const group = getPositionGroup(positionKey)
  let category = 'common'
  
  if (group?.includes('前端')) category = 'frontend'
  else if (group?.includes('后端') || group?.includes('全栈') || group?.includes('数据库')) category = 'backend'
  else if (group?.includes('算法') || group?.includes('AI')) category = positionKey.includes('ai') ? 'ai' : 'algorithm'
  else if (group?.includes('运维')) category = 'devops'
  else if (group?.includes('安全')) category = 'security'
  else if (group?.includes('测试')) category = 'qa'
  else if (group?.includes('移动端')) category = 'mobile'
  else if (group?.includes('产品')) {
    if (positionKey?.includes('design') || positionKey?.includes('ui') || positionKey?.includes('interaction')) {
      category = 'design'
    } else {
      category = 'product'
    }
  } else if (group?.includes('设计')) category = 'design'
  else if (group?.includes('运营')) category = 'product'

  const bank = interviewQuestionsBank[category] || interviewQuestionsBank.common
  return bank
}

module.exports = {
  positionGroups,
  positionSkillMap,
  stageConfig,
  interviewQuestionsBank,
  getPositionGroup,
  getPositionLabel,
  generateLearningRoute,
  generateSkillList,
  generateInterviewQuestions
}
