<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { RouterLink } from "vue-router";
import {
  useAssistant,
  formatSessionTime,
} from "../composables/useAssistant.js";
import TypewriterText from "../components/TypewriterText.vue";

const assistant = useAssistant();

// 记录哪些消息已经显示过打字机效果
const typedMessageIds = ref(new Set());

const sessions = ref(assistant.getSessions());
const activeId = ref(assistant.getActiveSession()?.id || null);
const inputText = ref("");
const isLoading = ref(false);
const sidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const messagesEl = ref(null);
const fileInput = ref(null);

// 侧边栏菜单状态
const activeMenuId = ref(null);
const menuPosition = ref({ top: 0, left: 0 });

// 功能开关状态
const isSmartSearchEnabled = ref(false);
const isDeepThinkingEnabled = ref(false);

// 重命名弹窗状态
const renameModalOpen = ref(false);
const renameTargetId = ref(null);
const renameValue = ref("");

const activeSession = computed(
  () => sessions.value.find((s) => s.id === activeId.value) || null,
);
const hasMessages = computed(
  () => (activeSession.value?.messages.length ?? 0) > 0,
);

const grouped = computed(() => assistant.groupSessionsByDate(sessions.value));

const suggestions = [
  {
    icon: "📐",
    text: "帮我设计一节高中物理《牛顿第二定律》的课件结构",
  },
  {
    icon: "📄",
    text: "根据 PDF 教案，生成配套 PPT 大纲与 Word 教案",
  },
  {
    icon: "🎯",
    text: "为这节新课设计 2-3 个课堂互动环节",
  },
  {
    icon: "💡",
    text: "分析我的教学目标是否清晰，并给出优化建议",
  },
];

function refresh() {
  sessions.value = assistant.getSessions();
  if (!activeId.value && sessions.value.length) {
    activeId.value = sessions.value[0].id;
    assistant.setActive(activeId.value);
  }
}

function handleNewChat() {
  // 检查是否已存在空的对话（没有消息的对话）
  const emptySession = sessions.value.find(
    (s) => !s.messages || s.messages.length === 0,
  );

  if (emptySession) {
    // 如果已有空对话，直接跳转到该对话
    activeId.value = emptySession.id;
    assistant.setActive(emptySession.id);
  } else {
    // 没有空对话才创建新的
    const s = assistant.createSession();
    refresh();
    activeId.value = s.id;
  }

  inputText.value = "";
  sidebarOpen.value = false;
}

function selectSession(id) {
  activeId.value = id;
  assistant.setActive(id);
  sidebarOpen.value = false;
  scrollToBottom();
}

async function handleSend(text = inputText.value) {
  const content = (text || inputText.value).trim();
  if (!content || isLoading.value) return;

  inputText.value = "";
  isLoading.value = true;

  if (!activeId.value) {
    const s = assistant.createSession();
    activeId.value = s.id;
  }

  await assistant.sendMessage(content);
  refresh();
  isLoading.value = false;
  await nextTick();
  scrollToBottom();
}

