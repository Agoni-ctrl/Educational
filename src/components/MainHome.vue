<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import SiteNav from './layout/SiteNav.vue'

const mouse = ref({ x: 0.5, y: 0.5 })

const lessonHighlights = [
  { value: '4 步', label: '互动生成闭环' },
  { value: '6 类', label: '多模态资料融合' },
  { value: '1 份', label: '课件与教案同步产出' },
]

const materialCards = [
  { type: 'PDF', title: '教材章节', meta: '已提炼知识结构' },
  { type: 'IMG', title: '实验图片', meta: '转为课件视觉素材' },
  { type: 'DOC', title: '校本模板', meta: '保留学校格式' },
]

const workflowSteps = ['理解意图', '融合资料', '生成初稿', '反馈迭代']

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
            知启灵枢：多模态 AI 互动式教学智能体
          </p>

          <h1 class="hero__title reveal" style="--i: 1">
            让教师回归<br />
            <em>教学设计师</em>
          </h1>

          <p class="hero__lead reveal" style="--i: 2">
            告别熬夜做课件的繁琐。您只需告诉我们教学思路，即可为您生成专业的 PPT 与教案初稿。从素材搜集到排版美化，我们帮您搞定，让您专注于课堂本身。
          </p>

          <div class="lesson-stats reveal" style="--i: 3" aria-label="教学智能体能力概览">
            <article v-for="item in lessonHighlights" :key="item.label" class="lesson-stat">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </article>
          </div>

          <div class="hero__cta reveal" style="--i: 4">
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
                <em>课件共创驾驶舱</em>
              </div>
              <div class="float-card__content">
                <div class="visual-board">
                  <div class="visual-board__photo" role="img" aria-label="课堂课件生成预览插画">
                    <div class="board-screen">
                      <span class="board-screen__tag">PPT 预览</span>
                      <strong>牛顿第二定律</strong>
                      <div class="force-diagram">
                        <span class="force-diagram__block" />
                        <span class="force-diagram__arrow" />
                        <span class="force-diagram__label">F = ma</span>
                      </div>
                    </div>
                    <div class="teacher-figure">
                      <span class="teacher-figure__head" />
                      <span class="teacher-figure__body" />
                      <span class="teacher-figure__arm" />
                    </div>
                    <div class="student-desk student-desk--left" />
                    <div class="student-desk student-desk--right" />
                  </div>
                  <div class="visual-board__caption">
                    <strong>从教学目标到课堂画面</strong>
                    <span>AI 将资料、提问、板书和练习统一编排成可迭代草稿。</span>
                  </div>
                </div>

                <div class="workflow-rail" aria-label="课件生成流程">
                  <span
                    v-for="(step, index) in workflowSteps"
                    :key="step"
                    class="workflow-step"
                    :class="{ 'workflow-step--active': index === 2 }"
                  >
                    {{ step }}
                  </span>
                </div>

                <div class="material-grid">
                  <article v-for="item in materialCards" :key="item.title" class="material-card">
                    <span>{{ item.type }}</span>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <small>{{ item.meta }}</small>
                    </div>
                  </article>
                </div>

                <ul class="mini-list">
                  <li><span class="dot dot--done" />意图理解完成</li>
                  <li><span class="dot dot--done" />多模态资料已融合</li>
                  <li><span class="dot dot--active" />PPT 与教案同步生成中</li>
                </ul>
              </div>
            </div>
            <div class="float-chip float-chip--1">
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 2.5l1.45 4.05L14.5 8l-4.05 1.45L9 13.5 7.55 9.45 3.5 8l4.05-1.45L9 2.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
              </svg>
              多轮对话理解中
            </div>
            <div class="float-chip float-chip--2">PDF / 图片 / Word 已融合</div>
            <div class="float-chip float-chip--3">生成可修改草稿</div>
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
  margin-bottom: 26px;
}

.lesson-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 560px;
  margin-bottom: 30px;
}

