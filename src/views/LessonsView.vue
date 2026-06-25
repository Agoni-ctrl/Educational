<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import SiteNav from "../components/layout/SiteNav.vue";
import * as echarts from "echarts";

// ==================== 状态管理 ====================
// 当前激活的菜单项
const activeMenu = ref("home");
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

// 主页卡片详细描述
function getHomeDesc(id) {
  const map = {
    "course-resource":
      "浏览所有课程资源，查看课程详情与学习进度，点击即可开始学习。",
    "course-analysis": "选择课程查看能力雷达图与时间分配，获取课件制作建议。",
    "qa-session": "课堂互动问答，支持学生提问、教师解答，促进课堂参与。",
    "after-class": "课后深入探讨课程疑难点，巩固学习效果，拓展知识边界。",
    "ai-summary": "AI 自动生成课程学习总结，提炼核心知识点，评估掌握程度。",
  };
  return map[id] || "";
}

// 主页卡片角标
function getHomeBadge(id) {
  const map = {
    "course-resource": "资源库",
    "course-analysis": "数据看板",
    "qa-session": "互动",
    "after-class": "拓展",
    "ai-summary": "AI",
  };
  return map[id] || "";
}

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
    // 课程能力画像（6维度 0-100）
    capabilities: {
      知识覆盖面: 78,
      实验实践性: 92,
      思维启发性: 85,
      互动参与度: 80,
      难度梯度: 65,
      知识系统性: 75,
    },
    // 课程要点
    keyPoints: [
      "控制变量法在实验中的应用",
      "F=ma 公式的推导与理解",
      "加速度与力、质量的关系",
      "实验数据采集与误差分析",
    ],
    // 课件制作建议
    designTips: {
      strengths: "实验环节设计出色，学生动手参与度高",
      improvements: "可增加生活实例导入，降低抽象概念理解门槛",
      suggestions: [
        "增加打点计时器实验动画演示",
        "设计阶梯式练习题巩固公式应用",
      ],
    },
    // 教学时间分配占比
    timeAllocation: [
      { value: 25, name: "理论讲解" },
      { value: 35, name: "实验操作" },
      { value: 20, name: "数据分析" },
      { value: 15, name: "互动讨论" },
      { value: 5, name: "课堂测评" },
    ],
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
    capabilities: {
      知识覆盖面: 72,
      实验实践性: 88,
      思维启发性: 70,
      互动参与度: 65,
      难度梯度: 72,
      知识系统性: 80,
    },
    keyPoints: [
      "浓度对反应速率的影响",
      "温度对反应速率的定量关系",
      "催化剂的作用机理",
      "压强对气体反应的影响",
    ],
    designTips: {
      strengths: "实验素材丰富，变量控制清晰",
      improvements: "理论讲解偏多，建议增加学生自主实验时间",
      suggestions: ["添加微观粒子碰撞动画模拟", "设计探究式实验报告模板"],
    },
    timeAllocation: [
      { value: 20, name: "理论讲解" },
      { value: 30, name: "实验操作" },
      { value: 25, name: "数据分析" },
      { value: 15, name: "互动讨论" },
      { value: 10, name: "课堂测评" },
    ],
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
    capabilities: {
      知识覆盖面: 65,
      实验实践性: 30,
      思维启发性: 90,
      互动参与度: 55,
      难度梯度: 78,
      知识系统性: 85,
    },
    keyPoints: [
      "函数单调性的直观图像理解",
      "单调递增/递减的严格定义",
      "定义法证明函数单调性",
      "复合函数单调性判断",
    ],
    designTips: {
      strengths: "数形结合方法恰当，逻辑推导严谨",
      improvements: "可增加动态几何软件演示，提升直观性",
      suggestions: [
        "用GeoGebra制作函数图像动态演示",
        "增加生活场景中的单调性案例",
      ],
    },
    timeAllocation: [
      { value: 35, name: "概念讲解" },
      { value: 25, name: "例题演示" },
      { value: 20, name: "练习巩固" },
      { value: 12, name: "互动讨论" },
      { value: 8, name: "课堂测评" },
    ],
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
    capabilities: {
      知识覆盖面: 80,
      实验实践性: 95,
      思维启发性: 60,
      互动参与度: 70,
      难度梯度: 50,
      知识系统性: 78,
    },
    keyPoints: [
      "细胞膜的结构与功能",
      "线粒体与叶绿体的比较",
      "显微观察操作规范",
      "细胞器协调工作机制",
    ],
    designTips: {
      strengths: "观察课设计直观，学生兴趣浓厚",
      improvements: "知识点记忆量大，需设计更多互动环节",
      suggestions: ["制作3D细胞器模型图", "设计细胞工厂角色扮演活动"],
    },
    timeAllocation: [
      { value: 20, name: "理论讲解" },
      { value: 40, name: "观察实践" },
      { value: 15, name: "绘图记录" },
      { value: 18, name: "互动讨论" },
      { value: 7, name: "课堂测评" },
    ],
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
    capabilities: {
      知识覆盖面: 70,
      实验实践性: 15,
      思维启发性: 92,
      互动参与度: 75,
      难度梯度: 55,
      知识系统性: 82,
    },
    keyPoints: [
      "鸦片贸易的背景与危害",
      "林则徐虎门销烟的经过",
      "《南京条约》的内容与影响",
      "鸦片战争的历史意义",
    ],
    designTips: {
      strengths: "史料丰富，思辨性强，启发性好",
      improvements: "文字材料较多，建议增加可视化元素",
      suggestions: ["制作事件时间轴思维导图", "引入一手史料图片增强历史感"],
    },
    timeAllocation: [
      { value: 30, name: "史料讲解" },
      { value: 25, name: "思辨讨论" },
      { value: 20, name: "案例分析" },
      { value: 15, name: "互动问答" },
      { value: 10, name: "课堂测评" },
    ],
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
    capabilities: {
      知识覆盖面: 75,
      实验实践性: 35,
      思维启发性: 80,
      互动参与度: 50,
      难度梯度: 70,
      知识系统性: 88,
    },
    keyPoints: [
      "三圈环流的形成机制",
      "气压带与风带的分布规律",
      "季风环流的成因与特点",
      "大气环流对气候的影响",
    ],
    designTips: {
      strengths: "系统性思维培养到位，逻辑链条清晰",
      improvements: "抽象概念多，建议增加3D动画辅助理解",
      suggestions: ["制作三圈环流3D动画演示", "设计全球气候类型连线图"],
    },
    timeAllocation: [
      { value: 25, name: "理论讲解" },
      { value: 15, name: "图表识读" },
      { value: 30, name: "案例分析" },
      { value: 20, name: "互动讨论" },
      { value: 10, name: "课堂测评" },
    ],
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

