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
            <div class="title-globe">
              <div class="globe-core"></div>
              <div class="globe-ring ring-1"></div>
              <div class="globe-ring ring-2"></div>
              <div class="globe-glow"></div>
              <div class="globe-particles">
                <div class="particle p1"></div>
                <div class="particle p2"></div>
                <div class="particle p3"></div>
                <div class="particle p4"></div>
                <div class="particle p5"></div>
              </div>
            </div>
            <h1 class="brand-title">计程·职道</h1>
            <div class="title-glow"></div>
            <div class="title-border"></div>
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
          <div class="card-glow-effect"></div>
          <div class="card-top-glow"></div>
          <div class="card-particles">
            <span class="particle" v-for="n in 15" :key="'p'+n" :style="{ '--i': n }"></span>
          </div>
          <div class="card-floating-nodes">
            <span class="floating-node" v-for="n in 5" :key="'fn'+n" :style="{ '--i': n }"></span>
          </div>

          <div class="card-content">
            <div class="card-header">
            <h2>欢迎回来</h2>
            <p>登录您的智能工作空间</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="input-group" @focus="focusedInput = 'username'" @blur="focusedInput = null">
              <div class="input-border"></div>
              <div class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input type="text" v-model="form.username" placeholder="账号" required />
            </div>

            <div class="input-group" @focus="focusedInput = 'password'" @blur="focusedInput = null">
              <div class="input-border"></div>
              <div class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="密码" required />
              <div class="toggle-pwd" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.58 18.58 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.58 18.58 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1 4.24 4.24"/>
                </svg>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" v-model="form.remember"/>
                <span class="check-icon"></span>
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-link">忘记密码?</a>
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              <span class="btn-glow"></span>
              <span v-if="loading" class="spinner"></span>
              {{ loading ? '登录中...' : '立即登录' }}
            </button>
          </form>

          <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-text">或使用以下快捷登录</span>
            <span class="divider-line"></span>
          </div>

          <div class="social-buttons">
            <button class="social-btn wechat" @click="handleSocialLogin('wechat')" @mouseenter="hoveredSocial = 'wechat'" @mouseleave="hoveredSocial = null">
              <div class="social-glow"></div>
              <i class="fa-brands fa-weixin"></i>
            </button>
            <button class="social-btn qq" @click="handleSocialLogin('qq')" @mouseenter="hoveredSocial = 'qq'" @mouseleave="hoveredSocial = null">
              <div class="social-glow"></div>
              <i class="fa-brands fa-qq"></i>
            </button>
            <button class="social-btn email" @click="handleEmailLogin" @mouseenter="hoveredSocial = 'email'" @mouseleave="hoveredSocial = null">
              <div class="social-glow"></div>
              <i class="fa-solid fa-envelope"></i>
            </button>
          </div>

          <div class="register-link">
            还没有账号? <a href="#" @click.prevent="handleRegister">立即注册</a>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const showPassword = ref(false)
const loading = ref(false)
const bgCanvas = ref(null)
const globeContainer = ref(null)
const loginCard = ref(null)
const focusedInput = ref(null)
const hoveredSocial = ref(null)
let bgAnimationId = null
let globeAnimationId = null
let mouseX = 0
let mouseY = 0

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const handleLogin = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  sessionStorage.setItem('isLoggedIn', 'true')
  loading.value = false
  window.location.href = '/'
}

const handleGuest = () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('isGuest', 'true')
  window.location.href = '/'
}

const handleSocialLogin = (type) => {
  loading.value = true
  setTimeout(() => {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('loginType', type)
    loading.value = false
    window.location.href = '/'
  }, 1500)
}

const handleEmailLogin = () => {
  loading.value = true
  setTimeout(() => {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('loginType', 'email')
    loading.value = false
    window.location.href = '/'
  }, 1500)
}

