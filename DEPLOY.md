# 🚀 贪吃蛇游戏 - 部署指南

本指南将帮助你把贪吃蛇游戏部署到服务器，让玩家可以通过网络访问。

---

## 📋 目录

1. [快速开始（Docker 一键部署）](#快速开始 docker-一键部署)
2. [方案对比](#方案对比)
3. [方案一：前后端合并部署（推荐）](#方案一前后端合并部署推荐)
4. [方案二：使用 PM2 进程管理](#方案二使用 pm2 进程管理)
5. [方案三：Docker 容器化部署](#方案三 docker-容器化部署)
6. [域名和 HTTPS 配置](#域名和 https 配置)
7. [常见问题](#常见问题)

---

## 快速开始（Docker 一键部署）🚀

### 方式 1：服务器直接构建（最简单）

```bash
# 1. SSH 登录服务器
ssh root@你的服务器 IP

# 2. 安装 Docker（如果是第一次）
curl -fsSL https://get.docker.com | sh

# 3. 克隆项目代码
git clone <你的仓库地址>
cd test2

# 4. 一键构建并启动
docker-compose up -d --build

# 5. 查看状态
docker-compose logs -f
```

访问 `http://服务器IP:3001` 即可！

### 方式 2：本地构建镜像后上传

**在本地 Windows 执行：**
```bash
# 修改 docker-deploy.bat 中的服务器配置，然后双击运行
docker-deploy.bat
```

**在服务器执行：**
```bash
# SSH 登录服务器
ssh root@你的服务器 IP

# 运行部署脚本
bash docker-deploy-server.sh
```

---

## 方案对比

| 方案 | 难度 | 端口数 | 适用场景 |
|------|------|--------|----------|
| **Docker 一键部署** | ⭐ 简单 | 1 个 | **推荐！生产环境、个人项目** |
| **方案一：合并部署** | ⭐ 简单 | 1 个 | 学习 Docker 前的过渡方案 |
| **方案二：PM2 管理** | ⭐⭐ 中等 | 1 个 | 无 Docker 环境的服务器 |
| **方案三：Docker 高级** | ⭐⭐⭐ 复杂 | 1 个 | 需要自定义镜像、CI/CD |

---

## 方案一：前后端合并部署（推荐）⭐

### 本地构建

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 上传到服务器

使用 SCP 或 FTP 将以下文件上传到服务器：
```
- dist/              # 前端构建产物
- backend/           # 后端代码（不含 node_modules）
- package.json
- pnpm-lock.yaml
```

### 服务器上操作

```bash
# 1. 安装 Node.js 和 pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 2. 进入项目目录
cd /path/to/snake-game

# 3. 安装依赖并构建
pnpm install
pnpm build

# 4. 安装后端依赖
cd backend
pnpm install --prod

# 5. 启动服务
NODE_ENV=production node index.js
```

访问 `http://服务器IP:3001` 即可游戏！

---

## 方案二：使用 PM2 进程管理 ⭐⭐

PM2 可以让你的服务在后台持续运行，自动重启。

### 安装 PM2

```bash
npm install -g pm2
```

### 启动服务

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 停止服务
pm2 stop snake-game

# 重启服务
pm2 restart snake-game
```

### 开机自启动

```bash
# 生成开机自启动脚本
pm2 startup

# 保存当前进程列表
pm2 save
```

---

## 方案三：Docker 容器化部署（高级）⭐⭐⭐

> **提示：** 90% 的用户使用上面的「快速开始」即可，本节适合需要自定义镜像的用户。

### 构建镜像

```bash
# 本地构建
docker build -t snake-game:latest .

# 查看镜像
docker images snake-game
```

### 推送镜像到 Docker Hub（可选）

```bash
# 登录 Docker Hub
docker login

# 标记镜像（替换为你的 Docker Hub 用户名）
docker tag snake-game:latest your-username/snake-game:latest

# 推送
docker push your-username/snake-game:latest
```

### 从 Docker Hub 拉取（在服务器上）

```bash
docker pull your-username/snake-game:latest
```

### 运行容器

```bash
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/backend/data:/app/backend/data \
  --name snake-game \
  snake-game
```

### Docker Compose（推荐）

```yaml
# docker-compose.yml
version: '3.8'
services:
  snake-game:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./backend/data:/app/backend/data
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3001
```

启动：
```bash
docker-compose up -d
```

---

## 域名和 HTTPS 配置

### 使用 Nginx 反向代理

安装 Nginx 后，配置 `/etc/nginx/sites-available/snake-game`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 使用 Let's Encrypt 免费 HTTPS

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

---

## 常见问题

### Q0: 如何用 Docker 部署到服务器？（新手必读）

**完整步骤：**

```bash
# 步骤 1: SSH 登录服务器
ssh root@你的服务器 IP

# 步骤 2: 安装 Docker（首次部署需要）
curl -fsSL https://get.docker.com | sh

# 步骤 3: 验证 Docker 安装
docker --version
docker-compose --version

# 步骤 4: 克隆项目代码
git clone <你的仓库地址>
cd test2

# 步骤 5: 一键构建并启动
docker-compose up -d --build

# 步骤 6: 查看部署状态
docker-compose ps
docker-compose logs -f
```

**访问：** `http://服务器 IP:3001`

**停止服务：** `docker-compose down`

**重启服务：** `docker-compose restart`

### Q1: 玩家无法连接？
- 检查服务器防火墙：`ufw allow 3001`
- 检查云服务商安全组规则

### Q2: 排行榜数据丢失？
- 确保 `backend/data` 目录有写入权限
- 使用 Docker 时挂载数据卷

### Q3: 服务崩溃了？
- 使用 PM2 可以自动重启
- 查看日志：`pm2 logs` 或 `docker logs snake-game`

### Q4: 如何更新代码？

**使用 Docker 部署时：**

```bash
# 1. 拉取新代码
git pull

# 2. 重新构建并重启
docker-compose up -d --build

# 或者只重启容器（如果代码已更新）
docker-compose restart
```

**使用 PM2 部署时：**
```bash
# 1. 拉取新代码
git pull

# 2. 重新构建
pnpm build

# 3. 重启服务
pm2 restart snake-game
```

---

## 推荐云服务商

- **国内**：阿里云、腾讯云、华为云
- **国外**：Vultr、DigitalOcean、Linode
- **免费额度**：Oracle Cloud、Google Cloud

---

## 技术栈

- **前端**：Vue 3 + Vite
- **后端**：Node.js + Express
- **部署**：PM2 / Docker
- **反向代理**：Nginx（可选）

---

祝你部署成功！🎮
