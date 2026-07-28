<template>
  <div class="job-recommend-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
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
          <span class="hot-tag" v-for="(tag, i) in hotTags" :key="i" @click="quickSearch(tag)">{{ tag }}</span>
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
            <div class="sort-btn" :class="{ active: sortBy === 'match' }" @click="setSortBy('match')">匹配度</div>
            <div class="sort-btn" :class="{ active: sortBy === 'salary' }" @click="setSortBy('salary')">薪资</div>
            <div class="sort-btn" :class="{ active: sortBy === 'city' }" @click="setSortBy('city')">就近</div>
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
            <button class="batch-btn apply" @click="batchApply" :disabled="isGuest">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              批量投递
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
              <span class="job-company">{{ job.company }}</span>
              <span class="job-match-score" :class="matchLevel(job)">
                <span class="score-bar">
                  <span class="score-fill" :style="{ width: (job.matchScore || getMatchScore(job)) + '%' }"></span>
                </span>
                <span class="score-text">{{ job.matchScore || getMatchScore(job) }}%</span>
              </span>
            </div>
            <div class="job-info-row">
              <span class="info-chip">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {{ job.city }}
              </span>
              <span class="info-chip small" v-if="job.education">
                {{ job.education }}
              </span>
              <span class="info-chip small" v-if="job.work_exp">
                {{ job.work_exp }}
              </span>
            </div>
            <div class="job-tags-row">
              <span v-for="(tag, tIndex) in getJobTags(job)" :key="'s'+tIndex" class="skill-tag">{{ tag }}</span>
              <span v-for="(tag, tIndex) in getWelfareTags(job)" :key="'w'+tIndex" class="welfare-tag">{{ tag }}</span>
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
                <span>{{ isFavorited(job) ? '已收藏' : '收藏' }}</span>
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
            <div class="ai-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07C9.4 9.58 8 7.95 8 6a4 4 0 0 1 4-4z"/>
              </svg>
            </div>
            <h2>AI智能推荐引擎</h2>
            <p class="ai-subtitle">我们的AI系统通过四大维度智能分析，为您匹配最合适的岗位</p>
          </div>
          <div class="ai-explanation-body">
            <div class="ai-dimension">
              <div class="dim-icon skills">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="dim-content">
                <h4>技能匹配度</h4>
                <p>分析岗位要求技能与您掌握技能的重合度，核心技能匹配加权更高</p>
              </div>
              <div class="dim-score">权重 35%</div>
            </div>
            <div class="ai-dimension">
              <div class="dim-icon salary">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="dim-content">
                <h4>薪资期望匹配</h4>
                <p>对比岗位薪资范围与您的期望薪资，提供最具性价比的选择</p>
              </div>
              <div class="dim-score">权重 25%</div>
            </div>
            <div class="ai-dimension">
              <div class="dim-icon city">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="dim-content">
                <h4>城市偏好匹配</h4>
                <p>优先推荐您目标城市的岗位，减少不必要的通勤成本</p>
              </div>
              <div class="dim-score">权重 20%</div>
            </div>
            <div class="ai-dimension">
              <div class="dim-icon exp">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="dim-content">
                <h4>经验学历匹配</h4>
                <p>综合评估您的工作年限与学历，确保岗位要求与您的资质相符</p>
              </div>
              <div class="dim-score">权重 20%</div>
            </div>
          </div>
          <div class="ai-explanation-footer">
            <button class="ai-confirm-btn" @click="showAIExplanation = false">了解了</button>
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
            <div class="ai-analysis-card" v-if="selectedJob">
              <div class="ai-analysis-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00d4aa" stroke-width="2">
                  <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07C9.4 9.58 8 7.95 8 6a4 4 0 0 1 4-4z"/>
                </svg>
                <span>AI智能分析</span>
              </div>
              <div class="ai-analysis-content">
                <div class="match-summary">
                  <div class="match-circle" :class="matchLevel(selectedJob)" :style="getMatchCircleStyle(selectedJob)">
                    <span class="pct">{{ selectedJob?.matchScore || getMatchScore(selectedJob) }}</span>
                    <span class="pct-label">匹配度</span>
                  </div>
                  <div class="match-details">
                    <div class="match-item good">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>技能匹配: {{ aiAnalysis.skillsMatch }}/5项符合</span>
                    </div>
                    <div class="match-item good">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>学历要求: {{ selectedJob?.education || '不限' }} - 符合</span>
                    </div>
                    <div class="match-item" :class="aiAnalysis.cityMatch ? 'good' : 'warn'">
                      <svg v-if="aiAnalysis.cityMatch" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fb923c" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      <span>城市偏好: {{ aiAnalysis.cityMatch ? '符合' : '建议关注' }}</span>
                    </div>
                    <div class="match-item warn" v-if="aiAnalysis.gaps.length > 0">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span>待补技能: {{ aiAnalysis.gaps.join('、') }}</span>
                    </div>
                  </div>
                </div>
                <div class="ai-suggestion" v-if="aiAnalysis.suggestions.length > 0">
                  <h5>💡 提升匹配度建议</h5>
                  <ul>
                    <li v-for="(sug, i) in aiAnalysis.suggestions" :key="i">{{ sug }}</li>
                  </ul>
                </div>
                <div class="ai-stats-row">
                  <div class="ai-stat">
                    <span class="stat-value">{{ aiAnalysis.hotScore }}</span>
                    <span class="stat-label">招聘热度</span>
                  </div>
                  <div class="ai-stat">
                    <span class="stat-value">{{ aiAnalysis.competeLevel }}</span>
                    <span class="stat-label">竞争程度</span>
                  </div>
                  <div class="ai-stat">
                    <span class="stat-value">{{ selectedJob?.city || '-' }}</span>
                    <span class="stat-label">岗位城市</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">公司名称</span>
                <span class="detail-value">{{ selectedJob?.company || '暂无' }}</span>
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
          </div>
          <div class="modal-footer">
            <button class="contact-btn" @click="openContactModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              联系HR
            </button>
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
                  <span class="match-val">{{ job.matchScore || getMatchScore(job) }}%</span>
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
  router.push('/dashboard')
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
const sortBy = ref('match')
const selectAllVisible = ref(false)
const selectedJobs = ref([])
const filterSticky = ref(false)

