# -*- coding: utf-8 -*-
"""
全国 IT 岗位爬虫共享工具模块
- 统一后置过滤（剔除销售、文员、人事、司机等非 IT 技术岗位）
- 统一去重策略：【公司全称 + 岗位名称 + 岗位唯一ID】
- 统一历史快照归档：snapshots/{YYYYMMDD_HHMM}_jobs.json
- 统一主文件覆盖：all_cleaned_jobs.json（前端可视化统一读取）
- 统一日志辅助：标记【无地域限制全量采集】
关键词固定仅【计算机】，采集阶段不做任何城市/地域限制。
"""
import os
import re
import json
import time
import random
import logging
from datetime import datetime
from pathlib import Path

# 数据变更审计日志模块（同目录，记录每次写入主文件的变更明细）
import data_change_logger

# DrissionPage Chrome Options（延迟导入，确保模块独立性）
_DP_AVAILABLE = False
try:
    from DrissionPage import ChromiumOptions
    _DP_AVAILABLE = True
except ImportError:
    pass


def get_chromium_options(use_user_profile=True):
    """
    获取 Chrome 配置：使用项目目录下固定持久化 profile 目录
    登录cookie/会话保存在 chrome_scraper_profile 文件夹中
    下次启动自动读取，无需重新扫码登录

    前提：用户的 Chrome 浏览器已关闭（Chrome 会锁定 profile 目录）
    """
    if not _DP_AVAILABLE:
        raise ImportError("DrissionPage 未安装，请在 .venv312 中安装：pip install DrissionPage")

    co = ChromiumOptions()

    # 使用项目目录下的固定持久化 profile 目录
    profile_path = Path(__file__).parent / "chrome_scraper_profile"
    profile_path.mkdir(parents=True, exist_ok=True)
    co.set_user_data_path(str(profile_path))
    print(f"[CHROME] 使用持久化profile目录: {profile_path}")
    print(f"[CHROME] 登录会话将保存在此目录，下次启动自动读取")

    # 设置固定调试端口（避免auto_port随机分配）
    try:
        co.set_local_port(9222)
    except Exception:
        try:
            co._local_port = 9222
        except Exception:
            pass

    # 不自动关闭浏览器（需要保留窗口供扫码登录）
    try:
        co.auto_close(False)
    except Exception:
        try:
            co._auto_close = False
        except Exception:
            pass
    return co


def create_logged_in_browser(use_user_profile=True):
    """
    创建 Chrome 浏览器实例
    使用项目目录下 chrome_scraper_profile 持久化目录
    首次运行需要扫码登录，登录信息保存到 profile
    后续运行自动读取 profile 中的登录态，无需重新登录
    """
    if not _DP_AVAILABLE:
        raise ImportError("DrissionPage 未安装")

    co = get_chromium_options(use_user_profile=use_user_profile)
    from DrissionPage import ChromiumPage
    dp = ChromiumPage(co)
    print("[CHROME] 浏览器已启动（持久化profile）")
    return dp


# ================== 登录状态检测 ==================

# 各站点登录检测配置
LOGIN_CHECK_CONFIG = {
    "智联": {
        "homepage": "https://www.zhaopin.com/",
        # 已登录标识：页面存在这些元素 → 已登录
        "logged_in_selectors": [
            'css:[class*="user-info"]',
            'css:[class*="member-name"]',
            'css:[class*="avatar"] img',
            'css:.zhipin-user-name',
            'css:[class*="userName"]',
        ],
        # 未登录标识：HTML包含这些关键词 → 未登录
        "not_login_keywords": [],
        "not_login_header_keywords": ["登录/注册", "立即登录", "扫码登录"],
    },
    "猎聘": {
        "homepage": "https://www.liepin.com/",
        "logged_in_selectors": [
            'css:[class*="user-avatar"]',
            'css:[class*="header-user"]',
            'css:[class*="member-info"]',
            'css:[class*="userName"]',
            'css:[class*="avatar"] img',
        ],
        "not_login_keywords": [],
        "not_login_header_keywords": ["登录/注册", "立即登录", "快速登录", "扫码登录"],
    },
    "前程无忧": {
        "homepage": "https://we.51job.com/pc/search?keyword=计算机&searchType=2",
        "logged_in_selectors": [
            'css:[class*="user-name"]',
            'css:[class*="login-name"]',
            'css:[class*="my-51job"]',
            'css:[class*="userName"]',
            'css:[class*="header-user"]',
        ],
        "not_login_keywords": [],
        "not_login_header_keywords": ["登录/注册", "立即登录", "扫码登录"],
    },
}


