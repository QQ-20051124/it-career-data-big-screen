@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  一键发布到公网（localtunnel 方案，已验证可用）
REM
REM  使用方法：双击本文件
REM  结果：控制台显示一个 https://xxx.loca.lt 网址
REM  把网址发给朋友即可，朋友输入服务器 IP 通过验证就能看
REM
REM  重要：不要关闭弹出的两个黑窗口！关了网址就失效！
REM ============================================================

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║   IT 职业大数据大屏 —— 发布到公网                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.

REM ---------- 1. 启动后端 ----------
echo [1/2] 启动后端服务...
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo       后端已在运行，跳过
) else (
    start "IT-Career Backend (勿关闭)" /D "%PROJECT_DIR%backend" cmd /k "node server.js"
    echo       等待后端就绪...
    set /a tries=0
    :wait_backend
    curl.exe -s -o nul http://localhost:3001/api/health 2>nul
    if errorlevel 1 (
        timeout /t 2 /nobreak >nul
        set /a tries+=1
        if !tries! GEQ 15 (
            echo       ✗ 后端启动失败，请检查 Node.js 是否安装
            pause
            exit /b 1
        )
        goto wait_backend
    )
    echo       后端已就绪 ✓
)

REM ---------- 2. 启动 localtunnel ----------
echo.
echo [2/2] 生成公网网址（localtunnel）...
echo       首次运行会自动安装，请稍等...
echo.
echo  ══════════════════════════════════════════════════════
echo   下面会显示一行 "your url is: https://xxx.loca.lt"
echo   那个就是你的公网网址，复制发给朋友即可！
echo  ══════════════════════════════════════════════════════
echo.

REM localtunnel 在当前窗口前台运行，显示 URL，窗口保持开着
npx -y localtunnel --port 3001

REM 如果 localtunnel 退出（比如 Ctrl+C），提示
echo.
echo  公网网址已失效。重新双击本文件即可获取新网址。
pause
