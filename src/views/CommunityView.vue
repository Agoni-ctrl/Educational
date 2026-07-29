<script setup>
import { ref, computed, onMounted } from "vue";
import PostCard from "../components/community/PostCard.vue";
import SiteNav from "../components/layout/SiteNav.vue";
import { useCommunity } from "../composables/useCommunity.js";

const { getPosts, addPost } = useCommunity();

const filter = ref("all");
const expandedId = ref(null);
const toast = ref("");
const showForm = ref(false);

// 搜索关键词
const searchQuery = ref("");
const hotSearches = ["翻转课堂", "新课导入", "物理交互动画", "课堂管理"];

const recentViews = ref([
  { id: 1, title: "如何设计「先破后立」的历史课导入？", time: "10分钟前" },
  { id: 2, title: "物理实验课的可交互演示动画怎么做？", time: "1小时前" },
  { id: 3, title: "公开课中数字化工具的使用经验分享", time: "3小时前" },
]);

const hotRecommendations = ref([
  { id: 1, title: "2026年热门教学工具盘点与对比...", reads: "2.3w" },
  { id: 2, title: "课堂提问技巧：从封闭式到开放式...", reads: "1.9w" },
  { id: 3, title: "高中历史公开课破冰高分案例分享...", reads: "1.5w" },
  { id: 4, title: "教研组联名推荐：10个宝藏教师网站...", reads: "1.2w" },
  { id: 5, title: "分层作业设计的思路与实践...", reads: "1.1w" },
]);

const newPost = ref({
  tag: "教学讨论",
  title: "",
  content: "",
  author: "匿名老师",
});

const tags = ["教学讨论", "课件结构", "互动设计", "课堂管理", "备课技巧"];

const activeTab = ref("discuss");
const contentTabs = [
  { key: "discuss", label: "教学讨论" },
  { key: "resource", label: "资源分享" },
  { key: "qa", label: "问答互助" },
  { key: "case", label: "优秀案例" },
];

const featuredResources = [
  { title: "高中物理·力的合成交互动画", type: "课件素材", downloads: 386 },
  { title: "语文阅读课小组任务单模板", type: "教案模板", downloads: 254 },
  { title: "AI 课堂提示词结构化模板", type: "Prompt 库", downloads: 612 },
];

const posts = computed(() => getPosts(filter.value));
const allPosts = computed(() => getPosts("all"));

const communityStats = computed(() => [
  { value: allPosts.value.length, label: "共创话题" },
  {
    value: allPosts.value.reduce((sum, post) => sum + post.comments.length, 0),
    label: "同行回复",
  },
  {
    value: allPosts.value.reduce((sum, post) => sum + post.likes, 0),
    label: "经验认可",
  },
]);

const topicLanes = [
  { title: "备课共创", desc: "课件结构、教案骨架、课堂节奏", tone: "blue" },
  { title: "互动实验", desc: "课堂提问、投票、演示动画脚本", tone: "cyan" },
  { title: "资料融合", desc: "PDF、图片、校本模板使用方法", tone: "green" },
];

const activeTeachers = [
  { name: "王老师", field: "高中历史", work: "情境导入案例" },
  { name: "李老师", field: "高中物理", work: "实验交互脚本" },
  { name: "张老师", field: "初中语文", work: "单元任务设计" },
];

const filters = [
  { key: "all", label: "全部" },
  { key: "hot", label: "热门" },
  { key: "favorite", label: "我的收藏" },
];

let toastTimer = null;

function showToast(msg) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = "";
  }, 2600);
}

function toggleExpand(postId) {
  expandedId.value = expandedId.value === postId ? null : postId;
}

async function handleShare(post) {
  const url = `${window.location.origin}/community?post=${post.id}`;
  const payload = {
    title: post.title,
    text: post.content.slice(0, 80),
    url,
  };

  try {
    if (navigator.share) {
      await navigator.share(payload);
      showToast("分享成功");
    } else {
      await navigator.clipboard.writeText(url);
      showToast("链接已复制到剪贴板");
    }
  } catch (err) {
    if (err?.name !== "AbortError") {
      try {
        await navigator.clipboard.writeText(url);
        showToast("链接已复制到剪贴板");
      } catch {
        showToast("分享失败，请手动复制链接");
      }
    }
  }
}

