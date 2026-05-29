<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import SiteNav from "./layout/SiteNav.vue";

const mouse = ref({ x: 0.5, y: 0.5 });

function onPointerMove(e) {
  mouse.value = {
    x: e.clientX / window.innerWidth,
    y: e.clientY / window.innerHeight,
  };
}

// 轮播图数据
const slides = [
  {
    id: 1,
    title: "AI 智能对话",
    subtitle: "多轮对话理解教学意图",
    content:
      "通过自然语言交互，AI 深度理解您的教学需求，生成个性化的课件方案。",
    tags: ["智能问答", "意图识别", "个性化推荐"],
    color: "#0077e6",
  },
  {
    id: 2,
    title: "课件自动生成",
    subtitle: "PPT 与教案一键生成",
    content: "根据教学内容自动生成专业的 PPT 大纲和 Word 教案，节省备课时间。",
    tags: ["PPT 生成", "教案制作", "排版美化"],
    color: "#00c2d4",
  },
  {
    id: 3,
    title: "多模态融合",
    subtitle: "PDF/Word 资料智能解析",
    content: "上传参考资料，AI 自动提取关键信息并融合到课件中，支持多种格式。",
    tags: ["PDF 解析", "内容提取", "知识融合"],
    color: "#4da6ff",
  },
  {
    id: 4,
    title: "互动教学设计",
    subtitle: "课堂活动创意生成",
    content: "为课程设计丰富的互动环节，包括小组讨论、情境问答、拖拽排序等。",
    tags: ["互动环节", "游戏化设计", "课堂活动"],
    color: "#06d6a0",
  },
];

const currentSlide = ref(0);
const prevSlide = ref(0);
const isTransitioning = ref(false);
let autoPlayTimer = null;

// 计算每张卡片在牌堆中的位置（0 = 最上面，1,2,3... = 依次往下）
function getCardPosition(index) {
  const total = slides.length;
  const diff = (index - currentSlide.value + total) % total;
  return diff;
}

// 获取卡片的动画类
function getCardAnimationClass(index) {
  if (!isTransitioning.value) return "";
  const pos = getCardPosition(index);
  const prevPos = (index - prevSlide.value + slides.length) % slides.length;

  // 如果这张卡片刚变成最上面（从其他位置抽上来）
  if (pos === 0 && prevPos !== 0) {
    return "card-stack__card--dealing";
  }
  // 如果这张卡片刚被放到牌堆底部（从顶部移下去）
  if (pos !== 0 && prevPos === 0) {
    return "card-stack__card--to-bottom";
  }
  return "";
}

// 切换到指定幻灯片
function goToSlide(index) {
  if (isTransitioning.value || index === currentSlide.value) return;
  prevSlide.value = currentSlide.value;
  isTransitioning.value = true;
  currentSlide.value = index;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 800);
}

// 下一张 - 当前卡片放到牌堆底部
function nextSlide() {
  if (isTransitioning.value) return;
  prevSlide.value = currentSlide.value;
  isTransitioning.value = true;
  currentSlide.value = (currentSlide.value + 1) % slides.length;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 800);
}

// 自动播放
function startAutoPlay() {
  if (!autoPlayTimer) {
    autoPlayTimer = setInterval(nextSlide, 4000);
  }
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}

onMounted(() => {
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  startAutoPlay();
});

onUnmounted(() => {
  window.removeEventListener("pointermove", onPointerMove);
  stopAutoPlay();
});
</script>

