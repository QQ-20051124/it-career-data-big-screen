$html = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Future Career · AI智能职业规划平台</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { min-height: 100vh; background: #050a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: hidden; }
        .background-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
        #starsCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .main-container { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 30px; }
        .content-wrapper { display: flex; width: 100%; max-width: 1200px; gap: 60px; }
        .left-section { flex: 1; max-width: 550px; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .brand-header { display: flex; align-items: center; gap: 8px; margin-bottom: 45px; align-self: flex-start; padding-left: 10px; }
        .brand-title { font-size: 22px; font-weight: 600; color: #00d4ff; letter-spacing: 1px; }
        .brand-dot { color: rgba(255,255,255,0.25); font-size: 18px; }
        .brand-subtitle { font-size: 12px; color: rgba(255,255,255,0.4); }
        .globe-container { margin-bottom: 45px; }
        .globe { width: 260px; height: 260px; position: relative; display: flex; align-items: center; justify-content: center; }
        .globe-svg { width: 100%; height: 100%; }
        .title-section { text-align: center; margin-bottom: 55px; }
        .main-title { display: flex; gap: 5px; margin-bottom: 18px; align-items: flex-end; }
        .title-char { font-size: 52px; font-weight: bold; background: linear-gradient(135deg, #00d4ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 30px rgba(0,212,255,0.4); }
        .subtitle { font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 14px; }
        .guest-button { padding: 12px 50px; background: transparent; border: 1px solid rgba(168,85,247,0.5); border-radius: 25px; color: #a855f7; font-size: 14px; cursor: pointer; transition: all 0.3s ease; }
        .guest-button:hover { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.8); box-shadow: 0 0 25px rgba(168,85,247,0.3); }
        .right-section { flex: 1; max-width: 420px; display: flex; justify-content: center; }
        .login-card { width: 100%; background: rgba(5,10,30,0.85); border-radius: 16px; padding: 45px 40px; position: relative; backdrop-filter: blur(20px); overflow: hidden; }
        .card-border { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
        .corner { position: absolute; width: 35px; height: 35px; border: 1.5px solid; }
        .corner.tl { top: 10px; left: 10px; border-right: none; border-bottom: none; border-color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.4); }
        .corner.tr { top: 10px; right: 10px; border-left: none; border-bottom: none; border-color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.4); }
        .corner.bl { bottom: 10px; left: 10px; border-right: none; border-top: none; border-color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.4); }
        .corner.br { bottom: 10px; right: 10px; border-left: none; border-top: none; border-color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.4); }
        .edge { position: absolute; height: 1px; left: 48px; right: 48px; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent); }
        .edge.top { top: 10px; }
        .edge.bottom { bottom: 10px; background: linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent); }
        .edge.left { top: 48px; bottom: 48px; width: 1px; left: 10px; background: linear-gradient(180deg, transparent, rgba(0,212,255,0.4), transparent); }
        .edge.right { top: 48px; bottom: 48px; width: 1px; right: 10px; background: linear-gradient(180deg, transparent, rgba(168,85,247,0.4), transparent); }
        .card-header { text-align: center; margin-bottom: 35px; }
        .tab-bar { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .tab-item { padding: 6px 16px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2); border-radius: 15px; font-size: 12px; color: #00d4ff; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; }
        .tab-item::before { content: '◎'; font-size: 8px; opacity: 0.5; }
        .tab-item.active { background: rgba(0,212,255,0.15); border-color: rgba(0,212,255,0.3); }
        .tab-more { color: rgba(255,255,255,0.3); font-size: 14px; margin-left: 3px; }
        .card-title { font-size: 28px; font-weight: bold; color: #fff; margin: 0 0 8px; }
        .card-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .input-group { position: relative; }
        .input-wrapper { position: relative; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid rgba(0,212,255,0.15); transition: all 0.3s ease; }
        .input-wrapper:focus-within { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 20px rgba(0,212,255,0.15); }
        .input-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 18px; z-index: 1; color: rgba(255,255,255,0.5); }
        .form-input { width: 100%; padding: 15px 15px 15px 50px; background: transparent; border: none; border-radius: 10px; color: #fff; font-size: 15px; outline: none; }
        .form-input::placeholder { color: rgba(255,255,255,0.3); }
        .show-hide-btn { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 16px; cursor: pointer; z-index: 1; }
        .forgot-password { position: absolute; right: 0; bottom: -24px; font-size: 12px; color: #00d4ff; text-decoration: none; }
        .form-options { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .checkbox-label input { display: none; }
        .checkbox-custom { width: 16px; height: 16px; border: 1px solid rgba(0,212,255,0.5); border-radius: 3px; transition: all 0.3s ease; }
        .checkbox-label input:checked + .checkbox-custom { background: rgba(0,212,255,0.2); border-color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.3); }
        .checkbox-label input:checked + .checkbox-custom::after { content: ''; display: block; width: 4px; height: 8px; margin: 2px 0 0 5px; border: solid #00d4ff; border-width: 0 1.5px 1.5px 0; transform: rotate(45deg); }
        .checkbox-text { font-size: 13px; color: rgba(255,255,255,0.5); }
        .quick-guest-btn { padding: 6px 16px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); border-radius: 15px; color: #a855f7; font-size: 12px; cursor: pointer; }
        .login-btn { position: relative; width: 100%; padding: 16px; margin-top: 5px; background: linear-gradient(135deg, #00d4ff, #a855f7); border: none; border-radius: 10px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; overflow: hidden; letter-spacing: 2px; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,212,255,0.4), 0 10px 30px rgba(168,85,247,0.3); }
        .btn-shine { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shineMove 3s infinite; }
        @keyframes shineMove { 0% { left: -100%; } 50%, 100% { left: 100%; } }
        .divider-area { display: flex; align-items: center; gap: 15px; margin: 30px 0; }
        .divider { flex: 1; height: 1px; background: rgba(255,255,255,0.08); position: relative; }
        .divider::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent); }
        .divider-text { font-size: 12px; color: rgba(255,255,255,0.4); }
        .social-buttons { display: flex; gap: 15px; }
        .social-btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 24px; cursor: pointer; }
        .social-btn:hover { background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.2); transform: translateY(-2px); }
        @media (max-width: 1024px) { .content-wrapper { flex-direction: column; gap: 40px; } .left-section, .right-section { max-width: 100%; } .main-title { flex-wrap: wrap; justify-content: center; } .title-char { font-size: 40px; } .subtitle { font-size: 13px; letter-spacing: 10px; } .globe { width: 220px; height: 220px; } }
    </style>
</head>
<body>
    <div class="background-container">
        <canvas id="starsCanvas"></canvas>
    </div>
    <div class="main-container">
        <div class="content-wrapper">
            <div class="left-section">
                <div class="brand-header">
                    <span class="brand-title">Future Career</span>
                    <span class="brand-dot">·</span>
                    <span class="brand-subtitle">AI智能职业规划平台</span>
                </div>
                <div class="globe-container">
                    <div class="globe">
                        <svg viewBox="0 0 260 260" class="globe-svg">
                            <defs>
                                <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.7"/>
                                    <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.3"/>
                                </linearGradient>
                                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.25"/>
                                    <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.1"/>
                                    <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0"/>
                                </radialGradient>
                            </defs>
                            <circle cx="130" cy="130" r="90" fill="url(#centerGlow)"/>
                            <g stroke="url(#gridGrad)" stroke-width="0.5" fill="none" opacity="0.6">
                                <circle cx="130" cy="130" r="30"/>
                                <circle cx="130" cy="130" r="50"/>
                                <circle cx="130" cy="130" r="70"/>
                                <circle cx="130" cy="130" r="85"/>
                                <line x1="45" y1="130" x2="215" y2="130"/>
                                <line x1="130" y1="45" x2="130" y2="215"/>
                                <line x1="65" y1="65" x2="195" y2="195"/>
                                <line x1="195" y1="65" x2="65" y2="195"/>
                                <line x1="50" y1="95" x2="210" y2="165"/>
                                <line x1="210" y1="95" x2="50" y2="165"/>
                                <line x1="95" y1="50" x2="165" y2="210"/>
                                <line x1="165" y1="50" x2="95" y2="210"/>
                            </g>
                            <g>
                                <circle cx="130" cy="45" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/></circle>
                                <circle cx="215" cy="130" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2.2s" repeatCount="indefinite"/></circle>
                                <circle cx="130" cy="215" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite"/></circle>
                                <circle cx="45" cy="130" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.1s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2.1s" repeatCount="indefinite"/></circle>
                                <circle cx="65" cy="65" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/></circle>
                                <circle cx="195" cy="65" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.9s" repeatCount="indefinite"/></circle>
                                <circle cx="195" cy="195" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.1s" repeatCount="indefinite"/></circle>
                                <circle cx="65" cy="195" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
                                <circle cx="95" cy="95" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.3s" repeatCount="indefinite"/></circle>
                                <circle cx="165" cy="95" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle>
                                <circle cx="165" cy="165" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/></circle>
                                <circle cx="95" cy="165" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.1s" repeatCount="indefinite"/></circle>
                                <circle cx="130" cy="130" r="6" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/><animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite"/></circle>
                            </g>
                        </svg>
                    </div>
                </div>
                <div class="title-section">
                    <div class="main-title">
                        <span class="title-char">AI</span><span class="title-char">驱</span><span class="title-char">动</span><span class="title-char">职</span><span class="title-char">业</span><span class="title-char">导</span><span class="title-char">航</span>
                    </div>
                    <div class="subtitle">智能匹配·精准导航·成就未来</div>
                </div>
                <button class="guest-button" onclick="goToDashboard()">游客模式开放预览</button>
            </div>
            <div class="right-section">
                <div class="login-card">
                    <div class="card-border">
                        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
                        <div class="edge top"></div><div class="edge bottom"></div><div class="edge left"></div><div class="edge right"></div>
                    </div>
                    <div class="card-header">
                        <div class="tab-bar">
                            <span class="tab-item active">智能工作台登录</span>
                            <span class="tab-item">智能工作台登录</span>
                            <span class="tab-more">···</span>
                        </div>
                        <h2 class="card-title">欢迎回来</h2>
                        <p class="card-subtitle">登录您的智能工作空间</p>
                    </div>
                    <form class="login-form" onsubmit="handleLogin(event)">
                        <div class="input-group">
                            <div class="input-wrapper"><span class="input-icon">👤</span><input type="text" id="username" placeholder="账号" class="form-input" required/></div>
                        </div>
                        <div class="input-group">
                            <div class="input-wrapper"><span class="input-icon">🔑</span><input type="password" id="password" placeholder="密码" class="form-input" required/><button type="button" class="show-hide-btn" onclick="togglePassword()">👁️</button></div>
                            <a href="#" class="forgot-password">忘记密码?</a>
                        </div>
                        <div class="form-options">
                            <label class="checkbox-label"><input type="checkbox" id="remember"/><span class="checkbox-custom"></span><span class="checkbox-text">记住我</span></label>
                            <button type="button" class="quick-guest-btn" onclick="goToDashboard()">游客预览</button>
                        </div>
                        <button type="submit" class="login-btn"><span class="btn-shine"></span>立即登录</button>
                    </form>
                    <div class="divider-area"><div class="divider"></div><span class="divider-text">或使用以下快捷登录</span><div class="divider"></div></div>
                    <div class="social-buttons">
                        <button class="social-btn" onclick="socialLogin('wechat')">💬</button>
                        <button class="social-btn" onclick="socialLogin('qq')">🐧</button>
                        <button class="social-btn" onclick="socialLogin('email')">📧</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        const canvas = document.getElementById('starsCanvas');
        const ctx = canvas.getContext('2d');
        let animationId = null;
        const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2.5 + 0.5, brightness: Math.random() * 0.7 + 0.3, twinkleSpeed: Math.random() * 0.02 + 0.005, phase: Math.random() * Math.PI * 2 });
        }
        const animate = () => {
            ctx.fillStyle = 'rgba(5,10,26,0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                star.phase += star.twinkleSpeed;
                const alpha = star.brightness * (0.2 + Math.sin(star.phase) * 0.8);
                const glowRadius = star.size * 10;
                const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
                glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.3})`);
                glow.addColorStop(0.4, `rgba(200,210,255,${alpha * 0.15})`);
                glow.addColorStop(1, 'transparent');
                ctx.beginPath(); ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
                ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill();
            });
            stars.forEach((s1, i) => {
                stars.forEach((s2, j) => {
                    if (i < j) {
                        const dx = s1.x - s2.x, dy = s1.y - s2.y, distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 100) {
                            const opacity = (1 - distance / 100) * 0.08;
                            ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.strokeStyle = `rgba(200,210,255,${opacity})`; ctx.lineWidth = 0.4; ctx.stroke();
                        }
                    }
                });
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();
        let showPassword = false;
        const passwordInput = document.getElementById('password');
        const showHideBtn = document.querySelector('.show-hide-btn');
        const togglePassword = () => { showPassword = !showPassword; passwordInput.type = showPassword ? 'text' : 'password'; showHideBtn.textContent = showPassword ? '🙈' : '👁️'; };
        const handleLogin = (event) => { event.preventDefault(); const username = document.getElementById('username').value, password = document.getElementById('password').value; if (username && password) { alert('登录成功！'); window.location.href = '/'; } };
        const goToDashboard = () => { alert('进入游客模式'); window.location.href = '/'; };
        const socialLogin = (type) => { const names = { wechat: '微信', qq: 'QQ', email: '邮箱' }; alert(`即将跳转到${names[type]}登录页面`); };
    </script>
</body>
</html>
"@

Set-Content -Path "ai-career-login.html" -Value $html -Encoding UTF8