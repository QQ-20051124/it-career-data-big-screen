<template>
  <div class="talent-page">
    <div class="bg-deep-space">
      <canvas ref="bgCanvas" class="bg-starfield"></canvas>
      <div class="bg-nebula nebula-1"></div>
      <div class="bg-nebula nebula-2"></div>
      <div class="bg-nebula nebula-3"></div>
    </div>

    <div class="page-container">
      <!-- 顶部导航 -->
      <header class="page-header">
        <div class="header-left">
          <button class="back-btn" @click="router.push('/dashboard')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>返回仪表盘</span>
          </button>
          <div class="header-divider"></div>
          <div class="title-area">
            <h1 class="page-title">
              <span class="title-glow">IT人才智能分析平台</span>
            </h1>
            <div class="meta-row">
              <span class="meta-item"><span class="meta-dot online"></span> 实时在线</span>
              <span class="meta-item">{{ totalJobs.toLocaleString() }} 个岗位</span>
              <span class="meta-item">{{ policyUpdateTime || '今日' }} 更新</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" v-model="searchKeyword" placeholder="搜索岗位方向、城市、学历..." class="search-input" @keydown.enter.prevent="handleSearch" />
            <button v-if="isSearchActive" class="clear-btn" @click="clearSearch">×</button>
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
        </div>
      </header>

      <!-- Bento Grid -->
      <main class="bento-grid" v-if="filteredData.length > 0">
        <!-- Hero大卡 -->
        <div class="bento-card hero-card"
          :class="{ 'card-pinned': pinnedCard === 'hero' }"
          @mouseenter="handleCardHover('hero')"
          @mouseleave="handleCardLeave"
          @click.stop="handleCardClick('hero')"
        >
          <div class="neon-border"></div>
          <div class="hero-inner">
            <div class="hero-left">
              <div class="card-kicker">TOTAL ACTIVE ROLES</div>
              <div class="hero-value neon-text">{{ totalJobs.toLocaleString() }}</div>
              <div class="hero-label">在招岗位总数</div>
              <div class="hero-breakdown">
                <div class="breakdown-item">
                  <div class="breakdown-val cyan">¥{{ avgSalary.toLocaleString() }}</div>
                  <div class="breakdown-label">平均薪资</div>
                </div>
                <div class="breakdown-sep"></div>
                <div class="breakdown-item">
                  <div class="breakdown-val purple">{{ cityCount }}</div>
                  <div class="breakdown-label">覆盖城市</div>
                </div>
                <div class="breakdown-sep"></div>
                <div class="breakdown-item">
                  <div class="breakdown-val amber">{{ dataCompleteRate }}%</div>
                  <div class="breakdown-label">数据完整率</div>
                </div>
              </div>
            </div>
          </div>
          <div class="hero-decoration">
            <svg viewBox="0 0 160 160" class="hero-svg">
              <defs>
                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00f0ff"/>
                  <stop offset="100%" stop-color="#7c3aed"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="80" cy="80" r="70" fill="none" stroke="url(#heroGrad)" stroke-width="1" filter="url(#glow)" stroke-dasharray="4 8" opacity="0.7"/>
              <circle cx="80" cy="80" r="50" fill="none" stroke="#00f0ff" stroke-width="0.8" filter="url(#glow)" opacity="0.4"/>
              <circle cx="80" cy="80" r="30" fill="none" stroke="#7c3aed" stroke-width="0.8" filter="url(#glow)" opacity="0.5"/>
              <circle cx="80" cy="80" r="5" fill="#00f0ff" filter="url(#glow)"/>
            </svg>
          </div>
          <div class="card-hint" v-if="pinnedCard !== 'hero'">悬浮查看详情 · 点击固定</div>
        </div>

        <!-- 数据卡：薪资趋势 -->
        <div class="bento-card data-card neon-cyan"
          :class="{ 'card-pinned': pinnedCard === 'salary' }"
          @mouseenter="handleCardHover('salary')"
          @mouseleave="handleCardLeave"
          @click.stop="handleCardClick('salary')"
        >
          <div class="neon-border"></div>
          <div class="card-top">
            <span class="card-num">02</span>
            <span class="card-label">平均薪资趋势</span>
          </div>
          <div class="card-value-row">
            <div class="card-value neon-cyan-text">¥{{ avgSalary.toLocaleString() }}</div>
            <div class="trend-indicator up">
              <span class="trend-arrow">▲</span>
              <span class="trend-value">{{ salaryTrend }}%</span>
            </div>
          </div>
          <div ref="salarySparkRef" class="mini-chart spark-chart"></div>
          <div class="card-insight">
            <span class="insight-icon">💡</span>
            <span>IT行业薪资持续上涨，高端人才溢价明显</span>
          </div>
          <div class="card-hint" v-if="pinnedCard !== 'salary'">悬浮查看详情 · 点击固定</div>
        </div>

        <!-- 数据卡：城市分布 -->
        <div class="bento-card data-card neon-purple"
          :class="{ 'card-pinned': pinnedCard === 'city' }"
          @mouseenter="handleCardHover('city')"
          @mouseleave="handleCardLeave"
          @click.stop="handleCardClick('city')"
        >
          <div class="neon-border"></div>
          <div class="card-top">
            <span class="card-num">03</span>
            <span class="card-label">城市岗位分布</span>
          </div>
          <div class="card-value neon-purple-text">{{ cityCount }} 个城市</div>
          <div ref="cityBarsRef" class="mini-chart bars-chart"></div>
          <div class="card-insight">
            <span class="insight-icon">📍</span>
            <span>{{ topCityName }} 岗位最集中，占比 {{ topCityPercent }}%</span>
          </div>
          <div class="card-hint" v-if="pinnedCard !== 'city'">悬浮查看详情 · 点击固定</div>
        </div>

        <!-- 学历分布 -->
        <div class="bento-card info-card edu-card">
          <div class="neon-border"></div>
          <div class="card-header compact">
            <div>
              <div class="card-title">学历要求分布</div>
              <div class="card-sub">各学历层次岗位占比</div>
            </div>
          </div>
          <div class="edu-list">
            <div class="edu-row" v-for="(item, index) in degreeStats" :key="index">
              <div class="edu-left">
                <span class="edu-name">{{ item.name }}</span>
                <span class="edu-count">{{ item.count }} 个</span>
              </div>
              <div class="edu-progress">
                <div class="edu-fill" :style="{ width: item.percentage + '%', background: item.color, boxShadow: '0 0 8px ' + item.color }"></div>
              </div>
              <span class="edu-percent" :style="{ color: item.color, textShadow: '0 0 8px ' + item.color }">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>

        <!-- 热门岗位 -->
        <div class="bento-card info-card rank-card">
          <div class="neon-border"></div>
          <div class="card-header compact">
            <div>
              <div class="card-title">热门岗位排行</div>
              <div class="card-sub">IT领域岗位需求排名</div>
            </div>
          </div>
          <div class="rank-list">
            <div class="rank-row" v-for="(item, index) in topJobs" :key="index" :class="{ active: selectedJob?.name === item.name }" @click="selectJob(item)">
              <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-sub">{{ item.count }} 个岗位 · ¥{{ item.salary.toLocaleString() }}</div>
              </div>
              <div class="rank-trend">+{{ item.trend }}%</div>
            </div>
          </div>
        </div>

        <!-- 城市分布 -->
        <div class="bento-card chart-card city-card">
          <div class="neon-border"></div>
          <div class="card-header">
            <div>
              <div class="card-title">城市岗位分布 TOP 6</div>
              <div class="card-sub">热门城市 IT 岗位数量排名</div>
            </div>
          </div>
          <div ref="cityChart" class="chart-box"></div>
        </div>

        <!-- 政策匹配 -->
        <div class="bento-card policy-card">
          <div class="neon-border neon-purple-border"></div>
          <div class="policy-header">
            <div class="policy-title">
              <div class="policy-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <div class="policy-name">IT 人才政策匹配</div>
                <div class="policy-desc">智能匹配相关政策
                  <span v-if="policyUpdateTime" class="update-time">· {{ policyUpdateTime }}</span>
                </div>
              </div>
            </div>
            <div class="live-badge">
              <span class="live-dot"></span>
              <span>实时</span>
            </div>
          </div>

          <div class="policy-tabs">
            <button v-for="tab in policyTabs" :key="tab.key" class="policy-tab" :class="{ active: activePolicyTab === tab.key }" @click="activePolicyTab = tab.key">
              {{ tab.label }}
            </button>
          </div>

          <div class="policy-list">
            <div class="policy-item" v-for="(policy, index) in filteredPolicies" :key="index" :class="{ active: selectedPolicy?.title === policy.title }" @click="selectPolicy(policy)">
              <div class="policy-accent" :class="policy.type"></div>
              <div class="policy-body">
                <div class="policy-title-row">
                  <h4 class="policy-item-title">{{ policy.title }}</h4>
                  <span class="policy-level" :class="policy.type">{{ policy.level }}</span>
                </div>
                <div class="policy-meta-row">
                  <span class="policy-city">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ policy.city }}
                  </span>
                  <span class="policy-amount">{{ policy.amount }}</span>
                </div>
                <p class="policy-jobs">{{ policy.jobs }}</p>
                <div class="policy-action-row">
                  <span class="policy-match">
                    <span class="match-dot"></span>
                    {{ getPolicyMatchCount(policy) }} 个岗位符合
                  </span>
                  <a v-if="policy.url" :href="policy.url" target="_blank" rel="noopener noreferrer" class="detail-btn" @click.stop>查看详情 ↗</a>
                  <span v-else class="detail-btn disabled">暂无链接</span>
                </div>
              </div>
            </div>
          </div>

          <div class="policy-footer">
            <span>共 {{ allFilteredPolicies.length }} 条政策 · 每日自动同步</span>
            <div class="policy-pagination" v-if="policyTotalPages > 1">
              <button class="page-btn" :disabled="policyPage === 1" @click="goToPolicyPage(policyPage - 1)">‹ 上一页</button>
              <div class="page-numbers">
                <button
                  v-for="p in policyTotalPages"
                  :key="p"
                  class="page-num"
                  :class="{ active: p === policyPage }"
                  @click="goToPolicyPage(p)"
                >{{ p }}</button>
              </div>
              <button class="page-btn" :disabled="policyPage === policyTotalPages" @click="goToPolicyPage(policyPage + 1)">下一页 ›</button>
            </div>
          </div>
        </div>
      </main>

      <!-- 卡片浮窗 -->
      <div v-if="activePopupCard" 
           class="card-popup-overlay" 
           :class="{ 'overlay-pinned': pinnedCard }"
           @click="closePopup">
        <div class="card-popup" 
             :class="'popup-' + activePopupCard" 
             @click.stop
             @mouseenter="handlePopupEnter"
             @mouseleave="handlePopupLeave">
            <button class="popup-close" @click.stop="closePopup">×</button>
            <div class="popup-close-hint" v-if="pinnedCard">点击空白处关闭</div>

            <!-- Hero卡浮窗：中国地图 -->
            <template v-if="activePopupCard === 'hero'">
              <div class="popup-header">
                <h3 class="popup-title">岗位全国分布图</h3>
                <p class="popup-sub">{{ totalJobs.toLocaleString() }} 个岗位 · 覆盖 {{ cityCount }} 个城市 · 平均薪资 ¥{{ avgSalary.toLocaleString() }}</p>
              </div>
              <div ref="popupMapRef" class="popup-map-chart"></div>
              <div class="popup-stats-row">
                <div class="popup-stat">
                  <div class="popup-stat-val cyan">{{ totalJobs.toLocaleString() }}</div>
                  <div class="popup-stat-label">在招岗位</div>
                </div>
                <div class="popup-stat">
                  <div class="popup-stat-val purple">{{ cityCount }}</div>
                  <div class="popup-stat-label">覆盖城市</div>
                </div>
                <div class="popup-stat">
                  <div class="popup-stat-val amber">¥{{ avgSalary.toLocaleString() }}</div>
                  <div class="popup-stat-label">平均薪资</div>
                </div>
                <div class="popup-stat">
                  <div class="popup-stat-val green">{{ topCityName }}</div>
                  <div class="popup-stat-label">岗位最多</div>
                </div>
              </div>
            </template>

            <!-- 薪资卡浮窗：薪资详细分解 -->
            <template v-if="activePopupCard === 'salary'">
              <div class="popup-header">
                <h3 class="popup-title">薪资详细分析</h3>
                <p class="popup-sub">平均薪资 ¥{{ avgSalary.toLocaleString() }} · 趋势 +{{ salaryTrend }}%</p>
              </div>
              <div class="popup-salary-grid">
                <div class="popup-salary-row" v-for="(range, idx) in salaryRanges" :key="idx">
                  <div class="salary-range-label" :style="{ color: range.color }">{{ range.label }}</div>
                  <div class="salary-range-bar-wrap">
                    <div class="salary-range-bar" :style="{ width: range.percent + '%', background: range.color, boxShadow: '0 0 8px ' + range.color }"></div>
                  </div>
                  <div class="salary-range-count">{{ range.count }} 个</div>
                  <div class="salary-range-percent">{{ range.percent }}%</div>
                </div>
              </div>
              <div class="popup-divider"></div>
              <div class="popup-edu-salary">
                <div class="popup-sub-title">各学历平均薪资</div>
                <div ref="popupSalaryEduRef" class="popup-edu-chart"></div>
              </div>
            </template>

            <!-- 城市卡浮窗：完整城市排名 -->
            <template v-if="activePopupCard === 'city'">
              <div class="popup-header">
                <h3 class="popup-title">城市岗位排名</h3>
                <p class="popup-sub">{{ cityCount }} 个城市 · {{ topCityName }}占比最高 ({{ topCityPercent }}%)</p>
              </div>
              <div class="popup-city-list">
                <div class="popup-city-row" v-for="(city, idx) in fullCityRanking" :key="idx">
                  <div class="city-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</div>
                  <div class="city-name">{{ city.name }}</div>
                  <div class="city-bar-wrap">
                    <div class="city-bar" :style="{ width: city.percent + '%' }"></div>
                  </div>
                  <div class="city-count">{{ city.count }}</div>
                  <div class="city-percent">{{ city.percent }}%</div>
                </div>
              </div>
            </template>
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div class="no-results" v-if="filteredData.length === 0">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-title">未找到匹配「{{ searchKeyword }}」的岗位数据</div>
        <div class="no-results-desc">换个关键词试试吧，如：人工智能、前端、大数据</div>
        <button class="no-results-btn" @click="clearSearch">清空搜索</button>
      </div>

      <!-- 页脚 -->
      <footer class="page-footer">
        <span class="footer-dot"></span>
        <span>数据来源：招聘平台爬虫</span>
        <span class="footer-sep">·</span>
        <span>政策每日自动更新</span>
        <span class="footer-sep">·</span>
        <span class="footer-ok">系统运行正常</span>
      </footer>
    </div>

    <!-- 政策详情弹窗 -->
    <div class="modal-overlay" v-if="selectedPolicy" @click.self="selectedPolicy = null">
      <div class="modal-card">
        <div class="modal-glow"></div>
        <div class="modal-head">
          <div class="modal-title-wrap">
            <span class="modal-level" :class="selectedPolicy.type">{{ selectedPolicy.level }}</span>
            <h3 class="modal-title">{{ selectedPolicy.title }}</h3>
          </div>
          <button class="modal-close" @click="selectedPolicy = null">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-row">
            <span class="modal-row-label">适用地区</span>
            <span class="modal-row-value">{{ selectedPolicy.city }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-row-label">适用岗位</span>
            <span class="modal-row-value">{{ selectedPolicy.jobs }}</span>
          </div>
          <div class="modal-row highlight">
            <span class="modal-row-label">补贴金额</span>
            <span class="modal-row-value amount">{{ selectedPolicy.amount }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-row-label">申报条件</span>
            <span class="modal-row-value">{{ selectedPolicy.conditions }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-row-label">政策期限</span>
            <span class="modal-row-value">{{ selectedPolicy.validity }}</span>
          </div>
          <div class="modal-tags">
            <span v-for="(tag, i) in selectedPolicy.tags" :key="i" class="modal-tag">#{{ tag }}</span>
          </div>
          <a v-if="selectedPolicy.url" :href="selectedPolicy.url" target="_blank" rel="noopener noreferrer" class="modal-link-btn">
            访问官方政策页面 ↗
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import jobData from '../assets/all_cleaned_jobs.json'

const router = useRouter()
const searchKeyword = ref('')
const activePolicyTab = ref('all')
const policyPage = ref(1)
const policyPageSize = 6
const selectedJob = ref(null)
const selectedPolicy = ref(null)
const bgCanvas = ref(null)
const salaryChart = ref(null)
const cityChart = ref(null)
const salarySparkRef = ref(null)
const cityBarsRef = ref(null)
const popupMapRef = ref(null)
const popupSalaryEduRef = ref(null)

const hoveredCard = ref(null)
const pinnedCard = ref(null)
const dismissedCard = ref(null)
let popupHoverTimer = null

const policyDatabase = ref([])
const policyUpdateTime = ref('')

let salaryInstance = null
let cityInstance = null
let salarySparkInstance = null
let cityBarsInstance = null
let popupMapInstance = null
let popupSalaryEduInstance = null
let animationId = null
let chinaMapRegistered = false

const activePopupCard = computed(() => pinnedCard.value || hoveredCard.value)
let popupTimer = null

const handleCardHover = (card) => {
  if (pinnedCard.value) return
  if (dismissedCard.value === card) return
  if (popupTimer) {
    clearTimeout(popupTimer)
    popupTimer = null
  }
  if (popupHoverTimer) {
    clearTimeout(popupHoverTimer)
    popupHoverTimer = null
  }
  hoveredCard.value = card
}
const handleCardLeave = () => {
  if (pinnedCard.value) return
  if (popupTimer) clearTimeout(popupTimer)
  popupTimer = setTimeout(() => {
    hoveredCard.value = null
    popupTimer = null
  }, 300)
}
const handlePopupEnter = () => {
  if (pinnedCard.value) return
  if (popupTimer) {
    clearTimeout(popupTimer)
    popupTimer = null
  }
  if (popupHoverTimer) {
    clearTimeout(popupHoverTimer)
    popupHoverTimer = null
  }
}
const handlePopupLeave = () => {
  if (pinnedCard.value) return
  if (popupHoverTimer) clearTimeout(popupHoverTimer)
  popupHoverTimer = setTimeout(() => {
    hoveredCard.value = null
    popupHoverTimer = null
  }, 100)
}
const handleCardClick = (card) => {
  if (popupTimer) clearTimeout(popupTimer)
  if (popupHoverTimer) clearTimeout(popupHoverTimer)
  if (pinnedCard.value === card) {
    pinnedCard.value = null
  } else {
    pinnedCard.value = card
    hoveredCard.value = null
    dismissedCard.value = null
  }
}
const closePopup = () => {
  if (popupTimer) clearTimeout(popupTimer)
  if (popupHoverTimer) clearTimeout(popupHoverTimer)
  if (hoveredCard.value) {
    dismissedCard.value = hoveredCard.value
  }
  if (pinnedCard.value) {
    dismissedCard.value = pinnedCard.value
  }
  pinnedCard.value = null
  hoveredCard.value = null
}

const policyTabs = [
  { key: 'all', label: '全部政策' },
  { key: 'national', label: '国家级' },
  { key: 'provincial', label: '省级' },
  { key: 'city', label: '市级' }
]

const validData = computed(() => {
  return jobData.filter(item => !isNaN(item.salary_avg) && item.salary_avg > 0 && item.salary_avg < 200000)
})

const filteredData = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return validData.value
  return validData.value.filter(item => {
    const name = (item.job_name || '').toLowerCase()
    const city = (item.city || '').toLowerCase()
    const edu = (item.education || '').toLowerCase()
    const company = (item.company || '').toLowerCase()
    return name.includes(kw) || city.includes(kw) || edu.includes(kw) || company.includes(kw)
  })
})

const totalJobs = computed(() => filteredData.value.length)
const avgSalary = computed(() => {
  if (!filteredData.value.length) return 0
  return Math.round(filteredData.value.reduce((s, i) => s + i.salary_avg, 0) / filteredData.value.length)
})
const cityCount = computed(() => [...new Set(filteredData.value.map(i => i.city))].length)

const cityBars = ref([20, 15, 10, 8, 5])
const updateCityBars = () => {
  const dist = filteredData.value.reduce((acc, item) => { acc[item.city] = (acc[item.city] || 0) + 1; return acc }, {})
  const counts = Object.values(dist).sort((a, b) => b - a).slice(0, 5)
  if (counts.length === 0) { cityBars.value = [20, 15, 10, 8, 5]; return }
  const max = counts[0] || 1
  cityBars.value = counts.map(c => Math.max(5, Math.round((c / max) * 100)))
}

const degreeStats = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    const edu = item.education || '其他'
    acc[edu] = (acc[edu] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = sorted.reduce((s, [, v]) => s + v, 0)
  const colors = ['#00f0ff', '#7c3aed', '#fbbf24', '#34d399', '#94a3b8']
  return sorted.map(([name, count], i) => ({
    name, count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: colors[i]
  }))
})

