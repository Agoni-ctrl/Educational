<script setup>
import { ref, reactive, computed } from "vue";
import { RouterLink } from "vue-router";
import { useCommunity, formatTime } from "../composables/useCommunity.js";

// 用户信息
const userInfo = reactive({
  name: "测试用户",
  avatar: null,
  email: "user@example.com",
  isVerified: false,
  realName: "",
  idCard: "",
  birthday: "",
  qq: "",
  wechat: "",
  motto: "",
});

// 编辑状态
const isEditingName = ref(false);
const tempName = ref(userInfo.name);

// 发布想法
const postContent = ref("");
const selectedFiles = ref([]);
const showEmojiPicker = ref(false);

// Emoji 列表
const emojis = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🥸",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "😈",
  "👿",
  "👹",
  "👺",
  "🤡",
  "💩",
  "👻",
  "💀",
  "☠️",
  "👽",
  "👾",
  "🤖",
  "🎃",
  "😺",
  "😸",
  "😹",
  "😻",
  "😼",
  "😽",
  "🙀",
  "😿",
  "😾",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🤎",
  "💔",
  "❣️",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
  "💟",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👐",
  "🤲",
  "🤝",
  "🤜",
  "🤛",
  "✊",
];

// 已发布的想法列表
const posts = ref([
  {
    id: 1,
    content: "今天分享一个很有趣的教学方法，让学生更容易理解抽象概念！",
    time: "2小时前",
    likes: 12,
    comments: 3,
  },
]);

// 当前选中的菜单
const activeMenu = ref("profile");

// 菜单列表
const menuItems = [
  { id: "profile", label: "个人资料", icon: "👤" },
  { id: "usage", label: "使用记录", icon: "📊" },
  { id: "favorites", label: "我的收藏", icon: "⭐" },
  { id: "verify", label: "实名认证", icon: "✅" },
  { id: "posts", label: "发布想法", icon: "💡" },
  { id: "settings", label: "账号设置", icon: "⚙️" },
];

// 使用记录数据
const usageTimeRange = ref("week"); // 'week' | 'year'
const hoveredDataPoint = ref(null);
const selectedDate = ref(null);

// 社区收藏功能
const community = useCommunity();

// 获取收藏的文章列表
const favoritePosts = computed(() => {
  return community.getPosts("favorite");
});

// 取消收藏
function removeFavorite(postId) {
  community.toggleFavorite(postId);
}

// 跳转到社区详情
function goToCommunityPost(postId) {
  window.location.href = `/community?post=${postId}`;
}

// 模拟使用数据
const usageData = ref({
  week: {
    labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    data: [3, 5, 2, 8, 4, 6, 7],
    files: {
      周一: ["数学课件.pptx", "语文教案.docx", "英语单词表.xlsx"],
      周二: [
        "物理实验.pptx",
        "化学方程式.docx",
        "生物图解.pptx",
        "历史年表.xlsx",
        "地理地图.pptx",
      ],
      周三: ["作文模板.docx", "阅读理解.docx"],
      周四: [
        "期末复习.pptx",
        "模拟试卷.docx",
        "成绩统计.xlsx",
        "家长会.pptx",
        "课程表.xlsx",
        "教学计划.docx",
        "学生名单.xlsx",
        "活动方案.pptx",
      ],
      周五: [
        "班会课件.pptx",
        "安全教育.docx",
        "心理健康.pptx",
        "体育锻炼.xlsx",
      ],
      周六: [
        "周末作业.docx",
        "阅读材料.pptx",
        "练习题.xlsx",
        "答案解析.docx",
        "补充资料.pptx",
        "复习提纲.docx",
      ],
      周日: [
        "下周计划.pptx",
        "备课笔记.docx",
        "教学反思.xlsx",
        "学生评价.docx",
        "家长信.docx",
        "活动照片.pptx",
        "总结报告.docx",
      ],
    },
  },
  year: {
    labels: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    data: [45, 38, 52, 41, 48, 55, 42, 39, 46, 50, 44, 58],
    files: {},
  },
});

