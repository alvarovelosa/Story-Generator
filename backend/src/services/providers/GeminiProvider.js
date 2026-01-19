import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseProvider from './BaseProvider.js';

class GeminiProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'gemini';
    this.client = null;
  }

  async initialize(config) {
    this.config = config;
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async testConnection() {
    try {
      if (!this.client) {
        return { success: false, message: 'Provider not initialized' };
      }

      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-pro'
      });

      const result = await model.generateContent('Hi');

      return {
        success: true,
        message: 'Connected to Google AI',
        model: this.config.model || 'gemini-pro'
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
      throw new Error('Gemini provider not initialized');
    }

    const modelName = options.model || this.config.model || 'gemini-pro';
    const model = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt
    });

    // Convert conversation history to Gemini format
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 500,
        temperature: options.temperature ?? 0.9
      }
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    const text = response.text();

    // Estimate token usage (Gemini doesn't always provide exact counts)
    const estimatedPromptTokens = Math.ceil((systemPrompt.length + userInput.length) / 4);
    const estimatedCompletionTokens = Math.ceil(text.length / 4);

    return {
      content: text,
      usage: {
        prompt_tokens: response.usageMetadata?.promptTokenCount || estimatedPromptTokens,
        completion_tokens: response.usageMetadata?.candidatesTokenCount || estimatedCompletionTokens,
        total_tokens: response.usageMetadata?.totalTokenCount || (estimatedPromptTokens + estimatedCompletionTokens)
      }
    };
  }

  async extractKeyEvent(text) {
    if (!this.client) {
      return 'Story continued';
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Summarize the key event from this story turn in one brief sentence (10 words or less):

${text}

Focus on: location changes, important discoveries, quest milestones, character relationships.
Output only the event description, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text().trim();
    } catch (error) {
      console.error('Event extraction error:', error);
      return 'Story continued';
    }
  }

  async getModels() {
    return [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-pro', name: 'Gemini Pro' }
    ];
  }

  getInfo() {
    return {
      name: 'gemini',
      displayName: 'Google Gemini',
      requiresApiKey: true,
      supportsBaseUrl: false,
      defaultModel: 'gemini-1.5-pro',
      models: this.getModels()
    };
  }
}

export default GeminiProvider;
