const express = require('express')
const router = express.Router()
const path = require('path')
const { spawn } = require('child_process')
const jobService = require('../services/jobService')

const PROJECT_ROOT = path.resolve(__dirname, '../../')
const STATUS_FILE = path.join(PROJECT_ROOT, 'crawler_status.json')
const LOGIN_FILE = path.join(PROJECT_ROOT, 'login_status.json')
const LOCK_FILE = path.join(PROJECT_ROOT, 'logs', 'crawler.run.lock')
const DATA_FILE = path.join(PROJECT_ROOT, 'backend', 'data', 'all_cleaned_jobs.json')
const SCHEDULE_FILE = path.join(PROJECT_ROOT, 'crawler_schedule.json')
const ENV_FILE = path.join(PROJECT_ROOT, '.env')
const fs = require('fs')

// 解析爬虫用的 Python 可执行文件路径（支持 .env PYTHON_PATH 覆盖 / 环境变量 / 系统PATH / 本地 venv）
function resolvePythonExecutable() {
  // 1) 项目根 .env 的 PYTHON_PATH 优先级最高（支持用户自定义）
  if (fs.existsSync(ENV_FILE)) {
    try {
      const raw = fs.readFileSync(ENV_FILE, 'utf-8')
      const line = raw.split(/\r?\n/).map(l => l.trim()).find(l => /^PYTHON_PATH\s*=/.test(l))
      if (line) {
        const p = line.split('=')[1].replace(/^["']|["']$/g, '').trim()
        if (p && fs.existsSync(p)) return p
      }
    } catch (_) {}
  }
  // 2) 进程环境变量 PYTHON_PATH
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) return process.env.PYTHON_PATH
  // 3) which('python') —— 系统PATH上的python
  try {
    const ext = process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM'
    const paths = (process.env.PATH || '').split(path.delimiter)
    for (const dir of paths) {
      for (const e of ext.split(';')) {
        const c1 = path.join(dir, 'python' + e)
        if (fs.existsSync(c1)) return c1
        const c2 = path.join(dir, 'python3' + e)
        if (fs.existsSync(c2)) return c2
      }
    }
  } catch (_) {}
  // 4) 退回项目本地 venv（若存在）
  const fallback = path.join(PROJECT_ROOT, '.venv312', 'Scripts', 'python.exe')
  return fallback
}

function readJsonSafe(file, defaultValue) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (e) {}
  return defaultValue
}

function writeJsonSafe(file, obj) {
  try { fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8') } catch (e) {}
}

function isRunning() {
  try { return fs.existsSync(LOCK_FILE) } catch (e) { return false }
}

// ========== 定时调度器（纯手写无依赖） ==========
let scheduleState = readJsonSafe(SCHEDULE_FILE, {
  enabled: false,
  cron_expression: '0 2 * * *',      // 默认每天凌晨2点
  time_description: '每天 02:00',
  last_run_time: null,
  next_run_time: null,
  history: []
})
let scheduleTimer = null
let scheduleTickTimer = null

function parseCronMinimal(expr) {
  // 支持极简格式："分 时 * * *"  (每天定时)
  const parts = (expr || '').trim().split(/\s+/)
  if (parts.length < 5) return null
  const [min, hour] = parts
  if (min === '*' || hour === '*') return { everyMinute: true } // 仅用于测试
  return { minute: parseInt(min, 10), hour: parseInt(hour, 10) }
}

function computeNextRun(expr) {
  const p = parseCronMinimal(expr)
  if (!p) return null
  const now = new Date()
  if (p.everyMinute) {
    const d = new Date(now.getTime() + 60000)
    d.setSeconds(0, 0); return d
  }
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), p.hour, p.minute, 0, 0)
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
  return target
}

