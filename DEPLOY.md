# 🚀 贪吃蛇游戏 - 部署指南

本指南将帮助你把贪吃蛇游戏部署到服务器，让玩家可以通过网络访问。

---

## 📋 目录

1. [快速开始（Docker 一键部署 - 推荐）](#快速开始 docker-一键部署---推荐)
2. [方案一：使用 PM2 进程管理](#方案一使用 pm2-进程管理)
3. [方案二：直接运行](#方案二直接运行)
4. [配置域名和 HTTPS](#配置域名和 https)
5. [常见问题](#常见问题)

---

## 快速开始（Docker 一键部署 - 推荐）⭐⭐⭐

**最简单、最可靠的部署方式！**

### 步骤 1：准备服务器

SSH 登录你的服务器：
```bash
ssh root@你的服务器 IP
```

### 步骤 2：安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh

# CentOS
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
```

### 步骤 3：克隆项目代码

```bash
git clone https://github.com/a979482111/testing.git
cd testing
```

### 步骤 4：一键启动

```bash
docker-compose up -d --build
```

### 步骤 5：查看状态

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 按 Ctrl+C 退出日志
```

### 步骤 6：配置防火墙

**Ubuntu/Debian:**
```bash
ufw allow 3001
ufw allow 22
ufw enable
```

**CentOS:**
```bash
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload
```

**云服务器（阿里云/腾讯云等）：**
还需要在控制台配置安全组，开放 3001 端口。

### 步骤 7：访问游戏

浏览器打开：
```
http://你的服务器 IP:3001
```

---

## Docker 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build

# 更新代码后重新部署
git pull
docker-compose up -d --build
```

---

## 方案一：使用 PM2 进程管理 ⭐⭐

适合没有 Docker 环境的服务器。

### 步骤 1：安装 Node.js 和 pnpm

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 验证安装
node --version
pnpm --version
```

### 步骤 2：安装 PM2

```bash
npm install -g pm2
```

### 步骤 3：克隆项目并安装依赖

```bash
git clone https://github.com/a979482111/testing.git
cd testing

# 安装所有依赖（重要：在项目根目录安装）
pnpm install --prod

# 构建前端
pnpm build
```

### 步骤 4：使用 PM2 启动

```bash
# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 开机自启动
pm2 startup
pm2 save
```

### 步骤 5：配置防火墙

同上（Docker 部署的步骤 6）。

### 常用 PM2 命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart snake-game

# 停止服务
pm2 stop snake-game

# 删除服务
pm2 delete snake-game

# 查看详细信息
pm2 show snake-game
```

---

## 方案二：直接运行 ⭐

适合测试或临时部署。

### 步骤 1：安装 Node.js 和 pnpm

同 PM2 方案的步骤 1。

### 步骤 2：克隆项目并安装依赖

```bash
git clone https://github.com/a979482111/testing.git
cd testing

# 安装所有依赖（重要：在项目根目录安装）
pnpm install --prod

# 构建前端
pnpm build
```

### 步骤 3：启动服务

```bash
# 使用 PM2（推荐，可自动重启）
pm2 start ecosystem.config.js

# 或直接运行（不推荐，关闭终端服务会停止）
NODE_ENV=production node backend/index.js
```

### 后台运行（如果不使用 PM2）

```bash
# 使用 nohup 后台运行
nohup NODE_ENV=production node backend/index.js > output.log 2>&1 &

# 查看进程
ps aux | grep node

# 查看日志
tail -f output.log

# 停止服务
kill $(ps aux | grep 'node backend/index.js' | grep -v grep | awk '{print $2}')
```

---

## 💡 为什么在项目根目录安装依赖？

后端的 `backend/index.js` 使用 ES Module (`import express from 'express'`)，依赖需要安装在项目根目录（`package.json` 所在目录）。

**❌ 错误做法：**
```bash
cd backend
pnpm install --prod  # 依赖安装在 backend/node_modules
node index.js        # ❌ 报错：Cannot find package 'express'
```

**✅ 正确做法：**
```bash
# 在项目根目录安装所有依赖
pnpm install --prod  # ✅ 依赖安装在 node_modules
pnpm build
node backend/index.js  # ✅ 可以正常访问 express
```

---

## 配置域名和 HTTPS

### 使用 Nginx 反向代理

安装 Nginx：
```bash
# Ubuntu/Debian
apt install -y nginx

# CentOS
yum install -y nginx
```

配置 `/etc/nginx/sites-available/snake-game`：
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

启用配置：
```bash
ln -s /etc/nginx/sites-available/snake-game /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 使用 Let's Encrypt 免费 HTTPS

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com
```

---

## 常见问题

### Q1: 无法访问 3001 端口？

**检查防火墙：**
```bash
# Ubuntu
ufw status
ufw allow 3001

# CentOS
firewall-cmd --list-ports
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload
```

**检查云服务器安全组：**
登录云控制台（阿里云/腾讯云），确认已开放 3001 端口。

**检查服务是否运行：**
```bash
# Docker
docker-compose ps

# PM2
pm2 status

# 直接运行
ps aux | grep node
```

### Q2: 排行榜数据丢失？

**Docker 部署：** 确保 `docker-compose.yml` 中配置了数据卷挂载：
```yaml
volumes:
  - ./backend/data:/app/backend/data
```

**PM2/直接运行：** 确保 `backend/data` 目录有写入权限：
```bash
chmod 755 backend/data
```

### Q3: 服务崩溃了？

**使用 PM2：** 会自动重启，查看日志：
```bash
pm2 logs
```

**使用 Docker：** 查看日志：
```bash
docker-compose logs
```

### Q4: 如何更新代码？

**Docker 部署：**
```bash
git pull
docker-compose up -d --build
```

**PM2 部署：**
```bash
git pull
pnpm install --prod
pnpm build
pm2 restart snake-game
```

### Q5: 如何查看服务器 IP？

```bash
# 在服务器上执行
curl ifconfig.me
```

### Q6: Docker 构建失败？

**清理缓存重新构建：**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**查看构建日志：**
```bash
docker-compose build --progress=plain
```

---

## 推荐云服务商

| 服务商 | 价格 | 特点 |
|--------|------|------|
| **阿里云** | ~¥99/年 | 国内访问快，适合新手 |
| **腾讯云** | ~¥99/年 | 性价比高，游戏优化 |
| **华为云** | ~¥88/年 | 国产自研，安全稳定 |
| **Vultr** | $5/月 | 按小时计费，随时删除 |
| **DigitalOcean** | $6/月 | 开发者友好，文档完善 |

---

## 技术栈

- **前端**：Vue 3.5 + Vite 5 + Pinia + Vue Router
- **后端**：Node.js 20 + Express 5
- **部署**：Docker / PM2
- **包管理**：pnpm

---

## 项目结构

```
.
├── src/                 # 前端源码
├── backend/             # 后端代码
│   ├── index.js         # 后端入口
│   ├── package.json     # 后端依赖
│   └── data/            # 排行榜数据（持久化）
├── dist/                # 前端构建产物
├── Dockerfile           # Docker 构建配置
├── docker-compose.yml   # Docker 编排配置
├── ecosystem.config.js  # PM2 配置
└── package.json         # 前端依赖
```

---

祝你部署成功！🎮

如有问题，请查看日志或重新检查每一步操作。
