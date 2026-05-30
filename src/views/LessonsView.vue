<script setup>
import { computed, ref } from 'vue'
import SiteNav from '../components/layout/SiteNav.vue'

const selectedLessonId = ref('lesson-1')
const activeQuestion = ref(0)
const selectedOption = ref('')
const showResult = ref(false)

const lessons = [
  {
    id: 'lesson-1',
    category: '课堂教程',
    title: '牛顿第二定律实验课示范',
    duration: '18 分钟',
    teacher: '物理教研组',
    focus: '实验导入、变量控制、分层提问',
    description: '围绕“力、质量、加速度”的关系，示范一节适合高中课堂的实验探究课。',
    videoCover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    chapters: [
      { time: '00:00', title: '情境导入', desc: '用生活现象唤起学生对“受力变化”的感知。' },
      { time: '04:20', title: '实验设计', desc: '说明变量控制与数据记录方式。' },
      { time: '10:10', title: '结果分析', desc: '引导学生从图像归纳规律。' },
      { time: '15:30', title: '迁移练习', desc: '把结论迁移到典型计算题。' },
    ],
    prompts: ['为什么要强调控制变量？', '如何处理学生结论不一致？', '这节课适合加什么互动环节？'],
    questions: [
      {
        prompt: '这节示范课最适合的教学主线是什么？',
        options: ['直接讲公式并布置练习', '实验探究后再抽象出规律', '先播放视频后自由讨论', '只做计算题训练'],
        answer: '实验探究后再抽象出规律',
        explanation: '课程设计明显采用“观察现象 - 设计实验 - 提炼规律”的探究链路。',
      },
      {
        prompt: '如果学生实验数据波动较大，教师优先应该做什么？',
        options: ['立即给出标准答案', '重做全部实验', '先带学生检查变量控制和测量误差', '跳过实验直接总结'],
        answer: '先带学生检查变量控制和测量误差',
        explanation: '这样既保护探究过程，也能把问题转化成教学素材。',
      },
    ],
  },
  {
    id: 'lesson-2',
    category: '课堂教程',
    title: '历史公开课导入设计拆解',
    duration: '12 分钟',
    teacher: '历史备课组',
    focus: '认知冲突、史料引导、讨论提问',
    description: '示范如何用“先破后立”的方式打开《鸦片战争》一课。',
    videoCover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    chapters: [
      { time: '00:00', title: '旧认知激活', desc: '先让学生说出对清朝国力的直觉判断。' },
      { time: '03:10', title: '冲突材料投放', desc: '展示战前贸易数据和武备对比。' },
      { time: '07:40', title: '问题链追问', desc: '通过层层追问把讨论拉回时代背景。' },
      { time: '10:20', title: '导入收束', desc: '自然过渡到新课主线。' },
    ],
    prompts: ['怎样把史料题转成课堂互动？', '导入控制在几分钟比较合适？', '适合初中还是高中？'],
    questions: [
      {
        prompt: '这节导入的关键效果是什么？',
        options: ['制造紧张气氛', '让学生快速记住时间线', '让学生产生认知落差并愿意追问', '完成课前默写'],
        answer: '让学生产生认知落差并愿意追问',
        explanation: '导入的核心不是灌输信息，而是激活学生的问题意识。',
      },
    ],
  },
]

const currentLesson = computed(() => lessons.find((lesson) => lesson.id === selectedLessonId.value) || lessons[0])
const currentQuestion = computed(() => currentLesson.value.questions[activeQuestion.value] || null)
const answeredCorrectly = computed(() => selectedOption.value && selectedOption.value === currentQuestion.value?.answer)

function chooseLesson(id) {
  selectedLessonId.value = id
  activeQuestion.value = 0
  selectedOption.value = ''
  showResult.value = false
}

function submitAnswer() {
  if (!selectedOption.value) return
  showResult.value = true
}

function nextQuestion() {
  if (activeQuestion.value >= currentLesson.value.questions.length - 1) {
    activeQuestion.value = 0
  } else {
    activeQuestion.value += 1
  }
  selectedOption.value = ''
  showResult.value = false
}
</script>

