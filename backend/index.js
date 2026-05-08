import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'scores.json');

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 中间件
app.use(cors());
app.use(express.json());

// 服务前端静态文件（开发和生产环境都支持）
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`📁 静态文件目录：${distPath}`);
}

// 读取分数
function loadScores() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取分数失败:', error);
  }
  return [];
}

// 保存分数
function saveScores(scores) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2), 'utf-8');
}

// API: 获取排行榜
app.get('/api/scores', (req, res) => {
  const scores = loadScores();
  const topScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json(topScores);
});

// API: 提交分数
app.post('/api/scores', (req, res) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: '用户名和分数不能为空' });
  }

  const scores = loadScores();
  const newScore = {
    username,
    score,
    date: new Date().toISOString()
  };

  scores.push(newScore);
  saveScores(scores);

  res.status(201).json(newScore);
});

// API: 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '后端服务运行中' });
});

// 所有非 API 请求返回前端页面（支持 SPA 路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 服务运行在 http://localhost:${PORT}`);
  console.log(`📊 前端：http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/scores`);
});
