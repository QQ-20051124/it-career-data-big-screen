<template>
  <div class="dashboard-container">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="logo">
        <span class="logo-icon">◆</span>
        <span class="logo-text">IT学习与就业数据可视化导航系统</span>
      </div>
      <div class="header-right">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>返回</span>
        </button>
        <div class="live-indicator">
          <span class="pulse-dot"></span>
          <span>实时监控</span>
        </div>
        <div class="time-display">
          <span class="time-icon">⏰</span>
          <span class="digital-time">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-wrapper">
      <!-- 指标卡片行 -->
      <div class="metrics-row">
        <div class="metric-card" v-for="(item, i) in indexCards" :key="item.key"
             :style="{animationDelay: `${i * 0.1}s`}">
          <div class="metric-icon">{{ item.icon }}</div>
          <div class="metric-content">
            <div class="metric-label">{{ item.title }}</div>
            <div class="metric-value">
              <span class="counter-number">{{ item.value }}</span>
              <span class="metric-unit" v-if="item.unit">{{ item.unit }}</span>
            </div>
            <div class="metric-trend" :class="item.trend">
              <span class="trend-arrow">{{ item.trend === 'up' ? '↑' : '↓' }}</span>
              <span>{{ item.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表网格 -->
      <div class="charts-grid">
        <!-- 地图区域 - 全宽 -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">🌏</span>
              <span class="chart-title">全国岗位热力分布</span>
            </div>
            <div class="chart-badge">实时</div>
          </div>
          <div ref="mapChart" class="chart-container map-container"></div>
        </div>

        <!-- 薪资分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">💰</span>
              <span class="chart-title">薪资区间分布</span>
            </div>
          </div>
          <div ref="salaryChart" class="chart-container"></div>
        </div>

        <!-- 学历要求 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">🎓</span>
              <span class="chart-title">学历要求占比</span>
            </div>
          </div>
          <div ref="eduChart" class="chart-container"></div>
        </div>

        <!-- 岗位类型 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">💼</span>
              <span class="chart-title">岗位类型分布</span>
            </div>
          </div>
          <div ref="jobTypeChart" class="chart-container"></div>
        </div>

        <!-- 工作经验 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">📋</span>
              <span class="chart-title">工作经验要求</span>
            </div>
          </div>
          <div ref="expChart" class="chart-container"></div>
        </div>

        <!-- 城市薪资趋势 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">📈</span>
              <span class="chart-title">核心城市薪资趋势</span>
            </div>
          </div>
          <div ref="lineChart" class="chart-container"></div>
        </div>

        <!-- 技能词云 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">☁️</span>
              <span class="chart-title">热门技能词云</span>
            </div>
          </div>
          <div ref="wordCloud" class="chart-container"></div>
        </div>

        <!-- 雷达图 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">🎯</span>
              <span class="chart-title">行业综合能力雷达</span>
            </div>
          </div>
          <div ref="radarChart" class="chart-container"></div>
        </div>

        <!-- 混合图表 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">📊</span>
              <span class="chart-title">岗位薪资·招聘量对比</span>
            </div>
          </div>
          <div ref="mixChart" class="chart-container"></div>
        </div>

        <!-- 面积图 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-icon">📉</span>
              <span class="chart-title">学历·薪资·岗位量</span>
            </div>
          </div>
          <div ref="areaChart" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import 'echarts-gl'
import jobData from '@/assets/all_cleaned_jobs.json'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}

// 响应式数据
const bgCanvas = ref(null)
const currentTime = ref('')
const mapChart = ref(null)
const salaryChart = ref(null)
const eduChart = ref(null)
const jobTypeChart = ref(null)
const expChart = ref(null)
const lineChart = ref(null)
const wordCloud = ref(null)
const radarChart = ref(null)
const mixChart = ref(null)
const areaChart = ref(null)

let starAnimation = null
let timeTimer = null
let mapChartInstance = null
let chartInstances = {}

// 指标数据
const indexCards = ref([
  { key: 'total', title: '岗位总数', value: 0, icon: '📊', trend: 'up', change: '12.5%', unit: '个' },
  { key: 'salary', title: '平均薪资', value: 0, icon: '💰', trend: 'up', change: '8.3%', unit: '元' },
  { key: 'city', title: '覆盖城市', value: 0, icon: '🌆', trend: 'up', change: '5.2%', unit: '个' },
  { key: 'type', title: '岗位类型', value: 0, icon: '💼', trend: 'up', change: '15.8%', unit: '种' }
])

// 更新实时时间
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function drawStarBackground() {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // ============ 外太空星云团（大幅、明亮）============
  const nebulas = [
    { x: 0.15, y: 0.3, r: 0.55, color1: '#1a1050', color2: '#060420', alpha: 0.85 },
    { x: 0.8, y: 0.55, r: 0.5, color1: '#0d1850', color2: '#040818', alpha: 0.8 },
    { x: 0.5, y: 0.65, r: 0.45, color1: '#180840', color2: '#040610', alpha: 0.75 },
    { x: 0.3, y: 0.6, r: 0.4, color1: '#0a1550', color2: '#040810', alpha: 0.7 },
    { x: 0.65, y: 0.25, r: 0.5, color1: '#200a50', color2: '#050410', alpha: 0.8 },
    { x: 0.9, y: 0.15, r: 0.35, color1: '#102040', color2: '#030610', alpha: 0.65 },
    { x: 0.4, y: 0.15, r: 0.4, color1: '#0f1845', color2: '#040610', alpha: 0.7 },
    { x: 0.7, y: 0.8, r: 0.45, color1: '#150d40', color2: '#040610', alpha: 0.7 },
    { x: 0.1, y: 0.7, r: 0.35, color1: '#0f1235', color2: '#030610', alpha: 0.6 },
  ]

  function drawNebula(nebula) {
    const cx = nebula.x * canvas.width
    const cy = nebula.y * canvas.height
    const maxR = nebula.r * Math.max(canvas.width, canvas.height)

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
    gradient.addColorStop(0, nebula.color1)
    gradient.addColorStop(0.2, nebula.color1)
    gradient.addColorStop(0.5, nebula.color2)
    gradient.addColorStop(1, 'transparent')

    ctx.globalAlpha = nebula.alpha
    ctx.fillStyle = gradient
    ctx.fillRect(cx - maxR, cy - maxR, maxR * 2, maxR * 2)
    ctx.globalAlpha = 1
  }

  // ============ 星星 ============
  const stars = []
  for (let i = 0; i < 500; i++) {
    const colors = [
      [200, 220, 255], [180, 200, 255], [255, 220, 180],
      [200, 180, 255], [180, 240, 255], [255, 255, 240]
    ]
    const c = colors[Math.floor(Math.random() * colors.length)]
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.2 + 0.4,
      color: c,
      brightness: Math.random() * 0.8 + 0.3,
      twinkleSpeed: 0.002 + Math.random() * 0.006,
      twinkleOffset: Math.random() * Math.PI * 2
    })
  }

  // ============ 可连接的星星（较大较亮的星星）============
  const connectableStars = stars.filter(s => s.r > 1.2).slice(0, 80)

  // ============ 流星 ============
  const meteors = []
  let lastMeteorTime = 0

  function spawnMeteor() {
    const now = Date.now()
    const minInterval = 800 + Math.random() * 1200
    if (now - lastMeteorTime < minInterval) return

    const startX = Math.random() * canvas.width
    const startY = -50 - Math.random() * 100

    meteors.push({
      x: startX,
      y: startY,
      length: 80 + Math.random() * 120,
      speed: 8 + Math.random() * 12,
      angle: 20 + Math.random() * 30,
      opacity: 0.8 + Math.random() * 0.2,
      trailOpacity: 0.3 + Math.random() * 0.3
    })

    lastMeteorTime = now
  }

  function updateMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]
      const rad = (m.angle * Math.PI) / 180
      m.x += Math.cos(rad) * m.speed
      m.y += Math.sin(rad) * m.speed

      if (m.x > canvas.width + 100 || m.y > canvas.height + 100) {
        meteors.splice(i, 1)
      }
    }
  }

  function drawMeteor(m) {
    const rad = (m.angle * Math.PI) / 180
    const tailX = m.x - Math.cos(rad) * m.length
    const tailY = m.y - Math.sin(rad) * m.length

    const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y)
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(0.5, `rgba(200, 220, 255, ${m.trailOpacity * 0.5})`)
    gradient.addColorStop(0.8, `rgba(220, 240, 255, ${m.trailOpacity})`)
    gradient.addColorStop(1, `rgba(255, 255, 255, ${m.opacity})`)

    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(m.x, m.y)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()

    const headGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 10)
    headGlow.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`)
    headGlow.addColorStop(0.3, `rgba(200, 230, 255, ${m.opacity * 0.5})`)
    headGlow.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(m.x, m.y, 10, 0, Math.PI * 2)
    ctx.fillStyle = headGlow
    ctx.fill()

    ctx.beginPath()
    ctx.arc(m.x, m.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`
    ctx.fill()
  }

  // ============ 星星连线 ============
  function drawStarConnections() {
    const connectionDistance = 120
    connectableStars.forEach((s1, i) => {
      for (let j = i + 1; j < connectableStars.length; j++) {
        const s2 = connectableStars[j]
        const x1 = s1.x * canvas.width
        const y1 = s1.y * canvas.height
        const x2 = s2.x * canvas.width
        const y2 = s2.y * canvas.height
        const dx = x2 - x1
        const dy = y2 - y1
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const twinkle1 = Math.sin(Date.now() * s1.twinkleSpeed + s1.twinkleOffset) * 0.25 + 0.75
          const twinkle2 = Math.sin(Date.now() * s2.twinkleSpeed + s2.twinkleOffset) * 0.25 + 0.75
          const avgTwinkle = (twinkle1 + twinkle2) / 2
          const alpha = (1 - distance / connectionDistance) * 0.12 * avgTwinkle

          const color = [200, 220, 255]
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    })
  }

  function animate() {
    ctx.fillStyle = '#010308'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 画星云
    nebulas.forEach(n => drawNebula(n))

    // 画星星连线（在星星之前绘制，形成层次感）
    drawStarConnections()

    // 画星星
    stars.forEach(s => {
      const x = s.x * canvas.width
      const y = s.y * canvas.height
      const twinkle = Math.sin(Date.now() * s.twinkleSpeed + s.twinkleOffset) * 0.25 + 0.75
      const alpha = s.brightness * twinkle

      // 光晕
      const glow = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6)
      glow.addColorStop(0, `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, ${alpha * 0.7})`)
      glow.addColorStop(0.4, `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, ${alpha * 0.2})`)
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.beginPath()
      ctx.arc(x, y, s.r * 6, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // 核心
      ctx.beginPath()
      ctx.arc(x, y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.fill()
    })

    // 生成和更新流星
    spawnMeteor()
    updateMeteors()
    meteors.forEach(m => drawMeteor(m))

    starAnimation = requestAnimationFrame(animate)
  }
  animate()

  const resizeHandler = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resizeHandler)
}

