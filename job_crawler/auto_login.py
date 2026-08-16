"""
自动化登录脚本 - 依次打开三个网站，等待登录后自动保存状态
使用方法: python auto_login.py
登录完成后会自动保存状态，无需命令行交互
"""
from playwright.sync_api import sync_playwright
import time
import os

# 配置
WAIT_TIMEOUT = 300  # 每个网站最多等待5分钟
CHECK_INTERVAL = 3  # 检查间隔秒数

# 用户数据目录
BASE_DIR = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler"

def login_site(name, url, user_data_dir, login_detectors):
    """
    登录单个网站
    login_detectors: 登录成功检测规则列表
    """
    print("\n" + "="*60)
    print(f"=== {name} 登录 ===")
    print("="*60)
    print(f"正在打开 {name}...")
    print("请在浏览器中完成登录")
    print(f"(最多等待 {WAIT_TIMEOUT} 秒)")
    
    storage_path = os.path.join(user_data_dir, "storage_state.json")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            channel="chrome",
            args=['--start-maximized']
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # 尝试加载已有状态
        if os.path.exists(storage_path):
            try:
                context.storage_state(path=storage_path)
                print(f"[INFO] 已加载之前的登录状态")
            except:
                print(f"[INFO] 之前的状态加载失败，需要重新登录")
        else:
            print(f"[INFO] 无已有登录状态")
        
        page = context.new_page()
        
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            
            print(f"\n>>> 请在浏览器中登录 {name} <<<")
            
            start_time = time.time()
            logged_in = False
            
            while time.time() - start_time < WAIT_TIMEOUT:
                try:
                    current_url = page.url
                    
                    # 检查登录成功
                    for detector in login_detectors:
                        if detector["type"] == "url_contains":
                            if detector["value"].lower() in current_url.lower():
                                logged_in = True
                                print(f"[OK] {name} 登录成功！(URL包含: {detector['value']})")
                                break
                        elif detector["type"] == "url_not_contains":
                            if detector["value"].lower() not in current_url.lower():
                                # 还需要检查正向条件
                                if detector.get("also_contains"):
                                    if detector["also_contains"].lower() in current_url.lower():
                                        logged_in = True
                                        print(f"[OK] {name} 登录成功！(URL: {current_url})")
                                        break
                                else:
                                    logged_in = True
                                    print(f"[OK] {name} 登录成功！(URL: {current_url})")
                                    break
                        elif detector["type"] == "element_exists":
                            try:
                                if page.locator(detector["selector"]).count() > 0:
                                    logged_in = True
                                    print(f"[OK] {name} 登录成功！(检测到元素: {detector['selector']})")
                                    break
                            except:
                                pass
                    
                    if logged_in:
                        break
                        
                except Exception as e:
                    pass
                
                time.sleep(CHECK_INTERVAL)
                elapsed = int(time.time() - start_time)
                if elapsed % 30 == 0:
                    remaining = WAIT_TIMEOUT - elapsed
                    print(f"  等待中... ({elapsed}秒 / {WAIT_TIMEOUT}秒, 剩余约{remaining}秒)")
            
            # 保存状态
            os.makedirs(user_data_dir, exist_ok=True)
            context.storage_state(path=storage_path)
            
            if logged_in:
                print(f"\n[SUCCESS] {name} 登录成功，状态已保存")
            else:
                print(f"\n[WARN] {name} 等待超时，已保存当前状态")
            
            return logged_in
            
        except Exception as e:
            print(f"[ERROR] {name} 登录出错: {e}")
            return False
        finally:
            context.close()
            browser.close()

def main():
    print("="*60)
    print("=== 招聘网站自动化登录工具 ===")
    print("="*60)
    print("\n程序会依次打开三个招聘网站的浏览器窗口")
    print("请在每个网站完成登录后，程序会自动保存状态")
    print("="*60)
    
    # 三个网站的配置
    sites = [
        {
            "name": "智联招聘",
            "url": "https://www.zhaopin.com/",
            "user_data_dir": os.path.join(BASE_DIR, "zhilian_userdata"),
            "login_detectors": [
                {"type": "url_contains", "value": "personal"},
                {"type": "url_contains", "value": "resume"},
                {"type": "element_exists", "selector": ".user-name"},
                {"type": "element_exists", "selector": "[class*='user-info']"},
                {"type": "element_exists", "selector": "a:has-text('我的简历')"},
            ]
        },
        {
            "name": "前程无忧",
            "url": "https://we.51job.com/",
            "user_data_dir": os.path.join(BASE_DIR, "job51_userdata"),
            "login_detectors": [
                {"type": "url_not_contains", "value": "login", "also_contains": "main"},
                {"type": "url_not_contains", "value": "login", "also_contains": "personal"},
                {"type": "url_not_contains", "value": "login", "also_contains": "home"},
                {"type": "element_exists", "selector": ".user-name"},
                {"type": "element_exists", "selector": ".nickname"},
                {"type": "element_exists", "selector": "[class*='user-info']"},
            ]
        },
        {
            "name": "猎聘网",
            "url": "https://www.liepin.com/",
            "user_data_dir": os.path.join(BASE_DIR, "liepin_userdata"),
            "login_detectors": [
                {"type": "url_not_contains", "value": "login", "also_contains": "home"},
                {"type": "url_not_contains", "value": "login", "also_contains": "personal"},
                {"type": "element_exists", "selector": ".user-nav"},
                {"type": "element_exists", "selector": "[class*='user-card']"},
                {"type": "element_exists", "selector": "a:has-text('我的简历')"},
            ]
        },
    ]
    
    results = {}
    
    for site in sites:
        try:
            success = login_site(
                name=site["name"],
                url=site["url"],
                user_data_dir=site["user_data_dir"],
                login_detectors=site["login_detectors"]
            )
            results[site["name"]] = "成功" if success else "超时/未完成"
        except Exception as e:
            print(f"[ERROR] {site['name']} 处理出错: {e}")
            results[site["name"]] = f"错误: {e}"
    
    # 打印结果摘要
    print("\n" + "="*60)
    print("=== 登录结果摘要 ===")
    print("="*60)
    for name, status in results.items():
        icon = "✅" if status == "成功" else "⚠️"
        print(f"{icon} {name}: {status}")
    print("="*60)
    
    successful = sum(1 for s in results.values() if s == "成功")
    print(f"\n成功登录 {successful}/{len(sites)} 个网站")
    
    if successful > 0:
        print("\n现在可以运行爬虫了!")
        print("运行命令: python daily_crawler.py")
    else:
        print("\n建议重新运行此脚本完成登录")

if __name__ == "__main__":
    main()
