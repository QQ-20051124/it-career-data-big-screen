require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const { identifyUser } = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// ============================================================
// 【全局身份识别中间件】
// 对所有 /api/* 请求注入 req.user = { isGuest, userId, guestSessionId }
// - 登录用户：通过 X-User-Id 请求头识别（前端 utils/auth.js 自动注入）
// - 游客：通过 X-Guest-Session 请求头标识会话
// 各路由可单独使用 requireUser 拦截游客，或读取 req.user 做差异化处理
// ============================================================
app.use('/api', identifyUser)

const jobRoutes = require('./routes/jobs')
const aiAssistantRoutes = require('./routes/aiAssistant')
const jobService = require('./services/jobService')
const aiRoutes = require('./routes/ai')
const authRoutes = require('./routes/auth')
const communityRoutes = require('./routes/community')
const resourceRoutes = require('./routes/resources')
app.use('/api/jobs', jobRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/ai-assistant', aiAssistantRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/resources', resourceRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IT Career Backend is running' })
})

const startServer = async () => {
  await jobService.initData()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()