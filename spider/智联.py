# -*- coding: utf-8 -*-
"""
智联招聘爬虫（DrissionPage版·登录态）—— 【全国自动翻页】
- 使用用户已登录的Chrome profile，携带登录态采集更多数据
- 固定全国URL，自动持续翻页直到无下一页
- 多选择器兼容岗位列表，支持页面DOM解析
- 终止条件：无下一页 / 连续3页无数据（不设页数上限）

核心修复：
- 登录态采集：使用用户Chrome profile，cookies自动携带
- 无分页上限：自动翻页直到无下一页，不限制页数
- 翻页验证：点击后验证页面确实变化，防止原地踏步
"""
import sys
import time
import re
import datetime
from pathlib import Path
from urllib.parse import quote

from bs4 import BeautifulSoup

# 导入共享工具模块
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
import crawler_utils


# ================== 风控判定日志工具 ==================
def _log_risk_if_any(dp, html: str, site: str, stage: str):
    """
    风险控制统一判定：检测到异常迹象时打印 [RISK] 标记日志
    判定维度：
    1. URL 被重定向到登录 / passport / 验证码页
    2. HTML 内容过短（< 5000 字节且非空）
    3. 页面文本中出现「验证码 / 验证 / captcha / 安全验证 / 访问受限 / 429 / 403」
    """
    risk_flags = []
    try:
        current_url = (dp.url or '').lower()
        if any(k in current_url for k in ['login', 'passport', 'captcha', 'verify', 'auth', 'safe']):
            risk_flags.append(f"URL重定向到登录/验证页: {current_url[:120]}")
    except Exception:
        pass

    if html and len(html) < 5000:
        risk_flags.append(f"HTML内容过短: {len(html)}字节（正常页面通常>20KB）")

    if html:
        html_lower = html.lower()
        for kw in ['验证码', '验证', 'captcha', '安全验证', '访问受限', '访问过于频繁',
                   '"code":403', '"code":429', 'status: 403', 'status: 429',
                   '403 forbidden', '429 too many', 'risk']:
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

# 智联岗位列表选择器（多选择器兼容，按优先级尝试）
JOB_LIST_SELECTORS = [
    ".job-card",
    ".job-card-box",
    ".joblist-box__item",
    ".joblist-item",
    ".iteminfo",
    "[class*='joblist'] [class*='item']",
    "div[data-positionid]",
]

# 岗位卡片内部字段选择器
CARD_FIELD_SELECTORS = {
    "job_name": ".job-card__title-clamp span",
    "salary": ".job-card__salary",
    "company": ".job-card__company-name",
    "location": ".job-card__location span",
    "tags": ".job-card__skill-tag",
}

# 下一页按钮选择器
NEXT_PAGE_SELECTORS = [
    "text:下一页",
    "css:a:has-text('下一页')",
    "css:.btn-next",
    "css:.pagination-next",
    "css:.pager .next",
    "css:.pager-next",
    "css:a[class*='next']",
]


def _find_next_button(dp):
    """查找下一页按钮，返回按钮元素或None（自动过滤disabled状态）"""
    for sel in NEXT_PAGE_SELECTORS:
        try:
            btn = dp.ele(sel, timeout=0.5)
            if btn and btn.is_displayed:
                # 检查是否禁用
                try:
                    cls = btn.attr("class") or ""
                    if isinstance(cls, list):
                        cls = " ".join(cls)
                    if "disabled" in cls.lower():
                        continue
                except Exception:
                    pass
                # 检查disabled属性
                try:
                    if btn.attr("disabled") is not None:
                        continue
                except Exception:
                    pass
                return btn
        except Exception:
            continue
    return None


