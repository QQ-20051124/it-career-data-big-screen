# -*- coding: utf-8 -*-
"""
前程无忧爬虫（上海入口）—— 【无地域限制全量采集】
改造说明：取消一切地区筛选、城市限制，自动遍历页面可见全部城市入口
（北京、上海、广州、深圳、武汉、西安、杭州、南京、成都、重庆、东莞、云浮、其他城市），
逐个城市依次采集，不再写死上海城市编码 040000。
本文件作为独立入口，复用 spider/前程无忧.py 的全量采集逻辑。
- 关键词固定仅【计算机】
- 采用点击分页按钮方式翻页（修复原URL参数分页不生效问题）
- 连续3页0条新岗位才判定采集结束
- 采集完成后：后置过滤非IT岗位 → 去重 → 历史快照 → 覆盖 all_cleaned_jobs.json
"""
import sys
import importlib.util
import datetime
from pathlib import Path

# 导入共享工具模块
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(PROJECT_ROOT))
import crawler_utils

# 通过 importlib 加载 spider/前程无忧.py（中文名模块），复用全量采集逻辑
_QCWY_PATH = PROJECT_ROOT / "spider" / "前程无忧.py"


def _load_qiancheng_module():
    """动态加载 spider/前程无忧.py 模块"""
    spec = importlib.util.spec_from_file_location("qiancheng_wuyou", str(_QCWY_PATH))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    """主流程：复用前程无忧全量采集逻辑（遍历全部城市）"""
    print("\n" + "=" * 60)
    print("【无地域限制全量采集】前程无忧(上海入口→全量遍历)启动 - "
          + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("关键词固定：计算机")
    print("说明：已取消上海单一城市限制，自动遍历全部城市入口")
    print("=" * 60)

    # 加载并复用前程无忧全量采集逻辑
    qcw_module = _load_qiancheng_module()

    from DrissionPage import ChromiumPage
    dp = ChromiumPage()
    all_jobs = []
    try:
        all_jobs = qcw_module.crawl_51job_all_cities(dp, qcw_module.KEYWORD)
    finally:
        try:
            dp.quit()
        except:
            pass

    print(f"\n[COLLECT] 前程无忧(上海入口→全量) 采集完成，原始汇总: {len(all_jobs)} 条")

    # 后置处理：过滤非IT岗位 → 去重 → 历史快照 → 覆盖主文件 → CSV
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    snapshot_path, main_path, final_jobs = crawler_utils.post_process_and_persist(
        all_jobs, base_dir=PROJECT_ROOT, save_csv=True, date_str=date_str
    )

    # 汇总日志
    crawler_utils.log_global_summary(final_jobs, snapshot_path, {
        "前程无忧": {"total_pages": 0, "raw_count": len(all_jobs)}
    })

    print(f"\n[DONE] 【无地域限制全量采集】前程无忧(上海入口→全量)完成 - "
          f"{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[STATS] 本次共获取 {len(final_jobs)} 条岗位数据（去重+过滤后）")
    print(f"[SNAPSHOT] 历史快照：{snapshot_path}")
    print(f"[MAIN] 主文件已覆盖：{main_path}")


if __name__ == '__main__':
    main()
