<template>
  <div class="job-community">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    <div class="community-container">
      <nav class="community-nav">
        <div class="nav-left">
          <button class="nav-back" @click="goBack">←</button>
          <div class="nav-logo">
            <span class="logo-icon">👥</span>
            <div class="logo-text">
              <span class="logo-main">JobHub</span>
              <span class="logo-sub">求职社区</span>
            </div>
          </div>
        </div>
        <div class="nav-center">
          <button class="nav-item" :class="{ active: activeTab === 'interview' }" @click="activeTab = 'interview'">
            <span class="nav-icon">📝</span>
            <span class="nav-text">面经</span>
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'job' }" @click="activeTab = 'job'">
            <span class="nav-icon">💼</span>
            <span class="nav-text">岗位</span>
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'qa' }" @click="activeTab = 'qa'">
            <span class="nav-icon">❓</span>
            <span class="nav-text">问答</span>
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'group' }" @click="activeTab = 'group'">
            <span class="nav-icon">👨‍👩‍👧‍👦</span>
            <span class="nav-text">小组</span>
          </button>
        </div>
        <div class="nav-right">
          <button class="publish-btn" @click="showPublishModal = true">+ 发布经验</button>
          <div class="user-profile" @click="toggleUserMenu">
            <img :src="currentUser.avatar" alt="头像" />
            <div class="user-menu" :class="{ 'user-menu-visible': showUserMenu }">
              <div class="menu-item" @click="handleMenuClick('profile', $event)">👤 个人主页</div>
              <div class="menu-item" @click="handleMenuClick('publish', $event)">📝 我的发布</div>
              <div class="menu-item" @click="handleMenuClick('applies', $event)">📋 我的投递</div>
              <div class="menu-item" @click="handleMenuClick('collect', $event)">💾 我的收藏</div>
              <div class="menu-item" @click="handleMenuClick('settings', $event)">⚙️ 设置</div>
              <div class="menu-divider"></div>
              <div class="menu-item logout" @click="handleMenuClick('logout', $event)">🚪 退出登录</div>
            </div>
          </div>
        </div>
      </nav>

      <section class="hero-banner">
        <h1 class="banner-title">求职路上，你不是一个人</h1>
        <p class="banner-desc">分享面试经历，对比offer，找到同赛道战友</p>
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="搜索面试经验、岗位、问题" class="search-input" @keyup.enter="handleSearch"/>
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
        <div v-if="searchHistory.length > 0" class="search-history">
          <span class="history-label">搜索历史：</span>
          <span v-for="(h, i) in searchHistory" :key="i" class="history-item" @click="handleKeywordSearch(h)">{{ h }}</span>
          <span class="history-clear" @click="clearSearchHistory">清空</span>
        </div>
        <div class="hot-keywords">
          <span v-for="kw in hotKeywords" :key="kw" class="keyword-item" @click="handleKeywordSearch(kw)">{{ kw }}</span>
        </div>
        <div class="banner-stats">
          <div class="stat-card">
            <span class="stat-value">{{ stats.interviews }}</span>
            <span class="stat-label">面经</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.jobs }}</span>
            <span class="stat-label">岗位</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.questions }}</span>
            <span class="stat-label">问答</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.online }}</span>
            <span class="stat-label">在线</span>
          </div>
        </div>
        </section>

      <div class="main-content">
        <div class="content-left">
          <div v-if="activeTab === 'interview'" class="tab-content">
            <div class="section-header">
              <span class="section-title">🔥 {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '热门面经' }}</span>
              <div class="section-filters">
                <span :class="{ active: filterType === 'hot' }" @click="filterType = 'hot'">最热</span>
                <span :class="{ active: filterType === 'latest' }" @click="filterType = 'latest'">最新</span>
              </div>
            </div>
            <!-- 热门精选区：仅最热模式且非搜索时展示前5条 -->
            <div v-if="hotFeaturedInterviews.length > 0" class="featured-section">
              <div class="featured-header">
                <span class="featured-title">🏆 热门精选 TOP 5</span>
                <span class="featured-desc">社区最高热度面经</span>
              </div>
              <div class="interview-list">
                <div v-for="(item, index) in hotFeaturedInterviews" :key="'feat-' + index" class="interview-card featured-card" @click="openDetail('interview', item)">
                  <div class="card-rank" :class="getRankClass(index)">{{ index + 1 }}</div>
                  <div class="card-main">
                    <div class="card-badges">
                      <span v-if="item.likes > 200" class="badge hot">🔥 热门</span>
                      <span v-if="item.comments > 100" class="badge active">💬 热议</span>
                    </div>
                    <div class="card-header">
                      <img :src="item.avatar" class="card-avatar" @click.stop="openUserProfile(item.author)" />
                      <div class="card-title-wrap">
                        <h3 class="card-title">{{ item.title }}</h3>
                        <div class="card-meta">
                          <span class="card-author" @click.stop="openUserProfile(item.author)">{{ item.author }}</span>
                          <span class="card-time">{{ item.time }}</span>
                          <span class="card-status" :class="getOnlineStatus(item.author)">在线</span>
                        </div>
                      </div>
                    </div>
                    <div class="card-tags">
                      <span v-for="tag in item.tags" :key="tag" class="tag" @click.stop="handleKeywordSearch(tag)">{{ tag }}</span>
                    </div>
                    <p class="card-preview">{{ item.preview }}</p>
                    <div class="card-actions">
                      <button class="action-btn" :class="{ active: item.liked }" @click.stop="toggleLike(item)">
                        <span class="action-icon">{{ item.liked ? '❤️' : '🤍' }}</span>
                        <span class="action-num">{{ item.likes }}</span>
                      </button>
                      <button class="action-btn" @click.stop="openCommentModal(item)">
                        <span class="action-icon">💬</span>
                        <span class="action-num">{{ item.comments }}</span>
                      </button>
                      <button class="action-btn" :class="{ active: item.collected }" @click.stop="toggleCollect(item)">
                        <span class="action-icon">{{ item.collected ? '⭐' : '☆' }}</span>
                        <span class="action-num">{{ item.collected ? '已收藏' : '收藏' }}</span>
                      </button>
                      <button class="action-btn" @click.stop="shareItem(item)">
                        <span class="action-icon">🔗</span>
                        <span class="action-num">分享</span>
                      </button>
                      <span class="action-stat">
                        <span class="action-icon">👁️</span>
                        <span class="action-num">{{ item.views }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 全部面经列表区 -->
            <div class="normal-section">
              <div v-if="hotFeaturedInterviews.length > 0" class="normal-section-header">
                <span class="normal-section-title">📋 全部面经</span>
                <span class="normal-section-count">共 {{ interviewRemainingCount }} 条</span>
              </div>
              <div class="interview-list">
                <div v-for="(item, index) in paginatedInterviews" :key="'norm-' + index" class="interview-card" @click="openDetail('interview', item)">
                  <div class="card-rank">{{ index + 1 }}</div>
                  <div class="card-main">
                    <div class="card-badges">
                      <span v-if="item.likes > 200" class="badge hot">🔥 热门</span>
                      <span v-if="item.comments > 100" class="badge active">💬 热议</span>
                    </div>
                    <div class="card-header">
                      <img :src="item.avatar" class="card-avatar" @click.stop="openUserProfile(item.author)" />
                      <div class="card-title-wrap">
                        <h3 class="card-title">{{ item.title }}</h3>
                        <div class="card-meta">
                          <span class="card-author" @click.stop="openUserProfile(item.author)">{{ item.author }}</span>
                          <span class="card-time">{{ item.time }}</span>
                          <span class="card-status" :class="getOnlineStatus(item.author)">在线</span>
                        </div>
                      </div>
                    </div>
                    <div class="card-tags">
                      <span v-for="tag in item.tags" :key="tag" class="tag" @click.stop="handleKeywordSearch(tag)">{{ tag }}</span>
                    </div>
                    <p class="card-preview">{{ item.preview }}</p>
                    <div class="card-actions">
                      <button class="action-btn" :class="{ active: item.liked }" @click.stop="toggleLike(item)">
                        <span class="action-icon">{{ item.liked ? '❤️' : '🤍' }}</span>
                        <span class="action-num">{{ item.likes }}</span>
                      </button>
                      <button class="action-btn" @click.stop="openCommentModal(item)">
                        <span class="action-icon">💬</span>
                        <span class="action-num">{{ item.comments }}</span>
                      </button>
                      <button class="action-btn" :class="{ active: item.collected }" @click.stop="toggleCollect(item)">
                        <span class="action-icon">{{ item.collected ? '⭐' : '☆' }}</span>
                        <span class="action-num">{{ item.collected ? '已收藏' : '收藏' }}</span>
                      </button>
                      <button class="action-btn" @click.stop="shareItem(item)">
                        <span class="action-icon">🔗</span>
                        <span class="action-num">分享</span>
                      </button>
                      <span class="action-stat">
                        <span class="action-icon">👁️</span>
                        <span class="action-num">{{ item.views }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="filteredInterviews.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无匹配的面经</p>
              </div>
              <div v-if="interviewTotalPages > 1" class="pagination">
                <span class="pagination-info">共 {{ interviewRemainingCount }} 条面经，第 {{ interviewCurrentPage }} / {{ interviewTotalPages }} 页</span>
                <div class="pagination-controls">
                  <button class="page-btn" :disabled="interviewCurrentPage === 1" @click="prevInterviewPage">‹ 上一页</button>
                  <button 
                    v-for="(page, index) in interviewPageNumbers" 
                    :key="index" 
                    :class="['page-btn', { active: page === interviewCurrentPage, disabled: page === '...' }]"
                    @click="handleInterviewPageClick(page)"
                  >{{ page }}</button>
                  <button class="page-btn" :disabled="interviewCurrentPage >= interviewTotalPages" @click="nextInterviewPage">下一页 ›</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'job'" class="tab-content">
            <div class="section-header">
              <span class="section-title">💼 {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '岗位速递' }}</span>
              <div class="section-filters">
                <span :class="{ active: jobFilter === 'all' }" @click="jobFilter = 'all'; jobCurrentPage = 1">全部</span>
                <span :class="{ active: jobFilter === 'campus' }" @click="jobFilter = 'campus'; jobCurrentPage = 1">校招</span>
                <span :class="{ active: jobFilter === 'social' }" @click="jobFilter = 'social'; jobCurrentPage = 1">社招</span>
              </div>
            </div>
            <div class="job-grid">
              <div v-for="job in paginatedFilteredJobs" :key="job.id" class="job-card" @click="openDetail('job', job)">
                <h3 class="job-title">{{ job.title }}</h3>
                <p class="job-company">{{ job.company }}</p>
                <div class="job-info">
                  <span>{{ job.city }}</span>
                  <span class="salary">{{ job.salary }}</span>
                  <span>{{ job.experience }}</span>
                  <span>{{ job.education }}</span>
                </div>
                <div class="job-skills">
                  <span v-for="skill in job.tags" :key="skill" class="skill">{{ skill }}</span>
                </div>
                <div class="job-actions">
                  <button class="collect-btn" :class="{ collected: job.collected }" @click.stop="toggleJobCollect(job)">
                    {{ job.collected ? '⭐' : '☆' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="filteredJobs.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无匹配的岗位</p>
            </div>
            <div v-if="filteredJobs.length > jobPageSize" class="pagination">
              <span class="pagination-info">共 {{ filteredJobs.length }} 个岗位，第 {{ jobCurrentPage }} / {{ Math.ceil(filteredJobs.length / jobPageSize) }} 页</span>
              <div class="pagination-controls">
                <button class="page-btn" :disabled="jobCurrentPage === 1" @click="prevPage">‹ 上一页</button>
                <button 
                  v-for="(page, index) in pageNumbers" 
                  :key="index" 
                  :class="['page-btn', { active: page === jobCurrentPage, disabled: page === '...' }]"
                  @click="handlePageClick(page)"
                >{{ page }}</button>
                <button class="page-btn" :disabled="jobCurrentPage >= Math.ceil(filteredJobs.length / jobPageSize)" @click="nextPage">下一页 ›</button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'qa'" class="tab-content">
            <div class="section-header">
              <span class="section-title">❓ {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '求职问答' }}</span>
              <div class="section-filters">
                <span :class="{ active: qaFilter === 'all' }" @click="qaFilter = 'all'">全部</span>
                <span :class="{ active: qaFilter === 'unsolved' }" @click="qaFilter = 'unsolved'">待解答</span>
                <span :class="{ active: qaFilter === 'solved' }" @click="qaFilter = 'solved'">已解答</span>
                <span :class="{ active: qaFilter === 'followed' }" @click="qaFilter = 'followed'">已关注</span>
              </div>
            </div>
            <div class="qa-list">
              <div v-for="(qa, index) in paginatedQAs" :key="index" class="qa-card" @click="openDetail('qa', qa)">
                <div class="qa-header">
                  <img :src="qa.avatar" class="qa-avatar" @click.stop="openUserProfile(qa.author)" />
                  <div class="qa-title-wrap">
                    <div class="qa-title-row">
                      <h3 class="qa-title">{{ qa.title }}</h3>
                      <span class="qa-status" :class="qa.solved ? 'solved' : 'unsolved'">
                        {{ qa.solved ? '✅ 已解答' : '⏳ 待解答' }}
                      </span>
                    </div>
                    <div class="qa-meta">
                      <span @click.stop="openUserProfile(qa.author)">{{ qa.author }}</span>
                      <span>{{ qa.time }}</span>
                    </div>
                  </div>
                  <button class="qa-follow-btn" :class="{ followed: followedQuestionIds.has(qa.title) }" @click.stop="toggleFollowQuestion(qa)">
                    {{ followedQuestionIds.has(qa.title) ? '已关注' : '+关注' }}
                  </button>
                </div>
                <div class="qa-tags">
                  <span v-for="tag in qa.tags" :key="tag" class="qa-tag">{{ tag }}</span>
                </div>
                <p class="qa-preview">{{ qa.preview }}</p>
                <div class="qa-actions">
                  <button class="qa-action-btn" @click.stop="openCommentModal(qa)">
                    <span>💬</span>
                    <span>{{ qa.answers }}回答</span>
                  </button>
                  <span v-if="qa.bestAnswer" class="qa-best-answer">
                    🏆 最佳回答 {{ qa.bestAnswer.likes }}赞
                  </span>
                </div>
              </div>
              <div v-if="filteredQAs.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <p>{{ qaFilter === 'followed' ? '暂未关注任何问题，快去关注感兴趣的问题吧！' : '暂无相关问题' }}</p>
              </div>
            </div>
            <div v-if="qaTotalPages > 1" class="pagination">
              <span class="pagination-info">共 {{ filteredQAs.length }} 个问题，第 {{ qaCurrentPage }} / {{ qaTotalPages }} 页</span>
              <div class="pagination-controls">
                <button class="page-btn" :disabled="qaCurrentPage === 1" @click="prevQaPage">‹ 上一页</button>
                <button 
                  v-for="(page, index) in qaPageNumbers" 
                  :key="index" 
                  :class="['page-btn', { active: page === qaCurrentPage, disabled: page === '...' }]"
                  @click="handleQaPageClick(page)"
                >{{ page }}</button>
                <button class="page-btn" :disabled="qaCurrentPage >= qaTotalPages" @click="nextQaPage">下一页 ›</button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'group'" class="tab-content">
            <div class="section-header">
              <span class="section-title">👨‍👩‍👧‍👦 {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '求职小组' }}</span>
              <button class="create-group-btn" @click="showCreateGroupModal = true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                创建群聊
              </button>
            </div>
            <div class="group-grid">
              <div v-for="(group, index) in groupList" :key="index" class="group-card" @click="openDetail('group', group)">
                <div class="group-icon">{{ group.name.charAt(0) }}</div>
                <h3 class="group-name">
                  {{ group.name }}
                  <span v-if="group.isUserCreated" class="user-group-badge">自建</span>
                </h3>
                <p class="group-desc">{{ group.desc }}</p>
                <div class="group-stats">
                  <span>{{ group.members }}成员</span>
                  <span>{{ group.posts }}帖子/周</span>
                </div>
                <div class="group-actions">
                  <button v-if="group.joined" class="join-btn chat-btn" @click.stop="openGroupChat(group)">💬 群聊</button>
                  <button class="join-btn" @click.stop="toggleJoin(group)">{{ group.joined ? '已加入' : '加入' }}</button>
                  <button v-if="group.isUserCreated && group.creator === currentUser.name" class="join-btn delete-btn" @click.stop="handleDeleteGroup(group)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="content-right">
          <div class="online-users">
            <h4>在线用户</h4>
            <div class="avatar-stack">
              <img v-for="user in onlineUsers" :key="user.name" :src="user.avatar" class="mini-avatar" />
            </div>
            <span class="online-count">{{ onlineUsers.length }}人在线</span>
          </div>

          <div class="hot-topics">
            <h4>热门技术方向</h4>
            <div class="topic-list" v-if="hotTopics.length > 0">
              <div v-for="(topic, index) in hotTopics" :key="index" class="topic-item" @click="openTopicDetail(topic)">
                <span class="topic-rank">{{ index + 1 }}</span>
                <span class="topic-name">{{ topic.name }}</span>
                <span class="topic-posts">{{ topic.posts }}个岗位</span>
              </div>
            </div>
            <div v-else class="topic-empty">暂无数据</div>
          </div>

          <div class="recommend-users" v-if="recommendUsers.length > 0">
            <h4>推荐关注</h4>
            <div class="user-list">
              <div v-for="(user, index) in recommendUsers" :key="index" class="user-item" @click="openUserProfile(user.name)">
                <img :src="user.avatar" class="user-avatar" />
                <div class="user-detail">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-title">{{ user.title }}</span>
                </div>
                <button class="follow-btn" @click.stop="toggleFollow(user)">{{ user.followed ? '已关注' : '+关注' }}</button>
                <button v-if="user.followed" class="chat-btn" @click.stop="openChat(user)">私信</button>
              </div>
            </div>
          </div>

          <div class="weekly-rank" v-if="weeklyRank.length > 0">
            <h4>本周活跃榜 <span class="rank-rule-toggle" @click="showPointsRule = !showPointsRule">💡积分规则</span></h4>
            <div v-if="showPointsRule" class="points-rule">
              <div class="rule-title">积分计算方式</div>
              <div class="rule-item">👍 点赞 × 1分</div>
              <div class="rule-item">💬 评论 × 2分</div>
              <div class="rule-item">👁️ 浏览 ÷ 10分</div>
              <div class="rule-item">📝 发布奖励 30分(首次)</div>
              <div class="rule-item">❓ 回答问题 × 5分</div>
            </div>
            <div class="rank-list">
              <div v-for="(rank, index) in weeklyRank" :key="index" class="rank-item" :class="getRankClass(index)" @click="openUserProfile(rank.name)">
                <span class="rank-num">{{ index + 1 }}</span>
                <img :src="rank.avatar" class="rank-avatar" />
                <span class="rank-name">{{ rank.name }}</span>
                <span class="rank-score">{{ rank.score }}积分</span>
                <span class="rank-view-hint">查看主页 ›</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer class="community-footer">
        <p>&copy; 2026 JobHub求职社区</p>
      </footer>
    </div>

    <teleport to="body">
    <div v-if="showDetail" class="detail-modal jc-overlay" @click.self="closeDetail">
      <div class="modal-content jc-modal-card">
        <button class="close-btn" @click="closeDetail">✕</button>
        <div v-if="detailType === 'interview'" class="detail-body">
          <div class="detail-header">
            <img :src="detailData.avatar" class="detail-avatar" @click="closeDetail(); openUserProfile(detailData.author)" />
            <div class="detail-author">
              <h2>{{ detailData.title }}</h2>
              <div class="detail-meta">
                <span class="detail-author-name" @click="closeDetail(); openUserProfile(detailData.author)">{{ detailData.author }} ›</span>
                <span>{{ detailData.time }}</span>
                <span>👁️{{ detailData.views }}</span>
              </div>
            </div>
          </div>
          <div class="detail-tags">
            <span v-for="tag in detailData.tags" :key="tag" class="detail-tag">{{ tag }}</span>
          </div>
          <div class="detail-content">
            <p>{{ detailData.preview }}</p>
            <p>这是一篇详细的面试经验分享，包含了面试的全过程、技术问题、HR面等环节。希望能帮助到正在求职的小伙伴们！</p>
            <h3>面试过程：</h3>
            <ul>
              <li>第一轮：技术初面，主要考察基础知识</li>
              <li>第二轮：技术复试，深入项目经历</li>
              <li>第三轮：HR面，了解个人情况和职业规划</li>
            </ul>
            <h3>面试题分享：</h3>
            <ul>
              <li>请介绍一下你做过的项目</li>
              <li>你熟悉的技术栈有哪些？</li>
              <li>遇到过什么技术难点？如何解决的？</li>
            </ul>
            <h3>总结建议：</h3>
            <p>提前准备，保持自信，诚实回答问题。祝大家都能拿到心仪的offer！</p>
          </div>
          <div class="detail-actions">
            <button class="detail-action-btn" :class="{ active: detailData.liked }" @click="toggleLike(detailData)">
              <span>{{ detailData.liked ? '❤️' : '🤍' }}</span>
              <span>{{ detailData.likes }}赞</span>
            </button>
            <button class="detail-action-btn" :class="{ active: detailData.collected }" @click="toggleCollect(detailData)">
              <span>{{ detailData.collected ? '⭐' : '☆' }}</span>
              <span>{{ detailData.collected ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="detail-action-btn" @click="shareItem(detailData)">
              <span>🔗</span>
              <span>分享</span>
            </button>
          </div>
          <div class="comment-section">
            <h3>评论 ({{ detailData.comments }})</h3>
            <div class="comment-list">
              <div v-for="(comment, index) in detailData.commentList" :key="index" class="comment-item">
                <img :src="comment.avatar" class="comment-avatar" @click="openUserProfile(comment.author)" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author" @click="openUserProfile(comment.author)">{{ comment.author }}</span>
                    <span class="comment-time">{{ comment.time }}</span>
                  </div>
                  <p>{{ comment.content }}</p>
                  <button class="comment-like" :class="{ liked: comment.liked }" @click="toggleCommentLike(comment)">
                    {{ comment.liked ? '❤️' : '🤍' }} {{ comment.likes }}
                  </button>
                </div>
              </div>
            </div>
            <div class="comment-input-box">
              <input v-model="newComment" type="text" placeholder="发表你的评论..." class="comment-input" @keyup.enter="submitCommentFromDetail" />
              <button class="comment-submit" @click="submitCommentFromDetail">发布评论</button>
            </div>
          </div>
        </div>

        <div v-if="detailType === 'job'" class="detail-body">
          <h2>{{ detailData.title }}</h2>
          <p class="detail-company">{{ detailData.company }}</p>
          <div class="detail-meta">
            <span>📍{{ detailData.city }}</span>
            <span>💰{{ detailData.salary }}</span>
            <span>📅{{ detailData.experience }}</span>
            <span>🎓{{ detailData.education }}</span>
          </div>
          <div class="detail-tags">
            <span v-for="skill in detailData.tags" :key="skill" class="detail-tag">{{ skill }}</span>
          </div>
          <div class="job-highlights">
            <div v-for="(h, idx) in (jobDetailContent.highlights || [])" :key="'jh-' + idx" class="job-highlight-item">
              <span class="job-highlight-dot"></span>{{ h }}
            </div>
          </div>
          <div class="detail-content">
            <h3>岗位职责：</h3>
            <ul>
              <li v-for="(d, idx) in (jobDetailContent.duties || [])" :key="'duty-' + idx">{{ d }}</li>
            </ul>
            <h3>岗位要求：</h3>
            <ul>
              <li v-for="(r, idx) in (jobDetailContent.requirements || [])" :key="'req-' + idx">{{ r }}</li>
            </ul>
          </div>
          <div class="job-detail-actions">
            <button class="collect-btn-lg" :class="{ collected: detailData.collected }" @click="toggleJobCollect(detailData)">
              {{ detailData.collected ? '⭐已收藏' : '☆收藏岗位' }}
            </button>
          </div>
        </div>

        <div v-if="detailType === 'qa'" class="detail-body">
          <div class="detail-header">
            <img :src="detailData.avatar" class="detail-avatar" @click="closeDetail(); openUserProfile(detailData.author)" />
            <div class="detail-author">
              <h2>{{ detailData.title }}</h2>
              <div class="detail-meta">
                <span @click="closeDetail(); openUserProfile(detailData.author)">{{ detailData.author }}</span>
                <span>{{ detailData.time }}</span>
                <span :class="['qa-status', detailData.solved ? 'solved' : 'unsolved']">{{ detailData.solved ? '✅ 已解答' : '⏳ 待解答' }}</span>
                <button class="qa-follow-btn" :class="{ followed: followedQuestionIds.has(detailData.title) }" @click="toggleFollowQuestion(detailData)">
                  {{ followedQuestionIds.has(detailData.title) ? '已关注' : '+关注' }}
                </button>
              </div>
            </div>
          </div>
          <div class="detail-tags">
            <span v-for="tag in detailData.tags" :key="tag" class="detail-tag">{{ tag }}</span>
          </div>
          <div class="detail-content">
            <h3>问题描述：</h3>
            <p>{{ detailData.preview }}</p>
          </div>
          <div class="comment-section">
            <div class="qa-answers-header">
              <h3>全部回答 ({{ detailData.answerList?.length || 0 }})</h3>
              <button v-if="!detailData.solved" class="solve-btn" @click="markAsSolved(detailData)">✅ 标记为已解答</button>
            </div>
            <div class="comment-list">
              <div v-for="(ans, index) in (detailData.answerList || [])" :key="index" class="comment-item">
                <img :src="ans.avatar" class="comment-avatar" @click="openUserProfile(ans.author)" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author" @click="openUserProfile(ans.author)">{{ ans.author }}</span>
                    <span class="comment-time">{{ ans.time }}</span>
                  </div>
                  <p>{{ ans.content }}</p>
                  <button class="comment-like" :class="{ liked: ans.liked }" @click="ans.liked = !ans.liked; ans.likes += ans.liked ? 1 : -1">
                    {{ ans.liked ? '❤️' : '🤍' }} {{ ans.likes }}
                  </button>
                </div>
              </div>
              <div v-if="!detailData.answerList || detailData.answerList.length === 0" class="empty-text">暂无回答，快来抢答吧！</div>
            </div>
            <div class="comment-input-box">
              <input v-model="newComment" type="text" placeholder="写下你的回答..." class="comment-input" @keyup.enter="submitAnswer" />
              <button class="comment-submit" @click="submitAnswer">发布回答</button>
            </div>
          </div>
        </div>

        <div v-if="detailType === 'group'" class="detail-body">
          <div class="group-header">
            <div class="group-icon-lg">{{ detailData.name.charAt(0) }}</div>
            <div>
              <h2>{{ detailData.name }}</h2>
              <p>{{ detailData.desc }}</p>
              <div class="group-meta">
                <span>{{ detailData.members }}成员</span>
                <span>{{ detailData.posts }}帖子/周</span>
              </div>
            </div>
          </div>
          <div class="group-actions">
            <button class="group-action-btn" :class="{ joined: detailData.joined }" @click="toggleJoin(detailData)">
              {{ detailData.joined ? '✓ 已加入' : '+ 加入小组' }}
            </button>
            <button v-if="detailData.joined" class="group-action-btn" @click="openGroupChat(detailData)">进入群聊</button>
          </div>
          <div class="group-content">
            <h3>小组公告：</h3>
            <p>欢迎加入本小组！请遵守社区规则，文明发言，共同营造良好的交流氛围。</p>
            <h3>最新帖子：</h3>
            <div class="group-posts">
              <div v-for="(post, index) in groupPosts" :key="index" class="group-post">
                <h4>{{ post.title }}</h4>
                <p>{{ post.preview }}</p>
                <div class="post-meta">
                  <span>{{ post.author }}</span>
                  <span>{{ post.time }}</span>
                  <span>💬{{ post.comments }}</span>
                  <span>❤️{{ post.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showCommentModal" class="comment-modal jc-overlay jc-overlay-sm" @click.self="closeCommentModal">
      <div class="comment-modal-content jc-modal-card">
        <button class="close-btn" @click="closeCommentModal">✕</button>
        <h3>发表评论</h3>
        <textarea v-model="commentText" rows="4" placeholder="写下你的评论..." class="comment-textarea"></textarea>
        <div class="comment-modal-actions">
          <button class="cancel-btn" @click="closeCommentModal">取消</button>
          <button class="submit-btn" @click="submitComment">发布评论</button>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showPublishModal" class="publish-modal jc-overlay jc-overlay-md" @click.self="closePublishModal">
      <div class="publish-modal-content jc-modal-card">
        <button class="close-btn" @click="closePublishModal">✕</button>
        <h3>发布经验</h3>
        <div class="publish-form">
          <input v-model="publishForm.title" type="text" placeholder="标题" class="publish-input" />
          <div class="publish-tags">
            <input v-model="publishForm.tagInput" type="text" placeholder="输入标签后回车" class="tag-input" @keyup.enter="addTag" />
            <span v-for="(tag, index) in publishForm.tags" :key="index" class="publish-tag">{{ tag }}<span @click="removeTag(index)">×</span></span>
          </div>
          <textarea v-model="publishForm.content" rows="8" placeholder="分享你的面试经验..." class="publish-textarea"></textarea>
          <button class="publish-submit" @click="submitPublish" :disabled="isSubmitting">
            {{ isSubmitting ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </div>
    </teleport>

    <!-- 创建群聊弹窗 -->
    <teleport to="body">
    <div v-if="showCreateGroupModal" class="create-group-modal jc-overlay jc-overlay-sm" @click.self="showCreateGroupModal = false">
      <div class="create-group-modal-content jc-modal-card">
        <button class="close-btn" @click="showCreateGroupModal = false">✕</button>
        <h3>创建群聊</h3>
        <div class="create-group-form">
          <input v-model="createGroupForm.name" type="text" maxlength="12" placeholder="群名称（最多12字）" class="publish-input" />
          <textarea v-model="createGroupForm.desc" rows="3" maxlength="60" placeholder="群简介（可选）" class="publish-textarea" />
          <div v-if="createGroupErr" class="create-group-err">{{ createGroupErr }}</div>
          <div class="create-group-actions">
            <button class="cancel-btn" @click="showCreateGroupModal = false">取消</button>
            <button class="submit-btn" @click="handleCreateGroup">创建</button>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showTopicDetail" class="topic-modal jc-overlay jc-overlay-topic" @click.self="closeTopicDetail">
      <div class="topic-modal-content jc-modal-card">
        <button class="close-btn" @click="closeTopicDetail">✕</button>
        <div class="topic-header">
          <h2>📌 {{ currentTopic?.name }}</h2>
          <div class="topic-stats">
            <span>{{ currentTopic?.posts }} 条帖子</span>
            <span class="trend">{{ currentTopic?.trend }} 热度</span>
          </div>
        </div>
        <div class="topic-related">
          <span class="related-title">相关标签：</span>
          <span v-for="(tag, index) in currentTopic?.related" :key="index" class="related-tag" @click="handleKeywordSearch(tag)">{{ tag }}</span>
        </div>
        <div class="topic-content">
          <h3>🔥 热门讨论 <span class="topic-sort-tip">（按热度排序）</span></h3>
          <div v-if="topicRelatedPosts.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>该话题暂无相关讨论</p>
          </div>
          <div class="topic-posts">
            <div v-for="(post, index) in topicRelatedPosts" :key="index" class="topic-post" :class="{ 'topic-post-top': index < 3 }" @click="openDetailFromTopic('interview', post)">
              <span class="topic-post-rank" :class="getRankClass(index)">{{ index + 1 }}</span>
              <img :src="post.avatar" class="post-avatar-sm" @click.stop="openUserProfile(post.author)" />
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span class="post-author" @click.stop="openUserProfile(post.author)">{{ post.author }}</span>
                  <span>{{ post.time }}</span>
                  <span>💬 {{ post.comments }}</span>
                  <span>❤️ {{ post.likes }}</span>
                  <span class="post-heat">🔥 {{ computeHeat(post) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <!-- 用户主页弹窗 -->
    <teleport to="body">
    <div v-if="showUserProfile" class="publish-modal jc-overlay jc-overlay-profile" @click.self="closeUserProfile">
      <div class="modal-content user-profile-modal jc-modal-card">
        <button class="close-btn" @click="closeUserProfile">✕</button>
        <div v-if="userProfileData" class="user-profile-body">
          <div class="up-header">
            <img :src="userProfileData.avatar" class="up-avatar" />
            <div class="up-info">
              <h2 class="up-name">{{ userProfileData.name }}</h2>
              <p class="up-title">{{ userProfileData.title || '社区活跃用户' }}</p>
              <div class="up-stats">
                <span class="up-stat"><strong>{{ userProfileData.score }}</strong> 积分</span>
                <span class="up-stat"><strong>{{ userProfileData.postCount }}</strong> 篇面经</span>
                <span class="up-stat"><strong>{{ userProfileData.qaCount }}</strong> 个问答</span>
                <span class="up-stat"><strong>{{ userProfileData.totalLikes }}</strong> 总获赞</span>
              </div>
              <div class="up-rank-info">
                <span v-if="userProfileData.rank > 0" class="up-rank-badge">🏆 活跃榜第 {{ userProfileData.rank }} 名</span>
                <span v-else class="up-rank-badge up-rank-unlisted">暂未上榜，继续努力</span>
              </div>
            </div>
          </div>

          <div class="up-tabs">
            <span :class="{ active: userProfileTab === 'posts' }" @click="userProfileTab = 'posts'">📝 发布的面经 ({{ userProfileData.posts.length }})</span>
            <span :class="{ active: userProfileTab === 'qas' }" @click="userProfileTab = 'qas'">❓ 参与的问答 ({{ userProfileData.qas.length }})</span>
          </div>

          <div class="up-list">
            <template v-if="userProfileTab === 'posts'">
              <div v-if="userProfileData.posts.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <p>该用户暂未发布面经</p>
              </div>
              <div v-for="(post, index) in userProfileData.posts" :key="'up-' + index" class="my-publish-item" @click="openDetail('interview', post); closeUserProfile()">
                <div class="publish-rank">{{ index + 1 }}</div>
                <div class="publish-info">
                  <h4 class="publish-title">{{ post.title }}</h4>
                  <div class="publish-tags">
                    <span v-for="(tag, tIndex) in post.tags" :key="tIndex" class="publish-tag">{{ tag }}</span>
                  </div>
                  <div class="publish-stats">
                    <span>👁️ {{ post.views }}</span>
                    <span>❤️ {{ post.likes }}</span>
                    <span>💬 {{ post.comments }}</span>
                    <span class="post-heat">🔥 {{ computeHeat(post) }}</span>
                  </div>
                </div>
                <div class="publish-time">{{ post.time }}</div>
              </div>
            </template>

            <template v-if="userProfileTab === 'qas'">
              <div v-if="userProfileData.qas.length === 0" class="empty-state">
                <div class="empty-icon">❓</div>
                <p>该用户暂未参与问答</p>
              </div>
              <div v-for="(qa, index) in userProfileData.qas" :key="'uq-' + index" class="my-publish-item" @click="openDetail('qa', qa); closeUserProfile()">
                <div class="publish-rank">{{ index + 1 }}</div>
                <div class="publish-info">
                  <h4 class="publish-title">{{ qa.title }}</h4>
                  <div class="publish-tags">
                    <span v-for="(tag, tIndex) in qa.tags" :key="tIndex" class="publish-tag">{{ tag }}</span>
                  </div>
                  <div class="publish-stats">
                    <span>💬 {{ qa.answers }}</span>
                    <span>👁️ {{ qa.views }}</span>
                    <span v-if="qa.solved" class="qa-solved-tag">✓ 已解决</span>
                  </div>
                </div>
                <div class="publish-time">{{ qa.time }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showMyPublish" class="publish-modal jc-overlay" @click.self="showMyPublish = false">
      <div class="modal-content jc-modal-card">
        <div class="modal-header">
          <h2>📝 我的发布</h2>
          <button class="close-btn" @click="showMyPublish = false">×</button>
        </div>
        <div class="my-publish-list">
          <div v-if="myPublishedPosts.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无发布的帖子</p>
            <button class="empty-btn" @click="showMyPublish = false; showPublishModal = true">去发布</button>
          </div>
          <div v-for="(post, index) in myPublishedPosts" :key="index" class="my-publish-item" @click="openDetail('interview', post); showMyPublish = false">
            <div class="publish-rank">{{ index + 1 }}</div>
            <div class="publish-info">
              <h4 class="publish-title">{{ post.title }}</h4>
              <div class="publish-tags">
                <span v-for="(tag, tIndex) in post.tags" :key="tIndex" class="publish-tag">{{ tag }}</span>
              </div>
              <div class="publish-stats">
                <span>👁️ {{ post.views }}</span>
                <span>❤️ {{ post.likes }}</span>
                <span>💬 {{ post.comments }}</span>
              </div>
            </div>
            <div class="publish-time">{{ post.time }}</div>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showProfile" class="publish-modal jc-overlay jc-overlay-profile" @click.self="showProfile = false">
      <div class="modal-content jc-modal-card">
        <div class="modal-header">
          <h2>👤 个人主页</h2>
          <button class="close-btn" @click="showProfile = false">×</button>
        </div>
        <div class="profile-content">
          <div class="profile-header">
            <img :src="currentUser.avatar" class="profile-avatar" />
            <div class="profile-info">
              <h3>{{ currentUser.name }}</h3>
              <p class="profile-title">求职者</p>
              <div class="profile-tags">
                <span class="profile-tag">计算机专业</span>
                <span class="profile-tag">应届毕业生</span>
              </div>
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-num">{{ myPublishedPosts.length }}</span>
              <span class="stat-text">发布</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ myCollectedPosts.length + myCollectedJobs.length }}</span>
              <span class="stat-text">收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ getTotalLikes }}</span>
              <span class="stat-text">获赞</span>
            </div>
          </div>
          <div class="profile-section">
            <h4>📝 最近发布</h4>
            <div v-if="myPublishedPosts.length === 0" class="empty-text">暂无发布内容</div>
            <div v-for="(post, index) in myPublishedPosts.slice(0, 3)" :key="index" class="mini-post" @click="openDetail('interview', post); showProfile = false">
              <span class="mini-title">{{ post.title }}</span>
              <span class="mini-meta">{{ post.comments }}评论 · {{ post.likes }}赞</span>
            </div>
          </div>
          <div class="profile-section">
            <h4>💾 最近收藏</h4>
            <div v-if="myCollectedPosts.length === 0 && myCollectedJobs.length === 0" class="empty-text">暂无收藏内容</div>
            <div v-for="(post, index) in myCollectedPosts.slice(0, 3)" :key="index" class="mini-post" @click="openDetail('interview', post); showProfile = false">
              <span class="mini-title">{{ post.title }}</span>
              <span class="mini-meta">{{ post.comments }}评论 · {{ post.likes }}赞</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showMyCollect" class="publish-modal jc-overlay" @click.self="showMyCollect = false">
      <div class="modal-content jc-modal-card">
        <div class="modal-header">
          <h2>💾 我的收藏</h2>
          <button class="close-btn" @click="showMyCollect = false">×</button>
        </div>
        <div class="collect-tabs">
          <span :class="{ active: collectTab === 'post' }" @click="collectTab = 'post'">面经帖子</span>
          <span :class="{ active: collectTab === 'job' }" @click="collectTab = 'job'">岗位</span>
        </div>
        <div class="collect-list">
          <template v-if="collectTab === 'post'">
            <div v-if="myCollectedPosts.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无收藏的面经帖子</p>
            </div>
            <div v-for="(post, index) in myCollectedPosts" :key="index" class="my-publish-item" @click="handleMyPublishClick('interview', post)">
              <div class="publish-rank">{{ index + 1 }}</div>
              <div class="publish-info">
                <h4 class="publish-title">{{ post.title }}</h4>
                <div class="publish-tags">
                  <span v-for="(tag, tIndex) in post.tags" :key="tIndex" class="publish-tag">{{ tag }}</span>
                </div>
                <div class="publish-stats">
                  <span>👁️ {{ post.views }}</span>
                  <span>❤️ {{ post.likes }}</span>
                  <span>💬 {{ post.comments }}</span>
                </div>
              </div>
              <button class="uncollect-btn" @click.stop="toggleCollect(post)">取消收藏</button>
            </div>
          </template>
          <template v-if="collectTab === 'job'">
            <div v-if="myCollectedJobs.length === 0" class="empty-state">
              <div class="empty-icon">💼</div>
              <p>暂无收藏的岗位</p>
            </div>
            <div v-for="(job, index) in myCollectedJobs" :key="index" class="my-publish-item" @click="handleMyPublishClick('job', job)">
              <div class="publish-rank">{{ index + 1 }}</div>
              <div class="publish-info">
                <h4 class="publish-title">{{ job.title }}</h4>
                <div class="publish-tags">
                  <span v-for="(tag, tIndex) in job.tags" :key="tIndex" class="publish-tag">{{ tag }}</span>
                </div>
                <div class="publish-stats">
                  <span>📍 {{ job.city }}</span>
                  <span>💰 {{ job.salary }}</span>
                </div>
              </div>
              <button class="uncollect-btn" @click.stop="toggleJobCollect(job)">取消收藏</button>
            </div>
          </template>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showMyApplies" class="publish-modal jc-overlay" @click.self="showMyApplies = false">
      <div class="modal-content jc-modal-card">
        <div class="modal-header">
          <h2>📋 我的投递</h2>
          <button class="close-btn" @click="showMyApplies = false">×</button>
        </div>
        <div class="my-publish-list">
          <div v-if="appliedJobs.length === 0" class="empty-state">
            <div class="empty-icon">📨</div>
            <p>暂无投递记录，快去投递心仪的岗位吧！</p>
            <button class="empty-btn" @click="showMyApplies = false; activeTab = 'job'">去看看岗位</button>
          </div>
          <div v-for="(job, index) in appliedJobs" :key="index" class="my-publish-item" @click="openDetail('job', job); showMyApplies = false">
            <div class="publish-rank">{{ index + 1 }}</div>
            <div class="publish-info">
              <h4 class="publish-title">{{ job.title }}</h4>
              <div class="publish-tags">
                <span v-for="(tag, tIndex) in job.tags" :key="tIndex" class="publish-tag">{{ tag }}</span>
              </div>
              <div class="publish-stats">
                <span>📍 {{ job.city }}</span>
                <span>💰 {{ job.salary }}</span>
                <span>🕒 {{ job.applyTime }}</span>
              </div>
            </div>
            <span class="applied-badge">已投递</span>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showSettings" class="publish-modal jc-overlay" @click.self="showSettings = false">
      <div class="modal-content jc-modal-card">
        <div class="modal-header">
          <h2>⚙️ 设置</h2>
          <button class="close-btn" @click="showSettings = false">×</button>
        </div>
        <div class="settings-content">
          <div class="settings-section">
            <h3>账号设置</h3>
            <div class="setting-item">
              <span class="setting-label">用户名</span>
              <input type="text" :value="currentUser.name" class="setting-input" />
            </div>
            <div class="setting-item">
              <span class="setting-label">密码</span>
              <input type="password" placeholder="修改密码" class="setting-input" />
            </div>
          </div>
          <div class="settings-section">
            <h3>通知设置</h3>
            <div class="setting-item">
              <span class="setting-label">接收评论通知</span>
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <span class="setting-label">接收点赞通知</span>
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <span class="setting-label">接收系统通知</span>
              <label class="toggle-switch">
                <input type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="settings-section">
            <h3>隐私设置</h3>
            <div class="setting-item">
              <span class="setting-label">公开个人主页</span>
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <span class="setting-label">允许私信</span>
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="settings-actions">
            <button class="save-btn">保存设置</button>
            <button class="cancel-btn" @click="showSettings = false">取消</button>
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showChat && chatTarget" class="chat-modal jc-overlay jc-overlay-chat" @click.self="showChat = false">
      <div class="chat-modal-content jc-modal-card">
        <div class="chat-modal-header">
          <div class="chat-modal-peer">
            <img :src="chatTarget.avatar" class="chat-modal-avatar" />
            <div>
              <div class="chat-modal-name">{{ chatTarget.name }}</div>
              <div class="chat-modal-status">{{ chatTarget.title }}</div>
            </div>
          </div>
          <button class="close-btn" @click="showChat = false">✕</button>
        </div>
        <div class="chat-modal-body">
          <div
            v-for="(msg, index) in chatMessages"
            :key="index"
            class="chat-msg"
            :class="{ mine: msg.from === 'me' }"
          >
            <div class="chat-bubble">{{ msg.content }}</div>
            <div class="chat-time">{{ msg.time }}</div>
          </div>
        </div>
        <div class="chat-modal-footer">
          <input
            v-model="chatInput"
            type="text"
            placeholder="输入消息..."
            class="chat-input"
            @keyup.enter="sendChatMessage"
          />
          <button class="chat-send-btn" @click="sendChatMessage">发送</button>
        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <div v-if="showGroupChat && groupChatTarget" class="group-chat-modal jc-overlay jc-overlay-group-chat" @click.self="showGroupChat = false">
      <div class="group-chat-modal-content jc-modal-card">
        <div class="group-chat-modal-header">
          <div class="group-chat-modal-peer">
            <div class="group-chat-modal-icon">{{ groupChatTarget.name.charAt(0) }}</div>
            <div>
              <div class="group-chat-modal-name">{{ groupChatTarget.name }}</div>
              <div class="group-chat-modal-status">{{ groupChatTarget.members }}成员 · 群聊</div>
            </div>
          </div>
          <button class="close-btn" @click="showGroupChat = false">✕</button>
        </div>
        <div class="group-chat-modal-body">
          <div
            v-for="(msg, index) in groupChatMessages"
            :key="index"
            class="group-chat-msg"
            :class="{ mine: msg.from === 'me' }"
          >
            <div class="group-chat-sender" v-if="msg.from !== 'me'">{{ msg.author }}</div>
            <div class="group-chat-bubble">{{ msg.content }}</div>
            <div class="group-chat-time">{{ msg.time }}</div>
          </div>
        </div>
        <div class="group-chat-modal-footer">
          <input
            v-model="groupChatInput"
            type="text"
            placeholder="在群聊中发言..."
            class="group-chat-input"
            @keyup.enter="sendGroupChatMessage"
          />
          <button class="group-chat-send-btn" @click="sendGroupChatMessage">发送</button>
        </div>
      </div>
    </div>
    </teleport>
    <!-- Toast 通知 -->
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuthInfo } from '@/utils/auth'
import { generateAvatar, generateGuestName, getRandomAvatar } from '@/utils/avatar'
import {
  fetchPosts, createPost, fetchQAs,
  fetchCollects, toggleLikeApi, toggleCollectApi, fetchUserStats,
  fetchGroups, createGroupApi, deleteGroupApi,
  fetchGroupMessages, sendGroupMessageApi,
  getUserGroups, createGroup, deleteGroup,
  getGroupMessages, addGroupMessage,
  saveChat, getChats, addChatMessage
} from '@/utils/communityStore'
let jobData = []
const dataTrigger = ref(0)

const router = useRouter()

const bgCanvas = ref(null)
const activeTab = ref('interview')
const filterType = ref('hot')
const jobFilter = ref('all')
const qaFilter = ref('all')
const showPointsRule = ref(false)
const searchQuery = ref('')
const searchHistory = ref([])
const showDetail = ref(false)
const detailType = ref('')
const detailData = ref({})
const showUserMenu = ref(false)
const showCommentModal = ref(false)
const showPublishModal = ref(false)
const showMyPublish = ref(false)
const showMyCollect = ref(false)
const showMyApplies = ref(false)
const showSettings = ref(false)
const showProfile = ref(false)
const showUserProfile = ref(false)
const userProfileData = ref(null)
const userProfileTab = ref('posts')
const showTopicDetail = ref(false)
const currentTopic = ref(null)
const showChat = ref(false)
const chatTarget = ref(null)
const chatMessages = ref([])
const chatInput = ref('')
const showGroupChat = ref(false)
const groupChatTarget = ref(null)
const groupChatMessages = ref([])
const groupChatInput = ref('')
const showCreateGroupModal = ref(false)
const createGroupForm = ref({ name: '', desc: '' })
const createGroupErr = ref('')
const appliedJobs = ref([])
const commentText = ref('')
const newComment = ref('')
const currentCommentItem = ref(null)
const appliedJobIds = ref(new Set())
const collectTab = ref('post')
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

// ========== 弹窗 body 滚动锁 + 结构保障 ==========
// 只要有任意 modal 打开，就锁死 body 滚动，避免页面跟随滚动、fixed 定位偏移
const anyModalOpen = computed(() =>
  showDetail.value || showCommentModal.value || showPublishModal.value ||
  showMyPublish.value || showMyCollect.value || showMyApplies.value ||
  showSettings.value || showProfile.value || showUserProfile.value ||
  showTopicDetail.value || showChat.value || showGroupChat.value ||
  showCreateGroupModal.value
)
let _bodyScrollLockCount = 0
const _prevBodyOverflow = { overflow: '', overflowX: '', overflowY: '', position: '', top: '', width: '' }
const lockBodyScroll = () => {
  if (typeof document === 'undefined') return
  _bodyScrollLockCount++
  if (_bodyScrollLockCount === 1) {
    const b = document.body
    _prevBodyOverflow.overflow = b.style.overflow
    _prevBodyOverflow.overflowX = b.style.overflowX
    _prevBodyOverflow.overflowY = b.style.overflowY
    _prevBodyOverflow.position = b.style.position
    _prevBodyOverflow.top = b.style.top
    _prevBodyOverflow.width = b.style.width
    const scrollY = window.scrollY || window.pageYOffset || 0
    // 锁定后页面不再会出现滚动条闪烁
    b.dataset.scrollY = String(scrollY)
    b.style.overflow = 'hidden'
    b.style.overflowX = 'hidden'
    b.style.overflowY = 'hidden'
    b.style.position = 'fixed'
    b.style.top = -scrollY + 'px'
    b.style.width = '100%'
  }
}
const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return
  if (_bodyScrollLockCount <= 0) return
  _bodyScrollLockCount--
  if (_bodyScrollLockCount === 0) {
    const b = document.body
    const scrollY = Number(b.dataset.scrollY || 0) || 0
    b.style.overflow = _prevBodyOverflow.overflow
    b.style.overflowX = _prevBodyOverflow.overflowX
    b.style.overflowY = _prevBodyOverflow.overflowY
    b.style.position = _prevBodyOverflow.position
    b.style.top = _prevBodyOverflow.top
    b.style.width = _prevBodyOverflow.width
    delete b.dataset.scrollY
    // 恢复原先滚动位置，确保不会回到顶部
    window.scrollTo(0, scrollY)
  }
}
// 监听任何一个弹窗的开/关
watch(anyModalOpen, (open) => {
  if (open) lockBodyScroll()
  else unlockBodyScroll()
})
// 兜底：组件离开时解锁
const _jcOnUnmountedUnlock = () => {
  if (_bodyScrollLockCount > 0) {
    _bodyScrollLockCount = 1
    unlockBodyScroll()
  }
}
const followedQuestionIds = ref(new Set())
const followedUsers = ref(new Set())
const joinedGroupIds = ref(new Set())
const jobCurrentPage = ref(1)
const jobPageSize = ref(20)
const interviewCurrentPage = ref(1)
const interviewPageSize = ref(5)
const qaCurrentPage = ref(1)
const qaPageSize = ref(5)
const jobTotalPages = computed(() => Math.ceil(paginatedFilteredJobs.value.length / jobPageSize.value))

const getUserScopedKey = (baseKey) => {
  const auth = getAuthInfo()
  if (auth && auth.userId) {
    return `${baseKey}_${auth.userId}`
  }
  return `${baseKey}_guest`
}

const loadPersistedState = () => {
  try {
    console.log('[加载持久化] 开始加载localStorage数据...')
    
    const applied = JSON.parse(localStorage.getItem(getUserScopedKey('jc_appliedJobs')) || '[]')
    appliedJobs.value = applied
    appliedJobIds.value = new Set(applied.map(j => j.id))
    console.log('[加载持久化] 投递记录:', applied.length, '条')
    
    const followed = JSON.parse(localStorage.getItem(getUserScopedKey('jc_followedQuestions')) || '[]')
    followedQuestionIds.value = new Set(followed)
    console.log('[加载持久化] 关注问题:', followed.length, '条')
    
    const followedUsersData = JSON.parse(localStorage.getItem(getUserScopedKey('jc_followedUsers')) || '[]')
    followedUsers.value = new Set(followedUsersData)
    console.log('[加载持久化] 关注用户:', followedUsersData.length, '条')
    
    const joinedGroups = JSON.parse(localStorage.getItem(getUserScopedKey('jc_joinedGroups')) || '[]')
    joinedGroupIds.value = new Set(joinedGroups)
    console.log('[加载持久化] 已加入小组:', joinedGroups.length, '条')
    
    const collectedPosts = JSON.parse(localStorage.getItem(getUserScopedKey('jc_collectedPosts')) || '[]')
    collectedPosts.forEach(title => {
      const post = hotInterviews.value.find(i => i.title === title)
      if (post) post.collected = true
    })
    console.log('[加载持久化] 收藏帖子:', collectedPosts.length, '条')
    
    const collectedJobs = JSON.parse(localStorage.getItem(getUserScopedKey('jc_collectedJobs')) || '[]')
    collectedJobs.forEach(id => {
      const job = realJobs.value.find(j => j.id === id)
      if (job) job.collected = true
    })
    console.log('[加载持久化] 收藏岗位:', collectedJobs.length, '条')

    const publishedData = JSON.parse(localStorage.getItem(getUserScopedKey('jc_publishedPosts')) || '[]')
    console.log('[加载持久化] 已发布帖子:', publishedData.length, '篇，准备恢复...')
    let restoredCount = 0
    publishedData.forEach(post => {
      if (!hotInterviews.value.find(i => i.title === post.title && i.isUserPublished)) {
        // 修正旧的publishScore值，确保不会过高
        if (post.publishScore && post.publishScore > 100) {
          post.publishScore = 30
        }
        hotInterviews.value.unshift(post)
        restoredCount++
      }
    })
    console.log('[加载持久化] 实际恢复帖子:', restoredCount, '篇')
    console.log('[加载持久化] 加载完成，hotInterviews当前长度:', hotInterviews.value.length)
  } catch (e) {
    console.warn('[加载持久化] 加载失败:', e)
  }
}

const persistAppliedJobs = () => {
  localStorage.setItem(getUserScopedKey('jc_appliedJobs'), JSON.stringify(appliedJobs.value))
}
const persistFollowedQuestions = () => {
  localStorage.setItem(getUserScopedKey('jc_followedQuestions'), JSON.stringify([...followedQuestionIds.value]))
}
const persistFollowedUsers = () => {
  localStorage.setItem(getUserScopedKey('jc_followedUsers'), JSON.stringify([...followedUsers.value]))
}
const persistJoinedGroups = () => {
  localStorage.setItem(getUserScopedKey('jc_joinedGroups'), JSON.stringify([...joinedGroupIds.value]))
}
const persistCollectedPosts = () => {
  const titles = hotInterviews.value.filter(i => i.collected).map(i => i.title)
  localStorage.setItem(getUserScopedKey('jc_collectedPosts'), JSON.stringify(titles))
}
const persistCollectedJobs = () => {
  const ids = realJobs.value.filter(j => j.collected).map(j => j.id)
  localStorage.setItem(getUserScopedKey('jc_collectedJobs'), JSON.stringify(ids))
}

const publishForm = ref({
  title: '',
  tags: [],
  tagInput: '',
  content: ''
})

const loadCurrentUser = () => {
  const auth = getAuthInfo()
  if (auth) {
    const displayName = auth.name || auth.username || auth.email || '用户'
    currentUser.value = {
      name: displayName,
      avatar: generateAvatar(displayName),
      role: auth.role || 'user',
      loginType: auth.loginType
    }
  } else {
    // 游客模式或未登录 - 为每个游客生成唯一名称和头像
    const guestName = generateGuestName()
    currentUser.value = {
      name: guestName,
      avatar: generateAvatar(guestName),
      role: 'guest',
      loginType: 'guest'
    }
  }
}

const currentUser = ref({
  name: '加载中...',
  avatar: getRandomAvatar()
})

const extractTags = (jobName) => {
  const tags = []
  const techKeywords = {
    '前端': ['前端', 'web', 'h5', 'vue', 'react', 'javascript', 'html', 'css'],
    '后端': ['后端', 'server', 'java', 'python', 'node', 'php', 'go'],
    '算法': ['算法', 'ai', '机器学习', '深度学习', 'nlp', '推荐'],
    '测试': ['测试', '自动化', 'qa', '质量'],
    '运维': ['运维', 'devops', 'docker', 'kubernetes'],
    '硬件': ['硬件', '维护', 'pc', '电脑'],
    '网络': ['网络', '工程师', 'tcp', 'ip'],
    '教师': ['教师', '老师', '教学', '教育']
  }
  for (const [tag, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(kw => jobName.includes(kw))) {
      tags.push(tag)
    }
  }
  if (tags.length === 0) tags.push('计算机')
  return tags.slice(0, 3)
}

const formatSalary = (salary) => {
  if (!salary) return '面议'
  let actualSalary = salary
  if (salary < 500) {
    actualSalary = salary * 100
  }
  if (actualSalary >= 1000) {
    const k = actualSalary / 1000
    return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K'
  }
  return actualSalary + ''
}

// 根据岗位真实信息生成匹配的职责与要求（不再使用"负责相关技术开发"之类的通用模板）
const buildJobDescription = (job) => {
  if (!job) return { duties: [], requirements: [], highlights: [] }
  const title = (job.title || job.job_name || '').toString().toLowerCase()
  const tags = Array.isArray(job.tags) ? job.tags.map(t => t.toString().toLowerCase()) : []
  const isTeacher = title.includes('教师') || title.includes('老师') || title.includes('教学') || title.includes('教育') || tags.includes('教师')
  const isFrontend = title.includes('前端') || title.includes('vue') || title.includes('react') || title.includes('html') || title.includes('javascript') || title.includes('h5') || tags.includes('前端')
  const isBackend = title.includes('后端') || title.includes('java') || title.includes('python') || title.includes('node') || title.includes('go') || title.includes('php') || title.includes('服务端') || tags.includes('后端')
  const isAlgo = title.includes('算法') || title.includes('ai') || title.includes('机器学习') || title.includes('深度学习') || title.includes('nlp') || title.includes('推荐') || tags.includes('算法')
  const isTest = title.includes('测试') || title.includes('qa') || title.includes('自动化') || title.includes('质量') || tags.includes('测试')
  const isOps = title.includes('运维') || title.includes('devops') || title.includes('docker') || title.includes('k8s') || title.includes('linux') || tags.includes('运维')
  const isHardware = title.includes('硬件') || title.includes('维护') || title.includes('pc') || title.includes('电脑') || tags.includes('硬件')
  const isNet = title.includes('网络') || title.includes('tcp') || title.includes('ip') || title.includes('路由器') || title.includes('交换') || tags.includes('网络')
  const isFpga = title.includes('fpga') || title.includes('芯片') || title.includes('集成电路') || title.includes('ic设计')
  const isData = title.includes('数据分析') || title.includes('数据挖掘') || title.includes('大数据') || title.includes('bi')
  const isMobile = title.includes('android') || title.includes('安卓') || title.includes('ios') || title.includes('移动端') || title.includes('flutter')
  const isTrainee = title.includes('应届') || title.includes('实习') || title.includes('校招') || title.includes('培训') || (job.experience && (job.experience + '').includes('经验不限'))
  const expText = (job.experience || job.work_exp || '').toString()
  const eduText = (job.education || '').toString()

  // 通用亮点
  const highlights = [
    `工作地点：${job.city || '全国可协调'}`,
    `经验要求：${expText || '不限'}`,
    `学历要求：${eduText || '不限'}`,
    `薪酬范围：${job.salary || '面议'}`
  ]

  let duties = []
  let requirements = []

  if (isTeacher) {
    duties = [
      '负责对应学科的课堂教学与课程设计，按照教学大纲完成授课任务',
      '指导学生实验、项目实践与课程设计，参与学生作业批改与答疑辅导',
      '参与教学研讨、教材编写与课程优化，推动教学方法改进',
      '参与学生学业评估、考试命题及教学效果跟踪反馈，确保教学质量达标',
      '配合学院完成学科建设、专业认证、招生宣讲等相关工作'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，${tags.length ? tags.join('/') : '计算机/教育学相关'}专业背景`,
      '具备扎实的专业知识储备，熟悉对应方向的主流理论与实践方法',
      '持有教师资格证或有教育培训行业经历者优先考虑',
      '具备良好的表达沟通能力与课堂节奏把控能力，有责任心与耐心',
      expText && !expText.includes('不限') ? `${expText}相关教学或企业实践经验` : '欢迎应届生、优秀在校硕士投递'
    ]
  } else if (isFrontend) {
    duties = [
      '负责公司 Web/H5 产品的前端页面开发，输出高质量、可维护的前端代码',
      '使用 Vue / React 等框架完成组件封装、状态管理与性能优化',
      '与 UI 设计师、后端工程师紧密协作，确保页面还原度与交互一致性',
      '参与前端工程化建设：构建工具、代码规范、CI/CD 流程优化',
      '跟进前端新技术与业界方案，推动团队技术能力持续升级'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，计算机/软件工程等相关专业`,
      '扎实掌握 HTML/CSS/JavaScript，熟悉主流浏览器兼容机制',
      `熟练掌握 ${tags.includes('Vue') ? 'Vue' : (tags.includes('React') ? 'React' : 'Vue 或 React')} 及相关生态`,
      '熟悉 Webpack/Vite 等构建工具与常用调试工具',
      expText && !expText.includes('不限') ? `${expText}前端实际项目开发经验` : '有完整项目经历优先'
    ]
  } else if (isBackend) {
    duties = [
      '负责公司业务系统的服务端设计、开发与优化，保障接口高可用与高性能',
      '进行数据库建模、接口设计与缓存方案落地，支撑业务快速迭代',
      '与前端、测试、运维团队协作，完成需求交付与线上问题排查',
      '参与微服务架构、中间件选型、容灾方案等基础设施建设',
      '进行代码评审、技术方案设计与文档沉淀，提升团队研发质量'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，计算机/软件工程等相关专业`,
      `熟练掌握 ${tags.filter(t => ['Java','Python','Node','Go','PHP'].includes(t)).join('/') || 'Java / Python / Node / Go 至少一种'} 后端语言与主流框架`,
      '熟悉 MySQL/Redis/MQ 等常用存储与中间件，具备基础 SQL 性能优化能力',
      '了解常见设计模式、分布式基础与 HTTP/RESTful API 规范',
      expText && !expText.includes('不限') ? `${expText}后端开发经验，有完整项目上线经历` : '有完整项目经历者优先'
    ]
  } else if (isAlgo) {
    duties = [
      '参与算法模型研发：数据清洗、特征工程、模型训练、效果评估与优化迭代',
      '跟踪业界前沿研究成果（AI / NLP / CV / 推荐 / 大模型等方向）并结合业务落地',
      '与工程团队协作完成模型部署、推理服务化与效果 AB 实验',
      '解决实际业务问题：搜索排序、推荐召回、文本分析、CV识别等场景',
      '沉淀技术文档、方案与可复用组件，提升团队算法能力'
    ]
    requirements = [
      `${eduText || '硕士'}及以上学历，计算机/数学/统计学等相关专业优先`,
      '熟练掌握 Python 与主流框架（PyTorch / TensorFlow / Scikit-learn 等）',
      '扎实的机器学习/深度学习基础，熟悉常见算法原理与调优方法',
      '熟悉至少一个细分方向：NLP / CV / 推荐系统 / 大模型微调',
      '具备良好的数学基础与英文文献阅读能力'
    ]
  } else if (isTest) {
    duties = [
      '负责公司产品的功能测试、接口测试与自动化测试，保障交付质量',
      '设计测试用例、搭建测试环境、执行回归测试并输出测试报告',
      '定位产品缺陷，协助研发团队复现、跟踪并关闭问题',
      '参与 CI/CD 流水线建设，落地自动化测试脚本提升效率',
      '参与需求评审，输出可测性分析与测试风险评估'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，计算机相关专业`,
      '熟悉软件测试理论与流程，能独立编写测试用例与测试报告',
      '了解 HTTP、数据库基础，能独立进行接口测试（Postman / JMeter 等）',
      '有自动化测试经验（Selenium / Appium / JUnit / Pytest）优先',
      expText && !expText.includes('不限') ? `${expText}测试工作经验` : '欢迎热爱质量工作的应届生'
    ]
  } else if (isOps) {
    duties = [
      '负责公司线上服务的部署、监控、告警与故障处理，保障系统稳定运行',
      '建设 DevOps 流水线：编译、打包、制品管理与自动发布',
      '管理 Linux 服务器、容器（Docker / K8s）与网络基础设施',
      '优化数据库、缓存、消息队列等中间件配置与性能',
      '推进运维自动化工具与运维文档建设，降低人工成本与故障风险'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，计算机相关专业`,
      '熟悉 Linux 系统及常用命令，具备 Shell / Python 脚本编写能力',
      '了解 Docker / K8s 与 CI/CD 体系，有实际部署经验优先',
      '熟悉 Nginx / MySQL / Redis / MQ 等常见服务的配置与运维',
      '具备良好的故障诊断意识与抗压能力，能独立处理线上突发问题'
    ]
  } else if (isHardware) {
    duties = [
      '负责计算机及相关硬件设备的日常维护、故障排查与维修更换',
      '进行办公电脑、打印机、网络设备的配置、安装与资产管理',
      '协助进行机房环境、服务器与存储设备的巡检与维护',
      '配合 IT 团队完成桌面支持与员工 IT 问题处理',
      '记录并整理维护报告、资产清单与备品备件台账'
    ]
    requirements = [
      `${eduText || '大专'}及以上学历，计算机/电子工程相关专业优先`,
      '熟悉 PC 硬件组成，具备独立装机、故障定位与维修能力',
      '了解 Windows 操作系统、常用办公软件与基础网络配置',
      '动手能力强，耐心细致，具备良好的客户服务意识',
      expText && !expText.includes('不限') ? `${expText}硬件维护/桌面运维经验` : '有计算机组装维修经历者优先'
    ]
  } else if (isData) {
    duties = [
      '根据业务需求完成数据提取、清洗、转换与可视化分析报告',
      '搭建业务指标体系与 BI 看板，支持经营决策与业务监控',
      '与数据仓库团队协作，参与数据模型与数据口径建设',
      '通过数据分析发现业务问题，并提出可落地的优化建议',
      '沉淀分析方法论、指标字典与数据资产文档'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，统计学/数学/计算机等相关专业优先`,
      '熟练使用 SQL，具备复杂查询与性能调优能力',
      '掌握至少一种数据分析工具：Python(Pandas) / R / Excel / BI(Tableau/FineBI)',
      '具备良好的商业理解能力、逻辑思维与表达沟通能力',
      '有数据分析项目实战经验者优先'
    ]
  } else if (isFpga) {
    duties = [
      '参与 FPGA / 芯片相关模块的设计、RTL 编码、仿真与验证',
      '配合算法工程师完成模型落地、时序分析与资源优化',
      '进行板级调试、问题定位与固件版本迭代',
      '撰写设计文档、验证方案与测试报告，保障交付质量',
      '跟进器件选型、与硬件团队协同完成方案评审'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，微电子/通信/计算机/电子工程等相关专业`,
      '掌握 Verilog / VHDL，熟悉 FPGA 开发流程与常用工具（Vivado / Quartus / Modelsim 等）',
      '了解时序约束、STA 分析与常见接口协议（AXI / DDR / PCIe / Ethernet 等）',
      '有实际项目流片或板级调试经验者优先',
      '具备良好的英文阅读能力与文档撰写习惯'
    ]
  } else if (isMobile) {
    duties = [
      '负责 Android/iOS 移动端 App 的开发、迭代与维护',
      '实现 UI 页面、网络通信、数据存储与性能优化',
      '与产品、设计、测试团队协作，保证交付质量与用户体验',
      '参与移动端架构设计、组件化与工程化建设',
      '跟进新技术调研、预研与落地实践'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，计算机相关专业`,
      `熟练掌握 ${title.includes('android') || title.includes('安卓') ? 'Kotlin/Java + Android SDK' : (title.includes('ios') ? 'Swift/Objective-C + iOS SDK' : 'Android/iOS 任一方向')}`,
      '熟悉移动端性能优化、版本管理与打包发布流程',
      '了解常见移动端框架（Flutter/React Native）者优先',
      expText && !expText.includes('不限') ? `${expText}移动端开发经验` : '有完整项目 App 上线经验优先'
    ]
  } else if (isNet) {
    duties = [
      '负责企业网络架构的设计、部署、运维与优化',
      '配置与管理路由器、交换机、防火墙、无线等网络设备',
      '进行网络监控、故障排查与应急响应，保障网络可用性',
      '参与网络安全策略制定、加固与等保合规相关工作',
      '输出网络架构文档、运维手册与变更记录'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，网络/通信/计算机相关专业优先`,
      '熟悉 TCP/IP 协议、OSPF/BGP/VLAN/VPN/STP 等常见网络技术',
      '有华为/华三/思科任一厂商设备配置经验，持有 HCIA/CCNA 及以上证书优先',
      '了解网络安全基础、防火墙策略与常见攻击防范',
      '具备独立分析与解决网络故障的能力'
    ]
  } else {
    // 通用方向（按标题关键词组织）
    const titleCore = job.title || job.job_name || '该岗位'
    duties = [
      `负责${titleCore}相关的需求分析、方案设计与交付实施工作`,
      '与产品、上下游技术团队协作，确保项目按计划高质量推进',
      `在${titleCore}方向进行问题定位、性能优化与稳定性保障`,
      '参与相关模块的文档编写、代码评审与经验沉淀',
      isTrainee ? '在导师指导下完成学习计划与成长目标，快速具备独立工作能力' : '持续关注领域内新技术，提出改进建议并推动落地'
    ]
    requirements = [
      `${eduText || '本科'}及以上学历，${tags.length ? tags.join('/') : '计算机相关'}专业背景`,
      `具备${titleCore}方向的基础知识与实践经验，理解行业常见技术方案`,
      expText && !expText.includes('不限') ? `要求${expText}相关工作经验` : '欢迎优秀应届生、有项目实习经历者优先投递',
      '良好的团队协作、沟通表达能力与问题分析能力',
      '有责任感，能够独立推进任务并交付结果'
    ]
  }

  // 应届生/实习加一条
  if (isTrainee) {
    requirements.push('提供转正机会 / 导师一对一辅导 / 定期技术分享与培训')
  }

  return { duties, requirements, highlights }
}

const realJobs = computed(() => {
  dataTrigger.value
  if (!jobData || jobData.length === 0) return []
  return jobData.map((job, index) => {
    // 处理公司名称，过滤掉爬虫异常数据
    let company = job.company
    if (!company || company.includes('立即投递') || company.includes('收藏') || company.length < 2) {
      const dataSource = job.data_source || ''
      if (dataSource.includes('智联')) {
        company = '智联招聘合作企业'
      } else if (dataSource.includes('前程无忧')) {
        company = '前程无忧合作企业'
      } else if (dataSource.includes('BOSS')) {
        company = 'BOSS直聘合作企业'
      } else {
        company = '知名企业'
      }
    }
    return {
      id: job.id !== undefined ? job.id : index,
      title: job.job_name,
      company,
      city: job.city,
      salary: formatSalary(job.salary_avg),
      salary_avg: job.salary_avg,
      experience: job.work_exp,
      education: job.education,
      tags: extractTags(job.job_name),
      campus: job.work_exp === '经验不限' || job.job_name.includes('应届') || job.job_name.includes('实习') || job.job_name.includes('校招'),
      collected: false,
      applied: false
    }
  })
})

const stats = computed(() => ({
  interviews: hotInterviews.value.length.toLocaleString(),
  jobs: realJobs.value.length.toLocaleString(),
  questions: qaList.value.length.toLocaleString(),
  online: onlineUsers.value.length.toLocaleString()
}))
const hotKeywords = ['前端', '后端', '算法', 'Java', 'Vue', 'React', '校招', '秋招', '转行', '实习']

const goBack = () => { router.push('/dashboard') }

const hotInterviews = ref([])

const qaList = ref([])

// 小组：用户自建群 + 真实岗位数据聚合的技术分类
const userCreatedGroups = ref([])

const groupList = computed(() => {
  // 从真实岗位数据聚合出的技术方向（保留，作为"官方"群）
  const official = {}
  if (realJobs.value.length > 0) {
    realJobs.value.forEach(job => {
      (job.tags || []).forEach(tag => {
        if (!official[tag]) official[tag] = { name: tag, members: 0, posts: 0, joined: false }
        official[tag].members++
      })
    })
  }
  const descMap = {
    '前端': 'Vue/React/TypeScript 前端技术交流',
    '后端': 'Java/Python/Go 后端架构讨论',
    '算法': '机器学习/深度学习/推荐算法',
    '测试': '自动化测试/性能测试/TestOps',
    '运维': 'Docker/K8s/CI/CD 运维实践',
    '计算机': '基础技术/通用问题讨论',
    '网络': '网络协议/路由交换/安全'
  }
  const officialList = Object.values(official)
    .filter(g => g.members >= 10)
    .sort((a, b) => b.members - a.members)
    .slice(0, 8)
    .map(g => ({
      ...g,
      desc: descMap[g.name] || `${g.name}方向岗位讨论`,
      joined: joinedGroupIds.value.has(g.name),
      isUserCreated: false
    }))

  // 合并用户自建群（用户自建排前面）
  const merged = [
    ...userCreatedGroups.value.map(g => ({
      ...g,
      joined: joinedGroupIds.value.has(g.name),
      isUserCreated: true
    })),
    ...officialList.filter(o => !userCreatedGroups.value.some(u => u.name === o.name))
  ]
  return merged
})

// 在线用户：只有当前登录用户（没有多人实时在线系统）
const onlineUsers = computed(() => {
  const u = currentUser.value
  if (!u || u.name === '加载中...') return []
  return [{ name: u.name, avatar: u.avatar }]
})

// 热门话题：从真实岗位数据聚合出高频技术关键词
const hotTopics = computed(() => {
  if (!jobData || jobData.length === 0) return []
  const allTags = []
  realJobs.value.forEach(job => {
    (job.tags || []).forEach(tag => allTags.push(tag))
  })
  const counts = {}
  allTags.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, posts: count }))
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 10)
})

// 推荐关注：没有真实推荐系统，显示为空
const recommendUsers = ref([])

const weeklyRank = computed(() => {
  const scoreMap = new Map()
  const addScore = (name, avatar, score) => {
    if (!name) return
    const cur = scoreMap.get(name) || { name, avatar: avatar || generateAvatar(name), score: 0 }
    cur.score += score
    if (!cur.avatar && avatar) cur.avatar = avatar
    scoreMap.set(name, cur)
  }
  hotInterviews.value.forEach(it => {
    const baseScore = (it.likes || 0) + (it.comments || 0) * 2 + Math.floor((it.views || 0) / 10)
    const publishBonus = it.isUserPublished ? 30 : 0
    addScore(it.author, it.avatar, baseScore + publishBonus)
  })
  qaList.value.forEach(qa => {
    addScore(qa.author, qa.avatar, (qa.answers || 0) * 5 + (qa.bestAnswer ? qa.bestAnswer.likes || 0 : 0))
    if (qa.bestAnswer) {
      addScore(qa.bestAnswer.author, qa.bestAnswer.avatar, qa.bestAnswer.likes || 0)
    }
  })
  const ranked = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  return ranked
})

// 群聊帖子：从真实帖子中筛选
const groupPosts = computed(() => {
  if (!hotInterviews.value.length) return []
  return hotInterviews.value
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3)
    .map(p => ({
      title: p.title,
      preview: p.preview,
      author: p.author,
      time: p.time,
      comments: p.comments || 0,
      likes: p.likes || 0
    }))
})

const filteredJobs = computed(() => {
  let result = realJobs.value
  if (jobFilter.value === 'campus') result = result.filter(j => j.campus)
  if (jobFilter.value === 'social') result = result.filter(j => !j.campus)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    result = result.filter(j => 
      (j.title && j.title.includes(query)) || (j.company && j.company.includes(query)) || 
      (j.city && j.city.includes(query)) || (j.tags && j.tags.some(t => t && t.includes(query)))
    )
  }
  return result
})

const paginatedFilteredJobs = computed(() => {
  const start = (jobCurrentPage.value - 1) * jobPageSize.value
  const end = start + jobPageSize.value
  return filteredJobs.value.slice(start, end)
})

const handlePageClick = (page) => {
  if (page === '...') return
  goToPage(Number(page))
}

const goToPage = (page) => {
  const total = Math.ceil(filteredJobs.value.length / jobPageSize.value)
  if (page >= 1 && page <= total) {
    jobCurrentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (jobCurrentPage.value > 1) {
    jobCurrentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  const total = Math.ceil(filteredJobs.value.length / jobPageSize.value)
  if (jobCurrentPage.value < total) {
    jobCurrentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const pageNumbers = computed(() => {
  const total = Math.ceil(filteredJobs.value.length / jobPageSize.value)
  const current = jobCurrentPage.value
  const pages = []
  const maxShow = 7
  
  if (total <= maxShow) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    let start = Math.max(1, current - 3)
    let end = Math.min(total, start + maxShow - 1)
    start = Math.max(1, end - maxShow + 1)
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total) {
      if (end < total - 1) pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

watch(searchQuery, () => { 
  jobCurrentPage.value = 1
  interviewCurrentPage.value = 1
  qaCurrentPage.value = 1
})
watch(jobFilter, () => { jobCurrentPage.value = 1 })
watch(filterType, () => { interviewCurrentPage.value = 1 })
watch(qaFilter, () => { qaCurrentPage.value = 1 })

const filteredQAs = computed(() => {
  let result = qaList.value
  if (qaFilter.value === 'unsolved') result = result.filter(q => !q.solved)
  if (qaFilter.value === 'solved') result = result.filter(q => q.solved)
  if (qaFilter.value === 'followed') result = result.filter(q => followedQuestionIds.value.has(q.title))
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    result = result.filter(q => 
      (q.title && q.title.includes(query)) || (q.author && q.author.includes(query)) || 
      (q.tags && q.tags.some(t => t && t.includes(query)))
    )
  }
  return result
})

const myPublishedPosts = computed(() => {
  return hotInterviews.value.filter(i => i.author === currentUser.value.name)
})

const myCollectedPosts = computed(() => {
  return hotInterviews.value.filter(i => i.collected)
})

const myCollectedJobs = computed(() => {
  return realJobs.value.filter(j => j.collected)
})

const getTotalLikes = computed(() => {
  return myPublishedPosts.value.reduce((sum, post) => sum + post.likes, 0)
})

const filteredInterviews = computed(() => {
  let result = hotInterviews.value
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    result = result.filter(i => 
      (i.title && i.title.includes(query)) || (i.author && i.author.includes(query)) || 
      (i.tags && i.tags.some(t => t && t.includes(query)))
    )
  }
  if (filterType.value === 'hot') {
    // 综合热度排序：点赞×1 + 评论×2 + 浏览÷10，新帖有微弱时间加权但不会超过有互动的帖子
    result = [...result].sort((a, b) => {
      const scoreA = (a.likes || 0) + (a.comments || 0) * 2 + Math.floor((a.views || 0) / 10) + (a.time === '刚刚' ? 1 : 0)
      const scoreB = (b.likes || 0) + (b.comments || 0) * 2 + Math.floor((b.views || 0) / 10) + (b.time === '刚刚' ? 1 : 0)
      return scoreB - scoreA
    })
  } else {
    result = [...result].sort((a, b) => {
      const timeA = a.time.includes('刚刚') ? 0 : a.time.includes('分钟') ? parseInt(a.time) : a.time.includes('小时') ? parseInt(a.time) * 60 : 1000
      const timeB = b.time.includes('刚刚') ? 0 : b.time.includes('分钟') ? parseInt(b.time) : b.time.includes('小时') ? parseInt(b.time) * 60 : 1000
      return timeA - timeB
    })
  }
  return result
})

// 热门精选：仅"最热"模式下展示前5条作为精选区，严格按点赞数排序
const hotFeaturedInterviews = computed(() => {
  if (filterType.value !== 'hot' || searchQuery.value.trim()) return []
  return [...filteredInterviews.value].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)
})

// 面经分页数据：去除热门精选后剩余部分分页，也按点赞数排序
const paginatedInterviews = computed(() => {
  let list = filteredInterviews.value
  if (filterType.value === 'hot' && !searchQuery.value.trim()) {
    list = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    list = list.slice(5)
  }
  const start = (interviewCurrentPage.value - 1) * interviewPageSize.value
  const end = start + interviewPageSize.value
  return list.slice(start, end)
})

// 面经总页数（基于去除热门精选后的列表）
const interviewTotalPages = computed(() => {
  let total = filteredInterviews.value.length
  if (filterType.value === 'hot' && !searchQuery.value.trim()) {
    total = Math.max(0, total - 5)
  }
  return Math.max(1, Math.ceil(total / interviewPageSize.value))
})
const interviewRemainingCount = computed(() => {
  let total = filteredInterviews.value.length
  if (filterType.value === 'hot' && !searchQuery.value.trim()) {
    total = Math.max(0, total - 5)
  }
  return total
})

// 面积分页按钮数字
const interviewPageNumbers = computed(() => {
  const total = interviewTotalPages.value
  const current = interviewCurrentPage.value
  const pages = []
  const maxShow = 7
  if (total <= maxShow) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    let start = Math.max(1, current - 3)
    let end = Math.min(total, start + maxShow - 1)
    start = Math.max(1, end - maxShow + 1)
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total) {
      if (end < total - 1) pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const handleInterviewPageClick = (page) => {
  if (page === '...') return
  goToInterviewPage(Number(page))
}

const goToInterviewPage = (page) => {
  const total = interviewTotalPages.value
  if (page >= 1 && page <= total) {
    interviewCurrentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevInterviewPage = () => {
  if (interviewCurrentPage.value > 1) {
    interviewCurrentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextInterviewPage = () => {
  const total = interviewTotalPages.value
  if (interviewCurrentPage.value < total) {
    interviewCurrentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 问答分页数据
const paginatedQAs = computed(() => {
  const start = (qaCurrentPage.value - 1) * qaPageSize.value
  const end = start + qaPageSize.value
  return filteredQAs.value.slice(start, end)
})

const qaTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredQAs.value.length / qaPageSize.value))
})

const qaPageNumbers = computed(() => {
  const total = qaTotalPages.value
  const current = qaCurrentPage.value
  const pages = []
  const maxShow = 7
  if (total <= maxShow) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    let start = Math.max(1, current - 3)
    let end = Math.min(total, start + maxShow - 1)
    start = Math.max(1, end - maxShow + 1)
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total) {
      if (end < total - 1) pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const handleQaPageClick = (page) => {
  if (page === '...') return
  goToQaPage(Number(page))
}

const goToQaPage = (page) => {
  const total = qaTotalPages.value
  if (page >= 1 && page <= total) {
    qaCurrentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevQaPage = () => {
  if (qaCurrentPage.value > 1) {
    qaCurrentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextQaPage = () => {
  const total = qaTotalPages.value
  if (qaCurrentPage.value < total) {
    qaCurrentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const topicRelatedPosts = computed(() => {
  if (!currentTopic.value) return []
  const relatedKeywords = currentTopic.value.related
  // 先按相关度筛选，再按综合热度（点赞×1 + 评论×2 + 浏览÷10）降序排序，取前10条
  return hotInterviews.value.filter(post =>
    post.title.includes(currentTopic.value.name) ||
    post.tags.some(tag => relatedKeywords.includes(tag)) ||
    relatedKeywords.some(kw => post.title.includes(kw))
  ).sort((a, b) => {
    const scoreA = (a.likes || 0) + (a.comments || 0) * 2 + Math.floor((a.views || 0) / 10)
    const scoreB = (b.likes || 0) + (b.comments || 0) * 2 + Math.floor((b.views || 0) / 10)
    return scoreB - scoreA
  }).slice(0, 10)
})

const openTopicDetail = (topic) => {
  currentTopic.value = topic
  showTopicDetail.value = true
}

const closeTopicDetail = () => {
  showTopicDetail.value = false
  currentTopic.value = null
}

const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

const activeAuthors = ['求职者小王', '技术达人', '应届生小李']
const getOnlineStatus = (author) => {
  return activeAuthors.includes(author) ? 'online' : 'offline'
}

const toggleLike = async (item) => {
  const username = currentUser.value?.name || 'guest'
  const itemId = item.id || item._id || item.title
  const liked = await toggleLikeApi(username, itemId, 'post')
  item.liked = liked
  item.likes = Math.max(0, (item.likes || 0) + (liked ? 1 : -1))
}

const toggleCollect = async (item) => {
  const username = currentUser.value?.name || 'guest'
  const itemId = item.id || item._id || item.title
  const itemType = 'post'
  const collected = await toggleCollectApi(username, itemId, itemType)
  item.collected = collected
  persistCollectedPosts()
  showToast(collected ? '已收藏到我的收藏' : '已取消收藏', 'success')
}
const handleMyPublishClick = (type, item) => {
  openDetail(type, item)
  showMyCollect.value = false
}

const toggleJobCollect = (job) => {
  job.collected = !job.collected
  persistCollectedJobs()
  showToast(job.collected ? '岗位已收藏' : '已取消收藏', 'success')
}

const toggleCommentLike = (comment) => {
  if (comment.liked) {
    comment.likes--
    comment.liked = false
  } else {
    comment.likes++
    comment.liked = true
  }
}

const toggleAnswerLike = (qa) => {
  if (qa.bestAnswer.liked) {
    qa.bestAnswer.likes--
    qa.bestAnswer.liked = false
  } else {
    qa.bestAnswer.likes++
    qa.bestAnswer.liked = true
  }
}

const openCommentModal = (item) => {
  currentCommentItem.value = item
  showCommentModal.value = true
}

const closeCommentModal = () => {
  showCommentModal.value = false
  commentText.value = ''
  currentCommentItem.value = null
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  if (currentCommentItem.value) {
    currentCommentItem.value.comments++
    currentCommentItem.value.commentList.push({
      author: currentUser.value.name,
      avatar: currentUser.value.avatar,
      time: '刚刚',
      content: commentText.value,
      likes: 0,
      liked: false
    })
  }
  
  closeCommentModal()
}

const submitCommentFromDetail = () => {
  if (!newComment.value.trim()) return
  
  detailData.value.comments++
  detailData.value.commentList.push({
    author: currentUser.value.name,
    avatar: currentUser.value.avatar,
    time: '刚刚',
    content: newComment.value,
    likes: 0,
    liked: false
  })
  newComment.value = ''
}

const submitAnswer = () => {
  if (!newComment.value.trim()) return

  if (!detailData.value.answerList) {
    detailData.value.answerList = []
  }
  detailData.value.answerList.push({
    author: currentUser.value.name,
    avatar: currentUser.value.avatar,
    time: '刚刚',
    content: newComment.value,
    likes: 0,
    liked: false
  })
  detailData.value.answers++
  newComment.value = ''
}

const markAsSolved = (qa) => {
  qa.solved = true
}

const shareItem = (item) => {
  const url = window.location.href + '?id=' + encodeURIComponent(item.title)
  navigator.clipboard.writeText(url).then(() => {
    alert('分享链接已复制到剪贴板！')
  })
}

const openDetail = (type, data) => {
  detailType.value = type
  detailData.value = data
  showDetail.value = true
  if (data && typeof data.views === 'number') {
    data.views++
  }
  if (type === 'qa' && data && !data.answerList) {
    data.answerList = data.bestAnswer ? [{ ...data.bestAnswer }] : []
  }
  // 打开弹窗后重置页面滚动，避免内容从半截开始
  nextTick(() => {
    const modalEl = document.querySelector('.detail-modal .modal-content')
    if (modalEl) modalEl.scrollTop = 0
  })
}

// 岗位详情的动态内容（根据岗位类型、经验、学历生成）
const jobDetailContent = computed(() => {
  if (detailType.value !== 'job' || !detailData.value) return { duties: [], requirements: [], highlights: [] }
  return buildJobDescription(detailData.value)
})

// 从话题弹窗打开详情时，先关闭话题弹窗确保详情不被遮挡
const openDetailFromTopic = (type, data) => {
  closeTopicDetail()
  closeUserProfile()
  openDetail(type, data)
}

// 计算帖子综合热度分数
const computeHeat = (post) => {
  if (!post) return 0
  return (post.likes || 0) + (post.comments || 0) * 2 + Math.floor((post.views || 0) / 10)
}

// 打开用户主页：聚合该用户的所有面经、问答及活跃榜信息
const openUserProfile = (userName) => {
  console.log('openUserProfile called with:', userName)
  if (!userName) {
    console.warn('openUserProfile: userName is empty')
    return
  }
  // 查找用户信息
  const rankEntry = weeklyRank.value.find(r => r.name === userName)
  const recommendUser = recommendUsers.value.find(u => u.name === userName)
  // 聚合该用户发布的面经
  const userPosts = hotInterviews.value
    .filter(i => i.author === userName)
    .sort((a, b) => computeHeat(b) - computeHeat(a))
  // 聚合该用户参与的问答（提问者、最佳回答者、或回答列表中的回答者）
  const userQAs = qaList.value.filter(qa => {
    if (qa.author === userName) return true
    if (qa.bestAnswer && qa.bestAnswer.author === userName) return true
    if (qa.answerList && qa.answerList.some(ans => ans.author === userName)) return true
    return false
  })
  // 计算总获赞（面经点赞 + 最佳回答点赞 + 回答列表点赞）
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0) +
    userQAs.reduce((sum, qa) => {
      let qLikes = 0
      if (qa.bestAnswer && qa.bestAnswer.author === userName) qLikes += qa.bestAnswer.likes || 0
      if (qa.answerList) {
        qa.answerList.forEach(ans => {
          if (ans.author === userName) qLikes += ans.likes || 0
        })
      }
      return sum + qLikes
    }, 0)
  // 计算排名
  const rank = weeklyRank.value.findIndex(r => r.name === userName) + 1

  userProfileData.value = {
    name: userName,
    avatar: rankEntry?.avatar || recommendUser?.avatar || generateAvatar(userName),
    title: recommendUser?.title || (userPosts.length > 0 ? `发布过 ${userPosts.length} 篇面经` : '社区活跃用户'),
    score: rankEntry?.score || 0,
    postCount: userPosts.length,
    qaCount: userQAs.length,
    totalLikes,
    rank,
    posts: userPosts,
    qas: userQAs
  }
  userProfileTab.value = userPosts.length > 0 ? 'posts' : 'qas'
  showUserProfile.value = true
  console.log('openUserProfile: showUserProfile set to true')
}

const closeUserProfile = () => {
  showUserProfile.value = false
  userProfileData.value = null
}

const closeDetail = () => {
  showDetail.value = false
  detailType.value = ''
  detailData.value = {}
  newComment.value = ''
}

const toggleUserMenu = (event) => {
  if (event && event.target.closest('.menu-item')) return
  showUserMenu.value = !showUserMenu.value
}

const handleMenuClick = (action, event) => {
  if (event) {
    event.stopPropagation()
  }
  switch (action) {
    case 'profile':
      showProfile.value = true
      break
    case 'publish':
      showMyPublish.value = true
      break
    case 'applies':
      showMyApplies.value = true
      break
    case 'collect':
      showMyCollect.value = true
      break
    case 'settings':
      showSettings.value = true
      break
    case 'logout':
      router.push('/')
      break
  }
  showUserMenu.value = false
}

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) return
  jobCurrentPage.value = 1
  // 记录搜索历史
  addToSearchHistory(query)
  // 根据搜索结果自动切换到最相关的tab
  const interviewResults = hotInterviews.value.filter(item => 
    (item.title && item.title.includes(query)) || (item.author && item.author.includes(query)) || (item.tags && item.tags.some(tag => tag && tag.includes(query)))
  ).length
  const jobResults = realJobs.value.filter(item =>
    (item.title && item.title.includes(query)) || (item.company && item.company.includes(query)) || (item.city && item.city.includes(query)) || (item.tags && item.tags.some(tag => tag && tag.includes(query)))
  ).length
  const qaResults = qaList.value.filter(item =>
    (item.title && item.title.includes(query)) || (item.author && item.author.includes(query)) || (item.tags && item.tags.some(tag => tag && tag.includes(query)))
  ).length
  const maxResults = Math.max(interviewResults, jobResults, qaResults)
  if (maxResults > 0) {
    if (jobResults === maxResults) {
      activeTab.value = 'job'
    } else if (interviewResults === maxResults) {
      activeTab.value = 'interview'
    } else {
      activeTab.value = 'qa'
    }
  }
}

const handleKeywordSearch = (kw) => {
  searchQuery.value = kw
  jobCurrentPage.value = 1
  addToSearchHistory(kw)
  handleSearch()
}

const addToSearchHistory = (query) => {
  if (!query) return
  const history = searchHistory.value.filter(h => h !== query)
  history.unshift(query)
  searchHistory.value = history.slice(0, 10)
  localStorage.setItem(getUserScopedKey('jc_searchHistory'), JSON.stringify(searchHistory.value))
}

const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem(getUserScopedKey('jc_searchHistory'))
}

const handleApply = (job) => {
  if (appliedJobIds.value.has(job.id)) {
    alert('您已经投递过该岗位了！')
    return
  }
  appliedJobIds.value.add(job.id)
  job.applied = true
  appliedJobs.value.push({
    ...job,
    applyTime: '刚刚'
  })
  persistAppliedJobs()
  alert(`已投递 ${job.title} 岗位！\n公司：${job.company}\n城市：${job.city}\n薪资：${job.salary}`)
}

const toggleFollowQuestion = (qa) => {
  const wasFollowed = followedQuestionIds.value.has(qa.title)
  if (wasFollowed) {
    followedQuestionIds.value.delete(qa.title)
    console.log('[关注问题] 取消关注:', qa.title)
  } else {
    followedQuestionIds.value.add(qa.title)
    console.log('[关注问题] 添加关注:', qa.title)
  }
  persistFollowedQuestions()
  console.log('[关注问题] 当前关注数:', followedQuestionIds.value.size, '已关注列表:', [...followedQuestionIds.value])
}

const toggleJoin = (group) => {
  if (joinedGroupIds.value.has(group.name)) {
    joinedGroupIds.value.delete(group.name)
  } else {
    joinedGroupIds.value.add(group.name)
  }
  persistJoinedGroups()
}

const toggleFollow = (user) => {
  user.followed = !user.followed
  if (user.followed) {
    followedUsers.value.add(user.name)
  } else {
    followedUsers.value.delete(user.name)
  }
  persistFollowedUsers()
}

// 私聊：从 communityStore 读取真实聊天记录
const openChat = (user) => {
  chatTarget.value = user
  chatMessages.value = getChats(currentUser.value.name, user.name)
  if (chatMessages.value.length === 0) {
    chatMessages.value = [] // 无历史消息，等用户发第一条
  }
  showChat.value = true
}

const sendChatMessage = () => {
  if (!chatInput.value.trim()) return
  const msg = {
    from: 'me',
    author: currentUser.value.name,
    avatar: currentUser.value.avatar,
    content: chatInput.value,
    time: '刚刚'
  }
  chatMessages.value.push(msg)
  addChatMessage(currentUser.value.name, chatTarget.value.name, msg)
  chatInput.value = ''
}

// 群聊：走后端 API（跨用户互通）
const openGroupChat = async (group) => {
  groupChatTarget.value = group
  try {
    const msgs = await fetchGroupMessages(group.name)
    groupChatMessages.value = (msgs || []).map(m => ({
      from: m.from,
      author: m.author,
      avatar: m.avatar,
      content: m.content,
      time: formatTime(m.timestamp)
    }))
  } catch (e) {
    groupChatMessages.value = []
  }
  showGroupChat.value = true
}

const formatTime = (ts) => {
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const sendGroupChatMessage = async () => {
  if (!groupChatInput.value.trim() || !groupChatTarget.value) return
  const payload = {
    from: 'me',
    author: currentUser.value.name,
    avatar: currentUser.value.avatar,
    content: groupChatInput.value.trim()
  }
  const saved = await sendGroupMessageApi(groupChatTarget.value.name, payload)
  if (saved) {
    groupChatMessages.value.push({
      from: saved.from,
      author: saved.author,
      avatar: saved.avatar,
      content: saved.content,
      time: '刚刚'
    })
  }
  groupChatInput.value = ''
}

const handleCreateGroup = async () => {
  const name = createGroupForm.value.name.trim()
  if (!name) {
    createGroupErr.value = '请输入群名称'
    return
  }
  if (name.length > 12) {
    createGroupErr.value = '群名称不能超过12字'
    return
  }
  const result = await createGroupApi(name, createGroupForm.value.desc.trim(), currentUser.value.name)
  if (!result.ok) {
    createGroupErr.value = result.msg
    return
  }
  // 刷新后端 API 列表
  userCreatedGroups.value = await fetchGroups()
  joinedGroupIds.value.add(name)
  persistJoinedGroups()
  createGroupForm.value = { name: '', desc: '' }
  createGroupErr.value = ''
  showCreateGroupModal.value = false
  showToast('创建成功！现在所有登录用户都能看到这个群了~', 'success')
}

const handleDeleteGroup = async (group) => {
  if (!confirm(`确定要删除群「${group.name}」吗？群聊消息也会一并删除。`)) return
  const ok = await deleteGroupApi(group.name)
  if (ok) {
    userCreatedGroups.value = await fetchGroups()
    joinedGroupIds.value.delete(group.name)
    persistJoinedGroups()
    showToast('已删除', 'success')
  }
}

const addTag = () => {
  if (publishForm.value.tagInput.trim()) {
    publishForm.value.tags.push(publishForm.value.tagInput.trim())
    publishForm.value.tagInput = ''
  }
}

const removeTag = (index) => {
  publishForm.value.tags.splice(index, 1)
}

const closePublishModal = () => {
  showPublishModal.value = false
  publishForm.value = { title: '', tags: [], tagInput: '', content: '' }
}

const isSubmitting = ref(false)

const submitPublish = async () => {
  if (isSubmitting.value) return
  const title = publishForm.value.title.trim()
  const content = publishForm.value.content.trim()
  if (!title || !content) {
    alert('请填写标题和内容')
    return
  }

  // 防重复：同一作者 + 同一标题 + 同一内容 视为重复发布
  const author = currentUser.value.name
  const dup = hotInterviews.value.find(p =>
    p.author === author &&
    (p.title || '').trim() === title &&
    (p.content || '').trim() === content
  )
  if (dup) {
    alert('你已经发布过一模一样的内容了，不要再重复发布啦~')
    return
  }

  isSubmitting.value = true
  
  const newPost = {
    title,
    author,
    avatar: currentUser.value.avatar,
    time: '刚刚',
    tags: publishForm.value.tags.length > 0 ? publishForm.value.tags : [],
    comments: 0,
    likes: 0,
    views: 1,
    liked: false,
    collected: false,
    preview: content.slice(0, 100) + '...',
    content,
    commentList: [],
    isUserPublished: true
  }
  
  // 写入 communityStore（localStorage 持久化）
  try {
    await createPost(newPost)
  } catch (e) {
    console.warn('[发布] createPost 失败:', e.message)
  }
  
  hotInterviews.value.unshift(newPost)
  
  closePublishModal()
  activeTab.value = 'interview'
  filterType.value = 'latest'
  isSubmitting.value = false
  
  showToast('发布成功！已为你切换到面经榜「最新」', 'success')
}

const initBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const particles = []
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.4 + 0.1
    })
  }
  
  const animate = () => {
    ctx.fillStyle = 'rgba(0, 10, 30, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(p => {
      p.x += p.speedX
      p.y += p.speedY
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74, 158, 255, ${p.opacity})`
      ctx.fill()
    })
    
    requestAnimationFrame(animate)
  }
  
  animate()
}

onMounted(async () => {
  loadCurrentUser()
  
  // 从后端 API 加载帖子（跨用户互通）
  try {
    const posts = await fetchPosts()
    if (posts && posts.length > 0) {
      hotInterviews.value = posts.map(p => ({
        ...p,
        views: p.views || 0,
        liked: typeof p.liked === 'boolean' ? p.liked : false,
        collected: typeof p.collected === 'boolean' ? p.collected : false,
        commentList: p.commentList || []
      }))
    } else {
      hotInterviews.value = []
    }
  } catch (e) {
    console.warn('[社区] 加载帖子失败:', e.message)
    hotInterviews.value = []
  }

  try {
    const qas = await fetchQAs()
    qaList.value = qas || []
  } catch (e) {
    console.warn('[社区] 加载问答失败:', e.message)
    qaList.value = []
  }

  // 加载岗位数据（仅用于岗位 tab + 热门话题/小组聚合）
  try {
    const response = await fetch('/data/all_cleaned_jobs.json')
    if (response.ok) {
      jobData = await response.json()
      dataTrigger.value++
    }
  } catch (err) {
    console.warn('岗位数据加载失败:', err.message)
  }

  initBackground()
  loadPersistedState()
  const savedHistory = JSON.parse(localStorage.getItem(getUserScopedKey('jc_searchHistory')) || '[]')
  if (savedHistory.length > 0) {
    searchHistory.value = savedHistory
  }

  // 从后端 API 加载所有小组（跨用户互通）
  try {
    userCreatedGroups.value = await fetchGroups() || []
  } catch (e) {
    userCreatedGroups.value = []
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
  _jcOnUnmountedUnlock()
})
</script>

<style scoped>
.job-community {
  --bg-deep: #02040a;
  --bg-card: rgba(12, 22, 48, 0.55);
  --bg-card-hover: rgba(22, 38, 72, 0.65);
  --cyan: #00e5ff;
  --magenta: #c471ff;
  --gold: #ffb648;
  --green: #00ffa3;
  --red: #ff4757;
  --border-glow: rgba(0, 229, 255, 0.35);
  --shadow-glow: 0 0 20px rgba(0, 229, 255, 0.25);
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
  --radius-lg: 14px;
  --radius-input: 10px;

  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(0, 229, 255, 0.12), transparent 55%),
    radial-gradient(ellipse at 80% 100%, rgba(196, 113, 255, 0.10), transparent 55%),
    linear-gradient(135deg, #02040a 0%, #05081a 50%, #0a0f24 100%);
  position: relative;
  overflow: hidden;
  color: #e6f1ff;
}

.job-community ::-webkit-scrollbar { width: 6px; height: 6px; }
.job-community ::-webkit-scrollbar-track { background: rgba(0, 229, 255, 0.05); border-radius: 3px; }
.job-community ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyan), var(--magenta));
  border-radius: 3px;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
}
.job-community ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #33eaff, #d088ff);
}

