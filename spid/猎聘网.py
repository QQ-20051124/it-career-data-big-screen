# 导入自动化模块
from DrissionPage import ChromiumPage, ChromiumOptions
# 导入格式化输出模块
from pprint import pprint
# 导入csv模块
import csv
# 导入时间模块
import time

# 打开浏览器
dp = ChromiumPage()
# 监听数据包（用完整唯一关键词，精准匹配岗位接口）
dp.listen.start('com.liepin.searchfront4c.pc-search-job')
# 访问网站：关键词=计算机
dp.get('https://www.liepin.com/zhaopin/?key=计算机')
time.sleep(3)

# --------------------------
# 正确CSV操作（放在爬取之后！）
# --------------------------
# 创建文件对象
f = open('猎聘网.csv', mode='w', encoding='utf-8-sig', newline='')
# 字典写入的方法：fieldnames必须是列表，且赋值给csv_writer
fieldnames = [
    '岗位名称',
    '薪资',
    '城市',
    '学历',
    '经验',
    '公司',
    '公司行业',
    '公司规模',
]
csv_writer = csv.DictWriter(f, fieldnames=fieldnames)
# 写入表头
csv_writer.writeheader()

# --------------------------
# 构建循环翻页（爬1-9页，正确顺序：循环套住所有操作）
# --------------------------
for page in range(1, 11):
    print(f'正在采集第{page}页的数据内容')

    # 循环等待，直到抓到当前页的岗位数据接口，跳过配置接口
    while True:
        resp = dp.listen.wait()
        json_data = resp.response.body
        # 判断是否是岗位数据接口
        if 'data' in json_data and 'data' in json_data['data'] and 'jobCardList' in json_data['data']['data']:
            print(f"✅ 抓到第{page}页【计算机】岗位数据接口！")
            break
        else:
            print("❌ 抓到配置接口，继续等待...")
            continue

    # 提取当前页的信息列表（每一页都重新提取！）
    jobCardList = json_data['data']['data']['jobCardList']

    # for循环遍历当前页数据
    for jobCard in jobCardList:
        job_info = jobCard.get("job", {})
        comp_info = jobCard.get("comp", {})

        dit = {
            '岗位名称': job_info.get('title', ''),
            '薪资': job_info.get('salary', ''),
            '城市': job_info.get('dq', ''),
            '学历': job_info.get('requireEduLevel', ''),
            '经验': job_info.get('requireWorkYears', ''),
            '公司': comp_info.get('compName', ''),
            '公司行业': comp_info.get('compIndustry', ''),
            '公司规模': comp_info.get('compScale', ''),

        }

        # 写入数据（放在循环里！）
        csv_writer.writerow(dit)
        pprint(dit)

    # 下滑页面
    dp.scroll.to_bottom()
    time.sleep(2)
    # 点击下一页按钮（猎聘网正确CSS选择器！）
    next_btn = dp.ele('css:.ant-pagination-next', timeout=10)
    if next_btn:  # 加判断，避免最后一页找不到按钮报错
        next_btn.click()
        time.sleep(3)
    else:
        print("✅ 已到最后一页，停止翻页！")
        break

# 关闭文件
f.close()
print("\n✅ 数据已成功保存到 猎聘网.csv！")