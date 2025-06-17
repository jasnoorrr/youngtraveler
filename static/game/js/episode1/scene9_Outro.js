// static/game/js/episode1/scene9_Outro.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene9_Outro extends Phaser.Scene {
  constructor() { super('scene9_Outro'); }

  preload() {
    this.load.image('forestbg',   '/static/game/assets/forest_bg.png');
    this.load.image('traveler1',  '/static/game/assets/traveler1.png');
    this.load.image('traveler2',  '/static/game/assets/traveler2.png');
    this.load.video('ravenVideo', '/static/game/assets/video/raven_loop.webm', 'loadeddata', true, false);
    this.load.audio('outroVoice', '/static/game/assets/audio/outro.mp3');
  }

  create(data) {
    // Stop all sounds (fixed)
    this.sound.stopAll();

    // Install the bubble helper (if you need it here)
    installBubbleHelper(this);

    // Full-screen forest background at depth -1
    this.add.image(0, 0, 'forestbg')
      .setOrigin(0, 0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setDepth(-1);

    // Progress
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Traveler fades in
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(250, 300, key)
      .setScale(0.6)
      .setAlpha(0);
    this.tweens.add({ targets: this.traveler, alpha: 1, duration: 800 });

    // Raven fades in and loops
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

    // Outro narration (no bubble)
    const line = "You did it! Ready for the next adventure, or to review what you’ve learned?";
    speak(line);
    this.add.text(500, 80, line, {
      font: '28px serif',
      align: 'center',
      wordWrap: { width: 900 }
    }).setOrigin(0.5);

    // Buttons
    const style = { font: '24px serif', backgroundColor: '#4a90e2', color: '#fff', padding: 10 };
    this.add.text(300, 450, '▶ Next Episode', style)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.location.href = `/episodes/2/?username=${data.username}&character=${data.characterKey}`;
      });

    this.add.text(500, 450, '🔄 Replay', style)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('scene1_Dawn', data));

    this.add.text(700, 450, '📚 Review', style)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('scene3_Vocab', data));
  }
}
