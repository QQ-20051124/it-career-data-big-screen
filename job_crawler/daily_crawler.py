"""
全国 IT 岗位每日爬虫（智联、猎聘、前程无忧）—— 有界面全自动版
- 智联：持久化上下文，固定全国URL，自动检测登录（首次需手动登录一次）
- 猎聘、前程无忧：全自动 XHR 抓取
- 所有数据合并到一个 CSV，数据库自动去重
- 支持每日定时自动运行
- 显示浏览器窗口，方便观察进度
"""
import csv
import json
import sqlite3
import time
import logging
import schedule
import threading
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

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
ZHAOPIN_USERDATA_DIR = BASE_DIR / "zhaopin_userdata"   # 智联持久化登录目录
LIEPIN_USERDATA_DIR = BASE_DIR / "liepin_userdata"    # 猎聘持久化登录目录
JOB51_USERDATA_DIR = BASE_DIR / "job51_userdata"      # 前程无忧持久化登录目录
DB_PATH = BASE_DIR / "jobs.db"

# 创建所有用户数据目录
ZHAOPIN_USERDATA_DIR.mkdir(parents=True, exist_ok=True)
LIEPIN_USERDATA_DIR.mkdir(parents=True, exist_ok=True)
JOB51_USERDATA_DIR.mkdir(parents=True, exist_ok=True)

# 猎聘、前程无忧的关键词（可改）
KEYWORDS = ["计算机"]

# False=显示浏览器（可观察过程），True=无界面静默运行
HEADLESS = False

# 登录超时（秒），超时跳过该网站，不阻塞后续
LOGIN_TIMEOUT = 120

# ================== 登录模式配置 ==================
# FORCE_RELOGIN = True: 每次运行都清除登录状态，强制重新登录
# FORCE_RELOGIN = False: 优先使用已保存的登录状态，未登录或状态失效时才等待登录
FORCE_RELOGIN = False

# ================== 定时任务配置 ==================
# 每日定时爬取时间（24小时制），多个时间用逗号分隔
DAILY_CRAWL_TIMES = ["08:00", "20:00"]

# 是否启用定时任务（True=启用定时，False=立即执行一次后退出）
ENABLE_SCHEDULER = False

# ================== 数据库初始化 ==================
def init_db():
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