// 提取关键词作为标题（12字以内）
function truncateTitle(title, maxLength = 12) {
  if (!title || title.length <= maxLength) {
    return title || "新对话";
  }

  // 定义常见停用词
  const stopWords = new Set([
    "的",
    "了",
    "是",
    "我",
    "你",
    "他",
    "她",
    "它",
    "们",
    "在",
    "有",
    "和",
    "与",
    "或",
    "就",
    "都",
    "而",
    "及",
    "等",
    "对",
    "能",
    "会",
    "要",
    "去",
    "到",
    "从",
    "把",
    "被",
    "给",
    "让",
    "向",
    "往",
    "为",
    "因",
    "于",
    "即",
    "使",
    "但",
    "却",
    "虽",
    "如果",
    "那么",
    "因为",
    "所以",
    "而且",
    "或者",
    "请",
    "帮",
    "帮我",
    "给我",
    "给我个",
    "给我一个",
    "给我一",
    "想",
    "想要",
    "需要",
    "希望",
    "可以",
    "能不能",
    "能不能帮",
    "能不能帮我",
    "怎么",
    "怎么样",
    "如何",
    "什么",
    "哪些",
    "吗",
    "呢",
    "吧",
    "啊",
    "哦",
    "嗯",
    "这个",
    "那个",
    "一个",
    "一下",
    "一些",
    "这些",
    "那些",
    "它们",
  ]);

  // 尝试提取关键词
  // 1. 先尝试提取引号内的内容
  const quoteMatch = title.match(/[""""']([^""""']{2,12})[""""']/);
  if (quoteMatch) {
    return quoteMatch[1];
  }

  // 2. 尝试提取书名号内的内容
  const bookMatch = title.match(/[《<]([^》>]{2,12})[》>]/);
  if (bookMatch) {
    return bookMatch[1];
  }

  // 3. 提取核心名词（去除停用词后的前几个词）
  const words = title
    .replace(/[，。？！；：""""'《》（）【】\[\]]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));

  if (words.length > 0) {
    // 取前几个关键词组合
    let result = "";
    for (const word of words) {
      if ((result + word).length <= maxLength) {
        result += word;
      } else {
        break;
      }
    }
    if (result.length >= 2) {
      return result;
    }
  }

  // 4. 如果以上都失败，直接截取前12个字符
  return title.substring(0, maxLength);
}

// 打开侧边栏菜单
function openMenu(sessionId, event) {
  event.stopPropagation();
  if (activeMenuId.value === sessionId) {
    activeMenuId.value = null;
    return;
  }
  activeMenuId.value = sessionId;
  const rect = event.currentTarget.getBoundingClientRect();
  menuPosition.value = {
    top: rect.bottom + 6,
    left: rect.left,
  };
  document.addEventListener("click", closeMenu, { once: true });
}

function closeMenu() {
  activeMenuId.value = null;
}

// 重命名
function openRenameModal() {
  const session = sessions.value.find((s) => s.id === activeMenuId.value);
  if (!session) return;
  renameTargetId.value = session.id;
  renameValue.value = session.title;
  renameModalOpen.value = true;
  activeMenuId.value = null;
}

function confirmRename() {
  if (renameValue.value.trim() && renameTargetId.value) {
    assistant.updateSessionTitle(
      renameTargetId.value,
      renameValue.value.trim(),
    );
    refresh();
  }
  renameModalOpen.value = false;
  renameTargetId.value = null;
}

function cancelRename() {
  renameModalOpen.value = false;
  renameTargetId.value = null;
}

// 分享
function shareSession() {
  const session = sessions.value.find((s) => s.id === activeMenuId.value);
  if (!session) return;
  const url = `${window.location.origin}/share/session/${session.id}`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert("分享链接已复制到剪贴板！");
    })
    .catch((err) => {
      console.error("无法复制链接: ", err);
      alert("复制链接失败。");
    });
  activeMenuId.value = null;
}

// 删除
function deleteSession() {
  const session = sessions.value.find((s) => s.id === activeMenuId.value);
  if (!session) return;
  if (confirm("确定要删除这个对话吗？")) {
    assistant.deleteSession(session.id);
    refresh();
    if (activeId.value === session.id) {
      activeId.value = sessions.value.length ? sessions.value[0].id : null;
    }
  }
  activeMenuId.value = null;
}

// 置顶
function pinSession() {
  const session = sessions.value.find((s) => s.id === activeMenuId.value);
  if (!session) return;
  assistant.pinSession(session.id);
  refresh();
  activeMenuId.value = null;
}

// 复制消息内容
async function copyMessage(content) {
  try {
    await navigator.clipboard.writeText(content);
    alert("内容已复制到剪贴板！");
  } catch (err) {
    console.error("复制失败:", err);
    alert("复制失败，请手动复制。");
  }
}

// 打字机效果完成回调
function onTypeComplete(messageId) {
  typedMessageIds.value.add(messageId);
}

function useSuggestion(text) {
  inputText.value = text;
  handleSend(text);
}

function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  console.log("Selected file:", file.name);
  inputText.value = `已选择文件：${file.name}`;
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

onMounted(() => {
  if (!sessions.value.length) {
    assistant.createSession();
    refresh();
  } else if (!activeId.value) {
    activeId.value = sessions.value[0].id;
    assistant.setActive(activeId.value);
  }
  scrollToBottom();
});

