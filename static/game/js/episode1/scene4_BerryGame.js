// static/game/js/episode1/scene4_BerryGame.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene4_BerryGame extends Phaser.Scene {
  constructor() {
    super('scene4_BerryGame');
  }

  preload() {
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');
    this.load.image('berry', '/static/game/assets/berry.png');
    this.load.image('basket','/static/game/assets/basket.png');
    //this.load.audio('tsaa',   '/static/game/assets/audio/tsaa.mp3');
    //this.load.audio('bats',   '/static/game/assets/audio/bats.mp3');
    this.load.audio('birdcall', '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio3', '/static/game/assets/audio/ravenaudio (3).mp3');
    this.load.audio('ravenaudio4', '/static/game/assets/audio/ravenaudio (4).mp3');
  }

  create(data) {
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);
    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(350, 300, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(0);                                   // start invisible

    // 4) Tween the traveler to fade in
    this.tweens.add({
      targets: this.traveler,
      alpha:   1,
      duration: 800
    });

    // 5) Add Raven (start off-screen or invisible)
    this.raven = this.add.image(700, 400, 'raven')   // adjust (x,y) to taste
      .setScale(0.45)
      .setAlpha(0);

    // 6) Tween Raven: fade in + (optionally) move to “perch” position
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y:     200,       // final “perch” y—tweak to suit your layout
      ease:  'Power1',
      duration: 1000
    });



    // Robot instruction
    speak("Drag each tsaa into your bäts. Let’s do it!");
    this.add.text(500, 50, 'Drag each tsaa into your bäts', {
      font: '28px serif', align: 'center'
    }).setOrigin(0.5);

    // Basket drop‐zone
    this.basket = this.add.image(500, 500, 'basket')
      .setInteractive({ dropZone: true })
      .setScale(0.4);

    this.collected = 0;

    // Create 5 draggable berries
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 600);
      const y = Phaser.Math.Between(100, 400);
      const berry = this.add.image(x, y, 'berry')
        .setScale(0.1)
        .setInteractive({ useHandCursor:true });
      this.input.setDraggable(berry);
    }

    this.input
      .on('dragstart', (_, img) => img.setScale(0.12))
      .on('drag', (_, img, x, y) => img.setPosition(x, y))
      .on('drop', (_, img) => {

        // Raven says “Yay!” on first pick
        if (this.collected === 0) {
            this.sound.play('ravenaudio3', { loop: false, volume: 2.0 });
        }

        this.collected++;
        RewardManager.instance.awardStar(1);
        RewardManager.instance.addJournalEntry({
          word: 'tsaa',
          meaning: 'berry',
          imgKey: 'berry',
          audioKey: 'tsaa'
        });
        this.events.emit('updateStars', RewardManager.instance.stars);

        if (this.collected === 5) {
          // Raven’s “Great job!”
          this.sound.play('ravenaudio4', { loop: false, volume: 2.0 });
          this.time.delayedCall(3000, () => {
            // Robot’s transition
            speak("Excellent! Now let’s follow the river and learn about salmon.");
            this.time.delayedCall(6000, () => {
              this.scene.start('scene5_RiverCut', data);
            });
          });
        }
      })
      .on('dragend', (_, img) => img.setScale(0.1));
  }
}
