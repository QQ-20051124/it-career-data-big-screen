<template>
  <div class="job-recommend-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="#4a9eff" stroke-width="2"/>
        </svg>
        <span>返回</span>
      </button>
      <div class="header-title">
        <h1>智能岗位推荐</h1>
        <p>基于AI算法的个性化岗位智能推荐系统</p>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
          <line x1="21" y1="21" x2="16" y2="16" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
        </svg>
        <input type="text" v-model="searchKeyword" placeholder="搜索岗位、公司、技能关键词" class="search-input"/>
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <div class="category-tabs">
      <div 
        v-for="(tab, index) in categories" 
        :key="index" 
        class="tab-item"
        :class="{ active: activeCategory === index }"
        @click="handleCategoryChange(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="main-content">
      <div class="job-list-section">
        <div class="section-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="#4a9eff" stroke-width="2"/>
              <path d="M2 17l10 5 10-5" fill="none" stroke="#4a9eff" stroke-width="2"/>
              <path d="M2 12l10 5 10-5" fill="none" stroke="#4a9eff" stroke-width="2"/>
            </svg>
          </div>
          <span>智能推荐岗位</span>
        </div>

        <div class="job-cards">
          <div class="job-card" :class="{ 'job-card-placeholder': job.isPlaceholder }" v-for="(job, index) in paginatedJobs" :key="index">
            <div class="job-card-glow"></div>
            <div class="job-header">
              <div class="job-title">{{ job.title }}</div>
              <div class="job-company">{{ job.company }}</div>
            </div>
            <div class="job-info">
              <div class="info-item">
                <span class="label">期望城市</span>
                <span class="value">{{ job.city }}</span>
              </div>
              <div class="info-item">
                <span class="label">薪资</span>
                <span class="value">{{ job.salary }}</span>
              </div>
              <div class="info-item">
                <span class="label">匹配度</span>
                <span class="value match-value">{{ job.match }}%</span>
              </div>
            </div>
            <div class="job-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                来源：{{ job.dataSource }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                学历：{{ job.education }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                </svg>
                经验：{{ job.work_exp }}
              </span>
            </div>
            <div class="job-tags">
              <span v-for="(tag, tIndex) in job.tags" :key="tIndex" class="tag">{{ tag }}</span>
            </div>
            <div class="job-actions">
              <button 
                v-if="!appliedJobs.includes(job.title)" 
                class="apply-btn" 
                @click="applyJob(job)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M22 2L11 13" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                立即投递
              </button>
              <button 
                v-else 
                class="applied-btn"
                disabled
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                已投递
              </button>
              <button 
                class="favorite-btn" 
                :class="{ favorited: favorites.includes(job.title) }"
                @click="toggleFavorite(job)"
              >
                <svg v-if="!favorites.includes(job.title)" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ff4757" stroke="#ff4757" stroke-width="2"/>
                </svg>
                {{ favorites.includes(job.title) ? '已收藏' : '收藏' }}
              </button>
            </div>
            <div class="card-corner tl"></div>
            <div class="card-corner tr"></div>
            <div class="card-corner bl"></div>
            <div class="card-corner br"></div>
          </div>
        </div>

        <div class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <div class="page-numbers">
            <template v-for="page in visiblePages" :key="page.key">
              <span v-if="page.key === 'ellipsis'" class="page-ellipsis">...</span>
              <button 
                v-else
                class="page-number"
                :class="{ active: currentPage === page.value }"
                @click="changePage(page.value)"
              >
                {{ page.value }}
              </button>
            </template>
          </div>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
          <span class="page-info">共 {{ filteredJobCount }} 条 / 第 {{ currentPage }}/{{ totalPages }} 页</span>
        </div>

        <button class="reset-btn" @click="resetFilters">重置筛选</button>
      </div>

      <div class="filter-section">
        <div class="filter-content">
          <div class="section-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="3" fill="#4a9eff"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="#4a9eff" stroke-width="2"/>
              </svg>
            </div>
            <span>筛选条件</span>
          </div>

          <div class="filter-items">
            <div class="filter-item" v-for="(filter, index) in filters" :key="index">
              <div class="filter-label">{{ filter.name }}</div>
              <div class="slider-container">
                <div class="slider-wrapper">
                  <div class="slider-track">
                    <div class="slider-fill" :style="{ width: filter.value + '%' }"></div>
                  </div>
                  <input 
                    type="range" 
                    class="slider-input"
                    min="0" 
                    max="100" 
                    v-model="filter.value"
                    @input="onSliderChange(index)"
                  />
                </div>
                <div class="slider-value">{{ filter.value }}%</div>
              </div>
            </div>
          </div>

          <div class="quick-filters">
            <div class="quick-title">快速筛选</div>
            <div class="quick-options">
              <div 
                v-for="(option, index) in quickOptions" 
                :key="index" 
                class="quick-option"
                :class="{ active: selectedOptions.includes(option) }"
                @click="toggleOption(option)"
              >
                {{ option }}
              </div>
            </div>
          </div>

          <div class="additional-filters">
            <div class="quick-title">城市筛选</div>
            <div class="quick-options">
              <div class="quick-option" :class="{ active: selectedOptions.includes('北京') }" @click="toggleOption('北京')">北京</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('上海') }" @click="toggleOption('上海')">上海</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('深圳') }" @click="toggleOption('深圳')">深圳</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('广州') }" @click="toggleOption('广州')">广州</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('杭州') }" @click="toggleOption('杭州')">杭州</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('成都') }" @click="toggleOption('成都')">成都</div>
            </div>
          </div>

          <div class="additional-filters">
            <div class="quick-title">经验要求</div>
            <div class="quick-options">
              <div class="quick-option" :class="{ active: selectedOptions.includes('应届') }" @click="toggleOption('应届')">应届生</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('1-3年') }" @click="toggleOption('1-3年')">1-3年</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('3-5年') }" @click="toggleOption('3-5年')">3-5年</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('5年以上') }" @click="toggleOption('5年以上')">5年以上</div>
            </div>
          </div>

          <div class="additional-filters">
            <div class="quick-title">薪资范围</div>
            <div class="quick-options">
              <div class="quick-option" :class="{ active: selectedOptions.includes('5K以下') }" @click="toggleOption('5K以下')">5K以下</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('5-10K') }" @click="toggleOption('5-10K')">5-10K</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('10-20K') }" @click="toggleOption('10-20K')">10-20K</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('20K以上') }" @click="toggleOption('20K以上')">20K以上</div>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <button 
            class="apply-filter-btn" 
            :disabled="filtering"
            @click="handleApplyFilter"
          >
            <svg v-if="!filtering" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else class="spinner" viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 60"/>
            </svg>
            {{ filtering ? '筛选中...' : '开始筛选' }}
          </button>
          <button class="reset-filter-btn" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}

