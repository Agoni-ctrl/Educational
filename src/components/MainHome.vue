<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import SiteNav from "./layout/SiteNav.vue";

const mouse = ref({ x: 0.5, y: 0.5 });

// 7张界面示例数据（带功能说明）
const showcaseItems = [
  {
    id: 1,
    type: "chat",
    title: "AI 备课助手",
    icon: "💬",
    description: "与AI对话，快速生成教学方案",
    messages: [
      { type: "ai", text: "您好！请告诉我今天的教学目标", avatar: "🤖" },
      { type: "user", text: "讲解牛顿第二定律", avatar: "👨‍🏫" },
      { type: "ai", text: "好的，需要配合实验演示吗？", avatar: "🤖" },
    ],
    showTyping: true,
  },
  {
    id: 2,
    type: "chat",
    title: "学情分析助手",
    icon: "📊",
    description: "智能分析学生数据，精准定位薄弱点",
    messages: [
      { type: "ai", text: "正在分析班级上次测验数据...", avatar: "📊" },
      { type: "ai", text: "发现 68% 学生对力的合成理解有困难", avatar: "💡" },
      { type: "user", text: "帮我调整一下教学重点", avatar: "👨‍🏫" },
    ],
    showTyping: false,
  },
  {
    id: 3,
    type: "chat",
    title: "课件优化建议",
    icon: "✨",
    description: "AI智能诊断，一键优化课件质量",
    messages: [
      { type: "user", text: "帮我优化这个课件", avatar: "👨‍🏫" },
      { type: "ai", text: "已分析您的课件，建议：", avatar: "🤖" },
      {
        type: "ai",
        text: "1. 增加互动问答环节\n2. 补充生活实例",
        avatar: "✨",
      },
    ],
    showTyping: false,
  },
  {
    id: 4,
    type: "chat",
    title: "作业批改助手",
    icon: "📝",
    description: "自动批改作业，生成错题讲解",
    messages: [
      { type: "ai", text: "已批改完 45 份作业", avatar: "✅" },
      { type: "ai", text: "共发现 3 个典型错误，需要讲解", avatar: "📝" },
      { type: "user", text: "生成错题讲解课件", avatar: "👨‍🏫" },
    ],
    showTyping: true,
  },
  {
    id: 5,
    type: "upload",
    title: "资料融合",
    icon: "📎",
    description: "上传教材资料，AI智能提取整合",
  },
  {
    id: 6,
    type: "ppt",
    title: "课件预览",
    icon: "📑",
    description: "精美课件实时预览，支持在线编辑",
  },
  {
    id: 7,
    type: "doc",
    title: "教案编辑",
    icon: "📄",
    description: "结构化教案编辑，规范备课流程",
  },
];

const currentIndex = ref(0);
const isAnimating = ref(false);
const progress = ref(0);
let autoPlayTimer = null;
let progressTimer = null;
const AUTO_PLAY_INTERVAL = 4000; // 4秒切换

function nextSlide() {
  if (isAnimating.value) return;
  isAnimating.value = true;
  currentIndex.value = (currentIndex.value + 1) % showcaseItems.length;
  progress.value = 0;
  setTimeout(() => {
    isAnimating.value = false;
  }, 600);
}

function goToSlide(index) {
  if (isAnimating.value || index === currentIndex.value) return;
  isAnimating.value = true;
  currentIndex.value = index;
  progress.value = 0;
  setTimeout(() => {
    isAnimating.value = false;
  }, 600);
}

