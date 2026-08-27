# -*- coding: utf-8 -*-
"""
IT岗位爬虫 - 统一入口（DrissionPage版·登录态）
一键自动爬取：智联 + 猎聘 + 前程无忧（全城市）

【核心特性】
- 登录态采集：使用用户Chrome profile，携带已登录的cookies/session，采集更多数据
- 前程无忧：自动发现所有城市，逐个城市采集，不硬编码城市列表
- 翻页规则：自动持续翻页遍历，有多少有效分页就爬多少页，直到无下一页
- 终止条件：无下一页按钮 / 连续3页无数据（不设页数上限）
- 每站点最多3次重试
- 爬取状态实时写入 crawler_status.json，供前端界面展示

【前置条件】
- 爬取前请关闭Chrome浏览器（profile被锁定无法写入）
- 已运行 crawler_login_manager.py 完成三网站登录（首次运行需要）

【运行方式】
    .venv312\\Scripts\\python.exe spider\\run_all.py
"""
import sys
import os
import subprocess
import time
import uuid
import datetime
import json
import traceback
from pathlib import Path

# 进程锁（filelock）：防止多实例并行爬取、重复写入主数据文件
try:
    from filelock import FileLock, Timeout
    _FILELOCK_AVAILABLE = True
except ImportError:
    _FILELOCK_AVAILABLE = False

# 导入共享工具模块
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(PROJECT_ROOT))
import crawler_utils

# 爬虫状态管理模块（同目录）
STATUS_FILE = PROJECT_ROOT / "crawler_status.json"

# 导入各站点爬虫（登录态版）
from spider import 前程无忧 as job51_module
from spider import 猎聘 as liepin_module
from spider import 智联 as zhaopin_module

# ================== 配置区 ==================
KEYWORD = "计算机"
MAX_RETRY = 3  # 单站点最多重试次数

# ================== 进程锁配置 ==================
LOCK_FILE = PROJECT_ROOT / "logs" / "crawler.run.lock"

# ================== 测试模式配置 ==================
TEST_MODE = False  # True=小规模测试 / False=全量采集（正式采集需设为False）
TEST_ZHAOPIN_MAX_PAGES = 5      # 智联最多5页（测试模式）
TEST_LIEPIN_MAX_PAGES = 6      # 猎聘最多6页（测试模式）
TEST_51JOB_CITIES = [           # 前程无忧测试城市
    ("北京", "010000"),
    ("上海", "020000"),
    ("广州", "030200"),
    ("深圳", "040000"),
    ("杭州", "080200"),
]
PROD_51JOB_CITY_LIMIT = 10  # 正式模式下前程无忧最多爬10个城市（94个太多会断连）


def _kill_all_chrome():
    """彻底杀掉所有Chrome进程，释放profile锁"""
    try:
        if sys.platform == 'win32':
            subprocess.run(['taskkill', '/F', '/IM', 'chrome.exe'],
                           capture_output=True, timeout=10)
        else:
            subprocess.run(['pkill', '-9', 'chrome'],
                           capture_output=True, timeout=10)
        time.sleep(3)
        print("[CLEAN] 已清理所有Chrome进程，等待profile锁释放")
    except Exception as e:
        print(f"[WARN] 清理Chrome进程失败: {e}")


# ================== 爬取状态实时写入 ==================
def _init_status():
    """初始化状态文件"""
    status = {
        "task_id": f"crawl_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}",
        "start_time": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "end_time": None,
        "status": "running",  # running / completed / failed
        "progress": 0,  # 0-100
        "current_step": "初始化中...",
        "sites": {
            "智联": {"status": "pending", "raw_count": 0, "pages": 0, "message": "等待中"},
            "猎聘": {"status": "pending", "raw_count": 0, "pages": 0, "message": "等待中"},
            "前程无忧": {"status": "pending", "raw_count": 0, "pages": 0, "message": "等待中", "cities_total": 0, "cities_done": 0},
        },
        "total_raw_count": 0,
        "final_count": 0,
        "error": None,
    }
    _write_status(status)
    return status


