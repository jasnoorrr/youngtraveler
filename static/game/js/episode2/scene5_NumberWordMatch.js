// static/game/js/episode2/scene5_NumberWordMatch.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene5_NumberWordMatch extends Phaser.Scene {
  constructor() {
    super('scene5_NumberWordMatch');
  }

  preload() {
    // Traveler & Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Numeral cards 1–5
    this.load.image('num1', '/static/game/assets/episode2/card1.png');
    this.load.image('num2', '/static/game/assets/episode2/card2.png');
    this.load.image('num3', '/static/game/assets/episode2/card3.png');
    this.load.image('num4', '/static/game/assets/episode2/card4.png');
    this.load.image('num5', '/static/game/assets/episode2/card5.png');

    // Dakelh word cards (parchment style)
    this.load.image('word1', '/static/game/assets/episode2/word_lhudah.png');
    this.load.image('word2', '/static/game/assets/episode2/word_nada.png');
    this.load.image('word3', '/static/game/assets/episode2/word_tada.png');
    this.load.image('word4', '/static/game/assets/episode2/word_dida.png');
    this.load.image('word5', '/static/game/assets/episode2/word_skwunlada.png');

    // Dakelh audio keys (will reuse from previous scenes)
    this.load.audio('lhudah',     '/static/game/assets/audio/lhudah.mp3');
    this.load.audio('nada',       '/static/game/assets/audio/nada.mp3');
    this.load.audio('tada',       '/static/game/assets/audio/tada.mp3');
    this.load.audio('dida',       '/static/game/assets/audio/dida.mp3');
    this.load.audio('skwunlada',  '/static/game/assets/audio/skwunlada.mp3');

    // Raven praises (generic “Good job” or specific)
    this.load.audio('ravenaudio7_2','/static/game/assets/audio/ep2_ravenaudio7.mp3');
  }

  create(data) {
    console.log("scene5_NumberWordMatch create() called");
    this.cameras.main.setBackgroundColor('#ffffff');
    this.sound.stopAll();
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Background color (white) is fine; or add a simple backplate if you like

    // Traveler & Raven
    const travelerKey = data?.characterKey || 'traveler1';
    this.traveler = this.add.sprite(150, 450, travelerKey).setScale(0.6);
    this.raven    = this.add.image(850, 150, 'raven').setScale(0.45);

    // 1) Create numeral targets on the left
    this.numTargets = [];
    const numPositions = [150, 250, 350, 450, 550];
    ['num1','num2','num3','num4','num5'].forEach((key, idx) => {
      const num = this.add.image(200, numPositions[idx], key)
        .setScale(0.7)
        .setData('number', idx + 1)
        .setInteractive({ dropZone: true });
      this.numTargets.push(num);
    });

    // 2) Create the word cards on the right, draggable
    this.wordCards = [];
    const wordPositions = [150, 250, 350, 450, 550];
    ['word1','word2','word3','word4','word5'].forEach((key, idx) => {
      const word = this.add.image(800, wordPositions[idx], key)
        .setScale(0.7)
        .setInteractive({ useHandCursor: true })
        .setData('number', idx + 1);
      this.input.setDraggable(word);
      this.wordCards.push(word);
    });

    // 3) Dragging behavior
    this.input.on('drag', (pointer, img, dragX, dragY) => {
      img.x = dragX;
      img.y = dragY;
    });

    this.matches = 0;

    this.input.on('drop', (pointer, img, target) => {
      const wordNum = img.getData('number');
      const targetNum = target.getData('number');
      if (wordNum === targetNum) {
        // Snap into place next to numeral
        img.x = target.x + 100;
        img.y = target.y;
        img.disableInteractive();
        this.matches++;

        // Play Dakelh audio for that number, with Raven echo
        this.sound.play(['lhudah','nada','tada','dida','skwunlada'][wordNum - 1]);
        this.time.delayedCall(600, () => {
          this.sound.play(['lhudah','nada','tada','dida','skwunlada'][wordNum - 1]);
        });

        // Raven praises
        this.time.delayedCall(1200, () => {
          this.sound.play('ravenaudio7_2', { volume: 1.5 });
        });

        // Once all five matched, move on
        if (this.matches === 5) {
          this.time.delayedCall(2000, () => {
            this.scene.start('scene6_SimpleAddition', data);
          });
        }
      } else {
        // Wrong match: snap word back to original X (800)
        this.tweens.add({
          targets: img,
          x: 800,
          y: wordPositions[wordNum - 1],
          duration: 400,
          ease: 'Power2'
        });
      }
    });

    // 4) Prompt from Robot
    speak("Drag each Dakelh word onto its matching number.");
  }
}
