/**
 * AutoCardsScript - Automatically activates cards based on story content
 *
 * This script scans the story content and player input for mentions of
 * card names or trigger conditions, then activates relevant cards.
 */

import BaseScript from './BaseScript.js';
import Card from '../models/Card.js';

class AutoCardsScript extends BaseScript {
  constructor() {
    super();
    this.name = 'auto-cards';
    this.description = 'Automatically activate cards based on mentions and triggers';
  }

  async execute(context) {
    const { currentInput, currentResponse, activeCards, session } = context;

    const textToScan = [
      currentInput || '',
      currentResponse || ''
    ].join(' ').toLowerCase();

    const events = [];
    const cardsToActivate = [];
    const notifications = [];

    // Get all available cards
    const allCards = await Card.getAll();
    const activeCardIds = new Set(activeCards.map(c => c.id));

    // Check each inactive card for activation triggers
    for (const card of allCards) {
      if (activeCardIds.has(card.id)) continue;

      // Check name mention
      if (this.containsKeyword(textToScan, card.name)) {
        cardsToActivate.push(card.id);
        events.push({
          type: 'card_mentioned',
          cardId: card.id,
          cardName: card.name
        });
        notifications.push({
          type: 'info',
          message: `Card "${card.name}" mentioned - activating`
        });
        continue;
      }

      // Check triggers
      const triggers = card.triggers || [];
      for (const trigger of triggers) {
        if (trigger.type === 'on_mention' && trigger.condition) {
          if (this.containsKeyword(textToScan, trigger.condition)) {
            cardsToActivate.push(card.id);
            events.push({
              type: 'trigger_activated',
              cardId: card.id,
              triggerType: trigger.type,
              condition: trigger.condition
            });
            notifications.push({
              type: 'info',
              message: `Trigger activated for "${card.name}": ${trigger.condition}`
            });
            break;
          }
        }
      }
    }

    return {
      events,
      cardsToActivate,
      notifications,
      contextUpdates: {
        autoActivatedCards: cardsToActivate
      }
    };
  }
}

export default AutoCardsScript;
