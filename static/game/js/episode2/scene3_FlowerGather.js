// static/game/js/episode2/scene3_FlowerGather.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene3_FlowerGather extends Phaser.Scene {
  constructor() {
    super('scene3_FlowerGather');
  }

  preload() {
    // Traveler & Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',      '/static/game/assets/raven.png');

    // Meadow background (same as Scene 1)
    this.load.image('meadowBg', '/static/game/assets/episode2/meadow_bg.png');

    // Five flowers (all use the same image file)
    this.load.image('flower1', '/static/game/assets/episode2/flower.png');
    this.load.image('flower2', '/static/game/assets/episode2/flower.png');
    this.load.image('flower3', '/static/game/assets/episode2/flower.png');
    this.load.image('flower4', '/static/game/assets/episode2/flower.png');
    this.load.image('flower5', '/static/game/assets/episode2/flower.png');

    // Weaving mat
    this.load.image('weaveMat', '/static/game/assets/episode2/weave_mat.png');

    // Dakelh audio for 1–5
    this.load.audio('lhudah',    '/static/game/assets/audio/lhudah.mp3');
    this.load.audio('nada',      '/static/game/assets/audio/nada.mp3');
    this.load.audio('tada',      '/static/game/assets/audio/tada.mp3');
    this.load.audio('dida',      '/static/game/assets/audio/dida.mp3');
    this.load.audio('skwunlada', '/static/game/assets/audio/skwunlada.mp3');

    // Raven echoes
    this.load.audio('ravenaudio3_2', '/static/game/assets/audio/ep2_ravenaudio3.mp3');
    this.load.audio('ravenaudio4_2', '/static/game/assets/audio/ep2_ravenaudio4.mp3');

    // Traveler line after gathering
    this.load.audio('travelerGather', '/static/game/assets/audio/ep2_traveler_gather.mp3');

    // Raven “Wonderful”
    this.load.audio('ravenaudio5_2', '/static/game/assets/audio/ep2_ravenaudio5.mp3');
  }

  create(data) {
    console.log("scene3_FlowerGather create() called");
    this.cameras.main.setBackgroundColor('#e8f4e5');

    // 1) Background, Traveler & Raven
    this.add.image(500, 300, 'meadowBg').setDisplaySize(1000, 600);
    const travelerKey = data?.characterKey || 'traveler1';
    this.traveler = this.add.sprite(150, 450, travelerKey).setScale(0.6);
    this.raven    = this.add.image(850, 150, 'raven').setScale(0.45);

    // 2) Weaving mat at bottom-right
    this.add.image(800, 500, 'weaveMat').setScale(0.7);

    // 3) Create 5 flowers, each interactive
    this.flowerCount      = 0;
    this.collectedNumbers = [];

    const flowerPositions = [
      { key: 'flower1', x: 150, y: 200, number: 1 },
      { key: 'flower2', x: 300, y: 180, number: 2 },
      { key: 'flower3', x: 450, y: 220, number: 3 },
      { key: 'flower4', x: 600, y: 200, number: 4 },
      { key: 'flower5', x: 750, y: 180, number: 5 }
    ];

    flowerPositions.forEach((info, idx) => {
      const fl = this.add.image(info.x, info.y, info.key)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true })
        .setData('number', info.number);

      // Gently sway animation (up/down)
      this.tweens.add({
        targets: fl,
        y: info.y - 10,
        duration: 1000 + idx * 200,
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });

      // On tap: move to mat and play Dakelh audio
      fl.on('pointerdown', () => {
        if (this.collectedNumbers.includes(info.number)) return; // already collected

        this.collectedNumbers.push(info.number);
        this.flowerCount++;

        // Move flower to mat area
        this.tweens.add({
          targets: fl,
          x: 700,
          y: 500,
          scale: 0.4,
          duration: 600,
          ease: 'Power2'
        });
        fl.disableInteractive();

        // Play Dakelh audio + Raven echo
        const soundKey = ['lhudah', 'nada', 'tada', 'dida', 'skwunlada'][info.number - 1];
        this.sound.play(soundKey);
        this.time.delayedCall(600, () => {
          this.sound.play(soundKey);
        });

        // If all five collected, trigger next dialogue
        if (this.flowerCount === 5) {
          this.time.delayedCall(1000, () => {
            // Traveler summary
            if (this.sound.get('travelerGather')) {
              this.sound.play('travelerGather');
            } else {
              speak("I gathered lhudah, nada, tada, dida, skwunlada indak!");
            }

            this.time.delayedCall(2000, () => {
              // Raven praises
              this.sound.play('ravenaudio5_2', { volume: 2.0 });

              this.time.delayedCall(2000, () => {
                speak("Tap Next to start weaving.");

                // Show Next button
                const style = {
                  font: '24px serif',
                  backgroundColor: '#4a90e2',
                  color: '#ffffff',
                  padding: 10
                };

                this.add.text(850, 550, 'Next ▶', style)
                  .setInteractive({ useHandCursor: true })
                  .on('pointerdown', () => {
                    this.scene.start('scene4_WeaveHeadband', data);
                  });
              });
            });
          });
        }
      });
    });

    // 4) Initial Robot prompt to tap flowers
    speak("Collect five indak. Tap each flower and count in Dakelh!");
  }
}
