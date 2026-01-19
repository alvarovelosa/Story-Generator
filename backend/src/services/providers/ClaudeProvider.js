import Anthropic from '@anthropic-ai/sdk';
import BaseProvider from './BaseProvider.js';

class ClaudeProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'claude';
    this.client = null;
  }

  async initialize(config) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || undefined
    });
  }

  async testConnection() {
    try {
      if (!this.client) {
        return { success: false, message: 'Provider not initialized' };
      }

      const response = await this.client.messages.create({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });

      return {
        success: true,
        message: 'Connected to Anthropic',
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
      throw new Error('Claude provider not initialized');
    }

    // Convert conversation history to Anthropic format
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: userInput }
    ];

    const response = await this.client.messages.create({
      model: options.model || this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens ?? 500,
      system: systemPrompt,
      messages: messages
    });

    // Calculate approximate usage (Anthropic provides input/output tokens)
    const usage = {
      prompt_tokens: response.usage?.input_tokens || 0,
      completion_tokens: response.usage?.output_tokens || 0,
      total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
    };

    return {
      content: response.content[0].text,
      usage: usage
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

      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('Event extraction error:', error);
      return 'Story continued';
    }
  }

  async getModels() {
    return [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
    ];
  }

  getInfo() {
    return {
      name: 'claude',
      displayName: 'Anthropic Claude',
      requiresApiKey: true,
      supportsBaseUrl: true,
      defaultModel: 'claude-3-5-sonnet-20241022',
      models: this.getModels()
    };
  }
}

export default ClaudeProvider;
