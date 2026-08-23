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

// 备课任务模式：每个模式 = 一个定向备课任务，点击即触发对应默认指令
const teachingModes = [
  {
    id: "goal",
    label: "写目标",
    hint: "三维目标·可观测",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/></svg>',
    trigger: "请帮我撰写本节课的教学目标",
  },
  {
    id: "difficulty",
    label: "拆难点",
    hint: "重难点·易错点",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 20h20z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    trigger: "请帮我梳理本节课的教学重点、难点与易错点",
  },
  {
    id: "intro",
    label: "设计导入",
    hint: "情境·悬念·案例",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.4 1 2.2V17h6v-1.3c0-.8.3-1.6 1-2.2A6 6 0 0 0 12 3z"/></svg>',
    trigger: "请帮我设计本节课的课堂导入",
  },
  {
    id: "quiz",
    label: "出题",
    hint: "分层·变式·考点",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v4h4"/><path d="M9 13l2 2 4-4"/></svg>',
    trigger: "请帮我围绕本节课知识设计分层练习",
  },
  {
    id: "lesson",
    label: "教案",
    hint: "完整可直接用",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M20 17v5H6.5A2.5 2.5 0 0 1 4 19.5"/></svg>',
    trigger: "请帮我编写本节课的完整教案",
  },
  {
    id: "board",
    label: "板书",
    hint: "结构·布局",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 8h18M3 12h10"/><path d="M12 16l-3 5M12 16l3 5"/></svg>',
    trigger: "请帮我设计本节课的板书",
  },
  {
    id: "interact",
    label: "互动",
    hint: "提问·活动·游戏",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"/></svg>',
    trigger: "请帮我设计本节课的课堂互动",
  },
  {
    id: "exam",
    label: "对接考点",
    hint: "考法·易错提醒",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 7-7"/><path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6"/></svg>',
    trigger: "请帮我分析本节课知识点的考试考法",
  },
];

// 教师角色画像选项（与课件制作学科/学段保持一致）
const SUBJECT_OPTIONS = [
  "语文",
  "数学",
  "英语",
  "物理",
  "化学",
  "生物",
  "历史",
  "地理",
  "政治",
];
const GRADE_OPTIONS = ["小学低年级", "小学高年级", "初中", "高中"];
const PROFILE_KEY = "zhike-teacher-profile";

function loadTeacherProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { subject: "", grade: "" };
}

// 当前备课任务模式（空 = 自由对话）
const activeMode = ref("");
// 教师角色画像：锁定学科与任教年级/学段，注入每次对话
const teacherProfile = ref(loadTeacherProfile());

function saveTeacherProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(teacherProfile.value));
}

function setSubject(subject) {
  teacherProfile.value.subject = subject;
  saveTeacherProfile();
}

function setGrade(grade) {
  teacherProfile.value.grade = grade;
  saveTeacherProfile();
}

