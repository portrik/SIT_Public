'use strict';

class World {

    /**
     * Initializes World on world-area and game-area
     */
    constructor() {
        this.ready = false;
        this.worldArea = document.getElementById('world-area');
        this.worldArea.innerText = '';
        this.spawnArea = document.getElementById('game-area');
        this.spawnArea.style.position = 'relative';

        this.ctx = this.worldArea.getContext('2d');
        this.filled = 0;
        this.fillStyle = 'rgba(219, 0, 0, 0.59)';

        this.calculateSize();
    }

    /**
     * Sets the background image and resizes the game area
     * @param {String} background - url to the background image
     */
    setBackground(background) {
        this.worldArea.style.backgroundImage = background;
        this.worldArea.style.backgroundRepeat = 'no-repeat';
        this.worldArea.style.height = this.height;
        this.worldArea.style.width = this.width;
        this.worldArea.style.backgroundSize = this.width + 'px ' + this.height + 'px';
    }

    /**
     * Calculates the best size for the game area
     */
    calculateSize() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        if (width > height) {
            height = Math.round(height * 0.9);
            width = Math.round((height / 9) * 16);
        }
        else {
            width = Math.round(width * 0.9);
            height = Math.round((width / 16) * 9);
        }

        this.width = width;
        this.height = height;
    }

    /**
     * Moves the red overlay of the world on the canvas
     * 
     * @returns Boolean - whether the world has been filled or not
     */
    moveCover() {
        this.ctx.clearRect(0, 0, this.filled, this.height);
        this.filled += Math.round(this.width / 100);

        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.filled, this.height);
        this.ctx.fillStyle = this.fillStyle;

        this.ctx.fill();

        return (this.filled * 4 < this.width);
    }

    /**
     * Spawns a supplied Virus randomly in the game area
     * @param {Virus} enemy
     */
    spawnEnemy(enemy) {
        var pos_x = Math.floor(Math.random() * (this.width * 0.8));
        var pos_y = Math.floor(Math.random() * (this.height * 0.8));

        enemy.spawn(pos_x, pos_y, this.spawnArea);
    }

    /**
     * Resets the game area to the initial state
     */
    reset() {
        this.ctx.clearRect(0, 0, this.worldArea.width, this.worldArea.height);
    }

    /**
     * Writes the ending message
     * @param {String} message 
     */
    write(message) {
        this.ctx.beginPath();
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.worldArea.width / 2, 40);
    }
}

class Virus {
    /**
     * 
     * @param {Image} sprite - the image used to represent the Virus
     * @param {int} points - number of points awarded for shooting the Virus down
     * @param {int} height - height of the image displayed
     * @param {int} width - width of the image displayed
     */
    constructor(sprite, points, height = 82, width = 142) {
        this.sprite = sprite;
        this.sprite.height = height;
        this.sprite.width = width;
        this.sprite.style.position = 'absolute';
        this.points = points;

        this.parentElement = null;
        this.timeoutId = null;

        this.key = null;
        this.keys = 'ABCDEFGHKIJKLMNOPQRSTUVWXYZ';

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Spawns the virus on the specified coordinates and starts expiration timeout
     * @param {int} x - x position
     * @param {int} y - y position
     * @param {HTML Element} targetElement 
     */
    spawn(x, y, targetElement) {
        this.sprite.style.left = x;
        this.sprite.style.top = y;
        this.parentElement = targetElement;

        this.key = this.keys[Math.round(Math.random() * this.keys.length)];
        
        document.getElementById('press-key').innerText = this.key;

        this.sprite.setAttribute('points', this.points);
        this.sprite.addEventListener('click', this.shotDown);

        targetElement.appendChild(this.sprite);
        this.timeoutId = window.setTimeout(this.expired.bind(this), 1300);
    }

    /**
     * Fires the virusExpired event
     */
    expired() {
        this.timeoutId = null;

        let event = new Event('virusExpired');
        this.parentElement.dispatchEvent(event);
    }

    /**
     * Fires the virusDown event and clears out timeout
     */
    shotDown() {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;

        let event = new CustomEvent('virusDown', { detail: { 'points': this.parentElement.children[1].getAttribute('points') } });
        this.parentElement.dispatchEvent(event);
    }

    /**
     * Checks if pressed key is the key of the virus
     * @param {Event} event - KeyDown event
     */
    handleKeyDown(event) {
        if (this.timeoutId != null) {
            if (event.key.toUpperCase() == this.key) {
                this.shotDown();
            }
        }
    }
}

class Player {
    /**
     * Creates the Player class
     */
    constructor() {
        this.ready = false;
        this.score = 0;
        this.name = null;

        document.getElementById('set-username').addEventListener('click', this.setName.bind(this));
    }