// 生成年度的模拟文件数据
const months = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];
const fileTypes = [".pptx", ".docx", ".xlsx", ".pdf", ".txt"];
const prefixes = [
  "课件",
  "教案",
  "试卷",
  "统计",
  "计划",
  "总结",
  "报告",
  "笔记",
  "方案",
  "记录",
];

months.forEach((month, index) => {
  const count = usageData.value.year.data[index];
  usageData.value.year.files[month] = Array.from({ length: count }, (_, j) => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const weekNum = Math.floor(j / 7) + 1;
    return `${month}${weekNum}周-${prefix}${j + 1}${type}`;
  });
});

// 计算折线图路径
const chartPath = computed(() => {
  const data = usageData.value[usageTimeRange.value].data;
  const max = Math.max(...data);
  const width = 700;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - (value / max) * chartHeight;
    return { x, y, value, index };
  });

  if (points.length === 0) return "";

  // 生成平滑曲线
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 3;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
    const cpy2 = curr.y;
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }

  return { path, points, max };
});

// 切换时间范围
function switchTimeRange(range) {
  usageTimeRange.value = range;
  selectedDate.value = null;
}

// 处理数据点悬停
function handlePointHover(point) {
  hoveredDataPoint.value = point;
}

// 处理数据点离开
function handlePointLeave() {
  hoveredDataPoint.value = null;
}

// 处理数据点点击
function handlePointClick(point) {
  const labels = usageData.value[usageTimeRange.value].labels;
  selectedDate.value = labels[point.index];
}

// 计算属性：检测内容中的链接
const parsedContent = computed(() => {
  let content = postContent.value;
  // 检测 URL 并转换为可点击链接
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.replace(
    urlRegex,
    '<a href="$1" target="_blank" class="link">$1</a>',
  );
});

// 头像上传
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      userInfo.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// 保存用户名
function saveName() {
  if (tempName.value.trim()) {
    userInfo.name = tempName.value.trim();
  }
  isEditingName.value = false;
}

// 取消编辑
function cancelEditName() {
  tempName.value = userInfo.name;
  isEditingName.value = false;
}

// 提交实名认证
function submitVerification() {
  if (userInfo.realName && userInfo.idCard) {
    userInfo.isVerified = true;
    alert("实名认证提交成功！");
  } else {
    alert("请填写完整信息");
  }
}

// 插入 Emoji
function insertEmoji(emoji) {
  postContent.value += emoji;
  showEmojiPicker.value = false;
}

// 文件上传
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    selectedFiles.value.push({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type,
    });
  });
}

// 移除文件
function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

// 发布想法
function publishPost() {
  if (!postContent.value.trim() && selectedFiles.value.length === 0) {
    alert("请输入内容或上传文件");
    return;
  }

  const newPost = {
    id: Date.now(),
    content: postContent.value,
    files: [...selectedFiles.value],
    time: "刚刚",
    likes: 0,
    comments: 0,
  };

  posts.value.unshift(newPost);
  postContent.value = "";
  selectedFiles.value = [];
  alert("发布成功！");
}

// 点赞
function likePost(post) {
  post.likes++;
}

// 保存个人资料
function saveProfile() {
  alert("个人资料保存成功！");
}
</script>

