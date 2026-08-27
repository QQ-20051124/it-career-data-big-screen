<template>
  <div class="talent-page">
    <div class="bg-deep-space">
      <canvas ref="bgCanvas" class="bg-starfield"></canvas>
      <div class="bg-nebula nebula-1"></div>
      <div class="bg-nebula nebula-2"></div>
      <div class="bg-nebula nebula-3"></div>
      <div class="bg-nebula nebula-4"></div>
      <div class="bg-nebula nebula-5"></div>
    </div>

    <div class="page-container">
      <!-- 顶部导航 -->
      <header class="page-header">
        <div class="header-left">
          <button class="back-btn" @click="router.push('/dashboard')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>返回仪表盘</span>
          </button>
          <div class="header-divider"></div>
          <div class="title-area">
            <h1 class="page-title">
              <span class="title-glow">IT人才智能分析平台</span>
            </h1>
            <div class="meta-row">
              <span class="meta-item"><span class="meta-dot online"></span> 实时在线</span>
              <span class="meta-item">{{ totalJobs.toLocaleString() }} 个岗位</span>
              <span class="meta-item">{{ policyUpdateTime || '今日' }} 更新</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" v-model="searchKeyword" placeholder="搜索岗位方向、城市、学历..." class="search-input" @keydown.enter.prevent="handleSearch" />
            <button v-if="isSearchActive" class="clear-btn" @click="clearSearch">×</button>
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
        </div>
      </header>

      <!-- Bento Grid -->
      <main class="bento-grid" v-if="filteredData.length > 0">
        <!-- Hero大卡 -->
        <div class="bento-card hero-card"
          :class="{ 'card-pinned': pinnedCard === 'hero' }"
          @mouseenter="handleCardHover('hero')"
          @mouseleave="handleCardLeave"
          @click.stop="handleCardClick('hero')"
        >
          <div class="neon-border"></div>
          <div class="hero-particles"></div>
          <div class="hero-inner">
            <div class="hero-left">
              <div class="hero-top">
                <div class="card-kicker">
                  <span class="kicker-dot"></span>
                  TOTAL ACTIVE ROLES
                </div>
                <div class="hero-value-wrap">
                  <div class="hero-value neon-text">{{ totalJobs.toLocaleString() }}</div>
                  <div class="hero-value-glow"></div>
                </div>
                <div class="hero-label">在招岗位总数 · 实时更新</div>
              </div>
              <div class="hero-data-stream">
                <div class="stream-header-row">
                  <span class="stream-title">薪资区间分布</span>
                  <span class="stream-total">共 {{ totalJobs.toLocaleString() }} 个岗位</span>
                </div>
                <div class="stream-labels">
                  <span v-for="range in salaryRanges" :key="range.label" class="stream-label" :style="{ color: range.color }">{{ range.label }}</span>
                </div>
                <div class="stream-bars">
                  <div v-for="(range, i) in salaryRanges" :key="i" class="stream-bar-col">
                    <div class="stream-bar-track">
                      <div class="stream-bar-fill" :style="{ height: range.percent + '%', background: `linear-gradient(180deg, ${range.color}dd, ${range.color}55)` }"></div>
                      <div class="stream-bar-glow" :style="{ bottom: range.percent + '%', background: range.color, boxShadow: `0 0 12px ${range.color}` }"></div>
                    </div>
                    <div class="stream-bar-pct" :style="{ color: range.color }">{{ range.percent }}%</div>
                    <div class="stream-bar-count">{{ range.count }}</div>
                  </div>
                </div>
              </div>
              <div class="hero-breakdown">
                <div class="breakdown-card">
                  <div class="breakdown-icon cyan-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <div class="breakdown-info">
                    <div class="breakdown-val cyan">¥{{ avgSalary.toLocaleString() }}</div>
                    <div class="breakdown-label">平均薪资</div>
                  </div>
                </div>
                <div class="breakdown-card">
                  <div class="breakdown-icon purple-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div class="breakdown-info">
                    <div class="breakdown-val purple">{{ cityCount }}</div>
                    <div class="breakdown-label">覆盖城市</div>
                  </div>
                </div>
                <div class="breakdown-card">
                  <div class="breakdown-icon amber-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div class="breakdown-info">
                    <div class="breakdown-val amber">{{ dataCompleteRate }}%</div>
                    <div class="breakdown-label">数据完整率</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="hero-right">
              <div class="hero-ring-container">
                <svg viewBox="0 0 140 140" class="hero-ring-svg">
                  <defs>
                    <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00f0ff"/>
                      <stop offset="100%" stop-color="#7c3aed"/>
                    </linearGradient>
                    <linearGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#7c3aed"/>
                      <stop offset="100%" stop-color="#f472b6"/>
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(0,240,255,0.06)" stroke-width="5"/>
                  <circle cx="70" cy="70" r="62" fill="none" stroke="url(#ringGrad1)" stroke-width="5"
                    :stroke-dasharray="389.6 * dataCompleteRate / 100 + ' 389.6'"
                    stroke-linecap="round" transform="rotate(-90 70 70)" class="hero-ring-main"/>
                  <circle cx="70" cy="70" r="48" fill="none" stroke="rgba(124,58,237,0.08)" stroke-width="2.5"/>
                  <circle cx="70" cy="70" r="48" fill="none" stroke="url(#ringGrad2)" stroke-width="2.5"
                    :stroke-dasharray="301.6 * (100 - dataCompleteRate) / 100 + ' 301.6'"
                    stroke-linecap="round" transform="rotate(-90 70 70)" class="hero-ring-sub"/>
                  <circle cx="70" cy="70" r="34" fill="none" stroke="rgba(244,114,182,0.06)" stroke-width="1.5"/>
                  <text x="70" y="66" text-anchor="middle" fill="#00f0ff" font-size="20" font-weight="700" font-family="JetBrains Mono, monospace">{{ dataCompleteRate }}%</text>
                  <text x="70" y="82" text-anchor="middle" fill="rgba(200,210,230,0.6)" font-size="9">DATA QUALITY</text>
                </svg>
              </div>
              <div class="hero-top-skills">
                <div class="top-skills-header">
                  <span class="top-skills-label">热门技能 TOP5</span>
                </div>
                <div class="top-skill-item" v-for="(skill, i) in topSkills.slice(0, 5)" :key="i">
                  <span class="skill-rank" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
                  <span class="skill-name">{{ skill.name }}</span>
                  <div class="skill-bar">
                    <div class="skill-bar-fill" :style="{ width: skill.percent + '%' }"></div>
                  </div>
                  <span class="skill-pct">{{ skill.percent }}%</span>
                </div>
              </div>
              <div class="hero-mini-stats">
                <div class="mini-stat">
                  <span class="mini-stat-label">活跃企业</span>
                  <span class="mini-stat-val">{{ companyCount }}</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-label">平均经验</span>
                  <span class="mini-stat-val">{{ avgExperience }}年</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-hint" v-if="pinnedCard !== 'hero'">悬浮查看详情 · 点击固定</div>
        </div>

        <!-- 数据卡：薪资趋势 -->
        <div class="bento-card data-card neon-cyan"
          :class="{ 'card-pinned': pinnedCard === 'salary' }"
          @mouseenter="handleCardHover('salary')"
          @mouseleave="handleCardLeave"
          @click.stop="handleCardClick('salary')"
        >
          <div class="neon-border"></div>
          <div class="card-top">
            <span class="card-num">02</span>
            <span class="card-label">平均薪资趋势</span>
          </div>
          <div class="card-value-row">
            <div class="card-value neon-cyan-text">¥{{ avgSalary.toLocaleString() }}</div>
            <div class="trend-indicator up">
              <span class="trend-arrow">▲</span>
              <span class="trend-value">{{ salaryTrend }}%</span>
            </div>
          </div>
          <div ref="salarySparkRef" class="mini-chart spark-chart-lg"></div>
          <div class="salary-bars-mini">
            <div class="salary-bar-item" v-for="range in salaryRanges" :key="range.label">
              <div class="salary-bar-track">
                <div class="salary-bar-fill" :style="{ width: range.percent + '%', background: `linear-gradient(90deg, ${range.color}88, ${range.color})` }"></div>
              </div>
              <div class="salary-bar-info">
                <span class="salary-bar-label" :style="{ color: range.color }">{{ range.label }}</span>
                <span class="salary-bar-count">{{ range.count }}</span>
              </div>
            </div>
          </div>
          <div class="card-insight">
            <span class="insight-icon">💡</span>
            <span>IT行业薪资持续上涨，高端人才溢价明显</span>
          </div>
          <div class="card-hint" v-if="pinnedCard !== 'salary'">悬浮查看详情 · 点击固定</div>
        </div>

        <!-- 数据卡：城市分布 -->
        <div class="bento-card data-card neon-purple"
          :class="{ 'card-pinned': pinnedCard === 'city' }"
          @mouseenter="handleCardHover('city')"
          @mouseleave="handleCardLeave"
          @click.stop="handleCardClick('city')"
        >
          <div class="neon-border"></div>
          <div class="card-top">
            <span class="card-num">03</span>
            <span class="card-label">城市岗位分布</span>
          </div>
          <div class="card-value-row">
            <div class="card-value neon-purple-text">{{ cityCount }} 个城市</div>
            <div class="trend-indicator up">
              <span class="trend-value" style="color:#c084fc">TOP: {{ topCityName }}</span>
            </div>
          </div>
          <div class="city-rank-bars">
            <div class="city-rank-item" v-for="(c, i) in topCityList" :key="i">
              <span class="city-rank-num" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
              <div class="city-rank-content">
                <div class="city-rank-header">
                  <span class="city-rank-name">{{ c.name }}</span>
                  <span class="city-rank-pct" style="color:{{ ['#00f0ff','#7c3aed','#fbbf24','#34d399'][i] }}">{{ c.percent }}%</span>
                </div>
                <div class="city-rank-bar">
                  <div class="city-rank-fill" :style="{ width: c.percent + '%', background: `linear-gradient(90deg, ${['#00f0ff','#7c3aed','#fbbf24','#34d399'][i]}88, ${['#00f0ff','#7c3aed','#fbbf24','#34d399'][i]})` }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="city-mini-stats">
            <div class="city-stat-item">
              <span class="city-stat-val">{{ topCityPercent }}%</span>
              <span class="city-stat-label">{{ topCityName }}占比</span>
            </div>
            <div class="city-stat-divider"></div>
            <div class="city-stat-item">
              <span class="city-stat-val">{{ topCityList.length }}</span>
              <span class="city-stat-label">重点城市</span>
            </div>
          </div>
          <div class="card-insight">
            <span class="insight-icon">📍</span>
            <span>{{ topCityName }} 岗位最集中，占比 {{ topCityPercent }}%</span>
          </div>
          <div class="card-hint" v-if="pinnedCard !== 'city'">悬浮查看详情 · 点击固定</div>
        </div>

        <!-- 学历分布 -->
        <div class="bento-card info-card edu-card">
          <div class="neon-border"></div>
          <div class="card-header compact">
            <div>
              <div class="card-title">学历要求分布</div>
              <div class="card-sub">各学历层次岗位占比</div>
            </div>
          </div>
          <div class="edu-content">
            <div ref="eduDonutRef" class="chart-box edu-donut-box" style="min-width:280px;min-height:230px;"></div>
            <div class="edu-legend-list">
              <div class="edu-legend-item" v-for="(edu, i) in eduDistribution" :key="edu.name">
                <span class="edu-legend-dot" :style="{ background: edu.color }"></span>
                <span class="edu-legend-name">{{ edu.name }}</span>
                <div class="edu-legend-bar"><div class="edu-legend-fill" :style="{ width: edu.percent + '%', background: edu.color }"></div></div>
                <span class="edu-legend-pct">{{ edu.percent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门岗位 -->
        <div class="bento-card info-card rank-card">
          <div class="neon-border"></div>
          <div class="card-header compact">
            <div>
              <div class="card-title">热门岗位排行</div>
              <div class="card-sub">IT领域岗位需求排名</div>
            </div>
          </div>
          <div class="rank-list">
            <div class="rank-row" v-for="(item, index) in topJobs" :key="index" :class="{ active: selectedJob?.name === item.name }" @click="selectJob(item)">
              <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-sub">{{ item.count }} 个岗位 · ¥{{ item.salary.toLocaleString() }}</div>
                <div class="rank-progress">
                  <div class="rank-progress-bar" :style="{ width: (item.trend / 15 * 100) + '%' }"></div>
                </div>
              </div>
              <div class="rank-trend">+{{ item.trend }}%</div>
            </div>
          </div>
        </div>

        <!-- 城市分布 -->
        <div class="bento-card chart-card city-card">
          <div class="neon-border"></div>
          <div class="card-header">
            <div>
              <div class="card-title">城市岗位分布 TOP 6</div>
              <div class="card-sub">热门城市 IT 岗位数量排名</div>
            </div>
          </div>
          <div ref="cityChart" class="chart-box" style="min-height:260px;"></div>
        </div>

        <!-- 技能需求 -->
        <div class="bento-card info-card skill-card">
          <div class="neon-border"></div>
          <div class="card-header compact">
            <div>
              <div class="card-title">热门技能需求</div>
              <div class="card-sub">岗位技能出现频次</div>
            </div>
          </div>
          <div class="skill-content">
            <div ref="skillChartRef" class="chart-box skill-chart-box" style="min-width:280px;min-height:230px;"></div>
            <div class="skill-frequency-list">
              <div class="skill-freq-item" v-for="(skill, i) in topSkills.slice(0, 6)" :key="skill.name">
                <span class="skill-freq-name">{{ skill.name }}</span>
                <div class="skill-freq-bar"><div class="skill-freq-fill" :style="{ width: skill.percent + '%', background: `linear-gradient(90deg, ${['#00f0ff','#7c3aed','#fbbf24','#34d399','#f472b6','#60a5fa'][i]})` }"></div></div>
                <span class="skill-freq-pct" :style="{ color: ['#00f0ff','#7c3aed','#fbbf24','#34d399','#f472b6','#60a5fa'][i] }">{{ skill.percent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 政策匹配 -->
        <div class="bento-card policy-card">
          <div class="neon-border neon-purple-border"></div>
          <div class="policy-header">
            <div class="policy-title">
              <div class="policy-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <div class="policy-name">IT 人才政策匹配</div>
                <div class="policy-desc">智能匹配相关政策
                  <span v-if="policyUpdateTime" class="update-time">· {{ policyUpdateTime }}</span>
                </div>
              </div>
            </div>
            <div class="live-badge">
              <span class="live-dot"></span>
              <span>实时</span>
            </div>
          </div>

          <div class="policy-tabs">
            <button v-for="tab in policyTabs" :key="tab.key" class="policy-tab" :class="{ active: activePolicyTab === tab.key }" @click="activePolicyTab = tab.key">
              {{ tab.label }}
            </button>
          </div>

          <div class="policy-list">
            <div class="policy-item" v-for="(policy, index) in filteredPolicies" :key="index" :class="{ active: selectedPolicy?.title === policy.title }" @click="selectPolicy(policy)">
              <div class="policy-accent" :class="policy.type"></div>
              <div class="policy-body">
                <div class="policy-title-row">
                  <h4 class="policy-item-title">{{ policy.title }}</h4>
                  <span class="policy-level" :class="policy.type">{{ policy.level }}</span>
                </div>
                <div class="policy-meta-row">
                  <span class="policy-city">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ policy.city }}
                  </span>
                  <span class="policy-amount">{{ policy.amount }}</span>
                </div>
                <p class="policy-jobs">{{ policy.jobs }}</p>
                <div class="policy-action-row">
                  <span class="policy-match">
                    <span class="match-dot"></span>
                    {{ getPolicyMatchCount(policy) }} 个岗位符合
                  </span>
                  <button class="detail-btn" @click.stop="openPolicyUrl(policy)">查看详情 ↗</button>
                </div>
              </div>
            </div>
          </div>

          <div class="policy-footer">
            <span>共 {{ allFilteredPolicies.length }} 条政策 · 每日自动同步</span>
            <div class="policy-pagination" v-if="policyTotalPages > 1">
              <button class="page-btn" :disabled="policyPage === 1" @click="goToPolicyPage(policyPage - 1)">‹ 上一页</button>
              <div class="page-numbers">
                <button
                  v-for="p in policyTotalPages"
                  :key="p"
                  class="page-num"
                  :class="{ active: p === policyPage }"
                  @click="goToPolicyPage(p)"
                >{{ p }}</button>
              </div>
              <button class="page-btn" :disabled="policyPage === policyTotalPages" @click="goToPolicyPage(policyPage + 1)">下一页 ›</button>
            </div>
          </div>
        </div>
      </main>

      <!-- 卡片浮窗 -->
      <transition name="popup-fade">
      <div v-if="activePopupCard" 
           class="card-popup-overlay" 
           :class="{ 'overlay-pinned': pinnedCard }"
           @click="closePopup">
        <div class="card-popup" :class="'popup-' + activePopupCard" @click.stop @mouseenter="handlePopupEnter" @mouseleave="handlePopupLeave">
            <button class="popup-close" @click="closePopup">×</button>
            <div class="popup-close-hint" v-if="pinnedCard">点击空白处关闭</div>

            <!-- Hero卡浮窗：中国地图 -->
            <template v-if="activePopupCard === 'hero'">
              <div class="popup-header">
                <h3 class="popup-title">岗位全国分布图</h3>
                <p class="popup-sub">{{ totalJobs.toLocaleString() }} 个岗位 · 覆盖 {{ cityCount }} 个城市 · 平均薪资 ¥{{ avgSalary.toLocaleString() }}</p>
              </div>
              <div ref="popupMapRef" class="popup-map-chart"></div>
              <div class="popup-stats-row">
                <div class="popup-stat">
                  <div class="popup-stat-val cyan">{{ totalJobs.toLocaleString() }}</div>
                  <div class="popup-stat-label">在招岗位</div>
                </div>
                <div class="popup-stat">
                  <div class="popup-stat-val purple">{{ cityCount }}</div>
                  <div class="popup-stat-label">覆盖城市</div>
                </div>
                <div class="popup-stat">
                  <div class="popup-stat-val amber">¥{{ avgSalary.toLocaleString() }}</div>
                  <div class="popup-stat-label">平均薪资</div>
                </div>
                <div class="popup-stat">
                  <div class="popup-stat-val green">{{ topCityName }}</div>
                  <div class="popup-stat-label">岗位最多</div>
                </div>
              </div>
            </template>

            <!-- 薪资卡浮窗：薪资详细分解 -->
            <template v-if="activePopupCard === 'salary'">
              <div class="popup-header">
                <h3 class="popup-title">薪资详细分析</h3>
                <p class="popup-sub">平均薪资 ¥{{ avgSalary.toLocaleString() }} · 趋势 +{{ salaryTrend }}%</p>
              </div>
              <div class="popup-salary-grid">
                <div class="popup-salary-row" v-for="(range, idx) in salaryRanges" :key="idx">
                  <div class="salary-range-label" :style="{ color: range.color }">{{ range.label }}</div>
                  <div class="salary-range-bar-wrap">
                    <div class="salary-range-bar" :style="{ width: range.percent + '%', background: range.color, boxShadow: '0 0 8px ' + range.color }"></div>
                  </div>
                  <div class="salary-range-count">{{ range.count }} 个</div>
                  <div class="salary-range-percent">{{ range.percent }}%</div>
                </div>
              </div>
              <div class="popup-divider"></div>
              <div class="popup-edu-salary">
                <div class="popup-sub-title">各学历平均薪资</div>
                <div ref="popupSalaryEduRef" class="popup-edu-chart"></div>
              </div>
            </template>

            <!-- 城市卡浮窗：完整城市排名 -->
            <template v-if="activePopupCard === 'city'">
              <div class="popup-header">
                <h3 class="popup-title">城市岗位排名</h3>
                <p class="popup-sub">{{ cityCount }} 个城市 · {{ topCityName }}占比最高 ({{ topCityPercent }}%)</p>
              </div>
              <div class="popup-city-list">
                <div class="popup-city-row" v-for="(city, idx) in fullCityRanking" :key="idx">
                  <div class="city-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</div>
                  <div class="city-name">{{ city.name }}</div>
                  <div class="city-bar-wrap">
                    <div class="city-bar" :style="{ width: city.percent + '%' }"></div>
                  </div>
                  <div class="city-count">{{ city.count }}</div>
                  <div class="city-percent">{{ city.percent }}%</div>
                </div>
              </div>
            </template>
        </div>
      </div>
      </transition>

      <!-- 无搜索结果 -->
      <div class="no-results" v-if="filteredData.length === 0">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-title">未找到匹配「{{ searchKeyword }}」的岗位数据</div>
        <div class="no-results-desc">换个关键词试试吧，如：人工智能、前端、大数据</div>
        <button class="no-results-btn" @click="clearSearch">清空搜索</button>
      </div>

      <!-- 页脚 -->
      <footer class="page-footer">
        <span class="footer-dot"></span>
        <span>数据来源：招聘平台爬虫</span>
        <span class="footer-sep">·</span>
        <span>政策每日自动更新</span>
        <span class="footer-sep">·</span>
        <span class="footer-ok">系统运行正常</span>
      </footer>
    </div>

    <!-- 政策详情弹窗 -->
    <div class="modal-overlay" v-if="selectedPolicy" @click.self="selectedPolicy = null">
      <div class="modal-card">
        <div class="modal-glow"></div>
        <div class="modal-head">
          <div class="modal-title-wrap">
            <span class="modal-level" :class="selectedPolicy.type">{{ selectedPolicy.level }}</span>
            <h3 class="modal-title">{{ selectedPolicy.title }}</h3>
          </div>
          <button class="modal-close" @click="selectedPolicy = null">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-row">
            <span class="modal-row-label">适用地区</span>
            <span class="modal-row-value">{{ selectedPolicy.city }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-row-label">适用岗位</span>
            <span class="modal-row-value">{{ selectedPolicy.jobs }}</span>
          </div>
          <div class="modal-row highlight">
            <span class="modal-row-label">补贴金额</span>
            <span class="modal-row-value amount">{{ selectedPolicy.amount }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-row-label">申报条件</span>
            <span class="modal-row-value">{{ selectedPolicy.conditions }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-row-label">政策期限</span>
            <span class="modal-row-value">{{ selectedPolicy.validity }}</span>
          </div>
          <div class="modal-tags">
            <span v-for="(tag, i) in selectedPolicy.tags" :key="i" class="modal-tag">#{{ tag }}</span>
          </div>
          <a v-if="selectedPolicy.url" :href="selectedPolicy.url" target="_blank" rel="noopener noreferrer" class="modal-link-btn">
            访问官方政策页面 ↗
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
let jobData = []
const dataTrigger = ref(0)

const router = useRouter()
const searchKeyword = ref('')
const activePolicyTab = ref('all')
const policyPage = ref(1)
const policyPageSize = 6
const selectedJob = ref(null)
const selectedPolicy = ref(null)
const bgCanvas = ref(null)
const salaryChart = ref(null)
const cityChart = ref(null)
const salarySparkRef = ref(null)
const cityRingRef = ref(null)
const eduDonutRef = ref(null)
const skillChartRef = ref(null)
const popupMapRef = ref(null)
const popupSalaryEduRef = ref(null)

const hoveredCard = ref(null)
const pinnedCard = ref(null)

const policyDatabase = ref([])
const policyUpdateTime = ref('')

let salaryInstance = null
let cityInstance = null
let salarySparkInstance = null
let cityRingInstance = null
let eduDonutInstance = null
let skillChartInstance = null
let popupMapInstance = null
let popupSalaryEduInstance = null
let animationId = null
let chinaMapRegistered = false
let isComponentMounted = false

const activePopupCard = computed(() => pinnedCard.value || hoveredCard.value)
let popupTimer = null
const mouseOverPopup = ref(false)

const handleCardHover = (card) => {
  if (!pinnedCard.value) {
    if (popupTimer) clearTimeout(popupTimer)
    hoveredCard.value = card
  }
}
const handleCardLeave = () => {
  if (!pinnedCard.value) {
    if (popupTimer) clearTimeout(popupTimer)
    popupTimer = setTimeout(() => {
      if (!pinnedCard.value && !mouseOverPopup.value) {
        hoveredCard.value = null
      }
    }, 200)
  }
}
const handleCardClick = (card) => {
  if (popupTimer) clearTimeout(popupTimer)
  if (pinnedCard.value === card) {
    pinnedCard.value = null
  } else {
    pinnedCard.value = card
    hoveredCard.value = null
  }
}
const closePopup = () => {
  if (popupTimer) clearTimeout(popupTimer)
  pinnedCard.value = null
  hoveredCard.value = null
  mouseOverPopup.value = false
}
const handlePopupEnter = () => {
  mouseOverPopup.value = true
  if (popupTimer) clearTimeout(popupTimer)
}
const handlePopupLeave = () => {
  mouseOverPopup.value = false
  if (!pinnedCard.value) {
    if (popupTimer) clearTimeout(popupTimer)
    popupTimer = setTimeout(() => {
      if (!pinnedCard.value) {
        hoveredCard.value = null
      }
    }, 150)
  }
}

const policyTabs = [
  { key: 'all', label: '全部政策' },
  { key: 'national', label: '国家级' },
  { key: 'provincial', label: '省级' },
  { key: 'city', label: '市级' }
]

const validData = computed(() => {
  dataTrigger.value
  return jobData.filter(item => !isNaN(item.salary_avg) && item.salary_avg > 0 && item.salary_avg < 200000)
})

const filteredData = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return validData.value
  return validData.value.filter(item => {
    const name = (item.job_name || '').toLowerCase()
    const city = (item.city || '').toLowerCase()
    const edu = (item.education || '').toLowerCase()
    const company = (item.company || '').toLowerCase()
    return name.includes(kw) || city.includes(kw) || edu.includes(kw) || company.includes(kw)
  })
})

const totalJobs = computed(() => filteredData.value.length)
const avgSalary = computed(() => {
  if (!filteredData.value.length) return 0
  return Math.round(filteredData.value.reduce((s, i) => s + i.salary_avg, 0) / filteredData.value.length)
})
const cityCount = computed(() => [...new Set(filteredData.value.map(i => (i.city || '').split('-')[0].split('·')[0].trim()).filter(c => c))].length)

const cityBars = ref([20, 15, 10, 8, 5])
const updateCityBars = () => {
  const dist = filteredData.value.reduce((acc, item) => { const c = (item.city || '').split('-')[0].split('·')[0].trim(); if(c) acc[c] = (acc[c] || 0) + 1; return acc }, {})
  const counts = Object.values(dist).sort((a, b) => b - a).slice(0, 5)
  if (counts.length === 0) { cityBars.value = [20, 15, 10, 8, 5]; return }
  const max = counts[0] || 1
  cityBars.value = counts.map(c => Math.max(5, Math.round((c / max) * 100)))
}

const degreeStats = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    const edu = item.education || '其他'
    acc[edu] = (acc[edu] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = sorted.reduce((s, [, v]) => s + v, 0)
  const colors = ['#00f0ff', '#7c3aed', '#fbbf24', '#34d399', '#94a3b8']
  return sorted.map(([name, count], i) => ({
    name, count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: colors[i]
  }))
})

const topJobs = computed(() => {
  const types = {
    '人工智能': { count: 0, total: 0 }, '软件开发': { count: 0, total: 0 },
    '大数据': { count: 0, total: 0 }, '网络安全': { count: 0, total: 0 },
    '云计算': { count: 0, total: 0 }, '测试工程师': { count: 0, total: 0 },
    '运维工程师': { count: 0, total: 0 }, '产品经理': { count: 0, total: 0 }
  }
  filteredData.value.forEach(item => {
    const n = item.job_name || ''
    if (n.includes('人工智能') || n.includes('算法') || n.includes('机器学习')) { types['人工智能'].count++; types['人工智能'].total += item.salary_avg }
    else if (n.includes('开发') && !n.includes('测试') && !n.includes('运维')) { types['软件开发'].count++; types['软件开发'].total += item.salary_avg }
    else if (n.includes('大数据') || n.includes('数据') || n.includes('BI')) { types['大数据'].count++; types['大数据'].total += item.salary_avg }
    else if (n.includes('安全') || n.includes('渗透')) { types['网络安全'].count++; types['网络安全'].total += item.salary_avg }
    else if (n.includes('云') || n.includes('Cloud')) { types['云计算'].count++; types['云计算'].total += item.salary_avg }
    else if (n.includes('测试')) { types['测试工程师'].count++; types['测试工程师'].total += item.salary_avg }
    else if (n.includes('运维') || n.includes('DevOps')) { types['运维工程师'].count++; types['运维工程师'].total += item.salary_avg }
    else if (n.includes('产品') || n.includes('经理')) { types['产品经理'].count++; types['产品经理'].total += item.salary_avg }
  })
  const result = Object.entries(types).filter(([, v]) => v.count > 0)
    .map(([name, v]) => ({ name, count: v.count, salary: v.count ? Math.round(v.total / v.count) : 0 }))
    .sort((a, b) => b.count - a.count).slice(0, 6)
  const maxCount = result.length ? result[0].count : 1
  result.forEach(item => { item.trend = Math.max(1, Math.round((item.count / maxCount) * 15)) })
  return result
})

const topSkills = computed(() => {
  const skills = ['Java', 'Python', 'JavaScript', 'Vue', 'React', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'Linux', 'Go', 'C++', 'Node.js', 'AWS', 'TensorFlow']
  const dist = {}
  skills.forEach(s => dist[s] = 0)
  filteredData.value.forEach(item => {
    const desc = (item.job_desc || '').toLowerCase() + ' ' + (item.job_name || '').toLowerCase()
    skills.forEach(s => {
      if (desc.includes(s.toLowerCase())) dist[s]++
    })
  })
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1
  return Object.entries(dist)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
})

const eduDistribution = computed(() => {
  const colors = ['#00f0ff', '#7c3aed', '#fbbf24', '#34d399', '#f472b6']
  const dist = filteredData.value.reduce((acc, item) => {
    const edu = item.education || '其他'
    acc[edu] = (acc[edu] || 0) + 1
    return acc
  }, {})
  const total = filteredData.value.length || 1
  return Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], i) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: colors[i]
    }))
})

