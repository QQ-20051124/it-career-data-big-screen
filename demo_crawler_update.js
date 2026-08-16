/**
 * 模拟爬虫数据更新演示脚本
 * 演示爬虫数据如何实时合并到系统中
 */

const fs = require('fs');
const path = require('path');

// 配置
const PROJECT_ROOT = path.join(__dirname);
const DATA_FILE = path.join(PROJECT_ROOT, 'backend', 'data', 'all_cleaned_jobs.json');

// 生成模拟爬虫数据（模拟从三个网站爬取的新数据）
function generateMockCrawlerData() {
    const mockData = [
        // 智联招聘新数据
        {
            "岗位名称": "前端开发工程师",
            "薪资": "15-25K",
            "城市": "北京",
            "经验要求": "3-5年",
            "学历要求": "本科",
            "公司名称": "字节跳动",
            "数据来源": "智联"
        },
        {
            "岗位名称": "Java后端工程师",
            "薪资": "20-35K",
            "城市": "上海",
            "经验要求": "3-5年",
            "学历要求": "本科",
            "公司名称": "拼多多",
            "数据来源": "智联"
        },
        // 猎聘网新数据
        {
            "岗位名称": "高级算法工程师",
            "薪资": "40-60K",
            "城市": "深圳",
            "经验要求": "5-10年",
            "学历要求": "硕士",
            "公司名称": "腾讯",
            "数据来源": "猎聘"
        },
        // 前程无忧新数据
        {
            "岗位名称": "数据分析师",
            "薪资": "12-20K",
            "城市": "广州",
            "经验要求": "1-3年",
            "学历要求": "本科",
            "公司名称": "网易",
            "数据来源": "前程无忧"
        }
    ];

    return mockData;
}

// 解析薪资为平均值
function parseSalaryToAvg(salaryStr) {
    if (!salaryStr || salaryStr.includes('面议')) return 0;
    
    const match = salaryStr.match(/([\d.]+)\s*-?\s*([\d.]+)?\s*(万|千)?/);
    if (!match) return 0;
    
    const low = parseFloat(match[1]);
    const high = match[2] ? parseFloat(match[2]) : low;
    const unit = match[3] || '';
    const multiplier = unit === '万' ? 10000 : unit === '千' ? 1000 : 1;
    
    return Math.round((low + high) / 2 * multiplier);
}

// 提取城市
function extractCity(cityStr) {
    if (!cityStr) return '';
    return cityStr.split(/[·\-]/)[0].trim();
}

// 合并数据到系统
function mergeToSystemJson(newJobs) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 爬虫数据合并过程');
    console.log('='.repeat(50));

    // 1. 读取现有数据
    console.log('\n📁 步骤1: 读取现有系统数据...');
    const existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`   当前数据量: ${existingData.length.toLocaleString()} 条`);

    // 2. 构建去重键
    console.log('\n🔍 步骤2: 构建去重索引...');
    const existingKeys = new Set();
    existingData.forEach(item => {
        const key = `${item.data_source}|${item.job_name}|${item.company}|${item.city}`;
        existingKeys.add(key);
    });
    console.log(`   已建立 ${existingKeys.size.toLocaleString()} 条去重索引`);

    // 3. 合并新数据
    console.log('\n📥 步骤3: 合并新爬取数据...');
    let added = 0;
    let duplicates = 0;

    newJobs.forEach(job => {
        const key = `${job['数据来源']}|${job['岗位名称']}|${job['公司名称']}|${extractCity(job['城市'])}`;
        
        if (existingKeys.has(key)) {
            duplicates++;
            console.log(`   [跳过重复] ${job['岗位名称']} @ ${job['公司名称']}`);
        } else {
            existingKeys.add(key);
            existingData.push({
                job_name: job['岗位名称'],
                city: extractCity(job['城市']),
                education: job['学历要求'] || '不限',
                work_exp: job['经验要求'] || '不限',
                company: job['公司名称'],
                salary_avg: parseSalaryToAvg(job['薪资']),
                data_source: job['数据来源']
            });
            added++;
            console.log(`   [新增数据] ${job['岗位名称']} @ ${job['公司名称']} (${job['数据来源']})`);
        }
    });

    // 4. 保存更新后的数据
    console.log('\n💾 步骤4: 保存更新后的数据...');
    fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2), 'utf-8');
    console.log(`   ✅ 数据保存成功`);

    // 5. 统计结果
    console.log('\n📈 步骤5: 统计合并结果');
    console.log('   ' + '-'.repeat(40));
    console.log(`   新增数据: ${added} 条`);
    console.log(`   跳过重复: ${duplicates} 条`);
    console.log(`   数据总量: ${existingData.length.toLocaleString()} 条`);

    // 统计数据源分布
    const sourceStats = {};
    existingData.forEach(item => {
        sourceStats[item.data_source] = (sourceStats[item.data_source] || 0) + 1;
    });
    console.log('\n   📊 数据源分布:');
    Object.entries(sourceStats).forEach(([source, count]) => {
        console.log(`      - ${source}: ${count.toLocaleString()} 条`);
    });

    return { added, duplicates, totalCount: existingData.length };
}

// 主程序
async function main() {
    console.log('🕷️' + '='.repeat(50));
    console.log('  IT就业数据爬虫 - 实时更新演示');
    console.log('🕷️' + '='.repeat(50));

    try {
        // 1. 生成模拟爬虫数据
        console.log('\n' + '='.repeat(50));
        console.log('🔄 步骤0: 爬虫获取新数据');
        console.log('='.repeat(50));
        
        const newCrawlerData = generateMockCrawlerData();
        console.log(`\n   模拟爬取 ${newCrawlerData.length} 条新数据:`);
        newCrawlerData.forEach((job, idx) => {
            console.log(`   ${idx + 1}. [${job['数据来源']}] ${job['岗位名称']} - ${job['薪资']} @ ${job['公司名称']}`);
        });

        // 2. 合并到系统
        const result = mergeToSystemJson(newCrawlerData);

        // 3. 完成
        console.log('\n' + '='.repeat(50));
        console.log('✅ 数据更新完成');
        console.log('='.repeat(50));
        console.log(`\n   总计: ${result.totalCount.toLocaleString()} 条数据`);
        console.log('   系统已就绪，可通过 API 访问最新数据');

        // 4. 恢复数据（演示用，不实际添加测试数据）
        console.log('\n🔄 恢复原始数据（演示模式）...');
        const originalData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        const restoredData = originalData.filter(item => {
            const isMock = (
                (item.job_name === '前端开发工程师' && item.company === '字节跳动') ||
                (item.job_name === 'Java后端工程师' && item.company === '拼多多') ||
                (item.job_name === '高级算法工程师' && item.company === '腾讯') ||
                (item.job_name === '数据分析师' && item.company === '网易')
            );
            return !isMock;
        });
        fs.writeFileSync(DATA_FILE, JSON.stringify(restoredData, null, 2), 'utf-8');
        console.log(`   ✅ 数据已恢复 (${restoredData.length.toLocaleString()} 条)`);

    } catch (error) {
        console.error('\n❌ 执行出错:', error.message);
        process.exit(1);
    }
}

main();
