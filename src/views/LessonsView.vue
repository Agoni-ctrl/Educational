<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import SiteNav from "../components/layout/SiteNav.vue";
import { init as echartsInit } from "echarts";

// ==================== 状态管理 ====================
// 当前激活的菜单项
const activeMenu = ref("course-resource");
// 菜单切换动画状态
const isTransitioning = ref(false);

// ==================== 菜单配置 ====================
const menuItems = [
  {
    id: "course-resource",
    label: "课程资源",
    icon: "📚",
    desc: "浏览所有课程",
  },
  {
    id: "course-analysis",
    label: "课程分析",
    icon: "📊",
    desc: "数据可视化分析",
  },
  { id: "qa-session", label: "边问边答", icon: "💬", desc: "互动问答学习" },
  { id: "after-class", label: "课后追问", icon: "🔍", desc: "深入探讨问题" },
  { id: "ai-summary", label: "AI总结助手", icon: "🤖", desc: "智能学习总结" },
];

// ==================== 课程数据 ====================
const courses = ref([
  {
    id: 1,
    title: "牛顿第二定律实验课",
    subject: "物理",
    grade: "高一必修一",
    teacher: "张老师",
    duration: "45分钟",
    cover: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400",
    description: "通过实验探究力、质量和加速度的关系",
    tags: ["实验课", "核心概念"],
    progress: 85,
  },
  {
    id: 2,
    title: "化学反应速率",
    subject: "化学",
    grade: "高二必修二",
    teacher: "李老师",
    duration: "40分钟",
    cover: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    description: "探究影响化学反应速率的因素",
    tags: ["理论课", "实验探究"],
    progress: 60,
  },
  {
    id: 3,
    title: "函数单调性",
    subject: "数学",
    grade: "高一必修一",
    teacher: "王老师",
    duration: "45分钟",
    cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    description: "从图像到定义的完整学习",
    tags: ["概念课", "数形结合"],
    progress: 100,
  },
  {
    id: 4,
    title: "细胞结构",
    subject: "生物",
    grade: "高一必修一",
    teacher: "赵老师",
    duration: "50分钟",
    cover: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
    description: "显微镜下的细胞世界",
    tags: ["观察课", "微观世界"],
    progress: 30,
  },
  {
    id: 5,
    title: "鸦片战争",
    subject: "历史",
    grade: "高一必修一",
    teacher: "陈老师",
    duration: "45分钟",
    cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400",
    description: "近代中国历史的转折点",
    tags: ["历史事件", "思辨分析"],
    progress: 0,
  },
  {
    id: 6,
    title: "大气环流",
    subject: "地理",
    grade: "高一必修一",
    teacher: "刘老师",
    duration: "40分钟",
    cover: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400",
    description: "全球气候形成的基础",
    tags: ["自然地理", "系统思维"],
    progress: 45,
  },
]);

// ==================== 问答数据 ====================
const qaList = ref([
  {
    id: 1,
    question: "牛顿第二定律中，加速度与力的关系是什么？",
    answer:
      "根据牛顿第二定律 F = ma，加速度与作用力成正比，与物体质量成反比。当质量不变时，力越大，加速度越大。",
    isExpanded: false,
    relatedCourse: "牛顿第二定律实验课",
  },
  {
    id: 2,
    question: "如何理解化学反应速率的影响因素？",
    answer:
      "影响化学反应速率的主要因素包括：浓度、温度、压强（气体反应）、催化剂和接触面积。温度每升高10℃，反应速率通常增加2-4倍。",
    isExpanded: false,
    relatedCourse: "化学反应速率",
  },
  {
    id: 3,
    question: "函数单调性的定义是什么？",
    answer:
      "设函数f(x)的定义域为I，如果对于定义域I内某个区间D上的任意两个自变量的值x₁、x₂，当x₁ < x₂时，都有f(x₁) < f(x₂)，那么就说函数f(x)在区间D上是增函数。",
    isExpanded: false,
    relatedCourse: "函数单调性",
  },
  {
    id: 4,
    question: "线粒体和叶绿体的功能区别是什么？",
    answer:
      '线粒体是细胞的"动力车间"，进行有氧呼吸产生ATP；叶绿体是植物细胞进行光合作用的场所，将光能转化为化学能储存起来。',
    isExpanded: false,
    relatedCourse: "细胞结构",
  },
]);

