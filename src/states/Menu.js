import Phaser from 'phaser'

class MenuState extends Phaser.State {
  constructor(game) {
    super(game);

    this.game = game;

    this.stateData = {
      titleText: '"I\'ll Hold Them Off!"\nUse Mouse to Aim\nUse Arrows or WASD to Move\nUse 1, 2, 3, or 4 to Change Weapons\nClick to Fire\n\n\nClick To Continue',
      titleSprite: null
    }

    this.start = this.start.bind(this);
  }

  create() {
    const { titleText } = this.stateData;
    const { centerX, centerY } = this.game.world;

    this.titleSprite = this.game.add.text(centerX, centerY, titleText, {fill: 'black', align: 'center'});
    this.titleSprite.anchor.setTo(0.5);

    this.game.input.onDown.addOnce(this.start);
  }

  start() {
    this.game.state.start('game');
  }
}

export default MenuState;