// 更新指标数据
function updateIndexData() {
  const total = jobData.length
  const avg = Math.round(jobData.reduce((a, b) => a + b.salary_avg, 0) / total)
  const cityNum = new Set(jobData.map(i => (i.city || '').split('-')[0])).size
  const typeNum = new Set(jobData.map(i => {
    const name = i.job_name || ''
    if (name.includes('Python')) return 'Python'
    if (name.includes('Java')) return 'Java'
    if (name.includes('前端')) return '前端'
    return '其他'
  })).size

  indexCards.value = [
    { ...indexCards.value[0], value: total.toLocaleString() },
    { ...indexCards.value[1], value: avg.toLocaleString() },
    { ...indexCards.value[2], value: cityNum.toLocaleString() },
    { ...indexCards.value[3], value: typeNum.toLocaleString() }
  ]
}

// ==================== 地图 ====================
async function initMap() {
  try {
    const dom = mapChart.value
    if (!dom) return

    if (mapChartInstance) {
      mapChartInstance.dispose()
      mapChartInstance = null
    }
    mapChartInstance = echarts.init(dom)

    const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    if (!res.ok) throw new Error('地图数据加载失败')
    const chinaJson = await res.json()
    echarts.registerMap('china', chinaJson)

    const cityToProvince = {
      "北京":"北京市","上海":"上海市","广州":"广东省","深圳":"广东省","东莞":"广东省","佛山":"广东省",
      "珠海":"广东省","惠州":"广东省","中山":"广东省","江门":"广东省","湛江":"广东省","清远":"广东省",
      "汕头":"广东省","梅州":"广东省","杭州":"浙江省","宁波":"浙江省","温州":"浙江省","嘉兴":"浙江省",
      "绍兴":"浙江省","金华":"浙江省","湖州":"浙江省","衢州":"浙江省","台州":"浙江省","舟山":"浙江省",
      "成都":"四川省","绵阳":"四川省","德阳":"四川省","南充":"四川省","宜宾":"四川省","泸州":"四川省","遂宁":"四川省",
      "重庆":"重庆市","西安":"陕西省","咸阳":"陕西省","榆林":"陕西省","武汉":"湖北省","黄冈":"湖北省",
      "宜昌":"湖北省","襄阳":"湖北省","荆州":"湖北省","十堰":"湖北省","长沙":"湖南省","株洲":"湖南省",
      "湘潭":"湖南省","常德":"湖南省","南京":"江苏省","苏州":"江苏省","无锡":"江苏省","常州":"江苏省",
      "南通":"江苏省","徐州":"江苏省","扬州":"江苏省","泰州":"江苏省","淮安":"江苏省","连云港":"江苏省",
      "宿迁":"江苏省","合肥":"安徽省","芜湖":"安徽省","蚌埠":"安徽省","安庆":"安徽省","滁州":"安徽省",
      "铜陵":"安徽省","阜阳":"安徽省","马鞍山":"安徽省","福州":"福建省","龙岩":"福建省","厦门":"福建省",
      "泉州":"福建省","漳州":"福建省","三明":"福建省","莆田":"福建省","济南":"山东省","青岛":"山东省",
      "烟台":"山东省","威海":"山东省","潍坊":"山东省","临沂":"山东省","枣庄":"山东省","菏泽":"山东省",
      "泰安":"山东省","德州":"山东省","济宁":"山东省","日照":"山东省","东营":"山东省","聊城":"山东省",
      "滨州":"山东省","淄博":"山东省","天津":"天津市","石家庄":"河北省","唐山":"河北省","秦皇岛":"河北省",
      "廊坊":"河北省","保定":"河北省","张家口":"河北省","承德":"河北省","沧州":"河北省","衡水":"河北省",
      "邢台":"河北省","邯郸":"河北省","太原":"山西省","大同":"山西省","朔州":"山西省","阳泉":"山西省",
      "长治":"山西省","晋城":"山西省","晋中":"山西省","运城":"山西省","临汾":"山西省","吕梁":"山西省",
      "忻州":"山西省","沈阳":"辽宁省","大连":"辽宁省","鞍山":"辽宁省","抚顺":"辽宁省","本溪":"辽宁省",
      "丹东":"辽宁省","辽阳":"辽宁省","长春":"吉林省","吉林":"吉林省","哈尔滨":"黑龙江省","齐齐哈尔":"黑龙江省",
      "大庆":"黑龙江省","郑州":"河南省","洛阳":"河南省","开封":"河南省","焦作":"河南省","商丘":"河南省",
      "濮阳":"河南省","南阳":"河南省","许昌":"河南省","漯河":"河南省","驻马店":"河南省","新乡":"河南省",
      "鹤壁":"河南省","平顶山":"河南省","昆明":"云南省","曲靖":"云南省","贵阳":"贵州省","遵义":"贵州省",
      "安顺":"贵州省","南宁":"广西壮族自治区","桂林":"广西壮族自治区","柳州":"广西壮族自治区","玉林":"广西壮族自治区",
      "钦州":"广西壮族自治区","海口":"海南省","三亚":"海南省","儋州":"海南省","兰州":"甘肃省","天水":"甘肃省",
      "酒泉":"甘肃省","西宁":"青海省","银川":"宁夏回族自治区","乌鲁木齐":"新疆维吾尔自治区","巴音郭楞":"新疆维吾尔自治区",
      "昌吉":"新疆维吾尔自治区","呼和浩特":"内蒙古自治区","鄂尔多斯":"内蒙古自治区","赤峰":"内蒙古自治区",
      "通辽":"内蒙古自治区","巴彦淖尔":"内蒙古自治区","包头":"内蒙古自治区","拉萨":"西藏自治区","南昌":"江西省",
      "赣州":"江西省","九江":"江西省","宜春":"江西省","五家渠":"新疆维吾尔自治区",
      "乐山":"四川省","五家渠市":"新疆维吾尔自治区","信阳":"河南省","克孜勒苏柯尔克孜":"新疆维吾尔自治区",
      "凉山":"四川省","吉安":"江西省","吉林市":"吉林省","周口":"河南省","四平":"吉林省",
      "孝感":"湖北省","安阳":"河南省","宣城":"安徽省","宿州":"安徽省","抚州":"江西省",
      "揭阳":"广东省","攀枝花":"四川省","眉山":"四川省","石河子市":"新疆维吾尔自治区",
      "肇庆":"广东省","自贡":"四川省","辽源":"吉林省","铜仁":"贵州省","镇江":"江苏省",
      "阿拉尔市":"新疆维吾尔自治区","韶关":"广东省","黔南":"贵州省"
    }

    const provinceCount = {}

    // 省份名称映射（简称、全称）
    const provinceNames = {
      "河北":"河北省","山西":"山西省","内蒙古":"内蒙古自治区","辽宁":"辽宁省","吉林":"吉林省","黑龙江":"黑龙江省",
      "江苏":"江苏省","浙江":"浙江省","安徽":"安徽省","福建":"福建省","江西":"江西省","山东":"山东省",
      "河南":"河南省","湖北":"湖北省","湖南":"湖南省","广东":"广东省","广西":"广西壮族自治区","海南":"海南省",
      "四川":"四川省","贵州":"贵州省","云南":"云南省","西藏":"西藏自治区","陕西":"陕西省","甘肃":"甘肃省",
      "青海":"青海省","宁夏":"宁夏回族自治区","新疆":"新疆维吾尔自治区",
      "北京市":"北京市","上海市":"上海市","天津市":"天津市","重庆市":"重庆市",
      "河北省":"河北省","山西省":"山西省","辽宁省":"辽宁省","吉林省":"吉林省","黑龙江省":"黑龙江省",
      "江苏省":"江苏省","浙江省":"浙江省","安徽省":"安徽省","福建省":"福建省","江西省":"江西省",
      "山东省":"山东省","河南省":"河南省","湖北省":"湖北省","湖南省":"湖南省","广东省":"广东省",
      "海南省":"海南省","四川省":"四川省","贵州省":"贵州省","云南省":"云南省","陕西省":"陕西省",
      "甘肃省":"甘肃省","青海省":"青海省",
      "内蒙古自治区":"内蒙古自治区","广西壮族自治区":"广西壮族自治区","西藏自治区":"西藏自治区",
      "宁夏回族自治区":"宁夏回族自治区","新疆维吾尔自治区":"新疆维吾尔自治区",
      "香港特别行政区":"香港特别行政区","澳门特别行政区":"澳门特别行政区"
    }

    // 特殊值直接映射
    const specialMap = {
      "香港": "香港特别行政区",
      "澳门": "澳门特别行政区",
      "台湾": "台湾省"
    }

    jobData.forEach(item => {
      let rawCity = (item.city || '').split('-')[0].trim()
      rawCity = rawCity.split('·')[0].trim()

      // 1. 先检查是否为特殊地区（香港、澳门）
      let province = specialMap[rawCity]

      // 2. 不是特殊地区则按城市/省份映射查找
      if (!province) {
        province = cityToProvince[rawCity] || provinceNames[rawCity]
      }

      if (province) {
        provinceCount[province] = (provinceCount[province] || 0) + 1
      }
    })

    const total = Object.values(provinceCount).reduce((a,b)=>a+b,0)
    const mapData = Object.entries(provinceCount).map(([name, value]) => ({ name, value }))
    const allProvinceNames = chinaJson.features.map(f => f.properties.name)

    console.log('未匹配数:', jobData.length - total)

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: params => {
          const val = params.value || 0
          const pct = total > 0 ? ((val/total)*100).toFixed(1) : 0
          return `<b>${params.name}</b><br/>岗位：${val.toLocaleString()} 个<br/>占比：${pct}%`
        },
        backgroundColor: 'rgba(10,15,35,0.95)',
        borderColor: '#28a8e0',
        textStyle: { color: '#e0e8f0' }
      },
      visualMap: {
        min: 0,
        max: Math.max(...Object.values(provinceCount),1),
        left: 20, bottom:20,
        text: ['多','少'],
        textStyle: { color:'#2a88cc' },
        inRange: { color: ['#0c2e4a', '#115588', '#1a80bb', '#28a8e0', '#55d0f8'] }
      },
      geo: {
        map: 'china',
        roam: true, zoom:1.25, center:[104,36],
        itemStyle: { areaColor:'#0a1628', borderColor:'#1c3355', borderWidth:1.2 },
        emphasis: {
          label: { show:true, color:'#fff', fontSize:14, fontWeight:'bold' },
          itemStyle: { areaColor:'#66ddff', borderColor:'#fff', borderWidth:2, shadowBlur:25 }
        },
        label: { show:true, color:'#5577aa', fontSize:9 }
      },
      series: [{ type:'map', map:'china', geoIndex:0, data:mapData }]
    }

    mapChartInstance.setOption(option)

    let selectedProvince = null
    mapChartInstance.off('click')
    mapChartInstance.on('click', params => {
      selectedProvince = selectedProvince === params.name ? null : params.name
      const regions = selectedProvince
        ? allProvinceNames.map(name => ({
            name,
            itemStyle: name === selectedProvince
              ? { areaColor:'#99eeff', borderColor:'#fff', borderWidth:2.5, shadowBlur:30 }
              : { areaColor:'#0a1220', borderColor:'#142030', borderWidth:0.8 },
            label: { show: name === selectedProvince, color:'#fff', fontSize:15, fontWeight:'bold' }
          }))
        : []
      mapChartInstance.setOption({ geo: { regions } })
    })

    window.addEventListener('resize', () => mapChartInstance?.resize())

  } catch (err) {
    console.error('地图加载失败：', err)
  }
}

