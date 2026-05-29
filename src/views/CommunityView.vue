<script setup>
import { ref, computed, onMounted } from 'vue'
import PostCard from '../components/community/PostCard.vue'
import SiteNav from '../components/layout/SiteNav.vue'
import { useCommunity } from '../composables/useCommunity.js'

const { getPosts, addPost } = useCommunity()

const filter = ref('all')
const expandedId = ref(null)
const toast = ref('')
const showForm = ref(false)

// 搜索关键词
const searchQuery = ref('')
const hotSearches = ['AI 提示词', '翻转课堂', '新课导入', '物理交互动画']

// 模拟右侧边栏数据（可根据实际后端调整）
const recentViews = ref([
  { id: 1, title: '如何设计「先破后立」的历史课导入？', time: '10分钟前' },
  { id: 2, title: '物理实验课怎样用 AI 生成可交互演示动画？', time: '1小时前' },
  { id: 3, title: '多模态 AI 工具在公开课中的落地尝试', time: '3小时前' }
])

const hotRecommendations = ref([
  { id: 1, title: '2026年最新 AI 教学工具盘点...', reads: '2.3w' },
  { id: 2, title: '如何写出让 AI 乖乖听话的 Prompt...', reads: '1.9w' },
  { id: 3, title: '高中历史公开课破冰高分案例分享...', reads: '1.5w' },
  { id: 4, title: '教研组联名推荐：10个宝藏教师网站...', reads: '1.2w' },
  { id: 5, title: '关于大模型赋能个性化作业的思考...', reads: '1.1w' }
])

const newPost = ref({
  tag: '教学讨论',
  title: '',
  content: '',
  author: '匿名老师',
})

const tags = ['教学讨论', '课件结构', '互动设计', '多模态参考', 'AI 提示词']

const posts = computed(() => getPosts(filter.value))

const filters = [
  { key: 'all', label: '全部' },
  { key: 'hot', label: '热门' },
  { key: 'favorite', label: '我的收藏' },
]

let toastTimer = null

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2600)
}

function toggleExpand(postId) {
  expandedId.value = expandedId.value === postId ? null : postId
}

async function handleShare(post) {
  const url = `${window.location.origin}/community?post=${post.id}`
  const payload = {
    title: post.title,
    text: post.content.slice(0, 80),
    url,
  }

  try {
    if (navigator.share) {
      await navigator.share(payload)
      showToast('分享成功')
    } else {
      await navigator.clipboard.writeText(url)
      showToast('链接已复制到剪贴板')
    }
  } catch (err) {
    if (err?.name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(url)
        showToast('链接已复制到剪贴板')
      } catch {
        showToast('分享失败，请手动复制链接')
      }
    }
  }
}

function submitPost() {
  const post = addPost(newPost.value)
  if (!post) return

  newPost.value.title = ''
  newPost.value.content = ''
  showForm.value = false
  expandedId.value = post.id
  showToast('发布成功')
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    showToast(`正在搜索: ${searchQuery.value}`)
  }
}

function clearRecentViews() {
  recentViews.value = []
  showToast('记录已清除')
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const postId = params.get('post')
  if (postId) expandedId.value = postId
})
</script>

<template>
  <div class="community-page">
    <div class="aurora" aria-hidden="true">
      <div class="aurora__blob aurora__blob--1" />
      <div class="aurora__blob aurora__blob--2" />
      <div class="aurora__grain" />
    </div>

    <SiteNav />

    <main class="main">
      <div class="hero-block">
        <p class="eyebrow">Community</p>
        <h1>教师交流社区</h1>
        <p class="lead">分享教学疑难、交流课件共创经验，与同行一起探索 AI 赋能教学的可能</p>
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
              {{ showForm ? '取消发布' : '+ 发布话题' }}
            </button>
          </div>

          <Transition name="form">
            <form v-if="showForm" class="post-form" @submit.prevent="submitPost">
              <div class="post-form__row">
                <label>
                  分类
                  <select v-model="newPost.tag">
                    <option v-for="t in tags" :key="t" :value="t">{{ t }}</option>
                  </select>
                </label>
                <label>
                  昵称
                  <input v-model="newPost.author" type="text" placeholder="您的称呼" maxlength="12" />
                </label>
              </div>
              <label>
                标题
                <input v-model="newPost.title" type="text" placeholder="简要描述您的问题" required maxlength="80" />
              </label>
              <label>
                详细描述
                <textarea
                  v-model="newPost.content"
                  rows="4"
                  placeholder="详细说明教学场景、遇到的困难或想讨论的内容..."
                  required
                  maxlength="500"
                />
              </label>
              <button type="submit" class="btn btn--dark">发布到社区</button>
            </form>
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
            <button class="btn btn--ghost" @click="filter = 'all'">查看全部话题</button>
          </div>
        </div>

        <aside class="sidebar">
          
          <div class="sidebar-card search-card">
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
              <span class="hot-label">热门搜索：</span>
              <span 
                v-for="word in hotSearches" 
                :key="word" 
                class="hot-word"
                @click="searchQuery = word; handleSearch()"
              >
                {{ word }}
              </span>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="card-header">
              <span class="card-title">📋 最近浏览</span>
            </div>
            <div v-if="recentViews.length" class="recent-list">
              <div v-for="item in recentViews" :key="item.id" class="recent-item">
                <span class="item-title" :title="item.title">{{ item.title }}</span>
                <span class="item-time">{{ item.time }}</span>
              </div>
              <button class="clear-btn" @click="clearRecentViews">清除记录</button>
            </div>
            <div v-else class="sidebar-empty">暂无浏览历史</div>
          </div>

          <div class="sidebar-card">
            <div class="card-header">
              <span class="card-title">🔥 热门推荐</span>
            </div>
            <div class="recommend-list">
              <div v-for="(item, index) in hotRecommendations" :key="item.id" class="recommend-item">
                <div class="recommend-left">
                  <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="item-title" :title="item.title">{{ item.title }}</span>
                </div>
                <span class="item-reads">👁️ {{ item.reads }} 阅读</span>
              </div>
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
/* 保持原有基础全局变量和毛玻璃底层逻辑 */
.community-page {
  position: relative;
  min-height: 100vh;
}