function startCrawlerFromSchedule() {
  if (isRunning()) return
  try {
    const python = resolvePythonExecutable()
    const script = path.join(PROJECT_ROOT, 'spider', 'run_all.py')
    const logsDir = path.join(PROJECT_ROOT, 'logs')
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
    const outLog = fs.openSync(path.join(logsDir, 'crawler_stdout.log'), 'a')
    const errLog = fs.openSync(path.join(logsDir, 'crawler_stderr.log'), 'a')
    console.log('[SCHEDULE] 启动爬虫子进程: python=' + python + ' script=' + script)
    const child = spawn(python, [script], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', outLog, errLog],
      detached: true,
      windowsHide: false,
      env: Object.assign({}, process.env, { CRAWLER_SKIP_LOGIN_INPUT: '1' }),
    })
    const runStart = Date.now()
    child.once('close', async (code) => {
      try {
        const reloadRes = await jobService.reloadData()
        const duration = Math.round((Date.now() - runStart) / 1000)
        if (scheduleState.history && scheduleState.history[0] && scheduleState.history[0].status === 'started') {
          scheduleState.history[0].status = code === 0 ? 'success' : `failed (exit ${code})`
          scheduleState.history[0].duration_seconds = duration
          scheduleState.history[0].reloaded = reloadRes && reloadRes.success
            ? `+${reloadRes.added} → 共 ${reloadRes.newCount} 条`
            : null
          scheduleState.history[0].finished_time = new Date().toLocaleString('zh-CN')
          writeJsonSafe(SCHEDULE_FILE, scheduleState)
        }
        console.log(`[SCHEDULE] 爬虫完成 exit=${code}  reload=${JSON.stringify(reloadRes)}`)
      } catch (err) {
        console.error('[SCHEDULE] 爬虫结束后 reloadData 失败:', err.message)
      }
    })
    child.unref()
    fs.closeSync(outLog); fs.closeSync(errLog)
    scheduleState.last_run_time = new Date().toLocaleString('zh-CN')
    scheduleState.history.unshift({
      time: scheduleState.last_run_time,
      type: 'scheduled',
      status: 'started',
      python_executable: python
    })
    if (scheduleState.history.length > 10) scheduleState.history.length = 10
    writeJsonSafe(SCHEDULE_FILE, scheduleState)
  } catch (e) { console.error('[SCHEDULE] 启动爬虫失败:', e.message) }
}

