<template>
  <div class="skill-route-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>返回</span>
        </button>
        <h1 class="page-title">行业技能路线</h1>
        <span class="page-subtitle">{{ positionLabel ? '当前岗位：' + positionLabel : '选择岗位后生成阶梯式学习路线' }}</span>
      </div>
      <div class="header-nav">
        <span class="nav-item" @click="goBack">资源推送</span>
        <span class="nav-item active">行业技能路线</span>
        <span class="nav-item">我的学习计划</span>
        <span class="nav-item">个人中心</span>
      </div>
    </div>

    <div class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="section-label">岗位选择</div>
          <div class="selector-wrapper">
            <select v-model="selectedPosition" class="position-select" @change="onPositionChange">
              <option value="">-- 请选择岗位 --</option>
              <optgroup v-for="group in positionGroups" :key="group.name" :label="group.name">
                <option v-for="pos in group.positions" :key="pos.key" :value="pos.key">{{ pos.label }}</option>
              </optgroup>
            </select>
          </div>
          <div v-if="positionLabel" class="selected-info">
            <div class="info-row">
              <span class="info-label">目标岗位</span>
              <span class="info-value">{{ positionLabel }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">技能总数</span>
              <span class="info-value highlight">{{ totalSkills }} 项</span>
            </div>
            <div class="info-row">
              <span class="info-label">学习周期</span>
              <span class="info-value">约 20 周</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section" v-if="positionLabel">
          <div class="section-label">学习进度</div>
          <div class="progress-ring">
            <svg viewBox="0 0 120 120" class="ring-svg">
              <circle cx="60" cy="60" r="50" class="ring-bg"/>
              <circle cx="60" cy="60" r="50" class="ring-progress"
                :style="{ strokeDasharray: `${progress * 314} 314` }"/>
            </svg>
            <div class="ring-center">
              <span class="ring-value">{{ progressPercent }}%</span>
              <span class="ring-label">完成度</span>
            </div>
          </div>
          <div class="stage-progress-list">
            <div v-for="(stage, idx) in routeStages" :key="stage.id" class="stage-progress-item">
              <span class="stage-dot" :style="{ background: stage.color }"></span>
              <span class="stage-name">{{ stage.name }}</span>
              <span class="stage-status" :class="{ done: idx < currentStageIdx, active: idx === currentStageIdx }">
                {{ idx < currentStageIdx ? '✓' : idx === currentStageIdx ? '进行中' : '待学习' }}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <template v-if="!selectedPosition">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h2>请先选择目标就业岗位</h2>
            <p>选择岗位后，系统将根据 JD 技能要求自动生成阶梯式学习路线</p>
            <button class="empty-btn" @click="goBack">返回选择岗位</button>
          </div>
        </template>

        <template v-else>
          <div class="route-header">
            <div class="route-title-area">
              <h2>🎓 {{ positionLabel }} · 学习路线图</h2>
              <p class="route-desc">基于岗位 JD 技能清单，系统自动生成五阶段阶梯式学习路径</p>
            </div>
            <div class="route-stats">
              <div class="stat-item">
                <span class="stat-value">{{ routeStages.length }}</span>
                <span class="stat-label">学习阶段</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalSkills }}</span>
                <span class="stat-label">技能点</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">20</span>
                <span class="stat-label">周计划</span>
              </div>
            </div>
          </div>

          <!-- 资源匹配加载提示横幅（岗位切换时显示） -->
          <div v-if="loadingResources" class="resource-loading-banner">
            <span class="loading-spinner"></span>
            <span>正在匹配对应技能学习资源，请稍等...</span>
          </div>

          <div class="timeline-container">
            <div v-for="(stage, idx) in routeStages" :key="stage.id" class="stage-card" :class="{ 'stage-active': idx === currentStageIdx, 'stage-done': idx < currentStageIdx }">
              <div class="stage-connector" v-if="idx < routeStages.length - 1">
                <div class="connector-line" :style="{ background: `linear-gradient(to bottom, ${stage.color}, ${routeStages[idx + 1].color})` }"></div>
              </div>

              <div class="stage-header">
                <div class="stage-icon" :style="{ background: stage.color + '20', borderColor: stage.color }">
                  <span>{{ stage.icon }}</span>
                </div>
                <div class="stage-meta">
                  <h3 class="stage-name">{{ stage.name }}</h3>
                  <p class="stage-desc">{{ stage.desc }}</p>
                </div>
                <div class="stage-badge" :style="{ background: stage.color + '20', color: stage.color }">
                  {{ stage.weeks }}
                </div>
              </div>

              <div class="stage-body">
                <div class="skills-list">
                  <div v-for="(skill, sIdx) in stage.skills" :key="sIdx" class="skill-block" :class="'level-' + skill.level">
                    <div class="skill-item" @click="toggleSkillResources(skill.name)">
                      <div class="skill-checkbox">
                        <span v-if="sIdx % 3 === 0" class="check-mark">✓</span>
                      </div>
                      <div class="skill-info">
                        <span class="skill-name">{{ skill.name }}</span>
                        <span v-if="skill.category" class="skill-category">{{ skill.category }}</span>
                      </div>
                      <span class="skill-level" :class="'level-' + skill.level">{{ levelLabels[skill.level] }}</span>
                      <span class="resource-toggle" :class="{ expanded: isSkillExpanded(skill.name) }" :title="isSkillExpanded(skill.name) ? '收起资源' : '查看学习资源'">
                        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span class="toggle-text">学习资源</span>
                      </span>
                    </div>

                    <!-- 学习资源面板（展开时显示） -->
                    <transition name="resource-expand">
                      <div v-if="isSkillExpanded(skill.name)" class="resource-panel">
                        <!-- 加载中提示 -->
                        <div v-if="loadingResources" class="resource-loading">
                          <span class="loading-spinner"></span>
                          <span>正在匹配对应技能学习资源，请稍等...</span>
                        </div>
                        <template v-else-if="getSkillData(skill.name).valid.length > 0">
                          <div class="resource-cards">
                            <!-- 有效链接：可点击，新标签打开 -->
                            <a
                              v-for="res in getSkillData(skill.name).valid"
                              :key="res.id"
                              :href="res.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="resource-card"
                              :class="'src-' + res.source"
                            >
                              <span class="res-icon">{{ getSourceIcon(res.source) }}</span>
                              <div class="res-body">
                                <div class="res-head">
                                  <span class="res-title">{{ res.title }}</span>
                                  <span class="res-type-tag" :class="'type-' + getTypeClass(res.type)">{{ res.type }}</span>
                                </div>
                                <span class="res-meta">{{ res.sourceName }} · {{ res.level }}</span>
                                <span v-if="res.desc" class="res-desc">{{ res.desc }}</span>
                              </div>
                              <span class="res-source-tag" :class="'tag-' + res.source">{{ getSourceLabel(res.source) }}</span>
                              <span class="res-open">↗</span>
                            </a>
                            <!-- 失效链接：置灰、禁止点击、提示失效 -->
                            <div
                              v-for="res in getSkillData(skill.name).invalid"
                              :key="res.id + '_inv'"
                              class="resource-card invalid"
                            >
                              <span class="res-icon">⚠️</span>
                              <div class="res-body">
                                <div class="res-head">
                                  <span class="res-title">{{ res.title }}</span>
                                  <span class="res-type-tag type-invalid">已失效</span>
                                </div>
                                <span class="res-meta">链接失效，已禁止跳转</span>
                              </div>
                              <span class="res-source-tag tag-invalid">失效</span>
                            </div>
                          </div>
                          <!-- 实践练习方案 + 推荐工具 -->
                          <div class="practice-section">
                            <div v-if="getSkillData(skill.name).practiceTip" class="practice-tip">
                              <span class="practice-label">🛠 实践方案</span>
                              <span class="practice-text">{{ getSkillData(skill.name).practiceTip }}</span>
                            </div>
                            <div v-if="getSkillData(skill.name).tools.length > 0" class="tools-row">
                              <span class="practice-label">🔧 推荐工具</span>
                              <div class="tool-chips">
                                <span v-for="tool in getSkillData(skill.name).tools" :key="tool" class="tool-chip">{{ tool }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                        <!-- 兜底方案：全部资源失效或无资源 -->
                        <div v-else class="resource-fallback">
                          <span class="fallback-icon">📚</span>
                          <span class="fallback-text">该技能暂无可用学习资源，建议咨询 <strong>AI 学习顾问</strong> 获取文字学习方案</span>
                          <button class="fallback-btn" @click.stop="goToAIAdvisor">咨询 AI 学习顾问</button>
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>
                <div v-if="stage.skills.length === 0" class="no-skills">
                  <span>此阶段暂无技能要求</span>
                </div>
              </div>

              <div class="stage-actions">
                <button class="stage-btn" :style="{ borderColor: stage.color, color: stage.color }">
                  开始学习
                </button>
                <button class="stage-btn ghost">
                  查看课程
                </button>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { positionGroups, levelLabels, generateLearningRoute, getPositionLabel } from '@/data/positionSkills.js'

const router = useRouter()
const bgCanvas = ref(null)
const selectedPosition = ref('')
const progress = ref(0)
const currentStageIdx = ref(0)

// ========== 学习资源相关状态 ==========
const resourceMap = ref({})       // { [skillName]: { valid: [...], invalid: [...] } }
const expandedSkills = ref({})     // { [skillName]: true/false }
const loadingResources = ref(false)

const positionLabel = computed(() => getPositionLabel(selectedPosition.value))

const routeStages = computed(() => {
  if (!selectedPosition.value) return []
  return generateLearningRoute(selectedPosition.value)
})

const totalSkills = computed(() => {
  if (!selectedPosition.value) return 0
  return routeStages.value.reduce((sum, s) => sum + s.skills.length, 0)
})

const progressPercent = computed(() => Math.round(progress.value * 100))

// 标准化技能名（去除「面试高频」等后缀，保证标签严格匹配）
const normalizeSkillName = (name) => String(name).replace(/（[^）]*）/g, '').trim()

// 收集当前岗位所有技能名（去重 + 标准化）
const allSkillNames = computed(() => {
  const names = new Set()
  for (const stage of routeStages.value) {
    for (const skill of stage.skills) {
      names.add(normalizeSkillName(skill.name))
    }
  }
  return Array.from(names)
})

// 收集技能名+等级（用于三级匹配接口）
const allSkillData = computed(() => {
  return allSkillNames.value.map(name => {
    let level = 'must'
    for (const stage of routeStages.value) {
      const found = stage.skills.find(s => normalizeSkillName(s.name) === name)
      if (found) { level = found.level; break }
    }
    return { name, level }
  })
})

// 调用后端三级匹配接口（岗位联动核心）
const fetchResources = async () => {
  if (allSkillData.value.length === 0) {
    resourceMap.value = {}
    return
  }
  // 区域锁定：防止重复请求
  if (loadingResources.value) return
  loadingResources.value = true
  try {
    const res = await fetch('/api/resources/match-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positionKey: selectedPosition.value,
        skills: allSkillData.value
      })
    })
    const data = await res.json()
    if (data.success) {
      resourceMap.value = data.data
    } else {
      resourceMap.value = {}
    }
  } catch (e) {
    console.error('[SkillRoute] 三级匹配获取资源失败:', e)
    resourceMap.value = {}
  } finally {
    loadingResources.value = false
  }
}

