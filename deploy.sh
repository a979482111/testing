#!/bin/bash

# 贪吃蛇游戏 - 一键部署脚本
# 适用于 Linux/Mac 服务器

echo "🚀 开始部署贪吃蛇游戏..."

# 1. 安装前端依赖
echo "📦 安装前端依赖..."
pnpm install

# 2. 构建前端
echo "🔨 构建前端..."
pnpm build

# 3. 安装后端生产依赖
echo "📦 安装后端依赖..."
cd backend
pnpm install --prod

# 4. 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data

# 5. 启动服务
echo "🚀 启动服务..."
echo "服务将运行在 http://localhost:3001"
echo "按 Ctrl+C 停止服务"

NODE_ENV=production node index.js
