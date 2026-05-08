@echo off
chcp 65001 >nul
echo 🚀 开始部署贪吃蛇游戏...

REM 1. 安装前端依赖
echo 📦 安装前端依赖...
call pnpm install

REM 2. 构建前端
echo 🔨 构建前端...
call pnpm build

REM 3. 安装后端生产依赖
echo 📦 安装后端依赖...
cd backend
call pnpm install --prod

REM 4. 创建数据目录
echo 📁 创建数据目录...
if not exist "data" mkdir data

REM 5. 启动服务
echo 🚀 启动服务...
echo 服务将运行在 http://localhost:3001
echo 按 Ctrl+C 停止服务

set NODE_ENV=production
node index.js
