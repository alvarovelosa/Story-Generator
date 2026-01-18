import { useState, useEffect } from 'react';
import { cardsAPI, sessionsAPI } from '../services/api';

const TYPE_ICONS = {
  'Character': '👤',
  'Location': '📍',
  'World': '🌍',
  'Time': '⏰',
  'Mood': '🎭'
};

function ActiveCardsPanel({ sessionId, activeCardIds = [], onCardsChange }) {
  const [allCards, setAllCards] = useState([]);
  const [activeCards, setActiveCards] = useState([]);
  const [showCardSelector, setShowCardSelector] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    updateActiveCards();
  }, [activeCardIds, allCards]);

  const loadCards = async () => {
    try {
      const response = await cardsAPI.getAll();
      setAllCards(response.data.data);
    } catch (error) {
      console.error('Failed to load cards:', error);
    }
  };

  const updateActiveCards = () => {
    const active = allCards.filter(card => activeCardIds.includes(card.id));
    setActiveCards(active);
  };

  const handleActivateCard = async (cardId) => {
    try {
      await sessionsAPI.activateCard(sessionId, cardId);
      const updatedIds = [...activeCardIds, cardId];
      onCardsChange(updatedIds);
    } catch (error) {
      console.error('Failed to activate card:', error);
    }
  };

  const handleDeactivateCard = async (cardId) => {
    try {
      await sessionsAPI.deactivateCard(sessionId, cardId);
      const updatedIds = activeCardIds.filter(id => id !== cardId);
      onCardsChange(updatedIds);
    } catch (error) {
      console.error('Failed to deactivate card:', error);
    }
  };

  const availableCards = allCards.filter(card => !activeCardIds.includes(card.id));

  return (
    <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Active Cards</h2>
        <p className="text-xs text-gray-400 mt-1">
          {activeCards.length} card{activeCards.length !== 1 ? 's' : ''} active
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeCards.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            No active cards.<br />
            Click below to add cards.
          </div>
        ) : (
          activeCards.map(card => (
            <div
              key={card.id}
              className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{TYPE_ICONS[card.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{card.name}</div>
                    <div className="text-xs text-gray-400">{card.type}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeactivateCard(card.id)}
                  className="text-red-400 hover:text-red-300 text-sm ml-2"
                  title="Deactivate card"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowCardSelector(!showCardSelector)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition"
        >
          {showCardSelector ? 'Hide Cards' : '+ Add Cards'}
        </button>

        {showCardSelector && (
          <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
            {availableCards.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">
                All cards are active
              </div>
            ) : (
              availableCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleActivateCard(card.id)}
                  className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-2 text-left transition"
                >
                  <div className="flex items-center space-x-2">
                    <span>{TYPE_ICONS[card.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{card.name}</div>
                      <div className="text-xs text-gray-400">{card.type} • {card.rarity}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveCardsPanel;
