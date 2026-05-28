<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAssistant, formatSessionTime } from '../composables/useAssistant.js'

const assistant = useAssistant()

const sessions = ref(assistant.getSessions())
const activeId = ref(assistant.getActiveSession()?.id || null)
const inputText = ref('')
const isLoading = ref(false)
const sidebarOpen = ref(false)
const messagesEl = ref(null)

const activeSession = computed(() => sessions.value.find((s) => s.id === activeId.value) || null)
const hasMessages = computed(() => (activeSession.value?.messages.length ?? 0) > 0)

const suggestions = [
  { icon: '课', text: '帮我设计一节高中物理《牛顿第二定律》的课件结构' },
  { icon: '案', text: '根据 PDF 教案生成配套 PPT 大纲和 Word 教案' },
  { icon: '互', text: '为这节新课设计 2 到 3 个课堂互动环节' },
  { icon: '评', text: '分析我的教学目标是否清晰，并给出优化建议' },
  { icon: '练', text: '围绕本课知识点生成分层练习与追问问题' },
  { icon: '改', text: '继续优化上一版教案的导入和板书设计' },
]

// const quickNotes = [
//   '支持资料',
//   '适合课件、教案、互动脚本共创',
//   '会话记录保存在本地浏览器',
// ]

const groupedSections = computed(() => {
  const grouped = assistant.groupSessionsByDate(sessions.value)
  return [
    { key: 'today', label: '今天', items: grouped.today },
    { key: 'yesterday', label: '昨天', items: grouped.yesterday },
    { key: 'earlier', label: '更早', items: grouped.earlier },
  ].filter((group) => group.items.length)
})

function refresh() {
  sessions.value = assistant.getSessions()
  const current = assistant.getActiveSession()
  if (current) {
    activeId.value = current.id
    return
  }
  if (sessions.value.length) {
    activeId.value = sessions.value[0].id
    assistant.setActive(activeId.value)
    return
  }
  activeId.value = null
}

function ensureSessionExists() {
  if (!assistant.getSessions().length) {
    const session = assistant.createSession()
    activeId.value = session.id
  }
  refresh()
}

function handleNewChat() {
  const session = assistant.createSession()
  refresh()
  activeId.value = session.id
  inputText.value = ''
  sidebarOpen.value = false
}

function selectSession(id) {
  activeId.value = id
  assistant.setActive(id)
  sidebarOpen.value = false
  scrollToBottom()
}

function handleDeleteSession(id) {
  assistant.deleteSession(id)
  refresh()
  if (!sessions.value.length) {
    const session = assistant.createSession()
    activeId.value = session.id
    refresh()
  }
}

async function handleSend(text = inputText.value) {
  const content = (text || inputText.value).trim()
  if (!content || isLoading.value) return

  inputText.value = ''
  isLoading.value = true

  if (!activeId.value) {
    const session = assistant.createSession()
    activeId.value = session.id
  }

  await assistant.sendMessage(content)
  refresh()
  isLoading.value = false
  await nextTick()
  scrollToBottom()
}

