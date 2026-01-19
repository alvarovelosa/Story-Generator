import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cards API
export const cardsAPI = {
  getAll: () => api.get('/cards'),
  getById: (id) => api.get(`/cards/${id}`),
  getByType: (type) => api.get(`/cards/type/${type}`),
  getByRarity: (rarity) => api.get(`/cards/rarity/${rarity}`),
  getTopLevel: () => api.get('/cards/top-level'),
  getNested: (parentId) => api.get(`/cards/nested/${parentId}`),
  getSystemCards: () => api.get('/cards/system'),
  getBySource: (source) => api.get(`/cards/source/${source}`),
  create: (cardData) => api.post('/cards', cardData),
  update: (id, cardData) => api.put(`/cards/${id}`, cardData),
  delete: (id) => api.delete(`/cards/${id}`),
  clone: (id, name) => api.post(`/cards/${id}/clone`, { name }),
  incrementUsage: (id) => api.post(`/cards/${id}/usage`),

  // Tags
  getAllTags: () => api.get('/cards/tags/all'),
  getByTag: (tag) => api.get(`/cards/tag/${tag}`),
  addTag: (id, tag) => api.post(`/cards/${id}/tags`, { tag }),
  removeTag: (id, tag) => api.delete(`/cards/${id}/tags/${tag}`),

  // Parents (multi-parent DAG)
  getParents: (id) => api.get(`/cards/${id}/parents`),
  addParent: (id, parentId) => api.post(`/cards/${id}/parents`, { parentId }),
  removeParent: (id, parentId) => api.delete(`/cards/${id}/parents/${parentId}`),
  getAncestors: (id, maxDepth = 10) => api.get(`/cards/${id}/ancestors`, { params: { maxDepth } }),
  getDescendants: (id, maxDepth = 10) => api.get(`/cards/${id}/descendants`, { params: { maxDepth } }),

  // Links
  getLinkedCards: (id) => api.get(`/cards/${id}/links`),
  addLink: (id, linkedCardId) => api.post(`/cards/${id}/links`, { linkedCardId }),
  removeLink: (id, linkedCardId) => api.delete(`/cards/${id}/links/${linkedCardId}`),

  // Triggers
  addTrigger: (id, trigger) => api.post(`/cards/${id}/triggers`, { trigger }),
  updateTrigger: (id, index, trigger) => api.put(`/cards/${id}/triggers/${index}`, { trigger }),
  removeTrigger: (id, index) => api.delete(`/cards/${id}/triggers/${index}`)
};

// Sessions API
export const sessionsAPI = {
  getAll: () => api.get('/sessions'),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (name) => api.post('/sessions', { name }),
  update: (id, sessionData) => api.put(`/sessions/${id}`, sessionData),
  delete: (id) => api.delete(`/sessions/${id}`),
  activateCard: (sessionId, cardId) => api.post(`/sessions/${sessionId}/activate-card`, { cardId }),
  deactivateCard: (sessionId, cardId) => api.post(`/sessions/${sessionId}/deactivate-card`, { cardId })
};

// Story API
export const storyAPI = {
  generateTurn: (sessionId, playerInput) => api.post('/story/turn', { sessionId, playerInput }),
  getHistory: (sessionId) => api.get(`/story/history/${sessionId}`),
  getSystemPrompt: (sessionId) => api.get(`/story/prompt/${sessionId}`)
};

// Settings API
export const settingsAPI = {
  getLLMConfig: () => api.get('/settings/llm'),
  updateLLMConfig: (config) => api.put('/settings/llm', config),
  testLLMConnection: (config) => api.post('/settings/llm/test', config),
  getLLMModels: (provider) => api.get('/settings/llm/models', { params: { provider } }),
  getLLMProviders: () => api.get('/settings/llm/providers')
};

// Scripts API
export const scriptsAPI = {
  getAll: () => api.get('/scripts'),
  update: (name, settings) => api.put(`/scripts/${name}`, settings),
  getLogs: (params = {}) => api.get('/scripts/logs', { params }),
  clearLogs: () => api.delete('/scripts/logs')
};

export default api;
