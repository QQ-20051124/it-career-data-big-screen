<template>
  <div class="job-recommend-page" ref="pageRef" @mousemove="handleMouseMove">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
    <!-- 星云背景层 -->
    <div class="nebula-bg">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
    </div>
    
    <!-- 动态光带 -->
    <div class="light-ribbons">
      <div class="ribbon ribbon-1"></div>
      <div class="ribbon ribbon-2"></div>
      <div class="ribbon ribbon-3"></div>
    </div>
    
    <div class="bg-hex-grid"></div>
    <div class="bg-cursor-glow" :style="{ transform: `translate(${mouseX}px, ${mouseY}px)`, opacity: cursorOpacity }"></div>
    <div class="bg-edge-glow edge-tl"></div>
    <div class="bg-edge-glow edge-tr"></div>
    <div class="bg-edge-glow edge-bl"></div>
    <div class="bg-edge-glow edge-br"></div>
    <div class="bg-fluid-edge fluid-bottom"></div>
    <div class="bg-fluid-edge fluid-left"></div>
    <div class="bg-fluid-edge fluid-right"></div>
    
    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>返回</span>
      </button>
      <div class="title-area">
        <span class="page-title">智能岗位推荐</span>
        <span class="ai-badge" @click="showAIExplanation = true" title="查看AI推荐说明">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07C9.4 9.58 8 7.95 8 6a4 4 0 0 1 4-4z"/>
          </svg>
          AI驱动
        </span>
      </div>
      <div class="top-bar-right">
        <span class="data-update-notice">📊 岗位数据每日凌晨自动爬取更新</span>
        <div class="favorites-wrapper" @mouseenter="onFavPreviewEnter" @mouseleave="onFavPreviewLeave">
          <button class="favorites-btn" @click="openFavoritesModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span>我的收藏</span>
            <span class="favorites-badge" v-if="favorites.length > 0">{{ favorites.length }}</span>
          </button>
          <transition name="fav-fade">
            <div class="fav-preview-popup" v-if="showFavPreview && favorites.length > 0" @mouseenter="onFavPreviewEnter" @mouseleave="onFavPreviewLeave">
            <div class="fav-preview-header">
              <span>我的收藏 ({{ favorites.length }})</span>
              <span class="fav-preview-view-all" @click.stop="openFavoritesModal">查看全部</span>
            </div>
            <div class="fav-preview-list">
              <div class="fav-preview-item" v-for="(job, i) in favorites.slice(0, 4)" :key="i" @click.stop="handleFavItemClick(job)">
                <span class="fav-preview-title">{{ job.job_name }}</span>
                <span class="fav-preview-salary">{{ formatSalary(job.salary_avg) }}</span>
                <svg class="fav-preview-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
            <div class="fav-preview-more" v-if="favorites.length > 4" @click.stop="openFavoritesModal">查看全部 {{ favorites.length }} 个收藏 →</div>
            </div>
          </transition>
        </div>
        <div class="loading-indicator" v-if="loading">
          <svg class="loading-icon" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="50" class="spin"/>
          </svg>
          <span>加载中...</span>
        </div>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input-wrapper" :class="{ focused: searchFocused }">
        <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
          <line x1="21" y1="21" x2="16" y2="16" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
        </svg>
        <input type="text" v-model="searchKeyword" placeholder="搜索岗位、公司、技能关键词" class="search-input" 
               @keyup.enter="handleSearch" @focus="searchFocused = true" @blur="searchFocused = false"
               @input="handleSearchInput"/>
        <div class="hot-tags" v-if="!searchKeyword && !searchFocused">
          <span class="hot-tag-label">热搜:</span>
          <span class="hot-tag" v-for="(tag, i) in hotTags" :key="i" 
                @click="quickSearch(tag)"
                @mouseenter="hoverHotTag(tag)"
                @mouseleave="clearHotTagHover">{{ tag }}</span>
        </div>
        <div class="suggestions-dropdown" v-if="searchSuggestions.length > 0 && searchFocused">
          <div class="suggestion-item" v-for="(sug, i) in searchSuggestions" :key="i" 
               @mousedown="selectSuggestion(sug)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16" y2="16"/>
            </svg>
            <span>{{ sug }}</span>
          </div>
        </div>
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <div class="category-tabs-wrapper">
      <div class="category-tabs">
        <div 
          v-for="(tab, index) in categories" 
          :key="index" 
          class="tab-item"
          :class="{ active: activeCategory === index }"
          @click="activeCategory = index; handleSearch()"
        >
          {{ tab }}
          <span class="tab-glow-line" v-if="activeCategory === index"></span>
        </div>
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
          <div class="sort-controls">
            <span class="sort-label">排序:</span>
            <div class="sort-btn" :class="{ active: sortBy === 'match' }" @click="setSortBy('match')">
              <svg v-if="sortBy === 'match'" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              匹配度
            </div>
            <div class="sort-btn" :class="{ active: sortBy === 'salary' }" @click="setSortBy('salary')">
              <svg v-if="sortBy === 'salary'" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 1C5.92 1 1 5.92 1 12s4.92 11 11 11 11-4.92 11-11S18.08 1 12 1zm1 17h-2v-1.5c-1.44-.34-2.5-1.31-2.5-2.5h2c0 .41.34.75.75.75h1.5c.41 0 .75-.34.75-.75 0-.42-.34-.75-.75-.75H10c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5V7h2v1.5c1.44.34 2.5 1.31 2.5 2.5h-2c0-.41-.34-.75-.75-.75h-1.5c-.41 0-.75.34-.75.75s.34.75.75.75h2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5V18z"/></svg>
              薪资
            </div>
            <div class="sort-btn" :class="{ active: sortBy === 'city' }" @click="setSortBy('city')">
              <svg v-if="sortBy === 'city'" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              就近{{ userLocationCity ? `(${userLocationCity})` : '' }}
            </div>
            <div class="city-picker-wrap" v-if="(sortBy === 'city' && !userLocationCity) || locationStatus === 'denied'">
              <select v-model="tempCity" @change="applyUserCity" class="city-picker">
                <option value="">选择你的城市</option>
                <option v-for="city in topCities" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>
          </div>
          <span class="result-count">共 {{ totalResults }} 个岗位</span>
        </div>

        <div class="batch-toolbar" v-if="jobList.length > 0">
          <label class="select-all-label">
            <input type="checkbox" v-model="selectAllVisible" @change="toggleSelectAllVisible" class="batch-checkbox"/>
            全选当前页
          </label>
          <span class="selected-count" v-if="selectedJobs.length > 0">已选 {{ selectedJobs.length }} 个</span>
          <div class="batch-actions" v-if="selectedJobs.length > 0">
            <button class="batch-btn" @click="batchFavorite" :disabled="isGuest">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              批量收藏
            </button>
            <button class="batch-btn compare" @click="openCompareSidebar">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 3v18M15 3v18"/></svg>
              对比 ({{ selectedJobs.length }})
            </button>
          </div>
          <button class="clear-selection-btn" v-if="selectedJobs.length > 0" @click="clearSelection">清空选择</button>
        </div>

        <div class="active-filters" v-if="activeFilterTags.length > 0">
          <span class="active-filters-label">已选筛选:</span>
          <span class="filter-tag" v-for="(tag, i) in activeFilterTags" :key="i" @click="removeFilterTag(tag)">
            {{ tag.label }}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
          <span class="filter-tag clear-all" @click="resetFilters">清空全部</span>
        </div>

        <div class="job-cards" v-if="jobList.length > 0">
          <div class="job-card" v-for="(job, index) in jobList" :key="index" 
               :class="{ 'is-selected': selectedJobs.some(s => s.job_name === job.job_name && s.company === job.company) }"
               @click="openJobDetail(job)">
            <div class="job-card-glow"></div>
            <div class="card-top-glow"></div>
            <div class="card-select" @click.stop="toggleJobSelection(job)">
              <span class="select-box" :class="{ checked: selectedJobs.some(s => s.job_name === job.job_name && s.company === job.company) }"></span>
            </div>
            <div class="job-status-badge" v-if="getApplicationStatus(job)" :class="getApplicationStatus(job)">
              {{ statusLabels[getApplicationStatus(job)] }}
            </div>
            <div class="job-header">
              <div class="job-title">{{ job.job_name }}</div>
              <div class="job-salary">{{ formatSalary(job.salary_avg) }}</div>
            </div>
            <div class="job-company-row">
              <span class="job-company">{{ getJobCompany(job) }}</span>
              <span class="job-match-score" :class="matchLevel(job)" v-if="hasUserResume()">
                <span class="score-bar">
                  <span class="score-fill" :style="{ width: getDisplayScore(job) + '%' }"></span>
                </span>
                <span class="score-text">{{ getDisplayScore(job) }}%</span>
              </span>
              <span class="job-match-score no-resume" v-else @click="goToResume">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                <span class="score-text">完善简历</span>
              </span>
            </div>
            <div class="match-basis" v-if="hasUserResume()">
              匹配依据：根据您的简历技能 + 学历智能计算
            </div>
            <div class="match-basis no-resume-hint" v-else>
              完善简历后可查看真实匹配度
            </div>
            <div class="job-info-row">
              <span class="info-chip">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {{ job.city }}
              </span>
              <span class="info-chip tiny" v-if="job.education">
                {{ job.education }}
              </span>
              <span class="info-chip tiny" v-if="job.work_exp">
                {{ job.work_exp }}
              </span>
            </div>
            <div class="job-tags-row">
              <span v-for="(tag, tIndex) in getJobTags(job)" :key="'s'+tIndex" class="skill-tag">{{ tag }}</span>
              <span v-for="(tag, tIndex) in getWelfareTags(job)" :key="'w'+tIndex" class="welfare-badge">{{ tag }}</span>
            </div>
            <div class="job-source-tag" v-if="job.data_source">
              数据来源：{{ job.data_source }}
            </div>
            <div class="card-actions" @click.stop>
              <button class="card-action-btn" :class="{ favorited: isFavorited(job) }" @click.stop="toggleFavorite(job)">
                <svg v-if="!isFavorited(job)" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <span>{{ isFavorited(job) ? '已收藏' : '收藏岗位' }}</span>
              </button>
              <button class="card-action-btn view-btn" @click.stop="openJobDetail(job)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>查看详情</span>
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else-if="!loading">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p>暂无匹配的岗位</p>
          <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
        </div>
        <div class="lazy-load-indicator" v-if="loading && jobList.length > 0">
          <svg class="loading-icon" viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="50" class="spin"/>
          </svg>
          <span>加载中...</span>
        </div>
        <div class="no-more-indicator" v-if="currentPage >= totalPages && totalPages > 1 && !loading">
          <span>— 已加载全部岗位 —</span>
        </div>
      </div>

      <div class="filter-section" :class="{ sticky: filterSticky }">
        <div class="section-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <circle cx="12" cy="12" r="3" fill="#4a9eff"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="#4a9eff" stroke-width="2"/>
            </svg>
          </div>
          <span>筛选条件</span>
        </div>

        <div class="filter-group">
          <div class="filter-label">学历要求</div>
          <div class="filter-options">
            <div 
              v-for="option in educationOptions" 
              :key="option"
              class="filter-option"
              :class="{ active: selectedEducation.includes(option) }"
              @click="toggleEducation(option)"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">工作经验</div>
          <div class="filter-options">
            <div 
              v-for="option in experienceOptions" 
              :key="option"
              class="filter-option"
              :class="{ active: selectedExperience.includes(option) }"
              @click="toggleExperience(option)"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">薪资范围 (K)</div>
          <div class="salary-range">
            <div class="salary-inputs">
              <input type="number" v-model.number="minSalary" min="0" max="100" class="salary-input" @change="handleSalaryInput"/>
              <span class="salary-sep">-</span>
              <input type="number" v-model.number="maxSalary" min="1" max="200" class="salary-input" @change="handleSalaryInput"/>
            </div>
            <div class="salary-sliders">
              <input type="range" v-model="minSalary" min="0" max="100" step="5" class="range-input" @change="handleSalaryInput"/>
              <input type="range" v-model="maxSalary" min="5" max="200" step="5" class="range-input" @change="handleSalaryInput"/>
            </div>
            <span class="range-value">{{ minSalary }}K - {{ maxSalary }}K</span>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">就业城市</div>
          <div class="filter-options scrollable">
            <div 
              v-for="option in cityOptions" 
              :key="option"
              class="filter-option"
              :class="{ active: selectedCities.includes(option) }"
              @click="toggleCity(option)"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <button class="apply-filter-btn" @click="handleSearch">应用筛选</button>
      </div>
    </div>

    <Transition name="modal">
      <div class="modal-overlay" v-if="showAIExplanation" @click="showAIExplanation = false">
        <div class="modal-content ai-explanation" @click.stop>
          <button class="modal-close" @click="showAIExplanation = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="ai-explanation-header">
            <div class="ai-header-glow"></div>
            <div class="ai-icon-wrapper">
              <svg class="ai-icon-svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07C9.4 9.58 8 7.95 8 6a4 4 0 0 1 4-4z"/>
              </svg>
              <div class="ai-icon-ring"></div>
            </div>
            <h2>AI智能推荐引擎</h2>
            <p class="ai-subtitle">通过四大维度智能分析算法，为您精准匹配最合适的岗位</p>
          </div>
          <div class="ai-explanation-body">
            <div class="ai-dimension-card skills-dim">
              <div class="dim-header">
                <div class="dim-icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h4>技能匹配度</h4>
              </div>
              <p class="dim-desc">分析岗位要求技能与您掌握技能的重合度，核心技能匹配加权更高</p>
              <div class="dim-weight">
                <span class="weight-label">权重</span>
                <span class="weight-value">35%</span>
                <div class="weight-bar"><div class="weight-progress" style="width: 35%"></div></div>
              </div>
            </div>
            <div class="ai-dimension-card salary-dim">
              <div class="dim-header">
                <div class="dim-icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h4>薪资期望匹配</h4>
              </div>
              <p class="dim-desc">对比岗位薪资范围与您的期望薪资，提供最具性价比的选择</p>
              <div class="dim-weight">
                <span class="weight-label">权重</span>
                <span class="weight-value">25%</span>
                <div class="weight-bar"><div class="weight-progress" style="width: 25%"></div></div>
              </div>
            </div>
            <div class="ai-dimension-card city-dim">
              <div class="dim-header">
                <div class="dim-icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h4>城市偏好匹配</h4>
              </div>
              <p class="dim-desc">优先推荐您目标城市的岗位，减少不必要的通勤成本</p>
              <div class="dim-weight">
                <span class="weight-label">权重</span>
                <span class="weight-value">20%</span>
                <div class="weight-bar"><div class="weight-progress" style="width: 20%"></div></div>
              </div>
            </div>
            <div class="ai-dimension-card exp-dim">
              <div class="dim-header">
                <div class="dim-icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h4>经验学历匹配</h4>
              </div>
              <p class="dim-desc">综合评估您的工作年限与学历，确保岗位要求与您的资质相符</p>
              <div class="dim-weight">
                <span class="weight-label">权重</span>
                <span class="weight-value">20%</span>
                <div class="weight-bar"><div class="weight-progress" style="width: 20%"></div></div>
              </div>
            </div>
          </div>
          <div class="ai-explanation-footer">
            <button class="ai-confirm-btn" @click="showAIExplanation = false">
              <span>了解了</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="modal-overlay" v-if="showDetailModal" @click="closeJobDetail">
        <div class="modal-content detail-modal" @click.stop>
          <button class="modal-close" @click="closeJobDetail">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="modal-header">
            <h2>{{ selectedJob?.job_name }}</h2>
            <div class="modal-tags">
              <span v-for="(tag, tIndex) in getJobTags(selectedJob)" :key="tIndex" class="modal-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="modal-body">
            <div class="ai-analysis-card" v-if="selectedJob && aiAnalysis">
              <div class="ai-analysis-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00d4aa" stroke-width="2">
                  <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07C9.4 9.58 8 7.95 8 6a4 4 0 0 1 4-4z"/>
                </svg>
                <span>AI智能分析</span>
                <span class="resume-tag" :class="{ 'has-resume': aiAnalysis.hasResume, 'no-resume': !aiAnalysis.hasResume }">
                  {{ aiAnalysis.hasResume ? '基于您的简历' : '请先完善简历' }}
                </span>
              </div>
              <div class="ai-analysis-content">
                <div class="match-summary">
                  <div class="match-circle" :class="matchLevel(selectedJob)" :style="getMatchCircleStyle(selectedJob)">
                    <template v-if="hasUserResume()">
                      <span class="pct">{{ getDisplayScore(selectedJob) }}</span>
                      <span class="pct-label">匹配度</span>
                    </template>
                    <template v-else>
                      <span class="pct-resume" @click="goToResume">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </span>
                      <span class="pct-label" @click="goToResume">点击完善简历</span>
                    </template>
                  </div>
                  <div class="match-details">
                    <div class="match-item" v-if="aiAnalysis.hasResume && aiAnalysis.matchedSkills.length > 0">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#00d4aa" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>您掌握的技能匹配: {{ aiAnalysis.matchedSkills.join('、') }}</span>
                    </div>
                    <div class="match-item" v-if="aiAnalysis.hasResume && aiAnalysis.missingSkills.length > 0">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span>待补充技能: {{ aiAnalysis.missingSkills.join('、') }}</span>
                    </div>
                    <div class="match-item" v-if="aiAnalysis.skillKeywords.length > 0 && !aiAnalysis.hasResume">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#00d4aa" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      <span>岗位技能要求: {{ aiAnalysis.skillKeywords.join('、') }}</span>
                    </div>
                    <div class="match-item">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a9eff" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{{ aiAnalysis.cityMatchAnalysis }}</span>
                    </div>
                    <div class="match-item">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9a75ff" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      <span>{{ aiAnalysis.eduMatchAnalysis }}</span>
                    </div>
                    <div class="match-item" v-if="aiAnalysis.exp">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>经验要求: {{ aiAnalysis.exp }} - {{ aiAnalysis.expAnalysis }}</span>
                    </div>
                  </div>
                </div>
                <div class="ai-salary-section">
                  <div class="salary-card">
                    <div class="salary-icon">💰</div>
                    <div class="salary-info">
                      <span class="salary-value">{{ aiAnalysis.salary > 0 ? (aiAnalysis.salary / 1000).toFixed(0) + 'K' : '面议' }}</span>
                      <span class="salary-level" :class="'level-' + aiAnalysis.salaryLevel">{{ aiAnalysis.salaryLevel }}</span>
                      <span class="salary-desc">{{ aiAnalysis.salaryAnalysis }}</span>
                    </div>
                  </div>
                </div>
                <div class="ai-suggestion" v-if="aiAnalysis.suggestions.length > 0">
                  <h5>💡 岗位分析建议</h5>
                  <ul>
                    <li v-for="(sug, i) in aiAnalysis.suggestions" :key="i">{{ sug }}</li>
                  </ul>
                </div>
                <div class="ai-stats-row">
                  <div class="ai-stat">
                    <span class="stat-value">{{ aiAnalysis.hasResume ? aiAnalysis.matchedSkillCount + '/' + aiAnalysis.skillCount : aiAnalysis.skillCount }}</span>
                    <span class="stat-label">{{ aiAnalysis.hasResume ? '技能匹配数' : '核心技能数' }}</span>
                  </div>
                  <div class="ai-stat">
                    <span class="stat-value">{{ aiAnalysis.salaryLevel }}</span>
                    <span class="stat-label">薪资水平</span>
                  </div>
                  <div class="ai-stat">
                    <span class="stat-value">{{ aiAnalysis.cityLevel }}</span>
                    <span class="stat-label">城市等级</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">公司名称</span>
                <span class="detail-value">{{ getJobCompany(selectedJob) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">工作城市</span>
                <span class="detail-value">{{ selectedJob?.city }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">薪资待遇</span>
                <span class="detail-value salary">{{ formatSalary(selectedJob?.salary_avg) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">学历要求</span>
                <span class="detail-value">{{ selectedJob?.education || '不限' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">工作经验</span>
                <span class="detail-value">{{ selectedJob?.work_exp || '不限' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">数据来源</span>
                <span class="detail-value">{{ selectedJob?.data_source || '智联招聘' }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h3>岗位描述</h3>
              <p class="job-description">
                该岗位主要负责{{ selectedJob?.job_name }}相关工作，需要具备扎实的专业技能和良好的沟通能力。岗位职责包括但不限于：系统开发与维护、技术方案设计、团队协作等。
              </p>
            </div>
            <div class="detail-section">
              <h3>任职要求</h3>
              <ul class="requirement-list">
                <li>具备相关专业学历背景</li>
                <li>有相关工作经验者优先</li>
                <li>熟悉主流开发技术和工具</li>
                <li>良好的团队协作和沟通能力</li>
                <li>有较强的学习能力和问题解决能力</li>
              </ul>
            </div>
            <div class="detail-section company-info-section" v-if="selectedJob">
              <h3>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a9eff" stroke-width="2" style="vertical-align: -3px; margin-right: 6px;">
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>
                </svg>
                招聘企业信息
              </h3>
              <div class="company-info-grid">
                <div class="company-info-item">
                  <span class="ci-label">公司名称</span>
                  <span class="ci-value">{{ getJobCompany(selectedJob) }}</span>
                </div>
                <div class="company-info-item">
                  <span class="ci-label">行业领域</span>
                  <span class="ci-value">{{ getIndustry(selectedJob) }}</span>
                </div>
                <div class="company-info-item">
                  <span class="ci-label">企业规模</span>
                  <span class="ci-value">{{ getCompanySize(selectedJob) }}</span>
                </div>
                <div class="company-info-item">
                  <span class="ci-label">企业类型</span>
                  <span class="ci-value company-type" :class="getCompanyTypeClass(selectedJob)">{{ getCompanyType(selectedJob) }}</span>
                </div>
                <div class="company-info-item full">
                  <span class="ci-label">公司地址</span>
                  <span class="ci-value">{{ selectedJob?.city || '暂无' }}</span>
                </div>
                <div class="company-info-item full">
                  <span class="ci-label">企业简介</span>
                  <span class="ci-value brief">{{ getCompanyBrief(selectedJob) }}</span>
                </div>
              </div>
            </div>
            <div class="detail-section trend-section" v-if="selectedJob">
              <h3>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00d4aa" stroke-width="2" style="vertical-align: -3px; margin-right: 6px;">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
                岗位热度分析（近30天）
              </h3>
              <div class="trend-chart-container">
                <canvas ref="trendChartCanvas" class="trend-canvas"></canvas>
                <div class="trend-stats">
                  <div class="trend-stat">
                    <span class="trend-value">{{ selectedJob?.city || '-' }} · {{ getSameCityCount(selectedJob?.city) }} 条</span>
                    <span class="trend-label">同城市岗位</span>
                  </div>
                  <div class="trend-stat">
                    <span class="trend-value">{{ getPublishTrend(selectedJob) >= 0 ? '+' : '' }}{{ getPublishTrend(selectedJob) }}%</span>
                    <span class="trend-label">行业薪资环比</span>
                  </div>
                  <div class="trend-stat">
                    <span class="trend-value">{{ formatSalary(getAvgSalaryForCity(selectedJob?.city)) }}</span>
                    <span class="trend-label">同城市平均薪资</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          <div class="modal-footer">
            <button class="trend-btn" @click="showTrendModal = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              薪资趋势
            </button>
            <button class="career-path-btn" @click="generateCareerPath">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              AI求职路线
            </button>
            <button class="ai-resume-btn" @click="optimizeResume">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              AI优化简历
            </button>
            <button class="save-btn" :class="{ favorited: isFavorited(selectedJob) }" @click="toggleFavorite(selectedJob)">
              <svg v-if="!isFavorited(selectedJob)" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              {{ isFavorited(selectedJob) ? '已收藏' : '收藏岗位' }}
            </button>
          </div>
        </div>
      </div>

    <div class="modal-overlay" v-if="showFavoritesModal" @click="closeFavoritesModal">
      <div class="modal-content favorites-modal" @click.stop>
          <button class="modal-close" @click="closeFavoritesModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="modal-header">
            <h2>我的收藏</h2>
            <div class="favorites-count-header">共 {{ favorites.length }} 个岗位</div>
          </div>
          <div class="modal-body favorites-body">
            <div class="favorites-list" v-if="favorites.length > 0">
              <div class="favorite-item" v-for="(job, index) in favorites" :key="index">
                <div class="favorite-main" @click="openJobDetailFromFavorites(job)">
                  <div class="favorite-header-row">
                    <div class="favorite-title">{{ job.job_name }}</div>
                    <div class="favorite-salary">{{ formatSalary(job.salary_avg) }}</div>
                  </div>
                  <div class="favorite-sub-row">
                    <span class="favorite-company">{{ job.company }}</span>
                    <span class="favorite-divider">·</span>
                    <span class="favorite-city">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ job.city }}
                    </span>
                    <span class="favorite-divider" v-if="job.education">·</span>
                    <span class="favorite-edu-exp" v-if="job.education || job.work_exp">
                      {{ job.education || '不限学历' }} · {{ job.work_exp || '不限经验' }}
                    </span>
                  </div>
                  <div class="favorite-tags-row" v-if="getJobTags(job).length > 0">
                    <span class="fav-tag" v-for="(tag, tIdx) in getJobTags(job).slice(0, 4)" :key="tIdx">{{ tag }}</span>
                  </div>
                  <div class="favorite-footer-row">
                    <span class="favorite-time">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {{ formatFavoriteTime(job.favoriteTime) }}收藏
                    </span>
                    <span class="favorite-match" v-if="job.matchScore">
                      <span class="match-bar-mini">
                        <span class="match-fill" :style="{width: job.matchScore + '%'}"></span>
                      </span>
                      {{ job.matchScore }}%匹配
                    </span>
                  </div>
                </div>
                <div class="favorite-actions">
                  <button class="action-btn detail-btn" @click.stop="openJobDetailFromFavorites(job)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    查看详情
                  </button>
                  <button class="action-btn contact-btn" @click.stop="openContactModalFromFavorites(job)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    联系HR
                  </button>
                  <button class="action-btn unfavorite-btn" @click.stop="removeFavorite(job)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    取消收藏
                  </button>
                </div>
              </div>
            </div>
            <div class="empty-state" v-else>
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <p>暂无收藏的岗位</p>
            </div>
          </div>
        </div>
      </div>

    <Transition name="modal">
      <div class="modal-overlay" v-if="showContactModal" @click="closeContactModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeContactModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="modal-header">
            <h2>联系HR</h2>
            <div class="modal-tags">
                  <span class="modal-tag">{{ selectedContactJob?.company }}</span>
                  <span class="modal-tag">{{ selectedContactJob?.job_name }}</span>
                </div>
          </div>
          <div class="modal-body">
            <div class="contact-info">
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9eff" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div class="contact-detail">
                  <span class="contact-label">联系电话</span>
                  <span class="contact-value">{{ generateContactInfo(selectedContactJob).phone }}</span>
                </div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9eff" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <div class="contact-detail">
                  <span class="contact-label">邮箱地址</span>
                  <span class="contact-value">{{ generateContactInfo(selectedContactJob).email }}</span>
                </div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9eff" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="contact-detail">
                  <span class="contact-label">工作地点</span>
                  <span class="contact-value">{{ selectedContactJob?.city }}</span>
                </div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9eff" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <div class="contact-detail">
                  <span class="contact-label">HR姓名</span>
                  <span class="contact-value">{{ generateContactInfo(selectedContactJob).name }}</span>
                </div>
              </div>
            </div>
            <div class="contact-tips">
              <h3>温馨提示</h3>
              <ul>
                <li>建议在工作时间（9:00-18:00）联系</li>
                <li>邮件标题请注明：姓名-应聘岗位</li>
                <li>如有简历请一并附件发送</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="compare">
      <div class="compare-overlay" v-if="showCompare" @click="showCompare = false">
        <div class="compare-sidebar" @click.stop>
          <div class="compare-header">
            <h3>岗位对比</h3>
            <button class="modal-close" @click="showCompare = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="compare-body">
            <div class="compare-table" v-if="compareList.length > 0">
              <div class="compare-row compare-header-row">
                <div class="compare-cell label">对比项</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">
                  {{ job.job_name }}
                </div>
              </div>
              <div class="compare-row">
                <div class="compare-cell label">公司</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">{{ job.company }}</div>
              </div>
              <div class="compare-row">
                <div class="compare-cell label">城市</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">{{ job.city }}</div>
              </div>
              <div class="compare-row highlight">
                <div class="compare-cell label">薪资</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">{{ formatSalary(job.salary_avg) }}</div>
              </div>
              <div class="compare-row">
                <div class="compare-cell label">学历</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">{{ job.education || '不限' }}</div>
              </div>
              <div class="compare-row">
                <div class="compare-cell label">经验</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">{{ job.work_exp || '不限' }}</div>
              </div>
              <div class="compare-row highlight">
                <div class="compare-cell label">匹配度</div>
                <div class="compare-cell match" v-for="(job, i) in compareList" :key="i">
                  <span class="match-val">{{ getDisplayScore(job) }}%</span>
                </div>
              </div>
              <div class="compare-row">
                <div class="compare-cell label">技能标签</div>
                <div class="compare-cell" v-for="(job, i) in compareList" :key="i">{{ getJobTags(job).join(', ') }}</div>
              </div>
            </div>
            <div class="empty-state" v-else>
              <p>请选择2-4个岗位进行对比</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div class="modal-overlay" v-if="showTrendModal" @click="showTrendModal = false">
        <div class="modal-content trend-modal" @click.stop>
          <button class="modal-close" @click="showTrendModal = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="trend-header">
            <h2>{{ selectedJob?.job_name }} - 薪资趋势</h2>
            <p class="trend-subtitle">近12个月薪资走势 (单位: K)</p>
          </div>
          <div class="trend-chart-container">
            <svg viewBox="0 0 600 250" class="trend-chart">
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:rgba(74,158,255,0.4);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:rgba(74,158,255,0);stop-opacity:0" />
                </linearGradient>
              </defs>
              <line x1="40" y1="20" x2="40" y2="210" stroke="rgba(74,158,255,0.2)" stroke-width="1"/>
              <line x1="40" y1="210" x2="580" y2="210" stroke="rgba(74,158,255,0.2)" stroke-width="1"/>
              <g class="grid-lines">
                <line x1="40" y1="60" x2="580" y2="60" stroke="rgba(74,158,255,0.08)" stroke-width="1" stroke-dasharray="4"/>
                <line x1="40" y1="100" x2="580" y2="100" stroke="rgba(74,158,255,0.08)" stroke-width="1" stroke-dasharray="4"/>
                <line x1="40" y1="140" x2="580" y2="140" stroke="rgba(74,158,255,0.08)" stroke-width="1" stroke-dasharray="4"/>
                <line x1="40" y1="180" x2="580" y2="180" stroke="rgba(74,158,255,0.08)" stroke-width="1" stroke-dasharray="4"/>
              </g>
              <g class="y-axis-labels">
                <text v-for="i in 5" :key="'y'+i" :x="35" :y="210 - (i-1)*40 + 4" text-anchor="end" fill="rgba(150,180,220,0.5)" font-size="10">{{ Math.round((trendDataMax - (i-1)*(trendDataMax-trendDataMin)/4) * 10) / 10 }}K</text>
              </g>
              <path :d="trendAreaPath" fill="url(#trendGradient)"/>
              <path :d="trendLinePath" fill="none" stroke="#4a9eff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <g class="data-points">
                <circle v-for="(d, i) in trendData" :key="'pt'+i" :cx="40 + (i * 540 / 11)" :cy="210 - ((d.salary - trendDataMin) / (trendDataMax - trendDataMin || 1)) * 190" r="4" fill="#4a9eff" stroke="#0a1628" stroke-width="2"/>
              </g>
              <g class="x-axis-labels">
                <text v-for="(d, i) in trendData" :key="'x'+i" :x="40 + (i * 540 / 11)" :y="225" text-anchor="middle" fill="rgba(150,180,220,0.5)" font-size="9">{{ d.month.slice(5) }}</text>
              </g>
            </svg>
          </div>
          <div class="trend-stats">
            <div class="trend-stat">
              <span class="stat-label">当前薪资</span>
              <span class="stat-value">{{ trendData[trendData.length - 1]?.salary || 0 }}K</span>
            </div>
            <div class="trend-stat">
              <span class="stat-label">最高薪资</span>
              <span class="stat-value highlight">{{ trendDataMax }}K</span>
            </div>
            <div class="trend-stat">
              <span class="stat-label">最低薪资</span>
              <span class="stat-value">{{ trendDataMin }}K</span>
            </div>
            <div class="trend-stat">
              <span class="stat-label">趋势</span>
              <span class="stat-value" :class="trendTrendClass">{{ trendTrend }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div class="modal-overlay" v-if="showCareerPathModal" @click="showCareerPathModal = false">
        <div class="modal-content career-path-modal" @click.stop>
          <button class="modal-close" @click="showCareerPathModal = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="career-path-header">
            <h2>🤖 AI智能求职路线</h2>
            <p class="career-path-subtitle">为 "{{ selectedJob?.job_name }}" 定制的学习路径</p>
          </div>
          <div class="career-path-body">
            <div class="path-timeline">
              <div class="path-step" v-for="(step, i) in careerPathData" :key="i">
                <div class="step-connector" v-if="i > 0"></div>
                <div class="step-circle">{{ step.step }}</div>
                <div class="step-content">
                  <div class="step-header">
                    <span class="step-title">{{ step.title }}</span>
                    <span class="step-duration">{{ step.duration }}</span>
                  </div>
                  <ul class="step-items">
                    <li v-for="(item, j) in step.items" :key="j">{{ item }}</li>
                  </ul>
                  <div class="step-tech" v-if="step.tech.length > 0">
                    <span class="tech-label">核心技术:</span>
                    <span class="tech-tag" v-for="(t, k) in step.tech" :key="k">{{ t }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="path-actions">
              <button class="path-action-btn primary" @click="showToast('已保存学习计划')">保存计划</button>
              <button class="path-action-btn" @click="showToast('已分享路线')">分享路线</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div class="toast" v-if="showToastFlag" :class="toastType">
        <div class="toast-icon" v-if="toastType === 'success'">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="toast-icon" v-else>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="toast-content">{{ toastMessage }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const goBack = () => {
  document.body.style.overflow = ''
  router.push('/dashboard')
}

const goToResume = () => {
  document.body.style.overflow = ''
  router.push('/ai-resume')
}

const searchKeyword = ref('')
const searchFocused = ref(false)
const searchSuggestions = ref([])
const activeCategory = ref(0)
const loading = ref(false)
const jobList = ref([])
const totalResults = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 20
const sortBy = ref('')
const userLocationCity = ref('')
const locationStatus = ref('idle')
const CITY_LATLNG = {
  '北京': [39.9042, 116.4074], '上海': [31.2304, 121.4737], '广州': [23.1291, 113.2644],
  '深圳': [22.5431, 114.0579], '杭州': [30.2741, 120.1551], '成都': [30.5728, 104.0668],
  '武汉': [30.5928, 114.3055], '西安': [34.3416, 108.9398], '南京': [32.0603, 118.7969],
  '重庆': [29.5630, 106.5516], '天津': [39.3434, 117.3616], '苏州': [31.2990, 120.5853],
  '青岛': [36.0671, 120.3826], '长沙': [28.2282, 112.9388], '郑州': [34.7466, 113.6254],
  '厦门': [24.4798, 118.0894], '福州': [26.0745, 119.2965], '合肥': [31.8206, 117.2272],
  '宁波': [29.8683, 121.5440], '无锡': [31.4912, 120.3119], '大连': [38.9140, 121.6147],
  '沈阳': [41.8057, 123.4315], '哈尔滨': [45.8038, 126.5349], '长春': [43.8171, 125.3235],
  '济南': [36.6512, 117.1201], '昆明': [25.0389, 102.7183], '贵阳': [26.6470, 106.6302],
  '南宁': [22.8170, 108.3669], '海口': [20.0440, 110.1999], '兰州': [36.0611, 103.8343],
  '乌鲁木齐': [43.8256, 87.6168], '拉萨': [29.6520, 91.1721], '银川': [38.4872, 106.2309],
  '西宁': [36.6171, 101.7782], '呼和浩特': [40.8414, 111.7490], '太原': [37.8706, 112.5489],
  '石家庄': [38.0428, 114.5149], '南昌': [28.6820, 115.8579], '珠海': [22.2707, 113.5767],
  '佛山': [23.0218, 113.1219], '东莞': [23.0489, 113.7447], '中山': [22.5171, 113.3925],
  '惠州': [23.1115, 114.4152], '江门': [22.5787, 113.0818], '汕头': [23.3535, 116.6820],
  '桂林': [25.2736, 110.2907], '柳州': [24.3264, 109.4115], '三亚': [18.2479, 109.5108],
  '嘉兴': [30.7463, 120.7556], '温州': [27.9939, 120.6994], '湖州': [30.8945, 120.0883],
  '绍兴': [30.0000, 120.5833], '金华': [29.0788, 119.6495], '台州': [28.6560, 121.4208],
  '常州': [31.7733, 119.5797], '徐州': [34.2615, 117.1847], '南通': [31.9800, 120.8647],
  '扬州': [32.3936, 119.4129], '镇江': [32.1882, 119.4253], '泰州': [32.4553, 119.9230],
  '盐城': [33.3478, 120.1616], '淮安': [33.5514, 119.0130], '连云港': [34.5968, 119.2217],
  '德州': [37.4354, 116.3689], '聊城': [36.4564, 115.9857], '济宁': [35.4146, 116.5873],
  '淄博': [36.8131, 118.0548], '潍坊': [36.7167, 119.1684], '烟台': [37.4638, 121.4479],
  '威海': [37.5131, 122.1200], '临沂': [35.1041, 118.3563], '菏泽': [35.2333, 115.4807],
  '洛阳': [34.6197, 112.4540], '开封': [34.7971, 114.3599], '南阳': [32.9905, 112.5283],
  '信阳': [32.1264, 114.0664], '商丘': [34.4142, 115.6616], '郑州': [34.7466, 113.6254],
  '大庆': [46.5907, 125.1039], '吉林': [43.8431, 126.5497], '鞍山': [41.1087, 122.9957],
  '赣州': [25.8310, 114.9333], '九江': [29.7050, 116.0019], '绵阳': [31.4676, 104.6780],
  '德阳': [31.1279, 104.3981], '乐山': [29.5521, 103.7660], '宜宾': [28.7723, 104.6417],
  '泸州': [28.8717, 105.4416], '南充': [30.7953, 106.0807], '遵义': [27.7254, 106.9273],
  '曲靖': [25.4890, 103.7956], '宝鸡': [34.3617, 107.2373], '咸阳': [34.3296, 108.7089],
  '延安': [36.5853, 109.4898], '榆林': [38.2854, 109.7348], '酒泉': [39.7426, 98.4941],
  '天水': [34.5809, 105.7249], '赤峰': [42.2635, 118.8870], '包头': [40.6571, 109.8403],
  '香港': [22.3193, 114.1694], '澳门': [22.1987, 113.5439]
}
const CITIES_BY_PROXIMITY = {}
Object.entries(CITY_LATLNG).forEach(([city, [lat, lng]]) => {
  CITIES_BY_PROXIMITY[city] = { lat, lng }
})
const findNearestCity = (lat, lng) => {
  let nearest = null
  let minDist = Infinity
  for (const [name, coords] of Object.entries(CITY_LATLNG)) {
    const dLat = (lat - coords[0]) * Math.PI / 180
    const dLng = (lng - coords[1]) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(coords[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const dist = 6371 * c
    if (dist < minDist) { minDist = dist; nearest = name }
  }
  return nearest
}
const detectUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = findNearestCity(pos.coords.latitude, pos.coords.longitude)
        if (city) {
          userLocationCity.value = city
          locationStatus.value = 'found'
          if (sortBy.value === 'city') {
            handleSearch()
          }
        }
      },
      () => {
        locationStatus.value = 'denied'
        const saved = localStorage.getItem('userPreferredCity')
        if (saved) userLocationCity.value = saved
      },
      { timeout: 5000 }
    )
  } else {
    locationStatus.value = 'unsupported'
  }
}
const selectAllVisible = ref(false)
const selectedJobs = ref([])
const filterSticky = ref(false)
const tempCity = ref('')
const topCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '天津', '苏州', '青岛', '长沙', '郑州', '厦门', '福州', '合肥', '宁波', '无锡', '大连', '沈阳', '哈尔滨', '济南', '昆明', '南宁', '兰州', '南昌', '珠海', '佛山', '东莞', '桂林', '三亚', '温州', '合肥', '长沙']
const applyUserCity = () => {
  if (tempCity.value) {
    userLocationCity.value = tempCity.value
    localStorage.setItem('userPreferredCity', tempCity.value)
    locationStatus.value = 'manual'
    handleSearch()
  }
}
const mouseX = ref(-500)
const mouseY = ref(-500)
const cursorOpacity = ref(0)
let mouseThrottleTimer = null
let mouseIdleTimer = null
const handleMouseMove = (e) => {
  if (mouseThrottleTimer) return
  mouseThrottleTimer = requestAnimationFrame(() => {
    mouseX.value = e.clientX
    mouseY.value = e.clientY
    cursorOpacity.value = 1
    mouseThrottleTimer = null
    if (mouseIdleTimer) clearTimeout(mouseIdleTimer)
    mouseIdleTimer = setTimeout(() => {
      cursorOpacity.value = 0
    }, 400)
  })
}

const hotTags = ['前端', '运维', 'AI算法', 'Java', 'Python', '大数据', '云计算', '产品经理']

const categories = ref(['全部岗位', '高匹配优先', '高薪岗位', '低竞争岗位', '短期实习', '开发工程师', '运维支持', '教育培训', '人工智能', '应届生校招', '国企央企'])
const educationOptions = ref([])
const experienceOptions = ref([])
const cityOptions = ref([])

const selectedEducation = ref([])
const selectedExperience = ref([])
const selectedCities = ref([])
const showDetailModal = ref(false)
const selectedJob = ref(null)
const favorites = ref([])
const isCurrentFavorited = ref(false)
const updateCurrentFavStatus = () => {
  if (!selectedJob.value) {
    isCurrentFavorited.value = false
    return
  }
  isCurrentFavorited.value = favorites.value.some(f => 
    f.job_name === selectedJob.value.job_name && f.company === selectedJob.value.company
  )
}
const showContactModal = ref(false)
const showFavoritesModal = ref(false)
const favoritesDetailPending = ref(null)
const selectedContactJob = ref(null)
const showAIExplanation = ref(false)
const showCompare = ref(false)
const compareList = ref([])
const applicationTracker = ref({})
const showFavPreview = ref(false)
const favPreviewTimer = ref(null)
const FAV_PREVIEW_DELAY = 600

const onFavPreviewEnter = () => {
  if (favPreviewTimer.value) {
    clearTimeout(favPreviewTimer.value)
    favPreviewTimer.value = null
  }
  showFavPreview.value = true
}

const onFavPreviewLeave = () => {
  if (favPreviewTimer.value) {
    clearTimeout(favPreviewTimer.value)
  }
  favPreviewTimer.value = setTimeout(() => {
    showFavPreview.value = false
    favPreviewTimer.value = null
  }, FAV_PREVIEW_DELAY)
}
const applicationRecords = ref([])
const showTrendModal = ref(false)
const showCareerPathModal = ref(false)

const isGuest = computed(() => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn')
  return !isLoggedIn
})

const statusLabels = {
  applied: '已投递',
  viewed: '已查看',
  interview: '面试邀约',
  rejected: '已拒绝'
}

const activeFilterTags = computed(() => {
  const tags = []
  selectedEducation.value.forEach(e => tags.push({ key: 'edu', value: e, label: `学历: ${e}` }))
  selectedExperience.value.forEach(e => tags.push({ key: 'exp', value: e, label: `经验: ${e}` }))
  selectedCities.value.forEach(c => tags.push({ key: 'city', value: c, label: `城市: ${c}` }))
  if (minSalary.value > 0) tags.push({ key: 'minSalary', value: minSalary.value, label: `最低: ${minSalary.value}K` })
  if (maxSalary.value < 200 && maxSalary.value > 50) tags.push({ key: 'maxSalary', value: maxSalary.value, label: `最高: ${maxSalary.value}K` })
  return tags
})

const cityTierMap = {
  '北京': 1, '上海': 1, '深圳': 1, '广州': 1, '杭州': 1,
  '成都': 2, '武汉': 2, '南京': 2, '西安': 2, '重庆': 2, '天津': 2, '苏州': 2,
  '长沙': 3, '青岛': 3, '厦门': 3, '郑州': 3, '福州': 3, '济南': 3, '合肥': 3
}

const aiAnalysis = computed(() => {
  const job = selectedJob.value
  if (!job) return null

  const userResume = getUserResumeData()
  const jobText = (job.job_name || '').toLowerCase()
  
  // 基于岗位名称提取真实技能需求
  const skillKeywords = []
  if (jobText.includes('java')) skillKeywords.push('Java')
  if (jobText.includes('python')) skillKeywords.push('Python')
  if (jobText.includes('c++') || jobText.includes('c/c++')) skillKeywords.push('C/C++')
  if (jobText.includes('js') || jobText.includes('javascript')) skillKeywords.push('JavaScript')
  if (jobText.includes('前端') || jobText.includes('vue') || jobText.includes('react')) skillKeywords.push('前端开发')
  if (jobText.includes('后端') || jobText.includes('服务端') || jobText.includes('server')) skillKeywords.push('后端开发')
  if (jobText.includes('算法') || jobText.includes('ai') || jobText.includes('人工智能')) skillKeywords.push('算法/AI')
  if (jobText.includes('测试') || jobText.includes('qa')) skillKeywords.push('软件测试')
  if (jobText.includes('运维') || jobText.includes('devops')) skillKeywords.push('运维')
  if (jobText.includes('大数据') || jobText.includes('spark') || jobText.includes('hadoop')) skillKeywords.push('大数据')
  if (jobText.includes('云计算') || jobText.includes('cloud')) skillKeywords.push('云计算')
  if (jobText.includes('嵌入式')) skillKeywords.push('嵌入式开发')
  if (jobText.includes('网络') || jobText.includes('安全')) skillKeywords.push('网络安全')
  if (jobText.includes('数据库') || jobText.includes('mysql')) skillKeywords.push('数据库')
  const tags = getJobTags(job)
  tags.forEach(t => {
    if (!skillKeywords.includes(t)) skillKeywords.push(t)
  })

  // 基于真实薪资数据分析薪资水平
  const salary = job.salary_avg || 0
  let salaryLevel = '待分析'
  let salaryAnalysis = ''
  if (salary >= 30000) {
    salaryLevel = '高薪'
    salaryAnalysis = '薪资处于行业高位，竞争激烈但回报丰厚'
  } else if (salary >= 20000) {
    salaryLevel = '较高'
    salaryAnalysis = '薪资处于中上水平，具有较好的竞争力'
  } else if (salary >= 10000) {
    salaryLevel = '中等'
    salaryAnalysis = '薪资处于中等水平，符合行业平均'
  } else if (salary > 0) {
    salaryLevel = '偏低'
    salaryAnalysis = '薪资相对较低，建议关注其他福利'
  } else {
    salaryLevel = '面议'
    salaryAnalysis = '薪资面议，建议面试时沟通'
  }

  // 基于真实城市数据分析城市等级
  const city = job.city || ''
  const cityTier = cityTierMap[city] || 4
  let cityLevel = '其他城市'
  if (cityTier === 1) cityLevel = '一线城市'
  else if (cityTier === 2) cityLevel = '新一线城市'
  else if (cityTier === 3) cityLevel = '二线城市'
  else if (cityTier === 4 && city) cityLevel = '其他城市'
  else cityLevel = '未知'

  // 基于真实学历要求分析门槛
  const edu = job.education || ''
  let eduAnalysis = ''
  if (edu.includes('不限')) {
    eduAnalysis = '学历要求宽松，无硬性门槛'
  } else if (edu.includes('大专') || edu.includes('专科')) {
    eduAnalysis = '大专及以上学历，门槛较低'
  } else if (edu.includes('本科')) {
    eduAnalysis = '本科学历要求，为IT行业主流门槛'
  } else if (edu.includes('硕士') || edu.includes('研究生')) {
    eduAnalysis = '硕士学历要求，门槛较高'
  } else if (edu.includes('博士')) {
    eduAnalysis = '博士学历要求，门槛很高'
  } else {
    eduAnalysis = '学历要求待确认'
  }

  // 基于工作经验分析
  const exp = job.work_exp || ''
  let expAnalysis = ''
  if (exp.includes('不限') || exp.includes('应届')) {
    expAnalysis = '经验要求宽松，应届生可投'
  } else if (exp.includes('1-3') || exp.includes('1年') || exp.includes('2年')) {
    expAnalysis = '需1-3年工作经验'
  } else if (exp.includes('3-5') || exp.includes('3年') || exp.includes('4年') || exp.includes('5年')) {
    expAnalysis = '需3-5年工作经验'
  } else if (exp.includes('5-10') || exp.includes('5年以上')) {
    expAnalysis = '需5年以上资深经验'
  } else {
    expAnalysis = '经验要求待确认'
  }

  // 基于用户简历数据生成真实匹配分析
  const userSkills = userResume?.skills || []
  const userEdu = userResume?.education || ''
  const userCity = userResume?.residence || ''
  const userExp = userResume?.experience || ''
  
  const matchedUserSkills = skillKeywords.filter(sk => 
    userSkills.some(us => us.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(us.toLowerCase()))
  )
  
  const missingSkills = skillKeywords.filter(sk => !matchedUserSkills.includes(sk))
  
  let eduMatchAnalysis = ''
  if (userResume && userEdu) {
    const eduLevel = { '不限': 0, '大专': 1, '本科': 2, '硕士': 3, '博士': 4 }
    const jobLevel = eduLevel[edu] || 0
    const userLevel = eduLevel[userEdu] || 0
    if (jobLevel === 0) {
      eduMatchAnalysis = `您的${userEdu}学历，岗位不限学历要求`
    } else if (userLevel >= jobLevel) {
      eduMatchAnalysis = `您的${userEdu}学历符合岗位${edu}要求`
    } else {
      eduMatchAnalysis = `您的${userEdu}学历低于岗位${edu}要求，需提升学历`
    }
  } else {
    eduMatchAnalysis = `${edu}学历要求`
  }
  
  let cityMatchAnalysis = ''
  if (userResume && userCity) {
    if (userCity.includes(city) || city.includes(userCity)) {
      cityMatchAnalysis = `岗位城市${city}与您的居住地${userCity}匹配`
    } else {
      cityMatchAnalysis = `岗位城市${city}，您的居住地${userCity}，注意地域差异`
    }
  } else {
    cityMatchAnalysis = `${city}（${cityLevel}）`
  }

  // 基于真实数据生成建议
  const suggestions = []
  if (salary >= 25000) suggestions.push('高薪岗位，建议重点准备技术面试和项目经验')
  if (cityTier <= 2) suggestions.push(`${city}${cityLevel}，就业机会多但竞争也大`)
  if (edu.includes('硕士') || edu.includes('博士')) suggestions.push('学历门槛较高，需确保学历符合要求')
  if (!exp.includes('不限') && !exp.includes('应届')) suggestions.push('有经验要求，面试时需重点展示过往项目经历')
  const welfareTags = getWelfareTags(job)
  if (welfareTags.length > 0) suggestions.push(`包含${welfareTags.join('、')}等福利，综合待遇不错`)
  
  if (userResume && userSkills.length > 0) {
    if (matchedUserSkills.length > 0) {
      suggestions.push(`您已掌握${matchedUserSkills.join('、')}等相关技能，具备岗位基础要求`)
    }
    if (missingSkills.length > 0 && missingSkills.length <= 3) {
      suggestions.push(`建议补充学习${missingSkills.join('、')}技能以提升匹配度`)
    }
    if (!userCity && city) {
      suggestions.push(`岗位位于${city}，请确认工作地点是否符合预期`)
    }
  } else {
    suggestions.push('完善简历信息后可获得更精准的匹配分析')
    suggestions.push('建议仔细阅读岗位描述，了解具体要求')
  }
  
  if (suggestions.length === 0) suggestions.push('建议仔细阅读岗位描述，了解具体要求')

  return {
    skillCount: skillKeywords.length,
    skillKeywords: skillKeywords.slice(0, 6),
    matchedSkillCount: matchedUserSkills.length,
    matchedSkills: matchedUserSkills,
    missingSkills: missingSkills.slice(0, 5),
    hasResume: !!(userResume && userResume.skills && userResume.skills.length > 0),
    salaryLevel,
    salaryAnalysis,
    salary,
    cityLevel,
    city,
    eduAnalysis,
    edu,
    eduMatchAnalysis,
    expAnalysis,
    exp,
    userExp,
    cityMatchAnalysis,
    suggestions
  }
})

const getDisplayScore = (job) => {
  if (!job) return null
  // 当用户有简历时，优先使用前端计算的匹配度
  if (hasUserResume()) {
    const frontScore = getMatchScore(job)
    return frontScore
  }
  // 没有简历时，使用后端的通用匹配度
  return job.matchScore || null
}

const matchLevel = (job) => {
  const score = getDisplayScore(job)
  if (score === null || score === undefined) return 'none'
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

const getMatchCircleStyle = (job) => {
  const score = getDisplayScore(job)
  if (score === null || score === undefined) {
    return {
      background: 'conic-gradient(rgba(150,150,150,0.3) 0deg, rgba(150,150,150,0.3) 360deg)'
    }
  }
  const deg = Math.round((score / 100) * 360)
  let color = '#00d4aa'
  if (score < 60) color = '#fb923c'
  else if (score < 80) color = '#4a9eff'
  return {
    background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, rgba(74,158,255,0.12) ${deg}deg)`
  }
}

const loadFavorites = () => {
  const saved = localStorage.getItem('jobFavorites')
  if (saved) favorites.value = JSON.parse(saved)
}

const saveFavorites = () => {
  localStorage.setItem('jobFavorites', JSON.stringify(favorites.value))
}

const loadApplications = () => {
  const saved = localStorage.getItem('jobApplications')
  if (saved) {
    try {
      applicationRecords.value = JSON.parse(saved)
    } catch (e) {
      applicationRecords.value = []
    }
  }
}

const saveApplications = () => {
  localStorage.setItem('jobApplications', JSON.stringify(applicationRecords.value))
}

const updateApplicationStatus = (job, status) => {
  if (isGuest.value) {
    showToast('请先登录后再操作', 'warning')
    return
  }
  const existingIndex = applicationRecords.value.findIndex(
    r => r.job_name === job.job_name && r.company === job.company
  )
  if (existingIndex > -1) {
    applicationRecords.value[existingIndex].status = status
    applicationRecords.value[existingIndex].appliedAt = new Date().toISOString()
  } else {
    applicationRecords.value.push({
      job_name: job.job_name,
      company: job.company,
      status,
      appliedAt: new Date().toISOString()
    })
  }
  saveApplications()
  showToast(`已更新为"${statusLabels[status]}"`)
}

const getApplicationStatus = (job) => {
  if (!job) return null
  const record = applicationRecords.value.find(
    r => r.job_name === job.job_name && r.company === job.company
  )
  return record ? record.status : null
}

const loadFilterState = () => {
  const saved = localStorage.getItem('jobFilterState')
  if (saved) {
    try {
      const state = JSON.parse(saved)
      searchKeyword.value = state.searchKeyword || ''
      activeCategory.value = state.activeCategory || 0
      selectedEducation.value = state.selectedEducation || []
      selectedExperience.value = state.selectedExperience || []
      selectedCities.value = state.selectedCities || []
      minSalary.value = state.minSalary ?? 0
      maxSalary.value = state.maxSalary ?? 50
      sortBy.value = state.sortBy || ''
    } catch (e) {}
  }
  const savedCity = localStorage.getItem('userPreferredCity')
  if (savedCity) {
    userLocationCity.value = savedCity
    locationStatus.value = 'manual'
  }
}

const saveFilterState = () => {
  const state = {
    searchKeyword: searchKeyword.value,
    activeCategory: activeCategory.value,
    selectedEducation: selectedEducation.value,
    selectedExperience: selectedExperience.value,
    selectedCities: selectedCities.value,
    minSalary: minSalary.value,
    maxSalary: maxSalary.value,
    sortBy: sortBy.value
  }
  localStorage.setItem('jobFilterState', JSON.stringify(state))
}

const isFavorited = (job) => {
  if (!job) return false
  return favorites.value.some(f => f.job_name === job.job_name && f.company === job.company)
}

const toggleFavorite = (job) => {
  if (isGuest.value) {
    showToast('请先登录后再收藏岗位', 'warning')
    return
  }
  if (!job) return
  const index = favorites.value.findIndex(f => f.job_name === job.job_name && f.company === job.company)
  if (index > -1) {
    favorites.value = favorites.value.filter((_, i) => i !== index)
    showToast('已取消收藏', 'warning')
  } else {
    favorites.value = [...favorites.value, { ...job, favoriteTime: new Date().toISOString() }]
    showToast('收藏成功')
  }
  saveFavorites()
}

const openJobDetail = (job) => {
  selectedJob.value = job
  updateCurrentFavStatus()
  showDetailModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeJobDetail = () => {
  showDetailModal.value = false
  selectedJob.value = null
  document.body.style.overflow = ''
}

const openContactModal = () => {
  selectedContactJob.value = selectedJob.value
  showContactModal.value = true
}

const closeContactModal = () => {
  showContactModal.value = false
  selectedContactJob.value = null
}

const openFavoritesModal = () => { showFavoritesModal.value = true }
const closeFavoritesModal = () => { showFavoritesModal.value = false }

const openJobDetailFromFavorites = (job) => {
  showFavoritesModal.value = false
  favoritesDetailPending.value = job
  setTimeout(() => {
    if (favoritesDetailPending.value) {
      const jobToShow = favoritesDetailPending.value
      favoritesDetailPending.value = null
      openJobDetail(jobToShow)
    }
  }, 50)
}

const handleFavItemClick = (job) => {
  if (favPreviewTimer.value) {
    clearTimeout(favPreviewTimer.value)
    favPreviewTimer.value = null
  }
  showFavPreview.value = false
  openJobDetail(job)
}

const openContactModalFromFavorites = (job) => {
  showFavoritesModal.value = false
  selectedContactJob.value = job
  showContactModal.value = true
}

const formatFavoriteTime = (timeStr) => {
  if (!timeStr) return '未知'
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const removeFavorite = (job) => {
  const index = favorites.value.findIndex(f => f.job_name === job.job_name && f.company === job.company)
  if (index > -1) {
    favorites.value.splice(index, 1)
    saveFavorites()
    showToast('已取消收藏', 'warning')
  }
}

const minSalary = ref(0)
const maxSalary = ref(50)

const formatSalary = (salary) => {
  if (!salary) return '面议'
  return `${(salary / 1000).toFixed(0)}K`
}

const getSameCityCount = (city) => {
  if (!city) return 0
  return jobList.value.filter(j => j.city === city).length
}

const getAvgSalaryForCity = (city) => {
  if (!city) return 0
  const cityJobs = jobList.value.filter(j => j.city === city)
  if (cityJobs.length === 0) return 0
  const total = cityJobs.reduce((sum, j) => sum + (j.salary_avg || 0), 0)
  return Math.round(total / cityJobs.length)
}

const getPublishTrend = (job) => {
  if (!job) return 0
  const industry = getIndustry(job)
  const industryJobs = jobList.value.filter(j => getIndustry(j) === industry)
  if (industryJobs.length < 3) return 5
  const avgSalary = industryJobs.reduce((sum, j) => sum + (j.salary_avg || 0), 0) / industryJobs.length
  if ((job.salary_avg || 0) > avgSalary * 1.2) return 12
  if ((job.salary_avg || 0) > avgSalary) return 7
  if ((job.salary_avg || 0) < avgSalary * 0.8) return -3
  return 4
}

const getJobCompany = (job) => {
  const raw = job?.company || ''
  if (!raw || raw.includes('立即投递') || raw === '未知企业') {
    const source = job?.data_source || '网络'
    return `${source}招聘`
  }
  return raw
}

const getJobTags = (job) => {
  const tags = []
  const keywords = {
    'Java': ['java', '后端'],
    'Python': ['python', '数据', '算法'],
    '前端': ['前端', 'react', 'vue', 'angular'],
    'AI': ['人工智能', '算法', '机器学习', '深度学习'],
    '测试': ['测试', 'qa'],
    '运维': ['运维', 'devops', 'linux'],
    '安全': ['安全', '渗透'],
    '产品': ['产品', 'pm'],
    '设计': ['设计', 'ui', 'ux'],
    '大数据': ['大数据', 'spark', 'hadoop'],
    '计算机': ['计算机', '编程', '开发'],
    '老师': ['老师', '教师', '讲师'],
    '硬件': ['硬件', '维护']
  }
  const jobText = (job.job_name || '').toLowerCase()
  for (const [tag, kws] of Object.entries(keywords)) {
    if (kws.some(kw => jobText.includes(kw))) tags.push(tag)
  }
  if (tags.length === 0) tags.push('IT相关')
  return tags.slice(0, 3)
}

const getWelfareTags = (job) => {
  const tags = []
  const text = (job.job_name || '') + (job.company || '')
  if (text.includes('应届') || text.includes('校招') || text.includes('往届')) tags.push('应届生')
  if (text.includes('五险一金') || text.includes('六险')) tags.push('五险一金')
  if (text.includes('包吃住') || text.includes('包吃') || text.includes('包住')) tags.push('包吃住')
  if (text.includes('弹性') || text.includes('双休') || text.includes('不加班')) tags.push('弹性工作')
  if (text.includes('年底') || text.includes('年终奖')) tags.push('年终奖')
  if (text.includes('三方') || text.includes('实习')) tags.push('可签三方')
  if (text.includes('免费') || text.includes('提供')) tags.push('免费提供')
  return tags.slice(0, 3)
}

const getUserResumeData = () => {
  try {
    const saved = localStorage.getItem('resumeData')
    if (!saved) return null
    return JSON.parse(saved)
  } catch (e) {
    return null
  }
}

const hasUserResume = () => {
  const userResume = getUserResumeData()
  return !!(userResume && userResume.skills && userResume.skills.length > 0)
}

const getMatchScore = (job) => {
  if (!job) return null
  
  const userResume = getUserResumeData()
  if (!userResume || !userResume.skills || userResume.skills.length === 0) {
    return null
  }
  
  const jobText = (job.job_name || '').toLowerCase()
  let score = 0
  
  const userSkills = (userResume.skills || []).map(s => s.toLowerCase())
  
  // 技能匹配 - 60分（核心维度）
  const jobSkillKeywords = ['java', 'python', 'c++', 'c/c++', 'js', 'javascript', 
    '前端', 'vue', 'react', '后端', '服务端', '算法', 'ai', '人工智能', 
    '测试', 'qa', '运维', 'devops', '大数据', 'spark', 'hadoop', 
    '云计算', 'cloud', '嵌入式', '网络', '安全', '数据库', 'mysql']
  
  const jobHasSkills = jobSkillKeywords.filter(kw => jobText.includes(kw))
  const matchedSkills = jobHasSkills.filter(kw => 
    userSkills.some(us => us.includes(kw) || kw.includes(us))
  )
  
  // 计算技能匹配率
  let skillScore = 0
  if (jobHasSkills.length > 0) {
    const matchRate = matchedSkills.length / jobHasSkills.length
    skillScore = Math.round(matchRate * 60)
  }
  // 即使岗位没有明确技能关键词，如果岗位名称包含"开发"等通用词，也给基础分
  if (skillScore === 0 && (jobText.includes('开发') || jobText.includes('工程师') || jobText.includes('技术'))) {
    // 检查用户技能是否为通用IT技能
    const itSkills = ['java', 'python', '前端', '后端', '开发', '工程师', '编程']
    const hasITSkills = userSkills.some(us => itSkills.some(s => us.includes(s)))
    if (hasITSkills) {
      skillScore = 15 // 基础分，表示技能相关但不完全匹配
    }
  }
  score += skillScore
  
  // 学历匹配 - 10分
  const jobEdu = job.education || ''
  const userEdu = userResume.education || ''
  const eduLevel = { '不限': 0, '大专': 1, '本科': 2, '硕士': 3, '博士': 4 }
  const jobEduLevel = eduLevel[jobEdu] || 0
  const userEduLevel = eduLevel[userEdu] || 0
  if (jobEduLevel === 0) score += 8
  else if (userEduLevel >= jobEduLevel) score += 10
  else if (userEduLevel >= jobEduLevel - 1) score += 5
  else score += 0
  
  // 城市匹配 - 10分
  if (userResume.residence && job.city) {
    if (userResume.residence.includes(job.city) || job.city.includes(userResume.residence)) {
      score += 10
    } else {
      score += 2 // 不同城市只有少量基础分
    }
  } else {
    score += 5
  }
  
  // 经验匹配 - 10分
  const userExpYears = userResume.experience ? parseInt(userResume.experience) : 0
  const jobExpText = job.work_exp || ''
  if (jobExpText.includes('应届') || jobExpText.includes('不限')) {
    score += 8
  } else if (jobExpText.includes('1-3') && userExpYears >= 1 && userExpYears <= 3) {
    score += 10
  } else if (jobExpText.includes('1-3') && userExpYears >= 1) {
    score += 6
  } else if (jobExpText.includes('3-5') && userExpYears >= 3 && userExpYears <= 5) {
    score += 10
  } else if (jobExpText.includes('3-5') && userExpYears >= 3) {
    score += 6
  } else if (jobExpText.includes('5-10') && userExpYears >= 5) {
    score += 8
  } else if (jobExpText.includes('5-10')) {
    score += 2
  } else if (userExpYears > 0) {
    score += 4
  }
  
  // 薪资/福利匹配 - 10分
  const welfareCount = getWelfareTags(job).length
  if (job.salary_avg) {
    if (job.salary_avg >= 25000 && welfareCount >= 2) score += 10
    else if (job.salary_avg >= 20000) score += 8
    else if (job.salary_avg >= 15000) score += 6
    else if (job.salary_avg >= 10000) score += 4
    else if (job.salary_avg >= 5000) score += 2
    else score += 1
  } else if (welfareCount >= 2) {
    score += 5
  }
  
  return Math.min(98, Math.max(25, score))
}

const getIndustry = (job) => {
  const name = (job?.job_name || '').toLowerCase()
  if (name.includes('java') || name.includes('后端') || name.includes('开发') || name.includes('编程')) return '软件开发'
  if (name.includes('前端') || name.includes('react') || name.includes('vue')) return 'Web前端开发'
  if (name.includes('ai') || name.includes('算法') || name.includes('人工智能') || name.includes('机器学习')) return '人工智能'
  if (name.includes('测试') || name.includes('qa')) return '软件测试'
  if (name.includes('运维') || name.includes('devops') || name.includes('linux')) return '运维服务'
  if (name.includes('大数据') || name.includes('spark') || name.includes('hadoop')) return '大数据'
  if (name.includes('安全')) return '网络安全'
  if (name.includes('产品') || name.includes('pm')) return '产品管理'
  if (name.includes('设计') || name.includes('ui') || name.includes('ux')) return '设计'
  if (name.includes('老师') || name.includes('教师') || name.includes('讲师')) return '教育/培训'
  if (name.includes('硬件') || name.includes('维护')) return '硬件技术'
  return 'IT信息技术'
}

const getCompanySize = () => '暂无数据'

const getCompanyType = (job) => {
  const text = (job?.company || '') + (job?.job_name || '')
  if (text.includes('国企') || text.includes('国家') || text.includes('银行')) return '国有企业'
  if (text.includes('上市') || text.includes('科技') || text.includes('集团')) return '上市公司'
  if (text.includes('小微') || text.includes('创业')) return '小微企业'
  if (text.includes('教育') || text.includes('培训') || text.includes('学校') || text.includes('老师')) return '民办/教育机构'
  if (text.includes('立即投递') || !text.trim()) return '未知企业'
  return '民营企业'
}

const getCompanyTypeClass = (job) => {
  const type = getCompanyType(job)
  if (type.includes('上市')) return 'type-listed'
  if (type.includes('国有')) return 'type-state'
  if (type.includes('小微')) return 'type-small'
  if (type.includes('民办') || type.includes('教育')) return 'type-private'
  if (type.includes('未知')) return 'type-unknown'
  return 'type-default'
}

const getCompanyBrief = () => '爬取数据中暂无企业简介信息，可通过「查看详情」了解岗位核心内容。'

const getCompanyAddress = (job) => {
  return job?.city || '暂无数据'
}

const toastMessage = ref('')
const toastType = ref('success')
const showToastFlag = ref(false)

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToastFlag.value = true
  setTimeout(() => { showToastFlag.value = false }, 3000)
}

const toggleEducation = (option) => {
  const index = selectedEducation.value.indexOf(option)
  if (index > -1) selectedEducation.value.splice(index, 1)
  else selectedEducation.value.push(option)
  saveFilterState()
}

const toggleExperience = (option) => {
  const index = selectedExperience.value.indexOf(option)
  if (index > -1) selectedExperience.value.splice(index, 1)
  else selectedExperience.value.push(option)
  saveFilterState()
}

const toggleCity = (option) => {
  const index = selectedCities.value.indexOf(option)
  if (index > -1) selectedCities.value.splice(index, 1)
  else selectedCities.value.push(option)
  saveFilterState()
}

const handleSalaryInput = () => {
  if (minSalary.value > maxSalary.value) {
    const temp = minSalary.value
    minSalary.value = maxSalary.value
    maxSalary.value = temp
  }
  saveFilterState()
}

const removeFilterTag = (tag) => {
  if (tag.key === 'edu') selectedEducation.value = selectedEducation.value.filter(e => e !== tag.value)
  if (tag.key === 'exp') selectedExperience.value = selectedExperience.value.filter(e => e !== tag.value)
  if (tag.key === 'city') selectedCities.value = selectedCities.value.filter(c => c !== tag.value)
  if (tag.key === 'minSalary') minSalary.value = 0
  if (tag.key === 'maxSalary') maxSalary.value = 50
  saveFilterState()
  handleSearch()
}

const setSortBy = (mode) => {
  if (sortBy.value === mode) {
    sortBy.value = ''
  } else {
    sortBy.value = mode
  }
  currentPage.value = 1
  handleSearch()
}

const toggleJobSelection = (job) => {
  const index = selectedJobs.value.findIndex(s => s.job_name === job.job_name && s.company === job.company)
  if (index > -1) selectedJobs.value.splice(index, 1)
  else selectedJobs.value.push(job)
  selectAllVisible.value = jobList.value.length > 0 && jobList.value.every(j => selectedJobs.value.some(s => s.job_name === j.job_name && s.company === j.company))
}

const toggleSelectAllVisible = () => {
  if (selectAllVisible.value) {
    jobList.value.forEach(job => {
      if (!selectedJobs.value.some(s => s.job_name === job.job_name && s.company === job.company)) {
        selectedJobs.value.push(job)
      }
    })
  } else {
    selectedJobs.value = selectedJobs.value.filter(s => !jobList.value.some(j => j.job_name === s.job_name && j.company === s.company))
  }
}

const clearSelection = () => {
  selectedJobs.value = []
  selectAllVisible.value = false
}

const batchFavorite = () => {
  if (isGuest.value) {
    showToast('请先登录后再收藏岗位', 'warning')
    return
  }
  let count = 0
  selectedJobs.value.forEach(job => {
    if (!isFavorited(job)) {
      favorites.value.push({ ...job, favoriteTime: new Date().toISOString() })
      count++
    }
  })
  saveFavorites()
  showToast(`已收藏 ${count} 个岗位`)
}

const openCompareSidebar = () => {
  compareList.value = selectedJobs.value.slice(0, 4)
  showCompare.value = true
}

const selectSuggestion = (sug) => {
  searchKeyword.value = sug
  searchSuggestions.value = []
  searchFocused.value = false
  handleSearch()
}

const quickSearch = (tag) => {
  searchKeyword.value = tag
  handleSearch()
}

const hoverHotTag = (tag) => {
  searchKeyword.value = tag
  searchFocused.value = true
}

const clearHotTagHover = () => {
  if (!searchKeyword.value || hotTags.includes(searchKeyword.value)) {
    searchKeyword.value = ''
  }
  searchFocused.value = false
}

const handleSearchInput = async () => {
  if (searchKeyword.value.length >= 1) {
    try {
      const res = await axios.get('/api/jobs/suggest', { params: { keyword: searchKeyword.value } })
      if (res.data.success) searchSuggestions.value = res.data.data
    } catch (e) {}
  } else {
    searchSuggestions.value = []
  }
}

const optimizeResume = () => {
  if (!selectedJob.value) return
  
  // 保存当前目标岗位到localStorage，供AI简历页面读取
  const targetJob = {
    job_name: selectedJob.value.job_name,
    city: selectedJob.value.city,
    education: selectedJob.value.education,
    work_exp: selectedJob.value.work_exp,
    salary_avg: selectedJob.value.salary_avg,
    company: selectedJob.value.company,
    skills: getJobTags(selectedJob.value)
  }
  localStorage.setItem('targetJobForResume', JSON.stringify(targetJob))
  
  // 跳转到AI简历页面
  document.body.style.overflow = ''
  router.push('/ai-resume')
  showToast('已为您跳转至AI简历优化中心，将根据目标岗位提供优化建议', 'success')
}

const generateTrendData = () => {
  const data = []
  const now = new Date()
  const baseSalary = (selectedJob.value?.salary_avg || 15000) / 1000
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const variance = Math.sin(i * 0.5) * 2 + Math.cos(i * 0.3) * 1.5
    data.push({
      month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      salary: Math.round((baseSalary + variance) * 10) / 10
    })
  }
  return data
}

const careerPathData = ref([])

const generateCareerPath = () => {
  const job = selectedJob.value
  if (!job) return
  const jobName = job.job_name || '目标岗位'
  const skills = getJobTags(job)
  const steps = [
    {
      step: 1,
      title: '基础准备',
      duration: '2-4周',
      items: ['掌握' + (skills[0] || '核心技能') + '基础', '了解行业动态', '准备简历模板'],
      tech: skills.slice(0, 2)
    },
    {
      step: 2,
      title: '技能强化',
      duration: '4-8周',
      items: ['深入学习' + (skills[1] || '相关技术'), '完成2-3个项目实践', '参与开源贡献'],
      tech: skills.slice(1, 3)
    },
    {
      step: 3,
      title: '项目实战',
      duration: '4-6周',
      items: ['构建完整项目作品', '编写技术博客', '准备技术面试题'],
      tech: skills
    },
    {
      step: 4,
      title: '求职冲刺',
      duration: '2-3周',
      items: ['针对性投递' + jobName + '岗位', '模拟面试训练', '薪资谈判准备'],
      tech: []
    }
  ]
  careerPathData.value = steps
  showCareerPathModal.value = true
}

const trendData = computed(() => generateTrendData())

const trendDataMax = computed(() => {
  if (trendData.value.length === 0) return 20
  return Math.max(...trendData.value.map(d => d.salary)).toFixed(1)
})

const trendDataMin = computed(() => {
  if (trendData.value.length === 0) return 10
  return Math.min(...trendData.value.map(d => d.salary)).toFixed(1)
})

const trendLinePath = computed(() => {
  if (trendData.value.length === 0) return ''
  return trendData.value.map((d, i) => {
    const x = 40 + (i * 540 / 11)
    const y = 210 - ((d.salary - trendDataMin.value) / (trendDataMax.value - trendDataMin.value || 1)) * 190
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const trendAreaPath = computed(() => {
  if (trendData.value.length === 0) return ''
  const linePath = trendData.value.map((d, i) => {
    const x = 40 + (i * 540 / 11)
    const y = 210 - ((d.salary - trendDataMin.value) / (trendDataMax.value - trendDataMin.value || 1)) * 190
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
  return `${linePath} L 580 210 L 40 210 Z`
})

const trendTrend = computed(() => {
  if (trendData.value.length < 2) return '持平'
  const first = trendData.value[0].salary
  const last = trendData.value[trendData.value.length - 1].salary
  const diff = last - first
  if (diff > 0.5) return `↑ 上升 ${diff.toFixed(1)}K`
  if (diff < -0.5) return `↓ 下降 ${Math.abs(diff).toFixed(1)}K`
  return '→ 持平'
})

const trendTrendClass = computed(() => {
  if (trendTrend.value.includes('上升')) return 'trend-up'
  if (trendTrend.value.includes('下降')) return 'trend-down'
  return 'trend-flat'
})

const closeTrendModal = () => { showTrendModal.value = false }
const closeCareerPathModal = () => { showCareerPathModal.value = false }

const changePage = (page) => {
  currentPage.value = page
  handleSearch()
}

const loadMoreJobs = async () => {
  if (loading.value || currentPage.value >= totalPages.value) return
  loading.value = true
  currentPage.value++
  try {
    const currentCategory = categories.value[activeCategory.value]
    let effectiveSortBy = sortBy.value
    if (currentCategory === '高匹配优先') effectiveSortBy = 'match'
    else if (currentCategory === '高薪岗位') effectiveSortBy = 'salary'

    const params = new URLSearchParams()
    if (searchKeyword.value) params.append('keyword', searchKeyword.value)
    if (currentCategory !== '全部岗位' && currentCategory !== '高匹配优先' && currentCategory !== '高薪岗位') {
      params.append('category', currentCategory)
    }
    if (selectedEducation.value.length > 0) params.append('education', selectedEducation.value.join(','))
    if (selectedExperience.value.length > 0) params.append('experience', selectedExperience.value.join(','))
    if (selectedCities.value.length > 0) params.append('city', selectedCities.value.join(','))
    if (minSalary.value > 0) params.append('minSalary', minSalary.value * 1000)
    if (maxSalary.value > 0) params.append('maxSalary', maxSalary.value * 1000)
    params.append('page', currentPage.value)
    params.append('pageSize', pageSize)
    params.append('sortBy', effectiveSortBy)
    if (userLocationCity.value) params.append('userCity', userLocationCity.value)

    const response = await axios.get(`/api/jobs/search?${params.toString()}`)
    if (response.data.success) {
      jobList.value = [...jobList.value, ...response.data.data]
      totalResults.value = response.data.total
      totalPages.value = response.data.totalPages
    }
  } catch (error) {
    console.error('加载更多失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  loading.value = true
  currentPage.value = 1
  clearSelection()
  try {
    const currentCategory = categories.value[activeCategory.value]
    let effectiveSortBy = sortBy.value
    if (currentCategory === '高匹配优先') {
      effectiveSortBy = 'match'
    } else if (currentCategory === '高薪岗位') {
      effectiveSortBy = 'salary'
    }

    const params = new URLSearchParams()
    if (searchKeyword.value) params.append('keyword', searchKeyword.value)
    if (currentCategory !== '全部岗位' && currentCategory !== '高匹配优先' && currentCategory !== '高薪岗位') {
      params.append('category', currentCategory)
    }
    if (selectedEducation.value.length > 0) params.append('education', selectedEducation.value.join(','))
    if (selectedExperience.value.length > 0) params.append('experience', selectedExperience.value.join(','))
    if (selectedCities.value.length > 0) params.append('city', selectedCities.value.join(','))
    if (minSalary.value > 0) params.append('minSalary', minSalary.value * 1000)
    if (maxSalary.value > 0) params.append('maxSalary', maxSalary.value * 1000)
    params.append('page', currentPage.value)
    params.append('pageSize', pageSize)
    if (effectiveSortBy) {
      params.append('sortBy', effectiveSortBy)
    }
    if (userLocationCity.value) params.append('userCity', userLocationCity.value)

    const response = await axios.get(`/api/jobs/search?${params.toString()}`)
    if (response.data.success) {
      jobList.value = response.data.data
      totalResults.value = response.data.total
      totalPages.value = response.data.totalPages
    }
  } catch (error) {
    console.error('搜索失败:', error)
    jobList.value = []
    totalResults.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
  saveFilterState()
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeCategory.value = 0
  selectedEducation.value = []
  selectedExperience.value = []
  selectedCities.value = []
  minSalary.value = 0
  maxSalary.value = 50
  sortBy.value = ''
  currentPage.value = 1
  handleSearch()
}

const loadOptions = async () => {
  try {
    const [eduRes, expRes, cityRes] = await Promise.all([
      axios.get('/api/jobs/education-options'),
      axios.get('/api/jobs/experience-options'),
      axios.get('/api/jobs/cities')
    ])
    if (eduRes.data.success) educationOptions.value = eduRes.data.data.slice(0, 8)
    if (expRes.data.success) experienceOptions.value = expRes.data.data.slice(0, 6)
    if (cityRes.data.success) cityOptions.value = cityRes.data.data.slice(0, 20)
  } catch (error) {
    educationOptions.value = ['本科', '硕士', '大专', '学历不限']
    experienceOptions.value = ['经验不限', '应届生', '1-3年', '3-5年']
    cityOptions.value = ['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '南京']
  }
}

const bgCanvas = ref(null)
let bgAnimationId = null
let scrollHandler = null

watch(favorites, () => {
  if (selectedJob.value) {
    isCurrentFavorited.value = favorites.value.some(f =>
      f.job_name === selectedJob.value.job_name && f.company === selectedJob.value.company
    )
  }
}, { deep: true })

onMounted(() => {
  loadFavorites()
  loadApplications()
  loadFilterState()
  loadOptions()
  detectUserLocation()
  handleSearch()

  scrollHandler = () => {
    const el = document.querySelector('.filter-section')
    if (el) {
      const rect = el.getBoundingClientRect()
      filterSticky.value = rect.top < 100 && rect.bottom > window.innerHeight
    }
    
    // Scroll-triggered lazy loading
    if (!loading.value && currentPage.value < totalPages.value) {
      const scrollBottom = window.innerHeight + window.scrollY
      const pageHeight = document.documentElement.scrollHeight
      if (pageHeight - scrollBottom < 200) {
        loadMoreJobs()
      }
    }
  }
  window.addEventListener('scroll', scrollHandler)

  const canvas = bgCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const stars = []
  const colors = ['74, 158, 255', '139, 92, 246']
  const particleCount = 160
  for (let i = 0; i < particleCount; i++) {
    const sizeRand = Math.random()
    let radius, layer
    if (sizeRand < 0.65) { radius = Math.random() * 0.8 + 0.3; layer = 0 }
    else if (sizeRand < 0.92) { radius = Math.random() * 1.2 + 0.8; layer = 1 }
    else { radius = Math.random() * 1.5 + 1.8; layer = 2 }
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius,
      layer,
      alpha: Math.random() * 0.8 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      colorIdx: Math.floor(Math.random() * 2),
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.05
    })
  }
  const meteors = []
  let meteorTimer = 0
  const spawnMeteor = () => {
    const side = Math.random()
    let x, y, vx, vy
    if (side < 0.5) {
      x = Math.random() * canvas.width * 0.5
      y = -20
      vx = (Math.random() * 4 + 3)
      vy = Math.random() * 3 + 2
    } else {
      x = canvas.width + 20
      y = Math.random() * canvas.height * 0.4
      vx = -(Math.random() * 4 + 3)
      vy = Math.random() * 3 + 1
    }
    meteors.push({ x, y, vx, vy, life: 1, maxLife: 60 + Math.random() * 40 })
  }
  const animate = () => {
    ctx.fillStyle = 'rgba(3, 6, 20, 0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    stars.forEach(star => {
      star.x += star.driftX
      star.y += star.driftY
      if (star.x < -10) star.x = canvas.width + 10
      if (star.x > canvas.width + 10) star.x = -10
      if (star.y < -10) star.y = canvas.height + 10
      if (star.y > canvas.height + 10) star.y = -10
      star.alpha += star.twinkleSpeed
      if (star.alpha > star.baseAlpha + 0.3 || star.alpha < star.baseAlpha - 0.1) {
        star.twinkleSpeed = -star.twinkleSpeed
      }
      if (star.alpha < 0.1) star.alpha = 0.1
      if (star.alpha > 1) star.alpha = 1
      const dx = star.x - mouseX.value
      const dy = star.y - mouseY.value
      const dist = Math.sqrt(dx * dx + dy * dy)
      let brightness = star.alpha
      if (dist < 150) {
        brightness = Math.min(1, star.alpha + (1 - dist / 150) * 0.5)
      }
      const color = colors[star.colorIdx]
      if (star.layer >= 2) {
        const spikeLen = star.radius * 5
        ctx.strokeStyle = `rgba(${color}, ${brightness * 0.3})`
        ctx.lineWidth = 0.4
        ctx.beginPath()
        ctx.moveTo(star.x - spikeLen, star.y)
        ctx.lineTo(star.x + spikeLen, star.y)
        ctx.moveTo(star.x, star.y - spikeLen)
        ctx.lineTo(star.x, star.y + spikeLen)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${brightness * 0.15})`
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${color}, ${brightness})`
      if (star.layer >= 1 || dist < 150) {
        ctx.shadowBlur = star.layer >= 2 ? 15 : 8
        ctx.shadowColor = `rgba(${color}, ${brightness})`
      } else {
        ctx.shadowBlur = 0
      }
      ctx.fill()
      ctx.shadowBlur = 0
    })
    ctx.lineWidth = 0.4
    let lineCount = 0
    for (let i = 0; i < stars.length && lineCount < 35; i++) {
      for (let j = i + 1; j < stars.length && lineCount < 35; j++) {
        const dx = stars[i].x - stars[j].x
        const dy = stars[i].y - stars[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.08 * Math.min(stars[i].alpha, stars[j].alpha)
          ctx.strokeStyle = `rgba(74, 158, 255, ${opacity})`
          ctx.beginPath()
          ctx.moveTo(stars[i].x, stars[i].y)
          ctx.lineTo(stars[j].x, stars[j].y)
          ctx.stroke()
          lineCount++
        }
      }
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]
      m.x += m.vx
      m.y += m.vy
      m.life += 1
      const progress = m.life / m.maxLife
      const alpha = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2)
      const tailLen = 60
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8)
      grad.addColorStop(0, `rgba(180, 210, 255, ${alpha})`)
      grad.addColorStop(0.3, `rgba(139, 92, 246, ${alpha * 0.5})`)
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(m.x, m.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`
      ctx.shadowBlur = 8
      ctx.shadowColor = `rgba(180, 200, 255, ${alpha})`
      ctx.fill()
      ctx.shadowBlur = 0
      if (m.life > m.maxLife || m.x < -50 || m.x > canvas.width + 50 || m.y > canvas.height + 50) {
        meteors.splice(i, 1)
      }
    }
    meteorTimer++
    if (meteorTimer > 300 + Math.random() * 500) {
      if (meteors.length < 2) spawnMeteor()
      meteorTimer = 0
    }
    bgAnimationId = requestAnimationFrame(animate)
  }
  animate()
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
  if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  if (favPreviewTimer.value) {
    clearTimeout(favPreviewTimer.value)
    favPreviewTimer.value = null
  }
})
</script>

<style scoped>
.job-recommend-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 30% 25%, rgba(18, 22, 55, 0.25) 0%, transparent 45%),
    radial-gradient(ellipse at 70% 75%, rgba(12, 18, 42, 0.2) 0%, transparent 45%),
    radial-gradient(ellipse at center, rgba(8, 12, 32, 0.3) 0%, transparent 60%),
    linear-gradient(180deg, #02040f 0%, #050818 40%, #030614 100%);
  position: relative;
  overflow-x: hidden;
  padding: 20px 40px 60px;
}
.bg-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
}

/* 星云背景层 */
.nebula-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.nebula-1 {
  width: 550px;
  height: 550px;
  top: -5%;
  right: 10%;
  background: radial-gradient(circle, rgba(100, 120, 255, 0.25) 0%, rgba(80, 60, 200, 0.12) 50%, transparent 70%);
  animation: nebulaFloat1 22s ease-in-out infinite;
}

.nebula-2 {
  width: 450px;
  height: 450px;
  bottom: 20%;
  left: 5%;
  background: radial-gradient(circle, rgba(150, 100, 255, 0.2) 0%, rgba(120, 80, 200, 0.1) 50%, transparent 70%);
  animation: nebulaFloat2 28s ease-in-out infinite;
}

.nebula-3 {
  width: 380px;
  height: 380px;
  top: 35%;
  right: 25%;
  background: radial-gradient(circle, rgba(0, 180, 255, 0.18) 0%, rgba(50, 120, 220, 0.08) 50%, transparent 70%);
  animation: nebulaFloat3 32s ease-in-out infinite;
}

@keyframes nebulaFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-25px, 15px) scale(1.06); }
  66% { transform: translate(15px, -18px) scale(0.94); }
}

