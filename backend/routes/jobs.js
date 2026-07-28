const express = require('express')
const router = express.Router()
const jobService = require('../services/jobService')

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
      userProfile
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