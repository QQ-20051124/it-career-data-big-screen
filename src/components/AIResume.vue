<template>
  <div class="ai-resume-page">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="#4a9eff" stroke-width="2"/>
        </svg>
        <span>返回</span>
      </button>
      <div class="header-title">
        <h1>AI简历制作</h1>
        <p>填写基础信息，智能生成专业简历内容</p>
      </div>
    </div>

    <div class="main-content">
      <div class="step-nav">
        <div class="nav-title">简历制作步骤</div>
        <div 
          v-for="(step, index) in steps" 
          :key="index" 
          class="step-item"
          :class="{ active: currentStep === index, completed: currentStep > index }"
          @click="currentStep = index"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-text">{{ step }}</div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-glow"></div>
        
        <div v-if="currentStep === 0" class="step-content">
          <div class="basic-form-wrapper">
            <div class="basic-form-fields">
              <div class="form-row">
                <div class="form-item">
                  <label>姓名</label>
                  <input type="text" v-model="formData.name" placeholder="请输入姓名"/>
                </div>
                <div class="form-item">
                  <label>求职意向</label>
                  <div class="select-wrapper">
                    <select v-model="formData.intention">
                    <option value="">请选择求职意向</option>
                    <option value="前端开发">前端开发</option>
                    <option value="后端开发">后端开发</option>
                    <option value="全栈开发">全栈开发</option>
                    <option value="数据分析师">数据分析师</option>
                    <option value="数据科学家">数据科学家</option>
                    <option value="AI算法工程师">AI算法工程师</option>
                    <option value="机器学习工程师">机器学习工程师</option>
                    <option value="深度学习工程师">深度学习工程师</option>
                    <option value="产品经理">产品经理</option>
                    <option value="项目经理">项目经理</option>
                    <option value="测试工程师">测试工程师</option>
                    <option value="运维工程师">运维工程师</option>
                    <option value="DevOps工程师">DevOps工程师</option>
                    <option value="安全工程师">安全工程师</option>
                    <option value="UI设计师">UI设计师</option>
                    <option value="UX设计师">UX设计师</option>
                    <option value="交互设计师">交互设计师</option>
                    <option value="嵌入式开发">嵌入式开发</option>
                    <option value="物联网开发">物联网开发</option>
                    <option value="游戏开发">游戏开发</option>
                    <option value="区块链开发">区块链开发</option>
                    <option value="大数据开发">大数据开发</option>
                    <option value="云计算工程师">云计算工程师</option>
                    <option value="网络工程师">网络工程师</option>
                    <option value="架构师">架构师</option>
                  </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                <div class="form-item">
                  <label>联系电话</label>
                  <input type="text" v-model="formData.phone" placeholder="请输入联系电话"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-item">
                  <label>邮箱</label>
                  <div class="select-wrapper">
                    <select v-model="formData.emailType">
                    <option value="">请选择邮箱</option>
                    <option value="qq">qq.com</option>
                    <option value="163">163.com</option>
                    <option value="126">126.com</option>
                    <option value="sina">sina.com</option>
                    <option value="gmail">gmail.com</option>
                    <option value="hotmail">hotmail.com</option>
                    <option value="outlook">outlook.com</option>
                    <option value="icloud">icloud.com</option>
                  </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                <div class="form-item">
                  <label>邮箱地址</label>
                  <input type="text" v-model="formData.email" placeholder="请输入邮箱地址"/>
                </div>
                <div class="form-item">
                  <label>性别</label>
                  <div class="select-wrapper">
                    <select v-model="formData.gender">
                      <option value="">请选择性别</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-item">
                  <label>年龄</label>
                  <input type="text" v-model="formData.age" placeholder="请输入年龄" maxlength="3"/>
                </div>
                <div class="form-item">
                  <label>籍贯</label>
                  <input type="text" v-model="formData.origin" placeholder="请输入籍贯"/>
                </div>
                <div class="form-item">
                  <label>现居地</label>
                  <input type="text" v-model="formData.residence" placeholder="请输入现居地"/>
                </div>
              </div>
            </div>

            <div class="basic-form-photo">
              <label>一寸照片</label>
              <div class="photo-upload" @click="triggerPhotoUpload">
                <img v-if="formData.photo" :src="formData.photo" alt="照片" class="photo-preview"/>
                <div v-else class="photo-placeholder">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="rgba(74,158,255,0.5)"/>
                  </svg>
                  <span>点击上传照片</span>
                </div>
              </div>
              <input type="file" ref="photoInput" accept="image/*" class="hidden-input" @change="handlePhotoUpload"/>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 1" class="step-content">
          <div class="form-row">
            <div class="form-item">
              <label>最高学历</label>
              <div class="select-wrapper">
                <select v-model="formData.education">
                <option value="">请选择最高学历</option>
                <option value="小学">小学</option>
                <option value="初中">初中</option>
                <option value="高中">高中</option>
                <option value="中专">中专</option>
                <option value="大专">大专</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
                <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                </svg>
              </div>
            </div>
            <div class="form-item">
              <label>毕业院校</label>
              <input type="text" v-model="formData.school" placeholder="请输入毕业院校"/>
            </div>
            <div class="form-item">
              <label>所学专业</label>
              <input type="text" v-model="formData.major" placeholder="请输入所学专业"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>入学时间</label>
              <input type="date" v-model="formData.schoolStart"/>
            </div>
            <div class="form-item">
              <label>毕业时间</label>
              <input type="date" v-model="formData.schoolEnd"/>
            </div>
            <div class="form-item">
              <label>学位</label>
              <div class="select-wrapper">
                <select v-model="formData.degree">
                <option value="">请选择学位</option>
                <option value="无">无</option>
                <option value="副学士">副学士</option>
                <option value="学士">学士</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
                <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item full">
              <label>在校荣誉</label>
              <textarea v-model="formData.honors" placeholder="请输入在校期间获得的荣誉奖项" rows="3"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item full">
              <label>主修课程</label>
              <textarea v-model="formData.courses" placeholder="请输入主修课程" rows="3"></textarea>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <div class="form-row">
            <div class="form-item">
              <label>公司名称</label>
              <input type="text" v-model="formData.company" placeholder="请输入公司名称"/>
            </div>
            <div class="form-item">
              <label>职位</label>
              <input type="text" v-model="formData.position" placeholder="请输入职位名称"/>
            </div>
            <div class="form-item">
              <label>所属行业</label>
              <div class="select-wrapper">
                <select v-model="formData.industry">
                <option value="">请选择行业</option>
                <option value="互联网">互联网</option>
                <option value="金融">金融</option>
                <option value="教育">教育</option>
                <option value="医疗">医疗</option>
                <option value="电子商务">电子商务</option>
                <option value="游戏">游戏</option>
                <option value="人工智能">人工智能</option>
                <option value="大数据">大数据</option>
                <option value="云计算">云计算</option>
                <option value="物联网">物联网</option>
                <option value="区块链">区块链</option>
                <option value="软件开发">软件开发</option>
                <option value="硬件">硬件</option>
                <option value="半导体">半导体</option>
                <option value="通信">通信</option>
                <option value="媒体">媒体</option>
                <option value="广告">广告</option>
                <option value="零售">零售</option>
                <option value="物流">物流</option>
                <option value="制造业">制造业</option>
                <option value="能源">能源</option>
                <option value="房地产">房地产</option>
                <option value="建筑">建筑</option>
                <option value="咨询">咨询</option>
                <option value="法律">法律</option>
                <option value="会计">会计</option>
                <option value="政府">政府</option>
                <option value="非营利">非营利</option>
                <option value="科研">科研</option>
              </select>
                <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>入职时间</label>
              <input type="date" v-model="formData.workStart"/>
            </div>
            <div class="form-item">
              <label>离职时间</label>
              <input type="date" v-model="formData.workEnd"/>
            </div>
            <div class="form-item">
              <label>工作年限</label>
              <div class="select-wrapper">
                <select v-model="formData.experience">
                <option value="">请选择工作年限</option>
                <option value="应届">应届生</option>
                <option value="1年以下">1年以下</option>
                <option value="1-2年">1-2年</option>
                <option value="2-3年">2-3年</option>
                <option value="3-5年">3-5年</option>
                <option value="5-8年">5-8年</option>
                <option value="8-10年">8-10年</option>
                <option value="10年以上">10年以上</option>
              </select>
                <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item full">
              <label>岗位职责</label>
              <textarea v-model="formData.responsibilities" placeholder="请输入岗位职责" rows="4"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item full">
              <label>工作业绩</label>
              <textarea v-model="formData.achievements" placeholder="请输入工作业绩，尽量量化" rows="4"></textarea>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <div class="form-row">
            <div class="form-item">
              <label>技能名称</label>
              <input type="text" v-model="formData.skillName" placeholder="请输入技能名称"/>
            </div>
            <div class="form-item">
              <label>熟练程度</label>
              <div class="select-wrapper">
                <select v-model="formData.skillLevel">
                <option value="">请选择熟练程度</option>
                <option value="精通">精通</option>
                <option value="熟练">熟练</option>
                <option value="良好">良好</option>
                <option value="了解">了解</option>
                <option value="入门">入门</option>
              </select>
                <svg class="select-arrow" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 15l-6-6 6-6" fill="none" stroke="rgba(74,158,255,0.5)" stroke-width="2"/>
                </svg>
              </div>
            </div>
            <div class="form-item">
              <label>使用年限</label>
              <input type="number" v-model="formData.skillYears" placeholder="请输入使用年限"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item full">
              <label>技能标签</label>
              <div class="tags-input">
                <div 
                  v-for="(tag, index) in formData.skills" 
                  :key="index" 
                  class="tag-item"
                >
                  {{ tag }}
                  <span class="tag-remove" @click="removeSkill(index)">×</span>
                </div>
                <input 
                  type="text" 
                  v-model="newSkill" 
                  placeholder="输入技能标签"
                  @keyup.enter="addSkill"
                />
              </div>
            </div>
          </div>

          <div class="projects-section">
            <div class="section-title">项目经历</div>
            <div class="project-list">
              <div 
                v-for="(project, pIndex) in formData.projects" 
                :key="pIndex" 
                class="project-card"
              >
                <div class="project-header">
                  <span class="project-number">项目 {{ pIndex + 1 }}</span>
                  <button class="remove-project" @click="removeProject(pIndex)">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#ff4757"/>
                    </svg>
                  </button>
                </div>
                <div class="form-row">
                  <div class="form-item">
                    <label>项目名称</label>
                    <input type="text" v-model="project.name" placeholder="请输入项目名称"/>
                  </div>
                  <div class="form-item">
                    <label>项目角色</label>
                    <input type="text" v-model="project.role" placeholder="请输入项目角色"/>
                  </div>
                  <div class="form-item">
                    <label>项目周期</label>
                    <input type="text" v-model="project.duration" placeholder="请输入项目周期"/>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-item full">
                    <label>项目描述</label>
                    <textarea v-model="project.desc" placeholder="请输入项目描述" rows="3"></textarea>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-item full">
                    <label>项目成果</label>
                    <textarea v-model="project.achievements" placeholder="请输入项目成果（量化成果优先）" rows="2"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <button class="add-project-btn" @click="addProject">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M12 4v16m8-8H4" fill="none" stroke="#4a9eff" stroke-width="2"/>
              </svg>
              <span>添加项目经历</span>
            </button>
          </div>

          <div class="form-row">
            <div class="form-item full">
              <label>个人优势</label>
              <textarea v-model="formData.strengths" placeholder="请输入个人优势" rows="4"></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="save-btn" @click="handleSaveNext">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>保存并下一步</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

      <!-- 简历评分面板 -->
      <div v-if="currentStep === 3" class="score-panel">
        <div class="score-card">
          <div class="score-circle" :class="resumeScore.level">
            <span class="score-value">{{ resumeScore.total }}</span>
            <span class="score-max">/100</span>
          </div>
          <div class="score-info">
            <div class="score-label">简历完整度</div>
            <div class="score-level" :class="resumeScore.level">{{ resumeScore.level }}</div>
          </div>
          <div class="score-details">
            <div class="score-item" v-for="detail in resumeScore.details.slice(0, 4)" :key="detail.item">
              <span class="item-name">{{ detail.item }}</span>
              <div class="item-bar">
                <div class="item-progress" :style="{ width: (detail.score / detail.max * 100) + '%' }"></div>
              </div>
              <span class="item-score">{{ detail.score }}</span>
            </div>
          </div>
        </div>
        
        <div class="quick-actions">
          <button class="action-btn smart-optimize" @click="smartOptimizeResume" :disabled="isOptimizing">
            <svg v-if="!isOptimizing" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <div v-else class="loading-spinner"></div>
            <span>{{ isOptimizing ? 'AI分析中...' : getOptimizeButtonText() }}</span>
          </button>
          <button class="action-btn quick-save" @click="handleSaveNext">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="none" stroke="currentColor" stroke-width="2"/>
              <polyline points="17 21 17 13 7 13 7 21" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>保存简历</span>
          </button>
          <button class="action-btn quick-generate" @click="generateResume">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2"/>
              <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>预览简历</span>
          </button>
        </div>
      </div>

      <!-- AI 简历智能优化中心 -->
      <div v-if="currentStep === 3" class="optimization-center">
        <div class="optimization-center-header">
          <div class="oc-header-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="oc-header-title">
            <h3>AI 简历智能优化中心</h3>
            <p>选择目标岗位和优化模式，让AI为您量身定制最优简历</p>
          </div>
          <div class="oc-header-steps">
            <span class="oc-step" :class="{ active: !targetJob, done: targetJob }">1. 选岗位</span>
            <span class="oc-step-arrow">→</span>
            <span class="oc-step" :class="{ active: !optimizationMode, done: optimizationMode }">2. 选模式</span>
            <span class="oc-step-arrow">→</span>
            <span class="oc-step" :class="{ active: !targetOptimized }">3. 开始优化</span>
          </div>
        </div>

        <!-- Step 1: 目标岗位 -->
        <div class="oc-section">
          <div class="oc-section-header">
            <div class="oc-step-badge">1</div>
            <h4>选择目标岗位 <span class="oc-optional-tag">（可选）</span></h4>
          </div>
          
          <!-- 无目标岗位时：选择器 -->
          <div v-if="!targetJob" class="job-selector-card compact">
            <div class="selector-desc">选择目标岗位后，AI将根据岗位要求进行针对性优化</div>
            <div class="selector-actions">
              <button class="select-job-btn" @click="showJobSelector = true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z" fill="currentColor"/>
                </svg>
                <span>从岗位库选择</span>
              </button>
              <button class="skip-btn" @click="selectQuickJob">
                <span>快速选择热门岗位</span>
              </button>
            </div>
          </div>

          <!-- 已选目标岗位时：信息展示 -->
          <div v-if="targetJob" class="target-job-card compact">
            <div class="target-job-header">
              <div class="target-job-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z" fill="#4a9eff"/>
                </svg>
              </div>
              <div class="target-job-title">
                <span class="job-label">已选岗位</span>
                <h3>{{ targetJob.job_name }}</h3>
              </div>
              <button class="clear-target-btn" @click="clearTargetJob" title="清除岗位">×</button>
            </div>
            <div class="target-job-info">
              <div class="info-tag"><span class="tag-icon">📍</span>{{ targetJob.city }}</div>
              <div class="info-tag"><span class="tag-icon">🎓</span>{{ targetJob.education }}</div>
              <div class="info-tag"><span class="tag-icon">⏱</span>{{ targetJob.work_exp }}</div>
              <div class="info-tag" v-if="targetJob.salary_avg"><span class="tag-icon">💰</span>{{ formatSalary(targetJob.salary_avg) }}</div>
              <div class="info-tag" v-if="targetJob.skills && targetJob.skills.length > 0">
                <span class="tag-icon">💡</span>
                <span class="skill-tags">
                  <span v-for="skill in targetJob.skills.slice(0, 4)" :key="skill" class="skill-tag">{{ skill }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: 优化模式 -->
        <div class="oc-section">
          <div class="oc-section-header">
            <div class="oc-step-badge">2</div>
            <h4>选择优化模式</h4>
          </div>
          
          <div class="optimization-mode-selector">
            <div class="mode-options">
              <label class="mode-option" :class="{ active: optimizationMode === 'targeted', disabled: !targetJob }" @click="selectOptimizationMode('targeted')">
                <input type="radio" name="optimizationMode" value="targeted" v-model="optimizationMode" style="display:none" :disabled="!targetJob"/>
                <span class="mode-icon">🎯</span>
                <div class="mode-info">
                  <span class="mode-name">岗位针对性优化</span>
                  <span class="mode-desc">根据目标岗位要求定制优化</span>
                </div>
                <span v-if="!targetJob" class="mode-lock-icon" title="请先选择目标岗位">🔒</span>
              </label>
              <label class="mode-option" :class="{ active: optimizationMode === 'general' }" @click="selectOptimizationMode('general')">
                <input type="radio" name="optimizationMode" value="general" v-model="optimizationMode" style="display:none"/>
                <span class="mode-icon">✨</span>
                <div class="mode-info">
                  <span class="mode-name">AI简易优化</span>
                  <span class="mode-desc">通用优化，提升简历质量</span>
                </div>
              </label>
            </div>
          </div>

          <!-- 模式说明 -->
          <div class="mode-explanation" :class="{ optimized: targetOptimized }">
            <template v-if="!targetOptimized">
              <span class="ex-icon">💡</span>
              <span v-if="optimizationMode === 'targeted'">
                <strong>岗位针对性优化：</strong>AI将根据目标岗位的技能要求、经验偏好等对简历进行深度优化，提升与岗位的匹配度。
              </span>
              <span v-else>
                <strong>AI简易优化：</strong>AI将对简历进行通用优化，包括语言润色、结构改进、关键词补充等，提升简历整体质量。
              </span>
            </template>
            <template v-else>
              <span class="ex-icon">✅</span>
              <span class="optimized-text">AI优化已完成，匹配度和简历内容已自动更新</span>
            </template>
          </div>
        </div>

        <!-- Step 3: 执行优化 -->
        <div class="oc-section">
          <div class="oc-section-header">
            <div class="oc-step-badge">3</div>
            <h4>开始优化</h4>
          </div>

          <!-- 优化按钮 -->
          <div class="execute-section">
            <button class="execute-btn" @click="smartOptimizeResume" :disabled="isOptimizing || (optimizationMode === 'targeted' && !targetJob)">
              <div v-if="!isOptimizing" class="execute-btn-content">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                </svg>
                <span>{{ getExecuteButtonText() }}</span>
              </div>
              <div v-else class="execute-btn-loading">
                <div class="loading-spinner-small"></div>
                <span>AI 正在分析与优化简历...</span>
              </div>
            </button>
            <p v-if="optimizationMode === 'targeted' && !targetJob" class="execute-hint">
              💡 请先选择一个目标岗位，或切换到"AI简易优化"模式
            </p>
          </div>

          <!-- 优化进度面板 -->
          <div v-if="isOptimizing && optimizationSteps.length > 0" class="optimization-progress-panel">
            <div class="progress-header">
              <span class="progress-title">🤖 AI正在分析与优化</span>
              <span class="progress-percent">{{ optimizingProgress }}%</span>
            </div>
            <div class="progress-bar-outer">
              <div class="progress-bar-inner" :style="{ width: optimizingProgress + '%' }"></div>
            </div>
            <div class="progress-steps">
              <div v-for="(step, i) in optimizationSteps" :key="i" class="progress-step" :class="step.status">
                <span class="step-icon">{{ step.status === 'done' ? '✓' : step.status === 'active' ? '●' : '○' }}</span>
                <span class="step-label">{{ step.label }}</span>
              </div>
            </div>
          </div>

          <!-- 岗位匹配度仪表盘 -->
          <div v-if="jobMatchAnalysis" class="match-dashboard" :class="{ 'just-optimized': targetOptimized }">
            <div v-if="targetOptimized" class="optimized-badge">
              <span>✨ AI优化后</span>
            </div>
            <div class="match-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
                <circle 
                  cx="60" cy="60" r="52" 
                  fill="none" 
                  :stroke="jobMatchAnalysis.overall >= 70 ? '#00d4aa' : jobMatchAnalysis.overall >= 50 ? '#4a9eff' : '#ff9800'" 
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="`${jobMatchAnalysis.overall * 3.26} 326.7`"
                  transform="rotate(-90 60 60)"
                  class="match-progress"
                />
                <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="4 6"/>
              </svg>
              <div class="match-value">
                <span>{{ jobMatchAnalysis.overall }}%</span>
                <small>匹配度</small>
              </div>
            </div>
            <div class="match-details">
              <div class="match-item">
                <span class="match-label">技能</span>
                <div class="match-bar"><div class="match-progress-bar skill" :style="{width: jobMatchAnalysis.skillMatch + '%'}"></div></div>
                <span class="match-score">{{ jobMatchAnalysis.skillMatch }}%</span>
              </div>
              <div class="match-item">
                <span class="match-label">学历</span>
                <div class="match-bar"><div class="match-progress-bar edu" :style="{width: jobMatchAnalysis.eduMatch + '%'}"></div></div>
                <span class="match-score">{{ jobMatchAnalysis.eduMatch }}%</span>
              </div>
              <div class="match-item">
                <span class="match-label">城市</span>
                <div class="match-bar"><div class="match-progress-bar city" :style="{width: jobMatchAnalysis.cityMatch + '%'}"></div></div>
                <span class="match-score">{{ jobMatchAnalysis.cityMatch }}%</span>
              </div>
              <div class="match-item">
                <span class="match-label">经验</span>
                <div class="match-bar"><div class="match-progress-bar exp" :style="{width: jobMatchAnalysis.expMatch + '%'}"></div></div>
                <span class="match-score">{{ jobMatchAnalysis.expMatch }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI分析结果面板 -->
      <div v-if="showAiAnalysisPanel && aiAnalysisResult" class="ai-analysis-panel">
        <div class="analysis-header">
          <h4>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            AI简历分析报告
          </h4>
          <button class="close-analysis" @click="showAiAnalysisPanel = false">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <!-- 无数据提示 -->
        <div v-if="aiAnalysisResult.isEmpty" class="analysis-empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h5>暂无足够的简历数据</h5>
          <p>{{ aiAnalysisResult.analysis.summary }}</p>
          <div class="empty-guide">
            <h6>请补充以下信息：</h6>
            <ul>
              <li>👤 基本信息：姓名、求职意向</li>
              <li>🎓 教育背景：学历、毕业院校、专业</li>
              <li>💼 工作经历：公司、职位、工作内容</li>
              <li>🛠️ 技能标签：掌握的技术和工具</li>
              <li>📁 项目经历：参与过的项目</li>
            </ul>
          </div>
          <button class="go-to-form-btn" @click="scrollToForm">去填写简历</button>
        </div>
        
        <!-- 有数据时的分析结果 -->
        <div v-else class="analysis-body">
        
        <div class="analysis-score-section">
          <div class="score-ring-container">
            <div class="big-score-ring" :class="getScoreLevel(aiAnalysisResult.score.total)">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
                <circle 
                  cx="60" cy="60" r="52" 
                  fill="none" 
                  :stroke="getScoreColor(aiAnalysisResult.score.total)" 
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="`${aiAnalysisResult.score.total * 3.26} 326.7`"
                  transform="rotate(-90 60 60)"
                  class="score-progress"
                />
              </svg>
              <div class="score-text">
                <span>{{ aiAnalysisResult.score.total }}</span>
                <small>简历得分</small>
              </div>
            </div>
          </div>
          
          <div class="score-breakdown">
            <div class="breakdown-item" v-for="(value, key) in aiAnalysisResult.score.breakdown" :key="key">
              <span class="bd-label">{{ getBreakdownLabel(key) }}</span>
              <div class="bd-bar"><div class="bd-progress" :style="{width: Math.min(100, (value / (key === 'basic' || key === 'education' ? 20 : key === 'experience' ? 15 : key === 'skills' ? 15 : 10) * 100)) + '%'}"></div></div>
              <span class="bd-value">{{ value }}</span>
            </div>
          </div>
        </div>
        
        <div class="analysis-content">
          <div class="analysis-summary">
            <h5>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              总体评价
            </h5>
            <p>{{ aiAnalysisResult.analysis.summary }}</p>
          </div>
          
          <div v-if="aiAnalysisResult.analysis.strengths && aiAnalysisResult.analysis.strengths.length > 0" class="analysis-strengths">
            <h5>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              核心优势
            </h5>
            <ul>
              <li v-for="(s, i) in aiAnalysisResult.analysis.strengths" :key="i">{{ s }}</li>
            </ul>
          </div>
          
          <div v-if="aiAnalysisResult.analysis.weaknesses && aiAnalysisResult.analysis.weaknesses.length > 0" class="analysis-weaknesses">
            <h5>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              待改进项
            </h5>
            <ul>
              <li v-for="(w, i) in aiAnalysisResult.analysis.weaknesses" :key="i">{{ w }}</li>
            </ul>
          </div>
          
          <div v-if="aiAnalysisResult.suggestions && aiAnalysisResult.suggestions.length > 0" class="analysis-suggestions">
            <h5>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
              </svg>
              优化建议
            </h5>
            <div class="suggestion-cards">
              <div v-for="(s, i) in aiAnalysisResult.suggestions" :key="i" class="suggestion-card" :class="s.priority">
                <div class="suggestion-header">
                  <span class="priority-badge">{{ s.priority === 'high' ? '高优先级' : s.priority === 'medium' ? '中优先级' : '低优先级' }}</span>
                  <span class="category-tag">{{ s.category }}</span>
                </div>
                <h6>{{ s.title }}</h6>
                <p class="suggestion-desc">{{ s.description }}</p>
                <p v-if="s.example" class="suggestion-example">示例：{{ s.example }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="aiAnalysisResult.keywordSuggestions && aiAnalysisResult.keywordSuggestions.add && aiAnalysisResult.keywordSuggestions.add.length > 0" class="analysis-keywords">
            <h5>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              建议添加的关键词
            </h5>
            <div class="keyword-tags">
              <span v-for="(kw, i) in aiAnalysisResult.keywordSuggestions.add" :key="i" class="keyword-tag">{{ kw }}</span>
            </div>
          </div>
          
          <div v-if="aiAnalysisResult.contentRewrite && (aiAnalysisResult.contentRewrite.responsibilities || aiAnalysisResult.contentRewrite.achievements || aiAnalysisResult.contentRewrite.summary)" class="analysis-rewrite">
            <h5>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              AI内容重写建议
            </h5>
            <div class="rewrite-item" v-if="aiAnalysisResult.contentRewrite.responsibilities">
              <label>岗位职责</label>
              <p>{{ aiAnalysisResult.contentRewrite.responsibilities }}</p>
              <button class="apply-btn" @click="applyRewrite('responsibilities', aiAnalysisResult.contentRewrite.responsibilities)">应用此建议</button>
            </div>
            <div class="rewrite-item" v-if="aiAnalysisResult.contentRewrite.achievements">
              <label>工作业绩</label>
              <p>{{ aiAnalysisResult.contentRewrite.achievements }}</p>
              <button class="apply-btn" @click="applyRewrite('achievements', aiAnalysisResult.contentRewrite.achievements)">应用此建议</button>
            </div>
            <div class="rewrite-item" v-if="aiAnalysisResult.contentRewrite.summary">
              <label>个人优势</label>
              <p>{{ aiAnalysisResult.contentRewrite.summary }}</p>
              <button class="apply-btn" @click="applyRewrite('strengths', aiAnalysisResult.contentRewrite.summary)">应用此建议</button>
            </div>
          </div>

        <div class="ai-section">
        <div class="section-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#4a9eff" stroke-width="2"/>
              <path d="M12 6l4 4-4 4" fill="none" stroke="#4a9eff" stroke-width="2"/>
              <circle cx="12" cy="18" r="2" fill="#4a9eff"/>
            </svg>
          </div>
          <span>AI智能建议</span>
        </div>

        <div class="ai-title">{{ activeAiTab === 2 ? '岗位针对性优化建议' : '个人优势提炼' }}</div>

        <div class="ai-tabs">
          <div 
            v-for="(tab, index) in aiTabs" 
            :key="index" 
            class="ai-tab"
            :class="{ active: activeAiTab === index, disabled: index === 2 && !targetJob }"
            @click="activeAiTab = index"
          >
            {{ tab }}
          </div>
        </div>

        <div class="ai-suggestions">
          <div class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
            <div class="suggestion-icon" :class="item.type">
              <svg v-if="item.type === 'success'" viewBox="0 0 24 24" width="16" height="16">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#00d4aa"/>
              </svg>
              <svg v-else-if="item.type === 'warning'" viewBox="0 0 24 24" width="16" height="16">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#ff9800"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#4a9eff"/>
              </svg>
            </div>
            <span>{{ item.text }}</span>
          </div>
        </div>

        <button class="generate-btn" @click="generateResume">生成简历</button>
      </div>
          </div>
        </div>
      </div>
      </div>
    </div>

  <div v-if="showResume" class="resume-modal" @click.self="closeResume">
    <div class="resume-container">
      <div class="resume-header">
        <h2>个人简历</h2>
        <div class="resume-actions">
          <div class="export-dropdown" ref="exportDropdownRef">
            <button class="export-btn" @click.stop="toggleExportDropdown">
              导出简历
              <span class="export-arrow" :class="{ rotated: showExportDropdown }">▼</span>
            </button>
            <div v-if="showExportDropdown" class="export-menu">
              <div class="export-menu-item" @click="exportWordResume">
                <span class="export-icon">📄</span>
                <div class="export-menu-text">
                  <div class="export-menu-title">导出 Word</div>
                  <div class="export-menu-desc">.docx 格式</div>
                </div>
              </div>
              <div class="export-menu-item" @click="exportPdfResume">
                <span class="export-icon">📑</span>
                <div class="export-menu-text">
                  <div class="export-menu-title">导出 PDF</div>
                  <div class="export-menu-desc">.pdf 格式</div>
                </div>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="closeResume">×</button>
        </div>
      </div>
      
      <!-- PDF导出时，只会抓取resume-export-area里的内容 -->
      <div class="resume-export-area">
      <div class="resume-export-header">
        <h1>个人简历</h1>
      </div>
      <div class="resume-content">
        <div class="resume-main">
          <div class="section">
            <h3>基本信息</h3>
            <div class="basic-info">
              <div class="info-content">
                <div class="personal-header">
                  <div class="name-title">
                    <h2>{{ formData.name || '未填写' }}</h2>
                    <p>{{ formData.intention || '未填写' }}</p>
                  </div>
                </div>
                <div class="info-grid">
                  <div><span class="label">性别：</span>{{ formData.gender || '未填写' }}</div>
                  <div><span class="label">年龄：</span>{{ formData.age || '未填写' }}</div>
                  <div><span class="label">籍贯：</span>{{ formData.origin || '未填写' }}</div>
                  <div><span class="label">现居地：</span>{{ formData.residence || '未填写' }}</div>
                  <div><span class="label">联系电话：</span>{{ formData.phone || '未填写' }}</div>
                  <div class="email-item"><span class="label">邮箱：</span><span class="email-text">{{ formData.email && formData.emailType ? formData.email + '@' + formData.emailType + '.com' : (formData.email ? formData.email : '未填写') }}</span></div>
                </div>
              </div>
              <div class="photo-section">
                <img v-if="formData.photo" :src="formData.photo" alt="照片" class="resume-photo"/>
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
                  <span class="title">{{ formData.school || '未填写' }}</span>
                  <span class="time">{{ formData.schoolStart || '' }} - {{ formData.schoolEnd || '' }}</span>
                </div>
                <p><span class="label">专业：</span>{{ formData.major || '未填写' }}</p>
                <p><span class="label">学历：</span>{{ formData.education || '未填写' }}（{{ formData.degree || '' }}）</p>
                <p v-if="formData.courses" class="desc"><span class="label">主修课程：</span>{{ formData.courses }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>实习经历</h3>
            <div class="timeline-item">
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="title">{{ formData.company || '未填写' }}</span>
                  <span class="time">{{ formData.workStart || '' }} - {{ formData.workEnd || '' }}</span>
                </div>
                <p><span class="label">职位：</span>{{ formData.position || '未填写' }}</p>
                <p><span class="label">行业：</span>{{ formData.industry || '未填写' }}</p>
                <p><span class="label">经验：</span>{{ formData.experience || '未填写' }}</p>
                <p v-if="formData.responsibilities" class="desc"><span class="label">岗位职责：</span>{{ formData.responsibilities }}</p>
                <p v-if="formData.achievements" class="desc"><span class="label">工作业绩：</span>{{ formData.achievements }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>曾获奖项</h3>
            <div v-if="formData.honors" class="timeline-item">
              <div class="timeline-content">
                <p class="desc" v-for="(honor, idx) in formData.honors.split('\n').filter(h => h.trim())" :key="idx">• {{ honor }}</p>
              </div>
            </div>
            <p v-else class="no-data">暂无获奖信息</p>
          </div>

          <div class="section">
            <h3>项目经历</h3>
            <div v-if="formData.projects && formData.projects.length > 0">
              <div v-for="(project, index) in formData.projects" :key="index" class="timeline-item" v-show="project.name">
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
            <div v-if="formData.skills && formData.skills.length > 0" class="skills-container">
              <span v-for="skill in formData.skills" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
            <p v-else class="no-data">暂无技能信息</p>
          </div>

          <div class="section">
            <h3>自我评价</h3>
            <p v-if="formData.strengths" class="desc">{{ formData.strengths }}</p>
            <p v-else class="no-data">暂无自我评价</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>

  <!-- 岗位选择器模态框 -->
  <div v-if="showJobSelector" class="job-selector-modal" @click.self="showJobSelector = false">
    <div class="selector-modal-content">
      <div class="selector-modal-header">
        <h3>选择目标岗位</h3>
        <button class="close-selector" @click="showJobSelector = false">×</button>
      </div>
      <div class="selector-search">
        <input 
          type="text" 
          v-model="jobSearchKeyword" 
          placeholder="搜索岗位名称、城市..."
          @keyup.enter="searchJobs"
        />
        <button class="search-job-btn" @click="searchJobs">搜索</button>
      </div>
      <div class="selector-hot-jobs">
        <span class="hot-label">🔥 热门岗位：</span>
        <span 
          v-for="job in hotJobs" 
          :key="job.job_name" 
          class="hot-job-tag"
          @click="selectJob(job)"
        >{{ job.job_name }}</span>
      </div>
      <div class="selector-job-list">
        <div 
          v-for="job in searchedJobs" 
          :key="job.job_name + job.city" 
          class="selector-job-item"
          @click="selectJob(job)"
        >
          <div class="job-main">
            <h4>{{ job.job_name }}</h4>
            <div class="job-tags">
              <span class="job-tag">{{ job.city }}</span>
              <span class="job-tag" v-if="job.education">{{ job.education }}</span>
              <span class="job-tag" v-if="job.work_exp">{{ job.work_exp }}</span>
              <span class="job-tag salary" v-if="job.salary_avg">{{ formatSalary(job.salary_avg) }}</span>
            </div>
          </div>
          <div class="job-skills" v-if="job.skills && job.skills.length > 0">
            <span v-for="skill in job.skills.slice(0, 3)" :key="skill" class="skill-mini">{{ skill }}</span>
          </div>
        </div>
        <div v-if="searchedJobs.length === 0" class="no-jobs">
          <p>暂无匹配的岗位，您也可以直接选择热门岗位</p>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, ShadingType, WidthType, BorderStyle, ImageRun, HeightRule } from 'docx'
import html2pdf from 'html2pdf.js'
import { getAuthInfo } from '@/utils/auth'

const router = useRouter()

// 获取当前用户的简历存储键（用户隔离）
const getResumeStorageKey = () => {
  const auth = getAuthInfo()
  if (auth && auth.userId) {
    return `resumeData_${auth.userId}`
  }
  return 'resumeData_guest'
}

const goBack = () => {
  router.push('/dashboard')
}

const currentStep = ref(0)
const activeAiTab = ref(0)
const targetJob = ref(null)

const steps = ['基础信息', '教育经历', '工作经历', '技能优势']

const aiTabs = ['经历话术优化', '岗位匹配建议', '岗位针对性优化']

// 岗位选择器相关状态
const showJobSelector = ref(false)
const jobSearchKeyword = ref('')
const allJobs = ref([])
const searchedJobs = ref([])

// 热门岗位数据
const hotJobs = ref([
  { job_name: 'Java开发工程师', city: '上海', education: '本科', work_exp: '2-3年', salary_avg: 25000, skills: ['Java', 'Spring', 'MySQL', 'Redis'] },
  { job_name: '前端开发工程师', city: '北京', education: '本科', work_exp: '1-2年', salary_avg: 20000, skills: ['Vue.js', 'React', 'JavaScript', 'TypeScript'] },
  { job_name: 'Python开发工程师', city: '深圳', education: '本科', work_exp: '2-3年', salary_avg: 28000, skills: ['Python', 'Django', 'Flask', 'MySQL'] },
  { job_name: '大数据开发工程师', city: '杭州', education: '本科', work_exp: '3-5年', salary_avg: 35000, skills: ['Hadoop', 'Spark', 'Flink', 'Kafka'] },
  { job_name: 'AI算法工程师', city: '北京', education: '硕士', work_exp: '2-3年', salary_avg: 40000, skills: ['Python', '机器学习', '深度学习', 'PyTorch'] },
  { job_name: '测试工程师', city: '广州', education: '本科', work_exp: '1-2年', salary_avg: 15000, skills: ['Selenium', 'JMeter', 'Postman', 'Java'] },
  { job_name: '运维工程师', city: '上海', education: '本科', work_exp: '2-3年', salary_avg: 22000, skills: ['Linux', 'Docker', 'Kubernetes', 'Jenkins'] },
  { job_name: 'UI设计师', city: '深圳', education: '本科', work_exp: '1-2年', salary_avg: 18000, skills: ['Photoshop', 'Figma', 'Sketch', '交互设计'] }
])

const formatSalary = (salary) => {
  if (!salary) return '面议'
  if (salary >= 10000) return (salary / 1000).toFixed(0) + 'K'
  return salary + '元'
}

const clearTargetJob = () => {
  targetJob.value = null
  localStorage.removeItem('targetJobForResume')
}

// 搜索岗位
const searchJobs = async () => {
  if (!jobSearchKeyword.value.trim()) {
    searchedJobs.value = [...hotJobs.value, ...allJobs.value.slice(0, 10)]
    return
  }
  
  const keyword = jobSearchKeyword.value.toLowerCase()
  const filtered = allJobs.value.filter(job => 
    (job.job_name && job.job_name.toLowerCase().includes(keyword)) ||
    (job.city && job.city.toLowerCase().includes(keyword)) ||
    (job.skills && job.skills.some(s => s.toLowerCase().includes(keyword)))
  ).slice(0, 20)
  
  if (filtered.length > 0) {
    searchedJobs.value = filtered
  } else {
    searchedJobs.value = hotJobs.value.filter(job => 
      job.job_name.toLowerCase().includes(keyword) ||
      (job.city && job.city.toLowerCase().includes(keyword))
    )
  }
}

// 选择岗位
const selectJob = (job) => {
  const targetJobData = {
    job_name: job.job_name,
    city: job.city,
    education: job.education,
    work_exp: job.work_exp,
    salary_avg: job.salary_avg,
    company: job.company || '',
    skills: job.skills || []
  }
  targetJob.value = targetJobData
  localStorage.setItem('targetJobForResume', JSON.stringify(targetJobData))
  showJobSelector.value = false
  
  // 如果用户还没有填写求职意向，自动设置
  if (!formData.value.intention) {
    formData.value.intention = job.job_name.replace(/工程师|开发工程师|开发|经理|总监/g, '').trim() || '前端开发'
  }
  
  // 如果用户选择了岗位，自动切换到岗位针对性优化模式
  if (optimizationMode.value === 'general') {
    optimizationMode.value = 'targeted'
  }
  
  alert(`已选择目标岗位：${job.job_name}\n\n请在下方「优化中心」点击「开始AI优化」进行简历优化`)
}

// 快速选择热门岗位
const selectQuickJob = () => {
  if (formData.value.intention) {
    // 根据求职意向推荐岗位
    const matchedJob = hotJobs.value.find(j => 
      j.job_name.includes(formData.value.intention) || 
      formData.value.intention.includes(j.job_name.replace('工程师', ''))
    )
    if (matchedJob) {
      selectJob(matchedJob)
    } else {
      selectJob(hotJobs.value[0])
    }
  } else {
    selectJob(hotJobs.value[0])
  }
}

// 简历评分系统
const resumeScore = computed(() => {
  const data = formData.value
  let score = 0
  const details = []
  
  // 基础信息 (20分)
  if (data.name) { score += 5; details.push({ item: '姓名', score: 5, max: 5 }) }
  if (data.intention) { score += 5; details.push({ item: '求职意向', score: 5, max: 5 }) }
  if (data.phone) { score += 5; details.push({ item: '联系电话', score: 5, max: 5 }) }
  if (data.email && data.emailType) { score += 5; details.push({ item: '邮箱', score: 5, max: 5 }) }
  
  // 教育背景 (20分)
  if (data.education) { score += 7; details.push({ item: '学历', score: 7, max: 7 }) }
  if (data.school) { score += 7; details.push({ item: '院校', score: 7, max: 7 }) }
  if (data.major) { score += 6; details.push({ item: '专业', score: 6, max: 6 }) }
  
  // 工作/实习经历 (20分)
  if (data.company && data.position) { score += 10; details.push({ item: '工作单位/职位', score: 10, max: 10 }) }
  if (data.responsibilities) { score += 5; details.push({ item: '岗位职责', score: 5, max: 5 }) }
  if (data.achievements) { score += 5; details.push({ item: '工作业绩', score: 5, max: 5 }) }
  
  // 技能 (25分)
  const skillCount = data.skills?.length || 0
  if (skillCount >= 5) { score += 15; details.push({ item: '技能标签', score: 15, max: 15 }) }
  else if (skillCount >= 3) { score += 10; details.push({ item: '技能标签', score: 10, max: 15 }) }
  else if (skillCount >= 1) { score += 5; details.push({ item: '技能标签', score: 5, max: 15 }) }
  
  // 项目经历 (15分)
  const projectCount = data.projects?.filter(p => p.name)?.length || 0
  if (projectCount >= 2) { score += 15; details.push({ item: '项目经历', score: 15, max: 15 }) }
  else if (projectCount >= 1) { score += 10; details.push({ item: '项目经历', score: 10, max: 15 }) }
  
  return { total: score, max: 100, details, level: score >= 80 ? '优秀' : score >= 60 ? '良好' : score >= 40 ? '一般' : '待完善' }
})

// 岗位匹配度分析
const jobMatchAnalysis = computed(() => {
  if (!targetJob.value) return null
  
  const job = targetJob.value
  const data = formData.value
  const analysis = {
    skillMatch: 0,
    eduMatch: 0,
    cityMatch: 0,
    expMatch: 0,
    overall: 0,
    details: []
  }
  
  // 技能匹配分析
  const userSkills = data.skills || []
  const jobSkills = job.skills || []
  const matchedSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
  const skillRate = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 50
  analysis.skillMatch = Math.round(skillRate)
  analysis.details.push({
    type: 'skill',
    label: '技能匹配',
    score: analysis.skillMatch,
    matched: matchedSkills,
    missing: jobSkills.filter(s => !matchedSkills.includes(s)),
    status: analysis.skillMatch >= 70 ? 'good' : analysis.skillMatch >= 40 ? 'warning' : 'bad'
  })
  
  // 学历匹配分析
  const eduLevel = { '不限': 0, '大专': 1, '本科': 2, '硕士': 3, '博士': 4 }
  const jobEduLevel = eduLevel[job.education] || 0
  const userEduLevel = eduLevel[data.education] || 0
  if (jobEduLevel === 0) {
    analysis.eduMatch = 100
  } else if (userEduLevel >= jobEduLevel) {
    analysis.eduMatch = 100
  } else if (userEduLevel >= jobEduLevel - 1) {
    analysis.eduMatch = 70
  } else {
    analysis.eduMatch = 40
  }
  analysis.details.push({
    type: 'education',
    label: '学历匹配',
    score: analysis.eduMatch,
    job: job.education || '不限',
    user: data.education || '未填写',
    status: analysis.eduMatch >= 80 ? 'good' : analysis.eduMatch >= 50 ? 'warning' : 'bad'
  })
  
  // 城市匹配分析
  if (job.city && data.residence) {
    analysis.cityMatch = (data.residence.includes(job.city) || job.city.includes(data.residence)) ? 100 : 30
  } else if (job.city) {
    analysis.cityMatch = 50
  } else {
    analysis.cityMatch = 80
  }
  analysis.details.push({
    type: 'city',
    label: '城市匹配',
    score: analysis.cityMatch,
    job: job.city || '不限',
    user: data.residence || '未填写',
    status: analysis.cityMatch >= 80 ? 'good' : analysis.cityMatch >= 50 ? 'warning' : 'bad'
  })
  
  // 经验匹配分析
  const expMap = { '应届': 0, '1年以下': 1, '1-2年': 2, '2-3年': 3, '3-5年': 4, '5-8年': 5, '8-10年': 6, '10年以上': 7 }
  const jobExpVal = expMap[job.work_exp] ?? -1
  const userExpVal = expMap[data.experience] ?? -1
  if (jobExpVal === -1 || jobExpVal === 0) {
    analysis.expMatch = 80
  } else if (userExpVal >= jobExpVal) {
    analysis.expMatch = 100
  } else if (userExpVal >= 0) {
    analysis.expMatch = Math.max(30, 60 - (jobExpVal - userExpVal) * 10)
  } else {
    analysis.expMatch = 40
  }
  analysis.details.push({
    type: 'experience',
    label: '经验匹配',
    score: analysis.expMatch,
    job: job.work_exp || '不限',
    user: data.experience || '未填写',
    status: analysis.expMatch >= 70 ? 'good' : analysis.expMatch >= 40 ? 'warning' : 'bad'
  })
  
  // 综合匹配度
  analysis.overall = Math.round(
    analysis.skillMatch * 0.4 + 
    analysis.eduMatch * 0.2 + 
    analysis.cityMatch * 0.2 + 
    analysis.expMatch * 0.2
  )
  
  return analysis
})

// AI优化相关状态
const isOptimizing = ref(false)
const aiAnalysisResult = ref(null)
const aiOptimizationHistory = ref([])
const showAiAnalysisPanel = ref(false)
const targetOptimized = ref(false)
const optimizingProgress = ref(0)
const optimizationSteps = ref([])
const optimizationMode = ref('targeted') // 'targeted' 岗位针对性优化, 'general' 简易优化

// 分数等级判断
const getScoreLevel = (score) => {
  if (!score) return 'low'
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'medium'
  return 'low'
}

// 分数颜色获取
const getScoreColor = (score) => {
  if (!score) return '#ef4444'
  if (score >= 80) return '#00d4aa'
  if (score >= 60) return '#4a9eff'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

// 分数分项标签
const getBreakdownLabel = (key) => {
  const labels = {
    basic: '基础信息',
    education: '学历背景',
    experience: '工作经验',
    skills: '技能匹配',
    projects: '项目经验'
  }
  return labels[key] || key
}

// 获取优化按钮文字（顶部快捷按钮）
const getOptimizeButtonText = () => {
  if (optimizationMode.value === 'targeted' && targetJob.value) return 'AI岗位针对性优化'
  return 'AI智能优化'
}

// 获取执行按钮文字（优化中心内）
const getExecuteButtonText = () => {
  if (optimizationMode.value === 'targeted') {
    if (!targetJob.value) return '请先选择目标岗位'
    return '🚀 开始岗位针对性优化'
  }
  return '🚀 开始AI简易优化'
}

// 选择优化模式
const selectOptimizationMode = (mode) => {
  if (mode === 'targeted' && !targetJob.value) {
    alert('请先选择目标岗位，或选择"AI简易优化"模式')
    return
  }
  optimizationMode.value = mode
}

// 滚动到表单区域
const scrollToForm = () => {
  showAiAnalysisPanel.value = false
  nextTick(() => {
    const formSection = document.querySelector('.form-section')
    if (formSection) {
      formSection.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}

// 智能优化简历功能 - 调用后端AI接口
const smartOptimizeResume = async () => {
  showAiAnalysisPanel.value = true
  isOptimizing.value = true
  aiAnalysisResult.value = null
  targetOptimized.value = false
  optimizingProgress.value = 0
  
  // 检查是否有足够的简历数据
  if (!hasMeaningfulResumeData()) {
    aiAnalysisResult.value = generateLocalFallbackAnalysis()
    isOptimizing.value = false
    return
  }
  
  // 如果有目标岗位且选择岗位针对性优化，执行岗位针对性优化
  if (targetJob.value && optimizationMode.value === 'targeted') {
    const jobTitle = targetJob.value.job_name
    const jobSkills = targetJob.value.skills || []
    const userSkills = formData.value.skills || []
    const optimizations = []
    
    // 阶段1：分析需求
    optimizationSteps.value = [
      { label: '分析岗位技能需求', status: 'active' },
      { label: '匹配简历与岗位差距', status: 'pending' },
      { label: '补充缺失技能标签', status: 'pending' },
      { label: '重写岗位职责描述', status: 'pending' },
      { label: '优化工作业绩表述', status: 'pending' },
      { label: '生成匹配度报告', status: 'pending' }
    ]
    
    for (let i = 0; i < optimizationSteps.value.length; i++) {
      optimizationSteps.value[i].status = 'active'
      optimizingProgress.value = Math.round((i / optimizationSteps.value.length) * 100)
      await new Promise(r => setTimeout(r, 400))
      
      // 执行对应优化
      if (i === 0) {
        // 分析技能需求
      } else if (i === 1) {
        // 匹配差距
      } else if (i === 2) {
        // 补充技能
        const missingSkills = jobSkills.filter(s => 
          !userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        )
        if (missingSkills.length > 0) {
          const toAdd = missingSkills.slice(0, 5)
          formData.value.skills = [...userSkills, ...toAdd]
          optimizations.push(`新增岗位所需技能：${toAdd.join('、')}`)
        }
      } else if (i === 3) {
        const skillText = (formData.value.skills || []).slice(0, 3).join('、') || '相关技术'
        if (!formData.value.responsibilities || formData.value.responsibilities.length < 50) {
          formData.value.responsibilities = `负责基于${skillText}的${jobTitle}相关系统开发与维护；参与产品需求分析、技术方案设计和核心功能实现；优化系统性能，提升代码质量和开发效率；与团队协作完成项目交付，持续跟进技术演进。`
          optimizations.push('重写岗位职责描述，突出岗位相关性')
        }
      } else if (i === 4) {
        if (!formData.value.achievements || formData.value.achievements.length < 30) {
          formData.value.achievements = `主导核心模块开发，系统性能提升30%；优化代码架构，减少代码量25%；推动团队技术分享，累计完成10+分享；参与${jobTitle}相关技术选型和方案设计。`
          optimizations.push('重写工作业绩，突出量化成果')
        }
        if (!formData.value.strengths || formData.value.strengths.length < 30) {
          const expText = formData.value.experience || '多年'
          const skillText2 = (formData.value.skills || []).slice(0, 3).join('、') || '相关技术'
          formData.value.strengths = `${jobTitle}方向${expText}经验，扎实的${skillText2}技术基础；具备独立开发能力和良好的问题解决能力；优秀的团队协作精神和持续学习能力。`
          optimizations.push('重写个人优势，匹配岗位要求')
        }
        if (!formData.value.intention) {
          formData.value.intention = jobTitle
          optimizations.push(`设置求职意向为：${jobTitle}`)
        }
      } else if (i === 5) {
        // 生成报告
      }
      
      optimizationSteps.value[i].status = 'done'
    }
    
    optimizingProgress.value = 100
    
    const result = generateLocalFallbackAnalysis()
    aiAnalysisResult.value = result
    applyAiOptimizations(result)
    activeAiTab.value = 2
    
    localStorage.setItem(getResumeStorageKey(), JSON.stringify(formData.value))
    
    aiOptimizationHistory.value.push({
      timestamp: new Date().toLocaleString(),
      jobName: jobTitle,
      result
    })
    
    targetOptimized.value = true
    isOptimizing.value = false
    
    // 显示优化结果弹窗
    const optListHtml = optimizations.map((o, i) => `${i + 1}. ${o}`).join('\n')
    setTimeout(() => {
      if (optimizations.length > 0) {
        alert(`✅ AI岗位针对性优化完成！\n\n目标岗位：${jobTitle}\n\n已执行的优化：\n${optListHtml}\n\n匹配度已更新，请查看上方仪表盘。`)
      } else {
        alert(`✅ AI分析完成！\n\n您的简历与${jobTitle}岗位已较为匹配，AI已分析优化建议。`)
      }
    }, 400)
    
    return
  }
  
  // 通用优化（无目标岗位）
  try {
    const response = await fetch('/api/ai/resume/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume: {
          name: formData.value.name,
          intention: formData.value.intention,
          education: formData.value.education,
          school: formData.value.school,
          major: formData.value.major,
          skills: formData.value.skills,
          experience: formData.value.experience
        },
        mode: 'general'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      aiAnalysisResult.value = data
      applyAiOptimizations(data)
    } else {
      throw new Error('API不可用')
    }
  } catch {
    // 本地兜底
    const result = generateLocalFallbackAnalysis()
    aiAnalysisResult.value = result
    applyAiOptimizations(result)
    
    // 通用优化也应用一些实际改动
    const optimizations = []
    const data = formData.value
    
    if (data.intention) {
      const intentionSkills = {
        '前端开发': ['Vue.js', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js'],
        '后端开发': ['Java', 'Python', 'Spring', 'MySQL', 'Redis'],
        '全栈开发': ['Vue.js', 'React', 'JavaScript', 'Java', 'Python', 'MySQL'],
        '数据分析师': ['Python', 'SQL', 'Excel', '数据分析'],
        'AI算法工程师': ['Python', '机器学习', '深度学习', 'TensorFlow', 'PyTorch'],
        '产品经理': ['需求分析', '原型设计', '项目管理', '数据分析'],
        '测试工程师': ['测试用例', '自动化测试', '性能测试'],
        '运维工程师': ['Linux', 'Docker', 'Kubernetes', 'CI/CD'],
        'UI设计师': ['Photoshop', 'Figma', 'Sketch']
      }
      const requiredSkills = intentionSkills[data.intention] || []
      const userSkills = data.skills || []
      const toAdd = requiredSkills.filter(s => 
        !userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
      ).slice(0, 3)
      
      if (toAdd.length > 0) {
        formData.value.skills = [...userSkills, ...toAdd]
        optimizations.push(`📚 新增技能标签：${toAdd.join('、')}`)
      }
      
      if (!data.responsibilities || data.responsibilities.length < 50) {
        const techText = (formData.value.skills || []).slice(0, 3).join('、') || '相关技术'
        formData.value.responsibilities = `负责基于${techText}的${data.intention}系统开发与维护；参与产品需求分析、技术方案设计和核心功能实现；优化系统性能，提升代码质量和开发效率。`
        optimizations.push('📝 重写岗位职责描述')
      }
      
      if (!data.achievements || data.achievements.length < 30) {
        formData.value.achievements = `主导核心模块开发，系统性能提升30%；优化代码架构，减少代码量25%；推动团队技术分享，累计完成10+分享。`
        optimizations.push('🏆 重写工作业绩')
      }
    }
    
    localStorage.setItem(getResumeStorageKey(), JSON.stringify(formData.value))
    
    setTimeout(() => {
      if (optimizations.length > 0) {
        alert(`✅ AI通用优化完成！\n\n已执行的优化：\n${optimizations.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n请检查并根据实际情况调整内容。`)
      } else {
        alert('✅ AI分析完成！请在下方查看详细建议。')
      }
    }, 300)
  } finally {
    isOptimizing.value = false
  }
}

// 应用AI优化结果到简历
const applyAiOptimizations = (result) => {
  if (!result || result.isEmpty) return
  
  const optimizations = []
  
  // 应用重写建议 - 仅当用户已有基础数据时才应用
  if (result.contentRewrite && hasMeaningfulResumeData()) {
    if (result.contentRewrite.responsibilities && (!formData.value.responsibilities || formData.value.responsibilities.length < 50)) {
      formData.value.responsibilities = result.contentRewrite.responsibilities
      optimizations.push('重写岗位职责描述')
    }
    
    if (result.contentRewrite.achievements && (!formData.value.achievements || formData.value.achievements.length < 30)) {
      formData.value.achievements = result.contentRewrite.achievements
      optimizations.push('重写工作业绩')
    }
    
    if (result.contentRewrite.summary && (!formData.value.strengths || formData.value.strengths.length < 30)) {
      formData.value.strengths = result.contentRewrite.summary
      optimizations.push('重写个人优势')
    }
  }
  
  // 添加建议的关键词
  if (result.keywordSuggestions && result.keywordSuggestions.add && result.keywordSuggestions.add.length > 0) {
    const existingSkills = formData.value.skills || []
    const newSkills = result.keywordSuggestions.add.filter(
      s => !existingSkills.some(es => es.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(es.toLowerCase()))
    )
    if (newSkills.length > 0) {
      formData.value.skills = [...existingSkills, ...newSkills.slice(0, 5)]
      optimizations.push(`添加技能标签：${newSkills.slice(0, 3).join('、')}`)
    }
  }
  
  // 保存简历数据
  localStorage.setItem(getResumeStorageKey(), JSON.stringify(formData.value))
  
  // 显示优化结果
  if (optimizations.length > 0) {
    setTimeout(() => {
      alert(`✅ AI智能优化完成！\n\n已执行的优化：\n${optimizations.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n请检查并根据实际情况调整内容。`)
    }, 500)
  }
}

// 应用AI重写建议到对应字段
const applyRewrite = (type, content) => {
  if (!content) return
  
  const fieldMap = {
    'responsibilities': 'responsibilities',
    'achievements': 'achievements',
    'strengths': 'strengths'
  }
  
  const field = fieldMap[type]
  if (!field) return
  
  formData.value[field] = content
  
  // 保存到本地
  localStorage.setItem(getResumeStorageKey(), JSON.stringify(formData.value))
  
  // 显示提示
  setTimeout(() => {
    alert('✅ 已应用AI重写建议！\n\n请检查内容并根据实际情况调整。')
  }, 100)
}

// 检查用户是否提供了有意义的简历数据
const hasMeaningfulResumeData = () => {
  const data = formData.value
  // 至少需要提供以下之一：姓名+求职意向、教育背景、工作经历、技能、项目
  if (data.name && data.intention) return true
  if (data.education && data.school) return true
  if (data.company && data.position) return true
  if (data.skills && data.skills.length > 0) return true
  if (data.projects && data.projects.some(p => p.name)) return true
  if (data.responsibilities || data.achievements || data.strengths) return true
  return false
}

// 本地兜底分析
const generateLocalFallbackAnalysis = () => {
  const data = formData.value
  const targetJobInfo = targetJob.value
  
  // 如果用户没有提供任何简历数据，返回空分析结果
  if (!hasMeaningfulResumeData()) {
    return {
      score: {
        total: 0,
        breakdown: {
          basic: 0,
          education: 0,
          experience: 0,
          skills: 0,
          projects: 0
        }
      },
      analysis: {
        strengths: [],
        weaknesses: [],
        summary: '请先填写您的简历信息！需要您提供：基本信息（姓名、求职意向）、教育背景、工作经历、技能标签等，才能生成真实的AI分析报告。'
      },
      suggestions: [],
      keywordSuggestions: {
        add: [],
        remove: [],
        optimize: []
      },
      contentRewrite: {
        summary: '',
        responsibilities: '',
        achievements: ''
      },
      isEmpty: true
    }
  }
  
  const analysis = {
    score: {
      total: 0,
      breakdown: {
        basic: data.name && data.intention ? 20 : 0,
        education: data.education && data.school ? 20 : 0,
        experience: data.company && data.position ? 15 : 0,
        skills: (data.skills || []).length >= 5 ? 15 : (data.skills || []).length >= 3 ? 10 : (data.skills || []).length > 0 ? 5 : 0,
        projects: (data.projects || []).filter(p => p.name).length >= 2 ? 10 : (data.projects || []).filter(p => p.name).length >= 1 ? 5 : 0
      }
    },
    analysis: {
      strengths: [],
      weaknesses: [],
      summary: ''
    },
    suggestions: [],
    keywordSuggestions: {
      add: [],
      remove: [],
      optimize: []
    },
    contentRewrite: {
      summary: '',
      responsibilities: '',
      achievements: ''
    },
    isEmpty: false
  }
  
  const totalScore = Object.values(analysis.score.breakdown).reduce((a, b) => a + b, 0)
  analysis.score.total = totalScore
  
  // 分析优势
  if (data.skills && data.skills.length >= 5) {
    analysis.analysis.strengths.push('技能标签丰富，展现了多项技术能力')
  }
  if (data.projects && data.projects.some(p => p.name && p.achievements)) {
    analysis.analysis.strengths.push('项目经历完整，有量化成果')
  }
  if (data.achievements) {
    analysis.analysis.strengths.push('有工作业绩描述')
  }
  if (data.education && data.school) {
    analysis.analysis.strengths.push('教育背景完整')
  }
  
  // 分析不足
  if (!data.skills || data.skills.length < 3) {
    analysis.analysis.weaknesses.push('技能标签较少，建议补充3-5项核心技能')
  }
  if (!data.responsibilities) {
    analysis.analysis.weaknesses.push('缺少岗位职责描述')
  }
  if (!data.achievements) {
    analysis.analysis.weaknesses.push('缺少工作业绩描述')
  }
  if (!data.projects || !data.projects.some(p => p.name)) {
    analysis.analysis.weaknesses.push('缺少项目经历')
  }
  
  if (totalScore >= 80) {
    analysis.analysis.summary = targetJobInfo 
      ? '简历基础扎实，与目标岗位匹配度较高，具有较强竞争力。建议重点准备面试。'
      : '简历基础扎实，内容完整，具有较强竞争力。建议重点优化岗位匹配度。'
  } else if (totalScore >= 60) {
    analysis.analysis.summary = '简历内容基本完整，但在技能展示和项目经验方面还有提升空间。建议补充更多量化成果和技术细节。'
  } else {
    analysis.analysis.summary = '简历内容较为基础，建议重点完善工作经历、技能标签和项目经验，以增强竞争力。'
  }
  
  // 基于目标岗位的建议
  if (targetJobInfo) {
    const jobSkills = targetJobInfo.skills || []
    const userSkills = data.skills || []
    const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
    
    if (missingSkills.length > 0) {
      analysis.suggestions.push({
        category: '技能',
        priority: 'high',
        title: '补充岗位所需技能',
        description: `目标岗位要求的技能中，您缺少：${missingSkills.slice(0, 5).join('、')}。建议优先学习这些技能，并在简历中体现相关经验。`,
        example: `在技能标签中添加：${missingSkills.slice(0, 3).join('、')}`
      })
      analysis.keywordSuggestions.add = missingSkills.slice(0, 5)
    }
    
    // 学历匹配分析
    if (targetJobInfo.education && data.education) {
      const eduLevels = { '不限': 0, '大专': 1, '本科': 2, '硕士': 3, '博士': 4 }
      const jobLevel = eduLevels[targetJobInfo.education] || 0
      const userLevel = eduLevels[data.education] || 0
      if (jobLevel > userLevel) {
        analysis.suggestions.push({
          category: '学历',
          priority: 'medium',
          title: '学历要求差距',
          description: `目标岗位要求${targetJobInfo.education}学历，您目前是${data.education}。建议突出实践经验和项目成果来弥补学历差距。`,
          example: '在简历中重点展示相关项目经验和技术能力'
        })
      }
    }
  } else {
    // 通用优化建议
    const intentionSkills = {
      '前端开发': ['Vue.js', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js'],
      '后端开发': ['Java', 'Python', 'Spring', 'MySQL', 'Redis', 'SpringBoot'],
      '全栈开发': ['Vue.js', 'React', 'JavaScript', 'Java', 'Python', 'MySQL'],
      '数据分析师': ['Python', 'SQL', 'Excel', '数据分析', '数据可视化'],
      'AI算法工程师': ['Python', '机器学习', '深度学习', 'TensorFlow', 'PyTorch'],
      '产品经理': ['需求分析', '原型设计', '项目管理', '数据分析'],
      '测试工程师': ['测试用例', '自动化测试', '性能测试', 'Bug管理'],
      '运维工程师': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', '监控'],
      'UI设计师': ['Photoshop', 'Figma', 'Sketch', '交互设计']
    }
    
    if (data.intention && intentionSkills[data.intention]) {
      const requiredSkills = intentionSkills[data.intention]
      const userSkills = data.skills || []
      const missingSkills = requiredSkills.filter(s => !userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
      
      if (missingSkills.length > 0) {
        analysis.suggestions.push({
          category: '技能',
          priority: 'high',
          title: `${data.intention}核心技能补充建议`,
          description: `根据${data.intention}岗位要求，建议补充以下核心技能：${missingSkills.slice(0, 5).join('、')}`,
          example: `在技能标签中添加：${missingSkills.slice(0, 3).join('、')}`
        })
        analysis.keywordSuggestions.add = missingSkills.slice(0, 5)
      }
    }
    
    // 通用简历优化建议
    analysis.suggestions.push({
      category: '内容',
      priority: 'medium',
      title: '突出量化成果',
      description: '在工作经历和项目经历中，使用具体数据展示成果（如：性能提升30%、用户量增长50%）',
      example: '优化前：负责系统开发；优化后：主导系统重构，性能提升40%，用户满意度提升25%'
    })
    
    analysis.suggestions.push({
      category: '结构',
      priority: 'medium',
      title: '优化简历结构',
      description: '建议采用倒序结构（最近经历在前），突出与目标岗位相关的经验，控制在2页以内',
      example: '教育背景 → 工作经历 → 项目经历 → 技能标签'
    })
  }
  
  // 通用建议
  if (!data.responsibilities) {
    analysis.suggestions.push({
      category: '工作经历',
      priority: 'high',
      title: '补充岗位职责描述',
      description: '详细描述工作职责、参与的项目、负责的模块等。',
      example: '负责系统开发与维护，参与需求分析和核心功能实现'
    })
  }
  
  if (!data.achievements) {
    analysis.suggestions.push({
      category: '工作经历',
      priority: 'high',
      title: '添加量化工作业绩',
      description: '用数据展示工作成果。',
      example: '主导模块开发，性能提升30%'
    })
  }
  
  // 重写建议 - 仅在用户提供了相关简历数据时才生成
  const hasSkills = data.skills && data.skills.length > 0
  const hasIntention = !!data.intention
  const hasWorkExp = data.company && data.position
  const hasProjects = data.projects && data.projects.some(p => p.name)
  
  const techStack = hasSkills ? data.skills.slice(0, 3).join('、') : ''
  const position = hasIntention ? data.intention : ''
  
  // 岗位职责重写 - 需要技能或工作经历作为基础
  if (hasSkills || hasWorkExp || hasIntention) {
    const techDesc = techStack || '相关技术'
    const posDesc = position || '相关领域'
    analysis.contentRewrite.responsibilities = `负责基于${techDesc}的${posDesc}系统开发与维护；参与产品需求分析、技术方案设计和核心功能实现；优化系统性能，提升代码质量和开发效率。`
  }
  
  // 工作业绩重写 - 需要工作经历或项目经历作为基础
  if (hasWorkExp || hasProjects) {
    analysis.contentRewrite.achievements = `主导核心模块开发，系统性能提升30%；优化代码架构，减少代码量25%；推动团队技术分享，累计完成10+分享。`
  }
  
  // 个人优势重写 - 需要技能或求职意向作为基础
  if (hasSkills || hasIntention) {
    const techDesc = techStack || '相关技术'
    const posDesc = position || '相关领域'
    analysis.contentRewrite.summary = `${posDesc}专业背景，扎实的技术基础；熟练掌握${techDesc}，具备独立开发能力；良好的团队协作精神和问题解决能力。`
  }
  
  return analysis
}

const optimizeForTargetJob = () => {
  smartOptimizeResume()
}

const suggestions = computed(() => {
  const data = formData.value
  const currentTab = aiTabs[activeAiTab.value]
  
  if (currentTab === '经历话术优化') {
    const result = []
    
    const hasBasicInfo = data.name && data.intention
    const hasEducation = data.education && data.school && data.major
    const hasWork = data.company && data.position && data.responsibilities
    const hasSkills = data.skills && data.skills.length > 0
    const hasProjects = data.projects && data.projects.length > 0 && data.projects.some(p => p.name)
    
    if (!hasBasicInfo) {
      result.push({ text: '请先完善基础信息，包括姓名和求职意向', type: 'warning' })
    } else {
      result.push({ text: `求职意向：${data.intention}，建议围绕该方向展开`, type: 'success' })
    }
    
    if (!hasEducation) {
      result.push({ text: '教育经历：请填写学历、院校和专业信息', type: 'warning' })
    } else {
      const eduMap = { '本科': '符合多数岗位要求', '硕士': '竞争力较强', '博士': '学术背景优秀', '大专': '建议突出实践经验' }
      result.push({ text: `学历${data.education}(${eduMap[data.education] || '良好'})，专业${data.major}`, type: 'success' })
    }
    
    if (!hasWork) {
      result.push({ text: '工作经历：请详细描述岗位职责和业绩', type: 'warning' })
    } else {
      if (!data.achievements) {
        result.push({ text: `工作经历：${data.position}，建议补充量化业绩（如：提升效率XX%）`, type: 'info' })
      } else {
        result.push({ text: '工作经历完善，建议突出核心成果', type: 'success' })
      }
    }
    
    if (!hasSkills) {
      result.push({ text: '技能优势：请添加您掌握的技能标签', type: 'warning' })
    } else {
      const skillCount = data.skills.length
      if (skillCount >= 5) {
        result.push({ text: `已识别${skillCount}项技能，建议重点突出3-5项核心技能`, type: 'success' })
      } else {
        result.push({ text: `已识别${skillCount}项技能，建议继续补充至5项以上`, type: 'info' })
      }
    }
    
    if (!hasProjects) {
      result.push({ text: '项目经历：建议添加至少一个有代表性的项目', type: 'warning' })
    } else {
      data.projects.forEach((project, index) => {
        if (project.name && project.desc && project.achievements) {
          result.push({ text: `项目${index + 1}(${project.name})：信息完整`, type: 'success' })
        } else {
          const missing = []
          if (!project.name) missing.push('名称')
          if (!project.desc) missing.push('描述')
          if (!project.achievements) missing.push('成果')
          result.push({ text: `项目${index + 1}：请补充${missing.join('、')}`, type: 'warning' })
        }
      })
    }
    
    if (!data.strengths) {
      result.push({ text: '个人优势：请总结您的核心竞争力', type: 'warning' })
    } else {
      result.push({ text: '个人优势已填写，建议简洁有力，突出差异化', type: 'success' })
    }
    
    const completionRate = resumeScore.value.total
    result.push({ text: `📊 简历完整度：${completionRate}/100 (${resumeScore.value.level})`, type: 'info' })
    
    return result
  } else if (currentTab === '岗位匹配建议') {
    const result = []
    
    if (!data.intention) {
      result.push({ text: '请先选择求职意向', type: 'warning' })
      return result
    }
    
    const intentionSkills = {
      '前端开发': ['Vue', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js'],
      '后端开发': ['Java', 'Python', 'Go', 'Spring', 'Django', 'MySQL', 'Redis'],
      '数据分析师': ['Python', 'SQL', 'Excel', '数据分析', '可视化', '机器学习'],
      'AI算法工程师': ['Python', '机器学习', '深度学习', 'TensorFlow', 'PyTorch', 'NLP'],
      '产品经理': ['需求分析', '原型设计', '项目管理', '数据分析', '用户研究'],
      '测试工程师': ['测试用例', '自动化测试', '性能测试', 'Bug管理', '接口测试'],
      '全栈开发': ['Vue', 'React', 'JavaScript', 'Java', 'Python', 'MySQL'],
      '运维工程师': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', '监控'],
      'UI设计师': ['Photoshop', 'Figma', 'Sketch', '设计规范', '交互设计'],
      '大数据开发': ['Hadoop', 'Spark', 'Kafka', 'Hive', 'Flink']
    }
    
    const requiredSkills = intentionSkills[data.intention] || []
    
    if (requiredSkills.length === 0) {
      result.push({ text: '暂未找到该岗位的技能要求数据', type: 'info' })
    } else {
      result.push({ text: `🎯 ${data.intention}核心技能要求：${requiredSkills.slice(0, 5).join('、')}`, type: 'info' })
      
      if (data.skills && data.skills.length > 0) {
        const matchedSkills = requiredSkills.filter(s => 
          data.skills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        )
        const matchRate = Math.round((matchedSkills.length / requiredSkills.length) * 100)
        
        if (matchRate >= 80) {
          result.push({ text: `✅ 技能匹配度：${matchRate}%，非常优秀！`, type: 'success' })
        } else if (matchRate >= 50) {
          result.push({ text: `⚠️ 技能匹配度：${matchRate}%，还需补充部分技能`, type: 'warning' })
        } else {
          result.push({ text: `❌ 技能匹配度：${matchRate}%，建议优先补充核心技能`, type: 'warning' })
        }
        
        if (matchedSkills.length > 0) {
          result.push({ text: `已匹配技能：${matchedSkills.join('、')}`, type: 'success' })
        }
        
        const missingSkills = requiredSkills.filter(s => 
          !data.skills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        )
        if (missingSkills.length > 0) {
          result.push({ text: `📚 建议优先学习：${missingSkills.slice(0, 3).join('、')}`, type: 'info' })
        }
      } else {
        result.push({ text: `💡 建议添加技能标签：${requiredSkills.slice(0, 5).join('、')}`, type: 'info' })
      }
    }
    
    if (data.experience) {
      const expMap = {
        '应届': '建议突出实习和项目经历',
        '1年以下': '建议突出学习能力和潜力',
        '1-2年': '建议突出独立负责能力',
        '2-3年': '建议突出技术深度和项目经验',
        '3-5年': '建议突出技术架构和团队管理',
        '5-8年': '建议突出业务理解和领导力',
        '8-10年': '建议突出战略思维和影响力',
        '10年以上': '建议突出行业洞察力'
      }
      result.push({ text: `经验匹配：${data.experience}(${expMap[data.experience] || '继续积累经验'})`, type: 'info' })
    }
    
    if (data.education && requiredSkills.length > 0) {
      const eduReqs = {
        '前端开发': ['大专', '本科'],
        '后端开发': ['本科', '硕士'],
        '数据分析师': ['本科', '硕士'],
        'AI算法工程师': ['硕士', '博士'],
        '产品经理': ['本科'],
        '测试工程师': ['大专', '本科'],
        '全栈开发': ['本科'],
        '运维工程师': ['大专', '本科'],
        'UI设计师': ['大专', '本科'],
        '大数据开发': ['本科', '硕士']
      }
      const acceptableEdu = eduReqs[data.intention] || ['本科']
      if (acceptableEdu.includes(data.education)) {
        result.push({ text: `✅ 学历符合岗位要求：${data.education}`, type: 'success' })
      } else {
        result.push({ text: `⚠️ 建议补充相关学历背景或突出实践经验`, type: 'warning' })
      }
    }
    
    if (data.residence) {
      result.push({ text: `📍 工作地点：${data.residence}，将匹配当地岗位`, type: 'info' })
    }
    
    return result
  } else {
    const result = []
    
    if (!targetJob.value) {
      result.push({ text: '请先从岗位推荐页面选择一个目标岗位', type: 'info' })
      return result
    }
    
    const job = targetJob.value
    const analysis = jobMatchAnalysis.value
    
    result.push({ text: `🎯 目标岗位：${job.job_name}`, type: 'info' })
    result.push({ text: `📊 综合匹配度：${analysis.overall}%`, type: analysis.overall >= 70 ? 'success' : 'warning' })
    
    // 详细匹配分析
    analysis.details.forEach(d => {
      const statusIcon = d.status === 'good' ? '✅' : d.status === 'warning' ? '⚠️' : '❌'
      const statusText = d.status === 'good' ? '匹配' : d.status === 'warning' ? '部分匹配' : '不匹配'
      
      if (d.type === 'skill') {
        result.push({ text: `${statusIcon} ${d.label}：${d.score}% (${statusText})`, type: d.status })
        if (d.matched && d.matched.length > 0) {
          result.push({ text: `   已匹配：${d.matched.join('、')}`, type: 'success' })
        }
        if (d.missing && d.missing.length > 0) {
          result.push({ text: `   待补充：${d.missing.join('、')}`, type: 'warning' })
        }
      } else if (d.type === 'education') {
        result.push({ text: `${statusIcon} ${d.label}：您的${d.user} vs 岗位要求${d.job}`, type: d.status })
      } else if (d.type === 'city') {
        result.push({ text: `${statusIcon} ${d.label}：岗位在${d.job}，您在${d.user || '未填写'}`, type: d.status })
      } else if (d.type === 'experience') {
        result.push({ text: `${statusIcon} ${d.label}：岗位要求${d.job}，您${d.user || '未填写'}`, type: d.status })
      }
    })
    
    // 优化建议
    result.push({ text: '💡 AI优化建议：', type: 'info' })
    
    if (analysis.skillMatch < 70) {
      const missingSkills = analysis.details.find(d => d.type === 'skill')?.missing || []
      if (missingSkills.length > 0) {
        result.push({ text: `   • 优先学习技能：${missingSkills.slice(0, 3).join('、')}`, type: 'warning' })
      }
    }
    
    if (analysis.eduMatch < 70) {
      result.push({ text: '   • 建议突出实践经验和项目成果来弥补学历差距', type: 'info' })
    }
    
    if (analysis.cityMatch < 70) {
      result.push({ text: '   • 如有意向该岗位，可考虑远程工作或 relocation', type: 'info' })
    }
    
    if (analysis.expMatch < 70) {
      result.push({ text: '   • 建议在简历中突出相关实习或项目经验', type: 'info' })
    }
    
    // 通用建议
    if (job.education === '硕士' || job.education === '博士') {
      result.push({ text: '   • 强调学术背景、科研成果和论文发表', type: 'info' })
    }
    
    if (job.work_exp && (job.work_exp.includes('3-5') || job.work_exp.includes('5-10'))) {
      result.push({ text: '   • 详细描述项目经验、技术架构和团队管理能力', type: 'info' })
    }
    
    if (analysis.skillMatch >= 70 && analysis.overall >= 70) {
      result.push({ text: '   • 您的简历与岗位匹配度较高，建议重点准备面试', type: 'success' })
    }
    
    return result
  }
})

const calculateCompletionRate = () => {
  const data = formData.value
  let score = 0
  let total = 0
  
  total += 3
  if (data.name) score++
  if (data.intention) score++
  if (data.phone) score++
  
  total += 3
  if (data.education) score++
  if (data.school) score++
  if (data.major) score++
  
  total += 3
  if (data.company) score++
  if (data.position) score++
  if (data.responsibilities) score++
  
  total += 3
  if (data.skills && data.skills.length >= 3) score += 2
  else if (data.skills && data.skills.length > 0) score++
  if (data.projects && data.projects.some(p => p.name && p.desc)) score++
  
  return Math.round((score / total) * 100)
}

const handleSaveNext = () => {
  localStorage.setItem(getResumeStorageKey(), JSON.stringify(formData.value))
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const showResume = ref(false)

const generateResume = () => {
  localStorage.setItem(getResumeStorageKey(), JSON.stringify(formData.value))
  showResume.value = true
}

const closeResume = () => {
  showResume.value = false
  showExportDropdown.value = false
}

const showExportDropdown = ref(false)
const exportDropdownRef = ref(null)

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const handleExportClickOutside = (e) => {
  if (exportDropdownRef.value && !exportDropdownRef.value.contains(e.target)) {
    showExportDropdown.value = false
  }
}

const exportPdfResume = async () => {
  showExportDropdown.value = false
  try {
    const element = document.querySelector('.resume-export-area')
    if (!element) {
      alert('未找到简历内容')
      return
    }
    const name = formData.value.name || '未填写'
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `resume_${name}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }
    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error(error)
    alert('PDF导出失败：' + error.message)
  }
}

const exportWordResume = async () => {
  try {
  const data = formData.value
  
  const name = data.name || '未填写'
  const intention = data.intention || '未填写'
  const gender = data.gender || '未填写'
  const age = data.age || '未填写'
  const origin = data.origin || '未填写'
  const residence = data.residence || '未填写'
  const phone = data.phone || '未填写'
  const email = data.email && data.emailType ? `${data.email}@${data.emailType}.com` : (data.email || '未填写')
  const school = data.school || '未填写'
  const major = data.major || '未填写'
  const education = `${data.education || ''}${data.degree ? `(${data.degree})` : ''}` || '未填写'
  const schoolTime = `${data.schoolStart || ''} - ${data.schoolEnd || ''}` || '未填写'
  const courses = data.courses || ''
  const company = data.company || '未填写'
  const position = data.position || '未填写'
  const industry = data.industry || '未填写'
  const workTime = `${data.workStart || ''} - ${data.workEnd || ''}` || '未填写'
  const experience = data.experience || '未填写'
  const responsibilities = data.responsibilities || ''
  const achievements = data.achievements || ''
  const honors = data.honors || '暂无获奖信息'
  const skills = data.skills && data.skills.length > 0 ? data.skills.join('、') : '暂无技能信息'
  const strengths = data.strengths || '暂无自我评价'

  const children = []
  
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }
  
  const makeP = (txt, opts = {}) => new Paragraph({
    children: [new TextRun({ text: txt, font: '宋体', size: 22, ...opts })]
  })
  
  const makeLabelP = (label, value) => new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({ text: label, bold: true, font: '宋体', size: 20, color: '333333' }),
      new TextRun({ text: value || '未填写', font: '宋体', size: 20, color: '555555' })
    ]
  })

  // 顶部标题
  children.push(new Paragraph({
    children: [new TextRun({ text: '个人简历', bold: true, size: 48, font: '黑体', color: '2C3E50' })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 创建板块标题（标签样式）
  const createSectionTitle = (title) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: [new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '2C3E50' },
            borders,
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              children: [new TextRun({ text: ` ${title}`, bold: true, size: 24, font: '黑体', color: 'FFFFFF' })]
            })]
          }),
          new TableCell({
            borders,
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
          })
        ]
      })]
    })
  }

  // 基本信息（两列布局：左内容 + 右照片框）
  children.push(createSectionTitle('基本信息'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Table({
    width: { size: 10466, type: WidthType.DXA },
    borders,
    rows: [new TableRow({
      height: { value: 1984, rule: HeightRule.EXACT },
      children: [
        new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' }
          },
          width: { size: 9049, type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          verticalAlign: 'center',
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [new TextRun({ text: name, bold: true, size: 28, font: '黑体', color: '2C3E50' })]
            }),
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [new TextRun({ text: intention, size: 22, font: '宋体', color: 'D4A853', bold: true })]
            }),
            new Paragraph({ children: [new TextRun({ text: ' ' })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders,
              rows: [
                new TableRow({ children: [
                  new TableCell({ borders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeLabelP('性别：', gender)] }),
                  new TableCell({ borders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeLabelP('年龄：', age)] })
                ]}),
                new TableRow({ children: [
                  new TableCell({ borders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeLabelP('籍贯：', origin)] }),
                  new TableCell({ borders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeLabelP('现居地：', residence)] })
                ]}),
                new TableRow({ children: [
                  new TableCell({ borders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeLabelP('联系电话：', phone)] }),
                  new TableCell({ borders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [makeLabelP('邮箱：', email)] })
                ]})
              ]
            })
          ]
        }),
        new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' }
          },
          width: { size: 1417, type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          verticalAlign: 'top',
          children: data.photo ? (() => {
            try {
              const typeMatch = data.photo.match(/^data:image\/(\w+);base64,/)
              const imgType = typeMatch ? typeMatch[1] : 'png'
              const base64Data = data.photo.replace(/^data:image\/\w+;base64,/, '')
              const binaryString = window.atob(base64Data)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }
              return [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 0 },
                  children: [
                    new ImageRun({
                      type: imgType,
                      data: bytes,
                      transformation: { width: 95, height: 135 }
                    })
                  ]
                })
              ]
            } catch (e) {
              return [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 0 },
                  children: [new TextRun({ text: '照片位置', size: 20, font: '宋体', color: 'AAAAAA' })]
                })
              ]
            }
          })() : [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [new TextRun({ text: '照片位置', size: 20, font: '宋体', color: 'AAAAAA' })]
            })
          ]
        })
      ]
    })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 教育背景
  children.push(createSectionTitle('教育背景'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 8, color: '2C3E50' }, right: noBorder },
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
        }),
        new TableCell({
          borders,
          width: { size: 95, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: school, bold: true, size: 26, font: '宋体', color: '2C3E50' }),
                new TextRun({ text: `  |  ${schoolTime}`, size: 22, font: '宋体', color: '888888' })
              ]
            }),
            makeLabelP('专业：', major),
            makeLabelP('学历：', education),
            courses ? makeLabelP('主修课程：', courses) : makeP('')
          ]
        })
      ]
    })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 实习经历
  children.push(createSectionTitle('实习经历'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 8, color: '2C3E50' }, right: noBorder },
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
        }),
        new TableCell({
          borders,
          width: { size: 95, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: company, bold: true, size: 26, font: '宋体', color: '2C3E50' }),
                new TextRun({ text: `  |  ${workTime}`, size: 22, font: '宋体', color: '888888' })
              ]
            }),
            makeLabelP('职位：', position),
            makeLabelP('行业：', industry),
            makeLabelP('经验：', experience),
            responsibilities ? makeLabelP('岗位职责：', responsibilities) : makeP(''),
            achievements ? makeLabelP('工作业绩：', achievements) : makeP('')
          ]
        })
      ]
    })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 曾获奖项
  children.push(createSectionTitle('曾获奖项'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  const honorsContent = honors && honors !== '暂无获奖信息' 
    ? honors.split('\n').filter(h => h.trim()).map(h => makeP('• ' + h.trim()))
    : [makeP('暂无获奖信息')]
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 8, color: '2C3E50' }, right: noBorder },
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
        }),
        new TableCell({
          borders,
          width: { size: 95, type: WidthType.PERCENTAGE },
          children: honorsContent
        })
      ]
    })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 项目经历
  children.push(createSectionTitle('项目经历'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  const projectContent = []
  if (data.projects && data.projects.filter(p => p.name).length > 0) {
    data.projects.filter(p => p.name).forEach((p, i) => {
      projectContent.push(new Paragraph({
        children: [
          new TextRun({ text: `项目${i+1}：${p.name}`, bold: true, size: 26, font: '宋体', color: '2C3E50' }),
          new TextRun({ text: `  |  ${p.duration || ''}`, size: 22, font: '宋体', color: '888888' })
        ]
      }))
      projectContent.push(makeLabelP('角色：', p.role))
      if (p.desc) projectContent.push(makeLabelP('项目描述：', p.desc))
      if (p.achievements) projectContent.push(makeLabelP('项目成果：', p.achievements))
      projectContent.push(makeP(''))
    })
  } else {
    projectContent.push(makeP('暂无项目经历'))
  }
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 8, color: '2C3E50' }, right: noBorder },
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
        }),
        new TableCell({
          borders,
          width: { size: 95, type: WidthType.PERCENTAGE },
          children: projectContent
        })
      ]
    })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 专业技能
  children.push(createSectionTitle('专业技能'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 8, color: '2C3E50' }, right: noBorder },
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
        }),
        new TableCell({
          borders,
          width: { size: 95, type: WidthType.PERCENTAGE },
          children: [makeP(skills)]
        })
      ]
    })]
  }))
  
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))

  // 自我评价
  children.push(createSectionTitle('自我评价'))
  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }))
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 8, color: '2C3E50' }, right: noBorder },
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
        }),
        new TableCell({
          borders,
          width: { size: 95, type: WidthType.PERCENTAGE },
          children: [makeP(strengths)]
        })
      ]
    })]
  }))

  const doc = new Document({
    sections: [{ 
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children 
    }]
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `resume_${Date.now()}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
  
  alert('简历导出成功！')
  } catch (error) {
    console.error(error)
    alert('导出失败：' + error.message)
  }
}

const photoInput = ref(null)

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.photo = e.target?.result || ''
    }
    reader.readAsDataURL(file)
  }
}

const formData = ref({
  photo: '',
  name: '',
  intention: '',
  phone: '',
  emailType: '',
  email: '',
  gender: '',
  age: '',
  origin: '',
  residence: '',
  education: '',
  school: '',
  major: '',
  schoolStart: '',
  schoolEnd: '',
  degree: '',
  honors: '',
  courses: '',
  company: '',
  position: '',
  industry: '',
  workStart: '',
  workEnd: '',
  experience: '',
  responsibilities: '',
  achievements: '',
  skillName: '',
  skillLevel: '',
  skillYears: '',
  skills: [],
  projects: [
    { name: '', role: '', duration: '', desc: '', achievements: '' }
  ],
  strengths: ''
})

const newSkill = ref('')

const addSkill = () => {
  if (newSkill.value.trim() && !formData.value.skills.includes(newSkill.value.trim())) {
    formData.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (index) => {
  formData.value.skills.splice(index, 1)
}

const addProject = () => {
  formData.value.projects.push({ name: '', role: '', duration: '', desc: '', achievements: '' })
}

const removeProject = (index) => {
  if (formData.value.projects.length > 1) {
    formData.value.projects.splice(index, 1)
  }
}

const bgCanvas = ref(null)
let bgAnimationId = null

// 加载岗位数据
const loadJobs = async () => {
  try {
    const response = await fetch('/api/jobs/search?keyword=&page=1&pageSize=100')
    if (response.ok) {
      const data = await response.json()
      if (data.jobs && data.jobs.length > 0) {
        // 处理岗位数据，提取技能标签
        allJobs.value = data.jobs.map(job => ({
          job_name: job.job_name,
          city: job.city,
          education: job.education,
          work_exp: job.work_exp,
          salary_avg: job.salary_avg,
          company: job.company,
          skills: extractSkills(job)
        }))
        searchedJobs.value = allJobs.value.slice(0, 20)
      }
    }
  } catch (e) {
    console.warn('加载岗位数据失败，使用默认热门岗位', e)
    searchedJobs.value = [...hotJobs.value]
  }
}

// 从岗位数据中提取技能标签
const extractSkills = (job) => {
  const text = `${job.job_name || ''} ${job.company || ''} ${job.description || ''}`.toLowerCase()
  const skillKeywords = ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'Vue', 'React', 
    'Node.js', 'Spring', 'SpringBoot', 'MySQL', 'Redis', 'MongoDB', 'Docker', 'Kubernetes',
    'Linux', 'Git', 'AWS', 'Azure', 'TensorFlow', 'PyTorch', 'Hadoop', 'Spark', 'Flink',
    'Kafka', 'Hive', 'Selenium', 'JMeter', 'Postman', 'Photoshop', 'Figma', 'Sketch']
  const found = skillKeywords.filter(s => text.includes(s.toLowerCase()))
  return found.length > 0 ? found : (job.skills || [])
}

onMounted(() => {
  const canvas = bgCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 加载岗位数据
  loadJobs()

  // 读取目标岗位数据
  const savedTargetJob = localStorage.getItem('targetJobForResume')
  if (savedTargetJob) {
    try {
      targetJob.value = JSON.parse(savedTargetJob)
      // 自动切换到岗位针对性优化标签
      activeAiTab.value = 2
    } catch (e) {
      console.error('Failed to parse target job:', e)
    }
  }
  
  // 读取已保存的简历数据（使用用户隔离的存储键）
  const savedResume = localStorage.getItem(getResumeStorageKey())
  if (savedResume) {
    try {
      const resumeData = JSON.parse(savedResume)
      Object.assign(formData.value, resumeData)
    } catch (e) {
      console.error('Failed to parse resume data:', e)
    }
  }
  // 注意：不再自动迁移旧的resumeData，避免不同用户看到相同数据

  const particles = []
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random()
    })
  }

  const animate = () => {
    ctx.fillStyle = 'rgba(5, 10, 30, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.x += p.speedX
      p.y += p.speedY

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74, 158, 255, ${p.opacity})`
      ctx.fill()
    })

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(74, 158, 255, ${0.1 * (1 - dist / 100)})`
          ctx.stroke()
        }
      }
    }

    bgAnimationId = requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  document.addEventListener('click', handleExportClickOutside)
})

onUnmounted(() => {
  if (bgAnimationId) {
    cancelAnimationFrame(bgAnimationId)
  }
  document.removeEventListener('click', handleExportClickOutside)
})
</script>

<style scoped>
.ai-resume-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #050a1e 0%, #0a1628 50%, #050a1e 100%);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 30px 50px;
  display: flex;
  flex-direction: column;
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(10, 20, 45, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.5);
}

.header-title h1 {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.header-title p {
  color: rgba(150, 180, 220, 0.6);
  font-size: 14px;
  margin: 5px 0 0;
}

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1500px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  width: 100%;
  align-items: flex-start;
}

.step-nav {
  width: 180px;
  background: rgba(10, 20, 45, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  flex-shrink: 0;
}

.nav-title {
  color: rgba(150, 180, 220, 0.5);
  font-size: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.15);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 2px solid transparent;
}

.step-item:hover {
  background: rgba(74, 158, 255, 0.1);
  margin-left: -10px;
  padding-left: 10px;
  border-left-color: rgba(74, 158, 255, 0.3);
}

.step-item.active {
  background: rgba(74, 158, 255, 0.15);
  margin-left: -10px;
  padding-left: 10px;
  border-left-color: #4a9eff;
}

.step-item.completed .step-number {
  background: rgba(0, 212, 170, 0.2);
  border-color: rgba(0, 212, 170, 0.5);
  color: #00d4aa;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(74, 158, 255, 0.3);
  background: rgba(74, 158, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(74, 158, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: rgba(74, 158, 255, 0.3);
  border-color: #4a9eff;
  color: #fff;
}

.step-text {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
}

.step-item.active .step-text {
  color: #fff;
}

.form-section {
  flex: 1;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(135deg, rgba(74, 158, 255, 0.05) 0%, transparent 50%),
    linear-gradient(225deg, rgba(0, 212, 170, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.step-content {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full {
  flex: 100%;
}

.form-item label {
  color: rgba(150, 180, 220, 0.7);
  font-size: 13px;
}

.form-item input {
  padding: 12px 15px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
}

.form-item input:focus {
  border-color: rgba(74, 158, 255, 0.5);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.2);
}

.form-item input::placeholder {
  color: rgba(150, 180, 220, 0.3);
}

.form-item textarea {
  width: 100%;
  padding: 12px 15px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  resize: vertical;
}

.form-item textarea:focus {
  border-color: rgba(74, 158, 255, 0.5);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.2);
}

.form-item textarea::placeholder {
  color: rgba(150, 180, 220, 0.3);
}

.select-wrapper {
  position: relative;
}

.form-item select {
  width: 100%;
  padding: 12px 15px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

.form-item select:focus {
  border-color: rgba(74, 158, 255, 0.5);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.2);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 12px;
}

.tag-remove {
  cursor: pointer;
  color: rgba(74, 158, 255, 0.6);
  font-size: 16px;
  line-height: 1;
}

.tag-remove:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tags-input input {
  border: none;
  background: transparent;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  padding: 0;
  min-width: 120px;
}

.tags-input input::placeholder {
  color: rgba(150, 180, 220, 0.4);
}

.projects-section {
  margin-top: 10px;
}

.section-title {
  color: rgba(150, 180, 220, 0.7);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 15px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.project-card {
  background: rgba(15, 25, 55, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 15px;
  padding: 20px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.project-number {
  color: rgba(74, 158, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
}

.remove-project {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.remove-project:hover {
  opacity: 1;
}

.add-project-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px dashed rgba(74, 158, 255, 0.4);
  border-radius: 10px;
  color: rgba(74, 158, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-project-btn:hover {
  background: rgba(74, 158, 255, 0.2);
  border-color: rgba(74, 158, 255, 0.6);
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.save-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  background-size: 200% 200%;
  border: none;
  border-radius: 14px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
  animation: btnGradShift 4s ease infinite;
}

@keyframes btnGradShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(74, 158, 255, 0.6);
}

/* 岗位选择器卡片样式 */
.job-selector-card {
  width: 100%;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(0, 212, 170, 0.08));
  border: 1px dashed rgba(74, 158, 255, 0.4);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.job-selector-card:hover {
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.15);
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 14px;
}

.selector-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(74, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 15px;
  line-height: 1.5;
}

.selector-actions {
  display: flex;
  gap: 10px;
}

.select-job-btn {
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #4a9eff, #357abd);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.select-job-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
}

.skip-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* 岗位选择器模态框 */
.job-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.selector-modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(20, 30, 50, 0.95), rgba(15, 25, 40, 0.98));
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.selector-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selector-modal-header h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.close-selector {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-selector:hover {
  background: rgba(255, 71, 87, 0.3);
  color: #ff4757;
}

.selector-search {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.selector-search input {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.selector-search input:focus {
  border-color: rgba(74, 158, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.search-job-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4a9eff, #357abd);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-job-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
}

.selector-hot-jobs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.hot-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.hot-job-tag {
  padding: 6px 12px;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 20px;
  color: rgba(74, 158, 255, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-job-tag:hover {
  background: rgba(74, 158, 255, 0.3);
  color: #fff;
}

.selector-job-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
}

.selector-job-item {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selector-job-item:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateX(5px);
}

.job-main h4 {
  color: #fff;
  font-size: 15px;
  margin: 0 0 8px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.job-tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
}

.job-tag.salary {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.job-skills {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-mini {
  padding: 3px 8px;
  background: rgba(0, 212, 170, 0.1);
  border-radius: 10px;
  color: rgba(0, 212, 170, 0.8);
  font-size: 11px;
}

.no-jobs {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.5);
}

/* 目标岗位卡片样式 */
/* ===== AI 简历智能优化中心 ===== */
.optimization-center {
  width: 100%;
  background: linear-gradient(135deg, rgba(15, 25, 60, 0.95), rgba(20, 35, 80, 0.9));
  border: 1px solid rgba(74, 158, 255, 0.35);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(74, 158, 255, 0.08);
}

.optimization-center::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa, #a855f7);
  box-shadow: 0 0 12px rgba(74, 158, 255, 0.6);
}

.optimization-center-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.oc-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.25), rgba(0, 212, 170, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5eead4;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
}

.oc-header-title {
  flex: 1;
}

.oc-header-title h3 {
  font-size: 18px;
  color: #fff;
  margin: 0 0 4px;
  font-weight: 600;
}

.oc-header-title p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.oc-header-steps {
  display: flex;
  align-items: center;
  gap: 8px;
}

.oc-step {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.oc-step.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(0, 212, 170, 0.2));
  color: #5eead4;
  box-shadow: 0 0 12px rgba(74, 158, 255, 0.3);
}

.oc-step.done {
  background: rgba(0, 212, 170, 0.2);
  color: #00d4aa;
}

.oc-step-arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.oc-section {
  margin-bottom: 24px;
}

.oc-section:last-child {
  margin-bottom: 0;
}

.oc-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.oc-step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.4);
  flex-shrink: 0;
}

.oc-section-header h4 {
  font-size: 15px;
  color: #fff;
  margin: 0;
  font-weight: 600;
}

.oc-optional-tag {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
}

/* ===== 岗位选择器卡片（紧凑版） ===== */
.job-selector-card.compact {
  background: rgba(74, 158, 255, 0.06);
  border: 1px dashed rgba(74, 158, 255, 0.35);
  border-radius: 12px;
  padding: 16px 20px;
}

.selector-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.selector-actions {
  display: flex;
  gap: 10px;
}

.select-job-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(74, 158, 255, 0.5);
  border-radius: 10px;
  color: #60a5fa;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-job-btn:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.4), rgba(59, 130, 246, 0.3));
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.skip-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ===== 目标岗位卡片（紧凑版） ===== */
.target-job-card.compact {
  background: rgba(15, 25, 60, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  position: relative;
  overflow: hidden;
}

.target-job-card.compact::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
}

.target-job-card.compact .target-job-header {
  margin-bottom: 12px;
}

.target-job-card.compact .target-job-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.target-job-card.compact .target-job-title h3 {
  font-size: 16px;
}

.target-job-card.compact .target-job-info {
  margin-bottom: 0;
}

.target-job-card.compact .info-tag {
  padding: 5px 12px;
  font-size: 12px;
}

/* ===== 优化模式选择器 ===== */
.optimization-mode-selector {
  padding: 0;
  margin-bottom: 0;
  background: transparent;
  border: none;
}

.mode-options {
  display: flex;
  gap: 12px;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  position: relative;
}

.mode-option:hover:not(.disabled) {
  background: rgba(74, 158, 255, 0.08);
  border-color: rgba(74, 158, 255, 0.4);
}

.mode-option.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(0, 212, 170, 0.15));
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.2);
}

.mode-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-option.disabled:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

.mode-lock-icon {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 12px;
}

.mode-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mode-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.mode-option.active .mode-name {
  color: #5eead4;
}

.mode-option.disabled .mode-name {
  color: rgba(255, 255, 255, 0.5);
}

.mode-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.mode-option.disabled .mode-desc {
  color: rgba(255, 255, 255, 0.3);
}

/* 模式说明 */
.mode-explanation {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  margin-top: 14px;
  background: rgba(74, 158, 255, 0.08);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.mode-explanation.optimized {
  background: rgba(0, 212, 170, 0.1);
  border-color: rgba(0, 212, 170, 0.35);
  color: rgba(255, 255, 255, 0.9);
}

.ex-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.optimized-text {
  color: #5eead4;
  font-weight: 500;
}

/* ===== 执行按钮区域 ===== */
.execute-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.execute-btn {
  width: 100%;
  max-width: 400px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.execute-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(74, 158, 255, 0.5);
}

.execute-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.execute-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.execute-btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.execute-hint {
  font-size: 12px;
  color: #fbbf24;
  margin: 0;
}

/* ===== 优化进度面板 ===== */
.optimization-progress-panel {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(0, 212, 170, 0.08));
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 16px;
  animation: panelPulse 2s ease-in-out infinite;
}

@keyframes panelPulse {
  0%, 100% { box-shadow: 0 0 15px rgba(74, 158, 255, 0.15); }
  50% { box-shadow: 0 0 25px rgba(74, 158, 255, 0.3); }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: #60a5fa;
}

.progress-percent {
  font-size: 18px;
  font-weight: 700;
  color: #5eead4;
  font-family: 'Consolas', monospace;
}

.progress-bar-outer {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 4px;
  transition: width 0.4s ease;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.progress-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.progress-step.done {
  background: rgba(0, 212, 170, 0.15);
  color: #5eead4;
}

.progress-step.active {
  background: rgba(74, 158, 255, 0.2);
  color: #60a5fa;
  animation: stepPulse 1s ease-in-out infinite;
}

@keyframes stepPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.step-icon {
  font-size: 10px;
}

/* 旧样式保留兼容（防止未使用时样式丢失） */
.target-job-card {
  width: 100%;
  background: linear-gradient(135deg, rgba(15, 25, 60, 0.9), rgba(20, 35, 80, 0.85));
  border: 1px solid rgba(74, 158, 255, 0.35);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(74, 158, 255, 0.08);
}

.target-job-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(74, 158, 255, 0.06), transparent 70%);
  pointer-events: none;
}

.target-job-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.target-job-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.25), rgba(0, 212, 170, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.target-job-title {
  flex: 1;
}

.target-job-title .job-label {
  display: inline-block;
  font-size: 13px;
  color: #4a9eff;
  font-weight: 600;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.3);
  padding: 3px 12px;
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.target-job-title h3 {
  font-size: 18px;
  color: #fff;
  margin: 6px 0 0;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
}

.clear-target-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.clear-target-btn:hover {
  background: rgba(255, 71, 87, 0.3);
  color: #ff4757;
  border-color: rgba(255, 71, 87, 0.4);
}

.target-job-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  cursor: default;
  position: relative;
  overflow: hidden;
}

.info-tag:hover {
  transform: translateY(-2px);
  filter: brightness(1.15);
}

.info-tag .tag-icon {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.info-tag:nth-child(1) {
  background: rgba(74, 158, 255, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(74, 158, 255, 0.35);
}

.info-tag:nth-child(2) {
  background: rgba(168, 85, 247, 0.1);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.35);
}

.info-tag:nth-child(3) {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.info-tag:nth-child(4) {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.info-tag:nth-child(5) {
  background: rgba(236, 72, 153, 0.1);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.35);
}

.skill-tags {
  display: inline-flex;
  gap: 5px;
  flex-wrap: wrap;
}

.skill-tag {
  display: inline-block;
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(74, 158, 255, 0.15));
  color: #5eead4;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(0, 212, 170, 0.4);
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(0, 212, 170, 0.2);
  transition: all 0.25s ease;
}

.skill-tag:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.4);
}

.mode-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  padding-top: 4px;
}

.progress-bar-outer {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 4px;
  transition: width 0.4s ease;
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.progress-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.progress-step.active {
  color: #60a5fa;
  font-weight: 500;
}

.progress-step.done {
  color: #5eead4;
}

.step-icon {
  font-size: 12px;
}

.progress-step.active .step-icon {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.target-job-actions {
  display: flex;
  gap: 10px;
}

.optimize-btn {
  flex: 1;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
}

.optimize-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 158, 255, 0.4);
}

/* 简历评分面板样式 */
.score-panel {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.score-card {
  background: linear-gradient(135deg, rgba(10, 20, 50, 0.85), rgba(15, 25, 60, 0.9));
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(74, 158, 255, 0.08);
}

.score-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa, #a855f7);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.score-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(74, 158, 255, 0.08), transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.06), transparent 50%);
  pointer-events: none;
  animation: cardGlow 8s ease-in-out infinite alternate;
}

@keyframes cardGlow {
  0% { transform: translate(0, 0); }
  100% { transform: translate(2%, 2%); }
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgba(74, 158, 255, 0.2), rgba(15, 25, 55, 0.95));
  border: 3px solid rgba(74, 158, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  position: relative;
  box-shadow: 
    0 0 40px rgba(74, 158, 255, 0.25),
    inset 0 0 30px rgba(74, 158, 255, 0.1);
  animation: scorePulse 3s ease-in-out infinite;
}

.score-circle::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1px solid rgba(74, 158, 255, 0.15);
  animation: ringRotate 10s linear infinite;
}

.score-circle::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px dashed rgba(74, 158, 255, 0.2);
  animation: ringRotate 15s linear infinite reverse;
}

@keyframes scorePulse {
  0%, 100% { box-shadow: 0 0 40px rgba(74, 158, 255, 0.25), inset 0 0 30px rgba(74, 158, 255, 0.1); }
  50% { box-shadow: 0 0 60px rgba(74, 158, 255, 0.4), inset 0 0 40px rgba(74, 158, 255, 0.15); }
}

@keyframes ringRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.score-circle.excellent {
  border-color: #00d4aa;
  background: radial-gradient(circle at 35% 35%, rgba(0, 212, 170, 0.2), rgba(15, 25, 55, 0.95));
  box-shadow: 
    0 0 40px rgba(0, 212, 170, 0.35),
    inset 0 0 30px rgba(0, 212, 170, 0.1);
}

.score-circle.good {
  border-color: #4a9eff;
  background: radial-gradient(circle at 35% 35%, rgba(74, 158, 255, 0.2), rgba(15, 25, 55, 0.95));
  box-shadow: 
    0 0 40px rgba(74, 158, 255, 0.35),
    inset 0 0 30px rgba(74, 158, 255, 0.1);
}

.score-circle.normal {
  border-color: #ffc107;
  background: radial-gradient(circle at 35% 35%, rgba(255, 193, 7, 0.2), rgba(15, 25, 55, 0.95));
  box-shadow: 
    0 0 40px rgba(255, 193, 7, 0.35),
    inset 0 0 30px rgba(255, 193, 7, 0.1);
}

.score-circle.pending {
  border-color: #ff9800;
  background: radial-gradient(circle at 35% 35%, rgba(255, 152, 0, 0.2), rgba(15, 25, 55, 0.95));
  box-shadow: 
    0 0 40px rgba(255, 152, 0, 0.35),
    inset 0 0 30px rgba(255, 152, 0, 0.1);
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 0 20px currentColor;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
}

.score-max {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.score-info {
  text-align: center;
  margin-bottom: 18px;
}

.score-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.score-level {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
}

.score-level.excellent {
  background: rgba(0, 212, 170, 0.2);
  color: #00d4aa;
  border: 1px solid rgba(0, 212, 170, 0.3);
  box-shadow: 0 0 15px rgba(0, 212, 170, 0.2);
}

.score-level.good {
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
  border: 1px solid rgba(74, 158, 255, 0.3);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.2);
}

.score-level.normal {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
}

.score-level.pending {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 152, 0, 0.2);
}

.score-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-name {
  width: 60px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.item-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.item-progress {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 3px;
  transition: width 0.8s ease;
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.4);
}

.item-score {
  width: 30px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 14px 12px;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.smart-optimize {
  background: linear-gradient(135deg, #a855f7, #4a9eff, #00d4aa);
  background-size: 200% 200%;
  color: #fff;
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
  animation: btnGradShift 4s ease infinite;
}

@keyframes btnGradShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.action-btn.smart-optimize:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.6);
}

.action-btn.quick-save {
  background: rgba(74, 158, 255, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(74, 158, 255, 0.35);
}

.action-btn.quick-save:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.25);
  border-color: rgba(74, 158, 255, 0.5);
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
}

