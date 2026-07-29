<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { marked } from "marked";
import {
  useAssistant,
  formatSessionTime,
} from "../composables/useAssistant.js";
import { useUserStore } from "../stores/userStore.js";

const router = useRouter();
const assistant = useAssistant();
const userStore = useUserStore();

const sessions = ref(assistant.getSessions());
const activeId = ref(assistant.getActiveSession()?.id || null);
const inputText = ref("");
const isLoading = ref(false);
const sidebarOpen = ref(false);
const messagesEl = ref(null);
const searchQuery = ref("");

const activeSession = computed(
  () => sessions.value.find((s) => s.id === activeId.value) || null,
);
const hasMessages = computed(
  () => (activeSession.value?.messages.length ?? 0) > 0,
);

const suggestions = [
  { icon: "课", text: "帮我设计一节高中物理《牛顿第二定律》的课件结构" },
  { icon: "案", text: "根据 PDF 教案生成配套 PPT 大纲和 Word 教案" },
  { icon: "互", text: "为这节新课设计 2 到 3 个课堂互动环节" },
  { icon: "评", text: "分析我的教学目标是否清晰，并给出优化建议" },
  { icon: "练", text: "围绕本课知识点生成分层练习与追问问题" },
  { icon: "改", text: "继续优化上一版教案的导入和板书设计" },
];

// const quickNotes = [
//   '支持资料',
//   '适合课件、教案、互动脚本共创',
//   '会话记录保存在本地浏览器',
// ]

const groupedSections = computed(() => {
  const grouped = assistant.groupSessionsByDate(sessions.value);
  return [
    { key: "today", label: "今天", items: grouped.today },
    { key: "yesterday", label: "昨天", items: grouped.yesterday },
    { key: "earlier", label: "更早", items: grouped.earlier },
  ].filter((group) => group.items.length);
});

function refresh() {
  sessions.value = assistant.getSessions();
  const current = assistant.getActiveSession();
  if (current) {
    activeId.value = current.id;
    return;
  }
  if (sessions.value.length) {
    activeId.value = sessions.value[0].id;
    assistant.setActive(activeId.value);
    return;
  }
  activeId.value = null;
}

function ensureSessionExists() {
  if (!assistant.getSessions().length) {
    const session = assistant.createSession();
    activeId.value = session.id;
  }
  refresh();
}

function handleNewChat() {
  activeId.value = null;
  inputText.value = "";
  sidebarOpen.value = false;
}

function selectSession(id) {
  activeId.value = id;
  assistant.setActive(id);
  sidebarOpen.value = false;
  scrollToBottom();
}

function handleDeleteSession(id) {
  assistant.deleteSession(id);
  refresh();
  if (!sessions.value.length) {
    const session = assistant.createSession();
    activeId.value = session.id;
    refresh();
  }
}

async function handleSend(text = inputText.value) {
  const content = (text || inputText.value).trim();
  if (!content || isLoading.value) return;

  inputText.value = "";
  isLoading.value = true;

  if (!activeId.value) {
    const session = assistant.createSession();
    activeId.value = session.id;
  }

  await assistant.sendMessage(content);
  refresh();
  isLoading.value = false;
  await nextTick();
  scrollToBottom();
}

function useSuggestion(text) {
  inputText.value = text;
  handleSend(text);
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
}

function onKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function renderMarkdown(text) {
  let html = marked(text, { breaks: true, gfm: true });
  html = html.replace(
    /→\[([^\]]+)\]\((\/[^)]+)\)/g,
    '<a href="javascript:;" class="internal-link" data-path="$2">$1 →</a>',
  );
  return html;
}

function copyMessage(text) {
  navigator.clipboard.writeText(text);
}

function regenerate(msg) {
  const msgs = activeSession.value.messages;
  const idx = msgs.indexOf(msg);
  for (let i = idx - 1; i >= 0; i--) {
    if (msgs[i].role === "user") {
      msgs.splice(i);
      handleSend(msgs[i].content);
      break;
    }
  }
}

function rateMessage(msg, type) {
  msg.rated = type;
}

function togglePin(id) {
  assistant.pinSession(id);
  refresh();
}

