// static/game/js/episode1/scene3_Vocab.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene3_Vocab extends Phaser.Scene {
  constructor() { super('scene3_Vocab'); }

  preload() {
    this.load.image('translucentbg', '/static/game/assets/translucent_bg.png');
    this.load.image('berryCard',    '/static/game/assets/berry.png');
    this.load.image('bushCard',     '/static/game/assets/bush.png');
    this.load.image('basketCard',   '/static/game/assets/basket.png');

    this.load.audio('birdcall', '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('tsaa',     '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('tenah',    '/static/game/assets/audio/bush.m4a');
    this.load.audio('bats',     '/static/game/assets/audio/basket.mp3');

    this.load.video(
      'ravenLeft',
      '/static/game/assets/video/raven_left.webm',
      'loadeddata',
      true,
      false
    );
    this.load.video(
      'ravenRight',
      '/static/game/assets/video/raven_right.webm',
      'loadeddata',
      true,
      false
    );
  }

  create(data) {
    // Background overlay
    this.add.image(500, 300, 'translucentbg').setDisplaySize(1000, 600);

    // Audio & progress
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Install dialogue helper
    installBubbleHelper(this);

    // Intro prompt
    const intro = "To know their names, click on each card.";
    speak(intro);
    this.add.text(
      this.cameras.main.centerX,
      150,
      intro,
      {
        font: '28px serif',
        fill: '#000000',
        align: 'center',
        wordWrap: { width: 800 }
      }
    ).setOrigin(0.5);

    // Raven flight loop
    const screenW = this.cameras.main.width;
    const flyY    = 80;
    this.raven = this.add.video(-100, flyY, 'ravenLeft').setScale(0.3);
    this.raven.play(true);
    const flyRight = () => {
      this.raven.load('ravenLeft');
      this.raven.play(true);
      this.tweens.add({
        targets: this.raven,
        x: screenW + 100,
        duration: 6000,
        ease: 'Linear',
        onComplete: flyLeft
      });
    };
    const flyLeft = () => {
      this.raven.load('ravenRight');
      this.raven.play(true);
      this.tweens.add({
        targets: this.raven,
        x: -100,
        duration: 6000,
        ease: 'Linear',
        onComplete: flyRight
      });
    };
    flyRight();

    // Create cards
    this.cards = [];
    const keys      = ['berryCard', 'bushCard', 'basketCard'];
    const sounds    = ['tsaa', 'tenah', 'bats'];
    const positions = [200, 500, 800];

    keys.forEach((key, i) => {
      const card = this.add.image(positions[i], -200, key)
        .setScale(0.4)
        .setInteractive({ useHandCursor: true });
      this.cards.push(card);

      // Tween into view
      this.time.delayedCall(i * 500, () => {
        this.tweens.add({
          targets: card,
          y: 300,
          duration: 600,
          ease: 'Power2'
        });
      });

      // Play sound on click
      card.on('pointerdown', () => {
        this.sound.play(sounds[i], { volume: 1.0 });
      });
    });

    // Hint text
    this.add.text(
      this.cameras.main.centerX,
      550,
      'Click to hear; then use Next to continue',
      {
        font: '20px serif',
        fill: '#ffffff',
        backgroundColor: '#00000080',
        padding: 8,
        align: 'center'
      }
    ).setOrigin(0.5);

    // Navigation buttons
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

    // Previous button
    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }

    // Next enters selection mode
    const nextBtn = this.add.text(
      this.cameras.main.width - 20,
      this.cameras.main.height - 50,
      'Next →',
      navStyle
    ).setOrigin(1, 0)
     .setInteractive({ useHandCursor: true })
     .on('pointerdown', enterSelection.bind(this));

    // Selection mode logic
    function enterSelection() {
      // Robot prompt (top center, white text)
      const prompt = "Now choose the basket to play the berry picking game.";
      speak(prompt);
      this.add.text(
        this.cameras.main.centerX,
        80,
        prompt,
        {
          font: '28px serif',
          fill: '#00000',
          align: 'center',
          wordWrap: { width: 800 }
        }
      ).setOrigin(0.5);

      // Remove Next button
      nextBtn.destroy();

      // Update card interactions
      this.cards.forEach(card => {
        card.removeAllListeners('pointerdown');
        card.on('pointerdown', () => {
          if (card.texture.key === 'basketCard') {
            this.sound.stopAll();
            this.scene.start('scene4_BerryGame', data);
          } else {
            // Robot feedback for wrong choice
            const wrong = "Wrong, try again.";
            speak(wrong);
            this.add.text(
              this.cameras.main.centerX,
              80,
              wrong,
              {
                font: '24px serif',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: 600 }
              }
            ).setOrigin(0.5);
          }
        });
      });
    }
  }
}