@keyframes nebulaFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(35px, -25px) scale(1.07); }
  66% { transform: translate(-18px, 25px) scale(0.93); }
}

@keyframes nebulaFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-25px, 35px) scale(1.08); }
}

/* 动态光带 */
.light-ribbons {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.ribbon {
  position: absolute;
  width: 150%;
  height: 2px;
  filter: blur(1px);
  opacity: 0.5;
}

.ribbon-1 {
  top: 15%;
  left: -25%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(100, 180, 255, 0.35) 20%, 
    rgba(150, 130, 255, 0.55) 50%, 
    rgba(100, 180, 255, 0.35) 80%, 
    transparent 100%);
  height: 1px;
  box-shadow: 0 0 18px rgba(100, 180, 255, 0.45);
  animation: ribbonFlow1 14s linear infinite;
}

.ribbon-2 {
  top: 55%;
  left: -25%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(180, 120, 255, 0.25) 30%, 
    rgba(100, 200, 255, 0.45) 50%, 
    rgba(180, 120, 255, 0.25) 70%, 
    transparent 100%);
  height: 1.5px;
  box-shadow: 0 0 22px rgba(180, 120, 255, 0.35);
  animation: ribbonFlow2 16s linear infinite;
  animation-delay: -6s;
}

.ribbon-3 {
  bottom: 12%;
  left: -25%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(80, 200, 220, 0.3) 25%, 
    rgba(120, 150, 255, 0.45) 50%, 
    rgba(80, 200, 220, 0.3) 75%, 
    transparent 100%);
  height: 1px;
  box-shadow: 0 0 16px rgba(80, 200, 220, 0.4);
  animation: ribbonFlow3 20s linear infinite;
  animation-delay: -9s;
}

