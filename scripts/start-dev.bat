@echo off
title KaoBian Note - Dev Server

echo ============================================
echo   KaoBian Note - Start Dev Server
echo ============================================
echo.

cd /d "%~dp0.."

echo [1/3] Checking node_modules...
if not exist node_modules (
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

echo.
echo [2/3] Cleaning port 3000 and 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    taskkill /pid %%a /f >nul 2>&1
    echo        Killed port 3000 (PID: %%a)
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING" 2^>nul') do (
    taskkill /pid %%a /f >nul 2>&1
    echo        Killed port 3001 (PID: %%a)
)

echo.
echo [3/3] Starting services...
echo.

:: Start terminal WebSocket server
start "KaoBian-Terminal" cmd /c "node scripts/terminal-server.mjs"
echo        Terminal WS server started on port 3001

:: Start Next.js dev server (foreground)
echo.
echo ============================================
echo   Starting Next.js dev server...
echo   http://localhost:3000
echo   Close this window to stop all services
echo ============================================
echo.

npm run dev

:: Cleanup on exit
taskkill /fi "WINDOWTITLE eq KaoBian-Terminal" /f >nul 2>&1
pause
