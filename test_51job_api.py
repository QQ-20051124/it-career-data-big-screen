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
        
        # 捕获所有网络请求
        all_requests = []
        def log_request(request):
            if 'search' in request.url.lower() or 'api' in request.url.lower():
                all_requests.append({
                    'url': request.url,
                    'method': request.method,
                    'status': request.response.status if request.response else None
                })
        
        page.on('request', log_request)
        
        # 滚动页面触发更多请求
        for i in range(3):
            page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            time.sleep(3)
        
        print("=== 捕获到的请求 ===")
        for req in all_requests:
            print(f"URL: {req['url']}")
            print(f"Method: {req['method']}")
            print(f"Status: {req['status']}")
            print("-" * 50)
            
        # 尝试获取API响应内容
        print("\n=== 尝试获取API响应 ===")
        responses = []
        def capture_response(response):
            url_lower = response.url.lower()
            if 'search' in url_lower and 'pc' in url_lower:
                try:
                    data = response.json()
                    print(f"找到API响应: {response.url}")
                    print(f"数据结构: {list(data.keys())}")
                    if 'resultbody' in data:
                        print(f"resultbody结构: {list(data['resultbody'].keys())}")
                        if 'job' in data['resultbody']:
                            print(f"job结构: {list(data['resultbody']['job'].keys())}")
                            if 'items' in data['resultbody']['job']:
                                items = data['resultbody']['job']['items']
                                print(f"items数量: {len(items)}")
                                if items:
                                    print(f"第一条数据: {items[0]}")
                    responses.append(data)
                except Exception as e:
                    print(f"解析失败: {e}")
        
        page.on('response', capture_response)
        
        # 重新加载页面来捕获响应
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        
        print("\n=== 完成 ===")
                
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        context.close()