// ==================== 课程分析——选中课程的能力画像 ====================
const selectedCourseId = ref(1);

// 筛选条件
const filterSubject = ref("");
const filterGrade = ref("");
const filterTag = ref("");
const filterStatus = ref("");

// 可供选择的筛选项（从课程数据动态提取）
const filterOptions = computed(() => ({
  subjects: [...new Set(courses.value.map((c) => c.subject))],
  grades: [...new Set(courses.value.map((c) => c.grade))],
  tags: [...new Set(courses.value.flatMap((c) => c.tags))],
}));

// 根据筛选条件过滤课程
const filteredCourses = computed(() => {
  let result = courses.value;
  if (filterSubject.value) {
    result = result.filter((c) => c.subject === filterSubject.value);
  }
  if (filterGrade.value) {
    result = result.filter((c) => c.grade === filterGrade.value);
  }
  if (filterTag.value) {
    result = result.filter((c) => c.tags.includes(filterTag.value));
  }
  if (filterStatus.value === "completed") {
    result = result.filter((c) => c.progress === 100);
  } else if (filterStatus.value === "in-progress") {
    result = result.filter((c) => c.progress > 0 && c.progress < 100);
  } else if (filterStatus.value === "not-started") {
    result = result.filter((c) => c.progress === 0);
  }
  return result;
});

// 过滤后自动选中第一个匹配课程
watch(filteredCourses, (list) => {
  if (list.length > 0 && !list.find((c) => c.id === selectedCourseId.value)) {
    selectedCourseId.value = list[0].id;
    nextTick(() => reInitCharts());
  }
});

// 重置所有筛选条件
function resetFilters() {
  filterSubject.value = "";
  filterGrade.value = "";
  filterTag.value = "";
  filterStatus.value = "";
}

// 是否有活跃筛选条件
const hasActiveFilter = computed(
  () =>
    filterSubject.value ||
    filterGrade.value ||
    filterTag.value ||
    filterStatus.value,
);

const selectedCourse = computed(() =>
  courses.value.find((c) => c.id === selectedCourseId.value),
);

const radarDimensions = [
  "知识覆盖面",
  "实验实践性",
  "思维启发性",
  "互动参与度",
  "难度梯度",
  "知识系统性",
];

// 雷达图系列数据
const radarData = computed(() => {
  const course = selectedCourse.value;
  if (!course) return [];
  return [
    {
      value: radarDimensions.map((d) => course.capabilities[d]),
      name: course.title,
    },
  ];
});