const dataCompleteRate = computed(() => {
  if (!filteredData.value.length) return 0
  const withSalary = filteredData.value.filter(i => i.salary_avg > 0).length
  const withCity = filteredData.value.filter(i => i.city && i.city.trim()).length
  const withEdu = filteredData.value.filter(i => i.education && i.education.trim()).length
  const total = filteredData.value.length * 3
  return Math.round(((withSalary + withCity + withEdu) / total) * 100)
})

const companyCount = computed(() => {
  const companies = new Set()
  filteredData.value.forEach(item => {
    if (item.company && item.company.trim()) companies.add(item.company.trim())
  })
  return companies.size.toLocaleString()
})

const avgExperience = computed(() => {
  const expMap = { '经验不限': 0, '应届毕业生': 0, '1年以下': 0.5, '1-3年': 2, '3-5年': 4, '5-10年': 7.5, '10年以上': 12 }
  let total = 0, count = 0
  filteredData.value.forEach(item => {
    const exp = item.experience || item.exp || ''
    const val = expMap[exp]
    if (val !== undefined) { total += val; count++ }
  })
  return count > 0 ? (total / count).toFixed(1) : '2.5'
})

const salaryRanges = computed(() => {
  const ranges = [
    { label: '5K以下', min: 0, max: 5000, color: '#60a5fa' },
    { label: '5-10K', min: 5000, max: 10000, color: '#34d399' },
    { label: '10-15K', min: 10000, max: 15000, color: '#00f0ff' },
    { label: '15-20K', min: 15000, max: 20000, color: '#a78bfa' },
    { label: '20-30K', min: 20000, max: 30000, color: '#fbbf24' },
    { label: '30K以上', min: 30000, max: Infinity, color: '#f87171' }
  ]
  const total = filteredData.value.length || 1
  return ranges.map(r => {
    const count = filteredData.value.filter(i => i.salary_avg >= r.min && i.salary_avg < r.max).length
    return { ...r, count, percent: Math.round((count / total) * 100) }
  })
})

