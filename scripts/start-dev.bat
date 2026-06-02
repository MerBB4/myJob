@echo off
title KaoBian Note - Dev Server

echo ============================================
echo   KaoBian Note - Start Dev Server
echo ============================================
echo.

cd /d "%~dp0.."

echo [1/2] Checking node_modules...
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
echo [2/2] Cleaning port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    taskkill /pid %%a /f >nul 2>&1
    echo        Killed PID: %%a
)

echo.
echo ============================================
echo   Starting Next.js dev server...
echo   http://localhost:3000
echo   Close this window to stop
echo ============================================
echo.

npm run dev

pause
