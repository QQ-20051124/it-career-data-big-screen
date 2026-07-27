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
      <span class="page-title">智能岗位推荐</span>
      <button class="favorites-btn" @click="openFavoritesModal">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        <span>我的收藏</span>
        <span class="favorites-badge" v-if="favorites.length > 0">{{ favorites.length }}</span>
      </button>
      <div class="loading-indicator" v-if="loading">
        <svg class="loading-icon" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="50" class="spin"/>
        </svg>
        <span>加载中...</span>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
          <line x1="21" y1="21" x2="16" y2="16" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
        </svg>
        <input type="text" v-model="searchKeyword" placeholder="搜索岗位、公司、技能关键词" class="search-input" @keyup.enter="handleSearch"/>
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

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
          <span class="result-count">共 {{ totalResults }} 个岗位</span>
        </div>

        <div class="job-cards" v-if="jobList.length > 0">
          <div class="job-card" v-for="(job, index) in jobList" :key="index" @click="openJobDetail(job)">
            <div class="job-card-glow"></div>
            <div class="job-header">
              <div class="job-title">{{ job.job_name }}</div>
              <div class="job-company">{{ job.company }}</div>
            </div>
            <div class="job-info">
              <div class="info-item">
                <span class="label">城市</span>
                <span class="value">{{ job.city }}</span>
              </div>
              <div class="info-item">
                <span class="label">薪资</span>
                <span class="value">{{ formatSalary(job.salary_avg) }}</span>
              </div>
              <div class="info-item">
                <span class="label">学历</span>
                <span class="value">{{ job.education || '不限' }}</span>
              </div>
              <div class="info-item">
                <span class="label">经验</span>
                <span class="value">{{ job.work_exp || '不限' }}</span>
              </div>
              <div class="info-item">
                <span class="label">匹配度</span>
                <span class="value match-value">{{ job.matchScore || getMatchScore(job) }}%</span>
              </div>
            </div>
            <div class="job-tags">
              <span v-for="(tag, tIndex) in getJobTags(job)" :key="tIndex" class="tag">{{ tag }}</span>
            </div>
            <div class="card-corner tl"></div>
            <div class="card-corner tr"></div>
            <div class="card-corner bl"></div>
            <div class="card-corner br"></div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="rgba(74,158,255,0.3)" stroke-width="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p>暂无匹配的岗位</p>
          <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
        </div>

        <button class="reset-btn" v-if="jobList.length > 0" @click="resetFilters">重置筛选</button>
      </div>

      <div class="filter-section">
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
          <div class="filter-label">薪资范围</div>
          <div class="salary-range">
            <input type="range" v-model="minSalary" min="0" max="50" step="5" class="range-input"/>
            <span class="range-value">{{ minSalary }}K - {{ maxSalary }}K</span>
            <input type="range" v-model="maxSalary" min="5" max="100" step="5" class="range-input"/>
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
      <div class="modal-overlay" v-if="showDetailModal" @click="closeJobDetail">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeJobDetail">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="modal-header">
            <h2>{{ selectedJob?.job_name }}</h2>
            <div class="modal-tags">
              <span v-for="(tag, tIndex) in getJobTags(selectedJob)" :key="tIndex" class="modal-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="modal-body">
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
            <div class="detail-row">
              <span class="detail-label">匹配度</span>
              <div class="match-bar-wrapper">
                <div class="match-bar" :style="{ width: (selectedJob?.matchScore || getMatchScore(selectedJob)) + '%' }"></div>
                <span class="match-text">{{ selectedJob?.matchScore || getMatchScore(selectedJob) }}%</span>
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
            <button class="favorites-list-btn" @click="openFavoritesModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"/>
              </svg>
              查看全部收藏
              <span class="favorites-badge-small" v-if="favorites.length > 0">{{ favorites.length }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div class="modal-overlay" v-if="showFavoritesModal" @click="closeFavoritesModal">
        <div class="modal-content favorites-modal" @click.stop>
          <button class="modal-close" @click="closeFavoritesModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="modal-header">
            <h2>我的收藏</h2>
            <div class="favorites-count-header">共 {{ favorites.length }} 个岗位</div>
          </div>
          <div class="modal-body favorites-body">
            <div class="favorites-list" v-if="favorites.length > 0">
              <div class="favorite-item" v-for="(job, index) in favorites" :key="index">
                <div class="favorite-info" @click="openJobDetailFromFavorites(job)">
                  <div class="favorite-title">{{ job.job_name }}</div>
                  <div class="favorite-company">{{ job.company }} - {{ job.city }}</div>
                  <div class="favorite-meta">
                    <span class="favorite-salary">{{ formatSalary(job.salary_avg) }}</span>
                    <span class="favorite-time">{{ formatFavoriteTime(job.favoriteTime) }}</span>
                  </div>
                </div>
                <div class="favorite-actions">
                  <button class="action-btn detail-btn" @click="openJobDetailFromFavorites(job)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    详情
                  </button>
                  <button class="action-btn contact-btn" @click="openContactModalFromFavorites(job)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    联系HR
                  </button>
                  <button class="action-btn unfavorite-btn" @click="removeFavorite(job)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    取消
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
    </Transition>

    <Transition name="modal">
      <div class="modal-overlay" v-if="showContactModal" @click="closeContactModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeContactModal">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <div class="contact-detail">
                  <span class="contact-label">邮箱地址</span>
                  <span class="contact-value">{{ generateContactInfo(selectedContactJob).email }}</span>
                </div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9eff" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="contact-detail">
                  <span class="contact-label">工作地点</span>
                  <span class="contact-value">{{ selectedContactJob?.city }}</span>
                </div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9eff" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

    <Transition name="toast">
      <div class="toast" v-if="showToastFlag" :class="toastType">
        <div class="toast-icon" v-if="toastType === 'success'">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="toast-icon" v-else>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="toast-content">{{ toastMessage }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}

const searchKeyword = ref('')
const activeCategory = ref(0)
const loading = ref(false)
const jobList = ref([])
const totalResults = ref(0)

const categories = ref(['全部岗位', '开发工程师', '运维支持', '教育培训', '人工智能', '今日新岗', '应届生校招', '国企央企'])
const educationOptions = ref([])
const experienceOptions = ref([])
const cityOptions = ref([])

const selectedEducation = ref([])
const selectedExperience = ref([])
const selectedCities = ref([])
const showDetailModal = ref(false)
const selectedJob = ref(null)
const favorites = ref([])
const showContactModal = ref(false)
const showFavoritesModal = ref(false)
const selectedContactJob = ref(null)

const loadFavorites = () => {
  const saved = localStorage.getItem('jobFavorites')
  if (saved) {
    favorites.value = JSON.parse(saved)
  }
}

const saveFavorites = () => {
  localStorage.setItem('jobFavorites', JSON.stringify(favorites.value))
}

const isFavorited = (job) => {
  return favorites.value.some(f => f.job_name === job.job_name && f.company === job.company)
}

const toggleFavorite = (job) => {
  const index = favorites.value.findIndex(f => f.job_name === job.job_name && f.company === job.company)
  if (index > -1) {
    favorites.value.splice(index, 1)
    saveFavorites()
    showToast('已取消收藏', 'warning')
  } else {
    favorites.value.push({
      ...job,
      favoriteTime: new Date().toISOString()
    })
    saveFavorites()
    showToast('收藏成功')
  }
}

const openJobDetail = (job) => {
  selectedJob.value = job
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

const openFavoritesModal = () => {
  showFavoritesModal.value = true
}

const closeFavoritesModal = () => {
  showFavoritesModal.value = false
}

const openJobDetailFromFavorites = (job) => {
  showFavoritesModal.value = false
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
    if (kws.some(kw => jobText.includes(kw))) {
      tags.push(tag)
    }
  }
  
  if (tags.length === 0) {
    tags.push('IT相关')
  }
  
  return tags.slice(0, 3)
}

const getMatchScore = () => {
  return Math.floor(Math.random() * 40) + 60
}

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
  setTimeout(() => {
    showToastFlag.value = false
  }, 3000)
}

