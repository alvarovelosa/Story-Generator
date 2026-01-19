import { PROVIDERS, getProviderInfo } from './providers/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LLM Service - manages multiple LLM providers
 * Provides a unified interface for story generation across providers
 */
class LLMService {
  constructor() {
    this.providers = {};
    this.activeProvider = null;
    this.activeProviderName = process.env.LLM_PROVIDER || 'openai';
    this.config = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      },
      claude: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
      },
      gemini: {
        apiKey: process.env.GOOGLE_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
      },
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'
      },
      koboldcpp: {
        baseUrl: process.env.KOBOLDCPP_URL || 'http://localhost:5001',
        model: 'local'
      }
    };

    // Initialize default provider
    this.initializeProvider(this.activeProviderName);
  }

  /**
   * Initialize a provider with its configuration
   */
  async initializeProvider(providerName, customConfig = null) {
    const ProviderClass = PROVIDERS[providerName];
    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    const provider = new ProviderClass();
    const config = customConfig || this.config[providerName] || {};

    await provider.initialize(config);
    this.providers[providerName] = provider;

    return provider;
  }

  /**
   * Set the active provider
   */
  async setProvider(providerName, config = null) {
    if (!PROVIDERS[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    // Update config if provided
    if (config) {
      this.config[providerName] = { ...this.config[providerName], ...config };
    }

    // Initialize or reinitialize the provider
    await this.initializeProvider(providerName, this.config[providerName]);

    this.activeProviderName = providerName;
    this.activeProvider = this.providers[providerName];

    return this.activeProvider;
  }

  /**
   * Get the active provider, initializing if needed
   */
  async getProvider() {
    if (!this.activeProvider) {
      await this.setProvider(this.activeProviderName);
    }
    return this.activeProvider;
  }

  /**
   * Get current configuration (safe - no API keys)
   */
  getConfig() {
    return {
      activeProvider: this.activeProviderName,
      activeModel: this.config[this.activeProviderName]?.model,
      providers: Object.fromEntries(
        Object.entries(this.config).map(([name, cfg]) => [
          name,
          {
            model: cfg.model,
            baseUrl: cfg.baseUrl,
            hasApiKey: !!cfg.apiKey
          }
        ])
      )
    };
  }

  /**
   * Update provider configuration
   */
  async updateConfig(providerName, newConfig) {
    if (!PROVIDERS[providerName]) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    this.config[providerName] = { ...this.config[providerName], ...newConfig };

    // Reinitialize if this is the active provider
    if (providerName === this.activeProviderName) {
      await this.setProvider(providerName);
    }

    return this.getConfig();
  }

  /**
   * Test connection to a provider
   */
  async testConnection(providerName = null) {
    const name = providerName || this.activeProviderName;

    // Temporarily initialize provider for testing if needed
    if (!this.providers[name]) {
      await this.initializeProvider(name);
    }

    const provider = this.providers[name];
    return await provider.testConnection();
  }

  /**
   * Generate story response using active provider
   */
  async generateStoryResponse(systemPrompt, userInput, conversationHistory = [], options = {}) {
    const provider = await this.getProvider();

    try {
      return await provider.generateResponse(
        systemPrompt,
        userInput,
        conversationHistory,
        {
          model: options.model || this.config[this.activeProviderName]?.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        }
      );
    } catch (error) {
      console.error(`LLM Error (${this.activeProviderName}):`, error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Extract key event from response
   */
  async extractKeyEvent(llmResponse) {
    const provider = await this.getProvider();
    return await provider.extractKeyEvent(llmResponse);
  }

  /**
   * Get available providers info
   */
  getProvidersInfo() {
    return getProviderInfo();
  }

  /**
   * Get models for a specific provider
   */
  async getModels(providerName = null) {
    const name = providerName || this.activeProviderName;

    if (!this.providers[name]) {
      await this.initializeProvider(name);
    }

    return await this.providers[name].getModels();
  }
}

// Export singleton instance
const llmService = new LLMService();
export default llmService;