function submitPost() {
  const post = addPost(newPost.value);
  if (!post) return;

  newPost.value.title = "";
  newPost.value.content = "";
  showForm.value = false;
  expandedId.value = post.id;
  showToast("发布成功");
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    showToast(`正在搜索: ${searchQuery.value}`);
  }
}

function clearRecentViews() {
  recentViews.value = [];
  showToast("记录已清除");
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("post");
  if (postId) expandedId.value = postId;
});
</script>

<template>
  <div class="community-page">
    <SiteNav />

    <main class="main">
      <div class="hero-compact">
        <div class="hero-compact__copy">
          <h1>教师社区</h1>
          <p class="hero-compact__lead">
            发布教学话题、分享课件经验、参与教研讨论
          </p>
          <div class="hero-compact__actions">
            <button class="btn btn--dark" @click="showForm = true">
              发布教研话题
            </button>
            <button class="btn btn--ghost" @click="filter = 'hot'">
              热门经验
            </button>
          </div>
        </div>
        <div class="hero-compact__stats">
          <div
            v-for="item in communityStats"
            :key="item.label"
            class="stats-pill"
          >
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
          <div class="stats-pill stats-pill--heat">
            <strong>92%</strong>
            <span>今日热度</span>
          </div>
        </div>
      </div>

      <div class="layout-container">
        <div class="main-content">
          <div class="toolbar">
            <div class="filters">
              <button
                v-for="f in filters"
                :key="f.key"
                class="filter-btn"
                :class="{ 'filter-btn--active': filter === f.key }"
                @click="filter = f.key"
              >
                {{ f.label }}
              </button>
            </div>
            <button class="btn btn--dark" @click="showForm = !showForm">
              {{ showForm ? "取消发布" : "发布话题" }}
            </button>
          </div>

          <!-- 内容分类 - 药丸式分段控件 -->
          <nav class="pill-tabs" aria-label="内容分类">
            <button
              v-for="tab in contentTabs"
              :key="tab.key"
              class="pill-tab"
              :class="{ 'pill-tab--active': activeTab === tab.key }"
              :data-key="tab.key"
              @click="activeTab = tab.key"
            >
              <span class="pill-tab__label">{{ tab.label }}</span>
            </button>
          </nav>

          <!-- 发布表单 - 模态弹窗 -->
          <Transition name="modal">
            <div
              v-if="showForm"
              class="modal-overlay"
              @click.self="showForm = false"
            >
              <form class="post-form" @submit.prevent="submitPost" @click.stop>
                <div class="post-form__head">
                  <h3>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    >
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                    发布新话题
                  </h3>
                  <button
                    type="button"
                    class="modal-close"
                    @click="showForm = false"
                    aria-label="关闭"
                  >
                    &times;
                  </button>
                </div>

                <div class="post-form__body">
                  <div class="post-form__main">
                    <label class="field-label">
                      <span class="field-label__text">标题</span>
                      <input
                        v-model="newPost.title"
                        type="text"
                        placeholder="简要描述您的问题"
                        required
                        maxlength="80"
                      />
                    </label>
                    <label class="field-label field-label--grow">
                      <span class="field-label__text">详细描述</span>
                      <textarea
                        v-model="newPost.content"
                        rows="5"
                        placeholder="详细说明教学场景、遇到的困难或想讨论的内容..."
                        required
                        maxlength="500"
                      />
                    </label>
                  </div>

                  <div class="post-form__side">
                    <label class="field-label">
                      <span class="field-label__text">分类</span>
                      <select v-model="newPost.tag">
                        <option v-for="t in tags" :key="t" :value="t">
                          {{ t }}
                        </option>
                      </select>
                    </label>
                    <label class="field-label">
                      <span class="field-label__text">昵称</span>
                      <input
                        v-model="newPost.author"
                        type="text"
                        placeholder="您的称呼"
                        maxlength="12"
                      />
                    </label>
                  </div>
                </div>

                <div class="post-form__footer">
                  <button type="submit" class="btn btn--primary">
                    发布到社区
                  </button>
                </div>
              </form>
            </div>
          </Transition>

          <div v-if="posts.length" class="post-list">
            <PostCard
              v-for="post in posts"
              :key="post.id"
              :post="post"
              :expanded="expandedId === post.id"
              @toggle-expand="toggleExpand(post.id)"
              @share="handleShare"
            />
          </div>

          <div v-else class="empty">
            <p>暂无内容</p>
            <button class="btn btn--ghost" @click="filter = 'all'">
              查看全部话题
            </button>
          </div>
        </div>

        <aside class="sidebar">
          <!-- ① 搜索 -->
          <div class="sidebar-card search-card">
            <div class="card-title">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                width="18"
                height="18"
              >
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="5.5"
                  stroke="currentColor"
                  stroke-width="1.4"
                />
                <path
                  d="M13 13l4 4"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </svg>
              快速搜索
            </div>
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索案例、提示词、关键词..."
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">搜索</button>
            </div>
            <div class="hot-searches">
              <span
                v-for="(word, idx) in hotSearches"
                :key="word"
                class="hot-word"
                :class="'hot-word--' + (idx + 1)"
                @click="
                  searchQuery = word;
                  handleSearch();
                "
              >
                {{ word }}
              </span>
            </div>
          </div>

          <!-- ② 热门标签 -->
          <div class="sidebar-card">
            <div class="card-title">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                width="18"
                height="18"
              >
                <path
                  d="M3 10a7 7 0 1 1 14 0A7 7 0 0 1 3 10z"
                  stroke="currentColor"
                  stroke-width="1.35"
                />
                <path
                  d="M8 7l2 6M12 7l-2 6"
                  stroke="currentColor"
                  stroke-width="1.35"
                  stroke-linecap="round"
                />
              </svg>
              热门标签
            </div>
            <div class="tag-cloud">
              <button
                v-for="tag in tags"
                :key="tag"
                class="tag-cloud__btn"
                :class="{ 'tag-cloud__btn--active': newPost.tag === tag }"
                @click="
                  newPost.tag = tag;
                  filter = 'all';
                "
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- ③ 精选资源 -->
          <div class="sidebar-card resource-card">
            <div class="card-title">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                width="18"
                height="18"
              >
                <rect
                  x="3"
                  y="2"
                  width="14"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.35"
                />
                <path
                  d="M7 7h6M7 11h6M7 15h3"
                  stroke="currentColor"
                  stroke-width="1.35"
                  stroke-linecap="round"
                />
              </svg>
              精选资源
            </div>
            <div class="resource-list">
              <div
                v-for="(item, index) in featuredResources"
                :key="index"
                class="resource-item"
              >
                <div class="resource-item__icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div class="resource-item__body">
                  <span class="resource-item__title">{{ item.title }}</span>
                  <span class="resource-item__meta">
                    <span class="resource-item__type">{{ item.type }}</span>
                    <span class="resource-item__dl"
                      >{{ item.downloads }} 下载</span
                    >
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ④ 热门推荐 -->
          <div class="sidebar-card recommend-card">
            <div class="card-title">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                width="18"
                height="18"
              >
                <path
                  d="M3 10a7 7 0 1 1 14 0A7 7 0 0 1 3 10z"
                  stroke="currentColor"
                  stroke-width="1.35"
                />
                <path
                  d="M8 7l2 6M12 7l-2 6"
                  stroke="currentColor"
                  stroke-width="1.35"
                  stroke-linecap="round"
                />
              </svg>
              热门推荐
            </div>
            <div class="recommend-list">
              <div
                v-for="(item, idx) in hotRecommendations"
                :key="item.id"
                class="recommend-item"
              >
                <div class="recommend-left">
                  <span class="rank-num" :class="'rank-' + (idx + 1)">{{
                    idx + 1
                  }}</span>
                  <span class="item-title">{{ item.title }}</span>
                </div>
                <span class="item-reads">{{ item.reads }}</span>
              </div>
            </div>
          </div>

          <!-- ⑤ 活跃教师 -->
          <div class="sidebar-card teacher-card">
            <div class="card-title">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                width="18"
                height="18"
              >
                <path
                  d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM13.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 17a4.5 4.5 0 0 1 9 0"
                  stroke="currentColor"
                  stroke-width="1.35"
                  stroke-linecap="round"
                />
              </svg>
              活跃贡献者
            </div>
            <div class="teacher-list">
              <article
                v-for="teacher in activeTeachers"
                :key="teacher.name"
                class="teacher-item"
              >
                <span class="teacher-avatar">{{ teacher.name.charAt(0) }}</span>
                <div>
                  <strong>{{ teacher.name }}</strong>
                  <p>{{ teacher.field }} · {{ teacher.work }}</p>
                </div>
              </article>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.community-page {
  position: relative;
  min-height: 100vh;
  color: var(--ink);
  background: linear-gradient(160deg, #f0f3ff 0%, #fbf0ff 100%);
}

.main {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 104px 24px 72px;
}

.hero-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding: 24px 28px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(18px);
}

