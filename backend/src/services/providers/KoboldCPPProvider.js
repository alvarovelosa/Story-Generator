import BaseProvider from './BaseProvider.js';

/**
 * KoboldCPP provider for local LLM inference
 * Connects to a local KoboldCPP server
 */
class KoboldCPPProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'koboldcpp';
    this.baseUrl = 'http://localhost:5001';
  }

  async initialize(config) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'http://localhost:5001';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/model`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: 'Connected to KoboldCPP',
        model: data.result || 'Local Model'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Connection failed - is KoboldCPP running?'
      };
    }
  }

  async generateResponse(systemPrompt, userInput, conversationHistory = [], options = {}) {
    // Build prompt in Alpaca/ChatML format
    const prompt = this.buildPrompt(systemPrompt, userInput, conversationHistory);

    const response = await fetch(`${this.baseUrl}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        max_length: options.maxTokens ?? 500,
        temperature: options.temperature ?? 0.9,
        top_p: 0.9,
        rep_pen: 1.1,
        stop_sequence: ['### Human:', '### User:', '\n\n###']
      })
    });

    if (!response.ok) {
      throw new Error(`KoboldCPP error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.results?.[0]?.text || '';

    // Estimate tokens (KoboldCPP doesn't provide exact counts)
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(generatedText.length / 4);

    return {
      content: generatedText.trim(),
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      }
    };
  }

  buildPrompt(systemPrompt, userInput, conversationHistory) {
    // ChatML-style format
    let prompt = `### System:\n${systemPrompt}\n\n`;

    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        prompt += `### Human:\n${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `### Assistant:\n${msg.content}\n\n`;
      }
    }

    prompt += `### Human:\n${userInput}\n\n### Assistant:\n`;

    return prompt;
  }

  async extractKeyEvent(text) {
    try {
      const prompt = `### System:
You are a helpful assistant that summarizes story events in one brief sentence.

### Human:
Summarize the key event from this story turn in one brief sentence (10 words or less):

${text}

Focus on: location changes, important discoveries, quest milestones, character relationships.
Output only the event description, nothing else.

### Assistant:
`;

      const response = await fetch(`${this.baseUrl}/api/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          max_length: 50,
          temperature: 0.3,
          stop_sequence: ['\n', '###']
        })
      });

      if (!response.ok) {
        return 'Story continued';
      }

      const data = await response.json();
      return (data.results?.[0]?.text || 'Story continued').trim();
    } catch (error) {
      console.error('Event extraction error:', error);
      return 'Story continued';
    }
  }

  async getModels() {
    // KoboldCPP uses whatever model is loaded
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/model`);
      if (response.ok) {
        const data = await response.json();
        return [{ id: 'local', name: data.result || 'Local Model' }];
      }
    } catch (e) {
      // Server not running
    }
    return [{ id: 'local', name: 'Local Model (KoboldCPP)' }];
  }

  getInfo() {
    return {
      name: 'koboldcpp',
      displayName: 'KoboldCPP (Local)',
      requiresApiKey: false,
      supportsBaseUrl: true,
      defaultModel: 'local',
      defaultBaseUrl: 'http://localhost:5001',
      models: [{ id: 'local', name: 'Local Model' }]
    };
  }
}

export default KoboldCPPProvider;
