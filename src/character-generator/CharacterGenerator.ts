import { Player } from '../player';

export interface CharacterTemplate {
  name: string;
  displayName: string;
  moveSet: {
    standing: number[];
    walking: number[];
    jumping: number[];
    attacking: number[];
    special: number[];
  };
  palette: number[][];
  stats: {
    health: number;
    speed: number;
    power: number;
    defense: number;
  };
}

export interface CharacterResource {
  name: string;
  path: string;
  DEF: any;
  AIR: any;
  SFF: any;
  ACT: any;
  palette: any;
}

export class CharacterGenerator {
  private templates: CharacterTemplate[] = [];
  private baseCharacters: CharacterResource[] = [];
  
  constructor(baseCharacters: CharacterResource[] = []) {
    this.baseCharacters = baseCharacters;
    this.initializeTemplates();
  }
  
  /**
   * Initialize templates from base characters or create default templates
   */
  private initializeTemplates(): void {
    if (this.baseCharacters.length > 0) {
      this.baseCharacters.forEach(character => {
        const template: CharacterTemplate = this.analyzeCharacter(character);
        this.templates.push(template);
      });
    } else {
      this.createDefaultTemplates();
    }
  }
  
  /**
   * Analyze a character to create a template
   */
  private analyzeCharacter(character: CharacterResource): CharacterTemplate {
    return {
      name: character.name,
      displayName: character.DEF?.info?.displayname || character.name,
      moveSet: this.extractMoveSet(character),
      palette: character.palette || [],
      stats: this.extractStats(character)
    };
  }
  
  /**
   * Extract move set from character data
   */
  private extractMoveSet(character: CharacterResource): CharacterTemplate['moveSet'] {
    const defaultMoveSet = {
      standing: [0],
      walking: [100],
      jumping: [120],
      attacking: [200, 210, 220],
      special: [300, 310]
    };
    
    if (character.AIR) {
      const moveSet: CharacterTemplate['moveSet'] = {
        standing: [],
        walking: [],
        jumping: [],
        attacking: [],
        special: []
      };
      
      Object.keys(character.AIR).forEach(actionKey => {
        const actionNum = parseInt(actionKey, 10);
        if (isNaN(actionNum)) return;
        
        if (actionNum === 0) {
          moveSet.standing.push(actionNum);
        } else if (actionNum >= 100 && actionNum < 120) {
          moveSet.walking.push(actionNum);
        } else if (actionNum >= 120 && actionNum < 200) {
          moveSet.jumping.push(actionNum);
        } else if (actionNum >= 200 && actionNum < 300) {
          moveSet.attacking.push(actionNum);
        } else if (actionNum >= 300) {
          moveSet.special.push(actionNum);
        }
      });
      
      return {
        standing: moveSet.standing.length > 0 ? moveSet.standing : defaultMoveSet.standing,
        walking: moveSet.walking.length > 0 ? moveSet.walking : defaultMoveSet.walking,
        jumping: moveSet.jumping.length > 0 ? moveSet.jumping : defaultMoveSet.jumping,
        attacking: moveSet.attacking.length > 0 ? moveSet.attacking : defaultMoveSet.attacking,
        special: moveSet.special.length > 0 ? moveSet.special : defaultMoveSet.special
      };
    }
    
    return defaultMoveSet;
  }
  
  /**
   * Extract stats from character data
   */
  private extractStats(character: CharacterResource): CharacterTemplate['stats'] {
    const defaultStats = {
      health: 100,
      speed: 5,
      power: 5,
      defense: 5
    };
    
    if (character.DEF?.info) {
      return {
        health: character.DEF.info.health || defaultStats.health,
        speed: character.DEF.info.speed || defaultStats.speed,
        power: character.DEF.info.power || defaultStats.power,
        defense: character.DEF.info.defense || defaultStats.defense
      };
    }
    
    return defaultStats;
  }
  
