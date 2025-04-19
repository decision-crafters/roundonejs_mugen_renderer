import { Player } from '../player';

export enum AIPersonality {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced'
}

export interface AIDecision {
  action: number;
  movement: 'forward' | 'backward' | 'jump' | 'crouch' | 'none';
}

export class AIController {
  protected player: Player;
  protected opponent: Player;
  protected personality: AIPersonality;
  private lastDecisionTime: number;
  private decisionDelay: number;
  
  public setPersonality(personality: AIPersonality): void {
    this.personality = personality;
  }
  
  constructor(player: Player, opponent: Player, personality: AIPersonality = AIPersonality.BALANCED) {
    this.player = player;
    this.opponent = opponent;
    this.personality = personality;
    this.lastDecisionTime = 0;
    this.decisionDelay = 10; // frames between decisions
  }
  
  public makeDecision(): AIDecision {
    const distance = this.calculateDistance();
    
    switch(this.personality) {
      case AIPersonality.AGGRESSIVE:
        return this.makeAggressiveDecision(distance);
      case AIPersonality.DEFENSIVE:
        return this.makeDefensiveDecision(distance);
      case AIPersonality.BALANCED:
      default:
        return this.makeBalancedDecision(distance);
    }
  }
  
  protected calculateDistance(): number {
    return Math.abs(this.player.pos.x - this.opponent.pos.x);
  }
  
  private makeAggressiveDecision(distance: number): AIDecision {
    if (distance > 100) {
      return {
        action: 0, // standup action
        movement: 'forward'
      };
    } else {
      return {
        action: 200, // attack action
        movement: 'none'
      };
    }
  }
  
  private makeDefensiveDecision(distance: number): AIDecision {
    if (distance < 50) {
      return {
        action: 130, // blocking action
        movement: 'backward'
      };
    } else {
      return {
        action: 0,
        movement: 'none'
      };
    }
  }
  
  private makeBalancedDecision(distance: number): AIDecision {
    if (distance > 150) {
      return {
        action: 0,
        movement: 'forward'
      };
    } else if (distance < 50) {
      return {
        action: Math.random() > 0.5 ? 200 : 130,
        movement: Math.random() > 0.5 ? 'backward' : 'none'
      };
    } else {
      return {
        action: Math.random() > 0.7 ? 200 : 0,
        movement: Math.random() > 0.5 ? 'forward' : 'none'
      };
    }
  }
}
