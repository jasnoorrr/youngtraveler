// static/game/js/episode2/scene4_WeaveHeadband.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene4_WeaveHeadband extends Phaser.Scene {
  constructor() {
    super('scene4_WeaveHeadband');
  }

  preload() {
    // Traveler & Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Weaving background
    this.load.image('weaveFrame', '/static/game/assets/episode2/weave_frame.png');
    this.load.image('weaveMat',   '/static/game/assets/episode2/weave_mat.png');

    // Reuse flower images from Scene 3
    this.load.image('flower1', '/static/game/assets/episode2/flower.png');
    this.load.image('flower2', '/static/game/assets/episode2/flower.png');
    this.load.image('flower3', '/static/game/assets/episode2/flower.png');
    this.load.image('flower4', '/static/game/assets/episode2/flower.png');
    this.load.image('flower5', '/static/game/assets/episode2/flower.png');

    // Dakelh audio
    this.load.audio('lhudah',    '/static/game/assets/audio/lhudah.mp3');
    this.load.audio('nada',      '/static/game/assets/audio/nada.mp3');
    this.load.audio('tada',      '/static/game/assets/audio/tada.mp3');
    this.load.audio('dida',      '/static/game/assets/audio/dida.mp3');
    this.load.audio('skwunlada', '/static/game/assets/audio/skwunlada.mp3');

    // Raven final
    this.load.audio('ravenaudio6_2', '/static/game/assets/audio/ep2_ravenaudio6.mp3');
    // Traveler “I love it!”
    this.load.audio('travelerLove',   '/static/game/assets/audio/ep2_traveler_love.mp3');
  }

  create(data) {
    console.log("scene4_WeaveHeadband create() called");
    this.cameras.main.setBackgroundColor('#f9f3eb');

    // 1) Background (weave frame + mat)
    this.add.image(500, 250, 'weaveFrame').setScale(0.8);
    this.add.image(500, 500, 'weaveMat').setScale(0.7);

    // Traveler & Raven
    const travelerKey = data?.characterKey || 'traveler1';
    this.traveler = this.add.sprite(150, 450, travelerKey).setScale(0.6);
    this.raven    = this.add.image(850, 150, 'raven').setScale(0.45);

    // 2) Create five draggable flowers at bottom
    this.flowerSlots = [];
    this.flowerCount = 0;

    // Define slot positions (on the circular frame)
    const slotPositions = [
      { x: 300, y: 220 },
      { x: 400, y: 180 },
      { x: 500, y: 160 },
      { x: 600, y: 180 },
      { x: 700, y: 220 }
    ];

    // Draw invisible slot markers for drop zones
    slotPositions.forEach((pos, idx) => {
      const slot = this.add.circle(pos.x, pos.y, 40, 0x000000, 0)
        .setData('number', idx + 1) // slot 1–5
        .setInteractive({ dropZone: true });
      this.flowerSlots.push(slot);
    });

    // Now create the five flower icons below the frame
    const flowerPositions = [
      { key: 'flower1', x: 200, y: 550, number: 1 },
      { key: 'flower2', x: 350, y: 550, number: 2 },
      { key: 'flower3', x: 500, y: 550, number: 3 },
      { key: 'flower4', x: 650, y: 550, number: 4 },
      { key: 'flower5', x: 800, y: 550, number: 5 }
    ];
    this.flowers = [];

    flowerPositions.forEach((info) => {
      const f = this.add.image(info.x, info.y, info.key)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true })
        .setData('number', info.number);
      this.input.setDraggable(f);
      this.flowers.push(f);
    });

    // 3) Drag logic
    this.input.on('drag', (pointer, img, dragX, dragY) => {
      img.x = dragX;
      img.y = dragY;
    });

    this.input.on('drop', (pointer, img, slot) => {
      const flowerNum = img.getData('number');
      const slotNum   = slot.getData('number');
      if (flowerNum === slotNum) {
        // Snap flower into slot
        img.x = slot.x;
        img.y = slot.y;
        img.disableInteractive();
        this.flowerCount++;

        // Play the matching Dakelh audio
        const soundKey = ['lhudah','nada','tada','dida','skwunlada'][flowerNum - 1];
        this.sound.play(soundKey);

        // When all five are placed, start final dialogue
        if (this.flowerCount === 5) {
          this.time.delayedCall(1000, () => {
            // Raven’s “Our flower headband is finished—ha’wh!”
            this.sound.play('ravenaudio6_2', { volume: 2.0 });

            this.time.delayedCall(3000, () => {
              // Traveler “I love it!”
              if (this.sound.get('travelerLove')) {
                this.sound.play('travelerLove');
              } else {
                speak("I love it!");
              }

              this.time.delayedCall(2000, () => {
                // Prompt and show Next button
                speak("Great job! Ready to match numbers and words?");

                const style = {
                  font: '24px serif',
                  backgroundColor: '#4a90e2',
                  color: '#ffffff',
                  padding: 10
                };
                this.add.text(850, 550, 'Next ▶', style)
                  .setInteractive({ useHandCursor: true })
                  .on('pointerdown', () => {
                    this.scene.start('scene5_NumberWordMatch', data);
                  });
              });
            });
          });
        }
      } else {
        // Snap back if dropped on wrong slot
        this.tweens.add({
          targets: img,
          x: info.x,
          y: info.y,
          duration: 400,
          ease: 'Power2'
        });
      }
    });
  }
}
