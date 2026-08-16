"""
招聘网站登录工具
使用与爬虫相同的持久化上下文方式保存登录状态
运行后请在浏览器中完成登录，状态会自动保存
"""
from playwright.sync_api import sync_playwright
import time
import sys

BASE_DIR = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler"

SITES = [
    {
        "name": "智联招聘",
        "url": "https://www.zhaopin.com/",
        "user_data_dir": f"{BASE_DIR}/zhaopin_userdata",
        "login_check": lambda page: (
            "login" not in page.url.lower() and 
            ("www.zhaopin.com" in page.url or "sou.zhaopin.com" in page.url)
        )
    },
    {
        "name": "前程无忧",
        "url": "https://we.51job.com/",
        "user_data_dir": f"{BASE_DIR}/job51_userdata",
        "login_check": lambda page: (
            "login" not in page.url.lower() and 
            ("main" in page.url.lower() or "personal" in page.url.lower() or "home" in page.url.lower())
        )
    },
    {
        "name": "猎聘网",
        "url": "https://www.liepin.com/",
        "user_data_dir": f"{BASE_DIR}/liepin_userdata",
        "login_check": lambda page: (
            "login" not in page.url.lower() and 
            ("home" in page.url.lower() or "personal" in page.url.lower() or page.url.rstrip("/") == "https://www.liepin.com")
        )
    },
]

def login_site(site):
    """登录单个网站"""
    name = site["name"]
    url = site["url"]
    user_data_dir = site["user_data_dir"]
    login_check = site["login_check"]
    
    print(f"\n{'='*60}")
    print(f"▶ 正在打开 {name}")
    print(f"{'='*60}")
    print(f"  网址: {url}")
    print(f"  请在浏览器中完成登录")
    print(f"  登录成功后程序会自动检测并保存")
    print(f"  (最多等待 5 分钟)")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=False,
            viewport={"width": 1920, "height": 1080},
            channel="chrome",
            args=['--start-maximized', '--disable-blink-features=AutomationControlled']
        )
        
        page = context.new_page()
        
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            
            print(f"\n  >>> 请在浏览器中登录 {name} <<<")
            
            start = time.time()
            timeout = 300  # 5分钟
            
            while time.time() - start < timeout:
                try:
                    if login_check(page):
                        print(f"\n  ✅ {name} 登录成功！")
                        print(f"  ✅ 登录状态已自动保存")
                        return True
                except:
                    pass
                
                elapsed = int(time.time() - start)
                if elapsed % 10 == 0:
                    remaining = timeout - elapsed
                    print(f"  ⏳ 等待登录中... ({elapsed}s, 剩余约{remaining}s)")
                
                time.sleep(2)
            
            print(f"\n  ⚠️ {name} 登录超时")
            print(f"  登录状态已保存（即使未完全登录）")
            return False
            
        except Exception as e:
            print(f"\n  ❌ {name} 出错: {e}")
            return False
        finally:
            context.close()

def main():
    print("\n" + "="*60)
    print("  招聘网站登录工具")
    print("="*60)
    print("\n  此工具用于在首次使用前登录各招聘网站")
    print("  登录成功后，爬虫会自动使用保存的登录状态")
    print("  下次运行爬虫无需再次登录")
    print("="*60)
    
    results = {}
    for i, site in enumerate(SITES):
        try:
            success = login_site(site)
            results[site["name"]] = success
        except Exception as e:
            print(f"\n❌ {site['name']} 处理出错: {e}")
            results[site["name"]] = False
    
    print("\n" + "="*60)
    print("  登录结果汇总")
    print("="*60)
    for name, ok in results.items():
        status = "✅ 成功" if ok else "⚠️ 未完成"
        print(f"  {name}: {status}")
    print("="*60)
    
    success_count = sum(1 for v in results.values() if v)
    print(f"\n成功登录 {success_count}/{len(SITES)} 个网站")
    
    if success_count > 0:
        print("\n🎉 现在可以运行爬虫了!")
        print("   python daily_crawler.py")
    else:
        print("\n请重新运行此脚本完成登录")

if __name__ == "__main__":
    main()
