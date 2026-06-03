import { reactive } from 'vue'

const STORAGE_KEY = 'zhike-community-data'

const VISUAL_PRESETS = {
  教学讨论: {
    badge: '教研现场',
    kicker: '课堂问题正在被拆解',
    subtitle: '把真实课堂场景、难点与限制条件说清楚，更容易收到可执行建议。',
    palette: ['#ecf5ff', '#d4e7ff', '#8eb8f4'],
    scene: 'discussion',
    chips: ['真实问题', '同行速答'],
    shots: [
      { label: '场景', value: '课堂导入', tone: 'blue' },
      { label: '目标', value: '问题拆解', tone: 'cyan' },
      { label: '产出', value: '方案共创', tone: 'slate' },
    ],
  },
  课件结构: {
    badge: '真实案例',
    kicker: '课件骨架先搭起来',
    subtitle: '从导入、讲授、练习到板书，把课堂节奏和知识梯度一并排清楚。',
    palette: ['#f3f7fd', '#dfeafb', '#aec6e6'],
    scene: 'spotlight',
    chips: ['PPT 结构', '节奏设计'],
    shots: [
      { label: '导入', value: '冲突感', tone: 'blue' },
      { label: '讲授', value: '问题链', tone: 'cyan' },
      { label: '作业', value: '迁移练', tone: 'slate' },
    ],
  },
  互动设计: {
    badge: '课堂互动',
    kicker: '把环节做得可参与',
    subtitle: '适合投票、演示动画、小组协作与追问链设计的互动型内容结构。',
    palette: ['#f5f8ff', '#dfe9fb', '#97d5f2'],
    scene: 'interface',
    chips: ['互动脚本', '演示动画'],
    shots: [
      { label: '提问', value: '先猜想', tone: 'blue' },
      { label: '演示', value: '可交互', tone: 'cyan' },
      { label: '反馈', value: '即点评', tone: 'green' },
    ],
  },
  多模态参考: {
    badge: '资料融合',
    kicker: '图片和文档一起用',
    subtitle: '适合 PDF、图片、表格和校本模板混合输入后的统一编排与风格对齐。',
    palette: ['#f7f9fd', '#e3ebf8', '#b7cbea'],
    scene: 'document',
    chips: ['PDF', '图片', '模板'],
    shots: [
      { label: '输入', value: 'PDF / 图片', tone: 'blue' },
      { label: '抽取', value: '知识点', tone: 'cyan' },
      { label: '输出', value: '统一风格', tone: 'slate' },
    ],
  },
  'AI 提示词': {
    badge: '提示词库',
    kicker: '把 AI 调教得更懂课堂',
    subtitle: '适合沉淀追问模板、角色设定、输出格式约束和评价标准。',
    palette: ['#f5f8ff', '#e7edff', '#b9c7ff'],
    scene: 'prompt',
    chips: ['Prompt', '输出约束'],
    shots: [
      { label: '角色', value: '教研员', tone: 'blue' },
      { label: '格式', value: '表格化', tone: 'cyan' },
      { label: '标准', value: '可复制', tone: 'slate' },
    ],
  },
}

function createVisual(tag, title, content = '') {
  const preset = VISUAL_PRESETS[tag] || VISUAL_PRESETS.教学讨论
  return {
    badge: preset.badge,
    kicker: preset.kicker,
    headline: title,
    subtitle: preset.subtitle || content.slice(0, 36),
    palette: preset.palette,
    scene: preset.scene,
    chips: preset.chips,
    shots: preset.shots,
  }
}

function normalizePost(post) {
  return {
    ...post,
    comments: Array.isArray(post.comments) ? post.comments : [],
    media: post.media || createVisual(post.tag, post.title, post.content),
  }
}