// 统一主题配置
const chartTheme = {
  backgroundColor: 'transparent',
  tooltip: {
    backgroundColor: 'rgba(10, 14, 39, 0.9)',
    borderColor: '#4a9eff',
    textStyle: { color: '#fff' }
  }
}

// 初始化薪资分布图
function initSalary() {
  if (!salaryChart.value) return
  if (chartInstances['salary']) chartInstances['salary'].dispose()
  const chart = echarts.init(salaryChart.value)
  chartInstances['salary'] = chart

  const bins = { '5k以下': 0, '5k-10k': 0, '10k-15k': 0, '15k-20k': 0, '20k+': 0 }
  jobData.forEach(i => {
    const s = i.salary_avg
    if (s < 5000) bins['5k以下']++
    else if (s < 10000) bins['5k-10k']++
    else if (s < 15000) bins['10k-15k']++
    else if (s < 20000) bins['15k-20k']++
    else bins['20k+']++
  })

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '15%', right: '10%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: Object.keys(bins),
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0' },
      splitLine: { lineStyle: { color: 'rgba(42, 74, 127, 0.2)' } }
    },
    series: [{
      type: 'bar',
      data: Object.values(bins),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4a9eff' },
          { offset: 1, color: '#1e4d8c' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00d4aa' },
            { offset: 1, color: '#009688' }
          ]),
          shadowBlur: 15,
          shadowColor: 'rgba(0, 212, 170, 0.4)'
        },
        scale: true,
        scaleSize: 8
      }
    }],
    animationDuration: 1000
  })
}

