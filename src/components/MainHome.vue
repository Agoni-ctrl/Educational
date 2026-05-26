<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import SiteNav from './layout/SiteNav.vue'

const mouse = ref({ x: 0.5, y: 0.5 })

function onPointerMove(e) {
  mouse.value = {
    x: e.clientX / window.innerWidth,
    y: e.clientY / window.innerHeight,
  }
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <div class="home">
    <div class="aurora" aria-hidden="true">
      <div
        class="aurora__blob aurora__blob--1"
        :style="{ transform: `translate(${(mouse.x - 0.5) * 36}px, ${(mouse.y - 0.5) * 28}px)` }"
      />
      <div
        class="aurora__blob aurora__blob--2"
        :style="{ transform: `translate(${(mouse.x - 0.5) * -44}px, ${(mouse.y - 0.5) * -32}px)` }"
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
            告别熬夜做课件的繁琐。您只需告诉我们教学思路，AI 即可为您生成专业的 PPT 与教案初稿。从素材搜集到排版美化，我们帮您搞定，让您专注于课堂本身。
          </p>

          <div class="hero__cta reveal" style="--i: 3">
            <RouterLink to="/assistant" class="btn btn--dark btn--lg">
              立即体验 AI 助手
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </RouterLink>
            <RouterLink to="/features" class="btn btn--ghost btn--lg">了解核心功能</RouterLink>
          </div>
        </div>

        <div class="hero__stage reveal" style="--i: 2">
          <div class="float-wrap">
            <div class="float-card float-card--back" />
            <div class="float-card float-card--main">
              <div class="float-card__chrome">
                <span /><span /><span />
                <em>课件共创预览</em>
              </div>
              <div class="float-card__content">
                <div class="slide-preview">
                  <div class="slide-preview__title">牛顿第二定律</div>
                  <div class="slide-preview__blocks">
                    <span>实验探究</span>
                    <span>公式推导</span>
                    <span>互动练习</span>
                  </div>
                  <div class="slide-preview__bar">
                    <div class="slide-preview__fill" />
                  </div>
                </div>
                <ul class="mini-list">
                  <li><span class="dot dot--done" />意图理解完成</li>
                  <li><span class="dot dot--active" />PPT 初稿生成中</li>
                  <li><span class="dot" />教案文档待确认</li>
                </ul>
              </div>
            </div>
            <div class="float-chip float-chip--1">✦ 多轮对话理解中</div>
            <div class="float-chip float-chip--2">PDF 参考已融合</div>
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
  color: var(--ink);
}

/* Aurora */
.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(168deg, #fafcff 0%, #eef5fc 42%, #f4f8fd 100%);
}

.aurora__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(88px);
  will-change: transform;
  transition: transform 0.45s var(--ease-out);
}

.aurora__blob--1 {
  width: 52vw;
  height: 52vw;
  max-width: 640px;
  max-height: 640px;
  top: -12%;
  right: -8%;
  background: radial-gradient(circle, rgba(0, 144, 255, 0.26) 0%, transparent 68%);
  animation: drift-a 20s ease-in-out infinite;
}

.aurora__blob--2 {
  width: 42vw;
  height: 42vw;
  max-width: 520px;
  max-height: 520px;
  bottom: 0;
  left: -10%;
  background: radial-gradient(circle, rgba(0, 194, 212, 0.2) 0%, transparent 70%);
  animation: drift-b 24s ease-in-out infinite;
}

.aurora__blob--3 {
  width: 32vw;
  height: 32vw;
  max-width: 400px;
  max-height: 400px;
  top: 42%;
  left: 42%;
  background: radial-gradient(circle, rgba(99, 179, 255, 0.16) 0%, transparent 72%);
  animation: drift-c 18s ease-in-out infinite reverse;
}

.aurora__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 75% 45% at 55% 0%, rgba(0, 119, 230, 0.08), transparent),
    radial-gradient(ellipse 50% 35% at 95% 55%, rgba(0, 194, 212, 0.05), transparent);
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
  padding: 100px 28px 60px;
}

.hero__inner {
  max-width: 1180px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--accent);
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 var(--accent-glow);
  animation: pulse-ring 2s ease-out infinite;
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.625rem, 5.2vw, 4.125rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.045em;
  margin-bottom: 28px;
}

.hero__title em {
  font-style: normal;
  background: linear-gradient(102deg, #0077e6 0%, #00c2d4 52%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__lead {
  max-width: 500px;
  font-size: 1.0625rem;
  line-height: 1.78;
  color: var(--ink-soft);
  margin-bottom: 36px;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.25s var(--ease-spring), box-shadow 0.25s, background 0.25s;
  white-space: nowrap;
}

.btn--dark {
  background: var(--ink);
  color: #fff;
  box-shadow: 0 2px 10px rgba(10, 15, 26, 0.14);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(10, 15, 26, 0.18);
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.55);
  color: var(--ink);
  border: 1px solid var(--border-strong);
  backdrop-filter: blur(8px);
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(10, 15, 26, 0.18);
}

.btn--lg {
  padding: 15px 26px;
  font-size: 0.95rem;
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
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(28px) saturate(1.35);
  box-shadow:
    0 1px 2px rgba(10, 15, 26, 0.04),
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
  gap: 6px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.float-card__chrome span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.float-card__chrome span:nth-child(1) { background: #ff6b6b; }
.float-card__chrome span:nth-child(2) { background: #ffd166; }
.float-card__chrome span:nth-child(3) { background: #06d6a0; }
.float-card__chrome em { margin-left: auto; font-style: normal; font-weight: 500; }

.float-card__content {
  padding: 26px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
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

.dot--done { background: #06d6a0; }

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
  to { opacity: 1; transform: translateY(0); }
}

@keyframes drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-28px, 36px) scale(1.04); }
}

@keyframes drift-b {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(36px, -28px); }
}

@keyframes drift-c {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(calc(-50% + 18px), calc(-50% - 22px)) scale(1.06); }
}

@keyframes float-main {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes float-back {
  0%, 100% { transform: rotate(5deg) translateY(0); }
  50% { transform: rotate(5deg) translateY(-12px); }
}

@keyframes float-chip-a {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float-chip-b {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px) translateX(5px); }
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 var(--accent-glow); }
  70% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(0, 119, 230, 0.07); }
}

@keyframes progress-grow {
  from { width: 0; }
  to { width: 68%; }
}

@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero__lead { margin-left: auto; margin-right: auto; }
  .hero__cta { justify-content: center; }
  .hero__stage { min-height: 380px; }
}

@media (max-width: 768px) {
  .hero { padding: 96px 20px 48px; }
  .float-chip--1 { right: 0; }
  .float-chip--2 { left: 0; }
}

@media (max-width: 480px) {
  .hero__cta { flex-direction: column; width: 100%; }
  .hero__cta .btn { width: 100%; }
}
</style>