// ==================== 课后追问数据 ====================
const topicsList = ref([
  {
    id: 1,
    title: "牛顿定律在实际生活中的应用",
    content:
      "除了课本中的例子，牛顿定律在体育运动、交通工具设计等领域有哪些具体应用？",
    replies: 12,
    views: 156,
    author: "物理爱好者",
    time: "2小时前",
  },
  {
    id: 2,
    title: "化学反应速率的工业意义",
    content: "在化工生产中，如何通过控制反应条件来提高生产效率？",
    replies: 8,
    views: 98,
    author: "化学探索者",
    time: "5小时前",
  },
  {
    id: 3,
    title: "函数单调性与导数的关系",
    content: "学习了导数之后，如何用导数来判断函数的单调性？",
    replies: 15,
    views: 203,
    author: "数学思考者",
    time: "1天前",
  },
  {
    id: 4,
    title: "细胞器的协同工作",
    content: "细胞内的各种细胞器是如何协调配合完成生命活动的？",
    replies: 6,
    views: 87,
    author: "生物迷",
    time: "2天前",
  },
]);

// ==================== AI总结数据 ====================
const aiSummaries = ref([
  {
    id: 1,
    course: "牛顿第二定律实验课",
    summary:
      "本节课通过实验探究了力、质量和加速度的关系。重点掌握了控制变量法的应用，理解了牛顿第二定律 F=ma 的物理意义。",
    keyPoints: ["控制变量法", "F=ma公式", "实验数据分析"],
    mastery: 85,
    suggestions: ["建议复习矢量运算", "多做斜面问题练习"],
  },
  {
    id: 2,
    course: "化学反应速率",
    summary:
      "学习了影响化学反应速率的五大因素，通过实验观察了浓度、温度对反应速率的影响。",
    keyPoints: ["浓度影响", "温度影响", "催化剂作用"],
    mastery: 72,
    suggestions: ["理解活化能概念", "练习速率方程计算"],
  },
  {
    id: 3,
    course: "函数单调性",
    summary:
      "从图像直观感知到严格数学定义，完整学习了函数单调性的概念及其判断方法。",
    keyPoints: ["单调性定义", "图像特征", "证明方法"],
    mastery: 95,
    suggestions: ["已掌握良好，可继续学习极值问题"],
  },
]);

// ==================== 课程分析数据 ====================
const analysisData = {
  subjectDistribution: [
    { value: 35, name: "物理", itemStyle: { color: "#5470c6" } },
    { value: 25, name: "化学", itemStyle: { color: "#91cc75" } },
    { value: 20, name: "数学", itemStyle: { color: "#fac858" } },
    { value: 12, name: "生物", itemStyle: { color: "#ee6666" } },
    { value: 8, name: "其他", itemStyle: { color: "#73c0de" } },
  ],
  learningProgress: [
    { value: 45, name: "已完成", itemStyle: { color: "#91cc75" } },
    { value: 30, name: "学习中", itemStyle: { color: "#fac858" } },
    { value: 25, name: "未开始", itemStyle: { color: "#ee6666" } },
  ],
  courseTypes: [
    { value: 40, name: "理论课", itemStyle: { color: "#5470c6" } },
    { value: 35, name: "实验课", itemStyle: { color: "#91cc75" } },
    { value: 15, name: "习题课", itemStyle: { color: "#fac858" } },
    { value: 10, name: "讨论课", itemStyle: { color: "#ee6666" } },
  ],
};

// ==================== 菜单切换 ====================
function switchMenu(menuId) {
  if (menuId === activeMenu.value) return;

  isTransitioning.value = true;
  setTimeout(() => {
    activeMenu.value = menuId;
    nextTick(() => {
      if (menuId === "course-analysis") {
        initCharts();
      }
      setTimeout(() => {
        isTransitioning.value = false;
      }, 50);
    });
  }, 200);
}

// ==================== ECharts 初始化 ====================
let charts = {};

