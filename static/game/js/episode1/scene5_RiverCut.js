// static/game/js/episode1/scene5_RiverCut.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';

export default class Scene5_RiverCut extends Phaser.Scene {
  constructor() {
    super('scene5_RiverCut');
  }

  preload() {
    // 1) Load the river video from the “video” folder
    this.load.video(
      'riverBg',
      '/static/game/assets/video/riverbg.mp4',
      'loadeddata',
      true,    // noAudio: we’ll play water.mp3 underneath instead
      false
    );
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');
    // 2) Load ambient water audio and “talukw” pronunciation
    this.load.audio('water',   '/static/game/assets/audio/water.mp3');
    this.load.audio('talukw',  '/static/game/assets/audio/salmon.m4a');
    this.load.audio('ravenaudio5', '/static/game/assets/audio/ravenaudio (5).mp3');
    this.load.audio('birdcall', '/static/game/assets/audio/bird_calls.mp3');
  }

  create(data) {
    // 0) Immediately stop the forest background (so its looped image/audio stops)
    this.scene.stop('BackgroundScene');

    // 1) Now stop any stray sounds (just in case)
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });

    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(1);                                                                    // start invisible

    // 4) Tween the traveler to fade in
    this.tweens.add({
      targets: this.traveler,
      alpha:   1,
      duration: 800
    });

    // 5) Add Raven (start off-screen or invisible)
    this.raven = this.add.image(700, 150, 'raven')   // adjust (x,y) to taste
      .setScale(0.45)
      .setAlpha(1);

    // 6) Tween Raven: fade in + (optionally) move to “perch” position
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y:     200,       // final “perch” y—tweak to suit your layout
      ease:  'Power1',
      duration: 1000
    });


    // 2) Advance our progress tracker: Scene 5/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Robot (TTS) introduction
    speak("We’re at Tsalakoh, the Salmon River. Listen to the flow…");

    // 4) Add the video background, muted but set to loop
    const vid = this.add.video(0, 0, 'riverBg').setOrigin(0);
    vid.on('play', () => {
      // Stretch to fill the entire 1000×600 canvas
      vid.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    });
    vid.play(true).setMute(true); // “true”→loop

    // 5) Play ambient water.mp3 underneath (looped)
    this.sound.play('water', { loop: true, volume: 0.3 });


    // 6) Raven’s line after 2 seconds
    this.time.delayedCall(5000, () => {
      this.sound.play('ravenaudio5', { loop: false, volume: 2.0 });
      //this.sound.play('talukw');
    });

    // 8) Robot prompt after 5.5 seconds total
    speak("Tap the salmon as they swim by to hear ‘talukw’!");

    this.input.once('pointerdown', () => {
      this.scene.start('scene6_Fishing', data);
    });
  }
}
