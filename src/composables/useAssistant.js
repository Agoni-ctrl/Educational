const STORAGE_KEY = 'zhike-assistant-sessions'
const ACTIVE_KEY = 'zhike-assistant-active'
const DEFAULT_API_URL = 'http://127.0.0.1:5005/chat'

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
  const normalized = text.trim().replace(/\s+/g, ' ')
  return normalized.length > 18 ? `${normalized.slice(0, 18)}...` : normalized || '新对话'
}

function resolveApiUrl() {
  return import.meta.env.VITE_ASSISTANT_API_URL || DEFAULT_API_URL
}

function normalizeHistory(messages) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
}

function extractReply(data) {
  if (typeof data === 'string') {
    return { content: data, model: '' }
  }

  const content =
    data?.reply ||
    data?.message ||
    data?.content ||
    data?.answer ||
    data?.data?.reply ||
    data?.data?.content ||
    ''

  return {
    content,
    model: data?.model || data?.data?.model || '',
  }
}

function tryParseStructuredChunk(rawChunk) {
  const text = rawChunk.trim()
  if (!text) return null

  if (text === '[DONE]') {
    return { done: true, delta: '', model: '' }
  }

  try {
    const data = JSON.parse(text)
    const delta =
      data?.delta ??
      data?.content ??
      data?.reply ??
      data?.message ??
      data?.answer ??
      data?.choices?.[0]?.delta?.content ??
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      ''

    return {
      done: Boolean(data?.done || data?.choices?.[0]?.finish_reason),
      delta: typeof delta === 'string' ? delta : '',
      model: data?.model || '',
    }
  } catch {
    return {
      done: false,
      delta: text,
      model: '',
    }
  }
}

async function consumeStream(response, handlers = {}) {
  const reader = response.body?.getReader()
  if (!reader) {
    const data = await response.json()
    if (data?.success === false) {
      throw new Error(data?.error || 'AI 接口返回失败')
    }
    const parsed = extractReply(data)
    handlers.onChunk?.(parsed.content, parsed)
    return parsed
  }

  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let fullText = ''
  let model = ''

  const emitParsed = (parsed) => {
    if (!parsed || parsed.done) return
    if (parsed.model) model = parsed.model
    if (parsed.delta) {
      fullText += parsed.delta
      handlers.onChunk?.(fullText, {
        content: fullText,
        delta: parsed.delta,
        model,
      })
    }
  }

  const flushLine = (line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    if (trimmed.startsWith('data:')) {
      emitParsed(tryParseStructuredChunk(trimmed.slice(5)))
      return
    }

    emitParsed(tryParseStructuredChunk(trimmed))
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''

    for (const line of lines) {
      flushLine(line)
    }
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    flushLine(buffer)
  }

  if (!fullText) {
    throw new Error('AI 流式接口未返回有效内容')
  }

  return { content: fullText, model }
}

export async function sendToAssistantApi(messages, handlers = {}) {
  const response = await fetch(resolveApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: [...messages].reverse().find((item) => item.role === 'user')?.content || '',
      history: normalizeHistory(messages),
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI 接口请求失败：${response.status}`)
  }

  return consumeStream(response, handlers)
}

export function useAssistant() {
  let activeId = loadActiveId()

  function getSessions() {
    return [...loadSessions()].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  }

  function getActiveSession() {
    const list = loadSessions()
    if (!activeId) return null
    return list.find((session) => session.id === activeId) || null
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
    const index = list.findIndex((item) => item.id === session.id)
    if (index >= 0) {
      session.updatedAt = Date.now()
      list[index] = session
      saveSessions(list)
    }
  }

  function deleteSession(id) {
    const list = loadSessions().filter((session) => session.id !== id)
    saveSessions(list)
    if (activeId === id) {
      activeId = list[0]?.id || null
      saveActiveId(activeId)
    }
  }

  function appendLocalAssistantMessage(sessionId, content, extra = {}) {
    const list = loadSessions()
    const index = list.findIndex((session) => session.id === sessionId)
    if (index < 0) return null

    const message = {
      id: uid('m'),
      role: 'assistant',
      content,
      createdAt: Date.now(),
      ...extra,
    }

    list[index].messages.push(message)
    list[index].updatedAt = Date.now()
    saveSessions(list)
    return message
  }

  function updateMessage(sessionId, messageId, updater) {
    const list = loadSessions()
    const sessionIndex = list.findIndex((session) => session.id === sessionId)
    if (sessionIndex < 0) return null

    const messageIndex = list[sessionIndex].messages.findIndex((message) => message.id === messageId)
    if (messageIndex < 0) return null

    const current = list[sessionIndex].messages[messageIndex]
    const next = typeof updater === 'function' ? updater({ ...current }) : { ...current, ...updater }

    list[sessionIndex].messages[messageIndex] = next
    list[sessionIndex].updatedAt = Date.now()
    saveSessions(list)
    return next
  }

  async function sendMessage(content, handlers = {}) {
    const text = content.trim()
    if (!text) return null

    const session = ensureSession()
    const userMessage = {
      id: uid('m'),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }

    session.messages.push(userMessage)

    if (session.messages.filter((message) => message.role === 'user').length === 1) {
      session.title = titleFromMessage(text)
    }
    updateSession(session)

    const aiMessage = {
      id: uid('m'),
      role: 'assistant',
      content: '',
      model: '',
      createdAt: Date.now(),
      isStreaming: true,
    }

    session.messages.push(aiMessage)
    updateSession(session)
    handlers.onStart?.({ session, userMessage, aiMessage })

    const reply = await sendToAssistantApi(session.messages, {
      onChunk(fullText, payload) {
        updateMessage(session.id, aiMessage.id, (message) => ({
          ...message,
          content: fullText,
          model: payload?.model || message.model || '',
          isStreaming: true,
        }))
        handlers.onChunk?.(fullText, payload)
      },
    })

    const finalMessage = updateMessage(session.id, aiMessage.id, (message) => ({
      ...message,
      content: reply.content,
      model: reply.model || message.model || '',
      isStreaming: false,
    }))

    handlers.onComplete?.(reply)

    return { session, userMessage, aiMessage: finalMessage }
  }

  function groupSessionsByDate(sessionList) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const groups = { today: [], yesterday: [], earlier: [] }

    for (const session of sessionList) {
      const current = new Date(session.updatedAt)
      current.setHours(0, 0, 0, 0)
      if (current.getTime() === today.getTime()) groups.today.push(session)
      else if (current.getTime() === yesterday.getTime()) groups.yesterday.push(session)
      else groups.earlier.push(session)
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
    appendLocalAssistantMessage,
    updateMessage,
    sendMessage,
    groupSessionsByDate,
  }
}

export function formatSessionTime(ts) {
  const date = new Date(ts)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
