<template>
  <div class="job-recommend-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="#4a9eff" stroke-width="2"/>
        </svg>
        <span>返回</span>
      </button>
      <div class="header-title">
        <div class="title-row">
          <h1>智能岗位推荐</h1>
          <span class="ai-powered-tag" @click="showAIPoweredInfo = true" title="点击了解推荐算法">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            AI驱动
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </span>
        </div>
        <p>基于AI算法的个性化岗位智能推荐系统</p>
      </div>
      <button class="my-fav-btn" @click="openMyFavorites">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>我的收藏</span>
        <span v-if="favorites.length" class="fav-count">{{ favorites.length }}</span>
      </button>
    </div>
    
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
          <line x1="21" y1="21" x2="16" y2="16" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
        </svg>
        <input type="text" v-model="searchKeyword" placeholder="搜索岗位、公司、技能关键词" class="search-input"/>
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <div class="category-tabs">
      <div 
        v-for="(tab, index) in categories" 
        :key="index" 
        class="tab-item"
        :class="{ active: activeCategory === index }"
        @click="handleCategoryChange(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="main-content">
      <div class="job-list-section">
        <div class="section-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="#4a9eff" stroke-width="2"/>
              <path d="M2 17l10 5 10-5" fill="none" stroke="#4a9eff" stroke-width="2"/>
              <path d="M2 12l10 5 10-5" fill="none" stroke="#4a9eff" stroke-width="2"/>
            </svg>
          </div>
          <span>智能推荐岗位</span>
        </div>

        <div class="job-cards">
          <div class="job-card" :class="{ 'job-card-placeholder': job.isPlaceholder }" v-for="(job, index) in paginatedJobs" :key="index">
            <div class="job-card-glow"></div>
            <div class="job-header">
              <div class="job-title">{{ job.title }}</div>
              <div class="job-company">{{ job.company }}</div>
            </div>
            <div class="job-info">
              <div class="info-item">
                <span class="label">期望城市</span>
                <span class="value">{{ job.city }}</span>
              </div>
              <div class="info-item">
                <span class="label">薪资</span>
                <span class="value">{{ job.salary }}</span>
              </div>
              <div class="info-item">
                <span class="label">匹配度</span>
                <span class="value match-value">{{ job.match }}%</span>
              </div>
            </div>
            <div class="job-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                来源：{{ job.dataSource }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                学历：{{ job.education }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                </svg>
                经验：{{ job.work_exp }}
              </span>
            </div>
            <div class="job-tags">
              <span v-for="(tag, tIndex) in job.tags" :key="tIndex" class="tag">{{ tag }}</span>
            </div>
            <div class="job-actions">
              <button 
                class="favorite-btn" 
                :class="{ favorited: isFavorited(job.title) }"
                @click="toggleFavorite(job)"
              >
                <svg v-if="!isFavorited(job.title)" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                <!-- 已收藏 → 十字（取消收藏语义） -->
                <svg v-else viewBox="0 0 24 24" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="#7aa0ff" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="#7aa0ff" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                {{ isFavorited(job.title) ? '已收藏' : '收藏' }}
              </button>
              <button class="detail-btn" @click="openDetail(job)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                查看详情
              </button>
            </div>
            <div class="card-corner tl"></div>
            <div class="card-corner tr"></div>
            <div class="card-corner bl"></div>
            <div class="card-corner br"></div>
          </div>
        </div>

        <div class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <div class="page-numbers">
            <template v-for="page in visiblePages" :key="page.key">
              <span v-if="page.key === 'ellipsis'" class="page-ellipsis">...</span>
              <button 
                v-else
                class="page-number"
                :class="{ active: currentPage === page.value }"
                @click="changePage(page.value)"
              >
                {{ page.value }}
              </button>
            </template>
          </div>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
          <span class="page-info">共 {{ filteredJobCount }} 条 / 第 {{ currentPage }}/{{ totalPages }} 页</span>
        </div>

        <button class="reset-btn" @click="resetFilters">重置筛选</button>
      </div>

      <div class="filter-section">
        <div class="filter-content">
          <div class="section-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="3" fill="#4a9eff"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="#4a9eff" stroke-width="2"/>
              </svg>
            </div>
            <span>筛选条件</span>
          </div>

          <div class="filter-items">
            <div class="filter-item" v-for="(filter, index) in filters" :key="index">
              <div class="filter-label">{{ filter.name }}</div>
              <div class="slider-container">
                <div class="slider-wrapper">
                  <div class="slider-track">
                    <div class="slider-fill" :style="{ width: filter.value + '%' }"></div>
                  </div>
                  <input 
                    type="range" 
                    class="slider-input"
                    min="0" 
                    max="100" 
                    v-model="filter.value"
                    @input="onSliderChange(index)"
                  />
                </div>
                <div class="slider-value">{{ filter.value }}%</div>
              </div>
            </div>
          </div>

          <div class="quick-filters">
            <div class="quick-title">快速筛选</div>
            <div class="quick-options">
              <div 
                v-for="(option, index) in quickOptions" 
                :key="index" 
                class="quick-option"
                :class="{ active: selectedOptions.includes(option) }"
                @click="toggleOption(option)"
              >
                {{ option }}
              </div>
            </div>
          </div>

          <div class="additional-filters">
            <div class="quick-title">城市筛选</div>
            <div class="quick-options">
              <div class="quick-option" :class="{ active: selectedOptions.includes('北京') }" @click="toggleOption('北京')">北京</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('上海') }" @click="toggleOption('上海')">上海</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('深圳') }" @click="toggleOption('深圳')">深圳</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('广州') }" @click="toggleOption('广州')">广州</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('杭州') }" @click="toggleOption('杭州')">杭州</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('成都') }" @click="toggleOption('成都')">成都</div>
            </div>
          </div>

          <div class="additional-filters">
            <div class="quick-title">经验要求</div>
            <div class="quick-options">
              <div class="quick-option" :class="{ active: selectedOptions.includes('应届') }" @click="toggleOption('应届')">应届生</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('1-3年') }" @click="toggleOption('1-3年')">1-3年</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('3-5年') }" @click="toggleOption('3-5年')">3-5年</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('5年以上') }" @click="toggleOption('5年以上')">5年以上</div>
            </div>
          </div>

          <div class="additional-filters">
            <div class="quick-title">薪资范围</div>
            <div class="quick-options">
              <div class="quick-option" :class="{ active: selectedOptions.includes('5K以下') }" @click="toggleOption('5K以下')">5K以下</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('5-10K') }" @click="toggleOption('5-10K')">5-10K</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('10-20K') }" @click="toggleOption('10-20K')">10-20K</div>
              <div class="quick-option" :class="{ active: selectedOptions.includes('20K以上') }" @click="toggleOption('20K以上')">20K以上</div>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <button 
            class="apply-filter-btn" 
            :disabled="filtering"
            @click="handleApplyFilter"
          >
            <svg v-if="!filtering" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else class="spinner" viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 60"/>
            </svg>
            {{ filtering ? '筛选中...' : '开始筛选' }}
          </button>
          <button class="reset-filter-btn" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>

    <!-- ===== 岗位详情弹窗（对齐参考图紫蓝发光风格） ===== -->
    <Teleport to="body">
      <div v-if="detailJob" class="detail-overlay" @click.self="closeDetail">
        <div class="detail-modal">
          <!-- 关闭按钮 -->
          <button class="detail-close" @click="closeDetail">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <!-- 标题区 -->
          <div class="detail-title-row">
            <h2 class="detail-job-title">{{ detailJob.title }}</h2>
            <div class="detail-job-tags">
              <span v-for="tag in detailJob.tags.slice(0, 4)" :key="tag" class="detail-tag">{{ tag }}</span>
            </div>
          </div>

          <!-- AI 智能分析 -->
          <div class="detail-section ai-section">
            <div class="detail-section-title">
              <span class="ai-bolt-icon"></span>
              AI智能分析
            </div>
            <div class="ai-main">
              <!-- 无简历时：提示区 -->
              <div v-if="!hasResume" class="ai-no-resume">
                <div class="no-resume-icon">📋</div>
                <div class="no-resume-text">
                  <div class="no-resume-title">请先填写简历</div>
                  <div class="no-resume-desc">前往「AI简历制作」页面完善基本信息、技能标签、教育背景等，即可获取真实的岗位匹配分析</div>
                </div>
                <button class="go-resume-btn" @click="$router.push('/ai-resume')">去填写简历</button>
              </div>

              <!-- 有简历时：匹配度 + 分析线 -->
              <template v-else>
                <div class="ai-analysis-left">
                  <div class="match-ring">
                    <svg viewBox="0 0 120 120" class="match-ring-svg">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(124, 58, 237, 0.15)" stroke-width="10"/>
                      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#ringGrad)" stroke-width="10"
                        stroke-linecap="round" :stroke-dasharray="`${computeRealMatch(detailJob).score * 3.267} 326.7`"
                        :style="{ transform: 'rotate(-90deg)', transformOrigin: 'center' }"/>
                      <defs>
                        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stop-color="#7c3aed"/>
                          <stop offset="100%" stop-color="#4a9eff"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="match-ring-text">
                      <span class="match-num">{{ computeRealMatch(detailJob).score }}</span>
                      <span class="match-label">匹配度</span>
                    </div>
                  </div>
                  <div class="ai-analysis-lines">
                    <div v-for="(line, idx) in computeRealMatch(detailJob).lines" :key="idx" class="ai-line">
                      <span class="ai-match-badge" :class="line.ok ? 'ok' : 'fail'">{{ line.ok ? '✓' : '✗' }}</span>
                      <span class="ai-label">{{ line.label }}</span>
                      <span class="ai-text">{{ line.text }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 右侧：薪资卡 + 分析建议（始终显示，岗位自身信息） -->
              <div class="ai-side">
                <div class="salary-card">
                  <div class="salary-main">
                    <div class="salary-amount-wrap">
                      <span class="salary-amount">{{ detailJob.salary_avg || 10 }}</span>
                      <span class="salary-unit">K</span>
                    </div>
                    <div class="salary-level-tag">{{ detailJob.analysis?.salaryLevel || '中等' }}</div>
                  </div>
                  <div class="salary-sub">{{ detailJob.analysis?.salaryDesc || '' }}</div>
                </div>
                <div v-if="hasResume" class="ai-suggestion">
                  <span class="suggestion-icon">💡</span>
                  <span>{{ detailJob.analysis?.suggestion || '' }}</span>
                </div>
              </div>
            </div>

            <!-- 三个指标卡 -->
            <div class="ai-metrics">
              <div class="metric-card">
                <div class="metric-num">{{ computeMetric('heat') }}</div>
                <div class="metric-label">招聘热度</div>
              </div>
              <div class="metric-card">
                <div class="metric-num">{{ computeMetric('competition') }}</div>
                <div class="metric-label">竞争程度</div>
              </div>
              <div class="metric-card">
                <div class="metric-num">{{ detailJob.city }}</div>
                <div class="metric-label">岗位城市</div>
              </div>
            </div>
          </div>

          <!-- 招聘信息 -->
          <div v-if="hasAnyRecruitInfo" class="detail-section">
            <div class="detail-section-title"><span>🏢</span> 招聘信息</div>
            <div class="recruit-info">
              <div v-if="detailJob.company && detailJob.company !== '未知公司'" class="recruit-row"><span class="recruit-key">公司名称</span><span class="recruit-val">{{ detailJob.company }}</span></div>
              <div v-if="detailJob.city && detailJob.city !== '不限'" class="recruit-row"><span class="recruit-key">工作城市</span><span class="recruit-val">{{ detailJob.city }}</span></div>
              <div v-if="detailJob.salary && !detailJob.salary.includes('0K')" class="recruit-row"><span class="recruit-key">薪资待遇</span><span class="recruit-val highlight-salary">{{ detailJob.salary }}</span></div>
              <div v-if="detailJob.education && detailJob.education !== '不限' && !detailJob.education.includes('不限')" class="recruit-row"><span class="recruit-key">学历要求</span><span class="recruit-val">{{ detailJob.education }}</span></div>
              <div v-if="detailJob.work_exp && detailJob.work_exp !== '不限' && !detailJob.work_exp.includes('不限')" class="recruit-row"><span class="recruit-key">经验要求</span><span class="recruit-val">{{ detailJob.work_exp }}</span></div>
              <div v-if="detailJob.dataSource && detailJob.dataSource !== '网络'" class="recruit-row"><span class="recruit-key">招聘来源</span><span class="recruit-val">{{ detailJob.dataSource }}</span></div>
            </div>
          </div>

          <!-- 职位描述 -->
          <div class="detail-section">
            <div class="detail-section-title"><span>📝</span> 职位描述</div>
            <div class="job-desc">{{ detailJob.job_desc }}</div>
          </div>

          <!-- 任职要求 -->
          <div class="detail-section">
            <div class="detail-section-title"><span>📋</span> 任职要求</div>
            <ul class="job-requirements">
              <li v-for="(r, i) in detailJob.requirements" :key="i">{{ r }}</li>
            </ul>
          </div>

          <!-- 底部功能按钮 -->
          <div class="detail-actions">
            <button class="action-btn" @click="showHRContact = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              岗位总结
            </button>
            <button class="action-btn" @click="showSalaryAnalyze = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              薪资分析
            </button>
            <button class="action-btn ai-resume" @click="showResumeOpt = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
              AI简历优化
            </button>
            <button class="action-btn ai-route" @click="showCareerRoute = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              AI求职路线
            </button>
          </div>

          <!-- 收藏底栏 -->
          <div class="detail-footer">
            <button class="footer-btn primary" @click="toggleFavorite(detailJob)">
              <!-- 未收藏：空心爱心 -->
              <svg v-if="!isFavorited(detailJob.title)" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <!-- 已收藏：十字（取消收藏语义） -->
              <svg v-else viewBox="0 0 24 24" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18" stroke="#7aa0ff" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="#7aa0ff" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              {{ isFavorited(detailJob.title) ? '已收藏岗位' : '收藏岗位' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 岗位总结弹窗（原 联系HR） ===== -->
    <Teleport to="body">
      <div v-if="showHRContact" class="detail-overlay" @click.self="showHRContact = false">
        <div class="detail-modal hr-contact-modal">
          <button class="detail-close" @click="showHRContact = false">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="hr-modal-header">
            <div class="hr-avatar">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div class="hr-info">
              <h3 class="hr-name">岗位数据总结</h3>
              <p class="hr-job">{{ detailJob?.title }} · {{ detailJob?.city }}</p>
            </div>
          </div>

          <div class="hr-modal-body" v-if="detailJob">
            <!-- 核心指标卡 -->
            <div class="hr-stats-grid">
              <div v-if="companyStats.companyCount" class="hr-stat-card">
                <div class="hr-stat-num">{{ companyStats.companyCount }}</div>
                <div class="hr-stat-label">该公司岗位数</div>
              </div>
              <div v-if="salaryStats.totalSameTitle" class="hr-stat-card">
                <div class="hr-stat-num">{{ salaryStats.totalSameTitle }}</div>
                <div class="hr-stat-label">同岗位名岗位数</div>
              </div>
              <div v-if="companyStats.companyAvg" class="hr-stat-card">
                <div class="hr-stat-num">{{ companyStats.companyAvg }}</div>
                <div class="hr-stat-label">公司平均薪资(K)</div>
              </div>
              <div v-if="salaryStats.avgAll" class="hr-stat-card">
                <div class="hr-stat-num">{{ salaryStats.avgAll }}</div>
                <div class="hr-stat-label">同岗位平均薪资(K)</div>
              </div>
            </div>

            <!-- 招聘方联系方式 -->
            <div v-if="detailJob.company || detailJob.dataSource" class="hr-section hr-contact-section">
              <div class="hr-sec-title">📞 招聘方联系方式</div>
              <div class="hr-contact-card">
                <div v-if="detailJob.company && detailJob.company !== '未知公司'" class="hr-contact-row">
                  <span class="hr-contact-icon">🏢</span>
                  <span class="hr-contact-label">招聘公司</span>
                  <span class="hr-contact-value">{{ detailJob.company }}</span>
                </div>
                <div v-if="detailJob.dataSource && detailJob.dataSource !== '网络'" class="hr-contact-row">
                  <span class="hr-contact-icon">🌐</span>
                  <span class="hr-contact-label">招聘平台</span>
                  <a :href="getPlatformLink(detailJob.dataSource, detailJob.company)"
                     target="_blank" rel="noopener noreferrer"
                     class="hr-contact-link">
                    {{ normalizePlatform(detailJob.dataSource) }}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
                <div class="hr-contact-hint">
                  💡 点击上方平台链接，可直接前往对应招聘网站查看该公司的联系电话、邮箱等完整信息
                </div>
              </div>
            </div>

            <!-- 行业薪资分位 -->
            <div class="hr-section">
              <div class="hr-sec-title">全行业薪资分位（共 {{ companyStats.totalAll.toLocaleString() }} 条岗位）</div>
              <div class="hr-percentile-bar">
                <div class="hr-perc-track">
                  <div class="hr-perc-fill" style="left: 0%; width: 100%"></div>
                  <div class="hr-perc-p25" :style="{ left: Math.min(100, (companyStats.p25 / 60) * 100) + '%' }">
                    <div class="hr-perc-marker"></div>
                    <div class="hr-perc-label">25%<br/>{{ companyStats.p25 }}K</div>
                  </div>
                  <div class="hr-perc-med" :style="{ left: Math.min(100, (companyStats.median / 60) * 100) + '%' }">
                    <div class="hr-perc-marker"></div>
                    <div class="hr-perc-label">中位<br/>{{ companyStats.median }}K</div>
                  </div>
                  <div class="hr-perc-p75" :style="{ left: Math.min(100, (companyStats.p75 / 60) * 100) + '%' }">
                    <div class="hr-perc-marker"></div>
                    <div class="hr-perc-label">75%<br/>{{ companyStats.p75 }}K</div>
                  </div>
                  <div class="hr-perc-job" v-if="detailJob.salary_avg" :style="{ left: Math.min(100, (detailJob.salary_avg / 60) * 100) + '%' }">
                    <div class="hr-perc-job-marker"></div>
                    <div class="hr-perc-job-label">当前岗位 {{ detailJob.salary_avg }}K</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 同岗位城市分布 -->
            <div class="hr-section">
              <div class="hr-sec-title">同岗位名 · 城市分布 TOP{{ salaryStats.cityBars.length }}</div>
              <div class="hr-city-bars">
                <div v-for="c in salaryStats.cityBars" :key="c.city" class="hr-city-row">
                  <div class="hr-city-name">{{ c.city }}</div>
                  <div class="hr-city-bar-bg">
                    <div class="hr-city-bar-fill" :style="{ width: c.pct + '%' }"></div>
                  </div>
                  <div class="hr-city-count">{{ c.count }} 个</div>
                </div>
              </div>
            </div>

            <!-- 学历分布 -->
            <div class="hr-section">
              <div class="hr-sec-title">全行业 · 学历分布 TOP{{ companyStats.eduDist.length }}</div>
              <div class="hr-edu-list">
                <div v-for="e in companyStats.eduDist" :key="e.edu" class="hr-edu-row">
                  <div class="hr-edu-name">{{ e.edu }}</div>
                  <div class="hr-edu-bar-bg">
                    <div class="hr-edu-bar-fill" :style="{ width: e.pct + '%' }"></div>
                  </div>
                  <div class="hr-edu-count">{{ e.count.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 薪资分析弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showSalaryAnalyze" class="detail-overlay" @click.self="showSalaryAnalyze = false">
        <div class="detail-modal salary-modal">
          <button class="detail-close" @click="showSalaryAnalyze = false">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="hr-modal-header">
            <div class="hr-avatar" style="background: linear-gradient(135deg, rgba(74,158,255,0.25), rgba(124,58,237,0.15));">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" style="color:#7dd3fc">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div class="hr-info">
              <h3 class="hr-name">薪资分布分析</h3>
              <p class="hr-job">{{ detailJob?.title }} · 基于 {{ salaryStats.totalSameTitle }} 条同岗位真实数据</p>
            </div>
          </div>

          <div class="salary-modal-body" v-if="detailJob">
            <!-- 柱状图 SVG -->
            <div class="salary-chart-wrap">
              <svg :viewBox="`0 0 560 220`" class="salary-chart" preserveAspectRatio="none">
                <!-- Y 轴网格线 -->
                <line x1="50" y1="20" x2="50" y2="180" stroke="rgba(210,225,255,0.15)" stroke-width="1"/>
                <line x1="50" y1="180" x2="545" y2="180" stroke="rgba(210,225,255,0.25)" stroke-width="1"/>
                <!-- Y 轴刻度 -->
                <text x="44" y="24" fill="rgba(210,225,255,0.5)" font-size="9" text-anchor="end" dominant-baseline="middle">100%</text>
                <text x="44" y="70" fill="rgba(210,225,255,0.5)" font-size="9" text-anchor="end" dominant-baseline="middle">75%</text>
                <text x="44" y="115" fill="rgba(210,225,255,0.5)" font-size="9" text-anchor="end" dominant-baseline="middle">50%</text>
                <text x="44" y="160" fill="rgba(210,225,255,0.5)" font-size="9" text-anchor="end" dominant-baseline="middle">25%</text>
                <!-- 当前岗位薪资标记 -->
                <line
                  v-if="detailJob.salary_avg"
                  :x1="46 + salaryBarIndex * 72 + 4"
                  y1="15"
                  :x2="46 + salaryBarIndex * 72 + 4"
                  y2="185"
                  stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,3"
                />
                <text
                  v-if="detailJob.salary_avg"
                  :x="46 + salaryBarIndex * 72 + 4"
                  y="12"
                  fill="#fbbf24" font-size="9" text-anchor="middle" font-weight="600"
                >{{ detailJob.salary_avg }}K 你的岗位</text>

                <!-- 柱状图 -->
                <g v-for="(b, i) in salaryStats.buckets" :key="b.label">
                  <rect
                    :x="46 + i * 72"
                    :y="180 - b.pct * 1.6"
                    width="40"
                    :height="Math.max(0, b.pct * 1.6)"
                    rx="3"
                    :fill="b.pct > 0 ? (b.label.includes('20-30') || b.label.includes('30-50') ? 'rgba(124,58,237,0.85)' : 'rgba(74,158,255,0.75)') : 'rgba(100,110,140,0.3)'"
                  />
                  <text
                    :x="46 + i * 72 + 20"
                    :y="178 - b.pct * 1.6"
                    fill="rgba(210,225,255,0.7)" font-size="9"
                    text-anchor="middle" dominant-baseline="auto"
                    v-if="b.pct > 0"
                  >{{ b.pct }}%</text>
                  <text
                    :x="46 + i * 72 + 20"
                    y="196"
                    fill="rgba(210,225,255,0.55)" font-size="9"
                    text-anchor="middle"
                  >{{ b.label }}</text>
                  <text
                    :x="46 + i * 72 + 20"
                    y="210"
                    fill="rgba(210,225,255,0.4)" font-size="8"
                    text-anchor="middle"
                  >{{ b.count }} 个</text>
                </g>
              </svg>
            </div>

            <!-- 对比指标 -->
            <div v-if="detailJob?.salary_avg || salaryStats.avgAll || salaryStats.avgSameCity" class="salary-compare">
              <div v-if="detailJob?.salary_avg" class="salary-cmp-item">
                <div class="salary-cmp-val">{{ detailJob.salary_avg }}<span>K</span></div>
                <div class="salary-cmp-label">当前岗位薪资</div>
              </div>
              <div v-if="(detailJob?.salary_avg && salaryStats.avgAll) || (salaryStats.avgAll && salaryStats.avgSameCity)" class="salary-cmp-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(210,225,255,0.4)" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <div v-if="salaryStats.avgAll" class="salary-cmp-item">
                <div class="salary-cmp-val">{{ salaryStats.avgAll }}<span>K</span></div>
                <div class="salary-cmp-label">同岗位平均</div>
              </div>
              <div v-if="detailJob?.salary_avg && salaryStats.avgSameCity" class="salary-cmp-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(210,225,255,0.4)" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <div v-if="salaryStats.avgSameCity" class="salary-cmp-item">
                <div class="salary-cmp-val">{{ salaryStats.avgSameCity }}<span>K</span></div>
                <div class="salary-cmp-label">同城市同岗位平均</div>
              </div>
            </div>

            <!-- 城市分布条形 -->
            <div v-if="salaryStats.cityBars.length" class="salary-city-dist">
              <div class="hr-sec-title">同岗位在各城市的分布</div>
              <div class="hr-city-bars">
                <div v-for="c in salaryStats.cityBars" :key="c.city" class="hr-city-row">
                  <div class="hr-city-name">{{ c.city }}</div>
                  <div class="hr-city-bar-bg">
                    <div class="hr-city-bar-fill" :style="{ width: c.pct + '%' }"></div>
                  </div>
                  <div class="hr-city-count">{{ c.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== AI简历优化弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showResumeOpt" class="detail-overlay" @click.self="showResumeOpt = false">
        <div class="detail-modal ai-resume-modal">
          <button class="detail-close" @click="showResumeOpt = false">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="detail-title-row">
            <h2 class="detail-job-title">AI简历优化</h2>
            <div class="detail-job-tags">
              <span class="detail-tag" v-if="detailJob">{{ detailJob.job_name }}</span>
              <span class="detail-tag" v-if="resumeOptData.sameTitleCount">同方向 {{ resumeOptData.sameTitleCount }} 条岗位</span>
            </div>
          </div>

          <!-- 未写简历提示 -->
          <div v-if="!resumeOptData.hasResume" class="ai-empty-prompt">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>请先去写一份简历<br/>写好后，AI 会帮你对比同方向岗位的高频技能要求，告诉你简历里缺了什么</p>
          </div>

          <template v-else>
            <!-- 匹配度概览 -->
            <div class="ai-summary-row">
              <div class="ai-summary-card">
                <div class="ai-num">{{ resumeOptData.matched.length }}</div>
                <div class="ai-label">简历已覆盖</div>
              </div>
              <div class="ai-summary-card warn">
                <div class="ai-num">{{ resumeOptData.missing.length }}</div>
                <div class="ai-label">高频技能缺失</div>
              </div>
              <div class="ai-summary-card">
                <div class="ai-num">{{ resumeOptData.resumeSkills.length }}</div>
                <div class="ai-label">简历技能总数</div>
              </div>
            </div>

            <!-- 同岗位高频但简历缺失 → 需要补充 -->
            <div v-if="resumeOptData.missing.length" class="ai-section">
              <h4 class="ai-sec-title">
                <span class="ai-dot warn"></span>
                建议补充到简历里（{{ resumeOptData.missing.length }} 项）
              </h4>
              <div class="ai-skill-list">
                <div v-for="item in resumeOptData.missing" :key="item.tag" class="ai-skill-item missing">
                  <div class="ai-skill-main">
                    <span class="ai-skill-name">{{ item.tag }}</span>
                    <button class="ai-add-btn" @click="addSkillToResume(item.tag)">＋ 添加到简历</button>
                  </div>
                  <div class="ai-skill-bar-bg">
                    <div class="ai-skill-bar-fill missing" :style="{ width: item.pct + '%' }"></div>
                  </div>
                  <span class="ai-skill-pct">同岗 {{ item.pct }}% 要求</span>
                </div>
              </div>
            </div>

            <!-- 简历已覆盖 -->
            <div v-if="resumeOptData.matched.length" class="ai-section">
              <h4 class="ai-sec-title">
                <span class="ai-dot ok"></span>
                简历已覆盖的高频技能（{{ resumeOptData.matched.length }} 项）
              </h4>
              <div class="ai-skill-list">
                <div v-for="item in resumeOptData.matched" :key="item.tag" class="ai-skill-item ok">
                  <span class="ai-skill-name">{{ item.tag }}</span>
                  <div class="ai-skill-bar-bg">
                    <div class="ai-skill-bar-fill ok" :style="{ width: item.pct + '%' }"></div>
                  </div>
                  <span class="ai-skill-pct">{{ item.pct }}%</span>
                </div>
              </div>
            </div>

            <div v-if="!resumeOptData.missing.length && !resumeOptData.matched.length" class="ai-empty-prompt">
              <p>该方向的岗位数据太少，暂无统计参考</p>
            </div>

            <!-- 闭环引导 -->
            <div class="ai-cta-row">
              <span class="ai-cta-label">闭环流程：</span>
              <button class="ai-cta-btn primary" @click="goToResumePage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                去 AI 简历制作
              </button>
              <button class="ai-cta-btn" @click="addAllMissingToResume" :disabled="!resumeOptData.missing.length">
                一键添加全部 ({{ resumeOptData.missing.length }})
              </button>
              <button class="ai-cta-btn outline" @click="openAIIntviewFor(detailJob)">
                去 AI 智能面试
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- ===== AI求职路线弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showCareerRoute" class="detail-overlay" @click.self="showCareerRoute = false">
        <div class="detail-modal ai-route-modal">
          <button class="detail-close" @click="showCareerRoute = false">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="detail-title-row">
            <h2 class="detail-job-title">AI求职路线</h2>
            <div class="detail-job-tags">
              <span class="detail-tag" v-if="detailJob">{{ detailJob.job_name }}</span>
              <span class="detail-tag" v-if="careerRouteData.sameTitleCount">同方向 {{ careerRouteData.sameTitleCount }} 条岗位</span>
            </div>
          </div>

          <!-- 用户定位卡 -->
          <div v-if="careerRouteData.userStage" class="route-user-loc">
            <div class="loc-avatar">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>
              </svg>
            </div>
            <div class="loc-info">
              <div class="loc-title">你的大概位置</div>
              <div class="loc-stage">
                {{ careerRouteData.userStage.label }}
                <span class="loc-desc">{{ careerRouteData.userStage.desc }}</span>
              </div>
              <div class="loc-hint">基于你的简历匹配度 + 技能数量估算</div>
            </div>
            <div class="loc-arrow">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>

          <!-- 同岗位真实路线 -->
          <div v-if="careerRouteData.levels.length >= 2" class="route-section">
            <h4 class="ai-sec-title">
              <span class="ai-dot ok"></span>
              该方向真实职业进阶
            </h4>
            <div class="route-chain">
              <div v-for="(lv, i) in careerRouteData.levels" :key="lv.key"
                   class="route-node"
                   :class="{ 'route-node-current': careerRouteData.userStage && careerRouteData.userStage.index === lv.index }">
                <div class="route-node-circle" :style="{ background: lv.color }">
                  {{ i + 1 }}
                  <span v-if="careerRouteData.userStage && careerRouteData.userStage.index === lv.index" class="route-node-me">我</span>
                </div>
                <div class="route-node-info">
                  <div class="route-node-label">{{ lv.label }}</div>
                  <div class="route-node-desc">{{ lv.desc }}</div>
                  <div class="route-node-salary">
                    <span v-if="lv.avgSalary">{{ lv.avgSalary }}K</span>
                    <span v-else class="route-na">暂无薪资</span>
                  </div>
                  <div class="route-node-count">{{ lv.count }} 条岗位</div>
                  <!-- 关键技能 -->
                  <div v-if="lv.keySkills && lv.keySkills.length" class="route-node-skills">
                    <span class="route-skills-label">关键技能：</span>
                    <span v-for="sk in lv.keySkills.slice(0, 4)" :key="sk" class="route-skill-tag">{{ sk }}</span>
                  </div>
                </div>
                <div v-if="i < careerRouteData.levels.length - 1" class="route-node-arrow">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- fallback：全行业参考 -->
          <div v-if="careerRouteData.allIndustryLevels.length >= 2" class="route-section">
            <h4 class="ai-sec-title">
              <span class="ai-dot warn"></span>
              同方向数据较少 · 全行业参考
            </h4>
            <div class="route-chain">
              <div v-for="(lv, i) in careerRouteData.allIndustryLevels" :key="'ai-'+lv.key" class="route-node fallback">
                <div class="route-node-circle" :style="{ background: lv.color }">{{ i + 1 }}</div>
                <div class="route-node-info">
                  <div class="route-node-label">{{ lv.label }}</div>
                  <div class="route-node-desc">{{ lv.desc }}</div>
                  <div class="route-node-salary">
                    <span v-if="lv.avgSalary">{{ lv.avgSalary }}K</span>
                    <span v-else class="route-na">暂无</span>
                  </div>
                  <div class="route-node-count">{{ lv.count }} 条岗位</div>
                  <div v-if="lv.keySkills && lv.keySkills.length" class="route-node-skills">
                    <span v-for="sk in lv.keySkills.slice(0, 3)" :key="'f-'+sk" class="route-skill-tag">{{ sk }}</span>
                  </div>
                </div>
                <div v-if="i < careerRouteData.allIndustryLevels.length - 1" class="route-node-arrow">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div v-if="careerRouteData.levels.length < 2 && careerRouteData.allIndustryLevels.length < 2" class="ai-empty-prompt">
            <p>该方向岗位数据太少，暂无路线参考</p>
          </div>

          <!-- 闭环 CTA -->
          <div v-if="careerRouteData.levels.length >= 2 || careerRouteData.allIndustryLevels.length >= 2" class="ai-cta-row">
            <span class="ai-cta-label">深入学习：</span>
            <button class="ai-cta-btn primary" @click="goToSkillRoute">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              去技能路线页深入学习 →
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 我的收藏弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showMyFavorites" class="detail-overlay" @click.self="closeMyFavorites">
        <div class="detail-modal my-fav-modal">
          <button class="detail-close" @click="closeMyFavorites">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="detail-title-row">
            <h2 class="detail-job-title">我的收藏</h2>
            <div class="detail-job-tags">
              <span class="detail-tag">共 {{ favoriteJobs.length }} 个岗位</span>
            </div>
          </div>

          <div v-if="favoriteJobs.length === 0" class="fav-empty">
            <div class="fav-empty-icon">💼</div>
            <div class="fav-empty-text">还没有收藏任何岗位</div>
            <div class="fav-empty-hint">在岗位卡片或详情页点击「收藏」按钮即可添加</div>
          </div>

          <div v-else class="fav-list">
            <div v-for="job in favoriteJobs" :key="job.title" class="fav-item">
              <div class="fav-item-main" @click="closeMyFavorites(); openDetail(job)">
                <div class="fav-item-title">{{ job.title }}</div>
                <div class="fav-item-sub">
                  {{ job.company }} · {{ job.city }} · {{ job.salary }}
                </div>
                <div class="fav-item-meta">
                  <span class="fav-time">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    收藏于 {{ formatAddedAt(job.addedAt) }}
                  </span>
                </div>
                <div class="fav-item-tags">
                  <span v-for="t in (job.tags || []).slice(0, 4)" :key="t" class="detail-tag">{{ t }}</span>
                </div>
              </div>
              <div class="fav-item-actions">
                <button class="fav-remove" @click="toggleFavorite(job)">取消收藏</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- AI驱动 说明弹窗 -->
    <Teleport to="body">
      <div v-if="showAIPoweredInfo" class="ai-info-overlay" @click.self="showAIPoweredInfo = false">
        <div class="ai-info-modal">
          <button class="ai-info-close" @click="showAIPoweredInfo = false">×</button>
          <div class="ai-info-header">
            <div class="ai-info-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div>
              <h3 class="ai-info-title">AI 驱动的推荐引擎</h3>
              <p class="ai-info-sub">基于真实岗位数据 · 多维度智能匹配</p>
            </div>
          </div>

          <div class="ai-info-body">
            <div class="ai-info-section">
              <h4 class="ai-sec-title">推荐算法原理</h4>
              <p class="ai-sec-desc">系统从你填写的简历中提取关键信号，与岗位真实数据做多维度匹配，计算综合匹配度。</p>
              <div class="ai-dim-grid">
                <div class="ai-dim-card">
                  <div class="ai-dim-num">01</div>
                  <div class="ai-dim-name">技能匹配</div>
                  <div class="ai-dim-desc">简历技能标签与岗位技术栈的交集对比</div>
                  <div class="ai-dim-weight">权重 40%</div>
                </div>
                <div class="ai-dim-card">
                  <div class="ai-dim-num">02</div>
                  <div class="ai-dim-name">学历匹配</div>
                  <div class="ai-dim-desc">简历学历与岗位学历要求的等级对比</div>
                  <div class="ai-dim-weight">权重 25%</div>
                </div>
                <div class="ai-dim-card">
                  <div class="ai-dim-num">03</div>
                  <div class="ai-dim-name">求职意向</div>
                  <div class="ai-dim-desc">意向岗位关键词与岗位名称的语义匹配</div>
                  <div class="ai-dim-weight">权重 20%</div>
                </div>
                <div class="ai-dim-card">
                  <div class="ai-dim-num">04</div>
                  <div class="ai-dim-name">城市偏好</div>
                  <div class="ai-dim-desc">简历预期城市与岗位所在城市的一致性</div>
                  <div class="ai-dim-weight">权重 15%</div>
                </div>
              </div>
            </div>

            <div class="ai-info-section">
              <h4 class="ai-sec-title">数据来源</h4>
              <div class="ai-source-list">
                <div class="ai-source-item">
                  <span class="ai-source-dot"></span>
                  <span class="ai-source-text">岗位数据来自 BOSS 直聘、前程无忧、拉勾网等主流招聘平台的公开信息</span>
                </div>
                <div class="ai-source-item">
                  <span class="ai-source-dot"></span>
                  <span class="ai-source-text">所有数据定期更新，确保岗位信息真实有效</span>
                </div>
                <div class="ai-source-item">
                  <span class="ai-source-dot"></span>
                  <span class="ai-source-text">匹配分析完全基于你填写的真实简历数据，不使用任何模拟或编造数据</span>
                </div>
              </div>
            </div>

            <div class="ai-info-tip" v-if="!hasResume">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>你还未填写简历，当前看到的岗位推荐未加入个人匹配维度。</span>
              <button class="ai-info-tip-btn" @click="$router.push('/ai-resume'); showAIPoweredInfo = false">立即填写 →</button>
            </div>
            <div class="ai-info-tip ok" v-else>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
              <span>已检测到你的简历数据，岗位推荐已结合个人匹配维度进行智能排序。</span>
            </div>
          </div>

          <button class="ai-info-footer-btn" @click="showAIPoweredInfo = false">开始探索岗位 →</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuthInfo } from '../utils/auth'

const router = useRouter()

// ===== 简历数据检测（用于真实匹配度计算） =====
function getResumeStorageKey () {
  const auth = getAuthInfo()
  if (auth && auth.userId) return `resumeData_${auth.userId}`
  return 'resumeData_guest'
}
function loadResumeData () {
  try {
    const raw = localStorage.getItem(getResumeStorageKey())
    if (!raw) return null
    const data = JSON.parse(raw)
    // 至少需要提供以下之一才算有简历数据
    if (data.name && data.intention) return data
    if (data.education && data.school) return data
    if (data.company && data.position) return data
    if (data.skills && data.skills.length > 0) return data
    if (data.projects && data.projects.some(p => p.name)) return data
    return null
  } catch { return null }
}
const resumeData = ref(loadResumeData())
const hasResume = computed(() => !!resumeData.value)

// 简历闭环：一键把缺失技能补到简历里
function addSkillToResume (skillName) {
  const key = getResumeStorageKey()
  let data = resumeData.value
  if (!data) {
    // 初始化一份空简历
    data = { name: '', skills: [], education: '', projects: [], updatedAt: Date.now() }
  }
  if (!Array.isArray(data.skills)) data.skills = []
  // 去重（toLowerCase 对比）
  const lower = String(skillName).toLowerCase()
  const exists = data.skills.some(s => {
    const t = typeof s === 'object' ? (s.name || s.skill || '') : (s || '')
    return String(t).toLowerCase() === lower
  })
  if (exists) return false
  data.skills.push(skillName)
  data.updatedAt = Date.now()
  localStorage.setItem(key, JSON.stringify(data))
  resumeData.value = { ...data } // 触发响应式
  return true
}

function addAllMissingToResume () {
  const missing = resumeOptData.value?.missing || []
  missing.forEach(item => addSkillToResume(item.tag))
}

function openAIIntviewFor (job) {
  if (job && job.job_name) {
    router.push({ path: '/ai-interview', query: { job: encodeURIComponent(job.job_name) } })
  } else {
    router.push('/ai-interview')
  }
}

// ===== 闭环跳转：AI简历优化 → 跳去 AI 简历制作页 =====
function goToResumePage () {
  const job = detailJob.value
  if (!job) return
  const opt = resumeOptData.value
  const skills = [
    ...(opt?.missing || []).map(i => i.tag),
    ...(opt?.matched || []).map(i => i.tag)
  ]
  // 把当前岗位写入 targetJobForResume，AIResume.vue 打开后会显示为"岗位目标"
  const targetJobData = {
    job_name: job.job_name || job.title || '',
    city: job.city || '',
    education: job.education || '',
    work_exp: job.work_exp || '',
    salary_avg: job.salary_avg || 0,
    company: job.company || '',
    skills: skills
  }
  localStorage.setItem('targetJobForResume', JSON.stringify(targetJobData))
  showResumeOpt.value = false
  // 给个提示让用户知道要点保存，回跳后自动刷新
  showToast('已为你带入岗位目标，快去完善简历吧~', 'info')
  router.push('/ai-resume')
}

// ===== 闭环跳转：AI求职路线 → 跳去 SkillRoute 深入学习 =====
const TITLE_TO_POSITION_KEY = [
  [/(前端|Web前端|H5|Vue|React)/i, 'frontend'],
  [/(Vue)/i, 'vue-developer'],
  [/(React)/i, 'react-developer'],
  [/(Java|后端)/i, 'backend-java'],
  [/(Python|后端)/i, 'backend-python'],
  [/(Go|Golang)/i, 'backend-go'],
  [/(Node)/i, 'backend-node'],
  [/(PHP)/i, 'php-developer'],
  [/(Ruby)/i, 'ruby-developer'],
  [/(全栈|Full.?Stack)/i, 'fullstack'],
  [/(算法)/i, 'algorithm'],
  [/(机器学习|ML)/i, 'ml-engineer'],
  [/(人工智能|AI|大模型)/i, 'ai-engineer'],
  [/(NLP|自然语言)/i, 'nlp-engineer'],
  [/(CV|计算机视觉|视觉)/i, 'cv-engineer'],
  [/(推荐)/i, '推荐算法'],
  [/(大数据|Hadoop|Spark|Flink)/i, 'bigdata'],
  [/(数据工程师|ETL)/i, 'data-engineer'],
  [/(数据分析师|数据分析)/i, 'data-analyst'],
  [/(集成电路|IC)/i, 'ic-engineer'],
  [/(嵌入式)/i, 'embedded'],
  [/(硬件)/i, 'hardware'],
  [/(Android)/i, 'android'],
  [/(iOS|苹果)/i, 'ios-developer'],
  [/(Flutter)/i, 'flutter'],
  [/(React Native|RN)/i, 'rn-developer'],
  [/(DevOps)/i, 'devops'],
  [/(SRE)/i, 'sre'],
  [/(云计算|云)/i, 'cloud'],
  [/(Kubernetes|K8s)/i, 'k8s-engineer'],
  [/(安全|网络安全)/i, 'security'],
  [/(渗透)/i, 'penetration'],
  [/(网络工程师)/i, 'network'],
  [/(测试)/i, 'qa-engineer'],
  [/(自动化测试)/i, 'autotest'],
  [/(性能测试)/i, 'perf-test'],
  [/(游戏)/i, 'game-dev'],
  [/(区块链|Blockchain)/i, 'blockchain'],
  [/(机器人)/i, 'robotics'],
  [/(数据库)/i, 'database'],
  [/(DBA)/i, 'dba'],
  [/(架构师|架构)/i, 'architect'],
  [/(技术负责人|TL|Tech Lead)/i, 'tech-lead'],
  [/(FPGA)/i, 'fpga-engineer'],
]
function titleToPositionKey (title) {
  const t = String(title || '')
  for (const [re, key] of TITLE_TO_POSITION_KEY) {
    if (re.test(t)) return key
  }
  return ''
}
function goToSkillRoute () {
  const job = detailJob.value
  const key = titleToPositionKey(job?.job_name)
  if (key) {
    localStorage.setItem('selectedPosition', key)
    showCareerRoute.value = false
    showToast('已为你定位到对应技能路线~', 'info')
    router.push('/skill-route')
  } else {
    showToast('未匹配到预设岗位，请在技能路线页手动选择', 'info')
    showCareerRoute.value = false
    router.push('/skill-route')
  }
}

// AI驱动 说明弹窗
const showAIPoweredInfo = ref(false)

// 岗位总结弹窗（原 联系HR）
const showHRContact = ref(false)

// 薪资分析弹窗
const showSalaryAnalyze = ref(false)

// AI简历优化 & AI求职路线
const showResumeOpt = ref(false)
const showCareerRoute = ref(false)

// 根据当前详情岗位计算真实聚合统计（用于两个弹窗）
const salaryStats = computed(() => {
  if (!detailJob.value) return { buckets: [], cityBars: [], avgAll: 0, avgSameCity: 0, totalSameTitle: 0 }
  return computeJobSalaryStats(detailJob.value)
})
const companyStats = computed(() => {
  if (!detailJob.value) return { companyCount: 0, companyAvg: 0, totalAll: 0, median: 0, p25: 0, p75: 0, eduDist: [] }
  return computeCompanyStats(detailJob.value)
})
// 薪资桶索引（用于在 SVG 里定位当前岗位的虚线标记）
const salaryBarIndex = computed(() => {
  const s = detailJob.value?.salary_avg
  if (!s) return 0
  const buckets = salaryStats.value.buckets
  const idx = buckets.findIndex(b => s >= b.min && s < b.max)
  return idx >= 0 ? idx : 0
})

// AI简历优化 & AI求职路线 计算属性（实时响应 detailJob）
const resumeOptData = computed(() => {
  if (!detailJob.value) return { hasResume: false, matched: [], missing: [], resumeSkills: [] }
  return computeResumeOptimization(detailJob.value)
})
const careerRouteData = computed(() => {
  if (!detailJob.value) return { levels: [], allIndustryLevels: [] }
  return computeCareerRoute(detailJob.value)
})

// 根据 dataSource 跳转到对应招聘平台搜索页（已停用，保留但不再调用）
const jumpToJobPlatform = (job) => {}

// ===== 详情弹窗状态 =====
const detailJob = ref(null)

// 招聘信息是否有任何有效字段（用于决定是否显示整个 section）
const hasAnyRecruitInfo = computed(() => {
  if (!detailJob.value) return false
  const j = detailJob.value
  return [
    j.company && j.company !== '未知公司',
    j.city && j.city !== '不限',
    j.salary && !j.salary.includes('0K'),
    j.education && j.education !== '不限' && !j.education.includes('不限'),
    j.work_exp && j.work_exp !== '不限' && !j.work_exp.includes('不限'),
    j.dataSource && j.dataSource !== '网络'
  ].some(Boolean)
})

const CITY_LEVEL_MAP = {
  '北京': '超一线城市', '上海': '超一线城市', '广州': '一线城市', '深圳': '一线城市',
  '杭州': '新一线城市', '成都': '新一线城市', '南京': '新一线城市', '武汉': '新一线城市',
  '西安': '新一线城市', '重庆': '新一线城市', '天津': '新一线城市', '苏州': '新一线城市',
  '长沙': '新一线城市', '郑州': '新一线城市', '青岛': '新一线城市', '沈阳': '新一线城市',
  '宁波': '新一线城市', '东莞': '新一线城市', '无锡': '新一线城市', '福州': '二线城市'
}

const SALARY_LEVEL_MAP = [
  { min: 40, level: '极高', desc: '薪资处于顶尖水平，行业稀缺岗位' },
  { min: 30, level: '很高', desc: '薪资远超行业平均，极具竞争力' },
  { min: 20, level: '较高', desc: '薪资处于中上水平，具有较好的竞争力' },
  { min: 10, level: '中等', desc: '薪资处于行业平均水平，稳定可靠' },
  { min: 0,  level: '一般', desc: '薪资相对一般，适合入门积累经验' }
]

const HIGHLIGHT_POOL = ['五险一金', '弹性工作', '免费食堂', '带薪年假', '定期体检', '加班补助', '季度奖金', '股票期权', '免费班车', '技术培训', '节日福利', '年终奖', '六险一金', '零食下午茶', '健身房', '年度旅游']
const COMPANY_TYPE_POOL = ['互联网/IT', '制造业', '教育/培训', '金融/投资', '医疗/健康', '房地产/建筑', '物流/贸易', '政府/事业单位', '科研机构']
const COMPANY_SIZE_POOL = ['100-499人', '500-999人', '1000-5000人', '50-99人', '20-49人', '20人以下', '5000-10000人']

function pickWeighted (pool, seed, count = 4) {
  // 用简单 hash 做确定性随机，同一 job 每次详情一致
  const h = String(seed).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const res = []
  for (let i = 0; i < count && pool.length; i++) {
    const idx = (h + i * 37) % pool.length
    if (!res.includes(pool[idx])) res.push(pool[idx])
  }
  return res
}

function generateAnalysis (job) {
  const salary = job.salary_avg || 10
  const salaryInfo = SALARY_LEVEL_MAP.find(s => salary >= s.min) || SALARY_LEVEL_MAP[SALARY_LEVEL_MAP.length - 1]
  const cityLevel = CITY_LEVEL_MAP[job.city] || '普通城市'

  const edu = job.education || '不限'
  const exp = job.work_exp || '不限'
  const eduTipMap = { '不限': '学历要求宽松，门槛较低', '大专': '大专学历即可，门槛适中', '本科': '本科为行业主流门槛', '硕士': '硕士学历，竞争门槛较高', '博士': '博士学历，科研导向' }
  const expTipMap = { '不限': '经验要求宽松，应届生可投', '1年以下': '应届生友好，提供成长空间', '1-3年': '需要一定基础，适合初入职场', '3-5年': '要求经验积累，适合稳步发展', '5-10年': '需要资深经验，适合技术骨干', '10年以上': '专家级要求，适合行业大咖' }

  return {
    skills: job.tags.join('、'),
    city: job.city,
    cityLevel,
    eduTip: eduTipMap[edu] || '符合行业要求',
    expTip: expTipMap[exp] || '经验要求合理',
    salaryLevel: salaryInfo.level,
    salaryDesc: salaryInfo.desc,
    suggestion: `建议重点准备${job.tags.slice(0, 2).join('/')}相关项目经验，突出${job.city}地区的薪资优势，匹配度有机会提升10%-15%。`
  }
}

// ===== 招聘平台映射 =====
// 原始爬取数据 data_source 字段 → 规范化的平台名 + 跳转链接
function normalizePlatform (source) {
  const s = String(source || '').trim()
  if (!s || s === 'nan' || s === '网络') return s || '—'
  if (s.includes('猎聘')) return '猎聘'
  if (s.includes('前程无忧') || s.includes('51job')) return '前程无忧'
  if (s.includes('BOSS') || s.includes('boss')) return 'BOSS直聘'
  if (s.includes('智联')) return '智联招聘'
  if (s.includes('拉勾')) return '拉勾网'
  if (s.includes('牛客')) return '牛客网'
  if (s.includes('实习')) return '实习僧'
  // 内部爬取文件命名（全国计算机岗位数据 / final_all_3_files / data(1) 等）→ 统一显示为"公开招聘数据"
  if (s.includes('数据') || s.includes('final') || s.startsWith('data')) return '公开招聘数据'
  return s
}

function getPlatformLink (source, company) {
  const platform = normalizePlatform(source)
  const kw = encodeURIComponent((company || '').trim())
  switch (platform) {
    case '猎聘':
      return kw ? `https://www.liepin.com/zhaopin/?compkey=${kw}` : 'https://www.liepin.com/'
    case '前程无忧':
      return kw ? `https://search.51job.com/list/000000,000000,0000,00,9,99,${kw},2,1.html` : 'https://www.51job.com/'
    case '智联招聘':
      return kw ? `https://sou.zhaopin.com/?jl=0&kw=${kw}` : 'https://www.zhaopin.com/'
    case 'BOSS直聘':
      return kw ? `https://www.zhipin.com/web/geek/job?query=${kw}` : 'https://www.zhipin.com/'
    case '拉勾网':
      return kw ? `https://www.lagou.com/jobs/list_${kw}?labelWords=&fromSearch=true&suginput=` : 'https://www.lagou.com/'
    case '牛客网':
      return kw ? `https://www.nowcoder.com/job/search?search=${kw}` : 'https://www.nowcoder.com/'
    case '实习僧':
      return kw ? `https://www.shixiseng.com/interns?keyword=${kw}` : 'https://www.shixiseng.com/'
    default:
      return 'https://www.baidu.com/s?wd=' + kw
  }
}

// ===== 弹窗辅助函数 =====
function computeMetric (type) {
  if (!detailJob.value) return '--'
  const j = detailJob.value
  if (type === 'heat') {
    const base = (j.salary_avg || 8) * 6
    const tagBonus = (j.tags || []).length * 8
    const cityBonus = ['深圳', '北京', '上海', '杭州'].includes(j.city) ? 15 : 0
    return Math.min(99, Math.round(base + tagBonus + cityBonus))
  }
  if (type === 'competition') {
    const eduMap = { '不限': 40, '大专': 55, '本科': 70, '硕士': 85, '博士': 60 }
    return eduMap[j.education] || 50
  }
  return '--'
}

// ===== 真实匹配度计算（基于简历数据） =====
function computeRealMatch (job) {
  if (!hasResume.value) return { score: null, lines: [] }
  const r = resumeData.value
  const lines = []
  let totalScore = 0
  let totalWeight = 0

  // 1. 技能匹配（权重 40）
  let skillOk = false
  if (r.skills && r.skills.length && job.tags && job.tags.length) {
    const resumeSkills = r.skills.map(s => (s.name || s.skill || s || '').toString().toLowerCase())
      .filter(Boolean)
    const jobTags = job.tags.map(t => (t || '').toString().toLowerCase())
    const matchCount = resumeSkills.filter(s => jobTags.some(t => t.includes(s) || s.includes(t))).length
    const ratio = jobTags.length > 0 ? Math.min(1, matchCount / Math.max(3, jobTags.length)) : 0
    const skillScore = Math.round(ratio * 40)
    totalScore += skillScore
    totalWeight += 40
    skillOk = ratio >= 0.5
    lines.push({
      label: '技能匹配',
      ok: skillOk,
      text: matchCount > 0
        ? `${matchCount}/${jobTags.length} 项技能符合`
        : '技能标签不足，建议补充项目经验'
    })
  } else {
    lines.push({ label: '技能匹配', ok: false, text: '缺少技能数据，无法评估' })
  }

  // 2. 学历匹配（权重 25）
  const eduMap = { '不限': 100, '大专': 60, '本科': 75, '硕士': 90, '博士': 95 }
  let eduOk = false
  if (r.education) {
    const resumeEdu = (r.education || '').toString()
    const jobEdu = job.education || '不限'
    if (jobEdu === '不限') { eduOk = true; totalScore += 25 }
    else if (resumeEdu.includes(jobEdu) || eduMap[resumeEdu] >= (eduMap[jobEdu] || 50)) {
      eduOk = true; totalScore += 25
    } else {
      totalScore += 8
    }
    totalWeight += 25
    lines.push({ label: '学历匹配', ok: eduOk, text: `您的${resumeEdu} · ${eduOk ? '符合岗位要求' : '低于岗位要求'}` })
  } else {
    lines.push({ label: '学历匹配', ok: false, text: '缺少学历数据' })
  }

  // 3. 求职意向匹配（权重 20）
  let intentOk = false
  if (r.intention && job.title) {
    const resumeIntent = (r.intention || '').toString()
    const jobTitle = job.title || ''
    const match = resumeIntent.split(/[、,，\s]+/).some(k => k.length >= 2 && jobTitle.includes(k))
    intentOk = match
    totalScore += match ? 20 : 6
    totalWeight += 20
    lines.push({ label: '求职意向', ok: intentOk, text: match ? '与岗位方向一致' : '与岗位方向不太匹配' })
  } else {
    lines.push({ label: '求职意向', ok: false, text: '缺少求职意向数据' })
  }

  // 4. 城市匹配（权重 15）
  let cityOk = false
  const resumeCity = r.city || ''
  if (resumeCity && job.city) {
    cityOk = resumeCity.includes(job.city) || job.city.includes(resumeCity)
    totalScore += cityOk ? 15 : 5
    totalWeight += 15
    lines.push({ label: '城市偏好', ok: cityOk, text: cityOk ? '与岗位城市一致' : '城市偏好与岗位不符' })
  } else {
    lines.push({ label: '城市偏好', ok: false, text: '缺少城市数据' })
  }

  const score = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0
  return { score, lines }
}

// ===== 真实数据聚合：岗位薪资分布 =====
function computeJobSalaryStats (job) {
  const pool = originalJobList.value.filter(j => j.salary_avg && j.salary_avg > 0)
  if (!pool.length) return { sameTitle: [], sameCity: [], buckets: [], cityBars: [], companyCount: 0, avgAll: 0 }

  // 同 title 的岗位（放宽：title 互相包含就算匹配）
  const title = job.title || ''
  const sameTitle = pool.filter(j => {
    const t = j.title || ''
    if (t === title) return true
    if (t.length >= 4 && title.length >= 4 && (t.includes(title.substring(0, 4)) || title.includes(t.substring(0, 4)))) return true
    return false
  })

  // 同城市的岗位
  const sameCity = pool.filter(j => j.city === job.city)

  // 薪资分桶：0-5, 5-10, 10-15, 15-20, 20-30, 30-50, 50+
  const BINS = [
    { label: '0-5K', min: 0, max: 5 },
    { label: '5-10K', min: 5, max: 10 },
    { label: '10-15K', min: 10, max: 15 },
    { label: '15-20K', min: 15, max: 20 },
    { label: '20-30K', min: 20, max: 30 },
    { label: '30-50K', min: 30, max: 50 },
    { label: '50K+', min: 50, max: Infinity }
  ]
  const buckets = BINS.map(b => ({ ...b, count: 0 }))
  sameTitle.forEach(j => {
    const s = j.salary_avg
    const bin = buckets.find(b => s >= b.min && s < b.max)
    if (bin) bin.count++
  })
  // 计算百分比
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1
  buckets.forEach(b => b.pct = Math.round((b.count / total) * 100))

  // 公司在数据集中有多少岗位
  const companyCount = pool.filter(j => j.company && j.company === job.company).length

  // 城市分布（取前 6 个城市，统计该城市同 title 岗位数）
  const cityCount = new Map()
  sameTitle.forEach(j => cityCount.set(j.city, (cityCount.get(j.city) || 0) + 1))
  const cityBars = [...cityCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([city, count]) => ({ city, count }))
  const maxCityCount = Math.max(1, ...cityBars.map(c => c.count))
  cityBars.forEach(c => c.pct = Math.round((c.count / maxCityCount) * 100))

  // 同岗位的平均薪资
  const avgAll = sameTitle.length
    ? Math.round(sameTitle.reduce((s, j) => s + j.salary_avg, 0) / sameTitle.length)
    : 0

  // 同岗位同城市的平均薪资
  const sameCityTitle = sameTitle.filter(j => j.city === job.city)
  const avgSameCity = sameCityTitle.length
    ? Math.round(sameCityTitle.reduce((s, j) => s + j.salary_avg, 0) / sameCityTitle.length)
    : 0

  return { sameTitle, sameCity, buckets, cityBars, companyCount, avgAll, avgSameCity, totalSameTitle: sameTitle.length }
}

// ===== 真实数据聚合：公司 / 行业总结 =====
function computeCompanyStats (job) {
  const pool = originalJobList.value
  if (!pool.length) return { companyCount: null, companyAvg: null, totalAll: pool.length, median: 0, p25: 0, p75: 0, eduDist: [] }

  // 同公司岗位
  const companyJobs = job.company && job.company !== '未知公司'
    ? pool.filter(j => j.company === job.company && j.salary_avg)
    : []

  // 同行业（按标签/title 关键词）岗位数
  const allSalaries = pool.filter(j => j.salary_avg > 0).map(j => j.salary_avg)
  allSalaries.sort((a, b) => a - b)
  const median = allSalaries.length ? allSalaries[Math.floor(allSalaries.length / 2)] : 0
  const p25 = allSalaries.length ? allSalaries[Math.floor(allSalaries.length * 0.25)] : 0
  const p75 = allSalaries.length ? allSalaries[Math.floor(allSalaries.length * 0.75)] : 0

  // 学历分布
  const eduMap = new Map()
  pool.forEach(j => { const e = j.education || '不限'; eduMap.set(e, (eduMap.get(e) || 0) + 1) })
  const eduDist = [...eduMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([edu, count]) => ({ edu, count }))
  const maxEdu = Math.max(1, ...eduDist.map(e => e.count))
  eduDist.forEach(e => e.pct = Math.round((e.count / maxEdu) * 100))

  // 公司岗位的平均薪资
  const companyAvg = companyJobs.length
    ? Math.round(companyJobs.reduce((s, j) => s + j.salary_avg, 0) / companyJobs.length)
    : null

  return {
    companyCount: companyJobs.length || null,
    companyAvg,
    totalAll: pool.length,
    median: Math.round(median),
    p25: Math.round(p25),
    p75: Math.round(p75),
    eduDist
  }
}

// ===== AI简历优化：对比简历技能 vs 同岗位高频标签 =====
function computeResumeOptimization (job) {
  const pool = originalJobList.value
  if (!pool.length) return { hasResume: false, matched: [], missing: [], resumeSkills: [] }

  // 同岗位 title 匹配（前4字符双向）
  const titleKey = (job.job_name || job.title || '').slice(0, 4).toLowerCase()
  const sameTitle = pool.filter(j => {
    const n = (j.job_name || '').toLowerCase()
    return n.includes(titleKey) || titleKey.includes(n.slice(0, 4))
  })

  // 从同岗位数据统计高频标签（tags + 从 job_name 里提取关键词）
  const allTags = []
  sameTitle.forEach(j => {
    (j.tags || []).forEach(t => allTags.push(String(t).toLowerCase()))
  })
  // 额外：从 job_name 里提取常见技术关键词
  const techKeywords = ['java', 'python', 'vue', 'react', 'js', '前端', '后端', '算法', '测试', '运维', 'spring', 'mysql', 'redis', 'docker', 'k8s', 'go', 'c++', 'ai', '机器学习', '大数据', '网络']
  sameTitle.forEach(j => {
    const name = (j.job_name || '').toLowerCase()
    techKeywords.forEach(k => { if (name.includes(k)) allTags.push(k) })
  })

  const tagCounts = {}
  allTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })
  const frequentTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([, c]) => c >= 3) // 至少出现3次才算是该方向的高频标签
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count, pct: Math.round((count / sameTitle.length) * 100) }))

  // 简历技能
  const r = resumeData.value
  let resumeSkills = []
  if (hasResume.value && r) {
    resumeSkills = (r.skills || []).map(s => (s.name || s.skill || s || '').toString().toLowerCase()).filter(Boolean)
    // 项目里的技术栈
    ;(r.projects || []).forEach(p => {
      const tech = (p.tech || p.techStack || p.stack || '').toString()
      tech.split(/[、,，\s]+/).forEach(t => { if (t.length >= 2) resumeSkills.push(t.toLowerCase()) })
    })
    resumeSkills = [...new Set(resumeSkills)]
  }

  // 对比：已匹配 vs 缺失
  const matched = []
  const missing = []
  frequentTags.forEach(ft => {
    const hit = resumeSkills.some(rs => rs.includes(ft.tag) || ft.tag.includes(rs))
    if (hit) matched.push(ft)
    else missing.push(ft)
  })

  return { hasResume: hasResume.value, matched, missing, resumeSkills, sameTitleCount: sameTitle.length }
}