def check_site_login(dp, site_name, _allow_unknown=True):
    """
    检测指定招聘网站是否已登录。
    【核心策略】不确定时默认乐观放行=True，不卡用户！
    判断优先级：
    1. Cookie 有登录态 token → 已登录
    2. 页面文本含"退出登录/个人中心" → 已登录
    3. DOM 有头像/用户名元素 → 已登录
    4. header 区域有"登录/注册"按钮 → 未登录
    5. 其他 → 乐观放行=True
    """
    config = LOGIN_CHECK_CONFIG.get(site_name)
    if not config:
        print(f"[LOGIN] 未知站点 {site_name}，跳过登录检测")
        return True

    homepage = config["homepage"]
    print(f"[LOGIN] {site_name} 检测登录状态，访问首页: {homepage}")

    try:
        dp.get(homepage, timeout=30)
        time.sleep(4)
    except Exception as e:
        print(f"[LOGIN] {site_name} 首页加载失败: {e} → 乐观放行")
        return True

    # 证据1：Cookie 登录态（最可靠）
    try:
        cookies = dp.cookies()
        cookie_names = set()
        if isinstance(cookies, list):
            for ck in cookies:
                if isinstance(ck, dict):
                    n = ck.get("name") or ck.get("Name")
                    if n:
                        cookie_names.add(str(n).lower())
        # 各站点的登录 cookie 名
        site_cookie_map = {
            "智联": ["zp_token", "at", "userid", "user_id", "zp_self_token"],
            "猎聘": ["__tlog_u_id", "userid", "u_id", "accesstoken", "_gc_id"],
            "前程无忧": ["guid", "userid", "username", "_uid"],
        }
        for want in site_cookie_map.get(site_name, []):
            for have in cookie_names:
                if want in have:
                    print(f"[LOGIN] {site_name} 已登录（Cookie命中: {want}）")
                    return True
    except Exception:
        pass

    # 证据2：强关键词（退出登录/个人中心等，只有登录后才出现）
    try:
        full_text = ""
        try:
            full_text = dp("tag:body").text or ""
        except Exception:
            try:
                full_text = dp.html or ""
            except Exception:
                full_text = ""
        strong_kw_map = {
            "智联": ["退出登录", "退出账号", "安全退出", "我的智联", "个人中心"],
            "猎聘": ["退出登录", "退出账号", "我的猎聘", "个人中心", "我的简历"],
            "前程无忧": ["退出登录", "注销", "安全退出", "我的简历", "个人中心"],
        }
        for kw in strong_kw_map.get(site_name, []):
            if kw in full_text:
                print(f"[LOGIN] {site_name} 已登录（文本命中: {kw}）")
                return True
    except Exception:
        pass

    # 证据3：已登录 DOM 元素
    for selector in config["logged_in_selectors"]:
        try:
            el = dp.ele(selector, timeout=2)
            if el:
                print(f"[LOGIN] {site_name} 已登录（检测到元素: {selector}）")
                return True
        except Exception:
            continue

    # 证据4：仅 header 区域的未登录按钮（不再全 HTML 扫）
    try:
        header_el = None
        try:
            header_el = dp.ele("tag:header", timeout=1) or dp.ele("tag:nav", timeout=1)
        except Exception:
            pass
        if header_el is not None:
            header_html = header_el.html or ""
            header_txt = header_el.text or ""
            for kw in config.get("not_login_header_keywords", []):
                if kw in header_html or kw in header_txt:
                    print(f"[LOGIN] {site_name} 未登录（header区域检测到: {kw}）")
                    return False
    except Exception:
        pass

    # 不确定 → 乐观放行！
    if _allow_unknown:
        print(f"[LOGIN] {site_name} 状态不确定 → 默认按已登录放行")
        return True
    else:
        print(f"[LOGIN] {site_name} 状态不确定（严格模式按未登录）")
        return False


