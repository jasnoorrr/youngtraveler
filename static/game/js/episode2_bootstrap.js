// static/game/js/episode2_bootstrap.js
console.log("episode2_bootstrap.js loaded");

// Phaser is a global from the CDN
import { initVoices }   from './common/SpeechUtils.js';
import BackgroundScene  from './common/BackgroundScene.js';
import UIScene          from './common/UIScene.js';
import JournalScene     from './common/JournalScene.js';

// ── Episode 2 scenes ─────────────────────────────────────────────────
import Scene1_Meadow         from './episode2/scene1_Meadow.js';
import Scene2_VocabNumbers   from './episode2/scene2_VocabNumbers.js';
import Scene3_FlowerGather   from './episode2/scene3_FlowerGather.js';
import Scene4_WeaveHeadband  from './episode2/scene4_WeaveHeadband.js';
import Scene5_NumberWordMatch from './episode2/scene5_NumberWordMatch.js';
import Scene6_SimpleAddition  from './episode2/scene6_SimpleAddition.js';
import Scene7_Review          from './episode2/scene7_Review.js';

initVoices();

const config = {
  type: window.Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: 'game-container',
  scale: {
    mode: window.Phaser.Scale.FIT,
    autoCenter: window.Phaser.Scale.CENTER_BOTH
  },
  audio: { disableWebAudio: false },
  scene: [
    BackgroundScene,
    Scene1_Meadow,
    Scene2_VocabNumbers,
    Scene3_FlowerGather,
    Scene4_WeaveHeadband,
    Scene5_NumberWordMatch,
    Scene6_SimpleAddition,
    Scene7_Review,
    UIScene,
    JournalScene
  ]
};

window.game = new window.Phaser.Game(config);

document.addEventListener('DOMContentLoaded', () => {
  const charKey = window.CHARACTER_KEY || null;
  console.log("episode2_bootstrap → CHARACTER_KEY =", charKey);

  window.game.scene.start('BackgroundScene');
  window.game.scene.start('UIScene');

  console.log("episode2_bootstrap → launching scene1_Meadow");
  window.game.scene.start('scene1_Meadow', { characterKey: charKey });
});
