import { useState } from 'react';
import ActiveCardsDebug from './ActiveCardsDebug';
import ScriptDebugPanel from './ScriptDebugPanel';
import StoryMemoryDebug from './StoryMemoryDebug';
import QuestProgressDebug from './QuestProgressDebug';
import PromptPreviewDebug from './PromptPreviewDebug';

function DebugSidebar({ sessionId, debugData = {} }) {
  const [activePanel, setActivePanel] = useState('cards');

  const panels = [
    { id: 'cards', label: 'Cards', icon: '🎴' },
    { id: 'scripts', label: 'Scripts', icon: '⚙️' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
    { id: 'quests', label: 'Quests', icon: '📜' },
    { id: 'prompt', label: 'Prompt', icon: '📝' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700">
      {/* Panel Selector */}
      <div className="flex border-b border-gray-700">
        {panels.map(panel => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`flex-1 px-2 py-2 text-xs font-medium transition ${
              activePanel === panel.id
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
            title={panel.label}
          >
            <span className="block text-center">{panel.icon}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'cards' && <ActiveCardsDebug />}
        {activePanel === 'scripts' && <ScriptDebugPanel />}
        {activePanel === 'memory' && <StoryMemoryDebug storyMemory={debugData.storyMemory} />}
        {activePanel === 'quests' && <QuestProgressDebug questState={debugData.questState} />}
        {activePanel === 'prompt' && <PromptPreviewDebug sessionId={sessionId} />}
      </div>
    </div>
  );
}

export default DebugSidebar;
