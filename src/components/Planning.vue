<template>
  <div class="planning-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>返回</span>
        </button>
        <h1 class="page-title">学业-就业双向联动规划</h1>
        <span class="page-subtitle">基于学业数据与就业市场的智能联动规划系统</span>
      </div>
      <div class="header-nav">
        <span class="nav-item">学习路线</span>
        <span class="nav-item">资源推送</span>
        <span class="nav-item">AI答疑</span>
        <span class="nav-item">个人中心</span>
      </div>
    </div>

    <div class="main-layout" :class="{ 'ai-mode': currentNav === 'ai-assistant', 'no-ai-sidebar': currentNav !== 'ai-assistant' }">
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="section-label">功能导航</div>
          <div 
            v-for="item in navItems" 
            :key="item.key" 
            class="nav-item"
            :class="{ active: currentNav === item.key }"
            @click="handleNavClick(item.key)"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-text">{{ item.label }}</span>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <!-- 个人学习数据分析视图 -->
        <div v-if="currentNav === 'dashboard'" class="view-section">
          <div class="content-header">
            <h2>个人学习数据分析</h2>
            <p class="content-desc">实时追踪你的学习进度和成果</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon blue">📚</div>
              <div class="stat-content">
                <h3>已学资源</h3>
                <p class="stat-value">{{ learnedCount }}</p>
                <span class="stat-label">个学习资源</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green">⏱</div>
              <div class="stat-content">
                <h3>学习时长</h3>
                <p class="stat-value">{{ totalHours }}</p>
                <span class="stat-label">小时累计</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange">🎯</div>
              <div class="stat-content">
                <h3>技能掌握</h3>
                <p class="stat-value">{{ masteryRate }}%</p>
                <span class="stat-label">平均掌握率</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon purple">📈</div>
              <div class="stat-content">
                <h3>连续学习</h3>
                <p class="stat-value">{{ streakDays }}</p>
                <span class="stat-label">天连续打卡</span>
              </div>
            </div>
          </div>
          <div class="chart-section">
            <h3 class="chart-title">📊 技能掌握进度</h3>
            <div class="progress-list">
              <div v-for="skill in topSkills" :key="skill.name" class="progress-item">
                <div class="progress-header">
                  <span class="progress-name">{{ skill.name }}</span>
                  <span class="progress-percent">{{ skill.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: skill.progress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 行业技能路线视图 -->
        <div v-else-if="currentNav === 'skill-route'" class="view-section">
          <div class="content-header">
            <h2>行业技能路线</h2>
            <p class="content-desc">查看IT行业各岗位技能成长路径</p>
          </div>
          <div class="route-placeholder">
            <div class="placeholder-icon">🚀</div>
            <h3>技能路线规划</h3>
            <p>选择目标岗位后，系统将为你生成完整的技能成长路线图</p>
            <button class="action-btn primary" @click="currentNav = 'resource-lib'">前往选择岗位</button>
          </div>
        </div>

        <!-- 我的学习计划视图 -->
        <div v-else-if="currentNav === 'study-plan'" class="view-section">
          <div class="content-header">
            <h2>我的学习计划</h2>
            <p class="content-desc">管理你的学习任务和目标</p>
          </div>
          <div class="plan-list" v-if="studyPlans.length > 0">
            <div v-for="plan in studyPlans" :key="plan.id" class="plan-item">
              <div class="plan-header">
                <h4>{{ plan.title }}</h4>
                <span class="plan-status" :class="plan.status">{{ plan.statusText }}</span>
              </div>
              <p class="plan-desc">{{ plan.desc }}</p>
              <div class="plan-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: plan.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ plan.progress }}%</span>
              </div>
              <div class="plan-meta">
                <span>📅 截止: {{ plan.deadline }}</span>
                <span>🎯 目标: {{ plan.goal }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>暂无学习计划</h3>
            <p>选择岗位并开始学习，系统将为你自动生成学习计划</p>
            <button class="action-btn primary" @click="currentNav = 'resource-lib'">前往选择岗位</button>
          </div>
        </div>

        <!-- 推荐资源库视图 -->
        <div v-else-if="currentNav === 'resource-lib'" class="view-section">
          <div class="content-header">
            <h2>为你推荐的学习资源</h2>
            <p class="content-desc">根据你的目标岗位、学习进度和薄弱技能，系统自动推送资源</p>
          </div>

          <div class="job-selector">
            <div class="selector-label">
              <span class="label-icon">🎯</span>
              <span>选择目标岗位</span>
            </div>
            <div class="selector-wrapper">
              <select v-model="selectedPosition" class="position-select" @change="onPositionChange">
                <option value="">-- 请选择目标就业岗位 --</option>
                <optgroup v-for="group in positionGroups" :key="group.name" :label="group.name">
                  <option v-for="pos in group.positions" :key="pos.key" :value="pos.key">{{ pos.label }}</option>
                </optgroup>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>

          <section class="top-section" v-if="selectedPosition && currentSkills.length > 0">
            <div class="section-block-header">
              <div class="section-block-title">
                <span class="block-icon">📋</span>
                <span>岗位技能清单</span>
                <span class="block-divider"></span>
                <span class="block-subtitle">{{ selectedPositionLabel }} · 共 {{ currentSkills.length }} 项技能要求</span>
              </div>
              <div class="section-block-deco"></div>
            </div>
            <div class="skill-categories">
              <div v-for="category in categorizedSkills" :key="category.name" class="skill-category">
                <h4 class="category-title">{{ category.name }}</h4>
                <div class="skill-tags">
                  <span 
                    v-for="skill in category.skills" 
                    :key="skill.name" 
                    class="skill-tag"
                    :class="'level-' + skill.level"
                  >
                    {{ skill.name }}
                    <span class="level-badge">{{ levelLabels[skill.level] }}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section class="bottom-section">
            <div class="section-block-header">
              <div class="section-block-title">
                <span class="block-icon">🎓</span>
                <span>学习资源推送</span>
                <span class="block-divider"></span>
                <span class="block-subtitle">系统主动推送 · 每项技能至少匹配1份权威资源</span>
              </div>
              <div class="section-block-deco"></div>
            </div>
            <!-- 资源匹配加载提示横幅（岗位切换时显示，区域锁定防止重复请求） -->
            <div v-if="loadingResources" class="resource-loading-banner">
              <span class="loading-spinner"></span>
              <span>正在匹配对应技能学习资源，请稍等...</span>
            </div>
            <div class="resource-cards">
              <div
                v-for="(card, idx) in resourceCards"
                :key="card.id || idx"
                class="resource-card"
                :class="{ 'featured': card.featured }"
              >
                <div class="card-header">
                  <div class="card-header-left">
                    <span class="push-badge">
                      <span class="push-icon">⚡</span>
                      <span>系统推送</span>
                    </span>
                    <span class="card-type">{{ card.typeLabel }}</span>
                  </div>
                  <div class="card-rating" v-if="card.rating">
                    <span class="rating-star">★</span>
                    <span>{{ card.rating }}</span>
                  </div>
                </div>
                <h3 class="card-title">{{ card.title }}</h3>
                <p class="card-desc">{{ card.desc }}</p>
                <div class="card-meta-row">
                  <span class="meta-item" v-if="card.matchedSkills && card.matchedSkills.length > 0">
                    <span class="meta-icon">🎯</span>
                    匹配技能：{{ card.matchedSkills.slice(0, 2).map(s => s.name).join('、') }}{{ card.matchedSkills.length > 2 ? ` 等${card.matchedSkills.length}项` : '' }}
                  </span>
                  <span class="relevance-badge" v-if="card.relevanceScore" :class="'level-' + getRelevanceLevel(card.relevanceScore)">
                    <span class="relevance-icon">📊</span>
                    <span>匹配度 {{ Math.round(card.relevanceScore) }}%</span>
                  </span>
                </div>
                <div class="card-footer">
                  <span class="time-label">⏱ {{ card.durationText }}</span>
                  <span class="level-label" :class="'level-' + card.difficulty">{{ card.difficulty }}</span>
                  <span class="source-label" v-if="card.provider">{{ card.provider }}</span>
                  <span class="quality-badge" v-if="card.isHighlyRelevant">
                    <span class="quality-icon">✓</span>
                    <span>强相关</span>
                  </span>
                </div>
                <button
                  class="card-action-btn"
                  v-if="card.url || card.externalUrl"
                  @click.stop="openResource(card)"
                >
                  🚀 前往学习
                </button>
                <div class="card-collapse-toggle" @click="toggleCardExpand(card.id || idx)">
                  <span class="toggle-icon" :class="{ expanded: expandedCards[card.id || idx] }">▼</span>
                  <span class="toggle-text">{{ expandedCards[card.id || idx] ? '收起详情' : '展开实践方案与工具' }}</span>
                </div>
                <div class="card-collapse-panel" v-if="expandedCards[card.id || idx]">
                  <div class="collapse-section" v-if="card.practicePlan && card.practicePlan.length > 0">
                    <h5 class="collapse-title">
                      <span class="collapse-icon">💪</span> 实践练习方案
                    </h5>
                    <ol class="practice-list">
                      <li v-for="(step, sIdx) in card.practicePlan" :key="sIdx">{{ step }}</li>
                    </ol>
                  </div>
                  <div class="collapse-section" v-if="card.recommendedTools && card.recommendedTools.length > 0">
                    <h5 class="collapse-title">
                      <span class="collapse-icon">🛠</span> 配套推荐工具
                    </h5>
                    <ul class="tools-list">
                      <li v-for="(tool, tIdx) in card.recommendedTools" :key="tIdx">{{ tool }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <!-- 游客模式：资源被截断底部提示（资源不足2条时不展示，避免误导） -->
            <div v-if="hasTruncatedResources" class="resource-truncate-hint" @click="showLoginModal()">
              <span class="truncate-icon">🔒</span>
              <span>还有更多权威学习资源，登录账号解锁全部内容</span>
              <span class="truncate-arrow">→</span>
            </div>
          </section>

          <div class="rules-section">
            <div class="rules-column">
              <h4 class="rules-title">🎯 推送规则</h4>
              <ul class="rules-list">
                <li><span class="rule-icon">📌</span> 目标岗位：{{ selectedPositionLabel }}</li>
                <li><span class="rule-icon">⚙️</span> 匹配算法：JD技能 + 进度加权</li>
                <li><span class="rule-icon">📊</span> 资源类型：视频/课程/图书</li>
              </ul>
            </div>
            <div class="rules-column">
              <h4 class="rules-title">📈 推送机制</h4>
              <ul class="rules-list">
                <li><span class="rule-icon">🔝</span> 必备技能权重10分/项</li>
                <li><span class="rule-icon">🔸</span> 优先技能权重5分/项</li>
                <li><span class="rule-icon">📐</span> 覆盖率 + 类型多样性</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- AI学习顾问视图 -->
        <div v-else-if="currentNav === 'ai-assistant'" class="view-section ai-view">
          <div class="content-header">
            <h2>AI学习顾问</h2>
            <p class="content-desc">AI学习助手，为你规划学习路径、解答技术疑问、模拟面试、推荐学习资源</p>
            <div v-if="isLocalFallbackMode" class="ai-offline-banner">
              <span class="offline-icon">{{ cozeCreditExhausted ? '💡' : '📚' }}</span>
              <span v-if="cozeCreditExhausted">AI服务额度不足，当前使用本地知识库回答。核心功能（学习路线/模拟面试/技术问答）仍可使用。</span>
              <span v-else>当前为本地知识库模式，回答基于本地数据。核心功能（学习路线/模拟面试/技术问答）仍可使用。</span>
              <button class="offline-close" @click="isLocalFallbackMode = false; cozeCreditExhausted = false">✕</button>
            </div>
            <div class="ai-header-actions">
              <span v-if="aiMessages.length > 1" class="ai-memory-hint">📝 已记住你的对话历史</span>
              <button v-if="aiMessages.length > 1" class="ai-clear-btn" @click="clearAIHistory">🗑️ 清除历史</button>
            </div>
          </div>
          <div class="ai-chat-container">
            <div class="ai-chat-messages" ref="aiChatMessagesRef">
              <div 
                v-for="(msg, idx) in aiMessages" 
                :key="msg.id || idx" 
                class="ai-chat-message" 
                :class="[msg.role, msg.isStreaming ? 'streaming' : '']"
              >
                <div class="message-avatar">
                  <span v-if="msg.role === 'user'">👤</span>
                  <span v-else>🤖</span>
                </div>
                <div class="message-content">
                  <div v-if="msg.role === 'assistant' && idx === 0 && !msg.content" class="ai-welcome">
                    <p>你好！我是AI学习顾问。我可以帮你：</p>
                    <ul>
                      <li>🎯 规划学习路径，制定学习计划</li>
                      <li>💡 解答技术疑问，讲解知识点</li>
                      <li>📚 推荐学习资源和实战项目</li>
                      <li>🚀 模拟面试，提供求职建议</li>
                    </ul>
                    <p class="ai-suggestion-title">试试这样问我：</p>
                    <ul class="ai-suggestions">
                      <li v-for="(sug, si) in aiSuggestions" :key="si" @click="useSuggestion(sug)">{{ sug }}</li>
                    </ul>
                  </div>
                  <div v-else class="message-text">{{ msg.content }}<span v-if="msg.isStreaming" class="cursor">|</span></div>
                </div>
              </div>
              <!-- 加载气泡：用户发送后显示，AI开始返回时消失 -->
              <div v-if="aiLoading && !aiStreamStarted" class="ai-chat-message assistant loading-bubble">
                <div class="message-avatar">🤖</div>
                <div class="message-content loading-content">
                  <div class="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span class="loading-text">正在思考，请稍等片刻...</span>
                </div>
              </div>
            </div>
            <!-- 游客模式：剩余对话次数提示 -->
            <div v-if="isGuestMode && !aiChatLocked" class="ai-guest-hint">
              <span class="guest-hint-icon">🎫</span>
              <span>游客模式：剩余 <strong>{{ guestAIChatRemaining }}</strong>/{{ GUEST_LIMITS.MAX_AI_CHAT_ROUNDS }} 轮对话</span>
            </div>
            <!-- 游客模式：对话次数已用完提示 -->
            <div v-if="isGuestMode && aiChatLocked" class="ai-guest-hint exhausted">
              <span class="guest-hint-icon">🔒</span>
              <span>对话次数已用完，登录后可无限制使用</span>
            </div>
            <div class="ai-chat-input" :class="{ locked: aiLoading || aiChatLocked }">
              <input 
                v-model="aiMessageInput" 
                type="text" 
                :placeholder="aiChatLocked ? '对话次数已用完，请登录解锁' : '输入你的学习问题...'" 
                @keydown.enter="sendAIMessage"
                :disabled="aiLoading || aiChatLocked"
              >
              <button 
                class="ai-send-btn" 
                @click="sendAIMessage"
                :disabled="aiLoading || !aiMessageInput.trim() || aiChatLocked"
              >
                {{ aiLoading ? '思考中...' : (aiChatLocked ? '已锁定' : '发送') }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <!-- 登录弹窗（游客模式功能受限时唤起，页面内弹窗+蒙层，禁止底层滚动） -->
    <LoginModal />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { findMatchingResources, typeLabels } from '@/data/resources.js'
import { useGuestMode } from '@/composables/useGuestMode'
import { authFetch, getAuthHeaders } from '@/utils/auth'
import LoginModal from '@/components/LoginModal.vue'

const router = useRouter()
const bgCanvas = ref(null)
const currentNav = ref('resource-lib')
const aiInput = ref('')
const selectedPosition = ref('')

// ========== 游客模式状态（统一权限管理） ==========
const {
  isGuestMode,
  guestAIChatCount,
  guestAIChatRemaining,
  GUEST_LIMITS,
  checkPermission,
  isGuestAIChatExhausted,
  incrementGuestAIChat,
  resetGuestAIChatCount,
  showLoginModal,
  refreshAuthState
} = useGuestMode()

// 资源截断标记：记录每个技能是否还有更多资源被隐藏（用于展示"解锁更多资源"提示）
const resourceTruncatedMap = ref({})

// 游客AI对话是否已锁定（达到3轮上限）
const aiChatLocked = computed(() => isGuestAIChatExhausted())

// 是否有资源被截断（游客模式下，某技能资源数超过配额时显示"解锁更多资源"提示）
// 边界优化：资源不足2条时不展示提示，避免误导
const hasTruncatedResources = computed(() => {
  if (!isGuestMode.value) return false
  for (const skillName of Object.keys(resourceMap.value)) {
    const resources = resourceMap.value[skillName]?.resources || []
    if (resources.length > GUEST_LIMITS.MAX_RESOURCES_PER_SKILL) {
      return true
    }
  }
  return false
})

// ========== 学习资源后端驱动状态 ==========
// 三级匹配：后端 /match-position 返回按技能分组的资源；失败时降级到本地 findMatchingResources
const resourceMap = ref({})         // 后端返回的按技能分组数据 { [skillName]: { resources, practiceTip, tools } }
const loadingResources = ref(false)  // 加载状态（区域锁定，防止重复请求）
const resourceError = ref(false)     // 错误标志（触发本地兜底，前端不弹报错）

// 学习数据统计
const learnedCount = ref(3)
const totalHours = ref(12)
const masteryRate = ref(68)
const streakDays = ref(5)

// 技能进度列表
const topSkills = computed(() => {
  if (!selectedPosition.value || currentSkills.value.length === 0) {
    return [
      { name: 'HTML/CSS', progress: 85 },
      { name: 'JavaScript', progress: 72 },
      { name: 'Vue/React', progress: 60 },
      { name: '工程化工具', progress: 45 }
    ]
  }
  return currentSkills.value.slice(0, 6).map((skill, idx) => ({
    name: skill.name,
    progress: Math.max(30, 90 - idx * 12)
  }))
})

// 学习计划列表
const studyPlans = computed(() => {
  if (!selectedPosition.value) return []
  const positionLabel = selectedPositionLabel.value || '目标岗位'
  return [
    {
      id: 1,
      title: `${positionLabel}基础技能学习`,
      desc: '掌握岗位所需的核心基础知识',
      progress: 45,
      status: 'ongoing',
      statusText: '进行中',
      deadline: '2026-08-30',
      goal: '完成10个核心技能学习'
    },
    {
      id: 2,
      title: '实战项目训练',
      desc: '通过实战项目巩固所学知识',
      progress: 20,
      status: 'pending',
      statusText: '待开始',
      deadline: '2026-09-15',
      goal: '完成3个完整项目'
    }
  ]
})

// AI聊天相关变量
const AI_HISTORY_KEY = 'ai-chat-history'
const AI_CONVERSATION_KEY = 'ai-conversation-id'
const AI_USER_KEY = 'ai-user-id'
const AI_HISTORY_MAX = 100

const DEFAULT_WELCOME_MESSAGE = { role: 'assistant', content: '', isStreaming: false }

const loadAIHistory = () => {
  try {
    const saved = localStorage.getItem(AI_HISTORY_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(m => m && m.role && !m.isStreaming)
      }
    }
  } catch (e) {
    console.warn('[AI] 历史记录加载失败:', e)
  }
  return null
}

const saveAIHistory = () => {
  try {
    const toSave = aiMessages.value
      .filter(m => !m.isStreaming)
      .map(m => ({ role: m.role, content: m.content, id: m.id }))
      .slice(-AI_HISTORY_MAX)
    localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('[AI] 历史记录保存失败:', e)
  }
}

const loadAIConversationId = () => {
  try {
    const saved = localStorage.getItem(AI_CONVERSATION_KEY)
    if (saved) return saved
  } catch (e) {}
  return ''
}

const saveAIConversationId = (id) => {
  if (id) {
    localStorage.setItem(AI_CONVERSATION_KEY, id)
    aiConversationId.value = id
  }
}

const loadAIUserId = () => {
  try {
    const saved = localStorage.getItem(AI_USER_KEY)
    if (saved) return saved
  } catch (e) {}
  const newId = 'user-' + Date.now()
  localStorage.setItem(AI_USER_KEY, newId)
  return newId
}

const aiMessages = ref([])
const aiMessageInput = ref('')
const aiLoading = ref(false)
const aiStreamStarted = ref(false)
const aiConversationId = ref('')
const aiUserId = ref('')
const aiChatMessagesRef = ref(null)
const isLocalFallbackMode = ref(false)
const cozeCreditExhausted = ref(false)
let msgIdCounter = 0

const clearAIHistory = () => {
  if (!confirm('确定要清除所有对话历史吗？这将删除与AI顾问的所有对话记录。')) return
  localStorage.removeItem(AI_HISTORY_KEY)
  localStorage.removeItem(AI_CONVERSATION_KEY)
  aiMessages.value = [{ ...DEFAULT_WELCOME_MESSAGE }]
  aiConversationId.value = ''
  msgIdCounter = 0
  console.log('[AI] 历史记录已清除')
}

const initAIHistory = () => {
  aiUserId.value = loadAIUserId()
  aiConversationId.value = loadAIConversationId()
  const history = loadAIHistory()
  if (history && history.length > 0) {
    aiMessages.value = history
    msgIdCounter = history.length
    console.log('[AI] 历史记录已加载，共', history.length, '条消息')
  } else {
    aiMessages.value = [{ ...DEFAULT_WELCOME_MESSAGE }]
  }
}

const aiSuggestions = [
  '如何系统学习前端开发？',
  'Vue和React哪个更适合新手？',
  '我想转行IT，需要学哪些技能？',
  '如何准备前端面试？',
  '推荐一些JavaScript进阶学习资源'
]

const useSuggestion = (text) => {
  aiMessageInput.value = text
  sendAIMessage()
}

const scrollChatToBottom = () => {
  if (aiChatMessagesRef.value) {
    aiChatMessagesRef.value.scrollTop = aiChatMessagesRef.value.scrollHeight
  }
}

const sendAIMessage = async () => {
  const message = aiMessageInput.value.trim()
  if (!message || aiLoading.value) return

  // 游客对话次数校验：达到3轮上限后锁定输入框，弹出登录提示
  if (isGuestMode.value && isGuestAIChatExhausted()) {
    showLoginModal('您当前为游客模式，对话次数已用完。注册登录后，可无限制使用AI学习顾问！')
    return
  }

  aiLoading.value = true
  aiStreamStarted.value = false
  aiMessageInput.value = ''

  // 游客发送消息后增加计数（一轮 = 用户发送一条消息算作一轮）
  if (isGuestMode.value) {
    incrementGuestAIChat()
  }

  msgIdCounter++
  aiMessages.value.push({
    id: 'user-' + msgIdCounter,
    role: 'user',
    content: message,
    isStreaming: false
  })

  const pendingAssistantIndex = aiMessages.value.length

  scrollChatToBottom()

  try {
    const historyForContext = aiMessages.value
      .filter(m => !m.isStreaming && m.content)
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }))

    const response = await authFetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        conversation_id: aiConversationId.value,
        user_id: aiUserId.value,
        history: historyForContext
      })
    })

    // 后端鉴权拦截：游客对话次数用完或游客调用受限接口，后端返回403
    if (response.status === 403) {
      const errData = await response.json().catch(() => ({}))
      // 移除已添加的用户消息（发送被后端拒绝）
      aiMessages.value.pop()
      if (errData.code === 'GUEST_FORBIDDEN' || errData.code === 'GUEST_AI_LIMIT_EXCEEDED') {
        showLoginModal('您当前为游客模式，对话次数已用完。注册登录后，可无限制使用AI学习顾问！')
      } else {
        showLoginModal(errData.message || '游客模式功能受限，请登录账号解锁完整功能')
      }
      return
    }

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.slice(5).trim()
          if (dataStr === '[DONE]') continue

          try {
            const data = JSON.parse(dataStr)
            handleAIResponse(data, pendingAssistantIndex)
          } catch (e) {
            // 非JSON格式
          }
        }
      }
    }

    // 确保最后一条消息停止流式
    if (aiMessages.value[pendingAssistantIndex]) {
      aiMessages.value[pendingAssistantIndex].isStreaming = false
    }
  } catch (error) {
    console.error('AI请求错误:', error)
    if (aiMessages.value[pendingAssistantIndex]) {
      aiMessages.value[pendingAssistantIndex].content = '抱歉，AI服务暂时不可用，请稍后重试。'
      aiMessages.value[pendingAssistantIndex].isStreaming = false
    } else {
      msgIdCounter++
      aiMessages.value.push({
        id: 'assistant-' + msgIdCounter,
        role: 'assistant',
        content: '抱歉，AI服务暂时不可用，请稍后重试。',
        isStreaming: false
      })
    }
  } finally {
    aiLoading.value = false
    aiStreamStarted.value = false
    saveAIHistory()
  }
}

