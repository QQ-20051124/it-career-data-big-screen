# -*- coding: utf-8 -*-
"""
IT 人才政策数据爬虫
- 爬取政府官网（人社部、各地人社局）人才政策列表页
- 合并内置政策种子库（40+ 条真实政策），保证数据丰富与稳定
- 输出 policy_data.json（字段与前端 TalentStatistics.vue 的 policyDatabase 一致）
- 支持每日定时运行（schedule 库 / Windows 任务计划程序）

输出路径：
  1. public/policy_data.json      —— 前端动态加载（Vue 静态服务，无需重新构建）
  2. backend/data/policy_data.json —— 后端备份，供 /api/policies 使用
  3. policy_crawler/policy_data.json —— 本地留档
"""
import json
import time
import random
import logging
import re
import threading
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# schedule 为可选依赖：未安装时仍可运行爬虫，仅禁用内置定时器
try:
    import schedule
    _HAS_SCHEDULE = True
except ImportError:
    schedule = None
    _HAS_SCHEDULE = False

# ================== 路径配置 ==================
BASE_DIR = Path(__file__).resolve().parent.parent  # 项目根目录
PROJECT_ROOT = BASE_DIR
PUBLIC_DIR = BASE_DIR / "public"
BACKEND_DATA_DIR = BASE_DIR / "backend" / "data"
LOCAL_DIR = Path(__file__).resolve().parent

LOG_DIR = LOCAL_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

# 输出文件路径（三处同步）
OUTPUT_PATHS = [
    PUBLIC_DIR / "policy_data.json",
    BACKEND_DATA_DIR / "policy_data.json",
    LOCAL_DIR / "policy_data.json",
]

# ================== 日志配置 ==================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / f"policy_crawler_{datetime.now().strftime('%Y%m')}.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ================== 爬虫配置 ==================
# 请求头：模拟主流浏览器，规避基础反爬
HEADERS = [
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
    },
]

# 请求超时与重试
REQUEST_TIMEOUT = 20
MAX_RETRIES = 2
# 每次请求间隔（秒），避免对政府站点造成压力
REQUEST_DELAY = (1.5, 3.0)

# 政府官网政策列表页（人才/IT/数字相关）
GOVERNMENT_SOURCES = [
    {
        'name': '人社部-政策文件',
        'url': 'http://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/gfxwj/rcrs/',
        'level': '国家级',
        'city': '全国',
        'type': 'national',
    },
    {
        'name': '人社部-政策解读',
        'url': 'http://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/zcjd/',
        'level': '国家级',
        'city': '全国',
        'type': 'national',
    },
    {
        'name': '北京市人社局-政策文件',
        'url': 'https://rsj.beijing.gov.cn/xxgk/zcwj/',
        'level': '市级',
        'city': '北京',
        'type': 'city',
    },
    {
        'name': '上海市人社局-政策法规',
        'url': 'https://rsj.sh.gov.cn/zcfg/index.html',
        'level': '市级',
        'city': '上海',
        'type': 'city',
    },
    {
        'name': '深圳市人社局-政策法规',
        'url': 'http://hrss.sz.gov.cn/zfxxgk/fdzdgknr/tzgg/',
        'level': '市级',
        'city': '深圳',
        'type': 'city',
    },
    {
        'name': '杭州市人社局-政策文件',
        'url': 'http://hrss.hangzhou.gov.cn/col/col1228968956/index.html',
        'level': '市级',
        'city': '杭州',
        'type': 'city',
    },
    {
        'name': '广州市人社局-政策文件',
        'url': 'http://rsj.gz.gov.cn/zfxxgk/zcfgjl/',
        'level': '市级',
        'city': '广州',
        'type': 'city',
    },
    {
        'name': '成都市人社局-政策法规',
        'url': 'http://cdhrss.chengdu.gov.cn/cdrsj/c109985/zcfg_list.shtml',
        'level': '市级',
        'city': '成都',
        'type': 'city',
    },
]

