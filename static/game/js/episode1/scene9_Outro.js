// static/game/js/episode1/scene9_Outro.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';

export default class Scene9_Outro extends Phaser.Scene {
  constructor() {
    super('scene9_Outro');
  }

  preload() {
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');
    this.load.audio('outroVoice', '/static/game/assets/audio/outro.mp3'); // optional
  }

  create(data) {
    // final progress (9/9)
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);
    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(0);
                                     // start invisible
    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(0);
    // 4) Tween the traveler to fade in
    this.tweens.add({
      targets: this.traveler,
      alpha:   1,
      duration: 800
    });

    // 5) Add Raven (start off-screen or invisible)
    this.raven = this.add.image(700, 150, 'raven')   // adjust (x,y) to taste
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



    // Robot’s wrap‐up line
    speak("You did it! Ready for the next adventure, or to review what you’ve learned?");
    // Optionally play outroVoice.wav simultaneously if you have it.

    // Show three buttons: Next Episode, Replay, Review
    const style = { font: '24px serif', backgroundColor: '#4a90e2', color: '#ffffff', padding: 10 };

    // ▶ Next Episode
    this.add.text(300, 450, '▶ Next Episode', style)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // Go to Episode 2 in your Django‐Phaser flow, e.g. redirect URL or scene
        window.location.href = `/episodes/2/?username=${data.username}&character=${data.characterKey}`;
      });

    // 🔄 Replay
    this.add.text(500, 450, '🔄 Replay', style)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('scene1_Dawn', data);
      });

    // 📚 Review
    this.add.text(700, 450, '📚 Review', style)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // Jump back to vocabulary review
        this.scene.start('scene3_Vocab', data);
      });
  }
}
