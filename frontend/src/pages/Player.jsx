import { useState, useEffect } from 'react';
import { sessionsAPI } from '../services/api';
import StoryInterface from '../components/StoryInterface';
import ActiveCardsPanel from '../components/ActiveCardsPanel';

function Player() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionsAPI.getAll();
      setSessions(response.data.data);

      // Auto-select first session if none selected
      if (!currentSession && response.data.data.length > 0) {
        setCurrentSession(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const response = await sessionsAPI.create(newSessionName || 'New Story');
      const newSession = response.data.data;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setNewSessionName('');
      setShowNewSessionForm(false);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return;

    try {
      await sessionsAPI.delete(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(sessions[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleCardsChange = (newActiveCardIds) => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        active_cards: newActiveCardIds
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={currentSession?.id || ''}
              onChange={(e) => {
                const session = sessions.find(s => s.id === parseInt(e.target.value));
                setCurrentSession(session);
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a session...</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>

            {currentSession && (
              <button
                onClick={() => handleDeleteSession(currentSession.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete Session
              </button>
            )}
          </div>

          <button
            onClick={() => setShowNewSessionForm(!showNewSessionForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition"
          >
            + New Session
          </button>
        </div>

        {showNewSessionForm && (
          <form onSubmit={handleCreateSession} className="mt-3 flex space-x-2">
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Session name (optional)"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-semibold transition"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNewSessionForm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Story interface - 70% */}
        <div className="flex-1 flex flex-col" style={{ width: '70%' }}>
          <StoryInterface sessionId={currentSession?.id} />
        </div>

        {/* Active cards panel - 30% */}
        <div style={{ width: '30%' }}>
          {currentSession && (
            <ActiveCardsPanel
              sessionId={currentSession.id}
              activeCardIds={currentSession.active_cards || []}
              onCardsChange={handleCardsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Player;
