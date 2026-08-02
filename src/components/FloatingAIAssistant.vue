<template>
  <div 
    class="ai-assistant-container"
    :style="assistantStyle"
    :class="{
      'is-peek': !isHovered && !isExpanded,
      'is-dragging': isDragging,
      'is-expanded': isExpanded,
      'is-half-hidden': isHalfHidden
    }"
    :data-edge="currentEdge"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <!-- 悬浮按钮 -->
    <transition name="fade">
      <div 
        v-if="!isExpanded" 
        class="ai-float-btn" 
        :class="{ hover: isHovered, dragging: isDragging }"
        @mousedown="onDragStart"
        @touchstart="onDragStart">
        <!-- 拖拽提示 -->
        <div class="drag-handle" v-if="isHovered && !isDragging">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
            <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
            <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
          </svg>
        </div>
        
        <!-- 侧边提示条 - peek状态显示 -->
        <div class="peek-indicator" v-if="!isExpanded"></div>
        
        <!-- 外环光晕 -->
        <div class="avatar-glow-ring"></div>
        
        <!-- 主体头像 -->
        <div class="avatar-body">
          <svg class="avatar-simple" viewBox="0 0 48 48">
            <defs>
              <linearGradient id="simpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#5ba8ff"/>
                <stop offset="100%" style="stop-color:#9a75ff"/>
              </linearGradient>
            </defs>
            <!-- 机器人图标简化版 -->
            <rect x="12" y="8" width="24" height="28" rx="6" fill="none" stroke="url(#simpleGrad)" stroke-width="2.2"/>
            <circle cx="18" cy="20" r="2.5" fill="#5ba8ff"/>
            <circle cx="30" cy="20" r="2.5" fill="#5ba8ff"/>
            <path d="M18 27 Q24 31 30 27" fill="none" stroke="url(#simpleGrad)" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="24" y1="4" x2="24" y2="8" stroke="url(#simpleGrad)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="24" cy="3" r="1.5" fill="#5ba8ff"/>
            <line x1="8" y1="20" x2="12" y2="20" stroke="url(#simpleGrad)" stroke-width="2" stroke-linecap="round"/>
            <line x1="36" y1="20" x2="40" y2="20" stroke="url(#simpleGrad)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        
        <!-- 呼吸光 -->
        <div class="breath-light"></div>
        
        <!-- 标签文字 -->
        <div class="assistant-label" v-if="isHovered && !isDragging">AI助手</div>
        
        <!-- 未读消息提示 -->
        <div v-if="unreadCount > 0" class="unread-badge">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </div>
      </div>
    </transition>

    <!-- 对话面板 -->
    <transition name="slide">
      <div v-if="isExpanded" class="ai-chat-panel" :style="chatPanelStyle">
        <!-- 面板头部 -->
        <div class="chat-header" :style="{ background: `linear-gradient(90deg, ${currentTheme.primary}14, ${currentTheme.secondary}0d)` }">
          <div class="header-left">
            <div class="persona-icon">{{ AI_CONFIG.icon }}</div>
            <div class="header-text">
              <h3>{{ AI_CONFIG.name }}</h3>
              <span class="status-dot" :style="{ background: currentTheme.accent }"></span>
              <span class="status-text">在线</span>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="clear-btn" 
              @click="clearChatHistory" 
              title="清空聊天记录"
              v-if="messages.length > 0">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button 
              class="pin-btn" 
              :class="{ active: isPinned }" 
              @click="isPinned = !isPinned" 
              :title="isPinned ? '取消固定' : '固定面板'"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v10m0 0l-4-4m4 4l4-4M5 22h14"/>
              </svg>
            </button>
            <button class="minimize-btn" @click="toggleExpand" title="收起">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 快捷提问 -->
        <div class="quick-questions" v-if="messages.length === 0">
          <div class="quick-title">您可以问我：</div>
          <div class="quick-tags">
            <button 
              v-for="(tag, idx) in quickQuestions" 
              :key="idx" 
              class="quick-tag"
              @click="sendQuickQuestion(tag)">
              <span class="tag-icon">{{ tag.icon }}</span>
              <span class="tag-text">{{ tag.text }}</span>
            </button>
          </div>
        </div>

        <!-- 聊天消息区 -->
        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="(msg, idx) in messages" 
            :key="idx" 
            class="message-item"
            :class="msg.role">
            <div v-if="msg.role === 'ai'" class="msg-avatar ai-avatar" :style="{ background: currentTheme.primary + '33', borderColor: currentTheme.primary }">
              <span class="avatar-emoji">{{ AI_CONFIG.icon }}</span>
            </div>
            <div class="msg-content">
              <div class="msg-bubble">
                <span v-if="msg.typing" class="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
                <span v-else>{{ msg.content }}</span>
              </div>
              <div v-if="msg.typing" class="msg-data-flow"></div>
            </div>
            <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="#8a64ff" stroke-width="1.5"/>
                <circle cx="12" cy="7" r="4" fill="none" stroke="#8a64ff" stroke-width="1.5"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <!-- 已选文件预览 -->
          <div class="file-preview-list" v-if="attachedFiles.length > 0">
            <div v-for="(file, idx) in attachedFiles" :key="idx" class="file-preview-item">
              <div class="file-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <button class="file-remove" @click="removeFile(idx)">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="input-wrapper">
            <button class="upload-btn" @click="triggerFileUpload" title="上传文件">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input
              v-model="inputText"
              type="text"
              class="chat-input"
              placeholder="输入您的问题..."
              @keyup.enter="handleSend"
              :disabled="isTyping"/>
            <button
              class="send-btn"
              :class="{ disabled: (!inputText.trim() && attachedFiles.length === 0) || isTyping }"
              @click="handleSend">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <input ref="fileInputRef" type="file" multiple @change="handleFileSelect" style="display:none" />
          <div class="input-hint">按 Enter 发送 · 点击📎上传文件</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const AI_CONFIG = {
  name: 'AI助手',
  icon: '🤖',
  welcome: '你好呀！我是AI求职助手 👋\n\n我可以帮你解答职业规划、简历优化、岗位推荐、行业趋势等问题。\n\n请选择下方快捷提问，或直接输入你的问题～\n\n对了，方便告诉我怎么称呼你吗？😊',
  theme: {
    primary: '#5ba8ff',
    secondary: '#9a75ff',
    accent: '#00d4aa',
    bgGradient: 'linear-gradient(180deg, rgba(22, 28, 48, 0.98) 0%, rgba(18, 24, 42, 0.98) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(91,168,255,0.08), rgba(154,117,255,0.05))',
    bubbleUser: 'linear-gradient(135deg, rgba(91,168,255,0.85), rgba(154,117,255,0.75))',
    bubbleAI: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(91,168,255,0.15)'
  }
}

const STORAGE_KEY = 'ai-chat-history'

const isExpanded = ref(false)
const isPinned = ref(false)
const isHovered = ref(false)
const isDragging = ref(false)
const inputText = ref('')
const messages = ref([])
const isTyping = ref(false)
const unreadCount = ref(0)
const chatMessages = ref(null)
const fileInputRef = ref(null)
const attachedFiles = ref([])
let autoCollapseTimer = null

const userName = ref('')

const userProfile = reactive({
  skills: [],
  targetPosition: '',
  targetCity: '',
  education: '',
  experience: '',
  salaryRange: '',
  careerGoal: '',
  lastTopic: '',
  conversationCount: 0,
  firstInteraction: Date.now()
})