function switchMode(mode) {
  activeMode.value = mode;
}

function handleInternalLink(e) {
  const link = e.target.closest(".internal-link");
  if (link) {
    e.preventDefault();
    const path = link.getAttribute("data-path");
    if (path) router.push(path);
  }
}

onMounted(() => {
  // 进入页面先显示欢迎页，不自动加载历史会话
  activeId.value = null;
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".internal-link");
    if (link) {
      e.preventDefault();
      const path = link.getAttribute("data-path");
      if (path) router.push(path);
    }
  });
});

watch(activeId, scrollToBottom);
</script>

<template>
  <div class="assistant-page">
    <aside
      class="assistant-sidebar"
      :class="{ 'assistant-sidebar--open': sidebarOpen }"
    >
      <div class="assistant-sidebar__top">
        <RouterLink
          to="/"
          class="icon-btn icon-btn--soft"
          title="返回首页"
          @click="sidebarOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4l-6 6 6 6"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </RouterLink>

        <button class="new-chat-btn" @click="handleNewChat">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
          新对话
        </button>
      </div>

      <div class="sidebar-search">
        <svg
          class="sidebar-search__icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索对话..."
          class="sidebar-search__input"
        />
      </div>

      <div class="assistant-sidebar__history">
        <section
          v-for="group in groupedSections"
          :key="group.key"
          class="history-group"
        >
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
                  <path
                    d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
                    stroke="currentColor"
                    stroke-width="1.4"
                  />
                </svg>
              </span>
              <span class="history-item__content">
                <strong>{{ session.title }}</strong>
                <small>{{ formatSessionTime(session.updatedAt) }}</small>
              </span>
            </button>

            <button
              class="history-pin"
              title="置顶/取消置顶"
              @click.stop="togglePin(session.id)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="session.isPinned ? '#4d98f4' : 'currentColor'"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"
                />
              </svg>
            </button>

            <button
              class="history-delete"
              title="删除会话"
              aria-label="删除会话"
              @click.stop="handleDeleteSession(session.id)"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </section>
      </div>

      <div class="assistant-sidebar__foot">
        <RouterLink to="/" class="home-btn" @click="sidebarOpen = false">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4l-6 6 6 6"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          返回首页
        </RouterLink>

        <p class="assistant-sidebar__hint">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"
              stroke="currentColor"
              stroke-width="1.2"
            />
          </svg>
          智课对话仅保存在本地
        </p>
      </div>
    </aside>

    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <main class="assistant-main">
      <header class="assistant-mobile-bar">
        <button
          class="icon-btn icon-btn--soft"
          aria-label="打开侧边栏"
          @click="sidebarOpen = true"
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <span class="assistant-mobile-bar__title">智课 AI 助手</span>
      </header>

      <div class="mode-bar">
        <button
          v-for="m in teachingModes"
          :key="m.id"
          class="mode-btn"
          :class="{ 'mode-btn--active': activeMode === m.id }"
          @click="switchMode(m.id)"
        >
          <span class="mode-btn__icon" v-html="m.icon"></span>
          <span class="mode-btn__label">{{ m.label }}</span>
        </button>
      </div>

      <div class="assistant-shell" @click="handleInternalLink">
        <div v-if="!hasMessages && !isLoading" class="welcome">
          <div class="welcome__brand">
            <div class="welcome__logo">
              <span class="welcome__logo-icon">AI</span>
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
            v-for="(msg, index) in activeSession?.messages"
            :key="msg.id"
            class="message"
            :class="`message--${msg.role}`"
          >
            <div class="message__avatar">
              <!-- AI 助手头像 -->
              <span
                v-if="msg.role === 'assistant'"
                class="avatar-icon ai-avatar"
                >AI</span
              >
              <!-- 用户头像 -->
              <img
                v-else-if="userStore.getAvatar()"
                :src="userStore.getAvatar()"
                class="avatar-icon user-avatar-img"
                alt="头像"
              />
              <!-- 默认用户头像 -->
              <svg v-else viewBox="0 0 32 32" fill="none" class="avatar-icon">
                <circle cx="16" cy="16" r="16" fill="#edf2f9" />
                <circle cx="16" cy="12.5" r="4.5" fill="#6e8fb7" />
                <path
                  d="M5 27c0-6 5-10 11-10s11 4 11 10"
                  fill="#6e8fb7"
                  opacity="0.55"
                />
              </svg>
            </div>
            <div class="message__bubble">
              <div
                class="markdown-body"
                v-html="renderMarkdown(msg.content)"
              ></div>
            </div>
            <div v-if="msg.role === 'assistant'" class="message__actions">
              <button
                class="msg-action"
                title="复制"
                @click="copyMessage(msg.content)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  />
                </svg>
              </button>
              <button
                class="msg-action"
                title="重新生成"
                @click="regenerate(msg)"
                v-if="index === activeSession.messages.length - 1"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
              <span class="msg-action-divider"></span>
              <button
                class="msg-action"
                title="有帮助"
                @click="rateMessage(msg, 'up')"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path
                    d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                  />
                </svg>
              </button>
              <button
                class="msg-action"
                title="需改进"
                @click="rateMessage(msg, 'down')"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path
                    d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="isLoading" class="message message--assistant">
            <div class="message__avatar">
              <span class="avatar-icon ai-avatar">AI</span>
            </div>
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
              placeholder="输入问题..."
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
              <path
                d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"
                stroke="currentColor"
                stroke-width="1.2"
              />
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
  background: #f7f5f2;
  color: #1a1a1a;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;
}