const searchKeyword = ref('')
const activeCategory = ref(0)
const selectedOptions = ref(['本科'])
const loading = ref(false)
const originalJobList = ref([])
const jobList = ref([])
const appliedJobs = ref([])
const currentPage = ref(1)
const pageSize = 12
const favorites = ref([])
const filtering = ref(false)

const categories = ['全部岗位', '今日新岗', '应届生校招', '人工智能', '国产芯片', '国企央企', '专精特新', '基层县域']

const generateSalaryRange = (salary) => {
  const min = Math.floor(salary * 0.7 / 1000)
  const max = Math.floor(salary * 1.3 / 1000)
  return `${min}K-${max}K`
}

const generateMatchScore = (job) => {
  const baseScore = 60 + Math.floor(Math.random() * 30)
  if (job.salary_avg > 30000) return Math.min(baseScore + 10, 98)
  if (job.salary_avg > 20000) return Math.min(baseScore + 5, 95)
  return baseScore
}

const generateTags = (jobName) => {
  const tagMap = {
    'Java': ['Java', 'SpringBoot', 'Redis'],
    '前端': ['Vue', 'React', 'TypeScript'],
    'Python': ['Python', 'Django', 'Flask'],
    '算法': ['机器学习', '深度学习', 'TensorFlow'],
    '测试': ['自动化测试', '性能测试', 'Selenium'],
    '运维': ['Linux', 'Docker', 'K8s'],
    '数据库': ['MySQL', 'Redis', 'MongoDB'],
    '大数据': ['Hadoop', 'Spark', 'Flink'],
    '安全': ['渗透测试', '代码审计', '安全加固'],
    '全栈': ['Vue', 'Node.js', 'MongoDB'],
    '嵌入式': ['C/C++', 'ARM', 'Linux驱动'],
    '网络': ['TCP/IP', '路由交换', '网络安全'],
    '移动': ['Android', 'iOS', 'Flutter'],
    'UI': ['Figma', 'Sketch', 'Photoshop'],
    '产品': ['需求分析', '产品设计', '项目管理'],
    '游戏': ['Unity', 'Unreal', 'C++'],
  }
  
  for (const [key, tags] of Object.entries(tagMap)) {
    if (jobName.includes(key)) return tags
  }
  return ['计算机', 'IT', '技术']
}

