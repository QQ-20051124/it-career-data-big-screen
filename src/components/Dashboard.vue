<template>
  <div class="dashboard-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="dashboard-glow-bg"></div>

    <div class="top-bar">
      <div class="top-bar-left">
        <span class="logo-icon">◆</span>
        <span class="logo-text">IT学习与就业数据可视化导航系统</span>
      </div>
      <button class="logout-btn" @click="logout">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 16l4-4-4-4"/>
          <path d="M7 16l-4-4 4-4"/>
          <path d="M12 19V5"/>
        </svg>
        <span>退出登录</span>
      </button>
    </div>

    <div class="top-modules">
      <div 
        class="module-card function-module" 
        :class="{ active: activeModule === 'function' }"
        @click="activeModule = 'function'"
      >
        <div class="module-glow"></div>
        <div class="module-content">
          <div class="module-icon">
            <svg viewBox="0 0 60 60" width="40" height="40">
              <rect x="10" y="20" width="12" height="25" rx="2" fill="url(#funcGrad)" opacity="0.9"/>
              <rect x="24" y="12" width="12" height="33" rx="2" fill="url(#funcGrad)" opacity="0.9"/>
              <rect x="38" y="18" width="12" height="27" rx="2" fill="url(#funcGrad)" opacity="0.9"/>
              <defs>
                <linearGradient id="funcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4a9eff"/>
                  <stop offset="100%" style="stop-color:#00d4aa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3>功能模块</h3>
        </div>
        <div class="module-corner tl"></div>
        <div class="module-corner tr"></div>
        <div class="module-corner bl"></div>
        <div class="module-corner br"></div>
        <div class="module-indicator" v-if="activeModule === 'function'"></div>
      </div>

      <div 
        class="module-card visualization-module" 
        :class="{ active: activeModule === 'visualization' }"
        @click="goToVisualization"
      >
        <div class="module-glow"></div>
        <div class="module-content">
          <div class="module-icon">
            <svg viewBox="0 0 60 60" width="40" height="40">
              <circle cx="30" cy="30" r="20" fill="none" stroke="url(#vizGrad)" stroke-width="2"/>
              <circle cx="30" cy="30" r="12" fill="none" stroke="url(#vizGrad)" stroke-width="1.5"/>
              <circle cx="30" cy="30" r="5" fill="url(#vizGrad)"/>
              <line x1="30" y1="10" x2="30" y2="50" stroke="url(#vizGrad)" stroke-width="1" opacity="0.5"/>
              <line x1="10" y1="30" x2="50" y2="30" stroke="url(#vizGrad)" stroke-width="1" opacity="0.5"/>
              <defs>
                <linearGradient id="vizGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4a9eff"/>
                  <stop offset="100%" style="stop-color:#7b68ee"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3>可视化模块</h3>
        </div>
        <div class="module-corner tl"></div>
        <div class="module-corner tr"></div>
        <div class="module-corner bl"></div>
        <div class="module-corner br"></div>
        <div class="module-indicator" v-if="activeModule === 'visualization'"></div>
      </div>
    </div>

    <div class="main-section">
      <div class="section-header">
        <div class="header-line"></div>
        <span>系统轮播图</span>
        <div class="header-line"></div>
      </div>

      <div class="main-content">
        <div class="left-panel community-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>求职社区</span>
          </div>
          <div class="community-posts">
            <div class="post-item" v-for="(post, index) in communityPosts" :key="index" @click="router.push('/job-community')">
              <div class="post-avatar">
                <img :src="post.avatar" :alt="post.author"/>
              </div>
              <div class="post-content">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-meta">
                  <span class="post-author">{{ post.author }}</span>
                  <span class="post-time">{{ post.time }}</span>
                  <span class="post-comments">{{ post.comments }}评论</span>
                </div>
              </div>
              <div class="post-badge" v-if="post.hot">🔥</div>
            </div>
          </div>
          <div class="panel-footer" @click="router.push('/job-community')">
            <span>查看更多</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="center-panel carousel-panel">
          <div class="carousel-wrapper">
            <div class="carousel-content" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
              <div class="carousel-item" v-for="(slide, index) in carouselSlides" :key="index">
                <div class="slide-card">
                  <div class="slide-icon">{{ slide.icon }}</div>
                  <h4>{{ slide.title }}</h4>
                  <p>{{ slide.desc }}</p>
                  <div class="slide-data">
                    <div class="data-item">
                      <span class="data-value">{{ slide.data1.value }}</span>
                      <span class="data-label">{{ slide.data1.label }}</span>
                    </div>
                    <div class="data-item">
                      <span class="data-value">{{ slide.data2.value }}</span>
                      <span class="data-label">{{ slide.data2.label }}</span>
                    </div>
                    <div class="data-item">
                      <span class="data-value">{{ slide.data3.value }}</span>
                      <span class="data-label">{{ slide.data3.label }}</span>
                    </div>
                  </div>
                  <button class="slide-btn">立即查看</button>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-indicators">
            <span v-for="(_, index) in carouselSlides" :key="index" 
              class="indicator" :class="{ active: currentSlide === index }"
              @click="currentSlide = index"></span>
          </div>
        </div>

        <div class="right-panel resume-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <span>查看简历</span>
          </div>

          <div class="resume-avatar-section">
            <div class="tech-avatar">
              <svg viewBox="0 0 160 160" width="120" height="120">
                <defs>
                  <radialGradient id="bgGrad" cx="45%" cy="35%" r="80%">
                    <stop offset="0%" style="stop-color:#a5b4fc"/>
                    <stop offset="30%" style="stop-color:#6366f1"/>
                    <stop offset="70%" style="stop-color:#312e81"/>
                    <stop offset="100%" style="stop-color:#1e1b4b"/>
                  </radialGradient>
                  <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#818cf8"/>
                    <stop offset="50%" style="stop-color:#6366f1"/>
                    <stop offset="100%" style="stop-color:#4338ca"/>
                  </linearGradient>
                  <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#67e8f9"/>
                    <stop offset="50%" style="stop-color:#22d3ee"/>
                    <stop offset="100%" style="stop-color:#0891b2"/>
                  </linearGradient>
                  <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#a855f7"/>
                    <stop offset="50%" style="stop-color:#4a9eff"/>
                    <stop offset="100%" style="stop-color:#22d3ee"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="strongGlow">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="80" cy="80" r="78" fill="url(#bgGrad)" stroke="rgba(139,92,246,0.3)" stroke-width="2"/>
                <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(139,92,246,0.15)" stroke-width="1" stroke-dasharray="6 4"/>
                <circle cx="80" cy="80" r="55" fill="none" stroke="rgba(74,158,255,0.1)" stroke-width="0.5"/>
                <ellipse cx="80" cy="85" rx="48" ry="52" fill="#fef3c7"/>
                <ellipse cx="80" cy="88" rx="45" ry="48" fill="#fde68a"/>
                <path d="M40 40 Q50 25 80 22 Q110 25 120 40 Q135 55 135 80 Q135 110 115 125 Q100 135 80 135 Q60 135 45 125 Q25 110 25 80 Q25 55 40 40" fill="url(#hairGrad)" stroke="#312e81" stroke-width="1.5"/>
                <path d="M35 45 Q45 35 60 32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
                <path d="M105 32 Q115 35 125 45" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
                <path d="M55 38 Q50 50 55 65" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
                <path d="M105 38 Q110 50 105 65" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
                <ellipse cx="60" cy="75" rx="14" ry="16" fill="white"/>
                <ellipse cx="100" cy="75" rx="14" ry="16" fill="white"/>
                <ellipse cx="60" cy="75" rx="12" ry="14" fill="url(#eyeGrad)"/>
                <ellipse cx="100" cy="75" rx="12" ry="14" fill="url(#eyeGrad)"/>
                <circle cx="57" cy="72" r="4" fill="#0f172a"/>
                <circle cx="97" cy="72" r="4" fill="#0f172a"/>
                <circle cx="55" cy="70" r="1.5" fill="white"/>
                <circle cx="95" cy="70" r="1.5" fill="white"/>
                <circle cx="58" cy="74" r="0.8" fill="rgba(255,255,255,0.6)"/>
                <circle cx="98" cy="74" r="0.8" fill="rgba(255,255,255,0.6)"/>
                <ellipse cx="56" cy="85" rx="6" ry="3" fill="#fda4af" opacity="0.6"/>
                <ellipse cx="104" cy="85" rx="6" ry="3" fill="#fda4af" opacity="0.6"/>
                <ellipse cx="80" cy="95" rx="8" ry="5" fill="#f9a8d4"/>
                <path d="M72 93 Q80 100 88 93" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round"/>
                <path d="M74 97 L86 97" fill="none" stroke="#ec4899" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M45 85 Q40 95 45 105" fill="none" stroke="rgba(168,85,247,0.6)" stroke-width="1"/>
                <path d="M115 85 Q120 95 115 105" fill="none" stroke="rgba(168,85,247,0.6)" stroke-width="1"/>
                <rect x="30" y="60" width="12" height="35" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" stroke-width="1" rx="3"/>
                <rect x="118" y="60" width="12" height="35" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" stroke-width="1" rx="3"/>
                <circle cx="36" cy="66" r="2" fill="#22d3ee" filter="url(#glow)">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="36" cy="73" r="2" fill="#4a9eff" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="36" cy="80" r="2" fill="#a855f7" filter="url(#glow)">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="36" cy="87" r="2" fill="#22d3ee" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="124" cy="66" r="2" fill="#a855f7" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="124" cy="73" r="2" fill="#4a9eff" filter="url(#glow)">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="124" cy="80" r="2" fill="#22d3ee" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="124" cy="87" r="2" fill="#a855f7" filter="url(#glow)">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="30" cy="55" r="3" fill="#a855f7" filter="url(#strongGlow)">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="130" cy="55" r="3" fill="#22d3ee" filter="url(#strongGlow)">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="25" cy="90" r="2" fill="#4a9eff" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="135" cy="90" r="2" fill="#4a9eff" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <path d="M32 50 Q38 45 45 50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
                <path d="M115 50 Q122 45 128 50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
                <ellipse cx="80" cy="55" rx="15" ry="8" fill="rgba(168,85,247,0.1)"/>
                <path d="M65 55 Q80 48 95 55" fill="none" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>
              </svg>
              <div class="avatar-ring"></div>
              <div class="avatar-ring ring-2"></div>
            </div>
          </div>

          <div class="resume-preview">
            <div class="resume-doc">
              <div class="doc-header">
                <div class="doc-icon">📄</div>
                <span>个人简历</span>
              </div>
              <div class="doc-content">
                <div class="doc-line"></div>
                <div class="doc-line"></div>
                <div class="doc-line short"></div>
                <div class="doc-line"></div>
                <div class="doc-line"></div>
                <div class="doc-line short"></div>
              </div>
            </div>
          </div>

          <button class="resume-btn">查看完整简历</button>
        </div>
      </div>
    </div>

    <div class="bottom-modules">
      <div class="bottom-card" v-for="(module, index) in bottomModules" :key="index" 
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="navigateTo(module.key)">
        <div class="card-glow"></div>
        <div class="card-icon" :style="{ '--color': module.color }">
          <svg :viewBox="module.iconViewBox" width="40" height="40" v-html="module.icon"></svg>
        </div>
        <h4>{{ module.title }}</h4>
        <p>{{ module.desc }}</p>
        <button class="card-btn">进入</button>
        <div class="card-corner tl"></div>
        <div class="card-corner tr"></div>
        <div class="card-corner bl"></div>
        <div class="card-corner br"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import jobData from '../assets/all_cleaned_jobs.json'