function startAutoPlay() {
  progress.value = 0;
  progressTimer = setInterval(() => {
    progress.value += 100 / (AUTO_PLAY_INTERVAL / 50);
    if (progress.value >= 100) progress.value = 0;
  }, 50);
  autoPlayTimer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

const lessonHighlights = [
  { value: "4 步", label: "互动生成闭环" },
  { value: "6 类", label: "多模态资料融合" },
  { value: "1 份", label: "课件与教案同步产出" },
];

const materialCards = [
  { type: "PDF", title: "教材章节", meta: "已提炼知识结构" },
  { type: "IMG", title: "实验图片", meta: "转为课件视觉素材" },
  { type: "DOC", title: "校本模板", meta: "保留学校格式" },
];

const workflowSteps = ["理解意图", "融合资料", "生成初稿", "反馈迭代"];

function onPointerMove(e) {
  mouse.value = {
    x: e.clientX / window.innerWidth,
    y: e.clientY / window.innerHeight,
  };
}

onMounted(() => {
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  startAutoPlay();
});

onUnmounted(() => {
  window.removeEventListener("pointermove", onPointerMove);
  stopAutoPlay();
});
</script>

<template>
  <div class="home">
    <div class="aurora" aria-hidden="true">
      <div
        class="aurora__blob aurora__blob--1"
        :style="{
          transform: `translate(${(mouse.x - 0.5) * 36}px, ${(mouse.y - 0.5) * 28}px)`,
        }"
      />
      <div
        class="aurora__blob aurora__blob--2"
        :style="{
          transform: `translate(${(mouse.x - 0.5) * -44}px, ${(mouse.y - 0.5) * -32}px)`,
        }"
      />
      <div class="aurora__blob aurora__blob--3" />
      <div class="aurora__mesh" />
      <div class="aurora__grain" />
    </div>

    <SiteNav />

    <main class="hero">
      <div class="hero__inner">
        <div class="hero__copy">
          <p class="hero__eyebrow reveal" style="--i: 0">
            <span class="pulse" />
            知启灵枢：多模态 AI 互动式教学智能体
          </p>

          <h1 class="hero__title reveal" style="--i: 1">
            让教师回归<br />
            <em>教学设计师</em>
          </h1>

          <p class="hero__lead reveal" style="--i: 2">
            告别熬夜做课件的繁琐。您只需告诉我们教学思路，即可为您生成专业的 PPT
            与教案初稿。从素材搜集到排版美化，我们帮您搞定，让您专注于课堂本身。
          </p>

          <div
            class="lesson-stats reveal"
            style="--i: 3"
            aria-label="教学智能体能力概览"
          >
            <article
              v-for="item in lessonHighlights"
              :key="item.label"
              class="lesson-stat"
            >
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </article>
          </div>

          <div class="hero__cta reveal" style="--i: 4">
            <RouterLink to="/assistant" class="btn btn--dark btn--lg">
              立即体验 AI 助手
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </RouterLink>
            <RouterLink to="/features" class="btn btn--ghost btn--lg"
              >了解核心功能</RouterLink
            >
          </div>
        </div>

        <div class="hero__stage reveal" style="--i: 2">
          <div
            class="showcase-wrapper"
            @mouseenter="stopAutoPlay"
            @mouseleave="startAutoPlay"
          >
            <!-- 扑克牌堆叠展示 -->
            <div class="card-stack">
              <div
                v-for="(item, index) in showcaseItems"
                :key="item.id"
                class="stack-card"
                :class="{
                  'stack-card--active': index === currentIndex,
                  'stack-card--behind':
                    index !== currentIndex &&
                    (index - currentIndex + showcaseItems.length) %
                      showcaseItems.length >=
                      4,
                }"
              >
                <!-- AI备课助手 - 完整工作台 -->
                <div
                  v-if="item.type === 'chat' && item.id === 1"
                  class="ui-mockup ui-mockup--workspace"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">AI 备课工作台</span>
                  </div>
                  <div class="workspace-body">
                    <div class="workspace-sidebar">
                      <div class="sidebar-section">
                        <div class="sidebar-title">备课任务</div>
                        <div class="task-item task-item--active">
                          <span class="task-icon">📝</span>
                          <span class="task-name">牛顿第二定律</span>
                          <span class="task-status">进行中</span>
                        </div>
                        <div class="task-item">
                          <span class="task-icon">📊</span>
                          <span class="task-name">力学综合复习</span>
                          <span class="task-status">待开始</span>
                        </div>
                      </div>
                      <div class="sidebar-section">
                        <div class="sidebar-title">快速生成</div>
                        <div class="quick-actions">
                          <button class="quick-btn">📑 课件</button>
                          <button class="quick-btn">📄 教案</button>
                          <button class="quick-btn">✏️ 习题</button>
                        </div>
                      </div>
                    </div>
                    <div class="workspace-main">
                      <div class="chat-area">
                        <div class="chat-bubble chat-bubble--ai">
                          <div class="chat-avatar">🤖</div>
                          <div class="chat-text">
                            <div class="chat-title">备课助手</div>
                            您好！我已为您准备好《牛顿第二定律》的教学资源包，包含课件、教案和实验视频。
                          </div>
                        </div>
                        <div class="generated-preview">
                          <div class="preview-card">
                            <div class="preview-icon">📑</div>
                            <div class="preview-info">
                              <div class="preview-name">课件.pptx</div>
                              <div class="preview-meta">12页 · 预计45分钟</div>
                            </div>
                            <button class="preview-btn">查看</button>
                          </div>
                          <div class="preview-card">
                            <div class="preview-icon">📄</div>
                            <div class="preview-info">
                              <div class="preview-name">教案.docx</div>
                              <div class="preview-meta">完整教学设计</div>
                            </div>
                            <button class="preview-btn">查看</button>
                          </div>
                        </div>
                        <div class="chat-bubble chat-bubble--user">
                          <div class="chat-avatar">👨‍🏫</div>
                          <div class="chat-text">帮我增加一个互动实验环节</div>
                        </div>
                      </div>
                      <div class="input-area">
                        <input
                          type="text"
                          placeholder="输入教学需求，AI帮您生成..."
                          class="chat-input"
                        />
                        <button class="send-btn">➤</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 学情分析助手 - 数据仪表盘 -->
                <div
                  v-if="item.type === 'chat' && item.id === 2"
                  class="ui-mockup ui-mookup--dashboard"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">学情分析中心</span>
                  </div>
                  <div class="dashboard-body">
                    <div class="stats-row">
                      <div class="stat-card-mini">
                        <div class="stat-value">87%</div>
                        <div class="stat-label">平均正确率</div>
                        <div class="stat-trend trend-up">↑ 5%</div>
                      </div>
                      <div class="stat-card-mini">
                        <div class="stat-value">12</div>
                        <div class="stat-label">待关注学生</div>
                        <div class="stat-trend trend-down">↓ 3人</div>
                      </div>
                      <div class="stat-card-mini">
                        <div class="stat-value">68%</div>
                        <div class="stat-label">力的合成</div>
                        <div class="stat-trend trend-warn">⚠️ 薄弱</div>
                      </div>
                    </div>
                    <div class="analysis-content">
                      <div class="analysis-section">
                        <div class="section-header">
                          <span class="section-icon">📊</span>
                          <span class="section-title">知识点掌握情况</span>
                        </div>
                        <div class="knowledge-bars">
                          <div class="knowledge-item">
                            <span class="knowledge-name">牛顿第一定律</span>
                            <div class="knowledge-bar">
                              <div
                                class="knowledge-fill"
                                style="width: 92%"
                              ></div>
                            </div>
                            <span class="knowledge-percent">92%</span>
                          </div>
                          <div class="knowledge-item">
                            <span class="knowledge-name">力的合成</span>
                            <div class="knowledge-bar">
                              <div
                                class="knowledge-fill fill-warn"
                                style="width: 68%"
                              ></div>
                            </div>
                            <span class="knowledge-percent">68%</span>
                          </div>
                          <div class="knowledge-item">
                            <span class="knowledge-name">牛顿第二定律</span>
                            <div class="knowledge-bar">
                              <div
                                class="knowledge-fill fill-avg"
                                style="width: 78%"
                              ></div>
                            </div>
                            <span class="knowledge-percent">78%</span>
                          </div>
                        </div>
                      </div>
                      <div class="analysis-section">
                        <div class="section-header">
                          <span class="section-icon">💡</span>
                          <span class="section-title">AI 教学建议</span>
                        </div>
                        <div class="suggestion-list">
                          <div class="suggestion-item">
                            <span class="suggestion-priority priority-high"
                              >高</span
                            >
                            <span class="suggestion-text"
                              >力的合成需增加2课时练习</span
                            >
                          </div>
                          <div class="suggestion-item">
                            <span class="suggestion-priority priority-medium"
                              >中</span
                            >
                            <span class="suggestion-text"
                              >为12名学生推送个性化习题</span
                            >
                          </div>
                        </div>
                        <button class="action-btn">生成针对性课件</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 课件优化建议 - 智能诊断 -->
                <div
                  v-if="item.type === 'chat' && item.id === 3"
                  class="ui-mockup ui-mockup--optimize"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">课件智能诊断</span>
                  </div>
                  <div class="optimize-body">
                    <div class="score-circle">
                      <div class="score-value">78</div>
                      <div class="score-label">综合评分</div>
                    </div>
                    <div class="optimize-sections">
                      <div class="optimize-card optimize-card--success">
                        <div class="optimize-header">
                          <span class="optimize-icon">✅</span>
                          <span class="optimize-title">内容完整性</span>
                          <span class="optimize-score">95分</span>
                        </div>
                        <div class="optimize-desc">
                          教学目标、重难点、过程设计完整
                        </div>
                      </div>
                      <div class="optimize-card optimize-card--warning">
                        <div class="optimize-header">
                          <span class="optimize-icon">⚠️</span>
                          <span class="optimize-title">互动设计</span>
                          <span class="optimize-score">65分</span>
                        </div>
                        <div class="optimize-desc">
                          建议增加：课堂提问3处、小组讨论1次
                        </div>
                        <button class="fix-btn">一键优化</button>
                      </div>
                      <div class="optimize-card optimize-card--info">
                        <div class="optimize-header">
                          <span class="optimize-icon">💡</span>
                          <span class="optimize-title">多媒体素材</span>
                          <span class="optimize-score">74分</span>
                        </div>
                        <div class="optimize-desc">
                          可补充：实验演示视频、生活案例图片
                        </div>
                        <button class="fix-btn">智能推荐</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 作业批改助手 - 批改工作台 -->
                <div
                  v-if="item.type === 'chat' && item.id === 4"
                  class="ui-mockup ui-mockup--grading"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">智能批改中心</span>
                  </div>
                  <div class="grading-body">
                    <div class="grading-stats">
                      <div class="grading-progress">
                        <div class="progress-ring">
                          <div class="progress-value">45/45</div>
                          <div class="progress-label">已批改</div>
                        </div>
                      </div>
                      <div class="grading-summary">
                        <div class="summary-item">
                          <span class="summary-label">平均分</span>
                          <span class="summary-value">82.5</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">优秀率</span>
                          <span class="summary-value">35%</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">及格率</span>
                          <span class="summary-value">93%</span>
                        </div>
                      </div>
                    </div>
                    <div class="error-analysis">
                      <div class="analysis-title">典型错误分析</div>
                      <div class="error-list">
                        <div class="error-item">
                          <div class="error-rank">1</div>
                          <div class="error-content">
                            <div class="error-name">受力分析遗漏摩擦力</div>
                            <div class="error-count">18人出错 (40%)</div>
                          </div>
                          <button class="error-btn">生成讲解</button>
                        </div>
                        <div class="error-item">
                          <div class="error-rank">2</div>
                          <div class="error-content">
                            <div class="error-name">加速度方向判断错误</div>
                            <div class="error-count">12人出错 (27%)</div>
                          </div>
                          <button class="error-btn">生成讲解</button>
                        </div>
                        <div class="error-item">
                          <div class="error-rank">3</div>
                          <div class="error-content">
                            <div class="error-name">单位换算错误</div>
                            <div class="error-count">8人出错 (18%)</div>
                          </div>
                          <button class="error-btn">生成讲解</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 资料融合 - 资源库 -->
                <div
                  v-if="item.type === 'upload'"
                  class="ui-mockup ui-mockup--resource"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">智能资源库</span>
                  </div>
                  <div class="resource-body">
                    <div class="resource-toolbar">
                      <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="搜索教学资源..."
                          class="search-input"
                        />
                      </div>
                      <button class="upload-btn">+ 上传资料</button>
                    </div>
                    <div class="resource-categories">
                      <button class="category-btn category-btn--active">
                        全部
                      </button>
                      <button class="category-btn">课件</button>
                      <button class="category-btn">教案</button>
                      <button class="category-btn">试题</button>
                      <button class="category-btn">视频</button>
                    </div>
                    <div class="resource-grid">
                      <div class="resource-card">
                        <div class="resource-thumb">📑</div>
                        <div class="resource-info">
                          <div class="resource-name">牛顿定律课件</div>
                          <div class="resource-meta">PPT · 2.3MB · 昨天</div>
                        </div>
                        <div class="resource-actions">
                          <button class="action-icon">✏️</button>
                          <button class="action-icon">📤</button>
                        </div>
                      </div>
                      <div class="resource-card">
                        <div class="resource-thumb resource-thumb--doc">📄</div>
                        <div class="resource-info">
                          <div class="resource-name">力学实验教案</div>
                          <div class="resource-meta">DOC · 856KB · 3天前</div>
                        </div>
                        <div class="resource-actions">
                          <button class="action-icon">✏️</button>
                          <button class="action-icon">📤</button>
                        </div>
                      </div>
                      <div class="resource-card">
                        <div class="resource-thumb resource-thumb--video">
                          🎬
                        </div>
                        <div class="resource-info">
                          <div class="resource-name">斜面实验演示</div>
                          <div class="resource-meta">MP4 · 15.6MB · 上周</div>
                        </div>
                        <div class="resource-actions">
                          <button class="action-icon">▶️</button>
                          <button class="action-icon">📤</button>
                        </div>
                      </div>
                      <div class="resource-card resource-card--new">
                        <div class="resource-thumb resource-thumb--ai">🤖</div>
                        <div class="resource-info">
                          <div class="resource-name">AI生成的习题集</div>
                          <div class="resource-meta">PDF · AI生成 · 刚刚</div>
                        </div>
                        <div class="resource-actions">
                          <button class="action-icon">👁️</button>
                          <button class="action-icon">💾</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- PPT预览界面 -->
                <div
                  v-if="item.type === 'ppt'"
                  class="ui-mockup ui-mockup--ppt"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">课件预览 - 牛顿第二定律</span>
                  </div>
                  <div class="mockup-body">
                    <div class="ppt-container">
                      <!-- 左侧缩略图导航 -->
                      <div class="ppt-sidebar">
                        <div class="ppt-thumb ppt-thumb--active">
                          <div class="thumb-page">1</div>
                          <div class="thumb-title">封面</div>
                        </div>
                        <div class="ppt-thumb">
                          <div class="thumb-page">2</div>
                          <div class="thumb-title">学习目标</div>
                        </div>
                        <div class="ppt-thumb">
                          <div class="thumb-page">3</div>
                          <div class="thumb-title">实验演示</div>
                        </div>
                        <div class="ppt-thumb">
                          <div class="thumb-page">4</div>
                          <div class="thumb-title">公式推导</div>
                        </div>
                        <div class="ppt-thumb">
                          <div class="thumb-page">5</div>
                          <div class="thumb-title">例题讲解</div>
                        </div>
                      </div>

                      <!-- 主幻灯片区域 -->
                      <div class="ppt-main">
                        <div class="ppt-slide-content">
                          <div class="slide-header">
                            <span class="slide-badge">高中物理 · 必修一</span>
                            <span class="slide-time">预计 45 分钟</span>
                          </div>
                          <div class="slide-title">牛顿第二定律</div>
                          <div class="slide-subtitle">力与运动的定量关系</div>

                          <div class="slide-formula">
                            <div class="formula-box">
                              <span class="formula-text">F = ma</span>
                              <span class="formula-desc"
                                >物体的加速度与所受合力成正比，与质量成反比</span
                              >
                            </div>
                          </div>

                          <div class="slide-keypoints">
                            <div class="keypoint">
                              <span class="keypoint-icon">📐</span>
                              <span class="keypoint-text"
                                >矢量性：F与a方向相同</span
                              >
                            </div>
                            <div class="keypoint">
                              <span class="keypoint-icon">⚖️</span>
                              <span class="keypoint-text"
                                >瞬时性：力变加速度立即变</span
                              >
                            </div>
                            <div class="keypoint">
                              <span class="keypoint-icon">🌍</span>
                              <span class="keypoint-text"
                                >独立性：每个力独立产生加速度</span
                              >
                            </div>
                          </div>

                          <div class="slide-footer">
                            <div class="slide-tags">
                              <span class="slide-tag">重点</span>
                              <span class="slide-tag">实验</span>
                              <span class="slide-tag">计算</span>
                            </div>
                            <div class="slide-nav">
                              <span class="nav-btn">◀</span>
                              <span class="nav-page">1 / 12</span>
                              <span class="nav-btn nav-btn--primary">▶</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 右侧工具栏 -->
                      <div class="ppt-toolbar">
                        <div class="toolbar-btn toolbar-btn--active">🎨</div>
                        <div class="toolbar-btn">📝</div>
                        <div class="toolbar-btn">🖼️</div>
                        <div class="toolbar-btn">📊</div>
                        <div class="toolbar-divider"></div>
                        <div class="toolbar-btn">💾</div>
                        <div class="toolbar-btn">📤</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 教案编辑界面 -->
                <div
                  v-if="item.type === 'doc'"
                  class="ui-mockup ui-mockup--doc"
                >
                  <div class="mockup-header">
                    <span class="mockup-dot" /><span class="mockup-dot" /><span
                      class="mockup-dot"
                    />
                    <span class="mockup-title">教案编辑</span>
                  </div>
                  <div class="mockup-body">
                    <div class="doc-content">
                      <div class="doc-section">
                        <div class="doc-h1">一、教学目标</div>
                        <div class="doc-p">理解牛顿第二定律的物理意义...</div>
                      </div>
                      <div class="doc-section">
                        <div class="doc-h1">二、教学重点</div>
                        <div class="doc-p">力与加速度的关系</div>
                      </div>
                      <div class="doc-section">
                        <div class="doc-h1">三、教学过程</div>
                        <div class="doc-list">
                          <div class="doc-li">引入新课（5分钟）</div>
                          <div class="doc-li">实验演示（15分钟）</div>
                          <div class="doc-li">公式推导（10分钟）</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 功能提示信息 -->
            <div class="showcase-hint">
              <div class="hint-icon">
                {{ showcaseItems[currentIndex].icon }}
              </div>
              <div class="hint-content">
                <div class="hint-title">
                  {{ showcaseItems[currentIndex].title }}
                </div>
                <div class="hint-desc">
                  {{ showcaseItems[currentIndex].description }}
                </div>
              </div>
            </div>

            <!-- 简化的进度指示器 -->
            <div class="mini-dots">
              <div
                v-for="(item, index) in showcaseItems"
                :key="item.id"
                class="mini-dot"
                :class="{ 'mini-dot--active': index === currentIndex }"
                @click="goToSlide(index)"
              >
                <div
                  v-if="index === currentIndex"
                  class="mini-dot__progress"
                  :style="{ transform: `scaleX(${progress / 100})` }"
                />
              </div>
            </div>

            <!-- 使用引导 -->
            <div class="usage-guide">
              <div class="guide-item">
                <span class="guide-num">1</span>
                <span class="guide-text">选择功能模块</span>
              </div>
              <div class="guide-arrow">→</div>
              <div class="guide-item">
                <span class="guide-num">2</span>
                <span class="guide-text">输入教学需求</span>
              </div>
              <div class="guide-arrow">→</div>
              <div class="guide-item">
                <span class="guide-num">3</span>
                <span class="guide-text">AI生成内容</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--ink);
}