@keyframes borderFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 12px rgba(0, 229, 255, 0.35); }
  50% { box-shadow: 0 0 28px rgba(0, 229, 255, 0.75); }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
}

.bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
.community-container { position: relative; z-index: 1; }

.community-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(2, 4, 10, 0.72);
  border-bottom: 1px solid var(--border-glow);
  box-shadow: 0 2px 20px rgba(0, 229, 255, 0.08);
  position: relative;
  z-index: 10;
}
.nav-left { display: flex; align-items: center; gap: 15px; }
.nav-back {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.18), rgba(196, 113, 255, 0.18));
  border: 1px solid var(--border-glow);
  color: var(--cyan); font-size: 1.4rem; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.18);
}
.nav-back:hover { background: rgba(0, 229, 255, 0.3); transform: scale(1.08); box-shadow: 0 0 22px rgba(0, 229, 255, 0.55); }
.nav-logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 1.8rem; filter: drop-shadow(0 0 8px var(--cyan)); }
.logo-text { display: flex; flex-direction: column; }
.logo-main {
  font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px;
  background: linear-gradient(90deg, var(--cyan), #ffffff, var(--magenta));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
}
.logo-sub { font-size: 0.7rem; color: rgba(230, 241, 255, 0.55); letter-spacing: 1px; text-transform: uppercase; }

.nav-center {
  display: flex; gap: 10px;
  background: rgba(0, 229, 255, 0.06);
  border: 1px solid var(--border-glow);
  border-radius: 30px; padding: 8px;
  backdrop-filter: blur(10px);
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 26px; border-radius: 25px;
  color: rgba(230, 241, 255, 0.6); font-size: 1.05rem; font-weight: 500;
  background: transparent; border: none; cursor: pointer;
  transition: all 0.3s; letter-spacing: 0.3px;
  position: relative;
}
.nav-item:hover {
  background: rgba(0, 229, 255, 0.12);
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
}
.nav-item.active {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.35), rgba(196, 113, 255, 0.35));
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.45), inset 0 0 12px rgba(255, 255, 255, 0.05);
  animation: pulseGlow 3s ease-in-out infinite;
}
.nav-item.active::after {
  content: ''; position: absolute; left: 18px; right: 18px; bottom: 4px;
  height: 2px; border-radius: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--magenta), var(--cyan));
  background-size: 200% 100%;
  animation: borderFlow 3s linear infinite;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.7);
}
.nav-icon { font-size: 1.3rem; }

