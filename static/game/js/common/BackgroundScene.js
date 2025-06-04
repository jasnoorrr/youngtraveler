// static/game/js/BackgroundScene.js
export default class BackgroundScene extends Phaser.Scene {
  constructor() { super('BackgroundScene'); }

  preload() {
    // Load the forest once
    this.load.image('forestBg', '/static/game/assets/forest_bg.png');
  }

  create() {
    // Draw it at the very back (depth −1 ensures everything else sits on top)
    this.add.image(500, 300, 'forestBg').setDepth(1);
  }
}
