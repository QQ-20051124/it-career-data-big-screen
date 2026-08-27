# -*- coding: utf-8 -*-
"""
前程无忧爬虫（HTML解析版·登录态）—— 【全城市自动翻页】
- 使用用户已登录的Chrome profile，携带登录态采集更多数据
- 动态提取页面所有城市入口（自动发现所有城市），逐个城市依次采集
- 每个城市内持续翻页，直到无下一页为止（不设50页上限）
- 终止条件：无下一页按钮 / 连续3页无数据
- 单站点最多3次重试防卡死
- 每页随机延时 + 反爬适配
- 采集完成后：后置过滤非IT岗位 → 去重 → 历史快照 → 覆盖 all_cleaned_jobs.json
- 关键词固定仅【计算机】

核心策略：
- 使用HTML解析（BeautifulSoup）提取岗位数据，而非API监听
- 岗位选择器：.job-item
- 字段选择器：.job-name, .salary, .company, .location
- 分页结构：.el-pagination > .el-pager > li.number
- 翻页方式：点击 .btn-next 或具体页码
"""
import sys
import csv
import time
import json
import random
import datetime
import hashlib
from pathlib import Path

from bs4 import BeautifulSoup

# 导入共享工具模块
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
import crawler_utils

# ================== 风控判定日志工具 ==================
def _log_risk_if_any(dp, html: str, site: str, stage: str):
    """统一风控判定，异常时打印 [RISK] 标记日志"""
    risk_flags = []
    try:
        current_url = (dp.url or '').lower()
        if any(k in current_url for k in ['login', 'passport', 'captcha', 'verify', 'auth', 'safe']):
            risk_flags.append(f"URL重定向到登录/验证页: {current_url[:120]}")
    except Exception:
        pass
    if html and len(html) < 10000:
        # 前程无忧搜索页HTML通常 > 50KB，< 10KB 视为异常（含加载不完整/风控拦截页）
        risk_flags.append(f"HTML内容过短: {len(html)}字节（正常页面通常>50KB）")
    if html:
        html_lower = html.lower()
        for kw in ['验证码', 'captcha', '安全验证', '访问受限', '访问过于频繁',
                   '"code":403', '"code":429', "'code': 403", "'code': 429",
                   '403 forbidden', '429 too many', 'riskcontrol', '"status":"fail"',
            # 注意：不匹配单独的"验证"二字，因为正常页面也常有"验证"字样
                   '"success":false', 'request too fast']:
            if kw in html_lower or kw in html:
                risk_flags.append(f"页面命中风控关键词: {kw}")
                break
    if risk_flags:
        for flag in risk_flags:
            print(f"[RISK] [{site}] ({stage}) {flag}")
        return True
    return False


# ================== 配置区 ==================
KEYWORD = "计算机"
EMPTY_PAGE_THRESHOLD = 3  # 连续3页0条新岗位才判定采集结束
MAX_RETRY = 3  # 单站点最多重试次数
PAGE_LOAD_WAIT = 4  # 页面加载等待时间（秒，优化：由5→4，首页额外+3）
PAGE_RENDER_WAIT = 4  # 翻页后渲染等待时间（秒）


