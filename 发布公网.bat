@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  一键发布到公网（给朋友一个可访问的网址）
REM  流程：启动后端 → 下载/检测 cloudflared → 启动公网隧道
REM  如果 cloudflared 下载失败，自动回退到 SSH localhost.run
REM ============================================================

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║   IT 职业大数据大屏 —— 发布到公网                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.

REM ---------- 1. 检查后端是否已在跑 ----------
echo [1/4] 检查后端服务（端口 3001）...
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo       后端已在运行，跳过启动
) else (
    echo       启动后端...
    start "IT-Career Backend" /D "%PROJECT_DIR%backend" cmd /k "node server.js"
    echo       等待后端就绪...
    :wait_backend
    curl.exe -s http://localhost:3001/api/health >nul 2>&1
    if errorlevel 1 (
        timeout /t 2 /nobreak >nul
        goto wait_backend
    )
    echo       后端已就绪 ✓
)

REM ---------- 2. 准备 cloudflared ----------
echo.
echo [2/4] 准备 cloudflared 隧道工具...

set "CF_EXE=%USERPROFILE%\cloudflared.exe"
set "CF_URL=https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

if exist "%CF_EXE%" (
    echo       检测到已有 cloudflared.exe ✓
) else (
    echo       首次使用，正在下载 cloudflared（约 30MB）...
    echo       下载地址: %CF_URL%
    echo.
    curl.exe -L -o "%CF_EXE%" "%CF_URL%" --progress-bar
    if errorlevel 1 (
        echo.
        echo       ✗ curl 下载失败，尝试用 PowerShell 下载...
        powershell -Command "Invoke-WebRequest -Uri '%CF_URL%' -OutFile '%CF_EXE%'"
        if errorlevel 1 (
            echo.
            echo       ✗ cloudflared 下载失败！
            echo       将自动回退到 SSH localhost.run 方案...
            goto :fallback_ssh
        )
    )
    echo       cloudflared 下载完成 ✓
)

REM ---------- 3. 启动 cloudflared Quick Tunnel ----------
echo.
echo [3/4] 启动 cloudflared 公网隧道...
echo       cloudflared tunnel --url http://localhost:3001
echo.
echo       提示：首次启动需要几秒，请耐心等待...
echo.

REM 启动 cloudflared 并把输出写到临时文件
set "CF_LOG=%TEMP%\cf_tunnel.log"
if exist "%CF_LOG%" del "%CF_LOG%"

start "IT-Career Cloudflare Tunnel" cmd /k ""%CF_EXE%" tunnel --url http://localhost:3001 > "%CF_LOG%" 2>&1"

REM ---------- 4. 等待公网 URL 出现 ----------
echo.
echo [4/4] 获取公网访问地址...
set "PUBLIC_URL="
set /a WAIT_COUNT=0

:wait_cf_url
if %WAIT_COUNT% GEQ 30 (
    echo.
    echo       ⚠ 等待超时，仍未获取到公网地址
    echo       回退到 SSH localhost.run 方案...
    goto :fallback_ssh
)

if exist "%CF_LOG%" (
    for /f "tokens=*" %%l in ('findstr /i "trycloudflare.com" "%CF_LOG%" 2^>nul') do (
        REM 提取 URL
        for /f "tokens=2" %%u in ("%%l") do set "PUBLIC_URL=%%u"
    )
)

if not "%PUBLIC_URL%"=="" goto :show_url
timeout /t 1 /nobreak >nul
set /a WAIT_COUNT+=1
goto wait_cf_url

:show_url
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║              ✓ 公网发布成功！                      ║
echo  ╠══════════════════════════════════════════════════╣
echo  ║  公网访问地址:  %PUBLIC_URL%
echo  ║                                                    ║
echo  ║  把上面这个网址发给朋友，                          ║
echo  ║  他们用任何浏览器都能直接打开查看！                 ║
echo  ║                                                    ║
echo  ║  cloudflared 隧道窗口请勿关闭，                    ║
echo  ║  关闭后公网地址会失效。                            ║
echo  ║  下次发布运行本 bat 即可获取新地址。               ║
echo  ╚══════════════════════════════════════════════════╝
echo.
start "" "%PUBLIC_URL%"
pause
exit /b 0

REM ========== 回退方案：SSH localhost.run ==========
:fallback_ssh

echo.
echo ── 使用回退方案 SSH localhost.run ──
echo.

where ssh >nul 2>&1
if errorlevel 1 (
    echo ✗ 系统没找到 ssh 命令
    echo   请打开 Windows 设置 → 可选功能 → 添加 "OpenSSH 客户端"
    echo   或手动下载 cloudflared: %CF_URL%
    echo.
    pause
    exit /b 1
)

set "SSH_LOG=%TEMP%\ssh_tunnel.log"
if exist "%SSH_LOG%" del "%SSH_LOG%"

start "IT-Career SSH Tunnel" cmd /k "ssh -o StrictHostKeyChecking=no -tt -R 80:localhost:3001 nokey@localhost.run > "%SSH_LOG%" 2>&1"

echo 等待 localhost.run 分配地址...
set "PUBLIC_URL="
set /a WAIT_COUNT=0

:wait_ssh_url
if %WAIT_COUNT% GEQ 20 (
    echo ⚠ 超时，没拿到地址，请检查网络或手动重试
    pause
    exit /b 1
)

if exist "%SSH_LOG%" (
    for /f "tokens=*" %%l in ('findstr /i "lhr.life loca.lt" "%SSH_LOG%" 2^>nul') do (
        for /f "tokens=*" %%u in ("%%l") do set "PUBLIC_URL=%%u"
    )
)

if "%PUBLIC_URL%"=="" (
    timeout /t 1 /nobreak >nul
    set /a WAIT_COUNT+=1
    goto wait_ssh_url
)

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║              ✓ 公网发布成功（回退方案）             ║
echo  ╠══════════════════════════════════════════════════╣
echo  ║  公网访问地址:  %PUBLIC_URL%
echo  ║                                                    ║
echo  ║  把这个网址发给朋友即可访问。                      ║
echo  ║  SSH 窗口勿关闭，关闭后地址失效。                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.
start "" "%PUBLIC_URL%"
pause
exit /b 0