// ===== AI求职路线：从真实 work_exp 字段计算职业进阶 =====
function computeCareerRoute (job) {
  const pool = originalJobList.value
  if (!pool.length) return { levels: [], allIndustryLevels: [], userStage: null, titleKey: '' }

  const titleKey = (job.job_name || job.title || '').slice(0, 4).toLowerCase()
  const sameTitle = pool.filter(j => {
    const n = (j.job_name || '').toLowerCase()
    return n.includes(titleKey) || titleKey.includes(n.slice(0, 4))
  })

  function mapExp(v) {
    const s = String(v || '').trim()
    if (!s || s === 'nan') return null
    if (s.includes('10年')) return 5
    if (s.includes('经验不限') || s.includes('不限') || s.includes('无需经验') || s.includes('在校生') || s.includes('应届生')) return 1
    if (s.includes('1年以下') || s === '1年' || s === '2年以下' || s === '3年以下' || s === '5年以下') return 1
    if (s.includes('1-3年') || s.includes('1-2年') || s.includes('2-3年') || s.includes('1-4年') || s.includes('1-5年') || s.includes('1-6年') || s.includes('1-7年') || s.includes('1-8年') || s.includes('1-10年')) return 2
    if (s === '2年' || s === '3年' || s === '1年') return 2
    if (s.includes('3-4年') || s.includes('3-5年') || s.includes('3-6年') || s.includes('3-7年') || s.includes('3-8年') || s.includes('3-9年') || s.includes('4-6年')) return 3
    if (s.includes('2-4年') || s.includes('2-5年') || s.includes('2-6年') || s.includes('2-7年') || s.includes('2-8年') || s.includes('2-9年')) return 3
    if (s.includes('3年以上') || s.includes('3年及以上')) return 3
    if (s.includes('4年') || s.includes('5年')) return 3
    if (s.includes('5-7年') || s.includes('5-8年') || s.includes('5-10年')) return 4
    if (s.includes('6年及以上') || s.includes('7年及以上') || s.includes('8年及以上') || s.includes('6年以上') || s.includes('7年以上') || s.includes('8年以上')) return 4
    if (s.includes('4年以上') || s.includes('4年及以上')) return 4
    if (s.includes('5年') && s.includes('以上')) return 4
    if (s === '6年' || s === '7年' || s === '8年') return 4
    if (s.includes('年以上') || s.includes('年及以上')) {
      const m = s.match(/(\d+)/)
      if (m) {
        const n = parseInt(m[1], 10)
        if (n <= 1) return 2
        if (n <= 3) return 3
        if (n < 10) return 4
      }
    }
    return null
  }

  // 从同岗位 job_name 里提取高频关键词（关键技能）
  const TECH_KEYWORDS = [
    '前端','后端','全栈','算法','AI','人工智能','机器学习','深度学习','大模型','LLM','NLP','CV','视觉',
    'Java','Spring','Python','Django','Flask','Go','Golang','Node','PHP','Ruby','Vue','React','Angular',
    'TypeScript','JavaScript','MySQL','Redis','MongoDB','PostgreSQL','Kafka','Elasticsearch','Docker','Kubernetes','K8s',
    'Hadoop','Spark','Flink','大数据','数据','ETL','数仓','Android','iOS','Flutter','React Native','RN',
    'DevOps','SRE','云计算','云原生','AWS','安全','渗透','网络','测试','自动化测试','性能测试','游戏',
    '区块链','Blockchain','机器人','Robot','FPGA','嵌入式','硬件','ARM','单片机','DBA','数据库',
    '架构','架构师','微服务','分布式','高并发','系统设计','推荐','搜索','GraphQL','WebSocket','JVM','Netty'
  ]
  function extractKeywords (jobs, topN) {
    const counter = {}
    jobs.forEach(j => {
      const name = (j.job_name || '').toLowerCase()
      TECH_KEYWORDS.forEach(k => {
        if (name.includes(k.toLowerCase())) counter[k] = (counter[k] || 0) + 1
      })
    })
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([k]) => k)
  }

  const expStages = [
    { index: 1, label: '应届生', desc: '零经验入行', key: 'entry', color: '#7aa0ff' },
    { index: 2, label: '初级工程师', desc: '1-3年经验', key: 'junior', color: '#63b6ff' },
    { index: 3, label: '中级工程师', desc: '3-5年经验', key: 'mid', color: '#4a8aff' },
    { index: 4, label: '高级/资深', desc: '5-10年经验', key: 'senior', color: '#4a7bff' },
    { index: 5, label: '技术专家/TL', desc: '10年+ 经验', key: 'expert', color: '#3b5fd9' }
  ]

  const levels = expStages.map(stg => {
    const matched = sameTitle.filter(j => mapExp(j.work_exp) === stg.index)
    const salaries = matched.map(j => j.salary_avg).filter(Boolean)
    const avgSalary = salaries.length
      ? Math.round(salaries.reduce((s, v) => s + v, 0) / salaries.length)
      : 0
    // 每个阶段对应的关键技能（从该阶段的岗位名 + 全局提取）
    const stageKw = extractKeywords(matched, 5)
    // 如果该阶段没数据，用全局数据兜底
    const fallbackKw = stageKw.length ? stageKw : extractKeywords(sameTitle, 5)
    return { ...stg, count: matched.length, avgSalary, salaries, keySkills: fallbackKw }
  }).filter(l => l.count > 0)

  // 全行业 fallback
  let allIndustryLevels = []
  if (levels.length < 2) {
    allIndustryLevels = expStages.map(stg => {
      const matched = pool.filter(j => mapExp(j.work_exp) === stg.index)
      const salaries = matched.map(j => j.salary_avg).filter(Boolean)
      const avgSalary = salaries.length ? Math.round(salaries.reduce((s, v) => s + v, 0) / salaries.length) : 0
      const stageKw = extractKeywords(matched, 5)
      return { ...stg, count: matched.length, avgSalary, salaries, keySkills: stageKw }
    }).filter(l => l.count > 0)
  }

  // 用户定位：基于简历技能匹配度 + 岗位学历/经验要求估算当前所在阶段
  const resumeSkills = (resumeData.value?.skills || []).map(s => String(s).toLowerCase())
  const jobOptMissing = resumeOptData.value?.missing || []
  const jobOptMatched = resumeOptData.value?.matched || []
  // 覆盖率 = 已匹配 / (已匹配 + 缺失)
  const coverage = jobOptMatched.length + jobOptMissing.length > 0
    ? jobOptMatched.length / (jobOptMatched.length + jobOptMissing.length)
    : 0
  // 简历技能总数
  const totalResumeSkills = resumeSkills.length

  let userStage = null
  if (levels.length >= 2) {
    // 基于覆盖率 + 简历技能数估算阶段
    let idx = 1
    if (coverage > 0.8 && totalResumeSkills >= 12) idx = 4
    else if (coverage > 0.6 && totalResumeSkills >= 8) idx = 3
    else if (coverage > 0.3 && totalResumeSkills >= 4) idx = 2
    else idx = 1
    userStage = levels.find(l => l.index === idx) || levels[0]
  }

  return { levels, allIndustryLevels, sameTitleCount: sameTitle.length, userStage, titleKey: job.job_name || '' }
}