// 初始化学历饼图
function initEdu() {
  if (!eduChart.value) return
  if (chartInstances['edu']) chartInstances['edu'].dispose()
  const chart = echarts.init(eduChart.value)
  chartInstances['edu'] = chart

  const map = {}
  jobData.forEach(i => {
    let edu = (i.education || '未知').trim()
    // 合并学历大类
    if (edu.includes('博士')) edu = '博士'
    else if (edu.includes('硕士')) edu = '硕士'
    else if (edu.includes('本科')) edu = '本科'
    else if (edu.includes('大专')) edu = '大专'
    else if (edu.includes('中专') || edu.includes('中技') || edu.includes('高中')) edu = '中专/高中'
    else if (edu.includes('初中')) edu = '初中及以下'
    else edu = '其他'

    map[edu] = (map[edu] || 0) + 1
  })
  const data = Object.entries(map).map(([name, value]) => ({ name, value }))

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 10,
      textStyle: { color: '#a0b4d0', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14
    },
    series: [{
      type: 'pie',
      radius: '65%',
      center: ['50%', '48%'],
      data,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0a0e27',
        borderWidth: 2
      },
      color: ['#4a9eff', '#00d4aa', '#ff6b6b', '#ffd93d', '#6c5ce7', '#a8e6cf'],
      label: {
        color: '#e0e0e0',
        fontSize: 11,
        formatter: '{b}\n{d}%',
        distanceToLabelLine: 4
      },
      labelLine: {
        lineStyle: { color: '#4a9eff' },
        length: 18,
        length2: 22
      },
      emphasis: {
        scale: true,
        scaleSize: 14,
        focus: 'self',
        itemStyle: {
          shadowBlur: 25,
          shadowColor: 'rgba(74, 158, 255, 0.6)',
          borderWidth: 3,
          borderColor: '#fff'
        },
        label: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }
    }]
  })
}

