# -*- coding: utf-8 -*-
"""
猎聘网爬虫（DrissionPage版·登录态）—— 【全国URL分页自动翻页】
- 使用用户已登录的Chrome profile，携带登录态采集更多数据
- URL分页方式：使用 currentPage 参数，全国无地域限制
- 自动持续翻页，直到无下一页为止（不设页数上限）
- 监听 searchfront4c.pc-search-job API 接口获取结构化数据
- 终止条件：无下一页 / 连续3页无数据

核心修复：
- 登录态采集：使用用户Chrome profile，cookies自动携带
- 无分页上限：自动翻页直到无下一页，不限制页数
- 翻页验证：每页验证URL确实变化，防止原地踏步
- listen队列管理：每页前清空旧缓存，防止取到上一页数据
"""
import sys
import time
import json
import datetime
from pathlib import Path
from urllib.parse import quote

from DrissionPage import ChromiumPage  # noqa: F401  (间接依赖，DrissionPage 异常透传)

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
    if html and len(html) < 5000:
        risk_flags.append(f"HTML内容过短: {len(html)}字节（正常页面通常>20KB）")
    if html:
        html_lower = html.lower()
        for kw in ['验证码', '验证', 'captcha', '安全验证', '访问受限', '访问过于频繁',
                   '"code":403', '"code":429', 'status: 403', 'status: 429',
                   '403 forbidden', '429 too many', '"status": false', '"success":false']:
            if kw in html_lower or kw in html:
                risk_flags.append(f"页面命中风控关键词: {kw}")
                break
    if risk_flags:
        for flag in risk_flags:
            print(f"[RISK] [{site}] ({stage}) {flag}")
        return True
    return False


def _drain_listen_queue(dp, timeout_per_item: float = 0.4):
    """
    清空 DrissionPage listen 队列（翻页缓存清理）
    原理：循环非阻塞地取出所有已到达但未消费的 API 响应，直到队列为空。
    避免下一页拿到「上一页遗留的旧 searchfront4c 响应」造成数据错乱。
    """
    drained = 0
    while True:
        try:
            dp.listen.wait(timeout=timeout_per_item)
            drained += 1
        except Exception:
            break
    if drained > 0:
        print(f"[LISTEN] 猎聘 清空旧响应 {drained} 条（翻页防串页）")
    return drained


# ================== 配置区 ==================
KEYWORD = "计算机"
EMPTY_PAGE_THRESHOLD = 3  # 连续3页0条新岗位才判定采集结束
MAX_RETRY = 3  # 单站点最多重试次数


def _parse_liepin_api_response(resp):
    """解析猎聘API响应，提取岗位列表"""
    try:
        json_data = resp.response.body
        if isinstance(json_data, str):
            json_data = json.loads(json_data)
        items = json_data.get('data', {}).get('data', {}).get('jobCardList', [])
        return items
    except Exception:
        return []


def _wait_for_liepin_api(dp, timeout=15):
    """循环等待猎聘API返回有效岗位数据"""
    wait_start = time.time()
    while time.time() - wait_start < timeout:
        try:
            resp = dp.listen.wait(timeout=2)
            items = _parse_liepin_api_response(resp)
            if items:
                return items
        except Exception:
            continue
    return None


def _extract_liepin_job(card):
    """从猎聘API返回的jobCard中提取岗位信息"""
    try:
        job_info = card.get("job", {})
        comp_info = card.get("comp", {})
        city_raw = job_info.get('dq', '')
        city = crawler_utils.extract_city(city_raw)
        return {
            "data_source": "猎聘",
            "job_name": job_info.get('title', ''),
            "salary": job_info.get('salary', ''),
            "city": city,
            "work_exp": job_info.get('requireWorkYears', ''),
            "education": job_info.get('requireEduLevel', ''),
            "company": comp_info.get('compName', ''),
            "job_id": job_info.get('jobId', '') or f"{comp_info.get('compName', '')}_{job_info.get('title', '')}",
        }
    except Exception:
        return None


