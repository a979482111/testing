<script setup>
import { ref, onMounted, watch } from 'vue'
import { fetchScores, submitScore, checkHealth } from '@/utils/api'

const props = defineProps({
  currentScore: {
    type: Number,
    default: 0
  },
  onGameEnd: {
    type: Boolean,
    default: false
  }
})

const scores = ref([])
const username = ref('')
const isSubmitting = ref(false)
const showSubmitForm = ref(false)
const backendStatus = ref('online')
const message = ref('')
const lastSubmittedScore = ref(null)

// 从本地存储加载保存的名字
const savedUsername = ref(localStorage.getItem('snake_username') || '')

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`

  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 加载排行榜
async function loadScores() {
  const data = await fetchScores()
  scores.value = data
  backendStatus.value = 'online'
}

// 提交分数
async function handleSubmit() {
  const nameToSubmit = username.value.trim() || savedUsername.value.trim()
  
  if (!nameToSubmit) {
    message.value = '请输入用户名'
    return
  }

  isSubmitting.value = true
  try {
    await submitScore(nameToSubmit, props.currentScore)
    // 保存用户名到本地存储
    localStorage.setItem('snake_username', nameToSubmit)
    savedUsername.value = nameToSubmit
    message.value = '分数提交成功！'
    showSubmitForm.value = false
    username.value = ''
    lastSubmittedScore.value = props.currentScore
    await loadScores()
  } catch (error) {
    message.value = '提交失败，请检查后端服务'
  } finally {
    isSubmitting.value = false
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

// 监听游戏结束状态，显示提交表单
watch(() => props.onGameEnd, (newVal) => {
  if (newVal && props.currentScore > 0 && props.currentScore !== lastSubmittedScore.value) {
    showSubmitForm.value = true
    // 如果有保存的名字，自动填充
    if (savedUsername.value) {
      username.value = savedUsername.value
    }
  }
}, { immediate: true })

// 监听分数变化，刷新排行榜
watch(() => props.currentScore, () => {
  if (props.currentScore > 0) {
    loadScores()
  }
})

onMounted(() => {
  loadScores()
})
</script>

<template>
  <div class="leaderboard">
    <div class="leaderboard-header">
      <h3>🏆 排行榜</h3>
      <span class="status" :class="backendStatus">
        {{ backendStatus === 'online' ? '●' : '○' }}
      </span>
    </div>
    
    <div v-if="scores.length === 0" class="no-scores">
      <p>暂无记录</p>
    </div>
    
    <div v-else class="scores-list">
      <div 
        v-for="(score, index) in scores" 
        :key="index" 
        class="score-item"
        :class="{ 'top-3': index < 3 }"
      >
        <span class="rank" :class="'rank-' + (index + 1)">
          {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}` }}
        </span>
        <span class="player-name">{{ score.username }}</span>
        <span class="player-score">{{ score.score }}</span>
        <span class="player-date">{{ formatDate(score.date) }}</span>
      </div>
    </div>
    
    <div v-if="showSubmitForm && props.currentScore > 0" class="submit-form">
      <div class="form-header">
        <h4>🎉 新纪录！{{ props.currentScore }}分</h4>
        <button @click="showSubmitForm = false" class="btn-close" title="关闭">×</button>
      </div>
      <div class="form-body">
        <input
          v-model="username"
          type="text"
          :placeholder="savedUsername ? '使用保存的名字或输入新名字' : '输入你的名字'"
          maxlength="20"
          @keyup.enter="handleSubmit"
          ref="usernameInput"
        />
        <button @click="handleSubmit" :disabled="isSubmitting" class="btn-submit">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
      </div>
      <div v-if="savedUsername" class="saved-name-hint">
        💡 已自动填充上次使用的名字：<strong>{{ savedUsername }}</strong>
      </div>
    </div>
    
    <div v-if="message" class="message" :class="{ 'success': !message.includes('失败') }">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.leaderboard {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.leaderboard-header h3 {
  margin: 0;
  color: #35495e;
}

.status {
  font-size: 1.2rem;
}

.status.online {
  color: #42b883;
}

.status.loading {
  color: #a0a0a0;
}

.no-scores {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.scores-list {
  max-height: 300px;
  overflow-y: auto;
}

.score-item {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.score-item:last-child {
  border-bottom: none;
}

.score-item.top-3 {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
  border-radius: 4px;
}

.rank {
  font-size: 1.2rem;
}

.player-name {
  font-weight: 500;
  color: #35495e;
}

.player-score {
  font-weight: bold;
  color: #42b883;
  font-size: 1.1rem;
}

.player-date {
  color: #999;
  font-size: 0.85rem;
}

.submit-form {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px solid #42b883;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.form-header h4 {
  margin: 0;
  color: #42b883;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
}

.btn-close:hover {
  color: #35495e;
}

.form-body {
  display: flex;
  gap: 0.5rem;
}

.form-body input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-body input:focus {
  outline: none;
  border-color: #42b883;
}

.btn-submit {
  padding: 0.5rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit:hover {
  background: #35a070;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.saved-name-hint {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: #e8f4fd;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #0366d6;
}

.message {
  margin-top: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
}

.message:not(.success) {
  background: #f8d7da;
  color: #721c24;
}
</style>
