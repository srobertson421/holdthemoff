import Phaser from 'phaser'
import Player from '../entities/Player.js';
import Zombie from '../entities/Zombie.js';

class GameState extends Phaser.State {
  constructor(game) {
    super(game);

    this.game = game;
    this.player = null;
    this.hurtTimer = 0;

    this.createZombie = this.createZombie.bind(this);
    this.hurtPlayer = this.hurtPlayer.bind(this);
  }

  create() {
    const { centerX, centerY } = this.game.world;

    this.bgMusic = this.game.add.audio('bgMusic', 0.5, true);
    this.bgMusic.play();

    this.zombieSounds = [
      this.game.add.audio('brains1'),
      this.game.add.audio('brains2'),
      this.game.add.audio('brains3'),
      this.game.add.audio('groan'),
    ]

    this.player = new Player(this.game, {
      x: centerX,
      y: centerY,
      health: 20,
      key: 'characters',
      enemyGroup: this.zombies
    });

    this.zombiesKilledText = this.game.add.text(115, 100, `Zombies Killed: ${this.game._globalState.zombiesKilled}`, {fill: 'black'});
    this.zombiesKilledText.anchor.setTo(0.5);

    this.bloodSplats = this.game.add.group();
    this.bloodSplats.createMultiple(30, 'bloodSplat');
    this.bloodSplats.forEach((splat) => {
      splat.scale.setTo(0.15);
      splat.anchor.setTo(0.5);
      splat.animations.add('splat');
    });
    this.bloodPools = this.game.add.group();
    this.bloodPools.createMultiple(30, 'bloodSplat');
    this.bloodPools.forEach((pool) => {
      pool.scale.setTo(0.15);
      pool.anchor.setTo(0.5);
    });
    this.zombies = this.game.add.group();
    this.zombies.effectsGroups = {
      bloodSplats: this.bloodSplats,
      bloodPools: this.bloodPools,
      zombiesKilledText: this.zombiesKilledText,
    }

    for(let i = 0; i < 500; i++) {
      this.zombies.add(this.createZombie());
    }
    this.healthText = this.game.add.text(75, 50, `Health: ${this.player.health}`, {fill: 'black'});
    this.healthText.anchor.setTo(0.5);

    this.timerText = this.game.add.text(centerX, 100, `00:00`, {fill: 'black'});
    this.timerText.anchor.setTo(0.5);

    this.game.add.existing(this.player);
    this.zombieTimer = 0;
    this.zombieSoundTimer = 0;

    this.game.time.events.loop(Phaser.Timer.SECOND, this.updateTimer, this);
  }

  updateTimer() {
    let minutes = '';
    let seconds = '';
    this.game._globalState.passedTime.seconds += 1;
    if(this.game._globalState.passedTime.seconds >= 60) {
      this.game._globalState.passedTime.minutes += 1;
      this.game._globalState.passedTime.seconds = 0;
    }

    if(this.game._globalState.passedTime.seconds >= 10) {
      seconds = `${this.game._globalState.passedTime.seconds}`;
    } else {
      seconds = `0${this.game._globalState.passedTime.seconds}`
    }

    if(this.game._globalState.passedTime.minutes >= 10) {
      minutes = `${this.game._globalState.passedTime.minutes}`;
    } else {
      minutes = `0${this.game._globalState.passedTime.minutes}`
    }

    this.timerText.setText(`${minutes}:${seconds}`);
    this.game._globalState.passedTimeText = `${minutes}:${seconds}`;
  }

  createZombie() {
    return new Zombie(this.game, {
      x: 0,
      y: 0,
      key: 'characters',
      target: this.player,
      collider: this.player.gun.bullets
    });
  }

  update() {
    this.game.physics.arcade.collide(this.zombies);
    const overlappingZombie = this.game.physics.arcade.overlap(this.player, this.zombies, this.hurtPlayer);
    overlappingZombie ? this.player.isOverlappingZombie = true : this.player.isOverlappingZombie = false;
    this.player.update();

    if(this.zombieSoundTimer < this.game.time.now) {
      const rndSound = this.game.rnd.integerInRange(0, 3);
      this.zombieSounds[rndSound].play();
      this.zombieSoundTimer = this.game.time.now + this.game.rnd.integerInRange(1500, 3000);
    }

    if(this.zombieTimer < this.game.time.now) {
      const newZombie = this.zombies.getFirstExists(false);
      if(newZombie) {
        const leftOrRight = this.game.rnd.integerInRange(0, 1);
        const topOrBottom = this.game.rnd.integerInRange(0, 1);
        const rndX = leftOrRight ? this.game.rnd.integerInRange(this.game.world.width + 100, this.game.world.width + 200) : this.game.rnd.integerInRange(-100, -200);
        const rndY = topOrBottom ? this.game.rnd.integerInRange(this.game.world.height + 100, this.game.world.height + 200) : this.game.rnd.integerInRange(-100, -200);
        newZombie.reset(rndX, rndY, this.game.rnd.integerInRange(3, 5));
        newZombie.exists = true;
        this.zombieTimer = this.game.time.now + this.game.rnd.integerInRange(500, 1500);
      }
    }
  }

  hurtPlayer(player, zombie) {
    if(this.hurtTimer < this.game.time.now) {
      player.damage(1);
      if(player.health) {
        this.healthText.setText(`Health: ${this.player.health}`);
        player.tint = 0xFF0000;
        this.game.time.events.add(Phaser.Timer.SECOND * 1, () => player.tint = 0xFFFFFF);
        this.hurtTimer = this.game.time.now + 1000;
      } else {
        this.game.state.start('gameOver');
      }
    }
  }

  render() {
    //this.game.debug.body(this.player);
    // this.zombies.children.forEach((zombie) => {
    //   this.game.debug.body(zombie);
    // });
  }
}

export default GameState;