// 获取某技能的完整匹配结果（资源+实践方案+工具）
const getSkillData = (skillName) => {
  const normalized = normalizeSkillName(skillName)
  const raw = resourceMap.value[normalized]
  if (!raw) return { valid: [], invalid: [], practiceTip: '', tools: [], source: '' }
  const resources = raw.resources || []
  // valid 包含所有非 invalid 资源（后端已做备用链接切换，主链失效的已替换为备用链接）
  return {
    valid: resources.filter(r => r.status !== 'invalid'),
    invalid: resources.filter(r => r.status === 'invalid'),
    practiceTip: raw.practiceTip || '',
    tools: raw.tools || [],
    source: raw.source || ''
  }
}

// 兼容旧调用
const getSkillResources = (skillName) => {
  const d = getSkillData(skillName)
  return { valid: d.valid, invalid: d.invalid }
}

// 展开/收起某技能的资源面板
const toggleSkillResources = (skillName) => {
  const normalized = normalizeSkillName(skillName)
  expandedSkills.value = { ...expandedSkills.value, [normalized]: !expandedSkills.value[normalized] }
}

const isSkillExpanded = (skillName) => {
  return !!expandedSkills.value[normalizeSkillName(skillName)]
}

// 来源标签与图标
const getSourceLabel = (source) => {
  const map = { official: '官方', bilibili: 'B站', 'bilibili-search': 'B站搜索', github: 'GitHub', 'tech-site': '技术站', course: '课程', personal: '个人' }
  return map[source] || source
}
const getSourceIcon = (source) => {
  const map = { official: '📖', bilibili: '🎬', 'bilibili-search': '🔍', github: '🐙', 'tech-site': '🌐', course: '🎓', personal: '📝' }
  return map[source] || '📄'
}

