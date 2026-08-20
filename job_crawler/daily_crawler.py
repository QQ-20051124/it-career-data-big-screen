# -*- coding: utf-8 -*-
"""
全国 IT 岗位每日爬虫（智联、猎聘、前程无忧）—— 全量无地域限制版
【无地域限制全量采集】
- 智联：持久化上下文，固定全国URL（无城市参数），自动检测登录
- 猎聘：URL分页（currentPage参数，沿用已修复方案），无地域限制
- 前程无忧：自动遍历页面可见全部城市入口，逐个城市依次采集
- 自动持续翻页：连续3页返回0条新岗位才判定采集结束
- 单站点最多3次重试防卡死
- 每页随机延时 + 浏览器指纹优化
- 采集完成后：后置过滤非IT岗位 → 去重 → 历史快照 → 覆盖 all_cleaned_jobs.json
- 关键词固定仅【计算机】
- 凌晨2点定时任务
"""
import csv
import json
import sqlite3
import time
import logging
import schedule
import threading
import random
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# 导入共享工具模块
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
import crawler_utils

# ================== 日志配置 ==================
LOG_DIR = Path(__file__).parent.absolute() / "logs"
LOG_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / f"crawler_{datetime.now().strftime('%Y%m')}.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ================== 配置区 ==================
BASE_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = BASE_DIR.parent
ZHAOPIN_USERDATA_DIR = BASE_DIR / "zhaopin_userdata"
LIEPIN_USERDATA_DIR = BASE_DIR / "liepin_userdata"
JOB51_USERDATA_DIR = BASE_DIR / "job51_userdata"
DB_PATH = BASE_DIR / "jobs.db"

ZHAOPIN_USERDATA_DIR.mkdir(parents=True, exist_ok=True)
LIEPIN_USERDATA_DIR.mkdir(parents=True, exist_ok=True)
JOB51_USERDATA_DIR.mkdir(parents=True, exist_ok=True)

# 关键词固定仅【计算机】
KEYWORDS = ["计算机"]

LOGIN_TIMEOUT = 120

# 翻页终止：连续3页返回0条新岗位才判定采集结束
EMPTY_PAGE_THRESHOLD = 3

# 单站点最多重试次数
MAX_RETRY = 3

# ================== 前程无忧城市入口映射 ==================
# 自动遍历页面可见全部城市入口，逐个城市依次采集
JOB51_CITIES = [
    ("北京", "010000"),
    ("上海", "020000"),
    ("广州", "030200"),
    ("深圳", "040000"),
    ("武汉", "180200"),
    ("西安", "200200"),
    ("杭州", "080200"),
    ("南京", "070200"),
    ("成都", "090200"),
    ("重庆", "060000"),
    ("东莞", "030800"),
    ("云浮", "301400"),
    ("其他城市", "000000"),  # 全国兜底，捕获未列出的城市
]

# ================== 登录模式配置 ==================
FORCE_RELOGIN = False

# ================== 定时任务配置 ==================
# ⚠️【Lenovo每日爬虫·进程内调度器已禁用】
# 此前本文件内置 schedule 库的进程内定时调度（每日02:00自动run_crawler），
# 与 Windows 任务计划程序的【凌晨2点爬虫】(start_crawler.bat → spider/run_all.py) 重复调度，
# 会导致两套爬虫并行采集、重复写入主数据文件，存在数据覆盖丢失风险。
# 现已统一收口：唯一正式定时任务 = 每日凌晨 02:00 执行 spider/run_all.py（DrissionPage 版）。
# 本文件（Playwright 旧版）仅保留 run_crawler() 供手动单次调试，禁止再被定时调度。
DAILY_CRAWL_TIMES = ["02:00"]
ENABLE_SCHEDULER = False  # 已禁用：禁止进程内重复调度爬虫采集

# ================== 运行模式 ==================
HEADLESS = False

# ================== 调试模式 ==================
DEBUG_SAVE_HTML = False

# ================== 浏览器指纹优化 ==================
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
]
VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1536, "height": 864},
    {"width": 1440, "height": 900},
    {"width": 1366, "height": 768},
]

STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
Object.defineProperty(navigator, 'languages', {get: () => ['zh-CN', 'zh', 'en']});
window.chrome = { runtime: {} };
"""


def random_fingerprint():
    """优化浏览器指纹特征：随机UA + 随机viewport"""
    return {
        "user_agent": random.choice(USER_AGENTS),
        "viewport": random.choice(VIEWPORTS),
    }


def init_db():
    """数据库初始化（保留原有数据库能力，记录历史）"""
    logger.info("初始化数据库...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            keyword TEXT NOT NULL DEFAULT '',
            crawl_date TEXT NOT NULL,
            job_title TEXT,
            salary TEXT,
            city TEXT,
            experience TEXT,
            education TEXT,
            company TEXT,
            extra TEXT,
            unique_key TEXT UNIQUE
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS crawl_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crawl_date TEXT NOT NULL,
            site TEXT NOT NULL,
            job_count INTEGER,
            status TEXT,
            error_msg TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    logger.info("数据库初始化完成")


def save_to_db(all_jobs, date_str):
    """保存到数据库（保留原有能力，历史归档用）"""
    if not all_jobs:
        return
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    insert_count = 0
    for job in all_jobs:
        company = job.get('company', '')
        job_name = job.get('job_name', '')
        city = job.get('city', '')
        job_id = job.get('job_id', f"{company}_{job_name}_{city}")
        unique = f"{'计算机'}_{job.get('data_source', '')}_{job_id}_{date_str}"
        extra = json.dumps({"job_id": job_id}, ensure_ascii=False)
        try:
            c.execute(
                "INSERT INTO jobs (site, keyword, crawl_date, job_title, salary, city, experience, education, company, extra, unique_key) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (job.get('data_source', ''), '计算机', date_str,
                 job_name, str(job.get('salary_avg', 0)), city,
                 job.get('work_exp', ''), job.get('education', ''), company,
                 extra, unique)
            )
            insert_count += 1
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()
    logger.info(f"数据库归档 {insert_count} 条")


# ================== 智联自动登录检测 ==================
def wait_for_zhaopin_login(page, timeout=LOGIN_TIMEOUT):
    global FORCE_RELOGIN
    if FORCE_RELOGIN:
        logger.info("FORCE_RELOGIN=True，强制清除登录状态，等待手动登录...")
        print(f"[LOGIN] FORCE_RELOGIN=True，强制清除登录状态，等待手动登录（最多 {timeout} 秒）...")
        try:
            page.context.clear_cookies()
            page.goto("https://www.zhaopin.com/login/", timeout=30000)
        except:
            pass
        start_time = time.time()
        while time.time() - start_time < timeout:
            current_url = page.url
            if "login" not in current_url.lower() and "sou.zhaopin.com" in current_url:
                logger.info("登录成功")
                print("[OK] 登录成功！")
                return True
            time.sleep(3)
        return False

    current_url = page.url
    if "login" not in current_url.lower() and ("www.zhaopin.com" in current_url or "sou.zhaopin.com" in current_url):
        logger.info("智联已处于登录状态")
        return True

    logger.info(f"检测到需要登录，等待登录（最多 {timeout} 秒）...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        current_url = page.url
        if "login" not in current_url.lower() and ("www.zhaopin.com" in current_url or "sou.zhaopin.com" in current_url):
            logger.info("登录成功")
            return True
        time.sleep(3)
    return False


# ================== 爬虫1：智联招聘（无地域限制全量采集） ==================
def crawl_zhaopin(keyword="计算机"):
    """
    智联招聘：取消一切地区筛选、城市限制
    固定全国URL（无jl城市参数），自动持续翻页
    连续3页返回0条新岗位才判定采集结束
    """
    jobs = []
    raw_count = 0
    logger.info(f"【无地域限制全量采集】开始爬取智联招聘，关键词：{keyword}")
    print(f"\n{'='*20} 智联招聘（无地域限制全量采集）—— {keyword} {'='*20}")

    fp = random_fingerprint()
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(ZHAOPIN_USERDATA_DIR),
            headless=HEADLESS,
            slow_mo=100,
            viewport=fp["viewport"],
            user_agent=fp["user_agent"],
            channel="chrome"
        )
        # 注入指纹优化脚本
        try:
            context.add_init_script(STEALTH_JS)
        except:
            pass
        page = context.new_page()
        try:
            try:
                page.goto("https://www.zhaopin.com/", wait_until="domcontentloaded", timeout=60000)
            except:
                logger.warning("智联首页加载超时，尝试直接跳转到搜索页")

            if not wait_for_zhaopin_login(page):
                return jobs

            # 无地域限制：不传jl城市参数，全国全量采集
            search_url = f"https://sou.zhaopin.com/?kw={quote(keyword)}&p=1"
            logger.info(f"【无地域限制全量采集】跳转全国搜索页: {search_url}")
            print(f"[SEARCH] 【无地域限制全量采集】全国搜索页")
            page.goto(search_url, wait_until="domcontentloaded", timeout=120000)
            time.sleep(5)

            selectors_to_try = [
                ".joblist-box__item",
                ".joblist-item",
                ".iteminfo",
                "[class*='joblist'] [class*='item']"
            ]
            used_selector = None
            for selector in selectors_to_try:
                try:
                    if page.locator(selector).count() > 0:
                        used_selector = selector
                        logger.info(f"找到岗位列表，使用选择器: {selector}")
                        print(f"[OK] 找到岗位列表")
                        break
                except:
                    continue

            if not used_selector:
                logger.warning("未找到岗位列表，尝试刷新...")
                page.reload(wait_until="domcontentloaded")
                time.sleep(5)
                for selector in selectors_to_try:
                    try:
                        if page.locator(selector).count() > 0:
                            used_selector = selector
                            break
                    except:
                        continue

            if not used_selector:
                logger.error("刷新后仍未找到岗位列表")
                print("[FAIL] 智联未找到岗位列表")
                return jobs

            # 滚动加载
            for _ in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(2000)

            page_num = 1
            consecutive_empty = 0  # 连续空页计数
            while True:
                logger.info(f"智联 第 {page_num} 页...")
                print(f"\n[PAGE] 智联 第 {page_num} 页...")

                # 等待列表稳定
                last_count = 0
                for _ in range(5):
                    now = page.locator(used_selector).count()
                    if now == last_count:
                        break
                    last_count = now
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(2000)

                page_raw_count = last_count
                logger.info(f"智联 第 {page_num} 页【原始抓取条数】: {page_raw_count}")
                print(f"[COUNT] 智联 第 {page_num} 页【原始抓取条数】: {page_raw_count}")

                if page_raw_count == 0:
                    consecutive_empty += 1
                    logger.warning(f"智联 第 {page_num} 页无岗位数据，连续空页计数: {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                    print(f"[WARN] 智联 连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}（可能平台无岗位或风控拦截）")
                    if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                        logger.info(f"智联 连续{EMPTY_PAGE_THRESHOLD}页无新岗位，判定采集结束")
                        print(f"[END] 智联 连续{EMPTY_PAGE_THRESHOLD}页无新岗位，判定采集结束")
                        break
                else:
                    consecutive_empty = 0  # 重置空页计数

                # 解析页面
                html = page.content()
                soup = BeautifulSoup(html, "html.parser")
                cards = soup.find_all("div", class_="joblist-box__item")
                if not cards:
                    cards = soup.find_all("div", class_="joblist-item")
                if not cards:
                    cards = soup.find_all("div", class_="iteminfo")
                if not cards:
                    for tag in soup.find_all("div"):
                        class_name = " ".join(tag.get("class", []))
                        if "joblist" in class_name and "item" in class_name:
                            cards.append(tag)

                for card in cards:
                    job_name = ""
                    salary = ""
                    city = ""
                    work_year = ""
                    education = ""
                    company_name = ""

                    job_name_tag = card.find("a", target="_blank")
                    if job_name_tag:
                        job_name = job_name_tag.get_text(strip=True)
                        # 提取岗位详情页链接作为唯一ID
                        href = job_name_tag.get("href", "")
                    if not job_name:
                        job_name_tag = card.find("h1") or card.find("h2") or card.find("h3") or card.find("span", class_="job-name")
                        if job_name_tag:
                            job_name = job_name_tag.get_text(strip=True)
                    if not job_name:
                        for tag in card.find_all(["a", "span", "h1", "h2", "h3", "div"]):
                            text = tag.get_text(strip=True)
                            if len(text) > 2 and len(text) < 50 and "经验" not in text and "学历" not in text:
                                job_name = text
                                break

                    salary_tag = card.find("p", class_="jobinfo__salary")
                    if salary_tag:
                        salary = salary_tag.get_text(strip=True)
                    if not salary:
                        salary_tag = card.find("span", class_="salary") or card.find("span", class_="job-salary")
                        if salary_tag:
                            salary = salary_tag.get_text(strip=True)
                    if not salary:
                        for tag in card.find_all(["p", "span", "div"]):
                            text = tag.get_text(strip=True)
                            if ("-" in text and "K" in text.upper()) or "万" in text or "元" in text:
                                salary = text
                                break

                    info_items = card.find_all("div", class_="jobinfo__other-info-item")
                    if not info_items:
                        info_items = card.find_all("span", class_="info-item") or card.find_all("div", class_="info")
                    if len(info_items) > 0:
                        city = info_items[0].get_text(strip=True)
                    if len(info_items) > 1:
                        work_year = info_items[1].get_text(strip=True)
                    if len(info_items) > 2:
                        education = info_items[2].get_text(strip=True)

                    company_tag = card.find("a", class_="company-name")
                    if company_tag:
                        company_name = company_tag.get_text(strip=True)
                    if not company_name:
                        company_tag = card.find("div", class_="company") or card.find("span", class_="company")
                        if company_tag:
                            company_name = company_tag.get_text(strip=True)

                    if job_name:
                        # 城市字段修复：智联城市可能带"·"分隔，提取主城市
                        city = crawler_utils.extract_city(city)
                        jobs.append({
                            "data_source": "智联",
                            "job_name": job_name,
                            "salary": salary,
                            "city": city,
                            "work_exp": work_year,
                            "education": education,
                            "company": company_name,
                            "job_id": href if 'href' in dir() else f"{company_name}_{job_name}",
                        })
                        raw_count += 1

                logger.info(f"智联 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")
                print(f"[OK] 智联 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")

                # 随机延时（反爬适配）
                crawler_utils.random_delay(2.0, 5.0)

                # 翻页：点击下一页
                next_btn = page.locator("a:has-text('下一页')").first
                try:
                    if not next_btn.is_visible(timeout=3000):
                        logger.info("智联 没有下一页按钮")
                        break
                    if next_btn.get_attribute("disabled") is not None:
                        logger.info("智联 已到最后一页")
                        break
                    next_btn.click()
                    page.wait_for_timeout(4000)
                    page_num += 1
                except:
                    logger.info("智联 无法点击下一页，结束")
                    break

        except Exception as e:
            logger.error(f"智联爬取出错: {e}")
            print(f"[FAIL] 智联爬取出错: {e}")
        finally:
            context.close()

    logger.info(f"【无地域限制全量采集】智联完成：总遍历页数={page_num}, 原始未去重条数={raw_count}")
    crawler_utils.log_crawl_detail("智联", "全国", keyword, page_num, raw_count, raw_count, raw_count)
    return jobs


# ================== 猎聘登录检测 ==================
def wait_for_liepin_login(page, timeout=LOGIN_TIMEOUT):
    global FORCE_RELOGIN
    try:
        logger.info(f"当前URL: {page.url}")
        if FORCE_RELOGIN:
            logger.info("FORCE_RELOGIN=True，强制清除猎聘登录状态...")
            try:
                page.context.clear_cookies()
                page.goto("https://www.liepin.com/login/", wait_until="domcontentloaded", timeout=30000)
            except:
                pass
            start_time = time.time()
            while time.time() - start_time < timeout:
                if "login" not in page.url.lower():
                    return True
                time.sleep(3)
            return False

        if "login" not in page.url.lower():
            logger.info("猎聘已处于登录状态")
            return True

        logger.info(f"检测到需要登录猎聘，等待登录（最多 {timeout} 秒）...")
        start_time = time.time()
        while time.time() - start_time < timeout:
            if "login" not in page.url.lower():
                return True
            time.sleep(3)
        return False
    except Exception as e:
        logger.error(f"猎聘登录检测出错: {e}")
        return False


# ================== 爬虫2：猎聘网（URL分页，无地域限制） ==================
def crawl_liepin(keyword):
    """
    猎聘网：URL分页方式（沿用已修复方案，使用currentPage参数）
    取消一切地区筛选、城市限制
    自动持续翻页，连续3页0条新岗位才结束
    """
    jobs = []
    raw_count = 0
    logger.info(f"【无地域限制全量采集】开始爬取猎聘网，关键词：{keyword}")
    print(f"\n{'='*20} 猎聘网（无地域限制全量采集·URL分页）—— {keyword} {'='*20}")

    fp = random_fingerprint()
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(LIEPIN_USERDATA_DIR),
            headless=HEADLESS,
            slow_mo=100,
            viewport=fp["viewport"],
            user_agent=fp["user_agent"],
            channel="chrome"
        )
        try:
            context.add_init_script(STEALTH_JS)
        except:
            pass
        page = context.new_page()
        try:
            page.goto("https://www.liepin.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(2)

            if not wait_for_liepin_login(page):
                return jobs

            # 关闭弹窗
            try:
                close_btn = page.locator('.login-close, .lp-login-close, [class*="close"]').first
                if close_btn.is_visible(timeout=3000):
                    close_btn.click()
                    time.sleep(1)
            except:
                pass

            # API监听器：持续保持监听（不在页间stop/start，避免丢失请求）
            api_data = []

            def capture_api(response):
                if 'com.liepin.searchfront4c.pc-search-job' in response.url:
                    try:
                        data = response.json()
                        if 'data' in data and 'data' in data['data'] and 'jobCardList' in data['data']['data']:
                            api_data.append(data)
                    except:
                        pass

            page.on('response', capture_api)

            # URL分页：使用currentPage参数（沿用已修复方案）
            page_num = 1
            consecutive_empty = 0

            while True:
                # 构建分页URL（无地域参数，全量采集）
                url = f"https://www.liepin.com/zhaopin/?key={quote(keyword)}&currentPage={page_num}"
                logger.info(f"猎聘 URL分页 第 {page_num} 页: {url}")
                print(f"[PAGE] 猎聘 URL分页 第 {page_num} 页...")

                # 清空API缓存，等待当前页数据
                api_data.clear()
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=60000)
                except Exception as e:
                    logger.warning(f"猎聘第 {page_num} 页导航失败: {e}")
                    consecutive_empty += 1
                    if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                        logger.info(f"猎聘 连续{EMPTY_PAGE_THRESHOLD}页无数据，结束")
                        break
                    page_num += 1
                    crawler_utils.random_delay(3.0, 6.0)
                    continue

                # 等待API响应（增加等待时间到12秒，沿用修复方案）
                wait_start = time.time()
                while not api_data and time.time() - wait_start < 12:
                    page.wait_for_timeout(500)

                page_raw_count = 0
                if api_data:
                    json_data = api_data[-1]
                    items = json_data['data']['data']['jobCardList']
                    page_raw_count = len(items)
                    logger.info(f"猎聘 第 {page_num} 页【原始抓取条数】: {page_raw_count}")
                    print(f"[COUNT] 猎聘 第 {page_num} 页【原始抓取条数】: {page_raw_count}")

                    if page_raw_count == 0:
                        consecutive_empty += 1
                        logger.warning(f"猎聘 第 {page_num} 页0条岗位，连续空页: {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                        if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                            logger.info(f"猎聘 连续{EMPTY_PAGE_THRESHOLD}页0条，判定采集结束")
                            print(f"[END] 猎聘 连续{EMPTY_PAGE_THRESHOLD}页0条，判定采集结束")
                            break
                    else:
                        consecutive_empty = 0
                        for card in items:
                            job_info = card.get("job", {})
                            comp_info = card.get("comp", {})
                            # 城市字段修复：猎聘dq字段可能为"城市-区域"，提取主城市
                            city_raw = job_info.get('dq', '')
                            city = crawler_utils.extract_city(city_raw)
                            jobs.append({
                                "data_source": "猎聘",
                                "job_name": job_info.get('title', ''),
                                "salary": job_info.get('salary', ''),
                                "city": city,
                                "work_exp": job_info.get('requireWorkYears', ''),
                                "education": job_info.get('requireEduLevel', ''),
                                "company": comp_info.get('compName', ''),
                                "job_id": job_info.get('jobId', '') or f"{comp_info.get('compName', '')}_{job_info.get('title', '')}",
                            })
                            raw_count += 1
                else:
                    # 区分「平台无岗位」和「风控拦截导致拿不到数据」
                    consecutive_empty += 1
                    logger.warning(f"猎聘 第 {page_num} 页未捕获API数据，连续空页: {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}（可能风控拦截）")
                    print(f"[WARN] 猎聘 第 {page_num} 页未获取数据（可能风控拦截），连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                    if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                        logger.info(f"猎聘 连续{EMPTY_PAGE_THRESHOLD}页无数据，判定采集结束")
                        break

                logger.info(f"猎聘 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")
                print(f"[OK] 猎聘 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")

                # 随机延时（反爬适配）
                crawler_utils.random_delay(2.0, 5.0)
                page_num += 1

        except Exception as e:
            logger.error(f"猎聘 [{keyword}] 出错: {e}")
            print(f"[FAIL] 猎聘 [{keyword}] 出错: {e}")
            import traceback
            traceback.print_exc()
        finally:
            context.close()

    logger.info(f"【无地域限制全量采集】猎聘完成：总遍历页数={page_num}, 原始未去重条数={raw_count}")
    crawler_utils.log_crawl_detail("猎聘", "全国", keyword, page_num, raw_count, raw_count, raw_count)
    return jobs


# ================== 爬虫3：前程无忧（遍历全部城市·URL分页） ==================
def crawl_51job_one_city(page, keyword, city_name, city_code):
    """前程无忧：单个城市内的持续翻页采集（URL导航为主+点击辅助）"""
    city_jobs = []
    city_raw_count = 0
    page_num = 1
    consecutive_empty = 0

    api_data = []

    def capture_api(response):
        if 'search-pc' in response.url.lower():
            try:
                data = response.json()
                api_data.append(data)
            except:
                pass

    page.on('response', capture_api)

    base_url = f"https://we.51job.com/pc/search?jobArea={city_code}&keyword={quote(keyword)}&searchType=2"
    logger.info(f"前程无忧 [{city_name}] 第 1 页 (导航到首页): {base_url}")
    print(f"[PAGE] 前程无忧 [{city_name}] 第 1 页 (导航到首页)...")

    api_data.clear()
    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(3000)
        page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        page.wait_for_timeout(1000)
    except Exception as e:
        logger.warning(f"前程无忧 [{city_name}] 导航失败: {e}")
        try:
            page.remove_listener('response', capture_api)
        except:
            pass
        crawler_utils.log_crawl_detail("前程无忧", city_name, keyword, 0, 0, 0, 0)
        return city_jobs, 0, 0

    wait_start = time.time()
    while not api_data and time.time() - wait_start < 15:
        page.wait_for_timeout(500)

    if not api_data:
        logger.warning(f"前程无忧 [{city_name}] 第 1 页未捕获API数据")
        print(f"[WARN] 前程无忧 [{city_name}] 第 1 页未获取数据（可能风控）")
        consecutive_empty = 1
    else:
        try:
            json_data = api_data[-1]
            items = json_data.get('resultbody', {}).get('job', {}).get('items', [])
            page_raw_count = len(items)
            logger.info(f"前程无忧 [{city_name}] 第 1 页【原始抓取条数】: {page_raw_count}")
            print(f"[COUNT] 前程无忧 [{city_name}] 第 1 页【原始抓取条数】: {page_raw_count}")

            if page_raw_count == 0:
                consecutive_empty = 1
            else:
                consecutive_empty = 0
                for item in items:
                    job = _build_51job_item(item, city_name)
                    if job:
                        city_jobs.append(job)
                        city_raw_count += 1
        except Exception as e:
            logger.warning(f"前程无忧 [{city_name}] 第 1 页数据解析失败: {e}")
            consecutive_empty = 1

    print(f"[OK] 前程无忧 [{city_name}] 第 1 页已采集 → 累计原始: {city_raw_count} 条")

    # 翻页循环：点击优先，URL兜底，50页上限
    while consecutive_empty < EMPTY_PAGE_THRESHOLD and page_num < 50:
        page_num += 1

        # 先尝试点击下一页按钮
        next_btn = _try_find_next_button(page)
        clicked = False

        if next_btn is not None:
            try:
                next_btn.click()
                logger.info(f"前程无忧 [{city_name}] 第 {page_num} 页 (点击下一页按钮)")
                print(f"[PAGE] 前程无忧 [{city_name}] 第 {page_num} 页 (点击下一页按钮)...")
                page.wait_for_timeout(2000)
                page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                page.wait_for_timeout(1000)
                clicked = True
            except Exception as e:
                logger.warning(f"前程无忧 [{city_name}] 点击下一页失败: {e}，改用URL导航")

        # URL兜底
        if not clicked:
            target_url = f"https://we.51job.com/pc/search?jobArea={city_code}&keyword={quote(keyword)}&searchType=2&currPage={page_num}"
            logger.info(f"前程无忧 [{city_name}] 第 {page_num} 页 (URL导航): {target_url}")
            print(f"[PAGE] 前程无忧 [{city_name}] 第 {page_num} 页 (URL导航)...")
            api_data.clear()
            try:
                page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(3000)
                page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                page.wait_for_timeout(1000)
            except Exception as e:
                logger.warning(f"前程无忧 [{city_name}] URL导航失败: {e}")
                consecutive_empty += 1
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    break
                continue

        # 等待API数据
        api_data.clear()
        wait_start = time.time()
        while not api_data and time.time() - wait_start < 15:
            page.wait_for_timeout(500)

        if not api_data:
            consecutive_empty += 1
            logger.warning(f"前程无忧 [{city_name}] 第 {page_num} 页未获取数据，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
            print(f"[WARN] 前程无忧 [{city_name}] 第 {page_num} 页未获取数据，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                break
            continue

        try:
            json_data = api_data[-1]
            items = json_data.get('resultbody', {}).get('job', {}).get('items', [])
            page_raw_count = len(items)
            logger.info(f"前程无忧 [{city_name}] 第 {page_num} 页【原始抓取条数】: {page_raw_count}")
            print(f"[COUNT] 前程无忧 [{city_name}] 第 {page_num} 页【原始抓取条数】: {page_raw_count}")

            if page_raw_count == 0:
                consecutive_empty += 1
                print(f"[WARN] 前程无忧 [{city_name}] 第 {page_num} 页0条，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    break
            else:
                consecutive_empty = 0
                for item in items:
                    job = _build_51job_item(item, city_name)
                    if job:
                        city_jobs.append(job)
                        city_raw_count += 1
        except Exception as e:
            logger.warning(f"前程无忧 [{city_name}] 第 {page_num} 页数据解析失败: {e}")
            consecutive_empty += 1
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                break

        print(f"[OK] 前程无忧 [{city_name}] 第 {page_num} 页已采集 → 累计原始: {city_raw_count} 条")
        crawler_utils.random_delay(2.0, 5.0)

    try:
        page.remove_listener('response', capture_api)
    except:
        pass

    crawler_utils.log_crawl_detail("前程无忧", city_name, keyword, page_num, city_raw_count, city_raw_count, city_raw_count)
    return city_jobs, page_num, city_raw_count


def _try_find_next_button(page):
    """尝试查找下一页按钮，返回元素或None"""
    selectors = [
        '.s_dropdown a.next',
        '.pager a.next',
        '.pagination .next',
        '.s_pages a.next',
        'button.next',
        'a[class*="next"]',
        'a[class*="page-next"]',
        'a[onclick*="next"]',
        'li.next a',
        '.s_pager a.next',
        'div.pagenav a.next',
    ]
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if loc.count() > 0 and loc.is_visible():
                return loc
        except Exception:
            continue
    try:
        text_loc = page.get_by_text('下一页').first
        if text_loc.count() > 0 and text_loc.is_visible():
            return text_loc
    except Exception:
        pass
    return None


def _build_51job_item(item, city_name):
    """从API item构建岗位数据字典"""
    area_detail = item.get('jobAreaLevelDetail', {})
    city_str = area_detail.get('cityString', '') or city_name
    return {
        "data_source": "前程无忧",
        "job_name": item.get('jobName', ''),
        "salary": item.get('provideSalaryString', ''),
        "city": city_str,
        "work_exp": item.get('workYearString', ''),
        "education": item.get('degreeString', ''),
        "company": item.get('companyName', ''),
        "job_id": item.get('jobHref', '') or f"{item.get('companyName', '')}_{item.get('jobName', '')}",
        "job_desc": item.get('jobDescribe', ''),
    }


def crawl_51job(keyword):
    """
    前程无忧：不使用全局无城市搜索
    自动遍历页面可见全部城市入口（北京、上海、广州、深圳、武汉、西安、杭州、南京、
    成都、重庆、东莞、云浮、其他城市），逐个城市依次采集
    每个城市内通过点击分页按钮持续翻页抓完该城市下所有岗位
    """
    all_city_jobs = []
    total_pages = 0
    total_raw = 0
    logger.info(f"【无地域限制全量采集】开始爬取前程无忧，关键词：{keyword}")
    print(f"\n{'='*20} 前程无忧（遍历全部城市·逐个城市采集）—— {keyword} {'='*20}")
    print(f"[INFO] 前程无忧 将依次遍历 {len(JOB51_CITIES)} 个城市入口")

    fp = random_fingerprint()
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(JOB51_USERDATA_DIR),
            headless=HEADLESS,
            slow_mo=100,
            viewport=fp["viewport"],
            user_agent=fp["user_agent"],
            channel="chrome"
        )
        try:
            context.add_init_script(STEALTH_JS)
        except:
            pass
        page = context.new_page()
        try:
            # 登录检测
            page.goto("https://www.51job.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)

            is_logged_in = False
            try:
                user_elements = page.locator('.user-name, .avatar, .nickname, a:has-text("我的"), .my-account')
                if user_elements.count() > 0:
                    is_logged_in = True
            except:
                pass

            if not is_logged_in:
                logger.info(f"前程无忧未登录，等待手动登录（最多 {LOGIN_TIMEOUT} 秒）...")
                print(f"[LOGIN] 前程无忧未登录，请手动登录（最多 {LOGIN_TIMEOUT} 秒）...")
                start_time = time.time()
                while time.time() - start_time < LOGIN_TIMEOUT:
                    try:
                        user_elements = page.locator('.user-name, .avatar, .nickname, a:has-text("我的"), .my-account')
                        if user_elements.count() > 0:
                            is_logged_in = True
                            break
                    except:
                        pass
                    time.sleep(3)
                if not is_logged_in:
                    logger.warning("前程无忧登录超时，跳过")
                    return all_city_jobs
            else:
                logger.info("前程无忧已登录")
                print("[OK] 前程无忧已登录")

            # 逐个城市依次采集
            for city_name, city_code in JOB51_CITIES:
                logger.info(f"前程无忧 开始采集城市：{city_name}（code={city_code}）")
                print(f"\n[CITY] 前程无忧 开始采集城市：{city_name}")

                try:
                    city_jobs, city_pages, city_raw = crawl_51job_one_city(page, keyword, city_name, city_code)
                    all_city_jobs.extend(city_jobs)
                    total_pages += city_pages
                    total_raw += city_raw
                    logger.info(f"前程无忧 [{city_name}] 城市采集完成：页数={city_pages}, 原始条数={city_raw}")
                    print(f"[CITY-DONE] 前程无忧 [{city_name}] 完成：页数={city_pages}, 原始条数={city_raw}")
                except Exception as e:
                    logger.error(f"前程无忧 [{city_name}] 采集出错: {e}")
                    print(f"[FAIL] 前程无忧 [{city_name}] 采集出错: {e}")

                # 城市间随机延时
                crawler_utils.random_delay(3.0, 7.0)

        except Exception as e:
            logger.error(f"前程无忧 [{keyword}] 出错: {e}")
            print(f"[FAIL] 前程无忧 [{keyword}] 出错: {e}")
            import traceback
            traceback.print_exc()
        finally:
            context.close()

    logger.info(f"【无地域限制全量采集】前程无忧完成：遍历城市数={len(JOB51_CITIES)}, 总页数={total_pages}, 原始未去重条数={total_raw}")
    crawler_utils.log_crawl_detail("前程无忧", "全部城市", keyword, total_pages, total_raw, total_raw, total_raw)
    return all_city_jobs


# ================== 单站点重试封装 ==================
def crawl_with_retry(crawl_func, site_name, *args, max_retry=MAX_RETRY):
    """单站点最多3次重试防卡死"""
    last_jobs = []
    for attempt in range(1, max_retry + 1):
        logger.info(f"[{site_name}] 第 {attempt}/{max_retry} 次尝试采集...")
        print(f"[RETRY] [{site_name}] 第 {attempt}/{max_retry} 次尝试...")
        try:
            jobs = crawl_func(*args)
            if jobs:
                logger.info(f"[{site_name}] 第 {attempt} 次采集成功，获取 {len(jobs)} 条")
                return jobs
            else:
                logger.warning(f"[{site_name}] 第 {attempt} 次采集返回0条")
                last_jobs = jobs
        except Exception as e:
            logger.error(f"[{site_name}] 第 {attempt} 次采集出错: {e}")
            print(f"[FAIL] [{site_name}] 第 {attempt} 次采集出错: {e}")
        if attempt < max_retry:
            crawler_utils.random_delay(5.0, 10.0)
    logger.warning(f"[{site_name}] {max_retry}次重试后仍无数据")
    return last_jobs


# ================== 主运行函数 ==================
def run_crawler():
    """主流程：采集 → 后置过滤 → 去重 → 历史快照 → 覆盖主文件"""
    all_jobs = []
    date_str = datetime.now().strftime('%Y%m%d')
    per_site_stats = {}

    try:
        init_db()
        print("\n" + "=" * 60)
        print("【无地域限制全量采集】开始 - " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        print("关键词固定：计算机")
        print("=" * 60)

        # 智联招聘（无地域限制）
        zhaopin_jobs = crawl_with_retry(crawl_zhaopin, "智联", "计算机")
        all_jobs.extend(zhaopin_jobs)
        per_site_stats["智联"] = {"total_pages": 0, "raw_count": len(zhaopin_jobs)}
        logger.info(f"智联 爬取完成，获取 {len(zhaopin_jobs)} 条")
        print(f"[OK] 智联 爬取完成，获取 {len(zhaopin_jobs)} 条")

        # 猎聘网（URL分页，无地域限制）
        liepin_jobs = crawl_with_retry(crawl_liepin, "猎聘", "计算机")
        all_jobs.extend(liepin_jobs)
        per_site_stats["猎聘"] = {"total_pages": 0, "raw_count": len(liepin_jobs)}
        logger.info(f"猎聘 爬取完成，获取 {len(liepin_jobs)} 条")
        print(f"[OK] 猎聘 爬取完成，获取 {len(liepin_jobs)} 条")

        # 前程无忧（遍历全部城市）
        job51_jobs = crawl_with_retry(crawl_51job, "前程无忧", "计算机")
        all_jobs.extend(job51_jobs)
        per_site_stats["前程无忧"] = {"total_pages": 0, "raw_count": len(job51_jobs)}
        logger.info(f"前程无忧 爬取完成，获取 {len(job51_jobs)} 条")
        print(f"[OK] 前程无忧 爬取完成，获取 {len(job51_jobs)} 条")

        logger.info(f"【无地域限制全量采集】全部站点采集完成，原始汇总: {len(all_jobs)} 条")
        print(f"\n[COLLECT] 全部站点采集完成，原始汇总: {len(all_jobs)} 条")

        # 后置处理：过滤非IT岗位 → 去重 → 历史快照 → 覆盖主文件 → CSV
        snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
            all_jobs, base_dir=PROJECT_ROOT, save_csv=True, date_str=date_str
        )

        # 数据库归档
        save_to_db(final_jobs, date_str)

        # 全局汇总日志
        crawler_utils.log_global_summary(final_jobs, snapshot_path, per_site_stats)

        print(f"\n[DONE] 【无地域限制全量采集】完成 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"[STATS] 本次共获取 {len(final_jobs)} 条岗位数据（去重+过滤后）")
        print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
        print(f"[MAIN] 主文件已覆盖：{main_path}")

    except Exception as e:
        logger.error(f"主运行出错: {e}")
        print(f"[FAIL] 主运行出错: {e}")
        import traceback
        traceback.print_exc()


# ================== 定时调度器 ==================
def scheduler_thread():
    while True:
        schedule.run_pending()
        time.sleep(1)


def main():
    logger.info("=" * 50)
    logger.info("【无地域限制全量采集】IT岗位爬虫系统启动（Playwright旧版·仅供手动调试）")
    logger.info(f"关键词固定：计算机")
    logger.info(f"定时任务配置: {DAILY_CRAWL_TIMES}（凌晨2点）")
    logger.info(f"运行模式: {'定时模式' if ENABLE_SCHEDULER else '单次执行模式'}")
    logger.info(f"浏览器模式: {'无界面(后台)' if HEADLESS else '有界面(可观察)'}")
    logger.info("=" * 50)

    # ⚠️【Lenovo每日爬虫·进程内调度整套代码已禁用，禁止重复启动爬虫采集】
    # 唯一正式定时任务已收口至：每日凌晨 02:00 执行 spider/run_all.py（start_crawler.bat 调起）。
    # 下方 schedule 库调度逻辑全部注释，避免与 Windows 任务计划程序重复调度、并行写入主数据文件。
    if ENABLE_SCHEDULER:
        # ---------- 以下整段调度代码已废弃，保留仅为说明，不会执行 ----------
        # 启动时立即执行一次
        # logger.info("首次启动，立即执行一次爬取...")
        # print("\n[INIT] 首次启动执行爬取...")
        # run_crawler()
        #
        # # 设置每日凌晨2点定时任务
        # for t in DAILY_CRAWL_TIMES:
        #     schedule.every().day.at(t).do(run_crawler)
        #     logger.info(f"已设置每日 {t} 自动爬取（凌晨2点）")
        #     print(f"[OK] 已设置每日 {t} 自动爬取（凌晨2点）")
        #
        # logger.info("定时任务调度器已启动，等待下次执行时间...")
        # print("\n" + "=" * 50)
        # print("[WAIT] 定时任务调度器已启动")
        # print(f"[NEXT] 下次执行时间: {', '.join(DAILY_CRAWL_TIMES)}")
        # print("[INFO] 按 Ctrl+C 停止")
        # print("=" * 50 + "\n")
        #
        # t = threading.Thread(target=scheduler_thread, daemon=True)
        # t.start()
        # t.join()
        logger.warning("ENABLE_SCHEDULER 已被禁用，进程内调度不允许执行。如需定时采集请使用 spider/run_all.py。")
        print("[BLOCK] 进程内定时调度已禁用，禁止重复启动爬虫采集。正式定时任务请走 spider/run_all.py。")
        return

    # 单次执行模式（仅供手动调试，不被任何定时任务调用）
    logger.info("单次执行模式（手动调试），开始爬取...")
    run_crawler()
    logger.info("任务完成，程序退出")


if __name__ == "__main__":
    main()