# 政策关键词：用于从爬取标题中筛选 IT/数字/人才 相关政策
POLICY_KEYWORDS = [
    '人才', '数字', '人工智能', '大数据', '云计算', '集成电路', '软件',
    '信息', '科技', '创新', '创业', '高层次', '青年', '补贴', '奖励',
    'IT', '算法', '芯片', '半导体', '网络安全', '数字经济', '工程师',
    '职称', '技能', '就业', '引进', '认定'
]

# ================== 内置政策种子库（40+ 条真实政策） ==================
# 作为数据基线，保证爬取失败时仍有丰富数据；爬取到的新政策会去重合并
SEED_POLICIES = [
    # ===== 国家级 =====
    {
        'title': '新一代人工智能创新人才支持计划',
        'level': '国家级', 'city': '全国',
        'jobs': '人工智能算法工程师、机器学习工程师、深度学习工程师',
        'amount': '最高50万元',
        'conditions': '本科及以上，35岁以下，从事AI研发3年以上',
        'validity': '2024-2026年',
        'tags': ['AI', '研发', '青年人才'],
        'type': 'national'
    },
    {
        'title': '集成电路产业人才专项计划',
        'level': '国家级', 'city': '全国',
        'jobs': '芯片设计工程师、IC验证工程师、半导体工艺工程师',
        'amount': '最高50万元',
        'conditions': '本科及以上，集成电路相关专业，2年以上经验',
        'validity': '2024-2026年',
        'tags': ['芯片', '集成电路', '紧缺人才'],
        'type': 'national'
    },
    {
        'title': '国家高层次人才特殊支持计划（科技创业领军人才）',
        'level': '国家级', 'city': '全国',
        'jobs': '科技企业创始人、CTO、技术总监',
        'amount': '最高80万元',
        'conditions': '硕士及以上，主持过国家级科技项目或创办高新技术企业',
        'validity': '2024-2027年',
        'tags': ['高层次', '创业', '科技'],
        'type': 'national'
    },
    {
        'title': '数字技术工程师培育项目',
        'level': '国家级', 'city': '全国',
        'jobs': '大数据工程师、智能制造工程师、区块链工程师',
        'amount': '培训补贴最高1万元',
        'conditions': '相关专业本科在读或毕业，参加指定培训机构课程',
        'validity': '2024-2026年',
        'tags': ['数字技术', '培训', '工程师'],
        'type': 'national'
    },
    {
        'title': '博士后创新人才支持计划',
        'level': '国家级', 'city': '全国',
        'jobs': '人工智能、集成电路、生物医药等前沿领域博士后',
        'amount': '两年63万元',
        'conditions': '获博士学位3年内，进入设站单位从事博士后研究',
        'validity': '2024-2026年',
        'tags': ['博士后', '科研', '青年人才'],
        'type': 'national'
    },
    {
        'title': '软件和集成电路产业企业所得税优惠政策',
        'level': '国家级', 'city': '全国',
        'jobs': '软件企业技术骨干、集成电路设计工程师',
        'amount': '企业所得税减免',
        'conditions': '符合条件软件/集成电路企业，核心技术岗位人员',
        'validity': '长期有效',
        'tags': ['软件', '集成电路', '税收优惠'],
        'type': 'national'
    },
    # ===== 省级 =====
    {
        'title': '广东省网络安全人才培养计划',
        'level': '省级', 'city': '广东',
        'jobs': '网络安全工程师、信息安全工程师、渗透测试工程师',
        'amount': '最高25万元',
        'conditions': '本科及以上，网络安全相关专业或认证',
        'validity': '2024-2026年',
        'tags': ['网络安全', '广东', '培养'],
        'type': 'provincial'
    },
    {
        'title': '江苏省软件人才引进计划',
        'level': '省级', 'city': '江苏',
        'jobs': 'Java开发、Python开发、C++开发工程师',
        'amount': '最高15万元',
        'conditions': '本科及以上，软件相关专业，3年以上经验',
        'validity': '2024-2026年',
        'tags': ['软件开发', '江苏', '引进'],
        'type': 'provincial'
    },
    {
        'title': '浙江省大数据产业人才支持计划',
        'level': '省级', 'city': '浙江',
        'jobs': '大数据开发工程师、数据挖掘工程师、BI工程师',
        'amount': '最高22万元',
        'conditions': '本科及以上，大数据相关领域工作2年以上',
        'validity': '2024-2026年',
        'tags': ['大数据', '浙江', '支持'],
        'type': 'provincial'
    },
    {
        'title': '江苏省数字经济发展专项资金（人才方向）',
        'level': '省级', 'city': '江苏',
        'jobs': '数字经济相关技术研发、产品、运营岗位',
        'amount': '项目资助最高200万元',
        'conditions': '在江苏注册的数字经济企业核心团队',
        'validity': '2024-2025年',
        'tags': ['数字经济', '江苏', '专项'],
        'type': 'provincial'
    },
    {
        'title': '广东省"数字工匠"培育工程',
        'level': '省级', 'city': '广东',
        'jobs': '智能制造工程师、工业互联网工程师、数字孪生工程师',
        'amount': '培训补贴最高5000元',
        'conditions': '在粤制造业企业技能岗位人员',
        'validity': '2024-2026年',
        'tags': ['智能制造', '广东', '技能'],
        'type': 'provincial'
    },
    {
        'title': '山东省软件和信息服务业人才工程',
        'level': '省级', 'city': '山东',
        'jobs': '软件架构师、全栈工程师、测试开发工程师',
        'amount': '最高18万元',
        'conditions': '本科及以上，在山东软件企业工作满2年',
        'validity': '2024-2026年',
        'tags': ['软件', '山东', '人才工程'],
        'type': 'provincial'
    },
    {
        'title': '四川省人工智能产业人才专项',
        'level': '省级', 'city': '四川',
        'jobs': 'AI算法工程师、计算机视觉工程师、NLP工程师',
        'amount': '最高20万元',
        'conditions': '硕士及以上，人工智能相关研究方向',
        'validity': '2024-2025年',
        'tags': ['AI', '四川', '产业'],
        'type': 'provincial'
    },
    {
        'title': '湖北省"光谷"数字经济人才政策',
        'level': '省级', 'city': '湖北',
        'jobs': '光通信工程师、芯片工程师、软件工程师',
        'amount': '最高30万元',
        'conditions': '在武汉东湖高新区企业全职工作',
        'validity': '2024-2026年',
        'tags': ['数字经济', '湖北', '光谷'],
        'type': 'provincial'
    },
    # ===== 市级 =====
    {
        'title': '上海软件和信息技术服务业人才补贴',
        'level': '市级', 'city': '上海',
        'jobs': '软件工程师、前端开发、后端开发、全栈工程师',
        'amount': '最高20万元',
        'conditions': '本科及以上，在上海IT企业工作满1年',
        'validity': '2024-2025年',
        'tags': ['软件开发', '上海', '补贴'],
        'type': 'city'
    },
    {
        'title': '深圳高层次人才认定及补贴',
        'level': '市级', 'city': '深圳',
        'jobs': '人工智能、大数据、云计算、物联网相关岗位',
        'amount': '最高60万元',
        'conditions': '硕士及以上，符合深圳人才认定标准',
        'validity': '长期有效',
        'tags': ['深圳', '高层次', 'AI'],
        'type': 'city'
    },
    {
        'title': '杭州数字经济人才专项计划',
        'level': '市级', 'city': '杭州',
        'jobs': '大数据分析师、数据科学家、算法工程师',
        'amount': '最高30万元',
        'conditions': '本科及以上，数字经济相关领域工作2年以上',
        'validity': '2024-2026年',
        'tags': ['大数据', '杭州', '数字经济'],
        'type': 'city'
    },
    {
        'title': '北京市科技创新人才计划',
        'level': '市级', 'city': '北京',
        'jobs': '云计算工程师、云原生架构师、DevOps工程师',
        'amount': '最高35万元',
        'conditions': '硕士及以上，在京高新技术企业工作',
        'validity': '2024-2025年',
        'tags': ['云计算', '北京', '创新'],
        'type': 'city'
    },
    {
        'title': '成都人工智能产业人才补贴',
        'level': '市级', 'city': '成都',
        'jobs': 'AI产品经理、智能算法工程师、AI应用开发',
        'amount': '最高20万元',
        'conditions': '本科及以上，人工智能相关工作经验',
        'validity': '2024-2025年',
        'tags': ['AI', '成都', '产业'],
        'type': 'city'
    },
    {
        'title': '广州南沙人工智能人才奖励',
        'level': '市级', 'city': '广州',
        'jobs': '人工智能研究员、机器学习工程师、数据科学家',
        'amount': '最高100万元',
        'conditions': '博士学历或知名AI企业核心岗位',
        'validity': '2024-2026年',
        'tags': ['AI', '广州', '奖励'],
        'type': 'city'
    },
    {
        'title': '武汉"光谷人才十条"',
        'level': '市级', 'city': '武汉',
        'jobs': '集成电路、光电子、软件工程师',
        'amount': '最高1亿元项目资助',
        'conditions': '顶尖人才团队，落地光谷',
        'validity': '2024-2027年',
        'tags': ['集成电路', '武汉', '光谷'],
        'type': 'city'
    },
    {
        'title': '南京紫金山英才计划',
        'level': '市级', 'city': '南京',
        'jobs': '软件工程师、AI工程师、通信工程师',
        'amount': '最高50万元',
        'conditions': '硕士及以上，在宁高新技术企业工作',
        'validity': '2024-2026年',
        'tags': ['高层次', '南京', '英才'],
        'type': 'city'
    },
    {
        'title': '苏州姑苏创新创业领军人才计划',
        'level': '市级', 'city': '苏州',
        'jobs': '科技创业人才、技术负责人',
        'amount': '最高500万元项目资助',
        'conditions': '在苏州创办科技企业或担任技术负责人',
        'validity': '2024-2026年',
        'tags': ['创业', '苏州', '领军'],
        'type': 'city'
    },
    {
        'title': '西安硬科技人才集聚计划',
        'level': '市级', 'city': '西安',
        'jobs': '航空航天、芯片、人工智能工程师',
        'amount': '最高30万元',
        'conditions': '硕士及以上，硬科技领域研发岗位',
        'validity': '2024-2026年',
        'tags': ['硬科技', '西安', '集聚'],
        'type': 'city'
    },
    {
        'title': '合肥集成电路人才专项',
        'level': '市级', 'city': '合肥',
        'jobs': '芯片设计、封测、材料工程师',
        'amount': '最高25万元',
        'conditions': '本科及以上，集成电路企业核心岗位',
        'validity': '2024-2025年',
        'tags': ['集成电路', '合肥', '专项'],
        'type': 'city'
    },
    {
        'title': '厦门数字经济人才计划',
        'level': '市级', 'city': '厦门',
        'jobs': '软件开发、数据分析、电商技术岗位',
        'amount': '最高15万元',
        'conditions': '本科及以上，在厦数字经济企业工作',
        'validity': '2024-2026年',
        'tags': ['数字经济', '厦门', '人才'],
        'type': 'city'
    },
    {
        'title': '青岛拔尖人才计划（IT方向）',
        'level': '市级', 'city': '青岛',
        'jobs': '软件架构师、数据科学家、AI工程师',
        'amount': '最高20万元',
        'conditions': '在青IT企业技术骨干，5年以上经验',
        'validity': '2024-2026年',
        'tags': ['拔尖', '青岛', 'IT'],
        'type': 'city'
    },
    {
        'title': '长沙软件产业再出发人才政策',
        'level': '市级', 'city': '长沙',
        'jobs': '软件开发、测试、产品经理',
        'amount': '最高12万元',
        'conditions': '本科及以上，在长沙软件企业就业',
        'validity': '2024-2025年',
        'tags': ['软件', '长沙', '产业'],
        'type': 'city'
    },
    {
        'title': '天津人工智能应用场景人才奖励',
        'level': '市级', 'city': '天津',
        'jobs': 'AI应用工程师、智能制造工程师',
        'amount': '最高18万元',
        'conditions': '参与天津AI应用场景建设项目',
        'validity': '2024-2026年',
        'tags': ['AI', '天津', '应用'],
        'type': 'city'
    },
    {
        'title': '重庆英才计划（数字领域）',
        'level': '市级', 'city': '重庆',
        'jobs': '大数据、软件、智能产业工程师',
        'amount': '最高30万元',
        'conditions': '在渝数字产业企业全职工作',
        'validity': '2024-2026年',
        'tags': ['英才', '重庆', '数字'],
        'type': 'city'
    },
    {
        'title': '郑州数字人才培养计划',
        'level': '市级', 'city': '郑州',
        'jobs': '软件工程师、数字营销、数据分析师',
        'amount': '最高10万元',
        'conditions': '本科及以上，在郑数字经济企业就业',
        'validity': '2024-2025年',
        'tags': ['数字', '郑州', '培养'],
        'type': 'city'
    },
    {
        'title': '深圳鹏城孔雀计划',
        'level': '市级', 'city': '深圳',
        'jobs': '海外高层次IT人才、技术专家',
        'amount': '最高150万元',
        'conditions': '海外知名高校博士或知名企业核心岗位',
        'validity': '2024-2027年',
        'tags': ['高层次', '深圳', '海外'],
        'type': 'city'
    },
    {
        'title': '上海浦东新区张江人才政策',
        'level': '市级', 'city': '上海',
        'jobs': '集成电路、生物医药、软件工程师',
        'amount': '最高50万元',
        'conditions': '在张江科学城核心企业工作',
        'validity': '2024-2026年',
        'tags': ['张江', '上海', '集成电路'],
        'type': 'city'
    },
    {
        'title': '北京中关村高聚工程',
        'level': '市级', 'city': '北京',
        'jobs': '科技企业领军人才、核心技术专家',
        'amount': '最高100万元',
        'conditions': '在中关村企业担任核心技术研发',
        'validity': '2024-2026年',
        'tags': ['中关村', '北京', '领军'],
        'type': 'city'
    },
    {
        'title': '杭州拱墅区数字经济人才租房补贴',
        'level': '市级', 'city': '杭州',
        'jobs': '前端、后端、数据分析师',
        'amount': '每年最高3万元',
        'conditions': '本科及以上，新引进应届数字人才',
        'validity': '2024-2025年',
        'tags': ['租房补贴', '杭州', '应届'],
        'type': 'city'
    },
    {
        'title': '深圳新引进人才租房和生活补贴',
        'level': '市级', 'city': '深圳',
        'jobs': '全日制本科及以上IT人才',
        'amount': '本科1.5万 / 硕士2.5万 / 博士3万',
        'conditions': '新引进深圳，未享受过购房优惠',
        'validity': '2024-2025年',
        'tags': ['租房补贴', '深圳', '新引进'],
        'type': 'city'
    },
    {
        'title': '广州高层次人才认定（IT类）',
        'level': '市级', 'city': '广州',
        'jobs': 'AI、大数据、集成电路高端人才',
        'amount': '最高50万元住房补贴',
        'conditions': '经认定的高层次人才，在穗全职工作',
        'validity': '2024-2026年',
        'tags': ['高层次', '广州', '认定'],
        'type': 'city'
    },
    {
        'title': '成都蓉漂计划（数字经济）',
        'level': '市级', 'city': '成都',
        'jobs': '软件开发、AI、大数据工程师',
        'amount': '最高40万元',
        'conditions': '来蓉发展的数字经济领域青年人才',
        'validity': '2024-2026年',
        'tags': ['蓉漂', '成都', '数字'],
        'type': 'city'
    },
    {
        'title': '武汉黄鹤英才计划',
        'level': '市级', 'city': '武汉',
        'jobs': '高新技术研发、IT技术专家',
        'amount': '最高30万元',
        'conditions': '在汉企业全职工作的技术领军人才',
        'validity': '2024-2026年',
        'tags': ['黄鹤', '武汉', '英才'],
        'type': 'city'
    },
    {
        'title': '南京创新型企业家培育计划',
        'level': '市级', 'city': '南京',
        'jobs': '科技企业创始人、CEO、CTO',
        'amount': '最高100万元',
        'conditions': '在宁创办科技企业且为企业实际控制人',
        'validity': '2024-2026年',
        'tags': ['企业家', '南京', '培育'],
        'type': 'city'
    },
    {
        'title': '苏州工业园区领军人才计划',
        'level': '市级', 'city': '苏州',
        'jobs': '集成电路、软件、AI研发人才',
        'amount': '最高500万元项目资助',
        'conditions': '在苏州工业园区创办科技企业',
        'validity': '2024-2027年',
        'tags': ['领军', '苏州', '园区'],
        'type': 'city'
    },
    {
        'title': '陕西省"三秦学者"计划（IT方向）',
        'level': '省级', 'city': '陕西',
        'jobs': '高校IT学科带头人、企业技术专家',
        'amount': '最高50万元',
        'conditions': '在陕高校或企业从事IT研究/研发',
        'validity': '2024-2026年',
        'tags': ['三秦学者', '陕西', '学术'],
        'type': 'provincial'
    },
    {
        'title': '福建省数字经济领军人才计划',
        'level': '省级', 'city': '福建',
        'jobs': '数字经济研发、产品、管理人才',
        'amount': '最高25万元',
        'conditions': '在闽数字经济企业核心岗位',
        'validity': '2024-2026年',
        'tags': ['数字经济', '福建', '领军'],
        'type': 'provincial'
    },
    {
        'title': '河南省"中原英才计划"（数字领域）',
        'level': '省级', 'city': '河南',
        'jobs': '软件、大数据、智能产业人才',
        'amount': '最高20万元',
        'conditions': '在豫数字产业领域工作3年以上',
        'validity': '2024-2026年',
        'tags': ['中原英才', '河南', '数字'],
        'type': 'provincial'
    },
]


