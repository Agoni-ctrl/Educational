const STORAGE_KEY = 'zhike-features-history'

const SEED_HISTORY = [
  {
    id: 'h1',
    type: 'ppt',
    title: '牛顿第二定律 · PPT课件',
    subject: '高中物理',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 1,
    pages: 18,
  },
  {
    id: 'h2',
    type: 'doc',
    title: '牛顿第二定律 · 教案',
    subject: '高中物理',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 2,
    pages: 6,
  },
  {
    id: 'h3',
    type: 'interactive',
    title: '力的分解 · 教学题生成',
    subject: '高中物理',
    status: 'draft',
    createdAt: Date.now() - 86400000 * 3,
    pages: 4,
  },
  {
    id: 'h4',
    type: 'ppt',
    title: '鸦片战争 · 导入课件',
    subject: '初中历史',
    status: 'iterating',
    createdAt: Date.now() - 86400000 * 5,
    pages: 12,
  },
]

const TYPE_LABELS = {
  ppt: '课件生成',
  doc: '教案生成',
  interactive: '教学题生成',
  animation: '知识动画',
}

const STATUS_LABELS = {
  completed: '已完成',
  draft: '待完善',
  iterating: '优化中',
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
      interactive: list.filter((h) => h.type === 'interactive').length,
    }
  }

  function addRecord({ type, title, subject, status = 'draft', pages = 0 }) {
    const record = {
      id: uid(),
      type,
      title,
      subject: subject || '未分类',
      status,
      createdAt: Date.now(),
      pages,
    }
    const list = loadHistory()
    list.unshift(record)
    saveHistory(list)
    return record
  }

  function updateRecord(id, patch) {
    const list = loadHistory()
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return null

    list[index] = {
      ...list[index],
      ...patch,
    }
    saveHistory(list)
    return list[index]
  }

  function deleteRecord(id) {
    saveHistory(loadHistory().filter((h) => h.id !== id))
  }

  return {
    getHistory,
    getStats,
    addRecord,
    updateRecord,
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
    ppt: 'PPT',
    doc: 'DOC',
    interactive: 'QUIZ',
    animation: 'ANI',
  }
  return icons[type] || 'GEN'
}
