import Phaser from 'phaser'
import generateFramesArray from '../lib/generateFramesArray.js';

const PLAYER_SCALE = 0.25;
const PLAYER_SPEED = 100;
const PLAYER_SLOWED_SPEED = 60;
const PISTOL_FIRE_RATE = 220;
const PISTOL_TOTAL_SHOTS = 17;
const PISTOL_CLIPS = 3;
const MACHINE_GUN_FIRE_RATE = 80;
const MACHINE_GUN_TOTAL_SHOTS = 30;
const MACHINE_GUN_CLIPS = 3;
const SHOTGUN_FIRE_RATE = 300;
const SHOTGUN_TOTAL_SHOTS = 8;
const SHOTGUN_CLIPS = 2;
const GUN_BULLET_SPEED = 600;


class Player extends Phaser.Sprite {
  constructor(game, { x = 100, y = 100, health = 1, key = 'characters', enemyGroup = null }) {
    super(game, x, y, key);

    const { centerX, centerY } = this.game.world;

    this.game = game;
    this.health = health;

    this.weaponState = 'handgun';

    this.reloadingText = this.game.add.text(centerX, centerY, 'RELOADING', {fill: 'black'});
    this.reloadingText.anchor.setTo(0.5);
    this.reloadingText.exists = false;

    this.ammoText = this.game.add.text(this.game.world.width - 100, 50, `Shots: ${PISTOL_TOTAL_SHOTS}`, {fill: 'black'});
    this.ammoText.anchor.setTo(0.5);
    this.clipsText = this.game.add.text(this.game.world.width - 100, 75, `Clips: ${PISTOL_CLIPS}`, {fill: 'black'});
    this.clipsText.anchor.setTo(0.5);

    this.weaponText = this.game.add.text(centerX, 50, this.weaponState.toUpperCase(), {fill: 'black'});
    this.weaponText.anchor.setTo(0.5);

    this.enemyGroup = enemyGroup;
    this.isOverlappingZombie = false;
    this.playerSpeed = PLAYER_SPEED;
    this.anchor.setTo(0.5);
    this.scale.setTo(PLAYER_SCALE);

    this.playerAnimations = {
      melee: {
        idle: this.animations.add('playerMeleeIdle', generateFramesArray(20, 'survivor-idle_knife'), 10, true),
        move: this.animations.add('playerMeleeMove', generateFramesArray(20, 'survivor-move_knife'), 10, true),
        shoot: this.animations.add('playerMeleeShoot', generateFramesArray(15, 'survivor-meleeattack_knife'), 10, false),
      },
      handgun: {
        idle: this.animations.add('playerHandgunIdle', generateFramesArray(20, 'survivor-idle_handgun'), 10, true),
        move: this.animations.add('playerHandgunMove', generateFramesArray(20, 'survivor-move_handgun'), 10, true),
        shoot: this.animations.add('playerHandgunShoot', generateFramesArray(3, 'survivor-shoot_handgun'), 10, false),
      },
      machineGun: {
        idle: this.animations.add('playerMachineGunIdle', generateFramesArray(20, 'survivor-idle_rifle'), 10, true),
        move: this.animations.add('playerMachineGunMove', generateFramesArray(20, 'survivor-move_rifle'), 10, true),
        shoot: this.animations.add('playerMachineGunShoot', generateFramesArray(3, 'survivor-shoot_rifle'), 10, false),
      },
      shotgun: {
        idle: this.animations.add('playerShotgunIdle', generateFramesArray(20, 'survivor-idle_shotgun'), 10, true),
        move: this.animations.add('playerShotgunMove', generateFramesArray(20, 'survivor-move_shotgun'), 10, true),
        shoot: this.animations.add('playerShotgunShoot', generateFramesArray(3, 'survivor-shoot_shotgun'), 10, false),
      }
    };

    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.allowDrag = true;
    this.body.setSize(180, 140, 50, 50);

    this.gun = this.game.add.weapon(30, 'bullet');
    this.gun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.gun.bulletSpeed = GUN_BULLET_SPEED;
    this.gun.fireRate = PISTOL_FIRE_RATE;
    this.gun.bulletAngleOffset = -90;
    this.gun.bulletAngleVariance = 0;
    this.gun.multiFire = false;
    this.gun.trackSprite(this, 0, 15);
    this.gun.trackRotation = true;
    this.gun.fireLimit = PISTOL_TOTAL_SHOTS;
    this.gun.onFire.add(this.fireGun, this)
    this.gun.onFireLimit.add(this.reloadGun, this);
    this.gun.clips = PISTOL_CLIPS;

    this.inventory = {
      handgun: {
        clips: PISTOL_CLIPS,
        shotsPerClip: PISTOL_TOTAL_SHOTS,
        shots: 0,
        fireRate: PISTOL_FIRE_RATE,
        damage: 1,
      },
      machineGun: {
        clips: MACHINE_GUN_CLIPS,
        shotsPerClip: MACHINE_GUN_TOTAL_SHOTS,
        shots: 0,
        fireRate: MACHINE_GUN_FIRE_RATE,
        damage: 1,
      },
      shotgun: {
        clips: SHOTGUN_CLIPS,
        shotsPerClip: SHOTGUN_TOTAL_SHOTS,
        shots: 0,
        fireRate: SHOTGUN_FIRE_RATE,
        damage: 2,
      }
    }
    this.gun.bullets.damage = this.inventory[this.weaponState].damage;

    this.pistolSound = this.game.add.audio('pistolShot', 0.5);
    this.outOfAmmoSound = this.game.add.audio('outofammo');

    this.keys = this.game.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
      A: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
      S: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
      D: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
    }
    this.weaponSelectButtons = {
      melee: this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
      handgun: this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
      machineGun: this.game.input.keyboard.addKey(Phaser.Keyboard.THREE),
      shotgun: this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR),
    }
    Object.keys(this.weaponSelectButtons).forEach((key, index) => {
      const button = this.weaponSelectButtons[key];
      button.onDown.add(() => {this.changeWeapon(key)}, this);
    });
    this.game.input.mouse.capture = true;

    this.clipsText.bringToTop();
    this.ammoText.bringToTop();

    this.allKeysUp = this.allKeysUp.bind(this);
    this.reloadGun = this.reloadGun.bind(this);
    this.changeWeapon = this.changeWeapon.bind(this);
  }

  changeWeapon(weaponType) {
    const newWeapon = this.inventory[weaponType];
    this.weaponState = weaponType;
    this.gun.fireRate = newWeapon.fireRate;
    this.gun.clips = newWeapon.clips;
    this.gun.fireLimit = newWeapon.shotsPerClip;
    this.gun.shots = newWeapon.shots;
    this.gun.bullets.damage = newWeapon.damage;
    if(weaponType === 'shotgun') {
      this.gun.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
      this.gun.bulletLifespan = 250;
      this.gun.bulletAngleVariance = 10;
      this.gun.multiFire = true;
    } else {
      this.gun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
      this.gun.bulletLifespan = 0;
      weaponType === 'machineGun' ? this.gun.bulletAngleVariance = 3 : this.gun.bulletAngleVariance = 0;
      this.gun.multiFire = false;
    }

    this.ammoText.setText(`Shots: ${newWeapon.shotsPerClip - this.gun.shots}`);
    this.clipsText.setText(`Clips: ${this.gun.clips}`);
    this.weaponText.setText(weaponType.toUpperCase());
  }

  fireGun() {
    const currentWeapon = this.inventory[this.weaponState];
    this.ammoText.setText(`Shots: ${currentWeapon.shotsPerClip - this.gun.shots}`);
    this.inventory[this.weaponState].shots = this.gun.shots;
    this.pistolSound.play()
  }

  reloadGun() {
    const currentWeapon = this.inventory[this.weaponState];
    if(this.gun.clips) {
      this.reloadingText.bringToTop();
      this.reloadingText.reset(this.x, this.y - 50);
      this.game.time.events.add(Phaser.Timer.SECOND * 1, () => {
        this.gun.resetShots();
        this.ammoText.setText(`Shots: ${currentWeapon.shotsPerClip - this.gun.shots}`);
        this.gun.clips = this.gun.clips - 1;
        this.inventory[this.weaponState].clips = this.gun.clips;
        this.inventory[this.weaponState].shots = 0;
        this.clipsText.setText(`Clips: ${this.gun.clips}`);
        this.reloadingText.exists = false;
      }, this);
    }
  }

  allKeysUp(keysObj) {
    let keysAreUp = true;
    Object.keys(keysObj).forEach((key) => {
      const keyObj = keysObj[key];
      if(keyObj.isDown) {
        keysAreUp = false;
      }
    });

    return keysAreUp
  }

  update() {
    const { leftButton } = this.game.input.activePointer;
    this.rotation = this.game.physics.arcade.angleToPointer(this);

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    if(this.keys.up.isDown || this.wasd.W.isDown) {
      this.body.velocity.y = this.isOverlappingZombie ? -PLAYER_SLOWED_SPEED : -PLAYER_SPEED;
      this.playerAnimations[this.weaponState].move.play();
    } else if(this.keys.down.isDown || this.wasd.S.isDown) {
      this.body.velocity.y = this.isOverlappingZombie ? PLAYER_SLOWED_SPEED : PLAYER_SPEED;
      this.playerAnimations[this.weaponState].move.play();
    }

    if(this.keys.left.isDown || this.wasd.A.isDown) {
      this.body.velocity.x = this.isOverlappingZombie ? -PLAYER_SLOWED_SPEED : -PLAYER_SPEED;
      this.playerAnimations[this.weaponState].move.play();
    } else if(this.keys.right.isDown || this.wasd.D.isDown) {
      this.body.velocity.x = this.isOverlappingZombie ? PLAYER_SLOWED_SPEED : PLAYER_SPEED;
      this.playerAnimations[this.weaponState].move.play();
    }

    if(this.allKeysUp(this.keys) && this.allKeysUp(this.wasd)) {
      this.playerAnimations[this.weaponState].idle.play();
    }

    if(leftButton.isDown) {
      if(this.weaponState !== 'melee') {
        if(this.gun.shots === this.inventory[this.weaponState].shotsPerClip) {
          this.outOfAmmoSound.play();
        } else {
          if(this.weaponState === 'shotgun') {
            for(let i = 0; i < 5; i++) {
              this.gun.fire();
            }
          } else {
            this.gun.fire();
          }
        }
      }
      this.playerAnimations[this.weaponState].shoot.play();
    }
  }
}

export default Player;
