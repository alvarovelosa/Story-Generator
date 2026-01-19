import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to load favorites from localStorage
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem('modelFavorites');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Helper to save favorites to localStorage
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem('modelFavorites', JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
};

const useStore = create((set, get) => ({
  // Cards state
  cards: [],
  setCards: (cards) => set({ cards }),
  addCard: (card) => set((state) => ({ cards: [card, ...state.cards] })),
  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map(card => card.id === id ? { ...card, ...updates } : card)
  })),
  removeCard: (id) => set((state) => ({
    cards: state.cards.filter(card => card.id !== id)
  })),

  // Current session
  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  // Active cards
  activeCards: [],
  setActiveCards: (cards) => set({ activeCards: cards }),

  // Story history
  storyHistory: [],
  setStoryHistory: (history) => set({ storyHistory: history }),
  addStoryTurn: (turn) => set((state) => ({
    storyHistory: [...state.storyHistory, turn]
  })),

  // UI state
  selectedCard: null,
  setSelectedCard: (card) => set({ selectedCard: card }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Model favorites (persisted to localStorage)
  modelFavorites: loadFavorites(),

  addFavorite: (provider, modelId) => {
    const favorites = get().modelFavorites;
    const providerFavorites = favorites[provider] || [];
    if (!providerFavorites.includes(modelId)) {
      const newFavorites = {
        ...favorites,
        [provider]: [...providerFavorites, modelId]
      };
      saveFavorites(newFavorites);
      set({ modelFavorites: newFavorites });
    }
  },

  removeFavorite: (provider, modelId) => {
    const favorites = get().modelFavorites;
    const providerFavorites = favorites[provider] || [];
    const newFavorites = {
      ...favorites,
      [provider]: providerFavorites.filter(id => id !== modelId)
    };
    saveFavorites(newFavorites);
    set({ modelFavorites: newFavorites });
  },

  isFavorite: (provider, modelId) => {
    const favorites = get().modelFavorites;
    return (favorites[provider] || []).includes(modelId);
  },

  getFavorites: (provider) => {
    const favorites = get().modelFavorites;
    return favorites[provider] || [];
  },

  // Show favorites only toggle
  showFavoritesOnly: false,
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show })
}));

export default useStore;
