import Card from '../models/Card.js';

/**
 * PromptBuilder - Builds system prompts with focus-based loading and compression
 *
 * The focus-based system loads cards based on story context:
 * - Focus card: Loaded at full detail
 * - Ancestors: Compressed to essence (~50-100 tokens each)
 * - Siblings: Listed as available but not loaded
 * - Multi-parent paths: Compressed non-focus paths
 */
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

    // Token budget settings
    this.maxPromptTokens = 4000;
    this.compressionTargetTokens = 75; // Target for compressed card essence
  }

  /**
   * Build system prompt with focus-based loading
   * @param {Array} activeCards - All active cards in session
   * @param {number|null} focusCardId - ID of the current focus card
   * @param {Object} storyMemory - Story memory state
   * @returns {string} - Complete system prompt
   */
  async buildSystemPrompt(activeCards, focusCardId = null, storyMemory = null) {
    let prompt = this.baseInstructions + '\n\n';

    if (!activeCards || activeCards.length === 0) {
      return prompt + '\nBegin an open-ended adventure based on the player\'s first action.';
    }

    // Determine focus card
    const focusCard = focusCardId
      ? activeCards.find(c => c.id === focusCardId)
      : this.determineFocusCard(activeCards);

    // If we have a focus card, use focus-based loading
    if (focusCard) {
      prompt += await this.buildFocusBasedPrompt(activeCards, focusCard);
    } else {
      // Fallback to standard loading
      prompt += this.buildStandardPrompt(activeCards);
    }

    // Add story memory if provided
    if (storyMemory?.memorySummary) {
      prompt += '\n\n=== STORY MEMORY ===\n' + storyMemory.memorySummary;
    }

    // Add available cards reference
    const availableCards = await this.getAvailableCards(activeCards, focusCard);
    if (availableCards.length > 0) {
      prompt += '\n\n=== AVAILABLE (not currently in focus) ===\n';
      prompt += availableCards.map(c => `[${c.type}] ${c.name}`).join(', ');
    }

    return prompt;
  }

  /**
   * Determine which card should be the focus based on context
   */
  determineFocusCard(activeCards) {
    // Priority: Location > Character > Time > World > Mood
    const priorities = ['Location', 'Character', 'Time', 'World', 'Mood'];

    for (const type of priorities) {
      const card = activeCards.find(c => c.type === type);
      if (card) return card;
    }

    return activeCards[0] || null;
  }

  /**
   * Build prompt with focus-based loading
   */
  async buildFocusBasedPrompt(activeCards, focusCard) {
    let prompt = '';

    // Get the hierarchy context
    const ancestors = await this.getAncestorChain(focusCard);
    const siblings = await this.getSiblings(focusCard, activeCards);

    // Sort remaining active cards by type
    const moodCards = activeCards.filter(c => c.type === 'Mood' && c.id !== focusCard.id);
    const worldCards = activeCards.filter(c => c.type === 'World' && c.id !== focusCard.id);

    // Add mood context (always full, sets tone)
    if (moodCards.length > 0) {
      prompt += '=== TONE & ATMOSPHERE ===\n';
      prompt += moodCards.map(c => this.getCardPromptText(c)).join('\n\n');
      prompt += '\n\n';
    }

    // Add world rules (compressed if not in focus chain)
    if (worldCards.length > 0) {
      prompt += '=== WORLD RULES ===\n';
      prompt += worldCards.map(c => {
        if (ancestors.some(a => a.id === c.id)) {
          return this.compressToEssence(c);
        }
        return this.getCardPromptText(c);
      }).join('\n\n');
      prompt += '\n\n';
    }

    // Add ancestor context (compressed)
    if (ancestors.length > 0) {
      prompt += '=== CONTEXT (inherited) ===\n';
      for (const ancestor of ancestors) {
        const essence = this.compressToEssence(ancestor);
        prompt += `[${ancestor.type}] ${ancestor.name}: ${essence}\n`;
      }
      prompt += '\n';
    }

    // Add focus card (full detail)
    prompt += '=== CURRENT FOCUS ===\n';
    prompt += `[${focusCard.type}] ${focusCard.name}\n`;
    prompt += this.getCardPromptText(focusCard);
    prompt += '\n\n';

    // Add active cards not in hierarchy (standard detail)
    const otherActive = activeCards.filter(c =>
      c.id !== focusCard.id &&
      !ancestors.some(a => a.id === c.id) &&
      c.type !== 'Mood' &&
      c.type !== 'World'
    );

    if (otherActive.length > 0) {
      prompt += '=== ALSO PRESENT ===\n';
      for (const card of otherActive) {
        prompt += `[${card.type}] ${card.name}:\n`;
        prompt += this.getCardPromptText(card) + '\n\n';
      }
    }

    return prompt;
  }

  /**
   * Build standard prompt (no focus-based loading)
   */
  buildStandardPrompt(activeCards) {
    let prompt = '';

    // Sort cards by priority
    const moodCards = activeCards.filter(c => c.type === 'Mood');
    const worldCards = activeCards.filter(c => c.type === 'World');
    const locationCards = activeCards.filter(c => c.type === 'Location');
    const timeCards = activeCards.filter(c => c.type === 'Time');
    const characterCards = activeCards.filter(c => c.type === 'Character');

    // Build prompt in priority order
    if (moodCards.length > 0) {
      prompt += '=== TONE & ATMOSPHERE ===\n';
      prompt += moodCards.map(c => this.getCardPromptText(c)).join('\n\n');
      prompt += '\n\n';
    }

    if (worldCards.length > 0) {
      prompt += '=== WORLD RULES & LORE ===\n';
      prompt += worldCards.map(c => this.getCardPromptText(c)).join('\n\n');
      prompt += '\n\n';
    }

    if (locationCards.length > 0 || timeCards.length > 0) {
      prompt += '=== CURRENT SCENE ===\n';
      if (locationCards.length > 0) {
        prompt += 'Location:\n';
        prompt += locationCards.map(c => this.getCardPromptText(c)).join('\n\n');
      }
      if (timeCards.length > 0) {
        prompt += '\n\nTime:\n';
        prompt += timeCards.map(c => this.getCardPromptText(c)).join('\n\n');
      }
      prompt += '\n\n';
    }

    if (characterCards.length > 0) {
      prompt += '=== CHARACTERS IN SCENE ===\n';
      prompt += characterCards.map(c => {
        const text = this.getCardPromptText(c);
        const possession = c.possession_state ? ' (traveling with player)' : '';
        return `${c.name}${possession}:\n${text}`;
      }).join('\n\n');
    }

    return prompt;
  }

  /**
   * Get the ancestor chain for a card (following parent_card_ids)
   */
  async getAncestorChain(card, maxDepth = 5) {
    const ancestors = [];
    const visited = new Set([card.id]);
    let current = card;
    let depth = 0;

    while (depth < maxDepth && current.parent_card_ids?.length > 0) {
      // Get the first parent (primary path)
      const parentId = current.parent_card_ids[0];
      if (visited.has(parentId)) break;

      try {
        const parent = await Card.getById(parentId);
        if (!parent) break;

        visited.add(parentId);
        ancestors.unshift(parent); // Add to front (root first)
        current = parent;
        depth++;
      } catch {
        break;
      }
    }

    return ancestors;
  }

  /**
   * Get sibling cards (same parent)
   */
  async getSiblings(focusCard, activeCards) {
    if (!focusCard.parent_card_ids?.length) {
      // Top-level card, no siblings
      return [];
    }

    const siblings = [];
    const focusParentIds = new Set(focusCard.parent_card_ids);

    for (const card of activeCards) {
      if (card.id === focusCard.id) continue;
      if (!card.parent_card_ids?.length) continue;

      // Check if shares a parent
      const hasCommonParent = card.parent_card_ids.some(pid => focusParentIds.has(pid));
      if (hasCommonParent) {
        siblings.push(card);
      }
    }

    return siblings;
  }

  /**
   * Get cards that are available but not loaded (for reference)
   */
  async getAvailableCards(activeCards, focusCard) {
    if (!focusCard) return [];

    const focusAncestors = await this.getAncestorChain(focusCard);
    const focusAncestorIds = new Set(focusAncestors.map(a => a.id));

    // Cards that share ancestry but aren't directly in focus
    const available = [];

    try {
      const allCards = await Card.getAll();
      for (const card of allCards) {
        if (activeCards.some(ac => ac.id === card.id)) continue; // Already active
        if (card.id === focusCard.id) continue;

        // Check if card is a sibling or cousin (shares ancestor)
        if (card.parent_card_ids?.some(pid => focusAncestorIds.has(pid))) {
          available.push(card);
        }
      }
    } catch (err) {
      console.error('Failed to get available cards:', err);
    }

    return available.slice(0, 5); // Limit to 5 for prompt size
  }

  /**
   * Compress a card's content to its essence (~50-100 tokens)
   */
  compressToEssence(card) {
    // If card has a pre-computed compressed_prompt, use it
    if (card.compressed_prompt) {
      return card.compressed_prompt;
    }

    // Otherwise, do basic compression
    const text = card.prompt_text || '';

    // If already short, return as-is
    if (text.length <= 200) {
      return text;
    }

    // Extract first paragraph or first 200 chars
    const firstPara = text.split('\n\n')[0];
    if (firstPara.length <= 200) {
      return firstPara;
    }

    // Truncate with ellipsis
    return text.substring(0, 197) + '...';
  }

  /**
   * Get card prompt text
   */
  getCardPromptText(card) {
    return card.prompt_text || '';
  }

  /**
   * Estimate token count
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil((text || '').length / 4);
  }

  /**
   * Get token report for debugging
   */
  getTokenReport(systemPrompt, activeCards) {
    return {
      total: this.estimateTokens(systemPrompt),
      breakdown: {
        baseInstructions: this.estimateTokens(this.baseInstructions),
        cards: (activeCards || []).map(c => ({
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