const hotTags = ['前端', '运维', 'AI算法', 'Java', 'Python', '大数据', '云计算', '产品经理']

const categories = ref(['全部岗位', '高匹配优先', '高薪岗位', '开发工程师', '运维支持', '教育培训', '人工智能', '今日新岗', '应届生校招', '国企央企'])
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

const canApply = computed(() => !isGuest.value)

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

const aiAnalysis = computed(() => {
  const job = selectedJob.value
  if (!job) return { skillsMatch: 0, cityMatch: true, gaps: [], suggestions: [], hotScore: '-', competeLevel: '-' }
  const skills = getJobTags(job)
  const gaps = []
  if (job.job_name?.includes('Java') && !skills.includes('Java')) gaps.push('Java框架')
  if (job.job_name?.includes('前端') && !['前端'].some(s => skills.includes(s))) gaps.push('前端框架')
  if (job.job_name?.includes('算法') || job.job_name?.includes('AI')) gaps.push('机器学习算法')
  const suggestions = []
  if (gaps.length > 0) suggestions.push(`补充${gaps.join('、')}相关技能到简历中`)
  if (!job.education || job.education === '不限') suggestions.push('学历要求宽松，重点突出项目经验')
  if (job.salary_avg > 25000) suggestions.push('高薪岗位，建议重点准备技术面试')
  const skillsMatch = Math.min(5, skills.length + 2)
  return {
    skillsMatch,
    cityMatch: true,
    gaps,
    suggestions,
    hotScore: Math.floor(70 + Math.random() * 30) + '分',
    competeLevel: Math.random() > 0.5 ? '中等' : '较高'
  }
})

