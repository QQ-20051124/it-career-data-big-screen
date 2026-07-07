$part1 = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Future Career · AI智能职业规划平台</title>
<style>
:root {
    --blue: #00d4ff;
    --purple: #a855f7;
    --bg: #0a061a;
    --card-bg: rgba(30,20,60,0.6);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
.bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
#stars { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.decor { position: absolute; background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.08); border-radius: 16px; backdrop-filter: blur(10px); }
.d1 { top: 40px; left: 40px; width: 180px; height: 80px; }
.d2 { top: 40px; right: 40px; width: 120px; height: 60px; }
.d3 { bottom: 40px; left: 40px; width: 150px; height: 60px; }
.d4 { bottom: 40px; right: 40px; width: 200px; height: 80px; }
.main { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 40px; }
.wrap { display: flex; gap: 80px; max-width: 1400px; width: 100%; align-items: center; }
.left { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
.brand { position: absolute; top: -60px; left: 0; display: flex; align-items: center; gap: 8px; }
.brand-title { font-size: 16px; font-weight: 600; color: var(--blue); letter-spacing: 1px; }
.brand-dot { color: rgba(255,255,255,0.3); font-size: 14px; }
.brand-sub { font-size: 11px; color: rgba(255,255,255,0.4); }
.globe-box { margin-bottom: 50px; }
.globe { width: 280px; height: 280px; }
.title-area { text-align: center; margin-bottom: 60px; }
.title { display: flex; gap: 8px; margin-bottom: 15px; justify-content: center; }
.tc { font-size: 48px; font-weight: bold; background: linear-gradient(135deg, var(--blue), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 40px rgba(0,212,255,0.5); }
.subtitle { font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 12px; }
.guest-btn { padding: 12px 55px; background: transparent; border: 1px solid rgba(0,212,255,0.5); border-radius: 25px; color: var(--blue); font-size: 14px; cursor: pointer; transition: all 0.3s ease; position: absolute; bottom: -80px; }
.guest-btn:hover { background: rgba(0,212,255,0.1); border-color: var(--blue); box-shadow: 0 0 30px rgba(0,212,255,0.3); }
.right { flex: 1; display: flex; justify-content: center; }
.card { width: 100%; max-width: 420px; background: var(--card-bg); border-radius: 16px; padding: 50px 45px; position: relative; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
.card-border { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.cr { position: absolute; width: 40px; height: 40px; border: 1px solid; }
.cr.tl { top: 12px; left: 12px; border-right: none; border-bottom: none; border-color: var(--blue); box-shadow: 0 0 15px rgba(0,212,255,0.5); }
.cr.tr { top: 12px; right: 12px; border-left: none; border-bottom: none; border-color: var(--purple); box-shadow: 0 0 15px rgba(168,85,247,0.5); }
.cr.bl { bottom: 12px; left: 12px; border-right: none; border-top: none; border-color: var(--purple); box-shadow: 0 0 15px rgba(168,85,247,0.5); }
.cr.br { bottom: 12px; right: 12px; border-left: none; border-top: none; border-color: var(--blue); box-shadow: 0 0 15px rgba(0,212,255,0.5); }
.edg { position: absolute; height: 1px; left: 55px; right: 55px; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent); }
.edg.top { top: 12px; }
.edg.bottom { bottom: 12px; background: linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent); }
.edg-v { position: absolute; width: 1px; top: 55px; bottom: 55px; background: linear-gradient(180deg, transparent, rgba(0,212,255,0.3), transparent); }
.edg-v.left { left: 12px; }
.edg-v.right { right: 12px; background: linear-gradient(180deg, transparent, rgba(168,85,247,0.3), transparent); }
.card-header { text-align: center; margin-bottom: 35px; }
.tabs { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; }
.tab { padding: 6px 18px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2); border-radius: 15px; font-size: 12px; color: var(--blue); cursor: pointer; display: flex; align-items: center; gap: 6px; }
.tab:before { content: "◎"; font-size: 8px; opacity: 0.6; }
.tab.active { background: rgba(0,212,255,0.18); border-color: rgba(0,212,255,0.4); }
.tab-more { color: rgba(255,255,255,0.3); font-size: 14px; margin-left: 5px; }
.card-title { font-size: 28px; font-weight: bold; color: #fff; margin-bottom: 8px; }
.card-sub { font-size: 13px; color: rgba(255,255,255,0.4); }
.form { display: flex; flex-direction: column; gap: 22px; }
.input-group { position: relative; }
.input-wrap { position: relative; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); transition: all 0.3s ease; }
.input-wrap:focus-within { border-color: rgba(0,212,255,0.4); box-shadow: 0 0 20px rgba(0,212,255,0.1); }
.icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); font-size: 18px; color: rgba(255,255,255,0.4); z-index: 1; }
.inp { width: 100%; padding: 16px 16px 16px 55px; background: transparent; border: none; border-radius: 10px; color: #fff; font-size: 15px; outline: none; }
.inp::placeholder { color: rgba(255,255,255,0.3); }
.forgot { position: absolute; right: 0; bottom: -26px; font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; }
.options { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.checkbox-label input { display: none; }
.checkbox { width: 16px; height: 16px; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; position: relative; }
.checkbox-label input:checked + .checkbox { background: rgba(0,212,255,0.2); border-color: var(--blue); }
.checkbox-label input:checked + .checkbox:after { content: ""; position: absolute; top: 4px; left: 4px; width: 6px; height: 6px; background: var(--blue); border-radius: 50%; }
.checkbox-text { font-size: 13px; color: rgba(255,255,255,0.5); }
.quick-guest { padding: 7px 20px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); border-radius: 15px; color: var(--purple); font-size: 12px; cursor: pointer; }
.login-btn { width: 100%; padding: 17px; margin-top: 5px; background: linear-gradient(135deg, var(--blue), var(--purple)); border: none; border-radius: 10px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; letter-spacing: 2px; position: relative; overflow: hidden; }
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(0,212,255,0.4), 0 10px 35px rgba(168,85,247,0.3); }
.shine { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shineMove 3s infinite; }
@keyframes shineMove { 0% { left: -100%; } 50%, 100% { left: 100%; } }
.divider { display: flex; align-items: center; gap: 15px; margin: 30px 0; }
.line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); position: relative; }
.line:after { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent); }
.divider-text { font-size: 12px; color: rgba(255,255,255,0.4); }
.social { display: flex; justify-content: center; gap: 20px; }
.sbtn { width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; }
.sbtn:hover { background: rgba(0,212,255,0.15); border-color: rgba(0,212,255,0.4); }
@media (max-width: 1024px) { .wrap { flex-direction: column; gap: 60px; } .brand { position: relative; top: 0; margin-bottom: 30px; } .tc { font-size: 36px; } .subtitle { font-size: 12px; letter-spacing: 8px; } .guest-btn { position: relative; bottom: 0; margin-top: 20px; } .globe { width: 220px; height: 220px; } }
</style>
</head>
<body>
<div class="bg"><canvas id="stars"></canvas><div class="decor d1"></div><div class="decor d2"></div><div class="decor d3"></div><div class="decor d4"></div></div>
<div class="main"><div class="wrap">
<div class="left">
<div class="brand"><span class="brand-title">Future Career</span><span class="brand-dot">·</span><span class="brand-sub">AI智能职业规划平台</span></div>
<div class="globe-box"><div class="globe">
<svg viewBox="0 0 280 280">
<defs>
<linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8"/><stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.4"/></linearGradient>
<radialGradient id="g2" cx="40%" cy="40%" r="60%"><stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.3"/><stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.15"/><stop offset="100%" style="stop-color:#a855f7;stop-opacity:0"/></radialGradient>
<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<circle cx="140" cy="140" r="95" fill="url(#g2)" filter="url(#glow)"/>
<g stroke="url(#g1)" stroke-width="0.6" fill="none" opacity="0.7">
<circle cx="140" cy="140" r="35"/><circle cx="140" cy="140" r="55"/><circle cx="140" cy="140" r="75"/><circle cx="140" cy="140" r="90"/>
<line x1="45" y1="140" x2="235" y2="140"/><line x1="140" y1="45" x2="140" y2="235"/>
<line x1="70" y1="70" x2="210" y2="210"/><line x1="210" y1="70" x2="70" y2="210"/>
<line x1="55" y1="105" x2="225" y2="175"/><line x1="225" y1="105" x2="55" y2="175"/>
<line x1="105" y1="55" x2="175" y2="225"/><line x1="175" y1="55" x2="105" y2="225"/>
</g>
<g filter="url(#glow)">
<circle cx="140" cy="50" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/></circle>
<circle cx="230" cy="140" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.3s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2.3s" repeatCount="indefinite"/></circle>
<circle cx="140" cy="230" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.1s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2.1s" repeatCount="indefinite"/></circle>
<circle cx="50" cy="140" r="4" fill="#00d4ff"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/><animate attributeName="r" values="3;5;3" dur="2.2s" repeatCount="indefinite"/></circle>
<circle cx="75" cy="75" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/></circle>
<circle cx="205" cy="75" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.9s" repeatCount="indefinite"/></circle>
<circle cx="205" cy="205" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle>
<circle cx="75" cy="205" r="3" fill="#a855f7"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.1s" repeatCount="indefinite"/></circle>
<circle cx="105" cy="105" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite"/></circle>
<circle cx="175" cy="105" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/></circle>
<circle cx="175" cy="175" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite"/></circle>
<circle cx="105" cy="175" r="2.5" fill="#00d4ff"><animate attributeName="opacity" values="0.6;1;0.6" dur="2.1s" repeatCount="indefinite"/></circle>
<circle cx="140" cy="140" r="7" fill="#00d4ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/><animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite"/></circle>
</g>
</svg></div></div>
<div class="title-area"><div class="title"><span class="tc">AI</span><span class="tc">驱</span><span class="tc">动</span><span class="tc">职</span><span class="tc">业</span><span class="tc">导</span><span class="tc">航</span></div><div class="subtitle">智能匹配 · 精准导航 · 成就未来</div></div>
<button class="guest-btn" onclick="enterGuest()">游客模式开放预览</button></div>
<div class="right"><div class="card">
<div class="card-border"><div class="cr tl"></div><div class="cr tr"></div><div class="cr bl"></div><div class="cr br"></div><div class="edg top"></div><div class="edg bottom"></div><div class="edg-v left"></div><div class="edg-v right"></div></div>
<div class="card-header"><div class="tabs"><span class="tab active">智能工作台登录</span><span class="tab">智能工作台登录</span><span class="tab-more">...</span></div><h2 class="card-title">欢迎回来</h2><p class="card-sub">登录您的智能工作空间</p></div>
<form class="form" onsubmit="handleLogin(event)">
<div class="input-group"><div class="input-wrap"><span class="icon">👤</span><input type="text" id="username" class="inp" placeholder="账号" required></div></div>
<div class="input-group"><div class="input-wrap"><span class="icon">🔒</span><input type="password" id="password" class="inp" placeholder="密码" required></div><a href="#" class="forgot">忘记密码</a></div>
<div class="options"><label class="checkbox-label"><input type="checkbox" id="remember"><span class="checkbox"></span><span class="checkbox-text">记住我</span></label><button type="button" class="quick-guest" onclick="enterGuest()">游客预览</button></div>
<button type="submit" class="login-btn"><span class="shine"></span>立即登录</button>
</form>
<div class="divider"><div class="line"></div><span class="divider-text">或使用以下快捷登录</span><div class="line"></div></div>
<div class="social"><button class="sbtn" onclick="socialLogin('wechat')">💬</button><button class="sbtn" onclick="socialLogin('qq')">🐧</button><button class="sbtn" onclick="socialLogin('email')">📧</button></div>
</div></div></div></div>
"@

