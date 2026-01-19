import { useState, useEffect } from 'react';
import { storyAPI } from '../services/api';

function PromptPreviewDebug({ sessionId }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadPrompt();
    }
  }, [sessionId]);

  const loadPrompt = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await storyAPI.getSystemPrompt(sessionId);
      setPrompt(response.data.data?.systemPrompt || 'No prompt generated');
    } catch (err) {
      setError('Failed to load prompt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tokenEstimate = Math.round(prompt.length / 4); // Rough estimate

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">System Prompt</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">~{tokenEstimate} tokens</span>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded"
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
            <button
              onClick={loadPrompt}
              className="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 rounded"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {!sessionId ? (
          <p className="text-gray-500 text-sm">Select a session to view prompt</p>
        ) : loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : collapsed ? (
          <div className="bg-gray-700 rounded p-2">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-24 overflow-hidden">
              {prompt.substring(0, 500)}
              {prompt.length > 500 && '...'}
            </pre>
            <button
              onClick={() => setCollapsed(false)}
              className="text-xs text-blue-400 hover:text-blue-300 mt-2"
            >
              Show full prompt ({prompt.length} chars)
            </button>
          </div>
        ) : (
          <div className="bg-gray-700 rounded p-2">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
              {prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptPreviewDebug;
