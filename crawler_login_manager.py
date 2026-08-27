# -*- coding: utf-8 -*-
"""
招聘网站统一登录管理器（DrissionPage版 · 与spider共享profile）
========================================================
【功能】
  一次性打开智联、猎聘、前程无忧三个招聘网站，
  用户手动完成扫码登录后，登录状态（cookies/session）
  会自动保存到项目根目录的 chrome_scraper_profile/ 文件夹。
  下次运行 spider/run_all.py 时会自动读取，无需再重复登录。

【使用方法】
  1. 先关闭所有打开的 Chrome 浏览器窗口（避免 profile 被锁定）
  2. 执行命令：
     .venv312\Scripts\python.exe crawler_login_manager.py
  3. 在弹出的浏览器窗口中，依次打开三个标签页扫码登录
  4. 三个网站都登录完成后，回到控制台按回车
  5. 完成！以后运行爬虫会自动携带登录态

【注意】
  - 登录信息加密保存在本地 chrome_scraper_profile/ 目录
  - 不要删除该目录，否则需要重新登录
  - 如果遇到"profile被锁定"错误，请关闭所有Chrome后重试
  - 会话有效期通常为 7-30 天，过期后需要重新运行本脚本
"""
import sys
import time
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.absolute()
sys.path.insert(0, str(PROJECT_ROOT))
import crawler_utils


# 三网站登录配置
SITES_CONFIG = [
    {
        "name": "智联招聘",
        "short_name": "智联",
        "home_url": "https://www.zhaopin.com/",
        "login_url": "https://www.zhaopin.com/login/",
        "login_hint": "请点击右上角的【登录】按钮，使用手机号+验证码或扫码登录",
    },
    {
        "name": "猎聘网",
        "short_name": "猎聘",
        "home_url": "https://www.liepin.com/",
        "login_url": "https://www.liepin.com/login/",
        "login_hint": "请点击右上角的【登录/注册】按钮，使用扫码或手机号登录",
    },
    {
        "name": "前程无忧",
        "short_name": "前程无忧",
        "home_url": "https://we.51job.com/pc/search?keyword=计算机&searchType=2",
        "login_url": "https://login.51job.com/",
        "login_hint": "请点击右上角的【登录】按钮，使用扫码或手机号登录",
    },
]


def check_one_site_logged_in(dp, site_cfg):
    """使用 crawler_utils 统一登录检测逻辑检查单个网站登录状态"""
    return crawler_utils.check_site_login(dp, site_cfg["short_name"])