<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <header class="profile-header">
      <div class="profile-header__inner">
        <RouterLink to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          返回首页
        </RouterLink>
        <h1 class="profile-title">个人中心</h1>
      </div>
    </header>

    <div class="profile-container">
      <!-- 左侧菜单 -->
      <aside class="profile-sidebar">
        <div class="user-card">
          <div
            class="user-card__avatar"
            :class="{ 'has-avatar': userInfo.avatar }"
          >
            <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="头像" />
            <span v-else>{{ userInfo.name.charAt(0) }}</span>
          </div>
          <h3 class="user-card__name">{{ userInfo.name }}</h3>
          <p class="user-card__email">{{ userInfo.email }}</p>
          <span v-if="userInfo.isVerified" class="verified-badge"
            >✓ 已认证</span
          >
        </div>

        <nav class="profile-menu">
          <button
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item"
            :class="{ 'menu-item--active': activeMenu === item.id }"
            @click="activeMenu = item.id"
          >
            <span class="menu-item__icon">{{ item.icon }}</span>
            <span class="menu-item__label">{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="profile-main">
        <!-- 个人资料 -->
        <div v-if="activeMenu === 'profile'" class="content-panel">
          <h2 class="panel-title">个人资料</h2>

          <div class="form-section">
            <label class="form-label">头像</label>
            <div class="avatar-upload">
              <div
                class="avatar-preview"
                :class="{ 'has-avatar': userInfo.avatar }"
              >
                <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="头像" />
                <span v-else>{{ userInfo.name.charAt(0) }}</span>
              </div>
              <label class="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleAvatarUpload"
                  hidden
                />
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                上传头像
              </label>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">用户名</label>
            <div class="name-edit">
              <template v-if="isEditingName">
                <input
                  v-model="tempName"
                  type="text"
                  class="name-input"
                  maxlength="20"
                  @keyup.enter="saveName"
                />
                <button class="btn-icon btn-success" @click="saveName">
                  ✓
                </button>
                <button class="btn-icon btn-cancel" @click="cancelEditName">
                  ✕
                </button>
              </template>
              <template v-else>
                <span class="name-display">{{ userInfo.name }}</span>
                <button class="btn-edit" @click="isEditingName = true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  编辑
                </button>
              </template>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">邮箱</label>
            <p class="info-text">{{ userInfo.email }}</p>
          </div>

          <!-- 生日 -->
          <div class="form-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M16 2v4M8 2v4M3 10h18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              生日
            </label>
            <input v-model="userInfo.birthday" type="date" class="form-input" />
          </div>

          <!-- QQ -->
          <div class="form-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1.5 3.5-1 1-2.5 2-3 3.5-.5 2 1 3.5 2.5 4-.5 1.5-.5 3 0 4.5 2-1 4.5-1.5 6-1.5s4 .5 6 1.5c.5-1.5.5-3 0-4.5 1.5-.5 3-2 2.5-4-.5-1.5-2-2.5-3-3.5 1-1 1.5-2 1.5-3.5 0-2.5-2.5-5-6-5z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              QQ
            </label>
            <input
              v-model="userInfo.qq"
              type="text"
              class="form-input"
              placeholder="请输入QQ号码"
              maxlength="15"
            />
          </div>

          <!-- 微信 -->
          <div class="form-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11a2 2 0 100-4 2 2 0 000 4zM15 11a2 2 0 100-4 2 2 0 000 4z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M8 16c0 2 2.5 4 6 4s6-2 6-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M18 8c2.5 1.5 4 4 4 6.5 0 4-3.5 7.5-9 7.5-1.5 0-3-.5-4-1l-4 1 1.5-3C4 17 3 15 3 12.5 3 7.5 7 4 12 4c1 0 2 .5 2.5.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              微信
            </label>
            <input
              v-model="userInfo.wechat"
              type="text"
              class="form-input"
              placeholder="请输入微信号"
              maxlength="20"
            />
          </div>

          <!-- 个人座右铭 -->
          <div class="form-section">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3c-4.5 0-8 3-8 7 0 2 1 3.5 2.5 4.5L5 20l4-1.5c1 .5 2 .5 3 .5 4.5 0 8-3 8-7s-3.5-7-8-7z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path
                  d="M9 13c1 1 2.5 1 4 0"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              个人座右铭
            </label>
            <textarea
              v-model="userInfo.motto"
              class="form-textarea"
              placeholder="写下你的人生格言..."
              rows="3"
              maxlength="100"
            ></textarea>
            <span class="char-count">{{ userInfo.motto.length }}/100</span>
          </div>

          <!-- 保存按钮 -->
          <div class="form-section">
            <button class="btn-save" @click="saveProfile">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M17 21v-8H7v8M7 3v5h8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              保存资料
            </button>
          </div>
        </div>

        <!-- 使用记录 -->
        <div v-if="activeMenu === 'usage'" class="content-panel">
          <div class="usage-header">
            <h2 class="panel-title">使用记录</h2>
            <div class="time-range-switch">
              <button
                class="range-btn"
                :class="{ 'range-btn--active': usageTimeRange === 'week' }"
                @click="switchTimeRange('week')"
              >
                近一周
              </button>
              <button
                class="range-btn"
                :class="{ 'range-btn--active': usageTimeRange === 'year' }"
                @click="switchTimeRange('year')"
              >
                近一年
              </button>
            </div>
          </div>

          <!-- 统计概览 -->
          <div class="usage-stats">
            <div class="stat-card">
              <div class="stat-value">
                {{ usageData[usageTimeRange].data.reduce((a, b) => a + b, 0) }}
              </div>
              <div class="stat-label">创建文件总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{ Math.max(...usageData[usageTimeRange].data) }}
              </div>
              <div class="stat-label">单日最高创建</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{
                  (
                    usageData[usageTimeRange].data.reduce((a, b) => a + b, 0) /
                    usageData[usageTimeRange].data.length
                  ).toFixed(1)
                }}
              </div>
              <div class="stat-label">日均创建</div>
            </div>
          </div>

          <!-- 折线图 -->
          <div class="chart-container">
            <svg
              class="chart-svg"
              viewBox="0 0 700 250"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- 网格线 -->
              <g class="grid-lines">
                <line
                  x1="40"
                  y1="40"
                  x2="660"
                  y2="40"
                  stroke="#e2e8f0"
                  stroke-width="1"
                  stroke-dasharray="4"
                />
                <line
                  x1="40"
                  y1="90"
                  x2="660"
                  y2="90"
                  stroke="#e2e8f0"
                  stroke-width="1"
                  stroke-dasharray="4"
                />
                <line
                  x1="40"
                  y1="140"
                  x2="660"
                  y2="140"
                  stroke="#e2e8f0"
                  stroke-width="1"
                  stroke-dasharray="4"
                />
                <line
                  x1="40"
                  y1="190"
                  x2="660"
                  y2="190"
                  stroke="#e2e8f0"
                  stroke-width="1"
                  stroke-dasharray="4"
                />
              </g>

              <!-- Y轴标签 -->
              <g class="y-labels">
                <text
                  x="30"
                  y="45"
                  text-anchor="end"
                  fill="#94a3b8"
                  font-size="12"
                >
                  {{ chartPath.max }}
                </text>
                <text
                  x="30"
                  y="95"
                  text-anchor="end"
                  fill="#94a3b8"
                  font-size="12"
                >
                  {{ Math.round(chartPath.max * 0.75) }}
                </text>
                <text
                  x="30"
                  y="145"
                  text-anchor="end"
                  fill="#94a3b8"
                  font-size="12"
                >
                  {{ Math.round(chartPath.max * 0.5) }}
                </text>
                <text
                  x="30"
                  y="195"
                  text-anchor="end"
                  fill="#94a3b8"
                  font-size="12"
                >
                  {{ Math.round(chartPath.max * 0.25) }}
                </text>
                <text
                  x="30"
                  y="220"
                  text-anchor="end"
                  fill="#94a3b8"
                  font-size="12"
                >
                  0
                </text>
              </g>

              <!-- 折线 -->
              <path
                v-if="chartPath.path"
                class="chart-line"
                :d="chartPath.path"
                fill="none"
                stroke="url(#lineGradient)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- 渐变填充区域 -->
              <path
                v-if="chartPath.path"
                class="chart-area"
                :d="
                  chartPath.path +
                  ` L ${chartPath.points[chartPath.points.length - 1].x} 210 L ${chartPath.points[0].x} 210 Z`
                "
                fill="url(#areaGradient)"
                opacity="0.3"
              />

              <!-- 数据点 -->
              <g class="data-points">
                <circle
                  v-for="point in chartPath.points"
                  :key="point.index"
                  class="data-point"
                  :cx="point.x"
                  :cy="point.y"
                  r="6"
                  fill="white"
                  stroke="#0090ff"
                  stroke-width="2"
                  @mouseenter="handlePointHover(point)"
                  @mouseleave="handlePointLeave"
                  @click="handlePointClick(point)"
                />
              </g>

              <!-- X轴标签 -->
              <g class="x-labels">
                <text
                  v-for="(label, index) in usageData[usageTimeRange].labels"
                  :key="index"
                  :x="chartPath.points[index]?.x || 0"
                  y="235"
                  text-anchor="middle"
                  fill="#64748b"
                  font-size="11"
                >
                  {{ label }}
                </text>
              </g>

              <!-- 渐变定义 -->
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stop-color="#0090ff" />
                  <stop offset="100%" stop-color="#00c6ff" />
                </linearGradient>
                <linearGradient
                  id="areaGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stop-color="#0090ff" stop-opacity="0.4" />
                  <stop
                    offset="100%"
                    stop-color="#0090ff"
                    stop-opacity="0.05"
                  />
                </linearGradient>
              </defs>
            </svg>

            <!-- 悬停提示 -->
            <div
              v-if="hoveredDataPoint"
              class="chart-tooltip"
              :style="{
                left: hoveredDataPoint.x + 'px',
                top: hoveredDataPoint.y - 60 + 'px',
              }"
            >
              <div class="tooltip-date">
                {{ usageData[usageTimeRange].labels[hoveredDataPoint.index] }}
              </div>
              <div class="tooltip-value">
                创建 {{ hoveredDataPoint.value }} 个文件
              </div>
              <div class="tooltip-files">
                {{
                  usageData[usageTimeRange].files[
                    usageData[usageTimeRange].labels[hoveredDataPoint.index]
                  ]
                    ?.slice(0, 3)
                    .join(", ") || ""
                }}
                <span
                  v-if="
                    (usageData[usageTimeRange].files[
                      usageData[usageTimeRange].labels[hoveredDataPoint.index]
                    ]?.length || 0) > 3
                  "
                  >...</span
                >
              </div>
            </div>
          </div>

          <!-- 选中日期详情 -->
          <div v-if="selectedDate" class="date-detail">
            <div class="detail-header">
              <h3>{{ selectedDate }} 创建的文件</h3>
              <button class="close-detail" @click="selectedDate = null">
                ✕
              </button>
            </div>
            <div class="file-list">
              <div
                v-for="(file, index) in usageData[usageTimeRange].files[
                  selectedDate
                ]"
                :key="index"
                class="file-item"
              >
                <svg class="file-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"
                    fill="#f0f5ff"
                    stroke="#4472c4"
                    stroke-width="1.5"
                  />
                  <path
                    d="M14 2v6h6"
                    stroke="#4472c4"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="file-name">{{ file }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的收藏 -->
        <div v-if="activeMenu === 'favorites'" class="content-panel">
          <h2 class="panel-title">我的收藏</h2>
          <p class="panel-subtitle">来自社区的精选内容</p>

          <div v-if="favoritePosts.length === 0" class="favorites-empty">
            <div class="empty-icon">⭐</div>
            <h3>暂无收藏</h3>
            <p>去社区浏览精彩内容，点击收藏按钮即可保存到这里</p>
            <RouterLink to="/community" class="btn-primary">
              去社区看看
            </RouterLink>
          </div>

          <div v-else class="favorites-list">
            <div
              v-for="post in favoritePosts"
              :key="post.id"
              class="favorite-card"
              @click="goToCommunityPost(post.id)"
            >
              <div class="favorite-card__header">
                <span class="favorite-tag">{{ post.tag }}</span>
                <button
                  class="favorite-remove"
                  @click.stop="removeFavorite(post.id)"
                  title="取消收藏"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </button>
              </div>

              <h3 class="favorite-title">{{ post.title }}</h3>
              <p class="favorite-content">{{ post.content }}</p>

              <div
                v-if="post.images && post.images.length"
                class="favorite-images"
              >
                <img
                  v-for="(img, idx) in post.images.slice(0, 3)"
                  :key="idx"
                  :src="img"
                  :alt="`图片 ${idx + 1}`"
                />
                <div v-if="post.images.length > 3" class="image-more">
                  +{{ post.images.length - 3 }}
                </div>
              </div>

              <div class="favorite-footer">
                <div class="favorite-author">
                  <span class="author-avatar">{{ post.author.charAt(0) }}</span>
                  <span>{{ post.author }}</span>
                </div>
                <div class="favorite-meta">
                  <span class="meta-item">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 17s-6-4.35-6-8.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 6 2.5C16 12.65 10 17 10 17z"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                    </svg>
                    {{ post.likes }}
                  </span>
                  <span class="meta-item">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                    </svg>
                    {{ post.comments.length }}
                  </span>
                  <time>{{ formatTime(post.createdAt) }}</time>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实名认证 -->
        <div v-if="activeMenu === 'verify'" class="content-panel">
          <h2 class="panel-title">实名认证</h2>

          <div v-if="userInfo.isVerified" class="verify-success">
            <div class="success-icon">✓</div>
            <h3>已完成实名认证</h3>
            <p>您的身份信息已通过验证</p>
          </div>

          <div v-else class="verify-form">
            <div class="form-section">
              <label class="form-label">真实姓名</label>
              <input
                v-model="userInfo.realName"
                type="text"
                class="form-input"
                placeholder="请输入您的真实姓名"
              />
            </div>

            <div class="form-section">
              <label class="form-label">身份证号</label>
              <input
                v-model="userInfo.idCard"
                type="text"
                class="form-input"
                placeholder="请输入您的身份证号"
                maxlength="18"
              />
            </div>

            <div class="form-section">
              <label class="form-label">身份证正面照</label>
              <div class="idcard-upload">
                <div class="upload-placeholder">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path
                      d="M21 15l-5-5L5 21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>点击上传身份证正面</span>
                </div>
              </div>
            </div>

            <div class="form-section">
              <label class="form-label">身份证反面照</label>
              <div class="idcard-upload">
                <div class="upload-placeholder">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path
                      d="M21 15l-5-5L5 21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>点击上传身份证反面</span>
                </div>
              </div>
            </div>

            <button class="btn-primary" @click="submitVerification">
              提交认证
            </button>
          </div>
        </div>

        <!-- 发布想法 -->
        <div v-if="activeMenu === 'posts'" class="content-panel">
          <h2 class="panel-title">发布想法</h2>

          <!-- 发布框 -->
          <div class="post-composer">
            <div class="composer-textarea-wrapper">
              <textarea
                v-model="postContent"
                class="composer-textarea"
                placeholder="分享你的想法..."
                rows="4"
              ></textarea>

              <!-- 工具栏 -->
              <div class="composer-toolbar">
                <div class="toolbar-left">
                  <!-- Emoji 按钮 -->
                  <div class="emoji-wrapper">
                    <button
                      class="toolbar-btn"
                      @click="showEmojiPicker = !showEmojiPicker"
                    >
                      😊
                    </button>
                    <!-- Emoji 选择器 -->
                    <div v-if="showEmojiPicker" class="emoji-picker">
                      <div class="emoji-grid">
                        <button
                          v-for="emoji in emojis"
                          :key="emoji"
                          class="emoji-item"
                          @click="insertEmoji(emoji)"
                        >
                          {{ emoji }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 文件上传 -->
                  <label class="toolbar-btn">
                    <input
                      type="file"
                      multiple
                      @change="handleFileUpload"
                      hidden
                    />
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    文件
                  </label>
                </div>

                <button
                  class="btn-publish"
                  :disabled="!postContent.trim() && selectedFiles.length === 0"
                  @click="publishPost"
                >
                  发布
                </button>
              </div>
            </div>

            <!-- 已选文件列表 -->
            <div v-if="selectedFiles.length > 0" class="selected-files">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="file-tag"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ file.size }}</span>
                <button class="file-remove" @click="removeFile(index)">
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- 已发布的想法列表 -->
          <div class="posts-list">
            <h3 class="posts-list__title">我的想法</h3>
            <div v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-header">
                <div class="post-avatar">{{ userInfo.name.charAt(0) }}</div>
                <div class="post-meta">
                  <span class="post-author">{{ userInfo.name }}</span>
                  <span class="post-time">{{ post.time }}</span>
                </div>
              </div>
              <div class="post-content" v-html="post.content"></div>
              <div class="post-actions">
                <button class="post-action" @click="likePost(post)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ post.likes }}
                </button>
                <button class="post-action">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ post.comments }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号设置 -->
        <div v-if="activeMenu === 'settings'" class="content-panel">
          <h2 class="panel-title">账号设置</h2>
          <p class="placeholder-text">设置功能开发中...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: transparent;
  padding-top: var(--space-20);
}

