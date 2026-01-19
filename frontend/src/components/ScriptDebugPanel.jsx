import { useState, useEffect } from 'react';
import { scriptsAPI } from '../services/api';

function ScriptDebugPanel() {
  const [scripts, setScripts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    loadScripts();
    loadLogs();
  }, []);

  const loadScripts = async () => {
    try {
      const response = await scriptsAPI.getAll();
      setScripts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load scripts:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await scriptsAPI.getLogs({ limit: 50 });
      setLogs(response.data.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleScript = async (name, currentEnabled) => {
    try {
      await scriptsAPI.update(name, { enabled: !currentEnabled });
      loadScripts();
    } catch (err) {
      console.error('Failed to toggle script:', err);
    }
  };

  const clearLogs = async () => {
    try {
      await scriptsAPI.clearLogs();
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-400">Loading scripts...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scripts List */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Registered Scripts</h3>
        <div className="space-y-1">
          {scripts.map(script => (
            <div
              key={script.name}
              className="flex items-center justify-between bg-gray-700 px-2 py-1.5 rounded text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${script.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-gray-200">{script.name}</span>
                <span className="text-gray-500 text-xs">#{script.order}</span>
              </div>
              <button
                onClick={() => toggleScript(script.name, script.enabled)}
                className={`px-2 py-0.5 text-xs rounded ${
                  script.enabled
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {script.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300">Execution Logs</h3>
          <button
            onClick={clearLogs}
            className="px-2 py-0.5 text-xs bg-gray-600 hover:bg-gray-500 rounded"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm p-2">No logs yet</p>
          ) : (
            logs.slice().reverse().map((log, index) => (
              <div
                key={`${log.turnId}-${log.scriptName}-${index}`}
                className={`bg-gray-700 rounded text-xs cursor-pointer ${
                  expandedLog === index ? 'ring-1 ring-blue-500' : ''
                }`}
                onClick={() => setExpandedLog(expandedLog === index ? null : index)}
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-gray-200">{log.scriptName}</span>
                  </div>
                  <span className="text-gray-500">{log.duration}ms</span>
                </div>

                {expandedLog === index && (
                  <div className="px-2 pb-2 border-t border-gray-600 mt-1 pt-1">
                    {log.error ? (
                      <div className="text-red-400">Error: {log.error}</div>
                    ) : (
                      <>
                        {log.output?.events?.length > 0 && (
                          <div className="mb-1">
                            <span className="text-gray-400">Events: </span>
                            <span className="text-blue-400">
                              {log.output.events.map(e => e.type).join(', ')}
                            </span>
                          </div>
                        )}
                        {log.output?.notifications?.length > 0 && (
                          <div className="mb-1">
                            <span className="text-gray-400">Notifications: </span>
                            <span className="text-yellow-400">
                              {log.output.notifications.map(n => n.message).join('; ')}
                            </span>
                          </div>
                        )}
                        {log.output?.cardsToActivate?.length > 0 && (
                          <div>
                            <span className="text-gray-400">Cards to activate: </span>
                            <span className="text-green-400">
                              {log.output.cardsToActivate.join(', ')}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ScriptDebugPanel;
