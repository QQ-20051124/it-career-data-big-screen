<template>
  <div class="login-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    <div class="corner-decoration bottom-left"></div>
      <div class="corner-decoration bottom-right"></div>

      <div class="light-rays">
        <div class="ray" v-for="n in 8" :key="'ray'+n" :style="{ '--i': n }"></div>
      </div>

      <div class="hex-grid"></div>

      <div class="circuit-pattern"></div>

      <div class="data-charts">
        <div class="mini-chart chart-bars">
          <svg viewBox="0 0 200 80" preserveAspectRatio="none">
            <rect x="10" y="50" width="15" height="30" class="bar bar-1"/>
            <rect x="35" y="35" width="15" height="45" class="bar bar-2"/>
            <rect x="60" y="45" width="15" height="35" class="bar bar-3"/>
            <rect x="85" y="25" width="15" height="55" class="bar bar-4"/>
            <rect x="110" y="40" width="15" height="40" class="bar bar-5"/>
            <rect x="135" y="15" width="15" height="65" class="bar bar-6"/>
            <rect x="160" y="55" width="15" height="25" class="bar bar-7"/>
            <rect x="185" y="30" width="15" height="50" class="bar bar-8"/>
          </svg>
        </div>
        <div class="mini-chart chart-radar">
          <svg viewBox="0 0 100 100">
            <polygon points="50,10 90,35 90,85 50,100 10,85 10,35" fill="none" class="radar-ring radar-outer"/>
            <polygon points="50,25 75,45 75,75 50,90 25,75 25,45" fill="none" class="radar-ring radar-middle"/>
            <polygon points="50,40 62,55 62,70 50,80 38,70 38,55" fill="none" class="radar-ring radar-inner"/>
            <polygon points="50,20 80,35 80,75 50,95 20,75 20,35" fill="none" class="radar-area"/>
          </svg>
        </div>
        <div class="mini-chart chart-circle">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="30" fill="none" class="circle-bg"/>
            <circle cx="40" cy="40" r="30" fill="none" class="circle-progress"/>
          </svg>
        </div>
        <div class="mini-chart chart-line">
          <svg viewBox="0 0 160 60" preserveAspectRatio="none">
            <polyline points="0,40 20,30 40,45 60,25 80,35 100,20 120,40 140,30 160,25" fill="none" class="line-path"/>
            <circle cx="0" cy="40" r="2" class="line-dot"/>
            <circle cx="20" cy="30" r="2" class="line-dot"/>
            <circle cx="40" cy="45" r="2" class="line-dot"/>
            <circle cx="60" cy="25" r="2" class="line-dot"/>
            <circle cx="80" cy="35" r="2" class="line-dot"/>
            <circle cx="100" cy="20" r="2" class="line-dot"/>
            <circle cx="120" cy="40" r="2" class="line-dot"/>
            <circle cx="140" cy="30" r="2" class="line-dot"/>
            <circle cx="160" cy="25" r="2" class="line-dot"/>
          </svg>
        </div>
        <div class="mini-chart chart-wave">
          <svg viewBox="0 0 120 50" preserveAspectRatio="none">
            <path d="M0,25 Q15,10 30,25 T60,25 T90,25 T120,25" fill="none" class="wave-path"/>
            <path d="M0,30 Q15,15 30,30 T60,30 T90,30 T120,30" fill="none" class="wave-path wave-secondary"/>
          </svg>
        </div>
        <div class="mini-chart chart-matrix">
          <svg viewBox="0 0 80 80">
            <circle cx="20" cy="20" r="1.5" class="matrix-dot"/>
            <circle cx="40" cy="20" r="1.5" class="matrix-dot"/>
            <circle cx="60" cy="20" r="1.5" class="matrix-dot"/>
            <circle cx="20" cy="40" r="1.5" class="matrix-dot"/>
            <circle cx="40" cy="40" r="2.5" class="matrix-dot matrix-center"/>
            <circle cx="60" cy="40" r="1.5" class="matrix-dot"/>
            <circle cx="20" cy="60" r="1.5" class="matrix-dot"/>
            <circle cx="40" cy="60" r="1.5" class="matrix-dot"/>
            <circle cx="60" cy="60" r="1.5" class="matrix-dot"/>
          </svg>
        </div>
      </div>

      <div class="data-nodes">
        <div class="data-node" v-for="n in 12" :key="'dn'+n" :style="{ '--i': n }"></div>
      </div>

      <div class="page-header">
      <div class="header-content">
        <div class="header-line"></div>
        <div class="header-info">
          <h2 class="brand-subtitle">IT学习与就业数据可视化导航系统</h2>
          <div class="header-bar"></div>
        </div>
      </div>
    </div>

    <div class="login-wrapper">
      <div class="left-panel">
        <div class="brand-section">
          <div ref="globeContainer" class="globe-container"></div>
          <div class="brand-text-wrapper">
            <h1 class="brand-title">计程·职道</h1>
            <div class="title-accent"></div>
          </div>
          <div class="brand-features">
            <div class="feature-item">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>智能岗位匹配</span>
            </div>
            <div class="feature-divider"></div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>实时数据监控</span>
            </div>
            <div class="feature-divider"></div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>可视化分析报告</span>
            </div>
          </div>
          <button class="guest-btn" @click="handleGuest">
            <span class="btn-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </span>
            <span>游客预览</span>
          </button>
        </div>
      </div>



      <div class="right-panel">
        <div ref="loginCard" class="login-card" @mousemove="handleCardMouseMove" @mouseleave="handleCardMouseLeave">
          <div class="ai-network-bg">
            <svg class="network-svg" viewBox="0 0 400 500">
              <line v-for="link in networkLinks" :key="link.id" 
                :x1="link.x1" :y1="link.y1" :x2="link.x2" :y2="link.y2" 
                class="network-line" :style="{ '--delay': link.delay }"/>
              <circle v-for="node in networkNodes" :key="node.id" 
                :cx="node.x" :cy="node.y" :r="node.r" 
                class="network-node" :style="{ '--delay': node.delay }"/>
            </svg>
          </div>

          <div class="career-tag-cloud">
            <span v-for="tag in careerTags" :key="tag.name" 
              class="career-tag" :style="{ 
                '--x': tag.x + '%', 
                '--y': tag.y + '%', 
                '--delay': tag.delay + 's',
                '--color': tag.color
              }">
              {{ tag.name }}
            </span>
          </div>

          <div class="data-flow-lines">
            <div class="flow-line line-1"></div>
            <div class="flow-line line-2"></div>
            <div class="flow-line line-3"></div>
          </div>

          <div class="card-content">
            <div class="card-header">
              <div class="header-icon">
                <svg viewBox="0 0 40 40" width="40" height="40">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="url(#iconGradient)" stroke-width="2"/>
                  <path d="M12 20h6m-3-6v12m8-6l-4-4m4 4l-4 4" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round"/>
                  <defs>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#4a9eff"/>
                      <stop offset="100%" style="stop-color:#00d4aa"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2>欢迎回来</h2>
              <p>登录您的AI职业导航空间</p>
            </div>

            <!-- 登录方式切换 -->
            <div class="login-tabs">
              <button 
                class="login-tab" 
                :class="{ active: loginMethod === 'password' }"
                @click="switchLoginMethod('password')"
              >
                <i class="fa-solid fa-key"></i>
                账号密码
              </button>
              <button 
                class="login-tab" 
                :class="{ active: loginMethod === 'phone' }"
                @click="switchLoginMethod('phone')"
              >
                <i class="fa-solid fa-mobile-screen"></i>
                手机验证码
              </button>
            </div>

            <form class="login-form" @submit.prevent="handleLogin">
              <!-- 账号密码登录 -->
              <template v-if="loginMethod === 'password'">
                <div class="input-group" :class="usernameStatus" @focus="focusedInput = 'username'" @blur="focusedInput = null">
                  <div class="input-glow"></div>
                  <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    v-model="form.username" 
                    placeholder="请输入用户名或邮箱" 
                    @input="validateUsername"
                  />
                  <div class="input-status-icon">
                    <i v-if="usernameStatus === 'success'" class="fa-solid fa-check"></i>
                    <i v-else-if="usernameStatus === 'error'" class="fa-solid fa-circle-exclamation"></i>
                  </div>
                </div>
                <div v-if="usernameError" class="field-error">{{ usernameError }}</div>

                <div class="input-group" :class="passwordStatus" @focus="focusedInput = 'password'" @blur="focusedInput = null">
                  <div class="input-glow"></div>
                  <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="form.password" 
                    placeholder="密码" 
                    @input="validatePassword"
                  />
                  <div class="toggle-pwd" @click="showPassword = !showPassword">
                    <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.58 18.58 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.58 18.58 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1 4.24 4.24"/>
                    </svg>
                  </div>
                </div>
                <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
              </template>

              <!-- 手机验证码登录 -->
              <template v-else>
                <div class="input-group" :class="phoneStatus" @focus="focusedInput = 'phone'" @blur="focusedInput = null">
                  <div class="input-glow"></div>
                  <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  </div>
                  <input 
                    type="tel" 
                    v-model="phoneForm.phone" 
                    placeholder="请输入手机号" 
                    maxlength="11"
                    @input="validatePhone"
                  />
                  <div class="input-status-icon">
                    <i v-if="phoneStatus === 'success'" class="fa-solid fa-check"></i>
                    <i v-else-if="phoneStatus === 'error'" class="fa-solid fa-circle-exclamation"></i>
                  </div>
                </div>
                <div v-if="phoneError" class="field-error">{{ phoneError }}</div>

                <div class="input-group" :class="codeStatus" @focus="focusedInput = 'code'" @blur="focusedInput = null">
                  <div class="input-glow"></div>
                  <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    v-model="phoneForm.code" 
                    placeholder="请输入验证码" 
                    maxlength="6"
                    @input="validateCode"
                  />
                  <button 
                    type="button" 
                    class="send-code-btn"
                    :disabled="codeCountdown > 0 || !isPhoneValid"
                    @click="sendVerificationCode"
                  >
                    {{ codeCountdown > 0 ? `${codeCountdown}s 后重试` : '获取验证码' }}
                  </button>
                </div>
                <div v-if="codeError" class="field-error">{{ codeError }}</div>
              </template>

              <div class="form-options">
                <label class="checkbox">
                  <input type="checkbox" v-model="form.remember"/>
                  <span class="check-icon"></span>
                  <span>记住我</span>
                </label>
                <a href="#" class="forgot-link" @click.prevent="openForgotPassword">忘记密码?</a>
              </div>

              <button type="submit" class="login-btn" :disabled="loading">
                <span class="btn-pulse"></span>
                <span class="btn-wave"></span>
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'AI认证中...' : (loginMethod === 'phone' ? '验证码登录' : '智能登录') }}
              </button>
            </form>

            <div class="divider" v-if="!showRegister">
              <span class="divider-line"></span>
              <span class="divider-text">邮箱登录</span>
              <span class="divider-line"></span>
            </div>

            <div class="social-buttons" v-if="!showRegister">
              <button class="social-btn email" @click="handleEmailLogin" title="使用邮箱账号登录">
                <div class="social-ring"></div>
                <i class="fa-solid fa-envelope"></i>
              </button>
            </div>

            <div class="register-link">
              还没有账号? <a href="#" @click.prevent="toggleRegister">{{ showRegister ? '返回登录' : '立即注册' }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <Teleport to="body">
      <div v-if="showRegister" class="email-modal-overlay" @click.self="showRegister = false">
        <div class="email-modal">
          <button class="modal-close" @click="showRegister = false">×</button>
          <h3>注册新账号</h3>
          <p class="modal-desc">使用邮箱注册，注册后可登录系统</p>
          
          <form @submit.prevent="submitRegister" class="email-form">
            <div class="form-group">
              <label>昵称</label>
              <input 
                type="text" 
                v-model="registerForm.name" 
                placeholder="请输入昵称"
                @input="registerError = ''"
              />
            </div>

            <div class="form-group">
              <label>邮箱地址</label>
              <input 
                type="email" 
                v-model="registerForm.email" 
                placeholder="请输入邮箱地址"
                @input="registerError = ''"
              />
            </div>
            
            <div class="form-group">
              <label>密码</label>
              <input 
                type="password" 
                v-model="registerForm.password" 
                placeholder="至少6位字符"
                @input="registerError = ''"
              />
            </div>

            <div class="form-group">
              <label>确认密码</label>
              <input 
                type="password" 
                v-model="registerForm.confirmPassword" 
                placeholder="再次输入密码"
                @input="registerError = ''"
              />
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showRegister = false">取消</button>
              <button type="submit" class="btn-submit" :disabled="registerForm.loading">
                {{ registerForm.loading ? '注册中...' : '注册并登录' }}
              </button>
            </div>
            
            <div v-if="registerError" class="form-error">{{ registerError }}</div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- 邮箱登录弹窗 -->
    <Teleport to="body">
      <div v-if="showEmailModal" class="email-modal-overlay" @click.self="showEmailModal = false">
        <div class="email-modal">
          <button class="modal-close" @click="showEmailModal = false">×</button>
          <h3>邮箱登录</h3>
          <p class="modal-desc">使用您的邮箱账号登录系统</p>
          
          <form @submit.prevent="submitEmailLogin" class="email-form">
            <div class="form-group">
              <label>邮箱地址</label>
              <input 
                type="email" 
                v-model="emailForm.email" 
                placeholder="请输入邮箱地址"
                @input="emailError = ''"
              />
            </div>
            
            <div class="form-group">
              <label>密码</label>
              <input 
                type="password" 
                v-model="emailForm.password" 
                placeholder="请输入密码"
                @input="emailError = ''"
              />
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showEmailModal = false">取消</button>
              <button type="submit" class="btn-submit" :disabled="emailForm.loading">
                {{ emailForm.loading ? '登录中...' : '登录' }}
              </button>
            </div>
            
            <div v-if="emailError" class="form-error">{{ emailError }}</div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- 邮箱授权弹窗 -->
    <Teleport to="body">
      <div v-if="showAuthModal" class="auth-modal-overlay" @click.self="!authLoading && handleAuthCancel()">
        <div class="auth-modal">
          <div class="auth-provider-header">
            <div class="auth-provider-icon" style="background: linear-gradient(135deg, #60a5fa, #a78bfa);">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <h3>邮箱授权登录</h3>
            <p class="auth-provider-desc">「计程·职道」申请获取以下权限</p>
          </div>

          <div class="auth-permissions">
            <div class="auth-perm-item">
              <div class="auth-perm-check">✓</div>
              <div class="auth-perm-info">
                <div class="auth-perm-name">获取邮箱</div>
                <div class="auth-perm-desc">用于识别您的账号身份</div>
              </div>
            </div>
            <div class="auth-perm-item">
              <div class="auth-perm-check">✓</div>
              <div class="auth-perm-info">
                <div class="auth-perm-name">获取昵称</div>
                <div class="auth-perm-desc">用于在系统中显示您的昵称</div>
              </div>
            </div>
            <div class="auth-perm-item">
              <div class="auth-perm-check">✓</div>
              <div class="auth-perm-info">
                <div class="auth-perm-name">登录状态</div>
                <div class="auth-perm-desc">保持您的登录状态</div>
              </div>
            </div>
          </div>

          <div class="auth-user-info">
            <div class="auth-user-avatar">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <div class="auth-user-tip">您即将使用邮箱账号登录</div>
          </div>

          <div class="auth-actions">
            <button class="auth-btn-cancel" :disabled="authLoading" @click="handleAuthCancel">
              拒绝
            </button>
            <button class="auth-btn-confirm" :disabled="authLoading" @click="handleAuthorize">
              <span v-if="authLoading" class="auth-spinner"></span>
              {{ authLoading ? '授权中...' : '同意授权' }}
            </button>
          </div>

          <div class="auth-security-tip">
            🔒 安全提示：本应用仅获取必要的用户信息，不会获取您的密码等敏感信息
          </div>
        </div>
      </div>
    </Teleport>
    <!-- 忘记密码弹窗 -->
    <Teleport to="body">
      <div v-if="showForgotPassword" class="email-modal-overlay" @click.self="closeForgotPassword">
        <div class="email-modal">
          <button class="modal-close" @click="closeForgotPassword">×</button>
          <h3>找回密码</h3>
          <p class="modal-desc">通过邮箱验证重置密码</p>

          <!-- 步骤1：输入邮箱 -->
          <div v-if="forgotStep === 1" class="email-form">
            <div class="form-group">
              <label>注册邮箱</label>
              <input
                type="email"
                v-model="forgotForm.email"
                placeholder="请输入注册时的邮箱地址"
                @input="forgotError = ''"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeForgotPassword">取消</button>
              <button type="button" class="btn-submit" @click="sendForgotCode">发送验证码</button>
            </div>
            <div v-if="forgotError" class="form-error">{{ forgotError }}</div>
            <div v-if="forgotSuccess" class="form-error" style="color:#00d4aa">{{ forgotSuccess }}</div>
          </div>

          <!-- 步骤2：验证码验证 -->
          <div v-if="forgotStep === 2" class="email-form">
            <div class="form-group">
              <label>验证码</label>
              <input
                type="text"
                v-model="forgotForm.code"
                placeholder="请输入6位验证码"
                maxlength="6"
                @input="forgotError = ''"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="forgotStep = 1">上一步</button>
              <button type="button" class="btn-submit" @click="verifyForgotCode">验证</button>
            </div>
            <div v-if="forgotError" class="form-error">{{ forgotError }}</div>
            <div v-if="forgotSuccess" class="form-error" style="color:#00d4aa">{{ forgotSuccess }}</div>
          </div>

          <!-- 步骤3：重置密码 -->
          <div v-if="forgotStep === 3" class="email-form">
            <div class="form-group">
              <label>新密码</label>
              <input
                type="password"
                v-model="forgotForm.newPassword"
                placeholder="至少6位字符"
                @input="forgotError = ''"
              />
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                v-model="forgotForm.confirmPassword"
                placeholder="再次输入新密码"
                @input="forgotError = ''"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="forgotStep = 2">上一步</button>
              <button type="button" class="btn-submit" :disabled="forgotForm.loading" @click="submitForgotPassword">
                {{ forgotForm.loading ? '提交中...' : '重置密码' }}
              </button>
            </div>
            <div v-if="forgotError" class="form-error">{{ forgotError }}</div>
          </div>

          <!-- 步骤4：完成 -->
          <div v-if="forgotStep === 4" class="email-form" style="text-align:center;padding:20px 0">
            <div style="font-size:48px;margin-bottom:12px">✅</div>
            <p style="color:#00d4aa;font-size:16px;margin-bottom:8px">{{ forgotSuccess }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import { loginWithEmail, loginAsGuest, registerWithEmail } from '@/utils/auth'
import { validateEmailFormat, resetPasswordByEmail } from '@/utils/userStore'
import { useGuestMode } from '@/composables/useGuestMode'

const { refreshAuthState } = useGuestMode()

const route = useRoute()
const showPassword = ref(false)
const loading = ref(false)
const bgCanvas = ref(null)
const globeContainer = ref(null)
const loginCard = ref(null)
const focusedInput = ref(null)

// 登录方式切换
const loginMethod = ref('password') // 'password' | 'phone'

// 表单验证状态
const usernameStatus = ref('') // '' | 'success' | 'error'
const passwordStatus = ref('')
const phoneStatus = ref('')
const codeStatus = ref('')

const usernameError = ref('')
const passwordError = ref('')
const phoneError = ref('')
const codeError = ref('')

// 手机验证码相关
const phoneForm = reactive({
  phone: '',
  code: ''
})
const codeCountdown = ref(0)
let countdownTimer = null
const isPhoneValid = ref(false)

const switchLoginMethod = (method) => {
  loginMethod.value = method
  clearValidation()
}

const clearValidation = () => {
  usernameStatus.value = ''
  passwordStatus.value = ''
  phoneStatus.value = ''
  codeStatus.value = ''
  usernameError.value = ''
  passwordError.value = ''
  phoneError.value = ''
  codeError.value = ''
}

// 验证用户名或邮箱
const validateUsername = () => {
  const input = form.username.trim()
  if (!input) {
    usernameStatus.value = ''
    usernameError.value = ''
    return false
  }
  
  // 如果包含@符号，按邮箱格式验证；否则按用户名验证（至少2位）
  if (input.includes('@')) {
    if (!validateEmailFormat(input)) {
      usernameStatus.value = 'error'
      usernameError.value = '请输入有效的邮箱地址'
      return false
    }
  } else {
    if (input.length < 2) {
      usernameStatus.value = 'error'
      usernameError.value = '用户名至少2个字符'
      return false
    }
  }
  
  usernameStatus.value = 'success'
  usernameError.value = ''
  return true
}

// 验证密码
const validatePassword = () => {
  const pwd = form.password
  if (!pwd) {
    passwordStatus.value = ''
    passwordError.value = ''
    return false
  }
  
  if (pwd.length < 6) {
    passwordStatus.value = 'error'
    passwordError.value = '密码长度至少6位'
    return false
  }
  
  passwordStatus.value = 'success'
  passwordError.value = ''
  return true
}

// 验证手机号
const validatePhone = () => {
  const phone = phoneForm.phone.trim()
  if (!phone) {
    phoneStatus.value = ''
    phoneError.value = ''
    isPhoneValid.value = false
    return false
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    phoneStatus.value = 'error'
    phoneError.value = '请输入有效的11位手机号'
    isPhoneValid.value = false
    return false
  }
  
  phoneStatus.value = 'success'
  phoneError.value = ''
  isPhoneValid.value = true
  return true
}

// 验证验证码
const validateCode = () => {
  const code = phoneForm.code.trim()
  if (!code) {
    codeStatus.value = ''
    codeError.value = ''
    return false
  }
  
  if (code.length !== 6) {
    codeStatus.value = 'error'
    codeError.value = '验证码为6位数字'
    return false
  }
  
  codeStatus.value = 'success'
  codeError.value = ''
  return true
}

// 验证码存储key前缀
const OTP_STORAGE_KEY = 'login_otp_'
const OTP_EXPIRE_TIME = 5 * 60 * 1000 // 5分钟过期
const OTP_RESEND_INTERVAL = 60 * 1000 // 60秒重发间隔

// 生成验证码
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 保存验证码到localStorage
const saveOtp = (phone, code) => {
  const key = OTP_STORAGE_KEY + phone
  const data = {
    code: code,
    createTime: Date.now(),
    expireTime: Date.now() + OTP_EXPIRE_TIME
  }
  localStorage.setItem(key, JSON.stringify(data))
}

// 获取验证码
const getOtp = (phone) => {
  const key = OTP_STORAGE_KEY + phone
  const data = localStorage.getItem(key)
  if (!data) return null
  
  try {
    const otpData = JSON.parse(data)
    if (Date.now() > otpData.expireTime) {
      localStorage.removeItem(key)
      return null
    }
    return otpData
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

// 验证验证码
const verifyOtp = (phone, code) => {
  const otpData = getOtp(phone)
  if (!otpData) {
    return { valid: false, message: '验证码已过期或不存在，请重新获取' }
  }
  if (otpData.code !== code) {
    return { valid: false, message: '验证码不正确' }
  }
  return { valid: true }
}

// 清除验证码
const clearOtp = (phone) => {
  const key = OTP_STORAGE_KEY + phone
  localStorage.removeItem(key)
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!isPhoneValid.value) {
    validatePhone()
    return
  }
  
  const phone = phoneForm.phone
  
  // 检查重发间隔
  const existingOtp = getOtp(phone)
  if (existingOtp) {
    const elapsed = Date.now() - existingOtp.createTime
    if (elapsed < OTP_RESEND_INTERVAL) {
      const remaining = Math.ceil((OTP_RESEND_INTERVAL - elapsed) / 1000)
      phoneError.value = `请等待 ${remaining} 秒后再重新获取`
      setTimeout(() => { phoneError.value = '' }, 3000)
      return
    }
  }
  
  // 生成并保存验证码
  const code = generateOtp()
  saveOtp(phone, code)
  
  // 在控制台输出验证码（演示模式）
  console.log(`[验证码] 手机号: ${phone}, 验证码: ${code}`)
  
  codeError.value = ''
  
  // 开始倒计时
  codeCountdown.value = 60
  countdownTimer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
  
  // 显示验证码（演示模式）
  phoneError.value = `验证码已发送：${code}（5分钟内有效）`
  phoneForm.code = code // 自动填入验证码，方便测试
  setTimeout(() => { phoneError.value = '' }, 8000)
}

// 验证表单
const validateForm = () => {
  if (loginMethod.value === 'password') {
    const isUserValid = validateUsername()
    const isPwdValid = validatePassword()
    return isUserValid && isPwdValid
  } else {
    const isPhValid = validatePhone()
    const isCdValid = validateCode()
    return isPhValid && isCdValid
  }
}

const showEmailModal = ref(false)
const emailForm = reactive({
  email: '',
  password: '',
  loading: false
})
const emailError = ref('')

const showRegister = ref(false)
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  loading: false
})
const registerError = ref('')

const showAuthModal = ref(false)
const authLoading = ref(false)

const showForgotPassword = ref(false)
const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
  loading: false
})
const forgotError = ref('')
const forgotSuccess = ref('')
const forgotStep = ref(1) // 1=输入邮箱, 2=验证身份, 3=重置密码, 4=完成

