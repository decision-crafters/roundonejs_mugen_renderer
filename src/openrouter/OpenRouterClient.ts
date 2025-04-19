export interface GameState {
  player1: {
    position: { x: number, y: number },
    health: number,
    action: number,
    right: number
  },
  player2: {
    position: { x: number, y: number },
    health: number,
    action: number,
    right: number
  },
  distance: number,
  gameTime: number
}

export interface AIResponse {
  action: number;
  movement: 'forward' | 'backward' | 'jump' | 'crouch' | 'none';
  confidence: number;
}

export class OpenRouterClient {
  private apiKey: string;
  private modelId: string;
  private endpoint: string = 'https://openrouter.ai/api/v1/chat/completions';
  private responseCache: Map<string, AIResponse> = new Map();
  
  constructor(apiKey: string, modelId: string = 'anthropic/claude-3-opus') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }
  
  async getDecision(gameState: GameState): Promise<AIResponse> {
    // Check cache first
    const cacheKey = JSON.stringify(gameState);
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey)!; // Non-null assertion
    }
    
    const prompt = this.buildPrompt(gameState);
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://roundonejs-mugen-renderer.com',
          'X-Title': 'RoundOneJS Mugen Renderer'
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            {
              role: 'system',
              content: 'You are an AI controlling a fighting game character. Respond with JSON containing action, movement, and confidence values based on the game state.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
      });
      
      const data = await response.json();
      
      // Parse and validate the AI response
      const parsedResponse = this.parseResponse(data);
      
      // Cache the response
      this.responseCache.set(cacheKey, parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error('Error getting AI decision:', error);
      // Return a fallback response
      return {
        action: 0,
        movement: 'none',
        confidence: 0
      };
    }
  }
  
  private buildPrompt(gameState: GameState): string {
    return `
    Game State:
    - Your position: x=${gameState.player1.position.x}, y=${gameState.player1.position.y}
    - Your health: ${gameState.player1.health}
    - Your facing direction: ${gameState.player1.right > 0 ? 'right' : 'left'}
    - Your current action: ${gameState.player1.action}
    
    - Opponent position: x=${gameState.player2.position.x}, y=${gameState.player2.position.y}
    - Opponent health: ${gameState.player2.health}
    - Opponent facing direction: ${gameState.player2.right > 0 ? 'right' : 'left'}
    - Opponent current action: ${gameState.player2.action}
    
    - Distance between characters: ${gameState.distance}
    - Game time: ${gameState.gameTime}
    
    Available actions:
    - 0: Standing
    - 100: Walking
    - 120: Jumping
    - 130: Blocking
    - 200: Light Attack
    - 210: Medium Attack
    - 220: Heavy Attack
    - 300: Special Move 1
    - 310: Special Move 2
    
    Available movements:
    - forward: Move toward the opponent
    - backward: Move away from the opponent
    - jump: Jump upward
    - crouch: Crouch down
    - none: Stay in place
    
    Respond with a JSON object containing:
    1. "action": The numeric action code you want to perform
    2. "movement": The movement direction you want to take
    3. "confidence": A number from 0 to 1 indicating how confident you are in this decision
    `;
  }
  
  private parseResponse(data: any): AIResponse {
    try {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      // Validate and sanitize the response
      return {
        action: typeof parsed.action === 'number' ? parsed.action : 0,
        movement: ['forward', 'backward', 'jump', 'crouch', 'none'].includes(parsed.movement) 
          ? parsed.movement : 'none',
        confidence: typeof parsed.confidence === 'number' ? 
          Math.min(1, Math.max(0, parsed.confidence)) : 0.5
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        action: 0,
        movement: 'none',
        confidence: 0
      };
    }
  }
  
  setModel(modelId: string): void {
    this.modelId = modelId;
    this.responseCache.clear();
  }
}
