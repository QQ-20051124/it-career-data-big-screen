#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查前程无忧HTML内容"""
import sys
sys.path.insert(0, '.')
import time
from crawler_utils import create_logged_in_browser
from bs4 import BeautifulSoup

dp = create_logged_in_browser(use_user_profile=False)

url = 'https://we.51job.com/pc/search?jobArea=010000&keyword=%E8%AE%A1%E7%AE%97%E6%9C%BA&searchType=2'
print('Loading:', url)
dp.get(url, timeout=60)
time.sleep(10)

html = dp.html
print(f'HTML length: {len(html)}')

# 保存HTML
with open('debug_51job2.html', 'w', encoding='utf-8') as f:
    f.write(html[:100000])
print('HTML saved')

soup = BeautifulSoup(html, 'html.parser')

# 检查页面中是否有岗位名称文本
all_text = soup.get_text()
print(f'Total text length: {len(all_text)}')

# 搜索可能的岗位名称
import re
# 查找常见岗位格式
job_patterns = re.findall(r'([\u4e00-\u9fa5A-Za-z0-9 /]+?(?:工程师|开发|管理|技术|产品|设计|测试|运维|安全|数据|AI|算法|专家|经理))', all_text)
print(f'Found {len(job_patterns)} potential job titles')
for title in job_patterns[:10]:
    print(f'  - {title.strip()}')

# 查找所有包含job的class
all_elements = soup.find_all(class_=True)
job_classes = set()
for el in all_elements:
    cls = ' '.join(el.get('class', []))
    if 'job' in cls.lower() or 'Job' in cls:
        job_classes.add(cls[:80])

print(f'\nJob-related classes found: {len(job_classes)}')
for cls in list(job_classes)[:20]:
    print(f'  {cls}')

# 查找sensorsdata属性
sensors_elems = soup.find_all(attrs={'sensorsdata': True})
print(f'\nElements with sensorsdata attribute: {len(sensors_elems)}')

# 查找data-v属性（Vue scoped style）
vue_elements = soup.find_all(attrs={'data-v': True})
print(f'Vue scoped elements (data-v): {len(vue_elements)}')

# 检查页面标题
print(f'\nPage title: {dp.title}')

# 检查是否有iframe
iframes = soup.find_all('iframe')
print(f'iframes: {len(iframes)}')
for iframe in iframes:
    print(f'  src: {iframe.get("src", "about:blank")}')

dp.quit()
print('\nDone')