let bgAnimationId = null
let globeAnimationId = null
let mouseX = 0
let mouseY = 0

const REMEMBER_KEY = 'remembered_login'

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const loadRememberedLogin = () => {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      form.username = data.username || ''
      form.password = data.password || ''
      form.remember = true
    }
  } catch {
    form.remember = false
  }
}

const saveRememberedLogin = () => {
  if (form.remember) {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({
      username: form.username,
      password: form.password
    }))
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

const careerTags = ref([
  { name: '前端开发', x: 10, y: 15, delay: 0, color: '#4a9eff' },
  { name: 'AI工程师', x: 85, y: 20, delay: 0.3, color: '#00d4aa' },
  { name: 'Java', x: 20, y: 40, delay: 0.6, color: '#ff6b6b' },
  { name: '数据分析师', x: 75, y: 50, delay: 0.9, color: '#a855f7' },
  { name: '产品经理', x: 15, y: 65, delay: 1.2, color: '#f59e0b' },
  { name: 'Python', x: 80, y: 75, delay: 1.5, color: '#3b82f6' },
  { name: '全栈开发', x: 30, y: 85, delay: 1.8, color: '#06b6d4' },
  { name: '算法', x: 70, y: 30, delay: 0.5, color: '#8b5cf6' },
])

const networkNodes = ref([
  { id: 1, x: 50, y: 80, r: 3, delay: 0 },
  { id: 2, x: 150, y: 120, r: 4, delay: 0.2 },
  { id: 3, x: 250, y: 60, r: 3, delay: 0.4 },
  { id: 4, x: 320, y: 140, r: 4, delay: 0.6 },
  { id: 5, x: 80, y: 200, r: 3, delay: 0.8 },
  { id: 6, x: 200, y: 220, r: 5, delay: 1 },
  { id: 7, x: 300, y: 200, r: 3, delay: 1.2 },
  { id: 8, x: 100, y: 320, r: 4, delay: 1.4 },
  { id: 9, x: 250, y: 340, r: 3, delay: 1.6 },
  { id: 10, x: 350, y: 280, r: 4, delay: 1.8 },
  { id: 11, x: 60, y: 400, r: 3, delay: 2 },
  { id: 12, x: 180, y: 420, r: 4, delay: 2.2 },
  { id: 13, x: 300, y: 400, r: 3, delay: 2.4 },
])

const networkLinks = ref([
  { id: 1, x1: 50, y1: 80, x2: 150, y2: 120, delay: 0 },
  { id: 2, x1: 150, y1: 120, x2: 250, y2: 60, delay: 0.3 },
  { id: 3, x1: 250, y1: 60, x2: 320, y2: 140, delay: 0.6 },
  { id: 4, x1: 150, y1: 120, x2: 200, y2: 220, delay: 0.9 },
  { id: 5, x1: 80, y1: 200, x2: 200, y2: 220, delay: 1.2 },
  { id: 6, x1: 200, y1: 220, x2: 300, y2: 200, delay: 1.5 },
  { id: 7, x1: 320, y1: 140, x2: 300, y2: 200, delay: 1.8 },
  { id: 8, x1: 80, y1: 200, x2: 100, y2: 320, delay: 2.1 },
  { id: 9, x1: 200, y1: 220, x2: 100, y2: 320, delay: 2.4 },
  { id: 10, x1: 200, y1: 220, x2: 250, y2: 340, delay: 2.7 },
  { id: 11, x1: 300, y1: 200, x2: 350, y2: 280, delay: 3 },
  { id: 12, x1: 100, y1: 320, x2: 180, y2: 420, delay: 3.3 },
  { id: 13, x1: 250, y1: 340, x2: 180, y2: 420, delay: 3.6 },
  { id: 14, x1: 250, y1: 340, x2: 300, y2: 400, delay: 3.9 },
  { id: 15, x1: 60, y1: 400, x2: 180, y2: 420, delay: 4.2 },
])

const handleLogin = async () => {
  // 实时验证
  const isValid = validateForm()
  
  if (!isValid) {
    // 显示错误提示
    if (loginMethod.value === 'password') {
      if (!form.username) {
        usernameStatus.value = 'error'
        usernameError.value = '请输入用户名或邮箱'
      }
      if (!form.password) {
        passwordStatus.value = 'error'
        passwordError.value = '请输入密码'
      }
    } else {
      if (!phoneForm.phone) {
        phoneStatus.value = 'error'
        phoneError.value = '请输入手机号'
      }
      if (!phoneForm.code) {
        codeStatus.value = 'error'
        codeError.value = '请输入验证码'
      }
    }
    return
  }
  
  // 手机验证码登录验证
  if (loginMethod.value === 'phone') {
    const verifyResult = verifyOtp(phoneForm.phone, phoneForm.code)
    if (!verifyResult.valid) {
      codeStatus.value = 'error'
      codeError.value = verifyResult.message
      return
    }
  }
  
  loading.value = true
  
  // 模拟加载效果
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  try {
    if (loginMethod.value === 'phone') {
      // 手机验证码登录成功后清除验证码（一次性使用）
      clearOtp(phoneForm.phone)
      
      // 手机验证码登录
      const loginName = '手机用户_' + phoneForm.phone.slice(-4)
      loginWithEmail(loginName, phoneForm.phone)
    } else {
      // 账号密码登录
      await loginWithEmail(form.username, form.password)
    }
    refreshAuthState()
    const redirect = route.query.redirect
    window.location.href = redirect || '/dashboard'
  } catch (e) {
    if (loginMethod.value === 'phone') {
      phoneError.value = '登录失败，请重试'
    } else {
      usernameError.value = '登录失败：账号或密码错误'
      passwordStatus.value = 'error'
    }
  } finally {
    loading.value = false
  }
}

const handleGuest = () => {
  loginAsGuest()
  refreshAuthState()
  window.location.href = '/dashboard'
}

const handleEmailLogin = () => {
  emailError.value = ''
  emailForm.email = ''
  emailForm.password = ''
  showAuthModal.value = true
}

const handleAuthorize = async () => {
  authLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    showAuthModal.value = false
    showEmailModal.value = true
  } catch {
    showAuthModal.value = false
    authLoading.value = false
  } finally {
    authLoading.value = false
  }
}

