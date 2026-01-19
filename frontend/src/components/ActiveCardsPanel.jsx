import { useState, useEffect } from 'react';
import { cardsAPI, sessionsAPI } from '../services/api';

const TYPE_ICONS = {
  'Character': '👤',
  'Location': '📍',
  'World': '🌍',
  'Time': '⏰',
  'Mood': '🎭'
};

const RARITY_COLORS = {
  'Common': 'border-l-gray-400',
  'Bronze': 'border-l-amber-600',
  'Silver': 'border-l-gray-300',
  'Gold': 'border-l-yellow-400'
};

function ActiveCardsPanel({ sessionId, activeCardIds = [], onCardsChange }) {
  const [allCards, setAllCards] = useState([]);
  const [activeCards, setActiveCards] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

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
    if (activeCardIds.includes(cardId)) return; // Already active
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

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const cardData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (cardData && cardData.id) {
        handleActivateCard(cardData.id);
      }
    } catch (error) {
      console.error('Failed to process dropped card:', error);
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-gray-800 border-l border-gray-700 transition-colors ${
        isDragOver ? 'bg-blue-900/20 border-blue-500' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-base font-semibold">Active Cards</h3>
        <p className="text-xs text-gray-400">
          {activeCards.length} card{activeCards.length !== 1 ? 's' : ''} active
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {activeCards.length === 0 ? (
          <div className={`text-center py-8 text-sm border-2 border-dashed rounded-lg transition-colors ${
            isDragOver ? 'border-blue-500 text-blue-400' : 'border-gray-600 text-gray-400'
          }`}>
            {isDragOver ? (
              'Drop card here'
            ) : (
              <>
                Drop cards here<br />
                <span className="text-xs">or use + Add Cards below</span>
              </>
            )}
          </div>
        ) : (
          activeCards.map(card => (
            <div
              key={card.id}
              className={`flex items-center justify-between px-3 py-2 bg-gray-700 border-l-4 ${RARITY_COLORS[card.rarity]} rounded hover:bg-gray-600 transition`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm">{TYPE_ICONS[card.type]}</span>
                <span className="font-medium text-sm truncate">{card.name}</span>
              </div>
              <button
                onClick={() => handleDeactivateCard(card.id)}
                className="text-red-400 hover:text-red-300 text-sm ml-2 flex-shrink-0"
                title="Deactivate card"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {isDragOver && activeCards.length > 0 && (
        <div className="mx-2 mb-2 py-3 text-center text-sm border-2 border-dashed border-blue-500 rounded-lg text-blue-400 bg-blue-900/20">
          Drop to add card
        </div>
      )}

      <div className="p-2 border-t border-gray-700 text-xs text-gray-500 text-center">
        Drag from Card Library to add
      </div>
    </div>
  );
}

export default ActiveCardsPanel;