const toggleEducation = (option) => {
  const index = selectedEducation.value.indexOf(option)
  if (index > -1) {
    selectedEducation.value.splice(index, 1)
  } else {
    selectedEducation.value.push(option)
  }
}

const toggleExperience = (option) => {
  const index = selectedExperience.value.indexOf(option)
  if (index > -1) {
    selectedExperience.value.splice(index, 1)
  } else {
    selectedExperience.value.push(option)
  }
}

const toggleCity = (option) => {
  const index = selectedCities.value.indexOf(option)
  if (index > -1) {
    selectedCities.value.splice(index, 1)
  } else {
    selectedCities.value.push(option)
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchKeyword.value) params.append('keyword', searchKeyword.value)
    if (categories.value[activeCategory.value] !== '全部岗位') {
      params.append('category', categories.value[activeCategory.value])
    }
    if (selectedEducation.value.length > 0) {
      params.append('education', selectedEducation.value.join(','))
    }
    if (selectedExperience.value.length > 0) {
      params.append('experience', selectedExperience.value.join(','))
    }
    if (selectedCities.value.length > 0) {
      params.append('city', selectedCities.value.join(','))
    }
    if (minSalary.value > 0) {
      params.append('minSalary', minSalary.value * 1000)
    }
    if (maxSalary.value > 0) {
      params.append('maxSalary', maxSalary.value * 1000)
    }

    const response = await axios.get(`/api/jobs/search?${params.toString()}`)
    if (response.data.success) {
      jobList.value = response.data.data.slice(0, 20)
      totalResults.value = response.data.total
    }
  } catch (error) {
    console.error('搜索失败:', error)
    jobList.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeCategory.value = 0
  selectedEducation.value = []
  selectedExperience.value = []
  selectedCities.value = []
  minSalary.value = 0
  maxSalary.value = 50
  handleSearch()
}