.nav-right { display: flex; align-items: center; gap: 20px; position: relative; }
.publish-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; border-radius: 25px; color: #fff;
  font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: all 0.3s; letter-spacing: 0.5px;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.45);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
}
.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 229, 255, 0.65), 0 0 18px rgba(196, 113, 255, 0.5);
}
.user-profile { position: relative; cursor: pointer; }
.user-profile img {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2px solid var(--cyan);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
}

.user-menu {
  position: absolute; top: 60px; right: 0; width: 220px;
  background: rgba(12, 22, 48, 0.98);
  border: 1px solid var(--border-glow);
  border-radius: 15px; padding: 12px; z-index: 999;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(0, 229, 255, 0.15);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.25s ease;
}
.user-menu.user-menu-visible {
  pointer-events: auto;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.menu-item {
  padding: 14px 16px; border-radius: 10px;
  color: rgba(230, 241, 255, 0.75); font-size: 0.95rem; cursor: pointer;
  transition: all 0.2s;
  pointer-events: auto;
  user-select: none;
}
.menu-item:hover {
  background: rgba(0, 229, 255, 0.15);
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.55);
}
.menu-item.logout { color: rgba(255, 71, 87, 0.8); }
.menu-item.logout:hover { background: rgba(255, 71, 87, 0.15); color: var(--red); text-shadow: 0 0 10px rgba(255, 71, 87, 0.6); }
.menu-divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border-glow), transparent); margin: 10px 0; }

