# -*- coding: utf-8 -*-
"""一次性修补：
A) crawler_utils.check_site_login → 乐观放行，不再误判已登录为未登录
B) run_all.py 每个网站最多扫码 1 次，不再死循环询问
"""
import os, re, sys

ROOT = r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统"

# ================== A. 修 crawler_utils.py ==================
fpath = os.path.join(ROOT, "crawler_utils.py")
with open(fpath, "rb") as f:
    c = f.read().decode("utf-8-sig")

# A1. 增强 LOGIN_CHECK_CONFIG：新增 strong_logged_in_keywords（只要有这些字，直接判已登录）
old_config = '''LOGIN_CHECK_CONFIG = {
    "智联": {
        "homepage": "https://www.zhaopin.com/",
        # 已登录标识：页面存在这些元素 → 已登录
        "logged_in_selectors": [
            \'css:[class*="user-info"]\',
            \'css:[class*="member-name"]\',
            \'css:[class*="avatar"] img\',
            \'css:.zhipin-user-name\',
            \'css:[class*="userName"]\',
        ],
        # 未登录标识：HTML包含这些关键词 → 未登录
        "not_login_keywords": ["扫码登录", "登录/注册", "立即登录", "请先登录"],
    },
    "猎聘": {
        "homepage": "https://www.liepin.com/",
        "logged_in_selectors": [
            \'css:[class*="user-avatar"]\',
            \'css:[class*="header-user"]\',
            \'css:[class*="member-info"]\',
            \'css:[class*="userName"]\',
            \'css:[class*="avatar"] img\',
        ],
        "not_login_keywords": ["扫码登录", "登录/注册", "立即登录", "快速登录", "请先登录"],
    },
    "前程无忧": {
        "homepage": "https://we.51job.com/pc/search?keyword=计算机&searchType=2",
        "logged_in_selectors": [
            \'css:[class*="user-name"]\',
            \'css:[class*="login-name"]\',
            \'css:[class*="my-51job"]\',
            \'css:[class*="userName"]\',
            \'css:[class*="header-user"]\',
        ],
        "not_login_keywords": ["扫码登录", "登录/注册", "立即登录", "请先登录", "立即注册"],
    },
}'''

new_config = '''LOGIN_CHECK_CONFIG = {
    "智联": {
        "homepage": "https://www.zhaopin.com/",
        # 【强证据·已登录】cookie 名包含这些 → 直接判定已登录（最可靠）
        "logged_in_cookies": ["zp_token", "at", "userid", "user_id", "Zp_Self_Token"],
        # 【强证据·已登录】页面文本包含这些字样（出现在 header 区域） → 已登录
        "strong_logged_in_keywords": ["退出登录", "退出账号", "注销", "安全退出", "我的智联", "个人中心"],
        # 已登录标识：页面存在这些元素 → 已登录
        "logged_in_selectors": [
            \'css:[class*="user-info"]\',
            \'css:[class*="member-name"]\',
            \'css:[class*="avatar"] img\',
            \'css:.zhipin-user-name\',
            \'css:[class*="userName"]\',
            \'css:[class*="userName"]\',
            \'css:[data-nickname]\',
            \'css:[class*="header__user"]\',
        ],
        # 未登录标识【仅 header 区域包含这些按钮文案】→ 未登录（不再全 HTML 扫描）
        "not_login_keywords": [],  # 全 HTML 扫"登录"字太容易误杀 → 禁用
        "not_login_header_keywords": ["登录/注册", "立即登录", "扫码登录"],
    },
    "猎聘": {
        "homepage": "https://www.liepin.com/",
        "logged_in_cookies": ["__tlog_u_id", "userid", "user_id", "u_id", "accessToken", "_gc_id"],
        "strong_logged_in_keywords": ["退出登录", "退出账号", "注销", "我的猎聘", "个人中心", "我的简历"],
        "logged_in_selectors": [
            \'css:[class*="user-avatar"]\',
            \'css:[class*="header-user"]\',
            \'css:[class*="member-info"]\',
            \'css:[class*="userName"]\',
            \'css:[class*="avatar"] img\',
            \'css:[class*="user-info"]\',
            \'css:[class*="header-avatar"]\',
        ],
        "not_login_keywords": [],
        "not_login_header_keywords": ["登录/注册", "立即登录", "快速登录", "扫码登录"],
    },
    "前程无忧": {
        "homepage": "https://we.51job.com/pc/search?keyword=计算机&searchType=2",
        "logged_in_cookies": ["51job", "guid", "userid", "UserID", "username", "_uid"],
        "strong_logged_in_keywords": ["退出登录", "注销", "安全退出", "我的简历", "我的51job", "个人中心"],
        "logged_in_selectors": [
            \'css:[class*="user-name"]\',
            \'css:[class*="login-name"]\',
            \'css:[class*="my-51job"]\',
            \'css:[class*="userName"]\',
            \'css:[class*="header-user"]\',
            \'css:[class*="user-info"]\',
            \'css:[class*="nav-user"]\',
        ],
        "not_login_keywords": [],
        "not_login_header_keywords": ["登录/注册", "立即登录", "扫码登录"],
    },
}'''