const transformJobData = (rawJob) => {
  return {
    title: rawJob.job_name,
    company: rawJob.company || '未知公司',
    city: rawJob.city || '不限',
    salary: generateSalaryRange(rawJob.salary_avg || 10000),
    match: generateMatchScore(rawJob),
    tags: generateTags(rawJob.job_name),
    dataSource: rawJob.data_source || '网络',
    education: rawJob.education || '不限',
    work_exp: rawJob.work_exp || '不限'
  }
}

const loadRealData = async () => {
  loading.value = true
  try {
    const response = await fetch('/data/all_cleaned_jobs.json')
    if (!response.ok) {
      throw new Error('数据加载失败')
    }
    const rawData = await response.json()
    const transformed = rawData.map(transformJobData)
    originalJobList.value = transformed
    jobList.value = transformed
  } catch (err) {
    console.error('加载真实数据失败:', err)
    loadMockData()
  } finally {
    loading.value = false
  }
}

const loadMockData = () => {
  const mockData = [
    { job_name: 'Java开发工程师', city: '北京', education: '本科', work_exp: '1-3年', company: '字节跳动', salary_avg: 28000, data_source: 'BOSS直聘' },
    { job_name: '前端开发工程师', city: '杭州', education: '本科', work_exp: '1-3年', company: '阿里巴巴', salary_avg: 25000, data_source: 'BOSS直聘' },
    { job_name: 'Python数据分析师', city: '上海', education: '本科', work_exp: '1-3年', company: '美团', salary_avg: 22000, data_source: '前程无忧' },
    { job_name: 'AI算法工程师', city: '北京', education: '硕士', work_exp: '3-5年', company: '百度', salary_avg: 45000, data_source: '拉勾网' },
    { job_name: '大数据开发工程师', city: '杭州', education: '本科', work_exp: '3-5年', company: '阿里巴巴', salary_avg: 35000, data_source: '前程无忧' },
  ]
  const transformed = mockData.map(transformJobData)
  originalJobList.value = transformed
  jobList.value = transformed
}

const filters = ref([
  { name: '期望薪资', value: 85, key: 'salary' },
  { name: '专业匹配', value: 90, key: 'major' },
  { name: '就业城市', value: 75, key: 'city' },
  { name: '企业类型', value: 60, key: 'company' },
  { name: '发展机会偏好', value: 80, key: 'growth' }
])

const onSliderChange = (index) => {
  applyFilters()
}

const quickOptions = ['本科', '硕士', '应届生', '3年经验', '5年经验', '大厂']

const toggleOption = (option) => {
  const index = selectedOptions.value.indexOf(option)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(option)
  }
  applyFilters()
}

