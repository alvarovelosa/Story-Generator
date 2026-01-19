/**
 * StoryMemoryScript - Manages story memory and key events
 *
 * This script tracks important story events, character states,
 * and maintains a compressed memory of the story for context.
 */

import BaseScript from './BaseScript.js';

class StoryMemoryScript extends BaseScript {
  constructor() {
    super();
    this.name = 'story-memory';
    this.description = 'Track and manage story memory and key events';
  }

  async execute(context) {
    const { currentInput, currentResponse, session, storyHistory } = context;
    const events = [];
    const notifications = [];

    // Initialize memory if not present
    let storyMemory = context.storyMemory || {
      keyEvents: [],
      characterStates: {},
      locationHistory: [],
      importantItems: [],
      relationships: {}
    };

    // Extract potential key events from the response
    if (currentResponse) {
      const keyEvent = this._extractKeyEvent(currentResponse);
      if (keyEvent) {
        storyMemory.keyEvents.push({
          event: keyEvent,
          turn: storyHistory?.length || 0,
          timestamp: Date.now()
        });

        // Keep only last 20 key events
        if (storyMemory.keyEvents.length > 20) {
          storyMemory.keyEvents = storyMemory.keyEvents.slice(-20);
        }

        events.push({
          type: 'key_event_recorded',
          event: keyEvent
        });
      }
    }

    // Track mentioned characters
    const characterMentions = this._extractCharacters(currentResponse || '');
    for (const char of characterMentions) {
      if (!storyMemory.characterStates[char]) {
        storyMemory.characterStates[char] = {
          firstMentioned: Date.now(),
          lastMentioned: Date.now(),
          mentionCount: 1
        };
      } else {
        storyMemory.characterStates[char].lastMentioned = Date.now();
        storyMemory.characterStates[char].mentionCount++;
      }
    }

    // Create a compressed summary for long stories
    let memorySummary = null;
    if (storyHistory && storyHistory.length > 10) {
      memorySummary = this._createMemorySummary(storyMemory);
    }

    return {
      events,
      notifications,
      contextUpdates: {
        storyMemory,
        memorySummary
      }
    };
  }

  _extractKeyEvent(text) {
    if (!text) return null;

    // Look for significant phrases that indicate key events
    const keyPhrases = [
      /discovers?\s+that/i,
      /reveals?\s+that/i,
      /decides?\s+to/i,
      /promises?\s+to/i,
      /suddenly/i,
      /finally/i,
      /realizes?\s+that/i,
      /confronts?/i,
      /defeats?/i,
      /dies?|death|killed/i,
      /married?|wedding/i,
      /born|birth/i,
      /war|battle|fight/i
    ];

    for (const phrase of keyPhrases) {
      if (phrase.test(text)) {
        // Extract a short summary around the key phrase
        const match = text.match(new RegExp(`.{0,50}${phrase.source}.{0,50}`, 'i'));
        if (match) {
          return match[0].trim();
        }
      }
    }

    return null;
  }

  _extractCharacters(text) {
    // Simple heuristic: look for capitalized words that might be names
    const words = text.match(/\b[A-Z][a-z]+\b/g) || [];

    // Filter out common non-name words
    const excludeWords = new Set([
      'The', 'This', 'That', 'These', 'Those', 'There', 'Here',
      'What', 'When', 'Where', 'Why', 'How', 'Which', 'Who',
      'Then', 'Now', 'Soon', 'Later', 'Before', 'After',
      'Yes', 'No', 'But', 'And', 'Or', 'So', 'If'
    ]);

    return [...new Set(words.filter(w => !excludeWords.has(w)))];
  }

  _createMemorySummary(memory) {
    const parts = [];

    // Key events summary
    if (memory.keyEvents.length > 0) {
      const recentEvents = memory.keyEvents.slice(-5);
      parts.push('Recent events: ' + recentEvents.map(e => e.event).join('; '));
    }

    // Active characters
    const activeChars = Object.entries(memory.characterStates)
      .sort((a, b) => b[1].mentionCount - a[1].mentionCount)
      .slice(0, 5)
      .map(([name]) => name);

    if (activeChars.length > 0) {
      parts.push('Key characters: ' + activeChars.join(', '));
    }

    return parts.join('\n');
  }
}

export default StoryMemoryScript;
