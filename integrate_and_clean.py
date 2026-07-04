import pandas as pd
import re
import os
from pathlib import Path

print("=" * 70)
print("CSV数据整合与清洗工具")
print("=" * 70)

# 定义CSV文件列表（排除clean_jobs.csv）
csv_files = [
    (r"job_crawler\全国IT岗位_20260524.csv", "智联"),
    (r"全国计算机岗位数据(2).csv", "智联"),
    (r"data(1).csv", "智联"),
    (r"spider\前程无忧.csv", "前程无忧"),
    (r"spid\猎聘网.csv", "猎聘"),
    (r"spi2\智联1.csv", "智联"),
    (r"spi3\智联2.csv", "智联"),
    (r"spi3\智联_第2.csv", "智联"),
    (r"spi4\智联3.csv", "智联"),
    (r"spi5\智联_第四批_全国IT汇总.csv", "智联"),
    (r"spi1\智联_第二批数据.csv", "智联"),
    (r"spi6\智联6.csv", "智联"),
    (r"前程无忧 北京\it_jobs_北京.csv", "前程无忧"),
    (r"前程无忧 上海\it_jobs_上海.csv", "前程无忧"),
    (r"前程无忧_北京上海_合并.csv", "前程无忧")
]

base_dir = Path(r"c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统")
all_data = []

def extract_avg_salary(salary_str):
    """提取平均薪资（改进版）"""
    if pd.isna(salary_str) or salary_str == '':
        return 0
    
    salary_str = str(salary_str).strip()
    
    # 薪资面议
    if '面议' in salary_str or '薪资面议' in salary_str:
        return 0
    
    # 格式：20-40k
    match_k = re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)k', salary_str, re.I)
    if match_k:
        low = float(match_k.group(1)) * 1000
        high = float(match_k.group(2)) * 1000
        return int((low + high) / 2)
    
    # 格式：15-25k·13薪
    match_k_13 = re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)k', salary_str, re.I)
    if match_k_13:
        low = float(match_k_13.group(1)) * 1000
        high = float(match_k_13.group(2)) * 1000
        return int((low + high) / 2)
    
    # 千-万 格式：8千-1.3万
    match1 = re.search(r'(\d+(?:\.\d+)?)千?\s*[-\~至]\s*(\d+(?:\.\d+)?)万?', salary_str)
    if match1:
        low = float(match1.group(1))
        high = float(match1.group(2))
        
        if '千' in salary_str.split('-')[0] and '万' in salary_str.split('-')[1]:
            low *= 1000
            high *= 10000
        elif '万' in salary_str:
            low *= 10000
            high *= 10000
        elif '千' in salary_str:
            low *= 1000
            high *= 1000
        
        avg = int((low + high) / 2)
        if avg > 100000:  # 异常高薪过滤
            return 0
        return avg
    
    # 数字-数字 格式：7000-12000
    match2 = re.search(r'(\d+)\s*[-\~至]\s*(\d+)', salary_str)
    if match2:
        low = int(match2.group(1))
        high = int(match2.group(2))
        avg = int((low + high) / 2)
        if avg > 100000:
            return 0
        return avg
    
    # 单数字
    match3 = re.search(r'(\d+(?:\.\d+)?)', salary_str)
    if match3:
        num = float(match3.group(1))
        if '万' in salary_str:
            num *= 10000
        elif '千' in salary_str:
            num *= 1000
        
        if num > 100000:
            return 0
        return int(num)
    
    return 0

def extract_city(city_str):
    """提取城市名"""
    if pd.isna(city_str) or city_str == '':
        return '未知'
    city_str = str(city_str)
    city = city_str.split('·')[0].split('-')[0].split(' ')[0].strip()
    return city