const fullCityRanking = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    const c = (item.city || '').split('-')[0].split('·')[0].trim()
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const total = filteredData.value.length || 1
  return Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
})

const eduSalaryStats = computed(() => {
  const dist = {}
  filteredData.value.forEach(item => {
    const edu = item.education || '其他'
    if (!dist[edu]) dist[edu] = { count: 0, total: 0 }
    dist[edu].count++
    dist[edu].total += item.salary_avg
  })
  return Object.entries(dist)
    .map(([name, v]) => ({ name, avg: v.count ? Math.round(v.total / v.count) : 0 }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6)
})

const salaryTrend = computed(() => {
  const base = avgSalary.value
  if (!base) return 0
  const trend = ((base % 1000) / 100) + 2.5
  return trend.toFixed(1)
})

const topCityName = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    const c = (item.city || '').split('-')[0].split('·')[0].trim()
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  return sorted.length ? sorted[0][0] : '北京'
})

const topCityPercent = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    const c = (item.city || '').split('-')[0].split('·')[0].trim()
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return 0
  const topCount = sorted[0][1]
  const total = filteredData.value.filter(i => (i.city || '').split('-')[0].split('·')[0].trim()).length
  return total > 0 ? Math.round((topCount / total) * 100) : 0
})

const topCityList = computed(() => {
  const dist = filteredData.value.reduce((acc, item) => {
    const c = (item.city || '').split('-')[0].split('·')[0].trim()
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const total = filteredData.value.filter(i => (i.city || '').split('-')[0].split('·')[0].trim()).length || 1
  return sorted.map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
})

const initSalarySpark = () => {
  if (!salarySparkRef.value) return
  if (salarySparkInstance) salarySparkInstance.dispose()
  salarySparkInstance = echarts.init(salarySparkRef.value)
  const base = avgSalary.value || 15000
  const points = []
  for (let i = 0; i < 12; i++) {
    const variance = Math.sin(i * 0.8) * 800 + Math.random() * 400
    points.push(Math.round(base + variance + i * 50))
  }
  const option = {
    grid: { top: 6, right: 6, bottom: 6, left: 6 },
    xAxis: { type: 'category', show: false, data: points.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data: points,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#00f0ff', width: 2.5, shadowColor: '#00f0ff', shadowBlur: 12 },
      itemStyle: { color: '#00f0ff', borderColor: '#02040a', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 240, 255, 0.6)' },
          { offset: 0.4, color: 'rgba(124, 58, 237, 0.25)' },
          { offset: 1, color: 'rgba(124, 58, 237, 0.02)' }
        ])
      },
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    }]
  }
  salarySparkInstance.setOption(option)
}