// 初始化岗位类型饼图
function initJobType() {
  if (!jobTypeChart.value) return
  if (chartInstances['jobType']) chartInstances['jobType'].dispose()
  const chart = echarts.init(jobTypeChart.value)
  chartInstances['jobType'] = chart

  const map = {}
  jobData.forEach(i => {
  const name = i.job_name || ''
  const t = name.includes('Python') ? 'Python开发' :
    name.includes('Java') ? 'Java开发' :
    name.includes('前端') ? '前端开发' :
    name.includes('测试') ? '测试开发' : '其他'
  map[t] = (map[t] || 0) + 1
})
  const data = Object.entries(map).map(([name, value]) => ({ name, value }))

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 10,
      textStyle: { color: '#a0b4d0' }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      data,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0a0e27',
        borderWidth: 2
      },
      color: ['#4a9eff', '#00d4aa', '#ff6b6b', '#ffd93d', '#6c5ce7'],
      label: {
        color: '#e0e0e0',
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        lineStyle: { color: '#4a9eff' }
      },
      emphasis: {
        scale: true,
        scaleSize: 16,
        focus: 'self',
        itemStyle: {
          shadowBlur: 25,
          shadowColor: 'rgba(74, 158, 255, 0.6)',
          borderWidth: 3,
          borderColor: '#fff'
        },
        label: {
          fontSize: 15,
          fontWeight: 'bold'
        }
      }
    }]
  })
}