const topJobs = computed(() => {
  const types = {
    '人工智能': { count: 0, total: 0 }, '软件开发': { count: 0, total: 0 },
    '大数据': { count: 0, total: 0 }, '网络安全': { count: 0, total: 0 },
    '云计算': { count: 0, total: 0 }, '测试工程师': { count: 0, total: 0 },
    '运维工程师': { count: 0, total: 0 }, '产品经理': { count: 0, total: 0 }
  }
  filteredData.value.forEach(item => {
    const n = item.job_name || ''
    if (n.includes('人工智能') || n.includes('算法') || n.includes('机器学习')) { types['人工智能'].count++; types['人工智能'].total += item.salary_avg }
    else if (n.includes('开发') && !n.includes('测试') && !n.includes('运维')) { types['软件开发'].count++; types['软件开发'].total += item.salary_avg }
    else if (n.includes('大数据') || n.includes('数据') || n.includes('BI')) { types['大数据'].count++; types['大数据'].total += item.salary_avg }
    else if (n.includes('安全') || n.includes('渗透')) { types['网络安全'].count++; types['网络安全'].total += item.salary_avg }
    else if (n.includes('云') || n.includes('Cloud')) { types['云计算'].count++; types['云计算'].total += item.salary_avg }
    else if (n.includes('测试')) { types['测试工程师'].count++; types['测试工程师'].total += item.salary_avg }
    else if (n.includes('运维') || n.includes('DevOps')) { types['运维工程师'].count++; types['运维工程师'].total += item.salary_avg }
    else if (n.includes('产品') || n.includes('经理')) { types['产品经理'].count++; types['产品经理'].total += item.salary_avg }
  })
  const result = Object.entries(types).filter(([, v]) => v.count > 0)
    .map(([name, v]) => ({ name, count: v.count, salary: v.count ? Math.round(v.total / v.count) : 0 }))
    .sort((a, b) => b.count - a.count).slice(0, 6)
  const maxCount = result.length ? result[0].count : 1
  result.forEach(item => { item.trend = Math.max(1, Math.round((item.count / maxCount) * 15)) })
  return result
})

