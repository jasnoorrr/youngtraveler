import { speak, initVoices }   from '../common/SpeechUtils.js';
import RewardManager           from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene2_Intro extends Phaser.Scene {
  constructor() { super('scene2_Intro'); }

  preload() {
    this.load.image('traveler1','/static/game/assets/traveler1.png');
    this.load.image('traveler2','/static/game/assets/traveler2.png');
    this.load.video(
      'ravenVideo',
      '/static/game/assets/video/raven_right.webm',
      'loadeddata',
      true,
      false
    );
    this.load.audio('birdcall',  '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio2','/static/game/assets/audio/ravenaudio (2).mp3');
  }

  create(data) {
    // ─── Setup TTS & Dialogue ───────────────────────
    initVoices();
    installBubbleHelper(this);

    // ─── Ambient + Progress ─────────────────────────
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.game.events.emit(
      'updateProgress',
      RewardManager.instance.sceneProgress
    );

    // ─── Traveler fade-in ───────────────────────────
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add
      .sprite(350, 300, key)
      .setScale(0.6)
      .setAlpha(0);
    this.tweens.add({ targets: this.traveler, alpha: 1, duration: 800 });

    // ─── Raven perch + bubble ───────────────────────
    this.raven = this.add
      .video(750, 270, 'ravenVideo')
      .setScale(0.45)
      .setAlpha(0);
    this.tweens.add({
      targets: this.raven,
      alpha: 1, y: 360, duration: 1000, ease: 'Power1',
      onComplete: () => {
        this.raven.play(true);
        this.sound.play('ravenaudio2', { volume: 4.0 });
        this.showBubbleDialogue(
          'Raven',
          'Great, for picking berries, we will go through bushes & need a basket.',
          { x: 550, y: 150 },
          7000
        );
      }
    });

    // ─── Auto-advance after 10s ──────────────────────
    this.time.delayedCall(10000, () => {
      this.sound.stopAll();
      this.scene.start('scene3_Vocab', data);
    });

    // ─── NAVIGATION BUTTONS ─────────────────────────
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
      this.add
        .text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }

    // Next (bottom-right)
    if (idx < order.length - 1) {
      this.add
        .text(
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
  }
}
