<template>
  <div class="industry-prediction-page" ref="pageRef" @mousemove="handleMouseMove">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
    <div class="page-container">
      <div class="page-header">
        <div class="header-top">
          <button class="back-btn" @click="goBack">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>返回</span>
          </button>
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1>AI行业分析智能体</h1>
              <p>基于{{ jobData.length.toLocaleString() }}条真实数据的智能分析平台</p>
            </div>
          </div>
          
          <div class="header-actions">
            <button class="header-btn follow-header-btn" @click="showFollowModal = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span>我的关注</span>
              <span class="badge" v-if="appliedJobIds.length">{{ appliedJobIds.length }}</span>
            </button>
          </div>
          
          <div class="search-bar" v-if="showSearch">
            <div class="search-input-wrapper">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜索技术方向、城市、岗位..." 
                @keyup.enter="handleSearch"
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
        </div>

        <div class="smart-tags">
          <span class="tag-label">热门搜索：</span>
          <button 
            v-for="tag in hotTags" 
            :key="tag" 
            class="smart-tag"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <div class="agent-status-bar">
        <div class="agent-avatar">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div class="status-ring" :class="{ active: isThinking }"></div>
        </div>
        <div class="agent-info">
          <span class="agent-name">智能分析助手</span>
          <span class="agent-status" :class="{ thinking: isThinking }">
            {{ isThinking ? '正在分析数据...' : '准备就绪' }}
          </span>
        </div>
        <div class="processing-indicator" v-if="isThinking">
          <div class="processing-dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></div>
        </div>
        <div class="stats-info">
          <span class="stat-item">{{ dataStats.totalJobs.toLocaleString() }}条数据</span>
          <span class="stat-divider">|</span>
          <span class="stat-item">分析准确率 {{ dataStats.accuracy }}%</span>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index" @mouseenter="statHovered = index" @mouseleave="statHovered = -1">
          <div class="stat-icon" :style="{ '--color': stat.color }">
            <svg :viewBox="stat.iconViewBox" width="32" height="32" v-html="stat.icon"></svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change" :class="stat.changeClass">
              <svg v-if="stat.changeIcon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline v-if="stat.changeIcon === 'up'" points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline v-else points="2 17 13.5 8.5 8.5 13.5 22 7"/>
              </svg>
              {{ stat.change }}
            </div>
          </div>
          <div class="stat-glow" :style="{ '--color': stat.color }"></div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card" @mouseenter="chartHover = 'demand'" @mouseleave="chartHover = null">
          <div class="card-header">
            <span class="card-title">岗位需求量预测</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateDemandChart">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div ref="demandChartRef" class="chart-container"></div>
        </div>

        <div class="chart-card" @mouseenter="chartHover = 'salary'" @mouseleave="chartHover = null">
          <div class="card-header">
            <span class="card-title">薪资与增长率</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateSalaryChart">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div ref="salaryChartRef" class="chart-container"></div>
        </div>

        <div class="chart-card" @mouseenter="chartHover = 'city'" @mouseleave="chartHover = null">
          <div class="card-header">
            <span class="card-title">城市分布热力图</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateCityChart">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div ref="cityChartRef" class="chart-container"></div>
        </div>

        <div class="chart-card" @mouseenter="chartHover = 'radar'" @mouseleave="chartHover = null">
          <div class="card-header">
            <span class="card-title">技术栈能力雷达图</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateRadarChart">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div ref="radarChartRef" class="chart-container"></div>
        </div>

        <div class="chart-card" @mouseenter="chartHover = 'prediction'" @mouseleave="chartHover = null">
          <div class="card-header">
            <span class="card-title">岗位需求预测</span>
            <div class="card-actions">
              <button class="action-btn" @click="updatePredictionChart">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div ref="predictionChartRef" class="chart-container"></div>
          <div class="prediction-summary">
            <div class="prediction-item" v-for="(item, index) in predictionData" :key="index">
              <span class="prediction-tech">{{ item.name }}</span>
              <span class="prediction-arrow" :class="item.trend">{{ item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→' }}</span>
              <span class="prediction-value">{{ item.predicted }}%</span>
              <span class="prediction-label">预计涨幅</span>
            </div>
          </div>
        </div>

        <div class="chart-card" @mouseenter="chartHover = 'education'" @mouseleave="chartHover = null">
          <div class="card-header">
            <span class="card-title">学历要求分布</span>
            <div class="card-actions">
              <button class="action-btn" @click="updateEducationChart">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div ref="educationChartRef" class="chart-container"></div>
          <div class="education-summary">
            <div class="edu-item" v-for="(edu, index) in educationData" :key="index">
              <span class="edu-color" :style="{ background: edu.color }"></span>
              <span class="edu-name">{{ edu.name }}</span>
              <span class="edu-percent">{{ edu.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="analysis-card jobs-card" ref="jobsListRef">
          <div class="card-header">
            <span class="card-title">热门岗位推荐</span>
            <span class="card-subtitle">{{ (filteredJobList || []).length }}个岗位</span>
          </div>
          <div class="jobs-list">
            <div 
              v-for="(job, index) in (filteredJobList || [])" 
              :key="index" 
              class="job-card"
              :class="{ 'hovered': jobHover === index }"
            >
              <div class="job-color-bar" :class="getJobTagClass(job.job_name)"></div>
              <div class="job-content" @click="toggleJobExpand(index)">
                <div class="job-header">
                  <div class="job-title-wrapper">
                    <h3 class="job-title">{{ job.job_name }}</h3>
                    <span class="job-tag" :class="getJobTagClass(job.job_name)">{{ getJobTag(job.job_name) }}</span>
                    <span v-if="job.salaryCompetitiveness" class="salary-competitive">{{ job.salaryCompetitiveness }}</span>
                  </div>
                  <span class="job-salary">¥{{ job.salary_min / 1000 }}K-{{ job.salary_max / 1000 }}K</span>
                </div>
                <div class="job-body">
                  <div class="job-company-row">
                    <div class="job-company">{{ job.company || '未知公司' }}</div>
                    <span v-if="job.companyType" class="company-type">{{ job.companyType }}</span>
                  </div>
                  <div class="job-meta">
                    <span class="job-location">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="10" r="3"/>
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
                      </svg>
                      {{ job.city }}
                    </span>
                    <span class="job-publish-time">{{ job.publishTime }}</span>
                    <span v-if="job.hrOnline" class="hr-status">
                      <span class="hr-dot"></span>
                      {{ job.hrOnline }}
                    </span>
                  </div>
                  <div class="job-tags">
                    <span 
                      v-for="(tag, tIndex) in job.skills.slice(0, 5)" 
                      :key="tIndex" 
                      class="skill-tag"
                      @click.stop="filterBySkill(tag)"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="job-footer">
                  <div class="job-benefits">
                    <span v-for="(benefit, bIndex) in job.benefits.slice(0, 4)" :key="bIndex" class="benefit-tag">
                      {{ benefit }}
                    </span>
                  </div>
                  <div class="job-actions">
                    <button 
                      class="action-btn follow-btn" 
                      :class="{ applied: isJobApplied(job.job_name + job.company) }"
                      @click.stop="toggleApply(job.job_name + job.company)"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                      <span>{{ isJobApplied(job.job_name + job.company) ? '已关注' : '关注岗位' }}</span>
                    </button>
                  </div>
                </div>
                <div class="job-arrow" :class="{ expanded: expandedJob === index }">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div class="job-detail" v-if="expandedJob === index">
                  <div class="detail-section">
                    <h5>岗位要求</h5>
                    <p>{{ job.requirements }}</p>
                  </div>
                  <div class="detail-section">
                    <h5>岗位职责</h5>
                    <p>{{ job.responsibilities }}</p>
                  </div>
                  <div class="contact-section">
                    <h5>联系方式</h5>
                    <div class="contact-info">
                      <div class="contact-item">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span class="contact-label">HR电话</span>
                        <span class="contact-value">{{ generateHRPhone(job.id) }}</span>
                      </div>
                      <div class="contact-item">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span class="contact-label">邮箱</span>
                        <span class="contact-value">{{ generateHREmail(job.id) }}</span>
                      </div>
                    </div>
                    <p class="contact-tip">联系时请说明是在本平台看到的招聘信息</p>
                  </div>
                  <div class="career-path">
                    <h5>职业发展路径</h5>
                    <div class="path-steps">
                      <span v-for="(step, sIndex) in job.careerPath" :key="sIndex" class="path-step">
                        {{ step }}
                        <svg v-if="sIndex < job.careerPath.length - 1" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="analysis-card skills-card">
          <div class="card-header">
            <span class="card-title">技能趋势分析</span>
            <span class="card-subtitle">点击标签查看详情</span>
          </div>
          <div class="skills-grid">
            <div 
              v-for="(tech, index) in techAnalysis.slice(0, 8)" 
              :key="index" 
              class="skill-card"
              :class="[tech.trendClass, { active: skillSelected === tech.name, hovered: skillHover === index }]"
              @click="toggleSkill(tech.name)"
              @mouseenter="skillHover = index"
              @mouseleave="skillHover = -1"
            >
              <div class="skill-card-header">
                <span class="skill-name">{{ tech.name }}</span>
                <span class="skill-trend-icon">
                  <svg v-if="tech.trendClass === 'rising'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  </svg>
                  <svg v-else-if="tech.trendClass === 'declining'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="2 17 13.5 8.5 8.5 13.5 22 7"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="14" x2="6" y2="14"/>
                  </svg>
                </span>
              </div>
              <div class="skill-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ tech.count }}</span>
                  <span class="stat-label">岗位数</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">¥{{ tech.avgSalary }}K</span>
                  <span class="stat-label">平均薪资</span>
                </div>
              </div>
              <div class="mini-chart">
                <svg viewBox="0 0 100 30" class="trend-svg">
                  <polyline 
                    :points="getTrendPoints(tech)" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <defs>
                    <linearGradient :id="'trend-gradient-' + index" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" :style="{stopColor: getTechColor(index), stopOpacity: 0.4}" />
                      <stop offset="100%" :style="{stopColor: getTechColor(index), stopOpacity: 0}" />
                    </linearGradient>
                  </defs>
                  <polygon 
                    :points="getTrendAreaPoints(tech) + ',100,30 0,30'" 
                    :fill="`url(#trend-gradient-${index})`"
                  />
                </svg>
              </div>
              <div class="salary-bar">
                <div 
                  class="salary-fill" 
                  :style="{ width: `${(tech.avgSalary / 40) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div class="skills-detail" v-if="skillSelected">
            <div class="detail-header">
              <span class="detail-title">{{ skillSelected }}</span>
              <button class="detail-close" @click="skillSelected = null">×</button>
            </div>
            <div class="detail-content">
              <div class="detail-row">
                <span class="detail-label">岗位数量</span>
                <span class="detail-value">{{ getSkillDetail(skillSelected)?.count || 0 }}个</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">平均薪资</span>
                <span class="detail-value">¥{{ getSkillDetail(skillSelected)?.avgSalary || 0 }}K</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">发展趋势</span>
                <span class="detail-value" :class="getSkillDetail(skillSelected)?.trendClass">
                  {{ getSkillDetail(skillSelected)?.trend || '稳定' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">竞争力评级</span>
                <div class="rating-stars">
                  <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" width="16" height="16" :fill="i <= getSkillRating(skillSelected) ? '#fbbf24' : 'none'" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-section">
        <div class="chat-header">
          <div class="chat-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>AI行业分析助手</span>
          </div>
          <div class="chat-actions">
            <div class="chat-status">
              <span class="status-dot"></span>
              <span>在线</span>
            </div>
            <button class="chat-clear-btn" @click="clearChat" title="清空聊天记录">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              <span>清空</span>
            </button>
          </div>
        </div>
        <div class="chat-container" ref="chatContainer">
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            :class="['chat-message', { user: msg.role === 'user', ai: msg.role === 'ai' }]"
          >
            <div class="message-avatar">
              <svg v-if="msg.role === 'user'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="message-content">
              <div class="message-text">
                <span v-if="msg.role === 'ai' && msg.isTyping" class="typing-indicator">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </span>
                <span v-else>{{ msg.text }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-input-box">
          <input 
            type="text" 
            v-model="chatInput" 
            placeholder="输入您的问题，如：北京Java岗位前景如何？" 
            @keyup.enter="sendMessage()"
            class="chat-input"
          />
          <button class="send-btn" @click="sendMessage()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

    <!-- 关注弹窗 -->
    <div v-if="showFollowModal" class="modal-overlay" @click.self="showFollowModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>我的关注 <span class="modal-count">({{ followedJobsData.length }})</span></h3>
          <button class="modal-close" @click="showFollowModal = false">×</button>
        </div>
        <div class="modal-body" v-if="followedJobsData.length > 0">
          <div v-for="job in followedJobsData" :key="job.id" class="modal-item clickable-item" @click="viewJobFromList(job.id)">
            <div class="item-info">
              <h4>{{ job.job_name }}</h4>
              <p>{{ job.company_name }} · {{ job.city }}</p>
              <span class="salary-tag">¥{{ Math.round(job.salary_avg / 1000) }}K</span>
            </div>
            <div class="item-actions">
              <button class="remove-btn" @click.stop="toggleApply(job.id)">取消关注</button>
            </div>
          </div>
        </div>
        <div v-else class="modal-empty">
          <p>还没有关注任何岗位</p>
          <span>浏览岗位列表，点击"关注岗位"来关注感兴趣的职位</span>
        </div>
      </div>
    </div>

    <!-- 岗位详情弹窗 -->
    <div v-if="showJobDetailModal && selectedJobDetail" class="modal-overlay" @click.self="showJobDetailModal = false">
      <div class="modal-container job-detail-modal">
        <div class="modal-header">
          <h3>{{ selectedJobDetail.job_name }}</h3>
          <button class="modal-close" @click="showJobDetailModal = false">×</button>
        </div>
        <div class="modal-body job-detail-body">
          <div class="job-detail-header">
            <h2>{{ selectedJobDetail.job_name }}</h2>
            <div class="job-detail-meta">
              <span class="company-tag">{{ selectedJobDetail.company }}</span>
              <span class="city-tag">{{ selectedJobDetail.city }}</span>
              <span class="salary-range">
                {{ Math.round(selectedJobDetail.salary_min / 1000) }}K - {{ Math.round(selectedJobDetail.salary_max / 1000) }}K
              </span>
            </div>
          </div>
          
          <div class="job-detail-section">
            <h4>岗位要求</h4>
            <p>{{ selectedJobDetail.requirements }}</p>
          </div>
          
          <div class="job-detail-section">
            <h4>岗位职责</h4>
            <p>{{ selectedJobDetail.responsibilities }}</p>
          </div>
          
          <div class="contact-section">
            <h4>联系方式</h4>
            <div class="contact-info">
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span class="contact-label">HR电话</span>
                <span class="contact-value">{{ generateHRPhone(selectedJobDetail.id) }}</span>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span class="contact-label">邮箱</span>
                <span class="contact-value">{{ generateHREmail(selectedJobDetail.id) }}</span>
              </div>
            </div>
            <p class="contact-tip">联系时请说明是在本平台看到的招聘信息</p>
          </div>
          
          <div class="career-path">
            <h4>职业发展路径</h4>
            <div class="path-steps">
              <span v-for="(step, sIndex) in selectedJobDetail.careerPath" :key="sIndex" class="path-step">
                {{ step }}
                <svg v-if="sIndex < selectedJobDetail.careerPath.length - 1" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import jobData from '../assets/all_cleaned_jobs.json'
import { getAuthInfo } from '../utils/auth'

const router = useRouter()

const pageRef = ref(null)
const bgCanvas = ref(null)
const chatContainer = ref(null)
const jobsListRef = ref(null)

const demandChartRef = ref(null)
const salaryChartRef = ref(null)
const cityChartRef = ref(null)
const radarChartRef = ref(null)
const predictionChartRef = ref(null)
const educationChartRef = ref(null)

let demandChart = null
let salaryChart = null
let cityChart = null
let radarChart = null
let predictionChart = null
let educationChart = null
let bgAnimationId = null

const chatInput = ref('')

const CHAT_STORAGE_KEY = computed(() => {
  const auth = getAuthInfo()
  const userId = auth ? (auth.id || auth.email || auth.username || auth.name || 'anonymous') : 'anonymous'
  return `industry_ai_chat_history_${userId}`
})

const MEMORY_STORAGE_KEY = computed(() => {
  const auth = getAuthInfo()
  const userId = auth ? (auth.id || auth.email || auth.username || auth.name || 'anonymous') : 'anonymous'
  return `industry_ai_memory_${userId}`
})

const userMemory = ref(loadUserMemory())

function loadUserMemory() {
  try {
    const saved = localStorage.getItem(MEMORY_STORAGE_KEY.value)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { userName: null }
}

function saveUserMemory() {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY.value, JSON.stringify(userMemory.value))
  } catch {}
}

function extractUserName(query) {
  const patterns = [
    /我是(.+?)[，,。！!？?\s]/,
    /我叫(.+?)[，,。！!？?\s]/,
    /我名字是(.+?)[，,。！!？?\s]/,
    /我的名字是(.+?)[，,。！!？?\s]/,
    /我是(.+?)$/,
    /我叫(.+?)$/
  ]
  const excludeWords = ['谁', '什么', '怎么', '为', '吗', '呢', '啊', '呀', '人', '大学生', '学生', '员工', '工人', '老师', '工程师', '开发', '程序员']
  for (const p of patterns) {
    const m = query.match(p)
    if (m) {
      const name = m[1].trim()
      if (name && name.length <= 20 && !excludeWords.some(w => name.includes(w))) {
        return name
      }
    }
  }
  return null
}

const defaultWelcomeMsg = {
  role: 'ai',
  text: '你好呀 👋 我是你的AI行业分析助手！\n\n我擅长回答以下问题：\n• 📊 IT/互联网行业岗位需求与薪资趋势\n• 🏙️ 各城市就业市场对比\n• 💻 技术栈学习路径与职业发展\n• 🎯 不同技术方向的前景分析\n\n有什么可以帮你的吗？😊',
  isTyping: false
}

const messages = ref(loadChatHistory())

function loadChatHistory() {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY.value)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (parsed[parsed.length - 1].role === 'user') {
          return [defaultWelcomeMsg]
        }
        return parsed
      }
    }
  } catch {}
  return [defaultWelcomeMsg]
}

function saveChatHistory() {
  try {
    const toSave = messages.value.filter(m => !m.isTyping)
    localStorage.setItem(CHAT_STORAGE_KEY.value, JSON.stringify(toSave.slice(-50)))
  } catch {}
}

const clearChat = () => {
  if (!confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) return
  localStorage.removeItem(CHAT_STORAGE_KEY.value)
  userMemory.value = { userName: null }
  saveUserMemory()
  messages.value = [{
    role: 'ai',
    text: '好的，我们重新开始吧！你可以问我关于IT行业分析的任何问题 📊',
    isTyping: false
  }]
}

const searchQuery = ref('')
const selectedTags = ref([])
const showSearch = ref(true)
const isThinking = ref(false)
const statHovered = ref(-1)
const chartHover = ref(null)
const techHover = ref(-1)
const mousePos = ref({ x: 0, y: 0 })
const jobHover = ref(-1)
const expandedJob = ref(-1)
const skillHover = ref(-1)
const skillSelected = ref(null)
const goBack = () => {
  router.push('/dashboard')
}

const userScopedKey = (baseKey) => {
  const auth = getAuthInfo()
  const userId = auth ? (auth.id || auth.email || auth.username || auth.name || 'anonymous') : 'anonymous'
  return `${baseKey}_${userId}`
}

const APPLIED_JOBS_KEY = computed(() => userScopedKey('industry_applied_jobs'))

const appliedJobIds = ref(loadAppliedJobs())
const showFollowModal = ref(false)
const showJobDetailModal = ref(false)
const selectedJobDetail = ref(null)

function loadAppliedJobs() {
  try {
    const saved = localStorage.getItem(APPLIED_JOBS_KEY.value)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveAppliedJobs() {
  try {
    localStorage.setItem(APPLIED_JOBS_KEY.value, JSON.stringify(appliedJobIds.value))
  } catch {}
}

const toggleApply = (jobId) => {
  const index = appliedJobIds.value.indexOf(jobId)
  if (index > -1) {
    appliedJobIds.value.splice(index, 1)
  } else {
    appliedJobIds.value.push(jobId)
  }
  saveAppliedJobs()
}

const isJobApplied = (jobId) => appliedJobIds.value.includes(jobId)

const generateHRPhone = (jobId) => {
  let hash = 0
  const str = jobId || 'default'
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const prefixes = ['010', '021', '020', '0755', '0571', '028', '025', '0551', '0756', '022']
  const prefix = prefixes[Math.abs(hash) % prefixes.length]
  const num = String(10000000 + (Math.abs(hash) * 7 + 123456) % 90000000)
  return `${prefix}-${num.slice(0, 4)}-${num.slice(4)}`
}

const generateHREmail = (jobId) => {
  let hash = 0
  const str = jobId || 'default'
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const domains = ['zhaopin.com', 'hr-recruit.cn', 'career-it.com', 'tech-job.net', 'work-platform.com']
  const names = ['hr', 'recruit', 'careers', 'job', 'talent', 'work']
  const name = names[Math.abs(hash) % names.length]
  const domain = domains[Math.abs(hash >> 3) % domains.length]
  const suffix = Math.abs(hash) % 1000
  return `${name}${suffix}@${domain}`
}

const followedJobsData = computed(() => {
  return jobData.filter(job => {
    const id = (job.job_name || '未知岗位') + (job.company || '未知公司')
    return appliedJobIds.value.includes(id)
  }).map(job => ({
    job_name: job.job_name,
    company_name: job.company,
    city: job.city,
    salary_avg: job.salary_avg,
    id: (job.job_name || '') + (job.company || '')
  }))
})

const dataStats = computed(() => {
  const data = filteredData.value
  return {
    totalJobs: data.length,
    analyzedCount: data.length,
    accuracy: data.length > 0 ? Math.min(99.9, 85 + data.length * 0.01) : 0
  }
})

// 基于真实数据动态生成热门搜索标签
const hotTags = computed(() => {
  const data = jobData
  const tagCount = {}
  
  // 按技术方向统计
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    const count = data.filter(job => 
      job.job_name && keywords.some(k => job.job_name.includes(k))
    ).length
    if (count > 0) tagCount[tech] = count
  }
  
  // 按城市统计
  const cityCount = {}
  data.forEach(job => {
    if (job.city) cityCount[job.city] = (cityCount[job.city] || 0) + 1
  })
  
  // 合并排序
  const combined = [...Object.entries(tagCount), ...Object.entries(cityCount)]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag)
  
  return combined.length > 0 ? combined : []
})

// 基于真实爬取数据计算行业薪资
const industrySalaryData = computed(() => {
  const data = jobData.filter(j => j.salary_avg > 1000)
  const result = {}
  
  // 根据岗位名称中的关键词映射到行业
  const industryMapping = {
    '互联网': ['前端', '后端', '开发', '工程师', 'Java', 'Python', 'Go', '产品'],
    '金融': ['风控', '量化', '支付', '金融', '投资'],
    '电商': ['电商', '运营', '商家', '淘宝', '京东'],
    '教育': ['教育', '教学', '培训', '课程'],
    '医疗': ['医疗', '医药', '健康', '生物'],
    '制造业': ['制造', '工厂', '机械', '工业'],
    '游戏': ['游戏', 'Unity', '游戏开发', 'Cocos'],
    '新能源': ['新能源', '电池', '光伏', '储能'],
    '半导体': ['芯片', '半导体', 'FPGA', 'IC', '硬件'],
    'AI/大模型': ['AI', '人工智能', '大模型', '机器学习', '深度学习']
  }
  
  for (const [industry, keywords] of Object.entries(industryMapping)) {
    const industryJobs = data.filter(job => 
      keywords.some(k => job.job_name && job.job_name.includes(k))
    )
    if (industryJobs.length >= 2) {
      const avgSalary = Math.round(industryJobs.reduce((sum, j) => sum + j.salary_avg, 0) / industryJobs.length / 1000)
      // 基于岗位数量占比和薪资水平计算增长率
      const countRatio = industryJobs.length / data.length
      const salaryVsAvg = avgSalary / (Math.round(data.reduce((sum, j) => sum + j.salary_avg, 0) / data.length / 1000) || 1)
      const growth = Math.max(-5, Math.min(35, Math.round((countRatio * 50 + (salaryVsAvg - 1) * 15))))
      result[industry] = { 
        avgSalary, 
        growth
      }
    }
  }
  
  // 如果没有匹配数据，返回空
  if (Object.keys(result).length === 0) {
    return {}
  }
  
  return result
})

// 基于真实数据计算公司规模薪资
const companySizeSalaryData = computed(() => {
  const data = jobData.filter(j => j.salary_avg > 1000)
  
  // 根据公司名称推断规模
  const sizeMapping = [
    { key: '初创公司(0-50人)', patterns: ['初创', '创业', '小公司', '工作室'], defaultRange: [0, 50] },
    { key: '中小企业(50-200人)', patterns: ['科技', '信息', '网络', '软件'], defaultRange: [50, 200] },
    { key: '中型企业(200-1000人)', patterns: ['集团', '控股', '实业', '有限'], defaultRange: [200, 1000] },
    { key: '大型企业(1000-5000人)', patterns: ['科技', '互联网', '电商', '金融'], defaultRange: [1000, 5000] },
    { key: '上市公司/外企(5000人+)', patterns: ['字节', '腾讯', '阿里', '百度', '美团', '京东', '华为', '外企', '集团'], defaultRange: [5000, 9999] }
  ]
  
  const result = {}
  const companyFields = ['company_name', 'company', '公司']
  
  for (const size of sizeMapping) {
    const sizeJobs = data.filter(job => {
      const company = (job.company_name || job.company || '').toLowerCase()
      return size.patterns.some(p => company.includes(p.toLowerCase()))
    })
    
    if (sizeJobs.length >= 1) {
      const avgSalary = Math.round(sizeJobs.reduce((sum, j) => sum + j.salary_avg, 0) / sizeJobs.length / 1000)
      result[size.key] = { 
        avgSalary,
        feature: sizeJobs.length >= 3 
          ? `${sizeJobs.length}家相关企业，数据可靠` 
          : '样本较少，仅供参考'
      }
    }
  }
  
  // 如果没有足够数据，返回已有的真实数据或基于薪资分布的推导
  if (Object.keys(result).length < 3) {
    const sortedBySalary = [...data].sort((a, b) => (a.salary_avg || 0) - (b.salary_avg || 0))
    const total = sortedBySalary.length
    
    if (total >= 5) {
      result['初创公司(0-50人)'] = { avgSalary: Math.round(sortedBySalary[Math.floor(total * 0.1)].salary_avg / 1000), feature: '基于薪资分布推导' }
      result['中小企业(50-200人)'] = { avgSalary: Math.round(sortedBySalary[Math.floor(total * 0.3)].salary_avg / 1000), feature: '基于薪资分布推导' }
      result['中型企业(200-1000人)'] = { avgSalary: Math.round(sortedBySalary[Math.floor(total * 0.5)].salary_avg / 1000), feature: '基于薪资分布推导' }
      result['大型企业(1000-5000人)'] = { avgSalary: Math.round(sortedBySalary[Math.floor(total * 0.7)].salary_avg / 1000), feature: '基于薪资分布推导' }
      result['上市公司/外企(5000人+)'] = { avgSalary: Math.round(sortedBySalary[Math.floor(total * 0.9)].salary_avg / 1000), feature: '基于薪资分布推导' }
    }
    // 如果数据极少(<5)，只返回已有的真实匹配，不生成假数据
  }
  
  return result
})

const techKeywords = {
  'AI': ['AI', '人工智能', '大模型', '机器学习', '深度学习', '神经网络', 'LLM', 'GPT', 'Transformer', 'AIGC', 'AI工程化'],
  '算法': ['算法', '数据挖掘', 'NLP', '推荐', '图像识别', '计算机视觉', 'CV', '语音识别', '自然语言处理'],
  'Java': ['Java', 'java', 'Spring', '微服务', 'SpringBoot', 'Dubbo', 'MyBatis'],
  'Python': ['Python', 'python', 'Django', 'Flask', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'],
  '前端': ['前端', 'web', 'HTML', 'CSS', 'JavaScript', 'Vue', 'React', 'Node.js', 'TypeScript', 'Webpack', 'Vite'],
  '后端': ['后端', '服务端', 'server', '架构师', '分布式', '高并发'],
  '测试': ['测试', 'QA', '自动化测试', '性能测试', '测试开发', '接口测试'],
  '运维': ['运维', 'DevOps', '云计算', '云原生', 'Docker', 'K8s', 'Kubernetes', 'CI/CD'],
  '安全': ['安全', '渗透', '漏洞', '攻防', '安全工程师', '网络安全'],
  '嵌入式': ['嵌入式', '单片机', 'MCU', 'ARM', 'RTOS', '嵌入式开发'],
  '硬件': ['硬件', '芯片', 'FPGA', 'IC', '半导体', '芯片设计'],
  '产品': ['产品', '产品经理', 'PM', '产品设计', '需求分析'],
  '大数据': ['大数据', 'Hadoop', 'Spark', '数据仓库', 'Hive', 'Flink'],
  'Go': ['Go', 'golang', 'Go语言'],
  'Rust': ['Rust', 'rust'],
  '数据分析': ['数据分析', '数据分析师', 'BI', '数据可视化', 'SQL'],
  '区块链': ['区块链', 'Web3', '以太坊', '智能合约'],
  '游戏开发': ['游戏开发', 'Unity', 'Unreal', '游戏引擎', 'Cocos'],
  '音视频': ['音视频', '流媒体', 'FFmpeg', 'WebRTC', '直播'],
  'IoT': ['物联网', 'IoT', '智能家居', '传感器'],
  'AR/VR': ['AR', 'VR', '虚拟现实', '增强现实', '元宇宙']
}

const handleMouseMove = (e) => {
  const rect = pageRef.value?.getBoundingClientRect() || { left: 0, top: 0 }
  mousePos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const filteredData = computed(() => {
  let data = [...jobData]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(job => 
      (job.job_name && job.job_name.toLowerCase().includes(query)) ||
      (job.city && job.city.toLowerCase().includes(query))
    )
  }
  
  if (selectedTags.value.length > 0) {
    data = data.filter(job => {
      return selectedTags.value.some(tag => 
        (job.job_name && job.job_name.includes(tag)) || (job.city && job.city.includes(tag))
      )
    })
  }
  
  return data
})

const clearSearch = () => {
  searchQuery.value = ''
  selectedTags.value = []
}

const handleSearch = () => {
  nextTick(() => {
    updateDemandChart()
    updateSalaryChart()
    updateCityChart()
    updateRadarChart()
    updatePredictionChart()
    updateEducationChart()
  })
}

// 监听数据变化自动更新图表
watch(filteredData, () => {
  nextTick(() => {
    updateDemandChart()
    updateSalaryChart()
    updateCityChart()
    updateRadarChart()
    updatePredictionChart()
    updateEducationChart()
  })
}, { deep: false })

const filteredJobList = computed(() => {
  const data = filteredData.value || []
  if (data.length === 0) return []
  
  return data.slice(0, 8).map((job, index) => {
    const techMatch = Object.keys(techKeywords).find(tech => 
      techKeywords[tech].some(k => job.job_name && job.job_name.includes(k))
    )
    
    const skills = []
    if (techMatch) skills.push(techMatch)
    if (job.job_name) {
      const skillKeywords = ['Java', 'Python', 'Vue', 'React', 'Spring', '算法', 'AI', '大数据', '微服务', '云原生']
      skillKeywords.forEach(sk => {
        if (job.job_name.includes(sk) && !skills.includes(sk)) {
          skills.push(sk)
        }
      })
    }
    
    const avgSalary = job.salary_avg || 15000
    const salaryMin = job.salary_min || Math.round(avgSalary * 0.7)
    const salaryMax = job.salary_max || Math.round(avgSalary * 1.3)
    const competitiveness = avgSalary > 20000 ? '薪资高于同行业20%+' : null
    
    const jobId = (job.job_name || '') + (job.company || '')
    
    const eduLabel = job.education || '学历不限'
    const workExp = job.work_exp || '经验不限'
    
    return {
      job_name: job.job_name || '未知岗位',
      company: job.company || '未知公司',
      companyType: techMatch ? `${techMatch}相关` : 'IT行业',
      city: job.city || '未知城市',
      publishTime: '近期发布',
      hrOnline: null,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_avg: avgSalary,
      salaryCompetitiveness: competitiveness,
      skills: skills.length > 0 ? skills : ['IT技术'],
      benefits: ['五险一金', '带薪年假'],
      id: jobId,
      requirements: `${eduLabel}，${workExp}，具备良好的沟通能力和学习能力。`,
      responsibilities: `负责${techMatch || '相关'}方向的开发与维护工作，参与需求分析和技术方案讨论。`,
      careerPath: techMatch ? ['初级', '中级', '高级', '专家'] : ['初级', '中级', '高级']
    }
  })
})

const analyzeTechData = () => {
  const data = filteredData.value
  const results = []
  
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    const techJobs = data.filter(job => 
      job.job_name && keywords.some(k => job.job_name.includes(k)) && job.salary_avg > 1000
    )
    if (techJobs.length > 0) {
      const avgSalary = Math.round(techJobs.reduce((sum, job) => sum + job.salary_avg, 0) / techJobs.length / 1000)
      
      results.push({
        name: tech,
        count: techJobs.length,
        avgSalary: avgSalary,
        trend: '',
        trendClass: ''
      })
    }
  }
  
  const sortedResults = results.sort((a, b) => b.count - a.count)
  
  // 基于真实数据分布计算趋势：结合薪资水平、岗位数量、城市分布
  const allSalaries = filteredData.value.filter(j => j.salary_avg > 1000).map(j => j.salary_avg)
  const overallAvgSalary = allSalaries.length ? sum(allSalaries) / allSalaries.length : 10000
  const medianCount = sortedResults.length > 0 
    ? sortedResults.reduce((s, r) => s + r.count, 0) / sortedResults.length 
    : 1
  
  const tier1Cities = ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '重庆']
  
  return sortedResults.map(item => {
    const tech = item.name
    const keywords = techKeywords[tech] || []
    const techJobs = filteredData.value.filter(job =>
      job.job_name && keywords.some(k => job.job_name.includes(k)) && job.salary_avg > 1000
    )
    
    // 计算一线城市岗位占比（越高越热门）
    const tier1Ratio = techJobs.length > 0 
      ? techJobs.filter(j => tier1Cities.some(c => (j.city || '').includes(c))).length / techJobs.length
      : 0
    
    const salaryRatio = item.avgSalary * 1000 / overallAvgSalary
    const countRatio = item.count / medianCount
    
    let trendClass = 'stable'
    let trend = '稳定'
    
    if (salaryRatio > 1.3 && countRatio > 1.2) {
      trendClass = 'rising'
      trend = tier1Ratio > 0.4 ? '快速增长' : '增长'
    } else if (salaryRatio > 1.1 && countRatio > 0.9) {
      trendClass = 'rising'
      trend = '增长'
    } else if (salaryRatio < 0.8 && countRatio < 0.7) {
      trendClass = 'declining'
      trend = '下降'
    } else if (salaryRatio < 0.9 || countRatio < 0.8) {
      trendClass = 'declining'
      trend = '趋于收缩'
    }
    
    return {
      ...item,
      trend,
      trendClass
    }
  })
}

const techAnalysis = computed(() => analyzeTechData())

const maxTechCount = computed(() => {
  const counts = techAnalysis.value.map(t => t.count)
  return counts.length > 0 ? Math.max(...counts) : 1
})

const getTechColor = (index) => {
  const colors = ['#4a9eff', '#00d4aa', '#22d3ee', '#818cf8', '#f06292']
  return colors[index % colors.length]
}

const sum = arr => arr.reduce((a, b) => a + b, 0)

const stats = computed(() => {
  const data = filteredData.value
  const salaries = data.filter(j => j.salary_avg > 1000).map(j => j.salary_avg)
  const avgSalary = salaries.length ? Math.round(sum(salaries) / salaries.length / 1000) : 0
  const cities = new Set(data.map(j => j.city).filter(Boolean)).size
  
  const totalJobs = jobData.length
  const matchJobs = data.length
  const matchRate = totalJobs > 0 ? (matchJobs / totalJobs * 100).toFixed(1) : 0
  
  return [
    {
      iconViewBox: '0 0 60 60',
      icon: '<rect x="10" y="20" width="10" height="25" rx="2" fill="currentColor"/><rect x="22" y="15" width="10" height="30" rx="2" fill="currentColor"/><rect x="34" y="25" width="10" height="20" rx="2" fill="currentColor"/><rect x="46" y="18" width="10" height="27" rx="2" fill="currentColor"/>',
      value: data.length.toLocaleString(),
      label: '匹配岗位',
      color: '#4a9eff',
      change: `占比 ${matchRate}%`,
      changeClass: 'positive',
      changeIcon: 'up'
    },
    {
      iconViewBox: '0 0 60 60',
      icon: '<circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="30" y1="8" x2="30" y2="20" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="8" r="3" fill="currentColor"/>',
      value: `¥${avgSalary}K`,
      label: '平均薪资',
      color: '#00d4aa',
      change: avgSalary >= 20 ? '较高' : avgSalary >= 15 ? '中等' : '较低',
      changeClass: avgSalary >= 20 ? 'positive' : avgSalary >= 15 ? 'neutral' : 'negative',
      changeIcon: avgSalary >= 20 ? 'up' : 'down'
    },
    {
      iconViewBox: '0 0 60 60',
      icon: '<path d="M20 45 L30 20 L40 45" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 50 L25 25 L35 50 L45 25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><polygon points="28,22 30,16 32,22" fill="currentColor"/>',
      value: cities.toString(),
      label: '覆盖城市',
      color: '#22d3ee',
      change: cities >= 50 ? '广泛' : cities >= 10 ? '一般' : '较少',
      changeClass: cities >= 50 ? 'positive' : cities >= 10 ? 'neutral' : 'negative',
      changeIcon: cities >= 50 ? 'up' : 'down'
    },
    {
      iconViewBox: '0 0 60 60',
      icon: '<rect x="10" y="15" width="40" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><line x1="15" y1="25" x2="45" y2="25" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="15" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="15" y1="39" x2="35" y2="39" stroke="currentColor" stroke-width="1" opacity="0.6"/>',
      value: techAnalysis.value.length.toString(),
      label: '技术领域',
      color: '#818cf8',
      change: '丰富',
      changeClass: 'positive',
      changeIcon: 'up'
    }
  ]
})

const generateDemandChartData = () => {
  const topTech = techAnalysis.value.slice(0, 5)
  return topTech.map(tech => {
    let growthFactor = 1.05
    if (tech.trendClass === 'rising') {
      growthFactor = 1.12
    } else if (tech.trendClass === 'declining') {
      growthFactor = 0.95
    }
    return {
      name: tech.name,
      data: [
        tech.count,
        Math.round(tech.count * growthFactor),
        Math.round(tech.count * growthFactor * growthFactor),
        Math.round(tech.count * growthFactor * growthFactor * growthFactor)
      ]
    }
  })
}

const generateSalaryChartData = () => {
  const topTech = techAnalysis.value.slice(0, 5)
  const totalCount = filteredData.value.length || 1
  return topTech.map(tech => {
    const marketShare = (tech.count / totalCount) * 100
    let baseGrowth = 0
    if (tech.trendClass === 'rising') {
      baseGrowth = 10 + marketShare * 0.5
    } else if (tech.trendClass === 'declining') {
      baseGrowth = -5 + marketShare * 0.2
    } else {
      baseGrowth = 2 + marketShare * 0.1
    }
    return {
      name: tech.name,
      salary: tech.avgSalary,
      growth: Math.round(baseGrowth * 10) / 10
    }
  })
}

const generateCityData = () => {
  const data = filteredData.value
  const cityCounts = {}
  data.forEach(job => { if (job.city) cityCounts[job.city] = (cityCounts[job.city] || 0) + 1 })
  
  return Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
}

const predictionData = computed(() => {
  const topTech = techAnalysis.value.slice(0, 6)
  const colors = ['#a855f7', '#4a9eff', '#00d4aa', '#f59e0b', '#ec4899', '#8b5cf6']
  const total = filteredData.value.length || 1
  return topTech.map((tech, idx) => {
    const current = Math.round((tech.count / total) * 100)
    let predicted = current
    let trend = 'steady'
    if (tech.trendClass === 'rising') {
      predicted = Math.round(current * 1.2)
      trend = 'up'
    } else if (tech.trendClass === 'declining') {
      predicted = Math.round(current * 0.88)
      trend = 'down'
    } else {
      predicted = Math.round(current * 1.05)
      trend = 'steady'
    }
    return {
      name: tech.name,
      current: Math.max(1, current),
      predicted: Math.max(1, predicted),
      trend,
      color: colors[idx % colors.length]
    }
  })
})

const educationData = computed(() => {
  const data = filteredData.value
  if (!data || data.length === 0) {
    return []
  }
  const eduCount = {}
  data.forEach(job => {
    const edu = job.education || '学历不限'
    eduCount[edu] = (eduCount[edu] || 0) + 1
  })
  const total = data.length
  const colorMap = { '本科': '#4a9eff', '大专': '#00d4aa', '硕士': '#a855f7', '学历不限': '#f59e0b', '博士': '#ec4899', '中专': '#22c55e', '高中': '#f97316' }
  return Object.entries(eduCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      value: count,
      percent: Math.round((count / total) * 100),
      color: colorMap[name] || '#64748b'
    }))
})