.hero-banner { padding: 50px 30px; text-align: center; position: relative; }
.banner-title {
  font-size: 2.8rem; font-weight: 700; color: #fff;
  margin-bottom: 15px; letter-spacing: 1px;
  background: linear-gradient(90deg, var(--cyan) 0%, #ffffff 50%, var(--cyan) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 0 24px rgba(0, 229, 255, 0.4);
  background-size: 200% 100%;
  animation: borderFlow 6s linear infinite;
}
.banner-desc {
  font-size: 1.1rem; color: rgba(230, 241, 255, 0.7);
  margin-bottom: 35px; letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.25);
}

.search-box { display: flex; justify-content: center; max-width: 620px; margin: 0 auto 25px; }
.search-input {
  flex: 1; padding: 16px 24px;
  border-radius: 30px 0 0 30px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-glow);
  color: #fff; font-size: 1.1rem; outline: none;
  transition: all 0.3s;
}
.search-input::placeholder { color: rgba(230, 241, 255, 0.4); }
.search-input:focus {
  border-color: var(--cyan);
  box-shadow: inset 0 0 12px rgba(0, 229, 255, 0.25);
}
.search-btn {
  padding: 16px 36px; border-radius: 0 30px 30px 0;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 1.1rem; font-weight: 600; cursor: pointer;
  transition: all 0.3s; letter-spacing: 0.5px;
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.35);
}
.search-btn:hover { transform: scale(1.03); box-shadow: 0 0 28px rgba(0, 229, 255, 0.6); }

