# -*- coding: utf-8 -*-
"""真实启动爬虫：新控制台窗口 + 新Chrome，不杀进程"""
import os, sys, subprocess, shutil, time, json
ROOT = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统"
PY = shutil.which("python") or sys.executable

LOCK_FILE = os.path.join(ROOT, "logs", "crawler.run.lock")
STATUS_FILE = os.path.join(ROOT, "crawler_status.json")
LOG_DIR = os.path.join(ROOT, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# 清除上次遗留的锁
if os.path.exists(LOCK_FILE):
    try: os.remove(LOCK_FILE); print("🗑️  已清除上次残留的进程锁")
    except: pass

# 检查是否已有爬虫在跑
if os.path.exists(LOCK_FILE):
    print("⚠️  锁文件仍存在，可能已有爬虫在运行。请先确认是否需要手动关闭。")
    sys.exit(1)

print("=" * 72)
print("🚀 真实启动爬虫 - 不设超时，直到你登录+采集完成")
print("=" * 72)
print(f"Python: {PY}")
print(f"脚本:   spider/run_all.py")
print()

# 关键：CREATE_NEW_CONSOLE 让爬虫有独立的控制台窗口
# 这样用户可以在那个窗口里看到扫码提示，按回车继续
CREATE_NEW_CONSOLE = 0x00000010
CREATE_NEW_PROCESS_GROUP = 0x00000200
flags = CREATE_NEW_CONSOLE | CREATE_NEW_PROCESS_GROUP

print("正在启动...")
proc = subprocess.Popen(
    [PY, "-u", os.path.join(ROOT, "spider", "run_all.py")],
    cwd=ROOT,
    creationflags=flags,
    close_fds=False
)
print(f"✅ 爬虫进程已启动！PID={proc.pid}")
print()
print("=" * 72)
print("👆 你现在应该马上能看到两个新窗口：")
print()
print("   ① 黑色 控制台窗口（爬虫主输出）")
print("      → 里面会打印：【扫码登录提醒】智联")
print("      → 扫码完成后，回到这个黑窗口按【回车键】继续")
print()
print("   ② Chrome 浏览器窗口（DrissionPage 持久化登录）")
print("      → 第1步自动打开智联 zhaopin.com")
print("      → 你在智联上扫码登录")
print("      → 切回黑窗口按回车")
print("      → 浏览器会自动打开猎聘 liepin.com → 同样扫码 → 按回车")
print("      → 然后打开前程无忧 51job.com → 登录 → 按回车")
print("      → 三个都登录完，浏览器就会全自动翻页采集")
print()
print("=" * 72)
print("📡 Dashboard 面板实时刷新指南：")
print("   打开你的 Dashboard 网页 → 拉到最下面的 📡 招聘数据采集监控面板")
print("   每 3 秒自动刷新：看到 progress%、智联/猎聘/前程无忧 的 status+count 实时变化")
print()
print("🔒 持久化登录承诺：")
print("   登录信息会保存在 chrome_scraper_profile/ 目录")
print("   下次再启动爬虫 → 自动检测已登录 → 不用再扫码！")
print("=" * 72)
print()

# 等 8 秒检查状态文件
print("等待 8 秒确认 status.json 已创建...")
for i in range(16):
    time.sleep(0.5)
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, "r", encoding="utf-8") as f:
                s = json.load(f)
            print(f"✅ 第 {(i+1)*0.5:.1f} 秒：status.json 已生成")
            print(f"   task_id:      {s.get('task_id')}")
            print(f"   start_time:   {s.get('start_time')}")
            print(f"   current_step: {s.get('current_step')}")
            for sk in ["智联","猎聘","前程无忧"]:
                d = s.get("sites",{}).get(sk, {})
                print(f"   {sk:<6}: status={d.get('status'):<8} message={str(d.get('message',''))[:28]}")
            break
        except Exception as e:
            pass
else:
    print("❓ 8秒内没看到 status.json，可能还在初始化中（正常，Chrome启动需要时间）")
    print("   你可以直接去 ①② 两个窗口操作！")

print()
print("👉 现在去操作那两个新窗口吧！祝采集顺利！")
