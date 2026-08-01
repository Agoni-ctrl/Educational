<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { formatSessionTime, useAssistant } from '../composables/useAssistant.js'

const router = useRouter();
const assistant = useAssistant();
const userStore = useUserStore();

const sessions = ref([])
const activeId = ref(null)
const conversationStarted = ref(false)
const sidebarOpen = ref(false)
const inputText = ref('')
const isLoading = ref(false)
const messagesEl = ref(null)
const inputEl = ref(null)

const suggestions = [
  { icon: '教', text: '帮我设计一节高中物理《牛顿第二定律》的课堂结构' },
  { icon: '案', text: '根据教学主题生成配套 PPT 大纲和教案框架' },
  { icon: '问', text: '为这节新课设计 2 到 3 个课堂互动环节' },
  { icon: '评', text: '分析我的教学目标是否清晰，并给出优化建议' },
  { icon: '练', text: '围绕知识点生成分层练习与追问问题' },
  { icon: '改', text: '继续优化上一版教案的导入和板书设计' },
]

const activeSession = computed(() => sessions.value.find((session) => session.id === activeId.value) || null)
const hasMessages = computed(() => (activeSession.value?.messages.length ?? 0) > 0)

const groupedSections = computed(() => {
  const grouped = assistant.groupSessionsByDate(sessions.value);
  return [
    { key: "today", label: "今天", items: grouped.today },
    { key: "yesterday", label: "昨天", items: grouped.yesterday },
    { key: "earlier", label: "更早", items: grouped.earlier },
  ].filter((group) => group.items.length);
});

function refresh() {
  sessions.value = assistant.getSessions()
  const current = assistant.getActiveSession()

  if (current) {
    activeId.value = current.id
  } else if (sessions.value.length) {
    activeId.value = sessions.value[0].id
    assistant.setActive(activeId.value)
  } else {
    activeId.value = null
  }
}

function ensureSessionExists() {
  if (!assistant.getSessions().length) {
    const session = assistant.createSession();
    activeId.value = session.id;
  }
  refresh();
}

function startConversation() {
  conversationStarted.value = true
  ensureSessionExists()
  nextTick(() => {
    scrollToBottom()
    inputEl.value?.focus()
  })
}

function backToLanding() {
  conversationStarted.value = false
  sidebarOpen.value = false
}

function handleNewChat() {
  const session = assistant.createSession()
  refresh()
  activeId.value = session.id
  inputText.value = ''
  conversationStarted.value = true
  sidebarOpen.value = false
  nextTick(() => inputEl.value?.focus())
}

function selectSession(id) {
  activeId.value = id
  assistant.setActive(id)
  conversationStarted.value = true
  sidebarOpen.value = false
  scrollToBottom()
}

function handleDeleteSession(id) {
  assistant.deleteSession(id)
  refresh()

  if (!sessions.value.length) {
    const session = assistant.createSession();
    activeId.value = session.id;
    refresh();
  }
}

async function syncStreamFrame() {
  refresh()
  await nextTick()
  scrollToBottom()
}

async function handleSend(text = inputText.value) {
  const content = (text || inputText.value).trim();
  if (!content || isLoading.value) return;

  inputText.value = ''
  isLoading.value = true
  conversationStarted.value = true

  if (!activeId.value) {
    const session = assistant.createSession();
    activeId.value = session.id;
  }

  try {
    await assistant.sendMessage(content, {
      onStart: syncStreamFrame,
      onChunk: syncStreamFrame,
      onComplete: syncStreamFrame,
    })
    refresh()
  } catch (error) {
    console.error('Assistant request failed:', error)
    assistant.appendLocalAssistantMessage(
      activeId.value,
      error?.message || 'AI 服务暂时不可用，请稍后重试。',
      { isError: true },
    )
    refresh()
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
    autoResize()
  }
}

function useSuggestion(text) {
  inputText.value = text;
  handleSend(text);
}

function onKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function autoResize() {
  nextTick(() => {
    const textarea = inputEl.value
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
}

function formatMessage(content) {
  return escapeHtml(content)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getAssistantMeta(message) {
  if (message.isError) return '连接异常'
  if (message.isStreaming) return '正在生成...'
  if (message.model) return `模型：${message.model}`
  return 'AI 助手'
}

function openSidebar() {
  sidebarOpen.value = true
}

onMounted(() => {
  ensureSessionExists()
  conversationStarted.value = assistant.getSessions().some((session) => session.messages?.length)
  scrollToBottom()
  autoResize()
})

watch(activeId, scrollToBottom)
watch(inputText, autoResize)
</script>

<template>
  <div class="assistant-page">
    <div class="assistant-ambient assistant-ambient--left" />
    <div class="assistant-ambient assistant-ambient--right" />

    <transition name="fade-scale" mode="out-in">
      <section v-if="!conversationStarted" key="landing" class="landing-page">
        <div class="landing-page__grid" />
        <div class="landing-page__halo landing-page__halo--one" />
        <div class="landing-page__halo landing-page__halo--two" />

        <div class="landing-shell">
          <div class="landing-badge">
            <span class="landing-badge__dot" />
            智课教学助手
          </div>

          <div class="landing-brand">
            <div class="landing-brand__logo">AI</div>
            <p class="landing-brand__name">Zhike Assistant</p>
          </div>

          <div class="landing-copy">
            <h1>
              <span>把备课、教案、课件与课堂互动</span>
              <span class="landing-copy__accent">放进一个 AI 工作台</span>
            </h1>
            <p>
              参考你提供的 AI 助手交互方式重构入口页与会话页，同时保持本项目原有的科技蓝教学主题，适合课程设计、资料整理与教学优化。
            </p>
          </div>

          <div class="landing-actions">
            <button class="landing-start" @click="startConversation">
              进入 AI 助手
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <RouterLink to="/" class="landing-back">返回首页</RouterLink>
          </div>

          <div class="landing-panel">
            <div class="landing-panel__header">
              <span>开场建议</span>
              <small>点击即可直接发起对话</small>
            </div>
            <div class="landing-panel__grid">
              <button
                v-for="(item, index) in suggestions.slice(0, 4)"
                :key="item.text"
                class="landing-panel__card"
                :style="{ '--i': index }"
                @click="useSuggestion(item.text)"
              >
                <span>{{ item.icon }}</span>
                <strong>{{ item.text }}</strong>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-else key="chat" class="chat-page">
        <aside class="assistant-sidebar" :class="{ 'assistant-sidebar--open': sidebarOpen }">
          <div class="assistant-sidebar__top">
            <button class="sidebar-toggle" @click="sidebarOpen = false" aria-label="关闭侧边栏">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button class="new-chat-btn" @click="handleNewChat">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              新对话
            </button>
          </div>

          <div class="assistant-sidebar__history">
            <section v-for="group in groupedSections" :key="group.key" class="history-group">
              <p class="history-group__label">{{ group.label }}</p>

              <div
                v-for="session in group.items"
                :key="session.id"
                class="history-item"
                :class="{ 'history-item--active': session.id === activeId }"
              >
                <button class="history-item__main" @click="selectSession(session.id)">
                  <span class="history-item__icon">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </span>
                  <span class="history-item__body">
                    <strong>{{ session.title }}</strong>
                    <small>{{ formatSessionTime(session.updatedAt) }}</small>
                  </span>
                </button>

                <button class="history-item__delete" @click.stop="handleDeleteSession(session.id)" aria-label="删除会话">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </section>
          </div>

          <div class="assistant-sidebar__footer">
            <button class="sidebar-home" @click="backToLanding">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              返回入口
            </button>
            <p class="assistant-sidebar__hint">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="currentColor" stroke-width="1.2" />
              </svg>
              会话记录保存在本地浏览器
            </p>
          </div>
        </aside>

        <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

        <main class="assistant-main">
          <header class="assistant-mobile-bar">
            <button class="sidebar-toggle" aria-label="打开侧边栏" @click="openSidebar">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </button>
            <span>智课 AI 助手</span>
          </header>

          <div class="assistant-shell">
            <div v-if="!hasMessages && !isLoading" class="welcome-state">
              <div class="welcome-state__logo">AI</div>
              <h2>智课 AI 助手</h2>
              <p>
                可以帮助你梳理教学目标、生成课件与教案结构、设计课堂互动、优化板书与提问路径。
              </p>

              <div class="welcome-state__block">
                <div class="welcome-state__head">
                  <span>常用问题</span>
                  <small>选择一个快速开始</small>
                </div>
                <div class="welcome-state__grid">
                  <button
                    v-for="(item, index) in suggestions"
                    :key="item.text"
                    class="suggestion-card"
                    :style="{ '--i': index }"
                    @click="useSuggestion(item.text)"
                  >
                    <span class="suggestion-card__icon">{{ item.icon }}</span>
                    <span class="suggestion-card__text">{{ item.text }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-else ref="messagesEl" class="messages">
              <article
                v-for="message in activeSession?.messages"
                :key="message.id"
                class="message"
                :class="`message--${message.role}`"
              >
                <div v-if="message.role === 'assistant'" class="message__avatar">AI</div>
                <div class="message__content" :class="{ 'message__content--user': message.role === 'user' }">
                  <div class="message__bubble" :class="{ 'message__bubble--error': message.isError }">
                    <div class="message__text" v-html="formatMessage(message.content)" />
                    <div v-if="message.isStreaming && !message.content" class="message__bubble--typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div class="message__meta" :class="{ 'message__meta--user': message.role === 'user' }">
                    <span>{{ message.role === 'assistant' ? getAssistantMeta(message) : '你' }}</span>
                    <span>{{ formatSessionTime(message.createdAt) }}</span>
                  </div>
                </div>
              </article>
            </div>

            <div class="input-area">
              <div class="input-toolbar">
                <span>教学主题、教案优化、课件结构、互动设计都可以直接问</span>
                <small>Shift + Enter 换行</small>
              </div>
              <div class="input-wrap">
                <textarea
                  ref="inputEl"
                  v-model="inputText"
                  rows="1"
                  class="input-wrap__field"
                  :disabled="isLoading"
                  placeholder="描述你的教学任务，或直接输入问题..."
                  @keydown="onKeydown"
                  @input="autoResize"
                />
                <button class="send-btn" :disabled="!inputText.trim() || isLoading" @click="handleSend()" aria-label="发送消息">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l12-6-2 6 2 6-12-6z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <p class="input-hint">
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="currentColor" stroke-width="1.2" />
                </svg>
                当前按流式方式请求 AI，接口需支持 chunk / SSE 返回
              </p>
            </div>
          </div>
        </main>
      </section>
    </transition>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   Design Tokens & Page Shell
   ═══════════════════════════════════════════════ */
.assistant-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 18%, rgba(71, 154, 255, 0.18), transparent 24%),
    radial-gradient(circle at 88% 14%, rgba(0, 194, 212, 0.12), transparent 20%),
    linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
  color: var(--ink);
}

.assistant-ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.7;
  pointer-events: none;
}

.assistant-ambient--left {
  top: 12%;
  left: -120px;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(0, 119, 230, 0.22), transparent 70%);
}