const handleAuthCancel = () => {
  showAuthModal.value = false
}

const submitEmailLogin = async () => {
  if (!emailForm.email || !emailForm.password) {
    emailError.value = '请填写邮箱和密码'
    return
  }

  if (!validateEmailFormat(emailForm.email)) {
    emailError.value = '请输入有效的邮箱地址'
    return
  }

  if (emailForm.password.length < 6) {
    emailError.value = '密码长度不能少于6位'
    return
  }

  emailForm.loading = true
  emailError.value = ''

  try {
    await loginWithEmail(emailForm.email, emailForm.password)
    refreshAuthState()
    showEmailModal.value = false
    const redirect = route.query.redirect
    window.location.href = redirect || '/dashboard'
  } catch (e) {
    emailError.value = e.message || '登录失败：账号或密码错误'
  } finally {
    emailForm.loading = false
  }
}

const toggleRegister = () => {
  if (showRegister.value) {
    showRegister.value = false
  } else {
    registerError.value = ''
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    showRegister.value = true
  }
}

const openForgotPassword = () => {
  forgotForm.email = ''
  forgotForm.code = ''
  forgotForm.newPassword = ''
  forgotForm.confirmPassword = ''
  forgotForm.loading = false
  forgotError.value = ''
  forgotSuccess.value = ''
  forgotStep.value = 1
  showForgotPassword.value = true
}

const sendForgotCode = async () => {
  if (!forgotForm.email || !validateEmailFormat(forgotForm.email)) {
    forgotError.value = '请输入有效的邮箱地址'
    return
  }
  forgotError.value = ''
  const code = generateOtp()
  saveOtp(forgotForm.email, code)
  forgotForm.code = code
  forgotSuccess.value = `验证码已发送至 ${forgotForm.email}：${code}（5分钟内有效）`
  forgotStep.value = 2
}

