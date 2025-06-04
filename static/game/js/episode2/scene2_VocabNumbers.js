// static/game/js/episode2/scene2_VocabNumbers.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene2_VocabNumbers extends Phaser.Scene {
  constructor() {
    super('scene2_VocabNumbers');
  }

  preload() {
    // Traveler & Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Wooden cards (1–5) and flower icon
    this.load.image('card1', '/static/game/assets/episode2/card1.png');
    this.load.image('card2', '/static/game/assets/episode2/card2.png');
    this.load.image('card3', '/static/game/assets/episode2/card3.png');
    this.load.image('card4', '/static/game/assets/episode2/card4.png');
    this.load.image('card5', '/static/game/assets/episode2/card5.png');
    this.load.image('flowerIcon', '/static/game/assets/episode2/flower.png');

    // Audio for numbers (Dakelh pronunciations)
    this.load.audio('lhudah',     '/static/game/assets/audio/lhudah.mp3');
    this.load.audio('nada',       '/static/game/assets/audio/nada.mp3');
    this.load.audio('tada',       '/static/game/assets/audio/tada.mp3');
    this.load.audio('dida',       '/static/game/assets/audio/dida.mp3');
    this.load.audio('skwunlada',  '/static/game/assets/audio/skwunlada.mp3');

    // Robot instruction
    this.load.audio('robotvocab2','/static/game/assets/audio/ep2_robot_vocab2.mp3');
    this.load.audio('ravenvocab2','/static/game/assets/audio/ep2_ravenvocab2.mp3');
  }

  create(data) {
    // 1) Background color and progress
    console.log("scene2_VocabNumbers create() called");
    this.cameras.main.setBackgroundColor('#f0ece0');
    this.sound.stopAll();
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 2) Traveler & Raven (immediately visible)
    const travelerKey = data?.characterKey || 'traveler1';
    this.traveler = this.add.sprite(150, 450, travelerKey).setScale(0.6);
    this.raven    = this.add.image(850, 150, 'raven').setScale(0.45);

    // 3) Robot voice‐over to introduce words (use pre-recorded or TTS)
    if (this.sound.get('robotvocab2')) {
      this.sound.play('robotvocab2', { volume: 1.2 });
    } else {
      speak(
        "One – lhudah. Two – nada. Three – tada. Four – dida. Five – skwunlada."
      );
    }

    // 4) Slide in five cards, one by one
    this.cards = [];
    const positions = [150, 350, 550, 750, 950];
    ['card1','card2','card3','card4','card5'].forEach((key, idx) => {
      const card = this.add.image(positions[idx], -200, key)
        .setScale(0.8)
        .setInteractive({ useHandCursor: true })
        .setData('number', idx + 1); // store 1–5

      // Put a small flower icon in the corner of each card
      this.add.image(positions[idx] + 40, -160, 'flowerIcon').setScale(0.3);

      this.cards.push(card);

      // Delay each slide-in
      this.time.delayedCall(idx * 400, () => {
        this.tweens.add({
          targets: card,
          y: 200,
          duration: 600,
          ease: 'Power2',
          onComplete: () => {
            // When each card finishes sliding in, have Raven echo that number in Dakelh
            const soundKey = ['lhudah','nada','tada','dida','skwunlada'][idx];
            this.sound.play(soundKey);
            speak(
              ['Lhudah!','Nada!','Tada!','Dida!','Skwunlada!'][idx]
            );
          }
        });
      });
    });

    // 5) After all 5 cards are in place (approx. 5×400 + 600 ms = 2600 ms), prompt user
    this.time.delayedCall(3000, () => {
      if (this.sound.get('robotvocab2')) {
        this.sound.play('ravenvocab2', { volume: 1.2 });
      } else {
        speak("Great! Tap any card to rehear its Dakelh pronunciation.");
      }

      // Clicking any card will replay its Dakelh sound, then after 2 s proceed:
      this.cards.forEach((card, idx) => {
        card.once('pointerdown', () => {
          const soundKey = ['lhudah','nada','tada','dida','skwunlada'][idx];
          this.sound.play(soundKey);
          speak(
            ['Lhudah','Nada','Tada','Dida','Skwunlada'][idx]
          );
          this.time.delayedCall(2000, () => {
            this.scene.start('scene3_FlowerGather', data);
          });
        });
      });
    });
  }
}