.search-history {
  display: flex; justify-content: center; align-items: center; gap: 10px;
  margin: -15px 0 20px; flex-wrap: wrap;
  font-size: 0.85rem;
}
.history-label { color: rgba(230, 241, 255, 0.5); }
.history-item {
  padding: 4px 12px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 12px;
  color: rgba(230, 241, 255, 0.75);
  cursor: pointer;
  transition: all 0.2s;
}
.history-item:hover {
  background: rgba(0, 229, 255, 0.2);
  color: var(--cyan);
  border-color: var(--cyan);
}
.history-clear {
  padding: 4px 10px;
  color: rgba(230, 241, 255, 0.4);
  cursor: pointer;
  font-size: 0.75rem;
  transition: color 0.2s;
}
.history-clear:hover { color: #ef4444; }

.hot-keywords { display: flex; justify-content: center; gap: 12px; margin-bottom: 35px; flex-wrap: wrap; }
.keyword-item {
  padding: 10px 22px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(196, 113, 255, 0.12));
  border: 1px solid var(--border-glow);
  border-radius: 25px;
  color: var(--cyan); font-size: 0.95rem; cursor: pointer;
  transition: all 0.3s; backdrop-filter: blur(8px);
}
.keyword-item:hover {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(196, 113, 255, 0.3));
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 229, 255, 0.45);
  color: #fff;
}