function initCharts() {
  // 学科分布饼图
  const subjectChart = echarts.init(document.getElementById("subject-chart"));
  charts.subject = subjectChart;

  subjectChart.setOption({
    title: {
      text: "学科分布",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1e293b",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c}% ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: { color: "#334155" },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: 50,
      textStyle: { color: "#64748b" },
    },
    series: [
      {
        name: "学科占比",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "55%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{c}%",
          color: "#475569",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        labelLine: {
          show: true,
          lineStyle: { color: "#cbd5e1" },
        },
        data: analysisData.subjectDistribution,
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: function (idx) {
          return Math.random() * 200;
        },
      },
    ],
  });

  // 学习进度饼图
  const progressChart = echartsInit(document.getElementById("progress-chart"));
  charts.progress = progressChart;

  progressChart.setOption({
    title: {
      text: "学习进度",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1e293b",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c}% ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: { color: "#334155" },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: 50,
      textStyle: { color: "#64748b" },
    },
    series: [
      {
        name: "进度分布",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "55%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{c}%",
          color: "#475569",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        data: analysisData.learningProgress,
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: function (idx) {
          return Math.random() * 200 + 200;
        },
      },
    ],
  });

  // 课程类型饼图
  const typeChart = echarts.init(document.getElementById("type-chart"));
  charts.type = typeChart;

  typeChart.setOption({
    title: {
      text: "课程类型",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1e293b",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c}% ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: { color: "#334155" },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: 50,
      textStyle: { color: "#64748b" },
    },
    series: [
      {
        name: "类型分布",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "55%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{c}%",
          color: "#475569",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        data: analysisData.courseTypes,
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: function (idx) {
          return Math.random() * 200 + 400;
        },
      },
    ],
  });

  // 窗口大小改变时重新调整图表
  window.addEventListener("resize", () => {
    Object.values(charts).forEach((chart) => chart.resize());
  });
}

// ==================== 辅助函数 ====================
function getMasteryLevel(mastery) {
  if (mastery >= 90) return "excellent";
  if (mastery >= 70) return "good";
  if (mastery >= 50) return "average";
  return "needs-work";
}

// ==================== 问答交互 ====================
function toggleQA(id) {
  const qa = qaList.value.find((q) => q.id === id);
  if (qa) {
    qa.isExpanded = !qa.isExpanded;
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 初始加载时如果是课程分析页面，初始化图表
  if (activeMenu.value === "course-analysis") {
    nextTick(() => {
      initCharts();
    });
  }
});

// 监听菜单变化，清理图表
watch(activeMenu, (newVal) => {
  if (newVal !== "course-analysis") {
    Object.values(charts).forEach((chart) => {
      if (chart) {
        chart.dispose();
      }
    });
    charts = {};
  }
});
</script>

