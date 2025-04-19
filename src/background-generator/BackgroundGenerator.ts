import { FalClient } from './FalClient';
import { FalBackground, BackgroundType, BackgroundPrompts } from './types';
import { FAL_CONFIG } from './config';

export class BackgroundGenerator {
  private client: FalClient;
  private cachedBackgrounds: Map<BackgroundType, FalBackground[]> = new Map();
  
  constructor(apiKey: string = FAL_CONFIG.API_KEY) {
    this.client = new FalClient(apiKey);
    
    Object.values(BackgroundType).forEach(type => {
      this.cachedBackgrounds.set(type, []);
    });
  }
  
  /**
   * Generate a background image from a predefined type
   * @param type The type of background to generate
   * @returns Promise with the generated background
   */
  async generateBackgroundByType(type: BackgroundType): Promise<FalBackground> {
    const prompt = BackgroundPrompts[type];
    
    const cachedBackgrounds = this.cachedBackgrounds.get(type) || [];
    if (cachedBackgrounds.length > 0) {
      return cachedBackgrounds[Math.floor(Math.random() * cachedBackgrounds.length)];
    }
    
    const background = await this.generateBackgroundByPrompt(prompt);
    
    cachedBackgrounds.push(background);
    this.cachedBackgrounds.set(type, cachedBackgrounds);
    
    return background;
  }
  
  /**
   * Generate a background image from a custom prompt
   * @param prompt Text prompt describing the background to generate
   * @returns Promise with the generated background
   */
  async generateBackgroundByPrompt(prompt: string): Promise<FalBackground> {
    return this.client.generateBackground(prompt);
  }
  
  /**
   * Get all cached backgrounds
   * @returns Map of background types to arrays of backgrounds
   */
  getCachedBackgrounds(): Map<BackgroundType, FalBackground[]> {
    return this.cachedBackgrounds;
  }
  
  /**
   * Clear the background cache
   */
  clearCache(): void {
    Object.values(BackgroundType).forEach(type => {
      this.cachedBackgrounds.set(type, []);
    });
  }
}
