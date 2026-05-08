<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'
import Leaderboard from '@/components/Leaderboard.vue'

const game = useGameStore()
const gameLoop = ref(null)
const canvasRef = ref(null)

// 绘制游戏画面
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const cellSize = game.cellSize

  // 清空画布
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 画网格
  ctx.strokeStyle = '#2a2a3e'
  ctx.lineWidth = 0.5
  for (let i = 0; i <= game.gridSize; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellSize, 0)
    ctx.lineTo(i * cellSize, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * cellSize)
    ctx.lineTo(canvas.width, i * cellSize)
    ctx.stroke()
  }

  // 画食物
  ctx.fillStyle = '#ff6b6b'
  ctx.beginPath()
  ctx.arc(
    game.food.x * cellSize + cellSize / 2,
    game.food.y * cellSize + cellSize / 2,
    cellSize / 2 - 2,
    0,
    Math.PI * 2
  )
  ctx.fill()

  // 画蛇
  game.snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = '#42b883'
    } else {
      const alpha = 1 - (index / game.snake.length) * 0.5
      ctx.fillStyle = `rgba(66, 184, 131, ${alpha})`
    }

    ctx.fillRect(
      segment.x * cellSize + 1,
      segment.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    )

    // 画蛇眼睛
    if (index === 0) {
      ctx.fillStyle = 'white'
      const eyeSize = cellSize / 6
      const eyeOffset = cellSize / 4

      if (game.direction.x === 1) {
        ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + eyeOffset, eyeSize, eyeSize)
        ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize)
      } else if (game.direction.x === -1) {
        ctx.fillRect(segment.x * cellSize + eyeOffset - eyeSize, segment.y * cellSize + eyeOffset, eyeSize, eyeSize)
        ctx.fillRect(segment.x * cellSize + eyeOffset - eyeSize, segment.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize)
      } else if (game.direction.y === -1) {
        ctx.fillRect(segment.x * cellSize + eyeOffset, segment.y * cellSize + eyeOffset - eyeSize, eyeSize, eyeSize)
        ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset - eyeSize, segment.y * cellSize + eyeOffset - eyeSize, eyeSize, eyeSize)
      } else {
        ctx.fillRect(segment.x * cellSize + eyeOffset, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize)
        ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset - eyeSize, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize)
      }
    }
  })
}

// 键盘控制
function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault()
      game.changeDirection({ x: 0, y: -1 })
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault()
      game.changeDirection({ x: 0, y: 1 })
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault()
      game.changeDirection({ x: -1, y: 0 })
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault()
      game.changeDirection({ x: 1, y: 0 })
      break
    case ' ':
      e.preventDefault()
      if (game.isGameOver) {
        game.startGame()
      } else if (game.isPlaying) {
        game.pauseGame()
      } else {
        game.startGame()
      }
      break
  }
}

// 开始/暂停游戏
function toggleGame() {
  if (game.isGameOver) {
    game.startGame()
  } else if (game.isPlaying) {
    game.pauseGame()
  } else {
    game.startGame()
  }
}

// 游戏循环
watch(() => game.isPlaying, (newVal) => {
  if (gameLoop.value) {
    clearInterval(gameLoop.value)
  }
  if (newVal) {
    gameLoop.value = setInterval(() => {
      game.move()
    }, game.speed)
  }
}, { immediate: true })

// 速度变化时重启循环
watch(() => game.speed, () => {
  if (game.isPlaying && gameLoop.value) {
    clearInterval(gameLoop.value)
    gameLoop.value = setInterval(() => {
      game.move()
    }, game.speed)
  }
})

// 监听游戏状态变化并重绘
watch([() => game.snake, () => game.food, () => game.direction], () => {
  nextTick(() => {
    draw()
  })
}, { deep: true })

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  draw()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameLoop.value) {
    clearInterval(gameLoop.value)
  }
})
</script>