def _extract_all_cities(dp):
    """
    前程无忧：从页面动态提取所有城市入口
    通过JS提取城市选择器中的所有city项（名称+代码）
    返回 [(city_name, city_code), ...]
    """
    cities = []
    seen_codes = set()

    try:
        # 先用JS获取页面中所有城市数据
        js_extract = """
        (function() {
            var result = [];
            // 方式1: 查找带jobArea的链接
            var allLinks = document.querySelectorAll('a[href*="jobArea"]');
            allLinks.forEach(function(a) {
                var text = (a.textContent || '').trim();
                var href = a.getAttribute('href') || '';
                var code = '';
                var match = href.match(/jobArea[=\\/](\\d+)/);
                if (match) code = match[1];
                if (text && code && text.length >= 2 && text.length <= 10) {
                    result.push({name: text, code: code});
                }
            });
            
            // 方式2: 查找城市选择器
            if (result.length === 0) {
                var cityItems = document.querySelectorAll('[class*="city-item"], [class*="CityItem"]');
                cityItems.forEach(function(el) {
                    var text = (el.textContent || '').trim();
                    var code = el.getAttribute('data-code') || el.getAttribute('data-city') || '';
                    if (text && code && text.length >= 2 && text.length <= 10) {
                        result.push({name: text, code: code});
                    }
                });
            }
            
            return result;
        })();
        """
        result = dp.run_js(js_extract)
        if result and isinstance(result, list):
            for item in result:
                name = item.get('name', '').strip()
                code = item.get('code', '').strip()
                if name and code and code not in seen_codes:
                    seen_codes.add(code)
                    cities.append((name, code))

        # 如果JS提取失败，回退到解析HTML
        if not cities:
            print("[CITY] JS提取城市列表为空，尝试解析HTML...")
            html = dp.html
            import re
            # 匹配 href 中含 jobArea=XXXXX 的链接
            city_pattern = re.findall(
                r'href="([^"]*?jobArea[=/](\d+)[^"]*?)"[^>]*>([^<]{2,10})</a>',
                html
            )
            for href, code, name in city_pattern:
                name = name.strip()
                if name and code not in seen_codes and name not in ['全国', '其他']:
                    seen_codes.add(code)
                    cities.append((name, code))

        # 兜底：使用已知城市列表
        if not cities:
            print("[CITY] HTML解析也失败，使用内置城市列表...")
            cities = _get_fallback_cities()

        # 过滤掉全国性选项
        cities = [(n, c) for n, c in cities if n not in ('全国', '其他', '全部', '不限')]

        print(f"[CITY] 前程无忧动态发现 {len(cities)} 个城市: {', '.join([n for n, c in cities[:10]])}{'...' if len(cities) > 10 else ''}")
    except Exception as e:
        print(f"[WARN] 前程无忧城市提取异常: {e}，使用内置城市列表")
        import traceback
        traceback.print_exc()
        cities = _get_fallback_cities()

    return cities


def _get_fallback_cities():
    """兜底城市列表"""
    return [
        ("北京", "010000"), ("上海", "020000"), ("广州", "030200"),
        ("深圳", "040000"), ("天津", "050000"), ("重庆", "060000"),
        ("杭州", "080200"), ("南京", "070200"), ("成都", "090200"),
        ("武汉", "180200"), ("西安", "200200"), ("苏州", "070500"),
        ("青岛", "020300"), ("长沙", "190200"), ("郑州", "160100"),
        ("沈阳", "110200"), ("合肥", "100200"), ("宁波", "080300"),
        ("厦门", "110300"), ("无锡", "070400"), ("福州", "110100"),
        ("济南", "120100"), ("大连", "110400"), ("昆明", "220200"),
        ("哈尔滨", "080100"), ("佛山", "030600"), ("东莞", "030800"),
        ("珠海", "030500"), ("贵阳", "130200"), ("南宁", "230100"),
        ("南昌", "140100"), ("兰州", "210100"), ("乌鲁木齐", "260100"),
        ("银川", "250100"), ("西宁", "240100"), ("呼和浩特", "150100"),
        ("石家庄", "020100"), ("太原", "030100"), ("长春", "070100"),
        ("海口", "230200"), ("绍兴", "080500"), ("嘉兴", "080400"),
        ("金华", "080600"), ("台州", "080700"), ("温州", "090100"),
        ("泉州", "110500"), ("漳州", "110600"), ("唐山", "020200"),
        ("保定", "020400"), ("洛阳", "160200"), ("绵阳", "090300"),
        ("宜昌", "180300"), ("襄阳", "170200"), ("中山", "030700"),
        ("惠州", "030900"), ("汕头", "030300"), ("湛江", "030100"),
        ("桂林", "220100"), ("三亚", "230300"), ("烟台", "120300"),
        ("潍坊", "120200"), ("徐州", "070600"), ("赣州", "140200"),
        ("遵义", "130300"), ("柳州", "230400"), ("岳阳", "180400"),
        ("株洲", "190300"), ("湘潭", "190400"), ("衡阳", "190500"),
        ("邯郸", "020500"), ("沧州", "020600"), ("淮安", "070700"),
        ("上饶", "140300"), ("芜湖", "100300"), ("大庆", "080200"),
        ("吉林", "060200"), ("鞍山", "110100"), ("包头", "150200"),
        ("大同", "030200"), ("盐城", "070800"), ("临沂", "120400"),
        ("济宁", "120500"), ("淄博", "120600"), ("威海", "120700"),
        ("扬州", "070900"), ("镇江", "071000"), ("泰州", "071100"),
        ("宿迁", "071200"), ("廊坊", "020700"), ("秦皇岛", "020800"),
        ("承德", "020900"), ("张家口", "021000"), ("衡水", "021100"),
        ("邢台", "021200"),
    ]


