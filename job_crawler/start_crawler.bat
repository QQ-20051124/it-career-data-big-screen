@echo off
chcp 65001 >nul
title IT岗位爬虫 - 兼容Python 3.12 DrissionPage版（凌晨2点定时全量采集）

echo ================================================
echo   IT岗位爬虫 - 无地域限制全量采集
echo   运行环境: Python 3.12 + DrissionPage (.venv312)
echo   兼容站点: 智联招聘 + 猎聘网 + 前程无忧(13城市)
echo   运行时间: 每日 02:00（凌晨2点定时任务）
echo ================================================
echo.

cd /d "%~dp0"

REM ========== 定时任务执行前输出日志：任务启动时间 + 任务唯一标识 ==========
REM 唯一正式定时任务：每日凌晨 02:00 执行 spider/run_all.py
echo [%date% %time%] [TASK] 定时任务启动 ^| 唯一正式定时任务=ITJobCrawler ^| 入口=spider\run_all.py

REM ========== 使用 .venv312 (Python 3.12) 启动统一入口 ==========
REM   .venv (Python 3.15 alpha) 与 Playwright/greenlet 不兼容
REM   改为使用 .venv312 + DrissionPage 版爬虫，兼容全部3个站点

cd ..
".venv312\Scripts\python.exe" -u "spider\run_all.py"

REM 出错时暂停方便排查
if errorlevel 1 (
    echo.
    echo [ERROR] 爬虫运行出错，错误码=%errorlevel%
    pause
    exit /b %errorlevel%
)

echo.
echo 本次爬取完成
timeout /t 10 >nul
