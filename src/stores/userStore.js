import { reactive } from 'vue'

const STORAGE_KEY = 'zhike-user-profile'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { name: '测试用户', avatar: null, subject: '', grade: '' }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const state = reactive(load())

export function useUserStore() {
  function getAvatar() {
    return state.avatar || null
  }

  function getName() {
    return state.name || ''
  }

  function getSubject() {
    return state.subject || ''
  }

  function getGrade() {
    return state.grade || ''
  }

  function setSubject(subject) {
    state.subject = subject || ''
    save({ name: state.name, avatar: state.avatar, subject: state.subject, grade: state.grade })
  }

  function setGrade(grade) {
    state.grade = grade || ''
    save({ name: state.name, avatar: state.avatar, subject: state.subject, grade: state.grade })
  }

  function updateProfile(data) {
    Object.assign(state, data)
    save({ name: state.name, avatar: state.avatar, subject: state.subject, grade: state.grade })
  }

  return { state, getAvatar, getName, getSubject, getGrade, setSubject, setGrade, updateProfile }
}