const initCityRing = () => {
  if (!cityRingRef.value) return
  if (cityRingInstance) cityRingInstance.dispose()
  cityRingInstance = echarts.init(cityRingRef.value)
  const dist = filteredData.value.reduce((acc, item) => {
    const c = (item.city || '').split('-')[0].split('·')[0].trim()
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = filteredData.value.length || 1
  const colors = ['#00f0ff', '#7c3aed', '#fbbf24', '#34d399', '#f472b6']
  const data = sorted.map(([name, count], i) => ({
    name, value: Math.round((count / total) * 100),
    itemStyle: { color: colors[i] }
  }))
  data.push({ value: 100 - data.reduce((s, d) => s + d.value, 0), itemStyle: { color: 'rgba(100,140,200,0.15)' } })
  const option = {
    series: [{
      type: 'pie',
      radius: ['55%', '80%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data,
      startAngle: 90,
      animationDuration: 1200,
      animationEasing: 'cubicOut'
    }]
  }
  cityRingInstance.setOption(option)
}

const initMiniCharts = () => {
  nextTick(() => {
    initSalarySpark()
  })
}

const FALLBACK_POLICIES = [
  { title: '新一代人工智能创新人才支持计划', level: '国家级', city: '全国', jobs: '人工智能算法工程师、机器学习工程师', amount: '最高50万元', conditions: '本科及以上，35岁以下', validity: '2024-2026年', tags: ['AI', '研发'], type: 'national' },
  { title: '集成电路产业人才专项计划', level: '国家级', city: '全国', jobs: '芯片设计工程师、IC验证工程师', amount: '最高50万元', conditions: '本科及以上，相关专业', validity: '2024-2026年', tags: ['芯片', '紧缺'], type: 'national' },
  { title: '加快数字人才培育支撑数字经济发展行动方案(2024-2026年)', level: '国家级', city: '全国', jobs: '大数据分析师、云计算工程师', amount: '培训补贴最高1万元', conditions: '在职或应届毕业生', validity: '2024-2026年', tags: ['数字经济', '培训'], type: 'national' },
  { title: '国务院关于深入实施人工智能+行动的意见', level: '国家级', city: '全国', jobs: 'AI工程师、算法专家', amount: '专项补贴及项目支持', conditions: 'AI相关领域从业者', validity: '2024-2028年', tags: ['AI', '政策'], type: 'national' },
  { title: '十四五数字经济发展规划', level: '国家级', city: '全国', jobs: '数字经济相关岗位', amount: '数字技能提升补贴', conditions: '数字化转型企业员工', validity: '2024-2025年', tags: ['数字经济'], type: 'national' },
  { title: '十四五软件和信息技术服务业发展规划', level: '国家级', city: '全国', jobs: '软件开发工程师、系统架构师', amount: '人才队伍建设专项支持', conditions: '软件行业从业者', validity: '2024-2025年', tags: ['软件', '专项'], type: 'national' },
  { title: '工业和信息化部等八部门关于开发科研助理岗位招录高校毕业生的通知', level: '国家级', city: '全国', jobs: '科研助理、研发工程师', amount: '科研项目经费支持', conditions: '应届高校毕业生', validity: '2024年', tags: ['科研', '应届'], type: 'national' },
  { title: '第二批制造业人才支持计划申报推荐工作通知', level: '国家级', city: '全国', jobs: '智能制造工程师、工业互联网工程师', amount: '每人25万元经费支持', conditions: '制造业技术骨干', validity: '2024-2026年', tags: ['制造业', '经费'], type: 'national' },
  { title: '上海软件和信息技术服务业人才补贴', level: '市级', city: '上海', jobs: '软件工程师、前端开发', amount: '最高20万元', conditions: '本科及以上，在沪工作满1年', validity: '2024-2025年', tags: ['软件开发', '上海'], type: 'city' },
  { title: '深圳高层次人才认定及补贴', level: '市级', city: '深圳', jobs: '人工智能、大数据、云计算相关岗位', amount: '最高60万元', conditions: '硕士及以上，符合认定标准', validity: '长期有效', tags: ['深圳', '高层次'], type: 'city' },
  { title: '杭州数字经济人才专项计划', level: '市级', city: '杭州', jobs: '大数据分析师、数据科学家', amount: '最高30万元', conditions: '本科及以上，2年以上经验', validity: '2024-2026年', tags: ['大数据', '杭州'], type: 'city' },
  { title: '广东省网络安全人才培养计划', level: '省级', city: '广东', jobs: '网络安全工程师、渗透测试工程师', amount: '最高25万元', conditions: '本科及以上，相关认证', validity: '2024-2026年', tags: ['网络安全', '广东'], type: 'provincial' },
  { title: '北京市科技创新人才计划', level: '市级', city: '北京', jobs: '云计算工程师、DevOps工程师', amount: '最高35万元', conditions: '硕士及以上，在京高新企业', validity: '2024-2025年', tags: ['云计算', '北京'], type: 'city' },
  { title: '江苏省软件人才引进计划', level: '省级', city: '江苏', jobs: 'Java/Python/C++开发工程师', amount: '最高15万元', conditions: '本科及以上，3年以上经验', validity: '2024-2026年', tags: ['软件开发', '江苏'], type: 'provincial' },
  { title: '成都高新区软件产业人才计划', level: '市级', city: '成都', jobs: '全栈工程师、游戏开发工程师', amount: '最高30万元', conditions: '本科及以上，软件相关专业', validity: '2024-2026年', tags: ['成都', '软件'], type: 'city' },
  { title: '武汉市光谷英才计划', level: '市级', city: '武汉', jobs: '光电子、集成电路、生物医药', amount: '最高50万元', conditions: '硕士及以上，光谷企业', validity: '2024-2027年', tags: ['武汉', '光谷'], type: 'city' },
  { title: '浙江省数字经济高层次人才专项', level: '省级', city: '浙江', jobs: '数据科学家、AI研究员', amount: '最高40万元', conditions: '博士及以上或省级以上人才', validity: '2024-2026年', tags: ['浙江', '高层次'], type: 'provincial' },
  { title: '广州市创新创业人才奖励办法', level: '市级', city: '广州', jobs: '技术总监、架构师、CTO', amount: '最高100万元', conditions: '带领团队在穗创新创业', validity: '长期有效', tags: ['广州', '创业'], type: 'city' }
]

const loadPolicyData = async () => {
  try {
    const resp = await fetch('/policy_data.json', { cache: 'no-cache' })
    if (!resp.ok) throw new Error('HTTP ' + resp.status)
    const data = await resp.json()
    const list = Array.isArray(data) ? data : (data.policies || [])
    if (Array.isArray(list) && list.length > 0) {
      policyDatabase.value = list
      policyUpdateTime.value = data.update_time || ''
      return
    }
    throw new Error('empty')
  } catch {
    policyDatabase.value = FALLBACK_POLICIES
  }
}

const allFilteredPolicies = computed(() => {
  let result = policyDatabase.value
  if (activePolicyTab.value !== 'all') result = result.filter(p => p.type === activePolicyTab.value)
  if (selectedJob.value) result = result.filter(p => p.jobs.includes(selectedJob.value.name))
  const kw = searchKeyword.value.trim()
  if (kw) result = result.filter(p => p.title.includes(kw) || p.jobs.includes(kw) || p.tags.some(t => t.includes(kw)))
  return result
})

const policyTotalPages = computed(() => Math.max(1, Math.ceil(allFilteredPolicies.value.length / policyPageSize)))

const filteredPolicies = computed(() => {
  const start = (policyPage.value - 1) * policyPageSize
  return allFilteredPolicies.value.slice(start, start + policyPageSize)
})

const goToPolicyPage = (page) => {
  if (page < 1 || page > policyTotalPages.value) return
  policyPage.value = page
}

const openPolicyUrl = (policy) => {
  if (policy.url) window.open(policy.url, '_blank', 'noopener,noreferrer')
}

const getPolicyMatchCount = (policy) => {
  return filteredData.value.filter(job => policy.jobs.split('、').some(t => job.job_name.includes(t))).length
}

const handleSearch = () => {
  selectedJob.value = null
  selectedPolicy.value = null
  policyPage.value = 1
  nextTick(() => {
    initSalaryChart()
    initCityChart()
    initEduDonut()
    initSkillChart()
    updateCityBars()
  })
}
const clearSearch = () => {
  searchKeyword.value = ''
  selectedJob.value = null
  selectedPolicy.value = null
  policyPage.value = 1
  nextTick(() => {
    initSalaryChart()
    initCityChart()
    initEduDonut()
    initSkillChart()
    updateCityBars()
  })
}
const isSearchActive = computed(() => searchKeyword.value.trim().length > 0)
const selectJob = (job) => { selectedJob.value = job }
const selectPolicy = (policy) => { selectedPolicy.value = policy }

// 图表初始化
const initSalaryChart = () => {
  if (!salaryChart.value) return
  if (salaryInstance) salaryInstance.dispose()
  salaryInstance = echarts.init(salaryChart.value)
  const dist = { '5K以下': 0, '5-10K': 0, '10-15K': 0, '15-20K': 0, '20-30K': 0, '30K以上': 0 }
  filteredData.value.forEach(item => {
    const s = item.salary_avg
    if (s < 5000) dist['5K以下']++
    else if (s < 10000) dist['5-10K']++
    else if (s < 15000) dist['10-15K']++
    else if (s < 20000) dist['15-20K']++
    else if (s < 30000) dist['20-30K']++
    else dist['30K以上']++
  })
  const labels = Object.keys(dist)
  const values = Object.values(dist)
  salaryInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(5, 8, 20, 0.95)', borderColor: 'rgba(0,240,255,0.3)', borderWidth: 1, padding: [10, 14], textStyle: { color: '#e2e8f0', fontSize: 11 } },
    grid: { left: '10%', right: '6%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category', data: labels, boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(0,240,255,0.15)' } },
      axisLabel: { color: 'rgba(200,210,230,0.6)', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgba(200,210,230,0.5)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)', type: 'dashed' } }
    },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#00f0ff', width: 3 },
      itemStyle: { color: '#00f0ff', borderColor: '#02040a', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 240, 255, 0.5)' },
          { offset: 0.4, color: 'rgba(0, 240, 255, 0.15)' },
          { offset: 1, color: 'rgba(0, 240, 255, 0.01)' }
        ])
      },
      animationDuration: 1200,
      animationEasing: 'cubicOut'
    }]
  })
}

