import Session from '../models/Session.js';

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.getAll();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await Session.getById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const { name } = req.body;
    const session = await Session.create(name);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await Session.update(req.params.id, req.body);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    await Session.delete(req.params.id);
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const activateCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const session = await Session.addActiveCard(req.params.id, cardId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deactivateCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const session = await Session.removeActiveCard(req.params.id, cardId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
