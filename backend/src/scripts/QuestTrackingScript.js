/**
 * QuestTrackingScript - Tracks quest/objective progress
 *
 * This script monitors the story for quest-related events and
 * tracks progress towards objectives defined in active cards.
 */

import BaseScript from './BaseScript.js';

class QuestTrackingScript extends BaseScript {
  constructor() {
    super();
    this.name = 'quest-tracking';
    this.description = 'Track quest objectives and story progress';
  }

  async execute(context) {
    const { currentInput, currentResponse, activeCards, session } = context;
    const events = [];
    const notifications = [];

    // Initialize quest state if not present
    let questState = context.questState || {
      activeQuests: [],
      completedQuests: [],
      objectives: {}
    };

    const textToScan = [currentInput || '', currentResponse || ''].join(' ').toLowerCase();

    // Check active cards for quest-type triggers
    for (const card of activeCards || []) {
      const triggers = card.triggers || [];

      for (const trigger of triggers) {
        if (trigger.type === 'on_quest_complete' && trigger.condition) {
          // Check if quest completion condition is met
          if (this.containsKeyword(textToScan, trigger.condition)) {
            // Mark quest as complete
            const questId = `${card.id}-${trigger.condition}`;

            if (!questState.completedQuests.includes(questId)) {
              questState.completedQuests.push(questId);

              // Remove from active quests
              questState.activeQuests = questState.activeQuests.filter(q => q.id !== questId);

              events.push({
                type: 'quest_completed',
                questId,
                cardId: card.id,
                cardName: card.name,
                condition: trigger.condition
              });

              notifications.push({
                type: 'success',
                message: `Quest completed: ${trigger.condition}`
              });
            }
          }
        }
      }

      // Track objective progress for cards with quest-like content
      if (card.type === 'Character' || card.tags?.includes('quest')) {
        // Simple objective tracking based on card name mentions
        const objectiveKey = `card-${card.id}`;

        if (!questState.objectives[objectiveKey]) {
          questState.objectives[objectiveKey] = {
            cardId: card.id,
            cardName: card.name,
            mentionCount: 0,
            firstSeen: Date.now(),
            lastSeen: null,
            status: 'active'
          };
        }

        if (this.containsKeyword(textToScan, card.name)) {
          questState.objectives[objectiveKey].mentionCount++;
          questState.objectives[objectiveKey].lastSeen = Date.now();
        }
      }
    }

    // Detect new quests/objectives from story content
    const questKeywords = [
      'must find', 'needs to', 'has to', 'quest', 'mission',
      'objective', 'goal', 'task', 'journey to', 'search for',
      'rescue', 'defeat', 'discover', 'collect'
    ];

    for (const keyword of questKeywords) {
      if (this.containsKeyword(textToScan, keyword)) {
        events.push({
          type: 'potential_quest_detected',
          keyword
        });
        break; // Only log once per turn
      }
    }

    return {
      events,
      notifications,
      contextUpdates: {
        questState
      }
    };
  }
}

export default QuestTrackingScript;