.assistant-ambient--right {
  right: -140px;
  bottom: 10%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(0, 194, 212, 0.18), transparent 70%);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.985);
}

.landing-page,
.chat-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.landing-page {
  display: grid;
  place-items: center;
  padding: 32px;
}

.landing-page__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 119, 230, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 119, 230, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, black 42%, transparent 88%);
}

.landing-page__halo {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.landing-page__halo--one {
  top: 10%;
  right: 10%;
  width: 220px;
  height: 220px;
  background: rgba(86, 170, 255, 0.22);
}

.landing-page__halo--two {
  left: 10%;
  bottom: 12%;
  width: 260px;
  height: 260px;
  background: rgba(0, 194, 212, 0.14);
}

.landing-shell {
  position: relative;
  width: min(1120px, 100%);
  padding: 48px;
  border: 1px solid rgba(129, 173, 230, 0.24);
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  box-shadow:
    0 30px 80px rgba(42, 96, 163, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.landing-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(235, 244, 255, 0.95);
  border: 1px solid rgba(111, 164, 228, 0.22);
  color: #3164a0;
  font-size: 0.86rem;
  font-weight: 700;
}

.landing-badge__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  box-shadow: 0 0 0 6px rgba(0, 119, 230, 0.12);
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 36px;
}

.landing-brand__logo,
.welcome-state__logo {
  display: grid;
  place-items: center;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, #5ea8ff, #2373d8 70%, #00bfd2);
  box-shadow: 0 20px 40px rgba(0, 119, 230, 0.24);
}

.landing-brand__logo {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  font-size: 1.35rem;
}

.landing-brand__name {
  color: #6e87a8;
  font-size: 1rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.landing-copy {
  max-width: 760px;
  margin-top: 28px;
}

.landing-copy h1 {
  display: grid;
  gap: 8px;
  font-family: var(--font-display);
  font-size: clamp(2.7rem, 5vw, 4.6rem);
  line-height: 1.02;
  letter-spacing: -0.06em;
  color: #0f2947;
}

.landing-copy__accent {
  background: linear-gradient(135deg, #2b77d8, #00aecd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.landing-copy p {
  max-width: 700px;
  margin-top: 20px;
  color: #627d9f;
  font-size: 1.05rem;
  line-height: 1.85;
}

.landing-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.landing-start,
.landing-back,
.sidebar-home,
.new-chat-btn,
.sidebar-toggle,
.history-item__delete,
.send-btn {
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, opacity 0.2s ease;
}

.landing-start {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #53a4ff, #2578db 78%);
  box-shadow: 0 18px 38px rgba(42, 117, 207, 0.24);
}

.landing-start:hover,
.new-chat-btn:hover,
.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.landing-start svg {
  width: 18px;
  height: 18px;
}

.landing-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  border-radius: 999px;
  border: 1px solid rgba(115, 161, 224, 0.22);
  background: rgba(255, 255, 255, 0.86);
  color: #3d6397;
  font-weight: 600;
}

.landing-panel {
  margin-top: 42px;
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.95), rgba(238, 246, 255, 0.92));
  border: 1px solid rgba(120, 166, 226, 0.2);
}