def _scroll_load_more(dp, rounds=3):
    """滚动页面加载更多内容"""
    for _ in range(rounds):
        try:
            dp.run_js("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.5)
        except Exception:
            pass


def _wait_for_job_list(dp, selectors, timeout=10):
    """等待岗位列表加载，返回使用的选择器"""
    start = time.time()
    while time.time() - start < timeout:
        for sel in selectors:
            try:
                eles = dp.eles(sel, timeout=0.5)
                if eles and len(eles) > 0:
                    return sel
            except Exception:
                continue
        time.sleep(1)
    return None


def _parse_jobs_from_html(html, city_default=""):
    """从HTML中解析智联岗位列表"""
    jobs = []
    soup = BeautifulSoup(html, "html.parser")

    # 优先使用新的 .job-card 结构
    cards = soup.find_all("div", class_="job-card")
    if not cards:
        cards = soup.find_all("div", class_="joblist-box__item")
    if not cards:
        cards = soup.find_all("div", class_="joblist-item")
    if not cards:
        cards = soup.find_all("div", class_="iteminfo")
    if not cards:
        cards = soup.find_all("div", class_="job-card-box")
    if not cards:
        for tag in soup.find_all("div"):
            class_name = " ".join(tag.get("class", []))
            if "joblist" in class_name and "item" in class_name:
                cards.append(tag)

    for card in cards:
        try:
            job_name = ""
            salary = ""
            city = ""
            work_year = ""
            education = ""
            company_name = ""
            job_id = ""
            href = ""

            # 优先使用新结构选择器
            # 岗位名
            title_span = card.select_one(".job-card__title-clamp span")
            if title_span:
                job_name = title_span.get_text(strip=True)
            
            # 岗位名兜底
            if not job_name:
                job_name_tag = card.find("a", target="_blank")
                if job_name_tag:
                    job_name = job_name_tag.get_text(strip=True)
                    href = job_name_tag.get("href", "")
                if not job_name:
                    for tag in card.find_all(["h1", "h2", "h3", "span", "a", "div"]):
                        cls = " ".join(tag.get("class", []))
                        if "job-name" in cls or "jobtitle" in cls.lower():
                            job_name = tag.get_text(strip=True)
                            if tag.name == "a":
                                href = tag.get("href", "")
                            break
                    if not job_name:
                        for tag in card.find_all(["a", "span", "h1", "h2", "h3", "div"]):
                            text = tag.get_text(strip=True)
                            if 2 < len(text) < 50 and "经验" not in text and "学历" not in text and "薪资" not in text:
                                job_name = text
                                if tag.name == "a":
                                    href = tag.get("href", "")
                                break

            # 薪资 - 优先使用新结构
            salary_tag = card.select_one(".job-card__salary")
            if salary_tag:
                salary = salary_tag.get_text(strip=True)
            if not salary:
                for tag in card.find_all(["p", "span", "div"]):
                    cls = " ".join(tag.get("class", []))
                    text = tag.get_text(strip=True)
                    if "salary" in cls.lower() or ("-" in text and ("K" in text.upper() or "万" in text or "元" in text)):
                        salary = text
                        break

            # 公司名 - 优先使用新结构
            company_tag = card.select_one(".job-card__company-name")
            if company_tag:
                company_name = company_tag.get_text(strip=True).strip()
                href = company_tag.get("href", "") or href
            if not company_name:
                old_company = card.find("a", class_="company-name")
                if old_company:
                    company_name = old_company.get_text(strip=True)
                if not company_name:
                    for tag in card.find_all(["a", "span", "div"]):
                        cls = " ".join(tag.get("class", []))
                        if "company" in cls.lower() or "compname" in cls.lower():
                            text = tag.get_text(strip=True)
                            if text and len(text) > 2:
                                company_name = text
                                break

            # 城市 - 优先使用新结构
            location_tag = card.select_one(".job-card__location span")
            if location_tag:
                city = location_tag.get_text(strip=True)
            if not city:
                # 城市、经验、学历（旧结构）
                info_items = card.find_all("div", class_="jobinfo__other-info-item")
                if not info_items:
                    info_items = card.find_all("span", class_="info-item") or card.find_all("div", class_="info")
                if not info_items:
                    info_items = card.find_all("li", class_="tag") or card.find_all(["span", "div", "li"])
                info_texts = []
                for item in info_items[:5]:
                    t = item.get_text(strip=True)
                    if t and t not in info_texts:
                        info_texts.append(t)

                for t in info_texts:
                    if not city and crawler_utils.extract_city(t):
                        city = t
                    elif not work_year and ("经验" in t or re.match(r'^\d+(-\d+)?年', t)):
                        work_year = t
                    elif not education and (t in ["本科", "硕士", "博士", "大专", "中专", "高中", "初中及以下", "不限"] or "学历" in t):
                        education = t

                # 城市兜底
                if not city:
                    for t in info_texts:
                        if t and len(t) < 10 and "经验" not in t and "学历" not in t:
                            city = t
                            break

            if city:
                city = crawler_utils.extract_city(city)

            # 技能标签提取（新结构）
            skill_tags = card.select(".job-card__skill-tag")
            if skill_tags and not work_year:
                for tag in skill_tags:
                    text = tag.get_text(strip=True)
                    if not education and text in ["本科", "硕士", "博士", "大专", "中专", "高中", "初中及以下", "不限"]:
                        education = text
                    if not work_year and re.match(r'^\d+(-\d+)?年', text):
                        work_year = text

            # 岗位ID
            if href:
                job_id = href
                m = re.search(r'/(\w+)\.htm', href) or re.search(r'positionId=([^&]+)', href)
                if m:
                    job_id = m.group(1)
            if not job_id:
                job_id = f"{company_name}_{job_name}"

            if job_name:
                jobs.append({
                    "data_source": "智联",
                    "job_name": job_name,
                    "salary": salary,
                    "city": city or city_default,
                    "work_exp": work_year,
                    "education": education,
                    "company": company_name,
                    "job_id": job_id,
                })
        except Exception:
            continue

    return jobs


def crawl_zhaopin(keyword=KEYWORD, dp=None, max_pages=None):
    """
    智联招聘：全国无地域限制全量采集
    使用登录态Chrome profile，自动持续翻页直到无下一页

    Args:
        keyword: 搜索关键词（默认"计算机"）
        dp: 可选外部浏览器实例（DrissionPage ChromiumPage）。
            若传入 dp：函数内部不创建也不销毁浏览器实例，生命周期由调用方管理。
            若为 None：函数内部自行 create_logged_in_browser，finally 自动 quit（单文件运行兼容）。
        max_pages: 最大翻页数（测试用），None表示不限制
    """
    jobs = []
    raw_count = 0
    consecutive_empty = 0
    page_num = 1
    _owns_browser = (dp is None)  # 是否由本函数持有浏览器所有权

    if max_pages:
        print(f"[TEST] 智联 测试模式：最多只跑 {max_pages} 页")
    print(f"\n{'='*20} 智联招聘（登录态·全国自动翻页）—— {keyword} {'='*20}")

    if _owns_browser:
        dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
    try:
        # 访问智联首页（使用登录态）
        print("[PAGE] 智联 访问首页（登录态）...")
        try:
            dp.get("https://www.zhaopin.com/", timeout=30)
            time.sleep(3)
        except Exception as e:
            print(f"[WARN] 智联首页加载失败: {e}")

        # 跳转全国搜索页
        search_url = f"https://sou.zhaopin.com/?kw={quote(keyword)}&p=1"
        print(f"[SEARCH] 智联 全国搜索页 (第1页)")
        dp.get(search_url, timeout=30)
        time.sleep(5)
        _scroll_load_more(dp, rounds=3)
        try:
            _log_risk_if_any(dp, dp.html, "智联", stage=f"搜索首屏-p{page_num}")
        except Exception:
            pass

        # 找到岗位列表选择器
        used_selector = _wait_for_job_list(dp, JOB_LIST_SELECTORS, timeout=15)
        if not used_selector:
            print("[WARN] 智联 未找到岗位列表，尝试刷新...")
            dp.refresh()
            time.sleep(5)
            _scroll_load_more(dp, rounds=3)
            used_selector = _wait_for_job_list(dp, JOB_LIST_SELECTORS, timeout=15)

        if not used_selector:
            # 风控判定：列表为空且页面异常
            try:
                _log_risk_if_any(dp, dp.html, "智联", stage="岗位列表加载失败")
            except Exception:
                pass
            print("[FAIL] 智联 仍未找到岗位列表，跳过")
            return jobs
        print(f"[OK] 智联 使用岗位列表选择器: {used_selector}")

        last_page_html = ""

        while consecutive_empty < EMPTY_PAGE_THRESHOLD:
            # 测试模式：达到最大页数则停止
            if max_pages and page_num > max_pages:
                print(f"[TEST] 智联 已达测试最大页数 {max_pages}，停止翻页")
                break
            print(f"\n[PAGE] 智联 第 {page_num} 页...")

            # 滚动加载+等待稳定
            _scroll_load_more(dp, rounds=2)
            last_count = 0
            for _ in range(5):
                try:
                    eles = dp.eles(used_selector, timeout=1)
                    now_count = len(eles) if eles else 0
                except Exception:
                    now_count = 0
                if now_count == last_count:
                    break
                last_count = now_count
                _scroll_load_more(dp, rounds=1)

            # 取页面HTML解析 + 风控判定
            html = dp.html
            try:
                _log_risk_if_any(dp, html, "智联", stage=f"翻页采集-p{page_num}")
            except Exception:
                pass
            page_jobs = _parse_jobs_from_html(html)
            page_raw_count = len(page_jobs)
            print(f"[COUNT] 智联 第 {page_num} 页【原始抓取条数】: {page_raw_count}")

            # 检查页面是否与上一页相同（防止原地踏步）
            if html == last_page_html and page_num > 1:
                print(f"[WARN] 智联 第 {page_num}页HTML与上一页完全相同，可能未翻页成功")
                consecutive_empty += 1
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    print(f"[END] 智联 连续{EMPTY_PAGE_THRESHOLD}页相同，判定采集结束")
                    break
                continue
            last_page_html = html

            if page_raw_count == 0:
                consecutive_empty += 1
                print(f"[WARN] 智联 第 {page_num} 页无岗位，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    print(f"[END] 智联 连续{EMPTY_PAGE_THRESHOLD}页无新岗位，判定采集结束")
                    break
            else:
                consecutive_empty = 0
                jobs.extend(page_jobs)
                raw_count += page_raw_count

            print(f"[OK] 智联 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")
            crawler_utils.random_delay(2.0, 5.0)

            # 翻页：点击下一页（带disabled检查）
            next_btn = _find_next_button(dp)
            if next_btn is None:
                print("[END] 智联 没有下一页按钮，结束")
                break

            try:
                next_btn.click()
                page_num += 1
                print(f"[CLICK] 智联 点击下一页 → 第 {page_num} 页")
                time.sleep(4)
                _scroll_load_more(dp, rounds=2)
            except Exception as e:
                print(f"[WARN] 智联 点击下一页失败: {e}，结束")
                break

    except Exception as e:
        print(f"[FAIL] 智联爬取出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 仅当浏览器实例由本函数创建时才负责 quit（统一 run_all 外部管理生命周期避免资源冲突）
        if _owns_browser:
            try:
                dp.quit()
            except Exception:
                pass

    print(f"[SUMMARY] 智联采集完成：总遍历页数={page_num}, 原始未去重条数={raw_count}")
    crawler_utils.log_crawl_detail("智联", "全国", keyword, page_num, raw_count, raw_count, raw_count)
    return jobs


def main():
    """单独运行智联爬虫入口"""
    print("\n" + "=" * 60)
    print("【登录态全量采集】智联爬虫启动 - " + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("关键词固定：计算机")
    print("模式：登录态 + 全国自动翻页（无页数上限）")
    print("=" * 60)

    all_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] 智联 第 {attempt}/{MAX_RETRY} 次尝试...")
        try:
            all_jobs = crawl_zhaopin(KEYWORD)
            if all_jobs:
                break
            print(f"[WARN] 智联 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] 智联 第 {attempt} 次采集出错: {e}")
        if attempt < MAX_RETRY:
            crawler_utils.random_delay(5.0, 10.0)

    print(f"\n[COLLECT] 智联 采集完成，原始汇总: {len(all_jobs)} 条")

    project_root = Path(__file__).parent.parent.absolute()
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=project_root, save_csv=True, date_str=date_str
    )

    crawler_utils.log_global_summary(final_jobs, snapshot_path, {
        "智联": {"total_pages": 0, "raw_count": len(all_jobs)}
    })

    print(f"\n[DONE] 智联完成 - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[STATS] 本次共获取 {len(final_jobs)} 条岗位数据（去重+过滤后）")
    print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
    print(f"[MAIN] 主文件已覆盖：{main_path}")


if __name__ == '__main__':
    main()
