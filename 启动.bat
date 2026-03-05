@echo off
chcp 65001 >nul
echo ========================================
echo    秋招投递记录管理系统 启动中...
echo ========================================
echo.

cd /d "%~dp0"

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [1/2] 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败，请确保已安装 Node.js
        pause
        exit /b 1
    )
) else (
    echo [1/2] 依赖已安装，跳过安装步骤
)

echo.
echo [2/2] 正在启动服务...
echo.
echo ========================================
echo    启动成功！浏览器将自动打开
echo    访问地址: http://localhost:3000
echo    按 Ctrl+C 停止服务
echo ========================================
echo.

call npm run dev

pause