.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: transparent;
}

.aurora__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}

.aurora__blob--1 {
  width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
  top: -10%; right: -8%;
  background: radial-gradient(circle, rgba(0, 144, 255, 0.22) 0%, transparent 68%);
  animation: drift 18s ease-in-out infinite;
}

.aurora__blob--2 {
  width: 40vw; height: 40vw; max-width: 480px; max-height: 480px;
  bottom: 10%; left: -10%;
  background: radial-gradient(circle, rgba(0, 194, 212, 0.18) 0%, transparent 70%);
  animation: drift 22s ease-in-out infinite reverse;
}

.aurora__grain {
  position: absolute; inset: 0; opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 30px); }
}

/* 布局调整：扩大主容器的最大宽度，容纳双栏 */
.main {
  position: relative;
  z-index: 1;
  max-width: 1200px; /* 从原先的800px改为1200px */
  margin: 0 auto;
  padding: 80px 24px;
}

.hero-block {
  margin-bottom: 36px;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent, #0077e6);
  margin-bottom: 12px;
}

.hero-block h1 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 12px;
}

.lead {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--ink-soft, #4b5563);
}

/* 核心：新增双栏 Grid 响应式布局 */
.layout-container {
  display: grid;
  grid-template-columns: 1fr 360px; /* 左侧自适应，右侧固定360px */
  gap: 30px;
  align-items: start;
}

/* 左侧主内容区 */
.main-content {
  min-width: 0; /* 防止子元素撑破grid */
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-soft, #4b5563);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--border-strong, #cbd5e1);
  color: var(--ink, #0f172a);
}

.filter-btn--active {
  color: #0077e6;
  background: rgba(0, 119, 230, 0.1);
  border-color: rgba(0, 119, 230, 0.25);
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
  transition: transform 0.25s, box-shadow 0.25s;
  white-space: nowrap;
}

.btn--dark {
  background: var(--ink, #0f172a);
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 15, 26, 0.12);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(10, 15, 26, 0.16);
}

.btn--ghost {
  background: transparent;
  color: var(--ink, #0f172a);
  border: 1px solid var(--border-strong, #cbd5e1);
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid var(--border, #e2e8f0);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
}

.post-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.post-form input,
.post-form select,
.post-form textarea {
  padding: 12px 14px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-size: 0.9375rem;
  outline: none;
  background: #fff;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==========================================================================
   右侧侧边栏组件样式 (依照图片设计定制)
   ========================================================================== */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 90px; /* 随页面滚动时悬浮固定 */
}

/* 侧边栏通用卡片 */
.sidebar-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

/* 搜索卡片特别定制 */
.search-card {
  background: rgba(255, 255, 255, 0.9);
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #0077e6;
}

.search-btn {
  padding: 0 20px;
  background: #0077e6;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #005cb3;
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
  color: #0077e6;
  margin-right: 10px;
  cursor: pointer;
  display: inline-block;
}

.hot-word:hover {
  text-decoration: underline;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding-bottom: 8px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink, #0f172a);
}

/* 最近浏览列表 */
.recent-list, .recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item, .recommend-item {
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

.item-time, .item-reads {
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
  border-radius: 8px;
  font-size: 0.8125rem;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--ink, #0f172a);
}

/* 热门推荐排行榜 */
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

/* 前三名高亮橙黄色系样式 */
.rank-1 { background: #fee2e2; color: #ef4444; }
.rank-2 { background: #ffedd5; color: #f97316; }
.rank-3 { background: #fef9c3; color: #eab308; }

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

/* ==========================================================================
   移动端响应式断点处理
   ========================================================================== */
@media (max-width: 968px) {
  /* 当屏幕宽度小于 968px 时，切换回单栏，将侧边栏挪到最下面或隐藏 */
  .layout-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .post-form__row {
    grid-template-columns: 1fr;
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