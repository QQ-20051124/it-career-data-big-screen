# Auto Start Backend on Login

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$logDir = Join-Path $projectRoot "logs"
$port = 3001
$stdoutLog = Join-Path $logDir "backend_stdout.log"
$stderrLog = Join-Path $logDir "backend_stderr.log"
$startLog = Join-Path $logDir "autostart.log"

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

function Write-StartLog($msg) {
    $line = "[" + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "] " + $msg
    Add-Content -Path $startLog -Value $line -Encoding UTF8
}

Write-StartLog "============ Auto Start Backend ============"

try {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop
    if ($conn) {
        Write-StartLog "Port $port already in use by PID=$($conn.OwningProcess), skip"
        exit 0
    }
} catch {
}

Write-StartLog "Starting node server.js ..."

$outLine = "`r`n[" + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "] ========= VBS Auto Start Backend =========`r`n"
Add-Content -Path $stdoutLog -Value $outLine -Encoding UTF8

$proc = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendDir -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -WindowStyle Hidden -PassThru

Start-Sleep -Seconds 6

try {
    $verify = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop
    if ($verify) {
        Write-StartLog "SUCCESS: PID=$($proc.Id), port $port listening"
    }
} catch {
    if (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue) {
        Write-StartLog "PARTIAL: node PID=$($proc.Id) running but port $port not listening yet"
    } else {
        Write-StartLog "FAIL: node process exited immediately"
    }
}
