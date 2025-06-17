// static/game/js/common/UIScene.js

console.log("UIScene.js loaded");

import { speak }     from './SpeechUtils.js';
import RewardManager from './RewardManager.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Listen for progress & badges
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
      // 1) reset scene counter
      RewardManager.instance.sceneProgress = 0;
      this.game.events.emit('updateProgress', 0);

      // 2) stop all scenes
      [
        'scene1_Dawn','scene2_Intro','scene3_Vocab','scene4_BerryGame',
        'scene4b_FishVocab','scene5_RiverCut','scene6_Fishing',
        'scene7_Map','scene8_Feast','scene9_Outro',
        'scene1_Meadow','scene2_VocabNumbers','scene3_FlowerGather',
        'scene4_WeaveHeadband','scene5_NumberWordMatch',
        'scene6_SimpleAddition','scene7_Review'
      ].forEach(key => this.scene.stop(key));

      // 3) launch ep1 scene 1
      this.scene.launch('scene1_Dawn', { characterKey: window.CHARACTER_KEY || null });
    });

    // Progress tracker (start out of 10)
    this.progressText = this.add.text(900, 20, 'Scene: 0/10', {
      font: '18px Arial',
      color: '#ffffff'
    });
  }  // end create()

  onProgressUpdate(n) {
    const ep = parseInt(window.EPISODE, 10) === 2 ? 2 : 1;
    if (ep === 1) {
      this.progressText.setText(`Scene: ${n}/10`);
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