const verifyForgotCode = () => {
  const result = verifyOtp(forgotForm.email, forgotForm.code)
  if (!result.valid) {
    forgotError.value = result.message
    return
  }
  forgotError.value = ''
  forgotStep.value = 3
}

const submitForgotPassword = async () => {
  if (forgotForm.newPassword.length < 6) {
    forgotError.value = '密码长度至少6位'
    return
  }
  if (forgotForm.newPassword !== forgotForm.confirmPassword) {
    forgotError.value = '两次输入的密码不一致'
    return
  }
  forgotError.value = ''
  forgotForm.loading = true
  try {
    await resetPasswordByEmail(forgotForm.email, forgotForm.newPassword)
    clearOtp(forgotForm.email)
    forgotStep.value = 4
    forgotSuccess.value = '密码重置成功！即将跳转至登录页面...'
    setTimeout(() => {
      showForgotPassword.value = false
    }, 2000)
  } catch (e) {
    forgotError.value = e.message || '重置失败，请重试'
  } finally {
    forgotForm.loading = false
  }
}

const closeForgotPassword = () => {
  showForgotPassword.value = false
}

const submitRegister = async () => {
  if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
    registerError.value = '请填写完整信息'
    return
  }

  if (!validateEmailFormat(registerForm.email)) {
    registerError.value = '邮箱格式不正确'
    return
  }

  if (registerForm.password.length < 6) {
    registerError.value = '密码长度不能少于6位'
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = '两次输入的密码不一致'
    return
  }

  registerForm.loading = true
  registerError.value = ''

  try {
    await registerWithEmail(registerForm.email, registerForm.password, registerForm.name)
    showRegister.value = false
    const redirect = route.query.redirect
    window.location.href = redirect || '/dashboard'
  } catch (e) {
    registerError.value = e.message || '注册失败'
  } finally {
    registerForm.loading = false
  }
}

const handleCardMouseMove = (e) => {
  if (!loginCard.value) return
  const rect = loginCard.value.getBoundingClientRect()
  mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 20
  mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 20
  loginCard.value.style.transform = `perspective(1000px) rotateY(${mouseX * 0.5}deg) rotateX(${-mouseY * 0.5}deg) scale(1.02)`
}

const handleCardMouseLeave = () => {
  if (!loginCard.value) return
  loginCard.value.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)'
  mouseX = 0
  mouseY = 0
}

const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const stars = []
  for (let i = 0; i < 1200; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.7 + 0.3,
      twinkleSpeed: 0.001 + Math.random() * 0.008,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85 ? 'blue' : (Math.random() > 0.5 ? 'white' : 'purple')
    })
  }

  const dataNodes = []
  for (let i = 0; i < 30; i++) {
    dataNodes.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1.5,
      pulseSpeed: 0.006 + Math.random() * 0.012,
      pulseOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.0002,
      vy: (Math.random() - 0.5) * 0.0002,
      color: Math.random() > 0.5 ? '#60a5fa' : '#a78bfa'
    })
  }

  const shootingStars = []
  const createShootingStar = () => {
    if (shootingStars.length < 5) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        length: Math.random() * 180 + 100,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        life: 1
      })
    }
  }

  const nebulae = []
  for (let i = 0; i < 5; i++) {
    nebulae.push({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 150 + 100,
      opacity: Math.random() * 0.05 + 0.02,
      color: ['rgba(96, 165, 250, ', 'rgba(167, 139, 250, ', 'rgba(59, 130, 246, '][Math.floor(Math.random() * 3)]
    })
  }

  const animate = () => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a0e27')
    gradient.addColorStop(0.2, '#1a1a4e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(0.8, '#0d1b3e')
    gradient.addColorStop(1, '#0a0e27')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width * 0.3
    const centerY = canvas.height * 0.5
    const radialGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 500)
    radialGlow.addColorStop(0, 'rgba(96, 165, 250, 0.08)')
    radialGlow.addColorStop(0.4, 'rgba(167, 139, 250, 0.04)')
    radialGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = radialGlow
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    nebulae.forEach(nebula => {
      const x = nebula.x * canvas.width
      const y = nebula.y * canvas.height
      const nebulaGlow = ctx.createRadialGradient(x, y, 0, x, y, nebula.radius)
      nebulaGlow.addColorStop(0, nebula.color + nebula.opacity + ')')
      nebulaGlow.addColorStop(0.5, nebula.color + (nebula.opacity * 0.3) + ')')
      nebulaGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = nebulaGlow
      ctx.beginPath()
      ctx.arc(x, y, nebula.radius, 0, Math.PI * 2)
      ctx.fill()
    })

    stars.forEach(s => {
      s.brightness += s.twinkleSpeed * Math.sin(Date.now() * s.twinkleSpeed * 5 + s.twinkleOffset)
      if (s.brightness < 0.2) s.brightness = 0.2
      if (s.brightness > 1) s.brightness = 1

      const x = s.x * canvas.width
      const y = s.y * canvas.height

      if (s.r > 0.8) {
        const glowColor = s.color === 'blue' ? 'rgba(96, 165, 250, ' : (s.color === 'purple' ? 'rgba(167, 139, 250, ' : 'rgba(200, 220, 255, ')
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, s.r * 4)
        glowGradient.addColorStop(0, glowColor + s.brightness * 0.2 + ')')
        glowGradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, s.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()
      }

      const starColor = s.color === 'blue' ? 'rgba(96, 165, 250, ' : (s.color === 'purple' ? 'rgba(167, 139, 250, ' : 'rgba(220, 230, 255, ')
      ctx.beginPath()
      ctx.arc(x, y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = starColor + s.brightness + ')'
      ctx.fill()
    })

    const connectableStars = stars.filter(s => s.r > 1.0).slice(0, 45)
    connectableStars.forEach((s1, i) => {
      connectableStars.forEach((s2, j) => {
        if (i >= j) return
        const x1 = s1.x * canvas.width
        const y1 = s1.y * canvas.height
        const x2 = s2.x * canvas.width
        const y2 = s2.y * canvas.height
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

        if (dist < 150) {
          const opacity = (150 - dist) / 150 * 0.08
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`
          ctx.lineWidth = 0.3
          ctx.stroke()
        }
      })
    })

    if (Math.random() > 0.93) {
      createShootingStar()
    }

    shootingStars.forEach((star, index) => {
      star.x += Math.cos(star.angle) * star.speed
      star.y += Math.sin(star.angle) * star.speed
      star.life -= star.speed * 0.003
      star.opacity = Math.max(0, star.life)

      if (star.life <= 0 || star.x > canvas.width || star.y > canvas.height) {
        shootingStars.splice(index, 1)
        return
      }

      const tailX = star.x - Math.cos(star.angle) * star.length
      const tailY = star.y - Math.sin(star.angle) * star.length

      const starGradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y)
      starGradient.addColorStop(0, 'transparent')
      starGradient.addColorStop(0.5, `rgba(96, 165, 250, ${star.opacity * 0.2})`)
      starGradient.addColorStop(0.7, `rgba(167, 139, 250, ${star.opacity * 0.4})`)
      starGradient.addColorStop(0.9, `rgba(220, 240, 255, ${star.opacity * 0.8})`)
      starGradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`)

      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(star.x, star.y)
      ctx.strokeStyle = starGradient
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()

      const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 5 * star.opacity)
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
      headGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = headGlow
      ctx.beginPath()
      ctx.arc(star.x, star.y, 5 * star.opacity, 0, Math.PI * 2)
      ctx.fill()
    })

    dataNodes.forEach(node => {
      node.x += node.vx
      node.y += node.vy

      if (node.x < 0) node.x = 1
      if (node.x > 1) node.x = 0
      if (node.y < 0) node.y = 1
      if (node.y > 1) node.y = 0

      const pulseScale = 1 + Math.sin(Date.now() * node.pulseSpeed + node.pulseOffset) * 0.35
      const x = node.x * canvas.width
      const y = node.y * canvas.height

      const glow = ctx.createRadialGradient(x, y, 0, x, y, node.size * 10 * pulseScale)
      glow.addColorStop(0, node.color === '#60a5fa' ? 'rgba(96, 165, 250, 0.18)' : 'rgba(167, 139, 250, 0.18)')
      glow.addColorStop(0.5, node.color === '#60a5fa' ? 'rgba(96, 165, 250, 0.04)' : 'rgba(167, 139, 250, 0.04)')
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, node.size * 10 * pulseScale, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, node.size * pulseScale)
      nodeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      nodeGradient.addColorStop(0.3, node.color)
      nodeGradient.addColorStop(1, node.color + '80')
      ctx.beginPath()
      ctx.arc(x, y, node.size * pulseScale, 0, Math.PI * 2)
      ctx.fillStyle = nodeGradient
      ctx.fill()
    })

    dataNodes.forEach((node1, i) => {
      dataNodes.forEach((node2, j) => {
        if (i >= j) return
        const x1 = node1.x * canvas.width
        const y1 = node1.y * canvas.height
        const x2 = node2.x * canvas.width
        const y2 = node2.y * canvas.height
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

        if (dist < 250) {
          const opacity = (250 - dist) / 250 * 0.28
          const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2)
          const color1 = node1.color === '#60a5fa' ? 'rgba(96, 165, 250, ' : 'rgba(167, 139, 250, '
          const color2 = node2.color === '#60a5fa' ? 'rgba(96, 165, 250, ' : 'rgba(167, 139, 250, '
          lineGradient.addColorStop(0, color1 + opacity + ')')
          lineGradient.addColorStop(1, color2 + opacity + ')')
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = lineGradient
          ctx.lineWidth = 1.3
          ctx.stroke()
        }
      })
    })

    bgAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

function createGlowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const cx = size / 2, cy = size / 2, r = size / 2
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.2, 'rgba(180,230,255,0.9)')
  grad.addColorStop(0.5, 'rgba(100,200,255,0.4)')
  grad.addColorStop(1, 'rgba(0,150,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
}