const handleAIResponse = (data, msgIndex) => {
  switch (data.type) {
    case 'delta':
      if (data.content) {
        if (!aiMessages.value[msgIndex]) {
          msgIdCounter++
          aiMessages.value.splice(msgIndex, 0, {
            id: 'assistant-' + msgIdCounter,
            role: 'assistant',
            content: data.content,
            isStreaming: true
          })
        } else {
          aiMessages.value[msgIndex].content += data.content
        }
        aiStreamStarted.value = true
        scrollChatToBottom()
      }
      break

    case 'completed':
      if (data.mode === 'local_fallback') {
        isLocalFallbackMode.value = true
        if (data.cozeNote === 'coze_credit_exhausted') {
          cozeCreditExhausted.value = true
        }
      } else if (data.mode && data.mode !== 'local_fallback') {
        isLocalFallbackMode.value = false
        cozeCreditExhausted.value = false
      }
      if (data.content) {
        if (!aiMessages.value[msgIndex]) {
          msgIdCounter++
          aiMessages.value.splice(msgIndex, 0, {
            id: 'assistant-' + msgIdCounter,
            role: 'assistant',
            content: data.content,
            isStreaming: false
          })
        } else if (!aiMessages.value[msgIndex].content) {
          aiMessages.value[msgIndex].content = data.content
        }
        if (aiMessages.value[msgIndex]) {
          aiMessages.value[msgIndex].isStreaming = false
        }
      }
      break

    case 'conversation_id':
      if (data.conversation_id) {
        saveAIConversationId(data.conversation_id)
      }
      break

    case 'guest_limit':
      // 后端拦截：游客对话次数已用完，移除用户消息并弹出登录提示
      if (aiMessages.value.length > 0 && aiMessages.value[aiMessages.value.length - 1].role === 'user') {
        aiMessages.value.pop()
      }
      showLoginModal(data.message || '您当前为游客模式，对话次数已用完。注册登录后，可无限制使用AI学习顾问！')
      break

    case 'error':
      if (aiMessages.value[msgIndex]) {
        aiMessages.value[msgIndex].content += '\n\n⚠️ ' + (data.message || '未知错误')
        aiMessages.value[msgIndex].isStreaming = false
      } else {
        msgIdCounter++
        aiMessages.value.splice(msgIndex, 0, {
          id: 'assistant-' + msgIdCounter,
          role: 'assistant',
          content: '⚠️ ' + (data.message || '未知错误'),
          isStreaming: false
        })
      }
      break

    case 'done':
      if (aiMessages.value[msgIndex]) {
        aiMessages.value[msgIndex].isStreaming = false
      }
      break
  }
}