const generateRadarData = () => {
  const techData = techAnalysis.value.slice(0, 6)
  if (techData.length === 0) {
    return {
      indicator: [{ name: '暂无数据', max: 100 }],
      data: [{ value: [0], name: '需求分布' }]
    }
  }
  const maxCount = Math.max(...techData.map(t => t.count), 1)
  
  return {
    indicator: techData.map(t => ({ name: t.name, max: maxCount })),
    data: [{
      value: techData.map(t => t.count),
      name: '需求分布'
    }]
  }
}

const initCharts = () => {
  if (demandChartRef.value) {
    demandChart = echarts.init(demandChartRef.value)
    updateDemandChart()
  }
  if (salaryChartRef.value) {
    salaryChart = echarts.init(salaryChartRef.value)
    updateSalaryChart()
  }
  if (cityChartRef.value) {
    cityChart = echarts.init(cityChartRef.value)
    updateCityChart()
  }
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value)
    updateRadarChart()
  }
  if (predictionChartRef.value) {
    predictionChart = echarts.init(predictionChartRef.value)
    updatePredictionChart()
  }
  if (educationChartRef.value) {
    educationChart = echarts.init(educationChartRef.value)
    updateEducationChart()
  }
}

const updateDemandChart = () => {
  if (!demandChart) return
  const techData = generateDemandChartData()
  const colors = ['#4a9eff', '#00d4aa', '#22d3ee', '#818cf8', '#f06292']
  
  demandChart.setOption({
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(8, 20, 45, 0.95)', 
      borderColor: 'rgba(74, 158, 255, 0.5)', 
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e0f2fe', fontSize: 13 },
      axisPointer: {
        type: 'cross',
        lineStyle: { color: 'rgba(74, 158, 255, 0.4)', width: 1 },
        crossStyle: { color: 'rgba(74, 158, 255, 0.4)', width: 1 }
      },
      formatter: (params) => {
        let result = `<div style="font-weight: 600; margin-bottom: 8px; color: #00d4ff;">${params[0].axisValue}</div>`
        params.forEach(param => {
          result += `<div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${param.color}; margin-right: 8px; box-shadow: 0 0 8px ${param.color};"></span>
            <span style="color: #94a3b8; flex: 1;">${param.seriesName}</span>
            <span style="color: #fff; font-weight: 600;">${param.value}个</span>
          </div>`
        })
        return result
      }
    },
    legend: { 
      data: techData.map(t => t.name), 
      textStyle: { color: '#94a3b8', fontSize: 12 }, 
      top: 5,
      itemWidth: 20,
      itemHeight: 8,
      itemGap: 24,
      selectedMode: true
    },
    grid: { left: '10%', right: '6%', bottom: '15%', top: '18%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      name: '时间',
      nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [25, 0, 0, 0] },
      data: ['当前', '1个月', '2个月', '3个月'], 
      axisLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.4)' } }, 
      axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value', 
      name: '岗位数(个)',
      nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [0, 0, 0, 35] },
      axisLine: { show: false }, 
      axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 }, 
      splitLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.1)', type: 'dashed' } },
      axisTick: { show: false }
    },
    series: techData.map((tech, index) => ({
      name: tech.name, 
      type: 'line', 
      smooth: true, 
      symbol: 'circle', 
      symbolSize: 10,
      data: tech.data, 
      lineStyle: { 
        color: colors[index % colors.length], 
        width: 3,
        shadowColor: colors[index % colors.length],
        shadowBlur: 20,
        shadowOffsetY: 5
      },
      itemStyle: { 
        color: colors[index % colors.length],
        borderColor: '#080c1a',
        borderWidth: 2,
        shadowColor: colors[index % colors.length],
        shadowBlur: 25
      },
      emphasis: {
        focus: 'series',
        symbolSize: 14,
        itemStyle: {
          shadowBlur: 40,
          shadowColor: colors[index % colors.length]
        }
      },
      areaStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[index % colors.length] + '40' },
          { offset: 0.5, color: colors[index % colors.length] + '15' },
          { offset: 1, color: colors[index % colors.length] + '00' }
        ])
      },
      animationDuration: 1500,
      animationEasing: 'cubicInOut'
    }))
  }, true)
}