<template>
  <div class="home">
    <div class="aurora" aria-hidden="true">
      <div
        class="aurora__blob aurora__blob--1"
        :style="{
          transform: `translate(${(mouse.x - 0.5) * 36}px, ${(mouse.y - 0.5) * 28}px)`,
        }"
      />
      <div
        class="aurora__blob aurora__blob--2"
        :style="{
          transform: `translate(${(mouse.x - 0.5) * -44}px, ${(mouse.y - 0.5) * -32}px)`,
        }"
      />
      <div class="aurora__blob aurora__blob--3" />
      <div class="aurora__mesh" />
      <div class="aurora__grain" />
    </div>

    <SiteNav />

    <main class="hero">
      <div class="hero__inner">
        <div class="hero__copy">
          <p class="hero__eyebrow reveal" style="--i: 0">
            <span class="pulse" />
            多模态 AI 互动式教学智能体
          </p>

          <h1 class="hero__title reveal" style="--i: 1">
            让教师回归<br />
            <em>教学设计师</em>
          </h1>

          <p class="hero__lead reveal" style="--i: 2">
            告别熬夜做课件的繁琐。您只需告诉我们教学思路，AI 即可为您生成专业的
            PPT
            与教案初稿。从素材搜集到排版美化，我们帮您搞定，让您专注于课堂本身。
          </p>

          <div class="hero__cta reveal" style="--i: 3">
            <RouterLink to="/assistant" class="btn btn--dark btn--lg">
              立即体验 AI 助手
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </RouterLink>
            <RouterLink to="/features" class="btn btn--ghost btn--lg"
              >了解核心功能</RouterLink
            >
          </div>
        </div>

        <div class="hero__stage reveal" style="--i: 2">
          <div
            class="card-stack"
            @mouseenter="stopAutoPlay"
            @mouseleave="startAutoPlay"
          >
            <div
              v-for="(slide, index) in slides"
              :key="slide.id"
              class="card-stack__card"
              :class="[
                getCardPosition(index) === 0
                  ? 'card-stack__card--top'
                  : 'card-stack__card--behind',
                getCardAnimationClass(index),
              ]"
              :style="{
                '--card-color': slide.color,
                '--card-position': getCardPosition(index),
              }"
            >
              <div class="card-stack__chrome">
                <span /><span /><span />
                <em>{{ slide.title }}</em>
              </div>
              <div class="card-stack__content">
                <div class="card-stack__header">
                  <h3 class="card-stack__title" :style="{ color: slide.color }">
                    {{ slide.title }}
                  </h3>
                  <p class="card-stack__subtitle">{{ slide.subtitle }}</p>
                </div>
                <p class="card-stack__desc">{{ slide.content }}</p>
                <div class="card-stack__tags">
                  <span
                    v-for="tag in slide.tags"
                    :key="tag"
                    class="card-stack__tag"
                    :style="{
                      background: slide.color + '15',
                      color: slide.color,
                    }"
                    >{{ tag }}</span
                  >
                </div>
              </div>
            </div>
            <div class="card-stack__indicators">
              <button
                v-for="(slide, index) in slides"
                :key="slide.id"
                class="card-stack__dot"
                :class="{ 'card-stack__dot--active': index === currentSlide }"
                :style="{ '--active-color': slide.color }"
                @click="goToSlide(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--text-primary);
}

/* Aurora - 极光背景 */
.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    168deg,
    var(--color-gray-50) 0%,
    #eef5fc 42%,
    #f4f8fd 100%
  );
}

.aurora__blob {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(88px);
  will-change: transform;
  transition: transform var(--transition-slow);
}

.aurora__blob--1 {
  width: 52vw;
  height: 52vw;
  max-width: 640px;
  max-height: 640px;
  top: -12%;
  right: -8%;
  background: radial-gradient(
    circle,
    rgba(0, 144, 255, 0.26) 0%,
    transparent 68%
  );
  animation: drift-a 20s ease-in-out infinite;
}

.aurora__blob--2 {
  width: 42vw;
  height: 42vw;
  max-width: 520px;
  max-height: 520px;
  bottom: 0;
  left: -10%;
  background: radial-gradient(
    circle,
    rgba(0, 194, 212, 0.2) 0%,
    transparent 70%
  );
  animation: drift-b 24s ease-in-out infinite;
}

.aurora__blob--3 {
  width: 32vw;
  height: 32vw;
  max-width: 400px;
  max-height: 400px;
  top: 42%;
  left: 42%;
  background: radial-gradient(
    circle,
    rgba(99, 179, 255, 0.16) 0%,
    transparent 72%
  );
  animation: drift-c 18s ease-in-out infinite reverse;
}