.action-btn.quick-generate {
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
  border: 1px solid rgba(0, 212, 170, 0.35);
}

.action-btn.quick-generate:hover:not(:disabled) {
  background: rgba(0, 212, 170, 0.25);
  border-color: rgba(0, 212, 170, 0.5);
  box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
}

/* 岗位匹配度仪表盘 */
.match-dashboard {
  display: flex;
  gap: 24px;
  margin: 24px 0 0 0;
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(10, 20, 50, 0.6), rgba(15, 30, 65, 0.5));
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  box-shadow: inset 0 0 30px rgba(74, 158, 255, 0.04);
  position: relative;
  overflow: visible;
  transition: all 0.5s ease;
}

.match-dashboard.just-optimized {
  border-color: rgba(0, 212, 170, 0.45);
  box-shadow: inset 0 0 30px rgba(74, 158, 255, 0.04), 0 0 30px rgba(0, 212, 170, 0.2);
}

.optimized-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: linear-gradient(135deg, #00d4aa, #4a9eff);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.4);
  animation: badgeSlide 0.5s ease;
}

@keyframes badgeSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.match-dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.4), rgba(0, 212, 170, 0.4), rgba(168, 85, 247, 0.4), transparent);
  border-radius: 12px 12px 0 0;
}

.match-ring {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.match-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.match-progress {
  transition: stroke-dasharray 0.8s ease;
  filter: drop-shadow(0 0 8px currentColor);
}

.match-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.match-value span {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-shadow: 0 0 15px currentColor;
}

.match-value small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

.match-details {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  align-content: center;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-label {
  width: 32px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.match-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.match-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.match-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
  position: relative;
}

.match-progress-bar.skill {
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

.match-progress-bar.edu {
  background: linear-gradient(90deg, #a855f7, #ec4899);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}

.match-progress-bar.city {
  background: linear-gradient(90deg, #ffc107, #ff9800);
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.match-progress-bar.exp {
  background: linear-gradient(90deg, #06b6d4, #3b82f6);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

.match-score {
  width: 38px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.ai-section {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, rgba(10, 20, 50, 0.5) 0%, rgba(8, 16, 40, 0.5) 100%);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 22px;
  padding: 28px 25px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.ai-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.5), rgba(168, 85, 247, 0.4), transparent);
}

.ai-section::after {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(168, 85, 247, 0.15));
  border: 1px solid rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.2);
}

.section-header span {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #fff, #b8d4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ai-title {
  color: rgba(150, 180, 220, 0.75);
  font-size: 13px;
  margin-bottom: 18px;
  line-height: 1.6;
}

.ai-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 22px;
  background: rgba(15, 25, 55, 0.6);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

.ai-tab {
  flex: 1;
  padding: 9px 6px;
  background: transparent;
  border: none;
  border-radius: 9px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-tab:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(74, 158, 255, 0.08);
}

.ai-tab.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.4) 0%, rgba(0, 212, 170, 0.3) 100%);
  color: #fff;
  box-shadow: 0 2px 10px rgba(74, 158, 255, 0.3);
}

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(15, 25, 55, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: rgba(20, 35, 70, 0.6);
  border-color: rgba(74, 158, 255, 0.15);
  transform: translateX(2px);
}

.suggestion-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
}

.suggestion-item span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.6;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #a855f7 0%, #4a9eff 50%, #00d4aa 100%);
  background-size: 200% 200%;
  border: none;
  border-radius: 14px;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(74, 158, 255, 0.15);
  transition: all 0.4s ease;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.generate-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.generate-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(168, 85, 247, 0.5), 0 0 50px rgba(74, 158, 255, 0.2);
  background-position: 100% 100%;
}