watch(activeId, scrollToBottom);
</script>

<template>
  <div
    class="assistant-page"
    :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
  >
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar__top">
        <RouterLink
          to="/"
          class="icon-btn"
          title="返回"
          @click="sidebarOpen = false"
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4l-6 6 6 6"
              stroke="currentColor"
              stroke-width="1.5"
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
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span class="new-chat-btn__text">创建新对话</span>
        </button>
      </div>

      <div class="sidebar__history">
        <template v-if="grouped.today.length">
          <p class="history-label">今天</p>
          <div
            v-for="s in grouped.today"
            :key="s.id"
            class="history-item-wrapper"
          >
            <button
              class="history-item"
              :class="{ 'history-item--active': s.id === activeId }"
              @click="selectSession(s.id)"
            >
              <svg class="history-item__icon" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
              </svg>
              <span class="history-item__text">{{
                truncateTitle(s.title)
              }}</span>
              <span v-if="s.isPinned" class="pin-badge" title="已置顶">📌</span>
            </button>
            <button
              class="more-btn"
              @click="openMenu(s.id, $event)"
              title="更多选项"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </template>

        <template v-if="grouped.yesterday.length">
          <p class="history-label">昨天</p>
          <div
            v-for="s in grouped.yesterday"
            :key="s.id"
            class="history-item-wrapper"
          >
            <button
              class="history-item"
              :class="{ 'history-item--active': s.id === activeId }"
              @click="selectSession(s.id)"
            >
              <svg class="history-item__icon" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
              </svg>
              <span class="history-item__text">{{
                truncateTitle(s.title)
              }}</span>
              <span v-if="s.isPinned" class="pin-badge" title="已置顶">📌</span>
            </button>
            <button
              class="more-btn"
              @click="openMenu(s.id, $event)"
              title="更多选项"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </template>

        <template v-if="grouped.earlier.length">
          <p class="history-label">更早</p>
          <div
            v-for="s in grouped.earlier"
            :key="s.id"
            class="history-item-wrapper"
          >
            <button
              class="history-item"
              :class="{ 'history-item--active': s.id === activeId }"
              @click="selectSession(s.id)"
            >
              <svg class="history-item__icon" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
              </svg>
              <span class="history-item__text">{{
                truncateTitle(s.title)
              }}</span>
              <time>{{ formatSessionTime(s.updatedAt) }}</time>
              <span v-if="s.isPinned" class="pin-badge" title="已置顶">📌</span>
            </button>
            <button
              class="more-btn"
              @click="openMenu(s.id, $event)"
              title="更多选项"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- 侧边栏菜单 -->
      <div
        v-if="activeMenuId"
        class="sidebar-context-menu"
        :style="{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
        }"
        @click.stop
      >
        <button @click="openRenameModal">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M3 17l4-1 9-9-3-3-9 9-1 4zM13 4l3 3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          重命名
        </button>
        <button @click="shareSession">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M13 11l-6-3M13 9l-6 3M5 8a2 2 0 100-4 2 2 0 000 4zM15 12a2 2 0 100-4 2 2 0 000 4zM15 16a2 2 0 100-4 2 2 0 000 4z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          分享链接
        </button>
        <button @click="pinSession">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M12 2l-1.5 1.5L9 2V1h3v1zM8 4.5L6.5 6l1.5 1.5V4.5zM12 4.5L13.5 6 12 7.5V4.5zM10 8v7M7 15h6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{
            sessions.find((s) => s.id === activeMenuId)?.isPinned
              ? "取消置顶"
              : "置顶对话"
          }}
        </button>
        <button class="delete" @click="deleteSession">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5h10v11a1 1 0 01-1 1H6a1 1 0 01-1-1V5zM3 5h14M8 5V3a1 1 0 011-1h2a1 1 0 011 1v2M8 9v6M12 9v6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          删除对话
        </button>
      </div>

      <div class="sidebar__foot">
        <RouterLink to="/" class="home-btn" @click="sidebarOpen = false">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4l-6 6 6 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="home-btn__text">返回首页</span>
        </RouterLink>
        <p class="sidebar__hint">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z"
              stroke="currentColor"
              stroke-width="1.2"
            />
          </svg>
          <span class="sidebar__hint-text">智课 Agent · 教学智能助手 v1.0</span>
        </p>
      </div>
      <button
        class="sidebar-toggle"
        @click="isSidebarCollapsed = !isSidebarCollapsed"
        title="收起/展开侧边栏"
      >
        <svg
          class="sidebar-toggle__icon"
          viewBox="0 0 8 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.5 1L1.5 6L6.5 11"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </aside>

    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <main class="chat-main">
      <header class="chat-main__mobile-bar">
        <button
          class="icon-btn"
          aria-label="打开侧边栏"
          @click="sidebarOpen = true"
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <span class="chat-main__mobile-title">智课 AI 助手</span>
      </header>

      <div class="chat-panel">
        <!-- 欢迎态 -->
        <div v-if="!hasMessages && !isLoading" class="welcome">
          <div class="welcome__icon float-icon">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="url(#aiGrad)" />
              <path
                d="M20 38L28 22h4l8 16h-4l-1.6-3.2H25.6L24 38h-4zm6.4-6.4h7.2L32 24.8l-5.6 6.8z"
                fill="white"
              />
              <path d="M42 22h4v16h-4V22z" fill="white" opacity="0.75" />
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop stop-color="#0090ff" />
                  <stop offset="1" stop-color="#0057d9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="welcome__title">智课 AI 助手</h1>
          <p class="welcome__desc">
            帮助您梳理教学思路、生成课件大纲、解析教案资料，陪伴您完成从意图理解到课件共创的全流程
          </p>

          <p class="welcome__label">常见问题</p>
          <div class="suggestions">
            <button
              v-for="(item, i) in suggestions"
              :key="i"
              class="suggestion-card"
              :style="{ '--i': i }"
              @click="useSuggestion(item.text)"
            >
              <span class="suggestion-card__icon">{{ item.icon }}</span>
              <span>{{ item.text }}</span>
            </button>
          </div>
        </div>

        <!-- 对话态 -->
        <div v-else ref="messagesEl" class="messages">
          <div
            v-for="(msg, index) in activeSession?.messages"
            :key="msg.id"
            class="message"
            :class="`message--${msg.role}`"
          >
            <div class="message__avatar">
              {{ msg.role === "assistant" ? "AI" : "师" }}
            </div>
            <div class="message__content">
              <div class="message__bubble">
                <!-- AI消息使用打字机效果，但只在最新消息上启用 -->
                <p
                  v-if="
                    msg.role === 'assistant' &&
                    index === activeSession.messages.length - 1 &&
                    !typedMessageIds.has(msg.id)
                  "
                >
                  <TypewriterText
                    :key="'typewriter-' + msg.id"
                    :text="msg.content"
                    :speed="30"
                    @complete="onTypeComplete(msg.id)"
                    @typing="scrollToBottom"
                  />
                </p>
                <p v-else>{{ msg.content }}</p>
              </div>
              <button
                class="message__copy-btn"
                @click="copyMessage(msg.content)"
                title="复制内容"
              >
                <svg viewBox="0 0 16 16" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    rx="1"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <path
                    d="M5 3V2a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-1"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                </svg>
                <span>复制</span>
              </button>
            </div>
          </div>

          <div v-if="isLoading" class="message message--assistant">
            <div class="message__avatar">AI</div>
            <div class="message__bubble message__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="input-area">
          <div class="input-wrap">
            <input
              v-model="inputText"
              type="text"
              placeholder="描述您的教学目标，或直接输入问题..."
              :disabled="isLoading"
              @keydown="onKeydown"
            />
            <input
              ref="fileInput"
              type="file"
              hidden
              @change="handleFileSelect"
            />
            <button
              class="feature-btn"
              :class="{ 'feature-btn--active': isSmartSearchEnabled }"
              aria-label="智能搜索"
              @click="isSmartSearchEnabled = !isSmartSearchEnabled"
              title="智能搜索"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <circle
                  cx="9"
                  cy="9"
                  r="6"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M14 14l4 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <span>智能搜索</span>
            </button>
            <button
              class="feature-btn"
              :class="{ 'feature-btn--active': isDeepThinkingEnabled }"
              aria-label="深度思考"
              @click="isDeepThinkingEnabled = !isDeepThinkingEnabled"
              title="深度思考"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2v4M10 14v4M2 10h4M14 10h4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="3"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
              <span>深度思考</span>
            </button>
            <button
              class="icon-btn upload-btn"
              aria-label="上传文件"
              @click="triggerFileUpload"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4v12M4 10h12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <button
              class="send-btn"
              :disabled="!inputText.trim() || isLoading"
              aria-label="发送"
              @click="handleSend()"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 10l12-6-2 6 2 6-12-6z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <p class="input-hint">
            <svg viewBox="0 0 16 16" fill="none">
              <rect
                x="3"
                y="7"
                width="10"
                height="7"
                rx="1"
                stroke="currentColor"
                stroke-width="1.2"
              />
              <path
                d="M5 7V5a3 3 0 0 1 6 0v2"
                stroke="currentColor"
                stroke-width="1.2"
              />
            </svg>
            对话内容仅保存在本地浏览器，接入通义 API 后可云端同步
          </p>
        </div>
      </div>
    </main>

    <!-- 重命名弹窗 -->
    <div v-if="renameModalOpen" class="modal-overlay" @click="cancelRename">
      <div class="modal" @click.stop>
        <h3 class="modal__title">重命名对话</h3>
        <input
          v-model="renameValue"
          type="text"
          class="modal__input"
          placeholder="请输入新标题"
          autofocus
          @keydown.enter="confirmRename"
        />
        <div class="modal__actions">
          <button
            class="modal__btn modal__btn--secondary"
            @click="cancelRename"
          >
            取消
          </button>
          <button class="modal__btn modal__btn--primary" @click="confirmRename">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assistant-page {
  display: flex;
  height: 100vh;
  background: transparent;
  overflow: hidden;
  transition: width 0.3s var(--ease-out);
}

