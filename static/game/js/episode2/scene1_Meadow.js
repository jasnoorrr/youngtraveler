// static/game/js/episode2/scene1_Meadow.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene1_Meadow extends Phaser.Scene {
  constructor() {
    super('scene1_Meadow');
  }

  preload() {
    // Traveler & Raven assets (carry over from Episode 1)
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Meadow background
    this.load.image('meadowBg', '/static/game/assets/episode2/meadow_bg.png');

    // Audio
    this.load.audio('birdcall',      '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio1_2', '/static/game/assets/audio/ep2_ravenaudio1.mp3');
    this.load.audio('robotwelcome2', '/static/game/assets/audio/ep2_robot_welcome.mp3');
  }

  create(data) {
    // DEBUG: background color & log
    console.log("scene1_Meadow create() called");
    this.cameras.main.setBackgroundColor('#ffffff');

    // 1) Play looped birdcall
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.5 });

    // 2) Advance progress (if you’re tracking Scene 2 progress)
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Meadow background
    this.add.image(500, 300, 'meadowBg').setDisplaySize(1000, 600);

    // 4) Robot narrator greeting (via pre-recorded or TTS)
    // If you have a pre-recorded “robotwelcome2.mp3,” play it; otherwise, use speak():
    if (this.sound.get('robotwelcome2')) {
      this.sound.play('robotwelcome2', { volume: 1.2 });
    } else {
      speak("Welcome back, young traveler! Today we’ll learn to count in Dakelh while making a beautiful flower headband.");
    }

    // 5) After 3 seconds, fade in traveler & Raven, and have Raven speak:
    this.time.delayedCall(3000, () => {
      const travelerKey = data?.characterKey || 'traveler1';

      // Traveler (start invisible)
      this.traveler = this.add.sprite(200, 300, travelerKey)
        .setScale(0.6)
        .setAlpha(0);
      this.tweens.add({
        targets: this.traveler,
        alpha: 1,
        duration: 800
      });

      // Raven (start invisible), perched above the traveler
      this.raven = this.add.image(800, 200, 'raven')
        .setScale(0.45)
        .setAlpha(0);
      this.tweens.add({
        targets: this.raven,
        alpha: 1,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
          // Raven’s line
          this.sound.play('ravenaudio1_2', { volume: 2.0 });
        }
      });

      // 6) After Raven’s line (approx. 2 s), start Scene 2:
      this.time.delayedCall(5000, () => {
        this.scene.start('scene2_VocabNumbers', data);
      });
    });
  }
}