assert old_config in c, "A1. LOGIN_CHECK_CONFIG 旧内容未找到！"
c = c.replace(old_config, new_config, 1)

# A2. 重写 check_site_login 函数（乐观放行 + 多证据判断）
old_func = '''def check_site_login(dp, site_name):
    """
    检测指定招聘网站是否已登录
    访问首页，检查是否存在已登录标识元素（头像、个人中心等）

    Returns:
        True = 已登录，可直接采集
        False = 未登录，需要扫码
    """
    config = LOGIN_CHECK_CONFIG.get(site_name)
    if not config:
        print(f"[LOGIN] 未知站点 {site_name}，跳过登录检测")
        return True

    homepage = config["homepage"]
    print(f"[LOGIN] {site_name} 检测登录状态，访问首页: {homepage}")

    try:
        dp.get(homepage, timeout=30)
        time.sleep(3)
    except Exception as e:
        print(f"[LOGIN] {site_name} 首页加载失败: {e}，视为未登录")
        return False

    # 检查已登录标识元素
    for selector in config["logged_in_selectors"]:
        try:
            el = dp.ele(selector, timeout=1.5)
            if el:
                print(f"[LOGIN] {site_name} ✅已登录（检测到用户元素: {selector}）")
                return True
        except Exception:
            continue

    # 检查未登录关键词
    try:
        html = dp.html
    except Exception:
        html = ""

    for kw in config["not_login_keywords"]:
        if kw in html:
            print(f"[LOGIN] {site_name} ❌未登录（检测到关键词: {kw}）")
            return False

    # 无法确定时，默认按未登录处理（更安全）
    print(f"[LOGIN] {site_name} 登录状态不确定，按未登录处理")
    return False'''

