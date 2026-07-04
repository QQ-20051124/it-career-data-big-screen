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
            if '/api/job/search-pc' in url_lower:
                try:
                    data = response.json()
                    api_data.append(data)
                    print(f"捕获到职位API: {response.url}")
                except:
                    pass
        
        page.on('response', capture_response)
        
        # 打开页面
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        
        # 打印结果
        print(f"\n共捕获到 {len(api_data)} 条职位API数据")
        if api_data:
            for i, data in enumerate(api_data):
                print(f"\n=== API #{i+1} ===")
                print(f"数据结构: {list(data.keys())}")
                if 'resultbody' in data:
                    print(f"resultbody: {list(data['resultbody'].keys())}")
                    if 'job' in data['resultbody']:
                        print(f"job: {list(data['resultbody']['job'].keys())}")
                        if 'items' in data['resultbody']['job']:
                            items = data['resultbody']['job']['items']
                            print(f"items数量: {len(items)}")
                            if items:
                                print(f"第一条数据的键: {list(items[0].keys())}")
                                print(f"第一条数据: {items[0]}")
                
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        context.close()