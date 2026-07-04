import os
import django
import pandas as pd

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'IT学习与就业数据可视化导航系统.settings')
django.setup()

from jobs.models import Job

# 读取清洗好的CSV
df = pd.read_csv("all_cleaned_jobs.csv", encoding="utf-8-sig")

# 处理缺失值
df['company'] = df['company'].fillna('未填写')
df['salary_avg'] = df['salary_avg'].fillna(0).astype(int)
df['data_source'] = df['data_source'].fillna('智联/猎聘/前程无忧')

# 增量导入：已存在的就跳过
new_count = 0
skip_count = 0

for _, row in df.iterrows():
    # 检查是否已存在（示例：按 公司+岗位+城市+来源 去重）
    exists = Job.objects.filter(
        job_name=row['job_name'],
        company=row['company'],
        city=row['city'],
        data_source=row['data_source']
    ).exists()
    if not exists:
        Job.objects.create(
            job_name=row['job_name'],
            city=row['city'],
            education=row['education'],
            work_exp=row['work_exp'],
            company=row['company'],
            salary_avg=row['salary_avg'],
            data_source=row['data_source']
        )
        new_count += 1
    else:
        skip_count += 1

print(f"[OK] 导入完成！新增 {new_count} 条，跳过已存在 {skip_count} 条。")