.landing-panel__header,
.welcome-state__head,
.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.landing-panel__header span,
.welcome-state__head span,
.input-toolbar span {
  color: #355d8f;
  font-weight: 700;
}

.landing-panel__header small,
.welcome-state__head small,
.input-toolbar small {
  color: #86a0bf;
  font-size: 0.8rem;
}

.landing-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.landing-panel__card,
.suggestion-card {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  border: 1px solid rgba(156, 192, 236, 0.25);
  background: rgba(255, 255, 255, 0.94);
  cursor: pointer;
  animation: rise-in 0.5s var(--ease-out) backwards;
  animation-delay: calc(var(--i) * 0.06s);
}

.landing-panel__card {
  min-height: 88px;
  padding: 16px 18px;
  border-radius: 20px;
}

.landing-panel__card span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(226, 239, 255, 0.95);
  color: #2f7bd9;
  font-weight: 800;
}

.landing-panel__card strong {
  color: #27466f;
  line-height: 1.6;
}

.landing-panel__card:hover,
.suggestion-card:hover,
.history-item:hover,
.sidebar-home:hover,
.landing-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(71, 123, 189, 0.1);
}

.chat-page {
  display: flex;
  gap: 18px;
  padding: 18px;
}

.assistant-sidebar {
  width: 304px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 18px;
  border-radius: 30px;
  background: rgba(234, 243, 255, 0.76);
  border: 1px solid rgba(128, 168, 225, 0.22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(16px);
}

.assistant-sidebar__top,
.assistant-sidebar__footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assistant-sidebar__top {
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(121, 161, 218, 0.18);
}

.sidebar-toggle {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.76);
  color: #2f7cdc;
}

.sidebar-toggle svg,
.new-chat-btn svg,
.sidebar-home svg,
.history-item__icon svg,
.history-item__delete svg,
.send-btn svg,
.input-hint svg,
.assistant-sidebar__hint svg {
  width: 16px;
  height: 16px;
}

.new-chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(88, 165, 255, 0.18), rgba(38, 124, 217, 0.2));
  color: #2c76d2;
  font-weight: 700;
}

.assistant-sidebar__history {
  flex: 1;
  overflow-y: auto;
  padding: 18px 0;
}

.history-group + .history-group {
  margin-top: 20px;
}