const SEED_POSTS = [
  {
    id: 'p1',
    tag: '课件结构',
    title: '如何设计「先破后立」的历史课导入？',
    content:
      '我在讲《鸦片战争》时想让学生先有认知冲突，再引入新课。大家有没有比较好的导入案例或 AI 提示词模板？',
    author: '王老师',
    createdAt: Date.now() - 86400000 * 2,
    likes: 42,
    media: createVisual(
      '课件结构',
      '历史导入案例拆解',
      '把“认知冲突”转成课堂导入画面与问题链。'
    ),
    comments: [
      {
        id: 'c1',
        author: '李老师',
        content: '可以试试用「假如你是当时的一名商人」角色扮演开场，学生参与度会高很多。',
        createdAt: Date.now() - 86400000,
        likes: 8,
      },
      {
        id: 'c2',
        author: '陈老师',
        content: '我用 AI 生成了一个对比表格，展示战前中英贸易数据，效果还不错。',
        createdAt: Date.now() - 43200000,
        likes: 5,
      },
    ],
  },
  {
    id: 'p2',
    tag: '互动设计',
    title: '物理实验课怎样用 AI 生成可交互演示动画？',
    content:
      '牛顿第二定律实验，想加入可拖拽的交互组件。知启灵枢 能直接生成吗？还是需要额外工具配合？',
    author: '李老师',
    createdAt: Date.now() - 86400000 * 4,
    likes: 36,
    media: createVisual(
      '互动设计',
      '物理实验互动看板',
      '把拖拽、演示和追问链拆成一张可执行的互动脚本。'
    ),
    comments: [
      {
        id: 'c3',
        author: '张老师',
        content: '建议先在对话里把实验步骤和交互逻辑描述清楚，再让智能体生成动画创意脚本。',
        createdAt: Date.now() - 86400000 * 3,
        likes: 12,
      },
    ],
  },
  {
    id: 'p3',
    tag: '多模态参考',
    title: '上传 PDF 教案后，怎样让排版风格保持一致？',
    content:
      '上传了学校统一模板的 PDF 教案，但生成的 PPT 字体和配色总是不一致，有什么好的参考描述方式？',
    author: '张老师',
    createdAt: Date.now() - 86400000 * 6,
    likes: 58,
    media: createVisual(
      '多模态参考',
      '统一排版风格预览',
      '同一份教案素材在 PPT 与 Word 中保持一致的版式语言。'
    ),
    comments: [],
  },
]

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        posts: (parsed.posts || []).map(normalizePost),
        likedIds: parsed.likedIds || [],
        favoriteIds: parsed.favoriteIds || [],
        likedCommentIds: parsed.likedCommentIds || [],
      }
    }
  } catch {
    /* ignore */
  }
  return {
    posts: structuredClone(SEED_POSTS).map(normalizePost),
    likedIds: [],
    favoriteIds: [],
    likedCommentIds: [],
  }
}

const state = reactive(loadData())

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      posts: state.posts,
      likedIds: state.likedIds,
      favoriteIds: state.favoriteIds,
      likedCommentIds: state.likedCommentIds,
    })
  )
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function useCommunity() {
  function isLiked(postId) {
    return state.likedIds.includes(postId)
  }

  function isFavorite(postId) {
    return state.favoriteIds.includes(postId)
  }

  function isCommentLiked(commentId) {
    return state.likedCommentIds.includes(commentId)
  }

  function toggleLike(postId) {
    const post = state.posts.find((p) => p.id === postId)
    if (!post) return false

    const idx = state.likedIds.indexOf(postId)
    if (idx >= 0) {
      state.likedIds.splice(idx, 1)
      post.likes = Math.max(0, post.likes - 1)
      persist()
      return false
    }

    state.likedIds.push(postId)
    post.likes += 1
    persist()
    return true
  }

  function toggleFavorite(postId) {
    const idx = state.favoriteIds.indexOf(postId)
    if (idx >= 0) {
      state.favoriteIds.splice(idx, 1)
      persist()
      return false
    }
    state.favoriteIds.push(postId)
    persist()
    return true
  }

  function toggleCommentLike(commentId) {
    let comment = null
    for (const post of state.posts) {
      comment = post.comments?.find((c) => c.id === commentId)
      if (comment) break
    }
    if (!comment) return false

    const idx = state.likedCommentIds.indexOf(commentId)
    if (idx >= 0) {
      state.likedCommentIds.splice(idx, 1)
      comment.likes = Math.max(0, comment.likes - 1)
      persist()
      return false
    }

    state.likedCommentIds.push(commentId)
    comment.likes += 1
    persist()
    return true
  }

  function addComment(postId, content, author = '匿名老师') {
    const post = state.posts.find((p) => p.id === postId)
    if (!post || !content.trim()) return null

    const comment = {
      id: uid('c'),
      author,
      content: content.trim(),
      createdAt: Date.now(),
      likes: 0,
    }
    post.comments.push(comment)
    persist()
    return comment
  }

  function addPost({ tag, title, content, author = '匿名老师' }) {
    if (!title.trim() || !content.trim()) return null

    const post = {
      id: uid('p'),
      tag: tag || '教学讨论',
      title: title.trim(),
      content: content.trim(),
      author,
      createdAt: Date.now(),
      likes: 0,
      comments: [],
      media: createVisual(tag || '教学讨论', title.trim(), content.trim()),
    }
    state.posts.unshift(post)
    persist()
    return post
  }

  function getPosts(filter = 'all') {
    if (filter === 'favorite') {
      return [...state.posts]
        .filter((p) => state.favoriteIds.includes(p.id))
        .sort((a, b) => b.createdAt - a.createdAt)
    }
    if (filter === 'hot') {
      return [...state.posts].sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt)
    }
    return [...state.posts].sort((a, b) => b.createdAt - a.createdAt)
  }

  return {
    state,
    isLiked,
    isFavorite,
    isCommentLiked,
    toggleLike,
    toggleFavorite,
    toggleCommentLike,
    addComment,
    addPost,
    getPosts,
  }
}

export function formatTime(ts) {
  const diff = Date.now() - ts
  const min = 60000
  const hour = 3600000
  const day = 86400000

  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < day * 30) return `${Math.floor(diff / day)} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}