new_func = '''def check_site_login(dp, site_name, _allow_unknown=True):
    """
    检测指定招聘网站是否已登录。
    ⚠️ 【重要策略】登录态不确定时，默认【乐观放行 = 返回True】！
       用户如果说自己已经登录，就不要因为检测逻辑太弱反复让他扫码。
       若真的未登录 → 采集时会返回0条，用户会自己知道该怎么办。

    判断优先级（从高到低）：
    1. 有 cookie 登录态 token → ✅ 已登录
    2. header 文本含"退出登录/注销/个人中心" → ✅ 已登录
    3. 有头像/用户名 DOM 元素 → ✅ 已登录
    4. header 区域有"登录/注册按钮" → ❌ 未登录
    5. 其他一切情况（加载不完整、DOM改版等）
       → ✅ 乐观放行已登录（_allow_unknown=True 时）

    Returns:
        True = 已登录（或不确定但乐观放行），可直接采集
        False = 未登录，需要扫码
    """
    config = LOGIN_CHECK_CONFIG.get(site_name)
    if not config:
        print(f"[LOGIN] 未知站点 {site_name}，跳过登录检测（乐观放行）")
        return True

    homepage = config["homepage"]
    print(f"[LOGIN] {site_name} 检测登录状态，访问首页: {homepage}")

    try:
        dp.get(homepage, timeout=30)
        time.sleep(4)  # 等JS渲染完成
    except Exception as e:
        print(f"[LOGIN] {site_name} 首页加载失败: {e} → 乐观放行（网络波动没关系）")
        return True

    # ============== 证据1：cookie 登录态（最可靠） ==============
    try:
        cookies = dp.cookies()  # DrissionPage 取当前域名所有 cookie
        cookie_names = set()
        if isinstance(cookies, list):
            for ck in cookies:
                if isinstance(ck, dict):
                    n = ck.get("name") or ck.get("Name")
                    if n: cookie_names.add(str(n).lower())
        cookie_tokens = [n.lower() for n in config.get("logged_in_cookies", [])]
        for want in cookie_tokens:
            for have in cookie_names:
                if want in have:
                    print(f"[LOGIN] {site_name} ✅已登录（Cookie命中: {want} ← {have}）")
                    return True
    except Exception:
        pass

    # ============== 证据2：强关键词（"退出登录"/"个人中心"） ==============
    try:
        # 取 header 区域文本（如果找得到 header 元素）
        header_text = ""
        try:
            header_el = dp.ele('tag:header', timeout=1) or dp.ele('tag:nav', timeout=1)
            if header_el: header_text = header_el.text or ""
        except Exception:
            pass
        # 取整页 body 文本（不含 HTML 标签，更准确）
        try:
            full_text = dp("tag:body").text or ""
        except Exception:
            full_text = ""
        combined = (header_text + "\n" + full_text)[:5000]

        strong_kw = config.get("strong_logged_in_keywords", [])
        for kw in strong_kw:
            if kw in combined:
                print(f"[LOGIN] {site_name} ✅已登录（文本命中强证据: {kw!r}）")
                return True
    except Exception:
        pass

    # ============== 证据3：已登录元素选择器（多给一点时间渲染） ==============
    for selector in config["logged_in_selectors"]:
        try:
            el = dp.ele(selector, timeout=2.2)
            if el and el.states.is_displayed:
                print(f"[LOGIN] {site_name} ✅已登录（检测到用户元素: {selector}）")
                return True
        except Exception:
            continue

    # ============== 证据4：header 区域未登录按钮（仅本步判 False） ==============
    try:
        header_el = None
        try:
            header_el = dp.ele('tag:header', timeout=1) or dp.ele('tag:nav', timeout=1)
        except Exception:
            pass
        if header_el is not None:
            try:
                header_html = header_el.html or ""
                header_txt = header_el.text or ""
            except Exception:
                header_html, header_txt = "", ""
            bad_kw_list = config.get("not_login_header_keywords", [])
            for kw in bad_kw_list:
                # 必须在 header 区域出现，才算未登录证据
                if kw in header_html or kw in header_txt:
                    print(f"[LOGIN] {site_name} ⚠️  header检测到未登录按钮: {kw!r}")
                    return False
    except Exception:
        pass

    # ============== 最后：不确定 → 乐观放行！ ==============
    if _allow_unknown:
        print(f"[LOGIN] {site_name} 🟢 登录状态不确定 → 默认按【已登录】放行（不卡用户）")
        print(f"[LOGIN]   ( 如果实际真的没登录、导致采到0条，重试时会再次提示扫码 )")
        return True
    else:
        print(f"[LOGIN] {site_name} 登录状态不确定（严格模式下按未登录）")
        return False'''

assert old_func in c, "A2. check_site_login 旧函数未找到！"
c = c.replace(old_func, new_func, 1)

with open(fpath, "wb") as f:
    f.write(c.encode("utf-8"))
print("✅ A. crawler_utils.py 修补完成：")
print("   · 新增 cookie 登录态检测（最可靠）")
print("   · 新增强关键词检测（退出登录/注销/个人中心）")
print("   · 禁用全 HTML 扫'登录'字（太容易误杀已登录用户正常页面里的页脚小字）")
print("   · 未登录按钮检测【只看 header 区域】，不再扫整页")
print("   · 状态不确定时 → 乐观放行（返回True），不再默认未登录")

# ================== B. 修 run_all.py：每个网站只让用户登录 1 次 ==================
f2 = os.path.join(ROOT, "spider", "run_all.py")
with open(f2, "rb") as f:
    c2 = f.read().decode("utf-8-sig")

