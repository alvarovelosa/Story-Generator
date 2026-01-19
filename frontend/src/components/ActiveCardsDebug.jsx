import useStore from '../store/useStore';

function ActiveCardsDebug() {
  const { activeCards } = useStore();

  const getRarityColor = (rarity) => {
    const colors = {
      'Common': 'border-gray-400',
      'Bronze': 'border-amber-600',
      'Silver': 'border-gray-300',
      'Gold': 'border-yellow-400'
    };
    return colors[rarity] || colors['Common'];
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Character': '👤',
      'Location': '📍',
      'World': '🌍',
      'Time': '⏰',
      'Mood': '🎭'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">
          Active Cards ({activeCards?.length || 0})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {(!activeCards || activeCards.length === 0) ? (
          <p className="text-gray-500 text-sm p-2">No active cards</p>
        ) : (
          activeCards.map(card => (
            <div
              key={card.id}
              className={`bg-gray-700 rounded p-2 border-l-2 ${getRarityColor(card.rarity)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{getTypeIcon(card.type)}</span>
                <span className="text-sm font-medium text-gray-200">{card.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{card.type}</span>
                <span>•</span>
                <span>{card.rarity}</span>
              </div>
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {card.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {card.parent_card_ids && card.parent_card_ids.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Parents: {card.parent_card_ids.length}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActiveCardsDebug;