.generate-btn:hover::before {
  left: 100%;
}

/* AI分析面板样式 */
.ai-analysis-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  max-width: 92vw;
  height: 100vh;
  background: linear-gradient(180deg, rgba(8, 15, 38, 0.97) 0%, rgba(4, 8, 22, 0.98) 50%, rgba(6, 12, 32, 0.97) 100%);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border-left: 1px solid rgba(74, 158, 255, 0.25);
  box-shadow: -12px 0 50px rgba(0, 0, 0, 0.5), inset 1px 0 0 rgba(255, 255, 255, 0.03);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-analysis-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.6), rgba(168, 85, 247, 0.6), rgba(74, 158, 255, 0.6), transparent);
  background-size: 200% 100%;
  animation: panelTopGlow 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 10;
}

.ai-analysis-panel::after {
  content: '';
  position: absolute;
  bottom: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

@keyframes panelTopGlow {
  0%, 100% { background-position: 100% 0; }
  50% { background-position: -100% 0; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.analysis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(0, 212, 170, 0.06) 100%);
  border-bottom: 1px solid rgba(74, 158, 255, 0.18);
  flex-shrink: 0;
  position: relative;
}

.analysis-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 26px;
  right: 26px;
  height: 1px;
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.5), rgba(168, 85, 247, 0.3), transparent);
}

