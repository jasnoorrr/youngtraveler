// static/game/js/episode1/scene2_Intro.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';


export default class Scene2_Intro extends Phaser.Scene {
  constructor() { super('scene2_Intro'); }

  preload() {
    this.load.image('traveler1','/static/game/assets/traveler1.png');
    this.load.image('traveler2','/static/game/assets/traveler2.png');
    this.load.video('ravenVideo','/static/game/assets/video/raven_right.webm','loadeddata',true,false);
    this.load.audio('birdcall','/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio2','/static/game/assets/audio/ravenaudio (2).mp3');
  }

  create(data) {
    // Bubble helper (same as Scene1)


    // Ambient + progress
    this.sound.stopAll();

    this.sound.play('birdcall',{loop:true,volume:0.6});
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress',RewardManager.instance.sceneProgress);
    installBubbleHelper(this);

    // Traveler fade-in
    const key=data.characterKey||'traveler1';
    this.traveler=this.add.sprite(350,300,key).setScale(0.6).setAlpha(0);
    this.tweens.add({targets:this.traveler,alpha:1,duration:800});

    // Raven video perch
    this.raven=this.add.video(750,270,'ravenVideo').setScale(0.45).setAlpha(0);
    this.tweens.add({
      targets:this.raven,alpha:1,y:360,duration:1000,ease:'Power1',
      onComplete:()=>{
        this.raven.play(true);
        this.sound.play('ravenaudio2',{volume:4.0});
        this.showBubbleDialogue(
            "Raven",
            "Great, for picking berries, we will go through bushes & need a basket.",
            { x: 550, y: 150 },
            7000
        );
      }
    });

    // After 8s → next scene
    this.time.delayedCall(10000,()=>this.scene.start('scene3_Vocab',data));
  }
}
