import { useState } from 'react';
import CardEditor from '../components/CardEditor';
import CardLibrary from '../components/CardLibrary';

function Builder() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const handleCardSelect = (card) => {
    setEditingCard(card);
    setShowEditor(true);
  };

  const handleCreateNew = () => {
    setEditingCard(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingCard(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Card Builder</h1>
          <p className="text-gray-400 mt-1">
            Create and manage cards for your storytelling adventures
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition"
        >
          + Create Card
        </button>
      </div>

      {showEditor ? (
        <div className="mb-8">
          <CardEditor
            cardToEdit={editingCard}
            onClose={handleCloseEditor}
            onSave={handleCloseEditor}
          />
        </div>
      ) : null}

      <CardLibrary
        onCardSelect={handleCardSelect}
        mode="builder"
      />
    </div>
  );
}

export default Builder;