def _write_status(status):
    """写入状态文件（原子写）"""
    try:
        STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
        tmp = STATUS_FILE.with_suffix('.tmp')
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(status, f, ensure_ascii=False, indent=2)
        tmp.replace(STATUS_FILE)
    except Exception as e:
        print(f"[WARN] 状态文件写入失败: {e}")


def update_site_status(status, site_name, **kwargs):
    """更新某站点状态并写入文件"""
    if site_name in status["sites"]:
        for k, v in kwargs.items():
            status["sites"][site_name][k] = v
    # 自动算进度：3个站点均分
    site_weight = 100 / 3
    progress = 0
    for s in status["sites"].values():
        if s["status"] == "completed":
            progress += site_weight
        elif s["status"] == "running":
            progress += site_weight * 0.4
    status["progress"] = round(min(progress, 99), 1)
    _write_status(status)


def update_global_status(status, **kwargs):
    """更新全局状态并写入文件"""
    for k, v in kwargs.items():
        status[k] = v
    _write_status(status)


# ================== 前程无忧城市进度Hook ==================
# monkey-patch 前程无忧的城市采集函数，注入进度回调
_original_crawl_all_cities = job51_module.crawl_51job_all_cities

def _patched_crawl_all_cities(dp, keyword=KEYWORD, test_cities=None, status_ref=None, city_limit=None):
    """带进度回调的前程无忧全城市采集"""
    all_jobs = []
    total_pages = 0
    total_raw = 0

    if test_cities:
        print(f"[TEST] 前程无忧 测试模式：只跑 {len(test_cities)} 个城市 → {[c[0] for c in test_cities]}")

    print(f"\n{'='*20} 前程无忧（登录态·全城市自动翻页·HTML解析）—— {keyword} {'='*20}")

    # 访问首页并动态提取城市列表
    print("[INIT] 前程无忧 访问首页，提取城市列表...")
    home_success = False
    for home_attempt in range(3):
        try:
            dp.get('https://we.51job.com/pc/search?keyword={}&searchType=2'.format(keyword), timeout=60)
            job51_module._wait_for_page_load(dp, job51_module.PAGE_LOAD_WAIT + 3)
            current_url = dp.url
            if 'login' in current_url.lower() or 'passport' in current_url.lower():
                print(f"[WARN] 登录态可能已失效，页面被重定向到: {current_url}")
            html = dp.html
            try:
                job51_module._log_risk_if_any(dp, html, "前程无忧", stage=f"全国首页-加载尝试{home_attempt+1}")
            except Exception:
                pass
            if len(html) < 10000:
                print(f"[WARN] 首页HTML内容过短（{len(html)}字节），可能加载不完整")
                time.sleep(3)
            home_success = True
            print(f"[INIT] 首页加载成功，URL: {current_url}")
            break
        except Exception as e:
            print(f"[RETRY] 首页加载尝试 {home_attempt + 1}/3 失败: {str(e)[:100]}")
            if home_attempt < 2:
                time.sleep(5)

    if not home_success:
        print("[WARN] 前程无忧首页加载失败，使用兜底城市列表")
        cities = job51_module._get_fallback_cities()
    else:
        cities = job51_module._extract_all_cities(dp)
        if not cities:
            print("[WARN] 未发现任何城市，使用兜底列表")
            cities = job51_module._get_fallback_cities()

    if test_cities:
        cities = test_cities
        print(f"[TEST] 前程无忧 城市列表已覆盖为测试城市: {[c[0] for c in cities]}")

    if city_limit and len(cities) > city_limit:
        cities = cities[:city_limit]
        print(f"[LIMIT] 前程无忧 城市数限制为 {city_limit}，仅采集前 {city_limit} 个城市")

    print(f"[INFO] 前程无忧将依次遍历 {len(cities)} 个城市")

    # 写入状态：总城市数
    if status_ref:
        status_ref[0]["sites"]["前程无忧"]["cities_total"] = len(cities)
        status_ref[0]["sites"]["前程无忧"]["cities_done"] = 0
        _write_status(status_ref[0])

    browser_alive = True
    try:
        for city_idx, (city_name, city_code) in enumerate(cities, 1):
            try:
                _ = dp.html
            except Exception:
                print(f"[ALERT] 浏览器连接断开，尝试重建浏览器...")
                _kill_all_chrome()
                try:
                    dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
                    print("[RECOVER] 浏览器重建成功，继续采集")
                except Exception as e:
                    print(f"[FAIL] 浏览器重建失败: {e}，停止采集")
                    browser_alive = False
                    break

            print(f"\n[CITY {city_idx}/{len(cities)}] 前程无忧 开始采集：{city_name}（code={city_code}）")

            city_jobs = []
            city_pages = 0
            city_raw = 0
            for attempt in range(1, MAX_RETRY + 1):
                try:
                    city_jobs, city_pages, city_raw = job51_module.crawl_one_city_html(
                        dp, keyword, city_name, city_code
                    )
                    if city_jobs or city_raw > 0:
                        break
                    else:
                        print(f"[WARN] 前程无忧 [{city_name}] 第 {attempt} 次采集返回0条")
                except Exception as e:
                    print(f"[FAIL] 前程无忧 [{city_name}] 第 {attempt} 次采集出错: {e}")
                    traceback.print_exc()
                if attempt < MAX_RETRY:
                    crawler_utils.random_delay(5.0, 10.0)

            all_jobs.extend(city_jobs)
            total_pages += city_pages
            total_raw += city_raw

            # 实时更新前程无忧状态
            if status_ref:
                status_ref[0]["sites"]["前程无忧"]["cities_done"] = city_idx
                status_ref[0]["sites"]["前程无忧"]["raw_count"] = total_raw
                status_ref[0]["sites"]["前程无忧"]["pages"] = total_pages
                status_ref[0]["sites"]["前程无忧"]["message"] = f"城市 {city_idx}/{len(cities)}: {city_name} 完成，{city_raw}条"
                site_weight = 100 / 3
                progress = 0
                for sit in status_ref[0]["sites"].values():
                    if sit["status"] == "completed":
                        progress += site_weight
                    elif sit["status"] == "running":
                        progress += site_weight * 0.4
                status_ref[0]["progress"] = round(min(progress, 99), 1)
                _write_status(status_ref[0])

            print(f"[CITY-DONE] 前程无忧 [{city_name}] 完成：页数={city_pages}, 原始条数={city_raw}")

            crawler_utils.random_delay(3.0, 7.0)
    except Exception as e:
        print(f"[FAIL] 城市遍历异常: {e}")
        traceback.print_exc()

    if not browser_alive:
        print("[ALERT] 浏览器连接曾断开，已提前终止采集")

    print(f"\n[SUMMARY] 前程无忧 全部城市采集完成：遍历城市数={len(cities)}, 总页数={total_pages}, 原始未去重条数={total_raw}")
    crawler_utils.log_crawl_detail("前程无忧", "全部城市", keyword, total_pages, total_raw, total_raw, total_raw)
    return all_jobs


