# -*- coding: utf-8 -*-
"""
数据变更审计日志模块
================================================================
作用：每次合并 / 写入 all_cleaned_jobs.json 主岗位文件时，自动记录一条完整变更日志，
      实现岗位数据变动可溯源，防止岗位数据意外丢失后无法追查。

日志位置：logs/data_change/data_change_YYYYMMDD.log（追加写入）
轮转策略：单个日志超过 10MB 自动分割为 data_change_YYYYMMDD_HHMMSS.log
保留策略：自动清理超过 30 天的变更记录，避免日志无限膨胀
输出方式：同时写入文件 + 打印到后端控制台，方便实时查看数据变动溯源

操作类型（operation_type）取值：
  - 爬虫全量采集：spider/run_all.py 跑完覆盖主文件
  - 快照恢复    ：从 snapshots 手动恢复数据
  - 手动导入    ：merge_all_sources.py 合并多数据源写入主文件
"""
import json
import time
from datetime import datetime, timedelta
from pathlib import Path

# ================== 配置 ==================
LOG_DIR_NAME = "data_change"          # logs/ 下的子目录名
MAX_LOG_SIZE = 10 * 1024 * 1024       # 单个日志 10MB 自动分割
RETENTION_DAYS = 30                   # 保留最近 30 天变更记录
BACKEND_RELOAD_URL = "http://localhost:3001/api/jobs/reload"  # Express 后端强制重载接口


def _log_dir(base_dir=None):
    """获取/创建日志目录 logs/data_change/（不存在自动创建）"""
    base = Path(base_dir) if base_dir else Path(__file__).parent.absolute()
    d = base / "logs" / LOG_DIR_NAME
    d.mkdir(parents=True, exist_ok=True)
    return d


def _rotate_if_needed(log_path):
    """单个日志超过 10MB 自动分割：重命名为带时间戳的归档文件，再新建当日日志"""
    try:
        if log_path.exists() and log_path.stat().st_size >= MAX_LOG_SIZE:
            ts = datetime.now().strftime('%Y%m%d_%H%M%S')
            archived = log_path.with_name(f"{log_path.stem}_{ts}.log")
            log_path.rename(archived)
    except Exception:
        pass


def _cleanup_old_logs(log_dir):
    """保留最近 30 天变更记录：删除超过 30 天的 data_change_*.log"""
    cutoff = time.time() - RETENTION_DAYS * 86400
    for f in log_dir.glob("data_change_*.log"):
        try:
            if f.stat().st_mtime < cutoff:
                f.unlink()
        except Exception:
            pass


def _build_dedup_key(job):
    """构建去重键，用于比对新增/删除岗位（与系统去重键保持一致）"""
    return f"{job.get('data_source', '')}|{job.get('job_name', '')}|{job.get('company', '')}|{job.get('city', '')}"


def compute_diff(old_jobs, new_jobs):
    """
    计算本次写入相对旧数据的新增 / 删除岗位数量
    返回 (added_count, removed_count)
    """
    old_keys = {_build_dedup_key(j) for j in (old_jobs or [])}
    new_keys = {_build_dedup_key(j) for j in (new_jobs or [])}
    return len(new_keys - old_keys), len(old_keys - new_keys)


def _normalize_sources(sources):
    """采集来源平台归一化为字符串"""
    if not sources:
        return "未知"
    if isinstance(sources, (list, tuple, set)):
        items = [str(s) for s in sources if s]
        return "/".join(sorted(set(items))) if items else "未知"
    return str(sources)


def log_data_change(operation_type, sources, added_count, removed_count,
                    before_count, after_count, snapshot_name,
                    base_dir=None, task_id=None):
    """
    记录一条完整数据变更审计日志（写文件 + 打印控制台 + 自动轮转/清理）

    参数:
        operation_type : 操作类型（爬虫全量采集 / 快照恢复 / 手动导入）
        sources        : 采集来源平台（str 或 list）
        added_count    : 本次新增岗位数量
        removed_count  : 本次删除下架岗位数量
        before_count   : 写入前总条数
        after_count    : 写入后总条数
        snapshot_name  : 快照归档文件名称（无则传 ""）
        base_dir       : 项目根目录（默认本模块所在目录）
        task_id        : 任务唯一标识（可选，便于排查何时触发）
    """
    log_dir = _log_dir(base_dir)
    now = datetime.now()
    log_path = log_dir / f"data_change_{now.strftime('%Y%m%d')}.log"

    # 写入前轮转 + 清理
    _rotate_if_needed(log_path)
    _cleanup_old_logs(log_dir)

    task_tag = f"[TASK:{task_id}] " if task_id else ""
    snapshot_tag = snapshot_name if snapshot_name else "无"
    line = (
        f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] {task_tag}"
        f"操作类型={operation_type} | "
        f"采集来源平台={_normalize_sources(sources)} | "
        f"本次新增岗位数量={added_count} | "
        f"本次删除下架岗位数量={removed_count} | "
        f"写入前总条数={before_count} | "
        f"写入后总条数={after_count} | "
        f"快照归档文件名称={snapshot_tag}"
    )

    # 1. 追加写入文件
    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(line + "\n")
    except Exception as e:
        print(f"[DATA_CHANGE_LOG] 写入日志文件失败: {e}")

    # 2. 同时打印到后端控制台输出，方便实时查看数据变动溯源
    print("\n" + "=" * 60)
    print("【数据变更审计日志】")
    print(f"  {line}")
    print("=" * 60)

    return line


def reload_backend_cache(base_dir=None, timeout=8):
    """
    爬虫跑完 / 合并写入 / 快照恢复后，调用 Express 后端 /api/jobs/reload 接口，
    清除后端内存缓存，强制重载 all_cleaned_jobs.json，使前端大屏立即看到最新数据。

    说明：等同于“完整重启 Express 后端服务”的缓存清理效果，但无需杀进程，更安全。
         若后端未运行则仅打印提示，不阻断爬虫流程。
    """
    import urllib.request
    try:
        req = urllib.request.Request(
            BACKEND_RELOAD_URL,
            method="POST",
            data=b"{}",
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="ignore")
        try:
            data = json.loads(body)
        except Exception:
            data = {"raw": body}
        print(f"[RELOAD] 后端缓存已清除并重载 all_cleaned_jobs.json：{data}")
        return True, data
    except Exception as e:
        print(f"[RELOAD] 后端重载失败（可能 Express 未启动，可忽略）：{e}")
        return False, {"error": str(e)}