// 当前定向任务模式的展示信息
const currentMode = computed(
  () => teachingModes.find((m) => m.id === activeMode.value) || null,
);
const currentModeLabel = computed(() => currentMode.value?.label || "");
const currentModeDesc = computed(() => currentMode.value?.hint || "");
const currentModeIcon = computed(() => currentMode.value?.icon || "");

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

  await assistant.sendMessage(content, {
    mode: activeMode.value,
    profile: teacherProfile.value,
  });
  refresh();
  isLoading.value = false;
  await nextTick();
  scrollToBottom();
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
  // 再次点击已选中的模式 = 取消定向任务，回到自由对话
  if (activeMode.value === mode) {
    activeMode.value = "";
    return;
  }
  activeMode.value = mode;
  const m = teachingModes.find((x) => x.id === mode);
  if (m) {
    // 点击即用：自动发送该任务的默认指令，免写 prompt
    handleSend(m.trigger);
  }
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
          aria-label="返回首页"
          @click="sidebarOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
          placeholder="搜索对话…"
          aria-label="搜索对话历史"
          autocomplete="off"
          name="assistant-search"
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
              aria-label="置顶/取消置顶"
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
                aria-hidden="true"
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
        <div class="profile-box">
          <p class="profile-box__label">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 14c.6-2.5 2.9-4 5.5-4s4.9 1.5 5.5 4"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>
            我的教学身份
          </p>
          <div class="profile-box__fields">
            <select
              class="profile-select"
              :value="teacherProfile.subject"
              @change="setSubject($event.target.value)"
              aria-label="我的学科"
            >
              <option value="">学科</option>
              <option v-for="s in SUBJECT_OPTIONS" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
            <select
              class="profile-select"
              :value="teacherProfile.grade"
              @change="setGrade($event.target.value)"
              aria-label="我的任教年级"
            >
              <option value="">学段</option>
              <option v-for="g in GRADE_OPTIONS" :key="g" :value="g">
                {{ g }}
              </option>
            </select>
          </div>
          <p v-if="teacherProfile.subject" class="profile-box__status">
            已按「{{ teacherProfile.subject }} ·
            {{ teacherProfile.grade || "未选学段" }}」身份辅助备课
          </p>
        </div>

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
          对话与身份仅保存在本地
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
          <span
            class="mode-btn__icon"
            aria-hidden="true"
            v-html="m.icon"
          ></span>
          <span class="mode-btn__label">{{ m.label }}</span>
        </button>
      </div>

      <div class="assistant-shell" @click="handleInternalLink">
        <div v-if="!hasMessages && !isLoading" class="welcome">
          <div class="welcome__brand">
            <div class="welcome__logo">
              <span class="welcome__logo-icon">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  aria-hidden="true"
                  width="40"
                  height="40"
                >
                  <rect
                    width="40"
                    height="40"
                    rx="10"
                    fill="url(#welcome-ai-g)"
                  />
                  <path
                    d="M12 11c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v16c0 .55-.45 1-1 1H13c-.55 0-1-.45-1-1V11z"
                    fill="rgba(255,255,255,0.9)"
                  />
                  <path
                    d="M20 11c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v16c0 .55-.45 1-1 1h-6c-.55 0-1-.45-1-1V11z"
                    fill="rgba(255,255,255,0.55)"
                  />
                  <rect
                    x="19"
                    y="11"
                    width="2"
                    height="16"
                    rx="0.5"
                    fill="rgba(255,255,255,0.2)"
                  />
                  <circle cx="31" cy="11" r="3" fill="#FDE68A" />
                  <defs>
                    <linearGradient
                      id="welcome-ai-g"
                      x1="0"
                      y1="0"
                      x2="40"
                      y2="40"
                    >
                      <stop stop-color="#2563EB" />
                      <stop stop-color="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </div>

            <h1 class="welcome__title">知课 AI 备课助手</h1>
            <p class="welcome__desc">
              专为教师备课打造：选择下方备课任务即可一键生成目标、重难点、导入、教案、板书与试题。先在上方设置您的学科与学段，AI
              将按您的教学身份精准辅助。
            </p>
          </div>

          <div class="suggestions-block">
            <p class="suggestions-block__label">常用备课任务</p>
            <div class="suggestions-grid">
              <button
                v-for="(item, index) in teachingModes"
                :key="item.id"
                class="suggestion-card"
                :class="{ 'suggestion-card--active': activeMode === item.id }"
                :style="{ '--i': index }"
                @click="switchMode(item.id)"
              >
                <span class="suggestion-card__icon" v-html="item.icon"></span>
                <span class="suggestion-card__text">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.hint }}</small>
                </span>
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
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  aria-hidden="true"
                  class="ai-avatar-svg"
                >
                  <rect width="32" height="32" rx="8" fill="url(#chat-ai-g)" />
                  <path
                    d="M10 9c0-.55.45-1 1-1h4.5c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H11c-.55 0-1-.45-1-1V9z"
                    fill="rgba(255,255,255,0.88)"
                  />
                  <path
                    d="M15.5 9c0-.55.45-1 1-1H21c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1h-4.5c-.55 0-1-.45-1-1V9z"
                    fill="rgba(255,255,255,0.55)"
                  />
                  <rect
                    x="14.5"
                    y="9"
                    width="3"
                    height="12"
                    rx="0.5"
                    fill="rgba(255,255,255,0.2)"
                  />
                  <circle cx="24.5" cy="9" r="2.5" fill="#FDE68A" />
                  <defs>
                    <linearGradient
                      id="chat-ai-g"
                      x1="0"
                      y1="0"
                      x2="32"
                      y2="32"
                    >
                      <stop stop-color="#2563EB" />
                      <stop stop-color="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <!-- 用户头像 -->
              <img
                v-else-if="userStore.getAvatar()"
                :src="userStore.getAvatar()"
                class="avatar-icon user-avatar-img"
                alt="头像"
              />
              <!-- 默认用户头像 -->
              <svg
                v-else
                viewBox="0 0 32 32"
                fill="none"
                class="avatar-icon"
                aria-hidden="true"
              >
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
                aria-label="复制消息"
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
                  aria-hidden="true"
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
                aria-label="重新生成回答"
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
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
              <span class="msg-action-divider"></span>
              <button
                class="msg-action"
                title="有帮助"
                aria-label="评价有帮助"
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
                  aria-hidden="true"
                >
                  <path
                    d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                  />
                </svg>
              </button>
              <button
                class="msg-action"
                title="需改进"
                aria-label="评价需改进"
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
                  aria-hidden="true"
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
              <span class="avatar-icon ai-avatar">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  aria-hidden="true"
                  class="ai-avatar-svg"
                >
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill="url(#loading-ai-g)"
                  />
                  <path
                    d="M10 9c0-.55.45-1 1-1h4.5c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H11c-.55 0-1-.45-1-1V9z"
                    fill="rgba(255,255,255,0.88)"
                  />
                  <path
                    d="M15.5 9c0-.55.45-1 1-1H21c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1h-4.5c-.55 0-1-.45-1-1V9z"
                    fill="rgba(255,255,255,0.55)"
                  />
                  <rect
                    x="14.5"
                    y="9"
                    width="3"
                    height="12"
                    rx="0.5"
                    fill="rgba(255,255,255,0.2)"
                  />
                  <circle cx="24.5" cy="9" r="2.5" fill="#FDE68A" />
                  <defs>
                    <linearGradient
                      id="loading-ai-g"
                      x1="0"
                      y1="0"
                      x2="32"
                      y2="32"
                    >
                      <stop stop-color="#2563EB" />
                      <stop stop-color="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </div>
            <div class="message__bubble message__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <div class="input-area">
          <div
            v-if="activeMode"
            class="mode-indicator"
            :title="currentModeDesc"
          >
            <span class="mode-indicator__icon" v-html="currentModeIcon"></span>
            <span class="mode-indicator__label">
              定向任务：{{ currentModeLabel }} —— {{ currentModeDesc }}
            </span>
            <button
              class="mode-indicator__clear"
              title="取消定向任务，回到自由对话"
              aria-label="取消定向任务"
              @click="activeMode = ''"
            >
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <div class="input-wrap">
            <input
              v-model="inputText"
              type="text"
              placeholder="输入问题…"
              aria-label="输入您的问题"
              autocomplete="off"
              name="assistant-query"
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
/* ═══════════════════════════════════════════════
   Design Tokens & Page Shell
   ═══════════════════════════════════════════════ */