def run_all_crawlers():
    """主流程：依次爬取智联 → 猎聘 → 前程无忧 → 合并处理"""
    start_time = datetime.datetime.now()
    date_str = start_time.strftime('%Y%m%d')
    per_site_stats = {}

    # 初始化爬取状态
    status = _init_status()
    # 使用 list 包装作为引用，供闭包修改
    status_ref = [status]

    mode_label = "【小规模测试】" if TEST_MODE else "【无地域限制全量采集】"
    print("\n" + "=" * 60)
    print(f"{mode_label}IT岗位爬虫启动 - " + start_time.strftime('%Y-%m-%d %H:%M:%S'))
    print(f"关键词固定：计算机")
    if TEST_MODE:
        print(f"测试约束：智联≤{TEST_ZHAOPIN_MAX_PAGES}页 | 猎聘≤{TEST_LIEPIN_MAX_PAGES}页 | 前程无忧仅{[c[0] for c in TEST_51JOB_CITIES]}")
    else:
        print("模式：登录态 + 全城市 + 自动翻页（无页数上限）")
    print("站点：智联招聘、猎聘网、前程无忧（全城市自动发现）")
    print("=" * 60)
    print("\n[重要提醒] 请确保本机所有Chrome浏览器窗口已完全关闭！")
    print("[重要提醒] 否则chrome_scraper_profile目录被锁定，登录会话无法读取！")

    all_jobs = []

    # ============== 站点1：智联招聘（登录态·全国自动翻页） ==============
    print("\n" + "-" * 40)
    print("站点1/3：智联招聘")
    print("-" * 40)
    status["current_step"] = "智联招聘 - 采集中"
    status["sites"]["智联"]["status"] = "running"
    status["sites"]["智联"]["message"] = "初始化浏览器..."
    _write_status(status)

    zhaopin_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] [智联] 第 {attempt}/{MAX_RETRY} 次尝试...")
        dp = None
        try:
            dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
            status["sites"]["智联"]["message"] = "检测登录状态..."
            _write_status(status)
            if not crawler_utils.check_site_login(dp, "智联"):
                status["sites"]["智联"]["message"] = "需要登录，请在浏览器完成后按回车"
                _write_status(status)
                crawler_utils.wait_for_login_confirmation("智联")
            status["sites"]["智联"]["message"] = "翻页采集中..."
            _write_status(status)

            def _zhaopin_progress(page_num, page_count, total_count):
                update_site_status(status_ref[0], "智联",
                    pages=page_num, raw_count=total_count,
                    message=f"第{page_num}页，累计{total_count}条")

            zhaopin_jobs = zhaopin_module.crawl_zhaopin(
                KEYWORD, dp=dp,
                max_pages=TEST_ZHAOPIN_MAX_PAGES if TEST_MODE else None,
                progress_callback=_zhaopin_progress
            )
            if zhaopin_jobs:
                print(f"[OK] [智联] 第 {attempt} 次采集成功，获取 {len(zhaopin_jobs)} 条")
                break
            else:
                print(f"[WARN] [智联] 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] [智联] 第 {attempt} 次采集出错: {e}")
            traceback.print_exc()
            status["sites"]["智联"]["error"] = str(e)[:200]
        finally:
            if dp:
                try:
                    dp.quit()
                except Exception:
                    pass
        if attempt < MAX_RETRY:
            crawler_utils.random_delay(5.0, 10.0)

    all_jobs.extend(zhaopin_jobs)
    per_site_stats["智联"] = {"raw_count": len(zhaopin_jobs)}
    print(f"[OK] 智联 爬取完成，获取 {len(zhaopin_jobs)} 条")
    status["sites"]["智联"]["status"] = "completed" if zhaopin_jobs else "failed"
    status["sites"]["智联"]["raw_count"] = len(zhaopin_jobs)
    status["sites"]["智联"]["message"] = f"采集完成，{len(zhaopin_jobs)}条" if zhaopin_jobs else "采集失败或返回0条"
    _write_status(status)

    crawler_utils.random_delay(3.0, 6.0)

    # ============== 站点2：猎聘网（登录态·全国URL分页） ==============
    print("\n" + "-" * 40)
    print("站点2/3：猎聘网")
    print("-" * 40)
    _kill_all_chrome()
    status["current_step"] = "猎聘网 - 采集中"
    status["sites"]["猎聘"]["status"] = "running"
    status["sites"]["猎聘"]["message"] = "初始化浏览器..."
    _write_status(status)

    liepin_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] [猎聘] 第 {attempt}/{MAX_RETRY} 次尝试...")
        dp = None
        try:
            dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
            status["sites"]["猎聘"]["message"] = "检测登录状态..."
            _write_status(status)
            if not crawler_utils.check_site_login(dp, "猎聘"):
                status["sites"]["猎聘"]["message"] = "需要登录，请在浏览器完成后按回车"
                _write_status(status)
                crawler_utils.wait_for_login_confirmation("猎聘")
            status["sites"]["猎聘"]["message"] = "翻页采集中..."
            _write_status(status)

            def _liepin_progress(page_num, page_count, total_count):
                update_site_status(status_ref[0], "猎聘",
                    pages=page_num, raw_count=total_count,
                    message=f"第{page_num}页，累计{total_count}条")

            liepin_jobs = liepin_module.crawl_liepin(
                KEYWORD, dp=dp,
                max_pages=TEST_LIEPIN_MAX_PAGES if TEST_MODE else None,
                progress_callback=_liepin_progress
            )
            if liepin_jobs:
                print(f"[OK] [猎聘] 第 {attempt} 次采集成功，获取 {len(liepin_jobs)} 条")
                break
            else:
                print(f"[WARN] [猎聘] 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] [猎聘] 第 {attempt} 次采集出错: {e}")
            traceback.print_exc()
            status["sites"]["猎聘"]["error"] = str(e)[:200]
        finally:
            if dp:
                try:
                    dp.quit()
                except Exception:
                    pass
        if attempt < MAX_RETRY:
            crawler_utils.random_delay(5.0, 10.0)

    all_jobs.extend(liepin_jobs)
    per_site_stats["猎聘"] = {"raw_count": len(liepin_jobs)}
    print(f"[OK] 猎聘 爬取完成，获取 {len(liepin_jobs)} 条")
    status["sites"]["猎聘"]["status"] = "completed" if liepin_jobs else "failed"
    status["sites"]["猎聘"]["raw_count"] = len(liepin_jobs)
    status["sites"]["猎聘"]["message"] = f"采集完成，{len(liepin_jobs)}条" if liepin_jobs else "采集失败或返回0条"
    _write_status(status)

    crawler_utils.random_delay(3.0, 6.0)

    # ============== 站点3：前程无忧（登录态·全城市自动发现） ==============
    print("\n" + "-" * 40)
    print("站点3/3：前程无忧（全城市）")
    print("-" * 40)
    _kill_all_chrome()
    status["current_step"] = "前程无忧 - 采集中"
    status["sites"]["前程无忧"]["status"] = "running"
    status["sites"]["前程无忧"]["message"] = "初始化浏览器..."
    _write_status(status)

    job51_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] [前程无忧] 第 {attempt}/{MAX_RETRY} 次尝试...")
        dp = None
        try:
            dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
            status["sites"]["前程无忧"]["message"] = "检测登录状态..."
            _write_status(status)
            if not crawler_utils.check_site_login(dp, "前程无忧"):
                status["sites"]["前程无忧"]["message"] = "需要登录，请在浏览器完成后按回车"
                _write_status(status)
                crawler_utils.wait_for_login_confirmation("前程无忧")
            status["sites"]["前程无忧"]["message"] = "逐个城市采集中..."
            _write_status(status)
            # 使用带进度回调的patched版本
            job51_jobs = _patched_crawl_all_cities(
                dp, KEYWORD,
                test_cities=TEST_51JOB_CITIES if TEST_MODE else None,
                status_ref=status_ref,
                city_limit=PROD_51JOB_CITY_LIMIT if not TEST_MODE else None
            )
            if job51_jobs:
                print(f"[OK] [前程无忧] 第 {attempt} 次采集成功，获取 {len(job51_jobs)} 条")
                break
            else:
                print(f"[WARN] [前程无忧] 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] [前程无忧] 第 {attempt} 次采集出错: {e}")
            traceback.print_exc()
            status["sites"]["前程无忧"]["error"] = str(e)[:200]
        finally:
            if dp:
                try:
                    dp.quit()
                except Exception:
                    pass
        if attempt < MAX_RETRY:
            crawler_utils.random_delay(5.0, 10.0)

    all_jobs.extend(job51_jobs)
    per_site_stats["前程无忧"] = {"raw_count": len(job51_jobs)}
    print(f"[OK] 前程无忧 爬取完成，获取 {len(job51_jobs)} 条")
    status["sites"]["前程无忧"]["status"] = "completed" if job51_jobs else "failed"
    status["sites"]["前程无忧"]["raw_count"] = len(job51_jobs)
    status["sites"]["前程无忧"]["message"] = f"采集完成，{len(job51_jobs)}条" if job51_jobs else "采集失败或返回0条"
    _write_status(status)

    # ============== 合并汇总 ==============
    print(f"\n[COLLECT] 全部站点采集完成，原始汇总: {len(all_jobs)} 条")
    for site, stats in per_site_stats.items():
        print(f"  - {site}: {stats['raw_count']} 条")

    status["current_step"] = "数据合并与去重中..."
    status["total_raw_count"] = len(all_jobs)
    _write_status(status)

    # ============== 后置处理：过滤非IT → 去重 → 合并主文件 → 历史快照 → 审计日志 ==============
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=PROJECT_ROOT, save_csv=True, date_str=date_str
    )

    # ============== 全局汇总日志 ==============
    crawler_utils.log_global_summary(final_jobs, snapshot_path, per_site_stats)

    end_time = datetime.datetime.now()
    duration = (end_time - start_time).total_seconds()
    hours, rem = divmod(duration, 3600)
    minutes, seconds = divmod(rem, 60)

    raw_total = sum(s['raw_count'] for s in per_site_stats.values())
    print(f"\n{'='*60}")
    print(f"[DONE] 【登录态全量采集】完成 - {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[TIME] 总耗时: {int(hours)}小时{int(minutes)}分{int(seconds)}秒")
    print(f"[STATS] 本次采集原始 {raw_total} 条 | 主库合并后总条数: {len(final_jobs)} 条")
    for site, stats in per_site_stats.items():
        print(f"  - {site}: 原始{stats['raw_count']}条")
    print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
    print(f"[MAIN] 主文件已写入（合并模式）：{main_path}")
    print(f"{'='*60}\n")

    # 更新最终状态
    status["status"] = "completed"
    status["progress"] = 100
    status["current_step"] = "全部完成"
    status["end_time"] = end_time.strftime('%Y-%m-%d %H:%M:%S')
    status["final_count"] = len(final_jobs)
    status["duration"] = f"{int(hours)}h{int(minutes)}m{int(seconds)}s"
    _write_status(status)


