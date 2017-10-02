import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot.js';
import LoadState from './states/Load.js';
import MenuState from './states/Menu.js';
import GameState from './states/Game.js';
import GameOverState from './states/GameOver.js';

class Game {
  constructor({width = 800, height = 600, renderType = Phaser.AUTO, element = ''}) {
    this.game = new Phaser.Game(width, height, renderType, element);
    this.game._globalState = {
      zombiesKilled: 0,
      passedTime: {
        minutes: 0,
        seconds: 0
      },
      passedTimeText: ''
    };

    this.game.state.add('boot', new BootState(this.game));
    this.game.state.add('load', new LoadState(this.game));
    this.game.state.add('menu', new MenuState(this.game));
    this.game.state.add('game', new GameState(this.game));
    this.game.state.add('gameOver', new GameOverState(this.game));
  }

  init() {
    this.game.state.start('boot');
  }
}

const game = new Game({});
game.init();
