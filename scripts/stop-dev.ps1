# 考编笔记系统 - 停止开发环境 (PowerShell)
$host.UI.RawUI.WindowTitle = "考编笔记 - 停止服务"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  考编笔记系统 - 停止开发环境" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PidFile = "$env:TEMP\exam-note-dev.pid"
$killed = $false

# 1. 通过 PID 文件终止
Write-Host "[1/3] 通过 PID 文件终止..." -ForegroundColor Yellow
if (Test-Path $PidFile) {
    $oldPid = Get-Content $PidFile
    try {
        Stop-Process -Id $oldPid -Force -ErrorAction Stop
        Write-Host "[ OK ] 进程 $oldPid 已终止" -ForegroundColor Green
        $killed = $true
    } catch {
        Write-Host "[信息] 进程 $oldPid 已不存在" -ForegroundColor Gray
    }
    Remove-Item $PidFile -Force
} else {
    Write-Host "[信息] PID 文件不存在" -ForegroundColor Gray
}

# 2. 通过端口 3000 查找
Write-Host ""
Write-Host "[2/3] 检查端口 3000..." -ForegroundColor Yellow
$portProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
foreach ($conn in $portProcesses) {
    Write-Host "[信息] 发现端口 3000 占用进程 (PID: $($conn.OwningProcess))" -ForegroundColor Gray
    try {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
        Write-Host "[ OK ] 进程 $($conn.OwningProcess) 已终止" -ForegroundColor Green
        $killed = $true
    } catch {
        Write-Host "[错误] 无法终止进程 $($conn.OwningProcess)" -ForegroundColor Red
    }
}

# 3. 清理残留 node 进程
Write-Host ""
Write-Host "[3/3] 清理 node.exe 进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
foreach ($proc in $nodeProcesses) {
    try {
        Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        Write-Host "[信息] 已终止 node.exe (PID: $($proc.Id))" -ForegroundColor Gray
        $killed = $true
    } catch {}
}

Write-Host ""
if ($killed) {
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  [ OK ] 所有开发服务已停止" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host "============================================" -ForegroundColor Yellow
    Write-Host "  [信息] 没有发现运行中的开发服务" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2