const applyFilters = () => {
  let filtered = originalJobList.value
  
  if (activeCategory.value === 1) {
    filtered = originalJobList.value.slice(0, 30)
  } else if (activeCategory.value === 2) {
    filtered = originalJobList.value.filter(job => 
      job.education?.includes('本科') || job.education?.includes('硕士') ||
      job.work_exp?.includes('应届生') || job.work_exp?.includes('校招')
    )
  } else if (activeCategory.value === 3) {
    filtered = originalJobList.value.filter(job => 
      job.title?.includes('AI') || job.title?.includes('人工智能') || 
      job.title?.includes('算法') || job.title?.includes('机器学习') ||
      job.title?.includes('深度学习') || job.title?.includes('智能')
    )
  } else if (activeCategory.value === 4) {
    filtered = originalJobList.value.filter(job => 
      job.title?.includes('芯片') || job.title?.includes('半导体') ||
      job.title?.includes('IC') || job.title?.includes('FPGA') ||
      job.title?.includes('嵌入式') || job.title?.includes('硬件')
    )
  } else if (activeCategory.value === 5) {
    filtered = originalJobList.value.filter(job => 
      job.company?.includes('国企') || job.company?.includes('央企') ||
      job.company?.includes('国家') || job.company?.includes('中国')
    )
  } else if (activeCategory.value === 6) {
    filtered = originalJobList.value.filter(job => 
      job.company?.includes('科技') || job.company?.includes('创新') ||
      job.company?.includes('专精') || job.company?.includes('高新')
    )
  } else if (activeCategory.value === 7) {
    const tier1Cities = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京']
    filtered = originalJobList.value.filter(job => 
      job.city && !tier1Cities.some(c => job.city.includes(c))
    )
  }
  
  if (selectedOptions.value.length > 0) {
    filtered = filtered.filter(job => {
      return selectedOptions.value.some(option => {
        if (['本科', '硕士'].includes(option)) {
          return job.education?.includes(option)
        } else if (['应届生', '应届'].includes(option)) {
          return job.work_exp?.includes('应届') || job.work_exp?.includes('校招')
        } else if (option === '3年经验') {
          return job.work_exp?.includes('1-3') || job.work_exp?.includes('3-5')
        } else if (option === '5年经验') {
          return job.work_exp?.includes('3-5') || job.work_exp?.includes('5-10') || job.work_exp?.includes('5年以上')
        } else if (['北京', '上海', '深圳', '广州', '杭州', '成都'].includes(option)) {
          return job.city?.includes(option)
        } else if (['1-3年', '3-5年', '5年以上'].includes(option)) {
          return job.work_exp?.includes(option)
        } else if (['5K以下', '5-10K', '10-20K', '20K以上'].includes(option)) {
          return job.salary?.includes(option)
        } else if (option === '大厂') {
          return job.company?.includes('科技') || job.company?.includes('集团') || job.company?.includes('网络') || job.company?.includes('智能')
        }
        return true
      })
    })
  }
  
  if (searchKeyword.value.trim()) {
    filtered = filtered.filter(job => 
      job.title.includes(searchKeyword.value) ||
      job.company.includes(searchKeyword.value) ||
      job.city.includes(searchKeyword.value) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }
  
  if (selectedOptions.value.length === 0 && activeCategory.value === 0 && !searchKeyword.value.trim()) {
    // 展示全部数据，不再截断
  }
  
  jobList.value = filtered.length > 0 ? filtered : []
}

const handleCategoryChange = (index) => {
  activeCategory.value = index
  currentPage.value = 1
  applyFilters()
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    handleCategoryChange(activeCategory.value)
    return
  }
  const filtered = originalJobList.value.filter(job => 
    job.title.includes(searchKeyword.value) ||
    job.company.includes(searchKeyword.value) ||
    job.city.includes(searchKeyword.value) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  )
  if (filtered.length === 0) {
    alert('没有找到匹配的岗位')
  } else {
    jobList.value = filtered
    currentPage.value = 1
  }
}

const applyJob = (job) => {
  if (appliedJobs.value.includes(job.title)) {
    alert('您已经投递过该岗位了')
    return
  }
  
  const confirmed = confirm(
    `确认投递该岗位？\n\n` +
    `📋 岗位名称：${job.title}\n` +
    `🏢 公司：${job.company}\n` +
    `📍 工作地点：${job.city}\n` +
    `💰 薪资范围：${job.salary}\n` +
    `🎓 学历要求：${job.education}\n` +
    `⏰ 经验要求：${job.work_exp}\n` +
    `📊 匹配度：${job.match}%\n` +
    `🔗 数据来源：${job.dataSource}\n\n` +
    `投递方式：将通过系统自动投递至 ${job.dataSource} 招聘平台\n` +
    `点击"确定"完成投递，点击"取消"放弃投递`
  )
  
  if (confirmed) {
    appliedJobs.value.push(job.title)
    alert(
      `✅ 投递成功！\n\n` +
      `岗位：${job.title}\n` +
      `公司：${job.company}\n` +
      `薪资：${job.salary}\n` +
      `匹配度：${job.match}%\n` +
      `投递时间：${new Date().toLocaleString()}\n` +
      `投递方式：${job.dataSource} 平台自动投递\n\n` +
      `您可以在"我的投递"中查看投递状态`
    )
  }
}

