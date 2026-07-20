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
</script>

<template>
  <article class="post-card" :class="{ 'post-card--expanded': expanded }">
    <span class="post-card__glow" aria-hidden="true" />

    <div class="post-card__body">
      <button
        class="post-card__visual"
        :style="visualStyle"
        :data-scene="visualScene"
        :aria-label="`查看 ${post.title}`"
        @click="emit('toggle-expand')"
      >
        <span class="post-card__visual-badge">{{
          media.badge || "真实案例"
        }}</span>

        <div class="post-card__visual-frame">
          <div class="post-card__scene">
            <template v-if="visualScene === 'spotlight'">
              <div class="scene-crowd">
                <span class="scene-crowd__light" />
                <span class="scene-crowd__hand scene-crowd__hand--1" />
                <span class="scene-crowd__hand scene-crowd__hand--2" />
                <span class="scene-crowd__hand scene-crowd__hand--3" />
                <span class="scene-crowd__head scene-crowd__head--1" />
                <span class="scene-crowd__head scene-crowd__head--2" />
                <span class="scene-crowd__head scene-crowd__head--3" />
              </div>
            </template>

            <template v-else-if="visualScene === 'interface'">
              <div class="scene-interface">
                <div class="scene-interface__app" />
                <div class="scene-interface__label" />
                <div class="scene-interface__bar scene-interface__bar--1" />
                <div class="scene-interface__bar scene-interface__bar--2" />
                <div class="scene-interface__bar scene-interface__bar--3" />
              </div>
            </template>

            <template v-else-if="visualScene === 'document'">
              <div class="scene-document">
                <span
                  class="scene-document__sheet scene-document__sheet--back"
                />
                <span
                  class="scene-document__sheet scene-document__sheet--mid"
                />
                <span
                  class="scene-document__sheet scene-document__sheet--front"
                />
                <span class="scene-document__photo" />
                <span class="scene-document__line scene-document__line--1" />
                <span class="scene-document__line scene-document__line--2" />
              </div>
            </template>

            <template v-else-if="visualScene === 'prompt'">
              <div class="scene-prompt">
                <span class="scene-prompt__bubble scene-prompt__bubble--main" />
                <span class="scene-prompt__bubble scene-prompt__bubble--sub" />
                <span class="scene-prompt__chip scene-prompt__chip--1" />
                <span class="scene-prompt__chip scene-prompt__chip--2" />
                <span class="scene-prompt__cursor" />
              </div>
            </template>

            <template v-else>
              <div class="scene-discussion">
                <span class="scene-discussion__board" />
                <span
                  class="scene-discussion__card scene-discussion__card--1"
                />
                <span
                  class="scene-discussion__card scene-discussion__card--2"
                />
                <span
                  class="scene-discussion__avatar scene-discussion__avatar--1"
                />
                <span
                  class="scene-discussion__avatar scene-discussion__avatar--2"
                />
                <span
                  class="scene-discussion__line scene-discussion__line--1"
                />
                <span
                  class="scene-discussion__line scene-discussion__line--2"
                />
              </div>
            </template>
          </div>

          <div class="post-card__visual-meta">
            <span class="post-card__visual-kicker">{{
              media.kicker || "正在热议"
            }}</span>
            <strong>{{ media.headline || post.title }}</strong>
          </div>
        </div>
      </button>

      <div class="post-card__main">
        <div class="post-card__head">
          <span class="post-card__tag" :data-tag="post.tag">{{
            post.tag
          }}</span>
          <time class="post-card__time">{{ formatTime(post.createdAt) }}</time>
        </div>

        <h3 class="post-card__title" @click="emit('toggle-expand')">
          {{ post.title }}
        </h3>
        <p class="post-card__content">{{ post.content }}</p>

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

        <div class="post-card__author">
          <span class="avatar">{{ post.author.charAt(0) }}</span>
          <span>
            <strong>{{ post.author }}</strong>
            <small>正在参与知启灵枢 教研共创</small>
          </span>
        </div>

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
    </div>

    <div class="post-card__actions">
      <button
        class="action-btn"
        :class="{ 'action-btn--active': liked, 'action-btn--pop': likePop }"
        @click="handleLike"
      >
        <svg viewBox="0 0 20 20" fill="none">
          <path
            d="M10 17s-6-4.35-6-8.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 6 2.5C16 12.65 10 17 10 17z"
            :fill="liked ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </svg>
        <span>{{ post.likes }}</span>
      </button>

      <button
        class="action-btn"
        :class="{ 'action-btn--active': favorited, 'action-btn--pop': favPop }"
        @click="handleFavorite"
      >
        <svg viewBox="0 0 20 20" fill="none">
          <path
            d="M5 3h10a1 1 0 0 1 1 1v14l-6-3.5L4 18V4a1 1 0 0 1 1-1z"
            :fill="favorited ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </svg>
        <span>{{ favorited ? "已收藏" : "收藏" }}</span>
      </button>

      <button class="action-btn" @click="emit('toggle-expand')">
        <svg viewBox="0 0 20 20" fill="none">
          <path
            d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ post.comments.length }} 评论</span>
      </button>

      <button
        class="action-btn"
        :class="{ 'action-btn--pop': sharePop }"
        @click="handleShare"
      >
        <svg viewBox="0 0 20 20" fill="none">
          <path
            d="M14 4l4 4-4 4M18 8H8a4 4 0 0 0-4 4v1"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>分享</span>
      </button>
    </div>

    <Transition name="comments">
      <div v-if="expanded" class="post-card__comments">
        <div v-if="post.comments.length" class="comment-list">
          <div v-for="c in post.comments" :key="c.id" class="comment-item">
            <div class="comment-item__head">
              <span class="avatar avatar--sm">{{ c.author.charAt(0) }}</span>
              <strong>{{ c.author }}</strong>
              <time>{{ formatTime(c.createdAt) }}</time>
            </div>
            <p>{{ c.content }}</p>
            <button
              class="comment-like"
              :class="{ 'comment-like--active': isCommentLiked(c.id) }"
              @click="handleCommentLike(c.id)"
            >
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 14s-5-3.6-5-7A2.5 2.5 0 0 1 8 6a2.5 2.5 0 0 1 5 1c0 3.4-5 7-5 7z"
                  :fill="isCommentLiked(c.id) ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1.2"
                />
              </svg>
              {{ c.likes }}
            </button>
          </div>
        </div>
        <p v-else class="comment-empty">暂无评论，来发表第一个看法吧</p>

        <div class="comment-form">
          <input
            v-model="commentText"
            type="text"
            placeholder="写下你的经验或建议..."
            @keyup.enter="submitComment"
          />
          <button
            class="btn-send"
            :disabled="!commentText.trim()"
            @click="submitComment"
          >
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
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(167, 193, 225, 0.28);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.96),
      rgba(248, 251, 255, 0.92)
    ),
    radial-gradient(circle at 0% 0%, rgba(76, 150, 255, 0.06), transparent 32%);
  box-shadow:
    0 18px 48px rgba(64, 116, 184, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  overflow: hidden;
  transition:
    transform 0.35s var(--ease-out),
    box-shadow 0.35s var(--ease-out),
    border-color 0.35s var(--ease-out);
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: rgba(100, 154, 222, 0.42);
  box-shadow:
    0 24px 58px rgba(64, 116, 184, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.post-card--expanded {
  border-color: rgba(72, 135, 214, 0.48);
}

.post-card__glow {
  position: absolute;
  top: -86px;
  right: -62px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(117, 173, 255, 0.18),
    transparent 68%
  );
  pointer-events: none;
}

.post-card__body {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.post-card__visual {
  position: relative;
  padding: 10px;
  border: none;
  border-radius: 28px;
  background: linear-gradient(180deg, var(--cover-1), var(--cover-2));
  box-shadow:
    0 12px 32px rgba(65, 110, 168, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
  cursor: pointer;
  text-align: left;
}

.post-card__visual-badge {
  position: absolute;
  left: 18px;
  top: 16px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff5036, #ff2446);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: 0 10px 18px rgba(255, 80, 54, 0.24);
}

.post-card__visual-frame {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(177, 198, 224, 0.5);
}

.post-card__scene {
  position: relative;
  min-height: 184px;
  border-radius: 18px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(11, 18, 31, 0.02), rgba(11, 18, 31, 0.08)),
    linear-gradient(135deg, var(--cover-2), var(--cover-3));
}

.post-card__scene::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.25;
}

.post-card__visual-meta {
  display: grid;
  gap: 6px;
  padding: 4px 4px 2px;
}

.post-card__visual-kicker {
  font-size: 0.72rem;
  font-weight: 700;
  color: #5f7ea5;
}

.post-card__visual-meta strong {
  font-family: var(--font-display);
  font-size: 0.98rem;
  line-height: 1.3;
  color: #11284c;
}

.scene-crowd {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 50% -8%,
      rgba(255, 255, 255, 0.5),
      transparent 36%
    ),
    linear-gradient(180deg, #1a1f28 0%, #0e1116 72%, #050608 100%);
}

.scene-crowd__light {
  position: absolute;
  left: 50%;
  top: 18px;
  width: 126px;
  height: 126px;
  border-radius: 50%;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.28),
    transparent 72%
  );
}