const SKILL_KEYWORDS = ['Vue', 'React', 'Angular', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'Node.js', 'Spring', 'Django', 'Flask', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', '算法', 'AI', '机器学习', '深度学习', '大数据', '数据分析', '微服务', '云原生', '前端', '后端', '全栈', '移动端', '测试', '运维']
const CITY_KEYWORDS = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京', '西安', '重庆', '天津', '苏州', '长沙', '郑州', '青岛', '厦门', '福州', '合肥', '无锡', '大连']
const EDUCATION_KEYWORDS = ['大专', '本科', '硕士', '博士', '985', '211', '双一流']
const POSITION_KEYWORDS = ['前端', '后端', '全栈', '算法', 'AI', '测试', '运维', '数据', '产品', 'UI', '设计', '项目经理', '架构师', '工程师', '开发']
const SALARY_PATTERNS = [/(\d+)[Kk]/, /(\d+)[万]/, /月薪(\d+)/, /薪资(\d+)/]

const extractContext = (text) => {
  const changes = []
  
  const foundSkills = SKILL_KEYWORDS.filter(skill => text.toLowerCase().includes(skill.toLowerCase()))
  if (foundSkills.length > 0) {
    foundSkills.forEach(s => {
      if (!userProfile.skills.includes(s)) {
        userProfile.skills.push(s)
        changes.push(`技能: ${s}`)
      }
    })
  }
  
  const foundCity = CITY_KEYWORDS.find(city => text.includes(city))
  if (foundCity && foundCity !== userProfile.targetCity) {
    userProfile.targetCity = foundCity
    changes.push(`城市: ${foundCity}`)
  }
  
  const foundEducation = EDUCATION_KEYWORDS.find(edu => text.includes(edu))
  if (foundEducation && foundEducation !== userProfile.education) {
    userProfile.education = foundEducation
    changes.push(`学历: ${foundEducation}`)
  }
  
  const foundPosition = POSITION_KEYWORDS.find(pos => text.includes(pos))
  if (foundPosition && foundPosition !== userProfile.targetPosition) {
    userProfile.targetPosition = foundPosition
    changes.push(`目标岗位: ${foundPosition}`)
  }
  
  for (const pattern of SALARY_PATTERNS) {
    const m = text.match(pattern)
    if (m) {
      userProfile.salaryRange = m[0]
      changes.push(`期望薪资: ${m[0]}`)
      break
    }
  }
  
  if (text.includes('转行') || text.includes('转方向')) {
    userProfile.careerGoal = '转行'
    changes.push('目标: 转行')
  } else if (text.includes('实习') || text.includes('校招') || text.includes('应届')) {
    userProfile.careerGoal = '求职'
    changes.push('目标: 求职')
  } else if (text.includes('升职') || text.includes('跳槽')) {
    userProfile.careerGoal = '跳槽'
    changes.push('目标: 跳槽')
  }
  
  return changes
}

const getContextSummary = () => {
  const parts = []
  if (userProfile.skills.length > 0) parts.push(`技能[${userProfile.skills.join(',')}]`)
  if (userProfile.targetPosition) parts.push(`方向[${userProfile.targetPosition}]`)
  if (userProfile.targetCity) parts.push(`城市[${userProfile.targetCity}]`)
  if (userProfile.education) parts.push(`学历[${userProfile.education}]`)
  if (userProfile.salaryRange) parts.push(`薪资[${userProfile.salaryRange}]`)
  if (userProfile.careerGoal) parts.push(`目标[${userProfile.careerGoal}]`)
  return parts.length > 0 ? parts.join(' ') : ''
}

const getPersonalizedPrefix = () => {
  const parts = []
  if (userName.value) parts.push(`${userName.value}`)
  if (userProfile.targetPosition) parts.push(`关于${userProfile.targetPosition}方向`)
  if (userProfile.targetCity) parts.push(`${userProfile.targetCity}`)
  if (parts.length > 0) return `${parts.join('，')}，`
  return userName.value ? `${userName.value}，` : ''
}
const nameBlacklist = new Set([
  '吗', '呢', '啊', '吧', '呀', '哦', '嗯', '好', '是', '在', '想', '要', '会', '能',
  '去', '来', '说', '看', '问', '答', '给', '让', '把', '被', '跟', '对', '比',
  '从', '向', '往', '以', '为', '因', '由', '于', '或', '和', '与', '但', '而',
  '且', '则', '乃', '若', '虽', '你好', '您好', 'hi', 'hello', '嗨', '哈喽',
  '早上好', '下午好', '晚上好', '在吗', '在不在', '什么', '怎么', '如何',
  '为什么', '哪里', '哪个', '多少', '几', '我', '你', '他', '她', '它',
  '我们', '你们', '他们', '这个', '那个', '这些', '那些', '工作', '岗位',
  '简历', '面试', '薪资', '城市', '技能', '项目', '规划', '推荐', '适合',
  '匹配', '找', '做', '写', '改', '看', '学', '问', '答', '帮', '请',
  '可以', '能够', '想要', '需要', '知道', '了解', '告诉', '请问', '谢谢',
  '再见', '拜拜', 'yes', 'no', 'ok', '好的', '行', '可以', '嗯', '哦',
  '我想找工作', '我想', '我要', '我在', '我是', '我叫', '我的', '本人'
])
const actionVerbs = new Set('想要去来看问答说写做改学找帮给让把被跟对比从向往以'.split(''))
const extractName = (text) => {
  const patterns = [
    /我是([^\s，。！？,.!?]{1,8})/,
    /我叫([^\s，。！？,.!?]{1,8})/,
    /我名字(?:是|叫|为)([^\s，。！？,.!?]{1,8})/,
    /我的名字(?:是|叫|为)([^\s，。！？,.!?]{1,8})/,
    /我是叫([^\s，。！？,.!?]{1,8})/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m && m[1]) {
      const n = m[1].trim()
      if (n.length >= 1 && n.length <= 8 && !nameBlacklist.has(n.toLowerCase())) {
        return n
      }
    }
  }
  if (!userName.value) {
    const trimmed = text.trim()
    if (trimmed.length >= 2 && trimmed.length <= 6 && !nameBlacklist.has(trimmed.toLowerCase())) {
      if (/^[a-zA-Z]+$/.test(trimmed)) {
        return trimmed
      }
      if (/^[\u4e00-\u9fa5]+$/.test(trimmed) && trimmed.length <= 3) {
        let hasVerb = false
        for (const ch of trimmed) {
          if (actionVerbs.has(ch)) { hasVerb = true; break }
        }
        if (!hasVerb) return trimmed
      }
    }
  }
  return ''
}
const greetUser = () => {
  return userName.value ? `${userName.value}，您好！` : '您好！'
}

const currentTheme = AI_CONFIG.theme

const chatPanelStyle = computed(() => {
  return {
    position: 'fixed',
    left: panelPosition.value.x + 'px',
    top: panelPosition.value.y + 'px',
    zIndex: 9999,
    background: currentTheme.bgGradient,
    borderColor: currentTheme.borderColor,
    '--theme-primary': currentTheme.primary,
    '--theme-secondary': currentTheme.secondary,
    '--theme-accent': currentTheme.accent,
    '--theme-header-gradient': currentTheme.headerGradient,
    '--theme-bubble-user': currentTheme.bubbleUser,
    '--theme-bubble-ai': currentTheme.bubbleAI
  }
})

const loadMessagesFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedName = localStorage.getItem('ai-chat-username')
        if (savedName) userName.value = savedName
        return parsed
      }
    }
  } catch (e) {
    console.warn('[AI Assistant] Failed to load chat history:', e)
  }
  return []
}

const saveMessagesToStorage = () => {
  try {
    const dataToSave = messages.value.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || Date.now()
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    if (userName.value) {
      localStorage.setItem('ai-chat-username', userName.value)
    }
  } catch (e) {
    console.warn('[AI Assistant] Failed to save chat history:', e)
  }
}

const clearChatHistory = () => {
  localStorage.removeItem(STORAGE_KEY)
  messages.value = []
  userName.value = ''
}

const panelPosition = ref({ x: 0, y: 0 })

const position = ref({ x: 0, y: 0 })
const hasPosition = ref(false)
const currentEdge = ref('right')
const isHalfHidden = ref(false)
let halfHideTimer = null
const dragState = {
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  moved: false
}

const halfHiddenTransform = computed(() => {
  if (!isHalfHidden.value || isExpanded.value) return 'none'
  const half = 34
  switch (currentEdge.value) {
    case 'right': return `translateX(${half}px)`
    case 'left': return `translateX(-${half}px)`
    case 'top': return `translateY(-${half}px)`
    case 'bottom': return `translateY(${half}px)`
    default: return 'none'
  }
})

const BTN_SIZE = 68
const EDGE_MARGIN = 12

const assistantStyle = computed(() => {
  if (!hasPosition.value) return {}
  
  const style = {
    left: position.value.x + 'px',
    top: position.value.y + 'px',
    right: 'auto',
    bottom: 'auto',
    transform: isExpanded.value ? 'none' : halfHiddenTransform.value,
  }
  
  if (!isDragging.value) {
    style.transition = 'left 0.4s cubic-bezier(0.23, 1, 0.32, 1), top 0.4s cubic-bezier(0.23, 1, 0.32, 1), transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
  }
  
  return style
})

const currentPage = ref('')

