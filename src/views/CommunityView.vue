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
const allPosts = computed(() => getPosts('all'))

const communityStats = computed(() => [
  { value: allPosts.value.length, label: '共创话题' },
  { value: allPosts.value.reduce((sum, post) => sum + post.comments.length, 0), label: '同行回复' },
  { value: allPosts.value.reduce((sum, post) => sum + post.likes, 0), label: '经验认可' },
])

const topicLanes = [
  { title: '备课共创', desc: '课件结构、教案骨架、课堂节奏', tone: 'blue' },
  { title: '互动实验', desc: '课堂提问、投票、演示动画脚本', tone: 'cyan' },
  { title: '资料融合', desc: 'PDF、图片、校本模板使用方法', tone: 'green' },
]

const activeTeachers = [
  { name: '王老师', field: '高中历史', work: '情境导入案例' },
  { name: '李老师', field: '高中物理', work: '实验交互脚本' },
  { name: '张老师', field: '初中语文', work: '单元任务设计' },
]

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
        <div class="hero-block__copy">
          <p class="eyebrow">Teacher Community</p>
          <h1>教师共创社区</h1>
          <p class="lead">把备课难题、课件结构、互动创意和多模态资料处理经验沉淀下来，与同行一起把 AI 教学从“会用”推进到“用好”。</p>
          <div class="hero-actions">
            <button class="btn btn--dark" @click="showForm = true">发布教研话题</button>
            <button class="btn btn--ghost" @click="filter = 'hot'">查看热门经验</button>
          </div>
        </div>

        <div class="community-orbit" aria-label="社区活跃概览">
          <div class="orbit-card">
            <span class="orbit-card__label">今日教研热度</span>
            <strong>92%</strong>
            <p>课件生成、互动设计与资料融合正在被集中讨论</p>
          </div>
          <div class="orbit-ring orbit-ring--one" />
          <div class="orbit-ring orbit-ring--two" />
          <div class="orbit-dot orbit-dot--one">问</div>
          <div class="orbit-dot orbit-dot--two">案</div>
          <div class="orbit-dot orbit-dot--three">评</div>
        </div>
      </div>

      <section class="community-strip" aria-label="社区数据">
        <article v-for="item in communityStats" :key="item.label" class="stat-card">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
        <article v-for="lane in topicLanes" :key="lane.title" class="topic-lane" :data-tone="lane.tone">
          <strong>{{ lane.title }}</strong>
          <span>{{ lane.desc }}</span>
        </article>
      </section>

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
              {{ showForm ? '取消发布' : '发布话题' }}
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
            <div class="card-kicker">快速定位</div>
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
              <span class="card-title">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 4h10M5 8h10M5 12h6M4 17h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
                最近浏览
              </span>
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
              <span class="card-title">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 3l1.9 4.1 4.4.5-3.2 3.1.8 4.3L10 12.8 6.1 15l.8-4.3-3.2-3.1 4.4-.5L10 3z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" />
                </svg>
                热门推荐
              </span>
            </div>
            <div class="recommend-list">
              <div v-for="(item, index) in hotRecommendations" :key="item.id" class="recommend-item">
                <div class="recommend-left">
                  <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="item-title" :title="item.title">{{ item.title }}</span>
                </div>
                <span class="item-reads">{{ item.reads }} 阅读</span>
              </div>
            </div>
          </div>

          <div class="sidebar-card teacher-card">
            <div class="card-header">
              <span class="card-title">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM13.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 17a4.5 4.5 0 0 1 9 0M11.5 16a3.5 3.5 0 0 1 6 0" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" />
                </svg>
                活跃教师
              </span>
            </div>
            <div class="teacher-list">
              <article v-for="teacher in activeTeachers" :key="teacher.name" class="teacher-item">
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
}

.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 20%, rgba(0, 194, 212, 0.12), transparent 28%),
    radial-gradient(circle at 86% 4%, rgba(0, 119, 230, 0.16), transparent 30%),
    linear-gradient(165deg, #f8fafc 0%, #edf5fb 45%, #f7fbff 100%);
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

.main {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 104px 24px 72px;
}

.hero-block {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) 380px;
  gap: 34px;
  align-items: center;
  margin-bottom: 22px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 34px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.46)),
    radial-gradient(circle at 20% 0%, rgba(0, 194, 212, 0.16), transparent 42%);
  box-shadow: 0 28px 90px rgba(0, 87, 217, 0.11);
  backdrop-filter: blur(24px) saturate(1.25);
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
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4.6rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.055em;
  margin-bottom: 18px;
}