def wait_for_login_confirmation(site_name):
    """
    阻塞等待用户扫码登录完成：
    - 交互式（有 stdin TTY / 允许人工回车）：等待用户按回车键继续
    - 非交互式（定时任务 / stdin 被 ignore / 设置了 CRAWLER_SKIP_LOGIN_INPUT=1）：
      跳过 input()，交给 check_site_login + 持久化 chrome_scraper_profile 自动判断，
      避免定时任务永远卡在"按回车键"。
    """
    import os, sys
    skip_input = os.environ.get("CRAWLER_SKIP_LOGIN_INPUT", "0") == "1"
    has_tty = False
    try:
        has_tty = sys.stdin is not None and hasattr(sys.stdin, "isatty") and sys.stdin.isatty()
    except Exception:
        has_tty = False
    print(f"\n{'='*60}")
    print(f"  【扫码登录提醒】{site_name}")
    print(f"  请在弹出的浏览器窗口中完成 {site_name} 扫码登录")
    if has_tty and not skip_input:
        print(f"  登录成功后，在控制台按【回车键】继续执行爬虫...")
    else:
        print(f"  非交互式运行（CRAWLER_SKIP_LOGIN_INPUT=1 或 stdin=ignore）：")
        print(f"    将跳过按回车键，直接依赖 chrome_scraper_profile 的持久化登录态继续")
    print(f"  （登录信息将自动保存到 chrome_scraper_profile，下次无需重复扫码）")
    print(f"{'='*60}\n")
    if has_tty and not skip_input:
        try:
            input(">>> 登录完成后按回车键继续 <<<")
        except EOFError:
            print(f"[LOGIN] {site_name} stdin 已关闭（EOF），跳过回车确认")
    else:
        print(">>> [非交互式] 跳过按回车键，直接继续 <<<")
    print(f"[LOGIN] {site_name} 用户已确认登录，继续执行爬虫")

# ================== 关键词配置 ==================
# 固定仅使用【计算机】，不使用其他配套关键词
KEYWORDS = ["计算机"]

# ================== 非 IT 技术岗位黑名单 ==================
# 全部采集汇总完成后，再做岗位过滤，剔除销售、文员、人事、司机这类非 IT 技术无关岗位
# 通过岗位名称、岗位描述关键词黑名单过滤，不在采集阶段直接丢弃
NON_IT_KEYWORDS = [
    # 销售/商务类
    "销售", "销售员", "销售代表", "销售经理", "销售助理", "销售总监",
    "业务员", "业务代表", "商务", "商务代表", "商务经理",
    "渠道", "渠道销售", "电话销售", "网络销售", "大客户", "客户经理",
    "招商", "招商经理", "拓展", "BD", "渠道拓展",
    # 文员/行政类
    "文员", "行政", "行政文员", "前台", "前台文员", "行政助理",
    "行政专员", "行政经理", "后勤", "内勤", "文秘", "秘书",
    # 人事类
    "人事", "人事专员", "人事经理", "人事主管", "HR", "招聘专员",
    "招聘", "HRBP", "人力资源", "培训专员",
    # 司机/物流类
    "司机", "驾驶员", "配送", "快递", "物流", "货运", "押运",
    # 保安/保洁/普工类
    "保安", "保洁", "普工", "操作工", "包装工", "搬运工",
    # 餐饮/服务类
    "服务员", "厨师", "厨师长", "店长", "导购", "收银", "迎宾",
    # 客服类
    "客服", "客服专员", "客服代表", "接线员", "话务员",
    # 财务/会计类（非 IT 技术岗位）
    "出纳", "会计", "会计助理",
]

# 岗位名称中包含这些「强 IT 技术词」的，即使命中黑名单也保留（避免误杀）
IT_RESCUE_KEYWORDS = [
    "软件", "算法", "数据", "开发", "测试", "运维", "后端", "前端",
    "全栈", "架构", "数据库", "DBA", "运维", "测试", "安全",
    "嵌入式", "硬件", "网络", "系统", "Java", "Python", "Golang",
    "C++", "C#", ".NET", "PHP", "JavaScript", "前端", "后端",
    "机器学习", "深度学习", "人工智能", "AI", "大数据", "云计算",
    "计算机", "IT", "互联网", "研发", "技术", "工程师", "程序员",
]


def get_project_root():
    """获取项目根目录（IT学习与就业数据可视化导航系统/）"""
    return Path(__file__).parent.absolute()


