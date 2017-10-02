import Phaser from 'phaser'
import generateFramesArray from '../lib/generateFramesArray.js';

const ZOMBIE_SCALE = 0.25;

class Zombie extends Phaser.Sprite {
  constructor(game, { x = 100, y = 100, key = 'characters', target = null, collider = null }) {
    super(game, x, y, key);

    this.game = game;
    this.target = target;
    this.collider = collider;
    this.exists = false;
    this.health = this.game.rnd.integerInRange(3, 5);
    this.speed = this.game.rnd.integerInRange(20, 40);
    this.anchor.setTo(0.5);
    this.scale.setTo(ZOMBIE_SCALE);

    this.animations.add('zombieMove', generateFramesArray(17, 'skeleton-move'), 10, true);
    this.animations.add('zombieAttack', generateFramesArray(9, 'skeleton-attack'), 10);

    this.game.physics.arcade.enable(this);
    this.body.setSize(150, 180, 70, 40);

    this.zombieHitSound = this.game.add.audio('zombieHit');

    this.animations.play('zombieMove');

    this.bulletHitZombie = this.bulletHitZombie.bind(this);
  }

  update() {
    this.game.physics.arcade.moveToObject(this, this.target, this.speed);
    this.rotation = this.game.physics.arcade.angleToXY(this, this.target.x, this.target.y);

    this.game.physics.arcade.collide(this.collider, this, this.bulletHitZombie);
  }

  bulletHitZombie(zombie, bullet) {
    bullet.kill();
    const splat = zombie.parent.effectsGroups.bloodSplats.getFirstExists(false);
    splat.reset(zombie.x, zombie.y);
    splat.rotation = zombie.rotation - 30;
    splat.animations.play('splat', 10, false, true);
    this.zombieHitSound.play();
    zombie.damage(bullet.parent.damage);
    zombie.tint = 0xFF0000;
    this.game.time.events.add(Phaser.Timer.SECOND * 0.5, () => zombie.tint = 0xFFFFFF);
    if(!zombie.health) {
      zombie.kill();
      this.game._globalState.zombiesKilled += 1;
      zombie.parent.effectsGroups.zombiesKilledText.setText(`Zombies Killed: ${this.game._globalState.zombiesKilled}`);
      const pool = zombie.parent.effectsGroups.bloodPools.getFirstExists(false);
      pool.frame = this.game.rnd.integerInRange(4, 7);
      pool.reset(zombie.x, zombie.y);
      this.game.time.events.add(Phaser.Timer.SECOND * 3, () => pool.kill());
    }
  }
}

export default Zombie;
