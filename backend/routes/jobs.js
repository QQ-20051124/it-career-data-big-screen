const express = require('express')
const router = express.Router()
const jobService = require('../services/jobService')
const path = require('path')
const fs = require('fs')
const DATA_FILE = path.join(__dirname, '../data/all_cleaned_jobs.json')

router.get('/search', (req, res) => {
  try {
    const { keyword, category, education, experience, city, minSalary, maxSalary, page, pageSize, sortBy, skills, userCity, userExperience } = req.query
    
    const filters = {
      education: education ? education.split(',') : [],
      experience: experience ? experience.split(',') : [],
      city: city ? city.split(',') : [],
      minSalary: minSalary ? parseInt(minSalary) : null,
      maxSalary: maxSalary ? parseInt(maxSalary) : null
    }

    const userProfile = {
      skillKeywords: skills ? skills.split(',') : [],
      city: userCity || '',
      experience: userExperience ? parseInt(userExperience) : 0
    }

    const options = {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      sortBy: sortBy || 'match',
      userProfile,
      userCity: userCity || ''
    }

    const result = jobService.searchJobs(keyword, category, filters, options)
    res.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/suggest', (req, res) => {
  try {
    const { keyword } = req.query
    const suggestions = jobService.getJobSuggestions(keyword)
    res.json({ success: true, data: suggestions })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/recommend', (req, res) => {
  try {
    const { limit = 12 } = req.query
    const userProfile = req.body || {}
    
    const results = jobService.getRecommendedJobs(userProfile, parseInt(limit))
    res.json({
      success: true,
      data: results,
      total: results.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/categories', (req, res) => {
  try {
    const categories = jobService.getCategories()
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/cities', (req, res) => {
  try {
    const cities = jobService.getCities()
    res.json({
      success: true,
      data: cities
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/education-options', (req, res) => {
  try {
    const options = jobService.getEducationOptions()
    res.json({
      success: true,
      data: options
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/experience-options', (req, res) => {
  try {
    const options = jobService.getExperienceOptions()
    res.json({
      success: true,
      data: options
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/statistics/salary', (req, res) => {
  try {
    const stats = jobService.getSalaryStatistics()
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/statistics/cities', (req, res) => {
  try {
    const stats = jobService.getCityStatistics()
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/statistics/trends', (req, res) => {
  try {
    const { days = 30 } = req.query
    const trends = jobService.getJobTrends(parseInt(days))
    res.json({
      success: true,
      data: trends
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/raw', async (req, res) => {
  try {
    // 每次都从磁盘读最新爬虫写入的文件，保证刷新就是最新数据
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ success: false, message: '数据文件不存在' })
    }
    const stat = fs.statSync(DATA_FILE)
    const raw = await fs.promises.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    // 顺便把后端内存缓存也同步一下，让 /search /data-info 同源最新
    try { await jobService.reloadData() } catch (_) {}
    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Last-Modified': stat.mtime.toUTCString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    })
    res.json({
      success: true,
      data: parsed,
      meta: {
        count: parsed.length,
        lastUpdated: stat.mtime.toISOString(),
        source: 'backend/data/all_cleaned_jobs.json (crawler output)'
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/data-info', async (req, res) => {
  try {
    // 先确保后端内存缓存是磁盘最新的（爬虫写了文件就会在这里被同步进内存）
    let refreshed = null
    try { refreshed = await jobService.reloadData() } catch (_) {}
    const info = jobService.getDataInfo()
    res.json({
      success: true,
      data: info,
      _refreshed: refreshed
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.post('/reload', async (req, res) => {
  try {
    const result = await jobService.reloadData()
    if (result.success) {
      res.json({
        success: true,
        message: '数据刷新成功',
        data: result
      })
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.post('/merge-crawler', async (req, res) => {
  try {
    const path = require('path')
    const fs = require('fs-extra')
    
    const DATA_DIR = path.join(__dirname, '../data')
    const JSON_PATH = path.join(DATA_DIR, 'all_cleaned_jobs.json')
    const CRAWLER_DIR = path.join(__dirname, '../../spider')

    let existingData = []
    if (fs.existsSync(JSON_PATH)) {
      existingData = await fs.readJson(JSON_PATH)
    }

    const csvFiles = []
    if (fs.existsSync(CRAWLER_DIR)) {
      const files = fs.readdirSync(CRAWLER_DIR).filter(f =>
        f.endsWith('.csv')
      )
      for (const file of files) {
        csvFiles.push(path.join(CRAWLER_DIR, file))
      }
    }

    let added = 0
    let duplicates = 0

    for (const csvPath of csvFiles) {
      try {
        const content = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '')
        const lines = content.split('\n').filter(l => l.trim())
        if (lines.length < 2) continue

        const headers = lines[0].split(',').map(h => h.trim())
        const newRecords = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          const row = {}
          headers.forEach((header, idx) => {
            row[header] = (values[idx] || '').trim()
          })
          if (!row['岗位名称']) continue

          const salaryStr = row['薪资'] || ''
          let salaryAvg = 0
          if (salaryStr && salaryStr !== '面议') {
            const m = salaryStr.match(/([\d.]+)\s*-?\s*([\d.]+)?\s*(万|千)?/)
            if (m) {
              let lo = parseFloat(m[1]), hi = m[2] ? parseFloat(m[2]) : lo
              const unit = m[3] || ''
              const mult = unit === '万' ? 10000 : unit === '千' ? 1000 : 1
              salaryAvg = Math.round((lo + hi) / 2 * mult)
            }
          }

          const cityStr = row['城市'] || ''
          const cityParts = cityStr.split(/[·\-]/)

          newRecords.push({
            job_name: row['岗位名称'] || '',
            city: cityParts[0].trim(),
            education: row['学历要求'] || '不限',
            work_exp: row['经验要求'] || '不限',
            company: row['公司名称'] || '',
            salary_avg: salaryAvg,
            data_source: row['数据来源'] || '未知'
          })
        }

        const existingKeys = new Set(existingData.map(r => `${r.data_source}|${r.job_name}|${r.company}|${r.city}`))
        for (const record of newRecords) {
          const key = `${record.data_source}|${record.job_name}|${record.company}|${record.city}`
          if (!existingKeys.has(key)) {
            existingKeys.add(key)
            existingData.push(record)
            added++
          } else {
            duplicates++
          }
        }
      } catch (err) {
        console.error(`处理 ${path.basename(csvPath)} 失败:`, err.message)
      }
    }

    await fs.writeJson(JSON_PATH, existingData, { spaces: 2 })
    await jobService.reloadData()

    res.json({
      success: true,
      message: '爬虫数据合并完成',
      data: {
        totalCount: existingData.length,
        added,
        duplicates,
        filesProcessed: csvFiles.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get('/:id', (req, res) => {
  try {
    const job = jobService.getJobById(req.params.id)
    if (job) {
      res.json({
        success: true,
        data: job
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

module.exports = router