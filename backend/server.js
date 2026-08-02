require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

const jobRoutes = require('./routes/jobs')
const aiAssistantRoutes = require('./routes/aiAssistant')
const jobService = require('./services/jobService')
const aiRoutes = require('./routes/ai')
const authRoutes = require('./routes/auth')
const communityRoutes = require('./routes/community')
app.use('/api/jobs', jobRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/ai-assistant', aiAssistantRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/community', communityRoutes)

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