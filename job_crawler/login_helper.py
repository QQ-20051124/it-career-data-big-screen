"""
登录助手 - 用于手动登录招聘网站并保存状态
运行一次后，后续爬虫可以直接使用保存的登录状态
"""
from playwright.sync_api import sync_playwright
import time
import sys

def login_zhilian():
    """登录智联招聘并保存状态"""
    print("\n" + "="*50)
    print("=== 智联招聘登录 ===")
    print("="*50)
    print("即将打开智联招聘网站...")
    print("请在浏览器中完成登录")
    
    user_data_dir = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler\zhilian_userdata"
    
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
        
        # 使用已有的存储状态
        try:
            context.storage_state(path=user_data_dir + "/storage_state.json")
            print("[INFO] 已加载之前的登录状态")
        except:
            print("[INFO] 无已有登录状态，需要重新登录")
        
        page = context.new_page()
        
        try:
            page.goto("https://www.zhaopin.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            
            print("\n请在浏览器中登录智联招聘...")
            print("登录成功后，页面会自动检测")
            
            # 等待用户登录，最多等待3分钟
            start_time = time.time()
            timeout = 180
            
            while time.time() - start_time < timeout:
                try:
                    url = page.url
                    content = page.content()
                    
                    # 检查登录成功的标志
                    logged_in = False
                    
                    # 方式1: URL包含personal或home
                    if 'personal' in url or 'home' in url or 'resume' in url:
                        logged_in = True
                        print(f"[OK] 检测到登录成功！(URL: {url})")
                        break
                    
                    # 方式2: 页面包含用户相关元素
                    user_indicators = [
                        '.user-name', '.username', '.avatar', 
                        '[class*="user-info"]', '[class*="personal"]',
                        'a[href*="/personal/"]', 'a:has-text("我的简历")'
                    ]
                    for selector in user_indicators:
                        try:
                            if page.locator(selector).count() > 0:
                                logged_in = True
                                print(f"[OK] 检测到登录成功！(元素: {selector})")
                                break
                        except:
                            pass
                    if logged_in:
                        break
                        
                except Exception as e:
                    pass
                
                time.sleep(3)
                elapsed = int(time.time() - start_time)
                if elapsed % 30 == 0 and elapsed > 0:
                    print(f"  等待登录中... ({elapsed}秒)")
            
            if time.time() - start_time >= timeout:
                print("[WARN] 登录等待超时，但保存当前状态")
            
            # 保存登录状态
            context.storage_state(path=user_data_dir + "/storage_state.json")
            print(f"[OK] 智联招聘登录状态已保存")
            
        except Exception as e:
            print(f"[ERROR] 智联登录出错: {e}")
        finally:
            context.close()
            browser.close()

def login_51job():
    """登录前程无忧并保存状态"""
    print("\n" + "="*50)
    print("=== 前程无忧登录 ===")
    print("="*50)
    print("即将打开前程无忧网站...")
    print("请在浏览器中完成登录")
    
    user_data_dir = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler\job51_userdata"
    
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
        
        # 使用已有的存储状态
        try:
            context.storage_state(path=user_data_dir + "/storage_state.json")
            print("[INFO] 已加载之前的登录状态")
        except:
            print("[INFO] 无已有登录状态，需要重新登录")
        
        page = context.new_page()
        
        try:
            page.goto("https://we.51job.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            
            print("\n请在浏览器中登录前程无忧...")
            print("登录成功后，页面会自动检测")
            
            # 等待用户登录，最多等待3分钟
            start_time = time.time()
            timeout = 180
            
            while time.time() - start_time < timeout:
                try:
                    url = page.url
                    
                    # 检查登录成功的标志
                    if 'login' not in url.lower() and ('main' in url.lower() or 'personal' in url.lower() or 'home' in url.lower()):
                        print(f"[OK] 前程无忧登录成功！(URL: {url})")
                        break
                    
                    # 检查页面元素
                    user_elements = page.locator('.user-name, .avatar, .nickname, [class*="user-info"]')
                    if user_elements.count() > 0:
                        print("[OK] 前程无忧登录成功！")
                        break
                        
                except:
                    pass
                
                time.sleep(3)
                elapsed = int(time.time() - start_time)
                if elapsed % 30 == 0 and elapsed > 0:
                    print(f"  等待登录中... ({elapsed}秒)")
            
            if time.time() - start_time >= timeout:
                print("[WARN] 登录等待超时，但保存当前状态")
            
            # 保存登录状态
            context.storage_state(path=user_data_dir + "/storage_state.json")
            print(f"[OK] 前程无忧登录状态已保存")
            
        except Exception as e:
            print(f"[ERROR] 前程无忧登录出错: {e}")
        finally:
            context.close()
            browser.close()

def login_liepin():
    """登录猎聘网并保存状态"""
    print("\n" + "="*50)
    print("=== 猎聘网登录 ===")
    print("="*50)
    print("即将打开猎聘网...")
    print("请在浏览器中完成登录")
    
    user_data_dir = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler\liepin_userdata"
    
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
        
        # 使用已有的存储状态
        try:
            context.storage_state(path=user_data_dir + "/storage_state.json")
            print("[INFO] 已加载之前的登录状态")
        except:
            print("[INFO] 无已有登录状态，需要重新登录")
        
        page = context.new_page()
        
        try:
            page.goto("https://www.liepin.com/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(3)
            
            print("\n请在浏览器中登录猎聘网...")
            print("登录成功后，页面会自动检测")
            
            # 等待用户登录，最多等待3分钟
            start_time = time.time()
            timeout = 180
            
            while time.time() - start_time < timeout:
                try:
                    url = page.url
                    
                    # 猎聘登录成功后URL不包含login
                    if 'login' not in url.lower():
                        # 进一步检查是否在首页或个人页面
                        if '/' == url.replace('https://www.liepin.com', '').replace('/', '') or 'home' in url or 'personal' in url:
                            print(f"[OK] 猎聘网登录成功！(URL: {url})")
                            break
                except:
                    pass
                
                time.sleep(3)
                elapsed = int(time.time() - start_time)
                if elapsed % 30 == 0 and elapsed > 0:
                    print(f"  等待登录中... ({elapsed}秒)")
            
            if time.time() - start_time >= timeout:
                print("[WARN] 登录等待超时，但保存当前状态")
            
            # 保存登录状态
            context.storage_state(path=user_data_dir + "/storage_state.json")
            print(f"[OK] 猎聘网登录状态已保存")
            
        except Exception as e:
            print(f"[ERROR] 猎聘网登录出错: {e}")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    print("="*60)
    print("=== 招聘网站登录助手 ===")
    print("="*60)
    print("\n说明:")
    print("1. 程序会依次打开三个招聘网站")
    print("2. 请在浏览器中手动完成登录")
    print("3. 登录成功后状态会自动保存")
    print("4. 后续爬虫可直接使用保存的登录状态")
    print("\n每个网站登录等待时间: 最多3分钟")
    print("="*60)
    
    sites = [
        ("智联招聘", login_zhilian),
        ("前程无忧", login_51job),
        ("猎聘网", login_liepin),
    ]
    
    for name, login_func in sites:
        try:
            login_func()
        except Exception as e:
            print(f"\n[ERROR] {name}登录出错: {e}")
            print(f"[INFO] 跳过{name}，继续下一个...")
        
        # 询问是否继续
        if name != "猎聘网":
            try:
                choice = input(f"\n{name}登录完成。按回车继续下一个网站，输入 q 退出: ").strip()
                if choice.lower() == 'q':
                    print("\n已退出登录流程")
                    break
            except:
                print("继续下一个...")
    
    print("\n" + "="*60)
    print("=== 登录流程结束 ===")
    print("现在可以运行爬虫了!")
    print("="*60)
