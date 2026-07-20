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
              <div class="scene-svg-wrap">
                <svg viewBox="0 0 200 150" fill="none">
                  <!-- 大屏幕 -->
                  <rect
                    x="36"
                    y="14"
                    width="128"
                    height="78"
                    rx="8"
                    fill="#fff"
                    fill-opacity="0.2"
                    stroke="#fff"
                    stroke-opacity="0.3"
                    stroke-width="1.5"
                  />
                  <!-- 幻灯片标题条 -->
                  <rect
                    x="50"
                    y="28"
                    width="100"
                    height="8"
                    rx="4"
                    fill="#F59E0B"
                    fill-opacity="0.7"
                  />
                  <!-- 幻灯片内容条 -->
                  <rect
                    x="50"
                    y="44"
                    width="80"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.5"
                  />
                  <rect
                    x="50"
                    y="56"
                    width="90"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.4"
                  />
                  <rect
                    x="50"
                    y="68"
                    width="60"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <!-- PPT页码圆点 -->
                  <circle
                    cx="90"
                    cy="100"
                    r="3"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <circle
                    cx="102"
                    cy="100"
                    r="3"
                    fill="#F59E0B"
                    fill-opacity="0.8"
                  />
                  <circle
                    cx="114"
                    cy="100"
                    r="3"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <!-- 讲台 -->
                  <rect
                    x="74"
                    y="112"
                    width="52"
                    height="14"
                    rx="4"
                    fill="#fff"
                    fill-opacity="0.12"
                    stroke="#fff"
                    stroke-opacity="0.2"
                    stroke-width="1.2"
                  />
                  <!-- 教师人物 -->
                  <circle
                    cx="160"
                    cy="102"
                    r="9"
                    fill="#fff"
                    fill-opacity="0.6"
                  />
                  <rect
                    x="153"
                    y="112"
                    width="14"
                    height="24"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.35"
                  />
                  <!-- 教师手臂指向屏幕 -->
                  <line
                    x1="153"
                    y1="118"
                    x2="130"
                    y2="98"
                    stroke="#fff"
                    stroke-opacity="0.5"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <line
                    x1="160"
                    y1="118"
                    x2="168"
                    y2="132"
                    stroke="#fff"
                    stroke-opacity="0.25"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </template>

            <template v-else-if="visualScene === 'interface'">
              <div class="scene-svg-wrap">
                <svg viewBox="0 0 200 150" fill="none">
                  <!-- 教室黑板 -->
                  <rect
                    x="18"
                    y="14"
                    width="164"
                    height="96"
                    rx="8"
                    fill="#fff"
                    fill-opacity="0.08"
                    stroke="#fff"
                    stroke-opacity="0.12"
                    stroke-width="1.2"
                  />
                  <!-- 黑板上的文字 -->
                  <rect
                    x="60"
                    y="24"
                    width="80"
                    height="7"
                    rx="3.5"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="70"
                    y="36"
                    width="60"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.08"
                  />
                  <!-- 老师 - 左侧 -->
                  <circle
                    cx="48"
                    cy="70"
                    r="10"
                    fill="#fff"
                    fill-opacity="0.6"
                  />
                  <rect
                    x="40"
                    y="81"
                    width="16"
                    height="26"
                    rx="6"
                    fill="#fff"
                    fill-opacity="0.35"
                  />
                  <line
                    x1="42"
                    y1="87"
                    x2="30"
                    y2="78"
                    stroke="#fff"
                    stroke-opacity="0.4"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="54"
                    y1="87"
                    x2="66"
                    y2="74"
                    stroke="#fff"
                    stroke-opacity="0.4"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <!-- 学生1 - 举手 -->
                  <circle
                    cx="90"
                    cy="78"
                    r="8"
                    fill="#fff"
                    fill-opacity="0.5"
                  />
                  <rect
                    x="84"
                    y="87"
                    width="12"
                    height="20"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <line
                    x1="92"
                    y1="85"
                    x2="98"
                    y2="68"
                    stroke="#fff"
                    stroke-opacity="0.5"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="99"
                    cy="66"
                    r="4"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <!-- 学生2 - 举手 -->
                  <circle
                    cx="120"
                    cy="80"
                    r="8"
                    fill="#fff"
                    fill-opacity="0.5"
                  />
                  <rect
                    x="114"
                    y="89"
                    width="12"
                    height="20"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <line
                    x1="122"
                    y1="87"
                    x2="128"
                    y2="70"
                    stroke="#fff"
                    stroke-opacity="0.5"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="129"
                    cy="68"
                    r="4"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <!-- 学生3 - 举手 -->
                  <circle
                    cx="150"
                    cy="82"
                    r="8"
                    fill="#fff"
                    fill-opacity="0.45"
                  />
                  <rect
                    x="144"
                    y="91"
                    width="12"
                    height="20"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.25"
                  />
                  <line
                    x1="152"
                    y1="89"
                    x2="158"
                    y2="72"
                    stroke="#fff"
                    stroke-opacity="0.45"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="159"
                    cy="70"
                    r="4"
                    fill="#fff"
                    fill-opacity="0.25"
                  />
                  <!-- 地面线 -->
                  <line
                    x1="18"
                    y1="114"
                    x2="182"
                    y2="114"
                    stroke="#fff"
                    stroke-opacity="0.08"
                    stroke-width="1"
                    stroke-dasharray="3 4"
                  />
                </svg>
              </div>
            </template>

            <template v-else-if="visualScene === 'document'">
              <div class="scene-svg-wrap">
                <svg viewBox="0 0 200 150" fill="none">
                  <!-- 桌面 -->
                  <rect
                    x="14"
                    y="100"
                    width="172"
                    height="10"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.08"
                    stroke="#fff"
                    stroke-opacity="0.1"
                    stroke-width="1.2"
                  />
                  <!-- 笔记本电脑底座 -->
                  <rect
                    x="44"
                    y="86"
                    width="86"
                    height="16"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.12"
                    stroke="#fff"
                    stroke-opacity="0.15"
                    stroke-width="1.2"
                  />
                  <!-- 笔记本屏幕 -->
                  <rect
                    x="48"
                    y="28"
                    width="78"
                    height="58"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.18"
                    stroke="#fff"
                    stroke-opacity="0.22"
                    stroke-width="1.2"
                  />
                  <!-- 屏幕内容 - 文档标题 -->
                  <rect
                    x="60"
                    y="38"
                    width="54"
                    height="6"
                    rx="3"
                    fill="#3B82F6"
                    fill-opacity="0.5"
                  />
                  <rect
                    x="60"
                    y="50"
                    width="40"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.35"
                  />
                  <rect
                    x="60"
                    y="60"
                    width="48"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.25"
                  />
                  <rect
                    x="60"
                    y="70"
                    width="30"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.18"
                  />
                  <!-- 右侧散落文档 -->
                  <rect
                    x="140"
                    y="34"
                    width="40"
                    height="50"
                    rx="4"
                    fill="#fff"
                    fill-opacity="0.1"
                    stroke="#fff"
                    stroke-opacity="0.14"
                    stroke-width="1"
                    transform="rotate(5, 160, 59)"
                  />
                  <rect
                    x="146"
                    y="42"
                    width="28"
                    height="5"
                    rx="2.5"
                    fill="#8B5CF6"
                    fill-opacity="0.35"
                    transform="rotate(5, 160, 44)"
                  />
                  <rect
                    x="146"
                    y="52"
                    width="20"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.2"
                    transform="rotate(5, 160, 54)"
                  />
                  <rect
                    x="146"
                    y="62"
                    width="24"
                    height="5"
                    rx="2.5"
                    fill="#10B981"
                    fill-opacity="0.3"
                    transform="rotate(5, 160, 64)"
                  />
                  <!-- 左侧照片卡片 -->
                  <rect
                    x="16"
                    y="30"
                    width="36"
                    height="48"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.1"
                    stroke="#fff"
                    stroke-opacity="0.14"
                    stroke-width="1"
                  />
                  <rect
                    x="20"
                    y="34"
                    width="28"
                    height="22"
                    rx="4"
                    fill="#F59E0B"
                    fill-opacity="0.35"
                  />
                  <circle
                    cx="34"
                    cy="42"
                    r="6"
                    fill="#fff"
                    fill-opacity="0.25"
                  />
                  <rect
                    x="20"
                    y="62"
                    width="28"
                    height="4"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="20"
                    y="70"
                    width="18"
                    height="3"
                    rx="1.5"
                    fill="#fff"
                    fill-opacity="0.08"
                  />
                  <!-- 鼠标 -->
                  <circle
                    cx="140"
                    cy="118"
                    r="6"
                    fill="#fff"
                    fill-opacity="0.06"
                    stroke="#fff"
                    stroke-opacity="0.1"
                    stroke-width="1"
                  />
                </svg>
              </div>
            </template>

            <template v-else-if="visualScene === 'prompt'">
              <div class="scene-svg-wrap">
                <svg viewBox="0 0 200 150" fill="none">
                  <!-- 电脑屏幕 -->
                  <rect
                    x="26"
                    y="16"
                    width="108"
                    height="80"
                    rx="8"
                    fill="#fff"
                    fill-opacity="0.18"
                    stroke="#fff"
                    stroke-opacity="0.22"
                    stroke-width="1.5"
                  />
                  <!-- AI 对话气泡 -->
                  <rect
                    x="38"
                    y="28"
                    width="84"
                    height="20"
                    rx="8"
                    fill="#8B5CF6"
                    fill-opacity="0.35"
                  />
                  <rect
                    x="50"
                    y="35"
                    width="35"
                    height="6"
                    rx="3"
                    fill="#fff"
                    fill-opacity="0.4"
                  />
                  <!-- 用户输入框 -->
                  <rect
                    x="38"
                    y="56"
                    width="84"
                    height="16"
                    rx="6"
                    fill="#fff"
                    fill-opacity="0.08"
                    stroke="#fff"
                    stroke-opacity="0.15"
                    stroke-width="1.2"
                  />
                  <rect
                    x="48"
                    y="62"
                    width="44"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <!-- 光标 -->
                  <rect
                    x="96"
                    y="61"
                    width="3"
                    height="7"
                    rx="1.5"
                    fill="#F59E0B"
                    fill-opacity="0.9"
                  />
                  <!-- 发送按钮 -->
                  <rect
                    x="130"
                    y="56"
                    width="18"
                    height="16"
                    rx="5"
                    fill="#8B5CF6"
                    fill-opacity="0.4"
                  />
                  <path
                    d="M136 62l-4 4 4 4"
                    stroke="#fff"
                    stroke-opacity="0.6"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <!-- 底部提示条 -->
                  <rect
                    x="38"
                    y="80"
                    width="56"
                    height="6"
                    rx="3"
                    fill="#fff"
                    fill-opacity="0.1"
                  />
                  <!-- 键盘 -->
                  <rect
                    x="24"
                    y="104"
                    width="110"
                    height="22"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.08"
                    stroke="#fff"
                    stroke-opacity="0.12"
                    stroke-width="1.2"
                  />
                  <!-- 键盘按键 -->
                  <rect
                    x="30"
                    y="109"
                    width="10"
                    height="8"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="44"
                    y="109"
                    width="10"
                    height="8"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="58"
                    y="109"
                    width="10"
                    height="8"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="72"
                    y="109"
                    width="10"
                    height="8"
                    rx="2"
                    fill="#8B5CF6"
                    fill-opacity="0.3"
                  />
                  <rect
                    x="86"
                    y="109"
                    width="10"
                    height="8"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="100"
                    y="109"
                    width="10"
                    height="8"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.12"
                  />
                  <rect
                    x="114"
                    y="109"
                    width="14"
                    height="8"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.08"
                  />
                  <!-- 使用者人物 -->
                  <circle
                    cx="164"
                    cy="102"
                    r="9"
                    fill="#fff"
                    fill-opacity="0.55"
                  />
                  <rect
                    x="157"
                    y="112"
                    width="14"
                    height="22"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.3"
                  />
                  <line
                    x1="157"
                    y1="118"
                    x2="142"
                    y2="112"
                    stroke="#fff"
                    stroke-opacity="0.3"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <!-- AI 星星 -->
                  <circle
                    cx="150"
                    cy="28"
                    r="4"
                    fill="#F59E0B"
                    fill-opacity="0.5"
                  />
                  <circle
                    cx="158"
                    cy="20"
                    r="2.5"
                    fill="#8B5CF6"
                    fill-opacity="0.4"
                  />
                  <circle
                    cx="144"
                    cy="18"
                    r="2"
                    fill="#10B981"
                    fill-opacity="0.4"
                  />
                </svg>
              </div>
            </template>

            <template v-else>
              <div class="scene-svg-wrap">
                <svg viewBox="0 0 200 150" fill="none">
                  <!-- 教师1 - 左侧 -->
                  <circle
                    cx="52"
                    cy="46"
                    r="10"
                    fill="#fff"
                    fill-opacity="0.65"
                  />
                  <rect
                    x="44"
                    y="57"
                    width="16"
                    height="28"
                    rx="6"
                    fill="#fff"
                    fill-opacity="0.4"
                  />
                  <!-- 手势 -->
                  <line
                    x1="48"
                    y1="64"
                    x2="32"
                    y2="55"
                    stroke="#fff"
                    stroke-opacity="0.4"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <line
                    x1="56"
                    y1="64"
                    x2="72"
                    y2="52"
                    stroke="#fff"
                    stroke-opacity="0.4"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <!-- 教师2 - 右侧 -->
                  <circle
                    cx="148"
                    cy="46"
                    r="10"
                    fill="#fff"
                    fill-opacity="0.6"
                  />
                  <rect
                    x="140"
                    y="57"
                    width="16"
                    height="28"
                    rx="6"
                    fill="#fff"
                    fill-opacity="0.35"
                  />
                  <line
                    x1="152"
                    y1="64"
                    x2="168"
                    y2="55"
                    stroke="#fff"
                    stroke-opacity="0.35"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <line
                    x1="144"
                    y1="64"
                    x2="128"
                    y2="52"
                    stroke="#fff"
                    stroke-opacity="0.35"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <!-- 中间桌子 -->
                  <rect
                    x="74"
                    y="84"
                    width="52"
                    height="10"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.12"
                    stroke="#fff"
                    stroke-opacity="0.16"
                    stroke-width="1.2"
                  />
                  <!-- 咖啡杯 -->
                  <rect
                    x="88"
                    y="74"
                    width="20"
                    height="13"
                    rx="5"
                    fill="#fff"
                    fill-opacity="0.15"
                  />
                  <path
                    d="M108 77 Q116 77 116 82 Q116 87 108 86"
                    stroke="#fff"
                    stroke-opacity="0.2"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                  />
                  <!-- 对话气泡 - 左 -->
                  <rect
                    x="18"
                    y="12"
                    width="60"
                    height="26"
                    rx="12"
                    fill="#fff"
                    fill-opacity="0.15"
                    stroke="#fff"
                    stroke-opacity="0.18"
                    stroke-width="1.2"
                  />
                  <rect
                    x="30"
                    y="20"
                    width="36"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.25"
                  />
                  <rect
                    x="30"
                    y="29"
                    width="24"
                    height="4"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.15"
                  />
                  <!-- 对话气泡 - 右 -->
                  <rect
                    x="122"
                    y="12"
                    width="60"
                    height="26"
                    rx="12"
                    fill="#fff"
                    fill-opacity="0.15"
                    stroke="#fff"
                    stroke-opacity="0.18"
                    stroke-width="1.2"
                  />
                  <rect
                    x="134"
                    y="20"
                    width="36"
                    height="5"
                    rx="2.5"
                    fill="#fff"
                    fill-opacity="0.25"
                  />
                  <rect
                    x="134"
                    y="29"
                    width="24"
                    height="4"
                    rx="2"
                    fill="#fff"
                    fill-opacity="0.15"
                  />
                </svg>
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
  min-height: 160px;
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
    linear-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.2;
}

.scene-svg-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.scene-svg-wrap svg {
  width: 100%;
  height: 100%;
  max-width: 180px;
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
    min-height: 160px;
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