/* Aurora */
.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(168deg, #fafcff 0%, #eef5fc 42%, #f4f8fd 100%);
}

.aurora__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(88px);
  will-change: transform;
  transition: transform 0.45s var(--ease-out);
}

.aurora__blob--1 {
  width: 52vw;
  height: 52vw;
  max-width: 640px;
  max-height: 640px;
  top: -12%;
  right: -8%;
  background: radial-gradient(
    circle,
    rgba(0, 144, 255, 0.26) 0%,
    transparent 68%
  );
  animation: drift-a 20s ease-in-out infinite;
}

.aurora__blob--2 {
  width: 42vw;
  height: 42vw;
  max-width: 520px;
  max-height: 520px;
  bottom: 0;
  left: -10%;
  background: radial-gradient(
    circle,
    rgba(0, 194, 212, 0.2) 0%,
    transparent 70%
  );
  animation: drift-b 24s ease-in-out infinite;
}

.aurora__blob--3 {
  width: 32vw;
  height: 32vw;
  max-width: 400px;
  max-height: 400px;
  top: 42%;
  left: 42%;
  background: radial-gradient(
    circle,
    rgba(99, 179, 255, 0.16) 0%,
    transparent 72%
  );
  animation: drift-c 18s ease-in-out infinite reverse;
}