const detectCurrentModule = () => {
  const path = window.location.pathname
  const result = { module: 'general', pageTitle: '', details: {} }
  
  if (path.includes('planning')) {
    result.module = 'planning'
    result.pageTitle = '学业规划'
  } else if (path.includes('resume') || path.includes('ai-resume')) {
    result.module = 'resume'
    result.pageTitle = 'AI简历优化'
  } else if (path.includes('statistics')) {
    result.module = 'statistics'
    result.pageTitle = '人才统计'
  } else if (path.includes('prediction')) {
    result.module = 'prediction'
    result.pageTitle = '行业供需预测'
  } else if (path.includes('recommend') || path.includes('job')) {
    result.module = 'recommend'
    result.pageTitle = '岗位推荐'
  } else if (path.includes('community')) {
    result.module = 'community'
    result.pageTitle = '社区交流'
  }
  
  try {
    // 检测页面标题
    const pageTitle = document.querySelector('.page-title, h1, .page-header h2')
    if (pageTitle) result.details.pageTitle = pageTitle.textContent.trim()
    
    // 检测当前筛选条件
    const activeTags = document.querySelectorAll('.tag.active, .filter-tag.active, .chip.selected, .tab.active')
    if (activeTags.length > 0) {
      result.details.activeFilters = Array.from(activeTags).map(t => t.textContent.trim())
    }
    
    // 检测搜索关键词
    const searchInput = document.querySelector('input[placeholder*="搜索"], input[placeholder*="search"]')
    if (searchInput && searchInput.value) result.details.searchQuery = searchInput.value
    
    // 检测岗位数量
    const jobCards = document.querySelectorAll('.job-card, .岗位-card, [class*="job"][class*="card"]')
    if (jobCards.length > 0) result.details.jobCount = jobCards.length
    
    // 检测统计数据
    const statCards = document.querySelectorAll('.stat-card, [class*="stat"][class*="card"], .data-card')
    if (statCards.length > 0) {
      const stats = []
      statCards.forEach(card => {
        const valueEl = card.querySelector('.stat-value, .data-value, [class*="value"]')
        const labelEl = card.querySelector('.stat-label, .data-label, [class*="label"]')
        if (valueEl && labelEl) {
          stats.push(`${labelEl.textContent.trim()}: ${valueEl.textContent.trim()}`)
        }
      })
      if (stats.length > 0) result.details.keyStats = stats.slice(0, 5)
    }
    
    // 检测城市选择
    const citySelect = document.querySelector('.city-select, select[class*="city"], [class*="city"][class*="select"]')
    if (citySelect && citySelect.value) result.details.selectedCity = citySelect.value
    
    // 检测技能标签
    const skillTags = document.querySelectorAll('.skill-tag, [class*="skill"][class*="tag"]')
    if (skillTags.length > 0) {
      result.details.detectedSkills = Array.from(skillTags).map(t => t.textContent.trim()).slice(0, 10)
    }
    
    // 检测薪资范围
    const salaryRange = document.querySelector('.salary-range, [class*="salary"][class*="range"]')
    if (salaryRange) result.details.salaryRange = salaryRange.textContent.trim()
    
    // 检测图表信息
    const charts = document.querySelectorAll('canvas, .chart-container, [class*="echarts"]')
    if (charts.length > 0) result.details.hasCharts = true
    
    // 检测表单状态（简历页面）
    if (result.module === 'resume') {
      const resumeInputs = document.querySelectorAll('input[type="text"], textarea')
      const filledFields = []
      resumeInputs.forEach(input => {
        if (input.value && input.value.length > 5) {
          const label = input.closest('.form-item, .form-group')?.querySelector('label')?.textContent.trim() || input.placeholder
          filledFields.push(label)
        }
      })
      if (filledFields.length > 0) result.details.resumeFilledFields = filledFields
    }
  } catch (e) {}
  
  return result
}

const currentModuleInfo = computed(() => detectCurrentModule())

const quickQuestions = computed(() => {
  const module = currentModuleInfo.value.module
  const details = currentModuleInfo.value.details || {}
  const profile = userProfile
  
  const baseQuestions = {
    general: [
      { icon: '💡', text: profile.targetPosition ? `如何规划${profile.targetPosition}职业发展？` : '帮我规划职业发展方向', module: 'planning' },
      { icon: '📝', text: profile.skills.length > 0 ? `如何优化${profile.skills[0]}相关简历？` : '如何优化我的简历？', module: 'resume' },
      { icon: '🎯', text: profile.targetPosition ? `推荐${profile.targetPosition}岗位` : '推荐适合我的岗位', module: 'recommend' }
    ],
    planning: [
      { icon: '🎯', text: profile.skills.length > 0 ? `如何用${profile.skills[0]}技能发展？` : '如何规划IT职业发展？', module: 'planning' },
      { icon: '📊', text: 'IT行业热门方向有哪些？', module: 'planning' },
      { icon: '💪', text: profile.careerGoal === '转行' ? '转行IT需要准备什么？' : '如何进入IT行业？', module: 'planning' }
    ],
    resume: [
      { icon: '✨', text: '如何让简历脱颖而出？', module: 'resume' },
      { icon: '📋', text: '项目经验怎么写？', module: 'resume' },
      { icon: '🔧', text: profile.skills.length > 0 ? `如何展示${profile.skills[0]}技能？` : '技能怎么展示？', module: 'resume' }
    ],
    statistics: [
      { icon: '📈', text: profile.targetCity ? `${profile.targetCity}薪资水平如何？` : '当前IT行业薪资水平如何？', module: 'statistics' },
      { icon: '🏙️', text: '哪些城市IT岗位需求大？', module: 'statistics' },
      { icon: '🎓', text: profile.education ? `${profile.education}学历就业情况如何？` : '各学历就业情况如何？', module: 'statistics' }
    ],
    prediction: [
      { icon: '📊', text: '未来IT行业发展趋势？', module: 'prediction' },
      { icon: '🔥', text: profile.skills.length > 0 ? `${profile.skills[0]}方向前景如何？` : '哪些技术方向最有前景？', module: 'prediction' },
      { icon: '📉', text: '供需变化对就业的影响？', module: 'prediction' }
    ],
    recommend: [
      { icon: '🎯', text: profile.targetPosition ? `推荐${profile.targetPosition}岗位` : '推荐适合我的岗位', module: 'recommend' },
      { icon: '💼', text: '如何提高投递成功率？', module: 'recommend' },
      { icon: '📍', text: profile.targetCity ? `${profile.targetCity}有哪些岗位？` : '哪些城市机会多？', module: 'recommend' }
    ],
    community: [
      { icon: '💬', text: '如何准备面试？', module: 'community' },
      { icon: '📝', text: '面试常见问题有哪些？', module: 'community' },
      { icon: '🎉', text: '如何谈薪资待遇？', module: 'community' }
    ]
  }
  
  const questions = [...(baseQuestions[module] || baseQuestions.general)]
  
  // 根据页面上下文动态添加推荐问题
  if (details.jobCount && details.jobCount > 0) {
    questions.push({ icon: '🔍', text: `当前${details.jobCount}个岗位，如何筛选？`, module: 'recommend' })
  }
  if (details.activeFilters && details.activeFilters.length > 0) {
    questions.push({ icon: '🎯', text: `关于「${details.activeFilters[0]}」的就业前景？`, module: 'prediction' })
  }
  if (details.keyStats && details.keyStats.length > 0) {
    questions.push({ icon: '📊', text: '这些数据说明什么趋势？', module: 'statistics' })
  }
  
  return questions.slice(0, 4)
})

let hoverDelayTimer = null

const startHalfHideTimer = () => {
  if (halfHideTimer) clearTimeout(halfHideTimer)
  halfHideTimer = setTimeout(() => {
    if (!isHovered.value && !isExpanded.value) {
      isHalfHidden.value = true
    }
  }, 5000)
}

const handleMouseEnter = () => {
  if (hoverDelayTimer) {
    clearTimeout(hoverDelayTimer)
    hoverDelayTimer = null
  }
  if (halfHideTimer) {
    clearTimeout(halfHideTimer)
    halfHideTimer = null
  }
  isHalfHidden.value = false
  isHovered.value = true

  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer)
    autoCollapseTimer = null
  }
}

const handleMouseLeave = () => {
  if (hoverDelayTimer) {
    clearTimeout(hoverDelayTimer)
  }

  if (isExpanded.value) {
    if (isPinned.value) {
      return
    }
    autoCollapseTimer = setTimeout(() => {
      isExpanded.value = false
      isPinned.value = false
      isHovered.value = false
      panelPosition.value = { x: 0, y: 0 }
      startHalfHideTimer()
    }, 10000)
    return
  }

  hoverDelayTimer = setTimeout(() => {
    isHovered.value = false
    hoverDelayTimer = null
    startHalfHideTimer()
  }, 250)
}

const constrainPosition = (x, y) => {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    x: Math.max(EDGE_MARGIN, Math.min(w - BTN_SIZE - EDGE_MARGIN, x)),
    y: Math.max(EDGE_MARGIN, Math.min(h - BTN_SIZE - EDGE_MARGIN, y))
  }
}