def process_file(file_path, default_source):
    """处理单个CSV文件"""
    print(f"\n[处理中] {file_path}")
    try:
        df = pd.read_csv(base_dir / file_path, encoding='utf-8-sig')
        print(f"  [OK] 读取到 {len(df)} 条数据")
    except Exception as e:
        print(f"  [FAIL] 读取失败: {e}")
        return []
    
    data = []
    for _, row in df.iterrows():
        try:
            # 根据不同的列名匹配数据
            job_name = ''
            city = ''
            education = ''
            work_exp = ''
            company = ''
            salary = ''
            data_source = default_source
            
            # 匹配岗位名称
            if '岗位名称' in row and pd.notna(row['岗位名称']):
                job_name = row['岗位名称']
            elif '职位' in row and pd.notna(row['职位']):
                job_name = row['职位']
            elif 'title' in row and pd.notna(row['title']):
                job_name = row['title']
            
            # 匹配城市
            if '城市' in row and pd.notna(row['城市']):
                city = extract_city(row['城市'])
            elif 'city' in row and pd.notna(row['city']):
                city = extract_city(row['city'])
            
            # 匹配学历
            if '学历' in row and pd.notna(row['学历']):
                education = row['学历']
            elif '学历要求' in row and pd.notna(row['学历要求']):
                education = row['学历要求']
            elif 'education' in row and pd.notna(row['education']):
                education = row['education']
            
            # 匹配经验
            if '经验' in row and pd.notna(row['经验']):
                work_exp = row['经验']
            elif '经验要求' in row and pd.notna(row['经验要求']):
                work_exp = row['经验要求']
            elif 'work_exp' in row and pd.notna(row['work_exp']):
                work_exp = row['work_exp']
            
            # 匹配公司
            if '公司' in row and pd.notna(row['公司']):
                company = row['公司']
            elif '公司名称' in row and pd.notna(row['公司名称']):
                company = row['公司名称']
            elif 'company' in row and pd.notna(row['company']):
                company = row['company']
            
            # 匹配薪资
            if '薪资' in row and pd.notna(row['薪资']):
                salary = row['薪资']
            elif 'salary' in row and pd.notna(row['salary']):
                salary = row['salary']
            
            # 匹配数据来源
            if '数据来源' in row and pd.notna(row['数据来源']):
                data_source = row['数据来源']
            elif 'data_source' in row and pd.notna(row['data_source']):
                data_source = row['data_source']
            
            # 清洗空值
            if pd.isna(job_name) or job_name == '':
                continue
            if pd.isna(company) or company == '' or company.strip() == '':
                company = '未填写'
            
            # 计算平均薪资
            salary_avg = extract_avg_salary(salary)
            
            data.append({
                'job_name': str(job_name).strip(),
                'city': str(city).strip(),
                'education': str(education).strip() if pd.notna(education) else '未填写',
                'work_exp': str(work_exp).strip() if pd.notna(work_exp) else '未填写',
                'company': str(company).strip(),
                'salary_avg': salary_avg,
                'data_source': str(data_source).strip()
            })
        except Exception as e:
            continue
    
    print(f"  [OK] 处理了 {len(data)} 条有效数据")
    return data

# 处理所有文件
total_count = 0
for csv_file, source in csv_files:
    file_data = process_file(csv_file, source)
    all_data.extend(file_data)
    total_count += len(file_data)

print(f"\n" + "=" * 70)
print(f"[合并完成] 共合并 {total_count} 条数据")

# 转换为DataFrame
df_all = pd.DataFrame(all_data)
print(f"[合并后] 数据框形状: {df_all.shape}")

# 去重（按公司+岗位+城市去重）
print("\n[去重处理]")
initial_len = len(df_all)
df_all = df_all.drop_duplicates(subset=['company', 'job_name', 'city'], keep='first')
duplicates_removed = initial_len - len(df_all)
print(f"  [OK] 删除重复 {duplicates_removed} 条，剩余 {len(df_all)} 条")

# 过滤异常薪资（0或过高的）
print("\n[过滤异常数据]")
initial_len = len(df_all)
df_all = df_all[(df_all['salary_avg'] > 0) & (df_all['salary_avg'] <= 100000)]
filtered = initial_len - len(df_all)
print(f"  [OK] 过滤异常薪资 {filtered} 条，剩余 {len(df_all)} 条")

# 保存清洗后的文件
output_file = base_dir / "all_cleaned_jobs.csv"
df_all.to_csv(output_file, index=False, encoding='utf-8-sig')
print(f"\n[保存完成] 文件已保存到: {output_file}")

# 统计信息
print("\n" + "=" * 70)
print("[统计信息]")
print(f"  总数据量: {len(df_all)} 条")
print(f"  数据来源分布:")
source_counts = df_all['data_source'].value_counts()
for source, count in source_counts.items():
    print(f"    {source}: {count} 条")

print(f"\n  城市Top 10:")
city_counts = df_all['city'].value_counts().head(10)
for city, count in city_counts.items():
    print(f"    {city}: {count} 条")

print(f"\n  薪资统计:")
print(f"    平均薪资: {df_all['salary_avg'].mean():.0f} 元")
print(f"    薪资中位数: {df_all['salary_avg'].median():.0f} 元")
print(f"    最高薪资: {df_all['salary_avg'].max()} 元")
print(f"    最低薪资: {df_all['salary_avg'].min()} 元")

print("\n" + "=" * 70)
print("[OK] 数据整合与清洗完成！")
print(f"输出文件: {output_file}")
print("=" * 70)