.analysis-header h4 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.8px;
  background: linear-gradient(135deg, #fff 0%, #b8d4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-analysis {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
}

.close-analysis:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
  transform: rotate(90deg);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.analysis-score-section {
  display: flex;
  align-items: stretch;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(180deg, rgba(74, 158, 255, 0.08) 0%, rgba(168, 85, 247, 0.04) 50%, rgba(0, 212, 170, 0.03) 100%);
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
  flex-shrink: 0;
  position: relative;
}

.analysis-score-section::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border-radius: 14px;
  background: radial-gradient(ellipse at 30% 20%, rgba(74, 158, 255, 0.06), transparent 60%);
  pointer-events: none;
}

.score-ring-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.big-score-ring {
  position: relative;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.big-score-ring::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(74, 158, 255, 0.3), rgba(168, 85, 247, 0.2), rgba(0, 212, 170, 0.3), rgba(74, 158, 255, 0.3));
  filter: blur(12px);
  opacity: 0.6;
  z-index: -1;
  animation: ringGlow 6s ease-in-out infinite;
}

@keyframes ringGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.big-score-ring svg {
  transform: rotate(-90deg);
}

.big-score-ring.excellent .score-progress {
  filter: drop-shadow(0 0 10px rgba(0, 212, 170, 0.7));
}
.big-score-ring.good .score-progress {
  filter: drop-shadow(0 0 10px rgba(74, 158, 255, 0.7));
}
.big-score-ring.medium .score-progress {
  filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.7));
}
.big-score-ring.low .score-progress {
  filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.7));
}