.history-group__label {
  margin-bottom: 10px;
  padding-left: 6px;
  color: #7a96ba;
  font-size: 0.78rem;
  font-weight: 700;
}

.history-item {
  position: relative;
  display: block;
  padding: 4px;
  border-radius: 16px;
}

.history-item + .history-item {
  margin-top: 6px;
}

.history-item--active {
  background: rgba(189, 218, 251, 0.72);
}

.history-item__main {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 40px 10px 10px;
  background: transparent;
  border: none;
  text-align: left;
  color: #345984;
  cursor: pointer;
}

.history-item__icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
  color: #2f7bd8;
}

.history-item__body {
  min-width: 0;
  display: grid;
}

.history-item__body strong,
.history-item__body small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item__body strong {
  font-size: 0.88rem;
  font-weight: 700;
}

.history-item__body small {
  margin-top: 3px;
  color: #7f9cbe;
  font-size: 0.72rem;
}

.history-item__delete {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.78);
  color: #8ba4c3;
  opacity: 0;
  transform: translateY(-50%);
}

.history-item:hover .history-item__delete,
.history-item__delete:focus-visible {
  opacity: 1;
}

.history-item__delete:hover {
  color: #d45252;
}

.assistant-sidebar__footer {
  flex-direction: column;
  align-items: stretch;
  padding-top: 18px;
  border-top: 1px solid rgba(121, 161, 218, 0.18);
}

.sidebar-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  background: rgba(191, 218, 248, 0.72);
  color: #2d7bdc;
  font-weight: 700;
}

.assistant-sidebar__hint,
.input-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7d98ba;
  font-size: 0.78rem;
}

/* ---- Sidebar Search ---- */
.sidebar-search {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 2px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: #f3f4f6;
  transition: background 0.2s ease;
}

.sidebar-search:focus-within {
  background: #e5e7eb;
}

.sidebar-search__icon {
  flex-shrink: 0;
  color: var(--ink-faint);
}

.sidebar-search__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.82rem;
  color: var(--ink-soft);
  font-family: inherit;
}

.sidebar-search__input::placeholder {
  color: var(--ink-faint);
}

/* ═══════════════════════════════════════════════
   Main Area
   ═══════════════════════════════════════════════ */
.assistant-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.assistant-mobile-bar {
  display: none;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #3a5e8d;
  font-weight: 700;
}

.assistant-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  border: 1px solid rgba(128, 168, 225, 0.22);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 56px rgba(59, 106, 172, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  overflow: hidden;
}

.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px 24px;
  text-align: center;
}

.welcome-state__logo {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  font-size: 1.5rem;
}

.welcome-state h2 {
  margin-top: 22px;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  color: #2867b9;
  letter-spacing: -0.05em;
}

.welcome-state p {
  max-width: 660px;
  margin-top: 16px;
  color: #7393ba;
  line-height: 1.8;
}

.welcome-state__block {
  width: min(920px, 100%);
  margin-top: 42px;
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.98), rgba(239, 246, 255, 0.95));
  border: 1px solid rgba(154, 191, 235, 0.22);
}

.welcome-state__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.suggestion-card {
  min-height: 68px;
  padding: 16px 18px;
  border-radius: 20px;
}

.suggestion-card__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(229, 240, 255, 0.94);
  color: #3483df;
  font-weight: 800;
}

.suggestion-card__text {
  color: #29496f;
  line-height: 1.6;
}

/* ═══════════════════════════════════════════════
   Messages
   ═══════════════════════════════════════════════ */
.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 30px;
}

.message {
  display: flex;
  gap: 12px;
}

.message + .message {
  margin-top: 20px;
}

.message--user {
  justify-content: flex-end;
}

.message__avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #57a4ff, #2e79da);
  color: #fff;
  font-size: 0.84rem;
  font-weight: 800;
}

.message__content {
  max-width: min(820px, 82%);
}

.message__content--user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message__bubble {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(235, 243, 255, 0.96);
  color: #355780;
  border-bottom-left-radius: 6px;
  box-shadow: 0 10px 24px rgba(71, 123, 189, 0.06);
}

