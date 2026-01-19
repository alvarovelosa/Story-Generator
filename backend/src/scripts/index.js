/**
 * Script Registry - Initializes and registers all scripts
 */

import scriptRunner from '../services/ScriptRunner.js';
import AutoCardsScript from './AutoCardsScript.js';
import StoryMemoryScript from './StoryMemoryScript.js';
import QuestTrackingScript from './QuestTrackingScript.js';
import PossessionScript from './PossessionScript.js';

// Register all scripts with their execution order
// Lower order numbers run first
export function initializeScripts() {
  // Auto-cards runs first to detect and activate relevant cards
  scriptRunner.register('auto-cards', new AutoCardsScript(), 10);

  // Story memory tracks key events and characters
  scriptRunner.register('story-memory', new StoryMemoryScript(), 20);

  // Quest tracking monitors objectives
  scriptRunner.register('quest-tracking', new QuestTrackingScript(), 30);

  // Possession tracking monitors items
  scriptRunner.register('possession-tracking', new PossessionScript(), 40);

  console.log('Scripts initialized:', scriptRunner.getScriptList().map(s => s.name).join(', '));
}

export {
  AutoCardsScript,
  StoryMemoryScript,
  QuestTrackingScript,
  PossessionScript
};

export default scriptRunner;
