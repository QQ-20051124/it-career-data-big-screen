// 诊断测试脚本
const fs = require('fs');
const path = require('path');

// 测试1: 加载知识库
console.log('=== 测试1: 知识库加载 ===');
const kbPath = path.join(__dirname, 'data', 'local-knowledge-base.json');
const kb = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
console.log('✓ positions:', kb.positions.length);
console.log('✓ faq:', kb.faq.length);
console.log('✓ commonProblems:', kb.commonProblems.length);

// 测试2: 检查Vue3相关FAQ
console.log('\n=== 测试2: Vue3相关FAQ ===');
const vue3FAQ = kb.faq.filter(f => 
  f.keywords.some(k => k.toLowerCase().includes('vue')) ||
  f.question.toLowerCase().includes('vue')
);
console.log('找到', vue3FAQ.length, '条Vue相关FAQ:');
vue3FAQ.forEach(f => console.log(`  - ${f.id}: ${f.question} (keywords: ${f.keywords.join(', ')})`));

// 测试3: 模拟 findBestFAQ
console.log('\n=== 测试3: FAQ匹配测试 ===');
function findBestFAQ(message) {
  const msgLower = message.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const faq of kb.faq) {
    let score = 0;
    for (const keyword of faq.keywords || []) {
      if (msgLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }
    console.log(`  FAQ "${faq.id}" (${faq.question.substring(0, 20)}): score=${score}`);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }
  return bestScore > 0 ? bestMatch : null;
}

const testMessages = [
  'Vue3 的 Composition API 怎么用？',
  'vue3 composition api 怎么用',
  '如何使用Vue3的Composition API',
  'Vue3响应式原理',
  '前端开发学习路线',
  '模拟前端面试'
];

testMessages.forEach(msg => {
  console.log(`\n  消息: "${msg}"`);
  const result = findBestFAQ(msg);
  if (result) {
    console.log(`  ✓ 匹配: ${result.id} - ${result.question}`);
  } else {
    console.log(`  ✗ 无匹配`);
  }
});

// 测试4: 检查后端模块
console.log('\n=== 测试4: 后端动态模块 ===');
const m = require('./data/position-skills-backend');
console.log('✓ 加载成功');

// 测试5: 检查意图检测
console.log('\n=== 测试5: 意图检测 ===');
function detectIntent(message) {
  const msg = message.toLowerCase();
  const intents = {
    learning_route: {
      keywords: ['学习路线', '学习计划', '学习路径', '怎么学', '如何学', '学习方法', '入门', '学习'],
      score: 0
    },
    mock_interview: {
      keywords: ['模拟面试', '面试题', '面试练习', '面试准备', '面试技巧', '面试', '八股文', '笔试'],
      score: 0
    },
    technical_qa: {
      keywords: ['怎么用', '怎么实现', '是什么', '为什么', '原理', '区别', '解释', '讲解', '如何', '什么是', '?', '？'],
      score: 0
    },
    common_problem: {
      keywords: ['内存泄漏', 'OOM', '超时', '报错', '错误', '崩溃', '卡顿', '慢', '排查', '调试', 'debug', 'bug', '部署', '上线'],
      score: 0
    },
    career: {
      keywords: ['转行', '转型', '就业', '薪资', '工资', '待遇', '职业规划', '发展', '前途', '方向'],
      score: 0
    },
    resource: {
      keywords: ['资源', '推荐', '文档', '视频', '书籍', '课程', '项目', '实战'],
      score: 0
    }
  };

  for (const [intent, config] of Object.entries(intents)) {
    for (const keyword of config.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        config.score += 1;
      }
    }
    if (config.score > 0) {
      console.log(`  ${intent}: score=${config.score} (matched: ${config.keywords.filter(k => msg.includes(k.toLowerCase()))})`);
    }
  }

  const sorted = Object.entries(intents).sort((a, b) => b[1].score - a[1].score);
  if (sorted[0][1].score > 0) {
    console.log(`  → 最终意图: ${sorted[0][0]}`);
    return sorted[0][0];
  }
  console.log(`  → 最终意图: general`);
  return 'general';
}

testMessages.forEach(msg => {
  console.log(`\n  消息: "${msg}"`);
  detectIntent(msg);
});

// 测试6: 模拟面试题生成
console.log('\n=== 测试6: 模拟面试题生成 ===');
const questions = m.generateInterviewQuestions('frontend');
console.log('frontend 面试题:');
questions.forEach(q => console.log(`  - Q: ${q.q}`));

const qaQuestions = m.generateInterviewQuestions('qa-engineer');
console.log('\nqa-engineer 面试题:');
qaQuestions.forEach(q => console.log(`  - Q: ${q.q}`));

const devopsQuestions = m.generateInterviewQuestions('devops');
console.log('\ndevops 面试题:');
devopsQuestions.forEach(q => console.log(`  - Q: ${q.q}`));

const securityQuestions = m.generateInterviewQuestions('security');
console.log('\nsecurity 面试题:');
securityQuestions.forEach(q => console.log(`  - Q: ${q.q}`));

const pmQuestions = m.generateInterviewQuestions('product-manager');
console.log('\nproduct-manager 面试题:');
pmQuestions.forEach(q => console.log(`  - Q: ${q.q}`));

console.log('\n=== 诊断完成 ===');