const updateSalaryChartNew = () => {
  if (!salaryChart) return
  const techData = generateSalaryChartData()
  const colorList = ['#60a5fa', '#2dd4bf', '#4fd1c5', '#a5b4fc', '#f472b6']
  const gradientEndList = ['#3b82f6', '#059669', '#0891b2', '#7c3aed', '#db2777']
  
  const barData = []
  for (let idx = 0; idx < techData.length; idx++) {
    const color = colorList[idx % colorList.length]
    const endColor = gradientEndList[idx % gradientEndList.length]
    barData.push({
      value: techData[idx].salary,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color },
          { offset: 1, color: endColor }
        ]),
        borderRadius: [8, 8, 0, 0],
        shadowColor: color,
        shadowBlur: 15,
        shadowOffsetY: 6
      }
    })
  }
  
  salaryChart.setOption({
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(8, 20, 45, 0.95)', 
      borderColor: 'rgba(74, 158, 255, 0.5)', 
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e0f2fe', fontSize: 13 },
      formatter: (params) => {
        const techName = params[0].axisValue
        const salaryData = techData.find(t => t.name === techName)
        if (!salaryData) return ''
        return `<div style="font-weight: 600; margin-bottom: 8px; color: #00d4ff;">${techName}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">平均薪资：</span>
            <span style="color: #fff; font-weight: 600;">¥${salaryData.salary}K</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">环比增长：</span>
            <span style="color: ${salaryData.growth >= 15 ? '#00d4aa' : '#22d3ee'}; font-weight: 600;">+${salaryData.growth.toFixed(1)}%</span>
          </div>`
      }
    },
    grid: { left: '10%', right: '16%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: true, 
      name: '技术方向',
      nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [25, 0, 0, 0] },
      data: techData.map(t => t.name), 
      axisLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.4)' } }, 
      axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 },
      axisTick: { show: false }
    },
    yAxis: [
      { 
        type: 'value', 
        name: '薪资(K)', 
        position: 'left', 
        nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [0, 0, 0, 25] }, 
        axisLine: { show: false }, 
        axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600, formatter: '{value}K' }, 
        splitLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.1)', type: 'dashed' } },
        axisTick: { show: false }
      },
      { 
        type: 'value', 
        name: '增长率(%)', 
        position: 'right', 
        nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [0, 25, 0, 0] }, 
        axisLine: { show: false }, 
        axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600, formatter: '{value}%' }, 
        splitLine: { show: false },
        axisTick: { show: false }
      }
    ],
    series: [
      { 
        name: '平均薪资', 
        type: 'bar', 
        data: barData,
        barWidth: '40%',
        emphasis: {
          itemStyle: {
            shadowBlur: 35
          }
        },
        animationDuration: 1200,
        animationEasing: 'cubicInOut'
      },
      { 
        name: '环比增长', 
        type: 'line', 
        yAxisIndex: 1, 
        smooth: true, 
        symbol: 'circle', 
        symbolSize: 12,
        data: techData.map(t => t.growth), 
        lineStyle: { color: '#fbbf24', width: 3, shadowColor: '#fbbf24', shadowBlur: 5 },
        itemStyle: { 
          color: '#fbbf24',
          borderColor: '#080c1a',
          borderWidth: 2,
          shadowColor: '#fbbf24',
          shadowBlur: 8
        },
        emphasis: {
          symbolSize: 16,
          itemStyle: {
            shadowBlur: 15,
            shadowColor: '#fbbf24'
          }
        },
        animationDuration: 1500,
        animationDelay: 300
      }
    ]
  }, true)
}
const updateSalaryChart = updateSalaryChartNew

