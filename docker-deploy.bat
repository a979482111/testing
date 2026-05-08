@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 贪吃蛇游戏 - Docker 部署到服务器
echo ========================================
echo.

REM 配置服务器信息（请修改为你的服务器信息）
set SERVER_USER=root
set SERVER_IP=你的服务器IP
set SERVER_PATH=/root/snake-game

echo ⚠️  请修改脚本中的服务器配置：
echo    SERVER_USER=%SERVER_USER%
echo    SERVER_IP=%SERVER_IP%
echo    SERVER_PATH=%SERVER_PATH%
echo.
echo 按任意键继续...
pause >nul

echo.
echo 📦 步骤 1: 构建 Docker 镜像...
docker build -t snake-game:latest .
if errorlevel 1 (
    echo ❌ Docker 镜像构建失败
    pause
    exit /b 1
)
echo ✅ Docker 镜像构建完成

echo.
echo 📦 步骤 2: 保存镜像为 tar 文件...
docker save -o snake-game.tar snake-game:latest
if errorlevel 1 (
    echo ❌ 保存镜像失败
    pause
    exit /b 1
)
echo ✅ 镜像已保存为 snake-game.tar

echo.
echo 📤 步骤 3: 上传到服务器...
echo 请确保已配置 SSH 密钥或使用密码登录
scp snake-game.tar %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/
if errorlevel 1 (
    echo ❌ 上传失败，请检查网络连接和服务器配置
    pause
    exit /b 1
)
echo ✅ 上传成功

echo.
echo 📋 步骤 4: 在服务器上执行以下命令：
echo.
echo ssh %SERVER_USER%@%SERVER_IP%
echo cd %SERVER_PATH%
echo docker load -i snake-game.tar
echo docker-compose up -d
echo.
echo ========================================
echo 🎉 本地操作完成！请在服务器上继续执行
echo ========================================
pause
