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
          <button class="save-btn" @click="handleSaveNext">保存并下一步</button>
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

        <div class="ai-title">个人优势提炼</div>

        <div class="ai-tabs">
          <div 
            v-for="(tab, index) in aiTabs" 
            :key="index" 
            class="ai-tab"
            :class="{ active: activeAiTab === index }"
            @click="activeAiTab = index"
          >
            {{ tab }}
          </div>
        </div>

        <div class="ai-suggestions">
          <div class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
            <div class="suggestion-icon">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#00d4aa"/>
              </svg>
            </div>
            <span>{{ item }}</span>
          </div>
        </div>

        <button class="generate-btn" @click="generateResume">生成简历</button>
      </div>
    </div>
  </div>

  <div v-if="showResume" class="resume-modal" @click.self="closeResume">
    <div class="resume-container">
      <div class="resume-header">
        <h2>个人简历</h2>
        <div class="resume-actions">
          <button class="export-btn" @click="exportWordResume">导出简历</button>
          <button class="close-btn" @click="closeResume">×</button>
        </div>
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
                  <div><span class="label">邮箱：</span>{{ formData.email }}@{{ formData.emailType || '' }}.com</div>
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
                <p v-if="formData.honors" class="desc"><span class="label">在校荣誉：</span>{{ formData.honors }}</p>
                <p v-if="formData.courses" class="desc"><span class="label">主修课程：</span>{{ formData.courses }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>工作经历</h3>
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
            <h3>项目经历</h3>
            <div v-if="formData.projects && formData.projects.length > 0">
              <div v-for="(project, index) in formData.projects" :key="index" class="timeline-item" v-show="project.name">
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="title">项目{{ index + 1 }}：{{ project.name || '未命名项目' }}</span>
                    <span class="time">{{ project.period || '' }}</span>
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
            <div v-if="formData.skillName" class="skill-detail">
              <p><span class="label">技能：</span>{{ formData.skillName }} | 熟练度：{{ formData.skillLevel || '未填写' }} | 使用年限：{{ formData.skillYears || '未填写' }}年</p>
            </div>
          </div>

          <div class="section">
            <h3>个人优势</h3>
            <p v-if="formData.strengths" class="desc">{{ formData.strengths }}</p>
            <p v-else class="no-data">暂无个人优势描述</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}

const currentStep = ref(3)
const activeAiTab = ref(0)

const steps = ['基础信息', '教育经历', '工作经历', '技能优势']

const aiTabs = ['经历话术优化', '岗位匹配建议']

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
      result.push('请先完善基础信息，包括姓名和求职意向')
    } else {
      result.push(`求职意向：${data.intention}，建议围绕该方向展开`)
    }
    
    if (!hasEducation) {
      result.push('教育经历：请填写学历、院校和专业信息')
    } else {
      const eduMap = { '本科': '符合多数岗位要求', '硕士': '竞争力较强', '博士': '学术背景优秀', '大专': '建议突出实践经验' }
      result.push(`学历${data.education}(${eduMap[data.education] || '良好'})，专业${data.major}`)
    }
    
    if (!hasWork) {
      result.push('工作经历：请详细描述岗位职责和业绩')
    } else {
      if (!data.achievements) {
        result.push(`工作经历：${data.position}，建议补充量化业绩（如：提升效率XX%）`)
      } else {
        result.push(`工作经历完善，建议突出核心成果`)
      }
    }
    
    if (!hasSkills) {
      result.push('技能优势：请添加您掌握的技能标签')
    } else {
      const skillCount = data.skills.length
      if (skillCount >= 5) {
        result.push(`已识别${skillCount}项技能，建议重点突出3-5项核心技能`)
      } else {
        result.push(`已识别${skillCount}项技能，建议继续补充`)
      }
    }
    
    if (!hasProjects) {
      result.push('项目经历：建议添加至少一个有代表性的项目')
    } else {
      data.projects.forEach((project, index) => {
        if (project.name && project.desc && project.achievements) {
          result.push(`项目${index + 1}(${project.name})：信息完整`)
        } else {
          if (!project.name) result.push(`项目${index + 1}：请填写项目名称`)
          if (!project.desc) result.push(`项目${index + 1}：请描述项目内容`)
          if (!project.achievements) result.push(`项目${index + 1}：请量化项目成果`)
        }
      })
    }
    
    if (!data.strengths) {
      result.push('个人优势：请总结您的核心竞争力')
    } else {
      result.push('个人优势已填写，建议简洁有力')
    }
    
    const completionRate = calculateCompletionRate()
    result.push(`简历完整度：${completionRate}%`)
    
    return result
  } else {
    const result = []
    
    if (!data.intention) {
      result.push('请先选择求职意向')
    } else {
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
      
      if (data.skills && data.skills.length > 0) {
        const matchedSkills = requiredSkills.filter(s => data.skills.includes(s))
        const matchRate = Math.round((matchedSkills.length / requiredSkills.length) * 100)
        
        if (matchRate >= 80) {
          result.push(`技能匹配度：${matchRate}%，非常优秀！`)
        } else if (matchRate >= 50) {
          result.push(`技能匹配度：${matchRate}%，还需补充部分技能`)
        } else {
          result.push(`技能匹配度：${matchRate}%，建议补充核心技能`)
        }
        
        if (matchedSkills.length > 0) {
          result.push(`已匹配技能：${matchedSkills.join('、')}`)
        }
        
        const missingSkills = requiredSkills.filter(s => !data.skills.includes(s))
        if (missingSkills.length > 0) {
          result.push(`推荐学习：${missingSkills.slice(0, 3).join('、')}`)
        }
      } else {
        result.push(`该岗位热门技能：${requiredSkills.slice(0, 5).join('、')}`)
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
        result.push(`经验匹配：${data.experience}(${expMap[data.experience]})`)
      }
      
      if (data.education) {
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
          result.push(`学历符合岗位要求：${data.education}`)
        } else {
          result.push(`建议补充相关学历背景或突出实践经验`)
        }
      }
      
      if (data.residence) {
        result.push(`工作地点：${data.residence}，将匹配当地岗位`)
      }
    }
    
    return result.length > 0 ? result : ['正在为您匹配最佳岗位...']
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
  localStorage.setItem('resumeData', JSON.stringify(formData.value))
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const showResume = ref(false)

