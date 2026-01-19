/**
 * ScriptRunner - Manages and executes scripts during story generation
 *
 * The ScriptRunner is a pipeline system that runs registered scripts in order.
 * Each script can modify the story context, fire events, generate cards, etc.
 *
 * Scripts are executed in a defined order and their inputs/outputs are logged
 * for debugging purposes in the Builder.
 */

class ScriptRunner {
  constructor() {
    this.registry = new Map();
    this.executionOrder = [];
    this.enabledScripts = new Set();
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 log entries
  }

  /**
   * Register a script with the runner
   * @param {string} name - Unique script identifier
   * @param {BaseScript} script - The script instance
   * @param {number} order - Execution order (lower runs first)
   */
  register(name, script, order = 100) {
    this.registry.set(name, { script, order });
    this.enabledScripts.add(name);
    this._updateExecutionOrder();
  }

  /**
   * Unregister a script
   * @param {string} name - Script name to remove
   */
  unregister(name) {
    this.registry.delete(name);
    this.enabledScripts.delete(name);
    this._updateExecutionOrder();
  }

  /**
   * Enable a script
   * @param {string} name - Script name
   */
  enable(name) {
    if (this.registry.has(name)) {
      this.enabledScripts.add(name);
    }
  }

  /**
   * Disable a script
   * @param {string} name - Script name
   */
  disable(name) {
    this.enabledScripts.delete(name);
  }

  /**
   * Check if a script is enabled
   * @param {string} name - Script name
   * @returns {boolean}
   */
  isEnabled(name) {
    return this.enabledScripts.has(name);
  }

  /**
   * Update the execution order based on registered scripts
   */
  _updateExecutionOrder() {
    this.executionOrder = Array.from(this.registry.entries())
      .sort((a, b) => a[1].order - b[1].order)
      .map(([name]) => name);
  }

  /**
   * Run all enabled scripts in the pipeline
   * @param {Object} context - The story context
   * @returns {Object} - Results with modified context and logs
   */
  async runPipeline(context) {
    const results = [];
    const turnId = Date.now();
    let currentContext = { ...context };

    for (const scriptName of this.executionOrder) {
      if (!this.isEnabled(scriptName)) continue;

      const { script } = this.registry.get(scriptName);
      const startTime = Date.now();

      try {
        const input = { ...currentContext };
        const output = await script.execute(input);
        const endTime = Date.now();

        // Merge outputs into context for next script
        if (output.contextUpdates) {
          currentContext = { ...currentContext, ...output.contextUpdates };
        }

        // Log execution
        const logEntry = {
          turnId,
          scriptName,
          timestamp: startTime,
          duration: endTime - startTime,
          input: this._sanitizeForLog(input),
          output: this._sanitizeForLog(output),
          success: true
        };

        this.logs.push(logEntry);
        results.push({ name: scriptName, output, success: true });

      } catch (error) {
        const logEntry = {
          turnId,
          scriptName,
          timestamp: startTime,
          duration: Date.now() - startTime,
          error: error.message,
          success: false
        };

        this.logs.push(logEntry);
        results.push({ name: scriptName, error: error.message, success: false });
      }
    }

    // Trim logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return {
      context: currentContext,
      results,
      logs: this.logs.filter(log => log.turnId === turnId)
    };
  }

  /**
   * Sanitize objects for logging (prevent circular refs, trim large data)
   */
  _sanitizeForLog(obj) {
    try {
      const str = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'string' && value.length > 500) {
          return value.substring(0, 500) + '...';
        }
        return value;
      });
      return JSON.parse(str);
    } catch {
      return { error: 'Could not serialize for logging' };
    }
  }

  /**
   * Get all logs
   * @returns {Array}
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Get logs for a specific turn
   * @param {number} turnId
   * @returns {Array}
   */
  getLogsForTurn(turnId) {
    return this.logs.filter(log => log.turnId === turnId);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get list of all registered scripts with their status
   * @returns {Array}
   */
  getScriptList() {
    return this.executionOrder.map(name => {
      const { script, order } = this.registry.get(name);
      return {
        name,
        description: script.description || '',
        order,
        enabled: this.isEnabled(name)
      };
    });
  }

  /**
   * Update script settings (enable/disable, order)
   * @param {string} name - Script name
   * @param {Object} settings - { enabled, order }
   */
  updateScriptSettings(name, settings) {
    if (!this.registry.has(name)) return false;

    if (settings.enabled !== undefined) {
      if (settings.enabled) {
        this.enable(name);
      } else {
        this.disable(name);
      }
    }

    if (settings.order !== undefined) {
      const entry = this.registry.get(name);
      entry.order = settings.order;
      this._updateExecutionOrder();
    }

    return true;
  }
}

// Singleton instance
const scriptRunner = new ScriptRunner();

export default scriptRunner;
export { ScriptRunner };
