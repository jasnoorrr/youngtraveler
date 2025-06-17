// static/game/js/episode1/scene8_Feast.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';
import { installBubbleHelper } from '../common/DialogueHelper.js';

export default class Scene8_Feast extends Phaser.Scene {
  constructor() { super('scene8_Feast'); }

  preload() {
    this.load.image('traveler1','/static/game/assets/traveler1.png');
    this.load.image('traveler2','/static/game/assets/traveler2.png');
    this.load.image('feastBg',   '/static/game/assets/feast_bg.png');
    this.load.image('berry',     '/static/game/assets/berry.png');
    this.load.image('salmonFish','/static/game/assets/salmonfish.png');
    this.load.video('ravenVideo','/static/game/assets/video/raven_loop.webm','loadeddata',true,false);
    this.load.audio('hakał',     '/static/game/assets/audio/hakal.mp3');
    this.load.audio('tsaa',      '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('talukw',    '/static/game/assets/audio/salmon.m4a');
  }

  create(data) {
    this.sound.stopAll();
    // 1) Install the bubble helper
    installBubbleHelper(this);

    // 2) Progress tracker
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 3) Background
    this.add.image(500,300,'feastBg').setDisplaySize(1000,600);

    // 4) Traveler fades in
    const key = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(300,280,key).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: this.traveler, alpha: 1, duration: 800 });

    // 5) Raven appears a bit lower
    this.raven = this.add.video(700,250,'ravenVideo').setScale(0.45).setAlpha(0);
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y: 200,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        this.raven.play(true);
      }
    });

    // 6) Narrator line (no bubble)
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

    // 7) Draw bubble zone
    const cx = this.cameras.main.centerX, bubbleY = 100, r = 100;
    this.add.circle(cx, bubbleY, r, 0xffffff, 0.3)
      .setStrokeStyle(2, 0xccccff, 0.6);

    // 8) Prepare counts
    this.berryCount = 0;
    this.salmonCount = 0;

    // 9) Create draggable berries
    [-60, 0, 60].forEach(dx => {
      const b = this.add.image(cx + dx, bubbleY - 20, 'berry')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'berry');
      this.input.setDraggable(b);
    });

    // 10) Create draggable salmon
    [-60, 0, 60].forEach(dx => {
      const s = this.add.image(cx + dx, bubbleY + 40, 'salmonFish')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'salmon');
      this.input.setDraggable(s);
    });

    // 11) Drag logic
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
          this.events.emit('updateStars', RewardManager.instance.stars);
        } else {
          this.salmonCount++;
          RewardManager.instance.awardStar(1);
          RewardManager.instance.addJournalEntry({
            word:   'talukw',
            meaning:'salmon',
            imgKey: 'salmonFish',
            audioKey:'talukw'
          });
          this.events.emit('updateStars', RewardManager.instance.stars);
        }

        // 12) Once all are placed, chain character bubbles
        if (this.berryCount === 3 && this.salmonCount === 3) {
          // Raven says “Hakał!”
          speak("Hakał!");
          this.showBubbleDialogue("Raven", "Hakał!", { x: 700, y: 200 }, 2000);

          // Traveler thanks
          this.time.delayedCall(2000, () => {
            speak("It was a delicious meal! Thanks a lot!");
            this.showBubbleDialogue(
              "Traveler",
              "It was a delicious meal! Thanks a lot!",
              { x: 200, y: 260 },
              3000
            );
          });

          // Raven recaps
          this.time.delayedCall(5000, () => {
            speak("And I also learned a lot! Tsaa, t’enäh, bäts, talukw, usjooh, Whundzahbun.");
            this.showBubbleDialogue(
              "Raven",
              "And I also learned a lot! Tsaa, t’enäh, bäts, talukw, usjooh, Whundzahbun.",
              { x: 700, y: 200 },
              4000
            );
          });

          // Traveler closes
          this.time.delayedCall(9000, () => {
            speak("Ready for the next adventure?");
            this.showBubbleDialogue(
              "Traveler",
              "Ready for the next adventure?",
              { x: 200, y: 260 },
              3000
            );
          });

          // Finally transition
          this.time.delayedCall(12000, () => {
            this.scene.start('scene9_Outro', data);
          });
        }
      } else {
        // Snap back if outside
        img.x = Phaser.Math.Clamp(img.x, cx - r + 20, cx + r - 20);
        img.y = img.getData('type') === 'berry' ? bubbleY - 20 : bubbleY + 40;
      }
    });
  }
}
