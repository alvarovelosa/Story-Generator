import scriptRunner from '../services/ScriptRunner.js';

/**
 * Get list of all registered scripts
 */
export const getScripts = async (req, res) => {
  try {
    const scripts = scriptRunner.getScriptList();
    res.json({ success: true, data: scripts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update script settings (enable/disable, order)
 */
export const updateScript = async (req, res) => {
  try {
    const { name } = req.params;
    const { enabled, order } = req.body;

    const success = scriptRunner.updateScriptSettings(name, { enabled, order });

    if (!success) {
      return res.status(404).json({ success: false, error: 'Script not found' });
    }

    const scripts = scriptRunner.getScriptList();
    res.json({ success: true, data: scripts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get script execution logs
 */
export const getLogs = async (req, res) => {
  try {
    const { turnId, limit } = req.query;

    let logs;
    if (turnId) {
      logs = scriptRunner.getLogsForTurn(parseInt(turnId));
    } else {
      logs = scriptRunner.getLogs();
      if (limit) {
        logs = logs.slice(-parseInt(limit));
      }
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Clear script logs
 */
export const clearLogs = async (req, res) => {
  try {
    scriptRunner.clearLogs();
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