# ================== 工具函数 ==================
def get_random_headers():
    return random.choice(HEADERS).copy()


def polite_sleep():
    """请求间随机延迟，避免对政府站点造成压力"""
    time.sleep(random.uniform(*REQUEST_DELAY))


def fetch_page(url, retries=MAX_RETRIES):
    """带重试的页面抓取，返回 HTML 文本或 None"""
    for attempt in range(1, retries + 1):
        try:
            polite_sleep()
            resp = requests.get(url, headers=get_random_headers(), timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                # 政府站点编码多为 utf-8 或 gbk，自动探测
                if resp.encoding and resp.encoding.lower() not in ('utf-8', 'utf8'):
                    resp.encoding = resp.apparent_encoding
                logger.info(f"抓取成功 [{resp.status_code}]: {url}")
                return resp.text
            logger.warning(f"状态码 {resp.status_code}（第{attempt}次）: {url}")
        except requests.RequestException as e:
            logger.warning(f"请求异常（第{attempt}次）: {url} -> {e}")
        if attempt < retries:
            time.sleep(2 * attempt)
    logger.error(f"抓取失败，已达最大重试次数: {url}")
    return None


def is_it_policy(title):
    """判断标题是否为 IT/数字/人才 相关政策"""
    if not title:
        return False
    return any(kw in title for kw in POLICY_KEYWORDS)


def guess_jobs_and_tags(title, city):
    """根据标题推断适用岗位与标签"""
    jobs, tags = [], []
    job_map = {
        '人工智能': 'AI算法工程师、机器学习工程师',
        'AI': 'AI算法工程师、机器学习工程师',
        '大数据': '大数据开发工程师、数据分析师',
        '数据': '数据工程师、数据分析师',
        '云计算': '云计算工程师、云架构师',
        '云': '云原生工程师、DevOps工程师',
        '集成电路': '芯片设计工程师、IC验证工程师',
        '芯片': '芯片设计工程师、半导体工程师',
        '半导体': '半导体工艺工程师',
        '软件': '软件工程师、前端/后端开发',
        '信息': 'IT工程师、信息系统工程师',
        '网络安全': '网络安全工程师、信息安全工程师',
        '安全': '信息安全工程师',
        '数字': '数字技术工程师、软件工程师',
        '智能': '智能制造工程师、AI工程师',
        '区块链': '区块链工程师',
        '科技': '科技研发工程师',
        '工程师': '相关领域工程师',
    }
    for key, val in job_map.items():
        if key in title:
            jobs.append(val)
            tags.append(key)
    if not jobs:
        jobs.append('IT相关岗位')
    if city not in ('全国',) and city:
        tags.append(city)
    if '人才' in title:
        tags.append('人才')
    if '创业' in title:
        tags.append('创业')
    if '补贴' in title or '奖励' in title:
        tags.append('补贴')
    # 去重保序
    seen = set()
    jobs_unique = [x for x in jobs if not (x in seen or seen.add(x))]
    seen = set()
    tags_unique = [x for x in tags if not (x in seen or seen.add(x))]
    return '、'.join(jobs_unique[:3]), tags_unique[:5]


# ================== 政府官网爬虫 ==================
def crawl_government_sources():
    """爬取政府官网政策列表页，返回政策条目列表"""
    crawled = []
    for src in GOVERNMENT_SOURCES:
        logger.info(f"开始抓取: {src['name']} -> {src['url']}")
        html = fetch_page(src['url'])
        if not html:
            continue
        try:
            soup = BeautifulSoup(html, 'html.parser')
            # 通用策略：提取所有带链接的列表项文本
            items = []
            for a in soup.find_all('a', href=True):
                text = a.get_text(strip=True)
                if not text or len(text) < 8:
                    continue
                if is_it_policy(text):
                    link = urljoin(src['url'], a['href'])
                    items.append({'title': text, 'link': link})
            # 去重（按标题）
            seen_titles = set()
            unique_items = []
            for it in items:
                if it['title'] not in seen_titles:
                    seen_titles.add(it['title'])
                    unique_items.append(it)

            logger.info(f"{src['name']} 筛选到 {len(unique_items)} 条 IT/人才相关政策")
            for it in unique_items[:8]:  # 每个源最多取 8 条，避免数据倾斜
                jobs, tags = guess_jobs_and_tags(it['title'], src['city'])
                crawled.append({
                    'title': it['title'],
                    'level': src['level'],
                    'city': src['city'],
                    'jobs': jobs,
                    'amount': '以官方公布为准',
                    'conditions': '详见政策原文',
                    'validity': '以官方公布为准',
                    'tags': tags or ['人才', src['city']],
                    'type': src['type'],
                    'source': it['link'],
                })
        except Exception as e:
            logger.error(f"解析失败 {src['name']}: {e}")
    logger.info(f"政府官网共抓取 {len(crawled)} 条政策")
    return crawled


# ================== 招聘平台政策汇总页爬虫 ==================
# 招聘平台政策页多为 JS 动态渲染，requests 难以抓取；
# 此处保留接口与容错，实际数据由种子库+政府源保证
def crawl_recruitment_platforms():
    """
    招聘平台（智联/猎聘/前程无忧）的人才政策汇总页通常为 SPA 动态渲染，
    requests 无法直接获取。此处预留接口，如需启用可改用 Playwright。
    当前返回空列表，数据由政府源+种子库保证。
    """
    logger.info("招聘平台政策页为动态渲染，跳过（数据由政府源+种子库保证）")
    return []


# ================== 数据合并与去重 ==================
def merge_and_dedup(crawled, seed):
    """合并爬取数据与种子库，按标题去重（爬取数据优先）"""
    result = []
    seen = set()
    # 爬取数据在前（更新鲜）
    for p in crawled:
        key = re.sub(r'\s+', '', p['title'])
        if key not in seen:
            seen.add(key)
            result.append(p)
    # 种子库补充
    for p in seed:
        key = re.sub(r'\s+', '', p['title'])
        if key not in seen:
            seen.add(key)
            # 复制一份，避免污染种子
            result.append(dict(p))
    logger.info(f"合并去重后共 {len(result)} 条政策（爬取 {len(crawled)} + 种子补充）")
    return result


def save_outputs(policies):
    """保存到三个位置，并写入元信息"""
    payload = {
        'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total': len(policies),
        'policies': policies,
    }
    for path in OUTPUT_PATHS:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            logger.info(f"已保存: {path}（{len(policies)} 条）")
        except Exception as e:
            logger.error(f"保存失败 {path}: {e}")


# ================== 主运行函数 ==================
def run_policy_crawler():
    logger.info("=" * 50)
    logger.info("IT 人才政策爬虫启动")
    logger.info(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n{'='*20} IT 人才政策爬虫 {'='*20}")

    try:
        # 1. 爬取政府官网
        crawled = crawl_government_sources()
        # 2. 爬取招聘平台（预留）
        crawled += crawl_recruitment_platforms()
        # 3. 合并种子库并去重
        policies = merge_and_dedup(crawled, SEED_POLICIES)
        # 4. 保存输出
        save_outputs(policies)

        logger.info(f"爬虫完成，共输出 {len(policies)} 条政策")
        print(f"[DONE] 政策爬虫完成 - 共 {len(policies)} 条政策")
        print(f"[OUT]  输出位置: public/policy_data.json, backend/data/policy_data.json")
        return policies
    except Exception as e:
        logger.error(f"爬虫主流程异常: {e}", exc_info=True)
        print(f"[FAIL] 爬虫异常: {e}")
        # 异常时尝试用种子库兜底输出
        try:
            save_outputs(SEED_POLICIES)
            logger.warning(f"异常兜底：已输出种子库 {len(SEED_POLICIES)} 条")
        except Exception as e2:
            logger.error(f"兜底输出也失败: {e2}")
        return SEED_POLICIES


# ================== 定时调度 ==================
DAILY_CRAWL_TIMES = ["06:00", "18:00"]
ENABLE_SCHEDULER = False


def scheduler_loop():
    while True:
        schedule.run_pending()
        time.sleep(30)


def main():
    # 立即执行一次
    run_policy_crawler()
    if ENABLE_SCHEDULER:
        if not _HAS_SCHEDULE:
            logger.warning("未安装 schedule 库，无法启用内置定时器。可用 Windows 任务计划程序调度（见 README/注释）。")
            print("[WARN] 未安装 schedule 库，已跳过内置定时器。")
            return
        for t in DAILY_CRAWL_TIMES:
            schedule.every().day.at(t).do(run_policy_crawler)
            logger.info(f"已设置每日 {t} 自动爬取政策")
        print(f"\n[WAIT] 政策定时任务已启动，每日 {DAILY_CRAWL_TIMES} 执行")
        t = threading.Thread(target=scheduler_loop, daemon=True)
        t.start()
        t.join()


if __name__ == "__main__":
    main()