  /**
   * Create default templates when no base characters are available
   */
  private createDefaultTemplates(): void {
    const balancedFighter: CharacterTemplate = {
      name: 'balanced_fighter',
      displayName: 'Balanced Fighter',
      moveSet: {
        standing: [0],
        walking: [100],
        jumping: [120],
        attacking: [200, 210, 220],
        special: [300, 310]
      },
      palette: [],
      stats: {
        health: 100,
        speed: 5,
        power: 5,
        defense: 5
      }
    };
    
    const speedFighter: CharacterTemplate = {
      name: 'speed_fighter',
      displayName: 'Speed Fighter',
      moveSet: {
        standing: [0],
        walking: [100, 101],
        jumping: [120, 121],
        attacking: [200, 201, 202],
        special: [300, 301]
      },
      palette: [],
      stats: {
        health: 80,
        speed: 8,
        power: 4,
        defense: 3
      }
    };
    
    const powerFighter: CharacterTemplate = {
      name: 'power_fighter',
      displayName: 'Power Fighter',
      moveSet: {
        standing: [0],
        walking: [100],
        jumping: [120],
        attacking: [200, 210, 220, 230],
        special: [300, 310, 320]
      },
      palette: [],
      stats: {
        health: 120,
        speed: 3,
        power: 8,
        defense: 6
      }
    };
    
    this.templates.push(balancedFighter, speedFighter, powerFighter);
  }
  
  /**
   * Get all available templates
   */
  public getTemplates(): CharacterTemplate[] {
    return this.templates;
  }
  
  /**
   * Generate a character based on a template with optional modifications
   */
  public generateCharacter(templateIndex: number = 0, modifications: Partial<CharacterTemplate> = {}): CharacterResource {
    const template = this.templates[templateIndex % this.templates.length];
    const baseCharacter = this.baseCharacters.length > 0 
      ? this.baseCharacters[templateIndex % this.baseCharacters.length]
      : null;
    
    const newCharacter: CharacterResource = {
      name: modifications.name || `generated_${Date.now()}`,
      path: baseCharacter ? baseCharacter.path : '',
      DEF: baseCharacter ? JSON.parse(JSON.stringify(baseCharacter.DEF)) : {},
      AIR: baseCharacter ? JSON.parse(JSON.stringify(baseCharacter.AIR)) : {},
      SFF: baseCharacter ? JSON.parse(JSON.stringify(baseCharacter.SFF)) : {},
      ACT: baseCharacter ? JSON.parse(JSON.stringify(baseCharacter.ACT)) : {},
      palette: baseCharacter ? JSON.parse(JSON.stringify(baseCharacter.palette)) : []
    };
    
    this.applyTemplate(newCharacter, template);
    this.applyModifications(newCharacter, modifications);
    
    return newCharacter;
  }
  
  /**
   * Apply a template to a character
   */
  private applyTemplate(character: CharacterResource, template: CharacterTemplate): void {
    if (character.DEF) {
      if (!character.DEF.info) character.DEF.info = {};
      character.DEF.info.displayname = template.displayName;
      character.DEF.info.health = template.stats.health;
      character.DEF.info.speed = template.stats.speed;
      character.DEF.info.power = template.stats.power;
      character.DEF.info.defense = template.stats.defense;
    }
    
    if (template.palette.length > 0) {
      character.palette = template.palette;
    }
    
  }
  
  /**
   * Apply modifications to a character
   */
  private applyModifications(character: CharacterResource, modifications: Partial<CharacterTemplate>): void {
    if (modifications.name) {
      character.name = modifications.name;
    }
    
    if (modifications.displayName && character.DEF?.info) {
      character.DEF.info.displayname = modifications.displayName;
    }
    
    if (modifications.stats && character.DEF?.info) {
      if (modifications.stats.health) character.DEF.info.health = modifications.stats.health;
      if (modifications.stats.speed) character.DEF.info.speed = modifications.stats.speed;
      if (modifications.stats.power) character.DEF.info.power = modifications.stats.power;
      if (modifications.stats.defense) character.DEF.info.defense = modifications.stats.defense;
    }
    
    if (modifications.palette) {
      character.palette = modifications.palette;
    }
    
  }
  
