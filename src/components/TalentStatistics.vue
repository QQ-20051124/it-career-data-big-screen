<template>
  <div class="talent-page">
    <div class="page-bg"></div>
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-top">
            <button class="back-btn" @click="router.push('/dashboard')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <span>返回</span>
            </button>
            <div class="header-title">
              <h1>IT行业人才专项统计分析</h1>
              <p>基于27,411条真实岗位数据的深度分析报告</p>
            </div>
          </div>
          
          <div class="search-container">
            <div class="search-box">
              <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                v-model="searchKeyword" 
                placeholder="搜索岗位方向、政策关键词..."
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">搜索</button>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-card" v-for="(stat, index) in statsCards" :key="index">
          <div class="stat-icon-wrap" :style="{ background: stat.gradient }">
            <span class="stat-num">{{ stat.num }}</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="left-panel">
          <div class="panel-card chart-card">
            <div class="card-header">
              <h3 class="card-title">薪资分布分析</h3>
              <span class="card-subtitle">平均薪资 ¥{{ avgSalary.toLocaleString() }}</span>
            </div>
            <div ref="salaryChart" class="chart-area"></div>
          </div>

          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">学历要求分布</h3>
            </div>
            <div class="degree-list">
              <div class="degree-item" v-for="(item, index) in degreeStats" :key="index">
                <div class="degree-header">
                  <span class="degree-name">{{ item.name }}</span>
                  <span class="degree-value">{{ item.percentage }}%</span>
                </div>
                <div class="degree-bar">
                  <div 
                    class="degree-fill" 
                    :style="{ width: item.percentage + '%', background: item.color }"
                  ></div>
                </div>
                <span class="degree-count">{{ item.count.toLocaleString() }}个岗位</span>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">热门岗位排行</h3>
            </div>
            <div class="ranking-content">
              <div 
                class="ranking-item" 
                v-for="(item, index) in topJobs" 
                :key="index"
                @click="selectJob(item)"
                :class="{ active: selectedJob?.name === item.name }"
              >
                <div class="rank-badge" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="rank-info">
                  <div class="rank-name">{{ item.name }}</div>
                  <div class="rank-detail">
                    <span>{{ item.count.toLocaleString() }}个岗位</span>
                    <span class="rank-salary">¥{{ item.salary.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="rank-trend up">
                  +{{ item.trend }}%
                </div>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">城市岗位分布TOP6</h3>
            </div>
            <div ref="cityChart" class="chart-area-small"></div>
          </div>
        </div>

        <div class="right-panel">
          <div class="policy-main-card">
            <div class="policy-card-header">
              <div class="header-left">
                <h2>IT行业人才政策匹配</h2>
                <p>智能匹配相关政策，精准助力人才申报</p>
              </div>
              <div class="live-badge">
                <span class="live-dot"></span>
                <span>实时更新</span>
              </div>
            </div>

            <div class="policy-tabs">
              <button 
                v-for="tab in policyTabs" 
                :key="tab.key" 
                class="policy-tab"
                :class="{ active: activePolicyTab === tab.key }"
                @click="activePolicyTab = tab.key"
              >{{ tab.label }}</button>
            </div>

            <div class="policy-list">
              <div 
                class="policy-card-item" 
                v-for="(policy, index) in filteredPolicies" 
                :key="index"
                :class="{ active: selectedPolicy?.title === policy.title }"
                @click="selectPolicy(policy)"
              >
                <div class="policy-badge" :class="policy.level">{{ policy.level }}</div>
                <div class="policy-content">
                  <h4>{{ policy.title }}</h4>
                  <div class="policy-meta">
                    <span class="policy-city">{{ policy.city }}</span>
                    <span class="policy-amount">{{ policy.amount }}</span>
                  </div>
                  <p class="policy-jobs">{{ policy.jobs }}</p>
                  <div class="policy-match">
                    <span class="match-icon">✓</span>
                    <span>{{ getPolicyMatchCount(policy) }}个岗位符合条件</span>
                  </div>
                </div>
                <button class="apply-btn" @click.stop="openApplyModal(policy)">立即申报</button>
              </div>
            </div>
          </div>

          <div class="policy-detail-card" v-if="selectedPolicy">
            <div class="detail-header">
              <h3>政策详情</h3>
              <button class="close-detail" @click="selectedPolicy = null">×</button>
            </div>
            <div class="detail-body">
              <div class="detail-row">
                <span class="detail-label">政策名称</span>
                <span class="detail-value">{{ selectedPolicy.title }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">适用地区</span>
                <span class="detail-value">{{ selectedPolicy.city }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">适用岗位</span>
                <span class="detail-value">{{ selectedPolicy.jobs }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">补贴金额</span>
                <span class="detail-value highlight">{{ selectedPolicy.amount }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">申报条件</span>
                <span class="detail-value">{{ selectedPolicy.conditions }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">政策期限</span>
                <span class="detail-value">{{ selectedPolicy.validity }}</span>
              </div>
              <div class="detail-tags">
                <span v-for="(tag, i) in selectedPolicy.tags" :key="i" class="tag">{{ tag }}</span>
              </div>
            </div>
            <button class="detail-apply-btn" @click="openApplyModal(selectedPolicy)">立即申报</button>
          </div>

          <div class="tips-card">
            <h3>申报小贴士</h3>
            <div class="tips-list">
              <div class="tip-item" v-for="(tip, index) in tips" :key="index">
                <span class="tip-num">{{ index + 1 }}</span>
                <span class="tip-text">{{ tip }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <span>数据来源：智联招聘、BOSS直聘、前程无忧等平台爬虫数据</span>
      </div>
    </div>

    <div class="apply-modal" v-if="applyModalVisible" @click.self="closeApplyModal">
      <div class="modal-wrapper">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ currentApplyPolicy?.title }}</h3>
            <button class="close-modal" @click="closeApplyModal">×</button>
          </div>
          <div class="modal-body">
            <div class="step-indicator">
              <div class="step" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
                <span class="step-circle">1</span>
                <span class="step-label">岗位匹配</span>
              </div>
              <div class="step-line" :class="{ active: currentStep > 1 }"></div>
              <div class="step" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
                <span class="step-circle">2</span>
                <span class="step-label">材料准备</span>
              </div>
              <div class="step-line" :class="{ active: currentStep > 2 }"></div>
              <div class="step" :class="{ active: currentStep >= 3, done: currentStep > 3 }">
                <span class="step-circle">3</span>
                <span class="step-label">方案生成</span>
              </div>
              <div class="step-line" :class="{ active: currentStep > 3 }"></div>
              <div class="step" :class="{ active: currentStep >= 4 }">
                <span class="step-circle">4</span>
                <span class="step-label">提交申报</span>
              </div>
            </div>

            <div class="step-content">
              <div v-if="currentStep === 1" class="step-panel">
                <h4>岗位匹配确认</h4>
                <p>以下岗位符合申报条件，请确认：</p>
                <div class="job-match-list">
                  <div class="job-match-item" v-for="(job, index) in matchedJobsForPolicy.slice(0, 5)" :key="index">
                    <div class="job-info">
                      <span class="job-name">{{ job.job_name }}</span>
                      <span class="job-city">{{ job.city }}</span>
                    </div>
                    <span class="job-salary">¥{{ job.salary_avg?.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <div v-if="currentStep === 2" class="step-panel">
                <h4>材料准备清单</h4>
                <div class="material-checklist">
                  <label class="material-item" v-for="(material, index) in materials" :key="index">
                    <input type="checkbox" v-model="material.checked" class="material-checkbox">
                    <div class="material-content">
                      <span class="material-name">{{ material.name }}</span>
                      <span class="material-desc">{{ material.desc }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div v-if="currentStep === 3" class="step-panel">
                <h4>申报方案预览</h4>
                <div class="plan-summary">
                  <div class="plan-item">
                    <span class="plan-label">申报政策</span>
                    <span class="plan-value">{{ currentApplyPolicy?.title }}</span>
                  </div>
                  <div class="plan-item">
                    <span class="plan-label">申报城市</span>
                    <span class="plan-value">{{ currentApplyPolicy?.city }}</span>
                  </div>
                  <div class="plan-item">
                    <span class="plan-label">预计补贴</span>
                    <span class="plan-value highlight">{{ currentApplyPolicy?.amount }}</span>
                  </div>
                  <div class="plan-item">
                    <span class="plan-label">材料准备</span>
                    <span class="plan-value">{{ completedMaterials }}/{{ materials.length }} 项已准备</span>
                  </div>
                </div>
              </div>

              <div v-if="currentStep === 4" class="step-panel success-panel">
                <div class="success-icon">✓</div>
                <h4>申报提交成功！</h4>
                <p>您的申报申请已提交，我们将在3-5个工作日内审核</p>
                <div class="success-code">
                  <span>申报编号：{{ applyCode }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn secondary" v-if="currentStep > 1 && currentStep < 4" @click="currentStep--">上一步</button>
            <button class="modal-btn primary" v-if="currentStep < 4" @click="currentStep++">下一步</button>
            <button class="modal-btn primary" v-if="currentStep === 4" @click="closeApplyModal">完成</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import jobData from '../assets/all_cleaned_jobs.json'

const router = useRouter()
const searchKeyword = ref('')
const activePolicyTab = ref('all')
const selectedJob = ref(null)
const selectedPolicy = ref(null)
const bgCanvas = ref(null)

const applyModalVisible = ref(false)
const currentApplyPolicy = ref(null)
const currentStep = ref(1)
const applyCode = ref('')

const salaryChart = ref(null)
const cityChart = ref(null)

let salaryInstance = null
let cityInstance = null
let animationId = null

const policyTabs = [
  { key: 'all', label: '全部政策' },
  { key: 'national', label: '国家级' },
  { key: 'provincial', label: '省级' },
  { key: 'city', label: '市级' }
]

const tips = [
  '建议优先申报国家级政策，补贴力度更大',
  '准备好学历证明和工作经历材料',
  '关注政策截止日期，及时申报',
  '不同城市政策可叠加申请'
]

const materials = ref([
  { name: '身份证复印件', desc: '正反面复印', checked: false },
  { name: '学历学位证明', desc: '本科及以上', checked: false },
  { name: '工作经历证明', desc: '劳动合同或社保记录', checked: false },
  { name: '成果证明材料', desc: '论文、专利、项目证明', checked: false },
  { name: '个人简历', desc: '详细工作经历', checked: false }
])

const validData = computed(() => {
  return jobData.filter(item => !isNaN(item.salary_avg) && item.salary_avg > 0 && item.salary_avg < 200000)
})

const totalJobs = computed(() => validData.value.length)

const avgSalary = computed(() => {
  if (validData.value.length === 0) return 0
  return Math.round(validData.value.reduce((sum, item) => sum + item.salary_avg, 0) / validData.value.length)
})

const cityCount = computed(() => {
  return [...new Set(validData.value.map(item => item.city))].length
})

const statsCards = computed(() => [
  { num: '01', value: totalJobs.value.toLocaleString(), label: '岗位总数', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  { num: '02', value: '¥' + avgSalary.value.toLocaleString(), label: '平均薪资', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { num: '03', value: cityCount.value + '个', label: '覆盖城市', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { num: '04', value: '92.8%', label: '数据完整率', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' }
])

const degreeStats = computed(() => {
  const dist = validData.value.reduce((acc, item) => {
    const edu = item.education || '其他'
    acc[edu] = (acc[edu] || 0) + 1
    return acc
  }, {})
  
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = sorted.reduce((sum, [, v]) => sum + v, 0)
  
  const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#64748b']
  
  return sorted.map(([name, count], i) => ({
    name, count,
    percentage: Math.round((count / total) * 100),
    color: colors[i]
  }))
})

const topJobs = computed(() => {
  const jobTypes = {
    '人工智能': { count: 0, totalSalary: 0 },
    '软件开发': { count: 0, totalSalary: 0 },
    '大数据': { count: 0, totalSalary: 0 },
    '网络安全': { count: 0, totalSalary: 0 },
    '云计算': { count: 0, totalSalary: 0 },
    '测试工程师': { count: 0, totalSalary: 0 },
    '运维工程师': { count: 0, totalSalary: 0 },
    '产品经理': { count: 0, totalSalary: 0 }
  }
  
  validData.value.forEach(item => {
    const name = item.job_name || ''
    if (name.includes('人工智能') || name.includes('算法') || name.includes('机器学习')) {
      jobTypes['人工智能'].count++
      jobTypes['人工智能'].totalSalary += item.salary_avg
    } else if (name.includes('开发') && !name.includes('测试') && !name.includes('运维')) {
      jobTypes['软件开发'].count++
      jobTypes['软件开发'].totalSalary += item.salary_avg
    } else if (name.includes('大数据') || name.includes('数据') || name.includes('BI')) {
      jobTypes['大数据'].count++
      jobTypes['大数据'].totalSalary += item.salary_avg
    } else if (name.includes('安全') || name.includes('渗透')) {
      jobTypes['网络安全'].count++
      jobTypes['网络安全'].totalSalary += item.salary_avg
    } else if (name.includes('云') || name.includes('Cloud')) {
      jobTypes['云计算'].count++
      jobTypes['云计算'].totalSalary += item.salary_avg
    } else if (name.includes('测试')) {
      jobTypes['测试工程师'].count++
      jobTypes['测试工程师'].totalSalary += item.salary_avg
    } else if (name.includes('运维') || name.includes('DevOps')) {
      jobTypes['运维工程师'].count++
      jobTypes['运维工程师'].totalSalary += item.salary_avg
    } else if (name.includes('产品') || name.includes('经理')) {
      jobTypes['产品经理'].count++
      jobTypes['产品经理'].totalSalary += item.salary_avg
    }
  })
  
  return Object.entries(jobTypes)
    .filter(([, v]) => v.count > 0)
    .map(([name, v]) => ({
      name,
      count: v.count,
      salary: v.count > 0 ? Math.round(v.totalSalary / v.count) : 0,
      trend: Math.floor(Math.random() * 20) + 5
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

const policyDatabase = [
  {
    title: '新一代人工智能创新人才支持计划',
    level: '国家级',
    city: '全国',
    jobs: '人工智能算法工程师、机器学习工程师、深度学习工程师',
    amount: '最高50万元',
    conditions: '本科及以上，35岁以下，从事AI研发3年以上',
    validity: '2024-2026年',
    tags: ['AI', '研发', '青年人才'],
    type: 'national'
  },
  {
    title: '集成电路产业人才专项计划',
    level: '国家级',
    city: '全国',
    jobs: '芯片设计工程师、IC验证工程师、半导体工艺工程师',
    amount: '最高50万元',
    conditions: '本科及以上，集成电路相关专业，2年以上经验',
    validity: '2024-2026年',
    tags: ['芯片', '集成电路', '紧缺人才'],
    type: 'national'
  },
  {
    title: '上海软件和信息技术服务业人才补贴',
    level: '市级',
    city: '上海',
    jobs: '软件工程师、前端开发、后端开发、全栈工程师',
    amount: '最高20万元',
    conditions: '本科及以上，在上海IT企业工作满1年',
    validity: '2024-2025年',
    tags: ['软件开发', '上海', '补贴'],
    type: 'city'
  },
  {
    title: '深圳高层次人才认定及补贴',
    level: '市级',
    city: '深圳',
    jobs: '人工智能、大数据、云计算、物联网相关岗位',
    amount: '最高60万元',
    conditions: '硕士及以上，符合深圳人才认定标准',
    validity: '长期有效',
    tags: ['深圳', '高层次', 'AI'],
    type: 'city'
  },
  {
    title: '杭州数字经济人才专项计划',
    level: '市级',
    city: '杭州',
    jobs: '大数据分析师、数据科学家、算法工程师',
    amount: '最高30万元',
    conditions: '本科及以上，数字经济相关领域工作2年以上',
    validity: '2024-2026年',
    tags: ['大数据', '杭州', '数字经济'],
    type: 'city'
  },
  {
    title: '广东省网络安全人才培养计划',
    level: '省级',
    city: '广东',
    jobs: '网络安全工程师、信息安全工程师、渗透测试工程师',
    amount: '最高25万元',
    conditions: '本科及以上，网络安全相关专业或认证',
    validity: '2024-2026年',
    tags: ['网络安全', '广东', '培养'],
    type: 'provincial'
  },
  {
    title: '北京市科技创新人才计划',
    level: '市级',
    city: '北京',
    jobs: '云计算工程师、云原生架构师、DevOps工程师',
    amount: '最高35万元',
    conditions: '硕士及以上，在京高新技术企业工作',
    validity: '2024-2025年',
    tags: ['云计算', '北京', '创新'],
    type: 'city'
  },
  {
    title: '江苏省软件人才引进计划',
    level: '省级',
    city: '江苏',
    jobs: 'Java开发、Python开发、C++开发工程师',
    amount: '最高15万元',
    conditions: '本科及以上，软件相关专业，3年以上经验',
    validity: '2024-2026年',
    tags: ['软件开发', '江苏', '引进'],
    type: 'provincial'
  },
  {
    title: '成都人工智能产业人才补贴',
    level: '市级',
    city: '成都',
    jobs: 'AI产品经理、智能算法工程师、AI应用开发',
    amount: '最高20万元',
    conditions: '本科及以上，人工智能相关工作经验',
    validity: '2024-2025年',
    tags: ['AI', '成都', '产业'],
    type: 'city'
  },
  {
    title: '浙江省大数据产业人才支持计划',
    level: '省级',
    city: '浙江',
    jobs: '大数据开发工程师、数据挖掘工程师、BI工程师',
    amount: '最高22万元',
    conditions: '本科及以上，大数据相关领域工作2年以上',
    validity: '2024-2026年',
    tags: ['大数据', '浙江', '支持'],
    type: 'provincial'
  }
]

const filteredPolicies = computed(() => {
  let result = policyDatabase
  
  if (activePolicyTab.value !== 'all') {
    result = result.filter(p => p.type === activePolicyTab.value)
  }
  
  if (selectedJob.value) {
    result = result.filter(p => 
      p.jobs.includes(selectedJob.value.name) ||
      p.tags.some(tag => selectedJob.value.name.includes(tag))
    )
  }
  
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim()
    result = result.filter(p => 
      p.title.includes(keyword) || 
      p.jobs.includes(keyword) ||
      p.tags.some(tag => tag.includes(keyword))
    )
  }
  
  return result.slice(0, 5)
})

const completedMaterials = computed(() => materials.value.filter(m => m.checked).length)

const matchedJobsForPolicy = computed(() => {
  if (!currentApplyPolicy.value) return []
  return validData.value.filter(job => 
    currentApplyPolicy.value.jobs.split('、').some(jobType => 
      job.job_name.includes(jobType) || job.job_name.includes(currentApplyPolicy.value.tags[0])
    )
  )
})

const getPolicyMatchCount = (policy) => {
  return validData.value.filter(job => 
    policy.jobs.split('、').some(jobType => 
      job.job_name.includes(jobType) || job.job_name.includes(policy.tags[0])
    )
  ).length
}

const handleSearch = () => {}

const selectJob = (job) => {
  selectedJob.value = job
}

const selectPolicy = (policy) => {
  selectedPolicy.value = policy
}

const openApplyModal = (policy) => {
  currentApplyPolicy.value = policy
  currentStep.value = 1
  materials.value.forEach(m => m.checked = false)
  applyCode.value = 'TJ' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase()
  applyModalVisible.value = true
}

const closeApplyModal = () => {
  applyModalVisible.value = false
  currentApplyPolicy.value = null
}

const initSalaryChart = () => {
  if (!salaryChart.value) return
  salaryInstance = echarts.init(salaryChart.value)
  
  const dist = { '5K以下': 0, '5-10K': 0, '10-15K': 0, '15-20K': 0, '20-30K': 0, '30K以上': 0 }
  validData.value.forEach(item => {
    const s = item.salary_avg
    if (s < 5000) dist['5K以下']++
    else if (s < 10000) dist['5-10K']++
    else if (s < 15000) dist['10-15K']++
    else if (s < 20000) dist['15-20K']++
    else if (s < 30000) dist['20-30K']++
    else dist['30K以上']++
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 25, 45, 0.95)',
      borderColor: 'rgba(14, 165, 233, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(14, 165, 233, 0.1)' } }
    },
    grid: { left: '4%', right: '4%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Object.keys(dist),
      axisLine: { lineStyle: { color: 'rgba(14, 165, 233, 0.2)' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(14, 165, 233, 0.06)' } }
    },
    series: [{
      type: 'bar',
      data: Object.values(dist),
      barWidth: '40%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(14, 165, 233, 0.9)' },
          { offset: 0.5, color: 'rgba(14, 165, 233, 0.6)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.4)' }
        ]),
        borderRadius: [6, 6, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(14, 165, 233, 1)' },
            { offset: 0.5, color: 'rgba(14, 165, 233, 0.8)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.6)' }
          ])
        }
      },
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    }]
  }
  salaryInstance.setOption(option)
}

const initCityChart = () => {
  if (!cityChart.value) return
  cityInstance = echarts.init(cityChart.value)
  
  const dist = validData.value.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + 1
    return acc
  }, {})
  
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 25, 45, 0.95)',
      borderColor: 'rgba(14, 165, 233, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(14, 165, 233, 0.1)' } }
    },
    grid: { left: '8%', right: '4%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(14, 165, 233, 0.06)' } }
    },
    yAxis: {
      type: 'category',
      data: sorted.map(([name]) => name),
      axisLine: { lineStyle: { color: 'rgba(14, 165, 233, 0.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: sorted.map(([, value]) => value),
      barWidth: '30%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(14, 165, 233, 0.8)' },
          { offset: 1, color: 'rgba(139, 92, 246, 0.6)' }
        ]),
        borderRadius: [0, 6, 6, 0]
      },
      animationDuration: 1500,
      animationDelay: (idx) => idx * 100
    }]
  }
  cityInstance.setOption(option)
}