const getSnappedPosition = (x, y) => {
  const w = window.innerWidth
  const h = window.innerHeight

  const centerX = x + BTN_SIZE / 2
  const centerY = y + BTN_SIZE / 2

  const distTop = centerY
  const distBottom = h - centerY
  const distLeft = centerX
  const distRight = w - centerX

  const minDist = Math.min(distTop, distBottom, distLeft, distRight)

  if (minDist === distRight) {
    return { x: w - BTN_SIZE - EDGE_MARGIN, y: Math.max(EDGE_MARGIN, Math.min(h - BTN_SIZE - EDGE_MARGIN, y)), edge: 'right' }
  } else if (minDist === distLeft) {
    return { x: EDGE_MARGIN, y: Math.max(EDGE_MARGIN, Math.min(h - BTN_SIZE - EDGE_MARGIN, y)), edge: 'left' }
  } else if (minDist === distTop) {
    return { x: Math.max(EDGE_MARGIN, Math.min(w - BTN_SIZE - EDGE_MARGIN, x)), y: EDGE_MARGIN, edge: 'top' }
  } else {
    return { x: Math.max(EDGE_MARGIN, Math.min(w - BTN_SIZE - EDGE_MARGIN, x)), y: h - BTN_SIZE - EDGE_MARGIN, edge: 'bottom' }
  }
}

const initPosition = () => {
  const saved = localStorage.getItem('ai-assistant-position')
  if (saved) {
    try {
      const pos = JSON.parse(saved)
      const snapped = getSnappedPosition(pos.x, pos.y)
      position.value = snapped
      currentEdge.value = snapped.edge || 'right'
      hasPosition.value = true
      startHalfHideTimer()
      return
    } catch (e) {
      // Ignore corrupted storage
    }
  }
  const init = getSnappedPosition(window.innerWidth - 100, window.innerHeight - 120)
  position.value = init
  currentEdge.value = init.edge
  hasPosition.value = true
  startHalfHideTimer()
}

const onDragStart = (e) => {
  if (isExpanded.value) return
  if (halfHideTimer) {
    clearTimeout(halfHideTimer)
    halfHideTimer = null
  }
  isHalfHidden.value = false
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  dragState.startX = clientX
  dragState.startY = clientY
  dragState.offsetX = clientX - position.value.x
  dragState.offsetY = clientY - position.value.y
  dragState.dragging = true
  dragState.moved = false
  dragState.dragStartTime = Date.now()
  dragState.hasMovedSignificantly = false
  isDragging.value = true

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

const onDragMove = (e) => {
  if (!dragState.dragging) return
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  
  const dx = Math.abs(clientX - dragState.startX)
  const dy = Math.abs(clientY - dragState.startY)
  if (dx > 8 || dy > 8) {
    dragState.moved = true
    e.preventDefault()
  }
  if (dx > 15 || dy > 15) {
    dragState.hasMovedSignificantly = true
  }
  
  // 只有真正拖拽（超过阈值）才移动按钮，避免点击时微小移动导致按钮位移从而阻止click事件
  if (!dragState.moved) return
  
  const newX = clientX - dragState.offsetX
  const newY = clientY - dragState.offsetY
  const constrained = constrainPosition(newX, newY)
  position.value = { x: constrained.x, y: constrained.y }
}

let dragJustEnded = false

const onDragEnd = () => {
  const wasSignificantDrag = dragState.hasMovedSignificantly
  dragState.dragging = false
  isDragging.value = false

  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)

  if (wasSignificantDrag) {
    const snapped = getSnappedPosition(position.value.x, position.value.y)
    position.value = snapped
    currentEdge.value = snapped.edge
    localStorage.setItem('ai-assistant-position', JSON.stringify(snapped))
    startHalfHideTimer()
    // 拖拽后标记，阻止紧随的click事件
    dragJustEnded = true
    setTimeout(() => { dragJustEnded = false }, 50)
  } else {
    // 不是拖拽 = 点击，直接触发
    toggleExpand()
  }
  dragState.moved = false
  dragState.hasMovedSignificantly = false
}

const toggleExpand = () => {
  if (dragJustEnded) return
  
  if (!isExpanded.value) {
    isHalfHidden.value = false
  } else {
    isPinned.value = false
    panelPosition.value = { x: 0, y: 0 }
  }
  
  isExpanded.value = !isExpanded.value
  
  if (isExpanded.value) {
    unreadCount.value = 0
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer)
      autoCollapseTimer = null
    }
    if (messages.value.length === 0) {
      addAIMessage(AI_CONFIG.welcome)
    }
    nextTick(() => {
      adjustPanelPosition()
    })
  }
}

const adjustPanelPosition = () => {
  const container = document.querySelector('.ai-assistant-container')
  const panel = document.querySelector('.ai-chat-panel')
  if (!container || !panel) return
  
  const vw = window.innerWidth
  const vh = window.innerHeight
  const btnRect = container.getBoundingClientRect()
  
  const panelWidth = 380
  const panelHeight = 520
  
  let panelX = position.value.x
  let panelY = position.value.y
  let edge = currentEdge.value
  
  switch (edge) {
    case 'right':
      panelX = btnRect.left - panelWidth
      panelY = btnRect.top + BTN_SIZE / 2 - panelHeight / 2
      if (panelY < EDGE_MARGIN) panelY = EDGE_MARGIN
      if (panelY + panelHeight > vh - EDGE_MARGIN) panelY = vh - panelHeight - EDGE_MARGIN
      if (panelX < EDGE_MARGIN) edge = 'left'
      break
    case 'left':
      panelX = btnRect.right
      panelY = btnRect.top + BTN_SIZE / 2 - panelHeight / 2
      if (panelY < EDGE_MARGIN) panelY = EDGE_MARGIN
      if (panelY + panelHeight > vh - EDGE_MARGIN) panelY = vh - panelHeight - EDGE_MARGIN
      if (panelX + panelWidth > vw - EDGE_MARGIN) edge = 'right'
      break
    case 'top':
      panelX = btnRect.left + BTN_SIZE / 2 - panelWidth / 2
      panelY = btnRect.bottom
      if (panelX < EDGE_MARGIN) panelX = EDGE_MARGIN
      if (panelX + panelWidth > vw - EDGE_MARGIN) panelX = vw - panelWidth - EDGE_MARGIN
      if (panelY + panelHeight > vh - EDGE_MARGIN) edge = 'bottom'
      break
    case 'bottom':
      panelX = btnRect.left + BTN_SIZE / 2 - panelWidth / 2
      panelY = btnRect.top - panelHeight
      if (panelX < EDGE_MARGIN) panelX = EDGE_MARGIN
      if (panelX + panelWidth > vw - EDGE_MARGIN) panelX = vw - panelWidth - EDGE_MARGIN
      if (panelY < EDGE_MARGIN) edge = 'top'
      break
  }
  
  panelPosition.value = { x: panelX, y: panelY }
  currentEdge.value = edge
}

const sendQuickQuestion = async (tag) => {
  await sendMessage(tag.text, tag.module)
}

const addUserMessage = (content) => {
  messages.value.push({
    role: 'user',
    content,
    timestamp: Date.now()
  })
  scrollToBottom()
  saveMessagesToStorage()
}