// 折叠面板状态：key为卡片id/索引，value为是否展开
const expandedCards = ref({})

const toggleCardExpand = (key) => {
  expandedCards.value = {
    ...expandedCards.value,
    [key]: !expandedCards.value[key]
  }
}

const levelLabels = {
  must: '必备',
  prefer: '优先',
  bonus: '加分'
}

const positionGroups = [
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

const positionSkillMap = {
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
      { name: '异步编程(异步io)', level: 'must' },
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

const navItems = [
  { key: 'dashboard', label: '个人学习数据分析', icon: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>' },
  { key: 'skill-route', label: '行业技能路线', icon: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zm0 13L2 10v5l10 5 10-5v-5l-10 5z" fill="currentColor"/></svg>' },
  { key: 'study-plan', label: '我的学习计划', icon: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/></svg>' },
  { key: 'resource-lib', label: '推荐资源库', icon: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z" fill="currentColor"/></svg>' },
  { key: 'ai-assistant', label: 'AI学习顾问', icon: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>' }
]

const defaultResourceCards = [
  {
    id: 'empty',
    title: '选择岗位以获取智能推荐',
    desc: '请先选择你的目标就业岗位，系统将基于JD技能要求自动匹配并推送学习资源',
    typeLabel: '系统通知',
    difficulty: '-',
    durationText: '-',
    provider: '智能推送引擎',
    matchedSkills: [],
    url: '',
    externalUrl: '',
    practicePlan: [],
    recommendedTools: [],
    featured: false
  }
]

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 8) return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  const days = Math.floor(hours / 8)
  return mins > 0 ? `${days}天${hours % 8}小时` : `${days}天`
}

// 获取相关性等级（用于UI样式）
const getRelevanceLevel = (score) => {
  if (score >= 70) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

const onPositionChange = async () => {
  const key = selectedPosition.value
  if (!key) {
    resourceMap.value = {}
    localStorage.removeItem('selectedPosition')
    return
  }
  localStorage.setItem('selectedPosition', key)
  loadingResources.value = true
  try {
    const userProgress = parseInt(localStorage.getItem('learningProgress_' + key) || '0', 10)
    const matched = findMatchingResources(key, userProgress)
    const grouped = {}
    if (matched && matched.length > 0) {
      const skills = currentSkills.value.length > 0
        ? currentSkills.value.map(s => s.name)
        : (positionSkillMap[key] ? Object.values(positionSkillMap[key]).flat().map(s => s.name) : [])
      skills.forEach(skillName => {
        const related = matched.filter(m =>
          m.matchedSkills && m.matchedSkills.some(ms => ms.name === skillName)
        )
        if (related.length > 0) {
          grouped[skillName] = { resources: related, source: 'local' }
        }
      })
      if (Object.keys(grouped).length === 0) {
        grouped['综合推荐'] = { resources: matched, source: 'local' }
      }
    }
    resourceMap.value = grouped
  } catch (e) {
    console.error('[Planning] 本地资源匹配失败:', e)
    resourceMap.value = {}
  } finally {
    loadingResources.value = false
  }
}

const fetchResources = async (positionKey) => {
  const key = positionKey || selectedPosition.value
  if (!key) {
    resourceMap.value = {}
    return
  }
  loadingResources.value = true
  try {
    const userProgress = parseInt(localStorage.getItem('learningProgress_' + key) || '0', 10)
    const matched = findMatchingResources(key, userProgress)
    const grouped = {}
    if (matched && matched.length > 0) {
      const skillData = positionSkillMap[key]
      const skills = []
      if (skillData) {
        for (const [, list] of Object.entries(skillData)) {
          for (const s of list) {
            skills.push(s.name)
          }
        }
      }
      skills.forEach(skillName => {
        const related = matched.filter(m =>
          m.matchedSkills && m.matchedSkills.some(ms => ms.name === skillName)
        )
        if (related.length > 0) {
          grouped[skillName] = { resources: related, source: 'local' }
        }
      })
      if (Object.keys(grouped).length === 0) {
        grouped['综合推荐'] = { resources: matched, source: 'local' }
      }
    }
    resourceMap.value = grouped
  } catch (e) {
    console.error('[Planning] 本地资源匹配失败:', e)
    resourceMap.value = {}
  } finally {
    loadingResources.value = false
  }
}

const resourceCards = computed(() => {
  if (!selectedPosition.value) {
    return defaultResourceCards
  }
  if (loadingResources.value) {
    return []
  }
  const cards = []
  const guestLimit = GUEST_LIMITS.MAX_RESOURCES_PER_SKILL
  const shouldTruncate = isGuestMode.value
  for (const [skillName, skillData] of Object.entries(resourceMap.value)) {
    let resources = skillData.resources || []
    // 游客模式：每个技能最多展示 guestLimit 条资源
    // （后端 /api/resources/match-position 亦有截断兜底，此处前端截断为纯本地资源库场景）
    if (shouldTruncate && resources.length > guestLimit) {
      resources = resources.slice(0, guestLimit)
    }
    for (const res of resources) {
      cards.push({
        id: res.id,
        title: res.title,
        desc: res.description || res.desc || '',
        typeLabel: typeLabels[res.type] || res.type || '学习资源',
        difficulty: res.difficulty || res.level || '入门',
        durationText: formatDuration(res.duration || 0),
        provider: res.provider || res.sourceName || '',
        matchedSkills: res.matchedSkills ? res.matchedSkills.slice(0, 4) : [{ name: skillName }],
        rating: res.rating || 0,
        students: res.students || 0,
        url: res.url || res.externalUrl || '',
        externalUrl: res.externalUrl || res.url || '',
        practicePlan: res.practicePlan || [],
        recommendedTools: res.recommendedTools || [],
        featured: cards.length === 0,
        relevanceScore: res.relevanceScore || 0,
        isHighlyRelevant: res.isHighlyRelevant || false
      })
    }
  }
  if (cards.length === 0) {
    const userProgress = parseInt(localStorage.getItem('learningProgress_' + selectedPosition.value) || '0', 10)
    const matched = findMatchingResources(selectedPosition.value, userProgress)
    if (matched && matched.length > 0) {
      let displayMatched = matched
      // 游客模式兜底场景：限制综合推荐展示数量（不按技能分组，取配额×3为合理上限）
      if (shouldTruncate && displayMatched.length > guestLimit * 3) {
        displayMatched = displayMatched.slice(0, guestLimit * 3)
      }
      return displayMatched.map((item, idx) => ({
        id: item.id,
        title: item.title,
        desc: item.description,
        typeLabel: typeLabels[item.type] || item.type,
        difficulty: item.difficulty,
        durationText: formatDuration(item.duration),
        provider: item.provider,
        matchedSkills: item.matchedSkills.slice(0, 4),
        rating: item.rating,
        students: item.students,
        url: item.url || item.externalUrl,
        externalUrl: item.externalUrl,
        practicePlan: item.practicePlan || [],
        recommendedTools: item.recommendedTools || [],
        featured: idx === 0,
        relevanceScore: item.relevanceScore || 0,
        isHighlyRelevant: item.isHighlyRelevant || false
      }))
    }
    return defaultResourceCards
  }
  return cards
})

const currentSkills = computed(() => {
  if (!selectedPosition.value) return []
  const skillData = positionSkillMap[selectedPosition.value]
  if (!skillData) return []
  const allSkills = []
  for (const [, skills] of Object.entries(skillData)) {
    allSkills.push(...skills)
  }
  return allSkills
})

const categorizedSkills = computed(() => {
  if (!selectedPosition.value) return []
  const skillData = positionSkillMap[selectedPosition.value]
  if (!skillData) return []
  return Object.entries(skillData).map(([name, skills]) => ({
    name,
    skills
  }))
})

const selectedPositionLabel = computed(() => {
  if (!selectedPosition.value) return '未选择'
  for (const group of positionGroups) {
    const pos = group.positions.find(p => p.key === selectedPosition.value)
    if (pos) return pos.label
  }
  return '未选择'
})

const goBack = () => {
  router.push('/dashboard')
}

const handleNavClick = (key) => {
  currentNav.value = key
}

const openResource = (card) => {
  // 优先使用url字段（资源页面直达链接），fallback到externalUrl
  const targetUrl = card.url || card.externalUrl
  if (!targetUrl) return
  // 预留接口：后续可对接后端记录学习行为
  // TODO: POST /api/user/learning-record { resourceId, positionKey }
  window.open(targetUrl, '_blank', 'noopener')
}

watch(selectedPosition, (val) => {
  if (val) {
    localStorage.setItem('selectedPosition', val)
  }
})

const drawBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []
  const particleCount = 80
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    })
  }

  const animate = () => {
    ctx.fillStyle = 'rgba(10, 15, 25, 0.1)'
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
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(74, 158, 255, ${0.15 * (1 - dist / 120)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })
    })

    requestAnimationFrame(animate)
  }
  animate()
}

