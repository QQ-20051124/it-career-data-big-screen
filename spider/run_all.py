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

【前置条件】
- 爬取前请关闭Chrome浏览器（profile被锁定无法写入）
- 已在Chrome中登录前程无忧、猎聘、智联

【运行方式】
    .venv312\\Scripts\\python.exe spider\\run_all.py
"""
import sys
import time
import uuid
import datetime
from pathlib import Path

# 进程锁（filelock）：防止多实例并行爬取、重复写入主数据文件
# filelock 已随 .venv312 安装；进程异常崩溃时 OS 自动释放底层锁，避免死锁卡死
try:
    from filelock import FileLock, Timeout
    _FILELOCK_AVAILABLE = True
except ImportError:
    _FILELOCK_AVAILABLE = False

# 导入共享工具模块
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
import crawler_utils

# 导入各站点爬虫（登录态版）
from spider import 前程无忧 as job51_module
from spider import 猎聘 as liepin_module
from spider import 智联 as zhaopin_module

# ================== 配置区 ==================
KEYWORD = "计算机"
MAX_RETRY = 3  # 单站点最多重试次数

# ================== 进程锁配置 ==================
# 爬虫运行时生成 lock 文件；已有锁文件时直接终止本次启动
# lock 文件位于项目根 logs/crawler.run.lock
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
LOCK_FILE = PROJECT_ROOT / "logs" / "crawler.run.lock"

# ================== 测试模式配置 ==================
TEST_MODE = True  # True=小规模测试 / False=全量采集
TEST_ZHAOPIN_MAX_PAGES = 5      # 智联最多5页
TEST_LIEPIN_MAX_PAGES = 6      # 猎聘最多6页
TEST_51JOB_CITIES = [           # 前程无忧只跑3个测试城市
    ("广州", "030200"),
    ("深圳", "040000"),
    ("云浮", "030200CC"),  # 云浮是广东省下辖市，使用广州code+CC后缀模拟
]


def run_all_crawlers():
    """主流程：依次爬取智联 → 猎聘 → 前程无忧 → 合并处理"""
    start_time = datetime.datetime.now()
    date_str = start_time.strftime('%Y%m%d')
    per_site_stats = {}

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
    zhaopin_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] [智联] 第 {attempt}/{MAX_RETRY} 次尝试...")
        dp = None
        try:
            # 每次重试都创建新浏览器实例（避免Cookie/Session/缓存污染导致的数据量递减）
            dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
            # 登录状态检测：已登录直接继续，未登录阻塞等待扫码
            if not crawler_utils.check_site_login(dp, "智联"):
                crawler_utils.wait_for_login_confirmation("智联")
                # 用户按回车后重新检测一次
                crawler_utils.check_site_login(dp, "智联")
            zhaopin_jobs = zhaopin_module.crawl_zhaopin(KEYWORD, dp=dp, max_pages=TEST_ZHAOPIN_MAX_PAGES if TEST_MODE else None)
            if zhaopin_jobs:
                print(f"[OK] [智联] 第 {attempt} 次采集成功，获取 {len(zhaopin_jobs)} 条")
                break
            else:
                print(f"[WARN] [智联] 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] [智联] 第 {attempt} 次采集出错: {e}")
            import traceback
            traceback.print_exc()
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

    crawler_utils.random_delay(3.0, 6.0)

    # ============== 站点2：猎聘网（登录态·全国URL分页） ==============
    print("\n" + "-" * 40)
    print("站点2/3：猎聘网")
    print("-" * 40)
    liepin_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] [猎聘] 第 {attempt}/{MAX_RETRY} 次尝试...")
        dp = None
        try:
            dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
            # 登录状态检测
            if not crawler_utils.check_site_login(dp, "猎聘"):
                crawler_utils.wait_for_login_confirmation("猎聘")
                crawler_utils.check_site_login(dp, "猎聘")
            liepin_jobs = liepin_module.crawl_liepin(KEYWORD, dp=dp, max_pages=TEST_LIEPIN_MAX_PAGES if TEST_MODE else None)
            if liepin_jobs:
                print(f"[OK] [猎聘] 第 {attempt} 次采集成功，获取 {len(liepin_jobs)} 条")
                break
            else:
                print(f"[WARN] [猎聘] 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] [猎聘] 第 {attempt} 次采集出错: {e}")
            import traceback
            traceback.print_exc()
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

    crawler_utils.random_delay(3.0, 6.0)

    # ============== 站点3：前程无忧（登录态·全城市自动发现） ==============
    print("\n" + "-" * 40)
    print("站点3/3：前程无忧（全城市）")
    print("-" * 40)
    job51_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] [前程无忧] 第 {attempt}/{MAX_RETRY} 次尝试...")
        dp = None
        try:
            dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
            # 登录状态检测
            if not crawler_utils.check_site_login(dp, "前程无忧"):
                crawler_utils.wait_for_login_confirmation("前程无忧")
                crawler_utils.check_site_login(dp, "前程无忧")
            job51_jobs = job51_module.crawl_51job_all_cities(dp, KEYWORD, test_cities=TEST_51JOB_CITIES if TEST_MODE else None)
            if job51_jobs:
                print(f"[OK] [前程无忧] 第 {attempt} 次采集成功，获取 {len(job51_jobs)} 条")
                break
            else:
                print(f"[WARN] [前程无忧] 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] [前程无忧] 第 {attempt} 次采集出错: {e}")
            import traceback
            traceback.print_exc()
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

    # ============== 合并汇总 ==============
    print(f"\n[COLLECT] 全部站点采集完成，原始汇总: {len(all_jobs)} 条")
    for site, stats in per_site_stats.items():
        print(f"  - {site}: {stats['raw_count']} 条")

    # ============== 后置处理：过滤非IT → 去重 → 合并主文件 → 历史快照 → 审计日志 ==============
    project_root = Path(__file__).parent.parent.absolute()
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=project_root, save_csv=True, date_str=date_str
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


def main():
    # 任务唯一标识 + 启动时间日志（定时任务执行前输出，便于后期排查何时触发爬虫）
    task_id = f"run_all_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    print("\n" + "#" * 60)
    print(f"#[TASK] 定时任务启动 | 任务唯一标识={task_id}")
    print(f"#[TASK] 任务启动时间={datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"#[TASK] 唯一正式定时任务：每日凌晨 02:00 执行 spider/run_all.py")
    print("#" * 60)

    # 文件进程锁：已有锁文件时直接终止本次启动，禁止多实例并行爬取、重复写入主数据文件
    if not _FILELOCK_AVAILABLE:
        print("[LOCK][WARN] filelock 未安装，跳过进程锁（建议安装 filelock 防止并行爬取）")
        lock = None
    else:
        try:
            LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
            lock = FileLock(str(LOCK_FILE))
            lock.acquire(timeout=0)
            # 写入持锁进程信息，便于排查
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
    except Exception as e:
        print(f"\n[FAIL] 主运行出错: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        # 正常跑完 / 异常崩溃自动释放锁，避免死锁卡死
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