const generateResume = () => {
  localStorage.setItem('resumeData', JSON.stringify(formData.value))
  showResume.value = true
}

const closeResume = () => {
  showResume.value = false
}

const exportWordResume = async () => {
  const data = formData.value
  
  const createSectionTitle = (title) => new Paragraph({
    spacing: {
      after: 300,
      before: 400
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        font: '黑体'
      })
    ],
    heading: HeadingLevel.HEADING_2
  })

  const createLabelText = (label, value) => new Paragraph({
    children: [
      new TextRun({ text: label, bold: true }),
      new TextRun({ text: value })
    ]
  })

  const sectionChildren = []

  sectionChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: {
      after: 400
    },
    children: [
      new TextRun({
        text: '个人简历',
        bold: true,
        size: 36,
        font: '黑体'
      })
    ]
  }))

  sectionChildren.push(createSectionTitle('基本信息'))

  sectionChildren.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '姓名', bold: true })] })]
          }),
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            children: [new Paragraph({ text: data.name || '' })]
          }),
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '性别', bold: true })] })]
          }),
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            children: [new Paragraph({ text: data.gender || '' })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '年龄', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.age || '' })] }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '籍贯', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.origin || '' })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '现居地', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.residence || '' })] }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '求职意向', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.intention || '' })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '联系电话', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.phone || '' })] }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '邮箱', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.email ? `${data.email}@${data.emailType || ''}.com` : '' })] })
        ]
      })
    ]
  }))

  sectionChildren.push(createSectionTitle('教育背景'))

  sectionChildren.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '院校', bold: true })] })]
          }),
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '专业', bold: true })] })]
          }),
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '学历', bold: true })] })]
          }),
          new TableCell({
            width: { size: 2500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '时间', bold: true })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: data.school || '' })] }),
          new TableCell({ children: [new Paragraph({ text: data.major || '' })] }),
          new TableCell({ children: [new Paragraph({ text: `${data.education || ''}${data.degree ? `(${data.degree})` : ''}` })] }),
          new TableCell({ children: [new Paragraph({ text: `${data.schoolStart || ''} - ${data.schoolEnd || ''}` })] })
        ]
      })
    ]
  }))

  if (data.honors) {
    sectionChildren.push(createLabelText('在校荣誉：', data.honors))
  }
  if (data.courses) {
    sectionChildren.push(createLabelText('主修课程：', data.courses))
  }

  sectionChildren.push(createSectionTitle('工作经历'))

  sectionChildren.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '公司', bold: true })] })]
          }),
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '职位', bold: true })] })]
          }),
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '行业', bold: true })] })]
          }),
          new TableCell({
            width: { size: 2500, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
            children: [new Paragraph({ children: [new TextRun({ text: '时间', bold: true })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: data.company || '' })] }),
          new TableCell({ children: [new Paragraph({ text: data.position || '' })] }),
          new TableCell({ children: [new Paragraph({ text: data.industry || '' })] }),
          new TableCell({ children: [new Paragraph({ text: `${data.workStart || ''} - ${data.workEnd || ''}` })] })
        ]
      })
    ]
  }))

  if (data.responsibilities) {
    sectionChildren.push(createLabelText('岗位职责：', data.responsibilities))
  }
  if (data.achievements) {
    sectionChildren.push(createLabelText('工作业绩：', data.achievements))
  }

  sectionChildren.push(createSectionTitle('项目经历'))

  if (data.projects && data.projects.length > 0) {
    data.projects.filter(p => p.name).forEach((project, index) => {
      sectionChildren.push(new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: `项目${index + 1}：${project.name}`, bold: true, size: 20 })]
      }))
      
      sectionChildren.push(new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
                children: [new Paragraph({ children: [new TextRun({ text: '角色', bold: true })] })]
              }),
              new TableCell({
                width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ text: project.role || '' })]
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                shading: { type: ShadingType.SOLID, color: '#f0f0f0' },
                children: [new Paragraph({ children: [new TextRun({ text: '周期', bold: true })] })]
              }),
              new TableCell({ children: [new Paragraph({ text: project.duration || '' })] })
            ]
          })
        ]
      }))

      if (project.desc) {
        sectionChildren.push(createLabelText('项目描述：', project.desc))
      }
      if (project.achievements) {
        sectionChildren.push(createLabelText('项目成果：', project.achievements))
      }
    })
  } else {
    sectionChildren.push(new Paragraph({
      text: '暂无项目经历',
      children: [new TextRun({ text: '暂无项目经历', color: '#999999' })]
    }))
  }

  sectionChildren.push(createSectionTitle('专业技能'))

  if (data.skills && data.skills.length > 0) {
    sectionChildren.push(new Paragraph({ text: data.skills.join('、') }))
  } else {
    sectionChildren.push(new Paragraph({
      children: [new TextRun({ text: '暂无技能信息', color: '#999999' })]
    }))
  }

  sectionChildren.push(createSectionTitle('个人优势'))

  if (data.strengths) {
    sectionChildren.push(new Paragraph({ text: data.strengths }))
  } else {
    sectionChildren.push(new Paragraph({
      children: [new TextRun({ text: '暂无个人优势描述', color: '#999999' })]
    }))
  }

  const doc = new Document({
    styles: {
      default: {
        paragraph: {
          spacing: { after: 200, line: 240 },
          run: { font: '宋体', size: 20 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margins: { top: 1417, right: 1417, bottom: 1417, left: 1417 }
        }
      },
      children: sectionChildren.filter(item => item)
    }]
  })

  const buffer = await Packer.toBlob(doc)
  const url = URL.createObjectURL(buffer)
  const link = document.createElement('a')
  link.href = url
  link.download = `${data.name || '简历'}_个人简历.docx`
  link.click()
  URL.revokeObjectURL(url)
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

