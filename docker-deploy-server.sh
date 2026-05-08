#!/bin/bash

# 贪吃蛇游戏 - 服务器一键部署脚本
# 使用方法：ssh root@服务器 IP 'bash -s' < docker-deploy-server.sh

echo "========================================"
echo "  🚀 贪吃蛇游戏 - 服务器部署"
echo "========================================"
echo

# 项目路径
PROJECT_PATH="/root/snake-game"

echo "📁 部署路径：$PROJECT_PATH"
echo

# 1. 创建项目目录
echo "📁 创建项目目录..."
mkdir -p $PROJECT_PATH
cd $PROJECT_PATH

# 2. 加载 Docker 镜像（如果已上传）
if [ -f "snake-game.tar" ]; then
    echo "📦 加载 Docker 镜像..."
    docker load -i snake-game.tar
    rm snake-game.tar  # 删除 tar 文件节省空间
else
    echo "⚠️  未找到镜像文件，尝试从 Docker Hub 拉取..."
    # 如果有 Docker Hub 镜像，取消下面的注释
    # docker pull 你的用户名/snake-game:latest
fi

# 3. 创建 docker-compose.yml（如果不存在）
if [ ! -f "docker-compose.yml" ]; then
    echo "📝 创建 docker-compose.yml..."
    cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  snake-game:
    image: snake-game:latest
    # 或者使用 Docker Hub 镜像:
    # image: your-username/snake-game:latest
    ports:
      - "3001:3001"
    volumes:
      - ./backend/data:/app/backend/data
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3001
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  snake-network:
    driver: bridge
EOF
fi

# 4. 启动服务
echo "🚀 启动 Docker 容器..."
docker-compose up -d

# 5. 检查状态
echo
echo "📊 检查服务状态..."
docker-compose ps

echo
echo "========================================"
echo "  ✅ 部署完成！"
echo "========================================"
echo
echo "🌐 访问地址：http://服务器IP:3001"
echo
echo "常用命令："
echo "  docker-compose ps          # 查看状态"
echo "  docker-compose logs -f     # 查看日志"
echo "  docker-compose restart     # 重启服务"
echo "  docker-compose down        # 停止服务"
echo
echo "🔥 服务已后台运行，关闭 SSH 不影响服务！"
echo