def parse_salary_to_avg(salary_str):
    """将薪资字符串解析为月薪平均值（整数）"""
    if not salary_str or str(salary_str).strip() in ('', '面议', '面谈'):
        return 0
    m = re.search(r'([\d.]+)\s*-?\s*([\d.]+)?\s*(万|千)?', str(salary_str))
    if not m:
        return 0
    try:
        lo = float(m.group(1))
    except (ValueError, TypeError):
        return 0
    try:
        hi = float(m.group(2)) if m.group(2) else lo
    except (ValueError, TypeError):
        hi = lo
    unit = m.group(3) or ''
    mult = 10000 if unit == '万' else 1000 if unit == '千' else 1
    return round((lo + hi) / 2 * mult)


def extract_city(city_str):
    """提取城市名：取第一段（按 · - 切分）"""
    if not city_str:
        return ''
    parts = re.split(r'[·\-/]', str(city_str))
    return parts[0].strip()


def is_it_job(job_name, job_desc=""):
    """判断是否为 IT 技术岗位：命中黑名单且不含 IT 救援词 → 剔除"""
    text = f"{job_name or ''} {job_desc or ''}"
    # 救援词命中 → 保留
    for kw in IT_RESCUE_KEYWORDS:
        if kw and kw.lower() in text.lower():
            return True
    # 命中黑名单 → 剔除
    for kw in NON_IT_KEYWORDS:
        if kw and kw in text:
            return False
    # 默认保留（关键词已是【计算机】，相关岗位默认保留）
    return True


def filter_non_it_jobs(jobs):
    """
    后置过滤：全部采集汇总完成后，剔除销售、文员、人事、司机等非 IT 技术无关岗位
    输入 jobs: list[dict]，字段至少包含 job_name（或 岗位名称）
    返回过滤后的列表
    """
    before = len(jobs)
    filtered = []
    for job in jobs:
        name = job.get('job_name') or job.get('岗位名称') or ''
        desc = job.get('job_desc') or job.get('职位描述') or ''
        if is_it_job(name, desc):
            filtered.append(job)
    after = len(filtered)
    logging.info(f"【后置过滤】非IT岗位剔除：原 {before} 条 → 过滤后 {after} 条（剔除 {before - after} 条）")
    print(f"[FILTER] 非IT岗位剔除：原 {before} 条 → 过滤后 {after} 条（剔除 {before - after} 条）")
    return filtered


def _build_dedup_key(job):
    """构建去重键：【公司全称 + 岗位名称 + 岗位唯一ID】
    岗位唯一ID优先使用平台返回的 jobId/岗位详情页URL，缺失时退化为 公司+岗位+薪资+城市"""
    company = (job.get('company') or job.get('公司名称') or job.get('公司') or '').strip()
    job_name = (job.get('job_name') or job.get('岗位名称') or job.get('职位') or '').strip()
    # 岗位唯一ID：优先用平台ID或详情页链接
    job_id = (
        job.get('job_id') or job.get('jobId') or job.get('jobID')
        or job.get('职位详情页') or job.get('jobHref')
        or job.get('job_url') or ''
    )
    job_id = str(job_id).strip()
    if not job_id:
        # 缺失唯一ID时退化使用 公司+岗位+薪资+城市，避免误删同岗位多城市/多次发布
        salary = (job.get('salary_avg') or job.get('薪资') or job.get('salary') or '').strip()
        city = (job.get('city') or job.get('城市') or '').strip()
        job_id = f"{salary}|{city}"
    return f"{company}::{job_name}::{job_id}"


def dedup_jobs(jobs):
    """
    去重：放在全部关键词、全部城市、全部页面采集、无关岗位过滤完成之后
    判定标准：【公司全称 + 岗位名称 + 岗位唯一ID】
    同岗位多城市分发招聘、同岗位多次发布，不盲目删除
    """
    before = len(jobs)
    seen = set()
    deduped = []
    for job in jobs:
        key = _build_dedup_key(job)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(job)
    after = len(deduped)
    logging.info(f"【去重】{before} 条 → 去重后 {after} 条（删除 {before - after} 条重复）")
    print(f"[DEDUP] {before} 条 → 去重后 {after} 条（删除 {before - after} 条重复）")
    return deduped