const toggleFavorite = (job) => {
  const index = favorites.value.indexOf(job.title)
  if (index > -1) {
    favorites.value.splice(index, 1)
    alert('已取消收藏')
  } else {
    favorites.value.push(job.title)
    alert('已添加到收藏')
  }
}

const filteredJobCount = computed(() => jobList.value.length)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(jobList.value.length / pageSize))
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push({ key: i, value: i })
    }
  } else {
    pages.push({ key: 1, value: 1 })
    
    if (current > 4) {
      pages.push({ key: 'ellipsis-start', value: '...' })
    }
    
    const start = Math.max(2, current - 2)
    const end = Math.min(total - 1, current + 2)
    
    for (let i = start; i <= end; i++) {
      pages.push({ key: i, value: i })
    }
    
    if (current < total - 3) {
      pages.push({ key: 'ellipsis-end', value: '...' })
    }
    
    pages.push({ key: total, value: total })
  }
  
  return pages
})

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const pageJobs = jobList.value.slice(start, end)
  // 最后一页不足 pageSize 时，补占位卡片让网格对齐
  const placeholders = []
  const remaining = pageSize - pageJobs.length
  if (remaining > 0) {
    for (let i = 0; i < remaining; i++) {
      placeholders.push({ isPlaceholder: true })
    }
  }
  return [...pageJobs, ...placeholders]
})

