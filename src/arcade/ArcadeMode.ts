import { Player } from '../player';
import { AIPlayer } from '../ai/AIPlayer';
import { RoundOneJSApp } from '../app';
import { AIPersonality } from '../ai/AIController';

export interface ArcadeStage {
  opponent: string;
  difficulty: number;
  storyText: string;
}

export enum ArcadeLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long'
}

export class ArcadeMode {
  private app: RoundOneJSApp;
  private player: Player;
  private stages: ArcadeStage[];
  private currentStage: number = 0;
  private stagesPath: string;
  private storyElement: HTMLElement;
  private loadingCallback: () => void;
  
  constructor(
    app: RoundOneJSApp, 
    player: Player, 
    stagesPath: string,
    arcadeLength: ArcadeLength = ArcadeLength.MEDIUM
  ) {
    this.app = app;
    this.player = player;
    this.stagesPath = stagesPath;
    this.stages = this.generateStages(arcadeLength);
    
    this.storyElement = document.createElement('div');
    this.storyElement.className = 'arcade-story';
    this.storyElement.style.position = 'absolute';
    this.storyElement.style.top = '20%';
    this.storyElement.style.left = '10%';
    this.storyElement.style.width = '80%';
    this.storyElement.style.background = 'rgba(0,0,0,0.8)';
    this.storyElement.style.color = 'white';
    this.storyElement.style.padding = '20px';
    this.storyElement.style.borderRadius = '10px';
    this.storyElement.style.display = 'none';
    document.body.appendChild(this.storyElement);
  }
  
  private generateStages(length: ArcadeLength): ArcadeStage[] {
    const stageCount = {
      [ArcadeLength.SHORT]: 3,
      [ArcadeLength.MEDIUM]: 6,
      [ArcadeLength.LONG]: 10
    }[length];
    
    const stages: ArcadeStage[] = [];
    
    for (let i = 0; i < stageCount; i++) {
      stages.push({
        opponent: `opponent_${i+1}`,
        difficulty: Math.min(10, Math.floor(i * 10 / stageCount) + 1),
        storyText: `Stage ${i+1}: Facing opponent ${i+1}`
      });
    }
    
    return stages;
  }
  
  public startArcade(loadingCallback: () => void): void {
    this.loadingCallback = loadingCallback;
    this.currentStage = 0;
    this.loadStage(this.currentStage);
  }
  
  private loadStage(stageIndex: number): void {
    if (stageIndex >= this.stages.length) {
      this.showEnding();
      return;
    }
    
    const stage = this.stages[stageIndex];
    
    this.showStory(stage.storyText, () => {
      const charPath = `${this.stagesPath}/${stage.opponent}`;
      this.loadOpponent(charPath, stage.opponent, (opponent) => {
        const personalityIndex = stage.difficulty % 3;
        const personalities = [
          AIPersonality.BALANCED,
          AIPersonality.AGGRESSIVE,
          AIPersonality.DEFENSIVE
        ];
        opponent.aiController.setPersonality(personalities[personalityIndex]);
        
        this.app.player2 = opponent;
        
        this.player.pos.x = this.app.canvasWidth / 2 - 200;
        this.player.health = this.player.maxHealth;
        opponent.pos.x = this.app.canvasWidth / 2 + 200;
        opponent.right = -1;
        
        this.loadingCallback();
        
        const checkInterval = setInterval(() => {
          if (opponent.isDefeated()) {
            clearInterval(checkInterval);
            this.loadStage(this.currentStage + 1);
          } else if (this.player.isDefeated()) {
            clearInterval(checkInterval);
            this.showGameOver();
          }
        }, 100);
      });
    });
  }
  
  private loadOpponent(charPath: string, name: string, callback: (opponent: AIPlayer) => void): void {
    fetch(`${charPath}/def.json`)
      .then(response => response.json())
      .then(data => {
        const resource = {
          DEF: data,
          SFF: { images: [] },
          AIR: {},
          palette: {}
        };
        
        const opponent = new AIPlayer(resource, this.player);
        callback(opponent);
      })
      .catch(error => {
        console.error('Error loading opponent:', error);
        const defaultResource = {
          DEF: {},
          SFF: { images: [] },
          AIR: {},
          palette: {}
        };
        const opponent = new AIPlayer(defaultResource, this.player);
        callback(opponent);
      });
  }
  
  private showStory(text: string, callback: () => void): void {
    this.storyElement.innerHTML = text;
    this.storyElement.style.display = 'block';
    
    const continueBtn = document.createElement('button');
    continueBtn.innerText = 'Continue';
    continueBtn.style.marginTop = '20px';
    continueBtn.style.padding = '10px 20px';
    continueBtn.addEventListener('click', () => {
      this.storyElement.style.display = 'none';
      callback();
    });
    this.storyElement.appendChild(continueBtn);
  }
  
  private showGameOver(): void {
    this.showStory('Game Over! You have been defeated.', () => {
      this.app.reset();
    });
  }
  
  private showEnding(): void {
    this.showStory('Congratulations! You have completed the arcade mode!', () => {
      this.app.reset();
    });
  }
  
  public adjustDifficulty(): void {
    const currentStage = this.stages[this.currentStage];
    const playerHealthPercent = this.player.health / this.player.maxHealth;
    
    if (playerHealthPercent > 0.8) {
      currentStage.difficulty = Math.min(10, currentStage.difficulty + 1);
    } else if (playerHealthPercent < 0.3) {
      currentStage.difficulty = Math.max(1, currentStage.difficulty - 1);
    }
  }
}