.sidebar-collapsed .sidebar {
  width: 80px;
  overflow: visible;
}

.sidebar-collapsed .sidebar__top {
  flex-direction: column;
  align-items: center;
}

.sidebar-collapsed .new-chat-btn__text,
.sidebar-collapsed .history-item__text,
.sidebar-collapsed .history-item time,
.sidebar-collapsed .home-btn__text,
.sidebar-collapsed .sidebar__hint-text,
.sidebar-collapsed .history-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar-collapsed .new-chat-btn {
  width: 48px;
  height: 48px;
  font-size: 0;
}

.sidebar-collapsed .home-btn {
  justify-content: center;
}

.sidebar-collapsed .sidebar__hint {
  justify-content: center;
}

.sidebar-collapsed .history-item {
  justify-content: center;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(50%, -50%);
  z-index: 10;
  width: 24px;
  height: 48px;
  background: #fff;
  border: 1px solid rgba(0, 87, 217, 0.1);
  border-radius: 99px;
  cursor: pointer;
  color: var(--ink-muted);
  box-shadow: 0 4px 12px rgba(0, 87, 217, 0.06);
  transition: all 0.3s var(--ease-out);
  opacity: 0.8;
}

.sidebar-collapsed .sidebar-toggle {
  right: 0;
  transform: translate(50%, -50%);
}

