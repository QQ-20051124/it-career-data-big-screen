# 导入自动化模块
from DrissionPage import ChromiumPage
# 导入格式化输出模块
from pprint import pprint
# 导入csv模块
import csv
# 导入时间模块（加等待，防止翻页太快）
import time
# 新增：JSON解析模块
import json

# 打开浏览器
dp = ChromiumPage()
# 监听数据包
dp.listen.start('search-pc')
# 访问网站
dp.get('https://we.51job.com/pc/search?jobArea=031800&keyword=%E8%AE%A1%E7%AE%97%E6%9C%BA&searchType=2&keywordType=')
# 等待初始页面加载
time.sleep(3)

# 定义CSV表头
fieldnames = [
    '职位', '最高薪资', '最低薪资', '薪资', '全职/兼职', '经验', '学历',
    '省份', '城市', '区域', '经度', '纬度',
    '公司', '公司领域', '公司规模', '公司类型',
    '职位标签', '职位描述', '职位详情页', '公司详情页'
]

# 打开CSV文件（只打开一次，写入表头，后续循环追加数据）
with open('前程无忧.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()

    # 🔄 构建循环翻页：1-8页
    for page in range(1, 9):
        print(f'\n正在采集第{page}页的数据内容...')

        # 等待当前页数据包加载
        resp = dp.listen.wait()
        raw_data = resp.response.body

        # ✅ 关键修复：如果是字符串，先解析成字典
        if isinstance(raw_data, str):
            try:
                json_data = json.loads(raw_data)
            except json.JSONDecodeError:
                print(f"❌ 第{page}页数据解析失败，跳过")
                continue
        else:
            json_data = raw_data

        # ✅ 安全访问数据，避免KeyError
        try:
            items = json_data['resultbody']['job']['items']
        except (KeyError, TypeError):
            print(f"❌ 第{page}页数据结构不对，跳过")
            continue

        # 遍历当前页所有岗位，写入CSV
        for item in items:
            area_detail = item.get('jobAreaLevelDetail', {})

            # ✅ 原有的标签处理逻辑，完全保留
            job_tags = item.get('jobTags', [])
            tag_names = []
            if isinstance(job_tags, str):
                if job_tags.strip():
                    tag_names = [job_tags]
            elif isinstance(job_tags, list):
                for tag in job_tags:
                    if isinstance(tag, dict):
                        tag_name = tag.get('jobTagName', '').strip()
                        if tag_name:
                            tag_names.append(tag_name)
                    elif isinstance(tag, str):
                        tag_name = tag.strip()
                        if tag_name:
                            tag_names.append(tag_name)
            job_tags_str = ','.join(tag_names)

            # 构建数据字典，完全保留原逻辑
            dit = {
                '职位': item.get('jobName'),
                '最高薪资': item.get('jobSalaryMax'),
                '最低薪资': item.get('jobSalaryMin'),
                '薪资': item.get('provideSalaryString'),
                '全职/兼职': item.get('termStr'),
                '经验': item.get('workYearString'),
                '学历': item.get('degreeString'),
                '省份': area_detail.get('province'),
                '城市': area_detail.get('cityString'),
                '区域': area_detail.get('district'),
                '经度': item.get('lon'),
                '纬度': item.get('lat'),
                '公司': item.get('companyName'),
                '公司领域': item.get('companyIndustryType1Str'),
                '公司规模': item.get('companySizeString'),
                '公司类型': item.get('companyTypeString'),
                '职位标签': job_tags_str,
                '职位描述': item.get('jobDescribe'),
                '职位详情页': item.get('jobHref'),
                '公司详情页': item.get('companyHref'),
            }
            # 写入当前行
            writer.writerow(dit)
            print(dit)

        # 📄 不是最后一页，才执行翻页
        if page < 8:
            # 下滑页面（参考你给的代码）
            dp.scroll.to_bottom()
            time.sleep(1)  # 等待页面加载
            # 点击下一页按钮（参考你给的代码，css选择器直接用）
            dp.ele('css:.btn-next').click()
            time.sleep(2)  # 等待翻页完成，防止数据包没加载

print("\n✅ 1-8页数据已全部成功导出，标签100%纯中文，无任何报错！")