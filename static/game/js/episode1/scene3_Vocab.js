// static/game/js/episode1/scene3_Vocab.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene3_Vocab extends Phaser.Scene {
  constructor() { super('scene3_Vocab'); }

  preload() {
    this.load.image('translucentbg','/static/game/assets/translucent_bg.png');
    this.load.image('berryCard',   '/static/game/assets/berry.png');
    this.load.image('bushCard',    '/static/game/assets/bush.png');
    this.load.image('basketCard',  '/static/game/assets/basket.png');

    this.load.audio('birdcall','/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('tsaa',    '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('tenah',   '/static/game/assets/audio/bush.m4a');
    this.load.audio('bats',    '/static/game/assets/audio/basket.mp3');

    this.load.video('ravenLeft',  '/static/game/assets/video/raven_left.webm',  'loadeddata', true, false);
    this.load.video('ravenRight', '/static/game/assets/video/raven_right.webm', 'loadeddata', true, false);
  }

  create(data) {
    // background overlay
    this.add.image(500, 300, 'translucentbg').setDisplaySize(1000, 600);

    // audio & scene progress
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // install the bubble helper
    installBubbleHelper(this);

    // corrected intro text style
    const intro = "Hover on each card of Berry, Bush and Basket to hear its Dakelh pronunciation";
    speak(intro);
    this.add.text(
      this.cameras.main.centerX,
      150,
      intro,
      {
        font: '28px serif',
        color: '#000000',
        align: 'center',
        wordWrap: { width: 800 }
      }
    ).setOrigin(0.5);

    // raven flight loop, lowered to y=80
    const screenW = this.cameras.main.width;
    const flyY    = 80;

    this.raven = this.add.video(-100, flyY, 'ravenLeft').setScale(0.3).setAlpha(1);
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

    // vocabulary cards
    this.cards = [];
    const keys      = ['berryCard','bushCard','basketCard'];
    const sounds    = ['tsaa','tenah','bats'];
    const positions = [200,500,800];
    let hoverCount = 0;

    keys.forEach((key, i) => {
      const card = this.add.image(positions[i], -200, key)
        .setScale(0.4)
        .setInteractive({ useHandCursor: true });
      card.audioPlayed = false;
      this.cards.push(card);

      this.time.delayedCall(i * 500, () => {
        this.tweens.add({
          targets: card,
          y: 300,
          duration: 600,
          ease: 'Power2'
        });
      });

      card.on('pointerover', () => {
        if (!card.audioPlayed) {
          this.sound.play(sounds[i]);
          card.audioPlayed = true;
          hoverCount++;
          if (hoverCount === 3) {
            speak("Now click the basket to play a game.");
          }
        }
      });
    });

    // on-screen hint
    this.add.text(
      500, 550,
      'Hover to learn; then click the basket',
      { font: '20px serif', color: '#fff', backgroundColor: '#00000080', padding: 8 }
    ).setOrigin(0.5);

    // advance on basket click
    this.cards[2].on('pointerdown', () => {
      this.scene.start('scene4_BerryGame', data);
    });
  }
}