const addAIMessage = (content, typing = false) => {
  messages.value.push({
    role: 'ai',
    content,
    typing,
    timestamp: Date.now()
  })
  scrollToBottom()
  if (!typing) saveMessagesToStorage()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

const sendMessage = async (text, module = '', files = []) => {
  const content = text.trim()
  if (!content && files.length === 0) return
  if (isTyping.value) return

  const detectedName = extractName(content)
  if (detectedName && !userName.value) {
    userName.value = detectedName
  }

  const contextChanges = extractContext(content)
  if (contextChanges.length > 0 && userProfile.conversationCount > 2) {
    const contextMsg = `（我注意到你的情况更新了：${contextChanges.join('，')}，我会根据这些信息为你提供更精准的建议！）`
    userProfile.conversationCount++
  }
  userProfile.conversationCount++
  
  const targetModule = module || currentModuleInfo.value.module
  const moduleInfo = currentModuleInfo.value
  
  if (userProfile.lastTopic && !content.includes('你好') && !content.includes('您好')) {
    const lastTopicMatch = content.includes('刚才') || content.includes('之前') || content.includes('上次')
    if (lastTopicMatch) {
      content.includes('')
    }
  }
  userProfile.lastTopic = content

  let displayContent = content
  if (files.length > 0) {
    const fileList = files.map(f => f.name).join('、')
    displayContent = content
      ? `${content}\n\n📎 附件：${fileList}`
      : `📎 附件：${fileList}`
  }
  addUserMessage(displayContent)

  isTyping.value = true
  addAIMessage('', true)

  const contextData = {
    userName: userName.value,
    userProfile: { ...userProfile },
    currentModule: targetModule,
    currentPage: moduleInfo.pageTitle,
    contextSummary: getContextSummary()
  }

  try {
    let response
    const validHistory = messages.value
      .filter(m => m && m.role && m.content)
      .slice(-5)
      .map(m => ({ role: m.role, content: m.content }))
      
    if (files.length > 0) {
      const formData = new FormData()
      formData.append('message', content)
      formData.append('module', targetModule)
      formData.append('history', JSON.stringify(validHistory))
      formData.append('context', JSON.stringify(contextData))
      files.forEach((file, idx) => {
        formData.append(`file_${idx}`, file)
      })
      formData.append('fileCount', files.length)
      formData.append('fileNames', JSON.stringify(files.map(f => ({ name: f.name, size: f.size, type: f.type }))))

      response = await axios.post('/api/ai-assistant/chat', formData, {
        timeout: 15000
      })
    } else {
      response = await axios.post('/api/ai-assistant/chat', {
        message: content,
        module: targetModule,
        history: validHistory,
        context: contextData
      }, {
        timeout: 10000
      })
    }

    const lastIdx = messages.value.length - 1
    if (response.data.success) {
      simulateTyping(response.data.data.reply || `${getPersonalizedPrefix()}我已收到你的问题，正在为你分析...`, lastIdx)
    } else {
      simulateTyping(`${getPersonalizedPrefix()}抱歉，我暂时无法回答你的问题，请稍后再试。`, lastIdx)
    }
  } catch (error) {
    if (error.code !== 'ERR_NETWORK') {
      console.warn('[AI Assistant] API unavailable, using fallback reply')
    }
    const reply = generateFallbackReply(content, targetModule, files)
    const lastIdx = messages.value.length - 1
    simulateTyping(reply, lastIdx)
  }
}

const generateFallbackReply = (userInput, module, files = []) => {
  const rawInput = userInput.trim()
  const input = rawInput.toLowerCase()
  if (!input) return '请输入您的问题，我会为您提供针对性的建议！'

  const detectedName = extractName(rawInput)
  if (detectedName && !userName.value) {
    userName.value = detectedName
  }
  
  const contextChanges = extractContext(rawInput)
  const name = userName.value
  const personalizedPrefix = getPersonalizedPrefix()
  const contextSummary = getContextSummary()
  
  // 获取当前页面上下文
  const pageContext = currentModuleInfo.value || { module: 'general', pageTitle: '', details: {} }
  const pageDetails = pageContext.details || {}
  
  // 分析对话历史，提取上下文
  const recentHistory = messages.value
    .filter(m => m && m.role === 'user' && m.content)
    .slice(-5)
    .map(m => m.content)
  const topicHistory = new Set()
  recentHistory.forEach(h => {
    if (!h) return
    if (h.includes('简历')) topicHistory.add('resume')
    if (h.includes('岗位') || h.includes('工作')) topicHistory.add('job')
    if (h.includes('面试')) topicHistory.add('interview')
    if (h.includes('薪资') || h.includes('工资')) topicHistory.add('salary')
    if (h.includes('规划') || h.includes('发展')) topicHistory.add('career')
  })
  
  // 检测"我是谁"等身份查询
  if ((rawInput === '我是谁' || rawInput === '我叫什么' || rawInput === '你还记得我吗' || rawInput === '你知道我是谁吗') && name) {
    const identityLines = [`${name}，当然记得你呀！😊`]
    identityLines.push('')
    identityLines.push(`我记住的你的信息包括：`)
    identityLines.push(`• 名字：${name}`)
    if (userProfile.skills.length > 0) identityLines.push(`• 技能：${userProfile.skills.join('、')}`)
    if (userProfile.targetPosition) identityLines.push(`• 目标方向：${userProfile.targetPosition}`)
    if (userProfile.targetCity) identityLines.push(`• 期望城市：${userProfile.targetCity}`)
    if (userProfile.education) identityLines.push(`• 学历：${userProfile.education}`)
    if (userProfile.careerGoal) identityLines.push(`• 求职目标：${userProfile.careerGoal}`)
    identityLines.push('')
    identityLines.push(`我们已经聊了${userProfile.conversationCount}轮了～`)
    identityLines.push(`${name}，还有什么想让我帮忙的吗？`)
    return identityLines.join('\n')
  }
  
  // 检测"你记得/还记得"类上下文追问
  if (rawInput.includes('记得') || rawInput.includes('还记得') || rawInput.includes('之前') || rawInput.includes('刚才')) {
    const recallLines = [`${personalizedPrefix}关于我们之前的对话：`]
    if (topicHistory.size > 0) {
      const topicMap = { resume: '简历优化', job: '岗位求职', interview: '面试准备', salary: '薪资待遇', career: '职业规划' }
      const topics = Array.from(topicHistory).map(t => topicMap[t]).filter(Boolean)
      recallLines.push(`• 之前我们聊到了${topics.join('、')}相关的话题`)
    }
    if (contextSummary) {
      recallLines.push(`• 我记录的你的情况：${contextSummary}`)
    }
    if (pageDetails.activeFilters && pageDetails.activeFilters.length > 0) {
      recallLines.push(`• 你当前在「${pageContext.pageTitle}」页面，筛选条件：${pageDetails.activeFilters.join('、')}`)
    }
    recallLines.push('')
    recallLines.push('需要我针对这些方面提供更详细的建议吗？')
    return recallLines.join('\n')
  }
  
  const scoredTopics = []

  const topics = [
    {
      id: 'greeting',
      keywords: ['你好', '您好', 'hi', 'hello', '在吗', '在不在', '哈喽', 'hey', '嗨', '早上好', '下午好', '晚上好'],
      score: 10,
      buildReply: () => {
        const lines = []
        if (name) {
          lines.push(`${name}，很高兴见到你呀！😊`)
        } else {
          lines.push('您好呀！😊')
        }
        lines.push('')
        lines.push('我是你的AI求职助手，可以帮你：')
        lines.push('• 📝 简历优化与项目描述')
        lines.push('• 🎯 职业规划与发展路线')
        lines.push('• 💼 岗位推荐与求职技巧')
        lines.push('• 📊 行业趋势与薪资分析')
        if (contextSummary) {
          lines.push('')
          lines.push(`📋 根据你的情况（${contextSummary}），我可以提供更针对性的建议！`)
        }
        if (name) {
          lines.push('')
          lines.push(`${name}，今天想聊点什么呢？`)
        } else {
          lines.push('')
          lines.push('方便告诉我怎么称呼你吗？这样我能更好地帮到你～')
        }
        return lines.join('\n')
      }
    },
    {
      id: 'self_intro',
      keywords: ['我是', '我叫', '我名字', '我的名字', '我是叫', '本人', '我自己', '自我介绍'],
      score: 15,
      buildReply: () => {
        if (name) {
          const lines = [`${name}，认识你真的很高兴！🎉`]
          lines.push('')
          lines.push(`我会记住你的名字的，之后就叫你${name}啦～`)
          if (userProfile.skills.length > 0 || userProfile.targetPosition) {
            lines.push('')
            lines.push('📝 我也记住了一些你的信息：')
            if (userProfile.skills.length > 0) lines.push(`• 技能：${userProfile.skills.join('、')}`)
            if (userProfile.targetPosition) lines.push(`• 目标方向：${userProfile.targetPosition}`)
            if (userProfile.targetCity) lines.push(`• 期望城市：${userProfile.targetCity}`)
            lines.push('')
            lines.push('这些信息能帮助我为你提供更精准的建议！')
          }
          lines.push('')
          lines.push(`${name}，你目前在求职的哪个阶段呢？是正在准备简历、面试，还是已经在挑选岗位了？`)
          return lines.join('\n')
        }
        return '我是AI求职助手，很高兴认识你！😊\n\n你可以告诉我怎么称呼你，我会记住你的名字，之后就能更亲切地聊天啦～'
      }
    },
    {
      id: 'resume_optimize',
      keywords: ['简历', '优化简历', '简历优化', '写简历', '做简历', '改简历', '润色简历'],
      score: 8,
      buildReply: (text) => {
        const tips = []
        if (text.includes('怎么') || text.includes('如何') || text.includes('技巧')) {
          tips.push(`${personalizedPrefix}📌 **核心原则**：`)
          tips.push('• 一页纸最佳，重点突出3-5年经历')
          tips.push('• 使用STAR法则：情境→任务→行动→结果')
          tips.push('• 量化成果（如"性能提升40%"而非"优化了系统"）')
          tips.push('• 技能树与岗位JD对齐，相关技能放前面')
        }
        if (text.includes('模板') || text.includes('格式') || text.includes('排版')) {
          tips.push(`${personalizedPrefix}📌 **格式建议**：`)
          tips.push('• 单栏模板最优，ATS兼容')
          tips.push('• 标题层级清晰，用加粗突出关键信息')
          tips.push('• 配色简洁专业，避免花哨')
        }
        if (tips.length === 0) {
          tips.push(`${personalizedPrefix}📌 **简历优化核心建议**：`)
          tips.push('• 对齐岗位JD关键词，定制化修改')
          if (userProfile.skills.length > 0) {
            tips.push(`• 重点突出你的技能栈：${userProfile.skills.join('、')}`)
          }
          if (userProfile.targetPosition) {
            tips.push(`• 针对${userProfile.targetPosition}岗位调整简历重点`)
          }
          tips.push('• 项目经验用STAR法则描述，量化成果')
          tips.push('• 技能按相关性排序，删除陈旧技能')
          tips.push('• 控制在1-2页，重点信息一眼可见')
        }
        tips.push('💡 你可以直接将简历内容发给我，或进入「AI简历」页面使用智能优化功能！')
        return tips.join('\n')
      }
    },
    {
      id: 'project',
      keywords: ['项目', '项目经验', '项目描述', '怎么写项目', '项目怎么', '做过的项目'],
      score: 8,
      buildReply: (text) => {
        const lines = [`${personalizedPrefix}📌 **项目经验撰写（STAR法则）**：`]
        lines.push('• **S**ituation：项目背景（行业/公司/业务痛点）')
        lines.push('• **T**ask：你的具体任务和目标')
        lines.push('• **A**ction：采取的技术方案和关键决策')
        lines.push('• **R**esult：量化成果（性能提升/用户增长/成本降低）')
        lines.push('')
        lines.push('📌 **示例对比**：')
        lines.push('❌ 负责后端接口开发')
        lines.push('✅ 主导订单系统重构，采用SpringBoot+Redis架构，核心接口QPS从800提升至3500（+337%），系统可用性达99.95%')
        lines.push('')
        if (text.includes('没有') || text.includes('没做过') || text.includes('无项目')) {
          lines.push('💡 **没有项目经验？** 可以参加开源贡献、课程项目、黑客松来积累！')
        }
        if (userProfile.skills.length > 0) {
          lines.push(`🎯 建议围绕你的${userProfile.skills[0]}技能构建1-2个核心项目`)
        }
        lines.push('💡 进入「AI简历」页面可自动生成项目描述！')
        return lines.join('\n')
      }
    },
    {
      id: 'skill',
      keywords: ['技能', '技术', '技术栈', '编程', '开发', '掌握', '会什么'],
      score: 8,
      buildReply: (text) => {
        const lines = [`${personalizedPrefix}📌 **技能展示建议**：`]
        lines.push('• 按岗位相关性排序，最重要的放前面')
        lines.push('• 分分类：语言 / 框架 / 工具 / 软技能')
        lines.push('• 标注熟练度：精通 / 熟练 / 熟悉')
        lines.push('• 每个技能配一个使用场景和成果')
        if (userProfile.skills.length > 0) {
          lines.push('')
          lines.push(`📝 **我记录到你的技能**：${userProfile.skills.join('、')}`)
          lines.push('建议按目标岗位相关性排序展示，最相关的放在最前面')
        }
        if (text.includes('转行') || text.includes('零基础') || text.includes('入门')) {
          lines.push('')
          lines.push('🎯 **转行建议**：选择一个方向深入（如前端Vue/后端Java/数据Python），集中学习3-6个月')
        }
        return lines.join('\n')
      }
    },
    {
      id: 'career_plan',
      keywords: ['规划', '职业规划', '发展', '方向', '路线', '前途', '未来', '出路'],
      score: 8,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}📌 **职业规划建议**：`]
        if (userProfile.targetPosition) {
          lines.push(`🎯 **针对${userProfile.targetPosition}方向**：`)
        }
        if (userProfile.skills.length > 0) {
          lines.push(`• 基于现有技能（${userProfile.skills.slice(0, 2).join('、')}）向更深层次发展`)
        }
        lines.push('• **短期（0-1年）**：选定方向，夯实基础，积累1-2个核心项目')
        lines.push('• **中期（1-3年）**：深入技术栈，向全栈/专家方向发展，积累行业认知')
        lines.push('• **长期（3-5年）**：向架构师/技术管理/专家路线发展')
        lines.push('')
        lines.push('🎯 **IT热门方向**：AI/大模型、云原生、数据工程、物联网、安全')
        lines.push('')
        lines.push('💡 你可以进入「学业规划」页面获取详细的个性化发展路线！')
        return lines.join('\n')
      }
    },
    {
      id: 'job_search',
      keywords: ['岗位', '工作', '招聘', '求职', '找工作', '投简历', '投递', 'offer'],
      score: 8,
      buildReply: (text) => {
        const lines = [`${personalizedPrefix}📌 **求职建议**：`]
        if (userProfile.targetPosition) {
          lines.push(`🎯 **针对${userProfile.targetPosition}岗位**：`)
        }
        if (pageDetails.activeFilters && pageDetails.activeFilters.length > 0) {
          lines.push(`📋 **你当前在「${pageContext.pageTitle}」页面，已选条件**：${pageDetails.activeFilters.join('、')}`)
          lines.push('• 可以调整筛选条件来缩小搜索范围')
        }
        if (pageDetails.jobCount) {
          lines.push(`• 当前页面有${pageDetails.jobCount}个岗位，建议关注匹配度高的职位`)
        }
        if (text.includes('哪里') || text.includes('哪些') || text.includes('推荐')) {
          lines.push('• 明确目标方向（前端/后端/数据/AI/测试）')
          lines.push('• 关注头部公司和成长性企业')
          lines.push('• 多渠道投递（BOSS直聘/智联/猎聘/校招）')
        }
        if (text.includes('投递') || text.includes('投简历')) {
          lines.push('• 不要海投，针对性投递成功率更高')
          lines.push('• 投递前检查：JD关键词→简历是否匹配')
          lines.push('• 投递后跟进：3天未回复可礼貌询问')
        }
        if (userProfile.targetCity) {
          lines.push(`📍 **${userProfile.targetCity}求职提示**：关注当地重点企业和人才政策`)
        }
        if (pageDetails.keyStats && pageDetails.keyStats.length > 0) {
          lines.push('')
          lines.push('📊 **当前页面关键数据**：')
          pageDetails.keyStats.slice(0, 3).forEach(stat => {
            lines.push(`• ${stat}`)
          })
        }
        lines.push('• 每次投递前定制化修改简历')
        lines.push('💡 你可以进入「岗位推荐」页面获取智能匹配的岗位列表！')
        return lines.join('\n')
      }
    },
    {
      id: 'interview',
      keywords: ['面试', '笔试', '面试题', '一面', '二面', '终面', 'HR面'],
      score: 8,
      buildReply: (text) => {
        const lines = []
        if (text.includes('怎么') || text.includes('如何') || text.includes('技巧')) {
          lines.push(`${personalizedPrefix}📌 **面试准备**：`)
          lines.push('• 技术面试：复习数据结构算法、设计模式、系统设计')
          lines.push('• 行为面试：用STAR法则回答，突出解决问题的能力')
          lines.push('• 项目深挖：准备好被追问每个项目的技术决策')
          lines.push('• 模拟面试：自我介绍3分钟版、项目讲解5分钟版')
        } else {
          lines.push(`${personalizedPrefix}📌 **面试核心要点**：`)
          lines.push('• 自我介绍：3分钟，突出最强项和匹配度')
          lines.push('• 项目讲解：STAR法则，重点在Action和Result')
          lines.push('• 算法练习：LeetCode Hot 100必刷')
          lines.push('• 反问环节：问技术栈、团队氛围、成长路径')
        }
        lines.push('💡 我可以帮你模拟面试，请告诉我目标岗位方向！')
        return lines.join('\n')
      }
    },
    {
      id: 'salary',
      keywords: ['薪资', '工资', '待遇', '薪酬', '多少钱', '收入', '薪水'],
      score: 8,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}📌 **IT行业薪资参考**：`]
        lines.push('• 初级（1-3年）：15K-30K/月')
        lines.push('• 中级（3-5年）：25K-50K/月')
        lines.push('• 高级（5年+）：40K-80K+/月')
        lines.push('')
        if (userProfile.targetCity) {
          lines.push(`📍 **${userProfile.targetCity}薪资水平**：根据当地市场，薪资可能有±20%的浮动`)
        }
        if (userProfile.targetPosition) {
          lines.push(`💼 **${userProfile.targetPosition}方向**：不同方向薪资差异较大，AI/大数据方向普遍较高`)
        }
        if (pageDetails.keyStats && pageDetails.keyStats.length > 0) {
          lines.push('')
          lines.push('📊 **当前页面薪资相关数据**：')
          pageDetails.keyStats.filter(s => s.includes('薪') || s.includes('工资') || s.includes('收入')).forEach(stat => {
            lines.push(`• ${stat}`)
          })
        }
        lines.push('')
        lines.push('📌 **影响因素**：城市、公司规模、技术方向、学历背景')
        lines.push('')
        lines.push('📌 **谈判技巧**：')
        lines.push('• 了解市场行情，不先报价')
        lines.push('• 展示不可替代性（如开源贡献、核心项目经验）')
        lines.push('• 关注总包（薪资+股票+年终奖+福利）')
        lines.push('💡 你可以进入「人才统计」页面查看详细薪资数据分析！')
        return lines.join('\n')
      }
    },
    {
      id: 'city',
      keywords: ['城市', '地区', '哪里', '哪个城市', '北上广深', '杭州', '成都', '深圳'],
      score: 8,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}📌 **IT城市选择建议**：`]
        lines.push('• **第一梯队**（北京/上海/深圳/杭州）：岗位多、薪资高、竞争激烈')
        lines.push('• **第二梯队**（成都/武汉/南京/广州）：成本低、发展快、政策支持')
        lines.push('• **考虑因素**：行业分布、生活成本、落户政策、职业天花板')
        lines.push('💡 你可以进入「人才统计」页面查看各城市岗位分布详情！')
        return lines.join('\n')
      }
    },
    {
      id: 'education',
      keywords: ['学历', '大学', '专业', '学校', '考研', '读研', '硕士', '博士'],
      score: 8,
      buildReply: (text) => {
        const lines = [`${personalizedPrefix}📌 **IT学历与专业选择**：`]
        if (text.includes('考研') || text.includes('读研')) {
          lines.push('• 计算机/软件工程方向，建议选择：清华/北大/浙大/中科大/华科')
          lines.push('• 专硕注重工程实践，学硕注重理论研究')
          lines.push('• 研究方向：AI/系统/网络/数据库')
        } else {
          lines.push('• **热门专业**：计算机科学、软件工程、人工智能、数据科学')
          lines.push('• **非科班转行**：系统学习（4-6个月）+ 项目积累 + 求职准备')
        }
        return lines.join('\n')
      }
    },
    {
      id: 'industry_trend',
      keywords: ['趋势', '前景', '发展', '行业', '未来', '方向', '风口'],
      score: 8,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}📌 **IT行业核心趋势**：`]
        lines.push('• 🤖 **AI/大模型**：最大风口，持续3-5年红利期')
        lines.push('• ☁️ **云原生**：Kubernetes、Service Mesh持续火热')
        lines.push('• 📊 **数据工程**：实时计算、数据治理需求激增')
        lines.push('• 🔐 **网络安全**：政策推动，人才缺口大')
        lines.push('• 🌐 **物联网**：与AI结合，边缘计算兴起')
        if (pageDetails.hasCharts) {
          lines.push('')
          lines.push(`📊 **你当前在「${pageContext.pageTitle}」页面，页面包含可视化图表**`)
          if (pageDetails.keyStats && pageDetails.keyStats.length > 0) {
            lines.push('• 当前页面统计数据：')
            pageDetails.keyStats.slice(0, 3).forEach(stat => {
              lines.push(`  - ${stat}`)
            })
          }
        }
        if (userProfile.skills.length > 0) {
          lines.push('')
          lines.push(`🎯 **结合你的技能（${userProfile.skills.slice(0, 2).join('、')}）**：建议关注相关领域的最新进展`)
        }
        lines.push('')
        lines.push('💡 你可以进入「行业预测」页面查看详细趋势分析和技能预测！')
        return lines.join('\n')
      }
    },
    {
      id: 'recommend',
      keywords: ['推荐', '适合', '匹配', '帮我找', '建议我', '找岗位', '找工作'],
      score: 6,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}🎯 为了给你精准推荐岗位，我需要了解一些信息：`]
        if (userProfile.skills.length > 0) {
          lines.push(`• 你的技能栈：${userProfile.skills.join('、')}`)
        } else {
          lines.push('• 你的技能栈（如Vue/Python/Java）？')
        }
        if (userProfile.targetPosition) {
          lines.push(`• 期望方向：${userProfile.targetPosition}`)
        } else {
          lines.push('• 期望方向（前端/后端/数据/AI/测试）？')
        }
        if (userProfile.targetCity) {
          lines.push(`• 期望城市：${userProfile.targetCity}`)
        }
        if (pageDetails.jobCount && pageDetails.activeFilters) {
          lines.push('')
          lines.push(`📋 **当前页面已有${pageDetails.jobCount}个岗位，筛选条件**：${pageDetails.activeFilters.join('、')}`)
          lines.push('可以尝试调整筛选条件来发现更多机会！')
        }
        lines.push('')
        lines.push('💡 你也可以进入「岗位推荐」页面，系统会根据你的简历智能匹配！')
        return lines.join('\n')
      }
    },
    {
      id: 'policy',
      keywords: ['政策', '补贴', '申报', '人才政策', '落户', '住房补贴'],
      score: 8,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}📌 **IT行业人才政策**：`]
        lines.push('• **国家级**：人工智能创新人才支持计划、专项人才引进')
        lines.push('• **地方级**：各城市人才补贴（住房/租房/安家）')
        lines.push('• **企业级**：大厂特批、股权激励、灵活用工')
        lines.push('')
        lines.push('💡 你可以进入「人才统计」页面右侧政策面板查看完整政策列表！')
        return lines.join('\n')
      }
    },
    {
      id: 'data_query',
      keywords: ['数据', '统计', '多少', '排名', '排行', '占比', '比例'],
      score: 8,
      buildReply: (_text) => {
        const lines = [`${personalizedPrefix}📌 **IT行业关键数据**：`]
        lines.push('• 平均薪资：约¥18,918/月（基于2.7万条岗位数据）')
        lines.push('• 热门岗位TOP3：软件开发、数据分析师、AI算法工程师')
        lines.push('• 学历要求：本科为主（45%），硕士占比逐年提升')
        lines.push('• 需求城市：北上广深杭成占比超70%')
        lines.push('')
        lines.push('💡 你可以进入「人才统计」页面查看完整的数据图表分析！')
        return lines.join('\n')
      }
    }
  ]

  for (const topic of topics) {
    const matchCount = topic.keywords.filter(kw => input.includes(kw.toLowerCase())).length
    if (matchCount > 0) {
      scoredTopics.push({
        ...topic,
        score: topic.score + matchCount * 2 + (module === topic.id ? 3 : 0)
      })
    }
  }

  scoredTopics.sort((a, b) => b.score - a.score)

  if (scoredTopics.length > 0) {
    const best = scoredTopics[0]
    let reply = best.buildReply(input)

    if (scoredTopics.length > 1 && scoredTopics[0].score - scoredTopics[1].score < 3) {
      const second = scoredTopics[1]
      const secondReply = second.buildReply(input)
      reply += `\n\n另外，关于"${second.keywords[0]}"，${name ? '我也可以帮你' : '我也可以帮你'}：\n` + secondReply
    }

    if (files.length > 0) {
      reply = `已收到您上传的文件：${files.map(f => f.name).join('、')}\n\n${reply}`
    }
    return reply
  }

  const moduleReplies = {
    planning: `${personalizedPrefix}关于职业规划，我可以帮你分析发展路线、制定学习计划、评估方向选择。\n\n💡 告诉我你目前的情况，例如学历、技能、兴趣方向等，我会给出更具体的建议！`,
    resume: `${personalizedPrefix}关于简历优化，我可以帮你改进项目描述、技能展示、工作经历等。\n\n💡 告诉我你想优化的具体方面，或直接把简历内容发给我！`,
    statistics: `${personalizedPrefix}关于人才统计，我可以告诉你薪资水平、岗位分布、城市就业等数据。\n\n💡 请问你想了解哪方面的具体数据？`,
    prediction: `${personalizedPrefix}关于行业预测，我可以分析技术趋势、就业变化、热门技能等。\n\n💡 请问你关注哪个方向的发展？`,
    recommend: `${personalizedPrefix}关于岗位推荐，我可以帮你匹配岗位、分析要求、提供求职建议。\n\n💡 告诉我你的技能栈和期望方向！`,
    general: `${personalizedPrefix}我可以为你解答职业规划、简历优化、岗位推荐、行业趋势、政策补贴等问题。\n\n💡 请具体描述你的问题，我会给出针对性的回答！`
  }

  let reply = moduleReplies[module] || moduleReplies.general
  if (files.length > 0) {
    reply = `已收到您上传的文件：${files.map(f => f.name).join('、')}\n\n${reply}`
  }
  return reply
}

