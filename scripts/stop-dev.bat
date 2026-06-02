@echo off
chcp 65001 >nul
title 考编笔记 - 停止服务

echo ============================================
echo   考编笔记系统 - 停止开发环境
echo ============================================
echo.

set PID_FILE=%TEMP%\exam-note-dev.pid
set KILLED=0

:: 方式1: 通过 PID 文件杀掉进程
if exist "%PID_FILE%" (
    set /p OLD_PID=<"%PID_FILE%"
    echo [1/3] 通过 PID 文件终止进程 (PID: !OLD_PID!)...
    taskkill /pid !OLD_PID! /f /t >nul 2>&1
    if !errorlevel! equ 0 (
        echo [ OK ] 进程 !OLD_PID! 已终止
        set KILLED=1
    ) else (
        echo [信息] 进程 !OLD_PID! 已不存在
    )
    del "%PID_FILE%" >nul 2>&1
) else (
    echo [1/3] PID 文件不存在，跳过
)

:: 方式2: 通过端口 3000 查找并杀掉残留进程
echo.
echo [2/3] 检查端口 3000 残留进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    set PORT_PID=%%a
    echo [信息] 发现端口 3000 占用进程 (PID: !PORT_PID!)
    taskkill /pid !PORT_PID! /f /t >nul 2>&1
    if !errorlevel! equ 0 (
        echo [ OK ] 进程 !PORT_PID! 已终止
        set KILLED=1
    )
)

:: 方式3: 杀掉所有 node.exe 子进程（next dev 相关）
echo.
echo [3/3] 清理 node.exe 相关进程...
for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe" 2^>nul') do (
    set NODE_PID=%%a
    echo [信息] 终止 node.exe (PID: !NODE_PID!)...
    taskkill /pid !NODE_PID! /f /t >nul 2>&1
    set KILLED=1
)

echo.
if !KILLED! equ 1 (
    echo ============================================
    echo   [ OK ] 所有开发服务已停止
    echo ============================================
) else (
    echo ============================================
    echo   [信息] 没有发现运行中的开发服务
    echo ============================================
)

timeout /t 2 /nobreak >nul
exit /b 0