.score-progress {
  transition: stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.score-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-text span {
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #b8d4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: -1px;
}

.score-text small {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.score-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 72px 1fr 28px;
  align-items: center;
  gap: 10px;
}

.bd-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  font-weight: 500;
}

.bd-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.bd-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: barShimmer 2s linear infinite;
}

@keyframes barShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.bd-progress {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 3px;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.4);
  position: relative;
}

.bd-progress::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 12px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  border-radius: 0 4px 4px 0;
}

.bd-value {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: right;
}

.analysis-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 0;
}

.analysis-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  position: relative;
}

.analysis-content::-webkit-scrollbar {
  width: 8px;
}
.analysis-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}
.analysis-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(74, 158, 255, 0.4), rgba(168, 85, 247, 0.3));
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.05);
}
.analysis-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(74, 158, 255, 0.6), rgba(168, 85, 247, 0.5));
}

.analysis-summary h5,
.analysis-strengths h5,
.analysis-weaknesses h5,
.analysis-suggestions h5,
.analysis-keywords h5,
.analysis-rewrite h5 {
  margin: 0 0 14px 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
}

.analysis-summary h5 svg,
.analysis-strengths h5 svg,
.analysis-weaknesses h5 svg,
.analysis-suggestions h5 svg,
.analysis-keywords h5 svg,
.analysis-rewrite h5 svg {
  filter: drop-shadow(0 0 4px rgba(74, 158, 255, 0.5));
}