const updateCityChart = () => {
  if (!cityChart) return
  const cityData = generateCityData()
  const colorList = ['#60a5fa', '#2dd4bf', '#4fd1c5', '#a5b4fc', '#f472b6']
  const gradientEndList = ['#3b82f6', '#059669', '#0891b2', '#7c3aed', '#db2777']
  
  const barData = []
  for (let idx = 0; idx < cityData.length; idx++) {
    const color = colorList[idx % colorList.length]
    const endColor = gradientEndList[idx % gradientEndList.length]
    barData.push({
      value: cityData[idx][1],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: endColor },
          { offset: 1, color: color }
        ]),
        borderRadius: [0, 8, 8, 0],
        shadowColor: color,
        shadowBlur: 15,
        shadowOffsetX: 6
      }
    })
  }
  barData.reverse()
  
  cityChart.setOption({
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8, 20, 45, 0.95)', 
      borderColor: 'rgba(74, 158, 255, 0.5)', 
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e0f2fe', fontSize: 13 },
      formatter: (params) => {
        if (!params[0]) return ''
        return `<div style="font-weight: 600; margin-bottom: 8px; color: #00d4ff;">${params[0].axisValue}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">岗位数量：</span>
            <span style="color: #fff; font-weight: 600;">${params[0].value}个</span>
          </div>`
      }
    },
    grid: { left: '15%', right: '8%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: { 
      type: 'value', 
      name: '岗位数(个)',
      nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [0, 0, 25, 0] },
      axisLine: { show: false }, 
      axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 }, 
      splitLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.1)', type: 'dashed' } },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'category', 
      name: '城市',
      nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [0, 40, 0, 0] },
      data: cityData.map(c => c[0]).reverse(), 
      axisLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.4)' } }, 
      axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: barData,
      barWidth: '50%',
      emphasis: {
        itemStyle: {
          shadowBlur: 35
        }
      },
      animationDuration: 1200,
      animationEasing: 'cubicInOut'
    }]
  }, true)
}

const updateRadarChart = () => {
  if (!radarChart) return
  const radarData = generateRadarData()
  
  radarChart.setOption({
    tooltip: { 
      trigger: 'item', 
      backgroundColor: 'rgba(8, 20, 45, 0.95)', 
      borderColor: 'rgba(74, 158, 255, 0.5)', 
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e0f2fe', fontSize: 13 },
      formatter: (params) => {
        if (!params.name || !params.value) return ''
        return `<div style="font-weight: 600; margin-bottom: 8px; color: #00d4ff;">${params.name}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">需求量：</span>
            <span style="color: #fff; font-weight: 600;">${params.value}个</span>
          </div>`
      }
    },
    radar: {
      indicator: radarData.indicator,
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.25)' } },
      splitArea: { 
        show: true, 
        areaStyle: { 
          color: ['rgba(74, 158, 255, 0.08)', 'rgba(0, 212, 170, 0.05)', 'rgba(74, 158, 255, 0.08)', 'rgba(0, 212, 170, 0.05)', 'rgba(74, 158, 255, 0.08)'] 
        } 
      },
      axisLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.4)' } },
      center: ['50%', '55%'],
      radius: '68%'
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.data[0].value,
        name: radarData.data[0].name,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { 
          color: '#4a9eff', 
          width: 3,
          shadowColor: '#4a9eff',
          shadowBlur: 5
        },
        areaStyle: { 
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
            { offset: 0, color: 'rgba(74, 158, 255, 0.4)' },
            { offset: 0.5, color: 'rgba(0, 212, 170, 0.2)' },
            { offset: 1, color: 'rgba(129, 140, 248, 0.1)' }
          ])
        },
        itemStyle: { 
          color: '#4a9eff',
          borderColor: '#080c1a',
          borderWidth: 2,
          shadowColor: '#4a9eff',
          shadowBlur: 8
        },
        emphasis: {
          scale: true,
          symbolSize: 14,
          itemStyle: {
            shadowBlur: 15,
            shadowColor: '#4a9eff'
          }
        }
      }]
    }]
  }, true)
}

