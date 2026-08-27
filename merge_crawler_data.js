/**
 * 爬虫数据合并脚本
 * 将爬虫CSV数据转换格式并合并到 all_cleaned_jobs.json
 * - 保留现有所有数据
 * - 按 unique_key 去重（数据来源+岗位名称+公司+城市）
 * - 新增数据追加到现有数据中
 */

const fs = require('fs-extra')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'backend', 'data')
const JSON_PATH = path.join(DATA_DIR, 'all_cleaned_jobs.json')
const CRAWLER_DIR = path.join(__dirname, 'spider')

/**
 * 解析薪资字符串，提取平均值
 * "3000-6000元" -> 4500
 * "8000-12000元" -> 10000
 * "2万-3万" -> 25000
 * "面议" / "" -> 0
 */
function parseSalary(salaryStr) {
  if (!salaryStr || salaryStr.trim() === '') return 0
  const str = salaryStr.trim()

  if (str === '面议' || str.includes('面议')) return 0

  // Pattern: "3000-6000元" or "8000-12000元/月"
  const rangeMatch = str.match(/([\d.]+)\s*-?\s*([\d.]+)?\s*(万|千)?/)
  if (!rangeMatch) return 0

  let min = parseFloat(rangeMatch[1])
  let max = rangeMatch[2] ? parseFloat(rangeMatch[2]) : min
  const unit = rangeMatch[3] || ''

  if (unit === '万') {
    min *= 10000
    max *= 10000
  } else if (unit === '千') {
    min *= 1000
    max *= 1000
  }

  return Math.round((min + max) / 2)
}

/**
 * 提取城市名（从"广州·黄埔·联和"中提取"广州"）
 */
function extractCity(cityStr) {
  if (!cityStr) return ''
  const parts = cityStr.split(/[·\-]/)
  return parts[0].trim()
}

/**
 * 转换一条CSV记录为JSON格式
 */
function convertRecord(row) {
  return {
    job_name: row['岗位名称'] || row['岗位'] || '',
    city: extractCity(row['城市'] || ''),
    education: row['学历要求'] || '不限',
    work_exp: row['经验要求'] || '不限',
    company: row['公司名称'] || '',
    salary_avg: parseSalary(row['薪资'] || ''),
    data_source: row['数据来源'] || '未知'
  }
}

/**
 * 生成唯一键用于去重
 */
function getUniqueKey(record) {
  return `${record.data_source}|${record.job_name}|${record.company}|${record.city}`
}

/**
 * 解析CSV文件（简单解析，处理引号）
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row = {}
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim()
    })
    if (row['岗位名称']) {
      rows.push(row)
    }
  }
  return rows
}

/**
 * 合并数据：将新数据追加到现有数据，去重
 */
function mergeData(existingData, newData) {
  const existingKeys = new Set(existingData.map(getUniqueKey))
  const added = []
  const duplicates = []

  for (const record of newData) {
    const key = getUniqueKey(record)
    if (!existingKeys.has(key)) {
      existingKeys.add(key)
      added.push(record)
    } else {
      duplicates.push(record)
    }
  }

  return { merged: [...existingData, ...added], added, duplicates }
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 爬虫数据合并工具 ===\n')

  // 1. 加载现有数据
  let existingData = []
  try {
    if (fs.existsSync(JSON_PATH)) {
      existingData = await fs.readJson(JSON_PATH)
      console.log(`[OK] 已加载现有数据: ${existingData.length} 条`)
    } else {
      console.log('[INFO] 现有数据文件不存在，将创建新文件')
    }
  } catch (err) {
    console.error('[ERROR] 读取现有数据失败:', err.message)
    process.exit(1)
  }

  // 2. 查找爬虫CSV文件
  const csvFiles = []
  if (fs.existsSync(CRAWLER_DIR)) {
    const files = fs.readdirSync(CRAWLER_DIR).filter(f =>
      f.endsWith('.csv') && f.includes('IT岗位')
    )
    for (const file of files) {
      csvFiles.push(path.join(CRAWLER_DIR, file))
    }
  }

  // 也检查根目录的CSV
  const rootFiles = fs.readdirSync(__dirname).filter(f =>
    f.endsWith('.csv') && f.includes('前程无忧')
  )
  for (const file of rootFiles) {
    csvFiles.push(path.join(__dirname, file))
  }

  console.log(`[INFO] 找到 ${csvFiles.length} 个CSV文件:`)
  csvFiles.forEach(f => console.log(`  - ${path.basename(f)}`))

  // 3. 解析并转换所有CSV数据
  let allNewData = []
  for (const csvPath of csvFiles) {
    try {
      const rawRows = parseCSV(csvPath)
      const converted = rawRows.map(convertRecord).filter(r => r.job_name)
      console.log(`[OK] ${path.basename(csvPath)}: ${rawRows.length} 条原始 -> ${converted.length} 条有效`)
      allNewData = allNewData.concat(converted)
    } catch (err) {
      console.error(`[ERROR] 处理 ${path.basename(csvPath)} 失败:`, err.message)
    }
  }

  console.log(`\n[INFO] 共获取 ${allNewData.length} 条新数据`)

  if (allNewData.length === 0) {
    console.log('[WARN] 没有新数据可合并')
    process.exit(0)
  }

  // 4. 合并数据
  const { merged, added, duplicates } = mergeData(existingData, allNewData)
  console.log(`\n[INFO] 合并结果:`)
  console.log(`  - 现有数据: ${existingData.length} 条`)
  console.log(`  - 新增数据: ${added.length} 条`)
  console.log(`  - 重复跳过: ${duplicates.length} 条`)
  console.log(`  - 合并总计: ${merged.length} 条`)

  // 5. 按数据源统计
  const sourceStats = {}
  merged.forEach(r => {
    sourceStats[r.data_source] = (sourceStats[r.data_source] || 0) + 1
  })
  console.log('\n[INFO] 数据源分布:')
  Object.entries(sourceStats).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count} 条`)
  })

  // 6. 按城市统计Top10
  const cityStats = {}
  merged.forEach(r => {
    if (r.city) cityStats[r.city] = (cityStats[r.city] || 0) + 1
  })
  const topCities = Object.entries(cityStats).sort((a, b) => b[1] - a[1]).slice(0, 10)
  console.log('\n[INFO] Top 10 城市:')
  topCities.forEach(([city, count]) => {
    console.log(`  - ${city}: ${count} 条`)
  })

  // 7. 保存合并后的数据
  await fs.writeJson(JSON_PATH, merged, { spaces: 2 })
  console.log(`\n[OK] 数据已保存到: ${JSON_PATH}`)
  console.log(`[OK] 文件大小: ${(fs.statSync(JSON_PATH).size / 1024 / 1024).toFixed(2)} MB`)

  console.log('\n=== 合并完成 ===')
  return { added: added.length, total: merged.length }
}

main().catch(err => {
  console.error('[FATAL] 合并失败:', err)
  process.exit(1)
})