@keyframes ribbonFlow1 {
  0% { transform: translateX(0) scaleY(1); opacity: 0.5; }
  50% { transform: translateX(25%) scaleY(1.4); opacity: 0.7; }
  100% { transform: translateX(50%) scaleY(1); opacity: 0.5; }
}

@keyframes ribbonFlow2 {
  0% { transform: translateX(0) scaleY(1); opacity: 0.4; }
  50% { transform: translateX(-18%) scaleY(1.8); opacity: 0.65; }
  100% { transform: translateX(-36%) scaleY(1); opacity: 0.4; }
}

@keyframes ribbonFlow3 {
  0% { transform: translateX(0) scaleY(1); opacity: 0.35; }
  50% { transform: translateX(22%) scaleY(1.6); opacity: 0.55; }
  100% { transform: translateX(44%) scaleY(1); opacity: 0.35; }
}
.bg-hex-grid {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
  pointer-events: none;
  background-color: transparent;
  background-image:
    linear-gradient(30deg, rgba(74,158,255,0.06) 1px, transparent 1px),
    linear-gradient(-30deg, rgba(74,158,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74,158,255,0.05) 1px, transparent 1px);
  background-size: 52px 90px, 52px 90px, 52px 90px;
  mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.9) 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.9) 30%, transparent 80%);
}
.bg-cursor-glow {
  position: fixed;
  top: -150px;
  left: -150px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74,158,255,0.06) 0%, rgba(139,92,246,0.03) 40%, transparent 70%);
  pointer-events: none;
  z-index: 2;
  filter: blur(50px);
  will-change: transform;
  transition: opacity 0.6s ease;
}
.bg-edge-glow {
  position: fixed;
  pointer-events: none;
  z-index: 1;
}
.bg-edge-glow.edge-tl {
  top: 0; left: 0;
  width: 400px; height: 400px;
  background: radial-gradient(circle at top left, rgba(76,29,149,0.12) 0%, transparent 65%);
}
.bg-edge-glow.edge-tr {
  top: 0; right: 0;
  width: 400px; height: 400px;
  background: radial-gradient(circle at top right, rgba(30,58,138,0.1) 0%, transparent 65%);
}
.bg-edge-glow.edge-bl {
  bottom: 0; left: 0;
  width: 400px; height: 400px;
  background: radial-gradient(circle at bottom left, rgba(139,92,246,0.08) 0%, transparent 65%);
}
.bg-edge-glow.edge-br {
  bottom: 0; right: 0;
  width: 400px; height: 400px;
  background: radial-gradient(circle at bottom right, rgba(74,158,255,0.08) 0%, transparent 65%);
}
.bg-fluid-edge {
  position: fixed;
  pointer-events: none;
  z-index: 1;
  opacity: 0.08;
}
.bg-fluid-edge.fluid-bottom {
  bottom: -80px;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(0deg, rgba(74,158,255,0.06) 0%, rgba(139,92,246,0.04) 50%, transparent 100%);
  filter: blur(30px);
  animation: fluidBottom 18s ease-in-out infinite;
}
.bg-fluid-edge.fluid-left {
  top: 0;
  left: -80px;
  bottom: 0;
  width: 160px;
  background: linear-gradient(90deg, rgba(139,92,246,0.05) 0%, rgba(74,158,255,0.03) 50%, transparent 100%);
  filter: blur(30px);
  animation: fluidLeft 22s ease-in-out infinite;
}
.bg-fluid-edge.fluid-right {
  top: 0;
  right: -80px;
  bottom: 0;
  width: 160px;
  background: linear-gradient(-90deg, rgba(74,158,255,0.05) 0%, rgba(139,92,246,0.03) 50%, transparent 100%);
  filter: blur(30px);
  animation: fluidRight 20s ease-in-out infinite;
}
@keyframes fluidBottom {
  0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scaleX(1.05); opacity: 0.45; }
}
@keyframes fluidLeft {
  0%, 100% { transform: translateX(0) scaleY(1); opacity: 0.3; }
  50% { transform: translateX(15px) scaleY(1.04); opacity: 0.4; }
}
@keyframes fluidRight {
  0%, 100% { transform: translateX(0) scaleY(1); opacity: 0.3; }
  50% { transform: translateX(-15px) scaleY(1.04); opacity: 0.4; }
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1000;
}
.back-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px;
  background: rgba(74,158,255,0.08);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 10px;
  color: rgba(74,158,255,0.8);
  font-size: 14px; cursor: pointer;
  transition: all 0.3s;
}
.back-btn:hover {
  background: rgba(74,158,255,0.12);
  border-color: rgba(74,158,255,0.4);
  transform: translateX(-2px);
}
.title-area { display: flex; align-items: center; gap: 12px; }
.page-title {
  font-size: 20px; font-weight: 700;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}