def _close_popups(dp):
    """尝试关闭猎聘弹窗（登录、广告等）"""
    close_selectors = [
        'css:.login-close',
        'css:.lp-login-close',
        'css:[class*="close"]',
        'css:.modal-close',
        'css:.dialog-close',
        'text:关闭',
    ]
    for sel in close_selectors:
        try:
            btn = dp.ele(sel, timeout=0.5)
            if btn and btn.is_displayed:
                btn.click()
                time.sleep(0.5)
        except Exception:
            continue


def _has_next_page(dp):
    """
    检查猎聘是否有下一页按钮
    猎聘使用 <a class="btn"> 按钮，最后一页按钮带 disabled 属性
    """
    next_selectors = [
        'css:a.pager-next',
        'css:a.next',
        'css:.pagination a.next',
        'css:li.next a',
        'css:a[class*="next"]',
        'text:下一页',
    ]
    for sel in next_selectors:
        try:
            btn = dp.ele(sel, timeout=0.5)
            if btn and btn.is_displayed:
                # 检查是否禁用
                try:
                    cls = btn.attr("class") or ""
                    if isinstance(cls, list):
                        cls = " ".join(cls)
                    if "disabled" in cls.lower():
                        return False
                except Exception:
                    pass
                try:
                    if btn.attr("disabled") is not None:
                        return False
                except Exception:
                    pass
                return True
        except Exception:
            continue
    return False