.banner-stats { display: flex; justify-content: center; gap: 60px; }
.stat-card { text-align: center; position: relative; }
.stat-value {
  font-size: 2.4rem; font-weight: 700; color: var(--cyan);
  display: block; font-family: var(--font-mono);
  text-shadow: 0 0 16px rgba(0, 229, 255, 0.6), 0 0 32px rgba(0, 229, 255, 0.3);
  letter-spacing: 1px;
}
.stat-label { font-size: 0.95rem; color: rgba(230, 241, 255, 0.65); letter-spacing: 0.5px; }

.main-content { display: flex; gap: 30px; padding: 25px 30px; max-width: 1500px; margin: 0 auto; }
.content-left { flex: 1; }
.content-right { width: 320px; flex-shrink: 0; }

.tab-content {
  background: var(--bg-card);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-glow);
  border-radius: 20px; padding: 30px;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.section-title {
  font-size: 1.5rem; font-weight: 600; color: #fff;
  letter-spacing: 0.5px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
}
.section-filters { display: flex; gap: 15px; }
.section-filters span {
  padding: 10px 20px; border-radius: 18px;
  color: rgba(230, 241, 255, 0.6); font-size: 0.95rem; cursor: pointer;
  transition: all 0.3s;
}
.section-filters span:hover { background: rgba(0, 229, 255, 0.15); color: var(--cyan); }
.section-filters span.active {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.35), rgba(196, 113, 255, 0.35));
  color: #fff;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.4);
}

.interview-list { display: flex; flex-direction: column; gap: 25px; }
.interview-card {
  display: flex; gap: 20px;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 18px; padding: 25px; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}
.interview-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  transform: translateY(-4px);
  box-shadow: 0 0 28px rgba(0, 229, 255, 0.25) inset, 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.3);
}

/* 热门精选区 */
.featured-section {
  margin-bottom: 40px;
  padding: 26px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 94, 58, 0.08));
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.15) inset, 0 6px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.15);
  position: relative;
}
.featured-section::after {
  content: '';
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent);
}
.featured-header {
  display: flex; align-items: baseline; gap: 14px;
  margin-bottom: 18px; padding-bottom: 14px;
  border-bottom: 1px dashed rgba(255, 215, 0, 0.25);
}
.featured-title {
  font-size: 1.25rem; font-weight: 700;
  background: linear-gradient(135deg, #ffd700, #ff7e5f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}
.featured-desc {
  font-size: 0.8rem;
  color: rgba(255, 215, 0, 0.6);
}
.featured-card {
  border-color: rgba(255, 215, 0, 0.35);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 94, 58, 0.03)), var(--bg-card);
}
.featured-card:hover {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 28px rgba(255, 215, 0, 0.2) inset, 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(255, 215, 0, 0.25);
}

/* 全部面经区 */
.normal-section {
  margin-top: 10px;
  padding-top: 5px;
}
.normal-section-header {
  display: flex; align-items: baseline; gap: 12px;
  margin-bottom: 18px; padding: 12px 18px;
  border-bottom: none;
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.08), transparent);
  border-left: 4px solid var(--cyan);
  border-radius: 0 12px 12px 0;
}
.normal-section-title {
  font-size: 1.1rem; font-weight: 600;
  color: var(--cyan);
  letter-spacing: 0.5px;
}
.normal-section-count {
  font-size: 0.82rem;
  color: rgba(230, 241, 255, 0.5);
}
.card-rank {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg, var(--magenta), var(--cyan));
  color: #fff; font-size: 1.1rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: var(--font-mono);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.45);
}
.card-main { flex: 1; }
.card-header { display: flex; gap: 15px; margin-bottom: 15px; }
.card-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  cursor: pointer;
  position: relative;
  z-index: 10;
  transition: all 0.3s;
}
.card-avatar:hover {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
  transform: scale(1.05);
}
.card-title-wrap { flex: 1; }
.card-title {
  font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 6px;
  letter-spacing: 0.5px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.45);
}
.card-meta { display: flex; gap: 18px; }
.card-author { 
  font-size: 0.95rem; 
  color: var(--cyan); 
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
  cursor: pointer;
  position: relative;
  z-index: 10;
  transition: all 0.3s;
}
.card-author:hover {
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
}
.card-time { font-size: 0.9rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }

.card-tags { display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; }
.card-tags .tag {
  padding: 6px 16px;
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.25), rgba(0, 229, 255, 0.2));
  border: 1px solid rgba(196, 113, 255, 0.35);
  border-radius: 15px;
  font-size: 0.85rem; color: #e9d5ff; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 10px rgba(196, 113, 255, 0.15);
}
.card-tags .tag:hover {
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.45), rgba(0, 229, 255, 0.4));
  transform: scale(1.06);
  box-shadow: 0 0 16px rgba(196, 113, 255, 0.45);
  color: #fff;
}
.card-preview { font-size: 1rem; color: rgba(230, 241, 255, 0.7); line-height: 1.7; margin-bottom: 18px; }

.card-badges { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
.badge {
  padding: 4px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;
  letter-spacing: 0.5px;
}
.badge.hot {
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.35), rgba(255, 182, 72, 0.25));
  color: #ffd27a;
  animation: pulse 2s infinite;
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.4);
  border: 1px solid rgba(255, 71, 87, 0.4);
}
.badge.active {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.35), rgba(0, 255, 163, 0.25));
  color: var(--green);
  border: 1px solid rgba(0, 255, 163, 0.4);
  box-shadow: 0 0 14px rgba(0, 255, 163, 0.35);
}
.badge.ai {
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.35), rgba(0, 229, 255, 0.25));
  color: #e9d5ff;
  border: 1px solid rgba(196, 113, 255, 0.4);
  box-shadow: 0 0 14px rgba(196, 113, 255, 0.35);
}

.card-status { font-size: 0.85rem; padding: 2px 10px; border-radius: 10px; font-family: var(--font-mono); }
.card-status.online { color: var(--green); background: rgba(0, 255, 163, 0.15); box-shadow: 0 0 8px rgba(0, 255, 163, 0.35); }
.card-status.offline { color: rgba(230, 241, 255, 0.4); background: rgba(230, 241, 255, 0.05); }

.card-rank.rank-gold {
  background: linear-gradient(135deg, #ffe066, #ffa94d);
  color: #1a1208;
  box-shadow: 0 0 18px rgba(255, 182, 72, 0.8), 0 0 32px rgba(255, 182, 72, 0.4);
  font-family: var(--font-mono);
  animation: pulseGlow 2.5s ease-in-out infinite;
}
.card-rank.rank-silver {
  background: linear-gradient(135deg, #f5f7fa, #b8c6db);
  color: #1a2030;
  box-shadow: 0 0 16px rgba(200, 210, 230, 0.7), 0 0 28px rgba(200, 210, 230, 0.35);
  font-family: var(--font-mono);
}
.card-rank.rank-bronze {
  background: linear-gradient(135deg, #e5a97a, #a06234);
  color: #1a0f08;
  box-shadow: 0 0 16px rgba(229, 169, 122, 0.7), 0 0 28px rgba(229, 169, 122, 0.35);
  font-family: var(--font-mono);
}

.card-actions { display: flex; align-items: center; gap: 25px; }
.action-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 20px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: rgba(230, 241, 255, 0.75);
  font-size: 0.9rem; cursor: pointer;
  transition: all 0.3s;
}
.action-btn:hover {
  background: rgba(0, 229, 255, 0.2);
  color: var(--cyan);
  border-color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.35);
}
.action-btn.active {
  background: rgba(255, 71, 87, 0.18);
  color: var(--red);
  border-color: rgba(255, 71, 87, 0.45);
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.35);
}
.action-icon { font-size: 1rem; }
.action-num { font-size: 0.85rem; font-family: var(--font-mono); }
.action-stat { display: flex; align-items: center; gap: 6px; color: rgba(230, 241, 255, 0.4); font-size: 0.85rem; font-family: var(--font-mono); }

.job-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.job-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 18px; padding: 22px; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}
.job-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  transform: translateY(-4px);
  box-shadow: 0 0 28px rgba(0, 229, 255, 0.25) inset, 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.3);
}
.job-title {
  font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.45);
}
.job-company { font-size: 0.95rem; color: var(--cyan); margin-bottom: 12px; text-shadow: 0 0 6px rgba(0, 229, 255, 0.35); }
.job-info { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.job-info span { font-size: 0.85rem; color: rgba(230, 241, 255, 0.6); }
.job-info .salary {
  color: var(--gold); font-weight: 600; font-size: 1rem;
  font-family: var(--font-mono);
  text-shadow: 0 0 10px rgba(255, 182, 72, 0.5);
}
.job-skills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.job-skills .skill {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.18), rgba(0, 255, 163, 0.18));
  border: 1px solid rgba(0, 255, 163, 0.3);
  border-radius: 12px;
  font-size: 0.8rem; color: var(--green);
  box-shadow: 0 0 10px rgba(0, 255, 163, 0.2);
}
.job-actions { display: flex; justify-content: space-between; align-items: center; }
.apply-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; border-radius: 18px; color: #fff;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.3s; letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 229, 255, 0.4);
}
.apply-btn:hover { transform: scale(1.06); box-shadow: 0 6px 22px rgba(0, 229, 255, 0.6); }
.apply-btn.applied {
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.25), rgba(0, 229, 255, 0.2));
  border: 1px solid rgba(0, 255, 163, 0.45);
  color: var(--green);
  box-shadow: 0 0 12px rgba(0, 255, 163, 0.35);
}
.apply-btn.applied:hover { transform: none; box-shadow: 0 0 12px rgba(0, 255, 163, 0.35); }
.collect-btn {
  padding: 8px 14px; border-radius: 15px;
  background: rgba(255, 182, 72, 0.15);
  border: 1px solid rgba(255, 182, 72, 0.3);
  font-size: 1.2rem; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 0 8px rgba(255, 182, 72, 0.2);
}
.collect-btn:hover { background: rgba(255, 182, 72, 0.3); box-shadow: 0 0 16px rgba(255, 182, 72, 0.5); }
.collect-btn.collected { background: linear-gradient(135deg, rgba(255, 182, 72, 0.5), rgba(255, 71, 87, 0.3)); box-shadow: 0 0 16px rgba(255, 182, 72, 0.6); }

.pagination {
  margin-top: 30px;
  padding: 20px;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.pagination-info {
  font-size: 0.9rem;
  color: rgba(230, 241, 255, 0.6);
  font-family: var(--font-mono);
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 8px;
  color: rgba(230, 241, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}
.page-btn:hover:not(:disabled):not(.active) {
  background: rgba(0, 229, 255, 0.2);
  border-color: var(--cyan);
  color: #fff;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}
.page-btn.active {
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.5);
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.qa-list { display: flex; flex-direction: column; gap: 20px; }
.qa-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 18px; padding: 22px; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}
.qa-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  transform: translateY(-4px);
  box-shadow: 0 0 28px rgba(0, 229, 255, 0.25) inset, 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.3);
}
.qa-header { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
.qa-header .qa-title-wrap { flex: 1; min-width: 0; }
.qa-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
.qa-title-wrap { flex: 1; }
.qa-title {
  font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 6px;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.45);
}
.qa-meta { display: flex; gap: 15px; }
.qa-meta span { font-size: 0.85rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.qa-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.qa-tag {
  padding: 5px 14px;
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.25), rgba(0, 229, 255, 0.18));
  border: 1px solid rgba(196, 113, 255, 0.35);
  border-radius: 12px;
  font-size: 0.8rem; color: #e9d5ff;
  box-shadow: 0 0 8px rgba(196, 113, 255, 0.2);
}
.qa-preview { font-size: 0.95rem; color: rgba(230, 241, 255, 0.7); line-height: 1.6; margin-bottom: 14px; }
.qa-actions { display: flex; align-items: center; gap: 20px; }
.qa-action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 15px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: rgba(230, 241, 255, 0.75);
  font-size: 0.85rem; cursor: pointer; transition: all 0.3s;
}
.qa-action-btn:hover { background: rgba(0, 229, 255, 0.2); color: var(--cyan); box-shadow: 0 0 14px rgba(0, 229, 255, 0.35); }
.qa-action-btn.solved {
  background: rgba(0, 255, 163, 0.18);
  color: var(--green);
  border-color: rgba(0, 255, 163, 0.4);
  box-shadow: 0 0 12px rgba(0, 255, 163, 0.35);
}
.qa-action-btn.unsolved {
  background: rgba(255, 182, 72, 0.18);
  color: var(--gold);
  border-color: rgba(255, 182, 72, 0.4);
  box-shadow: 0 0 12px rgba(255, 182, 72, 0.35);
}
.qa-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.qa-status {
  font-size: 0.75rem; padding: 2px 10px; border-radius: 10px;
  font-weight: 600; white-space: nowrap;
}
.qa-status.solved {
  background: rgba(0, 255, 163, 0.18);
  color: var(--green);
  border: 1px solid rgba(0, 255, 163, 0.4);
}
.qa-status.unsolved {
  background: rgba(255, 182, 72, 0.18);
  color: var(--gold);
  border: 1px solid rgba(255, 182, 72, 0.4);
}
.qa-follow-btn {
  padding: 4px 12px; border-radius: 12px;
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: rgba(230, 241, 255, 0.7);
  font-size: 0.75rem; cursor: pointer; transition: all 0.25s;
  white-space: nowrap;
}
.qa-follow-btn:hover { background: rgba(74, 158, 255, 0.25); color: #fff; }
.qa-follow-btn.followed {
  background: rgba(0, 229, 255, 0.25);
  color: var(--cyan);
  border-color: rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
.qa-best-answer {
  font-size: 0.8rem; color: var(--gold);
  background: rgba(255, 182, 72, 0.1);
  padding: 4px 10px; border-radius: 10px;
  border: 1px solid rgba(255, 182, 72, 0.25);
}

.group-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.group-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 18px; padding: 22px; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}
.group-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  transform: translateY(-4px);
  box-shadow: 0 0 28px rgba(0, 229, 255, 0.25) inset, 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.3);
}
.group-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  color: #fff; font-size: 1.6rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.5);
}
.group-name {
  font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
.group-desc { font-size: 0.85rem; color: rgba(230, 241, 255, 0.65); margin-bottom: 12px; line-height: 1.5; }
.group-stats { display: flex; gap: 15px; margin-bottom: 14px; }
.group-stats span { font-size: 0.8rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.join-btn {
  width: 100%; padding: 10px; border-radius: 15px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.22), rgba(196, 113, 255, 0.22));
  border: 1px solid var(--cyan);
  color: var(--cyan);
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  letter-spacing: 0.5px;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}
.join-btn:hover {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.45), rgba(196, 113, 255, 0.45));
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.6);
}
.group-actions { display: flex; gap: 8px; margin-top: 10px; }
.group-actions .join-btn { flex: 1; }
.group-actions .chat-btn {
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.22), rgba(0, 229, 255, 0.18));
  border-color: rgba(0, 255, 163, 0.5);
  color: var(--green);
}
.group-actions .chat-btn:hover {
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.45), rgba(0, 229, 255, 0.35));
  box-shadow: 0 0 18px rgba(0, 255, 163, 0.5);
}
.group-actions .delete-btn {
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.45);
  color: var(--red);
  flex: 0.7;
}
.group-actions .delete-btn:hover {
  background: rgba(255, 71, 87, 0.35);
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.5);
}
.user-group-badge {
  display: inline-block;
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255, 182, 72, 0.2);
  color: var(--gold);
  border: 1px solid rgba(255, 182, 72, 0.45);
  margin-left: 6px;
  vertical-align: middle;
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
}
.create-group-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.18), rgba(0, 229, 255, 0.18));
  border: 1px solid rgba(0, 255, 163, 0.55);
  border-radius: 14px;
  color: var(--green);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 0 8px rgba(0, 255, 163, 0.25);
}
.create-group-btn:hover {
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.35), rgba(0, 229, 255, 0.35));
  box-shadow: 0 0 16px rgba(0, 255, 163, 0.5);
  transform: translateY(-1px);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.content-right > div {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 18px; padding: 22px; margin-bottom: 20px;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: all 0.3s;
}
.content-right > div:hover {
  border-color: var(--cyan);
  box-shadow: 0 0 22px rgba(0, 229, 255, 0.2) inset, 0 8px 28px rgba(0, 0, 0, 0.5), 0 0 18px rgba(0, 229, 255, 0.2);
}
.content-right h4 {
  font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 18px;
  letter-spacing: 0.5px;
  position: relative; padding-bottom: 10px;
}
.content-right h4::after {
  content: ''; position: absolute; left: 0; bottom: 0;
  height: 2px; width: 100%;
  background: linear-gradient(90deg, var(--cyan), var(--magenta), transparent);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
}
.avatar-stack { display: flex; }
.mini-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  border: 2px solid var(--cyan);
  margin-left: -10px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
