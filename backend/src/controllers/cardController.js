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
