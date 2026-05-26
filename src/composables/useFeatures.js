const STORAGE_KEY = 'zhike-features-history'

const SEED_HISTORY = [
  {
    id: 'h1',
    type: 'ppt',
    title: '牛顿第二定律 · PPT 课件',
    subject: '高中物理',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 1,
    pages: 18,
  },
  {
    id: 'h2',
    type: 'doc',
    title: '牛顿第二定律 · Word 教案',
    subject: '高中物理',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 2,
    pages: 6,
  },
  {
    id: 'h3',
    type: 'interactive',
    title: '力的分解 · 互动小游戏创意',
    subject: '高中物理',
    status: 'draft',
    createdAt: Date.now() - 86400000 * 3,
    pages: 1,
  },
  {
    id: 'h4',
    type: 'ppt',
    title: '鸦片战争 · 历史课导入设计',
    subject: '初中历史',
    status: 'iterating',
    createdAt: Date.now() - 86400000 * 5,
    pages: 12,
  },
]

const TYPE_LABELS = {
  ppt: 'PPT 课件',
  doc: 'Word 教案',
  interactive: '互动创意',
  animation: '知识点动画',
}

const STATUS_LABELS = {
  completed: '已完成',
  draft: '草稿',
  iterating: '迭代中',
  failed: '失败',
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return structuredClone(SEED_HISTORY)
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function uid() {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function useFeatures() {
  const history = loadHistory()

  function getHistory() {
    return [...loadHistory()].sort((a, b) => b.createdAt - a.createdAt)
  }

  function getStats() {
    const list = loadHistory()
    return {
      total: list.length,
      completed: list.filter((h) => h.status === 'completed').length,
      iterating: list.filter((h) => h.status === 'iterating').length,
      ppt: list.filter((h) => h.type === 'ppt').length,
      doc: list.filter((h) => h.type === 'doc').length,
    }
  }

  function addRecord({ type, title, subject, status = 'draft' }) {
    const record = {
      id: uid(),
      type,
      title,
      subject: subject || '未分类',
      status,
      createdAt: Date.now(),
      pages: 0,
    }
    const list = loadHistory()
    list.unshift(record)
    saveHistory(list)
    return record
  }

  function deleteRecord(id) {
    saveHistory(loadHistory().filter((h) => h.id !== id))
  }

  return {
    getHistory,
    getStats,
    addRecord,
    deleteRecord,
    TYPE_LABELS,
    STATUS_LABELS,
  }
}

export function formatFeatureTime(ts) {
  const diff = Date.now() - ts
  const day = 86400000
  if (diff < day) return '今天'
  if (diff < day * 2) return '昨天'
  if (diff < day * 7) return `${Math.floor(diff / day)} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

export function getTypeIcon(type) {
  const icons = {
    ppt: '📊',
    doc: '📝',
    interactive: '🎮',
    animation: '🎬',
  }
  return icons[type] || '📄'
}