.assistant-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 22px 18px;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.assistant-sidebar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid transparent;
  color: #9a9a9a;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.icon-btn--soft {
  background: #f1f1f2;
  border-color: transparent;
}

.icon-btn:hover {
  background: #e5e5e6;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.new-chat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: auto;
  padding: 5px 14px;
  border-radius: 10px;
  border: none;
  background: #2b6cb0;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.new-chat-btn:hover {
  background: #1e4f82;
}

.new-chat-btn svg {
  width: 14px;
  height: 14px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 400;
  color: #9a9a9a;
  padding: 0;
}

.history-label::before,
.history-label::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}

.history-label::before {
  margin-right: 0;
}

.history-row {
  position: relative;
  display: block;
  align-items: center;
  padding: 3px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.history-row + .history-row {
  margin-top: 4px;
}

.history-row:hover,
.history-row--active {
  background: #f1f1f2;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-width: 0;
  padding: 9px 70px 9px 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: #4a4a4a;
}

.history-item__icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f1f2;
  color: #9a9a9a;
}

.history-item__icon svg {
  width: 14px;
  height: 14px;
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
  color: #1a1a1a;
}

.history-item__content small {
  margin-top: 2px;
  font-size: 0.68rem;
  color: #9a9a9a;
}

.history-row--active .history-item__content strong {
  color: #2b6cb0;
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
  border-radius: 10px;
  background: transparent;
  color: #9a9a9a;
  cursor: pointer;
  opacity: 0;
  transform: translate(4px, -50%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.history-row:hover .history-delete,
.history-delete:focus-visible {
  opacity: 1;
  transform: translate(0, -50%);
}

.history-delete:hover {
  color: #d84747;
  background: #f1f1f2;
  transform: translate(0, -50%);
}

.history-delete svg {
  width: 14px;
  height: 14px;
}

.assistant-sidebar__foot {
  padding-top: 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.home-btn {
  display: none;
}

.assistant-sidebar__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 0.72rem;
  color: #9a9a9a;
}

.assistant-sidebar__hint svg {
  width: 12px;
  height: 12px;
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
  color: #1a1a1a;
}

.assistant-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 24px 20px;
  text-align: center;
}

.welcome__brand {
  max-width: 580px;
}

.welcome__logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  border-radius: 10px;
  display: grid;
  place-items: center;
}

.welcome__logo-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #2b6cb0;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.welcome__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.5rem, 2.8vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #1a1a1a;
}

.welcome__desc {
  margin-top: 12px;
  font-size: 0.88rem;
  line-height: 1.65;
  color: #9a9a9a;
  max-width: 440px;
  margin-left: auto;
  margin-right: auto;
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
  border-radius: 10px;
  background: #f1f1f2;
  border: none;
  color: #4a4a4a;
  font-size: 0.82rem;
  font-weight: 600;
}

