# -*- coding: utf-8 -*-
"""
猎聘网爬虫（DrissionPage版）—— 【无地域限制全量采集】
- 取消一切地区筛选、城市限制，采集该岗位关键词下平台开放的全部地域岗位数据
- URL分页方式（使用currentPage参数，沿用已修复方案，不使用点击下一页模式）
- 自动持续翻页，连续3页0条新岗位才判定采集结束
- 单站点最多3次重试防卡死
- 每页随机延时 + 反爬适配
- 采集完成后：后置过滤非IT岗位 → 去重 → 历史快照 → 覆盖 all_cleaned_jobs.json
- 关键词固定仅【计算机】
"""
import sys
import csv
import time
import json
import random
import datetime
from pathlib import Path
from urllib.parse import quote

from DrissionPage import ChromiumPage
from pprint import pprint

# 导入共享工具模块
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
import crawler_utils

# ================== 配置区 ==================
KEYWORD = "计算机"
EMPTY_PAGE_THRESHOLD = 3  # 连续3页0条新岗位才判定采集结束
MAX_RETRY = 3  # 单站点最多重试次数


def crawl_liepin(dp, keyword=KEYWORD):
    """猎聘网：URL分页方式，无地域限制全量采集"""
    jobs = []
    raw_count = 0

    print(f"\n{'='*20} 猎聘网（无地域限制全量采集·URL分页）—— {keyword} {'='*20}")

    # 监听数据包（用完整唯一关键词，精准匹配岗位接口）
    # 持续保持监听，不在页间stop/start，避免丢失请求
    dp.listen.start('com.liepin.searchfront4c.pc-search-job')

    page_num = 1
    consecutive_empty = 0

    while True:
        # 构建分页URL（无地域参数，全量采集，使用currentPage参数）
        url = f'https://www.liepin.com/zhaopin/?key={quote(keyword)}&currentPage={page_num}'
        print(f"[PAGE] 猎聘 URL分页 第 {page_num} 页...")

        try:
            dp.get(url)
            time.sleep(3)
        except Exception as e:
            print(f"[WARN] 猎聘 第 {page_num} 页导航失败: {e}")
            consecutive_empty += 1
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                print(f"[END] 猎聘 连续{EMPTY_PAGE_THRESHOLD}页无数据，结束")
                break
            page_num += 1
            crawler_utils.random_delay(3.0, 6.0)
            continue

        # 循环等待，直到抓到当前页的岗位数据接口，跳过配置接口
        api_captured = False
        wait_start = time.time()
        json_data = None
        while time.time() - wait_start < 12:  # 等待12秒（沿用修复方案）
            try:
                resp = dp.listen.wait(timeout=2)
                json_data = resp.response.body
                # 判断是否是岗位数据接口
                if isinstance(json_data, dict) and 'data' in json_data and 'data' in json_data['data'] and 'jobCardList' in json_data['data']['data']:
                    api_captured = True
                    break
                else:
                    continue
            except Exception:
                continue

        if not api_captured or json_data is None:
            # 区分「平台无岗位」和「风控拦截导致拿不到数据」
            consecutive_empty += 1
            print(f"[WARN] 猎聘 第 {page_num} 页未获取数据（可能风控拦截），连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                print(f"[END] 猎聘 连续{EMPTY_PAGE_THRESHOLD}页无数据，判定采集结束")
                break
            page_num += 1
            crawler_utils.random_delay(2.0, 5.0)
            continue

        # 提取当前页信息列表
        try:
            jobCardList = json_data['data']['data']['jobCardList']
        except (KeyError, TypeError):
            jobCardList = []

        page_raw_count = len(jobCardList)
        print(f"[COUNT] 猎聘 第 {page_num} 页【原始抓取条数】: {page_raw_count}")

        if page_raw_count == 0:
            consecutive_empty += 1
            print(f"[WARN] 猎聘 第 {page_num} 页0条岗位，连续空页 {consecutive_empty}/{EMPTY_PAGE_THRESHOLD}")
            if consecutive_empty >= EMPTY_PAGE_THRESHOLD:
                print(f"[END] 猎聘 连续{EMPTY_PAGE_THRESHOLD}页0条，判定采集结束")
                break
        else:
            consecutive_empty = 0
            for jobCard in jobCardList:
                job_info = jobCard.get("job", {})
                comp_info = jobCard.get("comp", {})
                # 城市字段修复：猎聘dq字段可能为"城市-区域"，提取主城市
                city_raw = job_info.get('dq', '')
                city = crawler_utils.extract_city(city_raw)

                job = {
                    "data_source": "猎聘",
                    "job_name": job_info.get('title', ''),
                    "salary": job_info.get('salary', ''),
                    "city": city,
                    "work_exp": job_info.get('requireWorkYears', ''),
                    "education": job_info.get('requireEduLevel', ''),
                    "company": comp_info.get('compName', ''),
                    "job_id": job_info.get('jobId', '') or f"{comp_info.get('compName', '')}_{job_info.get('title', '')}",
                }
                jobs.append(job)
                raw_count += 1
                pprint(job)

        print(f"[OK] 猎聘 第 {page_num} 页已采集 → 累计原始: {raw_count} 条")

        # 随机延时（反爬适配）
        crawler_utils.random_delay(2.0, 5.0)
        page_num += 1

    dp.listen.stop()
    print(f"\n[SUMMARY] 猎聘 采集完成：总遍历页数={page_num}, 原始未去重条数={raw_count}")
    crawler_utils.log_crawl_detail("猎聘", "全国", keyword, page_num, raw_count, raw_count, raw_count)
    return jobs


def main():
    """主流程：采集 → 后置过滤 → 去重 → 历史快照 → 覆盖主文件"""
    print("\n" + "=" * 60)
    print("【无地域限制全量采集】猎聘网爬虫启动 - " + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("关键词固定：计算机")
    print("=" * 60)

    dp = ChromiumPage()
    all_jobs = []
    try:
        # 最多3次重试防卡死
        for attempt in range(1, MAX_RETRY + 1):
            print(f"[RETRY] 猎聘 第 {attempt}/{MAX_RETRY} 次尝试...")
            try:
                jobs = crawl_liepin(dp, KEYWORD)
                if jobs:
                    all_jobs = jobs
                    break
                else:
                    print(f"[WARN] 猎聘 第 {attempt} 次采集返回0条")
            except Exception as e:
                print(f"[FAIL] 猎聘 第 {attempt} 次采集出错: {e}")
            if attempt < MAX_RETRY:
                crawler_utils.random_delay(5.0, 10.0)
    finally:
        try:
            dp.quit()
        except:
            pass

    print(f"\n[COLLECT] 猎聘 采集完成，原始汇总: {len(all_jobs)} 条")

    # 后置处理：过滤非IT岗位 → 去重 → 历史快照 → 覆盖主文件 → CSV
    project_root = Path(__file__).parent.parent.absolute()
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=project_root, save_csv=True, date_str=date_str
    )

    # 汇总日志
    crawler_utils.log_global_summary(final_jobs, snapshot_path, {
        "猎聘": {"total_pages": 0, "raw_count": len(all_jobs)}
    })

    print(f"\n[DONE] 【无地域限制全量采集】猎聘完成 - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[STATS] 本次共获取 {len(final_jobs)} 条岗位数据（去重+过滤后）")
    print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
    print(f"[MAIN] 主文件已覆盖：{main_path}")


if __name__ == '__main__':
    main()
