<script setup>
import { ref, computed, watch } from 'vue'
import { useCommunity, formatTime } from '../../composables/useCommunity.js'

const props = defineProps({
  post: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-expand', 'share', 'action'])

const {
  isLiked,
  isFavorite,
  isCommentLiked,
  toggleLike,
  toggleFavorite,
  toggleCommentLike,
  addComment,
} = useCommunity()

const commentText = ref('')
const likePop = ref(false)
const favPop = ref(false)
const sharePop = ref(false)

const liked = computed(() => isLiked(props.post.id))
const favorited = computed(() => isFavorite(props.post.id))

function handleLike() {
  toggleLike(props.post.id)
  likePop.value = true
  emit('action', 'like')
  setTimeout(() => { likePop.value = false }, 400)
}

function handleFavorite() {
  toggleFavorite(props.post.id)
  favPop.value = true
  emit('action', 'favorite')
  setTimeout(() => { favPop.value = false }, 400)
}

function handleShare() {
  sharePop.value = true
  emit('share', props.post)
  setTimeout(() => { sharePop.value = false }, 600)
}

function submitComment() {
  if (!commentText.value.trim()) return
  addComment(props.post.id, commentText.value)
  commentText.value = ''
  emit('action', 'comment')
}

function handleCommentLike(commentId) {
  toggleCommentLike(commentId)
}
</script>

<template>
  <article class="post-card" :class="{ 'post-card--expanded': expanded }">
    <div class="post-card__head">
      <span class="post-card__tag">{{ post.tag }}</span>
      <time class="post-card__time">{{ formatTime(post.createdAt) }}</time>
    </div>

    <h3 class="post-card__title" @click="emit('toggle-expand')">{{ post.title }}</h3>
    <p class="post-card__content">{{ post.content }}</p>

    <div class="post-card__author">
      <span class="avatar">{{ post.author.charAt(0) }}</span>
      <span>{{ post.author }}</span>
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
        <span>{{ favorited ? '已收藏' : '收藏' }}</span>
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

      <button class="action-btn" :class="{ 'action-btn--pop': sharePop }" @click="handleShare">
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
          <button class="btn-send" :disabled="!commentText.trim()" @click="submitComment">发送</button>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.post-card {
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  transition: box-shadow 0.35s var(--ease-out), transform 0.35s var(--ease-out);
}

.post-card:hover {
  box-shadow: 0 16px 48px rgba(10, 15, 26, 0.07);
}

.post-card--expanded {
  border-color: rgba(0, 119, 230, 0.25);
  box-shadow: 0 20px 56px rgba(0, 87, 217, 0.1);
}

.post-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.post-card__tag {
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(0, 119, 230, 0.08);
  border-radius: 999px;
}

.post-card__time {
  font-size: 0.8125rem;
  color: var(--ink-muted);
}

.post-card__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.2s;
}

.post-card__title:hover {
  color: var(--accent);
}

.post-card__content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--ink-soft);
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card--expanded .post-card__content {
  -webkit-line-clamp: unset;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--ink-muted);
  margin-bottom: 16px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
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

.post-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.25s var(--ease-spring);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  color: var(--ink);
  background: rgba(10, 15, 26, 0.04);
}

.action-btn--active {
  color: var(--accent);
  background: rgba(0, 119, 230, 0.08);
  border-color: rgba(0, 119, 230, 0.15);
}

.action-btn--pop {
  animation: action-pop 0.4s var(--ease-spring);
}

@keyframes action-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.12); }
  100% { transform: scale(1); }
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
  border-radius: var(--radius-sm);
  background: rgba(0, 119, 230, 0.04);
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
  transition: color 0.2s, background 0.2s;
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
  transition: opacity 0.2s, transform 0.2s;
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
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.comments-enter-from,
.comments-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