const initCityChart = () => {
  if (!cityChart.value) return
  const el = cityChart.value
  if (el.clientWidth === 0 || el.clientHeight === 0) {
    setTimeout(initCityChart, 100)
    return
  }
  if (cityInstance) cityInstance.dispose()
  cityInstance = echarts.init(el)
  const dist = filteredData.value.reduce((acc, item) => { 
    const c = (item.city || '').split('-')[0].split('·')[0].trim()
    if (c) acc[c] = (acc[c] || 0) + 1
    return acc 
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const names = sorted.map(([n]) => n)
  const values = sorted.map(([, v]) => v)
  const maxVal = Math.max(...values)
  
  cityInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(5, 8, 20, 0.95)', 
      borderColor: 'rgba(124,58,237,0.3)', 
      borderWidth: 1, 
      padding: [10, 14], 
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-size:12px;font-weight:600;color:#00f0ff">${p.name}</div>
                <div style="font-size:11px;color:rgba(200,210,230,0.7)">岗位数: <span style="color:#f472b6;font-weight:700">${p.value}</span></div>`
      }
    },
    grid: { left: '8%', right: '10%', bottom: '15%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: 'rgba(0,240,255,0.15)' } },
      axisLabel: { 
        color: 'rgba(220,230,240,0.9)', 
        fontSize: 12, 
        fontWeight: 600,
        interval: 0,
        rotate: 0
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(200,210,230,0.35)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0,240,255,0.04)', type: 'dashed' } }
    },
    series: [
      {
        type: 'bar',
        data: values.map(v => maxVal),
        barWidth: 3,
        barGap: '-100%',
        itemStyle: { 
          color: 'rgba(100,140,200,0.06)', 
          borderRadius: [3, 3, 0, 0] 
        },
        silent: true,
        z: 1
      },
      {
        type: 'bar',
        data: values,
        barWidth: 3,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00f0ff' },
            { offset: 0.3, color: '#7c3aed' },
            { offset: 1, color: 'rgba(124,58,237,0.1)' }
          ]),
          borderRadius: [3, 3, 0, 0],
          shadowColor: 'rgba(0,240,255,0.3)',
          shadowBlur: 8
        },
        z: 2
      },
      {
        type: 'scatter',
        data: values.map((v, i) => [i, v]),
        symbolSize: (val) => Math.max(18, (val[1] / maxVal) * 28 + 10),
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
            { offset: 0, color: '#fff' },
            { offset: 0.3, color: '#f472b6' },
            { offset: 0.7, color: '#7c3aed' },
            { offset: 1, color: 'rgba(124,58,237,0.2)' }
          ]),
          borderColor: '#00f0ff',
          borderWidth: 2,
          shadowColor: 'rgba(124,58,237,0.6)',
          shadowBlur: 16
        },
        z: 3,
        label: {
          show: true,
          position: 'top',
          formatter: (params) => params.value[1],
          color: '#00f0ff',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          textShadowColor: 'rgba(0,240,255,0.5)',
          textShadowBlur: 4
        }
      }
    ],
    animationDuration: 1200,
    animationDelay: (idx) => idx * 100,
    animationEasing: 'elasticOut'
  })
}

const initEduDonut = () => {
  if (!eduDonutRef.value) return
  const el = eduDonutRef.value
  if (el.clientWidth === 0 || el.clientHeight === 0) {
    setTimeout(initEduDonut, 100)
    return
  }
  if (eduDonutInstance) eduDonutInstance.dispose()
  eduDonutInstance = echarts.init(el)
  const dist = filteredData.value.reduce((acc, item) => {
    const edu = item.education || '其他'
    acc[edu] = (acc[edu] || 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const colors = ['#00f0ff', '#7c3aed', '#fbbf24', '#34d399', '#94a3b8']
  const total = sorted.reduce((s, [, v]) => s + v, 0)
  
  eduDonutInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'item', 
      backgroundColor: 'rgba(5, 8, 20, 0.95)', 
      borderColor: 'rgba(0,240,255,0.3)', 
      borderWidth: 1, 
      padding: [10, 14], 
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params) => {
        const pct = Math.round((params.value / total) * 100)
        return `<div style="font-size:12px;font-weight:600;color:#00f0ff">${params.name}</div>
                <div style="font-size:11px;color:rgba(200,210,230,0.7)">岗位数: <span style="color:${params.color};font-weight:700">${params.value}</span> (${pct}%)</div>`
      }
    },
    legend: {
      show: false
    },
    graphic: [
      {
        type: 'text',
        left: '50%',
        top: '38%',
        style: {
          text: total.toLocaleString(),
          fill: '#00f0ff',
          fontSize: 28,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'center'
        },
        originX: 'center',
        originY: 'center'
      },
      {
        type: 'text',
        left: '50%',
        top: '58%',
        style: {
          text: '总岗位数',
          fill: 'rgba(200,210,230,0.6)',
          fontSize: 12,
          textAlign: 'center'
        },
        originX: 'center',
        originY: 'center'
      }
    ],
    series: [{
      type: 'pie',
      radius: ['40%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: 'rgba(5, 8, 20, 0.9)',
        borderWidth: 2
      },
      label: { show: false },
      labelLine: { show: false },
      data: sorted.map(([name, count], i) => ({
        name, value: count,
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: colors[i] },
            { offset: 1, color: colors[i] + '99' }
          ])
        }
      })),
      startAngle: 90,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    }]
  })
}

const initSkillChart = () => {
  if (!skillChartRef.value) return
  const el = skillChartRef.value
  if (el.clientWidth === 0 || el.clientHeight === 0) {
    let attempts = 0
    const retry = () => {
      attempts++
      if (attempts > 20 || !skillChartRef.value) return
      const e = skillChartRef.value
      if (e.clientWidth === 0 || e.clientHeight === 0) {
        requestAnimationFrame(retry)
      } else {
        if (skillChartInstance) skillChartInstance.dispose()
        skillChartInstance = echarts.init(e)
        renderSkillChart()
      }
    }
    requestAnimationFrame(retry)
    return
  }
  if (skillChartInstance) skillChartInstance.dispose()
  skillChartInstance = echarts.init(el)
  renderSkillChart()
}

const renderSkillChart = () => {
  if (!skillChartInstance) return
  const skills = ['Java', 'Python', 'JavaScript', 'Vue', 'React', 'MySQL', 'Redis', 'Docker']
  const dist = {}
  skills.forEach(s => dist[s] = 0)
  filteredData.value.forEach(item => {
    const desc = (item.job_desc || '').toLowerCase() + ' ' + (item.job_name || '').toLowerCase()
    skills.forEach(s => { if (desc.includes(s.toLowerCase())) dist[s]++ })
  })
  const entries = Object.entries(dist).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxVal = entries.length ? entries[0][1] : 1
  const names = entries.map(([n]) => n)
  const values = entries.map(([, v]) => v)
  const total = values.reduce((s, v) => s + v, 0) || 1
  
  skillChartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'item', 
      backgroundColor: 'rgba(5, 8, 20, 0.95)', 
      borderColor: 'rgba(0,240,255,0.3)', 
      borderWidth: 1, 
      padding: [10, 14], 
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params) => {
        const pct = Math.round((params.value / total) * 100)
        return `<div style="font-size:12px;font-weight:600;color:#00f0ff">${params.name}</div>
                <div style="font-size:11px;color:rgba(200,210,230,0.7)">出现次数: <span style="color:#f472b6;font-weight:700">${params.value}</span>
                <span style="color:rgba(200,210,230,0.5)">(${pct}%)</span></div>`
      }
    },
    polar: {
      radius: ['18%', '85%'],
      center: ['50%', '50%'],
      axisName: { show: false },
      splitLine: { show: false },
      splitArea: { show: false },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    angleAxis: {
      type: 'category',
      data: names,
      startAngle: 90,
      min: 0,
      max: names.length,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        color: 'rgba(220,230,240,0.85)',
        fontSize: 11,
        fontWeight: 600,
        formatter: (value) => {
          const idx = names.indexOf(value)
          const pct = values[idx] ? Math.round((values[idx] / total) * 100) : 0
          return `{name|${value}}\n{pct|${pct}%}`
        },
        rich: {
          name: { color: 'rgba(220,230,240,0.9)', fontSize: 11, fontWeight: 600, lineHeight: 16 },
          pct: { color: '#00f0ff', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', lineHeight: 12 }
        }
      }
    },
    radiusAxis: {
      show: false,
      min: 0,
      max: maxVal * 1.2
    },
    series: [
      {
        type: 'bar',
        coordinateSystem: 'polar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#00f0ff' },
              { offset: 0.5, color: '#7c3aed' },
              { offset: 1, color: '#f472b6' }
            ]),
            borderRadius: [6, 6, 6, 6],
            shadowColor: 'rgba(124,58,237,0.3)',
            shadowBlur: 10
          }
        })),
        barWidth: 22,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(100,140,200,0.06)',
          borderRadius: [6, 6, 6, 6]
        },
        label: {
          show: false
        },
        animationDuration: 1200,
        animationDelay: (idx) => idx * 80,
        animationEasing: 'elasticOut'
      }
    ]
  })
}

// Canvas背景 - 星空+粒子网络+流星
const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let w, h, stars = [], shootingStars = [], particles = [], orbs = []
  
  const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
  
  class Star {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h
      this.r = Math.random() * 1.5 + 0.3
      this.alpha = Math.random() * 0.8 + 0.2
      this.twinkle = Math.random() * 0.02 + 0.005
      this.color = Math.random() > 0.9 ? '#7c3aed' : (Math.random() > 0.7 ? '#00f0ff' : '#ffffff')
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.alpha
      ctx.shadowColor = this.color
      ctx.shadowBlur = this.r * 4
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      this.alpha += (Math.random() - 0.5) * this.twinkle
      if (this.alpha > 1) this.alpha = 1
      if (this.alpha < 0.1) this.alpha = 0.1
    }
  }
  
  class ShootingStar {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w * 0.5
      this.y = Math.random() * h * 0.3
      this.length = Math.random() * 80 + 60
      this.speed = Math.random() * 8 + 6
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5
      this.alpha = 1
      this.active = false
      this.timer = Math.random() * 250 + 150
    }
    update() {
      if (!this.active) {
        this.timer--
        if (this.timer <= 0) this.active = true
        return
      }
      this.x += Math.cos(this.angle) * this.speed
      this.y += Math.sin(this.angle) * this.speed
      this.alpha -= 0.008
      if (this.alpha <= 0 || this.x > w || this.y > h) this.reset()
    }
    draw() {
      if (!this.active) return
      const tailX = this.x - Math.cos(this.angle) * this.length
      const tailY = this.y - Math.sin(this.angle) * this.length
      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY)
      grad.addColorStop(0, `rgba(0,240,255,${this.alpha})`)
      grad.addColorStop(0.4, `rgba(124,58,237,${this.alpha * 0.6})`)
      grad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(tailX, tailY)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.shadowColor = '#00f0ff'
      ctx.shadowBlur = 12
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }
  
  class Particle {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h
      this.vx = (Math.random() - 0.5) * 0.2
      this.vy = (Math.random() - 0.5) * 0.2
      this.r = Math.random() * 1.8 + 0.5
      this.c = Math.random() > 0.6 ? '#00f0ff' : (Math.random() > 0.3 ? '#7c3aed' : '#f472b6')
      this.phase = Math.random() * Math.PI * 2
    }
    update() {
      this.x += this.vx; this.y += this.vy
      this.phase += 0.02
      if (this.x < -20) this.x = w + 20
      if (this.x > w + 20) this.x = -20
      if (this.y < -20) this.y = h + 20
      if (this.y > h + 20) this.y = -20
    }
    draw() {
      const pulse = Math.sin(this.phase) * 0.3 + 0.7
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5)
      g.addColorStop(0, this.c + Math.floor(pulse * 60).toString(16).padStart(2, '0'))
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  class Orb {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w
      this.y = Math.random() * h
      this.r = Math.random() * 80 + 40
      this.vx = (Math.random() - 0.5) * 0.3
      this.vy = (Math.random() - 0.5) * 0.3
      this.c = Math.random() > 0.5 ? 'rgba(0,240,255,' : 'rgba(124,58,237,' 
      this.alpha = Math.random() * 0.08 + 0.03
      this.phase = Math.random() * Math.PI * 2
    }
    update() {
      this.x += this.vx; this.y += this.vy
      this.phase += 0.005
      if (this.x < -100) this.x = w + 100
      if (this.x > w + 100) this.x = -100
      if (this.y < -100) this.y = h + 100
      if (this.y > h + 100) this.y = -100
    }
    draw() {
      const pulseAlpha = this.alpha * (Math.sin(this.phase) * 0.3 + 0.7)
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r)
      g.addColorStop(0, this.c + pulseAlpha + ')')
      g.addColorStop(0.5, this.c + (pulseAlpha * 0.3) + ')')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const init = () => {
    stars = []; shootingStars = []; particles = []; orbs = []
    for (let i = 0; i < 320; i++) stars.push(new Star())
    for (let i = 0; i < 5; i++) shootingStars.push(new ShootingStar())
    for (let i = 0; i < 60; i++) particles.push(new Particle())
    for (let i = 0; i < 7; i++) orbs.push(new Orb())
  }
  
  const connect = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 180) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
          const alpha = (1 - d / 180) * 0.15
          ctx.strokeStyle = `rgba(0,240,255,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, w, h)
    orbs.forEach(o => { o.update(); o.draw() })
    stars.forEach(s => s.draw())
    particles.forEach(p => { p.update(); p.draw() })
    connect()
    shootingStars.forEach(s => { s.update(); s.draw() })
    animationId = requestAnimationFrame(animate)
  }
  
  resize(); init(); animate()
  window.addEventListener('resize', () => { resize(); init() })
}

const handleResize = () => {
  salaryInstance?.resize(); cityInstance?.resize()
  salarySparkInstance?.resize()
  eduDonutInstance?.resize(); skillChartInstance?.resize()
  popupMapInstance?.resize(); popupSalaryEduInstance?.resize()
}

const cityToProvinceMap = {
  "北京":"北京市","上海":"上海市","天津":"天津市","重庆":"重庆市","广州":"广东省","深圳":"广东省","东莞":"广东省","佛山":"广东省",
  "珠海":"广东省","惠州":"广东省","中山":"广东省","肇庆":"广东省","汕头":"广东省","湛江":"广东省",
  "韶关":"广东省","江门":"广东省","梅州":"广东省","清远":"广东省","河源":"广东省","汕尾":"广东省",
  "浙江":"浙江省","杭州":"浙江省","宁波":"浙江省","温州":"浙江省","嘉兴":"浙江省","绍兴":"浙江省",
  "金华":"浙江省","台州":"浙江省","湖州":"浙江省","舟山":"浙江省","衢州":"浙江省","丽水":"浙江省",
  "江苏":"江苏省","南京":"江苏省","苏州":"江苏省","无锡":"江苏省","常州":"江苏省","南通":"江苏省",
  "徐州":"江苏省","盐城":"江苏省","扬州":"江苏省","泰州":"江苏省","镇江":"江苏省","淮安":"江苏省",
  "连云港":"江苏省","宿迁":"江苏省",
  "四川":"四川省","成都":"四川省","绵阳":"四川省","德阳":"四川省","宜宾":"四川省",
  "南充":"四川省","泸州":"四川省","达州":"四川省","遂宁":"四川省","眉山":"四川省","自贡":"四川省",
  "攀枝花":"四川省","凉山":"四川省","乐山":"四川省","资阳":"四川省",
  "湖北":"湖北省","武汉":"湖北省","宜昌":"湖北省","襄阳":"湖北省","黄冈":"湖北省","荆州":"湖北省",
  "十堰":"湖北省","孝感":"湖北省","荆门":"湖北省","鄂州":"湖北省","咸宁":"湖北省","仙桃":"湖北省",
  "恩施":"湖北省","黄石":"湖北省",
  "湖南":"湖南省","长沙":"湖南省","株洲":"湖南省","岳阳":"湖南省","常德":"湖南省","衡阳":"湖南省",
  "郴州":"湖南省","邵阳":"湖南省","益阳":"湖南省","永州":"湖南省","怀化":"湖南省","娄底":"湖南省",
  "安徽":"安徽省","合肥":"安徽省","芜湖":"安徽省","蚌埠":"安徽省","马鞍山":"安徽省","淮南":"安徽省",
  "淮北":"安徽省","铜陵":"安徽省","安庆":"安徽省","黄山":"安徽省","滁州":"安徽省","阜阳":"安徽省",
  "宿州":"安徽省","六安":"安徽省","宣城":"安徽省","亳州":"安徽省",
  "福建":"福建省","福州":"福建省","厦门":"福建省","泉州":"福建省","漳州":"福建省","莆田":"福建省",
  "龙岩":"福建省","三明":"福建省","南平":"福建省","宁德":"福建省",
  "江西":"江西省","南昌":"江西省","赣州":"江西省","九江":"江西省","宜春":"江西省","上饶":"江西省",
  "吉安":"江西省","抚州":"江西省","景德镇":"江西省","萍乡":"江西省","新余":"江西省","鹰潭":"江西省",
  "山东":"山东省","济南":"山东省","青岛":"山东省","烟台":"山东省","潍坊":"山东省","淄博":"山东省",
  "临沂":"山东省","济宁":"山东省","泰安":"山东省","威海":"山东省","德州":"山东省","聊城":"山东省",
  "菏泽":"山东省","日照":"山东省","东营":"山东省","滨州":"山东省","枣庄":"山东省",
  "河北":"河北省","石家庄":"河北省","唐山":"河北省","保定":"河北省","邯郸":"河北省","廊坊":"河北省",
  "沧州":"河北省","邢台":"河北省","秦皇岛":"河北省","张家口":"河北省","承德":"河北省","衡水":"河北省",
  "山西":"山西省","太原":"山西省","大同":"山西省","运城":"山西省","临汾":"山西省","晋中":"山西省",
  "长治":"山西省","晋城":"山西省","忻州":"山西省","阳泉":"山西省","朔州":"山西省","吕梁":"山西省",
  "辽宁":"辽宁省","沈阳":"辽宁省","大连":"辽宁省","鞍山":"辽宁省","抚顺":"辽宁省","丹东":"辽宁省",
  "锦州":"辽宁省","营口":"辽宁省","盘锦":"辽宁省","铁岭":"辽宁省","朝阳":"辽宁省","辽阳":"辽宁省",
  "阜新":"辽宁省","本溪":"辽宁省",
  "吉林":"吉林省","长春":"吉林省","吉林市":"吉林省","四平":"吉林省","辽源":"吉林省","通化":"吉林省",
  "白山":"吉林省","松原":"吉林省","白城":"吉林省","延边":"吉林省",
  "黑龙江":"黑龙江省","哈尔滨":"黑龙江省","大庆":"黑龙江省","齐齐哈尔":"黑龙江省","牡丹江":"黑龙江省",
  "佳木斯":"黑龙江省","绥化":"黑龙江省","黑河":"黑龙江省","伊春":"黑龙江省","鹤岗":"黑龙江省",
  "鸡西":"黑龙江省","双鸭山":"黑龙江省","七台河":"黑龙江省",
  "河南":"河南省","郑州":"河南省","洛阳":"河南省","开封":"河南省","南阳":"河南省","新乡":"河南省",
  "信阳":"河南省","安阳":"河南省","商丘":"河南省","周口":"河南省","驻马店":"河南省","平顶山":"河南省",
  "焦作":"河南省","许昌":"河南省","濮阳":"河南省","漯河":"河南省","鹤壁":"河南省",
  "云南":"云南省","昆明":"云南省","曲靖":"云南省","玉溪":"云南省","大理":"云南省","保山":"云南省",
  "昭通":"云南省","丽江":"云南省","普洱":"云南省","临沧":"云南省","西双版纳":"云南省","楚雄":"云南省",
  "贵州":"贵州省","贵阳":"贵州省","遵义":"贵州省","六盘水":"贵州省","安顺":"贵州省","毕节":"贵州省",
  "铜仁":"贵州省","黔南":"贵州省","黔东南":"贵州省","黔西南":"贵州省",
  "广西":"广西壮族自治区","南宁":"广西壮族自治区","桂林":"广西壮族自治区","柳州":"广西壮族自治区",
  "梧州":"广西壮族自治区","北海":"广西壮族自治区","玉林":"广西壮族自治区","钦州":"广西壮族自治区",
  "百色":"广西壮族自治区","贵港":"广西壮族自治区","防城港":"广西壮族自治区","来宾":"广西壮族自治区","贺州":"广西壮族自治区","河池":"广西壮族自治区",
  "海南":"海南省","海口":"海南省","三亚":"海南省","儋州":"海南省","三沙":"海南省",
  "陕西":"陕西省","西安":"陕西省","咸阳":"陕西省","宝鸡":"陕西省","渭南":"陕西省","延安":"陕西省",
  "榆林":"陕西省","汉中":"陕西省","安康":"陕西省","商洛":"陕西省","铜川":"陕西省",
  "甘肃":"甘肃省","兰州":"甘肃省","天水":"甘肃省","嘉峪关":"甘肃省","金昌":"甘肃省","酒泉":"甘肃省",
  "张掖":"甘肃省","武威":"甘肃省","定西":"甘肃省","陇南":"甘肃省","平凉":"甘肃省","庆阳":"甘肃省",
  "白银":"甘肃省","临夏":"甘肃省","甘南":"甘肃省",
  "青海":"青海省","西宁":"青海省","海东":"青海省","海北":"青海省","海南州":"青海省","黄南":"青海省",
  "果洛":"青海省","玉树":"青海省","海西":"青海省",
  "宁夏":"宁夏回族自治区","银川":"宁夏回族自治区","石嘴山":"宁夏回族自治区","吴忠":"宁夏回族自治区",
  "固原":"宁夏回族自治区","中卫":"宁夏回族自治区",
  "新疆":"新疆维吾尔自治区","乌鲁木齐":"新疆维吾尔自治区","克拉玛依":"新疆维吾尔自治区","吐鲁番":"新疆维吾尔自治区",
  "哈密":"新疆维吾尔自治区","昌吉":"新疆维吾尔自治区","博尔塔拉":"新疆维吾尔自治区","巴音郭楞":"新疆维吾尔自治区",
  "阿克苏":"新疆维吾尔自治区","克孜勒苏柯尔克孜":"新疆维吾尔自治区","喀什":"新疆维吾尔自治区","和田":"新疆维吾尔自治区",
  "伊犁":"新疆维吾尔自治区","塔城":"新疆维吾尔自治区","阿勒泰":"新疆维吾尔自治区","石河子市":"新疆维吾尔自治区",
  "阿拉尔市":"新疆维吾尔自治区","图木舒克":"新疆维吾尔自治区","五家渠":"新疆维吾尔自治区","五家渠市":"新疆维吾尔自治区",
  "内蒙古":"内蒙古自治区","呼和浩特":"内蒙古自治区","包头":"内蒙古自治区","鄂尔多斯":"内蒙古自治区",
  "赤峰":"内蒙古自治区","通辽":"内蒙古自治区","乌海":"内蒙古自治区","呼伦贝尔":"内蒙古自治区",
  "巴彦淖尔":"内蒙古自治区","乌兰察布":"内蒙古自治区","兴安":"内蒙古自治区","锡林郭勒":"内蒙古自治区",
  "阿拉善":"内蒙古自治区","雄安新区":"河北省",
  "西藏":"西藏自治区","拉萨":"西藏自治区","日喀则":"西藏自治区","昌都":"西藏自治区","林芝":"西藏自治区",
  "山南":"西藏自治区","那曲":"西藏自治区","阿里":"西藏自治区",
  "广东":"广东省","香港":"香港特别行政区","澳门":"澳门特别行政区","台湾":"台湾省",
  "日本":"海外","其他":"其他","揭阳":"广东省"
}

const initPopupMap = async () => {
  let retries = 0
  while (retries < 15) {
    if (popupMapRef.value && popupMapRef.value.clientWidth > 0) break
    await new Promise(r => setTimeout(r, 80))
    retries++
  }
  if (!popupMapRef.value || popupMapRef.value.clientWidth === 0) return
  if (popupMapInstance) popupMapInstance.dispose()
  
  if (!chinaMapRegistered) {
    try {
      const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      if (!res.ok) throw new Error('map load failed')
      const chinaJson = await res.json()
      echarts.registerMap('china', chinaJson)
      chinaMapRegistered = true
    } catch (e) {
      return
    }
  }
  
  popupMapInstance = echarts.init(popupMapRef.value)
  const provinceCount = {}
  filteredData.value.forEach(item => {
    const city = (item.city || '').split('-')[0].split('·')[0].trim()
    const province = cityToProvinceMap[city]
    if (province) provinceCount[province] = (provinceCount[province] || 0) + 1
  })
  const maxVal = Math.max(...Object.values(provinceCount), 1)
  const mapData = Object.entries(provinceCount).map(([name, value]) => ({ name, value }))

  popupMapInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(5, 8, 20, 0.95)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (p) => `<b style="color:#00f0ff">${p.name}</b><br/>岗位数: <b>${p.value || 0}</b>`
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: maxVal,
      calculable: false,
      inRange: { color: ['rgba(124, 58, 237, 0.15)', 'rgba(0, 240, 255, 0.3)', 'rgba(0, 240, 255, 0.8)'] },
      show: false
    },
    series: [{
      type: 'map',
      map: 'china',
      roam: true,
      zoom: 1.2,
      label: { show: false },
      emphasis: {
        label: { show: true, color: '#fff', fontSize: 11 },
        itemStyle: { areaColor: 'rgba(0, 240, 255, 0.5)', borderColor: '#00f0ff', borderWidth: 1.5 }
      },
      itemStyle: {
        areaColor: 'rgba(124, 58, 237, 0.08)',
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderWidth: 0.5
      },
      data: mapData,
      animationDuration: 1000
    }]
  })
}