<template>
  <div class="snake-game">
    <h1>🐍 贪吃蛇</h1>

    <div class="game-info">
      <div class="score">
        <span>当前分数：{{ game.score }}</span>
        <span>最高分：{{ game.highScore }}</span>
      </div>
    </div>

    <div class="game-board">
      <canvas
        :width="game.canvasWidth"
        :height="game.canvasHeight"
        ref="canvasRef"
      ></canvas>

      <div class="game-overlay" v-if="!game.isPlaying && !game.isGameOver">
        <div class="overlay-content">
          <h2>准备好了吗？</h2>
          <p>使用方向键或 WASD 控制方向</p>
          <button @click="toggleGame" class="btn-start">开始游戏</button>
        </div>
      </div>

      <div class="game-overlay" v-if="game.isGameOver">
        <div class="overlay-content">
          <h2>游戏结束!</h2>
          <p>最终得分：{{ game.score }}</p>
          <button @click="toggleGame" class="btn-start">再来一局</button>
        </div>
      </div>

      <div class="game-overlay" v-if="!game.isPlaying && !game.isGameOver && game.snake.length > 1">
        <div class="overlay-content">
          <h2>已暂停</h2>
          <button @click="toggleGame" class="btn-start">继续游戏</button>
        </div>
      </div>
    </div>

    <!-- 游戏结束后的排行榜和分数提交 -->
    <div v-if="game.isGameOver" class="game-over-section">
      <Leaderboard
        :currentScore="game.score"
        :onGameEnd="true"
      />
    </div>

    <div class="controls">
      <div class="control-hint">
        <span>📱 移动控制</span>
        <div class="direction-pad">
          <button @click="game.changeDirection({ x: 0, y: -1 })" class="d-btn up">▲</button>
          <button @click="game.changeDirection({ x: -1, y: 0 })" class="d-btn left">◀</button>
          <button @click="game.changeDirection({ x: 0, y: 1 })" class="d-btn down">▼</button>
          <button @click="game.changeDirection({ x: 1, y: 0 })" class="d-btn right">▶</button>
        </div>
      </div>
      <div class="action-buttons">
        <button @click="toggleGame" class="btn-action">
          {{ game.isGameOver ? '重新开始' : (!game.isPlaying ? '开始游戏' : '暂停') }}
        </button>
      </div>
    </div>

    <div class="instructions">
      <h3>游戏说明</h3>
      <ul>
        <li>使用 <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> 或 <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> 控制方向</li>
        <li>按 <kbd>空格</kbd> 暂停/继续游戏</li>
        <li>吃到食物得 10 分，蛇身变长</li>
        <li>撞到墙壁或自己游戏结束</li>
        <li>随着分数提高，蛇会越跑越快!</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.snake-game {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  color: #42b883;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.game-info {
  margin-bottom: 1rem;
}

.score {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.score span:first-child {
  color: #42b883;
}

.score span:last-child {
  color: #35495e;
}

.game-board {
  position: relative;
  display: inline-block;
  border: 3px solid #42b883;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a2e;
}

canvas {
  display: block;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-content {
  text-align: center;
  color: white;
}

.overlay-content h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.overlay-content p {
  margin-bottom: 1.5rem;
  color: #aaa;
}

.btn-start {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-start:hover {
  background: #35a070;
}

.controls {
  margin-top: 1.5rem;
}

.control-hint {
  margin-bottom: 1rem;
}

.direction-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  width: 120px;
  margin: 0.5rem auto;
}

.d-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #42b883;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.d-btn:hover {
  background: #35a070;
}

.d-btn.up { grid-column: 2; }
.d-btn.left { grid-column: 1; grid-row: 2; }
.d-btn.down { grid-column: 2; grid-row: 2; }
.d-btn.right { grid-column: 3; grid-row: 2; }

.action-buttons {
  margin-top: 1rem;
}

.btn-action {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background: #35495e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-action:hover {
  background: #2c3e50;
}

.game-over-section {
  margin-top: 1.5rem;
}

.instructions {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: left;
}

.instructions h3 {
  color: #35495e;
  margin-bottom: 1rem;
}

.instructions ul {
  list-style: none;
  padding: 0;
}

.instructions li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}

.instructions li:last-child {
  border-bottom: none;
}

kbd {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  border: 1px solid #ccc;
}
</style>