.ai-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  background: linear-gradient(135deg, rgba(0,212,170,0.15), rgba(74,158,255,0.15));
  border: 1px solid rgba(0,212,170,0.3);
  border-radius: 20px;
  color: #00d4aa;
  font-size: 12px; font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.ai-badge:hover {
  box-shadow: 0 0 15px rgba(0,212,170,0.4);
  transform: scale(1.05);
}
.top-bar-right { display: flex; align-items: center; gap: 15px; margin-left: auto; }
.favorites-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  background: rgba(251,146,60,0.12);
  border: 1px solid rgba(251,146,60,0.3);
  border-radius: 10px;
  color: #fb923c; font-size: 14px; cursor: pointer;
  transition: all 0.3s;
}
.favorites-btn:hover { background: rgba(251,146,60,0.22); }
.favorites-badge {
  min-width: 20px; height: 20px; padding: 0 6px;
  background: #fb923c; color: #fff;
  font-size: 12px; font-weight: 600;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.favorites-count-header {
  color: rgba(74,158,255,0.8);
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  background: rgba(74,158,255,0.1);
  border-radius: 16px;
}
.favorites-body {
  max-height: 65vh;
  overflow-y: auto;
}
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.favorite-item {
  background: rgba(15,25,55,0.6);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.favorite-item:hover {
  border-color: rgba(74,158,255,0.4);
  background: rgba(20,35,70,0.7);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74,158,255,0.15);
}
.favorite-main {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.favorite-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.favorite-title {
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
}
.favorite-salary {
  color: #4a9eff;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(74,158,255,0.3);
}
.favorite-sub-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  color: rgba(200,220,255,0.7);
  font-size: 13px;
}
.favorite-company {
  font-weight: 500;
  color: rgba(200,220,255,0.85);
}
.favorite-divider {
  color: rgba(150,180,220,0.4);
}
.favorite-city {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(200,220,255,0.7);
}
.favorite-city svg {
  color: #4a9eff;
}
.favorite-edu-exp {
  color: rgba(200,220,255,0.7);
}
.favorite-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.fav-tag {
  padding: 4px 10px;
  background: rgba(74,158,255,0.1);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 12px;
  color: rgba(200,220,255,0.8);
  font-size: 11px;
  font-weight: 500;
}
.favorite-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed rgba(74,158,255,0.12);
}
.favorite-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: rgba(150,180,220,0.6);
  font-size: 12px;
}
.favorite-time svg {
  color: rgba(150,180,220,0.5);
}
.favorite-match {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #00d4aa;
  font-size: 12px;
  font-weight: 600;
}
.match-bar-mini {
  width: 60px;
  height: 5px;
  background: rgba(74,158,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}
.match-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 3px;
  transition: width 0.5s;
}
.favorite-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid rgba(74,158,255,0.1);
  padding-top: 12px;
}
.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  white-space: nowrap;
}
.action-btn svg {
  flex-shrink: 0;
}
.detail-btn {
  background: linear-gradient(135deg, rgba(74,158,255,0.2), rgba(0,212,170,0.15));
  border: 1px solid rgba(74,158,255,0.4);
  color: #4a9eff;
}
.detail-btn:hover {
  background: linear-gradient(135deg, rgba(74,158,255,0.35), rgba(0,212,170,0.25));
  color: #fff;
  box-shadow: 0 4px 15px rgba(74,158,255,0.3);
  transform: translateY(-1px);
}
.contact-btn {
  background: rgba(0,212,170,0.1);
  border: 1px solid rgba(0,212,170,0.35);
  color: #00d4aa;
}
.contact-btn:hover {
  background: rgba(0,212,170,0.22);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,212,170,0.25);
  transform: translateY(-1px);
}
.unfavorite-btn {
  background: rgba(251,146,60,0.1);
  border: 1px solid rgba(251,146,60,0.3);
  color: #fb923c;
}
.unfavorite-btn:hover {
  background: rgba(251,146,60,0.22);
  color: #fff;
  box-shadow: 0 4px 15px rgba(251,146,60,0.25);
  transform: translateY(-1px);
}
.loading-indicator { display: flex; align-items: center; gap: 8px; color: rgba(74,158,255,0.6); font-size: 13px; }
.loading-icon .spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.search-bar {
  display: flex; gap: 15px;
  max-width: 900px; margin: 0 auto 25px;
  position: relative; z-index: 10;
}
.search-input-wrapper {
  flex: 1; display: flex; align-items: center;
  background: rgba(10,20,45,0.6);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 50px;
  padding: 0 25px; height: 52px;
  position: relative;
  transition: all 0.3s;
}
.search-input-wrapper.focused {
  border-color: rgba(74,158,255,0.6);
  box-shadow: 0 0 20px rgba(74,158,255,0.2);
}
.search-icon { margin-right: 12px; flex-shrink: 0; }
.search-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: rgba(255,255,255,0.9); font-size: 14px;
}
.search-input::placeholder { color: rgba(150,180,220,0.4); }
.hot-tags { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 10px; }
.hot-tag-label { color: rgba(150,180,220,0.4); font-size: 12px; }
.hot-tag {
  padding: 3px 10px;
  background: rgba(74,158,255,0.1);
  border-radius: 12px;
  color: rgba(74,158,255,0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.hot-tag:hover { background: rgba(74,158,255,0.2); color: #4a9eff; }
.suggestions-dropdown {
  position: absolute; top: 100%; left: 0; right: 80px;
  margin-top: 5px;
  background: rgba(15,25,55,0.98);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 12px;
  padding: 8px;
  z-index: 100;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.suggestion-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.suggestion-item:hover { background: rgba(74,158,255,0.1); }
.search-btn {
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  border: none; border-radius: 50px;
  padding: 0 35px; height: 52px;
  color: #fff; font-weight: 600; font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74,158,255,0.4);
  transition: all 0.3s ease;
}
.search-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(74,158,255,0.6); }
.category-tabs-wrapper {
  overflow-x: auto;
  margin-bottom: 25px;
  position: relative; z-index: 10;
  scrollbar-width: thin;
}
.category-tabs-wrapper::-webkit-scrollbar { height: 4px; }
.category-tabs-wrapper::-webkit-scrollbar-thumb { background: rgba(74,158,255,0.3); border-radius: 2px; }
.category-tabs {
  display: flex; gap: 10px; justify-content: center;
  min-width: max-content;
}
.tab-item {
  padding: 10px 22px;
  background: rgba(10,20,45,0.5);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 25px;
  color: rgba(150,180,220,0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tab-item:hover { border-color: rgba(74,158,255,0.5); color: rgba(255,255,255,0.8); }
.tab-item.active {
  background: rgba(74,158,255,0.18);
  border-color: rgba(74,158,255,0.6);
  color: #fff;
  box-shadow: 0 0 12px rgba(74,158,255,0.3);
}
.tab-glow-line {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4a9eff, #00d4aa, #4a9eff, transparent);
  border-radius: 2px;
  animation: tabGlowPulse 2s ease-in-out infinite;
}
@keyframes tabGlowPulse {
  0%, 100% { opacity: 0.7; box-shadow: 0 0 8px rgba(74,158,255,0.5); }
  50% { opacity: 1; box-shadow: 0 0 15px rgba(74,158,255,0.8); }
}
.main-content {
  display: flex; gap: 25px;
  max-width: 1400px; margin: 0 auto;
  position: relative; z-index: 10;
}
.job-list-section {
  flex: 1;
  background: rgba(10, 16, 42, 0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(74,158,255,0.18);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  box-shadow: 0 0 40px rgba(74,158,255,0.04), inset 0 1px 0 rgba(255,255,255,0.03);
  overflow: hidden;
}
.job-list-section::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74,158,255,0.4), transparent);
}
.filter-section {
  width: 280px;
  background: rgba(10, 16, 42, 0.5);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  transition: all 0.3s;
  box-shadow: 0 0 30px rgba(74,158,255,0.03), inset 0 1px 0 rgba(255,255,255,0.03);
}
.filter-section.sticky {
  position: fixed;
  top: 90px;
  right: 40px;
  width: 280px;
  z-index: 50;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.filter-group {
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px dashed rgba(74,158,255,0.15);
}
.filter-group:last-of-type {
  border-bottom: none;
  margin-bottom: 15px;
}
.filter-label {
  color: rgba(255,255,255,0.9);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-label::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #4a9eff, #00d4aa);
  border-radius: 2px;
}
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-options.scrollable {
  max-height: 120px;
  overflow-y: auto;
  padding-right: 5px;
  scrollbar-width: thin;
  scrollbar-color: rgba(74,158,255,0.3) transparent;
}
.filter-options.scrollable::-webkit-scrollbar {
  width: 4px;
}
.filter-options.scrollable::-webkit-scrollbar-track {
  background: rgba(74,158,255,0.05);
  border-radius: 2px;
}
.filter-options.scrollable::-webkit-scrollbar-thumb {
  background: rgba(74,158,255,0.3);
  border-radius: 2px;
}
.filter-option {
  padding: 7px 14px;
  background: rgba(74,158,255,0.08);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 20px;
  color: rgba(200,220,255,0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.filter-option::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(0,212,170,0.1));
  opacity: 0;
  transition: opacity 0.25s;
}
.filter-option:hover {
  border-color: rgba(74,158,255,0.5);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74,158,255,0.2);
}
.filter-option:hover::before {
  opacity: 1;
}
.filter-option.active {
  background: linear-gradient(135deg, rgba(74,158,255,0.35), rgba(0,212,170,0.3));
  border-color: rgba(74,158,255,0.7);
  color: #fff;
  box-shadow: 0 0 15px rgba(74,158,255,0.4), inset 0 0 20px rgba(74,158,255,0.1);
}
.filter-option.active::after {
  content: '✓';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #00d4aa;
  font-weight: bold;
}
.filter-option.active {
  padding-right: 22px;
}
.salary-range {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.salary-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.salary-input {
  width: 70px;
  padding: 8px 12px;
  background: rgba(10,20,45,0.6);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  outline: none;
  transition: all 0.25s;
}
.salary-input:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 15px rgba(74,158,255,0.3);
}
.salary-input::-webkit-outer-spin-button,
.salary-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.salary-sep {
  color: rgba(150,180,220,0.5);
  font-weight: 500;
}
.salary-sliders {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.range-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(74,158,255,0.15);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}
.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(74,158,255,0.5);
  transition: all 0.2s;
}
.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(74,158,255,0.7);
}
.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(74,158,255,0.5);
}
.range-value {
  text-align: center;
  color: #4a9eff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(74,158,255,0.1);
  border-radius: 20px;
  margin-top: 8px;
}
.apply-filter-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(74,158,255,0.35);
  animation: filterBreathe 3s ease-in-out infinite;
}
@keyframes filterBreathe {
  0%, 100% { box-shadow: 0 4px 20px rgba(74,158,255,0.35); }
  50% { box-shadow: 0 4px 30px rgba(74,158,255,0.6), 0 0 20px rgba(0,212,170,0.3); }
}
.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74,158,255,0.5);
  filter: brightness(1.1);
}
.apply-filter-btn:active {
  transform: translateY(0);
}
.section-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(74,158,255,0.15);
  flex-wrap: wrap;
}
.header-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(74,158,255,0.15);
  display: flex; align-items: center; justify-content: center;
}
.section-header > span { color: #fff; font-size: 16px; font-weight: 600; }
.result-count { margin-left: auto; color: rgba(150,180,220,0.5); font-size: 12px; }
.sort-controls { display: flex; align-items: center; gap: 6px; margin-left: 15px; }
.sort-label { color: rgba(150,180,220,0.5); font-size: 12px; }
.sort-btn {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid rgba(74,158,255,0.25);
  border-radius: 15px;
  color: rgba(150,180,220,0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.sort-btn:hover { border-color: rgba(74,158,255,0.5); color: #fff; background: rgba(74,158,255,0.08); }
.sort-btn.active {
  background: rgba(74,158,255,0.22);
  border-color: rgba(74,158,255,0.6);
  color: #fff;
  box-shadow: 0 0 12px rgba(74,158,255,0.35);
  font-weight: 600;
}
.city-picker-wrap {
  margin-left: 10px;
}
.city-picker {
  padding: 5px 10px;
  background: rgba(10,18,42,0.8);
  border: 1px solid rgba(74,158,255,0.35);
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}
.city-picker:hover {
  border-color: rgba(74,158,255,0.7);
  box-shadow: 0 0 10px rgba(74,158,255,0.25);
}
.city-picker option {
  background: #0a122a;
  color: #e0e8f0;
}
.batch-toolbar {
  display: flex; align-items: center; gap: 15px;
  padding: 12px 16px;
  background: rgba(74,158,255,0.08);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 12px;
  margin-bottom: 15px;
}
.select-all-label {
  display: flex; align-items: center; gap: 8px;
  color: rgba(200,210,230,0.8); font-size: 13px;
  cursor: pointer;
}
.batch-checkbox {
  width: 16px; height: 16px;
  accent-color: #4a9eff;
  cursor: pointer;
}
.selected-count { color: #4a9eff; font-size: 13px; font-weight: 500; }
.batch-actions { display: flex; gap: 10px; margin-left: auto; }
.batch-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  background: rgba(74,158,255,0.15);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 8px;
  color: #4a9eff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.batch-btn:hover { background: rgba(74,158,255,0.25); }
.batch-btn.compare { background: rgba(0,212,170,0.15); border-color: rgba(0,212,170,0.3); color: #00d4aa; }
.batch-btn.compare:hover { background: rgba(0,212,170,0.25); }
.clear-selection-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(251,146,60,0.3);
  border-radius: 8px;
  color: #fb923c;
  font-size: 12px;
  cursor: pointer;
  margin-left: 10px;
}
.clear-selection-btn:hover { background: rgba(251,146,60,0.1); }
.active-filters {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 15px;
  padding: 10px 14px;
  background: rgba(0,212,170,0.06);
  border-radius: 10px;
}
.active-filters-label { color: rgba(150,180,220,0.5); font-size: 12px; }
.filter-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  background: rgba(0,212,170,0.15);
  border-radius: 12px;
  color: #00d4aa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tag:hover { background: rgba(0,212,170,0.3); }
.filter-tag.clear-all {
  background: rgba(251,146,60,0.15);
  color: #fb923c;
}
.filter-tag.clear-all:hover { background: rgba(251,146,60,0.25); }
.job-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.job-card {
  background: linear-gradient(145deg, rgba(10,18,42,0.85), rgba(14,22,48,0.75));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 18px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.5s ease both;
}
.job-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74,158,255,0.6), transparent);
  transition: left 0.5s;
  pointer-events: none;
  z-index: 3;
}
.job-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: radial-gradient(ellipse at top left, rgba(139,92,246,0.06), transparent 60%);
  pointer-events: none;
  z-index: 0;
}
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.job-card:nth-child(1) { animation-delay: 0.05s; }
.job-card:nth-child(2) { animation-delay: 0.1s; }
.job-card:nth-child(3) { animation-delay: 0.15s; }
.job-card:nth-child(4) { animation-delay: 0.2s; }
.job-card:nth-child(5) { animation-delay: 0.25s; }
.job-card:nth-child(6) { animation-delay: 0.3s; }
.job-card:hover {
  transform: translateY(-4px);
  border-color: rgba(74,158,255,0.4);
  box-shadow: 0 12px 40px rgba(74,158,255,0.12), 0 0 20px rgba(139,92,246,0.08);
}
.job-card:hover::after {
  left: 100%;
  animation: neonScan 1s ease-out forwards;
}
@keyframes neonScan {
  0% { left: -100%; }
  100% { left: 100%; }
}
.job-card.is-selected {
  border-color: rgba(0,212,170,0.6);
  box-shadow: 0 0 20px rgba(0,212,170,0.3);
}
.job-card-glow {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(139,92,246,0.08), transparent 50%);
  pointer-events: none;
}
.card-top-glow {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74,158,255,0.7), rgba(139,92,246,0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 0 8px rgba(74,158,255,0.5);
}
.job-card:hover .card-top-glow { opacity: 1; }
.card-select {
  position: absolute; top: 12px; left: 12px;
  z-index: 5;
}
.select-box {
  display: block;
  width: 18px; height: 18px;
  border: 1.5px solid rgba(74,158,255,0.4);
  border-radius: 4px;
  background: rgba(10,20,45,0.8);
  transition: all 0.2s;
}
.select-box.checked {
  background: #4a9eff;
  border-color: #4a9eff;
  box-shadow: 0 0 10px rgba(74,158,255,0.5);
}
.job-status-badge {
  position: absolute; top: 12px; right: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}