.aurora__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 75% 45% at 55% 0%,
      rgba(0, 119, 230, 0.08),
      transparent
    ),
    radial-gradient(
      ellipse 50% 35% at 95% 55%,
      rgba(0, 194, 212, 0.05),
      transparent
    );
}

.aurora__grain {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

/* Hero */
.hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: var(--space-24) var(--space-6) var(--space-16);
}

.hero__inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-14);
  align-items: center;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: 0.03em;
  color: var(--color-primary);
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  box-shadow: 0 0 0 0 var(--color-primary-200);
  animation: pulse-ring 2s ease-out infinite;
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.04em;
  margin-bottom: var(--space-6);
}

.hero__title em {
  font-style: normal;
  background: linear-gradient(
    102deg,
    var(--color-primary-600) 0%,
    var(--color-secondary-500) 52%,
    var(--color-primary-400) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__lead {
  max-width: 500px;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

/* 按钮样式 - 使用设计令牌 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.btn--dark {
  background: var(--text-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: var(--color-gray-800);
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.6);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  backdrop-filter: blur(8px);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--border-dark);
}

.btn--lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
}

/* Float card */
.hero__stage {
  position: relative;
  min-height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.float-wrap {
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 4 / 5;
  animation: float-main 7s ease-in-out infinite;
}

.float-card {
  position: absolute;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(28px) saturate(1.35);
  box-shadow:
    var(--shadow-sm),
    0 28px 90px rgba(0, 87, 217, 0.12);
}

.float-card--back {
  inset: 8% -5% -8% 10%;
  transform: rotate(5deg);
  opacity: 0.42;
  animation: float-back 8s ease-in-out infinite;
}

.float-card--main {
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.float-card__chrome {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.float-card__chrome span {
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
}

.float-card__chrome span:nth-child(1) {
  background: var(--color-error);
}
.float-card__chrome span:nth-child(2) {
  background: var(--color-warning);
}
.float-card__chrome span:nth-child(3) {
  background: var(--color-success);
}
.float-card__chrome em {
  margin-left: auto;
  font-style: normal;
  font-weight: var(--font-medium);
}

.float-card__content {
  padding: var(--space-6) var(--space-5);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Card Stack - 3D扑克牌堆叠效果 */
.card-stack {
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 4 / 5;
  perspective: 1500px;
  transform-style: preserve-3d;
}

.card-stack__card {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(28px) saturate(1.35);
  box-shadow:
    0 4px 6px rgba(10, 15, 26, 0.05),
    0 10px 40px rgba(0, 87, 217, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    transform 0.55s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.45s cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 0.4s ease;
  will-change: transform, opacity;
  transform-style: preserve-3d;
}

/* 最上面的卡片 - 当前显示 */
.card-stack__card--top {
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  opacity: 1;
  z-index: 10;
  box-shadow:
    0 8px 30px rgba(10, 15, 26, 0.12),
    0 25px 80px rgba(0, 87, 217, 0.18);
}

/* 在牌堆后面的卡片 - 明显的3D堆叠 */
.card-stack__card--behind {
  transform: translate3d(
      calc(var(--card-position) * 15px - 7.5px),
      calc(var(--card-position) * 12px),
      calc(var(--card-position) * -80px)
    )
    rotateX(calc(var(--card-position) * -8deg + 4deg))
    rotateY(calc(var(--card-position) * 5deg - 2.5deg))
    rotateZ(calc(var(--card-position) * 3deg - 1.5deg));
  opacity: calc(1 - var(--card-position) * 0.18);
  z-index: calc(10 - var(--card-position));
  box-shadow:
    0 2px 8px rgba(10, 15, 26, 0.08),
    0 8px 32px rgba(0, 87, 217, 0.1);
}

/* 丝滑切换动画 - 使用弹簧曲线 */
.card-stack__card--dealing {
  animation: smooth-deal 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes smooth-deal {
  0% {
    transform: translate3d(-40%, 60%, -150px) rotateX(-15deg) rotateY(25deg)
      scale(0.85);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1);
    opacity: 1;
  }
}

.card-stack__card--to-bottom {
  animation: smooth-to-bottom 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes smooth-to-bottom {
  0% {
    transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate3d(-7.5px, 12px, -80px) rotateX(-4deg) rotateY(2.5deg)
      scale(0.96);
    opacity: 0.82;
  }
}

.card-stack__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.card-stack__chrome span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.card-stack__chrome span:nth-child(1) {
  background: #ff6b6b;
}
.card-stack__chrome span:nth-child(2) {
  background: #ffd166;
}
.card-stack__chrome span:nth-child(3) {
  background: #06d6a0;
}
.card-stack__chrome em {
  margin-left: auto;
  font-style: normal;
  font-weight: 500;
}

.card-stack__content {
  padding: 26px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-stack__header {
  text-align: center;
}

.card-stack__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  transition: color 0.4s ease;
}

.card-stack__subtitle {
  font-size: 0.875rem;
  color: var(--ink-muted);
  font-weight: 500;
}

.card-stack__desc {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--ink-soft);
  text-align: center;
  flex: 1;
}

.card-stack__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.card-stack__tag {
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
  transition: all 0.4s ease;
}

.card-stack__indicators {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(10, 15, 26, 0.08);
}

.card-stack__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(10, 15, 26, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-stack__dot:hover {
  background: rgba(10, 15, 26, 0.3);
  transform: scale(1.2);
}

.card-stack__dot--active {
  width: 24px;
  border-radius: 999px;
  background: var(--active-color, var(--accent));
}

.slide-preview__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 14px;
}

.slide-preview__blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.slide-preview__blocks span {
  padding: 7px 13px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(0, 119, 230, 0.08);
  color: var(--accent-deep);
  border-radius: 999px;
}

.slide-preview__bar {
  height: 6px;
  background: rgba(10, 15, 26, 0.06);
  border-radius: 999px;
  overflow: hidden;
}

.slide-preview__fill {
  height: 100%;
  width: 68%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), var(--cyan));
  animation: progress-grow 2.2s var(--ease-out) forwards;
}

.mini-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.mini-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--ink-soft);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(10, 15, 26, 0.12);
  flex-shrink: 0;
}

.dot--done {
  background: #06d6a0;
}

.dot--active {
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.2);
  animation: pulse-dot 2s ease infinite;
}

.float-chip {
  position: absolute;
  padding: 10px 15px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  border-radius: 999px;
  box-shadow: 0 10px 36px rgba(10, 15, 26, 0.08);
  white-space: nowrap;
}

.float-chip--1 {
  top: 5%;
  right: -5%;
  color: var(--accent-deep);
  animation: float-chip-a 5.5s ease-in-out infinite;
}

.float-chip--2 {
  bottom: 8%;
  left: -8%;
  animation: float-chip-b 6.5s ease-in-out infinite 0.4s;
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(22px);
  animation: reveal-up 0.85s var(--ease-out) forwards;
  animation-delay: calc(0.07s * var(--i, 0) + 0.1s);
}

@keyframes reveal-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-28px, 36px) scale(1.04);
  }
}

@keyframes drift-b {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(36px, -28px);
  }
}

@keyframes drift-c {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(calc(-50% + 18px), calc(-50% - 22px)) scale(1.06);
  }
}

@keyframes float-main {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16px);
  }
}

@keyframes float-back {
  0%,
  100% {
    transform: rotate(5deg) translateY(0);
  }
  50% {
    transform: rotate(5deg) translateY(-12px);
  }
}

@keyframes float-chip-a {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-chip-b {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px) translateX(5px);
  }
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
  70% {
    box-shadow: 0 0 0 10px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(0, 119, 230, 0.07);
  }
}

@keyframes progress-grow {
  from {
    width: 0;
  }
  to {
    width: 68%;
  }
}

@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero__lead {
    margin-left: auto;
    margin-right: auto;
  }
  .hero__cta {
    justify-content: center;
  }
  .hero__stage {
    min-height: 380px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 96px 20px 48px;
  }
  .float-chip--1 {
    right: 0;
  }
  .float-chip--2 {
    left: 0;
  }
}

@media (max-width: 480px) {
  .hero__cta {
    flex-direction: column;
    width: 100%;
  }
  .hero__cta .btn {
    width: 100%;
  }
}
</style>