<template>
  <div class="lessons-page">
    <div class="lessons-bg" aria-hidden="true" />
    <SiteNav />

    <main class="lessons-main">
      <section class="lessons-shell">
        <aside class="lesson-list">
          <div class="lesson-list__head">
            <p>课堂教程</p>
            <h1>示范课堂库</h1>
          </div>

          <button
            v-for="lesson in lessons"
            :key="lesson.id"
            class="lesson-item"
            :class="{ 'lesson-item--active': lesson.id === currentLesson.id }"
            @click="chooseLesson(lesson.id)"
          >
            <span class="lesson-item__meta">{{ lesson.category }}</span>
            <strong>{{ lesson.title }}</strong>
            <small>{{ lesson.duration }} · {{ lesson.focus }}</small>
          </button>
        </aside>

        <section class="lesson-stage">
          <div class="video-hero" :style="{ backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.78)), url(${currentLesson.videoCover})` }">
            <div class="video-hero__body">
              <div>
                <span class="video-badge">教学示范视频</span>
                <h2>{{ currentLesson.title }}</h2>
                <p>{{ currentLesson.description }}</p>
              </div>
              <button class="play-btn" type="button">
                <span class="play-btn__icon">▶</span>
                播放课程
              </button>
            </div>
          </div>

          <div class="lesson-grid">
            <section class="lesson-panel">
              <div class="panel-head">
                <h3>课程拆解</h3>
                <span>{{ currentLesson.teacher }}</span>
              </div>
              <div class="chapter-list">
                <article v-for="chapter in currentLesson.chapters" :key="chapter.time" class="chapter-row">
                  <span>{{ chapter.time }}</span>
                  <div>
                    <strong>{{ chapter.title }}</strong>
                    <p>{{ chapter.desc }}</p>
                  </div>
                </article>
              </div>
            </section>

            <section class="lesson-panel lesson-panel--quiz">
              <div class="panel-head">
                <h3>边学边答</h3>
                <span>第 {{ activeQuestion + 1 }} / {{ currentLesson.questions.length }} 题</span>
              </div>

              <div v-if="currentQuestion" class="quiz-card">
                <p class="quiz-card__prompt">{{ currentQuestion.prompt }}</p>

                <label
                  v-for="option in currentQuestion.options"
                  :key="option"
                  class="option-row"
                  :class="{ 'option-row--selected': selectedOption === option }"
                >
                  <input v-model="selectedOption" type="radio" :value="option" name="lesson-answer" />
                  <span>{{ option }}</span>
                </label>

                <div v-if="showResult" class="answer-card" :class="{ 'answer-card--ok': answeredCorrectly, 'answer-card--retry': !answeredCorrectly }">
                  <strong>{{ answeredCorrectly ? '回答正确' : '再想一步' }}</strong>
                  <p>{{ currentQuestion.explanation }}</p>
                </div>

                <div class="quiz-actions">
                  <button class="quiz-btn quiz-btn--primary" type="button" :disabled="!selectedOption" @click="submitAnswer">
                    提交答案
                  </button>
                  <button class="quiz-btn" type="button" @click="nextQuestion">
                    下一题
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section class="lesson-panel prompt-panel">
            <div class="panel-head">
              <h3>课后追问</h3>
              <span>可直接复制到 AI 助手</span>
            </div>
            <div class="prompt-list">
              <button v-for="prompt in currentLesson.prompts" :key="prompt" class="prompt-chip" type="button">
                {{ prompt }}
              </button>
            </div>
          </section>
        </section>
      </section>
    </main>
  </div>
</template>

<style scoped>
.lessons-page {
  min-height: 100vh;
  color: var(--ink);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.92)),
    linear-gradient(135deg, #f2f4ed 0%, #e7eef6 52%, #f7fbff 100%);
}

.lessons-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 80%);
}

.lessons-main {
  position: relative;
  z-index: 1;
  padding: 112px 24px 40px;
}