.suggestions-block {
  max-width: 640px;
  width: 100%;
  margin-top: 40px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
}

.suggestions-block__label {
  margin-bottom: 16px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #9a9a9a;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: auto;
  padding: 0;
  border-radius: 0;
  border: none;
  background: transparent;
  color: #4a4a4a;
  text-align: left;
  cursor: pointer;
  font-size: 0.88rem;
  line-height: 1.5;
  transition: color 0.2s ease;
}

.suggestion-card::before {
  content: "•";
  color: #d0d0d0;
  font-size: 1rem;
  flex-shrink: 0;
}

.suggestion-card:hover {
  color: #2b6cb0;
  background: transparent;
  border-color: transparent;
  transform: none;
  box-shadow: none;
}

.suggestion-card__icon {
  display: none;
}

.suggestion-card__text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: #4a4a4a;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 28px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: msg-in 0.28s var(--ease-out);
}

.message--assistant {
  align-self: stretch;
  max-width: 100%;
}

.message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
  max-width: min(560px, 70%);
}

.message--user .message__avatar {
  margin-top: 8px;
}

.message__avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.message__bubble {
  font-size: 0.9375rem;
  line-height: 1.75;
}

/* AI 回复：浅蓝灰气泡 */
.message--assistant .message__bubble {
  padding: 12px 16px;
  background: #eef2f6;
  color: #4a4a4a;
  border-radius: 10px;
  flex: 1;
  min-width: 0;
}

/* 用户消息：气泡样式 */
.message--user .message__bubble {
  padding: 12px 18px;
  border-radius: 10px;
  background: #2b6cb0;
  color: #fff;
  font-weight: 500;
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
  background: rgba(43, 108, 176, 0.4);
  animation: typing 1.4s ease-in-out infinite;
}

.message__bubble--typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.message__bubble--typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-area {
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 14px;
  border-radius: 10px;
  border: none;
  background: #f1f1f2;
  transition: background 0.2s ease;
}

.input-wrap:focus-within {
  background: #eaeaeb;
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 0;
  font-size: 0.92rem;
  color: #1a1a1a;
}

.input-wrap input::placeholder {
  color: #9a9a9a;
}

.input-wrap input:disabled {
  opacity: 0.6;
}

.send-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  background: #2b6cb0;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #1a4f7f;
}

.send-btn:disabled {
  background: #d0d0d0;
  cursor: not-allowed;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

.input-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 10px;
  font-size: 0.625rem;
  color: #9a9a9a;
}

.input-hint svg {
  width: 12px;
  height: 12px;
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
    background: rgba(0, 0, 0, 0.08);
  }

  .assistant-main {
    padding: 12px;
  }

  .assistant-mobile-bar {
    display: flex;
  }

  .assistant-shell {
    border-radius: 10px;
  }

  .welcome {
    padding: 36px 20px 22px;
  }

  .welcome__logo,
  .welcome__logo-icon {
    width: 60px;
    height: 60px;
  }

  .welcome__logo-icon {
    font-size: 1.3rem;
  }

  .welcome__logo {
    border-radius: 10px;
  }

  .welcome__logo-icon {
    border-radius: 10px;
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

/* ---- Sidebar Search ---- */
.sidebar-search {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 4px;
  padding: 5px 8px;
  border-radius: 10px;
  background: #f1f1f2;
  border: none;
  transition: background 0.2s ease;
}

.sidebar-search:focus-within {
  background: #eaeaeb;
}

.sidebar-search__icon {
  flex-shrink: 0;
  color: #9a9a9a;
}

.sidebar-search__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.82rem;
  color: #4a4a4a;
}

.sidebar-search__input::placeholder {
  color: #9a9a9a;
}