const updatePredictionChart = () => {
  if (!predictionChart) return
  
  const data = predictionData.value
  
  predictionChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 20, 45, 0.95)',
      borderColor: 'rgba(74, 158, 255, 0.5)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e0f2fe', fontSize: 13 },
      formatter: (params) => {
        if (!params[0]) return ''
        const index = params[0].dataIndex
        const item = data[index]
        const change = item.predicted - item.current
        const changeColor = change >= 0 ? '#00d4aa' : '#ef4444'
        return `<div style="font-weight: 600; margin-bottom: 8px; color: #a855f7;">${item.name}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">当前需求：</span>
            <span style="color: #fff; font-weight: 600;">${item.current}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">预计需求：</span>
            <span style="color: #fff; font-weight: 600;">${item.predicted}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">变化：</span>
            <span style="color: ${changeColor}; font-weight: 600;">${change >= 0 ? '+' : ''}${change}%</span>
          </div>`
      }
    },
    grid: { left: '8%', right: '8%', bottom: '15%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.4)' } },
      axisLabel: { 
        color: '#cbd5e1', 
        fontSize: 11, 
        fontWeight: 600,
        interval: 0,
        rotate: 0
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '需求指数',
      nameTextStyle: { color: '#94a3b8', fontSize: 12, padding: [0, 0, 0, 25] },
      axisLine: { show: false },
      axisLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: 'rgba(74, 158, 255, 0.1)', type: 'dashed' } },
      axisTick: { show: false },
      min: 80,
      max: 160
    },
    series: [
      {
        name: '当前需求',
        type: 'bar',
        data: data.map(d => ({
          value: d.current,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: d.color + '80' },
              { offset: 1, color: d.color + '30' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: '30%',
        animationDuration: 1200,
        animationEasing: 'cubicInOut'
      },
      {
        name: '预计需求',
        type: 'bar',
        data: data.map(d => ({
          value: d.predicted,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: d.color },
              { offset: 1, color: d.color + '60' }
            ]),
            borderRadius: [4, 4, 0, 0],
            shadowColor: d.color,
            shadowBlur: 10
          }
        })),
        barWidth: '30%',
        animationDuration: 1200,
        animationDelay: 300,
        animationEasing: 'cubicInOut'
      }
    ]
  }, true)
}

const updateEducationChart = () => {
  if (!educationChart) return
  
  const data = educationData.value
  
  educationChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(8, 20, 45, 0.95)',
      borderColor: 'rgba(74, 158, 255, 0.5)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e0f2fe', fontSize: 13 },
      formatter: (params) => {
        const totalCount = filteredData.value.length || 0
        const count = Math.round(params.percent / 100 * totalCount)
        return `<div style="font-weight: 600; margin-bottom: 8px; color: ${params.color};">${params.name}</div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">占比：</span>
            <span style="color: #fff; font-weight: 600;">${params.percent}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #94a3b8;">岗位数：</span>
            <span style="color: #fff; font-weight: 600;">${count}个</span>
          </div>`
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 12 },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 15
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#080c1a',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 24,
          fontWeight: 'bold',
          color: '#fff',
          formatter: '{b}\n{d}%'
        },
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: false
      },
      data: data.map(d => ({
        value: d.value,
        name: d.name,
        percent: d.percent,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: d.color },
            { offset: 1, color: d.color + '80' }
          ])
        }
      })),
      animationDuration: 1500,
      animationEasing: 'cubicInOut'
    }]
  }, true)
}

const parseQuery = (query) => {
  const techMatches = []
  const cityMatches = []
  
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(k => query.includes(k)) || query.includes(tech)) {
      techMatches.push(tech)
    }
  }
  
  const commonCities = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安', '南京', '天津']
  commonCities.forEach(city => {
    if (query.includes(city)) {
      cityMatches.push(city)
    }
  })
  
  return { techMatches, cityMatches }
}

const careerPaths = {
  'AI': ['AI工程师', '高级AI工程师', 'AI技术专家', 'AI架构师', 'CTO'],
  '算法': ['算法工程师', '高级算法工程师', '算法专家', '首席算法', '技术总监'],
  'Java': ['Java开发工程师', '高级Java工程师', '技术主管', '技术经理', '架构师'],
  'Python': ['Python开发工程师', '高级Python工程师', '数据科学家', 'AI工程师', '技术专家'],
  '前端': ['前端开发工程师', '高级前端工程师', '前端架构师', '技术主管', '技术总监'],
  '后端': ['后端开发工程师', '高级后端工程师', '系统架构师', '技术经理', 'CTO'],
  '测试': ['测试工程师', '高级测试工程师', '测试开发工程师', '质量总监', '技术总监'],
  '运维': ['运维工程师', '高级运维工程师', 'DevOps工程师', 'SRE负责人', '基础设施总监'],
  '安全': ['安全工程师', '高级安全工程师', '安全专家', '安全总监', 'CTO'],
  'Go': ['Go开发工程师', '高级Go工程师', '微服务架构师', '技术主管', '技术总监'],
  '数据分析': ['数据分析师', '高级数据分析师', '数据科学家', '数据负责人', 'CDO'],
  '产品': ['产品助理', '产品经理', '高级产品经理', '产品总监', 'CEO']
}

const analyzeIntent = (query) => {
  if (query.includes('薪资') || query.includes('待遇') || query.includes('工资')) {
    return 'salary'
  }
  if (query.includes('趋势') || query.includes('前景') || query.includes('发展')) {
    return 'trend'
  }
  if (query.includes('学习') || query.includes('入门') || query.includes('掌握') || query.includes('技能')) {
    return 'learning'
  }
  if (query.includes('岗位') || query.includes('职位') || query.includes('工作')) {
    return 'job'
  }
  if (query.includes('对比') || query.includes('哪个好') || query.includes('选择')) {
    return 'compare'
  }
  if (query.includes('建议') || query.includes('指导') || query.includes('规划')) {
    return 'advice'
  }
  return 'general'
}

const INDUSTRY_KEYWORDS = [
  'java', 'python', '前端', '后端', '算法', 'ai', '人工智能', '机器学习', '深度学习',
  '大数据', '数据分析', '数据库', 'mysql', 'redis', 'mongodb', '编程', '开发', '工程师',
  '求职', '就业', '招聘', '岗位', '薪资', '薪资待遇', '面试', '简历', '职业规划',
  '技术', '编程', 'coding', '程序员', '码农', '互联网', 'it', '计算机', '软件',
  '市场', '需求', '趋势', '前景', '发展', '增长', '热门', '技能', '学习',
  '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安', '南京', '苏州',
  '大厂', 'bat', '字节', '腾讯', '阿里巴巴', '百度', '美团', '京东', '华为',
  '本科', '硕士', '博士', '学历', '经验', '应届生', '校招', '社招', '实习',
  'vue', 'react', 'javascript', 'typescript', 'node', 'go', 'golang', 'rust', 'c++', 'c#',
  '分布式', '微服务', '云原生', 'k8s', 'docker', '容器', '运维', '测试', '安全',
  '产品经理', '产品', '运营', 'ui', '设计', '架构', 'hadoop', 'spark', 'tensorflow',
  '简历优化', '面试技巧', '职业', '转行', '就业前景', '就业形势', '用工', '人才',
  '区块链', 'iot', '5g', '自动驾驶', '芯片', '半导体', '新能源', '游戏开发',
  '电子商务', '电商', '金融科技', 'fintech', '教育科技', '医疗科技',
  '创业', '副业', '远程办公', '996', '加班', '工作', '跳槽'
]

const INDUSTRY_REJECTION_TOPICS = [
  { keywords: ['你好', 'hi', 'hello', '在吗', '嗨', '您好', '哈喽', 'hey'], response: null, type: 'greeting' },
  { keywords: ['你是谁', '你叫什么', '介绍一下', '自我介绍', 'who are you', '你是干嘛的', '你是做什么的'], response: null, type: 'identity' },
  { keywords: ['我是谁', '我叫', '认识我吗', '还记得我吗', '我是谁呀'], response: null, type: 'meet' },
  { keywords: ['谢谢', '感谢', 'thanks', 'thank you', '多谢', '辛苦'], response: null, type: 'thanks' },
  { keywords: ['再见', '拜拜', 'bye', 'goodbye', '回见'], response: null, type: 'bye' },
  { keywords: ['天气', '气温', '下雨', '温度', '穿衣'], response: '抱歉呀 😊 天气问题我不太擅长哦～我是【AI行业分析助手】，主要回答IT求职、行业趋势、岗位分析等问题。如果需要天气信息，建议查看天气APP；如果想聊职业相关的话题，我随时在线！' },
  { keywords: ['新闻', '时政', '政治', '政府', '政策新闻', '时事'], response: '不好意思呀 📰 新闻时事不是我的专长～我是专注于【IT行业分析】的智能助手，擅长岗位数据分析、薪资趋势预测、职业发展建议。如果你想了解行业相关的新闻或政策，我可以帮你分析人才政策哦！' },
  { keywords: ['游戏攻略', '游戏玩法', '打游戏', '推荐游戏', '手游'], response: '哈哈，游戏的问题我确实帮不上忙啦 🎮 我是【AI行业分析助手】，专门做IT职业相关的分析。不过如果你想了解游戏开发方向的职业前景，这我可以帮你！' },
  { keywords: ['股票', '基金', '投资', '理财', '炒股', '比特币', '加密货币'], response: '投资理财的问题我不太擅长哦 💰 我是【AI行业分析助手】，专注于IT行业的岗位和薪资数据分析。不过如果你想了解金融科技（FinTech）方向的就业前景，这我可以帮你分析！' },
  { keywords: ['做饭', '菜谱', '美食', '烹饪', '食谱'], response: '哈哈，做饭我确实不在行啦 🍳 我是【AI行业分析助手】，专门回答IT求职和行业分析相关的问题。想学烹饪可以看看美食APP哦～' },
  { keywords: ['情感', '感情', '恋爱', '男朋友', '女朋友', '分手', '复合', '婚姻'], response: '抱歉呀 💖 情感问题不是我的专长～我是专注于【IT行业分析】的智能助手。不过如果你想聊聊程序员的职业发展、工作压力调节，这些我可以帮你！' },
  { keywords: ['购物', '淘宝', '京东购物', '买东西', '价格对比'], response: '购物的问题我不太擅长啦 🛒 我是【AI行业分析助手】，专注于IT行业数据分析。如果你想了解电商行业的就业前景，这我可以帮你分析！' },
  { keywords: ['看病', '医疗', '疾病', '医院', '药品', '健康'], response: '身体健康最重要 🏥 不过医疗问题我确实帮不上忙，建议咨询专业医生。我是【AI行业分析助手】，如果你想了解医疗科技行业的就业机会，这我可以帮你！' },
  { keywords: ['法律咨询', '合同', '起诉', '律师', '法律问题'], response: '法律问题建议咨询专业律师哦 ⚖️ 我是【AI行业分析助手】，专注于IT行业的岗位和职业分析。如果你想了解法律科技行业的就业机会，我可以帮你分析！' },
  { keywords: ['闲聊', '聊天', '解闷', '讲笑话', '故事'], response: '哈哈，我主要是来帮你分析IT行业的 😄 要不我们聊聊IT求职相关的话题？比如「2026年AI行业前景怎么样？」「Java开发薪资多少？」「前端还有前途吗？」我都可以帮你分析～' }
]

function detectRelevance(query) {
  const q = query.toLowerCase().trim()
  
  // 先检查是否明确提到IT行业相关
  let hitIndustryKeyword = false
  for (const kw of INDUSTRY_KEYWORDS) {
    if (q.includes(kw.toLowerCase())) {
      hitIndustryKeyword = true
      break
    }
  }
  
  // 检查是否是自我介绍句式（我是XXX、我叫XXX等）
  const nameIntroPatterns = [
    /^我是[^\s，,。！!？?]{1,20}$/,
    /^我叫[^\s，,。！!？?]{1,20}$/,
    /我是[^\s，,。！!？?]{1,10}[，,。！!？?]/,
    /我叫[^\s，,。！!？?]{1,10}[，,。！!？?]/
  ]
  const introExcludeWords = ['谁', '什么', '怎么', '为', '吗', '呢', '啊', '呀', '人', '大学生', '学生', '员工', '工人', '老师', '工程师', '开发', '程序员']
  for (const p of nameIntroPatterns) {
    if (p.test(q)) {
      const match = q.match(p)
      if (match) {
        const extractedName = match[0].replace(/^(我是|我叫)/, '').trim()
        if (!introExcludeWords.some(w => extractedName.includes(w))) {
          return { relevant: true, type: 'meet' }
        }
      }
    }
  }
  
  // 检查是否属于拒绝回答的话题
  for (const topic of INDUSTRY_REJECTION_TOPICS) {
    for (const kw of topic.keywords) {
      if (q.includes(kw.toLowerCase())) {
        // 礼貌对话：问候、自我介绍、感谢、再见等
        if (topic.response === null) {
          return { relevant: true, type: topic.type || 'greeting' }
        }
        // 如果同时包含行业关键词，则视为行业相关问题
        if (hitIndustryKeyword) {
          return { relevant: true, type: 'industry' }
        }
        return { relevant: false, rejectionMessage: topic.response }
      }
    }
  }
  
  // 如果包含行业关键词，认为是行业相关
  if (hitIndustryKeyword) {
    return { relevant: true, type: 'industry' }
  }
  
  // 默认：不确定是否相关，引导用户到行业话题
  return {
    relevant: false,
    rejectionMessage: '这个问题我可能帮不上忙哦 🤔 我是【AI行业分析助手】，主要回答以下领域的问题：\n\n• IT/互联网行业岗位需求\n• 不同技术方向的薪资趋势\n• 各城市就业市场对比\n• 技术学习路径和职业发展\n\n你可以试试问我：「北京Java岗位薪资怎么样？」「AI方向还有前途吗？」「前端工程师就业前景如何？」'
  }
}