// 初始化工作经验图
function initExp() {
  if (!expChart.value) return
  if (chartInstances['exp']) chartInstances['exp'].dispose()
  const chart = echarts.init(expChart.value)
  chartInstances['exp'] = chart

  const map = {}
  jobData.forEach(i => {
    let exp = i.work_exp || '不限'
    if (!exp || exp === 'null') exp = '不限'
    if (exp.includes('应届')) exp = '应届'
    else if (exp.includes('1年')) exp = '1年以内'
    else if (exp.includes('1-3')) exp = '1-3年'
    else if (exp.includes('3-5')) exp = '3-5年'
    else if (exp.includes('5-10')) exp = '5-10年'
    else if (exp.includes('10年')) exp = '10年以上'
    else exp = '不限'
    map[exp] = (map[exp] || 0) + 1
  })

  const arr = Object.entries(map).sort((a, b) => b[1] - a[1])

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '20%', right: '10%', top: '10%', bottom: '15%' },
    yAxis: {
      type: 'category',
      data: arr.map(i => i[0]),
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0' }
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0' },
      splitLine: { lineStyle: { color: 'rgba(42, 74, 127, 0.2)' } }
    },
    series: [{
      type: 'bar',
      data: arr.map(i => i[1]),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#00d4aa' },
          { offset: 1, color: '#4a9eff' }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ffd93d' },
            { offset: 1, color: '#ff6b6b' }
          ]),
          shadowBlur: 15,
          shadowColor: 'rgba(255, 107, 107, 0.4)'
        },
        scale: true,
        scaleSize: 8
      }
    }]
  })
}

// 初始化城市薪资趋势图
function initLine() {
  if (!lineChart.value) return
  if (chartInstances['line']) chartInstances['line'].dispose()
  const chart = echarts.init(lineChart.value)
  chartInstances['line'] = chart

  const cityData = {}
  jobData.forEach(i => {
    const city = (i.city || '').split('-')[0]
    if (!cityData[city]) {
      cityData[city] = { total: 0, count: 0 }
    }
    cityData[city].total += i.salary_avg
    cityData[city].count += 1
  })

  const cities = Object.keys(cityData).slice(0, 5)
  const vals = cities.map(c => Math.round(cityData[c].total / cityData[c].count))

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis'
    },
    grid: { left: '15%', right: '10%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: cities,
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0' },
      splitLine: { lineStyle: { color: 'rgba(42, 74, 127, 0.2)' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: vals,
      lineStyle: { color: '#ffd93d', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 217, 61, 0.4)' },
          { offset: 1, color: 'rgba(255, 217, 61, 0)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: {
        color: '#ffd93d',
        borderColor: '#fff',
        borderWidth: 2
      },
      emphasis: {
        focus: 'series',
        scale: true,
        scaleSize: 18,
        itemStyle: {
          color: '#00d4aa',
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 20,
          shadowColor: 'rgba(0, 212, 170, 0.5)'
        },
        lineStyle: { width: 4 }
      }
    }]
  })
}

// 初始化词云
function initWordCloud() {
  if (!wordCloud.value) return
  if (chartInstances['wordCloud']) chartInstances['wordCloud'].dispose()
  const chart = echarts.init(wordCloud.value)
  chartInstances['wordCloud'] = chart

  const keys = [
    'Python', 'Java', 'Vue', 'React', 'MySQL', 'Redis', 'Spring', 'Linux', 'Git', 'Docker',
    '测试', '后端', '前端', '算法', '架构', 'C++', 'Go', 'TypeScript', 'Node.js', 'Webpack'
  ]

  const map = {}
  jobData.forEach(i => {
    const text = (i.job_name + ' ' + (i.job_desc || '')).toLowerCase()
    keys.forEach(k => text.includes(k.toLowerCase()) && (map[k] = (map[k] || 0) + 1))
  })

  const data = Object.entries(map).map(([name, value]) => ({ name, value }))

  chart.setOption({
    ...chartTheme,
    series: [{
      type: 'wordCloud',
      sizeRange: [16, 80],
      rotationRange: [-45, 45],
      rotationStep: 45,
      gridSize: 8,
      shape: 'circle',
      width: '100%',
      height: '100%',
      textStyle: {
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'bold',
        color: () => ['#4a9eff', '#00d4aa', '#ffd93d', '#ff6b6b', '#6c5ce7'][Math.floor(Math.random() * 5)]
      },
      emphasis: {
        textStyle: {
          fontSize: 120,
          shadowBlur: 15,
          shadowColor: 'rgba(74, 158, 255, 0.8)'
        }
      },
      data
    }]
  })
}

