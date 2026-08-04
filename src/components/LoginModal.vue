<template>
  <Teleport to="body">
    <Transition name="login-modal-fade">
      <div v-if="visible" class="login-modal-overlay" @click.self="handleClose">
        <Transition name="login-modal-scale" appear>
          <div v-if="visible" class="login-modal-card">
            <div class="modal-corner top-left"></div>
            <div class="modal-corner top-right"></div>
            <div class="modal-corner bottom-left"></div>
            <div class="modal-corner bottom-right"></div>

            <button class="modal-close-btn" @click="handleClose" aria-label="关闭">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div class="modal-icon-wrapper">
              <div class="modal-icon-glow"></div>
              <svg class="modal-icon" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h3 class="modal-title">权限提示</h3>
            <p class="modal-message">{{ message }}</p>

            <div class="modal-actions">
              <button class="modal-btn modal-btn-secondary" @click="handleClose">关闭</button>
              <button class="modal-btn modal-btn-primary" @click="handleLogin">
                <span>去登录</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useGuestMode } from '@/composables/useGuestMode'

const props = defineProps({
  // 可选：覆盖默认提示文案
  message: {
    type: String,
    default: '游客模式功能受限，请登录账号解锁完整功能'
  }
})

const { loginModalVisible, loginModalMessage, hideLoginModal, goToLogin } = useGuestMode()

// 弹窗显示状态：以全局 loginModalVisible 为准（单例，跨组件共享）
const visible = loginModalVisible

// 实际展示的文案：优先用 props.message（组件级），否则用全局 loginModalMessage
const message = loginModalMessage

const handleClose = () => {
  hideLoginModal()
}

const handleLogin = () => {
  goToLogin()
}
</script>

<style scoped>
/* 蒙层：禁止底层页面滚动（滚动锁定在 useGuestMode.showLoginModal 中通过 body.overflow 实现） */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(8, 12, 35, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: overlayFadeIn 0.25s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.login-modal-card {
  position: relative;
  width: 420px;
  max-width: 90vw;
  padding: 40px 36px 32px;
  background: linear-gradient(135deg, rgba(20, 28, 64, 0.95) 0%, rgba(30, 22, 68, 0.95) 100%);
  border: 1px solid rgba(96, 165, 250, 0.35);
  border-radius: 18px;
  box-shadow:
    0 0 60px rgba(96, 165, 250, 0.25),
    0 0 100px rgba(167, 139, 250, 0.12),
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  text-align: center;
  overflow: hidden;
}

.login-modal-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(96, 165, 250, 0.12) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.08) 0%, transparent 50%);
  opacity: 0.6;
  pointer-events: none;
  animation: cardBgShift 12s ease-in-out infinite;
}

@keyframes cardBgShift {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

.modal-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(96, 165, 250, 0.5);
  pointer-events: none;
  z-index: 2;
}

.modal-corner.top-left {
  top: 14px;
  left: 14px;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.modal-corner.top-right {
  top: 14px;
  right: 14px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}

.modal-corner.bottom-left {
  bottom: 14px;
  left: 14px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}

.modal-corner.bottom-right {
  bottom: 14px;
  right: 14px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(200, 220, 250, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 3;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  transform: rotate(90deg);
}

.modal-icon-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow:
    0 0 30px rgba(96, 165, 250, 0.25),
    inset 0 0 20px rgba(96, 165, 250, 0.08);
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(96, 165, 250, 0.25), inset 0 0 20px rgba(96, 165, 250, 0.08); }
  50% { transform: scale(1.05); box-shadow: 0 0 45px rgba(96, 165, 250, 0.4), inset 0 0 25px rgba(96, 165, 250, 0.12); }
}

.modal-icon-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%);
  filter: blur(8px);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}

.modal-icon {
  position: relative;
  color: #93c5fd;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.6));
  z-index: 1;
}

.modal-title {
  position: relative;
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #fff 0%, #93c5fd 60%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
  z-index: 1;
}

.modal-message {
  position: relative;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(200, 220, 250, 0.82);
  margin: 0 0 28px;
  padding: 0 8px;
  z-index: 1;
}

.modal-actions {
  position: relative;
  display: flex;
  gap: 14px;
  z-index: 1;
}

.modal-btn {
  flex: 1;
  padding: 13px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 1px;
}

.modal-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(200, 220, 250, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  transform: translateY(-2px);
}

.modal-btn-primary {
  background: linear-gradient(135deg, #4a9eff 0%, #6366f1 50%, #818cf8 100%);
  background-size: 200% 200%;
  color: #fff;
  border: 1px solid rgba(96, 165, 250, 0.5);
  box-shadow: 0 8px 24px rgba(96, 165, 250, 0.35);
  animation: primaryGradient 6s ease infinite;
}

@keyframes primaryGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.modal-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(96, 165, 250, 0.5);
}

.modal-btn-primary svg {
  transition: transform 0.3s ease;
}

.modal-btn-primary:hover svg {
  transform: translateX(3px);
}

/* 过渡动画 */
.login-modal-fade-enter-active,
.login-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.login-modal-fade-enter-from,
.login-modal-fade-leave-to {
  opacity: 0;
}

.login-modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.login-modal-scale-leave-active {
  transition: all 0.2s ease;
}

.login-modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(-10px);
}

.login-modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

@media (max-width: 480px) {
  .login-modal-card {
    padding: 32px 24px 24px;
  }

  .modal-title {
    font-size: 1.15rem;
  }

  .modal-message {
    font-size: 0.88rem;
  }

  .modal-btn {
    padding: 11px 14px;
    font-size: 0.9rem;
  }
}
</style>
