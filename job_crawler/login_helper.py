from playwright.sync_api import sync_playwright
import time

def login_51job():
    """登录前程无忧并保存状态"""
    print("\n=== 正在打开前程无忧登录页面 ===")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler\job51_userdata"),
            headless=False,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        
        try:
            page.goto("https://we.51job.com/", wait_until="domcontentloaded", timeout=60000)
            print("请在浏览器中登录前程无忧...")
            
            # 等待用户登录
            while True:
                try:
                    # 检查是否已登录
                    user_elements = page.locator('.user-name, .avatar, .nickname, a:has-text("我的")')
                    if user_elements.count() > 0:
                        print("[OK] 前程无忧登录成功！")
                        break
                    
                    # 检查是否显示登录按钮
                    login_btn = page.locator('button:has-text("登录"), a:has-text("登录")')
                    if login_btn.count() > 0:
                        print("请点击登录按钮并完成登录...")
                except:
                    pass
                
                time.sleep(3)
                
        except Exception as e:
            print(f"登录过程出错: {e}")
        finally:
            context.close()

def login_liepin():
    """登录猎聘网并保存状态"""
    print("\n=== 正在打开猎聘网登录页面 ===")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler\liepin_userdata"),
            headless=False,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        
        try:
            page.goto("https://www.liepin.com/", wait_until="domcontentloaded", timeout=60000)
            print("请在浏览器中登录猎聘网...")
            
            # 等待用户登录
            while True:
                try:
                    # 检查是否已登录（URL不包含login）
                    if "login" not in page.url.lower():
                        print("[OK] 猎聘网登录成功！")
                        break
                except:
                    pass
                
                time.sleep(3)
                
        except Exception as e:
            print(f"登录过程出错: {e}")
        finally:
            context.close()

if __name__ == "__main__":
    print("=== 登录助手 ===")
    print("请按照提示在弹出的浏览器窗口中登录各网站")
    
    # 登录前程无忧
    login_51job()
    
    # 登录猎聘网
    login_liepin()
    
    print("\n=== 所有登录完成！现在可以运行爬虫了 ===")