// 初始化雷达图
function initRadar() {
  if (!radarChart.value) return
  if (chartInstances['radar']) chartInstances['radar'].dispose()
  const chart = echarts.init(radarChart.value)
  chartInstances['radar'] = chart

  chart.setOption({
    ...chartTheme,
    radar: {
      indicator: [
        { name: '薪资水平', max: 100 },
        { name: '学历需求', max: 100 },
        { name: '经验门槛', max: 100 },
        { name: '城市覆盖', max: 100 },
        { name: '技能要求', max: 100 }
      ],
      axisName: { color: '#a0b4d0' },
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      splitLine: { lineStyle: { color: 'rgba(42, 74, 127, 0.3)' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(74, 158, 255, 0.05)', 'rgba(74, 158, 255, 0.1)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [75, 65, 60, 80, 70],
        name: 'IT行业',
        areaStyle: { color: 'rgba(74, 158, 255, 0.2)' },
        lineStyle: { color: '#4a9eff', width: 2 },
        itemStyle: { color: '#4a9eff' }
      }],
      emphasis: {
        lineStyle: { width: 4 },
        areaStyle: { color: 'rgba(74, 158, 255, 0.4)' }
      }
    }]
  })
}

// 初始化混合图表
function initMixChart() {
  if (!mixChart.value) return
  if (chartInstances['mix']) chartInstances['mix'].dispose()
  const chart = echarts.init(mixChart.value)
  chartInstances['mix'] = chart

  const types = ['Python', 'Java', '前端', '测试']
  const salary = []
  const count = []

  types.forEach(t => {
    const list = jobData.filter(i => i.job_name.includes(t))
    salary.push(list.length ? Math.round(list.reduce((a, b) => a + b.salary_avg, 0) / list.length) : 0)
    count.push(list.length)
  })

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis'
    },
    legend: {
      data: ['薪资', '招聘量'],
      textStyle: { color: '#a0b4d0' },
      top: 10
    },
    grid: { left: '15%', right: '15%', top: '20%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: types,
      axisLabel: { color: '#a0b4d0' }
    },
    yAxis: [
      {
        type: 'value',
        name: '薪资',
        nameTextStyle: { color: '#a0b4d0' },
        axisLabel: { color: '#a0b4d0' },
        splitLine: { lineStyle: { color: 'rgba(42, 74, 127, 0.2)' } }
      },
      {
        type: 'value',
        name: '招聘量',
        nameTextStyle: { color: '#a0b4d0' },
        axisLabel: { color: '#a0b4d0' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '薪资',
        type: 'bar',
        yAxisIndex: 0,
        data: salary,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4a9eff' },
            { offset: 1, color: '#1e4d8c' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00d4aa' },
              { offset: 1, color: '#009688' }
            ]),
            shadowBlur: 15,
            shadowColor: 'rgba(0, 212, 170, 0.4)'
          },
          scale: true,
          scaleSize: 8
        }
      },
      {
        name: '招聘量',
        type: 'line',
        yAxisIndex: 1,
        data: count,
        itemStyle: { color: '#ffd93d' },
        lineStyle: { color: '#ffd93d', width: 2 },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          focus: 'series',
          scale: true,
          scaleSize: 15,
          itemStyle: {
            color: '#00d4aa',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: 'rgba(0, 212, 170, 0.5)'
          },
          lineStyle: { width: 4 }
        }
      }
    ]
  })
}

