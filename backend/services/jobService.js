const fs = require('fs-extra')
const path = require('path')

const dataFilePath = path.join(__dirname, '../data/all_cleaned_jobs.json')

let jobData = []

const initData = async () => {
  try {
    const rawData = await fs.readFile(dataFilePath, 'utf-8')
    jobData = JSON.parse(rawData)
    console.log(`Loaded ${jobData.length} job records`)
  } catch (error) {
    console.error('Error loading job data:', error)
    jobData = []
  }
}

const searchJobs = (keyword, category, filters) => {
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
      '教育培训': ['老师', '教师', '培训', '讲师']
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

  return results
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
    '基层县域'
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

module.exports = {
  initData,
  searchJobs,
  getJobById,
  getCategories,
  getCities,
  getEducationOptions,
  getExperienceOptions,
  getRecommendedJobs,
  calculateMatchScore,
  getSalaryStatistics,
  getCityStatistics
}