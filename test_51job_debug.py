"""详细调试前程无忧页面结构"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import time

JOB51_USERDATA_DIR = Path(__file__).parent / "job_crawler" / "job51_userdata"
JOB51_USERDATA_DIR.mkdir(parents=True, exist_ok=True)

def test_51job_debug():
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(JOB51_USERDATA_DIR),
            headless=False,
            slow_mo=500,
            viewport={"width": 1920, "height": 1080},
            channel="chrome"
        )
        page = context.new_page()
        
        try:
            # 打开搜索页面
            url = "https://we.51job.com/pc/search?jobArea=000000&keyword=计算机&searchType=2"
            page.goto(url, wait_until="networkidle", timeout=60000)
            time.sleep(5)
            
            print("\n=== 页面标题 ===")
            print(f"标题: {page.title()}")
            
            # 检查地区选择器
            print("\n=== 地区选择器检查 ===")
            area_selectors = [
                'span:has-text("地区")',
                '.area-btn',
                '.location-btn', 
                '.search-area',
                '[class*="area"]',
                '[class*="location"]',
                'div:has-text("地区")'
            ]
            
            for selector in area_selectors:
                elements = page.locator(selector)
                count = elements.count()
                if count > 0:
                    print(f"找到元素: {selector} (数量: {count})")
                    try:
                        text = elements.first.text_content()
                        print(f"  文本内容: {text}")
                    except:
                        pass
            
            # 点击地区选择器
            print("\n=== 尝试点击地区选择器 ===")
            try:
                area_btn = page.locator('span:has-text("地区")')
                if area_btn.count() > 0:
                    print("找到地区按钮，尝试点击...")
                    area_btn.first.click()
                    time.sleep(3)
                    
                    # 检查弹窗内容
                    print("\n=== 地区弹窗内容 ===")
                    popup_selectors = ['.el-dialog', '.dialog', '.modal', '.area-select']
                    for selector in popup_selectors:
                        elements = page.locator(selector)
                        if elements.count() > 0:
                            print(f"找到弹窗: {selector}")
                            
                    # 搜索全国选项
                    nationwide_selectors = [
                        'text=全国',
                        'span:has-text("全国")',
                        '.area-option:has-text("全国")',
                        '.region-item:has-text("全国")',
                        'li:has-text("全国")'
                    ]
                    
                    print("\n=== 全国选项搜索 ===")
                    for selector in nationwide_selectors:
                        elements = page.locator(selector)
                        count = elements.count()
                        if count > 0:
                            print(f"找到全国选项: {selector} (数量: {count})")
                            # 尝试点击
                            try:
                                elements.first.click()
                                time.sleep(2)
                                print("[OK] 已点击全国选项")
                                break
                            except Exception as e:
                                print(f"点击失败: {e}")
                                
                    # 等待用户确认
                    input("\n请确认地区选择后按回车继续...")
                    
            except Exception as e:
                print(f"点击地区选择器失败: {e}")
                
            # 检查岗位卡片
            print("\n=== 岗位卡片检查 ===")
            card_selectors = [
                '.job-item',
                '.joblist-item',
                '.el-card',
                '[class*="job"]',
                '[class*="card"]',
                '.job-card'
            ]
            
            for selector in card_selectors:
                elements = page.locator(selector)
                count = elements.count()
                if count > 0:
                    print(f"找到岗位卡片: {selector} (数量: {count})")
            
            # 检查卡片内容
            print("\n=== 卡片内容检查 ===")
            job_cards = page.locator('.job-item')
            if job_cards.count() > 0:
                card = job_cards.first
                print("第一个卡片的HTML:")
                html_content = card.inner_html()
                print(html_content[:1000])
                
        except Exception as e:
            print(f"[FAIL] 出错: {e}")
            import traceback
            traceback.print_exc()
        finally:
            context.close()

if __name__ == "__main__":
    test_51job_debug()