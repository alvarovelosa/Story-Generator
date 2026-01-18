import { useState } from 'react';
import { cardsAPI } from '../services/api';
import useStore from '../store/useStore';

const CARD_TYPES = ['Character', 'Location', 'World', 'Time', 'Mood'];
const RARITIES = ['Common', 'Bronze', 'Silver', 'Gold'];

function CardEditor({ cardToEdit, onClose, onSave }) {
  const { addCard, updateCard } = useStore();

  const [formData, setFormData] = useState({
    name: cardToEdit?.name || '',
    type: cardToEdit?.type || 'Character',
    rarity: cardToEdit?.rarity || 'Bronze',
    prompt_text: cardToEdit?.prompt_text || '',
    parent_card_id: cardToEdit?.parent_card_id || null
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (cardToEdit) {
        // Update existing card
        const response = await cardsAPI.update(cardToEdit.id, formData);
        updateCard(cardToEdit.id, response.data.data);
      } else {
        // Create new card
        const response = await cardsAPI.create(formData);
        addCard(response.data.data);
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'Common': 'text-rarity-common border-rarity-common',
      'Bronze': 'text-rarity-bronze border-rarity-bronze',
      'Silver': 'text-rarity-silver border-rarity-silver',
      'Gold': 'text-rarity-gold border-rarity-gold'
    };
    return colors[rarity] || colors['Common'];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 ${getRarityColor(formData.rarity)}">
      <h2 className="text-2xl font-bold mb-6">
        {cardToEdit ? 'Edit Card' : 'Create New Card'}
      </h2>

      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter card name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CARD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rarity</label>
            <select
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RARITIES.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Prompt Text
            <span className="text-gray-400 text-xs ml-2">
              (This text will be injected into the story prompt)
            </span>
          </label>
          <textarea
            name="prompt_text"
            value={formData.prompt_text}
            onChange={handleChange}
            required
            rows={8}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter the prompt text that describes this card..."
          />
          <div className="text-xs text-gray-400 mt-1">
            Character count: {formData.prompt_text.length}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : (cardToEdit ? 'Update Card' : 'Create Card')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CardEditor;