// 初始化面积图
function initAreaChart() {
  if (!areaChart.value) return
  if (chartInstances['area']) chartInstances['area'].dispose()
  const chart = echarts.init(areaChart.value)
  chartInstances['area'] = chart

  // 按学历分组（和 initEdu 一样的合并逻辑）
  const eduMap = {}
  jobData.forEach(i => {
    let edu = (i.education || '未知').trim()
    // 合并学历大类
    if (edu.includes('博士')) edu = '博士'
    else if (edu.includes('硕士')) edu = '硕士'
    else if (edu.includes('本科')) edu = '本科'
    else if (edu.includes('大专')) edu = '大专'
    else if (edu.includes('中专') || edu.includes('中技') || edu.includes('高中')) edu = '中专/高中'
    else if (edu.includes('初中')) edu = '初中及以下'
    else edu = '其他'
    eduMap[edu] = true
  })
  const eduList = Object.keys(eduMap)

  // 薪资区间
  const salaryRanges = ['0-5k', '5k-10k', '10k-15k', '15k-20k', '20k-25k', '25k+']

  const allColors = [
    '#4a9eff', '#00d4aa', '#ff6b6b', '#ffd93d', '#6c5ce7', '#ff9944',
    '#88ccff', '#44ddbb', '#ff8877', '#ffbb33', '#9966ff', '#ff6699'
  ]

  const series = eduList.map((edu, idx) => {
    const color = allColors[idx % allColors.length]
    const rangeCount = {}
    salaryRanges.forEach(r => rangeCount[r] = 0)

    jobData.forEach(i => {
      // 先合并学历再判断
      let itemEdu = (i.education || '未知').trim()
      if (itemEdu.includes('博士')) itemEdu = '博士'
      else if (itemEdu.includes('硕士')) itemEdu = '硕士'
      else if (itemEdu.includes('本科')) itemEdu = '本科'
      else if (itemEdu.includes('大专')) itemEdu = '大专'
      else if (itemEdu.includes('中专') || itemEdu.includes('中技') || itemEdu.includes('高中')) itemEdu = '中专/高中'
      else if (itemEdu.includes('初中')) itemEdu = '初中及以下'
      else itemEdu = '其他'

      if (itemEdu !== edu) return

      const s = i.salary_avg
      if (s < 5000) rangeCount['0-5k']++
      else if (s < 10000) rangeCount['5k-10k']++
      else if (s < 15000) rangeCount['10k-15k']++
      else if (s < 20000) rangeCount['15k-20k']++
      else if (s < 25000) rangeCount['20k-25k']++
      else rangeCount['25k+']++
    })

    return {
      name: edu,
      type: 'line',
      smooth: true,
      data: salaryRanges.map(r => rangeCount[r]),
      lineStyle: { color: color, width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '80' },
          { offset: 1, color: color + '10' }
        ])
      },
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: color, borderColor: '#fff', borderWidth: 1 },
      emphasis: {
        focus: 'series',
        symbolSize: 10,
        lineStyle: { width: 3 }
      }
    }
  })

  chart.setOption({
    ...chartTheme,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis',
      formatter: function(params) {
        let html = '<b>' + params[0].axisValue + '</b><br/>'
        params.forEach(p => {
          html += '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + p.color + ';margin-right:6px;"></span>'
          html += p.seriesName + '：<b>' + p.value + '</b> 个岗位<br/>'
        })
        return html
      }
    },
    legend: {
      data: eduList,
      bottom: 5,
      textStyle: { color: '#a0b4d0', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 12
    },
    grid: { left: '10%', right: '8%', top: '8%', bottom: '22%' },
    xAxis: {
      type: 'category',
      data: salaryRanges,
      axisLine: { lineStyle: { color: '#2a4a7f' } },
      axisLabel: { color: '#a0b4d0', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '岗位数',
      nameTextStyle: { color: '#a0b4d0', fontSize: 10 },
      nameLocation: 'end',
      nameGap: 8,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0b4d0', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(42, 74, 127, 0.15)', type: 'dashed' } }
    },
    series: series
  })
}

// 刷新所有图表
function refreshAllCharts() {
  initMap()
  initSalary()
  initEdu()
  initJobType()
  initExp()
  initLine()
  initWordCloud()
  initRadar()
  initMixChart()
  initAreaChart()
}

// 窗口大小调整
function handleResize() {
  Object.values(chartInstances).forEach(chart => chart && chart.resize())
  if (mapChartInstance) mapChartInstance.resize()
}

onMounted(async () => {
  await nextTick()
  drawStarBackground()
  updateTime()
  updateIndexData()
  refreshAllCharts()
  timeTimer = setInterval(updateTime, 1000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(timeTimer)
  cancelAnimationFrame(starAnimation)
  window.removeEventListener('resize', handleResize)
  if (mapChartInstance) mapChartInstance.dispose()
  Object.values(chartInstances).forEach(chart => chart && chart.dispose())
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background: transparent;
  position: relative;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  color: #e0e0e0;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

.top-bar {
  position: relative;
  z-index: 10;
  height: 64px;
  background: rgba(10, 14, 39, 0.6);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #4a9eff;
  font-size: 24px;
  animation: pulse 2s infinite;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 8px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(74, 158, 255, 0.15);
  border-color: rgba(74, 158, 255, 0.35);
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0b4d0;
  font-size: 14px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #00d4aa;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  padding: 6px 16px;
}

.time-icon {
  font-size: 14px;
}

.digital-time {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #4a9eff;
  font-weight: bold;
}

.main-wrapper {
  position: relative;
  z-index: 1;
  padding: 24px 30px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: rgba(15, 23, 52, 0.35);
  backdrop-filter: none;
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

.metric-card:hover {
  border-color: rgba(74, 158, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(74, 158, 255, 0.1);
}

.metric-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 12px;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 13px;
  color: #a0b4d0;
  margin-bottom: 4px;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}

.counter-number {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  font-family: 'Courier New', monospace;
}

.metric-unit {
  font-size: 14px;
  color: #a0b4d0;
}

.metric-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-trend.up {
  color: #00d4aa;
}

.metric-trend.down {
  color: #ff6b6b;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chart-card {
  background: rgba(15, 23, 52, 0.35);
  backdrop-filter: none;
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: rgba(74, 158, 255, 0.5);
  box-shadow: 0 8px 32px rgba(74, 158, 255, 0.1);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-icon {
  font-size: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #e0e0e0;
}

.chart-badge {
  background: linear-gradient(135deg, #4a9eff, #6c5ce7);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.map-container {
  height: 450px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>