content = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Future Career · AI智能职业规划平台</title>
<style>
:root {
    --primary-blue: #00d4ff;
    --primary-purple: #a855f7;
    --bg-dark: #0a061a;
    --bg-card: rgba(30, 20, 60, 0.6);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    min-height: 100vh;
    background: var(--bg-dark);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
    color: #fff;
}

.bg-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

#stars-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.decor-box {
    position: absolute;
    background: rgba(0, 212, 255, 0.03);
    border: 1px solid rgba(0, 212, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(10px);
}

.db1 { top: 40px; left: 40px; width: 180px; height: 80px; }
.db2 { top: 40px; right: 40px; width: 120px; height: 60px; }
.db3 { bottom: 40px; left: 40px; width: 150px; height: 60px; }
.db4 { bottom: 40px; right: 40px; width: 200px; height: 80px; }

.main-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;
}

.wrapper {
    display: flex;
    gap: 80px;
    max-width: 1400px;
    width: 100%;
    align-items: center;
}

.left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.brand-top {
    position: absolute;
    top: -60px;
    left: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.brand-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-blue);
    letter-spacing: 1px;
}

.brand-dot {
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
}

.brand-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}

.globe-container {
    margin-bottom: 50px;
    position: relative;
}

.globe-wrapper {
    width: 280px;
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.globe-svg {
    width: 100%;
    height: 100%;
}

.title-area {
    text-align: center;
    margin-bottom: 60px;
}

.main-title {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.title-char {
    font-size: 48px;
    font-weight: bold;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
}

.sub-title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 12px;
}

.guest-mode-btn {
    padding: 12px 55px;
    background: transparent;
    border: 1px solid rgba(0, 212, 255, 0.5);
    border-radius: 25px;
    color: var(--primary-blue);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: absolute;
    bottom: -80px;
}

.guest-mode-btn:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: var(--primary-blue);
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.right-section {
    flex: 1;
    display: flex;
    justify-content: center;
}

.login-card {
    width: 100%;
    max-width: 420px;
    background: var(--bg-card);
    border-radius: 16px;
    padding: 50px 45px;
    position: relative;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-glow-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.corner-line {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 1px solid;
}

.cl-tl {
    top: 12px;
    left: 12px;
    border-right: none;
    border-bottom: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
}

.cl-tr {
    top: 12px;
    right: 12px;
    border-left: none;
    border-bottom: none;
    border-color: var(--primary-purple);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}

.cl-bl {
    bottom: 12px;
    left: 12px;
    border-right: none;
    border-top: none;
    border-color: var(--primary-purple);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}

.cl-br {
    bottom: 12px;
    right: 12px;
    border-left: none;
    border-top: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
}

.edge-glow {
    position: absolute;
    height: 1px;
    left: 55px;
    right: 55px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
}

.eg-top { top: 12px; }
.eg-bottom {
    bottom: 12px;
    background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent);
}

.edge-glow-v {
    position: absolute;
    width: 1px;
    top: 55px;
    bottom: 55px;
    background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.3), transparent);
}

.eg-left { left: 12px; }
.eg-right {
    right: 12px;
    background: linear-gradient(180deg, transparent, rgba(168, 85, 247, 0.3), transparent);
}

.card-header {
    text-align: center;
    margin-bottom: 35px;
}

.tabs-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
}

.tab-btn {
    padding: 6px 18px;
    background: rgba(0, 212, 255, 0.08);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 15px;
    font-size: 12px;
    color: var(--primary-blue);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}

.tab-btn:before {
    content: "◎";
    font-size: 8px;
    opacity: 0.6;
}

.tab-btn.active {
    background: rgba(0, 212, 255, 0.18);
    border-color: rgba(0, 212, 255, 0.4);
}

.tab-more {
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
    margin-left: 5px;
    cursor: pointer;
}

.welcome-title {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8px;
}

.welcome-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.input-group {
    position: relative;
}

.input-field-wrap {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;
}

.input-field-wrap:focus-within {
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

.field-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: rgba(255, 255, 255, 0.4);
    z-index: 1;
}

.input-field {
    width: 100%;
    padding: 16px 16px 16px 55px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    outline: none;
}

.input-field::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.forgot-password {
    position: absolute;
    right: 0;
    bottom: -26px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    cursor: pointer;
}