.sidebar-toggle:hover {
  opacity: 1;
  color: var(--ink);
  box-shadow: 0 6px 16px rgba(0, 87, 217, 0.1);
  transform: translate(50%, -50%) scale(1.05);
}

.sidebar-toggle__icon {
  width: 8px;
  height: 12px;
  transition: transform 0.3s var(--ease-out);
}

.sidebar-collapsed .sidebar-toggle__icon {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .sidebar-toggle {
    display: none;
  }
}

.sidebar__top {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  transition: all 0.3s var(--ease-out);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border);
  color: var(--ink-soft);
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
  text-decoration: none;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.icon-btn:hover {
  background: #fff;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--accent-deep);
  background: rgba(0, 144, 255, 0.12);
  border: 1px solid rgba(0, 144, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition:
    all 0.3s var(--ease-out),
    transform 0.25s var(--ease-spring),
    box-shadow 0.2s;
  overflow: hidden;
}

.new-chat-btn__text {
  transition: opacity 0.2s ease-out;
}

.new-chat-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.new-chat-btn:hover {
  background: rgba(0, 144, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 119, 230, 0.12);
}

.sidebar__history {
  flex: 1;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
  transition: opacity 0.3s var(--ease-out);
}

.history-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-muted);
  margin: 16px 0 8px 8px;
  transition: opacity 0.3s var(--ease-out);
}

