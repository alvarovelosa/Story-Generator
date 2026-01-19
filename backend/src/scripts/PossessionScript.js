/**
 * PossessionScript - Tracks items and possessions in the story
 *
 * This script monitors for item acquisition, usage, and loss events,
 * maintaining an inventory of story-relevant objects.
 */

import BaseScript from './BaseScript.js';

class PossessionScript extends BaseScript {
  constructor() {
    super();
    this.name = 'possession-tracking';
    this.description = 'Track items and possessions mentioned in the story';
  }

  async execute(context) {
    const { currentInput, currentResponse, activeCards } = context;
    const events = [];
    const notifications = [];

    // Initialize inventory if not present
    let inventory = context.inventory || {
      items: [],
      currencies: {},
      locations: {}
    };

    const textToScan = [currentInput || '', currentResponse || ''].join(' ');

    // Detect item acquisition
    const acquirePatterns = [
      /(?:receives?|obtains?|finds?|picks?\s*up|takes?|grabs?|gets?)\s+(?:a\s+|an\s+|the\s+)?([a-zA-Z\s]+?)(?:\.|,|!|\?|$)/gi,
      /(?:given|handed|awarded)\s+(?:a\s+|an\s+|the\s+)?([a-zA-Z\s]+?)(?:\.|,|!|\?|$)/gi
    ];

    for (const pattern of acquirePatterns) {
      let match;
      while ((match = pattern.exec(textToScan)) !== null) {
        const itemName = match[1].trim().toLowerCase();
        if (itemName.length > 2 && itemName.length < 30 && !this._isCommonWord(itemName)) {
          if (!inventory.items.find(i => i.name === itemName)) {
            inventory.items.push({
              name: itemName,
              acquired: Date.now(),
              source: 'story'
            });

            events.push({
              type: 'item_acquired',
              item: itemName
            });

            notifications.push({
              type: 'info',
              message: `Item acquired: ${itemName}`
            });
          }
        }
      }
    }

    // Detect item loss/usage
    const losePatterns = [
      /(?:loses?|drops?|gives?\s*away|uses?\s*up|breaks?|destroys?)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\.|,|!|\?|$)/gi
    ];

    for (const pattern of losePatterns) {
      let match;
      while ((match = pattern.exec(textToScan)) !== null) {
        const itemName = match[1].trim().toLowerCase();
        const itemIndex = inventory.items.findIndex(i => i.name === itemName);
        if (itemIndex !== -1) {
          inventory.items.splice(itemIndex, 1);

          events.push({
            type: 'item_lost',
            item: itemName
          });

          notifications.push({
            type: 'warning',
            message: `Item lost: ${itemName}`
          });
        }
      }
    }

    // Detect currency mentions
    const currencyPatterns = [
      /(\d+)\s*(gold|silver|copper|coins?|dollars?|credits?|gems?)/gi
    ];

    for (const pattern of currencyPatterns) {
      let match;
      while ((match = pattern.exec(textToScan)) !== null) {
        const amount = parseInt(match[1]);
        const currency = match[2].toLowerCase().replace(/s$/, ''); // Normalize plural

        if (!inventory.currencies[currency]) {
          inventory.currencies[currency] = 0;
        }

        // Just note the mention, don't auto-add (would need context to know if gained/lost)
        events.push({
          type: 'currency_mentioned',
          currency,
          amount
        });
      }
    }

    // Track items from active cards (if cards have associated items)
    for (const card of activeCards || []) {
      if (card.tags?.includes('item') || card.type === 'Item') {
        if (!inventory.items.find(i => i.cardId === card.id)) {
          inventory.items.push({
            name: card.name,
            cardId: card.id,
            acquired: Date.now(),
            source: 'card'
          });
        }
      }
    }

    return {
      events,
      notifications,
      contextUpdates: {
        inventory
      }
    };
  }

  _isCommonWord(word) {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'it', 'this', 'that', 'these', 'those',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
      'used', 'way', 'look', 'something', 'nothing', 'everything', 'anything'
    ]);
    return commonWords.has(word.toLowerCase());
  }
}

export default PossessionScript;
