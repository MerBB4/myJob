@echo off
chcp 65001 >nul
title 考编笔记 - Dev Server

echo ============================================
echo   考编笔记系统 - 启动开发环境
echo ============================================
echo.

:: 切到项目根目录
cd /d "%~dp0.."

:: 检查 MySQL 是否在运行
echo [1/3] 检查 MySQL 连接...
mysqladmin -u root -proot ping -h 127.0.0.1 -P 3306 >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] MySQL 未响应，请确保 MySQL 服务已启动
    echo         net start MySQL 或手动启动 MySQL 服务
    echo.
    choice /c yn /m "是否继续启动（跳过数据库检查）？"
    if errorlevel 2 exit /b 1
) else (
    echo [ OK ] MySQL 连接正常
)

:: 检查 node_modules
echo.
echo [2/3] 检查依赖...
if not exist "node_modules\" (
    echo [信息] node_modules 不存在，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo [ OK ] node_modules 已存在
)

:: 保存 PID
set PID_FILE=%TEMP%\exam-note-dev.pid

:: 如果之前有残留进程，先清理
if exist "%PID_FILE%" (
    set /p OLD_PID=<"%PID_FILE%"
    taskkill /pid !OLD_PID! /f >nul 2>&1
    del "%PID_FILE%" >nul 2>&1
)

:: 启动开发服务器
echo.
echo [3/3] 启动 Next.js 开发服务器...
echo.
echo ============================================
echo   服务启动中...
echo   访问地址: http://localhost:3000
echo   按 Ctrl+C 停止服务
echo ============================================
echo.

start "" /b npm run dev

:: 等待服务器启动后打开浏览器
echo 正在等待服务器就绪...
timeout /t 5 /nobreak >nul
start "" http://localhost:3000

echo.
echo [ OK ] 开发服务器已启动！

:: 保持窗口打开
pause