.history-label:first-child {
  margin-top: 0;
}

.history-item-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 10px 12px;
  margin-bottom: 4px;
  font-size: 0.875rem;
  color: var(--ink-soft);
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s,
    color 0.2s;
  overflow: hidden;
}

.history-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.5;
}

.history-item__text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: opacity 0.3s var(--ease-out);
}

.history-item time {
  font-size: 0.7rem;
  color: var(--ink-muted);
  flex-shrink: 0;
  transition: opacity 0.3s var(--ease-out);
}

.pin-badge {
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-left: 2px;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
}

.history-item--active {
  background: rgba(0, 144, 255, 0.12);
  color: var(--accent-deep);
  font-weight: 500;
}

.history-item--active svg {
  opacity: 1;
  color: var(--accent);
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--ink-muted);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s,
    background 0.2s,
    color 0.2s;
}

.history-item-wrapper:hover .more-btn {
  opacity: 1;
}

.more-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--ink-soft);
}

.more-btn svg {
  width: 16px;
  height: 16px;
}

.sidebar-context-menu {
  position: fixed;
  z-index: 300;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(10, 15, 26, 0.12);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 140px;
}

.sidebar-context-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--ink-soft);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  text-align: left;
}

.sidebar-context-menu button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.sidebar-context-menu button:hover {
  background: rgba(0, 119, 230, 0.08);
  color: var(--accent-deep);
}

.sidebar-context-menu button.delete {
  color: #e53935;
}

.sidebar-context-menu button.delete:hover {
  background: rgba(229, 57, 53, 0.08);
  color: #c62828;
}

.sidebar__foot {
  padding-top: 16px;
  border-top: 1px solid var(--border);
  transition: opacity 0.3s var(--ease-out);
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent-deep);
  background: rgba(0, 144, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s var(--ease-out);
  overflow: hidden;
}

.home-btn__text {
  transition: opacity 0.2s ease-out;
}

.home-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.home-btn:hover {
  background: rgba(0, 144, 255, 0.16);
}

.sidebar__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--ink-muted);
  transition: all 0.3s var(--ease-out);
  overflow: hidden;
}

.sidebar__hint-text {
  white-space: nowrap;
  transition: opacity 0.2s ease-out;
}

.sidebar__hint svg {
  width: 14px;
  height: 14px;
  opacity: 0.6;
  flex-shrink: 0;
}

/* Main chat */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  min-width: 0;
  transition: all 0.3s var(--ease-out);
}

.chat-main__mobile-bar {
  display: none;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.chat-main__mobile-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px;
  box-shadow:
    0 1px 2px rgba(10, 15, 26, 0.04),
    0 16px 48px rgba(0, 87, 217, 0.08);
  overflow: hidden;
  min-height: 0;
  position: relative;
}

/* Welcome */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  text-align: center;
  overflow-y: auto;
}

.welcome__icon {
  margin-bottom: 24px;
}

.welcome__icon svg {
  width: 72px;
  height: 72px;
  filter: drop-shadow(0 8px 24px rgba(0, 119, 230, 0.25));
}

.float-icon {
  animation: float-icon 5s ease-in-out infinite;
}

@keyframes float-icon {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.welcome__title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 12px;
}

.welcome__desc {
  max-width: 480px;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--ink-soft);
  margin-bottom: 36px;
}

.welcome__label {
  align-self: flex-start;
  width: 100%;
  max-width: 640px;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink-muted);
  margin-bottom: 14px;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 640px;
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--ink-soft);
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition:
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.25s var(--ease-spring);
  animation: fade-up 0.6s var(--ease-out) backwards;
  animation-delay: calc(var(--i) * 0.08s + 0.1s);
}

.suggestion-card__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  line-height: 1;
}

