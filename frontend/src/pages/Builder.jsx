import { useState, useEffect } from 'react';
import CardEditor from '../components/CardEditor';
import CardLibrary from '../components/CardLibrary';
import LLMSettings from '../components/LLMSettings';
import StoryInterface from '../components/StoryInterface';
import ActiveCardsPanel from '../components/ActiveCardsPanel';
import DebugSidebar from '../components/DebugSidebar';
import { sessionsAPI, cardsAPI } from '../services/api';
import useStore from '../store/useStore';

const TABS = [
  { id: 'cards', label: 'Cards', icon: '🃏' },
  { id: 'play', label: 'Play', icon: '▶️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

function Builder() {
  const [activeTab, setActiveTab] = useState('cards');
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Play tab state
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDebug, setShowDebug] = useState(true);
  const [debugData, setDebugData] = useState({});
  const [newSessionName, setNewSessionName] = useState('');

  const { cards, setCards, setActiveCards, setCurrentSession, setStoryHistory } = useStore();

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadCards();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionsAPI.getAll();
      setSessions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadCards = async () => {
    try {
      const response = await cardsAPI.getAll();
      setCards(response.data.data || []);
    } catch (err) {
      console.error('Failed to load cards:', err);
    }
  };

  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    setCurrentSession(session);

    // Load active cards for the session
    if (session.active_card_ids?.length > 0) {
      try {
        const activeCards = [];
        for (const id of session.active_card_ids) {
          const response = await cardsAPI.getById(id);
          if (response.data.data) {
            activeCards.push(response.data.data);
          }
        }
        setActiveCards(activeCards);
      } catch (err) {
        console.error('Failed to load active cards:', err);
      }
    } else {
      setActiveCards([]);
    }

    // Load story history
    if (session.story_history) {
      setStoryHistory(session.story_history);
    } else {
      setStoryHistory([]);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      const response = await sessionsAPI.create(newSessionName.trim());
      setSessions([response.data.data, ...sessions]);
      setNewSessionName('');
      handleSelectSession(response.data.data);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await sessionsAPI.delete(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setCurrentSession(null);
        setActiveCards([]);
        setStoryHistory([]);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

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

  // Update debug data when story progresses
  const handleStoryUpdate = (newDebugData) => {
    setDebugData(prev => ({ ...prev, ...newDebugData }));
  };

  const renderCardsTab = () => (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Card Library</h2>
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

      {showEditor && (
        <div className="mb-8">
          <CardEditor
            cardToEdit={editingCard}
            onClose={handleCloseEditor}
            onSave={handleCloseEditor}
          />
        </div>
      )}

      <CardLibrary
        onCardSelect={handleCardSelect}
        mode="builder"
      />
    </div>
  );

  const renderPlayTab = () => (
    <div className="h-[calc(100vh-200px)]">
      {!selectedSession ? (
        // Session selector
        <div className="flex h-full">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-2">Play Mode</h2>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              Run story sessions with full debug visibility. Select or create a session to begin.
            </p>

            {/* Create new session */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                placeholder="New session name..."
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition disabled:opacity-50"
              >
                Create
              </button>
            </div>

            {/* Session list */}
            <div className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-gray-700">
                <h3 className="font-medium">Recent Sessions</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {sessions.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No sessions yet</p>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                    >
                      <button
                        onClick={() => handleSelectSession(session)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium">{session.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.created_at).toLocaleDateString()}
                          {session.active_card_ids?.length > 0 &&
                            ` • ${session.active_card_ids.length} cards`}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Play interface with debug
        <div className="flex h-full gap-4">
          {/* Left sidebar - Active Cards Panel */}
          <div className="w-64 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-sm">Active Cards</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ← Sessions
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ActiveCardsPanel
                sessionId={selectedSession.id}
                activeCardIds={selectedSession.active_card_ids || []}
                onCardsChange={(newIds) => {
                  setSelectedSession({ ...selectedSession, active_card_ids: newIds });
                  // Update active cards in store
                  const updatedCards = cards.filter(c => newIds.includes(c.id));
                  setActiveCards(updatedCards);
                }}
              />
            </div>
          </div>

          {/* Center - Story Interface */}
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedSession.name}</h3>
                <p className="text-xs text-gray-500">Session #{selectedSession.id}</p>
              </div>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className={`px-3 py-1 text-xs rounded ${
                  showDebug ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <StoryInterface
                sessionId={selectedSession.id}
                onStoryUpdate={handleStoryUpdate}
              />
            </div>
          </div>

          {/* Right sidebar - Debug Panel */}
          {showDebug && (
            <div className="w-80 bg-gray-800 rounded-lg overflow-hidden">
              <DebugSidebar
                sessionId={selectedSession.id}
                debugData={debugData}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="max-w-3xl mx-auto">
      <LLMSettings />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Builder</h1>
        <p className="text-gray-400 mt-1">
          Build cards, test stories, and configure settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'cards' && renderCardsTab()}
        {activeTab === 'play' && renderPlayTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
}

export default Builder;
