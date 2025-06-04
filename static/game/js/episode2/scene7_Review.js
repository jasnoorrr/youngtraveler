// static/game/js/episode2/scene7_Review.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';

export default class Scene7_Review extends Phaser.Scene {
  constructor() {
    super('scene7_Review');
  }

  preload() {
    // Traveler & Raven
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');

    // Spinning headband (pre-rendered sprite sheet)
    this.load.spritesheet('headbandSpin', '/static/game/assets/episode2/headband_spin.png', {
      frameWidth: 400,
      frameHeight: 400
    });

    // Confetti overlay (particle image)
    this.load.image('confetti', '/static/game/assets/episode2/confetti_particle.png');

    // Dakelh audio summarization
    this.load.audio('robotreview2','/static/game/assets/audio/ep2_robot_review.mp3');
    this.load.audio('ravenaudio9_2','/static/game/assets/audio/ep2_ravenaudio9.mp3');
    this.load.audio('travelerReview','/static/game/assets/audio/ep2_traveler_review.mp3');
    this.load.audio('robotnext3','/static/game/assets/audio/ep2_robot_next3.mp3');
  }

  create(data) {
    console.log("scene7_Review create() called");
    this.cameras.main.setBackgroundColor('#ffffff');
    this.sound.stopAll();
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 1) Background: spinning headband in centre
    this.anims.create({
      key: 'spin',
      frames: this.anims.generateFrameNumbers('headbandSpin', { start: 0, end: 23 }),
      frameRate: 12,
      repeat: -1
    });
    this.headband = this.add.sprite(500, 300, 'headbandSpin').setScale(0.8);
    this.headband.play('spin');

    // 2) Confetti particles falling
    const particles = this.add.particles('confetti');
    particles.createEmitter({
      x: { min: 0, max: 1000 },
      y: 0,
      lifespan: 4000,
      speedY: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0.1 },
      quantity: 5,
      blendMode: 'ADD'
    });

    // 3) Traveler & Raven
    const travelerKey = data?.characterKey || 'traveler1';
    this.traveler = this.add.sprite(150, 450, travelerKey).setScale(0.6);
    this.raven    = this.add.image(850, 150, 'raven').setScale(0.45);

    // 4) Robot summarization (pre-recorded or TTS)
    if (this.sound.get('robotreview2')) {
      this.sound.play('robotreview2', { volume: 1.2 });
    } else {
      speak(
        "Today you learned: Lhudah (1), Nada (2), Tada (3), Dida (4), Skwunlada (5). "
        + "You gathered indak, wove a headband, matched numbers, and added flowers!"
      );
    }

    // 5) Raven “Fantastic job, ‘X’!” after 3 s
    this.time.delayedCall(3000, () => {
      this.sound.play('ravenaudio9_2', { volume: 2.0 });
      this.time.delayedCall(2000, () => {
        // Traveler “Dakelh counting is fun—lhudah, nada, tada, dida, skwunlada!”
        if (this.sound.get('travelerReview')) {
          this.sound.play('travelerReview');
        } else {
          speak("Dakelh counting is fun—lhudah, nada, tada, dida, skwunlada!");
        }
        this.time.delayedCall(2000, () => {
          // Robot “Ready for the next adventure?”
          if (this.sound.get('robotnext3')) {
            this.sound.play('robotnext3');
          } else {
            speak("Ready for the next adventure?");
          }

          // After Robot’s line, show buttons
          this.time.delayedCall(2000, () => {
            const style = { font: '24px serif', backgroundColor: '#4a90e2', color: '#ffffff', padding: 10 };

            // ▶ Next Episode
            this.add.text(300, 550, '▶ Next Episode', style)
              .setInteractive({ useHandCursor: true })
              .on('pointerdown', () => {
                // Replace with actual next-episode URL or scene
                window.location.href = `/episodes/3/?username=${data.username}&character=${data.characterKey}`;
              });

            // 🔄 Replay (back to Scene 1 of Episode 2)
            this.add.text(500, 550, '🔄 Replay', style)
              .setInteractive({ useHandCursor: true })
              .on('pointerdown', () => {
                this.scene.start('scene1_Meadow', data);
              });

            // 📚 Review (back to Scene 2)
            this.add.text(700, 550, '📚 Review', style)
              .setInteractive({ useHandCursor: true })
              .on('pointerdown', () => {
                this.scene.start('scene2_VocabNumbers', data);
              });
          });
        });
      });
    });
  }
}