const initGlobe = () => {
  if (!globeContainer.value) return

  const container = globeContainer.value
  const canvas = document.createElement('canvas')
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'block'
  canvas.style.background = 'transparent'
  container.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  let width = 0, height = 0

  const stars = []
  const orbiters = []
  const flows = []

  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      size: 0.3 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.8
    })
  }

  const N_SURFACE = 1400
  const surfaceParticles = []
  const fibPhi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N_SURFACE; i++) {
    const y = 1 - (i / (N_SURFACE - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = fibPhi * i
    surfaceParticles.push({
      sx: Math.cos(theta) * r,
      sy: y,
      sz: Math.sin(theta) * r
    })
  }

  const N_INNER = 1100
  const innerParticles = []
  const innerPalette = [
    'rgba(0, 220, 255,',
    'rgba(180, 100, 255,',
    'rgba(255, 200, 50,',
    'rgba(100, 255, 180,',
    'rgba(255, 120, 180,'
  ]
  for (let i = 0; i < N_INNER; i++) {
    let ix, iy, iz
    do {
      ix = Math.random() * 2 - 1
      iy = Math.random() * 2 - 1
      iz = Math.random() * 2 - 1
    } while (ix * ix + iy * iy + iz * iz > 1)
    const pi = Math.floor(Math.random() * innerPalette.length)
    innerParticles.push({
      sx: ix, sy: iy, sz: iz,
      color: innerPalette[pi],
      size: 0.4 + Math.random() * 1.0
    })
  }

  const featureIndices = new Set()
  const featureStep = Math.floor(N_SURFACE / 16)
  const featureNodes = []
  for (let i = 0; i < 16; i++) {
    const idx = i * featureStep + Math.floor(featureStep / 2)
    if (idx < N_SURFACE) {
      featureIndices.add(idx)
      featureNodes.push({ ...surfaceParticles[idx], idx })
    }
  }

  const N_NEIGHBORS = 5
  const neighborIndices = []
  for (let i = 0; i < N_SURFACE; i++) {
    const dists = []
    for (let j = 0; j < N_SURFACE; j++) {
      if (i === j) continue
      const dx = surfaceParticles[i].sx - surfaceParticles[j].sx
      const dy = surfaceParticles[i].sy - surfaceParticles[j].sy
      const dz = surfaceParticles[i].sz - surfaceParticles[j].sz
      dists.push({ idx: j, d: dx * dx + dy * dy + dz * dz })
    }
    dists.sort((a, b) => a.d - b.d)
    neighborIndices.push(dists.slice(0, N_NEIGHBORS).map(n => n.idx))
  }

  for (let i = 0; i < 70; i++) {
    orbiters.push({
      orbitR: 1.15 + Math.random() * 0.55,
      angle: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.006,
      tilt: (Math.random() - 0.5) * 0.3,
      size: 1.5 + Math.random() * 2.5,
      brightness: 0.3 + Math.random() * 0.6,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      tail: Math.random() < 0.18
    })
  }

  for (let i = 0; i < 40; i++) {
    orbiters.push({
      orbitR: 1.2 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      speed: 0.0015 + Math.random() * 0.005,
      tilt: Math.PI / 2 + (Math.random() - 0.5) * 0.3,
      size: 1.5 + Math.random() * 2.2,
      brightness: 0.25 + Math.random() * 0.55,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      tail: Math.random() < 0.15
    })
  }

  const N_PULSES = 12
  for (let i = 0; i < N_PULSES; i++) {
    flows.push({
      active: false,
      pIdx: 0,
      nIdx: 0,
      progress: 0,
      speed: 0.005 + Math.random() * 0.008,
      cooldown: Math.random() * 3,
      size: 3 + Math.random() * 2
    })
  }

  const resize = () => {
    const rect = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = rect.height
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const cx = () => width / 2
  const cy = () => height / 2
  const getR = () => Math.min(width, height) * 0.38

  let globalTime = 0

  const render = (t) => {
    const R = getR()

    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(cx(), cy())

    stars.forEach(s => {
      const tw = 0.25 + 0.75 * Math.sin(t * s.speed + s.phase)
      ctx.beginPath()
      ctx.arc(s.x * R * 3, s.y * R * 3, s.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200, 215, 255, ${tw * 0.4})`
      ctx.fill()
    })

    const atmos = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.5)
    atmos.addColorStop(0, 'rgba(140, 180, 255, 0.12)')
    atmos.addColorStop(0.4, 'rgba(100, 150, 230, 0.06)')
    atmos.addColorStop(0.7, 'rgba(80, 120, 200, 0.02)')
    atmos.addColorStop(1, 'rgba(30, 50, 100, 0)')
    ctx.fillStyle = atmos
    ctx.beginPath()
    ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2)
    ctx.fill()

    const cosY = Math.cos(t * 0.1)
    const sinY = Math.sin(t * 0.1)
    const cosX = Math.cos(t * 0.05)
    const sinX = Math.sin(t * 0.05)

    const projSurface = new Array(N_SURFACE)
    for (let i = 0; i < N_SURFACE; i++) {
      const p = surfaceParticles[i]
      const x1 = p.sx * cosY + p.sz * sinY
      const z1 = -p.sx * sinY + p.sz * cosY
      const y1 = p.sy * cosX - z1 * sinX
      const z2 = p.sy * sinX + z1 * cosX
      const scale = 0.85 + z2 * 0.15
      projSurface[i] = { x: x1 * R * scale, y: y1 * R * scale, z: z2, scale }
    }

    const projInner = new Array(N_INNER)
    for (let i = 0; i < N_INNER; i++) {
      const p = innerParticles[i]
      const x1 = p.sx * cosY + p.sz * sinY
      const z1 = -p.sx * sinY + p.sz * cosY
      const y1 = p.sy * cosX - z1 * sinX
      const z2 = p.sy * sinX + z1 * cosX
      const scale = 0.5 + z2 * 0.5
      projInner[i] = { x: x1 * R * scale, y: y1 * R * scale, z: z2, scale }
    }

    projInner.forEach((p, i) => {
      if (p.z < -0.3) return
      const depthFactor = 0.3 + p.z * 0.7
      const ip = innerParticles[i]
      const size = ip.size * p.scale
      const alpha = depthFactor * 0.8

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3)
      g.addColorStop(0, ip.color + (alpha * 0.5) + ')')
      g.addColorStop(0.5, ip.color + (alpha * 0.15) + ')')
      g.addColorStop(1, ip.color + '0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = ip.color + alpha + ')'
      ctx.fill()
    })

    ctx.lineWidth = 0.4
    for (let i = 0; i < N_SURFACE; i++) {
      const a = projSurface[i]
      if (a.z < -0.2) continue
      const neighbors = neighborIndices[i]
      for (let n = 0; n < neighbors.length; n++) {
        const j = neighbors[n]
        if (j <= i) continue
        const b = projSurface[j]
        if (b.z < -0.2) continue
        const avgZ = (a.z + b.z) * 0.5
        const depthFactor = 0.2 + avgZ * 0.8
        const alpha = 0.2 * Math.max(0, depthFactor)

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(140, 180, 230, ${alpha})`
        ctx.stroke()
      }
    }

    projSurface.forEach((p, i) => {
      if (p.z < -0.2) return
      if (featureIndices.has(i)) return
      const depthFactor = 0.3 + p.z * 0.7
      const size = (1.4 + Math.sin(i * 2.3) * 0.3 + Math.cos(i * 1.7) * 0.2) * p.scale
      const pulse = 0.7 + 0.3 * Math.sin(t * 1.0 + i * 0.3)
      const brightness = depthFactor * pulse

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3)
      g.addColorStop(0, `rgba(220, 235, 255, ${brightness * 0.5})`)
      g.addColorStop(0.5, `rgba(150, 185, 235, ${brightness * 0.15})`)
      g.addColorStop(1, 'rgba(100, 140, 220, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(250, 252, 255, ${brightness})`
      ctx.fill()
    })

    featureNodes.forEach(fn => {
      const p = projSurface[fn.idx]
      if (p.z < -0.2) return
      const depthFactor = 0.3 + p.z * 0.7
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + fn.sx * 2 + fn.sz * 3)
      const size = 2.8 * p.scale
      const brightness = depthFactor * pulse

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 6)
      g.addColorStop(0, `rgba(180, 215, 255, ${brightness * 0.8})`)
      g.addColorStop(0.4, `rgba(120, 170, 230, ${brightness * 0.3})`)
      g.addColorStop(1, 'rgba(80, 130, 200, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 0.9, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(240, 248, 255, ${brightness})`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 2.0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(180, 220, 255, ${brightness * 0.35})`
      ctx.lineWidth = 0.8
      ctx.stroke()
    })

    flows.forEach(f => {
      if (!f.active) {
        f.cooldown -= 0.016
        if (f.cooldown <= 0) {
          f.pIdx = Math.floor(Math.random() * N_SURFACE)
          f.nIdx = Math.floor(Math.random() * N_NEIGHBORS)
          const ni = neighborIndices[f.pIdx]
          if (ni && ni[f.nIdx] !== undefined) {
            const p1 = projSurface[f.pIdx]
            const p2 = projSurface[ni[f.nIdx]]
            if ((p1.z + p2.z) * 0.5 > -0.1) {
              f.active = true
              f.progress = 0
              f.cooldown = 2 + Math.random() * 4
            } else {
              f.cooldown = 0.5
            }
          } else {
            f.cooldown = 0.5
          }
        }
      } else {
        f.progress += f.speed
        if (f.progress >= 1) {
          f.active = false
        } else {
          const ni = neighborIndices[f.pIdx]
          if (ni && ni[f.nIdx] !== undefined) {
            const p1 = projSurface[f.pIdx]
            const p2 = projSurface[ni[f.nIdx]]
            if (p1 && p2) {
              const fx = p1.x + (p2.x - p1.x) * f.progress
              const fy = p1.y + (p2.y - p1.y) * f.progress

              const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8)
              g.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
              g.addColorStop(0.3, 'rgba(180, 220, 255, 0.6)')
              g.addColorStop(1, 'rgba(100, 160, 240, 0)')
              ctx.fillStyle = g
              ctx.beginPath()
              ctx.arc(fx, fy, 8, 0, Math.PI * 2)
              ctx.fill()

              ctx.beginPath()
              ctx.arc(fx, fy, 2.5, 0, Math.PI * 2)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
              ctx.fill()
            }
          }
        }
      }
    })

    orbiters.forEach(o => {
      o.angle += o.speed
      const orbitR = R * o.orbitR
      const px = Math.cos(o.angle) * orbitR
      const py = Math.sin(o.angle) * orbitR * 0.92
      const ry = px * Math.sin(o.tilt) + py * Math.cos(o.tilt)
      const rx = px * Math.cos(o.tilt) - py * Math.sin(o.tilt)

      const ox = rx * cosY - ry * sinY
      const oy = rx * sinY + ry * cosY
      const finalX = ox * cosX - oy * sinX
      const finalY = ox * sinX + oy * cosX

      const twinkle = 0.4 + 0.6 * Math.sin(t * o.twinkleSpeed + o.twinkle)
      const b = o.brightness * twinkle

      if (o.tail) {
        const tailAngle = o.angle - 0.04
        const tx = Math.cos(tailAngle) * orbitR * Math.cos(o.tilt) - Math.sin(tailAngle) * orbitR * 0.92 * Math.sin(o.tilt)
        const ty = Math.cos(tailAngle) * orbitR * Math.sin(o.tilt) + Math.sin(tailAngle) * orbitR * 0.92 * Math.cos(o.tilt)
        const tx2 = tx * cosY - ty * sinY
        const ty2 = tx * sinY + ty * cosY
        const tfx = tx2 * cosX - ty2 * sinX
        const tfy = tx2 * sinX + ty2 * cosX

        const grad = ctx.createLinearGradient(finalX, finalY, tfx, tfy)
        grad.addColorStop(0, `rgba(200, 220, 255, ${b * 0.8})`)
        grad.addColorStop(1, 'rgba(120, 160, 240, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = o.size * 1.2
        ctx.beginPath()
        ctx.moveTo(finalX, finalY)
        ctx.lineTo(tfx, tfy)
        ctx.stroke()
      }

      const g = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, o.size * 4)
      g.addColorStop(0, `rgba(200, 225, 255, ${b * 0.7})`)
      g.addColorStop(0.4, `rgba(140, 180, 235, ${b * 0.25})`)
      g.addColorStop(1, 'rgba(100, 140, 220, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(finalX, finalY, o.size * 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(finalX, finalY, o.size * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(245, 248, 255, ${b})`
      ctx.fill()
    })

    {
      const ringR = R * 1.28
      ctx.strokeStyle = 'rgba(140, 175, 225, 0.06)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.ellipse(0, 0, ringR, ringR * 0.92, -0.15, 0, Math.PI * 2)
      ctx.stroke()
    }
    {
      const ringR = R * 1.48
      ctx.strokeStyle = 'rgba(140, 175, 225, 0.04)'
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.ellipse(0, 0, ringR, ringR * 0.93, 0.1, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()
  }

  const animate = () => {
    globalTime += 0.016
    render(globalTime)
    globeAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  initBackground()
  setTimeout(initGlobe, 100)
  loadRememberedLogin()
})

onUnmounted(() => {
  if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
  if (globeAnimationId) cancelAnimationFrame(globeAnimationId)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.login-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(8, 5, 35, 0.85);
  z-index: -2;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.corner-decoration {
  position: fixed;
  width: 60px;
  height: 60px;
  z-index: 1;
  pointer-events: none;
}

.corner-decoration::before,
.corner-decoration::after {
  content: '';
  position: absolute;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(129, 140, 248, 0.2));
}

.corner-decoration.top-left {
  top: 30px;
  left: 30px;
}

.corner-decoration.top-left::before {
  top: 0;
  left: 0;
  width: 2px;
  height: 30px;
}

.corner-decoration.top-left::after {
  top: 0;
  left: 0;
  width: 30px;
  height: 2px;
}

.corner-decoration.top-right {
  top: 30px;
  right: 30px;
}

.corner-decoration.top-right::before {
  top: 0;
  right: 0;
  width: 2px;
  height: 30px;
}

.corner-decoration.top-right::after {
  top: 0;
  right: 0;
  width: 30px;
  height: 2px;
}

.corner-decoration.bottom-left {
  bottom: 30px;
  left: 30px;
}

.corner-decoration.bottom-left::before {
  bottom: 0;
  left: 0;
  width: 2px;
  height: 30px;
}

.corner-decoration.bottom-left::after {
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
}

.corner-decoration.bottom-right {
  bottom: 30px;
  right: 30px;
}

.corner-decoration.bottom-right::before {
  bottom: 0;
  right: 0;
  width: 2px;
  height: 30px;
}

.corner-decoration.bottom-right::after {
  bottom: 0;
  right: 0;
  width: 30px;
  height: 2px;
}

.light-rays {
  position: fixed;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  pointer-events: none;
  z-index: 1;
}

.ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 200px;
  background: linear-gradient(180deg, rgba(96, 165, 250, 0.15), transparent);
  transform-origin: bottom center;
  animation: rayPulse 4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.3s);
}

.ray:nth-child(odd) {
  background: linear-gradient(180deg, rgba(167, 139, 250, 0.12), transparent);
}

@keyframes rayPulse {
  0%, 100% { opacity: 0.3; transform: rotate(calc(var(--i) * 45deg)) translateY(-50px); }
  50% { opacity: 0.6; transform: rotate(calc(var(--i) * 45deg)) translateY(-80px); }
}

.hex-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.03;
  background-image: 
    linear-gradient(rgba(96, 165, 250, 0.5) 1px, transparent 1px),
    linear-gradient(60deg, rgba(96, 165, 250, 0.5) 1px, transparent 1px),
    linear-gradient(-60deg, rgba(96, 165, 250, 0.5) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: hexMove 20s linear infinite;
}

@keyframes hexMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

.circuit-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h30v10h-30zM0 40h20v10h-20zM0 60h40v10h-40zM0 80h25v10h-25zM50 20h30v10h-30zM50 40h15v10h-15zM50 60h20v10h-20zM50 80h35v10h-35zM20 0v30h10v-30zM40 0v20h10v-20zM60 0v40h10v-40zM80 0v25h10v-25zM20 50v30h10v-30zM40 50v15h10v-15zM60 50v20h10v-20zM80 50v35h10v-35z' stroke='%2360a5fa' stroke-width='0.5' fill='none'/%3E%3C/svg%3E");
  animation: circuitMove 30s linear infinite;
}

@keyframes circuitMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 100px); }
}

