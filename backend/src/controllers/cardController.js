import Card from '../models/Card.js';

export const getAllCards = async (req, res) => {
  try {
    const cards = await Card.getAll();
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCardById = async (req, res) => {
  try {
    const card = await Card.getById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCardsByType = async (req, res) => {
  try {
    const cards = await Card.getByType(req.params.type);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCardsByRarity = async (req, res) => {
  try {
    const cards = await Card.getByRarity(req.params.rarity);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNestedCards = async (req, res) => {
  try {
    const cards = await Card.getNestedCards(req.params.parentId);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTopLevelCards = async (req, res) => {
  try {
    const cards = await Card.getTopLevelCards();
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCard = async (req, res) => {
  try {
    const { name, type, rarity, prompt_text, parent_card_id } = req.body;

    if (!name || !type || !rarity || !prompt_text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, rarity, prompt_text'
      });
    }

    const validTypes = ['Character', 'Location', 'World', 'Time', 'Mood'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validRarities = ['Common', 'Bronze', 'Silver', 'Gold'];
    if (!validRarities.includes(rarity)) {
      return res.status(400).json({
        success: false,
        error: `Invalid rarity. Must be one of: ${validRarities.join(', ')}`
      });
    }

    const card = await Card.create({ name, type, rarity, prompt_text, parent_card_id });
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const card = await Card.update(req.params.id, req.body);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    await Card.delete(req.params.id);
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Card.getAllTags();
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCardsByTag = async (req, res) => {
  try {
    const cards = await Card.getByTag(req.params.tag);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addTag = async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ success: false, error: 'Tag is required' });
    }
    const card = await Card.addTag(parseInt(req.params.id), tag);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeTag = async (req, res) => {
  try {
    const card = await Card.removeTag(parseInt(req.params.id), req.params.tag);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Parents (multi-parent DAG)
export const getParents = async (req, res) => {
  try {
    const card = await Card.getById(parseInt(req.params.id));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    const parents = await Card.getCardsByIds(card.parent_card_ids || []);
    res.json({ success: true, data: parents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addParent = async (req, res) => {
  try {
    const { parentId } = req.body;
    if (!parentId) {
      return res.status(400).json({ success: false, error: 'parentId is required' });
    }
    const card = await Card.addParent(parseInt(req.params.id), parseInt(parentId));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    if (error.message.includes('cycle')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeParent = async (req, res) => {
  try {
    const card = await Card.removeParent(parseInt(req.params.id), parseInt(req.params.parentId));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAncestors = async (req, res) => {
  try {
    const maxDepth = parseInt(req.query.maxDepth) || 10;
    const ancestors = await Card.getAncestors(parseInt(req.params.id), maxDepth);
    res.json({ success: true, data: ancestors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDescendants = async (req, res) => {
  try {
    const maxDepth = parseInt(req.query.maxDepth) || 10;
    const descendants = await Card.getDescendants(parseInt(req.params.id), maxDepth);
    res.json({ success: true, data: descendants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Links
export const getLinkedCards = async (req, res) => {
  try {
    const card = await Card.getById(parseInt(req.params.id));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    const linkedCards = await Card.getCardsByIds(card.linked_card_ids || []);
    res.json({ success: true, data: linkedCards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addLink = async (req, res) => {
  try {
    const { linkedCardId } = req.body;
    if (!linkedCardId) {
      return res.status(400).json({ success: false, error: 'linkedCardId is required' });
    }
    const card = await Card.addLink(parseInt(req.params.id), parseInt(linkedCardId));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeLink = async (req, res) => {
  try {
    const card = await Card.removeLink(parseInt(req.params.id), parseInt(req.params.linkedCardId));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Triggers
export const addTrigger = async (req, res) => {
  try {
    const { trigger } = req.body;
    if (!trigger) {
      return res.status(400).json({ success: false, error: 'trigger object is required' });
    }
    const card = await Card.addTrigger(parseInt(req.params.id), trigger);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTrigger = async (req, res) => {
  try {
    const { trigger } = req.body;
    if (!trigger) {
      return res.status(400).json({ success: false, error: 'trigger object is required' });
    }
    const card = await Card.updateTrigger(
      parseInt(req.params.id),
      parseInt(req.params.index),
      trigger
    );
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeTrigger = async (req, res) => {
  try {
    const card = await Card.removeTrigger(parseInt(req.params.id), parseInt(req.params.index));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// System Cards
export const getSystemCards = async (req, res) => {
  try {
    const cards = await Card.getSystemCards();
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCardsBySource = async (req, res) => {
  try {
    const cards = await Card.getBySource(req.params.source);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clone card (creates editable copy of any card)
export const cloneCard = async (req, res) => {
  try {
    const { name } = req.body; // Optional custom name
    const clonedCard = await Card.clone(parseInt(req.params.id), { name });
    if (!clonedCard) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.status(201).json({ success: true, data: clonedCard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Increment usage stats
export const incrementUsage = async (req, res) => {
  try {
    const card = await Card.incrementUsage(parseInt(req.params.id));
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
