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
          </div>
          <div v-if="showUserMenu" class="user-menu">
            <div class="menu-item" @click="handleMenuClick('profile')">👤 个人主页</div>
            <div class="menu-item" @click="handleMenuClick('publish')">📝 我的发布</div>
            <div class="menu-item" @click="handleMenuClick('collect')">💾 我的收藏</div>
            <div class="menu-item" @click="handleMenuClick('settings')">⚙️ 设置</div>
            <div class="menu-divider"></div>
            <div class="menu-item logout" @click="handleMenuClick('logout')">🚪 退出登录</div>
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
            <div class="interview-list">
              <div v-for="(item, index) in filteredInterviews" :key="index" class="interview-card" @click="openDetail('interview', item)">
                <div class="card-rank" :class="getRankClass(index)">{{ index + 1 }}</div>
                <div class="card-main">
                  <div class="card-badges">
                      <span v-if="item.likes > 200" class="badge hot">🔥 热门</span>
                      <span v-if="item.comments > 100" class="badge active">💬 热议</span>
                    </div>
                    <div class="card-header">
                      <img :src="item.avatar" class="card-avatar" />
                      <div class="card-title-wrap">
                        <h3 class="card-title">{{ item.title }}</h3>
                        <div class="card-meta">
                          <span class="card-author">{{ item.author }}</span>
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

          <div v-if="activeTab === 'job'" class="tab-content">
            <div class="section-header">
              <span class="section-title">💼 {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '岗位速递' }}</span>
              <div class="section-filters">
                <span :class="{ active: jobFilter === 'all' }" @click="jobFilter = 'all'">全部</span>
                <span :class="{ active: jobFilter === 'campus' }" @click="jobFilter = 'campus'">校招</span>
                <span :class="{ active: jobFilter === 'social' }" @click="jobFilter = 'social'">社招</span>
              </div>
            </div>
            <div class="job-grid">
              <div v-for="(job, index) in filteredJobs" :key="job.id" class="job-card" @click="openDetail('job', job)">
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
                  <button class="apply-btn" :class="{ applied: appliedJobIds.has(job.id) }" @click.stop="handleApply(job)">
                    {{ appliedJobIds.has(job.id) ? '✓ 已投递' : '立即投递' }}
                  </button>
                  <button class="collect-btn" :class="{ collected: job.collected }" @click.stop="toggleJobCollect(job)">
                    {{ job.collected ? '⭐' : '☆' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'qa'" class="tab-content">
            <div class="section-header">
              <span class="section-title">❓ {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '求职问答' }}</span>
              <div class="section-filters">
                <span :class="{ active: qaFilter === 'unsolved' }" @click="qaFilter = 'unsolved'">待解答</span>
                <span :class="{ active: qaFilter === 'solved' }" @click="qaFilter = 'solved'">已解答</span>
              </div>
            </div>
            <div class="qa-list">
              <div v-for="(qa, index) in filteredQAs" :key="index" class="qa-card" @click="openDetail('qa', qa)">
                <div class="qa-header">
                  <img :src="qa.avatar" class="qa-avatar" />
                  <div class="qa-title-wrap">
                    <h3 class="qa-title">{{ qa.title }}</h3>
                    <div class="qa-meta">
                      <span>{{ qa.author }}</span>
                      <span>{{ qa.time }}</span>
                    </div>
                  </div>
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
                  <span class="qa-action-btn" :class="qa.solved ? 'solved' : 'unsolved'">
                    {{ qa.solved ? '✅已解决' : '⏳待解答' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'group'" class="tab-content">
            <div class="section-header">
              <span class="section-title">👨‍👩‍👧‍👦 {{ searchQuery ? `搜索 "${searchQuery}" 的结果` : '求职小组' }}</span>
            </div>
            <div class="group-grid">
              <div v-for="(group, index) in groupList" :key="index" class="group-card" @click="openDetail('group', group)">
                <div class="group-icon">{{ group.name.charAt(0) }}</div>
                <h3 class="group-name">{{ group.name }}</h3>
                <p class="group-desc">{{ group.desc }}</p>
                <div class="group-stats">
                  <span>{{ group.members }}成员</span>
                  <span>{{ group.posts }}帖子/周</span>
                </div>
                <button class="join-btn" @click.stop="toggleJoin(group)">{{ group.joined ? '已加入' : '加入' }}</button>
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
            <h4>热门话题</h4>
            <div class="topic-list">
              <div v-for="(topic, index) in hotTopics" :key="index" class="topic-item" @click="openTopicDetail(topic)">
                <span class="topic-rank">{{ index + 1 }}</span>
                <span class="topic-name">{{ topic.name }}</span>
                <span class="topic-trend">{{ topic.trend }}</span>
              </div>
            </div>
          </div>

          <div class="recommend-users">
            <h4>推荐关注</h4>
            <div class="user-list">
              <div v-for="(user, index) in recommendUsers" :key="index" class="user-item">
                <img :src="user.avatar" class="user-avatar" />
                <div class="user-detail">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-title">{{ user.title }}</span>
                </div>
                <button class="follow-btn" @click="toggleFollow(user)">{{ user.followed ? '已关注' : '+关注' }}</button>
              </div>
            </div>
          </div>

          <div class="weekly-rank">
            <h4>本周活跃榜</h4>
            <div class="rank-list">
              <div v-for="(rank, index) in weeklyRank" :key="index" class="rank-item">
                <span class="rank-num">{{ index + 1 }}</span>
                <img :src="rank.avatar" class="rank-avatar" />
                <span class="rank-name">{{ rank.name }}</span>
                <span class="rank-score">{{ rank.score }}积分</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer class="community-footer">
        <p>&copy; 2026 JobHub求职社区</p>
      </footer>
    </div>

    <div v-if="showDetail" class="detail-modal" @click.self="closeDetail">
      <div class="modal-content">
        <button class="close-btn" @click="closeDetail">✕</button>
        <div v-if="detailType === 'interview'" class="detail-body">
          <div class="detail-header">
            <img :src="detailData.avatar" class="detail-avatar" />
            <div class="detail-author">
              <h2>{{ detailData.title }}</h2>
              <div class="detail-meta">
                <span>{{ detailData.author }}</span>
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
                <img :src="comment.avatar" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
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
          <div class="detail-content">
            <h3>岗位职责：</h3>
            <ul>
              <li>负责相关技术开发工作</li>
              <li>参与需求分析和技术方案设计</li>
              <li>与团队协作完成项目交付</li>
            </ul>
            <h3>岗位要求：</h3>
            <ul>
              <li>计算机相关专业，本科及以上学历</li>
              <li>熟悉相关技术栈</li>
              <li>良好的沟通能力和团队协作精神</li>
            </ul>
          </div>
          <div class="job-detail-actions">
            <button class="apply-btn-lg" :class="{ applied: appliedJobIds.has(detailData.id) }" @click="handleApply(detailData)">
              {{ appliedJobIds.has(detailData.id) ? '✓ 已投递简历' : '立即投递简历' }}
            </button>
            <button class="collect-btn-lg" :class="{ collected: detailData.collected }" @click="toggleJobCollect(detailData)">
              {{ detailData.collected ? '⭐已收藏' : '☆收藏岗位' }}
            </button>
          </div>
        </div>

        <div v-if="detailType === 'qa'" class="detail-body">
          <div class="detail-header">
            <img :src="detailData.avatar" class="detail-avatar" />
            <div class="detail-author">
              <h2>{{ detailData.title }}</h2>
              <div class="detail-meta">
                <span>{{ detailData.author }}</span>
                <span>{{ detailData.time }}</span>
              </div>
            </div>
          </div>
          <div class="detail-tags">
            <span v-for="tag in detailData.tags" :key="tag" class="detail-tag">{{ tag }}</span>
          </div>
          <div class="detail-content">
            <h3>问题描述：</h3>
            <p>{{ detailData.preview }}</p>
            <h3>最佳回答：</h3>
            <div class="answer-card">
              <div class="answer-header">
                <img :src="detailData.bestAnswer.avatar" class="answer-avatar" />
                <div class="answer-info">
                  <span class="answer-author">{{ detailData.bestAnswer.author }}</span>
                  <span class="answer-time">{{ detailData.bestAnswer.time }}</span>
                </div>
              </div>
              <p>{{ detailData.bestAnswer.content }}</p>
              <button class="answer-like" :class="{ liked: detailData.bestAnswer.liked }" @click="toggleAnswerLike(detailData)">
                {{ detailData.bestAnswer.liked ? '❤️' : '🤍' }} {{ detailData.bestAnswer.likes }}
              </button>
            </div>
          </div>
          <div class="comment-section">
            <h3>更多回答 ({{ detailData.answers - 1 }})</h3>
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

    <div v-if="showCommentModal" class="comment-modal" @click.self="closeCommentModal">
      <div class="comment-modal-content">
        <button class="close-btn" @click="closeCommentModal">✕</button>
        <h3>发表评论</h3>
        <textarea v-model="commentText" rows="4" placeholder="写下你的评论..." class="comment-textarea"></textarea>
        <div class="comment-modal-actions">
          <button class="cancel-btn" @click="closeCommentModal">取消</button>
          <button class="submit-btn" @click="submitComment">发布评论</button>
        </div>
      </div>
    </div>

    <div v-if="showPublishModal" class="publish-modal" @click.self="closePublishModal">
      <div class="publish-modal-content">
        <button class="close-btn" @click="closePublishModal">✕</button>
        <h3>发布经验</h3>
        <div class="publish-form">
          <input v-model="publishForm.title" type="text" placeholder="标题" class="publish-input" />
          <div class="publish-tags">
            <input v-model="publishForm.tagInput" type="text" placeholder="输入标签后回车" class="tag-input" @keyup.enter="addTag" />
            <span v-for="(tag, index) in publishForm.tags" :key="index" class="publish-tag">{{ tag }}<span @click="removeTag(index)">×</span></span>
          </div>
          <textarea v-model="publishForm.content" rows="8" placeholder="分享你的面试经验..." class="publish-textarea"></textarea>
          <button class="publish-submit" @click="submitPublish">发布</button>
        </div>
      </div>
    </div>

    <div v-if="showTopicDetail" class="topic-modal" @click.self="closeTopicDetail">
      <div class="topic-modal-content">
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
          <h3>🔥 热门讨论</h3>
          <div class="topic-posts">
            <div v-for="(post, index) in topicRelatedPosts" :key="index" class="topic-post" @click="openDetail('interview', post)">
              <img :src="post.avatar" class="post-avatar-sm" />
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span>{{ post.author }}</span>
                  <span>{{ post.time }}</span>
                  <span>{{ post.comments }}评论</span>
                  <span>{{ post.likes }}赞</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showMyPublish" class="publish-modal" @click.self="showMyPublish = false">
      <div class="modal-content">
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

    <div v-if="showProfile" class="publish-modal" @click.self="showProfile = false">
      <div class="modal-content">
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

    <div v-if="showMyCollect" class="publish-modal" @click.self="showMyCollect = false">
      <div class="modal-content">
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
            <div v-for="(post, index) in myCollectedPosts" :key="index" class="my-publish-item" @click="openDetail('interview', post); showMyCollect = false">
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
            <div v-for="(job, index) in myCollectedJobs" :key="index" class="my-publish-item" @click="openDetail('job', job); showMyCollect = false">
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

    <div v-if="showSettings" class="publish-modal" @click.self="showSettings = false">
      <div class="modal-content">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import jobData from '../assets/all_cleaned_jobs.json'

const router = useRouter()

const bgCanvas = ref(null)
const activeTab = ref('interview')
const filterType = ref('hot')
const jobFilter = ref('all')
const qaFilter = ref('unsolved')
const searchQuery = ref('')
const showDetail = ref(false)
const detailType = ref('')
const detailData = ref({})
const showUserMenu = ref(false)
const showCommentModal = ref(false)
const showPublishModal = ref(false)
const showMyPublish = ref(false)
const showMyCollect = ref(false)
const showSettings = ref(false)
const showProfile = ref(false)
const showTopicDetail = ref(false)
const currentTopic = ref(null)
const commentText = ref('')
const newComment = ref('')
const currentCommentItem = ref(null)
const appliedJobIds = ref(new Set())
const collectTab = ref('post')

const publishForm = ref({
  title: '',
  tags: [],
  tagInput: '',
  content: ''
})

const currentUser = ref({
  name: '求职者小王',
  avatar: generateAvatar('求职者小王')
})

function generateAvatar(name) {
  const colors = ['#4a9eff', '#00d4aa', '#a855f7', '#f59e0b', '#ec4899', '#ef4444', '#10b981', '#3b82f6']
  const color = colors[name.length % colors.length]
  const initial = name.charAt(0)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${color}"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="600">${initial}</text></svg>`
  const utf8Bytes = new TextEncoder().encode(svg)
  const base64String = btoa(String.fromCharCode(...utf8Bytes))
  return `data:image/svg+xml;base64,${base64String}`
}

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
  if (salary >= 10000) {
    return (salary / 1000) + 'K'
  }
  return salary + ''
}

const companies = ['智联招聘', '前程无忧', 'BOSS直聘', '拉勾网', '猎聘网', '人才市场', '科技公司', '互联网企业', '软件公司', 'IT公司']

const realJobs = computed(() => {
  return jobData.slice(0, 50).map((job, index) => ({
    id: index,
    title: job.job_name,
    company: companies[Math.floor(Math.random() * companies.length)],
    city: job.city,
    salary: formatSalary(job.salary_avg),
    experience: job.work_exp,
    education: job.education,
    tags: extractTags(job.job_name),
    campus: job.work_exp === '经验不限' || job.job_name.includes('应届') || job.job_name.includes('实习') || job.job_name.includes('校招'),
    collected: false,
    applied: false
  }))
})

const stats = ref({ interviews: '2,340', jobs: jobData.length.toLocaleString(), questions: '1,560', online: '892' })
const hotKeywords = ['计算机', '前端', '后端', '算法', '数据', '测试', '运维', '开发']

const goBack = () => { router.push('/dashboard') }

const hotInterviews = ref([
  { 
    title: '分享计算机技术员面试经验', 
    author: '求职者小王', 
    avatar: generateAvatar('求职者小王'), 
    time: '5分钟前', 
    tags: ['面试', '计算机'], 
    comments: 29, 
    likes: 56, 
    views: 320, 
    liked: false, 
    collected: false,
    preview: '分享一下我最近面试技术员岗位的经验，主要考察了计算机基础知识、网络配置和故障排查能力...',
    commentList: [
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '3分钟前', content: '请问面试会问哪些技术问题？', likes: 5, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '1分钟前', content: '好好准备，祝你成功！', likes: 3, liked: false },
      { author: 'HR小姐姐', avatar: generateAvatar('HR小姐姐'), time: '刚刚', content: '计算机基础一定要扎实！', likes: 8, liked: false },
      { author: '转行程序员', avatar: generateAvatar('转行程序员'), time: '2分钟前', content: 'TCP/IP协议重点复习', likes: 12, liked: false },
      { author: '硬件工程师', avatar: generateAvatar('硬件工程师'), time: '4分钟前', content: '网络故障排查经验很重要', likes: 7, liked: false }
    ]
  },
  { 
    title: '急招普工/操作工，薪资优厚', 
    author: '技术达人', 
    avatar: generateAvatar('技术达人'), 
    time: '12分钟前', 
    tags: ['招聘', '普工', '操作工'], 
    comments: 148, 
    likes: 234, 
    views: 1500, 
    liked: true, 
    collected: false,
    preview: '公司急招普工和操作工，薪资优厚，福利齐全。要求：年龄18-45岁，身体健康，能吃苦耐劳...',
    commentList: [
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '10分钟前', content: '请问工作地点在哪里？', likes: 28, liked: false },
      { author: 'HR小姐姐', avatar: generateAvatar('HR小姐姐'), time: '8分钟前', content: '在工业园区，包吃住', likes: 45, liked: false },
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '6分钟前', content: '有五险一金吗？', likes: 36, liked: false },
      { author: '转行程序员', avatar: generateAvatar('转行程序员'), time: '4分钟前', content: '加班多吗？', likes: 22, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '2分钟前', content: '有五险一金，加班有加班费', likes: 52, liked: false },
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '1分钟前', content: '太好了，我想投递！', likes: 18, liked: false }
    ]
  },
  { 
    title: '计算机老师薪资待遇怎么样', 
    author: 'HR小姐姐', 
    avatar: generateAvatar('HR小姐姐'), 
    time: '28分钟前', 
    tags: ['教师', '薪资', '计算机'], 
    comments: 91, 
    likes: 167, 
    views: 980, 
    liked: false, 
    collected: true,
    preview: '很多同学问计算机老师的薪资待遇怎么样，在这里给大家分享一下行业情况。公立学校和培训机构薪资差异较大...',
    commentList: [
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '25分钟前', content: '一线城市公立学校薪资多少？', likes: 34, liked: false },
      { author: '转行程序员', avatar: generateAvatar('转行程序员'), time: '20分钟前', content: '培训机构薪资更高吗？', likes: 56, liked: false },
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '18分钟前', content: '私立学校怎么样？', likes: 28, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '15分钟前', content: '公立稳定，培训薪资高但不稳定', likes: 67, liked: false },
      { author: 'HR小姐姐', avatar: generateAvatar('HR小姐姐'), time: '12分钟前', content: '一线城市公立学校教师月薪8K-12K', likes: 89, liked: false },
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '10分钟前', content: '培训机构能到20K吗？', likes: 45, liked: false },
      { author: '转行程序员', avatar: generateAvatar('转行程序员'), time: '8分钟前', content: '头部机构优秀老师可以', likes: 52, liked: false }
    ]
  },
  { 
    title: '在计算机硬件维护工作是一种什么体验', 
    author: '应届生小李', 
    avatar: generateAvatar('应届生小李'), 
    time: '45分钟前', 
    tags: ['硬件', '维护', '体验'], 
    comments: 210, 
    likes: 345, 
    views: 2100, 
    liked: true, 
    collected: false,
    preview: '作为一名计算机硬件维护工程师，分享一下我的工作体验。日常工作包括电脑维修、网络维护、设备管理等...',
    commentList: [
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '40分钟前', content: '需要懂软件知识吗？', likes: 78, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '35分钟前', content: '硬件和软件都要懂一些', likes: 95, liked: false },
      { author: 'HR小姐姐', avatar: generateAvatar('HR小姐姐'), time: '30分钟前', content: '这份工作累吗？', likes: 46, liked: false },
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '28分钟前', content: '有时候需要上门维修，体力活比较多', likes: 67, liked: false },
      { author: '转行程序员', avatar: generateAvatar('转行程序员'), time: '25分钟前', content: '薪资待遇如何？', likes: 88, liked: false },
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '22分钟前', content: '有发展前景吗？', likes: 56, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '20分钟前', content: '可以往网络工程师方向发展', likes: 72, liked: false },
      { author: '硬件工程师', avatar: generateAvatar('硬件工程师'), time: '18分钟前', content: '建议考个华为认证', likes: 95, liked: false }
    ]
  },
  { 
    title: '计算机编程老师岗位推荐', 
    author: '转行程序员', 
    avatar: generateAvatar('转行程序员'), 
    time: '1小时前', 
    tags: ['教师', '编程', '推荐'], 
    comments: 197, 
    likes: 412, 
    views: 1800, 
    liked: false, 
    collected: true,
    preview: '给大家推荐几个不错的计算机编程老师岗位，包括线上教育平台和线下培训机构...',
    commentList: [
      { author: 'HR小姐姐', avatar: generateAvatar('HR小姐姐'), time: '55分钟前', content: '需要什么学历要求？', likes: 67, liked: false },
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '50分钟前', content: '线上教学时间自由吗？', likes: 89, liked: false },
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '45分钟前', content: '有哪些平台推荐？', likes: 56, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '40分钟前', content: '猿辅导、学而思、作业帮都不错', likes: 78, liked: false },
      { author: '转行程序员', avatar: generateAvatar('转行程序员'), time: '35分钟前', content: '大专学历也可以，主要看能力', likes: 92, liked: false },
      { author: 'HR小姐姐', avatar: generateAvatar('HR小姐姐'), time: '30分钟前', content: '兼职可以吗？', likes: 45, liked: false },
      { author: '应届生小李', avatar: generateAvatar('应届生小李'), time: '25分钟前', content: '线上兼职时间比较灵活', likes: 67, liked: false },
      { author: '求职者小王', avatar: generateAvatar('求职者小王'), time: '20分钟前', content: '怎么投递简历？', likes: 34, liked: false },
      { author: '技术达人', avatar: generateAvatar('技术达人'), time: '15分钟前', content: 'BOSS直聘上有很多岗位', likes: 52, liked: false }
    ]
  }
])

