export const levelLabels = {
  must: '必备',
  prefer: '优先',
  bonus: '加分'
}

export const positionGroups = [
  {
    name: '前端开发',
    positions: [
      { key: 'frontend', label: '前端开发工程师' },
      { key: 'vue-developer', label: 'Vue开发工程师' },
      { key: 'react-developer', label: 'React开发工程师' },
      { key: 'mobile-h5', label: '移动端H5开发' },
      { key: 'web-frontend', label: 'Web前端工程师' }
    ]
  },
  {
    name: '后端开发',
    positions: [
      { key: 'backend-java', label: 'Java后端开发工程师' },
      { key: 'backend-python', label: 'Python后端开发工程师' },
      { key: 'backend-go', label: 'Go后端开发工程师' },
      { key: 'backend-node', label: 'Node.js后端工程师' },
      { key: 'php-developer', label: 'PHP开发工程师' },
      { key: 'ruby-developer', label: 'Ruby开发工程师' }
    ]
  },
  {
    name: '全栈开发',
    positions: [
      { key: 'fullstack', label: '全栈开发工程师' },
      { key: 'fullstack-web', label: 'Web全栈工程师' },
      { key: 'fullstack-mobile', label: '移动全栈工程师' }
    ]
  },
  {
    name: '算法与AI',
    positions: [
      { key: 'algorithm', label: '算法工程师' },
      { key: 'ml-engineer', label: '机器学习工程师' },
      { key: 'ai-engineer', label: '人工智能工程师' },
      { key: 'nlp-engineer', label: 'NLP算法工程师' },
      { key: 'cv-engineer', label: '计算机视觉工程师' },
      { key: '推荐算法', label: '推荐算法工程师' }
    ]
  },
  {
    name: '大数据',
    positions: [
      { key: 'bigdata', label: '大数据开发工程师' },
      { key: 'data-engineer', label: '数据工程师' },
      { key: 'data-analyst', label: '数据分析师' },
      { key: 'etl-engineer', label: 'ETL工程师' },
      { key: 'spark-developer', label: 'Spark开发工程师' }
    ]
  },
  {
    name: '芯片与硬件',
    positions: [
      { key: 'ic-engineer', label: '集成电路工程师' },
      { key: 'ic-design', label: 'IC设计工程师' },
      { key: 'ic-verification', label: 'IC验证工程师' },
      { key: 'fpga-engineer', label: 'FPGA工程师' },
      { key: 'embedded', label: '嵌入式开发工程师' },
      { key: 'hardware', label: '硬件工程师' },
      { key: 'soc-engineer', label: 'SoC设计工程师' }
    ]
  },
  {
    name: '移动端开发',
    positions: [
      { key: 'android', label: 'Android开发工程师' },
      { key: 'ios-developer', label: 'iOS开发工程师' },
      { key: 'flutter', label: 'Flutter开发工程师' },
      { key: 'rn-developer', label: 'React Native工程师' }
    ]
  },
  {
    name: '运维与安全',
    positions: [
      { key: 'devops', label: 'DevOps工程师' },
      { key: 'sre', label: 'SRE工程师' },
      { key: 'cloud', label: '云计算工程师' },
      { key: 'k8s-engineer', label: 'Kubernetes工程师' },
      { key: 'security', label: '安全工程师' },
      { key: 'penetration', label: '渗透测试工程师' },
      { key: 'network', label: '网络工程师' }
    ]
  },
  {
    name: '测试与质量',
    positions: [
      { key: 'qa-engineer', label: '测试工程师' },
      { key: 'autotest', label: '自动化测试工程师' },
      { key: 'perf-test', label: '性能测试工程师' },
      { key: 'test-dev', label: '测试开发工程师' }
    ]
  },
  {
    name: '其他方向',
    positions: [
      { key: 'game-dev', label: '游戏开发工程师' },
      { key: 'game-client', label: '游戏客户端开发' },
      { key: 'game-server', label: '游戏服务器开发' },
      { key: 'blockchain', label: '区块链开发工程师' },
      { key: 'robotics', label: '机器人工程师' },
      { key: 'database', label: '数据库工程师' },
      { key: 'dba', label: 'DBA工程师' },
      { key: 'tech-lead', label: '技术负责人' },
      { key: 'architect', label: '系统架构师' }
    ]
  }
]

