import { create } from 'zustand';

const useStore = create((set) => ({
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
  clearError: () => set({ error: null })
}));

export default useStore;
