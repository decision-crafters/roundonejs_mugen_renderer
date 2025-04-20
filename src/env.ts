interface EnvConfig {
  OPENROUTER_API_KEY: string;
  FAL_KEY: string;
}

const ENV_DEFAULTS: EnvConfig = {
  OPENROUTER_API_KEY: '',
  FAL_KEY: ''
};

let ENV_CONFIG: EnvConfig = { ...ENV_DEFAULTS };

if (typeof window !== 'undefined') {
  const storedOpenRouterKey = localStorage.getItem('OPENROUTER_API_KEY');
  const storedFalKey = localStorage.getItem('FAL_KEY');
  
  if (storedOpenRouterKey) ENV_CONFIG.OPENROUTER_API_KEY = storedOpenRouterKey;
  if (storedFalKey) ENV_CONFIG.FAL_KEY = storedFalKey;
} else {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.OPENROUTER_API_KEY) ENV_CONFIG.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (process.env.FAL_KEY) ENV_CONFIG.FAL_KEY = process.env.FAL_KEY;
  }
}

export const ENV = ENV_CONFIG;

export function setApiKey(key: keyof EnvConfig, value: string): void {
  ENV_CONFIG[key] = value;
  
  if (typeof window !== 'undefined' && localStorage) {
    localStorage.setItem(key, value);
  }
}