.assistant-page {
  --accent-blue: #2563eb;
  --accent-blue-dark: #1d4ed8;
  --coral: #f43f5e;
  --ink: #1a1a1a;
  --ink-soft: #4a4a4a;
  --ink-muted: #6b7280;
  --ink-faint: #9ca3af;
  --border-subtle: rgba(0, 0, 0, 0.07);
  --radius: 10px;
  --radius-sm: 8px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

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

/* ═══════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════ */
.assistant-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  background: #ffffff;
  border-right: 1px solid var(--border-subtle);
}

.assistant-sidebar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: none;
  color: var(--ink-faint);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.icon-btn--soft {
  background: #f3f4f6;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.new-chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--accent-blue);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.new-chat-btn:hover {
  background: var(--accent-blue-dark);
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.25);
}

.new-chat-btn svg {
  width: 14px;
  height: 14px;
}

.assistant-sidebar__history {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.history-group + .history-group {
  margin-top: 16px;
}

.history-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
}

.history-label::before,
.history-label::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.history-row {
  position: relative;
  padding: 2px;
  border-radius: var(--radius);
  transition: background 0.2s ease;
}

.history-row + .history-row {
  margin-top: 3px;
}

.history-row:hover,
.history-row--active {
  background: #f3f4f6;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 8px 68px 8px 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: var(--ink-soft);
  font-family: inherit;
}

