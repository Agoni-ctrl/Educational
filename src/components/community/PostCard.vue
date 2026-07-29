<script setup>
import { ref, computed } from "vue";
import { useCommunity, formatTime } from "../../composables/useCommunity.js";

const props = defineProps({
  post: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
});

const emit = defineEmits(["toggle-expand", "share", "action"]);

const {
  isLiked,
  isFavorite,
  isCommentLiked,
  toggleLike,
  toggleFavorite,
  toggleCommentLike,
  addComment,
} = useCommunity();

const commentText = ref("");
const likePop = ref(false);
const favPop = ref(false);
const sharePop = ref(false);

const liked = computed(() => isLiked(props.post.id));
const favorited = computed(() => isFavorite(props.post.id));
const media = computed(() => props.post.media || {});
const visualShots = computed(() => media.value.shots || []);
const visualChips = computed(() => media.value.chips || []);

// 作者头像颜色 - 基于名字 hash 分配固定色
const avatarColors = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #fccb90, #d57eeb)",
  "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
];
const avatarColor = computed(() => {
  const idx =
    [...props.post.author].reduce((s, c) => s + c.charCodeAt(0), 0) %
    avatarColors.length;
  return avatarColors[idx];
});
const visualScene = computed(() => media.value.scene || "discussion");
const visualStyle = computed(() => {
  const palette = media.value.palette || ["#edf5ff", "#dcecff", "#acc8f0"];
  return {
    "--cover-1": palette[0],
    "--cover-2": palette[1],
    "--cover-3": palette[2],
  };
});

function handleLike() {
  toggleLike(props.post.id);
  likePop.value = true;
  emit("action", "like");
  setTimeout(() => {
    likePop.value = false;
  }, 400);
}

function handleFavorite() {
  toggleFavorite(props.post.id);
  favPop.value = true;
  emit("action", "favorite");
  setTimeout(() => {
    favPop.value = false;
  }, 400);
}

function handleShare() {
  sharePop.value = true;
  emit("share", props.post);
  setTimeout(() => {
    sharePop.value = false;
  }, 600);
}

function submitComment() {
  if (!commentText.value.trim()) return;
  addComment(props.post.id, commentText.value);
  commentText.value = "";
  emit("action", "comment");
}

function handleCommentLike(commentId) {
  toggleCommentLike(commentId);
}

// 评论作者头像颜色
function commentAvatarColor(author) {
  const colors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
  ];
  const idx =
    [...(author || "匿名")].reduce((s, c) => s + c.charCodeAt(0), 0) %
    colors.length;
  return colors[idx];
}
</script>

