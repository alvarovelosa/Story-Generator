import { useState, useEffect } from 'react';
import { cardsAPI } from '../services/api';
import useStore from '../store/useStore';
import CardItem from './CardItem';

function CardLibrary({ onCardSelect, mode = 'builder' }) {
  const { cards, setCards } = useStore();
  const [filter, setFilter] = useState({ type: 'all', rarity: 'all', source: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await cardsAPI.getAll();
      setCards(response.data.data);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (card && (card.source === 'system' || card.source === 'default')) {
      alert('System and default cards cannot be deleted.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await cardsAPI.delete(cardId);
      useStore.getState().removeCard(cardId);
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert(error.response?.data?.error || 'Failed to delete card');
    }
  };

  const filteredCards = cards.filter(card => {
    if (filter.type !== 'all' && card.type !== filter.type) return false;
    if (filter.rarity !== 'all' && card.rarity !== filter.rarity) return false;
    if (filter.source !== 'all' && card.source !== filter.source) return false;
    return true;
  });

  const cardTypes = ['all', 'Character', 'Location', 'World', 'Time', 'Mood'];
  const rarities = ['all', 'Common', 'Bronze', 'Silver', 'Gold'];
  const sources = ['all', 'user', 'system', 'default', 'auto_generated'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Card Library</h2>
        <div className="text-sm text-gray-400">
          {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 items-center">
        <div>
          <label className="text-sm text-gray-400 mr-2">Type:</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cardTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mr-2">Rarity:</label>
          <select
            value={filter.rarity}
            onChange={(e) => setFilter(prev => ({ ...prev, rarity: e.target.value }))}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'All Rarities' : rarity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mr-2">Source:</label>
          <select
            value={filter.source}
            onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sources.map(source => (
              <option key={source} value={source}>
                {source === 'all' ? 'All Sources' : source === 'auto_generated' ? 'Auto' : source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No cards found. Create your first card to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardSelect && onCardSelect(card)}
              onDelete={mode === 'builder' ? handleDelete : null}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CardLibrary;