let animFrame = null

onMounted(async () => {
  initAIHistory()
  // 游客模式：页面加载/刷新时重置权限状态
  // refreshAuthState 会重新生成 guestSessionId（后端计数自动清零）并重置前端计数
  // 符合需求第5条："刷新页面、重新打开对话面板，对话次数重置为0"
  // 符合需求第9条："游客会话无持久化，刷新页面后所有临时计数重置"
  if (isGuestMode.value) {
    refreshAuthState()
  }
  const saved = localStorage.getItem('selectedPosition')
  if (saved) {
    selectedPosition.value = saved
    await fetchResources(saved)
  }
  drawBackground()
  window.addEventListener('resize', () => {
    const canvas = bgCanvas.value
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  })
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
.planning-page {
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
  border-color: rgba(74, 158, 255, 0.5);
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
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
  grid-template-columns: 200px 1fr 280px;
  gap: 20px;
  padding: 25px;
  max-width: 1600px;
  margin: 0 auto;
  transition: grid-template-columns 0.3s ease;
}

.main-layout.ai-mode {
  grid-template-columns: 200px 1fr;
  max-width: none;
  width: 100%;
}

.main-layout.no-ai-sidebar {
  grid-template-columns: 200px 1fr;
}

.sidebar {
  background: rgba(17, 27, 46, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 18px;
  height: fit-content;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 0.7rem;
  color: rgba(74, 158, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 10px 10px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
  margin-bottom: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.nav-item:hover {
  background: rgba(74, 158, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.2), rgba(74, 158, 255, 0.05));
  color: #4a9eff;
  border-left: 3px solid #4a9eff;
}

.nav-icon {
  display: flex;
  align-items: center;
  color: currentColor;
}

.content-area {
  background: rgba(17, 27, 46, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 25px;
  min-height: calc(100vh - 140px);
  min-width: 0;
}

.content-header {
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
}

.content-header > div:first-child {
  flex: 1;
}

.content-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px;
}

.content-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.ai-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.ai-memory-hint {
  font-size: 0.8rem;
  color: rgba(74, 158, 255, 0.8);
  background: rgba(74, 158, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.2);
}

.ai-clear-btn {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 82, 82, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 82, 82, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.ai-clear-btn:hover {
  color: #fff;
  background: rgba(255, 82, 82, 0.2);
  border-color: rgba(255, 82, 82, 0.4);
}

.ai-offline-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  margin: 12px 0;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 10px;
  color: #fbbf24;
  font-size: 0.85rem;
  animation: fadeInDown 0.3s ease-out;
}

.ai-offline-banner .offline-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.ai-offline-banner span:last-of-type {
  flex: 1;
  color: rgba(255, 255, 255, 0.85);
}

.ai-offline-banner .offline-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0 4px;
  transition: color 0.2s;
}

.ai-offline-banner .offline-close:hover {
  color: #fff;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.job-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(0, 212, 170, 0.05));
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  margin-bottom: 20px;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
}

.label-icon {
  font-size: 1.1rem;
}

.selector-wrapper {
  position: relative;
  flex: 1;
  max-width: 420px;
}

.position-select {
  width: 100%;
  padding: 10px 38px 10px 14px;
  background: rgba(10, 15, 25, 0.8);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.88rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.3s;
}

.position-select:focus {
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.15);
}

.position-select option,
.position-select optgroup {
  background: #0d1525;
  color: #fff;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(74, 158, 255, 0.6);
  font-size: 0.7rem;
  pointer-events: none;
}

.top-section,
.bottom-section {
  margin-bottom: 25px;
}

.section-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.section-block-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
}

.block-icon {
  font-size: 1.2rem;
}

.block-divider {
  width: 1px;
  height: 16px;
  background: rgba(74, 158, 255, 0.3);
  margin: 0 4px;
}

.block-subtitle {
  font-size: 0.8rem;
  font-weight: 400;
  color: rgba(74, 158, 255, 0.7);
}

.section-block-deco {
  height: 2px;
  flex: 1;
  margin-left: 20px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.3), transparent);
  max-width: 200px;
}

