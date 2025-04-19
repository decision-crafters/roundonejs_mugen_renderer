export const OPENROUTER_CONFIG = {
  API_KEY: process.env.OPENROUTER_API_KEY || '',
  DEFAULT_MODEL: 'anthropic/claude-3-opus',
  API_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions'
};