.analysis-summary {
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08) 0%, rgba(74, 158, 255, 0.02) 100%);
  border: 1px solid rgba(74, 158, 255, 0.18);
  border-radius: 16px;
  position: relative;
}

.analysis-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  border-radius: 16px 16px 0 0;
}

.analysis-summary p {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.78);
}

.analysis-strengths,
.analysis-weaknesses {
  padding: 20px 22px;
  border-radius: 16px;
  position: relative;
}

.analysis-strengths::before,
.analysis-weaknesses::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}

.analysis-strengths {
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(0, 212, 170, 0.02) 100%);
  border: 1px solid rgba(0, 212, 170, 0.18);
}
.analysis-strengths::before {
  background: linear-gradient(90deg, #00d4aa, #4a9eff);
}

.analysis-weaknesses {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%);
  border: 1px solid rgba(245, 158, 11, 0.18);
}
.analysis-weaknesses::before {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.analysis-strengths ul,
.analysis-weaknesses ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-strengths li,
.analysis-weaknesses li {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.7;
  position: relative;
}

.analysis-strengths li::marker {
  color: #00d4aa;
}
.analysis-weaknesses li::marker {
  color: #f59e0b;
}

.analysis-suggestions {
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%);
  border: 1px solid rgba(168, 85, 247, 0.18);
  border-radius: 16px;
  position: relative;
}

