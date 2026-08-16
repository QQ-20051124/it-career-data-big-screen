const fs = require('fs-extra')
const path = require('path')
const cityCoords = require('../data/cityCoords')

const dataFilePath = path.join(__dirname, '../data/all_cleaned_jobs.json')

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const getDistanceScore = (jobCity, userCity) => {
  const jobCoord = cityCoords[jobCity]
  const userCoord = cityCoords[userCity]
  if (!jobCoord || !userCoord) return 9999
  return haversineDistance(userCoord.lat, userCoord.lng, jobCoord.lat, jobCoord.lng)
}

let jobData = []
let lastUpdated = null

const initData = async () => {
  try {
    const rawData = await fs.readFile(dataFilePath, 'utf-8')
    jobData = JSON.parse(rawData)
    lastUpdated = new Date().toISOString()
    console.log(`Loaded ${jobData.length} job records`)
  } catch (error) {
    console.error('Error loading job data:', error)
    jobData = []
  }
}

const reloadData = async () => {
  try {
    const rawData = await fs.readFile(dataFilePath, 'utf-8')
    const newData = JSON.parse(rawData)
    const oldCount = jobData.length
    jobData = newData
    lastUpdated = new Date().toISOString()
    const added = newData.length - oldCount
    return {
      success: true,
      oldCount,
      newCount: newData.length,
      added: added > 0 ? added : 0,
      lastUpdated
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

const getDataInfo = () => {
  const sources = {}
  jobData.forEach(job => {
    const src = job.data_source || '未知'
    sources[src] = (sources[src] || 0) + 1
  })
  return {
    totalCount: jobData.length,
    dataSources: sources,
    lastUpdated,
    dataFilePath
  }
}

const calcMatchForSearch = (job, userProfile) => {
  const jobText = (job.job_name || '').toLowerCase() + (job.company || '').toLowerCase()
  let score = 25 // 降低基础分，增加区分度
  
  // 技能匹配 - 核心维度，占主要分数
  const hotSkills = ['java', 'python', 'c++', 'c/c++', '前端', 'vue', 'react', '后端', '算法', 'ai', '人工智能', '运维', '测试', '大数据', '云计算', '计算机', 'javascript', '嵌入式', '数据库']
  const matchedSkills = hotSkills.filter(sk => jobText.includes(sk))
  score += Math.min(matchedSkills.length * 5, 35) // 最多35分
  
  // 薪资水平
  if (job.salary_avg && job.salary_avg >= 25000) score += 8
  else if (job.salary_avg && job.salary_avg >= 15000) score += 6
  else if (job.salary_avg && job.salary_avg >= 8000) score += 4
  
  // 城市等级
  if (['北京', '上海', '深圳', '杭州', '广州'].includes(job.city)) score += 5
  else if (['武汉', '成都', '南京', '西安'].includes(job.city)) score += 3
  else if (job.city) score += 1
  
  // 学历要求
  if (job.education === '不限') score += 5
  else if (job.education === '本科') score += 4
  else if (job.education === '硕士') score += 3
  
  // 用户特定匹配（如果有用户数据）
  if (userProfile && userProfile.city && job.city === userProfile.city) score += 8
  if (userProfile && userProfile.skills) {
    const profileSkills = (userProfile.skills || []).map(s => s.toLowerCase())
    const matched = profileSkills.filter(sk => 
      jobText.includes(sk) || sk.includes(jobText)
    )
    score += Math.min(matched.length * 8, 24) // 最多24分
  }
  
  return Math.min(98, Math.max(20, score))
}

const searchJobs = (keyword, category, filters, options = {}) => {
  let results = [...jobData]

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    results = results.filter(job => 
      (job.job_name && job.job_name.toLowerCase().includes(lowerKeyword)) ||
      (job.company && job.company.toLowerCase().includes(lowerKeyword)) ||
      (job.city && job.city.toLowerCase().includes(lowerKeyword))
    )
  }

  if (category && category !== '全部岗位') {
    const categoryKeywords = {
      '今日新岗': ['急招', '紧急', '最新', '高薪'],
      '应届生校招': ['应届', '校招', '毕业生', '实习生', '不限'],
      '人工智能': ['AI', '人工智能', '算法', '机器学习', '深度学习', '神经网络', '数据'],
      '国产芯片': ['芯片', '半导体', '集成电路', 'IC', 'SoC'],
      '国企央企': ['国企', '央企', '国有', '事业单位', '政府'],
      '专精特新': ['专精特新', '高新技术', '科技'],
      '基层县域': ['县域', '县城', '乡镇'],
      '开发工程师': ['开发', '工程师', '编程', 'java', 'python', '前端', '后端'],
      '运维支持': ['运维', '维护', '网络', '系统', '硬件'],
      '教育培训': ['老师', '教师', '培训', '讲师'],
      '低竞争岗位': ['计算机', '硬件', '维护', '文员'],
      '短期实习': ['实习', '短期', '兼职', '临时']
    }

    const keywords = categoryKeywords[category] || []
    if (keywords.length > 0) {
      results = results.filter(job => {
        const jobText = (job.job_name || '').toLowerCase() + (job.company || '').toLowerCase() + (job.city || '').toLowerCase()
        return keywords.some(kw => jobText.includes(kw.toLowerCase()))
      })
    }
  }

  if (filters) {
    if (filters.education && filters.education.length > 0) {
      results = results.filter(job => 
        filters.education.includes(job.education || '')
      )
    }
    if (filters.experience && filters.experience.length > 0) {
      results = results.filter(job => 
        filters.experience.includes(job.work_exp || '')
      )
    }
    if (filters.city && filters.city.length > 0) {
      results = results.filter(job => 
        filters.city.includes(job.city || '')
      )
    }
    if (filters.minSalary) {
      results = results.filter(job => 
        (job.salary_avg || 0) >= filters.minSalary
      )
    }
    if (filters.maxSalary) {
      results = results.filter(job => 
        (job.salary_avg || 0) <= filters.maxSalary
      )
    }
  }

  const userProfile = options.userProfile || {}
  results = results.map(job => ({
    ...job,
    matchScore: calcMatchForSearch(job, userProfile)
  }))

  const sortBy = options.sortBy || ''
  if (sortBy === 'salary') {
    results.sort((a, b) => (b.salary_avg || 0) - (a.salary_avg || 0))
  } else if (sortBy === 'city') {
    const userCity = userProfile.city || options.userCity
    if (userCity && cityCoords[userCity]) {
      results.forEach(job => {
        job.distance = getDistanceScore(job.city, userCity)
      })
      results.sort((a, b) => {
        const da = a.distance !== undefined ? a.distance : 9999
        const db = b.distance !== undefined ? b.distance : 9999
        if (da !== db) return da - db
        return (b.matchScore || 0) - (a.matchScore || 0)
      })
    } else {
      results.sort((a, b) => {
        const aMatch = userProfile.city && a.city === userProfile.city ? 0 : 1
        const bMatch = userProfile.city && b.city === userProfile.city ? 0 : 1
        if (aMatch !== bMatch) return aMatch - bMatch
        return (b.matchScore || 0) - (a.matchScore || 0)
      })
    }
  } else if (sortBy === 'match') {
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }
  // 当sortBy为空时，不进行特殊排序，保持原始顺序

  const total = results.length
  const page = options.page || 1
  const pageSize = options.pageSize || 20
  const startIdx = (page - 1) * pageSize
  const pagedResults = results.slice(startIdx, startIdx + pageSize)

  return { data: pagedResults, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

const getJobById = (id) => {
  return jobData[id] || null
}

const getCategories = () => {
  return [
    '全部岗位',
    '今日新岗', 
    '应届生校招',
    '人工智能',
    '国产芯片',
    '国企央企',
    '专精特新',
    '基层县域',
    '低竞争岗位',
    '短期实习',
    '开发工程师',
    '运维支持',
    '教育培训'
  ]
}

const getCities = () => {
  const cities = [...new Set(jobData.map(job => job.city).filter(Boolean))]
  return cities.sort()
}

const getEducationOptions = () => {
  return [...new Set(jobData.map(job => job.education).filter(Boolean))]
}

const getExperienceOptions = () => {
  return [...new Set(jobData.map(job => job.work_exp).filter(Boolean))]
}

const calculateMatchScore = (job, userProfile) => {
  let score = 50

  if (userProfile.skillKeywords) {
    const jobText = (job.job_name || '') + (job.company || '')
    const matchedSkills = userProfile.skillKeywords.filter(kw => 
      jobText.includes(kw)
    )
    score += matchedSkills.length * 8
  }

  if (userProfile.education && job.education) {
    const educationPriority = ['博士', '硕士', '本科', '大专', '中专', '学历不限']
    const userIndex = educationPriority.indexOf(userProfile.education)
    const jobIndex = educationPriority.indexOf(job.education)
    if (userIndex <= jobIndex) {
      score += 15
    }
  }

  if (userProfile.city && job.city === userProfile.city) {
    score += 10
  }

  if (userProfile.experience && job.work_exp) {
    if (job.work_exp.includes('经验不限') || job.work_exp.includes('应届生')) {
      score += 5
    } else if (job.work_exp.includes('1-3年') && userProfile.experience >= 1) {
      score += 8
    } else if (job.work_exp.includes('3-5年') && userProfile.experience >= 3) {
      score += 8
    } else if (job.work_exp.includes('5年') && userProfile.experience >= 5) {
      score += 8
    }
  }

  return Math.min(100, Math.max(0, score))
}

const getRecommendedJobs = (userProfile = {}, limit = 12) => {
  let results = [...jobData]

  if (userProfile) {
    results = results.map(job => ({
      ...job,
      matchScore: calculateMatchScore(job, userProfile)
    }))
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  return results.slice(0, limit)
}

const getSalaryStatistics = () => {
  const salaries = jobData.map(job => job.salary_avg || 0).filter(s => s > 0)
  if (salaries.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0 }
  }

  const sorted = salaries.sort((a, b) => a - b)
  const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
    : sorted[Math.floor(sorted.length / 2)]

  return { avg, min, max, median: Math.round(median) }
}

const getJobSuggestions = (keyword) => {
  if (!keyword || keyword.length < 1) return []
  const lowerKeyword = keyword.toLowerCase()
  return jobData
    .filter(job => job.job_name && job.job_name.toLowerCase().includes(lowerKeyword))
    .map(job => job.job_name)
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 8)
}

const getCityStatistics = () => {
  const cityCounts = {}
  jobData.forEach(job => {
    if (job.city) {
      cityCounts[job.city] = (cityCounts[job.city] || 0) + 1
    }
  })
  
  return Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

const getJobTrends = (days = 30) => {
  const now = Date.now()
  const trendData = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const baseCount = Math.floor(Math.random() * 30) + 10
    const avgSalary = 8000 + Math.floor(Math.random() * 5000)
    trendData.push({
      date: dateStr,
      postingCount: baseCount + Math.floor(Math.random() * 20),
      avgSalary: avgSalary,
      category: ['技术开发', '产品经理', 'UI设计', '运营推广'][Math.floor(Math.random() * 4)]
    })
  }
  return trendData
}

module.exports = {
  initData,
  reloadData,
  getDataInfo,
  searchJobs,
  getJobById,
  getCategories,
  getCities,
  getEducationOptions,
  getExperienceOptions,
  getRecommendedJobs,
  calculateMatchScore,
  getSalaryStatistics,
  getCityStatistics,
  getJobSuggestions,
  getJobTrends
}