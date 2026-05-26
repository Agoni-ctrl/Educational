import { reactive } from 'vue'

const STORAGE_KEY = 'zhike-community-data'

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
      '牛顿第二定律实验，想加入可拖拽的交互组件。智课 Agent 能直接生成吗？还是需要额外工具配合？',
    author: '李老师',
    createdAt: Date.now() - 86400000 * 4,
    likes: 36,
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
    comments: [],
  },
]

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return {
    posts: structuredClone(SEED_POSTS),
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
