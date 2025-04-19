import {Palette, SFFType, DEFLoaded} from './resource';

interface Position {
    x: number;
    y: number;
}

export class Player {
    pos: Position;
    action: number;
    currentFrame: number;
    currentTime: number;
    right: number;
    palette: Palette;
    SFF: SFFType;
    DEF: DEFLoaded;
    AIR: any; // Animation and collision data
    health: number;
    maxHealth: number;
    aiControlled: boolean;
    aiController: any; // Will be properly typed in AIPlayer class

    constructor(resource) {
        this.pos = {
            x: 0,
            y: 0
        };
        this.action = 0;
        this.currentFrame = 0;
        this.currentTime = 0;
        this.right = 1;
        this.palette = null;
        this.health = 100;
        this.maxHealth = 100;
        this.aiControlled = false;

        var hasOwn = Object.prototype.hasOwnProperty;
        if (typeof resource != 'object') {
            throw TypeError('player - ressource incorrect');
        }
        var properties = Object(resource);
        for (var prop in properties) {
            if (hasOwn.call(properties, prop)) {
                this[prop] = properties[prop];
            }
        }
    }

    indexOf(groupNumber, imageNumber) {
        if (this.SFF == null) {
            throw new TypeError('indexOf - SFF not defined.');
        }
        for (var i = 0; i < this.SFF.images.length; i++) {
            if (
                (this.SFF.images[i].groupNumber === groupNumber)
                && (this.SFF.images[i].imageNumber === imageNumber)
            ) {
                return i;
            }
        }
        return -1;
    }
    
    takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
    }
    
    heal(amount: number): void {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    isDefeated(): boolean {
        return this.health <= 0;
    }
    
    update(): void {
        // Base implementation - will be overridden in AIPlayer
    }
}