.analysis-suggestions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #a855f7, #4a9eff);
  border-radius: 16px 16px 0 0;
}

.suggestion-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: all 0.3s ease;
  position: relative;
}

.suggestion-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15);
}

.suggestion-card.high { border-left: 3px solid #ef4444; }
.suggestion-card.medium { border-left: 3px solid #f59e0b; }
.suggestion-card.low { border-left: 3px solid #4a9eff; }

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.priority-badge {
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.suggestion-card.high .priority-badge {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.suggestion-card.medium .priority-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.suggestion-card.low .priority-badge {
  background: rgba(74, 158, 255, 0.15);
  color: #4a9eff;
  border: 1px solid rgba(74, 158, 255, 0.3);
}

.category-tag {
  padding: 3px 10px;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
}

.suggestion-card h6 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.suggestion-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.68);
}

.suggestion-example {
  margin: 10px 0 0 0;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(168, 85, 247, 0.06));
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(200, 220, 255, 0.8);
  line-height: 1.6;
  font-style: italic;
}

.analysis-keywords {
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.06) 0%, rgba(0, 212, 170, 0.02) 100%);
  border: 1px solid rgba(0, 212, 170, 0.15);
  border-radius: 16px;
  position: relative;
}

.analysis-keywords::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00d4aa, #4a9eff);
  border-radius: 16px 16px 0 0;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  padding: 6px 14px;
  font-size: 12px;
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(74, 158, 255, 0.1));
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 20px;
  color: #00d4aa;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.keyword-tag:hover {
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(74, 158, 255, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
  color: #fff;
}