def main():
    print("\n" + "=" * 70)
    print("  招聘网站统一登录管理器（DrissionPage版 · 会话持久化）")
    print("=" * 70)
    print("\n📌 操作流程：")
    print("   1. 浏览器会自动打开3个标签页，分别是智联/猎聘/前程无忧")
    print("   2. 依次在每个标签页点击【登录】，使用手机号+验证码或扫码完成登录")
    print("   3. 三个网站都登录成功后，回到控制台按【回车键】")
    print("   4. 登录状态已自动保存，之后运行爬虫无需再登录")
    print("\n⚠️  重要前提：请先关闭本机所有 Chrome 浏览器窗口！")
    print("=" * 70 + "\n")

    # 不再使用 input()（后台运行无法接收输入），改为检测信号文件
    FLAG_FILE = PROJECT_ROOT / "login_done.flag"
    if FLAG_FILE.exists():
        FLAG_FILE.unlink()
    print("[等待] 脚本将打开浏览器，请在浏览器中完成登录...")
    print(f"[等待] 登录完成后，程序会自动检测 {FLAG_FILE.name} 文件并继续")
    print("[等待] 如果你看到这行提示，说明浏览器即将启动...\n")

    # ============== 启动浏览器（复用 spider 相同的 profile 目录） ==============
    print("\n[启动] 正在启动浏览器（加载持久化profile）...")
    try:
        dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
    except Exception as e:
        print(f"\n❌ 浏览器启动失败: {e}")
        print("\n常见原因：")
        print("  1. 有 Chrome 窗口没关闭（profile被锁定）→ 关闭所有 Chrome 后重试")
        print("  2. DrissionPage 未安装 → 运行 pip install DrissionPage")
        return

    tabs = []  # 保存每个站点的标签页id

    try:
        # ============== 依次打开三个站点（第一个用当前tab，后续新开） ==============
        for idx, site in enumerate(SITES_CONFIG):
            if idx == 0:
                tab = dp
            else:
                try:
                    tab = dp.new_tab()
                except Exception:
                    tab = dp
            try:
                print(f"\n[打开 {idx+1}/3] {site['name']} → {site['home_url']}")
                tab.get(site["home_url"], timeout=45)
                time.sleep(3)
                tabs.append((site, tab))
            except Exception as e:
                print(f"  ⚠️ {site['name']} 加载超时: {str(e)[:80]}，尝试直接打开登录页")
                try:
                    tab.get(site["login_url"], timeout=45)
                    time.sleep(3)
                except Exception as e2:
                    print(f"  ❌ {site['name']} 登录页也加载失败: {str(e2)[:80]}")
                tabs.append((site, tab))

        # ============== 输出登录引导 ==============
        print("\n" + "-" * 60)
        print("✅ 三个网站均已打开，请在浏览器中依次完成登录：\n")
        for i, (site, _) in enumerate(tabs, 1):
            print(f"  {i}. 【{site['name']}】")
            print(f"     提示：{site['login_hint']}")
        print(f"\n完成全部三个网站登录后，等待程序检测 {FLAG_FILE.name} 文件...")
        print("-" * 60 + "\n")

        # 轮询等待 login_done.flag 文件出现（最多等10分钟）
        print(f"[等待] 等待 {FLAG_FILE.name} 文件出现（最多等10分钟）...")
        wait_start = time.time()
        while time.time() - wait_start < 600:
            if FLAG_FILE.exists():
                print("[检测] 收到登录完成信号！")
                FLAG_FILE.unlink()
                break
            time.sleep(2)
        else:
            print("[超时] 等待超10分钟，直接检测登录状态...")

        # ============== 检测登录状态 ==============
        print("\n" + "-" * 60)
        print("🔍 正在检测各网站登录状态...\n")
        login_results = {}

        for site, tab in tabs:
            try:
                is_logged = check_one_site_logged_in(tab, site)
                login_results[site["short_name"]] = is_logged
                if is_logged:
                    print(f"  ✅ 【{site['name']}】登录成功")
                else:
                    print(f"  ❌ 【{site['name']}】未检测到登录态")
            except Exception as e:
                print(f"  ⚠️ 【{site['name']}】检测出错: {str(e)[:60]}")
                login_results[site["short_name"]] = False

        not_logged = [n for n, ok in login_results.items() if not ok]
        if not_logged:
            print(f"\n⚠️  以下 {len(not_logged)} 个网站未检测到登录态：{', '.join(not_logged)}")
            print("[提示] 未登录的网站仍会保留现有cookie，爬虫会尝试采集")
            # 不再阻塞等待 input()，直接继续

        print("\n" + "-" * 60)
        print("\n💾 登录状态已自动保存到 chrome_scraper_profile/ 目录")
        print("   下次运行 spider/run_all.py 时会自动携带本次登录态\n")

        try:
            login_record = {
                "last_login_time": time.strftime('%Y-%m-%d %H:%M:%S'),
                "sites": login_results,
                "profile_path": str(PROJECT_ROOT / "chrome_scraper_profile"),
            }
            login_record_file = PROJECT_ROOT / "login_status.json"
            with open(login_record_file, "w", encoding="utf-8") as f:
                json.dump(login_record, f, ensure_ascii=False, indent=2)
            print(f"📝 登录状态摘要已保存: {login_record_file}")
            for name, ok in login_results.items():
                print(f"   - {name}: {'✅已登录' if ok else '❌未登录'}")
        except Exception as e:
            print(f"⚠️  登录状态摘要写入失败: {e}")

    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断登录流程")
    except Exception as e:
        print(f"\n❌ 登录管理器出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            print("\n[关闭] 保存登录状态并关闭浏览器...")
            dp.quit()
            print("✅ 浏览器已关闭，登录态已保存到 chrome_scraper_profile/\n")
        except Exception:
            pass

    print("=" * 70)
    print("  现在可以运行爬虫了：")
    print("  .venv312\Scripts\python.exe spider\run_all.py")
    print("=" * 70 + "\n")


if __name__ == '__main__':
    main()
