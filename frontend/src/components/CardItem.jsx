const RARITY_COLORS = {
  'Common': 'border-rarity-common bg-gray-800',
  'Bronze': 'border-rarity-bronze bg-gray-800',
  'Silver': 'border-rarity-silver bg-gray-800',
  'Gold': 'border-rarity-gold bg-gray-800'
};

const TYPE_ICONS = {
  'Character': '👤',
  'Location': '📍',
  'World': '🌍',
  'Time': '⏰',
  'Mood': '🎭'
};

function CardItem({ card, onClick, onDelete, mode = 'builder' }) {
  const rarityColor = RARITY_COLORS[card.rarity] || RARITY_COLORS['Common'];
  const typeIcon = TYPE_ICONS[card.type] || '📄';

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={`rounded-lg p-4 border-2 ${rarityColor} hover:shadow-lg transition cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{typeIcon}</span>
          <div>
            <h3 className="font-bold text-lg">{card.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{card.type}</span>
              <span>•</span>
              <span className={`font-semibold ${RARITY_COLORS[card.rarity].split(' ')[0].replace('border-', 'text-')}`}>
                {card.rarity}
              </span>
            </div>
          </div>
        </div>
        {onDelete && mode === 'builder' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-sm text-gray-300 mt-2">
        {truncateText(card.prompt_text)}
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <div>
          Knowledge: {card.knowledge_level}/{card.max_knowledge}
        </div>
        {card.possession_state !== undefined && card.type === 'Character' && (
          <div>
            {card.possession_state ? '✓ Companion' : 'Not possessed'}
          </div>
        )}
      </div>
    </div>
  );
}

export default CardItem;
