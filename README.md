# 贪吃蛇游戏

一个基于 Vue 3 + Express 的贪吃蛇游戏，采用前后端分离架构。

## 技术栈

### 前端
- **Vue 3** - 使用 Composition API (`<script setup>`)
- **Vite** - 快速开发和构建
- **Vue Router** - 页面路由
- **Pinia** - 状态管理

### 后端
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **CORS** - 跨域支持

## 目录结构

```
test2/
├── src/                    # 前端源代码
│   ├── assets/             # 静态资源
│   ├── components/         # 可复用组件
│   │   ├── SnakeGame.vue   # 贪吃蛇游戏组件
│   │   └── Leaderboard.vue # 排行榜组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   │   └── game.js         # 游戏状态 store
│   ├── utils/              # 工具函数
│   │   └── api.js          # API 调用
│   ├── views/              # 页面组件
│   │   └── GameView.vue    # 游戏页面
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── backend/                # 后端代码
│   ├── index.js            # Express 服务器
│   ├── scores.json         # 排行榜数据
│   ├── .env                # 环境变量
│   └── package.json        # 后端依赖
├── index.html              # HTML 模板
├── package.json            # 前端依赖
├── vite.config.js          # Vite 配置
└── README.md               # 项目说明
```

## 快速开始

### 安装依赖

```bash
# 前端依赖
pnpm install

# 后端依赖
cd backend
pnpm install
```

### 启动开发服务器

**方式 1：一键启动（前后端同时）**
```bash
pnpm dev:all
```

**方式 2：分别启动**
```bash
# 终端 1 - 后端（端口 3003）
cd backend
pnpm dev

# 终端 2 - 前端（端口 3000）
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 游戏说明

- 使用 **方向键** 或 **WASD** 控制方向
- 按 **空格** 暂停/继续游戏
- 吃到食物得 10 分，蛇会加速
- 游戏结束后可提交分数到排行榜

## API 接口

后端运行在 `http://localhost:3003`

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/scores` | GET | 获取排行榜（前 10 名） |
| `/api/scores` | POST | 提交新分数 |

## 端口配置

- 前端：`3000`
- 后端：`3003`
