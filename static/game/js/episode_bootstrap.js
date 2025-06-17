
console.log("episode_bootstrap.js loaded");

import { initVoices }   from './common/SpeechUtils.js';
import RewardManager    from './common/RewardManager.js';
import BackgroundScene  from './common/BackgroundScene.js';
import UIScene          from './common/UIScene.js';
import JournalScene     from './common/JournalScene.js';

// ── Episode 1 scenes ────────────────────────────────────────────────────────
import Scene1_Dawn       from './episode1/scene1_Dawn.js';
import Scene2_Intro      from './episode1/scene2_Intro.js';
import Scene3_Vocab      from './episode1/scene3_Vocab.js';
import Scene4_BerryGame  from './episode1/scene4_BerryGame.js';
import Scene4b_FishVocab from './episode1/scene4b_FishVocab.js';
import Scene5_RiverCut   from './episode1/scene5_RiverCut.js';
import Scene6_Fishing    from './episode1/scene6_Fishing.js';
import Scene7_Map        from './episode1/scene7_Map.js';
import Scene8_Feast      from './episode1/scene8_Feast.js';
import Scene9_Outro      from './episode1/scene9_Outro.js';

// ── Episode 2 scenes ────────────────────────────────────────────────────────
import Scene1_Meadow         from './episode2/scene1_Meadow.js';
import Scene2_VocabNumbers   from './episode2/scene2_VocabNumbers.js';
import Scene3_FlowerGather   from './episode2/scene3_FlowerGather.js';
import Scene4_WeaveHeadband  from './episode2/scene4_WeaveHeadband.js';
import Scene5_NumberWordMatch from './episode2/scene5_NumberWordMatch.js';
import Scene6_SimpleAddition  from './episode2/scene6_SimpleAddition.js';
import Scene7_Review          from './episode2/scene7_Review.js';

initVoices();

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  audio: { disableWebAudio: false },
  scene: [
    BackgroundScene,

    // ── Episode 1 ─────────────────────────────────────────────────────────
    Scene1_Dawn,
    Scene2_Intro,
    Scene3_Vocab,
    Scene4_BerryGame,
    Scene4b_FishVocab,
    Scene5_RiverCut,
    Scene6_Fishing,
    Scene7_Map,
    Scene8_Feast,
    Scene9_Outro,

    // ── Episode 2 ─────────────────────────────────────────────────────────
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

window.game = new Phaser.Game(config);

// Wait until the DOM is fully parsed so EPISODE & CHARACTER_KEY exist
document.addEventListener('DOMContentLoaded', () => {
  const ep = parseInt(window.EPISODE, 10);
  console.log("bootstrap → parsed EPISODE =", ep);

  // Always start the background + UI overlay first
  window.game.scene.start('BackgroundScene');
  window.game.scene.start('UIScene');

  if (ep === 2) {
    // If someone requested Episode 2, stop all Episode 1 scenes
    [
      'scene1_Dawn',
      'scene2_Intro',
      'scene3_Vocab',
      'scene4_BerryGame',
      'scene4b_FishVocab',
      'scene5_RiverCut',
      'scene6_Fishing',
      'scene7_Map',
      'scene8_Feast',
      'scene9_Outro'
    ].forEach(key => window.game.scene.stop(key));

    console.log("bootstrap → launching Episode 2 → scene1_Meadow");
    window.game.scene.start('scene1_Meadow', { characterKey: CHARACTER_KEY });
  } else {
    // For Episode 1 (default), stop all Episode 2 scenes and start Ep 1
    [
      'scene1_Meadow',
      'scene2_VocabNumbers',
      'scene3_FlowerGather',
      'scene4_WeaveHeadband',
      'scene5_NumberWordMatch',
      'scene6_SimpleAddition',
      'scene7_Review'
    ].forEach(key => window.game.scene.stop(key));

    console.log("bootstrap → launching Episode 1 → scene1_Dawn");
    window.game.scene.start('scene1_Dawn', { characterKey: CHARACTER_KEY });
  }
});