.hero-compact__copy h1 {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 6px;
  color: #0f172a;
}

.hero-compact__lead {
  font-size: 0.92rem;
  color: #4b5563;
  margin-bottom: 14px;
}

.hero-compact__lead strong {
  color: #7c3aed;
  font-weight: 700;
}

.hero-compact__lead span {
  color: #0e8c96;
  font-weight: 700;
}

.hero-compact__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-compact__stats {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.stats-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  padding: 10px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(10, 15, 26, 0.06);
}

.stats-pill strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: #fb7185;
  line-height: 1.2;
}

.stats-pill span {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
}

.stats-pill--heat strong {
  background: linear-gradient(135deg, #fb7185, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== 药丸式 Tab ===== */
.pill-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  padding: 4px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(10, 15, 26, 0.05);
  overflow-x: auto;
}

.pill-tab {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.pill-tab:hover {
  color: #334155;
  background: rgba(255, 255, 255, 0.6);
}

.pill-tab--active {
  background: #fff;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 87, 217, 0.12);
}

.pill-tab--active[data-key="discuss"] {
  background: linear-gradient(135deg, #0072ff, #4facfe);
}
.pill-tab--active[data-key="resource"] {
  background: linear-gradient(135deg, #00c2d4, #22d3ee);
}
.pill-tab--active[data-key="qa"] {
  background: linear-gradient(135deg, #18a06d, #34d399);
}
.pill-tab--active[data-key="case"] {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.pill-tab__label {
  font-weight: 600;
  font-size: 0.85rem;
}

.layout-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 30px;
  align-items: start;
}

.main-content {
  min-width: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 10px;
  border: 1px solid rgba(10, 15, 26, 0.06);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(18px);
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 17px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ink-soft, #4b5563);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--border-strong, #cbd5e1);
  color: var(--ink, #0f172a);
}

.filter-btn--active {
  color: var(--accent-deep);
  background: #fff;
  border-color: rgba(0, 119, 230, 0.25);
  box-shadow: 0 10px 28px rgba(0, 87, 217, 0.08);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition:
    transform 0.25s var(--ease-spring),
    box-shadow 0.25s,
    border-color 0.2s,
    background 0.2s;
  white-space: nowrap;
}

.btn--dark {
  background: #7c3aed;
  color: #fff;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.25);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(124, 58, 237, 0.35);
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.64);
  color: var(--ink, #0f172a);
  border: 1px solid var(--border-strong, #cbd5e1);
}

.btn--ghost:hover {
  border-color: rgba(0, 119, 230, 0.24);
  background: #fff;
}

.post-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  border-radius: 24px;
  border: 1px solid rgba(167, 193, 225, 0.28);
  background: linear-gradient(
    170deg,
    rgba(255, 255, 255, 0.98),
    rgba(248, 251, 255, 0.96)
  );
  backdrop-filter: blur(24px);
  box-shadow: 0 32px 80px rgba(0, 55, 140, 0.18);
  overflow: hidden;
}

.post-form__body {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 0;
  padding: 24px 28px;
  flex: 1;
  overflow-y: auto;
}

.post-form__main {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label--grow {
  flex: 1;
}

.field-label__text {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4a6a8a;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.post-form__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 24px;
  border-left: 1px solid rgba(167, 193, 225, 0.18);
}

.post-form input,
.post-form select,
.post-form textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid rgba(167, 193, 225, 0.28);
  border-radius: 12px;
  font-size: 0.9375rem;
  font-family: inherit;
  outline: none;
  background: #fff;
  color: #0f172a;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.post-form input::placeholder,
.post-form textarea::placeholder {
  color: #a0b8d0;
}

.post-form input:focus,
.post-form select:focus,
.post-form textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.post-form textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.post-form__footer {
  padding: 16px 28px 20px;
  border-top: 1px solid rgba(167, 193, 225, 0.16);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(248, 251, 255, 0.6);
}

.post-form__footer .btn--primary {
  padding: 11px 36px;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #1a56f0, #0ea5e9);
  color: #fff;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.post-form__footer .btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(26, 86, 240, 0.3);
}

.post-form__footer .btn--primary:active {
  transform: translateY(0);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 92px;
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 22px;
  padding: 20px;
  backdrop-filter: blur(18px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.search-card {
  background:
    linear-gradient(135deg, rgba(0, 194, 212, 0.08), rgba(0, 114, 255, 0.06)),
    rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 194, 212, 0.12);
}

.card-kicker {
  margin-bottom: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0e8c96;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-box input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid rgba(171, 194, 225, 0.3);
  border-radius: 12px;
  font-size: 0.825rem;
  outline: none;
  background: rgba(245, 248, 255, 0.5);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.search-box input:focus {
  border-color: #00c2d4;
  box-shadow: 0 0 0 3px rgba(0, 194, 212, 0.1);
  background: #fff;
}

.search-btn {
  padding: 0 20px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #6d28d9;
}

.hot-searches {
  margin-top: 12px;
  font-size: 0.75rem;
  line-height: 1.6;
}

.hot-label {
  color: #94a3b8;
}

.hot-word {
  margin-right: 10px;
  cursor: pointer;
  display: inline-block;
  font-weight: 600;
}

.hot-word--1 {
  color: #ef4444;
}
.hot-word--2 {
  color: #f97316;
}
.hot-word--3 {
  color: #0077e6;
}
.hot-word--4 {
  color: #64748b;
}

.hot-word:hover {
  text-decoration: underline;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(10, 15, 26, 0.06);
  padding-bottom: 8px;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent-deep, #005cb3);
}

.card-title svg {
  width: 18px;
  height: 18px;
  color: var(--accent-deep);
}

.recent-list,
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item,
.recommend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  gap: 10px;
}

.item-title {
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color 0.2s;
}

.item-title:hover {
  color: #0077e6;
}

.recent-item .item-title {
  max-width: 75%;
}

.item-time,
.item-reads {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}

.clear-btn {
  width: 100%;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border, #e2e8f0);
  color: #64748b;
  border-radius: 12px;
  font-size: 0.8125rem;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--ink, #0f172a);
}

.recommend-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.rank-num {
  font-weight: 700;
  font-size: 0.8125rem;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
}

.rank-1 {
  background: #fee2e2;
  color: #ef4444;
}
.rank-2 {
  background: #ffedd5;
  color: #f97316;
}
.rank-3 {
  background: #fef9c3;
  color: #eab308;
}

/* ===== 模态弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(10, 15, 26, 0.42);
  backdrop-filter: blur(8px);
}

.post-form__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px 16px;
  border-bottom: 1px solid rgba(167, 193, 225, 0.18);
  flex-shrink: 0;
}

.post-form__head h3 {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1a56f0, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.post-form__head h3 svg {
  stroke: #1a56f0;
}

.modal-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 1.5rem;
  color: #8da6c5;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(10, 15, 26, 0.06);
  color: #0f172a;
}

/* 模态过渡动画 */
.modal-enter-active {
  transition: all 0.3s ease-out;
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .post-form,
.modal-leave-to .post-form {
  transform: scale(0.94) translateY(12px);
}

/* ===== 标签云 ===== */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tag-cloud__btn {
  padding: 6px 14px;
  border: 1px solid rgba(10, 15, 26, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.64);
  color: var(--ink-soft, #4b5563);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-cloud__btn:hover {
  border-color: rgba(0, 119, 230, 0.24);
  color: var(--accent-deep, #005cb3);
  background: rgba(0, 119, 230, 0.04);
}

.tag-cloud__btn--active {
  background: linear-gradient(135deg, #4facfe 0%, #0072ff 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(79, 172, 254, 0.3);
}

/* ===== 精选资源 ===== */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.resource-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(10, 15, 26, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}

.resource-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 119, 230, 0.16);
  transform: translateX(3px);
}

.resource-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(0, 119, 230, 0.08),
    rgba(0, 194, 212, 0.08)
  );
  color: var(--accent-deep, #005cb3);
}

.resource-item__icon svg {
  width: 18px;
  height: 18px;
}

.resource-item__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.resource-item__title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-item__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resource-item__type {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 119, 230, 0.08);
  color: var(--accent-deep, #005cb3);
  font-weight: 600;
}

.resource-item__dl {
  font-size: 0.68rem;
  color: var(--ink-muted, #94a3b8);
}

.resource-card {
  background:
    radial-gradient(circle at 72% 0%, rgba(0, 119, 230, 0.12), transparent 42%),
    rgba(255, 255, 255, 0.88);
}

.recommend-card {
  background:
    radial-gradient(
      circle at 100% 100%,
      rgba(245, 158, 11, 0.1),
      transparent 40%
    ),
    rgba(255, 255, 255, 0.88);
}

.teacher-card {
  background:
    radial-gradient(circle at 0% 80%, rgba(0, 194, 212, 0.12), transparent 42%),
    rgba(255, 255, 255, 0.88);
}

.teacher-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.teacher-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: center;
}

.teacher-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  color: #fff;
  font-weight: 800;
}

.teacher-item strong {
  display: block;
  font-size: 0.88rem;
  color: var(--accent-deep, #005cb3);
}

.teacher-item p {
  margin-top: 2px;
  font-size: 0.76rem;
  color: var(--ink-muted);
}

.sidebar-empty {
  text-align: center;
  padding: 20px 0;
  color: #94a3b8;
  font-size: 0.8125rem;
}

.empty {
  text-align: center;
  padding: 60px 24px;
  color: #94a3b8;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: var(--ink, #0f172a);
  border-radius: 999px;
  box-shadow: 0 12px 40px rgba(10, 15, 26, 0.2);
}

@media (max-width: 968px) {
  .hero-compact {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }
  .hero-compact__stats {
    flex-wrap: wrap;
  }
  .stats-pill {
    flex: 1;
    min-width: 60px;
  }

  .layout-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .main {
    padding: 94px 18px 48px;
  }

  .hero-block {
    padding: 22px;
    border-radius: 26px;
  }

  .hero-actions,
  .hero-actions .btn {
    width: 100%;
  }

  .community-strip {
    grid-template-columns: 1fr;
  }

  .post-form__body {
    grid-template-columns: 1fr;
  }

  .post-form__side {
    padding-left: 0;
    padding-top: 18px;
    border-left: none;
    border-top: 1px solid rgba(167, 193, 225, 0.18);
  }

  .post-form__head {
    padding: 18px 20px 14px;
  }

  .post-form__body {
    padding: 18px 20px;
  }

  .post-form__footer {
    padding: 14px 20px 18px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar .btn {
    width: 100%;
  }
}
</style>