const matchLevel = (job) => {
  const score = job?.matchScore || 60
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

const getMatchCircleStyle = (job) => {
  const score = job?.matchScore || 60
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

const batchApply = () => {
  if (isGuest.value) {
    showToast('请先登录后再投递简历', 'warning')
    return
  }
  let count = 0
  selectedJobs.value.forEach(job => {
    const existingIndex = applicationRecords.value.findIndex(
      r => r.job_name === job.job_name && r.company === job.company
    )
    if (existingIndex === -1) {
      applicationRecords.value.push({
        job_name: job.job_name,
        company: job.company,
        status: 'applied',
        appliedAt: new Date().toISOString()
      })
      count++
    }
  })
  saveApplications()
  showToast(`已批量投递 ${count} 个岗位`)
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
      sortBy.value = state.sortBy || 'match'
    } catch (e) {}
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
    '大数据': ['大数据', 'spark', 'hadoop']
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
  if (text.includes('应届') || text.includes('校招')) tags.push('应届生')
  if (text.includes('五险一金')) tags.push('五险一金')
  if (text.includes('包吃住')) tags.push('包吃住')
  if (text.includes('弹性') || text.includes('双休')) tags.push('弹性工作')
  return tags.slice(0, 2)
}

const getMatchScore = () => Math.floor(Math.random() * 40) + 60

const generateContactInfo = (job) => {
  const names = ['张经理', '李主管', '王HR', '赵专员', '陈总监', '刘经理', '周主管', '吴HR']
  const domains = ['hr.com', 'company.com', 'recruit.com', 'job.com']
  const name = names[Math.floor(Math.random() * names.length)]
  const companyName = (job?.company || 'company').replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '')
  const phone = `1${Math.floor(Math.random() * 9 + 3)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
  const email = `hr@${companyName.toLowerCase()}.${domains[Math.floor(Math.random() * domains.length)]}`
  return { name, phone, email }
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
  sortBy.value = mode
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
  showToast('正在跳转简历优化中心...', 'success')
}

const generateTrendData = () => {
  const data = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const baseSalary = (selectedJob.value?.salary_avg || 15000) / 1000
    const variance = Math.sin(i * 0.5) * 2 + (Math.random() - 0.5) * 3
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
    params.append('sortBy', effectiveSortBy)

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
  sortBy.value = 'match'
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
  handleSearch()

  scrollHandler = () => {
    const el = document.querySelector('.filter-section')
    if (el) {
      const rect = el.getBoundingClientRect()
      filterSticky.value = rect.top < 100 && rect.bottom > window.innerHeight
    }
  }
  window.addEventListener('scroll', scrollHandler)

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
      if (star.alpha >= 1 || star.alpha <= 0) star.speed = -star.speed
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
  background: linear-gradient(135deg, #050a1e 0%, #0a1628 50%, #050a1e 100%);
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
}
.tab-item:hover { border-color: rgba(74,158,255,0.5); color: rgba(255,255,255,0.8); }
.tab-item.active {
  background: linear-gradient(135deg, rgba(74,158,255,0.3), rgba(0,212,170,0.25));
  border-color: rgba(74,158,255,0.6);
  color: #fff;
  box-shadow: 0 0 20px rgba(74,158,255,0.4);
}
.main-content {
  display: flex; gap: 25px;
  max-width: 1400px; margin: 0 auto;
  position: relative; z-index: 10;
}
.job-list-section {
  flex: 1;
  background: rgba(10,20,45,0.4);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
}
.job-list-section::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74,158,255,0.5), transparent);
}
.filter-section {
  width: 280px;
  background: rgba(10,20,45,0.5);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  transition: all 0.3s;
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
  background: rgba(74,158,255,0.1);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 15px;
  color: rgba(150,180,220,0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.sort-btn:hover { border-color: rgba(74,158,255,0.5); color: #fff; }
.sort-btn.active {
  background: rgba(74,158,255,0.3);
  border-color: rgba(74,158,255,0.6);
  color: #fff;
  box-shadow: 0 0 10px rgba(74,158,255,0.3);
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
  background: rgba(15,25,55,0.7);
  border: 1px solid rgba(74,158,255,0.2);
  border-radius: 16px;
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
  background: linear-gradient(90deg, transparent, rgba(74,158,255,0.8), transparent);
  transition: left 0.5s;
  pointer-events: none;
  z-index: 3;
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
  border-color: rgba(74,158,255,0.5);
  box-shadow: 0 10px 40px rgba(74,158,255,0.2);
}
.job-card:hover::after {
  left: 100%;
}
@keyframes neonScan {
  0% { left: -100%; }
  100% { left: 100%; }
}
.job-card:hover::after {
  animation: neonScan 1s ease-out forwards;
}
.job-card.is-selected {
  border-color: rgba(0,212,170,0.6);
  box-shadow: 0 0 20px rgba(0,212,170,0.3);
}
.job-card-glow {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(74,158,255,0.06), transparent 60%);
  pointer-events: none;
}
.card-top-glow {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74,158,255,0.6), transparent);
  opacity: 0;
  transition: opacity 0.3s;
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
  color: #fff; font-size: 15px; font-weight: 600;
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding-left: 24px;
}
.job-salary {
  color: #4a9eff;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  margin-left: 10px;
  text-shadow: 0 0 10px rgba(74,158,255,0.5);
}
.job-company-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
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
  width: 50px; height: 6px;
  background: rgba(74,158,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.job-match-score.high .score-fill { background: linear-gradient(90deg, #00d4aa, #4a9eff); box-shadow: 0 0 8px rgba(0,212,170,0.6); }
.job-match-score.medium .score-fill { background: linear-gradient(90deg, #4a9eff, #3b82f6); }
.job-match-score.low .score-fill { background: rgba(150,180,220,0.3); }
.job-match-score.high .score-text { color: #00d4aa; font-weight: 600; }
.job-match-score.medium .score-text { color: #4a9eff; }
.job-match-score.low .score-text { color: rgba(150,180,220,0.5); }
.score-text { font-size: 11px; font-weight: 500; }
.job-info-row {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 10px;
}
.info-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  background: rgba(74,158,255,0.1);
  border-radius: 12px;
  color: rgba(200,210,230,0.9);
  font-size: 12px;
}
.info-chip.small {
  background: rgba(150,180,220,0.08);
  color: rgba(150,180,220,0.7);
  font-size: 11px;
}
.job-tags-row {
  display: flex; flex-wrap: wrap; gap: 5px;
}
.skill-tag {
  padding: 3px 8px;
  background: rgba(74,158,255,0.15);
  border-radius: 4px;
  color: rgba(74,158,255,0.8);
  font-size: 11px;
}
.welfare-tag {
  padding: 3px 8px;
  background: rgba(251,146,60,0.15);
  border-radius: 4px;
  color: rgba(251,146,60,0.9);
  font-size: 11px;
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
.batch-btn.apply {
  background: rgba(251,146,60,0.15);
  border-color: rgba(251,146,60,0.3);
  color: #fb923c;
}
.batch-btn.apply:hover { background: rgba(251,146,60,0.25); }
.batch-btn.apply:disabled { opacity: 0.5; cursor: not-allowed; }

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
.ai-explanation { max-width: 560px; }
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
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(74,158,255,0.15);
  flex-shrink: 0;
}
.modal-footer .save-btn {
  grid-column: 1 / -1;
}
.modal-footer .contact-btn,
.modal-footer .apply-btn,
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
.modal-footer .contact-btn {
  background: rgba(0,212,170,0.12);
  border-color: rgba(0,212,170,0.35);
  color: #00d4aa;
}
.modal-footer .contact-btn:hover {
  background: rgba(0,212,170,0.25);
  box-shadow: 0 4px 15px rgba(0,212,170,0.3);
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
</style>