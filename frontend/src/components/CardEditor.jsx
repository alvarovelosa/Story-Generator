import { useState, useEffect } from 'react';
import { cardsAPI } from '../services/api';
import useStore from '../store/useStore';

const CARD_TYPES = ['Character', 'Location', 'World', 'Time', 'Mood'];
const RARITIES = ['Common', 'Bronze', 'Silver', 'Gold'];
const TRIGGER_TYPES = ['on_mention', 'on_activate', 'on_quest_complete', 'on_turn'];
const TRIGGER_ACTIONS = ['activate_card', 'add_to_prompt', 'notify', 'run_script'];

function CardEditor({ cardToEdit, onClose, onSave }) {
  const { addCard, updateCard, cards } = useStore();

  // Check if card is a system card (read-only)
  const isSystemCard = cardToEdit?.source === 'system';
  const isDefaultCard = cardToEdit?.source === 'default';
  const isReadOnly = isSystemCard || isDefaultCard;

  const [formData, setFormData] = useState({
    name: cardToEdit?.name || '',
    type: cardToEdit?.type || 'Character',
    rarity: cardToEdit?.rarity || 'Bronze',
    prompt_text: cardToEdit?.prompt_text || '',
    parent_card_ids: cardToEdit?.parent_card_ids || [],
    tags: cardToEdit?.tags || [],
    triggers: cardToEdit?.triggers || [],
    linked_card_ids: cardToEdit?.linked_card_ids || []
  });

  const [saving, setSaving] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeSection, setActiveSection] = useState('basic'); // basic, tags, triggers, links, parents

  // Load all existing tags for autocomplete
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await cardsAPI.getAllTags();
        setAllTags(response.data.data || []);
      } catch (err) {
        console.error('Failed to load tags:', err);
      }
    };
    loadTags();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Tags management
  const handleAddTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      if (!allTags.includes(trimmedTag)) {
        setAllTags(prev => [...prev, trimmedTag]);
      }
    }
    setNewTag('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredTagSuggestions = allTags.filter(
    tag => tag.includes(newTag.toLowerCase()) && !formData.tags.includes(tag)
  );

  // Triggers management
  const handleAddTrigger = () => {
    const newTrigger = {
      type: 'on_mention',
      condition: '',
      action: 'activate_card',
      target: null
    };
    setFormData(prev => ({ ...prev, triggers: [...prev.triggers, newTrigger] }));
  };

  const handleUpdateTrigger = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.map((trigger, i) =>
        i === index ? { ...trigger, [field]: value } : trigger
      )
    }));
  };

  const handleRemoveTrigger = (index) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }));
  };

  // Linked cards management
  const handleToggleLinkedCard = (cardId) => {
    setFormData(prev => ({
      ...prev,
      linked_card_ids: prev.linked_card_ids.includes(cardId)
        ? prev.linked_card_ids.filter(id => id !== cardId)
        : [...prev.linked_card_ids, cardId]
    }));
  };

  // Parent cards management (multi-parent DAG)
  const handleToggleParent = (cardId) => {
    setFormData(prev => ({
      ...prev,
      parent_card_ids: prev.parent_card_ids.includes(cardId)
        ? prev.parent_card_ids.filter(id => id !== cardId)
        : [...prev.parent_card_ids, cardId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return; // Prevent submission for read-only cards

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

  // Clone card to create an editable copy
  const handleClone = async () => {
    if (!cardToEdit) return;

    setError(null);
    setCloning(true);

    try {
      const response = await cardsAPI.clone(cardToEdit.id);
      addCard(response.data.data);

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clone card');
    } finally {
      setCloning(false);
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

  // Filter out current card from available cards for linking/parenting
  const availableCards = cards.filter(c => c.id !== cardToEdit?.id);

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'tags', label: 'Tags', count: formData.tags.length },
    { id: 'triggers', label: 'Triggers', count: formData.triggers.length },
    { id: 'links', label: 'Links', count: formData.linked_card_ids.length },
    { id: 'parents', label: 'Parents', count: formData.parent_card_ids.length }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {cardToEdit ? (isReadOnly ? 'View Card' : 'Edit Card') : 'Create New Card'}
        </h2>
        {cardToEdit && (
          <div className="flex items-center gap-2">
            {isSystemCard && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                SYSTEM
              </span>
            )}
            {isDefaultCard && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                DEFAULT
              </span>
            )}
            {cardToEdit.source === 'auto_generated' && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                AUTO
              </span>
            )}
          </div>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-200 p-3 rounded mb-4">
          <p className="text-sm">
            <strong>{isSystemCard ? 'System' : 'Default'} cards are read-only.</strong>{' '}
            Clone this card to create an editable copy.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-700 pb-3">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {section.label}
            {section.count !== undefined && section.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-600 rounded-full">
                {section.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info Section */}
        {activeSection === 'basic' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getRarityColor(formData.rarity)} ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                disabled={isReadOnly}
                rows={8}
                className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="Enter the prompt text that describes this card..."
              />
              <div className="text-xs text-gray-400 mt-1">
                Character count: {formData.prompt_text.length}
              </div>
            </div>
          </>
        )}

        {/* Tags Section */}
        {activeSection === 'tags' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <p className="text-gray-400 text-xs mb-3">
                Add tags to categorize and filter cards. Tags enable quick filtering in the library.
              </p>

              {/* Current tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {formData.tags.length === 0 && (
                  <span className="text-gray-500 text-sm">No tags added</span>
                )}
              </div>

              {/* Add new tag */}
              <div className="relative">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTag);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a tag and press Enter..."
                />

                {/* Tag suggestions */}
                {showTagSuggestions && newTag && filteredTagSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredTagSuggestions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-600 text-sm"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Triggers Section */}
        {activeSection === 'triggers' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Triggers</label>
              <p className="text-gray-400 text-xs mb-3">
                Define conditions that activate this card or trigger actions during story generation.
              </p>

              {/* Existing triggers */}
              <div className="space-y-3 mb-4">
                {formData.triggers.map((trigger, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-md border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400">Trigger #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrigger(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Type</label>
                        <select
                          value={trigger.type}
                          onChange={(e) => handleUpdateTrigger(index, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-sm"
                        >
                          {TRIGGER_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Action</label>
                        <select
                          value={trigger.action}
                          onChange={(e) => handleUpdateTrigger(index, 'action', e.target.value)}
                          className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-sm"
                        >
                          {TRIGGER_ACTIONS.map(action => (
                            <option key={action} value={action}>{action}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="block text-xs text-gray-400 mb-1">Condition</label>
                      <input
                        type="text"
                        value={trigger.condition}
                        onChange={(e) => handleUpdateTrigger(index, 'condition', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-sm"
                        placeholder="e.g., 'player enters forest' or keyword pattern"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target Card (optional)</label>
                      <select
                        value={trigger.target || ''}
                        onChange={(e) => handleUpdateTrigger(index, 'target', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-sm"
                      >
                        <option value="">None</option>
                        {availableCards.map(card => (
                          <option key={card.id} value={card.id}>{card.name} ({card.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {formData.triggers.length === 0 && (
                  <p className="text-gray-500 text-sm">No triggers defined</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddTrigger}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition"
              >
                + Add Trigger
              </button>
            </div>
          </div>
        )}

        {/* Linked Cards Section */}
        {activeSection === 'links' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Linked Cards</label>
              <p className="text-gray-400 text-xs mb-3">
                Link related cards together. Links are bidirectional references for navigation.
              </p>

              {/* Selected linked cards */}
              <div className="mb-4">
                <h4 className="text-xs text-gray-400 mb-2">Currently Linked ({formData.linked_card_ids.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.linked_card_ids.map(id => {
                    const linkedCard = cards.find(c => c.id === id);
                    return linkedCard ? (
                      <span
                        key={id}
                        className="inline-flex items-center px-2.5 py-1 bg-purple-600 text-white text-sm rounded"
                      >
                        {linkedCard.name}
                        <button
                          type="button"
                          onClick={() => handleToggleLinkedCard(id)}
                          className="ml-1.5 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                  {formData.linked_card_ids.length === 0 && (
                    <span className="text-gray-500 text-sm">No linked cards</span>
                  )}
                </div>
              </div>

              {/* Available cards to link */}
              <div className="max-h-60 overflow-y-auto bg-gray-700 rounded-md border border-gray-600">
                {availableCards.filter(c => !formData.linked_card_ids.includes(c.id)).map(card => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleToggleLinkedCard(card.id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-600 flex items-center justify-between border-b border-gray-600 last:border-b-0"
                  >
                    <span className="text-sm">{card.name}</span>
                    <span className="text-xs text-gray-400">{card.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Parent Cards Section (Multi-Parent DAG) */}
        {activeSection === 'parents' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parent Cards</label>
              <p className="text-gray-400 text-xs mb-3">
                A card can have multiple parents (DAG structure). Children inherit context from all parents.
              </p>

              {/* Selected parent cards */}
              <div className="mb-4">
                <h4 className="text-xs text-gray-400 mb-2">Current Parents ({formData.parent_card_ids.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.parent_card_ids.map(id => {
                    const parentCard = cards.find(c => c.id === id);
                    return parentCard ? (
                      <span
                        key={id}
                        className="inline-flex items-center px-2.5 py-1 bg-amber-600 text-white text-sm rounded"
                      >
                        {parentCard.name}
                        <button
                          type="button"
                          onClick={() => handleToggleParent(id)}
                          className="ml-1.5 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                  {formData.parent_card_ids.length === 0 && (
                    <span className="text-gray-500 text-sm">No parent cards (top-level)</span>
                  )}
                </div>
              </div>

              {/* Available cards to set as parent */}
              <div className="max-h-60 overflow-y-auto bg-gray-700 rounded-md border border-gray-600">
                {availableCards.filter(c => !formData.parent_card_ids.includes(c.id)).map(card => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleToggleParent(card.id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-600 flex items-center justify-between border-b border-gray-600 last:border-b-0"
                  >
                    <span className="text-sm">{card.name}</span>
                    <span className="text-xs text-gray-400">{card.type} • {card.rarity}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Cycle detection: The system prevents creating circular parent-child relationships.
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
          )}
          {isReadOnly ? (
            <button
              type="button"
              onClick={handleClone}
              disabled={cloning}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition disabled:opacity-50"
            >
              {cloning ? 'Cloning...' : 'Clone to Edit'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : (cardToEdit ? 'Update Card' : 'Create Card')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CardEditor;