const simulateTyping = (text, targetIdx) => {
  isTyping.value = false
  
  if (targetIdx < 0 || targetIdx >= messages.value.length) {
    return
  }
  
  let currentText = ''
  let idx = 0
  
  const typeInterval = setInterval(() => {
    if (idx < text.length) {
      const chunkSize = Math.random() > 0.7 ? 2 : 1
      currentText += text.substring(idx, idx + chunkSize)
      const msg = messages.value[targetIdx]
      msg.content = currentText
      msg.typing = true
      idx += chunkSize
      scrollToBottom()
    } else {
      clearInterval(typeInterval)
      const msg = messages.value[targetIdx]
      msg.content = text
      msg.typing = false
      scrollToBottom()
      saveMessagesToStorage()
    }
  }, 15)
}

const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text && attachedFiles.value.length === 0) return
  if (isTyping.value) return
  const files = [...attachedFiles.value]
  inputText.value = ''
  attachedFiles.value = []
  await sendMessage(text, '', files)
}

const triggerFileUpload = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      return
    }
    attachedFiles.value.push(file)
  })
  e.target.value = ''
}

const removeFile = (idx) => {
  attachedFiles.value.splice(idx, 1)
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

let resizeHandler = null

onMounted(() => {
  currentPage.value = detectCurrentModule()
  initPosition()
  const savedMessages = loadMessagesFromStorage()
  if (savedMessages.length > 0) {
    messages.value = savedMessages
  }
  
  resizeHandler = () => {
    if (hasPosition.value) {
      const snapped = getSnappedPosition(position.value.x, position.value.y)
      position.value = snapped
      currentEdge.value = snapped.edge
      localStorage.setItem('ai-assistant-position', JSON.stringify(snapped))
    }
  }
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer)
  }
  if (halfHideTimer) {
    clearTimeout(halfHideTimer)
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
})
</script>