<template>
  <article class="post-card" :class="{ 'post-card--expanded': expanded }">
    <div class="post-card__body">
      <!-- 头部：作者 + 标签 -->
      <div class="post-card__head">
        <div class="post-card__head-left">
          <span class="avatar" :style="{ background: avatarColor }">{{
            post.author.charAt(0)
          }}</span>
          <div class="post-card__author-meta">
            <strong>{{ post.author }}</strong>
            <span class="post-card__dot">·</span>
            <time class="post-card__time">{{
              formatTime(post.createdAt)
            }}</time>
          </div>
        </div>
        <span class="post-card__tag" :data-tag="post.tag">{{ post.tag }}</span>
      </div>

      <!-- 标题 -->
      <h3 class="post-card__title" @click="emit('toggle-expand')">
        {{ post.title }}
      </h3>

      <!-- 内容 -->
      <p class="post-card__content">{{ post.content }}</p>

      <!-- 统计条 -->
      <div v-if="visualShots.length" class="post-card__meta-strip">
        <span
          v-for="shot in visualShots"
          :key="`${post.id}-${shot.label}-${shot.value}`"
          class="meta-pill"
        >
          <small>{{ shot.label }}</small>
          <strong>{{ shot.value }}</strong>
        </span>
      </div>

      <!-- 话题标签 -->
      <div v-if="visualChips.length" class="post-card__chips">
        <span
          v-for="chip in visualChips"
          :key="`${post.id}-${chip}`"
          class="post-card__chip"
        >
          {{ chip }}
        </span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="post-card__actions">
      <button
        class="action-btn"
        :class="{ 'action-btn--liked': liked, 'action-btn--pop': likePop }"
        @click="handleLike"
      >
        <svg
          viewBox="0 0 22 22"
          fill="none"
          class="action-icon action-icon--heart"
        >
          <path
            d="M11 19s-7-4.5-7-9A4 4 0 0 1 11 7a4 4 0 0 1 7-3c2 1.5 3 4 0 9s-7 6-7 6z"
            :fill="liked ? '#ff4d6a' : 'none'"
            :stroke="liked ? '#ff4d6a' : '#94a3b8'"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <span class="action-num">{{ post.likes }}</span>
      </button>

      <button
        class="action-btn"
        :class="{ 'action-btn--favd': favorited, 'action-btn--pop': favPop }"
        @click="handleFavorite"
      >
        <svg
          viewBox="0 0 22 22"
          fill="none"
          class="action-icon action-icon--star"
        >
          <path
            d="M11 2l2.5 5.2L19 8l-4 3.8L16 19l-5-3.2L6 19l1-7.2L3 8l5.5-.8L11 2z"
            :fill="favorited ? '#fbbf24' : 'none'"
            :stroke="favorited ? '#fbbf24' : '#94a3b8'"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <span class="action-num">{{ favorited ? "已收藏" : "收藏" }}</span>
      </button>

      <button class="action-btn" @click="emit('toggle-expand')">
        <svg
          viewBox="0 0 22 22"
          fill="none"
          class="action-icon action-icon--comment"
        >
          <path
            d="M5 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
            stroke="#94a3b8"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <span class="action-num">{{ post.comments.length }} 评论</span>
      </button>

      <button
        class="action-btn"
        :class="{ 'action-btn--pop': sharePop }"
        @click="handleShare"
      >
        <svg
          viewBox="0 0 22 22"
          fill="none"
          class="action-icon action-icon--share"
        >
          <circle cx="6" cy="11" r="2.5" stroke="#94a3b8" stroke-width="1.5" />
          <circle cx="16" cy="5" r="2.5" stroke="#94a3b8" stroke-width="1.5" />
          <circle cx="16" cy="17" r="2.5" stroke="#94a3b8" stroke-width="1.5" />
          <line
            x1="8.2"
            y1="9.8"
            x2="13.8"
            y2="6.2"
            stroke="#94a3b8"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="8.2"
            y1="12.2"
            x2="13.8"
            y2="15.8"
            stroke="#94a3b8"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <span class="action-num">分享</span>
      </button>
    </div>

    <Transition name="comments">
      <div v-if="expanded" class="post-card__comments">
        <div class="post-card__comment-list">
          <div
            v-for="(c, index) in post.comments"
            :key="c.id || index"
            class="post-card__comment-item"
          >
            <span
              class="avatar avatar--sm"
              :style="{ background: commentAvatarColor(c.author) }"
              >{{ (c.author || "U").charAt(0) }}</span
            >
            <div class="post-card__comment-content">
              <strong>{{ c.author || "匿名" }}</strong>
              <p>{{ c.text }}</p>
            </div>
            <button
              class="comment-like"
              :class="{ liked: isCommentLiked(c.id) }"
              @click="handleCommentLike(c.id)"
            >
              <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                <path
                  d="M10 17s-6-4.35-6-8.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 6 2.5C16 12.65 10 17 10 17z"
                  :fill="isCommentLiked(c.id) ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
              <span v-if="c.likes">{{ c.likes }}</span>
            </button>
          </div>
        </div>
        <div class="post-card__comment-form">
          <input
            v-model="commentText"
            type="text"
            placeholder="写下你的评论…"
            @keyup.enter="submitComment"
          />
          <button :disabled="!commentText.trim()" @click="submitComment">
            发送
          </button>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.post-card {
  position: relative;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(18px);
  overflow: hidden;
  transition:
    transform 0.28s var(--ease-out),
    box-shadow 0.28s var(--ease-out),
    border-color 0.28s var(--ease-out);
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.post-card--expanded {
  border-color: rgba(72, 135, 214, 0.44);
}

/* ===== 主体：纯文字讨论结构 ===== */
.post-card__body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 头部：作者 + 标签 */
.post-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-card__head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-card__author-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
}

.post-card__author-meta strong {
  color: #1e293b;
  font-weight: 700;
}

.post-card__dot {
  color: #cbd5e1;
  font-weight: 600;
}

.post-card__time {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}

/* 标签 - 渐变 */
.post-card__tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  border: none;
  color: #7C3AED;
  background: rgba(124, 58, 237, 0.08);
  flex-shrink: 0;
}

