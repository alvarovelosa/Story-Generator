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
  create: (cardData) => api.post('/cards', cardData),
  update: (id, cardData) => api.put(`/cards/${id}`, cardData),
  delete: (id) => api.delete(`/cards/${id}`)
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

export default api;
