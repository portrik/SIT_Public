'use strict';

class Game {

    constructor(player, world, virusSprite, bonusSprite) {
        this.player = player;
        this.world = world;
        this.score = 0;
        this.eliminated = 0;
        this.missed = 0;
        this.virus = new Virus(virusSprite);
        this.bonus = new Virus(bonusSprite);

        this.updateValues();
    }

    spawnEnemy() {
        this.world.spawnEnemy(this.virus);
    }

    updateValues() {
        document.getElementById('score').innerText = this.score;
        document.getElementById('eliminated').innerText = this.eliminated;
        document.getElementById('missed').innerText = this.missed;
    }

    scoreUp(value = 1) {
        this.score += value;
        this.updateValues();
    }

    scoreDown(value = 1) {
        this.score -= value;
        this.world.moveCover();
        this.updateValues();
    }
}

class Player {

    constructor(name) {
        this.score = 0;
        this.health = 100;
        this.name = name;
    }
}

class Virus {
    
    constructor(sprite) {
        this.sprite = sprite;
    }
}

class World {

    constructor(sprite) {
        this.gameArea = document.getElementById('game-area');
        this.gameArea.innerText = '';
        this.fillStyle = 'rgba(219, 0, 0, 0.59)';

        this.calculateSize();
        this.gameArea.style.width = this.width + 'px';
        this.gameArea.style.height = this.height + 'px';
        this.gameArea.style.backgroundSize = this.width + 'px '+ this.height + 'px';
        this.gameArea.style.backgroundImage = sprite;
        this.gameArea.style.backgroundRepeat = 'no-repeat';
        
        this.ctx = this.gameArea.getContext('2d');
        this.fill = 0;
    }

    moveCover() {
        this.ctx.clearRect(0, 0, this.fill, this.height);
        this.fill += 10;
        
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.fill, this.height);
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fill();
    }

    calculateSize() {
        let height = window.innerHeight;
        let width = window.innerWidth;

        if (height > width) {
            width = Math.round(width * 0.9);
            height = Math.round((width / 16) * 9);
        }
        else {
            height = Math.round(height * 0.9);
            width = Math.round((height / 9) * 16);
        }

        this.height = height;
        this.width = width;
    }

    spawnEnemy(enemy) {
        let spawnX = Math.round(Math.random() * (this.width * 0.9));
        let spawnY = Math.round(Math.random() * (this.height * 0.9));

        let img = new Image();
        img.src = './assets/virus.png';

        this.ctx.drawImage(img, spawnX, spawnY, 100, 100);
    }
}

function initGame() {
    let assetWorld = new Image();
    assetWorld.src = './assets/world.svg';
    let assetVirus = new Image();
    assetVirus.src = './assets/virus.png';
    let assetBonus = new Image();
    assetBonus.src = './assets/bonus.png';

    let world = new World('url(./assets/world.svg)');
    let player = new Player('Patrik');
    let game = new Game(player, world, assetVirus, assetBonus);

    game.spawnEnemy();
    game.spawnEnemy();
    game.spawnEnemy();
    game.spawnEnemy();
    game.spawnEnemy();
    game.spawnEnemy();
    game.spawnEnemy();
}

document.getElementById('game-area').addEventListener('load', initGame());