.mini-avatar:first-child { margin-left: 0; }
.online-count {
  font-size: 0.85rem; color: var(--green); display: block; margin-top: 12px;
  font-family: var(--font-mono);
  text-shadow: 0 0 8px rgba(0, 255, 163, 0.5);
}
.topic-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 0;
  border-bottom: 1px solid rgba(0, 229, 255, 0.12);
  cursor: pointer; transition: all 0.2s;
}
.topic-item:last-child { border-bottom: none; }
.topic-item:hover {
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.12), transparent);
  padding-left: 10px;
  border-radius: 6px;
}
.topic-rank {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--magenta), var(--cyan));
  color: #fff; font-size: 0.85rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: var(--font-mono);
  box-shadow: 0 0 10px rgba(196, 113, 255, 0.5);
}
.topic-name { font-size: 0.9rem; color: rgba(230, 241, 255, 0.75); }
.user-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 0;
  border-bottom: 1px solid rgba(0, 229, 255, 0.12);
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 8px;
  padding-left: 6px; padding-right: 6px;
}
.user-item:hover {
  background: rgba(0, 229, 255, 0.08);
  transform: translateX(2px);
}
.user-item:last-child { border-bottom: none; }
.user-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}
.user-detail { flex: 1; }
.user-name { font-size: 0.95rem; color: #fff; display: block; text-shadow: 0 0 6px rgba(0, 229, 255, 0.3); }
.user-title { font-size: 0.75rem; color: rgba(230, 241, 255, 0.5); }
.follow-btn {
  padding: 8px 16px; border-radius: 15px;
  background: rgba(0, 229, 255, 0.15);
  border: 1px solid var(--cyan);
  color: var(--cyan);
  font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}
.follow-btn:hover {
  background: rgba(0, 229, 255, 0.3);
  color: #fff;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.55);
}
.rank-rule-toggle {
  font-size: 0.7rem;
  color: rgba(0, 229, 255, 0.7);
  cursor: pointer;
  margin-left: 8px;
  padding: 2px 6px;
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 10px;
  transition: all 0.3s;
}
.rank-rule-toggle:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  background: rgba(0, 229, 255, 0.1);
}
.points-rule {
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 8px 0;
  font-size: 0.75rem;
}
.points-rule .rule-title {
  color: var(--cyan);
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.8rem;
}
.points-rule .rule-item {
  color: rgba(230, 241, 255, 0.7);
  padding: 2px 0;
  font-family: var(--font-mono);
}
.rank-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.25s;
}
.rank-item:hover {
  background: rgba(255, 182, 72, 0.1);
  transform: translateX(2px);
}
.rank-item.rank-gold { background: linear-gradient(90deg, rgba(255, 182, 72, 0.12), transparent); }
.rank-item.rank-silver { background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent); }
.rank-item.rank-bronze { background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent); }
.rank-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--magenta));
  color: #1a0f05;
  font-size: 0.8rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: var(--font-mono);
  box-shadow: 0 0 10px rgba(255, 182, 72, 0.5);
}
.rank-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.25);
  transition: transform 0.25s;
}
.rank-item:hover .rank-avatar { transform: scale(1.08); }
.rank-name { flex: 1; font-size: 0.9rem; color: rgba(230, 241, 255, 0.7); }
.rank-score { font-size: 0.8rem; color: var(--gold); font-family: var(--font-mono); text-shadow: 0 0 8px rgba(255, 182, 72, 0.4); }
.rank-view-hint {
  font-size: 0.72rem;
  color: rgba(0, 229, 255, 0.5);
  opacity: 0;
  transition: opacity 0.25s;
}
.rank-item:hover .rank-view-hint { opacity: 1; }

.detail-modal {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(2, 4, 10, 0.85);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 99999; display: flex; align-items: center; justify-content: center;
  padding: 3vh 3vw;
  box-sizing: border-box;
}
.modal-content {
  width: min(94%, 820px); max-height: 92vh; overflow-y: auto;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--cyan);
  border-radius: 20px; padding: 32px 36px; position: relative;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.35), 0 24px 60px rgba(0, 0, 0, 0.6);
  box-sizing: border-box;
  margin: 0;
  transform: none;
  left: auto; top: auto;
}
.close-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.45);
  color: var(--red); font-size: 1.2rem; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 12px rgba(255, 71, 87, 0.3);
  display: flex; align-items: center; justify-content: center;
  margin-left: auto; flex-shrink: 0;
}
.close-btn:hover {
  background: rgba(255, 71, 87, 0.4);
  color: #fff;
  transform: rotate(90deg);
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.65);
}

.detail-body h2 {
  font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 10px;
  letter-spacing: 0.5px;
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.6);
}
.detail-company { font-size: 1.1rem; color: var(--cyan); margin-bottom: 15px; text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }
.detail-header { display: flex; gap: 18px; margin-bottom: 20px; }
.detail-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid var(--cyan);
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.5);
  cursor: pointer;
  transition: transform 0.25s;
}
.detail-avatar:hover { transform: scale(1.08); }
.detail-meta { display: flex; gap: 20px; margin-top: 10px; }
.detail-meta span { font-size: 0.9rem; color: rgba(230, 241, 255, 0.55); font-family: var(--font-mono); }
.detail-author-name {
  color: var(--cyan) !important;
  cursor: pointer;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
  transition: all 0.25s;
}
.detail-author-name:hover {
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
  letter-spacing: 0.5px;
}
.detail-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.detail-tag {
  padding: 8px 18px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.22), rgba(196, 113, 255, 0.22));
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 15px;
  font-size: 0.85rem; color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
}
.detail-content { color: rgba(230, 241, 255, 0.75); line-height: 1.8; margin-bottom: 25px; }
.detail-content h3 { color: #fff; margin: 20px 0 10px; font-size: 1.2rem; text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }
.detail-content ul { padding-left: 20px; }
.detail-content li { margin-bottom: 8px; }

.detail-actions {
  display: flex; gap: 20px; margin-bottom: 30px; padding-bottom: 25px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
}
.detail-action-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 28px; border-radius: 25px;
  background: rgba(0, 229, 255, 0.12);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: rgba(230, 241, 255, 0.8);
  font-size: 1rem; cursor: pointer; transition: all 0.3s;
}
.detail-action-btn:hover {
  background: rgba(0, 229, 255, 0.25);
  color: var(--cyan);
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.45);
}
.detail-action-btn.active {
  background: rgba(255, 71, 87, 0.18);
  color: var(--red);
  border-color: rgba(255, 71, 87, 0.4);
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.4);
}

.comment-section h3 {
  font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.45);
}
.comment-list { display: flex; flex-direction: column; gap: 18px; margin-bottom: 25px; }
.comment-item {
  display: flex; gap: 14px; padding: 18px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 229, 255, 0.12);
  border-radius: 15px;
  transition: all 0.3s;
}
.comment-item:hover { border-color: rgba(0, 229, 255, 0.3); box-shadow: 0 0 14px rgba(0, 229, 255, 0.15); }
.comment-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.25);
}
.comment-content { flex: 1; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.comment-author { font-size: 0.95rem; color: var(--cyan); font-weight: 500; text-shadow: 0 0 6px rgba(0, 229, 255, 0.35); }
.comment-time { font-size: 0.8rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.comment-content p { font-size: 0.95rem; color: rgba(230, 241, 255, 0.75); line-height: 1.6; margin-bottom: 10px; }
.comment-like { background: transparent; border: none; color: rgba(230, 241, 255, 0.5); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; }
.comment-like:hover { color: var(--red); text-shadow: 0 0 8px rgba(255, 71, 87, 0.5); }
.comment-like.liked { color: var(--red); text-shadow: 0 0 10px rgba(255, 71, 87, 0.6); }

.comment-input-box { display: flex; gap: 15px; }
.comment-input {
  flex: 1; padding: 14px 20px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-glow);
  color: #fff; font-size: 0.95rem; outline: none;
  transition: all 0.3s;
}
.comment-input::placeholder { color: rgba(230, 241, 255, 0.4); }
.comment-input:focus {
  border-color: var(--cyan);
  box-shadow: inset 0 0 12px rgba(0, 229, 255, 0.25), 0 0 14px rgba(0, 229, 255, 0.3);
}
.comment-submit {
  padding: 14px 30px; border-radius: 20px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 18px rgba(0, 229, 255, 0.4);
}
.comment-submit:hover { transform: scale(1.03); box-shadow: 0 6px 24px rgba(0, 229, 255, 0.6); }

.job-detail-actions { display: flex; gap: 20px; margin-top: 25px; }

/* 岗位亮点条（真实薪资/城市/经验/学历汇总） */
.job-highlights {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 18px;
  padding: 16px 18px;
  margin: 20px 0 6px;
  background: rgba(0, 229, 255, 0.06);
  border: 1px dashed rgba(0, 229, 255, 0.25);
  border-radius: 14px;
}
.job-highlight-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: rgba(210, 230, 255, 0.82);
  font-family: var(--font-mono);
}
.job-highlight-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  flex-shrink: 0;
}
@media (max-width: 600px) {
  .job-highlights { grid-template-columns: 1fr; }
}
.apply-btn-lg {
  flex: 1; padding: 16px; border-radius: 20px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.45);
}
.apply-btn-lg:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0, 229, 255, 0.65); }
.apply-btn-lg.applied {
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.25), rgba(0, 229, 255, 0.2));
  border: 1px solid rgba(0, 255, 163, 0.45);
  color: var(--green);
  box-shadow: 0 0 14px rgba(0, 255, 163, 0.35);
}
.apply-btn-lg.applied:hover { transform: none; box-shadow: 0 0 14px rgba(0, 255, 163, 0.35); }
.collect-btn-lg {
  padding: 16px 35px; border-radius: 20px;
  background: rgba(255, 182, 72, 0.15);
  border: 1px solid rgba(255, 182, 72, 0.4);
  color: var(--gold);
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  font-family: var(--font-mono);
  box-shadow: 0 0 12px rgba(255, 182, 72, 0.35);
}
.collect-btn-lg:hover {
  background: rgba(255, 182, 72, 0.3);
  box-shadow: 0 0 20px rgba(255, 182, 72, 0.6);
  transform: translateY(-2px);
}
.collect-btn-lg.collected {
  background: linear-gradient(135deg, rgba(255, 182, 72, 0.5), rgba(255, 71, 87, 0.3));
  box-shadow: 0 0 20px rgba(255, 182, 72, 0.6);
  color: #fff;
}

.answer-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 15px; padding: 20px; margin-bottom: 20px;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}
.answer-header { display: flex; gap: 14px; margin-bottom: 14px; }
.answer-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
.answer-info { flex: 1; }
.answer-author {
  font-size: 1rem; color: var(--cyan); font-weight: 500; display: block;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}
.answer-time { font-size: 0.8rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.answer-card p { font-size: 0.95rem; color: rgba(230, 241, 255, 0.75); line-height: 1.7; margin-bottom: 14px; }
.answer-like { background: transparent; border: none; color: rgba(230, 241, 255, 0.5); font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
.answer-like:hover { color: var(--red); text-shadow: 0 0 8px rgba(255, 71, 87, 0.6); }
.answer-like.liked { color: var(--red); text-shadow: 0 0 12px rgba(255, 71, 87, 0.7); }

.group-header { display: flex; gap: 20px; margin-bottom: 25px; }
.group-icon-lg {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  color: #fff; font-size: 2rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.5);
}
.group-meta { display: flex; gap: 20px; margin-top: 10px; }
.group-meta span { font-size: 0.9rem; color: rgba(230, 241, 255, 0.55); font-family: var(--font-mono); }
.group-actions { margin-bottom: 25px; }
.group-action-btn {
  padding: 14px 35px; border-radius: 25px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.22), rgba(196, 113, 255, 0.22));
  border: 1px solid var(--cyan);
  color: var(--cyan);
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.3);
}
.group-action-btn:hover {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.45), rgba(196, 113, 255, 0.45));
  color: #fff;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.55);
}
.group-action-btn.joined {
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.25), rgba(0, 229, 255, 0.2));
  border-color: var(--green);
  color: var(--green);
  box-shadow: 0 0 16px rgba(0, 255, 163, 0.45);
}
.group-content h3 {
  color: #fff; margin: 20px 0 12px; font-size: 1.15rem;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
.group-content p { color: rgba(230, 241, 255, 0.7); line-height: 1.6; }
.group-posts { display: flex; flex-direction: column; gap: 15px; }
.group-post {
  padding: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: 12px;
  transition: all 0.3s;
}
.group-post:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.2);
}
.group-post h4 { color: #fff; font-size: 1rem; margin-bottom: 8px; text-shadow: 0 0 8px rgba(0, 229, 255, 0.35); }
.group-post p { color: rgba(230, 241, 255, 0.55); font-size: 0.85rem; margin-bottom: 10px; }
.post-meta { display: flex; gap: 15px; }
.post-meta span { font-size: 0.75rem; color: rgba(230, 241, 255, 0.4); font-family: var(--font-mono); }

.comment-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(2, 4, 10, 0.85);
  backdrop-filter: blur(6px);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.comment-modal-content {
  width: 90%; max-width: 500px;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--cyan);
  border-radius: 20px; padding: 30px; position: relative;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.35), 0 24px 60px rgba(0, 0, 0, 0.6);
}
.comment-modal-content h3 {
  font-size: 1.4rem; font-weight: 600; color: #fff; margin-bottom: 20px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
}
.comment-textarea {
  width: 100%; padding: 15px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-glow);
  border-radius: 15px;
  color: #fff; font-size: 0.95rem; outline: none; resize: none;
  transition: all 0.3s;
  font-family: inherit;
}
.comment-textarea:focus {
  border-color: var(--cyan);
  box-shadow: inset 0 0 12px rgba(0, 229, 255, 0.25);
}
.comment-modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
.cancel-btn {
  padding: 12px 25px; border-radius: 15px;
  background: rgba(230, 241, 255, 0.08);
  border: 1px solid rgba(230, 241, 255, 0.2);
  color: rgba(230, 241, 255, 0.7);
  font-size: 0.95rem; cursor: pointer; transition: all 0.3s;
}
.cancel-btn:hover {
  background: rgba(230, 241, 255, 0.15);
  border-color: rgba(230, 241, 255, 0.4);
}
.submit-btn {
  padding: 12px 30px; border-radius: 15px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 18px rgba(0, 229, 255, 0.4);
}
.submit-btn:hover { transform: scale(1.03); box-shadow: 0 6px 24px rgba(0, 229, 255, 0.6); }

.publish-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(2, 4, 10, 0.85);
  backdrop-filter: blur(6px);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.publish-modal-content {
  width: 90%; max-width: 600px;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--cyan);
  border-radius: 20px; padding: 35px; position: relative;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.35), 0 24px 60px rgba(0, 0, 0, 0.6);
}
.publish-modal-content h3 {
  font-size: 1.5rem; font-weight: 600; color: #fff; margin-bottom: 25px;
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.55);
  letter-spacing: 0.5px;
}
.publish-input {
  width: 100%; padding: 15px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-glow);
  border-radius: 15px;
  color: #fff; font-size: 1rem; outline: none; margin-bottom: 18px;
  transition: all 0.3s;
  font-family: inherit;
}
.publish-input:focus {
  border-color: var(--cyan);
  box-shadow: inset 0 0 12px rgba(0, 229, 255, 0.25), 0 0 14px rgba(0, 229, 255, 0.3);
}
.publish-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.tag-input {
  padding: 10px 15px; border-radius: 12px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-glow);
  color: #fff; font-size: 0.9rem; outline: none; flex: 1; min-width: 150px;
  transition: all 0.3s;
}
.tag-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}
.publish-tag {
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(196, 113, 255, 0.25));
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 12px;
  font-size: 0.85rem; color: var(--cyan);
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
}
.publish-tag span { cursor: pointer; color: var(--red); font-size: 1rem; }
.publish-textarea {
  width: 100%; padding: 15px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-glow);
  border-radius: 15px;
  color: #fff; font-size: 0.95rem; outline: none; resize: none; margin-bottom: 20px;
  transition: all 0.3s;
  font-family: inherit;
}
.publish-textarea:focus {
  border-color: var(--cyan);
  box-shadow: inset 0 0 12px rgba(0, 229, 255, 0.25), 0 0 14px rgba(0, 229, 255, 0.3);
}
.publish-submit {
  width: 100%; padding: 16px; border-radius: 18px;
  background: linear-gradient(135deg, var(--magenta), var(--cyan));
  border: none; color: #fff;
  font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 24px rgba(196, 113, 255, 0.45);
}
.publish-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(196, 113, 255, 0.65), 0 0 20px rgba(0, 229, 255, 0.4);
}
.publish-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 创建群聊弹窗 */
.create-group-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(2, 4, 10, 0.85);
  backdrop-filter: blur(6px);
  z-index: 1001; display: flex; align-items: center; justify-content: center;
}
.create-group-modal-content {
  width: 90%; max-width: 460px;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(0, 255, 163, 0.5);
  border-radius: 20px; padding: 32px; position: relative;
  box-shadow: 0 0 32px rgba(0, 255, 163, 0.3), 0 24px 60px rgba(0, 0, 0, 0.6);
}
.create-group-modal-content h3 {
  font-size: 1.4rem; font-weight: 600; color: #fff; margin-bottom: 22px;
  text-shadow: 0 0 14px rgba(0, 255, 163, 0.45);
  letter-spacing: 0.5px;
}
.create-group-form .create-group-err {
  color: var(--red);
  font-size: 0.85rem;
  margin-bottom: 14px;
  padding: 6px 10px;
  background: rgba(255, 71, 87, 0.12);
  border-radius: 8px;
  border: 1px solid rgba(255, 71, 87, 0.3);
}
.create-group-actions {
  display: flex; gap: 12px; margin-top: 16px;
}
.create-group-actions .cancel-btn,
.create-group-actions .submit-btn {
  flex: 1; padding: 12px; border-radius: 12px;
  font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: all 0.25s;
}
.create-group-actions .cancel-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}
.create-group-actions .cancel-btn:hover { background: rgba(255, 255, 255, 0.12); }
.create-group-actions .submit-btn {
  background: linear-gradient(135deg, var(--green), var(--cyan));
  border: none; color: #02040a;
  box-shadow: 0 4px 16px rgba(0, 255, 163, 0.35);
}
.create-group-actions .submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(0, 255, 163, 0.55);
}