function useSuggestion(text) {
  inputText.value = text
  handleSend(text)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

onMounted(() => {
  ensureSessionExists()
  scrollToBottom()
})

watch(activeId, scrollToBottom)
</script>

<template>
  <div class="assistant-page">
    <aside class="assistant-sidebar" :class="{ 'assistant-sidebar--open': sidebarOpen }">
      <div class="assistant-sidebar__top">
        <RouterLink to="/" class="icon-btn icon-btn--soft" title="返回首页" @click="sidebarOpen = false">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </RouterLink>

        <button class="new-chat-btn" @click="handleNewChat">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          新对话
        </button>
      </div>

      <div class="assistant-sidebar__history">
        <section v-for="group in groupedSections" :key="group.key" class="history-group">
          <p class="history-label">{{ group.label }}</p>

          <div
            v-for="session in group.items"
            :key="session.id"
            class="history-row"
            :class="{ 'history-row--active': session.id === activeId }"
          >
            <button class="history-item" @click="selectSession(session.id)">
              <span class="history-item__icon">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z" stroke="currentColor" stroke-width="1.4" />
                </svg>
              </span>
              <span class="history-item__content">
                <strong>{{ session.title }}</strong>
                <small>{{ formatSessionTime(session.updatedAt) }}</small>
              </span>
            </button>

            <button
              class="history-delete"
              title="删除会话"
              aria-label="删除会话"
              @click.stop="handleDeleteSession(session.id)"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      <div class="assistant-sidebar__foot">
        <RouterLink to="/" class="home-btn" @click="sidebarOpen = false">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          返回首页
        </RouterLink>

        <p class="assistant-sidebar__hint">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="currentColor" stroke-width="1.2" />
          </svg>
          智课对话仅保存在本地
        </p>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

    <main class="assistant-main">
      <header class="assistant-mobile-bar">
        <button class="icon-btn icon-btn--soft" aria-label="打开侧边栏" @click="sidebarOpen = true">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
        <span class="assistant-mobile-bar__title">智课 AI 助手</span>
      </header>

      <div class="assistant-shell">
        <div v-if="!hasMessages && !isLoading" class="welcome">
          <div class="welcome__brand">
            <div class="welcome__logo">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="url(#assistantGrad)" />
                <path d="M20 38L28 22h4l8 16h-4l-1.6-3.2H25.6L24 38h-4zm6.4-6.4h7.2L32 24.8l-5.6 6.8z" fill="white" />
                <path d="M42 22h4v16h-4V22z" fill="white" opacity="0.78" />
                <defs>
                  <linearGradient id="assistantGrad" x1="0" y1="0" x2="64" y2="64">
                    <stop stop-color="#5aa8ff" />
                    <stop offset="1" stop-color="#2c79dd" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 class="welcome__title">智课 AI 助手</h1>
            <p class="welcome__desc">
              帮您梳理教学目标、生成课件结构、融合教案资料，并持续优化课堂互动设计。
            </p>
          </div>

          <!-- <div class="welcome__notes">
            <span v-for="note in quickNotes" :key="note" class="welcome-note">{{ note }}</span>
          </div> -->

          <div class="suggestions-block">
            <p class="suggestions-block__label">常见问题</p>
            <div class="suggestions-grid">
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
          <div
            v-for="msg in activeSession?.messages"
            :key="msg.id"
            class="message"
            :class="`message--${msg.role}`"
          >
            <div class="message__avatar">
              {{ msg.role === 'assistant' ? 'AI' : '师' }}
            </div>
            <div class="message__bubble">
              <p>{{ msg.content }}</p>
            </div>
          </div>

          <div v-if="isLoading" class="message message--assistant">
            <div class="message__avatar">AI</div>
            <div class="message__bubble message__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-wrap">
            <input
              v-model="inputText"
              type="text"
              placeholder="描述您的教学目标，或直接输入问题..."
              :disabled="isLoading"
              @keydown="onKeydown"
            />
            <button
              class="send-btn"
              :disabled="!inputText.trim() || isLoading"
              aria-label="发送消息"
              @click="handleSend()"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 10l12-6-2 6 2 6-12-6z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <p class="input-hint">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="currentColor" stroke-width="1.2" />
            </svg>
            对话内容仅保存在本地浏览器
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.assistant-page {
  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 12%, rgba(120, 185, 255, 0.16), transparent 24%),
    linear-gradient(180deg, #edf5ff 0%, #f6faff 100%);
  color: var(--ink);
}

.assistant-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 22px 18px;
  background: rgba(224, 238, 255, 0.72);
  border-right: 1px solid rgba(113, 157, 212, 0.22);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
}

