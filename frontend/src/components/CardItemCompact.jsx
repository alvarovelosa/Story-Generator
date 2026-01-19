const RARITY_COLORS = {
  'Common': 'border-l-gray-400',
  'Bronze': 'border-l-amber-600',
  'Silver': 'border-l-gray-300',
  'Gold': 'border-l-yellow-400'
};

const SOURCE_BADGES = {
  'system': { label: 'SYSTEM', color: 'bg-purple-600' },
  'default': { label: 'DEFAULT', color: 'bg-blue-600' },
  'auto_generated': { label: 'AUTO', color: 'bg-green-600' },
  'user': null
};

function CardItemCompact({ card, onClick, onDelete, draggable = false, onDragStart, onDragEnd }) {
  const rarityBorder = RARITY_COLORS[card.rarity] || RARITY_COLORS['Common'];
  const sourceBadge = SOURCE_BADGES[card.source];
  const isSystemOrDefault = card.source === 'system' || card.source === 'default';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(card));
    e.dataTransfer.setData('text/plain', card.name);
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStart) onDragStart(card);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd(card);
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gray-800 border-l-2 ${rarityBorder} rounded hover:bg-gray-700 transition select-none text-sm ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      onClick={onClick}
      draggable={draggable ? "true" : "false"}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      <span className="font-medium truncate max-w-[120px]">{card.name}</span>
      {sourceBadge && (
        <span className={`px-1 py-0.5 text-[9px] font-semibold rounded ${sourceBadge.color} text-white`}>
          {sourceBadge.label}
        </span>
      )}
      {onDelete && !isSystemOrDefault && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="text-red-400 hover:text-red-300 text-xs ml-0.5"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default CardItemCompact;