.profile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
}

.profile-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.back-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--text-primary);
}

.back-link svg {
  width: 18px;
  height: 18px;
}

.profile-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-6);
}

/* 侧边栏 */
.profile-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.user-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  text-align: center;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-4);
}

.user-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-700)
  );
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0 auto var(--space-4);
  overflow: hidden;
}

.user-card__avatar.has-avatar {
  background: var(--color-gray-100);
}

.user-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.user-card__email {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 12px;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #dcfce7;
  color: #16a34a;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
}

.profile-menu {
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
  color: #475569;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item--active {
  background: linear-gradient(135deg, #0090ff15, #0057d915);
  color: #0090ff;
  font-weight: 600;
}

.menu-item__icon {
  font-size: 1.25rem;
}

/* 主内容区 */
.profile-main {
  min-height: calc(100vh - 140px);
}

.content-panel {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #0090ff;
  box-shadow: 0 0 0 3px rgba(0, 144, 255, 0.1);
}

.info-text {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  color: #64748b;
  font-size: 0.9375rem;
}

/* 表单标签带图标 */
.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-label svg {
  width: 18px;
  height: 18px;
  color: #0090ff;
}

/* 文本域 */
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #0090ff;
  box-shadow: 0 0 0 3px rgba(0, 144, 255, 0.1);
}

