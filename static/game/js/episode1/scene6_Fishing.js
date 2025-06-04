// static/game/js/episode1/scene6_Fishing.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';

export default class Scene6_Fishing extends Phaser.Scene {
  constructor() {
    super('scene6_Fishing');
  }

  preload() {
    // 1) River video background (must match your static file location exactly)
    this.load.video(
      'riverBg',
      '/static/game/assets/video/riverbg.mp4',
      'loadeddata',
      true,   // noAudio: we’ll play “water.mp3” instead
      false
    );
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');
    // 2) Fishing assets
    this.load.image('salmonShadow', '/static/game/assets/salmon_shadow.png');  // moving fish
    this.load.image('salmonFish',   '/static/game/assets/salmonfish.png');     // caught‐icon
    this.load.image('net',          '/static/game/assets/net.png');
    this.load.audio('talukw',       '/static/game/assets/audio/salmon.m4a');
    this.load.audio('water',        '/static/game/assets/audio/water.mp3');
    this.load.audio('ravenaudio6',  '/static/game/assets/audio/ravenaudio (6).mp3');
    this.load.audio('birdcall',     '/static/game/assets/audio/bird_calls.mp3');
  }

  create(data) {
    this._transitionData = data;

    // 1) Stop any leftover sounds (forest background, previous SFX, etc.)
    this.sound.stopAll();
    this.sound.play('birdcall', { loop: true, volume: 0.6 });
    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(0);                                                                  // start invisible

    // 4) Tween the traveler to fade in
    this.tweens.add({
      targets: this.traveler,
      alpha:   1,
      duration: 800
    });

    // 5) Add Raven (start off-screen or invisible)
    this.raven = this.add.image(700, 150, 'raven')   // adjust (x,y) to taste
      .setScale(0.45)
      .setAlpha(0);

    // 6) Tween Raven: fade in + (optionally) move to “perch” position
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y:     200,       // final “perch” y—tweak to suit your layout
      ease:  'Power1',
      duration: 1000
    });


    // 2) Advance progress to Scene 6/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Robot instruction
    speak("Use your net to catch talukw. Ready?");
    // Traveler “Let’s go!” after 1 second
    this.time.delayedCall(1000, () => {
      speak("Let’s go!");
    });

    // 4) Play background video full‐screen (mute the video itself)
    const vid = this.add.video(0, 0, 'riverBg').setOrigin(0);
    vid.on('play', () => {
      vid.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    });
    vid.play(true).setMute(true);

    // 5) Ambient water sound under the video
    this.sound.play('water', { loop: true, volume: 0.3 });

    // 6) Draggable net, constrained to lower 25% of the canvas
    const cx = this.cameras.main.centerX;
    const bottomY = this.cameras.main.height - 50;
    this.net = this.add.image(cx, bottomY, 'net')
      .setScale(0.4)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    this.input.setDraggable(this.net);
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject !== this.net) return;
      const minY = this.cameras.main.height * 0.75;
      const maxY = this.cameras.main.height - 20;
      gameObject.x = Phaser.Math.Clamp(dragX, 50, this.cameras.main.width - 50);
      gameObject.y = Phaser.Math.Clamp(dragY, minY, maxY);
    });

    // 7) Prepare left‐side display for caught‐fish icons
    this.fishGroup      = [];
    this.fishCaught     = 0;
    this.nextFishOffset = 0;
    this.catchBaseX     = 100;
    this.catchBaseY     = this.cameras.main.centerY;

    // 8) Ellipse path in bottom‐right for moving fish
    const ew = this.cameras.main.width * 0.30;
    const eh = this.cameras.main.height * 0.15;
    const ex = this.cameras.main.width * 0.75;
    const ey = this.cameras.main.height * 0.75;
    const path = new Phaser.Curves.Ellipse(ex, ey, ew, eh);

    // 9) Spawn 3 moving salmon shadows (VISIBLE now!)
    for (let i = 0; i < 3; i++) {
      const fish = this.add.follower(path, ex + ew, ey, 'salmonShadow')
        .setScale(0.25)
        .setDepth(5)
        .startFollow({
          duration: 5000,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: i * 1500
        });
      fish.setVisible(false);
      this.fishGroup.push(fish);
    }

    // 10) When the net drag ends, only then attempt to catch
    this.input.on('dragend', (pointer, gameObject) => {
      if (gameObject === this.net) {
        this.attemptCatch();
      }
    });
  }

  attemptCatch() {
    const netBounds = this.net.getBounds();

    // 1) Find the first fish overlapping the net’s bounding rect
    const idx = this.fishGroup.findIndex(fish =>
      Phaser.Geom.Intersects.RectangleToRectangle(netBounds, fish.getBounds())
    );
    if (idx === -1) {
      // No fish was in the net area
      return;
    }

    // 2) Remove & destroy that fish sprite
    const caughtFish = this.fishGroup.splice(idx, 1)[0];

    // 3) Traveler says “I caught one!” after 0.2s
    this.time.delayedCall(200, () => {
      speak("I caught one!");
    });

    // 4) Award star & add a journal entry after 1.2s
    this.time.delayedCall(1200, () => {
      RewardManager.instance.awardStar(1);
      RewardManager.instance.addJournalEntry({
        word:    'talukw',
        meaning: 'salmon',
        imgKey:  'salmonFish',
        audioKey:'talukw'
      });
      this.events.emit('updateStars', RewardManager.instance.stars);
    });

    // 5) Place caught‐fish icon immediately
    const iconY = this.catchBaseY + this.nextFishOffset * 40;
    this.add.image(this.catchBaseX, iconY, 'salmonFish')
      .setScale(0.2)
      .setDepth(10);
    this.nextFishOffset++;
    this.fishCaught++;

    // 6) Once all three are caught, play Raven’s audio once and transition on its completion
    if (this.fishCaught === 3) {
      // Stop the birdcall and water loops so Raven’s line is clear
      this.sound.stopAll();

      // Play Raven’s line one time
      const ravenLine = this.sound.add('ravenaudio6', { volume: 2.0 });
      ravenLine.play();

      // When the ravenaudio6 track finishes, move to scene7_Map
      ravenLine.once('complete', () => {
        this.scene.start('scene7_Map', this._transitionData);
      });
    }
  }
}
