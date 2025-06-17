import { speak, initVoices }      from '../common/SpeechUtils.js';
import RewardManager              from '../common/RewardManager.js';
import { installBubbleHelper }    from '../common/DialogueHelper.js';

export default class Scene1_Dawn extends Phaser.Scene {
  constructor() {
    super('scene1_Dawn');
  }

  preload() {
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.video(
      'ravenVideo',
      '/static/game/assets/video/raven_right.webm',
      'loadeddata',
      true,
      false
    );
    this.load.audio('birdcall',    '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio1', '/static/game/assets/audio/ravenaudio (1).mp3');
  }

  create(data) {
    // ensure voices are loaded for speech
    initVoices();

    // install the bubble helper once
    installBubbleHelper(this);

    // ─── Ambient + Progress ───────────────────────────
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.game.events.emit(
      'updateProgress',
      RewardManager.instance.sceneProgress
    );

    // ─── Robot Narrator Intro ─────────────────────────
    const intro =
      "Welcome, young traveler! Today we journey along the ancient trails of our people. Let’s learn and explore together.";
    speak(intro);
    this.add
      .text(
        this.cameras.main.centerX,
        100,
        intro,
        {
          font: '28px serif',
          align: 'center',
          wordWrap: { width: 800 }
        }
      )
      .setOrigin(0.5);

    // ─── After 8s: Fade in traveler + raven, show bubble ─
    this.time.delayedCall(8000, () => {
      const key = data?.characterKey || 'traveler1';
      this.traveler = this.add
        .sprite(200, 280, key)
        .setScale(0.6)
        .setAlpha(0);
      this.tweens.add({
        targets: this.traveler,
        alpha: 1,
        duration: 800
      });

      this.raven = this.add
        .video(750, 300, 'ravenVideo')
        .setScale(0.5)
        .setAlpha(0);
      this.tweens.add({
        targets: this.raven,
        alpha: 1,
        y: 350,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
          this.raven.play(true);
          this.sound.play('ravenaudio1', { volume: 4.0 });
          this.showBubbleDialogue(
            'Raven',
            "Hi traveler! I'm your animal guide.",
            { x: 550, y: 150 },
            7000
          );
        }
      });

      // transition to Scene 2
      this.time.delayedCall(9000, () => {
        this.scene.start('scene2_Intro', data);
      });
    });

    // ─── NAVIGATION BUTTONS ────────────────────────
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
    const currentKey = this.sys.settings.key;
    const idx = order.indexOf(currentKey);

    // Previous (bottom-left)
    if (idx > 0) {
      this.add
        .text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
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
          this.scene.start(order[idx + 1], data);
        });
    }
  }
}
