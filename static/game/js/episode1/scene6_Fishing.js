// static/game/js/episode1/scene6_Fishing.js

import { speak, initVoices }      from '../common/SpeechUtils.js';
import RewardManager              from '../common/RewardManager.js';
import { installBubbleHelper }    from '../common/DialogueHelper.js';

export default class Scene6_Fishing extends Phaser.Scene {
  constructor() { super('scene6_Fishing'); }

  preload() {
    this.load.video('riverBg',      '/static/game/assets/video/riverbg.mp4',    'loadeddata', true, false);
    this.load.image('traveler1',    '/static/game/assets/traveler1.png');
    this.load.image('traveler2',    '/static/game/assets/traveler2.png');
    this.load.video('ravenVideo',   '/static/game/assets/video/raven_loop.webm','loadeddata', true, false);
    this.load.image('salmonShadow', '/static/game/assets/salmon_shadow.png');
    this.load.image('salmonFish',   '/static/game/assets/salmonfish.png');
    this.load.image('net',          '/static/game/assets/net.png');
    this.load.audio('water',        '/static/game/assets/audio/water.mp3');
    this.load.audio('talukw',       '/static/game/assets/audio/salmon.m4a');
    this.load.audio('ravenaudio6',  '/static/game/assets/audio/ravenaudio (6).mp3');
    this.load.audio('birdcall',     '/static/game/assets/audio/bird_calls.mp3');
  }

  create(data) {
    // Setup TTS & dialogue helper
    initVoices();
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    installBubbleHelper(this);

    // Background video & water
    const bg = this.add.video(0, 0, 'riverBg').setOrigin(0);
    bg.on('play', () => bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height));
    bg.play(true).setMute(true);
    this.sound.play('water', { loop: true, volume: 0.3 });

    // Traveler & Raven
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(300, 300, key)
      .setScale(0.6)
      .setAlpha(0);
    this.tweens.add({ targets: this.traveler, alpha: 1, duration: 800 });

    this.raven = this.add.video(700, 150, 'ravenVideo')
      .setScale(0.5)
      .setAlpha(0);
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y: 200,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => this.raven.play(true)
    });

    // Progress
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Robot instruction at top center
    const instruction = "Now let's play the fishing game using the fishing net you see on the screen. Drag it over the river and release to catch fish.";
    speak(instruction);
    this.add.text(
      this.cameras.main.centerX,
      80,
      instruction,
      {
        font: '24px serif',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: 800 }
      }
    ).setOrigin(0.5);

    // Net drag setup (left bottom)
    const netX = 100;
    const netY = this.cameras.main.height - 50;
    this.net = this.add.image(netX, netY, 'net')
      .setScale(0.3)             // reduced size
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    this.input.setDraggable(this.net);
    this.input.on('drag', (_, o, x, y) => {
      const minY = this.cameras.main.height * 0.75;
      o.x = Phaser.Math.Clamp(x, 50, this.cameras.main.width - 50);
      o.y = Phaser.Math.Clamp(y, minY, this.cameras.main.height - 20);
    });

    // Fish spawn
    this.fishGroup = [];
    this.fishCaught = 0;
    this.nextFishOffset = 0;
    const path = new Phaser.Curves.Ellipse(
      this.cameras.main.width * 0.75,
      this.cameras.main.height * 0.75,
      this.cameras.main.width * 0.3,
      this.cameras.main.height * 0.15
    );
    for (let i = 0; i < 3; i++) {
      const start = path.getStartPoint();
      const f = this.add.follower(path, start.x, start.y, 'salmonShadow')
        .setScale(0.25)
        .setDepth(5)
        .startFollow({ duration: 5000, repeat: -1, ease: 'Sine.easeInOut', delay: i * 1500 });
      f.setVisible(false);
      this.fishGroup.push(f);
    }

    // Catch logic
    this.input.on('dragend', (_, o) => {
      if (o === this.net) this.attemptCatch(data);
    });

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

    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }
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

  attemptCatch(data) {
    const bounds = this.net.getBounds();
    const fishIndex = this.fishGroup.findIndex(f =>
      Phaser.Geom.Intersects.RectangleToRectangle(bounds, f.getBounds())
    );
    if (fishIndex < 0) return;

    // Remove caught fish
    this.fishGroup.splice(fishIndex, 1)[0];

    // Robot says “You got the fish!” at top center
    this.time.delayedCall(100, () => {
      const msg = "You got the fish!";
      speak(msg);
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        msg,
        {
          font: '24px serif',
          fill: '#ffffff',
          align: 'center',
          wordWrap: { width: 800 }
        }
      ).setOrigin(0.5);
    });

    // Award star & journal entry
    this.time.delayedCall(1200, () => {
      RewardManager.instance.awardStar(1);
      RewardManager.instance.addJournalEntry({
        word:   'talukw',
        meaning:'salmon',
        imgKey: 'salmonFish',
        audioKey:'talukw'
      });
      this.game.events.emit('updateStars', RewardManager.instance.stars);
    });

    // Display caught fish in UI
    const y = this.cameras.main.centerY + this.nextFishOffset * 40;
    this.add.image(100, y, 'salmonFish').setScale(0.2).setDepth(10);
    this.nextFishOffset++;
    this.fishCaught++;

    // After all caught, continue
    if (this.fishCaught === 3) {
      this.sound.stopAll();
      const rLine = this.sound.add('ravenaudio6', { volume: 3.0 });
      rLine.play();
      this.showBubbleDialogue(
        "Raven",
        "Great, time to cook dinner!",
        { x: 550, y: 150 },
        6000
      );
      rLine.once('complete', () => this.scene.start('scene7_Map', data));
    }
  }
}
