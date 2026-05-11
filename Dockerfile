# 多阶段构建 - 贪吃蛇游戏 Docker 镜像

# 阶段 1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制前端依赖
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm build

# 阶段 2: 后端和生产环境
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制后端依赖到根目录安装（确保 express 等依赖在正确位置）
COPY backend/package.json backend/pnpm-lock.yaml ./

# 安装后端生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建好的前端文件
COPY --from=frontend-builder /app/dist ./dist

# 复制后端代码
COPY backend/ ./backend/

# 创建数据目录
RUN mkdir -p /app/backend/data

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 启动服务
CMD ["node", "backend/index.js"]