.scene-crowd__hand,
.scene-crowd__head {
  position: absolute;
  display: block;
  background: rgba(255, 255, 255, 0.95);
}

.scene-crowd__head {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  bottom: 34px;
}

.scene-crowd__head--1 {
  left: 36px;
}
.scene-crowd__head--2 {
  left: 102px;
  width: 20px;
  height: 20px;
  bottom: 28px;
}
.scene-crowd__head--3 {
  right: 42px;
  width: 16px;
  height: 16px;
}

.scene-crowd__hand {
  bottom: 40px;
  width: 12px;
  border-radius: 999px;
  transform-origin: bottom center;
}

.scene-crowd__hand--1 {
  left: 58px;
  height: 74px;
  transform: rotate(-16deg);
}

.scene-crowd__hand--2 {
  left: 126px;
  height: 96px;
  transform: rotate(10deg);
}

.scene-crowd__hand--3 {
  right: 58px;
  height: 82px;
  transform: rotate(24deg);
}

.scene-interface {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f9fbff, #eef4ff 56%, #dde8f7);
}

.scene-interface__app {
  position: absolute;
  left: 22px;
  top: 38px;
  width: 70px;
  height: 70px;
  border-radius: 18px;
  background: linear-gradient(145deg, #42d84f, #25b93f);
  box-shadow: 0 14px 26px rgba(43, 146, 71, 0.2);
}

.scene-interface__app::before,
.scene-interface__app::after {
  content: "";
  position: absolute;
  background: #fff;
}

.scene-interface__app::before {
  left: 12px;
  top: 20px;
  width: 30px;
  height: 24px;
  border-radius: 6px;
}

.scene-interface__app::after {
  right: 12px;
  top: 24px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 16px solid #fff;
}

.scene-interface__label {
  position: absolute;
  left: 108px;
  top: 44px;
  width: 92px;
  height: 18px;
  border-radius: 999px;
  background: rgba(16, 48, 92, 0.16);
}

.scene-interface__bar {
  position: absolute;
  left: 108px;
  height: 10px;
  border-radius: 999px;
  background: rgba(16, 48, 92, 0.12);
}

.scene-interface__bar--1 {
  top: 76px;
  width: 84px;
}
.scene-interface__bar--2 {
  top: 98px;
  width: 70px;
}
.scene-interface__bar--3 {
  top: 120px;
  width: 58px;
}

.scene-document {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #edf3fb, #fdfefe);
}

.scene-document__sheet {
  position: absolute;
  display: block;
  width: 116px;
  height: 144px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 24px rgba(79, 115, 163, 0.14);
}

.scene-document__sheet--back {
  left: 30px;
  top: 24px;
  transform: rotate(-8deg);
}

.scene-document__sheet--mid {
  left: 76px;
  top: 20px;
  transform: rotate(4deg);
}

.scene-document__sheet--front {
  left: 56px;
  top: 36px;
}

.scene-document__photo {
  position: absolute;
  left: 74px;
  top: 56px;
  width: 80px;
  height: 56px;
  border-radius: 10px;
  background: linear-gradient(135deg, #93b8e6, #d7e8fb);
}

.scene-document__line {
  position: absolute;
  left: 74px;
  height: 8px;
  border-radius: 999px;
  background: rgba(16, 48, 92, 0.12);
}

.scene-document__line--1 {
  top: 122px;
  width: 64px;
}

.scene-document__line--2 {
  top: 138px;
  width: 48px;
}

.scene-prompt {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #edf2ff, #fbfcff);
}

.scene-prompt__bubble,
.scene-prompt__chip,
.scene-prompt__cursor {
  position: absolute;
  display: block;
}

.scene-prompt__bubble {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 24px rgba(88, 108, 160, 0.14);
}

.scene-prompt__bubble--main {
  left: 26px;
  top: 42px;
  width: 156px;
  height: 58px;
}

.scene-prompt__bubble--sub {
  right: 24px;
  top: 106px;
  width: 124px;
  height: 46px;
  background: linear-gradient(135deg, #4e81ff, #76a8ff);
}

.scene-prompt__chip {
  left: 42px;
  width: 72px;
  height: 10px;
  border-radius: 999px;
  background: rgba(16, 48, 92, 0.12);
}

.scene-prompt__chip--1 {
  top: 58px;
}
.scene-prompt__chip--2 {
  top: 78px;
  width: 96px;
}

.scene-prompt__cursor {
  right: 46px;
  top: 120px;
  width: 16px;
  height: 16px;
  border-right: 3px solid rgba(255, 255, 255, 0.96);
  border-bottom: 3px solid rgba(255, 255, 255, 0.96);
  transform: rotate(-45deg);
}

.scene-discussion {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f7fbff, #edf3fb);
}

.scene-discussion__board,
.scene-discussion__card,
.scene-discussion__avatar,
.scene-discussion__line {
  position: absolute;
  display: block;
}

.scene-discussion__board {
  left: 24px;
  top: 28px;
  width: 92px;
  height: 120px;
  border-radius: 18px;
  background: linear-gradient(180deg, #6fc4ff, #3980db);
  box-shadow: 0 16px 32px rgba(56, 115, 187, 0.18);
}

.scene-discussion__card {
  width: 72px;
  height: 92px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 24px rgba(91, 122, 174, 0.12);
}

.scene-discussion__card--1 {
  left: 98px;
  top: 36px;
  transform: rotate(8deg);
}

.scene-discussion__card--2 {
  left: 136px;
  top: 76px;
  width: 56px;
  height: 72px;
}

.scene-discussion__avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdcf94, #f08455);
}

.scene-discussion__avatar--1 {
  left: 42px;
  bottom: 22px;
}

.scene-discussion__avatar--2 {
  right: 30px;
  bottom: 28px;
  background: linear-gradient(135deg, #7399ff, #3f64d8);
}

.scene-discussion__line {
  height: 8px;
  border-radius: 999px;
  background: rgba(16, 48, 92, 0.12);
}

.scene-discussion__line--1 {
  left: 112px;
  top: 56px;
  width: 34px;
}

.scene-discussion__line--2 {
  left: 112px;
  top: 72px;
  width: 46px;
}

.post-card__main {
  min-width: 0;
}

.post-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.post-card__tag {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(64, 129, 215, 0.14);
  color: #2d66b8;
  font-size: 0.72rem;
  font-weight: 800;
  background: rgba(64, 129, 215, 0.08);
}

.post-card__tag[data-tag="教学讨论"] {
  background: rgba(64, 129, 215, 0.08);
  border-color: rgba(64, 129, 215, 0.14);
  color: #2d66b8;
}

.post-card__tag[data-tag="课件结构"] {
  background: rgba(0, 194, 212, 0.08);
  border-color: rgba(0, 194, 212, 0.14);
  color: #0e8c96;
}

.post-card__tag[data-tag="互动设计"] {
  background: rgba(24, 160, 109, 0.08);
  border-color: rgba(24, 160, 109, 0.14);
  color: #138a5e;
}

.post-card__tag[data-tag="多模态参考"] {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.14);
  color: #b87a0a;
}

.post-card__tag[data-tag="AI 提示词"] {
  background: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.14);
  color: #7c3aed;
}

.post-card__time {
  font-size: 0.8125rem;
  color: var(--ink-muted);
}

.post-card__title {
  font-family: var(--font-display);
  font-size: 1.26rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.025em;
  margin-bottom: 10px;
  cursor: pointer;
  color: #13294c;
  transition: color 0.2s ease;
}

.post-card__title:hover {
  color: var(--accent);
}

.post-card__content {
  margin-bottom: 16px;
  font-size: 0.95rem;
  line-height: 1.72;
  color: var(--ink-soft);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card--expanded .post-card__content {
  -webkit-line-clamp: unset;
}

.post-card__meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(238, 245, 255, 0.96);
  border: 1px solid rgba(171, 194, 225, 0.34);
}

.meta-pill small,
.meta-pill strong {
  display: block;
}

.meta-pill small {
  font-size: 0.68rem;
  color: #7590b0;
}

.meta-pill strong {
  font-size: 0.77rem;
  color: #1d3658;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 0.875rem;
  color: var(--ink-muted);
}

.post-card__author strong,
.post-card__author small {
  display: block;
}

.post-card__author strong {
  color: var(--ink-soft);
  font-size: 0.86rem;
}

.post-card__author small {
  margin-top: 1px;
  font-size: 0.72rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
}

.avatar--sm {
  width: 26px;
  height: 26px;
  font-size: 0.75rem;
}

.post-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-card__chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(171, 194, 225, 0.28);
  font-size: 0.76rem;
  font-weight: 700;
  color: #355e96;
}

.post-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 18px;
  margin-top: 18px;
  border-top: 1px solid rgba(171, 194, 225, 0.24);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s,
    transform 0.25s var(--ease-spring);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(171, 194, 225, 0.28);
}

