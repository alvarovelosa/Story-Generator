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

const SOURCE_BADGES = {
  'system': { label: 'SYSTEM', color: 'bg-purple-600' },
  'default': { label: 'DEFAULT', color: 'bg-blue-600' },
  'auto_generated': { label: 'AUTO', color: 'bg-green-600' },
  'user': null // No badge for user cards
};

function CardItem({ card, onClick, onDelete, mode = 'builder' }) {
  const rarityColor = RARITY_COLORS[card.rarity] || RARITY_COLORS['Common'];
  const typeIcon = TYPE_ICONS[card.type] || '📄';
  const sourceBadge = SOURCE_BADGES[card.source];
  const isSystemOrDefault = card.source === 'system' || card.source === 'default';

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
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{card.name}</h3>
              {sourceBadge && (
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${sourceBadge.color} text-white`}>
                  {sourceBadge.label}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{card.type}</span>
              <span>•</span>
              <span className={`font-semibold ${RARITY_COLORS[card.rarity].split(' ')[0].replace('border-', 'text-')}`}>
                {card.rarity}
              </span>
            </div>
          </div>
        </div>
        {onDelete && mode === 'builder' && !isSystemOrDefault && (
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
