import { speak }                from '../common/SpeechUtils.js';
import RewardManager            from '../common/RewardManager.js';
import { installBubbleHelper }  from '../common/DialogueHelper.js';

export default class Scene9_Outro extends Phaser.Scene {
  constructor() {
    super('scene9_Outro');
  }

  preload() {
    this.load.image('forestbg',   '/static/game/assets/forest_bg.png');
    this.load.image('traveler1',  '/static/game/assets/traveler1.png');
    this.load.image('traveler2',  '/static/game/assets/traveler2.png');
    this.load.video('ravenVideo', '/static/game/assets/video/raven_loop.webm','loadeddata',true,false);
    this.load.audio('outroVoice', '/static/game/assets/audio/outro.mp3');
  }

  create(data) {
    // Stop ambient sounds
    this.sound.stopAll();

    // Dialogue helper
    installBubbleHelper(this);

    // Full-screen forest background
    this.add.image(0, 0, 'forestbg')
      .setOrigin(0, 0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setDepth(-1);

    // Progress
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Traveler fade-in
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(250, 300, key)
      .setScale(0.6)
      .setAlpha(0);
    this.tweens.add({ targets: this.traveler, alpha: 1, duration: 800 });

    // Raven fade-in and loop
    this.raven = this.add.video(650, 200, 'ravenVideo')
      .setScale(0.6)
      .setAlpha(0);
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y: 220,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => this.raven.play(true)
    });

    // Outro narration
    const line = "You did it! Ready to review or revisit earlier scenes?";
    speak(line);
    this.add.text(500, 80, line, {
      font: '28px serif',
      align: 'center',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    // NAVIGATION BUTTONS
    const navStyle = {
      font: '24px serif',
      backgroundColor: '#4a90e2',
      color: '#ffffff',
      padding: { x: 10, y: 6 }
    };
    const order = [
      'scene1_Dawn','scene2_Intro','scene3_Vocab','scene4_BerryGame',
      'scene4b_FishVocab','scene5_RiverCut','scene6_Fishing',
      'scene7_Map','scene8_Feast','scene9_Outro'
    ];
    const idx = order.indexOf(this.sys.settings.key);

    // Previous button
    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }

    // Home button (bottom-right)
    this.add.text(
      this.cameras.main.width - 20,
      this.cameras.main.height - 50,
      'Back To Home →',
      navStyle
    )
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.location.href = '/';
      });
  }
}