.job-status-badge.applied { background: rgba(74,158,255,0.2); color: #4a9eff; }
.job-status-badge.viewed { background: rgba(0,212,170,0.2); color: #00d4aa; }
.job-status-badge.interview { background: rgba(251,146,60,0.2); color: #fb923c; }
.job-status-badge.rejected { background: rgba(239,68,68,0.2); color: #ef4444; }
.job-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin: 10px 0 8px;
}
.job-title {
  color: #fff; font-size: 16px; font-weight: 700;
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding-left: 24px;
  text-shadow: 0 0 15px rgba(74,158,255,0.3);
}
.job-salary {
  color: #4a9eff;
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  margin-left: 10px;
  text-shadow: 0 0 15px rgba(74,158,255,0.6), 0 0 30px rgba(74,158,255,0.3);
  letter-spacing: 0.5px;
}
.job-company-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 6px;
}
.job-company {
  color: rgba(150,180,220,0.6); font-size: 13px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 60%;
}
.job-match-score {
  display: flex; align-items: center; gap: 6px;
}
.score-bar {
  width: 55px; height: 7px;
  background: rgba(74,158,255,0.12);
  border-radius: 4px;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.job-match-score.high .score-fill { background: linear-gradient(90deg, #00d4aa, #4a9eff); box-shadow: 0 0 10px rgba(0,212,170,0.8); }
.job-match-score.medium .score-fill { background: linear-gradient(90deg, #4a9eff, #3b82f6); box-shadow: 0 0 6px rgba(74,158,255,0.4); }
.job-match-score.low .score-fill { background: rgba(150,180,220,0.3); }
.job-match-score.high .score-text { color: #00d4aa; font-weight: 700; text-shadow: 0 0 8px rgba(0,212,170,0.5); }
.job-match-score.medium .score-text { color: #4a9eff; font-weight: 600; }
.job-match-score.low .score-text { color: rgba(150,180,220,0.5); }
.score-text { font-size: 11px; font-weight: 600; }
.match-basis {
  font-size: 10px;
  color: rgba(150,180,220,0.45);
  margin-bottom: 8px;
  font-style: italic;
}
.job-info-row {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin-bottom: 10px;
}
.info-chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 9px;
  background: rgba(74,158,255,0.1);
  border-radius: 10px;
  color: rgba(200,210,230,0.9);
  font-size: 12px;
}
.info-chip.tiny {
  background: rgba(150,180,220,0.08);
  color: rgba(150,180,220,0.6);
  font-size: 11px;
  padding: 2px 7px;
}
.job-tags-row {
  display: flex; flex-wrap: wrap; gap: 5px;
}
.skill-tag {
  padding: 3px 9px;
  background: rgba(74,158,255,0.15);
  border-radius: 10px;
  color: rgba(74,158,255,0.85);
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(74,158,255,0.2);
}
.welfare-badge {
  padding: 3px 9px;
  background: linear-gradient(135deg, rgba(251,146,60,0.18), rgba(239,68,68,0.12));
  border-radius: 10px;
  color: #fb923c;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(251,146,60,0.25);
}
.job-source-tag {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed rgba(74,158,255,0.1);
  font-size: 10px;
  color: rgba(150,180,220,0.35);
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(74,158,255,0.1);
}
.card-action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 10px;
  background: rgba(74,158,255,0.1);
  border: 1px solid rgba(74,158,255,0.25);
  border-radius: 8px;
  color: rgba(200,220,255,0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-action-btn:hover {
  background: rgba(74,158,255,0.2);
  color: #4a9eff;
  border-color: rgba(74,158,255,0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74,158,255,0.2);
}
.card-action-btn.favorited {
  background: rgba(251,146,60,0.15);
  border-color: rgba(251,146,60,0.4);
  color: #fb923c;
}
.card-action-btn.favorited:hover {
  background: rgba(251,146,60,0.25);
  box-shadow: 0 4px 12px rgba(251,146,60,0.3);
}
.card-action-btn.view-btn:hover {
  background: rgba(0,212,170,0.15);
  border-color: rgba(0,212,170,0.4);
  color: #00d4aa;
  box-shadow: 0 4px 12px rgba(0,212,170,0.2);
}
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(74,158,255,0.1);
}
.page-btn {
  padding: 8px 20px;
  background: rgba(74,158,255,0.15);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 8px;
  color: #4a9eff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { background: rgba(74,158,255,0.25); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { color: rgba(150,180,220,0.6); font-size: 13px; }

.lazy-load-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: rgba(74,158,255,0.7);
  font-size: 13px;
}
.lazy-load-indicator .loading-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.no-more-indicator {
  text-align: center;
  padding: 20px;
  color: rgba(150,180,220,0.3);
  font-size: 12px;
  letter-spacing: 1px;
}

.favorites-wrapper {
  position: relative;
  display: inline-block;
  z-index: 9999;
}
.fav-preview-popup {
  position: absolute;
  top: 55px;
  right: 0;
  width: 360px;
  background: rgba(10,20,45,0.98);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 14px;
  padding: 14px;
  z-index: 9999;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(74,158,255,0.15);
  animation: favPopIn 0.2s ease-out;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}
.fav-preview-popup::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 30px;
  width: 10px;
  height: 10px;
  background: rgba(10,20,45,0.98);
  border-left: 1px solid rgba(74,158,255,0.3);
  border-top: 1px solid rgba(74,158,255,0.3);
  transform: rotate(45deg);
}
@keyframes favPopIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fav-fade-enter-active,
.fav-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fav-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.fav-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.fav-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74,158,255,0.15);
}
.fav-preview-view-all {
  font-size: 11px;
  font-weight: 500;
  color: #4a9eff;
  cursor: pointer;
  padding: 3px 10px;
  background: rgba(74,158,255,0.1);
  border-radius: 10px;
  transition: all 0.2s;
}
.fav-preview-view-all:hover {
  background: rgba(74,158,255,0.25);
  color: #fff;
}
.fav-preview-list { max-height: 300px; overflow-y: auto; }
.fav-preview-list::-webkit-scrollbar { width: 4px; }
.fav-preview-list::-webkit-scrollbar-thumb { background: rgba(74,158,255,0.3); border-radius: 2px; }
.fav-preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(74,158,255,0.06);
  border: 1px solid rgba(74,158,255,0.1);
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.fav-preview-item:hover {
  background: rgba(74,158,255,0.15);
  border-color: rgba(74,158,255,0.4);
  transform: translateX(3px);
  box-shadow: 0 4px 15px rgba(74,158,255,0.2);
}
.fav-preview-item:hover .fav-preview-title { color: #fff; }
.fav-preview-item:active { transform: translateX(1px) scale(0.98); }
.fav-preview-title {
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 200px;
  transition: color 0.2s;
}
.fav-preview-salary {
  color: #4a9eff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  margin-right: 4px;
}
.fav-preview-arrow {
  color: rgba(150,180,220,0.4);
  transition: all 0.25s;
  opacity: 0;
  transform: translateX(-3px);
}
.fav-preview-item:hover .fav-preview-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #4a9eff;
}
.fav-preview-more {
  text-align: center;
  padding-top: 10px;
  margin-top: 6px;
  border-top: 1px solid rgba(74,158,255,0.1);
  color: rgba(74,158,255,0.6);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.fav-preview-more:hover { color: #4a9eff; }

.trend-modal {
  width: 90%;
  max-width: 700px;
}
.trend-header {
  text-align: center;
  margin-bottom: 20px;
}
.trend-header h2 {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.trend-subtitle { color: rgba(150,180,220,0.6); font-size: 13px; margin: 0; }
.trend-chart-container {
  background: rgba(5,10,30,0.5);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}
.trend-chart { width: 100%; height: auto; }
.trend-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.trend-stat {
  background: rgba(74,158,255,0.08);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.trend-stat .stat-label {
  display: block;
  color: rgba(150,180,220,0.6);
  font-size: 11px;
  margin-bottom: 4px;
}
.trend-stat .stat-value {
  display: block;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}
.trend-stat .stat-value.highlight { color: #00d4aa; }
.trend-stat .stat-value.trend-up { color: #00d4aa; }
.trend-stat .stat-value.trend-down { color: #fb923c; }
.trend-stat .stat-value.trend-flat { color: #4a9eff; }

.career-path-modal {
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}
.career-path-header {
  text-align: center;
  margin-bottom: 20px;
}
.career-path-header h2 {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.career-path-subtitle { color: rgba(150,180,220,0.6); font-size: 13px; margin: 0; }
.path-timeline { padding: 10px 0; }
.path-step {
  position: relative;
  padding-left: 50px;
  padding-bottom: 25px;
}
.path-step:last-child { padding-bottom: 0; }
.step-connector {
  position: absolute;
  left: 18px;
  top: -5px;
  width: 2px;
  height: 25px;
  background: linear-gradient(180deg, rgba(74,158,255,0.4), rgba(0,212,170,0.4));
}
.step-circle {
  position: absolute;
  left: 0;
  top: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 0 15px rgba(74,158,255,0.4);
}
.step-content {
  background: rgba(74,158,255,0.08);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 12px;
  padding: 14px 16px;
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.step-title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}
.step-duration {
  color: #00d4aa;
  font-size: 12px;
  padding: 3px 10px;
  background: rgba(0,212,170,0.15);
  border-radius: 12px;
}
.step-items {
  margin: 0 0 10px;
  padding-left: 18px;
}
.step-items li {
  color: rgba(200,210,230,0.8);
  font-size: 13px;
  margin-bottom: 4px;
  line-height: 1.5;
}
.step-tech {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tech-label {
  color: rgba(150,180,220,0.5);
  font-size: 12px;
}
.tech-tag {
  padding: 3px 10px;
  background: rgba(74,158,255,0.15);
  border-radius: 10px;
  color: #4a9eff;
  font-size: 11px;
}
.path-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(74,158,255,0.15);
}
.path-action-btn {
  padding: 10px 24px;
  background: rgba(74,158,255,0.15);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 10px;
  color: #4a9eff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.path-action-btn:hover { background: rgba(74,158,255,0.25); }
.path-action-btn.primary {
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  color: #fff;
  border-color: transparent;
}
.path-action-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(74,158,255,0.4); }
.trend-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px;
  background: rgba(0,212,170,0.12);
  border: 1px solid rgba(0,212,170,0.3);
  border-radius: 10px;
  color: #00d4aa;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.trend-btn:hover {
  background: rgba(0,212,170,0.22);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0,212,170,0.3);
}
.career-path-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(74,158,255,0.15));
  border: 1px solid rgba(168,85,247,0.35);
  border-radius: 10px;
  color: #a855f7;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.career-path-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(168,85,247,0.3);
}

.guest-overlay-tip {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: rgba(251,146,60,0.95);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  z-index: 300;
  box-shadow: 0 10px 30px rgba(251,146,60,0.4);
  animation: guestTipSlide 0.3s ease-out;
}
@keyframes guestTipSlide {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  animation: overlayFadeIn 0.2s ease-out;
}
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  width: 90%;
  max-width: 720px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(12, 22, 48, 0.98), rgba(8, 16, 36, 0.98));
  border: 1px solid rgba(74, 158, 255, 0.35);
  border-radius: 20px;
  padding: 35px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(74, 158, 255, 0.1);
  animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-content::-webkit-scrollbar { width: 6px; }
.modal-content::-webkit-scrollbar-thumb { background: rgba(74,158,255,0.3); border-radius: 3px; }
.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s;
  z-index: 10;
}
.modal-close:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: rotate(90deg);
}
.modal-header {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}
.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}
.favorites-count-header {
  color: rgba(150, 180, 220, 0.6);
  font-size: 13px;
}
.modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: rgba(74,158,255,0.3); border-radius: 2px; }

.detail-modal { max-width: 720px; }
.favorites-modal { max-width: 620px; }
.ai-explanation { 
  max-width: 520px;
  padding: 0;
  overflow: hidden;
}

.ai-explanation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4a9eff, #00d4aa, #a78bfa, transparent);
  background-size: 200% 100%;
  animation: borderScan 3s linear infinite;
}

@keyframes borderScan {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}

.ai-explanation-header {
  position: relative;
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid rgba(74, 158, 255, 0.12);
  background: linear-gradient(180deg, rgba(74, 158, 255, 0.05), transparent);
}

.ai-header-glow {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  background: radial-gradient(ellipse, rgba(74, 158, 255, 0.3), transparent 70%);
  pointer-events: none;
}

.ai-icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-icon-svg {
  position: relative;
  z-index: 2;
  color: #4a9eff;
  filter: drop-shadow(0 0 12px rgba(74, 158, 255, 0.8));
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.ai-icon-ring {
  position: absolute;
  inset: -8px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50%;
  animation: ringRotate 8s linear infinite;
}

.ai-icon-ring::before,
.ai-icon-ring::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border-top: 2px solid #4a9eff;
  border-right: 2px solid transparent;
}

.ai-icon-ring::before {
  animation: ringRotate 3s linear infinite;
}

.ai-icon-ring::after {
  inset: 4px;
  border-top-color: #00d4aa;
  animation: ringRotate 5s linear infinite reverse;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-explanation-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.ai-subtitle {
  font-size: 13px;
  color: rgba(150, 180, 220, 0.7);
  line-height: 1.6;
  margin: 0;
}

.ai-explanation-body {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-dimension-card {
  position: relative;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.04), rgba(0, 212, 170, 0.02));
  border: 1px solid rgba(74, 158, 255, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-dimension-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
}

.skills-dim::before { background: linear-gradient(180deg, #4a9eff, #3b82f6); }
.salary-dim::before { background: linear-gradient(180deg, #00d4aa, #10b981); }
.city-dim::before { background: linear-gradient(180deg, #f59e0b, #fb923c); }
.exp-dim::before { background: linear-gradient(180deg, #a78bfa, #8b5cf6); }

.ai-dimension-card:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(0, 212, 170, 0.04));
  border-color: rgba(74, 158, 255, 0.25);
  transform: translateX(4px);
}

.dim-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.dim-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skills-dim .dim-icon-box {
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
}
.salary-dim .dim-icon-box {
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
}
.city-dim .dim-icon-box {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.exp-dim .dim-icon-box {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
}

.dim-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.dim-desc {
  font-size: 12.5px;
  color: rgba(150, 180, 220, 0.7);
  line-height: 1.6;
  margin: 0 0 12px 48px;
}

.dim-weight {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 48px;
}

.weight-label {
  font-size: 11px;
  color: rgba(150, 180, 220, 0.5);
  letter-spacing: 0.5px;
}

.weight-value {
  font-size: 14px;
  font-weight: 700;
  color: #4a9eff;
  min-width: 42px;
}

.skills-dim .weight-value { color: #4a9eff; }
.salary-dim .weight-value { color: #00d4aa; }
.city-dim .weight-value { color: #f59e0b; }
.exp-dim .weight-value { color: #a78bfa; }

.weight-bar {
  flex: 1;
  height: 4px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.weight-progress {
  height: 100%;
  border-radius: 2px;
  animation: progressAnim 1.5s ease-out forwards;
  transform-origin: left;
}

.skills-dim .weight-progress { background: linear-gradient(90deg, #4a9eff, #3b82f6); }
.salary-dim .weight-progress { background: linear-gradient(90deg, #00d4aa, #10b981); }
.city-dim .weight-progress { background: linear-gradient(90deg, #f59e0b, #fb923c); }
.exp-dim .weight-progress { background: linear-gradient(90deg, #a78bfa, #8b5cf6); }

@keyframes progressAnim {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.ai-explanation-footer {
  padding: 20px 32px 28px;
  text-align: center;
  border-top: 1px solid rgba(74, 158, 255, 0.08);
  background: linear-gradient(0deg, rgba(74, 158, 255, 0.03), transparent);
}

.ai-confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 36px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4a9eff, #3b82f6);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.3);
}

.ai-confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(74, 158, 255, 0.45);
  background: linear-gradient(135deg, #5ba8ff, #4a90f6);
}

.ai-confirm-btn:active {
  transform: translateY(0);
}

.trend-modal { max-width: 680px; }
.career-path-modal { max-width: 720px; }

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: rgba(150, 180, 220, 0.5);
}
.empty-state svg { margin: 0 auto 18px; }
.empty-state p { font-size: 14px; }

.modal-header {
  margin-bottom: 20px;
  padding-bottom: 0;
  border-bottom: none;
  flex-shrink: 0;
}
.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
}
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.modal-tag {
  padding: 3px 10px;
  background: rgba(74,158,255,0.15);
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 12px;
  color: rgba(150,200,255,0.85);
  font-size: 11px;
}

.ai-analysis-card {
  background: linear-gradient(135deg, rgba(0,212,170,0.08), rgba(74,158,255,0.05));
  border: 1px solid rgba(0,212,170,0.2);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}
.ai-analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00d4aa;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
}
.resume-tag {
  margin-left: auto;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
}
.resume-tag.has-resume {
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
  border: 1px solid rgba(0, 212, 170, 0.3);
}
.resume-tag.no-resume {
  background: rgba(251, 146, 60, 0.12);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.25);
}
.ai-analysis-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.match-summary {
  display: flex;
  gap: 18px;
  align-items: stretch;
}
.match-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  transition: background 0.5s ease;
}
.match-circle::before {
  content: '';
  position: absolute;
  width: 68px;
  height: 68px;
  background: rgba(12,22,48,0.98);
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
}
.match-circle .pct {
  position: relative;
  z-index: 1;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.match-circle .pct-label {
  position: relative;
  z-index: 1;
  font-size: 10px;
  color: rgba(150,180,220,0.6);
}
.match-circle.high { box-shadow: 0 0 20px rgba(0,212,170,0.3); }
.match-circle.medium { box-shadow: 0 0 20px rgba(74,158,255,0.3); }
.match-circle.low { box-shadow: 0 0 20px rgba(251,146,60,0.3); }
.match-circle.none { box-shadow: 0 0 20px rgba(150,150,150,0.2); cursor: pointer; }
.match-circle .pct-resume {
  position: relative;
  z-index: 1;
  color: rgba(150,180,220,0.6);
  cursor: pointer;
}
.match-circle .pct-resume:hover {
  color: #4a9eff;
}
.match-circle.none .pct-label {
  color: #fb923c;
  cursor: pointer;
  text-decoration: underline;
}
.job-match-score.no-resume {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 12px;
  color: #fb923c;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.job-match-score.no-resume:hover {
  background: rgba(251, 146, 60, 0.2);
  border-color: rgba(251, 146, 60, 0.5);
  transform: translateY(-1px);
}
.match-basis.no-resume-hint {
  color: rgba(251, 146, 60, 0.7);
  font-size: 11px;
}
.match-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.match-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(200,220,255,0.85);
}
.match-item.good { color: #00d4aa; }
.match-item.warn { color: #fb923c; }
.match-item svg { flex-shrink: 0; }

.ai-salary-section {
  margin-bottom: 10px;
}
.salary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(74,158,255,0.08), rgba(154,117,255,0.08));
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 10px;
}
.salary-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.salary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.salary-value {
  font-size: 18px;
  font-weight: 700;
  color: #4a9eff;
}
.salary-level {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  width: fit-content;
}
.salary-level.level-高薪 {
  background: rgba(251,146,60,0.15);
  color: #fb923c;
}
.salary-level.level-较高 {
  background: rgba(74,158,255,0.15);
  color: #4a9eff;
}
.salary-level.level-中等 {
  background: rgba(0,212,170,0.15);
  color: #00d4aa;
}
.salary-level.level-偏低 {
  background: rgba(150,150,150,0.15);
  color: #999;
}
.salary-level.level-面议 {
  background: rgba(154,117,255,0.15);
  color: #9a75ff;
}
.salary-desc {
  font-size: 12px;
  color: rgba(200,220,255,0.6);
}

.ai-suggestion {
  background: rgba(168,85,247,0.08);
  border: 1px solid rgba(168,85,247,0.2);
  border-radius: 10px;
  padding: 12px 14px;
}
.ai-suggestion h5 {
  color: #a855f7;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.ai-suggestion ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ai-suggestion li {
  padding-left: 12px;
  position: relative;
  color: rgba(200,220,255,0.75);
  font-size: 12px;
  line-height: 1.5;
}
.ai-suggestion li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #a855f7;
}

.ai-stats-row {
  display: flex;
  gap: 10px;
}
.ai-stat {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(74,158,255,0.15);
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
}
.ai-stat .stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #4a9eff;
  margin-bottom: 3px;
}
.ai-stat .stat-label {
  font-size: 11px;
  color: rgba(150,180,220,0.55);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(74,158,255,0.12);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}
.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(74,158,255,0.08);
}
.detail-row:nth-last-child(-n+2) { border-bottom: none; }
.detail-row:nth-child(odd) { border-right: 1px solid rgba(74,158,255,0.08); }
.detail-label {
  font-size: 11px;
  color: rgba(150,180,220,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-value {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}
.detail-value.salary {
  color: #4a9eff;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(74,158,255,0.3);
}

.detail-section {
  margin-bottom: 18px;
}
.detail-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid #4a9eff;
}
.job-description {
  color: rgba(200,220,255,0.75);
  line-height: 1.7;
  font-size: 13px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
}
.requirement-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.requirement-list li {
  position: relative;
  padding-left: 18px;
  color: rgba(200,220,255,0.75);
  font-size: 13px;
  line-height: 1.5;
}
.requirement-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border-radius: 50%;
}

.modal-footer {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(74,158,255,0.15);
  flex-shrink: 0;
}
.modal-footer .save-btn {
  grid-column: 1 / -1;
}
.modal-footer .trend-btn,
.modal-footer .career-path-btn,
.modal-footer .ai-resume-btn,
.modal-footer .save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid;
}
.modal-footer .trend-btn {
  background: rgba(0,212,170,0.1);
  border-color: rgba(0,212,170,0.3);
  color: #00d4aa;
}
.modal-footer .trend-btn:hover {
  background: rgba(0,212,170,0.2);
}
.modal-footer .career-path-btn {
  background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(74,158,255,0.15));
  border-color: rgba(168,85,247,0.4);
  color: #a855f7;
}
.modal-footer .career-path-btn:hover {
  box-shadow: 0 4px 15px rgba(168,85,247,0.3);
  transform: translateY(-1px);
}
.modal-footer .ai-resume-btn {
  background: linear-gradient(135deg, rgba(251,146,60,0.12), rgba(168,85,247,0.12));
  border-color: rgba(251,146,60,0.3);
  color: #fb923c;
}
.modal-footer .ai-resume-btn:hover {
  box-shadow: 0 4px 15px rgba(251,146,60,0.25);
}
.modal-footer .save-btn {
  background: linear-gradient(135deg, rgba(74,158,255,0.2), rgba(0,212,170,0.15));
  border-color: rgba(74,158,255,0.5);
  color: #4a9eff;
  font-size: 14px;
  padding: 12px 16px;
}
.modal-footer .save-btn:hover {
  background: linear-gradient(135deg, rgba(74,158,255,0.35), rgba(0,212,170,0.25));
  box-shadow: 0 6px 20px rgba(74,158,255,0.3);
  transform: translateY(-1px);
}
.modal-footer .save-btn.favorited {
  background: linear-gradient(135deg, rgba(251,146,60,0.25), rgba(239,68,68,0.2));
  border-color: rgba(251,146,60,0.5);
  color: #fb923c;
  text-shadow: 0 0 10px rgba(251,146,60,0.3);
}
.modal-footer .save-btn.favorited:hover {
  box-shadow: 0 6px 20px rgba(251,146,60,0.3);
}

.data-update-notice {
  font-size: 10px;
  color: rgba(150,180,220,0.4);
  padding: 4px 10px;
  background: rgba(74,158,255,0.06);
  border-radius: 10px;
  border: 1px solid rgba(74,158,255,0.1);
}

.company-info-section h3,
.trend-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
}
.company-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.company-info-item {
  padding: 10px 14px;
  background: rgba(74,158,255,0.05);
  border: 1px solid rgba(74,158,255,0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.company-info-item.full {
  grid-column: 1 / -1;
}
.ci-label {
  font-size: 11px;
  color: rgba(150,180,220,0.5);
}
.ci-value {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}
.ci-value.brief {
  font-size: 12px;
  line-height: 1.6;
  color: rgba(200,210,230,0.8);
}
.company-type {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}
.company-type.type-listed { background: rgba(74,158,255,0.2); color: #4a9eff; }
.company-type.type-state { background: rgba(251,146,60,0.2); color: #fb923c; }
.company-type.type-small { background: rgba(0,212,170,0.2); color: #00d4aa; }
.company-type.type-private { background: rgba(168,85,247,0.2); color: #a855f7; }
.company-type.type-default { background: rgba(150,180,220,0.15); color: rgba(200,210,230,0.8); }
.company-type.type-unknown { background: rgba(100,116,139,0.15); color: rgba(148,163,184,0.7); }

.trend-chart-container {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  align-items: stretch;
}
.trend-canvas {
  width: 280px;
  height: 100px;
  background: rgba(10,20,45,0.5);
  border-radius: 10px;
  border: 1px solid rgba(74,158,255,0.1);
}
.trend-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.trend-stat {
  flex: 1;
  padding: 8px 12px;
  background: rgba(74,158,255,0.05);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.trend-value {
  font-size: 14px;
  font-weight: 700;
  color: #4a9eff;
}
.trend-label {
  font-size: 11px;
  color: rgba(150,180,220,0.5);
}

</style>