function generateTrend (job) {
  const base = job.salary_avg || 10
  // 生成 6 个月、1 年、2 年的薪资趋势百分比（相对 base 做 ±20% 波动）
  const seed = String(job.title).length + (job.salary_avg || 0)
  const months = [0.9, 0.95, 1.0, 1.05, 1.1, 1.15]
  return months.map((m, i) => Math.max(3, Math.round(base * m * (0.8 + ((seed + i * 7) % 3) * 0.1))))
}

function generateJobDesc (job) {
  const skillText = job.tags.join('、')
  return `岗位职责：\n1. 负责${job.title}相关核心业务的研发与迭代\n2. 参与技术方案设计和技术选型，推动技术落地\n3. 与产品、设计、测试团队紧密协作，保障项目高质量交付\n4. 持续优化系统架构和性能，提升产品竞争力\n5. 关注行业技术动态，推动团队技术能力提升\n\n工作地点：${job.city}\n薪资范围：${job.salary}\n所属公司：${job.company}`
}

function generateRequirements (job) {
  const edu = job.education
  const exp = job.work_exp
  return [
    `具有${edu}及以上学历，计算机相关专业优先`,
    `${exp}工作经验，熟悉${job.tags.slice(0, 2).join('/')}等核心技术栈`,
    '具备良好的代码规范意识和工程化思维',
    '有较强的学习能力和问题解决能力',
    '具备良好的沟通协作能力和团队合作精神',
    '有大型项目经验或开源贡献者优先考虑'
  ]
}