/* ---- Pin Button ---- */
.history-pin {
  position: absolute;
  right: 38px;
  top: 50%;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #9a9a9a;
  cursor: pointer;
  opacity: 0;
  transform: translate(4px, -50%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.history-row:hover .history-pin,
.history-pin:focus-visible {
  opacity: 1;
  transform: translate(0, -50%);
}

.history-pin:hover {
  color: #2b6cb0;
  background: #f1f1f2;
  transform: translate(0, -50%);
}

.history-pin svg {
  width: 14px;
  height: 14px;
}

/* ---- Mode Bar ---- */
.mode-bar {
  display: flex;
  gap: 4px;
  padding: 10px 24px 0;
  background: transparent;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;
  background: transparent;
  color: #9a9a9a;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
  position: relative;
  bottom: -1px;
  letter-spacing: 0.01em;
}

.mode-btn:hover {
  color: #2b6cb0;
  background: rgba(255, 255, 255, 0.6);
}

.mode-btn--active {
  color: #2b6cb0;
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.06);
  border-bottom-color: #ffffff;
  font-weight: 700;
}

.mode-btn__icon {
  font-size: 1rem;
  line-height: 1;
}

.mode-btn__label {
  white-space: nowrap;
}

/* ---- Message Actions ---- */
.message__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
  margin-left: 48px;
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
  border-radius: 10px;
  background: transparent;
  color: #9a9a9a;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.msg-action:hover {
  color: #2b6cb0;
  background: #eef2f6;
  transform: none;
}

.msg-action-divider {
  width: 1px;
  height: 14px;
  margin: 0 4px;
  background: rgba(0, 0, 0, 0.08);
}

/* ---- Markdown Body ---- */
.markdown-body {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  letter-spacing: 0.01em;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 0.8em 0 0.35em;
  font-weight: 700;
  line-height: 1.45;
  color: #1a1a1a;
}

.markdown-body h1 {
  font-size: 1.35em;
  margin-top: 0.4em;
}
.markdown-body h2 {
  font-size: 1.18em;
}
.markdown-body h3 {
  font-size: 1.08em;
}

.markdown-body p {
  margin: 0.4em 0;
}

.markdown-body p + p {
  margin-top: 0.6em;
}

.markdown-body ul,
.markdown-body ol {
  margin: 0.4em 0;
  padding-left: 1.5em;
}

.markdown-body li {
  margin: 0.2em 0;
  line-height: 1.75;
}

.markdown-body li::marker {
  color: #2b6cb0;
}

.markdown-body blockquote {
  margin: 0.5em 0;
  padding: 6px 14px;
  border-left: 3px solid #2b6cb0;
  color: #4a4a4a;
  background: #eef2f6;
  border-radius: 0 6px 6px 0;
  font-style: normal;
}

.markdown-body code {
  padding: 2px 7px;
  border-radius: 5px;
  background: #eef2f6;
  color: #2b6cb0;
  font-size: 0.88em;
  font-family: "JetBrains Mono", "SF Mono", "Fira Code", monospace;
}

.markdown-body pre {
  margin: 0.6em 0;
  padding: 14px 16px;
  border-radius: 10px;
  background: #1a1a2e;
  overflow-x: auto;
  font-size: 0.88em;
  line-height: 1.55;
}

.markdown-body pre code {
  padding: 0;
  background: transparent;
  color: #e0e0e0;
  font-size: inherit;
}

.markdown-body table {
  width: 100%;
  margin: 0.6em 0;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.92em;
  overflow: hidden;
  border-radius: 8px;
}

.markdown-body th,
.markdown-body td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.markdown-body th {
  background: #eef2f6;
  font-weight: 600;
  color: #1a1a1a;
}

.markdown-body td {
  color: #4a4a4a;
}

.markdown-body a {
  color: #2b6cb0;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: rgba(43, 108, 176, 0.25);
  transition: text-decoration-color 0.2s;
}
.markdown-body a:hover {
  text-decoration-color: #2b6cb0;
}

.markdown-body a.internal-link {
  text-decoration: none;
  font-weight: 600;
  color: #2b6cb0;
  cursor: pointer;
}
.markdown-body a.internal-link:hover {
  text-decoration: underline;
}

.markdown-body hr {
  margin: 0.8em 0;
  border: none;
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
}

.markdown-body strong {
  font-weight: 650;
  color: #1a1a1a;
}

.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
}

/* ---- Avatar Icon ---- */
.avatar-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.ai-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #2b6cb0;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.user-avatar-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