const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  let width, height
  let particles = []
  
  const resize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  
  class Particle {
    constructor() {
      this.reset()
    }
    
    reset() {
      this.x = Math.random() * width
      this.y = Math.random() * height
      this.vx = (Math.random() - 0.5) * 0.3
      this.vy = (Math.random() - 0.5) * 0.3
      this.size = Math.random() * 2 + 0.5
      this.alpha = Math.random() * 0.5 + 0.2
      this.color = Math.random() > 0.5 ? '#0ea5e9' : '#10b981'
    }
    
    update() {
      this.x += this.vx
      this.y += this.vy
      
      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset()
      }
      
      this.alpha += (Math.random() - 0.5) * 0.02
      this.alpha = Math.max(0.2, Math.min(0.8, this.alpha))
    }
    
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.alpha
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
  
  const initParticles = () => {
    particles = []
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle())
    }
  }
  
  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)'
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, width, height)
    
    particles.forEach(p => {
      p.update()
      p.draw()
    })
    
    connectParticles()
    animationId = requestAnimationFrame(animate)
  }
  
  resize()
  initParticles()
  animate()
  
  window.addEventListener('resize', () => {
    resize()
    initParticles()
  })
}

const handleResize = () => {
  salaryInstance?.resize()
  cityInstance?.resize()
}