.history-item__icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: #f3f4f6;
  color: var(--ink-faint);
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
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink);
}

.history-item__content small {
  margin-top: 2px;
  font-size: 0.68rem;
  color: var(--ink-faint);
}

.history-row--active .history-item__content strong {
  color: var(--accent-blue);
}

.history-delete,
.history-pin {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  opacity: 0;
  transform: translate(4px, -50%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.history-pin {
  right: 36px;
}

.history-delete {
  right: 5px;
}

.history-row:hover .history-delete,
.history-row:hover .history-pin,
.history-delete:focus-visible,
.history-pin:focus-visible {
  opacity: 1;
  transform: translate(0, -50%);
}

.history-pin:hover {
  color: var(--accent-blue);
  background: #e5e7eb;
}

.history-delete:hover {
  color: var(--coral);
  background: #fef2f2;
}

.history-delete svg,
.history-pin svg {
  width: 14px;
  height: 14px;
}

.assistant-sidebar__foot {
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

/* ---- 教师教学身份 ---- */
.profile-box {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: #f6f8fb;
}

.profile-box__label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.profile-box__label svg {
  width: 13px;
  height: 13px;
  color: var(--accent-blue);
}

.profile-box__fields {
  display: flex;
  gap: 6px;
}

.profile-select {
  flex: 1;
  min-width: 0;
  padding: 5px 6px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  font-size: 0.76rem;
  color: var(--ink);
  font-family: inherit;
  cursor: pointer;
}

.profile-select:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.profile-box__status {
  margin-top: 8px;
  font-size: 0.68rem;
  line-height: 1.4;
  color: var(--accent-blue);
}

.home-btn {
  display: none;
}

.assistant-sidebar__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--ink-faint);
}

.assistant-sidebar__hint svg {
  width: 12px;
  height: 12px;
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
  padding: 20px 24px;
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
  color: var(--ink);
}

.assistant-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* ═══════════════════════════════════════════════
   Mode Bar (inside shell top)
   ═══════════════════════════════════════════════ */
.mode-bar {
  display: flex;
  gap: 2px;
  padding: 12px 20px 0;
  border-bottom: 1px solid var(--border-subtle);
  background: #ffffff;
  overflow-x: auto;
  scrollbar-width: none;
}

.mode-bar::-webkit-scrollbar {
  display: none;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px 9px;
  border: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: transparent;
  color: var(--ink-faint);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
  position: relative;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.mode-btn:hover {
  color: var(--accent-blue);
  background: #f8fafc;
}

.mode-btn--active {
  color: var(--accent-blue);
  background: transparent;
  font-weight: 600;
}

.mode-btn--active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 8px;
  right: 8px;
  height: 2px;
  border-radius: 1px;
  background: var(--accent-blue);
}

.mode-btn__icon {
  font-size: 1rem;
  line-height: 1;
  display: flex;
}

.mode-btn__icon svg {
  width: 15px;
  height: 15px;
}

.mode-btn__label {
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════
   Welcome screen
   ═══════════════════════════════════════════════ */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px 24px;
  text-align: center;
}

.welcome__brand {
  max-width: 520px;
}

.welcome__logo {
  margin: 0 auto 20px;
  display: grid;
  place-items: center;
}

.welcome__logo-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.welcome__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.35rem, 2.4vw, 1.7rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
}

