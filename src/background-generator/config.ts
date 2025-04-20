import { ENV } from '../env';

export const FAL_CONFIG = {
  API_KEY: ENV.FAL_KEY || '',
  DEFAULT_BACKGROUND_TYPE: 'dojo',
  API_ENDPOINT: 'https://api.fal.ai/text-to-image'
};

/**
 * Check if the FAL API key is configured
 * @returns boolean indicating if the API key is available
 */
export function isApiKeyConfigured(): boolean {
  return Boolean(FAL_CONFIG.API_KEY);
}
