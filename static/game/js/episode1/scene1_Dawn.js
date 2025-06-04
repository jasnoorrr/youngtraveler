// static/game/js/episode1/scene1_Dawn.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene1_Dawn extends Phaser.Scene {
  constructor() {
    super('scene1_Dawn');
  }

  preload() {
    // Load traveler images and Raven image
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Load background bird‐call and Raven’s voice line
    this.load.audio('birdcall',   '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio1','/static/game/assets/audio/ravenaudio (1).mp3');
  }

  create(data) {


    // Stop any existing sounds, then start bird‐call loop
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });

    // Advance progress tracker for Scene 1/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Robot narrator line (TTS)
    speak(
      "Welcome, young traveler! Today we journey along the ancient trails of our people. " +
      "Let’s learn and explore together."
    );

    // After 1 second, fade in traveler and Raven, then play Raven’s voice
    this.time.delayedCall(1000, () => {
      const travelerKey = data?.characterKey || 'traveler1';

      // Add traveler sprite (start invisible)
      this.traveler = this.add.sprite(200, 280, travelerKey)
        .setScale(0.6)
        .setAlpha(0);

      // Fade traveler in
      this.tweens.add({
        targets: this.traveler,
        alpha:    1,
        duration: 800
      });

      // Add Raven image (start invisible)
      this.raven = this.add.image(750, 300, 'raven')
        .setScale(0.45)
        .setAlpha(0);

      // Fade Raven in (move down to y=350) and then play voice line
      this.tweens.add({
        targets: this.raven,
        alpha:    1,
        y:       350,
        duration:1000,
        ease:    'Power1',
        onComplete: () => {
          this.sound.play('ravenaudio1', { volume: 2.0 });
        }
      });

      // After 2 more seconds, transition to Scene2_Intro
      this.time.delayedCall(2000, () => {
        this.scene.start('scene2_Intro', data);
      });
    });
  }
}
