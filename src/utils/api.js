// 自动检测 API 地址：生产环境使用相对路径，开发环境使用本地地址
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3003/api'

export async function fetchScores() {
  try {
    const response = await fetch(`${API_BASE_URL}/scores`)
    if (!response.ok) throw new Error('获取排行榜失败')
    return await response.json()
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return []
  }
}

export async function submitScore(username, score) {
  try {
    const response = await fetch(`${API_BASE_URL}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, score })
    })
    if (!response.ok) throw new Error('提交分数失败')
    return await response.json()
  } catch (error) {
    console.error('提交分数失败:', error)
    throw error
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return await response.json()
  } catch (error) {
    console.error('后端服务未响应:', error)
    return null
  }
}
