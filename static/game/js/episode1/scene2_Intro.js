// static/game/js/episode1/scene2_Intro.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene2_Intro extends Phaser.Scene {
  constructor() {
    super('scene2_Intro');
  }

  preload() {
    // Load both traveler options and Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');
    this.load.audio('birdcall', '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio2', '/static/game/assets/audio/ravenaudio (2).mp3');
   // this.load.audio('taudio5', '/static/game/assets/audio/taudio (5).mp3');
  }

  create(data) {
    // 1) Stop any leftover sounds from the previous scene
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });

    // 2) Advance progress to Scene 2/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Raven (robot) TTS line
    this.sound.play('ravenaudio2', { loop: false, volume: 2.0 });

      const travelerKey = data.characterKey || 'traveler1';

      // Add Traveler (invisible at first), then fade in
      this.traveler = this.add.sprite(350, 300, travelerKey)
        .setScale(0.6)
        .setAlpha(0)
        .setDepth(5);

      this.tweens.add({
        targets: this.traveler,
        alpha: 1,
        duration: 800
      });

      // Add Raven (invisible at first), then tween down onto Traveler's shoulder
      this.raven = this.add.image(750, 270, 'raven')
        .setScale(0.45)
        .setAlpha(0)
        .setDepth(6);

      this.tweens.add({
        targets: this.raven,
        alpha: 1,
        y: 360,           // final perch position
        duration: 1000,
        ease: 'Power1'
      });

      //this.sound.play('taudio5', { loop: false, volume: 2.0 });
      // 5) Once both have appeared (give 2 more seconds), move to Scene3_Vocab
      this.time.delayedCall(8000, () => {
        this.scene.start('scene3_Vocab', data);
      });
  }
}