def normalize_to_system_format(jobs):
    """将各平台抓取的岗位数据统一为前端 all_cleaned_jobs.json 的字段格式"""
    normalized = []
    for job in jobs:
        job_name = (job.get('job_name') or job.get('岗位名称') or job.get('职位') or '').strip()
        company = (job.get('company') or job.get('公司名称') or job.get('公司') or '').strip()
        city = extract_city(job.get('city') or job.get('城市') or '')
        education = (job.get('education') or job.get('学历要求') or job.get('学历') or '不限').strip() or '不限'
        work_exp = (job.get('work_exp') or job.get('经验要求') or job.get('经验') or '不限').strip() or '不限'
        salary_raw = job.get('salary') or job.get('薪资') or ''
        salary_avg = job.get('salary_avg')
        if not salary_avg:
            salary_avg = parse_salary_to_avg(salary_raw)
        data_source = (job.get('data_source') or job.get('数据来源') or '').strip()

        item = {
            "job_name": job_name,
            "city": city,
            "education": education,
            "work_exp": work_exp,
            "company": company,
            "salary_avg": int(salary_avg) if salary_avg else 0,
            "data_source": data_source,
        }
        # 保留岗位唯一ID用于后续去重追溯
        job_id = (
            job.get('job_id') or job.get('jobId') or job.get('jobID')
            or job.get('职位详情页') or job.get('jobHref') or ''
        )
        if job_id:
            item['job_id'] = str(job_id).strip()
        normalized.append(item)
    return normalized


def save_snapshot(jobs, base_dir=None):
    """
    新建 snapshots 文件夹（不存在则自动创建）
    把本次抓取的全量岗位数据另存为带时间戳的快照文件
    命名格式：20260818_2200_jobs.json
    返回快照文件路径
    """
    base_dir = Path(base_dir) if base_dir else get_project_root()
    snapshots_dir = base_dir / "snapshots"
    snapshots_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime('%Y%m%d_%H%M')
    snapshot_path = snapshots_dir / f"{ts}_jobs.json"

    with open(snapshot_path, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)

    logging.info(f"【历史快照】已保存：{snapshot_path}（共 {len(jobs)} 条）")
    print(f"[SNAPSHOT] 历史快照已保存：{snapshot_path}（共 {len(jobs)} 条）")
    return str(snapshot_path)