export const positionSkillMap = {
  'frontend': {
    '前端核心': [
      { name: 'HTML5/CSS3', level: 'must' },
      { name: 'JavaScript/ES6+', level: 'must' },
      { name: 'DOM操作', level: 'must' },
      { name: '浏览器兼容性', level: 'prefer' }
    ],
    '框架与工具': [
      { name: 'Vue.js', level: 'must' },
      { name: 'React', level: 'must' },
      { name: 'Webpack/Vite', level: 'prefer' },
      { name: 'Git', level: 'must' }
    ],
    '样式与UI': [
      { name: 'CSS预处理器(Sass/Less)', level: 'must' },
      { name: '响应式设计', level: 'prefer' },
      { name: 'Element UI/Ant Design', level: 'prefer' },
      { name: 'Figma/Sketch', level: 'bonus' }
    ],
    '工程化': [
      { name: 'TypeScript', level: 'prefer' },
      { name: 'Vite/Rollup', level: 'prefer' },
      { name: 'ESLint/Prettier', level: 'prefer' },
      { name: 'npm/yarn/pnpm', level: 'must' }
    ]
  },
  'vue-developer': {
    'Vue核心': [
      { name: 'Vue3 Composition API', level: 'must' },
      { name: 'Vue3响应式原理', level: 'must' },
      { name: '虚拟DOM', level: 'prefer' },
      { name: 'Vuex/Pinia', level: 'must' }
    ],
    'Vue生态': [
      { name: 'Vue Router', level: 'must' },
      { name: 'Vue CLI/Vite', level: 'must' },
      { name: 'Element Plus', level: 'must' },
      { name: 'Nuxt.js', level: 'bonus' }
    ],
    '前端基础': [
      { name: 'JavaScript/ES6+', level: 'must' },
      { name: 'HTML5/CSS3', level: 'must' },
      { name: 'CSS3动画', level: 'prefer' }
    ]
  },
  'react-developer': {
    'React核心': [
      { name: 'React Hooks', level: 'must' },
      { name: 'React组件化', level: 'must' },
      { name: 'Context/Redux', level: 'must' },
      { name: 'React Router', level: 'must' }
    ],
    'React生态': [
      { name: 'Next.js', level: 'prefer' },
      { name: 'Material UI/Ant Design', level: 'must' },
      { name: 'React Query/SWR', level: 'prefer' },
      { name: 'Jest/React Testing', level: 'prefer' }
    ],
    '前端基础': [
      { name: 'JavaScript/ES6+', level: 'must' },
      { name: 'TypeScript', level: 'must' },
      { name: 'Webpack/Vite', level: 'prefer' }
    ]
  },
  'mobile-h5': {
    '移动端核心': [
      { name: 'HTML5/CSS3适配', level: 'must' },
      { name: '移动端事件(touch)', level: 'must' },
      { name: '响应式布局', level: 'must' },
      { name: 'Rem/Vw/Vh', level: 'must' }
    ],
    '框架与混合': [
      { name: 'Vue/React', level: 'must' },
      { name: 'Vant/Element Mobile', level: 'must' },
      { name: 'Cordova/Capacitor', level: 'bonus' },
      { name: '小程序开发', level: 'prefer' }
    ]
  },
  'web-frontend': {
    '前端核心': [
      { name: 'HTML5/CSS3', level: 'must' },
      { name: 'JavaScript/ES6+', level: 'must' },
      { name: 'DOM/BOM', level: 'must' },
      { name: 'Ajax/Fetch', level: 'must' }
    ],
    '框架工具': [
      { name: 'Vue/React', level: 'must' },
      { name: 'Webpack/Vite', level: 'prefer' },
      { name: 'Git', level: 'must' }
    ]
  },
  'backend-java': {
    'Java核心': [
      { name: 'Java基础与集合', level: 'must' },
      { name: 'JVM原理', level: 'must' },
      { name: '多线程与并发', level: 'must' },
      { name: 'IO与NIO', level: 'prefer' }
    ],
    'Spring生态': [
      { name: 'Spring Boot', level: 'must' },
      { name: 'Spring Cloud', level: 'must' },
      { name: 'Spring Security', level: 'prefer' },
      { name: 'MyBatis/JPA', level: 'must' }
    ],
    '数据库': [
      { name: 'MySQL', level: 'must' },
      { name: 'Redis', level: 'must' },
      { name: 'MongoDB', level: 'prefer' }
    ],
    '中间件': [
      { name: 'Nginx', level: 'must' },
      { name: 'Kafka/RabbitMQ', level: 'prefer' },
      { name: 'Docker/K8s', level: 'prefer' }
    ]
  },
  'backend-python': {
    'Python核心': [
      { name: 'Python基础', level: 'must' },
      { name: 'Python高级特性', level: 'must' },
      { name: '异步编程(asyncio)', level: 'must' },
      { name: '装饰器/生成器', level: 'prefer' }
    ],
    'Web框架': [
      { name: 'Django', level: 'must' },
      { name: 'Flask', level: 'must' },
      { name: 'FastAPI', level: 'prefer' },
      { name: 'Tornado', level: 'bonus' }
    ],
    '数据库与ORM': [
      { name: 'MySQL/PostgreSQL', level: 'must' },
      { name: 'SQLAlchemy', level: 'must' },
      { name: 'Redis', level: 'must' },
      { name: 'MongoDB', level: 'prefer' }
    ]
  },
  'backend-go': {
    'Go核心': [
      { name: 'Go基础语法', level: 'must' },
      { name: 'Goroutine/Channel', level: 'must' },
      { name: '并发编程', level: 'must' },
      { name: 'GC与内存管理', level: 'prefer' }
    ],
    'Web框架': [
      { name: 'Gin', level: 'must' },
      { name: 'Echo/Beego', level: 'prefer' },
      { name: 'gRPC', level: 'prefer' },
      { name: 'Kitex', level: 'prefer' }
    ],
    '基础设施': [
      { name: 'MySQL/PostgreSQL', level: 'must' },
      { name: 'Redis', level: 'must' },
      { name: 'Docker/K8s', level: 'prefer' },
      { name: 'Prometheus/Grafana', level: 'bonus' }
    ]
  },
  'backend-node': {
    'Node核心': [
      { name: 'Node.js基础', level: 'must' },
      { name: '事件循环', level: 'must' },
      { name: 'Stream/Buffer', level: 'prefer' },
      { name: '模块系统(CommonJS/ESM)', level: 'must' }
    ],
    '框架': [
      { name: 'Express/Koa', level: 'must' },
      { name: 'NestJS', level: 'prefer' },
      { name: 'Egg.js', level: 'prefer' },
      { name: 'Socket.IO', level: 'prefer' }
    ],
    '数据库': [
      { name: 'MongoDB/Mongoose', level: 'must' },
      { name: 'MySQL/Sequelize', level: 'must' },
      { name: 'Redis', level: 'must' }
    ]
  },
  'php-developer': {
    'PHP核心': [
      { name: 'PHP基础语法', level: 'must' },
      { name: 'OOP编程', level: 'must' },
      { name: 'Composer', level: 'must' },
      { name: 'PHP 8.x新特性', level: 'prefer' }
    ],
    '框架': [
      { name: 'Laravel', level: 'must' },
      { name: 'ThinkPHP', level: 'must' },
      { name: 'Symfony', level: 'prefer' },
      { name: 'CodeIgniter', level: 'bonus' }
    ],
    '数据库': [
      { name: 'MySQL', level: 'must' },
      { name: 'Redis', level: 'prefer' },
      { name: 'MongoDB', level: 'bonus' }
    ]
  },
  'ruby-developer': {
    'Ruby核心': [
      { name: 'Ruby基础', level: 'must' },
      { name: 'Ruby元编程', level: 'prefer' },
      { name: 'Bundler', level: 'must' },
      { name: 'RSpec', level: 'prefer' }
    ],
    '框架': [
      { name: 'Ruby on Rails', level: 'must' },
      { name: 'Sinatra', level: 'bonus' }
    ]
  },
  'fullstack': {
    '前端技术': [
      { name: 'Vue.js/React', level: 'must' },
      { name: 'JavaScript/TypeScript', level: 'must' },
      { name: 'HTML5/CSS3', level: 'must' }
    ],
    '后端技术': [
      { name: 'Node.js/Python/Java', level: 'must' },
      { name: 'RESTful API', level: 'must' },
      { name: 'GraphQL', level: 'prefer' }
    ],
    '数据库与运维': [
      { name: 'MySQL/PostgreSQL', level: 'must' },
      { name: 'Redis', level: 'must' },
      { name: 'Docker/K8s', level: 'prefer' },
      { name: 'AWS/阿里云', level: 'prefer' }
    ]
  },
  'fullstack-web': {
    '前端': [
      { name: 'Vue/React', level: 'must' },
      { name: 'Webpack/Vite', level: 'prefer' }
    ],
    '后端': [
      { name: 'Node.js', level: 'must' },
      { name: 'Express/NestJS', level: 'must' },
      { name: 'MySQL', level: 'must' }
    ],
    '全栈工具': [
      { name: 'Next.js/Nuxt', level: 'prefer' },
      { name: 'SSR/SSG', level: 'prefer' },
      { name: 'CI/CD', level: 'prefer' }
    ]
  },
  'fullstack-mobile': {
    '移动端': [
      { name: 'Flutter/React Native', level: 'must' },
      { name: 'iOS/Android原生', level: 'prefer' }
    ],
    '后端': [
      { name: 'Node.js/Go', level: 'must' },
      { name: 'Firebase/后端即服务', level: 'prefer' }
    ]
  },
  'algorithm': {
    '算法基础': [
      { name: '数据结构与算法', level: 'must' },
      { name: '动态规划', level: 'must' },
      { name: '图论算法', level: 'prefer' },
      { name: '复杂度分析', level: 'must' }
    ],
    '编程': [
      { name: 'C++/Java', level: 'must' },
      { name: 'Python', level: 'must' },
      { name: 'LeetCode刷题', level: 'must' }
    ],
    '数学基础': [
      { name: '线性代数', level: 'must' },
      { name: '概率论与数理统计', level: 'must' },
      { name: '离散数学', level: 'prefer' }
    ]
  },
  'ml-engineer': {
    'ML基础': [
      { name: '机器学习算法', level: 'must' },
      { name: '深度学习(DNN/CNN/RNN)', level: 'must' },
      { name: '特征工程', level: 'must' },
      { name: '模型调优', level: 'prefer' }
    ],
    '框架工具': [
      { name: 'TensorFlow/PyTorch', level: 'must' },
      { name: 'Scikit-learn', level: 'must' },
      { name: 'Keras', level: 'prefer' },
      { name: 'XGBoost/LightGBM', level: 'must' }
    ],
    '工程能力': [
      { name: 'Python', level: 'must' },
      { name: '数据处理(Pandas/NumPy)', level: 'must' },
      { name: 'MLflow', level: 'prefer' },
      { name: 'Docker', level: 'prefer' }
    ]
  },
  'ai-engineer': {
    'AI核心': [
      { name: '大语言模型(LLM)', level: 'must' },
      { name: 'Transformer架构', level: 'must' },
      { name: 'Prompt Engineering', level: 'must' },
      { name: 'RAG/微调', level: 'prefer' }
    ],
    'AI框架': [
      { name: 'PyTorch/TensorFlow', level: 'must' },
      { name: 'Hugging Face', level: 'must' },
      { name: 'LangChain', level: 'prefer' },
      { name: 'FastAPI', level: 'must' }
    ],
    '工程化': [
      { name: 'Python', level: 'must' },
      { name: 'CUDA/GPU编程', level: 'prefer' },
      { name: 'Docker/K8s', level: 'prefer' }
    ]
  },
  'nlp-engineer': {
    'NLP核心': [
      { name: '文本预处理', level: 'must' },
      { name: '词向量/BERT', level: 'must' },
      { name: 'Transformer', level: 'must' },
      { name: 'LLM应用', level: 'prefer' }
    ],
    'NLP任务': [
      { name: '命名实体识别', level: 'must' },
      { name: '文本分类/情感分析', level: 'must' },
      { name: '机器翻译', level: 'prefer' },
      { name: '对话系统', level: 'prefer' }
    ],
    '工具': [
      { name: 'PyTorch/TensorFlow', level: 'must' },
      { name: 'Hugging Face', level: 'must' },
      { name: 'NLTK/spaCy', level: 'prefer' }
    ]
  },
  'cv-engineer': {
    'CV核心': [
      { name: '图像处理', level: 'must' },
      { name: '特征提取', level: 'must' },
      { name: 'CNN架构', level: 'must' },
      { name: '目标检测/分割', level: 'must' }
    ],
    'CV模型': [
      { name: 'YOLO/Faster R-CNN', level: 'must' },
      { name: 'ResNet/EfficientNet', level: 'prefer' },
      { name: 'Transformer视觉', level: 'prefer' }
    ],
    '工具': [
      { name: 'PyTorch', level: 'must' },
      { name: 'OpenCV', level: 'must' },
      { name: 'MMDetection', level: 'prefer' }
    ]
  },
  '推荐算法': {
    '推荐基础': [
      { name: '协同过滤', level: 'must' },
      { name: '矩阵分解', level: 'must' },
      { name: '内容推荐', level: 'must' },
      { name: '混合推荐', level: 'prefer' }
    ],
    '深度学习推荐': [
      { name: 'DeepFM/DCN', level: 'prefer' },
      { name: 'Transformer推荐', level: 'prefer' },
      { name: '图神经网络(GNN)', level: 'prefer' }
    ],
    '工程化': [
      { name: 'Spark/Flink', level: 'must' },
      { name: 'TensorFlow/PyTorch', level: 'must' },
      { name: 'Redis缓存', level: 'must' }
    ]
  },
  'bigdata': {
    '大数据核心': [
      { name: 'Hadoop/HDFS', level: 'must' },
      { name: 'MapReduce', level: 'must' },
      { name: 'YARN', level: 'prefer' }
    ],
    '计算引擎': [
      { name: 'Spark', level: 'must' },
      { name: 'Flink', level: 'must' },
      { name: 'Hive', level: 'must' },
      { name: 'Presto/Impala', level: 'prefer' }
    ],
    '数据存储': [
      { name: 'HBase', level: 'must' },
      { name: 'Kafka', level: 'must' },
      { name: 'ClickHouse/Doris', level: 'prefer' }
    ],
    '语言': [
      { name: 'Java/Scala', level: 'must' },
      { name: 'Python', level: 'prefer' }
    ]
  },
  'data-engineer': {
    '数据工程': [
      { name: 'ETL开发', level: 'must' },
      { name: '数据仓库设计', level: 'must' },
      { name: '数据治理', level: 'prefer' },
      { name: '数据血缘', level: 'prefer' }
    ],
    '工具': [
      { name: 'Airflow/DolphinScheduler', level: 'must' },
      { name: 'Spark/Flink', level: 'must' },
      { name: 'Kafka', level: 'must' },
      { name: 'dbt', level: 'prefer' }
    ],
    '存储': [
      { name: 'Hadoop/HDFS', level: 'must' },
      { name: 'S3/OSS', level: 'must' },
      { name: 'Snowflake/BigQuery', level: 'prefer' }
    ]
  },
  'data-analyst': {
    '数据分析': [
      { name: 'SQL', level: 'must' },
      { name: '统计学', level: 'must' },
      { name: '数据可视化', level: 'must' },
      { name: '业务分析', level: 'must' }
    ],
    '工具': [
      { name: 'Python(Pandas)', level: 'must' },
      { name: 'Excel', level: 'must' },
      { name: 'Tableau/Power BI', level: 'prefer' },
      { name: 'Superset/Grafana', level: 'prefer' }
    ]
  },
  'etl-engineer': {
    'ETL工具': [
      { name: 'Kettle/DataX', level: 'must' },
      { name: 'Airflow', level: 'must' },
      { name: 'Spark/Flink', level: 'must' }
    ],
    '数据处理': [
      { name: '数据清洗', level: 'must' },
      { name: '数据转换', level: 'must' },
      { name: '数据同步', level: 'must' }
    ],
    '存储': [
      { name: 'MySQL/Hive', level: 'must' },
      { name: 'Kafka', level: 'prefer' }
    ]
  },
  'spark-developer': {
    'Spark核心': [
      { name: 'Spark SQL', level: 'must' },
      { name: 'Spark Streaming', level: 'must' },
      { name: 'Spark MLlib', level: 'prefer' },
      { name: 'RDD/DataFrame/Dataset', level: 'must' }
    ],
    '开发语言': [
      { name: 'Scala', level: 'must' },
      { name: 'Python(PySpark)', level: 'must' },
      { name: 'Java', level: 'prefer' }
    ]
  },
  'ic-engineer': {
    'IC设计': [
      { name: 'Verilog/VHDL', level: 'must' },
      { name: 'SystemVerilog', level: 'must' },
      { name: 'RTL设计', level: 'must' },
      { name: '逻辑综合', level: 'must' }
    ],
    'EDA工具': [
      { name: 'Synopsys Design Compiler', level: 'must' },
      { name: 'Cadence Genus', level: 'prefer' },
      { name: 'Mentor Graphics', level: 'prefer' }
    ],
    '验证': [
      { name: 'UVM验证方法学', level: 'must' },
      { name: 'SystemC', level: 'prefer' },
      { name: '覆盖率驱动验证', level: 'prefer' }
    ]
  },
  'ic-design': {
    '数字IC设计': [
      { name: 'Verilog/SystemVerilog', level: 'must' },
      { name: 'RTL编码', level: 'must' },
      { name: 'FSM设计', level: 'must' },
      { name: '低功耗设计', level: 'prefer' }
    ],
    '模拟IC': [
      { name: '模拟电路基础', level: 'prefer' },
      { name: 'Cadence Spectre', level: 'bonus' }
    ],
    '实现': [
      { name: '综合/布局布线', level: 'must' },
      { name: '时序分析', level: 'must' },
      { name: '形式验证', level: 'prefer' }
    ]
  },
  'ic-verification': {
    '验证方法学': [
      { name: 'UVM', level: 'must' },
      { name: 'SystemVerilog', level: 'must' },
      { name: '覆盖率驱动验证', level: 'must' },
      { name: '断言验证(SVA)', level: 'prefer' }
    ],
    '验证流程': [
      { name: '验证计划制定', level: 'must' },
      { name: '测试用例编写', level: 'must' },
      { name: 'Bug管理', level: 'must' },
      { name: '回归测试', level: 'prefer' }
    ]
  },
  'fpga-engineer': {
    'FPGA核心': [
      { name: 'Verilog/VHDL', level: 'must' },
      { name: 'FPGA架构(Xilinx/Altera)', level: 'must' },
      { name: '时序约束', level: 'must' },
      { name: 'IP核使用', level: 'prefer' }
    ],
    '开发工具': [
      { name: 'Vivado/Quartus', level: 'must' },
      { name: 'ModelSim', level: 'must' },
      { name: 'Matlab', level: 'prefer' }
    ],
    '应用': [
      { name: '数字信号处理', level: 'must' },
      { name: '图像处理', level: 'prefer' },
      { name: '高速接口(PCIe/USB)', level: 'prefer' }
    ]
  },
  'embedded': {
    '嵌入式核心': [
      { name: 'C/C++', level: 'must' },
      { name: '嵌入式Linux', level: 'must' },
      { name: 'ARM架构', level: 'must' },
      { name: 'RTOS(FreeRTOS等)', level: 'must' }
    ],
    '驱动与系统': [
      { name: 'Linux驱动开发', level: 'must' },
      { name: '设备树(DTS)', level: 'prefer' },
      { name: 'Bootloader(U-Boot)', level: 'must' },
      { name: '内核裁剪', level: 'prefer' }
    ],
    '调试工具': [
      { name: 'JTAG/SWD调试', level: 'must' },
      { name: '示波器/逻辑分析仪', level: 'must' },
      { name: 'GDB', level: 'must' }
    ]
  },
  'hardware': {
    '硬件设计': [
      { name: '原理图设计', level: 'must' },
      { name: 'PCB Layout', level: 'must' },
      { name: '信号完整性', level: 'prefer' },
      { name: '电源完整性', level: 'prefer' }
    ],
    'EDA工具': [
      { name: 'Altium Designer', level: 'must' },
      { name: 'Cadence Allegro', level: 'prefer' },
      { name: 'KiCad', level: 'prefer' }
    ],
    '测试': [
      { name: '硬件调试', level: 'must' },
      { name: '示波器/万用表', level: 'must' },
      { name: 'EMC/EMI测试', level: 'bonus' }
    ]
  },
  'soc-engineer': {
    'SoC设计': [
      { name: 'SoC架构设计', level: 'must' },
      { name: '总线协议(AXI/APB)', level: 'must' },
      { name: 'IP集成', level: 'must' },
      { name: '时钟/复位设计', level: 'prefer' }
    ],
    '验证': [
      { name: '子系统验证', level: 'must' },
      { name: '系统级验证', level: 'prefer' },
      { name: 'FPGA原型验证', level: 'prefer' }
    ]
  },
  'android': {
    'Android核心': [
      { name: 'Java/Kotlin', level: 'must' },
      { name: 'Android SDK', level: 'must' },
      { name: '四大组件', level: 'must' },
      { name: 'Jetpack', level: 'must' }
    ],
    'UI与架构': [
      { name: 'Jetpack Compose', level: 'must' },
      { name: 'MVVM/MVI架构', level: 'must' },
      { name: 'Navigation', level: 'prefer' }
    ],
    '性能优化': [
      { name: '内存优化', level: 'must' },
      { name: '启动优化', level: 'prefer' },
      { name: '卡顿优化', level: 'prefer' }
    ]
  },
  'ios-developer': {
    'iOS核心': [
      { name: 'Swift/Objective-C', level: 'must' },
      { name: 'UIKit/SwiftUI', level: 'must' },
      { name: 'GCD/并发编程', level: 'must' },
      { name: 'CocoaPods/SPM', level: 'must' }
    ],
    'iOS开发': [
      { name: 'iOS生命周期', level: 'must' },
      { name: 'Core Data/SwiftData', level: 'prefer' },
      { name: 'Swift Concurrency', level: 'prefer' }
    ]
  },
  'flutter': {
    'Flutter核心': [
      { name: 'Dart', level: 'must' },
      { name: 'Flutter Widget', level: 'must' },
      { name: '状态管理(Riverpod/Bloc)', level: 'must' },
      { name: '路由与导航', level: 'prefer' }
    ],
    'Flutter进阶': [
      { name: '自定义Widget', level: 'prefer' },
      { name: 'Platform Channel', level: 'prefer' },
      { name: '性能优化', level: 'prefer' }
    ]
  },
  'rn-developer': {
    'React Native': [
      { name: 'JavaScript/TypeScript', level: 'must' },
      { name: 'React Native核心', level: 'must' },
      { name: '原生模块', level: 'prefer' },
      { name: 'Expo', level: 'prefer' }
    ],
    '相关': [
      { name: 'Redux/MobX', level: 'must' },
      { name: '原生iOS/Android', level: 'prefer' }
    ]
  },
  'devops': {
    'CI/CD': [
      { name: 'Jenkins/GitLab CI', level: 'must' },
      { name: 'GitHub Actions', level: 'prefer' },
      { name: 'SonarQube', level: 'prefer' }
    ],
    '容器与编排': [
      { name: 'Docker', level: 'must' },
      { name: 'Kubernetes', level: 'must' },
      { name: 'Helm', level: 'prefer' }
    ],
    '基础设施': [
      { name: 'Linux', level: 'must' },
      { name: 'Ansible/Puppet', level: 'prefer' },
      { name: 'Terraform', level: 'prefer' },
      { name: 'Prometheus/Grafana', level: 'must' }
    ]
  },
  'sre': {
    'SRE核心': [
      { name: 'Site Reliability', level: 'must' },
      { name: 'SLA/SLO/SLI', level: 'must' },
      { name: '故障排查', level: 'must' },
      { name: '容量规划', level: 'prefer' }
    ],
    '工具': [
      { name: '监控系统', level: 'must' },
      { name: '日志系统(ELK/Loki)', level: 'must' },
      { name: '链路追踪(Jaeger)', level: 'prefer' }
    ]
  },
  'cloud': {
    '云计算核心': [
      { name: '虚拟化(KVM/Xen)', level: 'must' },
      { name: '容器技术', level: 'must' },
      { name: '微服务架构', level: 'must' }
    ],
    '云平台': [
      { name: '阿里云/腾讯云', level: 'must' },
      { name: 'AWS', level: 'prefer' },
      { name: 'OpenStack', level: 'prefer' }
    ]
  },
  'k8s-engineer': {
    'K8s核心': [
      { name: 'Kubernetes架构', level: 'must' },
      { name: 'Pod/Service/Deployment', level: 'must' },
      { name: 'ConfigMap/Secret', level: 'must' },
      { name: 'Helm', level: 'must' }
    ],
    'K8s进阶': [
      { name: 'Operator/CRD', level: 'prefer' },
      { name: 'Service Mesh(Istio)', level: 'prefer' },
      { name: 'K8s安全', level: 'prefer' },
      { name: 'K8s性能调优', level: 'prefer' }
    ]
  },
  'security': {
    '安全基础': [
      { name: '网络安全', level: 'must' },
      { name: '密码学基础', level: 'must' },
      { name: '操作系统安全', level: 'must' },
      { name: 'Web安全', level: 'must' }
    ],
    '安全工具': [
      { name: 'Burp Suite', level: 'must' },
      { name: 'Nmap', level: 'must' },
      { name: 'Wireshark', level: 'must' },
      { name: 'Metasploit', level: 'prefer' }
    ],
    '防御': [
      { name: 'WAF/IDS/IPS', level: 'prefer' },
      { name: '代码审计', level: 'prefer' }
    ]
  },
  'penetration': {
    '渗透测试': [
      { name: 'Web渗透', level: 'must' },
      { name: '系统渗透', level: 'must' },
      { name: 'API渗透', level: 'must' },
      { name: '移动端渗透', level: 'prefer' }
    ],
    '技术栈': [
      { name: 'Python渗透', level: 'must' },
      { name: 'Burp Suite', level: 'must' },
      { name: 'SQL注入/XSS', level: 'must' }
    ]
  },
  'network': {
    '网络核心': [
      { name: 'TCP/IP协议', level: 'must' },
      { name: '路由协议(OSPF/BGP)', level: 'must' },
      { name: '交换技术', level: 'must' },
      { name: '网络安全', level: 'prefer' }
    ],
    '设备': [
      { name: '华为/Cisco设备', level: 'must' },
      { name: 'Linux网络配置', level: 'must' },
      { name: 'SDN/NFV', level: 'prefer' }
    ]
  },
  'qa-engineer': {
    '测试核心': [
      { name: '测试理论', level: 'must' },
      { name: '测试用例设计', level: 'must' },
      { name: '缺陷管理', level: 'must' },
      { name: '需求分析', level: 'must' }
    ],
    '工具': [
      { name: 'JMeter/LoadRunner', level: 'must' },
      { name: 'Postman', level: 'must' },
      { name: 'Jira', level: 'must' }
    ],
    '自动化': [
      { name: 'Selenium/Appium', level: 'prefer' },
      { name: '接口自动化', level: 'prefer' }
    ]
  },
  'autotest': {
    '自动化框架': [
      { name: 'Selenium/Cypress', level: 'must' },
      { name: 'Pytest/TestNG', level: 'must' },
      { name: 'Playwright', level: 'prefer' },
      { name: '框架设计', level: 'must' }
    ],
    '编程': [
      { name: 'Python/Java', level: 'must' },
      { name: 'Git/SVN', level: 'must' }
    ]
  },
  'perf-test': {
    '性能测试': [
      { name: 'JMeter', level: 'must' },
      { name: 'LoadRunner', level: 'prefer' },
      { name: 'Gatling', level: 'prefer' }
    ],
    '性能分析': [
      { name: '瓶颈定位', level: 'must' },
      { name: '性能调优', level: 'must' },
      { name: '监控分析', level: 'prefer' }
    ]
  },
  'test-dev': {
    '测试开发': [
      { name: '自动化框架开发', level: 'must' },
      { name: '平台工具开发', level: 'must' },
      { name: 'Java/Python', level: 'must' }
    ],
    'CI/CD': [
      { name: 'Jenkins', level: 'must' },
      { name: 'GitLab CI', level: 'prefer' }
    ]
  },
  'game-dev': {
    '游戏开发': [
      { name: '游戏引擎(Unity/Unreal)', level: 'must' },
      { name: 'C++/C#', level: 'must' },
      { name: '游戏物理', level: 'prefer' },
      { name: '游戏AI', level: 'prefer' }
    ],
    '游戏服务端': [
      { name: '网络编程', level: 'must' },
      { name: '分布式系统', level: 'prefer' }
    ]
  },
  'game-client': {
    '客户端': [
      { name: 'Unity/Unreal Engine', level: 'must' },
      { name: 'C++/C#', level: 'must' },
      { name: '渲染管线', level: 'prefer' },
      { name: 'UI/UX实现', level: 'must' }
    ]
  },
  'game-server': {
    '服务端': [
      { name: 'C++/Go/Java', level: 'must' },
      { name: '网络编程', level: 'must' },
      { name: '高并发', level: 'must' },
      { name: '游戏逻辑', level: 'must' }
    ],
    '分布式': [
      { name: '分布式架构', level: 'prefer' },
      { name: 'Redis/MySQL', level: 'must' }
    ]
  },
  'blockchain': {
    '区块链核心': [
      { name: '共识算法', level: 'must' },
      { name: '智能合约', level: 'must' },
      { name: '密码学', level: 'must' },
      { name: 'P2P网络', level: 'prefer' }
    ],
    '技术栈': [
      { name: 'Solidity', level: 'must' },
      { name: 'Go/Rust', level: 'must' },
      { name: 'Ethereum/Hyperledger', level: 'must' }
    ]
  },
  'robotics': {
    '机器人核心': [
      { name: 'ROS/ROS2', level: 'must' },
      { name: 'C++/Python', level: 'must' },
      { name: '运动控制', level: 'must' },
      { name: 'SLAM', level: 'prefer' }
    ],
    '感知与决策': [
      { name: '计算机视觉', level: 'must' },
      { name: '机器学习', level: 'prefer' },
      { name: '路径规划', level: 'must' }
    ]
  },
  'database': {
    '数据库核心': [
      { name: 'MySQL/PostgreSQL', level: 'must' },
      { name: '索引优化', level: 'must' },
      { name: 'SQL调优', level: 'must' },
      { name: '事务与锁', level: 'must' }
    ],
    '分布式': [
      { name: '分布式数据库', level: 'prefer' },
      { name: '分库分表', level: 'must' },
      { name: 'TiDB/CockroachDB', level: 'prefer' }
    ]
  },
  'dba': {
    'DBA核心': [
      { name: '数据库安装部署', level: 'must' },
      { name: '备份恢复', level: 'must' },
      { name: '性能调优', level: 'must' },
      { name: '高可用方案', level: 'must' }
    ],
    '监控': [
      { name: '数据库监控', level: 'must' },
      { name: '慢查询分析', level: 'must' },
      { name: '空间管理', level: 'prefer' }
    ]
  },
  'tech-lead': {
    '技术管理': [
      { name: '技术规划', level: 'must' },
      { name: '团队管理', level: 'must' },
      { name: '项目管理', level: 'must' },
      { name: '技术选型', level: 'must' }
    ],
    '技术深度': [
      { name: '系统架构', level: 'must' },
      { name: '代码评审', level: 'must' },
      { name: '技术分享', level: 'prefer' }
    ]
  },
  'architect': {
    '架构设计': [
      { name: '分布式架构', level: 'must' },
      { name: '微服务', level: 'must' },
      { name: '高可用设计', level: 'must' },
      { name: '可扩展性设计', level: 'must' }
    ],
    '技术视野': [
      { name: '多技术栈', level: 'must' },
      { name: '行业理解', level: 'must' },
      { name: '技术趋势', level: 'prefer' }
    ]
  }
}