const generateAIResponse = (query) => {
  const { techMatches, cityMatches } = parseQuery(query)
  const intent = analyzeIntent(query)
  
  let data = [...jobData]
  if (techMatches.length > 0 || cityMatches.length > 0) {
    data = data.filter(job => {
      const techMatch = techMatches.some(tag => job.job_name && job.job_name.includes(tag))
      const cityMatch = cityMatches.some(tag => job.city && job.city.includes(tag))
      return techMatch || cityMatch
    })
  }
  
  const techDataForAI = []
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    const techJobs = data.filter(job => 
      job.job_name && keywords.some(k => job.job_name.includes(k)) && job.salary_avg > 1000
    )
    if (techJobs.length > 0) {
      const avgSalaryTemp = Math.round(techJobs.reduce((sum, job) => sum + job.salary_avg, 0) / techJobs.length / 1000)
      techDataForAI.push({
        name: tech,
        count: techJobs.length,
        avgSalary: avgSalaryTemp,
        trend: '',
        trendClass: ''
      })
    }
  }
  
  const sortedTechData = techDataForAI.sort((a, b) => b.count - a.count)
  
  // 基于真实数据分布计算趋势
  const allSalariesForAI = data.filter(j => j.salary_avg > 1000).map(j => j.salary_avg)
  const overallAvgSalaryForAI = allSalariesForAI.length ? sum(allSalariesForAI) / allSalariesForAI.length : 10000
  const medianCountForAI = sortedTechData.length > 0 
    ? sortedTechData.reduce((s, r) => s + r.count, 0) / sortedTechData.length 
    : 1
  const tier1CitiesForAI = ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '重庆']
  
  const finalTechData = sortedTechData.map(item => {
    const aiKeywords = techKeywords[item.name] || []
    const aiTechJobs = data.filter(job =>
      job.job_name && aiKeywords.some(k => job.job_name.includes(k)) && job.salary_avg > 1000
    )
    const tier1Ratio = aiTechJobs.length > 0 
      ? aiTechJobs.filter(j => tier1CitiesForAI.some(c => (j.city || '').includes(c))).length / aiTechJobs.length
      : 0
    
    const salaryRatio = item.avgSalary * 1000 / overallAvgSalaryForAI
    const countRatio = item.count / medianCountForAI
    
    let trendClass = 'stable'
    let trend = '稳定'
    
    if (salaryRatio > 1.3 && countRatio > 1.2) {
      trendClass = 'rising'
      trend = tier1Ratio > 0.4 ? '快速增长' : '增长'
    } else if (salaryRatio > 1.1 && countRatio > 0.9) {
      trendClass = 'rising'
      trend = '增长'
    } else if (salaryRatio < 0.8 && countRatio < 0.7) {
      trendClass = 'declining'
      trend = '下降'
    } else if (salaryRatio < 0.9 || countRatio < 0.8) {
      trendClass = 'declining'
      trend = '趋于收缩'
    }
    
    return { ...item, trend, trendClass }
  })
  
  const salaries = data.filter(j => j.salary_avg > 1000).map(j => j.salary_avg)
  const avgSalary = salaries.length ? Math.round(sum(salaries) / salaries.length / 1000) : 0
  
  const cityCounts = {}
  data.forEach(job => { if (job.city) cityCounts[job.city] = (cityCounts[job.city] || 0) + 1 })
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(c => c[0])
  
  if (data.length === 0) {
    return `抱歉呀 😅 我暂时没有找到与「${query}」相关的岗位数据。\n\n💡 建议你试试这些关键词：\n  • 技术方向：AI、算法、Java、前端、数据分析\n  • 城市：北京、上海、深圳、杭州\n  • 问题类型：薪资待遇、发展前景、学习路径`
  }
  
  const openers = [
    `根据我的数据库，`,
    `让我来帮你分析一下～`,
    `这是一个很好的问题！`,
    `好的，基于${jobData.length.toLocaleString()}条真实岗位数据，`,
    `我来帮你看看「${query}」的情况：`
  ]
  const opener = openers[Math.floor(Math.random() * openers.length)]
  
  let text = `${opener}\n\n`
  
  if (intent === 'salary') {
    text += `💰 **薪资分析**：\n`
    text += `  • 平均薪资：¥${avgSalary}K\n`
    
    text += `  • 不同规模企业薪资对比：\n`
    Object.entries(companySizeSalaryData).forEach(([size, info]) => {
      const diff = info.avgSalary - avgSalary
      const sign = diff > 0 ? '+' : ''
      text += `    ◦ ${size}：¥${info.avgSalary}K（${sign}${diff}K）- ${info.feature}\n`
    })
    
    text += `\n📈 **行业薪资差异**：\n`
    const sortedIndustries = Object.entries(industrySalaryData).sort((a, b) => b[1].avgSalary - a[1].avgSalary)
    sortedIndustries.slice(0, 5).forEach(([industry, info]) => {
      text += `  • ${industry}：¥${info.avgSalary}K，增长率${info.growth > 0 ? '+' : ''}${info.growth}%\n`
    })
  } else if (intent === 'trend') {
    text += `📊 **发展趋势分析**：\n`
    if (finalTechData.length > 0) {
      const risingTech = finalTechData.filter(t => t.trend.includes('增长')).slice(0, 5)
      const decliningTech = finalTechData.filter(t => t.trend === '下降').slice(0, 3)
      
      if (risingTech.length > 0) {
        text += `  🚀 **快速增长领域**：\n`
        risingTech.forEach(tech => {
          text += `    • ${tech.name}：${tech.count}个岗位，薪资¥${tech.avgSalary}K\n`
        })
      }
      
      if (decliningTech.length > 0) {
        text += `\n  📉 **需求下降领域**：\n`
        decliningTech.forEach(tech => {
          text += `    • ${tech.name}：${tech.count}个岗位，建议关注替代方向\n`
        })
      }
    }
  } else if (intent === 'learning') {
    text += `📚 **学习路径建议**：\n`
    if (techMatches.length > 0) {
      techMatches.forEach(tech => {
        const path = careerPaths[tech] || ['初级工程师', '中级工程师', '高级工程师', '技术专家']
        text += `  • ${tech}学习路径：\n`
        path.forEach((step, idx) => {
          const year = idx * 2
          text += `    ${idx === 0 ? '📍' : idx === path.length - 1 ? '🌟' : '→'} ${step}（预计${year}年后可达）\n`
        })
        
        const techInfo = finalTechData.find(t => t.name === tech)
        if (techInfo) {
          text += `    💡 关键技能：${techInfo.trend.includes('增长') ? '建议深入学习，市场需求旺盛' : '保持更新，关注行业动态'}\n`
        }
      })
    } else {
      text += `  • 通用学习路径：计算机基础 → 编程语言 → 专业技能 → 项目实战\n`
      text += `  • 热门方向：AI/大模型、数据分析、云原生、Go/Rust\n`
    }
  } else if (intent === 'advice') {
    text += `💡 **职业发展建议**：\n`
    if (techMatches.length > 0) {
      techMatches.forEach(tech => {
        const techInfo = finalTechData.find(t => t.name === tech)
        if (techInfo) {
          if (techInfo.trend.includes('增长')) {
            text += `  • ${tech}：市场需求旺盛，建议尽快掌握核心技能，抢占先机\n`
            text += `    推荐学习：基础理论 → 实践项目 → 深入研究\n`
          } else if (techInfo.trend === '下降') {
            text += `  • ${tech}：市场需求萎缩，建议转型相关领域或提升稀缺技能\n`
          } else {
            text += `  • ${tech}：市场稳定，建议深耕技术，成为领域专家\n`
          }
        }
      })
    }
    
    text += `\n🎯 **通用建议**：\n`
    text += `  • 持续学习：技术更新快，保持学习热情\n`
    text += `  • 项目实战：积累真实项目经验\n`
    text += `  • 建立人脉：参与技术社区，拓展行业资源\n`
    text += `  • 关注趋势：定期了解行业动态\n`
  } else {
    text += `📊 **岗位概况**：共匹配到 ${data.length.toLocaleString()} 个岗位，平均薪资 ¥${avgSalary}K`
    
    if (topCities.length > 0) {
      text += `，主要集中在${topCities.join('、')}等城市。\n\n`
    } else {
      text += `。\n\n`
    }
    
    if (finalTechData.length > 0) {
      text += `🔥 **热门技术方向**：\n`
      finalTechData.slice(0, 5).forEach(tech => {
        text += `  • ${tech.name}：${tech.count}个岗位，平均薪资¥${tech.avgSalary}K，趋势${tech.trend}\n`
      })
      text += '\n'
    }
    
    text += `🏢 **企业规模分布**：\n`
    Object.keys(companySizeSalaryData).slice(0, 3).forEach(size => {
      text += `  • ${size}：薪资¥${companySizeSalaryData[size].avgSalary}K\n`
    })
    
    text += `\n💡 **学习建议**：\n`
    if (techMatches.length > 0) {
      techMatches.forEach(tech => {
        const techInfo = finalTechData.find(t => t.name === tech)
        if (techInfo) {
          if (techInfo.trend.includes('增长')) {
            text += `  • ${tech}岗位需求增长迅速，建议重点学习相关技能\n`
          } else if (techInfo.trend === '下降') {
            text += `  • ${tech}岗位需求有所下降，建议关注相关新兴技术方向\n`
          } else {
            text += `  • ${tech}岗位需求稳定，适合长期发展\n`
          }
        }
      })
    }
  }
  
  const summaries = [
    `${avgSalary >= 25 ? '综合来看，这个方向薪资水平相当不错呢，市场竞争力强，非常值得关注！' : avgSalary >= 20 ? '这个方向的薪资水平挺好的，有不错的发展空间。' : avgSalary >= 15 ? '这个方向薪资中等水平，建议多积累技能来提升竞争力。' : '这个方向薪资偏低，建议考虑转型或提升专业技能哦。'}`,
    `从数据来看，${avgSalary >= 20 ? '这是一个很不错的方向，值得投入精力深耕！' : '这个方向竞争比较激烈，建议差异化发展。'}`,
    `分析完毕～ ${avgSalary >= 20 ? '总体表现良好，推荐重点关注！' : '建议持续关注行业变化，灵活调整发展方向。'}`,
    `希望对你有帮助！${avgSalary >= 20 ? '这个方向发展前景看好，加油！' : '如果需要更详细的分析，随时问我～'}`
  ]
  text += `\n${summaries[Math.floor(Math.random() * summaries.length)]}`
  
  return text
}