// 获取维度评级
function getDimensionLabel(value) {
  if (value >= 85) return { text: "强项", color: "#22c55e" };
  if (value >= 65) return { text: "良好", color: "#4c7dff" };
  if (value >= 40) return { text: "待提升", color: "#f59e0b" };
  return { text: "薄弱", color: "#ef4444" };
}

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
  const chartDom = document.getElementById("radar-chart");
  if (!chartDom) return;

  if (charts.radar) charts.radar.dispose();

  const course = selectedCourse.value;
  if (!course) return;

  const radarChart = echarts.init(chartDom);
  charts.radar = radarChart;

  const indicator = radarDimensions.map((name) => ({ name, max: 100 }));

  radarChart.setOption({
    title: {
      text: `${course.title}\n能力画像`,
      left: "center",
      top: 10,
      textStyle: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
    },
    legend: {
      bottom: 5,
      data: [course.title],
      textStyle: { fontSize: 12, color: "#64748b" },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.name) {
          const value = params.value;
          const label = getDimensionLabel(value);
          return `<b>${params.name}</b><br/>分值: <span style="color:${label.color};font-weight:bold">${value}</span> <span style="color:${label.color}">(${label.text})</span>`;
        }
        return "";
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: { color: "#334155" },
    },
    radar: {
      indicator,
      center: ["50%", "55%"],
      radius: "60%",
      shape: "polygon",
      splitNumber: 5,
      axisName: {
        color: "#475569",
        fontSize: 12,
        borderRadius: 3,
        padding: [3, 5],
      },
      splitArea: {
        areaStyle: {
          color: [
            "rgba(76,125,255,0.02)",
            "rgba(76,125,255,0.02)",
            "rgba(76,125,255,0.04)",
            "rgba(76,125,255,0.06)",
            "rgba(76,125,255,0.08)",
          ],
        },
      },
      splitLine: { lineStyle: { color: "rgba(76,125,255,0.15)" } },
      axisLine: { lineStyle: { color: "rgba(76,125,255,0.3)" } },
    },
    series: [
      {
        type: "radar",
        data: radarData.value,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#4c7dff", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(76,125,255,0.35)" },
              { offset: 1, color: "rgba(99,102,241,0.08)" },
            ],
          },
        },
        itemStyle: { color: "#4c7dff", borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: (p) => p.value,
          color: "#475569",
          fontSize: 10,
        },
        emphasis: {
          areaStyle: { color: "rgba(76,125,255,0.5)" },
          label: { fontSize: 13, fontWeight: "bold" },
        },
        animationDuration: 1500,
        animationEasing: "elasticOut",
      },
    ],
  });

  window.addEventListener("resize", () => {
    charts.radar?.resize?.();
    charts.factorPie?.resize?.();
  });

  // 教学时间分配饼图
  const pieDom = document.getElementById("factor-chart");
  if (pieDom && course.timeAllocation) {
    const pieChart = echarts.init(pieDom);
    charts.factorPie = pieChart;

    const pieColors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"];
    pieChart.setOption({
      title: {
        text: "教学时间分配",
        left: "center",
        top: 10,
        textStyle: { fontSize: 15, fontWeight: "bold", color: "#1e293b" },
      },
      tooltip: {
        trigger: "item",
        formatter: "<b>{b}</b><br/>占比: {c}% ({d}%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#334155" },
      },
      legend: {
        bottom: 5,
        textStyle: { fontSize: 11, color: "#64748b" },
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "75%"],
          center: ["50%", "50%"],
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            color: "#475569",
            fontSize: 10,
          },
          emphasis: {
            label: { fontSize: 14, fontWeight: "bold" },
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.15)" },
          },
          data: course.timeAllocation.map((d, i) => ({
            ...d,
            itemStyle: { color: pieColors[i % pieColors.length] },
          })),
          animationType: "scale",
          animationEasing: "elasticOut",
        },
      ],
    });
  }
}

// 重置图表
function reInitCharts() {
  if (charts.radar) {
    charts.radar.dispose();
    charts.radar = null;
  }
  if (charts.factorPie) {
    charts.factorPie.dispose();
    charts.factorPie = null;
  }
  nextTick(() => initCharts());
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
    if (charts.radar) {
      charts.radar.dispose();
      charts.radar = null;
    }
    if (charts.factorPie) {
      charts.factorPie.dispose();
      charts.factorPie = null;
    }
  }
});
</script>

