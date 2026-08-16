<template>
  <div class="dashboard-page">
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
    
    <div class="dashboard-glow-bg"></div>

    <div class="top-bar">
      <div class="top-bar-left">
        <span class="logo-icon">◆</span>
        <span class="logo-text">IT学习与就业数据可视化导航系统</span>
      </div>
      <div class="top-bar-center">
        <div class="data-status" @click="refreshData" :title="'点击刷新数据'">
          <span class="status-dot" :class="{ active: dataStatus.loading }"></span>
          <span class="status-text">
            数据: {{ dataStatus.totalCount > 0 ? dataStatus.totalCount.toLocaleString() + ' 条' : '加载中' }}
          </span>
          <span class="status-refresh" :class="{ spinning: dataStatus.loading }">⟳</span>
        </div>
      </div>
      <div class="top-bar-right">
        <button class="profile-btn" @click="toggleProfilePanel">
          <div class="profile-avatar">
            <img :src="userAvatar" class="profile-avatar-img" alt="用户头像"/>
          </div>
          <div class="profile-info">
            <span class="profile-name">个人中心</span>
            <span class="profile-role">{{ userInfo.role }}</span>
          </div>
          <svg class="profile-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>
    </div>

    <Transition name="panel">
      <div class="profile-panel-overlay" v-if="showProfilePanel" @click="toggleProfilePanel"></div>
    </Transition>
    <Transition name="panel-slide">
      <div class="profile-panel" v-if="showProfilePanel">
        <div class="panel-header">
          <div class="panel-header-bg">
            <div class="aurora-blob blob-1"></div>
            <div class="aurora-blob blob-2"></div>
            <div class="aurora-blob blob-3"></div>
          </div>
          <div class="panel-header-grid"></div>
          <div class="panel-avatar-large" @click="triggerAvatarUpload" title="点击更换头像">
            <div class="avatar-ring-deco"></div>
            <div class="avatar-ring-deco-2"></div>
            <img :src="userAvatar" class="avatar-user-img" alt="用户头像"/>
            <div class="avatar-upload-hint">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <input ref="avatarInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarChange"/>
          </div>
          <div class="panel-user-info">
            <h3>{{ userInfo.name }}</h3>
            <p>{{ userInfo.role }} · {{ userInfo.loginType }}</p>
          </div>
          <button class="panel-close" @click="toggleProfilePanel">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="panel-stats-bar">
          <div class="stat-item clickable" @click="activeProfileTab = 'favorites'">
            <div class="stat-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div class="stat-value">{{ allFavoritesCount }}</div>
            <div class="stat-label">收藏</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-value">{{ userInfo.loginDays }}</div>
            <div class="stat-label">在线天数</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item clickable" @click="activeProfileTab = 'history'">
            <div class="stat-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="stat-value">{{ browseHistory.length }}</div>
            <div class="stat-label">浏览量</div>
          </div>
        </div>
        <div class="stats-progress-track">
          <div class="stats-progress-fill"></div>
        </div>

        <div class="panel-nav">
          <button class="nav-item" :class="{ active: activeProfileTab === 'info' }" @click="activeProfileTab = 'info'">
            <span class="nav-indicator"></span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>个人信息</span>
          </button>
          <button class="nav-item" :class="{ active: activeProfileTab === 'favorites' }" @click="activeProfileTab = 'favorites'">
            <span class="nav-indicator"></span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span>我的收藏</span>
            <span class="nav-badge" v-if="allFavoritesCount > 0">{{ allFavoritesCount }}</span>
          </button>
          <button class="nav-item" :class="{ active: activeProfileTab === 'history' }" @click="activeProfileTab = 'history'">
            <span class="nav-indicator"></span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span>浏览历史</span>
          </button>
          <button class="nav-item" :class="{ active: activeProfileTab === 'settings' }" @click="activeProfileTab = 'settings'">
            <span class="nav-indicator"></span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>系统设置</span>
          </button>
        </div>

        <div class="panel-content">
          <div class="tab-content" v-if="activeProfileTab === 'info'">
            <div class="info-section">
              <h4><span class="section-icon"></span>基本信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-item-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <label>用户名</label>
                    <span>{{ userInfo.name }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-item-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <label>角色</label>
                    <span>{{ userInfo.role }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-item-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <label>登录方式</label>
                    <span>{{ userInfo.loginType }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-item-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <label>注册时间</label>
                    <span>{{ userInfo.registerTime }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-item-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <label>最近登录</label>
                    <span>{{ userInfo.lastLogin }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-item-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div class="info-item-content">
                    <label>收藏数量</label>
                    <span>{{ allFavoritesCount }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="info-section" style="margin-top: 20px;">
              <h4>账号安全</h4>
              <div class="security-list">
                <div class="security-item">
                  <div class="security-icon ok">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <span>账号状态正常</span>
                  <span class="security-status ok">已验证</span>
                </div>
                <div class="security-item">
                  <div class="security-icon info">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <span>完善简历信息</span>
                  <span class="security-status info">建议</span>
                </div>
              </div>
            </div>
            <button class="edit-profile-btn" @click="openEditModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              编辑资料
            </button>
          </div>

          <div class="tab-content" v-if="activeProfileTab === 'favorites'">
            <div class="favorites-section">
              <!-- 收藏概览 -->
              <div class="fav-overview">
                <div class="fav-overview-card" @click="favSubTab = 'jobs'">
                  <div class="fav-overview-icon jobs">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div class="fav-overview-info">
                    <span class="fav-overview-num">{{ jobFavoritesCount }}</span>
                    <span class="fav-overview-label">岗位收藏</span>
                  </div>
                </div>
                <div class="fav-overview-card" @click="favSubTab = 'applied'">
                  <div class="fav-overview-icon applied">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div class="fav-overview-info">
                    <span class="fav-overview-num">{{ appliedJobsCount }}</span>
                    <span class="fav-overview-label">投递记录</span>
                  </div>
                </div>
                <div class="fav-overview-card" @click="favSubTab = 'resume'">
                  <div class="fav-overview-icon resume">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div class="fav-overview-info">
                    <span class="fav-overview-num">{{ hasResume ? '1' : '0' }}</span>
                    <span class="fav-overview-label">简历数据</span>
                  </div>
                </div>
                <div class="fav-overview-card" @click="favSubTab = 'learning'">
                  <div class="fav-overview-icon learning">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                    </svg>
                  </div>
                  <div class="fav-overview-info">
                    <span class="fav-overview-num">{{ learningProgressCount }}</span>
                    <span class="fav-overview-label">学习进度</span>
                  </div>
                </div>
              </div>

              <!-- 子标签切换 -->
              <div class="fav-sub-tabs">
                <button class="fav-sub-tab" :class="{ active: favSubTab === 'jobs' }" @click="favSubTab = 'jobs'">岗位收藏</button>
                <button class="fav-sub-tab" :class="{ active: favSubTab === 'applied' }" @click="favSubTab = 'applied'">投递记录</button>
                <button class="fav-sub-tab" :class="{ active: favSubTab === 'resume' }" @click="favSubTab = 'resume'">我的简历</button>
                <button class="fav-sub-tab" :class="{ active: favSubTab === 'learning' }" @click="favSubTab = 'learning'">学习进度</button>
              </div>

              <!-- 岗位收藏列表 -->
              <div v-if="favSubTab === 'jobs'" class="fav-detail-list">
                <div class="section-header">
                  <h4>岗位收藏</h4>
                  <span class="section-count">共 {{ jobFavoritesCount }} 个</span>
                </div>
                <div class="favorites-list" v-if="jobFavoritesCount > 0">
                  <div class="favorite-card" v-for="(job, index) in profileFavorites" :key="index" @click="router.push('/job-recommend')">
                    <div class="favorite-card-info">
                      <div class="favorite-card-title">{{ job.job_name }}</div>
                      <div class="favorite-card-meta">{{ job.company }} - {{ job.city }}</div>
                      <div class="favorite-card-salary">{{ formatFavoriteSalary(job.salary_avg) }}</div>
                    </div>
                    <div class="favorite-card-time">{{ formatFavoriteTime(job.favoriteTime) }}</div>
                  </div>
                </div>
                <div class="empty-state" v-else>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  <p>暂无收藏的岗位</p>
                  <p class="empty-hint">前往岗位推荐页面收藏感兴趣的岗位</p>
                </div>
              </div>

              <!-- 投递记录列表 -->
              <div v-if="favSubTab === 'applied'" class="fav-detail-list">
                <div class="section-header">
                  <h4>投递记录</h4>
                  <span class="section-count">共 {{ appliedJobsCount }} 个</span>
                </div>
                <div class="favorites-list" v-if="appliedJobsCount > 0">
                  <div class="favorite-card" v-for="(job, index) in appliedJobs" :key="index">
                    <div class="favorite-card-info">
                      <div class="favorite-card-title">{{ job.job_name }}</div>
                      <div class="favorite-card-meta">{{ job.company }} - {{ job.city }}</div>
                      <div class="applied-status" :class="job.status || 'pending'">{{ getAppliedStatusText(job.status) }}</div>
                    </div>
                    <div class="favorite-card-time">{{ formatFavoriteTime(job.applyTime) }}</div>
                  </div>
                </div>
                <div class="empty-state" v-else>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p>暂无投递记录</p>
                  <p class="empty-hint">在岗位推荐页面投递岗位后将在此显示</p>
                </div>
              </div>

              <!-- 简历数据 -->
              <div v-if="favSubTab === 'resume'" class="fav-detail-list">
                <div class="section-header">
                  <h4>我的简历</h4>
                </div>
                <div v-if="hasResume" class="resume-summary-card" @click="router.push('/ai-resume')">
                  <div class="resume-summary-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div class="resume-summary-info">
                    <div class="resume-summary-name">{{ resumeSummary.name || '未填写' }}</div>
                    <div class="resume-summary-meta">{{ resumeSummary.education || '学历未填' }} · {{ resumeSummary.intention || '求职意向未填' }}</div>
                    <div class="resume-summary-skills" v-if="resumeSummary.skills && resumeSummary.skills.length > 0">
                      <span class="skill-tag-sm" v-for="skill in resumeSummary.skills.slice(0, 5)" :key="skill">{{ skill }}</span>
                      <span class="skill-tag-sm more" v-if="resumeSummary.skills.length > 5">+{{ resumeSummary.skills.length - 5 }}</span>
                    </div>
                  </div>
                  <div class="resume-summary-arrow">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
                <div class="empty-state" v-else>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p>暂无简历数据</p>
                  <p class="empty-hint">前往AI简历页面创建您的简历</p>
                </div>
              </div>

              <!-- 学习进度 -->
              <div v-if="favSubTab === 'learning'" class="fav-detail-list">
                <div class="section-header">
                  <h4>学习进度</h4>
                </div>
                <div v-if="learningProgressCount > 0" class="learning-list">
                  <div class="learning-card" v-for="(item, index) in learningProgressList" :key="index" @click="router.push('/planning')">
                    <div class="learning-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                      </svg>
                    </div>
                    <div class="learning-info">
                      <div class="learning-title">{{ item.position }}</div>
                      <div class="learning-progress-bar">
                        <div class="learning-progress-fill" :style="{ width: item.progress + '%' }"></div>
                      </div>
                      <span class="learning-percent">{{ item.progress }}%</span>
                    </div>
                  </div>
                </div>
                <div class="empty-state" v-else>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                  </svg>
                  <p>暂无学习进度</p>
                  <p class="empty-hint">前往学业规划页面开始学习</p>
                </div>
              </div>
            </div>
          </div>

          <div class="tab-content" v-if="activeProfileTab === 'history'">
            <div class="history-section">
              <div class="section-header">
                <h4>浏览历史</h4>
                <button class="clear-history-btn" v-if="browseHistory.length > 0" @click="clearBrowseHistory">清空历史</button>
              </div>
              <div class="history-list" v-if="browseHistory.length > 0">
                <div class="history-item" v-for="(item, index) in browseHistory" :key="index" @click="goToHistoryPage(item)">
                  <div class="history-icon" :class="item.type">
                    <svg v-if="item.type === 'job'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <svg v-else-if="item.type === 'resume'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <svg v-else-if="item.type === 'planning'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
                    </svg>
                    <svg v-else-if="item.type === 'prediction'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M8 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div class="history-info">
                    <span class="history-title">{{ item.title }}</span>
                    <span class="history-page">{{ item.pageName }}</span>
                  </div>
                  <span class="history-time">{{ formatFavoriteTime(item.time) }}</span>
                </div>
              </div>
              <div class="empty-state" v-else>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <p>暂无浏览记录</p>
                <p class="empty-hint">浏览各功能页面后将在此显示记录</p>
              </div>
            </div>
          </div>

          <div class="tab-content" v-if="activeProfileTab === 'settings'">
            <div class="settings-section">
              <h4>系统设置</h4>
              <div class="settings-item">
                <div class="settings-label">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>深色模式</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.darkMode"/>
                  <span class="slider"></span>
                </label>
              </div>
              <div class="settings-item">
                <div class="settings-label">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span>通知提醒</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notifications"/>
                  <span class="slider"></span>
                </label>
              </div>
              <div class="settings-item">
                <div class="settings-label">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>自动更新</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.autoUpdate"/>
                  <span class="slider"></span>
                </label>
              </div>
              <div class="settings-item">
                <div class="settings-label">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>数据同步</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.dataSync"/>
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <button class="panel-logout-btn" @click="logout">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 编辑资料弹窗 -->
    <Transition name="panel">
      <div class="edit-modal-overlay" v-if="showEditModal" @click="closeEditModal"></div>
    </Transition>
    <Transition name="panel-slide">
      <div class="edit-modal" v-if="showEditModal">
        <div class="edit-modal-header">
          <h3>编辑个人资料</h3>
          <button class="edit-modal-close" @click="closeEditModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="edit-modal-body">
          <div class="edit-avatar-section" @click="triggerAvatarUpload">
            <div class="edit-avatar-preview">
              <img :src="userAvatar" alt="头像预览"/>
            </div>
            <span class="edit-avatar-text">点击更换头像</span>
          </div>
          <div class="edit-form-group">
            <label>用户名</label>
            <input v-model="editForm.name" type="text" placeholder="请输入用户名"/>
          </div>
          <div class="edit-form-group">
            <label>角色</label>
            <input v-model="editForm.role" type="text" placeholder="请输入角色"/>
          </div>
          <div class="edit-form-group">
            <label>登录方式</label>
            <select v-model="editForm.loginType">
              <option value="游客登录">游客登录</option>
              <option value="账号登录">账号登录</option>
              <option value="微信登录">微信登录</option>
              <option value="QQ登录">QQ登录</option>
            </select>
          </div>
        </div>
        <div class="edit-modal-footer">
          <button class="edit-cancel-btn" @click="closeEditModal">取消</button>
          <button class="edit-save-btn" @click="saveEditModal">保存</button>
        </div>
      </div>
    </Transition>

    <div class="top-modules">
      <div 
        class="module-card function-module" 
        :class="{ active: activeModule === 'function' }"
        @click="activeModule = 'function'"
      >
        <!-- 光晕外壳 -->
        <div class="card-shell"></div>
        <div class="card-glow-ring"></div>
        <!-- 扫光动画层 -->
        <div class="card-shine"></div>
        <!-- 顶部能量条 -->
        <div class="energy-bar"></div>
        <!-- 内部流动光线 -->
        <div class="flow-line flow-line-1"></div>
        <div class="flow-line flow-line-2"></div>
        <!-- 底部光晕底座 -->
        <div class="module-base-glow"></div>
        <!-- 边角装饰 -->
        <div class="deco-ring deco-ring-1"></div>
        <div class="deco-ring deco-ring-2"></div>
        
        <div class="module-content">
          <!-- 3D六边形图标容器 -->
          <div class="module-icon-wrapper">
            <div class="module-icon-3d">
              <div class="icon-face front">
                <svg viewBox="0 0 60 60" width="36" height="36">
                  <rect x="10" y="20" width="12" height="25" rx="2" fill="url(#funcGrad)" opacity="0.95"/>
                  <rect x="24" y="12" width="12" height="33" rx="2" fill="url(#funcGrad)" opacity="0.95"/>
                  <rect x="38" y="18" width="12" height="27" rx="2" fill="url(#funcGrad)" opacity="0.95"/>
                  <defs>
                    <linearGradient id="funcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#4a9eff"/>
                      <stop offset="100%" style="stop-color:#00d4aa"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div class="icon-reflection"></div>
          </div>
          <h3 class="module-title">功能模块</h3>
        </div>
        <div class="module-corner tl"></div>
        <div class="module-corner tr"></div>
        <div class="module-corner bl"></div>
        <div class="module-corner br"></div>
        <div class="module-indicator" v-if="activeModule === 'function'"></div>
      </div>

      <div 
        class="module-card visualization-module" 
        :class="{ active: activeModule === 'visualization' }"
        @click="goToVisualization"
      >
        <!-- 光晕外壳 -->
        <div class="card-shell"></div>
        <div class="card-glow-ring"></div>
        <!-- 扫光动画层 -->
        <div class="card-shine"></div>
        <!-- 顶部能量条 -->
        <div class="energy-bar"></div>
        <!-- 内部流动光线 -->
        <div class="flow-line flow-line-1"></div>
        <div class="flow-line flow-line-2"></div>
        <!-- 底部光晕底座 -->
        <div class="module-base-glow"></div>
        <!-- 边角装饰 -->
        <div class="deco-ring deco-ring-1"></div>
        <div class="deco-ring deco-ring-2"></div>
        
        <div class="module-content">
          <!-- 3D六边形图标容器 -->
          <div class="module-icon-wrapper">
            <div class="module-icon-3d">
              <div class="icon-face front">
                <svg viewBox="0 0 60 60" width="36" height="36">
                  <circle cx="30" cy="30" r="20" fill="none" stroke="url(#vizGrad)" stroke-width="2"/>
                  <circle cx="30" cy="30" r="12" fill="none" stroke="url(#vizGrad)" stroke-width="1.5"/>
                  <circle cx="30" cy="30" r="5" fill="url(#vizGrad)"/>
                  <line x1="30" y1="10" x2="30" y2="50" stroke="url(#vizGrad)" stroke-width="1" opacity="0.5"/>
                  <line x1="10" y1="30" x2="50" y2="30" stroke="url(#vizGrad)" stroke-width="1" opacity="0.5"/>
                  <defs>
                    <linearGradient id="vizGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#4a9eff"/>
                      <stop offset="100%" style="stop-color:#7b68ee"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div class="icon-reflection"></div>
          </div>
          <h3 class="module-title">可视化模块</h3>
        </div>
        <div class="module-corner tl"></div>
        <div class="module-corner tr"></div>
        <div class="module-corner bl"></div>
        <div class="module-corner br"></div>
        <div class="module-indicator" v-if="activeModule === 'visualization'"></div>
      </div>
    </div>

    <div class="main-section">
      <div class="section-header">
        <div class="header-line"></div>
        <span>系统轮播图</span>
        <div class="header-line"></div>
      </div>

      <div class="main-content">
        <div class="left-panel community-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>求职社区</span>
          </div>
          <div class="community-posts">
            <div class="post-item" v-for="(post, index) in communityPosts" :key="index" @click="router.push('/job-community')">
              <div class="post-avatar">
                <img :src="post.avatar" :alt="post.author"/>
              </div>
              <div class="post-content">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-meta">
                  <span class="post-author">{{ post.author }}</span>
                  <span class="post-time">{{ post.time }}</span>
                  <span class="post-comments">{{ post.comments }}评论</span>
                </div>
              </div>
              <div class="post-badge" v-if="post.hot">🔥</div>
            </div>
          </div>
          <div class="panel-footer" @click="router.push('/job-community')">
            <span>查看更多</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="center-panel carousel-panel">
          <div class="carousel-wrapper">
            <div class="carousel-content" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
              <div class="carousel-item" v-for="(slide, index) in carouselSlides" :key="index">
                <div class="slide-card" :style="{ backgroundImage: `linear-gradient(135deg, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.4) 50%, rgba(10,20,40,0.1) 100%), url(${slide.bgImage})` }">
                  <div class="slide-icon">{{ slide.icon }}</div>
                  <h4>{{ slide.title }}</h4>
                  <p>{{ slide.desc }}</p>
                  <div class="slide-data">
                    <div class="data-item">
                      <span class="data-value">{{ slide.data1.value }}</span>
                      <span class="data-label">{{ slide.data1.label }}</span>
                    </div>
                    <div class="data-item">
                      <span class="data-value">{{ slide.data2.value }}</span>
                      <span class="data-label">{{ slide.data2.label }}</span>
                    </div>
                    <div class="data-item">
                      <span class="data-value">{{ slide.data3.value }}</span>
                      <span class="data-label">{{ slide.data3.label }}</span>
                    </div>
                  </div>
                  <button class="slide-btn">立即查看</button>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-indicators">
            <span v-for="(_, index) in carouselSlides" :key="index" 
              class="indicator" :class="{ active: currentSlide === index }"
              @click="currentSlide = index"></span>
          </div>
        </div>

        <div class="right-panel resume-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <span>求职简历</span>
          </div>

          <div class="resume-avatar-section">
            <div class="tech-avatar cartoon" @mouseenter="onResumeBtnEnter" @mouseleave="onResumeBtnLeave">
              <img :src="resumeAvatar" alt="简历头像" class="resume-avatar-img"/>
              <div class="avatar-ring"></div>
              <div class="avatar-ring ring-2"></div>
              <div class="avatar-hint">悬停查看简历</div>
            </div>
          </div>

          <div class="resume-summary">
            <div class="summary-header">
              <div class="summary-name">{{ resumeSummary.name || '同学' }}</div>
              <div class="summary-intention">{{ resumeSummary.intention || '求职意向：未填写' }}</div>
            </div>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-value">{{ resumeSummary.skills ? resumeSummary.skills.length : 0 }}</span>
                <span class="stat-label">技能</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ resumeSummary.projects ? resumeSummary.projects.length : 0 }}</span>
                <span class="stat-label">项目</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ hasResume ? '✓' : '—' }}</span>
                <span class="stat-label">简历</span>
              </div>
            </div>
            <div class="skill-chips" v-if="resumeSummary.skills && resumeSummary.skills.length > 0">
              <span v-for="s in resumeSummary.skills.slice(0, 3)" :key="s" class="skill-chip">{{ s }}</span>
              <span v-if="resumeSummary.skills.length > 3" class="skill-chip more">+{{ resumeSummary.skills.length - 3 }}</span>
            </div>
            <div class="skill-chips empty-hint" v-else>暂无技能</div>
          </div>

          <div class="resume-btn-wrapper">
            <button class="resume-btn primary" @click="openResume">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              {{ hasResume ? '查看完整简历' : '创建AI简历' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3D沉浸式功能区 -->
    <div class="immersive-zone">
      <!-- 镜面反射平台 -->
      <div class="reflective-platform"></div>
      
      <!-- 背景光束 -->
      <div class="light-beams">
        <div class="beam beam-1"></div>
        <div class="beam beam-2"></div>
        <div class="beam beam-3"></div>
      </div>
      
      <!-- 漂浮光粒子 -->
      <div class="floating-particles">
        <span class="particle" v-for="n in 20" :key="n" 
          :style="{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            '--particle-size': `${2 + Math.random() * 4}px`,
            '--particle-color': bottomModules[n % 5].color
          }">
        </span>
      </div>
      
      <!-- 3D弧形卡片容器 -->
      <div class="cards-3d-container">
        <div class="cards-arc">
          <div class="arc-tilt"></div>
          <div 
            class="bottom-card-3d" 
            :class="['card-3d', 'card-' + module.key, `pos-${index}`]" 
            v-for="(module, index) in bottomModules" 
            :key="index"
            :style="{ 
              '--theme-color': module.color, 
              '--theme-rgb': hexToRgb(module.color),
              '--card-delay': `${index * 0.12}s`
            }"
            @click="navigateTo(module.key)">
            <!-- 玻璃底座 -->
            <div class="card-base">
              <div class="base-reflection"></div>
              <div class="base-glow"></div>
            </div>
            
            <!-- 玻璃卡片主体 -->
            <div class="card-glass">
              <!-- 3D立体图标 -->
              <div class="icon-3d" :style="{ '--icon-color': module.color }">
                <div class="icon-cube">
                  <svg :viewBox="module.iconViewBox" width="48" height="48" v-html="module.icon"></svg>
                </div>
                <div class="icon-glow-ring"></div>
                <div class="icon-shadow"></div>
              </div>
              
              <!-- 标题和描述 -->
              <h3 class="card-title">{{ module.title }}</h3>
              <p class="card-description">{{ module.desc }}</p>
              
              <!-- 进入按钮 -->
              <button class="enter-btn">
                <span class="btn-text">进入</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <div class="btn-shine"></div>
              </button>
              
              <!-- 高光点缀 -->
              <div class="glass-highlight"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 悬浮预览：深色主题卡片风格 -->
  <transition name="hover-fade">
    <div v-if="showResumeHover" class="resume-hover-overlay">
      <div v-if="hasResume && resumeData" class="resume-hover-card">
        <div class="hover-card-header">
          <div class="hover-card-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="color:#4a9eff;margin-right:8px">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>个人简历预览</span>
          </div>
          <div class="hover-card-badge">悬浮预览</div>
        </div>
        <div class="hover-card-body">
          <div class="hover-section">
            <div class="hover-name-row">
              <div class="hover-avatar">
                <img v-if="resumeData.photo" :src="resumeData.photo" alt=""/>
                <img v-else :src="defaultUserAvatar" class="hover-avatar-ph"/>
              </div>
              <div class="hover-name-info">
                <div class="hover-name">{{ resumeData.name || '未填写' }}</div>
                <div class="hover-intention">{{ resumeData.intention || '未填写求职意向' }}</div>
                <div class="hover-contact">
                  <span v-if="resumeData.phone">📞 {{ resumeData.phone }}</span>
                  <span v-if="resumeData.email">✉ {{ resumeData.email }}{{ resumeData.emailType ? '@' + resumeData.emailType + '.com' : '' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="hover-section">
            <h4 class="hover-section-title"><span class="hover-title-bar"></span>教育背景</h4>
            <div class="hover-info-row">
              <span class="hover-item">{{ resumeData.school || '未填写' }}</span>
              <span class="hover-item-light">{{ resumeData.major || '' }}</span>
              <span class="hover-item-light">{{ (resumeData.education || '') + (resumeData.degree ? ' · ' + resumeData.degree : '') }}</span>
            </div>
          </div>
          <div v-if="resumeData.company || resumeData.position" class="hover-section">
            <h4 class="hover-section-title"><span class="hover-title-bar"></span>实习经历</h4>
            <div class="hover-timeline-item">
              <div class="hover-timeline-dot"></div>
              <div class="hover-timeline-content">
                <div class="hover-timeline-header">
                  <span class="hover-timeline-title">{{ resumeData.position || '未填写' }}</span>
                  <span class="hover-timeline-sub">{{ resumeData.company || '' }}</span>
                </div>
                <div v-if="resumeData.responsibilities" class="hover-timeline-desc">{{ resumeData.responsibilities }}</div>
              </div>
            </div>
          </div>
          <div v-if="resumeData.projects && resumeData.projects.length > 0" class="hover-section">
            <h4 class="hover-section-title"><span class="hover-title-bar"></span>项目经历</h4>
            <div v-for="(project, index) in resumeData.projects" :key="index" class="hover-timeline-item" v-show="project && project.name">
              <div class="hover-timeline-dot"></div>
              <div class="hover-timeline-content">
                <div class="hover-timeline-header">
                  <span class="hover-timeline-title">{{ project.name }}</span>
                  <span class="hover-timeline-sub">{{ project.role || '' }}</span>
                </div>
                <div v-if="project.desc" class="hover-timeline-desc">{{ project.desc }}</div>
              </div>
            </div>
          </div>
          <div v-if="resumeData.skills && resumeData.skills.length > 0" class="hover-section">
            <h4 class="hover-section-title"><span class="hover-title-bar"></span>专业技能</h4>
            <div class="hover-skills">
              <span v-for="skill in resumeData.skills" :key="skill" class="hover-skill-tag">{{ skill }}</span>
            </div>
          </div>
        </div>
        <div class="hover-card-footer">
          <span>点击查看完整简历 →</span>
        </div>
      </div>
      <div v-else-if="!hasResume" class="resume-hover-card empty-hover-card">
        <div class="hover-empty-icon">📄</div>
        <div class="hover-empty-text">您还没有简历</div>
        <div class="hover-empty-hint">点击按钮创建AI简历</div>
      </div>
    </div>
  </transition>

  <div v-if="showResumeModal" class="resume-modal" @click.self="closeResume">
    <div class="resume-container">
      <div class="resume-header">
        <h2>个人简历</h2>
        <button class="close-btn" @click="closeResume">×</button>
      </div>
      <div class="resume-content">
        <div class="resume-main" v-if="resumeData">
          <div class="section">
            <h3>基本信息</h3>
            <div class="basic-info">
              <div class="info-content">
                <div class="personal-header">
                  <div class="name-title">
                    <h2>{{ resumeData.name || '未填写' }}</h2>
                    <p>{{ resumeData.intention || '未填写' }}</p>
                  </div>
                </div>
                <div class="info-grid">
                  <div><span class="label">性别：</span>{{ resumeData.gender || '未填写' }}</div>
                  <div><span class="label">年龄：</span>{{ resumeData.age || '未填写' }}</div>
                  <div><span class="label">籍贯：</span>{{ resumeData.origin || '未填写' }}</div>
                  <div><span class="label">现居地：</span>{{ resumeData.residence || '未填写' }}</div>
                  <div><span class="label">联系电话：</span>{{ resumeData.phone || '未填写' }}</div>
                  <div><span class="label">邮箱：</span>{{ resumeData.email && resumeData.emailType ? resumeData.email + '@' + resumeData.emailType + '.com' : (resumeData.email ? resumeData.email : '未填写') }}</div>
                </div>
              </div>
              <div class="photo-section">
                <img v-if="resumeData.photo" :src="resumeData.photo" alt="照片" class="resume-photo"/>
                <div v-else class="photo-placeholder-resume">
                  <svg viewBox="0 0 24 24" width="40" height="40">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#ccc"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>教育背景</h3>
            <div class="timeline-item">
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="title">{{ resumeData.school || '未填写' }}</span>
                  <span class="time">{{ resumeData.schoolStart || '' }} - {{ resumeData.schoolEnd || '' }}</span>
                </div>
                <p><span class="label">专业：</span>{{ resumeData.major || '未填写' }}</p>
                <p><span class="label">学历：</span>{{ resumeData.education || '未填写' }}（{{ resumeData.degree || '' }}）</p>
                <p v-if="resumeData.courses" class="desc"><span class="label">主修课程：</span>{{ resumeData.courses }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>实习经历</h3>
            <div class="timeline-item">
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="title">{{ resumeData.company || '未填写' }}</span>
                  <span class="time">{{ resumeData.workStart || '' }} - {{ resumeData.workEnd || '' }}</span>
                </div>
                <p><span class="label">职位：</span>{{ resumeData.position || '未填写' }}</p>
                <p><span class="label">行业：</span>{{ resumeData.industry || '未填写' }}</p>
                <p><span class="label">经验：</span>{{ resumeData.experience || '未填写' }}</p>
                <p v-if="resumeData.responsibilities" class="desc"><span class="label">岗位职责：</span>{{ resumeData.responsibilities }}</p>
                <p v-if="resumeData.achievements" class="desc"><span class="label">工作业绩：</span>{{ resumeData.achievements }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>曾获奖项</h3>
            <div v-if="resumeData.honors" class="timeline-item">
              <div class="timeline-content">
                <p class="desc" v-for="(honor, idx) in resumeData.honors.split('\n').filter(h => h.trim())" :key="idx">• {{ honor }}</p>
              </div>
            </div>
            <p v-else class="no-data">暂无获奖信息</p>
          </div>

          <div class="section">
            <h3>项目经历</h3>
            <div v-if="resumeData.projects && resumeData.projects.length > 0">
              <div v-for="(project, index) in resumeData.projects" :key="index" class="timeline-item" v-show="project.name">
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="title">项目{{ index + 1 }}：{{ project.name || '未命名项目' }}</span>
                    <span class="time">{{ project.duration || '' }}</span>
                  </div>
                  <p><span class="label">角色：</span>{{ project.role || '未填写' }}</p>
                  <p v-if="project.desc" class="desc"><span class="label">项目描述：</span>{{ project.desc }}</p>
                  <p v-if="project.achievements" class="desc"><span class="label">项目成果：</span>{{ project.achievements }}</p>
                </div>
              </div>
            </div>
            <p v-else class="no-data">暂无项目经历</p>
          </div>

          <div class="section">
            <h3>专业技能</h3>
            <div v-if="resumeData.skills && resumeData.skills.length > 0" class="skills-container">
              <span v-for="skill in resumeData.skills" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
            <p v-else class="no-data">暂无技能信息</p>
          </div>

          <div class="section">
            <h3>自我评价</h3>
            <p v-if="resumeData.strengths" class="desc">{{ resumeData.strengths }}</p>
            <p v-else class="no-data">暂无自我评价</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logout as authLogout, getAuthInfo } from '@/utils/auth'
import { useGuestMode } from '@/composables/useGuestMode'
import { generateAvatar, generateGuestName, getRandomAvatar } from '@/utils/avatar'

import carouselImg1 from '@/assets/carousel/slide1-jobs.jpg'
import carouselImg2 from '@/assets/carousel/slide2-skills.jpg'
import carouselImg3 from '@/assets/carousel/slide3-salary.jpg'
import carouselImg4 from '@/assets/carousel/slide4-cities.jpg'

const carouselImages = {
  jobs: carouselImg1,
  skills: carouselImg2,
  salary: carouselImg3,
  cities: carouselImg4
}

const { refreshAuthState } = useGuestMode()
let jobData = []

const dataStatus = ref({ loading: false, lastUpdated: null, totalCount: 0, sources: {} })
const dataInfo = ref({ lastUpdated: null })

const fetchDataInfo = async () => {
  try {
    const resp = await fetch('/api/jobs/data-info')
    if (resp.ok) {
      const result = await resp.json()
      if (result.success) {
        dataStatus.value = {
          loading: false,
          lastUpdated: result.data.lastUpdated,
          totalCount: result.data.totalCount,
          sources: result.data.dataSources
        }
      }
    }
  } catch (e) {
    // API不可用时保持静默
  }
}

const refreshData = async () => {
  dataStatus.value.loading = true
  try {
    const resp = await fetch('/api/jobs/reload', { method: 'POST' })
    if (resp.ok) {
      const result = await resp.json()
      if (result.success) {
        await fetchDataInfo()
        // 重新加载岗位数据
        const dataResp = await fetch('/data/all_cleaned_jobs.json')
        if (dataResp.ok) {
          jobData = await dataResp.json()
          updateCarouselStats()
        }
      }
    }
  } catch (e) {
    console.warn('数据刷新失败:', e.message)
  } finally {
    dataStatus.value.loading = false
  }
}

const updateCarouselStats = () => {
  if (!jobData.length) return
  const totalJobs = jobData.length
  const avgSalary = Math.round(jobData.reduce((sum, job) => sum + (job.salary_avg || 0), 0) / totalJobs)
  const cities = [...new Set(jobData.map(j => j.city))].length
  carouselSlides.value[0] = {
    icon: '📊',
    title: '实时有效岗位',
    desc: '当前市场最新岗位动态与趋势分析',
    bgImage: carouselImages.jobs,
    data1: { value: totalJobs.toLocaleString(), label: '有效岗位' },
    data2: { value: cities, label: '覆盖城市' },
    data3: { value: '¥' + (avgSalary / 1000).toFixed(1) + 'K', label: '平均薪资' },
  }
  carouselSlides.value[2].data3 = { value: '¥' + (avgSalary / 1000).toFixed(1) + 'K', label: '平均薪资' }
  carouselSlides.value[3].data1 = { value: totalJobs.toLocaleString(), label: '在招岗位' }
  carouselSlides.value[3].data2 = { value: cities + '+', label: '覆盖城市' }
}

const router = useRouter()

// 浏览历史记录（由全局路由守卫记录，这里仅提供读取方法）
const recordBrowseHistory = (type, title, pageName, url) => {
  const saved = localStorage.getItem('browseHistory')
  let history = []
  try { history = saved ? JSON.parse(saved) : [] } catch { history = [] }
  history.unshift({ type, title, pageName, url, time: Date.now() })
  if (history.length > 30) history = history.slice(0, 30)
  localStorage.setItem('browseHistory', JSON.stringify(history))
}
const bgCanvas = ref(null)
const currentSlide = ref(0)
const activeModule = ref('function')
let slideInterval = null
let bgAnimationId = null

const showResumeModal = ref(false)
const resumeData = ref(null)

const showProfilePanel = ref(false)
const activeProfileTab = ref('info')
const route = useRoute()

const userInfo = reactive({
  name: generateGuestName(),
  role: '普通用户',
  loginType: '游客登录',
  registerTime: '2026-07-27',
  lastLogin: formatLoginTime(new Date()),
  loginDays: 4
})

const loadUserInfo = () => {
  const authData = getAuthInfo()
  if (authData) {
    // 登录用户
    if (authData.name || authData.username) {
      userInfo.name = authData.name || authData.username
      userAvatar.value = generateAvatar(userInfo.name)
      resumeAvatar.value = generateAvatar(userInfo.name)
    }
    if (authData.role) userInfo.role = authData.role
    if (authData.loginType) {
      const typeMap = { wechat: '微信登录', qq: 'QQ登录', email: '邮箱登录', guest: '游客登录', account: '账号登录' }
      userInfo.loginType = typeMap[authData.loginType] || authData.loginType
    }
    if (authData.loginTime) {
      userInfo.lastLogin = formatLoginTime(new Date(authData.loginTime))
      const registerDate = new Date(authData.loginTime)
      userInfo.registerTime = registerDate.toISOString().split('T')[0]
    }
    if (authData.loginCount) {
      userInfo.loginDays = authData.loginCount
    }
  } else {
    // 游客模式 - 为每个游客生成唯一名称和头像
    const guestName = generateGuestName()
    userInfo.name = guestName
    userInfo.role = '普通用户'
    userInfo.loginType = '游客登录'
    userAvatar.value = generateAvatar(guestName)
    resumeAvatar.value = generateAvatar(guestName)
  }
}

// 监听路由变化，重新加载用户信息（处理从登录页跳转到Dashboard的场景）
watch(() => route.path, (newPath) => {
  if (newPath === '/dashboard') {
    loadUserInfo()
  }
}, { immediate: false })

function formatLoginTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const settings = reactive({
  darkMode: false,
  notifications: true,
  autoUpdate: true,
  dataSync: true
})

// localStorage数据 - 使用ref，面板打开时刷新
const profileFavorites = ref([])
const jobFavoritesCount = computed(() => profileFavorites.value.length)
const appliedJobs = ref([])
const appliedJobsCount = computed(() => appliedJobs.value.length)
const resumeSummary = ref({})
const hasResume = computed(() => {
  const r = resumeSummary.value
  return r && (r.name || r.intention || (r.skills && r.skills.length > 0))
})
const learningProgressList = ref([])
const learningProgressCount = computed(() => learningProgressList.value.length)
const allFavoritesCount = computed(() => {
  return jobFavoritesCount.value + appliedJobsCount.value + (hasResume.value ? 1 : 0) + learningProgressCount.value
})
const browseHistory = ref([])

const refreshProfileData = () => {
  // 刷新岗位收藏
  try { profileFavorites.value = JSON.parse(localStorage.getItem('jobFavorites') || '[]') } catch { profileFavorites.value = [] }
  // 刷新投递记录
  try { appliedJobs.value = JSON.parse(localStorage.getItem('jobApplications') || '[]') } catch { appliedJobs.value = [] }
  // 刷新简历（只读取用户隔离的数据）
  const resumeStr = localStorage.getItem(getResumeStorageKey())
  try { resumeSummary.value = JSON.parse(resumeStr || '{}') } catch { resumeSummary.value = {} }
  // 刷新学习进度
  const list = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('learningProgress_')) {
      const progress = parseInt(localStorage.getItem(key) || '0', 10)
      const position = key.replace('learningProgress_', '')
      if (progress > 0) list.push({ position, progress })
    }
  }
  learningProgressList.value = list
  // 刷新浏览历史
  try { browseHistory.value = JSON.parse(localStorage.getItem('browseHistory') || '[]') } catch { browseHistory.value = [] }
}

const favSubTab = ref('jobs')

const getAppliedStatusText = (status) => {
  const map = { pending: '待处理', viewed: '已查看', interview: '面试中', offer: '已录用', rejected: '未通过' }
  return map[status] || '待处理'
}

const goToHistoryPage = (item) => {
  if (item.url) router.push(item.url)
}

const clearBrowseHistory = () => {
  localStorage.removeItem('browseHistory')
  browseHistory.value = []
}

const toggleProfilePanel = () => {
  showProfilePanel.value = !showProfilePanel.value
  if (showProfilePanel.value) refreshProfileData()
}

// 编辑资料弹窗相关
const showEditModal = ref(false)
const avatarInputRef = ref(null)
const userAvatar = ref(getRandomAvatar())
const resumeAvatar = ref(getRandomAvatar())
const editForm = reactive({
  name: '',
  role: '',
  loginType: ''
})

const openEditModal = () => {
  editForm.name = userInfo.name
  editForm.role = userInfo.role
  editForm.loginType = userInfo.loginType
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveEditModal = () => {
  if (editForm.name.trim()) {
    userInfo.name = editForm.name.trim()
    localStorage.setItem('userName', editForm.name.trim())
  }
  if (editForm.role.trim()) {
    userInfo.role = editForm.role.trim()
    localStorage.setItem('userRole', editForm.role.trim())
  }
  if (editForm.loginType) {
    userInfo.loginType = editForm.loginType
    localStorage.setItem('userLoginType', editForm.loginType)
  }
  showEditModal.value = false
}

// 头像上传相关
const triggerAvatarUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    userAvatar.value = e.target?.result
    localStorage.setItem('userAvatar', userAvatar.value)
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const formatFavoriteSalary = (salary) => {
  if (salary && salary > 0) {
    return `${salary}K/月`
  }
  return '薪资面议'
}

const formatFavoriteTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const favoriteDate = new Date(time)
  const diffMs = now - favoriteDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return favoriteDate.toLocaleDateString('zh-CN')
}

const showResumeHover = ref(false)

// 获取当前用户的简历存储键（用户隔离）
const getResumeStorageKey = () => {
  const auth = getAuthInfo()
  if (auth && auth.userId) {
    return `resumeData_${auth.userId}`
  }
  return 'resumeData_guest'
}

const loadResumeData = () => {
  // 只读取用户隔离的数据
  const saved = localStorage.getItem(getResumeStorageKey())
  if (saved) {
    try {
      resumeData.value = JSON.parse(saved)
    } catch (e) {
      resumeData.value = null
    }
  } else {
    resumeData.value = null
  }
}

const onResumeBtnEnter = async () => {
  loadResumeData()
  showResumeHover.value = true
}

const onResumeBtnLeave = () => {
  showResumeHover.value = false
}

const openResume = () => {
  // 只读取用户隔离的数据
  const saved = localStorage.getItem(getResumeStorageKey())
  if (saved) {
    try {
      resumeData.value = JSON.parse(saved)
      showResumeModal.value = true
    } catch (e) {
      alert('简历数据读取失败，请重新生成')
    }
  } else {
    router.push('/ai-resume')
  }
}

const closeResume = () => {
  showResumeModal.value = false
}

const goToVisualization = () => {
  router.push('/analytics')
}

const communitySourceData = [
  { 
    title: '分享计算机技术员面试经验', 
    author: '求职者小王', 
    time: '5分钟前', 
    comments: 29, 
    hot: false 
  },
  { 
    title: '急招普工/操作工，薪资优厚', 
    author: '技术达人', 
    time: '12分钟前', 
    comments: 148, 
    hot: true 
  },
  { 
    title: '计算机老师薪资待遇怎么样', 
    author: 'HR小姐姐', 
    time: '28分钟前', 
    comments: 91, 
    hot: true 
  },
  { 
    title: '在计算机硬件维护工作是一种什么体验', 
    author: '应届生小李', 
    time: '45分钟前', 
    comments: 210, 
    hot: false 
  },
  { 
    title: '计算机编程老师岗位推荐', 
    author: '转行程序员', 
    time: '1小时前', 
    comments: 197, 
    hot: true 
  }
]

const communityPosts = ref(
  communitySourceData.map((post) => ({
    ...post,
    avatar: generateAvatar(post.author)
  }))
)

const carouselSlides = ref([
  {
    icon: '📊',
    title: '实时有效岗位',
    desc: '当前市场最新岗位动态与趋势分析',
    bgImage: carouselImages.jobs,
    data1: { value: '加载中', label: '有效岗位' },
    data2: { value: '...', label: '覆盖城市' },
    data3: { value: '...', label: '平均薪资' },
  },
  {
    icon: '🎯',
    title: '热门技能趋势',
    desc: 'IT行业前沿技术与技能需求分析',
    bgImage: carouselImages.skills,
    data1: { value: '9,856', label: '学习用户' },
    data2: { value: '98.2%', label: '匹配度' },
    data3: { value: '128', label: '技能标签' },
  },
  {
    icon: '💰',
    title: '薪资分布分析',
    desc: 'IT行业薪资水平与增长趋势洞察',
    bgImage: carouselImages.salary,
    data1: { value: '56,230', label: '人才储备' },
    data2: { value: '45.8%', label: '就业率' },
    data3: { value: '...', label: '平均薪资' },
  },
  {
    icon: '🗺️',
    title: '城市就业热度',
    desc: '全国主要城市IT就业市场分布',
    bgImage: carouselImages.cities,
    data1: { value: '27,901', label: '在招岗位' },
    data2: { value: '28+', label: '覆盖城市' },
    data3: { value: '3大', label: '数据平台' },
  },
])

const bottomModules = ref([
  {
    key: 'planning',
    title: '学业-就业双向联动规划',
    desc: '基于学业数据与就业市场的智能联动规划系统',
    color: '#4a9eff',
    iconViewBox: '0 0 60 60',
    icon: '<rect x="10" y="25" width="15" height="25" rx="3" fill="currentColor"/><rect x="22" y="15" width="15" height="35" rx="3" fill="currentColor"/><rect x="34" y="20" width="15" height="30" rx="3" fill="currentColor"/><line x1="10" y1="55" x2="49" y2="55" stroke="currentColor" stroke-width="2" opacity="0.5"/>'
  },
  {
    key: 'ai-resume',
    title: 'AI简历',
    desc: '基于AI技术的智能简历生成与优化系统',
    color: '#00d4aa',
    iconViewBox: '0 0 60 60',
    icon: '<rect x="12" y="10" width="36" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="22" r="8" fill="currentColor" opacity="0.3"/><rect x="18" y="32" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.6"/><rect x="18" y="38" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="18" y="44" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>'
  },
  {
    key: 'talent-stat',
    title: '人才专项统计模块',
    desc: '各类人才数据的专项统计与分析可视化',
    color: '#a855f7',
    iconViewBox: '0 0 60 60',
    icon: '<circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 8 L35 25 L52 25 L38 37 L43 52 L30 42 L17 52 L22 37 L8 25 L25 25 Z" fill="currentColor" opacity="0.3"/>'
  },
  {
    key: 'industry-prediction',
    title: '行业供需预测',
    desc: '基于大数据分析的行业供需趋势预测',
    color: '#f59e0b',
    iconViewBox: '0 0 60 60',
    icon: '<path d="M8 45 Q15 35 22 40 T36 30 T52 25" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 50 Q15 40 22 45 T36 35 T52 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/><circle cx="8" cy="50" r="3" fill="currentColor"/><circle cx="52" cy="25" r="4" fill="currentColor"/>'
  },
  {
    key: 'job-recommend',
    title: '智能岗位推荐',
    desc: '基于AI算法的个性化岗位智能推荐系统',
    color: '#06b6d4',
    iconViewBox: '0 0 60 60',
    icon: '<circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="8" fill="currentColor"/><circle cx="15" cy="20" r="4" fill="currentColor" opacity="0.6"/><circle cx="45" cy="20" r="4" fill="currentColor" opacity="0.6"/><circle cx="15" cy="40" r="4" fill="currentColor" opacity="0.6"/><circle cx="45" cy="40" r="4" fill="currentColor" opacity="0.6"/><line x1="30" y1="12" x2="30" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><line x1="30" y1="30" x2="15" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><line x1="30" y1="30" x2="45" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>'
  },
])

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '74, 158, 255'
}

const navigateTo = (module) => {
  const moduleMap = {
    'planning': { url: '/planning', title: '学业-就业双向联动规划', pageName: '学业规划', type: 'planning' },
    'job-recommend': { url: '/job-recommend', title: '智能岗位推荐', pageName: '岗位推荐', type: 'job' },
    'ai-resume': { url: '/ai-resume', title: 'AI简历', pageName: 'AI简历', type: 'resume' },
    'industry-prediction': { url: '/industry-prediction', title: '行业供需预测', pageName: '行业预测', type: 'prediction' },
    'job-community': { url: '/job-community', title: '求职社区', pageName: '求职社区', type: 'job' },
    'talent-stat': { url: '/talent-statistics', title: '人才专项统计', pageName: '人才统计', type: 'job' }
  }
  const info = moduleMap[module]
  if (info) {
    router.push(info.url)
  } else {
    alert(`进入${module}模块，功能开发中`)
  }
}

const logout = () => {
  authLogout()
  refreshAuthState()
  router.push('/')
}

const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 多层星空
  const stars = []
  const starsLayer2 = []
  
  for (let i = 0; i < 250; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.3,
      brightness: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      hue: Math.random() > 0.7 ? 200 : 250
    })
  }
  
  // 较大的彩色星点
  for (let i = 0; i < 80; i++) {
    starsLayer2.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 1,
      brightness: Math.random() * 0.5 + 0.4,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.015 + 0.008,
      hue: [200, 220, 240, 260, 280][Math.floor(Math.random() * 5)]
    })
  }

  // 流动粒子
  const particles = []
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.4 + 0.2,
      hue: Math.random() > 0.5 ? 200 : 260
    })
  }

  // 流星
  const meteors = []
  
  const createMeteor = () => {
    const startX = Math.random() * canvas.width * 0.5
    const startY = -20
    meteors.push({
      x: startX,
      y: startY,
      length: Math.random() * 80 + 60,
      speed: Math.random() * 6 + 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      opacity: 1,
      hue: Math.random() > 0.5 ? 200 : 260
    })
  }

  let time = 0
  let meteorTimer = 0

  const animate = () => {
    // 透明背景，创造拖尾效果
    ctx.fillStyle = 'rgba(8, 5, 30, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制小星星层
    stars.forEach(star => {
      star.twinkle += star.twinkleSpeed
      const alpha = star.brightness * (0.5 + Math.sin(star.twinkle) * 0.5)
      
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${star.hue}, 50%, 90%, ${alpha})`
      ctx.fill()
    })

    // 绘制较大的彩色星点
    starsLayer2.forEach(star => {
      star.twinkle += star.twinkleSpeed
      const alpha = star.brightness * (0.5 + Math.sin(star.twinkle) * 0.5)
      
      // 光晕
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4)
      gradient.addColorStop(0, `hsla(${star.hue}, 70%, 70%, ${alpha * 0.8})`)
      gradient.addColorStop(0.5, `hsla(${star.hue}, 60%, 50%, ${alpha * 0.3})`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      // 核心
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${star.hue}, 80%, 95%, ${alpha})`
      ctx.fill()
    })

    // 绘制流动粒子
    particles.forEach(p => {
      p.x += p.vx + Math.sin(time * 0.0003 + p.x * 0.002) * 0.05
      p.y += p.vy + Math.cos(time * 0.0003 + p.y * 0.002) * 0.05

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      // 粒子光晕
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
      gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.alpha})`)
      gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.alpha * 0.3})`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha + 0.2})`
      ctx.fill()
    })

    // 粒子连线
    particles.forEach((p1, i) => {
      particles.forEach((p2, j) => {
        if (i < j) {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(100, 180, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
    })

    // 流星生成
    meteorTimer++
    if (meteorTimer > 180 + Math.random() * 200) {
      createMeteor()
      meteorTimer = 0
    }

    // 绘制流星
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]
      
      // 流星头部
      const tailX = m.x - Math.cos(m.angle) * m.length
      const tailY = m.y - Math.sin(m.angle) * m.length
      
      // 渐变拖尾
      const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
      gradient.addColorStop(0, `hsla(${m.hue}, 90%, 80%, ${m.opacity})`)
      gradient.addColorStop(0.3, `hsla(${m.hue}, 80%, 60%, ${m.opacity * 0.5})`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(tailX, tailY)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 流星头部发光
      const headGradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 8)
      headGradient.addColorStop(0, `hsla(${m.hue}, 100%, 95%, ${m.opacity})`)
      headGradient.addColorStop(0.5, `hsla(${m.hue}, 80%, 70%, ${m.opacity * 0.5})`)
      headGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(m.x, m.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = headGradient
      ctx.fill()
      
      // 移动
      m.x += Math.cos(m.angle) * m.speed
      m.y += Math.sin(m.angle) * m.speed
      m.opacity -= 0.008
      
      if (m.opacity <= 0 || m.x > canvas.width + 50 || m.y > canvas.height + 50) {
        meteors.splice(i, 1)
      }
    }

    time++
    bgAnimationId = requestAnimationFrame(animate)
  }

  animate()

  return () => {
    window.removeEventListener('resize', resizeCanvas)
    if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/data/all_cleaned_jobs.json')
    if (response.ok) {
      jobData = await response.json()
      updateCarouselStats()
    }
  } catch (err) {
    console.warn('岗位数据加载失败:', err.message)
  }

  fetchDataInfo()
  initBackground()
  
  // 使用新的loadUserInfo函数加载用户资料
  loadUserInfo()
  
  // 兼容旧版本
  const savedName = localStorage.getItem('userName')
  if (savedName && userInfo.name === '访客用户') userInfo.name = savedName
  const savedRole = localStorage.getItem('userRole')
  if (savedRole) userInfo.role = savedRole
  const savedLoginType = localStorage.getItem('userLoginType')
  if (savedLoginType && userInfo.loginType === '游客登录') userInfo.loginType = savedLoginType
  
  refreshProfileData()
  
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
  }, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.dashboard-glow-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(74, 158, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 212, 170, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(167, 139, 250, 0.03) 0%, transparent 60%);
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
  opacity: 0.4;
}

.nebula-1 {
  width: 600px;
  height: 600px;
  top: -10%;
  right: -10%;
  background: radial-gradient(circle, rgba(100, 100, 255, 0.3) 0%, rgba(80, 60, 200, 0.15) 50%, transparent 70%);
  animation: nebulaFloat1 20s ease-in-out infinite;
}

.nebula-2 {
  width: 500px;
  height: 500px;
  bottom: 10%;
  left: -5%;
  background: radial-gradient(circle, rgba(180, 100, 255, 0.25) 0%, rgba(120, 80, 200, 0.1) 50%, transparent 70%);
  animation: nebulaFloat2 25s ease-in-out infinite;
}

.nebula-3 {
  width: 400px;
  height: 400px;
  top: 40%;
  left: 30%;
  background: radial-gradient(circle, rgba(0, 150, 255, 0.2) 0%, rgba(50, 100, 200, 0.1) 50%, transparent 70%);
  animation: nebulaFloat3 30s ease-in-out infinite;
}

@keyframes nebulaFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 20px) scale(1.05); }
  66% { transform: translate(20px, -20px) scale(0.95); }
}

@keyframes nebulaFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-20px, 30px) scale(0.92); }
}

@keyframes nebulaFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 40px) scale(1.1); }
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
  opacity: 0.6;
}

.ribbon-1 {
  top: 20%;
  left: -25%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(100, 180, 255, 0.4) 20%, 
    rgba(150, 130, 255, 0.6) 50%, 
    rgba(100, 180, 255, 0.4) 80%, 
    transparent 100%);
  height: 1px;
  box-shadow: 0 0 20px rgba(100, 180, 255, 0.5);
  animation: ribbonFlow1 12s linear infinite;
}

.ribbon-2 {
  top: 60%;
  left: -25%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(180, 120, 255, 0.3) 30%, 
    rgba(100, 200, 255, 0.5) 50%, 
    rgba(180, 120, 255, 0.3) 70%, 
    transparent 100%);
  height: 1.5px;
  box-shadow: 0 0 25px rgba(180, 120, 255, 0.4);
  animation: ribbonFlow2 15s linear infinite;
  animation-delay: -5s;
}

.ribbon-3 {
  bottom: 15%;
  left: -25%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(80, 200, 220, 0.35) 25%, 
    rgba(120, 150, 255, 0.5) 50%, 
    rgba(80, 200, 220, 0.35) 75%, 
    transparent 100%);
  height: 1px;
  box-shadow: 0 0 18px rgba(80, 200, 220, 0.45);
  animation: ribbonFlow3 18s linear infinite;
  animation-delay: -8s;
}

@keyframes ribbonFlow1 {
  0% { transform: translateX(0) scaleY(1); opacity: 0.6; }
  50% { transform: translateX(30%) scaleY(1.5); opacity: 0.8; }
  100% { transform: translateX(60%) scaleY(1); opacity: 0.6; }
}

@keyframes ribbonFlow2 {
  0% { transform: translateX(0) scaleY(1); opacity: 0.5; }
  50% { transform: translateX(-20%) scaleY(2); opacity: 0.7; }
  100% { transform: translateX(-40%) scaleY(1); opacity: 0.5; }
}

@keyframes ribbonFlow3 {
  0% { transform: translateX(0) scaleY(1); opacity: 0.4; }
  50% { transform: translateX(25%) scaleY(1.8); opacity: 0.65; }
  100% { transform: translateX(50%) scaleY(1); opacity: 0.4; }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 20px;
  color: #4a9eff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.top-bar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.data-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.data-status:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d4aa;
  box-shadow: 0 0 8px #00d4aa;
  animation: pulse 2s infinite;
}

.status-dot.active {
  background: #ffb547;
  box-shadow: 0 0 8px #ffb547;
  animation: pulse 0.8s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  color: rgba(200, 220, 255, 0.8);
  font-weight: 500;
}

.status-refresh {
  color: rgba(74, 158, 255, 0.8);
  font-size: 14px;
  transition: transform 0.3s ease;
}

.status-refresh.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: rgba(239, 68, 68, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

.top-modules {
  display: flex;
  justify-content: center;
  gap: 35px;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
}

/* 高级卡片框架 - 全息玻璃 + 能量流动 */
.module-card {
  flex: 1;
  max-width: 520px;
  padding: 32px 48px;
  border-radius: 24px;
  border: none;
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 140px;
}

/* 卡片主体背景层 - 实际DOM元素 */
.card-shell {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 60px var(--module-glow-color),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  z-index: 0;
  transition: all 0.5s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* 渐变边框光晕层 */
.card-glow-ring {
  position: absolute;
  inset: -3px;
  border-radius: 27px;
  background: var(--border-gradient);
  z-index: -1;
  opacity: 0.6;
  transition: opacity 0.5s ease;
  filter: blur(10px);
}

.module-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.module-card:hover .card-shell {
  box-shadow: 
    0 35px 70px rgba(0, 0, 0, 0.6),
    0 0 100px var(--module-glow-color),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
}

.module-card:hover .card-glow-ring {
  opacity: 1;
}

/* 顶部能量条 */
.energy-bar {
  position: absolute;
  top: 1px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--module-color-start) 20%, 
    var(--module-color-end) 50%, 
    var(--module-color-start) 80%, 
    transparent 100%);
  opacity: 0.6;
  z-index: 1;
  animation: energyBarPulse 3s ease-in-out infinite;
}

@keyframes energyBarPulse {
  0%, 100% { opacity: 0.4; transform: scaleX(0.9); }
  50% { opacity: 0.9; transform: scaleX(1); }
}

/* 内部流动光线 - 装饰数据流 */
.flow-line {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  pointer-events: none;
  opacity: 0.15;
  z-index: 0;
}

.flow-line-1 {
  top: 20%;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    var(--module-color-start), 
    var(--module-color-end), 
    transparent);
  animation: flowLine1 4s ease-in-out infinite;
}

.flow-line-2 {
  bottom: 25%;
  right: 15%;
  width: 60%;
  height: 1px;
  background: linear-gradient(270deg, 
    transparent, 
    var(--module-color-end), 
    var(--module-color-start), 
    transparent);
  animation: flowLine2 5s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes flowLine1 {
  0%, 100% { opacity: 0.1; transform: translateX(-10px); }
  50% { opacity: 0.25; transform: translateX(10px); }
}

@keyframes flowLine2 {
  0%, 100% { opacity: 0.08; transform: translateX(10px); }
  50% { opacity: 0.2; transform: translateX(-10px); }
}

/* 底部光晕底座 */
.module-base-glow {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 60px;
  background: radial-gradient(ellipse at center, 
    var(--module-glow-color) 0%, 
    transparent 70%);
  filter: blur(20px);
  z-index: -1;
  opacity: 0.6;
  transition: opacity 0.5s ease;
}

.module-card:hover .module-base-glow {
  opacity: 1;
  bottom: -40px;
  height: 80px;
}

/* 扫光动画 - 高级感光泽流动 */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.03) 30%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 70%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
  transform: skewX(-20deg);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.module-card:hover .card-shine {
  opacity: 1;
  animation: cardShine 1.2s ease-out forwards;
}

@keyframes cardShine {
  0% {
    left: -100%;
  }
  100% {
    left: 150%;
  }
}

/* 边角装饰圆环 - 科技感点缀 */
.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--module-color-start);
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
  transition: all 0.5s ease;
}

.deco-ring-1 {
  top: -15px;
  right: -15px;
  width: 40px;
  height: 40px;
  border-style: dashed;
  animation: ringRotate 20s linear infinite;
}

.deco-ring-2 {
  bottom: -10px;
  left: -10px;
  width: 25px;
  height: 25px;
  border-color: var(--module-color-end);
  animation: ringRotate 15s linear infinite reverse;
}

.module-card:hover .deco-ring {
  opacity: 0.8;
  transform: scale(1.2);
}

@keyframes ringRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.module-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  position: relative;
  z-index: 2;
  width: 100%;
}

/* 3D六边形图标容器 */
.module-icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  perspective: 200px;
}

.module-icon-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.module-card:hover .module-icon-3d {
  transform: rotateY(-15deg) rotateX(10deg);
}

.icon-face {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-face.front {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: linear-gradient(135deg, var(--module-icon-bg-1), var(--module-icon-bg-2));
  border: 1px solid var(--module-color-start);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 0 20px var(--module-glow-color);
  z-index: 2;
  transition: all 0.4s ease;
}

.icon-face.top {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: linear-gradient(180deg, var(--module-color-light), var(--module-color-start));
  transform: translateZ(12px);
  opacity: 0.6;
  z-index: 1;
}

.icon-face.bottom {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: linear-gradient(0deg, var(--module-color-dark), var(--module-color-start));
  transform: translateZ(-8px);
  opacity: 0.4;
  filter: blur(2px);
}

.module-card:hover .icon-face.front {
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 0 30px var(--module-glow-color);
}

.icon-reflection {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) scaleY(-0.8);
  width: 80%;
  height: 100%;
  background: linear-gradient(180deg, 
    var(--module-icon-bg-1) 0%, 
    transparent 100%);
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  opacity: 0.2;
  filter: blur(4px);
  pointer-events: none;
}

.module-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 4px;
  position: relative;
  font-family: 'Orbitron', 'Rajdhani', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, var(--module-color-light), #fff, var(--module-color-start));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  transition: all 0.4s ease;
  animation: titleShimmer 3s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px var(--module-glow-color));
}

@keyframes titleShimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.module-card:hover .module-title {
  animation: titleShimmer 1.5s ease-in-out infinite;
  filter: drop-shadow(0 4px 16px var(--module-glow-color));
  transform: scale(1.05);
}

/* 功能模块 - 冰青蓝主题 */
.function-module {
  --module-color-start: #4a9eff;
  --module-color-end: #00d4aa;
  --module-color-light: #6cb8ff;
  --module-color-dark: #2a7ecc;
  --module-glow-color: rgba(74, 158, 255, 0.35);
  --module-icon-bg-1: rgba(74, 158, 255, 0.3);
  --module-icon-bg-2: rgba(0, 212, 170, 0.2);
  --card-bg: linear-gradient(145deg, 
    rgba(25, 40, 80, 0.85) 0%, 
    rgba(18, 30, 60, 0.8) 50%, 
    rgba(12, 22, 48, 0.88) 100%);
  --card-border: rgba(74, 158, 255, 0.25);
  --border-gradient: linear-gradient(135deg, #4a9eff, #00d4aa, #4a9eff);
}

.function-module.active {
  --card-bg: linear-gradient(145deg, 
    rgba(35, 60, 100, 0.92) 0%, 
    rgba(25, 45, 80, 0.88) 50%, 
    rgba(18, 35, 65, 0.92) 100%);
  --card-border: rgba(74, 158, 255, 0.7);
  --module-glow-color: rgba(74, 158, 255, 0.5);
}

/* 可视化模块 - 电光紫主题 */
.visualization-module {
  --module-color-start: #7b68ee;
  --module-color-end: #4a9eff;
  --module-color-light: #9a8fff;
  --module-color-dark: #5a48cc;
  --module-glow-color: rgba(123, 104, 238, 0.35);
  --module-icon-bg-1: rgba(123, 104, 238, 0.3);
  --module-icon-bg-2: rgba(74, 158, 255, 0.2);
  --card-bg: linear-gradient(145deg, 
    rgba(40, 30, 75, 0.85) 0%, 
    rgba(30, 22, 60, 0.8) 50%, 
    rgba(22, 16, 48, 0.88) 100%);
  --card-border: rgba(123, 104, 238, 0.25);
  --border-gradient: linear-gradient(135deg, #7b68ee, #4a9eff, #7b68ee);
}

.visualization-module.active {
  --card-bg: linear-gradient(145deg, 
    rgba(55, 42, 95, 0.92) 0%, 
    rgba(42, 32, 78, 0.88) 50%, 
    rgba(32, 24, 62, 0.92) 100%);
  --card-border: rgba(123, 104, 238, 0.7);
  --module-glow-color: rgba(123, 104, 238, 0.5);
}

/* 模块内部光效 */
.module-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, var(--module-glow-color) 0%, transparent 100%);
  pointer-events: none;
  opacity: 0.3;
  transition: opacity 0.4s ease;
}

.module-card:hover .module-glow,
.module-card.active .module-glow {
  opacity: 0.6;
}

/* 底部指示器 */
.module-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--module-color-start);
  box-shadow: 0 0 12px var(--module-color-start);
  animation: indicatorPulse 2s ease-in-out infinite;
}

@keyframes indicatorPulse {
  0%, 100% { 
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  50% { 
    transform: translateX(-50%) scale(1.5);
    opacity: 0.6;
  }
}

/* 精致角标装饰 - 高级科技感 */
.module-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.module-corner::before,
.module-corner::after {
  content: '';
  position: absolute;
  background: var(--module-color-start);
  box-shadow: 0 0 8px var(--module-color-start);
}

.module-corner.tl {
  top: 12px;
  left: 12px;
}

.module-corner.tl::before {
  top: 0;
  left: 0;
  width: 16px;
  height: 2px;
}

.module-corner.tl::after {
  top: 0;
  left: 0;
  width: 2px;
  height: 16px;
}

.module-corner.tr {
  top: 12px;
  right: 12px;
}

.module-corner.tr::before {
  top: 0;
  right: 0;
  width: 16px;
  height: 2px;
}

.module-corner.tr::after {
  top: 0;
  right: 0;
  width: 2px;
  height: 16px;
}

.module-corner.bl {
  bottom: 12px;
  left: 12px;
}

.module-corner.bl::before {
  bottom: 0;
  left: 0;
  width: 16px;
  height: 2px;
}

.module-corner.bl::after {
  bottom: 0;
  left: 0;
  width: 2px;
  height: 16px;
}

.module-corner.br {
  bottom: 12px;
  right: 12px;
}

.module-corner.br::before {
  bottom: 0;
  right: 0;
  width: 16px;
  height: 2px;
}

.module-corner.br::after {
  bottom: 0;
  right: 0;
  width: 2px;
  height: 16px;
}

.module-card:hover .module-corner,
.module-card.active .module-corner {
  width: 28px;
  height: 28px;
}

.module-card:hover .module-corner::before,
.module-card:hover .module-corner::after,
.module-card.active .module-corner::before,
.module-card.active .module-corner::after {
  background: var(--module-color-end);
  box-shadow: 0 0 12px var(--module-color-end);
}

.main-section {
  background: rgba(5, 10, 35, 0.7);
  border-radius: 24px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  padding: 25px;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
  box-shadow: 
    0 0 60px rgba(74, 158, 255, 0.1),
    0 15px 40px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
}

.section-header span {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(74, 158, 255, 0.9);
  letter-spacing: 3px;
}

.header-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.4), transparent);
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 20px;
  align-items: stretch;
  min-height: 260px;
}

.left-panel, .center-panel, .right-panel {
  background: linear-gradient(180deg, rgba(10, 18, 48, 0.65) 0%, rgba(6, 12, 32, 0.55) 100%);
  border-radius: 20px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  padding: 22px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.left-panel::before, .center-panel::before, .right-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.4), rgba(168, 85, 247, 0.3), transparent);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.12);
}

.panel-header .panel-icon {
  color: rgba(74, 158, 255, 0.85);
  filter: drop-shadow(0 0 6px rgba(74, 158, 255, 0.4));
}

.panel-header span {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #fff, #b8d4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.community-posts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.community-posts::-webkit-scrollbar {
  width: 3px;
}
.community-posts::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 2px;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(5, 12, 35, 0.6), rgba(8, 16, 42, 0.5));
  border-radius: 14px;
  border: 1px solid rgba(74, 158, 255, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.post-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #4a9eff, #a855f7);
  border-radius: 14px 0 0 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-item:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.12), rgba(168, 85, 247, 0.08));
  border-color: rgba(74, 158, 255, 0.25);
  transform: translateX(6px);
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.15);
}

.post-item:hover::before {
  opacity: 1;
}

.post-avatar {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(74, 158, 255, 0.12);
  border: 2px solid rgba(74, 158, 255, 0.25);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 0.85rem;
  color: #fff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.post-meta {
  font-size: 0.72rem;
  color: rgba(150, 180, 220, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-author {
  color: rgba(74, 158, 255, 0.5);
}

.post-time {
  color: rgba(150, 180, 220, 0.3);
}

.post-comments {
  color: rgba(150, 180, 220, 0.3);
}

.post-badge {
  font-size: 0.8rem;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding-top: 15px;
  margin-top: 10px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
  color: rgba(74, 158, 255, 0.6);
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.panel-footer:hover {
  color: rgba(74, 158, 255, 0.9);
}

.carousel-panel {
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

.carousel-wrapper {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  min-height: 180px;
}

.carousel-content {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-item {
  flex: 1;
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-card {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: right center;
  background-repeat: no-repeat;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.2);
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.slide-icon {
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.slide-card h4 {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(74, 158, 255, 0.95);
  margin-bottom: 4px;
}

.slide-card p {
  font-size: 0.75rem;
  color: rgba(150, 180, 220, 0.4);
  margin-bottom: 10px;
}

.slide-data {
  display: flex;
  gap: 25px;
  margin-bottom: 10px;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.data-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(74, 158, 255, 0.9);
  text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
}

.data-label {
  font-size: 0.65rem;
  color: rgba(150, 180, 220, 0.4);
}

.slide-btn {
  padding: 6px 18px;
  background: rgba(74, 158, 255, 0.3);
  border: 1px solid rgba(74, 158, 255, 0.5);
  border-radius: 12px;
  color: rgba(74, 158, 255, 0.9);
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slide-btn:hover {
  background: rgba(74, 158, 255, 0.5);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  width: 18px;
  border-radius: 3px;
  background: rgba(74, 158, 255, 0.7);
}

.resume-avatar-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.tech-avatar {
  position: relative;
}

.tech-avatar svg {
  filter: drop-shadow(0 0 20px rgba(74, 158, 255, 0.5));
  transition: transform 0.3s ease;
}

.tech-avatar:hover svg {
  transform: scale(1.05);
}

.avatar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 50%;
  animation: ringRotate 15s linear infinite;
}

.avatar-ring.ring-2 {
  top: -14px;
  left: -14px;
  right: -14px;
  bottom: -14px;
  border-width: 0.5px;
  border-color: rgba(74, 158, 255, 0.15);
  animation-direction: reverse;
  animation-duration: 20s;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.resume-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(5, 12, 35, 0.6), rgba(8, 16, 42, 0.5));
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.summary-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-name {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
}

.summary-intention {
  color: #4a9eff;
  font-size: 0.8rem;
  font-weight: 500;
}

.summary-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 8px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.12);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.stat-value {
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.68rem;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(74, 158, 255, 0.2);
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-chip {
  padding: 3px 10px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 10px;
  color: #4a9eff;
  font-size: 0.72rem;
  font-weight: 500;
}

.skill-chip.more {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
}

.skill-chips.empty-hint {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.75rem;
  font-style: italic;
}

.avatar-hint {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  color: rgba(74, 158, 255, 0.8);
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.tech-avatar.cartoon:hover .avatar-hint {
  opacity: 1;
}

.tech-avatar.cartoon svg {
  filter: drop-shadow(0 4px 12px rgba(251, 191, 36, 0.3));
  transition: transform 0.3s ease, filter 0.3s ease;
}

.tech-avatar.cartoon:hover svg {
  transform: scale(1.05);
  filter: drop-shadow(0 6px 16px rgba(251, 191, 36, 0.5));
}

.resume-avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  filter: drop-shadow(0 4px 12px rgba(251, 191, 36, 0.3));
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: cover;
}

.tech-avatar.cartoon:hover .resume-avatar-img {
  transform: scale(1.05);
  filter: drop-shadow(0 6px 16px rgba(251, 191, 36, 0.5));
}

.resume-avatar-section {
  position: relative;
  display: flex;
  justify-content: center;
}

.resume-btn {
  width: 100%;
  padding: 9px;
  background: rgba(74, 158, 255, 0.25);
  border: 1px solid rgba(74, 158, 255, 0.5);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.9);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resume-btn:hover {
  background: rgba(74, 158, 255, 0.4);
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
}

.resume-btn.primary {
  background: linear-gradient(135deg, #4a9eff 0%, #2563eb 100%);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.resume-btn.primary:hover {
  background: linear-gradient(135deg, #5aaeff 0%, #3573fb 100%);
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.5);
  transform: translateY(-1px);
}

.resume-btn.primary:hover svg {
  transform: translateX(3px);
}

.resume-btn.primary svg {
  transition: transform 0.3s ease;
}

.resume-btn-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.resume-hover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

.resume-hover-card {
  width: 85vw;
  max-width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a2332 0%, #0d1520 100%);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 158, 255, 0.15);
  pointer-events: auto;
}

.hover-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.15), transparent);
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.hover-card-title {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}

.hover-card-badge {
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  color: #4a9eff;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.hover-card-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.hover-card-body::-webkit-scrollbar {
  width: 6px;
}

.hover-card-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.hover-card-body::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.4);
  border-radius: 3px;
}

.hover-section {
  margin-bottom: 20px;
}

.hover-section-title {
  display: flex;
  align-items: center;
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.hover-title-bar {
  display: inline-block;
  width: 4px;
  height: 14px;
  background: #4a9eff;
  border-radius: 2px;
  margin-right: 8px;
}

.hover-name-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.hover-avatar {
  width: 72px;
  height: 72px;
  border: 2px solid rgba(74, 158, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.hover-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-avatar-ph {
  border-radius: 8px;
}

.hover-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hover-name-info {
  flex: 1;
}

.hover-name {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.hover-intention {
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.hover-contact {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.hover-contact span {
  background: rgba(74, 158, 255, 0.1);
  padding: 3px 10px;
  border-radius: 6px;
}

.hover-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  align-items: center;
}

.hover-item {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
}

.hover-item-light {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.hover-timeline-item {
  position: relative;
  padding-left: 16px;
  border-left: 2px solid rgba(74, 158, 255, 0.3);
  margin-bottom: 10px;
}

.hover-timeline-dot {
  position: absolute;
  left: -7px;
  top: 5px;
  width: 12px;
  height: 12px;
  background: #4a9eff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.hover-timeline-content {
  padding-left: 4px;
}

.hover-timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.hover-timeline-title {
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
}

.hover-timeline-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.hover-timeline-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.82rem;
  line-height: 1.5;
}

.hover-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hover-skill-tag {
  padding: 4px 12px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 12px;
  color: #4a9eff;
  font-size: 0.78rem;
  font-weight: 500;
}

.hover-card-footer {
  padding: 12px 24px;
  background: rgba(74, 158, 255, 0.08);
  border-top: 1px solid rgba(74, 158, 255, 0.15);
  text-align: center;
  color: rgba(74, 158, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
}

.empty-hover-card {
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
}

.hover-empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.hover-empty-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.hover-empty-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.hover-fade-enter-active,
.hover-fade-leave-active {
  transition: opacity 0.2s ease;
}

.hover-fade-enter-from,
.hover-fade-leave-to {
  opacity: 0;
}

.hover-fade-enter-to,
.hover-fade-leave-from {
  opacity: 1;
}

/* ===== 3D Immersive Zone ===== */
.immersive-zone {
  position: relative;
  width: 100%;
  min-height: 420px;
  padding: 60px 40px 80px;
  perspective: 1200px;
  z-index: 10;
}

/* 镜面反射平台 */
.reflective-platform {
  position: absolute;
  bottom: 0;
  left: 5%;
  right: 5%;
  height: 180px;
  background: linear-gradient(180deg, 
    rgba(30, 20, 60, 0) 0%, 
    rgba(60, 40, 100, 0.15) 30%, 
    rgba(40, 30, 80, 0.25) 100%);
  transform: perspective(800px) rotateX(65deg);
  transform-origin: center top;
  border-radius: 50% 50% 0 0 / 30px;
  filter: blur(2px);
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.reflective-platform::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 5%, 
    rgba(138, 100, 255, 0.6) 30%, 
    rgba(100, 150, 255, 0.8) 50%, 
    rgba(138, 100, 255, 0.6) 70%, 
    transparent 95%);
  box-shadow: 0 0 30px rgba(138, 100, 255, 0.5);
}

/* 光束效果 */
.light-beams {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.beam {
  position: absolute;
  width: 120px;
  height: 100%;
  top: 0;
  opacity: 0.15;
  filter: blur(30px);
}

.beam-1 {
  left: 15%;
  background: linear-gradient(180deg, 
    rgba(138, 100, 255, 0.4) 0%, 
    rgba(138, 100, 255, 0.1) 50%, 
    transparent 100%);
  transform: rotate(-8deg);
  animation: beamFlicker1 6s ease-in-out infinite;
}

.beam-2 {
  left: 50%;
  background: linear-gradient(180deg, 
    rgba(100, 180, 255, 0.3) 0%, 
    rgba(100, 180, 255, 0.08) 40%, 
    transparent 100%);
  transform: rotate(2deg);
  width: 180px;
  animation: beamFlicker2 8s ease-in-out infinite;
}

.beam-3 {
  right: 20%;
  background: linear-gradient(180deg, 
    rgba(180, 120, 255, 0.35) 0%, 
    rgba(180, 120, 255, 0.1) 45%, 
    transparent 100%);
  transform: rotate(-5deg);
  animation: beamFlicker3 7s ease-in-out infinite;
}

@keyframes beamFlicker1 {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.25; }
}

@keyframes beamFlicker2 {
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.2; }
}

@keyframes beamFlicker3 {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.28; }
}

/* 漂浮光粒子 */
.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.particle {
  position: absolute;
  width: var(--particle-size, 3px);
  height: var(--particle-size, 3px);
  background: var(--particle-color, #8a64ff);
  border-radius: 50%;
  opacity: 0;
  box-shadow: 0 0 10px var(--particle-color, #8a64ff), 0 0 20px var(--particle-color, #8a64ff);
  animation: particleFloat var(--animation-duration, 4s) ease-in-out var(--animation-delay, 0s) infinite;
}

@keyframes particleFloat {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.5); 
  }
  20% { 
    opacity: 0.8; 
  }
  80% { 
    opacity: 0.6; 
  }
  100% { 
    opacity: 0; 
    transform: translateY(-40px) scale(1); 
  }
}

/* 3D弧形卡片容器 */
.cards-3d-container {
  position: relative;
  z-index: 5;
  width: 100%;
}

.cards-arc {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  padding-bottom: 40px;
  max-width: 1280px;
  margin: 0 auto;
}

/* 弧形倾斜容器 - 已废弃，保留元素但隐藏 */
.arc-tilt {
  display: none;
}

/* 3D卡片基础样式 */
.bottom-card-3d {
  position: relative;
  width: 100%;
  min-height: 280px;
  cursor: pointer;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease;
  animation: card3dFadeIn 0.8s ease-out var(--card-delay, 0s) both;
}

@keyframes card3dFadeIn {
  from { 
    opacity: 0; 
    transform: translateY(40px) scale(0.9);
    filter: blur(8px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* 所有卡片位置统一，不再有弧形高低差 */
.pos-0, .pos-1, .pos-2, .pos-3, .pos-4 {
  transform: translateY(0) rotateY(0deg);
}

.bottom-card-3d:hover {
  transform: translateY(-12px) scale(1.03) !important;
  filter: brightness(1.1);
  z-index: 20;
}

/* 玻璃底座 - 调整为底部对齐 */
.card-base {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 16px;
  z-index: 0;
}

.base-reflection {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 30px;
  background: radial-gradient(ellipse at center top, 
    rgba(var(--theme-rgb), 0.4) 0%, 
    rgba(var(--theme-rgb), 0.2) 40%, 
    transparent 70%);
  filter: blur(8px);
  opacity: 0.6;
}

.base-glow {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4px;
  background: linear-gradient(90deg, 
    transparent, 
    var(--theme-color), 
    transparent);
  box-shadow: 0 0 20px var(--theme-color), 0 0 40px var(--theme-color);
  opacity: 0.8;
  border-radius: 50%;
  animation: baseGlowPulse 3s ease-in-out infinite;
}

@keyframes baseGlowPulse {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scaleX(0.8); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1); }
}

/* 玻璃卡片主体 - 等高对齐 */
.card-glass {
  position: relative;
  background: linear-gradient(145deg, 
    rgba(20, 18, 45, 0.75) 0%, 
    rgba(30, 25, 55, 0.65) 50%, 
    rgba(15, 12, 35, 0.8) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px 22px 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(var(--theme-rgb), 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 260px;
}

.bottom-card-3d:hover .card-glass {
  border-color: rgba(var(--theme-rgb), 0.4);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(var(--theme-rgb), 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 3D立体图标 - 统一大小 */
.icon-3d {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
  perspective: 200px;
  flex-shrink: 0;
}

.icon-cube {
  position: relative;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, 
    rgba(var(--theme-rgb), 0.3) 0%, 
    rgba(var(--theme-rgb), 0.15) 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-color);
  border: 1px solid rgba(var(--theme-rgb), 0.3);
  transform: rotateY(-15deg) rotateX(10deg);
  transition: transform 0.5s ease;
  box-shadow: 
    0 10px 30px rgba(var(--theme-rgb), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.bottom-card-3d:hover .icon-cube {
  transform: rotateY(0deg) rotateX(0deg) scale(1.1);
  box-shadow: 
    0 15px 40px rgba(var(--theme-rgb), 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.icon-cube svg {
  filter: drop-shadow(0 0 8px var(--icon-color));
}

.icon-glow-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 18px;
  border: 1.5px solid var(--icon-color);
  opacity: 0.4;
  box-shadow: 0 0 15px var(--icon-color);
  animation: ringRotate 4s linear infinite;
}

@keyframes ringRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon-shadow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 8px;
  background: radial-gradient(ellipse at center, 
    rgba(var(--theme-rgb), 0.4) 0%, 
    transparent 70%);
  filter: blur(4px);
  opacity: 0.6;
}

/* 卡片标题 */
.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
  text-shadow: 
    0 0 20px rgba(255, 255, 255, 0.3),
    0 2px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  line-height: 1.3;
  transition: all 0.3s ease;
  min-height: 2.6em;
  display: flex;
  align-items: flex-end;
}

.bottom-card-3d:hover .card-title {
  text-shadow: 
    0 0 30px var(--theme-color),
    0 2px 10px rgba(0, 0, 0, 0.5);
}

/* 卡片描述 - 固定高度保证对齐 */
.card-description {
  font-size: 0.75rem;
  color: rgba(220, 230, 255, 0.7);
  margin: 0;
  line-height: 1.5;
  min-height: 3.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 进入按钮 - 推到底部 */
.enter-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  margin-top: auto;
  background: linear-gradient(135deg, 
    rgba(var(--theme-rgb), 0.4) 0%, 
    rgba(var(--theme-rgb), 0.2) 100%);
  border: 1.5px solid rgba(var(--theme-rgb), 0.6);
  border-radius: 30px;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  align-self: flex-start;
  box-shadow: 
    0 4px 15px rgba(var(--theme-rgb), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.enter-btn:hover {
  background: linear-gradient(135deg, 
    rgba(var(--theme-rgb), 0.6) 0%, 
    rgba(var(--theme-rgb), 0.4) 100%);
  border-color: var(--theme-color);
  box-shadow: 
    0 6px 25px rgba(var(--theme-rgb), 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
}

.enter-btn svg {
  transition: transform 0.3s ease;
}

.enter-btn:hover svg {
  transform: translateX(4px);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  animation: btnShine 3s ease-in-out infinite;
}

@keyframes btnShine {
  0%, 100% { left: -100%; }
  50% { left: 100%; }
}

/* 玻璃高光 */
.glass-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 100%);
  border-radius: 20px 20px 0 0;
  pointer-events: none;
}

/* 卡片特定配色 */
.card-planning .card-glass {
  background: linear-gradient(145deg, 
    rgba(25, 20, 55, 0.75) 0%, 
    rgba(35, 28, 65, 0.65) 50%, 
    rgba(18, 15, 40, 0.8) 100%);
}

.card-ai-resume .card-glass {
  background: linear-gradient(145deg, 
    rgba(15, 25, 35, 0.75) 0%, 
    rgba(20, 35, 45, 0.65) 50%, 
    rgba(12, 20, 28, 0.8) 100%);
}

.card-talent-stat .card-glass {
  background: linear-gradient(145deg, 
    rgba(30, 18, 45, 0.75) 0%, 
    rgba(40, 25, 55, 0.65) 50%, 
    rgba(22, 14, 32, 0.8) 100%);
}

.card-industry-prediction .card-glass {
  background: linear-gradient(145deg, 
    rgba(35, 25, 10, 0.75) 0%, 
    rgba(45, 32, 15, 0.65) 50%, 
    rgba(28, 20, 8, 0.8) 100%);
}

.card-job-recommend .card-glass {
  background: linear-gradient(145deg, 
    rgba(10, 25, 35, 0.75) 0%, 
    rgba(15, 35, 48, 0.65) 50%, 
    rgba(8, 18, 26, 0.8) 100%);
}

/* 响应式适配 */
@media (max-width: 1400px) {
  .cards-arc {
    gap: 18px;
  }
}

@media (max-width: 1200px) {
  .immersive-zone {
    padding: 40px 20px 60px;
  }
  .cards-arc {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .immersive-zone {
    padding: 30px 15px 50px;
  }
  .cards-arc {
    grid-template-columns: 1fr;
    max-width: 320px;
  }
  .reflective-platform,
  .light-beams,
  .floating-particles {
    display: none;
  }
}

.resume-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.resume-container {
  width: 800px;
  max-height: 90vh;
  background: linear-gradient(135deg, #1a2332 0%, #0d1520 100%);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 158, 255, 0.15);
  display: flex;
  flex-direction: column;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.15), transparent);
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.resume-header h2 {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.resume-header .close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.resume-header .close-btn:hover {
  background: rgba(255, 77, 79, 0.3);
  border-color: rgba(255, 77, 79, 0.5);
}

.resume-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.resume-content::-webkit-scrollbar {
  width: 6px;
}

.resume-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.resume-content::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.4);
  border-radius: 3px;
}

.resume-main .section {
  margin-bottom: 24px;
}

.resume-main .section h3 {
  color: #4a9eff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.resume-main .section h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 14px;
  background: #4a9eff;
  border-radius: 2px;
  margin-right: 8px;
  vertical-align: -2px;
}

.basic-info {
  display: flex;
  gap: 20px;
}

.info-content {
  flex: 1;
}

.photo-section {
  width: 140px;
  height: 196px;
  border: 2px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resume-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder-resume {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
}

.personal-header .name-title h2 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.personal-header .name-title p {
  color: #4a9eff;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 15px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 20px;
}

.info-grid > div {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
}

.info-grid .label {
  color: rgba(74, 158, 255, 0.8);
  font-weight: 500;
}

.timeline-item {
  position: relative;
  padding-left: 20px;
  border-left: 2px solid rgba(74, 158, 255, 0.3);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 5px;
  width: 12px;
  height: 12px;
  background: #4a9eff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-header .title {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.timeline-header .time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.timeline-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  margin: 4px 0;
  line-height: 1.6;
}

.timeline-content .label {
  color: rgba(74, 158, 255, 0.8);
  font-weight: 500;
}

.timeline-content .desc {
  color: rgba(255, 255, 255, 0.7);
}

.no-data {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  font-style: italic;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 5px 14px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 15px;
  color: #4a9eff;
  font-size: 0.8rem;
  font-weight: 500;
}

.resume-main .desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.7;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-btn:hover {
  background: rgba(74, 158, 255, 0.25);
  border-color: rgba(74, 158, 255, 0.5);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a9eff;
  overflow: hidden;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.profile-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.profile-arrow {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
}

.profile-btn:hover .profile-arrow {
  transform: rotate(180deg);
}

.profile-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.profile-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 92vw;
  height: 100vh;
  background: linear-gradient(180deg, rgba(12, 20, 42, 0.99) 0%, rgba(8, 14, 32, 0.99) 100%);
  border-left: 1px solid rgba(74, 158, 255, 0.25);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(24px);
  box-shadow: -16px 0 48px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 32px 24px 22px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.12);
  position: relative;
  overflow: hidden;
}

.panel-header-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.panel-header-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(74, 158, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 158, 255, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.6), transparent 80%);
  -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.6), transparent 80%);
}

.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.5;
  animation: auroraFloat 8s ease-in-out infinite;
}

.aurora-blob.blob-1 {
  width: 160px; height: 160px;
  top: -60px; left: -20px;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.35), transparent 70%);
}

.aurora-blob.blob-2 {
  width: 140px; height: 140px;
  top: -40px; right: -30px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 70%);
  animation-delay: -2s;
}

.aurora-blob.blob-3 {
  width: 120px; height: 120px;
  bottom: -50px; left: 30%;
  background: radial-gradient(circle, rgba(0, 212, 170, 0.2), transparent 70%);
  animation-delay: -4s;
}

@keyframes auroraFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(8px, -6px) scale(1.05); }
  66% { transform: translate(-6px, 4px) scale(0.95); }
}

.panel-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.25), rgba(168, 85, 247, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a9eff;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 0 24px rgba(74, 158, 255, 0.35);
  z-index: 2;
}

.avatar-ring-deco {
  position: absolute;
  inset: -5px;
  border: 1.5px solid rgba(74, 158, 255, 0.25);
  border-radius: 50%;
  border-top-color: #4a9eff;
  border-right-color: rgba(74, 158, 255, 0.5);
  animation: avatarRingSpin 4s linear infinite;
}

.avatar-ring-deco-2 {
  position: absolute;
  inset: -10px;
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 50%;
  border-bottom-color: rgba(168, 85, 247, 0.4);
  animation: avatarRingSpin 6s linear infinite reverse;
}

@keyframes avatarRingSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.panel-user-info {
  flex: 1;
  position: relative;
  z-index: 2;
}

.panel-user-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 0 12px rgba(74, 158, 255, 0.3);
}

.panel-user-info p {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 5px 0 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-user-info p::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00d4aa;
  box-shadow: 0 0 8px #00d4aa;
}

.panel-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.panel-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transform: rotate(90deg);
}

.panel-stats-bar {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(74, 158, 255, 0.08) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
  position: relative;
}

.panel-stats-bar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.3), rgba(168, 85, 247, 0.3), transparent);
}

.stats-progress-track {
  height: 2px;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}

.stats-progress-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.6), rgba(168, 85, 247, 0.6), transparent);
  animation: progressShine 3s ease-in-out infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.stat-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(168, 85, 247, 0.04));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item.clickable {
  cursor: pointer;
}

.stat-item.clickable:hover {
  transform: translateY(-3px);
}

.stat-item.clickable:hover::before {
  opacity: 1;
}

.stat-item.clickable:hover .stat-icon-wrap {
  color: #5ba8ff;
  transform: scale(1.15);
}

.stat-item.clickable:hover .stat-value {
  color: #7bc4ff;
  text-shadow: 0 0 20px rgba(91, 168, 255, 0.8);
}

.stat-icon-wrap {
  color: rgba(74, 158, 255, 0.55);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4a9eff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(180deg, transparent, rgba(74, 158, 255, 0.4), transparent);
  margin: 0 4px;
  position: relative;
  z-index: 1;
}

.panel-nav {
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  gap: 6px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  letter-spacing: 0.3px;
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 55%;
  background: linear-gradient(180deg, #4a9eff, #a855f7);
  border-radius: 0 3px 3px 0;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.12), transparent);
  color: rgba(255, 255, 255, 0.92);
  border-color: rgba(74, 158, 255, 0.12);
  padding-left: 20px;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.2), rgba(168, 85, 247, 0.08));
  color: #fff;
  border-color: rgba(74, 158, 255, 0.2);
  padding-left: 20px;
  box-shadow: inset 0 0 20px rgba(74, 158, 255, 0.08);
}

.nav-item.active .nav-indicator {
  transform: translateY(-50%) scaleY(1);
  box-shadow: 0 0 14px rgba(74, 158, 255, 0.7);
}

.nav-item.active svg {
  color: #7bc4ff;
  filter: drop-shadow(0 0 8px rgba(74, 158, 255, 0.6));
}

.nav-item:hover svg {
  color: #5ba8ff;
}

.nav-badge {
  margin-left: auto;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  font-size: 0.68rem;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
}

.panel-content::-webkit-scrollbar {
  width: 4px;
}
.panel-content::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 2px;
}
.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.tab-content {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
}

.section-icon {
  width: 18px;
  height: 4px;
  background: linear-gradient(180deg, #4a9eff, #a855f7);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.6);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08) 0%, rgba(74, 158, 255, 0.02) 100%);
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(74, 158, 255, 0.1);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.info-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(168, 85, 247, 0.06));
  opacity: 0;
  transition: opacity 0.35s ease;
}

.info-item:hover {
  border-color: rgba(74, 158, 255, 0.28);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 158, 255, 0.12);
}

.info-item:hover::before {
  opacity: 1;
}

.info-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(74, 158, 255, 0.08));
  color: #5ba8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(74, 158, 255, 0.15);
  transition: all 0.3s ease;
}

.info-item:hover .info-item-icon {
  transform: scale(1.05);
  box-shadow: 0 0 18px rgba(74, 158, 255, 0.3);
}

.info-item-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.info-item-content label {
  display: block;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.info-item-content span {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.35);
}

.edit-profile-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent 60%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.edit-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74, 158, 255, 0.5);
}

.edit-profile-btn:hover::before {
  opacity: 1;
}

.edit-profile-btn:active {
  transform: translateY(0);
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.06), rgba(0, 0, 0, 0.15));
  border: 1px solid rgba(74, 158, 255, 0.1);
  border-radius: 12px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s ease;
}

.security-item:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(0, 0, 0, 0.2));
  border-color: rgba(74, 158, 255, 0.18);
  transform: translateX(4px);
}

.security-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.security-icon.ok {
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 212, 170, 0.08));
  color: #00d4aa;
  box-shadow: 0 0 12px rgba(0, 212, 170, 0.2);
}

.security-icon.info {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08));
  color: #fbbf24;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
}

.security-status {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.security-status.ok {
  background: rgba(0, 212, 170, 0.18);
  color: #00d4aa;
  border: 1px solid rgba(0, 212, 170, 0.3);
}

.security-status.info {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.empty-hint {
  font-size: 0.78rem !important;
  color: rgba(255, 255, 255, 0.35) !important;
  margin-top: 6px !important;
}

.panel-footer {
  padding: 18px 24px 22px;
  border-top: 1px solid rgba(74, 158, 255, 0.08);
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.3));
}

.panel-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 13px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: rgba(252, 165, 165, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.08);
}

.section-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  margin: 0;
  letter-spacing: 0.3px;
}

.section-header h4::before {
  content: '';
  width: 4px;
  height: 14px;
  background: linear-gradient(180deg, #4a9eff, #a855f7);
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(74, 158, 255, 0.4);
}

.section-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  padding: 2px 10px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 10px;
}

.clear-history-btn {
  font-size: 0.78rem;
  color: rgba(239, 68, 68, 0.65);
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.clear-history-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.favorite-card {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.06), rgba(74, 158, 255, 0.03));
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.favorite-card:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(74, 158, 255, 0.05));
  border-color: rgba(74, 158, 255, 0.25);
  transform: translateX(-3px);
  box-shadow: -4px 0 16px rgba(74, 158, 255, 0.1);
}

.favorite-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.favorite-card-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.favorite-card-meta {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
}

.favorite-card-salary {
  font-size: 0.82rem;
  color: #00d4aa;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 212, 170, 0.3);
}

.favorite-card-time {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 8px;
  align-self: flex-end;
}

/* 收藏概览卡片 */
.fav-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}

.fav-overview-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.05), rgba(74, 158, 255, 0.02));
  border: 1px solid rgba(74, 158, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.fav-overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: left 0.5s ease;
}

.fav-overview-card:hover::before {
  left: 100%;
}

.fav-overview-card:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(74, 158, 255, 0.04));
  border-color: rgba(74, 158, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(74, 158, 255, 0.12);
}

.fav-overview-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fav-overview-icon.jobs { background: rgba(74, 158, 255, 0.15); color: #4a9eff; box-shadow: 0 0 10px rgba(74, 158, 255, 0.2); }
.fav-overview-icon.applied { background: rgba(0, 212, 170, 0.15); color: #00d4aa; box-shadow: 0 0 10px rgba(0, 212, 170, 0.2); }
.fav-overview-icon.resume { background: rgba(167, 139, 250, 0.15); color: #a78bfa; box-shadow: 0 0 10px rgba(167, 139, 250, 0.2); }
.fav-overview-icon.learning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.2); }

.fav-overview-info {
  display: flex;
  flex-direction: column;
}

.fav-overview-num {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.2;
}

.fav-overview-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);
}

/* 子标签切换 */
.fav-sub-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.06);
}

.fav-sub-tab {
  flex: 1;
  padding: 9px 4px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.78rem;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.fav-sub-tab.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(168, 85, 247, 0.1));
  color: #4a9eff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.15);
}

.fav-sub-tab:hover:not(.active) {
  color: rgba(255, 255, 255, 0.7);
}

/* 投递状态标签 */
.applied-status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.72rem;
  border-radius: 8px;
  margin-top: 2px;
}

.applied-status.pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.applied-status.viewed { background: rgba(74, 158, 255, 0.15); color: #4a9eff; }
.applied-status.interview { background: rgba(167, 139, 250, 0.15); color: #a78bfa; }
.applied-status.offer { background: rgba(0, 212, 170, 0.15); color: #00d4aa; }
.applied-status.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

/* 简历摘要卡片 */
.resume-summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(167, 139, 250, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.resume-summary-card:hover {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.35);
}

.resume-summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resume-summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resume-summary-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.resume-summary-meta {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
}

.resume-summary-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.skill-tag-sm {
  padding: 1px 7px;
  font-size: 0.68rem;
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 6px;
  color: rgba(150, 200, 255, 0.85);
}

.skill-tag-sm.more {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.resume-summary-arrow {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

/* 学习进度卡片 */
.learning-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.learning-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.learning-card:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.learning-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.learning-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.learning-title {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.learning-progress-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.learning-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fb923c);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.learning-percent {
  font-size: 0.78rem;
  color: #f59e0b;
  font-weight: 600;
}

/* 浏览历史列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.04), rgba(74, 158, 255, 0.02));
  border: 1px solid rgba(74, 158, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(74, 158, 255, 0.04));
  border-color: rgba(74, 158, 255, 0.2);
  transform: translateX(-3px);
  box-shadow: -4px 0 12px rgba(74, 158, 255, 0.08);
}

.history-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon.job { background: rgba(74, 158, 255, 0.15); color: #4a9eff; box-shadow: 0 0 8px rgba(74, 158, 255, 0.15); }
.history-icon.resume { background: rgba(167, 139, 250, 0.15); color: #a78bfa; box-shadow: 0 0 8px rgba(167, 139, 250, 0.15); }
.history-icon.planning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.15); }
.history-icon.prediction { background: rgba(0, 212, 170, 0.15); color: #00d4aa; box-shadow: 0 0 8px rgba(0, 212, 170, 0.15); }
.history-icon.default { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.5); }

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-title {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.history-page {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
}

.history-time {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 0.9rem;
  margin: 0;
}

.settings-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  margin: 0 0 16px 0;
  letter-spacing: 0.3px;
}

.settings-section h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #4a9eff, #a855f7);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.5);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.06), rgba(74, 158, 255, 0.03));
  border: 1px solid rgba(74, 158, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 10px;
  transition: all 0.25s ease;
}

.settings-item:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(74, 158, 255, 0.04));
  border-color: rgba(74, 158, 255, 0.15);
}

.settings-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-switch .slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: rgba(255, 255, 255, 0.8);
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .slider {
  background: #4a9eff;
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(22px);
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

/* 用户头像图片样式 */
.profile-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(74, 158, 255, 0.5);
}

.avatar-user-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(74, 158, 255, 0.6);
}

.avatar-upload-hint {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 28px;
  background: rgba(74, 158, 255, 0.7);
  border-radius: 0 0 50% 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.panel-avatar-large:hover .avatar-upload-hint {
  opacity: 1;
}

/* 编辑资料弹窗 */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.edit-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 440px;
  max-height: 90vh;
  background: linear-gradient(180deg, rgba(26, 39, 68, 0.95), rgba(15, 26, 51, 0.95));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: 20px;
  z-index: 1001;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(74, 158, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 26px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.15), rgba(168, 85, 247, 0.1));
  border-bottom: 1px solid rgba(74, 158, 255, 0.12);
  position: relative;
}

.edit-modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.4), transparent);
}

.edit-modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #fff, rgba(74, 158, 255, 0.9));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.edit-modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-modal-close:hover {
  color: #fff;
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  transform: rotate(90deg);
}

.edit-modal-body {
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-height: 60vh;
  overflow-y: auto;
}

.edit-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 20px;
  background: radial-gradient(circle at 50% 50%, rgba(74, 158, 255, 0.08), rgba(0, 0, 0, 0.2));
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.edit-avatar-section::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(from 0deg, transparent, rgba(74, 158, 255, 0.1), transparent);
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.edit-avatar-section:hover {
  border-color: rgba(74, 158, 255, 0.35);
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(74, 158, 255, 0.15);
}

.edit-avatar-preview {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.25), rgba(168, 85, 247, 0.2));
  border: 2px solid rgba(74, 158, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: rgba(123, 196, 255, 0.9);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.3), inset 0 0 20px rgba(74, 158, 255, 0.1);
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;
}

.edit-avatar-section:hover .edit-avatar-preview {
  box-shadow: 0 0 40px rgba(74, 158, 255, 0.5), inset 0 0 30px rgba(74, 158, 255, 0.2);
  transform: scale(1.05);
}

.edit-avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-avatar-text {
  font-size: 0.82rem;
  color: rgba(123, 196, 255, 0.9);
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  font-weight: 500;
}

.edit-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.edit-form-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
}

.edit-form-group input,
.edit-form-group select {
  width: 100%;
  padding: 12px 0;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(74, 158, 255, 0.2);
  border-radius: 0;
  color: #fff;
  font-size: 0.92rem;
  outline: none;
  transition: all 0.35s ease;
  box-sizing: border-box;
}

.edit-form-group input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.edit-form-group input:focus,
.edit-form-group select:focus {
  border-bottom-color: #4a9eff;
  box-shadow: 0 2px 0 0 rgba(74, 158, 255, 0.3);
}

.edit-form-group select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(74, 158, 255, 0.6)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
  padding-right: 20px;
  cursor: pointer;
}

.edit-form-group select option {
  background: #1a2744;
  color: #fff;
}

.edit-modal-footer {
  display: flex;
  gap: 14px;
  padding: 20px 26px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.edit-cancel-btn,
.edit-save-btn {
  flex: 1;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.edit-cancel-btn {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.edit-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.edit-save-btn {
  background: linear-gradient(135deg, #4a9eff 0%, #7b68ee 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.4);
}

.edit-save-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent 60%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.edit-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74, 158, 255, 0.55);
}

.edit-save-btn:hover::before {
  opacity: 1;
}

.edit-save-btn:active {
  transform: translateY(0);
}

.edit-form-group select option {
  background: #1a2744;
  color: #fff;
}

.edit-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(74, 158, 255, 0.12);
}

.edit-cancel-btn,
.edit-save-btn {
  flex: 1;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.edit-cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.edit-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.edit-save-btn {
  background: linear-gradient(135deg, #4a9eff, #7b68ee);
  color: #fff;
  border: 1px solid rgba(74, 158, 255, 0.5);
}

.edit-save-btn:hover {
  background: linear-gradient(135deg, #5aa8ff, #8b78f0);
  box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3);
  transform: translateY(-1px);
}

/* 编辑弹窗滚动条 */
.edit-modal-body::-webkit-scrollbar {
  width: 6px;
}

.edit-modal-body::-webkit-scrollbar-track {
  background: rgba(74, 158, 255, 0.05);
}

.edit-modal-body::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 3px;
}

.edit-modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 158, 255, 0.5);
}
</style>