# ================== 保存函数 ==================
def save_all_data(all_jobs, date_str):
    if not all_jobs:
        logger.warning("没有获取到任何数据")
        print("[WARN] 没有获取到任何数据")
        return

    logger.info(f"开始保存数据，共 {len(all_jobs)} 条")
    fieldnames = ["数据来源", "关键词", "岗位名称", "薪资", "城市", "经验要求", "学历要求", "公司名称"]
    csv_path = BASE_DIR / f"全国IT岗位_{date_str}.csv"
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_jobs)
    logger.info(f"CSV 已保存：{csv_path.name}")
    print(f"[OK] CSV 已保存：{csv_path.name} （共 {len(all_jobs)} 条）")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    insert_count = 0
    for job in all_jobs:
        unique = f"{job['数据来源']}_{job['关键词']}_{job['公司名称']}_{job['岗位名称']}_{job['城市']}_{date_str}"
        extra = json.dumps({}, ensure_ascii=False)
        try:
            c.execute(
                "INSERT INTO jobs (site, keyword, crawl_date, job_title, salary, city, experience, education, company, extra, unique_key) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (job['数据来源'], job['关键词'], date_str,
                 job['岗位名称'], job['薪资'], job['城市'],
                 job['经验要求'], job['学历要求'], job['公司名称'],
                 extra, unique)
            )
            insert_count += 1
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()
    logger.info(f"数据库新增 {insert_count} 条（重复已跳过）")
    print(f"[OK] 数据库新增 {insert_count} 条（重复已跳过）")

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
        logger.warning(f"登录超时（{timeout}秒），跳过智联")
        print(f"[FAIL] 登录超时（{timeout}秒），跳过智联")
        return False

    current_url = page.url
    if "login" not in current_url.lower() and ("www.zhaopin.com" in current_url or "sou.zhaopin.com" in current_url):
        logger.info("智联已处于登录状态")
        print("[OK] 智联已处于登录状态")
        return True

    logger.info(f"检测到需要登录，等待自动登录或手动登录（最多 {timeout} 秒）...")
    print(f"[LOGIN] 检测到需要登录，等待自动登录或手动登录（最多 {timeout} 秒）...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        current_url = page.url
        if "login" not in current_url.lower() and ("www.zhaopin.com" in current_url or "sou.zhaopin.com" in current_url):
            logger.info("登录成功")
            print("[OK] 登录成功！")
            return True
        time.sleep(3)

    logger.warning(f"登录超时（{timeout}秒），跳过智联")
    print(f"[FAIL] 登录超时（{timeout}秒），跳过智联")
    return False

# ================== 爬虫1：智联招聘（全自动） ==================
def crawl_zhaopin(keyword="计算机"):
    jobs = []
    logger.info(f"开始爬取智联招聘，关键词：{keyword}")
    print(f"\n{'='*20} 智联招聘 —— {keyword} {'='*20}")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(ZHAOPIN_USERDATA_DIR),
            headless=HEADLESS,
            slow_mo=100,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        try:
            try:
                page.goto("https://www.zhaopin.com/", wait_until="domcontentloaded", timeout=60000)
            except:
                logger.warning("智联首页加载超时，尝试直接跳转到搜索页")

            if not wait_for_zhaopin_login(page):
                return jobs

            try:
                search_url = f"https://sou.zhaopin.com/?jl=489&kw={quote(keyword)}&p=1"
                logger.info(f"跳转到搜索页面: {search_url}")
                print(f"[SEARCH] 跳转到全国搜索页面")
                page.goto(search_url, wait_until="domcontentloaded", timeout=120000)
                time.sleep(5)
            except Exception as e:
                logger.error(f"跳转到搜索页面失败: {e}")
                print(f"[FAIL] 跳转到搜索页面失败")
                return jobs

            selectors_to_try = [
                ".joblist-box__item",
                ".joblist-item",
                ".iteminfo",
                "[class*='joblist'] [class*='item']"
            ]
            job_items_found = False
            used_selector = None
            for selector in selectors_to_try:
                try:
                    if page.locator(selector).count() > 0:
                        logger.info(f"找到岗位列表，使用选择器: {selector}")
                        print(f"[OK] 找到岗位列表")
                        job_items_found = True
                        used_selector = selector
                        break
                except:
                    continue

            if not job_items_found:
                logger.warning("未找到任何岗位列表，尝试刷新...")
                print("[WARN] 未找到岗位列表，尝试刷新")
                page.reload(wait_until="domcontentloaded")
                time.sleep(5)
                for selector in selectors_to_try:
                    try:
                        if page.locator(selector).count() > 0:
                            logger.info(f"刷新后找到岗位列表，使用选择器: {selector}")
                            print(f"[OK] 刷新后找到岗位列表")
                            job_items_found = True
                            used_selector = selector
                            break
                    except:
                        continue

            if not job_items_found:
                logger.error("刷新后仍未找到岗位列表")
                print("[FAIL] 刷新后仍未找到岗位列表")
                return jobs

            for _ in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(2000)

            page_num = 1
            while True:
                logger.info(f"正在爬取智联第 {page_num} 页...")
                print(f"\n[PAGE] 正在爬取智联第 {page_num} 页...")
                last_count = 0
                for _ in range(5):
                    now = page.locator(used_selector).count()
                    if now == last_count:
                        break
                    last_count = now
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(2000)
                logger.info(f"第 {page_num} 页加载完成，共 {last_count} 条")
                print(f"[OK] 第 {page_num} 页加载完成，共 {last_count} 条")

                if last_count == 0:
                    logger.warning("没有岗位数据，可能已到末尾")
                    print("[WARN] 没有岗位数据，可能已到末尾")
                    break

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
                            if "-" in text and "K" in text.upper() or "万" in text or "元" in text:
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
                    if not company_name:
                        for tag in card.find_all(["a", "span", "div"]):
                            text = tag.get_text(strip=True)
                            if "公司" in text or "集团" in text or len(text) > 2 and len(text) < 30 and "经验" not in text and "学历" not in text and "不限" not in text:
                                if not company_name or (text != job_name and text != salary):
                                    company_name = text

                    if job_name:
                        jobs.append({
                            "数据来源": "智联",
                            "关键词": keyword,
                            "岗位名称": job_name,
                            "薪资": salary,
                            "城市": city,
                            "经验要求": work_year,
                            "学历要求": education,
                            "公司名称": company_name
                        })

                logger.info(f"第 {page_num} 页已保存 → 累计：{len(jobs)} 条")
                print(f"[OK] 第 {page_num} 页已保存 → 累计：{len(jobs)} 条")

                next_btn = page.locator("a:has-text('下一页')").first
                try:
                    if not next_btn.is_visible(timeout=3000):
                        logger.info("没有下一页，智联结束")
                        print("\n[END] 没有下一页，智联结束")
                        break
                    if next_btn.get_attribute("disabled") is not None:
                        logger.info("已到最后一页，智联结束")
                        print("\n[END] 已到最后一页，智联结束")
                        break
                    next_btn.click()
                    page.wait_for_timeout(4000)
                    page_num += 1
                except:
                    logger.info("无法点击下一页，智联结束")
                    print("\n[END] 无法点击下一页，智联结束")
                    break

        except Exception as e:
            logger.error(f"智联爬取出错: {e}")
            print(f"[FAIL] 智联爬取出错: {e}")
        finally:
            context.close()
    logger.info(f"智联招聘爬取完成，共获取 {len(jobs)} 条数据")
    return jobs

# ================== 猎聘登录检测 ==================
def wait_for_liepin_login(dp, timeout=LOGIN_TIMEOUT):
    global FORCE_RELOGIN
    try:
        logger.info(f"当前URL: {dp.url}")
        print(f"[INFO] 当前URL: {dp.url}")

        if FORCE_RELOGIN:
            logger.info("FORCE_RELOGIN=True，强制清除猎聘登录状态，等待手动登录...")
            print(f"[LOGIN] FORCE_RELOGIN=True，强制清除登录状态，等待手动登录（最多 {timeout} 秒）...")
            try:
                dp.cookies().clear()
            except:
                pass
            dp.get("https://www.liepin.com/login/")
            start_time = time.time()
            while time.time() - start_time < timeout:
                try:
                    current_url = dp.url
                    if "login" not in current_url.lower():
                        logger.info("登录成功（已离开登录页）")
                        print("[OK] 登录成功！")
                        return True
                except:
                    pass
                time.sleep(3)
            logger.warning(f"登录超时（{timeout}秒），跳过猎聘")
            print(f"[FAIL] 登录超时（{timeout}秒），跳过猎聘")
            return False

        # 简化逻辑：URL不包含login就认为已登录
        if "login" not in dp.url.lower():
            logger.info("猎聘已处于登录状态")
            print("[OK] 猎聘已处于登录状态")
            return True

        # 需要登录
        logger.info(f"检测到需要登录猎聘，等待手动登录（最多 {timeout} 秒）...")
        print(f"[LOGIN] 检测到需要登录，等待手动登录（最多 {timeout} 秒）...")
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                if "login" not in dp.url.lower():
                    logger.info("登录成功")
                    print("[OK] 猎聘登录成功！")
                    return True
            except:
                pass
            time.sleep(3)

        logger.warning(f"猎聘登录超时（{timeout}秒），跳过猎聘")
        print(f"[FAIL] 猎聘登录超时（{timeout}秒），跳过猎聘")
        return False
    except Exception as e:
        logger.error(f"猎聘登录检测出错: {e}")
        return False

# ================== 爬虫2：猎聘网 ==================
def crawl_liepin(keyword):
    jobs = []
    url = f"https://www.liepin.com/zhaopin/?key={quote(keyword)}"
    logger.info(f"开始爬取猎聘网，关键词：{keyword}")
    print(f"\n{'='*20} 猎聘网 —— {keyword} {'='*20}")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(LIEPIN_USERDATA_DIR),
            headless=HEADLESS,
            slow_mo=100,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        try:
            page.goto("https://www.liepin.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(2)

            current_url = page.url
            logger.info(f"当前URL: {current_url}")
            print(f"[INFO] 当前URL: {current_url}")

            if FORCE_RELOGIN:
                logger.info("FORCE_RELOGIN=True，强制清除登录状态，等待手动登录...")
                print(f"[LOGIN] FORCE_RELOGIN=True，强制清除登录状态，等待手动登录（最多 {LOGIN_TIMEOUT}秒）...")
                try:
                    context.clear_cookies()
                    page.goto("https://www.liepin.com/login/", wait_until="domcontentloaded", timeout=30000)
                except:
                    pass
                start_time = time.time()
                while time.time() - start_time < LOGIN_TIMEOUT:
                    current_url = page.url
                    if "login" not in current_url.lower():
                        logger.info("登录成功（已离开登录页）")
                        print("[OK] 登录成功！")
                        break
                    time.sleep(3)
                else:
                    logger.warning(f"登录超时（{LOGIN_TIMEOUT}秒），跳过猎聘")
                    print(f"[FAIL] 登录超时（{LOGIN_TIMEOUT}秒），跳过猎聘")
                    return jobs

            if "login" not in current_url.lower():
                logger.info("猎聘已处于登录状态")
                print("[OK] 猎聘已处于登录状态")
            else:
                logger.info(f"检测到需要登录，等待手动登录（最多 {LOGIN_TIMEOUT}秒）...")
                print(f"[LOGIN] 检测到需要登录，等待手动登录（最多 {LOGIN_TIMEOUT}秒）...")
                start_time = time.time()
                while time.time() - start_time < LOGIN_TIMEOUT:
                    current_url = page.url
                    if "login" not in current_url.lower():
                        logger.info("登录成功（已离开登录页）")
                        print("[OK] 登录成功！")
                        break
                    time.sleep(3)
                else:
                    logger.warning(f"登录超时（{LOGIN_TIMEOUT}秒），跳过猎聘")
                    print(f"[FAIL] 登录超时（{LOGIN_TIMEOUT}秒），跳过猎聘")
                    return jobs

            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)

            try:
                close_btn = page.locator('.login-close, .lp-login-close, [class*="close"]').first
                if close_btn.is_visible(timeout=3000):
                    close_btn.click()
                    time.sleep(1)
            except:
                pass

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

            for page_num in range(1, 11):
                logger.info(f"猎聘 {keyword} 第 {page_num} 页...")
                print(f"[PAGE] 猎聘 {keyword} 第 {page_num} 页...")

                api_data.clear()
                wait_start = time.time()
                while not api_data and time.time() - wait_start < 30:
                    page.wait_for_timeout(500)

                if api_data:
                    json_data = api_data[0]
                    items = json_data['data']['data']['jobCardList']
                    for card in items:
                        job_info = card.get("job", {})
                        comp_info = card.get("comp", {})
                        jobs.append({
                            "数据来源": "猎聘",
                            "关键词": keyword,
                            "岗位名称": job_info.get('title', ''),
                            "薪资": job_info.get('salary', ''),
                            "城市": job_info.get('dq', ''),
                            "经验要求": job_info.get('requireWorkYears', ''),
                            "学历要求": job_info.get('requireEduLevel', ''),
                            "公司名称": comp_info.get('compName', ''),
                        })

                if page_num < 10:
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(2)
                    next_btn = page.locator('.ant-pagination-next').first
                    try:
                        if next_btn.is_visible(timeout=10000):
                            next_btn.click()
                            time.sleep(3)
                        else:
                            logger.info("没有下一页，猎聘结束")
                            print("[END] 没有下一页，猎聘结束")
                            break
                    except:
                        logger.info("没有下一页，猎聘结束")
                        print("[END] 没有下一页，猎聘结束")
                        break

        except Exception as e:
            logger.error(f"猎聘 [{keyword}] 出错: {e}")
            print(f"[FAIL] 猎聘 [{keyword}] 出错: {e}")
            import traceback
            traceback.print_exc()
        finally:
            context.close()
    logger.info(f"猎聘网 [{keyword}] 爬取完成，共获取 {len(jobs)} 条数据")
    return jobs

# ================== 爬虫3：前程无忧 ==================
def crawl_51job(keyword):
    jobs = []
    logger.info(f"开始爬取前程无忧，关键词：{keyword}")
    print(f"\n{'='*20} 前程无忧 —— {keyword} {'='*20}")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(JOB51_USERDATA_DIR),
            headless=HEADLESS,
            slow_mo=100,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        try:
            # 先打开登录页面检查登录状态
            page.goto("https://www.51job.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            
            # 登录检测
            is_logged_in = False
            
            # 检查是否需要登录
            try:
                # 检查是否有用户相关元素
                user_elements = page.locator('.user-name, .avatar, .nickname, a:has-text("我的"), .my-account')
                if user_elements.count() > 0:
                    is_logged_in = True
                # 检查是否有登录按钮
                login_btn = page.locator('button:has-text("登录"), a:has-text("登录"), .login-btn')
                if login_btn.count() > 0 and login_btn.first.is_visible():
                    is_logged_in = False
            except:
                pass
            
            if not is_logged_in:
                logger.info(f"检测到前程无忧未登录，等待手动登录（最多 {LOGIN_TIMEOUT} 秒）...")
                print(f"[LOGIN] 检测到前程无忧未登录，请手动登录（最多 {LOGIN_TIMEOUT} 秒）...")
                start_time = time.time()
                while time.time() - start_time < LOGIN_TIMEOUT:
                    try:
                        user_elements = page.locator('.user-name, .avatar, .nickname, a:has-text("我的"), .my-account')
                        if user_elements.count() > 0:
                            logger.info("前程无忧登录成功")
                            print("[OK] 前程无忧登录成功！")
                            is_logged_in = True
                            break
                    except:
                        pass
                    time.sleep(3)
                if not is_logged_in:
                    logger.warning("前程无忧登录超时，跳过")
                    print(f"[FAIL] 前程无忧登录超时（{LOGIN_TIMEOUT}秒），跳过")
                    return jobs
            else:
                logger.info("前程无忧已处于登录状态")
                print("[OK] 前程无忧已处于登录状态")

            # 使用页面解析方式获取数据
            logger.info("开始页面解析获取前程无忧数据...")
            print("[INFO] 开始页面解析获取前程无忧数据...")
            
            # 打开搜索页面（强制全国地区）
            url = f"https://we.51job.com/pc/search?jobArea=000000&keyword={quote(keyword)}&searchType=2"
            page.goto(url, wait_until="networkidle", timeout=60000)
            time.sleep(5)
            
            # 检查当前地区是否为全国
            current_area = ""
            try:
                area_selector = page.locator('span:has-text("地区"), .area-btn, .location-btn, .search-area')
                if area_selector.count() > 0:
                    current_area = area_selector.first.text_content() or ""
                    logger.info(f"当前选择的地区: {current_area}")
                    print(f"[INFO] 当前选择的地区: {current_area}")
            except:
                pass
            
            # 如果当前地区不是全国，尝试自动选择全国
            if "全国" not in current_area:
                logger.warning("检测到当前地区不是全国，尝试自动选择全国地区")
                print(f"[WARN] 检测到当前地区不是全国（当前: {current_area}）")
                print("[INFO] 正在尝试自动选择全国地区...")
                
                try:
                    # 找到地区选择按钮并点击
                    area_btn = page.locator('span:has-text("地区"), .area-btn, .location-btn, .search-area')
                    if area_btn.count() > 0:
                        area_btn.first.click()
                        time.sleep(3)
                        
                        # 尝试找到全国选项并点击
                        nationwide_options = page.locator('text=全国, .area-option:has-text("全国"), .region-item:has-text("全国")')
                        if nationwide_options.count() > 0:
                            nationwide_options.first.click()
                            time.sleep(3)
                            logger.info("成功自动选择全国地区")
                            print("[OK] 成功自动选择全国地区")
                            
                            # 重新加载页面确保生效
                            page.goto(url, wait_until="networkidle", timeout=60000)
                            time.sleep(5)
                        else:
                            # 如果找不到全国选项，提示用户手动选择
                            logger.warning("未能自动找到全国选项，请手动选择")
                            print("[WARN] 未能自动找到全国选项，请手动选择")
                            print("[INFO] 请在浏览器中点击地区选择框，选择'全国'后按回车继续...")
                            input("请手动选择全国地区后按回车继续...")
                            
                            # 重新加载页面
                            page.goto(url, wait_until="networkidle", timeout=60000)
                            time.sleep(5)
                    else:
                        logger.warning("未能找到地区选择按钮")
                        print("[WARN] 未能找到地区选择按钮")
                except Exception as e:
                    logger.error(f"自动选择地区失败: {e}")
                    print(f"[FAIL] 自动选择地区失败: {e}")
                    print("[INFO] 请手动选择全国地区后按回车继续...")
                    input("请手动选择全国地区后按回车继续...")
                    
                    # 重新加载页面
                    page.goto(url, wait_until="networkidle", timeout=60000)
                    time.sleep(5)
            
            # 多次滚动加载更多数据
            max_scrolls = 15
            for i in range(max_scrolls):
                # 滚动到底部
                page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                time.sleep(4)
                
                # 尝试点击"加载更多"按钮
                try:
                    load_more_btn = page.locator('button:has-text("加载更多"), .load-more, .next-page, .btn-more')
                    if load_more_btn.count() > 0 and load_more_btn.first.is_visible():
                        load_more_btn.first.click()
                        time.sleep(3)
                        logger.info(f"第 {i+1} 次点击加载更多")
                        print(f"[INFO] 第 {i+1} 次点击加载更多")
                except Exception as e:
                    pass
            
            # 解析页面数据
            job_cards = page.locator('.job-item, .joblist-item, .el-card')
            card_count = job_cards.count()
            
            if card_count > 0:
                logger.info(f"从页面获取到 {card_count} 条数据")
                print(f"[OK] 从页面获取到 {card_count} 条数据")
                
                for i in range(min(card_count, 100)):  # 最多取100条
                    try:
                        card = job_cards.nth(i)
                        
                        # 提取岗位名称
                        job_name = ''
                        name_selectors = ['.job-name', '.jname', 'h3', '.job-title']
                        for selector in name_selectors:
                            try:
                                job_name = card.locator(selector).first.text_content() or ''
                                if job_name.strip():
                                    break
                            except:
                                continue
                        
                        # 提取薪资
                        salary = ''
                        salary_selectors = ['.salary', '.sal', '.job-salary']
                        for selector in salary_selectors:
                            try:
                                salary = card.locator(selector).first.text_content() or ''
                                if salary.strip():
                                    break
                            except:
                                continue
                        
                        # 提取城市
                        city = ''
                        city_selectors = ['.location', '.workarea', '.job-location', '.area']
                        for selector in city_selectors:
                            try:
                                city = card.locator(selector).first.text_content() or ''
                                if city.strip():
                                    break
                            except:
                                continue
                        
                        # 提取公司名称
                        company = ''
                        company_selectors = ['.company', '.cname', '.job-company', '.company-name']
                        for selector in company_selectors:
                            try:
                                company = card.locator(selector).first.text_content() or ''
                                if company.strip():
                                    break
                            except:
                                continue
                        
                        # 提取经验要求
                        exp_req = ''
                        exp_selectors = ['.experience', '.exp', '.job-experience', '.require']
                        for selector in exp_selectors:
                            try:
                                exp_req = card.locator(selector).first.text_content() or ''
                                if exp_req.strip():
                                    break
                            except:
                                continue
                        
                        # 提取学历要求
                        edu_req = ''
                        edu_selectors = ['.education', '.edu', '.job-education', '.degree']
                        for selector in edu_selectors:
                            try:
                                edu_req = card.locator(selector).first.text_content() or ''
                                if edu_req.strip():
                                    break
                            except:
                                continue
                        
                        if job_name.strip():
                            jobs.append({
                                "数据来源": "前程无忧",
                                "关键词": keyword,
                                "岗位名称": job_name.strip(),
                                "薪资": salary.strip(),
                                "城市": city.strip(),
                                "经验要求": exp_req.strip(),
                                "学历要求": edu_req.strip(),
                                "公司名称": company.strip(),
                            })
                    except Exception as e:
                        continue
            else:
                logger.warning("未找到任何岗位卡片")
                print("[WARN] 未找到任何岗位卡片")
            
            # 去重
            unique_jobs = []
            seen = set()
            for job in jobs:
                key = (job['岗位名称'], job['公司名称'], job['城市'])
                if key not in seen:
                    seen.add(key)
                    unique_jobs.append(job)
            
            jobs = unique_jobs
            logger.info(f"去重后剩余 {len(jobs)} 条数据")
            print(f"[OK] 去重后剩余 {len(jobs)} 条数据")

        except Exception as e:
            logger.error(f"前程无忧 [{keyword}] 出错: {e}")
            print(f"[FAIL] 前程无忧 [{keyword}] 出错: {e}")
            import traceback
            traceback.print_exc()
        finally:
            context.close()
    
    logger.info(f"前程无忧 [{keyword}] 爬取完成，共获取 {len(jobs)} 条数据")
    return jobs

# ================== 主运行函数 ==================
def run_crawler():
    all_jobs = []
    date_str = datetime.now().strftime('%Y%m%d')

    try:
        init_db()

        logger.info("开始爬取智联招聘")
        zhaopin_jobs = crawl_zhaopin("计算机")
        all_jobs.extend(zhaopin_jobs)
        logger.info(f"智联 爬取完成，获取 {len(zhaopin_jobs)} 条")
        print(f"[OK] 智联 爬取完成，获取 {len(zhaopin_jobs)} 条")

        for kw in KEYWORDS:
            logger.info(f"自动爬取关键词：{kw}")
            liepin_jobs = crawl_liepin(kw)
            all_jobs.extend(liepin_jobs)
            logger.info(f"猎聘 [{kw}] 爬取完成，获取 {len(liepin_jobs)} 条")
            print(f"[OK] 猎聘 [{kw}] 爬取完成，获取 {len(liepin_jobs)} 条")

            job51_jobs = crawl_51job(kw)
            all_jobs.extend(job51_jobs)
            logger.info(f"前程无忧 [{kw}] 爬取完成，获取 {len(job51_jobs)} 条")
            print(f"[OK] 前程无忧 [{kw}] 爬取完成，获取 {len(job51_jobs)} 条")

        save_all_data(all_jobs, date_str)
        print(f"\n[DONE] 所有任务完成 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"[STATS] 本次共获取 {len(all_jobs)} 条全国IT岗位数据")

    except Exception as e:
        logger.error(f"主运行出错: {e}")
        print(f"[FAIL] 主运行出错: {e}")

# ================== 定时调度器 ==================
def scheduler_thread():
    while True:
        schedule.run_pending()
        time.sleep(1)

def main():
    run_crawler()
    if ENABLE_SCHEDULER:
        for t in DAILY_CRAWL_TIMES:
            schedule.every().day.at(t).do(run_crawler)
            logger.info(f"已设置每日 {t} 自动爬取")
        logger.info("定时任务调度器已启动")
        print("\n[WAIT] 定时任务已启动，等待下次执行时间...")
        t = threading.Thread(target=scheduler_thread, daemon=True)
        t.start()
        t.join()

if __name__ == "__main__":
    main()