    /**
     * Sets the name of the player and enables the game to starts
     * @param {String} name 
     */
    setName(name) {
        this.name = document.getElementById('username').value;
        this.ready = true;

        document.getElementById('new-game').disabled = false;
        document.getElementById('restart').disabled = false;
    }

    /**
     * Updates the player score
     * @param {int} value 
     */
    changeScore(value = 1) {
        this.score += value;
    }

    /**
     * Resets player to initial state
     */
    reset() {
        this.score = 0;
        this.name = null;
        document.getElementById('new-game').disabled = true;
        document.getElementById('restart').disabled = true;
    }
}

class Game {
    /**
     * Creates the Game with specified World and Player
     * @param {World} world 
     * @param {Player} player 
     */
    constructor(world, player) {
        this.eliminated = 0;
        this.missed = 0;
        this.virus = null;
        this.bonus = null;
        this.intervalId = null;

        this.world = world;
        this.player = player;

        this.world.spawnArea.addEventListener('virusExpired', this.handleExpire.bind(this));
        this.world.spawnArea.addEventListener('virusDown', this.handleDown.bind(this));
        document.getElementById('restart').addEventListener('click', this.restart.bind(this));
        document.getElementById('new-game').addEventListener('click', this.checkStart.bind(this));
    }

    /**
     * Updates values displayed to the player
     */
    updateDisplay() {
        document.getElementById('score').innerText = this.player.score;
        document.getElementById('eliminated').innerText = this.eliminated;
        document.getElementById('missed').innerText = this.missed;
    }

    /**
     * Sets the Virus
     * @param {Virus} virus 
     */
    setVirus(virus) {
        this.virus = virus;
    }

    /**
     * Sets the bonus Virus
     * @param {Virus} bonus 
     */
    setBonus(bonus) {
        this.bonus = bonus;
    }

    /**
     * Starts the game by spawning enemies
     */
    startGame() {
        this.intervalId = setInterval(this.spawnEnemy.bind(this), 2000);
    }

    /**
     * Handles a Virus being shot down
     * @param {virusDown Event} event 
     */
    handleDown(event) {
        ++this.eliminated;
        this.player.changeScore(parseInt(event.detail.points));
        this.updateDisplay();

        event.srcElement.children[1].remove();
    }

    /**
     * Handles a Virus expiring
     * @param {virusExpired Event} event 
     */
    handleExpire(event) {
        if (event.srcElement.children[1] != null) {
            ++this.missed;
            this.player.changeScore(-1);
            this.updateDisplay();

            event.srcElement.children[1].remove();
            let playOn = game.world.moveCover();

            if (!playOn) {
                clearInterval(this.intervalId);
                this.gameOver();
            }
        }
    }

    /**
     * Spawns an enemy
     */
    spawnEnemy() {
        let seed = Math.random();

        if (seed <= 0.9) {
            this.world.spawnEnemy(this.virus);
        }
        else {
            this.world.spawnEnemy(this.bonus);
        }
    }

    /**
     * Stops the game
     */
    gameOver() {
        this.world.write('Game Over, ' + player.name);
    }

    /**
     * Resets the game with inital values
     */
    restart() {
        this.eliminated = 0;
        this.player.score = 0;
        this.missed = 0;
        clearInterval(this.intervalId);
        this.intervalId = null;

        this.world.reset();
        this.player.reset();
        this.updateDisplay();
    }

    /**
     * Checks if a start is possible
     */
    checkStart() {
        if (this.virus != null && this.bonus != null && player.name != null) {
            this.startGame();
        }
        else {
            alert('You need to set a username!');
            document.getElementById('username').focus();
        }
    }
}

/**
 * Loads an image with Promise from an url
 * @param {String} url 
 */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();

        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', () => reject(alert('An error occurred during loading of an asset. Please, reload the site.')));
        img.src = url;
    });
}

const world = new World();
const player = new Player();
const game = new Game(world, player);

function initGame() {
    world.setBackground('url(./assets/world.svg');

    loadImage('./assets/virus.png').then((img) => game.setVirus(new Virus(img, 1)));
    loadImage('./assets/bonus.png').then((img) => game.setBonus(new Virus(img, 10, 142, 142)));
}

initGame();