<style scoped>
.ai-assistant-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ai-assistant-container.is-dragging {
  z-index: 10000;
}

.ai-assistant-container.is-dragging .ai-float-btn {
  cursor: grabbing !important;
  transform: scale(1.12);
  filter: drop-shadow(0 0 25px rgba(74, 158, 255, 0.9));
}

/* Peek状态 */
.ai-assistant-container.is-peek {
  transform: translateX(0);
}

.ai-assistant-container.is-peek .ai-float-btn {
  filter: drop-shadow(0 0 5px rgba(74, 158, 255, 0.3));
}

.ai-assistant-container.is-peek .radar-ring {
  opacity: 0.3;
}

.ai-assistant-container.is-peek .radar-ring-2 {
  opacity: 0.25;
}

.ai-assistant-container.is-peek .radar-ring-3 {
  opacity: 0.2;
}

.ai-assistant-container.is-peek .breath-light {
  opacity: 0.25;
}

.ai-assistant-container.is-peek .avatar-body {
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(74, 158, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.ai-assistant-container.is-peek .unread-badge {
  opacity: 0.5;
}

.ai-assistant-container.is-peek .assistant-label {
  opacity: 0;
}

/* 拖拽提示 */
.drag-handle {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(74, 158, 255, 0.8);
  opacity: 0;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(74, 158, 255, 0.5));
  pointer-events: none;
}

.ai-float-btn:hover .drag-handle {
  opacity: 1;
  top: -14px;
}

/* 侧边提示条 */
.peek-indicator {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 40px;
  background: linear-gradient(180deg, #5ba8ff, #9a75ff, #5ba8ff);
  border-radius: 4px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 0 8px rgba(91, 168, 255, 0.6);
  pointer-events: none;
}

.ai-assistant-container.is-peek .peek-indicator {
  opacity: 1;
  animation: peekPulse 2.2s ease-in-out infinite;
}

@keyframes peekPulse {
  0%, 100% { 
    opacity: 0.4; 
    height: 30px;
    box-shadow: 0 0 5px rgba(91, 168, 255, 0.4);
  }
  50% { 
    opacity: 1; 
    height: 42px;
    box-shadow: 0 0 12px rgba(91, 168, 255, 0.8);
  }
}

/* 悬浮按钮 */
.ai-float-btn {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  position: relative;
  cursor: grab;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 12px rgba(74, 158, 255, 0.6));
  flex-shrink: 0;
  animation: floatBobbing 3s ease-in-out infinite;
}

@keyframes floatBobbing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.ai-float-btn:hover {
  filter: drop-shadow(0 0 24px rgba(74, 158, 255, 0.9)) drop-shadow(0 0 40px rgba(138, 100, 255, 0.4));
}

.ai-float-btn.hover {
  animation: floatBobbing 1.5s ease-in-out infinite;
}

.ai-float-btn.hover::after {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: hoverPulse 1.5s ease-in-out infinite;
}

@keyframes hoverPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.ai-float-btn.dragging {
  cursor: grabbing;
  animation: none;
}

/* 边缘吸附效果 */
.ai-float-btn.dragging::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px dashed rgba(74, 158, 255, 0.5);
  animation: snapHint 0.8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes snapHint {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* 外环光晕 */
.avatar-glow-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.35) 0%, rgba(138, 100, 255, 0.15) 50%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* 头像主体 */
.avatar-body {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, 
    rgba(25, 35, 75, 0.97) 0%, 
    rgba(35, 45, 90, 0.95) 50%, 
    rgba(20, 28, 55, 0.97) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 2px solid rgba(74, 158, 255, 0.8);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(74, 158, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  z-index: 2;
}

.avatar-simple {
  width: 70%;
  height: 70%;
  filter: drop-shadow(0 0 6px rgba(74, 158, 255, 0.4));
}

/* 呼吸光 */
.breath-light {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(74, 158, 255, 0.4) 0%, 
    rgba(138, 100, 255, 0.25) 50%, 
    transparent 70%);
  animation: breathPulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes breathPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.12); }
}

