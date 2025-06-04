// static/game/js/episode2/scene6_SimpleAddition.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene6_SimpleAddition extends Phaser.Scene {
  constructor() {
    super('scene6_SimpleAddition');
  }

  preload() {
    // Traveler & Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Flower image (reuse)
    this.load.image('flower', '/static/game/assets/episode2/flower.png');

    // Basket
    this.load.image('basket', '/static/game/assets/basket.png');

    // Dakelh audio
    this.load.audio('lhudah',     '/static/game/assets/audio/lhudah.mp3');
    this.load.audio('nada',       '/static/game/assets/audio/nada.mp3');
    this.load.audio('tada',       '/static/game/assets/audio/tada.mp3');
    this.load.audio('dida',       '/static/game/assets/audio/dida.mp3');
    this.load.audio('skwunlada',  '/static/game/assets/audio/skwunlada.mp3');

    // Raven echoes & praises
    this.load.audio('ravenaudio8_2','/static/game/assets/audio/ep2_ravenaudio8.mp3');
  }

  create(data) {
    console.log("scene6_SimpleAddition create() called");
    this.cameras.main.setBackgroundColor('#faf7f2');
    this.sound.stopAll();
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Traveler & Raven
    const travelerKey = data?.characterKey || 'traveler1';
    this.traveler = this.add.sprite(150, 450, travelerKey).setScale(0.6);
    this.raven    = this.add.image(850, 150, 'raven').setScale(0.45);

    // 1) Problem 1: 2 + 1 = ?
    this.currentProblem = 1;
    this.solvedProblems = 0;

    // Basket for collecting
    this.basket = this.add.image(500, 300, 'basket').setScale(0.7);

    // Flower groups
    this.flowersGroup = this.add.group();
    this.input.setTopOnly(true);

    // Function to generate flowers on left & right based on problem
    this.spawnFlowers = () => {
      this.flowersGroup.clear(true, true);

      if (this.currentProblem === 1) {
        // 2 on left, 1 on right
        this.createFlowerCluster(2, 200, 300);
        this.createFlowerCluster(1, 800, 300);
        speak("How many flowers altogether? Nada plus Lhudah equals?");
        this.sound.play('nada');
        this.time.delayedCall(1000, () => {
          this.sound.play('lhudah');
        });
      } else {
        // Problem 2: 4 + 1
        this.createFlowerCluster(4, 200, 300);
        this.createFlowerCluster(1, 800, 300);
        speak("How many flowers altogether? Dida plus Lhudah equals?");
        this.sound.play('dida');
        this.time.delayedCall(1000, () => {
          this.sound.play('lhudah');
        });
      }
    };

    // Helper: create n flowers arranged around (xBase, yBase)
    this.createFlowerCluster = (n, xBase, yBase) => {
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const xOff = Math.cos(angle) * 50;
        const yOff = Math.sin(angle) * 50;
        const f = this.add.image(xBase + xOff, yBase + yOff, 'flower')
          .setScale(0.3)
          .setInteractive({ useHandCursor: true });
        this.flowersGroup.add(f);
      }
    };

    // Spawn the first problem
    this.spawnFlowers();

    // 2) Dragging to basket: once the player drags any flower OVER the basket, count how many remain “floating”
    this.input.on('gameobjectdown', (pointer, img) => {
      // When a flower is tapped, move it to basket center
      this.tweens.add({
        targets: img,
        x: this.basket.x,
        y: this.basket.y,
        scale: 0.3,
        duration: 400,
        onComplete: () => {
          img.disableInteractive();
          this.solvedProblems += 1;
          // Each tapped flower: play “Tada” or “Skwunlada” when cluster is done
          if (this.currentProblem === 1 && this.solvedProblems === 3) {
            // 2+1=3 → “Tada”
            this.sound.play('tada');
            this.time.delayedCall(2000, () => {
              this.currentProblem = 2;
              this.solvedProblems = 0;
              this.spawnFlowers();
            });
          } else if (this.currentProblem === 2 && this.solvedProblems === 5) {
            // 4+1=5 → “Skwunlada”
            this.sound.play('skwunlada');
            // Raven praises
            this.time.delayedCall(1000, () => {
              this.sound.play('ravenaudio8_2', { volume: 1.5 });
            });
            // After praise, move to Scene 7
            this.time.delayedCall(3000, () => {
              this.scene.start('scene7_Review', data);
            });
          }
        }
      });
    });
  }
}