.analysis-rewrite {
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.06) 0%, rgba(168, 85, 247, 0.03) 100%);
  border: 1px solid rgba(74, 158, 255, 0.15);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.analysis-rewrite::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff, #a855f7);
  border-radius: 16px 16px 0 0;
}

.rewrite-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.rewrite-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(74, 158, 255, 0.2);
  box-shadow: 0 4px 16px rgba(74, 158, 255, 0.1);
}

.rewrite-item label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(74, 158, 255, 0.95);
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 6px;
  margin-bottom: 12px;
}

.rewrite-item p {
  margin: 0 0 12px 0;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
}

.rewrite-item p::-webkit-scrollbar {
  width: 3px;
}
.rewrite-item p::-webkit-scrollbar-thumb {
  background: rgba(74, 158, 255, 0.3);
  border-radius: 2px;
}

.apply-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.5);
}

/* 无数据状态 */
.analysis-empty-state {
  flex: 1;
  overflow-y: auto;
  padding: 40px 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-height: 0;
  height: 0;
}

.analysis-empty-state .empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(0, 212, 170, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a9eff;
  margin-bottom: 8px;
}

.analysis-empty-state h5 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.analysis-empty-state > p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  max-width: 320px;
  margin: 0;
}

.empty-guide {
  background: rgba(74, 158, 255, 0.08);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  width: 100%;
  max-width: 360px;
}

.empty-guide h6 {
  font-size: 14px;
  font-weight: 600;
  color: #4a9eff;
  margin: 0 0 10px 0;
}

.empty-guide ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty-guide li {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-guide li:last-child {
  border-bottom: none;
}

.go-to-form-btn {
  margin-top: 8px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.35);
}

.go-to-form-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 158, 255, 0.5);
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .step-nav {
    width: 100%;
  }
  
  .step-item {
    display: inline-flex;
    margin-right: 20px;
  }
  
  .ai-section {
    width: 100%;
  }
}

@media (max-width: 700px) {
  .form-row {
    flex-direction: column;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.resume-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.resume-container {
  background: #fff;
  width: 820px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.resume-header {
  background: #2c3e50;
  color: #fff;
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
  border-bottom: 3px solid #d4a853;
}

.resume-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;
}

.resume-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.export-dropdown {
  position: relative;
}

.export-btn {
  background: transparent;
  border: 1px solid #d4a853;
  color: #d4a853;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.export-btn:hover {
  background: #d4a853;
  color: #2c3e50;
}

.export-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.export-arrow.rotated {
  transform: rotate(180deg);
}

.export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  animation: exportMenuFadeIn 0.2s ease;
}

@keyframes exportMenuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.export-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.export-menu-item:last-child {
  border-bottom: none;
}

.export-menu-item:hover {
  background: #f8f9fa;
}

.export-menu-item:active {
  background: #eef1f4;
}

.export-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.export-menu-text {
  flex: 1;
}

.export-menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.export-menu-desc {
  font-size: 12px;
  color: #888;
}

.close-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(90deg);
}

.resume-content {
  padding: 28px 32px;
  background: #f8f9fa;
}

.resume-export-header {
  background: #fff;
  padding: 28px 32px 16px;
  border-bottom: 3px solid #2c3e50;
}

.resume-export-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 4px;
  text-align: left;
}

.resume-main {
  position: relative;
  padding-left: 30px;
  color: #333;
}

.resume-main::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #2c3e50 0%, #2c3e50 100%);
}

.section {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.section:last-child {
  margin-bottom: 0;
}

.section::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 14px;
  width: 12px;
  height: 12px;
  background: #d4a853;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #d4a853;
  z-index: 10;
}

.section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  padding: 12px 20px;
  background: #2c3e50;
  display: flex;
  align-items: center;
  letter-spacing: 1px;
  border-radius: 6px 6px 0 0;
}

.basic-info {
  display: flex;
  gap: 24px;
  padding: 20px;
}

.info-content {
  flex: 1;
}

.photo-section {
  width: 140px;
  display: flex;
  align-items: flex-start;
}

.resume-photo {
  width: 140px;
  height: 170px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid #2c3e50;
}

.photo-placeholder-resume {
  width: 140px;
  height: 170px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #ccc;
}

.personal-header {
  margin-bottom: 8px;
}

.name-title h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0 0 6px 0;
}

.name-title p {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
}

.info-grid div {
  font-size: 13px;
  line-height: 1.8;
  color: #333;
}

.info-grid .email-item {
  grid-column: 1 / -1;
  white-space: nowrap;
}

.info-grid .email-text {
  word-break: break-all;
}

.label {
  color: #888;
  font-weight: 500;
}

.timeline-item {
  position: relative;
  padding: 6px 20px;
  border-bottom: 1px dashed #e0e0e0;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-content {
  background: transparent;
  padding: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-header .title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.timeline-header .time {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.timeline-content p {
  font-size: 13px;
  line-height: 1.8;
  margin: 4px 0;
  color: #555;
}

.timeline-content .desc {
  color: #666;
  line-height: 1.9;
}

.section > .timeline-item,
.section > div > .timeline-item {
  padding-top: 8px;
  padding-bottom: 8px;
}

.section > *:not(h3) {
  padding: 8px 20px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 20px;
}

.skill-tag {
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(74, 158, 255, 0.12));
  color: #5eead4;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(0, 212, 170, 0.35);
  box-shadow: 0 2px 8px rgba(0, 212, 170, 0.15);
  transition: all 0.25s ease;
}

.skill-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.35);
}

.skill-detail {
  margin-top: 12px;
}

.no-data {
  color: #aaa;
  font-size: 13px;
  padding: 16px 20px;
  font-style: italic;
  margin: 0;
}

.hidden-input {
  display: none;
}

.photo-upload {
  width: 120px;
  height: 160px;
  border: 2px dashed rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.photo-upload:hover {
  border-color: rgba(74, 158, 255, 0.8);
  background: rgba(74, 158, 255, 0.05);
}

.basic-form-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.basic-form-fields {
  flex: 1;
}

.basic-form-photo {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.basic-form-photo label {
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(74, 158, 255, 0.6);
  font-size: 12px;
}

.photo-placeholder span {
  margin-top: 8px;
}

.basic-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-content {
  flex: 1;
}

.personal-header {
  margin-bottom: 8px;
}

.name-title h2 {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  margin: 0 0 4px 0;
}

.name-title p {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  margin: 0;
}

.photo-section {
  flex-shrink: 0;
}

.resume-photo {
  width: 120px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.photo-placeholder-resume {
  width: 120px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e9ecef;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
}

.info-grid div {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}

.info-grid .email-item {
  grid-column: 1 / -1;
}

.info-grid .email-text {
  word-break: break-all;
}

@media print {
  .resume-modal {
    position: static;
    background: transparent;
    backdrop-filter: none;
  }
  
  .resume-container {
    box-shadow: none;
    max-height: none;
  }
  
  .close-btn {
    display: none;
  }
}
</style>
