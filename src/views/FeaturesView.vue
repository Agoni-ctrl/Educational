<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useFeatures, formatFeatureTime, getTypeIcon } from '../composables/useFeatures.js'

const {
  getHistory,
  getStats,
  addRecord,
  updateRecord,
  deleteRecord,
  TYPE_LABELS,
  STATUS_LABELS,
} = useFeatures()

const activePanel = ref('overview')
const sidebarOpen = ref(false)
const history = ref(getHistory())
const stats = ref(getStats())
const uploadFiles = ref([])
const isGenerating = ref(false)
const toast = ref('')
const historyQuery = ref('')
const historyPage = ref(1)
const iterateFeedback = ref({})

const pptForm = ref({
  subject: '',
  topic: '',
  duration: '45分钟',
  style: '实验探究型',
})

const docForm = ref({
  subject: '',
  topic: '',
  format: '标准教案',
  style: '实验探究型',
})

const questionForm = ref({
  subject: '',
  topic: '',
  type: '分层训练',
  difficulty: '中等',
  stage: '高中',
})

const navGroups = [
  {
    label: '创作生成',
    items: [
      { id: 'ppt', label: '课件生成', icon: 'ppt', desc: '实时生成课件结构与预览' },
      { id: 'doc', label: '教案生成', icon: 'doc', desc: '同步输出教学脚本与流程' },
      { id: 'interactive', label: '教学题生成', icon: 'interactive', desc: '按场景生成课堂题组设计' },
    ],
  },
  {
    label: '教学上下文',
    items: [
      { id: 'intent', label: '教学意图', icon: 'intent', desc: '先明确目标，再进入生成流程' },
      { id: 'multimodal', label: '参考资料', icon: 'multimodal', desc: '上传 PDF、Word、图片作为素材' },
    ],
  },
  {
    label: '管理与优化',
    items: [
      { id: 'visualize', label: '进度洞察', icon: 'visualize', desc: '查看阶段产出与使用节奏' },
      { id: 'history', label: '生成记录', icon: 'history', desc: '按时间与类型回看生成历史' },
      { id: 'iterate', label: '意见反馈', icon: 'iterate', desc: '沉淀修改建议并继续优化' },
    ],
  },
]

const panelTitles = {
  overview: '核心功能概览',
  ppt: '课件生成',
  doc: '教案生成',
  interactive: '教学题生成',
  intent: '教学意图',
  multimodal: '参考资料',
  visualize: '进度洞察',
  history: '生成记录',
  iterate: '意见反馈',
}