.lesson-stat {
  position: relative;
  padding: 14px 14px 13px;
  border: 1px solid rgba(10, 15, 26, 0.08);
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.54)),
    radial-gradient(circle at 15% 10%, rgba(0, 194, 212, 0.14), transparent 42%);
  box-shadow: 0 14px 40px rgba(0, 87, 217, 0.07);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.lesson-stat::after {
  content: '';
  position: absolute;
  inset: auto 12px 0;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.5;
}

.lesson-stat strong {
  display: block;
  margin-bottom: 4px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1;
  color: var(--accent-deep);
}

.lesson-stat span {
  display: block;
  font-size: 0.76rem;
  line-height: 1.45;
  color: var(--ink-muted);
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
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.float-wrap {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 0.95 / 1;
  animation: float-main 7s ease-in-out infinite;
}

.float-card {
  position: absolute;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background:
    linear-gradient(150deg, rgba(255, 255, 255, 0.88), rgba(248, 252, 255, 0.64)),
    radial-gradient(circle at 80% 20%, rgba(0, 194, 212, 0.14), transparent 34%);
  backdrop-filter: blur(28px) saturate(1.35);
  box-shadow:
    0 1px 2px rgba(10, 15, 26, 0.04),
    0 34px 110px rgba(0, 87, 217, 0.16);
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
  padding: 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.visual-board {
  position: relative;
  padding: 10px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(10, 15, 26, 0.06), rgba(255, 255, 255, 0.62));
  border: 1px solid rgba(10, 15, 26, 0.06);
}

.visual-board__photo {
  position: relative;
  min-height: 238px;
  border-radius: 20px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(10, 15, 26, 0.02), rgba(10, 15, 26, 0.12)),
    radial-gradient(circle at 78% 22%, rgba(255, 255, 255, 0.98), transparent 18%),
    linear-gradient(135deg, #dff1ff 0%, #f7fbff 43%, #c7e6ff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.visual-board__photo::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.42) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.32) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 82%);
}

.board-screen {
  position: absolute;
  left: 28px;
  top: 24px;
  width: 58%;
  min-height: 146px;
  padding: 16px;
  border-radius: 18px;
  color: #fff;
  background:
    linear-gradient(145deg, rgba(0, 91, 181, 0.96), rgba(0, 194, 212, 0.82)),
    radial-gradient(circle at 15% 0%, rgba(255, 255, 255, 0.4), transparent 38%);
  box-shadow: 0 20px 50px rgba(0, 87, 217, 0.2);
}

.board-screen__tag {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.68rem;
  font-weight: 700;
}

.board-screen strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.08rem;
  line-height: 1.2;
}

.force-diagram {
  position: relative;
  height: 58px;
  margin-top: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
}

.force-diagram__block {
  position: absolute;
  left: 18px;
  bottom: 16px;
  width: 46px;
  height: 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 20px rgba(0, 35, 82, 0.16);
}

.force-diagram__arrow {
  position: absolute;
  left: 72px;
  bottom: 27px;
  width: 62px;
  height: 2px;
  background: #fff;
}

.force-diagram__arrow::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  width: 10px;
  height: 10px;
  border-top: 2px solid #fff;
  border-right: 2px solid #fff;
  transform: rotate(45deg);
}

.force-diagram__label {
  position: absolute;
  right: 12px;
  top: 12px;
  font-family: var(--font-display);
  font-size: 0.86rem;
  font-weight: 700;
}

.teacher-figure {
  position: absolute;
  right: 52px;
  bottom: 22px;
  width: 76px;
  height: 142px;
}

.teacher-figure__head,
.teacher-figure__body,
.teacher-figure__arm {
  position: absolute;
  display: block;
}

.teacher-figure__head {
  top: 0;
  left: 25px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffe2c2, #f5b980);
}

