import { Player } from '../player';
import { AIController, AIPersonality, AIDecision } from './AIController';

export class AIPlayer extends Player {
  aiController: AIController;
  
  constructor(resource, opponent: Player, personality: AIPersonality = AIPersonality.BALANCED) {
    super(resource);
    this.aiControlled = true;
    this.aiController = new AIController(this, opponent, personality);
  }
  
  update(): void {
    if (this.aiControlled) {
      const decision = this.aiController.makeDecision();
      this.applyDecision(decision);
    }
  }
  
  applyDecision(decision: AIDecision): void {
    this.action = decision.action;
    
    switch(decision.movement) {
      case 'forward':
        this.pos.x += (5 * this.right);
        break;
      case 'backward':
        this.pos.x -= (3 * this.right);
        break;
      case 'jump':
        break;
      case 'crouch':
        break;
      case 'none':
      default:
        break;
    }
  }
}
