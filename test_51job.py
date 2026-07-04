from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir=str(r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\job_crawler\job51_userdata"),
        headless=False,
        viewport={"width": 1920, "height": 1080},
        channel="chrome"
    )
    page = context.new_page()
    
    try:
        url = "https://we.51job.com/pc/search?jobArea=000000&keyword=计算机&searchType=2"
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        
        # 打印页面HTML（前5000字符）
        html = page.content()
        print("=== 页面HTML片段 ===")
        print(html[:5000])
        
        # 尝试查找职位列表
        print("\n=== 尝试查找职位元素 ===")
        
        # 尝试各种可能的选择器
        selectors = [
            '.job-item',
            'div[class*="job-card"]',
            '.search-list .item',
            '.job-list li',
            '[data-t-n]',
            'article',
            '.joblist'
        ]
        
        for selector in selectors:
            count = page.locator(selector).count()
            print(f"选择器 '{selector}': {count} 个元素")
            
            if count > 0:
                print(f"第一个元素HTML:")
                elem = page.locator(selector).first
                print(elem.inner_html())
                break
                
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        context.close()