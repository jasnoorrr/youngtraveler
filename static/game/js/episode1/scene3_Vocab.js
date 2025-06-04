// static/game/js/episode1/scene3_Vocab.js

import { speak }     from '../common/SpeechUtils.js';   // you can keep this import if you still use speak() elsewhere
import RewardManager from '../common/RewardManager.js';

export default class Scene3_Vocab extends Phaser.Scene {
  constructor() {
    super('scene3_Vocab');
  }

  preload() {
    // Preload each vocab card image
    this.load.image('berryCard',  '/static/game/assets/berry.png');
    this.load.image('bushCard',   '/static/game/assets/bush.png');
    this.load.image('basketCard', '/static/game/assets/basket.png');
    this.load.audio('birdcall',   '/static/game/assets/audio/bird_calls.mp3');

    // Preload pronunciations
    this.load.audio('tsaa',  '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('tenah', '/static/game/assets/audio/bush.m4a');
    this.load.audio('bats',  '/static/game/assets/audio/basket.mp3');
  }

  create(data) {
    // Stop any leftover sounds
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });

    // Advance progress to Scene 3/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Robot voice‐over (introducing the words)
    // If you want just the three words spoken once at scene start, you can keep this.
    // Otherwise, remove it so only the card audio plays on hover.
    speak("First word, tsulcho, berry. Next, t’enäh, bush. Finally, bäts, basket.");

    // Set up arrays for keys, audio‐keys, and displayed text (displayed text is optional here)
    this.cards = [];
    const keys      = ['berryCard','bushCard','basketCard'];
    const sounds    = ['tsaa','tenah','bats'];
    const positions = [200, 500, 800];

    keys.forEach((key, idx) => {
      // Place each card offscreen above the top
      const card = this.add.image(positions[idx], -200, key)
        .setScale(0.4)
        .setInteractive({ useHandCursor: true });

      // Attach a flag to track whether this card’s audio already played
      card.audioPlayed = false;

      this.cards.push(card);

      // Animate the card’s y into 300 after idx×500ms
      this.time.delayedCall(idx * 500, () => {
        this.tweens.add({
          targets: card,
          y: 300,
          duration: 600,
          ease: 'Power2'
        });
      });

      // Hover: play that card’s Dakelh audio only once
      card.on('pointerover', () => {
        if (!card.audioPlayed) {
          this.sound.play(sounds[idx]);
          card.audioPlayed = true;
        }
      });
    });

    // On‐screen instruction at bottom (optional)
    this.add.text(
      500, 550,
      'Hover over each card to learn the Dakelh word.',
      { font: '20px serif', color: '#fff', backgroundColor: '#00000080', padding: 8 }
    ).setOrigin(0.5);

    // When the basket card is clicked, immediately start Scene 4
    this.cards[2].on('pointerdown', () => {
      this.scene.start('scene4_BerryGame', data);
    });
  }
}
