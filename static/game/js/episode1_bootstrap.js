// static/game/js/episode1_bootstrap.js
console.log("episode1_bootstrap.js loaded");

// Phaser is already a global (we loaded it via CDN in play.html)
import { initVoices }   from './common/SpeechUtils.js';
import BackgroundScene  from './common/BackgroundScene.js';
import UIScene          from './common/UIScene.js';
import JournalScene     from './common/JournalScene.js';

// ── Episode 1 scenes ─────────────────────────────────────────────────
import Scene1_Dawn       from './episode1/scene1_Dawn.js';
import Scene2_Intro      from './episode1/scene2_Intro.js';
import Scene3_Vocab      from './episode1/scene3_Vocab.js';
import Scene4_BerryGame  from './episode1/scene4_BerryGame.js';
import Scene5_RiverCut   from './episode1/scene5_RiverCut.js';
import Scene6_Fishing    from './episode1/scene6_Fishing.js';
import Scene7_Map        from './episode1/scene7_Map.js';
import Scene8_Feast      from './episode1/scene8_Feast.js';
import Scene9_Outro      from './episode1/scene9_Outro.js';

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
    Scene1_Dawn,
    Scene2_Intro,
    Scene3_Vocab,
    Scene4_BerryGame,
    Scene5_RiverCut,
    Scene6_Fishing,
    Scene7_Map,
    Scene8_Feast,
    Scene9_Outro,
    UIScene,
    JournalScene
  ]
};

window.game = new window.Phaser.Game(config);

// As soon as the DOM is ready, launch Episode 1’s first scene:
document.addEventListener('DOMContentLoaded', () => {
  const charKey = window.CHARACTER_KEY || null;
  console.log("episode1_bootstrap → CHARACTER_KEY =", charKey);

  // Always start overlays first
  window.game.scene.start('BackgroundScene');
  window.game.scene.start('UIScene');

  // Then jump into Episode 1
  console.log("episode1_bootstrap → launching scene1_Dawn");
  window.game.scene.start('scene1_Dawn', { characterKey: charKey });
});