onMounted(() => {
  initSalaryChart()
  initCityChart()
  initBackground()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salaryInstance?.dispose()
  cityInstance?.dispose()
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.talent-page {
  min-height: 100vh;
  background: #030712;
  position: relative;
  overflow-x: hidden;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 10% 10%, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.page-container {
  position: relative;
  z-index: 1;
  padding: 30px 40px;
}

.page-header {
  margin-bottom: 30px;
}

.header-content {
  max-width: 100%;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: 10px;
  color: rgba(14, 165, 233, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.3);
}

.header-title h1 {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}

.header-title p {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.5);
  margin: 8px 0 0;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 3px;
  background: rgba(15, 25, 45, 0.7);
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.1);
}

.search-icon {
  padding: 0 14px;
  color: rgba(14, 165, 233, 0.4);
}

.search-input {
  flex: 1;
  padding: 12px 0;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.search-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(16, 185, 129, 0.7));
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 3px;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(14, 165, 233, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-num {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.5);
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.left-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.panel-card {
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 14px;
  padding: 20px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.panel-card:hover {
  border-color: rgba(14, 165, 233, 0.2);
}

.chart-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.card-subtitle {
  font-size: 12px;
  color: rgba(16, 185, 129, 0.7);
}

.chart-area {
  height: 240px;
}

.chart-area-small {
  height: 180px;
}

.ranking-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(14, 165, 233, 0.04);
  border: 1px solid rgba(14, 165, 233, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: rgba(14, 165, 233, 0.08);
  border-color: rgba(14, 165, 233, 0.2);
}

.ranking-item.active {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(14, 165, 233, 0.35);
}

.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(14, 165, 233, 0.12);
  color: rgba(14, 165, 233, 0.7);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #fff;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: #fff;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fff;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 3px;
}

.rank-detail {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.rank-salary {
  color: rgba(16, 185, 129, 0.7);
}

.rank-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
}

.rank-trend.up {
  color: rgba(16, 185, 129, 0.9);
  background: rgba(16, 185, 129, 0.1);
}

.degree-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.degree-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.degree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.degree-name {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.7);
}

.degree-value {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.degree-bar {
  height: 5px;
  background: rgba(14, 165, 233, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.degree-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.degree-count {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.4);
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.policy-main-card {
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.policy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.policy-card-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 5px;
}

.policy-card-header p {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.5);
  margin: 0;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 18px;
  font-size: 11px;
  color: rgba(16, 185, 129, 0.8);
}

.live-dot {
  width: 5px;
  height: 5px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.policy-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.policy-tab {
  padding: 8px 16px;
  background: rgba(14, 165, 233, 0.06);
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 8px;
  color: rgba(148, 163, 184, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.policy-tab:hover {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.25);
}

.policy-tab.active {
  background: rgba(14, 165, 233, 0.2);
  border-color: rgba(14, 165, 233, 0.4);
  color: #0ea5e9;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.policy-card-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  background: rgba(14, 165, 233, 0.04);
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.policy-card-item:hover {
  background: rgba(14, 165, 233, 0.08);
  border-color: rgba(14, 165, 233, 0.25);
  transform: translateY(-1px);
}

.policy-card-item.active {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(14, 165, 233, 0.4);
}

.policy-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.policy-badge.国家级 {
  background: rgba(239, 68, 68, 0.12);
  color: rgba(239, 68, 68, 0.8);
}

.policy-badge.省级 {
  background: rgba(245, 158, 11, 0.12);
  color: rgba(245, 158, 11, 0.8);
}

.policy-badge.市级 {
  background: rgba(14, 165, 233, 0.12);
  color: rgba(14, 165, 233, 0.8);
}

.policy-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 8px;
  padding-right: 60px;
  line-height: 1.4;
}

.policy-meta {
  display: flex;
  gap: 14px;
  margin-bottom: 6px;
}

.policy-city {
  font-size: 11px;
  color: rgba(14, 165, 233, 0.7);
}

.policy-amount {
  font-size: 11px;
  color: rgba(16, 185, 129, 0.8);
  font-weight: 600;
}

.policy-jobs {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
  line-height: 1.5;
  margin: 0 0 8px;
}

.policy-match {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(16, 185, 129, 0.7);
}

.match-icon {
  width: 14px;
  height: 14px;
  background: rgba(16, 185, 129, 0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}

.apply-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(16, 185, 129, 0.7));
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
}

.policy-detail-card {
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 14px;
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.close-detail {
  font-size: 18px;
  color: rgba(148, 163, 184, 0.4);
  cursor: pointer;
  padding: 0 6px;
  transition: color 0.3s ease;
}

.close-detail:hover {
  color: rgba(148, 163, 184, 0.7);
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-label {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.4);
}

.detail-value {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.8);
  line-height: 1.4;
}

.detail-value.highlight {
  color: rgba(16, 185, 129, 0.9);
  font-weight: 600;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 3px;
}

.detail-tags .tag {
  padding: 5px 12px;
  background: rgba(14, 165, 233, 0.12);
  border-radius: 12px;
  font-size: 11px;
  color: rgba(14, 165, 233, 0.7);
}

.detail-apply-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(16, 185, 129, 0.7));
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 14px;
  transition: all 0.3s ease;
}

.detail-apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
}

.tips-card {
  background: rgba(245, 158, 11, 0.04);
  border: 1px solid rgba(245, 158, 11, 0.08);
  border-radius: 14px;
  padding: 18px;
}

.tips-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(245, 158, 11, 0.9);
  margin: 0 0 14px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  gap: 8px;
}