  /**
   * Generate a random character
   */
  public generateRandomCharacter(): CharacterResource {
    const templateIndex = Math.floor(Math.random() * this.templates.length);
    
    const modifications: Partial<CharacterTemplate> = {
      displayName: `Random Fighter ${Date.now()}`,
      stats: {
        health: 80 + Math.floor(Math.random() * 40),
        speed: 3 + Math.floor(Math.random() * 5),
        power: 3 + Math.floor(Math.random() * 5),
        defense: 3 + Math.floor(Math.random() * 5)
      }
    };
    
    return this.generateCharacter(templateIndex, modifications);
  }
  
  /**
   * Evaluate a character's balance
   * Returns a score from 0-100, where higher is more balanced
   */
  public evaluateCharacter(character: CharacterResource): number {
    const stats = {
      health: character.DEF?.info?.health || 100,
      speed: character.DEF?.info?.speed || 5,
      power: character.DEF?.info?.power || 5,
      defense: character.DEF?.info?.defense || 5
    };
    
    const total = stats.health / 20 + stats.speed + stats.power + stats.defense; // Normalize health
    const average = total / 4;
    
    const variance = Math.sqrt(
      Math.pow(stats.health / 20 - average, 2) +
      Math.pow(stats.speed - average, 2) +
      Math.pow(stats.power - average, 2) +
      Math.pow(stats.defense - average, 2)
    ) / average;
    
    const balanceScore = Math.max(0, 100 - variance * 25);
    
    let moveSetScore = 100;
    if (character.AIR) {
      const moveTypes = {
        standing: 0,
        walking: 0,
        jumping: 0,
        attacking: 0,
        special: 0
      };
      
      Object.keys(character.AIR).forEach(actionKey => {
        const actionNum = parseInt(actionKey, 10);
        if (isNaN(actionNum)) return;
        
        if (actionNum === 0) {
          moveTypes.standing++;
        } else if (actionNum >= 100 && actionNum < 120) {
          moveTypes.walking++;
        } else if (actionNum >= 120 && actionNum < 200) {
          moveTypes.jumping++;
        } else if (actionNum >= 200 && actionNum < 300) {
          moveTypes.attacking++;
        } else if (actionNum >= 300) {
          moveTypes.special++;
        }
      });
      
      const totalMoves = Object.values(moveTypes).reduce((sum, count) => sum + count, 0);
      if (totalMoves > 0) {
        const idealAttackRatio = 0.4; // 40% of moves should be attacks
        const idealSpecialRatio = 0.2; // 20% of moves should be specials
        
        const attackRatio = moveTypes.attacking / totalMoves;
        const specialRatio = moveTypes.special / totalMoves;
        
        moveSetScore -= Math.abs(attackRatio - idealAttackRatio) * 100;
        moveSetScore -= Math.abs(specialRatio - idealSpecialRatio) * 100;
        moveSetScore = Math.max(0, moveSetScore);
      }
    }
    
    return balanceScore * 0.7 + moveSetScore * 0.3;
  }
  
  /**
   * Save a character to file (placeholder - would require server-side implementation)
   */
  public saveCharacterToFile(character: CharacterResource): void {
    console.log(`Character ${character.name} would be saved to ${character.path}`);
  }
  
  /**
   * Load a character from file (placeholder - would require server-side implementation)
   */
  public static loadCharacterFromFile(path: string): Promise<CharacterResource> {
    return new Promise((resolve, reject) => {
      console.log(`Loading character from ${path}`);
      reject(new Error('Not implemented - requires server-side implementation'));
    });
  }
}
