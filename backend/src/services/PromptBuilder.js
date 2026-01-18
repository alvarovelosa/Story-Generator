class PromptBuilder {
  constructor() {
    this.baseInstructions = `You are an interactive storytelling AI. Your role is to create an engaging, immersive narrative experience.

Guidelines:
- Respond to the player's actions with vivid, descriptive prose
- Stay consistent with the established world, characters, and events
- Allow player agency - their choices should matter
- Keep responses focused and around 150-250 words
- End with a clear situation that invites player action
- Never break character or acknowledge you're an AI`;
  }

  buildSystemPrompt(activeCards, storyMemory = null) {
    let prompt = this.baseInstructions + '\n\n';

    if (!activeCards || activeCards.length === 0) {
      return prompt + '\nBegin an open-ended adventure based on the player\'s first action.';
    }

    // Sort cards by priority
    const moodCards = activeCards.filter(c => c.type === 'Mood');
    const worldCards = activeCards.filter(c => c.type === 'World');
    const locationCards = activeCards.filter(c => c.type === 'Location');
    const timeCards = activeCards.filter(c => c.type === 'Time');
    const characterCards = activeCards.filter(c => c.type === 'Character');

    // Build prompt in priority order
    if (moodCards.length > 0) {
      prompt += '\n=== TONE & ATMOSPHERE ===\n';
      prompt += moodCards.map(c => this.getCardPromptText(c)).join('\n\n');
    }

    if (worldCards.length > 0) {
      prompt += '\n\n=== WORLD RULES & LORE ===\n';
      prompt += worldCards.map(c => this.getCardPromptText(c)).join('\n\n');
    }

    if (locationCards.length > 0 || timeCards.length > 0) {
      prompt += '\n\n=== CURRENT SCENE ===\n';
      if (locationCards.length > 0) {
        prompt += 'Location:\n';
        prompt += locationCards.map(c => this.getCardPromptText(c)).join('\n\n');
      }
      if (timeCards.length > 0) {
        prompt += '\n\nTime:\n';
        prompt += timeCards.map(c => this.getCardPromptText(c)).join('\n\n');
      }
    }

    if (characterCards.length > 0) {
      prompt += '\n\n=== CHARACTERS IN SCENE ===\n';
      prompt += characterCards.map(c => {
        const text = this.getCardPromptText(c);
        const possession = c.possession_state ? ' (traveling with player)' : '';
        return `${c.name}${possession}:\n${text}`;
      }).join('\n\n');
    }

    // Add story memory if provided
    if (storyMemory && storyMemory.buildMemoryPrompt) {
      prompt += '\n' + storyMemory.buildMemoryPrompt();
    }

    return prompt;
  }

  getCardPromptText(card) {
    // Return prompt text based on knowledge level
    // For now, return full text. Later we'll implement progressive reveal
    return card.prompt_text;
  }

  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  getTokenReport(systemPrompt, activeCards) {
    return {
      total: this.estimateTokens(systemPrompt),
      breakdown: {
        baseInstructions: this.estimateTokens(this.baseInstructions),
        cards: activeCards.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          tokens: this.estimateTokens(c.prompt_text)
        }))
      }
    };
  }
}

export default PromptBuilder;