export const stageConfig = [
  {
    id: 'intro',
    name: '入门阶段',
    icon: '🌱',
    color: '#5eead4',
    desc: '了解行业基础概念，搭建学习环境',
    weeks: '1-2周',
    skills: []
  },
  {
    id: 'basic',
    name: '基础阶段',
    icon: '📘',
    color: '#7ab8ff',
    desc: '掌握核心语法和基础工具使用',
    weeks: '3-6周',
    skills: []
  },
  {
    id: 'advanced',
    name: '进阶阶段',
    icon: '🚀',
    color: '#c084fc',
    desc: '深入理解原理，掌握框架和最佳实践',
    weeks: '7-12周',
    skills: []
  },
  {
    id: 'practical',
    name: '实战阶段',
    icon: '🛠️',
    color: '#fbbf24',
    desc: '参与真实项目，积累工程经验',
    weeks: '13-18周',
    skills: []
  },
  {
    id: 'interview',
    name: '面试阶段',
    icon: '🎯',
    color: '#ff8a8a',
    desc: '技术面试准备，系统梳理知识体系',
    weeks: '19-20周',
    skills: []
  }
]

export function generateLearningRoute(positionKey) {
  const skillData = positionSkillMap[positionKey]
  if (!skillData) return []

  const allSkills = []
  for (const [category, skills] of Object.entries(skillData)) {
    for (const skill of skills) {
      allSkills.push({ ...skill, category })
    }
  }

  const mustSkills = allSkills.filter(s => s.level === 'must')
  const preferSkills = allSkills.filter(s => s.level === 'prefer')
  const bonusSkills = allSkills.filter(s => s.level === 'bonus')

  const stages = JSON.parse(JSON.stringify(stageConfig))

  stages[0].skills = [
    ...mustSkills.slice(0, Math.ceil(mustSkills.length * 0.2)),
    ...preferSkills.slice(0, Math.ceil(preferSkills.length * 0.1))
  ]

  stages[1].skills = [
    ...mustSkills.slice(Math.ceil(mustSkills.length * 0.2), Math.ceil(mustSkills.length * 0.55)),
    ...preferSkills.slice(0, Math.ceil(preferSkills.length * 0.3))
  ]

  stages[2].skills = [
    ...mustSkills.slice(Math.ceil(mustSkills.length * 0.55)),
    ...preferSkills.slice(Math.ceil(preferSkills.length * 0.3), Math.ceil(preferSkills.length * 0.75))
  ]

  stages[3].skills = [
    ...preferSkills.slice(Math.ceil(preferSkills.length * 0.75)),
    ...bonusSkills.slice(0, Math.ceil(bonusSkills.length * 0.6))
  ]

  stages[4].skills = [
    ...bonusSkills.slice(Math.ceil(bonusSkills.length * 0.6)),
    ...mustSkills.slice(0, Math.ceil(mustSkills.length * 0.2)).map(s => ({ ...s, name: s.name + '（面试高频）' }))
  ]

  return stages
}

export function getPositionLabel(positionKey) {
  for (const group of positionGroups) {
    const pos = group.positions.find(p => p.key === positionKey)
    if (pos) return pos.label
  }
  return ''
}