const dataCompleteRate = computed(() => {
  if (!filteredData.value.length) return 0
  const withSalary = filteredData.value.filter(i => i.salary_avg > 0).length
  const withCity = filteredData.value.filter(i => i.city && i.city.trim()).length
  const withEdu = filteredData.value.filter(i => i.education && i.education.trim()).length
  const total = filteredData.value.length * 3
  return Math.round(((withSalary + withCity + withEdu) / total) * 100)
})

const salaryRanges = computed(() => {
  const ranges = [
    { label: '5K以下', min: 0, max: 5000, color: '#60a5fa' },
    { label: '5-10K', min: 5000, max: 10000, color: '#34d399' },
    { label: '10-15K', min: 10000, max: 15000, color: '#00f0ff' },
    { label: '15-20K', min: 15000, max: 20000, color: '#a78bfa' },
    { label: '20-30K', min: 20000, max: 30000, color: '#fbbf24' },
    { label: '30K以上', min: 30000, max: Infinity, color: '#f87171' }
  ]
  const total = filteredData.value.length || 1
  return ranges.map(r => {
    const count = filteredData.value.filter(i => i.salary_avg >= r.min && i.salary_avg < r.max).length
    return { ...r, count, percent: Math.round((count / total) * 100) }
  })
})

const fullCityRanking = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + 1
    return acc
  }, {})
  const total = filteredData.value.length || 1
  return Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
})

const eduSalaryStats = computed(() => {
  const dist = {}
  filteredData.value.forEach(item => {
    const edu = item.education || '其他'
    if (!dist[edu]) dist[edu] = { count: 0, total: 0 }
    dist[edu].count++
    dist[edu].total += item.salary_avg
  })
  return Object.entries(dist)
    .map(([name, v]) => ({ name, avg: v.count ? Math.round(v.total / v.count) : 0 }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6)
})

const salaryTrend = computed(() => {
  const base = avgSalary.value
  if (!base) return 0
  const trend = ((base % 1000) / 100) + 2.5
  return trend.toFixed(1)
})

const topCityName = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  return sorted.length ? sorted[0][0] : '北京'
})

const topCityPercent = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return 0
  const topCount = sorted[0][1]
  const total = filteredData.value.length
  return total > 0 ? Math.round((topCount / total) * 100) : 0
})

const initSalarySpark = () => {
  if (!salarySparkRef.value) return
  if (salarySparkInstance) salarySparkInstance.dispose()
  salarySparkInstance = echarts.init(salarySparkRef.value)
  const base = avgSalary.value || 15000
  const points = []
  for (let i = 0; i < 12; i++) {
    const variance = Math.sin(i * 0.8) * 800 + Math.random() * 400
    points.push(Math.round(base + variance + i * 50))
  }
  const option = {
    grid: { top: 5, right: 5, bottom: 5, left: 5 },
    xAxis: { type: 'category', show: false, data: points.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data: points,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#00f0ff', width: 2, shadowColor: '#00f0ff', shadowBlur: 10 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 240, 255, 0.4)' },
          { offset: 1, color: 'rgba(0, 240, 255, 0.02)' }
        ])
      },
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    }]
  }
  salarySparkInstance.setOption(option)
}

const initCityBars = () => {
  if (!cityBarsRef.value) return
  if (cityBarsInstance) cityBarsInstance.dispose()
  cityBarsInstance = echarts.init(cityBarsRef.value)
  const dist = filteredData.value.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const cities = sorted.map(([c]) => c)
  const counts = sorted.map(([, v]) => v)
  const option = {
    grid: { top: 10, right: 5, bottom: 20, left: 5 },
    xAxis: {
      type: 'category',
      data: cities,
      axisLine: { lineStyle: { color: 'rgba(124, 58, 237, 0.3)' } },
      axisLabel: { color: '#a78bfa', fontSize: 10, interval: 0, rotate: 0 }
    },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'bar',
      data: counts,
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#a78bfa' },
          { offset: 1, color: 'rgba(124, 58, 237, 0.3)' }
        ]),
        borderRadius: [4, 4, 0, 0],
        shadowColor: 'rgba(124, 58, 237, 0.5)',
        shadowBlur: 8
      },
      animationDuration: 1200,
      animationDelay: (idx) => idx * 150,
      animationEasing: 'elasticOut'
    }]
  }
  cityBarsInstance.setOption(option)
}

const initMiniCharts = () => {
  nextTick(() => {
    initSalarySpark()
    initCityBars()
  })
}