<template>
  <div class="lessons-page">
    <div class="lessons-bg" aria-hidden="true" />
    <SiteNav />

    <main class="lessons-main">
      <div
        class="lessons-container"
        :class="{ 'lessons-container--home': activeMenu === 'home' }"
      >
        <!-- 左侧功能菜单（主页时隐藏） -->
        <aside v-if="activeMenu !== 'home'" class="sidebar-menu">
          <div
            class="menu-header"
            @click="switchMenu('home')"
            style="cursor: pointer"
          >
            <div class="menu-icon">🎓</div>
            <h2>课堂教程</h2>
            <p>点击返回主页</p>
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
            :class="{
              'content-wrapper--transitioning': isTransitioning,
              'content-wrapper--home': activeMenu === 'home',
            }"
          >
            <!-- 主页 -->
            <div
              v-if="activeMenu === 'home'"
              class="content-panel content-panel--home"
            >
              <!-- 背景装饰 -->
              <div class="home-backdrop">
                <div class="home-orb home-orb--1"></div>
                <div class="home-orb home-orb--2"></div>
                <div class="home-orb home-orb--3"></div>
              </div>

              <!-- Hero 区域 -->
              <div class="home-hero">
                <div class="home-hero-badge">智能教学平台</div>
                <h1 class="home-hero-title">
                  课堂<span class="gradient-text">教程</span>
                </h1>
                <p class="home-hero-subtitle">
                  集成课程资源、数据分析、互动问答与AI总结的一站式教学工具，<br />帮助教师高效备课，提升课堂质量。
                </p>
                <div class="home-stats-row">
                  <div class="home-stat">
                    <span class="home-stat-num">{{ courses.length }}</span>
                    <span class="home-stat-label">课程资源</span>
                  </div>
                  <div class="home-stat">
                    <span class="home-stat-num">6</span>
                    <span class="home-stat-label">学科覆盖</span>
                  </div>
                  <div class="home-stat">
                    <span class="home-stat-num">5</span>
                    <span class="home-stat-label">功能模块</span>
                  </div>
                  <div class="home-stat">
                    <span class="home-stat-num">86%</span>
                    <span class="home-stat-label">平均完成率</span>
                  </div>
                </div>
              </div>

              <!-- 模块卡片 -->
              <div class="home-section">
                <h2 class="home-section-title">选择功能模块</h2>
                <p class="home-section-desc">点击卡片进入对应的教学工具模块</p>
                <div class="home-cards">
                  <div
                    v-for="item in menuItems"
                    :key="item.id"
                    class="home-card"
                    :class="[`home-card--${item.id}`]"
                    @click="switchMenu(item.id)"
                  >
                    <div class="home-card-top">
                      <div class="home-card-icon-wrap">
                        <span class="home-card-emoji">{{ item.icon }}</span>
                      </div>
                      <span class="home-card-badge">{{
                        getHomeBadge(item.id)
                      }}</span>
                    </div>
                    <div class="home-card-body">
                      <h3 class="home-card-title">{{ item.label }}</h3>
                      <p class="home-card-desc">{{ getHomeDesc(item.id) }}</p>
                    </div>
                    <div class="home-card-footer">
                      <span class="home-card-action">
                        进入模块
                        <span class="home-card-arrow">→</span>
                      </span>
                    </div>
                    <div class="home-card-glow"></div>
                  </div>
                </div>
              </div>

              <!-- 底部提示 -->
              <div class="home-footer-hint">
                <span>💡 也可以使用左侧菜单栏在各模块间快速切换</span>
              </div>
            </div>

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
                <p>选择一个课程，查看该课程的能力画像与课件制作建议</p>
              </div>

              <div class="analysis-dashboard">
                <!-- 下拉筛选栏 -->
                <div class="filter-search-bar">
                  <div class="filter-row">
                    <div class="filter-group">
                      <label class="filter-label">学科</label>
                      <select v-model="filterSubject" class="filter-select">
                        <option value="">全部学科</option>
                        <option
                          v-for="sub in filterOptions.subjects"
                          :key="sub"
                          :value="sub"
                        >
                          {{ sub }}
                        </option>
                      </select>
                    </div>
                    <div class="filter-group">
                      <label class="filter-label">年级</label>
                      <select v-model="filterGrade" class="filter-select">
                        <option value="">全部年级</option>
                        <option
                          v-for="g in filterOptions.grades"
                          :key="g"
                          :value="g"
                        >
                          {{ g }}
                        </option>
                      </select>
                    </div>
                    <div class="filter-group">
                      <label class="filter-label">标签</label>
                      <select v-model="filterTag" class="filter-select">
                        <option value="">全部标签</option>
                        <option
                          v-for="t in filterOptions.tags"
                          :key="t"
                          :value="t"
                        >
                          {{ t }}
                        </option>
                      </select>
                    </div>
                    <div class="filter-group">
                      <label class="filter-label">进度</label>
                      <select v-model="filterStatus" class="filter-select">
                        <option value="">全部状态</option>
                        <option value="completed">已完成</option>
                        <option value="in-progress">进行中</option>
                        <option value="not-started">未开始</option>
                      </select>
                    </div>
                  </div>
                  <div class="filter-actions">
                    <button
                      class="filter-btn filter-btn-go"
                      @click="reInitCharts()"
                    >
                      筛选
                    </button>
                    <button
                      class="filter-btn filter-btn-reset"
                      :disabled="!hasActiveFilter"
                      @click="resetFilters()"
                    >
                      重置
                    </button>
                  </div>
                </div>

                <!-- 筛选结果提示 -->
                <div v-if="hasActiveFilter" class="result-count">
                  找到 {{ filteredCourses.length }} 门匹配课程
                </div>

                <!-- 课程选择器 -->
                <div class="course-selector-bar">
                  <div
                    v-for="course in filteredCourses"
                    :key="course.id"
                    class="course-chip"
                    :class="{ active: selectedCourseId === course.id }"
                    @click="
                      selectedCourseId = course.id;
                      reInitCharts();
                    "
                  >
                    <span class="chip-subject">{{ course.subject }}</span>
                    <span class="chip-title">{{ course.title }}</span>
                  </div>
                </div>

                <!-- 选中课程信息卡片 -->
                <div v-if="selectedCourse" class="course-info-card">
                  <div class="info-card-left">
                    <h2>{{ selectedCourse.title }}</h2>
                    <div class="info-card-tags">
                      <span class="info-tag">{{ selectedCourse.subject }}</span>
                      <span class="info-tag">{{ selectedCourse.grade }}</span>
                      <span class="info-tag">{{ selectedCourse.teacher }}</span>
                      <span class="info-tag">{{
                        selectedCourse.duration
                      }}</span>
                    </div>
                    <p class="info-card-desc">
                      {{ selectedCourse.description }}
                    </p>
                  </div>
                  <div class="info-card-right">
                    <span
                      class="info-badge"
                      :style="{
                        background:
                          selectedCourse.progress === 100
                            ? '#22c55e'
                            : selectedCourse.progress > 0
                              ? '#f59e0b'
                              : '#94a3b8',
                      }"
                    >
                      {{
                        selectedCourse.progress === 100
                          ? "已完成"
                          : selectedCourse.progress > 0
                            ? "进行中"
                            : "未开始"
                      }}
                    </span>
                  </div>
                </div>

                <!-- 雷达图 + 饼图 + 维度解读 -->
                <div class="radar-section">
                  <div class="radar-chart-container">
                    <div id="radar-chart" class="chart"></div>
                  </div>
                  <div class="radar-chart-container">
                    <div id="factor-chart" class="chart"></div>
                  </div>
                  <div class="dimension-list">
                    <h3>📐 能力维度解读</h3>
                    <div
                      v-for="dim in radarDimensions"
                      :key="dim"
                      class="dimension-item"
                    >
                      <div class="dim-header">
                        <span class="dim-name">{{ dim }}</span>
                        <span
                          class="dim-score"
                          :style="{
                            color: getDimensionLabel(
                              selectedCourse?.capabilities[dim],
                            ).color,
                          }"
                        >
                          {{ selectedCourse?.capabilities[dim] }}
                        </span>
                      </div>
                      <div class="dim-bar-bg">
                        <div
                          class="dim-bar-fill"
                          :style="{
                            width:
                              (selectedCourse?.capabilities[dim] || 0) + '%',
                            background: getDimensionLabel(
                              selectedCourse?.capabilities[dim],
                            ).color,
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 课程要点 + 课件建议 -->
                <div class="tips-row">
                  <!-- 课程要点 -->
                  <div class="tips-card">
                    <h3>📋 核心知识点</h3>
                    <ul class="keypoints-list">
                      <li
                        v-for="(point, idx) in selectedCourse?.keyPoints"
                        :key="idx"
                      >
                        <span class="kp-index">{{ idx + 1 }}</span>
                        <span>{{ point }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- 课件制作建议 -->
                  <div class="tips-card">
                    <h3>💡 课件制作建议</h3>
                    <div class="design-section">
                      <div class="design-item strength">
                        <span class="design-label">✅ 优势</span>
                        <p>{{ selectedCourse?.designTips?.strengths }}</p>
                      </div>
                      <div class="design-item improvement">
                        <span class="design-label">⚠️ 改进方向</span>
                        <p>{{ selectedCourse?.designTips?.improvements }}</p>
                      </div>
                      <div class="design-item suggestions">
                        <span class="design-label">🔧 具体建议</span>
                        <ul>
                          <li
                            v-for="(tip, idx) in selectedCourse?.designTips
                              ?.suggestions"
                            :key="idx"
                          >
                            {{ tip }}
                          </li>
                        </ul>
                      </div>
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

    <!-- 页面底部装饰 -->
    <footer class="lessons-footer">
      <!-- 波浪分隔线 -->
      <div class="footer-wave">
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40 C150 10, 300 70, 600 40 C900 10, 1050 70, 1200 40 L1200 80 L0 80 Z"
            class="footer-wave-path footer-wave--front"
          />
          <path
            d="M0 55 C200 25, 400 80, 600 55 C800 30, 1000 80, 1200 55 L1200 80 L0 80 Z"
            class="footer-wave-path footer-wave--back"
          />
        </svg>
      </div>

      <div class="footer-content">
        <!-- 底部装饰光球 -->
        <div class="footer-glow footer-glow--1"></div>
        <div class="footer-glow footer-glow--2"></div>
        <div class="footer-glow footer-glow--3"></div>

        <div class="footer-inner">
          <!-- 品牌区 -->
          <div class="footer-brand">
            <div class="footer-logo">🎓</div>
            <h3>课堂教程</h3>
            <p>
              集成课程资源、数据分析、互动问答<br />与AI总结的一站式智能教学平台
            </p>
          </div>

          <!-- 快速导航 -->
          <div class="footer-nav">
            <h4>功能模块</h4>
            <ul>
              <li
                v-for="item in menuItems"
                :key="item.id"
                @click="switchMenu(item.id)"
              >
                {{ item.icon }} {{ item.label }}
              </li>
            </ul>
          </div>

          <!-- 数据概览 -->
          <div class="footer-stats">
            <h4>教学数据</h4>
            <div class="footer-stat-row">
              <div class="footer-stat-item">
                <span class="footer-stat-num">{{ courses.length }}</span>
                <span class="footer-stat-desc">课程资源</span>
              </div>
              <div class="footer-stat-item">
                <span class="footer-stat-num">6</span>
                <span class="footer-stat-desc">学科覆盖</span>
              </div>
              <div class="footer-stat-item">
                <span class="footer-stat-num">5</span>
                <span class="footer-stat-desc">功能模块</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部线 -->
        <div class="footer-bottom">
          <span class="footer-copy">© 2026 课堂教程 · 智能教学平台</span>
          <div class="footer-dots">
            <span class="footer-dot"></span>
            <span class="footer-dot"></span>
            <span class="footer-dot"></span>
          </div>
        </div>
      </div>
    </footer>
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
    ),
    radial-gradient(
      800px 400px at 70% 90%,
      rgba(76, 125, 255, 0.04),
      transparent
    ),
    radial-gradient(
      600px 350px at 20% 95%,
      rgba(139, 92, 246, 0.03),
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
  padding: 100px 24px 24px;
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

.content-wrapper--home {
  padding: 0;
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

/* ==================== 主页 ==================== */
.lessons-container--home {
  grid-template-columns: 1fr;
  max-width: 1200px;
  margin: 0 auto;
}

.content-panel--home {
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
  position: relative;
  overflow: hidden;
}

/* 背景装饰层 */
.home-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.home-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
}

.home-orb--1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(76, 125, 255, 0.5), transparent);
  top: -120px;
  right: -60px;
  animation: orbFloat1 8s ease-in-out infinite alternate;
}