.message--user .message__bubble {
  background: linear-gradient(135deg, #4194f6, #2d79da);
  color: #fff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 20px;
}

.message__bubble--error {
  background: #fff2f2;
  color: #9d3434;
}

.message__text {
  line-height: 1.78;
  word-break: break-word;
}

.message__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  color: #8ca5c3;
  font-size: 0.74rem;
}

.message__meta--user {
  justify-content: flex-end;
}

.message__bubble--typing {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
}

.message__bubble--typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(61, 142, 239, 0.56);
  animation: typing 1.3s ease-in-out infinite;
}

.message__bubble--typing span:nth-child(2) {
  animation-delay: 0.18s;
}

.message__bubble--typing span:nth-child(3) {
  animation-delay: 0.36s;
}

/* ---- Message Actions ---- */
.message__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
  margin-left: 46px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message--user .message__actions {
  display: none;
}

.message:hover .message__actions {
  opacity: 1;
}

.msg-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.msg-action:hover {
  color: var(--accent-blue);
  background: #f3f4f6;
}

.msg-action svg {
  width: 13px;
  height: 13px;
}

.msg-action-divider {
  width: 1px;
  height: 14px;
  background: var(--border-subtle);
  margin: 0 4px;
}

/* ═══════════════════════════════════════════════
   Input Area
   ═══════════════════════════════════════════════ */
.input-area {
  padding: 18px 24px 22px;
  border-top: 1px solid rgba(154, 191, 235, 0.2);
  background: rgba(255, 255, 255, 0.96);
}

.input-toolbar {
  margin-bottom: 12px;
}

.input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 10px 10px 10px 18px;
  border-radius: 28px;
  border: 1.5px solid rgba(90, 151, 229, 0.42);
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.input-wrap:focus-within {
  border-color: #4b96f3;
  box-shadow: 0 0 0 4px rgba(75, 150, 243, 0.08);
}

.input-wrap__field {
  flex: 1;
  min-height: 24px;
  max-height: 220px;
  padding: 8px 0;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: #24466d;
  line-height: 1.7;
}

.input-wrap__field::placeholder {
  color: #93a8c2;
}

.send-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #5ca8ff, #2f7bdb);
  color: #fff;
  box-shadow: 0 14px 26px rgba(47, 123, 219, 0.2);
}

.send-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.input-hint {
  margin-top: 12px;
}

/* ═══════════════════════════════════════════════
   Sidebar Overlay (mobile)
   ═══════════════════════════════════════════════ */
.sidebar-overlay {
  display: none;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1080px) {
  .landing-panel__grid,
  .welcome-state__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .landing-page {
    padding: 16px;
  }

  .landing-shell {
    padding: 28px 20px;
    border-radius: 28px;
  }

  .landing-copy h1 {
    font-size: 2.4rem;
  }

  .chat-page {
    padding: 12px;
  }

  .assistant-sidebar {
    position: fixed;
    top: 12px;
    bottom: 12px;
    left: 12px;
    z-index: 30;
    max-width: calc(100vw - 48px);
    transform: translateX(calc(-100% - 20px));
    transition: transform 0.28s var(--ease-out);
  }

  .assistant-sidebar--open {
    transform: translateX(0);
  }

  .assistant-mobile-bar {
    display: flex;
  }

  .assistant-shell {
    border-radius: 24px;
  }

  .welcome-state {
    padding: 36px 18px 18px;
  }

  .messages {
    padding: 20px 16px;
  }

  .message__content {
    max-width: 92%;
  }

  .input-area {
    padding: 14px;
  }

  .input-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 20;
    background: rgba(18, 33, 58, 0.18);
    backdrop-filter: blur(4px);
  }
}

/* ═══════════════════════════════════════════════
   Reduced Motion
   ═══════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .message {
    animation: none !important;
  }
  .message__bubble--typing span {
    animation: none !important;
  }
  .assistant-sidebar {
    transition: none !important;
  }
  .sidebar-overlay {
    transition: none !important;
  }
  .msg-action,
  .mode-btn,
  .history-item,
  .history-row,
  .icon-btn,
  .send-btn,
  .input-wrap,
  .new-chat-btn,
  .sidebar-search,
  .history-delete,
  .history-pin {
    transition: none !important;
  }
  .send-btn:hover:not(:disabled) {
    transform: none;
  }
}
</style>