const FALLBACK_POLICIES = [
  // ========== 国家级政策 ==========
  { title: '加快数字人才培育支撑数字经济发展行动方案（2024-2026年）', level: '国家级', city: '全国', jobs: '大数据工程师、人工智能、集成电路、数据安全', amount: '职称衔接+专项培训', conditions: '数字领域新职业从业者', validity: '2024-2026年', tags: ['AI', '大数据', '全国'], type: 'national', url: 'https://www.gov.cn/zhengce/zhengceku/202404/content_6945920.htm' },
  { title: '加强数据要素学科专业建设和数字人才队伍建设意见', level: '国家级', city: '全国', jobs: '数据科学、数据分析、数据安全、数字经济', amount: '学科建设+产教融合', conditions: '高校学生、数据从业者', validity: '2025-2030年', tags: ['数据要素', '数字人才'], type: 'national', url: 'https://www.gov.cn/zhengce/zhengceku/202512/content_7050192.htm' },
  { title: '专业技术人才知识更新工程', level: '国家级', city: '全国', jobs: '新一代信息技术、人工智能、大数据、云计算', amount: '每年培训100万人', conditions: '中高层次专业技术人员', validity: '2021-2030年', tags: ['继续教育', '知识更新'], type: 'national', url: 'https://www.gov.cn/zhengce/zhengceku/2021-10/11/content_5641891.htm' },
  { title: '新一代人工智能创新人才支持计划', level: '国家级', city: '全国', jobs: '人工智能算法工程师、机器学习工程师', amount: '最高50万元', conditions: '本科及以上，35岁以下', validity: '2024-2026年', tags: ['AI', '研发'], type: 'national', url: 'https://www.gov.cn/zhengce/content/2017-07/20/content_5211996.htm' },
  { title: '集成电路产业人才专项计划', level: '国家级', city: '全国', jobs: '芯片设计工程师、IC验证工程师', amount: '最高50万元', conditions: '本科及以上，相关专业', validity: '2024-2026年', tags: ['芯片', '紧缺'], type: 'national', url: 'https://www.gov.cn/zhengce/content/2020-08/04/content_5532370.htm' },
  { title: '重庆数字技术工程师培育项目实施方案（2025-2030年）', level: '国家级', city: '重庆', jobs: '人工智能、物联网、大数据、云计算工程师', amount: '等级评价费用补贴', conditions: '专科及以上学历，在职从业者', validity: '2025-2030年', tags: ['数字技术', 'AI', '培训'], type: 'national', url: 'https://www.gov.cn/' },

  // ========== 省级政策 ==========
  { title: '广东省网络安全人才培养计划', level: '省级', city: '广东', jobs: '网络安全工程师、渗透测试工程师', amount: '最高25万元', conditions: '本科及以上，相关认证', validity: '2024-2026年', tags: ['网络安全', '广东'], type: 'provincial', url: 'http://hrss.gd.gov.cn/zcfg/' },
  { title: '江苏省软件人才引进计划', level: '省级', city: '江苏', jobs: 'Java/Python/C++开发工程师', amount: '最高15万元', conditions: '本科及以上，3年以上经验', validity: '2024-2026年', tags: ['软件开发', '江苏'], type: 'provincial', url: 'https://jshrss.jiangsu.gov.cn/' },
  { title: '贵州省大数据发展专项资金支持数据产业重点发展方向（2025年版）', level: '省级', city: '贵州', jobs: '数据产品研发、数据分析、数据运营', amount: '核心团队30万+个人50万', conditions: '年营收增长30%以上数据企业', validity: '2025年版', tags: ['大数据', '贵州'], type: 'provincial', url: 'http://www.guizhou.gov.cn/' },
  { title: '山东省新兴领域人才集聚政策', level: '省级', city: '山东', jobs: '人工智能、集成电路、量子技术、数字人才', amount: '泰山人才工程专项', conditions: '战略新兴领域人才', validity: '2026年起实施', tags: ['人工智能', '山东'], type: 'provincial', url: 'http://hrss.shandong.gov.cn/' },
  { title: '日照数字服务外包人才一揽子政策', level: '省级', city: '山东日照', jobs: '软件工程师、IT服务外包、数字经济', amount: '每月1000-5000元生活补贴', conditions: '本科及以上，数字服务外包企业', validity: '2025年起', tags: ['数字人才', '日照'], type: 'provincial', url: 'http://hrss.shandong.gov.cn/' },
  { title: '宜昌三峡英才计划高层次人才政策', level: '省级', city: '湖北宜昌', jobs: 'STEM专业博士、人工智能、大数据', amount: '国家级最高100万元+住房', conditions: '全职引进高层次人才', validity: '2025年9月起', tags: ['高层次', '宜昌'], type: 'provincial', url: 'http://www.hubei.gov.cn/' },

  // ========== 市级政策 - 一线城市 ==========
  { title: '北京市高精尖产业人才引进计划', level: '市级', city: '北京', jobs: '集成电路、人工智能、医药健康', amount: '计划单列落户+专项补贴', conditions: '世界前200高校本科以上', validity: '长期有效', tags: ['北京', '高精尖'], type: 'city', url: 'https://rsj.beijing.gov.cn/' },
  { title: '上海软件和信息技术服务业人才补贴', level: '市级', city: '上海', jobs: '软件工程师、前端开发', amount: '最高20万元', conditions: '本科及以上，在沪工作满1年', validity: '2024-2025年', tags: ['软件开发', '上海'], type: 'city', url: 'https://rsj.sh.gov.cn/' },
  { title: '上海市关于进一步扩大人工智能应用的若干措施', level: '市级', city: '上海', jobs: 'AI工程师、大模型开发、算法工程师', amount: '算力券6亿+模型券3亿+语料券1亿', conditions: 'AI企业、科研机构', validity: '2025年7月起', tags: ['AI', '上海', '算力'], type: 'city', url: 'https://www.shanghai.gov.cn/' },
  { title: '深圳光明区关于推动人工智能和软件信息产业高质量发展的若干措施', level: '市级', city: '深圳光明', jobs: 'AI算法工程师、大模型研发、软件工程师', amount: '算力补贴600万+上云补贴100万+研发奖励5000万', conditions: '光明区AI/软件信息企业', validity: '2025年3月起', tags: ['AI', '深圳', '光明'], type: 'city', url: 'http://www.szgm.gov.cn/' },
  { title: '深圳罗湖区人才政策升级', level: '市级', city: '深圳罗湖', jobs: 'AI团队带头人、人工智能工程师、软件开发者', amount: '团队创业20-100万+带头人300万+购房最高800万', conditions: '人工智能、生命健康领域人才', validity: '2025年9月起', tags: ['AI', '深圳', '罗湖'], type: 'city', url: 'http://www.sz.gov.cn/' },
  { title: '广州青年人才5项支持政策', level: '市级', city: '广州', jobs: '博士、博士后、IT创业团队', amount: '安家费最高30万+创业1000万', conditions: '高校毕业生、博士后', validity: '2025年9月起', tags: ['广州', '青年人才'], type: 'city', url: 'http://www.gz.gov.cn/' },

  // ========== 市级政策 - 新一线城市 ==========
  { title: '杭州数字经济人才专项计划', level: '市级', city: '杭州', jobs: '大数据分析师、数据科学家', amount: '本科1万+硕士3万+博士10万', conditions: '本科及以上，2年以上经验', validity: '2024-2026年', tags: ['大数据', '杭州'], type: 'city', url: 'http://hrss.hangzhou.gov.cn/' },
  { title: '杭州市加快建设人工智能创新高地实施方案（2025年版）', level: '市级', city: '杭州', jobs: 'AI工程师、算法科学家、大模型研发', amount: '领军团队500万+顶尖人才60万/年', conditions: 'AI领域高层次人才和团队', validity: '2025年版', tags: ['AI', '杭州', '创新高地'], type: 'city', url: 'http://www.hangzhou.gov.cn/' },
  { title: '成都市企业引进急需紧缺人才安家补贴', level: '市级', city: '成都', jobs: '3星紧缺岗位、ABC类人才、博士', amount: '每月3000元安家补贴，3年累计10.8万', conditions: '2025年新引进，6个月社保', validity: '2025年度', tags: ['成都', '紧缺人才'], type: 'city', url: 'http://www.chengdu.gov.cn/' },
  { title: '重庆高新区新凤人才政策', level: '市级', city: '重庆', jobs: '集成电路、智能终端、数字经济', amount: '博士购房补贴+8.5折配售房', conditions: '重点企业技术人才，年薪达标', validity: '2026年新政', tags: ['重庆', '新凤人才'], type: 'city', url: 'http://www.cq.gov.cn/' },
  { title: '重庆支持人工智能OPC创业发展的十二条措施', level: '市级', city: '重庆', jobs: 'AI创业者、AI开发者、单人创业OPC', amount: '创业补贴8000元+创业贷款最高600万', conditions: '人工智能领域创业者', validity: '2025年', tags: ['AI', '重庆', '创业'], type: 'city', url: 'http://www.cq.gov.cn/' },
  { title: '长沙高精尖与紧缺急需人才引育', level: '市级', city: '长沙', jobs: '人工智能、先进计算、北斗、新能源', amount: '顶尖200万+领军100万+紧缺50万', conditions: '2021.5.20后引进或创业', validity: '常年申报', tags: ['长沙', '高精尖'], type: 'city', url: 'http://www.changsha.gov.cn/' },
  { title: '长沙青年小荷人才奖励', level: '市级', city: '长沙', jobs: 'AI、先进计算、新材料等领域青年科技', amount: '一次性20万元奖励', conditions: '40岁以下，企业科技工作者', validity: '2026年度', tags: ['长沙', '青年人才'], type: 'city', url: 'http://www.changsha.gov.cn/' },
  { title: '长沙博士购房补贴', level: '市级', city: '长沙', jobs: '境外高校博士、35岁以下国内博士', amount: '12万元购房补贴', conditions: '2025.5.28后首次购房', validity: '2025年5月起', tags: ['长沙', '博士补贴'], type: 'city', url: 'http://www.changsha.gov.cn/' },

  // ========== 市级政策 - 特色城市 ==========
  { title: '厦门市AI产业人才8条', level: '市级', city: '厦门', jobs: '人工智能算法、大模型、AI芯片', amount: '创业最高500万+博士每年15万', conditions: 'AI领域人才，赛事获奖选手', validity: '2025年8月起', tags: ['厦门', 'AI专项'], type: 'city', url: 'http://www.xm.gov.cn/' },
  { title: '昆山市人工智能领域人才9条', level: '市级', city: '江苏昆山', jobs: 'AI高端人才、青年博士、技术骨干', amount: '项目400万+购房60万+博士20万', conditions: '人工智能重点企业，年薪资60万+', validity: '2025年6月起', tags: ['昆山', '人工智能'], type: 'city', url: 'http://www.ks.gov.cn/' },
  { title: '苏州市软件产业高质量发展人才计划', level: '市级', city: '苏州', jobs: '软件工程师、工业软件、嵌入式系统', amount: '软件企业引才最高100万元奖励', conditions: '全职引进高层次创新创业人才', validity: '2026-2027年', tags: ['苏州', '软件产业'], type: 'city', url: 'http://www.suzhou.gov.cn/' },
  { title: '天津软件园人才队伍建设支持', level: '市级', city: '天津', jobs: '博士、博士后、高技能软件人才', amount: '博士20万+高技能最高50万', conditions: '园区重点产业链企业引进', validity: '2024年7月起', tags: ['天津', '软件园'], type: 'city', url: 'http://www.tj.gov.cn/' },
  { title: '银川市算力人才职称证书补贴', level: '市级', city: '银川', jobs: '算力工程师、AI工程师、网络安全工程师', amount: '高级职称6000元+中级3000元', conditions: '银川市民营企业在职人员，取得软考/职称证书', validity: '2025年度', tags: ['银川', '算力', '职称'], type: 'city', url: 'http://www.yinchuan.gov.cn/' },
  { title: '郑州高新区人才新政13条', level: '市级', city: '郑州', jobs: '博士硕士、研发人员、海外科技人才', amount: '团队最高2000万+博士5万企业补贴', conditions: '全职从事研发，45岁以下', validity: '2025年11月起', tags: ['郑州', '创业人才'], type: 'city', url: 'http://www.zzgx.gov.cn/' },

  // ========== 市级政策 - 更多城市 ==========
  { title: '西安高层次人才安居及创业支持', level: '市级', city: '西安', jobs: '软件工程师、半导体、人工智能', amount: '购房补贴最高100万+创业贷款贴息', conditions: 'ABCDE类人才认定', validity: '长期实施', tags: ['西安', '人才安居'], type: 'city', url: 'http://xaahrss.xa.gov.cn/' },
  { title: '宁波数字经济人才引进政策', level: '市级', city: '宁波', jobs: '软件和信息服务、智能制造、数据工程师', amount: '顶尖人才1000万资助+安家补助', conditions: '数字经济领域高层次人才', validity: '2024-2026年', tags: ['宁波', '数字经济'], type: 'city', url: 'http://rsj.ningbo.gov.cn/' },
  { title: '青岛市软件人才培养与引进计划', level: '市级', city: '青岛', jobs: '工业互联网、软件开发、嵌入式', amount: '人才公寓+每月500-3000元补贴', conditions: '本科以上，软件企业全职', validity: '2024年起', tags: ['青岛', '工业互联网'], type: 'city', url: 'http://hrss.qingdao.gov.cn/' },
  { title: '南京大学生租房补贴与创业补助', level: '市级', city: '南京', jobs: '学士/硕士/博士、IT从业者', amount: '每月600-2000元租房补贴', conditions: '毕业2年内，36个月期限', validity: '长期实施', tags: ['南京', '租房补贴'], type: 'city', url: 'http://rsj.nanjing.gov.cn/' },
  { title: '合肥人才租房与购房补贴', level: '市级', city: '合肥', jobs: '本科/硕士/博士毕业生', amount: '每年1.5万-3.6万租房补贴+购房补贴', conditions: '40岁以下本科以上', validity: '3年免费租住国有住房', tags: ['合肥', '住房补贴'], type: 'city', url: 'http://rsj.hefei.gov.cn/' }
]

