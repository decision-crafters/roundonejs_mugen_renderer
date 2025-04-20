import { ENV } from '../env';

export const OPENROUTER_CONFIG = {
  API_KEY: ENV.OPENROUTER_API_KEY || '',
  DEFAULT_MODEL: 'anthropic/claude-3-opus',
  API_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions'
};

/**
 * Check if the OpenRouter API key is configured
 * @returns boolean indicating if the API key is available
 */
export function isApiKeyConfigured(): boolean {
  return Boolean(OPENROUTER_CONFIG.API_KEY);
}
