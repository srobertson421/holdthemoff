import Phaser from 'phaser'

import loadingBar from '../assets/loadingBar.png';

class BootState extends Phaser.State {
  constructor(game) {
    super(game);
    this.game = game;
  }

  preload() {
    this.game.stage.backgroundColor = '#e6e6e6';
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.load.image('loader', loadingBar);
  }

  create() {
    this.game.state.start('load');
  }
}

export default BootState;