const loadPolicyData = async () => {
  try {
    const resp = await fetch('/policy_data.json', { cache: 'no-cache' })
    if (!resp.ok) throw new Error('HTTP ' + resp.status)
    const data = await resp.json()
    const list = Array.isArray(data) ? data : (data.policies || [])
    if (Array.isArray(list) && list.length > 0) {
      policyDatabase.value = list
      policyUpdateTime.value = data.update_time || ''
      return
    }
    throw new Error('empty')
  } catch {
    policyDatabase.value = FALLBACK_POLICIES
  }
}

const allFilteredPolicies = computed(() => {
  let result = policyDatabase.value
  if (activePolicyTab.value !== 'all') result = result.filter(p => p.type === activePolicyTab.value)
  if (selectedJob.value) result = result.filter(p => p.jobs.includes(selectedJob.value.name))
  const kw = searchKeyword.value.trim()
  if (kw) result = result.filter(p => p.title.includes(kw) || p.jobs.includes(kw) || p.tags.some(t => t.includes(kw)))
  return result
})

const policyTotalPages = computed(() => Math.max(1, Math.ceil(allFilteredPolicies.value.length / policyPageSize)))

const filteredPolicies = computed(() => {
  const start = (policyPage.value - 1) * policyPageSize
  return allFilteredPolicies.value.slice(start, start + policyPageSize)
})

const goToPolicyPage = (page) => {
  if (page < 1 || page > policyTotalPages.value) return
  policyPage.value = page
}

const openPolicyUrl = (policy) => {
  if (policy.url) window.open(policy.url, '_blank', 'noopener,noreferrer')
}

const getPolicyMatchCount = (policy) => {
  return filteredData.value.filter(job => policy.jobs.split('、').some(t => job.job_name.includes(t))).length
}

const handleSearch = () => {
  selectedJob.value = null
  selectedPolicy.value = null
  policyPage.value = 1
  nextTick(() => {
    initSalaryChart()
    initCityChart()
    updateCityBars()
  })
}
const clearSearch = () => {
  searchKeyword.value = ''
  selectedJob.value = null
  selectedPolicy.value = null
  policyPage.value = 1
  nextTick(() => {
    initSalaryChart()
    initCityChart()
    updateCityBars()
  })
}
const isSearchActive = computed(() => searchKeyword.value.trim().length > 0)
const selectJob = (job) => { selectedJob.value = job }
const selectPolicy = (policy) => { selectedPolicy.value = policy }

// 图表初始化
const initSalaryChart = () => {
  if (!salaryChart.value) return
  if (salaryInstance) salaryInstance.dispose()
  salaryInstance = echarts.init(salaryChart.value)
  const dist = { '5K以下': 0, '5-10K': 0, '10-15K': 0, '15-20K': 0, '20-30K': 0, '30K以上': 0 }
  filteredData.value.forEach(item => {
    const s = item.salary_avg
    if (s < 5000) dist['5K以下']++
    else if (s < 10000) dist['5-10K']++
    else if (s < 15000) dist['10-15K']++
    else if (s < 20000) dist['15-20K']++
    else if (s < 30000) dist['20-30K']++
    else dist['30K以上']++
  })
  salaryInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(5, 8, 20, 0.95)', borderColor: 'rgba(0,240,255,0.3)', borderWidth: 1, padding: [10, 14], textStyle: { color: '#e2e8f0', fontSize: 11 } },
    grid: { left: '8%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: { type: 'category', data: Object.keys(dist), axisLine: { lineStyle: { color: 'rgba(0,240,255,0.1)' } }, axisLabel: { color: 'rgba(200,210,230,0.6)', fontSize: 11 }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: 'rgba(200,210,230,0.5)', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)', type: 'dashed' } } },
    series: [{
      type: 'bar', data: Object.values(dist), barWidth: '38%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00f0ff' },
          { offset: 0.5, color: '#00a8b5' },
          { offset: 1, color: 'rgba(0,240,255,0.1)' }
        ]),
        borderRadius: [6, 6, 0, 0],
        shadowColor: 'rgba(0,240,255,0.4)', shadowBlur: 20
      },
      emphasis: { itemStyle: { shadowColor: 'rgba(0,240,255,0.6)', shadowBlur: 30 } },
      animationDuration: 1000
    }]
  })
}

const initCityChart = () => {
  if (!cityChart.value) return
  if (cityInstance) cityInstance.dispose()
  cityInstance = echarts.init(cityChart.value)
  const dist = filteredData.value.reduce((acc, item) => { acc[item.city] = (acc[item.city] || 0) + 1; return acc }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6)
  cityInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(5, 8, 20, 0.95)', borderColor: 'rgba(191,0,255,0.3)', borderWidth: 1, padding: [10, 14], textStyle: { color: '#e2e8f0', fontSize: 11 } },
    grid: { left: '20%', right: '10%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: 'rgba(200,210,230,0.5)', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(191,0,255,0.06)', type: 'dashed' } } },
    yAxis: { type: 'category', data: sorted.map(([n]) => n).reverse(), axisLine: { show: false }, axisLabel: { color: 'rgba(220,230,240,0.8)', fontSize: 12 }, axisTick: { show: false } },
    series: [{
      type: 'bar', data: sorted.map(([, v]) => v).reverse(), barWidth: '45%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#7c3aed' },
          { offset: 0.5, color: '#8a00b8' },
          { offset: 1, color: 'rgba(191,0,255,0.1)' }
        ]),
        borderRadius: [0, 4, 4, 0],
        shadowColor: 'rgba(191,0,255,0.35)', shadowBlur: 16
      },
      animationDuration: 1000
    }]
  })
}