function installScheduleTick() {
  if (scheduleTickTimer) clearInterval(scheduleTickTimer)
  scheduleTickTimer = setInterval(() => {
    if (!scheduleState.enabled) return
    const p = parseCronMinimal(scheduleState.cron_expression)
    if (!p) return
    const now = new Date()
    // 计算下次运行
    const next = computeNextRun(scheduleState.cron_expression)
    scheduleState.next_run_time = next ? next.toLocaleString('zh-CN') : null
    // 触发判定（每分钟都看当前时分是否匹配）
    let shouldFire = false
    if (p.everyMinute) shouldFire = true
    else if (now.getHours() === p.hour && now.getMinutes() === p.minute) shouldFire = true
    if (shouldFire) {
      // 防止同一分钟重复触发
      const fireKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
      if (scheduleState._lastFireKey !== fireKey) {
        scheduleState._lastFireKey = fireKey
        startCrawlerFromSchedule()
      }
    }
    // ===== 错过补爬：如果当前时间已超过今天计划时间，且今天还没成功跑过，则立即补爬一次 =====
    if (!shouldFire && !p.everyMinute) {
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
      const alreadyRanToday = (scheduleState.history || []).some(h => {
        if (!h || !h.time) return false
        try {
          const d = new Date((h.time || '').replace(/\//g, '-').replace(/年|月/g, '-').replace(/日/g, '').trim().split(' ')[0] + 'T00:00:00')
          return d.toDateString() === now.toDateString() && (h.status === 'started' || h.status === 'completed' || h.status === 'running')
        } catch (_) { return false }
      })
      const pastSchedule = (now.getHours() > p.hour) || (now.getHours() === p.hour && now.getMinutes() > p.minute)
      const catchUpKey = 'catchup_' + todayKey
      if (pastSchedule && !alreadyRanToday && scheduleState._lastCatchUpKey !== catchUpKey) {
        scheduleState._lastCatchUpKey = catchUpKey
        scheduleState.history.unshift({
          time: now.toLocaleString('zh-CN'),
          type: 'catch-up',
          status: 'started',
          message: '检测到今日 定时（' + (scheduleState.time_description || scheduleState.cron_expression) + '） 未执行，自动补爬'
        })
        if (scheduleState.history.length > 10) scheduleState.history.length = 10
        console.log('[SCHEDULE] 触发错过补爬 (今日计划时间已过但未执行)')
        startCrawlerFromSchedule()
      }
    }
    writeJsonSafe(SCHEDULE_FILE, scheduleState)
  }, 20000) // 每20秒检查一次
}

// 启动时恢复调度器
if (scheduleState.enabled) installScheduleTick()

// ========== API ==========

router.get('/schedule', (req, res) => {
  try {
    scheduleState = readJsonSafe(SCHEDULE_FILE, scheduleState)
    if (scheduleState.enabled) {
      const next = computeNextRun(scheduleState.cron_expression)
      scheduleState.next_run_time = next ? next.toLocaleString('zh-CN') : null
    }
    res.json({ success: true, data: scheduleState })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.post('/schedule', (req, res) => {
  try {
    const { enabled, cron_expression, time_description } = req.body || {}
    if (cron_expression !== undefined) {
      const p = parseCronMinimal(cron_expression)
      if (!p) return res.status(400).json({ success: false, message: 'Cron格式不支持，示例："0 2 * * *" 表示每天02:00' })
      scheduleState.cron_expression = cron_expression
    }
    if (time_description !== undefined) scheduleState.time_description = time_description
    if (enabled !== undefined) scheduleState.enabled = !!enabled

    if (scheduleState.enabled) {
      installScheduleTick()
    } else {
      if (scheduleTickTimer) { clearInterval(scheduleTickTimer); scheduleTickTimer = null }
    }
    const next = computeNextRun(scheduleState.cron_expression)
    scheduleState.next_run_time = next ? next.toLocaleString('zh-CN') : null
    writeJsonSafe(SCHEDULE_FILE, scheduleState)
    res.json({ success: true, data: scheduleState })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.post('/schedule/run-now', (req, res) => {
  try {
    if (isRunning()) return res.json({ success: false, message: '爬虫已在运行中' })
    startCrawlerFromSchedule()
    res.json({ success: true, message: '已立即触发爬取' })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

// ========== Windows 系统计划任务（不依赖Node一直运行，开机定时执行） ==========
const WIN_TASK_NAME = 'IT就业数据_每日自动爬取'
const REGISTER_BAT = path.join(PROJECT_ROOT, '注册Windows定时任务_右键管理员运行.bat')
const UNREGISTER_BAT = path.join(PROJECT_ROOT, '取消Windows定时任务_右键管理员运行.bat')
const AUTO_BAT = path.join(PROJECT_ROOT, 'auto_crawl_daily.bat')

function queryWindowsTask() {
  try {
    const { execSync } = require('child_process')
    const out = execSync(`schtasks /Query /TN "${WIN_TASK_NAME}" /FO CSV /V /NH`, { encoding: 'utf-8', timeout: 5000 })
    const lines = out.trim().split(/\r?\n/).filter(Boolean)
    const lastLine = lines[lines.length - 1]
    // CSV parse 简单处理
    const cols = (lastLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []).map(s => s.replace(/^"|"$/g, ''))
    // SCHTASKS /V /FO CSV 的列顺序：HostName,TaskName,Next Run Time,Status,Logon Mode,Last Run Time,Last Result,Author,Task To Run,Start In,Comment,Scheduled Task State,Idle Time,Power Management,Run As User,Delete Task If Not Rescheduled,Stop Task If Runs X Hours And X Mins,Schedule Type,Start Time,Start Date,End Date,Days,Months,Repeat:Every,Repeat:Until:Time,Repeat:Until:Duration,Repeat:Stop If Still Running
    return {
      exists: true,
      hostName: cols[0] || '',
      taskName: cols[1] || '',
      nextRun: cols[2] || '',
      status: cols[3] || '',
      lastRun: cols[5] || '',
      lastResult: cols[6] || '',
      author: cols[7] || '',
      runAsUser: cols[14] || '',
      scheduleType: cols[17] || '',
      startTime: cols[18] || '',
    }
  } catch (e) {
    return { exists: false, error: e.message, taskName: WIN_TASK_NAME }
  }
}

router.get('/windows-task', (req, res) => {
  try {
    const info = queryWindowsTask()
    res.json({
      success: true,
      data: Object.assign(info, {
        auto_bat_path: AUTO_BAT,
        register_bat_path: REGISTER_BAT,
        unregister_bat_path: UNREGISTER_BAT,
      })
    })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.post('/windows-task/run-now', (req, res) => {
  try {
    if (isRunning()) return res.json({ success: false, message: '爬虫已在运行中' })
    const { exec } = require('child_process')
    exec(`schtasks /Run /TN "${WIN_TASK_NAME}"`, { encoding: 'utf-8', timeout: 10000 }, (err, stdout) => {
      if (err) return res.json({ success: false, message: '立即运行失败: ' + (err.message || err) })
      res.json({ success: true, message: '已通过Windows计划任务立即触发', detail: stdout })
    })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.get('/status', (req, res) => {
  try {
    let crawlerStatus = readJsonSafe(STATUS_FILE, {
      status: 'idle', progress: 0, current_step: '暂无任务',
      sites: {
        '智联': { status: 'pending', raw_count: 0, pages: 0, message: '等待中' },
        '猎聘': { status: 'pending', raw_count: 0, pages: 0, message: '等待中' },
        '前程无忧': { status: 'pending', raw_count: 0, pages: 0, message: '等待中', cities_total: 0, cities_done: 0 }
      },
      total_raw_count: 0, final_count: 0
    })
    if (isRunning() && crawlerStatus.status !== 'running') {
      crawlerStatus.status = 'running'
      crawlerStatus.current_step = crawlerStatus.current_step || '采集中'
    }
    const loginStatus = readJsonSafe(LOGIN_FILE, { last_login_time: null, sites: { '智联': false, '猎聘': false, '前程无忧': false } })

    let dataSummary = { total: 0, by_source: {}, by_city_top10: {}, last_update: null }
    try {
      if (fs.existsSync(DATA_FILE)) {
        const stat = fs.statSync(DATA_FILE)
        dataSummary.last_update = new Date(stat.mtime).toLocaleString('zh-CN')
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
        dataSummary.total = data.length
        const bySrc = {}, byCity = {}
        data.forEach(j => {
          const src = j.data_source || '未知'
          bySrc[src] = (bySrc[src] || 0) + 1
          const c = j.city || '未知'
          byCity[c] = (byCity[c] || 0) + 1
        })
        dataSummary.by_source = bySrc
        const sortedCities = Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 10)
        dataSummary.by_city_top10 = Object.fromEntries(sortedCities)
      }
    } catch (e) { dataSummary.error = e.message }

    let recentLogs = []
    try {
      const logFile = path.join(PROJECT_ROOT, 'logs', 'crawler_stdout.log')
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8').split('\n')
        recentLogs = content.slice(-30).filter(Boolean)
      }
    } catch (e) {}

    scheduleState = readJsonSafe(SCHEDULE_FILE, scheduleState)

    res.json({
      success: true,
      data: {
        running: isRunning(),
        crawler: crawlerStatus,
        login: loginStatus,
        data_summary: dataSummary,
        recent_logs: recentLogs,
        schedule: scheduleState
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/start', (req, res) => {
  try {
    if (isRunning()) return res.json({ success: false, message: '已有爬虫实例正在运行中，请等待结束' })
    const python = resolvePythonExecutable()
    const script = path.join(PROJECT_ROOT, 'spider', 'run_all.py')
    const logsDir = path.join(PROJECT_ROOT, 'logs')
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
    const outLog = fs.openSync(path.join(logsDir, 'crawler_stdout.log'), 'a')
    const errLog = fs.openSync(path.join(logsDir, 'crawler_stderr.log'), 'a')
    console.log('[CRAWLER /start] 启动: python=' + python)
    const child = spawn(python, [script], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', outLog, errLog],
      detached: true,
      windowsHide: false,
      env: Object.assign({}, process.env, { CRAWLER_SKIP_LOGIN_INPUT: '1' }),
    })
    const runStart = Date.now()
    child.once('close', async (code) => {
      try {
        const reloadRes = await jobService.reloadData()
        console.log(`[CRAWLER /start] 完成 exit=${code}  duration=${Math.round((Date.now()-runStart)/1000)}s reload=${JSON.stringify(reloadRes)}`)
      } catch (err) {
        console.error('[CRAWLER /start] 结束后 reloadData 失败:', err.message)
      }
    })
    child.unref()
    fs.closeSync(outLog); fs.closeSync(errLog)
    res.json({ success: true, pid: child.pid, python_executable: python, message: '爬虫已启动，完成后会自动刷新后端数据缓存' })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.post('/login', (req, res) => {
  try {
    const python = resolvePythonExecutable()
    const script = path.join(PROJECT_ROOT, 'crawler_login_manager.py')
    console.log('[CRAWLER /login] 启动: python=' + python)
    const child = spawn(python, [script], {
      cwd: PROJECT_ROOT, detached: true, stdio: 'inherit', shell: false,
    })
    child.unref()
    res.json({ success: true, pid: child.pid, message: '登录管理器已启动，请在新控制台窗口完成登录' })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.get('/logs', (req, res) => {
  try {
    const logFile = path.join(PROJECT_ROOT, 'logs', 'crawler_stdout.log')
    let lines = []
    if (fs.existsSync(logFile)) lines = fs.readFileSync(logFile, 'utf-8').split('\n').slice(-80).filter(Boolean)

    res.json({ success: true, data: lines })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

module.exports = router
