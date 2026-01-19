import OpenAI from 'openai';
import BaseProvider from './BaseProvider.js';

/**
 * OpenRouter provider - uses OpenAI SDK with custom baseURL
 * OpenRouter provides access to multiple models through a unified API
 */
class OpenRouterProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'openrouter';
    this.client = null;
  }

  async initialize(config) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Story Generator'
      }
    });
  }

  async testConnection() {
    try {
      if (!this.client) {
        return { success: false, message: 'Provider not initialized' };
      }

      const response = await this.client.chat.completions.create({
        model: this.config.model || 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });

      return {
        success: true,
        message: 'Connected to OpenRouter',
        model: response.model
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Connection failed'
      };
    }
  }

  async generateResponse(systemPrompt, userInput, conversationHistory = [], options = {}) {
    if (!this.client) {
      throw new Error('OpenRouter provider not initialized');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];

    const response = await this.client.chat.completions.create({
      model: options.model || this.config.model || 'anthropic/claude-3-haiku',
      messages: messages,
      temperature: options.temperature ?? 0.9,
      max_tokens: options.maxTokens ?? 500
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage
    };
  }

  async extractKeyEvent(text) {
    if (!this.client) {
      return 'Story continued';
    }

    try {
      const prompt = `Summarize the key event from this story turn in one brief sentence (10 words or less):

${text}

Focus on: location changes, important discoveries, quest milestones, character relationships.
Output only the event description, nothing else.`;

      const response = await this.client.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Event extraction error:', error);
      return 'Story continued';
    }
  }

  async getModels() {
    // Popular models available on OpenRouter
    return [
      { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera (Free)' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B' },
      { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' }
    ];
  }

  getInfo() {
    return {
      name: 'openrouter',
      displayName: 'OpenRouter',
      requiresApiKey: true,
      supportsBaseUrl: true,
      defaultModel: process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free',
      models: this.getModels()
    };
  }
}

export default OpenRouterProvider;
