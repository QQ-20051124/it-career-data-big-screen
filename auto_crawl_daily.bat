@echo off
chcp 65001 >nul
REM ============================================================
REM  IT学习与就业数据可视化导航系统 - 每日自动爬虫
REM  由Windows任务计划程序每天定时调用，无需用户登录
REM ============================================================

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

REM --- 日志路径（按日期）---
set LOGS_DIR=%PROJECT_DIR%logs
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
set LOG_FILE=%LOGS_DIR%\auto_crawl_%date:~0,4%%date:~5,2%%date:~8,2%.log

echo. >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"
echo  [AUTO-CRAWL] START %date% %time% >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"

REM --- 清锁 ---
if exist "%PROJECT_DIR%logs\crawler.run.lock" (
  del /F /Q "%PROJECT_DIR%logs\crawler.run.lock"
  echo [AUTO-CRAWL] CLEAN LOCK >> "%LOG_FILE%"
)

REM --- 启动爬虫（系统Python）---
set PYTHON_EXE=D:\python\python.exe
if not exist "%PYTHON_EXE%" (
  REM 兜底：找环境中的python
  for /f "delims=" %%i in ('where python 2^>nul ^| findstr /i "python.exe$"') do set "PYTHON_EXE=%%i"
)
if not exist "%PYTHON_EXE%" (
  echo [AUTO-CRAWL] ERROR Python not found, abort >> "%LOG_FILE%"
  exit /b 1
)

echo [AUTO-CRAWL] USE PYTHON: %PYTHON_EXE% >> "%LOG_FILE%"
echo [AUTO-CRAWL] RUN spider\run_all.py >> "%LOG_FILE%"

"%PYTHON_EXE%" -u "%PROJECT_DIR%spider\run_all.py" >> "%LOG_FILE%" 2>&1
set EXITCODE=%ERRORLEVEL%

echo. >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"
echo  [AUTO-CRAWL] END EXITCODE=%EXITCODE% %date% %time% >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"

exit /b %EXITCODE%
