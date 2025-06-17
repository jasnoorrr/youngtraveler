// static/game/js/episode1/scene1_Dawn.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';


export default class Scene1_Dawn extends Phaser.Scene {
  constructor() {
    super('scene1_Dawn');
  }

  preload() {
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.video('ravenVideo','/static/game/assets/video/raven_right.webm','loadeddata', true, false);
    this.load.audio('birdcall',    '/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio1', '/static/game/assets/audio/ravenaudio (1).mp3');
  }

  create(data) {
    // 🎈 Dialogue bubble helper
    this.showBubbleDialogue = (speaker, text, pos, durationOverride=null) => {
      if (this.dialogueGroup) this.dialogueGroup.destroy(true);
      if (this.dialogueTimer) this.dialogueTimer.remove(false);
      const w=300,h=80,p=10;
      const g=this.add.graphics();
      g.fillStyle(0x000000,0.8);
      g.fillRoundedRect(0,0,w,h,15);
      g.fillTriangle(w/2-10,h,w/2+10,h,w/2,h+15);
      const t=this.add.text(p,p,`${speaker}:\n${text}`,{font:'18px serif',color:'#fff',wordWrap:{width:w-2*p}});
      this.dialogueGroup=this.add.container(pos.x,pos.y,[g,t]).setDepth(100);
      const dur=durationOverride ?? (1000+text.length*50);
      this.dialogueTimer=this.time.delayedCall(dur,()=>{ this.dialogueGroup?.destroy(true); });
    };

    // Ambient
    this.sound.stopAll();
    this.sound.play('birdcall',{loop:true,volume:0.6});
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // Robot intro TTS + on-screen text (no bubble for Robot)
    const intro = "Welcome, young traveler! Today we journey along the ancient trails of our people. Let’s learn and explore together.";
    speak(intro);
    this.add.text(this.cameras.main.centerX,100,intro,{
      font:'28px serif',align:'center',wordWrap:{width:800}
    }).setOrigin(0.5);

    // After 10s: show traveler & raven
    this.time.delayedCall(8000, () => {
      const key = data?.characterKey || 'traveler1';
      this.traveler=this.add.sprite(200,280,key).setScale(0.6).setAlpha(0);
      this.tweens.add({targets:this.traveler,alpha:1,duration:800});

      this.raven=this.add.video(750,300,'ravenVideo').setScale(0.5).setAlpha(0);
      this.tweens.add({
        targets:this.raven,alpha:1,y:350,duration:1000,ease:'Power1',
        onComplete:()=>{
          this.raven.play(true);
          this.sound.play('ravenaudio1',{volume:4.0});
          // bubble for Raven, match audio (~4s)
          this.showBubbleDialogue("Raven","Hi traveler! I'm your animal guide.",{x:550,y:150},7000);
        }
      });

      // Transition
      this.time.delayedCall(9000,()=>this.scene.start('scene2_Intro',data));
    });
  }
}