def _read_existing_main(main_path):
    """读取覆盖前的主文件，用于审计日志比对新增/删除/写入前后总条数"""
    try:
        if main_path.exists():
            with open(main_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logging.warning(f"读取主文件用于审计比对失败: {e}")
    return []


# ================== 持久化模式锁定 ==================
# 正式采集统一使用「合并模式」，区分合并/覆盖两套逻辑：
#   - "merge"     合并模式（正式采集默认）：新岗位与主文件现有数据合并去重，单次部分采集失败不会丢已有数据
#   - "overwrite" 覆盖模式：用新岗位集合直接替换主文件，部分采集失败会丢失已有岗位数据
# ⚠️ 禁止随意切换为 overwrite 覆盖模式，防止岗位数据意外丢失。
PERSIST_MODE = "merge"


def _merge_dedup(existing_jobs, new_jobs):
    """合并去重：以现有数据为底，追加新数据中不重复的岗位。
    去重键统一使用主文件约定 data_source|job_name|company|city（与 merge_all_sources /
    后端 /merge-crawler / data_change_logger 一致），不使用 job_id，确保新旧数据能正确去重。"""
    def _key(j):
        return f"{j.get('data_source', '')}|{j.get('job_name', '')}|{j.get('company', '')}|{j.get('city', '')}"
    seen = set()
    merged = []
    for j in list(existing_jobs) + list(new_jobs):
        k = _key(j)
        if k in seen:
            continue
        seen.add(k)
        merged.append(j)
    return merged


def _write_main_and_sync(jobs, base_dir):
    """写入主文件 all_cleaned_jobs.json 并同步到 public/dist/src/assets 等位置"""
    base_dir = Path(base_dir) if base_dir else get_project_root()
    main_path = base_dir / "backend" / "data" / "all_cleaned_jobs.json"

    # 写入前清洗 NaN/null 非法脏数据，避免后端 JSON 解析报错
    import math
    clean_jobs = []
    for it in jobs:
        clean_it = {}
        for k, v in it.items():
            if v is None:
                clean_it[k] = 0 if k == "salary_avg" else ""
            elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                clean_it[k] = 0 if k == "salary_avg" else ""
            else:
                clean_it[k] = v
        clean_jobs.append(clean_it)

    with open(main_path, 'w', encoding='utf-8') as f:
        json.dump(clean_jobs, f, ensure_ascii=False, indent=2, allow_nan=False)

    # 同步到其他位置
    sync_paths = [
        "public/data/all_cleaned_jobs.json",
        "dist/data/all_cleaned_jobs.json",
        "src/assets/all_cleaned_jobs.json",
        "all_cleaned_jobs.json",  # 项目根
    ]
    for rel in sync_paths:
        target = base_dir / rel
        if target.parent.exists():
            try:
                with open(target, 'w', encoding='utf-8') as f:
                    json.dump(clean_jobs, f, ensure_ascii=False, indent=2, allow_nan=False)
            except Exception as e:
                logging.warning(f"同步失败 {rel}: {e}")
    return str(main_path)


def overwrite_main_json(jobs, base_dir=None):
    """
    【覆盖模式】用新岗位集合直接替换主文件 all_cleaned_jobs.json。
    ⚠️ 禁止随意切换为覆盖模式：部分采集失败时会丢失已有岗位数据。
       正式采集统一使用合并模式（PERSIST_MODE='merge'，见 merge_main_json）。
    """
    base_dir = Path(base_dir) if base_dir else get_project_root()
    main_path = _write_main_and_sync(jobs, base_dir)
    logging.warning(f"【覆盖主文件·高风险模式】{main_path}（共 {len(jobs)} 条）— 正式采集应使用合并模式")
    print(f"[OVERWRITE] 主文件已覆盖（覆盖模式·高风险）：{main_path}（共 {len(jobs)} 条）")
    return main_path


def merge_main_json(jobs, base_dir=None):
    """
    【合并模式·正式采集默认】新岗位与主文件现有数据合并去重后写入。
    优势：单次部分采集失败（如某站点被风控返回0条）不会丢失已有岗位数据，防止岗位数据意外丢失。
    返回合并后的全量岗位列表。
    """
    base_dir = Path(base_dir) if base_dir else get_project_root()
    main_path_full = base_dir / "backend" / "data" / "all_cleaned_jobs.json"
    existing = _read_existing_main(main_path_full)
    merged = _merge_dedup(existing, jobs)
    main_path = _write_main_and_sync(merged, base_dir)
    logging.info(f"【合并主文件】原有 {len(existing)} + 本次 {len(jobs)} → 合并后 {len(merged)} 条：{main_path}")
    print(f"[MERGE] 合并主文件：原有 {len(existing)} + 本次 {len(jobs)} → 合并后 {len(merged)} 条")
    return merged


def save_unified_csv(jobs, date_str, base_dir=None):
    """
    统一 CSV 表头输出（保留原有 CSV 统一表头能力）
    字段：数据来源, 关键词, 岗位名称, 薪资, 城市, 经验要求, 学历要求, 公司名称
    """
    import csv
    base_dir = Path(base_dir) if base_dir else get_project_root()
    csv_path = base_dir / f"全国IT岗位_{date_str}.csv"
    fieldnames = ["数据来源", "关键词", "岗位名称", "薪资", "城市", "经验要求", "学历要求", "公司名称"]
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for job in jobs:
            writer.writerow({
                "数据来源": job.get("data_source", ""),
                "关键词": "计算机",
                "岗位名称": job.get("job_name", ""),
                "薪资": job.get("salary_avg", 0),
                "城市": job.get("city", ""),
                "经验要求": job.get("work_exp", ""),
                "学历要求": job.get("education", ""),
                "公司名称": job.get("company", ""),
            })
    logging.info(f"【CSV】统一表头已保存：{csv_path}（共 {len(jobs)} 条）")
    print(f"[CSV] 统一表头已保存：{csv_path}（共 {len(jobs)} 条）")
    return str(csv_path)


def random_delay(min_s=2.0, max_s=5.0):
    """每页增加随机延时，优化反爬适配"""
    t = random.uniform(min_s, max_s)
    time.sleep(t)
    return t


def log_crawl_detail(site, city, keyword, total_pages, raw_count, filtered_count, deduped_count):
    """
    增加采集明细日志：每个站点、每个城市单独输出
    关键词、城市名称、总遍历页数、原始未去重条数、过滤后条数、最终去重后条数
    """
    msg = (
        f"【采集明细】站点={site} | 城市={city} | 关键词={keyword} | "
        f"总遍历页数={total_pages} | 原始未去重条数={raw_count} | "
        f"过滤后条数={filtered_count} | 最终去重后条数={deduped_count}"
    )
    logging.info(msg)
    print(msg)


def log_global_summary(all_jobs, snapshot_path, per_site_stats):
    """全局汇总日志：各站点总页数、总抓取条数、本次抓取岗位总数、历史快照保存路径"""
    print("\n" + "=" * 60)
    print("【无地域限制全量采集】汇总报告")
    print("=" * 60)
    for site, stats in per_site_stats.items():
        print(f"  {site}: 总页数={stats.get('total_pages', 0)}, 总抓取条数={stats.get('raw_count', 0)}")
    print(f"  主库总条数（合并后）：{len(all_jobs)} 条")
    print(f"  历史快照保存路径：{snapshot_path}")
    print(f"  主文件写入：all_cleaned_jobs.json（合并模式）")
    print("=" * 60)
    logging.info(
        f"【无地域限制全量采集】完成 | 主库总条数(合并后)={len(all_jobs)} | 快照={snapshot_path}"
    )


def post_process_and_persist(raw_jobs, base_dir=None, save_csv=True, date_str=None):
    """
    统一后置处理流程：
    1. 全部采集汇总完成后 → 后置过滤（剔除非 IT 岗位）
    2. 过滤完成后 → 去重（公司全称 + 岗位名称 + 岗位唯一ID）
    3. 统一字段格式
    4. 保存历史快照 snapshots/{YYYYMMDD_HHMM}_jobs.json
    5. 覆盖 all_cleaned_jobs.json（前端统一读取）
    6. （可选）保存统一 CSV
    返回 (snapshot_path, main_path)
    """
    base_dir = Path(base_dir) if base_dir else get_project_root()
    if not date_str:
        date_str = datetime.now().strftime('%Y%m%d')

    logging.info(f"【后置处理开始】原始岗位数：{len(raw_jobs)} 条")
    print(f"\n[POST] 后置处理开始，原始岗位数：{len(raw_jobs)} 条")

    # 1. 后置过滤非 IT 岗位
    filtered = filter_non_it_jobs(raw_jobs)

    # 2. 统一字段格式（先归一化再去重，确保字段一致）
    normalized = normalize_to_system_format(filtered)

    # 3. 去重
    deduped = dedup_jobs(normalized)

    # 4. 读取写入前主文件，用于合并 + 数据变更审计日志比对
    main_path_for_audit = base_dir / "backend" / "data" / "all_cleaned_jobs.json"
    old_jobs = _read_existing_main(main_path_for_audit)
    before_count = len(old_jobs)

    # 5. 持久化主文件（合并模式为正式采集默认，禁止随意切换覆盖模式）
    if PERSIST_MODE == "overwrite":
        # ⚠️ 覆盖模式：部分采集失败会丢数据，正式环境禁止使用
        logging.warning("【警告】当前使用覆盖模式持久化，存在丢数据风险，正式采集应使用合并模式")
        final_jobs = deduped
        main_path = overwrite_main_json(deduped, base_dir)
    else:
        # 合并模式（默认）：与主文件现有数据合并去重，防止部分采集失败导致丢数据
        final_jobs = merge_main_json(deduped, base_dir)
        main_path = str(main_path_for_audit)

    # 6. 保存历史快照（保存最终入库集合作为数据回滚兜底；snapshots 永久保留，不可自动清理）
    snapshot_path = save_snapshot(final_jobs, base_dir)

    # 7. 数据变更审计日志：记录本次爬虫全量采集的新增/删除/写入前后总条数/快照归档
    added_count, removed_count = data_change_logger.compute_diff(old_jobs, final_jobs)
    sources = sorted({j.get('data_source', '') for j in final_jobs if j.get('data_source')})
    data_change_logger.log_data_change(
        operation_type="爬虫全量采集",
        sources=sources,
        added_count=added_count,
        removed_count=removed_count,
        before_count=before_count,
        after_count=len(final_jobs),
        snapshot_name=Path(snapshot_path).name,
        base_dir=base_dir,
    )

    # 8. 强制重载 Express 后端缓存，清除内存缓存，使前端大屏立即加载最新数据
    data_change_logger.reload_backend_cache(base_dir=base_dir)

    # 9. 保存统一 CSV
    if save_csv:
        save_unified_csv(final_jobs, date_str, base_dir)

    logging.info(f"【后置处理完成】最终入库：{len(final_jobs)} 条（本次采集去重 {len(deduped)} 条）")
    print(f"[POST] 后置处理完成，最终入库：{len(final_jobs)} 条（本次采集去重 {len(deduped)} 条）")
    return snapshot_path, main_path, final_jobs
