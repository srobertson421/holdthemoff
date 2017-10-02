import Phaser from 'phaser'

import atlasImage from '../assets/atlas.png';
import atlasJSON from '../assets/atlas.json';
import bloodSplat from '../assets/bloodsplat.png';
import bloodPool from '../assets/bloodpool.png';
import bullet from '../assets/bullet.png';
import pistolShot from '../assets/pistol.mp3';
import outOfAmmo from '../assets/outofammo.mp3';
import zombieHit from '../assets/zombieHit.mp3';
import brains1 from '../assets/brains1.mp3';
import brains2 from '../assets/brains2.mp3';
import brains3 from '../assets/brains3.mp3';
import groan from '../assets/groan.mp3';
import bgMusic from '../assets/bgMusic.mp3';

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
    this.game.load.spritesheet('bloodSplat', bloodSplat, 480, 480);
    this.game.load.spritesheet('bloodPool', bloodPool, 480, 480);
    this.game.load.image('bullet', bullet);
    this.game.load.audio('pistolShot', pistolShot);
    this.game.load.audio('outofammo', outOfAmmo);
    this.game.load.audio('zombieHit', zombieHit);
    this.game.load.audio('brains1', brains1);
    this.game.load.audio('brains2', brains2);
    this.game.load.audio('brains3', brains3);
    this.game.load.audio('groan', groan);
    this.game.load.audio('bgMusic', bgMusic);
  }

  create() {
    this.game.state.start('menu');
  }
}

export default LoadState;
