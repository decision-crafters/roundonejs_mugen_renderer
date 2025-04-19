# RoundOne.js Mugen Renderer

This project uses mugen's file formats in JavaScript (DEF, AIR, SFF and ACT files) to display and animate into canvas.

## AI Integration Research Project

This project explores the integration of artificial intelligence into fighting games, using RoundOneJS as a platform for research and experimentation. The primary goal is to investigate how different AI models can be used to create engaging, dynamic, and challenging gameplay experiences.

### Research Goals

1. **AI-Controlled Combat System**
   - Develop a built-in AI logic system that can analyze distances, detect opponent actions, and make strategic decisions
   - Compare different AI personalities (aggressive, defensive, balanced) and their impact on gameplay
   - Integrate external AI models via OpenRouter to enhance decision-making capabilities
   - Study the effectiveness of AI in fighting game contexts

2. **Model Comparison Framework**
   - Create a testing framework to evaluate different AI models (Claude, GPT, etc.)
   - Measure performance metrics such as win rate, decision quality, and response time
   - Generate comparative reports to identify strengths and weaknesses of different models
   - Explore the potential for AI model specialization in fighting games

3. **Character Generation Research**
   - Investigate procedural generation of fighting game characters
   - Develop templates and balancing mechanisms for auto-generated characters
   - Study the relationship between character design and AI performance
   - Explore the creative potential of AI in character development

4. **Arcade Mode & Dynamic Difficulty**
   - Research dynamic difficulty adjustment based on player performance
   - Implement story-driven progression with AI-generated narrative elements
   - Study player engagement with AI-controlled opponents of varying difficulty
   - Explore the potential for personalized gaming experiences

### Demo Implementation

The project includes a comprehensive demo that showcases these research areas:
- Both players can be controlled by different AI models simultaneously
- Multiple AI personalities and models can be selected and compared
- Character generation capabilities can be tested
- Arcade mode with dynamic difficulty can be experienced
- Model testing framework provides performance metrics

## About M.U.G.E.N.

M.U.G.E.N is a 2D fighting game engine with many customizable components.

### DEF files

The definitions file (.def) is the most commonly used file in the M.U.G.E.N engine, as it is required for any content to function properly.

This file tells the engine what files the content uses and where they are located, what characters to be included on the select screen and their locations, what stages to be included, what stages the characters are to be fought on in Arcade mode, what order they appear in and how many can be fought per order, etc. 

### AIR files

The animations file (.air) plays a major role in any character, as without it, the character would not actually appear on-screen. It determines what sprites are used for each action a character does, what order they appear in, alpha transparency, the rotation of the sprites in the animation, the hit/collision boxes, and how fast the animations play. 

### SFF files

The sprites file (.sff) contains every image (sprite) used by a stage, character, screenpack, etc. Because M.U.G.E.N runs off indexed images with 256 colour palettes, transparency has to be a single forced colour rather than actual transparency. If a sprite isn't indexed, it runs off the palette of the computer's operating system, with the default transparency colour being black. 

### ACT files

Palette files (.act) are the 256 colour data files that determine what colours go where on a character. A single M.U.G.E.N character can have up to 12 act files that can be read by the M.U.G.E.N engine - these are determined by the .def file. 

### Usage

1. [Install Node.js](https://nodejs.org/en/download/package-manager/);
2. [Install the dependencies](https://docs.npmjs.com/cli/install);
3. Run node command build;
```
npm run build
```
4. Import `dist/roundonejs_mugen_renderer.js` file on page;
```html
<script type="text/javascript" src="roundonejs_mugen_renderer.js"></script>
```
5. Load characters and init **roundonejs_mugen_renderer.js**;
```js
var app = require('app');
var player = require('player');
var canvasWidth = 720;
var canvasHeight = 540;

app.loadCharacters(
    [
        {
            'path': 'chars',
            'name': 'Nanoha_Tsukikage'
        },
        {
            'path': 'chars',
            'name': 'Natsuka_Fuou'
        }
    ],
    function(resources) {
        var player1 = new player.Player(resources[0]);
        player1.pos = {
            x: canvasWidth / 2 - 200,
            y: canvasHeight - 140
        };
        player1.palette = player1.SFF.palette;
        player1.right = 1;

        var player2 = new player.Player(resources[1]);
        player2.pos = {
            x: canvasWidth / 2 + 200,
            y: canvasHeight - 140
        };
        player2.palette = player2.SFF.palette;
        player2.right = -1;

        app.init(player1, player2, canvasWidth, canvasHeight, 1);
    }
);
```