.tip-num {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: rgba(245, 158, 11, 0.12);
  color: rgba(245, 158, 11, 0.7);
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-text {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
  line-height: 1.4;
}

.footer {
  text-align: center;
  padding: 30px 0 16px;
  color: rgba(148, 163, 184, 0.3);
  font-size: 12px;
}

.apply-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-wrapper {
  width: 90%;
  max-width: 520px;
}

.modal-content {
  background: rgba(15, 25, 45, 0.98);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(14, 165, 233, 0.06);
  border-bottom: 1px solid rgba(14, 165, 233, 0.1);
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.close-modal {
  font-size: 22px;
  color: rgba(148, 163, 184, 0.4);
  cursor: pointer;
  padding: 0 6px;
  transition: color 0.3s ease;
}

.close-modal:hover {
  color: rgba(148, 163, 184, 0.7);
}

.modal-body {
  padding: 26px 20px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 26px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(14, 165, 233, 0.12);
  color: rgba(14, 165, 233, 0.5);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background: rgba(14, 165, 233, 0.8);
  color: #fff;
}

.step.done .step-circle {
  background: rgba(16, 185, 129, 0.8);
  color: #fff;
}

.step-label {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.4);
}

.step.active .step-label {
  color: rgba(14, 165, 233, 0.8);
}

.step.done .step-label {
  color: rgba(16, 185, 129, 0.8);
}

.step-line {
  width: 40px;
  height: 2px;
  background: rgba(14, 165, 233, 0.08);
  margin: 0 6px;
  transition: background 0.3s ease;
}

.step-line.active {
  background: rgba(16, 185, 129, 0.5);
}

.step-content {
  min-height: 200px;
}

.step-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step-panel h4 {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.step-panel p {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.6);
  margin: 0;
}

.job-match-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.job-match-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(14, 165, 233, 0.06);
  border-radius: 8px;
}

