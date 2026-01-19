import OpenAI from 'openai';
import BaseProvider from './BaseProvider.js';

class OpenAIProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'openai';
    this.client = null;
  }

  async initialize(config) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || undefined
    });
  }

  async testConnection() {
    try {
      if (!this.client) {
        return { success: false, message: 'Provider not initialized' };
      }

      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });

      return {
        success: true,
        message: 'Connected to OpenAI',
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
      throw new Error('OpenAI provider not initialized');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];

    const response = await this.client.chat.completions.create({
      model: options.model || this.config.model || 'gpt-4-turbo-preview',
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
        model: 'gpt-3.5-turbo',
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
    return [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ];
  }

  getInfo() {
    return {
      name: 'openai',
      displayName: 'OpenAI',
      requiresApiKey: true,
      supportsBaseUrl: true,
      defaultModel: 'gpt-4-turbo-preview',
      models: this.getModels()
    };
  }
}

export default OpenAIProvider;