function generateDetailJob (job) {
  return {
    ...job,
    analysis: generateAnalysis(job),
    trend: generateTrend(job),
    highlights: pickWeighted(HIGHLIGHT_POOL, job.title, 5),
    job_desc: generateJobDesc(job),
    requirements: generateRequirements(job),
    companySize: pickWeighted(COMPANY_SIZE_POOL, job.company, 1)[0],
    companyType: pickWeighted(COMPANY_TYPE_POOL, job.company, 1)[0],
    companyDesc: `${job.company}是${job.city}地区的一家专注于${job.tags[0] || 'IT'}领域的企业，致力于提供高品质的产品和服务。公司注重技术创新与人才培养，为员工提供良好的成长空间和福利待遇。`,
    similarJobs: findSimilarJobs(job)
  }
}

// 真实相似度排序：标签交集 + 城市匹配 + 薪资接近度
function findSimilarJobs (job) {
  const srcTags = new Set(job.tags || [])
  const srcSalary = job.salary_avg || 10
  const srcCity = job.city

  // 只取有真实 company 的岗位（过滤掉脏 company 被 sanitize 成"未知公司"的）
  const validPool = originalJobList.value.filter(j =>
    j.title !== job.title &&
    j.company && j.company !== '未知公司' &&
    j.company.length >= 2
  )

  const scored = validPool
    .map(j => {
      // 标签交集数
      const jTags = new Set(j.tags || [])
      let tagOverlap = 0
      srcTags.forEach(t => { if (jTags.has(t)) tagOverlap++ })
      // 标题关键词交集（把岗位名按空格/括号/分隔符拆开，也当"标签"用）
      const srcKw = new Set((job.title || '').split(/[\s()（）\-/]/).filter(Boolean).filter(w => w.length >= 2))
      const jKw = new Set((j.title || '').split(/[\s()（）\-/]/).filter(Boolean).filter(w => w.length >= 2))
      srcKw.forEach(k => { if (jKw.has(k)) tagOverlap += 2 }) // 标题关键词匹配权重更高

      let score = tagOverlap * 10 // 标签分
      if (j.city === srcCity) score += 15 // 同城 +15
      else score += 3 // 不同城但也给点分，避免全空

      // 薪资接近度（0-10 分）
      const jSalary = j.salary_avg || 10
      const ratio = Math.min(jSalary, srcSalary) / Math.max(jSalary, srcSalary)
      score += ratio * 10

      // 标题相似度（全文字符重合度）
      const titleSimilarity = Math.min(job.title.length, j.title.length) > 0
        ? (job.title.split('').filter(c => j.title.includes(c)).length / Math.max(job.title.length, j.title.length)) * 5
        : 0
      score += titleSimilarity

      return { job: j, score }
    })
    .sort((a, b) => b.score - a.score)

  // 同标题去重（不同城市/公司但标题一样的只留最高分的一个）
  const seenTitles = new Set()
  const deduped = []
  for (const s of scored) {
    if (!seenTitles.has(s.job.title)) {
      seenTitles.add(s.job.title)
      deduped.push(s.job)
    }
    if (deduped.length >= 4) break
  }

  return deduped
}