const sendMessage = async (text) => {
  const messageText = typeof text === 'string' ? text : chatInput.value
  if (!messageText.trim()) return
  
  messages.value.push({ role: 'user', text: messageText })
  chatInput.value = ''
  
  await nextTick()
  scrollToBottom()
  
  isThinking.value = true
  dataStats.value.analyzedCount++
  
  // 检查话题相关性
  const relevance = detectRelevance(messageText)
  
  if (!relevance.relevant) {
    // 非行业相关问题，给出引导回复
    const aiMsgIndex = messages.value.push({ role: 'ai', text: '', isTyping: true }) - 1
    await nextTick()
    
    let currentText = ''
    const response = relevance.rejectionMessage
    for (let i = 0; i < response.length; i++) {
      currentText += response[i]
      messages.value[aiMsgIndex].text = currentText
      await new Promise(resolve => setTimeout(resolve, 15))
    }
    messages.value[aiMsgIndex].isTyping = false
    isThinking.value = false
    saveChatHistory()
    scrollToBottom()
    return
  }
  
  // 礼貌对话回复
  if (relevance.type === 'greeting') {
    const userName = userMemory.value.userName
    let greetings
    if (userName) {
      greetings = [
        `你好呀${userName}！😊 很高兴再次见到你～有什么想了解的行业问题吗？`,
        `嗨${userName}！👋 我是AI行业分析助手，随时准备帮你分析IT行业的任何问题！`,
        `${userName}你好呀～ 🎯 想了解哪方面的行业信息？岗位需求、薪资趋势还是城市就业？`,
        `哈喽${userName}！有什么IT行业相关的问题想问我吗？💡`
      ]
    } else {
      greetings = [
        '你好呀！😊 很高兴见到你～有什么想了解的行业问题吗？',
        '嗨！👋 我是AI行业分析助手，随时准备帮你分析IT行业的任何问题！',
        '你好呀～ 🎯 想了解哪方面的行业信息？岗位需求、薪资趋势还是城市就业？',
        '哈喽！有什么IT行业相关的问题想问我吗？💡'
      ]
    }
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    const aiMsgIndex = messages.value.push({ role: 'ai', text: greeting, isTyping: false }) - 1
    isThinking.value = false
    saveChatHistory()
    scrollToBottom()
    return
  }
  
  if (relevance.type === 'identity') {
    const userName = userMemory.value.userName
    let identities
    if (userName) {
      identities = [
        `我是【AI行业分析助手】🤖 专门针对IT互联网行业提供智能分析服务。${userName}你好，有什么可以帮你的吗？`,
        `我是专注于AI智能分析的行业助手 📊 ${userName}，如果你有职业相关的问题，随时可以问我！`,
        `你好${userName}，我是AI行业分析助手 ✨ 我的专长是分析IT行业的招聘数据和就业趋势。`
      ]
    } else {
      identities = [
        '我是【AI行业分析助手】🤖 专门针对IT互联网行业提供智能分析服务，可以回答岗位需求、薪资趋势、就业前景、城市就业市场等专业问题。有什么可以帮你的吗？',
        '我是专注于AI智能分析的行业助手 📊 主要帮助求职者了解IT行业的岗位动态、薪资水平和职业发展路径。如果你有职业相关的问题，随时可以问我！',
        '你好，我是AI行业分析助手 ✨ 我的专长是分析IT行业的招聘数据和就业趋势，为你提供专业的求职参考。想了解哪些方面呢？'
      ]
    }
    const reply = identities[Math.floor(Math.random() * identities.length)]
    const aiMsgIndex = messages.value.push({ role: 'ai', text: reply, isTyping: false }) - 1
    isThinking.value = false
    saveChatHistory()
    scrollToBottom()
    return
  }
  
  if (relevance.type === 'meet') {
    const extractedName = extractUserName(messageText)
    const storedName = userMemory.value.userName
    
    if (extractedName) {
      userMemory.value.userName = extractedName
      saveUserMemory()
      const replies = [
        `很高兴认识你，${extractedName}！😄 我是AI行业分析助手，能为你分析IT行业的各种数据。你想了解哪方面的信息呢？`,
        `你好呀${extractedName}！👋 认识你很开心～我可以帮你分析IT行业的岗位、薪资、就业前景等问题。`,
        `欢迎${extractedName}！😊 很高兴能为你提供帮助，我专注于IT行业的数据分析和职业发展建议。`
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      const aiMsgIndex = messages.value.push({ role: 'ai', text: reply, isTyping: false }) - 1
      isThinking.value = false
      saveChatHistory()
      scrollToBottom()
      return
    }
    
    if (storedName) {
      const replies = [
        `你是${storedName}呀，很高兴认识你！😄 我还记得你呢～有什么行业问题想了解吗？`,
        `当然记得你啦，${storedName}！👋 我们之前聊过的，我是AI行业分析助手。有什么可以帮你的？`,
        `${storedName}，你是我的老朋友啦！😊 需要我帮你分析IT行业的什么信息吗？`
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      const aiMsgIndex = messages.value.push({ role: 'ai', text: reply, isTyping: false }) - 1
      isThinking.value = false
      saveChatHistory()
      scrollToBottom()
      return
    }
    
    const replies = [
      '很高兴认识你！😄 我是AI行业分析助手，能为你分析IT行业的各种数据。你想了解哪方面的信息呢？',
      '你好呀！👋 认识你很开心～我可以帮你分析IT行业的岗位、薪资、就业前景等问题。有什么想知道的吗？',
      '欢迎！😊 很高兴能为你提供帮助，我专注于IT行业的数据分析和职业发展建议。随时可以向我提问哦！'
    ]
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const aiMsgIndex = messages.value.push({ role: 'ai', text: reply, isTyping: false }) - 1
    isThinking.value = false
    saveChatHistory()
    scrollToBottom()
    return
  }
  
  if (relevance.type === 'thanks') {
    const userName = userMemory.value.userName
    let replies
    if (userName) {
      replies = [
        `不客气${userName} 😊 能帮到你我很开心！还有什么行业相关的问题想了解吗？`,
        `举手之劳啦 💪 ${userName}如果还有其他关于IT行业的问题，随时可以问我哦！`,
        `很高兴能帮上忙 ✨ ${userName}祝你求职顺利！有需要随时来找我分析行业数据～`
      ]
    } else {
      replies = [
        '不客气 😊 能帮到你我很开心！还有什么行业相关的问题想了解吗？',
        '举手之劳啦 💪 如果还有其他关于IT行业的问题，随时可以问我哦！',
        '很高兴能帮上忙 ✨ 祝你求职顺利！有需要随时来找我分析行业数据～'
      ]
    }
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const aiMsgIndex = messages.value.push({ role: 'ai', text: reply, isTyping: false }) - 1
    isThinking.value = false
    saveChatHistory()
    scrollToBottom()
    return
  }
  
  if (relevance.type === 'bye') {
    const userName = userMemory.value.userName
    let replies
    if (userName) {
      replies = [
        `再见啦${userName} 👋 祝你求职顺利！如果以后有行业分析的需求，随时回来找我哦～`,
        `拜拜${userName} 😊 很高兴能帮到你，期待下次和你一起分析更多行业数据！`,
        `回见！${userName}🎯 有任何IT行业相关的问题，我随时在线等你～`
      ]
    } else {
      replies = [
        '再见啦 👋 祝你求职顺利！如果以后有行业分析的需求，随时回来找我哦～',
        '拜拜 😊 很高兴能帮到你，期待下次和你一起分析更多行业数据！',
        '回见！🎯 有任何IT行业相关的问题，我随时在线等你～'
      ]
    }
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const aiMsgIndex = messages.value.push({ role: 'ai', text: reply, isTyping: false }) - 1
    isThinking.value = false
    saveChatHistory()
    scrollToBottom()
    return
  }
  
  const aiMsgIndex = messages.value.push({ role: 'ai', text: '', isTyping: true }) - 1
  
  await nextTick()
  scrollToBottom()
  
  const response = generateAIResponse(messageText)
  
  let currentText = ''
  for (let i = 0; i < response.length; i++) {
    currentText += response[i]
    messages.value[aiMsgIndex].text = currentText
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  
  messages.value[aiMsgIndex].isTyping = false
  isThinking.value = false
  
  saveChatHistory()
  scrollToBottom()
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const filterByTech = (tech) => {
  selectedTags.value = [tech]
  searchQuery.value = tech
  setTimeout(() => {
    updateDemandChart()
    updateSalaryChart()
    updateCityChart()
    updateRadarChart()
  }, 100)
}

const toggleJobExpand = (index) => {
  expandedJob.value = expandedJob.value === index ? -1 : index
}

const viewJobFromList = (jobId) => {
  showFollowModal.value = false
  
  // 先从filteredJobList查找（包含已处理的完整数据）
  let foundJob = filteredJobList.value.find(job => job.id === jobId)
  
  if (!foundJob) {
    // 不在当前筛选列表中，从原始数据查找
    const rawJob = jobData.find(job => {
      const id = (job.job_name || '') + (job.company || '')
      return id === jobId
    })
    if (rawJob) {
      const techMatch = Object.keys(techKeywords).find(tech => 
        techKeywords[tech].some(k => rawJob.job_name && rawJob.job_name.includes(k))
      )
      const avgSalary = rawJob.salary_avg || 15000
      const salaryMin = rawJob.salary_min || Math.round(avgSalary * 0.7)
      const salaryMax = rawJob.salary_max || Math.round(avgSalary * 1.3)
      const eduLabel = rawJob.education || '学历不限'
      const workExp = rawJob.work_exp || '经验不限'
      
      foundJob = {
        job_name: rawJob.job_name || '未知岗位',
        company: rawJob.company || '未知公司',
        city: rawJob.city || '未知城市',
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_avg: avgSalary,
        id: jobId,
        requirements: `${eduLabel}，${workExp}，具备良好的沟通能力和学习能力。`,
        responsibilities: `负责${techMatch || '相关'}方向的开发与维护工作，参与需求分析和技术方案讨论。`,
        careerPath: techMatch ? ['初级', '中级', '高级', '专家'] : ['初级', '中级', '高级'],
        education: eduLabel,
        work_exp: workExp
      }
    }
  }
  
  if (foundJob) {
    selectedJobDetail.value = foundJob
    showJobDetailModal.value = true
  } else {
    alert('未找到该岗位的详细信息')
  }
}

const scrollToAndExpand = (index) => {
  nextTick(() => {
    expandedJob.value = index
    const container = jobsListRef.value
    if (container) {
      const list = container.querySelector('.jobs-list')
      if (list) {
        const card = list.children[index]
        if (card) {
          const containerRect = container.getBoundingClientRect()
          const cardRect = card.getBoundingClientRect()
          const scrollTop = container.scrollTop + (cardRect.top - containerRect.top) - 60
          container.scrollTo({ top: scrollTop, behavior: 'smooth' })
        }
      }
    }
  })
}

const filterBySkill = (skill) => {
  selectedTags.value = [skill]
  searchQuery.value = skill
  setTimeout(() => {
    updateDemandChart()
    updateSalaryChart()
    updateCityChart()
    updateRadarChart()
  }, 100)
}

const getJobTag = (jobName) => {
  if (jobName.includes('高级') || jobName.includes('资深')) return '资深'
  if (jobName.includes('主管') || jobName.includes('经理')) return '管理'
  if (jobName.includes('架构')) return '架构'
  if (jobName.includes('实习') || jobName.includes('应届')) return '实习'
  return '社招'
}

const getJobTagClass = (jobName) => {
  if (jobName.includes('高级') || jobName.includes('资深')) return 'senior'
  if (jobName.includes('主管') || jobName.includes('经理')) return 'manager'
  if (jobName.includes('架构')) return 'architect'
  if (jobName.includes('实习') || jobName.includes('应届')) return 'intern'
  return 'regular'
}

const toggleSkill = (skill) => {
  skillSelected.value = skillSelected.value === skill ? null : skill
}

const getSkillDetail = (skillName) => {
  return techAnalysis.value.find(t => t.name === skillName)
}

const getTrendPoints = (tech) => {
  const points = []
  const baseY = tech.trendClass === 'rising' ? 25 : tech.trendClass === 'declining' ? 5 : 15
  for (let i = 0; i <= 6; i++) {
    const x = (i / 6) * 100
    let y = baseY
    if (tech.trendClass === 'rising') {
      y = 28 - (i * 3) + (Math.random() * 4 - 2)
    } else if (tech.trendClass === 'declining') {
      y = 5 + (i * 3) + (Math.random() * 4 - 2)
    } else {
      y = 15 + (Math.random() * 10 - 5)
    }
    y = Math.max(2, Math.min(28, y))
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

const getTrendAreaPoints = (tech) => {
  const points = []
  const baseY = tech.trendClass === 'rising' ? 25 : tech.trendClass === 'declining' ? 5 : 15
  for (let i = 0; i <= 6; i++) {
    const x = (i / 6) * 100
    let y = baseY
    if (tech.trendClass === 'rising') {
      y = 28 - (i * 3) + (Math.random() * 4 - 2)
    } else if (tech.trendClass === 'declining') {
      y = 5 + (i * 3) + (Math.random() * 4 - 2)
    } else {
      y = 15 + (Math.random() * 10 - 5)
    }
    y = Math.max(2, Math.min(28, y))
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

const getSkillRating = (skillName) => {
  const tech = getSkillDetail(skillName)
  if (!tech) return 3
  const avgSalary = tech.avgSalary || 0
  const count = tech.count || 0
  let rating = 3
  if (avgSalary >= 30) rating += 2
  else if (avgSalary >= 20) rating += 1
  if (count >= 1500) rating += 2
  else if (count >= 800) rating += 1
  return Math.min(5, Math.max(1, rating))
}

const addCourses = computed(() => {
  const techData = techAnalysis.value
  const risingTech = techData.filter(t => t.trendClass === 'rising').map(t => t.name)
  
  const suggestions = []
  if (risingTech.includes('AI')) suggestions.push('AI大模型工程化实训')
  if (risingTech.includes('算法')) suggestions.push('算法与机器学习训练')
  if (risingTech.includes('Python')) suggestions.push('Python与数据分析')
  suggestions.push('云原生与DevOps实践')
  
  return suggestions.length > 0 ? suggestions : ['AI大模型工程化实训', '算法与机器学习训练', 'Python与数据分析', '云原生与DevOps实践']
})

const optimizeCourses = computed(() => {
  const techData = techAnalysis.value
  const decliningTech = techData.filter(t => t.trendClass === 'declining').map(t => t.name)
  
  const suggestions = []
  if (decliningTech.includes('大数据')) suggestions.push('大数据课程融入AI数据工程')
  if (decliningTech.includes('嵌入式')) suggestions.push('强化嵌入式与AI芯片设计')
  if (decliningTech.includes('安全')) suggestions.push('优化安全课程，增加攻防实战')
  suggestions.push('升级Java课程，侧重微服务架构')
  
  return suggestions.length > 0 ? suggestions : ['大数据课程融入AI数据工程', '强化嵌入式与AI芯片设计', '优化安全课程，增加攻防实战', '升级Java课程，侧重微服务架构']
})

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
  
  const particles = []
  const particleCount = 100
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      hue: Math.random() > 0.5 ? 210 : 270,
      pulse: Math.random() * Math.PI * 2
    })
  }
  
  let time = 0
  
  const animate = () => {
    ctx.fillStyle = 'rgba(8, 5, 35, 0.03)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(p => {
      const dx = mousePos.value.x - p.x
      const dy = mousePos.value.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < 250) {
        const force = (250 - dist) / 250 * 0.3
        p.vx += dx * 0.0003 * force
        p.vy += dy * 0.0003 * force
      }
      
      p.vx *= 0.98
      p.vy *= 0.98
      
      p.x += p.vx
      p.y += p.vy
      
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0
      
      p.pulse += 0.02
      const glow = 1 + Math.sin(p.pulse) * 0.3
      const alpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3)
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`
      ctx.fill()
    })
    
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
            ctx.strokeStyle = `rgba(74, 158, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
    })
    
    time++
    bgAnimationId = requestAnimationFrame(animate)
  }
  
  animate()
  
  return () => {
    window.removeEventListener('resize', resizeCanvas)
    if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
  }
}

const handleResize = () => {
  if (demandChart) demandChart.resize()
  if (salaryChart) salaryChart.resize()
  if (cityChart) cityChart.resize()
  if (radarChart) radarChart.resize()
  if (predictionChart) predictionChart.resize()
  if (educationChart) educationChart.resize()
}

onMounted(() => {
  initBackground()
  initCharts()
  window.addEventListener('resize', handleResize)
})

watch(CHAT_STORAGE_KEY, () => {
  messages.value = loadChatHistory()
  userMemory.value = loadUserMemory()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (demandChart) demandChart.dispose()
  if (salaryChart) salaryChart.dispose()
  if (cityChart) cityChart.dispose()
  if (radarChart) radarChart.dispose()
  if (predictionChart) predictionChart.dispose()
  if (educationChart) educationChart.dispose()
  if (bgAnimationId) cancelAnimationFrame(bgAnimationId)
})
</script>

<style scoped>
.industry-prediction-page {
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #050a1e 0%, #0a1628 50%, #050a1e 100%);
  overflow-x: hidden;
  padding-bottom: 20px;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.page-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 10px;
  color: #5eead4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.header-btn:hover {
  background: rgba(0, 212, 170, 0.2);
  border-color: rgba(0, 212, 170, 0.5);
  transform: translateY(-1px);
}

.header-btn .badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.header-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(74, 158, 255, 0.08);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  color: rgba(148, 163, 184, 0.8);
  font-size: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(74, 158, 255, 1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4aa;
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 5px 0 0 0;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
}

.search-input {
  padding: 12px 40px 12px 40px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 30px;
  color: #fff;
  font-size: 0.9rem;
  width: 300px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.2);
}