.aurora__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 75% 45% at 55% 0%,
      rgba(0, 119, 230, 0.08),
      transparent
    ),
    radial-gradient(
      ellipse 50% 35% at 95% 55%,
      rgba(0, 194, 212, 0.05),
      transparent
    );
}

.aurora__grain {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

/* Hero */
.hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 100px 28px 60px;
}

.hero__inner {
  max-width: 1180px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--accent);
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 var(--accent-glow);
  animation: pulse-ring 2s ease-out infinite;
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.625rem, 5.2vw, 4.125rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.045em;
  margin-bottom: 28px;
}

.hero__title em {
  font-style: normal;
  background: linear-gradient(102deg, #0077e6 0%, #00c2d4 52%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__lead {
  max-width: 500px;
  font-size: 1.0625rem;
  line-height: 1.78;
  color: var(--ink-soft);
  margin-bottom: 26px;
}

.lesson-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 560px;
  margin-bottom: 30px;
}

.lesson-stat {
  position: relative;
  padding: 14px 14px 13px;
  border: 1px solid rgba(10, 15, 26, 0.08);
  border-radius: 18px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.92),
      rgba(255, 255, 255, 0.54)
    ),
    radial-gradient(circle at 15% 10%, rgba(0, 194, 212, 0.14), transparent 42%);
  box-shadow: 0 14px 40px rgba(0, 87, 217, 0.07);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.lesson-stat::after {
  content: "";
  position: absolute;
  inset: auto 12px 0;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.5;
}