const qaList = [
  { 
    title: '计算机专业应届生应该选择什么方向？前端、后端还是算法？', 
    author: '迷茫的应届生', 
    avatar: generateAvatar('迷茫的应届生'), 
    time: '1小时前', 
    tags: ['计算机', '职业规划'], 
    answers: 23, 
    solved: false,
    preview: '作为计算机专业的应届生，不知道该选择哪个方向发展，前端、后端、算法各有什么优缺点？',
    bestAnswer: {
      author: '资深程序员',
      avatar: generateAvatar('资深程序员'),
      time: '30分钟前',
      content: '建议根据自己的兴趣和优势来选择。前端入门快，可视化效果强，适合喜欢创意设计的人；后端技术栈稳定，薪资较高，适合喜欢逻辑推理的人；算法门槛高，但薪资最高，适合数学基础好的人。建议先尝试不同方向的课程，找到自己真正喜欢的领域。',
      likes: 128,
      liked: false
    }
  },
  { 
    title: '计算机硬件维护工程师需要掌握哪些技能？', 
    author: '转行小白', 
    avatar: generateAvatar('转行小白'), 
    time: '3小时前', 
    tags: ['硬件', '技能'], 
    answers: 18, 
    solved: true,
    preview: '想转行做计算机硬件维护工程师，需要掌握哪些专业技能？',
    bestAnswer: {
      author: '硬件工程师',
      avatar: generateAvatar('硬件工程师'),
      time: '2小时前',
      content: '主要需要掌握计算机组成原理、硬件故障排查、操作系统安装与维护、网络基础知识等。建议学习CCNA、CompTIA A+等认证，这些证书对找工作很有帮助。',
      likes: 89,
      liked: false
    }
  },
  { 
    title: '大专学历能找到好的计算机工作吗？', 
    author: '大专生求职', 
    avatar: generateAvatar('大专生求职'), 
    time: '5小时前', 
    tags: ['学历', '计算机'], 
    answers: 45, 
    solved: false,
    preview: '大专学历，学的是计算机专业，担心找不到好工作，该怎么办？',
    bestAnswer: {
      author: 'HR经理',
      avatar: generateAvatar('HR经理'),
      time: '4小时前',
      content: '当然可以！很多公司更看重实际技能和项目经验。建议多做项目，积累实战经验，可以从外包公司或小型创业公司起步，积累经验后再跳槽到更好的平台。',
      likes: 234,
      liked: false
    }
  },
  { 
    title: '计算机教师岗位待遇怎么样？', 
    author: '教育行业咨询', 
    avatar: generateAvatar('教育行业咨询'), 
    time: '8小时前', 
    tags: ['教师', '待遇'], 
    answers: 34, 
    solved: true,
    preview: '想了解计算机教师岗位的薪资待遇和发展前景',
    bestAnswer: {
      author: '高校教师',
      avatar: generateAvatar('高校教师'),
      time: '6小时前',
      content: '计算机教师薪资因学校类型而异。公办学校薪资稳定，有寒暑假；培训机构薪资较高，但工作强度大。建议根据自己的职业规划选择。',
      likes: 156,
      liked: false
    }
  },
  { 
    title: '计算机网络工程师和软件工程师哪个发展前景更好？', 
    author: '职业选择', 
    avatar: generateAvatar('职业选择'), 
    time: '10小时前', 
    tags: ['网络', '软件', '前景'], 
    answers: 28, 
    solved: false,
    preview: '纠结于选择网络工程师还是软件工程师方向，哪个更有发展前景？',
    bestAnswer: {
      author: '技术总监',
      avatar: generateAvatar('技术总监'),
      time: '8小时前',
      content: '两个方向都有很好的发展前景。网络工程师在云计算、网络安全领域需求很大；软件工程师在互联网行业需求量最大。建议根据自己的兴趣选择，兴趣是最好的老师。',
      likes: 189,
      liked: false
    }
  },
  { 
    title: '计算机实习生应该怎么找？薪资大概多少？', 
    author: '找实习', 
    avatar: generateAvatar('找实习'), 
    time: '12小时前', 
    tags: ['实习', '计算机'], 
    answers: 52, 
    solved: true,
    preview: '大三学生，想找计算机相关的实习，不知道怎么找，薪资大概多少？',
    bestAnswer: {
      author: '求职导师',
      avatar: generateAvatar('求职导师'),
      time: '10小时前',
      content: '可以通过实习僧、拉勾网、BOSS直聘等平台找实习，也可以关注各大公司官网的校招实习板块。一线城市实习生薪资一般在2000-5000元/月，互联网大厂实习薪资较高。',
      likes: 345,
      liked: false
    }
  }
]