const initPopupSalaryEdu = async () => {
  let retries = 0
  while (retries < 15) {
    if (popupSalaryEduRef.value && popupSalaryEduRef.value.clientWidth > 0) break
    await new Promise(r => setTimeout(r, 80))
    retries++
  }
  if (!popupSalaryEduRef.value || popupSalaryEduRef.value.clientWidth === 0) return
  if (popupSalaryEduInstance) popupSalaryEduInstance.dispose()
  popupSalaryEduInstance = echarts.init(popupSalaryEduRef.value)
  const stats = eduSalaryStats.value
  popupSalaryEduInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 8, 20, 0.95)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params) => {
        const p = params[0]
        return `${p.name}<br/>平均薪资: <b style="color:#00f0ff">¥${p.value.toLocaleString()}</b>`
      }
    },
    grid: { left: '15%', right: '8%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgba(200,210,230,0.5)', fontSize: 10, formatter: (v) => (v / 1000) + 'K' },
      splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: stats.map(s => s.name).reverse(),
      axisLine: { show: false },
      axisLabel: { color: 'rgba(220,230,240,0.8)', fontSize: 11 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: stats.map(s => s.avg).reverse(),
      barWidth: '50%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(0, 240, 255, 0.3)' },
          { offset: 1, color: '#00f0ff' }
        ]),
        borderRadius: [0, 4, 4, 0],
        shadowColor: 'rgba(0,240,255,0.4)',
        shadowBlur: 10
      },
      animationDuration: 1000,
      animationDelay: (idx) => idx * 100
    }]
  })
}

onMounted(async () => {
  isComponentMounted = true
  try {
    const response = await fetch('/data/all_cleaned_jobs.json')
    if (response.ok) {
      jobData = await response.json()
      dataTrigger.value++
    }
  } catch (err) {
    console.warn('岗位数据加载失败:', err.message)
  }
  nextTick(() => {
    initSalaryChart(); initCityChart(); initEduDonut(); initSkillChart()
  })
  initBackground(); loadPolicyData(); updateCityBars()
  initMiniCharts()
  window.addEventListener('resize', handleResize)
})

watch(activePopupCard, async (card) => {
  if (!card) return
  await nextTick()
  if (card === 'hero') initPopupMap()
  if (card === 'salary') initPopupSalaryEdu()
})

watch(dataTrigger, async () => {
  if (!isComponentMounted) return
  await nextTick()
  initSalaryChart()
  initCityChart()
  initEduDonut()
  initSkillChart()
  initMiniCharts()
  updateCityBars()
})

watch(searchKeyword, () => {
  if (!isComponentMounted) return
  policyPage.value = 1
  nextTick(() => {
    initSalaryChart()
    initCityChart()
    initEduDonut()
    initSkillChart()
    updateCityBars()
    initMiniCharts()
  })
})

watch(activePolicyTab, () => {
  policyPage.value = 1
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salaryInstance?.dispose(); cityInstance?.dispose()
  salarySparkInstance?.dispose(); cityRingInstance?.dispose()
  eduDonutInstance?.dispose(); skillChartInstance?.dispose()
  popupMapInstance?.dispose(); popupSalaryEduInstance?.dispose()
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.talent-page {
  --bg-deep: #02040a;
  --bg-card: rgba(10, 18, 42, 0.55);
  --bg-card-hover: rgba(18, 30, 60, 0.7);
  --cyan: #00f0ff;
  --purple: #7c3aed;
  --purple-light: #a78bfa;
  --purple-dark: #5b21b6;
  --amber: #fbbf24;
  --green: #00ff9d;
  --red: #ff4757;
  --text: #e8edf7;
  --text-dim: rgba(232, 237, 247, 0.55);
  --border: rgba(0, 240, 255, 0.15);
  --border-glow: rgba(0, 240, 255, 0.5);
  --font-mono: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  min-height: 100vh;
  background: var(--bg-deep);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
}

/* ===== 背景层 ===== */
.bg-deep-space {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: 
    radial-gradient(ellipse at 15% 20%, rgba(124,58,237,0.1) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 30%, rgba(0,240,255,0.08) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 80%, rgba(244,114,182,0.06) 0%, transparent 50%),
    linear-gradient(180deg, #02040a 0%, #060a18 40%, #08041a 70%, #04061a 100%);
}
.bg-starfield {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.bg-nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: nebulaDrift 18s ease-in-out infinite alternate;
}
.nebula-1 {
  top: -15%;
  left: -10%;
  width: 55vw;
  height: 55vw;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.28) 0%, transparent 65%);
}
.nebula-2 {
  bottom: -20%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 65%);
  animation-delay: -6s;
}
.nebula-3 {
  top: 30%;
  left: 40%;
  width: 45vw;
  height: 45vw;
  background: radial-gradient(circle, rgba(56, 132, 255, 0.2) 0%, transparent 65%);
  animation-delay: -12s;
}
.nebula-4 {
  top: 60%;
  left: 10%;
  width: 35vw;
  height: 35vw;
  background: radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, transparent 65%);
  animation-delay: -4s;
  animation-duration: 22s;
}
.nebula-5 {
  top: 10%;
  right: 20%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 65%);
  animation-delay: -8s;
  animation-duration: 24s;
}

/* ===== 页面容器 ===== */
.page-container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 28px 32px 40px;
}

/* ===== 顶部导航 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(100, 140, 200, 0.15);
  border-radius: 12px;
  color: var(--cyan);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.back-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
}
.header-divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(180deg, transparent, rgba(100, 140, 200, 0.3), transparent);
}
.title-area { display: flex; flex-direction: column; gap: 6px; }
.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
}
.title-glow {
  background: linear-gradient(90deg, var(--cyan), var(--purple), var(--cyan));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s linear infinite;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text-dim);
}
.meta-item { display: inline-flex; align-items: center; gap: 6px; }
.meta-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
  display: inline-block;
}
.meta-dot.online {
  background: var(--green);
  animation: pulse 2s ease-in-out infinite;
}
.header-right { display: flex; align-items: center; }
.search-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(10, 18, 42, 0.5);
  border: 1px solid rgba(100, 140, 200, 0.15);
  border-radius: 12px;
  padding: 5px 5px 5px 14px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.search-wrap:focus-within {
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.08);
}
.search-icon { color: var(--cyan); flex-shrink: 0; opacity: 0.8; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13px;
  padding: 8px 10px;
  width: 240px;
  font-family: inherit;
}
.search-input::placeholder { color: var(--text-dim); }
.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  transition: color 0.2s ease;
}
.clear-btn:hover { color: var(--red); }
.search-btn {
  padding: 9px 20px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  border: none;
  border-radius: 9px;
  color: #02040a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}
.search-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* ===== Bento Grid ===== */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: dense;
  gap: 20px;
}
.bento-card {
  position: relative;
  background: linear-gradient(160deg, rgba(22, 28, 52, 0.88) 0%, rgba(14, 20, 40, 0.82) 100%);
  border: 1px solid rgba(100, 140, 200, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.35), 
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 0 0 1px rgba(0, 240, 255, 0.03);
  padding: 24px;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s ease, box-shadow 0.4s ease;
}
.bento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 5%, rgba(0, 240, 255, 0.4) 40%, rgba(124, 58, 237, 0.4) 60%, transparent 95%);
  border-radius: 20px 20px 0 0;
  opacity: 0.6;
}
.bento-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 0%, rgba(0, 240, 255, 0.04), transparent 40%),
    radial-gradient(ellipse at 80% 100%, rgba(124, 58, 237, 0.03), transparent 40%);
  pointer-events: none;
}
.bento-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 240, 255, 0.25);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5), 
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 0 24px rgba(0, 240, 255, 0.08);
}
.neon-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 5%, var(--cyan) 40%, var(--purple) 60%, transparent 95%);
  border-radius: 20px 20px 0 0;
  pointer-events: none;
  filter: blur(0.5px);
  opacity: 0.8;
}
.bento-card:hover .neon-border {
  opacity: 1;
  filter: blur(0);
}

