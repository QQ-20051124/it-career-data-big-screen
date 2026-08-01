# ============================================================
#  注册 Windows 任务计划程序 - IT 人才政策每日爬取
#  以管理员身份运行 PowerShell，执行：
#      powershell -ExecutionPolicy Bypass -File "policy_crawler\register_task.ps1"
#
#  默认每日 06:00 与 18:00 各执行一次（可在下方 $times 修改）
#  卸载任务：schtasks /Delete /TN "IT_Policy_Crawler" /F
# ============================================================

$projectRoot = "D:\python\IT1\it-career-data-big-screen"
$batPath = Join-Path $projectRoot "policy_crawler\run_daily.bat"
$taskName = "IT_Policy_Crawler"

# 每日执行时间（24小时制）
$times = @("06:00", "18:00")

# 检查 bat 文件是否存在
if (-not (Test-Path $batPath)) {
    Write-Host "未找到 $batPath，请确认路径。" -ForegroundColor Red
    exit 1
}

# 若任务已存在则先删除
$existing = schtasks /Query /TN $taskName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "任务 $taskName 已存在，正在更新..." -ForegroundColor Yellow
    schtasks /Delete /TN $taskName /F | Out-Null
}

# 注册任务（多个触发时间用 SCHEMA 方式，这里简化为循环创建独立触发器）
foreach ($t in $times) {
    $cmd = "schtasks /Create /TN `"$taskName`" /TR `"`"$batPath`"`" /SC DAILY /ST $t /F"
    if ($t -eq $times[0]) {
        # 首个时间点创建任务
        Invoke-Expression $cmd
    } else {
        # 追加触发器：先导出 XML 再合并较复杂，此处用单独任务名区分
        $subName = "$taskName`_$t"
        $subCmd = "schtasks /Create /TN `"$subName`" /TR `"`"$batPath`"`" /SC DAILY /ST $t /F"
        Invoke-Expression $subCmd
    }
}

Write-Host ""
Write-Host "已注册每日定时任务：" -ForegroundColor Green
Write-Host "  任务名: $taskName" -ForegroundColor Cyan
Write-Host "  执行时间: $($times -join ', ')" -ForegroundColor Cyan
Write-Host "  执行脚本: $batPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "查看任务: schtasks /Query /TN $taskName" -ForegroundColor Gray
Write-Host "手动触发: schtasks /Run /TN $taskName" -ForegroundColor Gray
Write-Host "卸载任务: schtasks /Delete /TN $taskName /F" -ForegroundColor Gray
