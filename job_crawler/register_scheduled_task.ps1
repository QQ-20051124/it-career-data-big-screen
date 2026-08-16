# ================================================
# Windows 定时任务注册脚本
# 功能：将爬虫注册为 Windows 定时任务
# 使用：以管理员身份运行此脚本
# ================================================

param(
    [string]$Action = "install",  # install=安装, uninstall=卸载, status=查看状态
    [string]$TaskName = "ITJobCrawler",
    [string]$StartTime = "08:00",
    [string]$EndTime = "20:00"
)

$ErrorActionPreference = "Continue"
$CrawlerPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$CrawlerScript = Join-Path $CrawlerPath "daily_crawler.py"
$PythonExe = "python"

function Install-Task {
    Write-Host "=== 安装 Windows 定时任务 ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "任务名称: $TaskName"
    Write-Host "爬虫脚本: $CrawlerScript"
    Write-Host "执行时间: 每日 $StartTime 和 $EndTime"
    Write-Host ""
    
    # 删除已存在的任务
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "[INFO] 发现已存在的任务，正在删除..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    
    # 创建触发器 - 每天执行两次
    $trigger1 = New-ScheduledTaskTrigger -Daily -At $StartTime
    $trigger2 = New-ScheduledTaskTrigger -Daily -At $EndTime
    
    # 设置任务重复间隔（每12小时一次）
    $trigger1.Repetition.Interval = [TimeSpan]::FromHours(24)
    
    # 创建任务动作
    $action = New-ScheduledTaskAction `
        -Execute $PythonExe `
        -Argument "`"$CrawlerScript`"" `
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
        -Trigger $trigger1, $trigger2 `
        -Principal $principal `
        -Settings $settings `
        -Description "IT岗位爬虫 - 每日定时更新招聘数据" `
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
