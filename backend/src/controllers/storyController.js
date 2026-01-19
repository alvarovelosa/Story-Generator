import Session from '../models/Session.js';
import Card from '../models/Card.js';
import StoryHistory from '../models/StoryHistory.js';
import PromptBuilder from '../services/PromptBuilder.js';
import StoryMemory from '../services/StoryMemory.js';
import llmService from '../services/LLMService.js';

const promptBuilder = new PromptBuilder();

export const generateStoryTurn = async (req, res) => {
  try {
    const { sessionId, playerInput } = req.body;

    if (!sessionId || !playerInput) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and playerInput are required'
      });
    }

    const session = await Session.getById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const activeCards = await Card.getCardsByIds(session.active_cards);
    const storyMemory = StoryMemory.fromJSON(session.story_memory);
    const systemPrompt = await promptBuilder.buildSystemPrompt(activeCards, null, storyMemory);

    const history = await StoryHistory.getBySessionId(sessionId);
    const recentHistory = history.slice(-3).flatMap(h => [
      { role: 'user', content: h.player_input },
      { role: 'assistant', content: h.llm_response }
    ]);

    const { content: llmResponse, usage } = await llmService.generateStoryResponse(
      systemPrompt,
      playerInput,
      recentHistory
    );

    const keyEvent = await llmService.extractKeyEvent(llmResponse);
    storyMemory.addEvent(keyEvent);

    await Session.update(sessionId, {
      story_memory: storyMemory.toJSON()
    });

    const turnNumber = await StoryHistory.getLastTurnNumber(sessionId) + 1;
    await StoryHistory.create({
      session_id: sessionId,
      turn_number: turnNumber,
      player_input: playerInput,
      llm_response: llmResponse,
      system_prompt: systemPrompt,
      token_count: usage.total_tokens
    });

    const tokenReport = promptBuilder.getTokenReport(systemPrompt, activeCards);

    res.json({
      success: true,
      data: {
        response: llmResponse,
        turnNumber,
        tokenUsage: usage,
        tokenReport,
        extractedEvent: keyEvent
      }
    });
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStoryHistory = async (req, res) => {
  try {
    const history = await StoryHistory.getBySessionId(req.params.sessionId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSystemPrompt = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.getById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const activeCards = await Card.getCardsByIds(session.active_cards);
    const storyMemory = StoryMemory.fromJSON(session.story_memory);
    const systemPrompt = await promptBuilder.buildSystemPrompt(activeCards, null, storyMemory);
    const tokenReport = promptBuilder.getTokenReport(systemPrompt, activeCards);

    res.json({
      success: true,
      data: {
        systemPrompt,
        tokenReport,
        activeCardCount: activeCards.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
