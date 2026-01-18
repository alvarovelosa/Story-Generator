import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  async generateStoryResponse(systemPrompt, userInput, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userInput }
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.9,
        max_tokens: 500
      });

      return {
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate story response: ' + error.message);
    }
  }

  async extractKeyEvent(llmResponse) {
    try {
      const prompt = `Summarize the key event from this story turn in one brief sentence (10 words or less):

${llmResponse}

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
      return 'Story continued'; // Fallback
    }
  }
}

export default OpenAIService;