const openDetail = (job) => {
  detailJob.value = generateDetailJob(job)
  document.body.style.overflow = 'hidden'
}

const closeDetail = () => {
  detailJob.value = null
  document.body.style.overflow = ''
}

const openSourceLink = (job) => {
  // 根据 dataSource 生成对应招聘平台的搜索链接（避免硬编码真实 URL 导致 404）
  const keyword = encodeURIComponent(job.title)
  const sourceMap = {
    'BOSS直聘': `https://www.zhipin.com/web/geek/job?query=${keyword}`,
    '猎聘': `https://www.liepin.com/zhaopin/?key=${keyword}`,
    '前程无忧': `https://search.51job.com/list/000000,000000,0000,00,9,99,${keyword},2,1.html`,
    '拉勾网': `https://www.lagou.com/wn/jobs?kd=${keyword}`,
    '智联': `https://sou.zhaopin.com/?kw=${keyword}`
  }
  const url = sourceMap[job.dataSource] || `https://www.zhipin.com/web/geek/job?query=${keyword}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const goBack = () => {
  router.push('/dashboard')
}

const searchKeyword = ref('')
const activeCategory = ref(0)
const selectedOptions = ref(['本科'])
const loading = ref(false)
const originalJobList = ref([])
const jobList = ref([])
const currentPage = ref(1)
const pageSize = 12
const favorites = ref(loadFavoritesFromStorage())
const filtering = ref(false)
const FAVORITES_KEY = 'job_recommend_favorites_v2'

function loadFavoritesFromStorage () {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    // 兼容旧 v1 格式：['title1', 'title2'] → 转为 v2 对象格式
    if (arr.length > 0 && typeof arr[0] === 'string') {
      return arr.map(title => ({ title, company: '', city: '', salary: '', addedAt: new Date().toISOString() }))
    }
    return arr
  } catch (e) {
    return []
  }
}
function saveFavoritesToStorage () {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value)) } catch (e) { /* 忽略 */ }
}

// 判断某个岗位是否已收藏（按 title 匹配）
const isFavorited = (title) => favorites.value.some(f => f.title === title)

const categories = ['全部岗位', '今日新岗', '应届生校招', '人工智能', '国产芯片', '国企央企', '专精特新', '基层县域']

const generateSalaryRange = (salary) => {
  const base = (salary && salary > 0) ? salary : 10000
  const min = Math.floor(base * 0.7 / 1000)
  const max = Math.floor(base * 1.3 / 1000)
  return `${min}K-${max}K`
}

const generateMatchScore = (job, salary) => {
  const baseScore = 60 + Math.floor(Math.random() * 30)
  const s = (salary && salary > 0) ? salary : Number(job.salary_avg)
  if (s && s > 30000) return Math.min(baseScore + 10, 98)
  if (s && s > 20000) return Math.min(baseScore + 5, 95)
  return baseScore
}

const generateTags = (jobName) => {
  const tagMap = {
    'Java': ['Java', 'SpringBoot', 'Redis'],
    '前端': ['Vue', 'React', 'TypeScript'],
    'Python': ['Python', 'Django', 'Flask'],
    '算法': ['机器学习', '深度学习', 'TensorFlow'],
    '测试': ['自动化测试', '性能测试', 'Selenium'],
    '运维': ['Linux', 'Docker', 'K8s'],
    '数据库': ['MySQL', 'Redis', 'MongoDB'],
    '大数据': ['Hadoop', 'Spark', 'Flink'],
    '安全': ['渗透测试', '代码审计', '安全加固'],
    '全栈': ['Vue', 'Node.js', 'MongoDB'],
    '嵌入式': ['C/C++', 'ARM', 'Linux驱动'],
    '网络': ['TCP/IP', '路由交换', '网络安全'],
    '移动': ['Android', 'iOS', 'Flutter'],
    'UI': ['Figma', 'Sketch', 'Photoshop'],
    '产品': ['需求分析', '产品设计', '项目管理'],
    '游戏': ['Unity', 'Unreal', 'C++'],
  }
  
  for (const [key, tags] of Object.entries(tagMap)) {
    if (jobName.includes(key)) return tags
  }
  return ['计算机', 'IT', '技术']
}

// 脏 company 黑名单：爬虫误把 UI 按钮文本、广告词抓进了 company 字段
const DIRTY_COMPANY_KEYWORDS = ['立即投递', '投递收藏', '收藏', '投递简历', '点击查看', '高薪', '诚聘']
function sanitizeCompany (raw) {
  if (!raw || typeof raw !== 'string') return '未知公司'
  const name = raw.trim()
  if (!name || name.length < 2) return '未知公司'
  if (DIRTY_COMPANY_KEYWORDS.some(k => name.includes(k))) return '未知公司'
  // 纯标点/无意义内容
  if (/^[\s\W_]+$/.test(name)) return '未知公司'
  return name
}

function sanitizeSalaryAvg (raw) {
  const val = Number(raw)
  if (!val || val <= 0 || isNaN(val)) return null // null 表示缺失，让 generateSalaryRange 兜底
  return val
}

const transformJobData = (rawJob) => {
  const salary = sanitizeSalaryAvg(rawJob.salary_avg)
  return {
    title: (rawJob.job_name && rawJob.job_name.trim()) || '未知岗位',
    company: sanitizeCompany(rawJob.company),
    city: rawJob.city || '不限',
    salary: generateSalaryRange(salary),
    salary_avg: salary,
    match: generateMatchScore(rawJob, salary),
    tags: generateTags(rawJob.job_name || ''),
    dataSource: rawJob.data_source || '网络',
    education: rawJob.education || '不限',
    work_exp: rawJob.work_exp || '不限'
  }
}

const loadRealData = async () => {
  loading.value = true
  try {
    const response = await fetch('/data/all_cleaned_jobs.json')
    if (!response.ok) {
      throw new Error('数据加载失败')
    }
    const rawData = await response.json()
    const transformed = rawData.map(transformJobData)
    originalJobList.value = transformed
    jobList.value = transformed
  } catch (err) {
    console.error('加载真实数据失败:', err)
    loadMockData()
  } finally {
    loading.value = false
  }
}

const loadMockData = () => {
  const mockData = [
    { job_name: 'Java开发工程师', city: '北京', education: '本科', work_exp: '1-3年', company: '字节跳动', salary_avg: 28000, data_source: 'BOSS直聘' },
    { job_name: '前端开发工程师', city: '杭州', education: '本科', work_exp: '1-3年', company: '阿里巴巴', salary_avg: 25000, data_source: 'BOSS直聘' },
    { job_name: 'Python数据分析师', city: '上海', education: '本科', work_exp: '1-3年', company: '美团', salary_avg: 22000, data_source: '前程无忧' },
    { job_name: 'AI算法工程师', city: '北京', education: '硕士', work_exp: '3-5年', company: '百度', salary_avg: 45000, data_source: '拉勾网' },
    { job_name: '大数据开发工程师', city: '杭州', education: '本科', work_exp: '3-5年', company: '阿里巴巴', salary_avg: 35000, data_source: '前程无忧' },
  ]
  const transformed = mockData.map(transformJobData)
  originalJobList.value = transformed
  jobList.value = transformed
}

const filters = ref([
  { name: '期望薪资', value: 85, key: 'salary' },
  { name: '专业匹配', value: 90, key: 'major' },
  { name: '就业城市', value: 75, key: 'city' },
  { name: '企业类型', value: 60, key: 'company' },
  { name: '发展机会偏好', value: 80, key: 'growth' }
])

const onSliderChange = (index) => {
  applyFilters()
}

const quickOptions = ['本科', '硕士', '应届生', '3年经验', '5年经验', '大厂']

const toggleOption = (option) => {
  const index = selectedOptions.value.indexOf(option)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(option)
  }
  applyFilters()
}

const applyFilters = () => {
  let filtered = originalJobList.value
  
  if (activeCategory.value === 1) {
    filtered = originalJobList.value.slice(0, 30)
  } else if (activeCategory.value === 2) {
    filtered = originalJobList.value.filter(job => 
      job.education?.includes('本科') || job.education?.includes('硕士') ||
      job.work_exp?.includes('应届生') || job.work_exp?.includes('校招')
    )
  } else if (activeCategory.value === 3) {
    filtered = originalJobList.value.filter(job => 
      job.title?.includes('AI') || job.title?.includes('人工智能') || 
      job.title?.includes('算法') || job.title?.includes('机器学习') ||
      job.title?.includes('深度学习') || job.title?.includes('智能')
    )
  } else if (activeCategory.value === 4) {
    filtered = originalJobList.value.filter(job => 
      job.title?.includes('芯片') || job.title?.includes('半导体') ||
      job.title?.includes('IC') || job.title?.includes('FPGA') ||
      job.title?.includes('嵌入式') || job.title?.includes('硬件')
    )
  } else if (activeCategory.value === 5) {
    filtered = originalJobList.value.filter(job => 
      job.company?.includes('国企') || job.company?.includes('央企') ||
      job.company?.includes('国家') || job.company?.includes('中国')
    )
  } else if (activeCategory.value === 6) {
    filtered = originalJobList.value.filter(job => 
      job.company?.includes('科技') || job.company?.includes('创新') ||
      job.company?.includes('专精') || job.company?.includes('高新')
    )
  } else if (activeCategory.value === 7) {
    const tier1Cities = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京']
    filtered = originalJobList.value.filter(job => 
      job.city && !tier1Cities.some(c => job.city.includes(c))
    )
  }
  
  if (selectedOptions.value.length > 0) {
    filtered = filtered.filter(job => {
      return selectedOptions.value.some(option => {
        if (['本科', '硕士'].includes(option)) {
          return job.education?.includes(option)
        } else if (['应届生', '应届'].includes(option)) {
          return job.work_exp?.includes('应届') || job.work_exp?.includes('校招')
        } else if (option === '3年经验') {
          return job.work_exp?.includes('1-3') || job.work_exp?.includes('3-5')
        } else if (option === '5年经验') {
          return job.work_exp?.includes('3-5') || job.work_exp?.includes('5-10') || job.work_exp?.includes('5年以上')
        } else if (['北京', '上海', '深圳', '广州', '杭州', '成都'].includes(option)) {
          return job.city?.includes(option)
        } else if (['1-3年', '3-5年', '5年以上'].includes(option)) {
          return job.work_exp?.includes(option)
        } else if (['5K以下', '5-10K', '10-20K', '20K以上'].includes(option)) {
          return job.salary?.includes(option)
        } else if (option === '大厂') {
          return job.company?.includes('科技') || job.company?.includes('集团') || job.company?.includes('网络') || job.company?.includes('智能')
        }
        return true
      })
    })
  }
  
  if (searchKeyword.value.trim()) {
    filtered = filtered.filter(job => 
      job.title.includes(searchKeyword.value) ||
      job.company.includes(searchKeyword.value) ||
      job.city.includes(searchKeyword.value) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }
  
  if (selectedOptions.value.length === 0 && activeCategory.value === 0 && !searchKeyword.value.trim()) {
    // 展示全部数据，不再截断
  }
  
  jobList.value = filtered.length > 0 ? filtered : []
}

const handleCategoryChange = (index) => {
  activeCategory.value = index
  currentPage.value = 1
  applyFilters()
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    handleCategoryChange(activeCategory.value)
    return
  }
  const filtered = originalJobList.value.filter(job => 
    job.title.includes(searchKeyword.value) ||
    job.company.includes(searchKeyword.value) ||
    job.city.includes(searchKeyword.value) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  )
  if (filtered.length === 0) {
    alert('没有找到匹配的岗位')
  } else {
    jobList.value = filtered
    currentPage.value = 1
  }
}

const toggleFavorite = (job) => {
  const idx = favorites.value.findIndex(f => f.title === job.title)
  if (idx > -1) {
    favorites.value.splice(idx, 1)
  } else {
    favorites.value.push({
      title: job.title,
      company: job.company || '',
      city: job.city || '',
      salary: job.salary || '',
      tags: job.tags || [],
      addedAt: new Date().toISOString()
    })
  }
  saveFavoritesToStorage()
}

// 格式化时间戳
function formatAddedAt (isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return '' }
}

// ===== 我的收藏弹窗 =====
const showMyFavorites = ref(false)
const openMyFavorites = () => { showMyFavorites.value = true }
const closeMyFavorites = () => { showMyFavorites.value = false }

// 收藏列表：合并 favorites 存储对象 + originalJobList 里的完整数据
const favoriteJobs = computed(() => {
  const favs = favorites.value
  if (!favs.length) return []
  const byTitle = new Map()
  originalJobList.value.forEach(j => { if (!byTitle.has(j.title)) byTitle.set(j.title, j) })
  return favs
    .map(favObj => {
      // 优先从原始列表拿完整数据，拿不到就用收藏对象里的字段兜底
      const full = byTitle.get(favObj.title)
      if (full) {
        return { ...generateDetailJob(full), addedAt: favObj.addedAt }
      }
      // 兜底：用存储对象里的字段构造
      return {
        title: favObj.title,
        company: favObj.company || '未知公司',
        city: favObj.city || '不限',
        salary: favObj.salary || '面议',
        tags: favObj.tags || [],
        education: '不限',
        work_exp: '不限',
        dataSource: '',
        salary_avg: null,
        addedAt: favObj.addedAt
      }
    })
    .sort((a, b) => {
      // 按收藏时间倒序，最新收藏的在前面
      const tA = a.addedAt ? new Date(a.addedAt).getTime() : 0
      const tB = b.addedAt ? new Date(b.addedAt).getTime() : 0
      return tB - tA
    })
})

const filteredJobCount = computed(() => jobList.value.length)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(jobList.value.length / pageSize))
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push({ key: i, value: i })
    }
  } else {
    pages.push({ key: 1, value: 1 })
    
    if (current > 4) {
      pages.push({ key: 'ellipsis-start', value: '...' })
    }
    
    const start = Math.max(2, current - 2)
    const end = Math.min(total - 1, current + 2)
    
    for (let i = start; i <= end; i++) {
      pages.push({ key: i, value: i })
    }
    
    if (current < total - 3) {
      pages.push({ key: 'ellipsis-end', value: '...' })
    }
    
    pages.push({ key: total, value: total })
  }
  
  return pages
})

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const pageJobs = jobList.value.slice(start, end)
  // 最后一页不足 pageSize 时，补占位卡片让网格对齐
  const placeholders = []
  const remaining = pageSize - pageJobs.length
  if (remaining > 0) {
    for (let i = 0; i < remaining; i++) {
      placeholders.push({ isPlaceholder: true })
    }
  }
  return [...pageJobs, ...placeholders]
})

const handleApplyFilter = async () => {
  filtering.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  applyFilters()
  currentPage.value = 1
  filtering.value = false
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  const jobListSection = document.querySelector('.job-list-section')
  if (jobListSection) {
    jobListSection.scrollTop = 0
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeCategory.value = 0
  selectedOptions.value = ['本科']
  currentPage.value = 1
  handleCategoryChange(0)
}

const bgCanvas = ref(null)
let bgAnimationId = null

onMounted(async () => {
  await loadRealData()
  
  const canvas = bgCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const stars = []
  const particleCount = 80

  for (let i = 0; i < particleCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
      alpha: Math.random(),
      speed: Math.random() * 0.02
    })
  }

  const animate = () => {
    ctx.fillStyle = 'rgba(5, 10, 30, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    stars.forEach(star => {
      star.alpha += star.speed
      if (star.alpha >= 1 || star.alpha <= 0) {
        star.speed = -star.speed
      }

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74, 158, 255, ${star.alpha})`
      ctx.fill()
    })

    bgAnimationId = requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
})

