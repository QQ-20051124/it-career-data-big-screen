# -*- coding: utf-8 -*-
import os, sys, json, subprocess, shutil
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.absolute()
STATUS_FILE = PROJECT_ROOT / "crawler_status.json"
LOGIN_FILE = PROJECT_ROOT / "login_status.json"
LOCK_FILE = PROJECT_ROOT / "logs" / "crawler.run.lock"
DATA_FILE = PROJECT_ROOT / "backend" / "data" / "all_cleaned_jobs.json"
# 优先用 shutil.which 找到系统里真实可用的 python（兼容不同机器不同用户名）
_system_py = shutil.which("python")
PYTHON_EXE = Path(_system_py) if _system_py else Path(sys.executable)
_venv_py = PROJECT_ROOT / ".venv312" / "Scripts" / "python.exe"
if _venv_py.exists():
    try:
        import subprocess as _sp
        _rc = _sp.run([str(_venv_py), "-c", "print(1)"], capture_output=True, timeout=10).returncode
        if _rc == 0:
            PYTHON_EXE = _venv_py
    except Exception:
        pass
RUNNER_SCRIPT = PROJECT_ROOT / "spider" / "run_all.py"

DEFAULT_STATUS = {
    "task_id": None, "start_time": None, "end_time": None, "status": "idle",
    "progress": 0, "current_step": "暂无正在运行的任务",
    "sites": {
        "智联": {"status": "pending", "raw_count": 0, "pages": 0, "message": "等待中"},
        "猎聘": {"status": "pending", "raw_count": 0, "pages": 0, "message": "等待中"},
        "前程无忧": {"status": "pending", "raw_count": 0, "pages": 0, "message": "等待中", "cities_total": 0, "cities_done": 0},
    },
    "total_raw_count": 0, "final_count": 0, "error": None,
}

def get_status():
    try:
        if STATUS_FILE.exists():
            with open(STATUS_FILE, "r", encoding="utf-8") as f:
                s = json.load(f)
                if is_running() and s.get("status") != "running":
                    s["status"] = "running"
                    s["current_step"] = "采集中（检测到锁文件）"
                return s
    except Exception: pass
    return dict(DEFAULT_STATUS)

def get_login_status():
    try:
        if LOGIN_FILE.exists():
            with open(LOGIN_FILE, "r", encoding="utf-8") as f: return json.load(f)
    except Exception: pass
    return {"last_login_time": None, "sites": {"智联": False, "猎聘": False, "前程无忧": False}}

def is_running():
    try: return LOCK_FILE.exists()
    except Exception: return False

def get_data_summary():
    summary = {"total": 0, "by_source": {}, "by_city": {}, "last_update": None}
    try:
        if DATA_FILE.exists():
            stat = DATA_FILE.stat()
            summary["last_update"] = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            with open(DATA_FILE, "r", encoding="utf-8") as f: data = json.load(f)
            summary["total"] = len(data)
            by_src, by_city = {}, {}
            for j in data:
                src = j.get("data_source") or "未知"
                by_src[src] = by_src.get(src, 0) + 1
                city = j.get("city") or "未知"
                by_city[city] = by_city.get(city, 0) + 1
            summary["by_source"] = by_src
            sorted_cities = sorted(by_city.items(), key=lambda x: x[1], reverse=True)[:10]
            summary["by_city"] = dict(sorted_cities)
    except Exception as e: summary["error"] = str(e)[:200]
    return summary

def start_crawler():
    if is_running(): return {"success": False, "message": "已有爬虫实例正在运行中，请等待结束"}
    if not RUNNER_SCRIPT.exists(): return {"success": False, "message": "找不到爬虫入口脚本"}
    try:
        logs_dir = PROJECT_ROOT / "logs"
        logs_dir.mkdir(exist_ok=True)
        out_log = logs_dir / "crawler_stdout.log"
        err_log = logs_dir / "crawler_stderr.log"
        DETACHED_PROCESS = 0x00000008 if os.name == "nt" else 0
        CREATE_NEW_PROCESS_GROUP = 0x00000200 if os.name == "nt" else 0
        flags = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
        with open(out_log, "a", encoding="utf-8") as fo, open(err_log, "a", encoding="utf-8") as fe:
            p = subprocess.Popen(
                [str(PYTHON_EXE), str(RUNNER_SCRIPT)], cwd=str(PROJECT_ROOT),
                stdout=fo, stderr=fe, creationflags=flags if flags else 0,
                close_fds=(os.name != "nt"),
            )
        return {"success": True, "pid": p.pid, "message": "爬虫已启动，可查看logs/crawler_stdout.log获取实时日志"}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"success": False, "message": "启动失败: " + str(e)[:300]}

def start_login_manager():
    login_script = PROJECT_ROOT / "crawler_login_manager.py"
    if not login_script.exists(): return {"success": False, "message": "找不到登录脚本"}
    try:
        DETACHED_PROCESS = 0x00000008 if os.name == "nt" else 0
        CREATE_NEW_CONSOLE = 0x00000010 if os.name == "nt" else 0
        flags = DETACHED_PROCESS | CREATE_NEW_CONSOLE if os.name == "nt" else 0
        p = subprocess.Popen(
            [str(PYTHON_EXE), str(login_script)], cwd=str(PROJECT_ROOT),
            creationflags=flags if flags else 0, close_fds=(os.name != "nt"),
        )
        return {"success": True, "pid": p.pid, "message": "登录管理器已打开新窗口，请完成登录操作"}
    except Exception as e:
        return {"success": False, "message": "启动失败: " + str(e)[:300]}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", action="store_true")
    parser.add_argument("--login", action="store_true")
    parser.add_argument("--status", action="store_true")
    args = parser.parse_args()
    if args.start: print(start_crawler())
    elif args.login: print(start_login_manager())
    else:
        print(json.dumps({"status": get_status(), "login": get_login_status(), "data": get_data_summary(), "running": is_running()}, ensure_ascii=False, indent=2))
