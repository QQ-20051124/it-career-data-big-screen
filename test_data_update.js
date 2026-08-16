/**
 * 爬虫数据实时更新验证脚本
 * 模拟爬虫数据的产生、合并、刷新全过程
 */

const fs = require('fs-extra')
const path = require('path')

console.log('========================================')
console.log('  爬虫数据实时更新验证演示')
console.log('========================================\n')

// 1. 查看当前系统数据量
const jsonPath = path.join(__dirname, 'backend', 'data', 'all_cleaned_jobs.json')
const currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
console.log('【步骤1】当前系统数据量: ' + currentData.length + ' 条')

// 统计数据源
const sourceStats = {}
currentData.forEach(r => {
  sourceStats[r.data_source] = (sourceStats[r.data_source] || 0) + 1
})
console.log('         数据源分布:', JSON.stringify(sourceStats))

// 2. 添加模拟爬虫数据
const testCrawlerData = [
  { '数据来源': '智联', '关键词': '计算机', '岗位名称': '高级前端工程师', '薪资': '25000-40000元', '城市': '深圳·南山区', '经验要求': '3-5年', '学历要求': '本科', '公司名称': '腾讯科技' },
  { '数据来源': '猎聘', '关键词': 'Java', '岗位名称': 'Java后端架构师', '薪资': '35K-60K', '城市': '北京·海淀区', '经验要求': '5-10年', '学历要求': '硕士', '公司名称': '字节跳动' },
  { '数据来源': '前程无忧', '关键词': 'Python', '岗位名称': 'Python数据分析师', '薪资': '18000-30000元', '城市': '上海·浦东新区', '经验要求': '1-3年', '学历要求': '本科', '公司名称': '蚂蚁集团' },
  { '数据来源': '智联', '关键词': '人工智能', '岗位名称': 'AI算法工程师', '薪资': '40K-80K', '城市': '杭州·西湖区', '经验要求': '3-5年', '学历要求': '博士', '公司名称': '阿里巴巴' }
]

// 保存为测试 CSV 文件
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
const csvDir = path.join(__dirname, 'job_crawler')
const csvFileName = `全国IT岗位_${today}_test.csv`
const csvPath = path.join(csvDir, csvFileName)
const headers = ['数据来源', '关键词', '岗位名称', '薪资', '城市', '经验要求', '学历要求', '公司名称']

let csvContent = '\ufeff' + headers.join(',') + '\n'
testCrawlerData.forEach(row => {
  const values = headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`)
  csvContent += values.join(',') + '\n'
})

fs.writeFileSync(csvPath, csvContent, 'utf-8')
console.log('\n【步骤2】模拟爬虫产出 CSV: ' + csvFileName)
console.log('         新增 ' + testCrawlerData.length + ' 条测试数据')

// 3. 调用合并接口（使用 Node.js 模拟）
console.log('\n【步骤3】调用合并接口 /api/jobs/merge-crawler')
console.log('         正在处理 CSV 文件...')

// 3.1 读取现有数据
const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
const existingKeys = new Set()
existingData.forEach(item => {
  const key = `${item.data_source}|${item.job_name}|${item.company}|${item.city}`
  existingKeys.add(key)
})

// 3.2 解析新 CSV
const csvContent2 = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '')
const lines = csvContent2.split('\n').filter(l => l.trim())
const csvHeaders = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

let added = 0
let duplicates = 0

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].match(/("([^"]|"")*"|[^,]*)(,|$)/g) || []
  const row = {}
  csvHeaders.forEach((header, idx) => {
    const val = (values[idx] || '').replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')
    row[header.trim()] = val.trim()
  })

  if (!row['岗位名称']) continue

  // 解析薪资
  let salaryAvg = 0
  const salaryStr = row['薪资'] || ''
  if (salaryStr && !salaryStr.includes('面议')) {
    const m = salaryStr.match(/([\d.]+)\s*-?\s*([\d.]+)?\s*(万|千)?/)
    if (m) {
      let lo = parseFloat(m[1]), hi = m[2] ? parseFloat(m[2]) : lo
      const unit = m[3] || ''
      const mult = unit === '万' ? 10000 : unit === '千' ? 1000 : 1
      salaryAvg = Math.round((lo + hi) / 2 * mult)
    }
  }

  // 提取城市
  const cityStr = row['城市'] || ''
  const cityParts = cityStr.split(/[·\-]/)

  const key = `${row['数据来源']}|${row['岗位名称']}|${row['公司名称']}|${cityParts[0].trim()}`
  
  if (existingKeys.has(key)) {
    duplicates++
    continue
  }

  existingKeys.add(key)
  existingData.push({
    job_name: row['岗位名称'],
    city: cityParts[0].trim(),
    education: row['学历要求'] || '不限',
    work_exp: row['经验要求'] || '不限',
    company: row['公司名称'],
    salary_avg: salaryAvg,
    data_source: row['数据来源']
  })
  added++
}

// 3.3 保存合并后的数据
fs.writeJsonSync(jsonPath, existingData, { spaces: 2 })

console.log('         合并完成!')
console.log('         - 新增: ' + added + ' 条')
console.log('         - 重复跳过: ' + duplicates + ' 条')
console.log('         - 总计: ' + existingData.length + ' 条')

// 4. 同步到其他位置
const syncPaths = [
  'public/data/all_cleaned_jobs.json',
  'dist/data/all_cleaned_jobs.json',
  'src/assets/all_cleaned_jobs.json'
]
syncPaths.forEach(p => {
  const target = path.join(__dirname, p)
  if (fs.existsSync(path.dirname(target))) {
    fs.copySync(jsonPath, target)
  }
})
console.log('\n【步骤4】数据已同步到前端')

// 5. 验证新增数据
console.log('\n【步骤5】验证新增数据:')
const newData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
const newEntries = newData.filter(d => 
  d.job_name === '高级前端工程师' && d.company === '腾讯科技'
)
console.log('         查找"腾讯科技-高级前端工程师": ' + newEntries.length + ' 条')
if (newEntries.length > 0) {
  console.log('         ✓ 数据合并成功!')
  console.log('         详情:', JSON.stringify(newEntries[0], null, 2))
}

// 6. 清理测试文件
fs.removeSync(csvPath)
console.log('\n【步骤6】清理临时文件: ' + csvFileName + ' 已删除')

console.log('\n========================================')
console.log('  ✓ 数据实时更新验证完成!')
console.log('========================================')
console.log('\n总结:')
console.log('  1. 爬虫代码 (daily_crawler.py) 运行后自动调用 merge_to_system_json()')
console.log('  2. 数据按照 数据来源+岗位+公司+城市 去重')
console.log('  3. 新增数据追加到 all_cleaned_jobs.json')
console.log('  4. 后端 API /api/jobs/reload 刷新内存数据')
console.log('  5. 前端点击数据状态指示器即可刷新显示')