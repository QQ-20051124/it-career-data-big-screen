<template>
  <div class="job-recommend-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
          <line x1="21" y1="21" x2="16" y2="16" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
        </svg>
        <input type="text" v-model="searchKeyword" placeholder="搜索岗位、公司、技能关键词" class="search-input"/>
      </div>
      <button class="search-btn">搜索</button>
    </div>

    <div class="category-tabs">
      <div 
        v-for="(tab, index) in categories" 
        :key="index" 
        class="tab-item"
        :class="{ active: activeCategory === index }"
        @click="activeCategory = index"
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
          <div class="job-card" v-for="(job, index) in jobList" :key="index">
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
            <div class="job-tags">
              <span v-for="(tag, tIndex) in job.tags" :key="tIndex" class="tag">{{ tag }}</span>
            </div>
            <button class="apply-btn">去投递</button>
            <div class="card-corner tl"></div>
            <div class="card-corner tr"></div>
            <div class="card-corner bl"></div>
            <div class="card-corner br"></div>
          </div>
        </div>

        <button class="reset-btn">重置筛选</button>
      </div>

      <div class="filter-section">
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
            <div class="filter-bar">
              <div class="bar-fill" :style="{ width: filter.value + '%' }"></div>
              <div class="bar-value">{{ filter.value }}</div>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const searchKeyword = ref('')
const activeCategory = ref(1)
const selectedOptions = ref(['本科'])

const categories = ['全部岗位', '今日新岗', '应届生校招', '人工智能', '国产芯片', '国企央企', '专精特新', '基层县域']

const jobList = ref([
  {
    title: 'Java后端开发工程师',
    company: '字节跳动',
    city: '北京',
    salary: '25K-45K',
    match: 95,
    tags: ['Java', 'SpringBoot', 'Redis']
  },
  {
    title: '前端开发工程师',
    company: '阿里巴巴',
    city: '杭州',
    salary: '22K-40K',
    match: 92,
    tags: ['React', 'TypeScript', 'Node.js']
  },
  {
    title: '数据分析师',
    company: '腾讯',
    city: '深圳',
    salary: '20K-35K',
    match: 88,
    tags: ['Python', 'SQL', 'BI']
  },
  {
    title: 'AI算法工程师',
    company: '百度',
    city: '北京',
    salary: '30K-55K',
    match: 85,
    tags: ['Python', 'PyTorch', 'NLP']
  },
  {
    title: '产品经理',
    company: '美团',
    city: '北京',
    salary: '25K-40K',
    match: 82,
    tags: ['需求分析', '数据分析', '项目管理']
  },
  {
    title: '测试工程师',
    company: '京东',
    city: '北京',
    salary: '18K-30K',
    match: 78,
    tags: ['自动化测试', '性能测试', '接口测试']
  },
  {
    title: '运维工程师',
    company: '网易',
    city: '杭州',
    salary: '18K-32K',
    match: 75,
    tags: ['Linux', 'Docker', 'K8s']
  },
  {
    title: '安全工程师',
    company: '华为',
    city: '深圳',
    salary: '28K-45K',
    match: 72,
    tags: ['渗透测试', '安全审计', '漏洞挖掘']
  },
  {
    title: 'Go开发工程师',
    company: '小米',
    city: '北京',
    salary: '22K-38K',
    match: 68,
    tags: ['Go', '微服务', '分布式']
  },
  {
    title: '嵌入式工程师',
    company: 'vivo',
    city: '东莞',
    salary: '20K-35K',
    match: 65,
    tags: ['C/C++', 'ARM', '驱动开发']
  },
  {
    title: 'UI设计师',
    company: '快手',
    city: '北京',
    salary: '18K-30K',
    match: 62,
    tags: ['Figma', '交互设计', '用户研究']
  },
  {
    title: '大数据开发',
    company: '滴滴',
    city: '北京',
    salary: '25K-42K',
    match: 58,
    tags: ['Spark', 'Hadoop', 'Flink']
  }
])

const filters = ref([
  { name: '期望薪资', value: 85 },
  { name: '专业匹配', value: 90 },
  { name: '就业城市', value: 75 },
  { name: '企业类型', value: 60 },
  { name: '发展机会偏好', value: 80 }
])

const quickOptions = ['本科', '硕士', '应届生', '3年经验', '5年经验', '大厂']

const toggleOption = (option) => {
  const index = selectedOptions.value.indexOf(option)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(option)
  }
}

const bgCanvas = ref(null)
let bgAnimationId = null

onMounted(() => {
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
  overflow: hidden;
  padding: 30px 50px;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.search-bar {
  display: flex;
  gap: 15px;
  max-width: 900px;
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
  width: 280px;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
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

.apply-btn {
  width: 100%;
  padding: 8px;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 8px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.6);
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

.filter-bar {
  position: relative;
  height: 6px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #00d4aa 0%, #4a9eff 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.bar-value {
  position: absolute;
  right: -30px;
  top: -16px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 12px;
}

.quick-filters {
  padding-top: 20px;
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
