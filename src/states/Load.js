import Phaser from 'phaser'

class LoadState extends Phaser.State {
  constructor(game) {
    super(game);

    this.game = game;
  }

  preload() {
    const { centerX, centerY } = this.game.world;
    const bar = this.game.add.sprite(centerX, centerY, 'loader');
    this.game.add.text(centerX, centerY + 50, 'Loading', {fill: 'black'}).anchor.setTo(0.5);
    bar.anchor.setTo(0.5);
    this.load.setPreloadSprite(bar);
    this.game.load.atlasJSONHash('characters', './assets/atlas.png', './assets/atlas.json');
    this.game.load.spritesheet('bloodSplat', './assets/bloodsplat.png', 480, 480);
    this.game.load.spritesheet('bloodPool', './assets/bloodpool.png', 480, 480);
    this.game.load.image('bullet', './assets/bullet.png');
    this.game.load.audio('pistolShot', './assets/pistol.mp3');
    this.game.load.audio('outofammo', './assets/outofammo.mp3');
    this.game.load.audio('zombieHit', './assets/zombieHit.mp3');
    this.game.load.audio('brains1', './assets/brains1.mp3');
    this.game.load.audio('brains2', './assets/brains2.mp3');
    this.game.load.audio('brains3', './assets/brains3.mp3');
    this.game.load.audio('groan', './assets/groan.mp3');
    this.game.load.audio('bgMusic', './assets/bgMusic.mp3');
  }

  create() {
    this.game.state.start('menu');
  }
}

export default LoadState;
