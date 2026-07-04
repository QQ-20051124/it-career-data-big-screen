"""测试前程无忧页面结构"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import time

JOB51_USERDATA_DIR = Path(__file__).parent / "job_crawler" / "job51_userdata"
JOB51_USERDATA_DIR.mkdir(parents=True, exist_ok=True)

def test_51job_structure():
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(JOB51_USERDATA_DIR),
            headless=False,
            slow_mo=100,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        
        try:
            # 打开搜索页面
            url = "https://we.51job.com/pc/search?jobArea=000000&keyword=计算机&searchType=2"
            page.goto(url, wait_until="networkidle", timeout=60000)
            time.sleep(5)
            
            # 保存页面HTML
            html = page.content()
            with open("51job_page.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("[OK] 页面HTML已保存到 51job_page.html")
            
            # 检查页面上的元素
            print("\n=== 页面元素检查 ===")
            
            # 检查岗位卡片
            job_cards = page.locator('.job-item, .joblist-item, .el-card')
            print(f"岗位卡片数量: {job_cards.count()}")
            
            # 检查地区选择
            area_selectors = ['span:has-text("全国")', 'span:has-text("地区")', '.area-btn', '.location-btn', '.search-area']
            for selector in area_selectors:
                elements = page.locator(selector)
                if elements.count() > 0:
                    print(f"找到地区选择元素: {selector}")
                    
            # 检查搜索按钮
            search_btn = page.locator('button:has-text("搜索"), .search-btn')
            print(f"搜索按钮数量: {search_btn.count()}")
            
            # 尝试滚动加载
            print("\n=== 尝试滚动加载 ===")
            for i in range(3):
                page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                time.sleep(3)
                job_cards = page.locator('.job-item, .joblist-item, .el-card')
                print(f"滚动 {i+1} 次后，岗位卡片数量: {job_cards.count()}")
                
            # 检查网络请求
            print("\n=== 网络请求分析 ===")
            responses = []
            page.on('response', lambda r: responses.append(r.url))
            
            # 重新加载页面来捕获网络请求
            page.goto(url, wait_until="networkidle", timeout=60000)
            time.sleep(5)
            
            # 打印API请求
            print("\n找到的API请求:")
            api_urls = [r for r in responses if 'api' in r.lower() or 'search' in r.lower()]
            for api in api_urls[:10]:
                print(f"  - {api}")
                
        except Exception as e:
            print(f"[FAIL] 出错: {e}")
            import traceback
            traceback.print_exc()
        finally:
            context.close()

if __name__ == "__main__":
    test_51job_structure()