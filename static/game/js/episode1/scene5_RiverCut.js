// static/game/js/episode1/scene5_RiverCut.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene5_RiverCut extends Phaser.Scene {
  constructor() { super('scene5_RiverCut'); }

  preload() {
    this.load.video('riverBg',    '/static/game/assets/video/riverbg.mp4', 'loadeddata', true, false);
    this.load.image('traveler1',  '/static/game/assets/traveler1.png');
    this.load.image('traveler2',  '/static/game/assets/traveler2.png');
    this.load.video('ravenVideo', '/static/game/assets/video/raven_loop.webm', 'loadeddata', true, false);
    this.load.audio('water',      '/static/game/assets/audio/water.mp3');
    this.load.audio('ravenaudio5','/static/game/assets/audio/ravenaudio (5).mp3');
    this.load.audio('birdcall',   '/static/game/assets/audio/bird_calls.mp3');
  }

  create(data) {
    // 1) Ambient & progress
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);
    installBubbleHelper(this);

    // 2) Video background
    const vid = this.add.video(0, 0, 'riverBg').setOrigin(0);
    vid.on('play', () => vid.setDisplaySize(this.cameras.main.width, this.cameras.main.height));
    vid.play(true).setMute(true);

    // 3) Water audio
    this.sound.play('water', { loop: true, volume: 0.3 });

    // 4) Traveler fade in
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(300, 300, key).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: this.traveler, alpha: 1, duration: 800 });

    // 5) Raven fade + audio → THEN narrator
    this.raven = this.add.video(700, 150, 'ravenVideo').setScale(0.45).setAlpha(0);
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y: 200,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        this.raven.play(true);
        const ravenLine = this.sound.add('ravenaudio5', { volume: 3.0 });
        ravenLine.play();
        this.showBubbleDialogue(
          'Raven',
          "In Dakelh, sockeye salmon is called 'Taslakoh'",
          { x: 350, y: 130 },
          6000
        );

        ravenLine.once('complete', () => {
          // Robot narrator speaks
          speak("Tap the salmon as they swim by to hear ‘talukw’!");
          this.add.text(
            500, 50,
            "Tap the salmon as they swim by to hear ‘talukw’!",
            { font: '28px serif', align: 'center', wordWrap: { width: 800 } }
          ).setOrigin(0.5);

          // Enable next-scene on click
          this.input.once('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('scene6_Fishing', data);
          });
        });
      }
    });

    // ─── NAVIGATION BUTTONS ────────────────────────────
    const navStyle = {
      font: '24px serif',
      backgroundColor: '#4a90e2',
      color: '#ffffff',
      padding: { x: 10, y: 6 }
    };
    const order = [
      'scene1_Dawn',
      'scene2_Intro',
      'scene3_Vocab',
      'scene4_BerryGame',
      'scene4b_FishVocab',
      'scene5_RiverCut',
      'scene6_Fishing',
      'scene7_Map',
      'scene8_Feast',
      'scene9_Outro'
    ];
    const idx = order.indexOf(this.sys.settings.key);

    // Previous (bottom-left)
    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }

    // Next (bottom-right)
    if (idx < order.length - 1) {
      this.add.text(
        this.cameras.main.width - 20,
        this.cameras.main.height - 50,
        'Next →',
        navStyle
      )
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx + 1], data);
        });
    }
    // ───────────────────────────────────────────────────
  }
}