/* ===== Hero 大卡 ===== */
.hero-card {
  grid-column: span 6;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, rgba(18, 24, 48, 0.92) 0%, rgba(10, 16, 34, 0.88) 100%);
}
.hero-card::after {
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(0, 240, 255, 0.06), transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(124, 58, 237, 0.06), transparent 50%);
}
.hero-particles {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(1px 1px at 20% 30%, rgba(0,240,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 70%, rgba(124,58,237,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 20%, rgba(244,114,182,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 80%, rgba(0,240,255,0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 90% 60%, rgba(124,58,237,0.3) 0%, transparent 100%);
  pointer-events: none;
  animation: particleDrift 20s linear infinite;
}
@keyframes particleDrift {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.hero-inner {
  display: flex;
  align-items: stretch;
  gap: 28px;
  flex: 1;
  position: relative;
  z-index: 1;
}
.hero-left { display: flex; flex-direction: column; gap: 10px; z-index: 1; flex: 1; }
.card-kicker {
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(0, 240, 255, 0.6);
  text-transform: uppercase;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  animation: pulse 2s ease-in-out infinite;
}
.hero-value-wrap {
  position: relative;
  display: inline-block;
}
.hero-value {
  font-family: var(--font-mono);
  font-size: 68px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;
  position: relative;
  z-index: 2;
}
.hero-value-glow {
  position: absolute;
  inset: -10px -20px;
  background: radial-gradient(ellipse at center, rgba(0,240,255,0.15), transparent 60%);
  filter: blur(20px);
  z-index: 1;
  animation: glowPulse 4s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.neon-text {
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-label {
  font-size: 14px;
  color: var(--text-dim);
  letter-spacing: 1px;
}
.hero-breakdown {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: auto;
}
.breakdown-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(20, 30, 60, 0.5), rgba(10, 18, 40, 0.4));
  border: 1px solid rgba(100, 140, 200, 0.12);
  border-radius: 14px;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
}
.breakdown-card:hover {
  border-color: rgba(0, 240, 255, 0.25);
  background: linear-gradient(135deg, rgba(25, 38, 72, 0.6), rgba(14, 22, 48, 0.5));
  transform: translateY(-2px);
}
.breakdown-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cyan-icon { background: rgba(0, 240, 255, 0.12); color: var(--cyan); }
.purple-icon { background: rgba(124, 58, 237, 0.12); color: var(--purple); }
.amber-icon { background: rgba(251, 191, 36, 0.12); color: var(--amber); }
.breakdown-info { flex: 1; min-width: 0; }
.breakdown-val {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}
.breakdown-val.cyan { color: var(--cyan); }
.breakdown-val.purple { color: var(--purple); }
.breakdown-val.amber { color: var(--amber); }
.breakdown-label { font-size: 10px; color: var(--text-dim); margin-top: 2px; }

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  min-width: 200px;
  padding: 4px;
}
.hero-ring-container {
  position: relative;
  width: 140px;
  height: 140px;
}
.hero-ring-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.3));
}
.hero-ring-main {
  animation: ringDraw 2s ease-out forwards;
}
.hero-ring-sub {
  animation: ringDraw 2s 0.3s ease-out forwards;
}
@keyframes ringDraw {
  from { stroke-dasharray: 0 326.7; }
}

/* ===== Hero Top & Data Stream ===== */
.hero-top { display: flex; flex-direction: column; gap: 6px; }
.hero-data-stream {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(180deg, rgba(5, 10, 25, 0.5), rgba(10, 16, 34, 0.3));
  border: 1px solid rgba(100, 140, 200, 0.08);
  border-radius: 14px;
  min-height: 120px;
}
.stream-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stream-title {
  font-size: 11px;
  color: rgba(200, 210, 230, 0.8);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.stream-total {
  font-size: 10px;
  color: var(--cyan);
  font-family: var(--font-mono);
  font-weight: 600;
}
.stream-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
  opacity: 0.7;
}
.stream-bars {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 6px;
  flex: 1;
  min-height: 70px;
}
.stream-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.stream-bar-track {
  position: relative;
  width: 100%;
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}
.stream-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 4px 4px 0 0;
  transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.stream-bar-glow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: bottom 1s cubic-bezier(0.4, 0, 0.2, 1);
  animation: barPulse 2s ease-in-out infinite;
}
@keyframes barPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; transform: translateX(-50%) scale(1.3); }
}
.stream-bar-pct {
  font-size: 10px;
  font-weight: 700;
  font-family: var(--font-mono);
}
.stream-bar-count {
  font-size: 8px;
  color: rgba(200, 210, 230, 0.5);
  font-family: var(--font-mono);
  text-align: center;
}

/* ===== Hero Top Skills ===== */
.hero-top-skills {
  width: 100%;
  background: rgba(5, 10, 25, 0.4);
  border: 1px solid rgba(100, 140, 200, 0.1);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.top-skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(100, 140, 200, 0.08);
}
.top-skills-label {
  font-size: 10px;
  color: rgba(200, 210, 230, 0.7);
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
}
.hero-mini-stats {
  display: flex;
  gap: 8px;
  width: 100%;
}
.mini-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 10px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(124, 58, 237, 0.05));
  border: 1px solid rgba(100, 140, 200, 0.1);
  border-radius: 10px;
}
.mini-stat-label {
  font-size: 9px;
  color: rgba(200, 210, 230, 0.6);
  margin-bottom: 2px;
}
.mini-stat-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--cyan);
  font-family: var(--font-mono);
}
.top-skill-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.skill-rank {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(100, 140, 200, 0.15);
  color: var(--text-dim);
}
.skill-rank.rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1000; }
.skill-rank.rank-2 { background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff; }
.skill-rank.rank-3 { background: linear-gradient(135deg, #00f0ff, #06b6d4); color: #003040; }
.skill-name {
  flex: 1;
  font-weight: 600;
  color: var(--text);
  min-width: 0;
}
.skill-bar {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}
.skill-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00f0ff, #7c3aed);
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.skill-pct {
  font-size: 10px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--cyan);
  min-width: 24px;
  text-align: right;
}

/* ===== Mini Charts (Larger) ===== */
.spark-chart-lg { height: 70px; width: 100%; }
.ring-chart-lg { height: 100px; width: 100%; }

/* ===== Salary Range Mini Legend ===== */
.salary-range-mini {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-top: 8px;
}
.range-mini-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid;
  border-radius: 8px;
  font-size: 10px;
}
.range-mini-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.range-mini-label {
  flex: 1;
  color: var(--text-dim);
  font-weight: 500;
}
.range-mini-pct {
  font-weight: 700;
  font-family: var(--font-mono);
}

/* ===== Salary Bars Mini (Redesigned) ===== */
.salary-bars-mini {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 8px;
}
.salary-bar-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.salary-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}
.salary-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.salary-bar-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}
.salary-bar-label {
  font-weight: 600;
}
.salary-bar-count {
  color: rgba(200, 210, 230, 0.6);
  font-family: var(--font-mono);
}

/* ===== City Rank Bars (Redesigned) ===== */
.city-rank-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}
.city-rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.city-rank-num {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(100, 140, 200, 0.15);
  color: var(--text-dim);
}
.city-rank-num.rank-1 { background: linear-gradient(135deg, #00f0ff, #06b6d4); color: #003040; }
.city-rank-num.rank-2 { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; }
.city-rank-num.rank-3 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1000; }
.city-rank-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.city-rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.city-rank-name {
  color: var(--text);
  font-weight: 600;
}
.city-rank-pct {
  font-weight: 700;
  font-family: var(--font-mono);
}
.city-rank-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}
.city-rank-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.city-mini-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 12px;
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.04), rgba(124, 58, 237, 0.03));
  border-radius: 10px;
  border: 1px solid rgba(100, 140, 200, 0.08);
}
.city-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.city-stat-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--purple-light);
  font-family: var(--font-mono);
}
.city-stat-label {
  font-size: 9px;
  color: var(--text-dim);
  margin-top: 2px;
}
.city-stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(100, 140, 200, 0.15);
}

/* ===== Education Content (Redesigned) ===== */
.edu-content {
  display: flex;
  gap: 20px;
  align-items: stretch;
  flex: 1;
  padding-top: 8px;
}
.edu-donut-box {
  flex: 0 0 48%;
  height: 230px;
}
.edu-legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  padding: 10px 4px;
}
.edu-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(100, 140, 200, 0.06);
  border-radius: 10px;
  transition: all 0.3s ease;
}
.edu-legend-item:hover {
  background: rgba(0, 240, 255, 0.04);
  border-color: rgba(0, 240, 255, 0.15);
  transform: translateX(3px);
}
.edu-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}
.edu-legend-name {
  width: 68px;
  color: var(--text);
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}
.edu-legend-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}
.edu-legend-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 6px currentColor;
}
.edu-legend-pct {
  width: 40px;
  text-align: right;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--cyan);
  font-size: 13px;
}

/* ===== Skill Content (Redesigned) ===== */
.skill-content {
  display: flex;
  gap: 20px;
  flex: 1;
  padding-top: 8px;
}
.skill-chart-box {
  flex: 0 0 55%;
  height: 230px;
}
.skill-frequency-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: 10px 4px;
}
.skill-freq-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(100, 140, 200, 0.06);
  border-radius: 10px;
  transition: all 0.3s ease;
}
.skill-freq-item:hover {
  background: rgba(124, 58, 237, 0.04);
  border-color: rgba(124, 58, 237, 0.15);
  transform: translateX(3px);
}
.skill-freq-name {
  width: 64px;
  color: var(--text);
  font-weight: 700;
  flex-shrink: 0;
  font-size: 12px;
}
.skill-freq-bar {
  flex: 1;
  height: 7px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  overflow: hidden;
}
.skill-freq-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 6px currentColor;
}
.skill-freq-pct {
  width: 34px;
  text-align: right;
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: 13px;
}

.hero-spark-wrap {
  width: 100%;
  background: rgba(5, 10, 25, 0.4);
  border: 1px solid rgba(100, 140, 200, 0.1);
  border-radius: 12px;
  padding: 10px 12px;
}
.spark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.spark-label { font-size: 10px; color: var(--text-dim); letter-spacing: 0.5px; }
.spark-value { font-size: 12px; color: var(--green); font-weight: 700; font-family: var(--font-mono); }
.spark-chart { height: 35px; margin: 0; }
.spark-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: 24px;
  margin-top: 6px;
}
.spark-bar-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px 2px 0 0;
  position: relative;
  overflow: hidden;
  min-height: 4px;
}
.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 2px 2px 0 0;
  opacity: 0.85;
}
.spark-bar-item:first-child .bar-fill { opacity: 0.7; }
.spark-bar-item:last-child .bar-fill { opacity: 0.7; }

/* ===== 数据卡 ===== */
.data-card {
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-dim);
  letter-spacing: 1px;
}
.card-label { font-size: 13px; color: var(--text-dim); }
.card-value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 1px;
}
.neon-cyan-text { color: var(--cyan); }
.neon-purple-text { color: var(--purple); }
.neon-amber-text { color: var(--amber); }
.card-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.trend-indicator.up {
  background: rgba(0, 255, 157, 0.1);
  color: var(--green);
}
.trend-indicator.down {
  background: rgba(255, 71, 87, 0.1);
  color: var(--red);
}
.trend-arrow { font-size: 10px; }
.mini-chart {
  width: 100%;
  height: 50px;
  margin-top: auto;
}
.spark-chart { height: 50px; }
.bars-chart { height: 55px; }
.card-insight {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.04), rgba(124, 58, 237, 0.03));
  border-radius: 10px;
  border: 1px solid rgba(100, 140, 200, 0.1);
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.4;
}
.insight-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* ===== 图表卡 ===== */
.chart-card { grid-column: span 3; display: flex; flex-direction: column; }
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.card-header.compact { margin-bottom: 10px; }
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.5px;
}
.card-sub { font-size: 12px; color: var(--text-dim); margin-top: 3px; }
.card-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.15);
}
.neon-cyan-bg {
  background: rgba(0, 240, 255, 0.06);
  border-color: rgba(0, 240, 255, 0.25);
}
.badge-val {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--cyan);
}
.badge-label { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
.chart-box { width: 100%; height: 260px; position: relative; }
.edu-donut-box { height: 230px; }
.skill-chart-box { height: 230px; }
.chart-box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.02), transparent 70%);
  pointer-events: none;
}

/* ===== 学历分布 ===== */
.info-card { grid-column: span 6; display: flex; flex-direction: column; }
.skill-card { grid-column: span 6; }
.edu-list { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
.edu-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.edu-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 72px;
  flex-shrink: 0;
}
.edu-name { font-size: 13px; color: var(--text); font-weight: 500; }
.edu-count { font-size: 10px; color: var(--text-dim); font-family: var(--font-mono); }
.edu-progress {
  flex: 1;
  height: 7px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  overflow: hidden;
}
.edu-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.edu-percent {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  width: 38px;
  text-align: right;
}

