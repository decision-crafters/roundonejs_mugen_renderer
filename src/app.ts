import * as resource from './resource';
import {Player} from './player';

declare global {
    interface Window {
        mozRequestAnimationFrame?: (callback: () => void) => number;
        oRequestAnimationFrame?: (callback: () => void) => number;
        msRequestAnimationFrame?: (callback: () => void) => number;
    }
}

var requestAnimFrame = (function() {
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

export class RoundOneJSApp {
    player1: Player;
    player2: Player;
    canvasWidth: number;
    canvasHeight: number;
    zoom: number;
    fps: number;
    lastTime: number;
    ctx: CanvasRenderingContext2D;
    isGameOver: boolean;
    gameTime: number;
    score: number;

    constructor(player1, player2, canvasWidth, canvasHeight, zoom) {
        this.player1 = player1;
        this.player2 = player2;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.zoom = zoom;
    }

    static loadCharacters(characters, callback) {
        var resources = [];

        for (var i = 0, length = characters.length; i < length; i++) {
            var character = characters[i];

            resources.push(
                new resource.Resource(character.path, character.name)
            );
        }

        Promise.all(resources.map(function(resource) {
            return resource.load();
        })).then(function() {
            callback.call(this, resources);
        });
    }

    createCanvas() {
        var canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth * this.zoom;
        canvas.height = this.canvasHeight * this.zoom;
        document.body.appendChild(canvas);
        return canvas.getContext('2d');
    }

    main() {
        var now = Date.now();
        var dt = (now - this.lastTime) / 1000.0;
        this.fps = Math.ceil(1000 / (now - this.lastTime));
        
        if (this.player1.aiControlled) this.player1.update();
        if (this.player2.aiControlled) this.player2.update();
        
        this.render();

        this.lastTime = now;
        requestAnimFrame(this.main.bind(this));
    }

    init() {
        this.ctx = this.createCanvas();
        this.reset();
        this.lastTime = Date.now();
        this.main();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.renderPlayer(this.player1);
        this.renderPlayer(this.player2);

        var text = 'FPS:' + this.fps + ' - action:' + this.player1.action;

        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px  Lucida Console';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(text, 10, 20);
    }

    renderPlayer(player) {
        this.ctx.save();
        this.ctx.scale(player.right, 1);

        var groupNumber = (
            player.AIR[player.action].elements[player.currentFrame].groupNumber
        );
        var imageNumber = (
            player.AIR[player.action].elements[player.currentFrame].imageNumber
        );
        var i = player.indexOf(groupNumber, imageNumber);

        var image = resource.decodePCX(
            player.SFF.images[i].image,
            player.palette
        );
        var width = player.right === 1 ? 0 : image.width;

        this.ctx.drawImage(
            image,
            (
                (player.right * (player.pos.x - player.SFF.images[i].x))
                + (player.right * width)
            ),
            player.pos.y - player.SFF.images[i].y
        );

        if (player.AIR[player.action].clsn2Default) {
            var clsn = player.AIR[player.action].clsn2Default;
        } else if (
            player.AIR[player.action].elements[player.currentFrame].clsn2
        ) {
            var clsn = (
                player.AIR[player.action].elements[player.currentFrame].clsn2
            );
        }
        if (clsn) {
            for (i = 0; i < clsn.length; i++) {
                var x = player.pos.x + clsn[i].x;
                var y = player.pos.y + clsn[i].y ;
                var width = clsn[i].x2 - clsn[i].x;
                var height = clsn[i].y2 - clsn[i].y;
                this.ctx.fillStyle = 'rgba(0,0,255,0.2)';
                this.ctx.fillRect(player.right * x, y, player.right * width, height);
            }
        }

        this.checkHitCollision(player);

        /*
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(player.right * player.pos.x, player.pos.y, 1, 1);
        */

        player.currentTime++;
        if (
            player.currentTime
            >= player.AIR[player.action].elements[player.currentFrame].time
        ) {
            player.currentTime = 0;
            player.currentFrame++;
            if (
                player.currentFrame >= player.AIR[player.action].elements.length
            ) {
                player.currentFrame = 0;
            }
        }

        this.ctx.restore();
    }

    private checkHitCollision(attacker) {
        const defender = attacker === this.player1 ? this.player2 : this.player1;
        
        let attackBox = null;
        if (attacker.AIR[attacker.action].elements[attacker.currentFrame].clsn1) {
            attackBox = attacker.AIR[attacker.action].elements[attacker.currentFrame].clsn1;
        }
        
        let defenseBox = null;
        if (defender.AIR[defender.action].clsn2Default) {
            defenseBox = defender.AIR[defender.action].clsn2Default;
        } else if (defender.AIR[defender.action].elements[defender.currentFrame].clsn2) {
            defenseBox = defender.AIR[defender.action].elements[defender.currentFrame].clsn2;
        }
        
        if (attackBox && defenseBox) {
            for (let i = 0; i < attackBox.length; i++) {
                for (let j = 0; j < defenseBox.length; j++) {
                    if (this.boxesCollide(
                        attacker.pos.x + attackBox[i].x * attacker.right, 
                        attacker.pos.y + attackBox[i].y,
                        attackBox[i].x2 - attackBox[i].x,
                        attackBox[i].y2 - attackBox[i].y,
                        defender.pos.x + defenseBox[j].x * defender.right,
                        defender.pos.y + defenseBox[j].y,
                        defenseBox[j].x2 - defenseBox[j].x,
                        defenseBox[j].y2 - defenseBox[j].y
                    )) {
                        this.applyHit(attacker, defender);
                        return;
                    }
                }
            }
        }
    }

    private boxesCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
    }

    private applyHit(attacker, defender) {
        const damage = 5; // Basic damage, can be refined based on action type
        defender.takeDamage(damage);
        
        const knockback = 10 * attacker.right;
        defender.pos.x += knockback;
    }

    reset() {
        this.isGameOver = false;
        this.gameTime = 0;

        this.score = 0;

        this.ctx.scale(this.zoom || 1, this.zoom || 1);
    }
}