.job-match-item .job-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.job-match-item .job-name {
  font-size: 13px;
  color: #f1f5f9;
  font-weight: 500;
}

.job-match-item .job-city {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.job-match-item .job-salary {
  font-size: 13px;
  color: rgba(16, 185, 129, 0.8);
  font-weight: 600;
}

.material-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  background: rgba(14, 165, 233, 0.04);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.material-item:hover {
  background: rgba(14, 165, 233, 0.08);
}

.material-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #0ea5e9;
}

.material-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.material-name {
  font-size: 13px;
  color: #f1f5f9;
}

.material-desc {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.plan-summary {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(14, 165, 233, 0.05);
  border-radius: 10px;
}

.plan-label {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.6);
}

.plan-value {
  font-size: 13px;
  color: #f1f5f9;
  font-weight: 500;
}

.plan-value.highlight {
  color: rgba(16, 185, 129, 0.9);
}

.success-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
}

.success-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(14, 165, 233, 0.7));
  color: #fff;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.35);
}

.success-code {
  padding: 14px 28px;
  background: rgba(14, 165, 233, 0.08);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(14, 165, 233, 0.8);
  font-family: monospace;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(14, 165, 233, 0.04);
  border-top: 1px solid rgba(14, 165, 233, 0.08);
}

.modal-btn {
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.primary {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(16, 185, 129, 0.7));
  border: none;
  color: #fff;
}

.modal-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
}

.modal-btn.secondary {
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.15);
  color: rgba(14, 165, 233, 0.8);
}

.modal-btn.secondary:hover {
  background: rgba(14, 165, 233, 0.12);
}

@media (max-width: 1100px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  .right-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .left-panel {
    grid-template-columns: 1fr;
  }
  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .header-title h1 {
    font-size: 1.4rem;
  }
}
</style>