onUnmounted(() => {
  if (bgAnimationId) {
    cancelAnimationFrame(bgAnimationId)
  }
})
</script>

<style scoped>
.job-recommend-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #050a1e 0%, #0a1628 50%, #050a1e 100%);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 30px 50px;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.ai-powered-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 14px;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.35);
  color: rgba(196, 181, 253, 0.9);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}
.ai-powered-tag:hover {
  background: rgba(124, 58, 237, 0.2);
  border-color: rgba(167, 139, 250, 0.6);
  color: #c4b5fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(124, 58, 237, 0.25);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 20, 45, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.header-title {
  text-align: left;
}

.back-btn:hover {
  border-color: rgba(74, 158, 255, 0.6);
  background: rgba(74, 158, 255, 0.1);
  transform: translateX(-4px);
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.3);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 4px 0;
}

.header-title p {
  font-size: 13px;
  color: rgba(150, 180, 220, 0.7);
  margin: 0;
}

.my-fav-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 71, 87, 0.08);
  border: 1px solid rgba(255, 71, 87, 0.35);
  border-radius: 50px;
  padding: 8px 16px;
  color: rgba(255, 200, 210, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.my-fav-btn:hover {
  background: rgba(255, 71, 87, 0.18);
  border-color: rgba(255, 71, 87, 0.6);
  box-shadow: 0 4px 18px rgba(255, 71, 87, 0.25);
}

.fav-count {
  background: rgba(255, 71, 87, 0.9);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.search-bar {
  display: flex;
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 10;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(10, 20, 45, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50px;
  padding: 0 25px;
  height: 48px;
}

.search-icon {
  margin-right: 15px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.search-input::placeholder {
  color: rgba(150, 180, 220, 0.5);
}

.search-btn {
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  border: none;
  border-radius: 50px;
  padding: 0 35px;
  height: 48px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.6);
}

.category-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
  flex-wrap: wrap;
}

.tab-item {
  padding: 10px 22px;
  background: rgba(10, 20, 45, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 25px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item:hover {
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.tab-item.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3) 0%, rgba(0, 212, 170, 0.2) 100%);
  border-color: rgba(74, 158, 255, 0.6);
  color: #fff;
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  align-items: flex-start;
}

.job-list-section {
  flex: 1;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.job-list-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.5), transparent);
}

.filter-section {
  width: 300px;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 0;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 80px);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.filter-content {
  padding: 25px;
  flex: 1;
  overflow-y: scroll;
  overflow-x: visible;
}

.filter-actions {
  display: flex;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
  background: rgba(10, 20, 45, 0.9);
  flex-shrink: 0;
}

.filter-content::-webkit-scrollbar {
  width: 6px;
}

.filter-content::-webkit-scrollbar-track {
  background: rgba(10, 20, 45, 0.3);
  border-radius: 3px;
}

.filter-content::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.5);
  border-radius: 3px;
}

.filter-content::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.7);
}

.filter-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.5), transparent);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(74, 158, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-header span {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.job-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.job-card-placeholder {
  visibility: hidden;
}

.job-card {
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.job-card:hover {
  border-color: rgba(74, 158, 255, 0.5);
  transform: translateY(-3px);
}

.job-card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.job-header {
  margin-bottom: 12px;
}

.job-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.job-company {
  color: rgba(150, 180, 220, 0.5);
  font-size: 12px;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: rgba(150, 180, 220, 0.4);
  font-size: 11px;
}

.info-item .value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.match-value {
  color: #00d4aa;
  font-weight: 600;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}

.tag {
  padding: 3px 8px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 4px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 10px;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(150, 180, 220, 0.7);
}

.meta-item svg {
  color: rgba(74, 158, 255, 0.6);
}

.job-actions {
  display: flex;
  gap: 10px;
}

.favorite-btn {
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: rgba(74, 158, 255, 0.8);
}

.favorite-btn:hover {
  background: rgba(74, 158, 255, 0.25);
}

.favorite-btn.favorited {
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.4);
  color: rgba(255, 71, 87, 0.9);
}

.favorite-btn.favorited:hover {
  background: rgba(255, 71, 87, 0.25);
}

.detail-btn {
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  background: rgba(0, 212, 170, 0.12);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: rgba(0, 212, 170, 0.85);
}

.detail-btn:hover {
  background: rgba(0, 212, 170, 0.25);
  box-shadow: 0 0 12px rgba(0, 212, 170, 0.25);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 25px 0;
  padding: 15px;
  background: rgba(74, 158, 255, 0.05);
  border-radius: 12px;
}

.page-btn {
  padding: 8px 16px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.25);
  border-color: rgba(74, 158, 255, 0.5);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  min-width: 35px;
  height: 35px;
  padding: 0 10px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 6px;
  color: rgba(150, 180, 220, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background: rgba(74, 158, 255, 0.2);
}

.page-number.active {
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.page-info {
  font-size: 12px;
  color: rgba(150, 180, 220, 0.6);
  margin-left: 10px;
}

.apply-filter-btn {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.6);
}

.apply-filter-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.apply-filter-btn .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 35px;
  height: 35px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 14px;
}

.reset-filter-btn {
  padding: 12px 20px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background: rgba(74, 158, 255, 0.25);
}

.card-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border-color: rgba(74, 158, 255, 0.4);
  border-style: solid;
  border-width: 0;
}

.card-corner.tl {
  top: 8px;
  left: 8px;
  border-top-width: 2px;
  border-left-width: 2px;
}

.card-corner.tr {
  top: 8px;
  right: 8px;
  border-top-width: 2px;
  border-right-width: 2px;
}

.card-corner.bl {
  bottom: 8px;
  left: 8px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}

.card-corner.br {
  bottom: 8px;
  right: 8px;
  border-bottom-width: 2px;
  border-right-width: 2px;
}

.reset-btn {
  display: block;
  margin: 30px auto 0;
  padding: 12px 40px;
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.6);
}

.filter-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-wrapper {
  position: relative;
  flex: 1;
  height: 24px;
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  transform: translateY(-50%);
  background: rgba(74, 158, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
  pointer-events: none;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4aa 0%, #4a9eff 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.slider-input {
  position: relative;
  width: 100%;
  height: 24px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
  transition: transform 0.2s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.7);
}

