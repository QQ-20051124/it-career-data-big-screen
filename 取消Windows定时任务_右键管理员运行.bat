@echo off
chcp 65001 >nul
set TASK_NAME=IT就业数据_每日自动爬取
echo 正在删除 Windows 计划任务: %TASK_NAME%
schtasks /Delete /TN "%TASK_NAME%" /F
if %ERRORLEVEL%==0 (echo ✅ 已删除) else (echo ⚠️ 删除失败或任务不存在)
echo.
pause