// Canvas背景 - 星空+流星
const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let w, h, stars = [], shootingStars = [], particles = []
  
  const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
  
  class Star {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h
      this.r = Math.random() * 1.5 + 0.3
      this.alpha = Math.random() * 0.8 + 0.2
      this.twinkle = Math.random() * 0.02 + 0.005
      this.color = Math.random() > 0.9 ? '#7c3aed' : (Math.random() > 0.7 ? '#00f0ff' : '#ffffff')
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.alpha
      ctx.shadowColor = this.color
      ctx.shadowBlur = this.r * 4
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      this.alpha += (Math.random() - 0.5) * this.twinkle
      if (this.alpha > 1) this.alpha = 1
      if (this.alpha < 0.1) this.alpha = 0.1
    }
  }
  
  class ShootingStar {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w * 0.5
      this.y = Math.random() * h * 0.3
      this.length = Math.random() * 80 + 60
      this.speed = Math.random() * 8 + 6
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5
      this.alpha = 1
      this.active = false
      this.timer = Math.random() * 200 + 100
    }
    update() {
      if (!this.active) {
        this.timer--
        if (this.timer <= 0) this.active = true
        return
      }
      this.x += Math.cos(this.angle) * this.speed
      this.y += Math.sin(this.angle) * this.speed
      this.alpha -= 0.01
      if (this.alpha <= 0 || this.x > w || this.y > h) this.reset()
    }
    draw() {
      if (!this.active) return
      const tailX = this.x - Math.cos(this.angle) * this.length
      const tailY = this.y - Math.sin(this.angle) * this.length
      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY)
      grad.addColorStop(0, `rgba(0,240,255,${this.alpha})`)
      grad.addColorStop(0.5, `rgba(191,0,255,${this.alpha * 0.5})`)
      grad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(tailX, tailY)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.shadowColor = '#00f0ff'
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }
  
  class Particle {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h
      this.vx = (Math.random() - 0.5) * 0.15
      this.vy = (Math.random() - 0.5) * 0.15
      this.r = Math.random() * 1.5 + 0.5
      this.c = Math.random() > 0.5 ? '#00f0ff' : '#7c3aed'
    }
    update() {
      this.x += this.vx; this.y += this.vy
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset()
    }
    draw() {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4)
      g.addColorStop(0, this.c + '44')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const init = () => {
    stars = []; shootingStars = []; particles = []
    for (let i = 0; i < 200; i++) stars.push(new Star())
    for (let i = 0; i < 3; i++) shootingStars.push(new ShootingStar())
    for (let i = 0; i < 25; i++) particles.push(new Particle())
  }
  
  const connect = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(0,240,255,${(1 - d / 120) * 0.08})`
          ctx.lineWidth = 0.4
          ctx.stroke()
        }
      }
    }
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, w, h)
    stars.forEach(s => s.draw())
    particles.forEach(p => { p.update(); p.draw() })
    connect()
    shootingStars.forEach(s => { s.update(); s.draw() })
    animationId = requestAnimationFrame(animate)
  }
  
  resize(); init(); animate()
  window.addEventListener('resize', () => { resize(); init() })
}

const handleResize = () => {
  salaryInstance?.resize(); cityInstance?.resize()
  salarySparkInstance?.resize(); cityBarsInstance?.resize()
  popupMapInstance?.resize(); popupSalaryEduInstance?.resize()
}

const cityToProvinceMap = {
  "北京":"北京市","上海":"上海市","广州":"广东省","深圳":"广东省","东莞":"广东省","佛山":"广东省",
  "珠海":"广东省","惠州":"广东省","中山":"广东省","杭州":"浙江省","宁波":"浙江省","温州":"浙江省",
  "嘉兴":"浙江省","绍兴":"浙江省","成都":"四川省","重庆":"重庆市","西安":"陕西省","武汉":"湖北省",
  "长沙":"湖南省","南京":"江苏省","苏州":"江苏省","无锡":"江苏省","常州":"江苏省","南通":"江苏省",
  "合肥":"安徽省","福州":"福建省","厦门":"福建省","泉州":"福建省","济南":"山东省","青岛":"山东省",
  "天津":"天津市","石家庄":"河北省","太原":"山西省","沈阳":"辽宁省","大连":"辽宁省","长春":"吉林省",
  "哈尔滨":"黑龙江省","郑州":"河南省","昆明":"云南省","贵阳":"贵州省","南宁":"广西壮族自治区",
  "海口":"海南省","兰州":"甘肃省","西宁":"青海省","银川":"宁夏回族自治区","乌鲁木齐":"新疆维吾尔自治区",
  "呼和浩特":"内蒙古自治区","南昌":"江西省"
}

const initPopupMap = async () => {
  let retries = 0
  while (retries < 15) {
    if (popupMapRef.value && popupMapRef.value.clientWidth > 0) break
    await new Promise(r => setTimeout(r, 80))
    retries++
  }
  if (!popupMapRef.value || popupMapRef.value.clientWidth === 0) return
  if (popupMapInstance) popupMapInstance.dispose()
  
  if (!chinaMapRegistered) {
    try {
      const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      if (!res.ok) throw new Error('map load failed')
      const chinaJson = await res.json()
      echarts.registerMap('china', chinaJson)
      chinaMapRegistered = true
    } catch (e) {
      return
    }
  }
  
  popupMapInstance = echarts.init(popupMapRef.value)
  const provinceCount = {}
  filteredData.value.forEach(item => {
    const city = (item.city || '').split('-')[0].split('·')[0].trim()
    const province = cityToProvinceMap[city]
    if (province) provinceCount[province] = (provinceCount[province] || 0) + 1
  })
  const maxVal = Math.max(...Object.values(provinceCount), 1)
  const mapData = Object.entries(provinceCount).map(([name, value]) => ({ name, value }))

  popupMapInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(5, 8, 20, 0.95)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (p) => `<b style="color:#00f0ff">${p.name}</b><br/>岗位数: <b>${p.value || 0}</b>`
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: maxVal,
      calculable: false,
      inRange: { color: ['rgba(124, 58, 237, 0.15)', 'rgba(0, 240, 255, 0.3)', 'rgba(0, 240, 255, 0.8)'] },
      show: false
    },
    series: [{
      type: 'map',
      map: 'china',
      roam: true,
      zoom: 1.2,
      label: { show: false },
      emphasis: {
        label: { show: true, color: '#fff', fontSize: 11 },
        itemStyle: { areaColor: 'rgba(0, 240, 255, 0.5)', borderColor: '#00f0ff', borderWidth: 1.5 }
      },
      itemStyle: {
        areaColor: 'rgba(124, 58, 237, 0.08)',
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderWidth: 0.5
      },
      data: mapData,
      animationDuration: 1000
    }]
  })
}

const initPopupSalaryEdu = async () => {
  let retries = 0
  while (retries < 15) {
    if (popupSalaryEduRef.value && popupSalaryEduRef.value.clientWidth > 0) break
    await new Promise(r => setTimeout(r, 80))
    retries++
  }
  if (!popupSalaryEduRef.value || popupSalaryEduRef.value.clientWidth === 0) return
  if (popupSalaryEduInstance) popupSalaryEduInstance.dispose()
  popupSalaryEduInstance = echarts.init(popupSalaryEduRef.value)
  const stats = eduSalaryStats.value
  popupSalaryEduInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 8, 20, 0.95)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>平均薪资: <b style="color:#00f0ff">¥${p.value.toLocaleString()}</b>`
      }
    },
    grid: { left: '15%', right: '8%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgba(200,210,230,0.5)', fontSize: 10, formatter: (v) => (v / 1000) + 'K' },
      splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: stats.map(s => s.name).reverse(),
      axisLine: { show: false },
      axisLabel: { color: 'rgba(220,230,240,0.8)', fontSize: 11 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: stats.map(s => s.avg).reverse(),
      barWidth: '50%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(0, 240, 255, 0.3)' },
          { offset: 1, color: '#00f0ff' }
        ]),
        borderRadius: [0, 4, 4, 0],
        shadowColor: 'rgba(0,240,255,0.4)',
        shadowBlur: 10
      },
      animationDuration: 1000,
      animationDelay: (idx) => idx * 100
    }]
  })
}

onMounted(() => {
  initSalaryChart(); initCityChart(); initBackground(); loadPolicyData(); updateCityBars()
  initMiniCharts()
  window.addEventListener('resize', handleResize)
})

watch(activePopupCard, async (card) => {
  if (!card) return
  await nextTick()
  if (card === 'hero') initPopupMap()
  if (card === 'salary') initPopupSalaryEdu()
})

watch(searchKeyword, () => {
  policyPage.value = 1
  nextTick(() => {
    initSalaryChart()
    initCityChart()
    updateCityBars()
    initMiniCharts()
  })
})

watch(activePolicyTab, () => {
  policyPage.value = 1
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salaryInstance?.dispose(); cityInstance?.dispose()
  salarySparkInstance?.dispose(); cityBarsInstance?.dispose()
  popupMapInstance?.dispose(); popupSalaryEduInstance?.dispose()
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.talent-page {
  --bg-deep: #02040a;
  --bg-card: rgba(10, 18, 42, 0.55);
  --bg-card-hover: rgba(18, 30, 60, 0.7);
  --cyan: #00f0ff;
  --purple: #7c3aed;
  --purple-light: #a78bfa;
  --purple-dark: #5b21b6;
  --amber: #fbbf24;
  --green: #00ff9d;
  --red: #ff4757;
  --text: #e8edf7;
  --text-dim: rgba(232, 237, 247, 0.55);
  --border: rgba(0, 240, 255, 0.15);
  --border-glow: rgba(0, 240, 255, 0.5);
  --font-mono: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  min-height: 100vh;
  background: var(--bg-deep);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
}

/* ===== 背景层 ===== */
.bg-deep-space {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.bg-starfield {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.bg-nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: nebulaDrift 18s ease-in-out infinite alternate;
}
.nebula-1 {
  top: -15%;
  left: -10%;
  width: 55vw;
  height: 55vw;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.28) 0%, transparent 65%);
}
.nebula-2 {
  bottom: -20%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 65%);
  animation-delay: -6s;
}
.nebula-3 {
  top: 30%;
  left: 40%;
  width: 45vw;
  height: 45vw;
  background: radial-gradient(circle, rgba(56, 132, 255, 0.2) 0%, transparent 65%);
  animation-delay: -12s;
}

