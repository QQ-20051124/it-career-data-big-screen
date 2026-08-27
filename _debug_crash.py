# -*- coding: utf-8 -*-
"""捕获 run_all.py 真实错误（不独立窗口，捕获输出），最多 15 秒"""
import os, sys, shutil, subprocess, time, json, threading
ROOT = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统"
PY = shutil.which("python") or sys.executable

LOCK_FILE = os.path.join(ROOT, "logs", "crawler.run.lock")
STATUS_FILE = os.path.join(ROOT, "crawler_status.json")
os.makedirs(os.path.dirname(LOCK_FILE), exist_ok=True)
for f in [LOCK_FILE]:
    if os.path.exists(f):
        try: os.remove(f)
        except: pass

print("🔥 调试模式：启动 run_all.py，捕获 stdout+stderr 到本窗口，最长 15 秒\n")
print("【如果有Chrome弹出来不用管，15秒后自动结束调试】\n")

# 先做 import 预检：模拟 run_all.py 的 imports，报 SyntaxError 或 ImportError 立即显示
print("=" * 60)
print("预检 import（spider.前程无忧 / 猎聘 / 智联 / crawler_utils / filelock）")
print("=" * 60)
import importlib.util
checks = [
    ("crawler_utils", os.path.join(ROOT, "crawler_utils.py")),
    ("spider.智联", os.path.join(ROOT, "spider", "智联.py")),
    ("spider.猎聘", os.path.join(ROOT, "spider", "猎聘.py")),
    ("spider.前程无忧", os.path.join(ROOT, "spider", "前程无忧.py")),
]
sys.path.insert(0, ROOT)
for name, path in checks:
    try:
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        print(f"   ✅ {name:<15} → OK (from {os.path.basename(path)})")
    except Exception as e:
        print(f"   ❌ {name:<15} → Import Error: {type(e).__name__}: {e}")
        import traceback; traceback.print_exc()

try:
    import filelock; print(f"   ✅ {'filelock':<15} → OK (version={getattr(filelock, '__version__', 'unknown')})")
except Exception as e:
    print(f"   ⚠️  {'filelock':<15} → 未安装: {e}（不致命，会自动降级）")

# filelock 没装可能导致进程锁逻辑分支不同——这可能是关键
# 继续真实启动，捕获输出到文件 + 当前屏幕
print()
print("=" * 60)
print("真实启动 spider/run_all.py，运行 15 秒并捕获全量输出")
print("=" * 60)

proc = subprocess.Popen(
    [PY, "-u", os.path.join(ROOT, "spider", "run_all.py")],
    cwd=ROOT,
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    bufsize=1, universal_newlines=True,
    encoding="utf-8", errors="replace"
)

got_init = False
start = time.time()
status_was_created = False

def print_loop():
    global got_init, status_was_created
    try:
        for line in proc.stdout:
            line2 = line.rstrip("\n")
            sys.stdout.write("   | " + line2 + "\n")
            sys.stdout.flush()
            if "_init_status" in line2 or "初始化状态" in line2 or ("task_id=crawl_" in line2 and "TASK" not in line2):
                got_init = True
    except Exception as e:
        pass

t = threading.Thread(target=print_loop, daemon=True)
t.start()

while time.time() - start < 15:
    time.sleep(1)
    if os.path.exists(STATUS_FILE):
        mt = os.path.getmtime(STATUS_FILE)
        if mt > start:  # 文件是本次启动后更新的
            status_was_created = True
            try:
                with open(STATUS_FILE, "r", encoding="utf-8") as f:
                    s = json.load(f)
                if s.get("start_time", "")[:16] == time.strftime("%Y-%m-%d %H:%M")[:16]:
                    got_init = True
            except: pass

print()
print("-" * 60)
print(f"15秒到！终止进程 PID={proc.pid}")
if os.name == "nt":
    subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
try: proc.wait(timeout=8)
except: pass
if os.path.exists(LOCK_FILE):
    try: os.remove(LOCK_FILE)
    except: pass

print()
print("=" * 60)
print("诊断结论：")
print("=" * 60)
print(f"   本次 status.json 被本次进程重写：{'✅ 是' if status_was_created else '❌ 否（status.json 还是旧的）'}")
print(f"   日志中出现初始化标志：    {'✅ 是' if got_init else '❌ 否'}")

if not status_was_created and not got_init:
    print("\n   ⚠️  关键错误：程序在进入 run_all_crawlers() 之前就崩了！")
    print("   常见原因：")
    print("    1) filelock 未安装 / FileLock.acquire(timeout=0) 有其它锁卡住")
    print("    2) import 爬虫模块时 SyntaxError / ImportError")
    print("    3) chrome_scraper_profile 目录被 Chrome 进程占用，DrissionPage 无法启动")
    print("    4) sys.exit(2) / sys.exit(1) 在锁检查处退出")
print()
print("最后检查 status.json：")
if os.path.exists(STATUS_FILE):
    with open(STATUS_FILE, "r", encoding="utf-8") as f:
        s = json.load(f)
    print(f"   task_id   : {s.get('task_id')}")
    print(f"   start_time: {s.get('start_time')}")
    print(f"   sites     : {list(s.get('sites',{}).keys())}")