.lesson-stat strong {
  display: block;
  margin-bottom: 4px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1;
  color: var(--accent-deep);
}

.lesson-stat span {
  display: block;
  font-size: 0.76rem;
  line-height: 1.45;
  color: var(--ink-muted);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.25s var(--ease-spring),
    box-shadow 0.25s,
    background 0.25s;
  white-space: nowrap;
}

.btn--dark {
  background: var(--ink);
  color: #fff;
  box-shadow: 0 2px 10px rgba(10, 15, 26, 0.14);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(10, 15, 26, 0.18);
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.55);
  color: var(--ink);
  border: 1px solid var(--border-strong);
  backdrop-filter: blur(8px);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(10, 15, 26, 0.18);
}

.btn--lg {
  padding: 15px 26px;
  font-size: 0.95rem;
}

/* Float card */
.hero__stage {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Showcase Card Stack - Enhanced */
.showcase-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  padding: 24px;
}

.card-stack {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1.02;
  perspective: 1500px;
}

.stack-card {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.95) 100%
  );
  box-shadow:
    0 4px 20px -2px rgba(0, 87, 217, 0.08),
    0 8px 32px -4px rgba(0, 87, 217, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset,
    0 0 0 1px rgba(226, 232, 240, 0.4);
  transform-origin: center center;
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(1.1);
}