.assistant-sidebar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(113, 157, 212, 0.16);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid transparent;
  color: #3480df;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.icon-btn--soft {
  background: rgba(255, 255, 255, 0.56);
  border-color: rgba(123, 164, 216, 0.18);
}

.icon-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.88);
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.new-chat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 128px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(77, 151, 236, 0.34);
  background: rgba(210, 232, 255, 0.72);
  color: #3180e2;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.new-chat-btn:hover {
  transform: translateY(-1px);
  background: rgba(221, 238, 255, 0.96);
  box-shadow: 0 12px 24px rgba(67, 129, 204, 0.14);
}

.new-chat-btn svg {
  width: 18px;
  height: 18px;
}

.assistant-sidebar__history {
  flex: 1;
  padding: 18px 0;
  overflow-y: auto;
}

.history-group + .history-group {
  margin-top: 18px;
}

.history-label {
  margin-bottom: 8px;
  padding-left: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #6e8fb7;
}

.history-row {
  position: relative;
  display: block;
  align-items: center;
  padding: 3px;
  border-radius: 14px;
  transition: background 0.2s ease;
}

.history-row + .history-row {
  margin-top: 4px;
}

.history-row:hover,
.history-row--active {
  background: rgba(183, 216, 247, 0.68);
}

.history-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-width: 0;
  padding: 9px 40px 9px 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: #3c608d;
}

.history-item__icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
  color: #2f7ad8;
}

.history-item__icon svg {
  width: 15px;
  height: 15px;
}

.history-item__content {
  min-width: 0;
  display: grid;
}

.history-item__content strong,
.history-item__content small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item__content strong {
  font-size: 0.84rem;
  font-weight: 650;
  color: #315885;
}

.history-item__content small {
  margin-top: 2px;
  font-size: 0.68rem;
  color: #7e9cc0;
}

.history-row--active .history-item__content strong {
  color: #2b72ce;
}

.history-delete {
  position: absolute;
  right: 8px;
  top: 50%;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.62);
  color: #8da6c3;
  cursor: pointer;
  opacity: 0;
  transform: translate(4px, -50%);
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.history-row:hover .history-delete,
.history-delete:focus-visible {
  opacity: 1;
  transform: translate(0, -50%);
}

.history-delete:hover {
  color: #d84747;
  background: rgba(255, 255, 255, 0.96);
  transform: translate(0, -50%) scale(1.04);
}

.history-delete svg {
  width: 14px;
  height: 14px;
}

.assistant-sidebar__foot {
  padding-top: 18px;
  border-top: 1px solid rgba(113, 157, 212, 0.16);
}

.home-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  background: rgba(183, 216, 247, 0.7);
  color: #2d7fe4;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.home-btn:hover {
  background: rgba(196, 223, 249, 0.96);
  transform: translateY(-1px);
}

.home-btn svg {
  width: 16px;
  height: 16px;
}

.assistant-sidebar__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 0.76rem;
  color: #7a96ba;
}

.assistant-sidebar__hint svg {
  width: 14px;
  height: 14px;
}

.assistant-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 18px 22px;
}

.assistant-mobile-bar {
  display: none;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.assistant-mobile-bar__title {
  font-size: 1rem;
  font-weight: 700;
  color: #3a5e8e;
}

.assistant-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(155, 189, 231, 0.24);
  border-radius: 28px;
  box-shadow:
    0 18px 48px rgba(78, 127, 191, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  overflow: hidden;
}

.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px 28px;
  text-align: center;
}

.welcome__brand {
  max-width: 760px;
}

.welcome__logo {
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  border-radius: 28px;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 14px 28px rgba(66, 135, 223, 0.2));
}

.welcome__logo svg {
  width: 96px;
  height: 96px;
}

.welcome__title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #2867b9;
}

.welcome__desc {
  margin-top: 18px;
  font-size: 1.04rem;
  line-height: 1.8;
  color: #7a9bc3;
}

.welcome__notes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}

