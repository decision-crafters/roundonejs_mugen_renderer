import { AIController, AIPersonality, AIDecision } from './AIController';
import { Player } from '../player';
import { OpenRouterClient, GameState } from '../openrouter/OpenRouterClient';

export class OpenRouterAIController extends AIController {
  private openRouterClient: OpenRouterClient;
  private fallbackToBuiltIn: boolean = true;
  private lastApiCall: number = 0;
  private apiCallDelay: number = 500; // ms between API calls
  private lastResponse: AIDecision = { action: 0, movement: 'none' };
  
  constructor(
    player: Player, 
    opponent: Player, 
    apiKey: string,
    modelId?: string,
    personality: AIPersonality = AIPersonality.BALANCED
  ) {
    super(player, opponent, personality);
    this.openRouterClient = new OpenRouterClient(apiKey, modelId);
  }
  
  public makeDecision(): AIDecision {
    const now = Date.now();
    
    if (now - this.lastApiCall < this.apiCallDelay) {
      return this.lastResponse;
    }
    
    this.getAIDecision().catch(error => {
      console.error('Error in async AI decision process:', error);
    });
    
    return this.lastResponse;
  }
  
  // New async method to handle OpenRouter API calls
  private async getAIDecision(): Promise<AIDecision> {
    const now = Date.now();
    
    const gameState: GameState = {
      player1: {
        position: this.player.pos,
        health: this.player.health,
        action: this.player.action,
        right: this.player.right
      },
      player2: {
        position: this.opponent.pos,
        health: this.opponent.health,
        action: this.opponent.action,
        right: this.opponent.right
      },
      distance: this.calculateDistance(),
      gameTime: 0 // Would be set from game context
    };
    
    try {
      const aiResponse = await this.openRouterClient.getDecision(gameState);
      this.lastApiCall = now;
      
      this.lastResponse = {
        action: aiResponse.action,
        movement: aiResponse.movement
      };
      
      return this.lastResponse;
    } catch (error) {
      console.error('Error getting AI decision, falling back to built-in logic:', error);
      
      if (this.fallbackToBuiltIn) {
        this.lastResponse = super.makeDecision();
      }
      
      return this.lastResponse;
    }
  }
  
  public setModel(modelId: string): void {
    this.openRouterClient.setModel(modelId);
  }
  
  public setFallbackEnabled(enabled: boolean): void {
    this.fallbackToBuiltIn = enabled;
  }
}
