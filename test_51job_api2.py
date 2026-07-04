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
        
        # 先设置响应监听
        api_data = []
        def capture_response(response):
            url_lower = response.url.lower()
            if 'search' in url_lower and 'pc' in url_lower:
                try:
                    data = response.json()
                    if 'resultbody' in data:
                        api_data.append(data)
                        print(f"捕获到API数据: {response.url}")
                except:
                    pass
        
        page.on('response', capture_response)
        
        # 打开页面
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        
        # 滚动加载更多
        for i in range(5):
            page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            time.sleep(3)
        
        # 打印结果
        print(f"\n共捕获到 {len(api_data)} 条API数据")
        if api_data:
            first_data = api_data[0]
            print(f"数据结构: {list(first_data.keys())}")
            if 'resultbody' in first_data:
                print(f"resultbody: {list(first_data['resultbody'].keys())}")
                if 'job' in first_data['resultbody']:
                    print(f"job: {list(first_data['resultbody']['job'].keys())}")
                    if 'items' in first_data['resultbody']['job']:
                        items = first_data['resultbody']['job']['items']
                        print(f"items数量: {len(items)}")
                        if items:
                            print(f"第一条数据的键: {list(items[0].keys())}")
                
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        context.close()