.teacher-figure__body {
  top: 36px;
  left: 18px;
  width: 48px;
  height: 84px;
  border-radius: 26px 26px 18px 18px;
  background: linear-gradient(180deg, #0a0f1a, #2e4966);
}

.teacher-figure__arm {
  top: 50px;
  left: 4px;
  width: 54px;
  height: 10px;
  border-radius: 999px;
  background: #f5b980;
  transform: rotate(-28deg);
  transform-origin: right center;
}

.student-desk {
  position: absolute;
  bottom: 0;
  width: 96px;
  height: 54px;
  border-radius: 22px 22px 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(221, 237, 250, 0.92));
  box-shadow: 0 -12px 30px rgba(10, 15, 26, 0.08);
}

.student-desk::before {
  content: '';
  position: absolute;
  left: 34px;
  top: -24px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #2f5f8e, #0a0f1a);
}

.student-desk--left {
  left: 28px;
}

.student-desk--right {
  right: 146px;
  transform: scale(0.86);
  opacity: 0.82;
}

.visual-board__caption {
  display: grid;
  grid-template-columns: 0.72fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 4px 2px;
}

.visual-board__caption strong {
  font-family: var(--font-display);
  font-size: 0.94rem;
  line-height: 1.35;
}

.visual-board__caption span {
  font-size: 0.76rem;
  line-height: 1.55;
  color: var(--ink-muted);
}

.workflow-rail {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.workflow-rail::before {
  content: '';
  position: absolute;
  left: 12%;
  right: 12%;
  top: 50%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 119, 230, 0.28), transparent);
}

.workflow-step {
  position: relative;
  z-index: 1;
  display: inline-flex;
  justify-content: center;
  padding: 8px 6px;
  border: 1px solid rgba(0, 119, 230, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.workflow-step--active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(100deg, var(--accent), var(--cyan));
  box-shadow: 0 10px 24px rgba(0, 119, 230, 0.22);
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.material-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(10, 15, 26, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.material-card > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 11px;
  background: rgba(0, 119, 230, 0.09);
  color: var(--accent-deep);
  font-size: 0.68rem;
  font-weight: 800;
}

.material-card strong,
.material-card small {
  display: block;
}

.material-card strong {
  margin-bottom: 2px;
  font-size: 0.8rem;
}

.material-card small {
  font-size: 0.68rem;
  line-height: 1.4;
  color: var(--ink-muted);
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  border-radius: 999px;
  box-shadow: 0 10px 36px rgba(10, 15, 26, 0.08);
  white-space: nowrap;
}

.float-chip svg {
  width: 16px;
  height: 16px;
}

.float-chip--1 {
  top: 3%;
  right: -3%;
  color: var(--accent-deep);
  animation: float-chip-a 5.5s ease-in-out infinite;
}

.float-chip--2 {
  bottom: 11%;
  left: -9%;
  animation: float-chip-b 6.5s ease-in-out infinite 0.4s;
}

.float-chip--3 {
  right: -8%;
  bottom: 27%;
  color: #0e765b;
  animation: float-chip-a 6s ease-in-out infinite 0.8s;
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

@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero__lead { margin-left: auto; margin-right: auto; }
  .lesson-stats { margin-left: auto; margin-right: auto; }
  .hero__cta { justify-content: center; }
  .hero__stage { min-height: 520px; }
}

@media (max-width: 768px) {
  .hero { padding: 96px 20px 48px; }
  .lesson-stats { grid-template-columns: 1fr; }
  .float-chip--1 { right: 0; }
  .float-chip--2 { left: 0; }
  .float-chip--3 { right: 0; }
  .material-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .hero__cta { flex-direction: column; width: 100%; }
  .hero__cta .btn { width: 100%; }
  .hero__stage { min-height: 650px; }
  .float-wrap { aspect-ratio: auto; min-height: 620px; }
  .float-card--main { inset: 18px 0 0; }
  .float-card--back { inset: 8% 3% 2% 7%; }
  .visual-board__caption { grid-template-columns: 1fr; }
  .workflow-rail { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .visual-board__photo { min-height: 214px; }
  .board-screen { left: 16px; width: 64%; }
  .teacher-figure { right: 22px; transform: scale(0.86); transform-origin: bottom right; }
}
</style>