.home-orb--2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent);
  bottom: 15%;
  left: -80px;
  animation: orbFloat2 10s ease-in-out infinite alternate;
}

.home-orb--3 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.25), transparent);
  top: 55%;
  right: 10%;
  animation: orbFloat3 9s ease-in-out infinite alternate;
}

@keyframes orbFloat1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(30px, -20px) scale(1.05);
  }
}

@keyframes orbFloat2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-25px, 15px) scale(1.08);
  }
}

@keyframes orbFloat3 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(20px, -10px) scale(1.06);
  }
}

/* Hero 区域 */
.home-hero {
  text-align: center;
  padding: 70px 20px 60px;
  position: relative;
  z-index: 1;
}

.home-hero::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 3px;
  border-radius: 4px;
  background: linear-gradient(90deg, #4c7dff, #a78bfa, #f59e0b);
}

.home-hero-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(76, 125, 255, 0.08);
  color: #4c7dff;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.home-hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 16px 0;
  letter-spacing: -1px;
}

.gradient-text {
  background: linear-gradient(135deg, #4c7dff 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-hero-subtitle {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.7;
  margin: 0 auto 36px;
  max-width: 560px;
}

/* Hero 统计数据 */
.home-stats-row {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.home-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.home-stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.home-stat-label {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}

/* 模块卡片区域 */
.home-section {
  padding: 50px 30px 40px;
  position: relative;
  z-index: 1;
}

.home-section-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.home-section-desc {
  text-align: center;
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0 0 40px 0;
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 32px;
}

.home-card {
  background: white;
  border-radius: 20px;
  padding: 28px 22px 22px;
  border: 1px solid rgba(76, 125, 255, 0.06);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.home-card-glow {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.home-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(76, 125, 255, 0.12);
  border-color: rgba(76, 125, 255, 0.2);
}

.home-card:hover .home-card-glow {
  opacity: 1;
}

/* 按模块类型着色 */
.home-card--course-resource .home-card-icon-wrap {
  background: #eff6ff;
}
.home-card--course-resource .home-card-badge {
  background: #3b82f6;
}
.home-card--course-resource:hover .home-card-badge {
  background: #2563eb;
}

.home-card--course-analysis .home-card-icon-wrap {
  background: #fef3c7;
}
.home-card--course-analysis .home-card-badge {
  background: #f59e0b;
}
.home-card--course-analysis:hover .home-card-badge {
  background: #d97706;
}

.home-card--qa-session .home-card-icon-wrap {
  background: #ecfdf5;
}
.home-card--qa-session .home-card-badge {
  background: #10b981;
}
.home-card--qa-session:hover .home-card-badge {
  background: #059669;
}

.home-card--after-class .home-card-icon-wrap {
  background: #faf5ff;
}
.home-card--after-class .home-card-badge {
  background: #8b5cf6;
}
.home-card--after-class:hover .home-card-badge {
  background: #7c3aed;
}

.home-card--ai-summary .home-card-icon-wrap {
  background: #fee2e2;
}
.home-card--ai-summary .home-card-badge {
  background: #ef4444;
}
.home-card--ai-summary:hover .home-card-badge {
  background: #dc2626;
}

.home-card--course-resource .home-card-glow {
  background: radial-gradient(
    circle at 50% 0%,
    rgba(59, 130, 246, 0.08),
    transparent 70%
  );
}
.home-card--course-analysis .home-card-glow {
  background: radial-gradient(
    circle at 50% 0%,
    rgba(245, 158, 11, 0.08),
    transparent 70%
  );
}
.home-card--qa-session .home-card-glow {
  background: radial-gradient(
    circle at 50% 0%,
    rgba(16, 185, 129, 0.08),
    transparent 70%
  );
}
.home-card--after-class .home-card-glow {
  background: radial-gradient(
    circle at 50% 0%,
    rgba(139, 92, 246, 0.08),
    transparent 70%
  );
}
.home-card--ai-summary .home-card-glow {
  background: radial-gradient(
    circle at 50% 0%,
    rgba(239, 68, 68, 0.08),
    transparent 70%
  );
}

.home-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.home-card-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.home-card:hover .home-card-icon-wrap {
  transform: scale(1.1) rotate(-3deg);
}

.home-card-emoji {
  font-size: 1.6rem;
}

.home-card-badge {
  font-size: 0.7rem;
  color: white;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.home-card-body {
  flex: 1;
}

.home-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.home-card-desc {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.55;
  margin: 0;
}

.home-card-footer {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.home-card-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4c7dff;
  transition: color 0.25s ease;
}

.home-card:hover .home-card-action {
  color: #1e40af;
}

.home-card-arrow {
  transition: transform 0.3s ease;
  display: inline-block;
}

.home-card:hover .home-card-arrow {
  transform: translateX(4px);
}

/* 底部提示 */
.home-footer-hint {
  text-align: center;
  padding: 32px 0 12px;
  position: relative;
  z-index: 1;
}

.home-footer-hint span {
  font-size: 0.85rem;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
  padding: 8px 20px;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .home-hero {
    padding: 40px 16px 36px;
  }

  .home-hero-title {
    font-size: 2.2rem;
  }

  .home-stats-row {
    gap: 20px;
  }

  .home-stat-num {
    font-size: 1.5rem;
  }

  .home-cards {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .home-card {
    padding: 20px 16px 18px;
  }
}

@media (max-width: 500px) {
  .home-cards {
    grid-template-columns: 1fr;
  }

  .home-hero-title {
    font-size: 1.8rem;
  }

  .home-stats-row {
    gap: 12px;
  }
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

/* 下拉筛选栏 */
.filter-search-bar {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 130px;
  flex: 1;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.filter-select {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1e293b;
  background: white;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.filter-select:focus {
  border-color: #4c7dff;
  box-shadow: 0 0 0 3px rgba(76, 125, 255, 0.1);
}

.filter-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.filter-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-btn-go {
  background: linear-gradient(135deg, #4c7dff, #6366f1);
  color: white;
}

.filter-btn-go:hover {
  box-shadow: 0 4px 12px rgba(76, 125, 255, 0.3);
  transform: translateY(-1px);
}

.filter-btn-reset {
  background: #f1f5f9;
  color: #64748b;
}

.filter-btn-reset:hover:not(:disabled) {
  background: #e2e8f0;
  color: #475569;
}

.filter-btn-reset:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.result-count {
  font-size: 0.8rem;
  color: #4c7dff;
  font-weight: 500;
}

/* 筛选结果提示 + 课程选择器 */
.course-selector-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.course-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.course-chip:hover {
  border-color: #4c7dff;
  box-shadow: 0 2px 8px rgba(76, 125, 255, 0.1);
}

.course-chip.active {
  background: linear-gradient(135deg, #4c7dff, #6366f1);
  border-color: transparent;
}

.course-chip.active .chip-subject,
.course-chip.active .chip-title {
  color: white;
}

.chip-subject {
  font-size: 0.7rem;
  padding: 2px 8px;
  background: rgba(76, 125, 255, 0.1);
  border-radius: 4px;
  font-weight: 600;
  color: #4c7dff;
  white-space: nowrap;
}

.course-chip.active .chip-subject {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.chip-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
}

/* 课程信息卡片 */
.course-info-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.info-card-left h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.info-card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.info-tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: rgba(76, 125, 255, 0.08);
  border-radius: 6px;
  color: #4c7dff;
  font-weight: 500;
}

.info-card-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.info-badge {
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  white-space: nowrap;
}

/* 雷达图区域 */
.radar-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.radar-chart-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.dimension-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.dimension-list h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.dimension-item {
  margin-bottom: 14px;
}

.dimension-item:last-child {
  margin-bottom: 0;
}

.dim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dim-name {
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
}

.dim-score {
  font-size: 0.9rem;
  font-weight: 700;
}

.dim-bar-bg {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.dim-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 要点 + 建议行 */
.tips-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.tips-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 125, 255, 0.1);
}

.tips-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.keypoints-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.keypoints-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.5;
}

.kp-index {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4c7dff, #6366f1);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
}

.design-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.design-item {
  padding: 14px;
  border-radius: 10px;
}

.design-item.strength {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.design-item.improvement {
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.design-item.suggestions {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.design-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #475569;
}

.design-item p {
  font-size: 0.82rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

.design-item ul {
  list-style: disc;
  padding-left: 18px;
  margin: 0;
}

.design-item ul li {
  font-size: 0.8rem;
  color: #475569;
  margin-bottom: 4px;
  line-height: 1.4;
}

.chart {
  width: 100%;
  height: 380px;
}

@media (max-width: 900px) {
  .radar-section,
  .tips-row {
    grid-template-columns: 1fr;
  }

  .course-selector-bar {
    flex-direction: column;
  }

  .course-chip {
    width: 100%;
  }
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
    padding: 88px 16px 16px;
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

/* ==================== 页面底部装饰 ==================== */
.lessons-footer {
  position: relative;
  z-index: 1;
  margin-top: 60px;
}

/* 波浪分隔线 */
.footer-wave {
  position: relative;
  width: 100%;
  height: 80px;
  overflow: hidden;
  line-height: 0;
}

.footer-wave svg {
  width: 100%;
  height: 100%;
}

.footer-wave-path {
  fill: #f8fafc;
}

.footer-wave--front {
  fill: rgba(76, 125, 255, 0.04);
}

.footer-wave--back {
  fill: rgba(99, 102, 241, 0.02);
}

/* 底部内容区 */
.footer-content {
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(76, 125, 255, 0.03) 0%,
    rgba(99, 102, 241, 0.05) 40%,
    rgba(15, 23, 42, 0.03) 100%
  );
  border-top: 1px solid rgba(76, 125, 255, 0.06);
  padding: 60px 24px 32px;
  overflow: hidden;
}

/* 底部光球装饰 */
.footer-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.12;
  pointer-events: none;
}

.footer-glow--1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(76, 125, 255, 0.5), transparent);
  top: -80px;
  left: 10%;
  animation: footerGlow1 12s ease-in-out infinite alternate;
}

.footer-glow--2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent);
  bottom: -40px;
  right: 5%;
  animation: footerGlow2 15s ease-in-out infinite alternate;
}

.footer-glow--3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.25), transparent);
  top: 30%;
  right: 40%;
  animation: footerGlow3 10s ease-in-out infinite alternate;
}

@keyframes footerGlow1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(40px, -25px) scale(1.1);
  }
}