.welcome__desc {
  margin-top: 10px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--ink-faint);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* ---- Suggestions ---- */
.suggestions-block {
  max-width: 560px;
  width: 100%;
  margin-top: 36px;
}

.suggestions-block__label {
  margin-bottom: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 12px;
  background: #fff;
  color: var(--ink-soft);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.suggestion-card:hover {
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);
  transform: translateY(-1px);
}

.suggestion-card--active {
  border-color: var(--accent-blue);
  background: rgba(37, 99, 235, 0.05);
  box-shadow: 0 0 0 1px var(--accent-blue) inset;
}

.suggestion-card__icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--accent-blue);
}

.suggestion-card__icon svg {
  width: 20px;
  height: 20px;
}

.suggestion-card__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.82rem;
  line-height: 1.4;
  color: inherit;
}

.suggestion-card__text strong {
  font-size: 0.88rem;
  color: var(--ink);
}

.suggestion-card__text small {
  font-size: 0.72rem;
  color: var(--ink-faint);
}

/* ═══════════════════════════════════════════════
   Messages
   ═══════════════════════════════════════════════ */
.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 28px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: msg-in 0.25s ease-out;
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
  margin-top: 6px;
}

.message__avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Avatar styles */
.avatar-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 0;
}

.ai-avatar-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.user-avatar-img {
  border-radius: 50%;
  object-fit: cover;
}

.message__bubble {
  font-size: 0.9375rem;
  line-height: 1.7;
}

.message--assistant .message__bubble {
  padding: 12px 18px;
  background: #f0f4ff;
  color: var(--ink-soft);
  border-radius: 4px 14px 14px 14px;
  flex: 1;
  min-width: 0;
}

.message--user .message__bubble {
  padding: 12px 18px;
  border-radius: 14px 4px 14px 14px;
  background: var(--accent-blue);
  color: #fff;
  font-weight: 500;
}

.message__bubble--typing {
  display: flex;
  gap: 5px;
  padding: 18px 22px;
}

.message__bubble--typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #93a9e0;
  animation: typing 1.3s ease-in-out infinite;
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
    opacity: 0.35;
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
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border-subtle);
  background: #ffffff;
}

/* ---- 当前定向任务指示条 ---- */
.mode-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 7px 10px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.06);
  color: var(--accent-blue);
  font-size: 0.78rem;
}

.mode-indicator__icon {
  flex-shrink: 0;
  display: flex;
}

.mode-indicator__icon svg {
  width: 16px;
  height: 16px;
}

.mode-indicator__label {
  flex: 1;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mode-indicator__clear {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.mode-indicator__clear:hover {
  color: #dc2626;
  background: #fef2f2;
}

.mode-indicator__clear svg {
  width: 13px;
  height: 13px;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 3px 3px 16px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.input-wrap:focus-within {
  border-color: var(--accent-blue);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 0;
  font-size: 0.92rem;
  color: var(--ink);
  font-family: inherit;
}

.input-wrap input::placeholder {
  color: var(--ink-faint);
}

.input-wrap input:disabled {
  opacity: 0.5;
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
  background: var(--accent-blue);
  color: #fff;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-blue-dark);
  transform: scale(1.05);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  background: #d1d5db;
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
  font-size: 0.62rem;
  color: var(--ink-faint);
}

.input-hint svg {
  width: 12px;
  height: 12px;
}

/* ═══════════════════════════════════════════════
   Sidebar Overlay (mobile)
   ═══════════════════════════════════════════════ */
.sidebar-overlay {
  display: none;
}

/* ═══════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════ */
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
    border-radius: 12px;
  }

  .welcome {
    padding: 32px 18px 20px;
  }

  .welcome__logo-icon {
    width: 50px;
    height: 50px;
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
