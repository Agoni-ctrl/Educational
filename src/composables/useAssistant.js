const STORAGE_KEY = 'zhike-assistant-sessions'
const ACTIVE_KEY = 'zhike-assistant-active'

const MOCK_REPLIES = [
  '好的，我先帮您梳理一下教学思路。请问这节课的核心知识点是什么？学生的基础水平如何？',
  '根据您的描述，我建议采用「情境导入 → 概念建构 → 实验探究 → 应用巩固」的四段式结构。需要我展开每一部分的详细设计吗？',
  '我可以为您生成 PPT 大纲和 Word 教案初稿。您是否已有参考资料（PDF/Word）需要融合？',
  '课堂互动方面，可以考虑：① 快速投票检验理解 ② 小组讨论案例 ③ 拖拽排序知识点。您更倾向哪种形式？',
  '您的教学目标表述可以更具体一些。建议加上可观测的行为动词，例如「学生能够运用公式解决…类型的问题」。',
]

function uid(prefix = 's') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || null
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function saveActiveId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
}

function titleFromMessage(text) {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > 18 ? `${t.slice(0, 18)}…` : t || '新对话'
}

function mockReply(userText) {
  const lower = userText.toLowerCase()
  if (lower.includes('ppt') || lower.includes('课件')) {
    return '我来帮您规划课件结构。请告诉我：① 学科与课题 ② 课时长度 ③ 是否需要实验或互动环节。如果有参考 PDF，也可以描述其排版风格偏好。'
  }
  if (lower.includes('互动') || lower.includes('游戏')) {
    return '互动设计是亮点！请说明学生年龄段和课堂环境（是否有多媒体）。我可以推荐：情境问答、拖拽排序、限时挑战等小活动，并生成对应的 AI 动画创意脚本。'
  }
  if (lower.includes('教案') || lower.includes('pdf')) {
    return '多模态参考融合已就绪。请描述您希望从参考资料中提取哪些内容（知识结构、案例、排版风格等），我会据此调整生成策略。'
  }
  return MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
}

/** 预留通义 API 接入点 */
export async function sendToTongyi(messages) {
  // TODO: 接入通义千问 API
  // const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) })
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
  return mockReply(lastUser?.content || '')
}

export function useAssistant() {
  const sessions = loadSessions()
  let activeId = loadActiveId()

  function getSessions() {
    return [...loadSessions()].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  function getActiveSession() {
    const list = loadSessions()
    if (!activeId) return null
    return list.find((s) => s.id === activeId) || null
  }

  function setActive(id) {
    activeId = id
    saveActiveId(id)
  }

  function createSession() {
    const session = {
      id: uid('chat'),
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    }
    const list = loadSessions()
    list.unshift(session)
    saveSessions(list)
    setActive(session.id)
    return session
  }

  function ensureSession() {
    let session = getActiveSession()
    if (!session) {
      session = createSession()
    }
    return session
  }

  function updateSession(session) {
    const list = loadSessions()
    const idx = list.findIndex((s) => s.id === session.id)
    if (idx >= 0) {
      session.updatedAt = Date.now()
      list[idx] = session
      saveSessions(list)
    }
  }

  function deleteSession(id) {
    let list = loadSessions().filter((s) => s.id !== id)
    saveSessions(list)
    if (activeId === id) {
      activeId = list[0]?.id || null
      saveActiveId(activeId)
    }
  }

  async function sendMessage(content) {
    const text = content.trim()
    if (!text) return null

    const session = ensureSession()
    const userMsg = { id: uid('m'), role: 'user', content: text, createdAt: Date.now() }
    session.messages.push(userMsg)

    if (session.messages.filter((m) => m.role === 'user').length === 1) {
      session.title = titleFromMessage(text)
    }
    updateSession(session)

    const reply = await sendToTongyi(session.messages)
    const aiMsg = { id: uid('m'), role: 'assistant', content: reply, createdAt: Date.now() }
    session.messages.push(aiMsg)
    updateSession(session)

    return { session, userMsg, aiMsg }
  }

  function groupSessionsByDate(sessionList) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const groups = { today: [], yesterday: [], earlier: [] }

    for (const s of sessionList) {
      const d = new Date(s.updatedAt)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() === today.getTime()) groups.today.push(s)
      else if (d.getTime() === yesterday.getTime()) groups.yesterday.push(s)
      else groups.earlier.push(s)
    }
    return groups
  }

  return {
    getSessions,
    getActiveSession,
    setActive,
    createSession,
    ensureSession,
    deleteSession,
    sendMessage,
    groupSessionsByDate,
  }
}

export function formatSessionTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