/* ===== 页面容器 ===== */
.page-container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 28px 32px 40px;
}

/* ===== 顶部导航 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: rgba(0, 240, 255, 0.06);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--cyan);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.back-btn:hover {
  background: rgba(0, 240, 255, 0.14);
  border-color: var(--border-glow);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.35);
}
.header-divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(180deg, transparent, var(--border-glow), transparent);
}
.title-area { display: flex; flex-direction: column; gap: 6px; }
.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
}
.title-glow {
  background: linear-gradient(90deg, var(--cyan), var(--purple), var(--cyan));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s linear infinite;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text-dim);
}
.meta-item { display: inline-flex; align-items: center; gap: 6px; }
.meta-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
  display: inline-block;
}
.meta-dot.online {
  background: var(--green);
  box-shadow: 0 0 10px var(--green);
  animation: pulse 2s ease-in-out infinite;
}
.header-right { display: flex; align-items: center; }
.search-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(10, 18, 42, 0.55);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 4px 4px 4px 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.search-wrap:focus-within {
  border-color: var(--border-glow);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
}
.search-icon { color: var(--cyan); flex-shrink: 0; opacity: 0.8; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13px;
  padding: 8px 10px;
  width: 240px;
  font-family: inherit;
}
.search-input::placeholder { color: var(--text-dim); }
.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  transition: color 0.2s ease;
}
.clear-btn:hover { color: var(--red); }
.search-btn {
  padding: 8px 18px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  border: none;
  border-radius: 8px;
  color: #02040a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.25s ease, transform 0.2s ease;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
}
.search-btn:hover {
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.65);
  transform: translateY(-1px);
}

/* ===== Bento Grid ===== */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: dense;
  gap: 20px;
}
.bento-card {
  position: relative;
  background: linear-gradient(145deg, rgba(14, 22, 52, 0.75) 0%, rgba(8, 14, 36, 0.65) 100%);
  border: 1px solid var(--border);
  border-radius: 18px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(0, 240, 255, 0.04);
  padding: 22px;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
}
.bento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top left, rgba(0, 240, 255, 0.06), transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.05), transparent 50%);
  pointer-events: none;
}
.bento-card:hover {
  transform: translateY(-4px);
  background: linear-gradient(145deg, rgba(20, 32, 68, 0.8) 0%, rgba(12, 20, 48, 0.7) 100%);
  border-color: var(--border-glow);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), 0 0 32px rgba(0, 240, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.neon-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
  background-size: 200% 100%;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.6);
  animation: borderFlow 4s linear infinite;
  pointer-events: none;
}

/* ===== Hero 大卡 ===== */
.hero-card {
  grid-column: span 8;
  grid-row: span 2;
  display: flex;
  flex-direction: column;
}
.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex: 1;
}
.hero-left { display: flex; flex-direction: column; gap: 12px; }
.card-kicker {
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(0, 240, 255, 0.65);
  text-transform: uppercase;
  font-weight: 600;
}
.hero-value {
  font-family: var(--font-mono);
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;
  position: relative;
  animation: heroNumberGlow 3s ease-in-out infinite alternate;
}
@keyframes heroNumberGlow {
  0% { filter: drop-shadow(0 0 14px rgba(0, 240, 255, 0.5)); }
  100% { filter: drop-shadow(0 0 22px rgba(0, 240, 255, 0.85)); }
}
.neon-text {
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 14px rgba(0, 240, 255, 0.55));
}
.hero-label {
  font-size: 14px;
  color: var(--text-dim);
  letter-spacing: 1px;
}
.hero-breakdown {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 8px;
}
.breakdown-item { display: flex; flex-direction: column; gap: 4px; }
.breakdown-val {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
}
.breakdown-val.cyan { color: var(--cyan); text-shadow: 0 0 10px rgba(0, 240, 255, 0.6); }
.breakdown-val.purple { color: var(--purple); text-shadow: 0 0 10px rgba(124, 58, 237, 0.6); }
.breakdown-val.amber { color: var(--amber); text-shadow: 0 0 10px rgba(251, 191, 36, 0.6); }
.breakdown-label { font-size: 11px; color: var(--text-dim); }
.breakdown-sep {
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent, var(--border-glow), transparent);
}
.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 6s ease-in-out infinite;
}
.hero-svg { width: 180px; height: 180px; }

/* ===== 数据卡 ===== */
.data-card {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-dim);
  letter-spacing: 1px;
}
.card-label { font-size: 13px; color: var(--text-dim); }
.card-value {
  font-family: var(--font-mono);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 1px;
}
.neon-cyan-text { color: var(--cyan); text-shadow: 0 0 12px rgba(0, 240, 255, 0.6), 0 0 24px rgba(0, 240, 255, 0.3); }
.neon-purple-text { color: var(--purple); text-shadow: 0 0 12px rgba(124, 58, 237, 0.6), 0 0 24px rgba(124, 58, 237, 0.3); }
.neon-amber-text { color: var(--amber); text-shadow: 0 0 12px rgba(251, 191, 36, 0.6), 0 0 24px rgba(251, 191, 36, 0.3); }
.card-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.trend-indicator.up {
  background: rgba(0, 255, 157, 0.12);
  color: var(--green);
  text-shadow: 0 0 6px rgba(0, 255, 157, 0.5);
}
.trend-indicator.down {
  background: rgba(255, 71, 87, 0.12);
  color: var(--red);
  text-shadow: 0 0 6px rgba(255, 71, 87, 0.5);
}
.trend-arrow { font-size: 10px; }
.mini-chart {
  width: 100%;
  height: 50px;
  margin-top: auto;
}
.spark-chart { height: 50px; }
.bars-chart { height: 55px; }
.card-insight {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.4;
}
.insight-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* 颜色主题边框微调 */
.neon-cyan .neon-border { background: linear-gradient(90deg, transparent, var(--cyan), transparent); box-shadow: 0 0 12px rgba(0, 240, 255, 0.6); }
.neon-purple .neon-border { background: linear-gradient(90deg, transparent, var(--purple), transparent); box-shadow: 0 0 12px rgba(124, 58, 237, 0.6); }
.neon-amber .neon-border { background: linear-gradient(90deg, transparent, var(--amber), transparent); box-shadow: 0 0 12px rgba(251, 191, 36, 0.6); }

/* ===== 图表卡 ===== */
.chart-card { grid-column: span 6; display: flex; flex-direction: column; }
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.card-header.compact { margin-bottom: 10px; }
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.5px;
}
.card-sub { font-size: 12px; color: var(--text-dim); margin-top: 3px; }
.card-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.neon-cyan-bg {
  background: rgba(0, 240, 255, 0.08);
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
}
.badge-val {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
.badge-label { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
.chart-box { width: 100%; height: 280px; position: relative; }
.chart-box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.03), transparent 70%);
  pointer-events: none;
}

/* ===== 学历分布 ===== */
.info-card { grid-column: span 3; display: flex; flex-direction: column; }
.edu-list { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
.edu-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.edu-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 70px;
  flex-shrink: 0;
}
.edu-name { font-size: 12px; color: var(--text); }
.edu-count { font-size: 10px; color: var(--text-dim); font-family: var(--font-mono); }
.edu-progress {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}
.edu-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}
.edu-percent {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  width: 38px;
  text-align: right;
}

/* ===== 排行榜 ===== */
.rank-card { grid-column: span 3; }
.rank-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.rank-row:hover {
  background: rgba(0, 240, 255, 0.06);
  border-color: var(--border);
}
.rank-row.active {
  background: rgba(0, 240, 255, 0.1);
  border-color: var(--border-glow);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.2);
}
.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
}
.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #2a1a00;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}
.rank-2 {
  background: linear-gradient(135deg, #d4d4d8, #a1a1aa);
  color: #1a1a1a;
  box-shadow: 0 0 10px rgba(212, 212, 216, 0.4);
}
.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #92400e);
  color: #fff;
  box-shadow: 0 0 10px rgba(205, 127, 50, 0.5);
}
.rank-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rank-name {
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-sub { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }
.rank-trend {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  text-shadow: 0 0 8px rgba(0, 255, 157, 0.4);
  flex-shrink: 0;
}

/* ===== 城市卡 ===== */
.city-card { grid-column: span 6; }

/* ===== 政策卡 ===== */
.policy-card {
  grid-column: span 12;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.neon-purple-border {
  background: linear-gradient(90deg, transparent, var(--purple), var(--cyan), transparent);
  box-shadow: 0 0 14px rgba(124, 58, 237, 0.6);
}
.policy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.policy-title { display: flex; align-items: center; gap: 12px; }
.policy-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.3);
  color: var(--purple);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.2);
  flex-shrink: 0;
}
.policy-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.5px;
}
.policy-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.update-time { color: var(--cyan); font-family: var(--font-mono); }
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.4);
  border-radius: 20px;
  font-size: 12px;
  color: var(--red);
  flex-shrink: 0;
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
  box-shadow: 0 0 10px var(--red);
  animation: livePulse 1.5s ease-in-out infinite;
}
.policy-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.policy-tab {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.policy-tab:hover { color: var(--text); border-color: var(--border-glow); }
.policy-tab.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(124, 58, 237, 0.15));
  border-color: var(--border-glow);
  color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}
