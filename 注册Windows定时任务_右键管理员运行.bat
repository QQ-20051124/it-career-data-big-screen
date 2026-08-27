@echo off
chcp 65001 >nul
REM === 一键注册/修改 Windows 每日定时任务（需要【右键 → 以管理员身份运行】）===
setlocal
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"
set BAT_PATH=%PROJECT_DIR%auto_crawl_daily.bat
set TASK_NAME=IT就业数据_每日自动爬取

REM --- 允许用户传入自定义时间，默认 02:00 ---
set RUN_HOUR=%1
set RUN_MIN=%2
if "%RUN_HOUR%"=="" set RUN_HOUR=02
if "%RUN_MIN%"==""  set RUN_MIN=00
set RUN_TIME=%RUN_HOUR%:%RUN_MIN%

echo.
echo ============================================================
echo   注册 Windows 计划任务
echo   任务名 : %TASK_NAME%
echo   执行   : %BAT_PATH%
echo   时间   : 每天 %RUN_TIME%
echo ============================================================
echo.

REM 先删除旧任务
schtasks /Delete /TN "%TASK_NAME%" /F 2>nul

REM 创建任务（/IT 交互式、/SC DAILY 每天）
schtasks /Create /TN "%TASK_NAME%" /TR "\"%BAT_PATH%\"" /SC DAILY /ST %RUN_TIME% /F

if %ERRORLEVEL%==0 (
  echo.
  echo ✅ 任务注册成功！
  schtasks /Query /TN "%TASK_NAME%" /FO LIST
) else (
  echo.
  echo ❌ 创建失败，请【右键 → 以管理员身份运行】本脚本。
)

echo.
pause
endlocal
