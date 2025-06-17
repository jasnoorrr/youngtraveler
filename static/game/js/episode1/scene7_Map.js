// static/game/js/episode1/scene7_Map.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene7_Map extends Phaser.Scene {
  constructor() {
    super('scene7_Map');
  }

  preload() {
    this.load.image('mapBg',     '/static/game/assets/mapbg.png');
    this.load.image('iconCamp',  '/static/game/assets/iconCamp.png');
    this.load.image('iconRiver', '/static/game/assets/iconRiver.png');
    this.load.image('iconLake',  '/static/game/assets/iconLake.png');

    this.load.audio('camp',      '/static/game/assets/audio/camp.m4a');
    this.load.audio('river',     '/static/game/assets/audio/salmonriver.m4a');
    this.load.audio('lake',      '/static/game/assets/audio/lake.m4a');
    this.load.audio('birdcall',  '/static/game/assets/audio/bird_calls.mp3');

    // Raven flying videos
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
    // 1) Install the shared bubble helper
    installBubbleHelper(this);

    // 2) Ambient & progress
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Background map
    this.add.image(500, 300, 'mapBg').setDisplaySize(1000, 600);

    // 4) Raven flight setup
    const screenW = this.cameras.main.width;
    const flyY    = 110;

    this.raven = this.add.video(-100, flyY, 'ravenLeft')
      .setScale(0.4)
      .setAlpha(1);
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
    flyRight(); // start the loop immediately

    // 5) Raven intro bubble
    const intro = "Here are places in our territory. Hover each icon to hear its Dakelh name.";
    speak(intro);
    this.showBubbleDialogue(
      "Raven",
      intro,
      { x: 200, y: 50 },
      6000
    );

    // 6) Define points with English labels
    const points = [
      { key: 'iconCamp',  x: 300, y: 350, audio: 'camp',  word: "Ts'ih-lah",    label: 'Forest Camp' },
      { key: 'iconRiver', x: 500, y: 200, audio: 'river', word: 'Tsalakoh',    label: 'Salmon River' },
      { key: 'iconLake',  x: 700, y: 400, audio: 'lake',  word: 'Whundzahbun', label: 'Lake' }
    ];

    // 7) Add icons, English labels, and hover behavior
    points.forEach(pt => {
      const icon = this.add.image(pt.x, pt.y, pt.key)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true });

      // English label below
      this.add.text(pt.x, pt.y + 80, pt.label, {
        font: '30px serif',
        color: '#ffffff'
      }).setOrigin(0.5);

      // On first hover: play the Dakelh audio, show Raven bubble, then advance after 3s
      icon.once('pointerover', () => {
        this.sound.play(pt.audio);
        speak(pt.word);
        this.showBubbleDialogue(
          "Raven",
          pt.word,
          { x: pt.x, y: pt.y - 20 },
          2000
        );
        this.time.delayedCall(6000, () => {
          this.scene.start('scene8_Feast', data);
        });
      });
    });
  }
}