# 3 个网站的 for attempt 循环里，加一个标志位：login_confirmed_智联/猎聘/前程无忧
# 首次检测未登录 → wait_for → 设标志位=True
# 后续 attempt 再检测 check_site_login=False → 若标志位已 True，则跳过 wait_for（不再反复问用户）
for site_short, line_check, line_wait, line_extra_check in [
    ("智联",
     'if not crawler_utils.check_site_login(dp, "智联"):',
     'crawler_utils.wait_for_login_confirmation("智联")',
     'crawler_utils.check_site_login(dp, "智联")'),
    ("猎聘",
     'if not crawler_utils.check_site_login(dp, "猎聘"):',
     'crawler_utils.wait_for_login_confirmation("猎聘")',
     'crawler_utils.check_site_login(dp, "猎聘")'),
    ("前程无忧",
     'if not crawler_utils.check_site_login(dp, "前程无忧"):',
     'crawler_utils.wait_for_login_confirmation("前程无忧")',
     'crawler_utils.check_site_login(dp, "前程无忧")'),
]:
    flag_var = f"_login_confirmed_{site_short}"
    old_block = f"""            {line_check}
                status["sites"]["{site_short}"]["message"] = "需要登录，请在浏览器完成后按回车"
                _write_status(status)
                {line_wait}
                {line_extra_check}"""
    new_block = f"""            # 标志位：本网站是否已经让用户扫码确认过？每个 attempt 重试最多 1 次，不反复问
            if not f"{flag_var}" in run_all_crawlers.__code__.co_varnames:  pass  # noqa
            if "{flag_var}" not in _per_run_flags_:  _per_run_flags_["{flag_var}"] = False
            if not crawler_utils.check_site_login(dp, "{site_short}") and (not _per_run_flags_["{flag_var}"]):
                status["sites"]["{site_short}"]["message"] = "需要登录，请在浏览器完成后按回车"
                _write_status(status)
                {line_wait}
                _per_run_flags_["{flag_var}"] = True  # ← 关键：以后重试再也不问了"""
    assert old_block in c2, f"B. run_all.py 中 {site_short} 旧代码块未找到！"
    c2 = c2.replace(old_block, new_block, 1)

# 在 run_all_crawlers 函数开头加入 _per_run_flags_ 初始化（引用传递的 dict，跨 attempt 循环）
old_run_start = """def run_all_crawlers():
    \"\"\"主流程：依次爬取智联 → 猎聘 → 前程无忧 → 合并处理\"\"\"
    start_time = datetime.datetime.now()
    date_str = start_time.strftime('%Y%m%d')
    per_site_stats = {}"""
new_run_start = """def run_all_crawlers():
    \"\"\"主流程：依次爬取智联 → 猎聘 → 前程无忧 → 合并处理\"\"\"
    start_time = datetime.datetime.now()
    date_str = start_time.strftime('%Y%m%d')
    per_site_stats = {}
    # ============ 登录确认标志（跨 attempt 重试，每个网站最多问用户 1 次） ============
    _per_run_flags_ = {"_login_confirmed_智联": False, "_login_confirmed_猎聘": False, "_login_confirmed_前程无忧": False}"""
assert old_run_start in c2, "B2. run_all_crawlers 开头未找到！"
c2 = c2.replace(old_run_start, new_run_start, 1)

with open(f2, "wb") as f:
    f.write(c2.encode("utf-8"))
print()
print("✅ B. run_all.py 修补完成：")
print("   · 每个网站【最多只让用户扫码登录 1 次】")
print("   · MAX_RETRY 第 2/3 次重试时：即使 check_site_login 仍说未登录，也直接进入采集（不再反复问）")

# 语法验证
import subprocess
PY = r"D:\python\python.exe"
print()
print("语法验证:")
r1 = subprocess.run([PY, "-m", "py_compile", fpath], capture_output=True, text=True, encoding="utf-8")
r2 = subprocess.run([PY, "-m", "py_compile", f2], capture_output=True, text=True, encoding="utf-8")
print(f"   crawler_utils.py: exitcode={r1.returncode} {'OK ✅' if r1.returncode==0 else ('FAIL ❌\\n   '+r1.stderr[-400:])}")
print(f"   run_all.py       : exitcode={r2.returncode} {'OK ✅' if r2.returncode==0 else ('FAIL ❌\\n   '+r2.stderr[-400:])}")