def _extract_jobs_from_html(html_content, city_name):
    """
    从HTML内容中解析岗位信息
    使用BeautifulSoup解析 .joblist-item 元素
    优先从 sensorsdata 属性提取结构化数据
    """
    jobs = []
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        job_items = soup.select('.joblist-item')
        
        for item in job_items:
            try:
                # 优先从 sensorsdata 属性提取（结构化JSON数据）
                sensors_data = item.select_one('[sensorsdata]')
                # 同时尝试从卡片的公司DOM节点提前拉取公司名，供JSON兜底使用
                fallback_company_el = item.select_one('.cname.text-cut')
                fallback_company = fallback_company_el.get_text(strip=True) if fallback_company_el else ''
                if sensors_data:
                    sensors_json = sensors_data.get('sensorsdata', '')
                    if sensors_json:
                        try:
                            import json
                            data = json.loads(sensors_json)
                            job_name = data.get('jobTitle', '')
                            salary = data.get('jobSalary', '')
                            area = data.get('jobArea', '')
                            company_id = data.get('companyId', '')
                            job_id = data.get('jobId', '')
                            # 修复：sensorsdata 中公司名字段通常为 companyName / compName / brandName
                            # 同时兜底使用 DOM 提取，避免 JSON 漏字段导致 company 为空
                            company = (
                                data.get('companyName')
                                or data.get('compName')
                                or data.get('brandName')
                                or data.get('enterpriseName')
                                or data.get('company')
                                or fallback_company
                                or ''
                            ).strip()
                            
                            if job_name:
                                job = {
                                    "data_source": "前程无忧",
                                    "job_name": job_name,
                                    "salary": salary,
                                    "city": area or city_name,
                                    "work_exp": data.get('jobYear', ''),
                                    "education": data.get('jobDegree', ''),
                                    "company": company,
                                    "job_id": f"https://jobs.51job.com/{job_id}.html" if job_id else '',
                                    "job_desc": '',
                                }
                                jobs.append(job)
                                continue  # 成功提取，跳过DOM解析
                        except Exception:
                            pass  # JSON解析失败，回退到DOM解析
                
                # 回退方案：从DOM解析
                # 提取岗位名称
                job_name_el = item.select_one('.jname.text-cut')
                if not job_name_el:
                    job_name_el = item.select_one('.job-info.text-cut')
                job_name = job_name_el.get_text(strip=True) if job_name_el else ''
                
                # 提取薪资
                salary_el = item.select_one('.sal.text-cut')
                salary = salary_el.get_text(strip=True) if salary_el else ''
                
                # 提取地点
                area_el = item.select_one('.area .shrink-0')
                area = area_el.get_text(strip=True) if area_el else ''
                
                # 提取公司
                company_el = item.select_one('.cname.text-cut')
                company = company_el.get_text(strip=True) if company_el else ''
                
                # 提取链接
                link_el = item.select_one('a[href*="jobs.51job.com"]')
                job_id = ''
                if link_el:
                    job_id = link_el.get('href', '')
                
                if job_name:
                    job = {
                        "data_source": "前程无忧",
                        "job_name": job_name,
                        "salary": salary,
                        "city": area or city_name,
                        "work_exp": "",
                        "education": "",
                        "company": company,
                        "job_id": job_id or f"{company}_{job_name}",
                        "job_desc": "",
                    }
                    jobs.append(job)
            except Exception:
                continue
    except Exception as e:
        print(f"[WARN] HTML解析失败: {e}")
    
    return jobs


