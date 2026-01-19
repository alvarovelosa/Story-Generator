function QuestProgressDebug({ questState }) {
  const state = questState || {
    activeQuests: [],
    completedQuests: [],
    objectives: {}
  };

  const objectivesList = Object.entries(state.objectives || {});

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Quest Progress</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Active Quests */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-1">Active Quests</h4>
          {state.activeQuests?.length === 0 ? (
            <p className="text-gray-500 text-xs">No active quests</p>
          ) : (
            <div className="space-y-1">
              {state.activeQuests?.map((quest, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded p-2 text-xs"
                >
                  <div className="text-gray-200">{quest.name || quest.id}</div>
                  {quest.description && (
                    <div className="text-gray-500 mt-1">{quest.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Quests */}
        {state.completedQuests?.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1">
              Completed ({state.completedQuests.length})
            </h4>
            <div className="space-y-1">
              {state.completedQuests?.map((quest, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded p-2 text-xs flex items-center gap-2"
                >
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-400">{quest}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objectives */}
        {objectivesList.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1">
              Tracked Objectives
            </h4>
            <div className="space-y-1">
              {objectivesList.map(([key, objective]) => (
                <div
                  key={key}
                  className="bg-gray-700 rounded p-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">{objective.cardName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      objective.status === 'completed'
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    }`}>
                      {objective.status}
                    </span>
                  </div>
                  <div className="text-gray-500 mt-1">
                    Mentions: {objective.mentionCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {state.activeQuests?.length === 0 &&
          state.completedQuests?.length === 0 &&
          objectivesList.length === 0 && (
            <p className="text-gray-500 text-sm p-2">
              No quest data yet. Progress will appear as you play.
            </p>
          )}
      </div>
    </div>
  );
}

export default QuestProgressDebug;
