// static/game/js/episode1/scene7_Map.js

import { speak }               from '../common/SpeechUtils.js';
import RewardManager           from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene7_Map extends Phaser.Scene {
  constructor() {
    super('scene7_Map');
  }

  preload() {
    this.load.image('mapBg',      '/static/game/assets/mapbg.png');
    this.load.image('berryIcon',  '/static/game/assets/berry.png');
    this.load.image('bushIcon',   '/static/game/assets/bush.png');
    this.load.image('basketIcon', '/static/game/assets/basket.png');
    this.load.image('salmonIcon', '/static/game/assets/salmonfish.png');
    this.load.image('riverIcon',  '/static/game/assets/iconRiver.png');
    this.load.image('netIcon',    '/static/game/assets/net.png');

    this.load.audio('birdcall',   '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('tsaa',       '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('tenah',      '/static/game/assets/audio/bush.m4a');
    this.load.audio('bats',       '/static/game/assets/audio/basket.mp3');
    this.load.audio('talukw',     '/static/game/assets/audio/salmon.m4a');
    this.load.audio('riverAudio', '/static/game/assets/audio/salmonriver.m4a');
    this.load.audio('fishingnet', '/static/game/assets/audio/fishingnet.m4a');

    this.load.video('ravenLeft',  '/static/game/assets/video/raven_left.webm',  'loadeddata', true, false);
    this.load.video('ravenRight', '/static/game/assets/video/raven_right.webm', 'loadeddata', true, false);
  }

  create(data) {
    // install dialogue helper
    installBubbleHelper(this);

    // ambient & progress
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // background map
    this.add.image(500, 300, 'mapBg').setDisplaySize(1000, 600);

    // raven flight loop
    const screenW = this.cameras.main.width;
    const flyY    = 110;
    this.raven = this.add.video(-100, flyY, 'ravenLeft').setScale(0.4);
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

    const intro = "Review all words: click any icon to hear its Dakelh name.";
    speak(intro);
    this.add.text(
      this.cameras.main.centerX,   // centered horizontally
      80,                           // a bit down from the top
      intro,
      {
        font: '24px serif',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: 800 }
      }
    ).setOrigin(0.5);

    // icons laid out evenly
    const items = [
      { key: 'berryIcon',  x: 250, y: 200, audio: 'tsaa',       word: 'Tsaa'      },
      { key: 'bushIcon',   x: 500, y: 200, audio: 'tenah',      word: "T’enäh"    },
      { key: 'basketIcon', x: 750, y: 200, audio: 'bats',       word: 'Bäts'      },
      { key: 'salmonIcon', x: 250, y: 400, audio: 'talukw',     word: 'Talukw'    },
      { key: 'riverIcon',  x: 500, y: 400, audio: 'riverAudio', word: 'Tsalakoh' },
      { key: 'netIcon',    x: 750, y: 400, audio: 'fishingnet', word: 'Lhombilh'  }
    ];

    items.forEach(pt => {
      const icon = this.add.image(pt.x, pt.y, pt.key)
        .setScale(0.3)
        .setInteractive({ useHandCursor: true });

      icon.on('pointerdown', () => {
        if (pt.audio) {
          this.sound.play(pt.audio, { volume: 1.0 });
        } else {
          speak(pt.word);
        }
        this.showBubbleDialogue("Raven", pt.word, { x: pt.x, y: pt.y - 60 }, 2000);
      });
    });

    // navigation buttons
    const navStyle = {
      font: '24px serif',
      backgroundColor: '#4a90e2',
      color: '#ffffff',
      padding: { x: 10, y: 6 }
    };
    const order = [
      'scene1_Dawn','scene2_Intro','scene3_Vocab','scene4_BerryGame','scene4b_FishVocab',
      'scene5_RiverCut','scene6_Fishing','scene7_Map','scene8_Feast','scene9_Outro'
    ];
    const idx = order.indexOf(this.sys.settings.key);

    // previous
    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }

    // next
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
  }
}
