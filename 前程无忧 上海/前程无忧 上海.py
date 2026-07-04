from DrissionPage import ChromiumPage
import csv
import time
import datetime
import os
import json

def load_existed_data():
    existed = set()
    if os.path.exists('final_jobs.csv'):
        try:
            with open('final_jobs.csv', 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    company = row.get('公司', '').strip()
                    city = row.get('城市', '').strip()
                    job = row.get('职位', '').strip()
                    key = (company, city, job)
                    existed.add(key)
        except:
            pass
    return existed

def write_job_to_csv(dit):
    fieldnames = [
        '职位', '最高薪资', '最低薪资', '薪资', '全职/兼职', '经验', '学历',
        '省份', '城市', '区域', '经度', '纬度',
        '公司', '公司领域', '公司规模', '公司类型',
        '职位标签', '职位描述', '职位详情页', '公司详情页', '爬取时间'
    ]
    file_exists = os.path.exists('final_jobs.csv')
    with open('final_jobs.csv', 'a', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow(dit)

def main():
    existed_keys = load_existed_data()
    print(f"上海开始爬取：{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    dp = ChromiumPage()
    dp.listen.start('search-pc')
    dp.get('https://we.51job.com/pc/search?jobArea=040000&keyword=计算机&searchType=2')
    time.sleep(3)

    for page in range(1, 9):
        try:
            resp = dp.listen.wait(timeout=10)
            json_data = resp.response.body
            if isinstance(json_data, str):
                json_data = json.loads(json_data)
        except:
            break

        items = json_data.get('resultbody', {}).get('job', {}).get('items', [])
        for item in items:
            job = item.get('jobName', '')
            company = item.get('companyName', '')
            area = item.get('jobAreaLevelDetail', {})
            city = area.get('cityString', '')
            key = (company.strip(), city.strip(), job.strip())
            if key in existed_keys:
                continue

            dit = {
                '职位': job,
                '公司': company,
                '城市': city,
                '省份': area.get('province', ''),
                '区域': area.get('district', ''),
                '薪资': item.get('provideSalaryString', ''),
                '最高薪资': item.get('jobSalaryMax', ''),
                '最低薪资': item.get('jobSalaryMin', ''),
                '经验': item.get('workYearString', ''),
                '学历': item.get('degreeString', ''),
                '全职/兼职': item.get('termStr', ''),
                '公司领域': item.get('companyIndustryType1Str', ''),
                '公司规模': item.get('companySizeString', ''),
                '公司类型': item.get('companyTypeString', ''),
                '职位标签': '',
                '职位描述': item.get('jobDescribe', ''),
                '职位详情页': item.get('jobHref', ''),
                '公司详情页': item.get('companyHref', ''),
                '经度': item.get('lon', ''),
                '纬度': item.get('lat', ''),
                '爬取时间': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            write_job_to_csv(dit)
            print(f"新增：{dit['职位']} | {dit['公司']} | {dit['城市']}")

        dp.scroll.to_bottom()
        time.sleep(1)
        nxt = dp.ele('css:.btn-next', timeout=2)
        if not nxt:
            break
        nxt.click()
        time.sleep(2)
    dp.quit()

if __name__ == '__main__':
    main()