.stack-card--active {
  transform: translateY(0) rotate(0deg) scale(1);
  opacity: 1;
  z-index: 10;
  box-shadow:
    0 8px 32px -4px rgba(0, 87, 217, 0.12),
    0 16px 48px -8px rgba(0, 87, 217, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset,
    0 0 0 1px rgba(226, 232, 240, 0.4);
}

/* 非激活卡片的基础样式 - 更淡更轻 */
.stack-card:not(.stack-card--active) {
  transform: translateY(16px) translateX(-24px) rotate(-3deg) scale(0.94);
  opacity: 0.7;
  z-index: 5;
  box-shadow:
    0 2px 12px -2px rgba(0, 87, 217, 0.06),
    0 4px 20px -4px rgba(0, 87, 217, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  filter: saturate(0.85);
}

/* 更靠后的卡片 - 更淡 */
.stack-card--behind {
  transform: translateY(28px) translateX(20px) rotate(3deg) scale(0.9);
  opacity: 0.45;
  z-index: 3;
  box-shadow:
    0 2px 8px -2px rgba(0, 87, 217, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  filter: saturate(0.7);
}

/* UI Mockup Base - Enhanced */
.ui-mockup {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.mockup-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.mockup-dot:nth-child(1) {
  background: #ef4444;
}
.mockup-dot:nth-child(2) {
  background: #f59e0b;
}
.mockup-dot:nth-child(3) {
  background: #10b981;
}

.mockup-title {
  margin-left: auto;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.mockup-body {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

/* Chat Interface - Enhanced */
.ui-mockup--chat .mockup-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.chat-bubble {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  animation: fadeInUp 0.5s ease both;
}

.chat-bubble:nth-child(1) {
  animation-delay: 0.1s;
}
.chat-bubble:nth-child(2) {
  animation-delay: 0.2s;
}
.chat-bubble:nth-child(3) {
  animation-delay: 0.3s;
}

.chat-bubble--ai {
  justify-content: flex-start;
}
.chat-bubble--user {
  justify-content: flex-end;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.chat-bubble--ai .chat-avatar {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}
.chat-bubble--user .chat-avatar {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.chat-text {
  max-width: 78%;
  padding: 14px 18px;
  border-radius: 20px;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-line;
}

.chat-bubble--ai .chat-text {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #334155;
  border-bottom-left-radius: 6px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(8px);
}

.chat-bubble--user .chat-text {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-bottom-right-radius: 6px;
  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  width: fit-content;
  margin-top: 4px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(8px);
}

.typing-indicator span {
  width: 7px;
  height: 7px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typingBounce 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Upload Interface - Enhanced */
.ui-mockup--upload .mockup-body {
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-zone {
  border: 2px dashed rgba(203, 213, 225, 0.8);
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.9);
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}
.upload-text {
  font-size: 1rem;
  color: #334155;
  font-weight: 600;
  margin-bottom: 6px;
}
.upload-hint {
  font-size: 0.8rem;
  color: #94a3b8;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 0.9rem;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.03),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(8px);
}

.file-icon {
  font-size: 1.3rem;
}
.file-name {
  flex: 1;
  color: #334155;
  font-weight: 500;
}
.file-status {
  color: #10b981;
  font-weight: 700;
  font-size: 1rem;
}

.file-item--processing .file-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* PPT Preview - Enhanced */
.ui-mockup--ppt .mockup-body {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.ui-mockup--ppt .mockup-body::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 20% 80%,
      rgba(59, 130, 246, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(6, 182, 212, 0.1) 0%,
      transparent 50%
    );
  pointer-events: none;
}

/* PPT Container Layout */
.ppt-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 12px;
  padding: 16px;
}

/* 左侧缩略图导航 */
.ppt-sidebar {
  width: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.ppt-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ppt-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.ppt-thumb--active {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
}

.thumb-page {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.thumb-title {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 主幻灯片区域 */
.ppt-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ppt-slide-content {
  width: 100%;
  max-width: 380px;
  aspect-ratio: 4/3;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  z-index: 1;
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.slide-badge {
  font-size: 0.7rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.slide-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.slide-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 6px;
  text-align: center;
}

.slide-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 20px;
}

.slide-formula {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.formula-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 16px 32px;
  text-align: center;
}

.formula-text {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 8px;
  font-family: "Times New Roman", serif;
}

.formula-desc {
  display: block;
  font-size: 0.75rem;
  color: #3b82f6;
  max-width: 200px;
  line-height: 1.4;
}

.slide-keypoints {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.keypoint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 8px;
  font-size: 0.8rem;
  color: #475569;
}

.keypoint-icon {
  font-size: 1rem;
}

.slide-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.slide-tags {
  display: flex;
  gap: 6px;
}

.slide-tag {
  font-size: 0.65rem;
  padding: 4px 10px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-weight: 600;
}

.slide-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #64748b;
  cursor: pointer;
}

.nav-btn--primary {
  background: #3b82f6;
  color: white;
}

.nav-page {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* 右侧工具栏 */
.ppt-toolbar {
  width: 44px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 12px 0;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toolbar-btn--active {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.toolbar-divider {
  width: 24px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 4px 0;
}

/* Doc Editor - Enhanced */
.ui-mockup--doc .mockup-body {
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  padding: 20px 24px;
}

.doc-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.doc-section {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  position: relative;
}
.doc-section:last-child {
  border-bottom: none;
}
.doc-section::before {
  content: "";
  position: absolute;
  left: -20px;
  top: 4px;
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, #3b82f6, #06b6d4);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.doc-section:hover::before {
  opacity: 1;
}
.doc-h1 {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.doc-h1::before {
  content: "";
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
}
.doc-p {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  padding-left: 14px;
}
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 14px;
}
.doc-li {
  font-size: 0.9rem;
  color: #475569;
  padding-left: 16px;
  position: relative;
}

/* AI 备课工作台 */
.ui-mockup--workspace .workspace-body {
  display: flex;
  height: calc(100% - 44px);
  background: #f8fafc;
}

.workspace-sidebar {
  width: 140px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: #f1f5f9;
}

.task-item--active {
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.task-icon {
  font-size: 1rem;
}

.task-name {
  flex: 1;
  font-size: 0.75rem;
  color: #334155;
  font-weight: 500;
}

.task-status {
  font-size: 0.6rem;
  padding: 2px 6px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 10px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-btn {
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.quick-btn:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
}

.generated-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 8px 44px;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.preview-icon {
  font-size: 1.5rem;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.preview-meta {
  font-size: 0.7rem;
  color: #94a3b8;
}

.preview-btn {
  padding: 6px 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.input-area {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  background: #ffffff;
}

.chat-input::placeholder {
  color: #94a3b8;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 学情分析仪表盘 */
.ui-mookup--dashboard .dashboard-body {
  padding: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card-mini {
  flex: 1;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 6px;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.trend-up {
  background: #d1fae5;
  color: #065f46;
}

.trend-down {
  background: #dbeafe;
  color: #1e40af;
}

.trend-warn {
  background: #fee2e2;
  color: #991b1b;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.section-icon {
  font-size: 1.1rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.knowledge-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.knowledge-name {
  width: 100px;
  font-size: 0.8rem;
  color: #475569;
}

.knowledge-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.knowledge-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.fill-warn {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.fill-avg {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.knowledge-percent {
  width: 36px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  text-align: right;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.suggestion-priority {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.priority-high {
  background: #fee2e2;
  color: #991b1b;
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.suggestion-text {
  flex: 1;
  font-size: 0.8rem;
  color: #475569;
}

.action-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* 课件智能诊断 */
.ui-mockup--optimize .optimize-body {
  padding: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.score-circle {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.score-value {
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.score-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
}

.optimize-sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.optimize-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.optimize-card--success {
  border-left: 4px solid #10b981;
}

.optimize-card--warning {
  border-left: 4px solid #f59e0b;
}

.optimize-card--info {
  border-left: 4px solid #3b82f6;
}

.optimize-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.optimize-icon {
  font-size: 1.2rem;
}

.optimize-title {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.optimize-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #3b82f6;
}

.optimize-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.4;
}

.fix-btn {
  padding: 8px 16px;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

/* 智能批改中心 */
.ui-mockup--grading .grading-body {
  padding: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.grading-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.grading-progress {
  flex-shrink: 0;
}

.progress-ring {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #34d399);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
}

.progress-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
}

.progress-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.9);
}

.grading-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.summary-label {
  font-size: 0.75rem;
  color: #64748b;
}

.summary-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.error-analysis {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.analysis-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.error-rank {
  width: 28px;
  height: 28px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.error-content {
  flex: 1;
}

.error-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.error-count {
  font-size: 0.7rem;
  color: #94a3b8;
}

.error-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
}

/* 智能资源库 */
.ui-mockup--resource .resource-body {
  padding: 16px;
  background: #f8fafc;
}

.resource-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.search-icon {
  font-size: 0.9rem;
  color: #94a3b8;
}

.search-input {
  flex: 1;
  border: none;
  font-size: 0.8rem;
  color: #334155;
  background: transparent;
}

.search-input::placeholder {
  color: #94a3b8;
}

.upload-btn {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.resource-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  overflow-x: auto;
}

.category-btn {
  padding: 6px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
}

.category-btn--active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.resource-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.resource-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-card--new {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.resource-thumb {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.resource-thumb--doc {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.resource-thumb--video {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.resource-thumb--ai {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
}

.resource-info {
  flex: 1;
}

.resource-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-meta {
  font-size: 0.65rem;
  color: #94a3b8;
}

.resource-actions {
  display: flex;
  gap: 6px;
}

.action-icon {
  width: 28px;
  height: 28px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-li {
  position: relative;
}
.doc-li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: 700;
}

/* Mini Dots Progress */
.mini-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

.mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mini-dot:hover {
  background: #94a3b8;
  transform: scale(1.2);
}
.mini-dot--active {
  width: 32px;
  border-radius: 4px;
  background: #e2e8f0;
}

.mini-dot__progress {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 4px;
  transform-origin: left;
  transition: transform 0.05s linear;
}

/* Showcase Hint - 功能提示信息 */
.showcase-hint {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 28px;
  padding: 16px 20px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.85) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.03),
    0 2px 4px -1px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hint-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.hint-content {
  flex: 1;
}

.hint-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.hint-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

/* Usage Guide - 使用引导 */
.usage-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 14px 20px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 12px;
  border: 1px dashed rgba(203, 213, 225, 0.5);
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
  background: #dbeafe;
  border-radius: 50%;
  flex-shrink: 0;
}

.guide-text {
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
}

.guide-arrow {
  font-size: 1rem;
  color: #94a3b8;
  opacity: 0.6;
}

/* Old Float Styles */
.float-wrap {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 0.95 / 1;
  animation: float-main 7s ease-in-out infinite;
}

.float-card {
  position: absolute;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background:
    linear-gradient(
      150deg,
      rgba(255, 255, 255, 0.88),
      rgba(248, 252, 255, 0.64)
    ),
    radial-gradient(circle at 80% 20%, rgba(0, 194, 212, 0.14), transparent 34%);
  backdrop-filter: blur(28px) saturate(1.35);
  box-shadow:
    0 1px 2px rgba(10, 15, 26, 0.04),
    0 34px 110px rgba(0, 87, 217, 0.16);
}

.float-card--back {
  inset: 8% -5% -8% 10%;
  transform: rotate(5deg);
  opacity: 0.42;
  animation: float-back 8s ease-in-out infinite;
}

.float-card--main {
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.float-card__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.float-card__chrome span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.float-card__chrome span:nth-child(1) {
  background: #ff6b6b;
}
.float-card__chrome span:nth-child(2) {
  background: #ffd166;
}
.float-card__chrome span:nth-child(3) {
  background: #06d6a0;
}
.float-card__chrome em {
  margin-left: auto;
  font-style: normal;
  font-weight: 500;
}

.float-card__content {
  padding: 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.visual-board {
  position: relative;
  padding: 10px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(10, 15, 26, 0.06),
    rgba(255, 255, 255, 0.62)
  );
  border: 1px solid rgba(10, 15, 26, 0.06);
}

.visual-board__photo {
  position: relative;
  min-height: 238px;
  border-radius: 20px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(10, 15, 26, 0.02), rgba(10, 15, 26, 0.12)),
    radial-gradient(
      circle at 78% 22%,
      rgba(255, 255, 255, 0.98),
      transparent 18%
    ),
    linear-gradient(135deg, #dff1ff 0%, #f7fbff 43%, #c7e6ff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.visual-board__photo::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.42) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.32) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 82%);
}

.board-screen {
  position: absolute;
  left: 28px;
  top: 24px;
  width: 58%;
  min-height: 146px;
  padding: 16px;
  border-radius: 18px;
  color: #fff;
  background:
    linear-gradient(145deg, rgba(0, 91, 181, 0.96), rgba(0, 194, 212, 0.82)),
    radial-gradient(circle at 15% 0%, rgba(255, 255, 255, 0.4), transparent 38%);
  box-shadow: 0 20px 50px rgba(0, 87, 217, 0.2);
}

.board-screen__tag {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.68rem;
  font-weight: 700;
}

.board-screen strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.08rem;
  line-height: 1.2;
}

.force-diagram {
  position: relative;
  height: 58px;
  margin-top: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
}

.force-diagram__block {
  position: absolute;
  left: 18px;
  bottom: 16px;
  width: 46px;
  height: 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 20px rgba(0, 35, 82, 0.16);
}

.force-diagram__arrow {
  position: absolute;
  left: 72px;
  bottom: 27px;
  width: 62px;
  height: 2px;
  background: #fff;
}

.force-diagram__arrow::after {
  content: "";
  position: absolute;
  right: -1px;
  top: -4px;
  width: 10px;
  height: 10px;
  border-top: 2px solid #fff;
  border-right: 2px solid #fff;
  transform: rotate(45deg);
}

.force-diagram__label {
  position: absolute;
  right: 12px;
  top: 12px;
  font-family: var(--font-display);
  font-size: 0.86rem;
  font-weight: 700;
}

.teacher-figure {
  position: absolute;
  right: 52px;
  bottom: 22px;
  width: 76px;
  height: 142px;
}

.teacher-figure__head,
.teacher-figure__body,
.teacher-figure__arm {
  position: absolute;
  display: block;
}

.teacher-figure__head {
  top: 0;
  left: 25px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffe2c2, #f5b980);
}

.teacher-figure__body {
  top: 36px;
  left: 18px;
  width: 48px;
  height: 84px;
  border-radius: 26px 26px 18px 18px;
  background: linear-gradient(180deg, #0a0f1a, #2e4966);
}

.teacher-figure__arm {
  top: 50px;
  left: 4px;
  width: 54px;
  height: 10px;
  border-radius: 999px;
  background: #f5b980;
  transform: rotate(-28deg);
  transform-origin: right center;
}

.student-desk {
  position: absolute;
  bottom: 0;
  width: 96px;
  height: 54px;
  border-radius: 22px 22px 0 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.86),
    rgba(221, 237, 250, 0.92)
  );
  box-shadow: 0 -12px 30px rgba(10, 15, 26, 0.08);
}

.student-desk::before {
  content: "";
  position: absolute;
  left: 34px;
  top: -24px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #2f5f8e, #0a0f1a);
}

.student-desk--left {
  left: 28px;
}

.student-desk--right {
  right: 146px;
  transform: scale(0.86);
  opacity: 0.82;
}

.visual-board__caption {
  display: grid;
  grid-template-columns: 0.72fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 4px 2px;
}

.visual-board__caption strong {
  font-family: var(--font-display);
  font-size: 0.94rem;
  line-height: 1.35;
}

.visual-board__caption span {
  font-size: 0.76rem;
  line-height: 1.55;
  color: var(--ink-muted);
}

.workflow-rail {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.workflow-rail::before {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  top: 50%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 119, 230, 0.28),
    transparent
  );
}

.workflow-step {
  position: relative;
  z-index: 1;
  display: inline-flex;
  justify-content: center;
  padding: 8px 6px;
  border: 1px solid rgba(0, 119, 230, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.workflow-step--active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(100deg, var(--accent), var(--cyan));
  box-shadow: 0 10px 24px rgba(0, 119, 230, 0.22);
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.material-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(10, 15, 26, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.material-card > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 11px;
  background: rgba(0, 119, 230, 0.09);
  color: var(--accent-deep);
  font-size: 0.68rem;
  font-weight: 800;
}

.material-card strong,
.material-card small {
  display: block;
}

.material-card strong {
  margin-bottom: 2px;
  font-size: 0.8rem;
}

.material-card small {
  font-size: 0.68rem;
  line-height: 1.4;
  color: var(--ink-muted);
}

.mini-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.mini-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--ink-soft);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(10, 15, 26, 0.12);
  flex-shrink: 0;
}

.dot--done {
  background: #06d6a0;
}

.dot--active {
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.2);
  animation: pulse-dot 2s ease infinite;
}

.float-chip {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  border-radius: 999px;
  box-shadow: 0 10px 36px rgba(10, 15, 26, 0.08);
  white-space: nowrap;
}

.float-chip svg {
  width: 16px;
  height: 16px;
}

.float-chip--1 {
  top: 3%;
  right: -3%;
  color: var(--accent-deep);
  animation: float-chip-a 5.5s ease-in-out infinite;
}

.float-chip--2 {
  bottom: 11%;
  left: -9%;
  animation: float-chip-b 6.5s ease-in-out infinite 0.4s;
}

.float-chip--3 {
  right: -8%;
  bottom: 27%;
  color: #0e765b;
  animation: float-chip-a 6s ease-in-out infinite 0.8s;
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(22px);
  animation: reveal-up 0.85s var(--ease-out) forwards;
  animation-delay: calc(0.07s * var(--i, 0) + 0.1s);
}

@keyframes reveal-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-28px, 36px) scale(1.04);
  }
}

@keyframes drift-b {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(36px, -28px);
  }
}

@keyframes drift-c {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(calc(-50% + 18px), calc(-50% - 22px)) scale(1.06);
  }
}

@keyframes float-main {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16px);
  }
}

@keyframes float-back {
  0%,
  100% {
    transform: rotate(5deg) translateY(0);
  }
  50% {
    transform: rotate(5deg) translateY(-12px);
  }
}

@keyframes float-chip-a {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-chip-b {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px) translateX(5px);
  }
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
  70% {
    box-shadow: 0 0 0 10px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(0, 119, 230, 0.07);
  }
}

@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero__lead {
    margin-left: auto;
    margin-right: auto;
  }
  .lesson-stats {
    margin-left: auto;
    margin-right: auto;
  }
  .hero__cta {
    justify-content: center;
  }
  .hero__stage {
    min-height: 520px;
  }
  .showcase-wrapper {
    max-width: 520px;
    padding: 20px;
  }
  .showcase-hint {
    margin-top: 24px;
    padding: 14px 18px;
  }
  .hint-icon {
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }
  .usage-guide {
    gap: 10px;
    padding: 12px 16px;
  }
  .guide-text {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 96px 20px 48px;
  }
  .lesson-stats {
    grid-template-columns: 1fr;
  }
  .float-chip--1 {
    right: 0;
  }
  .float-chip--2 {
    left: 0;
  }
  .float-chip--3 {
    right: 0;
  }
  .material-grid {
    grid-template-columns: 1fr;
  }
  .showcase-wrapper {
    max-width: 460px;
    padding: 20px;
  }
  .mini-dots {
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .hero__cta {
    flex-direction: column;
    width: 100%;
  }
  .hero__cta .btn {
    width: 100%;
  }
  .hero__stage {
    min-height: 480px;
  }
  .showcase-wrapper {
    max-width: 400px;
    padding: 16px;
  }
  .stack-card {
    border-radius: 18px;
  }
  .mini-dots {
    margin-top: 16px;
    gap: 8px;
  }
  .mini-dot {
    width: 6px;
    height: 6px;
  }
  .mini-dot--active {
    width: 24px;
  }
  .showcase-hint {
    margin-top: 20px;
    padding: 12px 14px;
    gap: 10px;
  }
  .hint-icon {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
  .hint-title {
    font-size: 0.9rem;
  }
  .hint-desc {
    font-size: 0.75rem;
  }
  .usage-guide {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
    margin-top: 16px;
  }
  .guide-arrow {
    display: none;
  }
  .float-wrap {
    aspect-ratio: auto;
    min-height: 620px;
  }
  .float-card--main {
    inset: 18px 0 0;
  }
  .float-card--back {
    inset: 8% 3% 2% 7%;
  }
  .visual-board__caption {
    grid-template-columns: 1fr;
  }
  .workflow-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .visual-board__photo {
    min-height: 214px;
  }
  .board-screen {
    left: 16px;
    width: 64%;
  }
  .teacher-figure {
    right: 22px;
    transform: scale(0.86);
    transform-origin: bottom right;
  }
}
</style>
