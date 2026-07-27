const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const jobRoutes = require('./routes/jobs')
const jobService = require('./services/jobService')
app.use('/api/jobs', jobRoutes)

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