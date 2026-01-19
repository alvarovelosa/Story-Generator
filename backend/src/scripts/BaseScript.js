/**
 * BaseScript - Abstract base class for all scripts
 *
 * All scripts must extend this class and implement the execute method.
 * Scripts receive the story context and can return updates, events,
 * new cards, and other modifications.
 */

class BaseScript {
  constructor() {
    this.name = 'base';
    this.description = 'Base script class';
  }

  /**
   * Execute the script with the given context
   * @param {Object} context - The story context containing:
   *   - session: Current session data
   *   - activeCards: Array of active cards
   *   - storyHistory: Array of story turns
   *   - currentInput: Player's current input
   *   - currentResponse: AI's response (if available)
   * @returns {Object} - Script output containing:
   *   - contextUpdates: Object to merge into context
   *   - events: Array of events fired
   *   - cardsToActivate: Array of card IDs to activate
   *   - cardsToDeactivate: Array of card IDs to deactivate
   *   - newCards: Array of new card data to create
   *   - notifications: Array of UI notifications
   */
  async execute(context) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Helper to check if text contains a keyword (case-insensitive)
   */
  containsKeyword(text, keyword) {
    if (!text || !keyword) return false;
    return text.toLowerCase().includes(keyword.toLowerCase());
  }

  /**
   * Helper to extract keywords from text
   */
  extractKeywords(text, keywords) {
    if (!text) return [];
    const lower = text.toLowerCase();
    return keywords.filter(kw => lower.includes(kw.toLowerCase()));
  }
}

export default BaseScript;
