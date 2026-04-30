import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API 오류 (${res.status})`)
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Users ───────────────────────────────────────
export const getMe = () => apiFetch('/api/v1/users/me')

export const updateMe = (body) =>
  apiFetch('/api/v1/users/me', { method: 'PATCH', body: JSON.stringify(body) })

export const saveApiKey = (api_key) =>
  apiFetch('/api/v1/users/me/api-key', { method: 'POST', body: JSON.stringify({ api_key }) })

// ── Experiences ─────────────────────────────────
export const getExperiences = (tags = []) => {
  const params = tags.length ? '?' + tags.map(t => `tags=${encodeURIComponent(t)}`).join('&') : ''
  return apiFetch(`/api/v1/experiences${params}`)
}

export const createExperience = (body) =>
  apiFetch('/api/v1/experiences', { method: 'POST', body: JSON.stringify(body) })

export const updateExperience = (id, body) =>
  apiFetch(`/api/v1/experiences/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteExperience = (id) =>
  apiFetch(`/api/v1/experiences/${id}`, { method: 'DELETE' })

// ── Chats ────────────────────────────────────────
export const createChat = (body) =>
  apiFetch('/api/v1/chats', { method: 'POST', body: JSON.stringify(body) })

export const getChats = () => apiFetch('/api/v1/chats')

export const getChat = (chatId) => apiFetch(`/api/v1/chats/${chatId}`)

export const deleteChat = (chatId) =>
  apiFetch(`/api/v1/chats/${chatId}`, { method: 'DELETE' })

export const addMessage = (chatId, content) =>
  apiFetch(`/api/v1/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ content }) })

export const sendChatMessage = (chatId, content) =>
  apiFetch(`/api/v1/chats/${chatId}/chat`, { method: 'POST', body: JSON.stringify({ content }) })

// ── Artifacts ────────────────────────────────────
export const getArtifacts = (agentType) => {
  const params = agentType ? `?agent_type=${encodeURIComponent(agentType)}` : ''
  return apiFetch(`/api/v1/artifacts${params}`)
}

export const getArtifact = (id) => apiFetch(`/api/v1/artifacts/${id}`)

// ── Agents ───────────────────────────────────────
export const runCompanyAnalyze = (body) =>
  apiFetch('/api/v1/agents/company-analyze', { method: 'POST', body: JSON.stringify(body) })

export const runQuestionAnalyze = (body) =>
  apiFetch('/api/v1/agents/question-analyze', { method: 'POST', body: JSON.stringify(body) })

export const runEssayWriter = (body) =>
  apiFetch('/api/v1/agents/essay-writer', { method: 'POST', body: JSON.stringify(body) })
