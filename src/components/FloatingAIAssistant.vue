<template>
  <div 
    class="ai-assistant-container" 
    :class="{ 
      'is-peek': !isHovered && !isExpanded
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <!-- 悬浮按钮 -->
    <transition name="fade">
      <div 
        v-if="!isExpanded" 
        class="ai-float-btn" 
        :class="{ hover: isHovered }"
        @click="toggleExpand">
        <!-- 侧边提示条 - peek状态显示 -->
        <div class="peek-indicator" v-if="!isExpanded"></div>
        <!-- 外环雷达 -->
        <div class="radar-ring"></div>
        <div class="radar-ring-2"></div>
        
        <!-- 主体头像 -->
        <div class="avatar-body">
          <div class="avatar-glow"></div>
          <svg class="avatar-svg" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#5ba8ff;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#9a75ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#5ba8ff;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="dataLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#5ba8ff;stop-opacity:0" />
                <stop offset="50%" style="stop-color:#5ba8ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#5ba8ff;stop-opacity:0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- 人像轮廓 - 增强 -->
            <circle cx="32" cy="22" r="10" fill="none" stroke="url(#avatarGrad)" stroke-width="2" opacity="1" filter="url(#glow)"/>
            <path d="M20 38 Q20 32 26 30 L38 30 Q44 32 44 38 L44 48 Q44 50 42 50 L22 50 Q20 50 20 48 Z" 
                  fill="none" stroke="url(#avatarGrad)" stroke-width="2" opacity="1" filter="url(#glow)"/>
            <!-- 数据流线条 - 增强 -->
            <line x1="10" y1="20" x2="54" y2="20" stroke="url(#dataLineGrad)" stroke-width="1" class="data-line"/>
            <line x1="8" y1="30" x2="56" y2="30" stroke="url(#dataLineGrad)" stroke-width="1" class="data-line-2"/>
            <line x1="12" y1="42" x2="52" y2="42" stroke="url(#dataLineGrad)" stroke-width="1" class="data-line-3"/>
            <!-- 眼睛光点 - 增强 -->
            <circle cx="28" cy="22" r="2.5" fill="#5ba8ff" class="eye-blink" filter="url(#glow)"/>
            <circle cx="36" cy="22" r="2.5" fill="#5ba8ff" class="eye-blink" filter="url(#glow)"/>
            <!-- 眼睛高光 -->
            <circle cx="29" cy="21" r="0.8" fill="#ffffff" opacity="0.9"/>
            <circle cx="37" cy="21" r="0.8" fill="#ffffff" opacity="0.9"/>
          </svg>
        </div>
        
        <!-- 呼吸光 -->
        <div class="breath-light"></div>
        
        <!-- 未读消息提示 -->
        <div v-if="unreadCount > 0" class="unread-badge">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </div>
      </div>
    </transition>

    <!-- 对话面板 -->
    <transition name="slide">
      <div v-if="isExpanded" class="ai-chat-panel">
        <!-- 面板头部 -->
        <div class="chat-header">
          <div class="header-left">
            <div class="ai-logo">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#4a9eff" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" fill="#4a9eff"/>
                <circle cx="12" cy="3" r="1" fill="#8a64ff"/>
                <circle cx="21" cy="12" r="1" fill="#8a64ff"/>
                <circle cx="12" cy="21" r="1" fill="#8a64ff"/>
                <circle cx="3" cy="12" r="1" fill="#8a64ff"/>
              </svg>
            </div>
            <div class="header-text">
              <h3>AI就业规划助手</h3>
              <span class="status-dot"></span>
              <span class="status-text">在线</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="minimize-btn" @click="toggleExpand" title="收起">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
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
            <div v-if="msg.role === 'ai'" class="msg-avatar ai-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#4a9eff" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="2" fill="#4a9eff"/>
              </svg>
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
          <div class="input-wrapper">
            <input 
              v-model="inputText" 
              type="text" 
              class="chat-input" 
              placeholder="输入您的问题..."
              @keyup.enter="handleSend"
              :disabled="isTyping"/>
            <button 
              class="send-btn" 
              :class="{ disabled: !inputText.trim() || isTyping }"
              @click="handleSend">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div class="input-hint">按 Enter 发送</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const isExpanded = ref(false)
const isHovered = ref(false)
const inputText = ref('')
const messages = ref([])
const isTyping = ref(false)
const unreadCount = ref(0)
const chatMessages = ref(null)
let autoCollapseTimer = null