const groupList = ref([
  { name: '计算机专业求职交流', desc: '计算机相关岗位求职讨论', members: 3280, posts: 890, joined: true },
  { name: '计算机硬件维护群', desc: '硬件维护经验分享', members: 1560, posts: 450, joined: false },
  { name: '计算机教师交流', desc: '教师岗位求职与教学经验', members: 1890, posts: 560, joined: true },
  { name: '计算机网络工程师', desc: '网络技术与运维讨论', members: 2150, posts: 680, joined: false },
  { name: '校招实习交流', desc: '应届生校招与实习经验', members: 4560, posts: 1200, joined: false },
  { name: '计算机软件编程', desc: '编程技术交流', members: 3450, posts: 980, joined: false }
])

const onlineUsers = [
  { name: '张三', avatar: generateAvatar('张三') },
  { name: '李四', avatar: generateAvatar('李四') },
  { name: '王五', avatar: generateAvatar('王五') },
  { name: '赵六', avatar: generateAvatar('赵六') },
  { name: '孙七', avatar: generateAvatar('孙七') },
  { name: '周八', avatar: generateAvatar('周八') }
]
const hotTopics = ref([
  { name: '计算机求职', posts: 1256, trend: '+12%', related: ['面试', '计算机', '技术员', '招聘'] },
  { name: '硬件维护', posts: 890, trend: '+8%', related: ['硬件', '维护', '体验', '电脑'] },
  { name: '教师岗位', posts: 678, trend: '+15%', related: ['教师', '薪资', '编程', '教育'] },
  { name: '网络工程师', posts: 543, trend: '+5%', related: ['网络', '工程师', '运维', '计算机'] },
  { name: '校招实习', posts: 2340, trend: '+25%', related: ['应届生', '实习', '校招', '经验不限'] },
  { name: '编程技巧', posts: 1890, trend: '+18%', related: ['编程', '开发', '代码', '计算机'] }
])
const recommendUsers = ref([
  { name: '计算机求职达人', title: '分享30+面经', avatar: generateAvatar('计算机求职达人'), followed: false },
  { name: '硬件工程师小李', title: '10年硬件经验', avatar: generateAvatar('硬件工程师小李'), followed: true },
  { name: '高校教师张老师', title: '计算机教育专家', avatar: generateAvatar('高校教师张老师'), followed: false },
  { name: '网络技术大牛', title: 'CCIE认证', avatar: generateAvatar('网络技术大牛'), followed: false }
])
const weeklyRank = [
  { name: '计算机求职者', avatar: generateAvatar('计算机求职者'), score: 5680 },
  { name: '硬件维护达人', avatar: generateAvatar('硬件维护达人'), score: 4520 },
  { name: '教师岗位分享', avatar: generateAvatar('教师岗位分享'), score: 3890 },
  { name: '网络工程师', avatar: generateAvatar('网络工程师'), score: 3200 },
  { name: '编程爱好者', avatar: generateAvatar('编程爱好者'), score: 2150 }
]

