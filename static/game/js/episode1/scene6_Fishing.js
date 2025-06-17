// static/game/js/episode1/scene6_Fishing.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';


export default class Scene6_Fishing extends Phaser.Scene {
  constructor() { super('scene6_Fishing'); }

  preload() {
    this.load.video('riverBg','/static/game/assets/video/riverbg.mp4','loadeddata',true,false);
    this.load.image('traveler1','/static/game/assets/traveler1.png');
    this.load.image('traveler2','/static/game/assets/traveler2.png');
    this.load.video('ravenVideo','/static/game/assets/video/raven_loop.webm','loadeddata',true,false);
    this.load.image('salmonShadow','/static/game/assets/salmon_shadow.png');
    this.load.image('salmonFish','/static/game/assets/salmonfish.png');
    this.load.image('net','/static/game/assets/net.png');
    this.load.audio('water','/static/game/assets/audio/water.mp3');
    this.load.audio('talukw','/static/game/assets/audio/salmon.m4a');
    this.load.audio('ravenaudio6','/static/game/assets/audio/ravenaudio (6).mp3');
    this.load.audio('birdcall','/static/game/assets/audio/bird_calls.mp3');
  }

  create(data) {


    this.sound.stopAll();
    installBubbleHelper(this);
    this.sound.play('birdcall',{loop:true,volume:0.6});


    // Background video
    const bg=this.add.video(0,0,'riverBg').setOrigin(0);
    bg.on('play',()=>bg.setDisplaySize(this.cameras.main.width,this.cameras.main.height));
    bg.play(true).setMute(true);
    this.sound.play('water',{loop:true,volume:0.3});

    // Traveler enters
    const key=data.characterKey||'traveler1';
    this.traveler=this.add.sprite(300,300,key).setScale(0.6).setAlpha(0);
    this.tweens.add({targets:this.traveler,alpha:1,duration:800});

    // Raven enters
    this.raven=this.add.video(700,150,'ravenVideo').setScale(0.5).setAlpha(0);
    this.tweens.add({
      targets:this.raven,alpha:1,y:200,ease:'Power1',duration:1000,
      onComplete:()=>this.raven.play(true)
    });

    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress',RewardManager.instance.sceneProgress);

    // Net drag setup
    speak("Use your net to catch talukw. Ready?");
    this.time.delayedCall(1000,()=>{
      speak("Let’s go!");
      this.showBubbleDialogue("Traveler","Let’s go!",{x:100,y:230},2000);
    });

    const cx=this.cameras.main.centerX, by=this.cameras.main.height-50;
    this.net=this.add.image(cx,by,'net').setScale(0.4).setInteractive({useHandCursor:true}).setDepth(10);
    this.input.setDraggable(this.net);
    this.input.on('drag',(_,o,x,y)=>{
      const minY=this.cameras.main.height*0.75, maxY=this.cameras.main.height-20;
      o.x=Phaser.Math.Clamp(x,50,this.cameras.main.width-50);
      o.y=Phaser.Math.Clamp(y,minY,maxY);
    });

    // Fish spawn
    this.fishGroup=[]; this.fishCaught=0; this.nextFishOffset=0;
    const eW=this.cameras.main.width*0.3, eH=this.cameras.main.height*0.15;
    const eX=this.cameras.main.width*0.75,eY=this.cameras.main.height*0.75;
    const path=new Phaser.Curves.Ellipse(eX,eY,eW,eH);
    for(let i=0;i<3;i++){
      const f=this.add.follower(path,eX+eW,eY,'salmonShadow')
        .setScale(0.25).setDepth(5)
        .startFollow({duration:5000,repeat:-1,ease:'Sine.easeInOut',delay:i*1500});
      f.setVisible(false);
      this.fishGroup.push(f);
    }

    this.input.on('dragend',(_,o)=>{
      if(o===this.net) this.attemptCatch();
    });
  }

  attemptCatch() {
    const b=this.net.getBounds();
    const idx=this.fishGroup.findIndex(f=>Phaser.Geom.Intersects.RectangleToRectangle(b,f.getBounds()));
    if(idx<0) return;
    const c=this.fishGroup.splice(idx,1)[0];
    this.time.delayedCall(100,()=>{
      speak("I caught one!");
      this.showBubbleDialogue("Traveler","I caught one!",{x:50,y:200},2000);
    });
    this.time.delayedCall(1200,()=>{
      RewardManager.instance.awardStar(1);
      RewardManager.instance.addJournalEntry({word:'talukw',meaning:'salmon',imgKey:'salmonFish',audioKey:'talukw'});
      this.events.emit('updateStars',RewardManager.instance.stars);
    });
    const y=this.cameras.main.centerY+this.nextFishOffset*40;
    this.add.image(100,y,'salmonFish').setScale(0.2).setDepth(10);
    this.nextFishOffset++; this.fishCaught++;

    if(this.fishCaught===3){
      this.sound.stopAll();
      const rLine=this.sound.add('ravenaudio6',{volume:3.0});
      rLine.play();
      this.showBubbleDialogue(
            "Raven",
            "Great, we have done so many things today, Now let's cook dinner",
            { x: 550, y: 150 },
            6000
        );
      rLine.once('complete',()=>this.scene.start('scene7_Map',this._transitionData));
    }
  }
}