// 当前页面上下文
const currentPage = ref('')

// 快捷提问
const quickQuestions = [
  { icon: '📚', text: '如何规划大学专业发展路线？', module: 'planning' },
  { icon: '💼', text: '简历怎么优化提升通过率？', module: 'resume' },
  { icon: '📊', text: '当下热门行业人才需求？', module: 'statistics' },
  { icon: '🔮', text: '未来3年就业趋势？', module: 'prediction' },
  { icon: '🎯', text: '匹配适合我的岗位有哪些？', module: 'recommend' }
]

// hover延迟计时器
let hoverDelayTimer = null

// 处理鼠标进入
const handleMouseEnter = () => {
  if (hoverDelayTimer) {
    clearTimeout(hoverDelayTimer)
    hoverDelayTimer = null
  }
  isHovered.value = true
  
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer)
    autoCollapseTimer = null
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  if (hoverDelayTimer) {
    clearTimeout(hoverDelayTimer)
  }
  
  if (isExpanded.value) {
    autoCollapseTimer = setTimeout(() => {
      isExpanded.value = false
      isHovered.value = false
    }, 3000)
    return
  }
  
  hoverDelayTimer = setTimeout(() => {
    isHovered.value = false
    hoverDelayTimer = null
  }, 250)
}

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    unreadCount.value = 0
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer)
      autoCollapseTimer = null
    }
    // 首次展开添加欢迎消息
    if (messages.value.length === 0) {
      addAIMessage('您好！我是AI就业规划助手 👋\n\n我可以帮您解答关于学业规划、简历优化、人才需求、行业趋势和岗位推荐等问题。\n\n请选择下方快捷提问，或直接输入您的问题～')
    }
  }
}

// 发送快捷提问
const sendQuickQuestion = async (tag) => {
  await sendMessage(tag.text, tag.module)
}

// 添加用户消息
const addUserMessage = (content) => {
  messages.value.push({
    role: 'user',
    content
  })
  scrollToBottom()
}

// 添加AI消息
const addAIMessage = (content, typing = false) => {
  messages.value.push({
    role: 'ai',
    content,
    typing
  })
  scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

// 获取当前页面模块
const detectCurrentModule = () => {
  const path = window.location.pathname
  if (path.includes('planning')) return 'planning'
  if (path.includes('resume') || path.includes('ai-resume')) return 'resume'
  if (path.includes('statistics')) return 'statistics'
  if (path.includes('prediction')) return 'prediction'
  if (path.includes('recommend') || path.includes('job')) return 'recommend'
  return 'general'
}

// 发送消息
const sendMessage = async (text, module = '') => {
  const content = text.trim()
  if (!content || isTyping.value) return

  const targetModule = module || detectCurrentModule()
  addUserMessage(content)
  
  // 显示打字动画
  isTyping.value = true
  addAIMessage('', true)

  try {
    // 调用后端API
    const response = await axios.post('/api/ai-assistant/chat', {
      message: content,
      module: targetModule,
      history: messages.value.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }))
    }, {
      timeout: 10000
    })

    // 更新最后一条AI消息
    const lastIdx = messages.value.length - 1
    if (response.data.success) {
      simulateTyping(response.data.data.reply || '我已收到您的问题，正在为您分析...', lastIdx)
    } else {
      simulateTyping('抱歉，我暂时无法回答您的问题，请稍后再试。', lastIdx)
    }
  } catch (error) {
    // 网络错误时使用本地回复
    const replies = {
      planning: '根据学业规划模块的数据分析，建议您：\n1. 明确职业发展方向\n2. 制定阶段性学习目标\n3. 注重实践项目积累\n\n您可以进入「学业-就业双向联动规划」页面获取更详细的个性化建议。',
      resume: '关于简历优化，我建议：\n1. 突出与岗位匹配的核心技能\n2. 使用量化数据展示成果\n3. 保持简洁专业的格式\n\n您可以进入「AI简历」页面使用智能优化功能。',
      statistics: '根据人才统计数据，当前热门行业包括：\n• 人工智能/机器学习\n• 大数据/云计算\n• 区块链技术\n• 智能制造\n\n如需详细数据，请进入「人才专项统计模块」查看。',
      prediction: '根据行业预测分析，未来3年就业趋势：\n1. AI相关岗位需求年增长30%+\n2. 数字化转型人才缺口大\n3. 复合型技能人才最受欢迎\n\n详细趋势请查看「行业供需预测」模块。',
      recommend: '为了给您推荐合适的岗位，建议您：\n1. 完善个人简历信息\n2. 明确期望城市和薪资\n3. 选择意向行业方向\n\n您可以进入「智能岗位推荐」页面获取个性化推荐。',
      general: '我可以为您解答学业规划、简历优化、人才需求、行业趋势和岗位推荐等问题。\n\n请问您具体想了解哪方面的内容？'
    }
    
    const reply = replies[targetModule] || replies.general
    const lastIdx = messages.value.length - 1
    simulateTyping(reply, lastIdx)
  }
}