const groupPosts = [
  { title: '分享今天的面试经历', preview: '今天面试了XX公司，感觉表现不错...', author: '求职达人', time: '2小时前', comments: 12, likes: 34 },
  { title: '求内推！', preview: '本人计算机专业，求各位大佬内推...', author: '应届生小李', time: '5小时前', comments: 8, likes: 15 },
  { title: '聊聊薪资待遇', preview: '大家的薪资待遇怎么样？来聊聊...', author: '薪资讨论', time: '8小时前', comments: 45, likes: 67 }
]

const filteredJobs = computed(() => {
  let result = realJobs.value
  if (jobFilter.value === 'campus') result = result.filter(j => j.campus)
  if (jobFilter.value === 'social') result = result.filter(j => !j.campus)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    result = result.filter(j => 
      j.title.includes(query) || j.company.includes(query) || 
      j.city.includes(query) || j.tags.some(t => t.includes(query))
    )
  }
  return result
})

const filteredQAs = computed(() => {
  let result = qaList
  if (qaFilter.value === 'unsolved') result = result.filter(q => !q.solved)
  if (qaFilter.value === 'solved') result = result.filter(q => q.solved)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    result = result.filter(q => 
      q.title.includes(query) || q.author.includes(query) || 
      q.tags.some(t => t.includes(query))
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
      i.title.includes(query) || i.author.includes(query) || 
      i.tags.some(t => t.includes(query))
    )
  }
  if (filterType.value === 'hot') {
    result = [...result].sort((a, b) => b.likes - a.likes)
  } else {
    result = [...result].sort((a, b) => {
      const timeA = a.time.includes('刚刚') ? 0 : a.time.includes('分钟') ? parseInt(a.time) : a.time.includes('小时') ? parseInt(a.time) * 60 : 1000
      const timeB = b.time.includes('刚刚') ? 0 : b.time.includes('分钟') ? parseInt(b.time) : b.time.includes('小时') ? parseInt(b.time) * 60 : 1000
      return timeA - timeB
    })
  }
  return result
})

