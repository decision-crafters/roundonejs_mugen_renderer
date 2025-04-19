import { OpenRouterClient, GameState, AIResponse } from './OpenRouterClient';
import { Player } from '../player';
import { RoundOneJSApp } from '../app';

export interface ModelTestResult {
  modelId: string;
  winRate: number;
  averageConfidence: number;
  averageResponseTime: number;
  decisionsPerSecond: number;
  totalMatches: number;
}

export class ModelTester {
  private apiKey: string;
  private models: string[] = [];
  private results: Map<string, ModelTestResult> = new Map();
  private app: RoundOneJSApp;
  
  constructor(apiKey: string, app: RoundOneJSApp) {
    this.apiKey = apiKey;
    this.app = app;
  }
  
  public addModel(modelId: string): void {
    if (!this.models.includes(modelId)) {
      this.models.push(modelId);
      this.results.set(modelId, {
        modelId,
        winRate: 0,
        averageConfidence: 0,
        averageResponseTime: 0,
        decisionsPerSecond: 0,
        totalMatches: 0
      });
    }
  }
  
  public async testModel(modelId: string, numMatches: number = 10): Promise<ModelTestResult> {
    if (!this.models.includes(modelId)) {
      this.addModel(modelId);
    }
    
    const client = new OpenRouterClient(this.apiKey, modelId);
    let wins = 0;
    let totalConfidence = 0;
    let totalResponseTime = 0;
    let totalDecisions = 0;
    
    for (let i = 0; i < numMatches; i++) {
      const result = await this.runTestMatch(client);
      wins += result.win ? 1 : 0;
      totalConfidence += result.averageConfidence;
      totalResponseTime += result.totalResponseTime;
      totalDecisions += result.decisions;
    }
    
    const result: ModelTestResult = {
      modelId,
      winRate: wins / numMatches,
      averageConfidence: totalConfidence / numMatches,
      averageResponseTime: totalResponseTime / totalDecisions,
      decisionsPerSecond: totalDecisions / (totalResponseTime / 1000),
      totalMatches: numMatches
    };
    
    this.results.set(modelId, result);
    return result;
  }
  
  private async runTestMatch(client: OpenRouterClient): Promise<{
    win: boolean;
    averageConfidence: number;
    totalResponseTime: number;
    decisions: number;
  }> {
    const player1 = this.app.player1;
    const player2 = this.app.player2;
    
    player1.health = player1.maxHealth;
    player2.health = player2.maxHealth;
    player1.pos.x = this.app.canvasWidth / 2 - 200;
    player2.pos.x = this.app.canvasWidth / 2 + 200;
    
    let totalConfidence = 0;
    let totalResponseTime = 0;
    let decisions = 0;
    let matchRunning = true;
    
    while (matchRunning && decisions < 100) { // Limit to 100 decisions to prevent infinite loops
      const gameState: GameState = {
        player1: {
          position: player1.pos,
          health: player1.health,
          action: player1.action,
          right: player1.right
        },
        player2: {
          position: player2.pos,
          health: player2.health,
          action: player2.action,
          right: player2.right
        },
        distance: Math.abs(player1.pos.x - player2.pos.x),
        gameTime: 0
      };
      
      const startTime = Date.now();
      const response = await client.getDecision(gameState);
      const endTime = Date.now();
      
      totalResponseTime += (endTime - startTime);
      totalConfidence += response.confidence;
      decisions++;
      
      player1.action = response.action;
      
      switch(response.movement) {
        case 'forward':
          player1.pos.x += 5 * player1.right;
          break;
        case 'backward':
          player1.pos.x -= 3 * player1.right;
          break;
        case 'jump':
          break;
        case 'crouch':
          break;
      }
      
      if (Math.abs(player1.pos.x - player2.pos.x) > 100) {
        player2.pos.x -= 3 * player2.right;
        player2.action = 100; // walking
      } else {
        player2.action = 200; // attack
        
        if (Math.abs(player1.pos.x - player2.pos.x) < 50 && player1.action !== 130) {
          player1.takeDamage(5);
        }
      }
      
      if (player1.health <= 0 || player2.health <= 0) {
        matchRunning = false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return {
      win: player2.health <= 0,
      averageConfidence: totalConfidence / decisions,
      totalResponseTime,
      decisions
    };
  }
  
  public async testModels(numMatchesPerModel: number = 10): Promise<ModelTestResult[]> {
    const results: ModelTestResult[] = [];
    
    for (const modelId of this.models) {
      const result = await this.testModel(modelId, numMatchesPerModel);
      results.push(result);
    }
    
    return this.compareModels();
  }
  
  public compareModels(): ModelTestResult[] {
    return Array.from(this.results.values()).sort((a, b) => b.winRate - a.winRate);
  }
  
  public generateReport(): string {
    const models = this.compareModels();
    let report = '# AI Model Comparison Report\n\n';
    
    report += '| Model | Win Rate | Avg. Confidence | Response Time | Decisions/sec | Matches |\n';
    report += '|-------|----------|----------------|---------------|--------------|--------|\n';
    
    models.forEach(model => {
      report += `| ${model.modelId} | ${(model.winRate * 100).toFixed(1)}% | ${model.averageConfidence.toFixed(2)} | ${model.averageResponseTime.toFixed(0)}ms | ${model.decisionsPerSecond.toFixed(1)} | ${model.totalMatches} |\n`;
    });
    
    return report;
  }
  
  public getModelResults(modelId: string): ModelTestResult | undefined {
    return this.results.get(modelId);
  }
  
  public clearResults(): void {
    this.results.clear();
    this.models.forEach(modelId => {
      this.results.set(modelId, {
        modelId,
        winRate: 0,
        averageConfidence: 0,
        averageResponseTime: 0,
        decisionsPerSecond: 0,
        totalMatches: 0
      });
    });
  }
}