.form-textarea::placeholder {
  color: #94a3b8;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* 保存按钮 */
.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(0, 144, 255, 0.3);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 144, 255, 0.4);
}

.btn-save:active {
  transform: translateY(0);
}

.btn-save svg {
  width: 20px;
  height: 20px;
}

/* 头像上传 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  overflow: hidden;
}

.avatar-preview.has-avatar {
  background: #f1f5f9;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #475569;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #e2e8f0;
}

.upload-btn svg {
  width: 18px;
  height: 18px;
}

/* 用户名编辑 */
.name-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #0090ff;
  border-radius: 12px;
  font-size: 0.9375rem;
  outline: none;
}

.name-display {
  flex: 1;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.9375rem;
  color: #0f172a;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #475569;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #e2e8f0;
}

.btn-edit svg {
  width: 16px;
  height: 16px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-success {
  background: #dcfce7;
  color: #16a34a;
}

.btn-success:hover {
  background: #bbf7d0;
}

.btn-cancel {
  background: #fee2e2;
  color: #dc2626;
}

.btn-cancel:hover {
  background: #fecaca;
}

/* 实名认证 */
.verify-success {
  text-align: center;
  padding: 48px;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 24px;
}

.verify-success h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.verify-success p {
  color: #64748b;
}

.verify-form {
  max-width: 480px;
}

.idcard-upload {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.idcard-upload:hover {
  border-color: #0090ff;
  background: rgba(0, 144, 255, 0.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
}

.upload-placeholder svg {
  width: 48px;
  height: 48px;
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 144, 255, 0.3);
}

/* 使用记录 */
.usage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.time-range-switch {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.range-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn:hover {
  color: #0f172a;
}

.range-btn--active {
  background: white;
  color: #0090ff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid #bae6fd;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0090ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.chart-container {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-line {
  filter: drop-shadow(0 2px 4px rgba(0, 144, 255, 0.3));
}

.data-point {
  cursor: pointer;
  transition: all 0.2s;
}

.data-point:hover {
  r: 8;
  stroke-width: 3;
}

.chart-tooltip {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 10;
  min-width: 200px;
  transform: translateX(-50%);
}

.tooltip-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.tooltip-value {
  font-size: 1rem;
  font-weight: 700;
  color: #0090ff;
  margin-bottom: 8px;
}

.tooltip-files {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

.date-detail {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.detail-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.close-detail {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-detail:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f1f5f9;
}

.file-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.file-name {
  font-size: 0.875rem;
  color: #334155;
}

/* 发布想法 */
.post-composer {
  margin-bottom: 32px;
}

.composer-textarea-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.composer-textarea {
  width: 100%;
  padding: 20px;
  border: none;
  resize: none;
  font-size: 0.9375rem;
  line-height: 1.6;
  outline: none;
  min-height: 120px;
}

.composer-textarea::placeholder {
  color: #94a3b8;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #64748b;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.toolbar-btn svg {
  width: 18px;
  height: 18px;
}

/* Emoji 选择器 */
.emoji-wrapper {
  position: relative;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 320px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.125rem;
  transition: background 0.15s;
}

.emoji-item:hover {
  background: #f1f5f9;
}

.btn-publish {
  padding: 10px 24px;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-publish:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 144, 255, 0.3);
}

.btn-publish:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 已选文件 */
.selected-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.file-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 10px;
  font-size: 0.8125rem;
}

.file-tag svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.file-name {
  color: #374151;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.file-remove {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.file-remove:hover {
  background: #fecaca;
}

/* 想法列表 */
.posts-list {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.posts-list__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
}

.post-card {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 16px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.post-meta {
  display: flex;
  flex-direction: column;
}

.post-author {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
}

.post-time {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.post-content {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 16px;
}

.post-content :deep(.link) {
  color: #0090ff;
  text-decoration: none;
}

.post-content :deep(.link:hover) {
  text-decoration: underline;
}

.post-actions {
  display: flex;
  gap: 16px;
}

.post-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #64748b;
  transition: all 0.2s;
}

.post-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.post-action svg {
  width: 18px;
  height: 18px;
}

.placeholder-text {
  color: #94a3b8;
  text-align: center;
  padding: 48px;
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    position: static;
  }

  .profile-menu {
    display: flex;
    overflow-x: auto;
    gap: 8px;
  }

  .menu-item {
    white-space: nowrap;
  }
}

/* 我的收藏 */
.favorites-empty {
  text-align: center;
  padding: 64px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.favorites-empty h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.favorites-empty p {
  color: #64748b;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 144, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 144, 255, 0.4);
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 144, 255, 0.2);
}

.favorite-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.favorite-tag {
  display: inline-flex;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0090ff;
  background: rgba(0, 144, 255, 0.08);
  border-radius: 999px;
}

.favorite-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #fbbf24;
  transition: all 0.2s ease;
}

.favorite-remove:hover {
  background: #fef3c7;
  color: #f59e0b;
  transform: scale(1.1);
}

.favorite-remove svg {
  width: 20px;
  height: 20px;
}

.favorite-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  line-height: 1.4;
}

.favorite-content {
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-images {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.favorite-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.favorite-images .image-more {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.favorite-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.favorite-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #64748b;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item svg {
  width: 16px;
  height: 16px;
}
</style>