.slider-input::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}

.slider-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.slider-input::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.slider-input::-moz-range-thumb:active {
  cursor: grabbing;
}

.slider-value {
  flex-shrink: 0;
  color: rgba(74, 158, 255, 0.9);
  font-size: 13px;
  font-weight: 600;
  width: 36px;
  text-align: right;
}

.quick-filters {
  padding-top: 20px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
}

.additional-filters {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
}

.quick-title {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
  margin-bottom: 12px;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-option {
  padding: 6px 14px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-option:hover {
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.quick-option.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
  color: #fff;
}

@media (max-width: 1200px) {
  .job-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .job-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .job-cards {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .filter-section {
    width: 100%;
  }
}
</style>

<!-- 详情弹窗样式（Teleport 到 body，必须非 scoped） -->
<style>
.detail-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(3, 8, 20, 0.92) 0%, rgba(0, 0, 0, 0.96) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* 详情弹窗：黑金 + 荧光青绿 炫酷配色（脱离主页面的紫蓝色系） */
.detail-modal {
  position: relative;
  width: 100%;
  max-width: 820px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background:
    radial-gradient(ellipse at top left, rgba(74,138,255, 0.08), transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(122,160,255, 0.06), transparent 45%),
    linear-gradient(180deg, #0a0e1f 0%, #060812 100%);
  border: 1px solid rgba(74,138,255, 0.25);
  border-radius: 20px;
  padding: 32px 36px 24px;
  box-shadow:
    0 0 0 1px rgba(74,138,255, 0.08),
    0 0 60px rgba(74,138,255, 0.12),
    0 0 140px rgba(122,160,255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  color: rgba(220, 240, 235, 0.92);
  scrollbar-width: thin;
  scrollbar-color: rgba(74,138,255, 0.4) transparent;
}
.detail-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background:
    linear-gradient(135deg, transparent 40%, rgba(74,138,255, 0.06) 50%, transparent 60%);
  pointer-events: none;
}
.detail-modal::-webkit-scrollbar { width: 6px; }
.detail-modal::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(74,138,255,0.5), rgba(122,160,255,0.3)); border-radius: 3px; }

.detail-close {
  position: absolute; top: 14px; right: 14px; width: 34px; height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(74,138,255, 0.35);
  background: rgba(74,138,255, 0.08);
  color: rgba(74,138,255, 0.9);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.25s cubic-bezier(.4,0,.2,1); z-index: 10;
}
.detail-close:hover {
  background: rgba(122,160,255, 0.2);
  border-color: rgba(122,160,255, 0.6);
  color: #7aa0ff;
  transform: rotate(90deg);
  box-shadow: 0 0 18px rgba(122,160,255, 0.4);
}

.detail-title-row { margin-bottom: 28px; }
.detail-job-title {
  font-size: 26px; font-weight: 700; margin: 0 0 10px;
  background: linear-gradient(135deg, #ffffff 0%, #4a8aff 40%, #4a7bff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}
.detail-job-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.detail-tag {
  font-size: 12px; padding: 4px 12px; border-radius: 14px;
  background: rgba(74,138,255, 0.08); border: 1px solid rgba(74,138,255, 0.3);
  color: rgba(74,138,255, 0.9);
}

.detail-section { margin-bottom: 22px; }
.detail-section-title {
  font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 14px;
  padding-bottom: 8px; border-bottom: 1px solid rgba(74,138,255, 0.15);
  display: flex; align-items: center; gap: 8px;
}
.ai-bolt-icon {
  width: 16px; height: 16px;
  background: linear-gradient(135deg, #4a8aff, #4a7bff);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  display: inline-block;
}

.ai-section {
  background: linear-gradient(135deg, rgba(74,138,255, 0.06) 0%, rgba(122,160,255, 0.04) 100%);
  border: 1px solid rgba(74,138,255, 0.2); border-radius: 14px; padding: 22px;
  box-shadow: 0 0 30px rgba(74,138,255, 0.06);
}
.ai-main { display: flex; gap: 28px; align-items: stretch; }
.ai-analysis-left { display: flex; gap: 24px; flex: 1; }

.match-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.match-ring-svg { width: 120px; height: 120px; filter: drop-shadow(0 0 8px rgba(74,138,255, 0.5)); }
.match-ring-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.match-num {
  font-size: 34px; font-weight: 700;
  background: linear-gradient(135deg, #7aa0ff, #4a8aff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(74,138,255, 0.4);
}
.match-label { font-size: 11px; color: rgba(196, 181, 253, 0.7); margin-top: 2px; }

.ai-analysis-lines { flex: 1; display: flex; flex-direction: column; gap: 12px; padding-top: 6px; }
.ai-line { display: flex; align-items: center; gap: 12px; font-size: 13px; line-height: 1.5; }
.ai-match-badge {
  width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.ai-match-badge.ok {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.55);
  color: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.3);
}
.ai-match-badge.fail {
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.55);
  color: #f87171;
  box-shadow: 0 0 6px rgba(248, 113, 113, 0.3);
}
.ai-label {
  color: rgba(196, 181, 253, 0.9);
  font-weight: 500;
  min-width: 72px;
  flex-shrink: 0;
}
.ai-text {
  flex: 1;
  color: rgba(220, 240, 235, 0.7);
  font-size: 12px;
}

/* 无简历提示卡 */
.ai-no-resume {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 26px 22px;
  background: linear-gradient(135deg, rgba(74,138,255, 0.1) 0%, rgba(122,160,255, 0.06) 100%);
  border: 1px dashed rgba(167, 139, 250, 0.5);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}
.ai-no-resume::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, rgba(74,138,255, 0.08), transparent 60%);
  pointer-events: none;
}
.no-resume-icon {
  font-size: 42px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(74,138,255, 0.2), rgba(122,160,255, 0.15));
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-radius: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 10px rgba(74,138,255, 0.3));
}
.no-resume-text {
  flex: 1;
  position: relative;
  z-index: 1;
}
.no-resume-title {
  font-size: 16px;
  font-weight: 600;
  color: #7aa0ff;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.no-resume-desc {
  font-size: 12px;
  color: rgba(220, 240, 235, 0.65);
  line-height: 1.7;
}
.go-resume-btn {
  padding: 11px 22px;
  background: linear-gradient(135deg, #4a8aff 0%, #4a7bff 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(74,138,255, 0.4);
  transition: all 0.25s ease;
  letter-spacing: 1px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.go-resume-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(74,138,255, 0.55);
}
.go-resume-btn:active {
  transform: translateY(0);
}

.ai-side { display: flex; flex-direction: column; gap: 12px; min-width: 180px; }
.salary-card {
  background: linear-gradient(135deg, rgba(122,160,255, 0.12) 0%, rgba(74,138,255, 0.08) 100%);
  border: 1px solid rgba(122,160,255, 0.3); border-radius: 12px; padding: 16px;
  box-shadow: 0 0 20px rgba(122,160,255, 0.1);
}
.salary-main { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.salary-amount-wrap { display: flex; align-items: baseline; }
.salary-amount {
  font-size: 36px; font-weight: 700;
  background: linear-gradient(135deg, #4a7bff, #4a8aff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  line-height: 1; text-shadow: 0 0 16px rgba(122,160,255, 0.4);
}
.salary-unit { font-size: 14px; color: rgba(122,160,255, 0.8); margin-left: 2px; font-weight: 600; }
.salary-level-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 10px;
  background: rgba(122,160,255, 0.18); border: 1px solid rgba(122,160,255, 0.4);
  color: rgba(180, 210, 255, 0.9);
}
.salary-sub { font-size: 11px; color: rgba(220, 240, 235, 0.6); line-height: 1.4; }

.ai-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 18px; }
.metric-card {
  background: linear-gradient(135deg, rgba(74,138,255, 0.1) 0%, rgba(122,160,255, 0.06) 100%);
  border: 1px solid rgba(74,138,255, 0.2); border-radius: 10px; padding: 14px; text-align: center;
}
.metric-num {
  font-size: 22px; font-weight: 700;
  background: linear-gradient(135deg, #4a7bff, #7aa0ff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}
.metric-label { font-size: 12px; color: rgba(220, 240, 235, 0.6); }

.ai-suggestion {
  padding: 12px 14px; background: rgba(74,138,255, 0.08);
  border-left: 3px solid #4a8aff; border-radius: 6px;
  font-size: 12px; line-height: 1.6; color: rgba(220, 240, 235, 0.8);
}

.job-desc {
  padding: 14px 16px; background: rgba(74,138,255, 0.05);
  border: 1px solid rgba(74,138,255, 0.15); border-radius: 10px;
  font-size: 13px; line-height: 1.8; color: rgba(220, 240, 235, 0.88); white-space: pre-wrap;
}
.job-requirements { padding-left: 20px; margin: 0; }
.job-requirements li { font-size: 13px; line-height: 1.9; color: rgba(220, 240, 235, 0.85); }

.recruit-info {
  display: grid; grid-template-columns: 1fr 1fr;
  background: rgba(74,138,255, 0.05); border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(74,138,255, 0.15);
}
.recruit-row { display: flex; padding: 12px 16px; border-bottom: 1px solid rgba(74,138,255, 0.12); border-right: 1px solid rgba(74,138,255, 0.12); }
.recruit-row:nth-child(even) { border-right: none; }
.recruit-row:nth-last-child(-n+2) { border-bottom: none; }
.recruit-key { width: 80px; font-size: 13px; color: rgba(220, 240, 235, 0.5); flex-shrink: 0; }
.recruit-val { font-size: 13px; color: rgba(220, 240, 235, 0.9); }
.highlight-salary { color: #4a8aff; font-weight: 600; }

.detail-actions { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.action-btn {
  padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px;
  border: 1px solid rgba(74,138,255, 0.25); background: rgba(74,138,255, 0.06);
  color: rgba(74,138,255, 0.85);
}
.action-btn:hover {
  background: rgba(74,138,255, 0.15);
  border-color: rgba(74,138,255, 0.55);
  box-shadow: 0 4px 20px rgba(74,138,255, 0.2);
  transform: translateY(-1px);
  color: #4a8aff;
}
.action-btn.ai-resume {
  background: linear-gradient(135deg, rgba(74,138,255, 0.15), rgba(0, 180, 255, 0.1));
  border-color: rgba(74,138,255, 0.5);
  color: #4a8aff;
}
.action-btn.ai-resume:hover {
  box-shadow: 0 4px 22px rgba(74,138,255, 0.35);
}
.action-btn.ai-route {
  background: linear-gradient(135deg, rgba(122,160,255, 0.15), rgba(122,160,255, 0.1));
  border-color: rgba(122,160,255, 0.5);
  color: #7aa0ff;
}
.action-btn.ai-route:hover {
  box-shadow: 0 4px 22px rgba(122,160,255, 0.35);
  color: #7aa0ff;
  border-color: rgba(122,160,255, 0.7);
}

.detail-footer { padding-top: 8px; }
.footer-btn.primary {
  width: 100%; padding: 14px 24px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 10px;
  border: 1px solid rgba(74,138,255, 0.5);
  background: linear-gradient(135deg, rgba(74,138,255, 0.2), rgba(122,160,255, 0.12));
  color: #fff;
  box-shadow: 0 0 20px rgba(74,138,255, 0.25);
}
.footer-btn.primary:hover {
  background: linear-gradient(135deg, rgba(74,138,255, 0.32), rgba(122,160,255, 0.2));
  box-shadow: 0 0 30px rgba(74,138,255, 0.4), 0 0 60px rgba(122,160,255, 0.15);
  transform: translateY(-1px);
}

.my-fav-modal { max-width: 640px; }
.fav-empty { text-align: center; padding: 48px 24px; color: rgba(220, 240, 235, 0.6); }
.fav-empty-icon { font-size: 48px; margin-bottom: 12px; }
.fav-empty-text { font-size: 16px; color: rgba(220, 240, 235, 0.85); margin-bottom: 8px; }
.fav-empty-hint { font-size: 12px; color: rgba(220, 240, 235, 0.5); }
.fav-list { display: flex; flex-direction: column; gap: 10px; }
.fav-item {
  display: flex; justify-content: space-between; align-items: center; padding: 14px 16px;
  background: rgba(74,138,255, 0.06); border: 1px solid rgba(74,138,255, 0.18);
  border-radius: 10px; transition: all 0.25s;
}
.fav-item:hover { background: rgba(74,138,255, 0.12); border-color: rgba(74,138,255, 0.4); box-shadow: 0 0 12px rgba(74,138,255, 0.15); }
.fav-item-main { flex: 1; cursor: pointer; min-width: 0; }
.fav-item-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-item-sub { font-size: 12px; color: rgba(220, 240, 235, 0.6); margin-bottom: 8px; }
.fav-item-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.fav-item-tags .detail-tag { font-size: 11px; padding: 2px 8px; }
.fav-item-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-left: 16px; flex-shrink: 0; }
.fav-match { font-size: 12px; font-weight: 600; color: #7aa0ff; }
.fav-remove { font-size: 12px; padding: 4px 12px; border-radius: 12px; background: rgba(255, 71, 87, 0.1); border: 1px solid rgba(255, 71, 87, 0.3); color: rgba(255, 180, 190, 0.85); cursor: pointer; transition: all 0.2s; }
.fav-remove:hover { background: rgba(255, 71, 87, 0.25); }

/* ===== AI驱动 说明弹窗 ===== */
.ai-info-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 24, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.ai-info-modal {
  width: 560px;
  max-height: 88vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(15, 22, 48, 0.98) 0%, rgba(10, 15, 35, 0.98) 100%);
  border: 1px solid rgba(74,138,255, 0.35);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74,138,255, 0.15);
  position: relative;
  padding: 28px 32px 24px;
  animation: modalIn 0.25s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.ai-info-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(74,138,255, 0.15);
  border-radius: 50%;
  color: rgba(200, 180, 255, 0.85);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}
.ai-info-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.ai-info-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(74,138,255, 0.2);
}
.ai-info-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74,138,255, 0.25), rgba(122,160,255, 0.18));
  border: 1px solid rgba(167, 139, 250, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7aa0ff;
  flex-shrink: 0;
}
.ai-info-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: 0.5px;
}
.ai-info-sub {
  font-size: 12px;
  color: rgba(220, 240, 235, 0.55);
  margin: 0;
}

.ai-info-body { }

.ai-info-section { margin-bottom: 22px; }
.ai-sec-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(220, 230, 255, 0.92);
  margin: 0 0 6px;
  letter-spacing: 0.3px;
}
.ai-sec-desc {
  font-size: 12px;
  color: rgba(220, 240, 235, 0.55);
  line-height: 1.6;
  margin: 0 0 14px;
}

.ai-dim-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ai-dim-card {
  padding: 14px 14px 12px;
  background: rgba(74,138,255, 0.07);
  border: 1px solid rgba(74,138,255, 0.2);
  border-radius: 10px;
  transition: all 0.2s;
}
.ai-dim-card:hover {
  border-color: rgba(167, 139, 250, 0.45);
  background: rgba(74,138,255, 0.12);
}
.ai-dim-num {
  font-size: 10px;
  font-weight: 600;
  color: rgba(167, 139, 250, 0.6);
  letter-spacing: 1px;
  margin-bottom: 6px;
}
.ai-dim-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(220, 230, 255, 0.95);
  margin-bottom: 4px;
}
.ai-dim-desc {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.55);
  line-height: 1.5;
  margin-bottom: 8px;
}
.ai-dim-weight {
  font-size: 10px;
  font-weight: 600;
  color: #7aa0ff;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(74,138,255, 0.15);
  display: inline-block;
}

.ai-source-list { display: flex; flex-direction: column; gap: 8px; }
.ai-source-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  color: rgba(220, 240, 235, 0.7);
  line-height: 1.55;
}
.ai-source-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4a8aff;
  margin-top: 7px;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(74,138,255, 0.5);
}
.ai-source-text { flex: 1; }

.ai-info-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(255, 210, 140, 0.85);
  margin-bottom: 18px;
}
.ai-info-tip.ok {
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.25);
  color: rgba(160, 240, 190, 0.85);
}
.ai-info-tip svg { flex-shrink: 0; }
.ai-info-tip-btn {
  margin-left: auto;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(74,138,255, 0.25);
  border: 1px solid rgba(167, 139, 250, 0.4);
  color: #7aa0ff;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.ai-info-tip-btn:hover {
  background: rgba(74,138,255, 0.4);
  color: #fff;
}