.lead {
  max-width: 660px;
  font-size: 1.03rem;
  line-height: 1.78;
  color: var(--ink-soft, #4b5563);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.community-orbit {
  position: relative;
  min-height: 300px;
  display: grid;
  place-items: center;
}

.orbit-card {
  position: relative;
  z-index: 2;
  width: 220px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 70px rgba(0, 87, 217, 0.16);
  text-align: center;
}

.orbit-card__label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-muted);
}

.orbit-card strong {
  display: block;
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1;
  color: var(--accent-deep);
}

.orbit-card p {
  margin-top: 12px;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--ink-soft);
}

.orbit-ring {
  position: absolute;
  inset: 36px;
  border: 1px dashed rgba(0, 119, 230, 0.24);
  border-radius: 50%;
}

.orbit-ring--two {
  inset: 78px;
  border-style: solid;
  border-color: rgba(0, 194, 212, 0.18);
}

.orbit-dot {
  position: absolute;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #fff;
  color: var(--accent-deep);
  font-family: var(--font-display);
  font-weight: 800;
  box-shadow: 0 14px 34px rgba(0, 87, 217, 0.14);
}

.orbit-dot--one { top: 34px; right: 82px; animation: float-one 5s ease-in-out infinite; }
.orbit-dot--two { left: 42px; bottom: 76px; animation: float-two 6s ease-in-out infinite; }
.orbit-dot--three { right: 42px; bottom: 46px; animation: float-one 5.4s ease-in-out infinite 0.5s; }

.community-strip {
  display: grid;
  grid-template-columns: repeat(3, 0.62fr) repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.stat-card,
.topic-lane {
  padding: 16px;
  border: 1px solid rgba(10, 15, 26, 0.07);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
}

.stat-card strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.7rem;
  color: var(--accent-deep);
}

.stat-card span,
.topic-lane span {
  display: block;
  font-size: 0.78rem;
  line-height: 1.48;
  color: var(--ink-muted);
}

.topic-lane {
  position: relative;
  overflow: hidden;
}

.topic-lane::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--accent);
}

.topic-lane[data-tone='cyan']::before { background: var(--cyan); }
.topic-lane[data-tone='green']::before { background: #18a06d; }

.topic-lane strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.92rem;
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
  transition: transform 0.25s var(--ease-spring), box-shadow 0.25s, border-color 0.2s, background 0.2s;
  white-space: nowrap;
}

.btn--dark {
  background: linear-gradient(135deg, #4facfe 0%, #0072ff 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(79, 172, 254, 0.4);
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
  gap: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 22px;
  border: 1px solid var(--border, #e2e8f0);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(20px);
  box-shadow: 0 18px 60px rgba(0, 87, 217, 0.09);
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
  border-radius: 14px;
  font-size: 0.9375rem;
  outline: none;
  background: #fff;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 92px;
}

.sidebar-card {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.62));
  border: 1px solid rgba(10, 15, 26, 0.07);
  border-radius: 22px;
  padding: 20px;
  backdrop-filter: blur(18px);
  box-shadow: 0 14px 44px rgba(0, 87, 217, 0.07);
}

.search-card {
  background:
    radial-gradient(circle at 18% 0%, rgba(0, 194, 212, 0.18), transparent 42%),
    rgba(255, 255, 255, 0.88);
}

.card-kicker {
  margin-bottom: 12px;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--accent-deep);
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
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
  border-radius: 14px;
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
  font-weight: 600;
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
  color: var(--ink, #0f172a);
}

.card-title svg {
  width: 18px;
  height: 18px;
  color: var(--accent-deep);
}

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

.rank-1 { background: #fee2e2; color: #ef4444; }
.rank-2 { background: #ffedd5; color: #f97316; }
.rank-3 { background: #fef9c3; color: #eab308; }

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

@keyframes float-one {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float-two {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(8px, -8px); }
}

@media (max-width: 968px) {
  .hero-block {
    grid-template-columns: 1fr;
  }

  .community-orbit {
    min-height: 240px;
  }

  .community-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