const router = useRouter()
const bgCanvas = ref(null)
const currentSlide = ref(0)
const activeModule = ref('function')
let slideInterval = null
let bgAnimationId = null

const goToVisualization = () => {
  router.push('/analytics')
}

const generateAvatar = (name) => {
  const colors = ['#4a9eff', '#00d4aa', '#a855f7', '#f59e0b', '#ec4899', '#ef4444', '#10b981', '#3b82f6']
  const color = colors[name.length % colors.length]
  const initial = name.charAt(0)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${color}"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="600">${initial}</text></svg>`
  const utf8Bytes = new TextEncoder().encode(svg)
  const base64String = btoa(String.fromCharCode(...utf8Bytes))
  return `data:image/svg+xml;base64,${base64String}`
}

const communitySourceData = [
  { 
    title: '分享计算机技术员面试经验', 
    author: '求职者小王', 
    time: '5分钟前', 
    comments: 29, 
    hot: false 
  },
  { 
    title: '急招普工/操作工，薪资优厚', 
    author: '技术达人', 
    time: '12分钟前', 
    comments: 148, 
    hot: true 
  },
  { 
    title: '计算机老师薪资待遇怎么样', 
    author: 'HR小姐姐', 
    time: '28分钟前', 
    comments: 91, 
    hot: true 
  },
  { 
    title: '在计算机硬件维护工作是一种什么体验', 
    author: '应届生小李', 
    time: '45分钟前', 
    comments: 210, 
    hot: false 
  },
  { 
    title: '计算机编程老师岗位推荐', 
    author: '转行程序员', 
    time: '1小时前', 
    comments: 197, 
    hot: true 
  }
]