.top-section {
  padding: 18px;
  background: rgba(10, 15, 25, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 10px;
}

.bottom-section {
  padding: 18px;
  background: rgba(10, 15, 25, 0.3);
  border: 1px solid rgba(0, 212, 170, 0.1);
  border-radius: 10px;
}

.card-collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px;
  background: rgba(74, 158, 255, 0.08);
  border: 1px dashed rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.78rem;
  color: rgba(74, 158, 255, 0.8);
  transition: all 0.25s;
  user-select: none;
}

.card-collapse-toggle:hover {
  background: rgba(74, 158, 255, 0.15);
  color: #fff;
  border-color: rgba(74, 158, 255, 0.5);
}

.toggle-icon {
  display: inline-block;
  font-size: 0.65rem;
  transition: transform 0.3s;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.card-collapse-panel {
  margin-top: 12px;
  padding: 14px;
  background: rgba(10, 15, 25, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.collapse-section {
  margin-bottom: 14px;
}

.collapse-section:last-child {
  margin-bottom: 0;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a9eff;
  margin: 0 0 10px;
}

.collapse-icon {
  font-size: 0.95rem;
}

.practice-list,
.tools-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.practice-list {
  counter-reset: practiceCounter;
}

.practice-list li {
  counter-increment: practiceCounter;
  position: relative;
  padding: 8px 12px 8px 32px;
  margin-bottom: 6px;
  background: rgba(74, 158, 255, 0.06);
  border-left: 2px solid rgba(74, 158, 255, 0.4);
  border-radius: 6px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.practice-list li::before {
  content: counter(practiceCounter);
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
}

.tools-list li {
  padding: 6px 12px;
  margin-bottom: 5px;
  background: rgba(0, 212, 170, 0.08);
  border-left: 2px solid rgba(0, 212, 170, 0.4);
  border-radius: 6px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.tools-list li:last-child {
  margin-bottom: 0;
}

.skill-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.skill-category {
  background: rgba(30, 45, 70, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  padding: 14px;
}

.category-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #4a9eff;
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 14px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s;
}

.skill-tag:hover {
  background: rgba(74, 158, 255, 0.2);
  transform: translateY(-1px);
}

.skill-tag.level-must {
  background: rgba(255, 99, 99, 0.12);
  border-color: rgba(255, 99, 99, 0.3);
  color: #ff8a8a;
}

.skill-tag.level-prefer {
  background: rgba(74, 158, 255, 0.12);
  border-color: rgba(74, 158, 255, 0.3);
  color: #7ab8ff;
}

.skill-tag.level-bonus {
  background: rgba(0, 212, 170, 0.12);
  border-color: rgba(0, 212, 170, 0.3);
  color: #5eead4;
}

.level-badge {
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.15);
}

.skill-tag.level-must .level-badge {
  background: rgba(255, 99, 99, 0.3);
}

.skill-tag.level-prefer .level-badge {
  background: rgba(74, 158, 255, 0.3);
}

.skill-tag.level-bonus .level-badge {
  background: rgba(0, 212, 170, 0.3);
}

.card-badge.must {
  background: rgba(255, 99, 99, 0.15);
  border-color: rgba(255, 99, 99, 0.4);
  color: #ff8a8a;
}

.card-badge.prefer {
  background: rgba(74, 158, 255, 0.15);
  border-color: rgba(74, 158, 255, 0.4);
  color: #7ab8ff;
}

.card-badge.bonus {
  background: rgba(0, 212, 170, 0.15);
  border-color: rgba(0, 212, 170, 0.4);
  color: #5eead4;
}

.card-badge.pending {
  background: rgba(255, 170, 74, 0.15);
  border-color: rgba(255, 170, 74, 0.3);
  color: #ffaa4a;
}

.resource-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.resource-card {
  background: linear-gradient(145deg, rgba(30, 45, 70, 0.8), rgba(20, 30, 50, 0.8));
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 18px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.resource-card.featured {
  border-color: rgba(0, 212, 170, 0.4);
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.1);
}

.resource-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00d4aa, #4a9eff);
}

.resource-card:hover {
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(74, 158, 255, 0.15);
}

.card-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 14px;
  padding: 10px 18px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.15), rgba(0, 212, 170, 0.15));
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 20px;
  color: #4a9eff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.card-action-btn:hover {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.3));
  border-color: rgba(74, 158, 255, 0.7);
  color: #fff;
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.push-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: linear-gradient(90deg, rgba(255, 140, 66, 0.2), rgba(255, 99, 99, 0.2));
  border: 1px solid rgba(255, 140, 66, 0.4);
  border-radius: 10px;
  font-size: 0.65rem;
  color: #ff8c42;
  font-weight: 600;
}

