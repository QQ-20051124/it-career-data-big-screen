# -*- coding: utf-8 -*-
"""
全量数据合并脚本：从所有可用数据源合并去重，最大化恢复数据量
数据源：
  1. all_cleaned_jobs.json (27,638 条 - 当前已恢复)
  2. clean_jobs.json (25,527 条 - 历史备份)
  3. my-vue3/all_cleaned_jobs.csv (27,411 条 - CSV 历史备份)

【合并模式锁定】正式采集 / 数据恢复统一使用「合并模式」（去重合并，不覆盖丢数据）。
                禁止随意切换为覆盖模式，防止岗位数据意外丢失。
【数据变更审计】每次写入主文件时记录完整变更日志至 logs/data_change/，可溯源。
"""
import os, csv, json, math
from datetime import datetime

# 数据变更审计日志模块（同目录）
import data_change_logger

COPYA = r"d:\IT学习与就业数据可视化导航系统\IT学习与就业数据可视化导航系统"

SOURCES = [
    ("all_cleaned_jobs.json",       os.path.join(COPYA, "backend", "data", "all_cleaned_jobs.json"), "json"),
    ("clean_jobs.json",             os.path.join(COPYA, "clean_jobs.json"),                        "json"),
    ("my-vue3 CSV",                 os.path.join(COPYA, "my-vue3", "all_cleaned_jobs.csv"),        "csv"),
]

TARGETS = [
    os.path.join(COPYA, "backend", "data", "all_cleaned_jobs.json"),
    os.path.join(COPYA, "public", "data", "all_cleaned_jobs.json"),
    os.path.join(COPYA, "dist", "data", "all_cleaned_jobs.json"),
    os.path.join(COPYA, "src", "assets", "all_cleaned_jobs.json"),
    os.path.join(COPYA, "my-vue3", "src", "assets", "all_cleaned_jobs.json"),
    os.path.join(COPYA, "all_cleaned_jobs.json"),
]

FIELDNAMES = ["job_name", "city", "education", "work_exp", "company", "salary_avg", "data_source"]

def to_int(v):
    try:
        if v is None or str(v).strip() == "": return 0
        return int(float(str(v).strip()))
    except: return 0

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_csv(path):
    items = []
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            items.append({
                "job_name": (row.get("job_name") or "").strip(),
                "city": (row.get("city") or "").strip(),
                "education": (row.get("education") or "").strip() or "不限",
                "work_exp": (row.get("work_exp") or "").strip() or "不限",
                "company": (row.get("company") or "").strip(),
                "salary_avg": to_int(row.get("salary_avg")),
                "data_source": (row.get("data_source") or "").strip() or "未知",
            })
    return items

def main():
    merged = []
    seen = set()
    stats = {}

    for name, path, fmt in SOURCES:
        if not os.path.exists(path):
            print(f"⚠️ 跳过（不存在）：{path}")
            continue
        try:
            data = load_json(path) if fmt == "json" else load_csv(path)
            src_added = 0
            src_dup = 0
            for item in data:
                key = f"{item.get('data_source','')}|{item.get('job_name','')}|{item.get('company','')}|{item.get('city','')}"
                if key in seen:
                    src_dup += 1
                    continue
                seen.add(key)
                merged.append({
                    "job_name": item["job_name"],
                    "city": item["city"],
                    "education": item.get("education", "不限"),
                    "work_exp": item.get("work_exp", "不限"),
                    "company": item["company"],
                    "salary_avg": to_int(item.get("salary_avg", 0)),
                    "data_source": item.get("data_source", "未知"),
                })
                src_added += 1
            stats[name] = {"total": len(data), "added": src_added, "duplicates": src_dup}
            print(f"✅ {name}: {len(data)} 条 → 新增 {src_added} 条，重复 {src_dup} 条")
        except Exception as e:
            print(f"❌ {name}: 加载失败 - {e}")

    # 清洗 NaN / Inf / null 非法脏数据（写入JSON前必须过滤，避免后端解析报错）
    for it in merged:
        for k, v in list(it.items()):
            if v is None:
                it[k] = 0 if k == "salary_avg" else ""
            elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                it[k] = 0 if k == "salary_avg" else ""

    print(f"\n📊 合并结果：{len(merged)} 条")

    by_source = {}
    for it in merged:
        s = it.get("data_source", "未知")
        by_source[s] = by_source.get(s, 0) + 1
    print(f"📊 各来源：{by_source}")

    # ===== 写入前：读取主文件现有数据 + 保存快照兜底（数据回滚兜底，snapshots 永久保留） =====
    main_target = TARGETS[0]  # backend/data/all_cleaned_jobs.json
    old_jobs = []
    before_count = 0
    try:
        if os.path.exists(main_target):
            with open(main_target, "r", encoding="utf-8") as f:
                old_jobs = json.load(f)
                before_count = len(old_jobs)
    except Exception as e:
        print(f"⚠️ 读取主文件用于审计比对失败：{e}")

    snapshot_name = ""
    try:
        snapshots_dir = os.path.join(COPYA, "snapshots")
        os.makedirs(snapshots_dir, exist_ok=True)
        snapshot_name = f"{datetime.now().strftime('%Y%m%d_%H%M')}_merge_jobs.json"
        snapshot_path = os.path.join(snapshots_dir, snapshot_name)
        with open(snapshot_path, "w", encoding="utf-8") as f:
            json.dump(merged, f, ensure_ascii=False, indent=2, allow_nan=False)
        print(f"📸 合并前快照已归档（数据回滚兜底）：{snapshot_path}")
    except Exception as e:
        print(f"⚠️ 快照归档失败：{e}")

    # ===== 写入主文件 + 各副本（合并模式：去重合并，不覆盖丢数据） =====
    ok = 0
    for target in TARGETS:
        d = os.path.dirname(target)
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
        try:
            with open(target, "w", encoding="utf-8") as f:
                json.dump(merged, f, ensure_ascii=False, indent=2, allow_nan=False)
            ok += 1
            print(f"✅ 已写入：{target}")
        except Exception as e:
            print(f"❌ 写入失败：{target} -> {e}")

    print(f"\n完成：{ok}/{len(TARGETS)} 个副本，总计 {len(merged)} 条")

    # ===== 数据变更审计日志（操作类型=手动导入） =====
    added_count, removed_count = data_change_logger.compute_diff(old_jobs, merged)
    data_change_logger.log_data_change(
        operation_type="手动导入",
        sources=list(by_source.keys()),
        added_count=added_count,
        removed_count=removed_count,
        before_count=before_count,
        after_count=len(merged),
        snapshot_name=snapshot_name,
        base_dir=COPYA,
    )

    # ===== 强制重载 Express 后端缓存，清除内存缓存，使前端大屏立即加载最新数据 =====
    data_change_logger.reload_backend_cache(base_dir=COPYA)

if __name__ == "__main__":
    main()
