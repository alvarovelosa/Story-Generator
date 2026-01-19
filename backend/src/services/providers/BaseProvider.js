/**
 * Base class for LLM providers
 * All providers must implement these methods
 */
class BaseProvider {
  constructor() {
    this.name = 'base';
    this.client = null;
    this.config = {};
  }

  /**
   * Initialize the provider with configuration
   * @param {Object} config - Provider configuration (apiKey, baseUrl, etc.)
   */
  async initialize(config) {
    this.config = config;
    throw new Error('initialize() must be implemented by provider');
  }

  /**
   * Test the connection to the provider
   * @returns {Promise<{success: boolean, message: string, model?: string}>}
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by provider');
  }

  /**
   * Generate a story response
   * @param {string} systemPrompt - The system prompt
   * @param {string} userInput - The user's input
   * @param {Array} conversationHistory - Previous messages
   * @param {Object} options - Generation options (model, temperature, maxTokens)
   * @returns {Promise<{content: string, usage: Object}>}
   */
  async generateResponse(systemPrompt, userInput, conversationHistory = [], options = {}) {
    throw new Error('generateResponse() must be implemented by provider');
  }

  /**
   * Extract key event from response (can use cheaper model)
   * @param {string} text - The text to summarize
   * @returns {Promise<string>}
   */
  async extractKeyEvent(text) {
    throw new Error('extractKeyEvent() must be implemented by provider');
  }

  /**
   * Get available models for this provider
   * @returns {Promise<Array<{id: string, name: string}>>}
   */
  async getModels() {
    return [];
  }

  /**
   * Get provider metadata
   * @returns {Object}
   */
  getInfo() {
    return {
      name: this.name,
      requiresApiKey: true,
      supportsBaseUrl: false,
      defaultModel: null,
      models: []
    };
  }
}

export default BaseProvider;