.post-card__tag[data-tag="教学讨论"] {
  background: linear-gradient(135deg, #0072ff, #4facfe);
}
.post-card__tag[data-tag="课件结构"] {
  background: linear-gradient(135deg, #00c2d4, #22d3ee);
}
.post-card__tag[data-tag="互动设计"] {
  background: linear-gradient(135deg, #18a06d, #34d399);
}
.post-card__tag[data-tag="多模态参考"] {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.post-card__tag[data-tag="AI 提示词"] {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}
.post-card__tag[data-tag="提问"] {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}
.post-card__tag[data-tag="先猜想"] {
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
}
.post-card__tag[data-tag="演示"] {
  background: linear-gradient(135deg, #fd79a8, #e84393);
}
.post-card__tag[data-tag="可交互"] {
  background: linear-gradient(135deg, #00b894, #00cec9);
}
.post-card__tag[data-tag="反馈"] {
  background: linear-gradient(135deg, #e17055, #d63031);
}
.post-card__tag[data-tag="即点评"] {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
}
.post-card__tag[data-tag="课堂实录"] {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

/* 标题 */
.post-card__title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  cursor: pointer;
  color: #0c1e3b;
  transition: color 0.2s ease;
}

.post-card__title:hover {
  color: #0072ff;
}

/* 内容 - 知乎风格折叠 */
.post-card__content {
  margin-bottom: 10px;
  font-size: 0.88rem;
  line-height: 1.75;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card--expanded .post-card__content {
  -webkit-line-clamp: unset;
}

/* 统计 pill */
.post-card__meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 10px;
  background: rgba(238, 245, 255, 0.92);
  border: 1px solid rgba(171, 194, 225, 0.3);
}

.meta-pill small,
.meta-pill strong {
  display: block;
}

.meta-pill small {
  font-size: 0.65rem;
  color: #7590b0;
}

.meta-pill strong {
  font-size: 0.75rem;
  color: #1d3658;
}

/* 话题标签 */
.post-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.post-card__chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(245, 248, 255, 0.96);
  border: 1px solid rgba(171, 194, 225, 0.2);
  font-size: 0.7rem;
  font-weight: 600;
  color: #5577aa;
  transition: all 0.2s ease;
}

.post-card__chip:hover {
  background: rgba(0, 114, 255, 0.08);
  border-color: rgba(0, 114, 255, 0.25);
  color: #0072ff;
}

/* ===== 操作栏 ===== */
.post-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid rgba(171, 194, 225, 0.18);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;
}

.action-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.action-num {
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.action-btn:hover {
  background: rgba(0, 114, 255, 0.07);
  color: #475569;
}

/* 点赞 - 爱心红 */
.action-btn--liked {
  color: #ff4d6a;
  background: rgba(255, 77, 106, 0.08);
}

.action-btn--liked:hover {
  color: #e03a54;
  background: rgba(255, 77, 106, 0.13);
}

/* 收藏 - 星星黄 */
.action-btn--favd {
  color: #f59e0b;
  background: rgba(251, 191, 36, 0.12);
}

.action-btn--favd:hover {
  color: #d97706;
  background: rgba(251, 191, 36, 0.18);
}

.action-btn--pop {
  animation: action-pop 0.4s var(--ease-spring);
}

@keyframes action-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

/* ===== 评论区 ===== */
.post-card__comments {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(171, 194, 225, 0.18);
}

.post-card__comment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}

.post-card__comment-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.post-card__comment-content {
  flex: 1;
  min-width: 0;
}

.post-card__comment-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.8rem;
  color: #1e293b;
}

.post-card__comment-content p {
  font-size: 0.82rem;
  line-height: 1.6;
  color: #64748b;
}

.comment-like {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.18s;
  font-size: 0.72rem;
}

.comment-like:hover {
  color: #0072ff;
  background: rgba(0, 114, 255, 0.07);
}

.comment-like.liked {
  color: #0072ff;
}

.post-card__comment-form {
  display: flex;
  gap: 8px;
}

.post-card__comment-form input {
  flex: 1;
  padding: 9px 14px;
  border: 1.5px solid rgba(171, 194, 225, 0.28);
  border-radius: 12px;
  font-size: 0.82rem;
  outline: none;
  background: rgba(245, 248, 255, 0.5);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.post-card__comment-form input:focus {
  border-color: #0072ff;
  box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.08);
  background: #fff;
}

.post-card__comment-form button {
  padding: 9px 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #0072ff, #4facfe);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.post-card__comment-form button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.post-card__comment-form button:not(:disabled):hover {
  opacity: 0.85;
}

/* ===== Avatar ===== */
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.avatar--sm {
  width: 26px;
  height: 26px;
  font-size: 0.7rem;
  border-radius: 8px;
}

/* ===== 评论过渡动画 ===== */
.comments-enter-active {
  animation: comments-in 0.28s var(--ease-out);
}

.comments-leave-active {
  animation: comments-in 0.2s ease-in reverse;
}

@keyframes comments-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .post-card {
    padding: 16px 18px;
  }

  .post-card__title {
    font-size: 1.05rem;
  }

  .post-card__content {
    font-size: 0.85rem;
  }

  .post-card__head {
    flex-wrap: wrap;
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .post-card {
    padding: 14px 16px;
  }

  .action-btn {
    font-size: 0.72rem;
    padding: 6px 10px;
  }
}
</style>
