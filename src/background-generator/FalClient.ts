import { FalBackground } from './types';

export class FalClient {
  private apiKey: string;
  private endpoint: string = 'https://api.fal.ai/text-to-image';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Generate a background image from a text prompt
   * @param prompt Text prompt describing the background to generate
   * @returns Promise with the generated image URL
   */
  async generateBackground(prompt: string): Promise<FalBackground> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1.0
            }
          ],
          width: 1024,
          height: 576,
          steps: 30,
          style_preset: "pixel-art",
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to generate background: ${data.message || response.statusText}`);
      }
      
      return {
        id: data.id || `bg_${Date.now()}`,
        url: data.image?.url || data.images?.[0]?.url,
        prompt,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating background:', error);
      throw error;
    }
  }
}