const communityPosts = ref(
  communitySourceData.map((post) => ({
    ...post,
    avatar: generateAvatar(post.author)
  }))
)

const totalJobs = jobData.length
const avgSalary = Math.round(jobData.reduce((sum, job) => sum + (job.salary_avg || 0), 0) / totalJobs)
const cities = [...new Set(jobData.map(j => j.city))].length

const carouselSlides = ref([
  {
    icon: '📊',
    title: '实时有效岗位',
    desc: '当前市场最新岗位动态与趋势分析',
    data1: { value: totalJobs.toLocaleString(), label: '有效岗位' },
    data2: { value: cities, label: '覆盖城市' },
    data3: { value: '¥' + (avgSalary / 1000).toFixed(1) + 'K', label: '平均薪资' },
  },
  {
    icon: '🎯',
    title: '个性化学习路线',
    desc: '基于AI智能推荐的学习路径规划',
    data1: { value: '9,856', label: '学习用户' },
    data2: { value: '98.2%', label: '匹配度' },
    data3: { value: '128', label: '学习路径' },
  },
  {
    icon: '📈',
    title: '战略人才统计',
    desc: 'IT行业人才供需数据实时监控',
    data1: { value: '56,230', label: '人才储备' },
    data2: { value: '45.8%', label: '就业率' },
    data3: { value: '¥' + (avgSalary / 1000).toFixed(1) + 'K', label: '平均薪资' },
  },
])

