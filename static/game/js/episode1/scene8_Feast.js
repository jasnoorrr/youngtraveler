// static/game/js/episode1/scene8_Feast.js

import { speak }                  from '../common/SpeechUtils.js';
import RewardManager              from '../common/RewardManager.js';
import { installBubbleHelper }    from '../common/DialogueHelper.js';

export default class Scene8_Feast extends Phaser.Scene {
  constructor() { super('scene8_Feast'); }

  preload() {
    this.load.image('traveler1',   '/static/game/assets/traveler1.png');
    this.load.image('traveler2',   '/static/game/assets/traveler2.png');
    this.load.image('feastBg',     '/static/game/assets/feast_bg.png');
    this.load.image('berry',       '/static/game/assets/berry.png');
    this.load.image('salmonFish',  '/static/game/assets/salmonfish.png');
    this.load.video('ravenVideo',  '/static/game/assets/video/raven_loop.webm','loadeddata',true,false);
    this.load.audio('hakał',       '/static/game/assets/audio/hakal.mp3');
    this.load.audio('tsaa',        '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('talukw',      '/static/game/assets/audio/salmon.m4a');
  }

  create(data) {
    // stop any existing audio
    this.sound.stopAll();

    // install dialogue helper
    installBubbleHelper(this);

    // progress tracker
    RewardManager.instance.advanceScene();
    this.game.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // background
    this.add.image(500,300,'feastBg').setDisplaySize(1000,600);

    // traveler fades in
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(300,280,key).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets:this.traveler, alpha:1, duration:800 });

    // raven appears
    this.raven = this.add.video(700,250,'ravenVideo').setScale(0.45).setAlpha(0);
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y: 200,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => this.raven.play(true)
    });

    // narrator line
    const narratorLine = "Time for a feast! Drag your berries and salmon from above onto the platter.";
    speak(narratorLine);
    this.add.text(500, 580, narratorLine, {
      font: '24px serif',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 10, y: 6 },
      wordWrap: { width: 900 },
      align: 'center'
    }).setOrigin(0.5);

    // bubble zone
    const cx = this.cameras.main.centerX, bubbleY = 100, r = 100;
    this.add.circle(cx, bubbleY, r, 0xffffff, 0.3)
      .setStrokeStyle(2, 0xccccff, 0.6);

    // prepare counts
    this.berryCount = 0;
    this.salmonCount = 0;

    // create draggable berries
    [-60, 0, 60].forEach(dx => {
      const b = this.add.image(cx + dx, bubbleY - 20, 'berry')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'berry');
      this.input.setDraggable(b);
    });

    // create draggable salmon
    [-60, 0, 60].forEach(dx => {
      const s = this.add.image(cx + dx, bubbleY + 40, 'salmonFish')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'salmon');
      this.input.setDraggable(s);
    });

    // drag logic
    this.input.on('drag', (_, img, x, y) => {
      img.setPosition(x, y);
    });

    this.input.on('dragend', (_, img) => {
      const dx = img.x - 500, dy = img.y - 300;
      if (dx*dx + dy*dy < 300*300) {
        img.disableInteractive().setScale(0.1);
        const type = img.getData('type');
        if (type === 'berry') {
          this.berryCount++;
          RewardManager.instance.awardStar(1);
          RewardManager.instance.addJournalEntry({
            word:   'tsaa',
            meaning:'berry',
            imgKey: 'berry',
            audioKey:'tsaa'
          });
        } else {
          this.salmonCount++;
          RewardManager.instance.awardStar(1);
          RewardManager.instance.addJournalEntry({
            word:   'talukw',
            meaning:'salmon',
            imgKey: 'salmonFish',
            audioKey:'talukw'
          });
        }
        this.game.events.emit('updateStars', RewardManager.instance.stars);

        if (this.berryCount === 3 && this.salmonCount === 3) {
          // sequence of bubbles and speech
          speak("Hakał!");
          this.showBubbleDialogue("Raven", "Hakał!", { x:700, y:200 }, 2000);

          this.time.delayedCall(2000, () => {
            speak("It was a delicious meal! Thanks a lot!");
            this.showBubbleDialogue("Traveler", "It was a delicious meal! Thanks a lot!", { x:200, y:260 }, 3000);
          });

          this.time.delayedCall(5000, () => {
            speak("And I also learned a lot! Tsaa, t’enäh, bäts, talukw, usjooh, Whundzahbun.");
            this.showBubbleDialogue("Raven", "And I also learned a lot! Tsaa, t’enäh, bäts, talukw, usjooh, Whundzahbun.", { x:700, y:200 }, 4000);
          });

          this.time.delayedCall(9000, () => {
            speak("Ready for the next adventure?");
            this.showBubbleDialogue("Traveler", "Ready for the next adventure?", { x:200, y:260 }, 3000);
          });

          this.time.delayedCall(12000, () => {
            this.scene.start('scene9_Outro', data);
          });
        }
      } else {
        // snap back
        img.x = Phaser.Math.Clamp(img.x, cx - r + 20, cx + r - 20);
        img.y = img.getData('type') === 'berry' ? bubbleY - 20 : bubbleY + 40;
      }
    });

    // ─── NAVIGATION BUTTONS ────────────────────────────
    const navStyle = {
      font: '24px serif',
      backgroundColor: '#4a90e2',
      color: '#ffffff',
      padding: { x:10, y:6 }
    };
    const order = [
      'scene1_Dawn','scene2_Intro','scene3_Vocab','scene4_BerryGame','scene4b_FishVocab',
      'scene5_RiverCut','scene6_Fishing','scene7_Map','scene8_Feast','scene9_Outro'
    ];
    const idx = order.indexOf(this.sys.settings.key);

    // Previous (bottom-left)
    if (idx > 0) {
      this.add.text(20, this.cameras.main.height - 50, '← Previous', navStyle)
        .setInteractive({ useHandCursor:true })
        .on('pointerdown', () => {
          this.sound.stopAll();
          this.scene.start(order[idx - 1], data);
        });
    }
    // Next (bottom-right)
    if (idx < order.length - 1) {
      this.add.text(
        this.cameras.main.width - 20,
        this.cameras.main.height - 50,
        'Next →',
        navStyle
      )
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor:true })
      .on('pointerdown', () => {
        this.sound.stopAll();
        this.scene.start(order[idx + 1], data);
      });
    }
    // ───────────────────────────────────────────────────
  }
}