const featureIcons = {
  ppt: ['M4 4.5h12v8H4v-8z', 'M7 15.5h6M10 12.5v3'],
  doc: ['M6 3.5h6l3 3v10H6v-13z', 'M12 3.5v4h4M8.5 10h5M8.5 13h5'],
  interactive: ['M4.5 5.5h11v8h-11z', 'M7.5 8.5h5M7.5 11.5h3', 'M13.5 13.5l2 2'],
  intent: ['M10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM10 10h.01'],
  multimodal: ['M4.5 15.5h11', 'M6 9.5 10 5l4 4.5M10 5v8.5'],
  visualize: ['M4 14h2V8H4v6zm5 0h2V5H9v9zm5 0h2v-4h-2v4z', 'M3.5 16.5h13'],
  history: ['M10 4.5v5l3 1.5', 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'],
  iterate: ['M15.5 7.5A5.5 5.5 0 0 0 6 5l-1.5 1.5M4.5 3.5v3h3', 'M4.5 12.5A5.5 5.5 0 0 0 14 15l1.5-1.5M15.5 16.5v-3h-3'],
}

const overviewCards = computed(() => [
  {
    label: '本周生成',
    value: stats.value.total,
    detail: history.value[0] ? `最近任务：${history.value[0].title}` : '还没有生成记录，先开启一次创作吧',
    tone: 'blue',
    icon: '01',
  },
  {
    label: '已完成',
    value: stats.value.completed,
    detail: '可直接继续编辑、导出或进入复用',
    tone: 'mint',
    icon: '02',
  },
  {
    label: '待优化',
    value: stats.value.iterating,
    detail: '适合优先处理带反馈的内容，提高成品质量',
    tone: 'violet',
    icon: '03',
  },
  {
    label: '覆盖学科',
    value: new Set(history.value.map((item) => item.subject)).size || 1,
    detail: '统一沉淀不同学科的生成经验与历史资产',
    tone: 'amber',
    icon: '04',
  },
])

const trendItems = computed(() => {
  const labels = ['05.22', '05.23', '05.24', '05.25', '05.26', '05.27', '05.28']
  const values = [3, 5, 4, 7, 6, 8, 7]
  const max = Math.max(...values)

  return labels.map((label, index) => ({
    label,
    value: values[index],
    x: 36 + index * 74,
    y: 198 - (values[index] / max) * 120,
  }))
})

const weeklyFlowPath = computed(() =>
  trendItems.value
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`)
    .join(' '),
)

const weeklyAreaPath = computed(() => `${weeklyFlowPath.value} L 480 214 L 36 214 Z`)

const typeShare = computed(() => {
  const list = [
    { label: '课件生成', value: stats.value.ppt, color: '#4c7dff' },
    { label: '教案生成', value: stats.value.doc, color: '#23c3b2' },
    { label: '教学题生成', value: stats.value.interactive, color: '#8b5cf6' },
  ]
  const total = Math.max(list.reduce((sum, item) => sum + item.value, 0), 1)

  return list.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }))
})

const donutSegments = computed(() => {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return typeShare.value.map((item) => {
    const length = (item.percent / 100) * circumference
    const segment = {
      ...item,
      radius,
      circumference,
      length,
      offset,
    }
    offset += length
    return segment
  })
})

const overviewQueue = computed(() =>
  history.value.slice(0, 4).map((item) => ({
    ...item,
    typeLabel: TYPE_LABELS[item.type],
    statusLabel: STATUS_LABELS[item.status],
    timeLabel: formatFeatureTime(item.createdAt),
  })),
)

const pptPreviewStructure = {
  实验探究型: ['情境导入', '提出问题', '实验设计', '现象分析', '规律归纳', '课堂训练'],
  讲授演示型: ['目标导入', '概念讲解', '典型例题', '难点辨析', '课堂小结', '巩固练习'],
  问题驱动型: ['核心问题', '线索拆解', '推导验证', '方法提炼', '拓展追问', '课堂反馈'],
  翻转课堂型: ['课前任务', '问题聚焦', '重点讲评', '协作展示', '方法沉淀', '课后延展'],
}

const docPreviewStructure = {
  标准教案: ['教学目标', '重点难点', '学情分析', '教学准备', '课堂流程', '作业布置'],
  详细教案: ['目标分层', '环节脚本', '师生互动', '板书设计', '即时评价', '课后反思'],
  简版教案: ['目标概览', '流程总览', '重点提示', '例题设计', '收束总结', '课后任务'],
  校本模板: ['模板字段匹配', '课程目标', '教学流程', '资源使用', '课堂评价', '反思记录'],
}

const questionPreviewStructure = {
  分层训练: {
    基础: ['概念判断', '单步练习', '情境选择', '即时反馈'],
    中等: ['基础过渡', '方法应用', '变式训练', '课堂回收'],
    提高: ['关键情境', '综合推理', '迁移挑战', '反思总结'],
  },
  课堂检测: {
    基础: ['快速热身', '知识判断', '基础检测', '出门测'],
    中等: ['导入检测', '过程诊断', '重点辨析', '结果回收'],
    提高: ['先行诊断', '综合判断', '高阶追问', '结果复盘'],
  },
  探究任务: {
    基础: ['观察任务', '条件提取', '现象记录', '讨论回顾'],
    中等: ['问题提出', '变量分析', '探究作答', '结论表达'],
    提高: ['真实情境', '方案设计', '多步推演', '成果展示'],
  },
}

const pptRecommendation = computed(() =>
  (pptPreviewStructure[pptForm.value.style] || pptPreviewStructure['实验探究型']).map((title, index) => ({
    index: index + 1,
    title,
    note:
      index === 0
        ? `${pptForm.value.topic || '等待填写课题'} · ${pptForm.value.duration}`
        : index === 2
          ? `当前目录已根据“${pptForm.value.style}”实时联动调整`
          : `围绕${pptForm.value.subject || '当前学科'}的课堂节奏继续展开`,
  })),
)

const docRecommendation = computed(() =>
  (docPreviewStructure[docForm.value.format] || docPreviewStructure['标准教案']).map((title, index) => ({
    index: index + 1,
    title,
    note:
      index === 0
        ? `${docForm.value.topic || '等待填写课题'} · ${docForm.value.format}`
        : index === 3
          ? `同步参考“${docForm.value.style}”下的讲授节奏`
          : `适配${docForm.value.subject || '当前学科'}的教案表达方式`,
  })),
)

const questionRecommendation = computed(() => {
  const structure = questionPreviewStructure[questionForm.value.type] || questionPreviewStructure['分层训练']
  const entries = structure[questionForm.value.difficulty] || structure['中等']

  return entries.map((title, index) => ({
    index: index + 1,
    title,
    note:
      index === 0
        ? `${questionForm.value.topic || '等待填写知识点'} · ${questionForm.value.stage}${questionForm.value.subject || '学科'}`
        : index === 2
          ? `已根据“${questionForm.value.type} / ${questionForm.value.difficulty}”自动刷新题组结构`
          : `适配课堂即时使用、投屏展示与课后回收场景`,
  }))
})

const historySummary = computed(() => [
  { label: '全部记录', value: stats.value.total, note: '累计创作产出' },
  { label: '课件', value: stats.value.ppt, note: '适合投屏讲授' },
  { label: '教案', value: stats.value.doc, note: '可继续编辑沉淀' },
  { label: '教学题', value: stats.value.interactive, note: '课堂练习与检测' },
])

const filteredHistory = computed(() => {
  const keyword = historyQuery.value.trim().toLowerCase()
  if (!keyword) return history.value

  return history.value.filter((item) =>
    [item.title, item.subject, TYPE_LABELS[item.type]]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(keyword)),
  )
})

const pageSize = 4
const totalHistoryPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / pageSize)))
const paginatedHistory = computed(() => {
  const start = (historyPage.value - 1) * pageSize
  return filteredHistory.value.slice(start, start + pageSize)
})

const feedbackItems = computed(() =>
  history.value
    .filter((item) => item.status === 'iterating' || item.status === 'draft')
    .map((item) => ({
      ...item,
      typeLabel: TYPE_LABELS[item.type],
      statusLabel: STATUS_LABELS[item.status],
      timeLabel: formatFeatureTime(item.createdAt),
      feedback: iterateFeedback.value[item.id] || '',
    })),
)

const intentSupport = [
  '把“教学意图”做成生成流程的前置信息层，而不是单独孤立的工具页。',
  '先明确课堂目标、学生难点和使用场景，再让系统去生成课件、教案和教学题。',
]

const taskMoments = computed(() => [
  {
    label: '进行中任务',
    value: isGenerating.value ? '1个' : `${Math.max(stats.value.iterating, 1)}个`,
    detail: isGenerating.value ? 'AI 正在整理内容结构与推荐目录' : '待优化内容会在这里形成下一步动作',
  },
  {
    label: '推荐动作',
    value: activePanel.value === 'overview' ? '3条' : '2条',
    detail: activePanel.value === 'overview' ? '继续生成课件、整理教案、补充教学题' : `当前聚焦：${panelTitles[activePanel]}`,
  },
])

let toastTimer = null

function refresh() {
  history.value = getHistory()
  stats.value = getStats()
}

function selectPanel(id) {
  activePanel.value = id
  sidebarOpen.value = false
}

function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 2600)
}

function simulateGenerate(type, title, subject, pages = 0) {
  isGenerating.value = true
  setTimeout(() => {
    addRecord({
      type,
      title,
      subject,
      pages,
      status: type === 'interactive' ? 'draft' : 'completed',
    })
    refresh()
    isGenerating.value = false
    showToast('生成任务已加入记录，可继续查看与优化')
    activePanel.value = 'history'
  }, 1000)
}

function handlePptGenerate() {
  if (!pptForm.value.topic.trim()) return showToast('请先填写课题名称')
  simulateGenerate(
    'ppt',
    `${pptForm.value.topic} · PPT课件`,
    pptForm.value.subject || '未分类',
    pptRecommendation.value.length * 2,
  )
}

function handleDocGenerate() {
  if (!docForm.value.topic.trim()) return showToast('请先填写课题名称')
  simulateGenerate(
    'doc',
    `${docForm.value.topic} · 教案`,
    docForm.value.subject || '未分类',
    docRecommendation.value.length,
  )
}

function handleQuestionGenerate() {
  if (!questionForm.value.topic.trim()) return showToast('请先填写知识点或题组主题')
  simulateGenerate(
    'interactive',
    `${questionForm.value.topic} · 教学题生成`,
    questionForm.value.subject || '未分类',
    questionRecommendation.value.length,
  )
}

function onFileChange(event) {
  const files = Array.from(event.target.files || [])
  uploadFiles.value = [...uploadFiles.value, ...files.map((file) => ({ name: file.name, size: file.size, type: file.type }))]
  event.target.value = ''
}

function removeFile(index) {
  uploadFiles.value.splice(index, 1)
}

function handleDelete(id) {
  deleteRecord(id)
  refresh()
  showToast('记录已删除')
}

function submitFeedback(item) {
  const value = iterateFeedback.value[item.id]?.trim()
  if (!value) return showToast('请先填写反馈内容')
  updateRecord(item.id, { status: 'iterating' })
  showToast('反馈已提交，系统会据此继续优化')
  iterateFeedback.value = {
    ...iterateFeedback.value,
    [item.id]: '',
  }
  refresh()
}

watch(activePanel, refresh)
watch(historyQuery, () => {
  historyPage.value = 1
})
watch(totalHistoryPages, (value) => {
  if (historyPage.value > value) historyPage.value = value
})
</script>

<template>
  <div class="features-page">
    <div class="features-page__ambient" aria-hidden="true">
      <span class="ambient-orb ambient-orb--one" />
      <span class="ambient-orb ambient-orb--two" />
      <span class="ambient-grid" />
    </div>

    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar__head">
        <RouterLink to="/" class="icon-btn" title="返回首页">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </RouterLink>
        <div class="sidebar__brand">
          <span class="sidebar__brand-name">核心功能</span>
          <span class="sidebar__brand-sub">多模态 AI 教学创作工作台</span>
        </div>
      </div>

      <button
        class="overview-btn"
        :class="{ 'overview-btn--active': activePanel === 'overview' }"
        @click="selectPanel('overview')"
      >
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.3" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.3" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.3" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.3" />
        </svg>
        核心功能概览
      </button>

      <nav v-for="group in navGroups" :key="group.label" class="nav-group">
        <p class="nav-group__label">{{ group.label }}</p>
        <button
          v-for="item in group.items"
          :key="item.id"
          class="nav-item"
          :class="{ 'nav-item--active': activePanel === item.id }"
          @click="selectPanel(item.id)"
        >
          <span class="nav-item__icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path
                v-for="path in featureIcons[item.icon]"
                :key="path"
                :d="path"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="nav-item__text">
            <strong>{{ item.label }}</strong>
            <small>{{ item.desc }}</small>
          </span>
        </button>
      </nav>

      <div class="sidebar__foot">
        <RouterLink to="/assistant" class="assistant-link">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z" stroke="currentColor" stroke-width="1.3" />
          </svg>
          前往 AI 助手对话
        </RouterLink>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

    <main class="main">
      <header class="main__header">
        <button class="icon-btn mobile-only" aria-label="打开菜单" @click="sidebarOpen = true">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <div>
          <span class="header-chip">参赛项目 · 多模态 AI 互动式教学</span>
          <h1>{{ panelTitles[activePanel] }}</h1>
          <p class="main__subtitle">把教学意图、课件生成、教案输出、教学题设计和反馈优化，串成一条真正可视化的 AI 教学创作工作流。</p>
        </div>
      </header>

      <div class="main__body">
        <div v-if="activePanel === 'overview'" class="panel panel--overview">
          <section class="overview-stage">
            <div class="overview-stage__lead">
              <div class="overview-stage__badge">AI Teaching Workspace</div>
              <h2>让核心功能区像一个创作工作台，而不是传统后台首页</h2>
              <p>这里不再强调空洞的大数字，而是把最近任务、创作节奏、生成结构和类型分布放到更清晰的视觉流里。</p>

              <div class="moment-grid">
                <article v-for="item in taskMoments" :key="item.label" class="moment-card">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                  <p>{{ item.detail }}</p>
                </article>
              </div>
            </div>

            <div class="metric-grid">
              <article v-for="card in overviewCards" :key="card.label" class="metric-card" :data-tone="card.tone">
                <div class="metric-card__icon">{{ card.icon }}</div>
                <div class="metric-card__body">
                  <span>{{ card.label }}</span>
                  <strong>{{ card.value }}</strong>
                  <p>{{ card.detail }}</p>
                </div>
              </article>
            </div>
          </section>

          <section class="insight-grid">
            <article class="dashboard-card dashboard-card--chart">
              <div class="section-head">
                <div>
                  <span class="section-tag">生成节奏</span>
                  <h3>本周创作趋势</h3>
                </div>
                <small>近 7 天</small>
              </div>

              <div class="line-chart-card">
                <svg viewBox="0 0 520 230" class="line-chart" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="overviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#7aa2ff" stop-opacity="0.38" />
                      <stop offset="100%" stop-color="#7aa2ff" stop-opacity="0.02" />
                    </linearGradient>
                    <linearGradient id="overviewStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="#4c7dff" />
                      <stop offset="100%" stop-color="#7c5cff" />
                    </linearGradient>
                  </defs>

                  <line v-for="y in [52, 94, 136, 178]" :key="y" x1="36" :y1="y" x2="480" :y2="y" class="line-chart__grid" />
                  <path :d="weeklyAreaPath" fill="url(#overviewAreaGradient)" />
                  <path :d="weeklyFlowPath" fill="none" stroke="url(#overviewStrokeGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                  <g v-for="item in trendItems" :key="item.label">
                    <circle :cx="item.x" :cy="item.y" r="6" fill="#ffffff" stroke="#4c7dff" stroke-width="3" />
                  </g>
                </svg>

                <div class="line-chart__labels">
                  <div v-for="item in trendItems" :key="item.label" class="line-chart__label">
                    <strong>{{ item.value }}</strong>
                    <span>{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </article>

            <article class="dashboard-card dashboard-card--donut">
              <div class="section-head">
                <div>
                  <span class="section-tag">产出结构</span>
                  <h3>当前生成分布</h3>
                </div>
              </div>

              <div class="donut-panel">
                <div class="donut-chart">
                  <svg viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="56" class="donut-chart__track" />
                    <circle
                      v-for="segment in donutSegments"
                      :key="segment.label"
                      cx="80"
                      cy="80"
                      :r="segment.radius"
                      fill="none"
                      :stroke="segment.color"
                      stroke-width="18"
                      stroke-linecap="round"
                      :stroke-dasharray="`${Math.max(segment.length - 3, 0)} ${segment.circumference}`"
                      :stroke-dashoffset="`${-segment.offset}`"
                      transform="rotate(-90 80 80)"
                    />
                  </svg>

                  <div class="donut-chart__center">
                    <strong>{{ stats.total }}</strong>
                    <span>总记录</span>
                  </div>
                </div>

                <div class="donut-legend">
                  <div v-for="item in typeShare" :key="item.label" class="donut-legend__item">
                    <i :style="{ background: item.color }" />
                    <div>
                      <strong>{{ item.label }}</strong>
                      <span>{{ item.value }} 条 · {{ item.percent }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section class="dashboard-card dashboard-card--queue">
            <div class="section-head">
              <div>
                <span class="section-tag">最近任务</span>
                <h3>最近生成与优化轨迹</h3>
              </div>
              <button class="btn-secondary" @click="selectPanel('history')">查看全部记录</button>
            </div>

            <div class="queue-list">
              <article v-for="item in overviewQueue" :key="item.id" class="queue-item">
                <div class="queue-item__icon">{{ getTypeIcon(item.type) }}</div>
                <div class="queue-item__info">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.subject }} · {{ item.typeLabel }} · {{ item.timeLabel }}</span>
                </div>
                <em class="status-badge" :data-status="item.status">{{ item.statusLabel }}</em>
              </article>
            </div>
          </section>
        </div>

        <section v-else-if="activePanel === 'ppt'" class="panel">
          <div class="generator-layout">
            <article class="form-card">
              <div class="section-head">
                <div>
                  <span class="section-tag">Prompt Workspace</span>
                  <h2>课件生成</h2>
                </div>
              </div>
              <p class="form-card__desc">用更轻的输入方式配置课题、学科和讲授风格，右侧目录会根据选择实时联动刷新。</p>

              <label>
                学科
                <input v-model="pptForm.subject" type="text" placeholder="例如：物理 / 历史 / 生物" />
              </label>

              <label>
                课题
                <input v-model="pptForm.topic" type="text" placeholder="例如：牛顿第二定律" />
              </label>

              <label>
                课时长度
                <select v-model="pptForm.duration">
                  <option>40分钟</option>
                  <option>45分钟</option>
                  <option>50分钟</option>
                </select>
              </label>

              <label>
                讲授风格
                <select v-model="pptForm.style">
                  <option>实验探究型</option>
                  <option>讲授演示型</option>
                  <option>问题驱动型</option>
                  <option>翻转课堂型</option>
                </select>
              </label>

              <div class="chip-row">
                <button type="button" class="chip-row__chip">情境导入</button>
                <button type="button" class="chip-row__chip">板书提示</button>
                <button type="button" class="chip-row__chip">课堂追问</button>
              </div>

              <button class="btn-primary" :disabled="isGenerating" @click="handlePptGenerate">
                {{ isGenerating ? 'AI 正在生成课件...' : '开始生成课件' }}
              </button>
            </article>

            <article class="preview-card preview-card--rich">
              <div class="preview-card__chrome">
                <span />
                <span />
                <span />
                <em>实时目录预览</em>
              </div>

              <div class="preview-card__body">
                <div class="preview-card__head">
                  <div>
                    <span class="preview-card__eyebrow">推荐结构</span>
                    <h3>{{ pptForm.topic || '等待填写课题' }}</h3>
                    <p>{{ pptForm.style }} · {{ pptForm.subject || '待填写学科' }}</p>
                  </div>
                  <div class="ai-badge" :class="{ 'ai-badge--active': isGenerating }">
                    <i />
                    {{ isGenerating ? 'Thinking' : 'Ready' }}
                  </div>
                </div>

                <div class="recommendation-list">
                  <article v-for="item in pptRecommendation" :key="item.index" class="recommendation-item">
                    <span>{{ item.index }}</span>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.note }}</p>
                    </div>
                  </article>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="activePanel === 'doc'" class="panel">
          <div class="generator-layout">
            <article class="form-card">
              <div class="section-head">
                <div>
                  <span class="section-tag">Prompt Workspace</span>
                  <h2>教案生成</h2>
                </div>
              </div>
              <p class="form-card__desc">让教案结构跟着教学风格和模板同步变化，避免左边改了参数、右边还是旧目录的割裂感。</p>

              <label>
                学科
                <input v-model="docForm.subject" type="text" placeholder="例如：物理 / 语文 / 地理" />
              </label>

              <label>
                课题
                <input v-model="docForm.topic" type="text" placeholder="例如：力的分解" />
              </label>

              <label>
                教案格式
                <select v-model="docForm.format">
                  <option>标准教案</option>
                  <option>详细教案</option>
                  <option>简版教案</option>
                  <option>校本模板</option>
                </select>
              </label>

              <label>
                讲授风格
                <select v-model="docForm.style">
                  <option>实验探究型</option>
                  <option>讲授演示型</option>
                  <option>问题驱动型</option>
                  <option>翻转课堂型</option>
                </select>
              </label>

              <div class="chip-row">
                <button type="button" class="chip-row__chip">学情分析</button>
                <button type="button" class="chip-row__chip">板书设计</button>
                <button type="button" class="chip-row__chip">作业布置</button>
              </div>

              <button class="btn-primary" :disabled="isGenerating" @click="handleDocGenerate">
                {{ isGenerating ? 'AI 正在生成教案...' : '开始生成教案' }}
              </button>
            </article>

            <article class="preview-card preview-card--rich">
              <div class="preview-card__chrome">
                <span />
                <span />
                <span />
                <em>实时结构预览</em>
              </div>

              <div class="preview-card__body">
                <div class="preview-card__head">
                  <div>
                    <span class="preview-card__eyebrow">推荐章节</span>
                    <h3>{{ docForm.topic || '等待填写课题' }}</h3>
                    <p>{{ docForm.format }} · {{ docForm.subject || '待填写学科' }}</p>
                  </div>
                  <div class="ai-badge" :class="{ 'ai-badge--active': isGenerating }">
                    <i />
                    {{ isGenerating ? 'Generating' : 'Synced' }}
                  </div>
                </div>

                <div class="recommendation-list">
                  <article v-for="item in docRecommendation" :key="item.index" class="recommendation-item">
                    <span>{{ item.index }}</span>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.note }}</p>
                    </div>
                  </article>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="activePanel === 'interactive'" class="panel">
          <div class="generator-layout">
            <article class="form-card">
              <div class="section-head">
                <div>
                  <span class="section-tag">Teaching Question Flow</span>
                  <h2>教学题生成</h2>
                </div>
              </div>
              <p class="form-card__desc">把原来的互动设计改成更实用的教学题工作区，适合做导入题、分层训练、课堂检测和探究任务。</p>

              <label>
                学科
                <input v-model="questionForm.subject" type="text" placeholder="例如：物理" />
              </label>

              <label>
                知识点 / 题组主题
                <input v-model="questionForm.topic" type="text" placeholder="例如：牛顿第二定律应用" />
              </label>

              <label>
                题组类型
                <select v-model="questionForm.type">
                  <option>分层训练</option>
                  <option>课堂检测</option>
                  <option>探究任务</option>
                </select>
              </label>

              <label>
                难度
                <select v-model="questionForm.difficulty">
                  <option>基础</option>
                  <option>中等</option>
                  <option>提高</option>
                </select>
              </label>

              <label>
                学段
                <select v-model="questionForm.stage">
                  <option>小学</option>
                  <option>初中</option>
                  <option>高中</option>
                </select>
              </label>

              <div class="chip-row">
                <button type="button" class="chip-row__chip">投屏讲解</button>
                <button type="button" class="chip-row__chip">随堂检测</button>
                <button type="button" class="chip-row__chip">分层练习</button>
              </div>

              <button class="btn-primary" :disabled="isGenerating" @click="handleQuestionGenerate">
                {{ isGenerating ? 'AI 正在生成题组...' : '开始生成教学题' }}
              </button>
            </article>

            <article class="preview-card preview-card--rich">
              <div class="preview-card__chrome">
                <span />
                <span />
                <span />
                <em>题组结构预览</em>
              </div>

              <div class="preview-card__body">
                <div class="preview-card__head">
                  <div>
                    <span class="preview-card__eyebrow">实时题组推荐</span>
                    <h3>{{ questionForm.topic || '等待填写知识点' }}</h3>
                    <p>{{ questionForm.type }} · {{ questionForm.difficulty }} · {{ questionForm.stage }}</p>
                  </div>
                  <div class="ai-badge" :class="{ 'ai-badge--active': isGenerating }">
                    <i />
                    {{ isGenerating ? 'Reasoning' : 'Live Sync' }}
                  </div>
                </div>

                <div class="preview-highlight">
                  <strong>当前联动说明</strong>
                  <p>修改题组类型、难度或学段后，右侧结构会立即刷新，不再出现“左边改了，右边不变”的问题。</p>
                </div>

                <div class="recommendation-list">
                  <article v-for="item in questionRecommendation" :key="item.index" class="recommendation-item">
                    <span>{{ item.index }}</span>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.note }}</p>
                    </div>
                  </article>
                </div>
              </div>


              
            </article>
          </div>
        </section>

        <section v-else-if="activePanel === 'intent'" class="panel">
          <article class="support-card">
            <div class="section-head">
              <div>
                <span class="section-tag">前置信息层</span>
                <h2>教学意图</h2>
              </div>
            </div>
            <p class="form-card__desc">这一块不再像独立工具，而是服务于上面的所有生成流程，帮助系统先理解课堂目标和学生状态。</p>

            <div class="support-list">
              <article v-for="(item, index) in intentSupport" :key="item" class="support-item">
                <span>0{{ index + 1 }}</span>
                <p>{{ item }}</p>
              </article>
            </div>
          </article>
        </section>

        <section v-else-if="activePanel === 'multimodal'" class="panel">
          <article class="support-card">
            <div class="section-head">
              <div>
                <span class="section-tag">多模态输入</span>
                <h2>参考资料</h2>
              </div>
            </div>

            <label class="upload-zone__drop">
              <input type="file" multiple hidden @change="onFileChange" />
              <span class="upload-zone__icon">+</span>
              <strong>上传 PDF、Word、图片作为生成参考</strong>
              <p>支持把教辅资料、课堂截图、课标片段一起作为生成上下文。</p>
            </label>

            <div v-if="uploadFiles.length" class="file-list">
              <div v-for="(file, index) in uploadFiles" :key="`${file.name}-${index}`" class="file-item">
                <span>{{ file.name }}</span>
                <button @click="removeFile(index)">移除</button>
              </div>
            </div>
          </article>
        </section>

        <section v-else-if="activePanel === 'visualize'" class="panel">
          <div class="insight-grid insight-grid--simple">
            <article class="viz-card viz-card--flow">
              <div class="section-head">
                <div>
                  <span class="section-tag">工作流</span>
                  <h2>生成路径</h2>
                </div>
              </div>

              <svg viewBox="0 0 420 170" class="mini-flow" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="flowStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#4c7dff" />
                    <stop offset="100%" stop-color="#7c5cff" />
                  </linearGradient>
                </defs>
                <path d="M20 110 C100 110 110 40 180 40 S300 130 390 68" fill="none" stroke="url(#flowStroke)" stroke-width="6" stroke-linecap="round" />
                <circle cx="20" cy="110" r="8" fill="#4c7dff" />
                <circle cx="180" cy="40" r="8" fill="#23c3b2" />
                <circle cx="390" cy="68" r="8" fill="#8b5cf6" />
              </svg>
              <p class="viz-note">把“教学意图 → 生成内容 → 反馈优化”做成更容易理解的工作流，而不是传统统计图堆砌。</p>
            </article>

            <article class="viz-card">
              <div class="section-head">
                <div>
                  <span class="section-tag">推荐动作</span>
                  <h2>下一步建议</h2>
                </div>
              </div>

              <div class="support-list">
                <article class="support-item">
                  <span>01</span>
                  <p>优先补齐“教学题生成”的课堂检测模板，让课件、教案和题组三者形成闭环。</p>
                </article>
                <article class="support-item">
                  <span>02</span>
                  <p>把高频学科沉淀成可复用模板，减少重复填写成本。</p>
                </article>
                <article class="support-item">
                  <span>03</span>
                  <p>将有反馈的记录优先推进到下一轮优化，提高演示时的完成度。</p>
                </article>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="activePanel === 'history'" class="panel">
          <div class="record-summary">
            <article v-for="item in historySummary" :key="item.label" class="summary-pill">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.note }}</p>
            </article>
          </div>

          <div class="history-toolbar">
            <input v-model="historyQuery" type="text" placeholder="搜索课题、学科或类型" />
            <div class="pager">
              <button :disabled="historyPage <= 1" @click="historyPage -= 1">上一页</button>
              <span>{{ historyPage }} / {{ totalHistoryPages }}</span>
              <button :disabled="historyPage >= totalHistoryPages" @click="historyPage += 1">下一页</button>
            </div>
          </div>

          <div class="record-list">
            <article v-for="item in paginatedHistory" :key="item.id" class="record-card">
              <div class="record-card__icon">{{ getTypeIcon(item.type) }}</div>
              <div class="record-card__info">
                <strong>{{ item.title }}</strong>
                <span>{{ item.subject }} · {{ TYPE_LABELS[item.type] }} · {{ formatFeatureTime(item.createdAt) }}</span>
              </div>
              <em class="status-badge" :data-status="item.status">{{ STATUS_LABELS[item.status] }}</em>
              <button class="record-card__delete" @click="handleDelete(item.id)">删除</button>
            </article>

            <div v-if="!paginatedHistory.length" class="empty-state">
              <p>没有匹配的生成记录</p>
            </div>
          </div>
        </section>

        <section v-else-if="activePanel === 'iterate'" class="panel">
          <div class="feedback-list">
            <article v-for="item in feedbackItems" :key="item.id" class="feedback-card">
              <div class="feedback-card__head">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p class="feedback-card__meta">{{ item.subject }} · {{ item.typeLabel }} · {{ item.timeLabel }}</p>
                </div>
                <em class="status-badge" :data-status="item.status">{{ item.statusLabel }}</em>
              </div>

              <div class="feedback-card__tips">
                <span>建议反馈方向</span>
                <p>可以补充结构调整、讲授风格、题目难度、课堂互动方式等意见，让下一轮生成更贴合你的展示目标。</p>
              </div>

              <textarea
                v-model="iterateFeedback[item.id]"
                placeholder="例如：希望导入更有情境感，减少概念堆砌，增加课堂追问和学生讨论环节"
              />

              <div class="feedback-card__actions">
                <button class="btn-primary" @click="submitFeedback(item)">提交反馈</button>
              </div>
            </article>

            <div v-if="!feedbackItems.length" class="empty-state">
              <p>当前没有待反馈内容</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(111, 146, 255, 0.14), transparent 28%),
    radial-gradient(circle at 80% 0, rgba(81, 190, 255, 0.14), transparent 24%),
    linear-gradient(180deg, #eef4ff 0%, #f6f8fc 40%, #f8fafc 100%);
}

.features-page {
  --font-display: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-body: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --ink: #122033;
  --ink-soft: #445269;
  --ink-muted: #738197;
  --accent: #4c7dff;
  --accent-deep: #3156d3;
  --accent-mint: #23c3b2;
  --accent-violet: #8b5cf6;
  --border: rgba(128, 151, 185, 0.16);
  --border-strong: rgba(76, 125, 255, 0.22);
  --panel: rgba(255, 255, 255, 0.82);
  --panel-strong: rgba(255, 255, 255, 0.92);
  --shadow: 0 24px 60px rgba(31, 65, 134, 0.08);
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
  position: relative;
  min-height: 100vh;
  display: flex;
  color: var(--ink);
  font-family: var(--font-body);
}

.features-page__ambient {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.ambient-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.65;
}

.ambient-orb--one {
  width: 320px;
  height: 320px;
  top: -80px;
  right: 12%;
  background: radial-gradient(circle, rgba(76, 125, 255, 0.28), rgba(76, 125, 255, 0));
}

.ambient-orb--two {
  width: 280px;
  height: 280px;
  bottom: 10%;
  left: -60px;
  background: radial-gradient(circle, rgba(35, 195, 178, 0.16), rgba(35, 195, 178, 0));
}

.ambient-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(76, 125, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(76, 125, 255, 0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 84%);
}

.sidebar {
  position: sticky;
  top: 0;
  width: 292px;
  height: 100vh;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 12px 0 40px rgba(76, 125, 255, 0.04);
  z-index: 2;
}

.sidebar__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.84);
  color: var(--ink);
  text-decoration: none;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.sidebar__brand {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sidebar__brand-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.98rem;
  letter-spacing: -0.02em;
}

.sidebar__brand-sub {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.overview-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 10px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}

.overview-btn:hover,
.overview-btn--active {
  color: var(--accent-deep);
  border-color: rgba(76, 125, 255, 0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(237, 243, 255, 0.96));
  box-shadow: 0 12px 28px rgba(76, 125, 255, 0.08);
}

.overview-btn svg {
  width: 18px;
  height: 18px;
}

.nav-group {
  margin-bottom: 10px;
}

.nav-group__label {
  margin: 0 0 8px;
  padding: 0 10px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 6px;
  padding: 12px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}

.nav-item:hover,
.nav-item--active {
  transform: translateX(3px);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 14px 28px rgba(31, 65, 134, 0.06);
}

.nav-item__icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(233, 240, 255, 0.96));
  color: var(--accent-deep);
  border: 1px solid rgba(76, 125, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  flex-shrink: 0;
}

.nav-item__icon svg {
  width: 18px;
  height: 18px;
}

.nav-item__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.nav-item__text strong {
  font-size: 0.86rem;
  font-weight: 800;
  color: var(--ink);
}

.nav-item__text small {
  font-size: 0.72rem;
  color: var(--ink-muted);
  line-height: 1.5;
}

.sidebar__foot {
  margin-top: auto;
  padding-top: 18px;
}

.assistant-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(76, 125, 255, 0.12), rgba(139, 92, 246, 0.1));
  color: var(--accent-deep);
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 700;
}

.assistant-link svg {
  width: 16px;
  height: 16px;
}

.main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  padding: 24px;
}

.main__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
}

.header-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 0.74rem;
  font-weight: 800;
}

.main__header h1 {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-size: 1.84rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.main__subtitle {
  margin: 8px 0 0;
  max-width: 760px;
  color: var(--ink-muted);
  font-size: 0.92rem;
  line-height: 1.75;
}

.mobile-only {
  display: none;
}

.main__body {
  min-height: calc(100vh - 120px);
  padding: 28px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow);
  overflow-y: auto;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2,
.section-head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.16rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.section-head small {
  color: var(--ink-muted);
  font-size: 0.76rem;
}

.section-tag,
.overview-stage__badge,
.preview-card__eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 0.74rem;
  font-weight: 800;
}

.overview-stage {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 18px;
}

.overview-stage__lead {
  padding: 28px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(152, 185, 255, 0.22), transparent 30%),
    linear-gradient(145deg, rgba(15, 24, 42, 0.96), rgba(34, 66, 149, 0.92));
  color: #fff;
  box-shadow: 0 26px 50px rgba(31, 65, 134, 0.18);
}

.overview-stage__lead h2 {
  margin: 16px 0 12px;
  max-width: 11em;
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.overview-stage__lead p {
  margin: 0;
  max-width: 36rem;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.75;
}

.moment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.moment-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.moment-card span {
  display: block;
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.72);
}

.moment-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1.4rem;
  font-weight: 800;
}

.moment-card p {
  margin-top: 8px;
  font-size: 0.8rem;
  line-height: 1.65;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(242, 247, 255, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.metric-card__icon {
  width: 50px;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 0.84rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.metric-card[data-tone='blue'] .metric-card__icon {
  background: linear-gradient(135deg, #4c7dff, #5a9dff);
}

.metric-card[data-tone='mint'] .metric-card__icon {
  background: linear-gradient(135deg, #23c3b2, #62d9c4);
}

.metric-card[data-tone='violet'] .metric-card__icon {
  background: linear-gradient(135deg, #7c5cff, #9b7dff);
}

.metric-card[data-tone='amber'] .metric-card__icon {
  background: linear-gradient(135deg, #f59e0b, #ffbf5a);
}

.metric-card__body {
  min-width: 0;
}

.metric-card__body span {
  display: block;
  font-size: 0.78rem;
  color: var(--ink-muted);
}

.metric-card__body strong {
  display: block;
  margin-top: 10px;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.metric-card__body p,
.summary-pill p {
  margin: 8px 0 0;
  color: var(--ink-soft);
  font-size: 0.82rem;
  line-height: 1.65;
}

.insight-grid {
  display: grid;
  grid-template-columns: 1.22fr 0.78fr;
  gap: 18px;
}

.insight-grid--simple {
  grid-template-columns: 1fr 1fr;
}

.dashboard-card,
.form-card,
.preview-card,
.support-card,
.viz-card,
.feedback-card,
.record-card,
.summary-pill {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: rgba(248, 251, 255, 0.78);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.dashboard-card,
.form-card,
.support-card,
.viz-card,
.feedback-card {
  padding: 22px;
}

.dashboard-card--chart {
  background:
    radial-gradient(circle at top right, rgba(76, 125, 255, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 245, 255, 0.94));
}

.dashboard-card--donut,
.dashboard-card--queue {
  background: rgba(250, 252, 255, 0.9);
}

.line-chart-card {
  margin-top: 18px;
}

.line-chart {
  width: 100%;
  height: 230px;
  display: block;
}

.line-chart__grid {
  stroke: rgba(114, 135, 168, 0.12);
  stroke-width: 1;
}

.line-chart__labels {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.line-chart__label {
  text-align: center;
}

.line-chart__label strong {
  display: block;
  font-size: 0.84rem;
  color: var(--accent-deep);
}

.line-chart__label span {
  font-size: 0.74rem;
  color: var(--ink-muted);
}

.donut-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 12px;
}

.donut-chart {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.donut-chart svg {
  width: 100%;
  height: 100%;
}

.donut-chart__track {
  fill: none;
  stroke: rgba(76, 125, 255, 0.08);
  stroke-width: 18;
}

.donut-chart__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-chart__center strong {
  font-size: 1.7rem;
  font-weight: 800;
}

.donut-chart__center span {
  font-size: 0.78rem;
  color: var(--ink-muted);
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.donut-legend__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
}

.donut-legend__item i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}

.donut-legend__item strong,
.queue-item__info strong,
.record-card__info strong,
.feedback-card h3,
.recommendation-item strong {
  display: block;
  font-size: 0.94rem;
  font-weight: 800;
}

.donut-legend__item span,
.queue-item__info span,
.record-card__info span,
.recommendation-item p,
.feedback-card__meta,
.viz-note,
.support-item p,
.upload-zone__drop p,
.preview-highlight p {
  font-size: 0.82rem;
  color: var(--ink-soft);
  line-height: 1.65;
}

.queue-list,
.record-list,
.feedback-list,
.support-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item,
.record-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(76, 125, 255, 0.08);
}

.queue-item__icon,
.record-card__icon {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(76, 125, 255, 0.14), rgba(139, 92, 246, 0.1));
  color: var(--accent-deep);
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
}

.queue-item__info,
.record-card__info {
  flex: 1;
  min-width: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 800;
  white-space: nowrap;
}

.status-badge[data-status='completed'] {
  color: #0f8d73;
  background: rgba(35, 195, 178, 0.12);
}

.status-badge[data-status='draft'] {
  color: #6b46c1;
  background: rgba(139, 92, 246, 0.12);
}

.status-badge[data-status='iterating'] {
  color: var(--accent-deep);
  background: rgba(76, 125, 255, 0.12);
}

.generator-layout {
  display: grid;
  grid-template-columns: 0.94fr 1.06fr;
  gap: 20px;
}

.form-card__desc {
  margin: 10px 0 22px;
  color: var(--ink-soft);
  font-size: 0.88rem;
  line-height: 1.72;
}

.form-card label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--ink-soft);
  font-size: 0.82rem;
  font-weight: 800;
}

.form-card input,
.form-card select,
.history-toolbar input,
.feedback-card textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  font-size: 0.92rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-card input::placeholder,
.history-toolbar input::placeholder,
.feedback-card textarea::placeholder {
  color: #97a4b8;
}

.form-card input:focus,
.form-card select:focus,
.history-toolbar input:focus,
.feedback-card textarea:focus {
  border-color: rgba(76, 125, 255, 0.4);
  box-shadow: 0 0 0 4px rgba(76, 125, 255, 0.08);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 18px;
}

.chip-row__chip {
  padding: 8px 12px;
  border: 1px solid rgba(76, 125, 255, 0.1);
  border-radius: 999px;
  background: rgba(76, 125, 255, 0.06);
  color: var(--accent-deep);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary,
.btn-secondary,
.record-card__delete,
.pager button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s, background 0.2s;
}

.btn-primary {
  padding: 13px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #16233c, #4168f5);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  box-shadow: 0 16px 28px rgba(49, 86, 211, 0.18);
}

.btn-primary:hover:not(:disabled),
.btn-secondary:hover,
.pager button:hover:not(:disabled),
.record-card__delete:hover {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 0.82rem;
  font-weight: 800;
}

.preview-card {
  overflow: hidden;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(238, 245, 255, 0.95));
}

.preview-card__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink-muted);
  font-size: 0.74rem;
}

.preview-card__chrome span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.preview-card__chrome span:nth-child(1) {
  background: #ff7d7d;
}

.preview-card__chrome span:nth-child(2) {
  background: #f5c55a;
}

.preview-card__chrome span:nth-child(3) {
  background: #39cc9f;
}

.preview-card__chrome em {
  margin-left: auto;
  font-style: normal;
}

.preview-card__body {
  padding: 22px;
}

.preview-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.preview-card__head h3 {
  margin: 10px 0 6px;
  font-size: 1.26rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.preview-card__head p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.84rem;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.ai-badge i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 0 rgba(76, 125, 255, 0.35);
}

.ai-badge--active i {
  animation: pulse 1.4s infinite;
}

.preview-highlight,
.feedback-card__tips,
.support-item {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.84);
}

.preview-highlight {
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid rgba(76, 125, 255, 0.08);
}

.preview-highlight strong,
.feedback-card__tips span {
  display: inline-flex;
  margin-bottom: 6px;
  color: var(--accent-deep);
  font-size: 0.78rem;
  font-weight: 800;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(76, 125, 255, 0.08);
}

.recommendation-item span,
.support-item span {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 0.76rem;
  font-weight: 800;
  flex-shrink: 0;
}

.support-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.support-item {
  display: flex;
  gap: 14px;
  padding: 16px;
}

.upload-zone__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 20px;
  border: 1.5px dashed rgba(76, 125, 255, 0.24);
  border-radius: 20px;
  background: rgba(76, 125, 255, 0.04);
  cursor: pointer;
  text-align: center;
}

.upload-zone__drop strong {
  font-size: 0.92rem;
}

.upload-zone__icon {
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 1.6rem;
  font-weight: 300;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  font-size: 0.85rem;
}

.file-item button {
  border: 0;
  background: none;
  color: var(--ink-muted);
  cursor: pointer;
}

.viz-card--flow {
  background:
    radial-gradient(circle at top right, rgba(76, 125, 255, 0.1), transparent 28%),
    rgba(248, 251, 255, 0.82);
}

.mini-flow {
  width: 100%;
  height: 164px;
  display: block;
  margin-top: 16px;
}

.record-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-pill {
  padding: 18px;
}

.summary-pill span {
  display: block;
  font-size: 0.76rem;
  color: var(--ink-muted);
}

.summary-pill strong {
  display: block;
  margin-top: 8px;
  font-size: 1.52rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.history-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.history-toolbar input {
  max-width: 320px;
}

.pager {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pager button,
.record-card__delete {
  padding: 9px 14px;
  border-radius: 12px;
  background: rgba(76, 125, 255, 0.08);
  color: var(--accent-deep);
  font-size: 0.82rem;
  font-weight: 800;
}

.pager button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pager span {
  color: var(--ink-muted);
  font-size: 0.82rem;
}

.feedback-card__head,
.feedback-card__actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.feedback-card__meta {
  margin-top: 8px;
}

.feedback-card__tips {
  margin: 18px 0 14px;
  padding: 14px 16px;
  border: 1px solid rgba(76, 125, 255, 0.08);
}

.feedback-card textarea {
  min-height: 112px;
  resize: vertical;
}

.feedback-card__actions {
  justify-content: flex-end;
  margin-top: 14px;
}

.empty-state {
  padding: 56px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
  color: var(--ink-muted);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 200;
  padding: 12px 22px;
  border-radius: 999px;
  background: #16233c;
  color: #fff;
  font-size: 0.86rem;
  font-weight: 700;
  box-shadow: 0 16px 32px rgba(22, 35, 60, 0.24);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.28s, transform 0.28s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.sidebar-overlay {
  display: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 125, 255, 0.35);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(76, 125, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(76, 125, 255, 0);
  }
}

@media (max-width: 1200px) {
  .overview-stage,
  .insight-grid,
  .generator-layout,
  .record-summary,
  .insight-grid--simple {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s var(--ease-out);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1;
    background: rgba(15, 23, 42, 0.28);
  }

  .main {
    padding: 12px;
  }

  .main__body {
    min-height: auto;
    padding: 18px 16px;
    border-radius: 22px;
  }

  .mobile-only {
    display: inline-flex;
  }

  .metric-grid,
  .moment-grid,
  .record-summary,
  .line-chart__labels {
    grid-template-columns: 1fr;
  }

  .history-toolbar,
  .feedback-card__head,
  .feedback-card__actions,
  .preview-card__head {
    flex-direction: column;
    align-items: stretch;
  }

  .history-toolbar input {
    max-width: none;
  }

  .record-card,
  .queue-item {
    flex-wrap: wrap;
  }
}
</style>