.data-charts {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.mini-chart {
  position: absolute;
  opacity: 0.15;
}

.chart-bars {
  bottom: 100px;
  left: 100px;
  width: 250px;
  height: 90px;
  animation: chartFloat 8s ease-in-out infinite;
}

.chart-radar {
  top: 180px;
  right: 120px;
  width: 100px;
  height: 100px;
  animation: chartFloat 10s ease-in-out infinite 2s;
}

.chart-circle {
  bottom: 150px;
  right: 100px;
  width: 70px;
  height: 70px;
  animation: chartFloat 7s ease-in-out infinite 1s;
}

.chart-line {
  top: 120px;
  left: 80px;
  width: 180px;
  height: 60px;
  animation: chartFloat 9s ease-in-out infinite 3s;
}

.chart-wave {
  bottom: 80px;
  right: 200px;
  width: 140px;
  height: 50px;
  animation: chartFloat 6s ease-in-out infinite 1.5s;
}

.chart-matrix {
  top: 40%;
  left: 50%;
  width: 60px;
  height: 60px;
  animation: chartFloat 12s ease-in-out infinite 4s;
  opacity: 0.12;
}

@keyframes chartFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
  50% { transform: translateY(-8px) rotate(1deg); opacity: 0.25; }
}

.bar {
  fill: rgba(96, 165, 250, 0.75);
  animation: barGrow 2s ease-out forwards, barWave 4s ease-in-out infinite;
  transform-origin: bottom center;
}

.bar-1 { animation-delay: 0.1s; }
.bar-2 { animation-delay: 0.2s; }
.bar-3 { animation-delay: 0.3s; }
.bar-4 { animation-delay: 0.4s; }
.bar-5 { animation-delay: 0.5s; }
.bar-6 { animation-delay: 0.6s; }
.bar-7 { animation-delay: 0.7s; }
.bar-8 { animation-delay: 0.8s; }

@keyframes barGrow {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}

@keyframes barWave {
  0%, 100% { transform: scaleY(1); }
  25% { transform: scaleY(0.85); }
  75% { transform: scaleY(1.1); }
}

.radar-ring {
  stroke: rgba(96, 165, 250, 0.5);
  stroke-width: 1;
}

.radar-area {
  stroke: rgba(167, 139, 250, 0.75);
  stroke-width: 1;
  fill: rgba(167, 139, 250, 0.15);
  animation: radarPulse 3s ease-in-out infinite, radarRotate 20s linear infinite;
  transform-origin: center;
}

@keyframes radarPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes radarRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.circle-bg {
  stroke: rgba(96, 165, 250, 0.3);
  stroke-width: 2;
}

.circle-progress {
  stroke: rgba(96, 165, 250, 0.9);
  stroke-width: 2;
  stroke-dasharray: 188;
  stroke-dashoffset: 60;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  animation: circleProgress 2s ease-out forwards, circleSpin 15s linear infinite;
}

@keyframes circleProgress {
  0% { stroke-dashoffset: 188; }
  100% { stroke-dashoffset: 60; }
}

@keyframes circleSpin {
  from { transform: rotate(-90deg); }
  to { transform: rotate(270deg); }
}

.line-path {
  stroke: rgba(96, 165, 250, 0.7);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: lineDraw 3s ease-out forwards;
}

.line-dot {
  fill: rgba(96, 165, 250, 0.8);
  animation: dotFade 1s ease-out forwards;
}

.line-dot:nth-child(2) { animation-delay: 0.1s; }
.line-dot:nth-child(3) { animation-delay: 0.2s; }
.line-dot:nth-child(4) { animation-delay: 0.3s; }
.line-dot:nth-child(5) { animation-delay: 0.4s; }
.line-dot:nth-child(6) { animation-delay: 0.5s; }
.line-dot:nth-child(7) { animation-delay: 0.6s; }
.line-dot:nth-child(8) { animation-delay: 0.7s; }
.line-dot:nth-child(9) { animation-delay: 0.8s; }
.line-dot:nth-child(10) { animation-delay: 0.9s; }

@keyframes lineDraw {
  0% { stroke-dasharray: 0, 400; }
  100% { stroke-dasharray: 400, 0; }
}

@keyframes dotFade {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}

.wave-path {
  stroke: rgba(167, 139, 250, 0.7);
  stroke-width: 1.5;
  animation: waveFlow 3s ease-in-out infinite;
}

.wave-secondary {
  stroke: rgba(96, 165, 250, 0.5);
  animation: waveFlow 3s ease-in-out infinite 1.5s;
}

@keyframes waveFlow {
  0%, 100% { stroke-dashoffset: 0; }
  50% { stroke-dashoffset: -30; }
}

.matrix-dot {
  fill: rgba(96, 165, 250, 0.6);
  animation: matrixPulse 2s ease-in-out infinite;
}

.matrix-center {
  fill: rgba(167, 139, 250, 0.8);
  animation: matrixPulse 2s ease-in-out infinite 0.5s;
}

@keyframes matrixPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.data-nodes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.data-node {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(96, 165, 250, 0.6);
  border-radius: 50%;
  animation: nodePulse 3s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.25s);
}

.data-node:nth-child(1) { top: 15%; left: 10%; }
.data-node:nth-child(2) { top: 25%; left: 85%; }
.data-node:nth-child(3) { top: 40%; left: 15%; }
.data-node:nth-child(4) { top: 55%; left: 90%; }
.data-node:nth-child(5) { top: 70%; left: 12%; }
.data-node:nth-child(6) { top: 80%; left: 82%; }
.data-node:nth-child(7) { top: 30%; left: 5%; }
.data-node:nth-child(8) { top: 60%; left: 95%; }
.data-node:nth-child(9) { top: 20%; left: 45%; }
.data-node:nth-child(10) { top: 75%; left: 55%; }
.data-node:nth-child(11) { top: 45%; left: 3%; }
.data-node:nth-child(12) { top: 85%; left: 97%; }

@keyframes nodePulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.5); box-shadow: 0 0 15px rgba(96, 165, 250, 0.6); }
}

@keyframes bgScatterGlow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.page-header {
  position: absolute;
  top: 50px;
  left: 60px;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.header-line {
  width: 4px;
  height: 50px;
  background: linear-gradient(180deg, #60a5fa, #a78bfa);
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(96, 165, 250, 0.4);
  animation: headerLineGlow 3s ease-in-out infinite;
}

@keyframes headerLineGlow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-bar {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.4), transparent);
  border-radius: 1px;
}

.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 120px;
}

.left-panel {
  flex: 1;
  max-width: 700px;
  display: flex;
  justify-content: center;
}