.topic-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(2, 4, 10, 0.85);
  backdrop-filter: blur(6px);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.topic-modal-content {
  width: 90%; max-width: 700px;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--cyan);
  border-radius: 20px; padding: 35px; position: relative;
  max-height: 80vh; overflow-y: auto;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.35), 0 24px 60px rgba(0, 0, 0, 0.6);
}
.topic-header { margin-bottom: 25px; }
.topic-header h2 {
  font-size: 1.8rem; font-weight: 600; color: #fff; margin-bottom: 12px;
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.55);
}
.topic-stats { display: flex; gap: 20px; }
.topic-stats span { font-size: 0.95rem; color: rgba(230, 241, 255, 0.6); font-family: var(--font-mono); }
.topic-stats .trend { color: var(--green); text-shadow: 0 0 8px rgba(0, 255, 163, 0.5); }
.topic-related {
  margin-bottom: 25px; padding: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: 15px;
}
.related-title { font-size: 0.95rem; color: rgba(230, 241, 255, 0.6); margin-right: 10px; }
.related-tag {
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.25), rgba(0, 229, 255, 0.2));
  border: 1px solid rgba(196, 113, 255, 0.35);
  border-radius: 12px;
  font-size: 0.85rem; color: #e9d5ff; cursor: pointer; transition: all 0.3s; margin-right: 10px;
  box-shadow: 0 0 10px rgba(196, 113, 255, 0.2);
}
.related-tag:hover {
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.45), rgba(0, 229, 255, 0.4));
  box-shadow: 0 0 18px rgba(196, 113, 255, 0.45);
  color: #fff;
}
.topic-content h3 {
  font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 20px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
}
.topic-sort-tip {
  font-size: 0.8rem; font-weight: 400;
  color: rgba(255, 182, 72, 0.7);
  text-shadow: 0 0 6px rgba(255, 182, 72, 0.3);
}
.topic-posts { display: flex; flex-direction: column; gap: 15px; }
.topic-post {
  display: flex; align-items: center; gap: 15px; padding: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: 15px; cursor: pointer; transition: all 0.3s;
  position: relative;
}
.topic-post:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.25);
  transform: translateX(4px);
}
.topic-post-top {
  background: linear-gradient(135deg, rgba(255, 182, 72, 0.1), var(--bg-card));
  border-color: rgba(255, 182, 72, 0.3);
}
.topic-post-top:hover {
  border-color: var(--gold);
  box-shadow: 0 0 18px rgba(255, 182, 72, 0.3);
}
.topic-post-rank {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0, 229, 255, 0.15);
  border: 1px solid var(--border-glow);
  color: rgba(230, 241, 255, 0.7);
  font-size: 0.9rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: var(--font-mono);
}
.topic-post-rank.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ff7e5f);
  color: #1a0f05;
  box-shadow: 0 0 14px rgba(255, 215, 0, 0.6);
}
.topic-post-rank.rank-silver {
  background: linear-gradient(135deg, #e0e0e0, #a8a8a8);
  color: #1a0f05;
  box-shadow: 0 0 12px rgba(220, 220, 220, 0.5);
}
.topic-post-rank.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #8b4513);
  color: #fff;
  box-shadow: 0 0 12px rgba(205, 127, 50, 0.5);
}
.post-avatar-sm {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  cursor: pointer;
  transition: transform 0.25s;
}
.post-avatar-sm:hover { transform: scale(1.1); border-color: var(--cyan); }
.post-info { flex: 1; min-width: 0; }
.post-info h4 { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 8px; text-shadow: 0 0 8px rgba(0, 229, 255, 0.35); }
.post-meta { display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.post-author { color: var(--cyan) !important; cursor: pointer; }
.post-author:hover { text-shadow: 0 0 8px rgba(0, 229, 255, 0.7); }
.post-heat {
  color: var(--gold) !important;
  text-shadow: 0 0 8px rgba(255, 182, 72, 0.5);
}

/* 用户主页弹窗 */
.user-profile-modal { max-width: 720px; }
.user-profile-body { padding: 30px; }
.up-header {
  display: flex; gap: 24px; padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
  margin-bottom: 24px;
}
.up-avatar {
  width: 90px; height: 90px; border-radius: 50%;
  border: 2px solid var(--cyan);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
  flex-shrink: 0;
}
.up-info { flex: 1; }
.up-name {
  font-size: 1.5rem; font-weight: 700; color: #fff;
  margin-bottom: 6px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
}
.up-title { font-size: 0.9rem; color: rgba(230, 241, 255, 0.6); margin-bottom: 14px; }
.up-stats {
  display: flex; flex-wrap: wrap; gap: 18px;
  font-size: 0.85rem; color: rgba(230, 241, 255, 0.65);
  margin-bottom: 12px;
}
.up-stat strong {
  color: var(--cyan);
  font-size: 1.05rem;
  font-family: var(--font-mono);
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  margin-right: 4px;
}
.up-rank-info { margin-top: 6px; }
.up-rank-badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 14px;
  font-size: 0.8rem;
  background: linear-gradient(135deg, rgba(255, 182, 72, 0.25), rgba(255, 94, 58, 0.2));
  border: 1px solid rgba(255, 182, 72, 0.5);
  color: var(--gold);
  text-shadow: 0 0 8px rgba(255, 182, 72, 0.5);
}
.up-rank-unlisted {
  background: rgba(230, 241, 255, 0.08);
  border-color: rgba(230, 241, 255, 0.2);
  color: rgba(230, 241, 255, 0.55);
  text-shadow: none;
}
.up-tabs {
  display: flex; gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.15);
}
.up-tabs span {
  padding: 10px 18px;
  font-size: 0.9rem;
  color: rgba(230, 241, 255, 0.55);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.25s;
}
.up-tabs span:hover { color: rgba(0, 229, 255, 0.8); }
.up-tabs span.active {
  color: var(--cyan);
  border-bottom-color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
}
.up-list { max-height: 460px; overflow-y: auto; padding-right: 6px; }
.qa-solved-tag {
  color: #28a745 !important;
  text-shadow: 0 0 6px rgba(40, 167, 69, 0.5);
}

.my-publish-list { max-height: 500px; overflow-y: auto; padding: 10px; }
.my-publish-item {
  display: flex; gap: 15px; padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: 15px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;
}
.my-publish-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.25);
}
.publish-rank {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  color: #fff; font-size: 0.95rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: var(--font-mono);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
}
.publish-info { flex: 1; }
.publish-title {
  font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
.publish-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.publish-tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(196, 113, 255, 0.25), rgba(0, 229, 255, 0.2));
  border-radius: 10px;
  font-size: 0.8rem; color: #e9d5ff;
  box-shadow: 0 0 8px rgba(196, 113, 255, 0.2);
}
.publish-stats { display: flex; gap: 20px; font-size: 0.85rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.publish-time { font-size: 0.8rem; color: rgba(230, 241, 255, 0.4); flex-shrink: 0; font-family: var(--font-mono); }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 20px; filter: drop-shadow(0 0 12px rgba(0, 229, 255, 0.5)); }
.empty-state p { font-size: 1rem; color: rgba(230, 241, 255, 0.6); margin-bottom: 25px; }
.empty-btn {
  padding: 14px 35px; border-radius: 20px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
}
.empty-btn:hover { transform: scale(1.05); box-shadow: 0 8px 28px rgba(0, 229, 255, 0.6); }

.community-footer {
  text-align: center; padding: 30px;
  color: rgba(230, 241, 255, 0.4); font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.profile-content { padding: 20px 0; }
.profile-header {
  display: flex; gap: 25px; align-items: center; margin-bottom: 30px; padding-bottom: 25px;
  border-bottom: 1px solid var(--border-glow);
}
.profile-avatar {
  width: 96px; height: 96px; border-radius: 50%;
  border: 3px solid var(--cyan);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.55);
}
.profile-info { flex: 1; }
.profile-info h3 {
  font-size: 1.6rem; font-weight: 600; color: #fff; margin-bottom: 8px;
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.5px;
}
.profile-title { font-size: 0.95rem; color: var(--cyan); margin-bottom: 12px; text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }
.profile-tags { display: flex; gap: 10px; }
.profile-tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.22), rgba(0, 229, 255, 0.2));
  border: 1px solid rgba(0, 255, 163, 0.35);
  border-radius: 12px;
  font-size: 0.85rem; color: var(--green);
  box-shadow: 0 0 10px rgba(0, 255, 163, 0.25);
}
.profile-stats {
  display: flex; gap: 30px; justify-content: center; padding: 20px;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glow);
  border-radius: 15px; margin-bottom: 25px;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08) inset, 0 4px 24px rgba(0, 0, 0, 0.4);
}
.stat-item { text-align: center; }
.stat-num {
  font-size: 1.8rem; font-weight: 700; color: var(--cyan); display: block;
  font-family: var(--font-mono);
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.55);
}
.stat-text { font-size: 0.85rem; color: rgba(230, 241, 255, 0.55); }
.profile-section { margin-bottom: 25px; }
.profile-section h4 {
  font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.45);
}
.mini-post {
  padding: 15px;
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s;
}
.mini-post:hover {
  background: var(--bg-card-hover);
  border-color: var(--cyan);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.2);
}
.mini-title { font-size: 0.95rem; color: #fff; font-weight: 500; display: block; margin-bottom: 6px; text-shadow: 0 0 6px rgba(0, 229, 255, 0.3); }
.mini-meta { font-size: 0.8rem; color: rgba(230, 241, 255, 0.5); font-family: var(--font-mono); }
.empty-text { font-size: 0.95rem; color: rgba(230, 241, 255, 0.5); text-align: center; padding: 30px; }

.modal-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px;
  border-bottom: 1px solid var(--border-glow);
  position: relative;
}
.modal-header::after {
  content: ''; position: absolute; left: 0; bottom: -1px;
  height: 2px; width: 60%;
  background: linear-gradient(90deg, var(--cyan), var(--magenta), transparent);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
}
.modal-header h2 {
  font-size: 1.4rem; font-weight: 600; color: #fff; margin: 0;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}
.collect-tabs {
  display: flex; gap: 25px; margin-bottom: 25px; padding-bottom: 15px;
  border-bottom: 1px solid var(--border-glow);
}
.collect-tabs span {
  font-size: 1rem; color: rgba(230, 241, 255, 0.5); cursor: pointer; padding-bottom: 10px;
  border-bottom: 2px solid transparent; transition: all 0.3s;
}
.collect-tabs span.active {
  color: var(--cyan);
  border-color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}
.collect-list { max-height: 500px; overflow-y: auto; padding: 10px; }
.uncollect-btn {
  padding: 10px 20px; border-radius: 12px;
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: var(--red);
  font-size: 0.85rem; cursor: pointer; transition: all 0.3s; flex-shrink: 0;
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}
.uncollect-btn:hover {
  background: rgba(255, 71, 87, 0.3);
  box-shadow: 0 0 18px rgba(255, 71, 87, 0.5);
  color: #fff;
}

.settings-content { padding: 20px 0; }
.settings-section { margin-bottom: 30px; }
.settings-section h3 {
  font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border-glow);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.45);
}
.setting-item {
  display: flex; justify-content: space-between; align-items: center; padding: 15px 0;
  border-bottom: 1px solid rgba(230, 241, 255, 0.1);
}
.setting-label { font-size: 0.95rem; color: rgba(230, 241, 255, 0.75); }
.setting-input {
  padding: 10px 15px; border-radius: 10px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-glow);
  color: #fff; font-size: 0.9rem; outline: none; width: 200px;
  transition: all 0.3s;
  font-family: inherit;
}
.setting-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}
.toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-switch .slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(230, 241, 255, 0.18); transition: 0.4s; border-radius: 28px;
}
.toggle-switch .slider:before {
  position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px;
  background: rgba(230, 241, 255, 0.6); transition: 0.4s; border-radius: 50%;
  box-shadow: 0 0 8px rgba(230, 241, 255, 0.3);
}
.toggle-switch input:checked + .slider {
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.45);
}
.toggle-switch input:checked + .slider:before {
  transform: translateX(24px); background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}
.settings-actions {
  display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px;
  border-top: 1px solid var(--border-glow);
}
.save-btn {
  padding: 14px 35px; border-radius: 15px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
}
.save-btn:hover { transform: scale(1.03); box-shadow: 0 6px 24px rgba(0, 229, 255, 0.6); }

.qa-status {
  padding: 2px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;
  font-family: var(--font-mono);
}
.qa-status.solved {
  background: rgba(0, 255, 163, 0.2);
  color: var(--green);
  border: 1px solid rgba(0, 255, 163, 0.35);
  box-shadow: 0 0 8px rgba(0, 255, 163, 0.3);
}
.qa-status.unsolved {
  background: rgba(255, 182, 72, 0.2);
  color: var(--gold);
  border: 1px solid rgba(255, 182, 72, 0.35);
  box-shadow: 0 0 8px rgba(255, 182, 72, 0.3);
}

.qa-answers-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px;
  border-bottom: 1px solid var(--border-glow);
}
.qa-answers-header h3 {
  margin: 0; color: #fff;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}
.solve-btn {
  padding: 6px 14px; border-radius: 12px;
  background: rgba(0, 255, 163, 0.25);
  border: 1px solid rgba(0, 255, 163, 0.45);
  color: var(--green);
  font-size: 0.85rem; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 0 10px rgba(0, 255, 163, 0.3);
}
.solve-btn:hover {
  background: rgba(0, 255, 163, 0.4);
  box-shadow: 0 0 18px rgba(0, 255, 163, 0.5);
  color: #fff;
}

.chat-btn {
  margin-left: 8px; padding: 4px 12px; border-radius: 12px;
  background: rgba(0, 229, 255, 0.25);
  border: 1px solid rgba(0, 229, 255, 0.45);
  color: var(--cyan);
  font-size: 0.8rem; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}
.chat-btn:hover {
  background: rgba(0, 229, 255, 0.45);
  color: #fff;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.55);
}

.applied-badge {
  padding: 4px 12px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.25), rgba(0, 229, 255, 0.2));
  border: 1px solid rgba(0, 255, 163, 0.4);
  color: var(--green);
  font-size: 0.8rem; font-weight: 600; white-space: nowrap;
  font-family: var(--font-mono);
  box-shadow: 0 0 10px rgba(0, 255, 163, 0.35);
}

.chat-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(2, 4, 10, 0.75);
  backdrop-filter: blur(6px);
  display: flex; justify-content: center; align-items: center; z-index: 2000;
}
.chat-modal-content {
  width: 420px; max-width: 92%; height: 560px; max-height: 88%;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--cyan);
  border-radius: 18px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.35), 0 24px 60px rgba(0, 0, 0, 0.6);
}
.chat-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-glow);
  position: relative;
}
.chat-modal-header::after {
  content: ''; position: absolute; left: 0; bottom: -1px;
  height: 2px; width: 50%;
  background: linear-gradient(90deg, var(--cyan), var(--magenta), transparent);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
}
.chat-modal-peer { display: flex; align-items: center; gap: 12px; }
.chat-modal-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid var(--cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.45);
}
.chat-modal-name { color: #fff; font-weight: 600; font-size: 1rem; text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }
.chat-modal-status { color: rgba(230, 241, 255, 0.7); font-size: 0.8rem; font-family: var(--font-mono); }
.chat-modal-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.chat-msg { display: flex; flex-direction: column; align-items: flex-start; max-width: 75%; }
.chat-msg.mine { align-self: flex-end; align-items: flex-end; }
.chat-bubble {
  padding: 10px 14px; border-radius: 14px;
  background: rgba(0, 229, 255, 0.15);
  border: 1px solid rgba(0, 229, 255, 0.25);
  color: #fff; font-size: 0.9rem; word-break: break-word;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.15);
}
.chat-msg.mine .chat-bubble {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.65), rgba(196, 113, 255, 0.55));
  border-color: rgba(0, 229, 255, 0.45);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
}
.chat-time { color: rgba(230, 241, 255, 0.5); font-size: 0.7rem; margin-top: 4px; font-family: var(--font-mono); }
.chat-modal-footer {
  display: flex; gap: 10px; padding: 14px 20px;
  border-top: 1px solid var(--border-glow);
}
.chat-input {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.35);
  color: #fff; font-size: 0.9rem; outline: none;
  transition: all 0.3s;
}
.chat-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
}
.chat-send-btn {
  padding: 10px 20px; border-radius: 12px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 229, 255, 0.4);
}
.chat-send-btn:hover { transform: scale(1.05); box-shadow: 0 6px 22px rgba(0, 229, 255, 0.6); }

.group-chat-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(2, 4, 10, 0.8);
  backdrop-filter: blur(6px);
  display: flex; justify-content: center; align-items: center; z-index: 2100;
}
.group-chat-modal-content {
  width: 460px; max-width: 92%; height: 600px; max-height: 88%;
  background: rgba(12, 22, 48, 0.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--cyan);
  border-radius: 18px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.35), 0 24px 60px rgba(0, 0, 0, 0.6);
}
.group-chat-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-glow);
  position: relative;
}
.group-chat-modal-header::after {
  content: ''; position: absolute; left: 0; bottom: -1px;
  height: 2px; width: 50%;
  background: linear-gradient(90deg, var(--cyan), var(--magenta), transparent);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
}
.group-chat-modal-peer { display: flex; align-items: center; gap: 12px; }
.group-chat-modal-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.2rem;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
}
.group-chat-modal-name { color: #fff; font-weight: 600; font-size: 1rem; text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }
.group-chat-modal-status { color: rgba(230, 241, 255, 0.7); font-size: 0.8rem; font-family: var(--font-mono); }
.group-chat-modal-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.group-chat-msg { display: flex; flex-direction: column; align-items: flex-start; max-width: 75%; }
.group-chat-msg.mine { align-self: flex-end; align-items: flex-end; }
.group-chat-sender { color: var(--cyan); font-size: 0.72rem; margin-bottom: 3px; text-shadow: 0 0 6px rgba(0, 229, 255, 0.4); }
.group-chat-bubble {
  padding: 10px 14px; border-radius: 14px;
  background: rgba(0, 229, 255, 0.15);
  border: 1px solid rgba(0, 229, 255, 0.25);
  color: #fff; font-size: 0.9rem; word-break: break-word;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.15);
}
.group-chat-msg.mine .group-chat-bubble {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.65), rgba(196, 113, 255, 0.55));
  border-color: rgba(0, 229, 255, 0.45);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
}
.group-chat-time { color: rgba(230, 241, 255, 0.5); font-size: 0.7rem; margin-top: 4px; font-family: var(--font-mono); }
.group-chat-modal-footer {
  display: flex; gap: 10px; padding: 14px 20px;
  border-top: 1px solid var(--border-glow);
}
.group-chat-input {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.35);
  color: #fff; font-size: 0.9rem; outline: none;
  transition: all 0.3s;
}
.group-chat-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
}
.group-chat-send-btn {
  padding: 10px 20px; border-radius: 12px;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  border: none; color: #fff;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 229, 255, 0.4);
}
.group-chat-send-btn:hover { transform: scale(1.05); box-shadow: 0 6px 22px rgba(0, 229, 255, 0.6); }

/* Toast 通知 */
.toast-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  z-index: 9999;
  animation: toast-slide-in 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.toast-notification.success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.95), rgba(25, 135, 84, 0.95));
  color: #fff;
  border: 1px solid rgba(40, 167, 69, 0.5);
}
.toast-notification.error {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.95), rgba(200, 35, 51, 0.95));
  color: #fff;
  border: 1px solid rgba(220, 53, 69, 0.5);
}
.toast-icon {
  font-size: 1.2rem;
}
@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>

<!-- =========================================================
     ⚠️ GLOBAL STYLE BLOCK FOR TELEPORTED MODALS（必须是全局，不能 scoped）
     Vue <teleport to="body"> 的组件 DOM 渲染在 <body> 下，
     外层 <style scoped> 的 data-v-hash 不会写到 body 子节点，
     导致所有弹窗相关的 .*modal 样式之前全部没生效 —— 这就是
     "弹窗偏在屏幕左侧/被切掉一半/遮罩只挡半边" 的真·根因。
   ========================================================= -->
<style>
/* ===== 全局弹窗覆盖层（所有 Teleport 到 body 的遮罩统一） =====
   注意：只加前缀 body > [job-]，避免污染 JobRecommend.vue 的弹窗样式 */
body > .jc-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  /* 关键：不要写 width/height: 100vw/100vh，
     它们会把纵向滚动条算进宽度并在 body{position:fixed} 下错算成 820px；
     用 inset:0 即可严格铺满视口的 Initial Containing Block（永远精确） */
  width: auto !important;
  height: auto !important;
  max-width: none !important;
  max-height: none !important;
  min-width: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(2, 4, 10, 0.84) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 99999 !important;
  transform: none !important;
}

/* 弹窗内容 —— 统一锁定视口居中、永远不超边（任何分辨率都不会被裁切） */
body > .jc-overlay > .jc-modal-card {
  position: relative !important;
  width: clamp(320px, 92vw, 880px) !important;
  max-width: calc(100vw - 48px) !important;
  height: auto !important;
  max-height: calc(100vh - 48px) !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 28px 32px !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
  transform: none !important;
  box-sizing: border-box !important;
  border-radius: 20px !important;
  border: 1px solid rgba(0, 229, 255, 0.45);
  background: rgba(12, 22, 48, 0.97);
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.35), 0 24px 64px rgba(0, 0, 0, 0.7);
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

/* 中小尺寸弹窗：评论 / 发布 / 创建群聊 */
body > .jc-overlay.jc-overlay-sm > .jc-modal-card {
  width: clamp(300px, 90vw, 560px) !important;
}
body > .jc-overlay.jc-overlay-md > .jc-modal-card {
  width: clamp(320px, 92vw, 640px) !important;
}
body > .jc-overlay.jc-overlay-topic > .jc-modal-card {
  width: clamp(320px, 92vw, 700px) !important;
}
body > .jc-overlay.jc-overlay-profile > .jc-modal-card {
  width: clamp(320px, 92vw, 720px) !important;
}

/* 聊天 / 群聊 —— 固定比例的高型弹窗 */
body > .jc-overlay.jc-overlay-chat > .jc-modal-card,
body > .jc-overlay.jc-overlay-group-chat > .jc-modal-card {
  width: clamp(300px, 90vw, 440px) !important;
  height: clamp(420px, 84vh, 620px) !important;
  max-height: calc(100vh - 48px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* 关闭按钮固定在弹窗卡片右上角，永远不跑偏 */
body > .jc-overlay > .jc-modal-card > .jc-close,
body > .jc-overlay .close-btn {
  position: absolute !important;
  top: 20px !important;
  right: 24px !important;
  left: auto !important;
  bottom: auto !important;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  line-height: 40px !important;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
  background: rgba(255, 71, 87, 0.22);
  border: 1px solid rgba(255, 71, 87, 0.55);
  color: #ff8a93;
  font-size: 1.15rem;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.35);
  transition: all 0.25s ease;
}
body > .jc-overlay .close-btn:hover {
  background: rgba(255, 71, 87, 0.4);
  color: #fff;
  transform: rotate(90deg);
  box-shadow: 0 0 22px rgba(255, 71, 87, 0.65);
}

/* 岗位详情大标题 & 滚动条细化 */
body > .jc-overlay .detail-body h2 {
  font-size: clamp(1.25rem, 2.2vw, 1.8rem);
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
  line-height: 1.35;
  letter-spacing: 0.3px;
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.55);
  word-break: break-word;
  padding-right: 60px;
}
body > .jc-overlay > .jc-modal-card::-webkit-scrollbar { width: 8px; }
body > .jc-overlay > .jc-modal-card::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.35); border-radius: 8px;
}
</style>