const handleRegister = () => {
  alert('注册功能正在开发中，敬请期待！')
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
    if (shootingStars.length < 3) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        length: Math.random() * 180 + 100,
        speed: Math.random() * 0.002 + 0.001,
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
      star.x += Math.cos(star.angle) * star.speed * 20
      star.y += Math.sin(star.angle) * star.speed * 20
      star.life -= star.speed * 0.05
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
          lineGradient.addColorStop(0, node1.color + opacity + ')')
          lineGradient.addColorStop(1, node2.color + opacity + ')')
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

const initGlobe = () => {
  if (!globeContainer.value) return

  const container = globeContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const globeRadius = 1.8

  const innerGeometry = new THREE.SphereGeometry(globeRadius * 0.95, 64, 64)
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x0a1628,
    transparent: true,
    opacity: 0.9
  })
  const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial)
  scene.add(innerSphere)

  const gridGeometry = new THREE.SphereGeometry(globeRadius, 48, 48)
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  })
  const gridSphere = new THREE.Mesh(gridGeometry, gridMaterial)
  scene.add(gridSphere)

  const gridGeometry2 = new THREE.SphereGeometry(globeRadius * 1.01, 32, 32)
  const gridMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  })
  const gridSphere2 = new THREE.Mesh(gridGeometry2, gridMaterial2)
  scene.add(gridSphere2)

  const dotGeometry = new THREE.BufferGeometry()
  const dotCount = 1200
  const dotPositions = []
  const dotColors = []
  const dotSizes = []

  for (let i = 0; i < dotCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = globeRadius * (0.98 + Math.random() * 0.04)

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)

    dotPositions.push(x, y, z)

    const color = new THREE.Color()
    const rand = Math.random()
    if (rand > 0.92) {
      color.setHex(0x00ffff)
    } else if (rand > 0.7) {
      color.setHex(0x60a5fa)
    } else {
      color.setHex(0x818cf8)
    }
    dotColors.push(color.r, color.g, color.b)

    dotSizes.push(0.012 + Math.random() * 0.025)
  }

  dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3))
  dotGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3))
  dotGeometry.setAttribute('size', new THREE.Float32BufferAttribute(dotSizes, 1))

  const dotVertexShader = `
    attribute float size;
    varying vec3 vColor;
    uniform float time;
    void main() {
      vColor = color;
      float twinkle = sin(time * 3.0 + position.x * 20.0 + position.y * 10.0) * 0.3 + 0.7;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * twinkle * (350.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  const dotFragmentShader = `
    varying vec3 vColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      vec3 glow = vColor * 2.5 * (1.0 - dist * 2.0);
      vec3 finalColor = mix(vColor, glow, 0.6);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `

  const dotMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: dotVertexShader,
    fragmentShader: dotFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  })

  const dots = new THREE.Points(dotGeometry, dotMaterial)
  scene.add(dots)

  const linePositions = []
  const positionsArray = dotGeometry.attributes.position.array
  const connectionDistance = 0.3

  for (let i = 0; i < dotCount; i++) {
    for (let j = i + 1; j < dotCount; j++) {
      const ix = positionsArray[i * 3]
      const iy = positionsArray[i * 3 + 1]
      const iz = positionsArray[i * 3 + 2]
      const jx = positionsArray[j * 3]
      const jy = positionsArray[j * 3 + 1]
      const jz = positionsArray[j * 3 + 2]

      const dx = ix - jx
      const dy = iy - jy
      const dz = iz - jz
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < connectionDistance && Math.random() > 0.85) {
        linePositions.push(ix, iy, iz)
        linePositions.push(jx, jy, jz)
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
  scene.add(lines)

  const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.03, 64, 64)
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, normalize(vViewPosition)), 2.0);
        gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity * 0.9;
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  })
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
  scene.add(atmosphere)

  const glowGeometry = new THREE.SphereGeometry(globeRadius * 1.05, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  scene.add(glow)

  const ringGeometry = new THREE.RingGeometry(globeRadius * 1.08, globeRadius * 1.1, 128)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI / 2
  ring.rotation.z = 0.25
  scene.add(ring)

  const orbitingParticlesGeometry = new THREE.BufferGeometry()
  const orbitingCount = 150
  const orbitingPositions = []
  const orbitingColors = []

  for (let i = 0; i < orbitingCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = globeRadius * (1.15 + Math.random() * 0.6)

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)

    orbitingPositions.push(x, y, z)

    const color = new THREE.Color()
    const rand = Math.random()
    if (rand > 0.7) {
      color.setHex(0x00ffff)
    } else {
      color.setHex(0x60a5fa)
    }
    orbitingColors.push(color.r, color.g, color.b)
  }

  orbitingParticlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitingPositions, 3))
  orbitingParticlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(orbitingColors, 3))

  const orbitingMaterial = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const orbitingParticles = new THREE.Points(orbitingParticlesGeometry, orbitingMaterial)
  scene.add(orbitingParticles)

  const onResize = () => {
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
  }
  window.addEventListener('resize', onResize)

  const animate = () => {
    const time = Date.now() * 0.001
    dotMaterial.uniforms.time.value = time

    innerSphere.rotation.y += 0.0006
    innerSphere.rotation.x += 0.00015
    gridSphere.rotation.y += 0.0008
    gridSphere.rotation.x += 0.0002
    gridSphere2.rotation.y += 0.0004
    gridSphere2.rotation.x -= 0.0001
    dots.rotation.y += 0.0006
    dots.rotation.x += 0.00015
    lines.rotation.y += 0.0006
    lines.rotation.x += 0.00015
    atmosphere.rotation.y += 0.0006
    atmosphere.rotation.x += 0.00015
    glow.rotation.y += 0.0005
    ring.rotation.y += 0.0004
    ring.rotation.z += 0.0001
    orbitingParticles.rotation.y += 0.0003
    orbitingParticles.rotation.x += 0.0001

    renderer.render(scene, camera)
    globeAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  initBackground()
  setTimeout(initGlobe, 100)
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
  width: 300px;
  height: 300px;
  margin: 0 0 25px;
}

.brand-text-wrapper {
  position: relative;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-globe {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.globe-core {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 40%, #818cf8 70%, #60a5fa 100%);
  background-size: 300% 300%;
  animation: globeGradient 4s ease infinite;
  box-shadow: 
    0 0 20px rgba(96, 165, 250, 0.6),
    0 0 40px rgba(167, 139, 250, 0.4),
    inset 0 -8px 20px rgba(0, 0, 0, 0.3),
    inset 0 8px 20px rgba(255, 255, 255, 0.15);
  position: relative;
}

.globe-core::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 12px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  filter: blur(2px);
}

.globe-core::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.globe-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(96, 165, 250, 0.3);
  animation: ringRotate 20s linear infinite;
}

.ring-1 {
  width: 60px;
  height: 60px;
  border-color: rgba(96, 165, 250, 0.25);
  animation-direction: normal;
}

.ring-2 {
  width: 75px;
  height: 75px;
  border-color: rgba(167, 139, 250, 0.2);
  animation-direction: reverse;
  animation-duration: 25s;
}

.globe-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(167, 139, 250, 0.08) 40%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}

.globe-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(96, 165, 250, 0.8);
  border-radius: 50%;
  animation: particleOrbit 8s ease-in-out infinite;
}

.p1 { top: 0; left: 50%; transform: translateX(-50%); animation-delay: 0s; }
.p2 { top: 50%; right: 0; transform: translateY(-50%); animation-delay: 1.6s; }
.p3 { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: 3.2s; }
.p4 { top: 50%; left: 0; transform: translateY(-50%); animation-delay: 4.8s; }
.p5 { top: 20%; right: 20%; animation-delay: 6.4s; }

@keyframes globeGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes particleOrbit {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
}

.brand-title {
  font-size: 4.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #7dd3fc 0%, #93c5fd 20%, #c4b5fd 40%, #a78bfa 55%, #818cf8 70%, #60a5fa 85%, #93c5fd 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  letter-spacing: 20px;
  position: relative;
  z-index: 2;
  animation: titleGradient 6s ease infinite;
  text-shadow: 
    0 0 30px rgba(96, 165, 250, 0.4),
    0 0 60px rgba(167, 139, 250, 0.2),
    0 0 100px rgba(129, 140, 248, 0.1);
}

.title-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 70%;
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.25) 0%, rgba(167, 139, 250, 0.15) 40%, rgba(129, 140, 248, 0.08) 60%, transparent 80%);
  filter: blur(40px);
  z-index: 1;
  animation: glowPulse 4s ease-in-out infinite;
}

.title-border {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.6), transparent);
  border-radius: 2px;
  animation: borderPulse 3s ease-in-out infinite;
}

@keyframes borderPulse {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(1); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1.2); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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
  font-size: 1.3rem;
  letter-spacing: 6px;
  font-weight: 400;
  text-transform: uppercase;
  background: linear-gradient(90deg, #4ade80, #67e8f9, #a5f3fc, #67e8f9, #4ade80);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: subtitleGradient 6s ease infinite;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.brand-features {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 35px;
  padding: 10px 40px;
  width: 100%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  color: rgba(140, 170, 210, 0.6);
  transition: all 0.3s ease;
  padding: 12px 22px;
  white-space: nowrap;
  position: relative;
  background: rgba(96, 165, 250, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.08);
}

.feature-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent, rgba(167, 139, 250, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.feature-item:hover {
  color: rgba(200, 220, 250, 0.95);
  transform: translateY(-3px);
  background: rgba(96, 165, 250, 0.08);
  border-color: rgba(96, 165, 250, 0.2);
  box-shadow: 0 0 30px rgba(96, 165, 250, 0.15);
}

.feature-item:hover::before {
  opacity: 1;
}

.feature-item svg {
  color: #60a5fa;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.3));
}

.feature-item:hover svg {
  color: #93c5fd;
  filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.6));
  transform: scale(1.15);
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
  padding: 15px 45px;
  border: none;
  border-radius: 45px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.15));
  color: #c7d2fe;
  font-size: 1.05rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(15px);
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.guest-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.guest-btn:hover {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.35), rgba(167, 139, 250, 0.25));
  color: #ffffff;
  box-shadow: 0 0 50px rgba(96, 165, 250, 0.35);
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(96, 165, 250, 0.4);
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
  background: rgba(10, 20, 50, 0.65);
  backdrop-filter: blur(40px) saturate(150%);
  border-radius: 28px;
  border: 1px solid rgba(96, 165, 250, 0.08);
  box-shadow: 
    0 0 60px rgba(96, 165, 250, 0.12),
    0 0 100px rgba(167, 139, 250, 0.06),
    0 25px 60px rgba(0, 0, 0, 0.6),
    0 15px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  padding: 55px;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(135deg, rgba(96, 165, 250, 0.06) 0%, transparent 40%),
    linear-gradient(225deg, rgba(167, 139, 250, 0.04) 0%, transparent 40%),
    linear-gradient(45deg, transparent 60%, rgba(59, 130, 246, 0.03) 100%);
  pointer-events: none;
  animation: cardGradientShift 8s ease-in-out infinite;
}

@keyframes cardGradientShift {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}



.login-card:hover {
  box-shadow: 
    0 0 80px rgba(96, 165, 250, 0.18),
    0 0 130px rgba(167, 139, 250, 0.09),
    0 30px 80px rgba(0, 0, 0, 0.65),
    0 20px 50px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.28);
  border-color: rgba(96, 165, 250, 0.15);
}

.card-glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 20%, rgba(74, 158, 255, 0.05) 0%, transparent 45%),
              radial-gradient(circle at 70% 80%, rgba(0, 212, 170, 0.03) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

.card-top-glow {
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(74, 158, 255, 0.25), 
    rgba(0, 212, 170, 0.2), 
    rgba(74, 158, 255, 0.25), 
    transparent);
  border-radius: 1px;
  filter: blur(2px);
  animation: topGlowPulse 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes topGlowPulse {
  0%, 100% { opacity: 0.6; transform: scaleX(0.95); }
  50% { opacity: 1; transform: scaleX(1.05); }
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
  margin-bottom: 40px;
}

.card-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
}

.card-header p {
  font-size: 0.9rem;
  color: rgba(150, 180, 220, 0.4);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.input-group {
  position: relative;
  background: rgba(5, 12, 30, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(167, 139, 250, 0.2), rgba(96, 165, 250, 0.4));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.4;
  transition: opacity 0.3s ease, padding 0.3s ease;
  pointer-events: none;
}

.input-group:focus-within::before {
  opacity: 1;
  padding: 3px;
}

.input-group:focus-within {
  box-shadow: 
    0 0 50px rgba(96, 165, 250, 0.4),
    0 0 80px rgba(167, 139, 250, 0.2),
    inset 0 0 25px rgba(96, 165, 250, 0.12);
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.3);
}

.input-border {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #4a9eff, #00d4aa, #4a9eff, transparent);
  transition: left 0.6s ease;
  border-radius: 2px;
  pointer-events: none;
}

.input-group:focus-within .input-border {
  left: 0;
}

.input-icon {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(100, 140, 200, 0.4);
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(74, 158, 255, 0.3));
  pointer-events: none;
}

.input-group:focus-within .input-icon {
  color: #4a9eff;
  filter: drop-shadow(0 0 12px rgba(74, 158, 255, 0.6));
}

.input-group input {
  width: 100%;
  padding: 17px 20px 17px 58px;
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
  padding: 18px;
  margin-top: 12px;
  background: linear-gradient(135deg, #2575ff 0%, #4a9eff 35%, #00d4aa 100%);
  background-size: 200% 200%;
  border: none;
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.4s ease;
  animation: buttonGradient 4s ease infinite;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 25px rgba(74, 158, 255, 0.3),
    0 0 40px rgba(0, 212, 170, 0.15);
}

@keyframes buttonGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: btnShine 3s ease-in-out infinite;
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
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 
    0 15px 45px rgba(74, 158, 255, 0.5),
    0 0 50px rgba(0, 212, 170, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
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
  gap: 18px;
  margin: 28px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(150, 180, 220, 0.2), transparent);
}

.divider-text {
  font-size: 0.85rem;
  color: rgba(150, 180, 220, 0.4);
  background: rgba(15, 20, 35, 0.8);
  padding: 0 10px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 25px;
}

.social-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid rgba(74, 158, 255, 0.4);
  background: rgba(5, 12, 30, 0.6);
  color: rgba(120, 160, 220, 0.6);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.1);
}

.social-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  padding: 1px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.5), rgba(0, 212, 170, 0.3));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
}

.social-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.5) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.social-btn:hover .social-glow {
  width: 140px;
  height: 140px;
}

.social-btn:hover {
  transform: translateY(-4px) scale(1.12);
  border-color: rgba(74, 158, 255, 0.8);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.3);
}

.social-btn.wechat:hover {
  color: #07c160;
  border-color: rgba(7, 193, 96, 0.4);
  box-shadow: 0 8px 25px rgba(7, 193, 96, 0.25);
}

.social-btn.qq:hover {
  color: #12b7f5;
  border-color: rgba(18, 183, 245, 0.4);
  box-shadow: 0 8px 25px rgba(18, 183, 245, 0.25);
}

.social-btn.email:hover {
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.3);
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

  .card-corner {
    width: 20px;
    height: 20px;
  }

  .card-corner::before {
    height: 15px;
  }

  .card-corner::after {
    width: 15px;
  }
}
</style>