// 模拟打字效果
const simulateTyping = (text, targetIdx) => {
  isTyping.value = false
  let currentText = ''
  let idx = 0
  
  const typeInterval = setInterval(() => {
    if (idx < text.length) {
      currentText += text[idx]
      messages.value[targetIdx] = {
        role: 'ai',
        content: currentText,
        typing: true
      }
      idx++
      scrollToBottom()
    } else {
      clearInterval(typeInterval)
      messages.value[targetIdx] = {
        role: 'ai',
        content: text,
        typing: false
      }
      scrollToBottom()
    }
  }, 30)
}

// 处理发送
const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return
  inputText.value = ''
  await sendMessage(text)
}

onMounted(() => {
  currentPage.value = detectCurrentModule()
})

onUnmounted(() => {
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer)
  }
})
</script>

<style scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 9999;
  transform: translateX(0);
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* Peek状态 - 半隐藏，只显示左侧一部分 */
.ai-assistant-container.is-peek {
  transform: translateX(45px);
}

/* Peek状态下的视觉弱化 */
.ai-assistant-container.is-peek .ai-float-btn {
  filter: drop-shadow(0 0 3px rgba(74, 158, 255, 0.2));
}

.ai-assistant-container.is-peek .radar-ring {
  opacity: 0.35;
}

.ai-assistant-container.is-peek .radar-ring-2 {
  opacity: 0.3;
}

.ai-assistant-container.is-peek .breath-light {
  opacity: 0.3;
}

.ai-assistant-container.is-peek .avatar-body {
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(74, 158, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.ai-assistant-container.is-peek .unread-badge {
  opacity: 0.6;
}

/* 侧边提示条 - Peek状态下可见 */
.peek-indicator {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 35px;
  background: linear-gradient(180deg, #5ba8ff, #9a75ff, #5ba8ff);
  border-radius: 3px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 0 6px rgba(91, 168, 255, 0.5);
}

.ai-assistant-container.is-peek .peek-indicator {
  opacity: 1;
  animation: peekPulse 2.2s ease-in-out infinite;
}

@keyframes peekPulse {
  0%, 100% { 
    opacity: 0.5; 
    height: 28px;
    box-shadow: 0 0 4px rgba(91, 168, 255, 0.4);
  }
  50% { 
    opacity: 1; 
    height: 38px;
    box-shadow: 0 0 10px rgba(91, 168, 255, 0.7);
  }
}

/* 悬浮按钮 */
.ai-float-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 8px rgba(74, 158, 255, 0.5));
  flex-shrink: 0;
}

.ai-float-btn:hover {
  filter: drop-shadow(0 0 16px rgba(74, 158, 255, 0.8));
}

.ai-float-btn.hover {
  transform: scale(1.08);
}

/* 雷达环 - 增强可见度 */
.radar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 2px solid rgba(74, 158, 255, 0.6);
  animation: radarRotate 6s linear infinite;
  border-top-color: transparent;
  border-right-color: rgba(74, 158, 255, 1);
  border-bottom-color: transparent;
  border-left-color: rgba(138, 100, 255, 0.5);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.4);
}

.radar-ring-2 {
  position: absolute;
  top: -16px;
  left: -16px;
  right: -16px;
  bottom: -16px;
  border-radius: 50%;
  border: 1.5px solid transparent;
  border-top-color: rgba(138, 100, 255, 0.5);
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  animation: radarRotate 10s linear infinite reverse;
  box-shadow: 0 0 8px rgba(138, 100, 255, 0.3);
}