def _get_current_page_number(html_content):
    """获取当前页码"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        active_el = soup.select_one('.el-pager li.number.active')
        if active_el:
            page_text = active_el.get_text(strip=True)
            if page_text.isdigit():
                return int(page_text)
    except Exception:
        pass
    return None


def _has_next_page(html_content):
    """检查是否有下一页"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        next_btn = soup.select_one('.el-pagination .btn-next')
        if next_btn:
            # 检查是否禁用
            disabled = next_btn.get('disabled') is not None
            # 检查class是否包含disabled
            cls = next_btn.get('class', [])
            if isinstance(cls, list):
                cls_str = ' '.join(cls)
            else:
                cls_str = str(cls)
            if 'disabled' in cls_str.lower():
                return False
            return True
    except Exception:
        pass
    return False


def _get_total_pages(html_content):
    """获取总页数"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        # 查找最后一个数字页码
        page_numbers = soup.select('.el-pager li.number')
        if page_numbers:
            last_num = page_numbers[-1].get_text(strip=True)
            if last_num.isdigit():
                return int(last_num)
    except Exception:
        pass
    return None


def _click_next_page(dp):
    """点击下一页按钮，返回是否成功"""
    try:
        result = dp.run_js('''
        (function() {
            var btn = document.querySelector('.el-pagination .btn-next');
            if (!btn) return {success: false, reason: 'not_found'};
            var disabled = btn.getAttribute('disabled') !== null;
            var cls = btn.className || '';
            if (typeof cls !== 'string') cls = cls.join(' ');
            if (cls.indexOf('disabled') >= 0) return {success: false, reason: 'disabled'};
            btn.click();
            return {success: true};
        })();
        ''')
        return result and result.get('success', False)
    except Exception as e:
        print(f"[WARN] 点击下一页异常: {e}")
        return False


def _click_page_number(dp, page_num):
    """点击指定页码"""
    try:
        result = dp.run_js(f'''
        (function() {{
            var pagers = document.querySelectorAll('.el-pager li.number');
            for (var i = 0; i < pagers.length; i++) {{
                var text = pagers[i].textContent.trim();
                if (text === '{page_num}') {{
                    pagers[i].click();
                    return {{success: true}};
                }}
            }}
            return {{success: false, reason: 'page_not_found'}};
        }})();
        ''')
        return result and result.get('success', False)
    except Exception as e:
        print(f"[WARN] 点击页码 {page_num} 异常: {e}")
        return False


def _wait_for_page_load(dp, wait_time=PAGE_LOAD_WAIT):
    """等待页面加载完成，再执行滚动"""
    # 先等待基础时间
    time.sleep(wait_time)
    
    # 等待页面稳定（检查document.readyState）
    for _ in range(5):
        try:
            ready_state = dp.run_js('document.readyState')
            if ready_state == 'complete':
                break
            time.sleep(1)
        except Exception:
            time.sleep(1)
    
    # 滚动触发懒加载（带异常保护）
    for _ in range(2):
        try:
            dp.run_js('window.scrollTo(0, document.body.scrollHeight)')
            time.sleep(1)
            break
        except Exception:
            time.sleep(2)
    
    # 回到顶部
    for _ in range(2):
        try:
            dp.run_js('window.scrollTo(0, 0)')
            time.sleep(1)
            break
        except Exception:
            time.sleep(2)


def _get_page_html_hash(html_content):
    """获取页面内容的哈希值，用于检测页面是否变化"""
    return hashlib.md5(html_content[:5000].encode('utf-8')).hexdigest()


def crawl_one_city_html(dp, keyword, city_name, city_code):
    """
    前程无忧：单个城市内的持续翻页采集（HTML解析版）
    自动持续翻页，直到无下一页为止
    """
    city_jobs = []
    city_raw_count = 0
    page_num = 1
    consecutive_empty = 0
    last_page_job_ids = set()  # 记录上一页的job_id用于去重

    # 导航到第一页
    base_url = f'https://we.51job.com/pc/search?jobArea={city_code}&keyword={keyword}&searchType=2'
    print(f"[PAGE] 前程无忧 [{city_name}] 第 {page_num} 页 (导航到首页)...")

    nav_success = False
    for nav_attempt in range(3):
        try:
            dp.get(base_url, timeout=60)  # 增加超时到60秒
            _wait_for_page_load(dp, PAGE_LOAD_WAIT + 2)  # 增加等待时间
            _ = dp.html  # 验证连接
            nav_success = True
            break
        except Exception as e:
            print(f"[RETRY] 前程无忧 [{city_name}] 导航尝试 {nav_attempt + 1}/3 失败: {str(e)[:100]}")
            if nav_attempt < 2:
                time.sleep(5)

    if not nav_success:
        print(f"[FAIL] 前程无忧 [{city_name}] 导航失败（3次重试后）")
        crawler_utils.log_crawl_detail("前程无忧", city_name, keyword, 0, 0, 0, 0)
        return city_jobs, 0, 0

    # 获取第一页数据 + 风控判定
    html = dp.html
    try:
        _log_risk_if_any(dp, html, "前程无忧", stage=f"城市首屏-{city_name}-p{page_num}")
    except Exception:
        pass
    jobs = _extract_jobs_from_html(html, city_name)
    
    page_raw_count = len(jobs)
    print(f"[COUNT] 前程无忧 [{city_name}] 第 {page_num} 页【原始抓取条数】: {page_raw_count}")
    
    if page_raw_count == 0:
        consecutive_empty = 1
    else:
        consecutive_empty = 0
        current_ids = set(j.get('job_id', '') for j in jobs)
        last_page_job_ids = current_ids
        
        for job in jobs:
            city_jobs.append(job)
            city_raw_count += 1
    
    print(f"[OK] 前程无忧 [{city_name}] 第 {page_num} 页已采集 → 累计原始: {city_raw_count} 条")

    # 检查是否有下一页
    total_pages = _get_total_pages(html)
    has_next = _has_next_page(html)
    if total_pages:
        print(f"[INFO] 前程无忧 [{city_name}] 总页数: {total_pages}")
    
    # 后续翻页循环
    while consecutive_empty < EMPTY_PAGE_THRESHOLD:
        # 当前页是否已是最后一页
        if total_pages and page_num >= total_pages:
            print(f"[END] 前程无忧 [{city_name}] 已到达最后一页（第{page_num}页）")
            break

        page_num += 1
        print(f"[PAGE] 前程无忧 [{city_name}] 翻页 → 第 {page_num} 页")

        # 方式1: 用JS点击下一页按钮
        page_changed = False
        try:
            result = dp.run_js('''
            (function() {
                var pagers = document.querySelectorAll('.el-pager li.number');
                for (var i = 0; i < pagers.length; i++) {
                    if (pagers[i].textContent.trim() === '{page_num}') {
                        pagers[i].click();
                        return {success: true, method: 'click_number'};
                    }
                }
                var nextBtn = document.querySelector('.btn-next');
                if (nextBtn && nextBtn.getAttribute('disabled') === null) {
                    nextBtn.click();
                    return {success: true, method: 'click_next'};
                }
                return {success: false};
            })();
            '''.format(page_num=page_num))
            page_changed = result and result.get('success', False)
        except Exception:
            pass

        # 方式2: JS翻页失败则用URL跳转
        if not page_changed:
            try:
                dp.get(f'https://we.51job.com/pc/search?jobArea={city_code}&keyword={keyword}&searchType=2&page={page_num}', timeout=60)
                page_changed = True
            except Exception as e:
                print(f"[WARN] 前程无忧 [{city_name}] 翻页失败: {str(e)[:80]}")
                consecutive_empty += 1
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    break
                continue

        # 等待页面渲染
        _wait_for_page_load(dp, PAGE_RENDER_WAIT)

        # 获取当前页数据 + 风控判定
        html = dp.html
        try:
            _log_risk_if_any(dp, html, "前程无忧", stage=f"翻页-{city_name}-p{page_num}")
        except Exception:
            pass
        jobs = _extract_jobs_from_html(html, city_name)
        
        page_raw_count = len(jobs)
        print(f"[COUNT] 前程无忧 [{city_name}] 第 {page_num} 页【原始抓取条数】: {page_raw_count}")
        
        if page_raw_count == 0:
            consecutive_empty += 1
            print(f"[WARN] 前程无忧 [{city_name}] 第 {page_num} 页0条，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
            # 空页时补打一次风控日志
            try:
                _log_risk_if_any(dp, html, "前程无忧", stage=f"空页-{city_name}-p{page_num}")
            except Exception:
                pass
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                break
            continue
        
        # 检查是否与上一页数据完全相同
        current_ids = set(j.get('job_id', '') for j in jobs)
        if current_ids and last_page_job_ids and current_ids == last_page_job_ids:
            print(f"[WARN] 前程无忧 [{city_name}] 第 {page_num} 页数据与上一页完全相同，可能未翻页成功")
            consecutive_empty += 1
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                break
            continue
        
        consecutive_empty = 0
        last_page_job_ids = current_ids
        
        for job in jobs:
            city_jobs.append(job)
            city_raw_count += 1
        
        print(f"[OK] 前程无忧 [{city_name}] 第 {page_num} 页已采集 → 累计原始: {city_raw_count} 条")
        
        # 随机延时
        crawler_utils.random_delay(2.0, 5.0)

    crawler_utils.log_crawl_detail("前程无忧", city_name, keyword, page_num, city_raw_count, city_raw_count, city_raw_count)
    return city_jobs, page_num, city_raw_count


def crawl_51job_all_cities(dp, keyword=KEYWORD, test_cities=None):
    """
    前程无忧：遍历全部城市（动态提取），逐个城市采集

    Args:
        dp: 外部传入的浏览器实例
        keyword: 搜索关键词
        test_cities: 测试模式指定城市列表，如 [("广州","030200"),("深圳","040000")]，None则全量
    """
    all_jobs = []
    total_pages = 0
    total_raw = 0

    if test_cities:
        print(f"[TEST] 前程无忧 测试模式：只跑 {len(test_cities)} 个城市 → {[c[0] for c in test_cities]}")

    print(f"\n{'='*20} 前程无忧（登录态·全城市自动翻页·HTML解析）—— {keyword} {'='*20}")

    # 访问首页并动态提取城市列表
    print("[INIT] 前程无忧 访问首页，提取城市列表...")
    home_success = False
    for home_attempt in range(3):
        try:
            # 使用更长的超时时间
            dp.get('https://we.51job.com/pc/search?keyword={}&searchType=2'.format(keyword), timeout=60)
            _wait_for_page_load(dp, PAGE_LOAD_WAIT + 3)  # 增加等待时间
            
            # 检查是否被重定向到登录页
            current_url = dp.url
            if 'login' in current_url.lower() or 'passport' in current_url.lower():
                print(f"[WARN] 登录态可能已失效，页面被重定向到: {current_url}")
                print("[WARN] 将继续尝试采集（可能数据量受限）")
            
            # 检查页面是否有实际内容 + 风控判定
            html = dp.html
            try:
                _log_risk_if_any(dp, html, "前程无忧", stage=f"全国首页-加载尝试{home_attempt+1}")
            except Exception:
                pass
            if len(html) < 10000:
                print(f"[WARN] 首页HTML内容过短（{len(html)}字节），可能加载不完整")
                time.sleep(3)
            
            home_success = True
            print(f"[INIT] 首页加载成功，URL: {current_url}")
            break
        except Exception as e:
            print(f"[RETRY] 首页加载尝试 {home_attempt + 1}/3 失败: {str(e)[:100]}")
            if home_attempt < 2:
                time.sleep(5)

    if not home_success:
        print("[WARN] 前程无忧首页加载失败，使用兜底城市列表")
        cities = _get_fallback_cities()
    else:
        cities = _extract_all_cities(dp)
        if not cities:
            print("[WARN] 未发现任何城市，使用兜底列表")
            cities = _get_fallback_cities()

    # 测试模式：只跑指定城市，直接覆盖城市列表
    if test_cities:
        cities = test_cities
        print(f"[TEST] 前程无忧 城市列表已覆盖为测试城市: {[c[0] for c in cities]}")

    print(f"[INFO] 前程无忧将依次遍历 {len(cities)} 个城市")
    print(f"[INFO] 城市列表: {', '.join([n for n, c in cities[:20]])}{'...' if len(cities) > 20 else ''}")

    browser_alive = True
    try:
        for city_idx, (city_name, city_code) in enumerate(cities, 1):
            # 检查浏览器连接
            try:
                _ = dp.html
            except Exception:
                print(f"[ALERT] 浏览器连接已断开，停止采集")
                browser_alive = False
                break

            print(f"\n[CITY {city_idx}/{len(cities)}] 前程无忧 开始采集：{city_name}（code={city_code}）")

            city_jobs = []
            city_pages = 0
            city_raw = 0
            for attempt in range(1, MAX_RETRY + 1):
                try:
                    city_jobs, city_pages, city_raw = crawl_one_city_html(
                        dp, keyword, city_name, city_code
                    )
                    if city_jobs or city_raw > 0:
                        break
                    else:
                        print(f"[WARN] 前程无忧 [{city_name}] 第 {attempt} 次采集返回0条")
                except Exception as e:
                    print(f"[FAIL] 前程无忧 [{city_name}] 第 {attempt} 次采集出错: {e}")
                    import traceback
                    traceback.print_exc()
                if attempt < MAX_RETRY:
                    crawler_utils.random_delay(5.0, 10.0)

            all_jobs.extend(city_jobs)
            total_pages += city_pages
            total_raw += city_raw
            print(f"[CITY-DONE] 前程无忧 [{city_name}] 完成：页数={city_pages}, 原始条数={city_raw}")

            # 城市间随机延时
            crawler_utils.random_delay(3.0, 7.0)
    except Exception as e:
        print(f"[FAIL] 城市遍历异常: {e}")
        import traceback
        traceback.print_exc()

    if not browser_alive:
        print("[ALERT] 浏览器连接曾断开，已提前终止采集")

    print(f"\n[SUMMARY] 前程无忧 全部城市采集完成：遍历城市数={len(cities)}, 总页数={total_pages}, 原始未去重条数={total_raw}")
    crawler_utils.log_crawl_detail("前程无忧", "全部城市", keyword, total_pages, total_raw, total_raw, total_raw)
    return all_jobs


def main():
    """主流程：采集 → 后置过滤 → 去重 → 历史快照 → 覆盖主文件"""
    print("\n" + "=" * 60)
    print("【登录态全量采集】前程无忧爬虫启动 - " + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("关键词固定：计算机")
    print("模式：登录态 + 全城市 + 自动翻页（无页数上限）")
    print("解析方式：HTML解析（BeautifulSoup）")
    print("=" * 60)

    dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
    try:
        all_jobs = crawl_51job_all_cities(dp, KEYWORD)
    finally:
        try:
            dp.quit()
        except:
            pass

    print(f"\n[COLLECT] 前程无忧 采集完成，原始汇总: {len(all_jobs)} 条")

    # 后置处理
    project_root = Path(__file__).parent.parent.absolute()
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=project_root, save_csv=True, date_str=date_str
    )

    crawler_utils.log_global_summary(final_jobs, snapshot_path, {
        "前程无忧": {"total_pages": 0, "raw_count": len(all_jobs)}
    })

    print(f"\n[DONE] 前程无忧完成 - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[STATS] 本次共获取 {len(final_jobs)} 条岗位数据（去重+过滤后）")
    print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
    print(f"[MAIN] 主文件已覆盖：{main_path}")


if __name__ == '__main__':
    main()