.ai-info-footer-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4a8aff, #4a7bff);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(74,138,255, 0.35);
}
.ai-info-footer-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(74,138,255, 0.5);
}
.ai-info-footer-btn:active { transform: translateY(0); }

/* ===== 联系HR 弹窗 ===== */
.hr-contact-modal { width: 480px; }
.hr-modal-header {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 16px; margin-bottom: 18px;
  border-bottom: 1px solid rgba(74,138,255, 0.2);
}
.hr-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(74,138,255, 0.25), rgba(122,160,255, 0.2));
  border: 1px solid rgba(167, 139, 250, 0.4);
  display: flex; align-items: center; justify-content: center;
  color: #7aa0ff; flex-shrink: 0;
}
.hr-name { font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 4px; }
.hr-job { font-size: 12px; color: rgba(220, 240, 235, 0.55); margin: 0; }

.hr-source-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: rgba(122,160,255, 0.07);
  border: 1px solid rgba(122,160,255, 0.25);
  border-radius: 10px;
  margin-bottom: 18px;
}
.hr-source-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(122,160,255, 0.15);
  display: flex; align-items: center; justify-content: center;
  color: #7dd3fc; flex-shrink: 0;
}
.hr-source-label { font-size: 11px; color: rgba(220, 240, 235, 0.5); margin-bottom: 2px; }
.hr-source-val { font-size: 14px; font-weight: 600; color: rgba(220, 230, 255, 0.95); }

.hr-contact-empty {
  padding: 22px 18px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px dashed rgba(245, 158, 11, 0.35);
  border-radius: 10px;
  text-align: center;
  margin-bottom: 18px;
}
.hr-empty-icon {
  color: rgba(245, 158, 11, 0.6);
  margin-bottom: 10px;
}
.hr-empty-title {
  font-size: 13px; font-weight: 600;
  color: rgba(255, 210, 140, 0.9);
  margin-bottom: 6px;
}
.hr-empty-desc {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.5);
  line-height: 1.7;
}

.hr-jump-hint { padding-top: 4px; }
.hr-jump-label {
  font-size: 12px; color: rgba(220, 240, 235, 0.7);
  margin-bottom: 12px; text-align: center;
}
.hr-jump-actions { display: flex; gap: 10px; }
.hr-jump-btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
  border: 1px solid transparent;
}
.hr-jump-btn.primary {
  background: linear-gradient(135deg, #4a8aff, #4a7bff);
  color: #fff; border: none;
  box-shadow: 0 4px 14px rgba(74,138,255, 0.35);
}
.hr-jump-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(74,138,255, 0.5);
}
.hr-jump-btn.ghost {
  background: transparent;
  border-color: rgba(220, 240, 235, 0.2);
  color: rgba(220, 240, 235, 0.7);
  flex: 0 0 auto;
  padding: 10px 18px;
}
.hr-jump-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(220, 240, 235, 0.35);
  color: rgba(220, 240, 235, 0.9);
}

/* ===== 岗位总结弹窗（新内容） ===== */
.hr-contact-modal { width: 580px; }
.hr-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}
.hr-stat-card {
  padding: 14px;
  background: rgba(74,138,255, 0.07);
  border: 1px solid rgba(74,138,255, 0.18);
  border-radius: 10px;
  text-align: center;
  transition: all 0.2s;
}
.hr-stat-card:hover {
  border-color: rgba(167, 139, 250, 0.4);
  background: rgba(74,138,255, 0.12);
}
.hr-stat-num {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #7aa0ff, #4a7bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}
.hr-stat-label {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.55);
}

.hr-section { margin-bottom: 18px; }

/* 招聘方联系方式 */
.hr-contact-section { margin-bottom: 20px; }
.hr-contact-card {
  background: linear-gradient(135deg, rgba(74,138,255,0.10), rgba(74,138,255,0.04));
  border: 1px solid rgba(74,138,255,0.25);
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 10px;
}
.hr-contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 14px;
}
.hr-contact-icon { font-size: 16px; width: 22px; text-align: center; }
.hr-contact-label { color: rgba(210,225,255,0.6); width: 80px; flex-shrink: 0; }
.hr-contact-value {
  color: #dfe9ff;
  font-weight: 500;
}
.hr-contact-link {
  color: #7aa0ff;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color .2s;
}
.hr-contact-link:hover { color: #a8c5ff; text-decoration: underline; }
.hr-contact-hint {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(74,138,255,0.25);
  color: rgba(210,225,255,0.45);
  font-size: 12px;
  line-height: 1.6;
}
.hr-sec-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(220, 230, 255, 0.9);
  margin: 0 0 10px;
  padding-left: 10px;
  border-left: 2px solid #4a8aff;
}

/* 薪资分位条 */
.hr-percentile-bar { padding: 12px 4px; }
.hr-perc-track {
  position: relative;
  height: 16px;
  background: rgba(100, 110, 140, 0.2);
  border-radius: 8px;
  margin-top: 28px;
}
.hr-perc-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, rgba(122,160,255,0.4), rgba(74,138,255,0.5));
  border-radius: 8px;
}
.hr-perc-p25, .hr-perc-med, .hr-perc-p75 {
  position: absolute;
  top: -28px;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
}
.hr-perc-marker {
  width: 2px;
  height: 36px;
  background: rgba(220, 240, 235, 0.5);
  margin: 0 auto 4px;
}
.hr-perc-label {
  font-size: 10px;
  color: rgba(220, 240, 235, 0.7);
  line-height: 1.3;
}
.hr-perc-med .hr-perc-marker { background: #7aa0ff; }
.hr-perc-med .hr-perc-label { color: #7aa0ff; font-weight: 600; }
.hr-perc-job {
  position: absolute;
  top: -38px;
  transform: translateX(-50%);
  z-index: 2;
}
.hr-perc-job-marker {
  width: 12px;
  height: 12px;
  background: #fbbf24;
  border-radius: 50%;
  margin: 0 auto 6px;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
  border: 2px solid rgba(2, 8, 24, 0.8);
}
.hr-perc-job-label {
  font-size: 10px;
  color: #fbbf24;
  font-weight: 600;
  white-space: nowrap;
}

/* 城市分布/学历分布 条形 */
.hr-city-bars, .hr-edu-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hr-city-row, .hr-edu-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}
.hr-city-name, .hr-edu-name {
  width: 60px;
  flex-shrink: 0;
  color: rgba(220, 230, 255, 0.85);
  font-weight: 500;
}
.hr-city-bar-bg, .hr-edu-bar-bg {
  flex: 1;
  height: 12px;
  background: rgba(100, 110, 140, 0.2);
  border-radius: 6px;
  overflow: hidden;
}
.hr-city-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(74,138,255,0.8), rgba(122,160,255,0.7));
  border-radius: 6px;
  transition: width 0.4s;
}
.hr-edu-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(122,160,255,0.75), rgba(125,211,252,0.6));
  border-radius: 6px;
  transition: width 0.4s;
}
.hr-city-count, .hr-edu-count {
  width: 50px;
  text-align: right;
  color: rgba(220, 240, 235, 0.55);
  font-size: 11px;
}

/* ===== 薪资分析弹窗 ===== */
.salary-modal { width: 600px; }
.salary-chart-wrap {
  background: rgba(10, 15, 35, 0.6);
  border: 1px solid rgba(122,160,255, 0.2);
  border-radius: 10px;
  padding: 14px 14px 8px;
  margin-bottom: 18px;
}
.salary-chart { width: 100%; height: 210px; display: block; }

.salary-compare {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px;
  background: rgba(122,160,255, 0.06);
  border: 1px solid rgba(122,160,255, 0.18);
  border-radius: 10px;
  margin-bottom: 18px;
}
.salary-cmp-item {
  flex: 1;
  text-align: center;
}
.salary-cmp-val {
  font-size: 20px;
  font-weight: 700;
  color: #7aa0ff;
  margin-bottom: 2px;
}
.salary-cmp-val span {
  font-size: 12px;
  font-weight: 500;
  color: rgba(196, 181, 253, 0.6);
}
.salary-cmp-label {
  font-size: 10px;
  color: rgba(220, 240, 235, 0.5);
}
.salary-cmp-arrow {
  padding: 0 2px;
}

/* 收藏时间显示 */
.fav-item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}
.fav-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(74,138,255, 0.75);
}
.fav-time svg { color: rgba(74,138,255, 0.55); }

/* ===== AI简历优化弹窗 ===== */
.ai-resume-modal { max-width: 640px; }
.ai-route-modal { max-width: 700px; }

.ai-empty-prompt {
  text-align: center;
  padding: 48px 24px;
  color: rgba(220, 240, 235, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.ai-empty-prompt svg {
  color: rgba(74,138,255, 0.5);
}
.ai-empty-prompt p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
}

.ai-summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
.ai-summary-card {
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74,138,255, 0.08), rgba(0, 180, 255, 0.05));
  border: 1px solid rgba(74,138,255, 0.25);
  text-align: center;
  transition: all 0.2s;
}
.ai-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74,138,255, 0.15);
}
.ai-summary-card.warn {
  background: linear-gradient(135deg, rgba(122,160,255, 0.08), rgba(122,160,255, 0.05));
  border-color: rgba(122,160,255, 0.3);
}
.ai-num {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a8aff, #4a7bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}
.ai-summary-card.warn .ai-num {
  background: linear-gradient(135deg, #7aa0ff, #4a7bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ai-label {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.55);
}

.ai-section { margin-bottom: 20px; }
.ai-sec-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(220, 240, 235, 0.9);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4a8aff;
  box-shadow: 0 0 6px rgba(74,138,255, 0.6);
}
.ai-dot.warn {
  background: #4a7bff;
  box-shadow: 0 0 6px rgba(122,160,255, 0.6);
}

.ai-skill-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ai-skill-item {
  display: grid;
  grid-template-columns: 1fr 110px auto;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
}
.ai-skill-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.ai-add-btn {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  background: rgba(122, 160, 255, 0.15);
  border: 1px solid rgba(122, 160, 255, 0.45);
  color: #7aa0ff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}
.ai-add-btn:hover {
  background: rgba(122, 160, 255, 0.3);
  color: #fff;
  box-shadow: 0 0 10px rgba(122, 160, 255, 0.4);
  transform: translateY(-1px);
}
.ai-skill-item.missing {
  background: rgba(122,160,255, 0.05);
  border: 1px solid rgba(122,160,255, 0.15);
}
.ai-skill-item.ok {
  background: rgba(74,138,255, 0.05);
  border: 1px solid rgba(74,138,255, 0.15);
}
.ai-skill-name {
  font-weight: 500;
  color: rgba(220, 240, 235, 0.9);
}
.ai-skill-item.missing .ai-skill-name { color: #7aa0ff; }
.ai-skill-bar-bg {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}
.ai-skill-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}
.ai-skill-bar-fill.ok {
  background: linear-gradient(90deg, #4a8aff, #00b4ff);
}
.ai-skill-bar-fill.missing {
  background: linear-gradient(90deg, #4a7bff, #7aa0ff);
}
.ai-skill-pct {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.5);
  white-space: nowrap;
}

/* ===== AI求职路线弹窗 ===== */
.route-section { margin-bottom: 20px; }
.route-chain {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.route-node {
  display: grid;
  grid-template-columns: 36px 1fr 24px;
  gap: 14px;
  align-items: center;
  padding: 12px 10px;
  border-radius: 10px;
  background: rgba(74,138,255, 0.04);
  border: 1px solid rgba(74,138,255, 0.15);
  transition: all 0.25s;
  position: relative;
}
.route-node:hover {
  background: rgba(74,138,255, 0.08);
  border-color: rgba(74,138,255, 0.35);
  transform: translateX(4px);
}
.route-node.fallback {
  background: rgba(122,160,255, 0.04);
  border-color: rgba(122,160,255, 0.18);
}
.route-node.fallback:hover {
  background: rgba(122,160,255, 0.09);
  border-color: rgba(122,160,255, 0.35);
}
.route-node-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a8aff, #00b4ff);
  color: #060812;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 0 12px rgba(74,138,255, 0.4);
  flex-shrink: 0;
}
.route-node.fallback .route-node-circle {
  background: linear-gradient(135deg, #4a7bff, #7aa0ff);
  color: #1a0f00;
  box-shadow: 0 0 12px rgba(122,160,255, 0.4);
}
.route-node-info {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 14px;
  align-items: center;
}
.route-node-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(220, 240, 235, 0.95);
}
.route-node-desc {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.45);
}
.route-node-salary {
  font-size: 16px;
  font-weight: 700;
  color: #4a8aff;
  text-align: right;
}
.route-node.fallback .route-node-salary { color: #7aa0ff; }
.route-na {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.4);
  font-weight: 400;
}
.route-node-count {
  font-size: 11px;
  color: rgba(220, 240, 235, 0.45);
}
.route-node-arrow {
  color: rgba(74,138,255, 0.5);
}
/* 用户定位卡 */
.route-user-loc {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(74,138,255,0.15), rgba(122,160,255,0.06));
  border: 1px solid rgba(74,138,255,0.3);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.route-user-loc::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #7aa0ff, #4a8aff);
}
.loc-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: rgba(74,138,255,0.2);
  border: 1px solid rgba(122,160,255,0.5);
  display: flex; align-items: center; justify-content: center;
  color: #7aa0ff;
  flex-shrink: 0;
}
.loc-info { flex: 1; min-width: 0; }
.loc-title { font-size: 11px; color: rgba(210,225,255,0.5); margin-bottom: 2px; }
.loc-stage { font-size: 16px; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px; }
.loc-desc { font-size: 12px; color: rgba(210,225,255,0.55); font-weight: 400; }
.loc-hint { font-size: 11px; color: rgba(210,225,255,0.35); margin-top: 3px; }
.loc-arrow { color: rgba(74,138,255,0.6); }

/* 当前阶段高亮 */
.route-node-current {
  position: relative;
}
.route-node-current::before {
  content: '';
  position: absolute;
  left: -10px; right: -10px; top: -4px; bottom: -4px;
  background: rgba(74,138,255,0.08);
  border: 1px dashed rgba(122,160,255,0.4);
  border-radius: 8px;
  pointer-events: none;
}
.route-node-me {
  position: absolute;
  top: -6px; right: -6px;
  font-size: 9px;
  background: #4a8aff;
  color: #fff;
  padding: 1px 4px;
  border-radius: 6px;
  font-weight: 600;
  line-height: 1;
}
/* 节点颜色圈 */
.route-node-circle {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 14px;
  flex-shrink: 0;
  position: relative;
}
/* 关键技能标签 */
.route-node-skills {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.route-skills-label {
  font-size: 11px;
  color: rgba(210,225,255,0.4);
}
.route-skill-tag {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 9px;
  background: rgba(74,138,255,0.15);
  border: 1px solid rgba(74,138,255,0.3);
  color: #b8c8ff;
  line-height: 1.5;
}

.ai-cta-btn.outline {
  background: transparent;
}
/* AI简历优化 闭环引导 */
.ai-cta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(74,138,255, 0.2);
  flex-wrap: wrap;
}
.ai-cta-label {
  font-size: 12px;
  color: rgba(220, 240, 235, 0.5);
  flex-shrink: 0;
}
.ai-cta-btn {
  font-size: 12px;
  padding: 7px 16px;
  border-radius: 14px;
  background: rgba(74, 138, 255, 0.12);
  border: 1px solid rgba(74, 138, 255, 0.35);
  color: #b8c8ff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.ai-cta-btn:hover:not(:disabled) {
  background: rgba(74, 138, 255, 0.25);
  color: #fff;
  box-shadow: 0 0 14px rgba(74, 138, 255, 0.4);
  transform: translateY(-1px);
}
.ai-cta-btn.primary {
  background: linear-gradient(135deg, rgba(74,138,255,0.3), rgba(122,160,255,0.3));
  border-color: rgba(122, 160, 255, 0.6);
  color: #fff;
  box-shadow: 0 0 12px rgba(74, 138, 255, 0.35);
}
.ai-cta-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(74,138,255,0.5), rgba(122,160,255,0.5));
  box-shadow: 0 0 20px rgba(122, 160, 255, 0.55);
}
.ai-cta-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
