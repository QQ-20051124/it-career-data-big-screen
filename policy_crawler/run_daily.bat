@echo off
chcp 65001 >nul
REM ============================================================
REM  IT 人才政策数据 - 每日定时爬取（Windows 任务计划程序调用）
REM  作用：运行 policy_crawler.py，刷新 public/policy_data.json
REM  建议调度时间：每日 06:00 与 18:00（见 register_task.ps1）
REM ============================================================

cd /d "D:\python\IT1\it-career-data-big-screen"

REM 记录开始时间
echo [%date% %time%] 开始爬取政策数据 >> "policy_crawler\logs\run_daily.log"

REM 运行爬虫
python "policy_crawler\policy_crawler.py" >> "policy_crawler\logs\run_daily.log" 2>&1

echo [%date% %time%] 政策爬取结束 >> "policy_crawler\logs\run_daily.log"
echo. >> "policy_crawler\logs\run_daily.log"