$part2 = @"
<script>
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}
function initStars() {
    stars = [];
    const n = Math.floor((canvas.width * canvas.height) / 3000);
    for (let i = 0; i < n; i++) {
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
function draw() {
    ctx.fillStyle = "rgba(10,6,26,0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
        s.phase += s.twinkleSpeed;
        const a = s.brightness * (0.3 + Math.sin(s.phase) * 0.7);
        const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 12);
        gr.addColorStop(0, "rgba(255,255,255," + (a * 0.25) + ")");
        gr.addColorStop(0.3, "rgba(200,220,255," + (a * 0.12) + ")");
        gr.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 12, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + a + ")";
        ctx.fill();
    });
    stars.forEach((s1, i) => {
        stars.forEach((s2, j) => {
            if (i < j) {
                const dx = s1.x - s2.x;
                const dy = s1.y - s2.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 80) {
                    ctx.beginPath();
                    ctx.moveTo(s1.x, s1.y);
                    ctx.lineTo(s2.x, s2.y);
                    ctx.strokeStyle = "rgba(200,220,255," + ((1 - d / 80) * 0.06) + ")";
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        });
    });
    requestAnimationFrame(draw);
}
resize();
window.addEventListener("resize", resize);
draw();
function handleLogin(e) {
    e.preventDefault();
    if (document.getElementById("username").value && document.getElementById("password").value) {
        alert("登录成功");
        window.location.href = "/";
    }
}
function enterGuest() {
    alert("进入游客模式");
    window.location.href = "/";
}
function socialLogin(t) {
    const n = { wechat: "微信", qq: "QQ", email: "邮箱" };
    alert("跳转" + n[t] + "登录");
}
</script>
</body>
</html>
"@

$part1 + $part2 | Out-File -FilePath "ai-career-login.html" -Encoding utf8
Write-Host "File created successfully!"