onMounted(() => {
  const canvas = bgCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

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
})

onUnmounted(() => {
  if (bgAnimationId) {
    cancelAnimationFrame(bgAnimationId)
  }
})
</script>

<style scoped>
.ai-resume-page {
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
}

.step-nav {
  width: 180px;
  background: rgba(10, 20, 45, 0.5);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
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
  overflow: hidden;
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
}

.save-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #4a9eff 0%, #00d4aa 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.6);
}

.ai-section {
  width: 320px;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.ai-section::before {
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

.ai-title {
  color: rgba(150, 180, 220, 0.7);
  font-size: 14px;
  margin-bottom: 15px;
}

.ai-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.ai-tab {
  flex: 1;
  padding: 8px;
  background: rgba(15, 25, 55, 0.6);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 8px;
  color: rgba(150, 180, 220, 0.6);
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-tab:hover {
  border-color: rgba(74, 158, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.ai-tab.active {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.3) 0%, rgba(0, 212, 170, 0.2) 100%);
  border-color: rgba(74, 158, 255, 0.5);
  color: #fff;
}

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(15, 25, 55, 0.6);
  border-radius: 8px;
}

.suggestion-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-item span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.generate-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #a855f7 0%, #4a9eff 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
  transition: all 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
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
  width: 800px;
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
  background: linear-gradient(135deg, #4a9eff 0%, #3d7eff 100%);
  color: #fff;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.resume-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.resume-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.export-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.resume-content {
  padding: 32px;
}

.resume-main {
  color: #333;
}

.section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-left: 12px;
  border-left: 4px solid #4a9eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-grid div {
  font-size: 14px;
  line-height: 1.8;
}

.label {
  color: #7f8c8d;
  font-weight: 500;
}

.timeline-item {
  position: relative;
  padding-left: 24px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 12px;
  height: 12px;
  background: #4a9eff;
  border-radius: 50%;
  border: 3px solid #e8f4fd;
}

.timeline-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header .title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.timeline-header .time {
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 500;
}

.timeline-content p {
  font-size: 14px;
  line-height: 1.8;
  margin: 6px 0;
  color: #555;
}

.timeline-content .desc {
  color: #666;
  line-height: 1.9;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: linear-gradient(135deg, #e8f4fd 0%, #d4eafc 100%);
  color: #4a9eff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #cce5ff;
}

.skill-detail {
  margin-top: 12px;
}

.no-data {
  color: #95a5a6;
  font-size: 14px;
  font-style: italic;
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
  padding: 24px;
  border-radius: 8px;
}

.info-content {
  flex: 1;
}

.personal-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #4a9eff;
}

.name-title h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.name-title p {
  font-size: 16px;
  color: #4a9eff;
  font-weight: 600;
  margin: 0;
}

.photo-section {
  flex-shrink: 0;
}

.resume-photo {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-placeholder-resume {
  width: 120px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e9ecef;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-grid div {
  font-size: 14px;
  line-height: 1.8;
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