const bottomModules = ref([
  {
    key: 'planning',
    title: '学业-就业双向联动规划',
    desc: '基于学业数据与就业市场的智能联动规划系统',
    color: '#4a9eff',
    iconViewBox: '0 0 60 60',
    icon: '<rect x="10" y="25" width="15" height="25" rx="3" fill="currentColor"/><rect x="22" y="15" width="15" height="35" rx="3" fill="currentColor"/><rect x="34" y="20" width="15" height="30" rx="3" fill="currentColor"/><line x1="10" y1="55" x2="49" y2="55" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
  },
  {
    key: 'ai-resume',
    title: 'AI简历',
    desc: '基于AI技术的智能简历生成与优化系统',
    color: '#00d4aa',
    iconViewBox: '0 0 60 60',
    icon: '<rect x="12" y="10" width="36" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="22" r="8" fill="currentColor" opacity="0.3"/><rect x="18" y="32" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.6"/><rect x="18" y="38" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="18" y="44" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>'
  },
  {
    key: 'talent-stat',
    title: '人才专项统计模块',
    desc: '各类人才数据的专项统计与分析可视化',
    color: '#a855f7',
    iconViewBox: '0 0 60 60',
    icon: '<circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 8 L35 25 L52 25 L38 37 L43 52 L30 42 L17 52 L22 37 L8 25 L25 25 Z" fill="currentColor" opacity="0.3"/>'
  },
  {
    key: 'industry-prediction',
    title: '行业供需预测',
    desc: '基于大数据分析的行业供需趋势预测',
    color: '#f59e0b',
    iconViewBox: '0 0 60 60',
    icon: '<path d="M8 45 Q15 35 22 40 T36 30 T52 25" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 50 Q15 40 22 45 T36 35 T52 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/><circle cx="8" cy="50" r="3" fill="currentColor"/><circle cx="52" cy="25" r="4" fill="currentColor"/>'
  },
  {
    key: 'job-recommend',
    title: '智能岗位推荐',
    desc: '基于AI算法的个性化岗位智能推荐系统',
    color: '#06b6d4',
    iconViewBox: '0 0 60 60',
    icon: '<circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="8" fill="currentColor"/><circle cx="15" cy="20" r="4" fill="currentColor" opacity="0.6"/><circle cx="45" cy="20" r="4" fill="currentColor" opacity="0.6"/><circle cx="15" cy="40" r="4" fill="currentColor" opacity="0.6"/><circle cx="45" cy="40" r="4" fill="currentColor" opacity="0.6"/><line x1="30" y1="12" x2="30" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><line x1="30" y1="30" x2="15" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><line x1="30" y1="30" x2="45" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>'
  },
])

const navigateTo = (module) => {
  if (module === 'job-recommend') {
    router.push('/job-recommend')
  } else if (module === 'ai-resume') {
    router.push('/ai-resume')
  } else if (module === 'industry-prediction') {
    router.push('/industry-prediction')
  } else if (module === 'job-community') {
    router.push('/job-community')
  } else if (module === 'talent-stat') {
    router.push('/talent-statistics')
  } else {
    alert(`进入${module}模块，功能开发中`)
  }
}

