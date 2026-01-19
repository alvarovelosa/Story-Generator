import { useState } from 'react';

function StoryMemoryDebug({ storyMemory }) {
  const [activeTab, setActiveTab] = useState('events');

  const memory = storyMemory || {
    keyEvents: [],
    characterStates: {},
    locationHistory: [],
    importantItems: [],
    relationships: {}
  };

  const tabs = [
    { id: 'events', label: 'Events', count: memory.keyEvents?.length || 0 },
    { id: 'characters', label: 'Characters', count: Object.keys(memory.characterStates || {}).length },
    { id: 'inventory', label: 'Inventory', count: memory.importantItems?.length || 0 }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Story Memory</h3>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1 text-xs rounded ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1 bg-gray-600 rounded text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'events' && (
          <div className="space-y-2">
            {memory.keyEvents?.length === 0 ? (
              <p className="text-gray-500 text-sm">No key events recorded</p>
            ) : (
              memory.keyEvents?.slice().reverse().map((event, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded p-2 text-xs"
                >
                  <div className="text-gray-200">{event.event}</div>
                  <div className="text-gray-500 mt-1">
                    Turn {event.turn} • {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-2">
            {Object.keys(memory.characterStates || {}).length === 0 ? (
              <p className="text-gray-500 text-sm">No characters tracked</p>
            ) : (
              Object.entries(memory.characterStates || {})
                .sort((a, b) => b[1].mentionCount - a[1].mentionCount)
                .map(([name, state]) => (
                  <div
                    key={name}
                    className="bg-gray-700 rounded p-2 text-xs flex items-center justify-between"
                  >
                    <span className="text-gray-200 font-medium">{name}</span>
                    <span className="text-gray-500">
                      {state.mentionCount} mention{state.mentionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-2">
            {memory.importantItems?.length === 0 ? (
              <p className="text-gray-500 text-sm">No items tracked</p>
            ) : (
              memory.importantItems?.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded p-2 text-xs"
                >
                  <div className="text-gray-200">{item.name || item}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryMemoryDebug;