.forgot-password:hover {
    color: var(--primary-blue);
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.remember-checkbox {
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
}

.remember-me input:checked + .remember-checkbox {
    background: rgba(0, 212, 255, 0.2);
    border-color: var(--primary-blue);
}

.remember-me input:checked + .remember-checkbox:after {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    width: 6px;
    height: 6px;
    background: var(--primary-blue);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.remember-me input {
    display: none;
}

.remember-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
}

.quick-guest-btn {
    padding: 7px 20px;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 15px;
    color: var(--primary-purple);
    font-size: 12px;
    cursor: pointer;
}

.login-submit-btn {
    width: 100%;
    padding: 17px;
    margin-top: 5px;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    letter-spacing: 2px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.login-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 35px rgba(0, 212, 255, 0.4), 0 10px 35px rgba(168, 85, 247, 0.3);
}

.btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shineMove 3s infinite;
}

@keyframes shineMove {
    0% { left: -100%; }
    50%, 100% { left: 100%; }
}

.divider-section {
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 30px 0;
}

.divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    position: relative;
}

.divider-line:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
}

.divider-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
}

.social-login {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.social-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.social-btn:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    transform: translateY(-3px);
}

@media (max-width: 1024px) {
    .wrapper {
        flex-direction: column;
        gap: 60px;
    }
    .left-section, .right-section {
        max-width: 100%;
    }
    .brand-top {
        position: relative;
        top: 0;
        margin-bottom: 30px;
    }
    .title-char {
        font-size: 36px;
    }
    .sub-title {
        font-size: 12px;
        letter-spacing: 8px;
    }
    .guest-mode-btn {
        position: relative;
        bottom: 0;
        margin-top: 20px;
    }
    .globe-wrapper {
        width: 220px;
        height: 220px;
    }
}
</style>
</head>
<body>

<div class="bg-container">
    <canvas id="stars-canvas"></canvas>
    <div class="decor-box db1"></div>
    <div class="decor-box db2"></div>
    <div class="decor-box db3"></div>
    <div class="decor-box db4"></div>
</div>

