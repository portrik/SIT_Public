'use strict';

class Game {

}

class Player {

    constructor(name, world) {
        this.score = 0;
        this.health = 100;
        this.name = name;
        this.world = world;
    }
}

class Virus {
    
    constructor(sprite) {
        this.sprite = sprite;
    }
}

class World {

    constructor(map) {
        this.map = map;
    }
}

function initGame() {
    var gameArea = document.getElementById('gameArea');
    gameArea.innerText = '';
}

initGame();