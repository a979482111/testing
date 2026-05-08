# 贪吃蛇游戏 - PM2 进程管理配置
# 使用 PM2 可以实现自动重启、日志管理、多实例负载均衡

module.exports = {
  apps: [
    {
      name: 'snake-game',
      script: './backend/index.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'dist', 'logs', 'backend/data'],
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