.lessons-shell {
  max-width: 1260px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

.lesson-list,
.lesson-panel {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
}

.lesson-list {
  padding: 22px;
  position: sticky;
  top: 104px;
}

.lesson-list__head p {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f7b46;
  margin-bottom: 8px;
}

.lesson-list__head h1 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.lesson-item {
  width: 100%;
  text-align: left;
  padding: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.25s var(--ease-out), border-color 0.25s, box-shadow 0.25s;
}

.lesson-item + .lesson-item {
  margin-top: 12px;
}

.lesson-item:hover,
.lesson-item--active {
  transform: translateY(-2px);
  border-color: rgba(86, 114, 40, 0.35);
  box-shadow: 0 14px 28px rgba(86, 114, 40, 0.12);
}

.lesson-item__meta {
  display: inline-flex;
  margin-bottom: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #556b2f;
}

.lesson-item strong {
  display: block;
  font-size: 0.96rem;
  margin-bottom: 6px;
}

.lesson-item small {
  display: block;
  font-size: 0.78rem;
  color: var(--ink-muted);
  line-height: 1.5;
}

.lesson-stage {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-hero {
  min-height: 360px;
  border-radius: 22px;
  background-size: cover;
  background-position: center;
  padding: 28px;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 26px 54px rgba(15, 23, 42, 0.16);
}

.video-hero__body {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
}

.video-badge {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #f8fafc;
  font-size: 0.76rem;
  margin-bottom: 14px;
}

.video-hero h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
}

.video-hero p {
  max-width: 680px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.95rem;
  line-height: 1.7;
}

.play-btn {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  background: #f6c453;
  color: #1f2937;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(246, 196, 83, 0.25);
}

.play-btn__icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
  font-size: 0.8rem;
}

.lesson-grid {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 20px;
}

.lesson-panel {
  padding: 22px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 18px;
}

.panel-head h3 {
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 700;
}

.panel-head span {
  font-size: 0.78rem;
  color: var(--ink-muted);
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-row {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.6), rgba(248, 250, 252, 0.9));
}

.chapter-row span {
  font-size: 0.8rem;
  font-weight: 700;
  color: #556b2f;
}

.chapter-row strong {
  display: block;
  font-size: 0.92rem;
  margin-bottom: 4px;
}

.chapter-row p {
  font-size: 0.83rem;
  color: var(--ink-soft);
}

.lesson-panel--quiz {
  background: linear-gradient(180deg, rgba(251, 248, 235, 0.92), rgba(255, 255, 255, 0.92));
}

.quiz-card__prompt {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.7;
  margin-bottom: 16px;
}

.option-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.88);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.option-row + .option-row {
  margin-top: 10px;
}

.option-row--selected {
  border-color: rgba(246, 196, 83, 0.7);
  transform: translateX(3px);
}

.option-row input {
  margin-top: 4px;
}

.option-row span {
  font-size: 0.88rem;
  line-height: 1.55;
}

.answer-card {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 14px;
}

.answer-card--ok {
  background: rgba(21, 128, 61, 0.1);
  color: #166534;
}

.answer-card--retry {
  background: rgba(180, 83, 9, 0.1);
  color: #92400e;
}

.answer-card strong {
  display: block;
  margin-bottom: 6px;
}

.answer-card p {
  font-size: 0.84rem;
  line-height: 1.6;
}

.quiz-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.quiz-btn {
  padding: 11px 18px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.quiz-btn--primary {
  border-color: transparent;
  background: #243443;
  color: #fff;
}

.quiz-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.prompt-panel {
  background: linear-gradient(90deg, rgba(227, 240, 251, 0.9), rgba(245, 249, 253, 0.95));
}

.prompt-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.prompt-chip {
  padding: 11px 16px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.94);
  cursor: pointer;
  font-size: 0.84rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.prompt-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

@media (max-width: 1024px) {
  .lessons-shell,
  .lesson-grid {
    grid-template-columns: 1fr;
  }

  .lesson-list {
    position: static;
  }

  .video-hero__body {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .lessons-main {
    padding: 96px 16px 32px;
  }

  .video-hero {
    min-height: 300px;
    padding: 20px;
  }

  .video-hero h2 {
    font-size: 1.5rem;
  }

  .quiz-actions {
    flex-direction: column;
  }
}
</style>
