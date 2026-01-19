import OpenAIProvider from './OpenAIProvider.js';
import ClaudeProvider from './ClaudeProvider.js';
import GeminiProvider from './GeminiProvider.js';
import OpenRouterProvider from './OpenRouterProvider.js';
import KoboldCPPProvider from './KoboldCPPProvider.js';

export {
  OpenAIProvider,
  ClaudeProvider,
  GeminiProvider,
  OpenRouterProvider,
  KoboldCPPProvider
};

export const PROVIDERS = {
  openai: OpenAIProvider,
  claude: ClaudeProvider,
  gemini: GeminiProvider,
  openrouter: OpenRouterProvider,
  koboldcpp: KoboldCPPProvider
};

export const getProviderInfo = () => {
  return Object.entries(PROVIDERS).map(([key, Provider]) => {
    const instance = new Provider();
    return instance.getInfo();
  });
};
