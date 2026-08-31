@echo off
chcp 65001 >nul
title IT职业大数据大屏 - 启动脚本
color 0A

REM ============================================================
REM  IT职业大数据可视化导航系统 - 一键启动
REM  同时启动 后端 API (:3001) + 前端 Vue 开发服务器 (:8080)
REM ============================================================

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo  ========================================================
echo   IT职业大数据可视化导航系统
echo   正在启动项目...
echo  ========================================================
echo.

REM --- 1. 检查 Node.js ---
where node >nul 2>nul
if errorlevel 1 (
    echo  [错误] 未检测到 Node.js，请先安装 Node.js 16+
    echo  下载地址: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo  [OK] Node.js: %NODE_VER%

REM --- 2. 检查前端依赖 ---
if not exist "%PROJECT_DIR%node_modules" (
    echo  [安装] 正在安装前端依赖（npm install）...
    call npm install
    if errorlevel 1 (
        echo  [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo  [OK] 前端依赖已就绪
)

REM --- 3. 检查后端依赖 ---
if not exist "%PROJECT_DIR%backend\node_modules" (
    echo  [安装] 正在安装后端依赖（backend\下 npm install）...
    cd /d "%PROJECT_DIR%backend"
    call npm install
    if errorlevel 1 (
        echo  [错误] 后端依赖安装失败
        pause
        exit /b 1
    )
    cd /d "%PROJECT_DIR%"
) else (
    echo  [OK] 后端依赖已就绪
)

REM --- 4. 检查端口是否已被占用 ---
echo  [检查] 端口占用情况...
set "BACKEND_BUSY=0"
set "FRONTEND_BUSY=0"

powershell -NoProfile -Command "try { $c = Get-NetTCPConnection -LocalPort 3001 -ErrorAction Stop; if ($c) { exit 1 } } catch { exit 0 }" >nul 2>nul
if errorlevel 1 set "BACKEND_BUSY=1"

powershell -NoProfile -Command "try { $c = Get-NetTCPConnection -LocalPort 8080 -ErrorAction Stop; if ($c) { exit 1 } } catch { exit 0 }" >nul 2>nul
if errorlevel 1 set "FRONTEND_BUSY=1"

if "%BACKEND_BUSY%"=="1" echo  [警告] 端口 3001 已被占用，后端可能已在运行
if "%FRONTEND_BUSY%"=="1" echo  [警告] 端口 8080 已被占用，前端可能已在运行

REM --- 5. 启动后端（新窗口） ---
if "%BACKEND_BUSY%"=="0" (
    echo.
    echo  [启动] 正在启动后端 API 服务 (端口 3001)...
    start "IT-Career Backend" /D "%PROJECT_DIR%backend" cmd /k "node server.js"
    timeout /t 3 /nobreak >nul
)

REM --- 6. 启动前端（新窗口） ---
if "%FRONTEND_BUSY%"=="0" (
    echo  [启动] 正在启动前端 Vue 开发服务器 (端口 8080)...
    start "IT-Career Frontend" /D "%PROJECT_DIR%" cmd /k "npm run serve"
    timeout /t 5 /nobreak >nul
)

REM --- 7. 完成 ---
echo.
echo  ========================================================
echo   启动完成！
echo.
echo   后端 API:   http://localhost:3001
echo   前端页面:   http://localhost:8080
echo.
echo   首次启动或修改后需要等待 1-2 分钟编译
echo   请在浏览器中打开 http://localhost:8080 访问
echo.
echo   关闭此窗口不会停止服务
echo   要停止服务，请关闭 "IT-Career Backend" 和
echo   "IT-Career Frontend" 两个命令行窗口
echo  ========================================================
echo.

REM 自动打开浏览器
start "" http://localhost:8080

timeout /t 3 /nobreak >nul