<template>
  <div class="lessons-page">
    <div class="lessons-bg" aria-hidden="true" />
    <SiteNav />

    <main class="lessons-main">
      <div class="lessons-container">
        <!-- 左侧功能菜单 -->
        <aside class="sidebar-menu">
          <div class="menu-header">
            <div class="menu-icon">🎓</div>
            <h2>课堂教程</h2>
            <p>选择功能模块开始学习</p>
          </div>

          <nav class="menu-list">
            <button
              v-for="item in menuItems"
              :key="item.id"
              class="menu-item"
              :class="{ 'menu-item--active': activeMenu === item.id }"
              @click="switchMenu(item.id)"
            >
              <span class="menu-item__icon">{{ item.icon }}</span>
              <div class="menu-item__content">
                <span class="menu-item__label">{{ item.label }}</span>
                <span class="menu-item__desc">{{ item.desc }}</span>
              </div>
              <span class="menu-item__arrow">→</span>
            </button>
          </nav>

          <div class="menu-footer">
            <div class="stats-card">
              <div class="stat-item">
                <span class="stat-value">12</span>
                <span class="stat-label">已学课程</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">86%</span>
                <span class="stat-label">平均进度</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧内容区域 -->
        <section class="content-area">
          <div
            class="content-wrapper"
            :class="{ 'content-wrapper--transitioning': isTransitioning }"
          >
            <!-- 1. 课程资源 -->
            <div v-if="activeMenu === 'course-resource'" class="content-panel">
              <div class="panel-header">
                <h1>📚 课程资源</h1>
                <p>浏览所有可用的课程资源，点击课程开始学习</p>
              </div>

              <div class="course-grid">
                <div
                  v-for="course in courses"
                  :key="course.id"
                  class="course-card"
                >
                  <div class="course-cover">
                    <img :src="course.cover" :alt="course.title" />
                    <div class="course-overlay">
                      <button class="play-btn">
                        <span>▶</span>
                      </button>
                    </div>
                    <span class="course-duration">{{ course.duration }}</span>
                  </div>
                  <div class="course-info">
                    <div class="course-tags">
                      <span v-for="tag in course.tags" :key="tag" class="tag">{{
                        tag
                      }}</span>
                    </div>
                    <h3 class="course-title">{{ course.title }}</h3>
                    <p class="course-desc">{{ course.description }}</p>
                    <div class="course-meta">
                      <span class="subject-badge">{{ course.subject }}</span>
                      <span class="grade-text">{{ course.grade }}</span>
                    </div>
                    <div class="course-progress">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{ width: course.progress + '%' }"
                        ></div>
                      </div>
                      <span class="progress-text">{{ course.progress }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. 课程分析 -->
            <div v-if="activeMenu === 'course-analysis'" class="content-panel">
              <div class="panel-header">
                <h1>📊 课程分析</h1>
                <p>通过数据可视化了解学习情况</p>
              </div>

              <div class="analysis-dashboard">
                <!-- 统计卡片 -->
                <div class="stats-row">
                  <div class="stat-card">
                    <div class="stat-icon">📖</div>
                    <div class="stat-info">
                      <span class="stat-number">20</span>
                      <span class="stat-name">总课程数</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                      <span class="stat-number">9</span>
                      <span class="stat-name">已完成</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-info">
                      <span class="stat-number">6</span>
                      <span class="stat-name">学习中</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-info">
                      <span class="stat-number">86%</span>
                      <span class="stat-name">平均掌握度</span>
                    </div>
                  </div>
                </div>

                <!-- 图表区域 -->
                <div class="charts-grid">
                  <div class="chart-container">
                    <div id="subject-chart" class="chart"></div>
                  </div>
                  <div class="chart-container">
                    <div id="progress-chart" class="chart"></div>
                  </div>
                  <div class="chart-container">
                    <div id="type-chart" class="chart"></div>
                  </div>
                </div>

                <!-- 学习建议 -->
                <div class="suggestions-section">
                  <h3>💡 学习建议</h3>
                  <div class="suggestion-cards">
                    <div class="suggestion-card">
                      <span class="suggestion-icon">🎯</span>
                      <h4>重点突破</h4>
                      <p>物理学科占比较大，建议加强力学部分的练习</p>
                    </div>
                    <div class="suggestion-card">
                      <span class="suggestion-icon">📈</span>
                      <h4>进度提醒</h4>
                      <p>有5门课程还未开始，建议制定学习计划</p>
                    </div>
                    <div class="suggestion-card">
                      <span class="suggestion-icon">🔬</span>
                      <h4>实验课程</h4>
                      <p>实验课程完成度较高，继续保持动手能力</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 边问边答 -->
            <div v-if="activeMenu === 'qa-session'" class="content-panel">
              <div class="panel-header">
                <h1>💬 边问边答</h1>
                <p>互动式学习问答，巩固知识点</p>
              </div>

              <div class="qa-list">
                <div
                  v-for="qa in qaList"
                  :key="qa.id"
                  class="qa-item"
                  :class="{ 'qa-item--expanded': qa.isExpanded }"
                  @click="toggleQA(qa.id)"
                >
                  <div class="qa-question">
                    <span class="qa-icon">Q</span>
                    <p>{{ qa.question }}</p>
                    <span class="qa-toggle">{{
                      qa.isExpanded ? "−" : "+"
                    }}</span>
                  </div>
                  <div v-if="qa.isExpanded" class="qa-answer">
                    <span class="qa-icon qa-icon--answer">A</span>
                    <div class="qa-answer-content">
                      <p>{{ qa.answer }}</p>
                      <span class="qa-related"
                        >相关课程：{{ qa.relatedCourse }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div class="qa-input-section">
                <h3>🤔 有问题？立即提问</h3>
                <div class="qa-input-box">
                  <input type="text" placeholder="输入你的问题..." />
                  <button class="submit-btn">提问</button>
                </div>
              </div>
            </div>

            <!-- 4. 课后追问 -->
            <div v-if="activeMenu === 'after-class'" class="content-panel">
              <div class="panel-header">
                <h1>🔍 课后追问</h1>
                <p>深入探讨，拓展思维边界</p>
              </div>

              <div class="topics-list">
                <div
                  v-for="topic in topicsList"
                  :key="topic.id"
                  class="topic-card"
                >
                  <div class="topic-header">
                    <h3>{{ topic.title }}</h3>
                    <span class="topic-time">{{ topic.time }}</span>
                  </div>
                  <p class="topic-content">{{ topic.content }}</p>
                  <div class="topic-meta">
                    <div class="topic-author">
                      <span class="author-avatar">👤</span>
                      <span>{{ topic.author }}</span>
                    </div>
                    <div class="topic-stats">
                      <span>👁 {{ topic.views }}</span>
                      <span>💬 {{ topic.replies }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button class="new-topic-btn">
                <span>+</span>
                发起新讨论
              </button>
            </div>

            <!-- 5. AI总结助手 -->
            <div v-if="activeMenu === 'ai-summary'" class="content-panel">
              <div class="panel-header">
                <h1>🤖 AI总结助手</h1>
                <p>智能分析学习情况，生成个性化总结</p>
              </div>

              <div class="ai-summaries">
                <div
                  v-for="summary in aiSummaries"
                  :key="summary.id"
                  class="ai-summary-card"
                >
                  <div class="summary-header">
                    <h3>{{ summary.course }}</h3>
                    <div
                      class="mastery-badge"
                      :class="'mastery--' + getMasteryLevel(summary.mastery)"
                    >
                      掌握度 {{ summary.mastery }}%
                    </div>
                  </div>
                  <p class="summary-text">{{ summary.summary }}</p>
                  <div class="key-points">
                    <h4>📌 核心要点</h4>
                    <div class="points-tags">
                      <span
                        v-for="point in summary.keyPoints"
                        :key="point"
                        class="point-tag"
                      >
                        {{ point }}
                      </span>
                    </div>
                  </div>
                  <div class="suggestions-box">
                    <h4>💡 学习建议</h4>
                    <ul>
                      <li
                        v-for="(suggestion, idx) in summary.suggestions"
                        :key="idx"
                      >
                        {{ suggestion }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="ai-actions">
                <button class="ai-btn ai-btn--primary">
                  <span>✨</span>
                  生成新的学习总结
                </button>
                <button class="ai-btn">
                  <span>📊</span>
                  查看完整学习报告
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ==================== 基础布局 ==================== */
.lessons-page {
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
}

.lessons-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      1200px 600px at 80% -10%,
      rgba(76, 125, 255, 0.08),
      transparent
    ),
    radial-gradient(
      900px 500px at -10% 30%,
      rgba(99, 102, 241, 0.06),
      transparent
    );
  pointer-events: none;
  z-index: 0;
}

.lessons-main {
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.lessons-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  min-height: calc(100vh - 120px);
}

/* ==================== 左侧菜单 ==================== */
.sidebar-menu {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: sticky;
  top: 24px;
  height: fit-content;
  max-height: calc(100vh - 48px);
}

.menu-header {
  padding: 28px 24px;
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  color: white;
  text-align: center;
}

.menu-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.menu-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.menu-header p {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0;
}

.menu-list {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.menu-item:hover {
  background: rgba(76, 125, 255, 0.05);
  border-color: rgba(76, 125, 255, 0.15);
  transform: translateX(4px);
}

.menu-item--active {
  background: linear-gradient(
    135deg,
    rgba(76, 125, 255, 0.1) 0%,
    rgba(99, 102, 241, 0.1) 100%
  );
  border-color: rgba(76, 125, 255, 0.3);
  box-shadow: 0 2px 8px rgba(76, 125, 255, 0.1);
}

.menu-item--active .menu-item__icon {
  transform: scale(1.1);
}

.menu-item--active .menu-item__label {
  color: #4c7dff;
  font-weight: 600;
}

.menu-item--active .menu-item__arrow {
  opacity: 1;
  transform: translateX(0);
}

.menu-item__icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.menu-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item__label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  transition: color 0.3s ease;
}

.menu-item__desc {
  font-size: 0.75rem;
  color: #94a3b8;
}

.menu-item__arrow {
  font-size: 1.2rem;
  color: #4c7dff;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.menu-footer {
  padding: 16px;
  border-top: 1px solid rgba(76, 125, 255, 0.1);
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4c7dff;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

/* ==================== 右侧内容区域 ==================== */
.content-area {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: calc(100vh - 120px);
}

.content-wrapper {
  padding: 32px;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper--transitioning {
  opacity: 0;
  transform: translateY(10px);
}

.panel-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(76, 125, 255, 0.1);
}

.panel-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.panel-header p {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

/* ==================== 课程资源样式 ==================== */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(76, 125, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(76, 125, 255, 0.15);
}

.course-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-cover img {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .course-overlay {
  opacity: 1;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.1);
}

.course-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  border-radius: 4px;
}

.course-info {
  padding: 16px;
}

.course-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 10px;
  background: rgba(76, 125, 255, 0.1);
  color: #4c7dff;
  font-size: 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.course-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.subject-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  color: white;
  font-size: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.grade-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.course-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4c7dff 0%, #6366f1 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #4c7dff;
  font-weight: 600;
  min-width: 36px;
}

/* ==================== 课程分析样式 ==================== */
.analysis-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 125, 255, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(76, 125, 255, 0.1);
  border-radius: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-name {
  font-size: 0.85rem;
  color: #64748b;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chart-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.chart {
  width: 100%;
  height: 320px;
}

.suggestions-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.suggestions-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.suggestion-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.suggestion-card {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 125, 255, 0.1);
}

.suggestion-icon {
  font-size: 2rem;
  margin-bottom: 12px;
  display: block;
}

.suggestion-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.suggestion-card p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* ==================== 边问边答样式 ==================== */
.qa-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.qa-item {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qa-item:hover {
  box-shadow: 0 4px 12px rgba(76, 125, 255, 0.1);
}

.qa-item--expanded {
  border-color: rgba(76, 125, 255, 0.3);
}

.qa-question {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.qa-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-icon--answer {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.qa-question p {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0;
}

.qa-toggle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(76, 125, 255, 0.1);
  color: #4c7dff;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.qa-item--expanded .qa-toggle {
  background: #4c7dff;
  color: white;
  transform: rotate(180deg);
}

.qa-answer {
  display: flex;
  gap: 16px;
  padding: 0 20px 20px 20px;
  border-top: 1px solid rgba(76, 125, 255, 0.1);
  margin-top: -10px;
  padding-top: 20px;
}

.qa-answer-content {
  flex: 1;
}

.qa-answer-content p {
  font-size: 0.95rem;
  color: #475569;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.qa-related {
  font-size: 0.8rem;
  color: #4c7dff;
  background: rgba(76, 125, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.qa-input-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.qa-input-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.qa-input-box {
  display: flex;
  gap: 12px;
}

.qa-input-box input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid rgba(76, 125, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.qa-input-box input:focus {
  border-color: #4c7dff;
  box-shadow: 0 0 0 3px rgba(76, 125, 255, 0.1);
}

.submit-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 125, 255, 0.3);
}

/* ==================== 课后追问样式 ==================== */
.topics-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.topic-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  transition: all 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 125, 255, 0.1);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.topic-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.topic-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.topic-content {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
}

.author-avatar {
  font-size: 1.2rem;
}

.topic-stats {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.new-topic-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.new-topic-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 125, 255, 0.3);
}

.new-topic-btn span {
  font-size: 1.5rem;
}

/* ==================== AI总结助手样式 ==================== */
.ai-summaries {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.ai-summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  transition: all 0.3s ease;
}

.ai-summary-card:hover {
  box-shadow: 0 8px 24px rgba(76, 125, 255, 0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.summary-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.mastery-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.mastery--excellent {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.mastery--good {
  background: rgba(76, 125, 255, 0.1);
  color: #4c7dff;
}

.mastery--average {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.mastery--needs-work {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.summary-text {
  font-size: 0.95rem;
  color: #475569;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.key-points {
  margin-bottom: 20px;
}

.key-points h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.points-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.point-tag {
  padding: 6px 14px;
  background: rgba(76, 125, 255, 0.1);
  color: #4c7dff;
  font-size: 0.8rem;
  border-radius: 20px;
  font-weight: 500;
}

.suggestions-box {
  padding: 16px;
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.suggestions-box h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.suggestions-box ul {
  margin: 0;
  padding-left: 20px;
}

.suggestions-box li {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 6px;
  line-height: 1.5;
}

.ai-actions {
  display: flex;
  gap: 16px;
}

.ai-btn {
  flex: 1;
  padding: 16px 24px;
  background: white;
  border: 1px solid rgba(76, 125, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.ai-btn:hover {
  border-color: #4c7dff;
  color: #4c7dff;
  transform: translateY(-2px);
}

.ai-btn--primary {
  background: linear-gradient(135deg, #4c7dff 0%, #6366f1 100%);
  color: white;
  border-color: transparent;
}

.ai-btn--primary:hover {
  color: white;
  box-shadow: 0 8px 16px rgba(76, 125, 255, 0.3);
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 1200px) {
  .lessons-container {
    grid-template-columns: 260px 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lessons-main {
    padding: 16px;
  }

  .lessons-container {
    grid-template-columns: 1fr;
  }

  .sidebar-menu {
    position: relative;
    top: 0;
    max-height: none;
  }

  .menu-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }

  .menu-item {
    flex: 1;
    min-width: 140px;
    margin-bottom: 0;
  }

  .menu-item__desc {
    display: none;
  }

  .content-wrapper {
    padding: 20px;
  }

  .panel-header h1 {
    font-size: 1.4rem;
  }

  .course-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 1.4rem;
  }

  .ai-actions {
    flex-direction: column;
  }
}
</style>