@keyframes radarRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 头像主体 - 增强边框和发光 */
.avatar-body {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, 
    rgba(25, 35, 75, 0.95) 0%, 
    rgba(35, 45, 90, 0.92) 50%, 
    rgba(20, 28, 55, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(74, 158, 255, 0.8);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(74, 158, 255, 0.4),
    0 0 20px rgba(138, 100, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  z-index: 2;
}

.avatar-glow {
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(74, 158, 255, 0.5) 0%, 
    rgba(138, 100, 255, 0.25) 50%, 
    transparent 70%);
  animation: avatarGlow 2.5s ease-in-out infinite;
}

@keyframes avatarGlow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.avatar-svg {
  width: 38px;
  height: 38px;
  position: relative;
  z-index: 1;
  filter: brightness(1.3) drop-shadow(0 0 4px rgba(74, 158, 255, 0.6));
}

.data-line {
  animation: dataFlow 2s linear infinite;
}

.data-line-2 {
  animation: dataFlow 2.5s linear infinite;
  animation-delay: 0.5s;
}

.data-line-3 {
  animation: dataFlow 3s linear infinite;
  animation-delay: 1s;
}

@keyframes dataFlow {
  0% { opacity: 0; stroke-dashoffset: 100; }
  50% { opacity: 0.8; }
  100% { opacity: 0; stroke-dashoffset: -100; }
}

.eye-blink {
  animation: blink 4s ease-in-out infinite;
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

/* 呼吸光 - 增强 */
.breath-light {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(74, 158, 255, 0.35) 0%, 
    rgba(138, 100, 255, 0.2) 50%, 
    transparent 70%);
  animation: breathPulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes breathPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

/* 未读消息提示 */
.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  border-radius: 9px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
}

/* 对话面板 */
.ai-chat-panel {
  width: 380px;
  height: 520px;
  background: linear-gradient(145deg, 
    rgba(15, 20, 45, 0.95) 0%, 
    rgba(20, 25, 55, 0.92) 50%, 
    rgba(12, 15, 38, 0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(74, 158, 255, 0.2);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(74, 158, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.ai-chat-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(74, 158, 255, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(138, 100, 255, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

/* 面板头部 */
.chat-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
  background: rgba(10, 15, 35, 0.3);
  position: relative;
}

.chat-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(74, 158, 255, 0.4), 
    transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(138, 100, 255, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 158, 255, 0.3);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.2);
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
}

.minimize-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  color: rgba(74, 158, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.minimize-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  color: #fff;
}

/* 快捷提问 */
.quick-questions {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.08);
}

.quick-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.quick-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-tag {
  padding: 10px 14px;
  background: linear-gradient(135deg, 
    rgba(74, 158, 255, 0.08) 0%, 
    rgba(138, 100, 255, 0.06) 100%);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: all 0.3s ease;
}

.quick-tag:hover {
  background: linear-gradient(135deg, 
    rgba(74, 158, 255, 0.15) 0%, 
    rgba(138, 100, 255, 0.12) 100%);
  border-color: rgba(74, 158, 255, 0.35);
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.15);
}

.tag-icon {
  font-size: 16px;
}

.tag-text {
  flex: 1;
}

/* 聊天消息区 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.2);
  border-radius: 2px;
}

.message-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(138, 100, 255, 0.15));
  border: 1px solid rgba(74, 158, 255, 0.3);
}

.user-avatar {
  background: linear-gradient(135deg, rgba(138, 100, 255, 0.2), rgba(74, 158, 255, 0.15));
  border: 1px solid rgba(138, 100, 255, 0.3);
}

.msg-content {
  max-width: 75%;
  position: relative;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-item.ai .msg-bubble {
  background: linear-gradient(135deg, 
    rgba(74, 158, 255, 0.12) 0%, 
    rgba(138, 100, 255, 0.08) 100%);
  border: 1px solid rgba(74, 158, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  border-top-left-radius: 4px;
}

.message-item.user .msg-bubble {
  background: linear-gradient(135deg, 
    rgba(138, 100, 255, 0.2) 0%, 
    rgba(100, 80, 200, 0.15) 100%);
  border: 1px solid rgba(138, 100, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
  border-top-right-radius: 4px;
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
  padding: 14px 20px 16px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
  background: rgba(10, 15, 35, 0.3);
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(74, 158, 255, 0.06);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  padding: 6px 6px 6px 14px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.1);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  padding: 6px 0;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(138, 100, 255, 0.25));
  border: 1px solid rgba(74, 158, 255, 0.4);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.send-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.5), rgba(138, 100, 255, 0.4));
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
}

.send-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
</style>