.action-btn--active {
  color: var(--accent);
  background: rgba(0, 119, 230, 0.08);
  border-color: rgba(0, 119, 230, 0.14);
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

.post-card__comments {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  max-height: 320px;
  overflow-y: auto;
}

.comment-item {
  padding: 14px;
  border-radius: 16px;
  background: rgba(0, 119, 230, 0.05);
  border: 1px solid rgba(0, 119, 230, 0.06);
}

.comment-item__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-item__head strong {
  font-size: 0.875rem;
}

.comment-item__head time {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.comment-item p {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--ink-soft);
  margin-bottom: 8px;
}

.comment-like {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  color: var(--ink-muted);
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.comment-like svg {
  width: 14px;
  height: 14px;
}

.comment-like:hover,
.comment-like--active {
  color: var(--accent);
  background: rgba(0, 119, 230, 0.08);
}

.comment-empty {
  font-size: 0.875rem;
  color: var(--ink-muted);
  text-align: center;
  padding: 20px 0;
}

.comment-form {
  display: flex;
  gap: 10px;
}

.comment-form input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  outline: none;
  font-size: 0.875rem;
  background: #fff;
  transition: border-color 0.2s;
}

.comment-form input:focus {
  border-color: var(--accent);
}

.btn-send {
  padding: 12px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: var(--ink);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comments-enter-active,
.comments-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.comments-enter-from,
.comments-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .post-card {
    padding: 18px;
  }

  .post-card__body {
    grid-template-columns: 1fr;
  }

  .post-card__scene {
    min-height: 170px;
  }
}

@media (max-width: 480px) {
  .post-card__visual-badge {
    left: 14px;
    top: 14px;
  }

  .post-card__meta-strip,
  .post-card__actions {
    gap: 6px;
  }
}
</style>