def crawl_liepin(keyword=KEYWORD, dp=None, max_pages=None):
    """
    猎聘网：URL分页（currentPage参数），全国无地域限制全量采集
    使用登录态Chrome profile，自动持续翻页直到无下一页

    Args:
        keyword: 搜索关键词（默认"计算机"）
        dp: 可选外部浏览器实例（DrissionPage ChromiumPage）。
            若传入 dp：函数内部不创建也不销毁浏览器实例，生命周期由调用方管理。
            若为 None：函数内部自行 create_logged_in_browser，finally 自动 quit。
        max_pages: 最大翻页数（测试用），None表示不限制
    """
    jobs = []
    raw_count = 0
    consecutive_empty = 0
    page_num = 1
    _owns_browser = (dp is None)

    if max_pages:
        print(f"[TEST] 猎聘 测试模式：最多只跑 {max_pages} 页")
    print(f"\n{'='*20} 猎聘网（登录态·全国URL分页）—— {keyword} {'='*20}")

    if _owns_browser:
        dp = crawler_utils.create_logged_in_browser(use_user_profile=True)
    try:
        # 启动API监听（必须在导航前启动）
        dp.listen.start('com.liepin.searchfront4c.pc-search-job')

        # 先访问猎聘首页（使用登录态）
        print("[PAGE] 猎聘 访问首页（登录态）...")
        try:
            dp.get("https://www.liepin.com/", timeout=30)
        except Exception as e:
            print(f"[WARN] 猎聘首页加载超时: {e}，继续尝试搜索页")
        time.sleep(3)
        _close_popups(dp)
        time.sleep(1)

        while consecutive_empty < EMPTY_PAGE_THRESHOLD:
            # 测试模式：达到最大页数则停止
            if max_pages and page_num > max_pages:
                print(f"[TEST] 猎聘 已达测试最大页数 {max_pages}，停止翻页")
                break
            # 检查是否有下一页
            if page_num > 1 and not _has_next_page(dp):
                print(f"[END] 猎聘 第{page_num}页后无下一页按钮，判定采集结束")
                break

            # 【关键】翻页前先清空 listen 队列，避免取到上一页遗留的旧API响应造成串页
            _drain_listen_queue(dp, timeout_per_item=0.3)

            url = f"https://www.liepin.com/zhaopin/?key={quote(keyword)}&currentPage={page_num}"
            print(f"[PAGE] 猎聘 URL分页 第 {page_num} 页...")

            try:
                dp.get(url, timeout=30)
                time.sleep(3)
                dp.run_js('window.scrollTo(0, document.body.scrollHeight)')
                time.sleep(1)
            except Exception as e:
                print(f"[WARN] 猎聘 第 {page_num} 页导航失败: {e}")
                consecutive_empty += 1
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    break
                page_num += 1
                crawler_utils.random_delay(3.0, 6.0)
                continue

            # 风控判定 + HTML层面异常检查
            try:
                page_html = dp.html
                _log_risk_if_any(dp, page_html, "猎聘", stage=f"URL分页-p{page_num}")
            except Exception:
                pass

            # 等待API数据
            items = _wait_for_liepin_api(dp, timeout=15)
            if items is None:
                consecutive_empty += 1
                print(f"[WARN] 猎聘 第 {page_num} 页未获取数据（可能风控），连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                # 再做一次风控定位
                try:
                    _log_risk_if_any(dp, dp.html, "猎聘", stage=f"API无数据-p{page_num}")
                except Exception:
                    pass
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    print(f"[END] 猎聘 连续{EMPTY_PAGE_THRESHOLD}页无数据，判定采集结束")
                    break
                page_num += 1
                crawler_utils.random_delay(3.0, 6.0)
                continue

            page_raw_count = len(items)
            print(f"[COUNT] 猎聘 第 {page_num} 页【原始抓取条数】: {page_raw_count}")

            if page_raw_count == 0:
                consecutive_empty += 1
                print(f"[WARN] 猎聘 第 {page_num} 页0条岗位，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
                if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                    print(f"[END] 猎聘 连续{EMPTY_PAGE_THRESHOLD}页0条，判定采集结束")
                    break
            else:
                consecutive_empty = 0
                for card in items:
                    job = _extract_liepin_job(card)
                    if job:
                        jobs.append(job)
                        raw_count += 1

            print(f"[OK] 猎聘 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")
            crawler_utils.random_delay(2.0, 5.0)
            page_num += 1

        dp.listen.stop()

    except Exception as e:
        print(f"[FAIL] 猎聘爬取出错: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 无论外部/内部持有浏览器，都先尝试关闭 listen（幂等）
        try:
            dp.listen.stop()
        except Exception:
            pass
        # 仅当浏览器实例由本函数创建时才负责 quit
        if _owns_browser:
            try:
                dp.quit()
            except Exception:
                pass

    print(f"[SUMMARY] 猎聘采集完成：总遍历页数={page_num - 1}, 原始未去重条数={raw_count}")
    crawler_utils.log_crawl_detail("猎聘", "全国", keyword, page_num - 1, raw_count, raw_count, raw_count)
    return jobs


def main():
    """单独运行猎聘爬虫入口"""
    print("\n" + "=" * 60)
    print("【登录态全量采集】猎聘爬虫启动 - " + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("关键词固定：计算机")
    print("模式：登录态 + 全国URL分页（无页数上限）")
    print("=" * 60)

    all_jobs = []
    for attempt in range(1, MAX_RETRY + 1):
        print(f"[RETRY] 猎聘 第 {attempt}/{MAX_RETRY} 次尝试...")
        try:
            all_jobs = crawl_liepin(KEYWORD)
            if all_jobs:
                break
            print(f"[WARN] 猎聘 第 {attempt} 次采集返回0条")
        except Exception as e:
            print(f"[FAIL] 猎聘 第 {attempt} 次采集出错: {e}")
        if attempt < MAX_RETRY:
            crawler_utils.random_delay(5.0, 10.0)

    print(f"\n[COLLECT] 猎聘 采集完成，原始汇总: {len(all_jobs)} 条")

    project_root = Path(__file__).parent.parent.absolute()
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=project_root, save_csv=True, date_str=date_str
    )

    crawler_utils.log_global_summary(final_jobs, snapshot_path, {
        "猎聘": {"total_pages": 0, "raw_count": len(all_jobs)}
    })

    print(f"\n[DONE] 猎聘完成 - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[STATS] 本次共获取 {len(final_jobs)} 条岗位数据（去重+过滤后）")
    print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
    print(f"[MAIN] 主文件已覆盖：{main_path}")


if __name__ == '__main__':
    main()
