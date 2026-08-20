# ================================================
# Windows 定时任务注册脚本
# 功能：将爬虫注册为 Windows 定时任务（唯一正式定时任务）
# 使用：以管理员身份运行此脚本
#
# ⚠️ 唯一正式定时任务：每日凌晨 02:00 执行 spider/run_all.py（DrissionPage 版）
#   注册动作 = 调起 start_crawler.bat → .venv312\Scripts\python.exe spider\run_all.py
#   禁止再注册任何指向 daily_crawler.py（Playwright 旧版）的重复定时任务，
#   避免两套爬虫并行采集、重复写入主数据文件导致岗位数据丢失。
# ================================================

param(
    [string]$Action = "install",  # install=安装, uninstall=卸载, status=查看状态
    [string]$TaskName = "ITJobCrawler",
    [string]$StartTime = "02:00",  # 凌晨2点定时任务（唯一正式调度时间）
    [string]$EndTime = "02:00"
)

$ErrorActionPreference = "Continue"
$CrawlerPath = Split-Path -Parent $MyInvocation.MyCommand.Path
# 官方入口：start_crawler.bat（内部调起 spider/run_all.py，使用 .venv312 + DrissionPage）
$CrawlerBat = Join-Path $CrawlerPath "start_crawler.bat"

function Install-Task {
    Write-Host "=== 安装 Windows 定时任务（唯一正式定时任务） ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "任务名称: $TaskName"
    Write-Host "执行入口: $CrawlerBat（→ spider/run_all.py）"
    Write-Host "执行时间: 每日 $StartTime（凌晨2点定时任务）"
    Write-Host ""

    if (-not (Test-Path $CrawlerBat)) {
        Write-Host "[ERROR] 未找到官方入口 $CrawlerBat，终止注册。" -ForegroundColor Red
        exit 1
    }

    # 删除已存在的任务
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "[INFO] 发现已存在的任务，正在删除..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    # 创建触发器 - 每天凌晨2点执行
    $trigger1 = New-ScheduledTaskTrigger -Daily -At $StartTime

    # 设置任务重复间隔（每24小时一次）
    $trigger1.Repetition.Interval = [TimeSpan]::FromHours(24)
    
    # 创建任务动作：直接调起 start_crawler.bat（→ spider/run_all.py）
    $action = New-ScheduledTaskAction `
        -Execute "`"$CrawlerBat`"" `
        -WorkingDirectory $CrawlerPath
    
    # 设置任务主体
    $principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive `
        -RunLevel Highest
    
    # 设置任务设置
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 5)
    
    # 注册任务
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger1 `
        -Principal $principal `
        -Settings $settings `
        -Description "IT岗位爬虫 - 凌晨2点定时全量采集（无地域限制）" `
        -Force
    
    Write-Host "[OK] 定时任务安装成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "使用以下命令查看任务状态:" -ForegroundColor Cyan
    Write-Host "  Get-ScheduledTask -TaskName '$TaskName'"
    Write-Host ""
}

function Uninstall-Task {
    Write-Host "=== 卸载 Windows 定时任务 ===" -ForegroundColor Cyan
    
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[OK] 定时任务已卸载" -ForegroundColor Green
    } else {
        Write-Host "[INFO] 未找到名为 '$TaskName' 的任务" -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host "=== 查看定时任务状态 ===" -ForegroundColor Cyan
    
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Write-Host "[OK] 任务存在" -ForegroundColor Green
        Write-Host ""
        Write-Host "任务详细信息:" -ForegroundColor White
        $task | Format-List TaskName, State, Description, Author
        
        Write-Host ""
        Write-Host "触发器配置:" -ForegroundColor White
        $task.Triggers | Format-List *
        
        Write-Host ""
        Write-Host "上次运行结果:" -ForegroundColor White
        $info = Get-ScheduledTaskInfo -TaskName $TaskName
        $info | Format-List LastRunTime, LastTaskResult, NextRunTime
    } else {
        Write-Host "[INFO] 未找到名为 '$TaskName' 的任务" -ForegroundColor Yellow
        Write-Host "请先运行: .\register_scheduled_task.ps1 -Action install"
    }
}

# 执行操作
switch ($Action) {
    "install" { Install-Task }
    "uninstall" { Uninstall-Task }
    "status" { Show-Status }
    default {
        Write-Host "用法:" -ForegroundColor Cyan
        Write-Host "  安装: .\register_scheduled_task.ps1 -Action install"
        Write-Host "  卸载: .\register_scheduled_task.ps1 -Action uninstall"
        Write-Host "  状态: .\register_scheduled_task.ps1 -Action status"
        Write-Host ""
        Write-Host "自定义执行时间:"
        Write-Host "  .\register_scheduled_task.ps1 -Action install -StartTime `"09:00`" -EndTime `"21:00`""
    }
}
