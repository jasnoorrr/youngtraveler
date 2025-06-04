// static/game/js/episode1/scene7_Map.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';

export default class Scene7_Map extends Phaser.Scene {
  constructor() {
    super('scene7_Map');
  }

  preload() {
    this.load.image('mapBg',    '/static/game/assets/mapbg.png');
    this.load.image('iconCamp', '/static/game/assets/iconCamp.png');
    this.load.image('iconRiver','/static/game/assets/iconRiver.png');
    this.load.image('iconLake', '/static/game/assets/iconLake.png');
    this.load.audio('camp',     '/static/game/assets/audio/camp.m4a');
    this.load.audio('river',    '/static/game/assets/audio/salmonriver.m4a');
    this.load.audio('lake',     '/static/game/assets/audio/lake.m4a');
    this.load.audio('birdcall', '/static/game/assets/audio/bird_calls.mp3');
  }

  create(data) {
    // 1) Stop any leftover sounds, then start birdcall loop
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });

    // 2) Advance progress to Scene 7/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Raven introduction
    speak("Here are places in our territory. Hover over each to hear its Dakelh name, and then we’ll go cook dinner.");

    // 4) Full-screen map background
    this.add.image(500, 300, 'mapBg').setDisplaySize(1000, 600);

    // 5) Define tappable points
    const points = [
      {
        key:     'iconCamp',
        x:       300,
        y:       350,
        audio:   'camp',
        word:    "Ts'ih-lah",
        meaning: 'Forest Camp'
      },
      {
        key:     'iconRiver',
        x:       500,
        y:       200,
        audio:   'river',
        word:    'Tsalakoh',
        meaning: 'Salmon River'
      },
      {
        key:     'iconLake',
        x:       700,
        y:       400,
        audio:   'lake',
        word:    'Whundzahbun',
        meaning: 'Lake'
      }
    ];

    points.forEach(pt => {
      const icon = this.add.image(pt.x, pt.y, pt.key)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true });

      // Use `once` so this block runs only the first time you hover
      icon.once('pointerover', () => {
        // 1) Play the Dakelh audio immediately
        this.sound.play(pt.audio);

        // 2) Raven voices the Dakelh word
        speak(pt.word);

        // 3) Award a star & add to journal
        RewardManager.instance.awardStar(1);
        RewardManager.instance.addJournalEntry({
          word:     pt.word,
          meaning:  pt.meaning,
          imgKey:   pt.key,
          audioKey: pt.audio
        });
        this.events.emit('updateStars', RewardManager.instance.stars);

        // 4) After 5 seconds, transition to Scene 8 (Feast)
        this.time.delayedCall(15000, () => {
          this.scene.start('scene8_Feast', data);
        });
      });
    });
  }
}
