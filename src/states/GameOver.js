import Phaser from 'phaser'

class GameOverState extends Phaser.State {
  constructor(game) {
    super(game);
    this.game = game;

    this.restart = this.restart.bind(this);
  }

  create() {
    const { centerX, centerY } = this.game.world;
    this.game.add.text(centerX, centerY, 'GAME OVER\nClick to Continue', {fill: 'red', align: 'center'}).anchor.setTo(0.5);
    this.game.add.text(centerX - 150, centerY + 100, `Zombie Kill Count: ${this.game._globalState.zombiesKilled}`,{fill: 'red', align: 'center'}).anchor.setTo(0.5);
    this.game.add.text(centerX + 150, centerY + 100, `You Gave Your Team\n${this.game._globalState.passedTimeText}\nTo Escape`,{fill: 'red', align: 'center'}).anchor.setTo(0.5);

    this.game.input.onDown.addOnce(this.restart);
  }

  shutdown() {
    this.game._globalState = {
      zombiesKilled: 0,
      passedTime: {
        minutes: 0,
        seconds: 0
      },
      passedTimeText: ''
    };

    this.game.sound.stopAll();
  }

  restart() {
    this.game.state.start('menu', true, false);
  }
}

export default GameOverState;
