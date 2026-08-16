@echo off
chcp 65001 >nul
title IT岗位爬虫 - 每日定时更新

echo ================================================
echo   IT岗位爬虫 - 每日定时更新
echo   运行时间: 每日 08:00 和 20:00
echo ================================================
echo.

cd /d "%~dp0"
python daily_crawler.py

echo.
echo 爬虫已停止
pause