const logout = () => {
  router.push('/')
}

const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const stars = []
  const particles = []

  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.005
    })
  }

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.2,
      hue: Math.random() > 0.5 ? 180 : 240
    })
  }

  let time = 0

  const animate = () => {
    ctx.fillStyle = 'rgba(8, 5, 35, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    stars.forEach(star => {
      star.twinkle += star.twinkleSpeed
      const alpha = star.brightness * (0.5 + Math.sin(star.twinkle) * 0.5)
      
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.fill()
    })

    particles.forEach(p => {
      p.x += p.vx + Math.sin(time * 0.0003 + p.x * 0.002) * 0.05
      p.y += p.vy + Math.cos(time * 0.0003 + p.y * 0.002) * 0.05

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`
      ctx.fill()
    })

    particles.forEach((p1, i) => {
      particles.forEach((p2, j) => {
        if (i < j) {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(74, 158, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
    })

    time++
    bgAnimationId = requestAnimationFrame(animate)
  }

  animate()

  return () => {
    window.removeEventListener('resize', resizeCanvas)
    if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
  }
}

onMounted(() => {
  initBackground()
  
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
  }, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.dashboard-glow-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(74, 158, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 212, 170, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(167, 139, 250, 0.03) 0%, transparent 60%);
  z-index: 0;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 20px;
  color: #4a9eff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: rgba(239, 68, 68, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

.top-modules {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
}

.module-card {
  flex: 1;
  max-width: 500px;
  padding: 25px 40px;
  border-radius: 16px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.module-card:hover {
  transform: translateY(-4px);
}

.module-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.module-icon {
  flex-shrink: 0;
}

.module-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  transition: all 0.4s ease;
}

.function-module {
  background: rgba(74, 158, 255, 0.05);
  border-color: rgba(74, 158, 255, 0.1);
}

.function-module h3 {
  color: rgba(74, 158, 255, 0.5);
}

.function-module.active {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 
    0 0 60px rgba(74, 158, 255, 0.35),
    0 10px 30px rgba(0, 0, 0, 0.3);
}

.function-module.active h3 {
  color: rgba(74, 158, 255, 0.95);
  text-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
}

.visualization-module {
  background: rgba(74, 158, 255, 0.05);
  border-color: rgba(74, 158, 255, 0.1);
}

.visualization-module h3 {
  color: rgba(74, 158, 255, 0.5);
}

.visualization-module.active {
  background: rgba(74, 158, 255, 0.3);
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 
    0 0 60px rgba(74, 158, 255, 0.35),
    0 10px 30px rgba(0, 0, 0, 0.3);
}

.visualization-module.active h3 {
  color: rgba(74, 158, 255, 0.95);
  text-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
}

.module-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(74, 158, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.module-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.8), transparent);
  border-radius: 2px;
}

.module-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid rgba(74, 158, 255, 0.4);
  pointer-events: none;
}

.module-corner.tl {
  top: 15px;
  left: 15px;
  border-right: none;
  border-bottom: none;
}

.module-corner.tr {
  top: 15px;
  right: 15px;
  border-left: none;
  border-bottom: none;
}

.module-corner.bl {
  bottom: 15px;
  left: 15px;
  border-right: none;
  border-top: none;
}

.module-corner.br {
  bottom: 15px;
  right: 15px;
  border-left: none;
  border-top: none;
}

.main-section {
  background: rgba(5, 10, 35, 0.7);
  border-radius: 24px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  padding: 25px;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
  box-shadow: 
    0 0 60px rgba(74, 158, 255, 0.1),
    0 15px 40px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
}

.section-header span {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(74, 158, 255, 0.9);
  letter-spacing: 3px;
}

.header-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.4), transparent);
}

.main-content {
  display: grid;
  grid-template-columns: 260px 1fr 300px;
  gap: 18px;
  align-items: stretch;
  min-height: 260px;
}

.left-panel, .center-panel, .right-panel {
  background: rgba(10, 15, 40, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(74, 158, 255, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.panel-header .panel-icon {
  color: rgba(74, 158, 255, 0.8);
}

.panel-header span {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.community-posts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(5, 10, 30, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-item:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.2);
  transform: translateX(5px);
}

.post-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(74, 158, 255, 0.1);
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 0.85rem;
  color: #fff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  font-size: 0.7rem;
  color: rgba(150, 180, 220, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-author {
  color: rgba(74, 158, 255, 0.5);
}

.post-time {
  color: rgba(150, 180, 220, 0.3);
}

.post-comments {
  color: rgba(150, 180, 220, 0.3);
}

.post-badge {
  font-size: 0.8rem;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding-top: 15px;
  margin-top: 10px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
  color: rgba(74, 158, 255, 0.6);
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.panel-footer:hover {
  color: rgba(74, 158, 255, 0.9);
}

.carousel-panel {
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

.carousel-wrapper {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  min-height: 180px;
}

.carousel-content {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-item {
  flex: 1;
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-card {
  width: 100%;
  height: 100%;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.2);
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.slide-icon {
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.slide-card h4 {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(74, 158, 255, 0.95);
  margin-bottom: 4px;
}

.slide-card p {
  font-size: 0.75rem;
  color: rgba(150, 180, 220, 0.4);
  margin-bottom: 10px;
}

.slide-data {
  display: flex;
  gap: 25px;
  margin-bottom: 10px;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.data-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(74, 158, 255, 0.9);
  text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
}

.data-label {
  font-size: 0.65rem;
  color: rgba(150, 180, 220, 0.4);
}

.slide-btn {
  padding: 6px 18px;
  background: rgba(74, 158, 255, 0.3);
  border: 1px solid rgba(74, 158, 255, 0.5);
  border-radius: 12px;
  color: rgba(74, 158, 255, 0.9);
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slide-btn:hover {
  background: rgba(74, 158, 255, 0.5);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  width: 18px;
  border-radius: 3px;
  background: rgba(74, 158, 255, 0.7);
}

.resume-avatar-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.tech-avatar {
  position: relative;
}

.tech-avatar svg {
  filter: drop-shadow(0 0 20px rgba(74, 158, 255, 0.5));
  transition: transform 0.3s ease;
}

.tech-avatar:hover svg {
  transform: scale(1.05);
}

.avatar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50%;
  animation: ringRotate 15s linear infinite;
}

.avatar-ring.ring-2 {
  top: -14px;
  left: -14px;
  right: -14px;
  bottom: -14px;
  border-width: 0.5px;
  border-color: rgba(74, 158, 255, 0.15);
  animation-direction: reverse;
  animation-duration: 20s;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.resume-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.resume-doc {
  width: 100%;
  max-width: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.1);
  padding: 12px;
}

.doc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.doc-icon {
  font-size: 1.2rem;
}

.doc-header span {
  font-size: 0.85rem;
  color: #fff;
  font-weight: 500;
}

.doc-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.doc-line {
  height: 3px;
  background: rgba(74, 158, 255, 0.3);
  border-radius: 2px;
}

.doc-line.short {
  width: 60%;
}

.resume-btn {
  width: 100%;
  padding: 9px;
  background: rgba(74, 158, 255, 0.25);
  border: 1px solid rgba(74, 158, 255, 0.5);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.9);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resume-btn:hover {
  background: rgba(74, 158, 255, 0.4);
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
}

.bottom-modules {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  position: relative;
  z-index: 10;
}

.bottom-card {
  background: rgba(10, 15, 40, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  padding: 25px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: cardFadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.bottom-card:hover {
  transform: translateY(-8px);
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 
    0 0 60px rgba(74, 158, 255, 0.2),
    0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(74, 158, 255, 0.05) 0%, transparent 60%);
  pointer-events: none;
}

.card-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: var(--color);
  filter: drop-shadow(0 0 10px var(--color));
}

.bottom-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.bottom-card p {
  font-size: 0.75rem;
  color: rgba(150, 180, 220, 0.4);
  margin-bottom: 15px;
  line-height: 1.5;
}

.card-btn {
  padding: 7px 14px;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 15px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-btn:hover {
  background: rgba(74, 158, 255, 0.4);
  color: rgba(74, 158, 255, 0.95);
}

.card-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  pointer-events: none;
}

.card-corner.tl {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
}

.card-corner.tr {
  top: 10px;
  right: 10px;
  border-left: none;
  border-bottom: none;
}

.card-corner.bl {
  bottom: 10px;
  left: 10px;
  border-right: none;
  border-top: none;
}

.card-corner.br {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .bottom-modules {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .top-modules {
    flex-direction: column;
  }
  
  .bottom-modules {
    grid-template-columns: 1fr;
  }
}
</style>