const loadOptions = async () => {
  try {
    const [eduRes, expRes, cityRes] = await Promise.all([
      axios.get('/api/jobs/education-options'),
      axios.get('/api/jobs/experience-options'),
      axios.get('/api/jobs/cities')
    ])
    
    if (eduRes.data.success) educationOptions.value = eduRes.data.data.slice(0, 6)
    if (expRes.data.success) experienceOptions.value = expRes.data.data.slice(0, 6)
    if (cityRes.data.success) cityOptions.value = cityRes.data.data.slice(0, 15)
  } catch (error) {
    console.error('加载选项失败:', error)
    educationOptions.value = ['本科', '硕士', '大专', '学历不限']
    experienceOptions.value = ['经验不限', '应届生', '1-3年', '3-5年']
    cityOptions.value = ['北京', '上海', '深圳', '杭州', '广州']
  }
}

const bgCanvas = ref(null)
let bgAnimationId = null

onMounted(() => {
  loadFavorites()
  loadOptions()
  handleSearch()

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
  overflow: hidden;
  padding: 30px 50px;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(74, 158, 255, 0.08);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(74, 158, 255, 0.12);
  border-color: rgba(74, 158, 255, 0.3);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(74, 158, 255, 0.6);
  font-size: 13px;
  margin-left: auto;
}

.favorites-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(251, 146, 60, 0.15);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 10px;
  color: #fb923c;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: auto;
}

.favorites-btn:hover {
  background: rgba(251, 146, 60, 0.25);
  border-color: rgba(251, 146, 60, 0.5);
}

.favorites-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #fb923c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorites-badge-small {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #fb923c;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.loading-icon .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-bar {
  display: flex;
  gap: 15px;
  max-width: 900px;
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
  width: 280px;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
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

.result-count {
  margin-left: auto;
  color: rgba(150, 180, 220, 0.5);
  font-size: 12px;
}

.job-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
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
  gap: 6px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(150, 180, 220, 0.5);
}

.empty-state p {
  margin-top: 15px;
  margin-bottom: 25px;
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

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
  margin-bottom: 10px;
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
}

.filter-options.scrollable::-webkit-scrollbar {
  width: 4px;
}

.filter-options.scrollable::-webkit-scrollbar-track {
  background: rgba(74, 158, 255, 0.1);
  border-radius: 2px;
}

.filter-options.scrollable::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 2px;
}