def main():
    # 任务唯一标识 + 启动时间日志（定时任务执行前输出，便于后期排查何时触发爬虫）
    task_id = f"run_all_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    print("\n" + "#" * 60)
    print(f"#[TASK] 定时任务启动 | 任务唯一标识={task_id}")
    print(f"#[TASK] 任务启动时间={datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"#[TASK] 唯一正式定时任务：每日凌晨 02:00 执行 spider/run_all.py")
    print("#" * 60)

    # 文件进程锁
    if not _FILELOCK_AVAILABLE:
        print("[LOCK][WARN] filelock 未安装，跳过进程锁（建议安装 filelock 防止并行爬取）")
        lock = None
    else:
        try:
            LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
            lock = FileLock(str(LOCK_FILE))
            lock.acquire(timeout=0)
            try:
                import os as _os
                with open(LOCK_FILE, 'w', encoding='utf-8') as _f:
                    _f.write(f"pid={_os.getpid()}\ntask_id={task_id}\nstart={datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            except Exception:
                pass
            print(f"[LOCK] 进程锁已获取：{LOCK_FILE}")
        except Timeout:
            print(f"[LOCK] 检测到已有爬虫实例正在运行（锁文件存在）：{LOCK_FILE}")
            print("[LOCK] 本次启动终止，禁止多实例并行爬取、重复写入主数据文件。")
            sys.exit(2)

    try:
        run_all_crawlers()
    except KeyboardInterrupt:
        print("\n[WARN] 用户中断（Ctrl+C），程序退出")
        # 更新状态
        try:
            if STATUS_FILE.exists():
                s = json.loads(open(STATUS_FILE, 'r', encoding='utf-8').read())
                s["status"] = "failed"
                s["error"] = "用户中断 Ctrl+C"
                s["end_time"] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                _write_status(s)
        except Exception:
            pass
    except Exception as e:
        print(f"\n[FAIL] 主运行出错: {e}")
        traceback.print_exc()
        # 更新状态
        try:
            if STATUS_FILE.exists():
                s = json.loads(open(STATUS_FILE, 'r', encoding='utf-8').read())
                s["status"] = "failed"
                s["error"] = str(e)[:500]
                s["end_time"] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                _write_status(s)
        except Exception:
            pass
        sys.exit(1)
    finally:
        if lock is not None:
            try:
                lock.release()
            except Exception:
                pass
            try:
                if LOCK_FILE.exists():
                    LOCK_FILE.unlink()
            except Exception:
                pass
            print("[LOCK] 进程锁已释放。")


if __name__ == '__main__':
    main()
