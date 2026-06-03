<script setup>
import { RouterLink } from "vue-router";
import SiteNav from "../components/layout/SiteNav.vue";

const capabilities = [
  {
    icon: "💬",
    title: "理解意图",
    desc: "通过语音或文字多轮对话，主动询问并确认教学目标、核心知识点、讲授逻辑、重难点与互动设计。",
  },
  {
    icon: "📎",
    title: "融合多模态参考",
    desc: "支持 PDF 教案、Word 文档、参考视频与图片，提取知识结构、案例与排版风格并融入生成。",
  },
  {
    icon: "✨",
    title: "生成课件初稿",
    desc: "输出结构完整的 PPT 演示文稿、Word 教案，以及知识点动画创意、互动小游戏等多模态内容。",
  },
  {
    icon: "🔄",
    title: "支持迭代优化",
    desc: "形成「互动 → 生成 → 反馈 → 再生成」闭环，支持预览修改与下载后自行编辑细节。",
  },
];

const values = [
  { title: "以教师为中心", desc: "不是替代教师，而是放大教学设计师的专业能力" },
  { title: "闭环而非碎片", desc: "从意图理解到课件生成，一个平台完成全流程" },
  { title: "深度而非浅层", desc: "多轮对话把握复杂教学思路，而非单次简单指令" },
];

const team = [
  { name: "产品设计", role: "教学场景调研 · 交互设计" },
  { name: "AI 工程", role: "大语言模型 · 多模态解析" },
  { name: "前端开发", role: "Vue3 · 智能体界面" },
];
</script>

<template>
  <div class="about-page">
    <div class="bg" aria-hidden="true">
      <div class="bg__orb bg__orb--1" />
      <div class="bg__orb bg__orb--2" />
    </div>

    <SiteNav />

    <main>
      <section class="hero">
        <p class="eyebrow">About Us</p>
        <h1>关于知启灵枢</h1>
        <p class="hero__lead">
          多模态 AI 互动式教学智能体——以教师教学思路为核心，
          构建具备深度互动与多模态解析生成能力的课件共创系统。
        </p>
      </section>

      <section class="block">
        <div class="block__grid">
          <div class="block__content">
            <h2>项目背景</h2>
            <p>
              随着教育信息化 2.0
              行动的深入推进，人工智能技术正成为重塑教学模式的核心驱动力。
              当前，虽然 AI 辅助教学工具层出不穷，但多数工具功能单一、操作割裂，
              未能形成以教师教学思路为核心的闭环工作流。
            </p>
            <p>
              教师在使用这些工具时，仍需耗费大量时间在课件的内容组织、格式调整、资源搜寻等重复性劳动上，
              而非专注于教学逻辑与创意的构思。生成式 AI
              和多模态理解技术的成熟，为破解这一困境提供了可能。
            </p>
          </div>
          <div class="block__aside">
            <div class="quote-card">
              <p>「让教师回归教学设计师」</p>
              <span>— 知启灵枢 使命</span>
            </div>
          </div>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">我们要解决的问题</h2>
        <div class="problem-grid">
          <article class="problem-card">
            <h3>功能碎片化</h3>
            <p>
              教学设计、PPT 制作、讲义撰写需多个工具，流程割裂，切换成本高。
            </p>
          </article>
          <article class="problem-card">
            <h3>意图理解浅层化</h3>
            <p>
              只能执行单次简单指令，无法把握教师复杂的教学思路与个性化要求。
            </p>
          </article>
          <article class="problem-card">
            <h3>重复性劳动</h3>
            <p>大量时间耗费在格式调整与资源搜寻，挤压了教学逻辑构思的空间。</p>
          </article>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">四大核心能力</h2>
        <div class="cap-grid">
          <article
            v-for="cap in capabilities"
            :key="cap.title"
            class="cap-card"
          >
            <span class="cap-card__icon">{{ cap.icon }}</span>
            <h3>{{ cap.title }}</h3>
            <p>{{ cap.desc }}</p>
          </article>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">我们的理念</h2>
        <div class="values-row">
          <article v-for="v in values" :key="v.title" class="value-card">
            <h3>{{ v.title }}</h3>
            <p>{{ v.desc }}</p>
          </article>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">团队构成</h2>
        <div class="team-grid">
          <article v-for="member in team" :key="member.name" class="team-card">
            <div class="team-card__avatar">{{ member.name.charAt(0) }}</div>
            <h3>{{ member.name }}</h3>
            <p>{{ member.role }}</p>
          </article>
        </div>
      </section>

      <section class="block block--competition">
        <div class="competition-card">
          <div class="competition-card__badge">竞赛项目</div>
          <h2>中国大学生服务外包创新创业大赛</h2>
          <p>教育信息化创新赛道 · 多模态 AI 互动式教学智能体</p>
        </div>
      </section>

      <section class="cta">
        <h2>准备好开始课件共创了吗？</h2>
        <p>从 AI 助手对话开始，体验以教学思路驱动的智能生成流程。</p>
        <div class="cta__actions">
          <RouterLink to="/assistant" class="btn btn--dark"
            >开始共创</RouterLink
          >
          <RouterLink to="/features" class="btn btn--ghost"
            >探索核心功能</RouterLink
          >
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <strong>知启灵枢</strong>
          <p>多模态 AI 互动式教学智能体</p>
        </div>
        <div class="footer__links">
          <RouterLink to="/features">核心功能</RouterLink>
          <RouterLink to="/assistant">AI 助手</RouterLink>
          <RouterLink to="/community">社区</RouterLink>
        </div>
        <p class="footer__copy">
          © {{ new Date().getFullYear() }} 知启灵枢 · 保留所有权利
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.about-page {
  position: relative;
  min-height: 100vh;
  color: var(--ink);
}

.bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: transparent;
}

.bg__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}

.bg__orb--1 {
  width: 480px;
  height: 480px;
  top: -10%;
  right: -5%;
  background: radial-gradient(
    circle,
    rgba(0, 144, 255, 0.18) 0%,
    transparent 70%
  );
}

.bg__orb--2 {
  width: 400px;
  height: 400px;
  bottom: 10%;
  left: -8%;
  background: radial-gradient(
    circle,
    rgba(0, 194, 212, 0.14) 0%,
    transparent 70%
  );
}

main {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 120px 28px 0;
}

.hero {
  text-align: center;
  margin-bottom: 72px;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 20px;
}

.hero__lead {
  max-width: 640px;
  margin: 0 auto;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--ink-soft);
}

.block {
  margin-bottom: 64px;
}

.block__title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.block__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
  align-items: start;
}

.block__content h2 {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.block__content p {
  font-size: 0.9375rem;
  line-height: 1.78;
  color: var(--ink-soft);
  margin-bottom: 16px;
}

.quote-card {
  padding: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  box-shadow: 0 16px 48px rgba(0, 87, 217, 0.06);
}

.quote-card p {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 12px;
  background: linear-gradient(102deg, var(--accent), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quote-card span {
  font-size: 0.8125rem;
  color: var(--ink-muted);
}

.problem-grid,
.cap-grid,
.values-row,
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.cap-grid {
  grid-template-columns: repeat(2, 1fr);
}

.problem-card,
.cap-card,
.value-card,
.team-card {
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s;
}

.problem-card:hover,
.cap-card:hover,
.value-card:hover,
.team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(10, 15, 26, 0.06);
}

.problem-card h3,
.cap-card h3,
.value-card h3,
.team-card h3 {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.problem-card p,
.cap-card p,
.value-card p,
.team-card p {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--ink-soft);
}

.cap-card__icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 12px;
}

.team-card {
  text-align: center;
}

.team-card__avatar {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
}

.competition-card {
  padding: 40px;
  text-align: center;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 119, 230, 0.15);
  background: linear-gradient(
    135deg,
    rgba(0, 119, 230, 0.06) 0%,
    rgba(0, 194, 212, 0.04) 100%
  );
}

.competition-card__badge {
  display: inline-block;
  padding: 6px 14px;
  margin-bottom: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-deep);
  background: rgba(0, 119, 230, 0.1);
  border-radius: 999px;
}

.competition-card h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.competition-card p {
  font-size: 0.9375rem;
  color: var(--ink-soft);
}

.cta {
  text-align: center;
  padding: 56px 32px;
  margin-bottom: 48px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
}

.cta h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.cta p {
  font-size: 0.9375rem;
  color: var(--ink-soft);
  margin-bottom: 24px;
}

.cta__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 13px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 999px;
  text-decoration: none;
  transition:
    transform 0.25s var(--ease-spring),
    box-shadow 0.25s;
}

.btn--dark {
  background: var(--ink);
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 15, 26, 0.12);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(10, 15, 26, 0.16);
}

.btn--ghost {
  color: var(--ink);
  border: 1px solid var(--border-strong);
  background: transparent;
}

.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.6);
}

.footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
  padding: 40px 28px;
  background: rgba(255, 255, 255, 0.5);
}

.footer__inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.footer__brand strong {
  font-family: var(--font-display);
  font-size: 1rem;
}

.footer__brand p {
  font-size: 0.8125rem;
  color: var(--ink-muted);
  margin-top: 4px;
}

.footer__links {
  display: flex;
  gap: 20px;
  margin-left: auto;
}

.footer__links a {
  font-size: 0.875rem;
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.2s;
}

.footer__links a:hover {
  color: var(--ink);
}

.footer__copy {
  width: 100%;
  font-size: 0.8125rem;
  color: var(--ink-muted);
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .block__grid {
    grid-template-columns: 1fr;
  }
  .problem-grid,
  .values-row,
  .team-grid {
    grid-template-columns: 1fr;
  }
  .cap-grid {
    grid-template-columns: 1fr;
  }
  .footer__links {
    margin-left: 0;
    width: 100%;
  }
  .cta__actions {
    flex-direction: column;
  }
  .cta__actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
