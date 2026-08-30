require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件：岗位数据 JSON（给前端 /data/* 请求用）
app.use('/data', express.static(path.join(__dirname, 'data'), {
  maxAge: 60000,
  setHeaders: (res) => { res.setHeader('Cache-Control', 'no-cache') }
}))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

const jobRoutes = require('./routes/jobs')
const aiAssistantRoutes = require('./routes/aiAssistant')
const jobService = require('./services/jobService')
const aiRoutes = require('./routes/ai')
const resourceRoutes = require('./routes/resources')
const authRoutes = require('./routes/auth')
const communityRoutes = require('./routes/community')
const crawlerRoutes = require('./routes/crawler')
app.use('/api/jobs', jobRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/ai-assistant', aiAssistantRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/crawler', crawlerRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IT Career Backend is running' })
})

// ========== 前端静态文件托管（生产模式） ==========
// API 和 /data 路由优先匹配，其余请求回退到前端 index.html
const distPath = path.join(__dirname, '..', 'dist')
const fs = require('fs')
if (fs.existsSync(distPath)) {
  // 托管前端构建产物
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // HTML 文件不缓存，方便更新后立即生效
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      }
    }
  }))

  // Vue Router history 模式 fallback：所有非 API 路径回退到 index.html
  app.get(/^\/(?!api|data).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
  console.log('[Frontend] 已加载前端静态文件（dist/），访问 http://localhost:' + PORT)
} else {
  console.log('[Frontend] 未找到 dist/ 目录，前端未构建。运行 "npm run build" 后重启后端即可。')
}

const startServer = async () => {
  await jobService.initData()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()