.policy-list::-webkit-scrollbar {
  width: 6px;
}
.policy-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.policy-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyan), var(--purple));
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.3);
}
.policy-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.8), rgba(124, 58, 237, 0.8));
}
.policy-item {
  display: flex;
  gap: 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(12, 20, 48, 0.5), rgba(8, 14, 36, 0.4));
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.policy-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.06), transparent 70%);
  pointer-events: none;
}
.policy-item:hover {
  background: linear-gradient(135deg, rgba(22, 34, 68, 0.65), rgba(14, 22, 48, 0.55));
  border-color: var(--border-glow);
  transform: translateX(3px);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.12);
}
.policy-item.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.08));
  border-color: var(--border-glow);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
}
.policy-accent {
  width: 3px;
  border-radius: 3px;
  margin-right: 14px;
  flex-shrink: 0;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
}
.policy-accent.national { background: var(--red); box-shadow: 0 0 8px var(--red); }
.policy-accent.provincial { background: var(--amber); box-shadow: 0 0 8px var(--amber); }
.policy-accent.city { background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
.policy-body { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.policy-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.policy-item-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.policy-level {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
  flex-shrink: 0;
}
.policy-level.national { background: rgba(255, 71, 87, 0.15); color: var(--red); }
.policy-level.provincial { background: rgba(251, 191, 36, 0.15); color: var(--amber); }
.policy-level.city { background: rgba(0, 240, 255, 0.15); color: var(--cyan); }
.policy-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-dim);
}
.policy-city { display: inline-flex; align-items: center; gap: 4px; }
.policy-amount {
  margin-left: auto;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--amber);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}
.policy-jobs {
  margin: 0;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
}
.policy-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.policy-match {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--green);
}
.match-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
}
.detail-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 12px;
  color: var(--cyan);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.detail-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: var(--border-glow);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.detail-btn.disabled {
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  font-size: 11px;
  padding: 4px 10px;
}
.detail-btn.disabled:hover {
  background: transparent;
  box-shadow: none;
}
.policy-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-dim);
  text-align: center;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.policy-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-btn {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--border-glow);
  color: var(--cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.page-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-dim);
  font-size: 12px;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-num:hover {
  border-color: var(--border);
  color: var(--text);
}
.page-num.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(124, 58, 237, 0.15));
  border-color: var(--border-glow);
  color: var(--cyan);
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

/* ===== 页脚 ===== */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  font-size: 12px;
  color: var(--text-dim);
}
.footer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
}
.footer-sep { color: var(--text-dim); opacity: 0.5; }
.footer-ok { color: var(--green); }

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(2, 4, 10, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.2);
  overflow: hidden;
  animation: modalIn 0.3s ease;
}
.modal-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.7);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--border);
}
.modal-title-wrap { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.modal-level {
  align-self: flex-start;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
}
.modal-level.national { background: rgba(255, 71, 87, 0.15); color: var(--red); }
.modal-level.provincial { background: rgba(251, 191, 36, 0.15); color: var(--amber); }
.modal-level.city { background: rgba(0, 240, 255, 0.15); color: var(--cyan); }
.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.5px;
}
.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.modal-close:hover {
  color: var(--red);
  border-color: rgba(255, 71, 87, 0.5);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}
.modal-body {
  padding: 18px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid transparent;
}
.modal-row.highlight {
  background: rgba(251, 191, 36, 0.06);
  border-color: rgba(251, 191, 36, 0.25);
}
.modal-row-label {
  font-size: 12px;
  color: var(--text-dim);
  flex-shrink: 0;
  min-width: 70px;
}
.modal-row-value {
  font-size: 13px;
  color: var(--text);
  text-align: right;
  flex: 1;
}
.modal-row-value.amount {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--amber);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  font-size: 15px;
}
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;
}
.modal-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--cyan);
}
.modal-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(124, 58, 237, 0.12));
  border: 1px solid var(--border-glow);
  border-radius: 10px;
  color: var(--cyan);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}
.modal-link-btn:hover {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(124, 58, 237, 0.2));
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
  transform: translateY(-1px);
}

/* ===== 滚动条 ===== */
.policy-list::-webkit-scrollbar { width: 6px; }
.policy-list::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
.policy-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyan), var(--purple));
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.4);
}
.policy-list::-webkit-scrollbar-thumb:hover { background: var(--cyan); }

/* ===== 动画 ===== */
@keyframes gradientShift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
@keyframes livePulse {
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 10px var(--red); }
  50% { transform: scale(1.4); opacity: 0.6; box-shadow: 0 0 16px var(--red); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes borderFlow {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}
@keyframes nebulaDrift {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -30px) scale(1.1); }
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes numberCountUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.shimmer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: shimmer 3s ease-in-out infinite;
  pointer-events: none;
}
.bento-card:hover .shimmer-overlay {
  animation-duration: 1.5s;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(6, 1fr); }
  .hero-card { grid-column: span 6; grid-row: span 1; }
  .data-card { grid-column: span 2; }
  .chart-card { grid-column: span 6; }
  .info-card { grid-column: span 3; }
  .city-card { grid-column: span 6; }
  .policy-card { grid-column: span 6; }
  .hero-svg { width: 140px; height: 140px; }
  .hero-value { font-size: 44px; }
}
@media (max-width: 640px) {
  .page-container { padding: 18px 14px 28px; }
  .bento-grid { grid-template-columns: 1fr; gap: 14px; }
  .hero-card, .data-card, .chart-card, .info-card, .city-card, .policy-card { grid-column: span 1; }
  .page-header { flex-direction: column; align-items: stretch; }
  .header-left { flex-wrap: wrap; }
  .search-input { width: 100%; }
  .search-wrap { width: 100%; }
  .hero-value { font-size: 36px; }
  .hero-decoration { display: none; }
  .card-value { font-size: 26px; }
  .chart-box { height: 240px; }
}

/* ===== 无搜索结果 ===== */
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
}
.no-results-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.7; }
.no-results-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
.no-results-desc { font-size: 14px; color: var(--text-dim); margin-bottom: 20px; }
.no-results-btn {
  background: linear-gradient(135deg, var(--cyan), var(--cyan-dim));
  color: #02040a;
  border: none;
  padding: 10px 28px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}
.no-results-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
}

/* ===== 卡片浮窗交互 ===== */
.card-hint {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 10px;
  color: var(--text-dim);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  white-space: nowrap;
}
.bento-card:hover .card-hint { opacity: 0.5; }
.card-pinned {
  border-color: var(--border-glow) !important;
  box-shadow: 0 0 24px rgba(0, 240, 255, 0.2), inset 0 0 12px rgba(0, 240, 255, 0.05) !important;
}
.card-pinned .card-hint { opacity: 0; }

/* ===== 浮窗遮罩 ===== */
.card-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 4, 10, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.card-popup-overlay.overlay-pinned {
  pointer-events: auto;
  background: rgba(2, 4, 10, 0.75);
}
.card-popup {
  position: relative;
  width: 700px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(145deg, rgba(14, 22, 52, 0.95), rgba(8, 14, 36, 0.95));
  border: 1px solid var(--border-glow);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.1);
  pointer-events: none;
}
.card-popup-overlay.overlay-pinned .card-popup {
  pointer-events: auto;
}
.card-popup::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}
.popup-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}
.popup-close:hover {
  border-color: var(--red);
  color: var(--red);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}
.popup-close-hint {
  position: absolute;
  top: 22px;
  right: 56px;
  font-size: 11px;
  color: var(--text-dim);
  opacity: 0.6;
}
.popup-header {
  margin-bottom: 20px;
}
.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 6px;
  letter-spacing: 0.5px;
}
.popup-sub {
  font-size: 13px;
  color: var(--text-dim);
  margin: 0;
}

/* Hero浮窗 - 地图 */
.popup-map-chart {
  width: 100%;
  height: 380px;
  margin-bottom: 16px;
}
.popup-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.popup-stat { text-align: center; }
.popup-stat-val {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.popup-stat-label {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 4px;
}
.popup-stat-val.cyan { color: var(--cyan); text-shadow: 0 0 8px rgba(0, 240, 255, 0.4); }
.popup-stat-val.purple { color: var(--purple-light); text-shadow: 0 0 8px rgba(124, 58, 237, 0.4); }
.popup-stat-val.amber { color: var(--amber); text-shadow: 0 0 8px rgba(251, 191, 36, 0.4); }
.popup-stat-val.green { color: var(--green); text-shadow: 0 0 8px rgba(0, 255, 157, 0.4); }

/* 薪资浮窗 */
.popup-salary-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.popup-salary-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.salary-range-label {
  width: 60px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.salary-range-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}
.salary-range-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.salary-range-count {
  width: 55px;
  text-align: right;
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.salary-range-percent {
  width: 35px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.popup-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 20px 0;
}
.popup-sub-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}
.popup-edu-chart {
  width: 100%;
  height: 200px;
}

/* 城市浮窗 */
.popup-city-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
}
.popup-city-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.popup-city-row:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: var(--border);
}
.city-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
  flex-shrink: 0;
}
.city-rank.rank-top {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(124, 58, 237, 0.2));
  color: var(--cyan);
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
}
.city-name {
  width: 70px;
  font-size: 13px;
  color: var(--text);
  flex-shrink: 0;
}
.city-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}
.city-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--purple), var(--purple-light));
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(124, 58, 237, 0.4);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.city-count {
  width: 50px;
  text-align: right;
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.city-percent {
  width: 35px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--purple-light);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* 浮窗动画 */
.popup-fade-enter-active, .popup-fade-leave-active {
  transition: opacity 0.3s ease;
}
.popup-fade-enter-from, .popup-fade-leave-to {
  opacity: 0;
}
.popup-fade-enter-to, .popup-fade-leave-from {
  opacity: 1;
}
.popup-fade-enter-active .card-popup,
.popup-fade-leave-active .card-popup {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.popup-fade-enter-from .card-popup,
.popup-fade-leave-to .card-popup {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.popup-fade-enter-to .card-popup,
.popup-fade-leave-from .card-popup {
  transform: scale(1) translateY(0);
  opacity: 1;
}
</style>