.filter-option {
  padding: 6px 12px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-option:hover {
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.filter-option.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
  color: #fff;
}

.salary-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-input {
  width: 100%;
  height: 6px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #4a9eff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.range-value {
  text-align: center;
  color: rgba(74, 158, 255, 0.8);
  font-size: 12px;
}

.apply-filter-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background: linear-gradient(135deg, #00d4aa 0%, #4a9eff 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.6);
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

.toast {
  position: fixed;
  top: 100px;
  right: 30px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 320px;
}

.toast.success {
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.9) 0%, rgba(74, 158, 255, 0.9) 100%);
  color: #fff;
}

.toast.warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.9) 0%, rgba(255, 152, 0, 0.9) 100%);
  color: #fff;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(15, 25, 55, 0.95);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.favorites-modal {
  max-width: 600px;
  max-height: 80vh;
}

.favorites-count-header {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.favorites-body {
  max-height: 50vh;
  overflow-y: auto;
  padding: 0;
}

.favorites-list {
  padding: 10px 0;
}

.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
  transition: background 0.2s;
}

.favorite-item:last-child {
  border-bottom: none;
}

.favorite-item:hover {
  background: rgba(74, 158, 255, 0.03);
}

.favorite-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.favorite-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-company {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.favorite-salary {
  font-size: 14px;
  font-weight: 600;
  color: #ff6b6b;
}

.favorite-time {
  font-size: 12px;
  color: #999;
}

.favorite-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.detail-btn {
  background: rgba(74, 158, 255, 0.1);
  color: #4a9eff;
}

.detail-btn:hover {
  background: rgba(74, 158, 255, 0.15);
}

.contact-btn {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.contact-btn:hover {
  background: rgba(6, 182, 212, 0.15);
}

.unfavorite-btn {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
}

.unfavorite-btn:hover {
  background: rgba(251, 146, 60, 0.15);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin-top: 15px;
  font-size: 14px;
}

.modal-header {
  padding: 30px 30px 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.modal-header h2 {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 15px;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-tag {
  padding: 4px 12px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 20px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 12px;
}

.modal-body {
  padding: 25px 30px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.detail-label {
  color: rgba(150, 180, 220, 0.6);
  font-size: 14px;
}

.detail-value {
  color: #fff;
  font-size: 14px;
}

.detail-value.salary {
  color: #4ade80;
  font-weight: 600;
}

.match-bar-wrapper {
  flex: 1;
  max-width: 200px;
  height: 12px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.match-bar {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.match-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #4ade80;
  font-size: 11px;
  font-weight: 600;
}

.detail-section {
  margin-top: 25px;
}

.detail-section h3 {
  color: rgba(74, 158, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px;
}

.job-description {
  color: rgba(200, 210, 230, 0.8);
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.requirement-list {
  margin: 0;
  padding-left: 20px;
}

.requirement-list li {
  color: rgba(200, 210, 230, 0.8);
  font-size: 14px;
  line-height: 2;
  list-style-type: disc;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid rgba(74, 158, 255, 0.15);
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.contact-btn,
.save-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.contact-btn {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(74, 158, 255, 0.1));
  border: 1px solid rgba(74, 158, 255, 0.4);
  color: rgba(74, 158, 255, 0.9);
}

.contact-btn:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.4), rgba(74, 158, 255, 0.2));
  border-color: rgba(74, 158, 255, 0.6);
}

.save-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.save-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.save-btn.favorited {
  background: rgba(251, 146, 60, 0.2);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.4);
}

.save-btn.favorited:hover {
  background: rgba(251, 146, 60, 0.3);
}

.favorites-list-btn {
  padding: 12px 24px;
  border: 1px solid rgba(251, 146, 60, 0.4);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
}

.favorites-list-btn:hover {
  background: rgba(251, 146, 60, 0.2);
  border-color: rgba(251, 146, 60, 0.6);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.contact-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  color: rgba(150, 180, 220, 0.5);
  font-size: 12px;
}

.contact-value {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.contact-tips {
  margin-top: 25px;
  padding: 15px;
  background: rgba(251, 146, 60, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(251, 146, 60, 0.15);
}

.contact-tips h3 {
  color: #fb923c;
  font-size: 14px;
  margin: 0 0 12px;
}

.contact-tips ul {
  margin: 0;
  padding-left: 20px;
}

.contact-tips li {
  color: rgba(200, 210, 230, 0.7);
  font-size: 13px;
  line-height: 2;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

.job-card:hover {
  cursor: pointer;
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateY(-3px);
}
</style>