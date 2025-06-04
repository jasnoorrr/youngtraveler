// static/game/js/common/UIScene.js

console.log("UIScene.js loaded");

import { speak }     from './SpeechUtils.js';
import RewardManager from './RewardManager.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Listen for updates from RewardManager
    this.game.events.on('updateStars',    this.onStarsUpdate,    this);
    this.game.events.on('updateProgress', this.onProgressUpdate, this);
    this.game.events.on('showBadge',      this.onShowBadge,      this);

    // “Restart Ep1” button
    const ep1Btn = this.add.text(20, 20, '← Restart Ep1', {
      font: '18px Arial',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: 6
    }).setInteractive({ useHandCursor: true });

    ep1Btn.on('pointerdown', () => {
      // Stop any Episode 1 & Episode 2 scenes (harmless if some aren’t loaded)
      [
        'scene1_Dawn',
        'scene2_Intro',
        'scene3_Vocab',
        'scene4_BerryGame',
        'scene5_RiverCut',
        'scene6_Fishing',
        'scene7_Map',
        'scene8_Feast',
        'scene9_Outro',
        'scene1_Meadow',
        'scene2_VocabNumbers',
        'scene3_FlowerGather',
        'scene4_WeaveHeadband',
        'scene5_NumberWordMatch',
        'scene6_SimpleAddition',
        'scene7_Review'
      ].forEach(key => this.scene.stop(key));

      // Launch Episode 1’s first scene
      this.scene.start('scene1_Dawn', { characterKey: window.CHARACTER_KEY || null });
    });

    // “Restart Ep2” button
    const ep2Btn = this.add.text(140, 20, '▶ Restart Ep2', {
      font: '18px Arial',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: 6
    }).setInteractive({ useHandCursor: true });

    ep2Btn.on('pointerdown', () => {
      // Stop any Episode 1 & Episode 2 scenes
      [
        'scene1_Dawn',
        'scene2_Intro',
        'scene3_Vocab',
        'scene4_BerryGame',
        'scene5_RiverCut',
        'scene6_Fishing',
        'scene7_Map',
        'scene8_Feast',
        'scene9_Outro',
        'scene1_Meadow',
        'scene2_VocabNumbers',
        'scene3_FlowerGather',
        'scene4_WeaveHeadband',
        'scene5_NumberWordMatch',
        'scene6_SimpleAddition',
        'scene7_Review'
      ].forEach(key => this.scene.stop(key));

      // Launch Episode 2’s first scene
      this.scene.start('scene1_Meadow', { characterKey: window.CHARACTER_KEY || null });
    });

    // Star counter
    this.starsText = this.add.text(800, 20, 'Stars: 0', {
      font: '18px Arial',
      color: '#ffffff'
    });

    // Progress tracker
    this.progressText = this.add.text(900, 20, 'Scene: 0/0', {
      font: '18px Arial',
      color: '#ffffff'
    });

    // Journal button
    this.add.text(970, 20, '📔', {
      font: '18px Arial',
      backgroundColor: '#00000080',
      padding: 6
    })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      this.scene.launch('JournalScene');
    });
  }

  onStarsUpdate(count) {
    this.starsText.setText(`Stars: ${count}`);
  }

  onProgressUpdate(n) {
    const ep = parseInt(window.EPISODE, 10) === 2 ? 2 : 1;
    if (ep === 1) {
      this.progressText.setText(`Scene: ${n}/9`);
    } else {
      this.progressText.setText(`Scene: ${n}/7`);
    }
  }

  onShowBadge(badgeKey) {
    const badgeImg = this.add.image(500, 300, `badge_${badgeKey}`)
      .setScale(0.5);
    this.tweens.add({
      targets: badgeImg,
      alpha:    { from: 1, to: 0 },
      delay:     2000,
      duration: 1000,
      onComplete: () => badgeImg.destroy()
    });
  }
}