const handleApplyFilter = async () => {
  filtering.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  applyFilters()
  currentPage.value = 1
  filtering.value = false
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  const jobListSection = document.querySelector('.job-list-section')
  if (jobListSection) {
    jobListSection.scrollTop = 0
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeCategory.value = 0
  selectedOptions.value = ['本科']
  currentPage.value = 1
  handleCategoryChange(0)
}

const bgCanvas = ref(null)
let bgAnimationId = null

onMounted(async () => {
  await loadRealData()
  
  const canvas = bgCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const stars = []
  const particleCount = 80

  for (let i = 0; i < particleCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
      alpha: Math.random(),
      speed: Math.random() * 0.02
    })
  }

  const animate = () => {
    ctx.fillStyle = 'rgba(5, 10, 30, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    stars.forEach(star => {
      star.alpha += star.speed
      if (star.alpha >= 1 || star.alpha <= 0) {
        star.speed = -star.speed
      }

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74, 158, 255, ${star.alpha})`
      ctx.fill()
    })

    bgAnimationId = requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
})

onUnmounted(() => {
  if (bgAnimationId) {
    cancelAnimationFrame(bgAnimationId)
  }
})
</script>

<style scoped>
.job-recommend-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #050a1e 0%, #0a1628 50%, #050a1e 100%);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 30px 50px;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 20, 45, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.header-title {
  text-align: left;
}

.back-btn:hover {
  border-color: rgba(74, 158, 255, 0.6);
  background: rgba(74, 158, 255, 0.1);
  transform: translateX(-4px);
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.3);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 4px 0;
}

.header-title p {
  font-size: 13px;
  color: rgba(150, 180, 220, 0.7);
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 10;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(10, 20, 45, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50px;
  padding: 0 25px;
  height: 48px;
}

.search-icon {
  margin-right: 15px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.search-input::placeholder {
  color: rgba(150, 180, 220, 0.5);
}

.search-btn {
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  border: none;
  border-radius: 50px;
  padding: 0 35px;
  height: 48px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.6);
}

.category-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
  flex-wrap: wrap;
}

.tab-item {
  padding: 10px 22px;
  background: rgba(10, 20, 45, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 25px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item:hover {
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.tab-item.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3) 0%, rgba(0, 212, 170, 0.2) 100%);
  border-color: rgba(74, 158, 255, 0.6);
  color: #fff;
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  align-items: flex-start;
}

.job-list-section {
  flex: 1;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.job-list-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.5), transparent);
}

.filter-section {
  width: 300px;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 0;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 80px);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.filter-content {
  padding: 25px;
  flex: 1;
  overflow-y: scroll;
  overflow-x: visible;
}

.filter-actions {
  display: flex;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
  background: rgba(10, 20, 45, 0.9);
  flex-shrink: 0;
}

.filter-content::-webkit-scrollbar {
  width: 6px;
}

.filter-content::-webkit-scrollbar-track {
  background: rgba(10, 20, 45, 0.3);
  border-radius: 3px;
}

.filter-content::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.5);
  border-radius: 3px;
}

.filter-content::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.7);
}

.filter-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.5), transparent);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(74, 158, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-header span {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.job-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.job-card-placeholder {
  visibility: hidden;
}

.job-card {
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.job-card:hover {
  border-color: rgba(74, 158, 255, 0.5);
  transform: translateY(-3px);
}

.job-card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.job-header {
  margin-bottom: 12px;
}

.job-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.job-company {
  color: rgba(150, 180, 220, 0.5);
  font-size: 12px;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: rgba(150, 180, 220, 0.4);
  font-size: 11px;
}

.info-item .value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.match-value {
  color: #00d4aa;
  font-weight: 600;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}

.tag {
  padding: 3px 8px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 4px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 10px;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(150, 180, 220, 0.7);
}

.meta-item svg {
  color: rgba(74, 158, 255, 0.6);
}

.job-actions {
  display: flex;
  gap: 10px;
}

.apply-btn, .applied-btn, .favorite-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.apply-btn {
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
}

.applied-btn {
  background: rgba(0, 212, 170, 0.2);
  border: 1px solid rgba(0, 212, 170, 0.4);
  color: rgba(0, 212, 170, 0.9);
  cursor: not-allowed;
}

.favorite-btn {
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: rgba(74, 158, 255, 0.8);
}

.favorite-btn:hover {
  background: rgba(74, 158, 255, 0.25);
}

.favorite-btn.favorited {
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.4);
  color: rgba(255, 71, 87, 0.9);
}

.favorite-btn.favorited:hover {
  background: rgba(255, 71, 87, 0.25);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 25px 0;
  padding: 15px;
  background: rgba(74, 158, 255, 0.05);
  border-radius: 12px;
}

.page-btn {
  padding: 8px 16px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.25);
  border-color: rgba(74, 158, 255, 0.5);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  min-width: 35px;
  height: 35px;
  padding: 0 10px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 6px;
  color: rgba(150, 180, 220, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background: rgba(74, 158, 255, 0.2);
}

.page-number.active {
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.page-info {
  font-size: 12px;
  color: rgba(150, 180, 220, 0.6);
  margin-left: 10px;
}

.apply-filter-btn {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.6);
}

.apply-filter-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.apply-filter-btn .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 35px;
  height: 35px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 14px;
}

.reset-filter-btn {
  padding: 12px 20px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background: rgba(74, 158, 255, 0.25);
}

.card-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border-color: rgba(74, 158, 255, 0.4);
  border-style: solid;
  border-width: 0;
}

.card-corner.tl {
  top: 8px;
  left: 8px;
  border-top-width: 2px;
  border-left-width: 2px;
}

.card-corner.tr {
  top: 8px;
  right: 8px;
  border-top-width: 2px;
  border-right-width: 2px;
}

.card-corner.bl {
  bottom: 8px;
  left: 8px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}

.card-corner.br {
  bottom: 8px;
  right: 8px;
  border-bottom-width: 2px;
  border-right-width: 2px;
}

.reset-btn {
  display: block;
  margin: 30px auto 0;
  padding: 12px 40px;
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.6);
}

.filter-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-wrapper {
  position: relative;
  flex: 1;
  height: 24px;
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  transform: translateY(-50%);
  background: rgba(74, 158, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
  pointer-events: none;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4aa 0%, #4a9eff 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.slider-input {
  position: relative;
  width: 100%;
  height: 24px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
  transition: transform 0.2s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.7);
}

.slider-input::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}

.slider-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.slider-input::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.slider-input::-moz-range-thumb:active {
  cursor: grabbing;
}

.slider-value {
  flex-shrink: 0;
  color: rgba(74, 158, 255, 0.9);
  font-size: 13px;
  font-weight: 600;
  width: 36px;
  text-align: right;
}

.quick-filters {
  padding-top: 20px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
}

.additional-filters {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
}

.quick-title {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
  margin-bottom: 12px;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-option {
  padding: 6px 14px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-option:hover {
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.quick-option.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
  color: #fff;
}

@media (max-width: 1200px) {
  .job-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .job-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .job-cards {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .filter-section {
    width: 100%;
  }
}
</style>