const topicRelatedPosts = computed(() => {
  if (!currentTopic.value) return []
  const relatedKeywords = currentTopic.value.related
  return hotInterviews.value.filter(post => 
    post.title.includes(currentTopic.value.name) || 
    post.tags.some(tag => relatedKeywords.includes(tag)) ||
    relatedKeywords.some(kw => post.title.includes(kw))
  ).slice(0, 5)
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

const toggleLike = (item) => {
  if (item.liked) {
    item.likes--
    item.liked = false
  } else {
    item.likes++
    item.liked = true
  }
}

const toggleCollect = (item) => {
  item.collected = !item.collected
}

const toggleJobCollect = (job) => {
  job.collected = !job.collected
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
  
  detailData.value.answers++
  newComment.value = ''
  alert('回答发布成功！')
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
}

const closeDetail = () => {
  showDetail.value = false
  detailType.value = ''
  detailData.value = {}
  newComment.value = ''
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleMenuClick = (action) => {
  showUserMenu.value = false
  switch (action) {
    case 'profile':
      showProfile.value = true
      break
    case 'publish':
      showMyPublish.value = true
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
}

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) {
    alert('请输入搜索关键词')
    return
  }
  
  const searchResults = {
    interviews: hotInterviews.value.filter(item => 
      item.title.includes(query) || item.author.includes(query) || item.tags.some(tag => tag.includes(query))
    ),
    jobs: realJobs.value.filter(item =>
      item.title.includes(query) || item.company.includes(query) || item.city.includes(query) || item.tags.some(tag => tag.includes(query))
    ),
    qas: qaList.filter(item =>
      item.title.includes(query) || item.author.includes(query) || item.tags.some(tag => tag.includes(query))
    )
  }
  
  const totalResults = searchResults.interviews.length + searchResults.jobs.length + searchResults.qas.length
  
  if (totalResults === 0) {
    alert(`搜索 "${query}" 没有找到结果`)
  } else {
    if (searchResults.interviews.length > searchResults.jobs.length && searchResults.interviews.length > searchResults.qas.length) {
      activeTab.value = 'interview'
    } else if (searchResults.jobs.length > searchResults.qas.length) {
      activeTab.value = 'job'
    } else {
      activeTab.value = 'qa'
    }
    
    alert(`搜索 "${query}" 找到 ${totalResults} 条结果！\n面经：${searchResults.interviews.length} 条\n岗位：${searchResults.jobs.length} 条\n问答：${searchResults.qas.length} 条`)
  }
}

const handleKeywordSearch = (kw) => {
  searchQuery.value = kw
  handleSearch()
}

const handleApply = (job) => {
  if (appliedJobIds.value.has(job.id)) {
    alert('您已经投递过该岗位了！')
    return
  }
  appliedJobIds.value.add(job.id)
  job.applied = true
  alert(`已投递 ${job.title} 岗位！\n公司：${job.company}\n城市：${job.city}\n薪资：${job.salary}`)
}

const toggleJoin = (group) => {
  group.joined = !group.joined
}

const toggleFollow = (user) => {
  user.followed = !user.followed
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

const submitPublish = () => {
  if (!publishForm.value.title.trim() || !publishForm.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }
  
  hotInterviews.value.unshift({
    title: publishForm.value.title,
    author: currentUser.value.name,
    avatar: currentUser.value.avatar,
    time: '刚刚',
    tags: publishForm.value.tags.length > 0 ? publishForm.value.tags : ['计算机'],
    comments: 0,
    likes: 0,
    views: 0,
    liked: false,
    collected: false,
    preview: publishForm.value.content.slice(0, 100) + '...',
    commentList: []
  })
  
  closePublishModal()
  alert('发布成功！')
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

onMounted(() => {
  initBackground()
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.job-community { min-height: 100vh; background: linear-gradient(135deg, #000a1c 0%, #0a1628 50%, #0d1f35 100%); position: relative; overflow: hidden; }
.bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
.community-container { position: relative; z-index: 1; }

.community-nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: rgba(0, 0, 0, 0.5); border-bottom: 1px solid rgba(74, 158, 255, 0.15); }
.nav-left { display: flex; align-items: center; gap: 15px; }
.nav-back { width: 44px; height: 44px; border-radius: 50%; background: rgba(74, 158, 255, 0.15); border: 1px solid rgba(74, 158, 255, 0.3); color: #4a9eff; font-size: 1.4rem; cursor: pointer; transition: all 0.3s; }
.nav-back:hover { background: rgba(74, 158, 255, 0.3); transform: scale(1.05); }
.nav-logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 1.8rem; }
.logo-text { display: flex; flex-direction: column; }
.logo-main { font-size: 1.5rem; font-weight: 700; color: rgba(74, 158, 255, 0.95); }
.logo-sub { font-size: 0.7rem; color: rgba(150, 180, 220, 0.5); }

.nav-center { display: flex; gap: 10px; background: rgba(74, 158, 255, 0.08); border-radius: 30px; padding: 8px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 16px 32px; border-radius: 25px; color: rgba(150, 180, 220, 0.6); font-size: 1.05rem; font-weight: 500; background: transparent; border: none; cursor: pointer; transition: all 0.3s; }
.nav-item:hover { background: rgba(74, 158, 255, 0.15); color: rgba(74, 158, 255, 0.9); }
.nav-item.active { background: linear-gradient(135deg, rgba(74, 158, 255, 0.5), rgba(0, 212, 170, 0.3)); color: #fff; box-shadow: 0 0 25px rgba(74, 158, 255, 0.4); }
.nav-icon { font-size: 1.3rem; }

.nav-right { display: flex; align-items: center; gap: 20px; }
.publish-btn { padding: 14px 32px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(74, 158, 255, 0.8)); border: none; border-radius: 25px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.publish-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(168, 85, 247, 0.4); }
.user-profile { position: relative; cursor: pointer; }
.user-profile img { width: 48px; height: 48px; border-radius: 50%; border: 2px solid rgba(74, 158, 255, 0.5); }

.user-menu { position: absolute; top: 60px; right: 0; width: 200px; background: rgba(10, 20, 40, 0.98); border: 1px solid rgba(74, 158, 255, 0.3); border-radius: 15px; padding: 12px; z-index: 100; }
.menu-item { padding: 14px 16px; border-radius: 10px; color: rgba(150, 180, 220, 0.7); font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
.menu-item:hover { background: rgba(74, 158, 255, 0.15); color: #fff; }
.menu-item.logout { color: rgba(239, 68, 68, 0.7); }
.menu-divider { height: 1px; background: rgba(74, 158, 255, 0.1); margin: 10px 0; }

.hero-banner { padding: 50px 30px; text-align: center; }
.banner-title { font-size: 2.5rem; font-weight: 700; color: #fff; margin-bottom: 15px; }
.banner-desc { font-size: 1.1rem; color: rgba(150, 180, 220, 0.5); margin-bottom: 35px; }

.search-box { display: flex; justify-content: center; max-width: 600px; margin: 0 auto 25px; }
.search-input { flex: 1; padding: 16px 24px; border-radius: 30px 0 0 30px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.3); color: #fff; font-size: 1.1rem; outline: none; }
.search-btn { padding: 16px 36px; border-radius: 0 30px 30px 0; background: linear-gradient(135deg, #4a9eff, #00d4aa); border: none; color: #fff; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.search-btn:hover { transform: scale(1.02); }

.hot-keywords { display: flex; justify-content: center; gap: 12px; margin-bottom: 35px; flex-wrap: wrap; }
.keyword-item { padding: 10px 22px; background: rgba(74, 158, 255, 0.1); border-radius: 25px; color: rgba(74, 158, 255, 0.8); font-size: 0.95rem; cursor: pointer; transition: all 0.3s; }
.keyword-item:hover { background: rgba(74, 158, 255, 0.25); transform: translateY(-2px); }

.banner-stats { display: flex; justify-content: center; gap: 50px; }
.stat-card { text-align: center; }
.stat-value { font-size: 2.2rem; font-weight: 700; color: #4a9eff; display: block; }
.stat-label { font-size: 0.95rem; color: rgba(150, 180, 220, 0.5); }

.main-content { display: flex; gap: 30px; padding: 25px 30px; max-width: 1500px; margin: 0 auto; }
.content-left { flex: 1; }
.content-right { width: 320px; flex-shrink: 0; }

.tab-content { background: rgba(0, 0, 0, 0.3); border-radius: 20px; padding: 30px; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.section-title { font-size: 1.5rem; font-weight: 600; color: #fff; }
.section-filters { display: flex; gap: 15px; }
.section-filters span { padding: 10px 20px; border-radius: 18px; color: rgba(150, 180, 220, 0.5); font-size: 0.95rem; cursor: pointer; transition: all 0.3s; }
.section-filters span:hover { background: rgba(74, 158, 255, 0.15); }
.section-filters span.active { background: rgba(74, 158, 255, 0.25); color: #4a9eff; }

.interview-list { display: flex; flex-direction: column; gap: 25px; }
.interview-card { display: flex; gap: 20px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(74, 158, 255, 0.15); border-radius: 18px; padding: 25px; cursor: pointer; transition: all 0.3s; }
.interview-card:hover { border-color: rgba(74, 158, 255, 0.5); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
.card-rank { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(74, 158, 255, 0.4)); color: #fff; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-main { flex: 1; }
.card-header { display: flex; gap: 15px; margin-bottom: 15px; }
.card-avatar { width: 48px; height: 48px; border-radius: 50%; }
.card-title-wrap { flex: 1; }
.card-title { font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 6px; }
.card-meta { display: flex; gap: 18px; }
.card-author { font-size: 0.95rem; color: rgba(74, 158, 255, 0.9); }
.card-time { font-size: 0.9rem; color: rgba(150, 180, 220, 0.4); }

.card-tags { display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; }
.card-tags .tag { padding: 6px 16px; background: rgba(168, 85, 247, 0.15); border-radius: 15px; font-size: 0.85rem; color: rgba(168, 85, 247, 0.8); cursor: pointer; transition: all 0.3s; }
.card-tags .tag:hover { background: rgba(168, 85, 247, 0.3); transform: scale(1.05); }
.card-preview { font-size: 1rem; color: rgba(150, 180, 220, 0.5); line-height: 1.7; margin-bottom: 18px; }

.card-badges { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
.badge { padding: 4px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
.badge.hot { background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.2)); color: rgba(245, 158, 11, 0.9); animation: pulse 2s infinite; }
.badge.active { background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.2)); color: rgba(0, 212, 170, 0.9); }
.badge.ai { background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(74, 158, 255, 0.2)); color: rgba(168, 85, 247, 0.9); }

.card-status { font-size: 0.85rem; padding: 2px 10px; border-radius: 10px; }
.card-status.online { color: rgba(0, 212, 170, 0.8); background: rgba(0, 212, 170, 0.1); }
.card-status.offline { color: rgba(150, 180, 220, 0.3); background: rgba(150, 180, 220, 0.05); }

.card-rank.rank-gold { background: linear-gradient(135deg, #ffd700, #ffb700); color: #fff; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
.card-rank.rank-silver { background: linear-gradient(135deg, #c0c0c0, #a8a8a8); color: #fff; box-shadow: 0 0 15px rgba(192, 192, 192, 0.5); }
.card-rank.rank-bronze { background: linear-gradient(135deg, #cd7f32, #b87333); color: #fff; box-shadow: 0 0 15px rgba(205, 127, 50, 0.5); }

@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }

.card-actions { display: flex; align-items: center; gap: 25px; }
.action-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 20px; background: rgba(74, 158, 255, 0.1); border: none; color: rgba(150, 180, 220, 0.6); font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
.action-btn:hover { background: rgba(74, 158, 255, 0.2); color: rgba(74, 158, 255, 0.9); }
.action-btn.active { background: rgba(239, 68, 68, 0.15); color: rgba(239, 68, 68, 0.9); }
.action-icon { font-size: 1rem; }
.action-num { font-size: 0.85rem; }
.action-stat { display: flex; align-items: center; gap: 6px; color: rgba(150, 180, 220, 0.4); font-size: 0.85rem; }

.job-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.job-card { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(74, 158, 255, 0.15); border-radius: 18px; padding: 22px; cursor: pointer; transition: all 0.3s; }
.job-card:hover { border-color: rgba(74, 158, 255, 0.5); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
.job-title { font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 8px; }
.job-company { font-size: 0.95rem; color: rgba(74, 158, 255, 0.7); margin-bottom: 12px; }
.job-info { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.job-info span { font-size: 0.85rem; color: rgba(150, 180, 220, 0.5); }
.job-info .salary { color: rgba(245, 158, 11, 0.8); font-weight: 600; font-size: 1rem; }
.job-skills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.job-skills .skill { padding: 6px 14px; background: rgba(0, 212, 170, 0.15); border-radius: 12px; font-size: 0.8rem; color: rgba(0, 212, 170, 0.7); }
.job-actions { display: flex; justify-content: space-between; align-items: center; }
.apply-btn { padding: 10px 24px; background: linear-gradient(135deg, rgba(74, 158, 255, 0.6), rgba(0, 212, 170, 0.4)); border: none; border-radius: 18px; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.apply-btn:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(74, 158, 255, 0.3); }
.apply-btn.applied { background: rgba(0, 212, 170, 0.2); border: 1px solid rgba(0, 212, 170, 0.4); color: rgba(0, 212, 170, 0.8); }
.apply-btn.applied:hover { transform: none; box-shadow: none; }
.collect-btn { padding: 8px 14px; border-radius: 15px; background: rgba(245, 158, 11, 0.1); border: none; font-size: 1.2rem; cursor: pointer; transition: all 0.3s; }
.collect-btn:hover { background: rgba(245, 158, 11, 0.2); }
.collect-btn.collected { background: rgba(245, 158, 11, 0.3); }

.qa-list { display: flex; flex-direction: column; gap: 20px; }
.qa-card { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(74, 158, 255, 0.15); border-radius: 18px; padding: 22px; cursor: pointer; transition: all 0.3s; }
.qa-card:hover { border-color: rgba(74, 158, 255, 0.5); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
.qa-header { display: flex; gap: 12px; margin-bottom: 12px; }
.qa-avatar { width: 42px; height: 42px; border-radius: 50%; }
.qa-title-wrap { flex: 1; }
.qa-title { font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 6px; }
.qa-meta { display: flex; gap: 15px; }
.qa-meta span { font-size: 0.85rem; color: rgba(150, 180, 220, 0.4); }
.qa-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.qa-tag { padding: 5px 14px; background: rgba(168, 85, 247, 0.15); border-radius: 12px; font-size: 0.8rem; color: rgba(168, 85, 247, 0.7); }
.qa-preview { font-size: 0.95rem; color: rgba(150, 180, 220, 0.5); line-height: 1.6; margin-bottom: 14px; }
.qa-actions { display: flex; align-items: center; gap: 20px; }
.qa-action-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 15px; background: rgba(74, 158, 255, 0.1); border: none; color: rgba(150, 180, 220, 0.6); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; }
.qa-action-btn:hover { background: rgba(74, 158, 255, 0.2); }
.qa-action-btn.solved { background: rgba(0, 212, 170, 0.15); color: rgba(0, 212, 170, 0.8); }
.qa-action-btn.unsolved { background: rgba(245, 158, 11, 0.15); color: rgba(245, 158, 11, 0.8); }

.group-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.group-card { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(74, 158, 255, 0.15); border-radius: 18px; padding: 22px; cursor: pointer; transition: all 0.3s; }
.group-card:hover { border-color: rgba(74, 158, 255, 0.5); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
.group-icon { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, rgba(74, 158, 255, 0.4), rgba(168, 85, 247, 0.4)); color: #fff; font-size: 1.6rem; font-weight: 600; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.group-name { font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 8px; }
.group-desc { font-size: 0.85rem; color: rgba(150, 180, 220, 0.5); margin-bottom: 12px; line-height: 1.5; }
.group-stats { display: flex; gap: 15px; margin-bottom: 14px; }
.group-stats span { font-size: 0.8rem; color: rgba(150, 180, 220, 0.4); }
.join-btn { width: 100%; padding: 10px; border-radius: 15px; background: rgba(74, 158, 255, 0.15); border: 1px solid rgba(74, 158, 255, 0.3); color: rgba(74, 158, 255, 0.8); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.join-btn:hover { background: rgba(74, 158, 255, 0.25); }

.content-right > div { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(74, 158, 255, 0.15); border-radius: 18px; padding: 22px; margin-bottom: 20px; }
.content-right h4 { font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 18px; }

.online-users { }
.avatar-stack { display: flex; gap: -8px; }
.mini-avatar { width: 38px; height: 38px; border-radius: 50%; border: 2px solid rgba(0, 212, 170, 0.5); margin-left: -10px; }
.mini-avatar:first-child { margin-left: 0; }
.online-count { font-size: 0.85rem; color: rgba(0, 212, 170, 0.7); display: block; margin-top: 12px; }

.hot-topics { }
.topic-list { }
.topic-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(74, 158, 255, 0.1); cursor: pointer; transition: all 0.2s; }
.topic-item:last-child { border-bottom: none; }
.topic-item:hover { background: rgba(74, 158, 255, 0.08); padding-left: 10px; }
.topic-rank { width: 26px; height: 26px; border-radius: 50%; background: rgba(168, 85, 247, 0.2); color: rgba(168, 85, 247, 0.8); font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.topic-name { font-size: 0.9rem; color: rgba(150, 180, 220, 0.6); }

.recommend-users { }
.user-list { }
.user-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(74, 158, 255, 0.1); }
.user-item:last-child { border-bottom: none; }
.user-avatar { width: 42px; height: 42px; border-radius: 50%; }
.user-detail { flex: 1; }
.user-name { font-size: 0.95rem; color: #fff; display: block; }
.user-title { font-size: 0.75rem; color: rgba(150, 180, 220, 0.4); }
.follow-btn { padding: 8px 16px; border-radius: 15px; background: rgba(74, 158, 255, 0.15); border: 1px solid rgba(74, 158, 255, 0.3); color: rgba(74, 158, 255, 0.8); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.follow-btn:hover { background: rgba(74, 158, 255, 0.25); }

.weekly-rank { }
.rank-list { }
.rank-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.rank-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); color: rgba(245, 158, 11, 0.8); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rank-avatar { width: 36px; height: 36px; border-radius: 50%; }
.rank-name { flex: 1; font-size: 0.9rem; color: rgba(150, 180, 220, 0.6); }
.rank-score { font-size: 0.8rem; color: rgba(245, 158, 11, 0.6); }

.detail-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-content { width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; background: rgba(10, 20, 40, 0.95); border: 1px solid rgba(74, 158, 255, 0.3); border-radius: 20px; padding: 35px; position: relative; }
.close-btn { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: none; color: rgba(239, 68, 68, 0.8); font-size: 1.2rem; cursor: pointer; transition: all 0.3s; }
.close-btn:hover { background: rgba(239, 68, 68, 0.25); }

.detail-body h2 { font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 10px; }
.detail-company { font-size: 1.1rem; color: rgba(74, 158, 255, 0.8); margin-bottom: 15px; }
.detail-header { display: flex; gap: 18px; margin-bottom: 20px; }
.detail-avatar { width: 64px; height: 64px; border-radius: 50%; }
.detail-author { }
.detail-meta { display: flex; gap: 20px; margin-top: 10px; }
.detail-meta span { font-size: 0.9rem; color: rgba(150, 180, 220, 0.4); }
.detail-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.detail-tag { padding: 8px 18px; background: rgba(74, 158, 255, 0.15); border-radius: 15px; font-size: 0.85rem; color: rgba(74, 158, 255, 0.8); }
.detail-content { color: rgba(150, 180, 220, 0.6); line-height: 1.8; margin-bottom: 25px; }
.detail-content h3 { color: #fff; margin: 20px 0 10px; font-size: 1.2rem; }
.detail-content ul { padding-left: 20px; }
.detail-content li { margin-bottom: 8px; }

.detail-actions { display: flex; gap: 20px; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 1px solid rgba(74, 158, 255, 0.15); }
.detail-action-btn { display: flex; align-items: center; gap: 10px; padding: 14px 28px; border-radius: 25px; background: rgba(74, 158, 255, 0.15); border: none; color: rgba(150, 180, 220, 0.7); font-size: 1rem; cursor: pointer; transition: all 0.3s; }
.detail-action-btn:hover { background: rgba(74, 158, 255, 0.25); }
.detail-action-btn.active { background: rgba(239, 68, 68, 0.15); color: rgba(239, 68, 68, 0.9); }

.comment-section { }
.comment-section h3 { font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 20px; }
.comment-list { display: flex; flex-direction: column; gap: 18px; margin-bottom: 25px; }
.comment-item { display: flex; gap: 14px; padding: 18px; background: rgba(0, 0, 0, 0.4); border-radius: 15px; }
.comment-avatar { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
.comment-content { flex: 1; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.comment-author { font-size: 0.95rem; color: rgba(74, 158, 255, 0.8); font-weight: 500; }
.comment-time { font-size: 0.8rem; color: rgba(150, 180, 220, 0.3); }
.comment-content p { font-size: 0.95rem; color: rgba(150, 180, 220, 0.6); line-height: 1.6; margin-bottom: 10px; }
.comment-like { background: transparent; border: none; color: rgba(150, 180, 220, 0.4); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; }
.comment-like:hover { color: rgba(239, 68, 68, 0.7); }
.comment-like.liked { color: rgba(239, 68, 68, 0.9); }

.comment-input-box { display: flex; gap: 15px; }
.comment-input { flex: 1; padding: 14px 20px; border-radius: 20px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.2); color: #fff; font-size: 0.95rem; outline: none; }
.comment-input:focus { border-color: rgba(74, 158, 255, 0.5); }
.comment-submit { padding: 14px 30px; border-radius: 20px; background: linear-gradient(135deg, rgba(74, 158, 255, 0.6), rgba(0, 212, 170, 0.4)); border: none; color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.comment-submit:hover { transform: scale(1.02); }

.job-detail-actions { display: flex; gap: 20px; margin-top: 25px; }
.apply-btn-lg { flex: 1; padding: 16px; border-radius: 20px; background: linear-gradient(135deg, rgba(74, 158, 255, 0.7), rgba(0, 212, 170, 0.5)); border: none; color: #fff; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.apply-btn-lg:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(74, 158, 255, 0.4); }
.apply-btn-lg.applied { background: rgba(0, 212, 170, 0.2); border: 1px solid rgba(0, 212, 170, 0.4); color: rgba(0, 212, 170, 0.8); }
.apply-btn-lg.applied:hover { transform: none; box-shadow: none; }
.collect-btn-lg { padding: 16px 35px; border-radius: 20px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: rgba(245, 158, 11, 0.8); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.collect-btn-lg:hover { background: rgba(245, 158, 11, 0.25); }
.collect-btn-lg.collected { background: rgba(245, 158, 11, 0.3); }

.answer-card { background: rgba(0, 0, 0, 0.4); border-radius: 15px; padding: 20px; margin-bottom: 20px; }
.answer-header { display: flex; gap: 14px; margin-bottom: 14px; }
.answer-avatar { width: 48px; height: 48px; border-radius: 50%; }
.answer-info { }
.answer-author { font-size: 1rem; color: rgba(74, 158, 255, 0.8); font-weight: 500; display: block; }
.answer-time { font-size: 0.8rem; color: rgba(150, 180, 220, 0.3); }
.answer-card p { font-size: 0.95rem; color: rgba(150, 180, 220, 0.6); line-height: 1.7; margin-bottom: 14px; }
.answer-like { background: transparent; border: none; color: rgba(150, 180, 220, 0.4); font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
.answer-like:hover { color: rgba(239, 68, 68, 0.7); }
.answer-like.liked { color: rgba(239, 68, 68, 0.9); }

.group-header { display: flex; gap: 20px; margin-bottom: 25px; }
.group-icon-lg { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(74, 158, 255, 0.4), rgba(168, 85, 247, 0.4)); color: #fff; font-size: 2rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.group-meta { display: flex; gap: 20px; margin-top: 10px; }
.group-meta span { font-size: 0.9rem; color: rgba(150, 180, 220, 0.4); }
.group-actions { margin-bottom: 25px; }
.group-action-btn { padding: 14px 35px; border-radius: 25px; background: rgba(74, 158, 255, 0.15); border: 1px solid rgba(74, 158, 255, 0.3); color: rgba(74, 158, 255, 0.8); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.group-action-btn:hover { background: rgba(74, 158, 255, 0.25); }
.group-action-btn.joined { background: rgba(0, 212, 170, 0.15); border-color: rgba(0, 212, 170, 0.3); color: rgba(0, 212, 170, 0.8); }
.group-content { }
.group-content h3 { color: #fff; margin: 20px 0 12px; font-size: 1.15rem; }
.group-content p { color: rgba(150, 180, 220, 0.5); line-height: 1.6; }
.group-posts { display: flex; flex-direction: column; gap: 15px; }
.group-post { padding: 18px; background: rgba(0, 0, 0, 0.4); border-radius: 12px; }
.group-post h4 { color: #fff; font-size: 1rem; margin-bottom: 8px; }
.group-post p { color: rgba(150, 180, 220, 0.4); font-size: 0.85rem; margin-bottom: 10px; }
.post-meta { display: flex; gap: 15px; }
.post-meta span { font-size: 0.75rem; color: rgba(150, 180, 220, 0.3); }

.comment-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.comment-modal-content { width: 90%; max-width: 500px; background: rgba(10, 20, 40, 0.95); border: 1px solid rgba(74, 158, 255, 0.3); border-radius: 20px; padding: 30px; position: relative; }
.comment-modal-content h3 { font-size: 1.4rem; font-weight: 600; color: #fff; margin-bottom: 20px; }
.comment-textarea { width: 100%; padding: 15px; border-radius: 15px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.2); color: #fff; font-size: 0.95rem; outline: none; resize: none; }
.comment-textarea:focus { border-color: rgba(74, 158, 255, 0.5); }
.comment-modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
.cancel-btn { padding: 12px 25px; border-radius: 15px; background: rgba(150, 180, 220, 0.1); border: 1px solid rgba(150, 180, 220, 0.2); color: rgba(150, 180, 220, 0.6); font-size: 0.95rem; cursor: pointer; transition: all 0.3s; }
.cancel-btn:hover { background: rgba(150, 180, 220, 0.15); }
.submit-btn { padding: 12px 30px; border-radius: 15px; background: linear-gradient(135deg, rgba(74, 158, 255, 0.6), rgba(0, 212, 170, 0.4)); border: none; color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.submit-btn:hover { transform: scale(1.02); }

.publish-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.publish-modal-content { width: 90%; max-width: 600px; background: rgba(10, 20, 40, 0.95); border: 1px solid rgba(74, 158, 255, 0.3); border-radius: 20px; padding: 35px; position: relative; }
.publish-modal-content h3 { font-size: 1.5rem; font-weight: 600; color: #fff; margin-bottom: 25px; }
.publish-form { }
.publish-input { width: 100%; padding: 15px; border-radius: 15px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.2); color: #fff; font-size: 1rem; outline: none; margin-bottom: 18px; }
.publish-input:focus { border-color: rgba(74, 158, 255, 0.5); }
.publish-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.tag-input { padding: 10px 15px; border-radius: 12px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.2); color: #fff; font-size: 0.9rem; outline: none; flex: 1; min-width: 150px; }
.publish-tag { padding: 8px 14px; background: rgba(74, 158, 255, 0.15); border-radius: 12px; font-size: 0.85rem; color: rgba(74, 158, 255, 0.8); display: flex; align-items: center; gap: 8px; }
.publish-tag span { cursor: pointer; color: rgba(239, 68, 68, 0.7); font-size: 1rem; }
.publish-textarea { width: 100%; padding: 15px; border-radius: 15px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.2); color: #fff; font-size: 0.95rem; outline: none; resize: none; margin-bottom: 20px; }
.publish-textarea:focus { border-color: rgba(74, 158, 255, 0.5); }
.publish-submit { width: 100%; padding: 16px; border-radius: 18px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.7), rgba(74, 158, 255, 0.7)); border: none; color: #fff; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.publish-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4); }

.topic-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.topic-modal-content { width: 90%; max-width: 700px; background: rgba(10, 20, 40, 0.95); border: 1px solid rgba(74, 158, 255, 0.3); border-radius: 20px; padding: 35px; position: relative; max-height: 80vh; overflow-y: auto; }
.topic-header { margin-bottom: 25px; }
.topic-header h2 { font-size: 1.8rem; font-weight: 600; color: #fff; margin-bottom: 12px; }
.topic-stats { display: flex; gap: 20px; }
.topic-stats span { font-size: 0.95rem; color: rgba(150, 180, 220, 0.5); }
.topic-stats .trend { color: rgba(0, 212, 170, 0.8); }
.topic-related { margin-bottom: 25px; padding: 18px; background: rgba(0, 0, 0, 0.4); border-radius: 15px; }
.related-title { font-size: 0.95rem; color: rgba(150, 180, 220, 0.5); margin-right: 10px; }
.related-tag { padding: 8px 16px; background: rgba(168, 85, 247, 0.15); border-radius: 12px; font-size: 0.85rem; color: rgba(168, 85, 247, 0.8); cursor: pointer; transition: all 0.3s; margin-right: 10px; }
.related-tag:hover { background: rgba(168, 85, 247, 0.3); }
.topic-content h3 { font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 20px; }
.topic-posts { display: flex; flex-direction: column; gap: 15px; }
.topic-post { display: flex; gap: 15px; padding: 18px; background: rgba(0, 0, 0, 0.4); border-radius: 15px; cursor: pointer; transition: all 0.3s; }
.topic-post:hover { background: rgba(74, 158, 255, 0.1); }
.post-avatar-sm { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
.post-info { flex: 1; }
.post-info h4 { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 8px; }
.post-meta { display: flex; gap: 15px; font-size: 0.85rem; color: rgba(150, 180, 220, 0.4); }

.my-publish-list { max-height: 500px; overflow-y: auto; padding: 10px; }
.my-publish-item { display: flex; gap: 15px; padding: 20px; background: rgba(0, 0, 0, 0.4); border-radius: 15px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s; }
.my-publish-item:hover { background: rgba(74, 158, 255, 0.15); }
.publish-rank { width: 36px; height: 36px; border-radius: 50%; background: rgba(74, 158, 255, 0.2); color: rgba(74, 158, 255, 0.8); font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.publish-info { flex: 1; }
.publish-title { font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 8px; }
.publish-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.publish-tag { padding: 6px 12px; background: rgba(168, 85, 247, 0.15); border-radius: 10px; font-size: 0.8rem; color: rgba(168, 85, 247, 0.8); }
.publish-stats { display: flex; gap: 20px; font-size: 0.85rem; color: rgba(150, 180, 220, 0.4); }
.publish-time { font-size: 0.8rem; color: rgba(150, 180, 220, 0.3); flex-shrink: 0; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 20px; }
.empty-state p { font-size: 1rem; color: rgba(150, 180, 220, 0.5); margin-bottom: 25px; }
.empty-btn { padding: 14px 35px; border-radius: 20px; background: linear-gradient(135deg, rgba(74, 158, 255, 0.6), rgba(0, 212, 170, 0.4)); border: none; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.empty-btn:hover { transform: scale(1.05); }

.community-footer { text-align: center; padding: 30px; color: rgba(150, 180, 220, 0.3); font-size: 0.9rem; }

.profile-content { padding: 20px 0; }
.profile-header { display: flex; gap: 25px; align-items: center; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 1px solid rgba(74, 158, 255, 0.2); }
.profile-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(74, 158, 255, 0.3); }
.profile-info { flex: 1; }
.profile-info h3 { font-size: 1.6rem; font-weight: 600; color: #fff; margin-bottom: 8px; }
.profile-title { font-size: 0.95rem; color: rgba(74, 158, 255, 0.8); margin-bottom: 12px; }
.profile-tags { display: flex; gap: 10px; }
.profile-tag { padding: 6px 14px; background: rgba(0, 212, 170, 0.15); border-radius: 12px; font-size: 0.85rem; color: rgba(0, 212, 170, 0.8); }
.profile-stats { display: flex; gap: 30px; justify-content: center; padding: 20px; background: rgba(0, 0, 0, 0.4); border-radius: 15px; margin-bottom: 25px; }
.stat-item { text-align: center; }
.stat-num { font-size: 1.8rem; font-weight: 700; color: rgba(74, 158, 255, 0.9); display: block; }
.stat-text { font-size: 0.85rem; color: rgba(150, 180, 220, 0.4); }
.profile-section { margin-bottom: 25px; }
.profile-section h4 { font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 15px; }
.mini-post { padding: 15px; background: rgba(0, 0, 0, 0.4); border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s; }
.mini-post:hover { background: rgba(74, 158, 255, 0.1); }
.mini-title { font-size: 0.95rem; color: #fff; font-weight: 500; display: block; margin-bottom: 6px; }
.mini-meta { font-size: 0.8rem; color: rgba(150, 180, 220, 0.4); }
.empty-text { font-size: 0.95rem; color: rgba(150, 180, 220, 0.4); text-align: center; padding: 30px; }

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(74, 158, 255, 0.2); }
.modal-header h2 { font-size: 1.4rem; font-weight: 600; color: #fff; margin: 0; }
.close-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: rgba(239, 68, 68, 0.8); font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.close-btn:hover { background: rgba(239, 68, 68, 0.25); }
.collect-tabs { display: flex; gap: 25px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(74, 158, 255, 0.2); }
.collect-tabs span { font-size: 1rem; color: rgba(150, 180, 220, 0.5); cursor: pointer; padding-bottom: 10px; border-bottom: 2px solid transparent; transition: all 0.3s; }
.collect-tabs span.active { color: rgba(74, 158, 255, 0.9); border-color: rgba(74, 158, 255, 0.9); }
.collect-list { max-height: 500px; overflow-y: auto; padding: 10px; }
.uncollect-btn { padding: 10px 20px; border-radius: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: rgba(239, 68, 68, 0.8); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
.uncollect-btn:hover { background: rgba(239, 68, 68, 0.25); }

.settings-content { padding: 20px 0; }
.settings-section { margin-bottom: 30px; }
.settings-section h3 { font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(74, 158, 255, 0.2); }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(150, 180, 220, 0.1); }
.setting-label { font-size: 0.95rem; color: rgba(150, 180, 220, 0.7); }
.setting-input { padding: 10px 15px; border-radius: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(74, 158, 255, 0.2); color: #fff; font-size: 0.9rem; outline: none; width: 200px; }
.setting-input:focus { border-color: rgba(74, 158, 255, 0.5); }
.toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-switch .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: rgba(150, 180, 220, 0.2); transition: 0.4s; border-radius: 28px; }
.toggle-switch .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background: rgba(150, 180, 220, 0.5); transition: 0.4s; border-radius: 50%; }
.toggle-switch input:checked + .slider { background: rgba(74, 158, 255, 0.5); }
.toggle-switch input:checked + .slider:before { transform: translateX(24px); background: #fff; }
.settings-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(74, 158, 255, 0.2); }
.save-btn { padding: 14px 35px; border-radius: 15px; background: linear-gradient(135deg, rgba(74, 158, 255, 0.6), rgba(0, 212, 170, 0.4)); border: none; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.save-btn:hover { transform: scale(1.02); }
</style>