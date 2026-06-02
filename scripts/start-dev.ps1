# 考编笔记系统 - 启动开发环境 (PowerShell)
$ErrorActionPreference = "Stop"
$host.UI.RawUI.WindowTitle = "考编笔记 - Dev Server"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  考编笔记系统 - 启动开发环境" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 切到项目根目录
Set-Location "$PSScriptRoot\.."
$ProjectRoot = Get-Location

# PID 文件
$PidFile = "$env:TEMP\exam-note-dev.pid"

# 1. 检查 MySQL
Write-Host "[1/3] 检查 MySQL 连接..." -ForegroundColor Yellow
try {
    $mysqlResult = & mysqladmin -u root -proot ping -h 127.0.0.1 -P 3306 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[ OK ] MySQL 连接正常" -ForegroundColor Green
    } else {
        Write-Host "[警告] MySQL 未响应" -ForegroundColor Magenta
        Write-Host "       请确保 MySQL 服务已启动 (net start MySQL)" -ForegroundColor Magenta
        $continue = Read-Host "是否继续启动？(y/n)"
        if ($continue -ne "y") { exit 1 }
    }
} catch {
    Write-Host "[警告] 未找到 mysqladmin，跳过数据库检查" -ForegroundColor Magenta
}

# 2. 检查依赖
Write-Host ""
Write-Host "[2/3] 检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "[信息] 正在安装依赖..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 依赖安装失败！" -ForegroundColor Red
        Read-Host "按 Enter 退出"
        exit 1
    }
} else {
    Write-Host "[ OK ] node_modules 已存在" -ForegroundColor Green
}

# 3. 清理旧进程
Write-Host ""
Write-Host "[3/3] 清理旧进程并启动..." -ForegroundColor Yellow

# 先停掉旧进程
if (Test-Path $PidFile) {
    $oldPid = Get-Content $PidFile
    try { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue } catch {}
    Remove-Item $PidFile -Force
}

# 杀掉端口 3000 上的残留
$portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($portProcess) {
    try { Stop-Process -Id $portProcess.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
}

# 启动 dev server
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  服务启动中..." -ForegroundColor Cyan
Write-Host "  访问地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  按 Ctrl+C 停止服务" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
$process.Id | Out-File -FilePath $PidFile -Encoding utf8

Write-Host "[ OK ] 开发服务器已启动 (PID: $($process.Id))" -ForegroundColor Green
Write-Host "PID 已保存到: $PidFile" -ForegroundColor Gray

# 打开浏览器
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

# 等待进程结束
try {
    Wait-Process -Id $process.Id
} catch {
    Write-Host "[信息] 服务器进程已退出" -ForegroundColor Yellow
} finally {
    if (Test-Path $PidFile) { Remove-Item $PidFile -Force }
}