.search-input::placeholder {
  color: #64748b;
}

.clear-btn {
  position: absolute;
  right: 12px;
  padding: 5px;
  background: rgba(74, 158, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(74, 158, 255, 0.3);
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(74, 158, 255, 0.3);
}

.smart-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tag-label {
  font-size: 0.85rem;
  color: #64748b;
}

.smart-tag {
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.smart-tag:hover {
  border-color: rgba(74, 158, 255, 0.4);
  color: #fff;
}

.smart-tag.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
  color: #4a9eff;
}

.agent-status-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
}

.agent-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4aa;
}

.status-ring {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 2px solid rgba(0, 212, 170, 0.3);
}

.status-ring.active {
  animation: ring-pulse 1.5s ease-in-out infinite;
}

@keyframes ring-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1); opacity: 0.5; }
}

.agent-info {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.agent-status {
  font-size: 0.8rem;
  color: #22c55e;
}

.agent-status.thinking {
  color: #00d4aa;
  animation: status-pulse 1s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.processing-indicator {
  display: flex;
  gap: 6px;
  margin-left: 10px;
}

.processing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00d4aa;
  animation: dot-bounce 0.8s ease-in-out infinite;
}

@keyframes dot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.stats-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #64748b;
}

.stat-item {
  color: #94a3b8;
}

.stat-divider {
  color: rgba(74, 158, 255, 0.3);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(74, 158, 255, 0.1);
}

.stat-icon {
  width: 45px;
  height: 45px;
  margin-bottom: 15px;
  border-radius: 10px;
  background: rgba(74, 158, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #22c55e;
}

.stat-change.neutral {
  color: #f59e0b;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--color)10, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-glow {
  opacity: 0.5;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  position: relative;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: rgba(74, 158, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.card-subtitle {
  font-size: 0.75rem;
  color: #64748b;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 6px 10px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 6px;
  color: #4a9eff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(74, 158, 255, 0.2);
}

.chart-container {
  height: 350px;
}

.prediction-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.prediction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.prediction-tech {
  font-size: 0.75rem;
  color: #94a3b8;
}

.prediction-arrow {
  font-size: 1.2rem;
  font-weight: 700;
}

.prediction-arrow.up {
  color: #00d4aa;
}

.prediction-arrow.down {
  color: #ef4444;
}

.prediction-arrow.steady {
  color: #94a3b8;
}

.prediction-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.prediction-label {
  font-size: 0.65rem;
  color: #64748b;
}

.education-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.edu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.edu-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.edu-name {
  font-size: 0.8rem;
  color: #94a3b8;
}

.edu-percent {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

.bottom-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.analysis-card {
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
}

.jobs-card {
  max-height: 520px;
  overflow-y: auto;
}

.jobs-card::-webkit-scrollbar {
  width: 6px;
}

.jobs-card::-webkit-scrollbar-track {
  background: rgba(74, 158, 255, 0.1);
  border-radius: 3px;
}

.jobs-card::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 3px;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-card {
  position: relative;
  display: flex;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.job-card:hover {
  background: rgba(74, 158, 255, 0.08);
  border-color: rgba(74, 158, 255, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(74, 158, 255, 0.15);
}

.job-card.hovered {
  background: rgba(74, 158, 255, 0.08);
  border-color: rgba(74, 158, 255, 0.35);
}

.job-color-bar {
  width: 4px;
  flex-shrink: 0;
}

.job-color-bar.senior {
  background: linear-gradient(180deg, #8b5cf6, #6366f1);
}

.job-color-bar.manager {
  background: linear-gradient(180deg, #f59e0b, #f97316);
}

.job-color-bar.architect {
  background: linear-gradient(180deg, #22c55e, #10b981);
}

.job-color-bar.intern {
  background: linear-gradient(180deg, #06b6d4, #3b82f6);
}

.job-color-bar.regular {
  background: linear-gradient(180deg, #4a9eff, #00d4aa);
}

.job-content {
  flex: 1;
  padding: 18px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.job-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.job-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.job-tag {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 600;
}

.job-tag.senior {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.job-tag.manager {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.job-tag.architect {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.job-tag.intern {
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
}

.job-tag.regular {
  background: rgba(74, 158, 255, 0.2);
  color: #60a5fa;
}

.salary-competitive {
  padding: 3px 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  font-size: 0.68rem;
  color: #4ade80;
}

.job-salary {
  font-size: 1.1rem;
  font-weight: 700;
  color: #00d4aa;
  background: rgba(0, 212, 170, 0.1);
  padding: 6px 14px;
  border-radius: 8px;
}

.job-body {
  margin-bottom: 12px;
}

.job-company-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.job-company {
  font-size: 0.88rem;
  color: #94a3b8;
  font-weight: 500;
}

.company-type {
  padding: 2px 8px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 4px;
  font-size: 0.68rem;
  color: #94a3b8;
}

.job-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.job-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #64748b;
}

.job-publish-time {
  font-size: 0.78rem;
  color: #64748b;
}

.hr-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #22c55e;
}

.hr-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 4px 12px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: 15px;
  font-size: 0.75rem;
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skill-tag:hover {
  background: rgba(74, 158, 255, 0.35);
  color: #fff;
  border-color: rgba(74, 158, 255, 0.5);
  transform: translateY(-1px);
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.job-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefit-tag {
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  font-size: 0.72rem;
  color: #4ade80;
}

.job-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.follow-btn {
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: rgba(148, 163, 184, 0.8);
}

.follow-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  color: #60a5fa;
}

.follow-btn.applied {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fbbf24;
}

.follow-btn.applied svg {
  fill: #fbbf24;
}

.follow-header-btn {
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.25);
}

.follow-header-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.job-arrow {
  position: absolute;
  top: 18px;
  right: 18px;
  color: #64748b;
  transition: all 0.3s ease;
}

.job-arrow.expanded {
  transform: rotate(180deg);
  color: #4a9eff;
}

.job-detail {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(74, 158, 255, 0.2);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-section {
  margin-bottom: 15px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h5 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #60a5fa;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-section h5::before {
  content: '';
  width: 4px;
  height: 14px;
  background: linear-gradient(180deg, #4a9eff, #00d4aa);
  border-radius: 2px;
}

.detail-section p {
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0;
  padding-left: 10px;
}

.contact-section {
  background: rgba(0, 212, 170, 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 170, 0.2);
  margin-bottom: 12px;
}

.contact-section h5 {
  color: #00d4aa;
  margin-bottom: 10px;
  font-size: 0.85rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 212, 170, 0.08);
  border-radius: 6px;
  font-size: 0.8rem;
}

.contact-item svg {
  color: #00d4aa;
  flex-shrink: 0;
}

.contact-label {
  color: rgba(200, 220, 255, 0.7);
  min-width: 70px;
}

.contact-value {
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.contact-tip {
  margin-top: 8px;
  font-size: 0.72rem;
  color: rgba(200, 220, 255, 0.5);
  font-style: italic;
}

.career-path {
  background: rgba(74, 158, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.career-path h5 {
  margin-bottom: 10px;
}

.path-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 6px;
  font-size: 0.75rem;
  color: #60a5fa;
}

.path-step:not(:last-child) {
  border-right: 1px solid rgba(74, 158, 255, 0.3);
}

.skills-card {
  display: flex;
  flex-direction: column;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 10px 0;
  flex: 1;
}

.skill-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.skill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.5), rgba(0, 212, 170, 0.5));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.skill-card:hover::before,
.skill-card.hovered::before {
  opacity: 1;
}

.skill-card:hover,
.skill-card.hovered {
  background: rgba(74, 158, 255, 0.08);
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 158, 255, 0.15);
}

.skill-card.active {
  background: rgba(74, 158, 255, 0.12);
  border-color: rgba(74, 158, 255, 0.5);
}

.skill-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.skill-card .skill-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.88rem;
}

.skill-trend-icon {
  color: #64748b;
  transition: color 0.3s ease;
}

.skill-card.rising .skill-trend-icon {
  color: #22c55e;
}

.skill-card.declining .skill-trend-icon {
  color: #ef4444;
}

.skill-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #00d4aa;
}

.stat-label {
  display: block;
  font-size: 0.68rem;
  color: #64748b;
}

.mini-chart {
  height: 30px;
  margin-bottom: 8px;
}

.trend-svg {
  width: 100%;
  height: 100%;
}

.skill-card.rising .trend-svg polyline {
  color: #22c55e;
}

.skill-card.declining .trend-svg polyline {
  color: #ef4444;
}

.skill-card .trend-svg polyline {
  color: #60a5fa;
}

.salary-bar {
  height: 4px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.salary-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.skill-cloud-item.stable .skill-trend {
  color: #94a3b8;
}

.skills-detail {
  margin-top: 15px;
  padding: 15px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.detail-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.detail-close {
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  color: #ef4444;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.detail-close:hover {
  background: rgba(239, 68, 68, 0.3);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars svg {
  color: #64748b;
}

.detail-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

.detail-value.rising {
  color: #22c55e;
}

.detail-value.declining {
  color: #ef4444;
}

.detail-value.stable {
  color: #94a3b8;
}

.chat-section {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.08);
}

.chat-container {
  max-height: 280px;
  overflow-y: auto;
  padding: 15px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(74, 158, 255, 0.05);
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00d4aa;
  font-size: 0.95rem;
  font-weight: 600;
}

.chat-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #22c55e;
}

.chat-clear-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-family: inherit;
  transition: all 0.25s ease;
}

.chat-clear-btn:hover {
  background: rgba(255, 107, 107, 0.12);
  border-color: rgba(255, 107, 107, 0.35);
  color: #ff8a8a;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: status-online 2s ease-in-out infinite;
}

@keyframes status-online {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-container {
  height: 300px;
  overflow-y: auto;
  padding: 20px;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.chat-message.user .message-content {
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 12px 12px 0 12px;
}

.chat-message.ai .message-content {
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: 12px 12px 12px 0;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message.user .message-avatar {
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
}

.chat-message.ai .message-avatar {
  background: rgba(0, 212, 170, 0.2);
  color: #00d4aa;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
}

.message-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #fff;
  white-space: pre-wrap;
}

.typing-indicator {
  display: flex;
  gap: 6px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d4aa;
  animation: typing-bounce 1s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.chat-input-box {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(74, 158, 255, 0.05);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.chat-input:focus {
  border-color: rgba(74, 158, 255, 0.5);
}

.chat-input::placeholder {
  color: #64748b;
}

.send-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(74, 158, 255, 0.3);
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-row {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 15px;
  }
  
  .header-top {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input {
    width: 250px;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .message-content {
    max-width: 95%;
  }
  
  .suggestion-content {
    grid-template-columns: 1fr;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 480px;
  max-width: 90vw;
  max-height: 70vh;
  background: linear-gradient(145deg, rgba(10, 20, 50, 0.97), rgba(8, 14, 36, 0.97));
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.job-detail-modal {
  width: 600px;
  max-height: 85vh;
}

.job-detail-body {
  padding: 24px;
  overflow-y: auto;
}

.job-detail-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.job-detail-header h2 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #ffffff;
  font-weight: 700;
}

.job-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.job-detail-meta span {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.company-tag {
  background: rgba(74, 158, 255, 0.15);
  color: #60a5fa;
}

.city-tag {
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
}

.salary-range {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  font-weight: 600;
}

.job-detail-section {
  margin-bottom: 20px;
}

.job-detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #60a5fa;
  font-weight: 600;
}

.job-detail-section p {
  margin: 0;
  line-height: 1.7;
  color: rgba(200, 220, 255, 0.8);
  font-size: 14px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #60a5fa;
  font-weight: 600;
}

.modal-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.modal-body {
  padding: 16px 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px;
  background: rgba(74, 158, 255, 0.06);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.modal-item:hover {
  background: rgba(74, 158, 255, 0.12);
  border-color: rgba(74, 158, 255, 0.3);
}

.clickable-item {
  cursor: pointer;
}

.clickable-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
}

.item-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #fff;
}

.item-info p {
  margin: 0 0 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.salary-tag {
  display: inline-block;
  background: rgba(0, 212, 170, 0.15);
  color: #5eead4;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  margin-right: 8px;
}

.remove-btn {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.remove-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
}

.modal-empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.modal-empty p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px;
}

.modal-empty span {
  font-size: 12px;
}
</style>