<div class="main-content">
    <div class="wrapper">
        <div class="left-section">
            <div class="brand-top">
                <span class="brand-name">Future Career</span>
                <span class="brand-dot">·</span>
                <span class="brand-desc">AI智能职业规划平台</span>
            </div>
            
            <div class="globe-container">
                <div class="globe-wrapper">
                    <svg class="globe-svg" viewBox="0 0 280 280">
                        <defs>
                            <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8"/>
                                <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.4"/>
                            </linearGradient>
                            <radialGradient id="globeFill" cx="40%" cy="40%" r="60%">
                                <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.3"/>
                                <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.15"/>
                                <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0"/>
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        
                        <circle cx="140" cy="140" r="95" fill="url(#globeFill)" filter="url(#glow)"/>
                        
                        <g stroke="url(#globeGrad)" stroke-width="0.6" fill="none" opacity="0.7">
                            <circle cx="140" cy="140" r="35"/>
                            <circle cx="140" cy="140" r="55"/>
                            <circle cx="140" cy="140" r="75"/>
                            <circle cx="140" cy="140" r="90"/>
                            
                            <line x1="45" y1="140" x2="235" y2="140"/>
                            <line x1="140" y1="45" x2="140" y2="235"/>
                            <line x1="70" y1="70" x2="210" y2="210"/>
                            <line x1="210" y1="70" x2="70" y2="210"/>
                            <line x1="55" y1="105" x2="225" y2="175"/>
                            <line x1="225" y1="105" x2="55" y2="175"/>
                            <line x1="105" y1="55" x2="175" y2="225"/>
                            <line x1="175" y1="55" x2="105" y2="225"/>
                        </g>
                        
                        <g filter="url(#glow)">
                            <circle cx="140" cy="50" r="4" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
                                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="230" cy="140" r="4" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.3s" repeatCount="indefinite"/>
                                <animate attributeName="r" values="3;5;3" dur="2.3s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="140" cy="230" r="4" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.1s" repeatCount="indefinite"/>
                                <animate attributeName="r" values="3;5;3" dur="2.1s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="50" cy="140" r="4" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/>
                                <animate attributeName="r" values="3;5;3" dur="2.2s" repeatCount="indefinite"/>
                            </circle>
                            
                            <circle cx="75" cy="75" r="3" fill="#a855f7">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="205" cy="75" r="3" fill="#a855f7">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.9s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="205" cy="205" r="3" fill="#a855f7">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.0s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="75" cy="205" r="3" fill="#a855f7">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.1s" repeatCount="indefinite"/>
                            </circle>
                            
                            <circle cx="105" cy="105" r="2.5" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="175" cy="105" r="2.5" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="175" cy="175" r="2.5" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="105" cy="175" r="2.5" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.1s" repeatCount="indefinite"/>
                            </circle>
                            
                            <circle cx="140" cy="140" r="7" fill="#00d4ff">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                                <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                        </g>
                    </svg>
                </div>
            </div>
            
            <div class="title-area">
                <div class="main-title">
                    <span class="title-char">AI</span>
                    <span class="title-char">驱</span>
                    <span class="title-char">动</span>
                    <span class="title-char">职</span>
                    <span class="title-char">业</span>
                    <span class="title-char">导</span>
                    <span class="title-char">航</span>
                </div>
                <div class="sub-title">智能匹配 · 精准导航 · 成就未来</div>
            </div>
            
            <button class="guest-mode-btn" onclick="enterGuestMode()">游客模式开放预览</button>
        </div>
        
        <div class="right-section">
            <div class="login-card">
                <div class="card-glow-border">
                    <div class="corner-line cl-tl"></div>
                    <div class="corner-line cl-tr"></div>
                    <div class="corner-line cl-bl"></div>
                    <div class="corner-line cl-br"></div>
                    <div class="edge-glow eg-top"></div>
                    <div class="edge-glow eg-bottom"></div>
                    <div class="edge-glow-v eg-left"></div>
                    <div class="edge-glow-v eg-right"></div>
                </div>
                
                <div class="card-header">
                    <div class="tabs-bar">
                        <button class="tab-btn active">智能工作台登录</button>
                        <button class="tab-btn">智能工作台登录</button>
                        <span class="tab-more">···</span>
                    </div>
                    <h2 class="welcome-title">欢迎回来</h2>
                    <p class="welcome-desc">登录您的智能工作空间</p>
                </div>
                
                <form class="login-form" onsubmit="handleLogin(event)">
                    <div class="input-group">
                        <div class="input-field-wrap">
                            <span class="field-icon">👤</span>
                            <input type="text" class="input-field" id="username" placeholder="账号" required>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <div class="input-field-wrap">
                            <span class="field-icon">🔒</span>
                            <input type="password" class="input-field" id="password" placeholder="密码" required>
                        </div>
                        <a href="#" class="forgot-password">忘记密码</a>
                    </div>
                    
                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" id="remember">
                            <span class="remember-checkbox"></span>
                            <span class="remember-text">记住我</span>
                        </label>
                        <button type="button" class="quick-guest-btn" onclick="enterGuestMode()">游客预览</button>
                    </div>
                    
                    <button type="submit" class="login-submit-btn">
                        <span class="btn-shine"></span>
                        立即登录
                    </button>
                </form>
                
                <div class="divider-section">
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
const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
let animationId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    const starCount = Math.floor((canvas.width * canvas.height) / 3000);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.6 + 0.4,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function drawStars() {
    ctx.fillStyle = "rgba(10, 6, 26, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        star.phase += star.twinkleSpeed;
        const alpha = star.brightness * (0.3 + Math.sin(star.phase) * 0.7);
        
        const glowRadius = star.size * 12;
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
        glow.addColorStop(0, "rgba(255, 255, 255, " + (alpha * 0.25) + ")");
        glow.addColorStop(0.3, "rgba(200, 220, 255, " + (alpha * 0.12) + ")");
        glow.addColorStop(1, "transparent");
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        ctx.fill();
    });
}

function drawConnections() {
    stars.forEach((s1, i) => {
        stars.forEach((s2, j) => {
            if (i < j) {
                const dx = s1.x - s2.x;
                const dy = s1.y - s2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80) {
                    const opacity = (1 - distance / 80) * 0.06;
                    ctx.beginPath();
                    ctx.moveTo(s1.x, s1.y);
                    ctx.lineTo(s2.x, s2.y);
                    ctx.strokeStyle = "rgba(200, 220, 255, " + opacity + ")";
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        });
    });
}

function animate() {
    drawStars();
    drawConnections();
    animationId = requestAnimationFrame(animate);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
animate();

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    if (username && password) {
        alert("登录成功！正在进入系统...");
        window.location.href = "/";
    }
}

function enterGuestMode() {
    alert("进入游客模式，体验全部功能！");
    window.location.href = "/";
}

function socialLogin(type) {
    const names = { wechat: "微信", qq: "QQ", email: "邮箱" };
    alert("即将跳转到" + names[type] + "登录页面");
}
</script>

</body>
</html>'''

with open("ai-career-login.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Login page created successfully!")