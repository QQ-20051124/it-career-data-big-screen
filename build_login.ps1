$html = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Future Career · AI智能职业规划平台</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; background: #050815; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
.bg-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: linear-gradient(180deg, #050815 0%, #0a0e25 50%, #0f1430 100%); }
#star-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.main-content { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 40px; }
.wrapper { display: flex; gap: 80px; max-width: 1400px; width: 100%; align-items: center; }
.left-section { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
.brand { position: absolute; top: -60px; left: 0; display: flex; align-items: center; gap: 8px; }
.brand-title { font-size: 16px; font-weight: 600; color: #00d4ff; letter-spacing: 1px; }
.brand-dot { color: rgba(255,255,255,0.3); font-size: 14px; }
.brand-sub { font-size: 11px; color: rgba(255,255,255,0.4); }
.globe-box { margin-bottom: 50px; }
.globe { width: 280px; height: 280px; }
.title-area { text-align: center; margin-bottom: 60px; }
.title { display: flex; gap: 8px; margin-bottom: 15px; justify-content: center; }
.title-char { font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #00d4ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 40px rgba(0,212,255,0.5); }
.subtitle { font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 12px; }
.guest-btn { padding: 12px 55px; background: transparent; border: 1px solid rgba(0,212,255,0.5); border-radius: 25px; color: #00d4ff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; position: absolute; bottom: -80px; }
.guest-btn:hover { background: rgba(0,212,255,0.1); border-color: #00d4ff; box-shadow: 0 0 30px rgba(0,212,255,0.3); }
.right-section { flex: 1; display: flex; justify-content: center; }
.login-card { width: 100%; max-width: 420px; background: rgba(25, 20, 50, 0.6); border-radius: 16px; padding: 50px 45px; position: relative; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
.card-border { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.corner-line { position: absolute; width: 40px; height: 40px; border: 1px solid; }
.cl-tl { top: 12px; left: 12px; border-right: none; border-bottom: none; border-color: #00d4ff; box-shadow: 0 0 15px rgba(0,212,255,0.5); }
.cl-tr { top: 12px; right: 12px; border-left: none; border-bottom: none; border-color: #a855f7; box-shadow: 0 0 15px rgba(168,85,247,0.5); }
.cl-bl { bottom: 12px; left: 12px; border-right: none; border-top: none; border-color: #a855f7; box-shadow: 0 0 15px rgba(168,85,247,0.5); }
.cl-br { bottom: 12px; right: 12px; border-left: none; border-top: none; border-color: #00d4ff; box-shadow: 0 0 15px rgba(0,212,255,0.5); }
.card-header { text-align: center; margin-bottom: 35px; }
.tabs { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; }
.tab { padding: 6px 18px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2); border-radius: 15px; font-size: 12px; color: #00d4ff; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.tab:before { content: "◎"; font-size: 8px; opacity: 0.6; }
.tab.active { background: rgba(0,212,255,0.18); border-color: rgba(0,212,255,0.4); }
.tab-more { color: rgba(255,255,255,0.3); font-size: 14px; margin-left: 5px; }
.card-title { font-size: 28px; font-weight: bold; color: #fff; margin-bottom: 8px; }
.card-sub { font-size: 13px; color: rgba(255,255,255,0.4); }
.login-form { display: flex; flex-direction: column; gap: 22px; }
.input-group { position: relative; }
.input-wrap { position: relative; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); transition: all 0.3s ease; }
.input-wrap:focus-within { border-color: rgba(0,212,255,0.4); box-shadow: 0 0 20px rgba(0,212,255,0.1); }
.field-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); font-size: 18px; color: rgba(255,255,255,0.4); z-index: 1; }
.input-field { width: 100%; padding: 16px 16px 16px 55px; background: transparent; border: none; border-radius: 10px; color: #fff; font-size: 15px; outline: none; }
.input-field::placeholder { color: rgba(255,255,255,0.3); }
.forgot-password { position: absolute; right: 0; bottom: -26px; font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; }
.form-options { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.remember-me { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.remember-me input { display: none; }
.remember-box { width: 16px; height: 16px; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; position: relative; }
.remember-me input:checked + .remember-box { background: rgba(0,212,255,0.2); border-color: #00d4ff; }
.remember-me input:checked + .remember-box:after { content: ""; position: absolute; top: 4px; left: 4px; width: 6px; height: 6px; background: #00d4ff; border-radius: 50%; }
.remember-text { font-size: 13px; color: rgba(255,255,255,0.5); }
.quick-guest-btn { padding: 7px 20px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); border-radius: 15px; color: #a855f7; font-size: 12px; cursor: pointer; }
.login-btn { width: 100%; padding: 17px; margin-top: 5px; background: linear-gradient(135deg, #00d4ff, #a855f7); border: none; border-radius: 10px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; letter-spacing: 2px; }
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(0,212,255,0.4), 0 10px 35px rgba(168,85,247,0.3); }
.divider { display: flex; align-items: center; gap: 15px; margin: 30px 0; }
.divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
.divider-text { font-size: 12px; color: rgba(255,255,255,0.4); }
.social-login { display: flex; justify-content: center; gap: 20px; }
.social-btn { width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; }
.social-btn:hover { background: rgba(0,212,255,0.15); border-color: rgba(0,212,255,0.4); }
@media (max-width: 1024px) { .wrapper { flex-direction: column; gap: 60px; } .brand { position: relative; top: 0; margin-bottom: 30px; } .title-char { font-size: 36px; } .subtitle { font-size: 12px; letter-spacing: 8px; } .guest-btn { position: relative; bottom: 0; margin-top: 20px; } .globe { width: 220px; height: 220px; } }
</style>
</head>
<body>
<div class="bg-container">
<canvas id="star-canvas"></canvas>
</div>
<div class="main-content">
<div class="wrapper">
<div class="left-section">
<div class="brand">
<span class="brand-title">Future Career</span>
<span class="brand-dot">·</span>
<span class="brand-sub">AI智能职业规划平台</span>
</div>
<div class="globe-box">
<div class="globe">
<svg viewBox="0 0 280 280">
<defs>
<linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8"/>
<stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.4"/>
</linearGradient>
<radialGradient id="g2" cx="40%" cy="40%" r="60%">
<stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.3"/>
<stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.15"/>
<stop offset="100%" style="stop-color:#a855f7;stop-opacity:0"/>
</radialGradient>
<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<circle cx="140" cy="140" r="95" fill="url(#g2)" filter="url(#glow)"/>
<g stroke="url(#g1)" stroke-width="0.6" fill="none" opacity="0.7">
<circle cx="140" cy="140" r="35"/><circle cx="140" cy="140" r="55"/><circle cx="140" cy="140" r="75"/><circle cx="140" cy="140" r="90"/>
<line x1="45" y1="140" x2="235" y2="140"/><line x1="140" y1="45" x2="140" y2="235"/>
<line x1="70" y1="70" x2="210" y2="210"/><line x1="210" y1="70" x2="70" y2="210"/>
</g>
<g filter="url(#glow)">
<circle cx="140" cy="50" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
<circle cx="230" cy="140" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.3s" repeatCount="indefinite"/></circle>
<circle cx="140" cy="230" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.1s" repeatCount="indefinite"/></circle>
<circle cx="50" cy="140" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/></circle>
<circle cx="140" cy="140" r="6" fill="#00d4ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></circle>
</g>
</svg>
</div>
</div>
<div class="title-area">
<div class="title">
<span class="title-char">AI</span><span class="title-char">驱</span><span class="title-char">动</span><span class="title-char">职</span><span class="title-char">业</span><span class="title-char">导</span><span class="title-char">航</span>
</div>
<div class="subtitle">智能匹配 · 精准导航 · 成就未来</div>
</div>
<button class="guest-btn" onclick="enterGuest()">游客模式开放预览</button>
</div>
<div class="right-section">
<div class="login-card">
<div class="card-border">
<div class="corner-line cl-tl"></div>
<div class="corner-line cl-tr"></div>
<div class="corner-line cl-bl"></div>
<div class="corner-line cl-br"></div>
</div>
<div class="card-header">
<div class="tabs">
<span class="tab active">智能工作台登录</span>
<span class="tab">智能工作台登录</span>
<span class="tab-more">...</span>
</div>
<h2 class="card-title">欢迎回来</h2>
<p class="card-sub">登录您的智能工作空间</p>
</div>
<form class="login-form" onsubmit="handleLogin(event)">
<div class="input-group">
<div class="input-wrap">
<span class="field-icon">👤</span>
<input type="text" class="input-field" id="username" placeholder="账号" required>
</div>
</div>
<div class="input-group">
<div class="input-wrap">
<span class="field-icon">🔒</span>
<input type="password" class="input-field" id="password" placeholder="密码" required>
</div>
<a href="#" class="forgot-password">忘记密码</a>
</div>
<div class="form-options">
<label class="remember-me">
<input type="checkbox" id="remember">
<span class="remember-box"></span>
<span class="remember-text">记住我</span>
</label>
<button type="button" class="quick-guest-btn" onclick="enterGuest()">游客预览</button>
</div>
<button type="submit" class="login-btn">立即登录</button>
</form>
<div class="divider">
<div class="divider-line"></div>
<span class="divider-text">或使用以下快捷登录</span>
<div class="divider-line"></div>
</div>
<div class="social-login">
<button class="social-btn" onclick="socialLogin('wechat')">💬</button>
<button class="social-btn" onclick="socialLogin('qq')">🐧</button>
<button class="social-btn" onclick="socialLogin('email')">📧</button>
</div>
</div>
</div>
</div>
</div>
<script>
const canvas = document.getElementById("star-canvas");
const ctx = canvas.getContext("2d");
let stars = [];
let meteors = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initStars(); }
function initStars() { stars = []; const count = Math.floor((canvas.width * canvas.height) / 2500); for (let i = 0; i < count; i++) { stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.5 + 0.3, brightness: Math.random() * 0.5 + 0.3, twinkleSpeed: Math.random() * 0.015 + 0.005, phase: Math.random() * Math.PI * 2 }); } }
function createMeteor() { if (Math.random() < 0.01) { meteors.push({ x: Math.random() * canvas.width, y: -10, length: Math.random() * 80 + 40, speed: Math.random() * 8 + 5, angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, opacity: 0.8 }); } }
function drawStars() { stars.forEach(star => { star.phase += star.twinkleSpeed; const alpha = star.brightness * (0.3 + Math.sin(star.phase) * 0.7); ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255," + alpha + ")"; ctx.fill(); }); }
function drawMeteors() { meteors = meteors.filter(m => m.y < canvas.height + 100 && m.x < canvas.width + 100); meteors.forEach(m => { m.x += Math.cos(m.angle) * m.speed; m.y += Math.sin(m.angle) * m.speed; m.opacity -= 0.005; if (m.opacity <= 0) return; const tailX = m.x - Math.cos(m.angle) * m.length; const tailY = m.y - Math.sin(m.angle) * m.length; const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y); gradient.addColorStop(0, "transparent"); gradient.addColorStop(1, "rgba(200,220,255," + m.opacity + ")"); ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(m.x, m.y); ctx.strokeStyle = gradient; ctx.lineWidth = 1.5; ctx.stroke(); }); }
function animate() { ctx.fillStyle = "rgba(5,8,21,0.1)"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawStars(); createMeteor(); drawMeteors(); requestAnimationFrame(animate); }
resize(); window.addEventListener("resize", resize); animate();
function handleLogin(e) { e.preventDefault(); if (document.getElementById("username").value && document.getElementById("password").value) { alert("登录成功！"); window.location.href = "/"; } }
function enterGuest() { alert("进入游客模式"); window.location.href = "/"; }
function socialLogin(type) { const names = { wechat: "微信", qq: "QQ", email: "邮箱" }; alert("跳转" + names[type] + "登录"); }
</script>
</body>
</html>
"@

$html | Out-File -FilePath "ai-career-login.html" -Encoding utf8
Write-Host "Login page created successfully!"