.push-icon {
  font-size: 0.7rem;
}

.card-type {
  padding: 3px 8px;
  background: rgba(74, 158, 255, 0.12);
  border-radius: 8px;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  color: #ffd700;
}

.rating-star {
  font-size: 0.85rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.card-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 10px;
  line-height: 1.5;
}

.card-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 8px;
  border-left: 2px solid rgba(74, 158, 255, 0.3);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
}

.meta-icon {
  font-size: 0.8rem;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  padding-top: 10px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
  flex-wrap: wrap;
}

.relevance-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: auto;
}

.relevance-badge.level-high {
  background: rgba(0, 212, 170, 0.2);
  color: #00d4aa;
  border: 1px solid rgba(0, 212, 170, 0.4);
}

.relevance-badge.level-medium {
  background: rgba(255, 180, 71, 0.2);
  color: #ffb447;
  border: 1px solid rgba(255, 180, 71, 0.4);
}

.relevance-badge.level-low {
  background: rgba(255, 99, 132, 0.2);
  color: #ff6384;
  border: 1px solid rgba(255, 99, 132, 0.4);
}

.relevance-icon {
  font-size: 0.75rem;
}

.quality-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.3), rgba(0, 180, 216, 0.3));
  color: #00d4aa;
  border: 1px solid rgba(0, 212, 170, 0.5);
}

