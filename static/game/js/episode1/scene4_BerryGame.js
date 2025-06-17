// static/game/js/episode1/scene4_BerryGame.js

import { speak }     from '../common/SpeechUtils.js';
import RewardManager from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';


export default class Scene4_BerryGame extends Phaser.Scene {
  constructor() { super('scene4_BerryGame'); }

  preload() {
    this.load.image('traveler1','/static/game/assets/traveler1.png');
    this.load.image('traveler2','/static/game/assets/traveler2.png');
    this.load.image('berry','/static/game/assets/berry.png');
    this.load.image('basket','/static/game/assets/basket.png');
    this.load.audio('birdcall','/static/game/assets/audio/bird_calls.mp3');
    this.load.audio('ravenaudio3','/static/game/assets/audio/ravenaudio (3).mp3');
    this.load.audio('ravenaudio4','/static/game/assets/audio/ravenaudio (4).mp3');
    this.load.video('ravenVideo','/static/game/assets/video/raven_right.webm','loadeddata',true,false);
  }

  create(data) {


    this.sound.play('birdcall',{loop:true,volume:0.6});
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress',RewardManager.instance.sceneProgress);
    installBubbleHelper(this);

    // Traveler
    const key=data.characterKey||'traveler1';
    this.traveler=this.add.sprite(360,300,key).setScale(0.6).setAlpha(0);
    this.tweens.add({targets:this.traveler,alpha:1,duration:800});

    // Raven
    this.raven=this.add.video(700,300,'ravenVideo').setScale(0.6).setAlpha(0);
    this.tweens.add({
      targets:this.raven,alpha:1,y:250,duration:1000,ease:'Power1',
      onComplete:()=>{
        this.raven.play(true);
      }
    });

    // Instruction (no bubble)
    const intro = "Drag each Tsulcho in the basket.";
    speak(intro);
    this.add.text(this.cameras.main.centerX,100,intro,{
      font:'28px serif',align:'center',wordWrap:{width:800}
    }).setOrigin(0.5);

    // Basket zone
    this.basket=this.add.image(500,450,'basket').setInteractive({dropZone:true}).setScale(0.4);
    this.collected=0;

    // Berries only on “bush zone” (y 350–450)
    for(let i=0;i<5;i++){
      const x=Phaser.Math.Between(200,800), y=Phaser.Math.Between(350,450);
      const b=this.add.image(x,y,'berry').setScale(0.1).setInteractive({useHandCursor:true});
      this.input.setDraggable(b);
    }

    this.input
      .on('dragstart',(_,img)=>img.setScale(0.12))
      .on('drag',(_,img,x,y)=>img.setPosition(x,y))
      .on('drop',(_,img)=>{
        if(this.collected===0){
          this.sound.play('ravenaudio3',{volume:3.0});
          this.showBubbleDialogue(
            "Raven",
            "Yay!.",
            { x: 400, y: 100 },
            3000
        );
        }
        this.collected++;
        RewardManager.instance.awardStar(1);
        RewardManager.instance.addJournalEntry({word:'tsaa',meaning:'berry',imgKey:'berry',audioKey:'tsaa'});
        this.events.emit('updateStars',RewardManager.instance.stars);

        if(this.collected===5){
          this.sound.play('ravenaudio4',{volume:3.0});
          this.showBubbleDialogue("Raven","Great job!",{x:700,y:100},2000);
          this.time.delayedCall(3000,()=>{
            speak("Excellent! Now let’s follow the river and learn about salmon.");
            this.time.delayedCall(6000,()=>this.scene.start('scene5_RiverCut',data));
          });
        }
      })
      .on('dragend',(_,img)=>img.setScale(0.1));
  }
}
