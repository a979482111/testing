import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 游戏配置
  const gridSize = 20
  const cellSize = 20
  const initialSpeed = 150

  // 游戏状态
  const snake = ref([{ x: 10, y: 10 }])
  const food = ref({ x: 15, y: 15 })
  const direction = ref({ x: 1, y: 0 })
  const nextDirection = ref({ x: 1, y: 0 })
  const score = ref(0)
  const highScore = ref(parseInt(localStorage.getItem('snakeHighScore') || '0'))
  const isPlaying = ref(false)
  const isGameOver = ref(false)
  const speed = ref(initialSpeed)

  // 游戏画布尺寸
  const canvasWidth = computed(() => gridSize * cellSize)
  const canvasHeight = computed(() => gridSize * cellSize)

  // 开始游戏
  function startGame() {
    snake.value = [{ x: 10, y: 10 }]
    direction.value = { x: 1, y: 0 }
    nextDirection.value = { x: 1, y: 0 }
    score.value = 0
    speed.value = initialSpeed
    isPlaying.value = true
    isGameOver.value = false
    generateFood()
  }

  // 生成食物
  function generateFood() {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      }
    } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    food.value = newFood
  }

  // 改变方向
  function changeDirection(newDir) {
    // 防止 180 度转弯
    if (newDir.x !== -direction.value.x || newDir.y !== -direction.value.y) {
      nextDirection.value = newDir
    }
  }

  // 移动蛇
  function move() {
    direction.value = nextDirection.value
    
    const head = {
      x: snake.value[0].x + direction.value.x,
      y: snake.value[0].y + direction.value.y
    }

    // 检查碰撞
    if (checkCollision(head)) {
      gameOver()
      return
    }

    snake.value.unshift(head)

    // 检查是否吃到食物
    if (head.x === food.value.x && head.y === food.value.y) {
      score.value += 10
      if (score.value > highScore.value) {
        highScore.value = score.value
        localStorage.setItem('snakeHighScore', highScore.value.toString())
      }
      // 加速
      if (speed.value > 50) {
        speed.value -= 2
      }
      generateFood()
    } else {
      snake.value.pop()
    }
  }

  // 检查碰撞
  function checkCollision(head) {
    // 撞墙
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true
    }
    // 撞自己
    for (let i = 0; i < snake.value.length; i++) {
      if (snake.value[i].x === head.x && snake.value[i].y === head.y) {
        return true
      }
    }
    return false
  }

  // 游戏结束
  function gameOver() {
    isPlaying.value = false
    isGameOver.value = true
  }

  // 暂停游戏
  function pauseGame() {
    isPlaying.value = false
  }

  return {
    // 状态
    snake,
    food,
    direction,
    score,
    highScore,
    isPlaying,
    isGameOver,
    speed,
    gridSize,
    cellSize,
    canvasWidth,
    canvasHeight,
    // 方法
    startGame,
    changeDirection,
    move,
    pauseGame,
    gameOver
  }
})