.quality-icon {
  font-size: 0.7rem;
}

.time-label {
  display: inline-flex;
  align-items: center;
}

.level-label {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 500;
}

.level-label.level-入门 {
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
}

.level-label.level-基础 {
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
}

.level-label.level-进阶 {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.level-label.level-高级 {
  background: rgba(255, 99, 99, 0.15);
  color: #ff6363;
}

.source-label {
  margin-left: auto;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
}

.action-area {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}

.action-btn {
  padding: 12px 40px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(74, 158, 255, 0.4);
}

.rules-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.rules-column {
  background: rgba(30, 45, 70, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.1);
  border-radius: 10px;
  padding: 16px;
}

.rules-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a9eff;
  margin: 0 0 12px;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
}

.rule-icon {
  font-size: 0.9rem;
}

.ai-sidebar {
  background: rgba(17, 27, 46, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 18px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.ai-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.3));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.ai-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 10px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.ai-message.highlight {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(0, 212, 170, 0.1));
  border: 1px solid rgba(74, 158, 255, 0.3);
}

.msg-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.ai-input-area {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.ai-input-area input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(10, 15, 25, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.3s;
}

.ai-input-area input:focus {
  border-color: rgba(74, 158, 255, 0.5);
}

.ai-input-area input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.ai-send-btn {
  padding: 10px 20px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.ai-send-btn:hover {
  transform: scale(1.05);
}

/* 新视图样式 */
.view-section {
  min-height: 100%;
}

/* 数据统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(74, 158, 255, 0.2);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.blue { background: linear-gradient(135deg, #4a9eff, #00d4aa); }
.stat-icon.green { background: linear-gradient(135deg, #00d4aa, #00b894); }
.stat-icon.orange { background: linear-gradient(135deg, #ffb447, #ff8c42); }
.stat-icon.purple { background: linear-gradient(135deg, #a855f7, #7c3aed); }

.stat-content h3 {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 5px;
  font-weight: 400;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

/* 技能进度列表 */
.chart-section {
  background: rgba(17, 27, 46, 0.4);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid rgba(74, 158, 255, 0.1);
}

.chart-title {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 20px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px 15px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-name {
  color: #fff;
  font-size: 0.9rem;
}

.progress-percent {
  color: #4a9eff;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* 路线占位符 */
.route-placeholder {
  text-align: center;
  padding: 60px 20px;
  background: rgba(74, 158, 255, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(74, 158, 255, 0.3);
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.route-placeholder h3 {
  color: #fff;
  font-size: 1.3rem;
  margin: 0 0 10px;
}

.route-placeholder p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  margin: 0 0 25px;
}

/* 学习计划 */
.plan-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.plan-item {
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plan-header h4 {
  color: #fff;
  font-size: 1.05rem;
  margin: 0;
}

.plan-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.plan-status.ongoing {
  background: rgba(0, 212, 170, 0.2);
  color: #00d4aa;
}

.plan-status.pending {
  background: rgba(255, 180, 71, 0.2);
  color: #ffb447;
}

.plan-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0 0 15px;
}

.plan-progress {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.plan-progress .progress-bar {
  flex: 1;
}

.progress-text {
  color: #4a9eff;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 45px;
}

.plan-meta {
  display: flex;
  gap: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(74, 158, 255, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(74, 158, 255, 0.3);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #fff;
  font-size: 1.3rem;
  margin: 0 0 10px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  margin: 0 0 25px;
}

/* AI学习顾问视图 */
.ai-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  min-width: 0;
}

.ai-chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(17, 27, 46, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.1);
  overflow: hidden;
  width: 100%;
}

.ai-chat-messages {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-chat-message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.ai-chat-message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-chat-message.assistant {
  align-self: flex-start;
}

.ai-chat-message.assistant.streaming {
  opacity: 0.95;
}

.message-avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 50%;
}

.ai-chat-message.user .message-avatar {
  background: rgba(0, 212, 170, 0.15);
}

.message-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.6;
  background: rgba(74, 158, 255, 0.08);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.ai-chat-message.user .message-content {
  background: rgba(0, 212, 170, 0.08);
  border-color: rgba(0, 212, 170, 0.2);
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  display: inline-block;
  animation: blink 1s infinite;
  margin-left: 2px;
  color: #4a9eff;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.ai-welcome {
  color: rgba(255, 255, 255, 0.9);
}

.ai-welcome p {
  margin: 0 0 10px;
}

.ai-welcome ul {
  margin: 0 0 15px;
  padding-left: 20px;
}

.ai-welcome li {
  margin-bottom: 5px;
}

.ai-suggestion-title {
  margin-top: 15px !important;
  color: rgba(74, 158, 255, 0.8);
  font-weight: 500;
}

.ai-suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ai-suggestions li {
  padding: 10px 14px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.ai-suggestions li:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.3);
  transform: translateX(4px);
}

.ai-chat-input {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: rgba(17, 27, 46, 0.6);
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.ai-chat-input input {
  flex: 1;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
}

.ai-chat-input input:focus {
  border-color: rgba(74, 158, 255, 0.5);
}

.ai-chat-input input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.ai-chat-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-chat-input .ai-send-btn {
  padding: 10px 25px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.ai-chat-input .ai-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
}

.ai-chat-input .ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-chat-input.locked {
  background: rgba(17, 27, 46, 0.8);
}

/* 加载气泡样式 */
.loading-bubble {
  max-width: 200px;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  white-space: nowrap;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: #4a9eff;
  border-radius: 50%;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.loading-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 180px 1fr 240px;
  }
  .main-layout.ai-mode {
    grid-template-columns: 180px 1fr;
  }
  .main-layout.no-ai-sidebar {
    grid-template-columns: 180px 1fr;
  }
  .resource-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .main-layout,
  .main-layout.ai-mode,
  .main-layout.no-ai-sidebar {
    grid-template-columns: 1fr;
  }
  .resource-cards {
    grid-template-columns: 1fr;
  }
  .rules-section {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 资源匹配加载提示横幅（岗位切换时显示，区域锁定防止重复请求） */
.resource-loading-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 24px;
  margin: 12px 0;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  color: #a5b4fc;
  font-size: 14px;
  letter-spacing: 0.5px;
}
.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(165, 180, 252, 0.3);
  border-top-color: #a5b4fc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== 游客模式UI样式（统一使用系统现有蓝/青配色，保持风格一致） ========== */

/* 游客AI对话剩余次数提示 */
.ai-guest-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.12), rgba(0, 212, 170, 0.08));
  border-top: 1px solid rgba(74, 158, 255, 0.2);
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
  color: rgba(165, 180, 252, 0.9);
  font-size: 0.82rem;
  letter-spacing: 0.3px;
}

.ai-guest-hint .guest-hint-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.ai-guest-hint strong {
  color: #4a9eff;
  font-weight: 700;
  font-size: 0.95rem;
}

/* 游客AI对话次数用完提示（警示色） */
.ai-guest-hint.exhausted {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.ai-guest-hint.exhausted .guest-hint-icon {
  color: #fbbf24;
}

/* 游客资源截断提示（可点击，引导登录） */
.resource-truncate-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
  padding: 14px 20px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.1), rgba(0, 212, 170, 0.1));
  border: 1px dashed rgba(74, 158, 255, 0.4);
  border-radius: 10px;
  color: rgba(165, 180, 252, 0.9);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.resource-truncate-hint:hover {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.2), rgba(0, 212, 170, 0.15));
  border-color: rgba(74, 158, 255, 0.6);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(74, 158, 255, 0.2);
}

.resource-truncate-hint .truncate-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.resource-truncate-hint .truncate-arrow {
  color: #4a9eff;
  font-weight: 700;
  transition: transform 0.3s;
}

.resource-truncate-hint:hover .truncate-arrow {
  transform: translateX(4px);
}
</style>
