// static/game/js/episode1/scene4b_FishVocab.js

import { speak }               from '../common/SpeechUtils.js';
import RewardManager            from '../common/RewardManager.js';
import { installBubbleHelper }  from '../common/DialogueHelper.js';

export default class Scene4b_FishVocab extends Phaser.Scene {
  constructor() { super('scene4b_FishVocab'); }

  preload() {
    // background
    this.load.image('translucentbg', '/static/game/assets/translucent_bg.png');
    // cards
    this.load.image('salmonFish',    '/static/game/assets/salmonfish.png');
    this.load.image('riverIcon',     '/static/game/assets/iconRiver.png');
    this.load.image('netIcon',       '/static/game/assets/net.png');
    // audio
    this.load.audio('birdcall',      '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('talukw',        '/static/game/assets/audio/salmon.m4a');
    this.load.audio('riverAudio',    '/static/game/assets/audio/salmonriver.m4a');
    this.load.audio('fishingnet',    '/static/game/assets/audio/fishingnet.m4a');

    // raven videos
    this.load.video('ravenLeft',     '/static/game/assets/video/raven_left.webm','loadeddata',true,false);
    this.load.video('ravenRight',    '/static/game/assets/video/raven_right.webm','loadeddata',true,false);
  }

  create(data) {
    // background overlay
    this.add.image(500, 300, 'translucentbg').setDisplaySize(1000, 600);

    // audio & progress
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // dialogue helper
    installBubbleHelper(this);

    // intro prompt
    const intro = "To know their names, click on each card.";
    speak(intro);
    this.add.text(
      this.cameras.main.centerX,
      150,
      intro,
      { font: '28px serif', color: '#000', align: 'center', wordWrap: { width: 800 } }
    ).setOrigin(0.5);

    // raven flight
    const screenW = this.cameras.main.width, flyY = 80;
    this.raven = this.add.video(-100, flyY, 'ravenLeft').setScale(0.3);
    this.raven.play(true);
    const flyRight = () => {
      this.raven.load('ravenLeft'); this.raven.play(true);
      this.tweens.add({ targets: this.raven, x: screenW + 100, duration: 6000, ease: 'Linear', onComplete: flyLeft });
    };
    const flyLeft = () => {
      this.raven.load('ravenRight'); this.raven.play(true);
      this.tweens.add({ targets: this.raven, x: -100, duration: 6000, ease: 'Linear', onComplete: flyRight });
    };
    flyRight();

    // set up cards
    this.cards = [];
    const keys      = ['salmonFish', 'riverIcon', 'netIcon'];
    const sounds    = ['talukw',     'riverAudio',  'fishingnet'];
    const ttsWords  = [ null,         null,          'lhombilh' ];
    const positions = [200, 500, 800];

    keys.forEach((key, i) => {
      const card = this.add.image(positions[i], -200, key)
        .setScale(0.4)
        .setInteractive({ useHandCursor: true });
      this.cards.push(card);

      // tween into view
      this.time.delayedCall(i * 500, () => {
        this.tweens.add({ targets: card, y: 300, duration: 600, ease: 'Power2' });
      });

      // click to hear
      card.on('pointerdown', () => {
        if (sounds[i]) {
          this.sound.play(sounds[i], { volume: 1.0 });
        } else {
          speak(ttsWords[i]);
        }
      });
    });

    // on-screen hint
    this.add.text(
      500, 550,
      'Click to hear; then use Next to continue',
      { font: '20px serif', color: '#fff', backgroundColor: '#00000080', padding: 8 }
    ).setOrigin(0.5);

    // navigation buttons
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

    // Previous
    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }

    // Next → enters selection mode
    const nextBtn = this.add.text(
      this.cameras.main.width - 20,
      this.cameras.main.height - 50,
      'Next →',
      navStyle
    ).setOrigin(1, 0)
     .setInteractive({ useHandCursor: true })
     .on('pointerdown', () => enterSelection.call(this));

    // selection mode
    function enterSelection() {
      // Robot prompt (top center)
      const prompt = "Now choose the fishing net to get ready for the game.";
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

      nextBtn.destroy();

      this.cards.forEach(card => {
        card.removeAllListeners('pointerdown');
        card.on('pointerdown', () => {
          if (card.texture.key === 'netIcon') {
            this.sound.stopAll();
            this.scene.start('scene5_RiverCut', data);
          } else {
            speak('Wrong, try again.');
          }
        });
      });
    }
  }
}
