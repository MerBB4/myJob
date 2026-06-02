@echo off
chcp 65001 >nul 2>&1
title 考编笔记 - Dev Server

echo ============================================
echo   KaoBian Note - Start Dev Server
echo ============================================
echo.

:: 切到项目根目录
cd /d "%~dp0.."

:: 检查 node_modules
echo [1/2] Checking node_modules...
if not exist "node_modules\" (
    echo        Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [ OK ] node_modules found
)

:: 清理旧的 dev server 进程
echo.
echo [2/2] Killing old dev server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    taskkill /pid %%a /f >nul 2>&1
    echo        Killed process on port 3000 (PID: %%a)
)

:: 启动
echo.
echo ============================================
echo   Starting Next.js dev server...
echo   http://localhost:3000
echo   Press Ctrl+C to stop
echo ============================================
echo.

:: 用 cmd /c 启动，这样 Ctrl+C 和窗口关闭都能正常终止
start "KaoBi-Note-Dev" cmd /c "npm run dev"

:: 等服务器启动
echo Waiting for server to be ready...
timeout /t 6 /nobreak >nul
start "" http://localhost:3000

echo.
echo [ OK ] Dev server started!
pause