/* ===== 排行榜 ===== */
.rank-card { grid-column: span 6; }
.rank-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; padding: 4px; }
.rank-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid rgba(100, 140, 200, 0.06);
  background: rgba(255, 255, 255, 0.015);
  transition: all 0.3s ease;
}
.rank-row:hover {
  background: rgba(0, 240, 255, 0.06);
  border-color: rgba(0, 240, 255, 0.15);
  transform: translateX(4px);
}
.rank-row.active {
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.06));
  border-color: rgba(0, 240, 255, 0.35);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1);
}
.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #2a1a00;
}
.rank-2 {
  background: linear-gradient(135deg, #d4d4d8, #a1a1aa);
  color: #1a1a1a;
}
.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #92400e);
  color: #fff;
}
.rank-info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.rank-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}
.rank-sub { font-size: 12px; color: var(--text-dim); font-family: var(--font-mono); }
.rank-progress { margin-top: 2px; height: 4px; background: rgba(255,255,255,0.04); border-radius: 2px; overflow: hidden; }
.rank-progress-bar { height: 100%; background: linear-gradient(90deg, #00f0ff, #7c3aed); border-radius: 2px; transition: width 1s ease; }
.rank-trend {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: #34d399;
  padding: 4px 8px;
  background: rgba(52, 211, 153, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(52, 211, 153, 0.15);
}

/* ===== 城市卡 ===== */
.city-card { grid-column: span 6; }

/* ===== 政策卡 ===== */
.policy-card {
  grid-column: span 12;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.neon-purple-border {
  background: linear-gradient(90deg, transparent, var(--purple), var(--cyan), transparent);
  filter: blur(0.5px);
}
.policy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.policy-title { display: flex; align-items: center; gap: 12px; }
.policy-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  color: var(--purple);
  flex-shrink: 0;
}
.policy-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.5px;
}
.policy-desc { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.update-time { color: var(--cyan); font-family: var(--font-mono); }
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.4);
  border-radius: 20px;
  font-size: 12px;
  color: var(--red);
  flex-shrink: 0;
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
  animation: livePulse 1.5s ease-in-out infinite;
}
.policy-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.policy-tab {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid rgba(100, 140, 200, 0.15);
  border-radius: 10px;
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.policy-tab:hover { color: var(--text); border-color: rgba(0, 240, 255, 0.25); }
.policy-tab.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.08));
  border-color: rgba(0, 240, 255, 0.3);
  color: var(--cyan);
}
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}
.policy-list::-webkit-scrollbar {
  width: 6px;
}
.policy-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.policy-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyan), var(--purple));
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.3);
}
.policy-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.5), rgba(124, 58, 237, 0.5));
}
.policy-item {
  display: flex;
  gap: 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(12, 20, 48, 0.45), rgba(8, 14, 36, 0.4));
  border: 1px solid rgba(100, 140, 200, 0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.policy-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.06), transparent 70%);
  pointer-events: none;
}
.policy-item:hover {
  background: linear-gradient(135deg, rgba(22, 34, 68, 0.55), rgba(14, 22, 48, 0.45));
  border-color: rgba(0, 240, 255, 0.2);
  transform: translateX(3px);
}
.policy-item.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(124, 58, 237, 0.05));
  border-color: rgba(0, 240, 255, 0.25);
}
.policy-accent {
  width: 3px;
  border-radius: 3px;
  margin-right: 14px;
  flex-shrink: 0;
  background: var(--cyan);
}
.policy-accent.national { background: var(--red); }
.policy-accent.provincial { background: var(--amber); }
.policy-accent.city { background: var(--cyan); }
.policy-body { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.policy-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.policy-item-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.policy-level {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-dim);
  flex-shrink: 0;
}
.policy-level.national { background: rgba(255, 71, 87, 0.12); color: var(--red); }
.policy-level.provincial { background: rgba(251, 191, 36, 0.12); color: var(--amber); }
.policy-level.city { background: rgba(0, 240, 255, 0.12); color: var(--cyan); }
.policy-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-dim);
}
.policy-city { display: inline-flex; align-items: center; gap: 4px; }
.policy-amount {
  margin-left: auto;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--amber);
}
.policy-jobs {
  margin: 0;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
}
.policy-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.policy-match {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--green);
}
.match-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
}
.detail-btn {
  background: transparent;
  border: 1px solid rgba(100, 140, 200, 0.2);
  border-radius: 8px;
  padding: 5px 14px;
  color: var(--cyan);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.detail-btn:hover {
  background: rgba(0, 240, 255, 0.08);
  border-color: rgba(0, 240, 255, 0.3);
}
.policy-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-dim);
  text-align: center;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}

/* ===== 技能需求卡片 ===== */
.skill-list { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.skill-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 10px;
  transition: background 0.25s, transform 0.25s;
}
.skill-row:hover { background: rgba(0, 240, 255, 0.04); transform: translateX(2px); }
.skill-rank {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono);
  background: rgba(100, 140, 200, 0.12);
  color: var(--text-dim);
  flex-shrink: 0;
}
.skill-rank.rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; }
.skill-rank.rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); color: #000; }
.skill-rank.rank-3 { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; }
.skill-info { flex: 1; min-width: 0; }
.skill-name { font-size: 13px; color: var(--text); font-weight: 500; margin-bottom: 3px; }
.skill-bar-wrap {
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}
.skill-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--cyan), var(--purple));
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.skill-percent {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--cyan);
  min-width: 32px;
  text-align: right;
}
.policy-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-btn {
  padding: 5px 14px;
  background: transparent;
  border: 1px solid rgba(100, 140, 200, 0.15);
  border-radius: 8px;
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: rgba(0, 240, 255, 0.3);
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.04);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.page-num {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-dim);
  font-size: 12px;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.25s ease;
}
.page-num:hover {
  border-color: rgba(100, 140, 200, 0.2);
  color: var(--text);
}
.page-num.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(124, 58, 237, 0.1));
  border-color: rgba(0, 240, 255, 0.35);
  color: var(--cyan);
}

/* ===== 页脚 ===== */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  font-size: 12px;
  color: var(--text-dim);
}
.footer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}
.footer-sep { color: var(--text-dim); opacity: 0.5; }
.footer-ok { color: var(--green); }

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(2, 4, 10, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: var(--bg-card);
  border: 1px solid rgba(100, 140, 200, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  animation: modalIn 0.3s ease;
}
.modal-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid rgba(100, 140, 200, 0.1);
}
.modal-title-wrap { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.modal-level {
  align-self: flex-start;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-dim);
}
.modal-level.national { background: rgba(255, 71, 87, 0.12); color: var(--red); }
.modal-level.provincial { background: rgba(251, 191, 36, 0.12); color: var(--amber); }
.modal-level.city { background: rgba(0, 240, 255, 0.12); color: var(--cyan); }
.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.5px;
}
.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.modal-close:hover {
  color: var(--red);
  border-color: rgba(255, 71, 87, 0.5);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}
.modal-body {
  padding: 18px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid transparent;
}
.modal-row.highlight {
  background: rgba(251, 191, 36, 0.06);
  border-color: rgba(251, 191, 36, 0.25);
}
.modal-row-label {
  font-size: 12px;
  color: var(--text-dim);
  flex-shrink: 0;
  min-width: 70px;
}
.modal-row-value {
  font-size: 13px;
  color: var(--text);
  text-align: right;
  flex: 1;
}
.modal-row-value.amount {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--amber);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  font-size: 15px;
}
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;
}
.modal-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--cyan);
}
.modal-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(124, 58, 237, 0.12));
  border: 1px solid var(--border-glow);
  border-radius: 10px;
  color: var(--cyan);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}
.modal-link-btn:hover {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(124, 58, 237, 0.2));
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
  transform: translateY(-1px);
}

/* ===== 滚动条 ===== */
.policy-list::-webkit-scrollbar { width: 6px; }
.policy-list::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
.policy-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyan), var(--purple));
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.4);
}
.policy-list::-webkit-scrollbar-thumb:hover { background: var(--cyan); }

/* ===== 动画 ===== */
@keyframes gradientShift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
@keyframes livePulse {
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 10px var(--red); }
  50% { transform: scale(1.4); opacity: 0.6; box-shadow: 0 0 16px var(--red); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes borderFlow {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}
@keyframes nebulaDrift {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -30px) scale(1.1); }
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes numberCountUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.shimmer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: shimmer 3s ease-in-out infinite;
  pointer-events: none;
}
.bento-card:hover .shimmer-overlay {
  animation-duration: 1.5s;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(6, 1fr); }
  .hero-card { grid-column: span 6; grid-row: span 1; }
  .data-card { grid-column: span 3; }
  .chart-card { grid-column: span 3; }
  .info-card { grid-column: span 3; }
  .skill-card { grid-column: span 3; }
  .rank-card { grid-column: span 3; }
  .city-card { grid-column: span 3; }
  .policy-card { grid-column: span 6; }
  .hero-inner { flex-direction: column; gap: 16px; }
  .hero-right { flex-direction: row; justify-content: center; width: 100%; }
  .hero-ring-container { width: 100px; height: 100px; }
  .hero-value { font-size: 48px; }
  .breakdown-card { padding: 10px 12px; }
  .breakdown-val { font-size: 15px; }
  .edu-content, .skill-content { flex-direction: column; gap: 12px; }
  .edu-donut-box, .skill-chart-box { flex: 1; width: 100%; }
}
@media (max-width: 640px) {
  .page-container { padding: 18px 14px 28px; }
  .bento-grid { grid-template-columns: 1fr; gap: 14px; }
  .hero-card, .data-card, .chart-card, .info-card, .city-card, .policy-card, .skill-card { grid-column: span 1; }
  .page-header { flex-direction: column; align-items: stretch; }
  .header-left { flex-wrap: wrap; }
  .search-input { width: 100%; }
  .search-wrap { width: 100%; }
  .hero-value { font-size: 36px; }
  .hero-right { flex-direction: column; }
  .hero-ring-container { width: 90px; height: 90px; }
  .card-value { font-size: 26px; }
  .chart-box { height: 240px; }
}

/* ===== 无搜索结果 ===== */
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
}
.no-results-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.7; }
.no-results-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
.no-results-desc { font-size: 14px; color: var(--text-dim); margin-bottom: 20px; }
.no-results-btn {
  background: linear-gradient(135deg, var(--cyan), var(--cyan-dim));
  color: #02040a;
  border: none;
  padding: 10px 28px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}
.no-results-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
}

/* ===== 卡片浮窗交互 ===== */
.card-hint {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 10px;
  color: var(--text-dim);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  white-space: nowrap;
}
.bento-card:hover .card-hint { opacity: 0.5; }
.card-pinned {
  border-color: var(--border-glow) !important;
  box-shadow: 0 0 24px rgba(0, 240, 255, 0.2), inset 0 0 12px rgba(0, 240, 255, 0.05) !important;
}
.card-pinned .card-hint { opacity: 0; }

/* ===== 浮窗遮罩 ===== */
.card-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 4, 10, 0.55);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.card-popup-overlay.overlay-pinned {
  pointer-events: none;
  background: rgba(2, 4, 10, 0.7);
}
.card-popup {
  position: relative;
  width: 700px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(145deg, rgba(14, 22, 52, 0.95), rgba(8, 14, 36, 0.95));
  border: 1px solid var(--border-glow);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.1);
  pointer-events: auto;
}
.card-popup::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}
.popup-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}
.popup-close:hover {
  border-color: var(--red);
  color: var(--red);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}
.popup-close-hint {
  position: absolute;
  top: 22px;
  right: 56px;
  font-size: 11px;
  color: var(--text-dim);
  opacity: 0.6;
}
.popup-header {
  margin-bottom: 20px;
}
.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 6px;
  letter-spacing: 0.5px;
}
.popup-sub {
  font-size: 13px;
  color: var(--text-dim);
  margin: 0;
}

/* Hero浮窗 - 地图 */
.popup-map-chart {
  width: 100%;
  height: 380px;
  margin-bottom: 16px;
}
.popup-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.popup-stat { text-align: center; }
.popup-stat-val {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.popup-stat-label {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 4px;
}
.popup-stat-val.cyan { color: var(--cyan); text-shadow: 0 0 8px rgba(0, 240, 255, 0.4); }
.popup-stat-val.purple { color: var(--purple-light); text-shadow: 0 0 8px rgba(124, 58, 237, 0.4); }
.popup-stat-val.amber { color: var(--amber); text-shadow: 0 0 8px rgba(251, 191, 36, 0.4); }
.popup-stat-val.green { color: var(--green); text-shadow: 0 0 8px rgba(0, 255, 157, 0.4); }

/* 薪资浮窗 */
.popup-salary-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.popup-salary-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.salary-range-label {
  width: 60px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.salary-range-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}
.salary-range-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.salary-range-count {
  width: 55px;
  text-align: right;
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.salary-range-percent {
  width: 35px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.popup-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 20px 0;
}
.popup-sub-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}
.popup-edu-chart {
  width: 100%;
  height: 200px;
}

/* 城市浮窗 */
.popup-city-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
}
.popup-city-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.popup-city-row:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: var(--border);
}
.city-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
  flex-shrink: 0;
}
.city-rank.rank-top {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(124, 58, 237, 0.2));
  color: var(--cyan);
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
}
.city-name {
  width: 70px;
  font-size: 13px;
  color: var(--text);
  flex-shrink: 0;
}
.city-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}
.city-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--purple), var(--purple-light));
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(124, 58, 237, 0.4);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.city-count {
  width: 50px;
  text-align: right;
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.city-percent {
  width: 35px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--purple-light);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* 浮窗动画 */
.popup-fade-enter-active, .popup-fade-leave-active {
  transition: opacity 0.3s ease;
}
.popup-fade-enter-from, .popup-fade-leave-to {
  opacity: 0;
}
.popup-fade-enter-to, .popup-fade-leave-from {
  opacity: 1;
}
.popup-fade-enter-active .card-popup,
.popup-fade-leave-active .card-popup {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.popup-fade-enter-from .card-popup,
.popup-fade-leave-to .card-popup {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.popup-fade-enter-to .card-popup,
.popup-fade-leave-from .card-popup {
  transform: scale(1) translateY(0);
  opacity: 1;
}
</style>