@keyframes footerGlow2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-30px, 20px) scale(1.12);
  }
}

@keyframes footerGlow3 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(15px, -15px) scale(1.08);
  }
}

.footer-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 48px;
}

/* 品牌区 */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-logo {
  font-size: 2.4rem;
  margin-bottom: 4px;
}

.footer-brand h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.footer-brand p {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.7;
  margin: 0;
}

/* 导航 */
.footer-nav h4,
.footer-stats h4 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
}

.footer-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-nav li {
  font-size: 0.82rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
}

.footer-nav li:hover {
  color: #4c7dff;
  transform: translateX(4px);
}

/* 数据概览 */
.footer-stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.footer-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: rgba(76, 125, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(76, 125, 255, 0.06);
}

.footer-stat-num {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4c7dff;
  line-height: 1;
}

.footer-stat-desc {
  font-size: 0.7rem;
  color: #94a3b8;
}

/* 底部线 */
.footer-bottom {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 40px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(76, 125, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copy {
  font-size: 0.78rem;
  color: #94a3b8;
}

.footer-dots {
  display: flex;
  gap: 6px;
}

.footer-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #c7d2fe;
  animation: dotPulse 2s ease-in-out infinite;
}

.footer-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.footer-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

@media (max-width: 768px) {
  .lessons-footer {
    margin-top: 40px;
  }

  .footer-content {
    padding: 40px 16px 24px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer-stat-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
