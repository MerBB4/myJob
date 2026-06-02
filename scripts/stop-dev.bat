@echo off
chcp 65001 >nul 2>&1
title 考编笔记 - Stop Server

echo ============================================
echo   KaoBian Note - Stop Dev Server
echo ============================================
echo.

set KILLED=0

:: 杀掉端口 3000 上的进程
echo Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    taskkill /pid %%a /f /t >nul 2>&1
    if !errorlevel! equ 0 (
        echo [ OK ] Killed PID: %%a
        set KILLED=1
    )
)

echo.
if %KILLED% equ 1 (
    echo [ OK ] Dev server stopped.
) else (
    echo [INFO] No process found on port 3000.
)

timeout /t 2 /nobreak >nul
exit /b 0