/* 标签文字 */
.assistant-label {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(26, 39, 68, 0.95), rgba(15, 26, 51, 0.95));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(74, 158, 255, 0.2);
  pointer-events: none;
}

.assistant-label::after {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: rgba(26, 39, 68, 0.95);
  border-left: 1px solid rgba(74, 158, 255, 0.4);
  border-top: 1px solid rgba(74, 158, 255, 0.4);
}

.ai-float-btn:hover .assistant-label {
  opacity: 1;
  right: calc(100% + 14px);
}

/* 未读消息提示 */
.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 3px 10px rgba(255, 107, 107, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 对话面板 */
.ai-chat-panel {
  width: 380px;
  height: min(520px, calc(100vh - 24px));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 16px;
  border: 1px solid rgba(91, 168, 255, 0.12);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(91, 168, 255, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.ai-chat-panel > * {
  position: relative;
  z-index: 1;
}

/* 面板头部 */
.chat-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.persona-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(91, 168, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(91, 168, 255, 0.2);
  font-size: 18px;
}

.header-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-text h3 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 12px;
  color: rgba(16, 185, 129, 0.8);
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.clear-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  color: #fff;
}

.pin-btn,
.minimize-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.pin-btn:hover,
.minimize-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  color: #fff;
}

.pin-btn.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.4);
  color: #7ab8ff;
}

/* 快捷提问 */
.quick-questions {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.quick-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
}

.quick-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-tag {
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: all 0.25s ease;
}

.quick-tag:hover {
  background: rgba(74, 158, 255, 0.08);
  border-color: rgba(74, 158, 255, 0.25);
  transform: translateX(3px);
}

.tag-icon {
  font-size: 15px;
}

.tag-text {
  flex: 1;
}

/* 聊天消息区 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.message-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.2);
}

.avatar-emoji {
  font-size: 12px;
  line-height: 1;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.msg-content {
  max-width: 78%;
  position: relative;
}

.msg-bubble {
  padding: 9px 13px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-item.ai .msg-bubble {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-top-left-radius: 4px;
}

.message-item.user .msg-bubble {
  background: linear-gradient(135deg, #4a9eff, #3a7ecc);
  border: none;
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.25);
}

.msg-data-flow {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(74, 158, 255, 0.5), 
    transparent);
  border-radius: 2px;
  animation: dataFlowLine 1.5s ease-in-out infinite;
}

@keyframes dataFlowLine {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* 打字指示器 */
.typing-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.7);
  animation: typingBounce 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* 输入区域 */
.chat-input-area {
  padding: 12px 16px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.015);
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  gap: 6px;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 4px 4px 4px 12px;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: rgba(74, 158, 255, 0.35);
  background: rgba(255, 255, 255, 0.04);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  padding: 5px 0;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.send-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4a9eff, #3a7ecc);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #5aaeff, #4a8edd);
  transform: scale(1.05);
}

.send-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.upload-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.upload-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.file-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(138, 100, 255, 0.06));
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: 10px;
  max-width: 100%;
}

.file-icon {
  color: rgba(74, 158, 255, 0.8);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.file-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.file-remove {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.file-remove:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
}

.input-hint {
  margin-top: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  text-align: right;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(16px) scale(0.96);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.96);
}

/* 根据边缘方向调整动画 */
.ai-assistant-container[data-edge="right"] .slide-enter-from {
  transform: translateX(16px) scale(0.96);
}

.ai-assistant-container[data-edge="left"] .slide-enter-from {
  transform: translateX(-16px) scale(0.96);
}

.ai-assistant-container[data-edge="top"] .slide-enter-from {
  transform: translateY(-16px) scale(0.96);
}

.ai-assistant-container[data-edge="bottom"] .slide-enter-from {
  transform: translateY(16px) scale(0.96);
}
</style>