.brand-section {
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.globe-container {
  width: 500px;
  height: 500px;
  margin: 0 0 30px;
  position: relative;
  overflow: visible;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.globe-container::before,
.globe-container::after {
  display: none;
}

@keyframes globeGlow {
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}

@keyframes globeInnerGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.globe-container canvas {
  width: 100% !important;
  height: 100% !important;
}

.brand-text-wrapper {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-accent {
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #29b6f6, #00acc1, #29b6f6, transparent);
  border-radius: 2px;
  animation: accentFlow 3s ease-in-out infinite;
  box-shadow: 0 0 15px rgba(41, 182, 246, 0.5);
}

@keyframes accentFlow {
  0%, 100% { opacity: 0.6; transform: scaleX(0.9); }
  50% { opacity: 1; transform: scaleX(1.1); }
}

.brand-title {
  font-size: 4.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #81d4fa 0%, #29b6f6 25%, #00acc1 50%, #26c6da 75%, #81d4fa 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  letter-spacing: 16px;
  position: relative;
  z-index: 2;
  animation: titleGradient 6s ease infinite;
  text-shadow: 0 0 40px rgba(41, 182, 246, 0.3);
}

@keyframes titleGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes subtitleGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.brand-subtitle {
  font-size: 1.1rem;
  letter-spacing: 4px;
  font-weight: 400;
  text-transform: uppercase;
  background: linear-gradient(90deg, #4fc3f7, #81d4fa, #26c6da, #81d4fa, #4fc3f7);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: subtitleGradient 6s ease infinite;
}

@keyframes subtitleGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.brand-features {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 35px;
  padding: 10px 30px;
  width: 100%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: rgba(180, 200, 230, 0.55);
  transition: all 0.3s ease;
  padding: 10px 18px;
  white-space: nowrap;
  position: relative;
  background: rgba(41, 182, 246, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(41, 182, 246, 0.1);
}

.feature-item:hover {
  color: rgba(200, 230, 255, 0.95);
  transform: translateY(-2px);
  background: rgba(41, 182, 246, 0.08);
  border-color: rgba(41, 182, 246, 0.3);
  box-shadow: 0 0 25px rgba(41, 182, 246, 0.15);
}

.feature-item svg {
  color: #29b6f6;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 6px rgba(41, 182, 246, 0.4));
}

.feature-item:hover svg {
  color: #4fc3f7;
  filter: drop-shadow(0 0 15px rgba(41, 182, 246, 0.7));
  transform: scale(1.1);
}

.feature-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, rgba(96, 165, 250, 0.4), rgba(167, 139, 250, 0.2), transparent);
  position: relative;
}

.feature-divider::before,
.feature-divider::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(96, 165, 250, 0.5);
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
}

.feature-divider::before {
  top: -3px;
  animation: dividerPulse 2s ease-in-out infinite;
}

.feature-divider::after {
  bottom: -3px;
  animation: dividerPulse 2s ease-in-out infinite 1s;
}

@keyframes dividerPulse {
  0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.3); }
}

.guest-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 40px;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg, rgba(41, 182, 246, 0.15), rgba(123, 77, 255, 0.1));
  color: #e0f7fa;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(41, 182, 246, 0.25);
}

.guest-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transition: left 0.6s ease;
}

.guest-btn:hover {
  background: linear-gradient(135deg, rgba(41, 182, 246, 0.3), rgba(123, 77, 255, 0.2));
  color: #ffffff;
  box-shadow: 0 0 40px rgba(41, 182, 246, 0.3);
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(41, 182, 246, 0.5);
}

.guest-btn:hover::before {
  left: 100%;
}

.btn-icon {
  transition: all 0.3s ease;
}

.guest-btn:hover .btn-icon {
  transform: translateX(3px);
}

.right-panel {
  flex: 1;
  max-width: 480px;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  background: rgba(12, 17, 40, 0.65);
  backdrop-filter: blur(30px) saturate(140%);
  border-radius: 24px;
  border: 1px solid rgba(41, 182, 246, 0.25);
  box-shadow: 
    0 0 50px rgba(41, 182, 246, 0.15),
    0 15px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  padding: 45px;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease;
}

.login-card:hover {
  box-shadow: 
    0 0 60px rgba(41, 182, 246, 0.25),
    0 0 100px rgba(0, 131, 143, 0.12),
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  border-color: rgba(41, 182, 246, 0.45);
}

@keyframes cornerPulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.ai-network-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.2;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.network-svg {
  width: 100%;
  height: 100%;
}

.network-line {
  stroke: rgba(74, 158, 255, 0.3);
  stroke-width: 1;
  stroke-dasharray: 5, 5;
  animation: networkLineAnim 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes networkLineAnim {
  0%, 100% { stroke-dashoffset: 0; opacity: 0.3; }
  50% { stroke-dashoffset: -10; opacity: 0.8; }
}

.network-node {
  fill: rgba(74, 158, 255, 0.6);
  animation: networkNodeAnim 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes networkNodeAnim {
  0%, 100% { opacity: 0.4; r: 2; }
  50% { opacity: 1; r: 4; }
}

.career-tag-cloud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.career-tag {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: 11px;
  color: var(--color);
  font-weight: 600;
  opacity: 0;
  animation: tagFloat 8s ease-in-out infinite;
  animation-delay: var(--delay);
  white-space: nowrap;
  text-shadow: 0 0 15px currentColor;
  letter-spacing: 1px;
}

@keyframes tagFloat {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.8); }
  25% { opacity: 0.4; }
  50% { opacity: 0.6; transform: translateY(-10px) scale(1); }
  75% { opacity: 0.3; }
}

.data-flow-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.flow-line {
  position: absolute;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(74, 158, 255, 0.2) 20%, 
    rgba(0, 212, 170, 0.3) 50%, 
    rgba(74, 158, 255, 0.2) 80%, 
    transparent 100%);
  animation: flowLineAnim 10s linear infinite;
}

.flow-line.line-1 {
  left: 10%;
  animation-delay: 0s;
}

.flow-line.line-2 {
  left: 50%;
  animation-delay: -3s;
}

.flow-line.line-3 {
  left: 90%;
  animation-delay: -6s;
}

@keyframes flowLineAnim {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.card-content {
  position: relative;
  z-index: 10;
}

.card-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(74, 158, 255, 0.9);
  border-radius: 50%;
  animation: particleFloat 10s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.4s);
  filter: blur(0.5px);
}

.particle:nth-child(odd) {
  background: rgba(0, 212, 170, 0.7);
}

.particle:nth-child(1) { left: 8%; bottom: 15%; }
.particle:nth-child(2) { left: 20%; bottom: 28%; }
.particle:nth-child(3) { left: 32%; bottom: 20%; }
.particle:nth-child(4) { left: 44%; bottom: 33%; }
.particle:nth-child(5) { left: 56%; bottom: 25%; }
.particle:nth-child(6) { left: 68%; bottom: 38%; }
.particle:nth-child(7) { left: 80%; bottom: 18%; }
.particle:nth-child(8) { left: 92%; bottom: 30%; }
.particle:nth-child(9) { left: 12%; bottom: 45%; }
.particle:nth-child(10) { left: 24%; bottom: 52%; }
.particle:nth-child(11) { left: 36%; bottom: 48%; }
.particle:nth-child(12) { left: 48%; bottom: 58%; }
.particle:nth-child(13) { left: 60%; bottom: 50%; }
.particle:nth-child(14) { left: 72%; bottom: 62%; }
.particle:nth-child(15) { left: 84%; bottom: 42%; }
.particle:nth-child(16) { left: 10%; bottom: 68%; }
.particle:nth-child(17) { left: 25%; bottom: 75%; }
.particle:nth-child(18) { left: 50%; bottom: 70%; }
.particle:nth-child(19) { left: 70%; bottom: 78%; }
.particle:nth-child(20) { left: 85%; bottom: 65%; }

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  50% {
    transform: translateY(-80px) translateX(15px) scale(0.6);
    opacity: 0.5;
  }
  90% {
    opacity: 0;
  }
}

.card-floating-nodes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.floating-node {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: nodeFloat 12s ease-in-out infinite;
  animation-delay: calc(var(--i) * 1.5s);
}

.floating-node:nth-child(1) { left: 15%; top: 20%; background: rgba(74, 158, 255, 0.5); }
.floating-node:nth-child(2) { left: 80%; top: 30%; background: rgba(0, 212, 170, 0.4); }
.floating-node:nth-child(3) { left: 25%; top: 60%; background: rgba(129, 140, 248, 0.4); }
.floating-node:nth-child(4) { left: 70%; top: 70%; background: rgba(74, 158, 255, 0.35); }
.floating-node:nth-child(5) { left: 50%; top: 15%; background: rgba(0, 212, 170, 0.5); }

@keyframes nodeFloat {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
    box-shadow: 0 0 15px currentColor;
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.2);
    opacity: 0.6;
    box-shadow: 0 0 25px currentColor;
  }
  50% {
    transform: translateY(-10px) translateX(-10px) scale(0.9);
    opacity: 0.4;
    box-shadow: 0 0 18px currentColor;
  }
  75% {
    transform: translateY(15px) translateX(5px) scale(1.1);
    opacity: 0.5;
    box-shadow: 0 0 22px currentColor;
  }
}

.card-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.header-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: rgba(41, 182, 246, 0.08);
  border: 1px solid rgba(41, 182, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 25px rgba(41, 182, 246, 0.15),
    inset 0 0 15px rgba(41, 182, 246, 0.05);
  animation: iconPulse 4s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(41, 182, 246, 0.15); }
  50% { transform: scale(1.05); box-shadow: 0 0 35px rgba(41, 182, 246, 0.3); }
}

.card-header::before {
  content: '';
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.8), rgba(0, 212, 170, 0.6), rgba(74, 158, 255, 0.8), transparent);
  border-radius: 2px;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
}

.card-header h2 {
  font-size: 2.3rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fff 0%, rgba(74, 158, 255, 0.95) 40%, rgba(0, 212, 170, 0.9) 70%, rgba(74, 158, 255, 0.95) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 50px rgba(74, 158, 255, 0.4);
  position: relative;
  letter-spacing: 2px;
}

.card-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.9), rgba(0, 212, 170, 0.7), rgba(74, 158, 255, 0.9), transparent);
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 2px;
}

.login-card:hover .card-header h2::after {
  width: 90%;
}

.card-header p {
  font-size: 0.95rem;
  color: rgba(150, 180, 220, 0.5);
  letter-spacing: 2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.input-group {
  position: relative;
  background: rgba(10, 15, 40, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.input-group.error {
  border-color: rgba(255, 99, 99, 0.7);
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.input-group.success {
  border-color: rgba(0, 212, 170, 0.6);
}

.input-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  pointer-events: none;
}

.input-group:focus-within .input-glow {
  width: 300px;
  height: 300px;
}

.input-group:focus-within {
  box-shadow: 
    0 0 40px rgba(74, 158, 255, 0.3),
    0 0 60px rgba(38, 198, 218, 0.15),
    inset 0 0 20px rgba(74, 158, 255, 0.1);
  transform: translateY(-3px);
  border-color: rgba(74, 158, 255, 0.4);
}

.input-group.error:focus-within {
  box-shadow: 
    0 0 40px rgba(255, 99, 99, 0.3),
    inset 0 0 20px rgba(255, 99, 99, 0.1);
  border-color: rgba(255, 99, 99, 0.6);
}

.input-group.success:focus-within {
  box-shadow: 
    0 0 40px rgba(0, 212, 170, 0.3),
    inset 0 0 20px rgba(0, 212, 170, 0.1);
  border-color: rgba(0, 212, 170, 0.5);
}

.input-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 140, 200, 0.4);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 0 10px rgba(74, 158, 255, 0.3));
  pointer-events: none;
}