.suggestion-card:hover {
  border-color: rgba(0, 119, 230, 0.3);
  box-shadow: 0 8px 28px rgba(0, 87, 217, 0.1);
  transform: translateY(-3px);
  color: var(--ink);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Messages */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
  animation: msg-in 0.35s var(--ease-out);
}

.message--user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message--assistant {
  align-self: flex-start;
}

.message__avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.message--assistant .message__avatar {
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  color: #fff;
}

.message--user .message__avatar {
  background: rgba(10, 15, 26, 0.08);
  color: var(--ink-soft);
}

.message__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: calc(100% - 48px);
}

.message__copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 0.75rem;
  color: var(--ink-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;
  align-self: flex-start;
}

.message--user .message__copy-btn {
  align-self: flex-end;
}

.message__copy-btn svg {
  width: 14px;
  height: 14px;
}

.message:hover .message__copy-btn {
  opacity: 1;
  transform: translateY(0);
}

.message__copy-btn:hover {
  background: rgba(0, 119, 230, 0.08);
  color: var(--accent);
  border-color: rgba(0, 119, 230, 0.2);
}

.message__bubble {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 0.9375rem;
  line-height: 1.65;
}

.message--assistant .message__bubble {
  background: linear-gradient(135deg, #0077e6 0%, #0057d9 100%);
  color: #fff;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 119, 230, 0.2);
}

.message--user .message__bubble {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  color: #4a4a4a;
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
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
  background: rgba(0, 119, 230, 0.4);
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

/* Input */
.input-area {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border);
  background: rgba(248, 250, 252, 0.8);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 20px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 999px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-wrap:focus-within {
  border-color: rgba(0, 119, 230, 0.35);
  box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.08);
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  padding: 10px 0;
}

.input-wrap input:disabled {
  opacity: 0.6;
}

.upload-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--ink-muted);
  flex-shrink: 0;
}

.upload-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--ink-soft);
}

/* 功能按钮样式 */
.feature-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.feature-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.feature-btn:hover {
  background: rgba(0, 119, 230, 0.06);
  border-color: rgba(0, 119, 230, 0.3);
  color: var(--accent);
}

.feature-btn--active {
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 119, 230, 0.3);
}

.feature-btn--active:hover {
  background: linear-gradient(135deg, var(--accent-deep), var(--accent));
  color: #fff;
  box-shadow: 0 6px 16px rgba(0, 119, 230, 0.4);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    transform 0.25s var(--ease-spring),
    opacity 0.2s,
    background 0.2s;
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.06);
  background: var(--accent-deep);
}

.send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.input-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.input-hint svg {
  width: 13px;
  height: 13px;
  opacity: 0.5;
}

.sidebar-overlay {
  display: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(10, 15, 26, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 16px 48px rgba(10, 15, 26, 0.15);
}

.modal__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 16px;
}

.modal__input {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9375rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
  margin-bottom: 20px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.modal__input:focus {
  border-color: rgba(0, 119, 230, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 119, 230, 0.08);
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal__btn {
  padding: 8px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal__btn--secondary {
  background: rgba(10, 15, 26, 0.06);
  color: var(--ink-soft);
}

.modal__btn--secondary:hover {
  background: rgba(10, 15, 26, 0.1);
}

.modal__btn--primary {
  background: var(--accent);
  color: #fff;
}

.modal__btn--primary:hover {
  background: var(--accent-deep);
}

/* Responsive */
@media (max-width: 768px) {
  .assistant-page {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s var(--ease-out);
    box-shadow: 4px 0 24px rgba(10, 15, 26, 0.1);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 199;
    background: rgba(10, 15, 26, 0.3);
    backdrop-filter: blur(4px);
  }

  .chat-main {
    padding: 12px;
    height: 100vh;
  }

  .chat-main__mobile-bar {
    display: flex;
  }

  .chat-panel {
    border-radius: 16px;
  }

  .suggestions {
    grid-template-columns: 1fr;
  }

  .messages {
    padding: 20px 16px;
  }

  .message {
    max-width: 92%;
  }

  .more-btn {
    opacity: 1;
  }

  .sidebar-context-menu {
    left: auto !important;
    right: 16px;
  }
}
</style>