// 资源类型样式映射（文档/视频/实战项目）
const getTypeClass = (type) => {
  const t = String(type || '')
  if (t.includes('视频')) return 'video'
  if (t.includes('实战') || t.includes('项目')) return 'practice'
  return 'doc'
}

// 兜底：跳转 AI 学习顾问
const goToAIAdvisor = () => {
  router.push('/planning')
}

// 岗位切换时重新拉取资源
watch(() => selectedPosition.value, () => {
  expandedSkills.value = {}
  fetchResources()
})

const onPositionChange = () => {
  progress.value = 0
  currentStageIdx.value = 0
}

const goBack = () => {
  router.push('/planning')
}

let progressTimer = null
onMounted(() => {
  drawBackground()
  progressTimer = setInterval(() => {
    if (progress.value < 0) return
    if (selectedPosition.value && progress.value < 0.15) {
      progress.value += 0.003
    }
    if (progress.value >= 0.15) {
      currentStageIdx.value = 1
    }
  }, 200)

  const saved = localStorage.getItem('selectedPosition')
  if (saved) {
    selectedPosition.value = saved
  }

  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  const canvas = bgCanvas.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

const drawBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []
  const particleCount = 60
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.15
    })
  }

  const animate = () => {
    ctx.fillStyle = 'rgba(10, 15, 25, 0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.x += p.speedX
      p.y += p.speedY
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74, 158, 255, ${p.opacity})`
      ctx.fill()
    })

    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(74, 158, 255, ${0.12 * (1 - dist / 150)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })
    })

    requestAnimationFrame(animate)
  }
  animate()
}

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.skill-route-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f19 0%, #111b2e 50%, #0d1525 100%);
  overflow: hidden;
  color: #fff;
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
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(17, 27, 46, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 20px;
  color: #4a9eff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(74, 158, 255, 0.2);
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.header-nav {
  display: flex;
  gap: 25px;
}

.nav-item {
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
}

.main-layout {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  padding: 25px;
  max-width: 1500px;
  margin: 0 auto;
}

.sidebar {
  background: rgba(17, 27, 46, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 18px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 0.7rem;
  color: rgba(74, 158, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.selector-wrapper {
  position: relative;
}

.position-select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(10, 15, 25, 0.8);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.position-select:focus {
  border-color: rgba(74, 158, 255, 0.6);
}

.position-select option,
.position-select optgroup {
  background: #0d1525;
  color: #fff;
}

.selected-info {
  background: rgba(30, 45, 70, 0.5);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.info-label {
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  color: rgba(255, 255, 255, 0.85);
}

.info-value.highlight {
  color: #4a9eff;
  font-weight: 600;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(74, 158, 255, 0.1);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: url(#grad);
  stroke: #4a9eff;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s;
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4a9eff;
}

.ring-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.stage-progress-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-progress-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
}

.stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stage-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.7);
}

.stage-status {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.stage-status.active {
  color: #4a9eff;
}

.stage-status.done {
  color: #00d4aa;
}

.content-area {
  background: rgba(17, 27, 46, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 25px;
  min-height: calc(100vh - 140px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 1.3rem;
  margin: 0 0 10px;
  color: #fff;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 25px;
  max-width: 400px;
}

.empty-btn {
  padding: 12px 32px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.route-title-area h2 {
  font-size: 1.4rem;
  margin: 0 0 6px;
  color: #fff;
}

.route-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.route-stats {
  display: flex;
  gap: 25px;
}

.stat-item {
  text-align: center;
  padding: 12px 20px;
  background: rgba(30, 45, 70, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.1);
}

.stat-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #4a9eff;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stage-card {
  position: relative;
  padding: 20px;
  background: rgba(30, 45, 70, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.stage-card.stage-active {
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.15);
}

.stage-card.stage-done {
  opacity: 0.8;
}

.stage-connector {
  position: absolute;
  left: 42px;
  top: -10px;
  height: 20px;
  z-index: -1;
}

.connector-line {
  width: 3px;
  height: 100%;
  border-radius: 2px;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.stage-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  border: 2px solid;
  flex-shrink: 0;
}

.stage-meta {
  flex: 1;
}

.stage-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: #fff;
}

.stage-desc {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.stage-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.stage-body {
  padding-left: 60px;
  margin-bottom: 14px;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-block {
  background: rgba(10, 15, 25, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.skill-block:hover {
  border-color: rgba(74, 158, 255, 0.2);
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.skill-item:hover {
  background: rgba(74, 158, 255, 0.1);
}

/* 资源展开/收起开关 */
.resource-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(74, 158, 255, 0.12);
  color: rgba(122, 184, 255, 0.9);
  font-size: 0.7rem;
  transition: all 0.25s;
  flex-shrink: 0;
}

.resource-toggle svg {
  transition: transform 0.25s;
}

.resource-toggle.expanded svg {
  transform: rotate(180deg);
}

.resource-toggle.expanded {
  background: rgba(74, 158, 255, 0.25);
  color: #4a9eff;
}

.toggle-text {
  white-space: nowrap;
}

/* 资源面板展开过渡 */
.resource-expand-enter-active,
.resource-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.resource-expand-enter-from,
.resource-expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}

.resource-expand-enter-to,
.resource-expand-leave-from {
  opacity: 1;
  max-height: 600px;
}

/* 资源面板容器 */
.resource-panel {
  padding: 10px 12px 12px;
  background: rgba(5, 10, 20, 0.5);
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.resource-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 资源卡片 */
.resource-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.08), rgba(0, 212, 170, 0.04));
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.78rem;
  transition: all 0.2s;
  cursor: pointer;
}

.resource-card:hover {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.18), rgba(0, 212, 170, 0.08));
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateX(3px);
  box-shadow: 0 2px 10px rgba(74, 158, 255, 0.15);
}

.res-icon {
  font-size: 1rem;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 1px;
}

/* 资源主体内容（标题+类型+说明） */
.res-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.res-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.res-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 资源类型标签：文档/视频/实战项目 */
.res-type-tag {
  padding: 1px 7px;
  border-radius: 8px;
  font-size: 0.62rem;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

.res-type-tag.type-doc {
  background: rgba(74, 158, 255, 0.18);
  color: #7ab8ff;
}

.res-type-tag.type-video {
  background: rgba(255, 99, 132, 0.18);
  color: #ff8aa0;
}

.res-type-tag.type-practice {
  background: rgba(0, 212, 170, 0.18);
  color: #5eead4;
}

.res-type-tag.type-invalid {
  background: rgba(255, 99, 99, 0.15);
  color: #ff8a8a;
}

.res-meta {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.res-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.res-source-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.64rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* 来源标签配色 */
.tag-official {
  background: rgba(0, 212, 170, 0.18);
  color: #5eead4;
}

.tag-bilibili {
  background: rgba(255, 99, 132, 0.18);
  color: #ff8aa0;
}

.tag-tech-site {
  background: rgba(74, 158, 255, 0.18);
  color: #7ab8ff;
}

.tag-course {
  background: rgba(192, 132, 252, 0.18);
  color: #c084fc;
}

.tag-personal {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.res-open {
  color: rgba(74, 158, 255, 0.7);
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* 失效链接：置灰、禁止点击 */
.resource-card.invalid {
  background: rgba(60, 60, 70, 0.25);
  border-color: rgba(120, 120, 130, 0.15);
  color: rgba(255, 255, 255, 0.35);
  cursor: not-allowed;
  filter: grayscale(0.8);
}

.resource-card.invalid:hover {
  background: rgba(60, 60, 70, 0.25);
  border-color: rgba(120, 120, 130, 0.15);
  transform: none;
  box-shadow: none;
}

.resource-card.invalid .res-title {
  text-decoration: line-through;
  text-decoration-color: rgba(255, 99, 99, 0.4);
}

.tag-invalid {
  background: rgba(255, 99, 99, 0.15);
  color: #ff8a8a;
}

/* 兜底提示 */
.resource-fallback {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 14px;
  background: rgba(255, 187, 36, 0.06);
  border: 1px dashed rgba(255, 187, 36, 0.3);
  border-radius: 8px;
}

.fallback-icon {
  font-size: 1.2rem;
}

.fallback-text {
  flex: 1;
  min-width: 200px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}

.fallback-text strong {
  color: #fbbf24;
}

.fallback-btn {
  padding: 6px 16px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.fallback-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(74, 158, 255, 0.3);
}

/* 加载提示 - 全局横幅 */
.resource-loading-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.1), rgba(0, 212, 170, 0.06));
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  color: rgba(122, 184, 255, 0.9);
  font-size: 0.82rem;
}

/* 加载提示 - 技能面板内 */
.resource-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  color: rgba(122, 184, 255, 0.8);
  font-size: 0.78rem;
}

/* 旋转加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(74, 158, 255, 0.2);
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 实践练习方案 + 推荐工具 */
.practice-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(74, 158, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.practice-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.practice-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(0, 212, 170, 0.85);
  white-space: nowrap;
  flex-shrink: 0;
}

.practice-text {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
}

.tools-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.tool-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tool-chip {
  padding: 2px 9px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  font-size: 0.66rem;
  color: rgba(122, 184, 255, 0.85);
}

.skill-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-mark {
  font-size: 0.7rem;
  color: #00d4aa;
  font-weight: bold;
}

.skill-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skill-name {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.82rem;
}

.skill-category {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
}

.skill-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 600;
  flex-shrink: 0;
}

.skill-level.level-must {
  background: rgba(255, 99, 99, 0.15);
  color: #ff8a8a;
}

.skill-level.level-prefer {
  background: rgba(74, 158, 255, 0.15);
  color: #7ab8ff;
}

.skill-level.level-bonus {
  background: rgba(0, 212, 170, 0.15);
  color: #5eead4;
}

.skill-block.level-must {
  border-left: 3px solid rgba(255, 99, 99, 0.4);
}

.skill-block.level-prefer {
  border-left: 3px solid rgba(74, 158, 255, 0.4);
}

.skill-block.level-bonus {
  border-left: 3px solid rgba(0, 212, 170, 0.4);
}

.no-skills {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.82rem;
}

.stage-actions {
  display: flex;
  gap: 12px;
  padding-left: 60px;
}

.stage-btn {
  padding: 8px 20px;
  background: transparent;
  border: 1.5px solid;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.stage-btn:hover {
  transform: translateY(-1px);
}

.stage-btn.ghost {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
}

.stage-btn.ghost:hover {
  border-color: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 220px 1fr;
  }
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .route-header {
    flex-direction: column;
    gap: 15px;
  }
  .route-stats {
    width: 100%;
  }
}
</style>