.input-group:focus-within .input-icon {
  color: #4a9eff;
  filter: drop-shadow(0 0 15px rgba(74, 158, 255, 0.8));
  transform: translateY(-50%) scale(1.1);
}

.input-status-dot {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(100, 140, 200, 0.3);
  transition: all 0.4s ease;
}

.input-group:focus-within .input-status-dot {
  background: rgba(0, 212, 170, 0.8);
  box-shadow: 0 0 15px rgba(0, 212, 170, 0.8);
}

.input-group input {
  width: 100%;
  padding: 18px 60px 18px 62px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  outline: none;
}

.input-group input::placeholder {
  color: rgba(150, 180, 220, 0.3);
}

.toggle-pwd {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: rgba(150, 180, 220, 0.4);
  transition: color 0.3s ease;
}

.toggle-pwd:hover {
  color: rgba(150, 180, 220, 0.8);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  color: rgba(150, 180, 220, 0.6);
}

.checkbox input {
  display: none;
}

.check-icon {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox input:checked + .check-icon {
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(74, 158, 255, 0.5);
}

.checkbox input:checked + .check-icon::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.forgot-link {
  font-size: 0.85rem;
  color: rgba(96, 165, 250, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #60a5fa;
}

.login-btn {
  padding: 20px;
  margin-top: 20px;
  background: linear-gradient(135deg, #0277bd 0%, #00838f 30%, #00acc1 60%, #0277bd 100%);
  background-size: 400% 400%;
  border: 1px solid rgba(41, 182, 246, 0.4);
  border-radius: 20px;
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: buttonGradient 6s ease infinite;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 10px 35px rgba(41, 182, 246, 0.35),
    0 0 50px rgba(0, 131, 143, 0.15);
  letter-spacing: 1px;
}

@keyframes buttonGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.btn-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  border-radius: 24px;
  opacity: 0;
  animation: btnPulse 3s ease-in-out infinite;
}

@keyframes btnPulse {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.2); }
}

.btn-wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: btnShine 2s ease-in-out infinite;
}

@keyframes btnShine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.login-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(0, 212, 170, 0.15) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.login-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.25), rgba(74, 158, 255, 0.3), rgba(255, 255, 255, 0.4));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
  pointer-events: none;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-6px);
  box-shadow: 
    0 20px 60px rgba(74, 158, 255, 0.5),
    0 0 80px rgba(0, 212, 170, 0.35),
    0 0 120px rgba(0, 131, 143, 0.15),
    inset 0 0 30px rgba(255, 255, 255, 0.15);
}

.login-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 32px 0;
  position: relative;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.3), transparent);
  position: relative;
}

.divider-line::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.divider-text {
  font-size: 0.85rem;
  color: rgba(150, 180, 220, 0.5);
  background: rgba(10, 15, 35, 0.9);
  padding: 6px 15px;
  border-radius: 20px;
  border: 1px solid rgba(96, 165, 250, 0.15);
  box-shadow: 0 0 15px rgba(96, 165, 250, 0.08);
  letter-spacing: 1px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 25px;
}

.social-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid rgba(96, 165, 250, 0.5);
  background: rgba(5, 12, 30, 0.9);
  color: #60a5fa;
  font-size: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(96, 165, 250, 0.2),
    0 0 50px rgba(167, 139, 250, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.social-btn.email {
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 
    0 0 20px rgba(96, 165, 250, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.social-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.7), rgba(38, 198, 218, 0.5), rgba(0, 212, 170, 0.4));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
  transition: opacity 0.4s ease;
}

.social-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border: 2px solid rgba(74, 158, 255, 0.6);
  border-radius: 50%;
  animation: socialRingAnim 2s ease-out forwards;
  animation-delay: 0.5s;
}

@keyframes socialRingAnim {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 100px; height: 100px; opacity: 0; }
}

.social-btn:hover .social-ring {
  animation: socialRingAnim 1.5s ease-out infinite;
  animation-delay: 0s;
}

.social-btn:hover {
  transform: translateY(-4px) scale(1.12);
  border-color: rgba(96, 165, 250, 0.8);
  box-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
}

.social-btn.email:hover {
  color: #93c5fd;
  border-color: rgba(147, 197, 253, 0.5);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
}

.register-link {
  text-align: center;
  margin-top: 28px;
  font-size: 0.85rem;
  color: rgba(150, 180, 220, 0.5);
}

.register-link a {
  color: #60a5fa;
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #818cf8;
}

@media (max-width: 1000px) {
  .login-wrapper {
    flex-direction: column;
    gap: 50px;
    padding: 20px;
  }

  .left-panel {
    max-width: 100%;
  }

  .globe-container {
    width: 300px;
    height: 300px;
  }

  .brand-title {
    font-size: 2.4rem;
    letter-spacing: 6px;
  }

  .brand-subtitle {
    font-size: 0.95rem;
    letter-spacing: 3px;
  }

  .brand-features {
    gap: 25px;
  }
}

@media (max-width: 500px) {
  .login-card {
    padding: 35px 28px;
  }

  .globe-container {
    width: 250px;
    height: 250px;
  }

  .brand-title {
    font-size: 1.8rem;
    letter-spacing: 4px;
  }
}

/* 社交按钮标签 */
.social-btn {
  display: flex !important;
  flex-direction: column !important;
  align-items: center;
  gap: 4px;
}

.social-label { display: none; }

/* 邮箱登录弹窗 */
.email-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.email-modal {
  background: linear-gradient(135deg, #1a1a3e 0%, #2d1f5e 50%, #1a1a3e 100%);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 16px;
  padding: 40px;
  width: 400px;
  max-width: 90%;
  position: relative;
  box-shadow: 
    0 0 40px rgba(96, 165, 250, 0.2),
    0 0 80px rgba(129, 140, 248, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.email-modal h3 {
  color: #fff;
  font-size: 22px;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 0 30px;
}

.email-form .form-group {
  margin-bottom: 20px;
}

.email-form label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.email-form input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.email-form input:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
}

.email-form input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-submit {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-error {
  color: #ff4757;
  font-size: 14px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

/* OAuth授权弹窗 */
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: authFadeIn 0.3s ease;
}

@keyframes authFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.auth-modal {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 440px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: authSlideIn 0.3s ease;
}

@keyframes authSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-provider-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.auth-provider-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin: 0 auto 12px;
}

.auth-provider-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 6px;
}

.auth-provider-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.auth-permissions {
  margin-bottom: 20px;
}

.auth-perm-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.auth-perm-item:last-child {
  border-bottom: none;
}

.auth-perm-check {
  width: 22px;
  height: 22px;
  background: #e8f5e9;
  color: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  margin-right: 10px;
  flex-shrink: 0;
  margin-top: 2px;
}

.auth-perm-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
}

.auth-perm-desc {
  font-size: 12px;
  color: #999;
}

.auth-user-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 24px;
}

.auth-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  margin-right: 12px;
}

.auth-user-tip {
  font-size: 13px;
  color: #666;
}

.auth-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.auth-btn-cancel,
.auth-btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.auth-btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.auth-btn-cancel:hover:not(:disabled) {
  background: #e8e8e8;
}

.auth-btn-confirm {
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
}

.auth-btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(7, 193, 96, 0.3);
}

.auth-btn-cancel:disabled,
.auth-btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: authSpin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes authSpin {
  to { transform: rotate(360deg); }
}

.auth-security-tip {
  text-align: center;
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

/* 登录方式切换标签 */
.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  padding: 4px;
  background: rgba(10, 15, 40, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.login-tab {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-tab:hover {
  color: rgba(200, 220, 255, 0.8);
  background: rgba(74, 158, 255, 0.08);
}

.login-tab.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.25), rgba(0, 212, 170, 0.2));
  color: #fff;
  box-shadow: 
    0 0 20px rgba(74, 158, 255, 0.3),
    inset 0 0 15px rgba(74, 158, 255, 0.1);
}

.login-tab i {
  font-size: 1rem;
}

/* 验证状态图标 */
.input-status-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.input-group.success .input-status-icon {
  opacity: 1;
  color: #00d4aa;
}

.input-group.error .input-status-icon {
  opacity: 1;
  color: #ff6b6b;
}

.input-status-icon i {
  font-size: 14px;
  animation: iconBounce 0.4s ease;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* 错误提示文本 */
.field-error {
  font-size: 0.82rem;
  color: #ff6b6b;
  margin-top: -8px;
  margin-bottom: 4px;
  padding-left: 8px;
  animation: fadeInDown 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 验证码发送按钮 */
.send-code-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(0, 212, 170, 0.15));
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 12px;
  color: rgba(180, 220, 255, 0.9);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.35), rgba(0, 212, 170, 0.25));
  border-color: rgba(74, 158, 255, 0.5);
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.2);
  color: #fff;
}

.send-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 骨架屏加载状态 */
.skeleton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(12, 17, 40, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  z-index: 100;
}

.skeleton-content {
  text-align: center;
  color: rgba(180, 220, 255, 0.8);
}

.skeleton-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(74, 158, 255, 0.2);
  border-top-color: rgba(74, 158, 255, 0.8);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: skeletonSpin 0.8s linear infinite;
}

@keyframes skeletonSpin {
  to { transform: rotate(360deg); }
}

.skeleton-text {
  font-size: 0.95rem;
  letter-spacing: 2px;
}

.skeleton-dots::after {
  content: '';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

/* 无障碍焦点样式 */
*:focus-visible {
  outline: 2px solid rgba(74, 158, 255, 0.8);
  outline-offset: 2px;
}

input:focus-visible,
button:focus-visible {
  outline: none;
}

input:focus-visible {
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.3);
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
    padding: 20px;
  }
  
  .left-panel {
    max-width: 100%;
    width: 100%;
  }
  
  .right-panel {
    max-width: 100%;
    width: 100%;
  }
  
  .login-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 25px 20px;
    border-radius: 20px;
  }
  
  .card-header h2 {
    font-size: 1.8rem;
  }
  
  .login-tabs {
    flex-direction: row;
  }
  
  .login-tab {
    padding: 10px 14px;
    font-size: 0.82rem;
  }
  
  .login-tab span {
    display: none;
  }
  
  .input-group {
    padding: 0 16px;
  }
  
  .send-code-btn {
    padding: 8px 12px;
    font-size: 0.78rem;
  }
  
  .login-btn {
    padding: 16px;
    font-size: 0.95rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 夜间模式优化（当前已是深色主题） */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(8, 12, 30, 0.75);
  }
  
  .input-group {
    background: rgba(6, 10, 30, 0.6);
  }
}
</style>