.welcome-note {
  display: inline-flex;
  align-items: center;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(234, 243, 255, 0.94);
  border: 1px solid rgba(161, 194, 236, 0.26);
  color: #5e84b6;
  font-size: 0.82rem;
  font-weight: 600;
}

.suggestions-block {
  width: min(900px, 100%);
  margin-top: 44px;
}

.suggestions-block__label {
  margin-bottom: 18px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #7295c2;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 64px;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid rgba(166, 196, 233, 0.34);
  background: #fff;
  color: #27486f;
  text-align: left;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  animation: fade-up 0.6s var(--ease-out) backwards;
  animation-delay: calc(var(--i) * 0.06s + 0.08s);
}

.suggestion-card:hover {
  transform: translateY(-2px);
  border-color: rgba(86, 149, 228, 0.42);
  box-shadow: 0 16px 28px rgba(78, 127, 191, 0.1);
}

.suggestion-card__icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(228, 240, 255, 0.94);
  color: #3c86df;
  font-size: 0.9rem;
  font-weight: 800;
}

.suggestion-card__text {
  font-size: 0.95rem;
  line-height: 1.55;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px 32px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: min(860px, 86%);
  animation: msg-in 0.28s var(--ease-out);
}

.message--assistant {
  align-self: flex-start;
}

.message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message__avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 800;
}

.message--assistant .message__avatar {
  background: linear-gradient(135deg, #57a4ff, #2e79da);
  color: #fff;
}

.message--user .message__avatar {
  background: rgba(225, 237, 252, 0.96);
  color: #2c5c95;
}

.message__bubble {
  padding: 14px 16px;
  border-radius: 18px;
  font-size: 0.94rem;
  line-height: 1.7;
}

.message--assistant .message__bubble {
  background: rgba(236, 244, 255, 0.96);
  color: #355780;
  border-bottom-left-radius: 6px;
}

.message--user .message__bubble {
  background: linear-gradient(135deg, #3d8eef, #2d79da);
  color: #fff;
  border-bottom-right-radius: 6px;
}

.message__bubble--typing {
  display: flex;
  gap: 5px;
  padding: 18px 20px;
}

.message__bubble--typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(61, 142, 239, 0.52);
  animation: typing 1.4s ease-in-out infinite;
}

.message__bubble--typing span:nth-child(2) { animation-delay: 0.2s; }
.message__bubble--typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

@keyframes msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-area {
  padding: 18px 24px 20px;
  border-top: 1px solid rgba(166, 196, 233, 0.24);
  background: rgba(255, 255, 255, 0.96);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 8px 18px;
  border-radius: 28px;
  border: 1.5px solid rgba(91, 151, 229, 0.58);
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.94);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.input-wrap:focus-within {
  border-color: #4d98f4;
  box-shadow: 0 0 0 4px rgba(77, 152, 244, 0.08);
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 1rem;
  color: #24466d;
}

.input-wrap input::placeholder {
  color: #90a6c3;
}

.input-wrap input:disabled {
  opacity: 0.6;
}

.send-btn {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #5ca8ff, #2f7bdb);
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.04);
}

.send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 0.78rem;
  color: #88a0bf;
}

.input-hint svg {
  width: 14px;
  height: 14px;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 980px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .assistant-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.28s var(--ease-out);
  }

  .assistant-sidebar--open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(20, 39, 66, 0.16);
    backdrop-filter: blur(3px);
  }

  .assistant-main {
    padding: 12px;
  }

  .assistant-mobile-bar {
    display: flex;
  }

  .assistant-shell {
    border-radius: 20px;
  }

  .welcome {
    padding: 36px 20px 22px;
  }

  .welcome__logo,
  .welcome__logo svg {
    width: 82px;
    height: 82px;
  }

  .messages {
    padding: 20px 16px;
  }

  .message {
    max-width: 94%;
  }

  .input-area {
    padding: 14px 14px 16px;
  }
}
</style>
